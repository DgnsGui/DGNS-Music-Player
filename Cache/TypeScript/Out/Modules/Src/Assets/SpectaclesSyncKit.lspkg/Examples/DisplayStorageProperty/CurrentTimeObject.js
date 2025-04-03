"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentTimeObject = void 0;
var __selfType = requireType("./CurrentTimeObject");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const StorageProperty_1 = require("../../Core/StorageProperty");
const StoragePropertySet_1 = require("../../Core/StoragePropertySet");
const SyncEntity_1 = require("../../Core/SyncEntity");
let CurrentTimeObject = class CurrentTimeObject extends BaseScriptComponent {
    onAwake() {
        this.createEvent("UpdateEvent").bind(() => this.onUpdate());
    }
    onUpdate() {
        if (this.syncEntity.doIOwnStore()) {
            this.currentTimeStorageProperty.setPendingValue(Math.floor(getTime()));
        }
    }
    __initialize() {
        super.__initialize();
        this.currentTimeStorageProperty = StorageProperty_1.StorageProperty.manualInt("currentTime", 0);
        this.storagePropertySet = new StoragePropertySet_1.StoragePropertySet([
            this.currentTimeStorageProperty,
        ]);
        this.syncEntity = new SyncEntity_1.SyncEntity(this, this.storagePropertySet, true);
    }
};
exports.CurrentTimeObject = CurrentTimeObject;
exports.CurrentTimeObject = CurrentTimeObject = __decorate([
    component
], CurrentTimeObject);
//# sourceMappingURL=CurrentTimeObject.js.map