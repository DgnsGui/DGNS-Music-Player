/**
 * Raycaster.js
 * Version: 0.2.0
 * Description: Helper script for performing raycasting operations with WorldQuery on Snap Spectacles.
 * Author: Bennyp3333 [https://benjamin-p.dev]
 * 
 * ==== Input ====
 * 
 * - Component.Camera camera
 *   - The camera used for raycasting. If not set, the script attempts to find a default camera in the scene.
 * 
 * ==== Examples ====
 * 
 * // Basic Example:
 * new global.Raycaster().start();
 * 
 * // Intermediate Example:
 * new global.Raycaster().raycastForward((result) => {
 *     if (result) {
 *         print("Hit at position: " + result.position);
 *     } else {
 *         print("No hit detected.");
 *     }
 * }).loop();
 * 
 * // Advanced Example:
 * var options = new global.RaycasterOptions();
 * options.retryOnMiss = true;
 * options.averageRaycasts = true;
 * options.ignorePitch = false;
 * 
 * var raycaster = new global.Raycaster(options).raycastRandom((raycastResult) => {
 *     if (!raycastResult) { return; }
 * 
 *     var rayHitPos = raycastResult.position;
 *     var rayHitNormal = raycastResult.normal;
 *     var rayHitMidpoint = raycastResult.midpoint;
 * 
 *     print("Raycast Hit! " + 
 *     "\npos: " + raycastResult.position + 
 *     "\nnorm: " + raycastResult.normal + 
 *     "\nmidpoint: " + raycastResult.midpoint);
 * }).loop(0.1);
 * 
 * ==== API ====
 * 
 * - RaycasterOptions:
 *   Options for configuring the Raycaster.
 *   - averageRaycasts (bool): Default true. Enables averaging for multiple raycast results.
 *   - retryOnMiss (bool): Default true. Retries the raycast if no hit is detected.
 *   - ignorePitch (bool): Default true. Ignores the pitch component in ray direction calculations.
 *   - isLooping (bool): Default false. Toggles looping for raycasts.
 *   - loopDelay (number): Default 0.5. Delay between raycasts when looping.
 *
 * - Raycaster:
 *   - Raycaster(raycasterOptions): Constructs a new Raycaster instance.
 *     - raycasterOptions (RaycasterOptions): Optional. Provide configuration for the new Raycaster.
 * 
 * - Methods:
 *   - raycastForward(callback):
 *     Performs a raycast directly forward from the camera's view.
 *     - callback (function): Called with the raycast result (raycastResult) or null if no hit is detected.
 * 
 *   - raycastRandom(callback):
 *     Performs a raycast in a random direction.
 *     - callback (function): Called with the raycast result (raycastResult) or null if no hit is detected.
 *
 *   - raycastDir(direction, callback):
 *     Performs a raycast in a specified direction.
 *     - direction (vec3): The direction of the raycast from the camera position.
 *     - callback (function): Called with the raycast result (raycastResult) or null if no hit is detected.
 *
 *   - setCallback(callback):
 *     Sets the callback function to handle the raycast results.
 *     - callback (function): Function called with the raycast result (raycastResult) or null.
 *
 *   - loop(loopDelay):
 *     Enables looping mode for raycasts.
 *     - loopDelay (number): Optional. Delay (in seconds) between raycasts.
 *       - If loopDelay is zero, raycasts will loop as fast as possible, i.e., every frame.
 *
 *   - start():
 *     Starts the raycasting process. Useful for resuming after a stop().
 *
 *   - stop():
 *     Stops the raycasting process. Useful for pausing or stopping loops.
 *
 * - Callback Parameters:
 *   The callback function receives a single parameter (raycastResult), which is an object containing:
 *   - position (vec3): World position of the hit.
 *   - normal (vec3): Normal vector at the hit point.
 *   - midpoint (vec3): Midpoint between the camera and the hit position.
 * 
 * If no hit is detected, the callback receives null. 
 * When retryOnMiss is true, the raycast will repeat until a hit occurs.
 */

//@input Component.Camera camera
//@ui {"widget":"separator"}
//@input bool debug
//@input Component.Text debugText {"showIf":"debug"}

// Constants for hit test distance thresholds
const MAX_HIT_DISTANCE = 1000; // Maximum distance for a raycast
const MIN_HIT_DISTANCE = 50; // Minimum distance for a raycast

// Auxiliary raycasting configuration
const AUX_RAYCAST_COUNT = 8; // Number of additional raycasts for averaging
const AUX_RAYCAST_MISS_TOLERANCE = 2; // Maximum misses allowed for averaging
const AUX_RAYCAST_OFFSET_MULTIPLIER = 0.02; // Offset multiplier for auxiliary raycasts

// Range for random raycasting directions
const RAYCAST_RANDOM_RANGE = new vec2(1.0, 0.5);

// Delay for retrying failed raycasts
const RETRY_DELAY = 0.0;

var cameraComponent = script.camera;
var cameraObject = null;
var cameraTransform = null;

var raycasterIdx = 0;

var WorldQueryModule = require("LensStudio:WorldQueryModule");

function init(){
    initCamera();
}

function initCamera(){
    if(!cameraComponent){
        cameraComponent = findFirstComponentByType(null, "Component.Camera");  
    }
    
    if(!cameraComponent){
        throw new Error("Camera not found! \nMake sure there is a camera in our scene or manually set the camera parameter in the Raycaster script.");
    }
    
    cameraObject = cameraComponent.getSceneObject();
    cameraTransform = cameraObject.getTransform();
    
    var deviceTrackingComponent = cameraObject.getComponent("Component.DeviceTracking");
    var deviceLocationTrackingComponent = cameraObject.getComponent("Component.DeviceLocationTrackingComponent");
    
    if(!deviceTrackingComponent && !deviceLocationTrackingComponent){
        throw new Error("Your main camera is currently missing a 'Device Tracking Component'.");
    }
}

// Modes available for raycasting
const RaycasterMode = {
    Forward: 0,  // Raycasting straight forward
    Random: 1,   // Raycasting in a random direction
    Direction: 2 // Raycasting in a specific direction
}

// Default options for a Raycaster
function RaycasterOptions(){
    this.averageRaycasts = true;
    this.retryOnMiss = true;
    this.ignorePitch = true;
    this.isLooping = false;
    this.loopDelay = 0.5;
}

// Constructor for Raycaster
function Raycaster(raycasterOptions){
    this.options = raycasterOptions ? raycasterOptions : new RaycasterOptions();
    this.mode = RaycasterMode.Forward;
    
    this.hitTestSession = WorldQueryModule.createHitTestSession();
    this.sessionStarted = false;
    this.hitTestResults = [];
    this.currentDirection = vec3.zero();
    
    this.raycastCallback = null;
    this.delayEvents = [];

    this.id = raycasterIdx++;
    this.started = false;
    this.ready = true;
    
    this.debugLog("Initilized!");
    
    return this;
}

// Start a forward raycast
Raycaster.prototype.raycastForward = function(callback){
    this.mode = RaycasterMode.Forward;
    this.raycastCallback = callback;
    return this.start();
}

// Start a random-direction raycast
Raycaster.prototype.raycastRandom = function(callback){
    this.mode = RaycasterMode.Random;
    this.raycastCallback = callback;
    return this.start();
}

// Start a raycast in a specific direction
Raycaster.prototype.raycastDir = function(dir, callback){
    this.mode = RaycasterMode.Direction;
    this.currentDirection = dir;
    this.raycastCallback = callback;
    return this.start();
}

// Set the callback function for raycast results
Raycaster.prototype.setCallback = function(callback){
    this.raycastCallback = callback;
    return this;
}

// Enable looping mode with optionally setting the delay
Raycaster.prototype.loop = function(loopDelay = 0.5){
    this.options.isLooping = true;
    this.options.loopDelay = loopDelay;
    return this.start();
}

// Start the raycast process
Raycaster.prototype.start = function(){
    this.doRaycast();
    return this;
}

Raycaster.prototype.startHitTestSession = function(){
    this.hitTestSession.start();
    this.sessionStarted = true;
}

// Stop the raycasting process
Raycaster.prototype.stop = function(){
    this.started = false;
    this.stopDelays();
    this.stopHitTestSession();
    return this;
}

Raycaster.prototype.stopDelays = function(){
    while(this.delayEvents.length > 0){
        var delayEvent = this.delayEvents.pop();
        delayEvent.enabled = false;
        delayEvent.reset(0);
    }
}

Raycaster.prototype.stopHitTestSession = function(){
    this.hitTestSession.stop();
    this.sessionStarted = false;
}

// Main raycast execution logic
Raycaster.prototype.doRaycast = function(){
    if(!this.ready){ return; }
    if(!this.sessionStarted){ this.startHitTestSession(); }
    
    this.started = true;
    this.ready = false;

    if(this.mode == RaycasterMode.Forward || this.mode == RaycasterMode.Random){
        var forward = cameraTransform.forward;
        if(this.options.ignorePitch){
            forward.y = 0;
            forward = forward.normalize();
        }
        if(this.mode == RaycasterMode.Random){
            var right = cameraTransform.right;
            var up = cameraTransform.up;
            
            var randomX = randomRange(-1, 1) * RAYCAST_RANDOM_RANGE.x;
            var randomY = randomRange(-1, 1) * RAYCAST_RANDOM_RANGE.y;
            
            var randomDir = forward.add(right.uniformScale(randomX));
            randomDir = randomDir.add(up.uniformScale(randomY));
            randomDir = randomDir.normalize();

            this.currentDirection = randomDir;
        }else{
            this.currentDirection = forward;
        }
    }
    
    if(this.options.averageRaycasts){
        this.hitTestAverage(this.currentDirection);
    }else{
        this.hitTest(this.currentDirection);
    }
}

Raycaster.prototype.hitTest = function(dir){
    const cameraPosition = cameraTransform.getWorldPosition();
    
    const rayStart = cameraPosition.add(dir.uniformScale(-MIN_HIT_DISTANCE));
    const rayEnd = cameraPosition.add(dir.uniformScale(-MAX_HIT_DISTANCE));
    
    this.hitTestSession.hitTest(rayStart, rayEnd, (hitTestResult) => {
        this.onHitTestResult(hitTestResult);
    });
}

Raycaster.prototype.hitTestAverage = function(dir){
    dir = dir.normalize();
    
    var arbitrary = Math.abs(dir.y) < 0.99 ? new vec3(0, 1, 0) : new vec3(1, 0, 0);
    var right = dir.cross(arbitrary).normalize();
    var up = right.cross(dir).normalize();
    
    this.hitTest(dir);
    
    for(var i = 0; i < AUX_RAYCAST_COUNT; i++){
        var offsetDir = dir;
        var xOffset = Math.sin((i / AUX_RAYCAST_COUNT) * 2 * Math.PI) * AUX_RAYCAST_OFFSET_MULTIPLIER;
        var yOffset = Math.cos((i / AUX_RAYCAST_COUNT) * 2 * Math.PI) * AUX_RAYCAST_OFFSET_MULTIPLIER;
        offsetDir = offsetDir.add(right.uniformScale(xOffset));
        offsetDir = offsetDir.add(up.uniformScale(yOffset));
        offsetDir = offsetDir.normalize();
        this.hitTest(offsetDir);
    }
}

Raycaster.prototype.onHitTestResult = function(hitTestResult){
    this.hitTestResults.push(hitTestResult);
    if(this.options.averageRaycasts){
        if(this.hitTestResults.length > AUX_RAYCAST_COUNT){
            this.handleHitTestResults();
        }
    }else{
        this.handleHitTestResults();
    }
}

Raycaster.prototype.handleHitTestResults = function(){
    const cameraPosition = cameraTransform.getWorldPosition();
    
    if(this.options.averageRaycasts){
        var countResultsAreNull = 0;
        var positionSum = vec3.zero();
        var normalSum = vec3.zero();
        for(var i = 0; i < this.hitTestResults.length; i++){
            var hitTestResult = this.hitTestResults[i];
            if(hitTestResult != null){
                positionSum = positionSum.add(hitTestResult.position);
                normalSum = normalSum.add(hitTestResult.normal);
            }else{
                countResultsAreNull += 1;
            }
        }
        if(countResultsAreNull > AUX_RAYCAST_MISS_TOLERANCE){
            if(this.options.retryOnMiss){
                this.retryRaycast();
            }else{
                this.callbackWithResult(null);
            }
        }else{
            var countGoodResults = this.hitTestResults.length - countResultsAreNull;
            var resultPos = positionSum.uniformScale(1/countGoodResults);
            var resultNorm = normalSum.uniformScale(1/countGoodResults);
            var resultMidpoint = cameraPosition.add(resultPos).uniformScale(0.5);
            this.callbackWithResult({
                'position': resultPos,
                'normal': resultNorm,
                'midpoint': resultMidpoint,
            });
        }
    }else{
        if(this.hitTestResults[0] != null){
            var resultPos = this.hitTestResults[0].position;
            var resultNorm = this.hitTestResults[0].normal;
            var resultMidpoint = cameraPosition.add(resultPos).uniformScale(0.5);
            this.callbackWithResult({
                'position': resultPos,
                'normal': resultNorm,
                'midpoint': resultMidpoint,
            });
        }else{
            if(this.options.retryOnMiss){
                this.retryRaycast();
            }else{
                this.callbackWithResult(null);
            }
        }
    }
    
    this.hitTestResults = [];
}

Raycaster.prototype.retryRaycast = function(){
    if(!this.started){ return; }
    
    this.debugLog("Raycast Missed! - retrying in " + RETRY_DELAY + " seconds");
    this.ready = true;
    this.repeatRaycast(RETRY_DELAY);
}

Raycaster.prototype.repeatRaycast = function(delay){
    if(!this.started){ return; }
    
    if(delay > 0){
        var retryRaycastDelay = script.createEvent("DelayedCallbackEvent");
        retryRaycastDelay.bind(() => {
            this.doRaycast();
        });
        retryRaycastDelay.reset(delay);
        this.delayEvents.push(retryRaycastDelay);
    }else{
        this.doRaycast();
    }
}

Raycaster.prototype.callbackWithResult = function(raycastResult){
    if(!this.started){ return; }
    
    if(raycastResult){
        this.debugLog("Raycast Hit! " + 
        "\npos: " + raycastResult.position + 
        "\nnorm: " + raycastResult.normal + 
        "\nmidpoint: " + raycastResult.midpoint); 
    }else{
        this.debugLog("Raycast Missed!");
    }
    
    if(this.raycastCallback){
        this.raycastCallback(raycastResult);
    }
    
    this.onFinished();
}

Raycaster.prototype.onFinished = function(){
    this.ready = true;
    
    if(this.options.isLooping){
        this.repeatRaycast(this.options.loopDelay);
    }else{
        this.stop();
    }
}

Raycaster.prototype.debugLog = function(message){
    if(script.debug){
        var newLog = "Raycaster " + this.id + ": " + message;
        if(global.textLogger){ global.logToScreen(newLog); }
        if(script.debugText){ script.debugText.text = newLog; }
        print(newLog);
    }
}

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function findFirstComponentByType(root, componentType) {
    if (root === null) {
        const rootObjectCount = global.scene.getRootObjectsCount();
        for (let i = 0; i < rootObjectCount; i++) {
            const rootObject = global.scene.getRootObject(i);
            const result = findFirstComponentByType(rootObject, componentType);
            if (result) {
                return result;
            }
        }
    } else {
        const components = root.getComponents(componentType);
        if (components.length > 0) {
            return components[0];
        }

        for (let i = 0; i < root.getChildrenCount(); i++) {
            const child = root.getChild(i);
            const result = findFirstComponentByType(child, componentType);
            if (result) {
                return result;
            }
        }
    }
    return null;
}

global.RaycasterMode = RaycasterMode;
global.RaycasterOptions = RaycasterOptions;
global.Raycaster = Raycaster;

script.createEvent("OnStartEvent").bind(init);