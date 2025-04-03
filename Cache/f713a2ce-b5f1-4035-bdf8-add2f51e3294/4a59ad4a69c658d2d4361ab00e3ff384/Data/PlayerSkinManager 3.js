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

// Switch to Y2K skin and bind its buttons
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
    
    // Bind Y2K buttons
    if (script.y2kSkinButton && script.y2kSkinButton.onButtonPinched) {
        script.y2kSkinButton.onButtonPinched.clear(); // Clear any existing handlers
        script.y2kSkinButton.onButtonPinched.add(function() {
            print("Y2K skin button pressed.");
            switchToModern();
        });
        print("Y2K skin button bound.");
    } else {
        print("Error: Y2K skin button missing onButtonPinched property!");
    }
    if (script.y2kHandButton && script.y2kHandButton.onButtonPinched) {
        script.y2kHandButton.onButtonPinched.clear();
        script.y2kHandButton.onButtonPinched.add(function() {
            print("Y2K hand button pressed.");
            previousSkin = "Y2K";
            switchToHand();
        });
        print("Y2K hand button bound.");
    } else {
        print("Error: Y2K hand button missing onButtonPinched property!");
    }
    print("Switched to Y2K skin.");
}

// Switch to Modern skin and bind its buttons
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
    
    // Bind Modern buttons
    if (script.modernSkinButton && script.modernSkinButton.onButtonPinched) {
        script.modernSkinButton.onButtonPinched.clear(); // Clear any existing handlers
        script.modernSkinButton.onButtonPinched.add(function() {
            print("Modern skin button pressed.");
            switchToY2K();
        });
        print("Modern skin button bound.");
    } else {
        print("Error: Modern skin button missing onButtonPinched property!");
    }
    if (script.modernHandButton && script.modernHandButton.onButtonPinched) {
        script.modernHandButton.onButtonPinched.clear();
        script.modernHandButton.onButtonPinched.add(function() {
            print("Modern hand button pressed.");
            previousSkin = "Modern";
            switchToHand();
        });
        print("Modern hand button bound.");
    } else {
        print("Error: Modern hand button missing onButtonPinched property!");
    }
    print("Switched to Modern skin.");
}

// Switch to Hand skin and bind its buttons
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
    
    // Bind Hand buttons
    if (script.handSkinButton && script.handSkinButton.onButtonPinched) {
        script.handSkinButton.onButtonPinched.clear(); // Clear any existing handlers
        script.handSkinButton.onButtonPinched.add(function() {
            print("Hand skin button pressed.");
            if (previousSkin === "Y2K") {
                switchToModern();
            } else {
                switchToY2K();
            }
        });
        print("Hand skin button bound.");
    } else {
        print("Error: Hand skin button missing onButtonPinched property!");
    }
    if (script.handHandButton && script.handHandButton.onButtonPinched) {
        script.handHandButton.onButtonPinched.clear();
        script.handHandButton.onButtonPinched.add(function() {
            print("Hand hand button pressed.");
            if (previousSkin === "Y2K") {
                switchToY2K();
            } else {
                switchToModern();
            }
        });
        print("Hand hand button bound.");
    } else {
        print("Error: Hand hand button missing onButtonPinched property!");
    }
    print("Switched to Hand skin.");
}

// Bind welcome button at initialization
function bindWelcomeHandler() {
    if (script.acknowledgeButton && script.acknowledgeButton.onButtonPinched) {
        script.acknowledgeButton.onButtonPinched.add(function() {
            print("Acknowledge button pressed.");
            switchToY2K();
        });
        print("Acknowledge button bound.");
    } else {
        print("Error: Acknowledge button missing onButtonPinched property!");
    }
}

// Initialize the script
if (validateInputs()) {
    // Start with welcome prefab enabled, all skins disabled
    script.welcomePrefab.enabled = true;
    script.musicPlayerY2K.enabled = false;
    script.musicPlayerManagerY2K.enabled = false;
    script.musicPlayerModern.enabled = false;
    script.musicPlayerManagerModern.enabled = false;
    script.musicPlayerHand.enabled = false;
    script.musicPlayerManagerHand.enabled = false;

    // Bind welcome handler only at startup
    bindWelcomeHandler();
} else {
    print("Script initialization failed due to invalid inputs.");
}

// Cleanup function
script.destroy = function() {
    stopAudioForManager(script.musicPlayerManagerY2K);
    stopAudioForManager(script.musicPlayerManagerModern);
    stopAudioForManager(script.musicPlayerManagerHand);
};