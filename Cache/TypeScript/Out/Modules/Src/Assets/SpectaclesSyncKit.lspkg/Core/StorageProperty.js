"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quatSlerp = exports.packedTransformLerp = exports.vec4Lerp = exports.vec3Lerp = exports.vec2Lerp = exports.lerp = exports.computeInnerQuadrangleQuaternion = exports.vec4Tangent = exports.vec3Tangent = exports.vec2Tangent = exports.tangent = exports.squad = exports.vec4CubicInterpolate = exports.vec3CubicInterpolate = exports.vec2CubicInterpolate = exports.cubicInterpolate = exports.matCompare = exports.quatCompare = exports.packedTransformCompare = exports.matArrayCompare = exports.vecArrayCompare = exports.quatArrayCompare = exports.vecCompare = exports.floatArrayCompare = exports.floatCompare = exports.exactArrayCompare = exports.exactCompare = exports.StorageProperty = void 0;
const SyncKitLogger_1 = require("../Utils/SyncKitLogger");
const EventWrapper_1 = require("./EventWrapper");
const NetworkUtils_1 = require("./NetworkUtils");
const PropertyType_1 = require("./PropertyType");
const SessionController_1 = require("./SessionController");
const StorageTypes_1 = require("./StorageTypes");
const SyncSnapshot_1 = require("./SyncSnapshot");
const TAG = "StorageProperty";
/**
 * Provides classes and helper functions used for storing data in RealtimeStores.
 */
class StorageProperty {
    /**
     * @param key - Key to identify and store the StorageProperty
     * @param propertyType - Use {@link StorageTypes | StorageTypes}
     * @param smoothingOptions - Options for automatically applied smoothing
     */
    constructor(key, propertyType, smoothingOptions) {
        this.log = new SyncKitLogger_1.SyncKitLogger(TAG);
        /**
         * If defined, this function is called to automatically update the property value each frame.
         */
        this.getterFunc = null;
        /**
         * If defined, this function is called to automatically apply the property value.
         */
        this.setterFunc = null;
        /**
         * If true, we have a value change that needs to be sent at the next opportunity.
         */
        this.needToSendUpdate = false;
        /**
         * The function used to check for a change in the property value. It should return `true` if two values are equal, or reasonably close to equal.
         */
        this.equalsCheck = function (a, b) {
            return a === b;
        };
        /**
         * The current value that we believe to be synced across the network. In most simple cases, this is what you want to read from.
         */
        this.currentValue = null;
        /**
         * The local value that can potentially be sent to the network at the next available chance. It may be the same as `currentValue`, but may not be.
         */
        this.pendingValue = null;
        /**
         * The most recently changed local value, whether that's `current` or `pending`.
         * In most cases when you want a very up-to-date local value, this is what you want to read from.
         */
        this.currentOrPendingValue = null;
        /**
         * Event triggered when the pending value changes.
         */
        this.onPendingValueChange = new EventWrapper_1.EventWrapper();
        /**
         * Event triggered when the `currentValue` is changed by a remote user.
         */
        this.onRemoteChange = new EventWrapper_1.EventWrapper();
        /**
         * Event triggered when the `currentValue` is changed by the local user.
         */
        this.onLocalChange = new EventWrapper_1.EventWrapper();
        /**
         * Event triggered when the `currentValue` is changed by any user (either local or remote).
         */
        this.onAnyChange = new EventWrapper_1.EventWrapper();
        /**
         * If greater than or equal to zero, this limits how often the property sends updates to the network about its value changing.
         * This is useful to avoid rate limiting when a value updates very frequently, for example if a position is changing every frame.
         * When using this feature, `currentValue` will only be updated when the value is actually sent to the network.
         * To get the most recent *local* version of a value, you can always check `currentOrPendingValue`.
         */
        this.sendsPerSecondLimit = -1;
        /**
         * Can be used to manually mark the property dirty and skip equals check
         */
        this.markedDirty = false;
        this._lastSendTime = null;
        this._snapshotBuffer = null;
        this.key = key;
        this.propertyType = propertyType;
        const equalCheck = (0, StorageTypes_1.getEqualsCheckForStorageType)(this.propertyType);
        if (equalCheck) {
            this.equalsCheck = equalCheck;
        }
        if (smoothingOptions) {
            this.setSmoothing(smoothingOptions);
        }
    }
    /**
     * @param smoothingOptions - Options for automatically applied smoothing
     */
    setSmoothing(options) {
        if (options === null || options === undefined) {
            this._snapshotBuffer = null;
        }
        else {
            options.storageType = options.storageType || this.propertyType;
            this._snapshotBuffer = SyncSnapshot_1.SnapshotBuffer.createFromOptions(options);
        }
    }
    /**
     * @param newValue - New value to apply
     * @param dontTriggerEvents - If true, events will not be triggered
     * @param updateInfo - Information about the update
     */
    applyRemoteValue(newValue, dontTriggerEvents, updateInfo, isInitialValue) {
        const prevVal = this.currentValue;
        this.currentValue = newValue;
        this.pendingValue = newValue;
        this.currentOrPendingValue = newValue;
        if (this._snapshotBuffer) {
            if (isInitialValue) {
                this._snapshotBuffer.setCurrentValue(0, newValue);
            }
            else {
                if (!updateInfo) {
                    throw new Error("No updateInfo provided for _applyRemoteValue");
                }
                if (!updateInfo.sentServerTimeMilliseconds) {
                    throw new Error("No sentServerTimeMilliseconds provided for _applyRemoteValue");
                }
                this._snapshotBuffer.saveSnapshot(updateInfo.sentServerTimeMilliseconds * 0.001, newValue);
            }
        }
        if (this.setterFunc && (!this._snapshotBuffer || isInitialValue)) {
            try {
                this.setterFunc(newValue);
            }
            catch (error) {
                this.log.e("Error applying value " + this.key + ": " + error);
            }
        }
        if (!dontTriggerEvents) {
            this.onRemoteChange.trigger(this.currentValue, prevVal, updateInfo);
            this.onAnyChange.trigger(this.currentValue, prevVal, updateInfo);
        }
    }
    /**
     * @param newValue - New value to apply
     * @returns True if the value was changed
     */
    _checkPendingValueChanged(newValue) {
        if (newValue !== null &&
            newValue !== undefined &&
            (this.pendingValue === undefined ||
                this.pendingValue === null ||
                !this.equalsCheck(newValue, this.pendingValue))) {
            const prevValue = this.pendingValue;
            this.pendingValue = newValue;
            this.currentOrPendingValue = newValue;
            if (this._snapshotBuffer) {
                this._snapshotBuffer.setCurrentValue(SessionController_1.SessionController.getInstance().getServerTimeInSeconds(), newValue);
            }
            this.onPendingValueChange.trigger(this.pendingValue, prevValue);
            return true;
        }
        return false;
    }
    /**
     * @param newValue - New value to apply
     * @returns True if the value was changed
     */
    _checkCurrentValueChanged(newValue) {
        this.pendingValue = newValue;
        if (newValue !== null &&
            (this.markedDirty ||
                this.currentValue === undefined ||
                this.currentValue === null ||
                !this.equalsCheck(newValue, this.currentValue))) {
            this.markedDirty = false;
            const prevValue = this.currentValue;
            this.currentValue = newValue;
            this.currentOrPendingValue = newValue;
            this.onLocalChange.trigger(this.currentValue, prevValue);
            this.onAnyChange.trigger(this.currentValue, prevValue, null);
            return true;
        }
        return false;
    }
    /**
     * Returns `true` if we are allowed to send updated values to the network based on the `sendsPerSecondLimit` and `timestamp`.
     * @param timestamp - Time in seconds
     * @returns True if we are allowed to send updated values to the network
     */
    checkWithinSendLimit(timestamp) {
        if (this.sendsPerSecondLimit === 0) {
            return false;
        }
        else if (this.sendsPerSecondLimit < 0 || this._lastSendTime === null) {
            return true;
        }
        return this._lastSendTime + 1.0 / this.sendsPerSecondLimit <= timestamp;
    }
    /**
     * @param timestamp - Time in seconds
     * @returns True if the value was changed
     */
    checkLocalValueChanged() {
        let newValue;
        if (this.getterFunc) {
            newValue = this.getterFunc();
            if (newValue !== null && newValue !== undefined) {
                // Skip the update if we're using smoothing and the value hasn't changed
                if (this._snapshotBuffer) {
                    const recentValue = this._snapshotBuffer.getMostRecentValue();
                    if (recentValue !== null &&
                        recentValue !== undefined &&
                        this.equalsCheck(newValue, recentValue)) {
                        return false;
                    }
                }
                // Try to set the pending value to the new value
                this._checkPendingValueChanged(newValue);
            }
        }
        return this._checkCurrentValueChanged(this.pendingValue);
    }
    /**
     * @returns True if the property has a snapshot buffer and is currently smoothing
     */
    isSmoothingEnabled() {
        return this._snapshotBuffer !== null;
    }
    applySnapshotSmoothing() {
        if (this._snapshotBuffer) {
            const currentTimestamp = SessionController_1.SessionController.getInstance().getServerTimeInSeconds();
            let newVal = this._snapshotBuffer.getLerpedValue(currentTimestamp + this._snapshotBuffer.interpolationTarget);
            if (newVal === null || newVal === undefined) {
                newVal = this.currentOrPendingValue;
            }
            if (newVal !== null && newVal !== undefined) {
                try {
                    if (this.setterFunc) {
                        this.setterFunc(newVal);
                    }
                }
                catch (error) {
                    this.log.e("Error applying value " + this.key + ": " + error);
                }
            }
        }
    }
    /**
     * Sets the pending value to `newValue`. This value will be sent to the network at the end of the frame,
     * as soon as it's allowed to do so (we have permission to modify the SyncEntity, and `sendsPerSecondLimit` hasn't been reached).
     * @param newValue - New pending value to set
     */
    setPendingValue(newValue) {
        if (this.getterFunc) {
            this.log.w("Pending value will be ignored for StorageProperty with getter func! key:" +
                this.key);
        }
        this._checkPendingValueChanged(newValue);
    }
    /**
     * @param newValue - New value to set
     */
    silentSetCurrentValue(newValue) {
        this.currentValue = newValue;
        this.pendingValue = newValue;
    }
    /**
     * Immediately set the current value. Only use this if you are sure that we have permission to modify the store.
     * @param store - Store to write value to
     * @param newValue - New value to set
     * @returns True if the value was changed
     */
    setValueImmediate(store, newValue) {
        if (this._checkCurrentValueChanged(newValue)) {
            this.putCurrentValue(store);
            return true;
        }
        return false;
    }
    /**
     * Helper function that writes a value to a `store`, given a `key` and {@link StorageType | StorageType}
     * @param store - Store to write value to
     * @param key - Key identifying the value
     * @param identifying - the type of value
     * @param value - Value to set
     */
    putStoreValueDynamic(store, key, propertyType, value) {
        let funcName = "put" + propertyType;
        if (propertyType === StorageTypes_1.StorageTypes.packedTransform) {
            funcName = "putVec4Array";
        }
        try {
            store[funcName](key, value);
        }
        catch (error) {
            this.log.e("Error putting property " +
                key +
                ", type " +
                propertyType +
                ", val: " +
                value +
                ". Error: " +
                error);
        }
    }
    /**
     * Helper function that reads a value from a `store`, given a `key` and {@link StorageType | StorageType}
     * @param store - Store to read value from
     * @param key - Key identifying the value
     * @param identifying - the type of value
     * @returns Value - found (or default value if none found)
     */
    static getStoreValueDynamic(store, key, propertyType) {
        let funcName = "get" + propertyType;
        if (propertyType === StorageTypes_1.StorageTypes.packedTransform) {
            funcName = "getVec4Array";
        }
        const newValue = store[funcName](key);
        return newValue;
    }
    /**
     * @param store - Store to write value to
     * @param timeStamp - Time in seconds
     */
    putCurrentValue(store, timeStamp) {
        this._lastSendTime = timeStamp === undefined ? getTime() : timeStamp;
        this.putStoreValueDynamic(store, this.key, this.propertyType, this.currentValue);
    }
    /**
     * Creates a simple `StorageProperty` that should be updated manually.
     * @param key - Key to identify the property
     * @param identifying - the type of value
     * @param startingValue - Optional starting value to assign to the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created manual StorageProperty
     */
    static manual(key, propertyType, startingValue, smoothingOptions) {
        const prop = new StorageProperty(key, propertyType);
        prop.setPendingValue(startingValue);
        prop.setSmoothing(smoothingOptions);
        return prop;
    }
    /**
     * Creates a simple `string` property that should be updated manually.
     * @param key - Key to identify the property
     * @param startingValue - Optional starting value to assign to the property
     * @returns Newly created StorageProperty
     */
    static manualString(key, startingValue) {
        return StorageProperty.manual(key, StorageTypes_1.StorageTypes.string, startingValue);
    }
    /**
     * Creates a simple `boolean` property that should be updated manually.
     * @param key - Key to identify the property
     * @param startingValue - Optional starting value to assign to the property
     * @returns Newly created StorageProperty
     */
    static manualBool(key, startingValue) {
        return StorageProperty.manual(key, StorageTypes_1.StorageTypes.bool, startingValue);
    }
    /**
     * Creates a simple `integer` property that should be updated manually.
     * @param key - Key to identify the property
     * @param startingValue - Optional starting value to assign to the property
     * @returns Newly created StorageProperty
     */
    static manualInt(key, startingValue) {
        return StorageProperty.manual(key, StorageTypes_1.StorageTypes.int, startingValue);
    }
    /**
     * Creates a simple `float` property that should be updated manually.
     * @param key - Key to identify the property
     * @param startingValue - Optional starting value to assign to the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static manualFloat(key, startingValue, smoothingOptions) {
        return StorageProperty.manual(key, StorageTypes_1.StorageTypes.float, startingValue, smoothingOptions);
    }
    /**
     * Creates a simple `double` property that should be updated manually.
     * @param key - Key to identify the property
     * @param startingValue - Optional starting value to assign to the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static manualDouble(key, startingValue, smoothingOptions) {
        return StorageProperty.manual(key, StorageTypes_1.StorageTypes.double, startingValue, smoothingOptions);
    }
    /**
     * Creates a simple property that should be updated manually.
     * @param key - Key to identify the property
     * @param startingValue - Optional starting value to assign to the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static manualVec2(key, startingValue, smoothingOptions) {
        return StorageProperty.manual(key, StorageTypes_1.StorageTypes.vec2, startingValue, smoothingOptions);
    }
    /**
     * Creates a simple property that should be updated manually.
     * @param key - Key to identify the property
     * @param startingValue - Optional starting value to assign to the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static manualVec3(key, startingValue, smoothingOptions) {
        return StorageProperty.manual(key, StorageTypes_1.StorageTypes.vec3, startingValue, smoothingOptions);
    }
    /**
     * Creates a simple property that should be updated manually.
     * @param key - Key to identify the property
     * @param startingValue - Optional starting value to assign to the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static manualMat2(key, startingValue, smoothingOptions) {
        return StorageProperty.manual(key, StorageTypes_1.StorageTypes.mat2, startingValue, smoothingOptions);
    }
    /**
     * Creates a simple property that should be updated manually.
     * @param key - Key to identify the property
     * @param startingValue - Optional starting value to assign to the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static manualMat3(key, startingValue, smoothingOptions) {
        return StorageProperty.manual(key, StorageTypes_1.StorageTypes.mat3, startingValue, smoothingOptions);
    }
    /**
     * Creates a simple property that should be updated manually.
     * @param key - Key to identify the property
     * @param startingValue - Optional starting value to assign to the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static manualMat4(key, startingValue, smoothingOptions) {
        return StorageProperty.manual(key, StorageTypes_1.StorageTypes.mat4, startingValue, smoothingOptions);
    }
    /**
     * Creates a simple property that should be updated manually.
     * @param key - Key to identify the property
     * @param startingValue - Optional starting value to assign to the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static manualVec4(key, startingValue, smoothingOptions) {
        return StorageProperty.manual(key, StorageTypes_1.StorageTypes.vec4, startingValue, smoothingOptions);
    }
    /**
     * Creates a simple property that should be updated manually.
     * @param key - Key to identify the property
     * @param startingValue - Optional starting value to assign to the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static manualQuat(key, startingValue, smoothingOptions) {
        return StorageProperty.manual(key, StorageTypes_1.StorageTypes.quat, startingValue, smoothingOptions);
    }
    /**
     * Creates a simple property that should be updated manually.
     * @param key - Key to identify the property
     * @param startingValue - Optional starting value to assign to the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static manualBoolArray(key, startingValue, smoothingOptions) {
        return StorageProperty.manual(key, StorageTypes_1.StorageTypes.boolArray, startingValue, smoothingOptions);
    }
    /**
     * Creates a simple property that should be updated manually.
     * @param key - Key to identify the property
     * @param startingValue - Optional starting value to assign to the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static manualStringArray(key, startingValue, smoothingOptions) {
        return StorageProperty.manual(key, StorageTypes_1.StorageTypes.stringArray, startingValue, smoothingOptions);
    }
    /**
     * Creates a simple property that should be updated manually.
     * @param key - Key to identify the property
     * @param startingValue - Optional starting value to assign to the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static manualIntArray(key, startingValue, smoothingOptions) {
        return StorageProperty.manual(key, StorageTypes_1.StorageTypes.intArray, startingValue, smoothingOptions);
    }
    /**
     * Creates a simple property that should be updated manually.
     * @param key - Key to identify the property
     * @param startingValue - Optional starting value to assign to the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static manualFloatArray(key, startingValue, smoothingOptions) {
        return StorageProperty.manual(key, StorageTypes_1.StorageTypes.floatArray, startingValue, smoothingOptions);
    }
    /**
     * Creates a simple property that should be updated manually.
     * @param key - Key to identify the property
     * @param startingValue - Optional starting value to assign to the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static manualDoubleArray(key, startingValue, smoothingOptions) {
        return StorageProperty.manual(key, StorageTypes_1.StorageTypes.doubleArray, startingValue, smoothingOptions);
    }
    /**
     * Creates a simple property that should be updated manually.
     * @param key - Key to identify the property
     * @param startingValue - Optional starting value to assign to the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static manualVec2Array(key, startingValue, smoothingOptions) {
        return StorageProperty.manual(key, StorageTypes_1.StorageTypes.vec2Array, startingValue, smoothingOptions);
    }
    /**
     * Creates a simple property that should be updated manually.
     * @param key - Key to identify the property
     * @param startingValue - Optional starting value to assign to the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static manualVec3Array(key, startingValue, smoothingOptions) {
        return StorageProperty.manual(key, StorageTypes_1.StorageTypes.vec3Array, startingValue, smoothingOptions);
    }
    /**
     * Creates a simple property that should be updated manually.
     * @param key - Key to identify the property
     * @param startingValue - Optional starting value to assign to the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static manualVec4Array(key, startingValue, smoothingOptions) {
        return StorageProperty.manual(key, StorageTypes_1.StorageTypes.vec4Array, startingValue, smoothingOptions);
    }
    /**
     * Creates a simple property that should be updated manually.
     * @param key - Key to identify the property
     * @param startingValue - Optional starting value to assign to the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static manualMat2Array(key, startingValue, smoothingOptions) {
        return StorageProperty.manual(key, StorageTypes_1.StorageTypes.mat2Array, startingValue, smoothingOptions);
    }
    /**
     * Creates a simple property that should be updated manually.
     * @param key - Key to identify the property
     * @param startingValue - Optional starting value to assign to the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static manualMat3Array(key, startingValue, smoothingOptions) {
        return StorageProperty.manual(key, StorageTypes_1.StorageTypes.mat3Array, startingValue, smoothingOptions);
    }
    /**
     * Creates a simple property that should be updated manually.
     * @param key - Key to identify the property
     * @param startingValue - Optional starting value to assign to the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static manualMat4Array(key, startingValue, smoothingOptions) {
        return StorageProperty.manual(key, StorageTypes_1.StorageTypes.mat4Array, startingValue, smoothingOptions);
    }
    /**
     * Creates a simple property that should be updated manually.
     * @param key - Key to identify the property
     * @param startingValue - Optional starting value to assign to the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static manualQuatArray(key, startingValue, smoothingOptions) {
        return StorageProperty.manual(key, StorageTypes_1.StorageTypes.quatArray, startingValue, smoothingOptions);
    }
    /**
     * Creates an automatically updated `StorageProperty` based on getter and setter functions.
     * @param key - Key to identify the property
     * @param identifying - the type of value
     * @param getterFunc - Function that returns the current local value for the property
     * @param setterFunc - Function that applies incoming new values for the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static auto(key, propertyType, getterFunc, setterFunc, smoothingOptions) {
        const prop = new StorageProperty(key, propertyType);
        prop.getterFunc = getterFunc;
        prop.setterFunc = setterFunc;
        prop.setSmoothing(smoothingOptions);
        return prop;
    }
    /**
     * Creates an automatically updated `boolean` property based on getter and setter functions.
     * @param key - Key to identify the property
     * @param getterFunc - Function that returns the current local value for the property
     * @param setterFunc - Function that applies incoming new values for the property
     * @returns Newly created StorageProperty
     */
    static autoBool(key, getterFunc, setterFunc) {
        return StorageProperty.auto(key, StorageTypes_1.StorageTypes.bool, getterFunc, setterFunc);
    }
    /**
     * Creates an automatically updated `string` property based on getter and setter functions.
     * @param key - Key to identify the property
     * @param getterFunc - Function that returns the current local value for the property
     * @param setterFunc - Function that applies incoming new values for the property
     * @returns Newly created StorageProperty
     */
    static autoString(key, getterFunc, setterFunc) {
        return StorageProperty.auto(key, StorageTypes_1.StorageTypes.string, getterFunc, setterFunc);
    }
    /**
     * Creates an automatically updated `int` property based on getter and setter functions.
     * @param key - Key to identify the property
     * @param getterFunc - Function that returns the current local value for the property
     * @param setterFunc - Function that applies incoming new values for the property
     * @returns Newly created StorageProperty
     */
    static autoInt(key, getterFunc, setterFunc) {
        return StorageProperty.auto(key, StorageTypes_1.StorageTypes.int, getterFunc, setterFunc);
    }
    /**
     * Creates an automatically updated `float` property based on getter and setter functions.
     * @param key - Key to identify the property
     * @param getterFunc - Function that returns the current local value for the property
     * @param setterFunc - Function that applies incoming new values for the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static autoFloat(key, getterFunc, setterFunc, smoothingOptions) {
        return StorageProperty.auto(key, StorageTypes_1.StorageTypes.float, getterFunc, setterFunc, smoothingOptions);
    }
    /**
     * Creates an automatically updated `double` property based on getter and setter functions.
     * @param key - Key to identify the property
     * @param getterFunc - Function that returns the current local value for the property
     * @param setterFunc - Function that applies incoming new values for the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static autoDouble(key, getterFunc, setterFunc, smoothingOptions) {
        return StorageProperty.auto(key, StorageTypes_1.StorageTypes.double, getterFunc, setterFunc, smoothingOptions);
    }
    /**
     * Creates an automatically updated `vec2` property based on getter and setter functions.
     * @param key - Key to identify the property
     * @param getterFunc - Function that returns the current local value for the property
     * @param setterFunc - Function that applies incoming new values for the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static autoVec2(key, getterFunc, setterFunc, smoothingOptions) {
        return StorageProperty.auto(key, StorageTypes_1.StorageTypes.vec2, getterFunc, setterFunc, smoothingOptions);
    }
    /**
     * Creates an automatically updated `vec3` property based on getter and setter functions.
     * @param key - Key to identify the property
     * @param getterFunc - Function that returns the current local value for the property
     * @param setterFunc - Function that applies incoming new values for the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static autoVec3(key, getterFunc, setterFunc, smoothingOptions) {
        return StorageProperty.auto(key, StorageTypes_1.StorageTypes.vec3, getterFunc, setterFunc, smoothingOptions);
    }
    /**
     * Creates an automatically updated `vec4` property based on getter and setter functions.
     * @param key - Key to identify the property
     * @param getterFunc - Function that returns the current local value for the property
     * @param setterFunc - Function that applies incoming new values for the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static autoVec4(key, getterFunc, setterFunc, smoothingOptions) {
        return StorageProperty.auto(key, StorageTypes_1.StorageTypes.vec4, getterFunc, setterFunc, smoothingOptions);
    }
    /**
     * Creates an automatically updated `quat` property based on getter and setter functions.
     * @param key - Key to identify the property
     * @param getterFunc - Function that returns the current local value for the property
     * @param setterFunc - Function that applies incoming new values for the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static autoQuat(key, getterFunc, setterFunc, smoothingOptions) {
        return StorageProperty.auto(key, StorageTypes_1.StorageTypes.quat, getterFunc, setterFunc, smoothingOptions);
    }
    /**
     * Creates an automatically updated `mat2` property based on getter and setter functions.
     * @param key - Key to identify the property
     * @param getterFunc - Function that returns the current local value for the property
     * @param setterFunc - Function that applies incoming new values for the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static autoMat2(key, getterFunc, setterFunc, smoothingOptions) {
        return StorageProperty.auto(key, StorageTypes_1.StorageTypes.mat2, getterFunc, setterFunc, smoothingOptions);
    }
    /**
     * Creates an automatically updated `mat3` property based on getter and setter functions.
     * @param key - Key to identify the property
     * @param getterFunc - Function that returns the current local value for the property
     * @param setterFunc - Function that applies incoming new values for the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static autoMat3(key, getterFunc, setterFunc, smoothingOptions) {
        return StorageProperty.auto(key, StorageTypes_1.StorageTypes.mat3, getterFunc, setterFunc, smoothingOptions);
    }
    /**
     * Creates an automatically updated `mat4` property based on getter and setter functions.
     * @param key - Key to identify the property
     * @param getterFunc - Function that returns the current local value for the property
     * @param setterFunc - Function that applies incoming new values for the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static autoMat4(key, getterFunc, setterFunc, smoothingOptions) {
        return StorageProperty.auto(key, StorageTypes_1.StorageTypes.mat4, getterFunc, setterFunc, smoothingOptions);
    }
    /**
     * Creates an automatically updated `string[]` property based on getter and setter functions.
     * @param key - Key to identify the property
     * @param getterFunc - Function that returns the current local value for the property
     * @param setterFunc - Function that applies incoming new values for the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static autoStringArray(key, getterFunc, setterFunc, smoothingOptions) {
        return StorageProperty.auto(key, StorageTypes_1.StorageTypes.stringArray, getterFunc, setterFunc, smoothingOptions);
    }
    /**
     * Creates an automatically updated `boolean[]` property based on getter and setter functions.
     * @param key - Key to identify the property
     * @param getterFunc - Function that returns the current local value for the property
     * @param setterFunc - Function that applies incoming new values for the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static autoBoolArray(key, getterFunc, setterFunc, smoothingOptions) {
        return StorageProperty.auto(key, StorageTypes_1.StorageTypes.boolArray, getterFunc, setterFunc, smoothingOptions);
    }
    /**
     * Creates an automatically updated `float[]` property based on getter and setter functions.
     * @param key - Key to identify the property
     * @param getterFunc - Function that returns the current local value for the property
     * @param setterFunc - Function that applies incoming new values for the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static autoFloatArray(key, getterFunc, setterFunc, smoothingOptions) {
        return StorageProperty.auto(key, StorageTypes_1.StorageTypes.floatArray, getterFunc, setterFunc, smoothingOptions);
    }
    /**
     * Creates an automatically updated `double[]` property based on getter and setter functions.
     * @param key - Key to identify the property
     * @param getterFunc - Function that returns the current local value for the property
     * @param setterFunc - Function that applies incoming new values for the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static autoDoubleArray(key, getterFunc, setterFunc, smoothingOptions) {
        return StorageProperty.auto(key, StorageTypes_1.StorageTypes.doubleArray, getterFunc, setterFunc, smoothingOptions);
    }
    /**
     * Creates an automatically updated `int[]` property based on getter and setter functions.
     * @param key - Key to identify the property
     * @param getterFunc - Function that returns the current local value for the property
     * @param setterFunc - Function that applies incoming new values for the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static autoIntArray(key, getterFunc, setterFunc, smoothingOptions) {
        return StorageProperty.auto(key, StorageTypes_1.StorageTypes.intArray, getterFunc, setterFunc, smoothingOptions);
    }
    /**
     * Creates an automatically updated `vec2[]` property based on getter and setter functions.
     * @param key - Key to identify the property
     * @param getterFunc - Function that returns the current local value for the property
     * @param setterFunc - Function that applies incoming new values for the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static autoVec2Array(key, getterFunc, setterFunc, smoothingOptions) {
        return StorageProperty.auto(key, StorageTypes_1.StorageTypes.vec2Array, getterFunc, setterFunc, smoothingOptions);
    }
    /**
     * Creates an automatically updated `vec3[]` property based on getter and setter functions.
     * @param key - Key to identify the property
     * @param getterFunc - Function that returns the current local value for the property
     * @param setterFunc - Function that applies incoming new values for the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static autoVec3Array(key, getterFunc, setterFunc, smoothingOptions) {
        return StorageProperty.auto(key, StorageTypes_1.StorageTypes.vec3Array, getterFunc, setterFunc, smoothingOptions);
    }
    /**
     * Creates an automatically updated `vec4[]` property based on getter and setter functions.
     * @param key - Key to identify the property
     * @param getterFunc - Function that returns the current local value for the property
     * @param setterFunc - Function that applies incoming new values for the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static autoVec4Array(key, getterFunc, setterFunc, smoothingOptions) {
        return StorageProperty.auto(key, StorageTypes_1.StorageTypes.vec4Array, getterFunc, setterFunc, smoothingOptions);
    }
    /**
     * Creates an automatically updated `quat[]` property based on getter and setter functions.
     * @param key - Key to identify the property
     * @param getterFunc - Function that returns the current local value for the property
     * @param setterFunc - Function that applies incoming new values for the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static autoQuatArray(key, getterFunc, setterFunc, smoothingOptions) {
        return StorageProperty.auto(key, StorageTypes_1.StorageTypes.quatArray, getterFunc, setterFunc, smoothingOptions);
    }
    /**
     * Creates an automatically updated `mat2[]` property based on getter and setter functions.
     * @param key - Key to identify the property
     * @param getterFunc - Function that returns the current local value for the property
     * @param setterFunc - Function that applies incoming new values for the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static autoMat2Array(key, getterFunc, setterFunc, smoothingOptions) {
        return StorageProperty.auto(key, StorageTypes_1.StorageTypes.mat2Array, getterFunc, setterFunc, smoothingOptions);
    }
    /**
     * Creates an automatically updated `mat3[]` property based on getter and setter functions.
     * @param key - Key to identify the property
     * @param getterFunc - Function that returns the current local value for the property
     * @param setterFunc - Function that applies incoming new values for the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static autoMat3Array(key, getterFunc, setterFunc, smoothingOptions) {
        return StorageProperty.auto(key, StorageTypes_1.StorageTypes.mat3Array, getterFunc, setterFunc, smoothingOptions);
    }
    /**
     * Creates an automatically updated `mat4[]` property based on getter and setter functions.
     * @param key - Key to identify the property
     * @param getterFunc - Function that returns the current local value for the property
     * @param setterFunc - Function that applies incoming new values for the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static autoMat4Array(key, getterFunc, setterFunc, smoothingOptions) {
        return StorageProperty.auto(key, StorageTypes_1.StorageTypes.mat4Array, getterFunc, setterFunc, smoothingOptions);
    }
    /**
     * Creates an automatically updated property based on a target object and property name.
     * The `propName` should be the name of a property on the `target` object.
     * @param key - Key to identify the property
     * @param target - Target object to watch
     * @param propName - Name of a property on `target` that should be watched
     * @param identifying - the type of value
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static wrapProperty(key, target, propName, propertyType, smoothingOptions) {
        const storageProp = new StorageProperty(key, propertyType);
        storageProp.setterFunc = wrapPropertyWriter(target, propName);
        storageProp.getterFunc = wrapPropertyReader(target, propName);
        storageProp.setSmoothing(smoothingOptions);
        return storageProp;
    }
    /**
     * Creates an automatically updated property that mirrors a {@link Transform | Transform} position/rotation/scale.
     * @param getterFunc - Function that returns the current local value for the property
     * @param setterFunc - Function that applies incoming new values for the property
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static forTransform(permissiveTransform, positionPropertyType, rotationPropertyType, scalePropertyType, smoothingOptions) {
        const transform = getTransformHelper(permissiveTransform);
        const positionGetter = StorageProperty.forPositionGetterFun(positionPropertyType, transform);
        const positionSetter = StorageProperty.forPositionSetterFun(positionPropertyType, transform);
        const rotationGetter = StorageProperty.forRotationGetterFun(rotationPropertyType, transform);
        const rotationSetter = StorageProperty.forRotationSetterFun(rotationPropertyType, transform);
        const scaleGetter = StorageProperty.forScaleGetterFun(scalePropertyType, transform);
        const scaleSetter = StorageProperty.forScaleSetterFun(scalePropertyType, transform);
        const transformGetterFunc = () => {
            const positionVec3 = positionGetter();
            const positionVec4 = new vec4(positionVec3.x, positionVec3.y, positionVec3.z, 0);
            const rotationQuat = rotationGetter();
            const rotationVec4 = new vec4(rotationQuat.x, rotationQuat.y, rotationQuat.z, rotationQuat.w);
            const scaleVec3 = scaleGetter();
            const scaleVec4 = new vec4(scaleVec3.x, scaleVec3.y, scaleVec3.z, 0);
            return [positionVec4, rotationVec4, scaleVec4];
        };
        const transformSetterFunc = (newValue) => {
            const positionVec4 = newValue[0];
            const positionVec3 = new vec3(positionVec4.x, positionVec4.y, positionVec4.z);
            positionSetter(positionVec3);
            const rotationVec4 = newValue[1];
            const rotationQuat = new quat(rotationVec4.w, rotationVec4.x, rotationVec4.y, rotationVec4.z);
            rotationSetter(rotationQuat);
            const scaleVec4 = newValue[2];
            const scaleVec3 = new vec3(scaleVec4.x, scaleVec4.y, scaleVec4.z);
            scaleSetter(scaleVec3);
        };
        return StorageProperty.auto("transformAllData" + "_" + transform.getSceneObject().name, StorageTypes_1.StorageTypes.packedTransform, transformGetterFunc, transformSetterFunc, smoothingOptions);
    }
    /**
     * @param transform -
     * @param propertyType -
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static forPosition(permissiveTransform, propertyType, smoothingOptions) {
        const transform = getTransformHelper(permissiveTransform);
        const getter = StorageProperty.forPositionGetterFun(propertyType, transform);
        const setter = StorageProperty.forPositionSetterFun(propertyType, transform);
        return StorageProperty.auto("position" + propertyType + "_" + transform.getSceneObject().name, StorageTypes_1.StorageTypes.vec3, getter, setter, smoothingOptions);
    }
    /**
     * @param transform -
     * @param propertyType -
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static forRotation(permissiveTransform, propertyType, smoothingOptions) {
        const transform = getTransformHelper(permissiveTransform);
        const getter = StorageProperty.forRotationGetterFun(propertyType, transform);
        const setter = StorageProperty.forRotationSetterFun(propertyType, transform);
        return StorageProperty.auto("rotation" + propertyType + "_" + transform.getSceneObject().name, StorageTypes_1.StorageTypes.quat, getter, setter, smoothingOptions);
    }
    /**
     *
     * @param transform -
     * @param propertyType -
     * @param smoothingOptions - Options for automatically applied smoothing
     * @returns Newly created StorageProperty
     */
    static forScale(permissiveTransform, propertyType, smoothingOptions) {
        const transform = getTransformHelper(permissiveTransform);
        const getter = StorageProperty.forScaleGetterFun(propertyType, transform);
        const setter = StorageProperty.forScaleSetterFun(propertyType, transform);
        return StorageProperty.auto("scale" + propertyType + "_" + transform.getSceneObject().name, StorageTypes_1.StorageTypes.vec3, getter, setter, smoothingOptions);
    }
    static forScaleGetterFun(propertyType, transform) {
        switch (propertyType) {
            case PropertyType_1.PropertyType.None:
                return () => {
                    return vec3.zero();
                };
            case PropertyType_1.PropertyType.Local:
                return () => {
                    return transform.getLocalScale();
                };
            case PropertyType_1.PropertyType.World:
                return () => {
                    return transform.getWorldScale();
                };
            case PropertyType_1.PropertyType.Location: {
                const locationTransform = getLocationTransform(transform);
                return () => {
                    const worldTransform = transform.getWorldTransform();
                    const locationInvertedTransform = locationTransform.getInvertedWorldTransform();
                    const transformFromLocation = locationInvertedTransform.mult(worldTransform);
                    return scaleFromMat4(transformFromLocation);
                };
            }
            default:
                throw new Error("Invalid PropertyType");
        }
    }
    static forPositionGetterFun(propertyType, transform) {
        switch (propertyType) {
            case PropertyType_1.PropertyType.None:
                return () => {
                    return vec3.zero();
                };
            case PropertyType_1.PropertyType.Local:
                return () => {
                    return transform.getLocalPosition();
                };
            case PropertyType_1.PropertyType.World:
                return () => {
                    return transform.getWorldPosition();
                };
            case PropertyType_1.PropertyType.Location: {
                const locationTransform = getLocationTransform(transform);
                return () => {
                    const worldTransform = transform.getWorldTransform();
                    const locationInvertedTransform = locationTransform.getInvertedWorldTransform();
                    const transformFromLocation = locationInvertedTransform.mult(worldTransform);
                    return new vec3(transformFromLocation.column3.x, transformFromLocation.column3.y, transformFromLocation.column3.z);
                };
            }
            default:
                throw new Error("Invalid PropertyType");
        }
    }
    static forRotationGetterFun(propertyType, transform) {
        switch (propertyType) {
            case PropertyType_1.PropertyType.None:
                return () => {
                    return quat.quatIdentity();
                };
            case PropertyType_1.PropertyType.Local:
                return () => {
                    return transform.getLocalRotation();
                };
            case PropertyType_1.PropertyType.World:
                return () => {
                    return transform.getWorldRotation();
                };
            case PropertyType_1.PropertyType.Location: {
                const locationTransform = getLocationTransform(transform);
                return () => {
                    const worldRotation = transform.getWorldRotation();
                    const locationWorldRotation = locationTransform.getWorldRotation();
                    const locationInverseRotation = locationWorldRotation.invert();
                    const rotationQuat = locationInverseRotation.multiply(worldRotation);
                    return rotationQuat;
                };
            }
            default:
                throw new Error("Invalid PropertyType");
        }
    }
    static forPositionSetterFun(propertyType, transform) {
        switch (propertyType) {
            case PropertyType_1.PropertyType.None:
                return () => { };
            case PropertyType_1.PropertyType.Local:
                return (value) => {
                    return transform.setLocalPosition(value);
                };
            case PropertyType_1.PropertyType.World:
                return (value) => {
                    return transform.setWorldPosition(value);
                };
            case PropertyType_1.PropertyType.Location: {
                const locationTransform = getLocationTransform(transform);
                return (value) => {
                    const locationWorldTransform = locationTransform.getWorldTransform();
                    const worldPosition = locationWorldTransform.multiplyPoint(value);
                    transform.setWorldPosition(worldPosition);
                };
            }
            default:
                throw new Error("Invalid PropertyType");
        }
    }
    static forRotationSetterFun(propertyType, transform) {
        switch (propertyType) {
            case PropertyType_1.PropertyType.None:
                return () => { };
            case PropertyType_1.PropertyType.Local:
                return (value) => {
                    return transform.setLocalRotation(value);
                };
            case PropertyType_1.PropertyType.World:
                return (value) => {
                    return transform.setWorldRotation(value);
                };
            case PropertyType_1.PropertyType.Location: {
                const locationTransform = getLocationTransform(transform);
                return (value) => {
                    const locationRotation = locationTransform.getWorldRotation();
                    const worldRotation = locationRotation.multiply(value);
                    transform.setWorldRotation(worldRotation);
                };
            }
            default:
                throw new Error("Invalid PropertyType");
        }
    }
    static forScaleSetterFun(propertyType, transform) {
        switch (propertyType) {
            case PropertyType_1.PropertyType.None:
                return () => { };
            case PropertyType_1.PropertyType.Local:
                return () => {
                    return transform.getLocalScale();
                };
            case PropertyType_1.PropertyType.World:
                return () => {
                    return transform.getWorldScale();
                };
            case PropertyType_1.PropertyType.Location: {
                const locationTransform = getLocationTransform(transform);
                return (val) => {
                    const locationScaleMatrix = locationTransform.getWorldTransform();
                    const relativeScaleMatrix = mat4.fromScale(val);
                    const worldScaleMatrix = locationScaleMatrix.mult(relativeScaleMatrix);
                    const worldScale = scaleFromMat4(worldScaleMatrix);
                    transform.setWorldScale(worldScale);
                };
            }
            default:
                throw new Error("Invalid PropertyType");
        }
    }
    /**
     * Creates an automatically updated property that mirrors a {@link Text| Text}'s `text` property.
     * @param to - watch
     * @returns Newly created StorageProperty
     */
    static forTextText(text) {
        return StorageProperty.wrapProperty("text_text", text, "text", StorageTypes_1.StorageTypes.string);
    }
    /**
     * Creates an automatically updated property that mirrors a value on a {@link Material | Material}'s `mainPass`.
     * @param material - Material to watch
     * @param propertyName - Name of a property on the `material`
     * @param identifying - the type of value
     * @returns Newly created StorageProperty
     */
    static forMaterialProperty(material, propertyName, storageType) {
        return StorageProperty.wrapProperty("mat_" + material.name + "_" + propertyName, material.mainPass, propertyName, storageType);
    }
    /**
     * Creates an automatically updated property that mirrors a value on a {@link MaterialMeshVisual | MaterialMeshVisual}'s `mainMaterial`.
     * There is also an option to clone the material in-place.
     * @param visual - Visual to watch
     * @param propertyName - Name of a property on the `visual`
     * @param identifying - the type of value
     * @param clone - If `true`, the material will be cloned and applied back to the visual. Useful if multiple objects use the same material
     * @returns Newly created StorageProperty
     */
    static forMeshVisualProperty(visual, propertyName, storageType, clone) {
        if (clone) {
            visual.mainMaterial = visual.mainMaterial.clone();
        }
        return StorageProperty.forMaterialProperty(visual.mainMaterial, propertyName, storageType);
    }
    /**
     * Creates an automatically updated property that mirrors the `baseColor` of a {@link MaterialMeshVisual | MaterialMeshVisual}.
     * @param visual - Visual to watch
     * @param clone - If `true`, the material will be cloned and applied back to the visual. Useful if multiple objects use the same material
     * @returns Newly created StorageProperty
     */
    static forMeshVisualBaseColor(visual, clone) {
        return StorageProperty.forMeshVisualProperty(visual, "baseColor", StorageTypes_1.StorageTypes.vec4, clone);
    }
}
exports.StorageProperty = StorageProperty;
/**
 * @param target - Target object
 * @returns The Transform of the target object
 */
function getTransformHelper(target) {
    if (isNull(target)) {
        return null;
    }
    if ((0, NetworkUtils_1.isTransform)(target)) {
        return target;
    }
    if (target.getTransform) {
        return target.getTransform();
    }
    return null;
}
/**
 * @param target - Target object
 * @returns The Transform of the LocatedAt object which is the ancestor of the target object
 */
function getLocationTransform(target) {
    const targetSceneObject = getSceneObjectHelper(target);
    const locationObject = findLocatedAtComponent(targetSceneObject);
    const locationTransform = getTransformHelper(locationObject);
    if (locationTransform === null) {
        throw new Error(`Could not find LocatedAtComponent for Location sync'd object ${targetSceneObject.name}`);
    }
    return locationTransform;
}
/**
 * @param target - Target object
 * @returns The SceneObject of the target object
 */
function getSceneObjectHelper(target) {
    if (isNull(target)) {
        return null;
    }
    if ((0, NetworkUtils_1.isSceneObject)(target)) {
        return target;
    }
    if ((0, NetworkUtils_1.isTransform)(target)) {
        return target.getSceneObject();
    }
    if (target.getSceneObject) {
        return target.getSceneObject();
    }
    return null;
}
/**
 * @param object - Target object
 * @returns The LocatedAtComponent that is the ancestor of the target object
 */
function findLocatedAtComponent(object) {
    if (isNull(object)) {
        return null;
    }
    for (const component of object.getComponents("Component.LocatedAtComponent")) {
        return component;
    }
    return findLocatedAtComponent(object.getParent());
}
/**
 * Returns a function that returns the current value of a property on the target object
 * @param obj - Target object
 * @param propName - Name of property to read from
 * @returns Function that returns the property `propName` on `obj`.
 */
function wrapPropertyReader(obj, propName) {
    return () => {
        return obj[propName];
    };
}
/**
 * Returns a function that sets the value of a property on the target object
 * @param obj - Target object
 * @param propName - Name of property to write to
 * @returns Function that sets the property `propName` on `obj` to the passed in argument.
 */
function wrapPropertyWriter(obj, propName) {
    return (value) => {
        obj[propName] = value;
    };
}
/**
 * @param a - First value
 * @param b - Second value
 * @returns True if the two values are exactly equal
 */
function exactCompare(a, b) {
    return a === b;
}
exports.exactCompare = exactCompare;
/**
 * @param a - First value
 * @param b - Second value
 * @returns True if the two values are exactly equal
 */
function exactArrayCompare(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (!exactCompare(a[i], b[i])) {
            return false;
        }
    }
    return true;
}
exports.exactArrayCompare = exactArrayCompare;
/**
 * @param a - First value
 * @param b - Second value
 * @returns True if the two values are approximately equal
 */
function floatCompare(a, b) {
    return Math.abs(a - b) < 0.01;
}
exports.floatCompare = floatCompare;
/**
 * @param a - First value
 * @param b - Second value
 * @returns True if the two values are approximately equal
 */
function floatArrayCompare(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (!floatCompare(a[i], b[i])) {
            return false;
        }
    }
    return true;
}
exports.floatArrayCompare = floatArrayCompare;
/**
 * @param a - First value
 * @param b - Second value
 * @returns True if the two values are approximately equal
 */
function vecCompare(a, b) {
    return a.distanceSquared(b) < 0.000001;
}
exports.vecCompare = vecCompare;
/**
 * @param a - First value
 * @param b - Second value
 * @returns True if the two values are approximately equal
 */
function quatArrayCompare(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (!quatCompare(a[i], b[i])) {
            return false;
        }
    }
    return true;
}
exports.quatArrayCompare = quatArrayCompare;
/**
 * @param a - First value
 * @param b - Second value
 * @returns True if the two values are approximately equal
 */
function vecArrayCompare(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (!vecCompare(a[i], b[i])) {
            return false;
        }
    }
    return true;
}
exports.vecArrayCompare = vecArrayCompare;
/**
 * @param a - First value
 * @param b - Second value
 * @returns True if the two values are approximately equal
 */
function matArrayCompare(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (!matCompare(a[i], b[i])) {
            return false;
        }
    }
    return true;
}
exports.matArrayCompare = matArrayCompare;
/**
 * @param a - First value
 * @param b - Second value
 * @returns True if the two values are approximately equal
 */
function packedTransformCompare(a, b) {
    const position0 = a[0];
    const position1 = b[0];
    const rotation0 = quatFromVec4(a[1]);
    const rotation1 = quatFromVec4(b[1]);
    const scale0 = a[2];
    const scale1 = b[2];
    return (vecCompare(position0, position1) &&
        quatCompare(rotation0, rotation1) &&
        vecCompare(scale0, scale1));
}
exports.packedTransformCompare = packedTransformCompare;
/**
 * @param a - First value
 * @param b - Second value
 * @returns True if the two values are approximately equal
 */
function quatCompare(a, b) {
    return a.dot(b) >= 0.999;
}
exports.quatCompare = quatCompare;
/**
 * @param a - First value
 * @param b - Second value
 * @returns True if the two values are approximately equal
 */
function matCompare(a, b) {
    return a.equal(b);
}
exports.matCompare = matCompare;
/**
 * @param startValue - Start value
 * @param endValue - End value
 * @param startTangent - Start tangent
 * @param endTangent - End tangent
 * @param t - Interpolation amount
 * @returns Interpolated value
 */
function cubicInterpolate(startValue, endValue, startTangent, endTangent, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    return ((2 * t3 - 3 * t2 + 1) * startValue +
        (t3 - 2 * t2 + t) * startTangent +
        (-2 * t3 + 3 * t2) * endValue +
        (t3 - t2) * endTangent);
}
exports.cubicInterpolate = cubicInterpolate;
/**
 * @param startValue - Start value
 * @param endValue - End value
 * @param startTangent - Start tangent
 * @param endTangent - End tangent
 * @param t - Interpolation amount
 * @returns Interpolated value
 */
function vec2CubicInterpolate(startValue, endValue, startTangent, endTangent, t) {
    const newVec = new vec2(0, 0);
    newVec.x = cubicInterpolate(startValue.x, endValue.x, startTangent.x, endTangent.x, t);
    newVec.y = cubicInterpolate(startValue.y, endValue.y, startTangent.y, endTangent.y, t);
    return newVec;
}
exports.vec2CubicInterpolate = vec2CubicInterpolate;
/**
 * @param startValue - Start value
 * @param endValue - End value
 * @param startTangent - Start tangent
 * @param endTangent - End tangent
 * @param t - Interpolation amount
 * @returns Interpolated value
 */
function vec3CubicInterpolate(startValue, endValue, startTangent, endTangent, t) {
    const newVec = new vec3(0, 0, 0);
    newVec.x = cubicInterpolate(startValue.x, endValue.x, startTangent.x, endTangent.x, t);
    newVec.y = cubicInterpolate(startValue.y, endValue.y, startTangent.y, endTangent.y, t);
    newVec.z = cubicInterpolate(startValue.z, endValue.z, startTangent.z, endTangent.z, t);
    return newVec;
}
exports.vec3CubicInterpolate = vec3CubicInterpolate;
/**
 * @param startValue - Start value
 * @param endValue - End value
 * @param startTangent - Start tangent
 * @param endTangent - End tangent
 * @param t - Interpolation amount
 * @returns Interpolated value
 */
function vec4CubicInterpolate(startValue, endValue, startTangent, endTangent, t) {
    const newVec = new vec4(0, 0, 0, 0);
    newVec.x = cubicInterpolate(startValue.x, endValue.x, startTangent.x, endTangent.x, t);
    newVec.y = cubicInterpolate(startValue.y, endValue.y, startTangent.y, endTangent.y, t);
    newVec.z = cubicInterpolate(startValue.z, endValue.z, startTangent.z, endTangent.z, t);
    newVec.w = cubicInterpolate(startValue.w, endValue.w, startTangent.w, endTangent.w, t);
    return newVec;
}
exports.vec4CubicInterpolate = vec4CubicInterpolate;
/**
 * @param startValue - Start value
 * @param endValue - End value
 * @param startTangent - Start tangent
 * @param endTangent - End tangent
 * @param t - Interpolation amount
 * @returns Interpolated value
 */
function squad(startValue, endValue, startTangent, endTangent, t) {
    const slerpP0P1 = quat.slerp(startValue, endValue, t);
    const slerpA0A1 = quat.slerp(startTangent, endTangent, t);
    return quat.slerp(slerpP0P1, slerpA0A1, 2 * t * (1 - t));
}
exports.squad = squad;
/**
 * computes the tangent at point1, when alpha =
 *  0: uniform
 *  0.5: centripetal
 *  1.0: chordal
 * @param point0 - Point 0
 * @param point1 - Point 1
 * @param point2 - Point 2
 * @param alpha - Alpha value
 * @param d0 - Distance between point0 and point1
 * @param d1 - Distance between point1 and point2
 * @returns Tangent value
 */
function tangent(point0, point1, point2, alpha, d0, d1) {
    d0 = d0 || Math.abs(point0 - point1);
    d1 = d1 || Math.abs(point2 - point1);
    const t0 = 0;
    const t1 = t0 + Math.pow(d0, alpha);
    const t2 = t1 + Math.pow(d1, alpha);
    return (((point1 - point0) / (t1 - t0) -
        (point2 - point0) / (t2 - t0) +
        (point2 - point1) / (t2 - t1)) *
        (t2 - t1));
}
exports.tangent = tangent;
/**
 * @param point0 - Point 0
 * @param point1 - Point 1
 * @param point2 - Point 2
 * @param alpha - Alpha value
 * @returns Tangent value
 */
function vec2Tangent(point0, point1, point2, alpha) {
    const d0 = point0.distance(point1);
    const d1 = point1.distance(point2);
    const newVec = new vec2(0, 0);
    newVec.x = tangent(point0.x, point1.x, point2.x, alpha, d0, d1);
    newVec.y = tangent(point0.y, point1.y, point2.y, alpha, d0, d1);
    return newVec;
}
exports.vec2Tangent = vec2Tangent;
/**
 * @param point0 - Point 0
 * @param point1 - Point 1
 * @param point2 - Point 2
 * @param alpha - Alpha value
 * @returns Tangent value
 */
function vec3Tangent(point0, point1, point2, alpha) {
    const d0 = point0.distance(point1);
    const d1 = point1.distance(point2);
    const newVec = new vec3(0, 0, 0);
    newVec.x = tangent(point0.x, point1.x, point2.x, alpha, d0, d1);
    newVec.y = tangent(point0.y, point1.y, point2.y, alpha, d0, d1);
    newVec.z = tangent(point0.z, point1.z, point2.z, alpha, d0, d1);
    return newVec;
}
exports.vec3Tangent = vec3Tangent;
/**
 * @param point0 - Point 0
 * @param point1 - Point 1
 * @param point2 - Point 2
 * @param alpha - Alpha value
 * @returns Tangent value
 */
function vec4Tangent(point0, point1, point2, alpha) {
    const d0 = point0.distance(point1);
    const d1 = point1.distance(point2);
    const newVec = new vec4(0, 0, 0, 0);
    newVec.x = tangent(point0.x, point1.x, point2.x, alpha, d0, d1);
    newVec.y = tangent(point0.y, point1.y, point2.y, alpha, d0, d1);
    newVec.z = tangent(point0.z, point1.z, point2.z, alpha, d0, d1);
    newVec.w = tangent(point0.w, point1.w, point2.w, alpha, d0, d1);
    return newVec;
}
exports.vec4Tangent = vec4Tangent;
/**
 * @param q0 - Quaternion 0
 * @param q1 - Quaternion 1
 * @param q2 - Quaternion 2
 * @returns Inner quadrangle quaternion
 */
function computeInnerQuadrangleQuaternion(q0, q1, q2) {
    const q1Inv = q1.invert();
    const q1Invq0 = q1Inv.multiply(q0);
    q1Invq0.normalize();
    const qa = q1.multiply(quat.slerp(quat.quatIdentity(), q1Invq0, -0.25));
    const q1Invq2 = q1Inv.multiply(q2);
    q1Invq2.normalize();
    const qb = q1.multiply(quat.slerp(quat.quatIdentity(), q1Invq2, -0.25));
    const innerQuadrangle = quat.slerp(qa, qb, 0.5);
    return q1.multiply(innerQuadrangle);
}
exports.computeInnerQuadrangleQuaternion = computeInnerQuadrangleQuaternion;
/**
 * Returns the number between `a` and `b` determined by the ratio `t`
 * @param a - Lower Bound
 * @param b - Upper Bound
 * @param t - Ratio [0-1]
 * @returns Number - between `a` and `b` determined by ratio `t`
 */
function lerp(a, b, t) {
    return a + (b - a) * t;
}
exports.lerp = lerp;
/**
 * @param a - Vector to interpolate from
 * @param b - Vector to interpolate to
 * @param t - Ratio [0-1]
 * @returns Interpolated vector
 */
function vec2Lerp(a, b, t) {
    return vec2.lerp(a, b, t);
}
exports.vec2Lerp = vec2Lerp;
/**
 * @param a - Vector to interpolate from
 * @param b - Vector to interpolate to
 * @param t - Ratio [0-1]
 * @returns Interpolated vector
 */
function vec3Lerp(a, b, t) {
    return vec3.lerp(a, b, t);
}
exports.vec3Lerp = vec3Lerp;
/**
 * @param a - Vector to interpolate from
 * @param b - Vector to interpolate to
 * @param t - Ratio [0-1]
 * @returns Interpolated vector
 */
function vec4Lerp(a, b, t) {
    return vec4.lerp(a, b, t);
}
exports.vec4Lerp = vec4Lerp;
/**
 * @param a - The packed transform to interpolate from
 * @param b - The packed transform to interpolate to
 * @param t - Ratio [0-1]
 * @returns Interpolated packed transform
 */
function packedTransformLerp(a, b, t) {
    const position0 = a[0];
    const position1 = b[0];
    const rotation0 = quatFromVec4(a[1]);
    const rotation1 = quatFromVec4(b[1]);
    const scale0 = a[2];
    const scale1 = b[2];
    return [
        vec4Lerp(position0, position1, t),
        vec4FromQuat(quatSlerp(rotation0, rotation1, t)),
        vec4Lerp(scale0, scale1, t),
    ];
}
exports.packedTransformLerp = packedTransformLerp;
function vec4FromQuat(q) {
    return new vec4(q.x, q.y, q.z, q.w);
}
function quatFromVec4(v) {
    return new quat(v.w, v.x, v.y, v.z);
}
function scaleFromMat4(mat) {
    return new vec3(mat.column0.length, mat.column1.length, mat.column2.length);
}
/**
 * @param a - The quaternion to interpolate from
 * @param b - The quaternion to interpolate to
 * @param t - Ratio [0-1]
 * @returns Interpolated quaternion
 */
function quatSlerp(a, b, t) {
    return quat.slerp(a, b, t);
}
exports.quatSlerp = quatSlerp;
;
global.StorageProperty = StorageProperty;
//# sourceMappingURL=StorageProperty.js.map