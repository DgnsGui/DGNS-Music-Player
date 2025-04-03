"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RocketScrollViewItem = void 0;
var __selfType = requireType("./RocketScrollViewItem");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const Interactable_1 = require("../../../Components/Interaction/Interactable/Interactable");
const SceneObjectUtils_1 = require("../../../Utils/SceneObjectUtils");
const validate_1 = require("../../../Utils/validate");
/**
 * This class represents an item in the rocket scroll view. It handles interactions and communicates with the RocketConfigurator to update the rocket configuration.
 *
 */
let RocketScrollViewItem = class RocketScrollViewItem extends BaseScriptComponent {
    onAwake() { }
    init(rocketConfigurator) {
        this.rocketConfigurator = rocketConfigurator;
        this.registerRocketListItemBacking();
        if (isNull(this.rocketConfigurator))
            throw new Error("RocketConfigurator is null!");
        (0, validate_1.validate)(this.backingImage);
        this.interactable = this.backingImage.sceneObject.getComponent(Interactable_1.Interactable.getTypeName());
        if (isNull(this.interactable))
            throw new Error("Interactable component not found!");
        this.setupCallbacks();
    }
    __initialize() {
        super.__initialize();
        this.interactable = null;
        this.rocketConfigurator = null;
        this.setupCallbacks = () => {
            (0, validate_1.validate)(this.interactable);
            this.interactable.onTriggerEnd.add(this.onTriggerEndEvent);
        };
        this.onTriggerEndEvent = () => {
            (0, validate_1.validate)(this.rocketConfigurator);
            this.rocketConfigurator.setRocketPartSection(this.style.text, this.item.text);
        };
        this.registerRocketListItemBacking = () => {
            let backingObject = (0, SceneObjectUtils_1.findSceneObjectByName)(this.sceneObject, "Background");
            (0, validate_1.validate)(backingObject);
            this.backingImage = backingObject.getComponent("Image");
            (0, validate_1.validate)(this.backingImage, "Backing image is undefined!");
            this.backingImage.mainMaterial = this.backingImage.mainMaterial.clone();
            (0, validate_1.validate)(this.rocketConfigurator);
            this.rocketConfigurator.registerRocketListItemBacking(this.style.text, this.item.text, this.backingImage);
        };
    }
};
exports.RocketScrollViewItem = RocketScrollViewItem;
exports.RocketScrollViewItem = RocketScrollViewItem = __decorate([
    component
], RocketScrollViewItem);
//# sourceMappingURL=RocketScrollViewItem.js.map