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
        this.validateInputs();
        this.setupCallbacks();
        // Initialize with Y2K skin active
        this.activateSkin('Y2K');
        print("PlayerSkinManager initialized with Y2K skin.");
    }
    validateInputs() {
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
    setupCallbacks() {
        if (this.skinButton) {
            this.skinButton.onButtonPinched.add((event) => this.toggleSkin());
            print("Skin button callback set.");
        }
        if (this.handButton) {
            this.handButton.onButtonPinched.add((event) => this.switchToHand());
            print("Hand button callback set.");
        }
    }
    toggleSkin() {
        print(`Toggling skin from ${this.currentSkin}`);
        // Stop playback on the current skin
        this.stopCurrentPlayback();
        if (this.currentSkin === 'Y2K') {
            this.activateSkin('Modern');
        }
        else if (this.currentSkin === 'Modern') {
            this.activateSkin('Y2K');
        }
    }
    switchToHand() {
        print(`Switching to Hand skin from ${this.currentSkin}`);
        // Stop playback on the current skin
        this.stopCurrentPlayback();
        this.activateSkin('Hand');
    }
    stopCurrentPlayback() {
        const currentManager = this.getCurrentManager();
        if (currentManager) {
            currentManager.stopTrack();
        }
    }
    activateSkin(skin) {
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
    getCurrentManager() {
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
    onDestroy() {
        if (this.skinButton) {
            this.skinButton.onButtonPinched.remove((event) => this.toggleSkin());
        }
        if (this.handButton) {
            this.handButton.onButtonPinched.remove((event) => this.switchToHand());
        }
    }
    __initialize() {
        super.__initialize();
        this.currentSkin = 'Y2K';
    }
};
exports.PlayerSkinManager = PlayerSkinManager;
exports.PlayerSkinManager = PlayerSkinManager = __decorate([
    component
], PlayerSkinManager);
//# sourceMappingURL=PlayerSkinManager.js.map