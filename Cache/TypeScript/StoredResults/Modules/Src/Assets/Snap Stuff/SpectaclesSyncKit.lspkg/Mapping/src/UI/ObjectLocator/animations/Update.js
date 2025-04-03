"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Update_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Update = void 0;
var __selfType = requireType("./Update");
function component(target) { target.getTypeName = function () { return __selfType; }; }
let Update = Update_1 = class Update extends BaseScriptComponent {
    static register(callback) {
        if (!Update_1.initialized) {
            global.scene
                .createSceneObject("Update")
                .createComponent(Update_1.getTypeName());
        }
        this.callbacks.push(callback);
    }
    static onUpdate(time, deltaTime) {
        let i = 0;
        while (i < Update_1.callbacks.length) {
            if (Update_1.callbacks[i] &&
                Update_1.callbacks[i](time, deltaTime) === false) {
                Update_1.callbacks.splice(i, 1);
            }
            else {
                i++;
            }
        }
    }
    onAwake() {
        if (!Update_1.initialized) {
            this.createEvent("UpdateEvent").bind((event) => this.onUpdate(event));
            Update_1.initialized = true;
        }
    }
    onUpdate(event) {
        Update_1.onUpdate(getTime(), event.getDeltaTime());
    }
};
exports.Update = Update;
Update.initialized = false;
Update.callbacks = [];
exports.Update = Update = Update_1 = __decorate([
    component
], Update);
//# sourceMappingURL=Update.js.map