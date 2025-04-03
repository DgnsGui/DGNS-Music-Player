import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { InteractorEvent } from 'SpectaclesInteractionKit/Core/Interactor/InteractorEvent';
import { MusicPlayerManager } from './MusicPlayerManager'; // Assumes MusicPlayerManager.ts is in the same directory

@component
export class PlayerSkinManager extends BaseScriptComponent {
    // References to the MusicPlayer prefabs (SceneObjects)
    @input('SceneObject')
    @hint('Prefab pour le skin Y2K')
    musicPlayerY2K: SceneObject;

    @input('SceneObject')
    @hint('Prefab pour le skin Modern')
    musicPlayerModern: SceneObject;

    @input('SceneObject')
    @hint('Prefab pour le skin Hand')
    musicPlayerHand: SceneObject;

    // References to the MusicPlayerManager script components
    @input('Component.ScriptComponent')
    @hint('Script MusicPlayerManager pour le skin Y2K')
    musicPlayerManagerY2K: MusicPlayerManager;

    @input('Component.ScriptComponent')
    @hint('Script MusicPlayerManager pour le skin Modern')
    musicPlayerManagerModern: MusicPlayerManager;

    @input('Component.ScriptComponent')
    @hint('Script MusicPlayerManager pour le skin Hand')
    musicPlayerManagerHand: MusicPlayerManager;

    // Pinch buttons for switching skins
    @input('Component.ScriptComponent')
    @hint('Bouton pour basculer entre Y2K et Modern')
    skinButton: PinchButton;

    @input('Component.ScriptComponent')
    @hint('Bouton pour passer au skin Hand')
    handButton: PinchButton;

    // Track the current active skin
    private currentSkin: 'Y2K' | 'Modern' | 'Hand' = 'Y2K'; // Default skin

    onAwake(): void {
        this.validateInputs();
        this.setupCallbacks();

        // Initialize with Y2K skin active
        this.activateSkin('Y2K');
        print("PlayerSkinManager initialized with Y2K skin.");
    }

    private validateInputs(): void {
        if (!this.musicPlayerY2K || !this.musicPlayerModern || !this.musicPlayerHand) {
            print("Error: All MusicPlayer prefabs must be assigned.");
            return;
        }
        if (!this.musicPlayerManagerY2K || !this.musicPlayerManagerModern || !this.musicPlayerManagerHand) {
            print("Error: All MusicPlayerManager scripts must be assigned.");
            return;
        }
        if (!this.skinButton || !this.handButton) {
            print("Error: Skin and Hand buttons must be assigned.");
            return;
        }
    }

    private setupCallbacks(): void {
        if (this.skinButton) {
            this.skinButton.onButtonPinched.add((event: InteractorEvent) => this.toggleSkin());
            print("Skin button callback set.");
        }
        if (this.handButton) {
            this.handButton.onButtonPinched.add((event: InteractorEvent) => this.switchToHand());
            print("Hand button callback set.");
        }
    }

    private toggleSkin(): void {
        print(`Toggling skin from ${this.currentSkin}`);
        // Stop playback on the current skin
        this.stopCurrentPlayback();

        if (this.currentSkin === 'Y2K') {
            this.activateSkin('Modern');
        } else if (this.currentSkin === 'Modern') {
            this.activateSkin('Y2K');
        }
    }

    private switchToHand(): void {
        print(`Switching to Hand skin from ${this.currentSkin}`);
        // Stop playback on the current skin
        this.stopCurrentPlayback();
        this.activateSkin('Hand');
    }

    private stopCurrentPlayback(): void {
        const currentManager = this.getCurrentManager();
        if (currentManager) {
            currentManager.stopTrack();
        }
    }

    private activateSkin(skin: 'Y2K' | 'Modern' | 'Hand'): void {
        // Deactivate all skins first
        this.musicPlayerY2K.enabled = false;
        this.musicPlayerModern.enabled = false;
        this.musicPlayerHand.enabled = false;

        // Get the current track index from the active manager before switching
        const currentManager = this.getCurrentManager();
        const currentTrackIndex = currentManager ? currentManager.getCurrentTrackIndex() : 0;

        // Activate the selected skin
        switch (skin) {
            case 'Y2K':
                this.musicPlayerY2K.enabled = true;
                this.currentSkin = 'Y2K';
                this.musicPlayerManagerY2K.loadTrack(currentTrackIndex);
                break;
            case 'Modern':
                this.musicPlayerModern.enabled = true;
                this.currentSkin = 'Modern';
                this.musicPlayerManagerModern.loadTrack(currentTrackIndex);
                break;
            case 'Hand':
                this.musicPlayerHand.enabled = true;
                this.currentSkin = 'Hand';
                this.musicPlayerManagerHand.loadTrack(currentTrackIndex);
                break;
        }
        print(`Switched to ${this.currentSkin} skin with track index ${currentTrackIndex}.`);
    }

    private getCurrentManager(): MusicPlayerManager | null {
        switch (this.currentSkin) {
            case 'Y2K':
                return this.musicPlayerManagerY2K;
            case 'Modern':
                return this.musicPlayerManagerModern;
            case 'Hand':
                return this.musicPlayerManagerHand;
            default:
                return null;
        }
    }

    onDestroy(): void {
        if (this.skinButton) {
            this.skinButton.onButtonPinched.remove((event: InteractorEvent) => this.toggleSkin());
        }
        if (this.handButton) {
            this.handButton.onButtonPinched.remove((event: InteractorEvent) => this.switchToHand());
        }
    }
}