"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Test = void 0;
var __selfType = requireType("./Example Script [EDIT]");
function component(target) { target.getTypeName = function () { return __selfType; }; }
let Test = class Test extends BaseScriptComponent {
    onAwake() {
        this.cubeTrans = this.getSceneObject().getTransform();
        this.createEvent("OnStartEvent").bind(() => {
            this.startSurfaceDetection();
        });
    }
    startSurfaceDetection() {
        this.objectVisuals.enabled = false;
        this.surfaceDetection.startGroundCalibration((pos, rot) => {
            this.onSurfaceDetected(pos, rot);
        });
    }
    onSurfaceDetected(pos, rot) {
        this.objectVisuals.enabled = true;
        this.cubeTrans.setWorldPosition(pos);
        this.cubeTrans.setWorldRotation(rot);
    }
};
exports.Test = Test;
exports.Test = Test = __decorate([
    component
], Test);
//# sourceMappingURL=Example%20Script%20%5BEDIT%5D.js.map