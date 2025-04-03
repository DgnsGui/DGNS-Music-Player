"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleLODRenderMeshVisual = void 0;
var __selfType = requireType("./SimpleLODRenderMeshVisual");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const NativeLogger_1 = require("../../../../../Utils/NativeLogger");
const WorldCameraFinderProvider_1 = require("../../../../../Providers/CameraProvider/WorldCameraFinderProvider");
const validate_1 = require("../../../../../Utils/validate");
const log = new NativeLogger_1.default("SimpleLODRMV");
const DEFAULT_SPACER = 50;
/**
 * This class provides a naive and simple Level Of Detail (LOD) implementation for RenderMeshVisual. It switches between different meshes based on the distance from the camera to the center of the object. The class does not support fading between meshes, but simply switches to the defined mesh at the specified depth.
 *
 * USAGE:
 * - Drop this component onto a scene object.
 * - Add meshes to the meshes array.
 * - Select thresholds at the given index (or else it falls back to default).
 * - Add the material that is shared across the RenderMeshVisuals.
 */
let SimpleLODRenderMeshVisual = class SimpleLODRenderMeshVisual extends BaseScriptComponent {
    onAwake() {
        this.object = this.getSceneObject();
        this.transform = this.object.getTransform();
        const clonedMaterial = this.material.clone();
        for (let i = 0; i < this.meshes.length; i++) {
            const distanceMesh = this.meshes[i];
            const thisRMV = this.object.createComponent("RenderMeshVisual");
            thisRMV.mesh = distanceMesh;
            thisRMV.mainMaterial = clonedMaterial;
            thisRMV.enabled = false;
            this.rmvs.push(thisRMV);
            this.addDistance(this.thresholds[i] ? this.thresholds[i] : DEFAULT_SPACER);
        }
        this.rmvs[this.currentIndex].enabled = true;
        this.createEvent("UpdateEvent").bind(this.update);
    }
    __initialize() {
        super.__initialize();
        this.rmvs = [];
        this.distances = [];
        this.worldCamera = WorldCameraFinderProvider_1.default.getInstance();
        this.cameraTransform = this.worldCamera.getTransform();
        this.currentIndex = 0;
        this.setRenderOrder = (order) => {
            for (let i = 0; i < this.rmvs.length; i++) {
                const thisRmv = this.rmvs[i];
                thisRmv.setRenderOrder(order);
            }
        };
        this.addDistance = (distance) => {
            let lastDistance = 0;
            if (this.distances.length) {
                lastDistance = this.distances[this.distances.length - 1];
            }
            this.distances.push(distance + lastDistance);
        };
        this.update = () => {
            (0, validate_1.validate)(this.transform);
            //
            // check and compare distances from camera
            //
            const currentDistanceSquared = this.cameraTransform
                .getWorldPosition()
                .distanceSquared(this.transform.getWorldPosition());
            let from = 0;
            let thisIndex = 0;
            let to;
            while (thisIndex < this.distances.length) {
                to = this.distances[thisIndex] * this.distances[thisIndex];
                if (currentDistanceSquared >= from && currentDistanceSquared < to) {
                    break;
                }
                else {
                    from = to;
                    thisIndex += 1;
                }
            }
            //
            // if at a new threshold, swap the active rmv
            //
            if (thisIndex < this.rmvs.length && this.currentIndex !== thisIndex) {
                this.currentIndex = thisIndex;
                for (let rmv of this.rmvs) {
                    rmv.enabled = false;
                }
                this.rmvs[this.currentIndex].enabled = true;
            }
        };
    }
};
exports.SimpleLODRenderMeshVisual = SimpleLODRenderMeshVisual;
exports.SimpleLODRenderMeshVisual = SimpleLODRenderMeshVisual = __decorate([
    component
], SimpleLODRenderMeshVisual);
//# sourceMappingURL=SimpleLODRenderMeshVisual.js.map