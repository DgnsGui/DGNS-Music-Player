"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WorldEffectsManager_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorldEffectsManager = void 0;
var __selfType = requireType("./WorldEffectsManager");
function component(target) { target.getTypeName = function () { return __selfType; }; }
let WorldEffectsManager = WorldEffectsManager_1 = class WorldEffectsManager extends BaseScriptComponent {
    onAwake() {
        // Verify that required inputs are set
        if (!this.pinchButton) {
            print("Error: PinchButton not set in Inspector for WorldEffectsManager");
            return;
        }
        if (!this.musicPlayerManager) {
            print("Error: MusicPlayerManager script component not set in Inspector for WorldEffectsManager");
            return;
        }
        // Validate that the assigned script component is a MusicPlayerManager
        // Note : On utilise 'as any' pour contourner les limitations de typage
        this.musicPlayerManagerInstance = this.musicPlayerManager;
        if (!this.musicPlayerManagerInstance.getCurrentTrackIndex || !this.musicPlayerManagerInstance.getTrackPrefab) {
            print("Error: Assigned script component is not a valid MusicPlayerManager instance");
            return;
        }
        // Validate otherObjects array
        if (this.otherObjects && this.otherObjects.some(obj => obj == null)) {
            print("Warning: Some objects in otherObjects array are null in WorldEffectsManager");
            this.otherObjects = this.otherObjects.filter(obj => obj != null);
        }
        // Add this controller to the static registry
        WorldEffectsManager_1.activeControllers.push(this);
        // Create the event handler for the pinch button
        this.handlePinch = (event) => {
            this.toggleVisibilityExclusively();
        };
        // Set up the pinch button event listener
        this.pinchButton.onButtonPinched.add(this.handlePinch);
        // Initialize visibility state to false (nothing visible at start)
        this.isVisible = false;
        print("WorldEffectsManager initialized successfully");
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
        const targetObject = this.musicPlayerManagerInstance.getTrackPrefab(currentTrackIndex);
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
            WorldEffectsManager_1.activeControllers.forEach(controller => {
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
            print(`Activated worldmesh: ${this.currentActiveWorldMesh.name}`);
        }
    }
    // Clean up event listener when the script is destroyed
    onDestroy() {
        // Remove this controller from the static registry
        const index = WorldEffectsManager_1.activeControllers.indexOf(this);
        if (index !== -1) {
            WorldEffectsManager_1.activeControllers.splice(index, 1);
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
        print("WorldEffectsManager destroyed");
    }
    __initialize() {
        super.__initialize();
        this.isVisible = false;
        this.currentActiveWorldMesh = null;
    }
};
exports.WorldEffectsManager = WorldEffectsManager;
// Reference to a static registry of all controllers for coordination
WorldEffectsManager.activeControllers = [];
exports.WorldEffectsManager = WorldEffectsManager = WorldEffectsManager_1 = __decorate([
    component
], WorldEffectsManager);
//# sourceMappingURL=WorldEffectsManager.js.map