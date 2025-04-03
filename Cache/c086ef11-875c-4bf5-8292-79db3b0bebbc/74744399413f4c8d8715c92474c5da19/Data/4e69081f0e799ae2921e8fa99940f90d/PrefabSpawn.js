"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrefabSpawn = void 0;
var __selfType = requireType("./PrefabSpawn");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const Interactable_1 = require("SpectaclesInteractionKit/Components/Interaction/Interactable/Interactable");
const InteractableManipulation_1 = require("SpectaclesInteractionKit/Components/Interaction/InteractableManipulation/InteractableManipulation");
let PrefabSpawn = class PrefabSpawn extends BaseScriptComponent {
    onAwake() {
        if (!this.pinchButton || !this.prefabTemplate || !this.camera || !this.instantiator) {
            print('Error: Required inputs not set in PrefabSpawn script');
            return;
        }
        this.onPinchCallback = (event) => this.spawnPrefab();
        this.pinchButton.onButtonPinched(this.onPinchCallback);
        // Wait for the instantiator to be ready
        this.instantiator.notifyOnReady(() => {
            this.instantiatorReady = true;
            print('Instantiator is ready for prefab spawning');
        });
    }
    spawnPrefab() {
        if (!this.instantiatorReady) {
            print('Instantiator not ready yet. Please try again in a moment.');
            return;
        }
        const camTransform = this.camera.getTransform();
        const forward = camTransform.forward;
        const position = camTransform.getWorldPosition();
        const spawnPosition = new vec3(position.x + forward.x * this.spawnDistance, position.y + forward.y * this.spawnDistance, position.z + forward.z * this.spawnDistance);
        // Create instantiation options as a simple JS object instead of using the InstantiationOptions class
        const options = {
            worldPosition: spawnPosition,
            worldScale: new vec3(this.spawnScale, this.spawnScale, this.spawnScale),
            worldRotation: camTransform.getWorldRotation(),
            claimOwnership: this.claimOwnership,
            // Set up success callback to configure the instantiated prefab
            onSuccess: (networkRootInfo) => {
                const newObject = networkRootInfo.instantiatedObject;
                if (!newObject) {
                    print('Error: Failed to get instantiated object reference');
                    return;
                }
                this.configurePrefabInstance(newObject, networkRootInfo);
                print('Prefab spawned at position: ' + spawnPosition.x + ', ' + spawnPosition.y + ', ' + spawnPosition.z);
            },
            // Set up error callback
            onError: (error) => {
                print('Error instantiating prefab: ' + error);
            }
        };
        // Instantiate the prefab
        this.instantiator.instantiate(this.prefabTemplate, options);
    }
    configurePrefabInstance(newObject, networkRootInfo) {
        // Store reference to the spawned object
        this.spawnedObjects.push(newObject);
        // Ensure the object is visible
        newObject.enabled = true;
        // Configure animation components if present
        this.configureAnimationComponents(newObject);
        // Configure interaction components
        this.configureInteractionComponents(newObject);
        // Set up destruction event handler
        networkRootInfo.onDestroyed.add(() => {
            // Remove from our spawned objects array
            const index = this.spawnedObjects.indexOf(newObject);
            if (index > -1) {
                this.spawnedObjects.splice(index, 1);
            }
        });
    }
    configureAnimationComponents(prefabInstance) {
        if (!this.enableAnimation)
            return;
        // Configure Animation Player component (newer Lens Studio versions)
        const animationPlayer = prefabInstance.getComponent('Component.AnimationPlayer');
        if (animationPlayer) {
            animationPlayer.enabled = true;
            if (this.autoPlayAnimation) {
                // Set autoplay property directly if available
                if ('autoplay' in animationPlayer) {
                    animationPlayer.autoplay = true;
                }
                else if ('play' in animationPlayer && typeof animationPlayer.play === 'function') {
                    animationPlayer.play();
                }
            }
        }
        // Configure Animation Mixer component (older Lens Studio versions)
        const animationMixer = prefabInstance.getComponent('Component.AnimationMixer');
        if (animationMixer) {
            animationMixer.enabled = true;
            if (this.autoPlayAnimation) {
                // Get available animation layers
                const layers = this.getAnimationLayers();
                for (const layerName of layers) {
                    try {
                        // Try to set the weight and start the animation
                        // We're using try/catch because we don't know if the layer exists
                        animationMixer.setWeight(layerName, 1.0);
                        animationMixer.start(layerName, 0.0, -1); // -1 for infinite loops
                    }
                    catch (e) {
                        // Layer might not exist, just continue to the next one
                        continue;
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
    configureInteractionComponents(prefabInstance) {
        // Configure Interactable component
        const interactable = prefabInstance.getComponent(Interactable_1.Interactable.getTypeName());
        if (interactable) {
            interactable.enabled = true;
            interactable.allowMultipleInteractors = true; // Enable multi-touch
            interactable.enableInstantDrag = true;
        }
        // Configure InteractableManipulation component
        const manipulation = prefabInstance.getComponent(InteractableManipulation_1.InteractableManipulation.getTypeName());
        if (manipulation) {
            manipulation.enabled = true;
            // Apply manipulation settings
            manipulation.setCanRotate(this.enableRotation);
            manipulation.setCanScale(this.enableScaling);
            manipulation.setCanTranslate(this.enableTranslation);
            // Set manipulation limits
            manipulation.minimumScaleFactor = 0.25;
            manipulation.maximumScaleFactor = 3.0;
            // Enable specific translation axes
            manipulation.enableXTranslation = true;
            manipulation.enableYTranslation = true;
            manipulation.enableZTranslation = true;
        }
    }
    onDestroy() {
        if (this.pinchButton && this.onPinchCallback) {
            this.pinchButton.onButtonPinched.remove(this.onPinchCallback);
        }
        // We don't destroy the objects here because they are managed by the network
        // and will be destroyed when the session ends or when the owner destroys them
        this.spawnedObjects = [];
    }
    __initialize() {
        super.__initialize();
        this.spawnedObjects = [];
        this.instantiatorReady = false;
    }
};
exports.PrefabSpawn = PrefabSpawn;
exports.PrefabSpawn = PrefabSpawn = __decorate([
    component
], PrefabSpawn);
//# sourceMappingURL=PrefabSpawn.js.map