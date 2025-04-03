"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionPlane = void 0;
var __selfType = requireType("./InteractionPlane");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const InteractionManager_1 = require("../../../Core/InteractionManager/InteractionManager");
const DEFAULT_INTERACTION_ZONE_DISTANCE_CM = 20;
// The value to use to widen the interaction zone as it gets further away from the plane.
const DEFAULT_INTERACTION_ZONE_SLOPE = 0.25;
const DEFAULT_BEHIND_ZONE_DISTANCE_CM = 15;
/**
 * An InteractionPlane defines a zone which triggers near field targeting logic for HandInteractors.
 * An InteractionPlane should be added to any 2D UIs with high button density, such as ContainerFrame menus.
 * Only one InteractionPlane should be added per UI (ContainerFrame adds an InteractionPlane by default).
 */
let InteractionPlane = class InteractionPlane extends BaseScriptComponent {
    release() {
        InteractionManager_1.InteractionManager.getInstance().deregisterInteractionPlane(this);
    }
    // Manually create the mesh shape for the interaction zone to trigger NearField targeting.
    buildMeshShape() {
        const slopeOffset = DEFAULT_INTERACTION_ZONE_SLOPE * this.proximityDistance;
        const shape = Shape.createBoxShape();
        shape.size = new vec3(this.planeSize.x + slopeOffset, this.planeSize.y + slopeOffset, this.proximityDistance * 2);
        this.collider.shape = shape;
    }
    /**
     * Sets the size (in world units) of the plane's interaction zone along the local X and Y axes of the SceneObject.
     */
    set planeSize(size) {
        this._planeSize = size;
        this.buildMeshShape();
    }
    /**
     * @returns the size (in world units) of the plane's interaction zone along the local X and Y axes of the SceneObject.
     */
    get planeSize() {
        return this._planeSize;
    }
    /**
     * Sets the depth (in world units) of the plane's interaction zone along the local Z axis of the SceneObject.
     */
    set proximityDistance(distance) {
        this._proximityDistance = distance;
        this.buildMeshShape();
    }
    /**
     * Returns the depth (in world units) of the plane's interaction zone along the local Z axis of the SceneObject.
     */
    get proximityDistance() {
        return this._proximityDistance;
    }
    /**
     * Sets the depth (in world units) of the plane's behind zone along the local Z axis of the SceneObject.
     */
    set behindDistance(distance) {
        this._behindDistance = distance;
        this.buildMeshShape();
    }
    /**
     * Returns the depth (in world units) of the plane's interaction zone along the local Z axis of the SceneObject.
     */
    get behindDistance() {
        return this._behindDistance;
    }
    /**
     * Sets if the interaction zone should be drawn via debug gizmos.
     */
    set drawDebug(enabled) {
        this._drawDebug = enabled;
        this.collider.debugDrawEnabled = enabled;
    }
    /**
     * @returns if the interaction zone should be drawn via debug gizmos.
     */
    get drawDebug() {
        return this._drawDebug;
    }
    /**
     * @returns a vec3 representing the normal vector of the plane.
     */
    get normal() {
        return this.getTransform().forward;
    }
    /**
     * Returns the collider of the InteractionPlane.
     */
    get collider() {
        return this._collider;
    }
    /**
     * Project a 3D point in world space onto the InteractionPlane.
     * @param point - a 3D point in world space
     * @returns - a ZoneProjection representing the point's projection onto the plane, the distance of the point from the plane (negative if behind the plane),
     *            a boolean checking if the point resides within the interaction zone of the plane (defined by size and proximityDistance),
     *            and a boolean checking if the point resides within the behind zone of the plane (right behind the plane),
     *            or null if the point does not project onto the plane.
     */
    projectPoint(point) {
        if (!this.enabled || !this.sceneObject.isEnabledInHierarchy) {
            return null;
        }
        // This logic uses the equation of t = ((p0-l0)·n)/(l·n) with l0 + l*t = the point of intersection.
        // l0 represents point, l represents direction, p0 represents plane origin, and n represents the plane normal.
        const po = this.sceneObject.getTransform().getWorldPosition();
        const n = this.sceneObject.getTransform().forward;
        const v = po.sub(point);
        const l = n.uniformScale(-1);
        const t = v.dot(n) / l.dot(n);
        // Project the point onto the plane.
        const projectedPoint = point.add(l.uniformScale(t));
        const r = this.sceneObject.getTransform().right;
        const u = this.sceneObject.getTransform().up;
        // Get the local X and Y coordinates within the plane space to check if the point resides within the interaction zone.
        const d = projectedPoint.sub(po);
        const x = d.dot(r);
        const y = d.dot(u);
        // Get the distance of the original point from the plane.
        const distance = point.sub(projectedPoint).length * Math.sign(t);
        // Check if the point is in front of the plane, within the proximity distance threshold, and within the planeSize boundaries.
        const isWithinInteractionZone = distance >= 0 &&
            distance <= this.proximityDistance &&
            Math.abs(x) <=
                this.planeSize.x + distance * DEFAULT_INTERACTION_ZONE_SLOPE &&
            Math.abs(y) <=
                this.planeSize.y + distance * DEFAULT_INTERACTION_ZONE_SLOPE;
        // Check if the point is in behind the plane, within the behind zone distance threshold, and within the planeSize boundaries.
        const isWithinBehindZone = distance < 0 &&
            distance >= -this.behindDistance &&
            Math.abs(x) <= this.planeSize.x &&
            Math.abs(y) <= this.planeSize.y;
        // If the point is within the interaction zone, return the plane projection data. Otherwise, return null.
        const planeProjection = {
            point: projectedPoint,
            distance: distance,
            isWithinInteractionZone: isWithinInteractionZone,
            isWithinBehindZone: isWithinBehindZone,
        };
        return planeProjection;
    }
    __initialize() {
        super.__initialize();
        this._collider = this.sceneObject.createComponent("ColliderComponent");
        this.createEvent("OnDestroyEvent").bind(() => this.release());
        InteractionManager_1.InteractionManager.getInstance().registerInteractionPlane(this);
        this.buildMeshShape();
        this.collider.debugDrawEnabled = this.drawDebug;
    }
};
exports.InteractionPlane = InteractionPlane;
exports.InteractionPlane = InteractionPlane = __decorate([
    component
], InteractionPlane);
//# sourceMappingURL=InteractionPlane.js.map