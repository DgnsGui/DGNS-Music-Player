"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SessionControllerExample_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionControllerExample = void 0;
var __selfType = requireType("./SessionControllerExample");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const SessionController_1 = require("../Core/SessionController");
const SyncKitLogger_1 = require("../Utils/SyncKitLogger");
let SessionControllerExample = SessionControllerExample_1 = class SessionControllerExample extends BaseScriptComponent {
    onAwake() {
        let sessionController = SessionController_1.SessionController.getInstance();
        sessionController.notifyOnReady(() => this.onReady());
    }
    onReady() {
        this.log.i("Example Component: The session controller is ready!");
    }
    __initialize() {
        super.__initialize();
        this.log = new SyncKitLogger_1.SyncKitLogger(SessionControllerExample_1.name);
    }
};
exports.SessionControllerExample = SessionControllerExample;
exports.SessionControllerExample = SessionControllerExample = SessionControllerExample_1 = __decorate([
    component
], SessionControllerExample);
//# sourceMappingURL=SessionControllerExample.js.map