"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoragePropLookup = void 0;
const KeyedEventWrapper_1 = require("./KeyedEventWrapper");
const StorageProperty_1 = require("./StorageProperty");
class StoragePropLookup {
    /**
     * @param SyncEntity - syncEntity
     * @param string - prefix
     * @param StorageType - storageType
     */
    constructor(_syncEntity, prefix = "", _storageType) {
        this._syncEntity = _syncEntity;
        this.prefix = prefix;
        this._storageType = _storageType;
        this.propertyDic = new Map();
        this.onChange = new KeyedEventWrapper_1.KeyedEventWrapper();
        this.onAnyChange = new KeyedEventWrapper_1.KeyedEventWrapper();
        this._syncEntity.storeCallbacks.onStoreUpdated.add((session, store, key) => this._onStoreUpdated(session, store, key));
        this._syncEntity.notifyOnReady(() => this._populateFromCurrentStore());
    }
    _onStoreUpdated(_session, _store, key) {
        this._checkAddStoreValue(key);
    }
    /**
     * @param key - The key to add
     * @param startValue - The initial value to apply
     * @returns The property that was added
     */
    addProperty(key, startValue) {
        const newKey = this.prefix + key;
        const existingProp = this._syncEntity.propertySet.getProperty(newKey);
        if (existingProp) {
            this.propertyDic[key] = existingProp;
            return existingProp;
        }
        else {
            const prop = StorageProperty_1.StorageProperty.manual(newKey, this._storageType, startValue);
            this._syncEntity.addStorageProperty(prop);
            this.propertyDic[key] = prop;
            prop.onAnyChange.add((newValue, prevValue) => {
                this.onChange.trigger(key, newValue, prevValue);
            });
            this.onChange.trigger(key, prop.currentValue, undefined);
            return prop;
        }
    }
    _populateFromCurrentStore() {
        // Get all existing keys in store
        const allKeys = this._syncEntity.currentStore.getAllKeys();
        // Set up props based on existing store values
        for (let i = 0; i < allKeys.length; i++) {
            this._checkAddStoreValue(allKeys[i]);
        }
    }
    /**
     * @param key - The key to check
     * @returns The property that was added, or null if no property was added
     */
    _checkAddStoreValue(key) {
        if (key.startsWith(this.prefix)) {
            const id = this._getStorageKeyForKey(key);
            return this.addProperty(id);
        }
    }
    /**
     * @param key - The key to get
     * @returns The property with the given key, or null if no property exists with that key
     */
    getProperty(key) {
        return this.propertyDic[key];
    }
    /**
     * @param key - The key to remove
     * @returns Key used internally for storing the property
     */
    _getStorageKeyForKey(key) {
        return this.removeFromStart(key, this.prefix);
    }
    /**
     * @param text - The text to remove from
     * @param prefix - The prefix to remove
     * @returns - The text with the prefix removed
     */
    removeFromStart(text, prefix) {
        if (text.startsWith(prefix)) {
            return text.slice(prefix.length);
        }
        return text;
    }
}
exports.StoragePropLookup = StoragePropLookup;
// These exports exist for javascript compatibility, and should not be used from typescript code.
;
global.StoragePropLookup = StoragePropLookup;
//# sourceMappingURL=StoragePropLookup.js.map