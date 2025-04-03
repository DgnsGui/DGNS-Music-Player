import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { InteractorEvent } from 'SpectaclesInteractionKit/Core/Interactor/InteractorEvent';

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
    @input
    @hint('Remote: Liste des assets audio distants (RemoteReferenceAsset)')
    remoteTracks: RemoteReferenceAsset[];

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

    @input('Component.ScriptComponent')
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
    private allTracksData: TrackData[] = [];
    private currentTrackIndex: number = -1;
    private isPlaying: boolean = false;
    private isPaused: boolean = false;
    private isRepeatEnabled: boolean = false;
    private isShuffleEnabled: boolean = false;
    private shouldAutoPlay: boolean = false; // *** Crucial flag: Set by caller (button press, auto-advance) to indicate intent to play after load ***
    private isLoadingRemote: boolean = false;
    private isManualStop: boolean = false;
    private trackStartTime: number = 0;
    private currentPlaybackTime: number = 0;
    private audioInitialized: boolean = false;
    private currentActivePrefab: SceneObject | null = null;
    private lastPinchTimePlayPause: number = 0; // Debounce timers
    private lastPinchTimeNext: number = 0;
    private lastPinchTimePrev: number = 0;
    private readonly DEBOUNCE_PLAYPAUSE = 0.5; // 500ms
    private readonly DEBOUNCE_NEXTPREV = 0.3; // 300ms

    // --- Callbacks ---
    private onPlayPauseCallback: (event: InteractorEvent) => void;
    private onNextTrackCallback: (event: InteractorEvent) => void;
    private onPrevTrackCallback: (event: InteractorEvent) => void;
    private onRepeatCallback: (event: InteractorEvent) => void;
    private onShuffleCallback: (event: InteractorEvent) => void;
    private onStopCallback: (event: InteractorEvent) => void;
    private onTrackFinishedCallback: (audioComponent: AudioComponent) => void;

    onAwake(): void {
        this.api.stopTrack = this.stopTrack.bind(this);

        if (!this.validateInputs()) {
            print("MusicPlayerManager: Input validation failed. Aborting initialization.");
            return;
        }

        this.combineTrackData();

        if (this.allTracksData.length === 0) {
            print("MusicPlayerManager: No local or remote audio tracks provided.");
        }

        this.disableAllPrefabs();
        this.setupCallbacks();
        this.setupProgressBar();

        this.createEvent("UpdateEvent").bind(() => {
            this.updatePlayer();
            this.updateSphereRotation();
        });

        this.updateActivePrefab();
        this.updateTrackInfo();

        print(`MusicPlayerManager initialized with ${this.localTracks?.length || 0} local and ${this.remoteTracks?.length || 0} remote tracks. Total: ${this.allTracksData.length}`);
    }

    private disableAllPrefabs(): void {
        this.allTracksData.forEach(track => {
            if (track.prefab) track.prefab.enabled = false;
        });
        if (this.stoppedPrefab) {
            this.stoppedPrefab.enabled = false;
        }
    }

    private validateInputs(): boolean {
        // (Validation logic remains the same as previous version)
        let isValid = true;
        if (!this.audioComponent) { print("Error: Audio component not defined."); isValid = false; }
        if (!this.earthSphere || !this.progressBar) { print("Warning: Progress visualization objects not defined."); }
        const numLocalTracks = this.localTracks?.length || 0;
        if (numLocalTracks > 0) {
            if (!this.localArtists || this.localArtists.length !== numLocalTracks) { print(`Error: Mismatch local tracks (${numLocalTracks}) and artists (${this.localArtists?.length || 0}).`); isValid = false; }
            if (!this.localTitles || this.localTitles.length !== numLocalTracks) { print(`Error: Mismatch local tracks (${numLocalTracks}) and titles (${this.localTitles?.length || 0}).`); isValid = false; }
            if (!this.localTrackPrefabs || this.localTrackPrefabs.length !== numLocalTracks) { print(`Error: Mismatch local tracks (${numLocalTracks}) and prefabs (${this.localTrackPrefabs?.length || 0}).`); isValid = false; }
            if (this.localTracks.some(track => track == null)) { print("Error: One or more local tracks are null."); isValid = false; }
            if (this.localTrackPrefabs.some(prefab => prefab == null)) { print("Error: One or more local prefabs are null."); isValid = false; }
        }
        const numRemoteTracks = this.remoteTracks?.length || 0;
        if (numRemoteTracks > 0) {
            if (!this.remoteArtists || this.remoteArtists.length !== numRemoteTracks) { print(`Error: Mismatch remote tracks (${numRemoteTracks}) and artists (${this.remoteArtists?.length || 0}).`); isValid = false; }
            if (!this.remoteTitles || this.remoteTitles.length !== numRemoteTracks) { print(`Error: Mismatch remote tracks (${numRemoteTracks}) and titles (${this.remoteTitles?.length || 0}).`); isValid = false; }
            if (!this.remoteTrackPrefabs || this.remoteTrackPrefabs.length !== numRemoteTracks) { print(`Error: Mismatch remote tracks (${numRemoteTracks}) and prefabs (${this.remoteTrackPrefabs?.length || 0}).`); isValid = false; }
            if (this.remoteTracks.some(track => track == null)) { print("Error: One or more remote tracks are null."); isValid = false; }
            if (this.remoteTrackPrefabs.some(prefab => prefab == null)) { print("Error: One or more remote prefabs are null."); isValid = false; }
        }
        return isValid;
    }

    private combineTrackData(): void {
        // (Combine logic remains the same as previous version)
        this.allTracksData = [];
        if (this.localTracks) {
            for (let i = 0; i < this.localTracks.length; i++) {
                if (this.localTracks[i] && this.localArtists?.[i] !== undefined && this.localTitles?.[i] !== undefined && this.localTrackPrefabs?.[i]) {
                    this.allTracksData.push({ asset: this.localTracks[i], artist: this.localArtists[i], title: this.localTitles[i], prefab: this.localTrackPrefabs[i], isRemote: false });
                } else { print(`Warning: Skipping local track at index ${i} due to missing data.`); }
            }
        }
        if (this.remoteTracks) {
            for (let i = 0; i < this.remoteTracks.length; i++) {
                if (this.remoteTracks[i] && this.remoteArtists?.[i] !== undefined && this.remoteTitles?.[i] !== undefined && this.remoteTrackPrefabs?.[i]) {
                    this.allTracksData.push({ asset: this.remoteTracks[i], artist: this.remoteArtists[i], title: this.remoteTitles[i], prefab: this.remoteTrackPrefabs[i], isRemote: true });
                } else { print(`Warning: Skipping remote track at index ${i} due to missing data.`); }
            }
        }
    }

    private setupCallbacks(): void {
        // Assign callbacks with debounce checks integrated
        if (this.playPauseButton) {
            this.onPlayPauseCallback = (event: InteractorEvent) => {
                const currentTime = getTime();
                if (currentTime - this.lastPinchTimePlayPause < this.DEBOUNCE_PLAYPAUSE) return;
                this.lastPinchTimePlayPause = currentTime;
                this.togglePlayPause();
            };
            this.playPauseButton.onButtonPinched.add(this.onPlayPauseCallback);
        }
        if (this.nextTrackButton) {
            this.onNextTrackCallback = (event: InteractorEvent) => {
                 const currentTime = getTime();
                if (currentTime - this.lastPinchTimeNext < this.DEBOUNCE_NEXTPREV) return;
                this.lastPinchTimeNext = currentTime;
                this.nextTrack();
            };
            this.nextTrackButton.onButtonPinched.add(this.onNextTrackCallback);
        }
        if (this.prevTrackButton) {
            this.onPrevTrackCallback = (event: InteractorEvent) => {
                 const currentTime = getTime();
                if (currentTime - this.lastPinchTimePrev < this.DEBOUNCE_NEXTPREV) return;
                this.lastPinchTimePrev = currentTime;
                this.prevTrack();
            };
            this.prevTrackButton.onButtonPinched.add(this.onPrevTrackCallback);
        }
        // Other buttons (repeat, shuffle, stop) - debounce less critical but can be added if needed
         if (this.repeatButton) {
            this.onRepeatCallback = (event: InteractorEvent) => {
                this.isRepeatEnabled = !this.isRepeatEnabled;
                print("Repeat " + (this.isRepeatEnabled ? "enabled" : "disabled"));
                if (this.isRepeatEnabled) this.isShuffleEnabled = false; // Conventionally, repeat overrides shuffle
            };
            this.repeatButton.onButtonPinched.add(this.onRepeatCallback);
        }
        if (this.shuffleButton) {
            this.onShuffleCallback = (event: InteractorEvent) => {
                this.isShuffleEnabled = !this.isShuffleEnabled;
                print("Shuffle mode " + (this.isShuffleEnabled ? "enabled" : "disabled"));
                 if (this.isShuffleEnabled) this.isRepeatEnabled = false; // Shuffle overrides repeat
            };
            this.shuffleButton.onButtonPinched.add(this.onShuffleCallback);
        }
        if (this.stopButton) {
            this.onStopCallback = (event: InteractorEvent) => this.stopTrack();
            this.stopButton.onButtonPinched.add(this.onStopCallback);
        }

        this.setupTrackFinishedCallback();
    }

    private setupTrackFinishedCallback(): void {
        this.onTrackFinishedCallback = (audioComponent: AudioComponent) => {
            if (audioComponent !== this.audioComponent || this.isLoadingRemote || this.isManualStop || this.isPaused) {
                // print("Track finished callback ignored (mismatch, loading, manual stop, or paused).");
                if(this.isManualStop) this.isManualStop = false; // Reset flag if it blocked here
                return;
            }
            print("Track finished event detected, handling auto-advance.");
            this.handleTrackFinished();
        };
        if (this.audioComponent) {
            this.audioComponent.setOnFinish(this.onTrackFinishedCallback);
        }
    }


    // --- Auto-Advance Logic ---
    private handleTrackFinished(): void {
        print("Handle Track Finished - Determining next action.");

        if (this.currentTrackIndex === -1 || this.allTracksData.length === 0) {
            print("Track finished but no track was loaded or no tracks available. Stopping.");
            this.stopTrack();
            return;
        }

        // *** Always set the intent to play the *next* track ***
        this.shouldAutoPlay = true;

        if (this.isRepeatEnabled) {
            print("Repeat enabled: Reloading current track.");
            this.loadTrack(this.currentTrackIndex); // loadTrack will use shouldAutoPlay
        } else if (this.isShuffleEnabled) {
            print("Shuffle enabled: Loading random track.");
            let nextIndex;
            if (this.allTracksData.length > 1) {
                do {
                    nextIndex = Math.floor(Math.random() * this.allTracksData.length);
                } while (nextIndex === this.currentTrackIndex);
            } else {
                nextIndex = 0;
            }
            this.loadTrack(nextIndex); // loadTrack will use shouldAutoPlay
        } else {
            // Sequential Play
            let nextIndex = this.currentTrackIndex + 1;
             if (nextIndex >= this.allTracksData.length) {
                 // Reached end
                 if (this.loopPlayback) {
                     print("End of playlist reached, looping back to start.");
                     this.loadTrack(0); // loadTrack will use shouldAutoPlay
                 } else {
                     print("End of playlist reached, no loop. Stopping.");
                     this.shouldAutoPlay = false; // Override intent, we are stopping.
                     this.stopTrack();
                 }
             } else {
                  print("Playing next track in sequence.");
                  this.loadTrack(nextIndex); // loadTrack will use shouldAutoPlay
             }
        }
    }

    // --- Prefab Management (Unchanged) ---
     private updateActivePrefab(): void {
        if (this.currentActivePrefab) {
            this.currentActivePrefab.enabled = false;
            this.currentActivePrefab = null;
        }
        if (this.currentTrackIndex === -1) {
            if (this.stoppedPrefab) {
                this.stoppedPrefab.enabled = true;
                this.currentActivePrefab = this.stoppedPrefab;
            }
        } else if (this.currentTrackIndex >= 0 && this.currentTrackIndex < this.allTracksData.length) {
            const currentTrackData = this.allTracksData[this.currentTrackIndex];
            if (currentTrackData && currentTrackData.prefab) {
                currentTrackData.prefab.enabled = true;
                this.currentActivePrefab = currentTrackData.prefab;
            }
        }
    }

    // --- Track Loading (Crucial: Uses shouldAutoPlay flag) ---
    private loadTrack(index: number): void {
        if (this.isLoadingRemote) {
            print(`Load track (${index}) requested while another remote track is loading. Ignoring.`);
            return;
        }
        if (index < 0 || index >= this.allTracksData.length) {
            print(`Error: Invalid track index ${index} requested.`);
            this.stopTrack();
            return;
        }

        // *** Capture the caller's intent (shouldAutoPlay was set BEFORE calling loadTrack) ***
        const playAfterLoad = this.shouldAutoPlay;
        this.shouldAutoPlay = false; // Consume the flag for this load operation

        this.audioInitialized = false;
        this.isManualStop = false; // Reset manual stop flag on any new load

        // Stop current playback cleanly *before* changing track index or clearing audioTrack
        if (this.isPlaying || this.isPaused) {
             if (this.audioComponent.isPlaying() || this.audioComponent.isPaused()) {
                 try { this.audioComponent.stop(false); } catch(e){} // Stop immediately
             }
        }
        this.isPlaying = false;
        this.isPaused = false;
        this.currentPlaybackTime = 0;
        this.audioComponent.audioTrack = null; // Clear track *after* stopping

        // Set the new index and update UI immediately
        this.currentTrackIndex = index;
        const trackData = this.allTracksData[this.currentTrackIndex];
        this.updateTrackInfo(); // Shows loading text if remote
        this.updateActivePrefab();

        print(`Loading track ${index}: ${trackData.title} (${trackData.isRemote ? 'Remote' : 'Local'}) - Intent to play: ${playAfterLoad}`);

        if (trackData.isRemote) {
            this.isLoadingRemote = true;
            const remoteAsset = trackData.asset as RemoteReferenceAsset;
            if (this.timecodeText) this.timecodeText.text = "Loading..."; // Ensure loading text

            const onDownloadedCallback = (downloadedAsset: Asset) => {
                if (this.currentTrackIndex !== index || !this.isLoadingRemote) { /* Check relevance */ return; }
                this.isLoadingRemote = false;
                if (downloadedAsset && downloadedAsset.isOfType("Asset.AudioTrackAsset")) {
                    const audioTrack = downloadedAsset as AudioTrackAsset;
                    print(`Remote track ${trackData.title} downloaded.`);
                    this.audioComponent.audioTrack = audioTrack;
                    this.setupTrackFinishedCallback(); // Re-attach
                    this.audioInitialized = true;
                    this.trackStartTime = getTime();
                    this.currentPlaybackTime = 0;
                    if (playAfterLoad) { // *** Use the captured intent ***
                        this.delayedCall(0.05, () => this.playTrack());
                    } else { this.updatePlayer(); } // Update UI even if not playing
                } else { /* Handle error */ this.handleLoadError(index, "Invalid asset type"); }
            };
             const onFailedCallback = () => {
                if (this.currentTrackIndex !== index || !this.isLoadingRemote) { /* Check relevance */ return; }
                this.isLoadingRemote = false;
                 /* Handle error */ this.handleLoadError(index, "Download failed");
            };
            remoteAsset.downloadAsset(onDownloadedCallback, onFailedCallback);
        } else {
            // Local Asset
            const localAsset = trackData.asset as AudioTrackAsset;
            this.audioComponent.audioTrack = localAsset;
            this.setupTrackFinishedCallback(); // Re-attach
            this.audioInitialized = true;
            this.trackStartTime = getTime();
            this.currentPlaybackTime = 0;
            print(`Local track ${trackData.title} loaded.`);
            if (playAfterLoad) { // *** Use the captured intent ***
                 this.delayedCall(0.05, () => this.playTrack());
            } else { this.updatePlayer(); } // Update UI even if not playing
        }
    }

     private delayedCall(delay: number, callback: () => void): void {
        const delayEvent = this.createEvent("DelayedCallbackEvent_" + Math.random()); // More unique name
        const startTime = getTime();
        delayEvent.bind(() => {
            if (getTime() - startTime >= delay) {
                callback();
                delayEvent.enabled = false;
            }
        });
         delayEvent.enabled = true;
    }

    private handleLoadError(failedIndex: number, reason: string): void {
         print(`Handling load error for track ${failedIndex}: ${reason}`);
         this.stopTrack(); // Go to a known safe state
         if (this.artistNameText) this.artistNameText.text = "Error";
         if (this.trackTitleText) this.trackTitleText.text = "Load Failed";
         if (this.timecodeText) this.timecodeText.text = "--:-- / --:--";
    }


    // --- Playback Controls ---

    private togglePlayPause(): void {
        // Debounce handled in setupCallbacks
        if (this.isLoadingRemote) { print("Play/Pause ignored: Loading remote."); return; }
        if (this.allTracksData.length === 0) { print("Play/Pause ignored: No tracks."); return; }

        print(`Toggle Play/Pause called - State: ${this.isPlaying ? 'Playing' : (this.isPaused ? 'Paused' : 'Stopped')}, Index: ${this.currentTrackIndex}, Initialized: ${this.audioInitialized}`);

        if (this.isPlaying) {
            this.pauseTrack();
        } else { // Not currently playing (paused or stopped)
             if (this.currentTrackIndex === -1) {
                // Stopped: Load and play the first track
                print("Starting playback from stopped state.");
                this.shouldAutoPlay = true; // *** Set intent to play ***
                this.loadTrack(0);
            } else if (this.isPaused && this.audioInitialized) {
                 // Paused: Resume
                 this.playTrack(); // playTrack handles resuming
            } else if (!this.isPaused && this.audioInitialized) {
                 // Stopped but a track is loaded/initialized: Play it
                 this.playTrack();
            } else {
                 // Waiting for initialization or other state
                 print("Play ignored: Audio not ready or unexpected state.");
                 // Maybe try reloading? Could be risky. Let's rely on loadTrack finishing.
            }
        }
    }

    private playTrack(): void {
        if (this.isLoadingRemote) { print("Play track ignored: Loading remote."); return; }
        if (!this.audioInitialized || !this.audioComponent || !this.audioComponent.audioTrack) {
             print("Cannot play track - Audio not initialized or track not set.");
             // If an index is set, maybe try reloading with intent to play?
              if(this.currentTrackIndex !== -1) {
                  print("Attempting to reload current track with play intent.");
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
                this.trackStartTime = getTime() - this.currentPlaybackTime; // Adjust start time
            } else if (!this.isPlaying) {
                print("Starting track: " + this.allTracksData[this.currentTrackIndex].title);
                this.audioComponent.play(1); // Play once
                this.isPlaying = true;
                this.isPaused = false;
                // Reset start time and playback time for a fresh play
                this.trackStartTime = getTime();
                this.currentPlaybackTime = 0;
            }
             // If already playing, do nothing.
        } catch (e) {
            print("Error executing play/resume: " + e);
            this.handleLoadError(this.currentTrackIndex, "Playback error");
        }
    }

     private pauseTrack(): void {
        if (!this.isPlaying || !this.audioComponent || !this.audioComponent.isPlaying()) {
             // print("Pause called but not playing.");
             if(this.isPlaying) this.isPlaying = false; // Correct internal state if needed
            return;
        }
        try {
            this.audioComponent.pause();
            this.currentPlaybackTime = getTime() - this.trackStartTime; // Capture time *before* changing state
            this.isPlaying = false;
            this.isPaused = true;
            print("Track paused at " + this.formatTime(this.currentPlaybackTime));
        } catch (e) {
            print("Error pausing track: " + e);
            // Try to force state anyway
             this.currentPlaybackTime = Math.max(0, getTime() - this.trackStartTime);
             this.isPlaying = false;
             this.isPaused = true;
        }
    }

    public stopTrack(): void {
        print("Stop track called.");
        this.isManualStop = true; // Prevent auto-advance from finish callback
        this.isLoadingRemote = false; // Cancel loading interpretation

        if (this.audioComponent) {
            if (this.audioComponent.isPlaying() || this.audioComponent.isPaused()) {
                 try { this.audioComponent.stop(true); } catch (e) { print("Error stopping audio: " + e); }
             }
             this.audioComponent.audioTrack = null;
        }

        // Reset states
        this.isPlaying = false;
        this.isPaused = false;
        this.shouldAutoPlay = false; // Explicitly clear intent
        this.currentTrackIndex = -1;
        this.audioInitialized = false;
        this.currentPlaybackTime = 0;

        // Update UI
        this.updateEarthPosition(0, 1);
        this.updateTrackInfo();
        this.updateActivePrefab();

        print("Playback fully stopped and state reset.");
         // isManualStop will be reset on next loadTrack or consumed by finish callback
    }


    // --- Next / Previous Track Actions ---

    private nextTrack(): void {
        // Debounce handled in setupCallbacks
        if (this.isLoadingRemote) { print("Next track ignored: Loading remote."); return; }
        if (this.allTracksData.length === 0) { print("Next track ignored: No tracks."); return; }
        print("Next track triggered.");

        let nextIndex;
        // --- Calculate nextIndex based on mode ---
        if (this.isRepeatEnabled) {
             nextIndex = (this.currentTrackIndex === -1) ? 0 : this.currentTrackIndex; // Stay on current or go to first if stopped
        } else if (this.isShuffleEnabled) {
            if (this.allTracksData.length > 1) {
                do { nextIndex = Math.floor(Math.random() * this.allTracksData.length); } while (nextIndex === this.currentTrackIndex);
            } else { nextIndex = 0; }
        } else { // Sequential
             nextIndex = (this.currentTrackIndex === -1) ? 0 : this.currentTrackIndex + 1;
            if (nextIndex >= this.allTracksData.length) {
                 if (this.loopPlayback) { nextIndex = 0; }
                 else { print("Reached end, no loop. Stopping."); this.stopTrack(); return; }
             }
        }
         // --- Validate calculated index ---
         if (nextIndex < 0 || nextIndex >= this.allTracksData.length) {
            print(`Next track error: Invalid index calculated (${nextIndex}). Stopping.`);
            this.stopTrack();
            return;
        }

        // *** Set intent to play the next track ***
        this.shouldAutoPlay = true;
        this.loadTrack(nextIndex);
    }

    private prevTrack(): void {
        // Debounce handled in setupCallbacks
        if (this.isLoadingRemote) { print("Previous track ignored: Loading remote."); return; }
        if (this.allTracksData.length === 0) { print("Previous track ignored: No tracks."); return; }
        print("Previous track triggered");

        let prevIndex;
         // --- Calculate prevIndex based on mode ---
         if (this.isRepeatEnabled) {
             prevIndex = (this.currentTrackIndex === -1) ? this.allTracksData.length - 1 : this.currentTrackIndex; // Stay on current or go to last if stopped
         } else if (this.isShuffleEnabled) {
            if (this.allTracksData.length > 1) {
                do { prevIndex = Math.floor(Math.random() * this.allTracksData.length); } while (prevIndex === this.currentTrackIndex);
            } else { prevIndex = 0; }
         } else { // Sequential
            prevIndex = (this.currentTrackIndex === -1) ? this.allTracksData.length - 1 : this.currentTrackIndex - 1;
            if (prevIndex < 0) {
                if (this.loopPlayback) { prevIndex = this.allTracksData.length - 1; }
                else { print("Reached start, no loop. Stopping."); this.stopTrack(); return; }
            }
         }
         // --- Validate calculated index ---
          if (prevIndex < 0 || prevIndex >= this.allTracksData.length) {
            print(`Previous track error: Invalid index calculated (${prevIndex}). Stopping.`);
            this.stopTrack();
            return;
        }

        // *** Set intent to play the previous track ***
        this.shouldAutoPlay = true;
        this.loadTrack(prevIndex);
    }


    // --- UI Updates ---

    private updateTrackInfo(): void {
        // (Logic remains the same, uses currentTrackIndex and isLoadingRemote)
        let artist = "";
        let title = "Stopped";
        let timecode = "00:00 / 00:00";

        if (this.isLoadingRemote) {
            title = this.allTracksData[this.currentTrackIndex]?.title || "Loading...";
            artist = this.allTracksData[this.currentTrackIndex]?.artist || "";
            timecode = "Loading...";
        } else if (this.currentTrackIndex !== -1 && this.currentTrackIndex < this.allTracksData.length) {
            const trackData = this.allTracksData[this.currentTrackIndex];
            artist = trackData.artist;
            title = trackData.title;
            // Timecode is handled by updatePlayer
        } else if (this.currentTrackIndex !== -1) { // Invalid index case
             artist = "Error";
             title = "Invalid Track";
             timecode = "--:-- / --:--";
        }

        if (this.artistNameText) this.artistNameText.text = artist;
        if (this.trackTitleText) this.trackTitleText.text = title;
        // Only update timecode here for stopped/loading states
        if (this.timecodeText && (this.currentTrackIndex === -1 || this.isLoadingRemote || title === "Invalid Track")) {
            this.timecodeText.text = timecode;
        }
         if (this.currentTrackIndex === -1 || this.isLoadingRemote) {
            this.updateEarthPosition(0, 1); // Ensure progress reset for these states
        }
    }

     private updatePlayer(): void {
        // Handle states where time shouldn't be calculated/updated
        if (this.isLoadingRemote || this.currentTrackIndex === -1 || !this.audioInitialized || !this.audioComponent || !this.audioComponent.audioTrack) {
            // UI text (like "Loading...", "Stopped", "00:00 / 00:00") is set by updateTrackInfo
            // Ensure progress bar is reset
            this.updateEarthPosition(0, 1);
            return;
        }

        // Proceed with timecode and progress update
        let currentTime = 0;
        let totalTime = 0;
        try {
            totalTime = this.audioComponent.duration || 0;
            if (this.isPlaying) {
                currentTime = getTime() - this.trackStartTime;
            } else { // Paused
                currentTime = this.currentPlaybackTime;
            }
            // Clamp values
            currentTime = Math.max(0, currentTime);
            if (totalTime > 0) {
                currentTime = Math.min(currentTime, totalTime);
            } else {
                totalTime = 0; // Treat invalid duration as 0
            }
            // Update UI
            if (this.timecodeText) {
                this.timecodeText.text = `${this.formatTime(currentTime)} / ${this.formatTime(totalTime)}`;
            }
            this.updateEarthPosition(currentTime, totalTime);
        } catch (e) {
            print("Error updating player time/progress: " + e);
            if (this.timecodeText) { this.timecodeText.text = "--:-- / --:--"; }
            this.updateEarthPosition(0, 1);
        }
    }

    private updateEarthPosition(currentTime: number, totalTime: number): void {
         // (Logic remains the same as previous version)
         if (this.earthSphere && this.progressBar) {
             let progress = (totalTime > 0) ? (currentTime / totalTime) : 0;
             progress = Math.max(0, Math.min(1, progress));
             try {
                const barTransform = this.progressBar.getTransform();
                const barScale = barTransform.getWorldScale();
                const barPosition = barTransform.getWorldPosition();
                const barRotation = barTransform.getWorldRotation();
                const earthTransform = this.earthSphere.getTransform();
                const halfLength = barScale.x / 2;
                const xAxis = barRotation.multiplyVec3(vec3.right());
                const startPoint = barPosition.sub(xAxis.uniformScale(halfLength));
                const endPoint = barPosition.add(xAxis.uniformScale(halfLength));
                const targetPosition = startPoint.add(endPoint.sub(startPoint).uniformScale(progress));
                const xOffsetVector = xAxis.uniformScale(this.earthSphereXOffset);
                const finalPosition = targetPosition.add(xOffsetVector);
                earthTransform.setWorldPosition(finalPosition);
             } catch (e) { print("Error updating sphere position: " + e); }
         }
     }

    private formatTime(timeInSeconds: number): string {
        // (Logic remains the same as previous version)
        if (isNaN(timeInSeconds) || timeInSeconds < 0) return "00:00";
        const totalSeconds = Math.floor(timeInSeconds);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
    }

    // --- Rotation and Progress Bar Setup (Unchanged) ---
     private setupProgressBar(): void {
         if (this.progressBar && this.earthSphere) { this.updateEarthPosition(0, 1); }
     }
     private updateSphereRotation(): void {
         if (this.earthSphere) {
             const deltaTime = getDeltaTime();
             const earthTransform = this.earthSphere.getTransform();
             const currentRotation = earthTransform.getLocalRotation();
             const rotationDelta = quat.fromEulerAngles(0, this.rotationSpeed * deltaTime * (Math.PI / 180), 0);
             const newRotation = currentRotation.multiply(rotationDelta);
             earthTransform.setLocalRotation(newRotation);
         }
     }

     // --- Public methods (Unchanged) ---
    public getCurrentTrackIndex(): number { return this.currentTrackIndex; }
    public getTrackPrefab(index: number): SceneObject | null {
        return (index >= 0 && index < this.allTracksData.length) ? this.allTracksData[index].prefab : null;
    }

    // --- Destruction (Unchanged) ---
    onDestroy(): void {
        print("MusicPlayerManager onDestroy called.");
        if (this.audioComponent && (this.isPlaying || this.isPaused)) {
             try { this.audioComponent.stop(false); } catch (e) { /* Ignore */ }
        }
        // Remove callbacks (ensure variables exist before removing)
        if (this.playPauseButton && this.onPlayPauseCallback) this.playPauseButton.onButtonPinched.remove(this.onPlayPauseCallback);
        if (this.nextTrackButton && this.onNextTrackCallback) this.nextTrackButton.onButtonPinched.remove(this.onNextTrackCallback);
        if (this.prevTrackButton && this.onPrevTrackCallback) this.prevTrackButton.onButtonPinched.remove(this.onPrevTrackCallback);
        if (this.repeatButton && this.onRepeatCallback) this.repeatButton.onButtonPinched.remove(this.onRepeatCallback);
        if (this.shuffleButton && this.onShuffleCallback) this.shuffleButton.onButtonPinched.remove(this.onShuffleCallback);
        if (this.stopButton && this.onStopCallback) this.stopButton.onButtonPinched.remove(this.onStopCallback);
        if (this.audioComponent) { try { this.audioComponent.setOnFinish(null); } catch (e) { /* Ignore */ } }
        // Disable prefabs
        this.disableAllPrefabs();
    }
}