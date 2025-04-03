"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncKitLogLevelConfiguration = void 0;
var __selfType = requireType("./SyncKitLogLevelConfiguration");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const LogLevelConfiguration_1 = require("../SpectaclesInteractionKit/Core/LogLevelConfiguration/LogLevelConfiguration");
const SyncKitLogLevelProvider_1 = require("./SyncKitLogLevelProvider");
/**
 * Allows the user to select the log level filter for Spectacles Sync Kit types from a lens studio component.
 */
let SyncKitLogLevelConfiguration = class SyncKitLogLevelConfiguration extends LogLevelConfiguration_1.LogLevelConfiguration {
    __initialize() {
        super.__initialize();
        this.SyncKitLogLevelProvider = SyncKitLogLevelProvider_1.default.getInstance();
        this.SyncKitLogLevelProvider.logLevel = this.logLevelFilter;
    }
};
exports.SyncKitLogLevelConfiguration = SyncKitLogLevelConfiguration;
exports.SyncKitLogLevelConfiguration = SyncKitLogLevelConfiguration = __decorate([
    component
], SyncKitLogLevelConfiguration);
//# sourceMappingURL=SyncKitLogLevelConfiguration.js.map