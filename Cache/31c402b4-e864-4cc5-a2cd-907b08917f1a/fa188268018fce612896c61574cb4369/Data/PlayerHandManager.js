// Define inputs for the pinch buttons and skins
// @ui {"widget":"group_start", "label":"Pinch Buttons"}
// @input Component.ScriptComponent pinchButtonY2K {"label":"Pinch Button Y2K"}
// @input Component.ScriptComponent pinchButtonModern {"label":"Pinch Button Modern"}
// @input Component.ScriptComponent pinchButtonHand {"label":"Pinch Button Hand"}
// @ui {"widget":"group_end"}
// @ui {"widget":"group_start", "label":"Skins"}
// @input SceneObject musicPlayerY2K {"label":"Music Player Y2K"}
// @input SceneObject musicPlayerModern {"label":"Music Player Modern"}
// @input SceneObject musicPlayerHand {"label":"Music Player Hand"}
// @input SceneObject musicPlayerManagerY2K {"label":"Music Player Manager Y2K"}
// @input SceneObject musicPlayerManagerModern {"label":"Music Player Manager Modern"}
// @input SceneObject musicPlayerManagerHand {"label":"Music Player Manager Hand"}
// @ui {"widget":"group_end"}

// Ensure the script is recognized as a component in Lens Studio
script.api.PlayerSkinManager = script;

// Store event handlers for dynamic binding
var pinchButtonY2KHandler = null;
var pinchButtonModernHandler = null;
var pinchButtonHandHandler = null;

// Validate inputs
function validateInputs() {
    if (!script.pinchButtonY2K) { print("Error: Pinch Button Y2K is not assigned!"); return false; }
    if (!script.pinchButtonModern) { print("Error: Pinch Button Modern is not assigned!"); return false; }
    if (!script.pinchButtonHand) { print("Error: Pinch Button Hand is not assigned!"); return false; }
    if (!script.musicPlayerY2K) { print("Error: Music Player Y2K is not assigned!"); return false; }
    if (!script.musicPlayerModern) { print("Error: Music Player Modern is not assigned!"); return false; }
    if (!script.musicPlayerHand) { print("Error: Music Player Hand is not assigned!"); return false; }
    if (!script.musicPlayerManagerY2K) { print("Error: Music Player Manager Y2K is not assigned!"); return false; }
    if (!script.musicPlayerManagerModern) { print("Error: Music Player Manager Modern is not assigned!"); return false; }
    if (!script.musicPlayerManagerHand) { print("Error: Music Player Manager Hand is not assigned!"); return false; }
    return true;
}

// Bind/Unbind functions for each button
function bindPinchButtonY2K() {
    if (pinchButtonY2KHandler) { unbindPinchButtonY2K(); }
    if (script.pinchButtonY2K && script.pinchButtonY2K.onButtonPinched) {
        pinchButtonY2KHandler = function() {
            print("Pinch Button Y2K pressed.");
            switchToHand();
        };
        script.pinchButtonY2K.onButtonPinched.add(pinchButtonY2KHandler);
        print("Pinch Button Y2K event bound successfully.");
    }
}

function unbindPinchButtonY2K() {
    if (script.pinchButtonY2K && script.pinchButtonY2K.onButtonPinched && pinchButtonY2KHandler) {
        script.pinchButtonY2K.onButtonPinched.remove(pinchButtonY2KHandler);
        pinchButtonY2KHandler = null;
        print("Pinch Button Y2K event unbound.");
    }
}

function bindPinchButtonModern() {
    if (pinchButtonModernHandler) { unbindPinchButtonModern(); }
    if (script.pinchButtonModern && script.pinchButtonModern.onButtonPinched) {
        pinchButtonModernHandler = function() {
            print("Pinch Button Modern pressed.");
            switchToY2K();
        };
        script.pinchButtonModern.onButtonPinched.add(pinchButtonModernHandler);
        print("Pinch Button Modern event bound successfully.");
    }
}

function unbindPinchButtonModern() {
    if (script.pinchButtonModern && script.pinchButtonModern.onButtonPinched && pinchButtonModernHandler) {
        script.pinchButtonModern.onButtonPinched.remove(pinchButtonModernHandler);
        pinchButtonModernHandler = null;
        print("Pinch Button Modern event unbound.");
    }
}

function bindPinchButtonHand() {
    if (pinchButtonHandHandler) { unbindPinchButtonHand(); }
    if (script.pinchButtonHand && script.pinchButtonHand.onButtonPinched) {
        pinchButtonHandHandler = function() {
            print("Pinch Button Hand pressed.");
            switchToModern();
        };
        script.pinchButtonHand.onButtonPinched.add(pinchButtonHandHandler);
        print("Pinch Button Hand event bound successfully.");
    }
}

function unbindPinchButtonHand() {
    if (script.pinchButtonHand && script.pinchButtonHand.onButtonPinched && pinchButtonHandHandler) {
        script.pinchButtonHand.onButtonPinched.remove(pinchButtonHandHandler);
        pinchButtonHandHandler = null;
        print("Pinch Button Hand event unbound.");
    }
}

// Switch skin functions
function switchToY2K() {
    print("Switching to Y2K skin...");
    script.musicPlayerModern.enabled = false;
    script.musicPlayerManagerModern.enabled = false;
    script.musicPlayerHand.enabled = false;
    script.musicPlayerManagerHand.enabled = false;
    unbindPinchButtonModern();
    unbindPinchButtonHand();
    script.musicPlayerY2K.enabled = true;
    script.musicPlayerManagerY2K.enabled = true;
    bindPinchButtonY2K();
    print("Switched to Y2K skin.");
}

function switchToModern() {
    print("Switching to Modern skin...");
    script.musicPlayerY2K.enabled = false;
    script.musicPlayerManagerY2K.enabled = false;
    script.musicPlayerHand.enabled = false;
    script.musicPlayerManagerHand.enabled = false;
    unbindPinchButtonY2K();
    unbindPinchButtonHand();
    script.musicPlayerModern.enabled = true;
    script.musicPlayerManagerModern.enabled = true;
    bindPinchButtonModern();
    print("Switched to Modern skin.");
}

function switchToHand() {
    print("Switching to Hand skin...");
    script.musicPlayerY2K.enabled = false;
    script.musicPlayerManagerY2K.enabled = false;
    script.musicPlayerModern.enabled = false;
    script.musicPlayerManagerModern.enabled = false;
    unbindPinchButtonY2K();
    unbindPinchButtonModern();
    script.musicPlayerHand.enabled = true;
    script.musicPlayerManagerHand.enabled = true;
    bindPinchButtonHand();
    print("Switched to Hand skin.");
}

// Cleanup function
function cleanup() {
    unbindPinchButtonY2K();
    unbindPinchButtonModern();
    unbindPinchButtonHand();
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
    bindPinchButtonY2K();
} else {
    print("Script initialization failed due to invalid inputs.");
}

// Cleanup when the script is destroyed
script.destroy = function() {
    cleanup();
};