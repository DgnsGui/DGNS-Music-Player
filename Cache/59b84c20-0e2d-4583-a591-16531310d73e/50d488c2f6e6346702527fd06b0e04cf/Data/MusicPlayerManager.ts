import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { InteractorEvent } from 'SpectaclesInteractionKit/Core/Interactor/InteractorEvent';

@component
export class MusicPlayerManager extends BaseScriptComponent {
    // Audio tracks
    @input('Asset.AudioTrackAsset')
    @hint('Premier morceau de musique')
    track1: AudioTrackAsset;

    @input('Asset.AudioTrackAsset')
    @hint('Deuxième morceau de musique')
    track2: AudioTrackAsset;

    @input('Asset.AudioTrackAsset')
    @hint('Troisième morceau de musique')
    track3: AudioTrackAsset;

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
    
    // Nouveaux boutons
    @input('Component.ScriptComponent')
    @hint('Bouton pour activer/désactiver la lecture aléatoire')
    shuffleButton: PinchButton;

    @input('Component.ScriptComponent')
    @hint('Bouton pour activer/désactiver la répétition')
    repeatButton: PinchButton;

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

    // Track metadata
    @input('string')
    @hint('Nom de l\'artiste pour le premier morceau')
    artist1: string = "Artiste 1";

    @input('string')
    @hint('Titre du premier morceau')
    title1: string = "Titre 1";

    @input('string')
    @hint('Nom de l\'artiste pour le deuxième morceau')
    artist2: string = "Artiste 2";

    @input('string')
    @hint('Titre du deuxième morceau')
    title2: string = "Titre 2";

    @input('string')
    @hint('Nom de l\'artiste pour le troisième morceau')
    artist3: string = "Artiste 3";

    @input('string')
    @hint('Titre du troisième morceau')
    title3: string = "Titre 3";

    // Remplacé par isRepeatEnabled
    @input('bool')
    @hint('Activer la lecture en boucle par défaut')
    loopPlaybackDefault: boolean = true;

    // Nouvel offset pour la position de la sphère
    @input('number')
    @hint('Décalage de la sphère terrestre sur l\'axe X')
    earthSphereXOffset: number = 0;

    // Private variables
    private currentTrackIndex: number = 0;
    private isPlaying: boolean = false;
    private shouldAutoPlay: boolean = false;
    private tracks: AudioTrackAsset[] = [];
    private artists: string[] = [];
    private titles: string[] = [];
    private progressBarStartX: number = 0;
    private progressBarEndX: number = 0;
    private progressBarLength: number = 0;
    private trackStartTime: number = 0;
    private currentPlaybackTime: number = 0;
    private audioInitialized: boolean = false;
    private isShuffleEnabled: boolean = false;
    private isRepeatEnabled: boolean = false;
    
    // Callbacks
    private onPlayPauseCallback: (event: InteractorEvent) => void;
    private onNextTrackCallback: (event: InteractorEvent) => void;
    private onPrevTrackCallback: (event: InteractorEvent) => void;
    private onShuffleCallback: (event: InteractorEvent) => void;
    private onRepeatCallback: (event: InteractorEvent) => void;
    private onStopCallback: (event: InteractorEvent) => void;
    private onTrackFinishedCallback: () => void;

    onAwake(): void {
        // Initialize tracks array
        this.tracks = [this.track1, this.track2, this.track3].filter(track => track != null);
        this.artists = [this.artist1, this.artist2, this.artist3];
        this.titles = [this.title1, this.title2, this.title3];
        this.isRepeatEnabled = this.loopPlaybackDefault;

        if (this.tracks.length === 0) {
            print("Error: No audio tracks provided to MusicPlayerManager");
            return;
        }

        if (!this.audioComponent) {
            print("Error: Audio component not set in MusicPlayerManager");
            return;
        }

        if (!this.earthSphere || !this.progressBar) {
            print("Warning: Progress visualization objects not set in MusicPlayerManager");
        }

        // Setup button callbacks
        this.setupCallbacks();
        
        // Setup progress bar dimensions
        this.setupProgressBar();
        
        // Create update event
        this.createEvent("UpdateEvent").bind(() => {
            this.updatePlayer();
        });
        
        // Initialize audio with a delay to ensure the AudioComponent is ready
        this.delayedCall(0.5, () => {
            // Load first track
            this.loadTrack(0);
            print("MusicPlayerManager initialized with " + this.tracks.length + " tracks");
            print("Repeat mode is " + (this.isRepeatEnabled ? "enabled" : "disabled") + " by default");
        });
    }

    private setupCallbacks(): void {
        // Setup play/pause button
        if (this.playPauseButton) {
            this.onPlayPauseCallback = (event: InteractorEvent) => this.togglePlayPause();
            this.playPauseButton.onButtonPinched(this.onPlayPauseCallback);
        }

        // Setup next track button
        if (this.nextTrackButton) {
            this.onNextTrackCallback = (event: InteractorEvent) => this.nextTrack();
            this.nextTrackButton.onButtonPinched(this.onNextTrackCallback);
        }

        // Setup previous track button
        if (this.prevTrackButton) {
            this.onPrevTrackCallback = (event: InteractorEvent) => this.prevTrack();
            this.prevTrackButton.onButtonPinched(this.onPrevTrackCallback);
        }
        
        // Setup shuffle button
        if (this.shuffleButton) {
            this.onShuffleCallback = (event: InteractorEvent) => this.toggleShuffle();
            this.shuffleButton.onButtonPinched(this.onShuffleCallback);
        }

        // Setup repeat button
        if (this.repeatButton) {
            this.onRepeatCallback = (event: InteractorEvent) => this.toggleRepeat();
            this.repeatButton.onButtonPinched(this.onRepeatCallback);
        }

        // Setup stop button
        if (this.stopButton) {
            this.onStopCallback = (event: InteractorEvent) => this.stopTrack();
            this.stopButton.onButtonPinched(this.onStopCallback);
        }

        // Setup track finished callback
        this.setupTrackFinishedCallback();
    }

    private setupTrackFinishedCallback(): void {
        this.onTrackFinishedCallback = () => {
            print("Track finished, playing next track");
            this.handleTrackFinished();
        };
        
        if (this.audioComponent) {
            this.audioComponent.setOnFinish(this.onTrackFinishedCallback);
        }
    }

    private handleTrackFinished(): void {
        if (this.currentTrackIndex < this.tracks.length - 1 || this.isRepeatEnabled) {
            // Go to next track and play it automatically
            this.shouldAutoPlay = true;
            
            // Si le mode aléatoire est activé, choisir une piste aléatoire
            if (this.isShuffleEnabled) {
                const randomIndex = Math.floor(Math.random() * this.tracks.length);
                this.loadTrack(randomIndex);
            } else {
                this.nextTrack();
            }
        } else {
            // Last track finished and no repeat
            this.isPlaying = false;
            // Positionner à 0 la position de lecture
            this.currentPlaybackTime = 0;
            // Mettre à jour la position de la Terre au début
            this.updateEarthPosition(0, 1);
            print("Playback completed");
        }
    }

    private setupProgressBar(): void {
        if (this.progressBar && this.earthSphere) {
            const barTransform = this.progressBar.getTransform();
            const barScale = barTransform.getLocalScale();
            const barPosition = barTransform.getWorldPosition();
            
            // Calculate the start and end positions of the progress bar
            // Assuming the bar is oriented along the X axis
            this.progressBarStartX = barPosition.x - (barScale.x / 2);
            this.progressBarEndX = barPosition.x + (barScale.x / 2);
            this.progressBarLength = barScale.x;
            
            // Position the earth sphere at the start of the progress bar
            this.updateEarthPosition(0, 1); // Initialize position
        }
    }

    private loadTrack(index: number): void {
        if (index >= 0 && index < this.tracks.length) {
            // Save current playback state
            const wasPlaying = this.isPlaying || this.shouldAutoPlay;
            this.shouldAutoPlay = false;
            
            // Reset the initialization flag until the track is loaded
            this.audioInitialized = false;
            
            // Stop the current track if it was playing
            if (this.isPlaying) {
                this.audioComponent.stop(true);
                this.isPlaying = false;
            }
            
            this.currentTrackIndex = index;
            
            // Complètement réinitialiser le composant audio
            this.audioComponent.audioTrack = null;
            // Petit délai pour s'assurer que l'AudioComponent est réinitialisé
            this.delayedCall(0.05, () => {
                // Définir la nouvelle piste audio
                this.audioComponent.audioTrack = this.tracks[this.currentTrackIndex];
                
                // Réinitialiser le callback de fin de piste (peut se perdre après changement de piste)
                this.setupTrackFinishedCallback();
                
                // Reset the progress tracking
                this.trackStartTime = getTime();
                this.currentPlaybackTime = 0;
                
                // Update UI
                this.updateTrackInfo();
                
                // Mark as initialized after a short delay to make sure it's ready
                this.delayedCall(0.1, () => {
                    this.audioInitialized = true;
                    print("Loaded track: " + this.titles[this.currentTrackIndex] + " by " + this.artists[this.currentTrackIndex]);
                    
                    // Si nous étions en train de jouer avant ou que nous devons faire une lecture automatique
                    if (wasPlaying) {
                        // Petit délai pour s'assurer que l'audio est correctement chargé
                        this.delayedCall(0.1, () => {
                            this.playTrack();
                        });
                    }
                });
            });
        }
    }

    private delayedCall(delay: number, callback: () => void): void {
        // Utiliser un type d'événement valide comme "UpdateEvent" au lieu de "DelayedCall"
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
        // Update artist and title text
        if (this.artistNameText) {
            this.artistNameText.text = this.artists[this.currentTrackIndex];
        }
        
        if (this.trackTitleText) {
            this.trackTitleText.text = this.titles[this.currentTrackIndex];
        }
    }

    private togglePlayPause(): void {
        if (this.isPlaying) {
            this.pauseTrack();
        } else {
            this.playTrack();
        }
    }

    private playTrack(): void {
        if (!this.isPlaying && this.audioComponent && this.audioComponent.audioTrack && this.audioInitialized) {
            try {
                // Commencer la lecture depuis le début
                this.audioComponent.play(1);
                this.isPlaying = true;
                
                // Si nous reprenons après une pause, nous devons rappeler play() puis ajuster le temps de démarrage
                if (this.currentPlaybackTime > 0) {
                    // Au lieu d'essayer de définir currentTime qui ne semble pas fonctionner
                    // nous ajustons trackStartTime pour que le calcul relatif fonctionne
                    this.trackStartTime = getTime() - this.currentPlaybackTime;
                    print("Adjusting start time for resuming at: " + this.formatTime(this.currentPlaybackTime));
                } else {
                    // Si on commence depuis le début
                    this.trackStartTime = getTime();
                }
                
                print("Playing track: " + this.titles[this.currentTrackIndex] + 
                      (this.currentPlaybackTime > 0 ? " from " + this.formatTime(this.currentPlaybackTime) : ""));
            } catch (e) {
                print("Error playing track: " + e);
                
                // Recovery attempt
                this.delayedCall(0.2, () => {
                    try {
                        this.audioComponent.play(1);
                        this.isPlaying = true;
                        this.trackStartTime = getTime() - this.currentPlaybackTime;
                    } catch (e2) {
                        print("Second attempt failed: " + e2);
                    }
                });
            }
        } else if (!this.audioInitialized) {
            print("Cannot play track: Audio not yet initialized");
        }
    }

    private pauseTrack(): void {
        if (this.isPlaying && this.audioComponent) {
            try {
                this.audioComponent.pause();
                this.isPlaying = false;
                
                // Store current playback time for resuming later
                try {
                    // Essayer d'utiliser la propriété currentTime
                    const currentTime = (this.audioComponent as any).currentTime;
                    if (!isNaN(currentTime)) {
                        this.currentPlaybackTime = currentTime;
                    } else {
                        this.currentPlaybackTime = getTime() - this.trackStartTime;
                    }
                } catch (e) {
                    // Utiliser notre propre calcul de temps
                    this.currentPlaybackTime = getTime() - this.trackStartTime;
                }
                
                print("Paused track: " + this.titles[this.currentTrackIndex] + " at " + this.formatTime(this.currentPlaybackTime));
            } catch (e) {
                print("Error pausing track: " + e);
            }
        }
    }

    private stopTrack(): void {
        if (this.audioComponent) {
            try {
                this.audioComponent.stop(true);
                this.isPlaying = false;
                this.currentPlaybackTime = 0;
                this.trackStartTime = getTime();
                
                // Mettre à jour la position de la Terre au début
                this.updateEarthPosition(0, 1);
                
                // Mettre à jour l'affichage du timecode
                if (this.timecodeText && this.audioComponent.audioTrack) {
                    const totalTime = this.audioComponent.duration || 0;
                    this.timecodeText.text = "00:00 / " + this.formatTime(totalTime);
                }
                
                print("Stopped track: " + this.titles[this.currentTrackIndex]);
            } catch (e) {
                print("Error stopping track: " + e);
            }
        }
    }

    private nextTrack(): void {
        let nextIndex;
        
        if (this.isShuffleEnabled) {
            // Choisir une piste aléatoire différente de la piste actuelle
            do {
                nextIndex = Math.floor(Math.random() * this.tracks.length);
            } while (nextIndex === this.currentTrackIndex && this.tracks.length > 1);
        } else {
            // Comportement normal: piste suivante
            nextIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        }
        
        // Si on est à la fin et que la lecture en boucle est désactivée, on s'arrête
        if (nextIndex === 0 && !this.isRepeatEnabled && !this.isShuffleEnabled) {
            this.pauseTrack();
            return;
        }
        
        // Sauvegarde l'état de lecture actuel
        const wasPlaying = this.isPlaying;
        
        // Indique qu'on devrait redémarrer automatiquement la lecture
        if (wasPlaying) {
            this.shouldAutoPlay = true;
        }
        
        // Charge la piste suivante
        this.loadTrack(nextIndex);
    }

    private prevTrack(): void {
        let prevIndex;
        
        if (this.isShuffleEnabled) {
            // En mode shuffle, le comportement "précédent" est également aléatoire
            do {
                prevIndex = Math.floor(Math.random() * this.tracks.length);
            } while (prevIndex === this.currentTrackIndex && this.tracks.length > 1);
        } else {
            // Comportement normal: piste précédente
            prevIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
        }
        
        // Sauvegarde l'état de lecture actuel
        const wasPlaying = this.isPlaying;
        
        // Indique qu'on devrait redémarrer automatiquement la lecture
        if (wasPlaying) {
            this.shouldAutoPlay = true;
        }
        
        // Charge la piste précédente
        this.loadTrack(prevIndex);
    }

    private toggleShuffle(): void {
        this.isShuffleEnabled = !this.isShuffleEnabled;
        print("Shuffle " + (this.isShuffleEnabled ? "enabled" : "disabled"));
    }

    private toggleRepeat(): void {
        this.isRepeatEnabled = !this.isRepeatEnabled;
        print("Repeat " + (this.isRepeatEnabled ? "enabled" : "disabled"));
    }

    private updatePlayer(): void {
        // Only update if audio is initialized
        if (!this.audioInitialized) {
            // Show loading message or default values in UI during initialization
            if (this.timecodeText) {
                this.timecodeText.text = "00:00 / 00:00";
            }
            return;
        }
        
        // Update timecode text
        if (this.timecodeText && this.audioComponent && this.audioComponent.audioTrack) {
            // Calculer le temps de lecture manuellement si currentTime ne fonctionne pas
            let currentTime = 0;
            let totalTime = 0;
            
            try {
                // Get the duration safely
                totalTime = this.audioComponent.duration || 0;
                
                // Make sure we have a valid duration before proceeding
                if (isNaN(totalTime) || totalTime <= 0) {
                    throw new Error("Invalid duration");
                }
                
                // Try to get the current time
                try {
                    // Essayer d'abord d'utiliser la propriété currentTime
                    currentTime = (this.audioComponent as any).currentTime;
                    
                    // Si la valeur est NaN, on utilise notre propre calcul de temps
                    if (isNaN(currentTime)) {
                        throw new Error("currentTime is NaN");
                    }
                } catch (e) {
                    // Calculer le temps écoulé depuis le début de la lecture
                    // Cette approche est moins précise mais peut fonctionner comme solution de secours
                    if (this.isPlaying) {
                        currentTime = getTime() - this.trackStartTime;
                        
                        // S'assurer que le temps ne dépasse pas la durée totale
                        if (currentTime > totalTime) {
                            currentTime = totalTime;
                        }
                    } else {
                        // Si on est en pause, utiliser le temps stocké
                        currentTime = this.currentPlaybackTime;
                    }
                }
                
                // Formater et afficher le temps
                this.timecodeText.text = this.formatTime(currentTime) + " / " + this.formatTime(totalTime);
                
                // Update earth sphere position
                this.updateEarthPosition(currentTime, totalTime);
            } catch (e) {
                // En cas d'erreur, afficher un message par défaut
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
            // Calculer la progression (entre 0 et 1)
            let progress = Math.max(0, Math.min(1, currentTime / totalTime));
            
            // Obtenir la transformation de la barre de progression
            const barTransform = this.progressBar.getTransform();
            
            // Obtenir la transformation de la sphère
            const earthTransform = this.earthSphere.getTransform();
            
            // Déterminer si la sphère est un enfant de la barre de progression
            const isChildOfProgressBar = this.isChildOf(this.earthSphere, this.progressBar);
            
            if (isChildOfProgressBar) {
                // Si c'est un enfant, utiliser des positions locales
                const barScale = barTransform.getLocalScale();
                
                // Calculer la position relative le long de la barre (de -0.5 à 0.5 de la largeur)
                const relativePosition = (progress - 0.5) * barScale.x;
                
                // Mettre à jour uniquement la position X locale
                const currentPosition = earthTransform.getLocalPosition();
                earthTransform.setLocalPosition(new vec3(
                    relativePosition + this.earthSphereXOffset,
                    currentPosition.y,
                    currentPosition.z
                ));
            } else {
                // Alternative implementation without transformDirection
                
                // Get the bar's world position and rotation
                const barPosition = barTransform.getWorldPosition();
                const barRotation = barTransform.getWorldRotation();
                
                // Calculate the bar's direction in world space (assuming it points along its local X axis)
                // Create a direction vector in local space (X axis)
                const localDirection = new vec3(1, 0, 0);
                // Transform it to world space by applying the rotation
                const worldDirection = barRotation.multiplyVector(localDirection);
                
                // Get the bar's scale
                const barScale = barTransform.getLocalScale();
                
                // Calculate the start point (left end of the bar)
                const startPoint = new vec3(
                    barPosition.x - worldDirection.x * (barScale.x / 2),
                    barPosition.y - worldDirection.y * (barScale.x / 2),
                    barPosition.z - worldDirection.z * (barScale.x / 2)
                );
                
                // Calculate the new position based on progress
                const newPosition = new vec3(
                    startPoint.x + worldDirection.x * barScale.x * progress + this.earthSphereXOffset * worldDirection.x,
                    startPoint.y + worldDirection.y * barScale.x * progress + this.earthSphereXOffset * worldDirection.y,
                    startPoint.z + worldDirection.z * barScale.x * progress + this.earthSphereXOffset * worldDirection.z
                );
                
                // Apply the position
                earthTransform.setWorldPosition(newPosition);
            }
            
            // Faire tourner la sphère pour un effet visuel
            const rotation = earthTransform.getLocalRotation();
            earthTransform.setLocalRotation(quat.fromEulerAngles(
                rotation.x,
                rotation.y + 0.5, // Tourner un peu sur l'axe Y à chaque frame
                rotation.z
            ));
        } catch (e) {
            print("Error updating earth position: " + e);
        }
    }
}
            } catch (e) {
                print("Error updating earth position: " + e);
            }
        }
    }
    
    // Fonction utilitaire pour déterminer si un objet est l'enfant d'un autre
    private isChildOf(child: SceneObject, parent: SceneObject): boolean {
        let current = child.getParent();
        while (current) {
            if (current === parent) {
                return true;
            }
            current = current.getParent();
        }
        return false;
    }

    private formatTime(timeInSeconds: number): string {
        // S'assurer que timeInSeconds est un nombre valide
        if (isNaN(timeInSeconds) || timeInSeconds === null || timeInSeconds === undefined) {
            return "00:00";
        }
        
        // Limiter à 0 si négatif
        timeInSeconds = Math.max(0, timeInSeconds);
        
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
    }

    onDestroy(): void {
        // Clean up event listeners
        if (this.playPauseButton && this.onPlayPauseCallback) {
            this.playPauseButton.onButtonPinched.remove(this.onPlayPauseCallback);
        }
        
        if (this.nextTrackButton && this.onNextTrackCallback) {
            this.nextTrackButton.onButtonPinched.remove(this.onNextTrackCallback);
        }
        
        if (this.prevTrackButton && this.onPrevTrackCallback) {
            this.prevTrackButton.onButtonPinched.remove(this.onPrevTrackCallback);
        }
        
        if (this.shuffleButton && this.onShuffleCallback) {
            this.shuffleButton.onButtonPinched.remove(this.onShuffleCallback);
        }

        if (this.repeatButton && this.onRepeatCallback) {
            this.repeatButton.onButtonPinched.remove(this.onRepeatCallback);
        }

        if (this.stopButton && this.onStopCallback) {
            this.stopButton.onButtonPinched.remove(this.onStopCallback);
        }
        
        // Stop any playing audio
        if (this.audioComponent && this.isPlaying) {
            this.audioComponent.stop(true);
        }
    }
}