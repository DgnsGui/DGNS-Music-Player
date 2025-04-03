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
        // Initialize tracks array
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
        // Setup button callbacks
        this.setupCallbacks();
        // Setup progress bar dimensions
        this.setupProgressBar();
        // Load first track
        this.loadTrack(0);
        // Create update event
        this.createEvent("UpdateEvent").bind(() => {
            this.updatePlayer();
        });
        print("MusicPlayerManager initialized with " + this.tracks.length + " tracks");
    }
    setupCallbacks() {
        // Setup play/pause button
        if (this.playPauseButton) {
            this.onPlayPauseCallback = (event) => this.togglePlayPause();
            this.playPauseButton.onButtonPinched(this.onPlayPauseCallback);
        }
        // Setup next track button
        if (this.nextTrackButton) {
            this.onNextTrackCallback = (event) => this.nextTrack();
            this.nextTrackButton.onButtonPinched(this.onNextTrackCallback);
        }
        // Setup previous track button
        if (this.prevTrackButton) {
            this.onPrevTrackCallback = (event) => this.prevTrack();
            this.prevTrackButton.onButtonPinched(this.onPrevTrackCallback);
        }
        // Setup track finished callback
        this.onTrackFinishedCallback = () => this.nextTrack();
        this.audioComponent.setOnFinish(this.onTrackFinishedCallback);
    }
    setupProgressBar() {
        if (this.progressBar && this.earthSphere) {
            const barTransform = this.progressBar.getTransform();
            const barScale = barTransform.getLocalScale();
            const barPosition = barTransform.getWorldPosition();
            // Calculate the start and end positions of the progress bar
            // Assuming the bar is oriented along the X axis
            this.progressBarStartX = barPosition.x - (barScale.x / 2);
            this.progressBarEndX = barPosition.x + (barScale.x / 2);
            this.progressBarLength = barScale.x;
            // Position the earth sphere at the start of the progress bar
            const earthTransform = this.earthSphere.getTransform();
            const earthPosition = earthTransform.getWorldPosition();
            earthTransform.setWorldPosition(new vec3(this.progressBarStartX, earthPosition.y, earthPosition.z));
        }
    }
    loadTrack(index) {
        if (index >= 0 && index < this.tracks.length) {
            this.currentTrackIndex = index;
            // Set the audio track
            this.audioComponent.audioTrack = this.tracks[index];
            // Update UI
            this.updateTrackInfo();
            print("Loaded track: " + this.titles[index] + " by " + this.artists[index]);
        }
    }
    updateTrackInfo() {
        // Update artist and title text
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
        if (!this.isPlaying) {
            this.audioComponent.play(1);
            this.isPlaying = true;
            print("Playing track: " + this.titles[this.currentTrackIndex]);
        }
    }
    pauseTrack() {
        if (this.isPlaying) {
            this.audioComponent.pause();
            this.isPlaying = false;
            print("Paused track: " + this.titles[this.currentTrackIndex]);
        }
    }
    nextTrack() {
        const nextIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        this.loadTrack(nextIndex);
        if (this.isPlaying) {
            this.playTrack();
        }
    }
    prevTrack() {
        const prevIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
        this.loadTrack(prevIndex);
        if (this.isPlaying) {
            this.playTrack();
        }
    }
    updatePlayer() {
        // Update timecode text
        if (this.timecodeText && this.audioComponent) {
            // Using the correct property for current playback time
            // According to the documentation
            const currentTime = this.audioComponent.currentTime;
            const totalTime = this.audioComponent.duration;
            this.timecodeText.text = this.formatTime(currentTime) + " / " + this.formatTime(totalTime);
            // Update earth sphere position
            this.updateEarthPosition(currentTime, totalTime);
        }
    }
    updateEarthPosition(currentTime, totalTime) {
        if (this.earthSphere && totalTime > 0) {
            const progress = currentTime / totalTime;
            const newX = this.progressBarStartX + (this.progressBarLength * progress);
            const earthTransform = this.earthSphere.getTransform();
            const currentPosition = earthTransform.getWorldPosition();
            earthTransform.setWorldPosition(new vec3(newX, currentPosition.y, currentPosition.z));
            // Optionally rotate the earth sphere for additional visual effect
            const rotation = earthTransform.getLocalRotation();
            earthTransform.setLocalRotation(quat.fromEulerAngles(rotation.x, rotation.y + 0.5, // Rotate a bit on y-axis each frame
            rotation.z));
        }
    }
    formatTime(timeInSeconds) {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
    }
    onDestroy() {
        // Clean up event listeners
        if (this.playPauseButton && this.onPlayPauseCallback) {
            this.playPauseButton.onButtonPinched.remove(this.onPlayPauseCallback);
        }
        if (this.nextTrackButton && this.onNextTrackCallback) {
            this.nextTrackButton.onButtonPinched.remove(this.onNextTrackCallback);
        }
        if (this.prevTrackButton && this.onPrevTrackCallback) {
            this.prevTrackButton.onButtonPinched.remove(this.onPrevTrackCallback);
        }
        // Stop any playing audio
        if (this.audioComponent && this.isPlaying) {
            this.audioComponent.stop(true);
        }
    }
    __initialize() {
        super.__initialize();
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.tracks = [];
        this.artists = [];
        this.titles = [];
        this.progressBarStartX = 0;
        this.progressBarEndX = 0;
        this.progressBarLength = 0;
    }
};
exports.MusicPlayerManager = MusicPlayerManager;
exports.MusicPlayerManager = MusicPlayerManager = __decorate([
    component
], MusicPlayerManager);
//# sourceMappingURL=MusicPlayerManager.js.map