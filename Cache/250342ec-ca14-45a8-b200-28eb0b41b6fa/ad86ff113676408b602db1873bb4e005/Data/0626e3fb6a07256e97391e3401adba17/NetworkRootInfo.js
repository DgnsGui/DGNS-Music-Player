"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkRootInfo = void 0;
const SyncKitLogger_1 = require("../Utils/SyncKitLogger");
const EventWrapper_1 = require("./EventWrapper");
const NetworkUtils_1 = require("./NetworkUtils");
const SessionController_1 = require("./SessionController");
const StoreEventWrapper_1 = require("./StoreEventWrapper");
/**
 * Provides information about instantiated prefabs. Exists on a root parent object that instantiated prefabs are spawned underneath.
 * @class
 */
class NetworkRootInfo {
    /**
     * @param {SceneObject} sceneObject SceneObject hosting this NetworkRootInfo.
     * @param {string} networkId Network id of this instantiated object
     * @param {GeneralDataStore} dataStore Store containing information about the prefab instantiation
     * @param {boolean} locallyCreated `true` if this instance was instantiated by the current local user in the current session
     * @param {ConnectedLensModule.UserInfo | null} ownerInfo User that owns this instance, or null if unowned
     * @param {RealtimeStoreCreateOptions.Persistence | keyof typeof RealtimeStoreCreateOptions.Persistence | null} Persistence of the instantiated object
     */
    constructor(sceneObject, networkId, dataStore, locallyCreated, ownerInfo, permissivePersistence) {
        this.sceneObject = sceneObject;
        this.networkId = networkId;
        this.dataStore = dataStore;
        this.locallyCreated = locallyCreated;
        this.ownerInfo = ownerInfo;
        this.log = new SyncKitLogger_1.SyncKitLogger("NetworkRootInfo");
        /** @private */
        this._destroyed = false;
        /**
         * Event triggered when the instantiated object is destroyed (both locally or remotely)
         * @type {EventWrapper<[]>}
         */
        this.onDestroyed = new EventWrapper_1.EventWrapper();
        /**
         * Event triggered when the instantiated object is destroyed (both locally or remotely)
         * @type {EventWrapper<[]>}
         * @deprecated
         */
        this.onDestroy = this.onDestroyed;
        /**
         * @type {EventWrapper<[]>}
         */
        this.onLocalDestroyed = new EventWrapper_1.EventWrapper();
        /**
         * @type {EventWrapper<[]>}
         */
        this.onRemoteDestroyed = new EventWrapper_1.EventWrapper();
        this.persistence = (0, NetworkUtils_1.getPersistenceFromValue)(permissivePersistence);
        const networkedSceneObject = sceneObject;
        networkedSceneObject._isNetworkRoot = true;
        networkedSceneObject._networkRoot = this;
        this.callbacks = new StoreEventWrapper_1.StoreEventWrapper(networkId);
        this.callbacks.onStoreDeleted.add(() => this._onNetworkDestroy());
        this._scriptHolder = this.sceneObject.createComponent("Component.ScriptComponent");
        const destroyEvent = this._scriptHolder.createEvent("OnDestroyEvent");
        destroyEvent.bind(() => this._onLocalDestroy());
    }
    /**
     * Used internally for finishing the NetworkRootInfo setup after the child object has been instantiated
     * @private
     */
    finishSetup() {
        const child = this.sceneObject.getChild(0);
        this.instantiatedObject = child;
        if (this.canIModifyStore()) {
            const scr = child.createComponent("Component.ScriptComponent");
            const sceneObj = this.sceneObject;
            scr.createEvent("OnDestroyEvent").bind(() => {
                if (!this._destroyed) {
                    this.instantiatedObject = null;
                    if (child.hasParent()) {
                        child.removeParent();
                    }
                    sceneObj.destroy();
                }
            });
        }
    }
    /**
     * @private
     */
    _onLocalDestroy() {
        if (!this._destroyed) {
            this._destroyed = true;
            if (this.canIModifyStore()) {
                SessionController_1.SessionController.getInstance()
                    .getSession()
                    .deleteRealtimeStore(this.dataStore, (_store) => { }, (message) => {
                    this.log.e("Error deleting realtime store: " + message);
                });
            }
            this.onLocalDestroyed.trigger();
            this.onDestroyed.trigger();
        }
    }
    /**
     * @private
     */
    _onNetworkDestroy() {
        // global.logToScreen("_on network destroy");
        if (!this._destroyed) {
            this._destroyed = true;
            this.sceneObject.destroy();
            this.onRemoteDestroyed.trigger();
            this.onDestroyed.trigger();
        }
    }
    /**
     * @private
     */
    _cleanup() {
        this.callbacks.cleanup();
        this.callbacks = null;
    }
    /**
     * Returns the owner's userId if an owner exists, otherwise null
     * @returns {string?}
     */
    getOwnerUserId() {
        return this.ownerInfo ? this.ownerInfo.userId : null;
    }
    /**
     * Returns the owner's connectionId if an owner exists, otherwise null
     * @returns {string?}
     */
    getOwnerId() {
        return this.ownerInfo ? this.ownerInfo.connectionId : null;
    }
    /**
     * Returns `true` if the instantiated object is owned by a user with the passed in `connectionId`
     * @param {string} connectionId connectionId of a user
     * @returns {boolean}
     */
    isOwnedBy(connectionId) {
        return this.getOwnerId() && this.getOwnerId() === connectionId;
    }
    /**
     * Returns `true` if the instantiated object is owned by the user connection
     * @param {ConnectedLensModule.UserInfo} user userInfo of a user
     * @returns {boolean}
     */
    isOwnedByUserInfo(user) {
        return this.getOwnerId() && this.getOwnerId() === user.connectionId;
    }
    /**
     * Returns `true` if the local user is allowed to modify this store
     * @returns {boolean}
     */
    canIModifyStore() {
        return (!this.getOwnerId() ||
            this.isOwnedByUserInfo(SessionController_1.SessionController.getInstance().getLocalUserInfo()));
    }
    /**
     * Returns `true` if the local user is allowed to modify this store
     * @returns {boolean}
     */
    doIOwnStore() {
        return this.isOwnedByUserInfo(SessionController_1.SessionController.getInstance().getLocalUserInfo());
    }
}
exports.NetworkRootInfo = NetworkRootInfo;
//# sourceMappingURL=NetworkRootInfo.js.map