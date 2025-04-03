"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisplayStorageProperty = void 0;
var __selfType = requireType("./DisplayStorageProperty");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const SyncEntity_1 = require("../../Core/SyncEntity");
const SyncKitLogger_1 = require("../../Utils/SyncKitLogger");
const TAG = "DisplayStorageProperty";
/**
 * Displays a Storage Property value found on the specified Entity Target.
 * The Property Key should match the one being used by the storage property.
 */
let DisplayStorageProperty = class DisplayStorageProperty extends BaseScriptComponent {
    onAwake() {
        this.createEvent("OnStartEvent").bind(() => this.init());
    }
    updateValue(newValue, oldValue) {
        let newText = "";
        if (newValue === undefined) {
            newText = this.altText;
        }
        else if (this.useFormat) {
            newText = this.formatString
                .replace("{value}", newValue + "")
                .replace("{prevValue}", oldValue + "");
        }
        else {
            newText = "" + newValue;
        }
        this.text.text = newText;
    }
    init() {
        this.updateValue(undefined);
        this.syncEntity = SyncEntity_1.SyncEntity.getSyncEntityOnComponent(this.syncEntityScript);
        if (!this.syncEntity) {
            this.log.e("Could not find syncEntity!");
        }
        else {
            this.syncEntity.notifyOnReady(() => this.getProperty());
        }
    }
    getProperty() {
        const property = this.syncEntity.propertySet.getProperty(this.propertyKey);
        if (property) {
            this.updateValue(property.currentValue, null);
            property.onAnyChange.add((newValue, oldValue) => this.updateValue(newValue, oldValue));
        }
        else {
            this.log.e("Couldn't find property with key: " + this.propertyKey);
        }
    }
    __initialize() {
        super.__initialize();
        this.log = new SyncKitLogger_1.SyncKitLogger(TAG);
    }
};
exports.DisplayStorageProperty = DisplayStorageProperty;
exports.DisplayStorageProperty = DisplayStorageProperty = __decorate([
    component
], DisplayStorageProperty);
//# sourceMappingURL=DisplayStorageProperty.js.map