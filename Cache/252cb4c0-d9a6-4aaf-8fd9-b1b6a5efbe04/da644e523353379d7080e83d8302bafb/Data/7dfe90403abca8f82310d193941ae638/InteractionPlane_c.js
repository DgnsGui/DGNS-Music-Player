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
// @input vec2 _planeSize = {10,10}
checkUndefined("_planeSize", []);
// @input float _proximityDistance
checkUndefined("_proximityDistance", []);
// @input bool _drawDebug
checkUndefined("_drawDebug", []);
// @input float _behindDistance
checkUndefined("_behindDistance", []);
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
var Module = require("../../../../../../../Modules/Src/Assets/SpectaclesInteractionKit/Components/Interaction/InteractionPlane/InteractionPlane");
Object.setPrototypeOf(script, Module.InteractionPlane.prototype);
script.__initialize();
if (script.onAwake) {
   script.onAwake();
}
