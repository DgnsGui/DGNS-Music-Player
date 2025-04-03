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
// @input SceneObject musicPlayerManagerY2K {"label":"Music Player Manager Y2K"}
// @input SceneObject musicPlayerManagerModern {"label":"Music Player Manager Modern"}
// @input SceneObject musicPlayerManagerHand {"label":"Music Player Manager Hand"}
// @ui {"widget":"group_end"}
// @ui {"widget":"group_start", "label":"Audio Components"}
// @input Component.AudioComponent audioY2K {"label":"Audio Component Y2K"}
// @input Component.AudioComponent audioModern {"label":"Audio Component Modern"}
// @input Component.AudioComponent audioHand {"label":"Audio Component Hand"}
// @ui {"widget":"group_end"}

// Ensure the script is recognized as a component in Lens Studio
script.api.PlayerSkinManager = script;

// Store event handlers for dynamic binding
var pinchButtonSkinY2KHandler = null;
var pinchButtonHandY2KHandler = null;
var pinchButtonSkinModernHandler = null;
var pinchButtonHandModernHandler = null;
var pinchButtonHandHandHandler = null;

// Track the current active skin
var currentSkin = "Y2K"; // Default starting skin

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
    if (!script.musicPlayerManagerY2K) { print("Error: Music Player Manager Y2K is not assigned!"); return false; }
    if (!script.musicPlayerManagerModern) { print("Error: Music Player Manager Modern is not assigned!"); return false; }
    if (!script.musicPlayerManagerHand) { print("Error: Music Player Manager Hand is not assigned!"); return false; }
    if (!script.audioY2K) { print("Error: Audio Component Y2K is not assigned!"); return false; }
    if (!script.audioModern) { print("Error: Audio Component Modern is not assigned!"); return false; }
    if (!script.audioHand) { print("Error: Audio Component Hand is not assigned!"); return false; }
    return true;
}

// Function to stop and reset an audio component
function stopAndResetAudio(audioComponent, name) {
    if (audioComponent) {
        if (audioComponent.isPlaying()) {
            audioComponent.stop(true); // Stop with fade
            print("Audio stopped for " + name);
        }
        audioComponent.position = 0; // Reset playback position to start
        print("Audio position reset to 0 for " + name);
    } else {
        print("Warning: Audio component not found for " + name);
    }
}

// Bind/Unbind functions for each button
function bindPinchButtonSkinY2K() {
    if (pinchButtonSkinY2KHandler) { unbindPinchButtonSkinY2K(); }
    if (script.pinchButtonSkinY2K && script.pinchButtonSkinY2K.onButtonPinched) {
        pinchButtonSkinY2KHandler = function() {
            print("Pinch Button Skin Y2K pressed.");
            switchToModern();
        };
        script.pinchButtonSkinY2K.onButtonPinched.add(pinchButtonSkinY2KHandler);
        print("Pinch Button Skin Y2K event bound successfully.");
    }
}

function unbindPinchButtonSkinY2K() {
    if (script.pinchButtonSkinY2K && script.pinchButtonSkinY2K.onButtonPinched && pinchButtonSkinY2KHandler) {
        script.pinchButtonSkinY2K.onButtonPinched.remove(pinchButtonSkinY2KHandler);
        pinchButtonSkinY2KHandler = null;
        print("Pinch Button Skin Y2K event unbound.");
    }
}

function bindPinchButtonHandY2K() {
    if (pinchButtonHandY2KHandler) { unbindPinchButtonHandY2K(); }
    if (script.pinchButtonHandY2K && script.pinchButtonHandY2K.onButtonPinched) {
        pinchButtonHandY2KHandler = function() {
            print("Pinch Button Hand Y2K pressed.");
            switchToHand();
        };
        script.pinchButtonHandY2K.onButtonPinched.add(pinchButtonHandY2KHandler);
        print("Pinch Button Hand Y2K event bound successfully.");
    }
}

function unbindPinchButtonHandY2K() {
    if (script.pinchButtonHandY2K && script.pinchButtonHandY2K.onButtonPinched && pinchButtonHandY2KHandler) {
        script.pinchButtonHandY2K.onButtonPinched.remove(pinchButtonHandY2KHandler);
        pinchButtonHandY2KHandler = null;
        print("Pinch Button Hand Y2K event unbound.");
    }
}

function bindPinchButtonSkinModern() {
    if (pinchButtonSkinModernHandler) { unbindPinchButtonSkinModern(); }
    if (script.pinchButtonSkinModern && script.pinchButtonSkinModern.onButtonPinched) {
        pinchButtonSkinModernHandler = function() {
            print("Pinch Button Skin Modern pressed.");
            switchToY2K();
        };
        script.pinchButtonSkinModern.onButtonPinched.add(pinchButtonSkinModernHandler);
        print("Pinch Button Skin Modern event bound successfully.");
    }
}

function unbindPinchButtonSkinModern() {
    if (script.pinchButtonSkinModern && script.pinchButtonSkinModern.onButtonPinched && pinchButtonSkinModernHandler) {
        script.pinchButtonSkinModern.onButtonPinched.remove(pinchButtonSkinModernHandler);
        pinchButtonSkinModernHandler = null;
        print("Pinch Button Skin Modern event unbound.");
    }
}

function bindPinchButtonHandModern() {
    if (pinchButtonHandModernHandler) { unbindPinchButtonHandModern(); }
    if (script.pinchButtonHandModern && script.pinchButtonHandModern.onButtonPinched) {
        pinchButtonHandModernHandler = function() {
            print("Pinch Button Hand Modern pressed.");
            switchToHand();
        };
        script.pinchButtonHandModern.onButtonPinched.add(pinchButtonHandModernHandler);
        print("Pinch Button Hand Modern event bound successfully.");
    }
}

function unbindPinchButtonHandModern() {
    if (script.pinchButtonHandModern && script.pinchButtonHandModern.onButtonPinched && pinchButtonHandModernHandler) {
        script.pinchButtonHandModern.onButtonPinched.remove(pinchButtonHandModernHandler);
        pinchButtonHandModernHandler = null;
        print("Pinch Button Hand Modern event unbound.");
    }
}

function bindPinchButtonHandHand() {
    if (pinchButtonHandHandHandler) { unbindPinchButtonHandHand(); }
    if (script.pinchButtonHandHand && script.pinchButtonHandHand.onButtonPinched) {
        pinchButtonHandHandHandler = function() {
            print("Pinch Button Hand Hand pressed.");
            switchToY2K();
        };
        script.pinchButtonHandHand.onButtonPinched.add(pinchButtonHandHandHandler);
        print("Pinch Button Hand Hand event bound successfully.");
    }
}

function unbindPinchButtonHandHand() {
    if (script.pinchButtonHandHand && script.pinchButtonHandHand.onButtonPinched && pinchButtonHandHandHandler) {
        script.pinchButtonHandHand.onButtonPinched.remove(pinchButtonHandHandHandler);
        pinchButtonHandHandHandler = null;
        print("Pinch Button Hand Hand event unbound.");
    }
}

// Switch skin functions with audio stop and reset
function switchToY2K() {
    print("Switching to Y2K skin...");
    stopAndResetAudio(script.audioModern, "Modern");
    stopAndResetAudio(script.audioHand, "Hand");
    script.musicPlayerModern.enabled = false;
    script.musicPlayerManagerModern.enabled = false;
    script.musicPlayerHand.enabled = false;
    script.musicPlayerManagerHand.enabled = false;
    unbindPinchButtonSkinModern();
    unbindPinchButtonHandModern();
    unbindPinchButtonHandHand();
    script.musicPlayerY2K.enabled = true;
    script.musicPlayerManagerY2K.enabled = true;
    bindPinchButtonSkinY2K(); // Skin button to Modern
    bindPinchButtonHandY2K(); // Hand button to Hand
    currentSkin = "Y2K";
    print("Switched to Y2K skin.");
}

function switchToModern() {
    print("Switching to Modern skin...");
    stopAndResetAudio(script.audioY2K, "Y2K");
    stopAndResetAudio(script.audioHand, "Hand");
    script.musicPlayerY2K.enabled = false;
    script.musicPlayerManagerY2K.enabled = false;
    script.musicPlayerHand.enabled = false;
    script.musicPlayerManagerHand.enabled = false;
    unbindPinchButtonSkinY2K();
    unbindPinchButtonHandY2K();
    unbindPinchButtonHandHand();
    script.musicPlayerModern.enabled = true;
    script.musicPlayerManagerModern.enabled = true;
    bindPinchButtonSkinModern(); // Skin button to Y2K
    bindPinchButtonHandModern(); // Hand button to Hand
    currentSkin = "Modern";
    print("Switched to Modern skin.");
}

function switchToHand() {
    print("Switching to Hand skin...");
    stopAndResetAudio(script.audioY2K, "Y2K");
    stopAndResetAudio(script.audioModern, "Modern");
    script.musicPlayerY2K.enabled = false;
    script.musicPlayerManagerY2K.enabled = false;
    script.musicPlayerModern.enabled = false;
    script.musicPlayerManagerModern.enabled = false;
    unbindPinchButtonSkinY2K();
    unbindPinchButtonHandY2K();
    unbindPinchButtonSkinModern();
    unbindPinchButtonHandModern();
    script.musicPlayerHand.enabled = true;
    script.musicPlayerManagerHand.enabled = true;
    bindPinchButtonHandHand(); // Hand button to Y2K
    currentSkin = "Hand";
    print("Switched to Hand skin.");
}

// Cleanup function
function cleanup() {
    unbindPinchButtonSkinY2K();
    unbindPinchButtonHandY2K();
    unbindPinchButtonSkinModern();
    unbindPinchButtonHandModern();
    unbindPinchButtonHandHand();
    stopAndResetAudio(script.audioY2K, "Y2K");
    stopAndResetAudio(script.audioModern, "Modern");
    stopAndResetAudio(script.audioHand, "Hand");
}

// Initialize the script
if (validateInputs()) {
    // Initially deactivate Modern and Hand skins
    script.musicPlayerModern.enabled = false;
    script.musicPlayerManagerModern.enabled = false;
    script.musicPlayerHand.enabled = false;
    script.musicPlayerManagerHand.enabled = false;
    // Activate Y2K skin by default
    script.musicPlayerY2K.enabled = true;
    script.musicPlayerManagerY2K.enabled = true;
    bindPinchButtonSkinY2K(); // Skin button to Modern
    bindPinchButtonHandY2K(); // Hand button to Hand
    currentSkin = "Y2K";
} else {
    print("Script initialization failed due to invalid inputs.");
}

// Cleanup when the script is destroyed
script.destroy = function() {
    cleanup();
};