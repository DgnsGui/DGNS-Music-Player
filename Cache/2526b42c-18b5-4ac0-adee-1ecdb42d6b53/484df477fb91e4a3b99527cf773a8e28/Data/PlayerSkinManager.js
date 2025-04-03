// Define a custom structure for each skin
// @ui {"widget":"group_start", "label":"Skins"}
// @input Component.ScriptComponent toggleButton {"label":"Toggle Button"}
// @input SceneObject[] players {"label":"Players"}
// @input SceneObject[] playerManagers {"label":"Player Managers"}
// @ui {"widget":"group_end"}

// Ensure the script is recognized as a component in Lens Studio
script.api.PlayerSkinManager = script;

// Store the currently active skin index (0 = Y2K, 1 = Modern, etc.)
var activeSkinIndex = 0;

// Store event handler for cleanup
var toggleHandler = null;

// Validate inputs and ensure arrays are the same length
function validateInputs() {
    if (!script.toggleButton) {
        print("Error: Toggle Button is not assigned!");
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

// Bind pinch event to toggle skins
function setupPinchEvents() {
    if (script.toggleButton.onButtonPinched) {
        toggleHandler = function() {
            print("Toggle Button pressed. Current active skin index: " + activeSkinIndex);
            // Cycle to the next skin
            var nextSkinIndex = (activeSkinIndex + 1) % script.players.length;
            activateSkin(nextSkinIndex);
        };
        script.toggleButton.onButtonPinched.add(toggleHandler);
        print("Toggle Button event bound successfully.");
    } else {
        print("Error: Toggle Button does not have onButtonPinched property!");
    }
}

// Cleanup function to remove event listener
function cleanup() {
    if (script.toggleButton && script.toggleButton.onButtonPinched && toggleHandler) {
        script.toggleButton.onButtonPinched.remove(toggleHandler);
    }
    toggleHandler = null;
}

// Initialize the script
if (validateInputs()) {
    // Initially deactivate all skins
    for (var i = 0; i < script.players.length; i++) {
        script.players[i].enabled = false;
        script.playerManagers[i].enabled = false;
    }

    // Activate the first skin (Y2K) by default
    if (script.players.length > 0) {
        activateSkin(0);
    }

    // Bind pinch events
    setupPinchEvents();
} else {
    print("Script initialization failed due to invalid inputs.");
}

// Cleanup when the script is destroyed
script.destroy = function() {
    cleanup();
};