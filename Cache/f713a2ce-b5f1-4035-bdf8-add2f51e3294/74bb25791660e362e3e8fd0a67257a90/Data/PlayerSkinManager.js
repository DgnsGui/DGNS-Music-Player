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
// @input Component.ScriptComponent handHandButton {"label":"Disable Hand Button"} // Label from Inspector image
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

// Updated validateInputs using getTypeName() for SceneObjects and Components
function validateInputs() {
    var valid = true;
    // Check SceneObject inputs
    const sceneObjectInputs=[
        {obj:script.welcomePrefab, name:"Welcome Prefab"},
        {obj:script.musicPlayerY2K, name:"Music Player Y2K"},
        {obj:script.musicPlayerManagerY2K, name:"Music Player Manager Y2K"},
        {obj:script.musicPlayerModern, name:"Music Player Modern"},
        {obj:script.musicPlayerManagerModern, name:"Music Player Manager Modern"},
        {obj:script.musicPlayerHand, name:"Music Player Hand"},
        {obj:script.musicPlayerManagerHand, name:"Music Player Manager Hand"},
        {obj:script.videoScreenObject, name: "Video Screen Object"} // Check this too
    ];

     sceneObjectInputs.forEach(function(input){
        // First check if the input object exists
        if(!input.obj){
            // Allow videoScreenObject to be optional ONLY if introVideoTexture is also missing
            if (!(input.name === "Video Screen Object" && !script.introVideoTexture)) {
                print("ERROR: PlayerSkinManager - SceneObject Input missing: "+input.name+". Please assign it in the Inspector.");
                valid=false;
            }
        } else {
             // Now check if the existing object is actually a SceneObject using getTypeName()
             if (typeof input.obj.getTypeName !== 'function' || input.obj.getTypeName() !== "SceneObject") { // <--- CORRECTED CHECK
                  print("ERROR: PlayerSkinManager - Input '" + input.name + "' is not a SceneObject (Type is: " + (typeof input.obj.getTypeName === 'function' ? input.obj.getTypeName() : typeof input.obj) + "). Please assign a SceneObject.");
                  valid = false;
             }
        }
    });

    // Specific validation for video texture asset
    if (script.introVideoTexture && !script.videoScreenObject) {
        // This error is implicitly covered above if videoScreenObject is null, but good to keep explicit
        print("ERROR: PlayerSkinManager - 'Intro Video Texture' is assigned, but 'Video Screen Object' (SceneObject) is missing.");
        // valid = false; // Already potentially set above
    }
    if (!script.introVideoTexture && script.videoScreenObject) {
        print("WARN: PlayerSkinManager - 'Video Screen Object' is assigned, but 'Intro Video Texture' is missing. The video setup will be ignored.");
    }
     // Validate the Texture Asset itself if assigned
    if (script.introVideoTexture) {
        if (typeof script.introVideoTexture.getTypeName !== 'function' || !script.introVideoTexture.getTypeName().startsWith("Asset.Texture")) {
             print("ERROR: PlayerSkinManager - Input 'Intro Video Texture' is not a Texture Asset (Type is: " + (typeof script.introVideoTexture.getTypeName === 'function' ? script.introVideoTexture.getTypeName() : typeof script.introVideoTexture) + "). Please assign a Video Texture from Resources.");
             valid = false;
        }
        // Optional deeper check:
        // else if (script.introVideoTexture.getTypeName() !== "Asset.Texture.Video") {
        //    print("WARN: PlayerSkinManager - Input 'Intro Video Texture' is not specifically a Video Texture.");
        // }
    }
     // Check if the video screen object has a visual component (only if both texture and object assigned)
     if (script.introVideoTexture && script.videoScreenObject && valid) { // Added 'valid' check here
        if (script.videoScreenObject.getTypeName() === "SceneObject") { // Check it's a scene object before getComponent
            if (!script.videoScreenObject.getComponent("Component.Image") && !script.videoScreenObject.getComponent("Component.MeshVisual")) {
                 print("WARN: PlayerSkinManager - Assigned 'Video Screen Object' ("+ script.videoScreenObject.name +") doesn't seem to have an Image or MeshVisual component to display the video.");
            }
        }
     }


     // Validate button *ScriptComponents* using getTypeName()
    const buttonComponents = [
        { comp: script.acknowledgeButton, name: "Acknowledge Button" },
        { comp: script.y2kSkinButton, name: "Y2K Skin Button" },
        { comp: script.y2kHandButton, name: "Y2K Hand Button" },
        { comp: script.modernSkinButton, name: "Modern Skin Button" },
        { comp: script.modernHandButton, name: "Modern Hand Button" },
        { comp: script.handHandButton, name: "Disable Hand Button" } // Name matches the input label in image
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
    // Check if manager is a valid SceneObject before proceeding
    if(!manager || typeof manager.getTypeName !== 'function' || manager.getTypeName() !== 'SceneObject') {
        // print("DEBUG: stopAudioForManager - Provided manager is not a valid SceneObject.");
        return;
    }
    if(manager.enabled && manager.getComponent){ // Check enabled status
        var managerScript=manager.getComponent("Component.ScriptComponent");
        if(managerScript && managerScript.api && typeof managerScript.api.stopTrack==='function'){
            // print("DEBUG: Calling stopTrack() on "+manager.name);
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
    // Define all potentially disable-able SceneObjects
    const objectsToDisable = [
        script.welcomePrefab,
        script.musicPlayerY2K,
        script.musicPlayerManagerY2K,
        script.musicPlayerModern,
        script.musicPlayerManagerModern,
        script.musicPlayerHand,
        script.musicPlayerManagerHand,
        script.videoScreenObject
    ];

    objectsToDisable.forEach(function(obj) {
        if (obj && typeof obj.getTypeName === 'function' && obj.getTypeName() === 'SceneObject') {
            obj.enabled = false;
        }
    });

    // Stop video if it exists and might be playing
    if (videoControl) {
        try { videoControl.stop(); } catch(e){} // Best effort stop
    }
    print("All elements disabled (or attempted).");
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
            if (currentSkinData.manager) stopAudioForManager(currentSkinData.manager); // Stop audio first
            if (currentSkinData.skin && currentSkinData.skin.getTypeName && currentSkinData.skin.getTypeName() === 'SceneObject') {
                 currentSkinData.skin.enabled = false;
            }
            if (currentSkinData.manager && currentSkinData.manager.getTypeName && currentSkinData.manager.getTypeName() === 'SceneObject') {
                currentSkinData.manager.enabled = false;
            }
        } else if (currentSkin === SKINS.WELCOME && script.welcomePrefab && script.welcomePrefab.getTypeName && script.welcomePrefab.getTypeName() === 'SceneObject') {
             // Handle welcome specifically if not in main mappings (though it is now)
             script.welcomePrefab.enabled = false;
        }
    }

    // --- Enable New Skin ---
    print("DEBUG: Enabling new skin elements for: " + newSkinName);
    if (newSkinData.skin && newSkinData.skin.getTypeName && newSkinData.skin.getTypeName() === 'SceneObject') {
        newSkinData.skin.enabled = true;
    }
    if (newSkinData.manager && newSkinData.manager.getTypeName && newSkinData.manager.getTypeName() === 'SceneObject') {
        newSkinData.manager.enabled = true;
    }

    // --- Bind Buttons for the NEWLY Enabled Skin ---
    // Ensure the new objects are enabled *before* binding
    global.behaviorSystem.addDelayedCallback(function() {
        print("DEBUG: Delayed callback executing: Binding buttons for " + newSkinName);
        bindSkinButtons(newSkinName); // Bind buttons specific to the activated skin
    });


    var previousSkin = currentSkin;
    currentSkin = newSkinName; // Update the state AFTER enabling (binding happens slightly after)
    print("Successfully switched state to skin: " + currentSkin + " (from: " + previousSkin + ")");
}


function bindButton(buttonScriptComponent, buttonName) {
    if (!buttonScriptComponent) {
        print("ERROR: PlayerSkinManager - Button ScriptComponent input not assigned for: " + buttonName + ". Cannot bind.");
        return;
    }
    // Validate again just before binding
     if (typeof buttonScriptComponent.getTypeName !== 'function' || buttonScriptComponent.getTypeName() !== "Component.ScriptComponent") {
        print("ERROR: PlayerSkinManager - Input for '" + buttonName + "' is not a valid ScriptComponent at binding time. Check Inspector link.");
        return;
    }
     // Ensure the component is attached to an enabled SceneObject
    var ownerObject = buttonScriptComponent.getSceneObject();
    if (!ownerObject || !ownerObject.enabled) {
        print("WARN: PlayerSkinManager - Cannot bind button '" + buttonName + "' because its SceneObject is null or disabled.");
        return;
    }
    var ownerName = ownerObject.name; // Get name after confirming ownerObject exists


    try {
        // Determine the event source (API or direct component property)
        var eventSource = null;
        var eventMethod = "unknown"; // For logging

        // Prefer API if available and has the event
        if (buttonScriptComponent.api && typeof buttonScriptComponent.api.onButtonPinched !== 'undefined') {
             eventSource = buttonScriptComponent.api.onButtonPinched;
             eventMethod = "api.onButtonPinched";
             // print("INFO: PlayerSkinManager - Using '" + eventMethod + "' for '" + buttonName + "'");
        }
        // Fallback to direct component property
        else if (typeof buttonScriptComponent.onButtonPinched !== 'undefined') {
            eventSource = buttonScriptComponent.onButtonPinched;
            eventMethod = "component.onButtonPinched";
            // print("INFO: PlayerSkinManager - Using '" + eventMethod + "' for '" + buttonName + "'");
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
        var bindFunc = function(eventData) { handlePinchEvent(buttonName, "event (" + eventMethod + ")", eventData); };
        var bindFuncNoArgs = function() { handlePinchEvent(buttonName, "event (" + eventMethod + ")"); };

        if (typeof eventSource.subscribe === 'function') {
            eventSource.subscribe(bindFunc);
            print("Binding successful using subscribe() for button: " + buttonName);
        } else if (typeof eventSource.add === 'function') {
            print("INFO: '" + eventMethod + "' for '" + buttonName + "' does not have 'subscribe'. Trying fallback '.add()'.");
            eventSource.add(bindFuncNoArgs);
            print("Binding successful using fallback '.add()' for button: " + buttonName);
        }

    } catch (e) {
        print("ERROR: PlayerSkinManager - Failed during binding attempt for " + buttonName + ": " + e);
        if(e.stack) print("Stack: " + e.stack);
    }
}

function handlePinchEvent(buttonName, methodUsed, eventData) { // eventData might be undefined
    print("DEBUG: Pinch event RECEIVED via "+methodUsed+" for button: "+buttonName);
    print("DEBUG: Current skin state when '"+buttonName+"' pinched: "+currentSkin);

    // Relevance Check
    var isRelevant=false;
    if      (buttonName==="Acknowledge" && currentSkin===SKINS.WELCOME) isRelevant=true;
    else if (buttonName==="Y2K Skin"    && currentSkin===SKINS.Y2K)     isRelevant=true;
    else if (buttonName==="Y2K Hand"    && currentSkin===SKINS.Y2K)     isRelevant=true;
    else if (buttonName==="Modern Skin" && currentSkin===SKINS.MODERN)  isRelevant=true;
    else if (buttonName==="Modern Hand" && currentSkin===SKINS.MODERN)  isRelevant=true;
    // Match button name "Disable Hand Button" (from input) to "Hand Back" logical action
    else if (buttonName==="Disable Hand Button" && currentSkin===SKINS.HAND) isRelevant=true;

    print("DEBUG: Is '"+buttonName+"' relevant for current skin '"+currentSkin+"'? "+isRelevant);
    if (isRelevant) {
         print("EVENT: Button pinch is relevant, executing callback for: "+buttonName);
         switch(buttonName) {
             case "Acknowledge": switchToSkin(SKINS.Y2K); break;
             case "Y2K Skin":    switchToSkin(SKINS.MODERN); break;
             case "Y2K Hand":    switchToSkin(SKINS.HAND); break;
             case "Modern Skin": switchToSkin(SKINS.Y2K); break;
             case "Modern Hand": switchToSkin(SKINS.HAND); break;
             case "Disable Hand Button":   switchToSkin(SKINS.Y2K); break; // Go back to Y2K from Hand skin
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
             // Use the actual Input name for binding consistency
             bindButton(script.handHandButton, "Disable Hand Button");
             break;
         case SKINS.VIDEO: // No buttons for video state
         default:
             print("DEBUG: No specific interactive buttons to bind for skin state: " + skinName);
             break;
     }
}

// --- Video Handling ---

function onVideoFinished() {
    print("INFO: Intro video finished playing (onPlaybackDone event received).");
    if (currentSkin !== SKINS.VIDEO) {
        print("WARN: onVideoFinished called but current skin is already " + currentSkin + ". Ignoring.");
        if (videoControl && videoFinishHandler) { try { videoControl.onPlaybackDone.remove(videoFinishHandler); print("DEBUG: Removed stray onPlaybackDone listener."); } catch(e){} }
        videoFinishHandler = null;
        return;
    }
    if (videoControl && videoFinishHandler) {
        try { videoControl.onPlaybackDone.remove(videoFinishHandler); print("DEBUG: Removed onPlaybackDone listener."); } catch(e){ print("WARN: Failed to remove onPlaybackDone listener: " + e);}
        videoFinishHandler = null;
    } else { print("WARN: onVideoFinished called, but videoControl or videoFinishHandler was null."); }

    proceedToWelcomeScreen();
}

function proceedToWelcomeScreen() {
    print("Proceeding to Welcome Screen...");
     if(script.videoScreenObject && script.videoScreenObject.getTypeName && script.videoScreenObject.getTypeName() === 'SceneObject') {
        script.videoScreenObject.enabled = false;
    }
    if(videoControl) { try { videoControl.stop(); } catch(e){} } // Best effort stop

    if (script.welcomePrefab && script.welcomePrefab.getTypeName && script.welcomePrefab.getTypeName() === 'SceneObject') {
        print("Enabling Welcome Prefab.");
        script.welcomePrefab.enabled = true;
        currentSkin = SKINS.WELCOME; // Set state correctly BEFORE binding attempt
        // Use delayed callback for binding after enable
        global.behaviorSystem.addDelayedCallback(function() {
             print("DEBUG: Delayed callback executing: Binding Acknowledge button.");
             bindButton(script.acknowledgeButton,"Acknowledge");
        });
        print("Initial state set: Welcome screen enabled. Current skin: " + currentSkin + ". Awaiting Acknowledge bind/interaction.");
    } else {
        print("WARN: Welcome prefab missing or invalid. Attempting to start directly with Y2K skin.");
        switchToSkin(SKINS.Y2K); // This will enable Y2K and bind its buttons (via delayed callback)
    }
}


// --- Initialization ---
function initialize() {
    print("--- Initializing PlayerSkinManager ---");
    if (!validateInputs()) {
        print("ERROR: PlayerSkinManager initialization failed due to missing or invalid inputs. Please check the Inspector and Console logs. Script stopped.");
        script.enabled = false; // Disable script to prevent further errors
        return;
    }

    print("DEBUG: Populating skin mappings...");
    skinMappings = {
        [SKINS.WELCOME]: { skin: script.welcomePrefab, manager: null },
        [SKINS.Y2K]:    { skin: script.musicPlayerY2K,    manager: script.musicPlayerManagerY2K },
        [SKINS.MODERN]: { skin: script.musicPlayerModern, manager: script.musicPlayerManagerModern },
        [SKINS.HAND]:   { skin: script.musicPlayerHand,   manager: script.musicPlayerManagerHand }
    };
    print("DEBUG: Skin mappings populated.");

    disableAllSkinsAndManagers(); // Start by disabling everything

    // --- Start Video or Skip to Welcome ---
    if (script.introVideoTexture && script.videoScreenObject) {
        videoControl = script.introVideoTexture.control;

        if (!videoControl) {
             print("ERROR: Could not get video control interface from the Intro Video Texture. Skipping video.");
             proceedToWelcomeScreen();
             return;
        }

        // Assign texture (best effort)
        var textureAssigned = false;
        try {
            var imageComponent = script.videoScreenObject.getComponent("Component.Image");
            var meshVisualComponent = script.videoScreenObject.getComponent("Component.MeshVisual");
            if (imageComponent) {
                 imageComponent.mainPass.baseTex = script.introVideoTexture; textureAssigned = true;
                 print("DEBUG: Assigned video texture to Image component.");
            } else if (meshVisualComponent && meshVisualComponent.mainMaterial) {
                 meshVisualComponent.mainMaterial.mainPass.baseTex = script.introVideoTexture; textureAssigned = true;
                 print("DEBUG: Assigned video texture to MeshVisual mainMaterial.");
            } else {
                 print("WARN: Cannot automatically assign texture - Video Screen Object lacks Image/MeshVisual or mainMaterial.");
            }
        } catch (e) {
            print("ERROR: Failed assigning video texture: " + e);
        }

        // Proceed if texture likely assigned or visual component exists
        if (textureAssigned || script.videoScreenObject.getComponent("Component.Image") || script.videoScreenObject.getComponent("Component.MeshVisual")) {
            print("Intro video configured. Setting up playback.");
            currentSkin = SKINS.VIDEO;
            videoFinishHandler = onVideoFinished; // Store handler reference

            try {
                if(!videoControl.onPlaybackDone) throw new Error("onPlaybackDone event missing from videoControl.");
                videoControl.onPlaybackDone.add(videoFinishHandler);
                print("DEBUG: Added onPlaybackDone listener.");

                script.videoScreenObject.enabled = true; // Enable screen
                videoControl.play(1); // Play once
                print("Video playing (once). Waiting for onPlaybackDone event...");

            } catch (e) {
                print("ERROR: Failed setting up/starting video playback: " + e);
                if (videoControl.onPlaybackDone && videoFinishHandler) { try { videoControl.onPlaybackDone.remove(videoFinishHandler); } catch(e2){} } // Cleanup listener on error
                videoFinishHandler = null;
                proceedToWelcomeScreen(); // Skip to welcome on error
                return;
            }
        } else {
             print("WARN: Skipping video playback - Video Screen Object cannot display texture.");
             proceedToWelcomeScreen();
        }

    } else {
        print("INFO: No intro video texture or screen object assigned. Skipping video.");
        proceedToWelcomeScreen();
    }

    print("--- PlayerSkinManager Initialized Successfully. Current state: " + currentSkin + " ---");
}

// --- Script Entry Point & Cleanup ---
initialize();

script.destroy = function() {
    print("--- Destroying PlayerSkinManager ---");
    // Clean up video event listener
    if (videoControl && videoFinishHandler) {
         try { videoControl.onPlaybackDone.remove(videoFinishHandler); print("DEBUG: Removed onPlaybackDone listener during destroy."); }
         catch (e) { print("WARN: Failed to remove onPlaybackDone listener during destroy: " + e); }
    }
     videoFinishHandler = null; videoControl = null; // Clear references

    // Stop audio (best effort)
    stopAudioForManager(script.musicPlayerManagerY2K);
    stopAudioForManager(script.musicPlayerManagerModern);
    stopAudioForManager(script.musicPlayerManagerHand);

    // Explicitly unbinding button listeners is usually not necessary due to GC,
    // but could be implemented by storing references if needed.

    print("--- PlayerSkinManager Destroyed ---");
};