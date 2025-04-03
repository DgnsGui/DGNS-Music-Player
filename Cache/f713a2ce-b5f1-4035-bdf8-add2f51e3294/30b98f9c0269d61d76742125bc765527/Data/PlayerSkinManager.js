// Lens Studio Script: PlayerSkinManager.JS
// Manages switching between different music player skins/layouts.
// Plays an intro video once before showing the welcome screen.
// Uses delayed binding (binds buttons only *after* their skin is enabled).

// ----- INPUTS -----
// @ui {"widget":"group_start", "label":"Intro Video (Optional)"}
// @input Component.VideoTextureProvider videoPlayer {"label":"Intro Video Player", "optional":true, "hint":"Assign the VideoTextureProvider component controlling your intro video."}
// @input SceneObject videoScreenObject {"label":"Video Screen Object", "optional":true, "hint":"Assign the SceneObject that displays the video (e.g., the Screen Image)."}
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

// State flags
var isWaitingForVideo = false;
var videoUpdateEvent = null;

// --- Helper Functions ---

function validateInputs() {
    var valid = true;
    // Basic validation for essential non-video parts
    const inputsToCheck=[
        {obj:script.welcomePrefab,name:"Welcome Prefab"},
        {obj:script.acknowledgeButton, name:"Acknowledge Button"},
        {obj:script.musicPlayerY2K,name:"Music Player Y2K"},
        {obj:script.musicPlayerManagerY2K,name:"Music Player Manager Y2K"},
        {obj:script.y2kSkinButton, name: "Y2K Skin Button"},
        {obj:script.y2kHandButton, name: "Y2K Hand Button"},
        {obj:script.musicPlayerModern,name:"Music Player Modern"},
        {obj:script.musicPlayerManagerModern,name:"Music Player Manager Modern"},
        {obj:script.modernSkinButton, name: "Modern Skin Button"},
        {obj:script.modernHandButton, name: "Modern Hand Button"},
        {obj:script.musicPlayerHand,name:"Music Player Hand"},
        {obj:script.musicPlayerManagerHand,name:"Music Player Manager Hand"},
        {obj:script.handHandButton, name:"Hand Back Button"}
    ];
    inputsToCheck.forEach(function(input){
        if(!input.obj){
             print("ERROR: PlayerSkinManager - Input missing: "+input.name+". Please assign it in the Inspector.");
             valid=false;
        }
    });

    // Specific validation for video setup if provided
    if (script.videoPlayer && !script.videoScreenObject) {
        print("ERROR: PlayerSkinManager - 'Intro Video Player' is assigned, but 'Video Screen Object' is missing. Please assign the SceneObject that displays the video.");
        valid = false;
    }
    if (!script.videoPlayer && script.videoScreenObject) {
        print("WARN: PlayerSkinManager - 'Video Screen Object' is assigned, but 'Intro Video Player' is missing. The video screen will remain disabled.");
        // Not strictly an error, but might be unintended.
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
    });


    return valid;
}

function stopAudioForManager(manager) {
    if(manager && manager.enabled && manager.getComponent){
        var managerScript=manager.getComponent("Component.ScriptComponent");
        if(managerScript && managerScript.api && typeof managerScript.api.stopTrack==='function'){
            // print("DEBUG: Calling stopTrack() on "+manager.name); // Keep commented unless debugging audio issues
            try{
                managerScript.api.stopTrack();
            } catch(e){
                print("ERROR: Failed to call stopTrack() on "+manager.name+": "+e);
            }
        }
    }
}

function disableAllSkinsAndManagers() {
    print("Disabling all skins, managers, and video...");
    // Disable regular skins and managers
    if(script.welcomePrefab) script.welcomePrefab.enabled = false;
    if(script.musicPlayerY2K) script.musicPlayerY2K.enabled = false;
    if(script.musicPlayerManagerY2K) script.musicPlayerManagerY2K.enabled = false;
    if(script.musicPlayerModern) script.musicPlayerModern.enabled = false;
    if(script.musicPlayerManagerModern) script.musicPlayerManagerModern.enabled = false;
    if(script.musicPlayerHand) script.musicPlayerHand.enabled = false;
    if(script.musicPlayerManagerHand) script.musicPlayerManagerHand.enabled = false;

    // Also disable the video screen initially
    if(script.videoScreenObject) {
        script.videoScreenObject.enabled = false;
    }
     // Stop video if it was somehow playing
    if (script.videoPlayer && script.videoPlayer.control) {
        script.videoPlayer.control.stop();
    }

    print("All elements disabled.");
}

// Central function to switch between skins - Handles enabling/disabling and binding
function switchToSkin(newSkinName) {
    print("DEBUG: Entering switchToSkin. Target: " + newSkinName + ", Current: " + currentSkin);
    // Ensure target skin is valid (excluding VIDEO state as it's transitional)
    const validTargetSkins = [SKINS.WELCOME, SKINS.Y2K, SKINS.MODERN, SKINS.HAND];
    if (validTargetSkins.indexOf(newSkinName) === -1) {
         print("ERROR: Invalid target skin name for switching: " + newSkinName);
         return;
    }
    print("Switching from skin '" + currentSkin + "' to '" + newSkinName + "'");

    const currentSkinData = skinMappings[currentSkin];
    const newSkinData = skinMappings[newSkinName];
    if (!newSkinData) { print("ERROR: Could not find mapping for target skin: " + newSkinName); return; }

    // --- Disable Current "Interactive" Skin ---
    // We don't disable the video here as it's handled by its own logic
    print("DEBUG: Disabling current skin elements for: " + currentSkin);
    if (currentSkin !== SKINS.VIDEO) { // Don't try to disable video via this path
        if (currentSkinData) {
            if (currentSkinData.manager) stopAudioForManager(currentSkinData.manager);
            if (currentSkinData.skin) currentSkinData.skin.enabled = false;
            if (currentSkinData.manager) currentSkinData.manager.enabled = false;
        } else if (currentSkin === SKINS.WELCOME && script.welcomePrefab) {
             script.welcomePrefab.enabled = false;
        }
    }

    // --- Enable New Skin ---
    print("DEBUG: Enabling new skin elements for: " + newSkinName);
    if (newSkinData.skin) newSkinData.skin.enabled = true;
    if (newSkinData.manager) newSkinData.manager.enabled = true;

    // --- Bind Buttons for the NEWLY Enabled Skin ---
    bindSkinButtons(newSkinName); // Bind buttons specific to the activated skin

    var previousSkin = currentSkin;
    currentSkin = newSkinName; // Update the state AFTER enabling and binding
    print("Successfully switched to skin: " + currentSkin + " (from: " + previousSkin + ")");
}


function bindButton(buttonScriptComponent, buttonName) {
    if (!buttonScriptComponent) {
        print("ERROR: PlayerSkinManager - Button ScriptComponent input not assigned for: " + buttonName + ". Cannot bind.");
        return;
    }
     if (!(buttonScriptComponent instanceof Component.ScriptComponent)) {
        print("ERROR: PlayerSkinManager - Input for '" + buttonName + "' is not a ScriptComponent. Check Inspector link.");
        return;
    }


    var targetComponent = buttonScriptComponent;
    var ownerObject = targetComponent.getSceneObject ? targetComponent.getSceneObject() : null;
    var ownerName = ownerObject ? ownerObject.name : "UnknownObject";

    try {
        // Check if the target API exists. Using 'api.setInteractionEnabled' as a proxy for a 'button' script.
        // Or more specifically check for the event property we need.
        // Using 'api' might be better if the button script exposes its events via api.
        // Let's assume the pinch event is directly on the component as 'onButtonPinched'
         if (!targetComponent.api || typeof targetComponent.api.onButtonPinched === 'undefined') {
             // Fallback: Check directly on component if api doesn't exist or doesn't have the event
             if (typeof targetComponent.onButtonPinched === 'undefined') {
                 print("ERROR: PlayerSkinManager - Input ScriptComponent for '" + buttonName + "' on object '" + ownerName + "' is MISSING 'onButtonPinched' (checked api and component level). Check Inspector link / prefab setup / script content.");
                 return;
             }
             print("INFO: PlayerSkinManager - Using 'onButtonPinched' directly from component for '" + buttonName + "'");

             // Bind directly to component event
              if (typeof targetComponent.onButtonPinched.subscribe === 'function') {
                    targetComponent.onButtonPinched.subscribe(function(eventData) { handlePinchEvent(buttonName, "component.subscribe", eventData); });
                    print("Binding successful using component.subscribe() for button: " + buttonName);
              } else if (typeof targetComponent.onButtonPinched.add === 'function') {
                    print("INFO: 'onButtonPinched' for '" + buttonName + "' (component level) does not have 'subscribe'. Trying fallback '.add()'.");
                    targetComponent.onButtonPinched.add(function() { handlePinchEvent(buttonName, "component.add"); });
                    print("Binding successful using fallback component.add() for button: " + buttonName);
              } else {
                    print("ERROR: PlayerSkinManager - Target component for '" + buttonName + "' has 'onButtonPinched' but lacks both 'subscribe' and 'add' methods.");
              }

         } else {
              print("INFO: PlayerSkinManager - Using 'onButtonPinched' from component.api for '" + buttonName + "'");
             // Bind via api property
             if (typeof targetComponent.api.onButtonPinched.subscribe === 'function') {
                targetComponent.api.onButtonPinched.subscribe(function(eventData) { handlePinchEvent(buttonName, "api.subscribe", eventData); });
                print("Binding successful using api.subscribe() for button: " + buttonName);
             } else if (typeof targetComponent.api.onButtonPinched.add === 'function') {
                 print("INFO: 'onButtonPinched' for '" + buttonName + "' (api level) does not have 'subscribe'. Trying fallback '.add()'.");
                 targetComponent.api.onButtonPinched.add(function() { handlePinchEvent(buttonName, "api.add"); });
                 print("Binding successful using fallback api.add() for button: " + buttonName);
             } else {
                 print("ERROR: PlayerSkinManager - Target component for '" + buttonName + "' has 'api.onButtonPinched' but lacks both 'subscribe' and 'add' methods.");
             }
         }


    } catch (e) {
        print("ERROR: PlayerSkinManager - Failed during binding attempt for " + buttonName + ": " + e);
        print("Stack: " + e.stack); // Print stack trace for better debugging
    }
}

function handlePinchEvent(buttonName, methodUsed, eventData) {
    print("DEBUG: Pinch event RECEIVED via "+methodUsed+"() for button: "+buttonName);
    print("DEBUG: Current skin state when '"+buttonName+"' pinched: "+currentSkin);

    // Relevance Check: Ensure the button press corresponds to the currently active skin
    var isRelevant=false;
    if      (buttonName==="Acknowledge" && currentSkin===SKINS.WELCOME) isRelevant=true;
    else if (buttonName==="Y2K Skin"    && currentSkin===SKINS.Y2K)     isRelevant=true;
    else if (buttonName==="Y2K Hand"    && currentSkin===SKINS.Y2K)     isRelevant=true;
    else if (buttonName==="Modern Skin" && currentSkin===SKINS.MODERN)  isRelevant=true;
    else if (buttonName==="Modern Hand" && currentSkin===SKINS.MODERN)  isRelevant=true;
    else if (buttonName==="Hand Back"   && currentSkin===SKINS.HAND)    isRelevant=true;

    print("DEBUG: Is '"+buttonName+"' relevant for current skin '"+currentSkin+"'? "+isRelevant);
    if (isRelevant) {
         print("EVENT: Button pinch is relevant, executing callback for: "+buttonName);
         switch(buttonName) {
             case "Acknowledge": switchToSkin(SKINS.Y2K); break;
             case "Y2K Skin":    switchToSkin(SKINS.MODERN); break;
             case "Y2K Hand":    switchToSkin(SKINS.HAND); break;
             case "Modern Skin": switchToSkin(SKINS.Y2K); break;
             case "Modern Hand": switchToSkin(SKINS.HAND); break;
             case "Hand Back":   switchToSkin(SKINS.Y2K); break; // Go back to Y2K from Hand skin
             default: print("WARN: Unknown relevant button name in handlePinchEvent: "+buttonName); break;
         }
    } else {
         print("INFO: Pinch event ignored for "+buttonName+" as it's not relevant for the current skin '"+currentSkin+"'.");
    }
}

// Binds buttons ONLY for the specified, currently active skin
function bindSkinButtons(skinName) {
     print("DEBUG: Attempting to bind buttons for skin: " + skinName);
     switch(skinName) {
         case SKINS.WELCOME:
             bindButton(script.acknowledgeButton,"Acknowledge");
             break;
         case SKINS.Y2K:
             bindButton(script.y2kSkinButton, "Y2K Skin");
             bindButton(script.y2kHandButton, "Y2K Hand");
             break;
         case SKINS.MODERN:
             bindButton(script.modernSkinButton, "Modern Skin");
             bindButton(script.modernHandButton, "Modern Hand");
             break;
         case SKINS.HAND:
             bindButton(script.handHandButton, "Hand Back");
             break;
         // No buttons to bind for VIDEO state
         case SKINS.VIDEO:
         default:
             print("DEBUG: No specific interactive buttons to bind for skin state: " + skinName);
             break;
     }
}

// --- Video Handling ---

// Function called every frame while waiting for video
function onVideoUpdate() {
    if (!isWaitingForVideo || !script.videoPlayer || !script.videoPlayer.control) {
        // Should not happen if logic is correct, but safety check
        stopVideoCheck(); // Stop checking if state is wrong
        return;
    }

    // Check the status
    var status = script.videoPlayer.control.getStatus();
    // print("DEBUG: Video status check: " + status); // Uncomment for debugging video status

    // Check if video has finished playing (Stopped status)
    // Important: Also check if it's stuck (Error status)
    if (status === VideoStatus.Stopped || status === VideoStatus.Error) {
        if (status === VideoStatus.Error) {
            print("ERROR: Intro video encountered an error.");
        } else {
            print("INFO: Intro video finished playing.");
        }
        stopVideoCheck(); // Stop checking frames
        proceedToWelcomeScreen(); // Transition to the welcome screen
    }
    // Note: We assume the video is set to play once (Loops = Once in Inspector)
    // If it loops, this condition might never be met unless manually stopped.
}

// Stops the per-frame video status check
function stopVideoCheck() {
    if (videoUpdateEvent) {
        script.removeEvent(videoUpdateEvent);
        videoUpdateEvent = null;
        print("DEBUG: Stopped video status check (UpdateEvent removed).");
    }
    isWaitingForVideo = false;
}

// Logic to run after video finishes (or if video is skipped)
function proceedToWelcomeScreen() {
    print("Proceeding to Welcome Screen...");
     // Ensure video screen is disabled if it exists
    if(script.videoScreenObject) {
        script.videoScreenObject.enabled = false;
    }
     // Stop video playback explicitly in case it errored or was looping
    if(script.videoPlayer && script.videoPlayer.control) {
        script.videoPlayer.control.stop();
    }


    // Now, enable the welcome screen
    if (script.welcomePrefab) {
        // Directly enable welcome prefab and bind its button
        print("Enabling Welcome Prefab.");
        script.welcomePrefab.enabled = true;
        currentSkin = SKINS.WELCOME; // Set state correctly
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
    // Skin mappings now only include interactive states
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
    if (script.videoPlayer && script.videoScreenObject) {
        print("Intro video configured. Starting video playback.");
        currentSkin = SKINS.VIDEO; // Set initial state
        script.videoScreenObject.enabled = true; // Enable the video display object
        script.videoPlayer.control.play(); // Tell the video to play

        // Check initial status immediately in case it's already stopped/error
         var initialStatus = script.videoPlayer.control.getStatus();
         if (initialStatus === VideoStatus.Stopped || initialStatus === VideoStatus.Error) {
             print("WARN: Intro video was already stopped or in error state on initialize.");
             proceedToWelcomeScreen(); // Go straight to welcome if video won't play
         } else {
             isWaitingForVideo = true; // Set flag to start checking status
             videoUpdateEvent = script.createEvent("UpdateEvent");
             videoUpdateEvent.bind(onVideoUpdate);
             print("Video playing. Waiting for completion...");
         }

    } else {
        print("INFO: No intro video configured or screen object missing. Skipping video playback.");
        // If no video, go directly to the welcome screen logic
        proceedToWelcomeScreen();
    }

    // DO NOT CALL bindAllHandlers() here. Binding happens specifically when needed.
    print("PlayerSkinManager initialized. Current state: " + currentSkin);
}

// --- Script Entry Point & Cleanup ---
initialize();

script.destroy = function() {
    print("Destroying PlayerSkinManager...");
    // Stop checking video status if applicable
    stopVideoCheck();

     // Stop video playback if it exists and might be playing
    if (script.videoPlayer && script.videoPlayer.control) {
        script.videoPlayer.control.stop();
    }

    // Stop audio from any potential managers
    stopAudioForManager(script.musicPlayerManagerY2K);
    stopAudioForManager(script.musicPlayerManagerModern);
    stopAudioForManager(script.musicPlayerManagerHand);

    // Consider unbinding listeners if feasible/necessary (more complex)
    // For simplicity, Lens Studio often handles cleanup, but explicit unbinding is safer

    // Ensure everything is disabled on destroy (optional, but can prevent lingering elements)
    // disableAllSkinsAndManagers(); // Might be redundant if LS cleans up

    print("PlayerSkinManager destroyed.");
};