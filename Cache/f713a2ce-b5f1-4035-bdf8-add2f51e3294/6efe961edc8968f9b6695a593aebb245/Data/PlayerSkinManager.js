// Lens Studio Script: PlayerSkinManager.JS
// Manages switching between different music player skins/layouts.

// ----- INPUTS -----

// @ui {"widget":"group_start", "label":"Welcome Screen"}
// @input SceneObject welcomePrefab {"label":"Welcome Prefab"}
// @input Component.ScriptComponent acknowledgeButton {"label":"Acknowledge Button"} // Assign PinchButton Script Component
// @ui {"widget":"group_end"}

// @ui {"widget":"group_start", "label":"Y2K Skin"}
// @input SceneObject musicPlayerY2K {"label":"Player Prefab"}
// @input SceneObject musicPlayerManagerY2K {"label":"Player Manager"}
// @input Component.ScriptComponent y2kSkinButton {"label":"Skin Button"} // Assign PinchButton Script Component
// @input Component.ScriptComponent y2kHandButton {"label":"Hand Button"} // Assign PinchButton Script Component
// @ui {"widget":"group_end"}

// @ui {"widget":"group_start", "label":"Modern Skin"}
// @input SceneObject musicPlayerModern {"label":"Player Prefab"}
// @input SceneObject musicPlayerManagerModern {"label":"Player Manager"}
// @input Component.ScriptComponent modernSkinButton {"label":"Skin Button"} // Assign PinchButton Script Component
// @input Component.ScriptComponent modernHandButton {"label":"Hand Button"} // Assign PinchButton Script Component
// @ui {"widget":"group_end"}

// @ui {"widget":"group_start", "label":"Hand Skin"}
// @input SceneObject musicPlayerHand {"label":"Player Prefab"}
// @input SceneObject musicPlayerManagerHand {"label":"Player Manager"}
// @input Component.ScriptComponent handHandButton {"label":"Disable Hand Button"} // Assign PinchButton Script Component
// @ui {"widget":"group_end"}

// ----- SCRIPT LOGIC -----

// Skin states enumeration
const SKINS = {
    WELCOME: "welcome",
    Y2K: "y2k",
    MODERN: "modern",
    HAND: "hand"
};
Object.freeze(SKINS);

// Track current skin state
var currentSkin = SKINS.WELCOME;

// Mapping of skin names to their associated objects
var skinMappings = {};

// --- Helper Functions ---

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
    return valid;
}

function stopAudioForManager(manager) {
    if (manager && manager.enabled && manager.getComponent) {
        var managerScript = manager.getComponent("Component.ScriptComponent");
        if (managerScript && managerScript.api && typeof managerScript.api.stopTrack === 'function') {
            print("DEBUG: Calling stopTrack() on " + manager.name);
            try {
                managerScript.api.stopTrack();
            } catch (e) {
                print("ERROR: Failed to call stopTrack() on " + manager.name + ": " + e);
            }
        }
    }
}

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

function switchToSkin(newSkinName) {
    print("DEBUG: Entering switchToSkin. Target: " + newSkinName + ", Current: " + currentSkin);

    if (!SKINS[newSkinName.toUpperCase()]) {
        print("ERROR: Invalid target skin name: " + newSkinName);
        return;
    }

    print("Switching from skin '" + currentSkin + "' to '" + newSkinName + "'");

    const currentSkinData = skinMappings[currentSkin];
    const newSkinData = skinMappings[newSkinName];

    if (!newSkinData) {
        print("ERROR: Could not find mapping for target skin: " + newSkinName);
        return;
    }

    // --- Disable Current Skin ---
    print("DEBUG: Disabling current skin elements for: " + currentSkin);
    if (currentSkinData) {
        if (currentSkinData.manager) {
             print("DEBUG: Calling stopAudioForManager for current skin: " + currentSkin);
             stopAudioForManager(currentSkinData.manager);
        }
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
    }
    if (newSkinData.manager) {
         print("DEBUG: Enabling manager object: " + newSkinData.manager.name);
        newSkinData.manager.enabled = true;
    }

    var previousSkin = currentSkin;
    currentSkin = newSkinName;
    print("Successfully switched to skin: " + currentSkin + " (from: " + previousSkin + ")");
}


// Bind a callback function to a button's pinch event with error checking
// *** THIS VERSION USES .subscribe() ***
function bindButton(buttonScriptComponent, buttonName, callback) {
    if (!buttonScriptComponent) {
        print("ERROR: PlayerSkinManager - Button ScriptComponent input not assigned for: " + buttonName);
        return;
    }

    // Check if the onButtonPinched property exists
    if (!buttonScriptComponent.onButtonPinched) {
        print("ERROR: PlayerSkinManager - Input ScriptComponent for '" + buttonName + "' is missing the 'onButtonPinched' property. Check script/component type and Inspector assignment.");
        return;
    }

    // Check if the onButtonPinched property has a 'subscribe' method (common for PublicApi)
    if (typeof buttonScriptComponent.onButtonPinched.subscribe !== 'function') {
        print("ERROR: PlayerSkinManager - 'onButtonPinched' property for '" + buttonName + "' does not have a 'subscribe' function. Trying '.add()' as fallback...");
        // Fallback attempt: Try .add() again just in case
        if (typeof buttonScriptComponent.onButtonPinched.add !== 'function') {
             print("ERROR: PlayerSkinManager - 'onButtonPinched' for '" + buttonName + "' also does not have an 'add' function. Cannot bind event.");
             // Optional Debugging: Log the type or properties of onButtonPinched
             // print("DEBUG: Type of onButtonPinched for '" + buttonName + "': " + typeof buttonScriptComponent.onButtonPinched);
             // print("DEBUG: Properties of onButtonPinched for '" + buttonName + "':");
             // try { for(var key in buttonScriptComponent.onButtonPinched) { print("  ." + key); } } catch (e) { print(" Could not inspect properties.");}
             return;
        }
        // If .add() exists, use it (this block handles the fallback)
        try {
             buttonScriptComponent.onButtonPinched.add(function(/* add often doesn't pass event data */) {
                handlePinchEvent(buttonName, "add"); // Call common handler
             });
             print("Binding successful using fallback '.add()' for button: " + buttonName);
        } catch(e) {
             print("ERROR: PlayerSkinManager - Failed to bind pinch event using fallback '.add()' for " + buttonName + ": " + e);
        }
        return; // Exit after attempting fallback
    }

    // --- Primary attempt: Bind using subscribe() ---
    try {
        buttonScriptComponent.onButtonPinched.subscribe(function(eventData) { // PublicApi often passes event data
            handlePinchEvent(buttonName, "subscribe", eventData); // Call common handler
        });
        print("Binding successful using subscribe() for button: " + buttonName);
    } catch (e) {
        print("ERROR: PlayerSkinManager - Failed to bind pinch event using subscribe() for " + buttonName + ": " + e);
    }
}

// Common handler logic for pinch events (called by subscribe or add)
function handlePinchEvent(buttonName, methodUsed, eventData) {
     // DEBUG: Log that the pinch event was received
     print("DEBUG: Pinch event RECEIVED via " + methodUsed + "() for button: " + buttonName);
     // DEBUG: Log the current skin state *at the moment of the pinch*
     print("DEBUG: Current skin state when '" + buttonName + "' pinched: " + currentSkin);
     // DEBUG: Optionally log eventData if needed (subscribe usually provides it)
     // if (eventData) { print("DEBUG: Event data: " + JSON.stringify(eventData)); }

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
         // Find the correct callback based on buttonName and call switchToSkin
         switch(buttonName) {
             case "Acknowledge": switchToSkin(SKINS.Y2K); break;
             case "Y2K Skin":    switchToSkin(SKINS.MODERN); break;
             case "Y2K Hand":    switchToSkin(SKINS.HAND); break;
             case "Modern Skin": switchToSkin(SKINS.Y2K); break;
             case "Modern Hand": switchToSkin(SKINS.HAND); break;
             case "Hand Back":   switchToSkin(SKINS.Y2K); break;
         }
    } else {
         print("INFO: Pinch event ignored for " + buttonName + " as it's not relevant for the current skin '" + currentSkin + "'. Check 'currentSkin' state if this is unexpected.");
    }
}


// Bind all the button handlers (calls the modified bindButton)
function bindAllHandlers() {
    print("Binding button handlers...");
    // Pass only the button component and name; the callback logic is now in handlePinchEvent
    bindButton(script.acknowledgeButton, "Acknowledge");
    bindButton(script.y2kSkinButton, "Y2K Skin");
    bindButton(script.y2kHandButton, "Y2K Hand");
    bindButton(script.modernSkinButton, "Modern Skin");
    bindButton(script.modernHandButton, "Modern Hand");
    bindButton(script.handHandButton, "Hand Back");
    print("Button handlers bound.");
}

// --- Initialization ---
function initialize() {
    print("Initializing PlayerSkinManager...");
    if (!validateInputs()) {
        print("ERROR: PlayerSkinManager initialization failed due to missing inputs.");
        return;
    }

    print("DEBUG: Populating skin mappings...");
    skinMappings = {
        [SKINS.WELCOME]: { skin: script.welcomePrefab, manager: null },
        [SKINS.Y2K]: { skin: script.musicPlayerY2K, manager: script.musicPlayerManagerY2K },
        [SKINS.MODERN]: { skin: script.musicPlayerModern, manager: script.musicPlayerManagerModern },
        [SKINS.HAND]: { skin: script.musicPlayerHand, manager: script.musicPlayerManagerHand }
    };
    print("DEBUG: Skin mappings populated.");

    disableAllSkinsAndManagers();
    if (script.welcomePrefab) {
        script.welcomePrefab.enabled = true;
        currentSkin = SKINS.WELCOME;
        print("Initial state set: Welcome screen enabled. Current skin: " + currentSkin);
    } else {
        print("WARN: Welcome prefab missing, attempting to start with Y2K skin.");
        switchToSkin(SKINS.Y2K);
    }

    bindAllHandlers();
    print("PlayerSkinManager initialized successfully.");
}

// --- Script Entry Point & Cleanup ---
initialize();

script.destroy = function() {
    print("Destroying PlayerSkinManager...");
    // TODO: Add cleanup for subscriptions if needed (PublicApi might require .unsubscribe())
    stopAudioForManager(script.musicPlayerManagerY2K);
    stopAudioForManager(script.musicPlayerManagerModern);
    stopAudioForManager(script.musicPlayerManagerHand);
    disableAllSkinsAndManagers();
    print("PlayerSkinManager destroyed.");
};