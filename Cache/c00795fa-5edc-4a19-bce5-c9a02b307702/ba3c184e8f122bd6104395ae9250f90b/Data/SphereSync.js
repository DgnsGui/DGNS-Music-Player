//@input SceneObject progressBar
//@input SceneObject progressSphere
//@input float minX
//@input float maxX

function updateProgressSphere() {
    var progressTransform = script.progressBar.getTransform();
    var sphereTransform = script.progressSphere.getTransform();

    // Obtenir la progression en supposant que l'échelle X de la barre représente la progression
    var progressScale = progressTransform.getLocalScale().x;

    // Calculer la nouvelle position X de la sphère en restant dans l'espace local de la progressBar
    var newX = script.minX + (script.maxX - script.minX) * progressScale;

    // Garder Y et Z alignés avec la barre
    var progressBarLocalPos = progressTransform.getLocalPosition();
    var newPosition = new vec3(newX, progressBarLocalPos.y, progressBarLocalPos.z);

    // Appliquer la nouvelle position en local
    sphereTransform.setLocalPosition(newPosition);
}

// Mettre à jour la position de la sphère à chaque frame
var event = script.createEvent("UpdateEvent");
event.bind(updateProgressSphere);
