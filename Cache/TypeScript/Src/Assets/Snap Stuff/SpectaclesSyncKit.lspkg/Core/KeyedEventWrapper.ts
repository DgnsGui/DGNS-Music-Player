import {SyncKitLogger} from "../Utils/SyncKitLogger"
import {EventWrapper} from "./EventWrapper"

const TAG = "KeyedEventWrapper"

/**
 * Simple implementation of a key-based event class.
 * @class
 */
export class KeyedEventWrapper<T extends any[]> {
  private log = new SyncKitLogger(TAG)

  /**
   * @private
   * @type {Map<string, EventWrapper<T>}
   * */
  private _wrappers: Map<string, EventWrapper<T>> = new Map<
    string,
    EventWrapper<T>
  >()

  /**
   * @private
   * @type {EventWrapper<[string, ...T]>}
   * */
  private _any: EventWrapper<[string, ...T]> = new EventWrapper<
    [string, ...T]
  >()

  /**
   * Return an EventWrapper for the given `key`.
   * The EventWrapper holds all callbacks added with the same `key`, and is triggered when `trigger` is called with the same `key`.
   * @param {string} key Key
   * @param {boolean=} createIfMissing If the wrapper is missing, a new one will be created.
   * @returns {EventWrapper<T0, T1, T2, T3>?}
   */
  getWrapper(key: string, createIfMissing?: boolean): EventWrapper<T> | null {
    let wrapper = this._wrappers[key]
    if (!wrapper && createIfMissing) {
      wrapper = new EventWrapper()
      this._wrappers[key] = wrapper
    }
    return wrapper || null
  }

  /**
   * Add a callback function tied to the given `key`.
   * The callback function will be executed when this KeyedEventWrapper is triggered using the same `key`.
   * @param {string} key Key
   * @param {(...args:T) => void} callback Callback function to execute
   * @returns {(...args:T) => void} Callback passed in, can be used with `remove()`
   */
  add(key: string, callback: (...args: T) => void): (...args: T) => void {
    return this.getWrapper(key, true).add(callback)
  }

  /**
   * Remove a callback function tied to the given `key`.
   * @param {string} key Key that was used to add the callback function
   * @param {(...args:T) => void} callback Callback function to remove
   */
  remove(key: string, callback: (...args: T) => void): void {
    const wrapper = this.getWrapper(key)
    if (wrapper) {
      wrapper.remove(callback)
    } else {
      this.log.e(
        "Trying to remove callback from KeyedEventWrapper, but key hasn't been subscribed to: " +
          key
      )
    }
  }

  /**
   * Add a callback function that will be executed any time a trigger occurs.
   * The first argument for the callback function is the key, the rest of the arguments are what get passed to the trigger.
   * @param {(...args:T) => void} callback Callback function to execute
   * @returns {(...args:T) => void} Callback passed in, can be used with `removeAny()`
   */
  addAny(
    callback: (key: string, ...args: T) => void
  ): (key: string, ...args: T) => void {
    return this._any.add(callback)
  }

  /**
   * Remove a callback function that was added using `addAny()`.
   * @param {(...args:T) => void} callback Callback function to remove
   */
  removeAny(callback: (key: string, ...args: T) => void): void {
    this._any.remove(callback)
  }

  /**
   * Trigger all callback functions that were added using the same `key`.
   * All arguments after `key` will be passed to the callback functions.
   * @param {string} key Key of the events to trigger
   * @param {...T} args Arguments to pass to callbacks
   */
  trigger(key: string, ...args: T): void {
    const wrapper = this.getWrapper(key)
    if (wrapper) {
      wrapper.trigger(...args)
    }
    this._any.trigger(key, ...args)
  }
}

// These exports exist for javascript compatibility, and should not be used from typescript code.
;(global as any).KeyedEventWrapper = KeyedEventWrapper
