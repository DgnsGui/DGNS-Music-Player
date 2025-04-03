import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { SIK } from 'SpectaclesInteractionKit/SIK';

// Since BaseScriptComponent and SceneObject are often global in Lens Studio,
// we can often omit the explicit import and use declaration merging if needed
// Adding basic interface declaration to satisfy TypeScript
interface LS {
    BaseScriptComponent: typeof ScriptComponent;
    SceneObject: typeof SceneObject;
    input: PropertyDecorator;
    hint(hint: string): PropertyDecorator;
}

declare const LS: LS;

export class WorldMeshToggle extends ScriptComponent {
    // Array of objects containing pinch buttons and their corresponding world meshes
    @LS.input
    @LS.hint('Add PinchButton and WorldMesh pairs here')
    togglePairs: { button: PinchButton; worldMesh: SceneObject }[] = [];

    onAwake() {
        this.setupButtonEvents();
    }

    private setupButtonEvents() {
        this.togglePairs.forEach((pair, index) => {
            if (!pair.button || !pair.worldMesh) {
                print(`Warning: Missing button or world mesh at index ${index}`);
                return;
            }

            pair.worldMesh.enabled = false;

            pair.button.onButtonPinched.add(() => {
                this.toggleWorldMesh(pair.worldMesh);
            });
        });
    }

    private toggleWorldMesh(worldMesh: SceneObject) {
        worldMesh.enabled = !worldMesh.enabled;
        print(`World Mesh is now ${worldMesh.enabled ? 'enabled' : 'disabled'}`);
    }
}