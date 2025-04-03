// WorldMeshMaterials.js
// Script qui assigne 3 matériaux différents au World Mesh
// basé sur l'orientation des surfaces (sol, murs, plafond)

// @input Component.RenderMeshVisual meshVisual {"label":"World Mesh Visual"}
// @input Asset.Material floorMaterial {"label":"Matériau Sol"}
// @input Asset.Material wallMaterial {"label":"Matériau Murs"}
// @input Asset.Material ceilingMaterial {"label":"Matériau Plafond"}
// @input float upThreshold = 0.7 {"label":"Seuil Vertical", "min":0.5, "max":0.95, "step":0.05}
// @input float updateInterval = 0.5 {"label":"Intervalle de mise à jour (secondes)", "min":0.1, "max":2.0, "step":0.1}
// @input bool debugMode = false {"label":"Mode Debug"}

// Variables globales
var timer = 0;
var initialized = false;

function initialize() {
    // Vérifier si le render mesh visual est assigné
    if (!script.meshVisual) {
        print("Erreur: Veuillez assigner le RenderMeshVisual du World Mesh dans l'inspecteur!");
        return false;
    }
    
    // Vérifier que les matériaux sont assignés
    if (!script.floorMaterial || !script.wallMaterial || !script.ceilingMaterial) {
        print("Erreur: Veuillez assigner tous les matériaux dans l'inspecteur!");
        return false;
    }
    
    // Configurer les matériaux
    setupMaterials();
    
    if (script.debugMode) {
        print("WorldMeshMaterials: Initialisation terminée avec succès!");
    }
    
    return true;
}

function setupMaterials() {
    // Supprimer tous les matériaux existants
    script.meshVisual.clearMaterials();
    
    // Ajouter les trois matériaux dans l'ordre: sol, murs, plafond
    script.meshVisual.addMaterial(script.floorMaterial);    // Index 0: Sol
    script.meshVisual.addMaterial(script.wallMaterial);     // Index 1: Murs
    script.meshVisual.addMaterial(script.ceilingMaterial);  // Index 2: Plafond
    
    if (script.debugMode) {
        print("WorldMeshMaterials: Matériaux configurés - Sol (0), Murs (1), Plafond (2)");
    }
}

// Fonction principale appelée à chaque frame
function update(eventData) {
    if (!initialized) {
        initialized = initialize();
        if (!initialized) return;
    }
    
    // N'effectuer la mise à jour des matériaux qu'à intervalles définis
    timer += eventData.getDeltaTime();
    if (timer < script.updateInterval) {
        return;
    }
    timer = 0;
    
    updateMeshMaterials();
}

function updateMeshMaterials() {
    try {
        // Obtenir le World Mesh
        var worldMesh = global.scene.findComponent("Component.WorldMesh");
        
        if (!worldMesh) {
            if (script.debugMode) {
                print("WorldMeshMaterials: World Mesh non disponible");
            }
            return;
        }
        
        // Vérifier si le World Mesh est actif
        if (!worldMesh.isTracking()) {
            return;
        }
        
        // Obtenir les sections du World Mesh
        var sections = worldMesh.getSections();
        
        if (!sections || sections.length === 0) {
            if (script.debugMode) {
                print("WorldMeshMaterials: Aucune section disponible");
            }
            return;
        }
        
        // Assigner les matériaux en fonction des normales
        var floorCount = 0;
        var wallCount = 0;
        var ceilingCount = 0;
        
        for (var i = 0; i < sections.length; i++) {
            var section = sections[i];
            var normal = section.normal;
            
            // Déterminer le type de surface en fonction de la normale
            var materialIndex = getMaterialIndexFromNormal(normal);
            
            // Appliquer le matériau à cette section
            section.materialIndex = materialIndex;
            
            // Compter les types de sections pour le debugging
            if (materialIndex === 0) floorCount++;
            else if (materialIndex === 1) wallCount++;
            else if (materialIndex === 2) ceilingCount++;
        }
        
        if (script.debugMode) {
            print("WorldMeshMaterials: Sections mises à jour - Sol: " + floorCount + ", Murs: " + wallCount + ", Plafond: " + ceilingCount);
        }
    } catch(e) {
        if (script.debugMode) {
            print("WorldMeshMaterials: Erreur dans updateMeshMaterials: " + e);
        }
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

// Création d'un événement Update pour mettre à jour les matériaux
var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(update);