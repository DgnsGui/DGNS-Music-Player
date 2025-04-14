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
    // --- Inputs (From Old + New) ---
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
    @input('Component.MeshVisual') playButtonMeshVisual: MeshVisual | null = null;
    @input('Asset.Material') originalPlayButtonMaterial: Material | null = null;
    @input('Asset.Material') blinkMaterial: Material | null = null;
    @input('SceneObject') repeatOnIcon: SceneObject | null = null;
    @input('SceneObject') repeatOffIcon: SceneObject | null = null;
    @input('SceneObject') shuffleOnIcon: SceneObject | null = null;
    @input('SceneObject') shuffleOffIcon: SceneObject | null = null;

    // --- Private variables (From Old + New + Flag) ---
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
    private isBlinkingActive: boolean = false;
    private blinkTimer: number = 0;
    private readonly blinkInterval: number = 1.0;
    private isBlinkMaterialActive: boolean = false;
    // --- NEW FLAG ---
    private expectTrackFinish: boolean = false;

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
        if (!this.validateInputs()) { print("MusicPlayerManager Error: Input validation failed."); return; }
        this.combineTrackData();
        if (this.allTracksData.length === 0) { print("MusicPlayerManager Warning: No tracks provided."); }
        this.disableAllPrefabs();
        this.setupCallbacks(); // Sets up the onTrackFinishedCallback definition
        this.setupProgressBar();
        this.updateButtonIcons();
        this.createEvent("UpdateEvent").bind(() => {
            this.updatePlayer();
            this.updateSphereRotation();
            this.checkDelayedCalls();
            this.updateBlinkEffect();
        });
        this.updateActivePrefab();
        this.updateTrackInfo();
        if (this.currentTrackIndex === -1 && !this.isPlaying && !this.isPaused) { this.startBlinkingPlayButton(); }
        print(`MusicPlayerManager Initialized with ${this.localTracks?.length || 0} local, ${this.remoteTracks?.length || 0} remote. Total: ${this.allTracksData.length}`);
    }

    // --- Validation (Enhanced version) ---
    private validateInputs(): boolean { /* ... (keep enhanced validation logic) ... */
        let isValid = true;
        if (!this.audioComponent) { print("MusicPlayerManager Error: Audio component not defined."); isValid = false; }
        const hasPlayButtonVisual = !!this.playButtonMeshVisual; const hasOriginalMaterial = !!this.originalPlayButtonMaterial; const hasBlinkMaterial = !!this.blinkMaterial; const canBlink = hasPlayButtonVisual && hasOriginalMaterial && hasBlinkMaterial;
        if (!this.playPauseButton) { print("MusicPlayerManager Warning: Play/Pause button PinchButton component not defined."); }
        if (!hasPlayButtonVisual) { print("MusicPlayerManager Warning: Play Button MeshVisual not defined (blinking disabled)."); }
        else { const visualType = this.playButtonMeshVisual.getTypeName(); if (visualType !== "Component.Image" && visualType !== "Component.Text3D" && visualType !== "Component.MaterialMeshVisual" && visualType !== "Component.RenderMeshVisual") { print(`MusicPlayerManager Warning: Linked Play Button MeshVisual (Type: ${visualType}) might not support material swapping needed for blinking.`); } else if (visualType === "Component.RenderMeshVisual") { print(`MusicPlayerManager Info: Play Button MeshVisual is RenderMeshVisual. Blinking will attempt to use 'mainMaterial'.`); } if (!hasOriginalMaterial) { print("MusicPlayerManager Warning: Original Play Button Material not defined (blinking disabled)."); } if (!hasBlinkMaterial) { print("MusicPlayerManager Warning: Blink Material not defined (blinking disabled)."); } }
        if (!this.repeatOnIcon) { print("MusicPlayerManager Warning: Repeat On Icon SceneObject not defined."); } if (!this.repeatOffIcon) { print("MusicPlayerManager Warning: Repeat Off Icon SceneObject not defined."); } if (!this.shuffleOnIcon) { print("MusicPlayerManager Warning: Shuffle On Icon SceneObject not defined."); } if (!this.shuffleOffIcon) { print("MusicPlayerManager Warning: Shuffle Off Icon SceneObject not defined."); }
        const numLocalTracks = this.localTracks?.length || 0; if (numLocalTracks > 0) { if (!this.localArtists || this.localArtists.length !== numLocalTracks) { print(`MusicPlayerManager Error: Mismatch local tracks (${numLocalTracks}) vs artists (${this.localArtists?.length || 0}).`); isValid = false; } if (!this.localTitles || this.localTitles.length !== numLocalTracks) { print(`MusicPlayerManager Error: Mismatch local tracks (${numLocalTracks}) vs titles (${this.localTitles?.length || 0}).`); isValid = false; } if (!this.localTrackPrefabs || this.localTrackPrefabs.length !== numLocalTracks) { print(`MusicPlayerManager Error: Mismatch local tracks (${numLocalTracks}) vs prefabs (${this.localTrackPrefabs?.length || 0}).`); isValid = false; } if (this.localTracks.some(track => track == null)) { print("MusicPlayerManager Error: One or more local tracks are null."); isValid = false; } if (this.localTrackPrefabs.some(prefab => prefab == null)) { print("MusicPlayerManager Error: One or more local prefabs are null."); isValid = false; } } const numRemoteTracks = this.remoteTracks?.length || 0; if (numRemoteTracks > 0) { if (!this.remoteArtists || this.remoteArtists.length !== numRemoteTracks) { print(`MusicPlayerManager Error: Mismatch remote tracks (${numRemoteTracks}) vs artists (${this.remoteArtists?.length || 0}).`); isValid = false; } if (!this.remoteTitles || this.remoteTitles.length !== numRemoteTracks) { print(`MusicPlayerManager Error: Mismatch remote tracks (${numRemoteTracks}) vs titles (${this.remoteTitles?.length || 0}).`); isValid = false; } if (!this.remoteTrackPrefabs || this.remoteTrackPrefabs.length !== numRemoteTracks) { print(`MusicPlayerManager Error: Mismatch remote tracks (${numRemoteTracks}) vs prefabs (${this.remoteTrackPrefabs?.length || 0}).`); isValid = false; } if (this.remoteTracks.some(track => track == null)) { print("MusicPlayerManager Error: One or more remote tracks are null."); isValid = false; } if (this.remoteTrackPrefabs.some(prefab => prefab == null)) { print("MusicPlayerManager Error: One or more remote prefabs are null."); isValid = false; } }
        if (!this.earthSphere || !this.progressBar) { print("MusicPlayerManager Warning: Progress visualization objects not defined."); } if (!this.stoppedPrefab) { print("MusicPlayerManager Warning: Stopped Prefab SceneObject not defined."); } if (!this.artistNameText) print("MusicPlayerManager Warning: Artist Name Text component not defined."); if (!this.trackTitleText) print("MusicPlayerManager Warning: Track Title Text component not defined."); if (!this.timecodeText) print("MusicPlayerManager Warning: Timecode Text component not defined."); if (!this.nextTrackButton) print("MusicPlayerManager Warning: Next Track PinchButton not defined."); if (!this.prevTrackButton) print("MusicPlayerManager Warning: Previous Track PinchButton not defined."); if (!this.repeatButton) print("MusicPlayerManager Warning: Repeat PinchButton not defined."); if (!this.shuffleButton) print("MusicPlayerManager Warning: Shuffle PinchButton not defined."); if (!this.stopButton) print("MusicPlayerManager Warning: Stop PinchButton not defined.");
        return isValid;
     }

    // --- Blinking Logic (New) ---
    private startBlinkingPlayButton(): void { if (this.isBlinkingActive || !this.playButtonMeshVisual || !this.originalPlayButtonMaterial || !this.blinkMaterial) return; this.isBlinkingActive = true; this.blinkTimer = 0; this.isBlinkMaterialActive = false; try { this.setPlayButtonMaterial(this.originalPlayButtonMaterial); } catch (e) { this.isBlinkingActive = false; } }
    private stopBlinkingPlayButton(): void { if (!this.isBlinkingActive) return; this.isBlinkingActive = false; if (this.playButtonMeshVisual && this.originalPlayButtonMaterial) { try { this.setPlayButtonMaterial(this.originalPlayButtonMaterial); } catch (e) {} } }
    private updateBlinkEffect(): void { if (!this.isBlinkingActive || !this.playButtonMeshVisual || !this.originalPlayButtonMaterial || !this.blinkMaterial) return; this.blinkTimer += getDeltaTime(); if (this.blinkTimer >= this.blinkInterval / 2.0) { this.isBlinkMaterialActive = !this.isBlinkMaterialActive; this.blinkTimer -= this.blinkInterval / 2.0; const t = this.isBlinkMaterialActive ? this.blinkMaterial : this.originalPlayButtonMaterial; try { this.setPlayButtonMaterial(t); } catch (e) { this.stopBlinkingPlayButton(); } } }
    private setPlayButtonMaterial(m: Material): void { if (!this.playButtonMeshVisual || !m) return; let s = false; const i = this.playButtonMeshVisual as Image; if (i && i.mainMaterial !== undefined) { i.mainMaterial = m; s = true; } else { const t = this.playButtonMeshVisual as Text3D; if (t && t.materials && t.materials.length > 0) { t.materials[0] = m; s = true; } else { const v = this.playButtonMeshVisual as MaterialMeshVisual; if (v && v.mainMaterial !== undefined) { v.mainMaterial = m; s = true; } } } if (!s) { print(`Warn: Visual type ${this.playButtonMeshVisual.getTypeName()} unsupported.`); if(this.isBlinkingActive) this.stopBlinkingPlayButton(); } }

    // --- Icon Update Logic (New) ---
    private updateButtonIcons(): void { if(this.repeatOnIcon && this.repeatOffIcon){ try{this.repeatOnIcon.enabled = this.isRepeatEnabled; this.repeatOffIcon.enabled = !this.isRepeatEnabled;} catch(e){} } if(this.shuffleOnIcon && this.shuffleOffIcon){ try{this.shuffleOnIcon.enabled = this.isShuffleEnabled; this.shuffleOffIcon.enabled = !this.isShuffleEnabled;} catch(e){} } }

    // --- Core Logic (Based on old.ts + Explicit Flag) ---

    private disableAllPrefabs(): void { this.allTracksData.forEach(t => { if (t.prefab) try { t.prefab.enabled = false; } catch(e){} }); if (this.stoppedPrefab) try { this.stoppedPrefab.enabled = false; } catch(e){} this.currentActivePrefab = null; }
    private combineTrackData(): void { this.allTracksData = []; if (this.localTracks) { for (let i = 0; i < this.localTracks.length; i++) { if (this.localTracks[i] && this.localArtists?.[i] !== undefined && this.localTitles?.[i] !== undefined && this.localTrackPrefabs?.[i]) { this.allTracksData.push({ asset: this.localTracks[i], artist: this.localArtists[i], title: this.localTitles[i], prefab: this.localTrackPrefabs[i], isRemote: false }); } else { /* Warn skip */ } } } if (this.remoteTracks) { for (let i = 0; i < this.remoteTracks.length; i++) { if (this.remoteTracks[i] && this.remoteArtists?.[i] !== undefined && this.remoteTitles?.[i] !== undefined && this.remoteTrackPrefabs?.[i]) { this.allTracksData.push({ asset: this.remoteTracks[i], artist: this.remoteArtists[i], title: this.remoteTitles[i], prefab: this.remoteTrackPrefabs[i], isRemote: true }); } else { /* Warn skip */ } } } }

    private setupCallbacks(): void {
        // Button callbacks (with debounce)
        if (this.playPauseButton) { this.onPlayPauseCallback = (e: InteractorEvent) => { const t=getTime(); if(t-this.lastPinchTimePlayPause<this.DEBOUNCE_TIME) return; this.lastPinchTimePlayPause=t; this.togglePlayPause(); }; this.playPauseButton.onButtonPinched.add(this.onPlayPauseCallback); }
        if (this.nextTrackButton) { this.onNextTrackCallback = (e: InteractorEvent) => { const t=getTime(); if(t-this.lastPinchTimeNext<this.DEBOUNCE_TIME) return; this.lastPinchTimeNext=t; this.nextTrack(); }; this.nextTrackButton.onButtonPinched.add(this.onNextTrackCallback); }
        if (this.prevTrackButton) { this.onPrevTrackCallback = (e: InteractorEvent) => { const t=getTime(); if(t-this.lastPinchTimePrev<this.DEBOUNCE_TIME) return; this.lastPinchTimePrev=t; this.prevTrack(); }; this.prevTrackButton.onButtonPinched.add(this.onPrevTrackCallback); }
        if (this.repeatButton) { this.onRepeatCallback = (e: InteractorEvent) => { const t=getTime(); if(t-this.lastPinchTimeRepeat<this.DEBOUNCE_TIME) return; this.lastPinchTimeRepeat=t; this.isRepeatEnabled=!this.isRepeatEnabled; if(this.isRepeatEnabled) this.isShuffleEnabled=false; this.updateButtonIcons(); }; this.repeatButton.onButtonPinched.add(this.onRepeatCallback); }
        if (this.shuffleButton) { this.onShuffleCallback = (e: InteractorEvent) => { const t=getTime(); if(t-this.lastPinchTimeShuffle<this.DEBOUNCE_TIME) return; this.lastPinchTimeShuffle=t; this.isShuffleEnabled=!this.isShuffleEnabled; if(this.isShuffleEnabled) this.isRepeatEnabled=false; this.updateButtonIcons(); }; this.shuffleButton.onButtonPinched.add(this.onShuffleCallback); }
        if (this.stopButton) { this.onStopCallback = (e: InteractorEvent) => { const t=getTime(); if(t-this.lastPinchTimeStop<this.DEBOUNCE_TIME) return; this.lastPinchTimeStop=t; this.stopTrack(); }; this.stopButton.onButtonPinched.add(this.onStopCallback); }

        // Define the onFinish callback logic with the new flag check
        this.onTrackFinishedCallback = (audioComponent: AudioComponent) => {
            // --- NEW GUARD using explicit flag ---
            if (!this.expectTrackFinish || audioComponent !== this.audioComponent || !this.isPlaying || this.isLoadingRemote || this.isManualStop || this.isPaused) {
                // Log details for debugging ignored calls
                // print(`onFinish ignored: Expect=${this.expectTrackFinish}, CompMatch:${audioComponent === this.audioComponent}, Playing:${this.isPlaying}, Loading:${this.isLoadingRemote}, ManualStop:${this.isManualStop}, Paused:${this.isPaused}`);
                if (this.isManualStop) this.isManualStop = false; // Still reset manual stop if it was the cause
                // Do NOT reset expectTrackFinish here if ignored
                return;
            }

            print("Track finished event detected (expected), handling auto-advance.");
            this.expectTrackFinish = false; // Consume the flag // Consume the flag
            this.handleTrackFinished();
        };

        // Assign the callback (only needs to be done once usually, but can be repeated)
        if (this.audioComponent) {
            try { this.audioComponent.setOnFinish(this.onTrackFinishedCallback); } catch (e) { print("Error setting onFinish callback: " + e); }
        }
    }

    // handleTrackFinished remains IDENTICAL to old.ts
    private handleTrackFinished(): void { /* ... (identical logic) ... */
        print("Handle Track Finished - Determining next action."); if (this.currentTrackIndex === -1 || this.allTracksData.length === 0) { this.stopTrack(); return; } this.shouldAutoPlay = true; let nextIndex = -1; if (this.isRepeatEnabled) { nextIndex = this.currentTrackIndex; } else if (this.isShuffleEnabled) { if (this.allTracksData.length > 1) { do { nextIndex = Math.floor(Math.random() * this.allTracksData.length); } while (nextIndex === this.currentTrackIndex); } else { nextIndex = 0; } } else { nextIndex = this.currentTrackIndex + 1; if (nextIndex >= this.allTracksData.length) { if (this.loopPlayback) { nextIndex = 0; } else { print("End, no loop. Stopping."); this.shouldAutoPlay = false; this.stopTrack(); return; } } } if (nextIndex >= 0 && nextIndex < this.allTracksData.length) { this.loadTrack(nextIndex); } else { print(`Error: Invalid next index (${nextIndex}).`); this.stopTrack(); }
     }

    // updateActivePrefab remains IDENTICAL to old.ts
    private updateActivePrefab(): void { /* ... (identical logic) ... */
        if (this.currentActivePrefab) { try {this.currentActivePrefab.enabled = false;} catch(e){} this.currentActivePrefab = null; } if (this.currentTrackIndex === -1) { if (this.stoppedPrefab) { try {this.stoppedPrefab.enabled = true; this.currentActivePrefab = this.stoppedPrefab;} catch(e){} } } else if (this.currentTrackIndex >= 0 && this.currentTrackIndex < this.allTracksData.length) { const cd = this.allTracksData[this.currentTrackIndex]; if (cd && cd.prefab) { try{cd.prefab.enabled = true; this.currentActivePrefab = cd.prefab;} catch(e){} } }
     }

    // delayedCall and checkDelayedCalls remain IDENTICAL to old.ts
    private delayedCall(d: number, cb: () => void): void { /* ... (identical logic) ... */ if (!cb) return; if (d <= 0) { try { cb(); } catch(e){} return; } const et = getTime() + d; this.pendingDelayedCalls.push({ executeTime: et, callback: cb }); }
    private checkDelayedCalls(): void { /* ... (identical logic) ... */ if (this.pendingDelayedCalls.length === 0) return; const n = getTime(); for (let i = this.pendingDelayedCalls.length - 1; i >= 0; i--) { const c = this.pendingDelayedCalls[i]; if (n >= c.executeTime) { this.pendingDelayedCalls.splice(i, 1); try { c.callback(); } catch (e) {} } } }

    // --- loadTrack: Now manages the expectTrackFinish flag ---
    private loadTrack(index: number): void {
        this.expectTrackFinish = false; // <<<=== NEW: Assume finish is NOT expected by default on load

        if (this.isLoadingRemote) { print(`Load track (${index}) ignored: Loading remote.`); return; }
        if (index < 0 || index >= this.allTracksData.length) { print(`Error: Invalid track index ${index}.`); this.stopTrack(); return; }
        const playAfterLoad = this.shouldAutoPlay; this.shouldAutoPlay = false;
        this.audioInitialized = false; this.isManualStop = false;

        // Stop Sequence (Keep simple stop call from old.ts)
        if ((this.isPlaying || this.isPaused) && this.audioComponent) {
             if (this.audioComponent.isPlaying() || this.audioComponent.isPaused()) {
                 print("Stopping previous track (immediate)...");
                 try { this.audioComponent.stop(false); } catch(e){ print("Error stopping previous: "+e); }
             }
        }
        this.isPlaying = false; this.isPaused = false; this.currentPlaybackTime = 0;
        if (this.audioComponent) { try { this.audioComponent.audioTrack = null; } catch(e) {} }

        this.currentTrackIndex = index;
        const trackData = this.allTracksData?.[this.currentTrackIndex];
        if (!trackData) { print(`Error: No data index ${index}.`); this.handleLoadError(index, "No track data"); return; }
        this.updateTrackInfo(); this.updateActivePrefab();
        print(`Loading track ${index}: ${trackData.title} (${trackData.isRemote ? 'Remote' : 'Local'}) - Play: ${playAfterLoad}`);

        if (trackData.isRemote) {
            // REMOTE LOADING (Identical to old.ts)
            this.isLoadingRemote = true; const remoteAsset = trackData.asset as RemoteReferenceAsset; if (this.timecodeText) this.timecodeText.text = "Loading...";
            const onDownloaded = (asset: Asset) => { /* ... (identical callback logic) ... */
                if (this.currentTrackIndex !== index || !this.isLoadingRemote) { print(`DL callback ignored ${index}`); this.isLoadingRemote = (this.currentTrackIndex === index && this.isLoadingRemote); return; } this.isLoadingRemote = false; if (asset && asset.isOfType("Asset.AudioTrackAsset")) { const track = asset as AudioTrackAsset; print(`Downloaded: ${trackData.title}`); if (!this.audioComponent) { print("Err: AudioComp missing"); this.handleLoadError(index, "AudioComp missing"); return; } try { this.audioComponent.audioTrack = track; this.audioInitialized = true; this.trackStartTime=getTime(); this.currentPlaybackTime=0; if (playAfterLoad) { print("Auto-playing remote."); this.delayedCall(0.05, ()=>this.playTrack()); } else { this.updatePlayer(); } } catch (e) { print(`Err setting DL track: ${e}`); this.handleLoadError(index, "Set track fail"); } } else { const type=asset?asset.getTypeName():"null"; print(`Err: DL invalid type ${type}`); this.handleLoadError(index, "Invalid asset type"); }
            };
            const onFailed = () => { /* ... (identical callback logic) ... */
                if (this.currentTrackIndex !== index || !this.isLoadingRemote) { print(`DL fail ignored ${index}`); this.isLoadingRemote = (this.currentTrackIndex === index && this.isLoadingRemote); return; } this.isLoadingRemote = false; print(`Err: DL failed ${index}.`); this.handleLoadError(index, "Download failed");
             };
            try { print(`Starting DL: "${trackData.title}"`); remoteAsset.downloadAsset(onDownloaded, onFailed); }
            catch (e) { print("Err calling DL: " + e); this.isLoadingRemote = false; this.handleLoadError(index, "DL init fail"); }
        } else {
            // LOCAL LOADING (Identical to old.ts)
            if (!this.audioComponent) { print("Err: AudioComp missing local."); this.handleLoadError(index, "AudioComp missing"); return; }
            try { const localAsset = trackData.asset as AudioTrackAsset; this.audioComponent.audioTrack = localAsset; this.audioInitialized = true; this.trackStartTime=getTime(); this.currentPlaybackTime=0; print(`Local loaded: ${trackData.title}`); if (playAfterLoad) { print("Auto-playing local."); this.delayedCall(0.05, ()=>this.playTrack()); } else { this.updatePlayer(); } }
            catch (e) { print(`Err loading local: ${e}`); this.handleLoadError(index, "Local load error"); }
        }
    }

    // handleLoadError remains IDENTICAL to old.ts
    private handleLoadError(failedIndex: number, reason: string): void { /* ... (identical logic) ... */
         print(`Handle load error ${failedIndex}: ${reason}`); if (this.currentTrackIndex === failedIndex) { this.stopTrack(); if (this.artistNameText) try{this.artistNameText.text = "Error";}catch(e){} if (this.trackTitleText) try{this.trackTitleText.text = "Load Failed";}catch(e){} if (this.timecodeText) try{this.timecodeText.text = "--:--";}catch(e){} } else { print(`Load err ${failedIndex} ignored, current ${this.currentTrackIndex}.`); }
     }

    // togglePlayPause remains IDENTICAL to old.ts logic + blink calls
    private togglePlayPause(): void { /* ... (identical logic + stopBlinking/startBlinking calls) ... */
        if (this.isLoadingRemote) { print("Play/Pause ignored: Loading."); return; } if (this.allTracksData.length === 0) { print("Play/Pause ignored: No tracks."); return; } print(`Toggle Play/Pause: Playing=${this.isPlaying}, Paused=${this.isPaused}, Init=${this.audioInitialized}, Idx=${this.currentTrackIndex}`); if (this.isPlaying) { this.pauseTrack(); } else { if (this.currentTrackIndex === -1) { print("Start playback track 0."); this.shouldAutoPlay = true; this.loadTrack(0); } else if (this.isPaused && this.audioInitialized && this.audioComponent?.audioTrack) { print("Resuming."); this.playTrack(); } else if (!this.isPaused && this.audioInitialized && this.audioComponent?.audioTrack) { print("Starting loaded track."); this.playTrack(); } else if (!this.audioInitialized && this.currentTrackIndex !== -1) { print("Reloading uninitialized track."); this.shouldAutoPlay = true; this.loadTrack(this.currentTrackIndex); } else { print("Play/Pause ignored: Unexpected."); if (this.currentTrackIndex === -1) this.startBlinkingPlayButton(); } }
     }

    // --- playTrack: Now sets expectTrackFinish flag ---
    private playTrack(): void {
        this.stopBlinkingPlayButton();
        if (this.isLoadingRemote) { print("Play ignored: Loading."); return; }
        if (!this.audioInitialized || !this.audioComponent || !this.audioComponent.audioTrack) { print(`Cannot play: Not init.`); if (this.currentTrackIndex !== -1) { this.shouldAutoPlay = true; this.loadTrack(this.currentTrackIndex); } return; }
        try {
            // <<<=== NEW: Set the flag indicating we expect a finish event ===>>>
            this.expectTrackFinish = true;
            const title = this.allTracksData[this.currentTrackIndex]?.title || "?";
            if (this.isPaused) { print(`Resuming: ${title}`); this.audioComponent.resume(); this.isPlaying = true; this.isPaused = false; this.trackStartTime = getTime() - this.currentPlaybackTime; }
            else if (!this.isPlaying) { print(`Starting: ${title}`); this.currentPlaybackTime = 0; this.trackStartTime = getTime(); this.audioComponent.play(1); this.isPlaying = true; this.isPaused = false; }
            else { print(`Play called while playing ${title}.`); this.expectTrackFinish = this.isPlaying; /* Keep true if already playing */ } // Keep true if already playing
            this.isManualStop = false;
        } catch (e) { print(`Error play/resume: ${e}`); this.expectTrackFinish = false; this.handleLoadError(this.currentTrackIndex, "Playback error"); }
    }

    // --- pauseTrack: Now clears expectTrackFinish flag ---
    private pauseTrack(): void {
        this.stopBlinkingPlayButton();
        if (!this.isPlaying || !this.audioInitialized || !this.audioComponent || !this.audioComponent.isPlaying()) { print(`Pause ignored: Invalid state.`); if(this.isPlaying) { this.isPlaying = false; this.isPaused = true; } return; }
        try {
            const title = this.allTracksData[this.currentTrackIndex]?.title || "?"; print(`Pausing: ${title}`);
            this.currentPlaybackTime = Math.max(0, getTime() - this.trackStartTime);
            this.audioComponent.pause();
            this.isPlaying = false; this.isPaused = true;
            // <<<=== NEW: Clear the flag, finish not expected after pause ===>>>
            this.expectTrackFinish = false;
            print(`Paused at ${this.formatTime(this.currentPlaybackTime)}`);
        } catch (e) { print("Error pausing: " + e); this.currentPlaybackTime = Math.max(0, getTime() - this.trackStartTime); this.isPlaying = false; this.isPaused = true; this.expectTrackFinish = false; }
    }

    // --- stopTrack: Now clears expectTrackFinish flag ---
    public stopTrack(): void {
         print("Stop track called."); this.isManualStop = true; this.isLoadingRemote = false; this.pendingDelayedCalls = [];
         // <<<=== NEW: Clear the flag ===>>>
         this.expectTrackFinish = false;
         if (this.audioComponent) {
             try { this.audioComponent.setOnFinish(null); } catch(e){} // Still good practice to remove listener
             if (this.audioComponent.isPlaying() || this.audioComponent.isPaused()) { print("Stopping audio..."); try { this.audioComponent.stop(false); } catch (e) {} }
             try { this.audioComponent.audioTrack = null; } catch (e) {}
         }
         this.isPlaying = false; this.isPaused = false; this.shouldAutoPlay = false; this.currentTrackIndex = -1; this.audioInitialized = false; this.currentPlaybackTime = 0;
         this.updateEarthPosition(0, 1); this.updateTrackInfo(); this.updateActivePrefab();
         this.startBlinkingPlayButton();
         print("Player stopped & reset.");
    }

    // nextTrack and prevTrack remain IDENTICAL to old.ts
    private nextTrack(): void { /* ... (identical logic) ... */ if (this.isLoadingRemote) return; if (this.allTracksData.length === 0) return; print("Next."); let idx=-1; const cur=this.currentTrackIndex; if(this.isRepeatEnabled&&cur!==-1){idx=cur;} else if(this.isShuffleEnabled){if(this.allTracksData.length>1){do{idx=Math.floor(Math.random()*this.allTracksData.length);}while(idx===cur);}else{idx=0;}} else {idx=(cur===-1)?0:cur+1; if(idx>=this.allTracksData.length){if(this.loopPlayback){idx=0;}else{this.stopTrack(); return;}}} if(idx<0||idx>=this.allTracksData.length){this.stopTrack(); return;} this.shouldAutoPlay=true; this.loadTrack(idx); }
    private prevTrack(): void { /* ... (identical logic) ... */ if (this.isLoadingRemote) return; if (this.allTracksData.length === 0) return; print("Prev."); let idx=-1; const cur=this.currentTrackIndex; if(this.isRepeatEnabled&&cur!==-1){idx=cur;} else if(this.isShuffleEnabled){if(this.allTracksData.length>1){do{idx=Math.floor(Math.random()*this.allTracksData.length);}while(idx===cur);}else{idx=0;}} else {idx=(cur===-1)?this.allTracksData.length-1:cur-1; if(idx<0){if(this.loopPlayback){idx=this.allTracksData.length-1;}else{this.stopTrack(); return;}}} if(idx<0||idx>=this.allTracksData.length){this.stopTrack(); return;} this.shouldAutoPlay=true; this.loadTrack(idx); }

    // UI update methods remain IDENTICAL to old.ts
    private updateTrackInfo(): void { /* ... (identical logic) ... */ let a = "", t = "Stopped", tc = "00:00/00:00"; const idx = this.currentTrackIndex; if (this.isLoadingRemote && idx !== -1 && idx < this.allTracksData.length) { const d=this.allTracksData[idx]; a=d?.artist||""; t=d?.title||"Loading..."; tc="Loading..."; } else if (idx !== -1 && idx < this.allTracksData.length) { const d=this.allTracksData[idx]; if(d){a=d.artist; t=d.title;} else {a="Error";t="Invalid";tc="--:--";} } else if (idx !== -1) { a="Error";t="Invalid";tc="--:--"; } if(this.artistNameText) try{this.artistNameText.text=a;}catch(e){} if(this.trackTitleText) try{this.trackTitleText.text=t;}catch(e){} if(this.timecodeText && (this.isLoadingRemote || idx===-1 || t.includes("Invalid") || t==="Error")) { try{this.timecodeText.text=tc;}catch(e){} } if(idx===-1 || this.isLoadingRemote) { this.updateEarthPosition(0,1); } }
    private updatePlayer(): void { /* ... (identical logic) ... */ if (this.isLoadingRemote || this.currentTrackIndex === -1 || !this.audioInitialized || !this.audioComponent || !this.audioComponent.audioTrack) { if (!this.isLoadingRemote && this.currentTrackIndex===-1) { this.updateEarthPosition(0,1); if(this.timecodeText&&this.timecodeText.text!=="00:00/00:00")try{this.timecodeText.text="00:00/00:00";}catch(e){} } else if(this.audioInitialized && (!this.audioComponent||!this.audioComponent.audioTrack) && this.timecodeText && this.timecodeText.text!=="--:--/--:--") { try{this.timecodeText.text="--:--/--:--";}catch(e){} this.updateEarthPosition(0,1); } return; } let ct=0, tt=0; try { tt=this.audioComponent.duration||0; if(this.isPlaying){ct=getTime()-this.trackStartTime;}else{ct=this.currentPlaybackTime;} ct=Math.max(0,ct); if(tt>0){ct=Math.min(ct,tt);}else{tt=0;ct=0;} if(this.timecodeText){const ts=`${this.formatTime(ct)}/${this.formatTime(tt)}`; if(this.timecodeText.text!==ts)try{this.timecodeText.text=ts;}catch(e){}} this.updateEarthPosition(ct,tt); } catch (e) { if(this.timecodeText)try{this.timecodeText.text="--:--/--:--";}catch(e){} this.updateEarthPosition(0,1); } }
    private updateEarthPosition(ct: number, tt: number): void { /* ... (identical logic) ... */ if(!this.earthSphere||!this.progressBar) return; try { let p=(tt>0.001)?(ct/tt):0; p=Math.max(0,Math.min(1,p)); const bt=this.progressBar.getTransform(),bs=bt.getWorldScale(),bp=bt.getWorldPosition(),br=bt.getWorldRotation(),et=this.earthSphere.getTransform(); const pd=br.multiplyVec3(vec3.right()),hl=bs.x/2.0,s=bp.sub(pd.uniformScale(hl)),e=bp.add(pd.uniformScale(hl)); const targ=s.add(e.sub(s).uniformScale(p)); const off=pd.uniformScale(this.earthSphereXOffset),fin=targ.add(off); et.setWorldPosition(fin); } catch (e) {} }
    private formatTime(s: number): string { /* ... (identical logic) ... */ if(isNaN(s)||s<0||!isFinite(s)) return "00:00"; const ts=Math.floor(s),m=Math.floor(ts/60),sec=ts%60; return m.toString().padStart(2,'0')+':'+sec.toString().padStart(2,'0'); }
    private setupProgressBar(): void { /* ... (identical logic) ... */ if(this.progressBar&&this.earthSphere){try{this.updateEarthPosition(0,1);}catch(e){}} }
    private updateSphereRotation(): void { /* ... (identical logic) ... */ if(this.earthSphere){try{const dt=getDeltaTime(); if(dt<=0)return; const et=this.earthSphere.getTransform(),cr=et.getLocalRotation(),rd=quat.fromEulerAngles(0,this.rotationSpeed*dt*(Math.PI/180.0),0); et.setLocalRotation(cr.multiply(rd));}catch(e){}} }

    // --- Public API ---
    public getCurrentTrackIndex(): number { return this.currentTrackIndex; }
    public getTrackPrefab(index: number): SceneObject | null { return (index>=0 && index<this.allTracksData.length) ? this.allTracksData[index].prefab : null; }

    // --- Cleanup (Merged) ---
    onDestroy(): void { /* ... (identical merged logic) ... */ print("Destroying MusicPlayerManager."); this.stopBlinkingPlayButton(); this.pendingDelayedCalls = []; if (this.audioComponent) { try {this.audioComponent.setOnFinish(null);} catch(e){} if(this.isPlaying||this.isPaused){try{this.audioComponent.stop(false);}catch(e){}} try{this.audioComponent.audioTrack = null;}catch(e){} } if(this.playPauseButton&&this.onPlayPauseCallback)try{this.playPauseButton.onButtonPinched.remove(this.onPlayPauseCallback);}catch(e){} if(this.nextTrackButton&&this.onNextTrackCallback)try{this.nextTrackButton.onButtonPinched.remove(this.onNextTrackCallback);}catch(e){} if(this.prevTrackButton&&this.onPrevTrackCallback)try{this.prevTrackButton.onButtonPinched.remove(this.onPrevTrackCallback);}catch(e){} if(this.repeatButton&&this.onRepeatCallback)try{this.repeatButton.onButtonPinched.remove(this.onRepeatCallback);}catch(e){} if(this.shuffleButton&&this.onShuffleCallback)try{this.shuffleButton.onButtonPinched.remove(this.onShuffleCallback);}catch(e){} if(this.stopButton&&this.onStopCallback)try{this.stopButton.onButtonPinched.remove(this.onStopCallback);}catch(e){} this.disableAllPrefabs(); }
}