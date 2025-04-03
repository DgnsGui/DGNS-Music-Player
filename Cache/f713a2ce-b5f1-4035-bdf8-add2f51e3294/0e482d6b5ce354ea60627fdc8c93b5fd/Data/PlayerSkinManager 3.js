// Define inputs
// @ui {"widget":"group_start", "label":"Welcome"}
// @input SceneObject welcomePrefab
// @input Component.ScriptComponent acknowledgeButton
// @ui {"widget":"group_end"}

// @ui {"widget":"group_start", "label":"Y2K Skin"}
// @input SceneObject musicPlayerY2K
// @input SceneObject musicPlayerManagerY2K
// @input Component.ScriptComponent y2kSkinButton
// @input Component.ScriptComponent y2kHandButton
// @ui {"widget":"group_end"}

// @ui {"widget":"group_start", "label":"Modern Skin"}
// @input SceneObject musicPlayerModern
// @input SceneObject musicPlayerManagerModern
// @input Component.ScriptComponent modernSkinButton
// @input Component.ScriptComponent modernHandButton
// @ui {"widget":"group_end"}

// @ui {"widget":"group_start", "label":"Hand Skin"}
// @input SceneObject musicPlayerHand
// @input SceneObject musicPlayerManagerHand
// @input Component.ScriptComponent handSkinButton
// @input Component.ScriptComponent handHandButton
// @ui {"widget":"group_end"}

var previousSkin;

// Make the script recognizable as a component in Lens Studio
script.api.MusicPlayerSkinManager = script;

// Validate all inputs
function validateInputs() {
    if (!script.welcomePrefab) { print("Error: Welcome Prefab is not assigned!"); return false; }
    if (!script.acknowledgeButton) { print("Error: Acknowledge Button is not assigned!"); return false; }
    if (!script.musicPlayerY2K) { print("Error: Music Player Y2K is not assigned!"); return false; }
    if (!script.musicPlayerManagerY2K) { print("Error: Music Player Manager Y2K is not assigned!"); return false; }
    if (!script.y2kSkinButton) { print("Error: Y2K Skin Button is not assigned!"); return false; }
    if (!script.y2kHandButton) { print("Error: Y2K Hand Button is not assigned!"); return false; }
    if (!script.musicPlayerModern) { print("Error: Music Player Modern is not assigned!"); return false; }
    if (!script.musicPlayerManagerModern) { print("Error: Music Player Manager Modern is not assigned!"); return false; }
    if (!script.modernSkinButton) { print("Error: Modern Skin Button is not assigned!"); return false; }
    if (!script.modernHandButton) { print("Error: Modern Hand Button is not assigned!"); return false; }
    if (!script.musicPlayerHand) { print("Error: Music Player Hand is not assigned!"); return false; }
    if (!script.musicPlayerManagerHand) { print("Error: Music Player Manager Hand is not assigned!"); return false; }
    if (!script.handSkinButton) { print("Error: Hand Skin Button is not assigned!"); return false; }
    if (!script.handHandButton) { print("Error: Hand Hand Button is not assigned!"); return false; }
    return true;
}

// Stop audio for a specific manager
function stopAudioForManager(manager) {
    if (manager && manager.getComponent) {
        var managerScript = manager.getComponent("Component.ScriptComponent");
        if (managerScript && managerScript.api && managerScript.api.stopTrack) {
            managerScript.api.stopTrack();
            print("Audio stopped for " + manager.name);
        } else {
            print("Warning: No stopTrack method found for " + manager.name);
        }
    }
}

// Ensure a manager and its script are enabled
function enableManager(manager) {
    if (manager) {
        manager.enabled = true;
        var managerScript = manager.getComponent("Component.ScriptComponent");
        if (managerScript) {
            managerScript.enabled = true;
            print("Enabled manager and script for " + manager.name);
        } else {
            print("Warning: No ScriptComponent found on " + manager.name);
        }
    }
}

// Ensure a manager and its script are disabled
function disableManager(manager) {
    if (manager) {
        stopAudioForManager(manager);
        manager.enabled = false;
        var managerScript = manager.getComponent("Component.ScriptComponent");
        if (managerScript) {
            managerScript.enabled = false;
            print("Disabled manager and script for " + manager.name);
        } else {
            print("Warning: No ScriptComponent found on " + manager.name);
        }
    }
}

// Switch to Y2K skin
function switchToY2K() {
    print("Switching to Y2K skin...");
    disableManager(script.musicPlayerManagerModern);
    disableManager(script.musicPlayerManagerHand);
    script.welcomePrefab.enabled = false;
    script.musicPlayerModern.enabled = false;
    script.musicPlayerHand.enabled = false;
    script.musicPlayerY2K.enabled = true;
    enableManager(script.musicPlayerManagerY2K);
    print("Switched to Y2K skin. Y2K enabled: " + script.musicPlayerY2K.enabled);
}

// Switch to Modern skin
function switchToModern() {
    print("Switching to Modern skin...");
    disableManager(script.musicPlayerManagerY2K);
    disableManager(script.musicPlayerManagerHand);
    script.welcomePrefab.enabled = false;
    script.musicPlayerY2K.enabled = false;
    script.musicPlayerHand.enabled = false;
    script.musicPlayerModern.enabled = true;
    enableManager(script.musicPlayerManagerModern);
    print("Switched to Modern skin. Modern enabled: " + script.musicPlayerModern.enabled);
}

// Switch to Hand skin
function switchToHand() {
    print("Switching to Hand skin...");
    disableManager(script.musicPlayerManagerY2K);
    disableManager(script.musicPlayerManagerModern);
    script.welcomePrefab.enabled = false;
    script.musicPlayerY2K.enabled = false;
    script.musicPlayerModern.enabled = false;
    script.musicPlayerHand.enabled = true;
    enableManager(script.musicPlayerManagerHand);
    print("Switched to Hand skin. Hand enabled: " + script.musicPlayerHand.enabled + ", Manager enabled: " + script.musicPlayerManagerHand.enabled);
}

// Helper to bind button events
function bindButtonEvent(button, callback) {
    if (!button) {
        print("Error: Button is null or undefined!");
        return;
    }
    if (button.onButtonPinched) {
        button.onButtonPinched.add(callback);
        print("Button event bound successfully for " + button.name);
    } else {
        print("Error: Button " + button.name + " missing onButtonPinched property!");
    }
}

// Bind all button handlers
function bindHandlers() {
    // Welcome prefab acknowledge button
    bindButtonEvent(script.acknowledgeButton, function() {
        print("Acknowledge button pressed.");
        switchToY2K();
    });

    // Y2K skin buttons
    bindButtonEvent(script.y2kSkinButton, function() {
        print("Y2K skin button pressed.");
        switchToModern();
    });
    bindButtonEvent(script.y2kHandButton, function() {
        print("Y2K hand button pressed.");
        previousSkin = "Y2K";
        switchToHand();
    });

    // Modern skin buttons
    bindButtonEvent(script.modernSkinButton, function() {
        print("Modern skin button pressed.");
        switchToY2K();
    });
    bindButtonEvent(script.modernHandButton, function() {
        print("Modern hand button pressed.");
        previousSkin = "Modern";
        switchToHand();
    });

    // Hand skin buttons
    bindButtonEvent(script.handSkinButton, function() {
        print("Hand skin button pressed. Previous skin: " + previousSkin);
        if (previousSkin === "Y2K") {
            switchToModern();
        } else {
            switchToY2K();
        }
    });
    bindButtonEvent(script.handHandButton, function() {
        print("Hand hand button pressed. Previous skin: " + previousSkin);
        if (previousSkin === "Y2K") {
            switchToY2K();
        } else {
            switchToModern();
        }
    });
}

// Initialize the script
function initialize() {
    if (!validateInputs()) {
        print("Script initialization failed due to invalid inputs.");
        return;
    }

    print("Initializing script...");
    script.welcomePrefab.enabled = true;
    script.musicPlayerY2K.enabled = false;
    script.musicPlayerModern.enabled = false;
    script.musicPlayerHand.enabled = false;
    disableManager(script.musicPlayerManagerY2K);
    disableManager(script.musicPlayerManagerModern);
    disableManager(script.musicPlayerManagerHand);
    print("Initial state set. Welcome enabled: " + script.welcomePrefab.enabled);

    bindHandlers();
    print("Button handlers bound.");
}

// Run initialization
initialize();

// Cleanup function
script.destroy = function() {
    disableManager(script.musicPlayerManagerY2K);
    disableManager(script.musicPlayerManagerModern);
    disableManager(script.musicPlayerManagerHand);
    print("Script destroyed, all audio stopped.");
};