if (script.onAwake) {
	script.onAwake();
	return;
};
function checkUndefined(property, showIfData){
   for (var i = 0; i < showIfData.length; i++){
       if (showIfData[i][0] && script[showIfData[i][0]] != showIfData[i][1]){
           return;
       }
   }
   if (script[property] == undefined){
      throw new Error('Input ' + property + ' was not provided for the object ' + script.getSceneObject().name);
   }
}
// @input int buttonType {"widget":"combobox", "values":[{"label":"Pinch Button", "value":0}, {"label":"Toggle Button", "value":1}, {"label":"State Button", "value":2}]}
checkUndefined("buttonType", []);
// @ui {"widget":"separator"}
// @input Component.RenderMeshVisual renderMeshVisual
checkUndefined("renderMeshVisual", []);
// @input bool useGlowMesh {"showIf":"buttonType", "showIfValue":0}
checkUndefined("useGlowMesh", [["buttonType",0]]);
// @input Component.RenderMeshVisual glowRenderMeshVisual {"showIf":"useGlowMesh", "showIfValue":true}
// @input float maxBlendShapeWeight = 1
checkUndefined("maxBlendShapeWeight", []);
// @ui {"widget":"separator"}
// @input string meshBlendShapeName = "Pinch"
checkUndefined("meshBlendShapeName", []);
// @input Asset.Material meshIdleMaterial
checkUndefined("meshIdleMaterial", []);
// @input Asset.Material meshHoverMaterial
checkUndefined("meshHoverMaterial", []);
// @input Asset.Material meshPinchedMaterial
checkUndefined("meshPinchedMaterial", []);
// @ui {"widget":"separator"}
// @input string glowBlendShapeName = "Pinch" {"showIf":"useGlowMesh", "showIfValue":true}
// @input Asset.Material glowIdleMaterial {"showIf":"useGlowMesh", "showIfValue":true}
// @input Asset.Material glowHoverMaterial {"showIf":"useGlowMesh", "showIfValue":true}
// @input Asset.Material glowPinchedMaterial {"showIf":"useGlowMesh", "showIfValue":true}
// @input Asset.Material meshToggledPinchedMaterial {"showIf":"buttonType", "showIfValue":1}
// @input Asset.Material meshToggledHoverMaterial {"showIf":"buttonType", "showIfValue":1}
// @input Asset.Material meshToggledIdleMaterial {"showIf":"buttonType", "showIfValue":1}
// @input Asset.Material meshStatePinchedMaterial {"showIf":"buttonType", "showIfValue":2}
// @input Asset.Material meshStateHoverMaterial {"showIf":"buttonType", "showIfValue":2}
// @input Asset.Material meshStateIdleMaterial {"showIf":"buttonType", "showIfValue":2}
// @input bool persistentPinchedState {"showIf":"buttonType", "showIfValue":2}
checkUndefined("persistentPinchedState", [["buttonType",2]]);
// @ui {"widget":"separator"}
// @input Asset.Texture defaultIcon
// @input Asset.Texture onIcon
var scriptPrototype = Object.getPrototypeOf(script);
if (!global.BaseScriptComponent){
   function BaseScriptComponent(){}
   global.BaseScriptComponent = BaseScriptComponent;
   global.BaseScriptComponent.prototype = scriptPrototype;
   global.BaseScriptComponent.prototype.__initialize = function(){};
   global.BaseScriptComponent.getTypeName = function(){
       throw new Error("Cannot get type name from the class, not decorated with @component");
   }
}
var Module = require("../../../../../../Modules/Src/Assets/SpectaclesInteractionKit/Components/Helpers/ButtonFeedback");
Object.setPrototypeOf(script, Module.ButtonFeedback.prototype);
script.__initialize();
if (script.onAwake) {
   script.onAwake();
}
