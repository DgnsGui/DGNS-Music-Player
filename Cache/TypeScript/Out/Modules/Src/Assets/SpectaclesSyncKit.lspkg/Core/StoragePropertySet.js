"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoragePropertySet = void 0;
const SyncKitLogger_1 = require("../Utils/SyncKitLogger");
const StorageProperty_1 = require("./StorageProperty");
const TAG = "StoragePropertySet";
class StoragePropertySet {
    /**
     * Contains a set of {@link StorageProperty | StorageProperties}.
     * @param properties - Storage properties to add to the StoragePropertySet
     */
    constructor(properties) {
        this.log = new SyncKitLogger_1.SyncKitLogger(TAG);
        this.storageProperties = {};
        if (properties) {
            for (let i = 0; i < properties.length; i++) {
                this.addProperty(properties[i]);
            }
        }
    }
    /**
     * Add a property to the set.
     * If a property already exists with the same `key`, this property's `key` will have a number appended to avoid collision, and a warning will be printed.
     * @param property - StorageProperty to add
     * @returns StorageProperty passed in
     */
    addProperty(property) {
        if (property.key in this.storageProperties) {
            const oldKey = property.key;
            property.key += "_" + Object.keys(this.storageProperties).length;
            this.log.w("Duplicate storage key for " + oldKey + ". Renaming to: " + property.key);
        }
        this.storageProperties[property.key] = property;
        return property;
    }
    /**
     * Returns the storage property in this set with a matching `propertyKey`, or `null` if none is found.
     * @param propertyKey - propertyKey to search for
     * @returns StorageProperty with a matching key, or null if none is found
     */
    getProperty(propertyKey) {
        if (propertyKey in this.storageProperties) {
            return this.storageProperties[propertyKey];
        }
        return null;
    }
    /**
     * @param store - The data store to apply the update to.
     * @param key - The key to apply the update to.
     * @param intialValue - The initial value to apply.
     * @param dontTriggerEvents - If true, events will not be triggered.
     * @param updateInfo - Information about the update.
     */
    applyKeyUpdate(store, key, intialValue, dontTriggerEvents, updateInfo) {
        if (key in this.storageProperties) {
            const property = this.storageProperties[key];
            const newValue = StorageProperty_1.StorageProperty.getStoreValueDynamic(store, key, property.propertyType);
            if (intialValue !== null && intialValue !== undefined) {
                property.pendingValue = newValue;
            }
            property.applyRemoteValue(newValue, dontTriggerEvents, updateInfo, intialValue);
        }
    }
    /**
     * @param store - The data store to initialize from.
     * @param dontTriggerEvents - If true, events will not be triggered.
     */
    initializeFromStore(store, dontTriggerEvents) {
        for (const key in this.storageProperties) {
            if (store.has(key)) {
                this.applyKeyUpdate(store, key, true, dontTriggerEvents);
            }
        }
    }
    /**
     * Sends changes to the store for all storage properties in the set.
     * @param store - The data store to send the changes to.
     * @returns True if any changes were sent, false otherwise.
     */
    sendChanges(store, serverTime) {
        let changed = false;
        for (const key in this.storageProperties) {
            const prop = this.storageProperties[key];
            prop.needToSendUpdate =
                prop.checkLocalValueChanged() || prop.needToSendUpdate;
            if (prop.needToSendUpdate) {
                if (prop.checkWithinSendLimit(serverTime)) {
                    prop.needToSendUpdate = false;
                    prop.putCurrentValue(store, serverTime);
                    changed = true;
                }
            }
        }
        return changed;
    }
    /**
     * Receives changes from the store for all storage properties in the set.
     */
    receiveChanges() {
        for (const key in this.storageProperties) {
            const prop = this.storageProperties[key];
            if (!prop.needToSendUpdate) {
                if (prop.isSmoothingEnabled()) {
                    this.storageProperties[key].applySnapshotSmoothing();
                }
                else if (prop.setterFunc &&
                    prop.currentOrPendingValue !== null &&
                    prop.currentOrPendingValue !== undefined) {
                    prop.setterFunc(prop.currentValue);
                }
            }
        }
    }
    /**
     * Sends and receives changes for all storage properties in the set.
     * @param store - The data store to send and receive the changes.
     * @param serverTime - The current server time.
     * @returns True if any changes were sent, false otherwise.
     */
    sendAndReceiveChanges(store, serverTime) {
        const didSendChanges = this.sendChanges(store, serverTime);
        this.receiveChanges();
        return didSendChanges;
    }
    /**
     * @param store - The data store to apply the update to.
     */
    forceWriteState(store) {
        for (const key in this.storageProperties) {
            const prop = this.storageProperties[key];
            if (prop.currentValue !== null && prop.currentValue !== undefined) {
                prop.putCurrentValue(store);
            }
        }
    }
}
exports.StoragePropertySet = StoragePropertySet;
;
global.StoragePropertySet = StoragePropertySet;
//# sourceMappingURL=StoragePropertySet.js.map