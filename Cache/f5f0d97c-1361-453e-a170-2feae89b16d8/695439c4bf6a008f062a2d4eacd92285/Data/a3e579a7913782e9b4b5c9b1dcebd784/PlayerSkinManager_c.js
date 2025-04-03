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
// @input SceneObject musicPlayerY2K {"hint":"Prefab pour le skin Y2K"}
checkUndefined("musicPlayerY2K", []);
// @input SceneObject musicPlayerModern {"hint":"Prefab pour le skin Modern"}
checkUndefined("musicPlayerModern", []);
// @input SceneObject musicPlayerHand {"hint":"Prefab pour le skin Hand"}
checkUndefined("musicPlayerHand", []);
// @input Component.ScriptComponent musicPlayerManagerY2K {"hint":"Script MusicPlayerManager pour le skin Y2K"}
checkUndefined("musicPlayerManagerY2K", []);
// @input Component.ScriptComponent musicPlayerManagerModern {"hint":"Script MusicPlayerManager pour le skin Modern"}
checkUndefined("musicPlayerManagerModern", []);
// @input Component.ScriptComponent musicPlayerManagerHand {"hint":"Script MusicPlayerManager pour le skin Hand"}
checkUndefined("musicPlayerManagerHand", []);
// @input Component.ScriptComponent skinButton {"hint":"Bouton pour basculer entre Y2K et Modern"}
checkUndefined("skinButton", []);
// @input Component.ScriptComponent handButton {"hint":"Bouton pour passer au skin Hand"}
checkUndefined("handButton", []);
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
var Module = require("../../../Modules/Src/Assets/PlayerSkinManager");
Object.setPrototypeOf(script, Module.PlayerSkinManager.prototype);
script.__initialize();
if (script.onAwake) {
   script.onAwake();
}
