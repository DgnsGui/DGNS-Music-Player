// SliderScaleManager.js
// Connects the Trippy Factor slider to the SCALE parameter in shaders

// @input Component.Script sliderComponent
// @input Component.RenderMeshVisual[] targetMeshes

var sik = global.SIK ? global.SIK : {};

script.createEvent("UpdateEvent").bind(function() {
    if (script.sliderComponent && script.sliderComponent.api && script.sliderComponent.api.getValue) {
        updateShaderParameter(script.sliderComponent.api.getValue());
    }
});

function updateShaderParameter(value) {
    // Update all target meshes with the slider value
    if (script.targetMeshes) {
        for (var i = 0; i < script.targetMeshes.length; i++) {
            var mesh = script.targetMeshes[i];
            if (mesh && mesh.getMaterial(0)) {
                mesh.getMaterial(0).mainPass.floatParamMap.SCALE = value;
                // Debug output
                print("Setting SCALE to: " + value + " on mesh: " + i);
            }
        }
    }
}

// Initialize
function init() {
    // Initial update with current slider value
    if (script.sliderComponent && script.sliderComponent.api && script.sliderComponent.api.getValue) {
        updateShaderParameter(script.sliderComponent.api.getValue());
    } else {
        print("WARNING: Slider component not properly configured or missing getValue API");
    }
}

// Run initialization
init();