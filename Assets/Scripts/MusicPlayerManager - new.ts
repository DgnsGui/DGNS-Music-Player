
import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { InteractorEvent } from 'SpectaclesInteractionKit/Core/Interactor/InteractorEvent';

// Interface for pending delayed calls
interface PendingDelayedCall {
    executeTime: number;
    callback: () => void;
}

// Interface to hold combined track data
interface TrackData {
    asset: AudioTrackAsset | RemoteReferenceAsset;
    artist: string;
    title: string;
    prefab: SceneObject | null;
    isRemote: boolean;
}

@component
export class MusicPlayerManager extends BaseScriptComponent {
    // --- Inputs ---
    @input() localTracks: AudioTrackAsset[];
    @input() localArtists: string[];
    @input() localTitles: string[];
    @input() localTrackPrefabs: SceneObject[];
    @input() remoteTracks: RemoteReferenceAsset[];
    @input() remoteArtists: string[];
    @input() remoteTitles: string[];
    @input() remoteTrackPrefabs: SceneObject[];
    @input('SceneObject') stoppedPrefab: SceneObject;
    @input('Component.Text') artistNameText: Text;
    @input('Component.Text') timecodeText: Text;
    @input('Component.Text') trackTitleText: Text;
    @input('Component.ScriptComponent') playPauseButton: PinchButton;
    @input('Component.ScriptComponent') nextTrackButton: PinchButton;
    @input('Component.ScriptComponent') prevTrackButton: PinchButton;
    @input('Component.ScriptComponent') repeatButton: PinchButton;
    @input('Component.ScriptComponent') shuffleButton: PinchButton;
    @input('Component.ScriptComponent') stopButton: PinchButton;
    @input('SceneObject') progressBar: SceneObject;
    @input('SceneObject') earthSphere: SceneObject;
    @input('Component.AudioComponent') audioComponent: AudioComponent;
    @input('bool') loopPlayback: boolean = true;
    @input('number') earthSphereXOffset: number = 0;
    @input('number') rotationSpeed: number = 30.0;

    // --- Inputs for Material Blinking ---
    @input('Component.MeshVisual') playButtonMeshVisual: MeshVisual | null = null;
    @input('Asset.Material') originalPlayButtonMaterial: Material | null = null;
    @input('Asset.Material') blinkMaterial: Material | null = null;

    // --- Inputs for Button Icons ---
    @input('SceneObject') repeatOnIcon: SceneObject | null = null;
    @input('SceneObject') repeatOffIcon: SceneObject | null = null;
    @input('SceneObject') shuffleOnIcon: SceneObject | null = null;
    @input('SceneObject') shuffleOffIcon: SceneObject | null = null;

    // --- Private variables --- //
    private allTracksData: TrackData[] = [];
    private currentTrackIndex: number = -1;
    private isPlaying: boolean = false;
    private isPaused: boolean = false;
    private isRepeatEnabled: boolean = false;
    private isShuffleEnabled: boolean = false;
    private shouldAutoPlay: boolean = false; // Flag set by next/prev/finish to indicate intent to play the *next* loaded track
    private isLoadingRemote: boolean = false;
    private isManualStop: boolean = false;
    private trackStartTime: number = 0;
    private currentPlaybackTime: number = 0;
    private audioInitialized: boolean = false;
    private currentActivePrefab: SceneObject | null = null;
    private lastPinchTimePlayPause: number = 0;
    private lastPinchTimeNext: number = 0;
    private lastPinchTimePrev: number = 0;
    private lastPinchTimeRepeat: number = 0;
    private lastPinchTimeShuffle: number = 0;
    private lastPinchTimeStop: number = 0;
    private readonly DEBOUNCE_TIME = 0.5;
    private pendingDelayedCalls: PendingDelayedCall[] = [];
    // --- Blinking Variables ---
    private isBlinkingActive: boolean = false;
    private blinkTimer: number = 0;
    private readonly blinkInterval: number = 1.0;
    private isBlinkMaterialActive: boolean = false;

    // --- Callbacks --- //
    private onPlayPauseCallback: (event: InteractorEvent) => void;
    private onNextTrackCallback: (event: InteractorEvent) => void;
    private onPrevTrackCallback: (event: InteractorEvent) => void;
    private onRepeatCallback: (event: InteractorEvent) => void;
    private onShuffleCallback: (event: InteractorEvent) => void;
    private onStopCallback: (event: InteractorEvent) => void;
    private onTrackFinishedCallback: (audioComponent: AudioComponent) => void;

    // --- Core Methods ---
    onAwake(): void {
        this.api.stopTrack = this.stopTrack.bind(this);
        if (!this.validateInputs()) { print("Input validation failed. MusicPlayerManager will not function correctly."); return; }
        this.combineTrackData();
        if (this.allTracksData.length === 0) { print("MusicPlayerManager: No tracks provided."); }
        this.disableAllPrefabs();
        this.setupCallbacks();
        this.setupProgressBar();
        this.updateButtonIcons(); // Set initial icon state

        this.createEvent("UpdateEvent").bind(() => {
            this.updatePlayer();
            this.updateSphereRotation();
            this.checkDelayedCalls();
            this.updateBlinkEffect();
        });

        this.updateActivePrefab();
        this.updateTrackInfo();

        if (this.currentTrackIndex === -1 && !this.isPlaying && !this.isPaused) {
            this.startBlinkingPlayButton();
        }

        print(`MusicPlayerManager Initialized with ${this.localTracks?.length || 0} local, ${this.remoteTracks?.length || 0} remote. Total: ${this.allTracksData.length}`);
    }

    private validateInputs(): boolean {
        let isValid = true;
        if (!this.audioComponent) { print("MusicPlayerManager Error: Audio component not defined."); isValid = false; }
        if (!this.playPauseButton) { print("MusicPlayerManager Warning: Play/Pause button PinchButton component not defined."); }
        if (!this.playButtonMeshVisual) { print("MusicPlayerManager Error: Play Button MeshVisual not defined (required for blinking)."); isValid = false; }
        else if (!this.playButtonMeshVisual.isOfType("MaterialMeshVisual") && !this.playButtonMeshVisual.isOfType("Image") && !this.playButtonMeshVisual.isOfType("Text3D") && !this.playButtonMeshVisual.isOfType("ClothVisual") ) {
             print(`MusicPlayerManager Warning: Linked Play Button MeshVisual (Type: ${this.playButtonMeshVisual.getTypeName()}) might not support direct material swapping needed for blinking. Ensure it's an Image, Text3D, or similar MaterialMeshVisual.`);
        }
        if (!this.originalPlayButtonMaterial) { print("MusicPlayerManager Error: Original Play Button Material not defined (required for blinking)."); isValid = false; }
        if (!this.blinkMaterial) { print("MusicPlayerManager Error: Blink Material not defined (required for blinking)."); isValid = false; }

        // Icon Input Validation
        if (!this.repeatOnIcon) { print("MusicPlayerManager Warning: Repeat On Icon SceneObject not defined."); }
        if (!this.repeatOffIcon) { print("MusicPlayerManager Warning: Repeat Off Icon SceneObject not defined."); }
        if (!this.shuffleOnIcon) { print("MusicPlayerManager Warning: Shuffle On Icon SceneObject not defined."); }
        if (!this.shuffleOffIcon) { print("MusicPlayerManager Warning: Shuffle Off Icon SceneObject not defined."); }

        // Input validation for tracks/artists/titles/prefabs...
        const numLocalTracks = this.localTracks?.length || 0;
        if (numLocalTracks > 0) {
            if (!this.localArtists || this.localArtists.length !== numLocalTracks) { print(`MusicPlayerManager Error: Mismatch local tracks (${numLocalTracks}) and artists (${this.localArtists?.length || 0}).`); isValid = false; }
            if (!this.localTitles || this.localTitles.length !== numLocalTracks) { print(`MusicPlayerManager Error: Mismatch local tracks (${numLocalTracks}) and titles (${this.localTitles?.length || 0}).`); isValid = false; }
            if (!this.localTrackPrefabs || this.localTrackPrefabs.length !== numLocalTracks) { print(`MusicPlayerManager Error: Mismatch local tracks (${numLocalTracks}) and prefabs (${this.localTrackPrefabs?.length || 0}).`); isValid = false; }
            if (this.localTracks.some(track => track == null)) { print("MusicPlayerManager Error: One or more local tracks are null."); isValid = false; }
            if (this.localTrackPrefabs.some(prefab => prefab == null)) { print("MusicPlayerManager Error: One or more local prefabs are null."); isValid = false; }
        }
        const numRemoteTracks = this.remoteTracks?.length || 0;
        if (numRemoteTracks > 0) {
            if (!this.remoteArtists || this.remoteArtists.length !== numRemoteTracks) { print(`MusicPlayerManager Error: Mismatch remote tracks (${numRemoteTracks}) and artists (${this.remoteArtists?.length || 0}).`); isValid = false; }
            if (!this.remoteTitles || this.remoteTitles.length !== numRemoteTracks) { print(`MusicPlayerManager Error: Mismatch remote tracks (${numRemoteTracks}) and titles (${this.remoteTitles?.length || 0}).`); isValid = false; }
            if (!this.remoteTrackPrefabs || this.remoteTrackPrefabs.length !== numRemoteTracks) { print(`MusicPlayerManager Error: Mismatch remote tracks (${numRemoteTracks}) and prefabs (${this.remoteTrackPrefabs?.length || 0}).`); isValid = false; }
            if (this.remoteTracks.some(track => track == null)) { print("MusicPlayerManager Error: One or more remote tracks are null."); isValid = false; }
            if (this.remoteTrackPrefabs.some(prefab => prefab == null)) { print("MusicPlayerManager Error: One or more remote prefabs are null."); isValid = false; }
        }
        // Add checks for other essential inputs if needed (progressBar, earthSphere, etc.)
        if (!this.earthSphere || !this.progressBar) { print("MusicPlayerManager Warning: Progress visualization objects not defined."); }


        return isValid;
    }


    // --- Blinking Logic Methods (Using Type Casting) ---

    private startBlinkingPlayButton(): void {
        if (this.isBlinkingActive || !this.playButtonMeshVisual || !this.originalPlayButtonMaterial || !this.blinkMaterial) {
             if (!this.playButtonMeshVisual || !this.originalPlayButtonMaterial || !this.blinkMaterial) {
                 // print("MusicPlayerManager: Cannot start blinking - required MeshVisual or Materials are missing."); // Less verbose
             }
            return;
        }

        // print("MusicPlayerManager: Starting Play button material blink."); // Less verbose
        this.isBlinkingActive = true;
        this.blinkTimer = 0;
        this.isBlinkMaterialActive = false;

        try {
            // Attempt to cast and set material
            const meshVisual = this.playButtonMeshVisual as MaterialMeshVisual; // Assuming common base or specific types needed
            if (meshVisual && meshVisual.mainMaterial !== undefined) { // Check if mainMaterial property exists
                meshVisual.mainMaterial = this.originalPlayButtonMaterial;
            } else {
                 // Try casting to Image if MaterialMeshVisual fails or lacks mainMaterial
                 const imageVisual = this.playButtonMeshVisual as Image;
                 if (imageVisual && imageVisual.mainMaterial !== undefined) {
                     imageVisual.mainMaterial = this.originalPlayButtonMaterial;
                 } else {
                    print("MusicPlayerManager: Warning - PlayButton MeshVisual is not a recognizable type with mainMaterial for blinking.");
                    // Don't stop blinking entirely, maybe it works via base properties
                 }
            }
        } catch (e) {
            print("MusicPlayerManager: Error setting initial material on blink start: " + e);
            this.isBlinkingActive = false; // Stop if initial set fails
        }
    }

    private stopBlinkingPlayButton(): void {
        if (!this.isBlinkingActive) return;

        // print("MusicPlayerManager: Stopping Play button material blink."); // Less verbose
        this.isBlinkingActive = false;

        if (this.playButtonMeshVisual && this.originalPlayButtonMaterial) {
            try {
                // Attempt to cast and set material
                const meshVisual = this.playButtonMeshVisual as MaterialMeshVisual;
                if (meshVisual && meshVisual.mainMaterial !== undefined) {
                     meshVisual.mainMaterial = this.originalPlayButtonMaterial;
                } else {
                    const imageVisual = this.playButtonMeshVisual as Image;
                    if (imageVisual && imageVisual.mainMaterial !== undefined) {
                        imageVisual.mainMaterial = this.originalPlayButtonMaterial;
                    } else {
                       // Warning already printed in startBlinking potentially
                    }
                }
            } catch (e) {
                // print("MusicPlayerManager: Error resetting material on blink stop: " + e); // Less verbose on stop
            }
        }
    }

    private updateBlinkEffect(): void {
        if (!this.isBlinkingActive || !this.playButtonMeshVisual || !this.originalPlayButtonMaterial || !this.blinkMaterial) {
             return;
         }

        this.blinkTimer += getDeltaTime();

        if (this.blinkTimer >= this.blinkInterval / 2.0) {
            this.isBlinkMaterialActive = !this.isBlinkMaterialActive;
            this.blinkTimer -= this.blinkInterval / 2.0;

            try {
                 const targetMaterial = this.isBlinkMaterialActive ? this.blinkMaterial : this.originalPlayButtonMaterial;
                 // Attempt to cast and set material
                 const meshVisual = this.playButtonMeshVisual as MaterialMeshVisual;
                 if (meshVisual && meshVisual.mainMaterial !== undefined) {
                     meshVisual.mainMaterial = targetMaterial;
                 } else {
                     const imageVisual = this.playButtonMeshVisual as Image;
                     if (imageVisual && imageVisual.mainMaterial !== undefined) {
                         imageVisual.mainMaterial = targetMaterial;
                     } else {
                         // Warning already printed in startBlinking potentially, stop blinking if update fails consistently
                         // print("MusicPlayerManager: Error - PlayButton MeshVisual type unsupported during blink update. Stopping blink.");
                         this.stopBlinkingPlayButton();
                     }
                 }
            } catch (e) {
                 print("MusicPlayerManager: Error applying material during blink update: " + e + ". Stopping blink.");
                 this.stopBlinkingPlayButton();
            }
        }
    }

    // --- Player Control Methods ---

    public stopTrack(): void {
         print("Stop track called.");
         this.isManualStop = true;
         this.isLoadingRemote = false; // Ensure loading stops if manually stopped
         this.pendingDelayedCalls = []; // Clear any pending actions like delayed play

         if (this.audioComponent) {
             if (this.audioComponent.isPlaying() || this.audioComponent.isPaused()) {
                 print("Stopping audio component (immediate)...");
                 try { this.audioComponent.stop(false); } catch (e) { print("Error stopping audio component: " + e); }
             }
             // It's generally safer to null the track *after* stopping
             try { this.audioComponent.audioTrack = null; } catch (e) { print("Error clearing audio track on stop: " + e); }
         }

         this.isPlaying = false;
         this.isPaused = false;
         this.shouldAutoPlay = false; // Stop any intent to auto play
         this.currentTrackIndex = -1; // Reset index to indicate stopped state
         this.audioInitialized = false;
         this.currentPlaybackTime = 0;

         this.updateEarthPosition(0, 1); // Reset progress bar visuals
         this.updateTrackInfo(); // Update UI text (Artist, Title, Time)
         this.updateActivePrefab(); // Show the "stopped" prefab if available

         this.startBlinkingPlayButton(); // Indicate ready to play

         print("Player stopped & reset.");
    }

    private playTrack(): void {
        this.stopBlinkingPlayButton(); // Stop blinking when play is initiated

        if (this.isLoadingRemote) { print("Play track ignored: Loading remote."); return; }
        if (!this.audioInitialized || !this.audioComponent || !this.audioComponent.audioTrack) {
            print(`Cannot play: Not initialized (Init:${this.audioInitialized}, Comp:${!!this.audioComponent}, Track:${!!this.audioComponent?.audioTrack}).`);
            // Attempt recovery if a track *should* be loaded but isn't initialized
            if (this.currentTrackIndex !== -1) {
                print("Attempting recovery: Reloading current track with play intent.");
                this.shouldAutoPlay = true; // Set intent to play after load
                this.loadTrack(this.currentTrackIndex);
            }
            return;
        }

        try {
            const currentTitle = this.allTracksData[this.currentTrackIndex]?.title || "Unknown Title";
            if (this.isPaused) {
                print(`Resuming: ${currentTitle}`);
                this.audioComponent.resume();
                this.isPlaying = true;
                this.isPaused = false;
                // Adjust start time based on paused time
                this.trackStartTime = getTime() - this.currentPlaybackTime;
            } else if (!this.isPlaying) {
                print(`Starting playback from beginning: ${currentTitle}`);
                this.currentPlaybackTime = 0; // Ensure starting from 0
                this.trackStartTime = getTime(); // Set new start time
                this.audioComponent.play(1); // Play with volume 1
                this.isPlaying = true;
                this.isPaused = false;
            } else {
                print(`Play track called while already playing ${currentTitle}. No action taken.`);
            }
            this.isManualStop = false; // Clear manual stop flag if playback starts/resumes
        } catch (e) {
            print(`Error executing play/resume for track ${this.currentTrackIndex}: ${e}`);
            // If play/resume fails, handle it as a load error for this track
            this.handleLoadError(this.currentTrackIndex, "Playback error: " + e);
        }
    }

     private pauseTrack(): void {
        this.stopBlinkingPlayButton(); // Stop blinking if user pauses

        // Only pause if actually playing and initialized
        if (!this.isPlaying || !this.audioInitialized || !this.audioComponent || !this.audioComponent.isPlaying()) {
             print(`Pause ignored: Not in a valid playing state (Playing:${this.isPlaying}, Init:${this.audioInitialized}, CompPlaying:${this.audioComponent?.isPlaying()})`);
             // If state is inconsistent (e.g., isPlaying true but component isn't), force update
             if(this.isPlaying) { this.isPlaying = false; this.isPaused = true; }
             return;
        }

        try {
            const currentTitle = this.allTracksData[this.currentTrackIndex]?.title || "Unknown Title";
            print(`Attempting to pause: ${currentTitle}`);
            // Store current position accurately before pausing
            this.currentPlaybackTime = Math.max(0, getTime() - this.trackStartTime);
            this.audioComponent.pause();
            this.isPlaying = false;
            this.isPaused = true;
            print(`Paused at ${this.formatTime(this.currentPlaybackTime)}`);
        } catch (e) {
            print("Error pausing track: " + e);
            // Try to update state even if pause command failed
            this.currentPlaybackTime = Math.max(0, getTime() - this.trackStartTime);
            this.isPlaying = false;
            this.isPaused = true;
        }
    }

    private togglePlayPause(): void {
        if (this.isLoadingRemote) { print("Play/Pause ignored: Loading remote."); return; }
        if (this.allTracksData.length === 0) { print("Play/Pause ignored: No tracks."); return; }

        print(`Toggle Play/Pause called - State: IsPlaying=${this.isPlaying}, IsPaused=${this.isPaused}, AudioInit=${this.audioInitialized}, CurrentIndex=${this.currentTrackIndex}`);

        if (this.isPlaying) {
             this.pauseTrack();
        } else {
             // Case 1: Player is stopped (no track selected) -> Load and play track 0
             if (this.currentTrackIndex === -1) {
                 print("Starting playback from stopped state (loading track 0).");
                 this.shouldAutoPlay = true; // Set intent to play after loading
                 this.loadTrack(0);
             // Case 2: Player is paused, track is initialized -> Resume
             } else if (this.isPaused && this.audioInitialized && this.audioComponent?.audioTrack) {
                 print("Resuming playback.");
                 this.playTrack();
             // Case 3: Player is not playing/paused, but track is loaded/initialized (e.g., after loading without autoplay) -> Play from beginning
             } else if (!this.isPaused && this.audioInitialized && this.audioComponent?.audioTrack) {
                 print("Starting playback of already loaded track.");
                 this.playTrack();
             // Case 4: Track is selected but somehow not initialized -> Reload with intent to play
             } else if (!this.audioInitialized && this.currentTrackIndex !== -1) {
                 print("Track selected but not initialized. Reloading with play intent.");
                 this.shouldAutoPlay = true; // Set intent to play after loading
                 this.loadTrack(this.currentTrackIndex);
             // Case 5: Unexpected state or error -> Log and potentially start blinking again
             } else {
                 print("Play/Pause ignored: Unexpected state or no track loaded properly.");
                 if(this.currentTrackIndex !== -1 && !this.audioInitialized) {
                     print("Attempting to reload current track due to uninitialized state.");
                     this.shouldAutoPlay = true;
                     this.loadTrack(this.currentTrackIndex);
                 } else if (this.currentTrackIndex === -1) {
                     // If stopped and toggle fails, ensure blinking starts
                     this.startBlinkingPlayButton();
                 }
             }
        }
    }

    onDestroy(): void {
        print("Destroying MusicPlayerManager.");
        this.stopBlinkingPlayButton();

        this.pendingDelayedCalls = []; // Clear pending actions
        // Ensure audio is stopped and resources released if possible
        if (this.audioComponent && (this.isPlaying || this.isPaused)) {
             try {
                 this.audioComponent.stop(false);
                 this.audioComponent.audioTrack = null;
                 this.audioComponent.setOnFinish(null); // Remove finish callback explicitly
            } catch (e) { /* Ignore errors during cleanup */ }
        }
        // Remove event listeners
        if (this.playPauseButton?.onButtonPinched) this.playPauseButton.onButtonPinched.remove(this.onPlayPauseCallback);
        if (this.nextTrackButton?.onButtonPinched) this.nextTrackButton.onButtonPinched.remove(this.onNextTrackCallback);
        if (this.prevTrackButton?.onButtonPinched) this.prevTrackButton.onButtonPinched.remove(this.onPrevTrackCallback);
        if (this.repeatButton?.onButtonPinched) this.repeatButton.onButtonPinched.remove(this.onRepeatCallback);
        if (this.shuffleButton?.onButtonPinched) this.shuffleButton.onButtonPinched.remove(this.onShuffleCallback);
        if (this.stopButton?.onButtonPinched) this.stopButton.onButtonPinched.remove(this.onStopCallback);

        this.disableAllPrefabs(); // Hide track-specific visuals
     }

    // --- Track Loading and Handling ---

    private disableAllPrefabs(): void {
        // Disable all track-specific prefabs
        this.allTracksData.forEach(track => {
             if (track.prefab) {
                 try { track.prefab.enabled = false; } catch(e) { /* ignore */ }
             }
        });
        // Also disable the stopped prefab initially
        if (this.stoppedPrefab) {
            try { this.stoppedPrefab.enabled = false; } catch(e) { /* ignore */ }
        }
        this.currentActivePrefab = null; // Clear the reference
    }

    private combineTrackData(): void {
         this.allTracksData = []; // Reset
         // Combine local tracks
         if (this.localTracks) {
            for (let i = 0; i < this.localTracks.length; i++) {
                // Ensure all required data exists for this index
                if (this.localTracks[i] && this.localArtists?.[i] !== undefined && this.localTitles?.[i] !== undefined && this.localTrackPrefabs?.[i]) {
                    this.allTracksData.push({
                        asset: this.localTracks[i],
                        artist: this.localArtists[i],
                        title: this.localTitles[i],
                        prefab: this.localTrackPrefabs[i],
                        isRemote: false
                    });
                } else { print(`MusicPlayerManager Warning: Skipping local track at index ${i} due to missing data (Track, Artist, Title, or Prefab).`); }
            }
        }
        // Combine remote tracks
        if (this.remoteTracks) {
             for (let i = 0; i < this.remoteTracks.length; i++) {
                 // Ensure all required data exists for this index
                 if (this.remoteTracks[i] && this.remoteArtists?.[i] !== undefined && this.remoteTitles?.[i] !== undefined && this.remoteTrackPrefabs?.[i]) {
                    this.allTracksData.push({
                        asset: this.remoteTracks[i],
                        artist: this.remoteArtists[i],
                        title: this.remoteTitles[i],
                        prefab: this.remoteTrackPrefabs[i],
                        isRemote: true });
                 } else { print(`MusicPlayerManager Warning: Skipping remote track at index ${i} due to missing data (Track, Artist, Title, or Prefab).`); }
            }
        }
    }

    private setupCallbacks(): void {
        // Use arrow functions to preserve 'this' context and debounce logic
        if (this.playPauseButton) {
            this.onPlayPauseCallback = (event: InteractorEvent) => {
                 const currentTime = getTime();
                 if (currentTime - this.lastPinchTimePlayPause < this.DEBOUNCE_TIME) return;
                 this.lastPinchTimePlayPause = currentTime;
                 this.togglePlayPause();
             };
            this.playPauseButton.onButtonPinched.add(this.onPlayPauseCallback);
        }
        if (this.nextTrackButton) {
            this.onNextTrackCallback = (event: InteractorEvent) => {
                 const currentTime = getTime();
                 if (currentTime - this.lastPinchTimeNext < this.DEBOUNCE_TIME) return;
                 this.lastPinchTimeNext = currentTime;
                 this.nextTrack();
             };
            this.nextTrackButton.onButtonPinched.add(this.onNextTrackCallback);
        }
        if (this.prevTrackButton) {
            this.onPrevTrackCallback = (event: InteractorEvent) => {
                 const currentTime = getTime();
                 if (currentTime - this.lastPinchTimePrev < this.DEBOUNCE_TIME) return;
                 this.lastPinchTimePrev = currentTime;
                 this.prevTrack();
             };
            this.prevTrackButton.onButtonPinched.add(this.onPrevTrackCallback);
        }
        if (this.repeatButton) {
            this.onRepeatCallback = (event: InteractorEvent) => {
                const currentTime = getTime(); if (currentTime - this.lastPinchTimeRepeat < this.DEBOUNCE_TIME) return;
                this.lastPinchTimeRepeat = currentTime;
                this.isRepeatEnabled = !this.isRepeatEnabled; print("Repeat " + (this.isRepeatEnabled ? "enabled" : "disabled"));
                // Shuffle must be disabled if repeat is enabled
                if (this.isRepeatEnabled) this.isShuffleEnabled = false;
                this.updateButtonIcons(); // Update icons state
            };
            this.repeatButton.onButtonPinched.add(this.onRepeatCallback);
        }
        if (this.shuffleButton) {
            this.onShuffleCallback = (event: InteractorEvent) => {
                const currentTime = getTime(); if (currentTime - this.lastPinchTimeShuffle < this.DEBOUNCE_TIME) return;
                this.lastPinchTimeShuffle = currentTime;
                this.isShuffleEnabled = !this.isShuffleEnabled; print("Shuffle mode " + (this.isShuffleEnabled ? "enabled" : "disabled"));
                 // Repeat must be disabled if shuffle is enabled
                 if (this.isShuffleEnabled) this.isRepeatEnabled = false;
                 this.updateButtonIcons(); // Update icons state
            };
            this.shuffleButton.onButtonPinched.add(this.onShuffleCallback);
        }
        if (this.stopButton) {
            this.onStopCallback = (event: InteractorEvent) => {
                const currentTime = getTime(); if (currentTime - this.lastPinchTimeStop < this.DEBOUNCE_TIME) return;
                this.lastPinchTimeStop = currentTime;
                this.stopTrack(); // Call the main stop function
            };
            this.stopButton.onButtonPinched.add(this.onStopCallback);
        }
        // Setup the callback for when a track naturally finishes playing
        this.setupTrackFinishedCallback();
    }

     private setupTrackFinishedCallback(): void {
        // Define the callback using an arrow function to preserve 'this'
        this.onTrackFinishedCallback = (audioComponent: AudioComponent) => {
            // Critical Check: Ensure this callback is relevant before proceeding
            // - Is it from *our* audio component?
            // - Was the track actually playing (not paused, stopped, or loading)?
            // - Was the stop manually triggered just before finish?
            if (audioComponent !== this.audioComponent || !this.isPlaying || this.isLoadingRemote || this.isManualStop || this.isPaused) {
                // Reset manual stop flag if it caused the finish event to be ignored
                if(this.isManualStop) this.isManualStop = false;
                print(`Track finished event ignored (CompMatch:${audioComponent === this.audioComponent}, IsPlaying:${this.isPlaying}, Loading:${this.isLoadingRemote}, ManualStop:${this.isManualStop}, Paused:${this.isPaused})`);
                return;
            }
            print("Track finished event detected, handling auto-advance.");
            this.handleTrackFinished(); // Proceed to determine and load the next track
        };
        // Assign the callback to the audio component
        if (this.audioComponent) {
            try {
                 this.audioComponent.setOnFinish(this.onTrackFinishedCallback);
            } catch (e) { print("Error setting setOnFinish callback: " + e); }
        }
    }

    private handleTrackFinished(): void {
        print("Handle Track Finished - Determining next action.");
        // If no track was playing or list is empty, just stop.
        if (this.currentTrackIndex === -1 || this.allTracksData.length === 0) { this.stopTrack(); return; }

        // Set the flag indicating the *next* track loaded should play automatically
        this.shouldAutoPlay = true;

        let nextIndex = -1;

        // Determine next index based on Repeat/Shuffle/Loop settings
        if (this.isRepeatEnabled) {
            // Repeat the same track
            nextIndex = this.currentTrackIndex;
            print("Repeat enabled, reloading current track index: " + nextIndex);
        } else if (this.isShuffleEnabled) {
            // Pick a random different track
            if (this.allTracksData.length > 1) {
                do {
                    nextIndex = Math.floor(Math.random() * this.allTracksData.length);
                } while (nextIndex === this.currentTrackIndex); // Ensure it's different
            } else {
                nextIndex = 0; // Only one track, play it again
            }
             print("Shuffle enabled, selected next random index: " + nextIndex);
        } else {
            // Normal sequential playback
            nextIndex = this.currentTrackIndex + 1;
            if (nextIndex >= this.allTracksData.length) {
                // Reached the end
                if (this.loopPlayback) {
                    nextIndex = 0; // Loop back to the beginning
                    print("Reached end, looping enabled, going to index 0.");
                } else {
                    print("Reached end, looping disabled. Stopping playback.");
                    this.shouldAutoPlay = false; // Don't auto play silence
                    this.stopTrack(); // Stop the player
                    return; // Exit the function
                }
            } else {
                 print("Sequential mode, advancing to index: " + nextIndex);
            }
        }

        // Validate the calculated index and load the track
        if (nextIndex >= 0 && nextIndex < this.allTracksData.length) {
            this.loadTrack(nextIndex);
        } else {
            // This should ideally not happen with the logic above
            print(`Error: Invalid next index calculated (${nextIndex}) in handleTrackFinished. Stopping.`);
            this.stopTrack();
        }
    }

    private updateActivePrefab(): void {
        // Disable the previously active prefab
        if (this.currentActivePrefab) {
             try { this.currentActivePrefab.enabled = false; } catch(e) {/* ignore */}
             this.currentActivePrefab = null;
        }

        // Enable the correct prefab based on the current state
        if (this.currentTrackIndex === -1) {
            // Player is stopped, enable the stopped prefab if it exists
            if (this.stoppedPrefab) {
                 try { this.stoppedPrefab.enabled = true; this.currentActivePrefab = this.stoppedPrefab; } catch(e) {/* ignore */}
            }
        } else if (this.currentTrackIndex >= 0 && this.currentTrackIndex < this.allTracksData.length) {
            // A valid track is selected, enable its associated prefab
            const currentTrackData = this.allTracksData[this.currentTrackIndex];
            if (currentTrackData && currentTrackData.prefab) {
                 try { currentTrackData.prefab.enabled = true; this.currentActivePrefab = currentTrackData.prefab; } catch(e) {/* ignore */}
            }
        }
        // If index is invalid or data is missing, no prefab will be enabled
    }

    // --- Delayed Calls ---

    private delayedCall(delay: number, callback: () => void): void {
        if (!callback) return; // Don't schedule null callbacks
        if (delay <= 0) {
            // Execute immediately if delay is zero or negative
            try { callback(); } catch(e){ print("Error in immediate delayedCall callback: " + e); }
            return;
        }
        // Schedule for future execution
        const executeTime = getTime() + delay;
        this.pendingDelayedCalls.push({ executeTime: executeTime, callback: callback });
    }

    private checkDelayedCalls(): void {
        if (this.pendingDelayedCalls.length === 0) { return; } // Quick exit if no pending calls

        const currentTime = getTime();
        // Iterate backwards to allow safe removal while iterating
        for (let i = this.pendingDelayedCalls.length - 1; i >= 0; i--) {
            const call = this.pendingDelayedCalls[i];
            if (currentTime >= call.executeTime) {
                // Remove *before* executing to prevent re-entry issues
                this.pendingDelayedCalls.splice(i, 1);
                try {
                    // Execute the stored callback
                    call.callback();
                } catch (e) {
                    print("Error executing delayed call callback: " + e);
                }
            }
        }
    }

    // --- Track Loading ---

    private loadTrack(index: number): void {
        if (this.isLoadingRemote) { print(`Load track (${index}) ignored: Already loading another remote track.`); return; }
        if (index < 0 || index >= this.allTracksData.length) { print(`Error: Invalid track index ${index} requested. Stopping.`); this.stopTrack(); return; }

        // Store the intent to play *after* this load finishes, then reset the global flag
        const playAfterLoad = this.shouldAutoPlay;
        this.shouldAutoPlay = false; // Reset intent flag for the next potential load

        // Reset state for the new track
        this.audioInitialized = false;
        this.isManualStop = false; // Loading a new track clears manual stop intent

        // Stop the currently playing/paused track before loading the new one
        let wasPlayingOrPaused = this.isPlaying || this.isPaused;
        if (wasPlayingOrPaused && this.audioComponent) {
             if (this.audioComponent.isPlaying() || this.audioComponent.isPaused()) {
                 print("Stopping previous track before loading new one...");
                 try { this.audioComponent.stop(false); } catch(e){ print("Error stopping previous track: "+e); }
             }
        }
        // Ensure playback state is fully reset
        this.isPlaying = false;
        this.isPaused = false;
        this.currentPlaybackTime = 0; // Reset playback time for the new track

        // Clear the audio component's current track
        if (this.audioComponent) {
            try { this.audioComponent.audioTrack = null; } catch(e) { print("Error clearing audioTrack before load: "+e); }
        }

        // --- Set the new track index and update UI ---
        this.currentTrackIndex = index;
        const trackData = this.allTracksData?.[this.currentTrackIndex];

        if (!trackData) {
            print(`Error: No track data found for index ${index}. Stopping.`);
            this.handleLoadError(index, "Track data not found");
            return;
        }
        // Update Artist/Title text and activate the correct prefab
        this.updateTrackInfo();
        this.updateActivePrefab();

        print(`Loading track ${index}: "${trackData.title}" (${trackData.isRemote ? 'Remote' : 'Local'}) - Intent to play after load: ${playAfterLoad}`);

        // --- Handle Remote vs Local Asset Loading ---
        if (trackData.isRemote) {
            this.isLoadingRemote = true; // Set loading flag
            const remoteAsset = trackData.asset as RemoteReferenceAsset;
            if (this.timecodeText) this.timecodeText.text = "Loading..."; // Update timecode UI

            // --- Define Callbacks for Remote Asset Download ---
            const onDownloadedCallback = (downloadedAsset: Asset) => {
                // Check if this download callback is still relevant (correct index, still loading)
                if (this.currentTrackIndex !== index || !this.isLoadingRemote) {
                    print(`Download callback for index ${index} ignored, current index is ${this.currentTrackIndex}, loading state: ${this.isLoadingRemote}.`);
                    // Ensure loading state is false if we ignore the callback for the current index
                    if (this.currentTrackIndex === index) this.isLoadingRemote = false;
                    return;
                }
                this.isLoadingRemote = false; // Clear loading flag

                // Check if the downloaded asset is a valid AudioTrackAsset
                if (downloadedAsset && downloadedAsset.isOfType("AudioTrackAsset")) {
                    const audioTrack = downloadedAsset as AudioTrackAsset;
                    print(`Remote track "${trackData.title}" download successful.`);

                    if (!this.audioComponent) {
                        print("Error: AudioComponent missing after remote download finished.");
                        this.handleLoadError(index, "AudioComponent missing post-download");
                        return;
                    }
                    // --- Assign Track and Prepare for Playback ---
                    try {
                        this.audioComponent.audioTrack = audioTrack;
                        this.setupTrackFinishedCallback(); // Re-apply finish callback
                        this.audioInitialized = true;
                        this.trackStartTime = getTime(); // Reset start time for potential playback
                        this.currentPlaybackTime = 0; // Reset playback time

                        // --- Play if Requested ---
                        // CRITICAL PATH for Shuffle + Remote: If playAfterLoad is true (set by next/prev/finish),
                        // this delayed call attempts to start playback.
                        if (playAfterLoad) {
                            print(`Auto-playing downloaded remote track: "${trackData.title}"`);
                            // Use a small delay to allow the system to potentially settle after asset assignment
                            this.delayedCall(0.05, () => this.playTrack());
                        } else {
                            // If not auto-playing, just update the player state (e.g., show 00:00 / duration)
                            this.updatePlayer();
                        }
                    } catch (e) {
                        print(`Error setting downloaded audio track or preparing playback for "${trackData.title}": ${e}`);
                        this.handleLoadError(index, "Error setting downloaded track: " + e);
                    }
                } else {
                    print(`Download completed for index ${index} but asset is invalid or not an AudioTrackAsset.`);
                    this.handleLoadError(index, "Invalid asset type or download error");
                }
            };

             const onFailedCallback = () => {
                // Check if this failure callback is still relevant
                if (this.currentTrackIndex !== index || !this.isLoadingRemote) {
                    print(`Download failed callback for index ${index} ignored, current index is ${this.currentTrackIndex}, loading state: ${this.isLoadingRemote}.`);
                     if (this.currentTrackIndex === index) this.isLoadingRemote = false;
                    return;
                }
                this.isLoadingRemote = false; // Clear loading flag
                print(`Remote track "${trackData.title}" download explicitly failed.`);
                this.handleLoadError(index, "Download failed");
            };

            // --- Initiate Download ---
            try {
                print(`Starting download for remote asset: "${trackData.title}"`);
                remoteAsset.downloadAsset(onDownloadedCallback, onFailedCallback);
            } catch (e) {
                 print("Error initiating downloadAsset call: " + e);
                 this.isLoadingRemote = false; // Clear flag if download couldn't even start
                 this.handleLoadError(index, "Error initiating download: " + e);
            }

        } else { // --- Handle Local Asset Loading ---
             if (!this.audioComponent) {
                 print("Error: AudioComponent missing for local track load.");
                 this.handleLoadError(index, "AudioComponent missing");
                 return;
             }
            try {
                const localAsset = trackData.asset as AudioTrackAsset;
                this.audioComponent.audioTrack = localAsset;
                this.setupTrackFinishedCallback(); // Re-apply finish callback
                this.audioInitialized = true;
                this.trackStartTime = getTime(); // Reset start time
                this.currentPlaybackTime = 0; // Reset playback time
                print(`Local track "${trackData.title}" loaded successfully.`);

                // --- Play if Requested ---
                if (playAfterLoad) {
                    print(`Auto-playing local track: "${trackData.title}"`);
                    // Use slight delay for consistency with remote path, though likely less critical here
                    this.delayedCall(0.05, () => this.playTrack());
                } else {
                    // Update player state (timecode) even if not playing
                    this.updatePlayer();
                }
            } catch (e) {
                print(`Error loading local audio track "${trackData.title}": ${e}`);
                this.handleLoadError(index, "Local load error: " + e);
            }
        }
    }

     private handleLoadError(failedIndex: number, reason: string): void {
         print(`Handling load error for track index ${failedIndex}: ${reason}`);
         // Only fully stop and reset UI if the error occurred for the *currently intended* track
         if (this.currentTrackIndex === failedIndex) {
             print("Error occurred on the current track. Stopping player.");
             // Update UI to show error state clearly
             if (this.artistNameText) this.artistNameText.text = "Error";
             if (this.trackTitleText) this.trackTitleText.text = "Load Failed";
             if (this.timecodeText) this.timecodeText.text = "--:-- / --:--";
             // Call stopTrack to reset player state (sets index to -1, etc.)
             this.stopTrack(); // This also calls updateActivePrefab to show stopped state
         } else {
             // If the error is for a track we are no longer trying to load, just log it.
             print(`Load error for index ${failedIndex} occurred, but current target index is ${this.currentTrackIndex}. Ignoring stop command for this error.`);
         }
    }

    // --- Navigation ---

    private nextTrack(): void {
        if (this.isLoadingRemote) { print("Next track ignored: Loading remote track."); return; }
        if (this.allTracksData.length === 0) { print("Next track ignored: No tracks available."); return; }
        print("Next track triggered.");

        let nextIndex = -1;
        const currentIndex = this.currentTrackIndex;

        // Determine the next index based on mode
        if (this.isRepeatEnabled && currentIndex !== -1) {
             // Stay on the same track if repeat is enabled
             nextIndex = currentIndex;
             print(`Repeat enabled, staying on index: ${nextIndex}`);
        } else if (this.isShuffleEnabled) {
             // Pick a random *different* index if possible
             if (this.allTracksData.length > 1) {
                 do {
                     nextIndex = Math.floor(Math.random() * this.allTracksData.length);
                 } while (nextIndex === currentIndex); // Ensure it's not the same track
             } else {
                 nextIndex = 0; // If only one track, "shuffle" means play it again
             }
             print(`Shuffle enabled, next random index: ${nextIndex}`);
        } else {
             // Normal sequential mode
            nextIndex = (currentIndex === -1) ? 0 : currentIndex + 1; // Start from 0 if stopped
            if (nextIndex >= this.allTracksData.length) {
                // Reached end of the list
                if (this.loopPlayback) {
                    nextIndex = 0; // Loop back to start
                    print("Reached end, looping back to index 0.");
                } else {
                    print("Reached end, no loop enabled. Stopping.");
                    this.stopTrack(); // Stop if not looping
                    return; // Exit function
                }
            } else {
                 print(`Sequential mode, next index: ${nextIndex}`);
            }
        }

        // Validate the calculated index before loading
        if (nextIndex < 0 || nextIndex >= this.allTracksData.length) {
             print(`Next track error: Invalid calculated index (${nextIndex}). Stopping.`);
             this.stopTrack();
             return;
        }

        // Set intent to play the track immediately after it loads
        this.shouldAutoPlay = true;
        this.loadTrack(nextIndex);
    }

    private prevTrack(): void {
        if (this.isLoadingRemote) { print("Previous track ignored: Loading remote track."); return; }
        if (this.allTracksData.length === 0) { print("Previous track ignored: No tracks available."); return; }
        print("Previous track triggered");

        let prevIndex = -1;
        const currentIndex = this.currentTrackIndex;

        // Determine the previous index based on mode
        if (this.isRepeatEnabled && currentIndex !== -1) {
            // Stay on the same track if repeat is enabled
            prevIndex = currentIndex;
             print(`Repeat enabled, staying on index: ${prevIndex}`);
        } else if (this.isShuffleEnabled) {
             // Pick a random *different* index if possible (same logic as 'next' in shuffle)
            if (this.allTracksData.length > 1) {
                do {
                    prevIndex = Math.floor(Math.random() * this.allTracksData.length);
                } while (prevIndex === currentIndex);
            } else {
                prevIndex = 0;
            }
            print(`Shuffle enabled, previous random index: ${prevIndex}`);
        } else {
            // Normal sequential mode
            // If stopped (-1), prev goes to the last track. Otherwise, index - 1.
            prevIndex = (currentIndex === -1) ? this.allTracksData.length - 1 : currentIndex - 1;
            if (prevIndex < 0) {
                 // Reached beginning of the list
                if (this.loopPlayback) {
                    prevIndex = this.allTracksData.length - 1; // Loop back to end
                    print("Reached beginning, looping back to last index.");
                } else {
                    print("Reached beginning, no loop enabled. Stopping.");
                    this.stopTrack(); // Stop if not looping
                    return; // Exit function
                }
            } else {
                 print(`Sequential mode, previous index: ${prevIndex}`);
            }
        }

        // Validate the calculated index before loading
        if (prevIndex < 0 || prevIndex >= this.allTracksData.length) {
            print(`Previous track error: Invalid calculated index (${prevIndex}). Stopping.`);
            this.stopTrack();
            return;
        }

        // Set intent to play the track immediately after it loads
        this.shouldAutoPlay = true;
        this.loadTrack(prevIndex);
    }

    // --- UI Updates ---

    private updateTrackInfo(): void {
        let artist = "";
        let title = "Stopped"; // Default title when stopped
        let timecode = "00:00 / 00:00"; // Default timecode when stopped

        // Handle loading state UI
        if (this.isLoadingRemote && this.currentTrackIndex !== -1 && this.currentTrackIndex < this.allTracksData.length) {
            const loadingData = this.allTracksData[this.currentTrackIndex];
            artist = loadingData?.artist || "";
            title = loadingData?.title || "Loading...";
            timecode = "Loading..."; // Show loading indicator in timecode
        }
        // Handle loaded/playing/paused state UI
        else if (this.currentTrackIndex !== -1 && this.currentTrackIndex < this.allTracksData.length) {
            const currentData = this.allTracksData[this.currentTrackIndex];
            if (currentData) {
                 artist = currentData.artist;
                 title = currentData.title;
                 // Timecode is updated dynamically in updatePlayer, leave default here or "--:--"
                 timecode = "--:-- / --:--"; // Placeholder until updatePlayer runs
            } else {
                 // Data integrity issue
                 artist = "Error"; title = "Invalid Data"; timecode = "--:--";
            }
        }
         // Handle invalid index state UI (should ideally not happen if logic is correct)
        else if (this.currentTrackIndex !== -1) {
             artist = "Error"; title = "Invalid Index"; timecode = "--:--";
        }
        // If explicitly stopped (index is -1), ensure defaults are set.
        else if (this.currentTrackIndex === -1) {
            artist = ""; // No artist when stopped
            title = "Stopped";
            timecode = "00:00 / 00:00";
        }

        // Update Text components safely
        if (this.artistNameText) { try { this.artistNameText.text = artist; } catch(e) {} }
        if (this.trackTitleText) { try { this.trackTitleText.text = title; } catch(e) {} }
        // Only update timecode here if loading or stopped/error, otherwise let updatePlayer handle it
        if (this.timecodeText && (this.isLoadingRemote || this.currentTrackIndex === -1 || title.includes("Invalid") || title === "Error")) {
            try { this.timecodeText.text = timecode; } catch(e) {}
        }

        // Reset progress bar if stopped or loading
        if (this.currentTrackIndex === -1 || this.isLoadingRemote) {
             this.updateEarthPosition(0, 1); // Reset progress bar
        }
    }

    private updatePlayer(): void {
         // --- Handle states where timecode shouldn't update dynamically ---
         if (this.isLoadingRemote) {
             // If loading, ensure "Loading..." is shown and progress is 0
             if (this.timecodeText && this.timecodeText.text !== "Loading...") { try {this.timecodeText.text = "Loading..."; } catch(e) {} }
             this.updateEarthPosition(0, 1);
             return;
         }
         if (this.currentTrackIndex === -1) {
             // If stopped, ensure "Stopped" state UI is shown
             if (this.timecodeText && this.timecodeText.text !== "00:00 / 00:00") { try { this.timecodeText.text = "00:00 / 00:00"; } catch(e) {} }
             if (this.trackTitleText && this.trackTitleText.text !== "Stopped") { try { this.trackTitleText.text = "Stopped"; } catch(e) {} }
             if (this.artistNameText && this.artistNameText.text !== "") { try { this.artistNameText.text = ""; } catch(e) {} }
             this.updateEarthPosition(0, 1);
             return;
         }
         if (!this.audioInitialized || !this.audioComponent || !this.audioComponent.audioTrack) {
             // If track selected but not ready, show "--:--"
             if (this.timecodeText && this.timecodeText.text !== "--:-- / --:--") { try { this.timecodeText.text = "--:-- / --:--"; } catch(e) {} }
             this.updateEarthPosition(0, 1);
             return;
         }

        // --- Update Timecode and Progress Bar for Active Track ---
        let currentTime = 0;
        let totalTime = 0;
        try {
            // Get duration (handle potential null or 0)
            totalTime = this.audioComponent.duration || 0;

            // Calculate current time based on state
            if (this.isPlaying) {
                // Actively playing: Calculate based on start time
                currentTime = getTime() - this.trackStartTime;
            } else if (this.isPaused) {
                // Paused: Use the stored playback time
                currentTime = this.currentPlaybackTime;
            } else {
                // Not playing or paused (e.g., just loaded)
                currentTime = 0;
            }

            // Clamp current time between 0 and duration
            currentTime = Math.max(0, currentTime);
            if (totalTime > 0) {
                currentTime = Math.min(currentTime, totalTime);
            } else {
                 // If duration is 0 or invalid, treat time as 0
                 totalTime = 0;
                 currentTime = 0;
            }

            // Update Timecode Text
            if (this.timecodeText) {
                try { this.timecodeText.text = `${this.formatTime(currentTime)} / ${this.formatTime(totalTime)}`; } catch(e) {}
            }
            // Update Progress Bar Visual
            this.updateEarthPosition(currentTime, totalTime);

        } catch (e) {
            print("Error updating player state (time/duration): " + e);
            // Fallback UI on error
            if (this.timecodeText) { try { this.timecodeText.text = "Error / --:--"; } catch(e) {} }
            this.updateEarthPosition(0, 1); // Reset progress bar
        }
    }

    private updateEarthPosition(currentTime: number, totalTime: number): void {
        if (!this.earthSphere || !this.progressBar) return; // Need both objects

        try {
            // Calculate progress ratio (0.0 to 1.0), handle division by zero
            let progress = (totalTime > 0.001) ? (currentTime / totalTime) : 0;
            progress = Math.max(0, Math.min(1, progress)); // Clamp progress

            // Get transforms and properties of the progress bar
            const barTransform = this.progressBar.getTransform();
            const barScale = barTransform.getWorldScale();
            const barPosition = barTransform.getWorldPosition();
            const barRotation = barTransform.getWorldRotation();
            const earthTransform = this.earthSphere.getTransform();

            // Calculate start and end points of the progress bar based on its orientation and scale
            const progressDirection = barRotation.multiplyVec3(vec3.right()); // Assumes bar stretches along its local X-axis
            const halfLength = barScale.x / 2.0;
            const startPoint = barPosition.sub(progressDirection.uniformScale(halfLength));
            const endPoint = barPosition.add(progressDirection.uniformScale(halfLength));

            // Interpolate the position along the bar based on progress
            const targetPosition = startPoint.add(endPoint.sub(startPoint).uniformScale(progress));

            // Apply optional offset perpendicular to the bar's direction (useful if sphere sits 'above' the bar)
            const offsetVector = progressDirection.uniformScale(this.earthSphereXOffset); // This offset is along the bar's axis in the current setup, might need adjustment if perpendicular offset is desired.
            const finalPosition = targetPosition.add(offsetVector); // Applying offset

            // Set the earth sphere's world position
            earthTransform.setWorldPosition(finalPosition);

        } catch (e) { print("Error updating earth position: " + e); }
    }

     private formatTime(timeInSeconds: number): string {
        if (isNaN(timeInSeconds) || timeInSeconds < 0) return "00:00"; // Handle invalid input

        const totalSeconds = Math.floor(timeInSeconds);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        // Format as MM:SS with leading zeros
        return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
     }

    private setupProgressBar(): void {
        // Initialize progress bar position at the start
        if (this.progressBar && this.earthSphere) {
             this.updateEarthPosition(0, 1); // Set to 0 progress initially
        }
    }

    private updateSphereRotation(): void {
        // Rotate the earth sphere continuously for visual effect
        if (this.earthSphere) {
            try {
                 const deltaTime = getDeltaTime();
                 const transform = this.earthSphere.getTransform();
                 const currentRotation = transform.getLocalRotation();
                 // Calculate rotation delta based on speed and frame time (around Y-axis)
                 const deltaRotation = quat.fromEulerAngles(0, this.rotationSpeed * deltaTime * (Math.PI / 180.0), 0);
                 // Apply the rotation
                 transform.setLocalRotation(currentRotation.multiply(deltaRotation));
             } catch(e) { /* Ignore minor errors during rotation update */ }
        }
    }


    // --- Helper Method for Icon Updates ---
    private updateButtonIcons(): void {
        let iconsUpdated = false; // Track if any icon update was attempted

        // Repeat Button Icons
        if (this.repeatOnIcon && this.repeatOffIcon) {
            iconsUpdated = true;
            try {
                this.repeatOnIcon.enabled = this.isRepeatEnabled;
                this.repeatOffIcon.enabled = !this.isRepeatEnabled;
            } catch (e) {
                print("Error updating repeat button icons: " + e);
            }
        } else if (this.repeatOnIcon || this.repeatOffIcon) {
             // Warn if only one icon is set
             print("MusicPlayerManager Warning: Both Repeat On and Repeat Off icons must be set for repeat toggle visuals.");
        } // Silently ignore if neither is set

        // Shuffle Button Icons
        if (this.shuffleOnIcon && this.shuffleOffIcon) {
             iconsUpdated = true;
             try {
                this.shuffleOnIcon.enabled = this.isShuffleEnabled;
                this.shuffleOffIcon.enabled = !this.isShuffleEnabled;
            } catch (e) {
                print("Error updating shuffle button icons: " + e);
            }
        } else if (this.shuffleOnIcon || this.shuffleOffIcon) {
            // Warn if only one icon is set
            print("MusicPlayerManager Warning: Both Shuffle On and Shuffle Off icons must be set for shuffle toggle visuals.");
        } // Silently ignore if neither is set

        // if (iconsUpdated) print("Button icons updated."); // Optional log
    }

    // --- Public API (Optional) ---
    public getCurrentTrackIndex(): number { return this.currentTrackIndex; }

    public getTrackPrefab(index: number): SceneObject | null {
        return (index >= 0 && index < this.allTracksData.length) ? this.allTracksData[index].prefab : null;
    }
}