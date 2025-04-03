// PinchButtonSetup.js
// Configures a SceneObject as a PinchButton with proper API for MusicPlayerManager

//@input Component.ScriptComponent targetScript {"label":"Target Script", "hint":"The MusicPlayerManager script"}
//@input string functionName {"label":"Function Name", "hint":"The function to call (e.g., togglePlayPause)"}
//@input bool debugMode {"label":"Debug Mode"}

// Expose the required API
script.api = {};

function initialize() {
    // Ensure Interactable component exists (required by PinchButton)
    if (!script.getSceneObject().getComponent("Interactable")) {
        script.getSceneObject().createComponent("Interactable");
        logDebug("Created Interactable component");
    }
    
    // Set up PinchButton API
    script.api.customFunctionForOnButtonPinched = script.targetScript;
    script.api.onButtonPinchedFunctionNames = [script.functionName];
    
    logDebug("PinchButton configured for function: " + script.functionName);
}

function logDebug(message) {
    if (script.debugMode) {
        print("[PinchButtonSetup] " + message);
    }
}

initialize();