// Define inputs for the two skins
// @ui {"widget":"group_start", "label":"Skins"}
// @input Component.ScriptComponent y2kPinchButton {"label":"Y2K Pinch Button"}
// @input SceneObject musicPlayerY2K {"label":"Music Player Y2K"}
// @input SceneObject musicPlayerManagerY2K {"label":"Music Player Manager Y2K"}
// @input Component.ScriptComponent modernPinchButton {"label":"Modern Pinch Button"}
// @input SceneObject musicPlayerModern {"label":"Music Player Modern"}
// @input SceneObject musicPlayerManagerModern {"label":"Music Player Manager Modern"}
// @ui {"widget":"group_end"}

// Ensure the script is recognized as a component in Lens Studio
script.api.PlayerSkinManager = script;

// State to track which skin is active (true = Modern, false = Y2K)
var isModernActive = false;

// Store event handlers for cleanup
var y2kHandler = null;
var modernHandler = null;

// Validate inputs
function validateInputs() {
    if (!script.y2kPinchButton) {
        print("Error: Y2K Pinch Button is not assigned!");
        return false;
    }
    if (!script.modernPinchButton) {
        print("Error: Modern Pinch Button is not assigned!");
        return false;
    }
    if (!script.musicPlayerY2K || !script.musicPlayerManagerY2K) {
        print("Error: Y2K Player or Manager is not assigned!");
        return false;
    }
    if (!script.musicPlayerModern || !script.musicPlayerManagerModern) {
        print("Error: Modern Player or Manager is not assigned!");
        return false;
    }
    return true;
}

// Function to toggle between skins
function toggleSkins() {
    isModernActive = !isModernActive; // Toggle the state

    // Set the visibility of the skins
    script.musicPlayerY2K.enabled = !isModernActive;
    script.musicPlayerManagerY2K.enabled = !isModernActive;
    script.musicPlayerModern.enabled = isModernActive;
    script.musicPlayerManagerModern.enabled = isModernActive;

    print("Switched to " + (isModernActive ? "Modern" : "Y2K") + " skin.");
}

// Bind pinch events
function setupPinchEvents() {
    // Debug the pinch buttons
    print("Y2K Pinch Button: " + script.y2kPinchButton);
    print("Modern Pinch Button: " + script.modernPinchButton);

    // Bind Y2K pinch button
    if (script.y2kPinchButton.onButtonPinched) {
        y2kHandler = function() {
            if (!isModernActive) { // Only toggle if Y2K is active
                toggleSkins();
            }
        };
        script.y2kPinchButton.onButtonPinched.add(y2kHandler);
        print("Y2K Pinch Button event bound successfully.");
    } else {
        print("Error: Y2K Pinch Button does not have onButtonPinched property!");
    }

    // Bind Modern pinch button
    if (script.modernPinchButton.onButtonPinched) {
        modernHandler = function() {
            if (isModernActive) { // Only toggle if Modern is active
                toggleSkins();
            }
        };
        script.modernPinchButton.onButtonPinched.add(modernHandler);
        print("Modern Pinch Button event bound successfully.");
    } else {
        print("Error: Modern Pinch Button does not have onButtonPinched property!");
    }
}

// Cleanup function to remove event listeners
function cleanup() {
    if (script.y2kPinchButton && script.y2kPinchButton.onButtonPinched && y2kHandler) {
        script.y2kPinchButton.onButtonPinched.remove(y2kHandler);
    }
    if (script.modernPinchButton && script.modernPinchButton.onButtonPinched && modernHandler) {
        script.modernPinchButton.onButtonPinched.remove(modernHandler);
    }
    y2kHandler = null;
    modernHandler = null;
}

// Initialize the script
if (validateInputs()) {
    // Set initial state: Y2K active, Modern inactive
    script.musicPlayerY2K.enabled = true;
    script.musicPlayerManagerY2K.enabled = true;
    script.musicPlayerModern.enabled = false;
    script.musicPlayerManagerModern.enabled = false;
    isModernActive = false;

    // Bind pinch events
    setupPinchEvents();
} else {
    print("Script initialization failed due to invalid inputs.");
}

// Cleanup when the script is destroyed
script.destroy = function() {
    cleanup();
};