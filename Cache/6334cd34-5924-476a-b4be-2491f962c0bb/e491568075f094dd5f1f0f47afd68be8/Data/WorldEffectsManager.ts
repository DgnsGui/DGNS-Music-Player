import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { InteractorEvent } from 'SpectaclesInteractionKit/Core/Interactor/InteractorEvent';

@component
export class ToggleVisibilityController extends BaseScriptComponent {
    // Input property for the PinchButton component
    @input('Component.ScriptComponent')
    @hint('The PinchButton component that will trigger the visibility toggle')
    pinchButton: PinchButton;

    // Input property for the target SceneObject
    @input('SceneObject')
    @hint('The SceneObject whose visibility will be toggled')
    targetObject: SceneObject;

    // Keep track of current visibility state
    private isVisible: boolean = true;

    // Store the event handler reference so we can remove it later
    private handlePinch: (event: InteractorEvent) => void;

    onAwake(): void {
        // Verify that required inputs are set
        if (!this.pinchButton || !this.targetObject) {
            print("Error: PinchButton or target object not set in Inspector");
            return;
        }

        // Create the event handler
        this.handlePinch = (event: InteractorEvent) => {
            this.toggleVisibility();
        };

        // Set up the pinch button event listener
        this.pinchButton.onButtonPinched.add(this.handlePinch);

        // Initialize visibility state to match the object's current state
        this.isVisible = this.targetObject.enabled;
    }

    // Toggle visibility of the target object
    private toggleVisibility(): void {
        this.isVisible = !this.isVisible;
        this.targetObject.enabled = this.isVisible;
        print(`Object visibility toggled to: ${this.isVisible}`);
    }

    // Clean up event listener when the script is destroyed
    destroy(): void {
        if (this.pinchButton && this.handlePinch) {
            this.pinchButton.onButtonPinched.remove(this.handlePinch);
        }
        super.destroy();
    }
}