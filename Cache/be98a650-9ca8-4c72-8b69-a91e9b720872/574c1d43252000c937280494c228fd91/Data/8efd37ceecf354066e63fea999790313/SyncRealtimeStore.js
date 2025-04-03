"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncRealtimeStore = void 0;
var __selfType = requireType("./SyncRealtimeStore");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const NetworkIdTools_1 = require("../Core/NetworkIdTools");
const NetworkIdType_1 = require("../Core/NetworkIdType");
const SyncEntity_1 = require("../Core/SyncEntity");
/**
 * Meant to be a very simple interface for a synced entity and its RealtimeStore.
 * It doesn’t do any behaviors on its own, so it can be used just for storing and retrieving synced values.
 */
let SyncRealtimeStore = class SyncRealtimeStore extends BaseScriptComponent {
    /**
     * @returns True if the store is ready
     */
    isStoreReady() {
        return this.syncEntity.isSetupFinished;
    }
    /**
     * @returns The data store backing this entity
     */
    getStore() {
        return this.syncEntity.currentStore;
    }
    /**
     * @returns The store owner's user info
     */
    getStoreOwnerInfo() {
        return this.syncEntity.ownerInfo;
    }
    /**
     * @returns True if the current user can modify the store
     */
    canIModifyStore() {
        return this.syncEntity.canIModifyStore();
    }
    /**
     * @returns True if the store is owned by the current user
     */
    doIOwnStore() {
        return this.syncEntity.doIOwnStore();
    }
    /**
     * @returns True if the store is owned by any user
     */
    isStoreOwned() {
        return this.syncEntity.isStoreOwned();
    }
    /**
     * @param storageProperty - The storage property to add to the entity
     * @returns The storage property that was added
     */
    addStorageProperty(storageProperty) {
        return this.syncEntity.addStorageProperty(storageProperty);
    }
    __initialize() {
        super.__initialize();
        this.networkIdType = (0, NetworkIdType_1.networkIdFromString)(this.networkIdTypeString);
        this.shouldRequestOwnership = this.ownershipTypeString === "requestIfAvailable";
        this.syncEntity = new SyncEntity_1.SyncEntity(this, null, this.shouldRequestOwnership, null, new NetworkIdTools_1.NetworkIdOptions(this.networkIdType, this.customNetworkId));
        this.onStoreCreated = this.syncEntity.storeCallbacks.onStoreCreated;
        this.onStoreUpdated = this.syncEntity.storeCallbacks.onStoreUpdated;
        this.onStoreOwnershipUpdated = this.syncEntity.storeCallbacks.onStoreOwnershipUpdated;
        this.onStoreDeleted = this.syncEntity.storeCallbacks.onStoreDeleted;
        this.onSetupFinished = this.syncEntity.onSetupFinished;
        this.onOwnerUpdated = this.syncEntity.onOwnerUpdated;
    }
};
exports.SyncRealtimeStore = SyncRealtimeStore;
exports.SyncRealtimeStore = SyncRealtimeStore = __decorate([
    component
], SyncRealtimeStore);
//# sourceMappingURL=SyncRealtimeStore.js.map