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
        if (!this.pinchButton) {
            print("Error: PinchButton not set in Inspector for ToggleVisibilityController");
            return;
        }
        if (!this.musicPlayerManager) {
            print("Error: MusicPlayerManager script component not set in Inspector for ToggleVisibilityController");
            return;
        }
        // Validate that the assigned script component is a MusicPlayerManager
        this.musicPlayerManagerInstance = this.musicPlayerManager;
        if (!this.musicPlayerManagerInstance.getCurrentTrackIndex || !this.musicPlayerManagerInstance.getWorldMesh) {
            print("Error: Assigned script component is not a valid MusicPlayerManager instance");
            return;
        }
        // Validate otherObjects array
        if (this.otherObjects && this.otherObjects.some(obj => obj == null)) {
            print("Warning: Some objects in otherObjects array are null in ToggleVisibilityController");
            this.otherObjects = this.otherObjects.filter(obj => obj != null);
        }
        // Add this controller to the static registry
        ToggleVisibilityController_1.activeControllers.push(this);
        // Create the event handler for the pinch button
        this.handlePinch = (event) => {
            this.toggleVisibilityExclusively();
        };
        // Set up the pinch button event listener
        this.pinchButton.onButtonPinched.add(this.handlePinch);
        // Initialize visibility state to false (nothing visible at start)
        this.isVisible = false;
        print("ToggleVisibilityController initialized successfully");
    }
    // Toggle visibility and manage other objects
    toggleVisibilityExclusively() {
        // Get the current track index from MusicPlayerManager
        const currentTrackIndex = this.musicPlayerManagerInstance.getCurrentTrackIndex();
        // Check if a track is loaded
        if (currentTrackIndex === -1) {
            print("No track is currently loaded in MusicPlayerManager");
            if (this.isVisible) {
                this.setVisibility(false);
            }
            return;
        }
        // Get the worldmesh corresponding to the current track
        const targetObject = this.musicPlayerManagerInstance.getWorldMesh(currentTrackIndex);
        if (!targetObject) {
            print(`Error: No worldmesh found for track index ${currentTrackIndex} in MusicPlayerManager`);
            if (this.isVisible) {
                this.setVisibility(false);
            }
            return;
        }
        if (this.isVisible && this.currentActiveWorldMesh === targetObject) {
            // If the same worldmesh is already visible, toggle it off
            this.setVisibility(false);
            print(`Worldmesh for track index ${currentTrackIndex} deactivated`);
        }
        else {
            // Deactivate all other controllers' worldmeshes
            ToggleVisibilityController_1.activeControllers.forEach(controller => {
                if (controller !== this && controller.isVisible) {
                    controller.setVisibility(false);
                    print(`Deactivated worldmesh from another controller: ${controller.getSceneObject().name}`);
                }
            });
            // Deactivate other objects listed in otherObjects
            if (this.otherObjects) {
                this.otherObjects.forEach(obj => {
                    if (obj) {
                        obj.enabled = false;
                        print(`Deactivated other object: ${obj.name}`);
                    }
                });
            }
            // Activate the worldmesh for the current track
            this.setVisibility(true, targetObject);
            print(`Worldmesh for track index ${currentTrackIndex} activated exclusively`);
        }
    }
    // Set visibility with state tracking
    setVisibility(visible, targetObject) {
        this.isVisible = visible;
        // If there's a currently active worldmesh, deactivate it
        if (this.currentActiveWorldMesh && !visible) {
            this.currentActiveWorldMesh.enabled = false;
            print(`Deactivated worldmesh: ${this.currentActiveWorldMesh.name}`);
            this.currentActiveWorldMesh = null;
        }
        // If a new targetObject is provided (when enabling), activate it
        if (visible && targetObject) {
            this.currentActiveWorldMesh = targetObject;
            this.currentActiveWorldMesh.enabled = true;
            // Activer récursivement tous les enfants pour s'assurer que le worldmesh est visible
            this.enableChildrenRecursively(this.currentActiveWorldMesh);
            print(`Activated worldmesh: ${this.currentActiveWorldMesh.name}`);
        }
    }
    // Méthode pour activer récursivement tous les enfants d'un SceneObject
    enableChildrenRecursively(sceneObject) {
        if (!sceneObject)
            return;
        // Activer l'objet lui-même
        sceneObject.enabled = true;
        // Activer tous les enfants
        const childCount = sceneObject.getChildrenCount();
        for (let i = 0; i < childCount; i++) {
            const child = sceneObject.getChild(i);
            if (child) {
                this.enableChildrenRecursively(child);
            }
        }
    }
    // Clean up event listener when the script is destroyed
    onDestroy() {
        // Remove this controller from the static registry
        const index = ToggleVisibilityController_1.activeControllers.indexOf(this);
        if (index !== -1) {
            ToggleVisibilityController_1.activeControllers.splice(index, 1);
        }
        // Remove the pinch button event listener
        if (this.pinchButton && this.handlePinch) {
            this.pinchButton.onButtonPinched.remove(this.handlePinch);
        }
        // Deactivate the current worldmesh if it exists
        if (this.currentActiveWorldMesh) {
            this.currentActiveWorldMesh.enabled = false;
            print(`Deactivated worldmesh on destroy: ${this.currentActiveWorldMesh.name}`);
            this.currentActiveWorldMesh = null;
        }
        print("ToggleVisibilityController destroyed");
    }
    __initialize() {
        super.__initialize();
        this.isVisible = false;
        this.currentActiveWorldMesh = null;
    }
};
exports.ToggleVisibilityController = ToggleVisibilityController;
// Reference to a static registry of all controllers for coordination
ToggleVisibilityController.activeControllers = [];
exports.ToggleVisibilityController = ToggleVisibilityController = ToggleVisibilityController_1 = __decorate([
    component
], ToggleVisibilityController);
//# sourceMappingURL=WorldEffectsManager.js.map