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