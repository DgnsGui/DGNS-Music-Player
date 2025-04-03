import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { InteractorEvent } from 'SpectaclesInteractionKit/Core/Interactor/InteractorEvent';
import { Interactable } from 'SpectaclesInteractionKit/Components/Interaction/Interactable/Interactable';
import { InteractableManipulation } from 'SpectaclesInteractionKit/Components/Interaction/InteractableManipulation/InteractableManipulation';

@component
export class PrefabObjectSpawner extends BaseScriptComponent {
    @input('Component.ScriptComponent')
    @hint('The PinchButton that will trigger the object spawn')
    pinchButton: PinchButton;

    @input('SceneObject')
    @hint('The prefab to spawn')
    prefabTemplate: SceneObject;

    @input('Component.Camera')
    @hint('The camera used for spawn positioning')
    camera: Camera;

    @input('number')
    @hint('Distance in front of camera to spawn object')
    spawnDistance: number = 1.0;

    @input('number')
    @hint('Scale factor for spawned objects')
    spawnScale: number = 1.0;

    @input('boolean')
    @hint('Enable rotation for spawned objects')
    enableRotation: boolean = true;

    @input('boolean')
    @hint('Enable scaling for spawned objects')
    enableScaling: boolean = true;

    @input('boolean')
    @hint('Enable translation for spawned objects')
    enableTranslation: boolean = true;

    @input('boolean') 
    @hint('Enable animation playback for spawned objects')
    enableAnimation: boolean = true;

    @input('boolean')
    @hint('Auto-play animations on spawn')
    autoPlayAnimation: boolean = true;

    private spawnedObjects: SceneObject[] = [];
    private onPinchCallback: (event: InteractorEvent) => void;

    onAwake(): void {
        if (!this.pinchButton || !this.prefabTemplate || !this.camera) {
            print('Error: Required inputs not set in PrefabObjectSpawner script');
            return;
        }

        // Make sure the template is not visible
        if (this.prefabTemplate) {
            this.prefabTemplate.enabled = false;
        }

        this.onPinchCallback = (event: InteractorEvent) => this.spawnObject();
        this.pinchButton.onButtonPinched(this.onPinchCallback);
    }

    private spawnObject(): void {
        if (!this.prefabTemplate) {
            print('Error: No prefab template set');
            return;
        }

        // Get camera position and forward direction
        const camTransform = this.camera.getTransform();
        const forward = camTransform.forward;
        const position = camTransform.getWorldPosition();

        // Calculate spawn position
        const spawnPosition = new vec3(
            position.x + forward.x * this.spawnDistance,
            position.y + forward.y * this.spawnDistance,
            position.z + forward.z * this.spawnDistance
        );

        // Instantiate the prefab
        const newObject = this.prefabTemplate.instantiate(global.scene.getRootObject());
        
        if (!newObject) {
            print('Error: Failed to instantiate prefab');
            return;
        }

        // Set transform properties
        const objTransform = newObject.getTransform();
        objTransform.setWorldPosition(spawnPosition);
        objTransform.setLocalScale(new vec3(this.spawnScale, this.spawnScale, this.spawnScale));

        // Name the object for easier debugging
        newObject.name = "SpawnedPrefab_" + this.spawnedObjects.length;
        
        // Enable the object and all its children
        newObject.enabled = true;
        this.enableAllChildren(newObject);

        // Configure animations
        if (this.enableAnimation) {
            this.setupAnimations(newObject);
        }
        
        // Set up interactable components
        this.setupInteraction(newObject);

        // Add to the list of spawned objects
        this.spawnedObjects.push(newObject);

        print('Prefab spawned: ' + newObject.name + ' at position: ' + 
              spawnPosition.x.toFixed(2) + ', ' + 
              spawnPosition.y.toFixed(2) + ', ' + 
              spawnPosition.z.toFixed(2));
    }
    
    private enableAllChildren(object: SceneObject): void {
        // Enable all child objects recursively
        const childCount = object.getChildrenCount();
        for (let i = 0; i < childCount; i++) {
            const child = object.getChild(i);
            if (child) {
                child.enabled = true;
                this.enableAllChildren(child);
            }
        }
    }

    private setupAnimations(object: SceneObject): void {
        // Find and configure Animation Player components
        const animationPlayer = object.getComponent('Component.AnimationPlayer') as AnimationPlayer;
        if (animationPlayer) {
            animationPlayer.enabled = true;
            
            if (this.autoPlayAnimation && 'autoplay' in animationPlayer) {
                animationPlayer.autoplay = true;
            }
        }
        
        // Find and configure Animation Mixer components
        const animationMixer = object.getComponent('Component.AnimationMixer') as AnimationMixer;
        if (animationMixer) {
            animationMixer.enabled = true;
            
            if (this.autoPlayAnimation) {
                // Common animation layer names
                const commonLayers = ['BaseLayer', 'DefaultLayer', 'Main', 'Animation', 'IDLE', 'ACTION'];
                
                for (const layer of commonLayers) {
                    try {
                        // Try to start each common layer
                        animationMixer.setWeight(layer, 1.0);
                        animationMixer.start(layer, 0.0, -1); // Start animation with infinite loops
                    } catch (e) {
                        // Layer doesn't exist, just continue
                    }
                }
            }
        }
        
        // Also check for animations in children
        const childCount = object.getChildrenCount();
        for (let i = 0; i < childCount; i++) {
            const child = object.getChild(i);
            if (child) {
                this.setupAnimations(child);
            }
        }
    }

    private setupInteraction(object: SceneObject): void {
        // Check if object already has interaction components
        let hasInteractable = !!object.getComponent(Interactable.getTypeName());
        let hasManipulation = !!object.getComponent(InteractableManipulation.getTypeName());
        let hasCollider = !!object.getComponent('Component.ColliderComponent');
        
        // If missing collider, add one
        if (!hasCollider) {
            const collider = object.createComponent('Component.BoxCollider') as BoxCollider;
            if (collider) {
                collider.enabled = true;
            }
        }
        
        // If missing interactable, add one
        if (!hasInteractable) {
            const interactable = object.createComponent(Interactable.getTypeName()) as Interactable;
            if (interactable) {
                interactable.enabled = true;
                interactable.allowMultipleInteractors = true;
                interactable.enableInstantDrag = true;
            }
        }
        
        // If missing manipulation component, add one
        if (!hasManipulation) {
            const manipulation = object.createComponent(InteractableManipulation.getTypeName()) as InteractableManipulation;
            if (manipulation) {
                manipulation.enabled = true;
                
                // Configure manipulation settings
                manipulation.setCanRotate(this.enableRotation);
                manipulation.setCanScale(this.enableScaling);
                manipulation.setCanTranslate(this.enableTranslation);
                
                // Set the manipulation root to be the object itself
                manipulation.setManipulateRoot(object.getTransform());
                
                // Configure manipulation limits
                manipulation.minimumScaleFactor = 0.25;
                manipulation.maximumScaleFactor = 3.0;
                
                // Enable specific translation axes
                manipulation.enableXTranslation = true;
                manipulation.enableYTranslation = true;
                manipulation.enableZTranslation = true;
            }
        }
    }

    onDestroy(): void {
        // Clean up event listener
        if (this.pinchButton && this.onPinchCallback) {
            this.pinchButton.onButtonPinched.remove(this.onPinchCallback);
        }

        // Clean up spawned objects
        for (const obj of this.spawnedObjects) {
            if (obj) {
                obj.destroy();
            }
        }
        this.spawnedObjects = [];
    }
}