import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { InteractorEvent } from 'SpectaclesInteractionKit/Core/Interactor/InteractorEvent';
import { Interactable } from 'SpectaclesInteractionKit/Components/Interaction/Interactable/Interactable';
import { InteractableManipulation } from 'SpectaclesInteractionKit/Components/Interaction/InteractableManipulation/InteractableManipulation';

@component
export class PrefabSpawn extends BaseScriptComponent {
    @input('Component.ScriptComponent')
    @hint('The PinchButton that will trigger the prefab spawn')
    pinchButton: PinchButton;

    @input('ObjectPrefab')
    @hint('The prefab to spawn')
    prefabTemplate: ObjectPrefab;

    @input('Component.Camera')
    @hint('The camera used for spawn positioning')
    camera: Camera;

    @input('Component.ScriptComponent')
    @hint('The Instantiator component for prefab instantiation')
    instantiator: any; // Using any type since we can't import the proper type

    @input('number')
    @hint('Distance in front of camera to spawn prefab')
    spawnDistance: number = 1.0;

    @input('number')
    @hint('Scale factor for spawned prefabs')
    spawnScale: number = 1.0;

    @input('boolean')
    @hint('Enable rotation for spawned prefabs')
    enableRotation: boolean = true;

    @input('boolean')
    @hint('Enable scaling for spawned prefabs')
    enableScaling: boolean = true;

    @input('boolean')
    @hint('Enable translation for spawned prefabs')
    enableTranslation: boolean = true;

    @input('boolean') 
    @hint('Enable animation playback for spawned prefabs')
    enableAnimation: boolean = true;

    @input('boolean')
    @hint('Auto-play animations on spawn')
    autoPlayAnimation: boolean = true;

    @input('boolean')
    @hint('Claim ownership of spawned prefabs')
    claimOwnership: boolean = true;

    private spawnedObjects: SceneObject[] = [];
    private onPinchCallback: (event: InteractorEvent) => void;
    private instantiatorReady: boolean = false;

    onAwake(): void {
        if (!this.pinchButton || !this.prefabTemplate || !this.camera || !this.instantiator) {
            print('Error: Required inputs not set in PrefabSpawn script');
            return;
        }

        this.onPinchCallback = (event: InteractorEvent) => this.spawnPrefab();
        this.pinchButton.onButtonPinched(this.onPinchCallback);
        
        // Wait for the instantiator to be ready
        this.instantiator.notifyOnReady(() => {
            this.instantiatorReady = true;
            print('Instantiator is ready for prefab spawning');
        });
    }

    private spawnPrefab(): void {
        if (!this.instantiatorReady) {
            print('Instantiator not ready yet. Please try again in a moment.');
            return;
        }

        const camTransform = this.camera.getTransform();
        const forward = camTransform.forward;
        const position = camTransform.getWorldPosition();

        const spawnPosition = new vec3(
            position.x + forward.x * this.spawnDistance,
            position.y + forward.y * this.spawnDistance,
            position.z + forward.z * this.spawnDistance
        );

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

    private configurePrefabInstance(newObject: SceneObject, networkRootInfo: any): void {
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
    
    private configureAnimationComponents(prefabInstance: SceneObject): void {
        if (!this.enableAnimation) return;
        
        // Configure Animation Player component (newer Lens Studio versions)
        const animationPlayer = prefabInstance.getComponent('Component.AnimationPlayer') as AnimationPlayer;
        if (animationPlayer) {
            animationPlayer.enabled = true;
            
            if (this.autoPlayAnimation) {
                // Set autoplay property directly if available
                if ('autoplay' in animationPlayer) {
                    animationPlayer.autoplay = true;
                } else if ('play' in animationPlayer && typeof animationPlayer.play === 'function') {
                    animationPlayer.play();
                }
            }
        }
        
        // Configure Animation Mixer component (older Lens Studio versions)
        const animationMixer = prefabInstance.getComponent('Component.AnimationMixer') as AnimationMixer;
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
                    } catch (e) {
                        // Layer might not exist, just continue to the next one
                        continue;
                    }
                }
            }
        }
    }
    
    // Helper method to get default animation layer names
    private getAnimationLayers(): string[] {
        // Return common layer names since we can't retrieve them dynamically
        return ['BaseLayer', 'DefaultLayer', 'Main', 'Animation'];
    }
    
    private configureInteractionComponents(prefabInstance: SceneObject): void {
        // Configure Interactable component
        const interactable = prefabInstance.getComponent(Interactable.getTypeName()) as Interactable;
        if (interactable) {
            interactable.enabled = true;
            interactable.allowMultipleInteractors = true; // Enable multi-touch
            interactable.enableInstantDrag = true;
        }
        
        // Configure InteractableManipulation component
        const manipulation = prefabInstance.getComponent(InteractableManipulation.getTypeName()) as InteractableManipulation;
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

    onDestroy(): void {
        if (this.pinchButton && this.onPinchCallback) {
            this.pinchButton.onButtonPinched.remove(this.onPinchCallback);
        }

        // We don't destroy the objects here because they are managed by the network
        // and will be destroyed when the session ends or when the owner destroys them
        this.spawnedObjects = [];
    }
}