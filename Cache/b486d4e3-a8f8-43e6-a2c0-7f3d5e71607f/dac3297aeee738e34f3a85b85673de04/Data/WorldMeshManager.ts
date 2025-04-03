import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { InteractorEvent } from 'SpectaclesInteractionKit/Core/Interactor/InteractorEvent';

@component
export class WorldMeshToggle extends BaseScriptComponent {
    // Tableau des PinchButtons
    @input('Component.ScriptComponent[]')
    @hint('Ajoutez les PinchButtons ici')
    pinchButtons: PinchButton[] = [];

    // Tableau des WorldMeshes (SceneObjects)
    @input('SceneObject[]')
    @hint('Ajoutez les SceneObjects contenant les WorldMeshes ici')
    worldMeshes: SceneObject[] = [];

    // Garder une trace de l'état de visibilité pour chaque world mesh
    private visibilityStates: boolean[] = [];

    // Stocker les références des gestionnaires d'événements pour le nettoyage
    private handlePinches: ((event: InteractorEvent) => void)[] = [];

    // Registre statique de tous les contrôleurs pour la coordination
    private static activeControllers: WorldMeshToggle[] = [];

    onAwake(): void {
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
        WorldMeshToggle.activeControllers.push(this);

        // Initialiser les états de visibilité et configurer les événements
        this.setupButtonEvents();
    }

    private setupButtonEvents(): void {
        this.pinchButtons.forEach((button, index) => {
            const worldMesh = this.worldMeshes[index];

            // Désactiver tous les world meshes par défaut
            worldMesh.enabled = false;
            this.visibilityStates[index] = false;

            // Créer le gestionnaire d'événements
            const handlePinch = (event: InteractorEvent) => {
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
            } catch (error) {
                print(`Erreur lors de l'ajout de l'écouteur d'événements pour le PinchButton à l'index ${index} : ${error}`);
            }
        });
    }

    private toggleWorldMeshExclusively(index: number): void {
        const worldMesh = this.worldMeshes[index];

        if (this.visibilityStates[index]) {
            // Si déjà visible, désactiver
            this.setVisibility(index, false);
            print(`World Mesh "${worldMesh.name}" désactivé`);
        } else {
            // Désactiver tous les autres world meshes dans tous les contrôleurs
            WorldMeshToggle.activeControllers.forEach(controller => {
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

    private setVisibility(index: number, visible: boolean): void {
        this.visibilityStates[index] = visible;
        this.worldMeshes[index].enabled = visible;
    }

    // Nettoyer les écouteurs d'événements lors de la destruction
    destroy(): void {
        // Retirer ce contrôleur du registre statique
        const controllerIndex = WorldMeshToggle.activeControllers.indexOf(this);
        if (controllerIndex !== -1) {
            WorldMeshToggle.activeControllers.splice(controllerIndex, 1);
        }

        // Retirer les écouteurs d'événements
        this.pinchButtons.forEach((button, index) => {
            if (button && this.handlePinches[index] && button.onButtonPinched) {
                button.onButtonPinched.remove(this.handlePinches[index]);
            }
        });

        super.destroy();
    }
}