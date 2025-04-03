import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { InteractorEvent } from 'SpectaclesInteractionKit/Core/Interactor/InteractorEvent';

// --- Added for Remote Assets ---
// Although RemoteReferenceAsset isn't explicitly imported,
// we'll check its type using isOfType or getTypeName.
// We will use the generic 'Asset' type for the input array.
// --- End Added ---

@component
export class MusicPlayerManager extends BaseScriptComponent {
    // --- MODIFIED: Changed type from AudioTrackAsset[] to Asset[] ---
    // Audio tracks (can be standard AudioTrackAsset or RemoteReferenceAsset pointing to an AudioTrackAsset)
    @input('Asset[]')
    @hint('Liste des morceaux (AudioTrackAsset ou RemoteReferenceAsset)')
    trackAssets: Asset[]; // Renamed from 'tracks' for clarity
    // --- END MODIFIED ---

    // Artists
    @input('string[]')
    @hint('Liste des noms d\'artistes correspondants aux morceaux')
    artists: string[];

    // Titles
    @input('string[]')
    @hint('Liste des titres des morceaux')
    titles: string[];

    // Prefabs for each track (used as worldmeshes or visual representations)
    @input('SceneObject[]')
    @hint('Liste des prefabs à afficher pour chaque morceau (doit correspondre au nombre de morceaux)')
    trackPrefabs: SceneObject[];

    // Prefab for stopped state
    @input('SceneObject')
    @hint('Prefab à afficher lorsque la lecture est arrêtée')
    stoppedPrefab: SceneObject;

    // UI Components
    @input('Component.Text')
    @hint('Texte pour afficher le nom de l\'artiste')
    artistNameText: Text;

    @input('Component.Text')
    @hint('Texte pour afficher le timecode actuel')
    timecodeText: Text;

    @input('Component.Text')
    @hint('Texte pour afficher le titre du morceau')
    trackTitleText: Text;

    // Control buttons
    @input('Component.ScriptComponent')
    @hint('Bouton pour lire/mettre en pause la musique')
    playPauseButton: PinchButton;

    @input('Component.ScriptComponent')
    @hint('Bouton pour passer au morceau suivant')
    nextTrackButton: PinchButton;

    @input('Component.ScriptComponent')
    @hint('Bouton pour revenir au morceau précédent')
    prevTrackButton: PinchButton;

    @input('Component.ScriptComponent')
    @hint('Bouton pour activer/désactiver la répétition')
    repeatButton: PinchButton;

    @input('dehydratedComponent.ScriptComponent')
    @hint('Bouton pour activer/désactiver le mode shuffle')
    shuffleButton: PinchButton;

    @input('Component.ScriptComponent')
    @hint('Bouton pour arrêter la lecture')
    stopButton: PinchButton;

    // Progress visualization
    @input('SceneObject')
    @hint('Barre de progression')
    progressBar: SceneObject;

    @input('SceneObject')
    @hint('Sphère terrestre qui se déplace le long de la barre de progression')
    earthSphere: SceneObject;

    // Audio Component
    @input('Component.AudioComponent')
    @hint('Composant audio pour la lecture de musique')
    audioComponent: AudioComponent;

    // Option for looping playback
    @input('bool')
    @hint('Activer la lecture en boucle')
    loopPlayback: boolean = true;

    // Offset for the sphere position
    @input('number')
    @hint('Décalage de la sphère terrestre sur l\'axe X')
    earthSphereXOffset: number = 0;

    // Rotation speed of the sphere
    @input('number')
    @hint('Vitesse de rotation de la sphère (degrés par seconde)')
    rotationSpeed: number = 30.0;

    // Private variables
    private currentTrackIndex: number = -1; // -1 means no track loaded
    private isPlaying: boolean = false;
    private isPaused: boolean = false;
    private isRepeatEnabled: boolean = false;
    private isShuffleEnabled: boolean = false;
    private shouldAutoPlay: boolean = false;
    private isManualStop: boolean = false;
    private trackStartTime: number = 0;
    private currentPlaybackTime: number = 0;
    private audioInitialized: boolean = false;
    private isLoadingRemote: boolean = false; // --- Added for Remote Assets ---
    private currentActivePrefab: SceneObject | null = null;
    private lastPinchTime: number = 0; // Pour le debounce

    // Callbacks
    private onPlayPauseCallback: (event: InteractorEvent) => void;
    private onNextTrackCallback: (event: InteractorEvent) => void;
    private onPrevTrackCallback: (event: InteractorEvent) => void;
    private onRepeatCallback: (event: InteractorEvent) => void;
    private onShuffleCallback: (event: InteractorEvent) => void;
    private onStopCallback: (event: InteractorEvent) => void;
    private onTrackFinishedCallback: (audioComponent: AudioComponent) => void;

    onAwake(): void {
        this.api.stopTrack = this.stopTrack.bind(this);

        // --- MODIFIED: Validation for trackAssets ---
        if (!this.trackAssets || this.trackAssets.length === 0) {
            print("Error: No track assets provided to MusicPlayerManager.");
            return;
        }
        if (this.trackAssets.some(asset => asset == null)) {
            print("Error: All track assets must be defined.");
            return;
        }
        // Optional: More robust check for valid asset types
        /*
        if (this.trackAssets.some(asset =>
            !asset.isOfType("Asset.AudioTrackAsset") && !asset.isOfType("Asset.RemoteReferenceAsset"))
        ) {
            print("Error: All track assets must be either AudioTrackAsset or RemoteReferenceAsset.");
            return;
        }
        */

        if (!this.artists || !this.titles || this.trackAssets.length !== this.artists.length || this.trackAssets.length !== this.titles.length) {
            print("Error: The number of track assets, artists, and titles must match.");
            return;
        }
        // --- END MODIFIED ---

        if (!this.trackPrefabs || this.trackPrefabs.some(prefab => prefab == null)) {
            print("Error: All track prefabs must be defined.");
            return;
        }

        if (this.trackPrefabs.length !== this.trackAssets.length) {
            print("Error: The number of track prefabs must match the number of tracks.");
            return;
        }

        this.trackPrefabs.forEach(prefab => {
            if (prefab) prefab.enabled = false;
        });
        if (this.stoppedPrefab) {
            this.stoppedPrefab.enabled = false;
        }

        if (!this.audioComponent) {
            print("Error: Audio component not defined in MusicPlayerManager.");
            return;
        }

        if (!this.earthSphere || !this.progressBar) {
            print("Warning: Progress visualization objects are not defined in MusicPlayerManager.");
            // return; // Consider if visualization is mandatory
        }

        this.setupCallbacks();
        this.setupProgressBar();

        this.createEvent("UpdateEvent").bind(() => {
            this.updatePlayer();
            this.updateSphereRotation();
        });

        this.updateActivePrefab();

        print("MusicPlayerManager initialized with " + this.trackAssets.length + " tracks, awaiting user input.");
    }

    private setupCallbacks(): void {
        if (this.playPauseButton) {
            this.onPlayPauseCallback = (event: InteractorEvent) => this.togglePlayPause();
            this.playPauseButton.onButtonPinched.add(this.onPlayPauseCallback);
            print("Play/Pause button callback set");
        }
        // ... (rest of the button callbacks remain the same) ...
        if (this.nextTrackButton) {
            this.onNextTrackCallback = (event: InteractorEvent) => this.nextTrack();
            this.nextTrackButton.onButtonPinched.add(this.onNextTrackCallback);
            print("Next button callback set");
        }

        if (this.prevTrackButton) {
            this.onPrevTrackCallback = (event: InteractorEvent) => this.prevTrack();
            this.prevTrackButton.onButtonPinched.add(this.onPrevTrackCallback);
            print("Previous button callback set");
        }

        if (this.repeatButton) {
            this.onRepeatCallback = (event: InteractorEvent) => {
                this.isRepeatEnabled = !this.isRepeatEnabled;
                print("Repeat " + (this.isRepeatEnabled ? "enabled" : "disabled"));
            };
            this.repeatButton.onButtonPinched.add(this.onRepeatCallback);
        }

        if (this.shuffleButton) {
            this.onShuffleCallback = (event: InteractorEvent) => {
                this.isShuffleEnabled = !this.isShuffleEnabled;
                print("Shuffle mode " + (this.isShuffleEnabled ? "enabled" : "disabled"));
            };
            this.shuffleButton.onButtonPinched.add(this.onShuffleCallback);
        }

        if (this.stopButton) {
            this.onStopCallback = (event: InteractorEvent) => this.stopTrack();
            this.stopButton.onButtonPinched.add(this.onStopCallback);
            print("Stop button callback set");
        }

        this.setupTrackFinishedCallback();
    }

    private setupTrackFinishedCallback(): void {
        this.onTrackFinishedCallback = (audioComponent: AudioComponent) => {
            print("Track finished, handling next action");
            this.handleTrackFinished();
        };

        if (this.audioComponent) {
            // Detach previous callback if any, before attaching a new one
            this.audioComponent.setOnFinish(null);
            this.audioComponent.setOnFinish(this.onTrackFinishedCallback);
        }
    }

    private handleTrackFinished(): void {
        print("Track finished event triggered");
        if (this.isPaused || this.isLoadingRemote) { // --- MODIFIED: Check loading state ---
            print("Track finished ignored due to paused or loading state");
            return;
        }
        if (this.isManualStop) {
            print("Manual stop detected, skipping handleTrackFinished.");
            this.isManualStop = false; // Reset flag after handling
            return;
        }

        if (this.currentTrackIndex === -1) {
            print("Track finished ignored, no track index.");
            return;
        }

        if (this.isRepeatEnabled) {
            this.loadTrack(this.currentTrackIndex); // Will play automatically if needed
        } else if (this.isShuffleEnabled) {
            const nextIndex = this.getRandomTrackIndex();
            this.shouldAutoPlay = true; // Ensure it plays after loading
            this.loadTrack(nextIndex);
        } else if (this.currentTrackIndex < this.trackAssets.length - 1 || this.loopPlayback) {
            this.shouldAutoPlay = true; // Ensure it plays after loading
            this.nextTrack(); // Let nextTrack handle index wrapping or stopping
        } else {
            // Reached the end, not looping, not repeating, not shuffling
            print("Reached end of playlist.");
            this.stopTrack();
        }
    }

    // --- Helper for Shuffle ---
    private getRandomTrackIndex(): number {
        if (this.trackAssets.length <= 1) {
            return 0;
        }
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * this.trackAssets.length);
        } while (randomIndex === this.currentTrackIndex); // Avoid playing the same track twice in a row
        return randomIndex;
    }
    // --- End Helper ---

    private setupProgressBar(): void {
        if (this.progressBar && this.earthSphere) {
            const barTransform = this.progressBar.getTransform();
            const barPosition = barTransform.getLocalPosition();
            const earthTransform = this.earthSphere.getTransform();

            // Set initial position (start of the bar)
            earthTransform.setLocalPosition(new vec3(barPosition.x, barPosition.y, barPosition.z));
            this.updateEarthPosition(0, 1); // Initialize position at 0 progress
        }
    }

    private updateSphereRotation(): void {
        if (this.earthSphere && this.progressBar && this.progressBar.enabled && this.earthSphere.enabled) {
            const deltaTime = getDeltaTime();
            const earthTransform = this.earthSphere.getTransform();
            const currentRotation = earthTransform.getLocalRotation();

            // Simple rotation around Y axis
            const rotationDelta = quat.fromEulerAngles(0, this.rotationSpeed * deltaTime * (Math.PI / 180), 0);
            const newRotation = currentRotation.multiply(rotationDelta);

            earthTransform.setLocalRotation(newRotation);
        }
    }


    private updateActivePrefab(): void {
        // Disable previously active prefab
        if (this.currentActivePrefab) {
            this.currentActivePrefab.enabled = false;
            this.currentActivePrefab = null;
        }

        if (this.currentTrackIndex === -1 || this.isLoadingRemote) { // --- MODIFIED: Check loading state ---
            // Show stopped prefab if stopped or loading
            if (this.stoppedPrefab) {
                this.stoppedPrefab.enabled = true;
                this.currentActivePrefab = this.stoppedPrefab;
                if(this.isLoadingRemote) print("Loading prefab activated.");
                else print("Stopped prefab activated.");
            }
        } else if (this.currentTrackIndex >= 0 && this.currentTrackIndex < this.trackPrefabs.length) {
            // Show the prefab corresponding to the current track
            const trackPrefab = this.trackPrefabs[this.currentTrackIndex];
            if (trackPrefab) {
                trackPrefab.enabled = true;
                this.currentActivePrefab = trackPrefab;
                print("Prefab for track " + this.titles[this.currentTrackIndex] + " activated.");
            } else {
                 print("Warning: No prefab found for track index " + this.currentTrackIndex);
            }
        }
    }


    // --- MODIFIED: Core function to handle both asset types ---
    private loadTrack(index: number): void {
        if (index < 0 || index >= this.trackAssets.length) {
            print("Error: Invalid track index: " + index);
            this.stopTrack(); // Stop if index is out of bounds
            return;
        }

        const assetToLoad = this.trackAssets[index];
        if (!assetToLoad) {
            print("Error: Asset at index " + index + " is null.");
            this.stopTrack();
            return;
        }

        print(`Attempting to load track index: ${index}, Asset Name: ${assetToLoad.name}`);

        // Reset state before loading new track
        const wasPlaying = this.isPlaying || this.shouldAutoPlay;
        this.shouldAutoPlay = false; // Reset auto-play flag until load succeeds
        this.audioInitialized = false;
        this.isLoadingRemote = false; // Reset loading flag

        // Stop current playback if any
        if (this.isPlaying || this.isPaused) {
            this.isManualStop = true; // Prevent handleTrackFinished from triggering immediately
            this.audioComponent.stop(true); // Fade out current track if playing
            this.isPlaying = false;
            this.isPaused = false;
        }

        // --- Important: Clear the component's track immediately ---
        // This prevents the old track's 'setOnFinish' from firing unexpectedly
        // and ensures duration reads 0 until the new track is ready.
        this.audioComponent.audioTrack = null;
        this.currentTrackIndex = index; // Update index *before* async operations
        this.updateTrackInfo();      // Update UI text immediately
        this.updateActivePrefab();   // Show loading/stopped prefab


        // --- Check Asset Type ---
        if (assetToLoad.isOfType("Asset.AudioTrackAsset")) {
            // --- Handle Standard AudioTrackAsset ---
            print(`Asset is an AudioTrackAsset. Loading directly: ${assetToLoad.name}`);
            const directAsset = assetToLoad as AudioTrackAsset;

            // Use a small delay to ensure the engine processes the stop() and clear before assigning
             this.delayedCall(0.05, () => {
                this.assignAndPrepareAudio(directAsset, wasPlaying);
             });

        } else if (assetToLoad.isOfType("Asset.RemoteReferenceAsset")) {
            // --- Handle RemoteReferenceAsset ---
            print(`Asset is a RemoteReferenceAsset. Starting download: ${assetToLoad.name}`);
            this.isLoadingRemote = true;
            this.updateActivePrefab(); // Show loading state visually

            const remoteAssetRef = assetToLoad as RemoteReferenceAsset;

            remoteAssetRef.downloadAsset(
                // onDownloaded Callback
                (downloadedAsset: Asset) => {
                    this.isLoadingRemote = false;
                    if (!downloadedAsset || !downloadedAsset.isOfType("Asset.AudioTrackAsset")) {
                        print(`Error: Downloaded asset is not a valid AudioTrackAsset for ${remoteAssetRef.name}`);
                        // Maybe try next track or stop?
                        this.delayedCall(0.1, () => this.handleLoadError(index, wasPlaying));
                        return;
                    }

                    // Check if the user hasn't already requested a *different* track while this one was downloading
                    if (this.currentTrackIndex !== index) {
                         print(`Downloaded ${remoteAssetRef.name}, but user moved to track ${this.currentTrackIndex}. Discarding.`);
                         return;
                    }

                    print(`Successfully downloaded: ${downloadedAsset.name}`);
                    const actualAudioTrack = downloadedAsset as AudioTrackAsset;
                    this.assignAndPrepareAudio(actualAudioTrack, wasPlaying);
                },
                // onFailed Callback
                () => {
                    this.isLoadingRemote = false;
                     // Check if the user hasn't already requested a *different* track while this one was failing
                    if (this.currentTrackIndex !== index) {
                         print(`Download failed for ${remoteAssetRef.name}, but user moved to track ${this.currentTrackIndex}. Ignoring error.`);
                         return;
                    }
                    print(`Error: Failed to download remote asset: ${remoteAssetRef.name}`);
                    this.delayedCall(0.1, () => this.handleLoadError(index, wasPlaying));
                }
            );
        } else {
            print(`Error: Asset at index ${index} has unsupported type: ${assetToLoad.getTypeName()}`);
            this.stopTrack();
        }
    }

    // --- Helper to handle actions after load failure ---
    private handleLoadError(failedIndex: number, wasPlayingBeforeLoad: boolean): void {
         print(`Handling load error for index ${failedIndex}`);
         // Option 1: Stop playback
         // this.stopTrack();

         // Option 2: Try to automatically play the next track if the user intended to continue playing
         if (wasPlayingBeforeLoad) {
             print("Load failed, attempting to play next track automatically.");
             this.shouldAutoPlay = true; // Set flag for the *next* successful load
             this.nextTrack(); // Trigger loading of the next track
         } else {
             // If it wasn't playing, just go back to stopped state
             this.stopTrack();
         }
    }


    // --- Helper function to assign the audio track and prepare playback ---
    private assignAndPrepareAudio(audioTrack: AudioTrackAsset, shouldPlayWhenReady: boolean): void {
        if (!audioTrack) {
            print("Error: Cannot assign null audio track.");
            return;
        }
         // Double check we are still meant to load this track index
        if(this.audioComponent.audioTrack && this.audioComponent.audioTrack.isSame(audioTrack)){
             print(`Track ${audioTrack.name} is already assigned. Re-preparing.`);
             // If same track (e.g., repeat), stop and reset time
             this.isManualStop = true;
             this.audioComponent.stop(false); // No fade needed for immediate replay
        }

        print(`Assigning audio track: ${audioTrack.name}`);
        this.audioComponent.audioTrack = audioTrack;
        this.setupTrackFinishedCallback(); // Re-attach finish callback for the new track
        this.trackStartTime = getTime();   // Reset start time reference
        this.currentPlaybackTime = 0;    // Reset playback time
        this.isPaused = false;
        this.isManualStop = false;         // Clear manual stop flag

        // Update UI elements AFTER assigning the track (duration might be needed)
        this.updateTrackInfo();
        this.updateActivePrefab(); // Update prefab based on loaded track index

        // Allow a brief moment for the engine to process the assignment before checking duration/playing
        this.delayedCall(0.15, () => {
             if (this.currentTrackIndex === -1 || !this.audioComponent.audioTrack || !this.audioComponent.audioTrack.isSame(audioTrack)) {
                 print("Audio assignment changed or stopped before initialization could complete.");
                 return; // State changed again before this callback ran
             }

            // Check if duration is valid (sometimes takes a frame or two)
             const duration = this.audioComponent.duration;
             if (duration === undefined || duration === null || duration <= 0) {
                 print(`Warning: Audio track ${audioTrack.name} has invalid duration (${duration}). Retrying initialization check shortly.`);
                 this.delayedCall(0.2, () => { // Retry once more
                      if (this.currentTrackIndex !== -1 && this.audioComponent.audioTrack && this.audioComponent.audioTrack.isSame(audioTrack)) {
                           const retryDuration = this.audioComponent.duration;
                           if(retryDuration > 0) {
                                print(`Duration ok on retry: ${retryDuration}`);
                                this.audioInitialized = true;
                                if (shouldPlayWhenReady) {
                                    this.playTrack();
                                }
                           } else {
                                print(`Error: Still invalid duration (${retryDuration}) for ${audioTrack.name}. Cannot play.`);
                                this.handleLoadError(this.currentTrackIndex, shouldPlayWhenReady);
                           }
                      }
                 });
             } else {
                 print(`Audio track ${audioTrack.name} initialized successfully. Duration: ${duration}`);
                 this.audioInitialized = true;
                 if (shouldPlayWhenReady) {
                     this.playTrack(); // Play if it was playing before or auto-play requested
                 }
             }
        });
    }
    // --- END MODIFIED HELPER ---

    private delayedCall(delay: number, callback: () => void): void {
        const delayEvent = this.createEvent("UpdateEvent");
        let startTime = getTime();

        delayEvent.bind(() => {
            if (getTime() - startTime >= delay) {
                callback();
                // Make sure the event stops itself
                if(delayEvent){
                    delayEvent.enabled = false;
                    // Consider destroying the event if many are created
                }
            }
        });
    }


    private updateTrackInfo(): void {
        // Guard against invalid index during loading/stopping
        if (this.currentTrackIndex === -1 || this.currentTrackIndex >= this.titles.length) {
            if (this.artistNameText) this.artistNameText.text = "---";
            if (this.trackTitleText) this.trackTitleText.text = this.isLoadingRemote ? "Loading..." : "Stopped";
            // Don't call updateActivePrefab here, it's handled by loadTrack/stopTrack
        } else {
            if (this.artistNameText) this.artistNameText.text = this.artists[this.currentTrackIndex];
            if (this.trackTitleText) this.trackTitleText.text = this.titles[this.currentTrackIndex];
            // Don't call updateActivePrefab here
        }
        // Always update timecode, even if stopped (shows 00:00 / 00:00)
        this.updatePlayer();
    }

    private togglePlayPause(): void {
        const currentTime = getTime();
        if (currentTime - this.lastPinchTime < 0.5) { // Debounce 500ms
            print("Pinch ignored due to debounce");
            return;
        }
        this.lastPinchTime = currentTime;

        if (this.isLoadingRemote) { // --- MODIFIED: Prevent action while loading ---
            print("Cannot toggle play/pause while loading remote track.");
            return;
        }

        print(`Toggle Play/Pause called - isPlaying: ${this.isPlaying}, isPaused: ${this.isPaused}, currentTrackIndex: ${this.currentTrackIndex}, audioInitialized: ${this.audioInitialized}`);

        if (this.isPlaying) {
            this.pauseTrack();
        } else { // Not currently playing (could be paused or stopped)
            if (this.isPaused && this.currentTrackIndex !== -1 && this.audioInitialized) {
                this.playTrack(); // Resume from pause
            } else {
                // Either stopped or not initialized, try to start playback
                if (this.currentTrackIndex === -1) {
                    // No track selected, start from the beginning
                    print("No track loaded, starting first track");
                    this.loadTrack(0); // This will auto-play if successful due to 'wasPlaying' logic inside
                } else if (this.audioInitialized) {
                    // Track is loaded but currently stopped, play it
                    this.playTrack();
                } else {
                     // Track selected but not ready (e.g., load failed previously, or initial state)
                     print("Track not initialized. Attempting to reload track index: " + this.currentTrackIndex);
                     // Set the flag so it plays once loaded successfully
                     this.shouldAutoPlay = true; // Indicate intent to play
                     this.loadTrack(this.currentTrackIndex); // Try loading it again
                }
            }
        }
    }


    private playTrack(): void {
         // --- MODIFIED: Add checks for loading and initialization ---
        if (this.isLoadingRemote) {
            print("Play called, but track is loading. Playback deferred.");
            this.shouldAutoPlay = true; // Ensure it plays when loading finishes
            return;
        }
        if (!this.audioInitialized) {
             print("Play called, but audio not initialized. Attempting load/reload.");
             this.shouldAutoPlay = true; // Ensure it plays when loading finishes
             if(this.currentTrackIndex === -1) this.loadTrack(0);
             else this.loadTrack(this.currentTrackIndex);
             return;
        }
         // --- End Modified ---

        // Original conditions remain important
        if (!this.isPlaying && this.audioComponent && this.audioComponent.audioTrack) {
            try {
                if (this.isPaused) {
                    print("Resuming track from pause: " + this.titles[this.currentTrackIndex]);
                    if(this.audioComponent.resume()) { // resume() returns true on success
                        this.isPlaying = true;
                        this.isPaused = false;
                        // Recalculate start time based on paused time
                        this.trackStartTime = getTime() - this.currentPlaybackTime;
                        print("Resumed successfully at " + this.formatTime(this.currentPlaybackTime));
                    } else {
                         print("AudioComponent resume failed. Track might be stopped.");
                         // Attempt to play from start as fallback
                         this.currentPlaybackTime = 0;
                         this.trackStartTime = getTime();
                         this.audioComponent.play(1);
                         this.isPlaying = true;
                         this.isPaused = false;
                    }
                } else {
                    // Playing from start (or after stop)
                    print("Starting track: " + this.titles[this.currentTrackIndex]);
                    this.currentPlaybackTime = 0; // Ensure time starts from 0
                    this.trackStartTime = getTime();
                    this.audioComponent.play(1); // Play once
                    this.isPlaying = true;
                    this.isPaused = false; // Ensure paused is false
                }
            } catch (e) {
                print("Error playing track: " + e);
                // Reset state on error
                this.isPlaying = false;
                this.isPaused = false;
                this.audioInitialized = false; // Assume something went wrong
            }
        } else {
            print("Cannot play track - Conditions not met: " +
                `isPlaying: ${this.isPlaying}, audioComponent: ${!!this.audioComponent}, ` +
                `audioTrack: ${!!this.audioComponent?.audioTrack}, audioInitialized: ${this.audioInitialized}`);
             if(!this.isPlaying && !this.isPaused) {
                 // If completely stopped, maybe try loading again?
                 // Be careful not to create infinite loops
                 // this.shouldAutoPlay = true;
                 // this.loadTrack(this.currentTrackIndex);
             }
        }
    }


    private pauseTrack(): void {
        if (this.isPlaying && this.audioComponent && this.audioInitialized) {
            try {
                print("Attempting to pause track: " + this.titles[this.currentTrackIndex]);
                this.audioComponent.pause();
                 // Check state *after* calling pause, as it might fail silently
                 // Lens Studio's `pause()` doesn't return a value, rely on `isPaused()` if needed,
                 // but for simplicity, we'll assume it worked unless an error occurs.
                this.currentPlaybackTime = getTime() - this.trackStartTime; // Capture time *before* changing flags
                this.isPlaying = false;
                this.isPaused = true;
                print("Track paused successfully at " + this.formatTime(this.currentPlaybackTime));
            } catch (e) {
                print("Error pausing track: " + e);
                // Force state even on error? Or assume it failed? Let's assume failed.
                // If pause throws, maybe it means it wasn't playing?
                // Re-evaluating state might be safer if isPlaying()/isPaused() methods exist and are reliable.
                // For now, we'll leave the state as playing if error occurs.
                 // this.isPlaying = false;
                 // this.isPaused = true;
                 // this.currentPlaybackTime = getTime() - this.trackStartTime;
            }
        } else {
            print(`Pause called but conditions not met: isPlaying=${this.isPlaying}, audioInitialized=${this.audioInitialized}`);
        }
    }


    public stopTrack(): void {
        print("Stop track requested.");
        if (this.audioComponent) {
            if (this.isPlaying || this.isPaused) {
                 // Set flag *before* calling stop, as stop might trigger setOnFinish callback sync/async
                this.isManualStop = true;
                this.audioComponent.stop(true); // Use fade out
            }
             // Reset all playback state variables
            this.isPlaying = false;
            this.isPaused = false;
            this.shouldAutoPlay = false;
            this.isLoadingRemote = false; // Ensure loading stops if active
            this.audioInitialized = false;
            this.currentPlaybackTime = 0;

            // --- Critical: Clear the audio track ---
            // This prevents any lingering state or callbacks associated with the old track.
            this.audioComponent.audioTrack = null;

             // Reset index *after* clearing the track
            this.currentTrackIndex = -1;

            // Update UI to reflect stopped state
            this.updateTrackInfo();
            this.updateActivePrefab(); // Show stopped prefab
            this.updateEarthPosition(0, 1); // Reset progress bar
            print("Playback fully stopped and state reset.");
        } else {
            print("Stop track requested, but no audio component found.");
            // Still reset internal state variables even if component is missing
            this.isPlaying = false;
            this.isPaused = false;
            this.shouldAutoPlay = false;
            this.isLoadingRemote = false;
            this.audioInitialized = false;
            this.currentPlaybackTime = 0;
            this.currentTrackIndex = -1;
            this.updateTrackInfo();
            this.updateActivePrefab();
            this.updateEarthPosition(0, 1);
        }
    }

    private nextTrack(): void {
        print("Next track triggered");
         if (this.isLoadingRemote) { // --- MODIFIED: Prevent action while loading ---
            print("Cannot change track while loading remote asset.");
            return;
        }
        const initialIndex = this.currentTrackIndex;
        let nextIndex: number;

        if (initialIndex === -1) {
            // If nothing is playing, start from the first track
            nextIndex = 0;
        } else if (this.isRepeatEnabled) {
             // If repeat is on, just reload the current track
            nextIndex = initialIndex;
        } else if (this.isShuffleEnabled) {
            nextIndex = this.getRandomTrackIndex();
        } else {
            // Normal sequential playback
            nextIndex = initialIndex + 1;
            if (nextIndex >= this.trackAssets.length) {
                // Reached the end
                if (this.loopPlayback) {
                    print("Reached end, looping back to start.");
                    nextIndex = 0; // Loop back to the first track
                } else {
                    print("Reached end, looping disabled. Stopping playback.");
                    this.stopTrack();
                    return; // Exit function, playback stopped
                }
            }
        }

        // Determine if playback should continue/start automatically
        const shouldPlay = this.isPlaying || this.shouldAutoPlay || initialIndex === -1; // Auto play if currently playing OR if starting from stopped state
        if (shouldPlay) {
             this.shouldAutoPlay = true; // Set flag for the loadTrack function
        }

        print(`Moving to track index: ${nextIndex} (from ${initialIndex}). AutoPlay intent: ${this.shouldAutoPlay}`);
        this.loadTrack(nextIndex);
    }

    private prevTrack(): void {
        print("Previous track triggered");
         if (this.isLoadingRemote) { // --- MODIFIED: Prevent action while loading ---
            print("Cannot change track while loading remote asset.");
            return;
        }
        const initialIndex = this.currentTrackIndex;
        let prevIndex: number;

        if (initialIndex === -1) {
            // If nothing is playing, start from the last track
             prevIndex = this.trackAssets.length - 1;
        } else if (this.isRepeatEnabled) {
             // If repeat is on, just reload the current track
            prevIndex = initialIndex;
        } else if (this.isShuffleEnabled) {
            prevIndex = this.getRandomTrackIndex();
        } else {
            // Normal sequential playback
            prevIndex = initialIndex - 1;
            if (prevIndex < 0) {
                // Reached the beginning
                 if(this.loopPlayback) {
                     print("Reached beginning, looping back to end.");
                     prevIndex = this.trackAssets.length - 1; // Loop back to the last track
                 } else {
                     // Option 1: Stop at the beginning if not looping
                     // print("Reached beginning, looping disabled. Stopping playback.");
                     // this.stopTrack();
                     // return;

                     // Option 2: Stay on the first track (or reload it)
                     print("Reached beginning, looping disabled. Staying on first track.");
                     prevIndex = 0;
                 }

            }
        }

        // Determine if playback should continue/start automatically
        const shouldPlay = this.isPlaying || this.shouldAutoPlay || initialIndex === -1;
        if (shouldPlay) {
             this.shouldAutoPlay = true; // Set flag for the loadTrack function
        }

        print(`Moving to track index: ${prevIndex} (from ${initialIndex}). AutoPlay intent: ${this.shouldAutoPlay}`);
        this.loadTrack(prevIndex);
    }


    private updatePlayer(): void {
        // Update timecode and progress bar based on current state

        let currentTime = 0;
        let totalTime = 0;

        // Only attempt to get time if the component and track exist and are initialized
        // And we are not in a loading state where duration might be invalid
        if (this.audioInitialized && !this.isLoadingRemote && this.audioComponent && this.audioComponent.audioTrack) {
            try {
                totalTime = this.audioComponent.duration || 0;
                 // Sometimes duration might be 0 briefly after loading, treat as invalid
                if (isNaN(totalTime) || totalTime <= 0) {
                     totalTime = 0; // Fallback
                     // Don't throw error here, just means we can't display total time yet
                }

                if (this.isPlaying) {
                    // Calculate current time based on when playback started
                    currentTime = getTime() - this.trackStartTime;
                    // Clamp currentTime to duration if needed (though setOnFinish should handle the end)
                    if (totalTime > 0 && currentTime > totalTime) {
                        currentTime = totalTime;
                    }
                     // Keep track of the calculated time even if paused later
                    this.currentPlaybackTime = currentTime;

                } else {
                    // If paused or stopped (but initialized), use the last known playback time
                    currentTime = this.currentPlaybackTime;
                }

            } catch (e) {
                print("Error accessing audio properties during update: " + e);
                // Reset times on error to avoid displaying stale data
                currentTime = 0;
                totalTime = 0;
                // Consider setting audioInitialized = false here if errors persist
            }
        } else {
             // If not initialized or loading, use the stored playback time (usually 0 unless paused)
             currentTime = this.currentPlaybackTime;
             // Total time is unknown
             totalTime = 0;
        }

         // Ensure time is never negative
        currentTime = Math.max(0, currentTime);

        // Update UI Text
        if (this.timecodeText) {
            const totalTimeStr = (totalTime > 0) ? this.formatTime(totalTime) : "??:??";
            this.timecodeText.text = this.formatTime(currentTime) + " / " + totalTimeStr;
        }

        // Update Progress Bar visualization
        this.updateEarthPosition(currentTime, totalTime);
    }


    private updateEarthPosition(currentTime: number, totalTime: number): void {
        // Check if visualization objects are available and enabled
        if (this.earthSphere && this.progressBar && this.earthSphere.enabled && this.progressBar.enabled) {
            // Only update if totalTime is valid (greater than 0)
            if (totalTime > 0) {
                 try {
                    let progress = currentTime / totalTime;
                    // Clamp progress between 0 and 1
                    progress = Math.max(0, Math.min(1, progress));

                    const barTransform = this.progressBar.getTransform();
                    const barScale = barTransform.getLocalScale();
                    const barPosition = barTransform.getLocalPosition();
                    const earthTransform = this.earthSphere.getTransform();

                    // Calculate position along the bar's X-axis based on its scale
                    // Assumes the bar's pivot is at its center
                    const halfLength = barScale.x / 2.0;
                    // Start from the left edge (-halfLength) and move right by progress * fullLength (barScale.x)
                    const localX = -halfLength + (progress * barScale.x) + this.earthSphereXOffset;

                    // Set the sphere's local position relative to the bar's position
                    earthTransform.setLocalPosition(new vec3(
                        barPosition.x + localX,
                        barPosition.y, // Keep original Y
                        barPosition.z  // Keep original Z
                    ));
                } catch (e) {
                    print("Error updating sphere position: " + e);
                }
            } else {
                 // If totalTime is invalid (0 or less), reset sphere to start position
                  try {
                    const barTransform = this.progressBar.getTransform();
                    const barScale = barTransform.getLocalScale();
                    const barPosition = barTransform.getLocalPosition();
                    const earthTransform = this.earthSphere.getTransform();
                    const halfLength = barScale.x / 2.0;
                    const localX = -halfLength + this.earthSphereXOffset; // Position at the very start

                    earthTransform.setLocalPosition(new vec3(
                        barPosition.x + localX,
                        barPosition.y,
                        barPosition.z
                    ));
                  } catch(e){
                      print("Error resetting sphere position: " + e);
                  }
            }
        }
    }

    private formatTime(timeInSeconds: number): string {
        if (isNaN(timeInSeconds) || timeInSeconds === null || timeInSeconds === undefined || timeInSeconds < 0) {
            return "00:00";
        }

        const totalSeconds = Math.floor(timeInSeconds);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
    }

    // --- Public methods (if needed by other scripts) ---
    public getCurrentTrackIndex(): number {
        return this.currentTrackIndex;
    }

    public getTrackPrefab(index: number): SceneObject | null {
        if (index >= 0 && index < this.trackPrefabs.length) {
            return this.trackPrefabs[index];
        }
        return null;
    }
    // --- End Public methods ---

    onDestroy(): void {
        print("MusicPlayerManager onDestroy called.");
        // Remove button listeners
        if (this.playPauseButton && this.onPlayPauseCallback) {
            this.playPauseButton.onButtonPinched.remove(this.onPlayPauseCallback);
        }
        if (this.nextTrackButton && this.onNextTrackCallback) {
            this.nextTrackButton.onButtonPinched.remove(this.onNextTrackCallback);
        }
        if (this.prevTrackButton && this.onPrevTrackCallback) {
            this.prevTrackButton.onButtonPinched.remove(this.onPrevTrackCallback);
        }
        if (this.repeatButton && this.onRepeatCallback) {
            this.repeatButton.onButtonPinched.remove(this.onRepeatCallback);
        }
        if (this.shuffleButton && this.onShuffleCallback) {
            this.shuffleButton.onButtonPinched.remove(this.onShuffleCallback);
        }
        if (this.stopButton && this.onStopCallback) {
            this.stopButton.onButtonPinched.remove(this.onStopCallback);
        }

        // Clean up audio component
        if (this.audioComponent) {
            // Remove the finish callback
            this.audioComponent.setOnFinish(null);
            // Stop playback if it's running
            if (this.isPlaying || this.isPaused) {
                 this.audioComponent.stop(false); // No fade needed on destroy
            }
            this.audioComponent.audioTrack = null; // Clear reference
        }

        // Disable prefabs (optional, scene unload usually handles this)
        /*
        this.trackPrefabs.forEach(prefab => {
            if (prefab) prefab.enabled = false;
        });
        if (this.stoppedPrefab) {
            this.stoppedPrefab.enabled = false;
        }
        */
        print("MusicPlayerManager cleaned up.");
    }
}