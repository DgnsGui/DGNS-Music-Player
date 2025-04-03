// @input Component.Text bpmResultText
// @input Component.ScriptComponent pinchButton {"hint": "Assign a PinchButton component here"}
// @input Component.ScriptComponent lockButton {"hint": "Assign a PinchButton to toggle BPM lock"}

// Initialize variables for BPM calculation
var pressTimestamps = [];
var lastCalculatedBPM = 0;
var isLocked = false;
const MEASUREMENT_WINDOW = 5000; // 5 seconds window
const MIN_PRESSES = 2; // Minimum number of presses to calculate BPM

script.createEvent("OnStartEvent").bind(function() {
    if (!script.pinchButton) {
        print("Warning: No PinchButton component assigned!");
        return;
    }

    if (!script.lockButton) {
        print("Warning: No lock button assigned!");
        return;
    }

    // Set up the pinch button event handler
    script.pinchButton.onButtonPinched.add(function(eventData) {
        if (!isLocked) {
            pressTimestamps.push(getTime());
        }
    });

    // Set up the lock button event handler
    script.lockButton.onButtonPinched.add(function(eventData) {
        isLocked = !isLocked;
        if (!isLocked) {
            // Clear timestamps when unlocking to start fresh
            pressTimestamps = [];
        }
    });
});

script.createEvent("UpdateEvent").bind(function() {
    if (isLocked) {
        return; // Don't update BPM when locked
    }

    // Remove timestamps older than measurement window
    const currentTime = getTime();
    pressTimestamps = pressTimestamps.filter(timestamp => 
        currentTime - timestamp <= MEASUREMENT_WINDOW / 1000
    );
    
    // Calculate and update BPM if we have enough presses
    if (pressTimestamps.length >= MIN_PRESSES) {
        lastCalculatedBPM = calculateBPM();
        updateBPMDisplay();
    }
});

function calculateBPM() {
    if (pressTimestamps.length < MIN_PRESSES) {
        return lastCalculatedBPM;
    }
    
    // Calculate average time between presses
    let totalIntervals = 0;
    let intervalCount = 0;
    
    for (let i = 1; i < pressTimestamps.length; i++) {
        const interval = pressTimestamps[i] - pressTimestamps[i-1];
        totalIntervals += interval;
        intervalCount++;
    }
    
    const averageInterval = totalIntervals / intervalCount;
    // Convert to BPM: (1 second / average interval in seconds) * 60 seconds
    return (1 / averageInterval) * 60;
}

function updateBPMDisplay() {
    if (script.bpmResultText) {
        script.bpmResultText.text = Math.round(lastCalculatedBPM) + " BPM";
    }
}

// Initialize text with 0 BPM
if (script.bpmResultText) {
    script.bpmResultText.text = "0 BPM";
}