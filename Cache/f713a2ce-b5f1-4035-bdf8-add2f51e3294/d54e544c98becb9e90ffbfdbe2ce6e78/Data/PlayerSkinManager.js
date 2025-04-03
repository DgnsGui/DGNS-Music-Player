// Lens Studio Script: PlayerSkinManager.JS
// Manages switching between different music player skins/layouts.
// Uses delayed binding (binds buttons only *after* their skin is enabled).

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
// @input Component.ScriptComponent modernSkinButton {"label":"Skin Button"} // Should now bind correctly after enabling
// @input Component.ScriptComponent modernHandButton {"label":"Hand Button"} // Should now bind correctly after enabling
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

function validateInputs() { /* ... (keep existing validation logic) ... */
    var valid = true; const inputsToCheck=[{obj:script.welcomePrefab,name:"Welcome Prefab"},{obj:script.musicPlayerY2K,name:"Music Player Y2K"},{obj:script.musicPlayerManagerY2K,name:"Music Player Manager Y2K"},{obj:script.musicPlayerModern,name:"Music Player Modern"},{obj:script.musicPlayerManagerModern,name:"Music Player Manager Modern"},{obj:script.musicPlayerHand,name:"Music Player Hand"},{obj:script.musicPlayerManagerHand,name:"Music Player Manager Hand"}]; inputsToCheck.forEach(function(input){if(!input.obj){print("ERROR: PlayerSkinManager - Input missing: "+input.name);valid=false;}}); return valid;
}
function stopAudioForManager(manager) { /* ... (keep existing stop audio logic) ... */
    if(manager&&manager.enabled&&manager.getComponent){var managerScript=manager.getComponent("Component.ScriptComponent");if(managerScript&&managerScript.api&&typeof managerScript.api.stopTrack==='function'){print("DEBUG: Calling stopTrack() on "+manager.name);try{managerScript.api.stopTrack();}catch(e){print("ERROR: Failed to call stopTrack() on "+manager.name+": "+e);}}}
}
function disableAllSkinsAndManagers() { /* ... (keep existing disable logic) ... */
    print("Disabling all skins and managers..."); if(script.welcomePrefab)script.welcomePrefab.enabled=false; if(script.musicPlayerY2K)script.musicPlayerY2K.enabled=false; if(script.musicPlayerManagerY2K)script.musicPlayerManagerY2K.enabled=false; if(script.musicPlayerModern)script.musicPlayerModern.enabled=false; if(script.musicPlayerManagerModern)script.musicPlayerManagerModern.enabled=false; if(script.musicPlayerHand)script.musicPlayerHand.enabled=false; if(script.musicPlayerManagerHand)script.musicPlayerManagerHand.enabled=false;
}

// Central function to switch between skins - NOW includes binding call
function switchToSkin(newSkinName) {
    print("DEBUG: Entering switchToSkin. Target: " + newSkinName + ", Current: " + currentSkin);
    if (!SKINS[newSkinName.toUpperCase()]) { print("ERROR: Invalid target skin name: " + newSkinName); return; }
    print("Switching from skin '" + currentSkin + "' to '" + newSkinName + "'");
    const currentSkinData = skinMappings[currentSkin];
    const newSkinData = skinMappings[newSkinName];
    if (!newSkinData) { print("ERROR: Could not find mapping for target skin: " + newSkinName); return; }

    // --- Disable Current Skin ---
    // TODO: Consider unbinding listeners for the outgoing skin if necessary (see notes below)
    print("DEBUG: Disabling current skin elements for: " + currentSkin);
    if (currentSkinData) {
        if (currentSkinData.manager) stopAudioForManager(currentSkinData.manager);
        if (currentSkinData.skin) currentSkinData.skin.enabled = false;
        if (currentSkinData.manager) currentSkinData.manager.enabled = false;
    } else if (currentSkin === SKINS.WELCOME && script.welcomePrefab) { script.welcomePrefab.enabled = false; }

    // --- Enable New Skin ---
    print("DEBUG: Enabling new skin elements for: " + newSkinName);
    if (newSkinData.skin) newSkinData.skin.enabled = true;
    if (newSkinData.manager) newSkinData.manager.enabled = true;

    // --- Bind Buttons for the NEWLY Enabled Skin ---
    // This happens *after* the new objects are enabled, hopefully allowing them to initialize.
    bindSkinButtons(newSkinName); // Call the new binding function

    var previousSkin = currentSkin;
    currentSkin = newSkinName;
    print("Successfully switched to skin: " + currentSkin + " (from: " + previousSkin + ")");
}

// Bind a specific button - Simplified, no secondary lookup needed now
function bindButton(buttonScriptComponent, buttonName) {
    if (!buttonScriptComponent) {
        print("ERROR: PlayerSkinManager - Button ScriptComponent input not assigned for: " + buttonName + ". Please assign it in the Inspector.");
        return;
    }

    var targetComponent = buttonScriptComponent; // Assume the provided component is correct now
    var ownerObject = targetComponent.getSceneObject ? targetComponent.getSceneObject() : null;
    var ownerName = ownerObject ? ownerObject.name : "UnknownObject";

    try {
        if (targetComponent.onButtonPinched === undefined) {
            // This error would indicate the timing issue persists OR the wrong component is linked
            print("ERROR: PlayerSkinManager - Input ScriptComponent for '" + buttonName + "' on object '" + ownerName + "' is STILL MISSING 'onButtonPinched' even after enabling skin. Check Inspector link / prefab setup.");
            return;
        }

        // Try binding with subscribe or add
        if (typeof targetComponent.onButtonPinched.subscribe === 'function') {
            targetComponent.onButtonPinched.subscribe(function(eventData) { handlePinchEvent(buttonName, "subscribe", eventData); });
            print("Binding successful using subscribe() for button: " + buttonName);
        } else if (typeof targetComponent.onButtonPinched.add === 'function') {
            print("INFO: 'onButtonPinched' for '" + buttonName + "' does not have 'subscribe'. Trying fallback '.add()'.");
            targetComponent.onButtonPinched.add(function() { handlePinchEvent(buttonName, "add"); });
            print("Binding successful using fallback '.add()' for button: " + buttonName);
        } else {
            print("ERROR: PlayerSkinManager - Target component for '" + buttonName + "' has 'onButtonPinched' but lacks both 'subscribe' and 'add' methods.");
        }
    } catch (e) {
        print("ERROR: PlayerSkinManager - Failed during binding attempt for " + buttonName + ": " + e);
    }
}

// Common handler logic for pinch events (called by subscribe or add)
function handlePinchEvent(buttonName, methodUsed, eventData) {
    print("DEBUG: Pinch event RECEIVED via "+methodUsed+"() for button: "+buttonName);
    print("DEBUG: Current skin state when '"+buttonName+"' pinched: "+currentSkin);
    // Relevance check remains the same
    var isRelevant=false;
    if      (buttonName==="Acknowledge" && currentSkin===SKINS.WELCOME) isRelevant=true;
    else if (buttonName==="Y2K Skin"    && currentSkin===SKINS.Y2K)     isRelevant=true;
    else if (buttonName==="Y2K Hand"    && currentSkin===SKINS.Y2K)     isRelevant=true;
    else if (buttonName==="Modern Skin" && currentSkin===SKINS.MODERN)  isRelevant=true; // This condition should now work
    else if (buttonName==="Modern Hand" && currentSkin===SKINS.MODERN)  isRelevant=true; // This condition should now work
    else if (buttonName==="Hand Back"   && currentSkin===SKINS.HAND)    isRelevant=true;

    print("DEBUG: Is '"+buttonName+"' relevant for current skin '"+currentSkin+"'? "+isRelevant);
    if (isRelevant) {
         print("EVENT: Button pinch is relevant, executing callback for: "+buttonName);
         switch(buttonName) {
             case "Acknowledge": switchToSkin(SKINS.Y2K); break;
             case "Y2K Skin":    switchToSkin(SKINS.MODERN); break;
             case "Y2K Hand":    switchToSkin(SKINS.HAND); break;
             case "Modern Skin": switchToSkin(SKINS.Y2K); break; // Execute the switch
             case "Modern Hand": switchToSkin(SKINS.HAND); break; // Execute the switch
             case "Hand Back":   switchToSkin(SKINS.Y2K); break;
             default: print("WARN: Unknown button name in handlePinchEvent: "+buttonName); break;
         }
    } else {
         print("INFO: Pinch event ignored for "+buttonName+" as it's not relevant for the current skin '"+currentSkin+"'.");
    }
}

// NEW function to bind buttons for a specific skin
function bindSkinButtons(skinName) {
     print("DEBUG: Attempting to bind buttons for skin: " + skinName);
     switch(skinName) {
         case SKINS.Y2K:
             bindButton(script.y2kSkinButton, "Y2K Skin");
             bindButton(script.y2kHandButton, "Y2K Hand");
             break;
         case SKINS.MODERN:
             bindButton(script.modernSkinButton, "Modern Skin");
             bindButton(script.modernHandButton, "Modern Hand");
             break;
         case SKINS.HAND:
             bindButton(script.handHandButton, "Hand Back");
             break;
         case SKINS.WELCOME:
             // Acknowledge button is bound in initialize
             break;
         default:
             print("WARN: No specific buttons to bind for skin: " + skinName);
             break;
     }
}

// --- Initialization ---
function initialize() {
    print("Initializing PlayerSkinManager...");
    if (!validateInputs()) { print("ERROR: PlayerSkinManager initialization failed due to missing SceneObject inputs."); return; }

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
        // Bind ONLY the Acknowledge button initially
        bindButton(script.acknowledgeButton,"Acknowledge");
    } else {
        print("WARN: Welcome prefab missing, attempting to start with Y2K skin.");
        switchToSkin(SKINS.Y2K); // This will now also trigger binding Y2K buttons
    }

    // DO NOT CALL bindAllHandlers() here anymore. Binding happens in switchToSkin.
    print("PlayerSkinManager initialized successfully. Awaiting Acknowledge button.");
}

// --- Script Entry Point & Cleanup ---
initialize();

script.destroy = function() {
    print("Destroying PlayerSkinManager...");
    // TODO: Implement unbinding if necessary and possible.
    // This might involve storing subscription handles from .subscribe()
    // or storing function references used with .add() and removing them.
    stopAudioForManager(script.musicPlayerManagerY2K);
    stopAudioForManager(script.musicPlayerManagerModern);
    stopAudioForManager(script.musicPlayerManagerHand);
    disableAllSkinsAndManagers();
    print("PlayerSkinManager destroyed.");
};