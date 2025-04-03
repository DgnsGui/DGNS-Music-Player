import { BaseScriptComponent } from 'SpectaclesInteractionKit/Components';
import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { InteractorEvent } from 'SpectaclesInteractionKit/Core/Interactor/InteractorEvent';

@component
export class PrefabSpawner extends BaseScriptComponent {
    @input
    pinchButton: PinchButton;

    @input
    objectTemplate: SceneObject;

    @input
    camera: Camera;

    @input
    spawnDistance: number = 1.0;

    @input
    spawnScale: number = 1.0;

    private spawnedObjects: SceneObject[] = [];
    private onPinchCallback: (event: InteractorEvent) => void;

    onAwake(): void {
        if (!this.pinchButton || !this.objectTemplate || !this.camera) {
            print('Error: Required inputs not set in PrefabSpawner script');
            return;
        }

        this.onPinchCallback = (event: InteractorEvent) => this.spawnObject();
        this.pinchButton.onButtonPinched.add(this.onPinchCallback);
    }

    private spawnObject(): void {
        const newObject = this.objectTemplate.clone();
        global.scene.addSceneObject(newObject);

        const camTransform = this.camera.getTransform();
        const forward = camTransform.forward;
        const position = camTransform.getWorldPosition();
        const spawnPosition = position.add(forward.uniformScale(this.spawnDistance));

        const objTransform = newObject.getTransform();
        objTransform.setWorldPosition(spawnPosition);
        objTransform.setLocalScale(new vec3(this.spawnScale, this.spawnScale, this.spawnScale));

        newObject.enabled = true;
        this.spawnedObjects.push(newObject);

        print('Object spawned at position: ' + spawnPosition.x + ', ' + spawnPosition.y + ', ' + spawnPosition.z);
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