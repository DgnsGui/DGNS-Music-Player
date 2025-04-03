"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setObjectInTheWorldOnDistance = exports.animateToAlpha = exports.delayFrames = exports.setAlpha = exports.getPasses = void 0;
const WorldCameraFinderProvider_1 = require("../../../SpectaclesInteractionKit/Providers/CameraProvider/WorldCameraFinderProvider");
const animate_1 = require("../../../SpectaclesInteractionKit/Utils/animate");
const mathUtils_1 = require("../../../SpectaclesInteractionKit/Utils/mathUtils");
const getPasses = (object) => {
    const meshComponent = object.getComponents("Component.RenderMeshVisual");
    const imageComponent = object.getComponents("Component.Image");
    if (meshComponent.length > 0) {
        const mesh = (object.getComponent("Component.RenderMeshVisual"));
        const res = [];
        for (let i = 0; i < mesh.getMaterialsCount(); ++i) {
            res.push(mesh.getMaterial(i).mainPass);
        }
        return res;
    }
    else if (imageComponent.length > 0) {
        const image = object.getComponent("Component.Image");
        return [image.mainMaterial.mainPass];
    }
    return null;
};
exports.getPasses = getPasses;
const setAlpha = (object, alpha) => {
    const pass = (0, exports.getPasses)(object);
    if (pass) {
        pass.forEach((value) => {
            const baseColor = value.baseColor;
            if (baseColor) {
                baseColor.a = alpha;
                value.baseColor = baseColor;
            }
        });
    }
    else if (object.getComponents("Component.Text").length > 0) {
        const text = object.getComponent("Component.Text");
        const baseColor = text.textFill.color;
        baseColor.a = alpha;
        text.textFill.color = baseColor;
        if (text.outlineSettings.enabled) {
            text.outlineSettings.fill.color = baseColor;
        }
    }
    for (let i = 0; i < object.getChildrenCount(); ++i) {
        const child = object.getChild(i);
        (0, exports.setAlpha)(child, alpha);
    }
};
exports.setAlpha = setAlpha;
function delayFrames(script, framesCount, callback) {
    let counter = 0;
    if (framesCount === counter) {
        callback && callback();
        return;
    }
    script.createEvent("UpdateEvent").bind((eventData) => {
        if (++counter >= framesCount) {
            callback && callback();
            eventData.enabled = false;
        }
    });
}
exports.delayFrames = delayFrames;
function animateToAlpha(target, from, to, duration, onComplete = () => { }) {
    return (0, animate_1.default)({
        update: (t) => {
            const currentAlpha = (0, mathUtils_1.lerp)(from, to, t);
            (0, exports.setAlpha)(target, currentAlpha);
        },
        start: 0,
        end: 1,
        duration: duration,
        ended: onComplete,
    });
}
exports.animateToAlpha = animateToAlpha;
function setObjectInTheWorldOnDistance(object, distance, shouldCountY = false) {
    const transform = object.getTransform();
    const worldCamera = WorldCameraFinderProvider_1.default.getInstance();
    const head = worldCamera.getTransform().getWorldPosition();
    const back = worldCamera.getTransform().back;
    if (!shouldCountY) {
        back.y = 0;
    }
    const pos = back.normalize().uniformScale(distance);
    transform.setWorldPosition(head.add(pos));
    transform.setWorldRotation(quat.lookAt(pos.uniformScale(-1), vec3.up()));
}
exports.setObjectInTheWorldOnDistance = setObjectInTheWorldOnDistance;
//# sourceMappingURL=SharedFunctions.js.map