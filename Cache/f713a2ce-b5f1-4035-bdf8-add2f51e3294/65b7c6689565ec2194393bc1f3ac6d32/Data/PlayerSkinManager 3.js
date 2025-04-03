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

// Declare global variables
var previousSkin = "Y2K"; // Default previous skin
var currentSkin = "Welcome"; // Track current active skin
var lastTouch = getTime();
var touchCooldown = 0.5; // Prevent double-triggering

// Make the script recognizable as a component in Lens Studio
script.api.MusicPlayerSkinManager = script;

// Debug function to show what's active
function debugStatus() {
    print("CURRENT STATE:");
    print("- Welcome: " + script.welcomePrefab.enabled);
    print("- Y2K: " + script.musicPlayerY2K.enabled);
    print("- Y2K Manager: " + script.musicPlayerManagerY2K.enabled);
    print("- Modern: " + script.musicPlayerModern.enabled);
    print("- Modern Manager: " + script.musicPlayerManagerModern.enabled);
    print("- Hand: " + script.musicPlayerHand.enabled);
    print("- Hand Manager: " + script.musicPlayerManagerHand.enabled);
    print("- Current Skin: " + currentSkin);
    print("- Previous Skin: " + previousSkin);
}

// Validate all inputs to ensure they are assigned
function validateInputs() {
    if (!script.welcomePrefab) { print("Error: Welcome Prefab is not assigned!"); return false; }
    if (!script.acknowledgeButton) { print("Error: Acknowledge Button is not assigned!"); return false; }
    if (!script.musicPlayerY2K) { print("Error: Music Player Y2K is not assigned!"); return false; }
    if (!script.musicPlayerManagerY2K) { print("Error: Music Player Manager Y2K is not assigned!"); return false; }
    if (!script.y2kSkinButton) { print("Error: Y2K Skin Button is not assigned!"); return false; }
    if (!script.y2kHandButton) { print("Error: Y2K Hand Button is not assigned!"); return false; }
    if (!script.musicPlayerModern) { print("Error: Music Player Modern is not assigned!"); return false; }
    if (!script.musicPlayerManagerModern) { print("Error: Music Player Manager Modern is not assigned!"); return false; }
    if (!script.modernSkinButton) { print("Error: Modern Skin Button is not assigned!"); return false; }
    if (!script.modernHandButton) { print("Error: Modern Hand Button is not assigned!"); return false; }
    if (!script.musicPlayerHand) { print("Error: Music Player Hand is not assigned!"); return false; }
    if (!script.musicPlayerManagerHand) { print("Error: Music Player Manager Hand is not assigned!"); return false; }
    if (!script.handSkinButton) { print("Error: Hand Skin Button is not assigned!"); return false; }
    if (!script.handHandButton) { print("Error: Hand Hand Button is not assigned!"); return false; }
    return true;
}

// Stop audio for a specific manager
function stopAudioForManager(manager) {
    if (manager && manager.getComponent) {
        var managerScript = manager.getComponent("Component.ScriptComponent");
        if (managerScript && managerScript.api && managerScript.api.stopTrack) {
            managerScript.api.stopTrack();
            print("Audio stopped for " + manager.name);
        } else {
            print("Warning: No stopTrack method found for " + manager.name);
        }
    }
}

// Helper function to disable all skins
function disableAllSkins() {
    script.welcomePrefab.enabled = false;
    script.musicPlayerY2K.enabled = false;
    script.musicPlayerManagerY2K.enabled = false;
    script.musicPlayerModern.enabled = false;
    script.musicPlayerManagerModern.enabled = false;
    script.musicPlayerHand.enabled = false;
    script.musicPlayerManagerHand.enabled = false;
}

// Switch to Y2K skin
function switchToY2K() {
    if (getTime() - lastTouch < touchCooldown) return;
    lastTouch = getTime();
    
    print("Switching to Y2K skin...");
    // Stop audio for all other players
    stopAudioForManager(script.musicPlayerManagerModern);
    stopAudioForManager(script.musicPlayerManagerHand);
    
    // Disable all skins first
    disableAllSkins();
    
    // Enable Y2K skin
    script.musicPlayerY2K.enabled = true;
    script.musicPlayerManagerY2K.enabled = true;
    
    // Update current skin
    currentSkin = "Y2K";
    print("Switched to Y2K skin. Current skin: " + currentSkin);
    debugStatus();
}

// Switch to Modern skin
function switchToModern() {
    if (getTime() - lastTouch < touchCooldown) return;
    lastTouch = getTime();
    
    print("Switching to Modern skin...");
    // Stop audio for all other players
    stopAudioForManager(script.musicPlayerManagerY2K);
    stopAudioForManager(script.musicPlayerManagerHand);
    
    // Disable all skins first
    disableAllSkins();
    
    // Enable Modern skin
    script.musicPlayerModern.enabled = true;
    script.musicPlayerManagerModern.enabled = true;
    
    // Update current skin
    currentSkin = "Modern";
    print("Switched to Modern skin. Current skin: " + currentSkin);
    debugStatus();
}

// Switch to Hand skin
function switchToHand() {
    if (getTime() - lastTouch < touchCooldown) return;
    lastTouch = getTime();
    
    print("Switching to Hand skin...");
    // Remember previous skin before switching to hand
    if (currentSkin !== "Hand") {
        previousSkin = currentSkin;
    }
    
    // Stop audio for all other players
    stopAudioForManager(script.musicPlayerManagerY2K);
    stopAudioForManager(script.musicPlayerManagerModern);
    
    // Disable all skins first
    disableAllSkins();
    
    // Enable Hand skin
    script.musicPlayerHand.enabled = true;
    script.musicPlayerManagerHand.enabled = true;
    
    // Update current skin
    currentSkin = "Hand";
    print("Switched to Hand skin. Previous skin: " + previousSkin);
    debugStatus();
}

// Global event handlers - alternative approach to button binding
var globalTouchEvent = script.createEvent("TouchStartEvent");
globalTouchEvent.bind(function(eventData) {
    // Get current touch position
    var touchPos = eventData.getTouchPosition();
    
    // Check which skin is active and handle button interactions
    if (script.welcomePrefab.enabled) {
        // Handle welcome acknowledge button
        if (script.acknowledgeButton) {
            print("Welcome screen active, checking for acknowledge button press");
            switchToY2K();
        }
    } 
    else if (script.musicPlayerY2K.enabled) {
        // Check Y2K buttons
        if (script.y2kSkinButton) {
            print("Y2K screen active, detected skin button press");
            switchToModern();
        } 
        else if (script.y2kHandButton) {
            print("Y2K screen active, detected hand button press");
            switchToHand();
        }
    } 
    else if (script.musicPlayerModern.enabled) {
        // Check Modern buttons
        if (script.modernSkinButton) {
            print("Modern screen active, detected skin button press");
            switchToY2K();
        } 
        else if (script.modernHandButton) {
            print("Modern screen active, detected hand button press");
            switchToHand();
        }
    } 
    else if (script.musicPlayerHand.enabled) {
        // Check Hand buttons
        if (script.handSkinButton) {
            print("Hand screen active, detected skin button press");
            if (previousSkin === "Y2K") {
                switchToModern();
            } else {
                switchToY2K();
            }
        } 
        else if (script.handHandButton) {
            print("Hand screen active, detected hand button press");
            if (previousSkin === "Y2K") {
                switchToY2K();
            } else {
                switchToModern();
            }
        }
    }
});

// Alternative approach using Update event to check buttons
script.createEvent("UpdateEvent").bind(function() {
    // Only check for button presses if enough time has passed since last touch
    if (getTime() - lastTouch < touchCooldown) return;
    
    // Check which skin is active
    if (script.welcomePrefab.enabled) {
        // Check acknowledge button in welcome screen
        if (script.acknowledgeButton && script.acknowledgeButton.api && 
            typeof script.acknowledgeButton.api.isTouched === "function" && 
            script.acknowledgeButton.api.isTouched()) {
            print("Welcome screen: Acknowledge button touched");
            switchToY2K();
        }
    } 
    else if (script.musicPlayerY2K.enabled) {
        // Check Y2K buttons
        if (script.y2kSkinButton && script.y2kSkinButton.api && 
            typeof script.y2kSkinButton.api.isTouched === "function" && 
            script.y2kSkinButton.api.isTouched()) {
            print("Y2K screen: Skin button touched");
            switchToModern();
        }
        
        if (script.y2kHandButton && script.y2kHandButton.api && 
            typeof script.y2kHandButton.api.isTouched === "function" && 
            script.y2kHandButton.api.isTouched()) {
            print("Y2K screen: Hand button touched");
            switchToHand();
        }
    } 
    else if (script.musicPlayerModern.enabled) {
        // Check Modern buttons
        if (script.modernSkinButton && script.modernSkinButton.api && 
            typeof script.modernSkinButton.api.isTouched === "function" && 
            script.modernSkinButton.api.isTouched()) {
            print("Modern screen: Skin button touched");
            switchToY2K();
        }
        
        if (script.modernHandButton && script.modernHandButton.api && 
            typeof script.modernHandButton.api.isTouched === "function" && 
            script.modernHandButton.api.isTouched()) {
            print("Modern screen: Hand button touched");
            switchToHand();
        }
    } 
    else if (script.musicPlayerHand.enabled) {
        // Check Hand buttons
        if (script.handSkinButton && script.handSkinButton.api && 
            typeof script.handSkinButton.api.isTouched === "function" && 
            script.handSkinButton.api.isTouched()) {
            print("Hand screen: Skin button touched");
            if (previousSkin === "Y2K") {
                switchToModern();
            } else {
                switchToY2K();
            }
        }
        
        if (script.handHandButton && script.handHandButton.api && 
            typeof script.handHandButton.api.isTouched === "function" && 
            script.handHandButton.api.isTouched()) {
            print("Hand screen: Hand button touched");
            if (previousSkin === "Y2K") {
                switchToY2K();
            } else {
                switchToModern();
            }
        }
    }
});

// Initialize the script
if (validateInputs()) {
    // Start with welcome prefab enabled, all skins disabled
    disableAllSkins();
    script.welcomePrefab.enabled = true;
    currentSkin = "Welcome";

    print("MusicPlayerSkinManager initialized successfully. Starting with Welcome screen.");
    debugStatus();
} else {
    print("Script initialization failed due to invalid inputs.");
}

// Cleanup function (optional, since handlers persist with buttons)
script.destroy = function() {
    // Stop all audio on destroy
    stopAudioForManager(script.musicPlayerManagerY2K);
    stopAudioForManager(script.musicPlayerManagerModern);
    stopAudioForManager(script.musicPlayerManagerHand);
    print("MusicPlayerSkinManager cleaned up.");
};