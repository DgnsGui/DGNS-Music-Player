"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkMessageWrapper = void 0;
const SyncKitLogger_1 = require("../Utils/SyncKitLogger");
const KeyedEventWrapper_1 = require("./KeyedEventWrapper");
const NetworkMessage_1 = require("./NetworkMessage");
const NetworkUtils_1 = require("./NetworkUtils");
const SessionController_1 = require("./SessionController");
/**
 * Wraps network messages for a specific kind of message.
 * @class
 * @param {string} networkId
 */
class NetworkMessageWrapper {
    constructor(networkId) {
        this.networkId = networkId;
        this.log = new SyncKitLogger_1.SyncKitLogger("NetworkMessageWrapper");
        this.onRemoteEventReceived = new KeyedEventWrapper_1.KeyedEventWrapper();
        this.onAnyEventReceived = new KeyedEventWrapper_1.KeyedEventWrapper();
        this.cleanupMessage = SessionController_1.SessionController.getInstance().onMessageReceived.add((session, senderId, messageString, senderInfo) => this._onReceiveMessage(session, senderId, messageString, senderInfo));
    }
    /**
     * @private
     * @param {MultiplayerSession} _session
     * @param {string} _senderId
     * @param {string} message
     * @param {ConnectedLensModule.UserInfo} senderInfo
     */
    _onReceiveMessage(_session, _senderId, messageString, senderInfo) {
        let obj = null;
        try {
            obj = (0, NetworkUtils_1.lsJSONParse)(messageString);
        }
        catch (e) {
            // Messages may not be in json if they are not from SyncKit, so we should ignore them if there is a problem.
            // If you are having a problem with message deserialization, uncomment this line for better error messages
            // this.log.e("could not parse message: " + e);
            return;
        }
        const networkId = obj[NetworkUtils_1.NETWORK_ID_KEY];
        if (networkId === this.networkId) {
            const messageKey = obj._message;
            if (messageKey !== undefined) {
                const messageData = obj._data;
                this._dispatchMessageEvents(senderInfo, messageKey, messageData);
            }
        }
    }
    /**
     * @private
     * @param {ConnectedLensModule.UserInfo} senderInfo
     * @param {string} messageKey
     * @param {T?} messageData
     */
    _dispatchMessageEvents(senderInfo, messageKey, messageData) {
        const netEvent = new NetworkMessage_1.NetworkMessage(senderInfo, messageKey, messageData);
        const senderId = senderInfo.connectionId;
        if (senderId != SessionController_1.SessionController.getInstance().getLocalConnectionId()) {
            this.onRemoteEventReceived.trigger(messageKey, netEvent);
        }
        this.onAnyEventReceived.trigger(messageKey, netEvent);
    }
    /**
     *
     * @param {string} messageKey
     * @param {T?} messageData
     * @param {boolean=} onlySendRemote
     */
    sendMessage(messageKey, messageData, onlySendRemote) {
        const obj = {
            _message: messageKey,
        };
        if (messageData !== undefined) {
            obj._data = messageData;
        }
        obj[NetworkUtils_1.NETWORK_ID_KEY] = this.networkId;
        const str = (0, NetworkUtils_1.lsJSONStringify)(obj);
        SessionController_1.SessionController.getInstance().getSession().sendMessage(str);
        if (!onlySendRemote) {
            const senderInfo = SessionController_1.SessionController.getInstance().getLocalUserInfo();
            this._dispatchMessageEvents(senderInfo, messageKey, messageData);
        }
    }
    cleanup() {
        SessionController_1.SessionController.getInstance().onMessageReceived.remove(this.cleanupMessage);
    }
}
exports.NetworkMessageWrapper = NetworkMessageWrapper;
//# sourceMappingURL=NetworkMessageWrapper.js.map