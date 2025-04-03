"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectSpawn = void 0;
var __selfType = requireType("./ObjectSpawn");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const Interactable_1 = require("SpectaclesInteractionKit/Components/Interaction/Interactable/Interactable");
const InteractableManipulation_1 = require("SpectaclesInteractionKit/Components/Interaction/InteractableManipulation/InteractableManipulation");
let ObjectSpawn = class ObjectSpawn extends BaseScriptComponent {
    onAwake() {
        if (!this.pinchButton || !this.objectTemplate || !this.camera) {
            print('Error: Required inputs not set in ObjectSpawn script');
            return;
        }
        this.onPinchCallback = (event) => this.spawnObject();
        this.pinchButton.onButtonPinched(this.onPinchCallback);
    }
    spawnObject() {
        const camTransform = this.camera.getTransform();
        const forward = camTransform.forward;
        const position = camTransform.getWorldPosition();
        const spawnPosition = new vec3(position.x + forward.x * this.spawnDistance, position.y + forward.y * this.spawnDistance, position.z + forward.z * this.spawnDistance);
        // Create new object
        const newObject = global.scene.createSceneObject("SpawnedObject");
        // Copy visual components
        this.copyVisualComponents(newObject);
        // Setup interaction components
        this.setupInteractionComponents(newObject);
        // Set transform
        const objTransform = newObject.getTransform();
        objTransform.setWorldPosition(spawnPosition);
        objTransform.setLocalScale(new vec3(this.spawnScale, this.spawnScale, this.spawnScale));
        newObject.enabled = true;
        this.spawnedObjects.push(newObject);
        print('Object spawned at position: ' + spawnPosition.x + ', ' + spawnPosition.y + ', ' + spawnPosition.z);
    }
    copyVisualComponents(newObject) {
        // Copy mesh component
        const meshComponent = this.objectTemplate.getComponent('Component.RenderMeshVisual');
        if (meshComponent) {
            newObject.copyComponent(meshComponent);
        }
        // Copy material component
        const materialComponent = this.objectTemplate.getComponent('Component.MaterialMeshVisual');
        if (materialComponent) {
            newObject.copyComponent(materialComponent);
        }
    }
    setupInteractionComponents(newObject) {
        // Setup Collider first (required for interaction)
        const colliderComponent = this.objectTemplate.getComponent('Component.ColliderComponent');
        if (colliderComponent) {
            const newCollider = newObject.copyComponent(colliderComponent);
            if (newCollider) {
                newCollider.enabled = true;
            }
        }
        // Setup Interactable
        const interactableComponent = this.objectTemplate.getComponent(Interactable_1.Interactable.getTypeName());
        if (interactableComponent) {
            const newInteractable = newObject.copyComponent(interactableComponent);
            if (newInteractable) {
                newInteractable.enabled = true;
                newInteractable.allowMultipleInteractors = true; // Enable multi-touch
                newInteractable.targetingMode = interactableComponent.targetingMode;
                newInteractable.enableInstantDrag = true;
            }
        }
        // Setup InteractableManipulation
        const manipulationComponent = this.objectTemplate.getComponent(InteractableManipulation_1.InteractableManipulation.getTypeName());
        if (manipulationComponent) {
            const newManipulation = newObject.copyComponent(manipulationComponent);
            if (newManipulation) {
                newManipulation.enabled = true;
                // Configure manipulation settings
                newManipulation.setCanRotate(this.enableRotation);
                newManipulation.setCanScale(this.enableScaling);
                newManipulation.setCanTranslate(this.enableTranslation);
                // Set the manipulation root to be the object itself
                newManipulation.setManipulateRoot(newObject.getTransform());
                // Configure manipulation limits
                newManipulation.minimumScaleFactor = 0.25;
                newManipulation.maximumScaleFactor = 3.0;
                // Enable specific translation axes
                newManipulation.enableXTranslation = true;
                newManipulation.enableYTranslation = true;
                newManipulation.enableZTranslation = true;
            }
        }
    }
    onDestroy() {
        if (this.pinchButton && this.onPinchCallback) {
            this.pinchButton.onButtonPinched.remove(this.onPinchCallback);
        }
        for (const obj of this.spawnedObjects) {
            if (obj) {
                obj.destroy();
            }
        }
        this.spawnedObjects = [];
    }
    __initialize() {
        super.__initialize();
        this.spawnedObjects = [];
    }
};
exports.ObjectSpawn = ObjectSpawn;
exports.ObjectSpawn = ObjectSpawn = __decorate([
    component
], ObjectSpawn);
//# sourceMappingURL=ObjectSpawn.js.map