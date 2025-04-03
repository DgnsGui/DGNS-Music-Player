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
// @ui {"widget":"group_start", "label":"Entity Target"}
// @input string targetTypeString = "SyncEntity" {"label":"Target Type", "widget":"combobox", "values":[{"label":"Sync Entity", "value":"SyncEntity"}, {"label":"Network Root", "value":"NetworkRoot"}]}
checkUndefined("targetTypeString", []);
// @input Component.ScriptComponent syncEntityScript {"showIf":"targetTypeString", "showIfValue":"SyncEntity"}
checkUndefined("syncEntityScript", [["targetTypeString","SyncEntity"]]);
// @ui {"widget":"group_end"}
// @input SceneObject[] readyObjects
checkUndefined("readyObjects", []);
// @input SceneObject[] notReadyObjects
checkUndefined("notReadyObjects", []);
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
var Module = require("../../../../../../../Modules/Src/Assets/Snap Stuff/SpectaclesSyncKit.lspkg/Components/SyncHelpers/SetEnabledOnReady");
Object.setPrototypeOf(script, Module.SetEnabledOnReady.prototype);
script.__initialize();
if (script.onAwake) {
   script.onAwake();
}
