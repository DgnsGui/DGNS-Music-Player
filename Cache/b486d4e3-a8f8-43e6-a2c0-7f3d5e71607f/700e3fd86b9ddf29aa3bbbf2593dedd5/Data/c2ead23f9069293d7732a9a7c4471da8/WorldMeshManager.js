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
        // Tableau des PinchButtons
        this.pinchButtons = [];
        // Tableau des WorldMeshes (SceneObjects)
        this.worldMeshes = [];
    }
    onAwake() {
        this.setupButtonEvents();
    }
    setupButtonEvents() {
        // Vérifier que les tableaux ont la même longueur
        if (this.pinchButtons.length !== this.worldMeshes.length) {
            print("Erreur : Le nombre de PinchButtons et de WorldMeshes doit être identique");
            return;
        }
        // Configurer les événements pour chaque paire
        this.pinchButtons.forEach((button, index) => {
            const worldMesh = this.worldMeshes[index];
            if (!button || !worldMesh) {
                print(`Warning: Élément manquant à l'index ${index}`);
                return;
            }
            // Désactiver le world mesh au démarrage
            worldMesh.enabled = false;
            // Lier l'événement de pincement
            button.onButtonPinched.add(() => {
                this.toggleWorldMesh(worldMesh);
            });
        });
    }
    toggleWorldMesh(worldMesh) {
        worldMesh.enabled = !worldMesh.enabled;
        print(`World Mesh est maintenant ${worldMesh.enabled ? 'activé' : 'désactivé'}`);
    }
}
exports.WorldMeshToggle = WorldMeshToggle;
__decorate([
    LS.input,
    LS.hint('Ajoutez les PinchButtons ici')
], WorldMeshToggle.prototype, "pinchButtons", void 0);
__decorate([
    LS.input,
    LS.hint('Ajoutez les SceneObjects contenant les WorldMeshes ici')
], WorldMeshToggle.prototype, "worldMeshes", void 0);
//# sourceMappingURL=WorldMeshManager.js.map