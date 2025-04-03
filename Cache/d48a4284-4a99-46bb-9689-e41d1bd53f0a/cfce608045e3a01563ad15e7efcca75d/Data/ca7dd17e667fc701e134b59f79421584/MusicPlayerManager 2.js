"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicPlayerManager = void 0;
var __selfType = requireType("./MusicPlayerManager 2");
function component(target) { target.getTypeName = function () { return __selfType; }; }
let MusicPlayerManager = class MusicPlayerManager extends BaseScriptComponent {
    onAwake() {
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
        print("MusicPlayerManager initialisé avec " + this.tracks.length + " morceaux, en attente de l'entrée utilisateur.");
    }
    setupCallbacks() {
        if (this.playPauseButton) {
            this.onPlayPauseCallback = (event) => this.togglePlayPause();
            this.playPauseButton.onButtonPinched(this.onPlayPauseCallback);
        }
        if (this.nextTrackButton) {
            this.onNextTrackCallback = (event) => this.nextTrack();
            this.nextTrackButton.onButtonPinched(this.onNextTrackCallback);
        }
        if (this.prevTrackButton) {
            this.onPrevTrackCallback = (event) => this.prevTrack();
            this.prevTrackButton.onButtonPinched(this.onPrevTrackCallback);
        }
        if (this.repeatButton) {
            this.onRepeatCallback = (event) => {
                this.isRepeatEnabled = !this.isRepeatEnabled;
                print("Répétition " + (this.isRepeatEnabled ? "activée" : "désactivée"));
            };
            this.repeatButton.onButtonPinched(this.onRepeatCallback);
        }
        if (this.shuffleButton) {
            this.onShuffleCallback = (event) => {
                this.isShuffleEnabled = !this.isShuffleEnabled;
                print("Mode aléatoire " + (this.isShuffleEnabled ? "activé" : "désactivé"));
            };
            this.shuffleButton.onButtonPinched(this.onShuffleCallback);
        }
        if (this.stopButton) {
            this.onStopCallback = (event) => this.stopTrack();
            this.stopButton.onButtonPinched(this.onStopCallback);
        }
        this.setupTrackFinishedCallback();
    }
    setupTrackFinishedCallback() {
        this.onTrackFinishedCallback = () => {
            print("Morceau terminé, gestion de l'action suivante");
            this.handleTrackFinished();
        };
        if (this.audioComponent) {
            this.audioComponent.setOnFinish(this.onTrackFinishedCallback);
        }
    }
    handleTrackFinished() {
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
        }
        else if (this.isShuffleEnabled) {
            const randomIndex = Math.floor(Math.random() * this.tracks.length);
            this.loadTrack(randomIndex);
            this.playTrack();
        }
        else if (this.currentTrackIndex < this.tracks.length - 1 || this.loopPlayback) {
            this.shouldAutoPlay = true;
            this.nextTrack();
        }
        else {
            this.stopTrack();
        }
    }
    setupProgressBar() {
        if (this.progressBar && this.earthSphere) {
            const barTransform = this.progressBar.getTransform();
            const barPosition = barTransform.getLocalPosition();
            const earthTransform = this.earthSphere.getTransform();
            earthTransform.setLocalPosition(new vec3(barPosition.x, barPosition.y, barPosition.z));
            this.updateEarthPosition(0, 1);
        }
    }
    updateSphereRotation() {
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
    loadTrack(index) {
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
    delayedCall(delay, callback) {
        const delayEvent = this.createEvent("UpdateEvent");
        let startTime = getTime();
        delayEvent.bind(() => {
            if (getTime() - startTime >= delay) {
                callback();
                delayEvent.enabled = false;
            }
        });
    }
    updateTrackInfo() {
        if (this.currentTrackIndex === -1) {
            if (this.artistNameText)
                this.artistNameText.text = "Aucun morceau";
            if (this.trackTitleText)
                this.trackTitleText.text = "Arrêté";
        }
        else {
            if (this.artistNameText)
                this.artistNameText.text = this.artists[this.currentTrackIndex];
            if (this.trackTitleText)
                this.trackTitleText.text = this.titles[this.currentTrackIndex];
        }
    }
    togglePlayPause() {
        if (this.isPlaying) {
            this.pauseTrack();
        }
        else {
            if (this.currentTrackIndex === -1) {
                this.loadTrack(0);
                this.delayedCall(0.2, () => this.playTrack());
            }
            else {
                this.playTrack();
            }
        }
    }
    playTrack() {
        if (!this.isPlaying && this.audioComponent && this.audioComponent.audioTrack && this.audioInitialized) {
            try {
                if (this.isPaused) {
                    this.audioComponent.resume();
                    this.isPlaying = true;
                    this.isPaused = false;
                    this.trackStartTime = getTime() - this.currentPlaybackTime;
                    print("Reprise du morceau : " + this.titles[this.currentTrackIndex] + " à partir de " + this.formatTime(this.currentPlaybackTime));
                }
                else {
                    this.audioComponent.play(1);
                    this.isPlaying = true;
                    this.trackStartTime = getTime();
                    this.currentPlaybackTime = 0;
                    print("Lecture du morceau : " + this.titles[this.currentTrackIndex]);
                }
            }
            catch (e) {
                print("Erreur lors de la lecture du morceau : " + e);
            }
        }
        else if (!this.audioInitialized) {
            print("Impossible de lire le morceau : Audio non encore initialisé");
        }
    }
    pauseTrack() {
        if (this.isPlaying && this.audioComponent) {
            try {
                this.audioComponent.pause();
                this.isPlaying = false;
                this.isPaused = true;
                this.currentPlaybackTime = getTime() - this.trackStartTime;
                print("Morceau en pause : " + this.titles[this.currentTrackIndex] + " à " + this.formatTime(this.currentPlaybackTime));
            }
            catch (e) {
                print("Erreur lors de la mise en pause du morceau : " + e);
            }
        }
    }
    stopTrack() {
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
            print("Lecture complètement arrêtée");
        }
    }
    nextTrack() {
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
        }
        else {
            let nextIndex;
            if (this.isShuffleEnabled) {
                nextIndex = Math.floor(Math.random() * this.tracks.length);
            }
            else {
                nextIndex = this.currentTrackIndex + 1;
                if (nextIndex >= this.tracks.length) {
                    if (this.loopPlayback) {
                        nextIndex = 0;
                    }
                    else {
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
    prevTrack() {
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
        }
        else {
            let prevIndex;
            if (this.isShuffleEnabled) {
                prevIndex = Math.floor(Math.random() * this.tracks.length);
            }
            else {
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
    updatePlayer() {
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
                }
                else {
                    currentTime = this.currentPlaybackTime;
                }
                this.timecodeText.text = this.formatTime(currentTime) + " / " + this.formatTime(totalTime);
                this.updateEarthPosition(currentTime, totalTime);
            }
            catch (e) {
                print("Erreur lors de la mise à jour du lecteur : " + e);
                if (this.timecodeText) {
                    this.timecodeText.text = "00:00 / 00:00";
                }
            }
        }
    }
    updateEarthPosition(currentTime, totalTime) {
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
                earthTransform.setLocalPosition(new vec3(barPosition.x + localX, barPosition.y, barPosition.z));
            }
            catch (e) {
                print("Erreur lors de la mise à jour de la position de la sphère : " + e);
            }
        }
    }
    formatTime(timeInSeconds) {
        if (isNaN(timeInSeconds) || timeInSeconds === null || timeInSeconds === undefined) {
            return "00:00";
        }
        timeInSeconds = Math.max(0, timeInSeconds);
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
    }
    onDestroy() {
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
    }
    __initialize() {
        super.__initialize();
        this.currentTrackIndex = -1;
        this.isPlaying = false;
        this.isPaused = false;
        this.isRepeatEnabled = false;
        this.isShuffleEnabled = false;
        this.shouldAutoPlay = false;
        this.isManualStop = false;
        this.trackStartTime = 0;
        this.currentPlaybackTime = 0;
        this.audioInitialized = false;
    }
};
exports.MusicPlayerManager = MusicPlayerManager;
exports.MusicPlayerManager = MusicPlayerManager = __decorate([
    component
], MusicPlayerManager);
//# sourceMappingURL=MusicPlayerManager%202.js.map