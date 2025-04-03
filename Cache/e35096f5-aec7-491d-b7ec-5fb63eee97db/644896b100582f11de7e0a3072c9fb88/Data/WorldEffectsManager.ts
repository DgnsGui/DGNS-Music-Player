import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { InteractorEvent } from 'SpectaclesInteractionKit/Core/Interactor/InteractorEvent';

@component
export class ToggleVisibilityController extends BaseScriptComponent {
    // Input property for the PinchButton component
    @input('Component.ScriptComponent')
    @hint('The PinchButton component that will trigger the visibility toggle')
    pinchButton: PinchButton;

    // Input property for the MusicPlayerManager script component
    @input('Component.ScriptComponent')
    @hint('The MusicPlayerManager script component to get the current track')
    musicPlayerManager: ScriptComponent;

    // Input property for other objects to deactivate
    @input('SceneObject[]')
    @hint('Other objects that should be deactivated when the target object is activated')
    otherObjects: SceneObject[] = [];

    // Keep track of current visibility state
    private isVisible: boolean = false;

    // Store the event handler reference so we can remove it later
    private handlePinch: (event: InteractorEvent) => void;

    // Reference to a static registry of all controllers for coordination
    private static activeControllers: ToggleVisibilityController[] = [];

    // Keep track of the currently active worldmesh
    private currentActiveWorldMesh: SceneObject | null = null;

    // Private reference to the MusicPlayerManager instance with proper typing
    private musicPlayerManagerInstance: any;

    onAwake(): void {
        // Verify that required inputs are set
        if (!this.pinchButton) {
            print("Error: PinchButton not set in Inspector for ToggleVisibilityController");
            return;
        }

        if (!this.musicPlayerManager) {
            print("Error: MusicPlayerManager script component not set in Inspector for ToggleVisibilityController");
            return;
        }

        // Validate that the assigned script component is a MusicPlayerManager
        this.musicPlayerManagerInstance = this.musicPlayerManager as any;
        if (!this.musicPlayerManagerInstance.getCurrentTrackIndex || !this.musicPlayerManagerInstance.getWorldMesh) {
            print("Error: Assigned script component is not a valid MusicPlayerManager instance");
            return;
        }

        // Validate otherObjects array
        if (this.otherObjects && this.otherObjects.some(obj => obj == null)) {
            print("Warning: Some objects in otherObjects array are null in ToggleVisibilityController");
            this.otherObjects = this.otherObjects.filter(obj => obj != null);
        }

        // Add this controller to the static registry
        ToggleVisibilityController.activeControllers.push(this);

        // Create the event handler for the pinch button
        this.handlePinch = (event: InteractorEvent) => {
            this.toggleVisibilityExclusively();
        };

        // Set up the pinch button event listener
        this.pinchButton.onButtonPinched.add(this.handlePinch);

        // Initialize visibility state to false (nothing visible at start)
        this.isVisible = false;
        print("ToggleVisibilityController initialized successfully");
    }

    // Toggle visibility and manage other objects
    private toggleVisibilityExclusively(): void {
        // Get the current track index from MusicPlayerManager
        const currentTrackIndex = this.musicPlayerManagerInstance.getCurrentTrackIndex();

        // Check if a track is loaded
        if (currentTrackIndex === -1) {
            print("No track is currently loaded in MusicPlayerManager");
            if (this.isVisible) {
                this.setVisibility(false);
            }
            return;
        }

        // Get the worldmesh corresponding to the current track
        const targetObject = this.musicPlayerManagerInstance.getWorldMesh(currentTrackIndex);
        if (!targetObject) {
            print(`Error: No worldmesh found for track index ${currentTrackIndex} in MusicPlayerManager`);
            if (this.isVisible) {
                this.setVisibility(false);
            }
            return;
        }

        if (this.isVisible && this.currentActiveWorldMesh === targetObject) {
            // If the same worldmesh is already visible, toggle it off
            this.setVisibility(false);
            print(`Worldmesh for track index ${currentTrackIndex} deactivated`);
        } else {
            // Deactivate all other controllers' worldmeshes
            ToggleVisibilityController.activeControllers.forEach(controller => {
                if (controller !== this && controller.isVisible) {
                    controller.setVisibility(false);
                    print(`Deactivated worldmesh from another controller: ${controller.getSceneObject().name}`);
                }
            });

            // Deactivate other objects listed in otherObjects
            if (this.otherObjects) {
                this.otherObjects.forEach(obj => {
                    if (obj) {
                        obj.enabled = false;
                        print(`Deactivated other object: ${obj.name}`);
                    }
                });
            }

            // Activate the worldmesh for the current track
            this.setVisibility(true, targetObject);
            print(`Worldmesh for track index ${currentTrackIndex} activated exclusively`);
        }
    }

    // Set visibility with state tracking
    private setVisibility(visible: boolean, targetObject?: SceneObject): void {
        this.isVisible = visible;

        // If there's a currently active worldmesh, deactivate it
        if (this.currentActiveWorldMesh && !visible) {
            this.currentActiveWorldMesh.enabled = false;
            print(`Deactivated worldmesh: ${this.currentActiveWorldMesh.name}`);
            this.currentActiveWorldMesh = null;
        }

        // If a new targetObject is provided (when enabling), activate it
        if (visible && targetObject) {
            this.currentActiveWorldMesh = targetObject;
            this.currentActiveWorldMesh.enabled = true;
            // Activer récursivement tous les enfants pour s'assurer que le worldmesh est visible
            this.enableChildrenRecursively(this.currentActiveWorldMesh);
            print(`Activated worldmesh: ${this.currentActiveWorldMesh.name}`);
        }
    }

    // Méthode pour activer récursivement tous les enfants d'un SceneObject
    private enableChildrenRecursively(sceneObject: SceneObject): void {
        if (!sceneObject) return;

        // Activer l'objet lui-même
        sceneObject.enabled = true;

        // Activer tous les enfants
        const childCount = sceneObject.getChildrenCount();
        for (let i = 0; i < childCount; i++) {
            const child = sceneObject.getChild(i);
            if (child) {
                this.enableChildrenRecursively(child);
            }
        }
    }

    // Clean up event listener when the script is destroyed
    onDestroy(): void {
        // Remove this controller from the static registry
        const index = ToggleVisibilityController.activeControllers.indexOf(this);
        if (index !== -1) {
            ToggleVisibilityController.activeControllers.splice(index, 1);
        }

        // Remove the pinch button event listener
        if (this.pinchButton && this.handlePinch) {
            this.pinchButton.onButtonPinched.remove(this.handlePinch);
        }

        // Deactivate the current worldmesh if it exists
        if (this.currentActiveWorldMesh) {
            this.currentActiveWorldMesh.enabled = false;
            print(`Deactivated worldmesh on destroy: ${this.currentActiveWorldMesh.name}`);
            this.currentActiveWorldMesh = null;
        }

        print("ToggleVisibilityController destroyed");
    }
}