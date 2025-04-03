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
// @input SceneObject root
checkUndefined("root", []);
// @typename PinchButton
// @input float distance = "160.0"
checkUndefined("distance", []);
// @input Component.RenderMeshVisual tile
checkUndefined("tile", []);
// @input Component.Text titleText
checkUndefined("titleText", []);
// @input Component.Text[] hintsTitle
checkUndefined("hintsTitle", []);
// @input Component.Text[] hintsText
checkUndefined("hintsText", []);
// @input PinchButton keepLookingButton
checkUndefined("keepLookingButton", []);
// @input Component.RenderMeshVisual keepLookingButtonMesh
checkUndefined("keepLookingButtonMesh", []);
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
var Module = require("../../../../../../../../../Modules/Src/Assets/Snap Stuff/SpectaclesSyncKit.lspkg/Mapping/src/UI/MappingUnsuccessful/MappingUnsuccessfulNotificationInput");
Object.setPrototypeOf(script, Module.MappingUnsuccessfulNotificationInput.prototype);
script.__initialize();
if (script.onAwake) {
   script.onAwake();
}
