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
        if (!this.validateInputs() || !this.earthSphereInteraction) {
            print("Input validation failed (check AudioComponent, ProgressBar, EarthSphere, and EarthSphereInteraction).");
            this.enabled = false; // Disable component if validation fails
            return;
        }
        this.combineTrackData();
        if (this.allTracksData.length === 0) {
            print("No tracks provided.");
        }
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
        print(`Initialized with ${((_a = this.localTracks) === null || _a === void 0 ? void 0 : _a.length) || 0} local, ${((_b = this.remoteTracks) === null || _b === void 0 ? void 0 : _b.length) || 0} remote. Total: ${this.allTracksData.length}`);
    }
    validateInputs() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        let isValid = true;
        if (!this.audioComponent) {
            print("Error: Audio component not defined.");
            isValid = false;
        }
        if (!this.earthSphere) {
            print("Error: Earth Sphere SceneObject not defined.");
            isValid = false;
        }
        if (!this.progressBar) {
            print("Error: Progress Bar SceneObject not defined.");
            isValid = false;
        }
        if (!this.earthSphereInteraction) {
            print("Error: Earth Sphere Interaction (InteractableManipulation) component not defined.");
            isValid = false;
        }
        // Check Text components (optional but recommended)
        if (!this.artistNameText)
            print("Warning: Artist Name Text component not assigned.");
        if (!this.timecodeText)
            print("Warning: Timecode Text component not assigned.");
        if (!this.trackTitleText)
            print("Warning: Track Title Text component not assigned.");
        // Check Button components (optional but recommended)
        if (!this.playPauseButton)
            print("Warning: Play/Pause button not assigned.");
        if (!this.nextTrackButton)
            print("Warning: Next Track button not assigned.");
        if (!this.prevTrackButton)
            print("Warning: Prev Track button not assigned.");
        // ... Add checks for other optional buttons if needed
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
        // Assign button callbacks with debounce and scrub checks
        if (this.playPauseButton) {
            this.onPlayPauseCallback = (event) => { const ct = getTime(); if (ct - this.lastPinchTimePlayPause < this.DEBOUNCE_TIME || this.isScrubbing)
                return; this.lastPinchTimePlayPause = ct; this.togglePlayPause(); };
            this.playPauseButton.onButtonPinched.add(this.onPlayPauseCallback);
        }
        if (this.nextTrackButton) {
            this.onNextTrackCallback = (event) => { const ct = getTime(); if (ct - this.lastPinchTimeNext < this.DEBOUNCE_TIME || this.isScrubbing)
                return; this.lastPinchTimeNext = ct; this.nextTrack(); };
            this.nextTrackButton.onButtonPinched.add(this.onNextTrackCallback);
        }
        if (this.prevTrackButton) {
            this.onPrevTrackCallback = (event) => { const ct = getTime(); if (ct - this.lastPinchTimePrev < this.DEBOUNCE_TIME || this.isScrubbing)
                return; this.lastPinchTimePrev = ct; this.prevTrack(); };
            this.prevTrackButton.onButtonPinched.add(this.onPrevTrackCallback);
        }
        if (this.repeatButton) {
            this.onRepeatCallback = (event) => {
                const ct = getTime();
                if (ct - this.lastPinchTimeRepeat < this.DEBOUNCE_TIME || this.isScrubbing)
                    return;
                this.lastPinchTimeRepeat = ct;
                this.isRepeatEnabled = !this.isRepeatEnabled;
                print("Repeat " + (this.isRepeatEnabled ? "enabled" : "disabled"));
                if (this.isRepeatEnabled)
                    this.isShuffleEnabled = false;
                this.updateButtonVisuals(); // Optional: Update button appearance
            };
            this.repeatButton.onButtonPinched.add(this.onRepeatCallback);
        }
        if (this.shuffleButton) {
            this.onShuffleCallback = (event) => {
                const ct = getTime();
                if (ct - this.lastPinchTimeShuffle < this.DEBOUNCE_TIME || this.isScrubbing)
                    return;
                this.lastPinchTimeShuffle = ct;
                this.isShuffleEnabled = !this.isShuffleEnabled;
                print("Shuffle mode " + (this.isShuffleEnabled ? "enabled" : "disabled"));
                if (this.isShuffleEnabled)
                    this.isRepeatEnabled = false;
                this.updateButtonVisuals(); // Optional: Update button appearance
            };
            this.shuffleButton.onButtonPinched.add(this.onShuffleCallback);
        }
        if (this.stopButton) {
            this.onStopCallback = (event) => {
                const ct = getTime();
                if (ct - this.lastPinchTimeStop < this.DEBOUNCE_TIME)
                    return;
                this.lastPinchTimeStop = ct;
                this.stopTrack();
            };
            this.stopButton.onButtonPinched.add(this.onStopCallback);
        }
        this.setupTrackFinishedCallback();
    }
    // Added: Setup Interaction Callbacks
    setupInteractionCallbacks() {
        this.onScrubStartCallback = this.onScrubStart.bind(this);
        this.onScrubUpdateCallback = this.onScrubUpdate.bind(this);
        this.onScrubEndCallback = this.onScrubEnd.bind(this);
        if (this.earthSphereInteraction) {
            this.earthSphereInteraction.onManipulationStart.add(this.onScrubStartCallback);
            this.earthSphereInteraction.onManipulationUpdate.add(this.onScrubUpdateCallback);
            this.earthSphereInteraction.onManipulationEnd.add(this.onScrubEndCallback);
        }
        else {
            print("Error: Earth Sphere Interaction component not found during callback setup.");
        }
    }
    // --- MODIFIED: Added isPerformingScrubRestart check ---
    setupTrackFinishedCallback() {
        this.onTrackFinishedCallback = (audioComponent) => {
            // **** CHECK THE NEW FLAG ****
            if (this.isPerformingScrubRestart) {
                print("Track finished event ignored: Performing scrub restart.");
                this.isPerformingScrubRestart = false; // Reset flag after catching the event
                return;
            }
            // Original checks
            if (audioComponent !== this.audioComponent || !this.isPlaying || this.isLoadingRemote || this.isManualStop || this.isPaused || this.isScrubbing) {
                if (this.isManualStop)
                    this.isManualStop = false;
                // print(`Track finished event ignored (ComponentMatch:${audioComponent === this.audioComponent}, IsPlaying:${this.isPlaying}, Loading:${this.isLoadingRemote}, ManualStop:${this.isManualStop}, Paused:${this.isPaused}, Scrubbing:${this.isScrubbing})`);
                return;
            }
            print("Track finished event detected, handling auto-advance.");
            this.handleTrackFinished();
        };
        if (this.audioComponent) {
            try {
                this.audioComponent.setOnFinish(this.onTrackFinishedCallback);
            }
            catch (e) {
                print("Error setting onFinish callback: " + e);
            }
        }
    }
    handleTrackFinished() {
        // print("Handle Track Finished - Determining next action."); // Less verbose
        if (this.currentTrackIndex === -1 || this.allTracksData.length === 0 || this.isScrubbing) {
            this.stopTrack();
            return;
        }
        this.shouldAutoPlay = true;
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
    disableAllPrefabs() {
        this.allTracksData.forEach(track => { if (track.prefab)
            track.prefab.enabled = false; });
        if (this.stoppedPrefab)
            this.stoppedPrefab.enabled = false;
    }
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
    checkDelayedCalls() {
        if (this.pendingDelayedCalls.length === 0) {
            return;
        }
        const currentTime = getTime();
        for (let i = this.pendingDelayedCalls.length - 1; i >= 0; i--) {
            const call = this.pendingDelayedCalls[i];
            if (currentTime >= call.executeTime) {
                this.pendingDelayedCalls.splice(i, 1);
                try {
                    call.callback();
                }
                catch (e) {
                    print("Error executing delayed call callback: " + e);
                }
            }
        }
    }
    // --- Scrub Start Handler ---
    onScrubStart(event) {
        var _a;
        // Check basic readiness BEFORE checking duration
        if (this.currentTrackIndex < 0 || !this.audioInitialized || this.isLoadingRemote || !((_a = this.audioComponent) === null || _a === void 0 ? void 0 : _a.audioTrack)) {
            print(`Scrub start ignored: Player not ready (Index:${this.currentTrackIndex}, Init:${this.audioInitialized}, Loading:${this.isLoadingRemote}).`);
            return;
        }
        // NOW check duration AFTER confirming audioTrack exists
        if ((this.audioComponent.duration || 0) <= 0) {
            print("Scrub start ignored: Track duration is zero or invalid.");
            return;
        }
        // If we pass checks, proceed with scrubbing
        print("Scrub Start");
        this.isScrubbing = true;
        this.wasPlayingBeforeScrub = this.isPlaying;
    }
    // --- Scrub Update Handler ---
    onScrubUpdate(event) {
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
        }
        catch (e) {
            print("Error during scrub update: " + e);
            this.isScrubbing = false;
        }
    }
    // --- REVISED: Scrub End Handler (Uses flag to prevent skip) ---
    onScrubEnd(event) {
        if (!this.isScrubbing) {
            return; // Ignore if not scrubbing
        }
        print("Scrub End");
        this.isScrubbing = false; // Set immediately
        // Make sure we are still in a valid state
        if (this.currentTrackIndex < 0 || !this.audioInitialized || this.isLoadingRemote || !this.audioComponent || !this.audioComponent.audioTrack) {
            print("Scrub end ignored: Player not ready for action.");
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
                    // Check if still valid to pause
                    if (this.currentTrackIndex !== -1 && this.isPlaying && !this.isScrubbing && !this.isPerformingScrubRestart) { // Check flags again
                        this.pauseTrack();
                    }
                    else {
                        print("Skipped post-scrub pause (state changed).");
                        this.updatePlayer();
                    }
                    // **** Reset flag AFTER potential pause attempt ****
                    this.delayedCall(0.02, () => {
                        print("Resetting isPerformingScrubRestart flag (paused case)");
                        this.isPerformingScrubRestart = false;
                    });
                });
            }
            else {
                this.updatePlayer(); // Update UI immediately if it was playing
                // **** Reset flag AFTER play has started ****
                this.delayedCall(0.05, () => {
                    print("Resetting isPerformingScrubRestart flag (playing case)");
                    this.isPerformingScrubRestart = false;
                });
            }
        }
        catch (e) {
            print(`Error during scrub end (stop/play): ${e}`);
            // **** Reset flag on error ****
            this.isPerformingScrubRestart = false;
            print("Resetting isPerformingScrubRestart flag due to error.");
            // Attempt to recover gracefully
            this.stopTrack(); // Stop fully on error
        }
        // Note: No 'finally' block needed specifically for the flag if handled in try/catch/delay
        // Force UI update to show correct time (should be near 00:00 after restart)
        this.updatePlayer();
    }
    // --- Helper to get Progress Bar Bounds ---
    getProgressBarBounds() {
        if (!this.progressBar)
            return null;
        try {
            const barTransform = this.progressBar.getTransform();
            const barScale = barTransform.getWorldScale();
            const barPosition = barTransform.getWorldPosition();
            const barRotation = barTransform.getWorldRotation();
            const progressDirection = barRotation.multiplyVec3(vec3.right()); // Assumes bar stretches along local X
            // Check for zero scale to prevent issues
            if (Math.abs(barScale.x) < 0.0001) {
                print("Warning: Progress bar has near-zero scale on X-axis.");
                return null; // Avoid division by zero / meaningless calculations
            }
            const halfLength = barScale.x / 2.0;
            const startPoint = barPosition.sub(progressDirection.uniformScale(halfLength));
            const endPoint = barPosition.add(progressDirection.uniformScale(halfLength));
            // Check if start and end points are practically the same
            if (startPoint.distance(endPoint) < 0.0001) {
                print("Warning: Progress bar start and end points are too close.");
                return null;
            }
            const axis = endPoint.sub(startPoint).normalize();
            const length = startPoint.distance(endPoint);
            return { startPoint, endPoint, axisVector: axis, length };
        }
        catch (e) {
            print("Error calculating progress bar bounds: " + e);
            return null;
        }
    }
    // MODIFIED: loadTrack uses stop(false) and cancels scrub
    loadTrack(index) {
        var _a;
        if (this.isScrubbing) {
            print("Cancelling scrub due to loadTrack call.");
            this.isScrubbing = false;
            this.isPerformingScrubRestart = false; // Ensure flag is reset if scrub is cancelled here
        }
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
                // print("Stopping previous track (immediate)..."); // Less verbose
                try {
                    // Set flag before stopping if loading a new track MIGHT trigger finish
                    this.isPerformingScrubRestart = true; // Use the same flag temporarily
                    this.audioComponent.stop(false);
                    // Reset flag quickly after stop when just loading
                    this.delayedCall(0.02, () => { this.isPerformingScrubRestart = false; });
                }
                catch (e) {
                    print("Error stopping previous track: " + e);
                    this.isPerformingScrubRestart = false; // Reset on error too
                }
            }
        }
        this.isPlaying = false;
        this.isPaused = false;
        this.currentPlaybackTime = 0;
        if (this.audioComponent) {
            try {
                this.audioComponent.audioTrack = null;
            }
            catch (e) {
                print("Error clearing audioTrack: " + e);
            }
        }
        // --- End Stop Sequence ---
        this.currentTrackIndex = index;
        const trackData = (_a = this.allTracksData) === null || _a === void 0 ? void 0 : _a[this.currentTrackIndex];
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
            const remoteAsset = trackData.asset;
            if (this.timecodeText)
                this.timecodeText.text = "Loading...";
            const onDownloadedCallback = (downloadedAsset) => {
                if (this.currentTrackIndex !== index || !this.isLoadingRemote) {
                    print(`Download callback for index ${index} ignored, current index is ${this.currentTrackIndex}, loading: ${this.isLoadingRemote}`);
                    this.isLoadingRemote = (this.currentTrackIndex === index && this.isLoadingRemote);
                    return;
                }
                this.isLoadingRemote = false;
                if (downloadedAsset && downloadedAsset.isOfType("Asset.AudioTrackAsset")) {
                    const audioTrack = downloadedAsset;
                    print(`Remote track ${trackData.title} downloaded.`);
                    if (!this.audioComponent) {
                        print("Error: AudioComponent missing after download.");
                        this.handleLoadError(index, "AudioComponent missing");
                        return;
                    }
                    try {
                        this.audioComponent.audioTrack = audioTrack;
                        this.setupTrackFinishedCallback(); // Re-setup after setting new track
                        this.audioInitialized = true;
                        this.trackStartTime = getTime();
                        this.currentPlaybackTime = 0;
                        if (playAfterLoad) {
                            print("Auto-playing downloaded remote track.");
                            this.delayedCall(0.05, () => this.playTrack());
                        }
                        else {
                            this.updatePlayer();
                        }
                    }
                    catch (e) {
                        print("Error setting downloaded audio track: " + e);
                        this.handleLoadError(index, "Error setting track");
                    }
                }
                else {
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
            }
            catch (e) {
                print("Error calling downloadAsset: " + e);
                this.isLoadingRemote = false;
                this.handleLoadError(index, "Error initiating download");
            }
        }
        else { // Local Asset
            if (!this.audioComponent) {
                print("Error: AudioComponent missing for local load.");
                this.handleLoadError(index, "AudioComponent missing");
                return;
            }
            try {
                const localAsset = trackData.asset;
                this.audioComponent.audioTrack = localAsset;
                this.setupTrackFinishedCallback(); // Re-setup after setting new track
                this.audioInitialized = true;
                this.trackStartTime = getTime();
                this.currentPlaybackTime = 0;
                print(`Local track ${trackData.title} loaded.`);
                if (playAfterLoad) {
                    print("Auto-playing local track.");
                    this.delayedCall(0.05, () => this.playTrack());
                }
                else {
                    this.updatePlayer();
                }
            }
            catch (e) {
                print("Error loading local audio track: " + e);
                this.handleLoadError(index, "Local load error");
            }
        }
    }
    handleLoadError(failedIndex, reason) {
        print(`Handling load error for track ${failedIndex}: ${reason}`);
        if (this.currentTrackIndex === failedIndex) {
            this.isScrubbing = false; // Ensure scrubbing stops on error
            this.isPerformingScrubRestart = false; // Reset flag on error
            this.stopTrack(); // Reset to a safe state
            if (this.artistNameText)
                this.artistNameText.text = "Error";
            if (this.trackTitleText)
                this.trackTitleText.text = "Load Failed";
            if (this.timecodeText)
                this.timecodeText.text = "--:-- / --:--";
            this.updateActivePrefab();
        }
        else {
            print(`Load error for index ${failedIndex} occurred, but current index is ${this.currentTrackIndex}. Ignoring stop.`);
        }
    }
    togglePlayPause() {
        var _a, _b;
        if (this.isScrubbing) {
            print("Play/Pause ignored: Scrubbing.");
            return;
        }
        if (this.isLoadingRemote) {
            print("Play/Pause ignored: Loading remote.");
            return;
        }
        if (this.allTracksData.length === 0) {
            print("Play/Pause ignored: No tracks.");
            return;
        }
        // print(`Toggle Play/Pause called - State: IsPlaying=${this.isPlaying}, IsPaused=${this.isPaused}, AudioInit=${this.audioInitialized}, CurrentIndex=${this.currentTrackIndex}`); // Less verbose
        if (this.isPlaying) {
            this.pauseTrack();
        }
        else { // Not currently playing
            if (this.currentTrackIndex === -1) {
                print("Starting playback from stopped state (loading track 0).");
                this.shouldAutoPlay = true;
                this.loadTrack(0);
            }
            else if (this.isPaused && this.audioInitialized && ((_a = this.audioComponent) === null || _a === void 0 ? void 0 : _a.audioTrack)) {
                print("Resuming playback.");
                this.playTrack();
            }
            else if (!this.isPaused && this.audioInitialized && ((_b = this.audioComponent) === null || _b === void 0 ? void 0 : _b.audioTrack)) {
                print("Starting playback of already loaded track.");
                this.playTrack();
            }
            else if (!this.audioInitialized && this.currentTrackIndex !== -1) {
                print("Track selected but not initialized. Reloading with play intent.");
                this.shouldAutoPlay = true;
                this.loadTrack(this.currentTrackIndex);
            }
            else {
                print("Play/Pause ignored: Unexpected state or no track loaded.");
                if (this.currentTrackIndex !== -1 && !this.audioInitialized) {
                    print("Attempting to reload current track due to uninitialized state.");
                    this.shouldAutoPlay = true;
                    this.loadTrack(this.currentTrackIndex);
                }
            }
        }
        this.updateButtonVisuals(); // Optional
    }
    playTrack() {
        var _a, _b;
        if (this.isScrubbing) {
            print("Play track ignored: Scrubbing.");
            return;
        }
        if (this.isLoadingRemote) {
            print("Play track ignored: Loading remote.");
            return;
        }
        if (!this.audioInitialized || !this.audioComponent || !this.audioComponent.audioTrack) {
            print(`Cannot play: Not initialized (Init:${this.audioInitialized}, Comp:${!!this.audioComponent}, Track:${!!((_a = this.audioComponent) === null || _a === void 0 ? void 0 : _a.audioTrack)}).`);
            if (this.currentTrackIndex !== -1) {
                print("Attempting recovery: Reloading current track with play intent.");
                this.shouldAutoPlay = true;
                this.loadTrack(this.currentTrackIndex);
            }
            return;
        }
        try {
            const currentTitle = ((_b = this.allTracksData[this.currentTrackIndex]) === null || _b === void 0 ? void 0 : _b.title) || "Unknown Title";
            if (this.isPaused) {
                print(`Resuming: ${currentTitle}`);
                this.audioComponent.resume();
                this.isPlaying = true;
                this.isPaused = false;
                this.trackStartTime = getTime() - this.currentPlaybackTime;
            }
            else if (!this.isPlaying) {
                print(`Starting playback from beginning: ${currentTitle}`);
                this.currentPlaybackTime = 0;
                this.trackStartTime = getTime();
                this.audioComponent.play(1); // Play once
                this.isPlaying = true;
                this.isPaused = false;
            }
            else {
                // print(`Play track called while already playing ${currentTitle}. No action taken.`); // Less verbose
            }
            this.isManualStop = false;
        }
        catch (e) {
            print(`Error executing play/resume for track ${this.currentTrackIndex}: ${e}`);
            this.handleLoadError(this.currentTrackIndex, "Playback error");
        }
        this.updateButtonVisuals(); // Optional
    }
    pauseTrack() {
        var _a;
        if (this.isScrubbing) {
            print("Pause ignored: Scrubbing.");
            return;
        }
        if (!this.isPlaying || !this.audioInitialized || !this.audioComponent || !this.audioComponent.isPlaying()) {
            // print(`Pause ignored: Not in a valid playing state (...)`); // Less verbose
            if (this.isPlaying) {
                this.isPlaying = false;
                this.isPaused = true;
            } // Force state if needed
            return;
        }
        try {
            const currentTitle = ((_a = this.allTracksData[this.currentTrackIndex]) === null || _a === void 0 ? void 0 : _a.title) || "Unknown Title";
            // print(`Attempting to pause: ${currentTitle}`); // Less verbose
            this.currentPlaybackTime = Math.max(0, getTime() - this.trackStartTime);
            this.audioComponent.pause();
            this.isPlaying = false;
            this.isPaused = true;
            print(`Paused at ${this.formatTime(this.currentPlaybackTime)}`);
        }
        catch (e) {
            print("Error pausing track: " + e);
            this.currentPlaybackTime = Math.max(0, getTime() - this.trackStartTime);
            this.isPlaying = false;
            this.isPaused = true;
        }
        this.updateButtonVisuals(); // Optional
    }
    // MODIFIED: stopTrack uses stop(false) and cancels scrub/flags
    stopTrack() {
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
                // print("Stopping audio component (immediate)..."); // Less verbose
                try {
                    // No need to set the flag here, stop is final
                    this.audioComponent.stop(false);
                }
                catch (e) {
                    print("Error stopping audio component: " + e);
                }
            }
            try {
                this.audioComponent.audioTrack = null;
            }
            catch (e) {
                print("Error clearing audio track on stop: " + e);
            }
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
    nextTrack() {
        if (this.isScrubbing) {
            print("Next ignored: Scrubbing.");
            return;
        }
        if (this.isLoadingRemote) {
            print("Next ignored: Loading.");
            return;
        }
        if (this.allTracksData.length === 0) {
            print("Next ignored: No tracks.");
            return;
        }
        // print("Next track triggered."); // Less verbose
        let nextIndex = -1;
        const currentIndex = this.currentTrackIndex;
        if (this.isRepeatEnabled && currentIndex !== -1) {
            nextIndex = currentIndex;
        }
        else if (this.isShuffleEnabled) {
            if (this.allTracksData.length > 1) {
                do {
                    nextIndex = Math.floor(Math.random() * this.allTracksData.length);
                } while (nextIndex === currentIndex);
            }
            else {
                nextIndex = 0;
            }
        }
        else {
            nextIndex = (currentIndex === -1) ? 0 : currentIndex + 1;
            if (nextIndex >= this.allTracksData.length) {
                if (this.loopPlayback) {
                    nextIndex = 0;
                }
                else {
                    print("Reached end, no loop enabled. Stopping.");
                    this.stopTrack();
                    return;
                }
            }
        }
        if (nextIndex < 0 || nextIndex >= this.allTracksData.length) {
            print(`Next error: Invalid calculated index (${nextIndex}). Stopping.`);
            this.stopTrack();
            return;
        }
        this.shouldAutoPlay = true;
        this.loadTrack(nextIndex);
    }
    prevTrack() {
        if (this.isScrubbing) {
            print("Prev ignored: Scrubbing.");
            return;
        }
        if (this.isLoadingRemote) {
            print("Prev ignored: Loading.");
            return;
        }
        if (this.allTracksData.length === 0) {
            print("Prev ignored: No tracks.");
            return;
        }
        // print("Prev track triggered"); // Less verbose
        let prevIndex = -1;
        const currentIndex = this.currentTrackIndex;
        if (this.isRepeatEnabled && currentIndex !== -1) {
            prevIndex = currentIndex;
        }
        else if (this.isShuffleEnabled) {
            if (this.allTracksData.length > 1) {
                do {
                    prevIndex = Math.floor(Math.random() * this.allTracksData.length);
                } while (prevIndex === currentIndex);
            }
            else {
                prevIndex = 0;
            }
        }
        else {
            prevIndex = (currentIndex === -1) ? this.allTracksData.length - 1 : currentIndex - 1;
            if (prevIndex < 0) {
                if (this.loopPlayback) {
                    prevIndex = this.allTracksData.length - 1;
                }
                else {
                    print("Reached beginning, no loop enabled. Stopping.");
                    this.stopTrack();
                    return;
                }
            }
        }
        if (prevIndex < 0 || prevIndex >= this.allTracksData.length) {
            print(`Prev error: Invalid calculated index (${prevIndex}). Stopping.`);
            this.stopTrack();
            return;
        }
        this.shouldAutoPlay = true;
        this.loadTrack(prevIndex);
    }
    updateTrackInfo() {
        let artist = "";
        let title = "Stopped";
        let timecode = "00:00 / 00:00"; // Default timecode
        if (this.isLoadingRemote && this.currentTrackIndex !== -1 && this.currentTrackIndex < this.allTracksData.length) {
            const loadingData = this.allTracksData[this.currentTrackIndex];
            artist = (loadingData === null || loadingData === void 0 ? void 0 : loadingData.artist) || "";
            title = (loadingData === null || loadingData === void 0 ? void 0 : loadingData.title) || "Loading...";
            timecode = "Loading...";
        }
        else if (this.currentTrackIndex !== -1 && this.currentTrackIndex < this.allTracksData.length) {
            const currentData = this.allTracksData[this.currentTrackIndex];
            if (currentData) {
                artist = currentData.artist;
                title = currentData.title;
                // Timecode updated dynamically elsewhere
            }
            else {
                artist = "Error";
                title = "Invalid Track";
                timecode = "--:-- / --:--";
            }
        }
        else if (this.currentTrackIndex !== -1) { // Index out of bounds?
            artist = "Error";
            title = "Invalid Index";
            timecode = "--:-- / --:--";
        }
        // If stopped (index is -1), defaults are fine.
        if (this.artistNameText)
            this.artistNameText.text = artist;
        if (this.trackTitleText)
            this.trackTitleText.text = title;
        // Update timecode ONLY if not scrubbing AND in a non-dynamic state
        if (this.timecodeText && !this.isScrubbing && (this.isLoadingRemote || this.currentTrackIndex === -1 || timecode !== "00:00 / 00:00")) {
            this.timecodeText.text = timecode;
        }
        // Reset progress bar if stopped or loading (and not scrubbing)
        if (!this.isScrubbing && (this.currentTrackIndex === -1 || this.isLoadingRemote)) {
            this.updateEarthPosition(0, 1);
        }
        this.updateButtonVisuals(); // Optional
    }
    // MODIFIED: Prevent sphere updates during scrub
    updatePlayer() {
        if (this.isScrubbing) {
            return;
        } // Player time/position frozen during scrub
        if (this.isLoadingRemote || this.currentTrackIndex === -1 || !this.audioInitialized || !this.audioComponent || !this.audioComponent.audioTrack) {
            if (!this.isLoadingRemote && this.currentTrackIndex === -1) {
                this.updateEarthPosition(0, 1); // Reset position if stopped
                if (this.timecodeText && this.timecodeText.text !== "00:00 / 00:00")
                    this.timecodeText.text = "00:00 / 00:00";
            }
            return;
        }
        let currentTime = 0;
        let totalTime = 0;
        try {
            totalTime = this.audioComponent.duration || 0;
            if (this.isPlaying) {
                currentTime = getTime() - this.trackStartTime;
            }
            else if (this.isPaused) {
                currentTime = this.currentPlaybackTime;
            }
            else { // Just loaded or internally stopped
                currentTime = this.currentPlaybackTime; // Use stored time (should be 0 if just loaded/restarted)
            }
            // Clamp time values robustly
            currentTime = Math.max(0, currentTime);
            if (totalTime > 0.001) { // Use small threshold for valid duration
                currentTime = Math.min(currentTime, totalTime);
            }
            else {
                totalTime = 0;
                // If duration is invalid, keep currentTime potentially advancing but clamp display?
                // For now, display 0 / 0 if totalTime is invalid.
                if (totalTime <= 0)
                    currentTime = 0;
            }
            // Update UI Text
            if (this.timecodeText) {
                this.timecodeText.text = `${this.formatTime(currentTime)} / ${this.formatTime(totalTime)}`;
            }
            // Update Progress Bar Visual
            this.updateEarthPosition(currentTime, totalTime);
        }
        catch (e) {
            print("Error updating player state: " + e);
            if (this.timecodeText) {
                this.timecodeText.text = "--:-- / --:--";
            }
            this.updateEarthPosition(0, 1);
            // Consider handling persistent errors more gracefully
        }
    }
    // MODIFIED: Uses getProgressBarBounds and checks scrub state
    updateEarthPosition(currentTime, totalTime) {
        if (this.isScrubbing || !this.earthSphere || !this.progressBar)
            return;
        try {
            const bounds = this.getProgressBarBounds();
            if (!bounds || bounds.length <= 0.001)
                return; // Need valid bounds
            let progress = (totalTime > 0.001) ? (currentTime / totalTime) : 0;
            progress = Math.max(0, Math.min(1, progress));
            const targetPositionOnLine = bounds.startPoint.add(bounds.axisVector.uniformScale(progress * bounds.length));
            const barRotation = this.progressBar.getTransform().getWorldRotation();
            const progressDirection = barRotation.multiplyVec3(vec3.right());
            const offsetVector = progressDirection.uniformScale(this.earthSphereXOffset);
            const finalPosition = targetPositionOnLine.add(offsetVector);
            this.earthSphere.getTransform().setWorldPosition(finalPosition);
        }
        catch (e) {
            print("Error updating earth position: " + e);
        }
    }
    formatTime(timeInSeconds) {
        if (isNaN(timeInSeconds) || timeInSeconds < 0)
            return "00:00";
        const totalSeconds = Math.floor(timeInSeconds);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
    }
    setupProgressBar() {
        // Initialize position at the start only if essential components exist
        if (this.progressBar && this.earthSphere) {
            this.updateEarthPosition(0, 1);
        }
    }
    updateSphereRotation() {
        if (this.isScrubbing || !this.earthSphere)
            return; // Don't rotate while scrubbing
        try {
            const deltaTime = getDeltaTime();
            const earthTransform = this.earthSphere.getTransform();
            const currentRotation = earthTransform.getLocalRotation();
            const rotationDelta = quat.fromEulerAngles(0, this.rotationSpeed * deltaTime, 0); // Assuming rotationSpeed is in degrees/sec
            const newRotation = currentRotation.multiply(rotationDelta);
            earthTransform.setLocalRotation(newRotation);
        }
        catch (e) {
            print("Error updating sphere rotation: " + e);
        }
    }
    // Optional: Update button visuals (e.g., change color/texture) based on state
    updateButtonVisuals() {
        // Example placeholder - implement based on your button setup
        // You'll need references to button materials or child objects
    }
    // --- Public API (Optional) ---
    getCurrentTrackIndex() {
        return this.currentTrackIndex;
    }
    getTrackPrefab(index) {
        return (index >= 0 && index < this.allTracksData.length) ? this.allTracksData[index].prefab : null;
    }
    // --- Cleanup ---
    onDestroy() {
        print("Destroying MusicPlayerManager.");
        // Remove interaction listeners first
        if (this.earthSphereInteraction) {
            if (this.onScrubStartCallback)
                this.earthSphereInteraction.onManipulationStart.remove(this.onScrubStartCallback);
            if (this.onScrubUpdateCallback)
                this.earthSphereInteraction.onManipulationUpdate.remove(this.onScrubUpdateCallback);
            if (this.onScrubEndCallback)
                this.earthSphereInteraction.onManipulationEnd.remove(this.onScrubEndCallback);
        }
        this.pendingDelayedCalls = []; // Clear any pending actions
        // Attempt to stop audio cleanly
        if (this.audioComponent && (this.isPlaying || this.isPaused)) {
            try {
                print("Stopping audio component on destroy...");
                this.audioComponent.stop(false); // Immediate stop on destroy
                this.audioComponent.audioTrack = null; // Release asset reference
            }
            catch (e) {
                print("Error stopping audio on destroy: " + e);
            }
        }
        // Remove event listeners
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
        // Explicitly remove the onFinish callback
        if (this.audioComponent) {
            try {
                this.audioComponent.setOnFinish(null);
            }
            catch (e) {
                print("Error removing onFinish callback: " + e);
            }
        }
        this.disableAllPrefabs(); // Ensure prefabs are hidden
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
        this.lastPinchTimeRepeat = 0;
        this.lastPinchTimeShuffle = 0;
        this.lastPinchTimeStop = 0;
        this.DEBOUNCE_TIME = 0.5;
        this.pendingDelayedCalls = [];
        this.isScrubbing = false;
        this.wasPlayingBeforeScrub = false;
        this.scrubTargetTime = 0;
        this.isPerformingScrubRestart = false;
    }
}; // End of class MusicPlayerManager
exports.MusicPlayerManager = MusicPlayerManager;
exports.MusicPlayerManager = MusicPlayerManager = __decorate([
    component
], MusicPlayerManager);
//# sourceMappingURL=MusicPlayerManager.js.map