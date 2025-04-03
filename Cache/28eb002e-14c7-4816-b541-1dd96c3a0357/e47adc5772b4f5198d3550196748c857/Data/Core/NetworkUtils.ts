import {SyncKitLogger} from "../Utils/SyncKitLogger"
import {NetworkedSceneObject} from "./NetworkedSceneObject"
import {NetworkMessageWrapper} from "./NetworkMessageWrapper"
import {NetworkRootInfo} from "./NetworkRootInfo"
import {StoreEventWrapper} from "./StoreEventWrapper"

export const NETWORK_ID_KEY = "_network_id"
export const NETWORK_TYPE_KEY = "_network_type"

export type NetworkIdFilter = (store: GeneralDataStore) => boolean

const TAG = "NetworkUtils"
const log = new SyncKitLogger(TAG)

/**
 * Returns `true` if the passed in `sceneObject` has a `NetworkRootInfo` attached to it
 * @param {SceneObject} sceneObject
 * @returns {boolean}
 */
export function isRootObject(sceneObject: SceneObject): boolean {
  let networkedSceneObject = sceneObject as NetworkedSceneObject
  if (networkedSceneObject._isNetworkRoot) {
    return true
  }
  return false
}

/**
 * Recursively searches upwards in the hierarchy to find a `NetworkRootInfo` object.
 * @param {SceneObject} sceneObject
 * @returns {NetworkRootInfo?}
 */
export function findNetworkRoot(
  sceneObject: SceneObject
): NetworkRootInfo | null {
  let networkedSceneObject = sceneObject as NetworkedSceneObject
  if (isRootObject(sceneObject)) {
    return networkedSceneObject._networkRoot
  }
  if (sceneObject.hasParent()) {
    return findNetworkRoot(sceneObject.getParent())
  }
  return null
}

export function isTransform(
  target: Transform | SceneObject | Component
): target is Transform {
  return target.isOfType("Transform")
}

export function isSceneObject(
  target: Transform | SceneObject | Component
): target is SceneObject {
  return target.isOfType("SceneObject")
}

/**
 *
 * @param {Transform|SceneObject|Component} target
 * @returns {SceneObject?}
 */
export function getSceneObjectHelper(
  target: Transform | SceneObject | Component
): SceneObject | null {
  if (isNull(target)) {
    return null
  }
  if (isSceneObject(target)) {
    return target
  }
  if (isTransform(target)) {
    return target.getSceneObject()
  }
  if (target.getSceneObject) {
    return target.getSceneObject()
  }
  return null
}

/**
 * Gets the network id from the data store
 * @param {GeneralDataStore} store
 * @returns {string}
 */
export function getNetworkIdFromStore(store: GeneralDataStore): string {
  return store.getString(NETWORK_ID_KEY)
}

/**
 * Writes the id to the data store
 * @param {GeneralDataStore} store
 * @param {string} id
 */
export function putNetworkIdToStore(store: GeneralDataStore, id: string) {
  store.putString(NETWORK_ID_KEY, id)
}

/**
 * Gets the network type from the data store
 * @param {GeneralDataStore} store
 * @returns {string}
 */
export function getNetworkTypeFromStore(store: GeneralDataStore): string {
  return store.getString(NETWORK_TYPE_KEY)
}

/**
 * Writes the network type to the data store
 * @param {GeneralDataStore} store
 * @param {string} type
 */
export function putNetworkTypeToStore(store: GeneralDataStore, type: string) {
  store.putString(NETWORK_TYPE_KEY, type)
}

/**
 * Helper function to convert from string, or null, to {@link RealtimeStoreCreateOptions.Persistence}
 * @param {PermissivePersistenceType} persistence
 * @returns {RealtimeStoreCreateOptions.Persistence}
 */
export function getPersistenceFromValue(
  persistence?:
    | keyof typeof RealtimeStoreCreateOptions.Persistence
    | RealtimeStoreCreateOptions.Persistence
    | null
): RealtimeStoreCreateOptions.Persistence {
  if (persistence === null || persistence === undefined) {
    return RealtimeStoreCreateOptions.Persistence.Session
  }
  if (typeof persistence === "string") {
    if (persistence in RealtimeStoreCreateOptions.Persistence) {
      persistence = RealtimeStoreCreateOptions.Persistence[persistence]
    } else {
      log.w("Invalid persistence type: " + persistence)
      return RealtimeStoreCreateOptions.Persistence.Session
    }
  }
  return persistence
}

/**
 *
 * @param {any} obj
 * @returns {string}
 */
export function lsJSONStringify(obj: any): string {
  return JSON.stringify(obj, lsJSONReplacer)
}

/**
 *
 * @param {string} text
 * @returns {any}
 */
export function lsJSONParse(text: string): any {
  return JSON.parse(text, lsJSONReviver)
}

// JSON Serialization Helpers

const LS_TYPE_KEY = "___lst"

/**
 * @template T
 * @template {any[]} U
 * @param {new(...args: U) => T} constructorFunc
 * @param {(keyof T)[]} props
 */
export class LSJSONDataConfig<T, U extends any[]> {
  constructor(
    public constructorFunc: new (...args: U) => T,
    public props: (keyof T)[]
  ) {}

  /**
   *
   * @param {T} obj
   * @returns {U}
   */
  getArgs(obj: T): any[] {
    let argumentArray = new Array(this.props.length)
    for (let i = 0; i < this.props.length; i++) {
      argumentArray[i] = obj[this.props[i]]
    }
    return argumentArray
  }

  /**
   *
   * @param {U} args
   * @returns {T}
   */
  construct(args: U): T {
    return new this.constructorFunc(...args)
  }
}

const _lsJSONConfigLookup: {[s: string]: LSJSONDataConfig<any, any>} = {
  vec2: new LSJSONDataConfig(vec2, ["x", "y"]),
  vec3: new LSJSONDataConfig(vec3, ["x", "y", "z"]),
  vec4: new LSJSONDataConfig(vec4, ["x", "y", "z", "w"]),
  quat: new LSJSONDataConfig(quat, ["w", "x", "y", "z"]),
}

/**
 *
 * @param {string} _key
 * @param {any} value
 */
function lsJSONReplacer(_key: string, value: any) {
  if (typeof value === "object") {
    for (let configKey in _lsJSONConfigLookup) {
      const config = _lsJSONConfigLookup[configKey]
      if (value instanceof config.constructorFunc) {
        const data = {} as any
        data[LS_TYPE_KEY] = configKey
        data.a = config.getArgs(value)
        return data
      }
    }
  }
  return value
}

/**
 *
 * @param {string} _key
 * @param {any} value
 */
function lsJSONReviver(_key: string, value: any) {
  if (typeof value === "object") {
    const typeKey = value[LS_TYPE_KEY]
    if (typeKey !== undefined) {
      const config = _lsJSONConfigLookup[typeKey]
      if (config) {
        return config.construct(value.a)
      }
    }
  }
  return value
}

export const NetworkUtils = {
  NetworkRootInfo: NetworkRootInfo,
  StoreEventWrapper: StoreEventWrapper,
  NetworkMessageWrapper: NetworkMessageWrapper,
  isRootObject: isRootObject,
  findNetworkRoot: findNetworkRoot,
  getNetworkIdFromStore: getNetworkIdFromStore,
  putNetworkIdToStore: putNetworkIdToStore,
  getNetworkTypeFromStore: getNetworkTypeFromStore,
  putNetworkTypeToStore: putNetworkTypeToStore,
  getPersistenceFromValue: getPersistenceFromValue,
  lsJSONParse: lsJSONParse,
  lsJSONStringify: lsJSONStringify,
}

// These exports exist for javascript compatibility, and should not be used from typescript code.
;(global as any).networkUtils = NetworkUtils
;(global as any).NETWORK_ID_KEY = NETWORK_ID_KEY
;(global as any).NETWORK_TYPE_KEY = NETWORK_TYPE_KEY
