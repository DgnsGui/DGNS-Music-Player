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

// Validate all inputs and buttons
function validateInputs() {
    var valid = true;
    // SceneObjects
    if (!script.welcomePrefab) { print("Error: Welcome Prefab missing!"); valid = false; }
    if (!script.musicPlayerY2K) { print("Error: Music Player Y2K missing!"); valid = false; }
    if (!script.musicPlayerManagerY2K) { print("Error: Music Player Manager Y2K missing!"); valid = false; }
    if (!script.musicPlayerModern) { print("Error: Music Player Modern missing!"); valid = false; }
    if (!script.musicPlayerManagerModern) { print("Error: Music Player Manager Modern missing!"); valid = false; }
    if (!script.musicPlayerHand) { print("Error: Music Player Hand missing!"); valid = false; }
    if (!script.musicPlayerManagerHand) { print("Error: Music Player Manager Hand missing!"); valid = false; }
    // Buttons
    if (!script.acknowledgeButton || !script.acknowledgeButton.onButtonPinched) { 
        print("Error: Acknowledge Button missing or lacks PinchButton component!"); valid = false; 
    }
    if (!script.y2kSkinButton || !script.y2kSkinButton.onButtonPinched) { 
        print("Error: Y2K Skin Button missing or lacks PinchButton component!"); valid = false; 
    }
    if (!script.y2kHandButton || !script.y2kHandButton.onButtonPinched) { 
        print("Error: Y2K Hand Button missing or lacks PinchButton component!"); valid = false; 
    }
    if (!script.modernSkinButton || !script.modernSkinButton.onButtonPinched) { 
        print("Error: Modern Skin Button missing or lacks PinchButton component!"); valid = false; 
    }
    if (!script.modernHandButton || !script.modernHandButton.onButtonPinched) { 
        print("Error: Modern Hand Button missing or lacks PinchButton component!"); valid = false; 
    }
    if (!script.handHandButton || !script.handHandButton.onButtonPinched) { 
        print("Error: Hand Back Button missing or lacks PinchButton component!"); valid = false; 
    }
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

// Bind button handlers
function bindButton(button, name, callback) {
    button.onButtonPinched.add(callback);
    print("Successfully bound " + name + " button.");
}

// Bind all handlers
function bindHandlers() {
    // Welcome button
    bindButton(script.acknowledgeButton, "Acknowledge", function() {
        script.welcomePrefab.enabled = false;
        script.musicPlayerY2K.enabled = true;
        script.musicPlayerManagerY2K.enabled = true;
        currentSkin = SKINS.Y2K;
        stopAudioForManager(script.musicPlayerManagerModern);
        stopAudioForManager(script.musicPlayerManagerHand);
    });

    // Y2K buttons
    bindButton(script.y2kSkinButton, "Y2K Skin", function() {
        script.musicPlayerY2K.enabled = false;
        script.musicPlayerManagerY2K.enabled = false;
        script.musicPlayerModern.enabled = true;
        script.musicPlayerManagerModern.enabled = true;
        currentSkin = SKINS.MODERN;
        stopAudioForManager(script.musicPlayerManagerY2K);
        stopAudioForManager(script.musicPlayerManagerHand);
    });
    bindButton(script.y2kHandButton, "Y2K Hand", function() {
        script.musicPlayerY2K.enabled = false;
        script.musicPlayerManagerY2K.enabled = false;
        script.musicPlayerHand.enabled = true;
        script.musicPlayerManagerHand.enabled = true;
        currentSkin = SKINS.HAND;
        stopAudioForManager(script.musicPlayerManagerY2K);
        stopAudioForManager(script.musicPlayerManagerModern);
    });

    // Modern buttons
    bindButton(script.modernSkinButton, "Modern Skin", function() {
        script.musicPlayerModern.enabled = false;
        script.musicPlayerManagerModern.enabled = false;
        script.musicPlayerY2K.enabled = true;
        script.musicPlayerManagerY2K.enabled = true;
        currentSkin = SKINS.Y2K;
        stopAudioForManager(script.musicPlayerManagerModern);
        stopAudioForManager(script.musicPlayerManagerHand);
    });
    bindButton(script.modernHandButton, "Modern Hand", function() {
        script.musicPlayerModern.enabled = false;
        script.musicPlayerManagerModern.enabled = false;
        script.musicPlayerHand.enabled = true;
        script.musicPlayerManagerHand.enabled = true;
        currentSkin = SKINS.HAND;
        stopAudioForManager(script.musicPlayerManagerModern);
        stopAudioForManager(script.musicPlayerManagerY2K);
    });

    // Hand buttons
    bindButton(script.handHandButton, "Hand Back", function() {
        script.musicPlayerHand.enabled = false;
        script.musicPlayerManagerHand.enabled = false;
        script.musicPlayerY2K.enabled = true;
        script.musicPlayerManagerY2K.enabled = true;
        currentSkin = SKINS.Y2K;
        stopAudioForManager(script.musicPlayerManagerHand);
        stopAudioForManager(script.musicPlayerManagerModern);
    });
}

// Initialize
if (validateInputs()) {
    disableAllSkins();
    script.welcomePrefab.enabled = true;
    currentSkin = SKINS.WELCOME;
    bindHandlers();
    print("PlayerSkinManager initialized successfully.");
} else {
    print("Initialization failed due to missing or invalid inputs. Check button assignments!");
}

// Cleanup
script.destroy = function() {
    stopAudioForManager(script.musicPlayerManagerY2K);
    stopAudioForManager(script.musicPlayerManagerModern);
    stopAudioForManager(script.musicPlayerManagerHand);
    disableAllSkins();
};