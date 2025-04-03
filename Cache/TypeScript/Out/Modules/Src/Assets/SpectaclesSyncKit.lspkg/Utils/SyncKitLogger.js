"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncKitLogger = void 0;
const NativeLogger_1 = require("../SpectaclesInteractionKit/Utils/NativeLogger");
const SyncKitLogLevelProvider_1 = require("./SyncKitLogLevelProvider");
/**
 * @name Text Logger Component
 * @description Logs text to a text component
 */
class SyncKitLogger extends NativeLogger_1.default {
    constructor(tag) {
        super(tag, SyncKitLogLevelProvider_1.default.getInstance());
    }
}
exports.SyncKitLogger = SyncKitLogger;
//# sourceMappingURL=SyncKitLogger.js.map