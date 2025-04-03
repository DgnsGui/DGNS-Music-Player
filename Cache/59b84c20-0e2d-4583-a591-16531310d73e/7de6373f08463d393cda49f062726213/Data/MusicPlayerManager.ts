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

    // Nouvelle option pour la lecture en boucle
    @input('bool')
    @hint('Activer la lecture en boucle')
    loopPlayback: boolean = true;

    // Nouvel offset pour la position de la sphère
    @input('number')
    @hint('Décalage de la sphère terrestre sur l\'axe X')
    earthSphereXOffset: number = 0;

    // Private variables
    private currentTrackIndex: number = 0;
    private isPlaying: boolean = false;
    private tracks: AudioTrackAsset[] = [];
    private artists: string[] = [];
    private titles: string[] = [];
    private progressBarStartX: number = 0;
    private progressBarEndX: number = 0;
    private progressBarLength: number = 0;
    private trackStartTime: number = 0;
    private currentPlaybackTime: number = 0;
    
    // Callbacks
    private onPlayPauseCallback: (event: InteractorEvent) => void;
    private onNextTrackCallback: (event: InteractorEvent) => void;
    private onPrevTrackCallback: (event: InteractorEvent) => void;
    private onTrackFinishedCallback: () => void;

    onAwake(): void {
        // Initialize tracks array
        this.tracks = [this.track1, this.track2, this.track3].filter(track => track != null);
        this.artists = [this.artist1, this.artist2, this.artist3];
        this.titles = [this.title1, this.title2, this.title3];

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
        
        // Load first track
        this.loadTrack(0);
        
        // Create update event
        this.createEvent("UpdateEvent").bind(() => {
            this.updatePlayer();
        });

        print("MusicPlayerManager initialized with " + this.tracks.length + " tracks");
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

        // Setup track finished callback
        this.onTrackFinishedCallback = () => {
            print("Track finished, playing next track");
            this.handleTrackFinished();
        };
        this.audioComponent.setOnFinish(this.onTrackFinishedCallback);
    }

    private handleTrackFinished(): void {
        if (this.currentTrackIndex < this.tracks.length - 1 || this.loopPlayback) {
            // Go to next track and play it automatically
            this.nextTrack();
        } else {
            // Last track finished and no loop
            this.isPlaying = false;
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
            const wasPlaying = this.isPlaying;
            
            // If we were playing, stop the current track first
            if (this.isPlaying) {
                this.audioComponent.stop(true);
            }
            
            this.currentTrackIndex = index;
            
            // Set the audio track
            this.audioComponent.audioTrack = this.tracks[index];
            
            // Reset the progress tracking
            this.trackStartTime = getTime();
            this.currentPlaybackTime = 0;
            
            // Update UI
            this.updateTrackInfo();
            
            print("Loaded track: " + this.titles[index] + " by " + this.artists[index]);
            
            // If we were playing before, start the new track automatically
            if (wasPlaying) {
                this.playTrack();
            }
        }
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
        if (!this.isPlaying) {
            this.isPlaying = true;
            
            // Si nous avons pausé en milieu de lecture, nous voulons reprendre à ce point
            if (this.currentPlaybackTime > 0) {
                // Malheureusement, il n'y a pas de méthode pour commencer la lecture à partir d'un point spécifique
                // mais comme nous avons stocké le temps de lecture, nous pouvons l'utiliser pour le suivi
                this.trackStartTime = getTime() - this.currentPlaybackTime;
                this.audioComponent.play(1);
            } else {
                // Sinon, commencer la lecture depuis le début
                this.trackStartTime = getTime();
                this.audioComponent.play(1);
            }
            
            print("Playing track: " + this.titles[this.currentTrackIndex]);
        }
    }

    private pauseTrack(): void {
        if (this.isPlaying) {
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
        }
    }

    private nextTrack(): void {
        let nextIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        
        // Si on est à la fin et que la lecture en boucle est désactivée, on s'arrête
        if (nextIndex === 0 && !this.loopPlayback) {
            this.pauseTrack();
            return;
        }
        
        // Sauvegarde l'état de lecture actuel
        const wasPlaying = this.isPlaying;
        
        // Charge la piste suivante
        this.loadTrack(nextIndex);
        
        // Continue la lecture automatiquement si on était en train de jouer
        if (wasPlaying) {
            this.playTrack();
        }
    }

    private prevTrack(): void {
        const prevIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
        
        // Sauvegarde l'état de lecture actuel
        const wasPlaying = this.isPlaying;
        
        // Charge la piste précédente
        this.loadTrack(prevIndex);
        
        // Continue la lecture automatiquement si on était en train de jouer
        if (wasPlaying) {
            this.playTrack();
        }
    }

    private updatePlayer(): void {
        // Update timecode text
        if (this.timecodeText && this.audioComponent) {
            // Calculer le temps de lecture manuellement si currentTime ne fonctionne pas
            let currentTime = 0;
            
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
                    if (currentTime > this.audioComponent.duration) {
                        currentTime = this.audioComponent.duration;
                    }
                } else {
                    // Si on est en pause, utiliser le temps stocké
                    currentTime = this.currentPlaybackTime;
                }
            }
            
            const totalTime = this.audioComponent.duration || 0;
            
            // Formater et afficher le temps
            this.timecodeText.text = this.formatTime(currentTime) + " / " + this.formatTime(totalTime);
            
            // Update earth sphere position
            this.updateEarthPosition(currentTime, totalTime);
        }
    }

    private updateEarthPosition(currentTime: number, totalTime: number): void {
        if (this.earthSphere && totalTime > 0) {
            // Calculer la progression (entre 0 et 1)
            let progress = currentTime / totalTime;
            
            // S'assurer que la progression est entre 0 et 1
            progress = Math.max(0, Math.min(1, progress));
            
            // Calculer la nouvelle position X avec l'offset configuré
            const newX = this.progressBarStartX + (this.progressBarLength * progress) + this.earthSphereXOffset;
            
            const earthTransform = this.earthSphere.getTransform();
            const currentPosition = earthTransform.getWorldPosition();
            
            // Mettre à jour la position de la sphère
            earthTransform.setWorldPosition(new vec3(
                newX,
                currentPosition.y,
                currentPosition.z
            ));
            
            // Optionnellement faire tourner la sphère pour un effet visuel supplémentaire
            const rotation = earthTransform.getLocalRotation();
            earthTransform.setLocalRotation(quat.fromEulerAngles(
                rotation.x,
                rotation.y + 0.5, // Tourner un peu sur l'axe Y à chaque frame
                rotation.z
            ));
        }
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
        
        // Stop any playing audio
        if (this.audioComponent && this.isPlaying) {
            this.audioComponent.stop(true);
        }
    }
}