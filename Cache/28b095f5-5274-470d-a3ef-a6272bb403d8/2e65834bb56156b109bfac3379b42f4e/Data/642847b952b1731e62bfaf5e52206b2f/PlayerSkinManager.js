"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerSkinManager = void 0;
var __selfType = requireType("./PlayerSkinManager");
function component(target) { target.getTypeName = function () { return __selfType; }; }
let PlayerSkinManager = class PlayerSkinManager extends BaseScriptComponent {
    onAwake() {
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
        if (!this.skinButtonY2K || !this.skinButtonModern || !this.handButtonY2K || !this.handButtonModern || !this.handButtonHand) {
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
    setupCallbacks() {
        // Bouton Skin dans Y2K (passe à Modern)
        if (this.skinButtonY2K) {
            this.skinButtonY2KCallback = (event) => this.switchSkin('Modern');
            this.skinButtonY2K.onButtonPinched.add(this.skinButtonY2KCallback);
        }
        else {
            print("Warning: skinButtonY2K is not assigned.");
        }
        // Bouton Skin dans Modern (passe à Y2K)
        if (this.skinButtonModern) {
            this.skinButtonModernCallback = (event) => this.switchSkin('Y2K');
            this.skinButtonModern.onButtonPinched.add(this.skinButtonModernCallback);
        }
        else {
            print("Warning: skinButtonModern is not assigned.");
        }
        // Bouton Hand dans Y2K (passe à Hand)
        if (this.handButtonY2K) {
            this.handButtonY2KCallback = (event) => this.switchSkin('Hand');
            this.handButtonY2K.onButtonPinched.add(this.handButtonY2KCallback);
        }
        else {
            print("Warning: handButtonY2K is not assigned.");
        }
        // Bouton Hand dans Modern (passe à Hand)
        if (this.handButtonModern) {
            this.handButtonModernCallback = (event) => this.switchSkin('Hand');
            this.handButtonModern.onButtonPinched.add(this.handButtonModernCallback);
        }
        else {
            print("Warning: handButtonModern is not assigned.");
        }
        // Bouton Hand dans Hand (revient à Y2K)
        if (this.handButtonHand) {
            this.handButtonHandCallback = (event) => this.switchSkin('Y2K');
            this.handButtonHand.onButtonPinched.add(this.handButtonHandCallback);
        }
        else {
            print("Warning: handButtonHand is not assigned.");
        }
        print("Skin control button callbacks set.");
    }
    switchSkin(targetSkin) {
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
    stopCurrentSkinPlayback() {
        let currentManager;
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
        const managerScript = currentManager;
        if (managerScript && typeof managerScript.stopTrack === 'function') {
            managerScript.stopTrack();
            print(`Stopped playback for skin ${this.currentSkin}`);
        }
    }
    disableCurrentSkin() {
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
    enableTargetSkin(targetSkin) {
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
    ensureComponentsEnabled(prefab) {
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
    onDestroy() {
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
        if (this.handButtonHand && this.handButtonHandCallback) {
            this.handButtonHand.onButtonPinched.remove(this.handButtonHandCallback);
        }
        // Désactiver tous les prefabs
        this.musicPlayerY2K.enabled = false;
        this.musicPlayerModern.enabled = false;
        this.musicPlayerHand.enabled = false;
        print("PlayerSkinManager destroyed.");
    }
    __initialize() {
        super.__initialize();
        this.currentSkin = 'Y2K';
        this.lastPinchTime = 0;
    }
};
exports.PlayerSkinManager = PlayerSkinManager;
exports.PlayerSkinManager = PlayerSkinManager = __decorate([
    component
], PlayerSkinManager);
//# sourceMappingURL=PlayerSkinManager.js.map