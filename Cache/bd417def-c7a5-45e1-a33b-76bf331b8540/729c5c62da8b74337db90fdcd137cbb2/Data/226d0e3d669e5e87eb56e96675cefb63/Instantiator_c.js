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
// @input Asset.ObjectPrefab[] prefabs = {}
checkUndefined("prefabs", []);
// @input boolean spawnerOwnsObject = "false"
checkUndefined("spawnerOwnsObject", []);
// @input boolean spawnAsChildren = "false"
checkUndefined("spawnAsChildren", []);
// @input SceneObject spawnUnderParent {"showIf":"spawnAsChildren"}
checkUndefined("spawnUnderParent", [["spawnAsChildren",true]]);
// @ui {"widget":"separator"}
// @input boolean autoInstantiate = "false"
checkUndefined("autoInstantiate", []);
// @input Asset.ObjectPrefab[] autoInstantiatePrefabs = {} {"label":"Prefabs", "showIf":"autoInstantiate"}
checkUndefined("autoInstantiatePrefabs", [["autoInstantiate",true]]);
// @input string persistenceString = "Session" {"label":"Persistence", "widget":"combobox", "values":[{"label":"Ephemeral", "value":"Ephemeral"}, {"label":"Owner", "value":"Owner"}, {"label":"Session", "value":"Session"}, {"label":"Persist", "value":"Persist"}], "showIf":"autoInstantiate"}
checkUndefined("persistenceString", [["autoInstantiate",true]]);
// @input string autoInstantiateOwnershipString = "Unowned" {"label":"Auto Instantiate Ownership", "widget":"combobox", "values":[{"label":"Owned", "value":"Owned"}, {"label":"Unowned", "value":"Unowned"}], "showIf":"autoInstantiate"}
checkUndefined("autoInstantiateOwnershipString", [["autoInstantiate",true]]);
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
var Module = require("../../../../../../Modules/Src/Assets/Snap Stuff/SpectaclesSyncKit.lspkg/Components/Instantiator");
Object.setPrototypeOf(script, Module.Instantiator.prototype);
script.__initialize();
if (script.onAwake) {
   script.onAwake();
}
