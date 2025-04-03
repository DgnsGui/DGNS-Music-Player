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
    @input localTracks: AudioTrackAsset[];
    @input localArtists: string[];
    @input localTitles: string[];
    @input localTrackPrefabs: SceneObject[];
    @input remoteTracks: RemoteReferenceAsset[];
    @input remoteArtists: string[];
    @input remoteTitles: string[];
    @input remoteTrackPrefabs: SceneObject[];
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

    // --- Private variables ---
    private allTracksData: TrackData[] = [];
    private currentTrackIndex: number = -1;
    private isPlaying: boolean = false;
    private isPaused: boolean = false;
    private isRepeatEnabled: boolean = false;
    private isShuffleEnabled: boolean = false;
    private shouldAutoPlay: boolean = false;
    private isLoadingRemote: boolean = false;
    private isManualStop: boolean = false;
    private trackStartTime: number = 0;
    private currentPlaybackTime: number = 0;
    private audioInitialized: boolean = false;
    private currentActivePrefab: SceneObject | null = null;
    private lastPinchTimePlayPause: number = 0;
    private lastPinchTimeNext: number = 0;
    private lastPinchTimePrev: number = 0;
    private lastPinchTimeRepeat: number = 0; // Added for debounce
    private lastPinchTimeShuffle: number = 0; // Added for debounce
    private lastPinchTimeStop: number = 0; // Added for debounce
    private readonly DEBOUNCE_TIME = 0.5; // Increased Debounce time for stability
    // ** List to manage delayed calls **
    private pendingDelayedCalls: PendingDelayedCall[] = [];

    // --- Callbacks ---
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
        if (!this.validateInputs()) { print("Input validation failed."); return; }
        this.combineTrackData();
        if (this.allTracksData.length === 0) { print("No tracks provided."); }
        this.disableAllPrefabs();
        this.setupCallbacks();
        this.setupProgressBar();

        // Bind main update loop functions
        this.createEvent("UpdateEvent").bind(() => {
            this.updatePlayer();
            this.updateSphereRotation();
            // Check pending delayed calls every frame
            this.checkDelayedCalls();
        });

        this.updateActivePrefab();
        this.updateTrackInfo();
        print(`Initialized with ${this.localTracks?.length || 0} local, ${this.remoteTracks?.length || 0} remote. Total: ${this.allTracksData.length}`);
    }

    private disableAllPrefabs(): void {
        this.allTracksData.forEach(track => { if (track.prefab) track.prefab.enabled = false; });
        if (this.stoppedPrefab) this.stoppedPrefab.enabled = false;
    }

    private validateInputs(): boolean {
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
        // Assign callbacks with integrated debounce checks
        if (this.playPauseButton) {
            this.onPlayPauseCallback = (event: InteractorEvent) => { const ct=getTime(); if (ct-this.lastPinchTimePlayPause < this.DEBOUNCE_TIME) return; this.lastPinchTimePlayPause=ct; this.togglePlayPause(); };
            this.playPauseButton.onButtonPinched.add(this.onPlayPauseCallback);
        }
        if (this.nextTrackButton) {
            this.onNextTrackCallback = (event: InteractorEvent) => { const ct=getTime(); if (ct-this.lastPinchTimeNext < this.DEBOUNCE_TIME) return; this.lastPinchTimeNext=ct; this.nextTrack(); };
            this.nextTrackButton.onButtonPinched.add(this.onNextTrackCallback);
        }
        if (this.prevTrackButton) {
            this.onPrevTrackCallback = (event: InteractorEvent) => { const ct=getTime(); if (ct-this.lastPinchTimePrev < this.DEBOUNCE_TIME) return; this.lastPinchTimePrev=ct; this.prevTrack(); };
            this.prevTrackButton.onButtonPinched.add(this.onPrevTrackCallback);
        }
        if (this.repeatButton) {
            this.onRepeatCallback = (event: InteractorEvent) => {
                const ct = getTime(); if (ct - this.lastPinchTimeRepeat < this.DEBOUNCE_TIME) return; this.lastPinchTimeRepeat = ct; // Add debounce
                this.isRepeatEnabled = !this.isRepeatEnabled; print("Repeat " + (this.isRepeatEnabled ? "enabled" : "disabled")); if (this.isRepeatEnabled) this.isShuffleEnabled = false;
            };
            this.repeatButton.onButtonPinched.add(this.onRepeatCallback);
        }
        if (this.shuffleButton) {
            this.onShuffleCallback = (event: InteractorEvent) => {
                const ct = getTime(); if (ct - this.lastPinchTimeShuffle < this.DEBOUNCE_TIME) return; this.lastPinchTimeShuffle = ct; // Add debounce
                this.isShuffleEnabled = !this.isShuffleEnabled; print("Shuffle mode " + (this.isShuffleEnabled ? "enabled" : "disabled")); if (this.isShuffleEnabled) this.isRepeatEnabled = false;
            };
            this.shuffleButton.onButtonPinched.add(this.onShuffleCallback);
        }
        if (this.stopButton) {
            this.onStopCallback = (event: InteractorEvent) => {
                const ct = getTime(); if (ct - this.lastPinchTimeStop < this.DEBOUNCE_TIME) return; this.lastPinchTimeStop = ct; // Add debounce
                this.stopTrack();
            };
            this.stopButton.onButtonPinched.add(this.onStopCallback);
        }
        this.setupTrackFinishedCallback();
    }

    private setupTrackFinishedCallback(): void {
        this.onTrackFinishedCallback = (audioComponent: AudioComponent) => {
            // Added relevance check: only proceed if the finished component is ours AND we are actually playing
            // Added check to prevent acting if manually stopped or paused
            if (audioComponent !== this.audioComponent || !this.isPlaying || this.isLoadingRemote || this.isManualStop || this.isPaused) {
                if(this.isManualStop) this.isManualStop = false; // Reset flag if it was set
                print(`Track finished event ignored (ComponentMatch:${audioComponent === this.audioComponent}, IsPlaying:${this.isPlaying}, Loading:${this.isLoadingRemote}, ManualStop:${this.isManualStop}, Paused:${this.isPaused})`);
                return;
            }
            print("Track finished event detected, handling auto-advance.");
            this.handleTrackFinished();
        };
        if (this.audioComponent) {
            try { this.audioComponent.setOnFinish(this.onTrackFinishedCallback); } catch (e) { print("Error setting onFinish callback: " + e); }
        }
    }


    private handleTrackFinished(): void {
        print("Handle Track Finished - Determining next action.");
        if (this.currentTrackIndex === -1 || this.allTracksData.length === 0) { this.stopTrack(); return; }
        this.shouldAutoPlay = true; // Intent to play next
        let nextIndex = -1;
        if (this.isRepeatEnabled) { nextIndex = this.currentTrackIndex; }
        else if (this.isShuffleEnabled) { if (this.allTracksData.length > 1) { do { nextIndex = Math.floor(Math.random() * this.allTracksData.length); } while (nextIndex === this.currentTrackIndex); } else { nextIndex = 0; } }
        else { nextIndex = this.currentTrackIndex + 1; if (nextIndex >= this.allTracksData.length) { if (this.loopPlayback) { nextIndex = 0; } else { print("End, no loop. Stopping."); this.shouldAutoPlay = false; this.stopTrack(); return; } } }
        if (nextIndex >= 0 && nextIndex < this.allTracksData.length) { this.loadTrack(nextIndex); } else { print(`Error: Invalid next index (${nextIndex}) in handleTrackFinished.`); this.stopTrack(); }
    }

    private updateActivePrefab(): void {
        if (this.currentActivePrefab) { this.currentActivePrefab.enabled = false; this.currentActivePrefab = null; }
        if (this.currentTrackIndex === -1) { if (this.stoppedPrefab) { this.stoppedPrefab.enabled = true; this.currentActivePrefab = this.stoppedPrefab; } }
        else if (this.currentTrackIndex >= 0 && this.currentTrackIndex < this.allTracksData.length) { const cd = this.allTracksData[this.currentTrackIndex]; if (cd && cd.prefab) { cd.prefab.enabled = true; this.currentActivePrefab = cd.prefab; } }
    }

    private delayedCall(delay: number, callback: () => void): void {
        if (!callback) return;
        if (delay <= 0) {
            try { callback(); } catch(e){ print("Error in immediate delayedCall callback: " + e); }
            return;
        }
        const executeTime = getTime() + delay;
        this.pendingDelayedCalls.push({ executeTime: executeTime, callback: callback });
    }

    private checkDelayedCalls(): void {
        if (this.pendingDelayedCalls.length === 0) { return; }
        const currentTime = getTime();
        // Iterate backwards for safe removal
        for (let i = this.pendingDelayedCalls.length - 1; i >= 0; i--) {
            const call = this.pendingDelayedCalls[i];
            if (currentTime >= call.executeTime) {
                this.pendingDelayedCalls.splice(i, 1); // Remove *before* executing
                try { call.callback(); } catch (e) { print("Error executing delayed call callback: " + e); }
            }
        }
    }

    // --- MODIFIED: loadTrack uses stop(false) for stability ---
    private loadTrack(index: number): void {
        if (this.isLoadingRemote) { print(`Load track (${index}) ignored: Loading remote.`); return; }
        if (index < 0 || index >= this.allTracksData.length) { print(`Error: Invalid track index ${index}.`); this.stopTrack(); return; }

        const playAfterLoad = this.shouldAutoPlay;
        this.shouldAutoPlay = false; // Consume the flag

        this.audioInitialized = false;
        this.isManualStop = false; // Reset manual stop flag when loading a new track

        // --- Stop Sequence ---
        let wasPlayingOrPaused = this.isPlaying || this.isPaused;
        if (wasPlayingOrPaused && this.audioComponent) {
             if (this.audioComponent.isPlaying() || this.audioComponent.isPaused()) {
                 print("Stopping previous track (immediate)...");
                 try {
                     // *** Use stop(false) for immediate stop - SAFER ***
                     this.audioComponent.stop(false);
                 } catch(e){ print("Error stopping previous track: "+e); }
             }
        }
        // Immediately update internal state *after* potential stop
        this.isPlaying = false;
        this.isPaused = false;
        this.currentPlaybackTime = 0;
        // Clear the track reference *after* stopping
        if (this.audioComponent) {
            try { this.audioComponent.audioTrack = null; } catch(e) { print("Error clearing audioTrack: "+e); }
        }
        // --- End Stop Sequence ---

        // Set the new index and update UI
        this.currentTrackIndex = index;
        // Ensure track data exists before accessing properties
        const trackData = this.allTracksData?.[this.currentTrackIndex];
        if (!trackData) {
            print(`Error: No track data found for index ${index}. Stopping.`);
            this.handleLoadError(index, "Track data not found");
            return;
        }
        this.updateTrackInfo(); // Update UI based on the new index
        this.updateActivePrefab(); // Update prefab based on the new index

        print(`Loading track ${index}: ${trackData.title} (${trackData.isRemote ? 'Remote' : 'Local'}) - Intent to play: ${playAfterLoad}`);

        // --- Load/Download Logic ---
        if (trackData.isRemote) {
            this.isLoadingRemote = true;
            const remoteAsset = trackData.asset as RemoteReferenceAsset;
            if (this.timecodeText) this.timecodeText.text = "Loading...";

            const onDownloadedCallback = (downloadedAsset: Asset) => {
                // Relevance check: Ensure this callback is for the *currently intended* track index
                if (this.currentTrackIndex !== index || !this.isLoadingRemote) {
                    print(`Download callback for index ${index} ignored, current index is ${this.currentTrackIndex}, loading: ${this.isLoadingRemote}`);
                    // Ensure loading state matches relevance check
                    this.isLoadingRemote = (this.currentTrackIndex === index && this.isLoadingRemote);
                    return;
                }
                this.isLoadingRemote = false; // Mark loading as complete *for this track*
                if (downloadedAsset && downloadedAsset.isOfType("Asset.AudioTrackAsset")) {
                    const audioTrack = downloadedAsset as AudioTrackAsset;
                    print(`Remote track ${trackData.title} downloaded.`);
                    if (!this.audioComponent) { print("Error: AudioComponent missing after download."); this.handleLoadError(index, "AudioComponent missing"); return; }
                    try {
                        this.audioComponent.audioTrack = audioTrack;
                        this.setupTrackFinishedCallback(); // Re-setup in case component changed/reset
                        this.audioInitialized = true;
                        this.trackStartTime = getTime(); this.currentPlaybackTime = 0; // Reset time on successful load
                        if (playAfterLoad) {
                            print("Auto-playing downloaded remote track.");
                            // Small delay to ensure engine state catches up after loading
                            this.delayedCall(0.05, () => this.playTrack());
                        } else {
                            this.updatePlayer(); // Update UI if not auto-playing
                        }
                    } catch (e) { print("Error setting downloaded audio track: " + e); this.handleLoadError(index, "Error setting track"); }
                } else {
                    print(`Download failed or invalid asset type for index ${index}.`);
                    this.handleLoadError(index, "Invalid asset type or failed download");
                }
            };
             const onFailedCallback = () => {
                // Relevance check
                if (this.currentTrackIndex !== index || !this.isLoadingRemote) {
                    print(`Download failed callback for index ${index} ignored, current index is ${this.currentTrackIndex}, loading: ${this.isLoadingRemote}`);
                    this.isLoadingRemote = (this.currentTrackIndex === index && this.isLoadingRemote);
                    return;
                }
                this.isLoadingRemote = false;
                print(`Download explicitly failed for index ${index}.`);
                this.handleLoadError(index, "Download failed");
            };
            try {
                remoteAsset.downloadAsset(onDownloadedCallback, onFailedCallback);
            } catch (e) {
                 print("Error calling downloadAsset: " + e);
                 this.isLoadingRemote = false; // Ensure loading state is reset on error
                 this.handleLoadError(index, "Error initiating download");
            }
        } else {
            // Local Asset
             if (!this.audioComponent) { print("Error: AudioComponent missing for local load."); this.handleLoadError(index, "AudioComponent missing"); return; }
            try {
                const localAsset = trackData.asset as AudioTrackAsset;
                this.audioComponent.audioTrack = localAsset;
                this.setupTrackFinishedCallback(); // Re-setup callback
                this.audioInitialized = true;
                this.trackStartTime = getTime(); this.currentPlaybackTime = 0; // Reset time
                print(`Local track ${trackData.title} loaded.`);
                if (playAfterLoad) {
                    print("Auto-playing local track.");
                    // Small delay for stability
                    this.delayedCall(0.05, () => this.playTrack());
                } else {
                    this.updatePlayer(); // Update UI if not playing
                }
            } catch (e) {
                print("Error loading local audio track: " + e);
                this.handleLoadError(index, "Local load error");
            }
        }
    }

    private handleLoadError(failedIndex: number, reason: string): void {
         print(`Handling load error for track ${failedIndex}: ${reason}`);
         // Only stop if the error is for the *current* track we care about
         if (this.currentTrackIndex === failedIndex) {
             this.stopTrack(); // Reset to a safe state
             if (this.artistNameText) this.artistNameText.text = "Error";
             if (this.trackTitleText) this.trackTitleText.text = "Load Failed";
             if (this.timecodeText) this.timecodeText.text = "--:-- / --:--";
             this.updateActivePrefab(); // Show stopped prefab if available
         } else {
             print(`Load error for index ${failedIndex} occurred, but current index is ${this.currentTrackIndex}. Ignoring stop.`);
         }
    }

    private togglePlayPause(): void {
        // Debounce handled in setupCallbacks
        if (this.isLoadingRemote) { print("Play/Pause ignored: Loading remote."); return; }
        if (this.allTracksData.length === 0) { print("Play/Pause ignored: No tracks."); return; }

        print(`Toggle Play/Pause called - State: IsPlaying=${this.isPlaying}, IsPaused=${this.isPaused}, AudioInit=${this.audioInitialized}, CurrentIndex=${this.currentTrackIndex}`);

        if (this.isPlaying) {
             this.pauseTrack();
        } else { // Not currently playing
             if (this.currentTrackIndex === -1) {
                 // Stopped, start from beginning
                 print("Starting playback from stopped state (loading track 0).");
                 this.shouldAutoPlay = true; // Set intent to play after load
                 this.loadTrack(0);
             } else if (this.isPaused && this.audioInitialized && this.audioComponent?.audioTrack) {
                 // Paused, resume
                 print("Resuming playback.");
                 this.playTrack(); // Should handle resume logic
             } else if (!this.isPaused && this.audioInitialized && this.audioComponent?.audioTrack) {
                 // Track is loaded but not playing (e.g., after loading without autoPlay)
                 print("Starting playback of already loaded track.");
                 this.playTrack(); // Should handle playing from start
             } else if (!this.audioInitialized && this.currentTrackIndex !== -1) {
                 // Track was selected, but failed to init (e.g., download error, component issue)
                 print("Track selected but not initialized. Reloading with play intent.");
                 this.shouldAutoPlay = true; // Set intent to play after load
                 this.loadTrack(this.currentTrackIndex);
             } else {
                 print("Play/Pause ignored: Unexpected state or no track loaded.");
                 // If index is valid but not initialized, attempt load? Or maybe just log.
                 if(this.currentTrackIndex !== -1 && !this.audioInitialized) {
                     print("Attempting to reload current track due to uninitialized state.");
                     this.shouldAutoPlay = true;
                     this.loadTrack(this.currentTrackIndex);
                 }
             }
        }
    }

    private playTrack(): void {
        if (this.isLoadingRemote) { print("Play track ignored: Loading remote."); return; }
        if (!this.audioInitialized || !this.audioComponent || !this.audioComponent.audioTrack) {
            print(`Cannot play: Not initialized (Init:${this.audioInitialized}, Comp:${!!this.audioComponent}, Track:${!!this.audioComponent?.audioTrack}).`);
            // Attempt to recover if possible
            if (this.currentTrackIndex !== -1) {
                print("Attempting recovery: Reloading current track with play intent.");
                this.shouldAutoPlay = true;
                this.loadTrack(this.currentTrackIndex);
            }
            return;
        }

        try {
            const currentTitle = this.allTracksData[this.currentTrackIndex]?.title || "Unknown Title";
            if (this.isPaused) {
                print(`Resuming: ${currentTitle}`);
                this.audioComponent.resume();
                this.isPlaying = true; // State update *after* successful call
                this.isPaused = false;
                // Adjust start time based on paused duration
                this.trackStartTime = getTime() - this.currentPlaybackTime;
            } else if (!this.isPlaying) { // Should only happen if stopped or freshly loaded
                print(`Starting playback from beginning: ${currentTitle}`);
                this.currentPlaybackTime = 0; // Ensure starting from 0
                this.trackStartTime = getTime();
                this.audioComponent.play(1); // Play once
                this.isPlaying = true; // State update *after* successful call
                this.isPaused = false;
            } else {
                // Already playing, maybe log this case?
                print(`Play track called while already playing ${currentTitle}. No action taken.`);
            }
            this.isManualStop = false; // Ensure manual stop flag is clear on play/resume
        } catch (e) {
            print(`Error executing play/resume for track ${this.currentTrackIndex}: ${e}`);
            this.handleLoadError(this.currentTrackIndex, "Playback error");
        }
    }

    private pauseTrack(): void {
        if (!this.isPlaying || !this.audioInitialized || !this.audioComponent || !this.audioComponent.isPlaying()) {
             print(`Pause ignored: Not in a valid playing state (Playing:${this.isPlaying}, Init:${this.audioInitialized}, CompPlaying:${this.audioComponent?.isPlaying()})`);
             // Ensure state consistency if pause is called erroneously
             if(this.isPlaying) { this.isPlaying = false; this.isPaused = true; } // Force state if needed
             return;
        }

        try {
            const currentTitle = this.allTracksData[this.currentTrackIndex]?.title || "Unknown Title";
            print(`Attempting to pause: ${currentTitle}`);
            // Capture time *before* pausing
            this.currentPlaybackTime = Math.max(0, getTime() - this.trackStartTime);
            this.audioComponent.pause();
            this.isPlaying = false; // State update *after* successful call
            this.isPaused = true;
            print(`Paused at ${this.formatTime(this.currentPlaybackTime)}`);
        } catch (e) {
            print("Error pausing track: " + e);
            // Attempt to recover state even if pause call failed
            this.currentPlaybackTime = Math.max(0, getTime() - this.trackStartTime); // Recalculate time
            this.isPlaying = false; // Assume it stopped playing somehow
            this.isPaused = true; // Mark as paused logically
        }
    }

    // --- MODIFIED: stopTrack uses stop(false) for stability ---
    public stopTrack(): void {
         print("Stop track called.");
         this.isManualStop = true; // Mark that stop was initiated by user/API call
         this.isLoadingRemote = false; // Cancel any ongoing loading intention
         this.pendingDelayedCalls = []; // Clear pending calls (like delayed plays)

         if (this.audioComponent) {
             if (this.audioComponent.isPlaying() || this.audioComponent.isPaused()) {
                 print("Stopping audio component (immediate)...");
                 try {
                     // *** Use stop(false) for immediate stop - SAFER ***
                     this.audioComponent.stop(false);
                 } catch (e) { print("Error stopping audio component: " + e); }
             }
             // Clear track reference after stopping
             try { this.audioComponent.audioTrack = null; } catch (e) { print("Error clearing audio track on stop: " + e); }
         }

         // Reset state variables
         this.isPlaying = false;
         this.isPaused = false;
         this.shouldAutoPlay = false;
         this.currentTrackIndex = -1; // Indicate no track is selected/loaded
         this.audioInitialized = false;
         this.currentPlaybackTime = 0;

         // Update UI to reflect stopped state
         this.updateEarthPosition(0, 1); // Reset progress bar visual
         this.updateTrackInfo(); // Update text displays
         this.updateActivePrefab(); // Show the 'stopped' prefab

         print("Player stopped & reset.");
    }


    private nextTrack(): void {
        // Debounce handled in setupCallbacks
        if (this.isLoadingRemote) { print("Next ignored: Loading."); return; } if (this.allTracksData.length === 0) { print("Next ignored: No tracks."); return; } print("Next track triggered.");
        let nextIndex = -1;
        const currentIndex = this.currentTrackIndex; // Capture current index before calculation

        if (this.isRepeatEnabled && currentIndex !== -1) {
             nextIndex = currentIndex; // Repeat the current track
             print(`Repeat enabled, staying on index: ${nextIndex}`);
        } else if (this.isShuffleEnabled) {
             if (this.allTracksData.length > 1) {
                 do { nextIndex = Math.floor(Math.random() * this.allTracksData.length); } while (nextIndex === currentIndex); // Ensure it's a different track
             } else { nextIndex = 0; } // Only one track, shuffle does nothing
             print(`Shuffle enabled, next random index: ${nextIndex}`);
        } else { // Normal sequential playback
            nextIndex = (currentIndex === -1) ? 0 : currentIndex + 1; // Start from 0 if stopped, else increment
            if (nextIndex >= this.allTracksData.length) { // Reached the end
                if (this.loopPlayback) {
                    nextIndex = 0; // Loop back to the beginning
                    print("Reached end, looping back to index 0.");
                } else {
                    print("Reached end, no loop enabled. Stopping.");
                    this.stopTrack();
                    return; // Exit function, no track to load
                }
            } else {
                 print(`Sequential mode, next index: ${nextIndex}`);
            }
        }

        if (nextIndex < 0 || nextIndex >= this.allTracksData.length) {
             print(`Next error: Invalid calculated index (${nextIndex}). Stopping.`);
             this.stopTrack();
             return;
        }

        // *** Set intent to play the next track ***
        this.shouldAutoPlay = true;
        this.loadTrack(nextIndex);
    }

    private prevTrack(): void {
        // Debounce handled in setupCallbacks
        if (this.isLoadingRemote) { print("Prev ignored: Loading."); return; } if (this.allTracksData.length === 0) { print("Prev ignored: No tracks."); return; } print("Prev track triggered");
        let prevIndex = -1;
        const currentIndex = this.currentTrackIndex; // Capture current index

        // Optional: Add logic to restart current track if pressed early in playback
        // const RESTART_THRESHOLD = 3.0; // seconds
        // if (this.isPlaying && this.currentPlaybackTime > RESTART_THRESHOLD) {
        //    print("Restarting current track.");
        //    this.shouldAutoPlay = true;
        //    this.loadTrack(currentIndex); // Reload current track to play from start
        //    return;
        // }

        if (this.isRepeatEnabled && currentIndex !== -1) {
            prevIndex = currentIndex; // Repeat current track
             print(`Repeat enabled, staying on index: ${prevIndex}`);
        } else if (this.isShuffleEnabled) {
            if (this.allTracksData.length > 1) {
                do { prevIndex = Math.floor(Math.random() * this.allTracksData.length); } while (prevIndex === currentIndex);
            } else { prevIndex = 0; } // Only one track
            print(`Shuffle enabled, previous random index: ${prevIndex}`);
        } else { // Normal sequential playback
            prevIndex = (currentIndex === -1) ? this.allTracksData.length - 1 : currentIndex - 1; // Start from end if stopped, else decrement
            if (prevIndex < 0) { // Reached the beginning
                if (this.loopPlayback) {
                    prevIndex = this.allTracksData.length - 1; // Loop back to the end
                    print("Reached beginning, looping back to last index.");
                } else {
                    print("Reached beginning, no loop enabled. Stopping.");
                    this.stopTrack();
                    return; // Exit function
                }
            } else {
                 print(`Sequential mode, previous index: ${prevIndex}`);
            }
        }

        if (prevIndex < 0 || prevIndex >= this.allTracksData.length) {
            print(`Prev error: Invalid calculated index (${prevIndex}). Stopping.`);
            this.stopTrack();
            return;
        }

        // *** Set intent to play the previous track ***
        this.shouldAutoPlay = true;
        this.loadTrack(prevIndex);
    }


    private updateTrackInfo(): void {
        let artist = "";
        let title = "Stopped";
        let timecode = "00:00 / 00:00";

        if (this.isLoadingRemote && this.currentTrackIndex !== -1 && this.currentTrackIndex < this.allTracksData.length) {
            // Show info of the track being loaded
            const loadingData = this.allTracksData[this.currentTrackIndex];
            artist = loadingData?.artist || "";
            title = loadingData?.title || "Loading...";
            timecode = "Loading...";
        } else if (this.currentTrackIndex !== -1 && this.currentTrackIndex < this.allTracksData.length) {
            // Show info of the currently loaded/playing/paused track
            const currentData = this.allTracksData[this.currentTrackIndex];
            if (currentData) {
                artist = currentData.artist;
                title = currentData.title;
                // Timecode is updated in updatePlayer based on actual playback progress
            } else {
                // Should not happen if index is valid, but handle defensively
                artist = "Error";
                title = "Invalid Track Data";
                timecode = "--:-- / --:--";
            }
        } else if (this.currentTrackIndex !== -1) {
            // Index is out of bounds after validation? Should not happen.
            artist = "Error";
            title = "Invalid Index";
            timecode = "--:-- / --:--";
        }
        // If stopped (index is -1), defaults are already set ("Stopped", "00:00 / 00:00")

        if (this.artistNameText) this.artistNameText.text = artist;
        if (this.trackTitleText) this.trackTitleText.text = title;

        // Only update timecode here if it's loading or stopped/error state
        // Otherwise, let updatePlayer handle the dynamic time
        if (this.timecodeText && (this.isLoadingRemote || this.currentTrackIndex === -1 || title.startsWith("Invalid") || title === "Error")) {
            this.timecodeText.text = timecode;
        }

        // Reset progress bar if stopped or loading
        if (this.currentTrackIndex === -1 || this.isLoadingRemote) {
            this.updateEarthPosition(0, 1);
        }
    }

    private updatePlayer(): void {
        // Exit if loading, stopped, or not initialized properly
        if (this.isLoadingRemote || this.currentTrackIndex === -1 || !this.audioInitialized || !this.audioComponent || !this.audioComponent.audioTrack) {
            // Ensure progress bar is reset if we exit here
            if (!this.isLoadingRemote && this.currentTrackIndex === -1) {
                 this.updateEarthPosition(0, 1);
                 if (this.timecodeText && this.timecodeText.text !== "00:00 / 00:00") this.timecodeText.text = "00:00 / 00:00";
            }
            return;
        }

        let currentTime = 0;
        let totalTime = 0;

        try {
            totalTime = this.audioComponent.duration || 0;

            if (this.isPlaying) {
                // Calculate current time based on when playback started
                currentTime = getTime() - this.trackStartTime;
            } else if (this.isPaused) {
                // Use the time captured when pause was initiated
                currentTime = this.currentPlaybackTime;
            } else {
                 // Not playing or paused, but initialized? Should be 0 (e.g. just loaded)
                 currentTime = 0;
            }

            // Clamp time values
            currentTime = Math.max(0, currentTime);
            if (totalTime > 0) {
                currentTime = Math.min(currentTime, totalTime);
            } else {
                totalTime = 0; // Treat invalid duration as 0
                 // If duration is 0 or invalid, but we are playing, show increasing time?
                 // Or maybe just "--:--" for total time. For now, 0.
            }

            // Update UI Text
            if (this.timecodeText) {
                this.timecodeText.text = `${this.formatTime(currentTime)} / ${this.formatTime(totalTime)}`;
            }

            // Update Progress Bar Visual
            this.updateEarthPosition(currentTime, totalTime);

        } catch (e) {
            print("Error updating player state (likely audioComponent access): " + e);
            // Reset UI on error
            if (this.timecodeText) { this.timecodeText.text = "--:-- / --:--"; }
            this.updateEarthPosition(0, 1);
            // Consider stopping or attempting recovery if errors persist
            // this.handleLoadError(this.currentTrackIndex, "Player update error");
        }
    }

    private updateEarthPosition(currentTime: number, totalTime: number): void {
        if (!this.earthSphere || !this.progressBar) return;

        try {
            // Calculate progress percentage (0.0 to 1.0)
            let progress = (totalTime > 0.001) ? (currentTime / totalTime) : 0; // Avoid division by zero or near-zero
            progress = Math.max(0, Math.min(1, progress)); // Clamp between 0 and 1

            const barTransform = this.progressBar.getTransform();
            const barScale = barTransform.getWorldScale();
            const barPosition = barTransform.getWorldPosition();
            const barRotation = barTransform.getWorldRotation();

            const earthTransform = this.earthSphere.getTransform();

            // Use bar's local X-axis as the direction of progress
            const progressDirection = barRotation.multiplyVec3(vec3.right()); // Assumes bar stretches along its local X

            // Calculate start and end points based on the bar's center, rotation, and scale
            const halfLength = barScale.x / 2.0;
            const startPoint = barPosition.sub(progressDirection.uniformScale(halfLength));
            const endPoint = barPosition.add(progressDirection.uniformScale(halfLength));

            // Interpolate the position along the progress direction
            const targetPosition = startPoint.add(endPoint.sub(startPoint).uniformScale(progress));

            // Apply the X offset relative to the progress direction
            const offsetVector = progressDirection.uniformScale(this.earthSphereXOffset);
            const finalPosition = targetPosition.add(offsetVector);

            // Set the earth's world position
            earthTransform.setWorldPosition(finalPosition);

        } catch (e) {
            print("Error updating earth position: " + e);
            // Disable visuals or log more details if needed
        }
    }

     private formatTime(timeInSeconds: number): string {
        if (isNaN(timeInSeconds) || timeInSeconds < 0) return "00:00";
        const totalSeconds = Math.floor(timeInSeconds);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
     }

    private setupProgressBar(): void {
        if (this.progressBar && this.earthSphere) {
            // Initialize position at the start
            this.updateEarthPosition(0, 1);
        }
    }

    private updateSphereRotation(): void {
        if (this.earthSphere) {
            try {
                const deltaTime = getDeltaTime();
                const earthTransform = this.earthSphere.getTransform();
                const currentRotation = earthTransform.getLocalRotation();
                // Rotation around the Y-axis (up)
                const rotationDelta = quat.fromEulerAngles(0, this.rotationSpeed * deltaTime * (Math.PI / 180.0), 0);
                const newRotation = currentRotation.multiply(rotationDelta);
                earthTransform.setLocalRotation(newRotation);
            } catch(e) {
                print("Error updating sphere rotation: "+e);
            }
        }
    }

    // --- Public API (Optional) ---
    public getCurrentTrackIndex(): number {
        return this.currentTrackIndex;
    }

    public getTrackPrefab(index: number): SceneObject | null {
        return (index >= 0 && index < this.allTracksData.length) ? this.allTracksData[index].prefab : null;
    }

    // --- Cleanup ---
    onDestroy(): void {
        print("Destroying MusicPlayerManager.");
        this.pendingDelayedCalls = []; // Clear any pending actions

        // Attempt to stop audio cleanly
        if (this.audioComponent && (this.isPlaying || this.isPaused)) {
            try {
                print("Stopping audio component on destroy...");
                this.audioComponent.stop(false); // Immediate stop on destroy
                this.audioComponent.audioTrack = null; // Release asset reference
            } catch (e) { print("Error stopping audio on destroy: " + e); }
        }
        // Remove event listeners
        if (this.playPauseButton && this.onPlayPauseCallback) this.playPauseButton.onButtonPinched.remove(this.onPlayPauseCallback);
        if (this.nextTrackButton && this.onNextTrackCallback) this.nextTrackButton.onButtonPinched.remove(this.onNextTrackCallback);
        if (this.prevTrackButton && this.onPrevTrackCallback) this.prevTrackButton.onButtonPinched.remove(this.onPrevTrackCallback);
        if (this.repeatButton && this.onRepeatCallback) this.repeatButton.onButtonPinched.remove(this.onRepeatCallback);
        if (this.shuffleButton && this.onShuffleCallback) this.shuffleButton.onButtonPinched.remove(this.onShuffleCallback);
        if (this.stopButton && this.onStopCallback) this.stopButton.onButtonPinched.remove(this.onStopCallback);

        // Explicitly remove the onFinish callback
        if (this.audioComponent) {
            try { this.audioComponent.setOnFinish(null); } catch (e) { print("Error removing onFinish callback: " + e);}
        }

        this.disableAllPrefabs(); // Ensure prefabs are hidden
     }
} // End of class MusicPlayerManager