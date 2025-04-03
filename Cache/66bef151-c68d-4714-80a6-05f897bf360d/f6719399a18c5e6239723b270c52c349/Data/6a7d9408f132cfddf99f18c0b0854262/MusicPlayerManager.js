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
        // Validate inputs
        if (!this.tracks || this.tracks.some(track => track == null)) {
            print("Error: All tracks must be defined.");
            return;
        }
        if (!this.artists || !this.titles || this.tracks.length !== this.artists.length || this.tracks.length !== this.titles.length) {
            print("Error: The number of tracks, artists, and titles must match.");
            return;
        }
        if (this.tracks.length === 0) {
            print("Error: No audio tracks provided to MusicPlayerManager.");
            return;
        }
        if (!this.trackPrefabs || this.trackPrefabs.some(prefab => prefab == null)) {
            print("Error: All track prefabs must be defined.");
            return;
        }
        if (this.trackPrefabs.length !== this.tracks.length) {
            print("Error: The number of track prefabs must match the number of tracks.");
            return;
        }
        // Disable all prefabs at startup
        this.trackPrefabs.forEach(prefab => {
            if (prefab)
                prefab.enabled = false;
        });
        if (this.stoppedPrefab) {
            this.stoppedPrefab.enabled = false;
        }
        if (!this.audioComponent) {
            print("Error: Audio component not defined in MusicPlayerManager.");
            return;
        }
        if (!this.earthSphere || !this.progressBar) {
            print("Warning: Progress visualization objects are not defined in MusicPlayerManager.");
            return;
        }
        this.setupCallbacks();
        this.setupProgressBar();
        // Create an UpdateEvent for continuous player updates
        this.createEvent("UpdateEvent").bind(() => {
            this.updatePlayer();
            this.updateSphereRotation();
        });
        // Update the active prefab at startup (stopped state)
        this.updateActivePrefab();
        print("MusicPlayerManager initialized with " + this.tracks.length + " tracks, awaiting user input.");
    }
    setupCallbacks() {
        if (this.playPauseButton) {
            this.onPlayPauseCallback = (event) => this.togglePlayPause();
            this.playPauseButton.onButtonPinched.add(this.onPlayPauseCallback);
        }
        if (this.nextTrackButton) {
            this.onNextTrackCallback = (event) => this.nextTrack();
            this.nextTrackButton.onButtonPinched.add(this.onNextTrackCallback);
        }
        if (this.prevTrackButton) {
            this.onPrevTrackCallback = (event) => this.prevTrack();
            this.prevTrackButton.onButtonPinched.add(this.onPrevTrackCallback);
        }
        if (this.repeatButton) {
            this.onRepeatCallback = (event) => {
                this.isRepeatEnabled = !this.isRepeatEnabled;
                print("Repeat " + (this.isRepeatEnabled ? "enabled" : "disabled"));
            };
            this.repeatButton.onButtonPinched.add(this.onRepeatCallback);
        }
        if (this.shuffleButton) {
            this.onShuffleCallback = (event) => {
                this.isShuffleEnabled = !this.isShuffleEnabled;
                print("Shuffle mode " + (this.isShuffleEnabled ? "enabled" : "disabled"));
            };
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
            print("Track finished, handling next action");
            this.handleTrackFinished();
        };
        if (this.audioComponent) {
            this.audioComponent.setOnFinish(this.onTrackFinishedCallback);
        }
    }
    handleTrackFinished() {
        if (this.isManualStop) {
            print("Manual stop detected, skipping handleTrackFinished.");
            this.isManualStop = false;
            return;
        }
        if (this.currentTrackIndex === -1) {
            return;
        }
        if (this.isRepeatEnabled) {
            this.loadTrack(this.currentTrackIndex);
            this.playTrack();
        }
        else if (this.isShuffleEnabled) {
            const randomIndex = Math.floor(Math.random() * this.tracks.length);
            this.loadTrack(randomIndex);
            this.playTrack();
        }
        else if (this.currentTrackIndex < this.tracks.length - 1 || this.loopPlayback) {
            this.shouldAutoPlay = true;
            this.nextTrack();
        }
        else {
            this.stopTrack();
        }
    }
    setupProgressBar() {
        if (this.progressBar && this.earthSphere) {
            const barTransform = this.progressBar.getTransform();
            const barPosition = barTransform.getLocalPosition();
            const earthTransform = this.earthSphere.getTransform();
            earthTransform.setLocalPosition(new vec3(barPosition.x, barPosition.y, barPosition.z));
            this.updateEarthPosition(0, 1);
        }
    }
    updateSphereRotation() {
        if (this.earthSphere) {
            const deltaTime = getDeltaTime();
            const earthTransform = this.earthSphere.getTransform();
            const currentRotation = earthTransform.getLocalRotation();
            const rotationDelta = quat.fromEulerAngles(0, this.rotationSpeed * deltaTime * (Math.PI / 180), 0);
            const newRotation = currentRotation.multiply(rotationDelta);
            earthTransform.setLocalRotation(newRotation);
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
                print("Stopped prefab activated.");
            }
        }
        else {
            if (this.trackPrefabs[this.currentTrackIndex]) {
                this.trackPrefabs[this.currentTrackIndex].enabled = true;
                this.currentActivePrefab = this.trackPrefabs[this.currentTrackIndex];
                print("Prefab for track " + this.titles[this.currentTrackIndex] + " activated.");
            }
        }
    }
    loadTrack(index) {
        if (index >= 0 && index < this.tracks.length) {
            const wasPlaying = this.isPlaying || this.shouldAutoPlay;
            this.shouldAutoPlay = false;
            this.audioInitialized = false;
            if (this.isPlaying) {
                this.isManualStop = true;
                this.audioComponent.stop(true);
                this.isPlaying = false;
            }
            this.currentTrackIndex = index;
            this.isPaused = false;
            this.audioComponent.audioTrack = null;
            this.delayedCall(0.05, () => {
                this.audioComponent.audioTrack = this.tracks[this.currentTrackIndex];
                this.setupTrackFinishedCallback();
                this.trackStartTime = getTime();
                this.currentPlaybackTime = 0;
                this.updateTrackInfo();
                this.updateActivePrefab();
                this.delayedCall(0.1, () => {
                    this.audioInitialized = true;
                    print("Track loaded: " + this.titles[this.currentTrackIndex] + " by " + this.artists[this.currentTrackIndex]);
                    if (wasPlaying) {
                        this.delayedCall(0.1, () => {
                            this.playTrack();
                        });
                    }
                });
            });
        }
    }
    delayedCall(delay, callback) {
        const delayEvent = this.createEvent("UpdateEvent");
        let startTime = getTime();
        delayEvent.bind(() => {
            if (getTime() - startTime >= delay) {
                callback();
                delayEvent.enabled = false;
            }
        });
    }
    updateTrackInfo() {
        if (this.currentTrackIndex === -1) {
            if (this.artistNameText)
                this.artistNameText.text = "No track";
            if (this.trackTitleText)
                this.trackTitleText.text = "Stopped";
        }
        else {
            if (this.artistNameText)
                this.artistNameText.text = this.artists[this.currentTrackIndex];
            if (this.trackTitleText)
                this.trackTitleText.text = this.titles[this.currentTrackIndex];
        }
        this.updateActivePrefab();
    }
    togglePlayPause() {
        if (this.isPlaying) {
            // Si la piste joue, on la met en pause
            this.pauseTrack();
        }
        else if (this.isPaused && this.currentTrackIndex !== -1) {
            // Si la piste est en pause et une piste est chargée, on reprend
            this.playTrack();
        }
        else {
            // Sinon, on charge la première piste (ou la piste actuelle si définie) et on joue
            if (this.currentTrackIndex === -1) {
                this.loadTrack(0);
                this.delayedCall(0.2, () => this.playTrack());
            }
            else {
                this.playTrack();
            }
        }
    }
    playTrack() {
        if (!this.isPlaying && this.audioComponent && this.audioComponent.audioTrack && this.audioInitialized) {
            try {
                if (this.isPaused) {
                    this.audioComponent.resume();
                    this.isPlaying = true;
                    this.isPaused = false;
                    this.trackStartTime = getTime() - this.currentPlaybackTime;
                    print("Resuming track: " + this.titles[this.currentTrackIndex] + " from " + this.formatTime(this.currentPlaybackTime));
                }
                else {
                    this.audioComponent.play(1);
                    this.isPlaying = true;
                    this.trackStartTime = getTime();
                    this.currentPlaybackTime = 0;
                    print("Playing track: " + this.titles[this.currentTrackIndex]);
                }
            }
            catch (e) {
                print("Error playing track: " + e);
            }
        }
        else if (!this.audioInitialized) {
            print("Cannot play track: Audio not yet initialized");
        }
    }
    pauseTrack() {
        if (this.isPlaying && this.audioComponent) {
            try {
                this.audioComponent.pause();
                this.isPlaying = false;
                this.isPaused = true;
                this.currentPlaybackTime = getTime() - this.trackStartTime;
                print("Track paused: " + this.titles[this.currentTrackIndex] + " at " + this.formatTime(this.currentPlaybackTime));
            }
            catch (e) {
                print("Error pausing track: " + e);
            }
        }
    }
    stopTrack() {
        if (this.audioComponent) {
            if (this.isPlaying || this.isPaused) {
                this.isManualStop = true;
                this.audioComponent.stop(true);
            }
            this.isPlaying = false;
            this.isPaused = false;
            this.shouldAutoPlay = false;
            this.currentTrackIndex = -1;
            this.audioComponent.audioTrack = null;
            this.audioInitialized = false;
            this.currentPlaybackTime = 0;
            this.updateEarthPosition(0, 1);
            this.updateTrackInfo();
            this.updateActivePrefab();
            print("Playback fully stopped");
        }
    }
    nextTrack() {
        if (this.currentTrackIndex === -1) {
            this.loadTrack(0);
            this.delayedCall(0.2, () => this.playTrack());
            return;
        }
        if (this.isRepeatEnabled) {
            const wasPlaying = this.isPlaying;
            if (wasPlaying) {
                this.shouldAutoPlay = true;
            }
            this.loadTrack(this.currentTrackIndex);
        }
        else {
            let nextIndex;
            if (this.isShuffleEnabled) {
                nextIndex = Math.floor(Math.random() * this.tracks.length);
            }
            else {
                nextIndex = this.currentTrackIndex + 1;
                if (nextIndex >= this.tracks.length) {
                    if (this.loopPlayback) {
                        nextIndex = 0;
                    }
                    else {
                        this.stopTrack();
                        return;
                    }
                }
            }
            const wasPlaying = this.isPlaying;
            if (wasPlaying) {
                this.shouldAutoPlay = true;
            }
            print("Moving to next track, new index: " + nextIndex);
            this.loadTrack(nextIndex);
        }
    }
    prevTrack() {
        if (this.currentTrackIndex === -1) {
            this.loadTrack(this.tracks.length - 1);
            this.delayedCall(0.2, () => this.playTrack());
            return;
        }
        if (this.isRepeatEnabled) {
            const wasPlaying = this.isPlaying;
            if (wasPlaying) {
                this.shouldAutoPlay = true;
            }
            this.loadTrack(this.currentTrackIndex);
        }
        else {
            let prevIndex;
            if (this.isShuffleEnabled) {
                prevIndex = Math.floor(Math.random() * this.tracks.length);
            }
            else {
                prevIndex = this.currentTrackIndex - 1;
                if (prevIndex < 0) {
                    prevIndex = this.tracks.length - 1;
                }
            }
            const wasPlaying = this.isPlaying;
            if (wasPlaying) {
                this.shouldAutoPlay = true;
            }
            print("Moving to previous track, new index: " + prevIndex);
            this.loadTrack(prevIndex);
        }
    }
    updatePlayer() {
        if (!this.audioInitialized) {
            if (this.timecodeText) {
                this.timecodeText.text = "00:00 / 00:00";
            }
            return;
        }
        if (this.timecodeText && this.audioComponent && this.audioComponent.audioTrack) {
            let currentTime = 0;
            let totalTime = 0;
            try {
                totalTime = this.audioComponent.duration || 0;
                if (isNaN(totalTime) || totalTime <= 0) {
                    throw new Error("Invalid duration");
                }
                if (this.isPlaying) {
                    currentTime = getTime() - this.trackStartTime;
                    if (currentTime > totalTime) {
                        currentTime = totalTime;
                    }
                }
                else {
                    currentTime = this.currentPlaybackTime;
                }
                this.timecodeText.text = this.formatTime(currentTime) + " / " + this.formatTime(totalTime);
                this.updateEarthPosition(currentTime, totalTime);
            }
            catch (e) {
                print("Error updating player: " + e);
                if (this.timecodeText) {
                    this.timecodeText.text = "00:00 / 00:00";
                }
            }
        }
    }
    updateEarthPosition(currentTime, totalTime) {
        if (this.earthSphere && this.progressBar && totalTime > 0) {
            try {
                let progress = currentTime / totalTime;
                progress = Math.max(0, Math.min(1, progress));
                const barTransform = this.progressBar.getTransform();
                const barScale = barTransform.getLocalScale();
                const barPosition = barTransform.getLocalPosition();
                const earthTransform = this.earthSphere.getTransform();
                const halfLength = barScale.x / 2;
                const localX = -halfLength + (progress * barScale.x) + this.earthSphereXOffset;
                earthTransform.setLocalPosition(new vec3(barPosition.x + localX, barPosition.y, barPosition.z));
            }
            catch (e) {
                print("Error updating sphere position: " + e);
            }
        }
    }
    formatTime(timeInSeconds) {
        if (isNaN(timeInSeconds) || timeInSeconds === null || timeInSeconds === undefined) {
            return "00:00";
        }
        timeInSeconds = Math.max(0, timeInSeconds);
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
    }
    // Public methods for ToggleVisibilityController to access track information
    getCurrentTrackIndex() {
        return this.currentTrackIndex;
    }
    getTrackPrefab(index) {
        if (index >= 0 && index < this.trackPrefabs.length) {
            return this.trackPrefabs[index];
        }
        return null;
    }
    onDestroy() {
        if (this.playPauseButton && this.onPlayPauseCallback) {
            this.playPauseButton.onButtonPinched.remove(this.onPlayPauseCallback);
        }
        if (this.nextTrackButton && this.onNextTrackCallback) {
            this.nextTrackButton.onButtonPinched.remove(this.onNextTrackCallback);
        }
        if (this.prevTrackButton && this.onPrevTrackCallback) {
            this.prevTrackButton.onButtonPinched.remove(this.onPrevTrackCallback);
        }
        if (this.repeatButton && this.onRepeatCallback) {
            this.repeatButton.onButtonPinched.remove(this.onRepeatCallback);
        }
        if (this.shuffleButton && this.onShuffleCallback) {
            this.shuffleButton.onButtonPinched.remove(this.onShuffleCallback);
        }
        if (this.stopButton && this.onStopCallback) {
            this.stopButton.onButtonPinched.remove(this.onStopCallback);
        }
        if (this.audioComponent) {
            this.audioComponent.setOnFinish(null);
        }
        if (this.audioComponent && this.isPlaying) {
            this.audioComponent.stop(true);
        }
        this.trackPrefabs.forEach(prefab => {
            if (prefab)
                prefab.enabled = false;
        });
        if (this.stoppedPrefab) {
            this.stoppedPrefab.enabled = false;
        }
    }
    __initialize() {
        super.__initialize();
        this.currentTrackIndex = -1;
        this.isPlaying = false;
        this.isPaused = false;
        this.isRepeatEnabled = false;
        this.isShuffleEnabled = false;
        this.shouldAutoPlay = false;
        this.isManualStop = false;
        this.trackStartTime = 0;
        this.currentPlaybackTime = 0;
        this.audioInitialized = false;
        this.currentActivePrefab = null;
    }
};
exports.MusicPlayerManager = MusicPlayerManager;
exports.MusicPlayerManager = MusicPlayerManager = __decorate([
    component
], MusicPlayerManager);
//# sourceMappingURL=MusicPlayerManager.js.map