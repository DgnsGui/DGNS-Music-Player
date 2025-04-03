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
// @input float delayBeforeShowing = "4.0" {"hint":"The delay in seconds before showing the progress bar (via alpha)"}
checkUndefined("delayBeforeShowing", []);
// @input float scalingInTime = "0.4" {"hint":"Time in seconds for scaling the progress bar In"}
checkUndefined("scalingInTime", []);
// @input float scalingOutTime = "0.3" {"hint":"Time in seconds for scaling the progress bar Out"}
checkUndefined("scalingOutTime", []);
// @input float fadeInTime = "0.5" {"hint":"The duration in seconds for the progress bar to gradually fade in (via alpha)"}
checkUndefined("fadeInTime", []);
// @input float fadeOutTime = "0.3" {"hint":"The duration in seconds for the progress bar to gradually fade out (via alpha)"}
checkUndefined("fadeOutTime", []);
// @input float minScaleCoefficient = "0.8" {"hint":"Minimum coefficient for the progress bar size"}
checkUndefined("minScaleCoefficient", []);
// @input float maxScaleCoefficient = "1.15" {"hint":"Maximum coefficient for the progress bar size"}
checkUndefined("maxScaleCoefficient", []);
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
var Module = require("../../../../../../../../../../Modules/Src/Assets/Snap Stuff/SpectaclesSyncKit.lspkg/Mapping/src/UI/MappingFlow/ProgressBar/ProgressBarParametersInput");
Object.setPrototypeOf(script, Module.ProgressBarParametersInput.prototype);
script.__initialize();
if (script.onAwake) {
   script.onAwake();
}
