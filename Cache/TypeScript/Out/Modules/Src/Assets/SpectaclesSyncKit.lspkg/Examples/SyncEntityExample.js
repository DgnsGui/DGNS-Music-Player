"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SyncEntityExample_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncEntityExample = void 0;
var __selfType = requireType("./SyncEntityExample");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const SyncEntity_1 = require("../Core/SyncEntity");
const SyncKitLogger_1 = require("../Utils/SyncKitLogger");
let SyncEntityExample = SyncEntityExample_1 = class SyncEntityExample extends BaseScriptComponent {
    onAwake() {
        let syncEntity = new SyncEntity_1.SyncEntity(this, null, true);
        syncEntity.notifyOnReady(() => this.onReady());
    }
    onReady() {
        this.log.i("Example Component: The sync entity is ready!");
    }
    __initialize() {
        super.__initialize();
        this.log = new SyncKitLogger_1.SyncKitLogger(SyncEntityExample_1.name);
    }
};
exports.SyncEntityExample = SyncEntityExample;
exports.SyncEntityExample = SyncEntityExample = SyncEntityExample_1 = __decorate([
    component
], SyncEntityExample);
//# sourceMappingURL=SyncEntityExample.js.map