//@input Component.InteractionComponent interactionComponent
//@input Component.ScriptComponent hoverEventReset
//@input SceneObject dropDownMenu
//@input Component.ScriptComponent mainIconScript

const interactionComp = script.interactionComponent;
let isActive = false;
let isEnabled = false;
let enabledCnt = 0;

const delayedEvent = script.createEvent('DelayedCallbackEvent');
delayedEvent.bind(function() {
    script.dropDownMenu.enabled = false;
});

interactionComp.onHoverStart.add(function() {
    isActive = true;
    check();
});

interactionComp.onHoverEnd.add(function() {
    isActive = false;
    check();
});

function init() {
    script.mainIconScript.enabled = true;
}

function setEnabled(curStatus) {
    if (curStatus) {
        enabledCnt++;
    }
    else {
        enabledCnt--;
    }
    isEnabled = enabledCnt > 0;
    check();
}

function hoverReset() {
    if (isEnabled || isActive) {
        isEnabled = false;
        isActive = false;
        delayedEvent.reset(0.1);
        delayedEvent.enabled = true;
    }
}

function check() {
    if (isEnabled || isActive) {
        script.dropDownMenu.enabled = true;
        delayedEvent.enabled = false;
    } else {
        delayedEvent.reset(0.1);
        delayedEvent.enabled = true;
    }
}

script.setEnabled = setEnabled;

init();