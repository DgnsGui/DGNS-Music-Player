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
// @input Asset.AudioTrackAsset[] tracks
checkUndefined("tracks", []);
// @input string[] artists = {"Artist 1","Artist 2","Artist 3"}
checkUndefined("artists", []);
// @input string[] titles = {"Title 1","Title 2","Title 3"}
checkUndefined("titles", []);
// @input Component.Text artistNameText
checkUndefined("artistNameText", []);
// @input Component.Text trackTitleText
checkUndefined("trackTitleText", []);
// @input Component.Text timecodeText
checkUndefined("timecodeText", []);
// @input Component.ScriptComponent playPauseButton
checkUndefined("playPauseButton", []);
// @input Component.ScriptComponent nextTrackButton
checkUndefined("nextTrackButton", []);
// @input Component.ScriptComponent prevTrackButton
checkUndefined("prevTrackButton", []);
// @input Component.ScriptComponent stopButton
checkUndefined("stopButton", []);
// @input Component.ScriptComponent shuffleButton
checkUndefined("shuffleButton", []);
// @input Component.ScriptComponent repeatButton
checkUndefined("repeatButton", []);
// @input Component.AudioComponent audioComponent
checkUndefined("audioComponent", []);
// @input bool autoPlayOnStart
checkUndefined("autoPlayOnStart", []);
// @input bool loopPlayback
checkUndefined("loopPlayback", []);
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
Object.setPrototypeOf(script, Module.OptimizedMusicPlayer.prototype);
script.__initialize();
if (script.onAwake) {
   script.onAwake();
}
