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
// @input Asset[] trackAssets {"hint":"Liste des morceaux (AudioTrackAsset ou RemoteReferenceAsset)"}
checkUndefined("trackAssets", []);
// @input string[] artists {"hint":"Liste des noms d'artistes correspondants aux morceaux"}
checkUndefined("artists", []);
// @input string[] titles {"hint":"Liste des titres des morceaux"}
checkUndefined("titles", []);
// @input SceneObject[] trackPrefabs {"hint":"Liste des prefabs à afficher pour chaque morceau (doit correspondre au nombre de morceaux)"}
checkUndefined("trackPrefabs", []);
// @input SceneObject stoppedPrefab {"hint":"Prefab à afficher lorsque la lecture est arrêtée"}
checkUndefined("stoppedPrefab", []);
// @input Component.Text artistNameText {"hint":"Texte pour afficher le nom de l'artiste"}
checkUndefined("artistNameText", []);
// @input Component.Text timecodeText {"hint":"Texte pour afficher le timecode actuel"}
checkUndefined("timecodeText", []);
// @input Component.Text trackTitleText {"hint":"Texte pour afficher le titre du morceau"}
checkUndefined("trackTitleText", []);
// @input Component.ScriptComponent playPauseButton {"hint":"Bouton pour lire/mettre en pause la musique"}
checkUndefined("playPauseButton", []);
// @input Component.ScriptComponent nextTrackButton {"hint":"Bouton pour passer au morceau suivant"}
checkUndefined("nextTrackButton", []);
// @input Component.ScriptComponent prevTrackButton {"hint":"Bouton pour revenir au morceau précédent"}
checkUndefined("prevTrackButton", []);
// @input Component.ScriptComponent repeatButton {"hint":"Bouton pour activer/désactiver la répétition"}
checkUndefined("repeatButton", []);
// @input dehydratedComponent.ScriptComponent shuffleButton {"hint":"Bouton pour activer/désactiver le mode shuffle"}
checkUndefined("shuffleButton", []);
// @input Component.ScriptComponent stopButton {"hint":"Bouton pour arrêter la lecture"}
checkUndefined("stopButton", []);
// @input SceneObject progressBar {"hint":"Barre de progression"}
checkUndefined("progressBar", []);
// @input SceneObject earthSphere {"hint":"Sphère terrestre qui se déplace le long de la barre de progression"}
checkUndefined("earthSphere", []);
// @input Component.AudioComponent audioComponent {"hint":"Composant audio pour la lecture de musique"}
checkUndefined("audioComponent", []);
// @input bool loopPlayback = true {"hint":"Activer la lecture en boucle"}
checkUndefined("loopPlayback", []);
// @input number earthSphereXOffset {"hint":"Décalage de la sphère terrestre sur l'axe X"}
checkUndefined("earthSphereXOffset", []);
// @input number rotationSpeed = 30 {"hint":"Vitesse de rotation de la sphère (degrés par seconde)"}
checkUndefined("rotationSpeed", []);
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
var Module = require("../../../Modules/Src/Assets/MusicPlayerManager");
Object.setPrototypeOf(script, Module.MusicPlayerManager.prototype);
script.__initialize();
if (script.onAwake) {
   script.onAwake();
}
