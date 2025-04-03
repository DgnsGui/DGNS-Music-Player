"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExhaustControls = void 0;
var __selfType = requireType("./ExhaustControls");
function component(target) { target.getTypeName = function () { return __selfType; }; }
/**
 * This class manages the exhaust and smoke effects for a scene. It initializes the materials and VFX components for the exhausts and smokes, and provides methods to control their states.
 *
 */
let ExhaustControls = class ExhaustControls extends BaseScriptComponent {
    onAwake() {
        this.initExhaustMaterials();
        this.initSmokeVFXs();
        this.turnOffExhausts();
        this.turnOffSmokes();
    }
    __initialize() {
        super.__initialize();
        this.exhaustFireMaterials = [];
        this.exhaustGlowMaterials = [];
        this.smokeVFXs = [];
        this.initExhaustMaterials = () => {
            for (let i = 0; i < this.exhausts.length; i++) {
                this.exhaustFireMaterials.push(this.exhausts[i].getChild(0).getComponent("RenderMeshVisual")
                    .mainMaterial);
                this.exhaustGlowMaterials.push(this.exhausts[i]
                    .getChild(0)
                    .getChild(0)
                    .getComponent("RenderMeshVisual").mainMaterial);
            }
        };
        this.initSmokeVFXs = () => {
            for (let i = 0; i < this.smokes.length; i++) {
                this.smokeVFXs.push(this.smokes[i].getComponent("Component.VFXComponent"));
            }
        };
        this.engineReady = () => {
            for (let i = 0; i < this.exhausts.length; i++) {
                this.exhausts[i].enabled = true;
                this.exhaustFireMaterials[i].mainPass.fire_scale = 1.0;
                this.exhaustGlowMaterials[i].mainPass.glow_scale = 1.0;
            }
        };
        this.turnOnExhausts = () => {
            for (let i = 0; i < this.exhausts.length; i++) {
                this.exhausts[i].enabled = true;
                this.exhaustFireMaterials[i].mainPass.fire_scale = 0.15;
                this.exhaustGlowMaterials[i].mainPass.glow_scale = 0.15;
            }
        };
        this.turnOffExhausts = () => {
            for (let i = 0; i < this.exhausts.length; i++) {
                this.exhausts[i].enabled = false;
                this.exhaustFireMaterials[i].mainPass.fire_scale = 0.0;
                this.exhaustGlowMaterials[i].mainPass.glow_scale = 0.0;
            }
        };
        this.turnOnSmokes = () => {
            for (let i = 0; i < this.smokes.length; i++) {
                this.smokes[i].enabled = true;
            }
        };
        this.turnOffSmokes = () => {
            for (let i = 0; i < this.smokes.length; i++) {
                this.smokes[i].enabled = false;
            }
        };
        this.setEngineSmokesValue = (value) => {
            for (let i = 0; i < this.smokes.length; i++) {
                const particles = this.smokeVFXs[i].asset.properties;
                particles["particlesReduce"] = value;
            }
        };
    }
};
exports.ExhaustControls = ExhaustControls;
exports.ExhaustControls = ExhaustControls = __decorate([
    component
], ExhaustControls);
//# sourceMappingURL=ExhaustControls.js.map