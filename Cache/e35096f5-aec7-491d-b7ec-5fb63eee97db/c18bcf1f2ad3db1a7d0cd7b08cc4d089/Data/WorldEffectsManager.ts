@component
export class MusicPlayerManager extends BaseScriptComponent {
    // Audio tracks
    @input
    @hint('Liste des morceaux de musique')
    tracks: AudioTrackAsset[];

    // Artists
    @input
    @hint('Liste des noms d\'artistes correspondants aux morceaux')
    artists: string[];

    // Titles
    @input
    @hint('Liste des titres des morceaux')
    titles: string[];

    // Prefabs for each track (used for UI elements like album cover, text, etc.)
    @input
    @hint('Liste des prefabs à afficher pour chaque morceau (doit correspondre au nombre de morceaux)')
    trackPrefabs: SceneObject[];

    // World meshes for each track (used for 3D world effects)
    @input
    @hint('Liste des world meshes à afficher pour chaque morceau (doit correspondre au nombre de morceaux)')
    worldMeshes: SceneObject[];

    // Prefab for stopped state
    @input('SceneObject')
    @hint('Prefab à afficher lorsque la lecture est arrêtée')
    stoppedPrefab: SceneObject;

    // ... (autres champs inchangés)

    // Private variables
    private currentTrackIndex: number = -1;
    private currentActivePrefab: SceneObject | null = null;
    private currentActiveWorldMesh: SceneObject | null = null; // Ajout pour suivre le worldmesh actif

    onAwake(): void {
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
            if (prefab) prefab.enabled = false;
        });
        this.worldMeshes.forEach(mesh => {
            if (mesh) mesh.enabled = false;
        });
        if (this.stoppedPrefab) {
            this.stoppedPrefab.enabled = false;
        }

        // ... (reste de onAwake inchangé)

        // Update the active prefab at startup (stopped state)
        this.updateActivePrefab();

        print("MusicPlayerManager initialized with " + this.tracks.length + " tracks, awaiting user input.");
    }

    private updateActivePrefab(): void {
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
        } else {
            if (this.trackPrefabs[this.currentTrackIndex]) {
                this.trackPrefabs[this.currentTrackIndex].enabled = true;
                this.currentActivePrefab = this.trackPrefabs[this.currentTrackIndex];
                print("Prefab for track " + this.titles[this.currentTrackIndex] + " activated.");
            }
        }
    }

    // Public method to get the world mesh for a given track index
    public getWorldMesh(index: number): SceneObject | null {
        if (index >= 0 && index < this.worldMeshes.length) {
            return this.worldMeshes[index];
        }
        return null;
    }

    // ... (reste du script inchangé)

    onDestroy(): void {
        // ... (code existant inchangé)

        // Désactiver les world meshes
        this.worldMeshes.forEach(mesh => {
            if (mesh) mesh.enabled = false;
        });

        // ... (reste de onDestroy inchangé)
    }
}