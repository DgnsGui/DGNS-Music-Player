"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncMaterials = void 0;
var __selfType = requireType("./SyncMaterials");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const NetworkIdTools_1 = require("../Core/NetworkIdTools");
const NetworkIdType_1 = require("../Core/NetworkIdType");
const StorageProperty_1 = require("../Core/StorageProperty");
const StoragePropertySet_1 = require("../Core/StoragePropertySet");
const StorageTypes_1 = require("../Core/StorageTypes");
const SyncEntity_1 = require("../Core/SyncEntity");
const SyncKitLogger_1 = require("../Utils/SyncKitLogger");
const TAG = "SyncMaterials";
/**
 * Synchronizes material properties across the network.
 * Add this to a SceneObject and assign the material you want synchronized in Main Material.
 * Add each property name you want synchronized to the Property Names list.
 * Any changes to these properties will be automatically synchronized across the network.
 */
let SyncMaterials = class SyncMaterials extends BaseScriptComponent {
    onAwake() {
        if (!this.mainMaterial) {
            this.log.e("You need to set mainMaterial!");
            return;
        }
        if (this.autoClone) {
            this.newMat = this.mainMaterial.clone();
            const visuals = this.getComponentsRecursive(this.getSceneObject(), "MaterialMeshVisual");
            for (let i = 0; i < visuals.length; i++) {
                const materials = visuals[i].materials;
                let needsToUpdateMaterials = false;
                for (let j = 0; j < materials.length; j++) {
                    // If a material matches the one we cloned, we need to replace it with the new, cloned material
                    if (this.mainMaterial.isSame(materials[j])) {
                        materials[j] = this.newMat;
                        needsToUpdateMaterials = true;
                    }
                }
                // Our material list was provided as a copy, so if any materials were changed, we need to overwrite the visual's material list using our new version
                if (needsToUpdateMaterials) {
                    visuals[i].materials = materials;
                }
            }
        }
        else {
            this.newMat = this.mainMaterial;
        }
        const mainPass = this.newMat.mainPass;
        for (let i = 0; i < this.propertyNames.length; i++) {
            const propName = this.propertyNames[i];
            const propVal = mainPass[propName];
            const type = this.deduceStorageType(propVal);
            const newProp = StorageProperty_1.StorageProperty.forMaterialProperty(this.newMat, propName, type);
            this.storageProps.addProperty(newProp);
        }
    }
    deduceStorageType(propValue) {
        switch (typeof propValue) {
            case "number":
                return StorageTypes_1.StorageTypes.float;
            case "boolean":
                return StorageTypes_1.StorageTypes.bool;
            case "string":
                return StorageTypes_1.StorageTypes.string;
            case "object":
                if (propValue instanceof vec2) {
                    return StorageTypes_1.StorageTypes.vec2;
                }
                else if (propValue instanceof vec3) {
                    return StorageTypes_1.StorageTypes.vec3;
                }
                else if (propValue instanceof vec4) {
                    return StorageTypes_1.StorageTypes.vec4;
                }
                else if (propValue instanceof quat) {
                    return StorageTypes_1.StorageTypes.quat;
                }
                else if (propValue instanceof mat2) {
                    return StorageTypes_1.StorageTypes.mat2;
                }
                else if (propValue instanceof mat3) {
                    return StorageTypes_1.StorageTypes.mat3;
                }
                else if (propValue instanceof mat4) {
                    return StorageTypes_1.StorageTypes.mat4;
                }
        }
    }
    /**
     * Returns a list of all Components of `componentType` found in the object and its descendents.
     * @param object - Object to search
     * @param componentType - Component type name to search for
     * @param results - Optional list to store results in
     * @returns An array of matching Components in `object` and descendants
     */
    getComponentsRecursive(object, componentType, results) {
        results = results || [];
        const components = object.getComponents(componentType);
        for (let i = 0; i < components.length; i++) {
            results.push(components[i]);
        }
        const childCount = object.getChildrenCount();
        for (let j = 0; j < childCount; j++) {
            this.getComponentsRecursive(object.getChild(j), componentType, results);
        }
        return results;
    }
    __initialize() {
        super.__initialize();
        this.networkIdType = (0, NetworkIdType_1.networkIdFromString)(this.networkIdTypeString);
        this.log = new SyncKitLogger_1.SyncKitLogger(TAG);
        this.storageProps = new StoragePropertySet_1.StoragePropertySet();
        this.syncEntity = new SyncEntity_1.SyncEntity(this, this.storageProps, null, null, new NetworkIdTools_1.NetworkIdOptions(this.networkIdType, this.customNetworkId));
    }
};
exports.SyncMaterials = SyncMaterials;
exports.SyncMaterials = SyncMaterials = __decorate([
    component
], SyncMaterials);
//# sourceMappingURL=SyncMaterials.js.map