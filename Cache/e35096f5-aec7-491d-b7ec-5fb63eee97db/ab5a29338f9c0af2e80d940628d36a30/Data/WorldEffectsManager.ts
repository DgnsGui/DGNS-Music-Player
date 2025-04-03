import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { InteractorEvent } from 'SpectaclesInteractionKit/Core/Interactor/InteractorEvent';

@component
export class WorldEffectsManager extends BaseScriptComponent {
    @input('Component.ScriptComponent')
    @hint('The PinchButton component that will trigger the visibility toggle')
    pinchButton: PinchButton;

    @input('Component.ScriptComponent')
    @hint('The MusicPlayerManager script component to get the current track')
    musicPlayerManager: ScriptComponent;

    @input('SceneObject[]')
    @hint('Other objects that should be deactivated when the target object is activated')
    otherObjects: SceneObject[] = [];

    private isVisible: boolean = false;
    private handlePinch: (event: InteractorEvent) => void;
    private static activeControllers: WorldEffectsManager[] = [];
    private currentActiveWorldMesh: SceneObject | null = null;
    private musicPlayerManagerInstance: any;

    onAwake(): void {
        if (!this.pinchButton) {
            print("Error: PinchButton not set in Inspector for WorldEffectsManager");
            return;
        }

        if (!this.musicPlayerManager) {
            print("Error: MusicPlayerManager script component not set in Inspector for WorldEffectsManager");
            return;
        }

        this.musicPlayerManagerInstance = this.musicPlayerManager as any;
        if (!this.musicPlayerManagerInstance.getCurrentTrackIndex || !this.musicPlayerManagerInstance.getWorldMesh) {
            print("Error: Assigned script component is not a valid MusicPlayerManager instance");
            return;
        }

        if (this.otherObjects && this.otherObjects.some(obj => obj == null)) {
            print("Warning: Some objects in otherObjects array are null in WorldEffectsManager");
            this.otherObjects = this.otherObjects.filter(obj => obj != null);
        }

        WorldEffectsManager.activeControllers.push(this);

        this.handlePinch = (event: InteractorEvent) => {
            print("PinchButton clicked! Triggering toggleVisibilityExclusively.");
            this.toggleVisibilityExclusively();
        };

        print("Attaching event listener to PinchButton...");
        this.pinchButton.onButtonPinched.add(this.handlePinch);
        print("Event listener attached successfully.");

        this.createEvent("OnKeyDownEvent").bind((eventData) => {
            if (eventData.getKey() === KeyCode.T) {
                print("Key T pressed! Triggering toggleVisibilityExclusively.");
                this.toggleVisibilityExclusively();
            }
        });

        this.isVisible = false;
        print("WorldEffectsManager initialized successfully");
    }

    private toggleVisibilityExclusively(): void {
        print("Entering toggleVisibilityExclusively...");
        
        const currentTrackIndex = this.musicPlayerManagerInstance.getCurrentTrackIndex();
        print(`Current track index: ${currentTrackIndex}`);

        if (currentTrackIndex === -1) {
            print("No track is currently loaded in MusicPlayerManager");
            if (this.isVisible) {
                this.setVisibility(false);
            }
            return;
        }

        const targetObject = this.musicPlayerManagerInstance.getWorldMesh(currentTrackIndex);
        if (!targetObject) {
            print(`Error: No worldmesh found for track index ${currentTrackIndex} in MusicPlayerManager`);
            if (this.isVisible) {
                this.setVisibility(false);
            }
            return;
        }
        print(`Target worldmesh found: ${targetObject.name}`);

        if (this.isVisible && this.currentActiveWorldMesh === targetObject) {
            this.setVisibility(false);
            print(`Worldmesh for track index ${currentTrackIndex} deactivated`);
        } else {
            WorldEffectsManager.activeControllers.forEach(controller => {
                if (controller !== this && controller.isVisible) {
                    controller.setVisibility(false);
                    print(`Deactivated worldmesh from another controller: ${controller.getSceneObject().name}`);
                }
            });

            if (this.otherObjects) {
                this.otherObjects.forEach(obj => {
                    if (obj) {
                        obj.enabled = false;
                        print(`Deactivated other object: ${obj.name}`);
                    }
                });
            }

            this.setVisibility(true, targetObject);
            print(`Worldmesh for track index ${currentTrackIndex} activated exclusively`);
        }
    }

    private setVisibility(visible: boolean, targetObject?: SceneObject): void {
        this.isVisible = visible;

        if (this.currentActiveWorldMesh && !visible) {
            this.currentActiveWorldMesh.enabled = false;
            print(`Deactivated worldmesh: ${this.currentActiveWorldMesh.name}`);
            this.currentActiveWorldMesh = null;
        }

        if (visible && targetObject) {
            this.currentActiveWorldMesh = targetObject;
            this.currentActiveWorldMesh.enabled = true;
            this.enableChildrenRecursively(this.currentActiveWorldMesh);
            print(`Activated worldmesh: ${this.currentActiveWorldMesh.name}`);
        }
    }

    private enableChildrenRecursively(sceneObject: SceneObject): void {
        if (!sceneObject) return;
        sceneObject.enabled = true;
        const childCount = sceneObject.getChildrenCount();
        for (let i = 0; i < childCount; i++) {
            const child = sceneObject.getChild(i);
            if (child) {
                this.enableChildrenRecursively(child);
            }
        }
    }

    onDestroy(): void {
        const index = WorldEffectsManager.activeControllers.indexOf(this);
        if (index !== -1) {
            WorldEffectsManager.activeControllers.splice(index, 1);
        }

        if (this.pinchButton && this.handlePinch) {
            this.pinchButton.onButtonPinched.remove(this.handlePinch);
        }

        if (this.currentActiveWorldMesh) {
            this.currentActiveWorldMesh.enabled = false;
            print(`Deactivated worldmesh on destroy: ${this.currentActiveWorldMesh.name}`);
            this.currentActiveWorldMesh = null;
        }

        print("WorldEffectsManager destroyed");
    }
}