// WorldMeshMaterials.js
// Ce script permet d'affecter différents matériaux à différentes parties du World Mesh
// en fonction du type de surface (sol, murs, plafond)

// @input Asset.Material floorMaterial
// @input Asset.Material wallMaterial
// @input Asset.Material ceilingMaterial
// @input bool debugMode = false

// Variables globales
var worldMesh = null;
var meshVisual = null;

// Initialisation du script
function initialize() {
    // Vérifier si le World Mesh est supporté sur l'appareil
    if (global.deviceInfoSystem.isWorldMeshingSupported()) {
        print("World Meshing est supporté sur cet appareil!");
        setupWorldMesh();
    } else {
        print("World Meshing n'est pas supporté sur cet appareil");
        // Optionnel: montrer un message à l'utilisateur
    }
}

// Configurer le World Mesh
function setupWorldMesh() {
    // Créer le World Mesh
    worldMesh = global.scene.createWorldMesh();
    
    // Obtenir l'objet du World Mesh
    var worldMeshObject = worldMesh.worldMeshObject;
    
    if (!worldMeshObject) {
        print("Erreur: Impossible de créer l'objet World Mesh");
        return;
    }
    
    // Ajouter un composant RenderMeshVisual s'il n'existe pas déjà
    meshVisual = worldMeshObject.getComponent("Component.RenderMeshVisual");
    if (!meshVisual) {
        meshVisual = worldMeshObject.createComponent("Component.RenderMeshVisual");
    }
    
    // Configurer pour utiliser plusieurs matériaux
    setupMultiMaterial();
    
    // Démarrer le World Mesh
    worldMesh.control.start();
    
    // Ajouter un événement pour mettre à jour les matériaux en fonction des types de surface
    var updateEvent = script.createEvent("UpdateEvent");
    updateEvent.bind(onUpdate);
    
    if (script.debugMode) {
        print("World Mesh configuré avec succès");
    }
}

// Configurer le système de multi-matériaux
function setupMultiMaterial() {
    // Vérifier que les matériaux sont assignés
    if (!script.floorMaterial || !script.wallMaterial || !script.ceilingMaterial) {
        print("Erreur: Matériaux non assignés");
        return;
    }
    
    // Créer un shader pour chaque type de surface
    var multiMaterial = global.scene.createMaterial("Shader/MultiMaterial");
    
    // Combiner les matériaux en utilisant un shader personnalisé si disponible
    // Sinon, nous pourrions utiliser le système de matériaux de Lens Studio
    
    // Pour cet exemple, nous allons utiliser une approche simplifiée
    // qui utilise un matériau différent en fonction de la normale de la surface
    
    // Appliquer le shader multi-matériau au World Mesh
    meshVisual.clearMaterials();
    meshVisual.addMaterial(script.floorMaterial);    // Matériau 0 pour le sol
    meshVisual.addMaterial(script.wallMaterial);     // Matériau 1 pour les murs
    meshVisual.addMaterial(script.ceilingMaterial);  // Matériau 2 pour le plafond
    
    if (script.debugMode) {
        print("Multi-matériaux configurés");
    }
}

// Fonction appelée à chaque frame
function onUpdate() {
    if (!worldMesh || !meshVisual) return;
    
    // Vérifier si le World Mesh est actif
    if (!worldMesh.control.isActive()) {
        if (script.debugMode) {
            print("World Mesh n'est pas encore actif");
        }
        return;
    }
    
    // Accéder aux sections du World Mesh
    var sections = worldMesh.getSections();
    
    if (!sections || sections.length === 0) {
        if (script.debugMode) {
            print("Aucune section de World Mesh disponible");
        }
        return;
    }
    
    // Parcourir les sections du World Mesh
    for (var i = 0; i < sections.length; i++) {
        var section = sections[i];
        
        // Déterminer le type de surface en fonction de la normale
        var normal = section.getNormal();
        var materialIndex = getMaterialIndexFromNormal(normal);
        
        // Appliquer le matériau approprié à cette section
        section.setMaterialIndex(materialIndex);
    }
}

// Déterminer l'indice du matériau en fonction de la normale
function getMaterialIndexFromNormal(normal) {
    // Calculer le produit scalaire avec le vecteur vers le haut
    var upDot = vec3.dot(normal, vec3.up());
    
    // Déterminer le matériau en fonction de l'orientation
    if (upDot > 0.7) {
        // Surface orientée vers le haut (sol)
        return 0;
    } else if (upDot < -0.7) {
        // Surface orientée vers le bas (plafond)
        return 2;
    } else {
        // Surface verticale (murs)
        return 1;
    }
}

// Fonction pour obtenir la classification d'une surface (si disponible)
function getSurfaceClassification(section) {
    // Note: Cette fonctionnalité nécessite un appareil avec LiDAR
    if (section.hasClassification && section.hasClassification()) {
        return section.getClassification();
    }
    
    // Si la classification n'est pas disponible, utiliser la normale
    var normal = section.getNormal();
    var upDot = vec3.dot(normal, vec3.up());
    
    if (upDot > 0.7) {
        return "floor";
    } else if (upDot < -0.7) {
        return "ceiling";
    } else {
        return "wall";
    }
}

// Démarrer le script
initialize();