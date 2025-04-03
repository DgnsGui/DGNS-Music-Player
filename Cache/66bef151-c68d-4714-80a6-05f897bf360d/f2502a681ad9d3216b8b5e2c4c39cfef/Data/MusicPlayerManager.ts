import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { InteractorEvent } from 'SpectaclesInteractionKit/Core/Interactor/InteractorEvent';
import { InteractableManipulation } from 'SpectaclesInteractionKit/Components/Interaction/InteractableManipulation/InteractableManipulation';

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

// Helper Interface for Bar Bounds
interface ProgressBarBounds {
    startPoint: vec3;
    endPoint: vec3;
    axisVector: vec3;
    length: number;
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
    @input('Component.ScriptComponent') earthSphereInteraction: InteractableManipulation;
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
    private lastPinchTimeRepeat: number = 0;
    private lastPinchTimeShuffle: number = 0;
    private lastPinchTimeStop: number = 0;
    private readonly DEBOUNCE_TIME = 0.5;
    private pendingDelayedCalls: PendingDelayedCall[] = [];
    private isScrubbing: boolean = false;
    private wasPlayingBeforeScrub: boolean = false;
    private scrubTargetTime: number = 0;
    private isPerformingScrubRestart: boolean = false; // Flag to ignore finish event during scrub restart

    // --- Callbacks ---
    private onPlayPauseCallback: (event: InteractorEvent) => void;
    private onNextTrackCallback: (event: InteractorEvent) => void;
    private onPrevTrackCallback: (event: InteractorEvent) => void;
    private onRepeatCallback: (event: InteractorEvent) => void;
    private onShuffleCallback: (event: InteractorEvent) => void;
    private onStopCallback: (event: InteractorEvent) => void;
    private onTrackFinishedCallback: (audioComponent: AudioComponent) => void;
    private onScrubStartCallback: (event: any) => void;
    private onScrubUpdateCallback: (event: any) => void;
    private onScrubEndCallback: (event: any) => void;


    // --- Core Methods ---
    onAwake(): void {
        this.api.stopTrack = this.stopTrack.bind(this);
        if (!this.validateInputs() || !this.earthSphereInteraction) {
             print("Input validation failed (check AudioComponent, ProgressBar, EarthSphere, and EarthSphereInteraction).");
             this.enabled = false; // Disable component if validation fails
             return;
        }
        this.combineTrackData();
        if (this.allTracksData.length === 0) { print("No tracks provided."); }
        this.disableAllPrefabs();
        this.setupCallbacks(); // Original button callbacks
        this.setupInteractionCallbacks(); // Scrubbing callbacks
        this.setupProgressBar();

        this.createEvent("UpdateEvent").bind(() => {
            this.updatePlayer();
            this.updateSphereRotation();
            this.checkDelayedCalls();
        });

        this.updateActivePrefab();
        this.updateTrackInfo();
        print(`Initialized with ${this.localTracks?.length || 0} local, ${this.remoteTracks?.length || 0} remote. Total: ${this.allTracksData.length}`);
    }

    private validateInputs(): boolean {
        let isValid = true;
        if (!this.audioComponent) { print("Error: Audio component not defined."); isValid = false; }
        if (!this.earthSphere) { print("Error: Earth Sphere SceneObject not defined."); isValid = false; }
        if (!this.progressBar) { print("Error: Progress Bar SceneObject not defined."); isValid = false; }
        if (!this.earthSphereInteraction) { print("Error: Earth Sphere Interaction (InteractableManipulation) component not defined."); isValid = false; }
        if (!this.artistNameText) print("Warning: Artist Name Text component not assigned.");
        if (!this.timecodeText) print("Warning: Timecode Text component not assigned.");
        if (!this.trackTitleText) print("Warning: Track Title Text component not assigned.");
        if (!this.playPauseButton) print("Warning: Play/Pause button not assigned.");
        if (!this.nextTrackButton) print("Warning: Next Track button not assigned.");
        if (!this.prevTrackButton) print("Warning: Prev Track button not assigned.");

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
        // Assign button callbacks with debounce and scrub checks
        if (this.playPauseButton) {
            this.onPlayPauseCallback = (event: InteractorEvent) => { const ct=getTime(); if (ct-this.lastPinchTimePlayPause < this.DEBOUNCE_TIME || this.isScrubbing) return; this.lastPinchTimePlayPause=ct; this.togglePlayPause(); };
            this.playPauseButton.onButtonPinched.add(this.onPlayPauseCallback);
        }
        if (this.nextTrackButton) {
            this.onNextTrackCallback = (event: InteractorEvent) => { const ct=getTime(); if (ct-this.lastPinchTimeNext < this.DEBOUNCE_TIME || this.isScrubbing) return; this.lastPinchTimeNext=ct; this.nextTrack(); };
            this.nextTrackButton.onButtonPinched.add(this.onNextTrackCallback);
        }
        if (this.prevTrackButton) {
            this.onPrevTrackCallback = (event: InteractorEvent) => { const ct=getTime(); if (ct-this.lastPinchTimePrev < this.DEBOUNCE_TIME || this.isScrubbing) return; this.lastPinchTimePrev=ct; this.prevTrack(); };
            this.prevTrackButton.onButtonPinched.add(this.onPrevTrackCallback);
        }
        if (this.repeatButton) {
            this.onRepeatCallback = (event: InteractorEvent) => {
                const ct = getTime(); if (ct - this.lastPinchTimeRepeat < this.DEBOUNCE_TIME || this.isScrubbing) return; this.lastPinchTimeRepeat = ct;
                this.isRepeatEnabled = !this.isRepeatEnabled; print("Repeat " + (this.isRepeatEnabled ? "enabled" : "disabled")); if (this.isRepeatEnabled) this.isShuffleEnabled = false; this.updateButtonVisuals(); // Optional: Update button appearance
            };
            this.repeatButton.onButtonPinched.add(this.onRepeatCallback);
        }
        if (this.shuffleButton) {
            this.onShuffleCallback = (event: InteractorEvent) => {
                const ct = getTime(); if (ct - this.lastPinchTimeShuffle < this.DEBOUNCE_TIME || this.isScrubbing) return; this.lastPinchTimeShuffle = ct;
                this.isShuffleEnabled = !this.isShuffleEnabled; print("Shuffle mode " + (this.isShuffleEnabled ? "enabled" : "disabled")); if (this.isShuffleEnabled) this.isRepeatEnabled = false; this.updateButtonVisuals(); // Optional: Update button appearance
            };
            this.shuffleButton.onButtonPinched.add(this.onShuffleCallback);
        }
        if (this.stopButton) {
            this.onStopCallback = (event: InteractorEvent) => {
                const ct = getTime(); if (ct - this.lastPinchTimeStop < this.DEBOUNCE_TIME) return; this.lastPinchTimeStop = ct;
                this.stopTrack();
            };
            this.stopButton.onButtonPinched.add(this.onStopCallback);
        }
        this.setupTrackFinishedCallback();
    }

    private setupInteractionCallbacks(): void {
        this.onScrubStartCallback = this.onScrubStart.bind(this);
        this.onScrubUpdateCallback = this.onScrubUpdate.bind(this);
        this.onScrubEndCallback = this.onScrubEnd.bind(this);

        if (this.earthSphereInteraction) {
            this.earthSphereInteraction.onManipulationStart.add(this.onScrubStartCallback);
            this.earthSphereInteraction.onManipulationUpdate.add(this.onScrubUpdateCallback);
            this.earthSphereInteraction.onManipulationEnd.add(this.onScrubEndCallback);
        } else {
             print("Error: Earth Sphere Interaction component not found during callback setup.");
        }
    }

    // --- MODIFIED: Added isPerformingScrubRestart check AND reset ---
    private setupTrackFinishedCallback(): void {
        this.onTrackFinishedCallback = (audioComponent: AudioComponent) => {
            // **** CHECK THE NEW FLAG ****
            if (this.isPerformingScrubRestart) {
                 print("Track finished event ignored: Performing scrub restart.");
                 // **** RESET FLAG HERE ****
                 this.isPerformingScrubRestart = false;
                 print("Reset isPerformingScrubRestart flag.");
                 return; // Explicitly return after resetting
            }

            // Original checks
            if (audioComponent !== this.audioComponent || !this.isPlaying || this.isLoadingRemote || this.isManualStop || this.isPaused || this.isScrubbing) {
                if(this.isManualStop) this.isManualStop = false;
                // print(`Track finished event ignored (ComponentMatch:${audioComponent === this.audioComponent}, IsPlaying:${this.isPlaying}, Loading:${this.isLoadingRemote}, ManualStop:${this.isManualStop}, Paused:${this.isPaused}, Scrubbing:${this.isScrubbing})`);
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
        // print("Handle Track Finished - Determining next action."); // Less verbose
        if (this.currentTrackIndex === -1 || this.allTracksData.length === 0 || this.isScrubbing) { this.stopTrack(); return; }
        this.shouldAutoPlay = true;
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

     private disableAllPrefabs(): void {
        this.allTracksData.forEach(track => { if (track.prefab) track.prefab.enabled = false; });
        if (this.stoppedPrefab) this.stoppedPrefab.enabled = false;
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
        for (let i = this.pendingDelayedCalls.length - 1; i >= 0; i--) {
            const call = this.pendingDelayedCalls[i];
            if (currentTime >= call.executeTime) {
                this.pendingDelayedCalls.splice(i, 1);
                try { call.callback(); } catch (e) { print("Error executing delayed call callback: " + e); }
            }
        }
    }

     // --- Scrub Start Handler ---
    private onScrubStart(event: any): void { // Using any
        if (this.currentTrackIndex < 0 || !this.audioInitialized || this.isLoadingRemote || !this.audioComponent?.audioTrack ) {
            print(`Scrub start ignored: Player not ready (Index:${this.currentTrackIndex}, Init:${this.audioInitialized}, Loading:${this.isLoadingRemote}).`);
            return;
        }
         if ( (this.audioComponent.duration || 0) <= 0) {
             print("Scrub start ignored: Track duration is zero or invalid.");
             return;
         }
        print("Scrub Start");
        this.isScrubbing = true;
        this.wasPlayingBeforeScrub = this.isPlaying;
    }


    // --- Scrub Update Handler ---
    private onScrubUpdate(event: any): void { // Using any
        if (!this.isScrubbing || !this.earthSphere || !this.progressBar || !this.audioComponent || !this.audioComponent.audioTrack) {
             if (this.isScrubbing) {
                 print("Scrub update aborted: Invalid state.");
                 this.isScrubbing = false;
             }
            return;
        }

        try {
            const earthTransform = this.earthSphere.getTransform();
            const currentSpherePos = earthTransform.getWorldPosition();
            const bounds = this.getProgressBarBounds();
            if (!bounds || bounds.length <= 0.001) {
                 print("Scrub update aborted: Invalid progress bar bounds.");
                 this.isScrubbing = false;
                 return; // Cannot calculate bounds or bar has no length
            }

            const vectorToSphere = currentSpherePos.sub(bounds.startPoint);
            const dotProduct = vectorToSphere.dot(bounds.axisVector);
            const projectedLength = Math.max(0, Math.min(bounds.length, dotProduct));

            const newPosOnLine = bounds.startPoint.add(bounds.axisVector.uniformScale(projectedLength));

            const barRotation = this.progressBar.getTransform().getWorldRotation();
            const progressDirection = barRotation.multiplyVec3(vec3.right());
            const offsetVector = progressDirection.uniformScale(this.earthSphereXOffset);
            const finalClampedPosition = newPosOnLine.add(offsetVector);

            earthTransform.setWorldPosition(finalClampedPosition);

            const progress = projectedLength / bounds.length;
            const totalTime = this.audioComponent.duration || 0; // Already checked duration > 0 in onScrubStart
            this.scrubTargetTime = progress * totalTime;

            if (this.timecodeText) {
                this.timecodeText.text = `${this.formatTime(this.scrubTargetTime)} / ${this.formatTime(totalTime)} (Scrub)`; // Shorter text
            }

        } catch (e) {
            print("Error during scrub update: " + e);
            this.isScrubbing = false;
        }
    }

     // --- REVISED: Scrub End Handler (Uses flag, resets flag in callback) ---
    private onScrubEnd(event: any): void { // Using any
        if (!this.isScrubbing) {
            return; // Ignore if not scrubbing
        }

        print("Scrub End");
        this.isScrubbing = false; // Set immediately

        // Make sure we are still in a valid state
        if (this.currentTrackIndex < 0 || !this.audioInitialized || this.isLoadingRemote || !this.audioComponent || !this.audioComponent.audioTrack) {
            print("Scrub end ignored: Player not ready for action.");
            this.isPerformingScrubRestart = false; // Ensure flag is reset if we bail early
            this.updatePlayer(); // Try to refresh UI state
            return;
        }

        // Calculate final target time for logging
        const seekTime = Math.max(0, this.scrubTargetTime);
        const totalTime = this.audioComponent.duration || 0;

        print(`Scrub finished near: ${this.formatTime(seekTime)} / ${this.formatTime(totalTime)}.`);
        print("NOTE: AudioComponent.play() does not support seek offset. Restarting track from beginning.");

        try {
            // **** SET FLAG before stopping ****
            this.isPerformingScrubRestart = true;
            print("Setting isPerformingScrubRestart = true");

            this.audioComponent.stop(false); // Stop immediately

            // Reset internal state for restart from beginning
            this.isPlaying = false;
            this.isPaused = false;
            this.currentPlaybackTime = 0; // Reset time to 0
            this.trackStartTime = getTime(); // Reset start time
            this.isManualStop = false; // Not a manual stop

            // Start playback from the BEGINNING
            this.audioComponent.play(1); // Play once from start
            this.isPlaying = true; // Mark as playing *after* successful call

            // If the track was paused *before* scrubbing, pause it again immediately AFTER restart
            if (!this.wasPlayingBeforeScrub) {
                 print("Restoring paused state after scrub (track restarted).");
                 this.delayedCall(0.05, () => {
                     // Check if still valid to pause (flag should be handled by callback)
                     if(this.currentTrackIndex !== -1 && this.isPlaying && !this.isScrubbing && !this.isPerformingScrubRestart) {
                        this.pauseTrack();
                     } else {
                         print("Skipped post-scrub pause (state changed or flag still set).");
                         // If pause is skipped, ensure flag is reset if it wasn't already by the callback
                         if(this.isPerformingScrubRestart) {
                             print("Force resetting isPerformingScrubRestart in delayed pause check.");
                             this.isPerformingScrubRestart = false;
                         }
                         this.updatePlayer();
                     }
                 });
            } else {
                 this.updatePlayer(); // Update UI immediately if it was playing
                 // Flag will be reset by the callback when the stop() event is ignored
            }

        } catch (e) {
            print(`Error during scrub end (stop/play): ${e}`);
             // **** Reset flag on error ****
            this.isPerformingScrubRestart = false;
            print("Resetting isPerformingScrubRestart flag due to error.");
            // Attempt to recover gracefully
            this.stopTrack(); // Stop fully on error
        }
        // Note: Flag reset is now primarily handled by the onTrackFinishedCallback

        // Force UI update to show correct time (should be near 00:00 after restart)
        this.updatePlayer();
    }


     // --- Helper to get Progress Bar Bounds ---
    private getProgressBarBounds(): ProgressBarBounds | null {
        if (!this.progressBar) return null;
        try {
            const barTransform = this.progressBar.getTransform();
            const barScale = barTransform.getWorldScale();
            const barPosition = barTransform.getWorldPosition();
            const barRotation = barTransform.getWorldRotation();

            const progressDirection = barRotation.multiplyVec3(vec3.right()); // Assumes bar stretches along local X

            if (Math.abs(barScale.x) < 0.0001) {
                 print("Warning: Progress bar has near-zero scale on X-axis.");
                 return null;
            }
            const halfLength = barScale.x / 2.0;
            const startPoint = barPosition.sub(progressDirection.uniformScale(halfLength));
            const endPoint = barPosition.add(progressDirection.uniformScale(halfLength));

            if (startPoint.distance(endPoint) < 0.0001) {
                 print("Warning: Progress bar start and end points are too close.");
                 return null;
            }
            const axis = endPoint.sub(startPoint).normalize();
            const length = startPoint.distance(endPoint);

            return { startPoint, endPoint, axisVector: axis, length };
        } catch (e) {
            print("Error calculating progress bar bounds: " + e);
            return null;
        }
    }

    // MODIFIED: loadTrack uses stop(false) and cancels scrub/flag
    private loadTrack(index: number): void {
        if (this.isScrubbing) {
            print("Cancelling scrub due to loadTrack call.");
            this.isScrubbing = false;
            this.isPerformingScrubRestart = false; // Ensure flag is reset
        }
        if (this.isLoadingRemote) { print(`Load track (${index}) ignored: Loading remote.`); return; }
        if (index < 0 || index >= this.allTracksData.length) { print(`Error: Invalid track index ${index}.`); this.stopTrack(); return; }

        const playAfterLoad = this.shouldAutoPlay;
        this.shouldAutoPlay = false;

        this.audioInitialized = false;
        this.isManualStop = false;

        // --- Stop Sequence ---
        let wasPlayingOrPaused = this.isPlaying || this.isPaused;
        if (wasPlayingOrPaused && this.audioComponent) {
             if (this.audioComponent.isPlaying() || this.audioComponent.isPaused()) {
                 try {
                     // No flag needed here, stopTrack handles flag reset if called externally
                     this.audioComponent.stop(false);
                 } catch(e){
                     print("Error stopping previous track: "+e);
                     this.isPerformingScrubRestart = false; // Reset on error just in case
                 }
             }
        }
        this.isPlaying = false;
        this.isPaused = false;
        this.currentPlaybackTime = 0;
        if (this.audioComponent) {
            try { this.audioComponent.audioTrack = null; } catch(e) { print("Error clearing audioTrack: "+e); }
        }
        // --- End Stop Sequence ---

        this.currentTrackIndex = index;
        const trackData = this.allTracksData?.[this.currentTrackIndex];
        if (!trackData) {
            print(`Error: No track data found for index ${index}. Stopping.`);
            this.handleLoadError(index, "Track data not found");
            return;
        }
        this.updateTrackInfo();
        this.updateActivePrefab();

        print(`Loading track ${index}: ${trackData.title} (${trackData.isRemote ? 'Remote' : 'Local'}) - Intent to play: ${playAfterLoad}`);

        // --- Load/Download Logic ---
        if (trackData.isRemote) {
            this.isLoadingRemote = true;
            const remoteAsset = trackData.asset as RemoteReferenceAsset;
            if (this.timecodeText) this.timecodeText.text = "Loading...";

            const onDownloadedCallback = (downloadedAsset: Asset) => {
                if (this.currentTrackIndex !== index || !this.isLoadingRemote) {
                    print(`Download callback for index ${index} ignored, current index is ${this.currentTrackIndex}, loading: ${this.isLoadingRemote}`);
                    this.isLoadingRemote = (this.currentTrackIndex === index && this.isLoadingRemote);
                    return;
                }
                this.isLoadingRemote = false;
                if (downloadedAsset && downloadedAsset.isOfType("Asset.AudioTrackAsset")) {
                    const audioTrack = downloadedAsset as AudioTrackAsset;
                    print(`Remote track ${trackData.title} downloaded.`);
                    if (!this.audioComponent) { print("Error: AudioComponent missing after download."); this.handleLoadError(index, "AudioComponent missing"); return; }
                    try {
                        this.audioComponent.audioTrack = audioTrack;
                        this.setupTrackFinishedCallback(); // Re-setup after setting new track
                        this.audioInitialized = true;
                        this.trackStartTime = getTime(); this.currentPlaybackTime = 0;
                        if (playAfterLoad) {
                            print("Auto-playing downloaded remote track.");
                            this.delayedCall(0.05, () => this.playTrack());
                        } else {
                            this.updatePlayer();
                        }
                    } catch (e) { print("Error setting downloaded audio track: " + e); this.handleLoadError(index, "Error setting track"); }
                } else {
                    print(`Download failed or invalid asset type for index ${index}.`);
                    this.handleLoadError(index, "Invalid asset type or failed download");
                }
            };
             const onFailedCallback = () => {
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
                 this.isLoadingRemote = false;
                 this.handleLoadError(index, "Error initiating download");
            }
        } else { // Local Asset
             if (!this.audioComponent) { print("Error: AudioComponent missing for local load."); this.handleLoadError(index, "AudioComponent missing"); return; }
            try {
                const localAsset = trackData.asset as AudioTrackAsset;
                this.audioComponent.audioTrack = localAsset;
                this.setupTrackFinishedCallback(); // Re-setup after setting new track
                this.audioInitialized = true;
                this.trackStartTime = getTime(); this.currentPlaybackTime = 0;
                print(`Local track ${trackData.title} loaded.`);
                if (playAfterLoad) {
                    print("Auto-playing local track.");
                    this.delayedCall(0.05, () => this.playTrack());
                } else {
                    this.updatePlayer();
                }
            } catch (e) {
                print("Error loading local audio track: " + e);
                this.handleLoadError(index, "Local load error");
            }
        }
    }

    private handleLoadError(failedIndex: number, reason: string): void {
         print(`Handling load error for track ${failedIndex}: ${reason}`);
         if (this.currentTrackIndex === failedIndex) {
             this.isScrubbing = false; // Ensure scrubbing stops on error
             this.isPerformingScrubRestart = false; // Reset flag on error
             this.stopTrack(); // Reset to a safe state
             if (this.artistNameText) this.artistNameText.text = "Error";
             if (this.trackTitleText) this.trackTitleText.text = "Load Failed";
             if (this.timecodeText) this.timecodeText.text = "--:-- / --:--";
             this.updateActivePrefab();
         } else {
             print(`Load error for index ${failedIndex} occurred, but current index is ${this.currentTrackIndex}. Ignoring stop.`);
         }
    }

    private togglePlayPause(): void {
        if (this.isScrubbing) { print("Play/Pause ignored: Scrubbing."); return; }
        if (this.isLoadingRemote) { print("Play/Pause ignored: Loading remote."); return; }
        if (this.allTracksData.length === 0) { print("Play/Pause ignored: No tracks."); return; }

        if (this.isPlaying) {
             this.pauseTrack();
        } else { // Not currently playing
             if (this.currentTrackIndex === -1) {
                 print("Starting playback from stopped state (loading track 0).");
                 this.shouldAutoPlay = true;
                 this.loadTrack(0);
             } else if (this.isPaused && this.audioInitialized && this.audioComponent?.audioTrack) {
                 print("Resuming playback.");
                 this.playTrack();
             } else if (!this.isPaused && this.audioInitialized && this.audioComponent?.audioTrack) {
                 print("Starting playback of already loaded track.");
                 this.playTrack();
             } else if (!this.audioInitialized && this.currentTrackIndex !== -1) {
                 print("Track selected but not initialized. Reloading with play intent.");
                 this.shouldAutoPlay = true;
                 this.loadTrack(this.currentTrackIndex);
             } else {
                 print("Play/Pause ignored: Unexpected state or no track loaded.");
                 if(this.currentTrackIndex !== -1 && !this.audioInitialized) {
                     print("Attempting to reload current track due to uninitialized state.");
                     this.shouldAutoPlay = true;
                     this.loadTrack(this.currentTrackIndex);
                 }
             }
        }
         this.updateButtonVisuals(); // Optional
    }

    private playTrack(): void {
        if (this.isScrubbing) { print("Play track ignored: Scrubbing."); return; }
        if (this.isLoadingRemote) { print("Play track ignored: Loading remote."); return; }
        if (!this.audioInitialized || !this.audioComponent || !this.audioComponent.audioTrack) {
            print(`Cannot play: Not initialized (Init:${this.audioInitialized}, Comp:${!!this.audioComponent}, Track:${!!this.audioComponent?.audioTrack}).`);
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
                this.isPlaying = true;
                this.isPaused = false;
                this.trackStartTime = getTime() - this.currentPlaybackTime;
            } else if (!this.isPlaying) {
                print(`Starting playback from beginning: ${currentTitle}`);
                this.currentPlaybackTime = 0;
                this.trackStartTime = getTime();
                this.audioComponent.play(1); // Play once
                this.isPlaying = true;
                this.isPaused = false;
            }
            this.isManualStop = false;
        } catch (e) {
            print(`Error executing play/resume for track ${this.currentTrackIndex}: ${e}`);
            this.handleLoadError(this.currentTrackIndex, "Playback error");
        }
        this.updateButtonVisuals(); // Optional
    }

    private pauseTrack(): void {
        if (this.isScrubbing) { print("Pause ignored: Scrubbing."); return; }
        if (!this.isPlaying || !this.audioInitialized || !this.audioComponent || !this.audioComponent.isPlaying()) {
             if(this.isPlaying) { this.isPlaying = false; this.isPaused = true; } // Force state if needed
             return;
        }

        try {
            const currentTitle = this.allTracksData[this.currentTrackIndex]?.title || "Unknown Title";
            this.currentPlaybackTime = Math.max(0, getTime() - this.trackStartTime);
            this.audioComponent.pause();
            this.isPlaying = false;
            this.isPaused = true;
            print(`Paused at ${this.formatTime(this.currentPlaybackTime)}`);
        } catch (e) {
            print("Error pausing track: " + e);
            this.currentPlaybackTime = Math.max(0, getTime() - this.trackStartTime);
            this.isPlaying = false;
            this.isPaused = true;
        }
        this.updateButtonVisuals(); // Optional
    }

    // MODIFIED: stopTrack resets flag
    public stopTrack(): void {
         print("Stop track called.");
         if (this.isScrubbing) {
             print("Cancelling scrub due to stopTrack call.");
             this.isScrubbing = false;
         }
         this.isPerformingScrubRestart = false; // Ensure flag is reset on stop
         this.isManualStop = true;
         this.isLoadingRemote = false;
         this.pendingDelayedCalls = [];

         if (this.audioComponent) {
             if (this.audioComponent.isPlaying() || this.audioComponent.isPaused()) {
                 try { this.audioComponent.stop(false); } catch (e) { print("Error stopping audio component: " + e); }
             }
             try { this.audioComponent.audioTrack = null; } catch (e) { print("Error clearing audio track on stop: " + e); }
         }

         this.isPlaying = false;
         this.isPaused = false;
         this.shouldAutoPlay = false;
         this.currentTrackIndex = -1;
         this.audioInitialized = false;
         this.currentPlaybackTime = 0;

         this.updateEarthPosition(0, 1);
         this.updateTrackInfo();
         this.updateActivePrefab();
         this.updateButtonVisuals(); // Optional

         print("Player stopped & reset.");
    }


    private nextTrack(): void {
        if (this.isScrubbing) { print("Next ignored: Scrubbing."); return; }
        if (this.isLoadingRemote) { print("Next ignored: Loading."); return; }
        if (this.allTracksData.length === 0) { print("Next ignored: No tracks."); return; }
        let nextIndex = -1;
        const currentIndex = this.currentTrackIndex;

        if (this.isRepeatEnabled && currentIndex !== -1) { nextIndex = currentIndex; }
        else if (this.isShuffleEnabled) { if (this.allTracksData.length > 1) { do { nextIndex = Math.floor(Math.random() * this.allTracksData.length); } while (nextIndex === currentIndex); } else { nextIndex = 0; } }
        else { nextIndex = (currentIndex === -1) ? 0 : currentIndex + 1; if (nextIndex >= this.allTracksData.length) { if (this.loopPlayback) { nextIndex = 0; } else { print("Reached end, no loop enabled. Stopping."); this.stopTrack(); return; } } }

        if (nextIndex < 0 || nextIndex >= this.allTracksData.length) { print(`Next error: Invalid calculated index (${nextIndex}). Stopping.`); this.stopTrack(); return; }

        this.shouldAutoPlay = true;
        this.loadTrack(nextIndex);
    }

    private prevTrack(): void {
        if (this.isScrubbing) { print("Prev ignored: Scrubbing."); return; }
        if (this.isLoadingRemote) { print("Prev ignored: Loading."); return; }
        if (this.allTracksData.length === 0) { print("Prev ignored: No tracks."); return; }
        let prevIndex = -1;
        const currentIndex = this.currentTrackIndex;

        if (this.isRepeatEnabled && currentIndex !== -1) { prevIndex = currentIndex; }
        else if (this.isShuffleEnabled) { if (this.allTracksData.length > 1) { do { prevIndex = Math.floor(Math.random() * this.allTracksData.length); } while (prevIndex === currentIndex); } else { prevIndex = 0; } }
        else { prevIndex = (currentIndex === -1) ? this.allTracksData.length - 1 : currentIndex - 1; if (prevIndex < 0) { if (this.loopPlayback) { prevIndex = this.allTracksData.length - 1; } else { print("Reached beginning, no loop enabled. Stopping."); this.stopTrack(); return; } } }

        if (prevIndex < 0 || prevIndex >= this.allTracksData.length) { print(`Prev error: Invalid calculated index (${prevIndex}). Stopping.`); this.stopTrack(); return; }

        this.shouldAutoPlay = true;
        this.loadTrack(prevIndex);
    }


    private updateTrackInfo(): void {
        let artist = "";
        let title = "Stopped";
        let timecode = "00:00 / 00:00"; // Default timecode

        if (this.isLoadingRemote && this.currentTrackIndex !== -1 && this.currentTrackIndex < this.allTracksData.length) {
            const loadingData = this.allTracksData[this.currentTrackIndex];
            artist = loadingData?.artist || "";
            title = loadingData?.title || "Loading...";
            timecode = "Loading...";
        } else if (this.currentTrackIndex !== -1 && this.currentTrackIndex < this.allTracksData.length) {
            const currentData = this.allTracksData[this.currentTrackIndex];
            if (currentData) {
                artist = currentData.artist;
                title = currentData.title;
            } else {
                artist = "Error"; title = "Invalid Track"; timecode = "--:-- / --:--";
            }
        } else if (this.currentTrackIndex !== -1) { // Index out of bounds?
             artist = "Error"; title = "Invalid Index"; timecode = "--:-- / --:--";
        }

        if (this.artistNameText) this.artistNameText.text = artist;
        if (this.trackTitleText) this.trackTitleText.text = title;

        if (this.timecodeText && !this.isScrubbing && (this.isLoadingRemote || this.currentTrackIndex === -1 || timecode !== "00:00 / 00:00")) {
            this.timecodeText.text = timecode;
        }

        if (!this.isScrubbing && (this.currentTrackIndex === -1 || this.isLoadingRemote)) {
            this.updateEarthPosition(0, 1);
        }
         this.updateButtonVisuals(); // Optional
    }

    // MODIFIED: Prevent sphere updates during scrub
    private updatePlayer(): void {
        if (this.isScrubbing) { return; } // Player time/position frozen during scrub

        if (this.isLoadingRemote || this.currentTrackIndex === -1 || !this.audioInitialized || !this.audioComponent || !this.audioComponent.audioTrack) {
            if (!this.isLoadingRemote && this.currentTrackIndex === -1) {
                 this.updateEarthPosition(0, 1); // Reset position if stopped
                 if (this.timecodeText && this.timecodeText.text !== "00:00 / 00:00") this.timecodeText.text = "00:00 / 00:00";
            }
            return;
        }

        let currentTime = 0;
        let totalTime = 0;

        try {
            totalTime = this.audioComponent.duration || 0;

            if (this.isPlaying) {
                currentTime = getTime() - this.trackStartTime;
            } else if (this.isPaused) {
                currentTime = this.currentPlaybackTime;
            } else {
                 currentTime = this.currentPlaybackTime;
            }

            currentTime = Math.max(0, currentTime);
            if (totalTime > 0.001) {
                currentTime = Math.min(currentTime, totalTime);
            } else {
                totalTime = 0;
                 if (totalTime <= 0) currentTime = 0;
            }

            if (this.timecodeText) {
                this.timecodeText.text = `${this.formatTime(currentTime)} / ${this.formatTime(totalTime)}`;
            }

            this.updateEarthPosition(currentTime, totalTime);

        } catch (e) {
            print("Error updating player state: " + e);
            if (this.timecodeText) { this.timecodeText.text = "--:-- / --:--"; }
            this.updateEarthPosition(0, 1);
        }
    }

    // MODIFIED: Uses getProgressBarBounds and checks scrub state
    private updateEarthPosition(currentTime: number, totalTime: number): void {
        if (this.isScrubbing || !this.earthSphere || !this.progressBar) return;

        try {
            const bounds = this.getProgressBarBounds();
            if (!bounds || bounds.length <= 0.001) return; // Need valid bounds

            let progress = (totalTime > 0.001) ? (currentTime / totalTime) : 0;
            progress = Math.max(0, Math.min(1, progress));

            const targetPositionOnLine = bounds.startPoint.add(bounds.axisVector.uniformScale(progress * bounds.length));

            const barRotation = this.progressBar.getTransform().getWorldRotation();
            const progressDirection = barRotation.multiplyVec3(vec3.right());
            const offsetVector = progressDirection.uniformScale(this.earthSphereXOffset);
            const finalPosition = targetPositionOnLine.add(offsetVector);

            this.earthSphere.getTransform().setWorldPosition(finalPosition);

        } catch (e) {
            print("Error updating earth position: " + e);
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
            this.updateEarthPosition(0, 1);
        }
    }

    private updateSphereRotation(): void {
        if (this.isScrubbing || !this.earthSphere) return; // Don't rotate while scrubbing
         try {
            const deltaTime = getDeltaTime();
            const earthTransform = this.earthSphere.getTransform();
            const currentRotation = earthTransform.getLocalRotation();
            const rotationDelta = quat.fromEulerAngles(0, this.rotationSpeed * deltaTime, 0); // Assuming rotationSpeed is in degrees/sec
            const newRotation = currentRotation.multiply(rotationDelta);
            earthTransform.setLocalRotation(newRotation);
        } catch(e) {
            print("Error updating sphere rotation: "+e);
        }
    }

     private updateButtonVisuals(): void {
         // Example placeholder
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

        // Remove interaction listeners first
        if (this.earthSphereInteraction) {
             if(this.onScrubStartCallback) this.earthSphereInteraction.onManipulationStart.remove(this.onScrubStartCallback);
             if(this.onScrubUpdateCallback) this.earthSphereInteraction.onManipulationUpdate.remove(this.onScrubUpdateCallback);
             if(this.onScrubEndCallback) this.earthSphereInteraction.onManipulationEnd.remove(this.onScrubEndCallback);
        }

        this.pendingDelayedCalls = [];

        if (this.audioComponent && (this.isPlaying || this.isPaused)) {
            try {
                print("Stopping audio component on destroy...");
                this.audioComponent.stop(false);
                this.audioComponent.audioTrack = null;
            } catch (e) { print("Error stopping audio on destroy: " + e); }
        }
        // Remove event listeners
        if (this.playPauseButton && this.onPlayPauseCallback) this.playPauseButton.onButtonPinched.remove(this.onPlayPauseCallback);
        if (this.nextTrackButton && this.onNextTrackCallback) this.nextTrackButton.onButtonPinched.remove(this.onNextTrackCallback);
        if (this.prevTrackButton && this.onPrevTrackCallback) this.prevTrackButton.onButtonPinched.remove(this.onPrevTrackCallback);
        if (this.repeatButton && this.onRepeatCallback) this.repeatButton.onButtonPinched.remove(this.onRepeatCallback);
        if (this.shuffleButton && this.onShuffleCallback) this.shuffleButton.onButtonPinched.remove(this.onShuffleCallback);
        if (this.stopButton && this.onStopCallback) this.stopButton.onButtonPinched.remove(this.onStopCallback);

        if (this.audioComponent) {
            try { this.audioComponent.setOnFinish(null); } catch (e) { print("Error removing onFinish callback: " + e);}
        }

        this.disableAllPrefabs();
     }
} // End of class MusicPlayerManager