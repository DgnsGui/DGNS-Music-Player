import {SyncKitLogger} from "../Utils/SyncKitLogger"

const TAG = "EventWrapper"

/**
 * Simple implementation of an event class. Add callbacks to be notified when the event is triggered.
 * @class
 * @template T
 */
export class EventWrapper<T extends any[]> {
  private log = new SyncKitLogger(TAG)

  private _callbacks: ((...args: T) => void)[] = []

  /**
   * Add a callback function to this event. The callback function will be executed when this event is triggered.
   * @param {(...args: T) => void} callback Callback function to execute
   */
  add(callback: (...args: T) => void): (...args: T) => void {
    if (typeof callback === "function") {
      this._callbacks.push(callback)
      return callback
    } else {
      throw "Trying to add invalid callback type to EventWrapper. You must add a function."
    }
  }

  /**
   * Remove a callback function from this event.
   * @param {(...args:T) => void} callback Callback function to remove
   */
  remove(callback: (...args: T) => void): void {
    const ind = this._callbacks.indexOf(callback)
    if (ind > -1) {
      this._callbacks.splice(ind, 1)
    } else {
      this.log.e(
        "Trying to remove callback from EventWrapper, but the callback hasn't been added."
      )
    }
  }

  /**
   * Trigger the event so that all callbacks are executed.
   * All arguments given will be passed to the callbacks.
   * @param {T} args Arguments to pass to callbacks
   */
  trigger(...args: T): void {
    const callbacks = this._callbacks.slice()
    for (let i = 0; i < callbacks.length; i++) {
      callbacks[i](...args)
    }
  }
}
// These exports exist for javascript compatibility, and should not be used from typescript code.
;(global as any).EventWrapper = EventWrapper
