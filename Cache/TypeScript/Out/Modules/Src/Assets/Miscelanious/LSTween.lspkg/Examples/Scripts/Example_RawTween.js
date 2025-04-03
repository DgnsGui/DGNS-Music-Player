"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Example_RawTween = void 0;
var __selfType = requireType("./Example_RawTween");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const Easing_1 = require("../../TweenJS/Easing");
const LSTween_1 = require("../../LSTween");
let Example_RawTween = class Example_RawTween extends BaseScriptComponent {
    onAwake() {
        LSTween_1.LSTween.rawTween(1000)
            .easing(Easing_1.default.Cubic.In)
            .onStart((o) => {
            print("Start Value: " + o.t);
        })
            .onUpdate((o) => {
            print("Update Value: " + o.t);
        })
            .onComplete((o) => {
            print("Complete Value: " + o.t);
        })
            .start();
    }
};
exports.Example_RawTween = Example_RawTween;
exports.Example_RawTween = Example_RawTween = __decorate([
    component
], Example_RawTween);
//# sourceMappingURL=Example_RawTween.js.map