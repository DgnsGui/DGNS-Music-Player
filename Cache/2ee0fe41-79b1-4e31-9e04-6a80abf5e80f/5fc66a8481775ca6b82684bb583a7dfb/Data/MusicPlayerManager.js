// MusicPlayerManager.js
// Script for managing a music player with multiple tracks and UI controls
// For Spectacles in Lens Studio

//@input Asset.AudioTrackAsset[] musicTracks
//@input Component.Text artistNameText
//@input Component.Text trackNameText
//@input Component.Text yearLabelText
//@input Component.Text timecodeText

//@input Component.ScriptComponent playPauseButton {"label":"Play Pause Button", "hint":"PinchButton component"}
//@input Component.ScriptComponent nextTrackButton {"label":"Next Track Button", "hint":"PinchButton component"}
//@input Component.ScriptComponent backTrackButton {"label":"Back Track Button", "hint":"PinchButton component"}
//@input Component.ScriptComponent shuffleButton {"label":"Shuffle Button", "hint":"PinchButton component"}
//@input Component.ScriptComponent repeatButton {"label":"Repeat Button", "hint":"PinchButton component"}
//@input Component.ScriptComponent stopButton {"label":"Stop Button", "hint":"PinchButton component"}

//@input SceneObject progressBar
//@input SceneObject progressSphere // Earth moving along the progress bar
//@input Component.Image playButtonImage {"showIf":"useCustomUI", "label":"Play Button Image"}
//@input Component.Image pauseButtonImage {"showIf":"useCustomUI", "label":"Pause Button Image"}
//@input Component.Image shuffleActiveImage {"showIf":"useCustomUI", "label":"Shuffle Active Image"}
//@input Component.Image shuffleInactiveImage {"showIf":"useCustomUI", "label":"Shuffle Inactive Image"}
//@input Component.Image repeatActiveImage {"showIf":"useCustomUI", "label":"Repeat Active Image"}
//@input Component.Image repeatInactiveImage {"showIf":"useCustomUI", "label":"Repeat Inactive Image"}
//@input bool useCustomUI {"label":"Use Custom UI"}
//@input bool debugMode {"label":"Debug Mode"}

// State management variables
var currentTrackIndex = 0;
var isPlaying = false;
var isRepeat = false;
var isShuffle = false;

// Progress bar positions
var startPosition;
var endPosition;
var barLength;

// Initialize manager
function initialize() {
    // Configure interaction buttons
    setupButtonListeners();
    
    // Set up progress bar
    setupProgressBar();
    
    // Initialize UI with first track
    updateTrackInfo();
    
    // Create update events
    var updateEvent = script.createEvent("UpdateEvent");
    updateEvent.bind(onUpdate);
    
    logDebug("Music Player Manager initialized with " + script.musicTracks.length + " tracks");
}

function setupProgressBar() {
    if (script.progressBar && script.progressSphere) {
        var barTransform = script.progressBar.getTransform();
        var barScale = barTransform.getLocalScale();
        
        startPosition = script.progressBar.getTransform().getLocalPosition().add(new vec3(-barScale.x/2, 0, 0));
        endPosition = script.progressBar.getTransform().getLocalPosition().add(new vec3(barScale.x/2, 0, 0));
        barLength = barScale.x;
        
        // Reset progress sphere position
        script.progressSphere.getTransform().setLocalPosition(startPosition);
    }
}

function setupButtonListeners() {
    setupButton(script.playPauseButton, "togglePlayPause");
    setupButton(script.nextTrackButton, "nextTrack");
    setupButton(script.backTrackButton, "previousTrack");
    setupButton(script.shuffleButton, "toggleShuffle");
    setupButton(script.repeatButton, "toggleRepeat");
    setupButton(script.stopButton, "stopTrack");
}

function setupButton(buttonComponent, functionName) {
    if (buttonComponent && buttonComponent.api && 
        typeof buttonComponent.api.customFunctionForOnButtonPinched !== "undefined" &&
        typeof buttonComponent.api.onButtonPinchedFunctionNames !== "undefined") {
        
        buttonComponent.api.customFunctionForOnButtonPinched = script;
        buttonComponent.api.onButtonPinchedFunctionNames = [functionName];
        logDebug("Button setup: " + functionName);
    } else if (buttonComponent) {
        logDebug("Warning: Button component doesn't have expected API: " + functionName);
    }
}

function onUpdate() {
    checkTrackStatus();
    updateProgress();
}

function checkTrackStatus() {
    if (!isPlaying || !getCurrentTrack()) return;
    
    var currentTrack = getCurrentTrack();
    
    // Check if track finished playing
    if (!currentTrack.isPlaying() && !currentTrack.isPaused() && currentTrack.getTime() > 0) {
        onTrackFinished();
    }
}

function getCurrentTrack() {
    if (!script.musicTracks || script.musicTracks.length === 0 || 
        currentTrackIndex >= script.musicTracks.length) {
        return null;
    }
    
    // Create AudioComponent if it doesn't exist yet
    if (!script.getSceneObject().hasComponent("Component.AudioComponent")) {
        script.getSceneObject().createComponent("Component.AudioComponent");
    }
    
    var audioComp = script.getSceneObject().getComponent("Component.AudioComponent");
    if (audioComp) {
        audioComp.audioTrack = script.musicTracks[currentTrackIndex];
    }
    
    return audioComp;
}

function togglePlayPause() {
    var currentTrack = getCurrentTrack();
    if (!currentTrack) {
        logDebug("No tracks available");
        return;
    }
    
    if (isPlaying) {
        currentTrack.pause();
        isPlaying = false;
        logDebug("Track paused");
    } else {
        if (currentTrack.isPaused()) {
            currentTrack.resume();
        } else {
            currentTrack.play(1);
        }
        isPlaying = true;
        logDebug("Track playing: " + script.musicTracks[currentTrackIndex].name);
    }
    
    updateUI();
}

function stopTrack() {
    var currentTrack = getCurrentTrack();
    if (!currentTrack) return;
    
    currentTrack.stop();
    isPlaying = false;
    
    // Reset progress sphere position
    if (script.progressSphere) {
        script.progressSphere.getTransform().setLocalPosition(startPosition);
    }
    
    updateUI();
    logDebug("Track stopped");
}

function nextTrack() {
    var currentTrack = getCurrentTrack();
    if (!currentTrack) return;
    
    // Stop current track
    currentTrack.stop();
    
    // Move to next track
    if (isShuffle) {
        var newIndex;
        // Ensure we don't pick the same track in shuffle mode
        do {
            newIndex = Math.floor(Math.random() * script.musicTracks.length);
        } while (newIndex === currentTrackIndex && script.musicTracks.length > 1);
        
        currentTrackIndex = newIndex;
    } else {
        currentTrackIndex = (currentTrackIndex + 1) % script.musicTracks.length;
    }
    
    // Update UI and play if needed
    updateTrackInfo();
    
    if (isPlaying) {
        var nextTrack = getCurrentTrack();
        if (nextTrack) {
            nextTrack.play(1);
        }
    }
    
    logDebug("Next track: " + script.musicTracks[currentTrackIndex].name);
}

function previousTrack() {
    var currentTrack = getCurrentTrack();
    if (!currentTrack) return;
    
    // Stop current track
    currentTrack.stop();
    
    // Move to previous track
    if (isShuffle) {
        var newIndex;
        // Ensure we don't pick the same track in shuffle mode
        do {
            newIndex = Math.floor(Math.random() * script.musicTracks.length);
        } while (newIndex === currentTrackIndex && script.musicTracks.length > 1);
        
        currentTrackIndex = newIndex;
    } else {
        currentTrackIndex = (currentTrackIndex - 1 + script.musicTracks.length) % script.musicTracks.length;
    }
    
    // Update UI and play if needed
    updateTrackInfo();
    
    if (isPlaying) {
        var prevTrack = getCurrentTrack();
        if (prevTrack) {
            prevTrack.play(1);
        }
    }
    
    logDebug("Previous track: " + script.musicTracks[currentTrackIndex].name);
}

function toggleShuffle() {
    isShuffle = !isShuffle;
    updateUI();
    logDebug("Shuffle mode: " + (isShuffle ? "ON" : "OFF"));
}

function toggleRepeat() {
    isRepeat = !isRepeat;
    updateUI();
    logDebug("Repeat mode: " + (isRepeat ? "ON" : "OFF"));
}

function onTrackFinished() {
    logDebug("Track finished");
    
    if (isRepeat) {
        // Replay same track
        var currentTrack = getCurrentTrack();
        if (currentTrack) {
            currentTrack.stop();
            currentTrack.play(1);
            logDebug("Repeating track: " + script.musicTracks[currentTrackIndex].name);
        }
    } else {
        // Move to next track
        nextTrack();
    }
}

function updateTrackInfo() {
    if (!script.musicTracks || currentTrackIndex >= script.musicTracks.length) return;
    
    var currentTrack = script.musicTracks[currentTrackIndex];
    var trackName = currentTrack.name || "";
    var artistName = "";
    var yearLabel = "";
    
    // Parse track information from filename
    if (trackName.indexOf(" - ") > -1) {
        var parts = trackName.split(" - ");
        artistName = parts[0];
        trackName = parts[1];
        
        // Extract year if available (e.g., "TrackName (2023)")
        if (trackName.indexOf("(") > -1 && trackName.indexOf(")") > -1) {
            var yearStart = trackName.lastIndexOf("(") + 1;
            var yearEnd = trackName.lastIndexOf(")");
            if (yearEnd > yearStart) {
                yearLabel = trackName.substring(yearStart, yearEnd);
                // Remove year from track name
                trackName = trackName.substring(0, yearStart - 1).trim();
            }
        }
    }
    
    // Update UI text elements
    updateTextElement(script.artistNameText, artistName);
    updateTextElement(script.trackNameText, trackName);
    updateTextElement(script.yearLabelText, yearLabel);
}

function updateTextElement(textComponent, content) {
    if (textComponent) {
        textComponent.text = content;
    }
}

function updateProgress() {
    var currentTrack = getCurrentTrack();
    if (!isPlaying || !currentTrack || !currentTrack.isPlaying()) return;
    
    // Calculate progress (0 to 1)
    var currentTime = currentTrack.getTime();
    var totalDuration = currentTrack.getDuration();
    
    // Avoid division by zero
    if (totalDuration <= 0) return;
    
    var progress = currentTime / totalDuration;
    
    // Update timecode
    updateTimecode(currentTime, totalDuration);
    
    // Update progress sphere position
    updateProgressSphere(progress);
}

function updateTimecode(currentTime, totalDuration) {
    if (!script.timecodeText) return;
    
    var minutes = Math.floor(currentTime / 60);
    var seconds = Math.floor(currentTime % 60);
    var totalMinutes = Math.floor(totalDuration / 60);
    var totalSeconds = Math.floor(totalDuration % 60);
    
    script.timecodeText.text = pad(minutes) + ":" + pad(seconds) + " / " + pad(totalMinutes) + ":" + pad(totalSeconds);
}

function updateProgressSphere(progress) {
    if (!script.progressSphere || !startPosition || !endPosition) return;
    
    // Interpolate position
    var newPosition = vec3.lerp(startPosition, endPosition, progress);
    script.progressSphere.getTransform().setLocalPosition(newPosition);
    
    // Rotate sphere for visual effect
    var currentRotation = script.progressSphere.getTransform().getLocalRotation();
    var rotationIncrement = quat.angleAxis(0.01, vec3.up());
    script.progressSphere.getTransform().setLocalRotation(currentRotation.multiply(rotationIncrement));
}

function updateUI() {
    // Update button visuals based on state
    if (script.useCustomUI) {
        // Update play/pause button
        if (script.playButtonImage && script.pauseButtonImage) {
            script.playButtonImage.enabled = !isPlaying;
            script.pauseButtonImage.enabled = isPlaying;
        }
        
        // Update shuffle button
        if (script.shuffleActiveImage && script.shuffleInactiveImage) {
            script.shuffleActiveImage.enabled = isShuffle;
            script.shuffleInactiveImage.enabled = !isShuffle;
        }
        
        // Update repeat button
        if (script.repeatActiveImage && script.repeatInactiveImage) {
            script.repeatActiveImage.enabled = isRepeat;
            script.repeatInactiveImage.enabled = !isRepeat;
        }
    }
}

function pad(num) {
    return (num < 10) ? "0" + num : num.toString();
}

function logDebug(message) {
    if (script.debugMode) {
        print("[MusicPlayerManager] " + message);
    }
}

// Initialize the script
initialize();