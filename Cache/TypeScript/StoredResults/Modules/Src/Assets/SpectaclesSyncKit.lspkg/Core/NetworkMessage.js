"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkMessage = void 0;
/**
 * Holds a message that is sent over the network.
 * @class
 * @template T
 */
class NetworkMessage {
    /**
     * @param {ConnectedLensModule.UserInfo} senderInfo
     * @param {string} message
     * @param {T?} messageData
     */
    constructor(senderInfo, message, messageData) {
        this.senderInfo = senderInfo;
        /** @type {string} */
        this.senderUserId = senderInfo.userId;
        /** @type {string} */
        this.senderConnectionId = senderInfo.connectionId;
        /** @type {string} */
        this.message = message;
        /** @type {T?} */
        this.data = messageData;
    }
}
exports.NetworkMessage = NetworkMessage;
//# sourceMappingURL=NetworkMessage.js.map