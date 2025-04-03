"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetEnabledOnReady = void 0;
var __selfType = requireType("./SetEnabledOnReady");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const SessionController_1 = require("../../Core/SessionController");
const SyncEntity_1 = require("../../Core/SyncEntity");
/**
 * Enables or disables groups of SceneObjects based on the readiness of a SyncEntity, or
 * SessionController if SyncEntity is not set.
 * When this script first runs, if the SyncEntity or SessionController is not ready, objects in readyObjects
 * will be disabled, and objects in notReadyObjects will be enabled.
 * As soon as the SyncEntity or SessionController are ready (including when the script first runs),
 * objects in notReadyObjects will be disabled, and objects in readyObjects will be enabled.
 */
let SetEnabledOnReady = class SetEnabledOnReady extends BaseScriptComponent {
    onAwake() {
        this.createEvent("OnStartEvent").bind(() => this.init());
    }
    /**
     *
     * @param {SceneObject[]} objects
     * @param {boolean} enabled
     */
    setAllEnabled(objects, enabled) {
        for (let i = 0; i < objects.length; i++) {
            objects[i].enabled = enabled;
        }
    }
    /**
     *
     */
    updateReady() {
        const isReady = this.targetTypeString === "SyncEntity"
            ? this.syncEntity.isSetupFinished
            : SessionController_1.SessionController.getInstance().getIsReady();
        if (isReady) {
            this.setAllEnabled(this.notReadyObjects, false);
            this.setAllEnabled(this.readyObjects, true);
        }
        else {
            this.setAllEnabled(this.readyObjects, false);
            this.setAllEnabled(this.notReadyObjects, true);
        }
    }
    init() {
        switch (this.targetTypeString) {
            case "SyncEntity":
                this.syncEntity = SyncEntity_1.SyncEntity.getSyncEntityOnComponent(this.syncEntityScript);
                this.syncEntity.onSetupFinished.add(() => this.updateReady());
                this.updateReady();
                break;
            case "NetworkRoot":
                SessionController_1.SessionController.getInstance().notifyOnReady(() => this.updateReady());
                this.updateReady();
                break;
        }
    }
};
exports.SetEnabledOnReady = SetEnabledOnReady;
exports.SetEnabledOnReady = SetEnabledOnReady = __decorate([
    component
], SetEnabledOnReady);
//# sourceMappingURL=SetEnabledOnReady.js.map