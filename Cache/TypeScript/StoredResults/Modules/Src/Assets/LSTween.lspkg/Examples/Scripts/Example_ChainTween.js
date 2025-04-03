"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Example_ChainTween = void 0;
var __selfType = requireType("./Example_ChainTween");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const LSTween_1 = require("../../LSTween");
const RotationInterpolationType_1 = require("../../RotationInterpolationType");
let Example_ChainTween = class Example_ChainTween extends BaseScriptComponent {
    onAwake() {
        let transform = this.getTransform();
        let initScale = transform.getLocalScale();
        let rotateTween = LSTween_1.LSTween.rotateOffset(transform, quat.angleAxis(MathUtils.DegToRad * 45, vec3.up()), 1000, RotationInterpolationType_1.RotationInterpolationType.LERP).onEveryStart((o) => {
            transform.setLocalScale(initScale);
        });
        let scaleTween = LSTween_1.LSTween.scaleOffset(transform, vec3.one().uniformScale(2), 1000);
        rotateTween.chain(scaleTween);
        scaleTween.chain(rotateTween);
        rotateTween.start();
    }
};
exports.Example_ChainTween = Example_ChainTween;
exports.Example_ChainTween = Example_ChainTween = __decorate([
    component
], Example_ChainTween);
//# sourceMappingURL=Example_ChainTween.js.map