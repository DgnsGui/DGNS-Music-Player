// Define a custom structure for each skin
// @ui {"widget":"group_start", "label":"Skins"}
// @input Component.ScriptComponent[] pinchButtons {"label":"Pinch Buttons"}
// @input SceneObject[] players {"label":"Players"}
// @input SceneObject[] playerManagers {"label":"Player Managers"}
// @ui {"widget":"group_end"}

// Ensure the script is recognized as a component in Lens Studio
script.api.PlayerSkinManager = script;

// Array to store event handlers for cleanup
var eventHandlers = [];

// Validate inputs and ensure arrays are the same length
function validateInputs() {
    if (!script.pinchButtons || !script.players || !script.playerManagers) {
        print("Error: One or more input arrays are not assigned!");
        return false;
    }

    var length = script.pinchButtons.length;
    if (script.players.length !== length || script.playerManagers.length !== length) {
        print("Error: All arrays (Pinch Buttons, Players, Player Managers) must have the same length!");
        return false;
    }

    // Check for null entries
    for (var i = 0; i < length; i++) {
        if (!script.pinchButtons[i]) {
            print("Error: Pinch Button at index " + i + " is not assigned!");
            return false;
        }
        if (!script.players[i]) {
            print("Error: Player at index " + i + " is not assigned!");
            return false;
        }
        if (!script.playerManagers[i]) {
            print("Error: Player Manager at index " + i + " is not assigned!");
            return false;
        }
    }

    return true;
}

// Store the currently active skin index (-1 means none active)
var activeSkinIndex = -1;

// Function to activate a specific skin by index
function activateSkin(skinIndex) {
    if (skinIndex < 0 || skinIndex >= script.pinchButtons.length) {
        print("Error: Invalid skin index: " + skinIndex);
        return;
    }

    // Deactivate all skins
    for (var i = 0; i < script.pinchButtons.length; i++) {
        script.players[i].enabled = false;
        script.playerManagers[i].enabled = false;
    }

    // Activate the selected skin
    script.players[skinIndex].enabled = true;
    script.playerManagers[skinIndex].enabled = true;
    activeSkinIndex = skinIndex;

    print("Activated skin at index " + skinIndex + " (Player: " + script.players[skinIndex].name + ")");
}

// Bind pinch events to toggle skins
function setupPinchEvents() {
    for (var i = 0; i < script.pinchButtons.length; i++) {
        // Create a closure to capture the index
        (function(index) {
            var pinchButton = script.pinchButtons[index];
            // Check if the pinchButton has the onButtonPinched property
            if (pinchButton.onButtonPinched) {
                // Define the handler
                var handler = function() {
                    activateSkin(index);
                };
                // Bind the handler to the onButtonPinched event
                pinchButton.onButtonPinched.add(handler);
                // Store the handler for cleanup
                eventHandlers.push({ pinchButton: pinchButton, handler: handler });
            } else {
                print("Error: PinchButton at index " + index + " does not have onButtonPinched property!");
            }
        })(i);
    }
}

// Cleanup function to remove event listeners
function cleanup() {
    for (var i = 0; i < eventHandlers.length; i++) {
        var entry = eventHandlers[i];
        if (entry.pinchButton && entry.pinchButton.onButtonPinched) {
            entry.pinchButton.onButtonPinched.remove(entry.handler);
        }
    }
    eventHandlers = [];
}

// Initialize the script
if (validateInputs()) {
    // Initially deactivate all skins
    for (var i = 0; i < script.pinchButtons.length; i++) {
        script.players[i].enabled = false;
        script.playerManagers[i].enabled = false;
    }

    // Bind pinch events
    setupPinchEvents();

    // Activate the first skin by default (optional)
    if (script.pinchButtons.length > 0) {
        activateSkin(0);
    }
} else {
    print("Script initialization failed due to invalid inputs.");
}

// Cleanup when the script is destroyed
script.destroy = function() {
    cleanup();
};