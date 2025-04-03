"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractableColorFeedback = void 0;
var __selfType = requireType("./InteractableColorFeedback");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const Interactable_1 = require("../Interaction/Interactable/Interactable");
const validate_1 = require("../../Utils/validate");
/**
 * This class provides visual feedback by changing the color of mesh visuals based on interaction events such as hover, pinch, and disable. It allows customization of colors for different interaction states.
 */
let InteractableColorFeedback = class InteractableColorFeedback extends BaseScriptComponent {
    onAwake() {
        this.defineScriptEvents();
    }
    defineScriptEvents() {
        this.createEvent("OnStartEvent").bind(() => {
            this.init();
        });
    }
    init() {
        this.interactable = this.getSceneObject().getComponent(Interactable_1.Interactable.getTypeName());
        (0, validate_1.validate)(this.interactable, "InteractableColorFeedback requires Interactable.");
        this.setupMaterials();
        this.setupInteractableCallbacks(this.interactable);
    }
    changeColor(color) {
        this.meshMaterials.forEach(function (material) {
            material.mainPass.baseColor = color;
        });
    }
    setupInteractableCallbacks(interactable) {
        (0, validate_1.validate)(interactable);
        interactable.onHoverEnter.add(() => {
            this.changeColor(this.hoverColor);
        });
        interactable.onHoverExit.add(() => {
            this.changeColor(this.defaultColor);
        });
        interactable.onTriggerStart.add(() => {
            this.changeColor(this.pinchedColor);
        });
        interactable.onTriggerEnd.add(() => {
            this.changeColor(this.hoverColor);
        });
        interactable.onTriggerCanceled.add(() => {
            this.changeColor(this.defaultColor);
        });
        interactable.createEvent("OnEnableEvent").bind(() => {
            this.changeColor(this.defaultColor);
        });
        interactable.createEvent("OnDisableEvent").bind(() => {
            this.changeColor(this.disabledColor);
        });
    }
    setupMaterials() {
        for (var i = 0; i < this.meshVisuals.length; i++) {
            let clonedMaterial = this.meshVisuals[i].mainMaterial.clone();
            this.meshMaterials.push(clonedMaterial);
            this.meshVisuals[i].mainMaterial = clonedMaterial;
        }
        this.changeColor(this.defaultColor);
    }
    __initialize() {
        super.__initialize();
        this.interactable = null;
        this.meshMaterials = [];
    }
};
exports.InteractableColorFeedback = InteractableColorFeedback;
exports.InteractableColorFeedback = InteractableColorFeedback = __decorate([
    component
], InteractableColorFeedback);
//# sourceMappingURL=InteractableColorFeedback.js.map