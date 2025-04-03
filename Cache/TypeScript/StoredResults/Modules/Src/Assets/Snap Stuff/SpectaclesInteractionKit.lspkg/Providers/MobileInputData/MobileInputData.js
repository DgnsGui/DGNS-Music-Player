"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobileInputData = void 0;
const OneEuroFilter_1 = require("../../Utils/OneEuroFilter");
const animate_1 = require("../../Utils/animate");
const Event_1 = require("../../Utils/Event");
const MotionControllerProvider_1 = require("../HandInputData/GestureProvider/MotionControllerProvider");
const NativeLogger_1 = require("../../Utils/NativeLogger");
const Singleton_1 = require("../../Decorators/Singleton");
const TAG = "MobileInputData";
const TRANSLATE_FILTER_CONFIG = {
    frequency: 60,
    minCutoff: 3.5,
    beta: 0.5,
    dcutoff: 1,
};
const ROTATION_FILTER_CONFIG = {
    frequency: 60,
    minCutoff: 1,
    beta: 2,
    dcutoff: 1,
};
/**
 * This singleton class manages mobile input data, including motion controller state, position, and rotation. It uses filters to smooth the input data and provides events for tracking quality changes.
 *
 */
let MobileInputData = class MobileInputData {
    constructor() {
        var _a, _b, _c;
        this.log = new NativeLogger_1.default(TAG);
        this.animationManager = animate_1.AnimationManager.getInstance();
        this.translateFilter = new OneEuroFilter_1.OneEuroFilterVec3(TRANSLATE_FILTER_CONFIG);
        this.rotationFilter = new OneEuroFilter_1.OneEuroFilterQuat(ROTATION_FILTER_CONFIG);
        this._position = vec3.zero();
        this._rotation = quat.quatIdentity();
        this._trackingQuality = (_a = MotionController.TrackingQuality) === null || _a === void 0 ? void 0 : _a.Unknown;
        this.onTrackingQualityChangeEvent = new Event_1.default();
        /**
         * Public API to subscribe to tracking quality change events.
         *
         * @returns The public api
         */
        this.onTrackingQualityChange = this.onTrackingQualityChangeEvent.publicApi();
        /** Enables filtering of position and rotation */
        this.filterPositionAndRotation = true;
        this.initializeMotionController();
        if (this._motionController === undefined) {
            return;
        }
        this.onControllerStateChange =
            (_b = this._motionController) === null || _b === void 0 ? void 0 : _b.onControllerStateChange;
        (_c = this.onControllerStateChange) === null || _c === void 0 ? void 0 : _c.add((state) => {
            this.log.d("Controller state changed to : " + state);
        });
        this.update(this.filterPositionAndRotation);
    }
    initializeMotionController() {
        this._motionControllerModule =
            MotionControllerProvider_1.default.getInstance().getModule();
        if (this._motionControllerModule === undefined) {
            return;
        }
        let options = MotionController.Options.create();
        options.motionType = MotionController.MotionType.SixDoF;
        this._motionController = this._motionControllerModule.getController(options);
        this._trackingQuality = this._motionController.getTrackingQuality();
    }
    update(useFilter = true) {
        var _a;
        if (this._motionControllerModule === undefined ||
            this._motionController === undefined) {
            return;
        }
        if ((_a = this._motionController) === null || _a === void 0 ? void 0 : _a.isControllerAvailable()) {
            this._position = useFilter
                ? this.translateFilter.filter(this._motionController.getWorldPosition(), getTime())
                : this._motionController.getWorldPosition();
            this._rotation = useFilter
                ? this.rotationFilter.filter(this._motionController.getWorldRotation(), getTime())
                : this._motionController.getWorldRotation();
        }
        if (this._trackingQuality !== this._motionController.getTrackingQuality()) {
            this.onTrackingQualityChangeEvent.invoke(this._motionController.getTrackingQuality());
            this.log.v("Motion Controller Tracking Quality has changed to : " +
                this._motionController.getTrackingQuality());
            this.translateFilter.reset();
            this.rotationFilter.reset();
        }
        this._trackingQuality = this._motionController.getTrackingQuality();
        this.animationManager.requestAnimationFrame(() => this.update(this.filterPositionAndRotation));
    }
    /**
     * @returns the current Motion Controller module instance.
     */
    get motionController() {
        return this._motionController;
    }
    /**
     * @returns the current position.
     */
    get position() {
        return this._position;
    }
    /**
     * @returns the current rotation.
     */
    get rotation() {
        return this._rotation;
    }
    /**
     * @returns the current tracking quality or undefined is the module is not
     * available.
     */
    get trackingQuality() {
        if (this._motionController === undefined) {
            return undefined;
        }
        return this._motionController.getTrackingQuality();
    }
    /**
     * @returns if the mobile input data provider is available,
     * which means that it is receiving data.
     */
    isAvailable() {
        if (this._motionController === undefined) {
            return false;
        }
        return this._motionController.isControllerAvailable();
    }
};
exports.MobileInputData = MobileInputData;
exports.MobileInputData = MobileInputData = __decorate([
    Singleton_1.Singleton
], MobileInputData);
//# sourceMappingURL=MobileInputData.js.map