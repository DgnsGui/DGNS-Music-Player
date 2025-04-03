"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionInitializer = void 0;
var __selfType = requireType("./PositionInitializer");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const SessionController_1 = require("../Core/SessionController");
const WorldCameraFinderProvider_1 = require("../SpectaclesInteractionKit/Providers/CameraProvider/WorldCameraFinderProvider");
let PositionInitializer = class PositionInitializer extends BaseScriptComponent {
    onAwake() {
        if (this.triggerOnlyForMapper &&
            !SessionController_1.SessionController.getInstance().getIsUserMapper()) {
            return;
        }
        this.worldCamera = WorldCameraFinderProvider_1.default.getInstance();
        this.objectTransform = this.sceneObject.getTransform();
        this.setObjectPosition();
    }
    setObjectPosition() {
        const head = this.worldCamera.getTransform().getWorldPosition();
        const right = this.worldCamera.getTransform().right;
        right.y = 0;
        const posX = right.normalize().uniformScale(this.positionInFrontOfCamera.x);
        const up = vec3.up();
        const posY = up.normalize().uniformScale(this.positionInFrontOfCamera.y);
        const forward = this.worldCamera.getTransform().forward;
        forward.y = 0;
        const posZ = forward
            .normalize()
            .uniformScale(this.positionInFrontOfCamera.z);
        const pos = posX.add(posY).add(posZ);
        this.objectTransform.setWorldPosition(head.add(pos));
        if (this.shouldFaceCamera) {
            this.objectTransform.setWorldRotation(quat.lookAt(pos.uniformScale(-1), vec3.up()));
        }
    }
};
exports.PositionInitializer = PositionInitializer;
exports.PositionInitializer = PositionInitializer = __decorate([
    component
], PositionInitializer);
//# sourceMappingURL=PositionInitializer.js.map