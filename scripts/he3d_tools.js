//
// Tools
//
if(typeof(he3d)!='object') // Loaded from a worker
	he3d={};
else
	he3d.log('notice','Include Loaded...','Tools');
he3d.tools={};

//
// GL Data Interleaving ----------------------------------------------------------------------------
//
he3d.tools.interleaveFloat32Arrays=function(stride,arrays){
    var rows=arrays[0].length/stride[0];
    var data=new Float32Array(rows*(stride.reduce(function(a,b){return a+b;})));
    var i=0;
    for(var r=0;r<rows;r++){
        for(var d=0;d<arrays.length;d++){
            for(var s=0;s<stride[d];s++){
                data[i++]=parseFloat(arrays[d][(r*stride[d])+s]);
            }
        }
    }
    return data;
};

//
// Create Normals from Verts -----------------------------------------------------------------------
//
he3d.tools.createNormalsFromVerts=function(verts){
	var normals=new Array();
	var tverts=verts.length;
	var vert1=he3d.m.vec3.create();
	var vert2=he3d.m.vec3.create();
	var vert3=he3d.m.vec3.create();
	var v1=he3d.m.vec3.create();
	var v2=he3d.m.vec3.create();
	var vc=he3d.m.vec3.create();
	for(var v=0;v<tverts;v+=9){
		// Calculate normal vectors
		he3d.m.vec3.set([
			verts[v],
			verts[v+1],
			verts[v+2]
		],vert1);
		he3d.m.vec3.set([
			verts[v+3],
			verts[v+4],
			verts[v+5]
		],vert2);
		he3d.m.vec3.set([
			verts[v+6],
			verts[v+7],
			verts[v+8]
		],vert3);
			
		he3d.m.vec3.subtract(vert2,vert1,v1);
		he3d.m.vec3.subtract(vert3,vert1,v2);
			
		he3d.m.vec3.cross(v1,v2,vc);
		he3d.m.vec3.normalize(vc);
			
		normals.push(
			vc[0],vc[1],vc[2],
			vc[0],vc[1],vc[2],
			vc[0],vc[1],vc[2]
		);
	}
	return normals;
};
