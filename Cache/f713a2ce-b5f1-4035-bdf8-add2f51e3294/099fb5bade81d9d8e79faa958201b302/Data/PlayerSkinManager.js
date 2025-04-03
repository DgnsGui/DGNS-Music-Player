// Lens Studio Script: PlayerSkinManager.JS
// Manages switching between different music player skins/layouts.
// Includes secondary lookup in bindButton for robustness.

// ----- INPUTS -----
// @ui {"widget":"group_start", "label":"Welcome Screen"}
// @input SceneObject welcomePrefab {"label":"Welcome Prefab"}
// @input Component.ScriptComponent acknowledgeButton {"label":"Acknowledge Button"}
// @ui {"widget":"group_end"}
// @ui {"widget":"group_start", "label":"Y2K Skin"}
// @input SceneObject musicPlayerY2K {"label":"Player Prefab"}
// @input SceneObject musicPlayerManagerY2K {"label":"Player Manager"}
// @input Component.ScriptComponent y2kSkinButton {"label":"Skin Button"}
// @input Component.ScriptComponent y2kHandButton {"label":"Hand Button"}
// @ui {"widget":"group_end"}
// @ui {"widget":"group_start", "label":"Modern Skin"}
// @input SceneObject musicPlayerModern {"label":"Player Prefab"}
// @input SceneObject musicPlayerManagerModern {"label":"Player Manager"}
// @input Component.ScriptComponent modernSkinButton {"label":"Skin Button"} // Link *a* script component from the correct button object
// @input Component.ScriptComponent modernHandButton {"label":"Hand Button"} // Link *a* script component from the correct button object
// @ui {"widget":"group_end"}
// @ui {"widget":"group_start", "label":"Hand Skin"}
// @input SceneObject musicPlayerHand {"label":"Player Prefab"}
// @input SceneObject musicPlayerManagerHand {"label":"Player Manager"}
// @input Component.ScriptComponent handHandButton {"label":"Disable Hand Button"}
// @ui {"widget":"group_end"}

// ----- SCRIPT LOGIC -----

const SKINS = { WELCOME: "welcome", Y2K: "y2k", MODERN: "modern", HAND: "hand" };
Object.freeze(SKINS);
var currentSkin = SKINS.WELCOME;
var skinMappings = {};

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
    // Button script components will be checked more thoroughly in bindButton
    return valid;
}

// Attempts to call stopTrack() on a manager's script component API
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
             stopAudioForManager(currentSkinData.manager); // Call stop audio
        }
        if (currentSkinData.skin) {
            currentSkinData.skin.enabled = false;
        }
        if (currentSkinData.manager) {
            currentSkinData.manager.enabled = false;
        }
    } else if (currentSkin === SKINS.WELCOME && script.welcomePrefab) {
         script.welcomePrefab.enabled = false; // Disable welcome screen
    }

    // --- Enable New Skin ---
    print("DEBUG: Enabling new skin elements for: " + newSkinName);
    if (newSkinData.skin) {
        newSkinData.skin.enabled = true;
    }
    if (newSkinData.manager) {
        newSkinData.manager.enabled = true;
    }

    var previousSkin = currentSkin;
    currentSkin = newSkinName;
    print("Successfully switched to skin: " + currentSkin + " (from: " + previousSkin + ")");
}


// Bind a callback function to a button's pinch event with error checking
// Uses .subscribe() primarily, falls back to .add() if needed.
// Includes secondary lookup if the initial component lacks 'onButtonPinched'.
function bindButton(buttonScriptComponent, buttonName) {
    if (!buttonScriptComponent) {
        print("ERROR: PlayerSkinManager - Button ScriptComponent input not assigned for: " + buttonName + ". Please assign it in the Inspector.");
        return;
    }

    var targetComponent = null; // The component we will actually bind to
    var ownerObject = null;     // The SceneObject owning the button

    // --- Primary Check ---
    // Check if the *initially provided* component has the event property
    var hasOnButtonPinched = false;
    try {
        if (buttonScriptComponent.onButtonPinched !== undefined) {
            hasOnButtonPinched = true;
            targetComponent = buttonScriptComponent; // Use the provided one if it's valid
            ownerObject = targetComponent.getSceneObject ? targetComponent.getSceneObject() : null;
            print("DEBUG: Initial component for '" + buttonName + "' has 'onButtonPinched'. Proceeding.");
        }
    } catch (e) {
        print("WARN: PlayerSkinManager - Error accessing 'onButtonPinched' for '" + buttonName + "' on initial component. Error: " + e);
        hasOnButtonPinched = false; // Treat as missing if access fails
    }


    // --- Secondary Lookup (Fallback) ---
    // If the initial component failed the check, try finding another one on the same object
    if (!hasOnButtonPinched) {
        print("WARN: PlayerSkinManager - Initial ScriptComponent for '" + buttonName + "' is MISSING 'onButtonPinched'. Attempting secondary lookup...");

        try {
            ownerObject = buttonScriptComponent.getSceneObject ? buttonScriptComponent.getSceneObject() : null;
            if (ownerObject) {
                print(" -> Searching on SceneObject: '" + ownerObject.name + "'");
                var allScripts = ownerObject.getComponents("Component.ScriptComponent");
                print(" -> Found " + allScripts.length + " script components on '" + ownerObject.name + "'.");

                for (var i = 0; i < allScripts.length; i++) {
                    var currentScriptComp = allScripts[i];
                    // Skip the one we already checked if it's the same instance
                    if (currentScriptComp === buttonScriptComponent) {
                         print(" -> Skipping initial component instance.");
                         continue;
                    }

                    var currentCompTypeName = currentScriptComp.getTypeName ? currentScriptComp.getTypeName() : "UnknownType";
                    print(" -> Checking component index " + i + " (Type: " + currentCompTypeName + ")");

                    // Check if *this* component has the property
                    var secondaryHasEvent = false;
                    try {
                         if (currentScriptComp.onButtonPinched !== undefined) {
                            secondaryHasEvent = true;
                         }
                    } catch (e) { /* ignore access error during check */ }

                    if (secondaryHasEvent) {
                        print(" -> SUCCESS: Found 'onButtonPinched' on a different ScriptComponent (index " + i + ") on object '" + ownerObject.name + "'. Using this one instead!");
                        targetComponent = currentScriptComp; // Found a working component!
                        break; // Stop searching
                    } else {
                        print(" -> Component index " + i + " does NOT have 'onButtonPinched'.");
                    }
                }
            } else {
                 print("ERROR: PlayerSkinManager - Cannot perform secondary lookup because failed to get SceneObject from initial component for '" + buttonName + "'.");
            }
        } catch (e) {
            print("ERROR: PlayerSkinManager - Error during secondary lookup for '" + buttonName + "': " + e);
        }
    }

    // --- Final Binding Attempt ---
    // Proceed only if we found a valid component (either initial or secondary)
    if (targetComponent) {
        var bindMethod = null;
        // Check for subscribe first
        if (typeof targetComponent.onButtonPinched.subscribe === 'function') {
            bindMethod = 'subscribe';
            try {
                targetComponent.onButtonPinched.subscribe(function(eventData) { handlePinchEvent(buttonName, "subscribe", eventData); });
                print("Binding successful using subscribe() for button: " + buttonName + (targetComponent === buttonScriptComponent ? "" : " (via secondary lookup)"));
             } catch (e) { print("ERROR: PlayerSkinManager - Failed to bind pinch event using subscribe() for " + buttonName + ": " + e); }
        }
        // Fallback to add
        else if (typeof targetComponent.onButtonPinched.add === 'function') {
             bindMethod = 'add';
             print("INFO: 'onButtonPinched' for '" + buttonName + "' does not have 'subscribe'. Trying fallback '.add()'.");
             try {
                 targetComponent.onButtonPinched.add(function() { handlePinchEvent(buttonName, "add"); });
                 print("Binding successful using fallback '.add()' for button: " + buttonName + (targetComponent === buttonScriptComponent ? "" : " (via secondary lookup)"));
             } catch(e) { print("ERROR: PlayerSkinManager - Failed to bind pinch event using fallback '.add()' for " + buttonName + ": " + e); }
        }
        // If neither exists on the target component
        else {
             print("ERROR: PlayerSkinManager - Target component for '" + buttonName + "' has 'onButtonPinched' but it lacks both 'subscribe' and 'add' methods. Cannot bind event.");
        }
    } else { // This was previously identified as line 130 in the condensed version
        // This means both the initial check and the secondary lookup failed
        print("ERROR: PlayerSkinManager - Failed to find ANY valid PinchButton component with 'onButtonPinched' for '" + buttonName + "' on object '" + (ownerObject ? ownerObject.name : "Unknown Object") + "'. Binding failed.");
    }
}


// Common handler logic for pinch events (called by subscribe or add)
function handlePinchEvent(buttonName, methodUsed, eventData) {
     print("DEBUG: Pinch event RECEIVED via "+methodUsed+"() for button: "+buttonName);
     print("DEBUG: Current skin state when '"+buttonName+"' pinched: "+currentSkin);
    var isRelevant=false;
    if      (buttonName==="Acknowledge" && currentSkin===SKINS.WELCOME) isRelevant=true;
    else if (buttonName==="Y2K Skin"    && currentSkin===SKINS.Y2K)     isRelevant=true;
    else if (buttonName==="Y2K Hand"    && currentSkin===SKINS.Y2K)     isRelevant=true;
    else if (buttonName==="Modern Skin" && currentSkin===SKINS.MODERN)  isRelevant=true;
    else if (buttonName==="Modern Hand" && currentSkin===SKINS.MODERN)  isRelevant=true;
    else if (buttonName==="Hand Back"   && currentSkin===SKINS.HAND)    isRelevant=true;

    print("DEBUG: Is '"+buttonName+"' relevant for current skin '"+currentSkin+"'? "+isRelevant);

    if (isRelevant) {
         print("EVENT: Button pinch is relevant, executing callback for: "+buttonName);
         // Call the appropriate skin switch based on the button pressed
         switch(buttonName) {
             case "Acknowledge": switchToSkin(SKINS.Y2K); break;
             case "Y2K Skin":    switchToSkin(SKINS.MODERN); break;
             case "Y2K Hand":    switchToSkin(SKINS.HAND); break;
             case "Modern Skin": switchToSkin(SKINS.Y2K); break;
             case "Modern Hand": switchToSkin(SKINS.HAND); break;
             case "Hand Back":   switchToSkin(SKINS.Y2K); break;
             default: print("WARN: Unknown button name in handlePinchEvent: "+buttonName); break;
         }
    } else {
         print("INFO: Pinch event ignored for "+buttonName+" as it's not relevant for the current skin '"+currentSkin+"'.");
    }
}

// Bind all the button handlers (calls the modified bindButton)
function bindAllHandlers() {
    print("Binding button handlers...");
    bindButton(script.acknowledgeButton,"Acknowledge");
    bindButton(script.y2kSkinButton,    "Y2K Skin");
    bindButton(script.y2kHandButton,    "Y2K Hand");
    bindButton(script.modernSkinButton, "Modern Skin"); // Enhanced error logging if this fails
    bindButton(script.modernHandButton, "Modern Hand"); // Enhanced error logging if this fails
    bindButton(script.handHandButton,   "Hand Back");
    print("Button handlers bound.");
}

// --- Initialization ---
function initialize() {
    print("Initializing PlayerSkinManager...");
    if (!validateInputs()) {
        print("ERROR: PlayerSkinManager initialization failed due to missing SceneObject inputs.");
        return;
    }

    print("DEBUG: Populating skin mappings...");
    skinMappings = {
        [SKINS.WELCOME]: { skin: script.welcomePrefab, manager: null },
        [SKINS.Y2K]:    { skin: script.musicPlayerY2K,    manager: script.musicPlayerManagerY2K },
        [SKINS.MODERN]: { skin: script.musicPlayerModern, manager: script.musicPlayerManagerModern },
        [SKINS.HAND]:   { skin: script.musicPlayerHand,   manager: script.musicPlayerManagerHand }
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

    // Attempt to bind all handlers
    bindAllHandlers();

    print("PlayerSkinManager initialized successfully.");
}

// --- Script Entry Point & Cleanup ---
initialize();

script.destroy = function() {
    print("Destroying PlayerSkinManager...");
    // TODO: Add cleanup for subscriptions (.unsubscribe()) if the PinchButton API requires it.
    stopAudioForManager(script.musicPlayerManagerY2K);
    stopAudioForManager(script.musicPlayerManagerModern);
    stopAudioForManager(script.musicPlayerManagerHand);
    disableAllSkinsAndManagers();
    print("PlayerSkinManager destroyed.");
};