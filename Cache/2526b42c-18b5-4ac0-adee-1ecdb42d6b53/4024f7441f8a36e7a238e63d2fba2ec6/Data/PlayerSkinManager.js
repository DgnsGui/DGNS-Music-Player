// @input Component.PinchButton pinchButton
// @input SceneObject musicPlayerY2K
// @input SceneObject musicPlayerManagerY2K
// @input SceneObject musicPlayerModern
// @input SceneObject musicPlayerManagerModern

// Ensure the script is recognized as a component in Lens Studio
script.api.PlayerSkinManager = script;

// State to track which skin is active (true = Modern, false = Y2K)
var isModernActive = false;

// Validate inputs
if (!script.pinchButton) {
    print("Error: Pinch Button is not assigned in the Inspector!");
    return;
}
if (!script.musicPlayerY2K || !script.musicPlayerManagerY2K || !script.musicPlayerModern || !script.musicPlayerManagerModern) {
    print("Error: One or more Scene Objects are not assigned in the Inspector!");
    return;
}

// Function to toggle the player skins
function togglePlayerSkins() {
    isModernActive = !isModernActive; // Toggle the state

    // Activate/deactivate the appropriate objects
    script.musicPlayerY2K.enabled = !isModernActive;
    script.musicPlayerManagerY2K.enabled = !isModernActive;
    script.musicPlayerModern.enabled = isModernActive;
    script.musicPlayerManagerModern.enabled = isModernActive;

    print("Switched to " + (isModernActive ? "Modern" : "Y2K") + " skin.");
}

// Bind the pinch event to the toggle function
script.pinchButton.onButtonPinched.add(togglePlayerSkins);

// Set initial state (Y2K active, Modern inactive)
script.musicPlayerY2K.enabled = true;
script.musicPlayerManagerY2K.enabled = true;
script.musicPlayerModern.enabled = false;
script.musicPlayerManagerModern.enabled = false;