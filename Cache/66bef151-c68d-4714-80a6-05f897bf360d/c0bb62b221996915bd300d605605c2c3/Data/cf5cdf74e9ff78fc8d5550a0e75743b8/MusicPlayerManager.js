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
        this.createEvent("UpdateEvent").bind(() => {
            this.updatePlayer();
            this.updateSphereRotation();
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
        // (Assuming validation logic from previous version is sufficient)
        let isValid = true;
        if (!this.audioComponent) {
            print("Error: Audio component not defined.");
            isValid = false;
        }
        // ... other checks ...
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
            // Check conditions where auto-advance should NOT happen
            if (audioComponent !== this.audioComponent || this.isLoadingRemote || this.isManualStop || this.isPaused) {
                // print(`Track finished callback ignored: comp=${audioComponent === this.audioComponent}, loading=${this.isLoadingRemote}, manualStop=${this.isManualStop}, paused=${this.isPaused}`);
                if (this.isManualStop)
                    this.isManualStop = false; // Reset flag if it blocked here
                return;
            }
            print("Track finished event detected, handling auto-advance.");
            this.handleTrackFinished(); // Proceed with auto-advance logic
        };
        if (this.audioComponent) {
            this.audioComponent.setOnFinish(this.onTrackFinishedCallback);
        }
    }
    // --- Auto-Advance Logic ---
    handleTrackFinished() {
        print("Handle Track Finished - Determining next action.");
        if (this.currentTrackIndex === -1 || this.allTracksData.length === 0) {
            print("Track finished but no valid track context. Stopping.");
            this.stopTrack();
            return;
        }
        // *** Always set the intent to play the *next* track when auto-advancing ***
        this.shouldAutoPlay = true;
        // Calculate next index based on mode
        let nextIndex = -1;
        if (this.isRepeatEnabled) {
            print("Repeat enabled: Reloading current track.");
            nextIndex = this.currentTrackIndex;
        }
        else if (this.isShuffleEnabled) {
            print("Shuffle enabled: Loading random track.");
            if (this.allTracksData.length > 1) {
                do {
                    nextIndex = Math.floor(Math.random() * this.allTracksData.length);
                } while (nextIndex === this.currentTrackIndex);
            }
            else {
                nextIndex = 0;
            }
        }
        else { // Sequential
            nextIndex = this.currentTrackIndex + 1;
            if (nextIndex >= this.allTracksData.length) { // Reached end
                if (this.loopPlayback) {
                    print("End of playlist reached, looping back to start.");
                    nextIndex = 0;
                }
                else {
                    print("End of playlist reached, no loop. Stopping.");
                    this.shouldAutoPlay = false; // Override intent, we are stopping.
                    this.stopTrack();
                    return; // Exit early, don't load track -1
                }
            }
            else {
                print("Playing next track in sequence.");
            }
        }
        // Validate and load
        if (nextIndex >= 0 && nextIndex < this.allTracksData.length) {
            this.loadTrack(nextIndex); // loadTrack will use shouldAutoPlay flag
        }
        else {
            print(`Error in handleTrackFinished: Invalid next index calculated (${nextIndex}). Stopping.`);
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
    // --- Track Loading (Uses shouldAutoPlay flag) ---
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
        // *** Capture the caller's intent ***
        const playAfterLoad = this.shouldAutoPlay;
        // *** Consume the flag for this load operation ***
        this.shouldAutoPlay = false;
        this.audioInitialized = false;
        this.isManualStop = false; // Reset flag on any new load
        // Stop current playback cleanly
        if (this.isPlaying || this.isPaused) {
            if (this.audioComponent.isPlaying() || this.audioComponent.isPaused()) {
                try {
                    this.audioComponent.stop(false);
                }
                catch (e) {
                    print("Error stopping previous track: " + e);
                }
            }
        }
        this.isPlaying = false;
        this.isPaused = false;
        this.currentPlaybackTime = 0;
        // Clear the track AFTER stopping, before loading new one
        this.audioComponent.audioTrack = null;
        // Set the new index and update UI
        this.currentTrackIndex = index;
        const trackData = this.allTracksData[this.currentTrackIndex];
        this.updateTrackInfo(); // Shows "Loading..." if remote
        this.updateActivePrefab();
        print(`Loading track ${index}: ${trackData.title} (${trackData.isRemote ? 'Remote' : 'Local'}) - Intent to play: ${playAfterLoad}`);
        if (trackData.isRemote) {
            this.isLoadingRemote = true;
            const remoteAsset = trackData.asset;
            if (this.timecodeText)
                this.timecodeText.text = "Loading...";
            const onDownloadedCallback = (downloadedAsset) => {
                // Relevance Check: Is this still the track we want?
                if (this.currentTrackIndex !== index || !this.isLoadingRemote) {
                    print(`Remote download finished for ${index}, but target changed or loading cancelled.`);
                    // We might already be loading something else, don't interfere further.
                    // Only reset the flag if *this* was the active loading task.
                    if (this.isLoadingRemote && this.currentTrackIndex !== index) {
                        // This scenario is less likely if loadTrack blocks correctly, but as safety:
                        print("Warning: isLoadingRemote was true but index mismatch after download.");
                    }
                    // If this specific load was cancelled (isLoadingRemote=false), do nothing.
                    return;
                }
                this.isLoadingRemote = false; // Mark loading complete *for this track*
                if (downloadedAsset && downloadedAsset.isOfType("Asset.AudioTrackAsset")) {
                    const audioTrack = downloadedAsset;
                    print(`Remote track ${trackData.title} downloaded.`);
                    this.audioComponent.audioTrack = audioTrack;
                    this.setupTrackFinishedCallback(); // Re-attach
                    this.audioInitialized = true;
                    // Reset times for the newly loaded track
                    this.trackStartTime = getTime();
                    this.currentPlaybackTime = 0;
                    if (playAfterLoad) { // *** Use the captured intent ***
                        print("Auto-playing downloaded track.");
                        this.playTrack(); // Play immediately
                    }
                    else {
                        print("Download complete, track ready (no auto-play intent).");
                        this.updatePlayer(); // Update UI (e.g., show 00:00 / duration)
                    }
                }
                else {
                    print(`Error: Downloaded asset for remote track ${index} is not an AudioTrackAsset.`);
                    this.handleLoadError(index, "Invalid asset type downloaded");
                }
            };
            const onFailedCallback = () => {
                // Relevance Check
                if (this.currentTrackIndex !== index || !this.isLoadingRemote) {
                    print(`Remote download FAILED for ${index}, but target changed or loading cancelled.`);
                    // Reset flag only if this was the active load
                    // if (this.isLoadingRemote && this.currentTrackIndex !== index) {} // Less likely
                    return;
                }
                this.isLoadingRemote = false;
                print(`Error: Failed to download remote track ${trackData.title}.`);
                this.handleLoadError(index, "Download failed");
            };
            remoteAsset.downloadAsset(onDownloadedCallback, onFailedCallback);
        }
        else {
            // Local Asset
            try {
                const localAsset = trackData.asset;
                this.audioComponent.audioTrack = localAsset;
                this.setupTrackFinishedCallback(); // Re-attach
                this.audioInitialized = true;
                // Reset times for the newly loaded track
                this.trackStartTime = getTime();
                this.currentPlaybackTime = 0;
                print(`Local track ${trackData.title} loaded.`);
                if (playAfterLoad) { // *** Use the captured intent ***
                    print("Auto-playing local track.");
                    this.playTrack(); // Play immediately
                }
                else {
                    print("Local track loaded, ready (no auto-play intent).");
                    this.updatePlayer(); // Update UI
                }
            }
            catch (e) {
                print("Error loading local asset: " + e);
                this.handleLoadError(index, "Local asset load error");
            }
        }
    }
    // *** Removed the faulty delayedCall method ***
    handleLoadError(failedIndex, reason) {
        print(`Handling load error for track ${failedIndex}: ${reason}`);
        this.stopTrack(); // Reset to a safe state
        // Update UI to show error
        if (this.artistNameText)
            this.artistNameText.text = "Error";
        if (this.trackTitleText)
            this.trackTitleText.text = "Load Failed";
        if (this.timecodeText)
            this.timecodeText.text = "--:-- / --:--";
    }
    // --- Playback Controls ---
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
        print(`Toggle Play/Pause called - State: ${this.isPlaying ? 'Playing' : (this.isPaused ? 'Paused' : 'Stopped')}, Index: ${this.currentTrackIndex}, Initialized: ${this.audioInitialized}`);
        if (this.isPlaying) {
            this.pauseTrack();
        }
        else { // Not currently playing (paused or stopped)
            if (this.currentTrackIndex === -1) {
                // Stopped: Load and play the first track
                print("Starting playback from stopped state (loading track 0).");
                // *** Set intent to play ***
                this.shouldAutoPlay = true;
                this.loadTrack(0); // Will play automatically after load
            }
            else if (this.isPaused && this.audioInitialized) {
                // Paused: Resume playback
                print("Resuming playback.");
                this.playTrack(); // playTrack handles resuming
            }
            else if (!this.isPaused && this.audioInitialized) {
                // Stopped but a track is loaded/initialized: Play it
                print("Starting playback of already loaded track.");
                this.playTrack(); // playTrack handles starting
            }
            else if (!this.audioInitialized && this.currentTrackIndex !== -1) {
                // Track selected but not ready (e.g., remote failed/slow?): Try reloading with intent
                print("Track selected but not initialized. Attempting reload with play intent.");
                this.shouldAutoPlay = true;
                this.loadTrack(this.currentTrackIndex);
            }
            else {
                // Should ideally not happen
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
            print("Cannot play track - Audio not initialized or track not set.");
            // Do not try reloading here, loadTrack should handle initialization failures.
            return;
        }
        try {
            if (this.isPaused) {
                // Resume from paused state
                print("Resuming track: " + this.allTracksData[this.currentTrackIndex].title);
                this.audioComponent.resume();
                this.isPlaying = true;
                this.isPaused = false;
                // Adjust start time based on paused time
                this.trackStartTime = getTime() - this.currentPlaybackTime;
            }
            else if (!this.isPlaying) {
                // Start playback from the beginning (or wherever loadTrack left off, should be 0)
                print("Starting track: " + this.allTracksData[this.currentTrackIndex].title);
                // Ensure playback time is reset before playing
                this.currentPlaybackTime = 0;
                this.trackStartTime = getTime();
                this.audioComponent.play(1); // Play once (finish callback handles repeat/next)
                this.isPlaying = true;
                this.isPaused = false;
            }
            // If already playing, do nothing.
        }
        catch (e) {
            print("Error executing play/resume: " + e);
            this.handleLoadError(this.currentTrackIndex, "Playback error"); // Go to error state
        }
    }
    pauseTrack() {
        if (!this.isPlaying || !this.audioComponent || !this.audioComponent.isPlaying()) {
            // print("Pause called but not playing or component issue.");
            if (this.isPlaying) { /* Correct internal state if needed */
                this.isPlaying = false;
            }
            return;
        }
        try {
            print("Attempting to pause track: " + this.allTracksData[this.currentTrackIndex].title);
            // Capture time *before* pausing
            this.currentPlaybackTime = getTime() - this.trackStartTime;
            this.audioComponent.pause();
            // Update state *after* successful API call
            this.isPlaying = false;
            this.isPaused = true;
            print("Track paused successfully at " + this.formatTime(this.currentPlaybackTime));
        }
        catch (e) {
            print("Error pausing track: " + e);
            // Try to force state update even on error
            this.currentPlaybackTime = Math.max(0, getTime() - this.trackStartTime); // Capture time anyway
            this.isPlaying = false;
            this.isPaused = true;
        }
    }
    stopTrack() {
        print("Stop track called.");
        this.isManualStop = true; // Prevent auto-advance from finish callback
        this.isLoadingRemote = false; // Cancel loading interpretation
        if (this.audioComponent) {
            if (this.audioComponent.isPlaying() || this.audioComponent.isPaused()) {
                print("Stopping AudioComponent playback.");
                try {
                    this.audioComponent.stop(true);
                }
                catch (e) {
                    print("Error stopping audio: " + e);
                }
            }
            // Clear track AFTER stopping.
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
        // isManualStop flag will be reset on the next loadTrack call or consumed by setOnFinish if triggered.
    }
    // --- Next / Previous Track Actions ---
    nextTrack() {
        // Debounce handled in setupCallbacks
        if (this.isLoadingRemote) {
            print("Next track ignored: Loading remote.");
            return;
        }
        if (this.allTracksData.length === 0) {
            print("Next track ignored: No tracks.");
            return;
        }
        print("Next track triggered.");
        // Calculate next index
        let nextIndex = -1;
        if (this.isRepeatEnabled) {
            nextIndex = (this.currentTrackIndex === -1) ? 0 : this.currentTrackIndex;
        }
        else if (this.isShuffleEnabled) { /* Calculate shuffle */
            if (this.allTracksData.length > 1) {
                do {
                    nextIndex = Math.floor(Math.random() * this.allTracksData.length);
                } while (nextIndex === this.currentTrackIndex);
            }
            else {
                nextIndex = 0;
            }
        }
        else { /* Calculate sequential */
            nextIndex = (this.currentTrackIndex === -1) ? 0 : this.currentTrackIndex + 1;
            if (nextIndex >= this.allTracksData.length) {
                if (this.loopPlayback) {
                    nextIndex = 0;
                }
                else {
                    print("Reached end, no loop. Stopping.");
                    this.stopTrack();
                    return;
                }
            }
        }
        // Validate
        if (nextIndex < 0 || nextIndex >= this.allTracksData.length) {
            print(`Next track error: Invalid index (${nextIndex}).`);
            this.stopTrack();
            return;
        }
        // *** Set intent to play the next track ***
        this.shouldAutoPlay = true;
        this.loadTrack(nextIndex);
    }
    prevTrack() {
        // Debounce handled in setupCallbacks
        if (this.isLoadingRemote) {
            print("Previous track ignored: Loading remote.");
            return;
        }
        if (this.allTracksData.length === 0) {
            print("Previous track ignored: No tracks.");
            return;
        }
        print("Previous track triggered");
        // Calculate previous index
        let prevIndex = -1;
        if (this.isRepeatEnabled) {
            prevIndex = (this.currentTrackIndex === -1) ? this.allTracksData.length - 1 : this.currentTrackIndex;
        }
        else if (this.isShuffleEnabled) { /* Calculate shuffle */
            if (this.allTracksData.length > 1) {
                do {
                    prevIndex = Math.floor(Math.random() * this.allTracksData.length);
                } while (prevIndex === this.currentTrackIndex);
            }
            else {
                prevIndex = 0;
            }
        }
        else { /* Calculate sequential */
            prevIndex = (this.currentTrackIndex === -1) ? this.allTracksData.length - 1 : this.currentTrackIndex - 1;
            if (prevIndex < 0) {
                if (this.loopPlayback) {
                    prevIndex = this.allTracksData.length - 1;
                }
                else {
                    print("Reached start, no loop. Stopping.");
                    this.stopTrack();
                    return;
                }
            }
        }
        // Validate
        if (prevIndex < 0 || prevIndex >= this.allTracksData.length) {
            print(`Previous track error: Invalid index (${prevIndex}).`);
            this.stopTrack();
            return;
        }
        // *** Set intent to play the previous track ***
        this.shouldAutoPlay = true;
        this.loadTrack(prevIndex);
    }
    // --- UI Updates ---
    updateTrackInfo() {
        var _a, _b;
        // (Logic is generally okay, ensures "Loading..." or "Stopped" states are shown)
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
            title = d.title; /* Timecode handled by updatePlayer */
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
        // Only set timecode here for non-playing states
        if (this.timecodeText && (this.currentTrackIndex === -1 || this.isLoadingRemote || title === "Invalid Track" || !this.audioInitialized || (!this.isPlaying && !this.isPaused))) {
            this.timecodeText.text = timecode;
        }
        // Reset progress for these states too
        if (this.currentTrackIndex === -1 || this.isLoadingRemote) {
            this.updateEarthPosition(0, 1);
        }
    }
    updatePlayer() {
        // Don't update if loading, stopped, or not ready
        if (this.isLoadingRemote || this.currentTrackIndex === -1 || !this.audioInitialized || !this.audioComponent || !this.audioComponent.audioTrack) {
            // Ensure UI reflects stopped/loading state if needed (handled by updateTrackInfo)
            this.updateEarthPosition(0, 1); // Ensure progress is reset
            return;
        }
        // Proceed with time calculation and UI update
        let currentTime = 0;
        let totalTime = 0;
        try {
            totalTime = this.audioComponent.duration || 0;
            if (this.isPlaying) {
                currentTime = getTime() - this.trackStartTime;
            }
            else {
                currentTime = this.currentPlaybackTime;
            } // Use captured time if paused
            // Clamp values
            currentTime = Math.max(0, currentTime);
            if (totalTime > 0) {
                currentTime = Math.min(currentTime, totalTime);
            }
            else {
                totalTime = 0;
            }
            // Update UI
            if (this.timecodeText) {
                this.timecodeText.text = `${this.formatTime(currentTime)} / ${this.formatTime(totalTime)}`;
            }
            this.updateEarthPosition(currentTime, totalTime);
        }
        catch (e) {
            print("Error updating player time/progress: " + e);
            if (this.timecodeText) {
                this.timecodeText.text = "--:-- / --:--";
            }
            this.updateEarthPosition(0, 1);
        }
    }
    updateEarthPosition(currentTime, totalTime) {
        // (Logic is okay)
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
        // (Logic is okay)
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
    onDestroy() { print("Destroying MusicPlayerManager."); /* ... same cleanup ... */ }
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
    }
};
exports.MusicPlayerManager = MusicPlayerManager;
exports.MusicPlayerManager = MusicPlayerManager = __decorate([
    component
], MusicPlayerManager);
//# sourceMappingURL=MusicPlayerManager.js.map