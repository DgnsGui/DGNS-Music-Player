"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurfaceDetection = void 0;
var __selfType = requireType("./SurfaceDetection");
function component(target) { target.getTypeName = function () { return __selfType; }; }
let SurfaceDetection = class SurfaceDetection extends BaseScriptComponent {
    onAwake() {
        if (!this.camObj) {
            print("Please set Camera Obj input");
            return;
        }
        this.camTrans = this.camObj.getTransform();
        this.visualTrans = this.visualObj.getTransform();
        this.visualObj.enabled = false;
        try {
            const options = HitTestSessionOptions.create();
            options.filter = true;
            this.hitTestSession = this.worldQueryModule.createHitTestSessionWithOptions(options);
        }
        catch (e) {
            print(e);
        }
        this.createEvent("OnStartEvent").bind(() => {
            this.setDefaultPosition();
        });
    }
    startGroundCalibration(callback) {
        var _a;
        this.setDefaultPosition();
        (_a = this.hitTestSession) === null || _a === void 0 ? void 0 : _a.start();
        this.visualObj.enabled = true;
        this.history = [];
        this.calibrationFrames = 0;
        this.onGroundFoundCallback = callback;
        this.updateEvent = this.createEvent("UpdateEvent");
        this.updateEvent.bind(() => {
            this.update();
        });
        this.animation.startCalibration(() => {
            this.onCalibrationComplete();
        });
    }
    setDefaultPosition() {
        this.desiredPosition = this.camTrans.getWorldPosition().add(this.camTrans.forward.uniformScale(-this.DEFAULT_SCREEN_DISTANCE));
        this.desiredRotation = this.camTrans.getWorldRotation();
        this.visualTrans.setWorldPosition(this.desiredPosition);
        this.visualTrans.setWorldRotation(this.desiredRotation);
    }
    update() {
        const rayDirection = this.camTrans.forward;
        rayDirection.y += .1;
        const camPos = this.camTrans.getWorldPosition();
        const rayStart = camPos.add(rayDirection.uniformScale(-this.MIN_HIT_DISTANCE));
        const rayEnd = camPos.add(rayDirection.uniformScale(-this.MAX_HIT_DISTANCE));
        this.hitTestSession.hitTest(rayStart, rayEnd, (hitTestResult) => {
            this.onHitTestResult(hitTestResult);
        });
    }
    onHitTestResult(hitTestResult) {
        let foundPosition = vec3.zero();
        let foundNormal = vec3.zero();
        if (hitTestResult != null) {
            foundPosition = hitTestResult.position;
            foundNormal = hitTestResult.normal;
        }
        this.updateCalibration(foundPosition, foundNormal);
    }
    updateCalibration(foundPosition, foundNormal) {
        const currPosition = this.visualTrans.getWorldPosition();
        const currRotation = this.visualTrans.getWorldRotation();
        this.desiredPosition = this.camTrans.getWorldPosition().add(this.camTrans.forward.uniformScale(-this.DEFAULT_SCREEN_DISTANCE));
        this.desiredRotation = this.camTrans.getWorldRotation();
        //check if horizontal plane is being tracked
        if (foundNormal.distance(vec3.up()) < .1) {
            //make calibration face camera
            this.desiredPosition = foundPosition;
            const worldCameraForward = this.camTrans.right.cross(vec3.up()).normalize();
            this.desiredRotation = quat.lookAt(worldCameraForward, foundNormal);
            this.desiredRotation = this.desiredRotation.multiply(quat.fromEulerVec(new vec3(-Math.PI / 2, 0, 0)));
            this.history.push(this.desiredPosition);
            if (this.history.length > this.CALIBRATION_FRAMES) {
                this.history.shift();
            }
            const distance = this.history[0].distance(this.history[this.history.length - 1]);
            if (distance < this.MOVE_DISTANCE_THRESHOLD) {
                this.calibrationFrames++;
            }
            else {
                this.calibrationFrames = 0;
            }
        }
        else {
            this.calibrationFrames = 0;
            this.history = [];
        }
        const calibrationAmount = this.calibrationFrames / this.CALIBRATION_FRAMES;
        this.animation.setLoadAmount(calibrationAmount);
        if (calibrationAmount == 1) {
            this.calibrationPosition = this.desiredPosition;
            const rotOffset = quat.fromEulerVec(new vec3(Math.PI / 2, 0, 0));
            this.calibrationRotation = this.desiredRotation.multiply(rotOffset);
            this.removeEvent(this.updateEvent);
        }
        //interpolate
        this.visualTrans.setWorldPosition(vec3.lerp(currPosition, this.desiredPosition, getDeltaTime() * this.SPEED));
        this.visualTrans.setWorldRotation(quat.slerp(currRotation, this.desiredRotation, getDeltaTime() * this.SPEED));
    }
    onCalibrationComplete() {
        var _a, _b;
        (_a = this.hitTestSession) === null || _a === void 0 ? void 0 : _a.stop();
        (_b = this.onGroundFoundCallback) === null || _b === void 0 ? void 0 : _b.call(this, this.calibrationPosition, this.calibrationRotation);
    }
    __initialize() {
        super.__initialize();
        this.worldQueryModule = require("LensStudio:WorldQueryModule");
        this.MAX_HIT_DISTANCE = 1000;
        this.MIN_HIT_DISTANCE = 50;
        this.CALIBRATION_FRAMES = 30;
        this.MOVE_DISTANCE_THRESHOLD = 5;
        this.DEFAULT_SCREEN_DISTANCE = 200;
        this.SPEED = 10;
        this.calibrationPosition = vec3.zero();
        this.calibrationRotation = quat.quatIdentity();
        this.desiredPosition = vec3.zero();
        this.desiredRotation = quat.quatIdentity();
        this.hitTestSession = null;
        this.updateEvent = null;
        this.history = [];
        this.calibrationFrames = 0;
        this.onGroundFoundCallback = null;
    }
};
exports.SurfaceDetection = SurfaceDetection;
exports.SurfaceDetection = SurfaceDetection = __decorate([
    component
], SurfaceDetection);
//# sourceMappingURL=SurfaceDetection.js.map