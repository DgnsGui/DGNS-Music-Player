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
// @input Asset.ConnectedLensModule connectedLensModule
checkUndefined("connectedLensModule", []);
// @input Asset.LocationCloudStorageModule locationCloudStorageModule
checkUndefined("locationCloudStorageModule", []);
// @input boolean skipUiInStudio = "false" {"label":"Skip UI in Lens Studio"}
checkUndefined("skipUiInStudio", []);
// @input boolean isColocated = "true"
checkUndefined("isColocated", []);
// @ui {"widget":"group_start", "label":"Colocation", "showIf":"isColocated"}
// @input Component.LocatedAtComponent locatedAtComponent
checkUndefined("locatedAtComponent", [["isColocated",true]]);
// @input Component.RenderMeshVisual landmarksVisual3d
checkUndefined("landmarksVisual3d", [["isColocated",true]]);
// @ui {"widget":"group_end"}
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
var Module = require("../../../../../Modules/Src/Assets/SpectaclesSyncKit.lspkg/Core/SessionControllerComponent");
Object.setPrototypeOf(script, Module.SessionControllerComponent.prototype);
script.__initialize();
if (script.onAwake) {
   script.onAwake();
}
