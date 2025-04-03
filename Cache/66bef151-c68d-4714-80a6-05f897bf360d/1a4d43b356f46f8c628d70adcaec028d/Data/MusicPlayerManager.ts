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
    // --- Inputs (Same) ---
    @input localTracks: AudioTrackAsset[]; @input localArtists: string[]; @input localTitles: string[]; @input localTrackPrefabs: SceneObject[]; @input remoteTracks: RemoteReferenceAsset[]; @input remoteArtists: string[]; @input remoteTitles: string[]; @input remoteTrackPrefabs: SceneObject[]; @input('SceneObject') stoppedPrefab: SceneObject; @input('Component.Text') artistNameText: Text; @input('Component.Text') timecodeText: Text; @input('Component.Text') trackTitleText: Text; @input('Component.ScriptComponent') playPauseButton: PinchButton; @input('Component.ScriptComponent') nextTrackButton: PinchButton; @input('Component.ScriptComponent') prevTrackButton: PinchButton; @input('Component.ScriptComponent') repeatButton: PinchButton; @input('Component.ScriptComponent') shuffleButton: PinchButton; @input('Component.ScriptComponent') stopButton: PinchButton; @input('SceneObject') progressBar: SceneObject; @input('SceneObject') earthSphere: SceneObject; @input('Component.AudioComponent') audioComponent: AudioComponent; @input('bool') loopPlayback: boolean = true; @input('number') earthSphereXOffset: number = 0; @input('number') rotationSpeed: number = 30.0;

    // --- Private variables (Same + added pending calls array) ---
    private allTracksData: TrackData[] = []; private currentTrackIndex: number = -1; private isPlaying: boolean = false; private isPaused: boolean = false; private isRepeatEnabled: boolean = false; private isShuffleEnabled: boolean = false; private shouldAutoPlay: boolean = false; private isLoadingRemote: boolean = false; private isManualStop: boolean = false; private trackStartTime: number = 0; private currentPlaybackTime: number = 0; private audioInitialized: boolean = false; private currentActivePrefab: SceneObject | null = null; private lastPinchTimePlayPause: number = 0; private lastPinchTimeNext: number = 0; private lastPinchTimePrev: number = 0; private readonly DEBOUNCE_PLAYPAUSE = 0.5; private readonly DEBOUNCE_NEXTPREV = 0.3;
    // ** List to manage delayed calls **
    private pendingDelayedCalls: PendingDelayedCall[] = [];


    // --- Callbacks (Same) ---
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

        // ** Bind main update loop functions **
        this.createEvent("UpdateEvent").bind(() => {
            this.updatePlayer();
            this.updateSphereRotation();
            // ** Check pending delayed calls every frame **
            this.checkDelayedCalls();
        });

        this.updateActivePrefab();
        this.updateTrackInfo();
        print(`Initialized with ${this.localTracks?.length || 0} local, ${this.remoteTracks?.length || 0} remote. Total: ${this.allTracksData.length}`);
    }

    // --- MODIFIED: delayedCall adds to the pending list ---
    private delayedCall(delay: number, callback: () => void): void {
        if (!callback) return;
        if (delay <= 0) {
            // Execute immediately if delay is zero or negative
            try { callback(); } catch(e){ print("Error in immediate delayedCall callback: " + e); }
            return;
        }
        const executeTime = getTime() + delay;
        this.pendingDelayedCalls.push({ executeTime: executeTime, callback: callback });
        // Sort by execution time to potentially optimize checking, though likely negligible benefit here
        // this.pendingDelayedCalls.sort((a, b) => a.executeTime - b.executeTime);
    }

    // --- NEW: Function to process pending delayed calls ---
    private checkDelayedCalls(): void {
        if (this.pendingDelayedCalls.length === 0) {
            return; // Quick exit if nothing pending
        }

        const currentTime = getTime();
        // Iterate backwards for safe removal
        for (let i = this.pendingDelayedCalls.length - 1; i >= 0; i--) {
            const call = this.pendingDelayedCalls[i];
            if (currentTime >= call.executeTime) {
                // Remove *before* executing to prevent issues if callback adds another delayed call
                this.pendingDelayedCalls.splice(i, 1);
                try {
                    // print(`Executing delayed call scheduled for ${call.executeTime}`);
                    call.callback();
                } catch (e) {
                    print("Error executing delayed call callback: " + e);
                }
            }
        }
    }

    // --- Other methods remain the same ---
    private disableAllPrefabs(): void { /* ... */ }
    private validateInputs(): boolean { /* ... */ return true; }
    private combineTrackData(): void { /* ... */ }
    private setupCallbacks(): void { /* ... */ }
    private setupTrackFinishedCallback(): void { /* ... */ }
    private handleTrackFinished(): void { /* ... */ }
    private updateActivePrefab(): void { /* ... */ }
    private loadTrack(index: number): void { /* ... Uses the modified delayedCall ... */
        if (this.isLoadingRemote) return;
        if (index < 0 || index >= this.allTracksData.length) { this.stopTrack(); return; }
        const playAfterLoad = this.shouldAutoPlay; this.shouldAutoPlay = false;
        this.audioInitialized = false; this.isManualStop = false;
        if (this.isPlaying || this.isPaused) { /* stop audio */ try{this.audioComponent.stop(false);}catch(e){} }
        this.isPlaying = false; this.isPaused = false; this.currentPlaybackTime = 0; this.audioComponent.audioTrack = null;
        this.currentTrackIndex = index; const trackData = this.allTracksData[this.currentTrackIndex];
        this.updateTrackInfo(); this.updateActivePrefab();
        print(`Loading track ${index}: ${trackData.title} (${trackData.isRemote ? 'Remote' : 'Local'}) - Intent: ${playAfterLoad}`);

        if (trackData.isRemote) {
            this.isLoadingRemote = true; const remoteAsset = trackData.asset as RemoteReferenceAsset; /* update UI */
            const onDownloadedCallback = (downloadedAsset: Asset) => { if (this.currentTrackIndex !== index || !this.isLoadingRemote) { this.isLoadingRemote=false; return; } this.isLoadingRemote = false; if (downloadedAsset && downloadedAsset.isOfType("Asset.AudioTrackAsset")) { const audioTrack = downloadedAsset as AudioTrackAsset; /* assign track, set flags */ this.audioComponent.audioTrack = audioTrack; this.setupTrackFinishedCallback(); this.audioInitialized = true; this.trackStartTime = getTime(); this.currentPlaybackTime = 0; if (playAfterLoad) { this.delayedCall(0.05, () => this.playTrack()); } else { this.updatePlayer(); } } else { this.handleLoadError(index, "Invalid asset type"); } };
            const onFailedCallback = () => { if (this.currentTrackIndex !== index || !this.isLoadingRemote) { this.isLoadingRemote=false; return; } this.isLoadingRemote = false; this.handleLoadError(index, "Download failed"); };
            remoteAsset.downloadAsset(onDownloadedCallback, onFailedCallback);
        } else {
             const localAsset = trackData.asset as AudioTrackAsset; /* assign track, set flags */ this.audioComponent.audioTrack = localAsset; this.setupTrackFinishedCallback(); this.audioInitialized = true; this.trackStartTime = getTime(); this.currentPlaybackTime = 0; if (playAfterLoad) { this.delayedCall(0.05, () => this.playTrack()); } else { this.updatePlayer(); }
        }
    }
    private handleLoadError(failedIndex: number, reason: string): void { /* ... */ }
    private togglePlayPause(): void { /* ... */ }
    private playTrack(): void { /* ... */ }
    private pauseTrack(): void { /* ... */ }
    public stopTrack(): void { /* ... (Ensure pending calls are cleared?) ... */
         print("Stop called.");
         this.isManualStop = true;
         this.isLoadingRemote = false;

         // ** Clear any pending delayed calls when stopping **
         this.pendingDelayedCalls = [];

         if (this.audioComponent) { /* ... stop audio, clear track ... */ }
         /* ... reset other states ... */
         this.isPlaying = false; this.isPaused = false; this.shouldAutoPlay = false; this.currentTrackIndex = -1; this.audioInitialized = false; this.currentPlaybackTime = 0;
         /* ... update UI ... */
         this.updateEarthPosition(0, 1); this.updateTrackInfo(); this.updateActivePrefab();
         print("Stopped & reset.");
    }
    private nextTrack(): void { /* ... */ }
    private prevTrack(): void { /* ... */ }
    private updateTrackInfo(): void { /* ... */ }
    private updatePlayer(): void { /* ... */ }
    private updateEarthPosition(currentTime: number, totalTime: number): void { /* ... */ }
    private formatTime(timeInSeconds: number): string { /* ... */ return "";}
    private setupProgressBar(): void { /* ... */ }
    private updateSphereRotation(): void { /* ... */ }
    public getCurrentTrackIndex(): number { /* ... */ return -1;}
    public getTrackPrefab(index: number): SceneObject | null { /* ... */ return null;}
    onDestroy(): void { /* ... Clear pending calls on destroy too ... */
        print("Destroying MusicPlayerManager.");
        this.pendingDelayedCalls = []; // Clear pending calls
        if (this.audioComponent && (this.isPlaying || this.isPaused)) { /* ... stop audio ... */ }
        /* ... remove listeners ... */
        this.disableAllPrefabs();
     }
}