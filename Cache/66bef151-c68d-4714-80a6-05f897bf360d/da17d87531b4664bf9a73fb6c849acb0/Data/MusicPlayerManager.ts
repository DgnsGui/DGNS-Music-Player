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
    // --- Inputs (Same as previous version) ---
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


    // --- Private variables (Same as previous version) ---
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
    private readonly DEBOUNCE_PLAYPAUSE = 0.5;
    private readonly DEBOUNCE_NEXTPREV = 0.3;


    // --- Callbacks (Same as previous version) ---
    private onPlayPauseCallback: (event: InteractorEvent) => void;
    private onNextTrackCallback: (event: InteractorEvent) => void;
    private onPrevTrackCallback: (event: InteractorEvent) => void;
    private onRepeatCallback: (event: InteractorEvent) => void;
    private onShuffleCallback: (event: InteractorEvent) => void;
    private onStopCallback: (event: InteractorEvent) => void;
    private onTrackFinishedCallback: (audioComponent: AudioComponent) => void;

    // --- Core Methods (onAwake, validation, combine, setupCallbacks, etc. - Same as previous version) ---
    onAwake(): void {
        this.api.stopTrack = this.stopTrack.bind(this);
        if (!this.validateInputs()) { print("Input validation failed."); return; }
        this.combineTrackData();
        if (this.allTracksData.length === 0) { print("No tracks provided."); }
        this.disableAllPrefabs();
        this.setupCallbacks();
        this.setupProgressBar();
        this.createEvent("UpdateEvent").bind(() => {
            this.updatePlayer();
            this.updateSphereRotation();
        });
        this.updateActivePrefab();
        this.updateTrackInfo();
        print(`Initialized with ${this.localTracks?.length || 0} local, ${this.remoteTracks?.length || 0} remote. Total: ${this.allTracksData.length}`);
    }

    private disableAllPrefabs(): void { /* ... same ... */
        this.allTracksData.forEach(track => { if (track.prefab) track.prefab.enabled = false; });
        if (this.stoppedPrefab) this.stoppedPrefab.enabled = false;
    }
    private validateInputs(): boolean { /* ... same ... */
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
    private combineTrackData(): void { /* ... same ... */
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
    private setupCallbacks(): void { /* ... same ... */
        if (this.playPauseButton) {
            this.onPlayPauseCallback = (event: InteractorEvent) => { const ct=getTime(); if (ct-this.lastPinchTimePlayPause < this.DEBOUNCE_PLAYPAUSE) return; this.lastPinchTimePlayPause=ct; this.togglePlayPause(); };
            this.playPauseButton.onButtonPinched.add(this.onPlayPauseCallback);
        }
         if (this.nextTrackButton) {
            this.onNextTrackCallback = (event: InteractorEvent) => { const ct=getTime(); if (ct-this.lastPinchTimeNext < this.DEBOUNCE_NEXTPREV) return; this.lastPinchTimeNext=ct; this.nextTrack(); };
            this.nextTrackButton.onButtonPinched.add(this.onNextTrackCallback);
        }
        if (this.prevTrackButton) {
            this.onPrevTrackCallback = (event: InteractorEvent) => { const ct=getTime(); if (ct-this.lastPinchTimePrev < this.DEBOUNCE_NEXTPREV) return; this.lastPinchTimePrev=ct; this.prevTrack(); };
            this.prevTrackButton.onButtonPinched.add(this.onPrevTrackCallback);
        }
        if (this.repeatButton) {
            this.onRepeatCallback = (event: InteractorEvent) => { this.isRepeatEnabled = !this.isRepeatEnabled; print("Repeat " + (this.isRepeatEnabled ? "enabled" : "disabled")); if (this.isRepeatEnabled) this.isShuffleEnabled = false; };
            this.repeatButton.onButtonPinched.add(this.onRepeatCallback);
        }
        if (this.shuffleButton) {
            this.onShuffleCallback = (event: InteractorEvent) => { this.isShuffleEnabled = !this.isShuffleEnabled; print("Shuffle mode " + (this.isShuffleEnabled ? "enabled" : "disabled")); if (this.isShuffleEnabled) this.isRepeatEnabled = false; };
            this.shuffleButton.onButtonPinched.add(this.onShuffleCallback);
        }
        if (this.stopButton) {
            this.onStopCallback = (event: InteractorEvent) => this.stopTrack();
            this.stopButton.onButtonPinched.add(this.onStopCallback);
        }
        this.setupTrackFinishedCallback();
    }
    private setupTrackFinishedCallback(): void { /* ... same ... */
        this.onTrackFinishedCallback = (audioComponent: AudioComponent) => {
            if (audioComponent !== this.audioComponent || this.isLoadingRemote || this.isManualStop || this.isPaused) { if(this.isManualStop) this.isManualStop = false; return; }
            print("Track finished event detected, handling auto-advance.");
            this.handleTrackFinished();
        };
        if (this.audioComponent) { this.audioComponent.setOnFinish(this.onTrackFinishedCallback); }
    }
    private handleTrackFinished(): void { /* ... same ... */
        print("Handle Track Finished - Determining next action.");
        if (this.currentTrackIndex === -1 || this.allTracksData.length === 0) { this.stopTrack(); return; }
        this.shouldAutoPlay = true; // Intent to play next
        if (this.isRepeatEnabled) { this.loadTrack(this.currentTrackIndex); }
        else if (this.isShuffleEnabled) { let ni; if (this.allTracksData.length > 1) { do { ni = Math.floor(Math.random() * this.allTracksData.length); } while (ni === this.currentTrackIndex); } else { ni = 0; } this.loadTrack(ni); }
        else { let ni = this.currentTrackIndex + 1; if (ni >= this.allTracksData.length) { if (this.loopPlayback) { this.loadTrack(0); } else { print("End, no loop. Stopping."); this.shouldAutoPlay = false; this.stopTrack(); } } else { this.loadTrack(ni); } }
    }
    private updateActivePrefab(): void { /* ... same ... */
        if (this.currentActivePrefab) { this.currentActivePrefab.enabled = false; this.currentActivePrefab = null; }
        if (this.currentTrackIndex === -1) { if (this.stoppedPrefab) { this.stoppedPrefab.enabled = true; this.currentActivePrefab = this.stoppedPrefab; } }
        else if (this.currentTrackIndex >= 0 && this.currentTrackIndex < this.allTracksData.length) { const cd = this.allTracksData[this.currentTrackIndex]; if (cd && cd.prefab) { cd.prefab.enabled = true; this.currentActivePrefab = cd.prefab; } }
    }
    private loadTrack(index: number): void { /* ... same ... */
        if (this.isLoadingRemote) { print(`Load track (${index}) ignored: Loading remote.`); return; }
        if (index < 0 || index >= this.allTracksData.length) { print(`Error: Invalid track index ${index}.`); this.stopTrack(); return; }
        const playAfterLoad = this.shouldAutoPlay; this.shouldAutoPlay = false;
        this.audioInitialized = false; this.isManualStop = false;
        if (this.isPlaying || this.isPaused) { if (this.audioComponent.isPlaying() || this.audioComponent.isPaused()) { try { this.audioComponent.stop(false); } catch(e){} } }
        this.isPlaying = false; this.isPaused = false; this.currentPlaybackTime = 0; this.audioComponent.audioTrack = null;
        this.currentTrackIndex = index; const trackData = this.allTracksData[this.currentTrackIndex];
        this.updateTrackInfo(); this.updateActivePrefab();
        print(`Loading track ${index}: ${trackData.title} (${trackData.isRemote ? 'Remote' : 'Local'}) - Intent to play: ${playAfterLoad}`);
        if (trackData.isRemote) {
            this.isLoadingRemote = true; const remoteAsset = trackData.asset as RemoteReferenceAsset; if (this.timecodeText) this.timecodeText.text = "Loading...";
            const onDownloadedCallback = (downloadedAsset: Asset) => { if (this.currentTrackIndex !== index || !this.isLoadingRemote) { this.isLoadingRemote=false; return; } this.isLoadingRemote = false; if (downloadedAsset && downloadedAsset.isOfType("Asset.AudioTrackAsset")) { const audioTrack = downloadedAsset as AudioTrackAsset; print(`Remote track ${trackData.title} downloaded.`); this.audioComponent.audioTrack = audioTrack; this.setupTrackFinishedCallback(); this.audioInitialized = true; this.trackStartTime = getTime(); this.currentPlaybackTime = 0; if (playAfterLoad) { this.delayedCall(0.05, () => this.playTrack()); } else { this.updatePlayer(); } } else { this.handleLoadError(index, "Invalid asset type"); } };
            const onFailedCallback = () => { if (this.currentTrackIndex !== index || !this.isLoadingRemote) { this.isLoadingRemote=false; return; } this.isLoadingRemote = false; this.handleLoadError(index, "Download failed"); };
            remoteAsset.downloadAsset(onDownloadedCallback, onFailedCallback);
        } else {
            const localAsset = trackData.asset as AudioTrackAsset; this.audioComponent.audioTrack = localAsset; this.setupTrackFinishedCallback(); this.audioInitialized = true; this.trackStartTime = getTime(); this.currentPlaybackTime = 0; print(`Local track ${trackData.title} loaded.`); if (playAfterLoad) { this.delayedCall(0.05, () => this.playTrack()); } else { this.updatePlayer(); }
        }
    }
    private handleLoadError(failedIndex: number, reason: string): void { /* ... same ... */ print(`Load error track ${failedIndex}: ${reason}`); this.stopTrack(); if(this.artistNameText)this.artistNameText.text="Error"; if(this.trackTitleText)this.trackTitleText.text="Load Failed"; if(this.timecodeText)this.timecodeText.text="--:-- / --:--"; }
    private togglePlayPause(): void { /* ... same ... */ if (this.isLoadingRemote) { print("Play/Pause ignored: Loading remote."); return; } if (this.allTracksData.length === 0) { print("Play/Pause ignored: No tracks."); return; } print(`Toggle Play/Pause - State: ${this.isPlaying ? 'Playing' : (this.isPaused ? 'Paused' : 'Stopped')}`); if (this.isPlaying) { this.pauseTrack(); } else { if (this.currentTrackIndex === -1) { print("Starting playback."); this.shouldAutoPlay = true; this.loadTrack(0); } else if (this.isPaused && this.audioInitialized) { this.playTrack(); } else if (!this.isPaused && this.audioInitialized) { this.playTrack(); } else { print("Play ignored: Audio not ready."); } } }
    private playTrack(): void { /* ... same ... */ if (this.isLoadingRemote) { print("Play ignored: Loading remote."); return; } if (!this.audioInitialized || !this.audioComponent || !this.audioComponent.audioTrack) { print("Cannot play: Not initialized."); if(this.currentTrackIndex !== -1) { print("Attempting reload."); this.shouldAutoPlay = true; this.loadTrack(this.currentTrackIndex); } return; } try { if (this.isPaused) { print("Resuming: " + this.allTracksData[this.currentTrackIndex].title); this.audioComponent.resume(); this.isPlaying = true; this.isPaused = false; this.trackStartTime = getTime() - this.currentPlaybackTime; } else if (!this.isPlaying) { print("Starting: " + this.allTracksData[this.currentTrackIndex].title); this.audioComponent.play(1); this.isPlaying = true; this.isPaused = false; this.trackStartTime = getTime(); this.currentPlaybackTime = 0; } } catch (e) { print("Error playing/resuming: " + e); this.handleLoadError(this.currentTrackIndex, "Playback error"); } }
    private pauseTrack(): void { /* ... same ... */ if (!this.isPlaying || !this.audioComponent || !this.audioComponent.isPlaying()) { if(this.isPlaying) this.isPlaying = false; return; } try { this.audioComponent.pause(); this.currentPlaybackTime = getTime() - this.trackStartTime; this.isPlaying = false; this.isPaused = true; print("Paused at " + this.formatTime(this.currentPlaybackTime)); } catch (e) { print("Error pausing: " + e); this.currentPlaybackTime = Math.max(0, getTime() - this.trackStartTime); this.isPlaying = false; this.isPaused = true; } }
    public stopTrack(): void { /* ... same ... */ print("Stop called."); this.isManualStop = true; this.isLoadingRemote = false; if (this.audioComponent) { if (this.audioComponent.isPlaying() || this.audioComponent.isPaused()) { try { this.audioComponent.stop(true); } catch (e) {} } this.audioComponent.audioTrack = null; } this.isPlaying = false; this.isPaused = false; this.shouldAutoPlay = false; this.currentTrackIndex = -1; this.audioInitialized = false; this.currentPlaybackTime = 0; this.updateEarthPosition(0, 1); this.updateTrackInfo(); this.updateActivePrefab(); print("Stopped & reset."); }
    private nextTrack(): void { /* ... same ... */ if (this.isLoadingRemote) { print("Next ignored: Loading."); return; } if (this.allTracksData.length === 0) { print("Next ignored: No tracks."); return; } print("Next track triggered."); let ni; if (this.isRepeatEnabled) { ni = (this.currentTrackIndex === -1) ? 0 : this.currentTrackIndex; } else if (this.isShuffleEnabled) { if (this.allTracksData.length > 1) { do { ni = Math.floor(Math.random() * this.allTracksData.length); } while (ni === this.currentTrackIndex); } else { ni = 0; } } else { ni = (this.currentTrackIndex === -1) ? 0 : this.currentTrackIndex + 1; if (ni >= this.allTracksData.length) { if (this.loopPlayback) { ni = 0; } else { print("End, no loop."); this.stopTrack(); return; } } } if (ni < 0 || ni >= this.allTracksData.length) { print(`Next error: Invalid index (${ni}).`); this.stopTrack(); return; } this.shouldAutoPlay = true; this.loadTrack(ni); }
    private prevTrack(): void { /* ... same ... */ if (this.isLoadingRemote) { print("Prev ignored: Loading."); return; } if (this.allTracksData.length === 0) { print("Prev ignored: No tracks."); return; } print("Prev track triggered"); let pi; if (this.isRepeatEnabled) { pi = (this.currentTrackIndex === -1) ? this.allTracksData.length - 1 : this.currentTrackIndex; } else if (this.isShuffleEnabled) { if (this.allTracksData.length > 1) { do { pi = Math.floor(Math.random() * this.allTracksData.length); } while (pi === this.currentTrackIndex); } else { pi = 0; } } else { pi = (this.currentTrackIndex === -1) ? this.allTracksData.length - 1 : this.currentTrackIndex - 1; if (pi < 0) { if (this.loopPlayback) { pi = this.allTracksData.length - 1; } else { print("Start, no loop."); this.stopTrack(); return; } } } if (pi < 0 || pi >= this.allTracksData.length) { print(`Prev error: Invalid index (${pi}).`); this.stopTrack(); return; } this.shouldAutoPlay = true; this.loadTrack(pi); }
    private updateTrackInfo(): void { /* ... same ... */ let a = ""; let t = "Stopped"; let tc = "00:00 / 00:00"; if (this.isLoadingRemote) { t = this.allTracksData[this.currentTrackIndex]?.title || "Loading..."; a = this.allTracksData[this.currentTrackIndex]?.artist || ""; tc = "Loading..."; } else if (this.currentTrackIndex !== -1 && this.currentTrackIndex < this.allTracksData.length) { const d = this.allTracksData[this.currentTrackIndex]; a = d.artist; t = d.title; } else if (this.currentTrackIndex !== -1) { a = "Error"; t = "Invalid Track"; tc = "--:-- / --:--"; } if (this.artistNameText) this.artistNameText.text = a; if (this.trackTitleText) this.trackTitleText.text = t; if (this.timecodeText && (this.currentTrackIndex === -1 || this.isLoadingRemote || t === "Invalid Track")) { this.timecodeText.text = tc; } if (this.currentTrackIndex === -1 || this.isLoadingRemote) { this.updateEarthPosition(0, 1); } }
    private updatePlayer(): void { /* ... same ... */ if (this.isLoadingRemote || this.currentTrackIndex === -1 || !this.audioInitialized || !this.audioComponent || !this.audioComponent.audioTrack) { this.updateEarthPosition(0, 1); return; } let ct = 0; let tt = 0; try { tt = this.audioComponent.duration || 0; if (this.isPlaying) { ct = getTime() - this.trackStartTime; } else { ct = this.currentPlaybackTime; } ct = Math.max(0, ct); if (tt > 0) { ct = Math.min(ct, tt); } else { tt = 0; } if (this.timecodeText) { this.timecodeText.text = `${this.formatTime(ct)} / ${this.formatTime(tt)}`; } this.updateEarthPosition(ct, tt); } catch (e) { print("Error updating player: " + e); if (this.timecodeText) { this.timecodeText.text = "--:-- / --:--"; } this.updateEarthPosition(0, 1); } }
    private updateEarthPosition(currentTime: number, totalTime: number): void { /* ... same ... */ if (this.earthSphere && this.progressBar) { let p = (totalTime > 0) ? (currentTime / totalTime) : 0; p = Math.max(0, Math.min(1, p)); try { const bt = this.progressBar.getTransform(); const bs = bt.getWorldScale(); const bp = bt.getWorldPosition(); const br = bt.getWorldRotation(); const et = this.earthSphere.getTransform(); const hl = bs.x / 2; const xa = br.multiplyVec3(vec3.right()); const sp = bp.sub(xa.uniformScale(hl)); const ep = bp.add(xa.uniformScale(hl)); const tp = sp.add(ep.sub(sp).uniformScale(p)); const xo = xa.uniformScale(this.earthSphereXOffset); const fp = tp.add(xo); et.setWorldPosition(fp); } catch (e) { print("Error updating sphere: " + e); } } }
    private formatTime(timeInSeconds: number): string { /* ... same ... */ if (isNaN(timeInSeconds) || timeInSeconds < 0) return "00:00"; const ts = Math.floor(timeInSeconds); const m = Math.floor(ts / 60); const s = ts % 60; return m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0'); }
    private setupProgressBar(): void { /* ... same ... */ if (this.progressBar && this.earthSphere) { this.updateEarthPosition(0, 1); } }
    private updateSphereRotation(): void { /* ... same ... */ if (this.earthSphere) { const dt = getDeltaTime(); const et = this.earthSphere.getTransform(); const cr = et.getLocalRotation(); const rd = quat.fromEulerAngles(0, this.rotationSpeed * dt * (Math.PI / 180), 0); const nr = cr.multiply(rd); et.setLocalRotation(nr); } }
    public getCurrentTrackIndex(): number { /* ... same ... */ return this.currentTrackIndex; }
    public getTrackPrefab(index: number): SceneObject | null { /* ... same ... */ return (index >= 0 && index < this.allTracksData.length) ? this.allTracksData[index].prefab : null; }
    onDestroy(): void { /* ... same ... */ print("Destroying MusicPlayerManager."); if (this.audioComponent && (this.isPlaying || this.isPaused)) { try { this.audioComponent.stop(false); } catch (e) {} } if (this.playPauseButton && this.onPlayPauseCallback) this.playPauseButton.onButtonPinched.remove(this.onPlayPauseCallback); if (this.nextTrackButton && this.onNextTrackCallback) this.nextTrackButton.onButtonPinched.remove(this.onNextTrackCallback); if (this.prevTrackButton && this.onPrevTrackCallback) this.prevTrackButton.onButtonPinched.remove(this.onPrevTrackCallback); if (this.repeatButton && this.onRepeatCallback) this.repeatButton.onButtonPinched.remove(this.onRepeatCallback); if (this.shuffleButton && this.onShuffleCallback) this.shuffleButton.onButtonPinched.remove(this.onShuffleCallback); if (this.stopButton && this.onStopCallback) this.stopButton.onButtonPinched.remove(this.onStopCallback); if (this.audioComponent) { try { this.audioComponent.setOnFinish(null); } catch (e) {} } this.disableAllPrefabs(); }


    // --- MODIFIED: delayedCall uses UpdateEvent ---
    private delayedCall(delay: number, callback: () => void): void {
        // Use the standard "UpdateEvent"
        const delayEvent = this.createEvent("UpdateEvent");
        const startTime = getTime();

        // Define the temporary listener function
        const listener = () => {
            if (getTime() - startTime >= delay) {
                callback();
                // Crucially, unbind this specific listener after execution
                delayEvent.unbind(listener);
            }
        };

        // Bind the temporary listener
        delayEvent.bind(listener);

        // Note: We don't enable/disable the global UpdateEvent here.
        // It should already be running from the main setup in onAwake.
    }

}