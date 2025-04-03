// Lens Studio Script: PlayerSkinManager.JS
// Manages switching between different music player skins/layouts.
// Includes enhanced debugging for missing 'onButtonPinched' property.

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
// @input Component.ScriptComponent modernSkinButton {"label":"Skin Button"} // <<< Verify Correct PinchButton Script Component Link
// @input Component.ScriptComponent modernHandButton {"label":"Hand Button"} // <<< Verify Correct PinchButton Script Component Link
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

function validateInputs() { /* ... (keep existing validateInputs) ... */
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
function stopAudioForManager(manager) { /* ... (keep existing stopAudioForManager) ... */
    if (manager && manager.enabled && manager.getComponent) {
        var managerScript = manager.getComponent("Component.ScriptComponent");
        if (managerScript && managerScript.api && typeof managerScript.api.stopTrack === 'function') {
            print("DEBUG: Calling stopTrack() on " + manager.name);
            try { managerScript.api.stopTrack(); } catch (e) { print("ERROR: Failed to call stopTrack() on " + manager.name + ": " + e); }
        }
    }
}
function disableAllSkinsAndManagers() { /* ... (keep existing disableAllSkinsAndManagers) ... */
    print("Disabling all skins and managers...");
    if (script.welcomePrefab) script.welcomePrefab.enabled = false;
    if (script.musicPlayerY2K) script.musicPlayerY2K.enabled = false;
    if (script.musicPlayerManagerY2K) script.musicPlayerManagerY2K.enabled = false;
    if (script.musicPlayerModern) script.musicPlayerModern.enabled = false;
    if (script.musicPlayerManagerModern) script.musicPlayerManagerModern.enabled = false;
    if (script.musicPlayerHand) script.musicPlayerHand.enabled = false;
    if (script.musicPlayerManagerHand) script.musicPlayerManagerHand.enabled = false;
}
function switchToSkin(newSkinName) { /* ... (keep existing switchToSkin) ... */
    print("DEBUG: Entering switchToSkin. Target: " + newSkinName + ", Current: " + currentSkin);
    if (!SKINS[newSkinName.toUpperCase()]) { print("ERROR: Invalid target skin name: " + newSkinName); return; }
    print("Switching from skin '" + currentSkin + "' to '" + newSkinName + "'");
    const currentSkinData = skinMappings[currentSkin];
    const newSkinData = skinMappings[newSkinName];
    if (!newSkinData) { print("ERROR: Could not find mapping for target skin: " + newSkinName); return; }
    print("DEBUG: Disabling current skin elements for: " + currentSkin);
    if (currentSkinData) {
        if (currentSkinData.manager) { stopAudioForManager(currentSkinData.manager); }
        if (currentSkinData.skin) { currentSkinData.skin.enabled = false; }
        if (currentSkinData.manager) { currentSkinData.manager.enabled = false; }
    } else if (currentSkin === SKINS.WELCOME && script.welcomePrefab) { script.welcomePrefab.enabled = false; }
    print("DEBUG: Enabling new skin elements for: " + newSkinName);
    if (newSkinData.skin) { newSkinData.skin.enabled = true; }
    if (newSkinData.manager) { newSkinData.manager.enabled = true; }
    var previousSkin = currentSkin;
    currentSkin = newSkinName;
    print("Successfully switched to skin: " + currentSkin + " (from: " + previousSkin + ")");
}

// *** UPDATED bindButton Function ***
function bindButton(buttonScriptComponent, buttonName) {
    if (!buttonScriptComponent) {
        print("ERROR: PlayerSkinManager - Button ScriptComponent input not assigned for: " + buttonName + ". Please assign it in the Inspector.");
        return;
    }

    var hasOnButtonPinched = false;
    try {
        if (buttonScriptComponent.onButtonPinched !== undefined) {
            hasOnButtonPinched = true;
        }
    } catch (e) {
        print("WARN: PlayerSkinManager - Error accessing 'onButtonPinched' for '" + buttonName + "'. Component reference might be invalid. Error: " + e);
        hasOnButtonPinched = false;
    }

    if (!hasOnButtonPinched) {
        print("ERROR: PlayerSkinManager - Input ScriptComponent for '" + buttonName + "' is MISSING the 'onButtonPinched' property.");
        var componentOwnerName = "N/A";
        var componentTypeName = "N/A";
        try {
            componentOwnerName = buttonScriptComponent.getSceneObject ? buttonScriptComponent.getSceneObject().name : "(Cannot get SceneObject)";
            componentTypeName = buttonScriptComponent.getTypeName ? buttonScriptComponent.getTypeName() : "(Cannot get TypeName)";
        } catch(e) { print("WARN: Could not get details about the problematic component for '" + buttonName + "'. Error: " + e); }
        print(" -> Problematic component details: Owner Object Name = '" + componentOwnerName + "', Component TypeName = '" + componentTypeName + "'");
        print(" -> Please verify the Inspector assignment for '" + buttonName + "' points to the correct PinchButton SCRIPT COMPONENT.");
        return;
    }

    if (typeof buttonScriptComponent.onButtonPinched.subscribe === 'function') {
         try {
            buttonScriptComponent.onButtonPinched.subscribe(function(eventData) { handlePinchEvent(buttonName, "subscribe", eventData); });
            print("Binding successful using subscribe() for button: " + buttonName);
         } catch (e) { print("ERROR: PlayerSkinManager - Failed to bind pinch event using subscribe() for " + buttonName + ": " + e); }
    }
    else if (typeof buttonScriptComponent.onButtonPinched.add === 'function') {
         print("INFO: 'onButtonPinched' for '" + buttonName + "' does not have 'subscribe'. Trying fallback '.add()'.");
         try {
             buttonScriptComponent.onButtonPinched.add(function() { handlePinchEvent(buttonName, "add"); });
             print("Binding successful using fallback '.add()' for button: " + buttonName);
         } catch(e) { print("ERROR: PlayerSkinManager - Failed to bind pinch event using fallback '.add()' for " + buttonName + ": " + e); }
    }
    else {
         print("ERROR: PlayerSkinManager - 'onButtonPinched' for '" + buttonName + "' has neither a 'subscribe' nor an 'add' function. Cannot bind event.");
    }
}

function handlePinchEvent(buttonName, methodUsed, eventData) { /* ... (keep existing handlePinchEvent) ... */
     print("DEBUG: Pinch event RECEIVED via " + methodUsed + "() for button: " + buttonName);
     print("DEBUG: Current skin state when '" + buttonName + "' pinched: " + currentSkin);
    var isRelevant = false;
    if      (buttonName === "Acknowledge" && currentSkin === SKINS.WELCOME) isRelevant = true;
    else if (buttonName === "Y2K Skin"    && currentSkin === SKINS.Y2K)     isRelevant = true;
    else if (buttonName === "Y2K Hand"    && currentSkin === SKINS.Y2K)     isRelevant = true;
    else if (buttonName === "Modern Skin" && currentSkin === SKINS.MODERN)  isRelevant = true;
    else if (buttonName === "Modern Hand" && currentSkin === SKINS.MODERN)  isRelevant = true;
    else if (buttonName === "Hand Back"   && currentSkin === SKINS.HAND)    isRelevant = true;
    print("DEBUG: Is '" + buttonName + "' relevant for current skin '" + currentSkin + "'? " + isRelevant);
    if (isRelevant) {
         print("EVENT: Button pinch is relevant, executing callback for: " + buttonName);
         switch(buttonName) {
             case "Acknowledge": switchToSkin(SKINS.Y2K); break;
             case "Y2K Skin":    switchToSkin(SKINS.MODERN); break;
             case "Y2K Hand":    switchToSkin(SKINS.HAND); break;
             case "Modern Skin": switchToSkin(SKINS.Y2K); break;
             case "Modern Hand": switchToSkin(SKINS.HAND); break;
             case "Hand Back":   switchToSkin(SKINS.Y2K); break;
             default: print("WARN: Unknown button name in handlePinchEvent: " + buttonName); break;
         }
    } else { print("INFO: Pinch event ignored for " + buttonName + " as it's not relevant for the current skin '" + currentSkin + "'."); }
}
function bindAllHandlers() { /* ... (keep existing bindAllHandlers) ... */
    print("Binding button handlers...");
    bindButton(script.acknowledgeButton, "Acknowledge");
    bindButton(script.y2kSkinButton,    "Y2K Skin");
    bindButton(script.y2kHandButton,    "Y2K Hand");
    bindButton(script.modernSkinButton, "Modern Skin"); // Enhanced error logging if this fails
    bindButton(script.modernHandButton, "Modern Hand"); // Enhanced error logging if this fails
    bindButton(script.handHandButton,   "Hand Back");
    print("Button handlers bound.");
}
function initialize() { /* ... (keep existing initialize) ... */
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
    } else { print("WARN: Welcome prefab missing, attempting to start with Y2K skin."); switchToSkin(SKINS.Y2K); }
    bindAllHandlers();
    print("PlayerSkinManager initialized successfully.");
}

initialize();

script.destroy = function() { /* ... (keep existing destroy) ... */
    print("Destroying PlayerSkinManager...");
    stopAudioForManager(script.musicPlayerManagerY2K);
    stopAudioForManager(script.musicPlayerManagerModern);
    stopAudioForManager(script.musicPlayerManagerHand);
    disableAllSkinsAndManagers();
    print("PlayerSkinManager destroyed.");
};