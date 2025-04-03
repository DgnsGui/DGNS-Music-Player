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
    @input localTracks: AudioTrackAsset[]; @input localArtists: string[]; @input localTitles: string[]; @input localTrackPrefabs: SceneObject[]; @input remoteTracks: RemoteReferenceAsset[]; @input remoteArtists: string[]; @input remoteTitles: string[]; @input remoteTrackPrefabs: SceneObject[]; @input('SceneObject') stoppedPrefab: SceneObject; @input('Component.Text') artistNameText: Text; @input('Component.Text') timecodeText: Text; @input('Component.Text') trackTitleText: Text; @input('Component.ScriptComponent') playPauseButton: PinchButton; @input('Component.ScriptComponent') nextTrackButton: PinchButton; @input('Component.ScriptComponent') prevTrackButton: PinchButton; @input('Component.ScriptComponent') repeatButton: PinchButton; @input('Component.ScriptComponent') shuffleButton: PinchButton; @input('Component.ScriptComponent') stopButton: PinchButton; @input('SceneObject') progressBar: SceneObject; @input('SceneObject') earthSphere: SceneObject; @input('Component.AudioComponent') audioComponent: AudioComponent; @input('bool') loopPlayback: boolean = true; @input('number') earthSphereXOffset: number = 0; @input('number') rotationSpeed: number = 30.0;

    // --- Private variables ---
    private allTracksData: TrackData[] = [];
    private currentTrackIndex: number = -1;
    private isPlaying: boolean = false;
    private isPaused: boolean = false;
    private isRepeatEnabled: boolean = false;
    private isShuffleEnabled: boolean = false;
    private shouldAutoPlay: boolean = false;
    private isLoadingRemote: boolean = false; // Still useful for "Loading..." text
    private isManualStop: boolean = false;
    // *** NEW: General busy flag during track transitions ***
    private isBusy: boolean = false;
    private trackStartTime: number = 0;
    private currentPlaybackTime: number = 0;
    private audioInitialized: boolean = false;
    private currentActivePrefab: SceneObject | null = null;
    private lastPinchTimePlayPause: number = 0;
    private lastPinchTimeNext: number = 0;
    private lastPinchTimePrev: number = 0;
    private readonly DEBOUNCE_TIME = 0.3;
    private pendingDelayedCalls: PendingDelayedCall[] = [];

    // --- Callbacks ---
    private onPlayPauseCallback: (event: InteractorEvent) => void; private onNextTrackCallback: (event: InteractorEvent) => void; private onPrevTrackCallback: (event: InteractorEvent) => void; private onRepeatCallback: (event: InteractorEvent) => void; private onShuffleCallback: (event: InteractorEvent) => void; private onStopCallback: (event: InteractorEvent) => void; private onTrackFinishedCallback: (audioComponent: AudioComponent) => void;

    // --- Core Methods ---
    onAwake(): void {
        this.api.stopTrack = this.stopTrack.bind(this);
        if (!this.validateInputs()) { print("Input validation failed."); return; }
        this.combineTrackData();
        if (this.allTracksData.length === 0) { print("No tracks provided."); }
        this.disableAllPrefabs();
        this.setupCallbacks();
        this.setupProgressBar();
        this.createEvent("UpdateEvent").bind(() => {
            // Only update player UI if not busy (prevents flickering during load)
            if (!this.isBusy) {
                this.updatePlayer();
            }
            this.updateSphereRotation();
            this.checkDelayedCalls();
        });
        this.updateActivePrefab();
        this.updateTrackInfo(); // Initial UI setup
        print(`Initialized.`);
    }

     private delayedCall(delay: number, callback: () => void): void {
        if (!callback) return;
        if (delay <= 0) { try { callback(); } catch(e){ print("Err immediate delay: " + e); } return; }
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
                try { call.callback(); } catch (e) { print("Err delayed call: " + e); }
            }
        }
    }

    // --- MODIFIED: loadTrack sets/unsets isBusy flag ---
    private loadTrack(index: number): void {
        // *** Prevent loading if already busy ***
        if (this.isBusy) { print(`Load track (${index}) ignored: Player is busy.`); return; }
        // (Rest of initial checks remain)
        if (index < 0 || index >= this.allTracksData.length) { print(`Error: Invalid track index ${index}.`); this.stopTrack(); return; }

        // *** Set busy flag AT THE START ***
        this.isBusy = true;
        // isLoadingRemote is set specifically for remote tracks later

        const playAfterLoad = this.shouldAutoPlay;
        this.shouldAutoPlay = false; // Consume the flag

        this.audioInitialized = false;
        this.isManualStop = false;

        // --- Stop Sequence (Using stop(true)) ---
        let wasPlayingOrPaused = this.isPlaying || this.isPaused;
        if (wasPlayingOrPaused && this.audioComponent) {
             if (this.audioComponent.isPlaying() || this.audioComponent.isPaused()) {
                 print("Stopping previous track...");
                 try { this.audioComponent.stop(true); } catch(e){ print("Error stopping prev: "+e); }
             }
        }
        this.isPlaying = false; this.isPaused = false; this.currentPlaybackTime = 0;
        if (this.audioComponent) { this.audioComponent.audioTrack = null; }
        // --- End Stop Sequence ---

        this.currentTrackIndex = index;
        const trackData = this.allTracksData[this.currentTrackIndex];
        this.updateTrackInfo(); // Update UI immediately (might show "Loading...")
        this.updateActivePrefab();

        print(`Loading track ${index}: ${trackData.title} (${trackData.isRemote ? 'Remote' : 'Local'}) - Intent: ${playAfterLoad}`);

        // --- Load/Download Logic ---
        if (trackData.isRemote) {
            this.isLoadingRemote = true; // For UI text
            const remoteAsset = trackData.asset as RemoteReferenceAsset;
            // if (this.timecodeText) this.timecodeText.text = "Loading..."; // updateTrackInfo handles this

            const onDownloadedCallback = (downloadedAsset: Asset) => {
                // Relevance check still important
                if (this.currentTrackIndex !== index /* removed check for isLoadingRemote here, rely on isBusy */ ) {
                    print(`Remote download finished for ${index}, but target changed.`);
                    // If *this* task was the one making it busy, make it not busy anymore
                    if(this.isBusy && this.currentTrackIndex !== index) {
                       // This path indicates another load command likely took over.
                       // The *new* load command will eventually set isBusy=false.
                       // So, *don't* set isBusy=false here if the index doesn't match.
                       print("Busy state remains due to newer load task.");
                    } else if (!this.isBusy && this.currentTrackIndex !== index){
                        // Busy was already false, likely from the newer task. Do nothing.
                    } else {
                        // This download finished for the *current* index, but maybe isBusy was already cleared? Unlikely.
                        // Assume we should clear busy state if index matches, even if isBusy is somehow false.
                         this.isBusy = false;
                    }
                    // We also need to clear isLoadingRemote if this *was* the relevant task but now ignored
                    this.isLoadingRemote = false;
                    return;
                }

                this.isLoadingRemote = false; // Download part is done

                if (downloadedAsset && downloadedAsset.isOfType("Asset.AudioTrackAsset")) {
                    const audioTrack = downloadedAsset as AudioTrackAsset;
                    this.audioComponent.audioTrack = audioTrack;
                    this.setupTrackFinishedCallback();
                    this.audioInitialized = true;
                    this.trackStartTime = getTime(); this.currentPlaybackTime = 0;
                     // *** Set isBusy = false *after* everything is ready ***
                    this.isBusy = false;
                    print(`Remote track ${trackData.title} ready.`);
                    if (playAfterLoad) { print("Auto-playing."); this.playTrack(); } else { this.updatePlayer(); } // Update UI state
                } else {
                    this.handleLoadError(index, "Invalid asset type dl"); // handleLoadError will set isBusy = false
                }
            };
             const onFailedCallback = () => {
                 // Relevance check
                if (this.currentTrackIndex !== index /* removed isLoadingRemote check */ ) {
                    print(`Remote download FAILED for ${index}, but target changed.`);
                     // Similar logic to success path for isBusy state. Don't clear if newer task exists.
                    if(this.isBusy && this.currentTrackIndex !== index) {} else { this.isBusy = false; }
                    this.isLoadingRemote = false;
                    return;
                }
                // Failure path always clears isBusy and isLoadingRemote for this failed task
                this.isLoadingRemote = false;
                // this.isBusy = false; // handleLoadError does this
                this.handleLoadError(index, "Download failed");
            };
            remoteAsset.downloadAsset(onDownloadedCallback, onFailedCallback);
        } else {
            // Local Asset
            try {
                const localAsset = trackData.asset as AudioTrackAsset;
                this.audioComponent.audioTrack = localAsset;
                this.setupTrackFinishedCallback();
                this.audioInitialized = true;
                this.trackStartTime = getTime(); this.currentPlaybackTime = 0;
                 // *** Set isBusy = false *after* everything is ready ***
                 this.isBusy = false;
                print(`Local track ${trackData.title} ready.`);
                if (playAfterLoad) { print("Auto-playing."); this.delayedCall(0.05, () => this.playTrack()); } else { this.updatePlayer(); } // Add small delay maybe?
            } catch (e) {
                 print("Error loading local: " + e);
                 // this.isBusy = false; // handleLoadError does this
                 this.handleLoadError(index, "Local load error");
            }
        }
    }

    // --- MODIFIED: handleLoadError now resets isBusy ---
    private handleLoadError(failedIndex: number, reason: string): void {
         print(`Load error track ${failedIndex}: ${reason}`);
         // *** Ensure busy flag is reset on error ***
         this.isBusy = false;
         this.isLoadingRemote = false; // Also ensure this is reset
         this.stopTrack(); // Reset to a safe state (stopTrack also resets flags, but be explicit here)
         if (this.artistNameText) this.artistNameText.text = "Error";
         if (this.trackTitleText) this.trackTitleText.text = "Load Failed";
         if (this.timecodeText) this.timecodeText.text = "--:-- / --:--";
    }

    // --- MODIFIED: All control actions check isBusy ---
    private togglePlayPause(): void {
        if (this.isBusy) { print("Play/Pause ignored: Player busy."); return; } // Check busy
        // (Debounce check already done in callback setup)
        if (this.allTracksData.length === 0) { print("Play/Pause ignored: No tracks."); return; }
        print(`Toggle Play/Pause - State: ${this.isPlaying ? 'Playing' : (this.isPaused ? 'Paused' : 'Stopped')}`);
        if (this.isPlaying) { this.pauseTrack(); }
        else {
             if (this.currentTrackIndex === -1) { this.shouldAutoPlay = true; this.loadTrack(0); }
             else if (this.isPaused && this.audioInitialized) { this.playTrack(); }
             else if (!this.isPaused && this.audioInitialized) { this.playTrack(); }
             else if (!this.audioInitialized && this.currentTrackIndex !== -1) { this.shouldAutoPlay = true; this.loadTrack(this.currentTrackIndex); }
             else { print("Play ignored: Unexpected state."); }
        }
    }

    private nextTrack(): void {
        if (this.isBusy) { print("Next ignored: Player busy."); return; } // Check busy
        // (Debounce check already done in callback setup)
        if (this.allTracksData.length === 0) { print("Next ignored: No tracks."); return; }
        print("Next track triggered.");
        let nextIndex = -1;
        // ... (calculate nextIndex logic same as before) ...
        if (this.isRepeatEnabled) { nextIndex = (this.currentTrackIndex === -1) ? 0 : this.currentTrackIndex; } else if (this.isShuffleEnabled) { if (this.allTracksData.length > 1) { do { nextIndex = Math.floor(Math.random() * this.allTracksData.length); } while (nextIndex === this.currentTrackIndex); } else { nextIndex = 0; } } else { nextIndex = (this.currentTrackIndex === -1) ? 0 : this.currentTrackIndex + 1; if (nextIndex >= this.allTracksData.length) { if (this.loopPlayback) { nextIndex = 0; } else { this.stopTrack(); return; } } }
        if (nextIndex < 0 || nextIndex >= this.allTracksData.length) { this.stopTrack(); return; }
        this.shouldAutoPlay = true;
        this.loadTrack(nextIndex);
    }

    private prevTrack(): void {
        if (this.isBusy) { print("Prev ignored: Player busy."); return; } // Check busy
        // (Debounce check already done in callback setup)
        if (this.allTracksData.length === 0) { print("Prev ignored: No tracks."); return; }
        print("Prev track triggered");
        let prevIndex = -1;
        // ... (calculate prevIndex logic same as before) ...
        if (this.isRepeatEnabled) { prevIndex = (this.currentTrackIndex === -1) ? this.allTracksData.length - 1 : this.currentTrackIndex; } else if (this.isShuffleEnabled) { if (this.allTracksData.length > 1) { do { prevIndex = Math.floor(Math.random() * this.allTracksData.length); } while (prevIndex === this.currentTrackIndex); } else { prevIndex = 0; } } else { prevIndex = (this.currentTrackIndex === -1) ? this.allTracksData.length - 1 : this.currentTrackIndex - 1; if (prevIndex < 0) { if (this.loopPlayback) { prevIndex = this.allTracksData.length - 1; } else { this.stopTrack(); return; } } }
        if (prevIndex < 0 || prevIndex >= this.allTracksData.length) { this.stopTrack(); return; }
        this.shouldAutoPlay = true;
        this.loadTrack(prevIndex);
    }

    public stopTrack(): void {
        // Check busy state even for stop? Maybe allow stop anytime. Let's allow it.
        // if (this.isBusy) { print("Stop ignored: Player busy."); return; }

        print("Stop track called.");
        this.isManualStop = true;
        this.isLoadingRemote = false;
        this.pendingDelayedCalls = [];

        // *** Also reset busy flag when stopping explicitly ***
        this.isBusy = false;

        if (this.audioComponent) { /* ... stop audio, clear track ... */ if (this.audioComponent.isPlaying() || this.audioComponent.isPaused()) { try { this.audioComponent.stop(true); } catch (e) {} } this.audioComponent.audioTrack = null; }
        /* ... reset other states ... */ this.isPlaying = false; this.isPaused = false; this.shouldAutoPlay = false; this.currentTrackIndex = -1; this.audioInitialized = false; this.currentPlaybackTime = 0;
        /* ... update UI ... */ this.updateEarthPosition(0, 1); this.updateTrackInfo(); this.updateActivePrefab();
        print("Stopped & reset.");
    }

    // --- Play/Pause/Update methods check isBusy implicitly or explicitly ---
    private playTrack(): void {
        // Should generally not be called if busy, but add check just in case
        if (this.isBusy) { print("Play track ignored: Player busy."); return; }
        if (!this.audioInitialized || !this.audioComponent || !this.audioComponent.audioTrack) { print("Cannot play: Not initialized."); return; }
        try {
            // ... (rest of play/resume logic same) ...
            if (this.isPaused) { /* resume */ this.audioComponent.resume(); this.isPlaying = true; this.isPaused = false; this.trackStartTime = getTime() - this.currentPlaybackTime; } else if (!this.isPlaying) { /* play */ this.currentPlaybackTime = 0; this.trackStartTime = getTime(); this.audioComponent.play(1); this.isPlaying = true; this.isPaused = false; }
        } catch (e) { print("Error play/resume: " + e); this.handleLoadError(this.currentTrackIndex, "Playback error"); }
    }

    private pauseTrack(): void {
        if (this.isBusy) { print("Pause ignored: Player busy."); return; } // Check busy
        if (!this.isPlaying || !this.audioComponent || !this.audioComponent.isPlaying()) { /*...*/ return; }
        try { /* ... pause logic same ... */ this.currentPlaybackTime = getTime() - this.trackStartTime; this.audioComponent.pause(); this.isPlaying = false; this.isPaused = true; }
        catch (e) { /*...*/ this.currentPlaybackTime = Math.max(0, getTime() - this.trackStartTime); this.isPlaying = false; this.isPaused = true; }
    }

     private updatePlayer(): void {
        // Check busy flag here too - prevents UI updates during load potentially based on old state
        if (this.isBusy || this.isLoadingRemote || this.currentTrackIndex === -1 || !this.audioInitialized || !this.audioComponent || !this.audioComponent.audioTrack) {
            this.updateEarthPosition(0, 1); // Ensure reset if not ready/playing
            // UI text update handled by updateTrackInfo for loading/stopped states
             if (!this.isBusy && this.currentTrackIndex === -1 && this.timecodeText && this.timecodeText.text !== "00:00 / 00:00") {
                 this.timecodeText.text = "00:00 / 00:00"; // Ensure stopped state shows correctly if not busy
             }
            return;
        }
        // ... (rest of time calculation and UI update same) ...
         let currentTime = 0; let totalTime = 0; try { totalTime = this.audioComponent.duration || 0; if (this.isPlaying) { currentTime = getTime() - this.trackStartTime; } else { currentTime = this.currentPlaybackTime; } currentTime = Math.max(0, currentTime); if (totalTime > 0) { currentTime = Math.min(currentTime, totalTime); } else { totalTime = 0; } if (this.timecodeText) { this.timecodeText.text = `${this.formatTime(currentTime)} / ${this.formatTime(totalTime)}`; } this.updateEarthPosition(currentTime, totalTime); } catch (e) { if (this.timecodeText) { this.timecodeText.text = "--:-- / --:--"; } this.updateEarthPosition(0, 1); }
    }

    // --- Other methods unchanged ---
    private updateTrackInfo(): void { /* ... same ... */ }
    private updateEarthPosition(currentTime: number, totalTime: number): void { /* ... same ... */ }
    private formatTime(timeInSeconds: number): string { /* ... same ... */ return ""; }
    private setupProgressBar(): void { /* ... same ... */ }
    private updateSphereRotation(): void { /* ... same ... */ }
    public getCurrentTrackIndex(): number { /* ... same ... */ return -1; }
    public getTrackPrefab(index: number): SceneObject | null { /* ... same ... */ return null; }
    onDestroy(): void { /* ... same cleanup ... */ }
}