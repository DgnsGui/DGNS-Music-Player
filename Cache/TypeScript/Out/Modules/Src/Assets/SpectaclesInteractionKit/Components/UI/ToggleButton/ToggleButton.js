"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToggleButton = void 0;
var __selfType = requireType("./ToggleButton");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const InspectorCallbacks_1 = require("../../../Utils/InspectorCallbacks");
const ReplayEvent_1 = require("../../../Utils/ReplayEvent");
const Interactable_1 = require("../../Interaction/Interactable/Interactable");
/**
 * This class provides basic toggle functionality for a prefab toggle button. It manages the toggle state and provides methods to handle toggle events and update the button's visual state.
 */
let ToggleButton = class ToggleButton extends BaseScriptComponent {
    onAwake() {
        this.interactable = this.getSceneObject().getComponent(Interactable_1.Interactable.getTypeName());
        this.createEvent("OnStartEvent").bind(() => {
            if (!this.interactable) {
                throw new Error("Toggle Button requires an Interactable Component on the same Scene object in order to work - please ensure one is added.");
            }
            this.interactable.onTriggerEnd.add(() => {
                if (this.enabled) {
                    this.toggleState();
                }
            });
            this.onStateChangedEvent.invoke(this._isToggledOn);
        });
        if (this.editEventCallbacks && this.customFunctionForOnStateChanged) {
            this.onStateChanged.add((0, InspectorCallbacks_1.createCallback)(this.customFunctionForOnStateChanged, this.onStateChangedFunctionNames));
        }
        this.refreshVisual();
    }
    /**
     * Toggles the state of the button
     */
    toggle() {
        this.toggleState();
    }
    /**
     * @returns the icon to be shown when the button is toggled on
     */
    get onIcon() {
        var _a;
        return (_a = this._onIcon) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * @param iconObject - the icon to be shown when the button is toggled on
     */
    set onIcon(iconObject) {
        this._onIcon = iconObject;
        this.refreshVisual();
    }
    /**
     * @returns the icon to be shown when the button is toggled off
     */
    get offIcon() {
        var _a;
        return (_a = this._offIcon) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * @param iconObject - the icon to be shown when the button is toggled off
     */
    set offIcon(iconObject) {
        this._offIcon = iconObject;
        this.refreshVisual();
    }
    /**
     * @returns the current toggle state of the button
     */
    get isToggledOn() {
        return this._isToggledOn;
    }
    /**
     * @param toggleOn - the new state of the button, invoking the toggle event if different than current state.
     */
    set isToggledOn(toggleOn) {
        // Return if the requested state is the same as the current state (no change)
        if (toggleOn === this._isToggledOn) {
            return;
        }
        this.toggleState();
    }
    refreshVisual() {
        if (this._onIcon !== undefined) {
            this._onIcon.enabled = this._isToggledOn;
        }
        if (this._offIcon !== undefined) {
            this._offIcon.enabled = !this._isToggledOn;
        }
    }
    toggleState() {
        this._isToggledOn = !this._isToggledOn;
        this.refreshVisual();
        this.onStateChangedEvent.invoke(this._isToggledOn);
    }
    __initialize() {
        super.__initialize();
        this.interactable = null;
        this.onStateChangedEvent = new ReplayEvent_1.default();
        this.onStateChanged = this.onStateChangedEvent.publicApi();
    }
};
exports.ToggleButton = ToggleButton;
exports.ToggleButton = ToggleButton = __decorate([
    component
], ToggleButton);
//# sourceMappingURL=ToggleButton.js.map