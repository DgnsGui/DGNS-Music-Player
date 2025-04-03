// WorldMeshMaterials.js
// Ce script permet d'affecter différents matériaux au World Mesh
// en fonction du type de surface (sol, murs, plafond)

// @input Component.RenderMeshVisual floorMesh
// @input Component.RenderMeshVisual wallMesh
// @input Component.RenderMeshVisual ceilingMesh
// @input Asset.Material floorMaterial
// @input Asset.Material wallMaterial
// @input Asset.Material ceilingMaterial
// @input float maxInstances = 50 {"widget":"slider", "min":10, "max":200, "step":10}
// @input float spacing = 40.0 {"widget":"slider", "min":10, "max":100, "step":5}
// @input float surfaceDirVariation = 0.2 {"widget":"slider", "min":0, "max":1, "step":0.1}

// Définir les types de surfaces
var surfaceType = {
    Floor: "floor",
    Wall: "wall",
    Ceiling: "ceiling",
    Table: "table",
    Seat: "seat",
    Window: "window",
    Door: "door",
    None: "none"
};

// Définir les orientations de direction
var directionType = {
    Up: "up",
    Down: "down",
    Vertical: "vertical",
    Any: "any"
};

// Configuration pour chaque type de spawner
var spawnerConfigs = [
    {
        mesh: script.floorMesh,
        material: script.floorMaterial,
        surfaceType: surfaceType.Floor,
        directionType: directionType.Up
    },
    {
        mesh: script.wallMesh,
        material: script.wallMaterial,
        surfaceType: surfaceType.Wall,
        directionType: directionType.Vertical
    },
    {
        mesh: script.ceilingMesh,
        material: script.ceilingMaterial,
        surfaceType: surfaceType.Ceiling,
        directionType: directionType.Down
    }
];

// Stockage des instances créées
var spawnedInstances = [];
var worldMesh = null;

// Paramètres pour les dispositifs sans LiDAR
var fakeSurfaceGenerators = {
    floor: function() {
        return {
            isValid: function() { return true; },
            getWorldPos: function() { 
                return new vec3(Math.random() * 250 - 125, -50, Math.random() * 250 - 50); 
            },
            getNormalVec: function() { return vec3.up(); },
            getClassification: function() { return surfaceType.Floor; }
        };
    },
    wall: function() {
        return {
            isValid: function() { return true; },
            getWorldPos: function() {
                var side = Math.random() > 0.5 ? 1 : -1;
                return new vec3(side * 125, Math.random() * 100 - 25, Math.random() * 250 - 125);
            },
            getNormalVec: function() { 
                var side = Math.random() > 0.5 ? 1 : -1;
                return new vec3(side, 0, 0); 
            },
            getClassification: function() { return surfaceType.Wall; }
        };
    },
    ceiling: function() {
        return {
            isValid: function() { return true; },
            getWorldPos: function() { 
                return new vec3(Math.random() * 250 - 125, 100, Math.random() * 250 - 50); 
            },
            getNormalVec: function() { return vec3.down(); },
            getClassification: function() { return surfaceType.Ceiling; }
        };
    }
};

// Initialisation du script
function initialize() {
    // Vérifier si le World Mesh est disponible
    if (global.deviceInfoSystem.isWorldMeshingSupported()) {
        print("World Meshing est supporté sur cet appareil!");
        worldMesh = global.scene.createWorldMesh();
        worldMesh.control.start();
    } else {
        print("World Meshing n'est pas supporté, utilisation du mode de repli");
        useFallbackMode();
    }
    
    // Initialiser les matériaux
    setupMaterials();
    
    // Démarrer la génération d'instances
    var updateEvent = script.createEvent("UpdateEvent");
    updateEvent.bind(onUpdate);
}

// Configurer les matériaux
function setupMaterials() {
    for (var i = 0; i < spawnerConfigs.length; i++) {
        var config = spawnerConfigs[i];
        if (config.mesh && config.material) {
            config.mesh.mainMaterial = config.material;
            // Ajouter des paramètres personnalisés pour le matériau si nécessaire
            setupMaterialForInstancing(config.material);
        }
    }
}

// Configurer un matériau pour l'instanciation
function setupMaterialForInstancing(material) {
    // Augmenter le padding de Frustum Culling pour éviter la disparition des objets
    if (material.mainPass) {
        material.mainPass.frustumCulling = true;
        material.mainPass.frustumCullingExtendPadding = 1000;
    }
}

// Utiliser le mode de repli pour les appareils sans LiDAR
function useFallbackMode() {
    // Générer des instances virtuelles pour chaque type de surface
    for (var i = 0; i < script.maxInstances / 3; i++) {
        spawnFromFakeResult(fakeSurfaceGenerators.floor());
        spawnFromFakeResult(fakeSurfaceGenerators.wall());
        spawnFromFakeResult(fakeSurfaceGenerators.ceiling());
    }
}

// Générer à partir d'un résultat virtuel
function spawnFromFakeResult(fakeResult) {
    if (fakeResult && fakeResult.isValid()) {
        var surfaceType = fakeResult.getClassification();
        var normal = fakeResult.getNormalVec();
        var position = fakeResult.getWorldPos();
        
        // Trouver la configuration correspondante
        for (var i = 0; i < spawnerConfigs.length; i++) {
            var config = spawnerConfigs[i];
            if (isValidSurfaceForConfig(surfaceType, normal, config)) {
                spawnInstance(position, normal, config);
                break;
            }
        }
    }
}

// Mise à jour par frame
function onUpdate() {
    if (!worldMesh) return;
    
    // Limiter le nombre d'instances
    if (spawnedInstances.length >= script.maxInstances) return;
    
    // Effectuer un hit test pour trouver des surfaces
    var screenPoint = new vec2(0.5, 0.5); // Centre de l'écran
    var hitTestResults = worldMesh.hitTest(screenPoint);
    
    if (hitTestResults.length > 0) {
        processHitTestResults(hitTestResults);
    }
}

// Traiter les résultats de hit test
function processHitTestResults(results) {
    for (var i = 0; i < results.length; i++) {
        var result = results[i];
        if (result.isValid()) {
            var surfaceType = result.getClassification();
            var normal = result.getNormalVec();
            var position = result.getWorldPos();
            
            // Vérifier s'il y a déjà une instance à proximité
            if (isTooCloseToExistingInstances(position)) {
                continue;
            }
            
            // Trouver la configuration correspondante
            for (var j = 0; j < spawnerConfigs.length; j++) {
                var config = spawnerConfigs[j];
                if (isValidSurfaceForConfig(surfaceType, normal, config)) {
                    spawnInstance(position, normal, config);
                    return; // Une instance par frame est suffisante
                }
            }
        }
    }
}

// Vérifier si une surface correspond à la configuration
function isValidSurfaceForConfig(surfType, normal, config) {
    // Vérifier le type de surface
    var isSurfaceTypeValid = config.surfaceType === surfType || config.surfaceType === "any";
    
    // Vérifier l'orientation
    var isDirectionValid = false;
    var upDot = vec3.dot(normal, vec3.up());
    
    switch (config.directionType) {
        case directionType.Up:
            isDirectionValid = upDot > (1.0 - script.surfaceDirVariation);
            break;
        case directionType.Down:
            isDirectionValid = upDot < -(1.0 - script.surfaceDirVariation);
            break;
        case directionType.Vertical:
            isDirectionValid = Math.abs(upDot) < script.surfaceDirVariation;
            break;
        case directionType.Any:
            isDirectionValid = true;
            break;
    }
    
    return isSurfaceTypeValid && isDirectionValid;
}

// Générer une instance
function spawnInstance(position, normal, config) {
    if (!config.mesh || !config.material) return;
    
    // Ajouter la position à la liste des instances
    spawnedInstances.push(position);
    
    // Créer un objet pour la nouvelle instance
    var newInstance = global.scene.createSceneObject("Instance_" + config.surfaceType);
    
    // Copier le RenderMeshVisual
    var newMesh = newInstance.createComponent("Component.RenderMeshVisual");
    newMesh.mesh = config.mesh.mesh;
    newMesh.mainMaterial = config.material;
    
    // Positionner l'objet
    newInstance.getTransform().setWorldPosition(position);
    
    // Orienter l'objet en fonction de la normale
    alignObjectToNormal(newInstance, normal);
    
    // Ajouter une échelle aléatoire
    var scale = 0.8 + Math.random() * 0.4; // Échelle entre 0.8 et 1.2
    newInstance.getTransform().setWorldScale(new vec3(scale, scale, scale));
}

// Aligner l'objet à la normale
function alignObjectToNormal(obj, normal) {
    var transform = obj.getTransform();
    
    // Créer une rotation qui aligne l'axe Y avec la normale
    var up = normal;
    var forward = vec3.forward();
    
    // Éviter l'alignement avec un vecteur parallèle
    if (Math.abs(vec3.dot(up, vec3.up())) > 0.99) {
        forward = vec3.right();
    }
    
    // Calculer la rotation
    var right = vec3.cross(forward, up).normalize();
    forward = vec3.cross(up, right).normalize();
    
    var rotMatrix = new mat3(
        right.x, up.x, forward.x,
        right.y, up.y, forward.y,
        right.z, up.z, forward.z
    );
    
    var quat = quat.fromMat3(rotMatrix);
    transform.setWorldRotation(quat);
}

// Vérifier si une position est trop proche des instances existantes
function isTooCloseToExistingInstances(position) {
    for (var i = 0; i < spawnedInstances.length; i++) {
        var distance = vec3.distance(position, spawnedInstances[i]);
        if (distance < script.spacing) {
            return true;
        }
    }
    return false;
}

// Démarrer le script
initialize();