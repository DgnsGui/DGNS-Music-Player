"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RocketLaunchControl = void 0;
var __selfType = requireType("./RocketLaunchControl");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const Interactable_1 = require("../../../Components/Interaction/Interactable/Interactable");
const validate_1 = require("../../../Utils/validate");
const FLIGHT_END_EVENT_NAME = "flightEnded";
/**
 * This class manages the rocket launch control interface, including the launch button, animation buttons, and slider. It interacts with the RocketConfigurator to configure and launch the rocket.
 *
 */
let RocketLaunchControl = class RocketLaunchControl extends BaseScriptComponent {
    onAwake() {
        this.createEvent("OnStartEvent").bind(() => {
            this.onStart();
        });
        this.launchSparksDisableEvent = this.createEvent("DelayedCallbackEvent");
        this.launchSparksDisableEvent.bind(() => {
            this.launchSparks.enabled = false;
        });
        const interactableTypeName = Interactable_1.Interactable.getTypeName();
        this.launchButton_interactable =
            this.launchButton.getComponent(interactableTypeName);
        if (isNull(this.launchButton_interactable)) {
            throw new Error("Interactable component not found.");
        }
        this.animationAButton_interactable =
            this.animationAButton.getComponent(interactableTypeName);
        if (isNull(this.animationAButton_interactable)) {
            throw new Error("Interactable component not found.");
        }
        this.animationBButton_interactable =
            this.animationBButton.getComponent(interactableTypeName);
        if (isNull(this.animationBButton_interactable)) {
            throw new Error("Interactable component not found.");
        }
        this.animationCButton_interactable =
            this.animationCButton.getComponent(interactableTypeName);
        if (isNull(this.animationCButton_interactable)) {
            throw new Error("Interactable component not found.");
        }
        this.launchButtonText = this.launchButton.getChild(0).getComponent("Text");
        this.launchSparks.enabled = false;
        this.engineStartedEvent = this.createEvent("DelayedCallbackEvent");
        this.engineStartedEvent.bind(() => {
            this.engineStarted();
        });
        this.engineReadyEvent = this.createEvent("DelayedCallbackEvent");
        this.engineReadyEvent.bind(() => {
            this.engineReady();
        });
        this.rocketTakeOffEvent = this.createEvent("DelayedCallbackEvent");
        this.rocketTakeOffEvent.bind(() => {
            this.rocketTakeOff();
        });
        this.takeOffCompleteEvent = this.createEvent("DelayedCallbackEvent");
        this.takeOffCompleteEvent.bind(() => {
            this.takeOffCompleted();
        });
        this.landingStartedEvent = this.createEvent("DelayedCallbackEvent");
        this.landingStartedEvent.bind(() => {
            this.landingStarted();
        });
        this.subscribeToCurrentLaunchAnimationEndEvent();
    }
    onStart() {
        this.setupLaunchButtonCallbacks();
        this.setupAnimationAButtonCallbacks();
        this.setupAnimationBButtonCallbacks();
        this.setupAnimationCButtonCallbacks();
        this.launchPlatformToggleButton.onStateChanged.add((isToggledOn) => {
            if (isToggledOn) {
                this.launchPlatform.enabled = true;
            }
            else {
                this.launchPlatform.enabled = false;
            }
        });
    }
    engineStarted() {
        this.rocketConf.getExhaustControl();
        (0, validate_1.validate)(this.rocketConf.exhaustControl);
        (0, validate_1.validate)(this.engineReadyEvent);
        this.rocketConf.exhaustControl.setEngineSmokesValue(1.1);
        this.rocketConf.exhaustControl.turnOnExhausts();
        this.rocketConf.exhaustControl.turnOnSmokes();
        this.engineReadyEvent.reset(0.5);
    }
    engineReady() {
        (0, validate_1.validate)(this.rocketConf.exhaustControl);
        (0, validate_1.validate)(this.rocketTakeOffEvent);
        this.rocketConf.exhaustControl.engineReady();
        this.rocketConf.exhaustControl.setEngineSmokesValue(0.8);
        this.rocketTakeOffEvent.reset(0.5);
    }
    rocketTakeOff() {
        var _a;
        (0, validate_1.validate)(this.rocketConf.exhaustControl);
        this.rocketConf.exhaustControl.setEngineSmokesValue(0.0);
        this.rocketAnimationPlayer.playClipAt(this.currentLaunchAnimationName, 0.0);
        (0, validate_1.validate)(this.slider);
        this.rocketAnimationPlayer.getClip(this.currentLaunchAnimationName).playbackSpeed = MathUtils.remap((_a = this.slider.currentValue) !== null && _a !== void 0 ? _a : 0, 0.0, 1.0, 1.0, 5.0);
        this.launchSparks.enabled = true;
        (0, validate_1.validate)(this.launchSparksDisableEvent);
        this.launchSparksDisableEvent.reset(0.5);
        this.currentClip = this.rocketAnimationPlayer.getClip(this.currentLaunchAnimationName);
        (0, validate_1.validate)(this.currentClip);
        (0, validate_1.validate)(this.landingStartedEvent);
        (0, validate_1.validate)(this.takeOffCompleteEvent);
        this.landingStartedEvent.reset((this.currentClip.duration / this.currentClip.playbackSpeed) * 0.9);
        this.takeOffCompleteEvent.reset((this.currentClip.duration / this.currentClip.playbackSpeed) * 0.2);
    }
    takeOffCompleted() {
        print("Take Off Completed!");
    }
    landingStarted() {
        print("Landing Started!");
        (0, validate_1.validate)(this.rocketConf.exhaustControl);
        this.rocketConf.exhaustControl.turnOffExhausts();
    }
    __initialize() {
        super.__initialize();
        this.launchButton_interactable = null;
        this.animationAButton_interactable = null;
        this.animationBButton_interactable = null;
        this.animationCButton_interactable = null;
        this.currentLaunchAnimationName = "Base Layer Rocket 1";
        this.flightEndEventRegistration = null;
        this.engineStartedEvent = null;
        this.engineReadyEvent = null;
        this.rocketTakeOffEvent = null;
        this.takeOffCompleteEvent = null;
        this.landingStartedEvent = null;
        this.launchSparksDisableEvent = null;
        this.setupLaunchButtonCallbacks = () => {
            (0, validate_1.validate)(this.launchButton_interactable);
            this.launchButton_interactable.onTriggerEnd.add(this.onLaunchButton);
        };
        this.onLaunchButton = () => {
            (0, validate_1.validate)(this.engineStartedEvent);
            (0, validate_1.validate)(this.launchButton_interactable);
            (0, validate_1.validate)(this.launchButtonText);
            this.engineStartedEvent.reset(0);
            this.launchButton_interactable.enabled = false;
            this.launchButtonText.text = "Flight in Progress";
            this.launchButtonText.size = 40;
        };
        this.setupAnimationAButtonCallbacks = () => {
            (0, validate_1.validate)(this.animationAButton_interactable);
            this.animationAButton_interactable.onTriggerEnd.add(this.onAnimationAButton);
        };
        this.onAnimationAButton = () => {
            this.currentLaunchAnimationName = "Base Layer Rocket 1";
            this.subscribeToCurrentLaunchAnimationEndEvent();
            this.flightPathText.text = "Flight Path : A";
        };
        this.setupAnimationBButtonCallbacks = () => {
            (0, validate_1.validate)(this.animationBButton_interactable);
            this.animationBButton_interactable.onTriggerEnd.add(this.onAnimationBButton);
        };
        this.onAnimationBButton = () => {
            this.currentLaunchAnimationName = "Base Layer Rocket 2";
            this.subscribeToCurrentLaunchAnimationEndEvent();
            this.flightPathText.text = "Flight Path : B";
        };
        this.setupAnimationCButtonCallbacks = () => {
            (0, validate_1.validate)(this.animationCButton_interactable);
            this.animationCButton_interactable.onTriggerEnd.add(this.onAnimationCButton);
        };
        this.onAnimationCButton = () => {
            this.currentLaunchAnimationName = "Base Layer Rocket 3";
            this.subscribeToCurrentLaunchAnimationEndEvent();
            this.flightPathText.text = "Flight Path : C";
        };
        this.subscribeToCurrentLaunchAnimationEndEvent = () => {
            let currentAnimationClip = this.rocketAnimationPlayer.getClip(this.currentLaunchAnimationName);
            let flightEndTimestamp = currentAnimationClip.duration;
            currentAnimationClip.animation.createEvent(FLIGHT_END_EVENT_NAME, flightEndTimestamp);
            this.flightEndEventRegistration = this.rocketAnimationPlayer.onEvent.add(this.onAnimationEnd.bind(this));
        };
        this.onAnimationEnd = (eventData) => {
            if (eventData.eventName === FLIGHT_END_EVENT_NAME) {
                (0, validate_1.validate)(this.rocketConf.exhaustControl);
                (0, validate_1.validate)(this.launchButton_interactable);
                (0, validate_1.validate)(this.launchButtonText);
                this.rocketConf.exhaustControl.turnOffSmokes();
                this.launchButton_interactable.enabled = true;
                this.launchButtonText.text = "Launch!";
                this.launchButtonText.size = 48;
            }
        };
    }
};
exports.RocketLaunchControl = RocketLaunchControl;
exports.RocketLaunchControl = RocketLaunchControl = __decorate([
    component
], RocketLaunchControl);
//# sourceMappingURL=RocketLaunchControl.js.map