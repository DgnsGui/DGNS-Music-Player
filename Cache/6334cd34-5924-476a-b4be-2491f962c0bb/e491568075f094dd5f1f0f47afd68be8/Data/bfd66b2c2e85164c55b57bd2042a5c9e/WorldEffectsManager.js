"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToggleVisibilityController = void 0;
var __selfType = requireType("./WorldEffectsManager");
function component(target) { target.getTypeName = function () { return __selfType; }; }
let ToggleVisibilityController = class ToggleVisibilityController extends BaseScriptComponent {
    onAwake() {
        // Verify that required inputs are set
        if (!this.pinchButton || !this.targetObject) {
            print("Error: PinchButton or target object not set in Inspector");
            return;
        }
        // Create the event handler
        this.handlePinch = (event) => {
            this.toggleVisibility();
        };
        // Set up the pinch button event listener
        this.pinchButton.onButtonPinched.add(this.handlePinch);
        // Initialize visibility state to match the object's current state
        this.isVisible = this.targetObject.enabled;
    }
    // Toggle visibility of the target object
    toggleVisibility() {
        this.isVisible = !this.isVisible;
        this.targetObject.enabled = this.isVisible;
        print(`Object visibility toggled to: ${this.isVisible}`);
    }
    // Clean up event listener when the script is destroyed
    destroy() {
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
exports.ToggleVisibilityController = ToggleVisibilityController = __decorate([
    component
], ToggleVisibilityController);
//# sourceMappingURL=WorldEffectsManager.js.map