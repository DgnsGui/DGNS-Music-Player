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

// Variable to track the previous skin for Hand navigation
var previousSkin = "Y2K"; // Default to Y2K as the previous skin

// Expose script as a component
script.api.MusicPlayerSkinManager = script;

// Debug toggle
var DEBUG = true;

// Debug print function
function debugPrint(message) {
    if (DEBUG) {
        print("[SkinManager] " + message);
    }
}

// Validate all required inputs
function validateInputs() {
    var inputs = [
        {obj: script.welcomePrefab, name: "Welcome Prefab"},
        {obj: script.acknowledgeButton, name: "Acknowledge Button"},
        {obj: script.musicPlayerY2K, name: "Music Player Y2K"},
        {obj: script.musicPlayerManagerY2K, name: "Music Player Manager Y2K"},
        {obj: script.y2kSkinButton, name: "Y2K Skin Button"},
        {obj: script.y2kHandButton, name: "Y2K Hand Button"},
        {obj: script.musicPlayerModern, name: "Music Player Modern"},
        {obj: script.musicPlayerManagerModern, name: "Music Player Manager Modern"},
        {obj: script.modernSkinButton, name: "Modern Skin Button"},
        {obj: script.modernHandButton, name: "Modern Hand Button"},
        {obj: script.musicPlayerHand, name: "Music Player Hand"},
        {obj: script.musicPlayerManagerHand, name: "Music Player Manager Hand"},
        {obj: script.handSkinButton, name: "Hand Skin Button"},
        {obj: script.handHandButton, name: "Hand Hand Button"}
    ];
    
    var valid = true;
    for (var i = 0; i < inputs.length; i++) {
        if (!inputs[i].obj) {
            debugPrint("Error: " + inputs[i].name + " is missing!");
            valid = false;
        }
    }
    return valid;
}

// Functions to switch between skins
function switchToY2K() {
    debugPrint("Switching to Y2K skin...");
    
    // Disable all other skins and managers
    script.welcomePrefab.enabled = false;
    
    script.musicPlayerModern.enabled = false;
    script.musicPlayerManagerModern.enabled = false;
    
    script.musicPlayerHand.enabled = false;
    script.musicPlayerManagerHand.enabled = false;
    
    // Enable Y2K skin and manager
    script.musicPlayerY2K.enabled = true;
    script.musicPlayerManagerY2K.enabled = true;
}

function switchToModern() {
    debugPrint("Switching to Modern skin...");
    
    // Disable all other skins and managers
    script.welcomePrefab.enabled = false;
    
    script.musicPlayerY2K.enabled = false;
    script.musicPlayerManagerY2K.enabled = false;
    
    script.musicPlayerHand.enabled = false;
    script.musicPlayerManagerHand.enabled = false;
    
    // Enable Modern skin and manager
    script.musicPlayerModern.enabled = true;
    script.musicPlayerManagerModern.enabled = true;
}

function switchToHand() {
    debugPrint("Switching to Hand skin...");
    
    // Disable all other skins and managers
    script.welcomePrefab.enabled = false;
    
    script.musicPlayerY2K.enabled = false;
    script.musicPlayerManagerY2K.enabled = false;
    
    script.musicPlayerModern.enabled = false;
    script.musicPlayerManagerModern.enabled = false;
    
    // Enable Hand skin and manager
    script.musicPlayerHand.enabled = true;
    script.musicPlayerManagerHand.enabled = true;
}

// Initialize button bindings for all skins
function initialize() {
    if (!validateInputs()) {
        debugPrint("Initialization failed due to missing inputs.");
        return;
    }
    
    debugPrint("Setting up button bindings...");
    
    // Acknowledge Button
    bindButtonPinch(script.acknowledgeButton, "Acknowledge Button", function() {
        debugPrint("Acknowledge button pinched!");
        switchToY2K();
    });
    
    // Y2K Skin buttons
    bindButtonPinch(script.y2kSkinButton, "Y2K Skin Button", function() {
        debugPrint("Y2K Skin button pinched!");
        switchToModern();
    });
    
    bindButtonPinch(script.y2kHandButton, "Y2K Hand Button", function() {
        debugPrint("Y2K Hand button pinched!");
        previousSkin = "Y2K";
        switchToHand();
    });
    
    // Modern Skin buttons
    bindButtonPinch(script.modernSkinButton, "Modern Skin Button", function() {
        debugPrint("Modern Skin button pinched!");
        switchToY2K();
    });
    
    bindButtonPinch(script.modernHandButton, "Modern Hand Button", function() {
        debugPrint("Modern Hand button pinched!");
        previousSkin = "Modern";
        switchToHand();
    });
    
    // Hand Skin buttons
    bindButtonPinch(script.handSkinButton, "Hand Skin Button", function() {
        debugPrint("Hand Skin button pinched!");
        if (previousSkin === "Y2K") {
            switchToModern();
        } else {
            switchToY2K();
        }
    });
    
    bindButtonPinch(script.handHandButton, "Hand Hand Button", function() {
        debugPrint("Hand Hand button pinched!");
        if (previousSkin === "Y2K") {
            switchToY2K();
        } else {
            switchToModern();
        }
    });
    
    // Set initial state
    script.welcomePrefab.enabled = true;
    script.musicPlayerY2K.enabled = false;
    script.musicPlayerManagerY2K.enabled = false;
    script.musicPlayerModern.enabled = false;
    script.musicPlayerManagerModern.enabled = false;
    script.musicPlayerHand.enabled = false;
    script.musicPlayerManagerHand.enabled = false;
    
    debugPrint("Button bindings set up. Initial state configured.");
}

// Helper function to bind button pinch event with error handling
function bindButtonPinch(button, buttonName, callback) {
    if (!button) {
        debugPrint("Error: " + buttonName + " is null or undefined!");
        return;
    }
    
    if (!button.onButtonPinched) {
        debugPrint("Error: " + buttonName + " doesn't have onButtonPinched event!");
        return;
    }
    
    // Clear existing bindings to prevent duplicates
    try {
        button.onButtonPinched.clear();
    } catch (e) {
        debugPrint("Warning: Could not clear previous bindings for " + buttonName);
    }
    
    // Add new binding
    button.onButtonPinched.add(function() {
        debugPrint(buttonName + " pinched - calling callback...");
        callback();
    });
    
    debugPrint("Successfully bound pinch event for " + buttonName);
}

// Diagnostics function to help identify why buttons are not working
function runDiagnostics() {
    // Log the state of all managers and skins
    debugPrint("--- Current State Diagnostics ---");
    debugPrint("Welcome Prefab enabled: " + script.welcomePrefab.enabled);
    
    debugPrint("Y2K Player enabled: " + script.musicPlayerY2K.enabled);
    debugPrint("Y2K Manager enabled: " + script.musicPlayerManagerY2K.enabled);
    
    debugPrint("Modern Player enabled: " + script.musicPlayerModern.enabled);
    debugPrint("Modern Manager enabled: " + script.musicPlayerManagerModern.enabled);
    
    debugPrint("Hand Player enabled: " + script.musicPlayerHand.enabled);
    debugPrint("Hand Manager enabled: " + script.musicPlayerManagerHand.enabled);
    
    // Check button states
    checkButtonState(script.y2kSkinButton, "Y2K Skin Button");
    checkButtonState(script.y2kHandButton, "Y2K Hand Button");
    checkButtonState(script.modernSkinButton, "Modern Skin Button");
    checkButtonState(script.modernHandButton, "Modern Hand Button");
    checkButtonState(script.handSkinButton, "Hand Skin Button");
    checkButtonState(script.handHandButton, "Hand Hand Button");
    
    debugPrint("--- End Diagnostics ---");
}

// Check the state of a button and its components
function checkButtonState(button, buttonName) {
    if (!button) {
        debugPrint(buttonName + ": Button object is null!");
        return;
    }
    
    var sceneObject = button.getSceneObject();
    if (!sceneObject) {
        debugPrint(buttonName + ": Scene object is null!");
        return;
    }
    
    debugPrint(buttonName + " enabled: " + button.enabled);
    debugPrint(buttonName + " SceneObject enabled: " + sceneObject.enabled);
    
    var touchComponent = sceneObject.getComponent("Component.TouchComponent");
    debugPrint(buttonName + " has TouchComponent: " + (touchComponent ? "Yes" : "No"));
    if (touchComponent) {
        debugPrint(buttonName + " TouchComponent enabled: " + touchComponent.enabled);
    }
    
    debugPrint(buttonName + " has onButtonPinched: " + (button.onButtonPinched ? "Yes" : "No"));
}

// Run diagnostics every few seconds to help debug
var diagnosticsInterval = 0;
function update(eventData) {
    diagnosticsInterval += eventData.getDeltaTime();
    if (diagnosticsInterval >= 5.0) { // Run every 5 seconds
        runDiagnostics();
        diagnosticsInterval = 0;
    }
}

// Initialize the manager
initialize();

// Register update event for periodic diagnostics
script.createEvent("UpdateEvent").bind(update);