"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearTimeout = exports.setTimeout = exports.clearInterval = exports.setInterval = void 0;
// Implement the standard setInterval unction found in typical JS environments
// Note: this isn't entirely standard since it doesn't allow arguments after the time
function setInterval(script, callback, time) {
    let cancelToken = { cancelled: false };
    const interval = () => {
        callback();
        if (!cancelToken.cancelled) {
            setTimeout(script, interval, time);
        }
    };
    setTimeout(script, interval, time);
    // return the event as the "intervalID" used in clearing the event below
    return cancelToken;
}
exports.setInterval = setInterval;
// Implement the standard clearInterval function, expecting the return value from setInterval
function clearInterval(intervalId) {
    if (intervalId !== undefined && intervalId.cancelled !== undefined) {
        intervalId.cancelled = true;
    }
}
exports.clearInterval = clearInterval;
function setTimeout(script, callback, time) {
    let cancelToken = { cancelled: false };
    let delayedEvent = script.createEvent("DelayedCallbackEvent");
    delayedEvent.reset(time / 1000);
    delayedEvent.bind((eventData) => {
        if (!cancelToken.cancelled) {
            callback();
        }
    });
    return cancelToken;
}
exports.setTimeout = setTimeout;
function clearTimeout(timeoutId) {
    if (timeoutId !== undefined && timeoutId.cancelled !== undefined) {
        timeoutId.cancelled = true;
    }
}
exports.clearTimeout = clearTimeout;
//# sourceMappingURL=Timers.js.map