// WorldMeshMaterialController.js
// Assigns different materials to the World Mesh based on surface normals
// -------------------------------------

//@input Component.RenderMeshVisual worldMeshVisual
//@input Asset.Material floorMaterial {"label":"Sol (Floor) Material"}
//@input Asset.Material wallMaterial {"label":"Mur (Wall) Material"}
//@input Asset.Material ceilingMaterial {"label":"Plafond (Ceiling) Material"}
//@input float normalThreshold = 0.8 {"label":"Normal Direction Threshold", "min":0.5, "max":1.0, "step":0.01}

// Initialize the script
function initialize() {
    if (!validateInputs()) {
        return;
    }
    
    // Set up an event callback for when the scene updates
    var updateEvent = script.createEvent("UpdateEvent");
    updateEvent.bind(onUpdate);
    
    // Initial material application
    applyMaterials();
    
    print("WorldMeshMaterialController: Successfully initialized");
}

// Validate that all required inputs are provided
function validateInputs() {
    if (!script.worldMeshVisual) {
        print("ERROR: WorldMeshMaterialController - Please set the World Mesh Visual input");
        return false;
    }
    
    if (!script.floorMaterial || !script.wallMaterial || !script.ceilingMaterial) {
        print("ERROR: WorldMeshMaterialController - Please set all required materials");
        return false;
    }
    
    return true;
}

// Update function that runs every frame
function onUpdate() {
    // We could check for mesh changes here, but for performance
    // we might want to only check periodically
    applyMaterials();
}

// Apply materials based on face normals
function applyMaterials() {
    if (!script.worldMeshVisual) {
        return;
    }
    
    var meshVisual = script.worldMeshVisual;
    
    // Get the render mesh
    var renderMesh = meshVisual.getMesh();
    if (!renderMesh) {
        return;
    }
    
    // Get mesh data
    var indexCount = renderMesh.indexCount;
    if (indexCount === 0) {
        return; // No mesh data yet
    }
    
    // Clear existing materials
    // Note: In Lens Studio, we might need to store original materials if we want to restore them later
    while (meshVisual.getMaterialsCount() > 0) {
        meshVisual.removeMaterial(0);
    }
    
    // Create material indices
    var floorMatIndex = meshVisual.addMaterial(script.floorMaterial);
    var wallMatIndex = meshVisual.addMaterial(script.wallMaterial);
    var ceilingMatIndex = meshVisual.addMaterial(script.ceilingMaterial);
    
    // Create arrays to store indices for each surface type
    var floorIndices = [];
    var wallIndices = [];
    var ceilingIndices = [];
    
    try {
        // Get mesh data
        var indices = renderMesh.indices;
        var vertices = renderMesh.vertices;
        var normals = renderMesh.normals;
        
        // Process each triangle
        for (var i = 0; i < indexCount; i += 3) {
            // Get indices for triangle
            var idx1 = indices[i];
            var idx2 = indices[i + 1];
            var idx3 = indices[i + 2];
            
            // Get normals for each vertex
            var normal1 = normals[idx1];
            var normal2 = normals[idx2];
            var normal3 = normals[idx3];
            
            // Calculate average normal for the triangle
            var avgNormal = new vec3(
                (normal1.x + normal2.x + normal3.x) / 3.0,
                (normal1.y + normal2.y + normal3.y) / 3.0,
                (normal1.z + normal2.z + normal3.z) / 3.0
            ).normalize();
            
            // Determine surface type based on normal direction
            var upDot = avgNormal.dot(vec3.up());
            var downDot = avgNormal.dot(vec3.down());
            var threshold = script.normalThreshold;
            
            // Assign to appropriate surface type
            if (upDot >= threshold) {
                // Floor surface
                floorIndices.push(idx1, idx2, idx3);
            } else if (downDot >= threshold) {
                // Ceiling surface
                ceilingIndices.push(idx1, idx2, idx3);
            } else {
                // Wall surface
                wallIndices.push(idx1, idx2, idx3);
            }
        }
        
        // Create submeshes for each surface type
        if (floorIndices.length > 0) {
            var floorSubmesh = renderMesh.createSubmesh(floorIndices);
            meshVisual.setSubmeshMaterial(floorSubmesh, floorMatIndex);
        }
        
        if (wallIndices.length > 0) {
            var wallSubmesh = renderMesh.createSubmesh(wallIndices);
            meshVisual.setSubmeshMaterial(wallSubmesh, wallMatIndex);
        }
        
        if (ceilingIndices.length > 0) {
            var ceilingSubmesh = renderMesh.createSubmesh(ceilingIndices);
            meshVisual.setSubmeshMaterial(ceilingSubmesh, ceilingMatIndex);
        }
        
        print("WorldMeshMaterialController: Materials applied successfully");
        
    } catch (e) {
        print("ERROR in WorldMeshMaterialController: " + e);
    }
}

// Initialize the script
initialize();