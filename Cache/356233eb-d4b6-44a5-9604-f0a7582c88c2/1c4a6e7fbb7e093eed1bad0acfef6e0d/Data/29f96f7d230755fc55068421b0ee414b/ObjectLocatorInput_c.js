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
// @input SceneObject hintRoot
checkUndefined("hintRoot", []);
// @input SceneObject startPointRoot
checkUndefined("startPointRoot", []);
// @input Component.RenderMeshVisual arrow
checkUndefined("arrow", []);
// @input SceneObject startPointObject
checkUndefined("startPointObject", []);
// @input Component.Text hintText
checkUndefined("hintText", []);
// @input Component.Text teachingText
checkUndefined("teachingText", []);
// @input float scalingInTime = "0.3" {"hint":"Time in seconds for scaling the object locator In"}
checkUndefined("scalingInTime", []);
// @input float scalingOutTime = "0.3" {"hint":"Time in seconds for scaling the object locator Out"}
checkUndefined("scalingOutTime", []);
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
var Module = require("../../../../../../../../../Modules/Src/Assets/Snap Stuff/SpectaclesSyncKit.lspkg/Mapping/src/UI/ObjectLocator/ObjectLocatorInput");
Object.setPrototypeOf(script, Module.ObjectLocatorInput.prototype);
script.__initialize();
if (script.onAwake) {
   script.onAwake();
}
