"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicPlayerManager = void 0;
// MusicPlayerManager.ts - Fixed Version
class MusicPlayerManager {
    constructor() {
        this.isPlaying = false;
        this.musicTracks = []; // Use proper type if available
        this.currentTrackIndex = 0;
        this.isShuffle = false;
        this.isRepeat = false;
    }
    // Fix for line 247 and related getTime() errors
    checkTrackStatus() {
        if (!this.isPlaying || !this.audioComponent || !this.audioComponent.audioTrack)
            return;
        // Check if track finished playing
        if (!this.audioComponent.isPlaying() && !this.audioComponent.isPaused() && this.audioComponent.time > 0) {
            this.onTrackFinished();
        }
    }
    // Fix for line 297, 313, 349, 399 - stop() method requires a boolean argument
    stopTrack() {
        if (!this.audioComponent || !this.audioComponent.audioTrack)
            return;
        this.audioComponent.stop(true);
        this.isPlaying = false;
        // Reset progress sphere position
        if (this.progressSphere && this.startPosition) {
            this.progressSphere.getTransform().setLocalPosition(this.startPosition);
        }
        this.updateUI();
        this.logDebug("Track stopped");
    }
    nextTrack() {
        if (!this.audioComponent || !this.musicTracks || this.musicTracks.length === 0)
            return;
        // Stop current track
        this.audioComponent.stop(true);
        // Move to next track
        if (this.isShuffle) {
            let newIndex;
            // Ensure we don't pick the same track in shuffle mode
            if (this.musicTracks.length > 1) {
                do {
                    newIndex = Math.floor(Math.random() * this.musicTracks.length);
                } while (newIndex === this.currentTrackIndex);
                this.currentTrackIndex = newIndex;
            }
            else {
                this.currentTrackIndex = 0;
            }
        }
        else {
            this.currentTrackIndex = (this.currentTrackIndex + 1) % this.musicTracks.length;
        }
        // Update track
        this.audioComponent.audioTrack = this.musicTracks[this.currentTrackIndex];
        // Update UI and play if needed
        this.updateTrackInfo();
        if (this.isPlaying) {
            this.audioComponent.play(1);
        }
        this.logDebug(`Next track: ${this.musicTracks[this.currentTrackIndex].name}`);
    }
    previousTrack() {
        if (!this.audioComponent || !this.musicTracks || this.musicTracks.length === 0)
            return;
        // Stop current track
        this.audioComponent.stop(true);
        // Move to previous track
        if (this.isShuffle) {
            let newIndex;
            // Ensure we don't pick the same track in shuffle mode
            if (this.musicTracks.length > 1) {
                do {
                    newIndex = Math.floor(Math.random() * this.musicTracks.length);
                } while (newIndex === this.currentTrackIndex);
                this.currentTrackIndex = newIndex;
            }
            else {
                this.currentTrackIndex = 0;
            }
        }
        else {
            this.currentTrackIndex = (this.currentTrackIndex - 1 + this.musicTracks.length) % this.musicTracks.length;
        }
        // Update track
        this.audioComponent.audioTrack = this.musicTracks[this.currentTrackIndex];
        // Update UI and play if needed
        this.updateTrackInfo();
        if (this.isPlaying) {
            this.audioComponent.play(1);
        }
        this.logDebug(`Previous track: ${this.musicTracks[this.currentTrackIndex].name}`);
    }
    onTrackFinished() {
        this.logDebug("Track finished");
        if (this.isRepeat) {
            // Replay same track
            if (this.audioComponent) {
                this.audioComponent.stop(true);
                this.audioComponent.play(1);
                this.logDebug(`Repeating track: ${this.musicTracks[this.currentTrackIndex].name}`);
            }
        }
        else {
            // Move to next track
            this.nextTrack();
        }
    }
    // Fix for lines 452-453 - replace getTime and getDuration with time and duration properties
    updateProgress() {
        if (!this.isPlaying || !this.audioComponent || !this.audioComponent.isPlaying())
            return;
        // Calculate progress (0 to 1)
        const currentTime = this.audioComponent.time;
        const totalDuration = this.audioComponent.duration;
        // Avoid division by zero
        if (totalDuration <= 0)
            return;
        const progress = currentTime / totalDuration;
        // Update timecode
        this.updateTimecode(currentTime, totalDuration);
        // Update progress sphere position
        this.updateProgressSphere(progress);
    }
    // Missing methods that are referenced but not defined in the snippet
    updateUI() {
        // Implementation needed
    }
    logDebug(message) {
        // Implementation needed
    }
    updateTrackInfo() {
        // Implementation needed
    }
    updateTimecode(currentTime, totalDuration) {
        // Implementation needed
    }
    updateProgressSphere(progress) {
        // Implementation needed
    }
}
exports.MusicPlayerManager = MusicPlayerManager;
//# sourceMappingURL=MusicPlayerManager.js.map