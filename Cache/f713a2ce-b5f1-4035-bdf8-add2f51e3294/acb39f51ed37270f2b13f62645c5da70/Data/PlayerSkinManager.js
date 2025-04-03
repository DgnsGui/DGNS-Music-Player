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

// Track current skin
var currentSkin = SKINS.WELCOME;

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
            break;
        case SKINS.MODERN:
            script.musicPlayerModern.enabled = true;
            script.musicPlayerManagerModern.enabled = true;
            break;
        case SKINS.HAND:
            script.musicPlayerHand.enabled = true;
            script.musicPlayerManagerHand.enabled = true;
            break;
    }
}

// Switch skin with audio stopping
function switchSkin(newSkin) {
    if (currentSkin === newSkin) return;

    stopAudioForManager(script.musicPlayerManagerY2K);
    stopAudioForManager(script.musicPlayerManagerModern);
    stopAudioForManager(script.musicPlayerManagerHand);

    currentSkin = newSkin;
    enableSkin(newSkin);
}

// Bind button handlers
function bindHandlers() {
    // Welcome button
    script.acknowledgeButton.onButtonPinched.add(function() {
        switchSkin(SKINS.Y2K);
    });

    // Y2K buttons
    script.y2kSkinButton.onButtonPinched.add(function() {
        switchSkin(SKINS.MODERN);
    });
    script.y2kHandButton.onButtonPinched.add(function() {
        switchSkin(SKINS.HAND);
    });

    // Modern buttons
    script.modernSkinButton.onButtonPinched.add(function() {
        switchSkin(SKINS.Y2K);
    });
    script.modernHandButton.onButtonPinched.add(function() {
        switchSkin(SKINS.HAND);
    });

    // Hand buttons - Note: Only has hand button per your description
    script.handHandButton.onButtonPinched.add(function() {
        switchSkin(SKINS.Y2K); // Always return to Y2K from Hand skin
    });
}

// Initialize
if (validateInputs()) {
    disableAllSkins();
    script.welcomePrefab.enabled = true;
    currentSkin = SKINS.WELCOME;
    bindHandlers();
}

// Cleanup
script.destroy = function() {
    stopAudioForManager(script.musicPlayerManagerY2K);
    stopAudioForManager(script.musicPlayerManagerModern);
    stopAudioForManager(script.musicPlayerManagerHand);
    disableAllSkins();
};