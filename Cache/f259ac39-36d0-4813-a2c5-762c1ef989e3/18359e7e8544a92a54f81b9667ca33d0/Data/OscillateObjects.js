// @input Component.Text bpmTextObject {"label": "BPM Text"}
// @input float scaleAmount = 0.5 {"label": "Scale Wave Amount"}
// @input float spinSpeed = 1.0 {"label": "Spin Multiplier"}
// @input float bpmMultiplier = 1.0 {"label": "BPM Calibration"}

// Store initial scale
var initialScale = script.getSceneObject().getTransform().getLocalScale();
var currentAngle = 0;
var currentBPM = 0;

// Function to extract BPM value from text
function getBPMFromText() {
    if (script.bpmTextObject) {
        var text = script.bpmTextObject.text;
        var matches = text.match(/\d+/);
        return matches ? parseInt(matches[0]) : 0;
    }
    return 0;
}

// Update event for continuous animation
script.createEvent("UpdateEvent").bind(function(eventData) {
    // Get current BPM
    currentBPM = getBPMFromText();
    if (currentBPM <= 0) return;
    
    var transform = script.getSceneObject().getTransform();
    var deltaTime = eventData.getDeltaTime();
    
    // Apply BPM calibration
    var calibratedBPM = currentBPM * script.bpmMultiplier;
    
    // Calculate beat frequency in radians per second
    var beatsPerSecond = calibratedBPM / 60;
    var frequency = beatsPerSecond * 2 * Math.PI;
    
    // Update current angle
    currentAngle += deltaTime * frequency * script.spinSpeed;
    
    // Calculate scale wave
    var scaleWave = Math.sin(currentAngle) * script.scaleAmount + 1;
    var newScale = new vec3(
        initialScale.x * scaleWave,
        initialScale.y * scaleWave,
        initialScale.z * scaleWave
    );
    
    // Apply rotation around Y axis
    var rotation = quat.fromEulerVec(new vec3(0, currentAngle, 0));
    
    // Update transform
    transform.setLocalScale(newScale);
    transform.setLocalRotation(rotation);
});
