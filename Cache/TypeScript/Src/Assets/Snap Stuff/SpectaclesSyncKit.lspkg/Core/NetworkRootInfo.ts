import {SyncKitLogger} from "../Utils/SyncKitLogger"
import {EventWrapper} from "./EventWrapper"
import {NetworkedSceneObject} from "./NetworkedSceneObject"
import {getPersistenceFromValue} from "./NetworkUtils"
import {SessionController} from "./SessionController"
import {StoreEventWrapper} from "./StoreEventWrapper"

/**
 * Provides information about instantiated prefabs. Exists on a root parent object that instantiated prefabs are spawned underneath.
 * @class
 */
export class NetworkRootInfo {
  private log = new SyncKitLogger("NetworkRootInfo")

  readonly persistence: RealtimeStoreCreateOptions.Persistence

  /**
   * The instantiated SceneObject. Exists as a child of this SceneObject.
   * @type {SceneObject}
   */
  instantiatedObject: SceneObject

  /** @private */
  private _destroyed = false

  /**
   * Event triggered when the instantiated object is destroyed (both locally or remotely)
   * @type {EventWrapper<[]>}
   */
  onDestroyed: EventWrapper<[]> = new EventWrapper()

  /**
   * Event triggered when the instantiated object is destroyed (both locally or remotely)
   * @type {EventWrapper<[]>}
   * @deprecated
   */
  onDestroy: EventWrapper<[]> = this.onDestroyed

  /**
   * @type {EventWrapper<[]>}
   */
  onLocalDestroyed: EventWrapper<[]> = new EventWrapper()

  /**
   * @type {EventWrapper<[]>}
   */
  onRemoteDestroyed: EventWrapper<[]> = new EventWrapper()

  /**
   * Helper callbacks related to the data store
   * @type {StoreEventWrapper}
   */
  callbacks: StoreEventWrapper

  /**
   * @private
   * @type {ScriptComponent}
   */
  private _scriptHolder: ScriptComponent

  /**
   * @param {SceneObject} sceneObject SceneObject hosting this NetworkRootInfo.
   * @param {string} networkId Network id of this instantiated object
   * @param {GeneralDataStore} dataStore Store containing information about the prefab instantiation
   * @param {boolean} locallyCreated `true` if this instance was instantiated by the current local user in the current session
   * @param {ConnectedLensModule.UserInfo | null} ownerInfo User that owns this instance, or null if unowned
   * @param {RealtimeStoreCreateOptions.Persistence | keyof typeof RealtimeStoreCreateOptions.Persistence | null} Persistence of the instantiated object
   */
  constructor(
    public readonly sceneObject: SceneObject,
    public readonly networkId: string,
    public readonly dataStore: GeneralDataStore,
    public readonly locallyCreated: boolean,
    public readonly ownerInfo: ConnectedLensModule.UserInfo | null,
    permissivePersistence?: RealtimeStoreCreateOptions.Persistence
  ) {
    this.persistence = getPersistenceFromValue(permissivePersistence)

    const networkedSceneObject = sceneObject as NetworkedSceneObject

    networkedSceneObject._isNetworkRoot = true
    networkedSceneObject._networkRoot = this

    this.callbacks = new StoreEventWrapper(networkId)

    this.callbacks.onStoreDeleted.add(() => this._onNetworkDestroy())

    this._scriptHolder = this.sceneObject.createComponent(
      "Component.ScriptComponent"
    )

    const destroyEvent = this._scriptHolder.createEvent("OnDestroyEvent")
    destroyEvent.bind(() => this._onLocalDestroy())
  }

  /**
   * Used internally for finishing the NetworkRootInfo setup after the child object has been instantiated
   * @private
   */
  finishSetup() {
    const child = this.sceneObject.getChild(0)
    this.instantiatedObject = child
    if (this.canIModifyStore()) {
      const scr = child.createComponent("Component.ScriptComponent")
      const sceneObj = this.sceneObject
      scr.createEvent("OnDestroyEvent").bind(() => {
        if (!this._destroyed) {
          this.instantiatedObject = null
          if (child.hasParent()) {
            child.removeParent()
          }
          sceneObj.destroy()
        }
      })
    }
  }

  /**
   * @private
   */
  private _onLocalDestroy() {
    if (!this._destroyed) {
      this._destroyed = true
      if (this.canIModifyStore()) {
        SessionController.getInstance()
          .getSession()
          .deleteRealtimeStore(
            this.dataStore,
            (_store) => {},
            (message) => {
              this.log.e("Error deleting realtime store: " + message)
            }
          )
      }
      this.onLocalDestroyed.trigger()
      this.onDestroyed.trigger()
    }
  }

  /**
   * @private
   */
  private _onNetworkDestroy() {
    // global.logToScreen("_on network destroy");
    if (!this._destroyed) {
      this._destroyed = true
      this.sceneObject.destroy()
      this.onRemoteDestroyed.trigger()
      this.onDestroyed.trigger()
    }
  }

  /**
   * @private
   */
  private _cleanup() {
    this.callbacks.cleanup()
    this.callbacks = null
  }

  /**
   * Returns the owner's userId if an owner exists, otherwise null
   * @returns {string?}
   */
  getOwnerUserId(): string | null {
    return this.ownerInfo ? this.ownerInfo.userId : null
  }

  /**
   * Returns the owner's connectionId if an owner exists, otherwise null
   * @returns {string?}
   */
  getOwnerId(): string | null {
    return this.ownerInfo ? this.ownerInfo.connectionId : null
  }

  /**
   * Returns `true` if the instantiated object is owned by a user with the passed in `connectionId`
   * @param {string} connectionId connectionId of a user
   * @returns {boolean}
   */
  isOwnedBy(connectionId: string): boolean {
    return this.getOwnerId() && this.getOwnerId() === connectionId
  }

  /**
   * Returns `true` if the instantiated object is owned by the user connection
   * @param {ConnectedLensModule.UserInfo} user userInfo of a user
   * @returns {boolean}
   */
  isOwnedByUserInfo(user: ConnectedLensModule.UserInfo): boolean {
    return this.getOwnerId() && this.getOwnerId() === user.connectionId
  }

  /**
   * Returns `true` if the local user is allowed to modify this store
   * @returns {boolean}
   */
  canIModifyStore(): boolean {
    return (
      !this.getOwnerId() ||
      this.isOwnedByUserInfo(SessionController.getInstance().getLocalUserInfo())
    )
  }

  /**
   * Returns `true` if the local user is allowed to modify this store
   * @returns {boolean}
   */
  doIOwnStore(): boolean {
    return this.isOwnedByUserInfo(
      SessionController.getInstance().getLocalUserInfo()
    )
  }
}
