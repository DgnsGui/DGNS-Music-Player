"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RmvPropertyStoragePropertyExample_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RmvPropertyStoragePropertyExample = void 0;
var __selfType = requireType("./RmvPropertyStoragePropertyExample");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const StorageProperty_1 = require("../../Core/StorageProperty");
const StoragePropertySet_1 = require("../../Core/StoragePropertySet");
const StorageTypes_1 = require("../../Core/StorageTypes");
const SyncEntity_1 = require("../../Core/SyncEntity");
const SyncKitLogger_1 = require("../../Utils/SyncKitLogger");
// The speed at which the property changes
const PROP_CHANGE_SPEED = 1;
let RmvPropertyStoragePropertyExample = RmvPropertyStoragePropertyExample_1 = class RmvPropertyStoragePropertyExample extends BaseScriptComponent {
    onAwake() {
        this.myRmv.mainMaterial.mainPass.baseColor = new vec4(0, 1, 0, 1);
        this.createEvent("UpdateEvent").bind(() => this.updateProp());
    }
    updateProp() {
        if (!this.syncEntity.doIOwnStore()) {
            this.log.i("Not the syncEntity owner, not changing anything.");
            return;
        }
        const stripes = (getTime() * PROP_CHANGE_SPEED) % 1;
        this.myRmv.mainMaterial.mainPass["stripes"] = stripes;
    }
    __initialize() {
        super.__initialize();
        this.log = new SyncKitLogger_1.SyncKitLogger(RmvPropertyStoragePropertyExample_1.name);
        this.myPropRmv = StorageProperty_1.StorageProperty.forMeshVisualProperty(this.myRmv, "stripes", StorageTypes_1.StorageTypes.float, true);
        this.myStoragePropertySet = new StoragePropertySet_1.StoragePropertySet([this.myPropRmv]);
        this.syncEntity = new SyncEntity_1.SyncEntity(this, this.myStoragePropertySet, true);
    }
};
exports.RmvPropertyStoragePropertyExample = RmvPropertyStoragePropertyExample;
exports.RmvPropertyStoragePropertyExample = RmvPropertyStoragePropertyExample = RmvPropertyStoragePropertyExample_1 = __decorate([
    component
], RmvPropertyStoragePropertyExample);
//# sourceMappingURL=RmvPropertyStoragePropertyExample.js.map