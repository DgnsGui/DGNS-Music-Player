"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WorldMeshToggle_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorldMeshToggle = void 0;
var __selfType = requireType("./WorldMeshManager");
function component(target) { target.getTypeName = function () { return __selfType; }; }
let WorldMeshToggle = WorldMeshToggle_1 = class WorldMeshToggle extends BaseScriptComponent {
    onAwake() {
        // Vérifier que les tableaux ont la même longueur
        if (this.pinchButtons.length !== this.worldMeshes.length) {
            print("Erreur : Le nombre de PinchButtons et de WorldMeshes doit être identique");
            return;
        }
        // Vérifier que tous les éléments sont définis
        for (let i = 0; i < this.pinchButtons.length; i++) {
            if (!this.pinchButtons[i]) {
                print(`Erreur : PinchButton manquant à l'index ${i}`);
                return;
            }
            if (!this.worldMeshes[i]) {
                print(`Erreur : WorldMesh manquant à l'index ${i}`);
                return;
            }
            // Vérifier que le PinchButton a la propriété onButtonPinched
            if (!this.pinchButtons[i].onButtonPinched) {
                print(`Erreur : Le PinchButton à l'index ${i} n'a pas de propriété onButtonPinched. Vérifiez qu'il s'agit d'un composant PinchButton valide.`);
                return;
            }
        }
        // Ajouter ce contrôleur au registre statique
        WorldMeshToggle_1.activeControllers.push(this);
        // Initialiser les états de visibilité et configurer les événements
        this.setupButtonEvents();
    }
    setupButtonEvents() {
        this.pinchButtons.forEach((button, index) => {
            const worldMesh = this.worldMeshes[index];
            // Désactiver tous les world meshes par défaut
            worldMesh.enabled = false;
            this.visibilityStates[index] = false;
            // Créer le gestionnaire d'événements
            const handlePinch = (event) => {
                // Vérifier si le bouton est activé avant de traiter l'événement
                if (!button.enabled) {
                    print(`PinchButton à l'index ${index} est désactivé, action ignorée.`);
                    return;
                }
                this.toggleWorldMeshExclusively(index);
            };
            // Ajouter le gestionnaire d'événements au bouton
            try {
                button.onButtonPinched.add(handlePinch);
                this.handlePinches[index] = handlePinch;
            }
            catch (error) {
                print(`Erreur lors de l'ajout de l'écouteur d'événements pour le PinchButton à l'index ${index} : ${error}`);
            }
        });
    }
    toggleWorldMeshExclusively(index) {
        const worldMesh = this.worldMeshes[index];
        if (this.visibilityStates[index]) {
            // Si déjà visible, désactiver
            this.setVisibility(index, false);
            print(`World Mesh "${worldMesh.name}" désactivé`);
        }
        else {
            // Désactiver tous les autres world meshes dans tous les contrôleurs
            WorldMeshToggle_1.activeControllers.forEach(controller => {
                controller.worldMeshes.forEach((mesh, i) => {
                    if (controller !== this || i !== index) {
                        controller.setVisibility(i, false);
                    }
                });
            });
            // Activer ce world mesh
            this.setVisibility(index, true);
            print(`World Mesh "${worldMesh.name}" activé exclusivement`);
        }
    }
    setVisibility(index, visible) {
        this.visibilityStates[index] = visible;
        this.worldMeshes[index].enabled = visible;
    }
    // Nettoyer les écouteurs d'événements lors de la destruction
    destroy() {
        // Retirer ce contrôleur du registre statique
        const controllerIndex = WorldMeshToggle_1.activeControllers.indexOf(this);
        if (controllerIndex !== -1) {
            WorldMeshToggle_1.activeControllers.splice(controllerIndex, 1);
        }
        // Retirer les écouteurs d'événements
        this.pinchButtons.forEach((button, index) => {
            if (button && this.handlePinches[index] && button.onButtonPinched) {
                button.onButtonPinched.remove(this.handlePinches[index]);
            }
        });
        super.destroy();
    }
    __initialize() {
        super.__initialize();
        this.visibilityStates = [];
        this.handlePinches = [];
    }
};
exports.WorldMeshToggle = WorldMeshToggle;
// Registre statique de tous les contrôleurs pour la coordination
WorldMeshToggle.activeControllers = [];
exports.WorldMeshToggle = WorldMeshToggle = WorldMeshToggle_1 = __decorate([
    component
], WorldMeshToggle);
//# sourceMappingURL=WorldMeshManager.js.map