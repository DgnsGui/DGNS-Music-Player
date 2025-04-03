"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MappingSuccessfulState = void 0;
const SessionController_1 = require("../../../../Core/SessionController");
const animate_1 = require("../../../../SpectaclesInteractionKit/Utils/animate");
const mathUtils_1 = require("../../../../SpectaclesInteractionKit/Utils/mathUtils");
const TextValues_1 = require("../../Texts/TextValues");
const SharedFunctions_1 = require("../../Utils/SharedFunctions");
const BufferState_1 = require("../BufferState/BufferState");
class MappingSuccessfulState {
    constructor(input, stateMachine, projectContainer) {
        this.input = input;
        this.stateMachine = stateMachine;
        this.projectContainer = projectContainer;
        this.fadeInTextDuration = 0.3;
        this.fadeOutTextDuration = 1;
        this.showingObjectDuration = 3;
        input.mappingSuccessfullyDoneText.text = TextValues_1.TextValues.MAPPING_DONE_P1;
        this.audioComponent = input.script
            .getSceneObject()
            .createComponent("Component.AudioComponent");
        this.tickPass = this.input.tickMeshVisual.mainMaterial.mainPass;
        this.setAlpha(0);
        this.input.root.enabled = false;
        this.tickAnimation = this.input.tickAnimation.getComponent("AnimationMixer");
    }
    enter() {
        this.input.root.enabled = true;
        this.tickAnimation.enabled = false;
        this.input.mappingSuccessfullyDoneText.text =
            SessionController_1.SessionController.getInstance().getIsUserMapper()
                ? TextValues_1.TextValues.MAPPING_DONE_P1
                : TextValues_1.TextValues.MAPPING_DONE_P2;
        this.setAlpha(0);
        this.alphaTweenCancelFunction = this.animateToAlpha(0, 1, this.fadeInTextDuration, () => {
            this.delayEvent = this.input.script.createEvent("DelayedCallbackEvent");
            this.delayEvent.bind(() => {
                this.alphaTweenCancelFunction = this.animateToAlpha(1, 0, this.fadeOutTextDuration, () => this.stateMachine.enterState(BufferState_1.BufferState.name));
            });
            this.delayEvent.reset(this.showingObjectDuration);
        });
        this.tickAnimation.enabled = true;
        this.tickAnimation.start("Scene", 0, 1);
        this.audioComponent.audioTrack = this.input.successAudioTrack;
        this.audioComponent.play(1);
        this.projectContainer.mappingDone();
    }
    exit() {
        var _a, _b;
        (_a = this.alphaTweenCancelFunction) === null || _a === void 0 ? void 0 : _a.call(this);
        (_b = this.delayEvent) === null || _b === void 0 ? void 0 : _b.cancel();
        this.setAlpha(0);
        this.input.root.enabled = false;
    }
    animateToAlpha(from, to, duration, onComplete = () => { }) {
        return (0, animate_1.default)({
            update: (t) => {
                const currentAlpha = (0, mathUtils_1.lerp)(from, to, t);
                this.setAlpha(currentAlpha);
            },
            start: 0,
            end: 1,
            duration: duration,
            ended: onComplete,
        });
    }
    setAlpha(value) {
        (0, SharedFunctions_1.setAlpha)(this.input.root, value);
        this.tickPass.alpha = value;
    }
}
exports.MappingSuccessfulState = MappingSuccessfulState;
//# sourceMappingURL=MappingSuccessfulState.js.map