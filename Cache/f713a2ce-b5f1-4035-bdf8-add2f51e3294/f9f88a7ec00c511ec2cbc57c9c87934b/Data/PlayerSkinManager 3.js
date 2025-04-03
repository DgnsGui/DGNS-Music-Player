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

// Declare global variable to track the previous skin before switching to Hand
var previousSkin;

// Make the script recognizable as a component in Lens Studio
script.api.MusicPlayerSkinManager = script;

// Validate all inputs to ensure they are assigned
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

// Switch to Y2K skin
function switchToY2K() {
    print("Switching to Y2K skin...");
    stopAudioForManager(script.musicPlayerManagerModern);
    stopAudioForManager(script.musicPlayerManagerHand);
    script.welcomePrefab.enabled = false;
    script.musicPlayerModern.enabled = false;
    script.musicPlayerManagerModern.enabled = false;
    script.musicPlayerHand.enabled = false;
    script.musicPlayerManagerHand.enabled = false;
    script.musicPlayerY2K.enabled = true;
    script.musicPlayerManagerY2K.enabled = true;
    print("Switched to Y2K skin.");
    // Debug button states
    print("y2kSkinButton enabled: " + (script.y2kSkinButton ? script.y2kSkinButton.getSceneObject().enabled : "null"));
    print("y2kHandButton enabled: " + (script.y2kHandButton ? script.y2kHandButton.getSceneObject().enabled : "null"));
}

// Switch to Modern skin
function switchToModern() {
    print("Switching to Modern skin...");
    stopAudioForManager(script.musicPlayerManagerY2K);
    stopAudioForManager(script.musicPlayerManagerHand);
    script.welcomePrefab.enabled = false;
    script.musicPlayerY2K.enabled = false;
    script.musicPlayerManagerY2K.enabled = false;
    script.musicPlayerHand.enabled = false;
    script.musicPlayerManagerHand.enabled = false;
    script.musicPlayerModern.enabled = true;
    script.musicPlayerManagerModern.enabled = true;
    print("Switched to Modern skin.");
    // Debug button states
    print("modernSkinButton enabled: " + (script.modernSkinButton ? script.modernSkinButton.getSceneObject().enabled : "null"));
    print("modernHandButton enabled: " + (script.modernHandButton ? script.modernHandButton.getSceneObject().enabled : "null"));
}

// Switch to Hand skin
function switchToHand() {
    print("Switching to Hand skin...");
    stopAudioForManager(script.musicPlayerManagerY2K);
    stopAudioForManager(script.musicPlayerManagerModern);
    script.welcomePrefab.enabled = false;
    script.musicPlayerY2K.enabled = false;
    script.musicPlayerManagerY2K.enabled = false;
    script.musicPlayerModern.enabled = false;
    script.musicPlayerManagerModern.enabled = false;
    script.musicPlayerHand.enabled = true;
    script.musicPlayerManagerHand.enabled = true;
    print("Switched to Hand skin.");
    // Debug button states
    print("handSkinButton enabled: " + (script.handSkinButton ? script.handSkinButton.getSceneObject().enabled : "null"));
    print("handHandButton enabled: " + (script.handHandButton ? script.handHandButton.getSceneObject().enabled : "null"));
}

// Bind all button handlers at initialization
function bindHandlers() {
    // Welcome prefab acknowledge button
    if (script.acknowledgeButton && script.acknowledgeButton.onButtonPinched) {
        script.acknowledgeButton.onButtonPinched.add(function() {
            print("Acknowledge button pressed.");
            switchToY2K();
        });
        print("Acknowledge button handler bound.");
    } else {
        print("Error: Acknowledge button missing onButtonPinched property!");
    }

    // Y2K skin buttons
    if (script.y2kSkinButton && script.y2kSkinButton.onButtonPinched) {
        script.y2kSkinButton.onButtonPinched.add(function() {
            print("Y2K skin button pressed.");
            switchToModern();
        });
        print("Y2K skin button handler bound.");
    } else {
        print("Error: Y2K skin button missing onButtonPinched property!");
    }
    if (script.y2kHandButton && script.y2kHandButton.onButtonPinched) {
        script.y2kHandButton.onButtonPinched.add(function() {
            print("Y2K hand button pressed.");
            previousSkin = "Y2K";
            switchToHand();
        });
        print("Y2K hand button handler bound.");
    } else {
        print("Error: Y2K hand button missing onButtonPinched property!");
    }

    // Modern skin buttons
    if (script.modernSkinButton && script.modernSkinButton.onButtonPinched) {
        script.modernSkinButton.onButtonPinched.add(function() {
            print("Modern skin button pressed.");
            switchToY2K();
        });
        print("Modern skin button handler bound.");
    } else {
        print("Error: Modern skin button missing onButtonPinched property!");
    }
    if (script.modernHandButton && script.modernHandButton.onButtonPinched) {
        script.modernHandButton.onButtonPinched.add(function() {
            print("Modern hand button pressed.");
            previousSkin = "Modern";
            switchToHand();
        });
        print("Modern hand button handler bound.");
    } else {
        print("Error: Modern hand button missing onButtonPinched property!");
    }

    // Hand skin buttons
    if (script.handSkinButton && script.handSkinButton.onButtonPinched) {
        script.handSkinButton.onButtonPinched.add(function() {
            print("Hand skin button pressed.");
            if (previousSkin === "Y2K") {
                switchToModern();
            } else {
                switchToY2K();
            }
        });
        print("Hand skin button handler bound.");
    } else {
        print("Error: Hand skin button missing onButtonPinched property!");
    }
    if (script.handHandButton && script.handHandButton.onButtonPinched) {
        script.handHandButton.onButtonPinched.add(function() {
            print("Hand hand button pressed.");
            if (previousSkin === "Y2K") {
                switchToY2K();
            } else {
                switchToModern();
            }
        });
        print("Hand hand button handler bound.");
    } else {
        print("Error: Hand hand button missing onButtonPinched property!");
    }
}

// Initialize the script
function onAwake() {
    if (validateInputs()) {
        // Start with welcome prefab enabled, all skins disabled
        script.welcomePrefab.enabled = true;
        script.musicPlayerY2K.enabled = false;
        script.musicPlayerManagerY2K.enabled = false;
        script.musicPlayerModern.enabled = false;
        script.musicPlayerManagerModern.enabled = false;
        script.musicPlayerHand.enabled = false;
        script.musicPlayerManagerHand.enabled = false;

        // Bind all handlers once (buttons only trigger when their skin is enabled)
        bindHandlers();
        print("PlayerSkinManager initialized successfully.");
    } else {
        print("Script initialization failed due to invalid inputs.");
    }
}

// Cleanup function
script.destroy = function() {
    stopAudioForManager(script.musicPlayerManagerY2K);
    stopAudioForManager(script.musicPlayerManagerModern);
    stopAudioForManager(script.musicPlayerManagerHand);
};

// Bind to onAwake
script.createEvent("OnAwakeEvent").bind(onAwake);