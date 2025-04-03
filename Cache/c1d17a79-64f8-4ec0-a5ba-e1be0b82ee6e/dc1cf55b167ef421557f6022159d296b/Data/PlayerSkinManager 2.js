// Define inputs for the pinch buttons and skins
// @ui {"widget":"group_start", "label":"Pinch Buttons"}
// @input Component.ScriptComponent pinchButtonSkinY2K {"label":"Pinch Button Skin Y2K"}
// @input Component.ScriptComponent pinchButtonHandY2K {"label":"Pinch Button Hand Y2K"}
// @input Component.ScriptComponent pinchButtonSkinModern {"label":"Pinch Button Skin Modern"}
// @input Component.ScriptComponent pinchButtonHandModern {"label":"Pinch Button Hand Modern"}
// @input Component.ScriptComponent pinchButtonHandHand {"label":"Pinch Button Hand Hand"}
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

// Validate inputs
function validateInputs() {
    if (!script.pinchButtonSkinY2K) { print("Error: Pinch Button Skin Y2K is not assigned!"); return false; }
    if (!script.pinchButtonHandY2K) { print("Error: Pinch Button Hand Y2K is not assigned!"); return false; }
    if (!script.pinchButtonSkinModern) { print("Error: Pinch Button Skin Modern is not assigned!"); return false; }
    if (!script.pinchButtonHandModern) { print("Error: Pinch Button Hand Modern is not assigned!"); return false; }
    if (!script.pinchButtonHandHand) { print("Error: Pinch Button Hand Hand is not assigned!"); return false; }
    if (!script.musicPlayerY2K) { print("Error: Music Player Y2K is not assigned!"); return false; }
    if (!script.musicPlayerModern) { print("Error: Music Player Modern is not assigned!"); return false; }
    if (!script.musicPlayerHand) { print("Error: Music Player Hand is not assigned!"); return false; }
    if (!script.audioY2K) { print("Error: Audio Component Y2K is not assigned!"); return false; }
    if (!script.audioModern) { print("Error: Audio Component Modern is not assigned!"); return false; }
    if (!script.audioHand) { print("Error: Audio Component Hand is not assigned!"); return false; }
    return true;
}

// Stop and reset all audio components
function stopAllAudio() {
    if (script.audioY2K && script.audioY2K.isPlaying()) {
        script.audioY2K.stop(true);
        script.audioY2K.position = 0;
        print("Audio Y2K stopped and reset.");
    }
    if (script.audioModern && script.audioModern.isPlaying()) {
        script.audioModern.stop(true);
        script.audioModern.position = 0;
        print("Audio Modern stopped and reset.");
    }
    if (script.audioHand && script.audioHand.isPlaying()) {
        script.audioHand.stop(true);
        script.audioHand.position = 0;
        print("Audio Hand stopped and reset.");
    }
}

// Disable all skins
function disableAllSkins() {
    script.musicPlayerY2K.enabled = false;
    script.musicPlayerModern.enabled = false;
    script.musicPlayerHand.enabled = false;
}

// Switch to Y2K skin
function switchToY2K() {
    print("Switching to Y2K skin...");
    stopAllAudio();
    disableAllSkins();
    script.musicPlayerY2K.enabled = true;
    script.pinchButtonSkinY2K.onButtonPinched.add(function() { switchToModern(); });
    script.pinchButtonHandY2K.onButtonPinched.add(function() { switchToHand(); });
    print("Switched to Y2K skin.");
}

// Switch to Modern skin
function switchToModern() {
    print("Switching to Modern skin...");
    stopAllAudio();
    disableAllSkins();
    script.musicPlayerModern.enabled = true;
    script.pinchButtonSkinModern.onButtonPinched.add(function() { switchToY2K(); });
    script.pinchButtonHandModern.onButtonPinched.add(function() { switchToHand(); });
    print("Switched to Modern skin.");
}

// Switch to Hand skin
function switchToHand() {
    print("Switching to Hand skin...");
    stopAllAudio();
    disableAllSkins();
    script.musicPlayerHand.enabled = true;
    script.pinchButtonHandHand.onButtonPinched.add(function() { switchToY2K(); });
    print("Switched to Hand skin.");
}

// Cleanup function to remove all event listeners
function cleanup() {
    script.pinchButtonSkinY2K.onButtonPinched.removeAll();
    script.pinchButtonHandY2K.onButtonPinched.removeAll();
    script.pinchButtonSkinModern.onButtonPinched.removeAll();
    script.pinchButtonHandModern.onButtonPinched.removeAll();
    script.pinchButtonHandHand.onButtonPinched.removeAll();
    stopAllAudio();
}

// Initialize the script
if (validateInputs()) {
    // Initially deactivate Modern and Hand skins
    script.musicPlayerModern.enabled = false;
    script.musicPlayerHand.enabled = false;
    // Activate Y2K skin by default
    script.musicPlayerY2K.enabled = true;
    script.pinchButtonSkinY2K.onButtonPinched.add(function() { switchToModern(); });
    script.pinchButtonHandY2K.onButtonPinched.add(function() { switchToHand(); });
    print("Script initialized with Y2K skin active.");
} else {
    print("Script initialization failed due to invalid inputs.");
}

// Cleanup when the script is destroyed
script.destroy = function() {
    cleanup();
};