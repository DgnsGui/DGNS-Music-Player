"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrollBarFeedback = void 0;
var __selfType = requireType("./ScrollBarFeedback");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const animate_1 = require("../../Utils/animate");
const Interactable_1 = require("../Interaction/Interactable/Interactable");
const ScrollBar_1 = require("../UI/ScrollBar/ScrollBar");
const mathUtils_1 = require("../../Utils/mathUtils");
const validate_1 = require("../../Utils/validate");
const BLENDSHAPE_NAME = "Size";
const SCALE_TWEEN_DURATION = 0.2;
const HOVER_SCALE = 0.75;
/**
 * This class provides visual feedback for a scrollbar by adjusting its size and scale based on interaction events such as hover. It uses animation utilities to smoothly transition between states.
 */
let ScrollBarFeedback = class ScrollBarFeedback extends BaseScriptComponent {
    onAwake() {
        this.init();
    }
    __initialize() {
        super.__initialize();
        this.size = 0;
        this.interactable = null;
        this.scrollbar = null;
        this.isHovering = false;
        this.scaleCancel = new animate_1.CancelSet();
        this.init = () => {
            this.interactable = this.scrollbarObject.getComponent(Interactable_1.Interactable.getTypeName());
            if (isNull(this.interactable)) {
                throw new Error("Interactable component not found in this entity!");
            }
            this.scrollbar = this.scrollbarObject.getComponent(ScrollBar_1.ScrollBar.getTypeName());
            if (isNull(this.scrollbar)) {
                throw new Error("ScrollBar component not found in this entity!");
            }
            this.renderMeshVisual = this.getSceneObject().getComponent("Component.RenderMeshVisual");
            if (this.renderMeshVisual === undefined) {
                throw new Error("RenderMeshVisual component not found in this entity!");
            }
            this.size = this.renderMeshVisual.getBlendShapeWeight(BLENDSHAPE_NAME);
            this.renderMeshVisual.mainPass.size = this.size;
            this.createEvent("OnStartEvent").bind(this.setupInteractableCallbacks);
        };
        this.setupInteractableCallbacks = () => {
            (0, validate_1.validate)(this.interactable);
            this.interactable.onHoverEnter.add(this.initializeHoverState);
            this.interactable.onHoverExit.add(this.resetHoverState);
            this.interactable.onTriggerStart.add(this.initializeTriggerState);
            this.interactable.onTriggerEnd.add(this.resetTriggerState);
            this.interactable.onTriggerUpdate.add(this.onTriggerUpdate);
        };
        this.initializeHoverState = () => {
            if (this.renderMeshVisual !== undefined) {
                this.renderMeshVisual.mainPass.status = 1.0;
                this.renderMeshVisual.mainPass.scale = HOVER_SCALE;
                this.renderMeshVisual.mainPass.offset = this.getPercentage();
                this.isHovering = true;
            }
        };
        this.resetHoverState = () => {
            if (this.renderMeshVisual !== undefined) {
                this.renderMeshVisual.mainPass.status = 0.0;
                this.renderMeshVisual.mainPass.scale = 0.0;
                this.isHovering = false;
            }
        };
        this.initializeTriggerState = () => {
            if (this.renderMeshVisual !== undefined) {
                this.renderMeshVisual.mainPass.offset = this.getPercentage();
                this.tweenScale(0.75, 1.0);
            }
        };
        this.resetTriggerState = () => {
            if (this.renderMeshVisual !== undefined) {
                this.renderMeshVisual.mainPass.gradientScale = 0.03;
                this.tweenScale(1.0, 0.75);
            }
        };
        this.onTriggerUpdate = () => {
            if (this.renderMeshVisual !== undefined) {
                this.renderMeshVisual.mainPass.offset = this.getPercentage();
            }
        };
        this.tweenScale = (currentScale, targetScale, endCallback = () => { }) => {
            if (this.scaleCancel)
                this.scaleCancel.cancel();
            (0, animate_1.default)({
                duration: SCALE_TWEEN_DURATION * Math.abs(targetScale - currentScale),
                update: (t) => {
                    if (this.renderMeshVisual !== undefined) {
                        this.renderMeshVisual.mainPass.scale = (0, mathUtils_1.lerp)(currentScale, targetScale, t);
                    }
                },
                ended: endCallback,
                cancelSet: this.scaleCancel,
            });
        };
        this.getPercentage = () => {
            (0, validate_1.validate)(this.scrollbar);
            return MathUtils.remap(this.scrollbar.scrollPercentage, 0.0, 1.0, 0.03, 0.97);
        };
    }
};
exports.ScrollBarFeedback = ScrollBarFeedback;
exports.ScrollBarFeedback = ScrollBarFeedback = __decorate([
    component
], ScrollBarFeedback);
//# sourceMappingURL=ScrollBarFeedback.js.map