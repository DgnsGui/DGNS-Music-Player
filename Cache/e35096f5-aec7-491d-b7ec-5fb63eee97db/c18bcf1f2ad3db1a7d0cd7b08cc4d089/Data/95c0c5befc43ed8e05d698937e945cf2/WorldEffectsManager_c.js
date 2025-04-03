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
// @input Asset.AudioTrackAsset[] tracks {"hint":"Liste des morceaux de musique"}
checkUndefined("tracks", []);
// @input string[] artists {"hint":"Liste des noms d'artistes correspondants aux morceaux"}
checkUndefined("artists", []);
// @input string[] titles {"hint":"Liste des titres des morceaux"}
checkUndefined("titles", []);
// @input SceneObject[] trackPrefabs {"hint":"Liste des prefabs à afficher pour chaque morceau (doit correspondre au nombre de morceaux)"}
checkUndefined("trackPrefabs", []);
// @input SceneObject[] worldMeshes {"hint":"Liste des world meshes à afficher pour chaque morceau (doit correspondre au nombre de morceaux)"}
checkUndefined("worldMeshes", []);
// @input SceneObject stoppedPrefab {"hint":"Prefab à afficher lorsque la lecture est arrêtée"}
checkUndefined("stoppedPrefab", []);
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
var Module = require("../../../Modules/Src/Assets/WorldEffectsManager");
Object.setPrototypeOf(script, Module.MusicPlayerManager.prototype);
script.__initialize();
if (script.onAwake) {
   script.onAwake();
}
