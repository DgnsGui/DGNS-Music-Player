// @input float rotationSpeed = 30.0  // Vitesse de rotation (modifiable dans l'Inspector)

var obj = script.getSceneObject();

function updateRotation(eventData) {
    var deltaTime = eventData.getDeltaTime();
    var currentRotation = obj.getTransform().getLocalRotation();
    var newRotation = quat.fromEulerAngles(0, script.rotationSpeed * deltaTime, 0);
    obj.getTransform().setLocalRotation(currentRotation.multiply(newRotation));
}

script.createEvent("UpdateEvent").bind(updateRotation);
