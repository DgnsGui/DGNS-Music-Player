"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextMappingHint = void 0;
const animate_1 = require("../../../../../SpectaclesInteractionKit/Utils/animate");
const mathUtils_1 = require("../../../../../SpectaclesInteractionKit/Utils/mathUtils");
const SharedFunctions_1 = require("../../../Utils/SharedFunctions");
class TextMappingHint {
    constructor(input, animationParameters) {
        this.input = input;
        this.animationParameters = animationParameters;
        this.currentTextAlpha = 0;
        this.isFirstTimeMapping = true;
        (0, SharedFunctions_1.setAlpha)(input.root, 0);
        input.root.enabled = false;
    }
    start(hintSet, delayBeforeStart) {
        this.input.root.enabled = true;
        this.hintSet = hintSet;
        this.delayEvent = this.input.script.createEvent("DelayedCallbackEvent");
        this.delayEvent.bind(() => {
            this.showText(0);
        });
        this.delayEvent.reset(this.isFirstTimeMapping ? delayBeforeStart : 1);
        this.isFirstTimeMapping = false;
    }
    stop() {
        var _a, _b;
        this.input.root.enabled = false;
        (_a = this.textAnimation) === null || _a === void 0 ? void 0 : _a.call(this);
        (_b = this.delayEvent) === null || _b === void 0 ? void 0 : _b.cancel();
        this.hideTextOnStop();
    }
    showText(id) {
        this.delayEvent = this.input.script.createEvent("DelayedCallbackEvent");
        this.delayEvent.bind(() => {
            this.input.hintTitle.text = this.hintSet[id].title;
            this.input.hintText.text = this.hintSet[id].text;
            this.textAnimation = this.animateToAlpha(this.input.root, 0, 1, this.animationParameters.fadeInTime, () => this.hideText(id));
        });
        this.delayEvent.reset(this.animationParameters.delayTime);
    }
    hideText(id) {
        this.delayEvent = this.input.script.createEvent("DelayedCallbackEvent");
        this.delayEvent.bind(() => {
            this.textAnimation = this.animateToAlpha(this.input.root, 1, 0, this.animationParameters.fadeOutTime, () => this.showText((id + 1) % this.hintSet.length));
        });
        this.delayEvent.reset(this.animationParameters.displayTime);
    }
    hideTextOnStop() {
        if (this.currentTextAlpha === 0) {
            (0, SharedFunctions_1.setAlpha)(this.input.root, 0);
            return;
        }
        this.textAnimation = this.animateToAlpha(this.input.root, this.currentTextAlpha, 0, this.animationParameters.earlyFadeOutTime);
    }
    animateToAlpha(target, from, to, duration, onComplete = () => { }) {
        return (0, animate_1.default)({
            update: (t) => {
                const currentAlpha = (0, mathUtils_1.lerp)(from, to, t);
                this.currentTextAlpha = currentAlpha;
                (0, SharedFunctions_1.setAlpha)(target, currentAlpha);
            },
            start: 0,
            end: 1,
            duration: duration,
            ended: onComplete,
        });
    }
}
exports.TextMappingHint = TextMappingHint;
//# sourceMappingURL=TextMappingHint.js.map