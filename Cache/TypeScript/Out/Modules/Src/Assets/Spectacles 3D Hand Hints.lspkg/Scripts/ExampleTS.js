"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Example = void 0;
var __selfType = requireType("./ExampleTS");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const InteractionHintController_1 = require("./InteractionHintController");
let Example = class Example extends BaseScriptComponent {
    onAwake() {
        switch (this.demoOption) {
            case 0:
                //play a single animation
                this.interactionHintController.playHintAnimation(InteractionHintController_1.HandMode.Both, InteractionHintController_1.HandAnimationsLibrary.Both.SystemTapExit, 2, 0.8);
                this.interactionHintController.animationEndEvent.bind(() => {
                    this.interactionHintController.playHintAnimation(InteractionHintController_1.HandMode.Left, InteractionHintController_1.HandAnimationsLibrary.Left.PinchMoveY, 3);
                });
                break;
            case 1:
                //play sequence
                var sequence = [];
                var itemA = new InteractionHintController_1.HandAnimationClipInfo(InteractionHintController_1.HandMode.Left, InteractionHintController_1.HandAnimationsLibrary.Left.PalmGrabY, new vec3(10, 0, 0));
                var itemB = new InteractionHintController_1.HandAnimationClipInfo(InteractionHintController_1.HandMode.Right, InteractionHintController_1.HandAnimationsLibrary.Right.PalmGrabX);
                sequence.push(itemA);
                sequence.push(itemB);
                this.interactionHintController.playHintAnimationSequence(sequence, 2);
                this.interactionHintController.animationEndEvent.bind(() => {
                    print("Sequence looping completed");
                });
                break;
        }
    }
};
exports.Example = Example;
exports.Example = Example = __decorate([
    component
], Example);
//# sourceMappingURL=ExampleTS.js.map