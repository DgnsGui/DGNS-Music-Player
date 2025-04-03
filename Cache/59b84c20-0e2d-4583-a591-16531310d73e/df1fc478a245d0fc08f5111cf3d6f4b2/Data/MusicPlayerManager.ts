//@input Component.AudioComponent[] audioTracks
//@input SceneObject playButton
//@input SceneObject stopButton
//@input SceneObject nextButton
//@input SceneObject prevButton
//@input SceneObject loopButton
//@input SceneObject progressSphere

var currentTrackIndex = 0;
var isLooping = false;
var isPlaying = false;

function playTrack(index) {
    if (index < 0 || index >= script.audioTracks.length) return;
    stopAllTracks();
    script.audioTracks[index].play(1);
    isPlaying = true;
    updateProgress();
}

function stopAllTracks() {
    script.audioTracks.forEach(track => track.stop(false));
    isPlaying = false;
}

function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % script.audioTracks.length;
    playTrack(currentTrackIndex);
}

function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + script.audioTracks.length) % script.audioTracks.length;
    playTrack(currentTrackIndex);
}

function toggleLoop() {
    isLooping = !isLooping;
    script.audioTracks.forEach(track => track.loop = isLooping);
}

function updateProgress() {
    if (!isPlaying) return;
    var track = script.audioTracks[currentTrackIndex];
    if (!track.isPlaying()) return;
    
    var progress = track.getCurrentTime() / track.getDuration();
    script.progressSphere.getTransform().setLocalPosition(new vec3(progress * 10 - 5, 0, 0));
    
    script.createEvent("DelayedCallbackEvent").bind(updateProgress).reset(0.1);
}

// Assign button events
script.playButton.getComponent("Component.ScriptComponent").createEvent("TapEvent").bind(() => playTrack(currentTrackIndex));
script.stopButton.getComponent("Component.ScriptComponent").createEvent("TapEvent").bind(stopAllTracks);
script.nextButton.getComponent("Component.ScriptComponent").createEvent("TapEvent").bind(nextTrack);
script.prevButton.getComponent("Component.ScriptComponent").createEvent("TapEvent").bind(prevTrack);
script.loopButton.getComponent("Component.ScriptComponent").createEvent("TapEvent").bind(toggleLoop);

// Initialisation
script.audioTracks.forEach(track => track.loop = isLooping);
