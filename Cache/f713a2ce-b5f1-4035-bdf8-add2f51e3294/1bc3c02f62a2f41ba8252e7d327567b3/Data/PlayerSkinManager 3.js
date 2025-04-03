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
var previousSkin;

// Expose script as a component
script.api.MusicPlayerSkinManager = script;

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
            print("Error: " + inputs[i].name + " is missing!");
            valid = false;
        }
    }
    return valid;
}

// Enable a button’s SceneObject and ScriptComponent
function enableButton(button, name) {
    if (button && button.getSceneObject()) {
        var sceneObject = button.getSceneObject();
        sceneObject.enabled = true;
        button.enabled = true;
        
        // Check for TouchComponent (required for pinch detection)
        var touchComponent = sceneObject.getComponent("Component.TouchComponent");
        if (!touchComponent) {
            print("Warning: " + name + " is missing TouchComponent! Please add it in the Inspector.");
        }
        
        // Log states for debugging
        print(name + " SceneObject enabled: " + sceneObject.enabled);
        print(name + " Script enabled: " + button.enabled);
        print(name + " has TouchComponent: " + (touchComponent ? "Yes" : "No"));
    } else {
        print("Error: " + name + " has no SceneObject!");
    }
}

// Functions to switch between skins
function switchToY2K() {
    print("Switching to Y2K skin...");
    script.welcomePrefab.enabled = false;
    script.musicPlayerModern.enabled = false;
    script.musicPlayerHand.enabled = false;
    script.musicPlayerY2K.enabled = true;
    
    enableButton(script.y2kSkinButton, "Y2K Skin Button");
    enableButton(script.y2kHandButton, "Y2K Hand Button");
}

function switchToModern() {
    print("Switching to Modern skin...");
    script.welcomePrefab.enabled = false;
    script.musicPlayerY2K.enabled = false;
    script.musicPlayerHand.enabled = false;
    script.musicPlayerModern.enabled = true;
    
    enableButton(script.modernSkinButton, "Modern Skin Button");
    enableButton(script.modernHandButton, "Modern Hand Button");
}

function switchToHand() {
    print("Switching to Hand skin...");
    script.welcomePrefab.enabled = false;
    script.musicPlayerY2K.enabled = false;
    script.musicPlayerModern.enabled = false;
    script.musicPlayerHand.enabled = true;
    
    enableButton(script.handSkinButton, "Hand Skin Button");
    enableButton(script.handHandButton, "Hand Hand Button");
}

// Bind button events
function bindHandlers() {
    // Welcome to Y2K
    if (script.acknowledgeButton && script.acknowledgeButton.onButtonPinched) {
        script.acknowledgeButton.onButtonPinched.add(function() {
            print("Acknowledge button pressed.");
            switchToY2K();
        });
    } else {
        print("Error: Acknowledge button missing onButtonPinched!");
    }

    // Y2K Skin: Skin -> Modern, Hand -> Hand
    if (script.y2kSkinButton && script.y2kSkinButton.onButtonPinched) {
        script.y2kSkinButton.onButtonPinched.add(function() {
            print("Y2K Skin button pressed.");
            switchToModern();
        });
    }
    if (script.y2kHandButton && script.y2kHandButton.onButtonPinched) {
        script.y2kHandButton.onButtonPinched.add(function() {
            print("Y2K Hand button pressed.");
            previousSkin = "Y2K";
            switchToHand();
        });
    }

    // Modern Skin: Skin -> Y2K, Hand -> Hand
    if (script.modernSkinButton && script.modernSkinButton.onButtonPinched) {
        script.modernSkinButton.onButtonPinched.add(function() {
            print("Modern Skin button pressed.");
            switchToY2K();
        });
    }
    if (script.modernHandButton && script.modernHandButton.onButtonPinched) {
        script.modernHandButton.onButtonPinched.add(function() {
            print("Modern Hand button pressed.");
            previousSkin = "Modern";
            switchToHand();
        });
    }

    // Hand Skin: Skin -> Alternate, Hand -> Previous
    if (script.handSkinButton && script.handSkinButton.onButtonPinched) {
        script.handSkinButton.onButtonPinched.add(function() {
            print("Hand Skin button pressed.");
            if (previousSkin === "Y2K") {
                switchToModern();
            } else {
                switchToY2K();
            }
        });
    }
    if (script.handHandButton && script.handHandButton.onButtonPinched) {
        script.handHandButton.onButtonPinched.add(function() {
            print("Hand Hand button pressed.");
            if (previousSkin === "Y2K") {
                switchToY2K();
            } else {
                switchToModern();
            }
        });
    }
}

// Initialize the scene
if (validateInputs()) {
    // Start with welcome prefab
    script.welcomePrefab.enabled = true;
    script.musicPlayerY2K.enabled = false;
    script.musicPlayerModern.enabled = false;
    script.musicPlayerHand.enabled = false;
    
    // Bind all button handlers
    bindHandlers();
    print("Skin manager initialized successfully.");
} else {
    print("Initialization failed due to missing inputs.");
}