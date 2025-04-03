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
// @ui {"widget":"group_start", "label":"Billboard"}
// @input bool _xAxisEnabled
checkUndefined("_xAxisEnabled", []);
// @input bool _yAxisEnabled = true
checkUndefined("_yAxisEnabled", []);
// @input bool _zAxisEnabled
checkUndefined("_zAxisEnabled", []);
// @input vec3 _axisBufferDegrees = {0,0,0} {"hint":"How big the angle must be to start rotating about that axis"}
checkUndefined("_axisBufferDegrees", []);
// @input vec3 _axisEasing = {1,1,1} {"hint":"How fast the target should rotate to follow camera, instant follow = 1, delay follow = 0.1"}
checkUndefined("_axisEasing", []);
// @input float duration = 0.033 {"hint":"Decrecated. Please use the property Axis Easing to adjust the rotation speed"}
checkUndefined("duration", []);
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
var Module = require("../../../../../../../Modules/Src/Assets/SpectaclesInteractionKit/Components/Interaction/Billboard/Billboard");
Object.setPrototypeOf(script, Module.Billboard.prototype);
script.__initialize();
if (script.onAwake) {
   script.onAwake();
}
