// WorldmeshTrimaterial.js
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
    // Dans les versions récentes de Lens Studio, on utilise directement la création du World Mesh
    // sans vérifier si c'est supporté (l'erreur sera gérée par Lens Studio)
    try {
        print("Tentative de création du World Mesh");
        setupWorldMesh();
    } catch(e) {
        print("Erreur lors de la création du World Mesh: " + e);
    }
}

// Configurer le World Mesh
function setupWorldMesh() {
    // Créer le World Mesh
    worldMesh = global.scene.createWorldMesh();
    
    if (!worldMesh) {
        print("Erreur: Impossible de créer le World Mesh");
        return;
    }
    
    // Obtenir l'objet du World Mesh
    var worldMeshObject = worldMesh.worldMeshObject;
    
    if (!worldMeshObject) {
        print("Erreur: L'objet World Mesh n'est pas disponible");
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
    
    // Ajouter un événement pour mettre à jour les matériaux
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
        print("Erreur: Tous les matériaux doivent être assignés");
        return;
    }
    
    // Appliquer les matériaux au World Mesh
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
        return;
    }
    
    try {
        // Accéder aux sections du World Mesh
        var sections = worldMesh.getSections();
        
        if (!sections || sections.length === 0) {
            return;
        }
        
        // Parcourir les sections du World Mesh
        for (var i = 0; i < sections.length; i++) {
            var section = sections[i];
            
            // Obtenir la normale de la section
            var normal = getNormalFromSection(section);
            
            // Déterminer le type de surface en fonction de la normale
            var materialIndex = getMaterialIndexFromNormal(normal);
            
            // Appliquer le matériau approprié à cette section
            applyMaterialToSection(section, materialIndex);
        }
    } catch(e) {
        if (script.debugMode) {
            print("Erreur lors de la mise à jour des sections: " + e);
        }
    }
}

// Obtenir la normale d'une section
function getNormalFromSection(section) {
    // Différentes versions de l'API peuvent avoir différentes méthodes
    if (typeof section.getNormal === "function") {
        return section.getNormal();
    } else if (section.normal) {
        return section.normal;
    } else {
        // Valeur par défaut si on ne peut pas obtenir la normale
        return vec3.up();
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

// Appliquer un matériau à une section
function applyMaterialToSection(section, materialIndex) {
    // Différentes versions de l'API peuvent avoir différentes méthodes
    try {
        if (typeof section.setMaterialIndex === "function") {
            section.setMaterialIndex(materialIndex);
        } else if (section.materialIndex !== undefined) {
            section.materialIndex = materialIndex;
        }
    } catch(e) {
        if (script.debugMode) {
            print("Erreur lors de l'application du matériau: " + e);
        }
    }
}

// Démarrer le script
initialize();