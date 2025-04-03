"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CyclingMaterialExample_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CyclingMaterialExample = void 0;
var __selfType = requireType("./CyclingMaterialExample");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const SyncEntity_1 = require("../Core/SyncEntity");
const SyncKitLogger_1 = require("../Utils/SyncKitLogger");
let CyclingMaterialExample = CyclingMaterialExample_1 = class CyclingMaterialExample extends BaseScriptComponent {
    onAwake() {
        this.createEvent("UpdateEvent").bind(() => this.updateMaterial());
    }
    updateMaterial() {
        if (!this.syncEntity.doIOwnStore()) {
            return;
        }
        const myMaterial = this.myRmv.mainMaterial;
        const myPass = myMaterial.mainPass;
        // Set these to reasonable cycling values
        const stripiness = Math.sin(getTime() * 2) * 0.5 + 0.5;
        const enableStripes = Math.floor(getTime() * 0.5) % 2 === 0;
        const stripeColor = new vec4(getTime() % 1, 0, 1, 1);
        const stripeScale = new vec2(1, 1).uniformScale((1 + (getTime() % 1)) * 20);
        myPass.stripeColor = stripeColor;
        myPass.stripeScale = stripeScale;
        myPass.stripes = stripiness;
        myPass.enableStripes = enableStripes;
    }
    __initialize() {
        super.__initialize();
        this.log = new SyncKitLogger_1.SyncKitLogger(CyclingMaterialExample_1.name);
        this.syncEntity = new SyncEntity_1.SyncEntity(this, null, true);
    }
};
exports.CyclingMaterialExample = CyclingMaterialExample;
exports.CyclingMaterialExample = CyclingMaterialExample = CyclingMaterialExample_1 = __decorate([
    component
], CyclingMaterialExample);
//# sourceMappingURL=CyclingMaterialExample.js.map