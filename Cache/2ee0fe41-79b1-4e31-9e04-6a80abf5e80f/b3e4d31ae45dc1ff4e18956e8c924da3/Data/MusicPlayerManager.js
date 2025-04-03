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
//@input SceneObject progressSphere
//@input Component.Image playButtonImage {"showIf":"useCustomUI"}
//@input Component.Image pauseButtonImage {"showIf":"useCustomUI"}
//@input Component.Image shuffleActiveImage {"showIf":"useCustomUI"}
//@input Component.Image shuffleInactiveImage {"showIf":"useCustomUI"}
//@input Component.Image repeatActiveImage {"showIf":"useCustomUI"}
//@input Component.Image repeatInactiveImage {"showIf":"useCustomUI"}
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

// Audio component
var audioComponent;

function initialize() {
    setupAudioComponent();
    setupButtonListeners();
    setupProgressBar();
    updateTrackInfo();
    
    var updateEvent = script.createEvent("UpdateEvent");
    updateEvent.bind(onUpdate);
    
    logDebug("Music Player Manager initialized with " + (script.musicTracks ? script.musicTracks.length : 0) + " tracks");
}

function setupAudioComponent() {
    if (!script.getSceneObject().getComponent("Component.AudioComponent")) {
        audioComponent = script.getSceneObject().createComponent("Component.AudioComponent");
        logDebug("Created new AudioComponent");
    } else {
        audioComponent = script.getSceneObject().getComponent("Component.AudioComponent");
        logDebug("Using existing AudioComponent");
    }
    
    if (script.musicTracks && script.musicTracks.length > 0) {
        audioComponent.audioTrack = script.musicTracks[currentTrackIndex];
    } else {
        logDebug("Warning: No music tracks assigned");
    }
}

function setupProgressBar() {
    if (script.progressBar && script.progressSphere) {
        var barTransform = script.progressBar.getTransform();
        var barScale = barTransform.getLocalScale();
        
        startPosition = barTransform.getLocalPosition().add(new vec3(-barScale.x/2, 0, 0));
        endPosition = barTransform.getLocalPosition().add(new vec3(barScale.x/2, 0, 0));
        barLength = barScale.x;
        
        script.progressSphere.getTransform().setLocalPosition(startPosition);
    } else {
        logDebug("Warning: Progress bar or sphere not assigned");
    }
}

function setupButtonListeners() {
    var buttons = [
        {component: script.playPauseButton, func: "togglePlayPause"},
        {component: script.nextTrackButton, func: "nextTrack"},
        {component: script.backTrackButton, func: "previousTrack"},
        {component: script.shuffleButton, func: "toggleShuffle"},
        {component: script.repeatButton, func: "toggleRepeat"},
        {component: script.stopButton, func: "stopTrack"}
    ];
    
    buttons.forEach(function(button) {
        setupButton(button.component, button.func);
    });
}

function setupButton(buttonComponent, functionName) {
    if (!buttonComponent) {
        logDebug("Warning: Button component not assigned for " + functionName);
        return;
    }
    
    if (buttonComponent.api && 
        typeof buttonComponent.api.customFunctionForOnButtonPinched !== "undefined" &&
        typeof buttonComponent.api.onButtonPinchedFunctionNames !== "undefined") {
        buttonComponent.api.customFunctionForOnButtonPinched = script;
        buttonComponent.api.onButtonPinchedFunctionNames = [functionName];
        logDebug("Button setup successfully: " + functionName);
    } else {
        logDebug("Error: Button component for " + functionName + " lacks required PinchButton API");
    }
}

function onUpdate() {
    checkTrackStatus();
    updateProgress();
}

function checkTrackStatus() {
    if (!isPlaying || !audioComponent || !audioComponent.audioTrack) return;
    
    if (!audioComponent.isPlaying() && !audioComponent.isPaused() && audioComponent.getTime() > 0) {
        onTrackFinished();
    }
}

function togglePlayPause() {
    if (!audioComponent) {
        logDebug("Error: AudioComponent not initialized");
        return;
    }
    if (!script.musicTracks || script.musicTracks.length === 0) {
        logDebug("No tracks available");
        return;
    }
    
    audioComponent.audioTrack = script.musicTracks[currentTrackIndex];
    
    if (isPlaying) {
        audioComponent.pause();
        isPlaying = false;
        logDebug("Track paused");
    } else {
        if (audioComponent.isPaused()) {
            audioComponent.resume();
        } else {
            audioComponent.play(1);
        }
        isPlaying = true;
        logDebug("Track playing: " + script.musicTracks[currentTrackIndex].name);
    }
    
    updateUI();
}

function stopTrack() {
    if (!audioComponent || !audioComponent.audioTrack) return;
    
    audioComponent.stop();
    isPlaying = false;
    
    if (script.progressSphere && startPosition) {
        script.progressSphere.getTransform().setLocalPosition(startPosition);
    }
    
    updateUI();
    logDebug("Track stopped");
}

function nextTrack() {
    if (!audioComponent || !script.musicTracks || script.musicTracks.length === 0) return;
    
    audioComponent.stop();
    
    if (isShuffle) {
        var newIndex;
        if (script.musicTracks.length > 1) {
            do {
                newIndex = Math.floor(Math.random() * script.musicTracks.length);
            } while (newIndex === currentTrackIndex);
            currentTrackIndex = newIndex;
        }
    } else {
        currentTrackIndex = (currentTrackIndex + 1) % script.musicTracks.length;
    }
    
    audioComponent.audioTrack = script.musicTracks[currentTrackIndex];
    updateTrackInfo();
    
    if (isPlaying) {
        audioComponent.play(1);
    }
    
    logDebug("Next track: " + script.musicTracks[currentTrackIndex].name);
}

function previousTrack() {
    if (!audioComponent || !script.musicTracks || script.musicTracks.length === 0) return;
    
    audioComponent.stop();
    
    if (isShuffle) {
        var newIndex;
        if (script.musicTracks.length > 1) {
            do {
                newIndex = Math.floor(Math.random() * script.musicTracks.length);
            } while (newIndex === currentTrackIndex);
            currentTrackIndex = newIndex;
        }
    } else {
        currentTrackIndex = (currentTrackIndex - 1 + script.musicTracks.length) % script.musicTracks.length;
    }
    
    audioComponent.audioTrack = script.musicTracks[currentTrackIndex];
    updateTrackInfo();
    
    if (isPlaying) {
        audioComponent.play(1);
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
        audioComponent.stop();
        audioComponent.play(1);
        logDebug("Repeating track: " + script.musicTracks[currentTrackIndex].name);
    } else {
        nextTrack();
    }
}

function updateTrackInfo() {
    if (!script.musicTracks || currentTrackIndex >= script.musicTracks.length) return;
    
    var currentTrack = script.musicTracks[currentTrackIndex];
    var trackName = currentTrack.name || "";
    var artistName = "", yearLabel = "";
    
    var match = trackName.match(/^(.*?)\s*-\s*(.*?)(?:\s*\((\d{4})\))?$/);
    if (match) {
        artistName = match[1] || "";
        trackName = match[2] || "";
        yearLabel = match[3] || "";
    }
    
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
    if (!isPlaying || !audioComponent || !audioComponent.isPlaying()) return;
    
    var currentTime = audioComponent.getTime();
    var totalDuration = audioComponent.getDuration();
    
    if (totalDuration <= 0) return;
    
    var progress = currentTime / totalDuration;
    updateTimecode(currentTime, totalDuration);
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
    
    var newPosition = vec3.lerp(startPosition, endPosition, progress);
    script.progressSphere.getTransform().setLocalPosition(newPosition);
    
    var currentRotation = script.progressSphere.getTransform().getLocalRotation();
    var rotationIncrement = quat.angleAxis(0.01, vec3.up());
    script.progressSphere.getTransform().setLocalRotation(currentRotation.multiply(rotationIncrement));
}

function updateUI() {
    if (!script.useCustomUI) return;
    
    if (script.playButtonImage && script.pauseButtonImage) {
        script.playButtonImage.enabled = !isPlaying;
        script.pauseButtonImage.enabled = isPlaying;
    }
    
    if (script.shuffleActiveImage && script.shuffleInactiveImage) {
        script.shuffleActiveImage.enabled = isShuffle;
        script.shuffleInactiveImage.enabled = !isShuffle;
    }
    
    if (script.repeatActiveImage && script.repeatInactiveImage) {
        script.repeatActiveImage.enabled = isRepeat;
        script.repeatInactiveImage.enabled = !isRepeat;
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

initialize();