"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SliderFeedback = void 0;
var __selfType = requireType("./SliderFeedback");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const Interactable_1 = require("../../Components/Interaction/Interactable/Interactable");
const Slider_1 = require("../../Components/UI/Slider/Slider");
const validate_1 = require("../../Utils/validate");
const SLIDER_LEVEL_MIN = 0.1;
const SLIDER_LEVEL_MAX = 0.9;
/**
 * This class provides visual feedback for a slider component. It manages the appearance of the slider's knob and track based on interaction events and the slider's value.
 */
let SliderFeedback = class SliderFeedback extends BaseScriptComponent {
    onAwake() {
        this.init();
    }
    __initialize() {
        super.__initialize();
        this.interactable = null;
        this.slider = null;
        this.currentValue = 0;
        this.init = () => {
            if (isNull(this.renderMeshVisual)) {
                throw new Error("No RenderMeshVisual component attached to this entity!");
            }
            if (isNull(this.knobObject)) {
                throw new Error("No knobObject attached to this entity!");
            }
            this.renderMeshVisual.mainMaterial = this.renderMeshVisual
                .getMaterial(0)
                .clone();
            this.interactable = this.knobObject.getComponent(Interactable_1.Interactable.getTypeName());
            if (isNull(this.interactable)) {
                throw new Error("Interactable component not found in this entity!");
            }
            this.slider = this.getSceneObject().getComponent(Slider_1.Slider.getTypeName());
            if (isNull(this.slider)) {
                throw new Error("No Slider component attached to this entity!");
            }
            this.createEvent("OnStartEvent").bind(() => {
                var _a;
                (0, validate_1.validate)(this.slider);
                (0, validate_1.validate)(this.renderMeshVisual);
                this.currentValue = this.slider.startValue;
                this.renderMeshVisual.mainPass.level = this.getSliderLevelFromValue((_a = this.slider.currentValue) !== null && _a !== void 0 ? _a : 0);
                this.setupSliderCallbacks();
            });
        };
        this.getSliderLevelFromValue = (value) => {
            (0, validate_1.validate)(this.slider);
            if (value <= this.slider.minValue) {
                return 0;
            }
            else if (value >= this.slider.maxValue) {
                return 1;
            }
            else {
                const progress = (value - this.slider.minValue) /
                    (this.slider.maxValue - this.slider.minValue);
                return SLIDER_LEVEL_MIN + (SLIDER_LEVEL_MAX - SLIDER_LEVEL_MIN) * progress;
            }
        };
        this.setupSliderCallbacks = () => {
            (0, validate_1.validate)(this.interactable);
            (0, validate_1.validate)(this.slider);
            (0, validate_1.validate)(this.renderMeshVisual);
            this.interactable.onTriggerStart.add(() => {
                this.renderMeshVisual.mainPass.pinch = 1.0;
                this.renderMeshVisual.mainPass.level = this.currentValue;
            });
            this.interactable.onTriggerEnd.add(() => {
                this.renderMeshVisual.mainPass.pinch = 0.0;
            });
            this.slider.onValueUpdate.add((value) => {
                this.currentValue = value;
                this.renderMeshVisual.mainPass.level = this.getSliderLevelFromValue(value);
            });
        };
    }
};
exports.SliderFeedback = SliderFeedback;
exports.SliderFeedback = SliderFeedback = __decorate([
    component
], SliderFeedback);
//# sourceMappingURL=SliderFeedback.js.map