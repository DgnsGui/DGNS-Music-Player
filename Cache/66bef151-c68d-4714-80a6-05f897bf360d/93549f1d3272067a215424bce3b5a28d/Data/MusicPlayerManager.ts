import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { InteractorEvent } from 'SpectaclesInteractionKit/Core/Interactor/InteractorEvent';

@component
export class MusicPlayerManager extends BaseScriptComponent {
    @input
    @hint('Liste des morceaux de musique')
    tracks: AudioTrackAsset[];

    @input
    @hint('Liste des noms d\'artistes correspondants aux morceaux')
    artists: string[];

    @input
    @hint('Liste des titres des morceaux')
    titles: string[];

    @input
    @hint('Liste des prefabs à afficher pour chaque morceau (doit correspondre au nombre de morceaux)')
    trackPrefabs: SceneObject[];

    @input('SceneObject')
    @hint('Prefab à afficher lorsque la lecture est arrêtée')
    stoppedPrefab: SceneObject;

    @input('Component.Text')
    @hint('Texte pour afficher le nom de l\'artiste')
    artistNameText: Text;

    @input('Component.Text')
    @hint('Texte pour afficher le timecode actuel')
    timecodeText: Text;

    @input('Component.Text')
    @hint('Texte pour afficher le titre du morceau')
    trackTitleText: Text;

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

    @input('SceneObject')
    @hint('Barre de progression')
    progressBar: SceneObject;

    @input('SceneObject')
    @hint('Sphère terrestre qui se déplace le long de la barre de progression')
    earthSphere: SceneObject;

    @input('Component.AudioComponent')
    @hint('Composant audio pour la lecture de musique')
    audioComponent: AudioComponent;

    @input('bool')
    @hint('Activer la lecture en boucle')
    loopPlayback: boolean = true;

    @input('number')
    @hint('Décalage de la sphère terrestre sur l\'axe X')
    earthSphereXOffset: number = 0;

    @input('number')
    @hint('Vitesse de rotation de la sphère (degrés par seconde)')
    rotationSpeed: number = 30.0;

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
    private isDragging: boolean = false; // New variable for dragging state

    private onPlayPauseCallback: (event: InteractorEvent) => void;
    private onNextTrackCallback: (event: InteractorEvent) => void;
    private onPrevTrackCallback: (event: InteractorEvent) => void;
    private onRepeatCallback: (event: InteractorEvent) => void;
    private onShuffleCallback: (event: InteractorEvent) => void;
    private onStopCallback: (event: InteractorEvent) => void;
    private onTrackFinishedCallback: (audioComponent: AudioComponent) => void;

    onAwake(): void {
        if (!this.tracks || this.tracks.some(track => track == null)) {
            print("Error: All tracks must be defined.");
            return;
        }

        if (!this.artists || !this.titles || this.tracks.length !== this.artists.length || this.tracks.length !== this.titles.length) {
            print("Error: The number of tracks, artists, and titles must match.");
            return;
        }

        if (this.tracks.length === 0) {
            print("Error: No audio tracks provided to MusicPlayerManager.");
            return;
        }

        if (!this.trackPrefabs || this.trackPrefabs.some(prefab => prefab == null)) {
            print("Error: All track prefabs must be defined.");
            return;
        }

        if (this.trackPrefabs.length !== this.tracks.length) {
            print("Error: The number of track prefabs must match the number of tracks.");
            return;
        }

        this.trackPrefabs.forEach(prefab => {
            if (prefab) prefab.enabled = false;
        });
        if (this.stoppedPrefab) {
            this.stoppedPrefab.enabled = false;
        }

        if (!this.audioComponent) {
            print("Error: Audio component not defined in MusicPlayerManager.");
            return;
        }

        if (!this.earthSphere || !this.progressBar) {
            print("Warning: Progress visualization objects are not defined in MusicPlayerManager.");
            return;
        }

        this.setupCallbacks();
        this.setupProgressBar();
        this.setupSphereDragging(); // New method to enable dragging

        this.createEvent("UpdateEvent").bind(() => {
            this.updatePlayer();
            this.updateSphereRotation();
        });

        this.updateActivePrefab();

        print("MusicPlayerManager initialized with " + this.tracks.length + " tracks, awaiting user input.");
    }

    private setupCallbacks(): void {
        if (this.playPauseButton) {
            this.onPlayPauseCallback = (event: InteractorEvent) => this.togglePlayPause();
            this.playPauseButton.onButtonPinched.add(this.onPlayPauseCallback);
        }

        if (this.nextTrackButton) {
            this.onNextTrackCallback = (event: InteractorEvent) => this.nextTrack();
            this.nextTrackButton.onButtonPinched.add(this.onNextTrackCallback);
        }

        if (this.prevTrackButton) {
            this.onPrevTrackCallback = (event: InteractorEvent) => this.prevTrack();
            this.prevTrackButton.onButtonPinched.add(this.onPrevTrackCallback);
        }

        if (this.repeatButton) {
            this.onRepeatCallback = (event: InteractorEvent) => {
                this.isRepeatEnabled = !this.isRepeatEnabled;
                print("Repeat " + (this.isRepeatEnabled ? "enabled" : "disabled"));
            };
            this.repeatButton.onButtonPinched.add(this.onRepeatCallback);
        }

        if (this.shuffleButton) {
            this.onShuffleCallback = (event: InteractorEvent) => {
                this.isShuffleEnabled = !this.isShuffleEnabled;
                print("Shuffle mode " + (this.isShuffleEnabled ? "enabled" : "disabled"));
            };
            this.shuffleButton.onButtonPinched.add(this.onShuffleCallback);
        }

        if (this.stopButton) {
            this.onStopCallback = (event: InteractorEvent) => this.stopTrack();
            this.stopButton.onButtonPinched.add(this.onStopCallback);
        }

        this.setupTrackFinishedCallback();
    }

    private setupTrackFinishedCallback(): void {
        this.onTrackFinishedCallback = (audioComponent: AudioComponent) => {
            print("Track finished, handling next action");
            this.handleTrackFinished();
        };

        if (this.audioComponent) {
            this.audioComponent.setOnFinish(this.onTrackFinishedCallback);
        }
    }

    private handleTrackFinished(): void {
        if (this.isManualStop) {
            print("Manual stop detected, skipping handleTrackFinished.");
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

    // New method to set up dragging functionality for the sphere
    private setupSphereDragging(): void {
        if (!this.earthSphere) {
            print("Error: earthSphere not defined for dragging setup.");
            return;
        }

        let interactor = this.earthSphere.getComponent("Component.Interactor");
        if (!interactor) {
            interactor = this.earthSphere.addComponent("Component.Interactor");
            print("Added Interactor component to earthSphere dynamically.");
        }

        interactor.onDragStart.add((event: InteractorEvent) => {
            if (this.audioComponent && this.audioInitialized) {
                this.isDragging = true;
                if (this.isPlaying) {
                    this.pauseTrack(); // Pause while dragging
                }
            }
        });

        interactor.onDragUpdate.add((event: InteractorEvent) => {
            if (this.isDragging) {
                const barTransform = this.progressBar.getTransform();
                const barPosition = barTransform.getLocalPosition();
                const barScale = barTransform.getLocalScale();
                const halfLength = barScale.x / 2;

                const dragPosition = event.interactor.getPosition();
                const barWorldPosition = barTransform.getWorldPosition();
                const localX = dragPosition.x - barWorldPosition.x;
                const clampedX = Math.max(-halfLength, Math.min(halfLength, localX)) + this.earthSphereXOffset;

                const earthTransform = this.earthSphere.getTransform();
                earthTransform.setLocalPosition(new vec3(
                    barPosition.x + clampedX,
                    barPosition.y,
                    barPosition.z
                ));
            }
        });

        interactor.onDragEnd.add((event: InteractorEvent) => {
            if (this.isDragging) {
                this.isDragging = false;
                this.updatePlaybackPositionAfterDrag();
                if (this.isPlaying || this.isPaused) {
                    this.playTrack(); // Resume playback
                }
            }
        });
    }

    // New method to update playback position after dragging
    private updatePlaybackPositionAfterDrag(): void {
        if (!this.audioComponent || !this.audioInitialized) {
            return;
        }

        const barTransform = this.progressBar.getTransform();
        const barScale = barTransform.getLocalScale();
        const barPosition = barTransform.getLocalPosition();
        const halfLength = barScale.x / 2;

        const earthX = this.earthSphere.getTransform().getLocalPosition().x - barPosition.x - this.earthSphereXOffset;
        const progress = (earthX + halfLength) / barScale.x;
        const clampedProgress = Math.max(0, Math.min(1, progress));

        const totalTime = this.audioComponent.duration || 0;
        if (totalTime > 0) {
            this.currentPlaybackTime = clampedProgress * totalTime;
            this.trackStartTime = getTime() - this.currentPlaybackTime;
            this.audioComponent.position = this.currentPlaybackTime; // Set new audio position
            print("Playback skipped to: " + this.formatTime(this.currentPlaybackTime));
        }
    }

    private updateSphereRotation(): void {
        if (this.earthSphere) {
            const deltaTime = getDeltaTime();
            const earthTransform = this.earthSphere.getTransform();
            const currentRotation = earthTransform.getLocalRotation();

            const rotationDelta = quat.fromEulerAngles(0, this.rotationSpeed * deltaTime * (Math.PI / 180), 0);
            const newRotation = currentRotation.multiply(rotationDelta);

            earthTransform.setLocalRotation(newRotation);
        }
    }

    private updateActivePrefab(): void {
        if (this.currentActivePrefab) {
            this.currentActivePrefab.enabled = false;
            this.currentActivePrefab = null;
        }

        if (this.currentTrackIndex === -1) {
            if (this.stoppedPrefab) {
                this.stoppedPrefab.enabled = true;
                this.currentActivePrefab = this.stoppedPrefab;
                print("Stopped prefab activated.");
            }
        } else {
            if (this.trackPrefabs[this.currentTrackIndex]) {
                this.trackPrefabs[this.currentTrackIndex].enabled = true;
                this.currentActivePrefab = this.trackPrefabs[this.currentTrackIndex];
                print("Prefab for track " + this.titles[this.currentTrackIndex] + " activated.");
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
                this.updateActivePrefab();

                this.delayedCall(0.1, () => {
                    this.audioInitialized = true;
                    print("Track loaded: " + this.titles[this.currentTrackIndex] + " by " + this.artists[this.currentTrackIndex]);
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
            if (this.artistNameText) this.artistNameText.text = "No track";
            if (this.trackTitleText) this.trackTitleText.text = "Stopped";
        } else {
            if (this.artistNameText) this.artistNameText.text = this.artists[this.currentTrackIndex];
            if (this.trackTitleText) this.trackTitleText.text = this.titles[this.currentTrackIndex];
        }
        this.updateActivePrefab();
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
                    print("Resuming track: " + this.titles[this.currentTrackIndex] + " from " + this.formatTime(this.currentPlaybackTime));
                } else {
                    this.audioComponent.play(1);
                    this.isPlaying = true;
                    this.trackStartTime = getTime();
                    this.currentPlaybackTime = 0;
                    print("Playing track: " + this.titles[this.currentTrackIndex]);
                }
            } catch (e) {
                print("Error playing track: " + e);
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
                this.isPaused = true;
                this.currentPlaybackTime = getTime() - this.trackStartTime;
                print("Track paused: " + this.titles[this.currentTrackIndex] + " at " + this.formatTime(this.currentPlaybackTime));
            } catch (e) {
                print("Error pausing track: " + e);
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
            this.updateActivePrefab();
            print("Playback fully stopped");
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
            print("Moving to next track, new index: " + nextIndex);
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
            print("Moving to previous track, new index: " + prevIndex);
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
                    throw new Error("Invalid duration");
                }

                if (this.isPlaying && !this.isDragging) {
                    currentTime = getTime() - this.trackStartTime;
                    if (currentTime > totalTime) {
                        currentTime = totalTime;
                    }
                } else {
                    currentTime = this.currentPlaybackTime;
                }

                this.timecodeText.text = this.formatTime(currentTime) + " / " + this.formatTime(totalTime);
                if (!this.isDragging) { // Only update sphere position if not dragging
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

    private formatTime(timeInSeconds: number): string {
        if (isNaN(timeInSeconds) || timeInSeconds === null || timeInSeconds === undefined) {
            return "00:00";
        }

        timeInSeconds = Math.max(0, timeInSeconds);
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
    }

    public getCurrentTrackIndex(): number {
        return this.currentTrackIndex;
    }

    public getTrackPrefab(index: number): SceneObject | null {
        if (index >= 0 && index < this.trackPrefabs.length) {
            return this.trackPrefabs[index];
        }
        return null;
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

        if (this.audioComponent) {
            this.audioComponent.setOnFinish(null);
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

        // Clean up dragging events
        const interactor = this.earthSphere?.getComponent("Component.Interactor");
        if (interactor) {
            interactor.onDragStart.removeAll();
            interactor.onDragUpdate.removeAll();
            interactor.onDragEnd.removeAll();
        }
    }
}