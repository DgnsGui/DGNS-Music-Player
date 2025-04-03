"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncTransform = void 0;
var __selfType = requireType("./SyncTransform");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const NetworkIdTools_1 = require("../Core/NetworkIdTools");
const NetworkIdType_1 = require("../Core/NetworkIdType");
const PersistenceType_1 = require("../Core/PersistenceType");
const PropertyType_1 = require("../Core/PropertyType");
const StorageProperty_1 = require("../Core/StorageProperty");
const StoragePropertySet_1 = require("../Core/StoragePropertySet");
const SyncEntity_1 = require("../Core/SyncEntity");
/**
 * Add this to any SceneObject to automatically synchronize its position, rotation, and/or scale,
 * depending on the settings chosen in the Inspector panel.
 */
let SyncTransform = class SyncTransform extends BaseScriptComponent {
    __initialize() {
        super.__initialize();
        this.networkIdType = (0, NetworkIdType_1.networkIdFromString)(this.networkIdTypeString);
        this.positionSync = (0, PropertyType_1.propertyTypeFromString)(this.positionSyncString);
        this.rotationSync = (0, PropertyType_1.propertyTypeFromString)(this.rotationSyncString);
        this.scaleSync = (0, PropertyType_1.propertyTypeFromString)(this.scaleSyncString);
        this.persistence = (0, PersistenceType_1.persistenceTypeFromString)(this.persistenceString);
        this.currentTransform = this.getTransform();
        this.transformProp = StorageProperty_1.StorageProperty.forTransform(this.currentTransform, this.positionSync, this.rotationSync, this.scaleSync, this.useSmoothing ? { interpolationTarget: this.interpolationTarget } : null);
        this.storageProps = new StoragePropertySet_1.StoragePropertySet([this.transformProp]);
        this.syncEntity = new SyncEntity_1.SyncEntity(this, this.storageProps, false, this.persistence, new NetworkIdTools_1.NetworkIdOptions(this.networkIdType, this.customNetworkId));
        this.transformProp.sendsPerSecondLimit = this.sendsPerSecondLimit;
    }
};
exports.SyncTransform = SyncTransform;
exports.SyncTransform = SyncTransform = __decorate([
    component
], SyncTransform);
//# sourceMappingURL=SyncTransform.js.map