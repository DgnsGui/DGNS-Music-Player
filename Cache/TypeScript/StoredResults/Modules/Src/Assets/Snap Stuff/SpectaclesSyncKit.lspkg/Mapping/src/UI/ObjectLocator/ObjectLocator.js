"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectLocator = void 0;
const WorldCameraFinderProvider_1 = require("../../../../SpectaclesInteractionKit/Providers/CameraProvider/WorldCameraFinderProvider");
const animate_1 = require("../../../../SpectaclesInteractionKit/Utils/animate");
const mathUtils_1 = require("../../../../SpectaclesInteractionKit/Utils/mathUtils");
const TextValues_1 = require("../../Texts/TextValues");
const tween_1 = require("./animations/tween");
const TweenFactory_1 = require("./animations/TweenFactory");
const StartPointAlphaAnimation_1 = require("./StartPointAlphaAnimation");
class ObjectLocator {
    constructor(input, projectContainer) {
        this.input = input;
        this.projectContainer = projectContainer;
        this.worldCamera = WorldCameraFinderProvider_1.default.getInstance();
        this.arrowVisible = false;
        this.currentBlend = 0;
        this.currentRotation = quat.quatIdentity();
        this.onUpdate = () => {
            const originPosition = this.cameraTransform.getWorldPosition();
            const objectPosition = this.projectContainer.startPointPosition;
            const direction = objectPosition
                .sub(originPosition)
                .normalize()
                .mult(new vec3(1, 0, 1));
            const forward = this.cameraTransform.back.mult(new vec3(1, 0, 1));
            const delta = direction
                .normalize()
                .sub(forward.normalize())
                .uniformScale(100);
            const unsignedAngle = forward.angleTo(direction);
            const sign = vec3.up().dot(forward.cross(direction)) > 0 ? -1 : 1;
            if (unsignedAngle > Math.PI * 0.7) {
                // show back arrow
                this.showArrow(unsignedAngle, sign, true);
            }
            else if (unsignedAngle < Math.PI * 0.1) {
                // hide arrow
                this.hideArrow();
            }
            else {
                // show side arrow
                this.showArrow(unsignedAngle, sign, false);
            }
        };
        this.onUserToHelpChanged = () => {
            if (this.projectContainer.joinedUsers.length > 0) {
                this.input.hintText.text = TextValues_1.TextValues.ALIGN_HINT_P1_TEACHES_P2.replace(TextValues_1.TextValues.P2, this.projectContainer.joinedUsers[0].displayName);
                this.input.teachingText.text = TextValues_1.TextValues.TEACHING_TEXT.replace(TextValues_1.TextValues.P2, this.projectContainer.joinedUsers[0].displayName);
            }
        };
        this.startPointAlphaAnimation = new StartPointAlphaAnimation_1.StartPointAlphaAnimation(input.script, input.startPointObject);
        this.arrowTransform = this.input.arrow.getTransform();
        this.cameraTransform = this.worldCamera.getTransform();
        this.startPointObjectTransform = this.input.startPointObject.getTransform();
        this.startScale = this.startPointObjectTransform.getLocalScale();
        this.updateEvent = input.script.createEvent("UpdateEvent");
        this.updateEvent.bind(this.onUpdate);
        this.updateEvent.enabled = false;
        input.root.enabled = false;
        this.projectContainer.isUserAligned.onChanged((value) => {
            var _a;
            if (value) {
                (_a = this.scaleCancelFunction) === null || _a === void 0 ? void 0 : _a.call(this);
                this.showScaleDownAnimation();
            }
        });
        this.projectContainer.notifyOnUserToHelpChanged(this.onUserToHelpChanged);
    }
    start(joinedUserDisplayName) {
        var _a;
        (_a = this.scaleCancelFunction) === null || _a === void 0 ? void 0 : _a.call(this);
        this.input.hintText.text = TextValues_1.TextValues.ALIGN_HINT_P1_TEACHES_P2.replace(TextValues_1.TextValues.P2, joinedUserDisplayName);
        this.input.teachingText.text = TextValues_1.TextValues.TEACHING_TEXT.replace(TextValues_1.TextValues.P2, joinedUserDisplayName);
        this.startPointObjectTransform.setWorldPosition(this.projectContainer.startPointPosition);
        this.startPointObjectTransform.setWorldRotation(this.projectContainer.startPointRotation);
        this.showScaleUpAnimation();
        this.input.root.enabled = true;
        this.updateEvent.enabled = true;
        this.startPointAlphaAnimation.start(this.projectContainer.startPointPosition);
    }
    stop() {
        this.updateEvent.enabled = false;
        this.hideArrow();
        this.input.hintRoot.enabled = false;
    }
    showArrow(unsignedAngle, sign, backArrow) {
        var _a;
        const targetRotation = backArrow
            ? quat.fromEulerAngles(0, Math.PI * 0.1, -Math.PI / 2)
            : sign > 0
                ? quat.fromEulerAngles(0, Math.PI / 2, 0)
                : quat.fromEulerAngles(-Math.PI / 2, Math.PI / 2, Math.PI / 2);
        const targetBlend = backArrow
            ? 0
            : this.map(unsignedAngle, Math.PI * 0.1, Math.PI * 0.7, 0.5, 0);
        if (!this.arrowVisible) {
            (_a = this.activeTween) === null || _a === void 0 ? void 0 : _a.stop();
            const t = TweenFactory_1.TweenFactory.create({ a: 1 }, { a: targetBlend }, 0.5)
                .onUpdate((v) => {
                this.input.arrow.setBlendShapeWeight("Key 1", v.a);
            })
                .easing(tween_1.Easing.Back.Out);
            this.input.arrow.enabled = true;
            this.activeTween = t;
            this.arrowVisible = true;
            this.currentRotation = targetRotation;
            this.currentBlend = targetBlend;
        }
        this.currentRotation = quat.slerp(this.currentRotation, targetRotation, 0.2);
        this.arrowTransform.setLocalRotation(this.currentRotation);
        this.currentBlend = (0, mathUtils_1.lerp)(this.currentBlend, targetBlend, 0.2);
        this.input.arrow.setBlendShapeWeight("Key 1", this.currentBlend);
    }
    hideArrow() {
        var _a;
        if (!this.arrowVisible) {
            return;
        }
        this.arrowVisible = false;
        (_a = this.activeTween) === null || _a === void 0 ? void 0 : _a.stop();
        const t = TweenFactory_1.TweenFactory.create({ a: this.currentBlend }, { a: 1 }, 0.3)
            .onUpdate((v) => {
            this.input.arrow.setBlendShapeWeight("Key 1", v.a);
        })
            .onComplete(() => {
            this.input.arrow.enabled = false;
        })
            .easing(tween_1.Easing.Cubic.In);
        this.activeTween = t;
    }
    map(value, low1, high1, low2, high2) {
        return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
    }
    showScaleUpAnimation() {
        this.startPointObjectTransform.setLocalScale(this.startScale.uniformScale(0.7));
        this.scaleCancelFunction = this.animateScale(this.startPointObjectTransform.getLocalScale(), this.startScale, 0.3, "ease-out-back");
    }
    showScaleDownAnimation() {
        this.scaleCancelFunction = this.animateScale(this.startPointObjectTransform.getLocalScale(), this.startScale.uniformScale(0.7), 0.3, "ease-in-back", () => {
            this.input.root.enabled = false;
            this.startPointAlphaAnimation.stop();
        });
    }
    animateScale(from, to, duration, easing, onComplete = () => { }) {
        return (0, animate_1.default)({
            update: (t) => {
                const currentScale = vec3.lerp(from, to, t);
                this.startPointObjectTransform.setLocalScale(currentScale);
            },
            start: 0,
            end: 1,
            duration: duration,
            easing: easing,
            ended: onComplete,
        });
    }
}
exports.ObjectLocator = ObjectLocator;
//# sourceMappingURL=ObjectLocator.js.map