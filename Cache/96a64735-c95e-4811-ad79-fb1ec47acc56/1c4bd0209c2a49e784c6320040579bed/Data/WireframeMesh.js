// @input Asset.RenderMesh mesh
// @input Asset.Material material
// @input float wireframeThickness

var checkInputs = function(){
  if (!script.mesh) {
        print("ERROR: Mesh input not set.");
        return false;
  }
  if (!script.material) {
        print("ERROR: Material input not set.");
        return false;
  }
  return true;
};

var init = function(){
    var indices = script.mesh.extractIndices();
    var pos = script.mesh.extractVerticesForAttribute("position");
    var normals = script.mesh.extractVerticesForAttribute("normal");
    
    
    var totalVerts = indices.length * 4;
    var totalMeshes = Math.ceil(totalVerts / Math.pow(2, 16));
    
    var createMeshForIndices = function(indices, pos, normals, startIndex, endIndex){
        var mb = new MeshBuilder([
            // vertex position (x,y,z)
            { name: "position", components: 3 },
            // normal vector (x,y,z)
            { name: "normal", components: 3, normalized: true },
            // texture UV (u,v)
            { name: "texture0", components: 2 },
        ]);
        
        mb.topology = MeshTopology.Triangles;
        mb.indexType = MeshIndexType.UInt16;
        
        var buildQuad = function(start, end, width, normal) {
            var edge = end.sub(start);
            var sideVec = edge.cross(normal).normalize();
        
            var leftTop = start.add(sideVec.uniformScale(-width));
            var rightTop = start.add(sideVec.uniformScale(width));
            var leftBottom = end.add(sideVec.uniformScale(-width));
            var rightBottom = end.add(sideVec.uniformScale(width));
            
            return [
                // Position         Normal      UV       Index
                leftTop.x, leftTop.y, leftTop.z,       0, 0, 1,    0, 1,    // 0
                leftBottom.x, leftBottom.y, leftBottom.z,    0, 0, 1,    0, 0,    // 1
                rightBottom.x, rightBottom.y, rightBottom.z,   0, 0, 1,    1, 0,    // 2
                rightTop.x, rightTop.y, rightTop.z,      0, 0, 1,    1, 1,    // 3
            ];
            
        }
        
        var addQuadToVerts = function(quad, indices, verts, quadIndex) {
            var startIndex = quadIndex * 4;
            for (var i = 0; i < quad.length; i++){
                verts.push(quad[i]);
            }
            indices.push(startIndex + 0);
            indices.push(startIndex + 1);
            indices.push(startIndex + 2);
            indices.push(startIndex + 2);
            indices.push(startIndex + 3);
            indices.push(startIndex + 0);
        }
        
        var verts = [];
        var outIndices = [];
        var quadIndex = 0;
        for(var i = startIndex; i < endIndex; i+=3){
            var idx0 = indices[i]*3;
            var vert0_x = pos[idx0];
            var vert0_y = pos[idx0+1];
            var vert0_z = pos[idx0+2];
            var vert0 = new vec3(vert0_x, vert0_y, vert0_z);
            
            var idx1 = indices[i+1]*3;
            var vert1_x = pos[idx1];
            var vert1_y = pos[idx1+1];
            var vert1_z = pos[idx1+2];
            var vert1 = new vec3(vert1_x, vert1_y, vert1_z);
            
            var idx2 = indices[i+2]*3;
            var vert2_x = pos[idx2];
            var vert2_y = pos[idx2+1];
            var vert2_z = pos[idx2+2];
            var vert2 = new vec3(vert2_x, vert2_y, vert2_z);
        
        
            var edge0 = vert1.sub(vert0);
            var edge1 = vert2.sub(vert0);
            var normal = edge0.cross(edge1).normalize();
            
            var quad1 = buildQuad(vert0, vert1, script.wireframeThickness, normal);    
            var quad2 = buildQuad(vert1, vert2, script.wireframeThickness, normal);    
            var quad3 = buildQuad(vert0, vert2, script.wireframeThickness, normal);
        
            addQuadToVerts(quad1, outIndices, verts, quadIndex);
            addQuadToVerts(quad2, outIndices, verts, quadIndex+1);
            addQuadToVerts(quad3, outIndices, verts, quadIndex+2);
            quadIndex += 3;
        }
        
        mb.appendVerticesInterleaved(verts);
        mb.appendIndices(outIndices);
        
        if(mb.isValid()){
            var renderMeshVisual = script.getSceneObject().createComponent("Component.RenderMeshVisual");
            renderMeshVisual.mesh = mb.getMesh();
            renderMeshVisual.mainMaterial = script.material;
            mb.updateMesh();
        }
    }
    
    for(var m = 0; m < totalMeshes; m++){
        var startIndex = Math.ceil(indices.length * ((m) / totalMeshes));
        var endIndex = indices.length * ((m+1) / totalMeshes) - 1;
        createMeshForIndices(indices, pos, normals, startIndex, endIndex);
    }
};


if(checkInputs()){
    init();
};
    
