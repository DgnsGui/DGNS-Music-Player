if (script.onAwake) {
	script.onAwake();
	return;
};
/*
@typedef HintAnimation
@property {int} handType {"widget":"combobox", "values":[{"label":"Left", "value":0}, {"label":"Right", "value":1}, {"label":"Both", "value":2}]}
@property {string} oneHandedAnimation_l = pinch_near {"widget":"combobox", "values":[{"label":"Pinch Near", "value":"pinch_near"}, {"label":"Pinch Far", "value":"pinch_far"}, {"label":"Pinch Move X", "value":"pinch_move_x"}, {"label":"Pinch Move Y", "value":"pinch_move_y"}, {"label":"Pinch Move Z", "value":"pinch_move_z"}, {"label":"Pinch Rotate X", "value":"pinch_rotate_x"}, {"label":"Pinch Rotate Y", "value":"pinch_rotate_y"}, {"label":"Pinch Rotate Z", "value":"pinch_rotate_z"}, {"label":"Pinch Swipe X", "value":"pinch_swipe_x"}, {"label":"Pinch Swipe Y", "value":"pinch_swipe_y"}, {"label":"Finger Tap Near", "value":"finger_tap_near"}, {"label":"Finger Tap Surface", "value":"finger_tap_surface"}, {"label":"Finger Swipe X", "value":"finger_swipe_x"}, {"label":"Finger Swipe Y", "value":"finger_swipe_y"}, {"label":"Finger Scroll Mirco", "value":"finger_scroll_micro"}, {"label":"Palm Touch Near", "value":"palm_touch_near"}, {"label":"Palm Touch Surface", "value":"palm_touch_surface"}, {"label":"Palm Swipe X", "value":"palm_swipe_x"}, {"label":"Palm Grab X", "value":"palm_grab_x"}, {"label":"Palm Grab Y", "value":"palm_grab_y"}], "showIf":"handType", "showIfValue":0}
@property {string} oneHandedAnimation_r = pinch_near {"widget":"combobox", "values":[{"label":"Pinch Near", "value":"pinch_near"}, {"label":"Pinch Far", "value":"pinch_far"}, {"label":"Pinch Move X", "value":"pinch_move_x"}, {"label":"Pinch Move Y", "value":"pinch_move_y"}, {"label":"Pinch Move Z", "value":"pinch_move_z"}, {"label":"Pinch Rotate X", "value":"pinch_rotate_x"}, {"label":"Pinch Rotate y", "value":"pinch_rotate_y"}, {"label":"Pinch Rotate Z", "value":"pinch_rotate_z"}, {"label":"Pinch Swipe X", "value":"pinch_swipe_x"}, {"label":"Pinch Swipe Y", "value":"pinch_swipe_y"}, {"label":"Finger Tap Near", "value":"finger_tap_near"}, {"label":"Finger Tap Surface", "value":"finger_tap_surface"}, {"label":"Finger Swipe X", "value":"finger_swipe_x"}, {"label":"Finger Swipe Y", "value":"finger_swipe_y"}, {"label":"Finger Scroll Mirco", "value":"finger_scroll_micro"}, {"label":"Palm Touch Near", "value":"palm_touch_near"}, {"label":"Palm Touch Surface", "value":"palm_touch_surface"}, {"label":"Palm Swipe X", "value":"palm_swipe_x"}, {"label":"Palm Grab X", "value":"palm_grab_x"}, {"label":"Palm Grab Y", "value":"palm_grab_y"}], "showIf":"handType", "showIfValue":1}
@property {string} twoHandedAnimation = two_hands_pinch_scale {"widget":"combobox", "values":[{"label":"System Tap Settings", "value":"system_tap_settings"}, {"label":"System Tap Rotate Down", "value":"system_tap_rotate_down"}, {"label":"System Tap Rotate Up", "value":"system_tap_rotate_up"}, {"label":"System Tap Watch", "value":"system_tap_watch"}, {"label":"System Tap Exit", "value":"system_tap_exit"}, {"label":"Two Hands Pinch Scale", "value":"two_hands_pinch_scale"}, {"label":"Two Hands Pinch Rotate Y", "value":"two_hands_pinch_rotate_y"}, {"label":"Two Hands Pinch Rotate Z", "value":"two_hands_pinch_rotate_z"}, {"label":"Two Hands Palm Grab X", "value":"two_hands_palm_grab_x"}, {"label":"Two Hands Palm Grab Y", "value":"two_hands_palm_grab_y"}], "showIf":"handType", "showIfValue":2}
@property {vec3} position 
*/
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
// @input bool autoPlay
checkUndefined("autoPlay", []);
// @input float animationSpeed = 1 {"widget":"slider", "min":0.5, "max":3, "step":0.1}
checkUndefined("animationSpeed", []);
// @ui {"widget":"separator"}
// @input int numberOfLoops = 1 {"widget":"slider", "min":1, "max":10, "step":1, "showIf":"loop", "showIfValue":true}
checkUndefined("numberOfLoops", [["loop",true]]);
// @ui {"widget":"separator"}
// @input HintAnimation[] hintAnimations {"showIf":"sequence", "showIfValue":true}
checkUndefined("hintAnimations", [["sequence",true]]);
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
var Module = require("../../../../../Modules/Src/Assets/Spectacles 3D Hand Hints.lspkg/Scripts/InteractionHintController");
Object.setPrototypeOf(script, Module.InteractionHintController.prototype);
script.__initialize();
if (script.onAwake) {
   script.onAwake();
}
