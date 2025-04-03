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
// @input Component.ScriptComponent instantiator {"hint":"The Instantiator component to handle prefab instantiation"}
checkUndefined("instantiator", []);
// @input ObjectPrefab prefabTemplate {"hint":"The prefab template to spawn"}
checkUndefined("prefabTemplate", []);
// @input Component.Camera camera {"hint":"The camera used for spawn positioning"}
checkUndefined("camera", []);
// @input number spawnDistance = 1 {"hint":"Distance in front of camera to spawn prefab"}
checkUndefined("spawnDistance", []);
// @input number spawnScale = 1 {"hint":"Scale factor for spawned prefab"}
checkUndefined("spawnScale", []);
// @input boolean claimOwnership = true {"hint":"Claims ownership of the spawned prefab"}
checkUndefined("claimOwnership", []);
// @input string persistence = "Session" {"hint":"Persistence type: Session, Persistent, or Ephemeral"}
checkUndefined("persistence", []);
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
var Module = require("../../../../Modules/Src/Assets/CustomScripts/PrefabSpawn 2");
Object.setPrototypeOf(script, Module.PrefabSpawner.prototype);
script.__initialize();
if (script.onAwake) {
   script.onAwake();
}
