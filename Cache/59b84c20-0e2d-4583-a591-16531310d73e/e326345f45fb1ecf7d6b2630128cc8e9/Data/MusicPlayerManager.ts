import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { InteractorEvent } from 'SpectaclesInteractionKit/Core/Interactor/InteractorEvent';

@component
export class MusicPlayerManager extends BaseScriptComponent {
    // Audio track inputs
    @input('Asset.AudioTrackAsset[]')
    musicTracks: AudioTrackAsset[];

    // UI text elements
    @input('Component.Text')
    artistNameText: Text;

    @input('Component.Text')
    trackNameText: Text;

    @input('Component.Text')
    yearLabelText: Text;

    @input('Component.Text')
    timecodeText: Text;

    // Button components
    @input('Component.ScriptComponent')
    @hint('PinchButton component')
    playPauseButton: PinchButton;

    @input('Component.ScriptComponent')
    @hint('PinchButton component')
    nextTrackButton: PinchButton;

    @input('Component.ScriptComponent')
    @hint('PinchButton component')
    backTrackButton: PinchButton;

    @input('Component.ScriptComponent')
    @hint('PinchButton component')
    shuffleButton: PinchButton;

    @input('Component.ScriptComponent')
    @hint('PinchButton component')
    repeatButton: PinchButton;

    @input('Component.ScriptComponent')
    @hint('PinchButton component')
    stopButton: PinchButton;

    // Progress bar elements
    @input('SceneObject')
    progressBar: SceneObject;

    @input('SceneObject')
    @hint('Earth moving along the progress bar')
    progressSphere: SceneObject;

    // Custom UI elements
    @input('Component.Image')
    @showIf('useCustomUI')
    @hint('Play Button Image')
    playButtonImage: Image;

    @input('Component.Image')
    @showIf('useCustomUI')
    @hint('Pause Button Image')
    pauseButtonImage: Image;

    @input('Component.Image')
    @showIf('useCustomUI')
    @hint('Shuffle Active Image')
    shuffleActiveImage: Image;

    @input('Component.Image')
    @showIf('useCustomUI')
    @hint('Shuffle Inactive Image')
    shuffleInactiveImage: Image;

    @input('Component.Image')
    @showIf('useCustomUI')
    @hint('Repeat Active Image')
    repeatActiveImage: Image;

    @input('Component.Image')
    @showIf('useCustomUI')
    @hint('Repeat Inactive Image')
    repeatInactiveImage: Image;

    @input('boolean')
    @hint('Use Custom UI')
    useCustomUI: boolean = false;

    @input('boolean')
    @hint('Debug Mode')
    debugMode: boolean = false;

    // State management variables
    private currentTrackIndex: number = 0;
    private isPlaying: boolean = false;
    private isRepeat: boolean = false;
    private isShuffle: boolean = false;

    // Progress bar positions
    private startPosition: vec3;
    private endPosition: vec3;
    private barLength: number;

    // Audio component
    private audioComponent: AudioComponent;

    // Button callback references
    private playPauseCallback: (event: InteractorEvent) => void;
    private nextTrackCallback: (event: InteractorEvent) => void;
    private backTrackCallback: (event: InteractorEvent) => void;
    private shuffleCallback: (event: InteractorEvent) => void;
    private repeatCallback: (event: InteractorEvent) => void;
    private stopCallback: (event: InteractorEvent) => void;

    // LifeCycle Methods
    onAwake(): void {
        this.initialize();
    }

    onUpdate(): void {
        this.checkTrackStatus();
        this.updateProgress();
    }

    onDestroy(): void {
        // Remove all event listeners
        this.removeButtonListeners();
    }

    // Initialize manager
    private initialize(): void {
        // Create or get the audio component
        this.setupAudioComponent();
        
        // Configure interaction buttons
        this.setupButtonListeners();
        
        // Set up progress bar
        this.setupProgressBar();
        
        // Initialize UI with first track
        this.updateTrackInfo();
        
        this.logDebug(`Music Player Manager initialized with ${this.musicTracks ? this.musicTracks.length : 0} tracks`);
    }

    private setupAudioComponent(): void {
        // Get existing audio component or create a new one
        if (!this.getSceneObject().getComponent("AudioComponent")) {
            this.audioComponent = this.getSceneObject().createComponent("AudioComponent") as AudioComponent;
            this.logDebug("Created new AudioComponent");
        } else {
            this.audioComponent = this.getSceneObject().getComponent("AudioComponent") as AudioComponent;
            this.logDebug("Using existing AudioComponent");
        }
        
        // Set initial track if available
        if (this.musicTracks && this.musicTracks.length > 0) {
            this.audioComponent.audioTrack = this.musicTracks[this.currentTrackIndex];
        }
    }

    private setupProgressBar(): void {
        if (this.progressBar && this.progressSphere) {
            const barTransform = this.progressBar.getTransform();
            const barScale = barTransform.getLocalScale();
            
            this.startPosition = this.progressBar.getTransform().getLocalPosition().add(new vec3(-barScale.x/2, 0, 0));
            this.endPosition = this.progressBar.getTransform().getLocalPosition().add(new vec3(barScale.x/2, 0, 0));
            this.barLength = barScale.x;
            
            // Reset progress sphere position
            this.progressSphere.getTransform().setLocalPosition(this.startPosition);
        }
    }

    private setupButtonListeners(): void {
        if (this.playPauseButton) {
            this.playPauseCallback = () => this.togglePlayPause();
            this.playPauseButton.onButtonPinched(this.playPauseCallback);
            this.logDebug("PlayPause button setup");
        }
        
        if (this.nextTrackButton) {
            this.nextTrackCallback = () => this.nextTrack();
            this.nextTrackButton.onButtonPinched(this.nextTrackCallback);
            this.logDebug("NextTrack button setup");
        }
        
        if (this.backTrackButton) {
            this.backTrackCallback = () => this.previousTrack();
            this.backTrackButton.onButtonPinched(this.backTrackCallback);
            this.logDebug("BackTrack button setup");
        }
        
        if (this.shuffleButton) {
            this.shuffleCallback = () => this.toggleShuffle();
            this.shuffleButton.onButtonPinched(this.shuffleCallback);
            this.logDebug("Shuffle button setup");
        }
        
        if (this.repeatButton) {
            this.repeatCallback = () => this.toggleRepeat();
            this.repeatButton.onButtonPinched(this.repeatCallback);
            this.logDebug("Repeat button setup");
        }
        
        if (this.stopButton) {
            this.stopCallback = () => this.stopTrack();
            this.stopButton.onButtonPinched(this.stopCallback);
            this.logDebug("Stop button setup");
        }
    }

    private removeButtonListeners(): void {
        if (this.playPauseButton && this.playPauseCallback) {
            this.playPauseButton.onButtonPinched.remove(this.playPauseCallback);
        }
        
        if (this.nextTrackButton && this.nextTrackCallback) {
            this.nextTrackButton.onButtonPinched.remove(this.nextTrackCallback);
        }
        
        if (this.backTrackButton && this.backTrackCallback) {
            this.backTrackButton.onButtonPinched.remove(this.backTrackCallback);
        }
        
        if (this.shuffleButton && this.shuffleCallback) {
            this.shuffleButton.onButtonPinched.remove(this.shuffleCallback);
        }
        
        if (this.repeatButton && this.repeatCallback) {
            this.repeatButton.onButtonPinched.remove(this.repeatCallback);
        }
        
        if (this.stopButton && this.stopCallback) {
            this.stopButton.onButtonPinched.remove(this.stopCallback);
        }
    }

    private checkTrackStatus(): void {
        if (!this.isPlaying || !this.audioComponent || !this.audioComponent.audioTrack) return;
        
        // Check if track finished playing
        if (!this.audioComponent.isPlaying() && !this.audioComponent.isPaused() && this.audioComponent.getTime() > 0) {
            this.onTrackFinished();
        }
    }

    private getCurrentTrack(): AudioComponent | null {
        if (!this.musicTracks || this.musicTracks.length === 0 || 
            this.currentTrackIndex >= this.musicTracks.length) {
            return null;
        }
        
        if (this.audioComponent) {
            this.audioComponent.audioTrack = this.musicTracks[this.currentTrackIndex];
        }
        
        return this.audioComponent;
    }

    // Track control methods
    public togglePlayPause(): void {
        if (!this.audioComponent || !this.musicTracks || 
            this.musicTracks.length === 0 || 
            this.currentTrackIndex >= this.musicTracks.length) {
            this.logDebug("No tracks available");
            return;
        }
        
        // Make sure the current track is set
        this.audioComponent.audioTrack = this.musicTracks[this.currentTrackIndex];
        
        if (this.isPlaying) {
            this.audioComponent.pause();
            this.isPlaying = false;
            this.logDebug("Track paused");
        } else {
            if (this.audioComponent.isPaused()) {
                this.audioComponent.resume();
            } else {
                this.audioComponent.play(1);
            }
            this.isPlaying = true;
            this.logDebug(`Track playing: ${this.musicTracks[this.currentTrackIndex].name}`);
        }
        
        this.updateUI();
    }

    public stopTrack(): void {
        if (!this.audioComponent || !this.audioComponent.audioTrack) return;
        
        this.audioComponent.stop();
        this.isPlaying = false;
        
        // Reset progress sphere position
        if (this.progressSphere && this.startPosition) {
            this.progressSphere.getTransform().setLocalPosition(this.startPosition);
        }
        
        this.updateUI();
        this.logDebug("Track stopped");
    }

    public nextTrack(): void {
        if (!this.audioComponent || !this.musicTracks || this.musicTracks.length === 0) return;
        
        // Stop current track
        this.audioComponent.stop();
        
        // Move to next track
        if (this.isShuffle) {
            let newIndex: number;
            // Ensure we don't pick the same track in shuffle mode
            if (this.musicTracks.length > 1) {
                do {
                    newIndex = Math.floor(Math.random() * this.musicTracks.length);
                } while (newIndex === this.currentTrackIndex);
                
                this.currentTrackIndex = newIndex;
            } else {
                this.currentTrackIndex = 0;
            }
        } else {
            this.currentTrackIndex = (this.currentTrackIndex + 1) % this.musicTracks.length;
        }
        
        // Update track
        this.audioComponent.audioTrack = this.musicTracks[this.currentTrackIndex];
        
        // Update UI and play if needed
        this.updateTrackInfo();
        
        if (this.isPlaying) {
            this.audioComponent.play(1);
        }
        
        this.logDebug(`Next track: ${this.musicTracks[this.currentTrackIndex].name}`);
    }

    public previousTrack(): void {
        if (!this.audioComponent || !this.musicTracks || this.musicTracks.length === 0) return;
        
        // Stop current track
        this.audioComponent.stop();
        
        // Move to previous track
        if (this.isShuffle) {
            let newIndex: number;
            // Ensure we don't pick the same track in shuffle mode
            if (this.musicTracks.length > 1) {
                do {
                    newIndex = Math.floor(Math.random() * this.musicTracks.length);
                } while (newIndex === this.currentTrackIndex);
                
                this.currentTrackIndex = newIndex;
            } else {
                this.currentTrackIndex = 0;
            }
        } else {
            this.currentTrackIndex = (this.currentTrackIndex - 1 + this.musicTracks.length) % this.musicTracks.length;
        }
        
        // Update track
        this.audioComponent.audioTrack = this.musicTracks[this.currentTrackIndex];
        
        // Update UI and play if needed
        this.updateTrackInfo();
        
        if (this.isPlaying) {
            this.audioComponent.play(1);
        }
        
        this.logDebug(`Previous track: ${this.musicTracks[this.currentTrackIndex].name}`);
    }

    public toggleShuffle(): void {
        this.isShuffle = !this.isShuffle;
        this.updateUI();
        this.logDebug(`Shuffle mode: ${this.isShuffle ? "ON" : "OFF"}`);
    }

    public toggleRepeat(): void {
        this.isRepeat = !this.isRepeat;
        this.updateUI();
        this.logDebug(`Repeat mode: ${this.isRepeat ? "ON" : "OFF"}`);
    }

    private onTrackFinished(): void {
        this.logDebug("Track finished");
        
        if (this.isRepeat) {
            // Replay same track
            if (this.audioComponent) {
                this.audioComponent.stop();
                this.audioComponent.play(1);
                this.logDebug(`Repeating track: ${this.musicTracks[this.currentTrackIndex].name}`);
            }
        } else {
            // Move to next track
            this.nextTrack();
        }
    }

    // UI update methods
    private updateTrackInfo(): void {
        if (!this.musicTracks || this.currentTrackIndex >= this.musicTracks.length) return;
        
        const currentTrack = this.musicTracks[this.currentTrackIndex];
        let trackName = currentTrack.name || "";
        let artistName = "";
        let yearLabel = "";
        
        // Parse track information from filename
        if (trackName.indexOf(" - ") > -1) {
            const parts = trackName.split(" - ");
            artistName = parts[0];
            trackName = parts[1];
            
            // Extract year if available (e.g., "TrackName (2023)")
            if (trackName.indexOf("(") > -1 && trackName.indexOf(")") > -1) {
                const yearStart = trackName.lastIndexOf("(") + 1;
                const yearEnd = trackName.lastIndexOf(")");
                if (yearEnd > yearStart) {
                    yearLabel = trackName.substring(yearStart, yearEnd);
                    // Remove year from track name
                    trackName = trackName.substring(0, yearStart - 1).trim();
                }
            }
        }
        
        // Update UI text elements
        this.updateTextElement(this.artistNameText, artistName);
        this.updateTextElement(this.trackNameText, trackName);
        this.updateTextElement(this.yearLabelText, yearLabel);
    }

    private updateTextElement(textComponent: Text, content: string): void {
        if (textComponent) {
            textComponent.text = content;
        }
    }

    private updateProgress(): void {
        if (!this.isPlaying || !this.audioComponent || !this.audioComponent.isPlaying()) return;
        
        // Calculate progress (0 to 1)
        const currentTime = this.audioComponent.getTime();
        const totalDuration = this.audioComponent.getDuration();
        
        // Avoid division by zero
        if (totalDuration <= 0) return;
        
        const progress = currentTime / totalDuration;
        
        // Update timecode
        this.updateTimecode(currentTime, totalDuration);
        
        // Update progress sphere position
        this.updateProgressSphere(progress);
    }

    private updateTimecode(currentTime: number, totalDuration: number): void {
        if (!this.timecodeText) return;
        
        const minutes = Math.floor(currentTime / 60);
        const seconds = Math.floor(currentTime % 60);
        const totalMinutes = Math.floor(totalDuration / 60);
        const totalSeconds = Math.floor(totalDuration % 60);
        
        this.timecodeText.text = `${this.pad(minutes)}:${this.pad(seconds)} / ${this.pad(totalMinutes)}:${this.pad(totalSeconds)}`;
    }

    private updateProgressSphere(progress: number): void {
        if (!this.progressSphere || !this.startPosition || !this.endPosition) return;
        
        // Interpolate position
        const newPosition = vec3.lerp(this.startPosition, this.endPosition, progress);
        this.progressSphere.getTransform().setLocalPosition(newPosition);
        
        // Rotate sphere for visual effect
        const currentRotation = this.progressSphere.getTransform().getLocalRotation();
        const rotationIncrement = quat.angleAxis(0.01, vec3.up());
        this.progressSphere.getTransform().setLocalRotation(currentRotation.multiply(rotationIncrement));
    }

    private updateUI(): void {
        // Update button visuals based on state
        if (this.useCustomUI) {
            // Update play/pause button
            if (this.playButtonImage && this.pauseButtonImage) {
                this.playButtonImage.enabled = !this.isPlaying;
                this.pauseButtonImage.enabled = this.isPlaying;
            }
            
            // Update shuffle button
            if (this.shuffleActiveImage && this.shuffleInactiveImage) {
                this.shuffleActiveImage.enabled = this.isShuffle;
                this.shuffleInactiveImage.enabled = !this.isShuffle;
            }
            
            // Update repeat button
            if (this.repeatActiveImage && this.repeatInactiveImage) {
                this.repeatActiveImage.enabled = this.isRepeat;
                this.repeatInactiveImage.enabled = !this.isRepeat;
            }
        }
    }

    private pad(num: number): string {
        return (num < 10) ? "0" + num : num.toString();
    }

    private logDebug(message: string): void {
        if (this.debugMode) {
            print(`[MusicPlayerManager] ${message}`);
        }
    }
}