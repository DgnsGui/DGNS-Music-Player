"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Singleton_1 = require("../../Decorators/Singleton");
const validate_1 = require("../../Utils/validate");
const BaseCameraFinderProvider_1 = require("./BaseCameraFinderProvider");
/**
 * Holds a reference to the AR camera.
 *
 * @remarks
 * AR camera is defined as the {@link Camera} in the scene that has a {@link deviceTrackingComponent}
 *  with tracking mode set to World.
 */
let ARCameraFinderProvider = class ARCameraFinderProvider extends BaseCameraFinderProvider_1.default {
    constructor() {
        super();
        const cameraComponent = this.lookForWorldCameraComponent();
        (0, validate_1.validate)(cameraComponent);
        this.setCamera(cameraComponent);
    }
    /**
     * Augments the {@link getSameRenderTargetCamera} predicate with a check for Device
     * Tracking being World.
     *
     * @returns A {@link Camera} setup for AR.
     */
    lookForWorldCameraComponent() {
        const predicate = (object) => {
            const camera = this.getSameRenderTargetCamera(object);
            if (camera === null) {
                return null;
            }
            const deviceTracking = object.getComponent("Component.DeviceTracking");
            if (deviceTracking.getActualDeviceTrackingMode() ===
                DeviceTrackingMode.World) {
                return camera;
            }
            else {
                return null;
            }
        };
        return this.bfsFromRoot(predicate);
    }
};
ARCameraFinderProvider = __decorate([
    Singleton_1.Singleton
], ARCameraFinderProvider);
exports.default = ARCameraFinderProvider;
//# sourceMappingURL=ARCameraFinderProvider.js.map