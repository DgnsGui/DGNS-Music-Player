// MusicPlayerManager.js for Lens Studio
// @input Component.AudioComponent audioComponent
// @input SceneObject progressSphere
// @input vec3 startPosition {"widget":"vec3"}
// @input Asset.AudioTrackAsset[] musicTracks
// @input bool isShuffle = false
// @input bool isRepeat = false

// Initialize script globals
script.api.isPlaying = false;
script.api.currentTrackIndex = 0;

// Initialize if needed
function initialize() {
    // Set initial track if available
    if (script.audioComponent && script.musicTracks && script.musicTracks.length > 0) {
        script.audioComponent.audioTrack = script.musicTracks[script.api.currentTrackIndex];
        updateTrackInfo();
    }
}

// Check if track is finished
function checkTrackStatus() {
    if (!script.api.isPlaying || !script.audioComponent || !script.audioComponent.audioTrack) return;
    
    // Check if track finished playing
    if (!script.audioComponent.isPlaying() && !script.audioComponent.isPaused() && script.audioComponent.time > 0) {
        onTrackFinished();
    }
}

// Stop the current track
script.api.stopTrack = function() {
    if (!script.audioComponent || !script.audioComponent.audioTrack) return;
    
    script.audioComponent.stop(true);
    script.api.isPlaying = false;
    
    // Reset progress sphere position
    if (script.progressSphere && script.startPosition) {
        script.progressSphere.getTransform().setLocalPosition(script.startPosition);
    }
    
    updateUI();
    logDebug("Track stopped");
};

// Play next track
script.api.nextTrack = function() {
    if (!script.audioComponent || !script.musicTracks || script.musicTracks.length === 0) return;
    
    // Stop current track
    script.audioComponent.stop(true);
    
    // Move to next track
    if (script.isShuffle) {
        let newIndex;
        // Ensure we don't pick the same track in shuffle mode
        if (script.musicTracks.length > 1) {
            do {
                newIndex = Math.floor(Math.random() * script.musicTracks.length);
            } while (newIndex === script.api.currentTrackIndex);
            
            script.api.currentTrackIndex = newIndex;
        } else {
            script.api.currentTrackIndex = 0;
        }
    } else {
        script.api.currentTrackIndex = (script.api.currentTrackIndex + 1) % script.musicTracks.length;
    }
    
    // Update track
    script.audioComponent.audioTrack = script.musicTracks[script.api.currentTrackIndex];
    
    // Update UI and play if needed
    updateTrackInfo();
    
    if (script.api.isPlaying) {
        script.audioComponent.play(1);
    }
    
    logDebug("Next track: " + script.musicTracks[script.api.currentTrackIndex].name);
};

// Play previous track
script.api.previousTrack = function() {
    if (!script.audioComponent || !script.musicTracks || script.musicTracks.length === 0) return;
    
    // Stop current track
    script.audioComponent.stop(true);
    
    // Move to previous track
    if (script.isShuffle) {
        let newIndex;
        // Ensure we don't pick the same track in shuffle mode
        if (script.musicTracks.length > 1) {
            do {
                newIndex = Math.floor(Math.random() * script.musicTracks.length);
            } while (newIndex === script.api.currentTrackIndex);
            
            script.api.currentTrackIndex = newIndex;
        } else {
            script.api.currentTrackIndex = 0;
        }
    } else {
        script.api.currentTrackIndex = (script.api.currentTrackIndex - 1 + script.musicTracks.length) % script.musicTracks.length;
    }
    
    // Update track
    script.audioComponent.audioTrack = script.musicTracks[script.api.currentTrackIndex];
    
    // Update UI and play if needed
    updateTrackInfo();
    
    if (script.api.isPlaying) {
        script.audioComponent.play(1);
    }
    
    logDebug("Previous track: " + script.musicTracks[script.api.currentTrackIndex].name);
};

// Handle track finished event
function onTrackFinished() {
    logDebug("Track finished");
    
    if (script.isRepeat) {
        // Replay same track
        if (script.audioComponent) {
            script.audioComponent.stop(true);
            script.audioComponent.play(1);
            logDebug("Repeating track: " + script.musicTracks[script.api.currentTrackIndex].name);
        }
    } else {
        // Move to next track
        script.api.nextTrack();
    }
}

// Update playback progress
function updateProgress() {
    if (!script.api.isPlaying || !script.audioComponent || !script.audioComponent.isPlaying()) return;
    
    // Calculate progress (0 to 1)
    const currentTime = script.audioComponent.time;
    const totalDuration = script.audioComponent.duration;
    
    // Avoid division by zero
    if (totalDuration <= 0) return;
    
    const progress = currentTime / totalDuration;
    
    // Update timecode
    updateTimecode(currentTime, totalDuration);
    
    // Update progress sphere position
    updateProgressSphere(progress);
}

// Play/pause track
script.api.togglePlay = function() {
    if (!script.audioComponent || !script.musicTracks || script.musicTracks.length === 0) return;
    
    if (script.api.isPlaying) {
        // Pause track
        script.audioComponent.pause();
        script.api.isPlaying = false;
        logDebug("Track paused");
    } else {
        // Play track
        if (script.audioComponent.isPaused()) {
            script.audioComponent.resume();
        } else {
            script.audioComponent.play(1);
        }
        script.api.isPlaying = true;
        logDebug("Track playing");
    }
    
    updateUI();
};

// Helper function to update UI elements
function updateUI() {
    // Implement UI update logic here
    // This would update play/pause buttons, etc.
    
    // Example: if you have a playButton object, you could toggle its visibility
    // if (script.playButton && script.pauseButton) {
    //     script.playButton.enabled = !script.api.isPlaying;
    //     script.pauseButton.enabled = script.api.isPlaying;
    // }
}

// Helper function to update track info display
function updateTrackInfo() {
    // Implement track info update logic here
    // This would update track name, artist, etc.
    
    // Example: if you have a trackNameText component
    // if (script.trackNameText) {
    //     script.trackNameText.text = script.musicTracks[script.api.currentTrackIndex].name;
    // }
}

// Update the displayed time code
function updateTimecode(currentTime, totalDuration) {
    // Implement timecode update logic here
    
    // Example: Format time as MM:SS
    // const currentMinutes = Math.floor(currentTime / 60);
    // const currentSeconds = Math.floor(currentTime % 60);
    // const totalMinutes = Math.floor(totalDuration / 60);
    // const totalSeconds = Math.floor(totalDuration % 60);
    
    // const timeText = `${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds} / ${totalMinutes}:${totalSeconds < 10 ? '0' : ''}${totalSeconds}`;
    
    // if (script.timeText) {
    //     script.timeText.text = timeText;
    // }
}

// Update progress sphere position based on playback progress
function updateProgressSphere(progress) {
    // Implement progress sphere position update logic here
    
    // Example: If progress track is linear from startPosition to endPosition
    // if (script.progressSphere && script.startPosition && script.endPosition) {
    //     const newPosition = vec3.lerp(script.startPosition, script.endPosition, progress);
    //     script.progressSphere.getTransform().setLocalPosition(newPosition);
    // }
}

// Helper function for debug logging
function logDebug(message) {
    print("[MusicPlayerManager] " + message);
}

// Set up update event
var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(function() {
    checkTrackStatus();
    updateProgress();
});

// Initialize the script
initialize();