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
// @input HeadLockBehaviorInput headLockBehaviorInput
checkUndefined("headLockBehaviorInput", []);
// @input Component.AnimationPlayer tutorialAnimationPlayer
checkUndefined("tutorialAnimationPlayer", []);
// @input SceneObject root
checkUndefined("root", []);
// @input SceneObject mainObject
checkUndefined("mainObject", []);
// @input SceneObject connectedPlayerObject
checkUndefined("connectedPlayerObject", []);
// @input SceneObject tutorialGlasses
checkUndefined("tutorialGlasses", []);
// @input Component.RenderMeshVisual tile
checkUndefined("tile", []);
// @input Component.Text tutorialTitle
checkUndefined("tutorialTitle", []);
// @input Component.Text tutorialText
checkUndefined("tutorialText", []);
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
var Module = require("../../../../../../../../../Modules/Src/Assets/SpectaclesSyncKit.lspkg/Mapping/src/UI/MappingFlow/Tutorial/TutorialInput");
Object.setPrototypeOf(script, Module.TutorialInput.prototype);
script.__initialize();
if (script.onAwake) {
   script.onAwake();
}
