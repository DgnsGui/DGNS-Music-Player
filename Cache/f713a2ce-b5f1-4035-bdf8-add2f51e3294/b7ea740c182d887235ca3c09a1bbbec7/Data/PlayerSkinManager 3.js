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
var previousSkin = "Y2K"; // Default previous skin
var currentSkin = "Welcome"; // Track current active skin

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

// Helper function to disable all skins
function disableAllSkins() {
    script.welcomePrefab.enabled = false;
    script.musicPlayerY2K.enabled = false;
    script.musicPlayerManagerY2K.enabled = false;
    script.musicPlayerModern.enabled = false;
    script.musicPlayerManagerModern.enabled = false;
    script.musicPlayerHand.enabled = false;
    script.musicPlayerManagerHand.enabled = false;
}

// Switch to Y2K skin
function switchToY2K() {
    print("Switching to Y2K skin...");
    // Stop audio for all other players
    stopAudioForManager(script.musicPlayerManagerModern);
    stopAudioForManager(script.musicPlayerManagerHand);
    
    // Disable all skins first
    disableAllSkins();
    
    // Enable Y2K skin
    script.musicPlayerY2K.enabled = true;
    script.musicPlayerManagerY2K.enabled = true;
    
    // Update current skin
    currentSkin = "Y2K";
    print("Switched to Y2K skin. Current skin: " + currentSkin);
}

// Switch to Modern skin
function switchToModern() {
    print("Switching to Modern skin...");
    // Stop audio for all other players
    stopAudioForManager(script.musicPlayerManagerY2K);
    stopAudioForManager(script.musicPlayerManagerHand);
    
    // Disable all skins first
    disableAllSkins();
    
    // Enable Modern skin
    script.musicPlayerModern.enabled = true;
    script.musicPlayerManagerModern.enabled = true;
    
    // Update current skin
    currentSkin = "Modern";
    print("Switched to Modern skin. Current skin: " + currentSkin);
}

// Switch to Hand skin
function switchToHand() {
    print("Switching to Hand skin...");
    // Remember previous skin before switching to hand
    if (currentSkin !== "Hand") {
        previousSkin = currentSkin;
    }
    
    // Stop audio for all other players
    stopAudioForManager(script.musicPlayerManagerY2K);
    stopAudioForManager(script.musicPlayerManagerModern);
    
    // Disable all skins first
    disableAllSkins();
    
    // Enable Hand skin
    script.musicPlayerHand.enabled = true;
    script.musicPlayerManagerHand.enabled = true;
    
    // Update current skin
    currentSkin = "Hand";
    print("Switched to Hand skin. Previous skin: " + previousSkin);
}

// Return to previous skin from Hand skin
function returnToPreviousSkin() {
    print("Returning to previous skin: " + previousSkin);
    if (previousSkin === "Y2K") {
        switchToY2K();
    } else if (previousSkin === "Modern") {
        switchToModern();
    } else {
        // Default fallback
        switchToY2K();
    }
}

// Bind all button handlers at initialization
function bindHandlers() {
    // Welcome prefab acknowledge button
    if (script.acknowledgeButton) {
        // Try multiple ways to access the button event
        if (script.acknowledgeButton.onButtonPinched) {
            script.acknowledgeButton.onButtonPinched.add(function() {
                print("Acknowledge button pressed (direct method).");
                switchToY2K();
            });
            print("Bound acknowledge button using direct method.");
        } else if (script.acknowledgeButton.api && script.acknowledgeButton.api.onButtonPinched) {
            script.acknowledgeButton.api.onButtonPinched.add(function() {
                print("Acknowledge button pressed (api method).");
                switchToY2K();
            });
            print("Bound acknowledge button using api method.");
        } else {
            print("Error: Cannot find onButtonPinched event on acknowledge button!");
            // Last resort - try to manually check if the button has been pressed
            var lastUpdate = getTime();
            script.createEvent("UpdateEvent").bind(function() {
                // Check if the welcome prefab is still active
                if (script.welcomePrefab.enabled && script.acknowledgeButton.pressedThisFrame) {
                    print("Acknowledge button pressed (update method).");
                    switchToY2K();
                }
            });
            print("Set up fallback method for acknowledge button.");
        }
    } else {
        print("Error: Acknowledge button is not available!");
    }

    // Y2K skin buttons
    if (script.y2kSkinButton) {
        if (script.y2kSkinButton.onButtonPinched) {
            script.y2kSkinButton.onButtonPinched.add(function() {
                print("Y2K skin button pressed (direct).");
                switchToModern();
            });
        } else if (script.y2kSkinButton.api && script.y2kSkinButton.api.onButtonPinched) {
            script.y2kSkinButton.api.onButtonPinched.add(function() {
                print("Y2K skin button pressed (api).");
                switchToModern();
            });
        }
    }
    
    if (script.y2kHandButton) {
        if (script.y2kHandButton.onButtonPinched) {
            script.y2kHandButton.onButtonPinched.add(function() {
                print("Y2K hand button pressed (direct).");
                switchToHand();
            });
        } else if (script.y2kHandButton.api && script.y2kHandButton.api.onButtonPinched) {
            script.y2kHandButton.api.onButtonPinched.add(function() {
                print("Y2K hand button pressed (api).");
                switchToHand();
            });
        }
    }

    // Modern skin buttons
    if (script.modernSkinButton) {
        if (script.modernSkinButton.onButtonPinched) {
            script.modernSkinButton.onButtonPinched.add(function() {
                print("Modern skin button pressed (direct).");
                switchToY2K();
            });
        } else if (script.modernSkinButton.api && script.modernSkinButton.api.onButtonPinched) {
            script.modernSkinButton.api.onButtonPinched.add(function() {
                print("Modern skin button pressed (api).");
                switchToY2K();
            });
        }
    }
    
    if (script.modernHandButton) {
        if (script.modernHandButton.onButtonPinched) {
            script.modernHandButton.onButtonPinched.add(function() {
                print("Modern hand button pressed (direct).");
                switchToHand();
            });
        } else if (script.modernHandButton.api && script.modernHandButton.api.onButtonPinched) {
            script.modernHandButton.api.onButtonPinched.add(function() {
                print("Modern hand button pressed (api).");
                switchToHand();
            });
        }
    }

    // Hand skin buttons
    if (script.handSkinButton) {
        if (script.handSkinButton.onButtonPinched) {
            script.handSkinButton.onButtonPinched.add(function() {
                print("Hand skin button pressed (direct).");
                if (previousSkin === "Y2K") {
                    switchToModern();
                } else {
                    switchToY2K();
                }
            });
        } else if (script.handSkinButton.api && script.handSkinButton.api.onButtonPinched) {
            script.handSkinButton.api.onButtonPinched.add(function() {
                print("Hand skin button pressed (api).");
                if (previousSkin === "Y2K") {
                    switchToModern();
                } else {
                    switchToY2K();
                }
            });
        }
    }
    
    if (script.handHandButton) {
        if (script.handHandButton.onButtonPinched) {
            script.handHandButton.onButtonPinched.add(function() {
                print("Hand hand button pressed (direct).");
                returnToPreviousSkin();
            });
        } else if (script.handHandButton.api && script.handHandButton.api.onButtonPinched) {
            script.handHandButton.api.onButtonPinched.add(function() {
                print("Hand hand button pressed (api).");
                returnToPreviousSkin();
            });
        }
    }
}

// Initialize the script
if (validateInputs()) {
    // Start with welcome prefab enabled, all skins disabled
    disableAllSkins();
    script.welcomePrefab.enabled = true;
    currentSkin = "Welcome";

    // Bind all handlers once (buttons only trigger when their skin is enabled)
    bindHandlers();
    print("MusicPlayerSkinManager initialized successfully. Starting with Welcome screen.");
} else {
    print("Script initialization failed due to invalid inputs.");
}

// Cleanup function (optional, since handlers persist with buttons)
script.destroy = function() {
    // Stop all audio on destroy
    stopAudioForManager(script.musicPlayerManagerY2K);
    stopAudioForManager(script.musicPlayerManagerModern);
    stopAudioForManager(script.musicPlayerManagerHand);
    print("MusicPlayerSkinManager cleaned up.");
};