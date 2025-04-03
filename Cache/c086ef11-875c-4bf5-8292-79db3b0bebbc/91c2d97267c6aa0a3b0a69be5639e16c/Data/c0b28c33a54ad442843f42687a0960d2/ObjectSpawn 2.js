"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectSpawn = void 0;
var __selfType = requireType("./ObjectSpawn 2");
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
        // Copy skin component (important for animated models)
        this.copySkinComponent(newObject);
        // Copy and configure animation components
        this.copyAnimationComponents(newObject);
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
    copySkinComponent(newObject) {
        // Copy skin component for rigged meshes
        const skinComponent = this.objectTemplate.getComponent('Component.Skin');
        if (skinComponent) {
            const newSkin = newObject.copyComponent(skinComponent);
            if (newSkin) {
                // Get all bone names from the original skin
                const boneNames = skinComponent.getSkinBoneNames();
                // For each bone in the original skin, we need to copy its reference
                for (let i = 0; i < boneNames.length; i++) {
                    const boneName = boneNames[i];
                    const bone = skinComponent.getSkinBone(boneName);
                    if (bone) {
                        // Need to create or find the equivalent bone in the new object
                        newSkin.setSkinBone(boneName, bone);
                    }
                }
                newSkin.enabled = true;
            }
        }
    }
    copyAnimationComponents(newObject) {
        // Handle Animation Player component (newer Lens Studio versions)
        const animationPlayerComponent = this.objectTemplate.getComponent('Component.AnimationPlayer');
        if (animationPlayerComponent && this.enableAnimation) {
            const newAnimationPlayer = newObject.copyComponent(animationPlayerComponent);
            if (newAnimationPlayer) {
                newAnimationPlayer.enabled = true;
                // The Animation Player's API may be different from what we tried before
                // Let's just enable autoplay if that option is set
                if (this.autoPlayAnimation) {
                    // Set autoplay property directly if available
                    if ('autoplay' in newAnimationPlayer) {
                        newAnimationPlayer.autoplay = true;
                    }
                }
            }
        }
        // Handle Animation Mixer component (older Lens Studio versions)
        const animationMixerComponent = this.objectTemplate.getComponent('Component.AnimationMixer');
        if (animationMixerComponent && this.enableAnimation) {
            const newAnimationMixer = newObject.copyComponent(animationMixerComponent);
            if (newAnimationMixer) {
                newAnimationMixer.enabled = true;
                // Get the layer names from the original mixer
                // For Animation Mixer, we typically have animation layers
                const layers = this.getAnimationLayers();
                for (const layerName of layers) {
                    // Set layer weights to 1.0 in the new mixer
                    newAnimationMixer.setWeight(layerName, 1.0);
                    // Auto-play animations if enabled
                    if (this.autoPlayAnimation) {
                        // Start animation: layerName, startOffset, loops (-1 for infinite)
                        newAnimationMixer.start(layerName, 0.0, -1);
                    }
                }
            }
        }
    }
    // Helper method to get default animation layer names
    getAnimationLayers() {
        // Return common layer names since we can't retrieve them dynamically
        return ['BaseLayer', 'DefaultLayer', 'Main', 'Animation'];
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
//# sourceMappingURL=ObjectSpawn%202.js.map