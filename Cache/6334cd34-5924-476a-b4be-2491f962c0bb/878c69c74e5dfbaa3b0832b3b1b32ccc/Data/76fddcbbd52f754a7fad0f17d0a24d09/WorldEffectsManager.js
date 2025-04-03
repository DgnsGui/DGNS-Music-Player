"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ToggleVisibilityController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToggleVisibilityController = void 0;
var __selfType = requireType("./WorldEffectsManager");
function component(target) { target.getTypeName = function () { return __selfType; }; }
let ToggleVisibilityController = ToggleVisibilityController_1 = class ToggleVisibilityController extends BaseScriptComponent {
    onAwake() {
        // Verify that required inputs are set
        if (!this.pinchButton || !this.targetObject) {
            print("Error: PinchButton or target object not set in Inspector");
            return;
        }
        // Add this controller to the static registry
        ToggleVisibilityController_1.activeControllers.push(this);
        // Create the event handler
        this.handlePinch = (event) => {
            this.toggleVisibilityExclusively();
        };
        // Set up the pinch button event listener
        this.pinchButton.onButtonPinched.add(this.handlePinch);
        // Initialize visibility state to match the object's current state
        this.isVisible = this.targetObject.enabled;
    }
    // Toggle visibility and manage other objects
    toggleVisibilityExclusively() {
        if (this.isVisible) {
            // If already visible, simply toggle off
            this.setVisibility(false);
            print(`Object "${this.targetObject.name}" deactivated`);
        }
        else {
            // Deactivate all other controllers' objects
            ToggleVisibilityController_1.activeControllers.forEach(controller => {
                if (controller !== this && controller.isVisible) {
                    controller.setVisibility(false);
                }
            });
            // Activate this object
            this.setVisibility(true);
            print(`Object "${this.targetObject.name}" activated exclusively`);
        }
    }
    // Set visibility with state tracking
    setVisibility(visible) {
        this.isVisible = visible;
        this.targetObject.enabled = visible;
    }
    // Clean up event listener when the script is destroyed
    destroy() {
        // Remove this controller from the static registry
        const index = ToggleVisibilityController_1.activeControllers.indexOf(this);
        if (index !== -1) {
            ToggleVisibilityController_1.activeControllers.splice(index, 1);
        }
        if (this.pinchButton && this.handlePinch) {
            this.pinchButton.onButtonPinched.remove(this.handlePinch);
        }
        super.destroy();
    }
    __initialize() {
        super.__initialize();
        this.isVisible = true;
    }
};
exports.ToggleVisibilityController = ToggleVisibilityController;
// Reference to a static registry of all controllers for coordination
ToggleVisibilityController.activeControllers = [];
exports.ToggleVisibilityController = ToggleVisibilityController = ToggleVisibilityController_1 = __decorate([
    component
], ToggleVisibilityController);
//# sourceMappingURL=WorldEffectsManager.js.map