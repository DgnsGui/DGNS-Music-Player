"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractableOutlineFeedback = void 0;
var __selfType = requireType("./InteractableOutlineFeedback");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const Interactable_1 = require("../Interaction/Interactable/Interactable");
const validate_1 = require("../../Utils/validate");
/**
 * This class provides visual feedback by adding an outline to mesh visuals when they are hovered or pinched. It allows customization of the outline color, thickness, and target meshes.
 */
let InteractableOutlineFeedback = class InteractableOutlineFeedback extends BaseScriptComponent {
    onAwake() {
        this.defineScriptEvents();
    }
    defineScriptEvents() {
        this.createEvent("OnStartEvent").bind(() => {
            this.init();
            this.createEvent("OnEnableEvent").bind(() => {
                this.outlineEnabled = true;
            });
            this.createEvent("OnDisableEvent").bind(() => {
                this.outlineEnabled = false;
                this.removeMaterialFromRenderMeshArray();
            });
        });
    }
    init() {
        this.highlightMaterial = this.targetOutlineMaterial.clone();
        this.highlightMaterial.mainPass.lineWeight = this.outlineWeight;
        this.highlightMaterial.mainPass.lineColor = this.hoveringColor;
        this.interactable = this.getSceneObject().getComponent(Interactable_1.Interactable.getTypeName());
        if (!this.interactable) {
            throw new Error("No interactable was found - please ensure that a component matching the Interactable typename provided was added to this SceneObject.");
        }
        this.setupInteractableCallbacks();
    }
    addMaterialToRenderMeshArray() {
        if (!this.outlineEnabled) {
            return;
        }
        for (let i = 0; i < this.meshVisuals.length; i++) {
            const matCount = this.meshVisuals[i].getMaterialsCount();
            let addMaterial = true;
            for (let k = 0; k < matCount; k++) {
                const material = this.meshVisuals[i].getMaterial(k);
                if (this.highlightMaterial !== undefined &&
                    material.isSame(this.highlightMaterial)) {
                    addMaterial = false;
                    break;
                }
            }
            if (this.highlightMaterial !== undefined && addMaterial) {
                const materials = this.meshVisuals[i].materials;
                materials.unshift(this.highlightMaterial);
                this.meshVisuals[i].materials = materials;
            }
        }
    }
    removeMaterialFromRenderMeshArray() {
        for (let i = 0; i < this.meshVisuals.length; i++) {
            let materials = [];
            const matCount = this.meshVisuals[i].getMaterialsCount();
            for (let k = 0; k < matCount; k++) {
                const material = this.meshVisuals[i].getMaterial(k);
                if (this.highlightMaterial !== undefined &&
                    material.isSame(this.highlightMaterial)) {
                    continue;
                }
                materials.push(material);
            }
            this.meshVisuals[i].clearMaterials();
            for (var k = 0; k < materials.length; k++) {
                this.meshVisuals[i].addMaterial(materials[k]);
            }
        }
    }
    setupInteractableCallbacks() {
        (0, validate_1.validate)(this.interactable);
        this.interactable.onHoverEnter.add(() => {
            this.addMaterialToRenderMeshArray();
        });
        this.interactable.onHoverExit.add(() => {
            this.removeMaterialFromRenderMeshArray();
        });
        this.interactable.onTriggerStart.add(() => {
            this.setHighlightColor(this.activatingColor);
        });
        this.interactable.onTriggerEnd.add(() => {
            this.setHighlightColor(this.hoveringColor);
        });
        this.interactable.onTriggerCanceled.add(() => {
            this.setHighlightColor(this.hoveringColor);
            this.removeMaterialFromRenderMeshArray();
        });
    }
    setHighlightColor(color) {
        (0, validate_1.validate)(this.highlightMaterial);
        this.highlightMaterial.mainPass.lineColor = color;
    }
    __initialize() {
        super.__initialize();
        this.interactable = null;
        this.outlineEnabled = true;
    }
};
exports.InteractableOutlineFeedback = InteractableOutlineFeedback;
exports.InteractableOutlineFeedback = InteractableOutlineFeedback = __decorate([
    component
], InteractableOutlineFeedback);
//# sourceMappingURL=InteractableOutlineFeedback.js.map