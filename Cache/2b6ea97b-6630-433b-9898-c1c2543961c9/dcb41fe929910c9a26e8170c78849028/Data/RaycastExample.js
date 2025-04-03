//@input SceneObject testObject

var self = script.getSceneObject();
var cameraTransform = null;

var myRaycaster = null;

var maxTestObjects = 256;
var testObjects = [];

function init(){
    initCamera();
    
    var options = new global.RaycasterOptions();
    options.retryOnMiss = true;
    options.averageRaycasts = true;
    options.ignorePitch = false;
    
    myRaycaster = new global.Raycaster(options).raycastRandom((raycastResult) => {
        var rayHitPos = raycastResult.position;
        var rayHitNormal = raycastResult.normal;
        createTestObject(rayHitPos, rayHitNormal);
    }).loop(0);
    
    print("Tap screen to switch raycast mode!");
}

function initCamera(){
    var cameraComponent = findFirstComponentByType(null, "Component.Camera");
    var cameraObject = cameraComponent.getSceneObject();
    cameraTransform = cameraObject.getTransform();
}

function createTestObject(position, normal){
    //copy test object
    var newTestObj = self.copyWholeHierarchy(script.testObject);
    
    //set position
    var newTestObjTrans = newTestObj.getTransform();
    newTestObjTrans.setWorldPosition(position);
    
    //set rotation
    var normalRotation = quat.lookAt(normal, vec3.up());
    newTestObjTrans.setWorldRotation(normalRotation);
    
    newTestObj.enabled = true;
    testObjects.push(newTestObj);
    
    if(testObjects.length > maxTestObjects){
        testObjects.shift().destroy();
    }
}

var tapEvent = script.createEvent("TapEvent");
tapEvent.bind((eventData) => {
    if(myRaycaster){
        if(myRaycaster.mode == global.RaycasterMode.Forward){
            myRaycaster.mode = global.RaycasterMode.Random;
        }else{
            myRaycaster.mode = global.RaycasterMode.Forward;
        }
    }
});

function findFirstComponentByType(root, componentType) {
    if (root === null) {
        const rootObjectCount = global.scene.getRootObjectsCount();
        for (let i = 0; i < rootObjectCount; i++) {
            const rootObject = global.scene.getRootObject(i);
            const result = findFirstComponentByType(rootObject, componentType);
            if (result) {
                return result;
            }
        }
    } else {
        const components = root.getComponents(componentType);
        if (components.length > 0) {
            return components[0];
        }

        for (let i = 0; i < root.getChildrenCount(); i++) {
            const child = root.getChild(i);
            const result = findFirstComponentByType(child, componentType);
            if (result) {
                return result;
            }
        }
    }
    return null;
}

script.createEvent("OnStartEvent").bind(init);