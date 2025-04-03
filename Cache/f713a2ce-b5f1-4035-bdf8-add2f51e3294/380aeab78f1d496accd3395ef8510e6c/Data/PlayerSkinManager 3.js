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

// Skin states
const SKINS = {
    WELCOME: "welcome",
    Y2K: "y2k",
    MODERN: "modern",
    HAND: "hand"
};

// Track current and previous skin
var currentSkin = SKINS.WELCOME;
var previousSkin = null;

// Expose script as a component
script.api.PlayerSkinManager = script;

// Validate all inputs
function validateInputs() {
    var valid = true;
    if (!script.welcomePrefab) { print("Error: Welcome Prefab missing!"); valid = false; }
    if (!script.acknowledgeButton) { print("Error: Acknowledge Button missing!"); valid = false; }
    if (!script.musicPlayerY2K) { print("Error: Music Player Y2K missing!"); valid = false; }
    if (!script.musicPlayerManagerY2K) { print("Error: Music Player Manager Y2K missing!"); valid = false; }
    if (!script.y2kSkinButton) { print("Error: Y2K Skin Button missing!"); valid = false; }
    if (!script.y2kHandButton) { print("Error: Y2K Hand Button missing!"); valid = false; }
    if (!script.musicPlayerModern) { print("Error: Music Player Modern missing!"); valid = false; }
    if (!script.musicPlayerManagerModern) { print("Error: Music Player Manager Modern missing!"); valid = false; }
    if (!script.modernSkinButton) { print("Error: Modern Skin Button missing!"); valid = false; }
    if (!script.modernHandButton) { print("Error: Modern Hand Button missing!"); valid = false; }
    if (!script.musicPlayerHand) { print("Error: Music Player Hand missing!"); valid = false; }
    if (!script.musicPlayerManagerHand) { print("Error: Music Player Manager Hand missing!"); valid = false; }
    if (!script.handSkinButton) { print("Error: Hand Skin Button missing!"); valid = false; }
    if (!script.handHandButton) { print("Error: Hand Hand Button missing!"); valid = false; }
    return valid;
}

// Stop audio for a manager
function stopAudioForManager(manager) {
    if (manager && manager.getComponent) {
        var managerScript = manager.getComponent("Component.ScriptComponent");
        if (managerScript && managerScript.api && managerScript.api.stopTrack) {
            managerScript.api.stopTrack();
            print("Audio stopped for " + manager.name);
        } else {
            print("Warning: No stopTrack method for " + (manager.name || "unknown manager"));
        }
    }
}

// Disable all skins and managers
function disableAllSkins() {
    script.welcomePrefab.enabled = false;
    script.musicPlayerY2K.enabled = false;
    script.musicPlayerManagerY2K.enabled = false;
    script.musicPlayerModern.enabled = false;
    script.musicPlayerManagerModern.enabled = false;
    script.musicPlayerHand.enabled = false;
    script.musicPlayerManagerHand.enabled = false;
}

// Enable specific skin and its manager
function enableSkin(skin) {
    disableAllSkins();
    switch (skin) {
        case SKINS.WELCOME:
            script.welcomePrefab.enabled = true;
            break;
        case SKINS.Y2K:
            script.musicPlayerY2K.enabled = true;
            script.musicPlayerManagerY2K.enabled = true;
            script.y2kSkinButton.getSceneObject().enabled = true;
            script.y2kHandButton.getSceneObject().enabled = true;
            break;
        case SKINS.MODERN:
            script.musicPlayerModern.enabled = true;
            script.musicPlayerManagerModern.enabled = true;
            script.modernSkinButton.getSceneObject().enabled = true;
            script.modernHandButton.getSceneObject().enabled = true;
            break;
        case SKINS.HAND:
            script.musicPlayerHand.enabled = true;
            script.musicPlayerManagerHand.enabled = true;
            script.handSkinButton.getSceneObject().enabled = true;
            script.handHandButton.getSceneObject().enabled = true;
            break;
    }
}

// Switch skin with audio stopping
function switchSkin(newSkin) {
    print("Switching to " + newSkin + " skin...");
    if (currentSkin === newSkin) return; // No change needed

    // Stop audio for the current skin
    switch (currentSkin) {
        case SKINS.Y2K:
            stopAudioForManager(script.musicPlayerManagerY2K);
            break;
        case SKINS.MODERN:
            stopAudioForManager(script.musicPlayerManagerModern);
            break;
        case SKINS.HAND:
            stopAudioForManager(script.musicPlayerManagerHand);
            break;
    }

    // Update previousSkin only if not coming from Hand
    if (currentSkin !== SKINS.HAND) {
        previousSkin = currentSkin;
    }

    currentSkin = newSkin;
    enableSkin(newSkin);
    print("Switched to " + newSkin + " skin.");
}

// Bind button handlers
function bindHandlers() {
    // Welcome button
    bindButton(script.acknowledgeButton, "Acknowledge", function() {
        switchSkin(SKINS.Y2K);
    });

    // Y2K buttons
    bindButton(script.y2kSkinButton, "Y2K Skin", function() {
        switchSkin(SKINS.MODERN);
    });
    bindButton(script.y2kHandButton, "Y2K Hand", function() {
        switchSkin(SKINS.HAND);
    });

    // Modern buttons
    bindButton(script.modernSkinButton, "Modern Skin", function() {
        switchSkin(SKINS.Y2K);
    });
    bindButton(script.modernHandButton, "Modern Hand", function() {
        switchSkin(SKINS.HAND);
    });

    // Hand buttons
    bindButton(script.handSkinButton, "Hand Skin", function() {
        switchSkin(SKINS.MODERN); // Default to Modern if no previous skin
    });
    bindButton(script.handHandButton, "Hand Hand", function() {
        switchSkin(previousSkin === SKINS.Y2K ? SKINS.Y2K : SKINS.MODERN);
    });
}

// Helper to bind a button with error checking
function bindButton(button, name, callback) {
    if (button && button.onButtonPinched) {
        button.onButtonPinched.add(callback);
        print(name + " button bound successfully.");
    } else {
        print("Error: " + name + " button missing or lacks onButtonPinched!");
    }
}

// Initialize
if (validateInputs()) {
    // Start with Welcome screen
    disableAllSkins();
    script.welcomePrefab.enabled = true;
    currentSkin = SKINS.WELCOME;

    // Bind handlers
    bindHandlers();
    print("PlayerSkinManager initialized.");
} else {
    print("Initialization failed due to missing inputs.");
}

// Cleanup
script.destroy = function() {
    stopAudioForManager(script.musicPlayerManagerY2K);
    stopAudioForManager(script.musicPlayerManagerModern);
    stopAudioForManager(script.musicPlayerManagerHand);
    disableAllSkins();
};