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
        this.tracks = [this.track1, this.track2, this.track3].filter(track => track != null);
        this.artists = [this.artist1, this.artist2, this.artist3];
        this.titles = [this.title1, this.title2, this.title3];
        if (this.tracks.length === 0) {
            print("Error: No audio tracks provided to MusicPlayerManager");
            return;
        }
        if (!this.audioComponent) {
            print("Error: Audio component not set in MusicPlayerManager");
            return;
        }
        if (!this.earthSphere || !this.progressBar) {
            print("Warning: Progress visualization objects not set in MusicPlayerManager");
        }
        this.setupCallbacks();
        this.setupProgressBar();
        this.createEvent("UpdateEvent").bind(() => {
            this.updatePlayer();
        });
        this.delayedCall(0.5, () => {
            this.loadTrack(0);
            print("MusicPlayerManager initialized with " + this.tracks.length + " tracks");
        });
    }
    setupCallbacks() {
        if (this.playPauseButton) {
            this.onPlayPauseCallback = (event) => this.togglePlayPause();
            this.playPauseButton.onButtonPinched(this.onPlayPauseCallback);
        }
        if (this.nextTrackButton) {
            this.onNextTrackCallback = (event) => this.nextTrack();
            this.nextTrackButton.onButtonPinched(this.onNextTrackCallback);
        }
        if (this.prevTrackButton) {
            this.onPrevTrackCallback = (event) => this.prevTrack();
            this.prevTrackButton.onButtonPinched(this.onPrevTrackCallback);
        }
        if (this.repeatButton) {
            this.repeatButton.onButtonPinched((event) => {
                this.isRepeatEnabled = !this.isRepeatEnabled;
                print("Repeat " + (this.isRepeatEnabled ? "enabled" : "disabled"));
            });
        }
        if (this.shuffleButton) {
            this.shuffleButton.onButtonPinched((event) => {
                this.isShuffleEnabled = !this.isShuffleEnabled;
                print("Shuffle " + (this.isShuffleEnabled ? "enabled" : "disabled"));
            });
        }
        if (this.stopButton) {
            this.stopButton.onButtonPinched((event) => this.stopTrack());
        }
        this.setupTrackFinishedCallback();
    }
    setupTrackFinishedCallback() {
        this.onTrackFinishedCallback = () => {
            print("Track finished, handling next action");
            this.handleTrackFinished();
        };
        if (this.audioComponent) {
            this.audioComponent.setOnFinish(this.onTrackFinishedCallback);
        }
    }
    handleTrackFinished() {
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
            this.isPlaying = false;
            this.currentPlaybackTime = 0;
            this.updateEarthPosition(0, 1);
            print("Playback completed");
        }
    }
    setupProgressBar() {
        if (this.progressBar && this.earthSphere) {
            this.updateEarthPosition(0, 1);
        }
    }
    loadTrack(index) {
        if (index >= 0 && index < this.tracks.length) {
            const wasPlaying = this.isPlaying || this.shouldAutoPlay;
            this.shouldAutoPlay = false;
            this.audioInitialized = false;
            if (this.isPlaying) {
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
                this.delayedCall(0.1, () => {
                    this.audioInitialized = true;
                    print("Loaded track: " + this.titles[this.currentTrackIndex] + " by " + this.artists[this.currentTrackIndex]);
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
        if (this.artistNameText) {
            this.artistNameText.text = this.artists[this.currentTrackIndex];
        }
        if (this.trackTitleText) {
            this.trackTitleText.text = this.titles[this.currentTrackIndex];
        }
    }
    togglePlayPause() {
        if (this.isPlaying) {
            this.pauseTrack();
        }
        else {
            this.playTrack();
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
                    print("Resumed track: " + this.titles[this.currentTrackIndex] + " from " + this.formatTime(this.currentPlaybackTime));
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
                print("Paused track: " + this.titles[this.currentTrackIndex] + " at " + this.formatTime(this.currentPlaybackTime));
            }
            catch (e) {
                print("Error pausing track: " + e);
            }
        }
    }
    stopTrack() {
        if (this.audioComponent) {
            // Désactiver temporairement le callback pour éviter handleTrackFinished
            this.audioComponent.setOnFinish(null);
            this.audioComponent.stop(true);
            this.isPlaying = false;
            this.isPaused = false;
            this.shouldAutoPlay = false;
            this.currentPlaybackTime = 0;
            this.updateEarthPosition(0, 1);
            print("Stopped track: " + this.titles[this.currentTrackIndex]);
            // Réactiver le callback après l'arrêt
            this.setupTrackFinishedCallback();
        }
    }
    nextTrack() {
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
                nextIndex = (this.currentTrackIndex + 1) % this.tracks.length;
                if (nextIndex === 0 && !this.loopPlayback) {
                    this.pauseTrack();
                    return;
                }
            }
            const wasPlaying = this.isPlaying;
            if (wasPlaying) {
                this.shouldAutoPlay = true;
            }
            this.loadTrack(nextIndex);
        }
    }
    prevTrack() {
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
                prevIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
            }
            const wasPlaying = this.isPlaying;
            if (wasPlaying) {
                this.shouldAutoPlay = true;
            }
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
                const barScale = this.progressBar.getTransform().getLocalScale();
                const halfLength = barScale.x / 2;
                const localX = -halfLength + (progress * barScale.x) + this.earthSphereXOffset;
                const earthTransform = this.earthSphere.getTransform();
                earthTransform.setLocalPosition(new vec3(localX, 0, 0));
                const rotation = earthTransform.getLocalRotation();
                earthTransform.setLocalRotation(quat.fromEulerAngles(rotation.x, rotation.y + 0.5, rotation.z));
            }
            catch (e) {
                print("Error updating earth position: " + e);
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
        if (this.audioComponent && this.isPlaying) {
            this.audioComponent.stop(true);
        }
    }
    __initialize() {
        super.__initialize();
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.isRepeatEnabled = false;
        this.isShuffleEnabled = false;
        this.shouldAutoPlay = false;
        this.tracks = [];
        this.artists = [];
        this.titles = [];
        this.trackStartTime = 0;
        this.currentPlaybackTime = 0;
        this.audioInitialized = false;
    }
};
exports.MusicPlayerManager = MusicPlayerManager;
exports.MusicPlayerManager = MusicPlayerManager = __decorate([
    component
], MusicPlayerManager);
//# sourceMappingURL=MusicPlayerManager.js.map