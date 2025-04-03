// MusicPlayerManager.js
// Script qui gère un lecteur de musique avec 3 pistes et des contrôles d'interface utilisateur
// Pour Spectacles dans Lens Studio

//@input Component.AudioComponent[] musicTracks
//@input Component.Text artistNameText
//@input Component.Text trackNameText
//@input Component.Text yearLabelText
//@input Component.Text timecodeText

//@input Component.InteractableComponent playPauseButton
//@input Component.InteractableComponent nextTrackButton
//@input Component.InteractableComponent backTrackButton
//@input Component.InteractableComponent shuffleButton
//@input Component.InteractableComponent repeatButton
//@input Component.InteractableComponent stopButton

//@input SceneObject progressBar
//@input SceneObject progressSphere // La terre qui se déplace le long de la barre de progression

// Variables de gestion de l'état
var currentTrackIndex = 0;
var isPlaying = false;
var isRepeat = false;
var isShuffle = false;

// Données des pistes
var trackData = [
    { artist: "Artiste 1", name: "Morceau 1", year: "2024" },
    { artist: "Artiste 2", name: "Morceau 2", year: "2023" },
    { artist: "Artiste 3", name: "Morceau 3", year: "2022" }
];

// Positions pour la barre de progression
var startPosition;
var endPosition;
var barLength;

function initialize() {
    // Configuration des boutons d'interaction
    if (script.playPauseButton) {
        script.playPauseButton.onTap.add(togglePlayPause);
    }
    
    if (script.nextTrackButton) {
        script.nextTrackButton.onTap.add(nextTrack);
    }
    
    if (script.backTrackButton) {
        script.backTrackButton.onTap.add(previousTrack);
    }
    
    if (script.shuffleButton) {
        script.shuffleButton.onTap.add(toggleShuffle);
    }
    
    if (script.repeatButton) {
        script.repeatButton.onTap.add(toggleRepeat);
    }
    
    if (script.stopButton) {
        script.stopButton.onTap.add(stopTrack);
    }
    
    // Configuration de la barre de progression
    if (script.progressBar && script.progressSphere) {
        var barTransform = script.progressBar.getTransform();
        var barScale = barTransform.getLocalScale();
        
        startPosition = script.progressBar.getTransform().getLocalPosition().add(new vec3(-barScale.x/2, 0, 0));
        endPosition = script.progressBar.getTransform().getLocalPosition().add(new vec3(barScale.x/2, 0, 0));
        barLength = barScale.x;
    }
    
    // Initialiser l'UI avec la première piste
    updateTrackInfo();
    
    // Définir les événements de fin de piste
    if (script.musicTracks) {
        for (var i = 0; i < script.musicTracks.length; i++) {
            if (script.musicTracks[i]) {
                script.musicTracks[i].onFinish.add(onTrackFinished);
            }
        }
    }
    
    // Commencer la mise à jour de la barre de progression
    var updateEvent = script.createEvent("UpdateEvent");
    updateEvent.bind(updateProgress);
}

function togglePlayPause() {
    if (!script.musicTracks || currentTrackIndex >= script.musicTracks.length) {
        print("Aucune piste disponible");
        return;
    }
    
    var currentTrack = script.musicTracks[currentTrackIndex];
    
    if (isPlaying) {
        currentTrack.pause();
        isPlaying = false;
    } else {
        // Si la piste était précédemment jouée et mise en pause
        if (currentTrack.isPlaying() || currentTrack.isPaused()) {
            currentTrack.play(1.0);
        } else {
            // Si la piste n'a pas encore été jouée
            currentTrack.play(1.0);
        }
        isPlaying = true;
    }
    
    updateUI();
}

function stopTrack() {
    if (!script.musicTracks || currentTrackIndex >= script.musicTracks.length) return;
    
    var currentTrack = script.musicTracks[currentTrackIndex];
    currentTrack.stop();
    isPlaying = false;
    
    // Réinitialiser la position de la sphère de progression
    if (script.progressSphere) {
        script.progressSphere.getTransform().setLocalPosition(startPosition);
    }
    
    updateUI();
}

function nextTrack() {
    if (!script.musicTracks || script.musicTracks.length === 0) return;
    
    // Arrêter la piste actuelle
    if (isPlaying && currentTrackIndex < script.musicTracks.length) {
        script.musicTracks[currentTrackIndex].stop();
    }
    
    // Passer à la piste suivante ou revenir à la première si on est à la dernière
    if (isShuffle) {
        // Mode aléatoire
        var randomIndex = Math.floor(Math.random() * script.musicTracks.length);
        currentTrackIndex = randomIndex;
    } else {
        // Mode normal
        currentTrackIndex = (currentTrackIndex + 1) % script.musicTracks.length;
    }
    
    // Mettre à jour les informations de la piste et jouer
    updateTrackInfo();
    
    if (isPlaying) {
        script.musicTracks[currentTrackIndex].play(1.0);
    }
}

function previousTrack() {
    if (!script.musicTracks || script.musicTracks.length === 0) return;
    
    // Arrêter la piste actuelle
    if (isPlaying && currentTrackIndex < script.musicTracks.length) {
        script.musicTracks[currentTrackIndex].stop();
    }
    
    // Passer à la piste précédente ou aller à la dernière si on est à la première
    if (isShuffle) {
        // Mode aléatoire
        var randomIndex = Math.floor(Math.random() * script.musicTracks.length);
        currentTrackIndex = randomIndex;
    } else {
        // Mode normal
        currentTrackIndex = (currentTrackIndex - 1 + script.musicTracks.length) % script.musicTracks.length;
    }
    
    // Mettre à jour les informations de la piste et jouer
    updateTrackInfo();
    
    if (isPlaying) {
        script.musicTracks[currentTrackIndex].play(1.0);
    }
}

function toggleShuffle() {
    isShuffle = !isShuffle;
    // Mettre à jour l'interface utilisateur pour indiquer le statut du mode aléatoire
    // Exemple: changer la couleur du bouton shuffle
    print("Mode shuffle: " + (isShuffle ? "activé" : "désactivé"));
}

function toggleRepeat() {
    isRepeat = !isRepeat;
    // Mettre à jour l'interface utilisateur pour indiquer le statut du mode répétition
    // Exemple: changer la couleur du bouton repeat
    print("Mode repeat: " + (isRepeat ? "activé" : "désactivé"));
}

function onTrackFinished() {
    if (isRepeat) {
        // Rejouer la même piste
        if (currentTrackIndex < script.musicTracks.length) {
            script.musicTracks[currentTrackIndex].play(1.0);
        }
    } else {
        // Passer à la piste suivante
        nextTrack();
    }
}

function updateTrackInfo() {
    if (currentTrackIndex < trackData.length) {
        var data = trackData[currentTrackIndex];
        
        if (script.artistNameText) {
            script.artistNameText.text = data.artist;
        }
        
        if (script.trackNameText) {
            script.trackNameText.text = data.name;
        }
        
        if (script.yearLabelText) {
            script.yearLabelText.text = data.year;
        }
    }
}

function updateProgress() {
    if (!isPlaying || !script.musicTracks || currentTrackIndex >= script.musicTracks.length) return;
    
    var currentTrack = script.musicTracks[currentTrackIndex];
    if (!currentTrack.isPlaying()) return;
    
    // Calculer la progression (0 à 1)
    var currentTime = currentTrack.getTime();
    var totalDuration = currentTrack.getDuration();
    var progress = currentTime / totalDuration;
    
    // Mettre à jour le timecode
    if (script.timecodeText) {
        var minutes = Math.floor(currentTime / 60);
        var seconds = Math.floor(currentTime % 60);
        var totalMinutes = Math.floor(totalDuration / 60);
        var totalSeconds = Math.floor(totalDuration % 60);
        
        script.timecodeText.text = pad(minutes) + ":" + pad(seconds) + " / " + pad(totalMinutes) + ":" + pad(totalSeconds);
    }
    
    // Mettre à jour la position de la sphère de progression (la terre)
    if (script.progressSphere && startPosition && endPosition) {
        var newPosition = vec3.lerp(startPosition, endPosition, progress);
        script.progressSphere.getTransform().setLocalPosition(newPosition);
        
        // Faire tourner la sphère pour un effet visuel
        var currentRotation = script.progressSphere.getTransform().getLocalRotation();
        var rotationIncrement = quat.angleAxis(0.01, vec3.up());
        script.progressSphere.getTransform().setLocalRotation(currentRotation.multiply(rotationIncrement));
    }
}

function pad(num) {
    return (num < 10) ? "0" + num : num.toString();
}

function updateUI() {
    // Mettre à jour l'apparence des boutons en fonction de l'état
    // Cette fonction serait à compléter en fonction des éléments visuels spécifiques
}

// Initialiser le script
initialize();