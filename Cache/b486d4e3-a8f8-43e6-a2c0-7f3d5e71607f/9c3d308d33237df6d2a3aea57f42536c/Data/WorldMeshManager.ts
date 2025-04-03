@component
import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { SIK } from 'SpectaclesInteractionKit/SIK';
import { BaseScriptComponent } from 'LensStudio:BaseScriptComponent';
import { SceneObject } from 'LensStudio:SceneObject';

@component
export class WorldMeshToggle extends BaseScriptComponent {
    // Array of objects containing pinch buttons and their corresponding world meshes
    @input
    @hint('Add PinchButton and WorldMesh pairs here')
    togglePairs: { button: PinchButton; worldMesh: SceneObject }[] = [];

    onAwake() {
        this.setupButtonEvents();
    }

    private setupButtonEvents() {
        // Loop through all toggle pairs
        this.togglePairs.forEach((pair, index) => {
            if (!pair.button || !pair.worldMesh) {
                print(`Warning: Missing button or world mesh at index ${index}`);
                return;
            }

            // Ensure world mesh starts disabled (optional: remove if you want them enabled by default)
            pair.worldMesh.enabled = false;

            // Bind the pinch event
            pair.button.onButtonPinched.add(() => {
                this.toggleWorldMesh(pair.worldMesh);
            });
        });
    }

    private toggleWorldMesh(worldMesh: SceneObject) {
        // Toggle the enabled state of the world mesh
        worldMesh.enabled = !worldMesh.enabled;
        print(`World Mesh is now ${worldMesh.enabled ? 'enabled' : 'disabled'}`);
    }
}