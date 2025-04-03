/**
 * Holds a message that is sent over the network.
 * @class
 * @template T
 */
export class NetworkMessage<T> {
  /**
   * @type {string}
   */
  senderUserId: string

  /**
   * @type {string}
   */
  senderConnectionId: string

  /**
   * @type {string}
   */
  message: string

  /**
   * @type {T?}
   */
  data: T

  /**
   * @param {ConnectedLensModule.UserInfo} senderInfo
   * @param {string} message
   * @param {T?} messageData
   */
  constructor(
    public readonly senderInfo: ConnectedLensModule.UserInfo,
    message: string,
    messageData?: T
  ) {
    /** @type {string} */
    this.senderUserId = senderInfo.userId
    /** @type {string} */
    this.senderConnectionId = senderInfo.connectionId
    /** @type {string} */
    this.message = message
    /** @type {T?} */
    this.data = messageData
  }
}
