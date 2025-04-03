"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WorldCameraFinderProvider_1 = require("../../../../SpectaclesInteractionKit/Providers/CameraProvider/WorldCameraFinderProvider");
const animate_1 = require("../../../../SpectaclesInteractionKit/Utils/animate");
const mathUtils_1 = require("../../../../SpectaclesInteractionKit/Utils/mathUtils");
const SecondOrderDynamics_1 = require("./SecondOrderDynamics");
class HeadLockBehavior {
    constructor(input, objectTransform) {
        this.input = input;
        this.objectTransform = objectTransform;
        this.worldCameraObject = WorldCameraFinderProvider_1.default.getInstance();
        this.cameraTransform = this.worldCameraObject.getTransform();
        this.objectMovingDurationOnStart = 0.3;
        this.objectMovingDurationReturnBack = 0.85;
        this.maxDistanceToCorners = 23.2;
        this.maxDistance = 50;
        this.maxCounterToSkipPositionUpdate = 10;
        this.currentCounterToSkipPositionUpdate = 0;
        this.objectIsMoving = false;
        this.previousProcessedRotation = vec3.zero();
        this.previousProcessedPosition = vec3.zero();
        this.previousTargetObjectPosition = vec3.zero();
        this.previousObjectRotation = null;
        this.cancelFunction = null;
        this.shiftVector = vec3.zero();
        this.isHeadLockActive = false;
        this.updatePosition = false;
        this.onUpdate = () => {
            this.updateObjectRotation();
            if (this.updatePosition) {
                this.updateObjectPosition();
            }
        };
        this.config = {
            distance: this.input.distance,
            bufferRotationDegrees: this.input.bufferRotationDegrees,
            bufferTranslationCentimeters: this.input.bufferTranslationCentimeters,
        };
        this.updateEvent = this.input.createEvent("UpdateEvent");
        this.updateEvent.bind(this.onUpdate);
        this.updateEvent.enabled = false;
        this.dynamics = new SecondOrderDynamics_1.SecondOrderDynamics(input.frequencyCoefficient, input.dampingCoefficient, input.underShockCoefficient, vec3.zero());
    }
    start(needToBeAnimatedToStartPos = false) {
        this.isHeadLockActive = true;
        this.updateObjectRotation(true);
        this.updatePosition = !needToBeAnimatedToStartPos;
        this.updateEvent.enabled = true;
        if (needToBeAnimatedToStartPos) {
            const newObjectPos = this.calculateObjectPosInFrontOfCamera();
            const distance = newObjectPos.distance(this.objectTransform.getWorldPosition());
            this.cancelFunction = this.animateToPosition(this.objectTransform, newObjectPos, (0, mathUtils_1.lerp)(0, this.objectMovingDurationOnStart, (0, mathUtils_1.clamp)(distance, 0, this.maxDistance) / this.maxDistance), () => {
                this.updatePosition = this.isHeadLockActive;
                if (this.updatePosition) {
                    this.dynamics.reset(this.objectTransform.getWorldPosition());
                }
            });
        }
        if (this.updatePosition) {
            this.dynamics.reset(this.objectTransform.getWorldPosition());
        }
    }
    stop() {
        var _a;
        this.isHeadLockActive = false;
        (_a = this.cancelFunction) === null || _a === void 0 ? void 0 : _a.call(this);
        this.updatePosition = false;
        this.updateEvent.enabled = false;
    }
    set distance(value) {
        this.config.distance = value;
    }
    set bufferRotationDegrees(value) {
        this.config.bufferRotationDegrees = value;
    }
    set bufferTranslationCentimeters(value) {
        this.config.bufferTranslationCentimeters = value;
    }
    get maxOffsetFromCenter() {
        return this.config.bufferRotationDegrees * MathUtils.DegToRad;
    }
    moveObjectToFOV(onComplete, currentScale) {
        const newObjectPos = this.calculateObjectPosition(currentScale);
        const distance = newObjectPos.distance(this.objectTransform.getWorldPosition());
        this.cancelFunction = this.animateObjectMovingToFOV(this.objectTransform, (0, mathUtils_1.lerp)(0.5, this.objectMovingDurationReturnBack, (0, mathUtils_1.clamp)(distance, 0, this.maxDistance) / this.maxDistance), onComplete, "ease-out-back-cubic");
    }
    calculateObjectPosition(currentScale) {
        let leftCoefficient = 0, rightCoefficient = 100;
        const EPS = 1e-4;
        const centerPosition = this.calculateObjectPosInFrontOfCamera();
        const currentPosition = this.calculateWorldPosProjectedOnPlane();
        while (rightCoefficient - leftCoefficient > EPS) {
            const middleCoefficient = (leftCoefficient + rightCoefficient) / 2;
            const newPos = vec3.lerp(centerPosition, currentPosition, middleCoefficient / 100);
            const containerCorners = this.getObjectCornersByPos(newPos, currentScale);
            if (this.pointDistanceIsLessThanMaxDeflection(centerPosition, containerCorners)) {
                leftCoefficient = middleCoefficient;
            }
            else {
                rightCoefficient = middleCoefficient;
            }
        }
        const res = vec3.lerp(centerPosition, currentPosition, leftCoefficient / 100);
        this.shiftVector = this.calculateLocalShiftVecByCurrentPos(res);
        return this.calculateObjectPosWithShift(this.shiftVector);
    }
    calculateWorldPosProjectedOnPlane() {
        const lastPosition = this.objectTransform.getWorldPosition();
        const projectedPosition = lastPosition
            .sub(this.cameraTransform.getWorldPosition())
            .projectOnPlane(this.cameraTransform.forward)
            .add(this.cameraTransform.getWorldPosition());
        const direction = this.cameraTransform.back.uniformScale(this.config.distance);
        return projectedPosition.add(direction);
    }
    calculateLocalShiftVecByCurrentPos(pos) {
        const centerPosition = this.calculateObjectPosInFrontOfCamera();
        const shift = this.worldVecToLocalVec(pos.sub(centerPosition));
        shift.z = 0;
        return shift;
    }
    worldVecToLocalVec(value) {
        return this.cameraTransform.getWorldRotation().invert().multiplyVec3(value);
    }
    calculateObjectPosWithShift(shift) {
        return this.calculateObjectPosInFrontOfCamera()
            .add(this.cameraTransform.right.uniformScale(shift.x))
            .add(this.cameraTransform.up.uniformScale(shift.y))
            .add(this.cameraTransform.forward.uniformScale(shift.z));
    }
    calculateObjectPosInFrontOfCamera() {
        return this.cameraTransform
            .getWorldPosition()
            .add(this.cameraTransform.back.uniformScale(this.config.distance));
    }
    updateObjectPosition() {
        const currentRotation = this.cameraTransform.back;
        const offsetAngle = this.previousProcessedRotation.angleTo(currentRotation);
        const currentPosition = this.cameraTransform.getWorldPosition();
        const offsetDistance = currentPosition.distance(this.previousProcessedPosition);
        if (this.needToUpdateObjectPosition(offsetAngle, offsetDistance)) {
            const pos = this.dynamics.update(getDeltaTime() * this.input.timeCoefficient, this.calculateObjectPosWithShift(this.shiftVector));
            this.objectTransform.setWorldPosition(pos);
            this.previousProcessedRotation = currentRotation;
            this.previousProcessedPosition = currentPosition;
            this.previousTargetObjectPosition = this.calculateObjectPosWithShift(this.shiftVector);
            this.objectIsMoving = true;
        }
        else {
            const pos = this.dynamics.update(getDeltaTime() * this.input.timeCoefficient, this.previousTargetObjectPosition);
            this.objectTransform.setWorldPosition(pos);
            this.objectIsMoving = false;
        }
    }
    needToUpdateObjectPosition(offsetAngle, offsetDistance) {
        const needToUpdate = offsetAngle > this.maxOffsetFromCenter ||
            offsetDistance > this.config.bufferTranslationCentimeters;
        if (needToUpdate) {
            this.currentCounterToSkipPositionUpdate = 0;
        }
        else {
            ++this.currentCounterToSkipPositionUpdate;
        }
        return (this.currentCounterToSkipPositionUpdate <
            this.maxCounterToSkipPositionUpdate);
    }
    updateObjectRotation(immediatelyUpdate = false) {
        const cameraUpVec = this.cameraTransform.up;
        const cameraForwardVec = this.cameraTransform.forward;
        const cameraRightVec = this.cameraTransform.right;
        const normalVec = cameraRightVec.projectOnPlane(vec3.up()).normalize();
        const dist = normalVec.dot(cameraUpVec);
        const projectedUp = cameraUpVec.sub(normalVec.uniformScale(dist));
        let newRot;
        if (this.objectIsMoving ||
            !this.previousObjectRotation ||
            immediatelyUpdate) {
            newRot = quat.lookAt(cameraForwardVec, projectedUp);
            this.previousObjectRotation = newRot;
        }
        else {
            newRot = this.previousObjectRotation;
        }
        if (immediatelyUpdate) {
            this.objectTransform.setWorldRotation(newRot);
        }
        else {
            this.objectTransform.setWorldRotation(quat.slerp(this.objectTransform.getWorldRotation(), newRot, 6 * getDeltaTime()));
        }
    }
    getObjectCornersByPos(value, currentScale) {
        let scale;
        if (currentScale) {
            scale = currentScale;
        }
        else {
            scale = this.objectTransform.getWorldScale();
        }
        return [
            value
                .add(this.cameraTransform.up.uniformScale(scale.y / 2))
                .add(this.cameraTransform.left.uniformScale(scale.x / 2)),
            value
                .add(this.cameraTransform.up.uniformScale(scale.y / 2))
                .add(this.cameraTransform.right.uniformScale(scale.x / 2)),
            value
                .add(this.cameraTransform.down.uniformScale(scale.y / 2))
                .add(this.cameraTransform.left.uniformScale(scale.x / 2)),
            value
                .add(this.cameraTransform.down.uniformScale(scale.y / 2))
                .add(this.cameraTransform.right.uniformScale(scale.x / 2)),
        ];
    }
    /**
     * Animate the SceneObject moving to the given position.
     */
    animateToPosition(transform, position, duration, onComplete = () => { }) {
        const startPosition = transform.getWorldPosition();
        const endPosition = position;
        return (0, animate_1.default)({
            update: (t) => {
                const currentPosition = vec3.lerp(startPosition, endPosition, t);
                transform.setWorldPosition(currentPosition);
            },
            start: 0,
            end: 1,
            duration: duration,
            ended: onComplete,
        });
    }
    animateObjectMovingToFOV(transform, duration, onComplete = () => { }, easing) {
        const startPosition = transform.getWorldPosition();
        return (0, animate_1.default)({
            update: (t) => {
                const endPosition = this.calculateObjectPosWithShift(this.shiftVector);
                const currentPosition = vec3.lerp(startPosition, endPosition, t);
                transform.setWorldPosition(currentPosition);
            },
            start: 0,
            end: 1,
            duration: duration,
            easing: easing,
            ended: onComplete,
        });
    }
    pointDistanceIsLessThanMaxDeflection(center, points) {
        for (const point of points) {
            if (point.distance(center) > this.maxDistanceToCorners) {
                return false;
            }
        }
        return true;
    }
}
exports.default = HeadLockBehavior;
//# sourceMappingURL=HeadLockBehavior.js.map