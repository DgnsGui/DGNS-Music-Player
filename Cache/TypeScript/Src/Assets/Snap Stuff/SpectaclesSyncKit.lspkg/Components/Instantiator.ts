import {NetworkRootInfo} from "../Core/NetworkRootInfo"
import {
  getNetworkIdFromStore,
  getNetworkTypeFromStore,
  getPersistenceFromValue,
  putNetworkIdToStore,
  putNetworkTypeToStore,
} from "../Core/NetworkUtils"
import {persistenceTypeFromString} from "../Core/PersistenceType"
import {SessionController} from "../Core/SessionController"
import {SyncEntity} from "../Core/SyncEntity"
import {isNullOrUndefined} from "../Utils/Helpers"
import {SyncKitLogger} from "../Utils/SyncKitLogger"

export type InstantiationOptionsObj = {
  onSuccess?: (networkRoot: NetworkRootInfo) => void
  persistence?:
    | RealtimeStoreCreateOptions.Persistence
    | keyof typeof RealtimeStoreCreateOptions.Persistence
  claimOwnership?: boolean
  worldPosition?: vec3
  worldRotation?: quat
  worldScale?: vec3
  localPosition?: vec3
  localRotation?: quat
  localScale?: vec3
  onError?: (message: string) => void
  overrideNetworkId?: string
  customDataStore?: GeneralDataStore
}

export class InstantiationOptions {
  onSuccess: ((networkRoot: NetworkRootInfo) => void) | null
  persistence:
    | RealtimeStoreCreateOptions.Persistence
    | keyof typeof RealtimeStoreCreateOptions.Persistence
    | null
  claimOwnership: boolean | null
  worldPosition: vec3 | null
  worldRotation: quat | null
  worldScale: vec3 | null
  localPosition: vec3 | null
  localRotation: quat | null
  localScale: vec3 | null
  onError: ((message: string) => void) | null
  overrideNetworkId: string | null
  customDataStore: GeneralDataStore | null

  constructor(optionDic?: InstantiationOptionsObj) {
    /** @type {((networkRoot:NetworkRootInfo)=>void)=} */
    this.onSuccess = optionDic?.onSuccess ?? null

    /** @type {(RealtimeStoreCreateOptions.Persistence|keyof typeof RealtimeStoreCreateOptions.Persistence)=} */
    this.persistence = optionDic?.persistence ?? null

    /** @type {boolean=} */
    this.claimOwnership = optionDic?.claimOwnership ?? null

    /** @type {vec3=} */
    this.worldPosition = optionDic?.worldPosition ?? null

    /** @type {quat=} */
    this.worldRotation = optionDic?.worldRotation ?? null

    /** @type {vec3=} */
    this.worldScale = optionDic?.worldScale ?? null

    /** @type {vec3=} */
    this.localPosition = optionDic?.localPosition ?? null

    /** @type {quat=} */
    this.localRotation = optionDic?.localRotation ?? null

    /** @type {vec3=} */
    this.localScale = optionDic?.localScale ?? null

    /** @type {((message:string)=>void)=} */
    this.onError = optionDic?.onError ?? null

    /** @type {string=} */
    this.overrideNetworkId = optionDic?.overrideNetworkId ?? null

    /** @type {GeneralDataStore} */
    this.customDataStore = optionDic?.customDataStore ?? null
  }
}

const SPAWNER_ID_KEY: string = "_spawner_id"
const PREFAB_ID_KEY: string = "_prefab_name"
const START_POS_KEY: string = "_init_pos"
const START_ROT_KEY: string = "_init_rot"
const START_SCALE_KEY: string = "_init_scale"

const TAG = "Instantiator"

/**
 * Used to instantiate prefabs across the network.
 * Prefabs must be added to the prefabs list or autoInstantiate list in order to be instantiated.
 */
@component
export class Instantiator extends BaseScriptComponent {
  @input
  private prefabs: ObjectPrefab[] = []

  @input("boolean", "false")
  private spawnerOwnsObject: boolean = false

  @input("boolean", "false")
  private spawnAsChildren: boolean = false

  @input
  @showIf("spawnAsChildren")
  private spawnUnderParent: SceneObject | null = null

  @ui.separator
  @input("boolean", "false")
  private autoInstantiate: boolean = false

  @input
  @label("Prefabs")
  @showIf("autoInstantiate")
  private autoInstantiatePrefabs: ObjectPrefab[] = []

  @input("string", "Session")
  @label("Persistence")
  @showIf("autoInstantiate")
  @widget(
    new ComboBoxWidget([
      new ComboBoxItem("Ephemeral", "Ephemeral"),
      new ComboBoxItem("Owner", "Owner"),
      new ComboBoxItem("Session", "Session"),
      new ComboBoxItem("Persist", "Persist"),
    ])
  )
  private persistenceString: string = "Session"
  private persistence: RealtimeStoreCreateOptions.Persistence =
    persistenceTypeFromString(this.persistenceString)

  @input("string", "Unowned")
  @showIf("autoInstantiate")
  @widget(
    new ComboBoxWidget([
      new ComboBoxItem("Owned", "Owned"),
      new ComboBoxItem("Unowned", "Unowned"),
    ])
  )
  @label("Auto Instantiate Ownership")
  private autoInstantiateOwnershipString: string = "Unowned"
  private autoInstantiateOwnership: RealtimeStoreCreateOptions.Ownership =
    this.autoInstantiateOwnershipString === "Owned"
      ? RealtimeStoreCreateOptions.Ownership.Owned
      : RealtimeStoreCreateOptions.Ownership.Unowned

  private spawnedInstances: Map<string, NetworkRootInfo> = new Map()

  private spawningInstances: Map<string, SceneObject> = new Map()

  private syncEntity = new SyncEntity(this)

  private log = new SyncKitLogger(TAG)

  private onAwake() {
    SessionController.getInstance().notifyOnReady(() => this.onReady())
    SessionController.getInstance().onRealtimeStoreCreated.add(
      (session, datastore, userInfo, realtimeStoreCreationInfo) =>
        this.onRealtimeStoreCreated(
          session,
          datastore,
          userInfo,
          realtimeStoreCreationInfo
        )
    )
    this.createEvent("OnEnableEvent").bind(() =>
      this.spawnInitialInstancesOnReady()
    )
  }

  /**
   * @param {ObjectPrefab} prefab
   * @param {InstantiationOptions|InstantiationOptionsObj} options
   * @returns {string}
   */
  private generatePrefabId(
    prefab: ObjectPrefab,
    options: InstantiationOptions | InstantiationOptionsObj
  ): string {
    if (
      !isNullOrUndefined(options) &&
      !isNullOrUndefined(options?.overrideNetworkId)
    ) {
      return options.overrideNetworkId
    } else {
      return (
        prefab.name +
        "_" +
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
      )
    }
  }

  /**
   *
   * @param {string} prefabName
   * @returns {ObjectPrefab?}
   */
  private findPrefabByName(prefabName: string): ObjectPrefab | null {
    for (let i = 0; i < this.prefabs.length; i++) {
      if (this.prefabs[i].name === prefabName) {
        return this.prefabs[i]
      }
    }
    for (let i = 0; i < this.autoInstantiatePrefabs.length; i++) {
      if (this.autoInstantiatePrefabs[i].name === prefabName) {
        return this.autoInstantiatePrefabs[i]
      }
    }
    return null
  }

  /**
   *
   * @param {string} networkId
   * @param {ObjectPrefab} prefab
   * @param {(InstantiationOptions|InstantiationOptionsObj)=} options
   */
  private instantiateNewPrefab(
    networkId: string,
    prefab: ObjectPrefab,
    options: (InstantiationOptions | InstantiationOptionsObj) | null
  ) {
    options = options || {}
    this.log.d("instantiate new prefab with id " + networkId)
    const prefabName = prefab.name
    const rootObj = global.scene.createSceneObject("holder:" + networkId)

    const parentObj =
      this.spawnAsChildren && (this.spawnUnderParent || this.getSceneObject())

    if (parentObj) {
      rootObj.setParent(parentObj)
    }

    const initialData = options.customDataStore || GeneralDataStore.create()

    putNetworkIdToStore(initialData, networkId)
    putNetworkTypeToStore(initialData, "prefab")
    initialData.putString(PREFAB_ID_KEY, prefabName)
    this.setSpawnerIdOnStore(initialData, this.syncEntity.networkId)

    if (options.worldPosition) {
      rootObj.getTransform().setWorldPosition(options.worldPosition)
      initialData.putVec3(
        START_POS_KEY,
        rootObj.getTransform().getLocalPosition()
      )
    }
    if (options.worldRotation) {
      rootObj.getTransform().setWorldRotation(options.worldRotation)
      initialData.putQuat(
        START_ROT_KEY,
        rootObj.getTransform().getLocalRotation()
      )
    }
    if (options.worldScale) {
      rootObj.getTransform().setWorldScale(options.worldScale)
      initialData.putVec3(
        START_SCALE_KEY,
        rootObj.getTransform().getLocalScale()
      )
    }
    if (options.localPosition) {
      rootObj.getTransform().setLocalPosition(options.localPosition)
      initialData.putVec3(
        START_POS_KEY,
        rootObj.getTransform().getLocalPosition()
      )
    }
    if (options.localRotation) {
      rootObj.getTransform().setLocalRotation(options.localRotation)
      initialData.putQuat(
        START_ROT_KEY,
        rootObj.getTransform().getLocalRotation()
      )
    }
    if (options.localScale) {
      rootObj.getTransform().setLocalScale(options.localScale)
      initialData.putVec3(
        START_SCALE_KEY,
        rootObj.getTransform().getLocalScale()
      )
    }

    let shouldIOwn = false

    const persistence = getPersistenceFromValue(options.persistence)

    const storeOptions = RealtimeStoreCreateOptions.create()
    storeOptions.initialStore = initialData
    storeOptions.persistence = persistence
    storeOptions.ownership = RealtimeStoreCreateOptions.Ownership.Unowned
    if (options.claimOwnership || this.spawnerOwnsObject) {
      shouldIOwn = true
      storeOptions.ownership = RealtimeStoreCreateOptions.Ownership.Owned
    }

    this.spawningInstances[networkId] = rootObj

    SessionController.getInstance()
      .getSession()
      .createRealtimeStore(
        storeOptions,
        (store: GeneralDataStore) => {
          this.log.d("created prefab and got store callback")
          let ownerInfo = null
          if (shouldIOwn) {
            ownerInfo = SessionController.getInstance().getLocalUserInfo()
          }
          const networkRoot = new NetworkRootInfo(
            rootObj,
            networkId,
            store,
            true,
            ownerInfo,
            persistence
          )
          delete this.spawningInstances[networkId]
          this.spawnedInstances[networkId] = networkRoot
          prefab.instantiate(rootObj)
          networkRoot.finishSetup()
          if (options.onSuccess) {
            options.onSuccess(networkRoot)
          }
        },
        (string) => options.onError(string)
      )
  }

  /**
   *
   * @param {GeneralDataStore} store
   * @param {ConnectedLensModule.UserInfo} ownerInfo
   * @returns {NetworkRootInfo}
   */
  private instantiatePrefabFromStore(
    store: GeneralDataStore,
    ownerInfo: ConnectedLensModule.UserInfo
  ): NetworkRootInfo {
    const networkId = getNetworkIdFromStore(store)
    const prefabName = store.getString(PREFAB_ID_KEY)
    this.log.d("instantiate prefab from store: " + prefabName + " " + networkId)

    const rootObj = global.scene.createSceneObject("holder:" + networkId)
    if (this.spawnAsChildren) {
      const parentObj = this.spawnUnderParent || this.getSceneObject()
      rootObj.setParent(parentObj)
    }

    if (store.has(START_POS_KEY)) {
      rootObj.getTransform().setLocalPosition(store.getVec3(START_POS_KEY))
    }
    if (store.has(START_ROT_KEY)) {
      rootObj.getTransform().setLocalRotation(store.getQuat(START_ROT_KEY))
    }
    if (store.has(START_SCALE_KEY)) {
      rootObj.getTransform().setLocalScale(store.getVec3(START_SCALE_KEY))
    }

    const networkRoot = new NetworkRootInfo(
      rootObj,
      networkId,
      store,
      false,
      ownerInfo
    )
    const prefab = this.findPrefabByName(prefabName)
    if (!isNull(prefab)) {
      this.spawnedInstances[networkId] = networkRoot
      prefab.instantiate(rootObj)
      networkRoot.finishSetup()
      return networkRoot
    } else {
      throw (
        "Could not find prefab with matching name: " +
        prefabName +
        ". Make sure it's added to the Instantiator's prefab list!"
      )
    }
  }

  /**
   *
   * @param {GeneralDataStore} store
   * @returns {string}
   */
  private getSpawnerIdFromStore(store: GeneralDataStore): string {
    return store.getString(SPAWNER_ID_KEY)
  }

  /**
   *
   * @param {GeneralDataStore} store
   * @param {string} id
   */
  private setSpawnerIdOnStore(store: GeneralDataStore, id: string) {
    store.putString(SPAWNER_ID_KEY, id)
  }

  /**
   *
   * @param {MultiplayerSession} _session
   * @param {GeneralDataStore} store
   * @param {ConnectedLensModule.UserInfo} ownerInfo
   */
  private onRealtimeStoreCreated(
    _session: MultiplayerSession,
    store: GeneralDataStore,
    ownerInfo: ConnectedLensModule.UserInfo,
    _realtimeStoreCreationInfo: ConnectedLensModule.RealtimeStoreCreationInfo
  ) {
    this.trySpawnFromStore(store, ownerInfo)
  }

  private spawnInitialInstancesOnReady() {
    this.syncEntity.notifyOnReady(() => this.spawnInitialInstances())
  }

  private spawnInitialInstances() {
    const sessionController = SessionController.getInstance()

    sessionController.getTrackedStores().forEach((storeInfo) => {
      this.trySpawnFromStore(storeInfo.store, storeInfo.ownerInfo)
    })
  }

  trySpawnFromStore(
    store: GeneralDataStore,
    ownerInfo: ConnectedLensModule.UserInfo
  ) {
    const networkType = getNetworkTypeFromStore(store)
    const spawnerId = this.getSpawnerIdFromStore(store)

    if (networkType === "prefab" && spawnerId === this.syncEntity.networkId) {
      const networkId = getNetworkIdFromStore(store)
      if (
        !(networkId in this.spawnedInstances) &&
        !(networkId in this.spawningInstances)
      ) {
        this.instantiatePrefabFromStore(store, ownerInfo)
      }
    }
  }

  private onReady() {
    if (this.autoInstantiate) {
      const settings = new InstantiationOptions({
        persistence: this.persistence,
        claimOwnership:
          this.autoInstantiateOwnership ===
          RealtimeStoreCreateOptions.Ownership.Owned,
      })
      for (let i = 0; i < this.autoInstantiatePrefabs.length; i++) {
        this.instantiate(this.autoInstantiatePrefabs[i], settings)
      }
    }
    this.spawnInitialInstances()
  }

  /**
   * Instantiates a prefab across the network. The prefab must be included in the "Prefabs" list of the Instantiator's inspector.
   * @param {ObjectPrefab} prefab Prefab to instantiate. Make sure it's included in the "Prefabs" list!
   * @param {(InstantiationOptions|InstantiationOptionsObj)=} options Optional settings for the instantiated object
   * @param {((networkRoot:NetworkRootInfo)=>void)=} onSuccess Callback that executes when instantiation is complete. Overrides the `onSuccess` callback in `options` if specified.
   */
  instantiate(
    prefab: ObjectPrefab,
    options?: InstantiationOptions | InstantiationOptionsObj,
    onSuccess?: (networkRoot: NetworkRootInfo) => void
  ) {
    if (!isNullOrUndefined(onSuccess)) {
      let optionsWithSuccess: InstantiationOptionsObj = options || {}
      optionsWithSuccess.onSuccess = optionsWithSuccess.onSuccess ?? onSuccess
    }
    let instantiationOptions = options || {
      onSuccess: onSuccess,
    }
    const networkId = this.generatePrefabId(prefab, options)
    if (
      !isNullOrUndefined(instantiationOptions) &&
      !isNullOrUndefined(instantiationOptions?.overrideNetworkId) &&
      networkId in this.spawnedInstances
    ) {
      this.log.d("using existing prefab already spawned")
      if (instantiationOptions.onSuccess) {
        instantiationOptions.onSuccess(this.spawnedInstances[networkId])
      }
    } else {
      this.instantiateNewPrefab(networkId, prefab, instantiationOptions)
    }
  }

  /**
   * @deprecated Use instantiate() instead
   * @param {ObjectPrefab} prefab
   * @param {((rootInfo:NetworkRootInfo)=>void)=} onSuccess
   * @param {RealtimeStoreCreateOptions.Persistence=} persistence
   * @param {boolean=} claimOwnership
   * @param {vec3=} worldPosition
   * @param {quat=} worldRotation
   * @param {vec3=} worldScale
   */
  doInstantiate(
    prefab: ObjectPrefab,
    onSuccess?: (rootInfo: NetworkRootInfo) => void,
    persistence?: RealtimeStoreCreateOptions.Persistence,
    claimOwnership?: boolean,
    worldPosition?: vec3,
    worldRotation?: quat,
    worldScale?: vec3
  ) {
    const options = {
      onSuccess: onSuccess,
      persistence: persistence,
      claimOwnership: claimOwnership,
      worldPosition: worldPosition,
      worldRotation: worldRotation,
      worldScale: worldScale,
    }
    this.instantiate(prefab, options)
  }

  /**
   * @returns {boolean}
   */
  isReady(): boolean {
    return this.syncEntity.isSetupFinished
  }

  /**
   *
   * @param {()=>void} onReady
   */
  notifyOnReady(onReady: () => void) {
    this.syncEntity.notifyOnReady(onReady)
  }
}

// These exports exist for javascript compatibility, and should not be used from typescript code.
;(global as any).InstantiationOptions = InstantiationOptions
