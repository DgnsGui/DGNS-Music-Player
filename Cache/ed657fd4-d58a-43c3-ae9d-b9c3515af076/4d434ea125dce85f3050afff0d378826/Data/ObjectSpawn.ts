import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { InteractorEvent } from 'SpectaclesInteractionKit/Core/Interactor/InteractorEvent';
import { Interactable } from 'SpectaclesInteractionKit/Components/Interaction/Interactable/Interactable';
import { InteractableManipulation } from 'SpectaclesInteractionKit/Components/Interaction/InteractableManipulation/InteractableManipulation';

@component
export class ObjectSpawn extends BaseScriptComponent {
    @input('Component.ScriptComponent')
    @hint('The PinchButton that will trigger the object spawn')
    pinchButton: PinchButton;

    @input('SceneObject')
    @hint('The object template to spawn')
    objectTemplate: SceneObject;

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
        if (!this.pinchButton || !this.objectTemplate || !this.camera) {
            print('Error: Required inputs not set in ObjectSpawn script');
            return;
        }

        this.onPinchCallback = (event: InteractorEvent) => this.spawnObject();
        this.pinchButton.onButtonPinched(this.onPinchCallback);
    }

    private spawnObject(): void {
        const camTransform = this.camera.getTransform();
        const forward = camTransform.forward;
        const position = camTransform.getWorldPosition();

        const spawnPosition = new vec3(
            position.x + forward.x * this.spawnDistance,
            position.y + forward.y * this.spawnDistance,
            position.z + forward.z * this.spawnDistance
        );

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

    private copyVisualComponents(newObject: SceneObject): void {
        // Copy mesh component
        const meshComponent = this.objectTemplate.getComponent('Component.RenderMeshVisual') as RenderMeshVisual;
        if (meshComponent) {
            newObject.copyComponent(meshComponent);
        }

        // Copy material component
        const materialComponent = this.objectTemplate.getComponent('Component.MaterialMeshVisual') as MaterialMeshVisual;
        if (materialComponent) {
            newObject.copyComponent(materialComponent);
        }
    }

    private copySkinComponent(newObject: SceneObject): void {
        // Copy skin component for rigged meshes
        const skinComponent = this.objectTemplate.getComponent('Component.Skin') as Skin;
        if (skinComponent) {
            const newSkin = newObject.copyComponent(skinComponent) as Skin;
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

    private copyAnimationComponents(newObject: SceneObject): void {
        // Handle Animation Player component (newer Lens Studio versions)
        const animationPlayerComponent = this.objectTemplate.getComponent('Component.AnimationPlayer') as AnimationPlayer;
        if (animationPlayerComponent && this.enableAnimation) {
            const newAnimationPlayer = newObject.copyComponent(animationPlayerComponent) as AnimationPlayer;
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
        const animationMixerComponent = this.objectTemplate.getComponent('Component.AnimationMixer') as AnimationMixer;
        if (animationMixerComponent && this.enableAnimation) {
            const newAnimationMixer = newObject.copyComponent(animationMixerComponent) as AnimationMixer;
            if (newAnimationMixer) {
                newAnimationMixer.enabled = true;
                
                // Get the layer names from the original mixer
                // For Animation Mixer, we typically have animation layers
                const layers = this.getAnimationLayers(animationMixerComponent);
                
                for (const layerName of layers) {
                    // Copy layer weights
                    const weight = animationMixerComponent.getWeight(layerName);
                    newAnimationMixer.setWeight(layerName, weight);
                    
                    // Auto-play animations if enabled
                    if (this.autoPlayAnimation) {
                        // Start animation: layerName, startOffset, loops (-1 for infinite)
                        newAnimationMixer.start(layerName, 0.0, -1);
                    }
                }
            }
        }
    }
    
    // Helper method to get animation layer names from an AnimationMixer
    private getAnimationLayers(mixer: AnimationMixer): string[] {
        const layers: string[] = [];
        
        // Check for common layer names
        const commonLayers = ['BaseLayer', 'DefaultLayer', 'Main', 'Animation'];
        
        for (const layer of commonLayers) {
            try {
                // Check if this layer exists by trying to get its weight
                mixer.getWeight(layer);
                layers.push(layer);
            } catch (e) {
                // Layer doesn't exist, ignore
            }
        }
        
        // If no common layers found, add a fallback
        if (layers.length === 0) {
            // Try to use reflection or other means to discover layers
            // For now, just add a default layer name as fallback
            layers.push('BaseLayer');
        }
        
        return layers;
    }

    private setupInteractionComponents(newObject: SceneObject): void {
        // Setup Collider first (required for interaction)
        const colliderComponent = this.objectTemplate.getComponent('Component.ColliderComponent') as ColliderComponent;
        if (colliderComponent) {
            const newCollider = newObject.copyComponent(colliderComponent);
            if (newCollider) {
                newCollider.enabled = true;
            }
        }

        // Setup Interactable
        const interactableComponent = this.objectTemplate.getComponent(Interactable.getTypeName()) as Interactable;
        if (interactableComponent) {
            const newInteractable = newObject.copyComponent(interactableComponent) as Interactable;
            if (newInteractable) {
                newInteractable.enabled = true;
                newInteractable.allowMultipleInteractors = true; // Enable multi-touch
                newInteractable.targetingMode = interactableComponent.targetingMode;
                newInteractable.enableInstantDrag = true;
            }
        }

        // Setup InteractableManipulation
        const manipulationComponent = this.objectTemplate.getComponent(InteractableManipulation.getTypeName()) as InteractableManipulation;
        if (manipulationComponent) {
            const newManipulation = newObject.copyComponent(manipulationComponent) as InteractableManipulation;
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

    onDestroy(): void {
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
}