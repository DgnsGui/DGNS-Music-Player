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

// Track the previous skin for Hand skin navigation
var previousSkin;

// Expose script as a component
script.api.MusicPlayerSkinManager = script;

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
            print("Warning: No stopTrack method for " + manager.name);
        }
    }
}

// Skin switching functions
function switchToY2K() {
    print("Switching to Y2K skin...");
    stopAudioForManager(script.musicPlayerManagerModern);
    stopAudioForManager(script.musicPlayerManagerHand);
    script.welcomePrefab.enabled = false;
    script.musicPlayerModern.enabled = false;
    script.musicPlayerManagerModern.enabled = false;
    script.musicPlayerHand.enabled = false;
    script.musicPlayerManagerHand.enabled = false;
    script.musicPlayerY2K.enabled = true;
    script.musicPlayerManagerY2K.enabled = true;
    enableButtons(script.y2kSkinButton, script.y2kHandButton);
    print("Switched to Y2K skin.");
}

function switchToModern() {
    print("Switching to Modern skin...");
    stopAudioForManager(script.musicPlayerManagerY2K);
    stopAudioForManager(script.musicPlayerManagerHand);
    script.welcomePrefab.enabled = false;
    script.musicPlayerY2K.enabled = false;
    script.musicPlayerManagerY2K.enabled = false;
    script.musicPlayerHand.enabled = false;
    script.musicPlayerManagerHand.enabled = false;
    script.musicPlayerModern.enabled = true;
    script.musicPlayerManagerModern.enabled = true;
    enableButtons(script.modernSkinButton, script.modernHandButton);
    print("Switched to Modern skin.");
}

function switchToHand() {
    print("Switching to Hand skin...");
    stopAudioForManager(script.musicPlayerManagerY2K);
    stopAudioForManager(script.musicPlayerManagerModern);
    script.welcomePrefab.enabled = false;
    script.musicPlayerY2K.enabled = false;
    script.musicPlayerManagerY2K.enabled = false;
    script.musicPlayerModern.enabled = false;
    script.musicPlayerManagerModern.enabled = false;
    script.musicPlayerHand.enabled = true;
    script.musicPlayerManagerHand.enabled = true;
    enableButtons(script.handSkinButton, script.handHandButton);
    print("Switched to Hand skin.");
}

// Helper to enable button SceneObjects
function enableButtons(button1, button2) {
    if (button1 && button1.getSceneObject()) {
        button1.getSceneObject().enabled = true;
        print(button1.getSceneObject().name + " enabled.");
    }
    if (button2 && button2.getSceneObject()) {
        button2.getSceneObject().enabled = true;
        print(button2.getSceneObject().name + " enabled.");
    }
}

// Bind button handlers
function bindHandlers() {
    // Welcome button
    bindButton(script.acknowledgeButton, "Acknowledge", switchToY2K);

    // Y2K buttons
    bindButton(script.y2kSkinButton, "Y2K Skin", switchToModern);
    bindButton(script.y2kHandButton, "Y2K Hand", function() {
        previousSkin = "Y2K";
        switchToHand();
    });

    // Modern buttons (your specific requirements)
    bindButton(script.modernSkinButton, "Modern Skin", function() {
        print("Modern Skin Button triggered.");
        script.musicPlayerModern.enabled = false;
        script.musicPlayerManagerModern.enabled = false;
        script.musicPlayerY2K.enabled = true;
        script.musicPlayerManagerY2K.enabled = true;
        enableButtons(script.y2kSkinButton, script.y2kHandButton);
    });
    bindButton(script.modernHandButton, "Modern Hand", function() {
        print("Modern Hand Button triggered.");
        script.musicPlayerModern.enabled = false;
        script.musicPlayerManagerModern.enabled = false;
        script.musicPlayerHand.enabled = true;
        script.musicPlayerManagerHand.enabled = true;
        previousSkin = "Modern";
        enableButtons(script.handSkinButton, script.handHandButton);
    });

    // Hand buttons
    bindButton(script.handSkinButton, "Hand Skin", function() {
        if (previousSkin === "Y2K") {
            switchToModern();
        } else {
            switchToY2K();
        }
    });
    bindButton(script.handHandButton, "Hand Hand", function() {
        if (previousSkin === "Y2K") {
            switchToY2K();
        } else {
            switchToModern();
        }
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
    script.welcomePrefab.enabled = true;
    script.musicPlayerY2K.enabled = false;
    script.musicPlayerManagerY2K.enabled = false;
    script.musicPlayerModern.enabled = false;
    script.musicPlayerManagerModern.enabled = false;
    script.musicPlayerHand.enabled = false;
    script.musicPlayerManagerHand.enabled = false;

    bindHandlers();
} else {
    print("Initialization failed due to missing inputs.");
}

// Cleanup
script.destroy = function() {
    stopAudioForManager(script.musicPlayerManagerY2K);
    stopAudioForManager(script.musicPlayerManagerModern);
    stopAudioForManager(script.musicPlayerManagerHand);
};