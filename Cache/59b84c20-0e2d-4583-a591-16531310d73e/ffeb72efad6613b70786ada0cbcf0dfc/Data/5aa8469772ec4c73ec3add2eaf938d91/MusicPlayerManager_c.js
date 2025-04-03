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
// @input Asset.AudioTrackAsset track1 {"hint":"Premier morceau de musique"}
checkUndefined("track1", []);
// @input Asset.AudioTrackAsset track2 {"hint":"Deuxième morceau de musique"}
checkUndefined("track2", []);
// @input Asset.AudioTrackAsset track3 {"hint":"Troisième morceau de musique"}
checkUndefined("track3", []);
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
// @input SceneObject progressBar {"hint":"Barre de progression"}
checkUndefined("progressBar", []);
// @input SceneObject earthSphere {"hint":"Sphère terrestre qui se déplace le long de la barre de progression"}
checkUndefined("earthSphere", []);
// @input Component.AudioComponent audioComponent {"hint":"Composant audio pour la lecture de musique"}
checkUndefined("audioComponent", []);
// @input string artist1 = "Artiste 1" {"hint":"Nom de l'artiste pour le premier morceau"}
checkUndefined("artist1", []);
// @input string title1 = "Titre 1" {"hint":"Titre du premier morceau"}
checkUndefined("title1", []);
// @input string artist2 = "Artiste 2" {"hint":"Nom de l'artiste pour le deuxième morceau"}
checkUndefined("artist2", []);
// @input string title2 = "Titre 2" {"hint":"Titre du deuxième morceau"}
checkUndefined("title2", []);
// @input string artist3 = "Artiste 3" {"hint":"Nom de l'artiste pour le troisième morceau"}
checkUndefined("artist3", []);
// @input string title3 = "Titre 3" {"hint":"Titre du troisième morceau"}
checkUndefined("title3", []);
// @input bool loopPlayback = true {"hint":"Activer la lecture en boucle"}
checkUndefined("loopPlayback", []);
// @input number earthSphereXOffset {"hint":"Décalage de la sphère terrestre sur l'axe X"}
checkUndefined("earthSphereXOffset", []);
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
