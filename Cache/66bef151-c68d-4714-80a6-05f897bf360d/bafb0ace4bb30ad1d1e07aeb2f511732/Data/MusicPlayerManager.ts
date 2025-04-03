import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { InteractorEvent } from 'SpectaclesInteractionKit/Core/Interactor/InteractorEvent';

// Interface to hold combined track data
interface TrackData {
    // Use direct type names if available globally, otherwise revert if needed
    asset: AudioTrackAsset | RemoteReferenceAsset;
    artist: string;
    title: string;
    prefab: SceneObject | null; // Allow null if prefabs aren't perfectly matched
    isRemote: boolean;
}

@component
export class MusicPlayerManager extends BaseScriptComponent {
    // --- Local Embedded Assets ---
    @input
    @hint('Local: Liste des morceaux de musique intégrés')
    localTracks: AudioTrackAsset[];

    @input
    @hint('Local: Liste des noms d\'artistes correspondants aux morceaux intégrés')
    localArtists: string[];

    @input
    @hint('Local: Liste des titres des morceaux intégrés')
    localTitles: string[];

    @input
    @hint('Local: Liste des prefabs à afficher pour chaque morceau intégré')
    localTrackPrefabs: SceneObject[];

    // --- Remote Assets ---
    @input // Input might still need "Asset.RemoteReferenceAsset" string hint for editor, but type is RemoteReferenceAsset
    @hint('Remote: Liste des assets audio distants (RemoteReferenceAsset)')
    remoteTracks: RemoteReferenceAsset[]; // Changed type here

    @input
    @hint('Remote: Liste des noms d\'artistes correspondants aux morceaux distants')
    remoteArtists: string[];

    @input
    @hint('Remote: Liste des titres des morceaux distants')
    remoteTitles: string[];

    @input
    @hint('Remote: Liste des prefabs à afficher pour chaque morceau distant')
    remoteTrackPrefabs: SceneObject[];

    // --- Common Assets & Settings ---
    @input('SceneObject')
    @hint('Prefab à afficher lorsque la lecture est arrêtée')
    stoppedPrefab: SceneObject;

    @input('Component.Text')
    @hint('Texte pour afficher le nom de l\'artiste')
    artistNameText: Text;

    @input('Component.Text')
    @hint('Texte pour afficher le timecode actuel')
    timecodeText: Text;

    @input('Component.Text')
    @hint('Texte pour afficher le titre du morceau')
    trackTitleText: Text;

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

    @input('Component.ScriptComponent') // Corrected typo if ' dehydratedComponent' was one
    @hint('Bouton pour activer/désactiver le mode shuffle')
    shuffleButton: PinchButton;

    @input('Component.ScriptComponent')
    @hint('Bouton pour arrêter la lecture')
    stopButton: PinchButton;

    @input('SceneObject')
    @hint('Barre de progression')
    progressBar: SceneObject;

    @input('SceneObject')
    @hint('Sphère terrestre qui se déplace le long de la barre de progression')
    earthSphere: SceneObject;

    @input('Component.AudioComponent')
    @hint('Composant audio pour la lecture de musique')
    audioComponent: AudioComponent;

    @input('bool')
    @hint('Activer la lecture en boucle (retour au début après la dernière piste)')
    loopPlayback: boolean = true;

    @input('number')
    @hint('Décalage de la sphère terrestre sur l\'axe X')
    earthSphereXOffset: number = 0;

    @input('number')
    @hint('Vitesse de rotation de la sphère (degrés par seconde)')
    rotationSpeed: number = 30.0;

    // --- Private variables ---
    private allTracksData: TrackData[] = []; // Combined list of local and remote tracks
    private currentTrackIndex: number = -1; // -1 means no track loaded
    private isPlaying: boolean = false;
    private isPaused: boolean = false;
    private isRepeatEnabled: boolean = false;
    private isShuffleEnabled: boolean = false;
    private shouldAutoPlay: boolean = false; // Flag to auto-play after loading
    private isLoadingRemote: boolean = false; // Flag when downloading a remote asset
    private isManualStop: boolean = false; // Flag to prevent auto-next on manual stop
    private trackStartTime: number = 0;
    private currentPlaybackTime: number = 0;
    private audioInitialized: boolean = false; // True when audio track is loaded/downloaded and ready
    private currentActivePrefab: SceneObject | null = null;
    private lastPinchTime: number = 0; // For debounce

    // --- Callbacks ---
    private onPlayPauseCallback: (event: InteractorEvent) => void;
    private onNextTrackCallback: (event: InteractorEvent) => void;
    private onPrevTrackCallback: (event: InteractorEvent) => void;
    private onRepeatCallback: (event: InteractorEvent) => void;
    private onShuffleCallback: (event: InteractorEvent) => void;
    private onStopCallback: (event: InteractorEvent) => void;
    private onTrackFinishedCallback: (audioComponent: AudioComponent) => void;

    onAwake(): void {
        this.api.stopTrack = this.stopTrack.bind(this); // Expose stopTrack for external calls

        if (!this.validateInputs()) {
            print("MusicPlayerManager: Input validation failed. Aborting initialization.");
            return;
        }

        this.combineTrackData();

        if (this.allTracksData.length === 0) {
            print("MusicPlayerManager: No local or remote audio tracks provided.");
            // Allow initialization even with no tracks, UI might still be useful
        }

        // Disable all track-specific prefabs at startup
        this.allTracksData.forEach(track => {
            if (track.prefab) track.prefab.enabled = false;
        });
        if (this.stoppedPrefab) {
            this.stoppedPrefab.enabled = false;
        }

        this.setupCallbacks();
        this.setupProgressBar();

        this.createEvent("UpdateEvent").bind(() => {
            this.updatePlayer();
            this.updateSphereRotation();
        });

        this.updateActivePrefab(); // Show stopped state initially
        this.updateTrackInfo(); // Show stopped state initially

        print(`MusicPlayerManager initialized with ${this.localTracks?.length || 0} local and ${this.remoteTracks?.length || 0} remote tracks. Total: ${this.allTracksData.length}`);
    }

    private validateInputs(): boolean {
        let isValid = true;

        // Basic component checks
        if (!this.audioComponent) {
            print("Error: Audio component not defined in MusicPlayerManager.");
            isValid = false;
        }
        if (!this.earthSphere || !this.progressBar) {
            print("Warning: Progress visualization objects are not defined in MusicPlayerManager.");
            // Not critical, continue
        }

        // Local track validation
        const numLocalTracks = this.localTracks?.length || 0;
        if (numLocalTracks > 0) {
            if (!this.localArtists || this.localArtists.length !== numLocalTracks) {
                print(`Error: Mismatch between number of local tracks (${numLocalTracks}) and local artists (${this.localArtists?.length || 0}).`);
                isValid = false;
            }
            if (!this.localTitles || this.localTitles.length !== numLocalTracks) {
                print(`Error: Mismatch between number of local tracks (${numLocalTracks}) and local titles (${this.localTitles?.length || 0}).`);
                isValid = false;
            }
            if (!this.localTrackPrefabs || this.localTrackPrefabs.length !== numLocalTracks) {
                print(`Error: Mismatch between number of local tracks (${numLocalTracks}) and local prefabs (${this.localTrackPrefabs?.length || 0}).`);
                isValid = false;
            }
            if (this.localTracks.some(track => track == null)) {
                print("Error: One or more local tracks are not assigned.");
                isValid = false;
            }
             if (this.localTrackPrefabs.some(prefab => prefab == null)) {
                print("Error: One or more local track prefabs are not assigned.");
                isValid = false;
            }
        }

        // Remote track validation
        const numRemoteTracks = this.remoteTracks?.length || 0;
        if (numRemoteTracks > 0) {
             if (!this.remoteArtists || this.remoteArtists.length !== numRemoteTracks) {
                print(`Error: Mismatch between number of remote tracks (${numRemoteTracks}) and remote artists (${this.remoteArtists?.length || 0}).`);
                isValid = false;
            }
            if (!this.remoteTitles || this.remoteTitles.length !== numRemoteTracks) {
                print(`Error: Mismatch between number of remote tracks (${numRemoteTracks}) and remote titles (${this.remoteTitles?.length || 0}).`);
                isValid = false;
            }
            if (!this.remoteTrackPrefabs || this.remoteTrackPrefabs.length !== numRemoteTracks) {
                print(`Error: Mismatch between number of remote tracks (${numRemoteTracks}) and remote prefabs (${this.remoteTrackPrefabs?.length || 0}).`);
                isValid = false;
            }
             if (this.remoteTracks.some(track => track == null)) {
                print("Error: One or more remote tracks are not assigned.");
                isValid = false;
            }
             if (this.remoteTrackPrefabs.some(prefab => prefab == null)) {
                print("Error: One or more remote track prefabs are not assigned.");
                isValid = false;
            }
        }

        return isValid;
    }

    private combineTrackData(): void {
        this.allTracksData = [];

        // Add local tracks
        if (this.localTracks) {
            for (let i = 0; i < this.localTracks.length; i++) {
                // Ensure all required local data exists for this index
                if (this.localTracks[i] && this.localArtists?.[i] !== undefined && this.localTitles?.[i] !== undefined && this.localTrackPrefabs?.[i]) {
                    this.allTracksData.push({
                        asset: this.localTracks[i],
                        artist: this.localArtists[i],
                        title: this.localTitles[i],
                        prefab: this.localTrackPrefabs[i],
                        isRemote: false
                    });
                } else {
                     print(`Warning: Skipping local track at index ${i} due to missing data.`);
                }
            }
        }

        // Add remote tracks
        if (this.remoteTracks) {
             for (let i = 0; i < this.remoteTracks.length; i++) {
                // Ensure all required remote data exists for this index
                 if (this.remoteTracks[i] && this.remoteArtists?.[i] !== undefined && this.remoteTitles?.[i] !== undefined && this.remoteTrackPrefabs?.[i]) {
                    this.allTracksData.push({
                        asset: this.remoteTracks[i],
                        artist: this.remoteArtists[i],
                        title: this.remoteTitles[i],
                        prefab: this.remoteTrackPrefabs[i],
                        isRemote: true
                    });
                 } else {
                     print(`Warning: Skipping remote track at index ${i} due to missing data.`);
                 }
            }
        }
    }

    private setupCallbacks(): void {
        // Button callbacks (unchanged logic, just ensure buttons exist)
        if (this.playPauseButton) {
            this.onPlayPauseCallback = (event: InteractorEvent) => this.togglePlayPause();
            this.playPauseButton.onButtonPinched.add(this.onPlayPauseCallback);
        }
        if (this.nextTrackButton) {
            this.onNextTrackCallback = (event: InteractorEvent) => this.nextTrack();
            this.nextTrackButton.onButtonPinched.add(this.onNextTrackCallback);
        }
        if (this.prevTrackButton) {
            this.onPrevTrackCallback = (event: InteractorEvent) => this.prevTrack();
            this.prevTrackButton.onButtonPinched.add(this.onPrevTrackCallback);
        }
        if (this.repeatButton) {
            this.onRepeatCallback = (event: InteractorEvent) => {
                this.isRepeatEnabled = !this.isRepeatEnabled;
                print("Repeat " + (this.isRepeatEnabled ? "enabled" : "disabled"));
                // Add visual feedback for repeat button state if needed
            };
            this.repeatButton.onButtonPinched.add(this.onRepeatCallback);
        }
        if (this.shuffleButton) {
            this.onShuffleCallback = (event: InteractorEvent) => {
                this.isShuffleEnabled = !this.isShuffleEnabled;
                print("Shuffle mode " + (this.isShuffleEnabled ? "enabled" : "disabled"));
                 // Add visual feedback for shuffle button state if needed
            };
            this.shuffleButton.onButtonPinched.add(this.onShuffleCallback);
        }
        if (this.stopButton) {
            this.onStopCallback = (event: InteractorEvent) => this.stopTrack();
            this.stopButton.onButtonPinched.add(this.onStopCallback);
        }

        // Audio component finish callback
        this.setupTrackFinishedCallback();
    }

    private setupTrackFinishedCallback(): void {
        // Define the callback function
        this.onTrackFinishedCallback = (audioComponent: AudioComponent) => {
            // Extra safety check: only proceed if this callback is still relevant
            if (audioComponent !== this.audioComponent || this.isLoadingRemote) {
                print("Track finished callback ignored (component mismatch or loading remote).");
                return;
            }
            print("Track finished, handling next action");
            this.handleTrackFinished();
        };

        // Assign the callback if the audio component exists
        if (this.audioComponent) {
            this.audioComponent.setOnFinish(this.onTrackFinishedCallback);
        }
    }


    private handleTrackFinished(): void {
        print("Track finished event triggered");
         if (this.isPaused) {
            print("Track finished ignored due to paused state");
            return;
        }
        if (this.isManualStop) {
            print("Manual stop detected, skipping handleTrackFinished.");
            this.isManualStop = false; // Reset flag
            return;
        }
        if (this.isLoadingRemote) {
             print("Track finished ignored due to loading remote track state");
            return;
        }

        if (this.currentTrackIndex === -1 || this.allTracksData.length === 0) {
            print("Track finished but no track was loaded or no tracks available.");
            return; // Nothing to do
        }

        // Logic for what to do next
        if (this.isRepeatEnabled) {
            print("Repeat enabled: Reloading current track");
            this.loadTrack(this.currentTrackIndex); // Reloads and plays if was playing
        } else if (this.isShuffleEnabled) {
             print("Shuffle enabled: Loading random track");
             // Ensure not playing the same track twice in a row in shuffle if possible
            let nextIndex;
            if (this.allTracksData.length > 1) {
                do {
                    nextIndex = Math.floor(Math.random() * this.allTracksData.length);
                } while (nextIndex === this.currentTrackIndex);
            } else {
                nextIndex = 0; // Only one track, play it again
            }
            this.shouldAutoPlay = true; // Mark to auto-play after loading
            this.loadTrack(nextIndex);
        } else if (this.currentTrackIndex < this.allTracksData.length - 1) {
            // Play next track in sequence
            print("Playing next track in sequence");
            this.shouldAutoPlay = true; // Mark to auto-play after loading
            this.nextTrack(); // Calls loadTrack internally
        } else if (this.loopPlayback) {
             // End of list, loop back to the beginning
             print("End of playlist reached, looping back to start");
             this.shouldAutoPlay = true; // Mark to auto-play after loading
             this.loadTrack(0); // Load the first track
        }
        else {
            // End of list, no loop
            print("End of playlist reached, stopping playback.");
            this.stopTrack();
        }
    }

    // --- Prefab Management (Unchanged logic, uses allTracksData) ---
     private updateActivePrefab(): void {
        // Disable previously active prefab
        if (this.currentActivePrefab) {
            this.currentActivePrefab.enabled = false;
            this.currentActivePrefab = null;
        }

        // Enable new prefab based on current state
        if (this.currentTrackIndex === -1) {
            // Stopped state
            if (this.stoppedPrefab) {
                this.stoppedPrefab.enabled = true;
                this.currentActivePrefab = this.stoppedPrefab;
                print("Stopped prefab activated.");
            }
        } else if (this.currentTrackIndex >= 0 && this.currentTrackIndex < this.allTracksData.length) {
            // Active track state
            const currentTrackData = this.allTracksData[this.currentTrackIndex];
            if (currentTrackData && currentTrackData.prefab) {
                currentTrackData.prefab.enabled = true;
                this.currentActivePrefab = currentTrackData.prefab;
                print(`Prefab for track ${currentTrackData.title} activated.`);
            } else {
                 print(`Warning: No prefab found for track index ${this.currentTrackIndex}.`);
            }
        }
    }

    // --- Track Loading (Modified for Remote Assets) ---
    private loadTrack(index: number): void {
        if (this.isLoadingRemote) {
            print(`Load track (${index}) requested while another remote track is loading. Ignoring.`);
            return;
        }
        if (index < 0 || index >= this.allTracksData.length) {
            print(`Error: Invalid track index ${index} requested.`);
            this.stopTrack(); // Go to stopped state if index is invalid
            return;
        }

        const wasPlaying = this.isPlaying || this.shouldAutoPlay; // Preserve intent to play
        this.shouldAutoPlay = false; // Reset flag
        this.audioInitialized = false; // Mark as not ready
        this.isManualStop = false; // Reset manual stop flag

        // Stop current playback if any
        if (this.isPlaying || this.isPaused) {
             if (this.audioComponent.isPlaying() || this.audioComponent.isPaused()) {
                 this.audioComponent.stop(false); // Stop immediately without fade
             }
        }
        this.isPlaying = false;
        this.isPaused = false;
        this.currentPlaybackTime = 0; // Reset playback time

        // Clear the current track from the component first
        this.audioComponent.audioTrack = null;

        this.currentTrackIndex = index;
        const trackData = this.allTracksData[this.currentTrackIndex];
        this.updateTrackInfo(); // Update text fields immediately
        this.updateActivePrefab(); // Update visual prefab immediately

        print(`Loading track ${index}: ${trackData.title} (${trackData.isRemote ? 'Remote' : 'Local'})`);

        if (trackData.isRemote) {
            // --- Handle Remote Asset ---
            this.isLoadingRemote = true;
            const remoteAsset = trackData.asset as RemoteReferenceAsset; // Use direct type

            // Update UI to indicate loading (optional, e.g., change text)
            if (this.timecodeText) this.timecodeText.text = "Loading...";

            // --- Download Callback Definition ---
            const onDownloadedCallback = (downloadedAsset: Asset) => {
                // Check if the loaded track is still the intended one *inside* the callback
                if (this.currentTrackIndex !== index || !this.isLoadingRemote) {
                    print(`Remote asset download finished for track ${index}, but current target changed or loading cancelled. Ignoring.`);
                    this.isLoadingRemote = false; // Ensure flag is reset even if ignored
                    return;
                }

                this.isLoadingRemote = false; // Mark loading as complete *before* processing

                // Check the type using isOfType with the correct string
                if (downloadedAsset && downloadedAsset.isOfType("Asset.AudioTrackAsset")) {
                    // Cast using the direct type name
                    const audioTrack = downloadedAsset as AudioTrackAsset;
                    print(`Remote track ${trackData.title} downloaded successfully.`);
                    this.audioComponent.audioTrack = audioTrack;
                    this.setupTrackFinishedCallback(); // Re-attach finish callback
                    this.audioInitialized = true;
                    this.trackStartTime = getTime(); // Reset start time for playback
                    this.currentPlaybackTime = 0;

                    if (wasPlaying) {
                        print("Auto-playing downloaded track.");
                        // Use delayedCall slightly to ensure state is fully set before playing
                        this.delayedCall(0.05, () => this.playTrack());
                    } else {
                        print("Download complete, track ready.");
                        this.updatePlayer(); // Update timecode even if not playing yet
                    }
                } else {
                    print(`Error: Downloaded asset for track ${index} is not an AudioTrackAsset or is null.`);
                    this.handleLoadError(index, "Invalid asset type downloaded");
                }
            };

             // --- Download Failed Callback Definition ---
             const onFailedCallback = () => {
                // Check if the failure is still relevant
                if (this.currentTrackIndex !== index || !this.isLoadingRemote) {
                    print(`Remote asset download FAILED for track ${index}, but current target changed or loading cancelled. Ignoring failure.`);
                    this.isLoadingRemote = false; // Ensure flag is reset
                    return;
                }
                this.isLoadingRemote = false; // Mark loading as complete (failed)
                print(`Error: Failed to download remote track ${trackData.title}.`);
                this.handleLoadError(index, "Download failed");
            };

            // --- Initiate Download ---
            remoteAsset.downloadAsset(onDownloadedCallback, onFailedCallback);


        } else {
            // --- Handle Local Asset ---
            const localAsset = trackData.asset as AudioTrackAsset; // Use direct type
            this.audioComponent.audioTrack = localAsset;
            this.setupTrackFinishedCallback(); // Re-attach finish callback
            this.audioInitialized = true;
            this.trackStartTime = getTime();
            this.currentPlaybackTime = 0;
            print(`Local track ${trackData.title} loaded.`);

            if (wasPlaying) {
                 // Use delayedCall slightly for consistency maybe?
                 this.delayedCall(0.05, () => this.playTrack());
            } else {
                 this.updatePlayer(); // Update timecode even if not playing yet
            }
        }
    }

     // --- Added delayedCall helper ---
     private delayedCall(delay: number, callback: () => void): void {
        const delayEvent = this.createEvent("DelayedCallbackEvent"); // Use a unique event name
        const startTime = getTime();
        delayEvent.bind(() => {
            if (getTime() - startTime >= delay) {
                // print(`Delayed call executing after ${delay}s`);
                callback();
                delayEvent.enabled = false; // Disable event after execution
                // Optional: Consider destroying the event if Lens Studio allows script-created event destruction
            }
        });
         delayEvent.enabled = true; // Ensure event starts running
    }


    // Helper to handle errors during track loading/downloading
    private handleLoadError(failedIndex: number, reason: string): void {
         print(`Handling load error for track ${failedIndex}: ${reason}`);
         // Option 1: Stop playback cleanly
         this.stopTrack();

         // Option 2: Try to play the next track (could lead to infinite loop if many fail)
         // print("Attempting to skip to the next track.");
         // this.nextTrack(); // Be cautious with this approach

         // Update UI to show error
         if (this.artistNameText) this.artistNameText.text = "Error";
         if (this.trackTitleText) this.trackTitleText.text = "Load Failed";
         if (this.timecodeText) this.timecodeText.text = "--:-- / --:--";
    }


    // --- Playback Controls (Mostly unchanged logic, checks for initialization/loading added) ---

    private togglePlayPause(): void {
        const currentTime = getTime();
        if (currentTime - this.lastPinchTime < 0.5) return; // Debounce
        this.lastPinchTime = currentTime;

        if (this.isLoadingRemote) {
            print("Play/Pause ignored: Remote track is loading.");
            return;
        }
        if (this.allTracksData.length === 0) {
             print("Play/Pause ignored: No tracks available.");
            return;
        }

        print(`Toggle Play/Pause called - isPlaying: ${this.isPlaying}, isPaused: ${this.isPaused}, currentTrackIndex: ${this.currentTrackIndex}, audioInitialized: ${this.audioInitialized}`);

        if (this.isPlaying) {
            this.pauseTrack();
        } else { // Not currently playing (could be paused or stopped)
             if (this.currentTrackIndex === -1) {
                // If stopped, start with the first track
                print("No track loaded, starting first track");
                this.shouldAutoPlay = true; // Ensure it plays after loading
                this.loadTrack(0);
                // playTrack will be called by loadTrack if shouldAutoPlay is true and loading succeeds (via delayedCall)
            } else if (this.isPaused && this.audioInitialized) {
                 // If paused, resume
                 this.playTrack(); // Resumes
            } else if (!this.isPaused && this.audioInitialized) {
                 // If stopped but a track is loaded (e.g., after loading finished without autoplay)
                 this.playTrack(); // Starts from beginning
            } else {
                 print("Play ignored: Audio not initialized or unexpected state.");
                 // It might be that loadTrack is still in progress (local) or failed
            }
        }
    }

    private playTrack(): void {
        if (this.isLoadingRemote) {
            print("Play track ignored: Remote track is loading.");
            return;
        }
        if (!this.audioInitialized || !this.audioComponent || !this.audioComponent.audioTrack) {
             print("Cannot play track - Audio not initialized or track not set.");
             // Maybe try reloading if index is valid?
             if(this.currentTrackIndex !== -1 && !this.isLoadingRemote) {
                 print("Attempting to reload current track before playing.");
                 this.shouldAutoPlay = true;
                 this.loadTrack(this.currentTrackIndex);
             }
            return;
        }

        try {
            if (this.isPaused) {
                print("Resuming track: " + this.allTracksData[this.currentTrackIndex].title);
                this.audioComponent.resume();
                this.isPlaying = true;
                this.isPaused = false;
                // Adjust start time based on paused time
                this.trackStartTime = getTime() - this.currentPlaybackTime;
                print("Resumed at " + this.formatTime(this.currentPlaybackTime));
            } else if (!this.isPlaying) {
                // Start from beginning or current position if loadTrack just finished
                print("Starting track: " + this.allTracksData[this.currentTrackIndex].title);
                this.audioComponent.play(1); // Play once (finish callback handles repeat/next)
                this.isPlaying = true;
                this.isPaused = false;
                // trackStartTime and currentPlaybackTime should be set correctly by loadTrack
                if (this.currentPlaybackTime === 0) { // Ensure start time is correct if starting fresh
                     this.trackStartTime = getTime();
                } else { // Resuming from a specific point after load
                     this.trackStartTime = getTime() - this.currentPlaybackTime;
                }
            } else {
                 print("Play called but already playing.");
            }
        } catch (e) {
            print("Error executing play/resume: " + e);
            // Attempt to reset state
            this.isPlaying = false;
            this.isPaused = false;
            // Maybe try stopping completely
            this.stopTrack();
        }
    }

     private pauseTrack(): void {
         // Check if actually playing using the component's method
        if (!this.isPlaying || !this.audioComponent || !this.audioComponent.isPlaying()) {
            // print("Pause called but not currently playing (or component issue).");
            // If our state thinks it's playing but component says no, correct our state.
             if (this.isPlaying) {
                 // print("Correcting internal state: wasPlaying=true but component.isPlaying=false");
                 this.isPlaying = false;
                 // Assume it implicitly became paused or stopped, capture time based on our last known start
                 this.currentPlaybackTime = Math.max(0, getTime() - this.trackStartTime);
                 this.isPaused = true; // Tentatively mark as paused
             }
            return;
        }

        try {
            print("Attempting to pause track: " + this.allTracksData[this.currentTrackIndex].title);
            this.audioComponent.pause();
            // Update state AFTER successful API call (ideally)
            this.isPlaying = false;
            this.isPaused = true;
            // Record playback time immediately after pausing
            this.currentPlaybackTime = getTime() - this.trackStartTime;
            print("Track paused successfully at " + this.formatTime(this.currentPlaybackTime));
        } catch (e) {
            print("Error pausing track: " + e);
            // Force state update even on error, assuming pause might have partially worked or failed
             this.isPlaying = false;
             this.isPaused = true;
             // Try to capture time anyway
             this.currentPlaybackTime = Math.max(0, getTime() - this.trackStartTime);
        }
    }

     // Public stop method, also used internally
    public stopTrack(): void {
        print("Stop track called.");
        this.isManualStop = true; // Set flag to prevent handleTrackFinished from auto-playing next
        this.isLoadingRemote = false; // Cancel any pending load interpretation

        if (this.audioComponent) {
            // Check AudioComponent's state before calling stop
             if (this.audioComponent.isPlaying() || this.audioComponent.isPaused()) {
                print("Stopping AudioComponent playback.");
                 try {
                    this.audioComponent.stop(true); // Stop with fade if possible/configured
                 } catch (e) {
                     print("Error during audioComponent.stop(): " + e);
                 }
             } else {
                 // print("AudioComponent was not playing or paused when stopTrack was called.");
             }
             // It's crucial to clear the track AFTER stopping.
             this.audioComponent.audioTrack = null;
        } else {
            print("Stop called but no AudioComponent found.");
        }

        // Reset all playback states
        this.isPlaying = false;
        this.isPaused = false;
        this.shouldAutoPlay = false;
        this.currentTrackIndex = -1; // Mark as no track loaded
        this.audioInitialized = false;
        this.currentPlaybackTime = 0;

        // Update UI
        this.updateEarthPosition(0, 1); // Reset progress bar
        this.updateTrackInfo(); // Update text displays to "Stopped"
        this.updateActivePrefab(); // Show stopped prefab

        print("Playback fully stopped and state reset.");
        // isManualStop will be reset naturally when the next track loads/plays
    }


    private nextTrack(): void {
        if (this.isLoadingRemote) {
             print("Next track ignored: Remote track is loading.");
            return;
        }
         if (this.allTracksData.length === 0) {
            print("Next track ignored: No tracks available.");
            return;
        }
        print("Next track triggered");

        const wasPlaying = this.isPlaying || this.shouldAutoPlay;
        let nextIndex;

        if (this.isRepeatEnabled) {
             // If repeat is on, "next" just reloads the current track
             nextIndex = this.currentTrackIndex;
             print("Repeat enabled, reloading current track index: " + nextIndex);
             if (nextIndex === -1) nextIndex = 0; // Handle case where repeat is on but nothing playing
        } else if (this.isShuffleEnabled) {
            // Shuffle: pick a random index, avoiding current if possible
            if (this.allTracksData.length > 1) {
                do {
                    nextIndex = Math.floor(Math.random() * this.allTracksData.length);
                } while (nextIndex === this.currentTrackIndex);
            } else {
                nextIndex = 0; // Only one track
            }
            print("Shuffle enabled, next random index: " + nextIndex);
        } else {
            // Sequential: Increment index
             nextIndex = (this.currentTrackIndex === -1) ? 0 : this.currentTrackIndex + 1; // Start from 0 if stopped
            if (nextIndex >= this.allTracksData.length) {
                 // Reached the end
                 if (this.loopPlayback) {
                     nextIndex = 0; // Loop back to start
                     print("Reached end, looping back to index: " + nextIndex);
                 } else {
                     print("Reached end, no loop. Stopping.");
                     this.stopTrack(); // Stop if not looping
                     return; // Exit function
                 }
             } else {
                 print("Next sequential index: " + nextIndex);
             }
        }

        // Ensure nextIndex is valid before proceeding
        if (nextIndex < 0 || nextIndex >= this.allTracksData.length) {
             print(`Calculated next index (${nextIndex}) is invalid. Stopping.`);
             this.stopTrack();
             return;
        }

        if (nextIndex !== this.currentTrackIndex || this.isRepeatEnabled || this.currentTrackIndex === -1 ) { // Load if index changed, or repeat is on, or was stopped
            if (wasPlaying) {
                this.shouldAutoPlay = true; // Mark to play after load
            }
            this.loadTrack(nextIndex);
        } else {
            // This case should ideally not happen with the logic above, but is a safeguard
             print("Next track resulted in the same index and repeat/shuffle off. No action taken.");
        }
    }

    private prevTrack(): void {
         if (this.isLoadingRemote) {
            print("Previous track ignored: Remote track is loading.");
            return;
        }
         if (this.allTracksData.length === 0) {
            print("Previous track ignored: No tracks available.");
            return;
        }
        print("Previous track triggered");

        const wasPlaying = this.isPlaying || this.shouldAutoPlay;
        let prevIndex;

        if (this.isRepeatEnabled) {
            // If repeat is on, "prev" just reloads the current track
            prevIndex = this.currentTrackIndex;
            print("Repeat enabled, reloading current track index: " + prevIndex);
             if (prevIndex === -1) prevIndex = this.allTracksData.length - 1; // Handle case where repeat is on but nothing playing
        } else if (this.isShuffleEnabled) {
             // Shuffle: pick a random index, avoiding current if possible
             if (this.allTracksData.length > 1) {
                do {
                    prevIndex = Math.floor(Math.random() * this.allTracksData.length);
                } while (prevIndex === this.currentTrackIndex);
            } else {
                prevIndex = 0; // Only one track
            }
             print("Shuffle enabled, previous random index: " + prevIndex);
        } else {
             // Sequential: Decrement index
             prevIndex = (this.currentTrackIndex === -1) ? this.allTracksData.length - 1 : this.currentTrackIndex - 1; // Go to last if stopped
             if (prevIndex < 0) {
                 // Reached the beginning
                 if (this.loopPlayback) {
                     prevIndex = this.allTracksData.length - 1; // Loop back to end
                     print("Reached start, looping back to index: " + prevIndex);
                 } else {
                      print("Reached start, no loop. Stopping.");
                      // Optionally, could just stay on the first track instead of stopping
                      this.stopTrack();
                      return; // Exit function
                 }
             } else {
                 print("Previous sequential index: " + prevIndex);
             }
        }

         // Ensure prevIndex is valid before proceeding
        if (prevIndex < 0 || prevIndex >= this.allTracksData.length) {
             print(`Calculated previous index (${prevIndex}) is invalid. Stopping.`);
             this.stopTrack();
             return;
        }


         if (prevIndex !== this.currentTrackIndex || this.isRepeatEnabled || this.currentTrackIndex === -1) { // Load if index changed, or repeat is on, or was stopped
            if (wasPlaying) {
                this.shouldAutoPlay = true; // Mark to play after load
            }
            this.loadTrack(prevIndex);
        } else {
             print("Previous track resulted in the same index and repeat/shuffle off. No action taken.");
        }
    }


    // --- UI Updates (Unchanged logic, uses allTracksData and checks states) ---

    private updateTrackInfo(): void {
        if (this.currentTrackIndex === -1) {
            if (this.artistNameText) this.artistNameText.text = ""; // Clear artist on stop
            if (this.trackTitleText) this.trackTitleText.text = "Stopped";
        } else if (this.currentTrackIndex >= 0 && this.currentTrackIndex < this.allTracksData.length) {
            const trackData = this.allTracksData[this.currentTrackIndex];
            if (this.artistNameText) this.artistNameText.text = trackData.artist;
            if (this.trackTitleText) this.trackTitleText.text = trackData.title;
             // Add loading indicator if needed
             if (this.isLoadingRemote && this.timecodeText) {
                // Keep loading text only if timecode exists
                // this.timecodeText.text = "Loading..."; // This might overwrite valid time briefly before load starts
             }
        } else {
             // Should not happen, but handle gracefully
             if (this.artistNameText) this.artistNameText.text = "Error";
             if (this.trackTitleText) this.trackTitleText.text = "Invalid Track";
        }
         // Explicitly update timecode display here too, especially for stopped state
        if (this.currentTrackIndex === -1 || this.isLoadingRemote) {
             if (this.timecodeText) {
                 this.timecodeText.text = this.isLoadingRemote ? "Loading..." : "00:00 / 00:00";
             }
             this.updateEarthPosition(0, 1);
        }
    }

     private updatePlayer(): void {
        // Don't update timecode if loading remote track, handled by updateTrackInfo
        if (this.isLoadingRemote) {
             // Ensure sphere is at start while loading
             this.updateEarthPosition(0, 1);
            return;
        }

         // Update only if audio is initialized and component/track exist
         if (!this.audioInitialized || !this.audioComponent || !this.audioComponent.audioTrack) {
             // Show 00:00 / 00:00 if stopped or not ready, handled by updateTrackInfo
            if (this.currentTrackIndex === -1 && this.timecodeText && this.timecodeText.text !== "00:00 / 00:00") {
                 this.timecodeText.text = "00:00 / 00:00";
            }
            this.updateEarthPosition(0, 1); // Ensure sphere is at start
            return;
        }

        // Proceed with timecode and progress update
        if (this.timecodeText) {
            let currentTime = 0;
            let totalTime = 0;

            try {
                // Get duration - might be 0 initially, handle gracefully
                totalTime = this.audioComponent.duration || 0;

                // Use component's position if available and reliable, otherwise calculate manually
                // Note: audioComponent.position might not always be accurate, especially during seeks or state changes. Manual calculation is often safer.
                if (this.isPlaying) {
                    currentTime = getTime() - this.trackStartTime;
                     // Clamp currentTime to duration only if duration is valid
                     if (totalTime > 0 && currentTime > totalTime) {
                         currentTime = totalTime;
                         // Potential place to trigger track finished logic slightly early if needed
                     }
                } else { // Paused or just loaded
                    currentTime = this.currentPlaybackTime;
                }


                // Ensure currentTime is not negative
                 currentTime = Math.max(0, currentTime);
                 // Also ensure currentTime doesn't exceed valid duration
                 if (totalTime > 0) {
                     currentTime = Math.min(currentTime, totalTime);
                 }


                // Format and display time
                 this.timecodeText.text = `${this.formatTime(currentTime)} / ${this.formatTime(totalTime)}`;

                // Update progress bar sphere
                 this.updateEarthPosition(currentTime, totalTime);

            } catch (e) {
                print("Error updating player time/progress: " + e);
                // Fallback display
                if (this.timecodeText) {
                    this.timecodeText.text = "--:-- / --:--";
                }
                this.updateEarthPosition(0, 1); // Reset sphere on error
            }
        } else {
             // If no timecode text, still update position based on internal state
             let currentTime = 0;
             let totalTime = this.audioComponent?.duration || 0;
              if (this.isPlaying) {
                    currentTime = getTime() - this.trackStartTime;
                     if (totalTime > 0) currentTime = Math.min(currentTime, totalTime);
                } else {
                    currentTime = this.currentPlaybackTime;
                }
                currentTime = Math.max(0, currentTime);
                 this.updateEarthPosition(currentTime, totalTime);
        }
    }

    private updateEarthPosition(currentTime: number, totalTime: number): void {
         if (this.earthSphere && this.progressBar) {
             // Ensure totalTime is valid for division
             let progress = (totalTime > 0) ? (currentTime / totalTime) : 0;
             progress = Math.max(0, Math.min(1, progress)); // Clamp progress between 0 and 1

             try {
                const barTransform = this.progressBar.getTransform();
                // Using world scale/position might be more robust if parenting changes
                const barScale = barTransform.getWorldScale();
                const barPosition = barTransform.getWorldPosition(); // Using world position
                const barRotation = barTransform.getWorldRotation(); // Use world rotation to orient axis

                const earthTransform = this.earthSphere.getTransform();

                // Calculate the start and end points of the bar in world space along its local X-axis
                const halfLength = barScale.x / 2;
                const xAxis = barRotation.multiplyVec3(vec3.right()); // Direction of the bar's X-axis in world space

                const startPoint = barPosition.sub(xAxis.uniformScale(halfLength));
                const endPoint = barPosition.add(xAxis.uniformScale(halfLength));

                // Calculate the target position based on progress
                // targetPosition = startPoint + (endPoint - startPoint) * progress
                const targetPosition = startPoint.add(endPoint.sub(startPoint).uniformScale(progress));

                 // Add the X offset relative to the bar's orientation
                 const xOffsetVector = xAxis.uniformScale(this.earthSphereXOffset);
                 const finalPosition = targetPosition.add(xOffsetVector);


                // Set the sphere's world position
                 earthTransform.setWorldPosition(finalPosition);

             } catch (e) {
                 print("Error updating sphere position: " + e);
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

    // --- Rotation and Cleanup (Unchanged) ---
     private setupProgressBar(): void {
         // Initialize sphere position at the start of the progress bar
         if (this.progressBar && this.earthSphere) {
             this.updateEarthPosition(0, 1); // Position at 0 progress initially
         }
     }

     private updateSphereRotation(): void {
         if (this.earthSphere) {
             const deltaTime = getDeltaTime();
             const earthTransform = this.earthSphere.getTransform();
             const currentRotation = earthTransform.getLocalRotation();

             // Rotate around its local Y-axis
             const rotationDelta = quat.fromEulerAngles(0, this.rotationSpeed * deltaTime * (Math.PI / 180), 0);
             const newRotation = currentRotation.multiply(rotationDelta); // Apply rotation relative to current

             earthTransform.setLocalRotation(newRotation);
         }
     }

     // --- Public methods for external access (e.g., ToggleVisibilityController) ---
    public getCurrentTrackIndex(): number {
        return this.currentTrackIndex;
    }

    // Return the prefab associated with a given *overall* index
    public getTrackPrefab(index: number): SceneObject | null {
        if (index >= 0 && index < this.allTracksData.length) {
            return this.allTracksData[index].prefab;
        }
        return null;
    }

    // --- Destruction ---
    onDestroy(): void {
        print("MusicPlayerManager onDestroy called.");
        // Stop playback
        if (this.audioComponent && (this.isPlaying || this.isPaused)) {
             try {
                this.audioComponent.stop(false); // Stop immediately on destroy
             } catch (e) {
                 print("Error stopping audio on destroy: " + e);
             }
        }

        // Remove callbacks from buttons
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

        // Remove callback from audio component
        if (this.audioComponent) {
            try {
                 this.audioComponent.setOnFinish(null);
            } catch (e) {
                 print("Error setting setOnFinish(null) on destroy: " + e);
            }
        }

         // Disable prefabs (optional cleanup)
        this.allTracksData.forEach(track => {
            if (track.prefab) track.prefab.enabled = false;
        });
        if (this.stoppedPrefab) {
            this.stoppedPrefab.enabled = false;
        }
    }
}