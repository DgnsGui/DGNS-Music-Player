// Define inputs for the pinch buttons and skins
// @ui {"widget":"group_start", "label":"Pinch Buttons"}
// @input Component.ScriptComponent pinchButtonY2K {"label":"Pinch Button Y2K"}
// @input Component.ScriptComponent pinchButtonModern {"label":"Pinch Button Modern"}
// @ui {"widget":"group_end"}
// @ui {"widget":"group_start", "label":"Skins"}
// @input SceneObject musicPlayerY2K {"label":"Music Player Y2K"}
// @input SceneObject musicPlayerModern {"label":"Music Player Modern"}
// @input SceneObject musicPlayerManagerY2K {"label":"Music Player Manager Y2K"}
// @input SceneObject musicPlayerManagerModern {"label":"Music Player Manager Modern"}
// @ui {"widget":"group_end"}

// Ensure the script is recognized as a component in Lens Studio
script.api.PlayerSkinManager = script;

// Store event handlers for dynamic binding
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

// Function to bind the pinch event for the Y2K button
function bindPinchButtonY2K() {
    if (pinchButtonY2KHandler) {
        print("Warning: Pinch Button Y2K handler already bound. Unbinding first...");
        unbindPinchButtonY2K();
    }
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
}

// Function to unbind the pinch event for the Y2K button
function unbindPinchButtonY2K() {
    if (script.pinchButtonY2K && script.pinchButtonY2K.onButtonPinched && pinchButtonY2KHandler) {
        script.pinchButtonY2K.onButtonPinched.remove(pinchButtonY2KHandler);
        pinchButtonY2KHandler = null;
        print("Pinch Button Y2K event unbound.");
    }
}

// Function to bind the pinch event for the Modern button
function bindPinchButtonModern() {
    if (pinchButtonModernHandler) {
        print("Warning: Pinch Button Modern handler already bound. Unbinding first...");
        unbindPinchButtonModern();
    }
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

// Function to unbind the pinch event for the Modern button
function unbindPinchButtonModern() {
    if (script.pinchButtonModern && script.pinchButtonModern.onButtonPinched && pinchButtonModernHandler) {
        script.pinchButtonModern.onButtonPinched.remove(pinchButtonModernHandler);
        pinchButtonModernHandler = null;
        print("Pinch Button Modern event unbound.");
    }
}

// Function to switch to Modern skin
function switchToModern() {
    print("Switching to Modern skin...");
    // Disable Y2K skin and manager
    script.musicPlayerY2K.enabled = false;
    script.musicPlayerManagerY2K.enabled = false;
    // Unbind Y2K button event
    unbindPinchButtonY2K();
    // Enable Modern skin and manager
    script.musicPlayerModern.enabled = true;
    script.musicPlayerManagerModern.enabled = true;
    // Bind Modern button event
    bindPinchButtonModern();
    print("Switched to Modern skin.");
}

// Function to switch to Y2K skin
function switchToY2K() {
    print("Switching to Y2K skin...");
    // Disable Modern skin and manager
    script.musicPlayerModern.enabled = false;
    script.musicPlayerManagerModern.enabled = false;
    // Unbind Modern button event
    unbindPinchButtonModern();
    // Enable Y2K skin and manager
    script.musicPlayerY2K.enabled = true;
    script.musicPlayerManagerY2K.enabled = true;
    // Bind Y2K button event
    bindPinchButtonY2K();
    print("Switched to Y2K skin.");
}

// Cleanup function to remove all event listeners
function cleanup() {
    unbindPinchButtonY2K();
    unbindPinchButtonModern();
}

// Initialize the script
if (validateInputs()) {
    // Initially deactivate Modern skin
    script.musicPlayerModern.enabled = false;
    script.musicPlayerManagerModern.enabled = false;
    // Activate Y2K skin by default
    script.musicPlayerY2K.enabled = true;
    script.musicPlayerManagerY2K.enabled = true;

    // Bind the pinch event for the initially active skin (Y2K)
    bindPinchButtonY2K();
} else {
    print("Script initialization failed due to invalid inputs.");
}

// Cleanup when the script is destroyed
script.destroy = function() {
    cleanup();
};