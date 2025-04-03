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
// @input Component.ScriptComponent pinchButton {"hint":"The PinchButton that will trigger the prefab spawn"}
checkUndefined("pinchButton", []);
// @input ObjectPrefab prefabTemplate {"hint":"The prefab to spawn"}
checkUndefined("prefabTemplate", []);
// @input Component.Camera camera {"hint":"The camera used for spawn positioning"}
checkUndefined("camera", []);
// @input Component.ScriptComponent instantiator {"hint":"The Instantiator component for prefab instantiation"}
checkUndefined("instantiator", []);
// @input number spawnDistance = 1 {"hint":"Distance in front of camera to spawn prefab"}
checkUndefined("spawnDistance", []);
// @input number spawnScale = 1 {"hint":"Scale factor for spawned prefabs"}
checkUndefined("spawnScale", []);
// @input boolean enableRotation = true {"hint":"Enable rotation for spawned prefabs"}
checkUndefined("enableRotation", []);
// @input boolean enableScaling = true {"hint":"Enable scaling for spawned prefabs"}
checkUndefined("enableScaling", []);
// @input boolean enableTranslation = true {"hint":"Enable translation for spawned prefabs"}
checkUndefined("enableTranslation", []);
// @input boolean enableAnimation = true {"hint":"Enable animation playback for spawned prefabs"}
checkUndefined("enableAnimation", []);
// @input boolean autoPlayAnimation = true {"hint":"Auto-play animations on spawn"}
checkUndefined("autoPlayAnimation", []);
// @input boolean claimOwnership = true {"hint":"Claim ownership of spawned prefabs"}
checkUndefined("claimOwnership", []);
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
var Module = require("../../../../Modules/Src/Assets/CustomScripts/PrefabSpawn");
Object.setPrototypeOf(script, Module.PrefabSpawn.prototype);
script.__initialize();
if (script.onAwake) {
   script.onAwake();
}
