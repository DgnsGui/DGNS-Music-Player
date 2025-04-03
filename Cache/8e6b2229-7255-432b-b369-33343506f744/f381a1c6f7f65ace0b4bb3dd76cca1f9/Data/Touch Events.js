// TouchEvents.js
// Version 1.0.1
//
// Provides touch events as a block for AI Lens Creator
//
//@input bool blockDefaultTouches = false;
//@input bool allowDoubleTap = true;
//@input bool enableHint = true;

const eventModule = require("./HintEventsModule102.js");

const events = [
    ["onTap", "TapEvent","lens_hint_tap"],
    ["onDoubleTap", "DoubleTapEvent","lens_hint_tap"],
    ["onTouchDown", "TouchStartEvent","lens_hint_tap"],
    ["onTouchMove","TouchMoveEvent","lens_hint_tap"],
    ["onTouchUp","TouchEndEvent","lens_hint_tap"]
];
const inputVals = {
    blockDefaultTouches: script.blockDefaultTouches,
    allowDoubleTap: script.allowDoubleTap
};
const hintDuration = 3;
const hintDelay = 0.5;
let hints = [];

function init() {
    // register events
    for (const i in events) {
        registerEvent(events[i][0], events[i][1], events[i][2]);
    }
    setupTouchBlocking();
    if(script.enableHint){
        showHints();
    }
}

function setupTouchBlocking() {
    global.touchSystem.touchBlocking = inputVals.blockDefaultTouches;
    global.touchSystem.enableTouchBlockingException('TouchTypeDoubleTap', inputVals.allowDoubleTap);
}

function defineProperties() {
    Object.defineProperties(script, {
        blockDefaultTouches: {
            set: function(value) {
                inputVals.blockDefaultTouches = value;
                setupTouchBlocking();
            },
            get: function() {
                return inputVals.blockDefaultTouches;
            }
        },
        allowDoubleTap: {
            set: function(value) {
                inputVals.allowDoubleTap = value;
                setupTouchBlocking();
            },
            get: function() {
                return inputVals.allowDoubleTap;
            }
        }
    });
}

function registerEvent(name, builtinName,hintName) {
    script[name] = new eventModule.EventWrapper(addHint(hintName));
    script.createEvent(builtinName).bind(function(data) {
        const event = script[name];
        if (data && data.getTouchPosition && data.getTouchId) {
            const pos = data.getTouchPosition();
            event.trigger(data.getTouchId(), pos.x, pos.y);
        } else if (data && data.getTapPosition) {
            const pos = data.getTapPosition();
            event.trigger(-1, pos.x, pos.y);
        } else {
            event.trigger();
        }
    });
}

function addHint(name){
    return () => {
        // Adds all unique hints to array
        if(!hints.includes(name)){
            hints.push(name);
        }        
    }
}

function showHints(){
    let dcb = script.createEvent('DelayedCallbackEvent');
    // Outer delay callback waits for hint binding at start of lens
    dcb.bind(function(){
        for(item in hints){
            // Starts first loo
            let delay = hintDuration*item;
            let hint = hints[item];
            // Inner delay callback shows all bound hints in sequence
            let hintDcb = script.createEvent('DelayedCallbackEvent');
            hintDcb.bind(function(){
                // Shows a hint using the internal hint component.
                let hc = script.getSceneObject().createComponent('Component.HintsComponent');  
                hc.showHint(hint,hintDuration);
            });
            hintDcb.reset(delay);
        }
    });
    dcb.reset(hintDelay);
}

init();