// Define inputs for the pinch buttons and skins
// @ui {"widget":"group_start", "label":"Pinch Buttons"}
// @input Component.ScriptComponent pinchButtonY2K {"label":"Pinch Button Y2K"}
// @input Component.ScriptComponent pinchButtonModern {"label":"Pinch Button Modern"}
// @input Component.ScriptComponent pinchButtonHand {"label":"Pinch Button Hand"}
// @ui {"widget":"group_end"}
// @ui {"widget":"group_start", "label":"Skins"}
// @input SceneObject musicPlayerY2K {"label":"Music Player Y2K"}
// @input SceneObject musicPlayerModern {"label":"Music Player Modern"}
// @input SceneObject musicPlayerHand {"label":"Music Player Hand"}
// @input SceneObject musicPlayerManagerY2K {"label":"Music Player Manager Y2K"}
// @input SceneObject musicPlayerManagerModern {"label":"Music Player Manager Modern"}
// @input SceneObject musicPlayerManagerHand {"label":"Music Player Manager Hand"}
// @ui {"widget":"group_end"}

// Ensure the script is recognized as a component in Lens Studio
script.api.PlayerSkinManager = script;

// Store event handlers for dynamic binding
var pinchButtonHandlers = {
    Y2K: null,
    Modern: null,
    Hand: null
};

// Track the current active skin
var currentSkin = "Y2K"; // Default starting skin

// Validate inputs
function validateInputs() {
    const inputs = [
        script.pinchButtonY2K, script.pinchButtonModern, script.pinchButtonHand,
        script.musicPlayerY2K, script.musicPlayerModern, script.musicPlayerHand,
        script.musicPlayerManagerY2K, script.musicPlayerManagerModern, script.musicPlayerManagerHand
    ];
    for (let input of inputs) {
        if (!input) {
            print("Error: One or more inputs are not assigned!");
            return false;
        }
    }
    return true;
}

// Function to stop audio for a specific manager
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

// Generalized function to switch to a specific skin
function switchToSkin(targetSkin) {
    print("Switching to " + targetSkin + " skin...");
    
    // Define skin configurations
    const skins = {
        "Y2K": {
            player: script.musicPlayerY2K,
            manager: script.musicPlayerManagerY2K,
            bindButtons: [script.pinchButtonY2K, script.pinchButtonModern] // Hand and Skin buttons
        },
        "Modern": {
            player: script.musicPlayerModern,
            manager: script.musicPlayerManagerModern,
            bindButtons: [script.pinchButtonModern, script.pinchButtonY2K] // Hand and Skin buttons
        },
        "Hand": {
            player: script.musicPlayerHand,
            manager: script.musicPlayerManagerHand,
            bindButtons: [script.pinchButtonHand, script.pinchButtonY2K] // Hand and Skin buttons
        }
    };
    
    // Stop audio for all managers except the target
    for (let skin in skins) {
        if (skin !== targetSkin) {
            stopAudioForManager(skins[skin].manager);
        }
    }
    
    // Disable all skins
    for (let skin in skins) {
        skins[skin].player.enabled = false;
        skins[skin].manager.enabled = false;
    }
    
    // Enable the target skin
    skins[targetSkin].player.enabled = true;
    skins[targetSkin].manager.enabled = true;
    
    // Unbind all handlers
    for (let handler in pinchButtonHandlers) {
        if (pinchButtonHandlers[handler]) {
            pinchButtonHandlers[handler].button.onButtonPinched.remove(pinchButtonHandlers[handler].handler);
            pinchButtonHandlers[handler] = null;
        }
    }
    
    // Bind buttons for the target skin
    skins[targetSkin].bindButtons.forEach(function(button, index) {
        if (button && button.onButtonPinched) {
            var handler = function() {
                print(button.name + " pressed.");
                // Determine action based on current skin and button
                if (targetSkin === "Y2K") {
                    if (index === 0) switchToSkin("Hand"); // Hand button
                    else if (index === 1) switchToSkin("Modern"); // Skin button
                } else if (targetSkin === "Modern") {
                    if (index === 0) switchToSkin("Hand"); // Hand button
                    else if (index === 1) switchToSkin("Y2K"); // Skin button
                } else if (targetSkin === "Hand") {
                    if (index === 0) switchToSkin("Y2K"); // Hand button (return to Y2K)
                    else if (index === 1) switchToSkin("Y2K"); // Skin button
                }
            };
            button.onButtonPinched.add(handler);
            pinchButtonHandlers[targetSkin + index] = { button: button, handler: handler };
        }
    });
    
    currentSkin = targetSkin;
    print("Switched to " + targetSkin + " skin.");
}

// Cleanup function
function cleanup() {
    for (let handler in pinchButtonHandlers) {
        if (pinchButtonHandlers[handler]) {
            pinchButtonHandlers[handler].button.onButtonPinched.remove(pinchButtonHandlers[handler].handler);
            pinchButtonHandlers[handler] = null;
        }
    }
    stopAudioForManager(script.musicPlayerManagerY2K);
    stopAudioForManager(script.musicPlayerManagerModern);
    stopAudioForManager(script.musicPlayerManagerHand);
}

// Initialize the script
if (validateInputs()) {
    // Initially deactivate Modern and Hand skins
    script.musicPlayerModern.enabled = false;
    script.musicPlayerManagerModern.enabled = false;
    script.musicPlayerHand.enabled = false;
    script.musicPlayerManagerHand.enabled = false;
    // Activate Y2K skin by default
    script.musicPlayerY2K.enabled = true;
    script.musicPlayerManagerY2K.enabled = true;
    // Switch to Y2K to set up bindings
    switchToSkin("Y2K");
} else {
    print("Script initialization failed due to invalid inputs.");
}

// Cleanup when the script is destroyed
script.destroy = function() {
    cleanup();
};