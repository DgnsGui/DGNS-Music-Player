"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorldMeshToggle = void 0;
class WorldMeshToggle extends ScriptComponent {
    constructor() {
        super(...arguments);
        // Array of objects containing pinch buttons and their corresponding world meshes
        this.togglePairs = [];
    }
    onAwake() {
        this.setupButtonEvents();
    }
    setupButtonEvents() {
        this.togglePairs.forEach((pair, index) => {
            if (!pair.button || !pair.worldMesh) {
                print(`Warning: Missing button or world mesh at index ${index}`);
                return;
            }
            pair.worldMesh.enabled = false;
            pair.button.onButtonPinched.add(() => {
                this.toggleWorldMesh(pair.worldMesh);
            });
        });
    }
    toggleWorldMesh(worldMesh) {
        worldMesh.enabled = !worldMesh.enabled;
        print(`World Mesh is now ${worldMesh.enabled ? 'enabled' : 'disabled'}`);
    }
}
exports.WorldMeshToggle = WorldMeshToggle;
__decorate([
    LS.input,
    LS.hint('Add PinchButton and WorldMesh pairs here')
], WorldMeshToggle.prototype, "togglePairs", void 0);
//# sourceMappingURL=WorldMeshManager.js.map