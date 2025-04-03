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
// @input Asset.AudioTrackAsset[] localTracks
checkUndefined("localTracks", []);
// @input string[] localArtists
checkUndefined("localArtists", []);
// @input string[] localTitles
checkUndefined("localTitles", []);
// @input SceneObject[] localTrackPrefabs
checkUndefined("localTrackPrefabs", []);
// @input Asset.RemoteReferenceAsset[] remoteTracks
checkUndefined("remoteTracks", []);
// @input string[] remoteArtists
checkUndefined("remoteArtists", []);
// @input string[] remoteTitles
checkUndefined("remoteTitles", []);
// @input SceneObject[] remoteTrackPrefabs
checkUndefined("remoteTrackPrefabs", []);
// @input SceneObject stoppedPrefab
checkUndefined("stoppedPrefab", []);
// @input Component.Text artistNameText
checkUndefined("artistNameText", []);
// @input Component.Text timecodeText
checkUndefined("timecodeText", []);
// @input Component.Text trackTitleText
checkUndefined("trackTitleText", []);
// @input Component.ScriptComponent playPauseButton
checkUndefined("playPauseButton", []);
// @input Component.ScriptComponent nextTrackButton
checkUndefined("nextTrackButton", []);
// @input Component.ScriptComponent prevTrackButton
checkUndefined("prevTrackButton", []);
// @input Component.ScriptComponent repeatButton
checkUndefined("repeatButton", []);
// @input Component.ScriptComponent shuffleButton
checkUndefined("shuffleButton", []);
// @input Component.ScriptComponent stopButton
checkUndefined("stopButton", []);
// @input SceneObject progressBar
checkUndefined("progressBar", []);
// @input SceneObject earthSphere
checkUndefined("earthSphere", []);
// @input Component.AudioComponent audioComponent
checkUndefined("audioComponent", []);
// @input bool loopPlayback = true
checkUndefined("loopPlayback", []);
// @input number earthSphereXOffset
checkUndefined("earthSphereXOffset", []);
// @input number rotationSpeed = 30
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
