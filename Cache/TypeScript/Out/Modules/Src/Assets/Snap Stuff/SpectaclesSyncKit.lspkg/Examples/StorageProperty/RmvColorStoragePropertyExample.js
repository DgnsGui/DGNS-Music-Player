"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ColorStoragePropertyExample_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorStoragePropertyExample = void 0;
var __selfType = requireType("./RmvColorStoragePropertyExample");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const StorageProperty_1 = require("../../Core/StorageProperty");
const StoragePropertySet_1 = require("../../Core/StoragePropertySet");
const SyncEntity_1 = require("../../Core/SyncEntity");
const color_1 = require("../../SpectaclesInteractionKit/Utils/color");
const SyncKitLogger_1 = require("../../Utils/SyncKitLogger");
// The speed at which the hue changes
const COLOR_CHANGE_SPEED = 30;
let ColorStoragePropertyExample = ColorStoragePropertyExample_1 = class ColorStoragePropertyExample extends BaseScriptComponent {
    onAwake() {
        this.createEvent("UpdateEvent").bind(() => this.updateColor());
    }
    updateColor() {
        if (!this.syncEntity.doIOwnStore()) {
            this.log.i("Not the syncEntity owner, not changing anything.");
            return;
        }
        const numChars = getTime() * COLOR_CHANGE_SPEED;
        const newColor = (0, color_1.HSLToRGB)(new vec3(numChars % 360, 1, 0.5));
        this.myRmv.mainMaterial.mainPass.baseColor = new vec4(newColor.x, newColor.y, newColor.z, 1);
    }
    __initialize() {
        super.__initialize();
        this.log = new SyncKitLogger_1.SyncKitLogger(ColorStoragePropertyExample_1.name);
        this.myPropRmv = StorageProperty_1.StorageProperty.forMeshVisualBaseColor(this.myRmv, true);
        this.myStoragePropertySet = new StoragePropertySet_1.StoragePropertySet([this.myPropRmv]);
        this.syncEntity = new SyncEntity_1.SyncEntity(this, this.myStoragePropertySet, true);
    }
};
exports.ColorStoragePropertyExample = ColorStoragePropertyExample;
exports.ColorStoragePropertyExample = ColorStoragePropertyExample = ColorStoragePropertyExample_1 = __decorate([
    component
], ColorStoragePropertyExample);
//# sourceMappingURL=RmvColorStoragePropertyExample.js.map