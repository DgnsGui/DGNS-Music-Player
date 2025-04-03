import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { InteractorEvent } from 'SpectaclesInteractionKit/Core/Interactor/InteractorEvent';
// **** ADD THIS IMPORT ****
import { InteractableManipulation } from 'SpectaclesInteractionKit/Components/Interaction/InteractableManipulation/InteractableManipulation';
import { TransformEventArg } from 'SpectaclesInteractionKit/Core/Interaction/InteractionEventArg'; // For Manipulation events

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

// **** Helper Interface for Bar Bounds ****
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
    // **** ADD THIS INPUT ****
    @input('Component.ScriptComponent') earthSphereInteraction: InteractableManipulation;
    @input('Component.AudioComponent') audioComponent: AudioComponent;
    @input('bool') loopPlayback: boolean = true;
    @input('number') earthSphereXOffset: number = 0; // Keep this if you still want a baseline offset
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
    // **** ADD SCRUBBING STATE ****
    private isScrubbing: boolean = false;
    private wasPlayingBeforeScrub: boolean = false;
    private scrubTargetTime: number = 0; // To store target time during scrub update

    // --- Callbacks ---
    private onPlayPauseCallback: (event: InteractorEvent) => void;
    private onNextTrackCallback: (event: InteractorEvent) => void;
    private onPrevTrackCallback: (event: InteractorEvent) => void;
    private onRepeatCallback: (event: InteractorEvent) => void;
    private onShuffleCallback: (event: InteractorEvent) => void;
    private onStopCallback: (event: InteractorEvent) => void;
    private onTrackFinishedCallback: (audioComponent: AudioComponent) => void;
    // **** ADD MANIPULATION CALLBACKS ****
    private onScrubStartCallback: (event: TransformEventArg) => void;
    private onScrubUpdateCallback: (event: TransformEventArg) => void;
    private onScrubEndCallback: (event: TransformEventArg) => void;


    // --- Core Methods ---
    onAwake(): void {
        this.api.stopTrack = this.stopTrack.bind(this);
        // **** ADD VALIDATION FOR NEW INPUT ****
        if (!this.validateInputs() || !this.earthSphereInteraction) {
             print("Input validation failed (check earthSphereInteraction too).");
             return;
        }
        this.combineTrackData();
        if (this.allTracksData.length === 0) { print("No tracks provided."); }
        this.disableAllPrefabs();
        this.setupCallbacks(); // Original button callbacks
        this.setupInteractionCallbacks(); // **** NEW: Scrubbing callbacks ****
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

    // --- MODIFIED: Added earthSphereInteraction validation ---
    private validateInputs(): boolean {
        let isValid = true;
        if (!this.audioComponent) { print("Error: Audio component not defined."); isValid = false; }
        if (!this.earthSphere || !this.progressBar) { print("Warning: Progress visualization objects not defined."); isValid = false; } // Make these essential for scrubbing
        // **** ADDED ****
        if (!this.earthSphereInteraction) { print("Error: Earth Sphere Interaction (InteractableManipulation) not defined."); isValid = false; }
        // ... (rest of the validation remains the same)
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

    // --- ADDED: Setup Interaction Callbacks ---
    private setupInteractionCallbacks(): void {
        this.onScrubStartCallback = this.onScrubStart.bind(this);
        this.onScrubUpdateCallback = this.onScrubUpdate.bind(this);
        this.onScrubEndCallback = this.onScrubEnd.bind(this);

        if (this.earthSphereInteraction) {
            this.earthSphereInteraction.onManipulationStart.add(this.onScrubStartCallback);
            this.earthSphereInteraction.onManipulationUpdate.add(this.onScrubUpdateCallback);
            this.earthSphereInteraction.onManipulationEnd.add(this.onScrubEndCallback);
        }
    }

    // --- ADDED: Scrub Start Handler ---
    private onScrubStart(event: TransformEventArg): void {
        // Ignore if no track loaded/playing, or if loading remote
        if (this.currentTrackIndex < 0 || !this.audioInitialized || this.isLoadingRemote || !this.audioComponent?.audioTrack) {
            print("Scrub start ignored: Player not ready.");
            // We might want to forcibly stop the interaction if it starts in an invalid state
            // This requires accessing the InteractionManager, which is complex.
            // For now, just ignoring is simpler. The update/end handlers will also ignore.
            return;
        }

        print("Scrub Start");
        this.isScrubbing = true;
        this.wasPlayingBeforeScrub = this.isPlaying;
        // Optional: Pause playback during scrub for potentially smoother visual sync
        // if (this.isPlaying) {
        //     this.pauseTrack(); // Pause but remember we were playing
        // }
    }

    // --- ADDED: Scrub Update Handler ---
    private onScrubUpdate(event: TransformEventArg): void {
        if (!this.isScrubbing || !this.earthSphere || !this.progressBar || !this.audioComponent || !this.audioComponent.audioTrack) {
             // If scrubbing started incorrectly or state changed, exit
             if (this.isScrubbing) {
                 print("Scrub update aborted: Invalid state.");
                 this.isScrubbing = false; // Reset flag
             }
            return;
        }

        try {
            const earthTransform = this.earthSphere.getTransform();
            // NOTE: InteractableManipulation typically provides the *target* transform
            // in the event args, but reading the sphere's actual current world pos
            // might be more reliable if filters/other scripts affect it.
            // Let's use the sphere's transform directly.
            const currentSpherePos = earthTransform.getWorldPosition();

            const bounds = this.getProgressBarBounds();
            if (!bounds) return; // Cannot calculate bounds

            // Project sphere's position onto the progress bar's axis
            const vectorToSphere = currentSpherePos.sub(bounds.startPoint);
            const dotProduct = vectorToSphere.dot(bounds.axisVector);
            const projectedLength = Math.max(0, Math.min(bounds.length, dotProduct)); // Clamp to 0 -> length

            // Calculate the new clamped position on the bar's line
            const newPosOnLine = bounds.startPoint.add(bounds.axisVector.uniformScale(projectedLength));

            // Calculate the offset vector based on the bar's rotation (like in updateEarthPosition)
            const barRotation = this.progressBar.getTransform().getWorldRotation();
            const progressDirection = barRotation.multiplyVec3(vec3.right()); // Assumes bar stretches along its local X
            const offsetVector = progressDirection.uniformScale(this.earthSphereXOffset);
            const finalClampedPosition = newPosOnLine.add(offsetVector);


            // Directly set the sphere's position
            earthTransform.setWorldPosition(finalClampedPosition);

            // Calculate progress and update preview time
            const progress = (bounds.length > 0.001) ? (projectedLength / bounds.length) : 0;
            const totalTime = this.audioComponent.duration || 0;
            this.scrubTargetTime = progress * totalTime; // Store the target time

            if (this.timecodeText) {
                this.timecodeText.text = `${this.formatTime(this.scrubTargetTime)} / ${this.formatTime(totalTime)} (Scrubbing)`;
            }

        } catch (e) {
            print("Error during scrub update: " + e);
            this.isScrubbing = false; // Exit scrubbing on error
        }
    }

    // --- ADDED: Scrub End Handler ---
    private onScrubEnd(event: TransformEventArg): void {
        if (!this.isScrubbing) {
            return; // Ignore if not scrubbing (e.g., cancelled)
        }

        print("Scrub End");
        this.isScrubbing = false;

        // Make sure we are still in a valid state to seek
        if (this.currentTrackIndex < 0 || !this.audioInitialized || this.isLoadingRemote || !this.audioComponent || !this.audioComponent.audioTrack) {
            print("Scrub end ignored: Player not ready for seek.");
             // Reset timecode text if needed
             this.updatePlayer(); // Try to refresh UI state
            return;
        }

        const seekTime = Math.max(0, this.scrubTargetTime); // Use the final calculated time
        const totalTime = this.audioComponent.duration || 0;

        print(`Seeking to: ${this.formatTime(seekTime)} / ${this.formatTime(totalTime)}`);

        try {
            // --- SEEK IMPLEMENTATION (Stop + Play with offset) ---
            this.audioComponent.stop(false); // Stop immediately

            // Reset internal state *before* starting playback again
            this.isPlaying = false;
            this.isPaused = false; // Assume we will start playing, adjust later if needed
            this.currentPlaybackTime = seekTime; // Set the target time
            this.trackStartTime = getTime() - seekTime; // Adjust start time for accurate updates
            this.isManualStop = false; // Ensure this isn't set

            // Start playback from the seeked time
            this.audioComponent.play(1, seekTime);
            this.isPlaying = true; // Mark as playing *after* successful call

            // If the track was paused *before* scrubbing began, pause it again immediately
            if (!this.wasPlayingBeforeScrub) {
                 print("Restoring paused state after scrub.");
                 // Need a tiny delay potentially for the engine to process play->pause quickly
                 this.delayedCall(0.01, () => {
                     if(this.currentTrackIndex !== -1 && this.isPlaying) { // Check if still valid to pause
                        this.pauseTrack();
                     } else {
                         print("Skipped post-scrub pause (state changed).");
                         // If we can't pause, ensure the UI updates correctly
                          this.updatePlayer();
                     }
                 });
            } else {
                // If it was playing, just let it continue and update the UI
                 this.updatePlayer(); // Update UI immediately after seek
            }
            // --- End Seek ---

        } catch (e) {
            print(`Error during seek (stop/play offset): ${e}`);
            // Attempt to recover state / UI
            this.stopTrack(); // Safest recovery might be to stop fully
            this.updatePlayer();
        }

         // Clear scrubbing indicator from timecode
         if (this.timecodeText && this.timecodeText.text.endsWith("(Scrubbing)")) {
             this.updatePlayer(); // Force redraw without the scrubbing text
         }
    }

     // --- ADDED: Helper to get Progress Bar Bounds ---
    private getProgressBarBounds(): ProgressBarBounds | null {
        if (!this.progressBar) return null;

        try {
            const barTransform = this.progressBar.getTransform();
            const barScale = barTransform.getWorldScale();
            const barPosition = barTransform.getWorldPosition();
            const barRotation = barTransform.getWorldRotation();

            // Use bar's local X-axis as the direction of progress
            const progressDirection = barRotation.multiplyVec3(vec3.right());

            const halfLength = barScale.x / 2.0;
            const startPoint = barPosition.sub(progressDirection.uniformScale(halfLength));
            const endPoint = barPosition.add(progressDirection.uniformScale(halfLength));
            const axis = endPoint.sub(startPoint).normalize();
            const length = startPoint.distance(endPoint);

            return { startPoint, endPoint, axisVector: axis, length };
        } catch (e) {
            print("Error calculating progress bar bounds: " + e);
            return null;
        }
    }


    // --- MODIFIED: Prevent sphere updates during scrub ---
    private updatePlayer(): void {
        // **** ADDED CHECK ****
        if (this.isScrubbing) {
            // While scrubbing, the timecode is updated in onScrubUpdate
            // We just need to prevent the automatic sphere position update here.
            return;
        }

        // Exit if loading, stopped, or not initialized properly
        if (this.isLoadingRemote || this.currentTrackIndex === -1 || !this.audioInitialized || !this.audioComponent || !this.audioComponent.audioTrack) {
            // ... (rest of the early exit logic remains)
             if (!this.isLoadingRemote && this.currentTrackIndex === -1) {
                 this.updateEarthPosition(0, 1);
                 if (this.timecodeText && this.timecodeText.text !== "00:00 / 00:00") this.timecodeText.text = "00:00 / 00:00";
            }
            return;
        }

        // ... (rest of the updatePlayer logic for calculating currentTime, totalTime, updating timecodeText)
        let currentTime = 0;
        let totalTime = 0;

        try {
            totalTime = this.audioComponent.duration || 0;

            if (this.isPlaying) {
                currentTime = getTime() - this.trackStartTime;
            } else if (this.isPaused) {
                currentTime = this.currentPlaybackTime;
            } else {
                 currentTime = this.currentPlaybackTime; // Use stored time if just loaded/stopped internally
            }

            currentTime = Math.max(0, currentTime);
            if (totalTime > 0) {
                currentTime = Math.min(currentTime, totalTime);
            } else {
                totalTime = 0;
            }

            if (this.timecodeText) {
                 // Don't update if scrubbing (handled in onScrubUpdate)
                this.timecodeText.text = `${this.formatTime(currentTime)} / ${this.formatTime(totalTime)}`;
            }

             // **** IMPORTANT: Only update sphere position if NOT scrubbing ****
            this.updateEarthPosition(currentTime, totalTime); // Normal update based on playback

        } catch (e) {
            // ... (error handling remains)
             print("Error updating player state (likely audioComponent access): " + e);
            if (this.timecodeText) { this.timecodeText.text = "--:-- / --:--"; }
            this.updateEarthPosition(0, 1);
        }
    }

    // --- updateEarthPosition remains mostly the same, calculates position from time ---
    // It's now only called by updatePlayer when *not* scrubbing.
    private updateEarthPosition(currentTime: number, totalTime: number): void {
        // **** ADDED CHECK: Don't fight scrubbing ****
        if (this.isScrubbing || !this.earthSphere || !this.progressBar) return;

        try {
            const bounds = this.getProgressBarBounds();
            if (!bounds) return; // Need bounds

            let progress = (totalTime > 0.001) ? (currentTime / totalTime) : 0;
            progress = Math.max(0, Math.min(1, progress));

            // Interpolate the position along the progress direction (using bounds)
            const targetPositionOnLine = bounds.startPoint.add(bounds.axisVector.uniformScale(progress * bounds.length));

             // Calculate the offset vector based on the bar's rotation
            const barRotation = this.progressBar.getTransform().getWorldRotation();
            const progressDirection = barRotation.multiplyVec3(vec3.right()); // Assumes bar stretches along its local X
            const offsetVector = progressDirection.uniformScale(this.earthSphereXOffset);
            const finalPosition = targetPositionOnLine.add(offsetVector);

            // Set the earth's world position
            this.earthSphere.getTransform().setWorldPosition(finalPosition);

        } catch (e) {
            print("Error updating earth position: " + e);
        }
    }

    // --- MODIFIED: Cancel scrub on stop ---
    public stopTrack(): void {
         print("Stop track called.");
         // **** ADDED ****
         if (this.isScrubbing) {
             print("Cancelling scrub due to stopTrack call.");
             this.isScrubbing = false;
             // Optionally, reset wasPlayingBeforeScrub if needed, though stopTrack resets state anyway
         }
         // ... (rest of stopTrack remains the same)
         this.isManualStop = true;
         this.isLoadingRemote = false;
         this.pendingDelayedCalls = [];

         // ... stop audio component ...
         if (this.audioComponent) {
             if (this.audioComponent.isPlaying() || this.audioComponent.isPaused()) {
                 print("Stopping audio component (immediate)...");
                 try { this.audioComponent.stop(false); } catch (e) { print("Error stopping audio component: " + e); }
             }
             try { this.audioComponent.audioTrack = null; } catch (e) { print("Error clearing audio track on stop: " + e); }
         }

         // ... reset state variables ...
         this.isPlaying = false;
         this.isPaused = false;
         this.shouldAutoPlay = false;
         this.currentTrackIndex = -1;
         this.audioInitialized = false;
         this.currentPlaybackTime = 0;

         // ... update UI ...
         this.updateEarthPosition(0, 1);
         this.updateTrackInfo();
         this.updateActivePrefab();

         print("Player stopped & reset.");
    }

     // --- MODIFIED: Cancel scrub on next/prev track ---
    private loadTrack(index: number): void {
         // **** ADDED ****
         if (this.isScrubbing) {
             print("Cancelling scrub due to loadTrack call.");
             this.isScrubbing = false;
         }
         // ... (rest of loadTrack preamble)
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
                 print("Stopping previous track (immediate)...");
                 try { this.audioComponent.stop(false); } catch(e){ print("Error stopping previous track: "+e); }
             }
        }
        this.isPlaying = false;
        this.isPaused = false;
        this.currentPlaybackTime = 0;
        if (this.audioComponent) {
            try { this.audioComponent.audioTrack = null; } catch(e) { print("Error clearing audioTrack: "+e); }
        }
        // --- End Stop Sequence ---

        // ... (rest of loadTrack including index setting, UI updates, load/download logic) ...
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
        // ... (Load/Download Logic remains the same) ...
    }


    // --- Cleanup ---
    onDestroy(): void {
        print("Destroying MusicPlayerManager.");
        // **** ADDED: Remove interaction listeners ****
        if (this.earthSphereInteraction) {
             if(this.onScrubStartCallback) this.earthSphereInteraction.onManipulationStart.remove(this.onScrubStartCallback);
             if(this.onScrubUpdateCallback) this.earthSphereInteraction.onManipulationUpdate.remove(this.onScrubUpdateCallback);
             if(this.onScrubEndCallback) this.earthSphereInteraction.onManipulationEnd.remove(this.onScrubEndCallback);
        }
        // ... (rest of onDestroy remains the same) ...
        this.pendingDelayedCalls = [];

        if (this.audioComponent && (this.isPlaying || this.isPaused)) {
            try {
                print("Stopping audio component on destroy...");
                this.audioComponent.stop(false);
                this.audioComponent.audioTrack = null;
            } catch (e) { print("Error stopping audio on destroy: " + e); }
        }
        // ... remove button listeners ...
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


    // --- NO CHANGES needed below this line usually ---
    // (Keep existing combineTrackData, disableAllPrefabs, setupCallbacks, setupTrackFinishedCallback, handleTrackFinished, updateActivePrefab, delayedCall, checkDelayedCalls, handleLoadError, togglePlayPause, playTrack, pauseTrack, nextTrack, prevTrack, updateTrackInfo, formatTime, setupProgressBar, updateSphereRotation, getCurrentTrackIndex, getTrackPrefab)
    // ... (Make sure all functions listed above are present in your final file)

    // --- [ Ensure these existing functions are present ] ---

    private disableAllPrefabs(): void {
        this.allTracksData.forEach(track => { if (track.prefab) track.prefab.enabled = false; });
        if (this.stoppedPrefab) this.stoppedPrefab.enabled = false;
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
            this.onPlayPauseCallback = (event: InteractorEvent) => { const ct=getTime(); if (ct-this.lastPinchTimePlayPause < this.DEBOUNCE_TIME || this.isScrubbing) return; this.lastPinchTimePlayPause=ct; this.togglePlayPause(); }; // Added isScrubbing check
            this.playPauseButton.onButtonPinched.add(this.onPlayPauseCallback);
        }
        if (this.nextTrackButton) {
            this.onNextTrackCallback = (event: InteractorEvent) => { const ct=getTime(); if (ct-this.lastPinchTimeNext < this.DEBOUNCE_TIME || this.isScrubbing) return; this.lastPinchTimeNext=ct; this.nextTrack(); }; // Added isScrubbing check
            this.nextTrackButton.onButtonPinched.add(this.onNextTrackCallback);
        }
        if (this.prevTrackButton) {
            this.onPrevTrackCallback = (event: InteractorEvent) => { const ct=getTime(); if (ct-this.lastPinchTimePrev < this.DEBOUNCE_TIME || this.isScrubbing) return; this.lastPinchTimePrev=ct; this.prevTrack(); }; // Added isScrubbing check
            this.prevTrackButton.onButtonPinched.add(this.onPrevTrackCallback);
        }
         if (this.repeatButton) {
            this.onRepeatCallback = (event: InteractorEvent) => {
                const ct = getTime(); if (ct - this.lastPinchTimeRepeat < this.DEBOUNCE_TIME || this.isScrubbing) return; this.lastPinchTimeRepeat = ct; // Add debounce & Scrub check
                this.isRepeatEnabled = !this.isRepeatEnabled; print("Repeat " + (this.isRepeatEnabled ? "enabled" : "disabled")); if (this.isRepeatEnabled) this.isShuffleEnabled = false;
            };
            this.repeatButton.onButtonPinched.add(this.onRepeatCallback);
        }
        if (this.shuffleButton) {
            this.onShuffleCallback = (event: InteractorEvent) => {
                const ct = getTime(); if (ct - this.lastPinchTimeShuffle < this.DEBOUNCE_TIME || this.isScrubbing) return; this.lastPinchTimeShuffle = ct; // Add debounce & Scrub check
                this.isShuffleEnabled = !this.isShuffleEnabled; print("Shuffle mode " + (this.isShuffleEnabled ? "enabled" : "disabled")); if (this.isShuffleEnabled) this.isRepeatEnabled = false;
            };
            this.shuffleButton.onButtonPinched.add(this.onShuffleCallback);
        }
        if (this.stopButton) {
            this.onStopCallback = (event: InteractorEvent) => {
                const ct = getTime(); if (ct - this.lastPinchTimeStop < this.DEBOUNCE_TIME) return; this.lastPinchTimeStop = ct; // Debounce (stopTrack handles scrub cancelling internally)
                this.stopTrack();
            };
            this.stopButton.onButtonPinched.add(this.onStopCallback);
        }
        this.setupTrackFinishedCallback();
    }

     private setupTrackFinishedCallback(): void {
        this.onTrackFinishedCallback = (audioComponent: AudioComponent) => {
            // Added check to prevent acting if manually stopped, paused, or scrubbing
            if (audioComponent !== this.audioComponent || !this.isPlaying || this.isLoadingRemote || this.isManualStop || this.isPaused || this.isScrubbing) { // **** Added isScrubbing ****
                if(this.isManualStop) this.isManualStop = false; // Reset flag if it was set
                print(`Track finished event ignored (ComponentMatch:${audioComponent === this.audioComponent}, IsPlaying:${this.isPlaying}, Loading:${this.isLoadingRemote}, ManualStop:${this.isManualStop}, Paused:${this.isPaused}, Scrubbing:${this.isScrubbing})`);
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
        if (this.currentTrackIndex === -1 || this.allTracksData.length === 0 || this.isScrubbing) { this.stopTrack(); return; } // Added isScrubbing check
        this.shouldAutoPlay = true; // Intent to play next
        let nextIndex = -1;
        // ... (rest of handleTrackFinished logic remains the same) ...
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
        for (let i = this.pendingDelayedCalls.length - 1; i >= 0; i--) {
            const call = this.pendingDelayedCalls[i];
            if (currentTime >= call.executeTime) {
                this.pendingDelayedCalls.splice(i, 1);
                try { call.callback(); } catch (e) { print("Error executing delayed call callback: " + e); }
            }
        }
    }

     private handleLoadError(failedIndex: number, reason: string): void {
         print(`Handling load error for track ${failedIndex}: ${reason}`);
         if (this.currentTrackIndex === failedIndex) {
             this.isScrubbing = false; // Ensure scrubbing stops on error
             this.stopTrack();
             if (this.artistNameText) this.artistNameText.text = "Error";
             if (this.trackTitleText) this.trackTitleText.text = "Load Failed";
             if (this.timecodeText) this.timecodeText.text = "--:-- / --:--";
             this.updateActivePrefab();
         } else {
             print(`Load error for index ${failedIndex} occurred, but current index is ${this.currentTrackIndex}. Ignoring stop.`);
         }
    }

     private togglePlayPause(): void {
        if (this.isScrubbing) { print("Play/Pause ignored: Scrubbing."); return; } // Added check
        if (this.isLoadingRemote) { print("Play/Pause ignored: Loading remote."); return; }
        if (this.allTracksData.length === 0) { print("Play/Pause ignored: No tracks."); return; }
        // ... (rest of togglePlayPause logic remains the same) ...
         print(`Toggle Play/Pause called - State: IsPlaying=${this.isPlaying}, IsPaused=${this.isPaused}, AudioInit=${this.audioInitialized}, CurrentIndex=${this.currentTrackIndex}`);

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
    }

     private playTrack(): void {
        if (this.isScrubbing) { print("Play track ignored: Scrubbing."); return; } // Added check
        if (this.isLoadingRemote) { print("Play track ignored: Loading remote."); return; }
        // ... (rest of playTrack logic remains the same) ...
        if (!this.audioInitialized || !this.audioComponent || !this.audioComponent.audioTrack) {
            print(`Cannot play: Not initialized (Init:${this.audioInitialized}, Comp:${!!this.audioComponent}, Track:${!!this.audioComponent?.audioTrack}).`);
            if (this.currentTrackIndex !== -1) {
                print("Attempting recovery: Reloading current track with play intent.");
                this.shouldAutoPlay = true;
                this.loadTrack(this.currentTrackIndex);
            }
            return;
        }
        // ... (try/catch block for play/resume remains the same) ...
         try {
            const currentTitle = this.allTracksData[this.currentTrackIndex]?.title || "Unknown Title";
            if (this.isPaused) {
                print(`Resuming: ${currentTitle}`);
                this.audioComponent.resume();
                this.isPlaying = true; // State update *after* successful call
                this.isPaused = false;
                this.trackStartTime = getTime() - this.currentPlaybackTime;
            } else if (!this.isPlaying) { // Should only happen if stopped or freshly loaded
                print(`Starting playback from beginning: ${currentTitle}`);
                this.currentPlaybackTime = 0; // Ensure starting from 0
                this.trackStartTime = getTime();
                this.audioComponent.play(1); // Play once
                this.isPlaying = true; // State update *after* successful call
                this.isPaused = false;
            } else {
                print(`Play track called while already playing ${currentTitle}. No action taken.`);
            }
            this.isManualStop = false;
        } catch (e) {
            print(`Error executing play/resume for track ${this.currentTrackIndex}: ${e}`);
            this.handleLoadError(this.currentTrackIndex, "Playback error");
        }
    }

     private pauseTrack(): void {
        if (this.isScrubbing) { print("Pause ignored: Scrubbing."); return; } // Added check
        // ... (rest of pauseTrack logic remains the same) ...
        if (!this.isPlaying || !this.audioInitialized || !this.audioComponent || !this.audioComponent.isPlaying()) {
             print(`Pause ignored: Not in a valid playing state (Playing:${this.isPlaying}, Init:${this.audioInitialized}, CompPlaying:${this.audioComponent?.isPlaying()})`);
             if(this.isPlaying) { this.isPlaying = false; this.isPaused = true; }
             return;
        }
        // ... (try/catch block for pause remains the same) ...
         try {
            const currentTitle = this.allTracksData[this.currentTrackIndex]?.title || "Unknown Title";
            print(`Attempting to pause: ${currentTitle}`);
            this.currentPlaybackTime = Math.max(0, getTime() - this.trackStartTime);
            this.audioComponent.pause();
            this.isPlaying = false; // State update *after* successful call
            this.isPaused = true;
            print(`Paused at ${this.formatTime(this.currentPlaybackTime)}`);
        } catch (e) {
            print("Error pausing track: " + e);
            this.currentPlaybackTime = Math.max(0, getTime() - this.trackStartTime);
            this.isPlaying = false;
            this.isPaused = true;
        }
    }

     private nextTrack(): void {
         if (this.isScrubbing) { print("Next ignored: Scrubbing."); return; } // Added check
        // ... (rest of nextTrack logic remains the same) ...
         if (this.isLoadingRemote) { print("Next ignored: Loading."); return; } if (this.allTracksData.length === 0) { print("Next ignored: No tracks."); return; } print("Next track triggered.");
        let nextIndex = -1;
        // ... (calculation logic remains) ...
        const currentIndex = this.currentTrackIndex;
        if (this.isRepeatEnabled && currentIndex !== -1) { /*...*/ nextIndex = currentIndex;}
        else if (this.isShuffleEnabled) { /*...*/ }
        else { /*...*/ }
        // ... (validation and loadTrack call) ...
        this.shouldAutoPlay = true;
        this.loadTrack(nextIndex);
    }

    private prevTrack(): void {
         if (this.isScrubbing) { print("Prev ignored: Scrubbing."); return; } // Added check
        // ... (rest of prevTrack logic remains the same) ...
        if (this.isLoadingRemote) { print("Prev ignored: Loading."); return; } if (this.allTracksData.length === 0) { print("Prev ignored: No tracks."); return; } print("Prev track triggered");
        let prevIndex = -1;
        // ... (calculation logic remains) ...
        const currentIndex = this.currentTrackIndex;
        if (this.isRepeatEnabled && currentIndex !== -1) { /*...*/ prevIndex = currentIndex;}
        else if (this.isShuffleEnabled) { /*...*/ }
        else { /*...*/ }
        // ... (validation and loadTrack call) ...
        this.shouldAutoPlay = true;
        this.loadTrack(prevIndex);
    }

     private updateTrackInfo(): void {
        // This function updates text fields based on currentTrackIndex, isPlaying, isLoadingRemote etc.
        // It doesn't need direct knowledge of scrubbing, as updatePlayer handles the dynamic timecode
        // unless scrubbing is active (then onScrubUpdate handles the preview).
        // No changes needed here unless you want specific text during scrub (e.g., artist/title).
        // ... (existing logic remains the same) ...
         let artist = "";
        let title = "Stopped";
        let timecode = "00:00 / 00:00";

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
                artist = "Error";
                title = "Invalid Track Data";
                timecode = "--:-- / --:--";
            }
        } else if (this.currentTrackIndex !== -1) {
            artist = "Error";
            title = "Invalid Index";
            timecode = "--:-- / --:--";
        }

        if (this.artistNameText) this.artistNameText.text = artist;
        if (this.trackTitleText) this.trackTitleText.text = title;

        // Let updatePlayer or onScrubUpdate handle the dynamic timecode most of the time
        if (this.timecodeText && !this.isScrubbing && (this.isLoadingRemote || this.currentTrackIndex === -1 || title.startsWith("Invalid") || title === "Error")) {
            this.timecodeText.text = timecode;
        }

        if (!this.isScrubbing && (this.currentTrackIndex === -1 || this.isLoadingRemote)) {
            this.updateEarthPosition(0, 1);
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
        // Don't rotate while scrubbing
        if (this.isScrubbing || !this.earthSphere) return;
         try {
            const deltaTime = getDeltaTime();
            const earthTransform = this.earthSphere.getTransform();
            const currentRotation = earthTransform.getLocalRotation();
            const rotationDelta = quat.fromEulerAngles(0, this.rotationSpeed * deltaTime * (Math.PI / 180.0), 0);
            const newRotation = currentRotation.multiply(rotationDelta);
            earthTransform.setLocalRotation(newRotation);
        } catch(e) {
            print("Error updating sphere rotation: "+e);
        }
    }

    public getCurrentTrackIndex(): number {
        return this.currentTrackIndex;
    }

    public getTrackPrefab(index: number): SceneObject | null {
        return (index >= 0 && index < this.allTracksData.length) ? this.allTracksData[index].prefab : null;
    }

} // End of class MusicPlayerManager