// Lens Studio Script: PlayerSkinManager.JS
// Manages switching between different music player skins/layouts.
// Plays an intro video once before showing the welcome screen using event-driven approach.
// Uses delayed binding (binds buttons only *after* their skin is enabled).

// ----- INPUTS -----
// @ui {"widget":"group_start", "label":"Intro Video (Optional)"}
// @input Asset.Texture introVideoTexture {"label":"Intro Video Texture", "optional":true, "hint":"Assign the Video Texture asset from Resources."}
// @input SceneObject videoScreenObject {"label":"Video Screen Object", "optional":true, "hint":"Assign the SceneObject that displays the video (e.g., the Screen Image). Must have a VideoTextureProvider component."}
// @ui {"widget":"group_end"}

// @ui {"widget":"group_start", "label":"Welcome Screen"}
// @input SceneObject welcomePrefab {"label":"Welcome Prefab"}
// @input Component.ScriptComponent acknowledgeButton {"label":"Acknowledge Button"}
// @ui {"widget":"group_end"}

// @ui {"widget":"group_start", "label":"Y2K Skin"}
// @input SceneObject musicPlayerY2K {"label":"Player Prefab"}
// @input SceneObject musicPlayerManagerY2K {"label":"Player Manager"}
// @input Component.ScriptComponent y2kSkinButton {"label":"Skin Button"}
// @input Component.ScriptComponent y2kHandButton {"label":"Hand Button"}
// @ui {"widget":"group_end"}

// @ui {"widget":"group_start", "label":"Modern Skin"}
// @input SceneObject musicPlayerModern {"label":"Player Prefab"}
// @input SceneObject musicPlayerManagerModern {"label":"Player Manager"}
// @input Component.ScriptComponent modernSkinButton {"label":"Skin Button"}
// @input Component.ScriptComponent modernHandButton {"label":"Hand Button"}
// @ui {"widget":"group_end"}

// @ui {"widget":"group_start", "label":"Hand Skin"}
// @input SceneObject musicPlayerHand {"label":"Player Prefab"}
// @input SceneObject musicPlayerManagerHand {"label":"Player Manager"}
// @input Component.ScriptComponent handHandButton {"label":"Disable Hand Button"}
// @ui {"widget":"group_end"}

// ----- SCRIPT LOGIC -----

const SKINS = { VIDEO: "video", WELCOME: "welcome", Y2K: "y2k", MODERN: "modern", HAND: "hand" };
Object.freeze(SKINS);
var currentSkin = SKINS.VIDEO; // Start with video state initially
var skinMappings = {};

// Reference to the video controller and event handler
var videoControl = null;
var videoFinishHandler = null; // Store the bound function reference

// --- Helper Functions ---

function validateInputs() {
    var valid = true;
    // Basic validation for essential non-video parts
    const inputsToCheck=[
        {obj:script.welcomePrefab,name:"Welcome Prefab"},
        {obj:script.acknowledgeButton, name:"Acknowledge Button"},
        {obj:script.musicPlayerY2K,name:"Music Player Y2K"},
        // ... (keep other essential inputs)
        {obj:script.handHandButton, name:"Hand Back Button"}
    ];
     inputsToCheck.forEach(function(input){
        if(!input.obj){
             print("ERROR: PlayerSkinManager - Input missing: "+input.name+". Please assign it in the Inspector.");
             valid=false;
        }
    });

    // Specific validation for video setup if provided
    if (script.introVideoTexture && !script.videoScreenObject) {
        print("ERROR: PlayerSkinManager - 'Intro Video Texture' is assigned, but 'Video Screen Object' is missing. Please assign the SceneObject that displays the video.");
        valid = false;
    }
    if (!script.introVideoTexture && script.videoScreenObject) {
        print("WARN: PlayerSkinManager - 'Video Screen Object' is assigned, but 'Intro Video Texture' is missing. The video setup will be ignored.");
        // Not strictly an error, but might be unintended.
    }
    if (script.introVideoTexture && script.videoScreenObject) {
        // Check if the screen object actually has the necessary component
        // Note: We can't *directly* get the VideoTextureProvider here easily during validation.
        // We rely on the user setting it up correctly and check for `videoControl` later.
        if (!script.videoScreenObject.getComponent("Component.Image") && !script.videoScreenObject.getComponent("Component.MeshVisual")) {
             print("WARN: PlayerSkinManager - 'Video Screen Object' ("+ script.videoScreenObject.name +") doesn't seem to have an Image or MeshVisual component to display the video.");
        }
         // We will get the VideoTextureProvider in initialize() using the texture's control property.
    }

     // Validate button script components specifically need to be ScriptComponents
    const buttonComponents = [
        { comp: script.acknowledgeButton, name: "Acknowledge Button" },
        { comp: script.y2kSkinButton, name: "Y2K Skin Button" },
        { comp: script.y2kHandButton, name: "Y2K Hand Button" },
        { comp: script.modernSkinButton, name: "Modern Skin Button" },
        { comp: script.modernHandButton, name: "Modern Hand Button" },
        { comp: script.handHandButton, name: "Hand Back Button" }
    ];
    buttonComponents.forEach(function(item) {
        if (item.comp && !(item.comp instanceof Component.ScriptComponent)) {
            print("ERROR: PlayerSkinManager - Input '" + item.name + "' is not a ScriptComponent. Please assign the correct component.");
            valid = false;
        }
         if (item.comp && !item.comp.getSceneObject()) {
             print("ERROR: PlayerSkinManager - Input ScriptComponent '" + item.name + "' is not attached to a Scene Object or the object is missing.");
             valid = false;
         }
    });

    return valid;
}

function stopAudioForManager(manager) {
    // ... (keep existing implementation)
    if(manager && manager.enabled && manager.getComponent){ var managerScript=manager.getComponent("Component.ScriptComponent"); if(managerScript && managerScript.api && typeof managerScript.api.stopTrack==='function'){ try{managerScript.api.stopTrack();} catch(e){print("ERROR: Failed to call stopTrack() on "+manager.name+": "+e);}}}
}

function disableAllSkinsAndManagers() {
    print("Disabling all skins, managers, and video screen...");
    // Disable regular skins and managers
    if(script.welcomePrefab) script.welcomePrefab.enabled = false;
    if(script.musicPlayerY2K) script.musicPlayerY2K.enabled = false;
    if(script.musicPlayerManagerY2K) script.musicPlayerManagerY2K.enabled = false;
    // ... (disable other skins/managers) ...
    if(script.musicPlayerHand) script.musicPlayerHand.enabled = false;
    if(script.musicPlayerManagerHand) script.musicPlayerManagerHand.enabled = false;


    // Also disable the video screen initially
    if(script.videoScreenObject) {
        script.videoScreenObject.enabled = false;
    }
     // Stop video if it exists and might be playing
    if (videoControl) {
        videoControl.stop();
    }
    print("All elements disabled.");
}

// Central function to switch between *interactive* skins (not video)
function switchToSkin(newSkinName) {
    print("DEBUG: Entering switchToSkin. Target: " + newSkinName + ", Current: " + currentSkin);
    const validTargetSkins = [SKINS.WELCOME, SKINS.Y2K, SKINS.MODERN, SKINS.HAND];
    if (validTargetSkins.indexOf(newSkinName) === -1) {
         print("ERROR: Invalid target skin name for switching: " + newSkinName);
         return;
    }
    // ... (rest of the function remains the same as before) ...
    print("Switching from skin '" + currentSkin + "' to '" + newSkinName + "'");
    const currentSkinData = skinMappings[currentSkin];
    const newSkinData = skinMappings[newSkinName];
    if (!newSkinData) { print("ERROR: Could not find mapping for target skin: " + newSkinName); return; }
    print("DEBUG: Disabling current skin elements for: " + currentSkin);
    if (currentSkin !== SKINS.VIDEO) {
        if (currentSkinData) { if (currentSkinData.manager) stopAudioForManager(currentSkinData.manager); if (currentSkinData.skin) currentSkinData.skin.enabled = false; if (currentSkinData.manager) currentSkinData.manager.enabled = false; }
        else if (currentSkin === SKINS.WELCOME && script.welcomePrefab) { script.welcomePrefab.enabled = false; }
    }
    print("DEBUG: Enabling new skin elements for: " + newSkinName);
    if (newSkinData.skin) newSkinData.skin.enabled = true;
    if (newSkinData.manager) newSkinData.manager.enabled = true;
    bindSkinButtons(newSkinName);
    var previousSkin = currentSkin;
    currentSkin = newSkinName;
    print("Successfully switched to skin: " + currentSkin + " (from: " + previousSkin + ")");
}


function bindButton(buttonScriptComponent, buttonName) {
    // ... (keep existing implementation, ensure it checks if component is valid) ...
    if (!buttonScriptComponent) { print("ERROR: PlayerSkinManager - Button ScriptComponent input not assigned for: " + buttonName + ". Cannot bind."); return; }
    if (!(buttonScriptComponent instanceof Component.ScriptComponent)) { print("ERROR: PlayerSkinManager - Input for '" + buttonName + "' is not a ScriptComponent. Check Inspector link."); return; }
    var targetComponent = buttonScriptComponent; var ownerObject = targetComponent.getSceneObject ? targetComponent.getSceneObject() : null; var ownerName = ownerObject ? ownerObject.name : "UnknownObject";
    try {
        var eventSource = null;
        if (targetComponent.api && targetComponent.api.onButtonPinched) { eventSource = targetComponent.api.onButtonPinched; print("INFO: PlayerSkinManager - Using 'onButtonPinched' from component.api for '" + buttonName + "'"); }
        else if (targetComponent.onButtonPinched) { eventSource = targetComponent.onButtonPinched; print("INFO: PlayerSkinManager - Using 'onButtonPinched' directly from component for '" + buttonName + "'"); }
        else { print("ERROR: PlayerSkinManager - Input ScriptComponent for '" + buttonName + "' on object '" + ownerName + "' is MISSING 'onButtonPinched' (checked api and component level)."); return; }

        if (typeof eventSource.subscribe === 'function') { eventSource.subscribe(function(eventData) { handlePinchEvent(buttonName, "subscribe", eventData); }); print("Binding successful using subscribe() for button: " + buttonName); }
        else if (typeof eventSource.add === 'function') { print("INFO: 'onButtonPinched' for '" + buttonName + "' does not have 'subscribe'. Trying fallback '.add()'."); eventSource.add(function() { handlePinchEvent(buttonName, "add"); }); print("Binding successful using fallback '.add()' for button: " + buttonName); }
        else { print("ERROR: PlayerSkinManager - Target event source for '" + buttonName + "' lacks both 'subscribe' and 'add' methods."); }
    } catch (e) { print("ERROR: PlayerSkinManager - Failed during binding attempt for " + buttonName + ": " + e); print("Stack: " + e.stack); }
}

function handlePinchEvent(buttonName, methodUsed, eventData) {
    // ... (keep existing implementation) ...
    print("DEBUG: Pinch event RECEIVED via "+methodUsed+"() for button: "+buttonName); print("DEBUG: Current skin state when '"+buttonName+"' pinched: "+currentSkin); var isRelevant=false; if (buttonName==="Acknowledge" && currentSkin===SKINS.WELCOME) isRelevant=true; else if (buttonName==="Y2K Skin" && currentSkin===SKINS.Y2K) isRelevant=true; else if (buttonName==="Y2K Hand" && currentSkin===SKINS.Y2K) isRelevant=true; else if (buttonName==="Modern Skin" && currentSkin===SKINS.MODERN) isRelevant=true; else if (buttonName==="Modern Hand" && currentSkin===SKINS.MODERN) isRelevant=true; else if (buttonName==="Hand Back" && currentSkin===SKINS.HAND) isRelevant=true; print("DEBUG: Is '"+buttonName+"' relevant for current skin '"+currentSkin+"'? "+isRelevant); if (isRelevant) { print("EVENT: Button pinch is relevant, executing callback for: "+buttonName); switch(buttonName) { case "Acknowledge": switchToSkin(SKINS.Y2K); break; case "Y2K Skin": switchToSkin(SKINS.MODERN); break; case "Y2K Hand": switchToSkin(SKINS.HAND); break; case "Modern Skin": switchToSkin(SKINS.Y2K); break; case "Modern Hand": switchToSkin(SKINS.HAND); break; case "Hand Back": switchToSkin(SKINS.Y2K); break; default: print("WARN: Unknown relevant button name in handlePinchEvent: "+buttonName); break; } } else { print("INFO: Pinch event ignored for "+buttonName+" as it's not relevant for the current skin '"+currentSkin+"'."); }
}

// Binds buttons ONLY for the specified, currently active skin
function bindSkinButtons(skinName) {
    // ... (keep existing implementation) ...
     print("DEBUG: Attempting to bind buttons for skin: " + skinName); switch(skinName) { case SKINS.WELCOME: bindButton(script.acknowledgeButton,"Acknowledge"); break; case SKINS.Y2K: bindButton(script.y2kSkinButton, "Y2K Skin"); bindButton(script.y2kHandButton, "Y2K Hand"); break; case SKINS.MODERN: bindButton(script.modernSkinButton, "Modern Skin"); bindButton(script.modernHandButton, "Modern Hand"); break; case SKINS.HAND: bindButton(script.handHandButton, "Hand Back"); break; case SKINS.VIDEO: default: print("DEBUG: No specific interactive buttons to bind for skin state: " + skinName); break; }
}

// --- Video Handling ---

// This function will be called ONLY when the video finishes playing
function onVideoFinished() {
    print("INFO: Intro video finished playing (onPlaybackDone event received).");

    // Safety check: Only proceed if we are actually in the video state.
    if (currentSkin !== SKINS.VIDEO) {
        print("WARN: onVideoFinished called but current skin is already " + currentSkin + ". Ignoring.");
        return;
    }

    // Clean up the event listener *before* changing state
    if (videoControl && videoFinishHandler) {
        // Use the stored reference to unbind
        videoControl.onPlaybackDone.remove(videoFinishHandler);
        print("DEBUG: Removed onPlaybackDone listener.");
        videoFinishHandler = null; // Clear the stored reference
    }

    proceedToWelcomeScreen(); // Transition to the welcome screen
}

// Logic to run after video finishes (or if video is skipped)
function proceedToWelcomeScreen() {
    print("Proceeding to Welcome Screen...");

     // Ensure video screen is disabled if it exists
    if(script.videoScreenObject) {
        script.videoScreenObject.enabled = false;
    }
     // Stop video playback explicitly (good practice)
    if(videoControl) {
        videoControl.stop();
    }

    // Now, enable the welcome screen
    if (script.welcomePrefab) {
        // Directly enable welcome prefab and bind its button
        print("Enabling Welcome Prefab.");
        script.welcomePrefab.enabled = true;
        currentSkin = SKINS.WELCOME; // Set state correctly BEFORE binding
        bindButton(script.acknowledgeButton,"Acknowledge"); // Bind the button for welcome screen
        print("Initial state set: Welcome screen enabled. Current skin: " + currentSkin);
    } else {
        // If welcome screen is ALSO missing, fallback to Y2K
        print("WARN: Welcome prefab missing after video/skip. Attempting to start directly with Y2K skin.");
        switchToSkin(SKINS.Y2K); // This will enable Y2K and bind its buttons
    }
}


// --- Initialization ---
function initialize() {
    print("Initializing PlayerSkinManager...");
    if (!validateInputs()) {
        print("ERROR: PlayerSkinManager initialization failed due to missing or invalid inputs. Please check the Inspector.");
        return; // Stop initialization if validation fails
    }

    print("DEBUG: Populating skin mappings...");
    skinMappings = {
        [SKINS.WELCOME]: { skin: script.welcomePrefab, manager: null },
        [SKINS.Y2K]:    { skin: script.musicPlayerY2K,    manager: script.musicPlayerManagerY2K },
        [SKINS.MODERN]: { skin: script.musicPlayerModern, manager: script.musicPlayerManagerModern },
        [SKINS.HAND]:   { skin: script.musicPlayerHand,   manager: script.musicPlayerManagerHand }
    };
    print("DEBUG: Skin mappings populated.");

    // Start by disabling everything
    disableAllSkinsAndManagers();

    // --- Start Video or Skip to Welcome ---
    if (script.introVideoTexture && script.videoScreenObject) {
        // Get the control interface from the texture asset
        videoControl = script.introVideoTexture.control;

        if (!videoControl) {
             print("ERROR: Could not get video control interface from the provided Intro Video Texture. Make sure it's a valid Video Texture asset.");
             proceedToWelcomeScreen(); // Skip video if control is invalid
             return;
        }

        // Check if the Screen Object has a visual component to assign the texture
        var imageComponent = script.videoScreenObject.getComponent("Component.Image");
        var meshVisualComponent = script.videoScreenObject.getComponent("Component.MeshVisual");

        if (imageComponent) {
             imageComponent.mainPass.baseTex = script.introVideoTexture;
             print("DEBUG: Assigned video texture to Image component on " + script.videoScreenObject.name);
        } else if (meshVisualComponent) {
             // Assuming the first material slot is the target
             if (meshVisualComponent.mainMaterial) {
                 meshVisualComponent.mainMaterial.mainPass.baseTex = script.introVideoTexture;
                 print("DEBUG: Assigned video texture to MeshVisual mainMaterial on " + script.videoScreenObject.name);
             } else {
                  print("WARN: Video Screen Object (" + script.videoScreenObject.name + ") has a MeshVisual but no mainMaterial assigned. Cannot display video.");
                  // Potentially proceed without video or let it fail visually
             }
        } else {
             print("ERROR: Video Screen Object (" + script.videoScreenObject.name + ") has neither an Image nor a MeshVisual component. Cannot display video.");
             proceedToWelcomeScreen(); // Skip video if we can't display it
             return;
        }


        print("Intro video configured. Setting up playback.");
        currentSkin = SKINS.VIDEO; // Set initial state

        // Store the handler function *before* binding
        videoFinishHandler = onVideoFinished;
        // Bind the event listener
        videoControl.onPlaybackDone.add(videoFinishHandler);
        print("DEBUG: Added onPlaybackDone listener.");

        // Ensure video screen is enabled
        script.videoScreenObject.enabled = true;

        // Play the video *once*
        videoControl.play(1);
        print("Video playing (once). Waiting for onPlaybackDone event...");

        // Optional: Check if ready immediately
        if (!videoControl.isPlaybackReady) {
            print("WARN: Video playback started, but isPlaybackReady is false. Playback might be delayed or fail.");
            // Consider adding a listener for onPlaybackReady too for more robust loading indication
        }


    } else {
        print("INFO: No intro video texture or screen object assigned. Skipping video playback.");
        // If no video, go directly to the welcome screen logic
        proceedToWelcomeScreen();
    }

    print("PlayerSkinManager initialized. Current state: " + currentSkin);
}

// --- Script Entry Point & Cleanup ---
initialize();

script.destroy = function() {
    print("Destroying PlayerSkinManager...");

    // Clean up video event listener if it's still attached
    if (videoControl && videoFinishHandler) {
        videoControl.onPlaybackDone.remove(videoFinishHandler);
        print("DEBUG: Removed onPlaybackDone listener during destroy.");
    }
     videoFinishHandler = null; // Clear reference

     // Stop video playback if it exists and might be playing
    if (videoControl) {
        videoControl.stop();
    }
    videoControl = null; // Clear reference

    // Stop audio from any potential managers
    stopAudioForManager(script.musicPlayerManagerY2K);
    stopAudioForManager(script.musicPlayerManagerModern);
    stopAudioForManager(script.musicPlayerManagerHand);

    // Unbinding button listeners is complex and often handled by LS cleanup,
    // but could be added here if causing issues.

    print("PlayerSkinManager destroyed.");
};