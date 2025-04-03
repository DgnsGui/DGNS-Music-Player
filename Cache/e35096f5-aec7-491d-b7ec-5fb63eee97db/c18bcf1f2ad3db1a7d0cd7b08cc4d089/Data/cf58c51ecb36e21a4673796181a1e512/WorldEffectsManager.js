"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicPlayerManager = void 0;
var __selfType = requireType("./WorldEffectsManager");
function component(target) { target.getTypeName = function () { return __selfType; }; }
let MusicPlayerManager = class MusicPlayerManager extends BaseScriptComponent {
    onAwake() {
        // Validate inputs
        if (!this.tracks || this.tracks.some(track => track == null)) {
            print("Error: All tracks must be defined.");
            return;
        }
        if (!this.artists || !this.titles || this.tracks.length !== this.artists.length || this.tracks.length !== this.titles.length) {
            print("Error: The number of tracks, artists, and titles must match.");
            return;
        }
        if (this.tracks.length === 0) {
            print("Error: No audio tracks provided to MusicPlayerManager.");
            return;
        }
        if (!this.trackPrefabs || this.trackPrefabs.some(prefab => prefab == null)) {
            print("Error: All track prefabs must be defined.");
            return;
        }
        if (this.trackPrefabs.length !== this.tracks.length) {
            print("Error: The number of track prefabs must match the number of tracks.");
            return;
        }
        // Validate worldMeshes
        if (!this.worldMeshes || this.worldMeshes.some(mesh => mesh == null)) {
            print("Error: All world meshes must be defined.");
            return;
        }
        if (this.worldMeshes.length !== this.tracks.length) {
            print("Error: The number of world meshes must match the number of tracks.");
            return;
        }
        // Disable all prefabs and world meshes at startup
        this.trackPrefabs.forEach(prefab => {
            if (prefab)
                prefab.enabled = false;
        });
        this.worldMeshes.forEach(mesh => {
            if (mesh)
                mesh.enabled = false;
        });
        if (this.stoppedPrefab) {
            this.stoppedPrefab.enabled = false;
        }
        // ... (reste de onAwake inchangé)
        // Update the active prefab at startup (stopped state)
        this.updateActivePrefab();
        print("MusicPlayerManager initialized with " + this.tracks.length + " tracks, awaiting user input.");
    }
    updateActivePrefab() {
        // Désactiver l'ancien prefab (UI elements)
        if (this.currentActivePrefab) {
            this.currentActivePrefab.enabled = false;
            this.currentActivePrefab = null;
        }
        // Désactiver l'ancien worldmesh
        if (this.currentActiveWorldMesh) {
            this.currentActiveWorldMesh.enabled = false;
            this.currentActiveWorldMesh = null;
        }
        if (this.currentTrackIndex === -1) {
            if (this.stoppedPrefab) {
                this.stoppedPrefab.enabled = true;
                this.currentActivePrefab = this.stoppedPrefab;
                print("Stopped prefab activated.");
            }
        }
        else {
            if (this.trackPrefabs[this.currentTrackIndex]) {
                this.trackPrefabs[this.currentTrackIndex].enabled = true;
                this.currentActivePrefab = this.trackPrefabs[this.currentTrackIndex];
                print("Prefab for track " + this.titles[this.currentTrackIndex] + " activated.");
            }
        }
    }
    // Public method to get the world mesh for a given track index
    getWorldMesh(index) {
        if (index >= 0 && index < this.worldMeshes.length) {
            return this.worldMeshes[index];
        }
        return null;
    }
    // ... (reste du script inchangé)
    onDestroy() {
        // ... (code existant inchangé)
        // Désactiver les world meshes
        this.worldMeshes.forEach(mesh => {
            if (mesh)
                mesh.enabled = false;
        });
        // ... (reste de onDestroy inchangé)
    }
    __initialize() {
        super.__initialize();
        this.currentTrackIndex = -1;
        this.currentActivePrefab = null;
        this.currentActiveWorldMesh = null;
    }
};
exports.MusicPlayerManager = MusicPlayerManager;
exports.MusicPlayerManager = MusicPlayerManager = __decorate([
    component
], MusicPlayerManager);
//# sourceMappingURL=WorldEffectsManager.js.map