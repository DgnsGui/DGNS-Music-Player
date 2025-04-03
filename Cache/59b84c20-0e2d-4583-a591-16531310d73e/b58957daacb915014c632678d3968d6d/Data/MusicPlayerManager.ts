import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { InteractorEvent } from 'SpectaclesInteractionKit/Core/Interactor/InteractorEvent';

@component
export class MusicPlayerManager extends BaseScriptComponent {
    // Audio tracks
    @input('Asset.AudioTrackAsset') track1: AudioTrackAsset;
    @input('Asset.AudioTrackAsset') track2: AudioTrackAsset;
    @input('Asset.AudioTrackAsset') track3: AudioTrackAsset;

    // UI Components
    @input('Component.Text') artistNameText: Text;
    @input('Component.Text') timecodeText: Text;
    @input('Component.Text') trackTitleText: Text;

    // Control buttons
    @input('Component.ScriptComponent') playPauseButton: PinchButton;
    @input('Component.ScriptComponent') nextTrackButton: PinchButton;
    @input('Component.ScriptComponent') prevTrackButton: PinchButton;

    // Audio Component
    @input('Component.AudioComponent') audioComponent: AudioComponent;

    // Track metadata
    @input('string') artist1: string = "Artiste 1";
    @input('string') title1: string = "Titre 1";
    @input('string') artist2: string = "Artiste 2";
    @input('string') title2: string = "Titre 2";
    @input('string') artist3: string = "Artiste 3";
    @input('string') title3: string = "Titre 3";

    // Playback options
    @input('bool') loopPlayback: boolean = false;
    @input('bool') shufflePlayback: boolean = false;

    // Private variables
    private currentTrackIndex: number = 0;
    private isPlaying: boolean = false;
    private tracks: AudioTrackAsset[] = [];
    private artists: string[] = [];
    private titles: string[] = [];
    private currentPlaybackTime: number = 0;
    private audioInitialized: boolean = false;
    private isShuffling: boolean = false;
    private trackOrder: number[] = [0, 1, 2]; // Default track order

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

        // Setup button callbacks
        this.setupCallbacks();

        // Create update event
        this.createEvent("UpdateEvent").bind(() => {
            this.updatePlayer();
        });

        // Initialize audio with a delay to ensure the AudioComponent is ready
        this.delayedCall(0.5, () => {
            this.loadTrack(0);
            print("MusicPlayerManager initialized with " + this.tracks.length + " tracks");
        });
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
        if (this.isShuffling) {
            this.shuffleTracks();
        } else if (this.currentTrackIndex < this.tracks.length - 1 || this.loopPlayback) {
            this.nextTrack();
        } else {
            this.isPlaying = false;
            print("Playback completed");
        }
    }

    private shuffleTracks(): void {
        const remainingTracks = this.trackOrder.filter(index => index !== this.currentTrackIndex);
        const randomIndex = Math.floor(Math.random() * remainingTracks.length);
        this.currentTrackIndex = remainingTracks[randomIndex];
        this.loadTrack(this.currentTrackIndex);
    }

    private loadTrack(index: number): void {
        if (index >= 0 && index < this.tracks.length) {
            const wasPlaying = this.isPlaying;
            this.isPlaying = false;
            this.audioInitialized = false;

            if (this.isPlaying) {
                this.audioComponent.stop(true);
            }

            this.currentTrackIndex = index;
            this.audioComponent.audioTrack = null;

            this.delayedCall(0.05, () => {
                this.audioComponent.audioTrack = this.tracks[this.currentTrackIndex];
                this.setupTrackFinishedCallback();
                this.currentPlaybackTime = 0;

                this.updateTrackInfo();

                this.delayedCall(0.1, () => {
                    this.audioInitialized = true;
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
            if (this.currentPlaybackTime > 0) {
                (this.audioComponent as any).currentTime = this.currentPlaybackTime;
            }

            this.audioComponent.play(1);
            this.isPlaying = true;
        }
    }

    private pauseTrack(): void {
        if (this.isPlaying && this.audioComponent) {
            try {
                this.audioComponent.pause();
                this.isPlaying = false;

                try {
                    const currentTime = (this.audioComponent as any).currentTime;
                    if (!isNaN(currentTime)) {
                        this.currentPlaybackTime = currentTime;
                    }
                } catch (e) {
                    this.currentPlaybackTime = getTime() - this.trackStartTime;
                }

                print("Paused track: " + this.titles[this.currentTrackIndex]);
            } catch (e) {
                print("Error pausing track: " + e);
            }
        }
    }

    private nextTrack(): void {
        const nextIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        this.loadTrack(nextIndex);
    }

    private prevTrack(): void {
        const prevIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
        this.loadTrack(prevIndex);
    }

    private updatePlayer(): void {
        if (!this.audioInitialized) {
            return;
        }

        if (this.timecodeText && this.audioComponent) {
            let currentTime = 0;
            let totalTime = this.audioComponent.duration || 0;

            if (isNaN(totalTime) || totalTime <= 0) {
                return;
            }

            try {
                currentTime = (this.audioComponent as any).currentTime || (getTime() - this.trackStartTime);
            } catch (e) {
                currentTime = getTime() - this.trackStartTime;
            }

            this.timecodeText.text = this.formatTime(currentTime) + " / " + this.formatTime(totalTime);
        }
    }

    private formatTime(timeInSeconds: number): string {
        timeInSeconds = Math.max(0, timeInSeconds);
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return minutes.toString().padStart(2,
