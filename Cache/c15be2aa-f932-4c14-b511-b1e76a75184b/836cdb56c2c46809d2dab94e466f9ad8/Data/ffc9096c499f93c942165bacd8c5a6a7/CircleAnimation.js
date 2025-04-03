"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircleAnimation = void 0;
var __selfType = requireType("./CircleAnimation");
function component(target) { target.getTypeName = function () { return __selfType; }; }
let CircleAnimation = class CircleAnimation extends BaseScriptComponent {
    onAwake() {
        this.startSize = this.calRenderer.mainPass.StartSize;
        this.calRenderer.mainPass.Amount = 0;
        this.calRenderer.mainPass.CurrSize = this.startSize;
    }
    setLoadAmount(amount) {
        this.desiredLoadAmount = amount;
        if (this.desiredLoadAmount == 1) {
            this.startCompleteAnimTime = getTime();
        }
    }
    update() {
        var _a;
        const currAmount = this.calRenderer.mainPass.Amount;
        if (currAmount < .01) {
            this.calRenderer.mainPass.CurrSize = this.PingPong(this.startSize * 2, this.startSize * 3, getTime() * .75);
        }
        else if (currAmount > .99) {
            if (!this.audioPlayed) {
                this.audioPlayed = true;
                this.audio.play(1);
            }
            this.calRenderer.mainPass.CurrSize = this.PingPong(0.095, 0, (getTime() - this.startCompleteAnimTime) * 1);
            if (this.calRenderer.mainPass.CurrSize < .001) {
                this.calRenderer.mainPass.CurrSize = 0;
                (_a = this.onCompleteCallback) === null || _a === void 0 ? void 0 : _a.call(this);
                this.removeEvent(this.updateEvent);
            }
        }
        this.calRenderer.mainPass.Amount = MathUtils.lerp(currAmount, this.desiredLoadAmount, getDeltaTime() * 6);
    }
    PingPong(min, max, t) {
        var range = max - min;
        var freq = t * (Math.PI * 2);
        return min + (0.5 * (1 + Math.sin(freq)) * range);
    }
    startCalibration(callback) {
        this.audioPlayed = false;
        this.onCompleteCallback = callback;
        this.calRenderer.mainPass.Amount = 0;
        this.desiredLoadAmount = 0;
        this.updateEvent = this.createEvent("UpdateEvent");
        this.updateEvent.bind(() => {
            this.update();
        });
    }
    __initialize() {
        super.__initialize();
        this.startSize = 0;
        this.desiredLoadAmount = 0;
        this.startCompleteAnimTime = 0;
        this.updateEvent = null;
        this.audioPlayed = false;
        this.onCompleteCallback = null;
    }
};
exports.CircleAnimation = CircleAnimation;
exports.CircleAnimation = CircleAnimation = __decorate([
    component
], CircleAnimation);
//# sourceMappingURL=CircleAnimation.js.map