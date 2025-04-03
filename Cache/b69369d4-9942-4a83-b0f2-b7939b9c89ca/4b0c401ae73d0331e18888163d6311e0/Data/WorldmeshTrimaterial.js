// WorldMeshMaterialController.js
// Assigns different materials to the World Mesh based on surface normals
// -------------------------------------

//@input Component.RenderMeshVisual worldMeshVisual
//@input Asset.Material floorMaterial {"label":"Sol (Floor) Material"}
//@input Asset.Material wallMaterial {"label":"Mur (Wall) Material"}
//@input Asset.Material ceilingMaterial {"label":"Plafond (Ceiling) Material"}
//@input float normalThreshold = 0.8 {"label":"Normal Direction Threshold", "min":0.5, "max":1.0, "step":0.01}

var worldMeshVisualComp;

// Initialize the script
function initialize() {
    if (!validateInputs()) {
        return;
    }
    
    worldMeshVisualComp = script.worldMeshVisual;
    
    // Set up an event callback to update materials when the mesh changes
    // This ensures materials are applied as the World Mesh is being built
    var worldMeshProvider = worldMeshVisualComp.getMesh().worldMesh;
    if (worldMeshProvider) {
        worldMeshProvider.onChange.add(onWorldMeshChanged);
        print("WorldMeshMaterialController: Successfully set up World Mesh callback");
    } else {
        print("WARNING: WorldMeshMaterialController - No World Mesh provider found on the mesh visual");
    }
    
    // Initial update
    applyMaterials();
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

// Callback for when the World Mesh changes
function onWorldMeshChanged() {
    applyMaterials();
}

// Apply materials based on face normals
function applyMaterials() {
    if (!worldMeshVisualComp) {
        return;
    }
    
    var mesh = worldMeshVisualComp.getMesh();
    if (!mesh) {
        print("WARNING: WorldMeshMaterialController - No mesh available");
        return;
    }
    
    // Clear existing materials
    worldMeshVisualComp.clearMaterials();
    
    // Create submeshes for different surface types
    var floorMesh = createSubmeshForNormalDirection(mesh, vec3.up(), script.normalThreshold);
    var ceilingMesh = createSubmeshForNormalDirection(mesh, vec3.down(), script.normalThreshold);
    var wallMesh = createSubmeshForVerticalSurfaces(mesh, script.normalThreshold);
    
    // Apply materials to the appropriate submeshes
    if (floorMesh && script.floorMaterial) {
        var floorIndex = worldMeshVisualComp.addMaterial(script.floorMaterial);
        worldMeshVisualComp.setSubmeshMaterial(floorMesh, floorIndex);
    }
    
    if (ceilingMesh && script.ceilingMaterial) {
        var ceilingIndex = worldMeshVisualComp.addMaterial(script.ceilingMaterial);
        worldMeshVisualComp.setSubmeshMaterial(ceilingMesh, ceilingIndex);
    }
    
    if (wallMesh && script.wallMaterial) {
        var wallIndex = worldMeshVisualComp.addMaterial(script.wallMaterial);
        worldMeshVisualComp.setSubmeshMaterial(wallMesh, wallIndex);
    }
    
    print("WorldMeshMaterialController: Materials applied");
}

// Creates a submesh for surfaces with normals pointing in the specified direction
function createSubmeshForNormalDirection(mesh, direction, threshold) {
    if (!mesh) {
        return null;
    }
    
    var normalizedDirection = direction.normalize();
    var indices = [];
    var normals = mesh.normals;
    var indexCount = mesh.indexCount;
    
    // Process triangles
    for (var i = 0; i < indexCount; i += 3) {
        var idx1 = mesh.indices[i];
        var idx2 = mesh.indices[i + 1];
        var idx3 = mesh.indices[i + 2];
        
        var normal1 = normals[idx1];
        var normal2 = normals[idx2];
        var normal3 = normals[idx3];
        
        // Calculate average normal for the triangle
        var avgNormal = vec3.normalize(
            new vec3(
                (normal1.x + normal2.x + normal3.x) / 3.0,
                (normal1.y + normal2.y + normal3.y) / 3.0,
                (normal1.z + normal2.z + normal3.z) / 3.0
            )
        );
        
        // Check if this face's normal points in our target direction
        var dotProduct = vec3.dot(avgNormal, normalizedDirection);
        if (dotProduct >= threshold) {
            indices.push(idx1);
            indices.push(idx2);
            indices.push(idx3);
        }
    }
    
    // Create submesh if we have indices
    if (indices.length > 0) {
        return mesh.createSubmesh(indices);
    }
    
    return null;
}

// Creates a submesh for vertical surfaces (walls)
function createSubmeshForVerticalSurfaces(mesh, threshold) {
    if (!mesh) {
        return null;
    }
    
    var indices = [];
    var normals = mesh.normals;
    var indexCount = mesh.indexCount;
    var upThreshold = 1.0 - threshold;
    
    // Process triangles
    for (var i = 0; i < indexCount; i += 3) {
        var idx1 = mesh.indices[i];
        var idx2 = mesh.indices[i + 1];
        var idx3 = mesh.indices[i + 2];
        
        var normal1 = normals[idx1];
        var normal2 = normals[idx2];
        var normal3 = normals[idx3];
        
        // Calculate average normal for the triangle
        var avgNormal = vec3.normalize(
            new vec3(
                (normal1.x + normal2.x + normal3.x) / 3.0,
                (normal1.y + normal2.y + normal3.y) / 3.0,
                (normal1.z + normal2.z + normal3.z) / 3.0
            )
        );
        
        // Check if this is a vertical surface
        // Calculate absolute dot product with up and down vectors
        var upDot = Math.abs(vec3.dot(avgNormal, vec3.up()));
        var downDot = Math.abs(vec3.dot(avgNormal, vec3.down()));
        
        // If the normal is not close to up or down, it's likely a vertical surface
        if (upDot < upThreshold && downDot < upThreshold) {
            indices.push(idx1);
            indices.push(idx2);
            indices.push(idx3);
        }
    }
    
    // Create submesh if we have indices
    if (indices.length > 0) {
        return mesh.createSubmesh(indices);
    }
    
    return null;
}

// Initialize the script
initialize();