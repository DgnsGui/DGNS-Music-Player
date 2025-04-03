"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tutorial = void 0;
const animate_1 = require("../../../../../SpectaclesInteractionKit/Utils/animate");
const TextValues_1 = require("../../../Texts/TextValues");
const HeadLockBehavior_1 = require("../../../Utils/HeadLockBehavior/HeadLockBehavior");
const SharedFunctions_1 = require("../../../Utils/SharedFunctions");
const TutorialTypeEnum_1 = require("./TutorialTypeEnum");
class Tutorial {
    constructor(input, animationParameters) {
        this.input = input;
        this.animationParameters = animationParameters;
        this.mappingClipName = "Mapping";
        this.teachingClipName = "Teaching";
        this.wasTutorialHide = true;
        this.headlockedRootTransform = input.root.getTransform();
        this.mainObjectTransform = input.mainObject.getTransform();
        this.startScale = this.mainObjectTransform.getLocalScale();
        this.tilePass = input.tile.mainMaterial.mainPass;
        this.headlockBehavior = new HeadLockBehavior_1.default(input.headLockBehaviorInput, this.headlockedRootTransform);
        this.tutorialGlassesTransform = this.input.tutorialGlasses.getTransform();
        this.glassesStartScale = this.tutorialGlassesTransform.getLocalScale();
        this.input.tutorialGlasses.enabled = false;
        input.root.enabled = false;
    }
    start(type) {
        this.duration = this.getDurationByAnimationType(type);
        if (type === TutorialTypeEnum_1.TutorialTypeEnum.TutorialP1) {
            this.input.connectedPlayerObject.enabled = false;
            this.input.tutorialAnimationPlayer.getClip(this.mappingClipName).weight = 1;
            this.input.tutorialAnimationPlayer.getClip(this.teachingClipName).weight = 0;
            this.input.tutorialAnimationPlayer.playClipAt(this.mappingClipName, this.input.tutorialAnimationPlayer.getClip(this.mappingClipName).begin);
        }
        else {
            this.input.connectedPlayerObject.enabled = true;
            this.input.tutorialAnimationPlayer.getClip(this.mappingClipName).weight = 0;
            this.input.tutorialAnimationPlayer.getClip(this.teachingClipName).weight = 1;
            this.input.tutorialAnimationPlayer.playClipAt(this.teachingClipName, this.input.tutorialAnimationPlayer.getClip(this.teachingClipName).begin);
            this.delayedGlassesScaleEvent = this.input.script.createEvent("DelayedCallbackEvent");
            this.delayedGlassesScaleEvent.bind(() => {
                this.showGlassesScaleUpAnimation();
                this.delayedGlassesScaleEvent.bind(() => {
                    this.showGlassesScaleDownAnimation();
                    this.delayedGlassesScaleEvent.bind(() => { });
                    this.delayedGlassesScaleEvent.reset(4.3);
                });
                this.delayedGlassesScaleEvent.reset(5.3);
            });
            this.delayedGlassesScaleEvent.reset(2.0);
        }
        (0, SharedFunctions_1.setObjectInTheWorldOnDistance)(this.input.root, this.animationParameters.endDistance, true);
        this.initTutorialUI(type);
        this.showTutorialScaleUpAnimation();
        this.input.root.enabled = true;
        this.headlockBehavior.start();
        this.delayedEvent = this.input.script.createEvent("DelayedCallbackEvent");
        this.delayedEvent.bind(() => {
            this.showTutorialScaleDownAnimation();
        });
        this.delayedEvent.reset(this.duration);
        this.wasTutorialHide = false;
    }
    stop() {
        var _a, _b, _c, _d, _e, _f;
        (_a = this.tutorialScaleCancelFunction) === null || _a === void 0 ? void 0 : _a.call(this);
        (_b = this.glassesScaleCancelFunction) === null || _b === void 0 ? void 0 : _b.call(this);
        (_c = this.headShowCancelFunction) === null || _c === void 0 ? void 0 : _c.call(this);
        (_d = this.rotationDelayEvent) === null || _d === void 0 ? void 0 : _d.cancel();
        this.headlockBehavior.stop();
        (_e = this.delayedEvent) === null || _e === void 0 ? void 0 : _e.cancel();
        (_f = this.delayedGlassesScaleEvent) === null || _f === void 0 ? void 0 : _f.cancel();
        this.input.root.enabled = false;
        if (!this.wasTutorialHide) {
            this.showTutorialScaleDownAnimation();
        }
        this.input.tutorialGlasses.enabled = false;
    }
    getDurationByAnimationType(type) {
        if (type === TutorialTypeEnum_1.TutorialTypeEnum.TutorialP1) {
            return (this.input.tutorialAnimationPlayer.getClip(this.mappingClipName)
                .duration /
                this.input.tutorialAnimationPlayer.getClip(this.mappingClipName)
                    .playbackSpeed);
        }
        return (this.input.tutorialAnimationPlayer.getClip(this.teachingClipName)
            .duration /
            this.input.tutorialAnimationPlayer.getClip(this.teachingClipName)
                .playbackSpeed);
    }
    showTutorialScaleUpAnimation() {
        this.mainObjectTransform.setLocalScale(this.startScale.uniformScale(this.animationParameters.scaleCoefficientInitial));
        this.tutorialScaleCancelFunction = this.animateScale(this.mainObjectTransform, this.mainObjectTransform.getLocalScale(), this.startScale, this.animationParameters.scaleUpTime, "ease-out-back");
    }
    showTutorialScaleDownAnimation() {
        this.tutorialScaleCancelFunction = this.animateScale(this.mainObjectTransform, this.mainObjectTransform.getLocalScale(), this.startScale.uniformScale(this.animationParameters.scaleCoefficientInitial), this.animationParameters.scaleDownTime, "ease-in-back", () => {
            this.wasTutorialHide = true;
            this.input.root.enabled = false;
        });
    }
    showGlassesScaleUpAnimation() {
        this.tutorialGlassesTransform.setLocalScale(this.glassesStartScale.uniformScale(this.animationParameters.scaleCoefficientInitial));
        this.input.tutorialGlasses.enabled = true;
        this.glassesScaleCancelFunction = this.animateScale(this.tutorialGlassesTransform, this.tutorialGlassesTransform.getLocalScale(), this.glassesStartScale, this.animationParameters.scaleUpTime, "ease-out-back");
    }
    showGlassesScaleDownAnimation() {
        this.glassesScaleCancelFunction = this.animateScale(this.tutorialGlassesTransform, this.tutorialGlassesTransform.getLocalScale(), this.glassesStartScale.uniformScale(this.animationParameters.scaleCoefficientInitial), this.animationParameters.scaleDownTime, "ease-in-back", () => {
            this.input.tutorialGlasses.enabled = false;
        });
    }
    initTutorialUI(type) {
        switch (type) {
            case TutorialTypeEnum_1.TutorialTypeEnum.TutorialP1:
                this.input.tutorialTitle.text = TextValues_1.TextValues.TUTORIAL_P1.title;
                this.input.tutorialText.text = TextValues_1.TextValues.TUTORIAL_P1.text;
                break;
            case TutorialTypeEnum_1.TutorialTypeEnum.TutorialP1TeachP2:
                this.input.tutorialTitle.text = TextValues_1.TextValues.TUTORIAL_P1_TEACHES_P2.title;
                this.input.tutorialText.text = TextValues_1.TextValues.TUTORIAL_P1_TEACHES_P2.text;
                break;
            case TutorialTypeEnum_1.TutorialTypeEnum.TutorialP2:
                this.input.tutorialTitle.text = TextValues_1.TextValues.TUTORIAL_P2.title;
                this.input.tutorialText.text = TextValues_1.TextValues.TUTORIAL_P2.text;
                break;
        }
    }
    animateScale(transform, from, to, duration, easing, onComplete = () => { }) {
        return (0, animate_1.default)({
            update: (t) => {
                const currentScale = vec3.lerp(from, to, t);
                transform.setLocalScale(currentScale);
            },
            start: 0,
            end: 1,
            duration: duration,
            easing: easing,
            ended: onComplete,
        });
    }
}
exports.Tutorial = Tutorial;
//# sourceMappingURL=Tutorial.js.map