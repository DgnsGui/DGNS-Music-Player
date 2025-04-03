//@input SceneObject progressBar
//@input SceneObject progressSphere
//@input float minX
//@input float maxX

// Fonction de mise à jour de la position de la sphère
function updateProgressSphere() {
    var progressTransform = script.progressBar.getTransform();
    var sphereTransform = script.progressSphere.getTransform();

    // Récupérer le pourcentage de progression (supposons que l'échelle X de la barre représente la progression)
    var progressScale = progressTransform.getLocalScale().x;

    // Calculer la nouvelle position de la sphère en fonction de la progression
    var newX = script.minX + (script.maxX - script.minX) * progressScale;
    var newPosition = new vec3(newX, sphereTransform.getLocalPosition().y, sphereTransform.getLocalPosition().z);

    // Appliquer la nouvelle position
    sphereTransform.setLocalPosition(newPosition);
}

// Lancer la mise à jour à chaque frame
var event = script.createEvent("UpdateEvent");
event.bind(updateProgressSphere);
