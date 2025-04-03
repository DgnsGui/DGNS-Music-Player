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
// @input Component.ScriptComponent pinchButton {"hint":"The PinchButton that will trigger the object spawn"}
checkUndefined("pinchButton", []);
// @input SceneObject objectTemplate {"hint":"The object template to spawn"}
checkUndefined("objectTemplate", []);
// @input Component.Camera camera {"hint":"The camera used for spawn positioning"}
checkUndefined("camera", []);
// @input number spawnDistance = 1 {"hint":"Distance in front of camera to spawn object"}
checkUndefined("spawnDistance", []);
// @input number spawnScale = 1 {"hint":"Scale factor for spawned objects"}
checkUndefined("spawnScale", []);
// @input boolean enableRotation = true {"hint":"Enable rotation for spawned objects"}
checkUndefined("enableRotation", []);
// @input boolean enableScaling = true {"hint":"Enable scaling for spawned objects"}
checkUndefined("enableScaling", []);
// @input boolean enableTranslation = true {"hint":"Enable translation for spawned objects"}
checkUndefined("enableTranslation", []);
// @input boolean enableAnimation = true {"hint":"Enable animation playback for spawned objects"}
checkUndefined("enableAnimation", []);
// @input boolean autoPlayAnimation = true {"hint":"Auto-play animations on spawn"}
checkUndefined("autoPlayAnimation", []);
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
var Module = require("../../../../Modules/Src/Assets/CustomScripts/ObjectSpawn");
Object.setPrototypeOf(script, Module.ObjectSpawn.prototype);
script.__initialize();
if (script.onAwake) {
   script.onAwake();
}
