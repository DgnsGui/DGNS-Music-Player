// @ui {"widget":"group_start", "label":"Welcome"}
// @input SceneObject welcomePrefab
// @input Component.ScriptComponent acknowledgeButton
// @ui {"widget":"group_end"}

// @ui {"widget":"group_start", "label":"Y2K Skin"}
// @input SceneObject musicPlayerY2K
// @input Component.ScriptComponent y2kSkinButton
// @input Component.ScriptComponent y2kHandButton
// @ui {"widget":"group_end"}

// @ui {"widget":"group_start", "label":"Modern Skin"}
// @input SceneObject musicPlayerModern
// @input Component.ScriptComponent modernSkinButton
// @input Component.ScriptComponent modernHandButton
// @ui {"widget":"group_end"}

// @ui {"widget":"group_start", "label":"Hand Skin"}
// @input SceneObject musicPlayerHand
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
        {obj: script.y2kSkinButton, name: "Y2K Skin Button"},
        {obj: script.y2kHandButton, name: "Y2K Hand Button"},
        {obj: script.musicPlayerModern, name: "Music Player Modern"},
        {obj: script.modernSkinButton, name: "Modern Skin Button"},
        {obj: script.modernHandButton, name: "Modern Hand Button"},
        {obj: script.musicPlayerHand, name: "Music Player Hand"},
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
    
    // Disable all other skins
    script.welcomePrefab.enabled = false;
    script.musicPlayerModern.enabled = false;
    script.musicPlayerHand.enabled = false;
    
    // Enable Y2K skin
    script.musicPlayerY2K.enabled = true;
    
    // Ensure buttons are properly enabled and responsive
    checkButtonState(script.y2kSkinButton, "Y2K Skin Button");
    checkButtonState(script.y2kHandButton, "Y2K Hand Button");
}

function switchToModern() {
    debugPrint("Switching to Modern skin...");
    
    // Disable all other skins
    script.welcomePrefab.enabled = false;
    script.musicPlayerY2K.enabled = false;
    script.musicPlayerHand.enabled = false;
    
    // Enable Modern skin
    script.musicPlayerModern.enabled = true;
    
    // Ensure buttons are properly enabled and responsive
    checkButtonState(script.modernSkinButton, "Modern Skin Button");
    checkButtonState(script.modernHandButton, "Modern Hand Button");
}

function switchToHand() {
    debugPrint("Switching to Hand skin...");
    
    // Disable all other skins
    script.welcomePrefab.enabled = false;
    script.musicPlayerY2K.enabled = false;
    script.musicPlayerModern.enabled = false;
    
    // Enable Hand skin
    script.musicPlayerHand.enabled = true;
    
    // Ensure buttons are properly enabled and responsive
    checkButtonState(script.handSkinButton, "Hand Skin Button");
    checkButtonState(script.handHandButton, "Hand Hand Button");
}

// Helper function to check and ensure button state
function checkButtonState(button, name) {
    if (!button) {
        debugPrint("Error: " + name + " is null!");
        return;
    }
    
    if (!button.getSceneObject()) {
        debugPrint("Error: " + name + " has no SceneObject!");
        return;
    }
    
    var sceneObject = button.getSceneObject();
    
    // Make sure both the SceneObject and script component are enabled
    sceneObject.enabled = true;
    button.enabled = true;
    
    // Check for TouchComponent (required for pinch detection)
    var touchComponent = sceneObject.getComponent("Component.TouchComponent");
    if (!touchComponent) {
        debugPrint("Warning: " + name + " is missing TouchComponent! Please add it in the Inspector.");
    }
    
    // Log states for debugging
    debugPrint(name + " SceneObject enabled: " + sceneObject.enabled);
    debugPrint(name + " Script enabled: " + button.enabled);
    debugPrint(name + " has TouchComponent: " + (touchComponent ? "Yes" : "No"));
}

// Clear existing bindings to prevent multiple callbacks
function clearBindings(button, name) {
    if (button && button.onButtonPinched) {
        try {
            button.onButtonPinched.clear();
            debugPrint("Cleared existing bindings for " + name);
        } catch (e) {
            debugPrint("Error clearing bindings for " + name + ": " + e);
        }
    }
}

// Bind button events
function bindHandlers() {
    // Clear any existing bindings first
    clearBindings(script.acknowledgeButton, "Acknowledge Button");
    clearBindings(script.y2kSkinButton, "Y2K Skin Button");
    clearBindings(script.y2kHandButton, "Y2K Hand Button");
    clearBindings(script.modernSkinButton, "Modern Skin Button");
    clearBindings(script.modernHandButton, "Modern Hand Button");
    clearBindings(script.handSkinButton, "Hand Skin Button");
    clearBindings(script.handHandButton, "Hand Hand Button");
    
    // Welcome to Y2K
    if (script.acknowledgeButton && script.acknowledgeButton.onButtonPinched) {
        script.acknowledgeButton.onButtonPinched.add(function() {
            debugPrint("Acknowledge button pressed.");
            switchToY2K();
        });
    } else {
        debugPrint("Error: Acknowledge button missing onButtonPinched!");
    }

    // Y2K Skin: Skin -> Modern, Hand -> Hand
    if (script.y2kSkinButton && script.y2kSkinButton.onButtonPinched) {
        script.y2kSkinButton.onButtonPinched.add(function() {
            debugPrint("Y2K Skin button pressed.");
            switchToModern();
        });
    } else {
        debugPrint("Error: Y2K Skin button missing onButtonPinched!");
    }
    
    if (script.y2kHandButton && script.y2kHandButton.onButtonPinched) {
        script.y2kHandButton.onButtonPinched.add(function() {
            debugPrint("Y2K Hand button pressed.");
            previousSkin = "Y2K";
            switchToHand();
        });
    } else {
        debugPrint("Error: Y2K Hand button missing onButtonPinched!");
    }

    // Modern Skin: Skin -> Y2K, Hand -> Hand
    if (script.modernSkinButton && script.modernSkinButton.onButtonPinched) {
        script.modernSkinButton.onButtonPinched.add(function() {
            debugPrint("Modern Skin button pressed.");
            switchToY2K();
        });
    } else {
        debugPrint("Error: Modern Skin button missing onButtonPinched!");
    }
    
    if (script.modernHandButton && script.modernHandButton.onButtonPinched) {
        script.modernHandButton.onButtonPinched.add(function() {
            debugPrint("Modern Hand button pressed.");
            previousSkin = "Modern";
            switchToHand();
        });
    } else {
        debugPrint("Error: Modern Hand button missing onButtonPinched!");
    }

    // Hand Skin: Skin -> Previous or alternate, Hand -> Previous
    if (script.handSkinButton && script.handSkinButton.onButtonPinched) {
        script.handSkinButton.onButtonPinched.add(function() {
            debugPrint("Hand Skin button pressed.");
            if (previousSkin === "Y2K") {
                switchToModern();
            } else {
                switchToY2K();
            }
        });
    } else {
        debugPrint("Error: Hand Skin button missing onButtonPinched!");
    }
    
    if (script.handHandButton && script.handHandButton.onButtonPinched) {
        script.handHandButton.onButtonPinched.add(function() {
            debugPrint("Hand Hand button pressed.");
            if (previousSkin === "Y2K") {
                switchToY2K();
            } else {
                switchToModern();
            }
        });
    } else {
        debugPrint("Error: Hand Hand button missing onButtonPinched!");
    }
}

// Update event for checking button states
function update() {
    // Check which skin is currently active and ensure buttons are responsive
    if (script.musicPlayerY2K.enabled) {
        checkButtonState(script.y2kSkinButton, "Y2K Skin Button");
        checkButtonState(script.y2kHandButton, "Y2K Hand Button");
    } else if (script.musicPlayerModern.enabled) {
        checkButtonState(script.modernSkinButton, "Modern Skin Button");
        checkButtonState(script.modernHandButton, "Modern Hand Button");
    } else if (script.musicPlayerHand.enabled) {
        checkButtonState(script.handSkinButton, "Hand Skin Button");
        checkButtonState(script.handHandButton, "Hand Hand Button");
    }
}

// Initialize everything
function initialize() {
    if (validateInputs()) {
        // Start with welcome prefab
        script.welcomePrefab.enabled = true;
        script.musicPlayerY2K.enabled = false;
        script.musicPlayerModern.enabled = false;
        script.musicPlayerHand.enabled = false;
        
        // Bind all button handlers
        bindHandlers();
        
        // Register the update callback
        script.createEvent("UpdateEvent").bind(update);
        
        debugPrint("Skin manager initialized successfully.");
    } else {
        debugPrint("Initialization failed due to missing inputs.");
    }
}

// Call initialize on script load
initialize();