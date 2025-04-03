"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ButtonFeedback = void 0;
var __selfType = requireType("./ButtonFeedback");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const Interactable_1 = require("../Interaction/Interactable/Interactable");
const SIK_1 = require("../../SIK");
const ToggleButton_1 = require("../UI/ToggleButton/ToggleButton");
const validate_1 = require("../../Utils/validate");
const PINCH_BUTTON = 0;
const TOGGLE_BUTTON = 1;
const STATE_BUTTON = 2;
/**
 * This class provides visual feedback for different types of buttons, such as Pinch Button, Toggle Button, and State Button. It allows customization of the button's appearance and behavior based on its state.
 */
let ButtonFeedback = class ButtonFeedback extends BaseScriptComponent {
    onAwake() {
        this.init();
    }
    __initialize() {
        super.__initialize();
        this.interactable = null;
        this.toggleButton = null;
        this.initialMaxInteractionStrength = 0.0;
        this.squishEnabled = true;
        this.init = () => {
            if (isNull(this.renderMeshVisual)) {
                throw new Error("No RenderMeshVisual component attached to this entity!");
            }
            this.renderMeshVisual.mainMaterial = this.renderMeshVisual
                .getMaterial(0)
                .clone();
            if (this.useGlowMesh) {
                if (this.glowRenderMeshVisual !== undefined) {
                    this.glowRenderMeshVisual.mainMaterial = this.glowRenderMeshVisual
                        .getMaterial(0)
                        .clone();
                }
                else {
                    this.useGlowMesh = false;
                    print("No Glow RenderMeshVisual component attached to this entity.");
                }
            }
            this.interactable = this.getSceneObject().getComponent(Interactable_1.Interactable.getTypeName());
            if (isNull(this.interactable)) {
                throw new Error("Interactable component not found in this entity!");
            }
            if (this.buttonType === TOGGLE_BUTTON || this.buttonType === STATE_BUTTON) {
                this.toggleButton = this.getSceneObject().getComponent(ToggleButton_1.ToggleButton.getTypeName());
                if (isNull(this.toggleButton)) {
                    throw new Error("ToggleButton component not found in this entity!");
                }
            }
            this.setupInteractableCallbacks();
            this.createEvent("OnEnableEvent").bind(() => {
                this.squishEnabled = true;
            });
            this.createEvent("OnDisableEvent").bind(() => {
                this.squishEnabled = false;
            });
            this.createEvent("OnStartEvent").bind(() => {
                if (this.meshIdleMaterial === undefined ||
                    this.meshHoverMaterial === undefined ||
                    this.meshPinchedMaterial === undefined) {
                    throw new Error("ButtonFeedback requires meshIdleMaterial, meshHoverMaterial, and meshPinchedMaterial to be set! SceneObject name: " +
                        this.getSceneObject().name);
                }
                if (this.buttonType === TOGGLE_BUTTON) {
                    if (this.meshToggledIdleMaterial === undefined ||
                        this.meshToggledHoverMaterial === undefined ||
                        this.meshToggledPinchedMaterial === undefined) {
                        throw new Error("ToggleButton requires meshToggledIdleMaterial, meshToggledHoverMaterial, and meshToggledPinchedMaterial to be set! SceneObject name: " +
                            this.getSceneObject().name);
                    }
                }
                else if (this.buttonType === STATE_BUTTON) {
                    if (this.meshStateIdleMaterial === undefined ||
                        this.meshStateHoverMaterial === undefined ||
                        this.meshStatePinchedMaterial === undefined) {
                        throw new Error("StateButton requires meshStateIdleMaterial, meshStateHoverMaterial, and meshStatePinchedMaterial to be set! SceneObject name: " +
                            this.getSceneObject().name);
                    }
                }
                this.meshIdleMaterial = this.meshIdleMaterial.clone();
                this.meshHoverMaterial = this.meshHoverMaterial.clone();
                this.meshPinchedMaterial = this.meshPinchedMaterial.clone();
                this.changeButtonState(this.meshIdleMaterial);
                if (this.defaultIcon !== undefined) {
                    this.meshIdleMaterial.mainPass.iconEnabled = true;
                    this.meshHoverMaterial.mainPass.iconEnabled = true;
                    this.meshPinchedMaterial.mainPass.iconEnabled = true;
                    this.meshIdleMaterial.mainPass.icon = this.defaultIcon;
                    this.meshHoverMaterial.mainPass.icon = this.defaultIcon;
                    this.meshPinchedMaterial.mainPass.icon = this.defaultIcon;
                }
                if (this.onIcon !== undefined) {
                    if (this.buttonType === TOGGLE_BUTTON) {
                        if (this.meshToggledIdleMaterial !== undefined &&
                            this.meshToggledHoverMaterial !== undefined &&
                            this.meshToggledPinchedMaterial !== undefined) {
                            this.meshToggledIdleMaterial = this.meshToggledIdleMaterial.clone();
                            this.meshToggledHoverMaterial =
                                this.meshToggledHoverMaterial.clone();
                            this.meshToggledPinchedMaterial =
                                this.meshToggledPinchedMaterial.clone();
                            this.meshToggledIdleMaterial.mainPass.iconEnabled = true;
                            this.meshToggledHoverMaterial.mainPass.iconEnabled = true;
                            this.meshToggledPinchedMaterial.mainPass.iconEnabled = true;
                            this.meshToggledIdleMaterial.mainPass.icon = this.onIcon;
                            this.meshToggledHoverMaterial.mainPass.icon = this.onIcon;
                            this.meshToggledPinchedMaterial.mainPass.icon = this.onIcon;
                        }
                    }
                    else if (this.buttonType === STATE_BUTTON) {
                        if (this.meshStateIdleMaterial !== undefined &&
                            this.meshStateHoverMaterial !== undefined &&
                            this.meshStatePinchedMaterial !== undefined) {
                            this.meshStateIdleMaterial = this.meshStateIdleMaterial.clone();
                            this.meshStateHoverMaterial = this.meshStateHoverMaterial.clone();
                            this.meshStatePinchedMaterial =
                                this.meshStatePinchedMaterial.clone();
                            this.meshStateIdleMaterial.mainPass.iconEnabled = true;
                            this.meshStateHoverMaterial.mainPass.iconEnabled = true;
                            this.meshStatePinchedMaterial.mainPass.iconEnabled = true;
                            this.meshStateIdleMaterial.mainPass.icon = this.onIcon;
                            this.meshStateHoverMaterial.mainPass.icon = this.onIcon;
                            this.meshStatePinchedMaterial.mainPass.icon = this.onIcon;
                        }
                    }
                }
                if (this.onIcon !== undefined && this.defaultIcon !== undefined) {
                    this.meshIdleMaterial.mainPass.iconEnabled = false;
                    this.meshHoverMaterial.mainPass.iconEnabled = false;
                    this.meshPinchedMaterial.mainPass.iconEnabled = false;
                    if (this.buttonType === TOGGLE_BUTTON) {
                        if (this.meshToggledIdleMaterial !== undefined &&
                            this.meshToggledHoverMaterial !== undefined &&
                            this.meshToggledPinchedMaterial !== undefined) {
                            this.meshToggledIdleMaterial = this.meshToggledIdleMaterial.clone();
                            this.meshToggledHoverMaterial =
                                this.meshToggledHoverMaterial.clone();
                            this.meshToggledPinchedMaterial =
                                this.meshToggledPinchedMaterial.clone();
                            this.meshToggledIdleMaterial.mainPass.iconEnabled = false;
                            this.meshToggledHoverMaterial.mainPass.iconEnabled = false;
                            this.meshToggledPinchedMaterial.mainPass.iconEnabled = false;
                        }
                    }
                    else if (this.buttonType === STATE_BUTTON) {
                        if (this.meshStateIdleMaterial !== undefined &&
                            this.meshStateHoverMaterial !== undefined &&
                            this.meshStatePinchedMaterial !== undefined) {
                            this.meshStateIdleMaterial = this.meshStateIdleMaterial.clone();
                            this.meshStateHoverMaterial = this.meshStateHoverMaterial.clone();
                            this.meshStatePinchedMaterial =
                                this.meshStatePinchedMaterial.clone();
                            this.meshStateIdleMaterial.mainPass.iconEnabled = false;
                            this.meshStateHoverMaterial.mainPass.iconEnabled = false;
                            this.meshStatePinchedMaterial.mainPass.iconEnabled = false;
                        }
                    }
                }
            });
        };
        this.setupInteractableCallbacks = () => {
            (0, validate_1.validate)(this.interactable);
            this.interactable.onHoverUpdate.add(this.updateHoverState);
            switch (this.buttonType) {
                case PINCH_BUTTON:
                    (0, validate_1.validate)(this.interactable);
                    this.interactable.onHoverEnter.add(this.initializeHoverState_PinchButton);
                    this.interactable.onHoverExit.add(this.resetHoverState_PinchButton);
                    this.interactable.onTriggerCanceled.add(this.resetHoverState_PinchButton);
                    this.interactable.onTriggerStart.add(this.initializeTriggeredState_PinchButton);
                    this.interactable.onTriggerEnd.add(this.resetTriggeredState_PinchButton);
                    break;
                case TOGGLE_BUTTON:
                    (0, validate_1.validate)(this.interactable);
                    this.interactable.onHoverEnter.add(this.initializeHoverState_ToggleButton);
                    this.interactable.onHoverExit.add(this.resetHoverState_ToggleButton);
                    this.interactable.onTriggerCanceled.add(this.resetHoverState_ToggleButton);
                    this.interactable.onTriggerStart.add(this.initializeTriggeredState_ToggleButton);
                    this.interactable.onTriggerEnd.add(this.resetTriggeredState_ToggleButton);
                    (0, validate_1.validate)(this.toggleButton);
                    this.toggleButton
                        .createEvent("OnEnableEvent")
                        .bind(this.onToggleButtonEnabled);
                    break;
                case STATE_BUTTON:
                    (0, validate_1.validate)(this.interactable);
                    this.interactable.onHoverEnter.add(this.initializeHoverState_StateButton);
                    this.interactable.onHoverExit.add(this.resetHoverState_StateButton);
                    this.interactable.onTriggerCanceled.add(this.resetHoverState_StateButton);
                    this.interactable.onTriggerStart.add(this.initializeTriggeredState_StateButton);
                    this.interactable.onTriggerEnd.add(this.resetTriggeredState_StateButton);
                    (0, validate_1.validate)(this.toggleButton);
                    this.toggleButton
                        .createEvent("OnEnableEvent")
                        .bind(this.onToggleButtonEnabled);
                    break;
            }
        };
        this.initializeHoverState_PinchButton = () => {
            this.initialMaxInteractionStrength = this.getMaxInteractionStrength();
            this.changeButtonState(this.meshHoverMaterial);
            this.changeGlowState(this.glowHoverMaterial);
        };
        this.resetHoverState_PinchButton = () => {
            this.initialMaxInteractionStrength = 0.0;
            this.renderMeshVisual.setBlendShapeWeight(this.meshBlendShapeName, 0.0);
            if (this.useGlowMesh) {
                if (this.glowRenderMeshVisual !== undefined) {
                    this.glowRenderMeshVisual.setBlendShapeWeight(this.glowBlendShapeName, 0.0);
                }
            }
            this.changeButtonState(this.meshIdleMaterial);
            this.changeGlowState(this.glowIdleMaterial);
        };
        this.updateHoverState = () => {
            const maxInteractionStrength = this.getMaxInteractionStrength();
            if (!this.squishEnabled)
                return;
            const interactionScale = this.initialMaxInteractionStrength +
                (maxInteractionStrength * (1.0 - this.initialMaxInteractionStrength)) /
                    1.0;
            this.renderMeshVisual.setBlendShapeWeight(this.meshBlendShapeName, interactionScale * this.maxBlendShapeWeight);
            if (this.useGlowMesh) {
                if (this.glowRenderMeshVisual !== undefined) {
                    this.glowRenderMeshVisual.setBlendShapeWeight(this.glowBlendShapeName, interactionScale * this.maxBlendShapeWeight);
                }
            }
        };
        this.initializeTriggeredState_PinchButton = () => {
            this.changeButtonState(this.meshPinchedMaterial);
            this.changeGlowState(this.glowPinchedMaterial);
        };
        this.resetTriggeredState_PinchButton = () => {
            this.changeButtonState(this.meshHoverMaterial);
            this.changeGlowState(this.glowHoverMaterial);
        };
        this.onToggleButtonEnabled = () => {
            (0, validate_1.validate)(this.toggleButton);
            (0, validate_1.validate)(this.meshToggledIdleMaterial);
            (0, validate_1.validate)(this.meshStateIdleMaterial);
            this.changeButtonState(this.toggleButton.isToggledOn
                ? this.buttonType === TOGGLE_BUTTON
                    ? this.meshToggledIdleMaterial
                    : this.meshStateIdleMaterial
                : this.meshIdleMaterial);
        };
        this.initializeHoverState_ToggleButton = () => {
            this.initialMaxInteractionStrength = this.getMaxInteractionStrength();
            (0, validate_1.validate)(this.toggleButton);
            (0, validate_1.validate)(this.meshToggledHoverMaterial);
            this.changeButtonState(this.toggleButton.isToggledOn
                ? this.meshToggledHoverMaterial
                : this.meshHoverMaterial);
        };
        this.resetHoverState_ToggleButton = () => {
            this.initialMaxInteractionStrength = 0.0;
            this.renderMeshVisual.setBlendShapeWeight(this.meshBlendShapeName, 0.0);
            (0, validate_1.validate)(this.toggleButton);
            (0, validate_1.validate)(this.meshToggledIdleMaterial);
            this.changeButtonState(this.toggleButton.isToggledOn
                ? this.meshToggledIdleMaterial
                : this.meshIdleMaterial);
        };
        this.initializeTriggeredState_ToggleButton = () => {
            (0, validate_1.validate)(this.toggleButton);
            (0, validate_1.validate)(this.meshToggledPinchedMaterial);
            this.changeButtonState(this.toggleButton.isToggledOn
                ? this.meshToggledPinchedMaterial
                : this.meshPinchedMaterial);
        };
        this.resetTriggeredState_ToggleButton = () => {
            (0, validate_1.validate)(this.toggleButton);
            (0, validate_1.validate)(this.meshToggledHoverMaterial);
            this.changeButtonState(this.toggleButton.isToggledOn
                ? this.meshHoverMaterial
                : this.meshToggledHoverMaterial);
        };
        this.initializeHoverState_StateButton = () => {
            this.initialMaxInteractionStrength = this.getMaxInteractionStrength();
            (0, validate_1.validate)(this.toggleButton);
            (0, validate_1.validate)(this.meshStateHoverMaterial);
            this.changeButtonState(this.toggleButton.isToggledOn
                ? this.meshStateHoverMaterial
                : this.meshHoverMaterial);
        };
        this.resetHoverState_StateButton = () => {
            this.initialMaxInteractionStrength = 0.0;
            this.renderMeshVisual.setBlendShapeWeight(this.meshBlendShapeName, 0.0);
            (0, validate_1.validate)(this.toggleButton);
            (0, validate_1.validate)(this.meshStatePinchedMaterial);
            this.changeButtonState(this.toggleButton.isToggledOn
                ? this.meshStatePinchedMaterial
                : this.meshIdleMaterial);
        };
        this.initializeTriggeredState_StateButton = () => {
            (0, validate_1.validate)(this.toggleButton);
            (0, validate_1.validate)(this.meshStatePinchedMaterial);
            this.changeButtonState(this.toggleButton.isToggledOn
                ? this.meshStatePinchedMaterial
                : this.meshStatePinchedMaterial);
        };
        this.resetTriggeredState_StateButton = () => {
            (0, validate_1.validate)(this.toggleButton);
            (0, validate_1.validate)(this.meshStatePinchedMaterial);
            (0, validate_1.validate)(this.meshStateHoverMaterial);
            if (this.persistentPinchedState) {
                this.changeButtonState(this.toggleButton.isToggledOn
                    ? this.meshHoverMaterial
                    : this.meshStatePinchedMaterial);
            }
            else {
                this.changeButtonState(this.toggleButton.isToggledOn
                    ? this.meshHoverMaterial
                    : this.meshStateHoverMaterial);
            }
        };
        this.getMaxInteractionStrength = () => {
            (0, validate_1.validate)(this.interactable);
            const interactors = SIK_1.SIK.InteractionManager.getInteractorsByType(this.interactable.hoveringInteractor);
            if (interactors.length === 0) {
                return 0;
            }
            /**
             * At this point we know getInteractorsByType has returned some list of Interactors, each of which are hovering this Interactable
             * This means that there are multiple Interactors which could be at various stages of interactionStrength.
             * The behavior we want is to set the squish value of the Interactable based on the Max interactionStrength of all the Interactors currently
             * hovering this Interactable. Use array reduce to find Max:
             */
            return interactors.reduce((maxInteractionStrength, interactor) => {
                var _a;
                (0, validate_1.validate)(interactor);
                return Math.max(maxInteractionStrength, (_a = interactor.interactionStrength) !== null && _a !== void 0 ? _a : 0);
            }, -Infinity);
        };
        this.changeButtonState = (material) => {
            if (material === undefined)
                return;
            this.renderMeshVisual.mainMaterial = material;
        };
        this.changeGlowState = (material) => {
            if (!this.useGlowMesh)
                return;
            if (material === undefined)
                return;
            (0, validate_1.validate)(this.glowRenderMeshVisual);
            this.glowRenderMeshVisual.mainMaterial = material;
        };
    }
};
exports.ButtonFeedback = ButtonFeedback;
exports.ButtonFeedback = ButtonFeedback = __decorate([
    component
], ButtonFeedback);
//# sourceMappingURL=ButtonFeedback.js.map