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
// @input string networkIdTypeString = "objectId" {"label":"Network Id Type", "widget":"combobox", "values":[{"label":"Object Id", "value":"objectId"}, {"label":"Custom", "value":"custom"}]}
checkUndefined("networkIdTypeString", []);
// @input string customNetworkId = "enter_unique_id" {"showIf":"networkIdTypeString", "showIfValue":"custom"}
checkUndefined("customNetworkId", [["networkIdTypeString","custom"]]);
// @ui {"widget":"separator"}
// @ui {"widget":"label", "label":"Sync Settings"}
// @input boolean autoClone = "true"
checkUndefined("autoClone", []);
// @input Asset.Material mainMaterial
checkUndefined("mainMaterial", []);
// @input string[] propertyNames
checkUndefined("propertyNames", []);
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
var Module = require("../../../../../Modules/Src/Assets/SpectaclesSyncKit.lspkg/Components/SyncMaterials");
Object.setPrototypeOf(script, Module.SyncMaterials.prototype);
script.__initialize();
if (script.onAwake) {
   script.onAwake();
}
