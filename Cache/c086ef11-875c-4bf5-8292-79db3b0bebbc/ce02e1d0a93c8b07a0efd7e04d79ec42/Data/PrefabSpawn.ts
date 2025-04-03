//@input Asset.ObjectPrefab myPrefab
//@input Component.Camera camera
//@input float spawnDistance = 200
//@input float spawnScale = 1.0

// Create the Pinch Event
script.createEvent('PinchEvent').bind(onPinch);

function onPinch(eventData) {
    if (script.camera && script.myPrefab) {
        // Calculate world position based on pinch position and spawn distance
        var worldPosition = script.camera.screenSpaceToWorldSpace(eventData.getPosition(), script.spawnDistance);
        
        // Instantiate the prefab
        var instanceObject = script.myPrefab.instantiate(script.getSceneObject());
        
        // Set the position and scale of the instantiated prefab
        instanceObject.getTransform().setWorldPosition(worldPosition);
        instanceObject.getTransform().setLocalScale(new vec3(script.spawnScale, script.spawnScale, script.spawnScale));
    }
}