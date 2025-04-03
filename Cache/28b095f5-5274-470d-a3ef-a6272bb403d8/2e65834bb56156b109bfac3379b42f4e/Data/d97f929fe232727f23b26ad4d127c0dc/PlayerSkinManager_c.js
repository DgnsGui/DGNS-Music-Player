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
// @input SceneObject musicPlayerY2K {"hint":"Prefab du Music Player Y2K"}
checkUndefined("musicPlayerY2K", []);
// @input Component.ScriptComponent musicPlayerManagerY2K {"hint":"MusicPlayerManager pour le skin Y2K"}
checkUndefined("musicPlayerManagerY2K", []);
// @input SceneObject musicPlayerModern {"hint":"Prefab du Music Player Modern"}
checkUndefined("musicPlayerModern", []);
// @input Component.ScriptComponent musicPlayerManagerModern {"hint":"MusicPlayerManager pour le skin Modern"}
checkUndefined("musicPlayerManagerModern", []);
// @input SceneObject musicPlayerHand {"hint":"Prefab du Music Player Hand"}
checkUndefined("musicPlayerHand", []);
// @input Component.ScriptComponent musicPlayerManagerHand {"hint":"MusicPlayerManager pour le skin Hand"}
checkUndefined("musicPlayerManagerHand", []);
// @input Component.ScriptComponent skinButtonY2K {"hint":"Bouton Skin dans le prefab Y2K pour basculer entre Y2K et Modern"}
checkUndefined("skinButtonY2K", []);
// @input Component.ScriptComponent skinButtonModern {"hint":"Bouton Skin dans le prefab Modern pour basculer entre Modern et Y2K"}
checkUndefined("skinButtonModern", []);
// @input Component.ScriptComponent handButtonY2K {"hint":"Bouton Hand dans le prefab Y2K pour passer au skin Hand"}
checkUndefined("handButtonY2K", []);
// @input Component.ScriptComponent handButtonModern {"hint":"Bouton Hand dans le prefab Modern pour passer au skin Hand"}
checkUndefined("handButtonModern", []);
// @input Component.ScriptComponent handButtonHand {"hint":"Bouton Hand dans le prefab Hand pour revenir au skin Y2K"}
checkUndefined("handButtonHand", []);
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
