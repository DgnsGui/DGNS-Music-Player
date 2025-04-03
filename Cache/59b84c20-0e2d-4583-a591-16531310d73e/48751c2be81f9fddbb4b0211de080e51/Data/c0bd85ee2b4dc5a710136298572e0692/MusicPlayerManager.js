"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicPlayerManager = void 0;
var __selfType = requireType("./MusicPlayerManager");
function component(target) { target.getTypeName = function () { return __selfType; }; }
let MusicPlayerManager = class MusicPlayerManager extends BaseScriptComponent {
    onAwake() {
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
    setupCallbacks() {
        // Setup play/pause button
        if (this.playPauseButton) {
            this.onPlayPauseCallback = (event) => this.togglePlayPause();
            this.playPauseButton.onButtonPinched(this.onPlayPauseCallback);
        }
        // Setup next track button
        if (this.nextTrackButton) {
            this.onNextTrackCallback = (event) => this.nextTrack();
            this.nextTrackButton.onButtonPinched(this.onNextTrackCallback);
        }
        // Setup previous track button
        if (this.prevTrackButton) {
            this.onPrevTrackCallback = (event) => this.prevTrack();
            this.prevTrackButton.onButtonPinched(this.onPrevTrackCallback);
        }
        // Setup track finished callback
        this.onTrackFinishedCallback = () => {
            print("Track finished, playing next track");
            this.handleTrackFinished();
        };
        this.audioComponent.setOnFinish(this.onTrackFinishedCallback);
    }
    handleTrackFinished() {
        if (this.currentTrackIndex < this.tracks.length - 1 || this.loopPlayback) {
            // Go to next track and play it automatically
            this.nextTrack();
        }
        else {
            // Last track finished and no loop
            this.isPlaying = false;
            print("Playback completed");
        }
    }
    setupProgressBar() {
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
            earthTransform.setWorldPosition(new vec3(this.progressBarStartX, earthPosition.y, earthPosition.z));
        }
    }
    loadTrack(index) {
        if (index >= 0 && index < this.tracks.length) {
            // If we were playing, stop the current track first
            if (this.isPlaying) {
                this.audioComponent.stop(true);
            }
            this.currentTrackIndex = index;
            // Set the audio track
            this.audioComponent.audioTrack = this.tracks[index];
            // Reset the progress tracking
            this.trackStartTime = getTime();
            // Update UI
            this.updateTrackInfo();
            print("Loaded track: " + this.titles[index] + " by " + this.artists[index]);
        }
    }
    updateTrackInfo() {
        // Update artist and title text
        if (this.artistNameText) {
            this.artistNameText.text = this.artists[this.currentTrackIndex];
        }
        if (this.trackTitleText) {
            this.trackTitleText.text = this.titles[this.currentTrackIndex];
        }
    }
    togglePlayPause() {
        if (this.isPlaying) {
            this.pauseTrack();
        }
        else {
            this.playTrack();
        }
    }
    playTrack() {
        if (!this.isPlaying) {
            this.audioComponent.play(1);
            this.isPlaying = true;
            print("Playing track: " + this.titles[this.currentTrackIndex]);
        }
    }
    pauseTrack() {
        if (this.isPlaying) {
            this.audioComponent.pause();
            this.isPlaying = false;
            print("Paused track: " + this.titles[this.currentTrackIndex]);
        }
    }
    nextTrack() {
        let nextIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        // Si on est à la fin et que la lecture en boucle est désactivée, on s'arrête
        if (nextIndex === 0 && !this.loopPlayback) {
            this.pauseTrack();
            return;
        }
        // Charge la piste suivante
        this.loadTrack(nextIndex);
        // Continue la lecture automatiquement si on était en train de jouer
        if (this.isPlaying) {
            this.playTrack();
        }
    }
    prevTrack() {
        const prevIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
        this.loadTrack(prevIndex);
        // Continue la lecture automatiquement si on était en train de jouer
        if (this.isPlaying) {
            this.playTrack();
        }
    }
    updatePlayer() {
        // Update timecode text
        if (this.timecodeText && this.audioComponent) {
            // Calculer le temps de lecture manuellement si currentTime ne fonctionne pas
            let currentTime = 0;
            try {
                // Essayer d'abord d'utiliser la propriété currentTime
                currentTime = this.audioComponent.currentTime;
                // Si la valeur est NaN, on utilise notre propre calcul de temps
                if (isNaN(currentTime)) {
                    throw new Error("currentTime is NaN");
                }
            }
            catch (e) {
                // Calculer le temps écoulé depuis le début de la lecture
                // Cette approche est moins précise mais peut fonctionner comme solution de secours
                if (this.isPlaying) {
                    currentTime = getTime() - this.trackStartTime;
                    // S'assurer que le temps ne dépasse pas la durée totale
                    if (currentTime > this.audioComponent.duration) {
                        currentTime = this.audioComponent.duration;
                    }
                }
            }
            const totalTime = this.audioComponent.duration || 0;
            // Formater et afficher le temps
            this.timecodeText.text = this.formatTime(currentTime) + " / " + this.formatTime(totalTime);
            // Update earth sphere position
            this.updateEarthPosition(currentTime, totalTime);
        }
    }
    updateEarthPosition(currentTime, totalTime) {
        if (this.earthSphere && totalTime > 0) {
            // Calculer la progression (entre 0 et 1)
            let progress = currentTime / totalTime;
            // S'assurer que la progression est entre 0 et 1
            progress = Math.max(0, Math.min(1, progress));
            // Calculer la nouvelle position X
            const newX = this.progressBarStartX + (this.progressBarLength * progress);
            const earthTransform = this.earthSphere.getTransform();
            const currentPosition = earthTransform.getWorldPosition();
            // Mettre à jour la position de la sphère
            earthTransform.setWorldPosition(new vec3(newX, currentPosition.y, currentPosition.z));
            // Optionnellement faire tourner la sphère pour un effet visuel supplémentaire
            const rotation = earthTransform.getLocalRotation();
            earthTransform.setLocalRotation(quat.fromEulerAngles(rotation.x, rotation.y + 0.5, // Tourner un peu sur l'axe Y à chaque frame
            rotation.z));
        }
    }
    formatTime(timeInSeconds) {
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
    onDestroy() {
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
    __initialize() {
        super.__initialize();
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.tracks = [];
        this.artists = [];
        this.titles = [];
        this.progressBarStartX = 0;
        this.progressBarEndX = 0;
        this.progressBarLength = 0;
        this.trackStartTime = 0;
    }
};
exports.MusicPlayerManager = MusicPlayerManager;
exports.MusicPlayerManager = MusicPlayerManager = __decorate([
    component
], MusicPlayerManager);
//# sourceMappingURL=MusicPlayerManager.js.map