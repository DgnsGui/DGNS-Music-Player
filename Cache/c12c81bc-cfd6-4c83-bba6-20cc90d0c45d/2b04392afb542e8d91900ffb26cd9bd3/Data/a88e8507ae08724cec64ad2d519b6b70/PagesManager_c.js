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
// @input Component.ScriptComponent nextButton
checkUndefined("nextButton", []);
// @input Component.ScriptComponent prevButton
checkUndefined("prevButton", []);
// @input Component.Text pageNumberText
checkUndefined("pageNumberText", []);
// @input SceneObject page0
checkUndefined("page0", []);
// @input SceneObject page1
checkUndefined("page1", []);
// @input SceneObject page2
checkUndefined("page2", []);
// @input SceneObject page3
checkUndefined("page3", []);
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
var Module = require("../../../../Modules/Src/Assets/CustomScripts/PagesManager");
Object.setPrototypeOf(script, Module.PageManager.prototype);
script.__initialize();
if (script.onAwake) {
   script.onAwake();
}
