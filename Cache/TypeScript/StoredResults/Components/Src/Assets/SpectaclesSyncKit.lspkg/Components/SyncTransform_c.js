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
// @input string positionSyncString = "Location" {"label":"Position Sync", "widget":"combobox", "values":[{"label":"None", "value":"None"}, {"label":"Location", "value":"Location"}, {"label":"Local", "value":"Local"}, {"label":"World", "value":"World"}]}
checkUndefined("positionSyncString", []);
// @input string rotationSyncString = "Location" {"label":"Rotation Sync", "widget":"combobox", "values":[{"label":"None", "value":"None"}, {"label":"Location", "value":"Location"}, {"label":"Local", "value":"Local"}, {"label":"World", "value":"World"}]}
checkUndefined("rotationSyncString", []);
// @input string scaleSyncString = "Location" {"label":"Scale Sync", "widget":"combobox", "values":[{"label":"None", "value":"None"}, {"label":"Location", "value":"Location"}, {"label":"Local", "value":"Local"}, {"label":"World", "value":"World"}]}
checkUndefined("scaleSyncString", []);
// @ui {"widget":"separator"}
// @input string persistenceString = "Session" {"label":"Persistence", "widget":"combobox", "values":[{"label":"Ephemeral", "value":"Ephemeral"}, {"label":"Owner", "value":"Owner"}, {"label":"Session", "value":"Session"}, {"label":"Persist", "value":"Persist"}]}
checkUndefined("persistenceString", []);
// @input int sendsPerSecondLimit = "10"
checkUndefined("sendsPerSecondLimit", []);
// @input boolean useSmoothing = "false"
checkUndefined("useSmoothing", []);
// @input float interpolationTarget = "-0.25" {"showIf":"useSmoothing", "showIfValue":true}
checkUndefined("interpolationTarget", [["useSmoothing",true]]);
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
var Module = require("../../../../../Modules/Src/Assets/SpectaclesSyncKit.lspkg/Components/SyncTransform");
Object.setPrototypeOf(script, Module.SyncTransform.prototype);
script.__initialize();
if (script.onAwake) {
   script.onAwake();
}
