// SliderToShaderParameter.js
// Connects the Trippy Factor slider to the SCALE parameter in shaders

// @input Component.ScriptComponent sliderScript
// @input Component.RenderMeshVisual[] meshesToAffect

script.api.onSliderValueChanged = function(value) {
    // Update the SCALE parameter on all target meshes
    for (var i = 0; i < script.meshesToAffect.length; i++) {
        var meshVisual = script.meshesToAffect[i];
        if (meshVisual && meshVisual.getMaterial(0)) {
            meshVisual.getMaterial(0).mainPass.floatParamMap.SCALE = value;
        }
    }
};

function init() {
    // Register with the slider to receive value changes
    if (script.sliderScript) {
        script.sliderScript.api.registerCallback(script.api.onSliderValueChanged);
    } else {
        print("ERROR: Please set the Slider Script input");
    }
}

init();