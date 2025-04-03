"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToggleFeedback = void 0;
var __selfType = requireType("./ToggleFeedback");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const Interactable_1 = require("../Interaction/Interactable/Interactable");
const ToggleButton_1 = require("../UI/ToggleButton/ToggleButton");
const validate_1 = require("../../Utils/validate");
/**
 * This class provides visual feedback for a {@link ToggleButton} by changing the material of the provided {@link RenderMeshVisual}s when the button is toggled on or off.
 */
let ToggleFeedback = class ToggleFeedback extends BaseScriptComponent {
    onAwake() {
        this.materials = [
            this.toggledOffMaterial,
            this.toggledOffSelectMaterial,
            this.toggledOnMaterial,
            this.toggledOnSelectMaterial,
            this.disabledMaterial,
        ];
        this.defineScriptEvents();
    }
    defineScriptEvents() {
        this.createEvent("OnStartEvent").bind(() => {
            this.init();
        });
    }
    init() {
        this.toggleButton = this.getSceneObject().getComponent(ToggleButton_1.ToggleButton.getTypeName());
        this.interactable = this.getSceneObject().getComponent(Interactable_1.Interactable.getTypeName());
        if (this.interactable === null || this.interactable === undefined) {
            throw new Error("UIToggleButtonCustomize script requires an Interactable on the ToggleButton");
        }
        this.setupInteractableCallbacks(this.interactable);
    }
    removeMaterials() {
        for (let i = 0; i < this.meshVisuals.length; i++) {
            let materials = [];
            const matCount = this.meshVisuals[i].getMaterialsCount();
            for (let k = 0; k < matCount; k++) {
                const material = this.meshVisuals[i].getMaterial(k);
                if (this.materials.includes(material)) {
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
    // Changes the material of each RenderMeshVisual provided.
    changeMeshes(material) {
        (0, validate_1.validate)(material);
        this.removeMaterials();
        this.meshVisuals.forEach((mesh) => {
            mesh.addMaterial(material);
        });
    }
    /**
     * Changes the materials depending on the {@link ToggleButton}'s status.
     * @param materialOn - The material to be used if on.
     * @param materialOff - The material to be used if off.
     */
    changeToggleOnMesh(materialOn, materialOff) {
        (0, validate_1.validate)(this.toggleButton);
        this.changeMeshes(this.toggleButton.isToggledOn ? materialOn : materialOff);
    }
    // Sets up interactable callbacks.
    setupInteractableCallbacks(interactable) {
        (0, validate_1.validate)(this.toggleButton);
        interactable.onTriggerStart.add(() => {
            this.changeToggleOnMesh(this.toggledOnSelectMaterial, this.toggledOffSelectMaterial);
        });
        interactable.onTriggerCanceled.add(() => {
            this.changeToggleOnMesh(this.toggledOnMaterial, this.toggledOffMaterial);
        });
        this.toggleButton.createEvent("OnEnableEvent").bind(() => {
            this.changeToggleOnMesh(this.toggledOnMaterial, this.toggledOffMaterial);
        });
        this.toggleButton.createEvent("OnDisableEvent").bind(() => {
            this.changeMeshes(this.disabledMaterial);
        });
        this.toggleButton.onStateChanged.add((isToggledOn) => {
            var _a;
            if (((_a = this.toggleButton) === null || _a === void 0 ? void 0 : _a.enabled) === false) {
                this.changeMeshes(this.disabledMaterial);
                return;
            }
            this.changeMeshes(isToggledOn ? this.toggledOnMaterial : this.toggledOffMaterial);
        });
    }
    __initialize() {
        super.__initialize();
        this.toggleButton = null;
        this.interactable = null;
        this.materials = [];
    }
};
exports.ToggleFeedback = ToggleFeedback;
exports.ToggleFeedback = ToggleFeedback = __decorate([
    component
], ToggleFeedback);
//# sourceMappingURL=ToggleFeedback.js.map