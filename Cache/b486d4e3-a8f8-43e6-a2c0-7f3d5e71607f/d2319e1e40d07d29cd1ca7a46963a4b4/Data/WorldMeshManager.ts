import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { SIK } from 'SpectaclesInteractionKit/SIK';

// Déclarations pour les décorateurs
interface LS {
    input: PropertyDecorator;
    hint(hint: string): PropertyDecorator;
    component: ClassDecorator;
}

declare const LS: LS;

// Use @component decorator and extend BaseScriptComponent
@LS.component
export class WorldMeshToggle extends BaseScriptComponent {
    // Tableau des PinchButtons
    @LS.input
    @LS.hint('Ajoutez les PinchButtons ici')
    pinchButtons: PinchButton[] = [];

    // Tableau des WorldMeshes (SceneObjects)
    @LS.input
    @LS.hint('Ajoutez les SceneObjects contenant les WorldMeshes ici')
    worldMeshes: SceneObject[] = [];

    onAwake() {
        this.setupButtonEvents();
    }

    private setupButtonEvents() {
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

    private toggleWorldMesh(worldMesh: SceneObject) {
        worldMesh.enabled = !worldMesh.enabled;
        print(`World Mesh est maintenant ${worldMesh.enabled ? 'activé' : 'désactivé'}`);
    }
}