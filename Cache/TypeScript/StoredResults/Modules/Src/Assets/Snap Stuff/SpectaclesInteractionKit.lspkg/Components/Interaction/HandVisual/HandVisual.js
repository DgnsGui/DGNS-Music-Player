"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandVisual = exports.HandVisualSelection = void 0;
var __selfType = requireType("./HandVisual");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const HandInputData_1 = require("../../../Providers/HandInputData/HandInputData");
const InteractionConfigurationProvider_1 = require("../../../Providers/InteractionConfigurationProvider/InteractionConfigurationProvider");
const InputChecker_1 = require("../../../Utils/InputChecker");
const SceneObjectUtils_1 = require("../../../Utils/SceneObjectUtils");
const validate_1 = require("../../../Utils/validate");
const GlowEffectView_1 = require("./GlowEffectView");
const RadialOcclusionView_1 = require("./RadialOcclusionView");
const TAG = "HandVisual";
var HandVisualSelection;
(function (HandVisualSelection) {
    HandVisualSelection["Default"] = "Default";
    HandVisualSelection["Occluder"] = "Occluder";
})(HandVisualSelection || (exports.HandVisualSelection = HandVisualSelection = {}));
/**
 * This class provides a visual representation of the hand, with the ability to automatically wire joints to the hand mesh. It also provides the ability to add a radial gradient occlusion effect and a glow effect to the hand mesh.
 */
let HandVisual = class HandVisual extends BaseScriptComponent {
    /**
     * Sets the selection of the hand visual to present to user
     */
    set visualSelection(selection) {
        var _a;
        this._handVisualSelection = selection;
        (_a = this.glowEffectView) === null || _a === void 0 ? void 0 : _a.setVisualSelection(selection);
    }
    /**
     * @returns the current selection of the hand visual to present to user
     */
    get visualSelection() {
        return this._handVisualSelection;
    }
    defineScriptEvents() {
        this.createEvent("OnStartEvent").bind(() => {
            this.initialize();
        });
        this.createEvent("OnEnableEvent").bind(() => {
            this.defineOnEnableBehavior();
        });
        this.createEvent("OnDisableEvent").bind(() => {
            this.defineOnDisableBehavior();
        });
        this.createEvent("OnDestroyEvent").bind(() => {
            this.defineOnDestroyBehavior();
        });
    }
    defineOnEnableBehavior() {
        this.setEnabled(true);
    }
    defineOnDisableBehavior() {
        this.setEnabled(false);
    }
    defineOnDestroyBehavior() {
        var _a;
        if (this.glowEffectView !== undefined) {
            this.glowEffectView.destroy();
        }
        if (this.radialOcclusionView !== undefined) {
            this.radialOcclusionView.destroy();
        }
        (_a = this.hand) === null || _a === void 0 ? void 0 : _a.detachHandVisuals(this);
    }
    defineHandEvents() {
        (0, validate_1.validate)(this.hand);
        this.hand.onEnabledChanged.add((enabled) => {
            this._enabled = enabled;
            // We shouldn't turn on the hand visuals until the hand has actually been found.
            if (!enabled) {
                this.setEnabled(false);
            }
        });
        this.hand.onHandFound.add(() => {
            if (this._enabled) {
                this.setEnabled(true);
            }
        });
        this.hand.onHandLost.add(() => {
            if (this._enabled) {
                this.setEnabled(false);
            }
        });
    }
    getJointSceneObject(targetSceneObjectName, root) {
        var _a;
        const sceneObject = (0, SceneObjectUtils_1.findSceneObjectByName)(root, targetSceneObjectName);
        if (sceneObject === null) {
            throw new Error(`${targetSceneObjectName} could not be found in children of SceneObject: ${(_a = this.root) === null || _a === void 0 ? void 0 : _a.name}`);
        }
        return sceneObject;
    }
    setEnabled(enabled) {
        if (this.glowEffectView !== undefined) {
            this.glowEffectView.enabled = enabled;
        }
        if (this.radialOcclusionView !== undefined) {
            this.radialOcclusionView.enabled = enabled;
        }
        this.handMesh.enabled = enabled;
    }
    onAwake() {
        if (this.handType !== "right") {
            this.hand = this.handProvider.getHand("left");
        }
        else {
            this.hand = this.handProvider.getHand("right");
        }
        this.hand.attachHandVisuals(this);
        this.defineHandEvents();
        this.defineScriptEvents();
        this.handMesh.setRenderOrder(this.handMeshRenderOrder);
        /*
         * HandVisuals were not working correctly with frustum culling,
         * instead manually define the AABB for frustum culling
         */
        const min = this.handMesh.mesh.aabbMin;
        const max = this.handMesh.mesh.aabbMax;
        const pass = this.handMesh.mainMaterial.mainPass;
        pass.frustumCullMode = FrustumCullMode.UserDefinedAABB;
        pass.frustumCullMin = min;
        pass.frustumCullMax = max;
    }
    initialize() {
        if (this.initialized) {
            return;
        }
        (0, validate_1.validate)(this.hand);
        this.wrist = this.autoJointMapping
            ? this.getJointSceneObject("wrist", this.root)
            : this.wrist;
        this.thumbToWrist = this.autoJointMapping
            ? this.getJointSceneObject("wrist_to_thumb", this.root)
            : this.thumbToWrist;
        this.thumbBaseJoint = this.autoJointMapping
            ? this.getJointSceneObject("thumb-0", this.root)
            : this.thumbBaseJoint;
        this.thumbKnuckle = this.autoJointMapping
            ? this.getJointSceneObject("thumb-1", this.root)
            : this.thumbKnuckle;
        this.thumbMidJoint = this.autoJointMapping
            ? this.getJointSceneObject("thumb-2", this.root)
            : this.thumbMidJoint;
        this.thumbTip = this.autoJointMapping
            ? this.getJointSceneObject("thumb-3", this.root)
            : this.thumbTip;
        this.indexToWrist = this.autoJointMapping
            ? this.getJointSceneObject("wrist_to_index", this.root)
            : this.indexToWrist;
        this.indexKnuckle = this.autoJointMapping
            ? this.getJointSceneObject("index-0", this.root)
            : this.indexKnuckle;
        this.indexMidJoint = this.autoJointMapping
            ? this.getJointSceneObject("index-1", this.root)
            : this.indexMidJoint;
        this.indexUpperJoint = this.autoJointMapping
            ? this.getJointSceneObject("index-2", this.root)
            : this.indexUpperJoint;
        this.indexTip = this.autoJointMapping
            ? this.getJointSceneObject("index-3", this.root)
            : this.indexTip;
        this.middleToWrist = this.autoJointMapping
            ? this.getJointSceneObject("wrist_to_mid", this.root)
            : this.middleToWrist;
        this.middleKnuckle = this.autoJointMapping
            ? this.getJointSceneObject("mid-0", this.root)
            : this.middleKnuckle;
        this.middleMidJoint = this.autoJointMapping
            ? this.getJointSceneObject("mid-1", this.root)
            : this.middleMidJoint;
        this.middleUpperJoint = this.autoJointMapping
            ? this.getJointSceneObject("mid-2", this.root)
            : this.middleUpperJoint;
        this.middleTip = this.autoJointMapping
            ? this.getJointSceneObject("mid-3", this.root)
            : this.middleTip;
        this.ringToWrist = this.autoJointMapping
            ? this.getJointSceneObject("wrist_to_ring", this.root)
            : this.ringToWrist;
        this.ringKnuckle = this.autoJointMapping
            ? this.getJointSceneObject("ring-0", this.root)
            : this.ringKnuckle;
        this.ringMidJoint = this.autoJointMapping
            ? this.getJointSceneObject("ring-1", this.root)
            : this.ringMidJoint;
        this.ringUpperJoint = this.autoJointMapping
            ? this.getJointSceneObject("ring-2", this.root)
            : this.ringUpperJoint;
        this.ringTip = this.autoJointMapping
            ? this.getJointSceneObject("ring-3", this.root)
            : this.ringTip;
        this.pinkyToWrist = this.autoJointMapping
            ? this.getJointSceneObject("wrist_to_pinky", this.root)
            : this.pinkyToWrist;
        this.pinkyKnuckle = this.autoJointMapping
            ? this.getJointSceneObject("pinky-0", this.root)
            : this.pinkyKnuckle;
        this.pinkyMidJoint = this.autoJointMapping
            ? this.getJointSceneObject("pinky-1", this.root)
            : this.pinkyMidJoint;
        this.pinkyUpperJoint = this.autoJointMapping
            ? this.getJointSceneObject("pinky-2", this.root)
            : this.pinkyUpperJoint;
        this.pinkyTip = this.autoJointMapping
            ? this.getJointSceneObject("pinky-3", this.root)
            : this.pinkyTip;
        this.initialized = true;
        // The joints are now ready and the effects can be initialized
        this.hand.initHandVisuals();
        this.glowEffectView = new GlowEffectView_1.GlowEffectView({
            handType: this.handType,
            unitPlaneMesh: this.unitPlaneMesh,
            tipGlowMaterial: this.tipGlowMaterial,
            idleColor: this.idleColor,
            pinchDownColor: this.pinchDownColor,
            tapProximityThreshold: this.tapProximityThreshold,
            tapTexture: this.tapTexture,
            pinchTexture: this.pinchTexture,
            tipGlowRenderOrder: this.tipGlowRenderOrder,
            handInteractor: this.handInteractor,
            visualSelection: this._handVisualSelection,
            handOutlineMaterial: this.handOutlineMaterial,
            handOccluderMaterial: this.handOccluderMaterial,
            shouldThumbPokeGlow: this.shouldThumbPokeGlow,
        });
        if (!this.occluderEnabled) {
            return;
        }
        this.radialOcclusionView = new RadialOcclusionView_1.default({
            handType: this.handType,
            unitPlaneMesh: this.occluderUnitPlaneMesh,
            radialGradientOcclusionMaterial: this.radialGradientOcclusionMaterial,
            gradientQuadRenderOrder: this.gradientQuadRenderOrder,
        });
    }
    __initialize() {
        super.__initialize();
        this.handProvider = HandInputData_1.HandInputData.getInstance();
        this.interactionConfigurationProvider = InteractionConfigurationProvider_1.InteractionConfigurationProvider.getInstance();
        this.inputChecker = new InputChecker_1.InputChecker(TAG);
        this._enabled = true;
        this._handVisualSelection = this
            .selectVisual;
        this.initialized = false;
    }
};
exports.HandVisual = HandVisual;
exports.HandVisual = HandVisual = __decorate([
    component
], HandVisual);
//# sourceMappingURL=HandVisual.js.map