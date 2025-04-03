// @ui {"widget":"group_start", "label":"Pinch Buttons Y2K"}
// @input Component.ScriptComponent playPauseButtonY2K {"label":"Play/Pause Button"}
// @input Component.ScriptComponent nextTrackButtonY2K {"label":"Next Track Button"}
// @input Component.ScriptComponent prevTrackButtonY2K {"label":"Previous Track Button"}
// @input Component.ScriptComponent repeatButtonY2K {"label":"Repeat Button"}
// @input Component.ScriptComponent shuffleButtonY2K {"label":"Shuffle Button"}
// @input Component.ScriptComponent stopButtonY2K {"label":"Stop Button"}
// @input Component.ScriptComponent skinButtonY2K {"label":"Switch to Modern"}
// @input Component.ScriptComponent handButtonY2K {"label":"Switch to Hand"}
// @ui {"widget":"group_end"}
// @ui {"widget":"group_start", "label":"Pinch Buttons Modern"}
// @input Component.ScriptComponent playPauseButtonModern {"label":"Play/Pause Button"}
// @input Component.ScriptComponent nextTrackButtonModern {"label":"Next Track Button"}
// @input Component.ScriptComponent prevTrackButtonModern {"label":"Previous Track Button"}
// @input Component.ScriptComponent repeatButtonModern {"label":"Repeat Button"}
// @input Component.ScriptComponent shuffleButtonModern {"label":"Shuffle Button"}
// @input Component.ScriptComponent stopButtonModern {"label":"Stop Button"}
// @input Component.ScriptComponent skinButtonModern {"label":"Switch to Y2K"}
// @input Component.ScriptComponent handButtonModern {"label":"Switch to Hand"}
// @ui {"widget":"group_end"}
// @ui {"widget":"group_start", "label":"Pinch Buttons Hand"}
// @input Component.ScriptComponent playPauseButtonHand {"label":"Play/Pause Button"}
// @input Component.ScriptComponent nextTrackButtonHand {"label":"Next Track Button"}
// @input Component.ScriptComponent prevTrackButtonHand {"label":"Previous Track Button"}
// @input Component.ScriptComponent repeatButtonHand {"label":"Repeat Button"}
// @input Component.ScriptComponent shuffleButtonHand {"label":"Shuffle Button"}
// @input Component.ScriptComponent stopButtonHand {"label":"Stop Button"}
// @input Component.ScriptComponent handButtonHand {"label":"Switch to Y2K"}
// @ui {"widget":"group_end"}
// @ui {"widget":"group_start", "label":"Skins"}
// @input SceneObject musicPlayerY2K {"label":"Music Player Y2K"}
// @input SceneObject musicPlayerModern {"label":"Music Player Modern"}
// @input SceneObject musicPlayerHand {"label":"Music Player Hand"}
// @ui {"widget":"group_end"}
// @ui {"widget":"group_start", "label":"Audio Components"}
// @input Component.AudioComponent audioY2K {"label":"Audio Component Y2K"}
// @input Component.AudioComponent audioModern {"label":"Audio Component Modern"}
// @input Component.AudioComponent audioHand {"label":"Audio Component Hand"}
// @ui {"widget":"group_end"}
// @ui {"widget":"group_start", "label":"Tracks"}
// @input Object track1 {"label":"Track 1"}
// @input Object track2 {"label":"Track 2"}
// @input Object track3 {"label":"Track 3"}
// @input Object track4 {"label":"Track 4"}
// @input Object track5 {"label":"Track 5"}
// @input string artist1 {"label":"Artist 1"}
// @input string artist2 {"label":"Artist 2"}
// @input string artist3 {"label":"Artist 3"}
// @input string artist4 {"label":"Artist 4"}
// @input string artist5 {"label":"Artist 5"}
// @input string title1 {"label":"Title 1"}
// @input string title2 {"label":"Title 2"}
// @input string title3 {"label":"Title 3"}
// @input string title4 {"label":"Title 4"}
// @input string title5 {"label":"Title 5"}
// @ui {"widget":"group_end"}
// @ui {"widget":"group_start", "label":"Track Prefabs Y2K"}
// @input SceneObject trackPrefabY2K1 {"label":"Track Prefab Y2K 1"}
// @input SceneObject trackPrefabY2K2 {"label":"Track Prefab Y2K 2"}
// @input SceneObject trackPrefabY2K3 {"label":"Track Prefab Y2K 3"}
// @input SceneObject trackPrefabY2K4 {"label":"Track Prefab Y2K 4"}
// @input SceneObject trackPrefabY2K5 {"label":"Track Prefab Y2K 5"}
// @input SceneObject stoppedPrefabY2K {"label":"Stopped Prefab Y2K"}
// @ui {"widget":"group_end"}
// @ui {"widget":"group_start", "label":"Track Prefabs Modern"}
// @input SceneObject trackPrefabModern1 {"label":"Track Prefab Modern 1"}
// @input SceneObject trackPrefabModern2 {"label":"Track Prefab Modern 2"}
// @input SceneObject trackPrefabModern3 {"label":"Track Prefab Modern 3"}
// @input SceneObject trackPrefabModern4 {"label":"Track Prefab Modern 4"}
// @input SceneObject trackPrefabModern5 {"label":"Track Prefab Modern 5"}
// @input SceneObject stoppedPrefabModern {"label":"Stopped Prefab Modern"}
// @ui {"widget":"group_end"}
// @ui {"widget":"group_start", "label":"Track Prefabs Hand"}
// @input SceneObject trackPrefabHand1 {"label":"Track Prefab Hand 1"}
// @input SceneObject trackPrefabHand2 {"label":"Track Prefab Hand 2"}
// @input SceneObject trackPrefabHand3 {"label":"Track Prefab Hand 3"}
// @input SceneObject trackPrefabHand4 {"label":"Track Prefab Hand 4"}
// @input SceneObject trackPrefabHand5 {"label":"Track Prefab Hand 5"}
// @input SceneObject stoppedPrefabHand {"label":"Stopped Prefab Hand"}
// @ui {"widget":"group_end"}
// @ui {"widget":"group_start", "label":"Metadata Y2K"}
// @input Component.Text artistNameTextY2K {"label":"Artist Name Text"}
// @input Component.Text timecodeTextY2K {"label":"Timecode Text"}
// @input Component.Text trackTitleTextY2K {"label":"Track Title Text"}
// @input SceneObject progressBarY2K {"label":"Progress Bar"}
// @input SceneObject earthSphereY2K {"label":"Earth Sphere"}
// @ui {"widget":"group_end"}
// @ui {"widget":"group_start", "label":"Metadata Modern"}
// @input Component.Text artistNameTextModern {"label":"Artist Name Text"}
// @input Component.Text timecodeTextModern {"label":"Timecode Text"}
// @input Component.Text trackTitleTextModern {"label":"Track Title Text"}
// @input SceneObject progressBarModern {"label":"Progress Bar"}
// @input SceneObject earthSphereModern {"label":"Earth Sphere"}
// @ui {"widget":"group_end"}
// @ui {"widget":"group_start", "label":"Options"}
// @input bool loopPlayback {"label":"Loop Playback", "default":true}
// @input number earthSphereXOffset {"label":"Earth Sphere X Offset", "default":0}
// @input number rotationSpeed {"label":"Earth Sphere Rotation Speed", "default":30.0}
// @ui {"widget":"group_end"}

// Expose the script as a component
script.api.MusicPlayerController = script;

// State variables
var currentSkin = "Y2K";
var currentTrackIndex = -1; // -1 means no track loaded
var isPlaying = false;
var isPaused = false;
var isRepeatEnabled = false;
var isShuffleEnabled = false;
var trackStartTime = 0;
var currentPlaybackTime = 0;
var audioInitialized = false;
var currentActivePrefab = null;
var lastPinchTime = 0; // Debounce

// Arrays for tracks, artists, titles, and prefabs
var tracks = [];
var artists = [];
var titles = [];
var trackPrefabsY2K = [];
var trackPrefabsModern = [];
var trackPrefabsHand = [];

// Validate inputs
function validateInputs() {
    var requiredButtons = [
        script.playPauseButtonY2K, script.nextTrackButtonY2K, script.prevTrackButtonY2K,
        script.repeatButtonY2K, script.shuffleButtonY2K, script.stopButtonY2K,
        script.skinButtonY2K, script.handButtonY2K,
        script.playPauseButtonModern, script.nextTrackButtonModern, script.prevTrackButtonModern,
        script.repeatButtonModern, script.shuffleButtonModern, script.stopButtonModern,
        script.skinButtonModern, script.handButtonModern,
        script.playPauseButtonHand, script.nextTrackButtonHand, script.prevTrackButtonHand,
        script.repeatButtonHand, script.shuffleButtonHand, script.stopButtonHand,
        script.handButtonHand
    ];
    if (requiredButtons.some(btn => !btn)) {
        print("Error: One or more pinch buttons are not assigned!");
        return false;
    }
    if (!script.musicPlayerY2K || !script.musicPlayerModern || !script.musicPlayerHand) {
        print("Error: One or more skins are not assigned!");
        return false;
    }
    if (!script.audioY2K || !script.audioModern || !script.audioHand) {
        print("Error: One or more audio components are not assigned!");
        return false;
    }
    // Validate tracks with casting
    tracks = [
        script.track1 ? script.track1 : null,
        script.track2 ? script.track2 : null,
        script.track3 ? script.track3 : null,
        script.track4 ? script.track4 : null,
        script.track5 ? script.track5 : null
    ];
    if (tracks.some(track => !track)) {
        print("Error: All 5 audio tracks must be assigned!");
        return false;
    }
    // Validate artists
    artists = [script.artist1, script.artist2, script.artist3, script.artist4, script.artist5];
    if (artists.some(artist => !artist)) {
        print("Error: All 5 artists must be assigned!");
        return false;
    }
    // Validate titles
    titles = [script.title1, script.title2, script.title3, script.title4, script.title5];
    if (titles.some(title => !title)) {
        print("Error: All 5 titles must be assigned!");
        return false;
    }
    // Validate Y2K prefabs
    trackPrefabsY2K = [script.trackPrefabY2K1, script.trackPrefabY2K2, script.trackPrefabY2K3, script.trackPrefabY2K4, script.trackPrefabY2K5];
    if (trackPrefabsY2K.some(prefab => !prefab) || !script.stoppedPrefabY2K) {
        print("Error: Y2K requires exactly 5 track prefabs and a stopped prefab!");
        return false;
    }
    // Validate Modern prefabs
    trackPrefabsModern = [script.trackPrefabModern1, script.trackPrefabModern2, script.trackPrefabModern3, script.trackPrefabModern4, script.trackPrefabModern5];
    if (trackPrefabsModern.some(prefab => !prefab) || !script.stoppedPrefabModern) {
        print("Error: Modern requires exactly 5 track prefabs and a stopped prefab!");
        return false;
    }
    // Validate Hand prefabs
    trackPrefabsHand = [script.trackPrefabHand1, script.trackPrefabHand2, script.trackPrefabHand3, script.trackPrefabHand4, script.trackPrefabHand5];
    if (trackPrefabsHand.some(prefab => !prefab) || !script.stoppedPrefabHand) {
        print("Error: Hand requires exactly 5 track prefabs and a stopped prefab!");
        return false;
    }
    if (!script.artistNameTextY2K || !script.timecodeTextY2K || !script.trackTitleTextY2K ||
        !script.progressBarY2K || !script.earthSphereY2K) {
        print("Error: Y2K metadata components are not assigned!");
        return false;
    }
    if (!script.artistNameTextModern || !script.timecodeTextModern || !script.trackTitleTextModern ||
        !script.progressBarModern || !script.earthSphereModern) {
        print("Error: Modern metadata components are not assigned!");
        return false;
    }
    return true;
}

// Stop and reset audio
function stopAudio(audioComponent) {
    if (audioComponent && audioComponent.isPlaying()) {
        audioComponent.stop(true);
    }
    audioComponent.position = 0;
    audioComponent.audioTrack = null;
}

// Stop all audio components
function stopAllAudio() {
    stopAudio(script.audioY2K);
    stopAudio(script.audioModern);
    stopAudio(script.audioHand);
    isPlaying = false;
    isPaused = false;
    audioInitialized = false;
}

// Disable all skins
function disableAllSkins() {
    script.musicPlayerY2K.enabled = false;
    script.musicPlayerModern.enabled = false;
    script.musicPlayerHand.enabled = false;
}

// Clear button events for a skin
function clearButtonEvents(skin) {
    if (skin === "Y2K") {
        script.playPauseButtonY2K.onButtonPinched.removeAll();
        script.nextTrackButtonY2K.onButtonPinched.removeAll();
        script.prevTrackButtonY2K.onButtonPinched.removeAll();
        script.repeatButtonY2K.onButtonPinched.removeAll();
        script.shuffleButtonY2K.onButtonPinched.removeAll();
        script.stopButtonY2K.onButtonPinched.removeAll();
        script.skinButtonY2K.onButtonPinched.removeAll();
        script.handButtonY2K.onButtonPinched.removeAll();
    } else if (skin === "Modern") {
        script.playPauseButtonModern.onButtonPinched.removeAll();
        script.nextTrackButtonModern.onButtonPinched.removeAll();
        script.prevTrackButtonModern.onButtonPinched.removeAll();
        script.repeatButtonModern.onButtonPinched.removeAll();
        script.shuffleButtonModern.onButtonPinched.removeAll();
        script.stopButtonModern.onButtonPinched.removeAll();
        script.skinButtonModern.onButtonPinched.removeAll();
        script.handButtonModern.onButtonPinched.removeAll();
    } else if (skin === "Hand") {
        script.playPauseButtonHand.onButtonPinched.removeAll();
        script.nextTrackButtonHand.onButtonPinched.removeAll();
        script.prevTrackButtonHand.onButtonPinched.removeAll();
        script.repeatButtonHand.onButtonPinched.removeAll();
        script.shuffleButtonHand.onButtonPinched.removeAll();
        script.stopButtonHand.onButtonPinched.removeAll();
        script.handButtonHand.onButtonPinched.removeAll();
    }
}

// Bind player controls for a skin
function bindPlayerControls(skin, audioComponent) {
    if (skin === "Y2K") {
        script.playPauseButtonY2K.onButtonPinched.add(function() { togglePlayPause(audioComponent); });
        script.nextTrackButtonY2K.onButtonPinched.add(function() { nextTrack(audioComponent); });
        script.prevTrackButtonY2K.onButtonPinched.add(function() { prevTrack(audioComponent); });
        script.repeatButtonY2K.onButtonPinched.add(function() { isRepeatEnabled = !isRepeatEnabled; });
        script.shuffleButtonY2K.onButtonPinched.add(function() { isShuffleEnabled = !isShuffleEnabled; });
        script.stopButtonY2K.onButtonPinched.add(function() { stopTrack(audioComponent); });
        script.skinButtonY2K.onButtonPinched.add(function() { switchToModern(); });
        script.handButtonY2K.onButtonPinched.add(function() { switchToHand(); });
    } else if (skin === "Modern") {
        script.playPauseButtonModern.onButtonPinched.add(function() { togglePlayPause(audioComponent); });
        script.nextTrackButtonModern.onButtonPinched.add(function() { nextTrack(audioComponent); });
        script.prevTrackButtonModern.onButtonPinched.add(function() { prevTrack(audioComponent); });
        script.repeatButtonModern.onButtonPinched.add(function() { isRepeatEnabled = !isRepeatEnabled; });
        script.shuffleButtonModern.onButtonPinched.add(function() { isShuffleEnabled = !isShuffleEnabled; });
        script.stopButtonModern.onButtonPinched.add(function() { stopTrack(audioComponent); });
        script.skinButtonModern.onButtonPinched.add(function() { switchToY2K(); });
        script.handButtonModern.onButtonPinched.add(function() { switchToHand(); });
    } else if (skin === "Hand") {
        script.playPauseButtonHand.onButtonPinched.add(function() { togglePlayPause(audioComponent); });
        script.nextTrackButtonHand.onButtonPinched.add(function() { nextTrack(audioComponent); });
        script.prevTrackButtonHand.onButtonPinched.add(function() { prevTrack(audioComponent); });
        script.repeatButtonHand.onButtonPinched.add(function() { isRepeatEnabled = !isRepeatEnabled; });
        script.shuffleButtonHand.onButtonPinched.add(function() { isShuffleEnabled = !isShuffleEnabled; });
        script.stopButtonHand.onButtonPinched.add(function() { stopTrack(audioComponent); });
        script.handButtonHand.onButtonPinched.add(function() { switchToY2K(); });
    }
    audioComponent.setOnFinish(function() { handleTrackFinished(audioComponent); });
}

// Switch skin functions
function switchToY2K() {
    stopAllAudio();
    disableAllSkins();
    clearButtonEvents(currentSkin);
    script.musicPlayerY2K.enabled = true;
    bindPlayerControls("Y2K", script.audioY2K);
    currentSkin = "Y2K";
    if (currentTrackIndex !== -1) {
        loadTrack(currentTrackIndex, script.audioY2K);
        if (isPlaying) playTrack(script.audioY2K);
    }
    updateTrackInfo();
    updateActivePrefab();
}

function switchToModern() {
    stopAllAudio();
    disableAllSkins();
    clearButtonEvents(currentSkin);
    script.musicPlayerModern.enabled = true;
    bindPlayerControls("Modern", script.audioModern);
    currentSkin = "Modern";
    if (currentTrackIndex !== -1) {
        loadTrack(currentTrackIndex, script.audioModern);
        if (isPlaying) playTrack(script.audioModern);
    }
    updateTrackInfo();
    updateActivePrefab();
}

function switchToHand() {
    stopAllAudio();
    disableAllSkins();
    clearButtonEvents(currentSkin);
    script.musicPlayerHand.enabled = true;
    bindPlayerControls("Hand", script.audioHand);
    currentSkin = "Hand";
    if (currentTrackIndex !== -1) {
        loadTrack(currentTrackIndex, script.audioHand);
        if (isPlaying) playTrack(script.audioHand);
    }
    updateTrackInfo();
    updateActivePrefab();
}

// Player control functions
function togglePlayPause(audioComponent) {
    var currentTime = getTime();
    if (currentTime - lastPinchTime < 0.5) return; // Debounce
    lastPinchTime = currentTime;

    if (isPlaying) {
        audioComponent.pause();
        isPlaying = false;
        isPaused = true;
        currentPlaybackTime = getTime() - trackStartTime;
    } else if (isPaused) {
        audioComponent.resume();
        isPlaying = true;
        isPaused = false;
        trackStartTime = getTime() - currentPlaybackTime;
    } else {
        if (currentTrackIndex === -1) loadTrack(0, audioComponent);
        playTrack(audioComponent);
    }
}

function playTrack(audioComponent) {
    if (!isPlaying && audioComponent && audioComponent.audioTrack && audioInitialized) {
        audioComponent.play(1);
        isPlaying = true;
        isPaused = false;
        trackStartTime = getTime();
        currentPlaybackTime = 0;
    }
}

function stopTrack(audioComponent) {
    stopAudio(audioComponent);
    currentTrackIndex = -1;
    currentPlaybackTime = 0;
    updateTrackInfo();
    updateActivePrefab();
}

function nextTrack(audioComponent) {
    var wasPlaying = isPlaying;
    var nextIndex = isRepeatEnabled ? currentTrackIndex :
                    isShuffleEnabled ? Math.floor(Math.random() * tracks.length) :
                    currentTrackIndex + 1;
    if (nextIndex >= tracks.length) nextIndex = script.loopPlayback ? 0 : -1;
    if (nextIndex === -1) stopTrack(audioComponent);
    else {
        loadTrack(nextIndex, audioComponent);
        if (wasPlaying) playTrack(audioComponent);
    }
}

function prevTrack(audioComponent) {
    var wasPlaying = isPlaying;
    var prevIndex = isRepeatEnabled ? currentTrackIndex :
                    isShuffleEnabled ? Math.floor(Math.random() * tracks.length) :
                    currentTrackIndex - 1;
    if (prevIndex < 0) prevIndex = tracks.length - 1;
    loadTrack(prevIndex, audioComponent);
    if (wasPlaying) playTrack(audioComponent);
}

function loadTrack(index, audioComponent) {
    if (index >= 0 && index < tracks.length) {
        stopAudio(audioComponent);
        currentTrackIndex = index;
        audioComponent.audioTrack = tracks[index];
        audioInitialized = true;
        trackStartTime = getTime();
        currentPlaybackTime = 0;
        updateTrackInfo();
        updateActivePrefab();
    }
}

function handleTrackFinished(audioComponent) {
    if (isRepeatEnabled) {
        loadTrack(currentTrackIndex, audioComponent);
        playTrack(audioComponent);
    } else if (isShuffleEnabled) {
        nextTrack(audioComponent);
    } else if (currentTrackIndex < tracks.length - 1 || script.loopPlayback) {
        nextTrack(audioComponent);
    } else {
        stopTrack(audioComponent);
    }
}

// UI and visualization updates
function updateTrackInfo() {
    if (currentSkin === "Y2K") {
        script.artistNameTextY2K.text = currentTrackIndex === -1 ? "No track" : artists[currentTrackIndex];
        script.trackTitleTextY2K.text = currentTrackIndex === -1 ? "Stopped" : titles[currentTrackIndex];
    } else if (currentSkin === "Modern") {
        script.artistNameTextModern.text = currentTrackIndex === -1 ? "No track" : artists[currentTrackIndex];
        script.trackTitleTextModern.text = currentTrackIndex === -1 ? "Stopped" : titles[currentTrackIndex];
    }
}

function updateActivePrefab() {
    if (currentActivePrefab) currentActivePrefab.enabled = false;
    if (currentSkin === "Y2K") {
        currentActivePrefab = currentTrackIndex === -1 ? script.stoppedPrefabY2K : trackPrefabsY2K[currentTrackIndex];
    } else if (currentSkin === "Modern") {
        currentActivePrefab = currentTrackIndex === -1 ? script.stoppedPrefabModern : trackPrefabsModern[currentTrackIndex];
    } else if (currentSkin === "Hand") {
        currentActivePrefab = currentTrackIndex === -1 ? script.stoppedPrefabHand : trackPrefabsHand[currentTrackIndex];
    }
    if (currentActivePrefab) currentActivePrefab.enabled = true;
}

function updatePlayer() {
    var audioComponent = currentSkin === "Y2K" ? script.audioY2K :
                         currentSkin === "Modern" ? script.audioModern : script.audioHand;
    var timecodeText = currentSkin === "Y2K" ? script.timecodeTextY2K :
                       currentSkin === "Modern" ? script.timecodeTextModern : null;
    var progressBar = currentSkin === "Y2K" ? script.progressBarY2K :
                      currentSkin === "Modern" ? script.progressBarModern : null;
    var earthSphere = currentSkin === "Y2K" ? script.earthSphereY2K :
                      currentSkin === "Modern" ? script.earthSphereModern : null;

    if (!audioInitialized || !audioComponent.audioTrack) {
        if (timecodeText) timecodeText.text = "00:00 / 00:00";
        if (progressBar && earthSphere) updateEarthPosition(0, 1, progressBar, earthSphere);
        return;
    }
    var currentTime = isPlaying ? getTime() - trackStartTime : currentPlaybackTime;
    var totalTime = audioComponent.duration || 0;
    if (timecodeText) timecodeText.text = formatTime(currentTime) + " / " + formatTime(totalTime);
    if (progressBar && earthSphere) updateEarthPosition(currentTime, totalTime, progressBar, earthSphere);
}

function updateEarthPosition(currentTime, totalTime, progressBar, earthSphere) {
    if (totalTime > 0) {
        var progress = Math.min(Math.max(currentTime / totalTime, 0), 1);
        var barScale = progressBar.getTransform().getLocalScale();
        var barPosition = progressBar.getTransform().getLocalPosition();
        var halfLength = barScale.x / 2;
        var localX = -halfLength + (progress * barScale.x) + script.earthSphereXOffset;
        earthSphere.getTransform().setLocalPosition(new vec3(localX, barPosition.y, barPosition.z));
    }
}

function updateSphereRotation() {
    var earthSphere = currentSkin === "Y2K" ? script.earthSphereY2K :
                      currentSkin === "Modern" ? script.earthSphereModern : null;
    if (earthSphere && isPlaying) {
        var deltaTime = getDeltaTime();
        var currentRotation = earthSphere.getTransform().getLocalRotation();
        var rotationDelta = quat.fromEulerAngles(0, script.rotationSpeed * deltaTime * (Math.PI / 180), 0);
        earthSphere.getTransform().setLocalRotation(currentRotation.multiply(rotationDelta));
    }
}

function formatTime(timeInSeconds) {
    var minutes = Math.floor(timeInSeconds / 60);
    var seconds = Math.floor(timeInSeconds % 60);
    return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
}

// Initialization
if (validateInputs()) {
    trackPrefabsY2K.forEach(function(prefab) { prefab.enabled = false; });
    trackPrefabsModern.forEach(function(prefab) { prefab.enabled = false; });
    trackPrefabsHand.forEach(function(prefab) { prefab.enabled = false; });
    script.stoppedPrefabY2K.enabled = false;
    script.stoppedPrefabModern.enabled = false;
    script.stoppedPrefabHand.enabled = false;

    script.musicPlayerModern.enabled = false;
    script.musicPlayerHand.enabled = false;
    script.musicPlayerY2K.enabled = true;
    bindPlayerControls("Y2K", script.audioY2K);
    currentSkin = "Y2K";

    script.createEvent("UpdateEvent").bind(function() {
        updatePlayer();
        updateSphereRotation();
    });

    updateTrackInfo();
    updateActivePrefab();
    print("Music player initialized successfully with 5 tracks.");
} else {
    print("Initialization failed due to invalid inputs.");
}