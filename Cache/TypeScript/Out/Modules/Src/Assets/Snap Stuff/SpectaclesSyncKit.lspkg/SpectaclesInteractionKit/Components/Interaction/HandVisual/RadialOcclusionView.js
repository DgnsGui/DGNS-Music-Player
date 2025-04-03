"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const animate_1 = require("../../../Utils/animate");
const Billboard_1 = require("../Billboard/Billboard");
const HandInputData_1 = require("../../../Providers/HandInputData/HandInputData");
const LensConfig_1 = require("../../../Utils/LensConfig");
const MovingAverageFilter_1 = require("../../../Utils/MovingAverageFilter");
const validate_1 = require("../../../Utils/validate");
const color_1 = require("../../../Utils/color");
const TAG = "RadialOcclusionView";
const GRADIENT_QUAD_LOCAL_SCALE = new vec3(1.5, 1.5, 1.5);
const GRADIENT_QUAD_OFFSET_LEFT = new vec3(1.5, -2.5, 0);
const DEFAULT_GRADIENT_OPACITY = 1;
const GRADIENT_SCALE_FACTOR_MOVING_AVERAGE_SIZE = 10;
const GRADIENT_QUAD_MIN_SCALE = 0.6;
const GRADIENT_QUAD_MAX_SCALE = 1;
const MIN_MEAN_AVG_FINGER_DISTANCE = 2;
const MAX_MEAN_AVG_FINGER_DISTANCE = 5;
const GRADIENT_SCALE_FACTOR_MIN = 0;
const GRADIENT_SCALE_FACTOR_MAX = 1;
const OPACITY_ANIMATION_SECS = 0.3;
const COLLIDER_RADIUS_CM = 4;
/**
 * RadialOcclusionView controls radial gradient occluder tracked to the hand
 *
 */
class RadialOcclusionView {
    constructor(config) {
        this.config = config;
        this.updateDispatcher = LensConfig_1.LensConfig.getInstance().updateDispatcher;
        this.handProvider = HandInputData_1.HandInputData.getInstance();
        this.hand = this.handProvider.getHand(this.config.handType);
        this.handVisuals = this.hand.getHandVisuals();
        /*
         * Radial gradient occlusion effect uses a quad with gradient material which
         * is billboarded towards the camera
         */
        this.gradientQuadSceneObject = this.setupGradientQuadSceneObject("gradientQuadSceneObject");
        // Animate up and down when hand collides with object, so we fade out on collision
        this.gradientOcclusionOpacity = DEFAULT_GRADIENT_OPACITY;
        this.currentAverageScaleFactor = 1;
        this.gradientScaleFactorMovingAverage = new MovingAverageFilter_1.MovingAverageFilter(GRADIENT_SCALE_FACTOR_MOVING_AVERAGE_SIZE, () => 0, (samples) => {
            return samples.reduce((a, b) => a + b, 0) / samples.length;
        });
        this.gradientOpacityCancelSet = new animate_1.CancelSet();
        // We need this secondary flag to ensure that we don't accidentally enable gradient quad during getDeltaTime() check
        this.gradientQuadEnabled = true;
        this.updateDispatcher
            .createUpdateEvent("RadialOcclusionViewUpdateEvent")
            .bind(() => {
            /**
             * Disable gradient quad when in capture mode.
             *
             * We can tell we are in capture mode when deltaTime is 0, this is because current capture
             * implementation uses a double update, where the second update is passed deltaTime 0.
             */
            if (!this.gradientQuadEnabled) {
                return;
            }
            this.gradientQuadSceneObject.enabled = getDeltaTime() !== 0;
            if (!this.gradientQuadSceneObject.enabled) {
                return;
            }
            this.updateGradientScaleFactor();
        });
        this.updateDispatcher
            .createLateUpdateEvent("RadialOcclusionViewLateUpdateEvent")
            .bind(() => {
            if (!this.gradientQuadSceneObject.enabled) {
                return;
            }
            this.updateVisuals();
        });
    }
    /**
     * Enable/disable the SceneObject's created by this class
     * @param isEnabled - boolean representing whether to enable or disable this class
     */
    set enabled(isEnabled) {
        if (this.gradientQuadSceneObject === null) {
            return;
        }
        this.gradientQuadEnabled = isEnabled;
        this.gradientQuadSceneObject.enabled = isEnabled;
    }
    /**
     * Clean up the SceneObject's created by RadialOccluderView
     */
    destroy() {
        if (this.gradientQuadSceneObject === null) {
            return;
        }
        this.gradientQuadSceneObject.destroy();
    }
    setupGradientQuadSceneObject(sceneObjectName) {
        var _a;
        (0, validate_1.validate)((_a = this.handVisuals) === null || _a === void 0 ? void 0 : _a.middleKnuckle);
        const middleKnuckleSceneObject = this.handVisuals.middleKnuckle;
        // Create the quad SceneObject to hold occlusion material
        const quadSceneObject = global.scene.createSceneObject(sceneObjectName);
        quadSceneObject.setParent(middleKnuckleSceneObject);
        quadSceneObject.getTransform().setLocalScale(GRADIENT_QUAD_LOCAL_SCALE);
        quadSceneObject
            .getTransform()
            .setLocalPosition(this.config.handType === "left"
            ? GRADIENT_QUAD_OFFSET_LEFT
            : new vec3(-1 * GRADIENT_QUAD_OFFSET_LEFT.x, GRADIENT_QUAD_OFFSET_LEFT.y, GRADIENT_QUAD_OFFSET_LEFT.z));
        // Create the mesh component to hold the gradient material
        const gradientQuadRenderMeshComponent = quadSceneObject.createComponent("Component.RenderMeshVisual");
        gradientQuadRenderMeshComponent.mesh = this.config.unitPlaneMesh;
        // Initialize the quad mesh with the occlusion material
        const gradientOcclusionMaterial = this.config.radialGradientOcclusionMaterial.clone();
        gradientQuadRenderMeshComponent.setRenderOrder(this.config.gradientQuadRenderOrder);
        gradientOcclusionMaterial.mainPass.depthTest = true;
        gradientOcclusionMaterial.mainPass.depthWrite = false;
        gradientQuadRenderMeshComponent.mainMaterial = gradientOcclusionMaterial;
        // Add a collider which is used to fade in/out the gradient when hand intersects obj with collider
        const quadColliderComponent = quadSceneObject.createComponent("Physics.ColliderComponent");
        quadColliderComponent.fitVisual = false;
        const colliderShape = Shape.createSphereShape();
        colliderShape.radius = COLLIDER_RADIUS_CM;
        quadColliderComponent.shape = colliderShape;
        this.setupColliderEvents(quadColliderComponent);
        // Add Billboard so that quad always faces the camera
        const billboardComponent = quadSceneObject.createComponent(Billboard_1.Billboard.getTypeName());
        this.configureBillboardComponent(billboardComponent);
        return quadSceneObject;
    }
    configureBillboardComponent(billboardComponent) {
        billboardComponent.xAxisEnabled = true;
        billboardComponent.yAxisEnabled = true;
        billboardComponent.zAxisEnabled = true;
        billboardComponent.axisEasing = new vec3(1, 1, 1);
        billboardComponent.axisBufferDegrees = new vec3(0, 0, 0);
    }
    setupColliderEvents(collider) {
        collider.onOverlapEnter.add(() => {
            this.animateOpacity(false);
        });
        collider.onOverlapExit.add(() => {
            this.animateOpacity(true);
        });
    }
    animateOpacity(animateUp) {
        this.gradientOpacityCancelSet();
        (0, animate_1.default)({
            cancelSet: this.gradientOpacityCancelSet,
            duration: OPACITY_ANIMATION_SECS,
            easing: "ease-in-out-back-cubic",
            start: this.gradientOcclusionOpacity,
            end: animateUp ? 1 : 0,
            update: (t) => {
                this.gradientOcclusionOpacity = t;
            },
        });
    }
    updateGradientScaleFactor() {
        var _a, _b, _c, _d;
        (0, validate_1.validate)((_a = this.handVisuals) === null || _a === void 0 ? void 0 : _a.indexTip);
        (0, validate_1.validate)((_b = this.handVisuals) === null || _b === void 0 ? void 0 : _b.indexTip);
        (0, validate_1.validate)((_c = this.handVisuals) === null || _c === void 0 ? void 0 : _c.middleTip);
        (0, validate_1.validate)((_d = this.handVisuals) === null || _d === void 0 ? void 0 : _d.ringTip);
        const thumbTipPosition = this.handVisuals.indexTip
            .getTransform()
            .getWorldPosition();
        const indexTipPosition = this.handVisuals.indexTip
            .getTransform()
            .getWorldPosition();
        const midTipPosition = this.handVisuals.middleTip
            .getTransform()
            .getWorldPosition();
        const ringTipPosition = this.handVisuals.ringTip
            .getTransform()
            .getWorldPosition();
        const thumbTipToIndexTipDistance = indexTipPosition.distance(thumbTipPosition);
        const thumbTipToMidTipDistance = midTipPosition.distance(thumbTipPosition);
        const thumbTipToRingTipDistance = ringTipPosition.distance(thumbTipPosition);
        const averageDistance = (thumbTipToIndexTipDistance +
            thumbTipToMidTipDistance +
            thumbTipToRingTipDistance) /
            3;
        const clampedAverageDistance = MathUtils.clamp(averageDistance, MIN_MEAN_AVG_FINGER_DISTANCE, MAX_MEAN_AVG_FINGER_DISTANCE);
        const scaledAverageDistance = MathUtils.remap(clampedAverageDistance, MIN_MEAN_AVG_FINGER_DISTANCE, MAX_MEAN_AVG_FINGER_DISTANCE, GRADIENT_SCALE_FACTOR_MIN, GRADIENT_SCALE_FACTOR_MAX);
        this.currentAverageScaleFactor =
            this.gradientScaleFactorMovingAverage.filter(scaledAverageDistance, Date.now());
    }
    updateVisuals() {
        if (this.gradientQuadSceneObject === null) {
            return;
        }
        const gradientQuadRenderMeshComponent = this.gradientQuadSceneObject.getComponent("RenderMeshVisual");
        gradientQuadRenderMeshComponent.mainMaterial.mainPass.baseColor = (0, color_1.withAlpha)(gradientQuadRenderMeshComponent.mainMaterial.mainPass.baseColor, this.gradientOcclusionOpacity);
        const gradientQuadLocalScale = GRADIENT_QUAD_LOCAL_SCALE.uniformScale(MathUtils.remap(this.currentAverageScaleFactor, GRADIENT_SCALE_FACTOR_MIN, GRADIENT_SCALE_FACTOR_MAX, GRADIENT_QUAD_MIN_SCALE, GRADIENT_QUAD_MAX_SCALE));
        this.gradientQuadSceneObject
            .getTransform()
            .setLocalScale(gradientQuadLocalScale);
    }
}
exports.default = RadialOcclusionView;
//# sourceMappingURL=RadialOcclusionView.js.map