import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { InteractorEvent } from 'SpectaclesInteractionKit/Core/Interactor/InteractorEvent';
import { MusicPlayerManager } from './MusicPlayerManager'; // Assurez-vous d'importer le script MusicPlayerManager

@component
export class ToggleVisibilityController extends BaseScriptComponent {
    // Input property for the PinchButton component
    @input('Component.ScriptComponent')
    @hint('The PinchButton component that will trigger the visibility toggle')
    pinchButton: PinchButton;

    // Input property for the MusicPlayerManager
    @input('Component.ScriptComponent')
    @hint('The MusicPlayerManager component to get the current track')
    musicPlayerManager: MusicPlayerManager;

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
        if (!this.pinchButton || !this.musicPlayerManager) {
            print("Error: PinchButton or MusicPlayerManager not set in Inspector");
            return;
        }

        // Add this controller to the static registry
        ToggleVisibilityController.activeControllers.push(this);

        // Create the event handler
        this.handlePinch = (event: InteractorEvent) => {
            this.toggleVisibilityExclusively();
        };

        // Set up the pinch button event listener
        this.pinchButton.onButtonPinched.add(this.handlePinch);

        // Initialize visibility state
        this.isVisible = false; // Par défaut, désactivé au démarrage
    }

    // Toggle visibility and manage other objects
    private toggleVisibilityExclusively(): void {
        // Récupérer l'index de la piste actuelle depuis MusicPlayerManager
        const currentTrackIndex = this.musicPlayerManager.getCurrentTrackIndex();

        if (currentTrackIndex === -1) {
            print("No track is currently loaded in MusicPlayerManager");
            this.setVisibility(false); // Désactiver si aucune piste n'est chargée
            return;
        }

        // Récupérer le worldmesh correspondant à la piste actuelle
        const targetObject = this.musicPlayerManager.getTrackPrefab(currentTrackIndex);

        if (!targetObject) {
            print("Error: No worldmesh found for the current track");
            return;
        }

        if (this.isVisible) {
            // Si déjà visible, simplement désactiver
            this.setVisibility(false);
            print(`Worldmesh for track "${currentTrackIndex}" deactivated`);
        } else {
            // Désactiver tous les autres worldmeshes via les autres controllers
            ToggleVisibilityController.activeControllers.forEach(controller => {
                if (controller !== this && controller.isVisible) {
                    controller.setVisibility(false);
                }
            });

            // Désactiver les autres objets listés dans otherObjects
            this.otherObjects.forEach(obj => {
                if (obj) obj.enabled = false;
            });

            // Activer le worldmesh correspondant à la piste actuelle
            this.setVisibility(true, targetObject);
            print(`Worldmesh for track "${currentTrackIndex}" activated exclusively`);
        }
    }

    // Set visibility with state tracking
    private setVisibility(visible: boolean, targetObject?: SceneObject): void {
        this.isVisible = visible;

        // Si un targetObject est fourni (lors de l'activation), l'utiliser
        if (targetObject) {
            targetObject.enabled = visible;
        }
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