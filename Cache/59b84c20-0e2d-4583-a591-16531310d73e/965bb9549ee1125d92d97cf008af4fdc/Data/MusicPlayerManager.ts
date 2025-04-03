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

    // Private variables
    private currentTrackIndex: number = 0;
    private isPlaying: boolean = false;
    private tracks: AudioTrackAsset[] = [];
    private artists: string[] = [];
    private titles: string[] = [];
    private progressBarStartX: number = 0;
    private progressBarEndX: number = 0;
    private progressBarLength: number = 0;
    
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
        this.onTrackFinishedCallback = () => this.nextTrack();
        this.audioComponent.setOnFinish(this.onTrackFinishedCallback);
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
            const earthTransform = this.earthSphere.getTransform();
            const earthPosition = earthTransform.getWorldPosition();
            earthTransform.setWorldPosition(new vec3(
                this.progressBarStartX,
                earthPosition.y,
                earthPosition.z
            ));
        }
    }

    private loadTrack(index: number): void {
        if (index >= 0 && index < this.tracks.length) {
            this.currentTrackIndex = index;
            
            // Set the audio track
            this.audioComponent.audioTrack = this.tracks[index];
            
            // Update UI
            this.updateTrackInfo();
            
            print("Loaded track: " + this.titles[index] + " by " + this.artists[index]);
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
            this.audioComponent.play(1);
            this.isPlaying = true;
            print("Playing track: " + this.titles[this.currentTrackIndex]);
        }
    }

    private pauseTrack(): void {
        if (this.isPlaying) {
            this.audioComponent.pause();
            this.isPlaying = false;
            print("Paused track: " + this.titles[this.currentTrackIndex]);
        }
    }

    private nextTrack(): void {
        const nextIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        this.loadTrack(nextIndex);
        
        if (this.isPlaying) {
            this.playTrack();
        }
    }

    private prevTrack(): void {
        const prevIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
        this.loadTrack(prevIndex);
        
        if (this.isPlaying) {
            this.playTrack();
        }
    }

    private updatePlayer(): void {
        // Update timecode text
        if (this.timecodeText && this.audioComponent) {
            // Using the correct property for current playback time
            // According to the documentation
            const currentTime = (this.audioComponent as any).currentTime;
            const totalTime = this.audioComponent.duration;
            
            this.timecodeText.text = this.formatTime(currentTime) + " / " + this.formatTime(totalTime);
            
            // Update earth sphere position
            this.updateEarthPosition(currentTime, totalTime);
        }
    }

    private updateEarthPosition(currentTime: number, totalTime: number): void {
        if (this.earthSphere && totalTime > 0) {
            const progress = currentTime / totalTime;
            const newX = this.progressBarStartX + (this.progressBarLength * progress);
            
            const earthTransform = this.earthSphere.getTransform();
            const currentPosition = earthTransform.getWorldPosition();
            
            earthTransform.setWorldPosition(new vec3(
                newX,
                currentPosition.y,
                currentPosition.z
            ));
            
            // Optionally rotate the earth sphere for additional visual effect
            const rotation = earthTransform.getLocalRotation();
            earthTransform.setLocalRotation(quat.fromEulerAngles(
                rotation.x,
                rotation.y + 0.5, // Rotate a bit on y-axis each frame
                rotation.z
            ));
        }
    }

    private formatTime(timeInSeconds: number): string {
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