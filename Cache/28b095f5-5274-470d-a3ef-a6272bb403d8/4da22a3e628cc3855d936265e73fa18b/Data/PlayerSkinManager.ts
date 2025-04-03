import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { InteractorEvent } from 'SpectaclesInteractionKit/Core/Interactor/InteractorEvent';

// Déclaration de l'interface pour MusicPlayerManager (basée sur le script fourni)
interface MusicPlayerManager extends ScriptComponent {
    stopTrack(): void;
}

@component
export class PlayerSkinManager extends BaseScriptComponent {
    // Prefabs pour chaque skin avec leurs MusicPlayerManager associés
    @input('SceneObject')
    @hint('Prefab du Music Player Y2K')
    musicPlayerY2K: SceneObject;

    @input('Component.ScriptComponent')
    @hint('MusicPlayerManager pour le skin Y2K')
    musicPlayerManagerY2K: ScriptComponent;

    @input('SceneObject')
    @hint('Prefab du Music Player Modern')
    musicPlayerModern: SceneObject;

    @input('Component.ScriptComponent')
    @hint('MusicPlayerManager pour le skin Modern')
    musicPlayerManagerModern: ScriptComponent;

    @input('SceneObject')
    @hint('Prefab du Music Player Hand')
    musicPlayerHand: SceneObject;

    @input('Component.ScriptComponent')
    @hint('MusicPlayerManager pour le skin Hand')
    musicPlayerManagerHand: ScriptComponent;

    // Boutons de contrôle des skins
    @input('Component.ScriptComponent')
    @hint('Bouton Skin dans le prefab Y2K pour basculer entre Y2K et Modern')
    skinButtonY2K: PinchButton;

    @input('Component.ScriptComponent')
    @hint('Bouton Skin dans le prefab Modern pour basculer entre Modern et Y2K')
    skinButtonModern: PinchButton;

    @input('Component.ScriptComponent')
    @hint('Bouton Hand dans le prefab Y2K pour passer au skin Hand')
    handButtonY2K: PinchButton;

    @input('Component.ScriptComponent')
    @hint('Bouton Hand dans le prefab Modern pour passer au skin Hand')
    handButtonModern: PinchButton;

    // État actuel du skin
    private currentSkin: string = 'Y2K'; // Par défaut, on commence avec Y2K
    private lastPinchTime: number = 0; // Pour le debounce
    private skinButtonY2KCallback: (event: InteractorEvent) => void;
    private skinButtonModernCallback: (event: InteractorEvent) => void;
    private handButtonY2KCallback: (event: InteractorEvent) => void;
    private handButtonModernCallback: (event: InteractorEvent) => void;

    onAwake(): void {
        // Validation des inputs
        if (!this.musicPlayerY2K || !this.musicPlayerManagerY2K) {
            print("Error: Music Player Y2K or its manager is not defined.");
            return;
        }
        if (!this.musicPlayerModern || !this.musicPlayerManagerModern) {
            print("Error: Music Player Modern or its manager is not defined.");
            return;
        }
        if (!this.musicPlayerHand || !this.musicPlayerManagerHand) {
            print("Error: Music Player Hand or its manager is not defined.");
            return;
        }
        if (!this.skinButtonY2K || !this.skinButtonModern || !this.handButtonY2K || !this.handButtonModern) {
            print("Error: One or more skin control buttons are not defined.");
            return;
        }

        // Désactiver tous les prefabs sauf Y2K au démarrage
        this.musicPlayerY2K.enabled = true;
        this.musicPlayerModern.enabled = false;
        this.musicPlayerHand.enabled = false;

        // Configurer les callbacks des boutons
        this.setupCallbacks();

        print("PlayerSkinManager initialized with Y2K skin active.");
    }

    private setupCallbacks(): void {
        // Bouton Skin dans Y2K (passe à Modern)
        this.skinButtonY2KCallback = (event: InteractorEvent) => this.switchSkin('Modern');
        this.skinButtonY2K.onButtonPinched.add(this.skinButtonY2KCallback);

        // Bouton Skin dans Modern (passe à Y2K)
        this.skinButtonModernCallback = (event: InteractorEvent) => this.switchSkin('Y2K');
        this.skinButtonModern.onButtonPinched.add(this.skinButtonModernCallback);

        // Bouton Hand dans Y2K (passe à Hand)
        this.handButtonY2KCallback = (event: InteractorEvent) => this.switchSkin('Hand');
        this.handButtonY2K.onButtonPinched.add(this.handButtonY2KCallback);

        // Bouton Hand dans Modern (passe à Hand)
        this.handButtonModernCallback = (event: InteractorEvent) => this.switchSkin('Hand');
        this.handButtonModern.onButtonPinched.add(this.handButtonModernCallback);

        print("Skin control button callbacks set.");
    }

    private switchSkin(targetSkin: string): void {
        const currentTime = getTime();
        if (currentTime - this.lastPinchTime < 0.5) { // Debounce de 500ms
            print("Skin switch ignored due to debounce");
            return;
        }
        this.lastPinchTime = currentTime;

        if (this.currentSkin === targetSkin) {
            print(`Already on skin ${targetSkin}, no switch needed.`);
            return;
        }

        // Arrêter la lecture du skin actuel
        this.stopCurrentSkinPlayback();

        // Désactiver le prefab actuel
        this.disableCurrentSkin();

        // Activer le nouveau skin
        this.enableTargetSkin(targetSkin);

        // Mettre à jour l'état
        this.currentSkin = targetSkin;
        print(`Switched to skin: ${targetSkin}`);
    }

    private stopCurrentSkinPlayback(): void {
        let currentManager: ScriptComponent;
        switch (this.currentSkin) {
            case 'Y2K':
                currentManager = this.musicPlayerManagerY2K;
                break;
            case 'Modern':
                currentManager = this.musicPlayerManagerModern;
                break;
            case 'Hand':
                currentManager = this.musicPlayerManagerHand;
                break;
            default:
                return;
        }

        const managerScript = currentManager as unknown as MusicPlayerManager;
        if (managerScript && typeof managerScript.stopTrack === 'function') {
            managerScript.stopTrack();
            print(`Stopped playback for skin ${this.currentSkin}`);
        }
    }

    private disableCurrentSkin(): void {
        switch (this.currentSkin) {
            case 'Y2K':
                this.musicPlayerY2K.enabled = false;
                break;
            case 'Modern':
                this.musicPlayerModern.enabled = false;
                break;
            case 'Hand':
                this.musicPlayerHand.enabled = false;
                break;
        }
        print(`Disabled skin: ${this.currentSkin}`);
    }

    private enableTargetSkin(targetSkin: string): void {
        switch (targetSkin) {
            case 'Y2K':
                this.musicPlayerY2K.enabled = true;
                this.ensureComponentsEnabled(this.musicPlayerY2K);
                break;
            case 'Modern':
                this.musicPlayerModern.enabled = true;
                this.ensureComponentsEnabled(this.musicPlayerModern);
                break;
            case 'Hand':
                this.musicPlayerHand.enabled = true;
                this.ensureComponentsEnabled(this.musicPlayerHand);
                break;
        }
    }

    private ensureComponentsEnabled(prefab: SceneObject): void {
        // Activer tous les SceneObjects enfants et leurs composants
        const childCount = prefab.getChildrenCount();
        for (let i = 0; i < childCount; i++) {
            const child = prefab.getChild(i);
            child.enabled = true;

            // Activer les composants spécifiques (PinchButton, AudioComponent, etc.)
            const scriptComponents = child.getComponents('Component.ScriptComponent');
            scriptComponents.forEach((script) => {
                script.enabled = true;
            });

            const audioComponents = child.getComponents('Component.AudioComponent');
            audioComponents.forEach((audio) => {
                audio.enabled = true;
            });

            const textComponents = child.getComponents('Component.Text');
            textComponents.forEach((text) => {
                text.enabled = true;
            });
        }
        print(`All components enabled for prefab: ${prefab.name}`);
    }

    onDestroy(): void {
        // Nettoyer les callbacks des boutons
        if (this.skinButtonY2K && this.skinButtonY2KCallback) {
            this.skinButtonY2K.onButtonPinched.remove(this.skinButtonY2KCallback);
        }
        if (this.skinButtonModern && this.skinButtonModernCallback) {
            this.skinButtonModern.onButtonPinched.remove(this.skinButtonModernCallback);
        }
        if (this.handButtonY2K && this.handButtonY2KCallback) {
            this.handButtonY2K.onButtonPinched.remove(this.handButtonY2KCallback);
        }
        if (this.handButtonModern && this.handButtonModernCallback) {
            this.handButtonModern.onButtonPinched.remove(this.handButtonModernCallback);
        }

        // Désactiver tous les prefabs
        this.musicPlayerY2K.enabled = false;
        this.musicPlayerModern.enabled = false;
        this.musicPlayerHand.enabled = false;

        print("PlayerSkinManager destroyed.");
    }
}