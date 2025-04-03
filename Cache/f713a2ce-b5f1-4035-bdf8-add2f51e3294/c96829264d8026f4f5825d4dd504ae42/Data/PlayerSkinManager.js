// Lens Studio Script: PlayerSkinManager.JS
// Manages switching between different music player skins/layouts.

// ----- INPUTS -----

// @ui {"widget":"group_start", "label":"Welcome Screen"}
// @input SceneObject welcomePrefab {"label":"Welcome Prefab"} // The initial welcome screen object
// @input Component.ScriptComponent acknowledgeButton {"label":"Acknowledge Button"} // Button script on the Welcome screen
// @ui {"widget":"group_end"}

// @ui {"widget":"group_start", "label":"Y2K Skin"}
// @input SceneObject musicPlayerY2K {"label":"Player Prefab"} // Y2K skin layout object
// @input SceneObject musicPlayerManagerY2K {"label":"Player Manager"} // Y2K logic/audio manager object
// @input Component.ScriptComponent y2kSkinButton {"label":"Skin Button"} // Button script in Y2K skin to switch skin
// @input Component.ScriptComponent y2kHandButton {"label":"Hand Button"} // Button script in Y2K skin to switch to hand tracking
// @ui {"widget":"group_end"}

// @ui {"widget":"group_start", "label":"Modern Skin"}
// @input SceneObject musicPlayerModern {"label":"Player Prefab"} // Modern skin layout object
// @input SceneObject musicPlayerManagerModern {"label":"Player Manager"} // Modern logic/audio manager object
// @input Component.ScriptComponent modernSkinButton {"label":"Skin Button"} // Button script in Modern skin to switch skin (back to Y2K)
// @input Component.ScriptComponent modernHandButton {"label":"Hand Button"} // Button script in Modern skin to switch to hand tracking
// @ui {"widget":"group_end"}

// @ui {"widget":"group_start", "label":"Hand Skin"}
// @input SceneObject musicPlayerHand {"label":"Player Prefab"} // Hand tracking layout object
// @input SceneObject musicPlayerManagerHand {"label":"Player Manager"} // Hand logic/audio manager object
// @input Component.ScriptComponent handHandButton {"label":"Disable Hand Button"} // Button script in Hand skin to switch back to Y2K
// @ui {"widget":"group_end"}
// Note: Removed handSkinButton input as description implies only one button in Hand skin.

// ----- SCRIPT LOGIC -----

// Skin states enumeration
const SKINS = {
    WELCOME: "welcome",
    Y2K: "y2k",
    MODERN: "modern",
    HAND: "hand"
};
Object.freeze(SKINS); // Prevent accidental modification

// Track current skin state
var currentSkin = SKINS.WELCOME;

// Mapping of skin names to their associated objects
var skinMappings = {}; // Will be populated in initialize()

// Expose script API if needed (optional for this setup)
// script.api.PlayerSkinManager = script;

// --- Helper Functions ---

// Validate essential SceneObject inputs are assigned
function validateInputs() {
    var valid = true;
    const inputsToCheck = [
        { obj: script.welcomePrefab, name: "Welcome Prefab" },
        { obj: script.musicPlayerY2K, name: "Music Player Y2K" },
        { obj: script.musicPlayerManagerY2K, name: "Music Player Manager Y2K" },
        { obj: script.musicPlayerModern, name: "Music Player Modern" },
        { obj: script.musicPlayerManagerModern, name: "Music Player Manager Modern" },
        { obj: script.musicPlayerHand, name: "Music Player Hand" },
        { obj: script.musicPlayerManagerHand, name: "Music Player Manager Hand" }
    ];
    inputsToCheck.forEach(function(input) {
        if (!input.obj) {
            print("ERROR: PlayerSkinManager - Input missing: " + input.name);
            valid = false;
        }
    });
    // Button script components are checked later in bindButton
    return valid;
}

// Attempts to call stopTrack() on a manager's script component API
function stopAudioForManager(manager) {
    if (manager && manager.enabled && manager.getComponent) { // Only stop if manager exists and is currently enabled
        var managerScript = manager.getComponent("Component.ScriptComponent");
        // Check if the script component and its API/function exist
        if (managerScript && managerScript.api && typeof managerScript.api.stopTrack === 'function') {
            // print("Stopping audio for manager: " + manager.name); // Optional debug log
            try {
                managerScript.api.stopTrack();
            } catch (e) {
                print("ERROR: Failed to call stopTrack() on " + manager.name + ": " + e);
            }
        } else {
             // Optional: Warn if stopTrack isn't found where expected
             // print("WARN: Could not find stopTrack API on manager: " + manager.name);
        }
    }
}

// Disable all skin prefabs and their managers
function disableAllSkinsAndManagers() {
    print("Disabling all skins and managers...");
    if (script.welcomePrefab) script.welcomePrefab.enabled = false;
    if (script.musicPlayerY2K) script.musicPlayerY2K.enabled = false;
    if (script.musicPlayerManagerY2K) script.musicPlayerManagerY2K.enabled = false;
    if (script.musicPlayerModern) script.musicPlayerModern.enabled = false;
    if (script.musicPlayerManagerModern) script.musicPlayerManagerModern.enabled = false;
    if (script.musicPlayerHand) script.musicPlayerHand.enabled = false;
    if (script.musicPlayerManagerHand) script.musicPlayerManagerHand.enabled = false;
}

// Central function to switch between skins
function switchToSkin(newSkinName) {
    if (!SKINS[newSkinName.toUpperCase()]) {
        print("ERROR: Invalid target skin name: " + newSkinName);
        return;
    }
    if (currentSkin === newSkinName) {
        print("WARN: Already on skin: " + newSkinName);
        return; // Already on this skin
    }

    print("Switching from skin '" + currentSkin + "' to '" + newSkinName + "'");

    // Get data for current and new skins from the mapping
    const currentSkinData = skinMappings[currentSkin];
    const newSkinData = skinMappings[newSkinName];

    if (!newSkinData) {
        print("ERROR: Could not find mapping for target skin: " + newSkinName);
        return; // Should not happen if SKINS and mappings are correct
    }

    // --- Disable Current Skin ---
    if (currentSkinData) {
        // Stop audio FIRST for the outgoing manager (if it exists and has the function)
        if (currentSkinData.manager) {
            stopAudioForManager(currentSkinData.manager);
        }
        // Then disable the objects
        if (currentSkinData.skin) {
            currentSkinData.skin.enabled = false;
        }
        if (currentSkinData.manager) {
            currentSkinData.manager.enabled = false;
        }
    } else if (currentSkin === SKINS.WELCOME && script.welcomePrefab) {
         // Special case for disabling the initial Welcome screen
         script.welcomePrefab.enabled = false;
    }


    // --- Enable New Skin ---
    if (newSkinData.skin) {
        newSkinData.skin.enabled = true;
    }
    if (newSkinData.manager) {
        newSkinData.manager.enabled = true;
        // Optional: You might want to call a 'play' or 'resume' function here
        // if the manager should start playing immediately upon being enabled.
    }

    // Update the current skin state tracker
    currentSkin = newSkinName;
    print("Successfully switched to skin: " + currentSkin);
}

// Bind a callback function to a button's pinch event with error checking
// *** THIS IS THE CORRECTED VERSION ***
function bindButton(buttonScriptComponent, buttonName, callback) {
    if (!buttonScriptComponent) {
        print("ERROR: PlayerSkinManager - Button ScriptComponent input not assigned for: " + buttonName);
        return; // Cannot bind if the input is empty
    }

    // --- CORRECTION ---
    // Directly check for and use onButtonPinched on the input ScriptComponent itself.
    // This assumes the PinchButton script makes the event available directly on the component.
    if (typeof buttonScriptComponent.onButtonPinched !== 'object' || typeof buttonScriptComponent.onButtonPinched.add !== 'function') {
        print("ERROR: PlayerSkinManager - Input ScriptComponent for '" + buttonName + "' does not have a valid 'onButtonPinched' event. Check the PinchButton script setup and Inspector assignment.");
        // Optional Debugging: Uncomment to see available properties
        // print("Debug Info for " + buttonName + " ScriptComponent properties:");
        // for (var key in buttonScriptComponent) {
        //    if (typeof buttonScriptComponent[key] !== 'object' && typeof buttonScriptComponent[key] !== 'function') {
        //        print("  " + key + ": " + buttonScriptComponent[key]);
        //    } else {
        //        print("  " + key + ": [" + typeof buttonScriptComponent[key] + "]");
        //    }
        // }
        // if(buttonScriptComponent.api) {
        //    print("Debug Info for " + buttonName + " ScriptComponent.api properties:");
        //    for (var key in buttonScriptComponent.api) { print("  api." + key); }
        // }
        return;
    }

    // Add the listener directly to the ScriptComponent's onButtonPinched event
    try {
        // Use buttonScriptComponent directly here
        buttonScriptComponent.onButtonPinched.add(function() {
            print("EVENT: Button pinched: " + buttonName + " (Current Skin: " + currentSkin + ")");
            // Check if the button press is relevant for the current skin
            if ((buttonName === "Acknowledge" && currentSkin === SKINS.WELCOME) ||
                (buttonName === "Y2K Skin" && currentSkin === SKINS.Y2K) ||
                (buttonName === "Y2K Hand" && currentSkin === SKINS.Y2K) ||
                (buttonName === "Modern Skin" && currentSkin === SKINS.MODERN) ||
                (buttonName === "Modern Hand" && currentSkin === SKINS.MODERN) ||
                (buttonName === "Hand Back" && currentSkin === SKINS.HAND))
            {
                 callback();
            } else {
                 print("INFO: Pinch event ignored for " + buttonName + " as current skin is " + currentSkin);
            }
        });
        print("Binding successful for button: " + buttonName);
    } catch (e) {
        print("ERROR: PlayerSkinManager - Failed to bind pinch event for " + buttonName + ": " + e);
    }
}
// *** END OF CORRECTED FUNCTION ***


// Bind all the button handlers
function bindAllHandlers() {
    print("Binding button handlers...");

    // Welcome -> Y2K
    bindButton(script.acknowledgeButton, "Acknowledge", function() {
        switchToSkin(SKINS.Y2K);
    });

    // Y2K -> Modern
    bindButton(script.y2kSkinButton, "Y2K Skin", function() {
        switchToSkin(SKINS.MODERN);
    });

    // Y2K -> Hand
    bindButton(script.y2kHandButton, "Y2K Hand", function() {
        switchToSkin(SKINS.HAND);
    });

    // Modern -> Y2K
    bindButton(script.modernSkinButton, "Modern Skin", function() {
        switchToSkin(SKINS.Y2K); // Target: Y2K
    });

    // Modern -> Hand
    bindButton(script.modernHandButton, "Modern Hand", function() {
        switchToSkin(SKINS.HAND); // Target: Hand
    });

    // Hand -> Y2K
    bindButton(script.handHandButton, "Hand Back", function() {
        switchToSkin(SKINS.Y2K); // Target: Y2K
    });

    print("Button handlers bound.");
}

// --- Initialization ---
function initialize() {
    print("Initializing PlayerSkinManager...");

    if (!validateInputs()) {
        print("ERROR: PlayerSkinManager initialization failed due to missing inputs. Please check assignments in the Inspector.");
        return; // Stop initialization if inputs are missing
    }

    // Populate the skin mappings
    skinMappings = {
        [SKINS.WELCOME]: { skin: script.welcomePrefab, manager: null }, // Welcome has no manager
        [SKINS.Y2K]: { skin: script.musicPlayerY2K, manager: script.musicPlayerManagerY2K },
        [SKINS.MODERN]: { skin: script.musicPlayerModern, manager: script.musicPlayerManagerModern },
        [SKINS.HAND]: { skin: script.musicPlayerHand, manager: script.musicPlayerManagerHand }
    };

    // Set initial state: Disable everything, then enable Welcome
    disableAllSkinsAndManagers();
    if (script.welcomePrefab) {
        script.welcomePrefab.enabled = true;
        currentSkin = SKINS.WELCOME;
        print("Initial state set: Welcome screen enabled.");
    } else {
        // Fallback if welcome prefab is missing (though validation should catch this)
        print("WARN: Welcome prefab missing, attempting to start with Y2K skin.");
        switchToSkin(SKINS.Y2K); // Try starting with Y2K if Welcome fails
    }


    // Bind button events
    bindAllHandlers();

    print("PlayerSkinManager initialized successfully.");
}

// --- Script Entry Point & Cleanup ---

// Run initialization when the script starts
initialize();

// Cleanup function when the script/object is destroyed
script.destroy = function() {
    print("Destroying PlayerSkinManager...");
    // Attempt to stop audio on all managers before disabling
    stopAudioForManager(script.musicPlayerManagerY2K);
    stopAudioForManager(script.musicPlayerManagerModern);
    stopAudioForManager(script.musicPlayerManagerHand);
    // Ensure all associated objects are disabled on cleanup
    disableAllSkinsAndManagers();
    print("PlayerSkinManager destroyed.");
};