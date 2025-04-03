// Define inputs for the toggle buttons and skins
// @ui {"widget":"group_start", "label":"Toggle Buttons"}
// @input Component.ScriptComponent toggleToModernButton {"label":"Toggle To Modern Button"}
// @input Component.ScriptComponent toggleToY2KButton {"label":"Toggle To Y2K Button"}
// @ui {"widget":"group_end"}
// @ui {"widget":"group_start", "label":"Skins"}
// @input SceneObject[] players {"label":"Players"}
// @input SceneObject[] playerManagers {"label":"Player Managers"}
// @ui {"widget":"group_end"}

// Ensure the script is recognized as a component in Lens Studio
script.api.PlayerSkinManager = script;

// Store the currently active skin index (0 = Y2K, 1 = Modern, etc.)
var activeSkinIndex = 0;

// Store event handlers for cleanup
var toggleToModernHandler = null;
var toggleToY2KHandler = null;

// Validate inputs
function validateInputs() {
    if (!script.toggleToModernButton) {
        print("Error: Toggle To Modern Button is not assigned!");
        return false;
    }
    if (!script.toggleToY2KButton) {
        print("Error: Toggle To Y2K Button is not assigned!");
        return false;
    }
    if (!script.players || !script.playerManagers) {
        print("Error: Players or Player Managers array is not assigned!");
        return false;
    }

    var length = script.players.length;
    if (script.playerManagers.length !== length) {
        print("Error: Players and Player Managers arrays must have the same length!");
        return false;
    }

    // Check for null entries
    for (var i = 0; i < length; i++) {
        if (!script.players[i]) {
            print("Error: Player at index " + i + " is not assigned!");
            return false;
        }
        if (!script.playerManagers[i]) {
            print("Error: Player Manager at index " + i + " is not assigned!");
            return false;
        }
    }

    // Ensure at least two skins are available (Y2K and Modern)
    if (length < 2) {
        print("Error: At least two skins (Y2K and Modern) must be assigned!");
        return false;
    }

    return true;
}

// Function to activate a specific skin by index
function activateSkin(skinIndex) {
    if (skinIndex < 0 || skinIndex >= script.players.length) {
        print("Error: Invalid skin index: " + skinIndex);
        return;
    }

    // Deactivate all skins
    for (var i = 0; i < script.players.length; i++) {
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
    // Bind Toggle To Modern Button (switch to Modern skin, index 1)
    if (script.toggleToModernButton.onButtonPinched) {
        toggleToModernHandler = function() {
            print("Toggle To Modern Button pressed. Current active skin index: " + activeSkinIndex);
            if (activeSkinIndex !== 1) {
                activateSkin(1); // Switch to Modern skin (index 1)
            } else {
                print("Toggle To Modern Button ignored: Modern skin is already active.");
            }
        };
        script.toggleToModernButton.onButtonPinched.add(toggleToModernHandler);
        print("Toggle To Modern Button event bound successfully.");
    } else {
        print("Error: Toggle To Modern Button does not have onButtonPinched property!");
    }

    // Bind Toggle To Y2K Button (switch to Y2K skin, index 0)
    if (script.toggleToY2KButton.onButtonPinched) {
        toggleToY2KHandler = function() {
            print("Toggle To Y2K Button pressed. Current active skin index: " + activeSkinIndex);
            if (activeSkinIndex !== 0) {
                activateSkin(0); // Switch to Y2K skin (index 0)
            } else {
                print("Toggle To Y2K Button ignored: Y2K skin is already active.");
            }
        };
        script.toggleToY2KButton.onButtonPinched.add(toggleToY2KHandler);
        print("Toggle To Y2K Button event bound successfully.");
    } else {
        print("Error: Toggle To Y2K Button does not have onButtonPinched property!");
    }
}

// Cleanup function to remove event listeners
function cleanup() {
    if (script.toggleToModernButton && script.toggleToModernButton.onButtonPinched && toggleToModernHandler) {
        script.toggleToModernButton.onButtonPinched.remove(toggleToModernHandler);
    }
    if (script.toggleToY2KButton && script.toggleToY2KButton.onButtonPinched && toggleToY2KHandler) {
        script.toggleToY2KButton.onButtonPinched.remove(toggleToY2KHandler);
    }
    toggleToModernHandler = null;
    toggleToY2KHandler = null;
}

// Initialize the script
if (validateInputs()) {
    // Initially deactivate all skins
    for (var i = 0; i < script.players.length; i++) {
        script.players[i].enabled = false;
        script.playerManagers[i].enabled = false;
    }

    // Activate the first skin (Y2K) by default
    activateSkin(0);

    // Bind pinch events
    setupPinchEvents();
} else {
    print("Script initialization failed due to invalid inputs.");
}

// Cleanup when the script is destroyed
script.destroy = function() {
    cleanup();
};