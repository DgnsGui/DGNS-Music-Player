// Define inputs for the pinch buttons and skins
// @ui {"widget":"group_start", "label":"Pinch Buttons"}
// @input Component.ScriptComponent pinchButtonY2K {"label":"Pinch Button Y2K"}
// @input Component.ScriptComponent pinchButtonModern {"label":"Pinch Button Modern"}
// @input SceneObject pinchButtonY2KObject {"label":"Pinch Button Y2K Object"}
// @input SceneObject pinchButtonModernObject {"label":"Pinch Button Modern Object"}
// @ui {"widget":"group_end"}
// @ui {"widget":"group_start", "label":"Skins"}
// @input SceneObject musicPlayerY2K {"label":"Music Player Y2K"}
// @input SceneObject musicPlayerModern {"label":"Music Player Modern"}
// @input SceneObject musicPlayerManagerY2K {"label":"Music Player Manager Y2K"}
// @input SceneObject musicPlayerManagerModern {"label":"Music Player Manager Modern"}
// @ui {"widget":"group_end"}

// Ensure the script is recognized as a component in Lens Studio
script.api.PlayerSkinManager = script;

// Store event handlers for cleanup
var pinchButtonY2KHandler = null;
var pinchButtonModernHandler = null;

// Validate inputs
function validateInputs() {
    if (!script.pinchButtonY2K) {
        print("Error: Pinch Button Y2K is not assigned!");
        return false;
    }
    if (!script.pinchButtonModern) {
        print("Error: Pinch Button Modern is not assigned!");
        return false;
    }
    if (!script.pinchButtonY2KObject) {
        print("Error: Pinch Button Y2K Object is not assigned!");
        return false;
    }
    if (!script.pinchButtonModernObject) {
        print("Error: Pinch Button Modern Object is not assigned!");
        return false;
    }
    if (!script.musicPlayerY2K) {
        print("Error: Music Player Y2K is not assigned!");
        return false;
    }
    if (!script.musicPlayerModern) {
        print("Error: Music Player Modern is not assigned!");
        return false;
    }
    if (!script.musicPlayerManagerY2K) {
        print("Error: Music Player Manager Y2K is not assigned!");
        return false;
    }
    if (!script.musicPlayerManagerModern) {
        print("Error: Music Player Manager Modern is not assigned!");
        return false;
    }
    return true;
}

// Function to ensure buttons are always enabled
function ensureButtonsEnabled() {
    if (script.pinchButtonY2KObject && !script.pinchButtonY2KObject.enabled) {
        print("Warning: Pinch Button Y2K Object was disabled. Re-enabling...");
        script.pinchButtonY2KObject.enabled = true;
    }
    if (script.pinchButtonModernObject && !script.pinchButtonModernObject.enabled) {
        print("Warning: Pinch Button Modern Object was disabled. Re-enabling...");
        script.pinchButtonModernObject.enabled = true;
    }
}

// Function to switch to Modern skin
function switchToModern() {
    print("Switching to Modern skin...");
    // Disable Y2K skin and manager
    script.musicPlayerY2K.enabled = false;
    script.musicPlayerManagerY2K.enabled = false;
    // Enable Modern skin and manager
    script.musicPlayerModern.enabled = true;
    script.musicPlayerManagerModern.enabled = true;
    // Ensure buttons remain enabled
    ensureButtonsEnabled();
    print("Switched to Modern skin.");
}

// Function to switch to Y2K skin
function switchToY2K() {
    print("Switching to Y2K skin...");
    // Disable Modern skin and manager
    script.musicPlayerModern.enabled = false;
    script.musicPlayerManagerModern.enabled = false;
    // Enable Y2K skin and manager
    script.musicPlayerY2K.enabled = true;
    script.musicPlayerManagerY2K.enabled = true;
    // Ensure buttons remain enabled
    ensureButtonsEnabled();
    print("Switched to Y2K skin.");
}

// Bind pinch events to switch skins
function setupPinchEvents() {
    // Bind Pinch Button Y2K (switch to Modern skin)
    if (script.pinchButtonY2K && script.pinchButtonY2K.onButtonPinched) {
        pinchButtonY2KHandler = function() {
            print("Pinch Button Y2K pressed.");
            switchToModern();
        };
        script.pinchButtonY2K.onButtonPinched.add(pinchButtonY2KHandler);
        print("Pinch Button Y2K event bound successfully.");
    } else {
        print("Error: Pinch Button Y2K does not have onButtonPinched property or is not assigned!");
    }

    // Bind Pinch Button Modern (switch to Y2K skin)
    if (script.pinchButtonModern && script.pinchButtonModern.onButtonPinched) {
        pinchButtonModernHandler = function() {
            print("Pinch Button Modern pressed.");
            switchToY2K();
        };
        script.pinchButtonModern.onButtonPinched.add(pinchButtonModernHandler);
        print("Pinch Button Modern event bound successfully.");
    } else {
        print("Error: Pinch Button Modern does not have onButtonPinched property or is not assigned!");
    }
}

// Cleanup function to remove event listeners
function cleanup() {
    if (script.pinchButtonY2K && script.pinchButtonY2K.onButtonPinched && pinchButtonY2KHandler) {
        script.pinchButtonY2K.onButtonPinched.remove(pinchButtonY2KHandler);
    }
    if (script.pinchButtonModern && script.pinchButtonModern.onButtonPinched && pinchButtonModernHandler) {
        script.pinchButtonModern.onButtonPinched.remove(pinchButtonModernHandler);
    }
    pinchButtonY2KHandler = null;
    pinchButtonModernHandler = null;
}

// Initialize the script
if (validateInputs()) {
    // Initially deactivate Modern skin
    script.musicPlayerModern.enabled = false;
    script.musicPlayerManagerModern.enabled = false;
    // Activate Y2K skin by default
    script.musicPlayerY2K.enabled = true;
    script.musicPlayerManagerY2K.enabled = true;

    // Ensure buttons are enabled at startup
    ensureButtonsEnabled();

    // Bind pinch events
    setupPinchEvents();
} else {
    print("Script initialization failed due to invalid inputs.");
}

// Cleanup when the script is destroyed
script.destroy = function() {
    cleanup();
};