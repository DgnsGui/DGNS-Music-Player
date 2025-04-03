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

// Global flag to track initialization
var initialized = false;

// Custom event handlers for each button
script.api.onAcknowledgeButtonPinched = function() {
    print("Acknowledge button pinched");
    switchToY2K();
};

script.api.onY2KSkinButtonPinched = function() {
    print("Y2K skin button pinched");
    switchToModern();
};

script.api.onY2KHandButtonPinched = function() {
    print("Y2K hand button pinched");
    previousSkin = "Y2K";
    switchToHand();
};

script.api.onModernSkinButtonPinched = function() {
    print("Modern skin button pinched");
    switchToY2K();
};

script.api.onModernHandButtonPinched = function() {
    print("Modern hand button pinched");
    previousSkin = "Modern";
    switchToHand();
};

script.api.onHandSkinButtonPinched = function() {
    print("Hand skin button pinched");
    if (previousSkin === "Y2K") {
        switchToModern();
    } else {
        switchToY2K();
    }
};

script.api.onHandHandButtonPinched = function() {
    print("Hand hand button pinched");
    if (previousSkin === "Y2K") {
        switchToY2K();
    } else {
        switchToModern();
    }
};

// Functions to switch between skins
function switchToY2K() {
    print("Switching to Y2K skin");
    
    // Disable all other skins and managers
    script.welcomePrefab.enabled = false;
    
    script.musicPlayerModern.enabled = false;
    if (script.musicPlayerManagerModern) {
        script.musicPlayerManagerModern.enabled = false;
    }
    
    script.musicPlayerHand.enabled = false;
    if (script.musicPlayerManagerHand) {
        script.musicPlayerManagerHand.enabled = false;
    }
    
    // Enable Y2K skin and manager
    script.musicPlayerY2K.enabled = true;
    if (script.musicPlayerManagerY2K) {
        script.musicPlayerManagerY2K.enabled = true;
    }
    
    print("Now in Y2K skin mode");
}

function switchToModern() {
    print("Switching to Modern skin");
    
    // Disable all other skins and managers
    script.welcomePrefab.enabled = false;
    
    script.musicPlayerY2K.enabled = false;
    if (script.musicPlayerManagerY2K) {
        script.musicPlayerManagerY2K.enabled = false;
    }
    
    script.musicPlayerHand.enabled = false;
    if (script.musicPlayerManagerHand) {
        script.musicPlayerManagerHand.enabled = false;
    }
    
    // Enable Modern skin and manager
    script.musicPlayerModern.enabled = true;
    if (script.musicPlayerManagerModern) {
        script.musicPlayerManagerModern.enabled = true;
    }
    
    print("Now in Modern skin mode");
}

function switchToHand() {
    print("Switching to Hand skin");
    
    // Disable all other skins and managers
    script.welcomePrefab.enabled = false;
    
    script.musicPlayerY2K.enabled = false;
    if (script.musicPlayerManagerY2K) {
        script.musicPlayerManagerY2K.enabled = false;
    }
    
    script.musicPlayerModern.enabled = false;
    if (script.musicPlayerManagerModern) {
        script.musicPlayerManagerModern.enabled = false;
    }
    
    // Enable Hand skin and manager
    script.musicPlayerHand.enabled = true;
    if (script.musicPlayerManagerHand) {
        script.musicPlayerManagerHand.enabled = true;
    }
    
    print("Now in Hand skin mode");
}

// Initialize on load
function initialize() {
    if (initialized) {
        return;
    }
    
    print("Initializing PlayerSkinManager");
    
    // Start with welcome prefab
    script.welcomePrefab.enabled = true;
    
    // Disable all skins initially
    script.musicPlayerY2K.enabled = false;
    if (script.musicPlayerManagerY2K) {
        script.musicPlayerManagerY2K.enabled = false;
    }
    
    script.musicPlayerModern.enabled = false;
    if (script.musicPlayerManagerModern) {
        script.musicPlayerManagerModern.enabled = false;
    }
    
    script.musicPlayerHand.enabled = false;
    if (script.musicPlayerManagerHand) {
        script.musicPlayerManagerHand.enabled = false;
    }
    
    // Connect all buttons
    setupButtons();
    
    initialized = true;
    print("PlayerSkinManager initialized");
}

// Setup buttons with direct event handler references
function setupButtons() {
    // Acknowledge button
    if (script.acknowledgeButton) {
        print("Setting up Acknowledge button");
        script.acknowledgeButton.api.onButtonPinched = script.api.onAcknowledgeButtonPinched;
    } else {
        print("Error: Acknowledge button not found");
    }
    
    // Y2K buttons
    if (script.y2kSkinButton) {
        print("Setting up Y2K Skin button");
        script.y2kSkinButton.api.onButtonPinched = script.api.onY2KSkinButtonPinched;
    } else {
        print("Error: Y2K Skin button not found");
    }
    
    if (script.y2kHandButton) {
        print("Setting up Y2K Hand button");
        script.y2kHandButton.api.onButtonPinched = script.api.onY2KHandButtonPinched;
    } else {
        print("Error: Y2K Hand button not found");
    }
    
    // Modern buttons
    if (script.modernSkinButton) {
        print("Setting up Modern Skin button");
        script.modernSkinButton.api.onButtonPinched = script.api.onModernSkinButtonPinched;
    } else {
        print("Error: Modern Skin button not found");
    }
    
    if (script.modernHandButton) {
        print("Setting up Modern Hand button");
        script.modernHandButton.api.onButtonPinched = script.api.onModernHandButtonPinched;
    } else {
        print("Error: Modern Hand button not found");
    }
    
    // Hand buttons
    if (script.handSkinButton) {
        print("Setting up Hand Skin button");
        script.handSkinButton.api.onButtonPinched = script.api.onHandSkinButtonPinched;
    } else {
        print("Error: Hand Skin button not found");
    }
    
    if (script.handHandButton) {
        print("Setting up Hand Hand button");
        script.handHandButton.api.onButtonPinched = script.api.onHandHandButtonPinched;
    } else {
        print("Error: Hand Hand button not found");
    }
}

// Initialize immediately
initialize();

// Create an update event to check buttons periodically
var checkInterval = 0;
script.createEvent("UpdateEvent").bind(function(eventData) {
    checkInterval += eventData.getDeltaTime();
    
    // Check every 3 seconds if buttons are properly set up
    if (checkInterval >= 3.0) {
        // Only check if we're in Modern skin and buttons might not be working
        if (script.musicPlayerModern.enabled) {
            print("Checking Modern skin buttons...");
            
            // Directly reconnect the Modern buttons
            if (script.modernSkinButton) {
                script.modernSkinButton.api.onButtonPinched = script.api.onModernSkinButtonPinched;
                print("Rebound Modern Skin button");
            }
            
            if (script.modernHandButton) {
                script.modernHandButton.api.onButtonPinched = script.api.onModernHandButtonPinched;
                print("Rebound Modern Hand button");
            }
        }
        
        checkInterval = 0;
    }
});