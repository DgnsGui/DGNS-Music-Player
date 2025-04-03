import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { InteractorEvent } from 'SpectaclesInteractionKit/Core/Interactor/InteractorEvent';

@component
export class MusicPlayerManager extends BaseScriptComponent {
    // ... (les inputs existants restent inchangés)

    // Ajout du composant de manipulation pour la sphère
    @input('Component.ScriptComponent')
    @hint('Composant de manipulation pour la sphère terrestre')
    earthManipulator: PinchManipulator;

    // ... (les autres inputs restent inchangés)

    // Variables privées
    private currentTrackIndex: number = -1;
    private isPlaying: boolean = false;
    private isPaused: boolean = false;
    private isRepeatEnabled: boolean = false;
    private isShuffleEnabled: boolean = false;
    private shouldAutoPlay: boolean = false;
    private isManualStop: boolean = false;
    private trackStartTime: number = 0;
    private currentPlaybackTime: number = 0;
    private audioInitialized: boolean = false;
    private currentActivePrefab: SceneObject | null = null;
    private lastPinchTime: number = 0;
    private isManipulating: boolean = false; // Nouvelle variable pour suivre l'état de manipulation

    // Callbacks existants
    private onPlayPauseCallback: (event: InteractorEvent) => void;
    private onNextTrackCallback: (event: InteractorEvent) => void;
    private onPrevTrackCallback: (event: InteractorEvent) => void;
    private onRepeatCallback: (event: InteractorEvent) => void;
    private onShuffleCallback: (event: InteractorEvent) => void;
    private onStopCallback: (event: InteractorEvent) => void;
    private onTrackFinishedCallback: (audioComponent: AudioComponent) => void;

    // Nouveaux callbacks pour la manipulation
    private onManipulationStartCallback: () => void;
    private onManipulationUpdateCallback: (event: ManipulationEvent) => void;
    private onManipulationEndCallback: () => void;

    onAwake(): void {
        // Validation des inputs (inchangée)
        if (!this.tracks || this.tracks.some(track => track == null)) {
            print("Error: All tracks must be defined.");
            return;
        }
        // ... (le reste de la validation reste inchangé)

        this.setupCallbacks();
        this.setupProgressBar();
        this.setupManipulationCallbacks(); // Ajout de la configuration des callbacks de manipulation

        // Création de l'événement UpdateEvent (inchangée)
        this.createEvent("UpdateEvent").bind(() => {
            this.updatePlayer();
            this.updateSphereRotation();
        });

        this.updateActivePrefab();
        print("MusicPlayerManager initialized with " + this.tracks.length + " tracks, awaiting user input.");
    }

    private setupCallbacks(): void {
        // ... (le code existant pour les boutons reste inchangé)
    }

    /** Nouvelle méthode pour configurer les callbacks de manipulation */
    private setupManipulationCallbacks(): void {
        if (this.earthManipulator) {
            this.onManipulationStartCallback = () => this.onManipulationStart();
            this.onManipulationUpdateCallback = (event: ManipulationEvent) => this.onManipulationUpdate(event);
            this.onManipulationEndCallback = () => this.onManipulationEnd();

            this.earthManipulator.onManipulationStart.add(this.onManipulationStartCallback);
            this.earthManipulator.onManipulationUpdate.add(this.onManipulationUpdateCallback);
            this.earthManipulator.onManipulationEnd.add(this.onManipulationEndCallback);
            print("Manipulation callbacks set for earthSphere");
        } else {
            print("Warning: earthManipulator not assigned, time skip feature will not work.");
        }
    }

    /** Début de la manipulation : pause si lecture en cours */
    private onManipulationStart(): void {
        this.isManipulating = true;
        if (this.isPlaying) {
            this.pauseTrack();
        }
    }

    /** Mise à jour pendant la manipulation : contrainte de la position et mise à jour du timecode */
    private onManipulationUpdate(event: ManipulationEvent): void {
        const earthTransform = this.earthSphere.getTransform();
        const barTransform = this.progressBar.getTransform();
        const barScale = barTransform.getLocalScale();
        const halfLength = barScale.x / 2;

        const currentPos = earthTransform.getLocalPosition();
        let newX = Math.max(-halfLength, Math.min(halfLength, currentPos.x));

        earthTransform.setLocalPosition(new vec3(newX, currentPos.y, currentPos.z));

        // Mise à jour du timecode en temps réel
        const progress = (newX + halfLength) / barScale.x;
        const totalTime = this.audioComponent.duration || 0;
        const currentTime = progress * totalTime;
        if (this.timecodeText) {
            this.timecodeText.text = this.formatTime(currentTime) + " / " + this.formatTime(totalTime);
        }
    }

    /** Fin de la manipulation : calcul du nouveau temps et reprise de la lecture */
    private onManipulationEnd(): void {
        this.isManipulating = false;

        const earthTransform = this.earthSphere.getTransform();
        const barTransform = this.progressBar.getTransform();
        const barScale = barTransform.getLocalScale();
        const halfLength = barScale.x / 2;
        const currentPos = earthTransform.getLocalPosition();
        const progress = (currentPos.x + halfLength) / barScale.x;
        const totalTime = this.audioComponent.duration || 0;
        const newTime = progress * totalTime;

        this.currentPlaybackTime = newTime;
        this.trackStartTime = getTime() - newTime;

        if (!this.isPaused) {
            this.playTrack();
        }
    }

    private updatePlayer(): void {
        if (!this.audioInitialized) {
            if (this.timecodeText) {
                this.timecodeText.text = "00:00 / 00:00";
            }
            return;
        }

        if (this.timecodeText && this.audioComponent && this.audioComponent.audioTrack) {
            let currentTime = 0;
            let totalTime = 0;

            try {
                totalTime = this.audioComponent.duration || 0;
                if (isNaN(totalTime) || totalTime <= 0) {
                    throw new Error("Invalid duration");
                }

                if (this.isPlaying && !this.isManipulating) { // Condition ajoutée
                    currentTime = getTime() - this.trackStartTime;
                    if (currentTime > totalTime) {
                        currentTime = totalTime;
                    }
                } else {
                    currentTime = this.currentPlaybackTime;
                }

                this.timecodeText.text = this.formatTime(currentTime) + " / " + this.formatTime(totalTime);
                if (!this.isManipulating) { // Mise à jour de la position uniquement si pas en manipulation
                    this.updateEarthPosition(currentTime, totalTime);
                }
            } catch (e) {
                print("Error updating player: " + e);
                if (this.timecodeText) {
                    this.timecodeText.text = "00:00 / 00:00";
                }
            }
        }
    }

    private updateEarthPosition(currentTime: number, totalTime: number): void {
        if (this.earthSphere && this.progressBar && totalTime > 0) {
            try {
                let progress = currentTime / totalTime;
                progress = Math.max(0, Math.min(1, progress));

                const barTransform = this.progressBar.getTransform();
                const barScale = barTransform.getLocalScale();
                const barPosition = barTransform.getLocalPosition();
                const earthTransform = this.earthSphere.getTransform();

                const halfLength = barScale.x / 2;
                const localX = -halfLength + (progress * barScale.x) + this.earthSphereXOffset;

                earthTransform.setLocalPosition(new vec3(
                    barPosition.x + localX,
                    barPosition.y,
                    barPosition.z
                ));
            } catch (e) {
                print("Error updating sphere position: " + e);
            }
        }
    }

    // ... (le reste des méthodes reste inchangé : setupProgressBar, playTrack, pauseTrack, etc.)

    onDestroy(): void {
        // Nettoyage des callbacks existants (inchangé)
        if (this.playPauseButton && this.onPlayPauseCallback) {
            this.playPauseButton.onButtonPinched.remove(this.onPlayPauseCallback);
        }
        // ... (le reste reste inchangé)

        // Nettoyage des callbacks de manipulation
        if (this.earthManipulator) {
            if (this.onManipulationStartCallback) {
                this.earthManipulator.onManipulationStart.remove(this.onManipulationStartCallback);
            }
            if (this.onManipulationUpdateCallback) {
                this.earthManipulator.onManipulationUpdate.remove(this.onManipulationUpdateCallback);
            }
            if (this.onManipulationEndCallback) {
                this.earthManipulator.onManipulationEnd.remove(this.onManipulationEndCallback);
            }
        }

        if (this.audioComponent && this.isPlaying) {
            this.audioComponent.stop(true);
        }

        this.trackPrefabs.forEach(prefab => {
            if (prefab) prefab.enabled = false;
        });
        if (this.stoppedPrefab) {
            this.stoppedPrefab.enabled = false;
        }
    }
}