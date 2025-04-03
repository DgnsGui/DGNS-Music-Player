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
// @input Slider slider
checkUndefined("slider", []);
// @input SceneObject animationAButton
checkUndefined("animationAButton", []);
// @input SceneObject animationBButton
checkUndefined("animationBButton", []);
// @input SceneObject animationCButton
checkUndefined("animationCButton", []);
// @input SceneObject launchButton
checkUndefined("launchButton", []);
// @input RocketConfigurator rocketConf
checkUndefined("rocketConf", []);
// @input SceneObject launchSparks
checkUndefined("launchSparks", []);
// @input Component.AnimationPlayer rocketAnimationPlayer
checkUndefined("rocketAnimationPlayer", []);
// @input Component.Text flightPathText
checkUndefined("flightPathText", []);
// @input ToggleButton launchPlatformToggleButton
checkUndefined("launchPlatformToggleButton", []);
// @input SceneObject launchPlatform
checkUndefined("launchPlatform", []);
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
var Module = require("../../../../../../../../Modules/Src/Assets/Snap Stuff/SpectaclesInteractionKit.lspkg/Examples/RocketWorkshop/Scripts/RocketLaunchControl");
Object.setPrototypeOf(script, Module.RocketLaunchControl.prototype);
script.__initialize();
if (script.onAwake) {
   script.onAwake();
}
