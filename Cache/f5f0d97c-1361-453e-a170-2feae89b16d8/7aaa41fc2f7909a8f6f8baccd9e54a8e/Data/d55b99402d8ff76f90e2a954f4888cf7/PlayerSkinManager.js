"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicPlayerManager = void 0;
var __selfType = requireType("./PlayerSkinManager");
function component(target) { target.getTypeName = function () { return __selfType; }; }
let MusicPlayerManager = class MusicPlayerManager extends BaseScriptComponent {
    onAwake() {
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
        this.createEvent("UpdateEvent").bind(() => {
            this.updatePlayer();
            this.updateSphereRotation();
        });
        this.updateActivePrefab();
        print("MusicPlayerManager initialized with " + this.tracks.length + " tracks, awaiting user input.");
    }
    setupCallbacks() {
        if (this.playPauseButton) {
            this.onPlayPauseCallback = (event) => this.togglePlayPause();
            this.playPauseButton.onButtonPinched.add(this.onPlayPauseCallback);
            print("Play/Pause button callback set");
        }
        if (this.nextTrackButton) {
            this.onNextTrackCallback = (event) => this.nextTrack();
            this.nextTrackButton.onButtonPinched.add(this.onNextTrackCallback);
            print("Next button callback set");
        }
        if (this.prevTrackButton) {
            this.onPrevTrackCallback = (event) => this.prevTrack();
            this.prevTrackButton.onButtonPinched.add(this.onPrevTrackCallback);
            print("Previous button callback set");
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
            print("Stop button callback set");
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
        print("Track finished event triggered");
        if (this.isPaused) {
            print("Track finished ignored due to paused state");
            return;
        }
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
        const currentTime = getTime();
        if (currentTime - this.lastPinchTime < 0.5) {
            print("Pinch ignored due to debounce");
            return;
        }
        this.lastPinchTime = currentTime;
        print(`Toggle Play/Pause called - isPlaying: ${this.isPlaying}, isPaused: ${this.isPaused}, currentTrackIndex: ${this.currentTrackIndex}`);
        if (this.isPlaying) {
            this.pauseTrack();
        }
        else if (this.isPaused && this.currentTrackIndex !== -1) {
            this.playTrack();
        }
        else {
            if (this.currentTrackIndex === -1) {
                print("No track loaded, starting first track");
                this.loadTrack(0);
                this.delayedCall(0.2, () => this.playTrack());
            }
            else {
                this.playTrack();
            }
        }
    }
    playTrack() {
        var _a;
        if (!this.isPlaying && this.audioComponent && this.audioComponent.audioTrack && this.audioInitialized) {
            try {
                if (this.isPaused) {
                    print("Resuming track from pause: " + this.titles[this.currentTrackIndex]);
                    this.audioComponent.resume();
                    this.isPlaying = true;
                    this.isPaused = false;
                    this.trackStartTime = getTime() - this.currentPlaybackTime;
                    print("Resumed at " + this.formatTime(this.currentPlaybackTime));
                }
                else {
                    print("Starting track: " + this.titles[this.currentTrackIndex]);
                    this.audioComponent.play(1);
                    this.isPlaying = true;
                    this.trackStartTime = getTime();
                    this.currentPlaybackTime = 0;
                }
            }
            catch (e) {
                print("Error playing track: " + e);
            }
        }
        else {
            print("Cannot play track - Conditions not met: " +
                `isPlaying: ${this.isPlaying}, audioComponent: ${!!this.audioComponent}, ` +
                `audioTrack: ${!!((_a = this.audioComponent) === null || _a === void 0 ? void 0 : _a.audioTrack)}, audioInitialized: ${this.audioInitialized}`);
        }
    }
    pauseTrack() {
        if (this.isPlaying && this.audioComponent) {
            try {
                print("Attempting to pause track: " + this.titles[this.currentTrackIndex]);
                this.audioComponent.pause();
                this.isPlaying = false;
                this.isPaused = true;
                this.currentPlaybackTime = getTime() - this.trackStartTime;
                print("Track paused successfully at " + this.formatTime(this.currentPlaybackTime));
            }
            catch (e) {
                print("Error pausing track: " + e);
                this.isPlaying = false;
                this.isPaused = true;
                this.currentPlaybackTime = getTime() - this.trackStartTime;
            }
        }
        else {
            print("Pause called but track not playing or audioComponent missing");
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
        print("Next track triggered");
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
        print("Previous track triggered");
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
        this.lastPinchTime = 0;
    }
};
exports.MusicPlayerManager = MusicPlayerManager;
exports.MusicPlayerManager = MusicPlayerManager = __decorate([
    component
], MusicPlayerManager);
//# sourceMappingURL=PlayerSkinManager.js.map