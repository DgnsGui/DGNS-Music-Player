"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Example_YoyoTween = void 0;
var __selfType = requireType("./Example_YoyoTween");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const Easing_1 = require("../../TweenJS/Easing");
const LSTween_1 = require("../../LSTween");
let Example_YoyoTween = class Example_YoyoTween extends BaseScriptComponent {
    onAwake() {
        let transform = this.getTransform();
        let startPosition = transform.getLocalPosition();
        let destinationPosition = startPosition.add(new vec3(50, 0, 0));
        LSTween_1.LSTween.moveFromToLocal(this.getTransform(), startPosition, destinationPosition, 1500)
            .easing(Easing_1.default.Cubic.InOut)
            .delay(100) // There is a bug in TweenJS where the yoyo value will jump if no delay is set.
            .yoyo(true)
            .repeat(Infinity)
            .start();
    }
};
exports.Example_YoyoTween = Example_YoyoTween;
exports.Example_YoyoTween = Example_YoyoTween = __decorate([
    component
], Example_YoyoTween);
//# sourceMappingURL=Example_YoyoTween.js.map