"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionController = exports.ColocatedBuildStatus = exports.StoreInfo = void 0;
const Singleton_1 = require("../SpectaclesInteractionKit/Decorators/Singleton");
const WorldCameraFinderProvider_1 = require("../SpectaclesInteractionKit/Providers/CameraProvider/WorldCameraFinderProvider");
const SyncKitLogger_1 = require("../Utils/SyncKitLogger");
const EventWrapper_1 = require("./EventWrapper");
const MockMultiplayerSession_1 = require("./MockMultiplayerSession");
const MockMultiplayerSessionConfig_1 = require("./MockMultiplayerSessionConfig");
const NetworkUtils_1 = require("./NetworkUtils");
var State;
(function (State) {
    State[State["NotInitialized"] = 0] = "NotInitialized";
    State[State["Initialized"] = 1] = "Initialized";
    State[State["Ready"] = 2] = "Ready";
    State[State["WaitingForInvite"] = 3] = "WaitingForInvite";
})(State || (State = {}));
class StoreInfo {
    constructor(store, ownerInfo, creationInfo) {
        this.store = store;
        this.ownerInfo = ownerInfo;
        this.creationInfo = creationInfo;
    }
}
exports.StoreInfo = StoreInfo;
const SESSION_STORE_ID = "__session";
const COLOCATED_BUILD_STATUS_KEY = "_colocated_build_status";
const COLOCATED_MAP_ID = "_colocated_map_id";
const TAG = "SessionController";
var ColocatedBuildStatus;
(function (ColocatedBuildStatus) {
    ColocatedBuildStatus["None"] = "none";
    ColocatedBuildStatus["Building"] = "building";
    ColocatedBuildStatus["Built"] = "built";
})(ColocatedBuildStatus || (exports.ColocatedBuildStatus = ColocatedBuildStatus = {}));
let SessionController = class SessionController {
    constructor() {
        this.log = new SyncKitLogger_1.SyncKitLogger(TAG);
        this.isConfigured = false;
        this.script = null;
        this.shouldInitialize = false;
        this.connectedLensModuleToUse = null;
        this.locationCloudStorageModule = null;
        this.skipUiInStudio = null;
        this.isColocated = null;
        this.locatedAtComponent = null;
        this.landmarksVisual3d = null;
        this.worldCamera = WorldCameraFinderProvider_1.default.getInstance();
        this.deviceTrackingComponent = this.worldCamera
            .getComponent()
            .getSceneObject()
            .getComponent("Component.DeviceTracking");
        this.eventFlowState = {
            inviteSent: false,
            connected: false,
            shared: false,
            // Session Store
            isWaitingForSessionStore: false,
            // Colocated
            isColocatedSetupStarted: false,
            isColocatedSetupFinished: false,
        };
        this._state = State.NotInitialized;
        this._session = null;
        this._mappingSession = null;
        this._users = [];
        this._userIdLookup = new Map();
        this._connectionIdLookup = new Map();
        this._sessionCreationType = null;
        this._localUserId = null;
        this._localConnectionId = null;
        this._localDisplayName = null;
        this._localUserInfo = null;
        this._hostUserId = null;
        this._hostConnectionId = null;
        this._hostDisplayName = null;
        this._hostUserInfo = null;
        this._storeInfos = [];
        this._storeLookup = new Map();
        this._requireSessionStore = null;
        this._isReady = false;
        this._hasSentReady = false;
        this._hasSentMapExists = false;
        this._hasSentColocatedMapId = false;
        this._isLocatedAtFound = false;
        this._isSingleplayer = false;
        this._isUserMapper = false;
        /**
         * @type {EventWrapper<[]>}
         */
        this.onReady = new EventWrapper_1.EventWrapper();
        /**
         * @type {EventWrapper<[]>}
         */
        this.onStartColocated = new EventWrapper_1.EventWrapper();
        /**
         * @type {EventWrapper<[]>}
         */
        this.onMapExists = new EventWrapper_1.EventWrapper();
        /**
         * @type {EventWrapper<[]>}
         */
        this.onLocationId = new EventWrapper_1.EventWrapper();
        /**
         * @type {EventWrapper<[MultiplayerSession, ConnectedLensSessionOptions.SessionCreationType]>}
         */
        this.onSessionCreated = new EventWrapper_1.EventWrapper();
        /**
         * @type {EventWrapper<[MultiplayerSession]>}
         */
        this.onSessionShared = new EventWrapper_1.EventWrapper();
        /**
         * @type {EventWrapper<[MultiplayerSession, ConnectedLensModule.ConnectionInfo]>}
         */
        this.onConnected = new EventWrapper_1.EventWrapper();
        /**
         * @type {EventWrapper<[MultiplayerSession, string]>}
         */
        this.onDisconnected = new EventWrapper_1.EventWrapper();
        /**
         * @type {EventWrapper<[session: MultiplayerSession, string, string, ConnectedLensModule.UserInfo]>}
         */
        this.onMessageReceived = new EventWrapper_1.EventWrapper();
        /**
         * @type {EventWrapper<[MultiplayerSession, ConnectedLensModule.UserInfo]>}
         */
        this.onUserJoinedSession = new EventWrapper_1.EventWrapper();
        /**
         * @type {EventWrapper<[MultiplayerSession, ConnectedLensModule.UserInfo]>}
         */
        this.onUserLeftSession = new EventWrapper_1.EventWrapper();
        /**
         * @type {EventWrapper<[MultiplayerSession, ConnectedLensModule.HostUpdateInfo]>}
         */
        this.onHostUpdated = new EventWrapper_1.EventWrapper();
        /**
         * @type {EventWrapper<[MultiplayerSession, string, string]>}
         */
        this.onError = new EventWrapper_1.EventWrapper();
        /**
         * @type {EventWrapper<[]>}
         */
        this.onConnectionFailed = new EventWrapper_1.EventWrapper();
        /**
         * @type {EventWrapper<[MultiplayerSession, GeneralDataStore, ConnectedLensModule.UserInfo, ConnectedLensModule.RealtimeStoreCreationInfo]>}
         */
        this.onRealtimeStoreCreated = new EventWrapper_1.EventWrapper();
        /**
         * @type {EventWrapper<[MultiplayerSession, GeneralDataStore, string, ConnectedLensModule.RealtimeStoreUpdateInfo=]>}
         */
        this.onRealtimeStoreUpdated = new EventWrapper_1.EventWrapper();
        /**
         * @type {EventWrapper<[MultiplayerSession, GeneralDataStore, ConnectedLensModule.RealtimeStoreDeleteInfo]>}
         */
        this.onRealtimeStoreDeleted = new EventWrapper_1.EventWrapper();
        /**
         * @type {EventWrapper<[MultiplayerSession, GeneralDataStore, ConnectedLensModule.RealtimeStoreKeyRemovalInfo]>}
         */
        this.onRealtimeStoreKeyRemoved = new EventWrapper_1.EventWrapper();
        /**
         * @type {EventWrapper<[MultiplayerSession, GeneralDataStore, ConnectedLensModule.UserInfo]>}
         */
        this.onRealtimeStoreOwnershipUpdated = new EventWrapper_1.EventWrapper();
        /**
         * @type {EventWrapper<[]>}
         */
        this.onLocatedAtFound = new EventWrapper_1.EventWrapper();
        /**
         * @deprecated
         */
        this.callbacks = {
            onReady: this.onReady,
            /**
             * @type {EventWrapper<[]>}
             */
            onStartColocated: this.onStartColocated,
            /**
             * @type {EventWrapper<[]>}
             */
            onMapExists: this.onMapExists,
            /**
             * @type {EventWrapper<[]>}
             */
            onLocationId: this.onLocationId,
            /**
             * @type {EventWrapper<[MultiplayerSession, ConnectedLensSessionOptions.SessionCreationType]>}
             */
            onSessionCreated: this.onSessionCreated,
            /**
             * @type {EventWrapper<[MultiplayerSession]>}
             */
            onSessionShared: this.onSessionShared,
            /**
             * @type {EventWrapper<[MultiplayerSession, ConnectedLensModule.ConnectionInfo]>}
             */
            onConnected: this.onConnected,
            /**
             * @type {EventWrapper<[MultiplayerSession, string]>}
             */
            onDisconnected: this.onDisconnected,
            /**
             * @type {EventWrapper<[MultiplayerSession, string, string, ConnectedLensModule.UserInfo]>}
             */
            onMessageReceived: this.onMessageReceived,
            /**
             * @type {EventWrapper<[MultiplayerSession, ConnectedLensModule.UserInfo]>}
             */
            onUserJoinedSession: this.onUserJoinedSession,
            /**
             * @type {EventWrapper<[MultiplayerSession, ConnectedLensModule.UserInfo]>}
             */
            onUserLeftSession: this.onUserLeftSession,
            /**
             * @type {EventWrapper<[MultiplayerSession, ConnectedLensModule.HostUpdateInfo]>}
             */
            onHostUpdated: this.onHostUpdated,
            /**
             * @type {EventWrapper<[MultiplayerSession, string, string]>}
             */
            onError: this.onError,
            /**
             * @type {EventWrapper<[]>}
             */
            onConnectionFailed: this.onConnectionFailed,
            /**
             * @type {EventWrapper<[MultiplayerSession, GeneralDataStore, ConnectedLensModule.UserInfo, ConnectedLensModule.RealtimeStoreCreationInfo]>}
             */
            onRealtimeStoreCreated: this.onRealtimeStoreCreated,
            /**
             * @type {EventWrapper<[MultiplayerSession, GeneralDataStore, string, ConnectedLensModule.RealtimeStoreUpdateInfo=]>}
             */
            onRealtimeStoreUpdated: this.onRealtimeStoreUpdated,
            /**
             * @type {EventWrapper<[MultiplayerSession, GeneralDataStore]>}
             */
            onRealtimeStoreDeleted: this.onRealtimeStoreDeleted,
            /**
             * @type {EventWrapper<[MultiplayerSession, ConnectedLensModule.RealtimeStoreKeyRemovalInfo]>}
             */
            onRealtimeStoreKeyRemoved: this.onRealtimeStoreKeyRemoved,
            /**
             * @type {EventWrapper<[MultiplayerSession, GeneralDataStore, ConnectedLensModule.UserInfo]>}
             */
            onRealtimeStoreOwnershipUpdated: this.onRealtimeStoreOwnershipUpdated,
            /**
             * @type {EventWrapper<[]>}
             */
            onLocatedAtFound: this.onLocatedAtFound,
        };
    }
    configure(script, connectedLensModule, locationCloudStorageModule, skipUiInStudio, isColocated, locatedAtComponent, landmarksVisual3d) {
        this.script = script;
        this.connectedLensModuleToUse = connectedLensModule;
        this.locationCloudStorageModule = locationCloudStorageModule;
        this.skipUiInStudio = skipUiInStudio;
        this.isColocated = isColocated;
        this.locatedAtComponent = locatedAtComponent;
        this.landmarksVisual3d = landmarksVisual3d;
        this._requireSessionStore = this.isColocated;
        this.isConfigured = true;
        const mappingOptions = LocatedAtComponent.createMappingOptions();
        mappingOptions.locationCloudStorageModule = this.locationCloudStorageModule;
        mappingOptions.location = LocationAsset.getAROrigin();
        if (locatedAtComponent !== null) {
            locatedAtComponent.onFound.add(() => {
                this._isLocatedAtFound = true;
                this.onLocatedAtFound.trigger();
            });
        }
        this._mappingSession =
            LocatedAtComponent.createMappingSession(mappingOptions);
        this._checkInitialization();
    }
    createSessionOptions() {
        const options = ConnectedLensSessionOptions.create();
        options.onSessionCreated = (session, creationType) => this._onSessionCreated(session, creationType);
        options.onConnected = (session, connectionInfo) => this._onConnected(session, connectionInfo);
        options.onDisconnected = (session, disconnectInfo) => this._onDisconnected(session, disconnectInfo);
        options.onMessageReceived = (session, userId, message, senderInfo) => this._onMessageReceived(session, userId, message, senderInfo);
        options.onUserJoinedSession = (session, userInfo) => this._onUserJoinedSession(session, userInfo);
        options.onUserLeftSession = (session, userInfo) => this._onUserLeftSession(session, userInfo);
        options.onHostUpdated = (session, removalInfo) => this._onHostUpdated(session, removalInfo);
        options.onError = (session, code, description) => this._onError(session, code, description);
        options.onRealtimeStoreCreated = (session, store, ownerInfo, creationInfo) => this._onRealtimeStoreCreated(session, store, ownerInfo, creationInfo);
        options.onRealtimeStoreUpdated = (session, store, key, updateInfo) => this._onRealtimeStoreUpdated(session, store, key, updateInfo);
        options.onRealtimeStoreDeleted = (session, store, deleteInfo) => this._onRealtimeStoreDeleted(session, store, deleteInfo);
        options.onRealtimeStoreOwnershipUpdated = (session, store, owner, ownershipUpdateInfo) => this._onRealtimeStoreOwnershipUpdated(session, store, owner, ownershipUpdateInfo);
        options.onRealtimeStoreKeyRemoved = (session, removalInfo) => this._onRealtimeStoreKeyRemoved(session, removalInfo);
        options.hostManagementEnabled = true;
        return options;
    }
    createSession() {
        this.log.i("Creating session");
        const options = this.createSessionOptions();
        this.connectedLensModuleToUse.createSession(options);
    }
    /**
     *
     * @param {MultiplayerSession} session
     * @param {ConnectedLensSessionOptions.SessionCreationType} creationType
     */
    _onSessionCreated(session, creationType) {
        this.log.i(`Session Created: ${creationType}`);
        this._session = session;
        this._sessionCreationType = creationType;
        // We can't pass the mock object to an actual Lens Studio type.
        if (!(session instanceof MockMultiplayerSession_1.MockMultiplayerSession)) {
            this.locationCloudStorageModule.session = session;
        }
        this.onSessionCreated.trigger(session, creationType);
    }
    /**
     *
     * @param {MultiplayerSession} session
     */
    _onSessionShared(session) {
        this.log.i("Session Shared");
        this._session = session;
        this.eventFlowState.shared = true;
        this.onSessionShared.trigger(session);
        this._checkIfReady();
    }
    /**
     *
     * @param {MultiplayerSession} session
     * @param {ConnectedLensModule.ConnectionInfo} connectionInfo
     */
    _onConnected(session, connectionInfo) {
        this.log.i("Connected to session");
        this._session = session;
        this._users = [];
        this._userIdLookup = new Map();
        this._connectionIdLookup = new Map();
        this._localUserInfo = connectionInfo.localUserInfo;
        this._localDisplayName = this._localUserInfo.displayName;
        this._localUserId = this._localUserInfo.userId;
        this._localConnectionId = this._localUserInfo.connectionId;
        this._hostUserInfo = connectionInfo.hostUserInfo;
        this._hostDisplayName = this._hostUserInfo.displayName;
        this._hostUserId = this._hostUserInfo.userId;
        this._hostConnectionId = this._hostUserInfo.connectionId;
        // Track local user
        this._trackUser(connectionInfo.localUserInfo);
        // Track other users
        const otherUsers = connectionInfo.externalUsersInfo;
        for (let i = 0; i < otherUsers.length; i++) {
            this._trackUser(otherUsers[i]);
        }
        // Track existing stores
        const stores = connectionInfo.realtimeStores;
        const creationInfos = connectionInfo.realtimeStoresCreationInfos;
        for (let j = 0; j < creationInfos.length; j++) {
            this._trackStore(stores[j], creationInfos[j].ownerInfo, creationInfos[j]);
        }
        this.eventFlowState.connected = true;
        this.onConnected.trigger(this._session, connectionInfo);
        this._checkIfReady();
    }
    /**
     *
     * @param {MultiplayerSession} session
     * @param {string} disconnectInfo
     */
    _onDisconnected(session, disconnectInfo) {
        this.log.d("disconnected from session: " + disconnectInfo);
        this.onDisconnected.trigger(session, disconnectInfo);
    }
    /**
     *
     * @param {MultiplayerSession} session
     * @param {string} userId
     * @param {string} message
     * @param {ConnectedLensModule.UserInfo} senderInfo
     */
    _onMessageReceived(session, userId, message, senderInfo) {
        this.onMessageReceived.trigger(session, userId, message, senderInfo);
    }
    /**
     *
     * @param {MultiplayerSession} session
     * @param {string} code
     * @param {string} description
     */
    _onError(session, code, description) {
        this._state = State.NotInitialized;
        this.log.e("Error: " + code + " - " + description);
        this.onError.trigger(session, code, description);
        if (this._session === null) {
            this.onConnectionFailed.trigger();
        }
    }
    /**
     *
     * @param {GeneralDataStore} store
     * @param {ConnectedLensModule.UserInfo} ownerInfo
     * @param {ConnectedLensModule.RealtimeStoreCreationInfo} creationInfo
     */
    _trackStore(store, ownerInfo, creationInfo) {
        // TODO: remove this dependence, use new API for getting id
        //const storeId = creationInfo.storeId;
        const storeId = (0, NetworkUtils_1.getNetworkIdFromStore)(store);
        this.log.d(`Tracking store: ${storeId}`);
        if (storeId !== null && storeId !== undefined && storeId !== "") {
            if (!(storeId in this._storeLookup)) {
                const storeInfo = new StoreInfo(store, ownerInfo, creationInfo);
                this._storeLookup[storeId] = storeInfo;
                this._storeInfos.push(storeInfo);
            }
        }
    }
    /**
     *
     * @param {GeneralDataStore} store
     */
    _untrackStore(store) {
        // TODO: remove this dependence, use new API for getting id
        const storeId = (0, NetworkUtils_1.getNetworkIdFromStore)(store);
        this.log.d(`Untracking store: ${storeId}`);
        if (storeId !== null && storeId !== undefined && storeId !== "") {
            delete this._storeLookup[storeId];
            this._storeInfos = this._storeInfos.filter((storeInfo) => {
                return storeId != (0, NetworkUtils_1.getNetworkIdFromStore)(storeInfo.store);
            });
        }
    }
    getTrackedStores() {
        return this._storeInfos;
    }
    /**
     *
     * @param {MultiplayerSession} session
     * @param {GeneralDataStore} store
     * @param {ConnectedLensModule.UserInfo} ownerInfo
     * @param {ConnectedLensModule.RealtimeStoreCreationInfo} creationInfo
     */
    _onRealtimeStoreCreated(session, store, ownerInfo, creationInfo) {
        this.log.d("_onRealtimeStoreCreated " + ownerInfo.displayName);
        this._trackStore(store, ownerInfo, creationInfo);
        this.onRealtimeStoreCreated.trigger(session, store, ownerInfo, creationInfo);
    }
    /**
     *
     * @param {MultiplayerSession} session
     * @param {GeneralDataStore} store
     * @param {string} key
     * @param {ConnectedLensModule.RealtimeStoreUpdateInfo?} updateInfo
     */
    _onRealtimeStoreUpdated(session, store, key, updateInfo) {
        this.onRealtimeStoreUpdated.trigger(session, store, key, updateInfo);
        if (!this._hasSentMapExists &&
            this.getColocatedBuildStatus() === ColocatedBuildStatus.Built) {
            this._hasSentMapExists = true;
            this.onMapExists.trigger();
        }
        if (!this._hasSentColocatedMapId &&
            this.getColocatedMapId() !== null &&
            this.getColocatedMapId() !== "") {
            this.log.d("onLocationId: " + this.getColocatedMapId());
            this._hasSentColocatedMapId = true;
            this.onLocationId.trigger();
        }
    }
    /**
     *
     * @param {MultiplayerSession} session
     * @param {GeneralDataStore} store
     * @param {ConnectedLensModule.RealtimeStoreDeleteInfo} deleteInfo
     */
    _onRealtimeStoreDeleted(session, store, deleteInfo) {
        this._untrackStore(store);
        this.onRealtimeStoreDeleted.trigger(session, store, deleteInfo);
    }
    /**
     *
     * @param {MultiplayerSession} session
     * @param {ConnectedLensModule.RealtimeStoreKeyRemovalInfo} removalInfo
     */
    _onRealtimeStoreKeyRemoved(session, removalInfo) {
        this.onRealtimeStoreKeyRemoved.trigger(session, removalInfo);
    }
    /**
     *
     * @param {MultiplayerSession} session
     * @param {GeneralDataStore} store
     * @param {ConnectedLensModule.UserInfo} owner
     */
    _onRealtimeStoreOwnershipUpdated(session, store, owner, ownershipUpdateInfo) {
        this._trackStore(store, owner);
        this.onRealtimeStoreOwnershipUpdated.trigger(session, store, owner, ownershipUpdateInfo);
    }
    /**
     * Helper function to add a UserInfo to a list of UserInfo, only if the list doesn't contain a user with
     * matching connectionId. Returns true if the user was added to the list.
     * @param {ConnectedLensModule.UserInfo[]} userList
     * @param {ConnectedLensModule.UserInfo} newUser
     * @returns {boolean}
     */
    _addMissingUserToListByConnectionId(userList, newUser) {
        if (newUser === null ||
            newUser === undefined ||
            newUser.connectionId === null ||
            newUser.connectionId === undefined) {
            return;
        }
        const newConnectionId = newUser.connectionId;
        for (let i = 0; i < userList.length; i++) {
            if (userList[i].connectionId === newConnectionId) {
                return false;
            }
        }
        userList.push(newUser);
        return true;
    }
    /**
     *
     * @param {ConnectedLensModule.UserInfo} userInfo
     * @returns {boolean}
     */
    _trackUser(userInfo) {
        let newUserJoined = false;
        if (!(userInfo.connectionId in this._connectionIdLookup)) {
            this._connectionIdLookup[userInfo.connectionId] = userInfo;
            newUserJoined = true;
        }
        let userList = this._userIdLookup[userInfo.userId];
        if (!userList) {
            userList = [userInfo];
            this._userIdLookup[userInfo.userId] = userList;
            newUserJoined = true;
        }
        else {
            newUserJoined =
                this._addMissingUserToListByConnectionId(userList, userInfo) ||
                    newUserJoined;
        }
        newUserJoined =
            this._addMissingUserToListByConnectionId(this._users, userInfo) ||
                newUserJoined;
        return newUserJoined;
    }
    /**
     * Helper function to remove all instances of UserInfo with matching connectionId from a list.
     * Returns the list with users removed.
     * @param {ConnectedLensModule.UserInfo[]} userList
     * @param {ConnectedLensModule.UserInfo} userInfo
     * @returns {ConnectedLensModule.UserInfo[]}
     */
    _removeUserFromListByConnectionId(userList, userInfo) {
        if (userInfo === null ||
            userInfo === undefined ||
            userInfo.connectionId === null ||
            userInfo.connectionId === undefined) {
            return userList;
        }
        const connectionId = userInfo.connectionId;
        return userList.filter((u) => {
            return u.connectionId !== connectionId;
        });
    }
    /**
     *
     * @param {ConnectedLensModule.UserInfo} userInfo
     */
    _untrackUser(userInfo) {
        const connectionId = userInfo.connectionId;
        delete this._connectionIdLookup[connectionId];
        const userList = this._userIdLookup[userInfo.userId];
        if (userList) {
            this._userIdLookup[userInfo.userId] =
                this._removeUserFromListByConnectionId(userList, userInfo);
        }
        this._users = this._removeUserFromListByConnectionId(this._users, userInfo);
    }
    /**
     *
     * @param {MultiplayerSession} session
     * @param {ConnectedLensModule.UserInfo} userInfo
     */
    _onUserJoinedSession(session, userInfo) {
        if (this._trackUser(userInfo)) {
            this.log.d("user joined session: " + userInfo.displayName);
            this.onUserJoinedSession.trigger(session, userInfo);
        }
        else {
            this.log.d("skipping duplicate user: " + userInfo.displayName);
        }
    }
    /**
     *
     * @param {MultiplayerSession} session
     * @param {ConnectedLensModule.UserInfo} userInfo
     */
    _onUserLeftSession(session, userInfo) {
        this._untrackUser(userInfo);
        this.onUserLeftSession.trigger(session, userInfo);
    }
    /**
     *
     * @param {MultiplayerSession} session
     * @param {ConnectedLensModule.HostUpdateInfo} removalInfo
     */
    _onHostUpdated(session, removalInfo) {
        this._hostUserInfo = removalInfo.userInfo;
        this._hostDisplayName = this._hostUserInfo.displayName;
        this._hostUserId = this._hostUserInfo.userId;
        this._hostConnectionId = this._hostUserInfo.connectionId;
        this.onHostUpdated.trigger(session, removalInfo);
    }
    // Session Store
    /**
     * Returns the shared session store (if exists) or null. Useful for needed session info like colocated build status.
     * @returns {GeneralDataStore?}
     */
    getSessionStore() {
        if (!this._sessionStore) {
            const sessionInfo = this.getStoreInfoById(SESSION_STORE_ID);
            if (sessionInfo) {
                this._sessionStore = sessionInfo.store;
            }
        }
        return this._sessionStore;
    }
    _createSessionStore() {
        const storeOpts = RealtimeStoreCreateOptions.create();
        storeOpts.persistence = RealtimeStoreCreateOptions.Persistence.Persist;
        const startingStore = GeneralDataStore.create();
        // Set network ID
        (0, NetworkUtils_1.putNetworkIdToStore)(startingStore, SESSION_STORE_ID);
        // Set colocated build status
        startingStore.putString(COLOCATED_BUILD_STATUS_KEY, ColocatedBuildStatus.None);
        storeOpts.initialStore = startingStore;
        this.log.d("creating the session store");
        this.createStore(storeOpts, (store) => {
            this.log.d("created session store");
            this._sessionStore = store;
            this._checkIfReady();
        }, (message) => {
            this.log.e("error creating shared store: " + message);
        });
    }
    _waitAndCreateSessionStore() {
        this._waitUntilTrue(() => {
            return (this.getSessionStore() !== null &&
                this.getSessionStore() !== undefined);
        }, () => {
            this.log.d("found session store");
            this._checkIfReady();
        }, 
        // Timeout
        0.1, () => this._createSessionStore());
    }
    // Colocated Flow
    /**
     * Start setting up Colocated flow
     */
    _startColocated() {
        this.log.d("startColocated()");
        if (!this.locationCloudStorageModule) {
            throw "Location Cloud Storage Module must be set!";
        }
        if (!this.eventFlowState.isColocatedSetupStarted) {
            this.onStartColocated.trigger();
        }
        this.eventFlowState.isColocatedSetupStarted = true;
        return;
    }
    /**
     * Get the build status from the shared session store
     * @returns {ColocatedBuildStatus}
     */
    getColocatedBuildStatus() {
        const sessionStore = this.getSessionStore();
        return sessionStore
            ? sessionStore.getString(COLOCATED_BUILD_STATUS_KEY)
            : null;
    }
    /**
     * Write the build status to the shared session store
     * @param {ColocatedBuildStatus} status
     */
    setColocatedBuildStatus(status) {
        this.getSessionStore().putString(COLOCATED_BUILD_STATUS_KEY, status);
    }
    /**
     * Get the id of the colocated map
     * @returns {string}
     */
    getColocatedMapId() {
        const sessionStore = this.getSessionStore();
        return sessionStore ? sessionStore.getString(COLOCATED_MAP_ID) : null;
    }
    /**
     * Write the id of the colocated map
     * @param {string} value map id
     */
    setColocatedMapId(value) {
        this.getSessionStore().putString(COLOCATED_MAP_ID, value);
    }
    // General flow
    /**
     * Checks the current status of all required systems and runs through the steps needed to finish setup.
     */
    _checkIfReady() {
        // We need a session to continue
        if (!this._session) {
            return;
        }
        // We need local user info to continue
        if (!this._localUserId) {
            return;
        }
        // We need to be connected to the session to continue
        if (!this.eventFlowState.connected) {
            return;
        }
        // If we require SessionStore, wait for SessionStore to be setup before continuing
        if (this._requireSessionStore && !this.getSessionStore()) {
            // Start setting up SessionStore if we haven't already
            if (!this.eventFlowState.isWaitingForSessionStore) {
                this.eventFlowState.isWaitingForSessionStore = true;
                this._waitAndCreateSessionStore();
            }
            return;
        }
        // If we are in colocated flow, we need colocated setup to be finished before continuing
        if (this.isColocated && !this._isSingleplayer) {
            if (!this.eventFlowState.isColocatedSetupFinished) {
                if (!this.eventFlowState.isColocatedSetupStarted) {
                    this._startColocated();
                    this._checkIfReady();
                    return;
                }
                return;
            }
        }
        this.log.d("session is now ready, triggering ready events");
        this._state = State.Ready;
        // Mark as ready and send all onReady events if we haven't already
        if (!this._hasSentReady) {
            this._isReady = true;
            this._hasSentReady = true;
            if (global.behaviorSystem) {
                global.behaviorSystem.sendCustomTrigger("session_ready");
            }
            // Introduce a delay before triggering onReady to allow the world camera to reset its position
            const delayEvent = this.script.createEvent("DelayedCallbackEvent");
            delayEvent.bind(() => {
                this.onReady.trigger();
            });
            delayEvent.reset(0.23);
        }
    }
    // Start setup
    init() {
        this.shouldInitialize = true;
        this._checkInitialization();
    }
    _checkInitialization() {
        if (this.isConfigured &&
            this.shouldInitialize &&
            this._state === State.NotInitialized) {
            this.doInit();
        }
    }
    doInit() {
        this._state = State.Initialized;
        this.createSession();
    }
    /**
     * Returns the current {@link MultiplayerSession}. Returns null if the session doesn't exist yet.
     * @returns {MultiplayerSession?}
     */
    getSession() {
        return this._session;
    }
    /**
     * Returns the LocationCloudStorageModule
     * @returns {LocationCloudStorageModule}
     */
    getLocationCloudStorageModule() {
        return this.locationCloudStorageModule;
    }
    /**
     * Returns the current {@link MappingSession}. Returns null if the session doesn't exist yet.
     * @returns {MappingSession?}
     */
    getMappingSession() {
        return this._mappingSession;
    }
    /**
     * Returns the located at component
     * @returns {LocatedAtComponent}
     */
    getLocatedAtComponent() {
        return this.locatedAtComponent;
    }
    /**
     * Get the 3D mesh of the mapped environment
     * @returns {RenderMeshVisual}
     */
    getLandmarksVisual3d() {
        return this.landmarksVisual3d;
    }
    /**
     * Returns the colocated tracking component
     * @returns {DeviceTracking}
     */
    getDeviceTrackingComponent() {
        return this.deviceTrackingComponent;
    }
    /**
     * Returns the current state.
     * @returns {State}
     */
    getState() {
        return this._state;
    }
    /**
     * Returns the session creation type
     * @returns {ConnectedLensSessionOptions.SessionCreationType}
     */
    getSessionCreationType() {
        return this._sessionCreationType;
    }
    /**
     * Returns the local user id, or null
     * @returns {string?}
     */
    getLocalUserId() {
        return this._localUserId;
    }
    /**
     * Returns the local connection id, or null
     * @returns {string?}
     */
    getLocalConnectionId() {
        return this._localConnectionId;
    }
    /**
     * Returns the local display name, or null
     * @returns {string?}
     */
    getLocalUserName() {
        return this._localDisplayName;
    }
    /**
     * Returns the local user info, or null
     * @returns {ConnectedLensModule.UserInfo}
     */
    getLocalUserInfo() {
        return this._localUserInfo;
    }
    /**
     * Returns true if the passed in `userInfo` matches the local userId. Note that this is separate from connectionId.
     * @param {ConnectedLensModule.UserInfo} userInfo
     * @returns {boolean}
     */
    isSameUserAsLocal(userInfo) {
        return this._localUserInfo && this._localUserId === userInfo.userId;
    }
    /**
     * Returns true if the passed in `userInfo` matches the local user and connection
     * @param {ConnectedLensModule.UserInfo} userInfo
     * @returns {boolean}
     */
    isLocalUserConnection(userInfo) {
        return (this._localUserInfo &&
            userInfo &&
            this._localConnectionId === userInfo.connectionId);
    }
    /**
     * Returns the host user id, or null
     * @returns {string?}
     */
    getHostUserId() {
        return this._hostUserId;
    }
    /**
     * Returns the host connection id, or null
     * @returns {string?}
     */
    getHostConnectionId() {
        return this._hostConnectionId;
    }
    /**
     * Returns the host display name, or null
     * @returns {string?}
     */
    getHostUserName() {
        return this._hostDisplayName;
    }
    /**
     * Returns the host user info, or null
     * @returns {ConnectedLensModule.UserInfo}
     */
    getHostUserInfo() {
        return this._hostUserInfo;
    }
    /**
     * Returns true if the passed in `userInfo` matches the host userId. Note that this is separate from connectionId.
     * @param {ConnectedLensModule.UserInfo} userInfo
     * @returns {boolean}
     */
    isSameUserAsHost(userInfo) {
        return this._hostUserInfo && this._hostUserId === userInfo.userId;
    }
    /**
     * Returns true if the passed in `userInfo` matches the host user and connection
     * @param {ConnectedLensModule.UserInfo} userInfo
     * @returns {boolean}
     */
    isHostUserConnection(userInfo) {
        return (this._hostUserInfo &&
            userInfo &&
            this._hostConnectionId === userInfo.connectionId);
    }
    /**
     * Returns true if the local user is the host, or null if the session doesn't exist yet.
     * @returns {boolean | null}
     */
    isHost() {
        if (!this.eventFlowState.connected) {
            return null;
        }
        else {
            return this.isHostUserConnection(this._localUserInfo);
        }
    }
    /**
     * Returns true if the session is singleplayer
     * @returns {boolean} Whether the session is singleplayer
     */
    isSingleplayer() {
        return this._isSingleplayer;
    }
    /**
     * Returns the list of current user connections
     * @returns {ConnectedLensModule.UserInfo[]}
     */
    getUsers() {
        return this._users;
    }
    /**
     * Returns the user info with matching id, or null
     * @deprecated Use {@link getUserByConnectionId} or {@link getUsersByUserId()}
     * @param {string} userId
     * @returns {ConnectedLensModule.UserInfo?}
     */
    getUserById(userId) {
        const users = this.getUsersByUserId(userId);
        if (users.length > 0) {
            return users[0];
        }
        return null;
    }
    /**
     * Returns the user info with matching connection id, or null
     * @param {string} connectionId
     * @returns {ConnectedLensModule.UserInfo?}
     */
    getUserByConnectionId(connectionId) {
        return this._connectionIdLookup[connectionId] || null;
    }
    /**
     * Returns the list of users with matching user id
     * @param {string} userId
     * @returns {ConnectedLensModule.UserInfo[]}
     */
    getUsersByUserId(userId) {
        return this._userIdLookup[userId] || [];
    }
    /**
     * Returns true if the session has been shared
     * @returns {boolean}
     */
    getIsSessionShared() {
        return this.eventFlowState.shared;
    }
    /**
     * Returns StoreInfo for the store with matching id
     * @param {string} networkId
     * @returns {StoreInfo?}
     */
    getStoreInfoById(networkId) {
        var _a;
        return (_a = this._storeLookup[networkId]) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * Create a RealtimeStore
     * @param {RealtimeStoreCreateOptions} storeOptions
     * @param {((store:GeneralDataStore)=>void)=} onSuccess
     * @param {((message:string)=>void)=} onError
     */
    createStore(storeOptions, onSuccess, onError) {
        this._session.createRealtimeStore(storeOptions, onSuccess || (() => { }), onError ||
            ((message) => {
                this.log.e(message);
                throw Error(message);
            }));
    }
    /**
     * Returns a unix timestamp in seconds of the current time according to the server.
     * Useful for synchronizing time-based game events across devices.
     * -1 will be returned if session is not connected to the server.
     * @returns {number?}
     */
    getServerTimeInSeconds() {
        if (this._session) {
            return this._session.getServerTimestamp() * 0.001;
        }
        return null;
    }
    /**
     * Share an Invite to the session
     */
    shareInvite() {
        if (!this._session) {
            throw Error("Unable to share invite: session is not created!");
        }
        if (!this.connectedLensModuleToUse) {
            throw Error("Unable to share invite: connected lens module not set!");
        }
        if (this._state != State.Ready && this._state != State.WaitingForInvite) {
            throw Error("Unable to share invite: session controller is not ready!");
        }
        this.eventFlowState.connected = false;
        this.eventFlowState.shared = false;
        this.connectedLensModuleToUse.shareSession(ConnectedLensModule.SessionShareType.Invitation, this._onSessionShared);
    }
    /**
     * Returns true if we're ready to start the colocated tracking flow.
     * @returns {boolean}
     */
    getOnStartColocated() {
        return this.eventFlowState.isColocatedSetupStarted;
    }
    /**
     * Executes `onColocatedStart` immediately if the Session should start the colocated tracking flow,
     * or will execute it later when the flow should start. Returns a completer function, which should be called
     * when colocation is complete.
     * @param {()=>void} onStartColocated
     * @returns {()=>void} onColocatedComplete
     */
    notifyOnStartColocated(onStartColocated) {
        if (this.getOnStartColocated()) {
            onStartColocated();
        }
        else {
            this.onStartColocated.add(onStartColocated);
        }
        return /*function onColocatedComplete*/ () => {
            this.eventFlowState.isColocatedSetupFinished = true;
            this._checkIfReady();
        };
    }
    /**
     * Returns true if the session has finished setting up and the len experience is ready to start
     * @returns {boolean}
     */
    getIsReady() {
        return this._isReady;
    }
    /**
     * Executes `onReady` immediately if the Session is ready, or will execute it later when the Session becomes ready.
     * @param {()=>void} onReady
     */
    notifyOnReady(onReady) {
        if (this.getIsReady()) {
            onReady();
        }
        else {
            this.onReady.add(onReady);
        }
    }
    /**
     * Returns true if the map exists.
     * @returns {boolean}
     */
    getMapExists() {
        return ((this.locatedAtComponent !== null &&
            this.locatedAtComponent !== undefined &&
            this.locatedAtComponent.location !== null) ||
            this.getColocatedBuildStatus() === ColocatedBuildStatus.Built);
    }
    /**
     * Executes `onMapExists` immediately if the map exists.
     * @param {()=>void} onMapExists
     */
    notifyOnMapExists(onMapExists) {
        if (this.getMapExists()) {
            onMapExists();
        }
        else {
            this.onMapExists.add(onMapExists);
        }
    }
    /**
     * Executes `onLocationId` immediately if the locationId found.
     * @param {()=>void} onLocationId
     */
    notifyOnLocationId(onLocationId) {
        if (this.getColocatedMapId()) {
            onLocationId();
        }
        else {
            this.onLocationId.add(onLocationId);
        }
    }
    /**
     * Executes `onLocatedAtFound` immediately if the locatedAtComponent is found, or will execute it later when the component is found.
     * @param {()=>void} onLocatedAtFound
     */
    notifyOnLocatedAtFound(onLocatedAtFound) {
        if (this._isLocatedAtFound) {
            onLocatedAtFound();
        }
        else {
            this.onLocatedAtFound.add(onLocatedAtFound);
        }
    }
    /**
     * Returns true if skipUiInStudio checkbox is selected.
     * @returns {boolean}
     */
    getSkipUiInStudio() {
        return this.skipUiInStudio;
    }
    /**
     * Prepares SessionController to use a Mocked version of Connected Lenses.
     * Make sure to call this before calling init().
     * @param {MockMultiplayerSessionConfig=} options
     */
    prepareOfflineMode(options) {
        if (this._state !== State.NotInitialized) {
            this.log.e("Can't switch to offline after already initializing!");
            return;
        }
        const mockModule = new MockMultiplayerSession_1.MockConnectedLensModule();
        options =
            options || MockMultiplayerSessionConfig_1.MockMultiplayerSessionConfig.createWithOneFrameLatency();
        mockModule.mockSessionOptions = options;
        this.connectedLensModuleToUse = mockModule;
        this._isSingleplayer = true;
    }
    /**
     * Checks if the current user is the one who performed the mapping
     * @returns {boolean}
     */
    getIsUserMapper() {
        return this._isUserMapper;
    }
    /**
     * Sets whether the current user is designated as the one who performed the mapping.
     * @param {boolean} isUserMapper
     */
    setIsUserMapper(isUserMapper) {
        this._isUserMapper = isUserMapper;
    }
    /**
     *
     * @param {()=>boolean} condition
     * @param {()=>void} callback
     * @param {number=} timeOutSeconds
     * @param {(()=>void)=} onTimeout
     */
    _waitUntilTrue(condition, callback, timeOutSeconds, onTimeout) {
        const startTime = getTime();
        const evt = this.script.createEvent("UpdateEvent");
        evt.bind(() => {
            if (condition()) {
                this.script.removeEvent(evt);
                callback();
            }
            else {
                if (timeOutSeconds !== undefined && timeOutSeconds !== null) {
                    if (startTime + timeOutSeconds <= getTime()) {
                        this.script.removeEvent(evt);
                        onTimeout();
                    }
                }
            }
        });
    }
};
exports.SessionController = SessionController;
exports.SessionController = SessionController = __decorate([
    Singleton_1.Singleton
], SessionController);
// These exports exist for javascript compatibility, and should not be used from typescript code.
;
global.sessionController = SessionController.getInstance();
//# sourceMappingURL=SessionController.js.map