import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { InteractorEvent } from 'SpectaclesInteractionKit/Core/Interactor/InteractorEvent';

@component
export class PrefabSpawner extends BaseScriptComponent {
    @input('Component.ScriptComponent')
    @hint('The PinchButton that will trigger the prefab spawn')
    pinchButton: PinchButton;

    @input('Component.ScriptComponent')
    @hint('The Instantiator component to handle prefab instantiation')
    instantiator: any; // Using 'any' type since we don't have the specific import

    @input('Asset.ObjectPrefab')
    @hint('The prefab template to spawn')
    prefabTemplate: ObjectPrefab;

    @input('Component.Camera')
    @hint('The camera used for spawn positioning')
    camera: Camera;

    @input('number')
    @hint('Distance in front of camera to spawn prefab')
    spawnDistance: number = 1.0;

    @input('number')
    @hint('Scale factor for spawned prefab')
    spawnScale: number = 1.0;

    @input('boolean')
    @hint('Claims ownership of the spawned prefab')
    claimOwnership: boolean = true;

    @input('string')
    @hint('Persistence type: Session, Persistent, or Ephemeral')
    persistence: string = 'Session';

    private onPinchCallback: (event: InteractorEvent) => void;
    private isInitialized: boolean = false;

    onAwake(): void {
        if (!this.pinchButton || !this.prefabTemplate || !this.camera || !this.instantiator) {
            print('Error: Required inputs not set in PrefabSpawner script');
            return;
        }

        this.onPinchCallback = () => this.spawnPrefab();
        this.instantiator.notifyOnReady(() => {
            this.isInitialized = true;
            print('Instantiator is ready. Prefab spawner initialized.');
        });

        this.pinchButton.onButtonPinched(this.onPinchCallback);
    }

    private spawnPrefab(): void {
        if (!this.isInitialized) {
            print('Instantiator not yet initialized. Cannot spawn prefab.');
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

        // Configure instantiation options
        const options = {
            claimOwnership: this.claimOwnership,
            persistence: this.persistence,
            worldPosition: spawnPosition,
            worldScale: new vec3(this.spawnScale, this.spawnScale, this.spawnScale),
            onSuccess: (networkRootInfo: any) => {
                // Enable visibility of the spawned object
                if (networkRootInfo && networkRootInfo.instantiatedObject) {
                    const spawnedObject = networkRootInfo.instantiatedObject;
                    spawnedObject.enabled = true;
                    
                    print('Prefab spawned successfully at position: ' + 
                          spawnPosition.x + ', ' + 
                          spawnPosition.y + ', ' + 
                          spawnPosition.z);
                }
            },
            onError: (error: any) => {
                print('Error instantiating prefab: ' + error);
            }
        };

        // Instantiate the prefab with the configured options
        this.instantiator.instantiate(this.prefabTemplate, options);
    }

    onDestroy(): void {
        if (this.pinchButton && this.onPinchCallback) {
            this.pinchButton.onButtonPinched.remove(this.onPinchCallback);
        }
    }
}