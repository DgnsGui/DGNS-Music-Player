"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetEnabledIfOwner = void 0;
var __selfType = requireType("./SetEnabledIfOwner");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const NetworkUtils_1 = require("../../Core/NetworkUtils");
const SessionController_1 = require("../../Core/SessionController");
const SyncEntity_1 = require("../../Core/SyncEntity");
/**
 * Enables or disables groups of SceneObjects whenever ownership of the SyncEntity changes.
 * When the SyncEntity becomes owned by the local user, the objects in nonOwnerObjects become disabled, and
 * objects in ownerObjects become enabled.
 * When the SyncEntity becomes not owned by the local user, the objects in ownerObjects become disabled, and
 * objects in nonOwnerObjects become enabled.
 */
let SetEnabledIfOwner = class SetEnabledIfOwner extends BaseScriptComponent {
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
     * @param {ConnectedLensModule.UserInfo} ownerInfo
     */
    updateOwner(ownerInfo) {
        const isOwner = SessionController_1.SessionController.getInstance().isLocalUserConnection(ownerInfo);
        if (isOwner) {
            this.setAllEnabled(this.nonOwnerObjects, false);
            this.setAllEnabled(this.ownerObjects, true);
        }
        else {
            this.setAllEnabled(this.ownerObjects, false);
            this.setAllEnabled(this.nonOwnerObjects, true);
        }
    }
    init() {
        switch (this.targetTypeString) {
            case "SyncEntity":
                this.syncEntity = SyncEntity_1.SyncEntity.getSyncEntityOnComponent(this.syncEntityScript);
                this.syncEntity.onOwnerUpdated.add(this.updateOwner);
                this.updateOwner(this.syncEntity.ownerInfo);
                break;
            case "NetworkRoot":
                this.networkRoot = (0, NetworkUtils_1.findNetworkRoot)(this.getSceneObject());
                if (this.networkRoot) {
                    this.updateOwner(this.networkRoot.ownerInfo);
                }
                break;
        }
    }
};
exports.SetEnabledIfOwner = SetEnabledIfOwner;
exports.SetEnabledIfOwner = SetEnabledIfOwner = __decorate([
    component
], SetEnabledIfOwner);
//# sourceMappingURL=SetEnabledIfOwner.js.map