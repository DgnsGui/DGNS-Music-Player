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
// @input PinchButton pinchButton
checkUndefined("pinchButton", []);
// @input SceneObject object1
checkUndefined("object1", []);
// @input SceneObject object2
checkUndefined("object2", []);
// @input SceneObject object3
checkUndefined("object3", []);
// @input SceneObject object4
checkUndefined("object4", []);
// @input SceneObject object5
checkUndefined("object5", []);
// @input Component.Text bpmText
checkUndefined("bpmText", []);
// @input SceneObject camera
checkUndefined("camera", []);
// @input float gridWidth = 20 {"hint":"Number of grid points along width (X-axis)"}
checkUndefined("gridWidth", []);
// @input float gridDepth = 20 {"hint":"Number of grid points along depth (Z-axis)"}
checkUndefined("gridDepth", []);
// @input float gridSpacing = 1.5 {"hint":"Distance between grid points (meters)"}
checkUndefined("gridSpacing", []);
// @input float distanceFromCamera = 5 {"hint":"Distance from camera to grid start (meters)"}
checkUndefined("distanceFromCamera", []);
// @input float gridHeight {"hint":"Height of grid above ground (meters, assuming y=0 is ground)"}
checkUndefined("gridHeight", []);
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
var Module = require("../../../Modules/Src/Assets/ScatterObjects");
Object.setPrototypeOf(script, Module.ObjectSpawner.prototype);
script.__initialize();
if (script.onAwake) {
   script.onAwake();
}
