import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { InteractorEvent } from 'SpectaclesInteractionKit/Core/Interactor/InteractorEvent';
import { BaseScriptComponent } from '@snap/ScriptComponent'; // Assurez-vous que cette importation est correcte selon votre environnement

@component
export class OptimizedMusicPlayer extends BaseScriptComponent {
    // Audio tracks et metadata
    @input('Asset.AudioTrackAsset[]') tracks: AudioTrackAsset[];
    @input('string[]') artists: string[] = ["Artist 1", "Artist 2", "Artist 3"];
    @input('string[]') titles: string[] = ["Title 1", "Title 2", "Title 3"];

    // UI Components
    @input('Component.Text') artistNameText: Text;
    @input('Component.Text') trackTitleText: Text;
    @input('Component.Text') timecodeText: Text;

    // Control buttons
    @input('Component.ScriptComponent') playPauseButton: PinchButton;
    @input('Component.ScriptComponent') nextTrackButton: PinchButton;
    @input('Component.ScriptComponent') prevTrackButton: PinchButton;
    @input('Component.ScriptComponent') stopButton: PinchButton;
    @input('Component.ScriptComponent') shuffleButton: PinchButton;
    @input('Component.ScriptComponent') repeatButton: PinchButton;

    // Audio Component
    @input('Component.AudioComponent') audioComponent: AudioComponent;

    // Playback options
    @input('bool') autoPlayOnStart: boolean = false;
    @input('bool') loopPlayback: boolean = false;

    // Private state
    private currentTrackIndex: number = 0;
    private isPlaying: boolean = false;
    private shuffleMode: boolean = false;
    private repeatMode: 'off' | 'all' | 'one' = 'off';
    private shuffledIndices: number[] = [];
    private playbackStartTime: number = 0;
    private pausedTime: number = 0;
    private isInitialized: boolean = false;

    onAwake(): void {
        this.validateInputs();
        this.setupCallbacks();
        this.createEvent("UpdateEvent").bind(() => this.updateTimecode());
        this.initializePlayer();
    }

    private validateInputs(): void {
        if (!this.tracks?.length) throw new Error("No audio tracks provided");
        if (!this.audioComponent) throw new Error("Audio component not set");
        if (this.artists.length !== this.tracks.length || this.titles.length !== this.tracks.length) {
            print("Warning: Metadata arrays length mismatch with tracks");
        }
    }

    private setupCallbacks(): void {
        this.playPauseButton?.onButtonPinched((e: InteractorEvent) => this.togglePlayPause());
        this.nextTrackButton?.onButtonPinched((e: InteractorEvent) => this.nextTrack());
        this.prevTrackButton?.onButtonPinched((e: InteractorEvent) => this.prevTrack());
        this.stopButton?.onButtonPinched((e: InteractorEvent) => this.stopPlayback());
        this.shuffleButton?.onButtonPinched((e: InteractorEvent) => this.toggleShuffle());
        this.repeatButton?.onButtonPinched((e: InteractorEvent) => this.toggleRepeat());
        this.audioComponent.setOnFinish(() => this.handleTrackEnd());
    }

    private initializePlayer(): void {
        this.delayedCall(0.1, () => {
            this.loadTrack(this.current keyboard.currentTrackIndex);
            this.isInitialized = true;
            if (this.autoPlayOnStart) this.playTrack();
            print(`Music player initialized with ${this.tracks.length} tracks`);
        });
    }

    private loadTrack(index: number): void {
        if (!this.isValidIndex(index)) return;

        this.currentTrackIndex = index;
        this.audioComponent.audioTrack = this.tracks[index];
        this.updateTrackInfo();
        this.resetPlaybackTime();
    }

    private playTrack(): void {
        if (!this.isInitialized || !this.audioComponent.audioTrack) return;

        try {
            if (this.pausedTime > 0) {
                (this.audioComponent as any).currentTime = this.pausedTime;
            }
            this.audioComponent.play(this.repeatMode === 'one' ? -1 : 1);
            this.isPlaying = true;
            this.playbackStartTime = getTime() - this.pausedTime;
            this.pausedTime = 0;
            print(`Playing: ${this.titles[this.currentTrackIndex]}`);
        } catch (e) {
            print(`Error playing track: ${e}`);
            this.retryPlayback();
        }
    }

    private pauseTrack(): void {
        if (!this.isPlaying) return;
        
        this.audioComponent.pause();
        this.isPlaying = false;
        this.pausedTime = this.getCurrentTime();
        print(`Paused at ${this.formatTime(this.pausedTime)}`);
    }

    private stopPlayback(): void {
        if (!this.isInitialized) return;

        this.audioComponent.stop(true);
        this.isPlaying = false;
        this.pausedTime = 0;
        this.resetPlaybackTime();
        this.updateTimecode();
        print("Playback stopped");
    }

    private togglePlayPause(): void {
        this.isPlaying ? this.pauseTrack() : this.playTrack();
    }

    private nextTrack(): void {
        const nextIndex = this.getNextIndex();
        this.loadTrack(nextIndex);
        if (this.isPlaying) this.playTrack();
    }

    private prevTrack(): void {
        const currentTime = this.getCurrentTime();
        const prevIndex = this.getPrevIndex();
        
        // Si < 2s de lecture, aller au morceau précédent, sinon restart
        if (currentTime < 2 && this.currentTrackIndex === prevIndex) {
            this.loadTrack(prevIndex);
        } else {
            this.resetPlaybackTime();
        }
        
        if (this.isPlaying) this.playTrack();
    }

    private toggleShuffle(): void {
        this.shuffleMode = !this.shuffleMode;
        if (this.shuffleMode) {
            this.shuffledIndices = this.generateShuffledIndices();
        }
        print(`Shuffle ${this.shuffleMode ? 'enabled' : 'disabled'}`);
    }

    private toggleRepeat(): void {
        this.repeatMode = this.repeatMode === 'off' ? 'all' : 
                         this.repeatMode === 'all' ? 'one' : 'off';
        print(`Repeat mode: ${this.repeatMode}`);
    }

    private handleTrackEnd(): void {
        if (this.repeatMode === 'one') return;

        if (this.repeatMode === 'all' || (this.loopPlayback && this.currentTrackIndex < this.tracks.length - 1)) {
            this.nextTrack();
        } else {
            this.stopPlayback();
        }
    }

    private getNextIndex(): number {
        if (this.shuffleMode) {
            const currentShuffleIdx = this.shuffledIndices.indexOf(this.currentTrackIndex);
            return this.shuffledIndices[(currentShuffleIdx + 1) % this.tracks.length];
        }
        return (this.currentTrackIndex + 1) % this.tracks.length;
    }

    private getPrevIndex(): number {
        if (this.shuffleMode) {
            const currentShuffleIdx = this.shuffledIndices.indexOf(this.currentTrackIndex);
            return this.shuffledIndices[(currentShuffleIdx - 1 + this.tracks.length) % this.tracks.length];
        }
        return (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
    }

    private generateShuffledIndices(): number[] {
        const indices = Array.from({ length: this.tracks.length }, (_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        return indices;
    }

    private updateTrackInfo(): void {
        this.artistNameText && (this.artistNameText.text = this.artists[this.currentTrackIndex] || "Unknown Artist");
        this.trackTitleText && (this.trackTitleText.text = this.titles[this.currentTrackIndex] || "Unknown Title");
    }

    private updateTimecode(): void {
        if (!this.timecodeText || !this.audioComponent.audioTrack) return;

        const current = this.getCurrentTime();
        const total = this.audioComponent.duration || 0;
        this.timecodeText.text = `${this.formatTime(current)} / ${this.formatTime(total)}`;
    }

    private getCurrentTime(): number {
        if (!this.isPlaying) return this.pausedTime;
        return getTime() - this.playbackStartTime;
    }

    private resetPlaybackTime(): void {
        this.playbackStartTime = getTime();
        this.pausedTime = 0;
    }

    private formatTime(seconds: number): string {
        seconds = Math.max(0, seconds);
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    private isValidIndex(index: number): boolean {
        return index >= 0 && index < this.tracks.length;
    }

    private retryPlayback(): void {
        this.delayedCall(0.2, () => this.playTrack());
    }

    private delayedCall(delay: number, callback: () => void): void {
        const event = this.createEvent("UpdateEvent");
        const start = getTime();
        event.bind(() => {
            if (getTime() - start >= delay) {
                callback();
                event.enabled = false;
            }
        });
    }

    onDestroy(): void {
        this.stopPlayback();
        // Nettoyage des callbacks omis pour simplicité, à ajouter si nécessaire
    }
}