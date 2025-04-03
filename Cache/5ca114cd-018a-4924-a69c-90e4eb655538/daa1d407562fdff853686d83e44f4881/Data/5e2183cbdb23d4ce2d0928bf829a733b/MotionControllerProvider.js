"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Singleton_1 = require("../../../Decorators/Singleton");
const NativeLogger_1 = require("../../../Utils/NativeLogger");
/**
 * Provides motion related APIs
 */
let MotionControllerProvider = class MotionControllerProvider {
    constructor() {
        this.log = new NativeLogger_1.default("MotionControllerProvider");
    }
    /**
     * Tries to create an ScriptObject.MotionControllerModule using {@link ModuleLoader}.
     * Stores and returns the created object if it can be successfully created.
     * Returns undefined if error happens during creation.
     *
     * @returns the created {@link MotionControllerModule} or undefined if it cannot be
     * created.
     */
    getModule() {
        if (this.loadedModule !== undefined) {
            return this.loadedModule;
        }
        if (MotionController.MotionType === undefined) {
            return undefined;
        }
        try {
            this.loadedModule =
                require("LensStudio:MotionControllerModule");
            return this.loadedModule;
        }
        catch (error) {
            this.log.e(`Error creating module: ${error}`);
            return undefined;
        }
    }
};
MotionControllerProvider = __decorate([
    Singleton_1.Singleton
], MotionControllerProvider);
exports.default = MotionControllerProvider;
//# sourceMappingURL=MotionControllerProvider.js.map