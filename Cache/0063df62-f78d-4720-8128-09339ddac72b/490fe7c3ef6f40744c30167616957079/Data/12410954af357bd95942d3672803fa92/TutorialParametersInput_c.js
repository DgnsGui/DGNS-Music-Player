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
// @input float startDistance = "150.0" {"hint":"The distance where the tutorial appears on start"}
checkUndefined("startDistance", []);
// @input float endDistance = "200.0" {"hint":"The distance where the tutorial appears at the end of the initial animation"}
checkUndefined("endDistance", []);
// @input float scaleUpTime = "0.3" {"hint":"The duration in seconds for the tutorial to gradually scale up"}
checkUndefined("scaleUpTime", []);
// @input float scaleDownTime = "0.3" {"hint":"The duration in seconds for the tutorial to gradually scale down"}
checkUndefined("scaleDownTime", []);
// @input float scaleCoefficientInitial = "0.7" {"hint":"Initial tutorial scale coefficient"}
checkUndefined("scaleCoefficientInitial", []);
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
var Module = require("../../../../../../../../../Modules/Src/Assets/SpectaclesSyncKit.lspkg/Mapping/src/UI/MappingFlow/Tutorial/TutorialParametersInput");
Object.setPrototypeOf(script, Module.TutorialParametersInput.prototype);
script.__initialize();
if (script.onAwake) {
   script.onAwake();
}
