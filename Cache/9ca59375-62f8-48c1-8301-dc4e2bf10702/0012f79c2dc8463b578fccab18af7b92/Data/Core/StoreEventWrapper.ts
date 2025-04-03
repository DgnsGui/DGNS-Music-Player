import {EventWrapper} from "./EventWrapper"
import {getNetworkIdFromStore, NetworkIdFilter} from "./NetworkUtils"
import {SessionController} from "./SessionController"

export class StoreEventWrapper {
  /** @type {Function[]} */
  private _cleanups: Function[] = []

  onStoreCreated: EventWrapper<
    [
      session: MultiplayerSession,
      store: GeneralDataStore,
      ownerInfo: ConnectedLensModule.UserInfo,
      creationInfo: ConnectedLensModule.RealtimeStoreCreationInfo
    ]
  >

  onStoreUpdated: EventWrapper<
    [
      session: MultiplayerSession,
      store: GeneralDataStore,
      key: string,
      updateInfo: ConnectedLensModule.RealtimeStoreUpdateInfo
    ]
  >

  onStoreOwnershipUpdated: EventWrapper<
    [
      session: MultiplayerSession,
      store: GeneralDataStore,
      ownerInfo: ConnectedLensModule.UserInfo,
      ownershipUpdateInfo: ConnectedLensModule.RealtimeStoreOwnershipUpdateInfo
    ]
  >

  onStoreDeleted: EventWrapper<
    [
      session: MultiplayerSession,
      store: GeneralDataStore,
      deleteInfo: ConnectedLensModule.RealtimeStoreDeleteInfo
    ]
  >

  onStoreKeyRemoved: EventWrapper<
    [
      session: MultiplayerSession,
      removalInfo: ConnectedLensModule.RealtimeStoreKeyRemovalInfo
    ]
  >

  idFilter: NetworkIdFilter

  /**
   * @class
   * @param {string} networkId
   */
  constructor(public networkId: string) {
    this.idFilter = this.makeNetworkIdFilter(networkId)

    this.onStoreCreated = this.wrapStoreEventWithFilter(
      SessionController.getInstance().onRealtimeStoreCreated,
      this.idFilter,
      this._cleanups
    )

    this.onStoreUpdated = this.wrapStoreEventWithFilter(
      SessionController.getInstance().onRealtimeStoreUpdated,
      this.idFilter,
      this._cleanups
    )

    this.onStoreOwnershipUpdated = this.wrapStoreEventWithFilter(
      SessionController.getInstance().onRealtimeStoreOwnershipUpdated,
      this.idFilter,
      this._cleanups
    )

    this.onStoreDeleted = this.wrapStoreEventWithFilter(
      SessionController.getInstance().onRealtimeStoreDeleted,
      this.idFilter,
      this._cleanups
    )

    this.onStoreKeyRemoved = this.wrapStoreEventWithFilter(
      SessionController.getInstance().onRealtimeStoreKeyRemoved,
      this.idFilter,
      this._cleanups
    )
  }

  cleanup() {
    for (let i = 0; i < this._cleanups.length; i++) {
      this._cleanups[i]()
    }
    this._cleanups = []
  }

  /**
   * @template T, Filter
   * @param {EventWrapper<T>} event
   * @param {(store:Filter)=>boolean} filterFunc
   * @param {Function[]?} cleanupFuncs
   * @returns {EventWrapper<T>}
   */
  wrapStoreEventWithFilter<Filter, T extends any[]>(
    event: EventWrapper<T>,
    filterFunc: (store: Filter) => boolean,
    cleanupFuncs: Function[] | null
  ): EventWrapper<T> {
    const evt: EventWrapper<T> = new EventWrapper()
    const callback = (...args: T) => {
      if (filterFunc(args[1])) {
        evt.trigger(...args)
      }
    }
    event.add(callback)
    if (cleanupFuncs) {
      cleanupFuncs.push(() => {
        evt.remove(callback)
      })
    }
    return evt
  }

  /**
   *
   * @param {string} networkId
   * @returns {(store:GeneralDataStore)=>boolean}
   */
  makeNetworkIdFilter(networkId: string): NetworkIdFilter {
    return (store) => {
      return getNetworkIdFromStore(store) === networkId
    }
  }
}
