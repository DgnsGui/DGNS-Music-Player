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
    // DEBUG: Log attempt to stop audio
    // print("DEBUG: Attempting to stop audio for manager: " + (manager ? manager.name : "null"));
    if (manager && manager.enabled && manager.getComponent) {
        var managerScript = manager.getComponent("Component.ScriptComponent");
        if (managerScript && managerScript.api && typeof managerScript.api.stopTrack === 'function') {
            print("DEBUG: Calling stopTrack() on " + manager.name);
            try {
                managerScript.api.stopTrack();
            } catch (e) {
                print("ERROR: Failed to call stopTrack() on " + manager.name + ": " + e);
            }
        } else {
             // print("DEBUG: stopTrack API not found or not callable on manager: " + manager.name);
        }
    } else {
        // print("DEBUG: Manager null, disabled, or lacks getComponent for stopAudio: " + (manager ? manager.name : "null"));
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
    // DEBUG: Log entry into this function
    print("DEBUG: Entering switchToSkin. Target: " + newSkinName + ", Current: " + currentSkin);

    if (!SKINS[newSkinName.toUpperCase()]) {
        print("ERROR: Invalid target skin name: " + newSkinName);
        return;
    }
    // Allow switching even if currentSkin state seems off, maybe it helps recover
    // if (currentSkin === newSkinName) {
    //    print("WARN: Already on skin: " + newSkinName);
    //    return; // Already on this skin
    //}

    print("Switching from skin '" + currentSkin + "' to '" + newSkinName + "'");

    // Get data for current and new skins from the mapping
    const currentSkinData = skinMappings[currentSkin];
    const newSkinData = skinMappings[newSkinName];

    if (!newSkinData) {
        print("ERROR: Could not find mapping for target skin: " + newSkinName);
        return;
    }

    // --- Disable Current Skin ---
    print("DEBUG: Disabling current skin elements for: " + currentSkin);
    if (currentSkinData) {
        // Stop audio FIRST for the outgoing manager
        if (currentSkinData.manager) {
             print("DEBUG: Calling stopAudioForManager for current skin: " + currentSkin);
             stopAudioForManager(currentSkinData.manager);
        } else {
             print("DEBUG: No manager to stop audio for current skin: " + currentSkin);
        }
        // Then disable the objects
        if (currentSkinData.skin) {
            print("DEBUG: Disabling skin object: " + currentSkinData.skin.name);
            currentSkinData.skin.enabled = false;
        }
        if (currentSkinData.manager) {
            print("DEBUG: Disabling manager object: " + currentSkinData.manager.name);
            currentSkinData.manager.enabled = false;
        }
    } else if (currentSkin === SKINS.WELCOME && script.welcomePrefab) {
         print("DEBUG: Disabling Welcome Prefab");
         script.welcomePrefab.enabled = false;
    } else {
         print("DEBUG: No current skin data found to disable for: " + currentSkin);
    }


    // --- Enable New Skin ---
    print("DEBUG: Enabling new skin elements for: " + newSkinName);
    if (newSkinData.skin) {
        print("DEBUG: Enabling skin object: " + newSkinData.skin.name);
        newSkinData.skin.enabled = true;
    } else {
         print("DEBUG: No skin object to enable for: " + newSkinName);
    }
    if (newSkinData.manager) {
         print("DEBUG: Enabling manager object: " + newSkinData.manager.name);
        newSkinData.manager.enabled = true;
    } else {
        print("DEBUG: No manager object to enable for: " + newSkinName);
    }

    // Update the current skin state tracker
    var previousSkin = currentSkin;
    currentSkin = newSkinName;
    print("Successfully switched to skin: " + currentSkin + " (from: " + previousSkin + ")");
}


// Bind a callback function to a button's pinch event with error checking
function bindButton(buttonScriptComponent, buttonName, callback) {
    if (!buttonScriptComponent) {
        print("ERROR: PlayerSkinManager - Button ScriptComponent input not assigned for: " + buttonName);
        return;
    }

    if (typeof buttonScriptComponent.onButtonPinched !== 'object' || typeof buttonScriptComponent.onButtonPinched.add !== 'function') {
        print("ERROR: PlayerSkinManager - Input ScriptComponent for '" + buttonName + "' does not have a valid 'onButtonPinched' event. Check the PinchButton script setup and Inspector assignment.");
        return;
    }

    try {
        buttonScriptComponent.onButtonPinched.add(function() {
            // DEBUG: Log that the pinch event was received *before* any logic
            print("DEBUG: Pinch event RECEIVED for button: " + buttonName);
            // DEBUG: Log the current skin state *at the moment of the pinch*
            print("DEBUG: Current skin state when '" + buttonName + "' pinched: " + currentSkin);

            // Check if the button press is relevant for the current skin
            var isRelevant = false;
            if (buttonName === "Acknowledge" && currentSkin === SKINS.WELCOME) isRelevant = true;
            else if (buttonName === "Y2K Skin" && currentSkin === SKINS.Y2K) isRelevant = true;
            else if (buttonName === "Y2K Hand" && currentSkin === SKINS.Y2K) isRelevant = true;
            else if (buttonName === "Modern Skin" && currentSkin === SKINS.MODERN) isRelevant = true;
            else if (buttonName === "Modern Hand" && currentSkin === SKINS.MODERN) isRelevant = true;
            else if (buttonName === "Hand Back" && currentSkin === SKINS.HAND) isRelevant = true;

            // DEBUG: Log whether the button press is considered relevant
            print("DEBUG: Is '" + buttonName + "' relevant for current skin '" + currentSkin + "'? " + isRelevant);

            if (isRelevant)
            {
                 print("EVENT: Button pinch is relevant, executing callback for: " + buttonName);
                 callback(); // Call the specific switchToSkin function
            } else {
                 print("INFO: Pinch event ignored for " + buttonName + " as it's not relevant for the current skin '" + currentSkin + "'. Check 'currentSkin' state if this is unexpected.");
            }
        });
        print("Binding successful for button: " + buttonName);
    } catch (e) {
        print("ERROR: PlayerSkinManager - Failed to bind pinch event for " + buttonName + ": " + e);
    }
}


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
        switchToSkin(SKINS.Y2K);
    });

    // Modern -> Hand
    bindButton(script.modernHandButton, "Modern Hand", function() {
        switchToSkin(SKINS.HAND);
    });

    // Hand -> Y2K
    bindButton(script.handHandButton, "Hand Back", function() {
        switchToSkin(SKINS.Y2K);
    });

    print("Button handlers bound.");
}

// --- Initialization ---
function initialize() {
    print("Initializing PlayerSkinManager...");

    if (!validateInputs()) {
        print("ERROR: PlayerSkinManager initialization failed due to missing inputs. Please check assignments in the Inspector.");
        return;
    }

    // Populate the skin mappings
     print("DEBUG: Populating skin mappings...");
    skinMappings = {
        [SKINS.WELCOME]: { skin: script.welcomePrefab, manager: null },
        [SKINS.Y2K]: { skin: script.musicPlayerY2K, manager: script.musicPlayerManagerY2K },
        [SKINS.MODERN]: { skin: script.musicPlayerModern, manager: script.musicPlayerManagerModern },
        [SKINS.HAND]: { skin: script.musicPlayerHand, manager: script.musicPlayerManagerHand }
    };
     print("DEBUG: Skin mappings populated.");

    // Set initial state: Disable everything, then enable Welcome
    disableAllSkinsAndManagers();
    if (script.welcomePrefab) {
        script.welcomePrefab.enabled = true;
        currentSkin = SKINS.WELCOME;
        print("Initial state set: Welcome screen enabled. Current skin: " + currentSkin);
    } else {
        print("WARN: Welcome prefab missing, attempting to start with Y2K skin.");
        switchToSkin(SKINS.Y2K); // Fallback
    }

    // Bind button events
    bindAllHandlers();

    print("PlayerSkinManager initialized successfully.");
}

// --- Script Entry Point & Cleanup ---

initialize();

script.destroy = function() {
    print("Destroying PlayerSkinManager...");
    stopAudioForManager(script.musicPlayerManagerY2K);
    stopAudioForManager(script.musicPlayerManagerModern);
    stopAudioForManager(script.musicPlayerManagerHand);
    disableAllSkinsAndManagers();
    print("PlayerSkinManager destroyed.");
};