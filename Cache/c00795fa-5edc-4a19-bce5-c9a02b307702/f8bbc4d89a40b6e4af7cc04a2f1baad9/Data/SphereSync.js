//@input SceneObject progressBar
//@input SceneObject progressSphere
//@input float minX
//@input float maxX
//@input float songDuration // Durée totale du morceau en secondes
//@input Component.AudioComponent audioComponent // Référence à l'audio

function updateProgressSphere() {
    var progressTransform = script.progressBar.getTransform();
    var sphereTransform = script.progressSphere.getTransform();

    // Obtenir la position Y et Z de la barre
    var progressBarLocalPos = progressTransform.getLocalPosition();

    // Obtenir le temps actuel de lecture
    var currentTime = script.audioComponent.playbackTime; // Temps écoulé en secondes

    // Calculer le pourcentage de progression
    var progress = currentTime / script.songDuration; // Valeur entre 0 et 1
    progress = clamp(progress, 0, 1); // S'assurer que la valeur reste entre 0 et 1

    // Calculer la position X en fonction du progrès
    var newX = script.minX + (script.maxX - script.minX) * progress;

    // Appliquer la nouvelle position
    var newPosition = new vec3(newX, progressBarLocalPos.y, progressBarLocalPos.z);
    sphereTransform.setLocalPosition(newPosition);
}

// Mettre à jour la position de la sphère à chaque frame
var event = script.createEvent("UpdateEvent");
event.bind(updateProgressSphere);
