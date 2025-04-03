"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionControllerComponent = void 0;
var __selfType = requireType("./SessionControllerComponent");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const SyncKitLogger_1 = require("../Utils/SyncKitLogger");
const VersionNumber_1 = require("../VersionNumber");
const SessionController_1 = require("./SessionController");
const TAG = "SessionControllerComponent";
let SessionControllerComponent = class SessionControllerComponent extends BaseScriptComponent {
    onAwake() {
        this.log.i(`Using Spectacles Sync Kit version ${VersionNumber_1.VersionNumber}`);
        SessionController_1.SessionController.getInstance().configure(this, this.connectedLensModule, this.locationCloudStorageModule, this.skipUiInStudio, this.isColocated, this.locatedAtComponent, this.landmarksVisual3d);
    }
    __initialize() {
        super.__initialize();
        this.log = new SyncKitLogger_1.SyncKitLogger(TAG);
    }
};
exports.SessionControllerComponent = SessionControllerComponent;
exports.SessionControllerComponent = SessionControllerComponent = __decorate([
    component
], SessionControllerComponent);
//# sourceMappingURL=SessionControllerComponent.js.map