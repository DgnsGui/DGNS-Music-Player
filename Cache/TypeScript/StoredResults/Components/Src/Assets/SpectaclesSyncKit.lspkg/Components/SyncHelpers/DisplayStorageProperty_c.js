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
// @input Component.ScriptComponent syncEntityScript
checkUndefined("syncEntityScript", []);
// @ui {"widget":"group_end"}
// @input string propertyKey
checkUndefined("propertyKey", []);
// @input Component.Text text
checkUndefined("text", []);
// @input boolean useFormat = "false"
checkUndefined("useFormat", []);
// @ui {"widget":"label", "label":"String will be formatted using:<br>{value} - current value (or blank)<br>{prevValue} - previous value (or blank)", "showIf":"useFormat"}
// @input string formatString
checkUndefined("formatString", []);
// @ui {"widget":"label", "label":"Text to display if value is undefined"}
// @input string altText
checkUndefined("altText", []);
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
var Module = require("../../../../../../Modules/Src/Assets/SpectaclesSyncKit.lspkg/Components/SyncHelpers/DisplayStorageProperty");
Object.setPrototypeOf(script, Module.DisplayStorageProperty.prototype);
script.__initialize();
if (script.onAwake) {
   script.onAwake();
}
