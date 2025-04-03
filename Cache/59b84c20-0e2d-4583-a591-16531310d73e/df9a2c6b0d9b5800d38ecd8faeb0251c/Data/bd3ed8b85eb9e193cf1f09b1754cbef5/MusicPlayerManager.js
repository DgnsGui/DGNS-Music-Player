"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptimizedMusicPlayer = void 0;
var __selfType = requireType("./MusicPlayerManager");
function component(target) { target.getTypeName = function () { return __selfType; }; }
// Appliquer l'interface à la classe sans forcer un héritage explicite incompatible
let OptimizedMusicPlayer = class OptimizedMusicPlayer {
    constructor() {
        this.artists = ["Artist 1", "Artist 2", "Artist 3"];
        this.titles = ["Title 1", "Title 2", "Title 3"];
        // Playback options
        this.autoPlayOnStart = false;
        this.loopPlayback = false;
        // Private state
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.shuffleMode = false;
        this.repeatMode = 'off';
        this.shuffledIndices = [];
        this.playbackStartTime = 0;
        this.pausedTime = 0;
        this.isInitialized = false;
    }
    // Implémentation de createEvent (fournie par Lens Studio au runtime)
    createEvent(eventType) {
        // Cette méthode est un stub pour TypeScript; Lens Studio la remplace au runtime
        return {
            bind: (callback) => { },
            enabled: true
        };
    }
    onAwake() {
        this.validateInputs();
        this.setupCallbacks();
        this.createEvent("UpdateEvent").bind(() => this.updateTimecode());
        this.initializePlayer();
    }
    validateInputs() {
        var _a;
        if (!((_a = this.tracks) === null || _a === void 0 ? void 0 : _a.length))
            throw new Error("No audio tracks provided");
        if (!this.audioComponent)
            throw new Error("Audio component not set");
        if (this.artists.length !== this.tracks.length || this.titles.length !== this.tracks.length) {
            print("Warning: Metadata arrays length mismatch with tracks");
        }
    }
    setupCallbacks() {
        var _a, _b, _c, _d, _e, _f;
        (_a = this.playPauseButton) === null || _a === void 0 ? void 0 : _a.onButtonPinched((e) => this.togglePlayPause());
        (_b = this.nextTrackButton) === null || _b === void 0 ? void 0 : _b.onButtonPinched((e) => this.nextTrack());
        (_c = this.prevTrackButton) === null || _c === void 0 ? void 0 : _c.onButtonPinched((e) => this.prevTrack());
        (_d = this.stopButton) === null || _d === void 0 ? void 0 : _d.onButtonPinched((e) => this.stopPlayback());
        (_e = this.shuffleButton) === null || _e === void 0 ? void 0 : _e.onButtonPinched((e) => this.toggleShuffle());
        (_f = this.repeatButton) === null || _f === void 0 ? void 0 : _f.onButtonPinched((e) => this.toggleRepeat());
        this.audioComponent.setOnFinish(() => this.handleTrackEnd());
    }
    initializePlayer() {
        this.delayedCall(0.1, () => {
            this.loadTrack(this.currentTrackIndex);
            this.isInitialized = true;
            if (this.autoPlayOnStart)
                this.playTrack();
            print(`Music player initialized with ${this.tracks.length} tracks`);
        });
    }
    loadTrack(index) {
        if (!this.isValidIndex(index))
            return;
        this.currentTrackIndex = index;
        this.audioComponent.audioTrack = this.tracks[index];
        this.updateTrackInfo();
        this.resetPlaybackTime();
    }
    playTrack() {
        if (!this.isInitialized || !this.audioComponent.audioTrack)
            return;
        try {
            if (this.pausedTime > 0) {
                this.audioComponent.currentTime = this.pausedTime;
            }
            this.audioComponent.play(this.repeatMode === 'one' ? -1 : 1);
            this.isPlaying = true;
            this.playbackStartTime = getTime() - this.pausedTime;
            this.pausedTime = 0;
            print(`Playing: ${this.titles[this.currentTrackIndex]}`);
        }
        catch (e) {
            print(`Error playing track: ${e}`);
            this.retryPlayback();
        }
    }
    pauseTrack() {
        if (!this.isPlaying)
            return;
        this.audioComponent.pause();
        this.isPlaying = false;
        this.pausedTime = this.getCurrentTime();
        print(`Paused at ${this.formatTime(this.pausedTime)}`);
    }
    stopPlayback() {
        if (!this.isInitialized)
            return;
        this.audioComponent.stop(true);
        this.isPlaying = false;
        this.pausedTime = 0;
        this.resetPlaybackTime();
        this.updateTimecode();
        print("Playback stopped");
    }
    togglePlayPause() {
        this.isPlaying ? this.pauseTrack() : this.playTrack();
    }
    nextTrack() {
        const nextIndex = this.getNextIndex();
        this.loadTrack(nextIndex);
        if (this.isPlaying)
            this.playTrack();
    }
    prevTrack() {
        const currentTime = this.getCurrentTime();
        const prevIndex = this.getPrevIndex();
        if (currentTime < 2) {
            this.loadTrack(prevIndex);
        }
        else {
            this.resetPlaybackTime();
        }
        if (this.isPlaying)
            this.playTrack();
    }
    toggleShuffle() {
        this.shuffleMode = !this.shuffleMode;
        if (this.shuffleMode) {
            this.shuffledIndices = this.generateShuffledIndices();
        }
        print(`Shuffle ${this.shuffleMode ? 'enabled' : 'disabled'}`);
    }
    toggleRepeat() {
        this.repeatMode = this.repeatMode === 'off' ? 'all' :
            this.repeatMode === 'all' ? 'one' : 'off';
        print(`Repeat mode: ${this.repeatMode}`);
    }
    handleTrackEnd() {
        if (this.repeatMode === 'one')
            return;
        if (this.repeatMode === 'all' || (this.loopPlayback && this.currentTrackIndex < this.tracks.length - 1)) {
            this.nextTrack();
        }
        else {
            this.stopPlayback();
        }
    }
    getNextIndex() {
        if (this.shuffleMode) {
            const currentShuffleIdx = this.shuffledIndices.indexOf(this.currentTrackIndex);
            return this.shuffledIndices[(currentShuffleIdx + 1) % this.tracks.length];
        }
        return (this.currentTrackIndex + 1) % this.tracks.length;
    }
    getPrevIndex() {
        if (this.shuffleMode) {
            const currentShuffleIdx = this.shuffledIndices.indexOf(this.currentTrackIndex);
            return this.shuffledIndices[(currentShuffleIdx - 1 + this.tracks.length) % this.tracks.length];
        }
        return (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
    }
    generateShuffledIndices() {
        const indices = Array.from({ length: this.tracks.length }, (_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        return indices;
    }
    updateTrackInfo() {
        this.artistNameText && (this.artistNameText.text = this.artists[this.currentTrackIndex] || "Unknown Artist");
        this.trackTitleText && (this.trackTitleText.text = this.titles[this.currentTrackIndex] || "Unknown Title");
    }
    updateTimecode() {
        if (!this.timecodeText || !this.audioComponent.audioTrack)
            return;
        const current = this.getCurrentTime();
        const total = this.audioComponent.duration || 0;
        this.timecodeText.text = `${this.formatTime(current)} / ${this.formatTime(total)}`;
    }
    getCurrentTime() {
        if (!this.isPlaying)
            return this.pausedTime;
        return getTime() - this.playbackStartTime;
    }
    resetPlaybackTime() {
        this.playbackStartTime = getTime();
        this.pausedTime = 0;
    }
    formatTime(seconds) {
        seconds = Math.max(0, seconds);
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    isValidIndex(index) {
        return index >= 0 && index < this.tracks.length;
    }
    retryPlayback() {
        this.delayedCall(0.2, () => this.playTrack());
    }
    delayedCall(delay, callback) {
        const event = this.createEvent("UpdateEvent");
        const start = getTime();
        event.bind(() => {
            if (getTime() - start >= delay) {
                callback();
                event.enabled = false;
            }
        });
    }
    onDestroy() {
        this.stopPlayback();
    }
};
exports.OptimizedMusicPlayer = OptimizedMusicPlayer;
exports.OptimizedMusicPlayer = OptimizedMusicPlayer = __decorate([
    component
], OptimizedMusicPlayer);
//# sourceMappingURL=MusicPlayerManager.js.map