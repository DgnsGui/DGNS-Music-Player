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
    
    // Input property for other objects to deactivate
    @input('SceneObject[]')
    @hint('Other objects that should be deactivated when the target object is activated')
    otherObjects: SceneObject[] = [];

    // Keep track of current visibility state
    private isVisible: boolean = true;

    // Store the event handler reference so we can remove it later
    private handlePinch: (event: InteractorEvent) => void;

    // Reference to a static registry of all controllers for coordination
    private static activeControllers: ToggleVisibilityController[] = [];

    onAwake(): void {
        // Verify that required inputs are set
        if (!this.pinchButton || !this.targetObject) {
            print("Error: PinchButton or target object not set in Inspector");
            return;
        }

        // Add this controller to the static registry
        ToggleVisibilityController.activeControllers.push(this);

        // Create the event handler
        this.handlePinch = (event: InteractorEvent) => {
            this.activateExclusively();
        };

        // Set up the pinch button event listener
        this.pinchButton.onButtonPinched.add(this.handlePinch);

        // Initialize visibility state to match the object's current state
        this.isVisible = this.targetObject.enabled;
    }

    // Activate this object and deactivate all others
    private activateExclusively(): void {
        // If already visible, do nothing (optional: you can remove this check 
        // if you want clicking an active item to deactivate it)
        if (this.isVisible) {
            return;
        }

        // Deactivate all other controllers' objects
        ToggleVisibilityController.activeControllers.forEach(controller => {
            if (controller !== this && controller.isVisible) {
                controller.setVisibility(false);
            }
        });

        // Activate this object
        this.setVisibility(true);
        
        print(`Object "${this.targetObject.name}" activated exclusively`);
    }

    // Set visibility with state tracking
    private setVisibility(visible: boolean): void {
        this.isVisible = visible;
        this.targetObject.enabled = visible;
    }

    // Clean up event listener when the script is destroyed
    destroy(): void {
        // Remove this controller from the static registry
        const index = ToggleVisibilityController.activeControllers.indexOf(this);
        if (index !== -1) {
            ToggleVisibilityController.activeControllers.splice(index, 1);
        }

        if (this.pinchButton && this.handlePinch) {
            this.pinchButton.onButtonPinched.remove(this.handlePinch);
        }
        super.destroy();
    }
}