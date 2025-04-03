import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { InteractorEvent } from 'SpectaclesInteractionKit/Core/Interactor/InteractorEvent';

@component
export class MusicPlayerManager extends BaseScriptComponent {
    // Audio tracks
    @input
    @hint('Liste des morceaux de musique')
    tracks: AudioTrackAsset[];

    // Artists
    @input
    @hint('Liste des noms d\'artistes correspondants aux morceaux')
    artists: string[];

    // Titles
    @input
    @hint('Liste des titres des morceaux')
    titles: string[];

    // Prefabs for each track
    @input
    @hint('Liste des prefabs à afficher pour chaque morceau (doit correspondre au nombre de morceaux)')
    trackPrefabs: SceneObject[];

    // Prefab for stopped state
    @input('SceneObject')
    @hint('Prefab à afficher lorsque la lecture est arrêtée')
    stoppedPrefab: SceneObject;

    // UI Components
    @input('Component.Text')
    @hint('Texte pour afficher le nom de l\'artiste')
    artistNameText: Text;

    @input('Component.Text')
    @hint('Texte pour afficher le timecode actuel')
    timecodeText: Text;

    @input('Component.Text')
    @hint('Texte pour afficher le titre du morceau')
    trackTitleText: Text;

    // Control buttons
    @input('Component.ScriptComponent')
    @hint('Bouton pour lire/mettre en pause la musique')
    playPauseButton: PinchButton;

    @input('Component.ScriptComponent')
    @hint('Bouton pour passer au morceau suivant')
    nextTrackButton: PinchButton;

    @input('Component.ScriptComponent')
    @hint('Bouton pour revenir au morceau précédent')
    prevTrackButton: PinchButton;

    @input('Component.ScriptComponent')
    @hint('Bouton pour activer/désactiver la répétition')
    repeatButton: PinchButton;

    @input('Component.ScriptComponent')
    @hint('Bouton pour activer/désactiver le mode shuffle')
    shuffleButton: PinchButton;

    @input('Component.ScriptComponent')
    @hint('Bouton pour arrêter la lecture')
    stopButton: PinchButton;

    // Progress visualization
    @input('SceneObject')
    @hint('Barre de progression')
    progressBar: SceneObject;

    @input('SceneObject')
    @hint('Sphère terrestre qui se déplace le long de la barre de progression')
    earthSphere: SceneObject;

    // Audio Component
    @input('Component.AudioComponent')
    @hint('Composant audio pour la lecture de musique')
    audioComponent: AudioComponent;

    // Nouvelle option pour la lecture en boucle
    @input('bool')
    @hint('Activer la lecture en boucle')
    loopPlayback: boolean = true;

    // Nouvel offset pour la position de la sphère
    @input('number')
    @hint('Décalage de la sphère terrestre sur l\'axe X')
    earthSphereXOffset: number = 0;

    // Nouvelle propriété pour la vitesse de rotation de la sphère
    @input('number')
    @hint('Vitesse de rotation de la sphère (degrés par seconde)')
    rotationSpeed: number = 30.0;

    // Private variables
    private currentTrackIndex: number = -1; // -1 signifie aucune piste chargée
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

    // Callbacks
    private onPlayPauseCallback: (event: InteractorEvent) => void;
    private onNextTrackCallback: (event: InteractorEvent) => void;
    private onPrevTrackCallback: (event: InteractorEvent) => void;
    private onRepeatCallback: (event: InteractorEvent) => void;
    private onShuffleCallback: (event: InteractorEvent) => void;
    private onStopCallback: (event: InteractorEvent) => void;
    private onTrackFinishedCallback: () => void;

    onAwake(): void {
        // Vérifier que tous les morceaux sont définis
        if (this.tracks.some(track => track == null)) {
            print("Erreur : Tous les morceaux doivent être définis.");
            return;
        }

        // Vérifier que les tableaux ont la même longueur
        if (this.tracks.length !== this.artists.length || this.tracks.length !== this.titles.length) {
            print("Erreur : Le nombre de morceaux, d'artistes et de titres doit être identique.");
            return;
        }

        // Vérifier qu'il y a au moins un morceau
        if (this.tracks.length === 0) {
            print("Erreur : Aucun morceau audio fourni à MusicPlayerManager.");
            return;
        }

        // Vérifier que tous les prefabs pour les morceaux sont définis
        if (this.trackPrefabs.some(prefab => prefab == null)) {
            print("Erreur : Tous les prefabs pour les morceaux doivent être définis.");
            return;
        }

        // Vérifier que le nombre de prefabs correspond au nombre de morceaux
        if (this.trackPrefabs.length !== this.tracks.length) {
            print("Erreur : Le nombre de prefabs pour les morceaux doit correspondre au nombre de morceaux.");
            return;
        }

        // Désactiver tous les prefabs au démarrage
        this.trackPrefabs.forEach(prefab => {
            if (prefab) prefab.enabled = false;
        });
        if (this.stoppedPrefab) {
            this.stoppedPrefab.enabled = false;
        }

        if (!this.audioComponent) {
            print("Erreur : Composant audio non défini dans MusicPlayerManager.");
            return;
        }

        if (!this.earthSphere || !this.progressBar) {
            print("Attention : Les objets de visualisation de la progression ne sont pas définis dans MusicPlayerManager.");
            return;
        }

        this.setupCallbacks();
        this.setupProgressBar();

        // Créer un événement UpdateEvent pour la mise à jour du lecteur
        this.createEvent("UpdateEvent").bind(() => {
            this.updatePlayer();
            this.updateSphereRotation();
        });

        // Mettre à jour le prefab actif au démarrage (état arrêté)
        this.updateActivePrefab();

        print("MusicPlayerManager initialisé avec " + this.tracks.length + " morceaux, en attente de l'entrée utilisateur.");
    }

    private setupCallbacks(): void {
        if (this.playPauseButton) {
            this.onPlayPauseCallback = (event: InteractorEvent) => this.togglePlayPause();
            this.playPauseButton.onButtonPinched(this.onPlayPauseCallback);
        }

        if (this.nextTrackButton) {
            this.onNextTrackCallback = (event: InteractorEvent) => this.nextTrack();
            this.nextTrackButton.onButtonPinched(this.onNextTrackCallback);
        }

        if (this.prevTrackButton) {
            this.onPrevTrackCallback = (event: InteractorEvent) => this.prevTrack();
            this.prevTrackButton.onButtonPinched(this.onPrevTrackCallback);
        }

        if (this.repeatButton) {
            this.onRepeatCallback = (event: InteractorEvent) => {
                this.isRepeatEnabled = !this.isRepeatEnabled;
                print("Répétition " + (this.isRepeatEnabled ? "activée" : "désactivée"));
            };
            this.repeatButton.onButtonPinched(this.onRepeatCallback);
        }

        if (this.shuffleButton) {
            this.onShuffleCallback = (event: InteractorEvent) => {
                this.isShuffleEnabled = !this.isShuffleEnabled;
                print("Mode aléatoire " + (this.isShuffleEnabled ? "activé" : "désactivé"));
            };
            this.shuffleButton.onButtonPinched(this.onShuffleCallback);
        }

        if (this.stopButton) {
            this.onStopCallback = (event: InteractorEvent) => this.stopTrack();
            this.stopButton.onButtonPinched(this.onStopCallback);
        }

        this.setupTrackFinishedCallback();
    }

    private setupTrackFinishedCallback(): void {
        this.onTrackFinishedCallback = () => {
            print("Morceau terminé, gestion de l'action suivante");
            this.handleTrackFinished();
        };

        if (this.audioComponent) {
            this.audioComponent.setOnFinish(this.onTrackFinishedCallback);
        }
    }

    private handleTrackFinished(): void {
        if (this.isManualStop) {
            print("Arrêt manuel détecté, passage de handleTrackFinished ignoré.");
            this.isManualStop = false;
            return;
        }

        if (this.currentTrackIndex === -1) {
            return;
        }

        if (this.isRepeatEnabled) {
            this.loadTrack(this.currentTrackIndex);
            this.playTrack();
        } else if (this.isShuffleEnabled) {
            const randomIndex = Math.floor(Math.random() * this.tracks.length);
            this.loadTrack(randomIndex);
            this.playTrack();
        } else if (this.currentTrackIndex < this.tracks.length - 1 || this.loopPlayback) {
            this.shouldAutoPlay = true;
            this.nextTrack();
        } else {
            this.stopTrack();
        }
    }

    private setupProgressBar(): void {
        if (this.progressBar && this.earthSphere) {
            const barTransform = this.progressBar.getTransform();
            const barPosition = barTransform.getLocalPosition();
            const earthTransform = this.earthSphere.getTransform();

            earthTransform.setLocalPosition(new vec3(barPosition.x, barPosition.y, barPosition.z));
            this.updateEarthPosition(0, 1);
        }
    }

    private updateSphereRotation(): void {
        if (this.earthSphere) {
            const deltaTime = getDeltaTime();
            const earthTransform = this.earthSphere.getTransform();
            const currentRotation = earthTransform.getLocalRotation();

            // Créer une rotation autour de l'axe Y basée sur rotationSpeed et deltaTime
            const rotationDelta = quat.fromEulerAngles(0, this.rotationSpeed * deltaTime * (Math.PI / 180), 0);
            const newRotation = currentRotation.multiply(rotationDelta);

            earthTransform.setLocalRotation(newRotation);
        }
    }

    private updateActivePrefab(): void {
        // Désactiver l'ancien prefab actif, s'il existe
        if (this.currentActivePrefab) {
            this.currentActivePrefab.enabled = false;
            this.currentActivePrefab = null;
        }

        // Activer le prefab correspondant à l'état actuel
        if (this.currentTrackIndex === -1) {
            // État arrêté : activer le stoppedPrefab
            if (this.stoppedPrefab) {
                this.stoppedPrefab.enabled = true;
                this.currentActivePrefab = this.stoppedPrefab;
                print("Prefab 'arrêté' activé.");
            }
        } else {
            // Activer le prefab correspondant à la piste actuelle
            if (this.trackPrefabs[this.currentTrackIndex]) {
                this.trackPrefabs[this.currentTrackIndex].enabled = true;
                this.currentActivePrefab = this.trackPrefabs[this.currentTrackIndex];
                print("Prefab pour le morceau " + this.titles[this.currentTrackIndex] + " activé.");
            }
        }
    }

    private loadTrack(index: number): void {
        if (index >= 0 && index < this.tracks.length) {
            const wasPlaying = this.isPlaying || this.shouldAutoPlay;
            this.shouldAutoPlay = false;
            this.audioInitialized = false;

            if (this.isPlaying) {
                this.isManualStop = true;
                this.audioComponent.stop(true);
                this.isPlaying = false;
            }

            this.currentTrackIndex = index;
            this.isPaused = false;

            this.audioComponent.audioTrack = null;
            this.delayedCall(0.05, () => {
                this.audioComponent.audioTrack = this.tracks[this.currentTrackIndex];
                this.setupTrackFinishedCallback();
                this.trackStartTime = getTime();
                this.currentPlaybackTime = 0;
                this.updateTrackInfo();
                this.updateActivePrefab(); // Mettre à jour le prefab actif

                this.delayedCall(0.1, () => {
                    this.audioInitialized = true;
                    print("Morceau chargé : " + this.titles[this.currentTrackIndex] + " par " + this.artists[this.currentTrackIndex]);
                    if (wasPlaying) {
                        this.delayedCall(0.1, () => {
                            this.playTrack();
                        });
                    }
                });
            });
        }
    }

    private delayedCall(delay: number, callback: () => void): void {
        const delayEvent = this.createEvent("UpdateEvent");
        let startTime = getTime();

        delayEvent.bind(() => {
            if (getTime() - startTime >= delay) {
                callback();
                delayEvent.enabled = false;
            }
        });
    }

    private updateTrackInfo(): void {
        if (this.currentTrackIndex === -1) {
            if (this.artistNameText) this.artistNameText.text = "Aucun morceau";
            if (this.trackTitleText) this.trackTitleText.text = "Arrêté";
        } else {
            if (this.artistNameText) this.artistNameText.text = this.artists[this.currentTrackIndex];
            if (this.trackTitleText) this.trackTitleText.text = this.titles[this.currentTrackIndex];
        }
        this.updateActivePrefab(); // Mettre à jour le prefab actif
    }

    private togglePlayPause(): void {
        if (this.isPlaying) {
            this.pauseTrack();
        } else {
            if (this.currentTrackIndex === -1) {
                this.loadTrack(0);
                this.delayedCall(0.2, () => this.playTrack());
            } else {
                this.playTrack();
            }
        }
    }

    private playTrack(): void {
        if (!this.isPlaying && this.audioComponent && this.audioComponent.audioTrack && this.audioInitialized) {
            try {
                if (this.isPaused) {
                    this.audioComponent.resume();
                    this.isPlaying = true;
                    this.isPaused = false;
                    this.trackStartTime = getTime() - this.currentPlaybackTime;
                    print("Reprise du morceau : " + this.titles[this.currentTrackIndex] + " à partir de " + this.formatTime(this.currentPlaybackTime));
                } else {
                    this.audioComponent.play(1);
                    this.isPlaying = true;
                    this.trackStartTime = getTime();
                    this.currentPlaybackTime = 0;
                    print("Lecture du morceau : " + this.titles[this.currentTrackIndex]);
                }
            } catch (e) {
                print("Erreur lors de la lecture du morceau : " + e);
            }
        } else if (!this.audioInitialized) {
            print("Impossible de lire le morceau : Audio non encore initialisé");
        }
    }

    private pauseTrack(): void {
        if (this.isPlaying && this.audioComponent) {
            try {
                this.audioComponent.pause();
                this.isPlaying = false;
                this.isPaused = true;
                this.currentPlaybackTime = getTime() - this.trackStartTime;
                print("Morceau en pause : " + this.titles[this.currentTrackIndex] + " à " + this.formatTime(this.currentPlaybackTime));
            } catch (e) {
                print("Erreur lors de la mise en pause du morceau : " + e);
            }
        }
    }

    private stopTrack(): void {
        if (this.audioComponent) {
            if (this.isPlaying || this.isPaused) {
                this.isManualStop = true;
                this.audioComponent.stop(true);
            }
            this.isPlaying = false;
            this.isPaused = false;
            this.shouldAutoPlay = false;
            this.currentTrackIndex = -1;
            this.audioComponent.audioTrack = null;
            this.audioInitialized = false;
            this.currentPlaybackTime = 0;
            this.updateEarthPosition(0, 1);
            this.updateTrackInfo();
            this.updateActivePrefab(); // Mettre à jour le prefab actif
            print("Lecture complètement arrêtée");
        }
    }

    private nextTrack(): void {
        if (this.currentTrackIndex === -1) {
            this.loadTrack(0);
            this.delayedCall(0.2, () => this.playTrack());
            return;
        }

        if (this.isRepeatEnabled) {
            const wasPlaying = this.isPlaying;
            if (wasPlaying) {
                this.shouldAutoPlay = true;
            }
            this.loadTrack(this.currentTrackIndex);
        } else {
            let nextIndex;
            if (this.isShuffleEnabled) {
                nextIndex = Math.floor(Math.random() * this.tracks.length);
            } else {
                nextIndex = this.currentTrackIndex + 1;
                if (nextIndex >= this.tracks.length) {
                    if (this.loopPlayback) {
                        nextIndex = 0;
                    } else {
                        this.stopTrack();
                        return;
                    }
                }
            }

            const wasPlaying = this.isPlaying;
            if (wasPlaying) {
                this.shouldAutoPlay = true;
            }
            print("Passage au morceau suivant, nouvel index : " + nextIndex);
            this.loadTrack(nextIndex);
        }
    }

    private prevTrack(): void {
        if (this.currentTrackIndex === -1) {
            this.loadTrack(this.tracks.length - 1);
            this.delayedCall(0.2, () => this.playTrack());
            return;
        }

        if (this.isRepeatEnabled) {
            const wasPlaying = this.isPlaying;
            if (wasPlaying) {
                this.shouldAutoPlay = true;
            }
            this.loadTrack(this.currentTrackIndex);
        } else {
            let prevIndex;
            if (this.isShuffleEnabled) {
                prevIndex = Math.floor(Math.random() * this.tracks.length);
            } else {
                prevIndex = this.currentTrackIndex - 1;
                if (prevIndex < 0) {
                    prevIndex = this.tracks.length - 1;
                }
            }

            const wasPlaying = this.isPlaying;
            if (wasPlaying) {
                this.shouldAutoPlay = true;
            }
            print("Retour au morceau précédent, nouvel index : " + prevIndex);
            this.loadTrack(prevIndex);
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
                    throw new Error("Durée invalide");
                }

                if (this.isPlaying) {
                    currentTime = getTime() - this.trackStartTime;
                    if (currentTime > totalTime) {
                        currentTime = totalTime;
                    }
                } else {
                    currentTime = this.currentPlaybackTime;
                }

                this.timecodeText.text = this.formatTime(currentTime) + " / " + this.formatTime(totalTime);
                this.updateEarthPosition(currentTime, totalTime);
            } catch (e) {
                print("Erreur lors de la mise à jour du lecteur : " + e);
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
                print("Erreur lors de la mise à jour de la position de la sphère : " + e);
            }
        }
    }

    private formatTime(timeInSeconds: number): string {
        if (isNaN(timeInSeconds) || timeInSeconds === null || timeInSeconds === undefined) {
            return "00:00";
        }

        timeInSeconds = Math.max(0, timeInSeconds);
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
    }

    onDestroy(): void {
        if (this.playPauseButton && this.onPlayPauseCallback) {
            this.playPauseButton.onButtonPinched.remove(this.onPlayPauseCallback);
        }

        if (this.nextTrackButton && this.onNextTrackCallback) {
            this.nextTrackButton.onButtonPinched.remove(this.onNextTrackCallback);
        }

        if (this.prevTrackButton && this.onPrevTrackCallback) {
            this.prevTrackButton.onButtonPinched.remove(this.onPrevTrackCallback);
        }

        if (this.repeatButton && this.onRepeatCallback) {
            this.repeatButton.onButtonPinched.remove(this.onRepeatCallback);
        }

        if (this.shuffleButton && this.onShuffleCallback) {
            this.shuffleButton.onButtonPinched.remove(this.onShuffleCallback);
        }

        if (this.stopButton && this.onStopCallback) {
            this.stopButton.onButtonPinched.remove(this.onStopCallback);
        }

        if (this.audioComponent && this.isPlaying) {
            this.audioComponent.stop(true);
        }

        // Désactiver tous les prefabs lors de la destruction
        this.trackPrefabs.forEach(prefab => {
            if (prefab) prefab.enabled = false;
        });
        if (this.stoppedPrefab) {
            this.stoppedPrefab.enabled = false;
        }
    }
}