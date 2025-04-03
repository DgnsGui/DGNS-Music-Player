"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartPointAlphaAnimation = void 0;
const WorldCameraFinderProvider_1 = require("../../../../SpectaclesInteractionKit/Providers/CameraProvider/WorldCameraFinderProvider");
const mathUtils_1 = require("../../../../SpectaclesInteractionKit/Utils/mathUtils");
const SharedFunctions_1 = require("../../Utils/SharedFunctions");
class StartPointAlphaAnimation {
    constructor(script, startPointObject) {
        this.startPointObject = startPointObject;
        this.worldCamera = WorldCameraFinderProvider_1.default.getInstance();
        this.worldCameraTransform = this.worldCamera.getTransform();
        this.minDistance = 30;
        this.maxDistance = 130;
        this.startPointPasses = [];
        this.startPoint = vec3.zero();
        this.currentAlpha = 1;
        this.onUpdate = () => {
            const distance = this.worldCameraTransform
                .getWorldPosition()
                .distance(this.startPoint);
            if (distance > this.maxDistance) {
                this.setAlpha((0, mathUtils_1.lerp)(this.currentAlpha, 1, 3 * getDeltaTime()));
            }
            else if (distance < this.minDistance) {
                this.setAlpha((0, mathUtils_1.lerp)(this.currentAlpha, 0, 3 * getDeltaTime()));
            }
            else {
                this.setAlpha((0, mathUtils_1.lerp)(this.currentAlpha, distance / (this.maxDistance - this.minDistance), 3 * getDeltaTime()));
            }
        };
        this.fillPassesArray(startPointObject);
        this.updateEvent = script.createEvent("UpdateEvent");
        this.updateEvent.bind(this.onUpdate);
        this.updateEvent.enabled = false;
    }
    start(startPoint) {
        this.startPoint = startPoint;
        this.updateEvent.enabled = true;
    }
    stop() {
        this.updateEvent.enabled = false;
    }
    setAlpha(value) {
        (0, SharedFunctions_1.setAlpha)(this.startPointObject, value);
        this.startPointPasses.forEach((pass) => (pass.alpha = value));
        this.currentAlpha = value;
    }
    fillPassesArray(object) {
        const pass = (0, SharedFunctions_1.getPasses)(object);
        if (pass) {
            pass.forEach((value) => {
                this.startPointPasses.push(value);
            });
        }
        for (let i = 0; i < object.getChildrenCount(); ++i) {
            const child = object.getChild(i);
            this.fillPassesArray(child);
        }
    }
}
exports.StartPointAlphaAnimation = StartPointAlphaAnimation;
//# sourceMappingURL=StartPointAlphaAnimation.js.map