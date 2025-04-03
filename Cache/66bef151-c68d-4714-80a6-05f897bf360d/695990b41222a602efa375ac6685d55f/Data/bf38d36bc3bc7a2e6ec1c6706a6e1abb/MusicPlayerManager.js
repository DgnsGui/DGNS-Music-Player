"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicPlayerManager = void 0;
var __selfType = requireType("./MusicPlayerManager");
function component(target) { target.getTypeName = function () { return __selfType; }; }
let MusicPlayerManager = class MusicPlayerManager extends BaseScriptComponent {
    // --- Core Methods ---
    onAwake() {
        var _a, _b;
        this.api.stopTrack = this.stopTrack.bind(this);
        if (!this.validateInputs()) {
            print("Input validation failed.");
            return;
        }
        this.combineTrackData();
        if (this.allTracksData.length === 0) {
            print("No tracks provided.");
        }
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
        print(`Initialized with ${((_a = this.localTracks) === null || _a === void 0 ? void 0 : _a.length) || 0} local, ${((_b = this.remoteTracks) === null || _b === void 0 ? void 0 : _b.length) || 0} remote. Total: ${this.allTracksData.length}`);
    }
    disableAllPrefabs() {
        this.allTracksData.forEach(track => { if (track.prefab)
            track.prefab.enabled = false; });
        if (this.stoppedPrefab)
            this.stoppedPrefab.enabled = false;
    }
    validateInputs() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        let isValid = true;
        if (!this.audioComponent) {
            print("Error: Audio component not defined.");
            isValid = false;
        }
        if (!this.earthSphere || !this.progressBar) {
            print("Warning: Progress visualization objects not defined.");
        }
        const numLocalTracks = ((_a = this.localTracks) === null || _a === void 0 ? void 0 : _a.length) || 0;
        if (numLocalTracks > 0) {
            if (!this.localArtists || this.localArtists.length !== numLocalTracks) {
                print(`Error: Mismatch local tracks (${numLocalTracks}) and artists (${((_b = this.localArtists) === null || _b === void 0 ? void 0 : _b.length) || 0}).`);
                isValid = false;
            }
            if (!this.localTitles || this.localTitles.length !== numLocalTracks) {
                print(`Error: Mismatch local tracks (${numLocalTracks}) and titles (${((_c = this.localTitles) === null || _c === void 0 ? void 0 : _c.length) || 0}).`);
                isValid = false;
            }
            if (!this.localTrackPrefabs || this.localTrackPrefabs.length !== numLocalTracks) {
                print(`Error: Mismatch local tracks (${numLocalTracks}) and prefabs (${((_d = this.localTrackPrefabs) === null || _d === void 0 ? void 0 : _d.length) || 0}).`);
                isValid = false;
            }
            if (this.localTracks.some(track => track == null)) {
                print("Error: One or more local tracks are null.");
                isValid = false;
            }
            if (this.localTrackPrefabs.some(prefab => prefab == null)) {
                print("Error: One or more local prefabs are null.");
                isValid = false;
            }
        }
        const numRemoteTracks = ((_e = this.remoteTracks) === null || _e === void 0 ? void 0 : _e.length) || 0;
        if (numRemoteTracks > 0) {
            if (!this.remoteArtists || this.remoteArtists.length !== numRemoteTracks) {
                print(`Error: Mismatch remote tracks (${numRemoteTracks}) and artists (${((_f = this.remoteArtists) === null || _f === void 0 ? void 0 : _f.length) || 0}).`);
                isValid = false;
            }
            if (!this.remoteTitles || this.remoteTitles.length !== numRemoteTracks) {
                print(`Error: Mismatch remote tracks (${numRemoteTracks}) and titles (${((_g = this.remoteTitles) === null || _g === void 0 ? void 0 : _g.length) || 0}).`);
                isValid = false;
            }
            if (!this.remoteTrackPrefabs || this.remoteTrackPrefabs.length !== numRemoteTracks) {
                print(`Error: Mismatch remote tracks (${numRemoteTracks}) and prefabs (${((_h = this.remoteTrackPrefabs) === null || _h === void 0 ? void 0 : _h.length) || 0}).`);
                isValid = false;
            }
            if (this.remoteTracks.some(track => track == null)) {
                print("Error: One or more remote tracks are null.");
                isValid = false;
            }
            if (this.remoteTrackPrefabs.some(prefab => prefab == null)) {
                print("Error: One or more remote prefabs are null.");
                isValid = false;
            }
        }
        return isValid;
    }
    combineTrackData() {
        var _a, _b, _c, _d, _e, _f;
        this.allTracksData = [];
        if (this.localTracks) {
            for (let i = 0; i < this.localTracks.length; i++) {
                if (this.localTracks[i] && ((_a = this.localArtists) === null || _a === void 0 ? void 0 : _a[i]) !== undefined && ((_b = this.localTitles) === null || _b === void 0 ? void 0 : _b[i]) !== undefined && ((_c = this.localTrackPrefabs) === null || _c === void 0 ? void 0 : _c[i])) {
                    this.allTracksData.push({ asset: this.localTracks[i], artist: this.localArtists[i], title: this.localTitles[i], prefab: this.localTrackPrefabs[i], isRemote: false });
                }
                else {
                    print(`Warning: Skipping local track at index ${i} due to missing data.`);
                }
            }
        }
        if (this.remoteTracks) {
            for (let i = 0; i < this.remoteTracks.length; i++) {
                if (this.remoteTracks[i] && ((_d = this.remoteArtists) === null || _d === void 0 ? void 0 : _d[i]) !== undefined && ((_e = this.remoteTitles) === null || _e === void 0 ? void 0 : _e[i]) !== undefined && ((_f = this.remoteTrackPrefabs) === null || _f === void 0 ? void 0 : _f[i])) {
                    this.allTracksData.push({ asset: this.remoteTracks[i], artist: this.remoteArtists[i], title: this.remoteTitles[i], prefab: this.remoteTrackPrefabs[i], isRemote: true });
                }
                else {
                    print(`Warning: Skipping remote track at index ${i} due to missing data.`);
                }
            }
        }
    }
    setupCallbacks() {
        // Assign callbacks with integrated debounce checks
        if (this.playPauseButton) {
            this.onPlayPauseCallback = (event) => { const ct = getTime(); if (ct - this.lastPinchTimePlayPause < this.DEBOUNCE_TIME)
                return; this.lastPinchTimePlayPause = ct; this.togglePlayPause(); };
            this.playPauseButton.onButtonPinched.add(this.onPlayPauseCallback);
        }
        if (this.nextTrackButton) {
            this.onNextTrackCallback = (event) => { const ct = getTime(); if (ct - this.lastPinchTimeNext < this.DEBOUNCE_TIME)
                return; this.lastPinchTimeNext = ct; this.nextTrack(); };
            this.nextTrackButton.onButtonPinched.add(this.onNextTrackCallback);
        }
        if (this.prevTrackButton) {
            this.onPrevTrackCallback = (event) => { const ct = getTime(); if (ct - this.lastPinchTimePrev < this.DEBOUNCE_TIME)
                return; this.lastPinchTimePrev = ct; this.prevTrack(); };
            this.prevTrackButton.onButtonPinched.add(this.onPrevTrackCallback);
        }
        if (this.repeatButton) {
            this.onRepeatCallback = (event) => { this.isRepeatEnabled = !this.isRepeatEnabled; print("Repeat " + (this.isRepeatEnabled ? "enabled" : "disabled")); if (this.isRepeatEnabled)
                this.isShuffleEnabled = false; };
            this.repeatButton.onButtonPinched.add(this.onRepeatCallback);
        }
        if (this.shuffleButton) {
            this.onShuffleCallback = (event) => { this.isShuffleEnabled = !this.isShuffleEnabled; print("Shuffle mode " + (this.isShuffleEnabled ? "enabled" : "disabled")); if (this.isShuffleEnabled)
                this.isRepeatEnabled = false; };
            this.shuffleButton.onButtonPinched.add(this.onShuffleCallback);
        }
        if (this.stopButton) {
            this.onStopCallback = (event) => this.stopTrack();
            this.stopButton.onButtonPinched.add(this.onStopCallback);
        }
        this.setupTrackFinishedCallback();
    }
    setupTrackFinishedCallback() {
        this.onTrackFinishedCallback = (audioComponent) => {
            if (audioComponent !== this.audioComponent || this.isLoadingRemote || this.isManualStop || this.isPaused) {
                if (this.isManualStop)
                    this.isManualStop = false;
                return;
            }
            print("Track finished event detected, handling auto-advance.");
            this.handleTrackFinished();
        };
        if (this.audioComponent) {
            this.audioComponent.setOnFinish(this.onTrackFinishedCallback);
        }
    }
    handleTrackFinished() {
        print("Handle Track Finished - Determining next action.");
        if (this.currentTrackIndex === -1 || this.allTracksData.length === 0) {
            this.stopTrack();
            return;
        }
        this.shouldAutoPlay = true; // Intent to play next
        let nextIndex = -1;
        if (this.isRepeatEnabled) {
            nextIndex = this.currentTrackIndex;
        }
        else if (this.isShuffleEnabled) {
            if (this.allTracksData.length > 1) {
                do {
                    nextIndex = Math.floor(Math.random() * this.allTracksData.length);
                } while (nextIndex === this.currentTrackIndex);
            }
            else {
                nextIndex = 0;
            }
        }
        else {
            nextIndex = this.currentTrackIndex + 1;
            if (nextIndex >= this.allTracksData.length) {
                if (this.loopPlayback) {
                    nextIndex = 0;
                }
                else {
                    print("End, no loop. Stopping.");
                    this.shouldAutoPlay = false;
                    this.stopTrack();
                    return;
                }
            }
        }
        if (nextIndex >= 0 && nextIndex < this.allTracksData.length) {
            this.loadTrack(nextIndex);
        }
        else {
            print(`Error: Invalid next index (${nextIndex}) in handleTrackFinished.`);
            this.stopTrack();
        }
    }
    updateActivePrefab() {
        if (this.currentActivePrefab) {
            this.currentActivePrefab.enabled = false;
            this.currentActivePrefab = null;
        }
        if (this.currentTrackIndex === -1) {
            if (this.stoppedPrefab) {
                this.stoppedPrefab.enabled = true;
                this.currentActivePrefab = this.stoppedPrefab;
            }
        }
        else if (this.currentTrackIndex >= 0 && this.currentTrackIndex < this.allTracksData.length) {
            const cd = this.allTracksData[this.currentTrackIndex];
            if (cd && cd.prefab) {
                cd.prefab.enabled = true;
                this.currentActivePrefab = cd.prefab;
            }
        }
    }
    // --- MODIFIED: delayedCall adds to the pending list ---
    delayedCall(delay, callback) {
        if (!callback)
            return;
        if (delay <= 0) {
            try {
                callback();
            }
            catch (e) {
                print("Error in immediate delayedCall callback: " + e);
            }
            return;
        }
        const executeTime = getTime() + delay;
        this.pendingDelayedCalls.push({ executeTime: executeTime, callback: callback });
    }
    // --- NEW: Function to process pending delayed calls ---
    checkDelayedCalls() {
        if (this.pendingDelayedCalls.length === 0) {
            return;
        }
        const currentTime = getTime();
        for (let i = this.pendingDelayedCalls.length - 1; i >= 0; i--) {
            const call = this.pendingDelayedCalls[i];
            if (currentTime >= call.executeTime) {
                this.pendingDelayedCalls.splice(i, 1); // Remove *before* executing
                try {
                    call.callback();
                }
                catch (e) {
                    print("Error executing delayed call callback: " + e);
                }
            }
        }
    }
    // --- MODIFIED: loadTrack ensures stop(true) is called robustly ---
    loadTrack(index) {
        if (this.isLoadingRemote) {
            print(`Load track (${index}) ignored: Loading remote.`);
            return;
        }
        if (index < 0 || index >= this.allTracksData.length) {
            print(`Error: Invalid track index ${index}.`);
            this.stopTrack();
            return;
        }
        const playAfterLoad = this.shouldAutoPlay;
        this.shouldAutoPlay = false; // Consume the flag
        this.audioInitialized = false;
        this.isManualStop = false;
        // --- Stop Sequence ---
        let wasPlayingOrPaused = this.isPlaying || this.isPaused;
        if (wasPlayingOrPaused && this.audioComponent) {
            if (this.audioComponent.isPlaying() || this.audioComponent.isPaused()) {
                print("Stopping previous track...");
                try {
                    // *** Use stop(true) to allow fade-out ***
                    this.audioComponent.stop(true);
                }
                catch (e) {
                    print("Error stopping previous track: " + e);
                }
            }
        }
        // Immediately update internal state
        this.isPlaying = false;
        this.isPaused = false;
        this.currentPlaybackTime = 0;
        // Clear the track reference
        if (this.audioComponent) {
            this.audioComponent.audioTrack = null;
        }
        // --- End Stop Sequence ---
        // Set the new index and update UI
        this.currentTrackIndex = index;
        const trackData = this.allTracksData[this.currentTrackIndex];
        this.updateTrackInfo();
        this.updateActivePrefab();
        print(`Loading track ${index}: ${trackData.title} (${trackData.isRemote ? 'Remote' : 'Local'}) - Intent to play: ${playAfterLoad}`);
        // --- Load/Download Logic ---
        if (trackData.isRemote) {
            this.isLoadingRemote = true;
            const remoteAsset = trackData.asset;
            if (this.timecodeText)
                this.timecodeText.text = "Loading...";
            const onDownloadedCallback = (downloadedAsset) => {
                if (this.currentTrackIndex !== index || !this.isLoadingRemote) { /* Relevance check */
                    this.isLoadingRemote = (this.currentTrackIndex === index);
                    return;
                }
                this.isLoadingRemote = false;
                if (downloadedAsset && downloadedAsset.isOfType("Asset.AudioTrackAsset")) {
                    const audioTrack = downloadedAsset;
                    print(`Remote track ${trackData.title} downloaded.`);
                    this.audioComponent.audioTrack = audioTrack;
                    this.setupTrackFinishedCallback();
                    this.audioInitialized = true;
                    this.trackStartTime = getTime();
                    this.currentPlaybackTime = 0;
                    if (playAfterLoad) {
                        print("Auto-playing downloaded.");
                        this.delayedCall(0.05, () => this.playTrack());
                    }
                    else {
                        this.updatePlayer();
                    } // Use delay slightly
                }
                else {
                    this.handleLoadError(index, "Invalid asset type");
                }
            };
            const onFailedCallback = () => {
                if (this.currentTrackIndex !== index || !this.isLoadingRemote) { /* Relevance check */
                    this.isLoadingRemote = (this.currentTrackIndex === index);
                    return;
                }
                this.isLoadingRemote = false;
                this.handleLoadError(index, "Download failed");
            };
            remoteAsset.downloadAsset(onDownloadedCallback, onFailedCallback);
        }
        else {
            // Local Asset
            try {
                const localAsset = trackData.asset;
                this.audioComponent.audioTrack = localAsset;
                this.setupTrackFinishedCallback();
                this.audioInitialized = true;
                this.trackStartTime = getTime();
                this.currentPlaybackTime = 0;
                print(`Local track ${trackData.title} loaded.`);
                if (playAfterLoad) {
                    print("Auto-playing local.");
                    this.delayedCall(0.05, () => this.playTrack());
                }
                else {
                    this.updatePlayer();
                } // Use delay slightly
            }
            catch (e) {
                print("Error loading local: " + e);
                this.handleLoadError(index, "Local load error");
            }
        }
    }
    handleLoadError(failedIndex, reason) {
        print(`Handling load error for track ${failedIndex}: ${reason}`);
        this.stopTrack(); // Reset to a safe state
        if (this.artistNameText)
            this.artistNameText.text = "Error";
        if (this.trackTitleText)
            this.trackTitleText.text = "Load Failed";
        if (this.timecodeText)
            this.timecodeText.text = "--:-- / --:--";
    }
    togglePlayPause() {
        // Debounce handled in setupCallbacks
        if (this.isLoadingRemote) {
            print("Play/Pause ignored: Loading remote.");
            return;
        }
        if (this.allTracksData.length === 0) {
            print("Play/Pause ignored: No tracks.");
            return;
        }
        print(`Toggle Play/Pause called - State: ${this.isPlaying ? 'Playing' : (this.isPaused ? 'Paused' : 'Stopped')}`);
        if (this.isPlaying) {
            this.pauseTrack();
        }
        else { // Not playing
            if (this.currentTrackIndex === -1) {
                print("Starting playback (loading track 0).");
                this.shouldAutoPlay = true;
                this.loadTrack(0);
            } // Play from stopped
            else if (this.isPaused && this.audioInitialized) {
                print("Resuming playback.");
                this.playTrack();
            } // Resume
            else if (!this.isPaused && this.audioInitialized) {
                print("Starting playback of loaded track.");
                this.playTrack();
            } // Play already loaded
            else if (!this.audioInitialized && this.currentTrackIndex !== -1) {
                print("Track selected but not initialized. Reloading with play intent.");
                this.shouldAutoPlay = true;
                this.loadTrack(this.currentTrackIndex);
            } // Reload failed/slow track
            else {
                print("Play ignored: Unexpected state.");
            }
        }
    }
    playTrack() {
        if (this.isLoadingRemote) {
            print("Play track ignored: Loading remote.");
            return;
        }
        if (!this.audioInitialized || !this.audioComponent || !this.audioComponent.audioTrack) {
            print("Cannot play: Not initialized.");
            return;
        }
        try {
            if (this.isPaused) {
                print("Resuming: " + this.allTracksData[this.currentTrackIndex].title);
                this.audioComponent.resume();
                this.isPlaying = true;
                this.isPaused = false;
                this.trackStartTime = getTime() - this.currentPlaybackTime;
            }
            else if (!this.isPlaying) {
                print("Starting: " + this.allTracksData[this.currentTrackIndex].title);
                this.currentPlaybackTime = 0;
                this.trackStartTime = getTime();
                this.audioComponent.play(1);
                this.isPlaying = true;
                this.isPaused = false;
            }
        }
        catch (e) {
            print("Error executing play/resume: " + e);
            this.handleLoadError(this.currentTrackIndex, "Playback error");
        }
    }
    pauseTrack() {
        if (!this.isPlaying || !this.audioComponent || !this.audioComponent.isPlaying()) {
            if (this.isPlaying) {
                this.isPlaying = false;
            }
            return;
        }
        try {
            print("Attempting to pause: " + this.allTracksData[this.currentTrackIndex].title);
            this.currentPlaybackTime = getTime() - this.trackStartTime;
            this.audioComponent.pause();
            this.isPlaying = false;
            this.isPaused = true;
            print("Paused at " + this.formatTime(this.currentPlaybackTime));
        }
        catch (e) {
            print("Error pausing: " + e);
            this.currentPlaybackTime = Math.max(0, getTime() - this.trackStartTime);
            this.isPlaying = false;
            this.isPaused = true;
        }
    }
    stopTrack() {
        print("Stop track called.");
        this.isManualStop = true;
        this.isLoadingRemote = false;
        this.pendingDelayedCalls = []; // Clear pending calls
        if (this.audioComponent) {
            if (this.audioComponent.isPlaying() || this.audioComponent.isPaused()) {
                try {
                    this.audioComponent.stop(true);
                }
                catch (e) { }
            }
            this.audioComponent.audioTrack = null;
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
        print("Stopped & reset.");
    }
    nextTrack() {
        // Debounce handled in setupCallbacks
        if (this.isLoadingRemote) {
            print("Next ignored: Loading.");
            return;
        }
        if (this.allTracksData.length === 0) {
            print("Next ignored: No tracks.");
            return;
        }
        print("Next track triggered.");
        let nextIndex = -1;
        if (this.isRepeatEnabled) {
            nextIndex = (this.currentTrackIndex === -1) ? 0 : this.currentTrackIndex;
        }
        else if (this.isShuffleEnabled) {
            if (this.allTracksData.length > 1) {
                do {
                    nextIndex = Math.floor(Math.random() * this.allTracksData.length);
                } while (nextIndex === this.currentTrackIndex);
            }
            else {
                nextIndex = 0;
            }
        }
        else {
            nextIndex = (this.currentTrackIndex === -1) ? 0 : this.currentTrackIndex + 1;
            if (nextIndex >= this.allTracksData.length) {
                if (this.loopPlayback) {
                    nextIndex = 0;
                }
                else {
                    print("End, no loop.");
                    this.stopTrack();
                    return;
                }
            }
        }
        if (nextIndex < 0 || nextIndex >= this.allTracksData.length) {
            print(`Next error: Invalid index (${nextIndex}).`);
            this.stopTrack();
            return;
        }
        // *** Set intent to play ***
        this.shouldAutoPlay = true;
        this.loadTrack(nextIndex);
    }
    prevTrack() {
        // Debounce handled in setupCallbacks
        if (this.isLoadingRemote) {
            print("Prev ignored: Loading.");
            return;
        }
        if (this.allTracksData.length === 0) {
            print("Prev ignored: No tracks.");
            return;
        }
        print("Prev track triggered");
        let prevIndex = -1;
        if (this.isRepeatEnabled) {
            prevIndex = (this.currentTrackIndex === -1) ? this.allTracksData.length - 1 : this.currentTrackIndex;
        }
        else if (this.isShuffleEnabled) {
            if (this.allTracksData.length > 1) {
                do {
                    prevIndex = Math.floor(Math.random() * this.allTracksData.length);
                } while (prevIndex === this.currentTrackIndex);
            }
            else {
                prevIndex = 0;
            }
        }
        else {
            prevIndex = (this.currentTrackIndex === -1) ? this.allTracksData.length - 1 : this.currentTrackIndex - 1;
            if (prevIndex < 0) {
                if (this.loopPlayback) {
                    prevIndex = this.allTracksData.length - 1;
                }
                else {
                    print("Start, no loop.");
                    this.stopTrack();
                    return;
                }
            }
        }
        if (prevIndex < 0 || prevIndex >= this.allTracksData.length) {
            print(`Prev error: Invalid index (${prevIndex}).`);
            this.stopTrack();
            return;
        }
        // *** Set intent to play ***
        this.shouldAutoPlay = true;
        this.loadTrack(prevIndex);
    }
    updateTrackInfo() {
        var _a, _b;
        let artist = "";
        let title = "Stopped";
        let timecode = "00:00 / 00:00";
        if (this.isLoadingRemote) {
            title = ((_a = this.allTracksData[this.currentTrackIndex]) === null || _a === void 0 ? void 0 : _a.title) || "Loading...";
            artist = ((_b = this.allTracksData[this.currentTrackIndex]) === null || _b === void 0 ? void 0 : _b.artist) || "";
            timecode = "Loading...";
        }
        else if (this.currentTrackIndex !== -1 && this.currentTrackIndex < this.allTracksData.length) {
            const d = this.allTracksData[this.currentTrackIndex];
            artist = d.artist;
            title = d.title;
        }
        else if (this.currentTrackIndex !== -1) {
            artist = "Error";
            title = "Invalid Track";
            timecode = "--:-- / --:--";
        }
        if (this.artistNameText)
            this.artistNameText.text = artist;
        if (this.trackTitleText)
            this.trackTitleText.text = title;
        if (this.timecodeText && (this.currentTrackIndex === -1 || this.isLoadingRemote || title === "Invalid Track" || !this.audioInitialized || (!this.isPlaying && !this.isPaused))) {
            this.timecodeText.text = timecode;
        }
        if (this.currentTrackIndex === -1 || this.isLoadingRemote) {
            this.updateEarthPosition(0, 1);
        }
    }
    updatePlayer() {
        if (this.isLoadingRemote || this.currentTrackIndex === -1 || !this.audioInitialized || !this.audioComponent || !this.audioComponent.audioTrack) {
            this.updateEarthPosition(0, 1);
            return;
        }
        let currentTime = 0;
        let totalTime = 0;
        try {
            totalTime = this.audioComponent.duration || 0;
            if (this.isPlaying) {
                currentTime = getTime() - this.trackStartTime;
            }
            else {
                currentTime = this.currentPlaybackTime;
            }
            currentTime = Math.max(0, currentTime);
            if (totalTime > 0) {
                currentTime = Math.min(currentTime, totalTime);
            }
            else {
                totalTime = 0;
            }
            if (this.timecodeText) {
                this.timecodeText.text = `${this.formatTime(currentTime)} / ${this.formatTime(totalTime)}`;
            }
            this.updateEarthPosition(currentTime, totalTime);
        }
        catch (e) {
            print("Error updating player: " + e);
            if (this.timecodeText) {
                this.timecodeText.text = "--:-- / --:--";
            }
            this.updateEarthPosition(0, 1);
        }
    }
    updateEarthPosition(currentTime, totalTime) {
        if (this.earthSphere && this.progressBar) {
            let p = (totalTime > 0) ? (currentTime / totalTime) : 0;
            p = Math.max(0, Math.min(1, p));
            try {
                const bt = this.progressBar.getTransform();
                const bs = bt.getWorldScale();
                const bp = bt.getWorldPosition();
                const br = bt.getWorldRotation();
                const et = this.earthSphere.getTransform();
                const hl = bs.x / 2;
                const xa = br.multiplyVec3(vec3.right());
                const sp = bp.sub(xa.uniformScale(hl));
                const ep = bp.add(xa.uniformScale(hl));
                const tp = sp.add(ep.sub(sp).uniformScale(p));
                const xo = xa.uniformScale(this.earthSphereXOffset);
                const fp = tp.add(xo);
                et.setWorldPosition(fp);
            }
            catch (e) { }
        }
    }
    formatTime(timeInSeconds) {
        if (isNaN(timeInSeconds) || timeInSeconds < 0)
            return "00:00";
        const ts = Math.floor(timeInSeconds);
        const m = Math.floor(ts / 60);
        const s = ts % 60;
        return m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0');
    }
    setupProgressBar() { if (this.progressBar && this.earthSphere) {
        this.updateEarthPosition(0, 1);
    } }
    updateSphereRotation() { if (this.earthSphere) {
        const dt = getDeltaTime();
        const et = this.earthSphere.getTransform();
        const cr = et.getLocalRotation();
        const rd = quat.fromEulerAngles(0, this.rotationSpeed * dt * (Math.PI / 180), 0);
        const nr = cr.multiply(rd);
        et.setLocalRotation(nr);
    } }
    getCurrentTrackIndex() { return this.currentTrackIndex; }
    getTrackPrefab(index) { return (index >= 0 && index < this.allTracksData.length) ? this.allTracksData[index].prefab : null; }
    onDestroy() {
        print("Destroying MusicPlayerManager.");
        this.pendingDelayedCalls = [];
        if (this.audioComponent && (this.isPlaying || this.isPaused)) {
            try {
                this.audioComponent.stop(false);
            }
            catch (e) { }
        }
        if (this.playPauseButton && this.onPlayPauseCallback)
            this.playPauseButton.onButtonPinched.remove(this.onPlayPauseCallback);
        if (this.nextTrackButton && this.onNextTrackCallback)
            this.nextTrackButton.onButtonPinched.remove(this.onNextTrackCallback);
        if (this.prevTrackButton && this.onPrevTrackCallback)
            this.prevTrackButton.onButtonPinched.remove(this.onPrevTrackCallback);
        if (this.repeatButton && this.onRepeatCallback)
            this.repeatButton.onButtonPinched.remove(this.onRepeatCallback);
        if (this.shuffleButton && this.onShuffleCallback)
            this.shuffleButton.onButtonPinched.remove(this.onShuffleCallback);
        if (this.stopButton && this.onStopCallback)
            this.stopButton.onButtonPinched.remove(this.onStopCallback);
        if (this.audioComponent) {
            try {
                this.audioComponent.setOnFinish(null);
            }
            catch (e) { }
        }
        this.disableAllPrefabs();
    }
    __initialize() {
        super.__initialize();
        this.allTracksData = [];
        this.currentTrackIndex = -1;
        this.isPlaying = false;
        this.isPaused = false;
        this.isRepeatEnabled = false;
        this.isShuffleEnabled = false;
        this.shouldAutoPlay = false;
        this.isLoadingRemote = false;
        this.isManualStop = false;
        this.trackStartTime = 0;
        this.currentPlaybackTime = 0;
        this.audioInitialized = false;
        this.currentActivePrefab = null;
        this.lastPinchTimePlayPause = 0;
        this.lastPinchTimeNext = 0;
        this.lastPinchTimePrev = 0;
        this.DEBOUNCE_TIME = 0.3;
        this.pendingDelayedCalls = [];
    }
};
exports.MusicPlayerManager = MusicPlayerManager;
exports.MusicPlayerManager = MusicPlayerManager = __decorate([
    component
], MusicPlayerManager);
//# sourceMappingURL=MusicPlayerManager.js.map