"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyedEventWrapper = void 0;
const SyncKitLogger_1 = require("../Utils/SyncKitLogger");
const EventWrapper_1 = require("./EventWrapper");
const TAG = "KeyedEventWrapper";
/**
 * Simple implementation of a key-based event class.
 * @class
 */
class KeyedEventWrapper {
    constructor() {
        this.log = new SyncKitLogger_1.SyncKitLogger(TAG);
        /**
         * @private
         * @type {Map<string, EventWrapper<T>}
         * */
        this._wrappers = new Map();
        /**
         * @private
         * @type {EventWrapper<[string, ...T]>}
         * */
        this._any = new EventWrapper_1.EventWrapper();
    }
    /**
     * Return an EventWrapper for the given `key`.
     * The EventWrapper holds all callbacks added with the same `key`, and is triggered when `trigger` is called with the same `key`.
     * @param {string} key Key
     * @param {boolean=} createIfMissing If the wrapper is missing, a new one will be created.
     * @returns {EventWrapper<T0, T1, T2, T3>?}
     */
    getWrapper(key, createIfMissing) {
        let wrapper = this._wrappers[key];
        if (!wrapper && createIfMissing) {
            wrapper = new EventWrapper_1.EventWrapper();
            this._wrappers[key] = wrapper;
        }
        return wrapper || null;
    }
    /**
     * Add a callback function tied to the given `key`.
     * The callback function will be executed when this KeyedEventWrapper is triggered using the same `key`.
     * @param {string} key Key
     * @param {(...args:T) => void} callback Callback function to execute
     * @returns {(...args:T) => void} Callback passed in, can be used with `remove()`
     */
    add(key, callback) {
        return this.getWrapper(key, true).add(callback);
    }
    /**
     * Remove a callback function tied to the given `key`.
     * @param {string} key Key that was used to add the callback function
     * @param {(...args:T) => void} callback Callback function to remove
     */
    remove(key, callback) {
        const wrapper = this.getWrapper(key);
        if (wrapper) {
            wrapper.remove(callback);
        }
        else {
            this.log.e("Trying to remove callback from KeyedEventWrapper, but key hasn't been subscribed to: " +
                key);
        }
    }
    /**
     * Add a callback function that will be executed any time a trigger occurs.
     * The first argument for the callback function is the key, the rest of the arguments are what get passed to the trigger.
     * @param {(...args:T) => void} callback Callback function to execute
     * @returns {(...args:T) => void} Callback passed in, can be used with `removeAny()`
     */
    addAny(callback) {
        return this._any.add(callback);
    }
    /**
     * Remove a callback function that was added using `addAny()`.
     * @param {(...args:T) => void} callback Callback function to remove
     */
    removeAny(callback) {
        this._any.remove(callback);
    }
    /**
     * Trigger all callback functions that were added using the same `key`.
     * All arguments after `key` will be passed to the callback functions.
     * @param {string} key Key of the events to trigger
     * @param {...T} args Arguments to pass to callbacks
     */
    trigger(key, ...args) {
        const wrapper = this.getWrapper(key);
        if (wrapper) {
            wrapper.trigger(...args);
        }
        this._any.trigger(key, ...args);
    }
}
exports.KeyedEventWrapper = KeyedEventWrapper;
// These exports exist for javascript compatibility, and should not be used from typescript code.
;
global.KeyedEventWrapper = KeyedEventWrapper;
//# sourceMappingURL=KeyedEventWrapper.js.map