"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressBar = void 0;
const SessionController_1 = require("../../../../../Core/SessionController");
const animate_1 = require("../../../../../SpectaclesInteractionKit/Utils/animate");
const mathUtils_1 = require("../../../../../SpectaclesInteractionKit/Utils/mathUtils");
const SharedFunctions_1 = require("../../../Utils/SharedFunctions");
class ProgressBar {
    constructor(input, animationParameters) {
        this.input = input;
        this.animationParameters = animationParameters;
        this.isFirstTimeMapping = true;
        this.currentProgress = 0;
        this.onUpdate = () => {
            this.currentProgress = (0, mathUtils_1.lerp)(this.currentProgress, this.mappingSession.quality, 10 * getDeltaTime());
            this.input.progressBar.setBlendShapeWeight("YellowBar.001", this.currentProgress);
        };
        this.rootTransform = input.root.getTransform();
        this.initialScale = this.rootTransform.getLocalScale();
        this.progressBarPass = input.progressBar.mainMaterial.mainPass;
        this.setProgressBarAlpha(0);
        this.updateEvent = input.script.createEvent("UpdateEvent");
        this.updateEvent.bind(this.onUpdate);
        this.updateEvent.enabled = false;
        this.input.root.enabled = false;
    }
    start() {
        this.mappingSession = SessionController_1.SessionController.getInstance().getMappingSession();
        this.showProgressBarInitAnimation();
        this.updateEvent.enabled = true;
        this.isFirstTimeMapping = false;
    }
    stop() {
        var _a, _b;
        this.updateEvent.enabled = false;
        (_a = this.delayEvent) === null || _a === void 0 ? void 0 : _a.cancel();
        (_b = this.progressAppearanceCancelFunction) === null || _b === void 0 ? void 0 : _b.call(this);
        this.progressAppearanceCancelFunction = this.animateProgressToAlpha(1, 0, this.animationParameters.fadeOutTime, () => (this.input.root.enabled = false));
        SessionController_1.SessionController.getInstance().getLandmarksVisual3d().enabled = false;
    }
    showProgressBarInitAnimation() {
        this.delayEvent = this.input.script.createEvent("DelayedCallbackEvent");
        this.delayEvent.bind(() => {
            this.input.root.enabled = true;
            this.showProgressBarScaleAnimation();
            this.showProgressBarAlphaAnimation();
            SessionController_1.SessionController.getInstance().getLandmarksVisual3d().enabled = true;
        });
        this.delayEvent.reset(this.isFirstTimeMapping ? this.animationParameters.delayBeforeShowing : 1);
    }
    showProgressBarAlphaAnimation() {
        this.progressAppearanceCancelFunction = this.animateProgressToAlpha(0, 1, this.animationParameters.fadeInTime);
    }
    showProgressBarScaleAnimation() {
        this.rootTransform.setLocalScale(this.initialScale.uniformScale(this.animationParameters.minScaleCoefficient));
        let currentScale = this.rootTransform.getLocalScale();
        let targetScale = this.initialScale.uniformScale(this.animationParameters.maxScaleCoefficient);
        this.scaleAnimation = (0, animate_1.default)({
            update: (t) => {
                const scale = vec3.lerp(currentScale, targetScale, t);
                this.rootTransform.setLocalScale(scale);
            },
            start: 0,
            end: 1,
            duration: this.animationParameters.scalingInTime,
            ended: () => {
                currentScale = this.rootTransform.getLocalScale();
                targetScale = this.initialScale;
                this.scaleAnimation = (0, animate_1.default)({
                    update: (t) => {
                        const scale = vec3.lerp(currentScale, targetScale, t);
                        this.rootTransform.setLocalScale(scale);
                    },
                    start: 0,
                    end: 1,
                    duration: this.animationParameters.scalingInTime,
                    easing: "ease-out-back",
                });
            },
        });
    }
    animateProgressToAlpha(from, to, duration, onComplete = () => { }) {
        return (0, animate_1.default)({
            update: (t) => {
                const currentAlpha = (0, mathUtils_1.lerp)(from, to, t);
                this.setProgressBarAlpha(currentAlpha);
            },
            start: 0,
            end: 1,
            duration: duration,
            ended: onComplete,
        });
    }
    setProgressBarAlpha(value) {
        (0, SharedFunctions_1.setAlpha)(this.input.root, value);
        this.progressBarPass.alpha = value;
    }
}
exports.ProgressBar = ProgressBar;
//# sourceMappingURL=ProgressBar.js.map