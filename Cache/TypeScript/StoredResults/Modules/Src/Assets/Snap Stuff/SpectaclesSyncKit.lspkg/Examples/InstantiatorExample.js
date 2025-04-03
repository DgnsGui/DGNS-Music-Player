"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var InstantiatorExample_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstantiatorExample = void 0;
var __selfType = requireType("./InstantiatorExample");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const SyncKitLogger_1 = require("../Utils/SyncKitLogger");
let InstantiatorExample = InstantiatorExample_1 = class InstantiatorExample extends BaseScriptComponent {
    onAwake() {
        this.instantiator.notifyOnReady(() => {
            this.onReady();
        });
    }
    onReady() {
        this.log.i("Example Component: The instantiator is ready!");
        this.instantiator.instantiate(this.prefab);
    }
    __initialize() {
        super.__initialize();
        this.log = new SyncKitLogger_1.SyncKitLogger(InstantiatorExample_1.name);
    }
};
exports.InstantiatorExample = InstantiatorExample;
exports.InstantiatorExample = InstantiatorExample = InstantiatorExample_1 = __decorate([
    component
], InstantiatorExample);
//# sourceMappingURL=InstantiatorExample.js.map