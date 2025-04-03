"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAlphaForRmvs = exports.setAlphaForTexts = exports.setAlphaForRmv = exports.setAlphaForText = exports.cancelAnimation = exports.animateToAlpha = exports.animateToHidden = exports.animateToVisible = exports.setHidden = exports.setVisibile = void 0;
const animate_1 = require("../SpectaclesInteractionKit/Utils/animate");
// The alpha value when it's fully showing.
const ALPHA_FULLY_VISIBLE = 1;
// The alpha value when it's fully hidden.
const ALPHA_FULLY_HIDDEN = 0;
// How long to fade for, in seconds
const ANIMATE_DURATION_SECONDS = 0.3;
function setVisibile(fadeable) {
    fadeable.setFadeEnabled(true);
    fadeable.setAlpha(ALPHA_FULLY_VISIBLE);
}
exports.setVisibile = setVisibile;
function setHidden(fadeable) {
    fadeable.setAlpha(ALPHA_FULLY_HIDDEN);
    fadeable.setFadeEnabled(false);
}
exports.setHidden = setHidden;
function animateToVisible(fadeable) {
    animateToAlpha(fadeable, ALPHA_FULLY_VISIBLE);
}
exports.animateToVisible = animateToVisible;
function animateToHidden(fadeable) {
    animateToAlpha(fadeable, ALPHA_FULLY_HIDDEN);
}
exports.animateToHidden = animateToHidden;
function animateToAlpha(fadeable, targetAlpha, animationDuration) {
    let animationDurationDefined = animationDuration || ANIMATE_DURATION_SECONDS;
    cancelAnimation(fadeable);
    if (fadeable.currentAlpha !== targetAlpha) {
        fadeable.animationCancelFunction = (0, animate_1.default)({
            update: ((alpha) => {
                fadeable.setFadeEnabled(true);
                fadeable.setAlpha(alpha);
            }).bind(fadeable),
            start: fadeable.currentAlpha,
            end: targetAlpha,
            ended: () => {
                fadeable.setFadeEnabled(targetAlpha !== 0);
            },
            duration: animationDurationDefined,
        });
    }
}
exports.animateToAlpha = animateToAlpha;
function cancelAnimation(fadeable) {
    if (fadeable.animationCancelFunction !== null &&
        fadeable.animationCancelFunction !== undefined) {
        fadeable.animationCancelFunction();
        fadeable.animationCancelFunction = null;
    }
}
exports.cancelAnimation = cancelAnimation;
function setAlphaForText(text, alpha) {
    text.textFill.color = new vec4(text.textFill.color.x, text.textFill.color.y, text.textFill.color.z, alpha);
}
exports.setAlphaForText = setAlphaForText;
function setAlphaForRmv(rmv, alpha) {
    rmv.mainMaterial.mainPass.alpha = alpha;
}
exports.setAlphaForRmv = setAlphaForRmv;
function setAlphaForTexts(texts, alpha) {
    texts.forEach((text) => setAlphaForText(text, alpha));
}
exports.setAlphaForTexts = setAlphaForTexts;
function setAlphaForRmvs(rmvs, alpha) {
    rmvs.forEach((rmv) => setAlphaForRmv(rmv, alpha));
}
exports.setAlphaForRmvs = setAlphaForRmvs;
//# sourceMappingURL=Fadeable.js.map