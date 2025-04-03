// MusicPlayerManager.js
// Script qui gère un lecteur de musique avec 3 pistes et des contrôles d'interface utilisateur
// Pour Spectacles dans Lens Studio

//@input Asset.AudioTrackAsset[] musicTracks
//@input Component.Text artistNameText
//@input Component.Text trackNameText
//@input Component.Text yearLabelText
//@input Component.Text timecodeText

//@input Component.ScriptComponent playPauseButton {"label":"Play Pause Button", "hint":"PinchButton component"}
//@input Component.ScriptComponent nextTrackButton {"label":"Next Track Button", "hint":"PinchButton component"}
//@input Component.ScriptComponent backTrackButton {"label":"Back Track Button", "hint":"PinchButton component"}
//@input Component.ScriptComponent shuffleButton {"label":"Shuffle Button", "hint":"PinchButton component"}
//@input Component.ScriptComponent repeatButton {"label":"Repeat Button", "hint":"PinchButton component"}
//@input Component.ScriptComponent stopButton {"label":"Stop Button", "hint":"PinchButton component"}

//@input SceneObject progressBar
//@input SceneObject progressSphere // La terre qui se déplace le long de la barre de progression

// Audio Components pour la lecture
var audioComponents = [];

// Variables de gestion de l'état
var currentTrackIndex = 0;
var isPlaying = false;
var isRepeat = false;
var isShuffle = false;

// Positions pour la barre de progression
var startPosition;
var endPosition;
var barLength;

function initialize() {
    // Initialiser les composants audio pour chaque piste
    if (script.musicTracks) {
        for (var i = 0; i < script.musicTracks.length; i++) {
            if (script.musicTracks[i]) {
                // Créer un AudioComponent pour chaque piste
                var audioComp = script.getSceneObject().createComponent("Component.AudioComponent");
                audioComp.audioTrack = script.musicTracks[i];
                audioComponents.push(audioComp);
            }
        }
    }
    
    // Configuration des boutons d'interaction
    if (script.playPauseButton) {
        script.playPauseButton.onButtonPinched.add(togglePlayPause);
    }
    
    if (script.nextTrackButton) {
        script.nextTrackButton.onButtonPinched.add(nextTrack);
    }
    
    if (script.backTrackButton) {
        script.backTrackButton.onButtonPinched.add(previousTrack);
    }
    
    if (script.shuffleButton) {
        script.shuffleButton.onButtonPinched.add(toggleShuffle);
    }
    
    if (script.repeatButton) {
        script.repeatButton.onButtonPinched.add(toggleRepeat);
    }
    
    if (script.stopButton) {
        script.stopButton.onButtonPinched.add(stopTrack);
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
    for (var i = 0; i < audioComponents.length; i++) {
        audioComponents[i].onFinish.add(onTrackFinished);
    }
    
    // Commencer la mise à jour de la barre de progression
    var updateEvent = script.createEvent("UpdateEvent");
    updateEvent.bind(updateProgress);
}

function togglePlayPause() {
    if (audioComponents.length === 0 || currentTrackIndex >= audioComponents.length) {
        print("Aucune piste disponible");
        return;
    }
    
    var currentTrack = audioComponents[currentTrackIndex];
    
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
    if (audioComponents.length === 0 || currentTrackIndex >= audioComponents.length) return;
    
    var currentTrack = audioComponents[currentTrackIndex];
    currentTrack.stop();
    isPlaying = false;
    
    // Réinitialiser la position de la sphère de progression
    if (script.progressSphere) {
        script.progressSphere.getTransform().setLocalPosition(startPosition);
    }
    
    updateUI();
}

function nextTrack() {
    if (audioComponents.length === 0) return;
    
    // Arrêter la piste actuelle
    if (isPlaying && currentTrackIndex < audioComponents.length) {
        audioComponents[currentTrackIndex].stop();
    }
    
    // Passer à la piste suivante ou revenir à la première si on est à la dernière
    if (isShuffle) {
        // Mode aléatoire
        var randomIndex = Math.floor(Math.random() * audioComponents.length);
        currentTrackIndex = randomIndex;
    } else {
        // Mode normal
        currentTrackIndex = (currentTrackIndex + 1) % audioComponents.length;
    }
    
    // Mettre à jour les informations de la piste et jouer
    updateTrackInfo();
    
    if (isPlaying) {
        audioComponents[currentTrackIndex].play(1.0);
    }
}

function previousTrack() {
    if (audioComponents.length === 0) return;
    
    // Arrêter la piste actuelle
    if (isPlaying && currentTrackIndex < audioComponents.length) {
        audioComponents[currentTrackIndex].stop();
    }
    
    // Passer à la piste précédente ou aller à la dernière si on est à la première
    if (isShuffle) {
        // Mode aléatoire
        var randomIndex = Math.floor(Math.random() * audioComponents.length);
        currentTrackIndex = randomIndex;
    } else {
        // Mode normal
        currentTrackIndex = (currentTrackIndex - 1 + audioComponents.length) % audioComponents.length;
    }
    
    // Mettre à jour les informations de la piste et jouer
    updateTrackInfo();
    
    if (isPlaying) {
        audioComponents[currentTrackIndex].play(1.0);
    }
}

function toggleShuffle() {
    isShuffle = !isShuffle;
    // Mettre à jour l'interface utilisateur pour indiquer le statut du mode aléatoire
    print("Mode shuffle: " + (isShuffle ? "activé" : "désactivé"));
}

function toggleRepeat() {
    isRepeat = !isRepeat;
    // Mettre à jour l'interface utilisateur pour indiquer le statut du mode répétition
    print("Mode repeat: " + (isRepeat ? "activé" : "désactivé"));
}

function onTrackFinished() {
    if (isRepeat) {
        // Rejouer la même piste
        if (currentTrackIndex < audioComponents.length) {
            audioComponents[currentTrackIndex].play(1.0);
        }
    } else {
        // Passer à la piste suivante
        nextTrack();
    }
}

function updateTrackInfo() {
    if (script.musicTracks && currentTrackIndex < script.musicTracks.length) {
        var currentTrack = script.musicTracks[currentTrackIndex];
        
        // Extraire le nom du fichier pour l'utiliser comme nom de piste
        var trackName = currentTrack.name;
        
        // Extraire l'artiste à partir du nom du fichier (exemple: "ArtistName - TrackName")
        var artistName = "";
        var yearLabel = "";
        
        if (trackName.indexOf(" - ") > -1) {
            var parts = trackName.split(" - ");
            artistName = parts[0];
            trackName = parts[1];
            
            // Si le nom de piste inclut l'année (ex: "TrackName (2023)")
            if (trackName.indexOf("(") > -1 && trackName.indexOf(")") > -1) {
                var yearStart = trackName.lastIndexOf("(") + 1;
                var yearEnd = trackName.lastIndexOf(")");
                if (yearEnd > yearStart) {
                    yearLabel = trackName.substring(yearStart, yearEnd);
                    // Retirer l'année du nom de la piste
                    trackName = trackName.substring(0, yearStart - 1).trim();
                }
            }
        }
        
        // Mettre à jour les textes
        if (script.artistNameText) {
            script.artistNameText.text = artistName;
        }
        
        if (script.trackNameText) {
            script.trackNameText.text = trackName;
        }
        
        if (script.yearLabelText) {
            script.yearLabelText.text = yearLabel;
        }
    }
}

function updateProgress() {
    if (!isPlaying || audioComponents.length === 0 || currentTrackIndex >= audioComponents.length) return;
    
    var currentTrack = audioComponents[currentTrackIndex];
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