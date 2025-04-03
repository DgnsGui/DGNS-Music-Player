// WorldMeshMaterials.js
// Script qui assigne 3 matériaux différents au World Mesh existant
// basé sur l'orientation des surfaces (sol, murs, plafond)

// @input SceneObject worldMeshObject
// @input Asset.Material floorMaterial {"label":"Matériau Sol"}
// @input Asset.Material wallMaterial {"label":"Matériau Murs"}
// @input Asset.Material ceilingMaterial {"label":"Matériau Plafond"}
// @input float upThreshold = 0.7 {"label":"Seuil pour Sol/Plafond", "min":0.5, "max":0.95, "step":0.05}
// @input bool debugMode = false {"label":"Mode Debug"}

// Variables pour stocker les références
var meshVisual = null;

function initialize() {
    // Vérifier si l'objet World Mesh est assigné
    if (!script.worldMeshObject) {
        print("Erreur: Veuillez assigner l'objet World Mesh dans l'inspecteur!");
        return;
    }
    
    // Obtenir le composant RenderMeshVisual du World Mesh
    meshVisual = script.worldMeshObject.getComponent("Component.RenderMeshVisual");
    if (!meshVisual) {
        print("Erreur: L'objet World Mesh doit avoir un composant RenderMeshVisual!");
        return;
    }
    
    // Vérifier que les matériaux sont assignés
    if (!script.floorMaterial || !script.wallMaterial || !script.ceilingMaterial) {
        print("Erreur: Veuillez assigner tous les matériaux dans l'inspecteur!");
        return;
    }
    
    // Configurer les matériaux
    setupMaterials();
    
    if (script.debugMode) {
        print("Initialisation terminée avec succès!");
    }
}

function setupMaterials() {
    // Supprimer tous les matériaux existants
    meshVisual.clearMaterials();
    
    // Ajouter les trois matériaux dans l'ordre sol, murs, plafond
    meshVisual.addMaterial(script.floorMaterial);    // Index 0: Sol
    meshVisual.addMaterial(script.wallMaterial);     // Index 1: Murs
    meshVisual.addMaterial(script.ceilingMaterial);  // Index 2: Plafond
    
    // Assurer que le shader permette l'utilisation de plusieurs matériaux
    // Certains matériaux peuvent nécessiter des paramètres spécifiques
    
    if (script.debugMode) {
        print("Matériaux configurés: Sol (0), Murs (1), Plafond (2)");
    }
    
    // Créer un événement pour assigner les matériaux en fonction des normales
    var updateEvent = script.createEvent("UpdateEvent");
    updateEvent.bind(onUpdate);
}

function onUpdate() {
    if (!meshVisual) return;
    
    try {
        // Tenter d'obtenir le World Mesh associé
        var worldMesh = global.scene.getWorldMesh();
        
        if (!worldMesh) {
            if (script.debugMode) {
                print("World Mesh non disponible");
            }
            return;
        }
        
        // Vérifier si le World Mesh est actif
        if (!worldMesh.control.isActive()) {
            return;
        }
        
        // Obtenir les sections du World Mesh
        var sections = worldMesh.getSections();
        
        if (!sections || sections.length === 0) {
            return;
        }
        
        // Assigner les matériaux en fonction des normales
        for (var i = 0; i < sections.length; i++) {
            var section = sections[i];
            
            // Obtenir la normale de la section
            var normal = getNormalFromSection(section);
            
            // Déterminer le type de surface en fonction de la normale
            var materialIndex = getMaterialIndexFromNormal(normal);
            
            // Appliquer le matériau à cette section
            applyMaterialToSection(section, materialIndex);
        }
    } catch(e) {
        if (script.debugMode) {
            print("Erreur dans onUpdate: " + e);
        }
    }
}

// Obtenir la normale d'une section
function getNormalFromSection(section) {
    if (typeof section.getNormal === "function") {
        return section.getNormal();
    } else if (section.normal) {
        return section.normal;
    } else {
        // Si on ne peut pas obtenir la normale, utiliser une valeur par défaut
        return vec3.up();
    }
}

// Déterminer l'indice du matériau en fonction de la normale
function getMaterialIndexFromNormal(normal) {
    // Calculer le produit scalaire avec le vecteur vers le haut
    var upDot = vec3.dot(normal, vec3.up());
    var threshold = script.upThreshold;
    
    if (upDot > threshold) {
        // Surface orientée vers le haut (sol)
        return 0;
    } else if (upDot < -threshold) {
        // Surface orientée vers le bas (plafond)
        return 2;
    } else {
        // Surface verticale (murs)
        return 1;
    }
}

// Appliquer un matériau à une section
function applyMaterialToSection(section, materialIndex) {
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