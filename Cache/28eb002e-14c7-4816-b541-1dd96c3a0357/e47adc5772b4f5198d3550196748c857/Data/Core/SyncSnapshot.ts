import {SyncKitLogger} from "../Utils/SyncKitLogger"
import {ValidStorageType} from "./StorageType"
import {
  getBaseStorageType,
  getLerpForStorageType,
  isArrayType,
} from "./StorageTypes"

const TAG = "SnapshotBuffer"

export class SyncSnapshot<T> {
  time: number
  value: T

  /**
   * @param timestamp - Time in seconds
   * @param value - Value to store
   */
  constructor(timestamp: number, value: T) {
    this.time = timestamp
    this.value = value
  }
}

/**
 * @param storageType - Type of storage to use for interpolation
 * @param interpolationTarget - Time delta in local seconds to target (default = -0.25)
 * @param lerpFunc - Function used for interpolating
 * @param size - Max number of snapshots stored (default = 20)
 */
export type SnapshotBufferOptionsObj<T extends ValidStorageType> = {
  storageType?: ValidStorageType
  interpolationTarget?: number
  lerpFunc?: (a: T, b: T, t: number) => T
  size?: number
}

export class SnapshotBufferOptions<T extends ValidStorageType> {
  storageType: ValidStorageType | null
  interpolationTarget: number | null
  lerpFunc: ((a: T, b: T, t: number) => T) | null
  size: number | null

  constructor(optionDic: SnapshotBufferOptionsObj<T>) {
    if (optionDic) {
      for (const k in optionDic) {
        if (Object.prototype.hasOwnProperty.call(optionDic, k)) {
          this[k] = optionDic[k]
        }
      }
    }
  }
}

/**
 * Used to track received network values and interpolate based on timestamps.
 */
export class SnapshotBuffer<T extends ValidStorageType> {
  private log = new SyncKitLogger(TAG)

  private snapshots: SyncSnapshot<T>[]
  private size: number
  interpolationTarget: number
  private allowExtrapolation: boolean
  private lerpFunc: (a: T, b: T, t: number) => T
  private mostRecentValue: T | null
  private _storageType: ValidStorageType | null
  private _isArrayType: boolean
  private _lerpBuffer: ValidStorageType[] | null = null

  /**
   * @param options - Options for the buffer
   */
  constructor(
    options?: SnapshotBufferOptions<T> | SnapshotBufferOptionsObj<T>
  ) {
    options = options || {}

    this.snapshots = []
    this.size = options.size === undefined ? 20 : options.size
    this.interpolationTarget =
      options.interpolationTarget === undefined
        ? -0.25
        : options.interpolationTarget
    this.allowExtrapolation = false
    this.lerpFunc = options.lerpFunc
    this.mostRecentValue = null
    this._storageType = options.storageType
    this._isArrayType = false
    this._lerpBuffer

    if (this._storageType) {
      this._isArrayType = isArrayType(this._storageType)
      if (!this.lerpFunc) {
        const baseType = getBaseStorageType(this._storageType)
        this.lerpFunc = getLerpForStorageType(baseType)
      }
    }
  }

  /**
   * @param options - Options for the buffer
   * @returns SnapshotBuffer
   */
  static createFromOptions<U extends ValidStorageType>(
    options?: SnapshotBufferOptions<U> | SnapshotBufferOptionsObj<U>
  ): SnapshotBuffer<U> {
    return new SnapshotBuffer<U>(options)
  }

  /**
   * @param timestamp - Time in local seconds
   * @param value - Value to store
   * @returns Snapshot of the value
   */
  saveSnapshot(timestamp: number, value: T | undefined): SyncSnapshot<T> {
    // TODO: use a circular buffer
    if (this.snapshots.length >= this.size) {
      this.snapshots.shift()
    }
    if (
      this.snapshots.length > 0 &&
      this.snapshots[this.snapshots.length - 1].time > timestamp
    ) {
      this.log.w(
        "Recieved timestamp out of order: " +
          this.snapshots[this.snapshots.length - 1].time +
          ">" +
          timestamp
      )
      return
    }
    // TODO: pool and reuse snapshots
    const newValue = value
    const snapshot = new SyncSnapshot(timestamp, newValue)
    this.snapshots.push(snapshot)
    return snapshot
  }

  /**
   * @param timestamp - Time in seconds
   * @returns The index of the snapshot before the given timestamp
   */
  private findNearestIndexBefore(timestamp: number): number {
    for (let i = this.snapshots.length - 1; i >= 0; i--) {
      if (this.snapshots[i].time < timestamp) {
        return i
      }
    }
    return -1
  }

  /**
   * @param currentTime - Time in seconds
   * @param value - Value to set
   * @returns Snapshot of the value
   */
  setCurrentValue(currentTime: number, value: T): SyncSnapshot<T> {
    this.snapshots = []
    this.mostRecentValue = value
    return this.saveSnapshot(currentTime, value)
  }

  /**
   * @returns Most recent value
   */
  getMostRecentValue(): T | null {
    return this.mostRecentValue
  }

  /**
   * @param timestamp - Time in seconds
   * @returns Value at the given time
   */
  getLerpedValue(timestamp: number): T | null {
    const beforeInd = this.findNearestIndexBefore(timestamp)
    if (beforeInd === -1) {
      return null
    }

    let before: SyncSnapshot<T> = this.snapshots[beforeInd]
    let after: SyncSnapshot<T> | null = null

    // Check if we can interpolate
    if (beforeInd < this.snapshots.length - 1) {
      after = this.snapshots[beforeInd + 1]
      const t = inverseLerp(before.time, after.time, timestamp)
      this.mostRecentValue = this.lerpSnapshots(before, after, t)
    } else {
      // We have to extrapolate
      if (this.allowExtrapolation && beforeInd > 0) {
        after = before
        before = this.snapshots[beforeInd - 1]
        const extrapolateT = inverseLerp(before.time, after.time, timestamp)
        this.mostRecentValue = this.lerpSnapshots(before, after, extrapolateT)
      }
      this.mostRecentValue = before.value
    }

    return this.mostRecentValue
  }

  /**
   * @param a - Snapshot to interpolate from
   * @param b - Snapshot to interpolate to
   * @param t - Time delta
   * @returns Interpolated value
   */
  private lerpSnapshots(a: SyncSnapshot<T>, b: SyncSnapshot<T>, t: number): T {
    if (!this.lerpFunc) {
      this.log.e("Missing lerp func")
      return b.value
    }
    if (this._isArrayType) {
      const arrayValue = a.value as ValidStorageType[]
      if (!this._lerpBuffer || this._lerpBuffer.length !== arrayValue.length) {
        this._lerpBuffer = new Array(arrayValue.length)
      }
      for (let i = 0; i < arrayValue.length; i++) {
        this._lerpBuffer[i] = this.lerpFunc(a.value[i], b.value[i], t)
      }
      return this._lerpBuffer as T
    } else {
      return this.lerpFunc(a.value, b.value, t)
    }
  }
}

/**
 * @param min - Min value
 * @param max - Max value
 * @param value - Value to interpolate
 * @returns Interpolated value
 */
function inverseLerp(min: number, max: number, value: number) {
  return (value - min) / (max - min)
}
