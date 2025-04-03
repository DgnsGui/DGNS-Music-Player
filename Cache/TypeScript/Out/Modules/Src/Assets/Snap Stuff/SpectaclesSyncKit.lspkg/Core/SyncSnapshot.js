"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnapshotBuffer = exports.SnapshotBufferOptions = exports.SyncSnapshot = void 0;
const SyncKitLogger_1 = require("../Utils/SyncKitLogger");
const StorageTypes_1 = require("./StorageTypes");
const TAG = "SnapshotBuffer";
class SyncSnapshot {
    /**
     * @param timestamp - Time in seconds
     * @param value - Value to store
     */
    constructor(timestamp, value) {
        this.time = timestamp;
        this.value = value;
    }
}
exports.SyncSnapshot = SyncSnapshot;
class SnapshotBufferOptions {
    constructor(optionDic) {
        if (optionDic) {
            for (const k in optionDic) {
                if (Object.prototype.hasOwnProperty.call(optionDic, k)) {
                    this[k] = optionDic[k];
                }
            }
        }
    }
}
exports.SnapshotBufferOptions = SnapshotBufferOptions;
/**
 * Used to track received network values and interpolate based on timestamps.
 */
class SnapshotBuffer {
    /**
     * @param options - Options for the buffer
     */
    constructor(options) {
        this.log = new SyncKitLogger_1.SyncKitLogger(TAG);
        this._lerpBuffer = null;
        options = options || {};
        this.snapshots = [];
        this.size = options.size === undefined ? 20 : options.size;
        this.interpolationTarget =
            options.interpolationTarget === undefined
                ? -0.25
                : options.interpolationTarget;
        this.allowExtrapolation = false;
        this.lerpFunc = options.lerpFunc;
        this.mostRecentValue = null;
        this._storageType = options.storageType;
        this._isArrayType = false;
        this._lerpBuffer;
        if (this._storageType) {
            this._isArrayType = (0, StorageTypes_1.isArrayType)(this._storageType);
            if (!this.lerpFunc) {
                const baseType = (0, StorageTypes_1.getBaseStorageType)(this._storageType);
                this.lerpFunc = (0, StorageTypes_1.getLerpForStorageType)(baseType);
            }
        }
    }
    /**
     * @param options - Options for the buffer
     * @returns SnapshotBuffer
     */
    static createFromOptions(options) {
        return new SnapshotBuffer(options);
    }
    /**
     * @param timestamp - Time in local seconds
     * @param value - Value to store
     * @returns Snapshot of the value
     */
    saveSnapshot(timestamp, value) {
        // TODO: use a circular buffer
        if (this.snapshots.length >= this.size) {
            this.snapshots.shift();
        }
        if (this.snapshots.length > 0 &&
            this.snapshots[this.snapshots.length - 1].time > timestamp) {
            this.log.w("Recieved timestamp out of order: " +
                this.snapshots[this.snapshots.length - 1].time +
                ">" +
                timestamp);
            return;
        }
        // TODO: pool and reuse snapshots
        const newValue = value;
        const snapshot = new SyncSnapshot(timestamp, newValue);
        this.snapshots.push(snapshot);
        return snapshot;
    }
    /**
     * @param timestamp - Time in seconds
     * @returns The index of the snapshot before the given timestamp
     */
    findNearestIndexBefore(timestamp) {
        for (let i = this.snapshots.length - 1; i >= 0; i--) {
            if (this.snapshots[i].time < timestamp) {
                return i;
            }
        }
        return -1;
    }
    /**
     * @param currentTime - Time in seconds
     * @param value - Value to set
     * @returns Snapshot of the value
     */
    setCurrentValue(currentTime, value) {
        this.snapshots = [];
        this.mostRecentValue = value;
        return this.saveSnapshot(currentTime, value);
    }
    /**
     * @returns Most recent value
     */
    getMostRecentValue() {
        return this.mostRecentValue;
    }
    /**
     * @param timestamp - Time in seconds
     * @returns Value at the given time
     */
    getLerpedValue(timestamp) {
        const beforeInd = this.findNearestIndexBefore(timestamp);
        if (beforeInd === -1) {
            return null;
        }
        let before = this.snapshots[beforeInd];
        let after = null;
        // Check if we can interpolate
        if (beforeInd < this.snapshots.length - 1) {
            after = this.snapshots[beforeInd + 1];
            const t = inverseLerp(before.time, after.time, timestamp);
            this.mostRecentValue = this.lerpSnapshots(before, after, t);
        }
        else {
            // We have to extrapolate
            if (this.allowExtrapolation && beforeInd > 0) {
                after = before;
                before = this.snapshots[beforeInd - 1];
                const extrapolateT = inverseLerp(before.time, after.time, timestamp);
                this.mostRecentValue = this.lerpSnapshots(before, after, extrapolateT);
            }
            this.mostRecentValue = before.value;
        }
        return this.mostRecentValue;
    }
    /**
     * @param a - Snapshot to interpolate from
     * @param b - Snapshot to interpolate to
     * @param t - Time delta
     * @returns Interpolated value
     */
    lerpSnapshots(a, b, t) {
        if (!this.lerpFunc) {
            this.log.e("Missing lerp func");
            return b.value;
        }
        if (this._isArrayType) {
            const arrayValue = a.value;
            if (!this._lerpBuffer || this._lerpBuffer.length !== arrayValue.length) {
                this._lerpBuffer = new Array(arrayValue.length);
            }
            for (let i = 0; i < arrayValue.length; i++) {
                this._lerpBuffer[i] = this.lerpFunc(a.value[i], b.value[i], t);
            }
            return this._lerpBuffer;
        }
        else {
            return this.lerpFunc(a.value, b.value, t);
        }
    }
}
exports.SnapshotBuffer = SnapshotBuffer;
/**
 * @param min - Min value
 * @param max - Max value
 * @param value - Value to interpolate
 * @returns Interpolated value
 */
function inverseLerp(min, max, value) {
    return (value - min) / (max - min);
}
//# sourceMappingURL=SyncSnapshot.js.map