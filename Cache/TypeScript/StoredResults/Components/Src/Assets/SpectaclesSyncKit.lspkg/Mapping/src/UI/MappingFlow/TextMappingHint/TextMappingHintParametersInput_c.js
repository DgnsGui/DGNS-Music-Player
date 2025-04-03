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
// @input float delayBeforeShowing = "12.0" {"hint":"The delay in seconds before showing the progress bar (via alpha)"}
checkUndefined("delayBeforeShowing", []);
// @input float delayTime = "1.0" {"hint":"The delay before the text starts to appear in seconds"}
checkUndefined("delayTime", []);
// @input float fadeInTime = "1.0" {"hint":"The duration in seconds for the text to gradually fade in (via alpha)"}
checkUndefined("fadeInTime", []);
// @input float displayTime = "3.0" {"hint":"The time in seconds during which the text is fully visible"}
checkUndefined("displayTime", []);
// @input float fadeOutTime = "1.0" {"hint":"The duration in seconds for the text to gradually fade out (via alpha)"}
checkUndefined("fadeOutTime", []);
// @input float earlyFadeOutTime = "0.3" {"hint":"Timing used to shorten the fade-out time if the state needs to end earlier than expected in seconds"}
checkUndefined("earlyFadeOutTime", []);
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
var Module = require("../../../../../../../../../Modules/Src/Assets/SpectaclesSyncKit.lspkg/Mapping/src/UI/MappingFlow/TextMappingHint/TextMappingHintParametersInput");
Object.setPrototypeOf(script, Module.TextMappingHintParametersInput.prototype);
script.__initialize();
if (script.onAwake) {
   script.onAwake();
}
