"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var InstantiateOnceExample_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstantiateOnceExample = void 0;
var __selfType = requireType("./InstantiateOnceExample");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const Instantiator_1 = require("../Components/Instantiator");
const SyncEntity_1 = require("../Core/SyncEntity");
const SyncKitLogger_1 = require("../Utils/SyncKitLogger");
let InstantiateOnceExample = InstantiateOnceExample_1 = class InstantiateOnceExample extends BaseScriptComponent {
    onAwake() {
        this.syncEntity.notifyOnReady(() => {
            this.onReady();
        });
    }
    onReady() {
        if (this.syncEntity.doIOwnStore()) {
            this.instantiator.notifyOnReady(() => {
                const options = new Instantiator_1.InstantiationOptions();
                options.claimOwnership = this.claimOwnership;
                this.instantiator.instantiate(this.prefab, options);
            });
        }
    }
    __initialize() {
        super.__initialize();
        this.log = new SyncKitLogger_1.SyncKitLogger(InstantiateOnceExample_1.name);
        this.syncEntity = new SyncEntity_1.SyncEntity(this, null, true);
    }
};
exports.InstantiateOnceExample = InstantiateOnceExample;
exports.InstantiateOnceExample = InstantiateOnceExample = InstantiateOnceExample_1 = __decorate([
    component
], InstantiateOnceExample);
//# sourceMappingURL=InstantiateOnceExample.js.map