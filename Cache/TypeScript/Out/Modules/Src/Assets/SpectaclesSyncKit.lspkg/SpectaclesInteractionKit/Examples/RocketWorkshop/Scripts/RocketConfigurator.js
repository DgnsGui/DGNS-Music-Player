"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RocketConfigurator = void 0;
var __selfType = requireType("./RocketConfigurator");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const ExhaustControls_1 = require("./ExhaustControls");
const validate_1 = require("../../../Utils/validate");
/**
 * This class is responsible for configuring the rocket by setting up its parts and managing the exhaust controls. It initializes the rocket sections and provides methods to set rocket part sections.
 *
 */
let RocketConfigurator = class RocketConfigurator extends BaseScriptComponent {
    onAwake() {
        this.setUpRocket();
    }
    setBackingColors(map, style) {
        map.forEach((image, key) => {
            if (key === style) {
                // active
                image.mainMaterial.mainPass.baseTex = this.activeBackingTexture;
            }
            else {
                // inactive
                image.mainMaterial.mainPass.baseTex = this.inactiveBackingTexture;
            }
        });
    }
    __initialize() {
        super.__initialize();
        this.topSection = null;
        this.middleSection = null;
        this.bottomSection = null;
        this.exhaustControl = null;
        this.noseConeBackingImages = new Map();
        this.bodyTubeBackingImages = new Map();
        this.finsBackingImages = new Map();
        this.activeBackingTexture = requireAsset("../../../Assets/Textures/Rectangle-Active.png");
        this.inactiveBackingTexture = requireAsset("../../../Assets/Textures/Rectangle-Inactive.png");
        this.setUpRocket = () => {
            for (let i = 0; i < this.allRocketParts.length; i++) {
                if (this.allRocketParts[i].name === "Space Age Nose Cone") {
                    this.topSection = this.allRocketParts[i].instantiate(this.rocket);
                }
                if (this.allRocketParts[i].name === "Space Age Body Tube") {
                    this.middleSection = this.allRocketParts[i].instantiate(this.rocket);
                }
                if (this.allRocketParts[i].name === "Space Age Fins") {
                    this.bottomSection = this.allRocketParts[i].instantiate(this.rocket);
                }
            }
        };
        this.setRocketPartSection = (style, item) => {
            if (isNull(this.topSection))
                throw new Error("Top section is null!");
            if (isNull(this.middleSection))
                throw new Error("Middle section is null!");
            if (isNull(this.bottomSection))
                throw new Error("Bottom section is null!");
            const combinedName = style + " " + item;
            let rocketPart;
            if (item === "Nose Cone") {
                if (this.topSection !== null)
                    this.topSection.destroy();
                for (let i = 0; i < this.allRocketParts.length; i++) {
                    if (combinedName === this.allRocketParts[i].name) {
                        rocketPart = this.allRocketParts[i].instantiate(this.rocket);
                    }
                }
                if (rocketPart !== undefined) {
                    this.topSection = rocketPart;
                }
                else {
                    throw new Error("Rocket part is undefined!");
                }
            }
            else if (item === "Body Tube") {
                if (this.middleSection !== null)
                    this.middleSection.destroy();
                for (let i = 0; i < this.allRocketParts.length; i++) {
                    if (combinedName === this.allRocketParts[i].name) {
                        rocketPart = this.allRocketParts[i].instantiate(this.rocket);
                    }
                }
                if (rocketPart !== undefined) {
                    this.middleSection = rocketPart;
                }
                else {
                    throw new Error("Rocket part is undefined!");
                }
            }
            else if (item === "Fins") {
                if (this.bottomSection !== null)
                    this.bottomSection.destroy();
                for (let i = 0; i < this.allRocketParts.length; i++) {
                    if (combinedName === this.allRocketParts[i].name) {
                        rocketPart = this.allRocketParts[i].instantiate(this.rocket);
                    }
                }
                if (rocketPart !== undefined) {
                    this.bottomSection = rocketPart;
                }
                else {
                    throw new Error("Rocket part is undefined!");
                }
            }
            this.setBackingColorsByPartType(style, item);
        };
        this.registerRocketListItemBacking = (style, item, backing) => {
            if (item === "Nose Cone") {
                this.noseConeBackingImages.set(style, backing);
            }
            else if (item === "Body Tube") {
                this.bodyTubeBackingImages.set(style, backing);
            }
            else if (item === "Fins") {
                this.finsBackingImages.set(style, backing);
            }
            if (style === "Space Age") {
                backing.mainMaterial.mainPass.baseTex = this.activeBackingTexture;
            }
        };
        this.setBackingColorsByPartType = (style, item) => {
            if (item === "Nose Cone") {
                this.setBackingColors(this.noseConeBackingImages, style);
            }
            else if (item === "Body Tube") {
                this.setBackingColors(this.bodyTubeBackingImages, style);
            }
            else if (item === "Fins") {
                this.setBackingColors(this.finsBackingImages, style);
            }
        };
        this.getExhaustControl = () => {
            (0, validate_1.validate)(this.bottomSection);
            this.exhaustControl = this.bottomSection.getComponent(ExhaustControls_1.ExhaustControls.getTypeName());
        };
    }
};
exports.RocketConfigurator = RocketConfigurator;
exports.RocketConfigurator = RocketConfigurator = __decorate([
    component
], RocketConfigurator);
//# sourceMappingURL=RocketConfigurator.js.map