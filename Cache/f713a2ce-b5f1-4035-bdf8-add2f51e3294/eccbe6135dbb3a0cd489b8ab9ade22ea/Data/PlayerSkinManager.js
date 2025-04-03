// Lens Studio Script: PlayerSkinManager.JS
// Manages switching between different music player skins/layouts.
// Plays an intro video once before showing the welcome screen using event-driven approach.
// Uses delayed binding (binds buttons only *after* their skin is enabled).

// ----- INPUTS -----
// @ui {"widget":"group_start", "label":"Intro Video (Optional)"}
// @input Asset.Texture introVideoTexture {"label":"Intro Video Texture", "optional":true, "hint":"Assign the Video Texture asset from Resources."}
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

// Reference to the video controller and event handler
var videoControl = null;
var videoFinishHandler = null; // Store the bound function reference

// --- Helper Functions ---

// Updated validateInputs using getTypeName()
function validateInputs() {
    var valid = true;
    // Basic validation for essential non-video parts
    const inputsToCheck=[
        {obj:script.welcomePrefab,name:"Welcome Prefab"},
        // {obj:script.acknowledgeButton, name:"Acknowledge Button"}, // ScriptComponent, check below
        {obj:script.musicPlayerY2K,name:"Music Player Y2K"},
        {obj:script.musicPlayerManagerY2K,name:"Music Player Manager Y2K"},
        // {obj:script.y2kSkinButton, name: "Y2K Skin Button"}, // ScriptComponent, check below
        // {obj:script.y2kHandButton, name: "Y2K Hand Button"}, // ScriptComponent, check below
        {obj:script.musicPlayerModern,name:"Music Player Modern"},
        {obj:script.musicPlayerManagerModern,name:"Music Player Manager Modern"},
        // {obj:script.modernSkinButton, name: "Modern Skin Button"}, // ScriptComponent, check below
        // {obj:script.modernHandButton, name: "Modern Hand Button"}, // ScriptComponent, check below
        {obj:script.musicPlayerHand,name:"Music Player Hand"},
        {obj:script.musicPlayerManagerHand,name:"Music Player Manager Hand"},
        // {obj:script.handHandButton, name:"Hand Back Button"} // ScriptComponent, check below
    ];
     inputsToCheck.forEach(function(input){
        // Check only SceneObjects here, ScriptComponents are checked separately below
        // A simple check based on name conventions used in this script
        if(input.name.includes("Prefab") || input.name.includes("Player ") || input.name.includes("Manager") || input.name.includes("Screen Object")) {
             if(!input.obj){
                 // Allow videoScreenObject to be optional if introVideoTexture is also missing
                 if (!(input.name === "Video Screen Object" && !script.introVideoTexture)) {
                     print("ERROR: PlayerSkinManager - SceneObject Input missing: "+input.name+". Please assign it in the Inspector.");
                     valid=false;
                 }
             } else if (!(input.obj instanceof SceneObject)) {
                 print("ERROR: PlayerSkinManager - Input '" + input.name + "' is not a SceneObject. Please assign the correct type.");
                 valid = false;
             }
        }
    });

    // Specific validation for video setup if provided
    if (script.introVideoTexture && !script.videoScreenObject) {
        print("ERROR: PlayerSkinManager - 'Intro Video Texture' is assigned, but 'Video Screen Object' is missing. Please assign the SceneObject that displays the video.");
        valid = false;
    }
    if (!script.introVideoTexture && script.videoScreenObject) {
        print("WARN: PlayerSkinManager - 'Video Screen Object' is assigned, but 'Intro Video Texture' is missing. The video setup will be ignored.");
    }
    if (script.introVideoTexture && script.videoScreenObject) {
        // Check if the screen object actually has the necessary component
        if (!script.videoScreenObject.getComponent("Component.Image") && !script.videoScreenObject.getComponent("Component.MeshVisual")) {
             print("WARN: PlayerSkinManager - 'Video Screen Object' ("+ script.videoScreenObject.name +") doesn't seem to have an Image or MeshVisual component to display the video.");
             // This is a warning because the user might use a custom material setup.
        }
    }
    // Validate the Texture Asset
    if (script.introVideoTexture && !(script.introVideoTexture instanceof Asset.Texture)) {
         print("ERROR: PlayerSkinManager - Input 'Intro Video Texture' is not a Texture Asset. Please assign a Video Texture from the Resources panel.");
         valid = false;
    }


     // Validate button *ScriptComponents* using getTypeName()
    const buttonComponents = [
        { comp: script.acknowledgeButton, name: "Acknowledge Button" },
        { comp: script.y2kSkinButton, name: "Y2K Skin Button" },
        { comp: script.y2kHandButton, name: "Y2K Hand Button" },
        { comp: script.modernSkinButton, name: "Modern Skin Button" },
        { comp: script.modernHandButton, name: "Modern Hand Button" },
        { comp: script.handHandButton, name: "Hand Back Button" } // Renamed to match input label
    ];
    buttonComponents.forEach(function(item) {
        if (!item.comp) {
             print("ERROR: PlayerSkinManager - Input ScriptComponent missing: '" + item.name + "'. Please assign it in the Inspector.");
             valid = false;
        } else {
            // Check if it's a component first (basic check)
            if (typeof item.comp.getTypeName !== 'function') {
                 print("ERROR: PlayerSkinManager - Input '" + item.name + "' is not a valid Component. Check assignment.");
                 valid = false;
            } else if (item.comp.getTypeName() !== "Component.ScriptComponent") { // <--- CORRECTED CHECK
                print("ERROR: PlayerSkinManager - Input '" + item.name + "' is not a ScriptComponent (Type is: " + item.comp.getTypeName() + "). Please assign the Script Component itself.");
                valid = false;
            }
             // Optional: Check if it's attached to a SceneObject that is currently accessible
             else if (!item.comp.getSceneObject()) {
                 print("WARN: PlayerSkinManager - Input ScriptComponent '" + item.name + "' does not seem to be attached to an active Scene Object currently. Ensure the object exists and is enabled when needed.");
                 // Making this a warning as the object might be intentionally disabled initially.
             }
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
    print("Disabling all skins, managers, and video screen...");
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
    print("Switching from skin '" + currentSkin + "' to '" + newSkinName + "'");
    const currentSkinData = skinMappings[currentSkin];
    const newSkinData = skinMappings[newSkinName];
    if (!newSkinData) { print("ERROR: Could not find mapping for target skin: " + newSkinName); return; }

    // --- Disable Current "Interactive" Skin ---
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
    // Validate again just before binding (in case it became invalid)
     if (typeof buttonScriptComponent.getTypeName !== 'function' || buttonScriptComponent.getTypeName() !== "Component.ScriptComponent") {
        print("ERROR: PlayerSkinManager - Input for '" + buttonName + "' is not a valid ScriptComponent at binding time. Check Inspector link.");
        return;
    }

    var targetComponent = buttonScriptComponent;
    var ownerObject = targetComponent.getSceneObject ? targetComponent.getSceneObject() : null;
    var ownerName = ownerObject ? ownerObject.name : "UnknownObject";

    try {
        // Determine the event source (API or direct component property)
        var eventSource = null;
        var eventMethod = "unknown"; // For logging

        // Prefer API if available and has the event
        if (targetComponent.api && typeof targetComponent.api.onButtonPinched !== 'undefined') {
             eventSource = targetComponent.api.onButtonPinched;
             eventMethod = "api.onButtonPinched";
             print("INFO: PlayerSkinManager - Using '" + eventMethod + "' for '" + buttonName + "'");
        }
        // Fallback to direct component property
        else if (typeof targetComponent.onButtonPinched !== 'undefined') {
            eventSource = targetComponent.onButtonPinched;
            eventMethod = "component.onButtonPinched";
            print("INFO: PlayerSkinManager - Using '" + eventMethod + "' for '" + buttonName + "'");
        } else {
            print("ERROR: PlayerSkinManager - Input ScriptComponent for '" + buttonName + "' on object '" + ownerName + "' is MISSING 'onButtonPinched' (checked api and component level). Cannot bind.");
            return;
        }

        // Check if the event source is actually an event object with subscribe/add
        if (!eventSource || (typeof eventSource.subscribe !== 'function' && typeof eventSource.add !== 'function')) {
             print("ERROR: PlayerSkinManager - Property '" + eventMethod + "' for '" + buttonName + "' is not a valid event object (missing subscribe/add methods).");
             return;
        }

        // Try binding with subscribe or add
        if (typeof eventSource.subscribe === 'function') {
            eventSource.subscribe(function(eventData) { handlePinchEvent(buttonName, "subscribe (" + eventMethod + ")", eventData); });
            print("Binding successful using subscribe() for button: " + buttonName);
        } else if (typeof eventSource.add === 'function') {
            print("INFO: '" + eventMethod + "' for '" + buttonName + "' does not have 'subscribe'. Trying fallback '.add()'.");
            // Note: add() typically doesn't pass eventData, adjust handlePinchEvent if needed
            eventSource.add(function() { handlePinchEvent(buttonName, "add (" + eventMethod + ")"); });
            print("Binding successful using fallback '.add()' for button: " + buttonName);
        }
        // We already checked for subscribe/add above, so no else needed here

    } catch (e) {
        print("ERROR: PlayerSkinManager - Failed during binding attempt for " + buttonName + ": " + e);
        if(e.stack) print("Stack: " + e.stack);
    }
}

function handlePinchEvent(buttonName, methodUsed, eventData) { // eventData might be undefined if .add() was used
    print("DEBUG: Pinch event RECEIVED via "+methodUsed+" for button: "+buttonName);
    print("DEBUG: Current skin state when '"+buttonName+"' pinched: "+currentSkin);

    // Relevance Check: Ensure the button press corresponds to the currently active skin
    var isRelevant=false;
    if      (buttonName==="Acknowledge" && currentSkin===SKINS.WELCOME) isRelevant=true;
    else if (buttonName==="Y2K Skin"    && currentSkin===SKINS.Y2K)     isRelevant=true;
    else if (buttonName==="Y2K Hand"    && currentSkin===SKINS.Y2K)     isRelevant=true;
    else if (buttonName==="Modern Skin" && currentSkin===SKINS.MODERN)  isRelevant=true;
    else if (buttonName==="Modern Hand" && currentSkin===SKINS.MODERN)  isRelevant=true;
    // Match button name "Hand Back" to the input label "Disable Hand Button" -> handHandButton
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
             // Use "Hand Back" as the logical name for the button that goes back
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

// This function will be called ONLY when the video finishes playing
function onVideoFinished() {
    print("INFO: Intro video finished playing (onPlaybackDone event received).");

    // Safety check: Only proceed if we are actually in the video state.
    if (currentSkin !== SKINS.VIDEO) {
        print("WARN: onVideoFinished called but current skin is already " + currentSkin + ". Ignoring.");
        // Attempt cleanup just in case listener wasn't removed properly
        if (videoControl && videoFinishHandler) {
            videoControl.onPlaybackDone.remove(videoFinishHandler);
            print("DEBUG: Removed stray onPlaybackDone listener.");
            videoFinishHandler = null;
        }
        return;
    }

    // Clean up the event listener *before* changing state
    if (videoControl && videoFinishHandler) {
        // Use the stored reference to unbind
        videoControl.onPlaybackDone.remove(videoFinishHandler);
        print("DEBUG: Removed onPlaybackDone listener.");
        videoFinishHandler = null; // Clear the stored reference
    } else {
        print("WARN: onVideoFinished called, but videoControl or videoFinishHandler was null. Listener might not have been removed.");
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
        print("ERROR: PlayerSkinManager initialization failed due to missing or invalid inputs. Please check the Inspector and Console logs.");
        // Optionally disable the script component to prevent further errors
        // script.enabled = false;
        return; // Stop initialization if validation fails
    }

    print("DEBUG: Populating skin mappings...");
    skinMappings = {
        [SKINS.WELCOME]: { skin: script.welcomePrefab, manager: null }, // No manager for welcome
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
             print("ERROR: Could not get video control interface from the provided Intro Video Texture. Make sure it's a valid Video Texture asset and processed correctly.");
             proceedToWelcomeScreen(); // Skip video if control is invalid
             return; // Exit initialize early
        }

        // Attempt to assign the texture to the screen object
        var textureAssigned = false;
        var imageComponent = script.videoScreenObject.getComponent("Component.Image");
        var meshVisualComponent = script.videoScreenObject.getComponent("Component.MeshVisual");

        if (imageComponent) {
             try {
                 imageComponent.mainPass.baseTex = script.introVideoTexture;
                 textureAssigned = true;
                 print("DEBUG: Assigned video texture to Image component on " + script.videoScreenObject.name);
             } catch (e) {
                 print("ERROR: Failed to assign video texture to Image component's mainPass: " + e);
             }
        } else if (meshVisualComponent) {
             try {
                 // Ensure there's a material to assign to
                 if (!meshVisualComponent.mainMaterial) {
                     print("WARN: Video Screen Object (" + script.videoScreenObject.name + ") has a MeshVisual but no mainMaterial assigned. Cannot automatically assign video texture.");
                 } else {
                     meshVisualComponent.mainMaterial.mainPass.baseTex = script.introVideoTexture;
                     textureAssigned = true;
                     print("DEBUG: Assigned video texture to MeshVisual mainMaterial mainPass on " + script.videoScreenObject.name);
                 }
             } catch (e) {
                  print("ERROR: Failed to assign video texture to MeshVisual component's mainMaterial mainPass: " + e);
             }
        } else {
             print("ERROR: Video Screen Object (" + script.videoScreenObject.name + ") has neither an Image nor a MeshVisual component. Cannot display video.");
        }

        // Only proceed with playback if texture assignment seemed possible
        if (textureAssigned || (imageComponent || meshVisualComponent)) { // Proceed even if assignment failed but component exists
            print("Intro video configured. Setting up playback.");
            currentSkin = SKINS.VIDEO; // Set initial state

            // Store the handler function *before* binding
            videoFinishHandler = onVideoFinished;
            // Bind the event listener
            try {
                if(videoControl.onPlaybackDone) {
                    videoControl.onPlaybackDone.add(videoFinishHandler);
                    print("DEBUG: Added onPlaybackDone listener.");
                } else {
                     print("ERROR: videoControl does not have onPlaybackDone event. Video finish cannot be detected automatically.");
                     proceedToWelcomeScreen(); // Skip video logic if event is missing
                     return;
                }
            } catch (e) {
                print("ERROR: Failed to add onPlaybackDone listener: " + e);
                proceedToWelcomeScreen(); // Skip video logic on error
                return;
            }


            // Ensure video screen is enabled
            script.videoScreenObject.enabled = true;

            // Play the video *once*
            try {
                videoControl.play(1);
                print("Video playing (once). Waiting for onPlaybackDone event...");
            } catch (e) {
                 print("ERROR: Failed to start video playback: " + e);
                 // If play fails, remove listener and proceed
                 if (videoControl.onPlaybackDone && videoFinishHandler) {
                    videoControl.onPlaybackDone.remove(videoFinishHandler);
                 }
                 videoFinishHandler = null;
                 proceedToWelcomeScreen();
                 return;
            }

            // Optional: Check if ready immediately (often false right after play)
            // print("DEBUG: videoControl.isPlaybackReady: " + videoControl.isPlaybackReady);

        } else {
             // Texture couldn't be assigned and no suitable component found
             print("WARN: Skipping video playback because the Video Screen Object cannot display it.");
             proceedToWelcomeScreen();
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
         try {
            videoControl.onPlaybackDone.remove(videoFinishHandler);
            print("DEBUG: Removed onPlaybackDone listener during destroy.");
         } catch (e) {
            print("WARN: Failed to remove onPlaybackDone listener during destroy: " + e);
         }
    }
     videoFinishHandler = null; // Clear reference

     // Stop video playback if it exists and might be playing
    if (videoControl) {
         try {
            videoControl.stop();
         } catch(e) {
            print("WARN: Error stopping videoControl during destroy: " + e);
         }
    }
    videoControl = null; // Clear reference

    // Stop audio from any potential managers
    stopAudioForManager(script.musicPlayerManagerY2K);
    stopAudioForManager(script.musicPlayerManagerModern);
    stopAudioForManager(script.musicPlayerManagerHand);

    // Unbinding button listeners: Generally handled by LS garbage collection.
    // Add explicit unbinding here only if memory leaks or ghost events become an issue.

    print("PlayerSkinManager destroyed.");
};