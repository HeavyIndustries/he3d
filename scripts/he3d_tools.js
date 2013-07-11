//
// Tools
//
if (typeof(he3d)!='object') // Loaded from a worker
	he3d = {};
else
	he3d.log('notice', 'Include Loaded...', 'Tools');
he3d.tools = {};

//
// GL Data Interleaving ----------------------------------------------------------------------------
//
he3d.tools.interleaveFloat32Arrays = function(stride, arrays) {
    var rows = arrays[0].length / stride[0],
		data = new Float32Array(rows * (stride.reduce(function(a, b) {return a + b; }))),
		i = 0;
    for (var r = 0; r < rows; r++) {
        for (var d = 0; d < arrays.length; d++) {
            for (var s = 0; s < stride[d]; s++) {
                data[i++] = parseFloat(arrays[d][(r * stride[d]) + s]);
            }
        }
    }
    return data;
};

//
// Create Normals from Verts -----------------------------------------------------------------------
//
he3d.tools.createNormalsFromVerts = function(verts) {
	var normals = new Array(),
		tverts = verts.length,
		vert1 = he3d.m.vec3.create(),
		vert2 = he3d.m.vec3.create(),
		vert3 = he3d.m.vec3.create(),
		v1 = he3d.m.vec3.create(),
		v2 = he3d.m.vec3.create(),
		vc = he3d.m.vec3.create();

	for (var v = 0; v < tverts; v += 9) {
		// Calculate normal vectors
		he3d.m.vec3.set([
			verts[v],
			verts[v + 1],
			verts[v + 2]
		], vert1);
		he3d.m.vec3.set([
			verts[v + 3],
			verts[v + 4],
			verts[v + 5]
		], vert2);
		he3d.m.vec3.set([
			verts[v + 6],
			verts[v + 7],
			verts[v + 8]
		], vert3);

		he3d.m.vec3.subtract(vert2, vert1, v1);
		he3d.m.vec3.subtract(vert3, vert1, v2);

		he3d.m.vec3.cross(v1, v2, vc);
		he3d.m.vec3.normalize(vc);

		normals.push(
			vc[0], vc[1], vc[2],
			vc[0], vc[1], vc[2],
			vc[0], vc[1], vc[2]
		);
	}
	return normals;
};

he3d.tools.getTangent = function(v0, v1, v2, tc0, tc1, tc2, dest) {
	if (!dest)
		dest = he3d.m.vec3.create();

	var e1 = he3d.m.vec3.create(),
		e2 = he3d.m.vec3.create(),
		u = he3d.m.vec2.create(),
		v = he3d.m.vec2.create();

	he3d.m.vec3.subtract(v1, v0, e1);
	he3d.m.vec3.subtract(v2, v0, e2);
	he3d.m.vec2.subtract(tc1, tc0, u);
	he3d.m.vec2.subtract(tc2, tc0, v);

	f = 1 / (u[0] * v[1] - u[1] * v[0]);
	dest[0] = f * (v[1] * e1[0] - v[0] * e2[0]);
	dest[1] = f * (v[1] * e1[1] - v[0] * e2[1]);
	dest[2] = f * (v[1] * e1[2] - v[0] * e2[2]);
	return dest;
};

//
// Bounding Box ------------------------------------------------------------------------------------
//
he3d.tools.rebuildAABB = function(verts, bb, rotMat, rebuildVbo) {
	if (!this.vert)
		this.vert = he3d.m.vec3.create([0, 0, 0]);

	if (!bb) {
		bb = {
			x:		{ min: 0, max: 0 },
			y:		{ min: 0, max: 0 },
			z:		{ min: 0, max: 0 },
			width:	0,
			height:	0,
			depth:	0
		};
	}

	var x, y, z;

	bb.x.min = Infinity;
	bb.x.max = -Infinity;
	bb.y.min = Infinity;
	bb.y.max = -Infinity;
	bb.z.min = Infinity;
	bb.z.max = -Infinity;

	for (var v = 0; v < verts.length; v+= 3) {
		x = verts[v];
		y = verts[v + 1];
		z = verts[v + 2];

		this.vert[0] = rotMat[0] * x + rotMat[4] * y + rotMat[8] * z + rotMat[12];
		this.vert[1] = rotMat[1] * x + rotMat[5] * y + rotMat[9] * z + rotMat[13];
		this.vert[2] = rotMat[2] * x + rotMat[6] * y + rotMat[10] * z + rotMat[14];

		if (parseFloat(this.vert[0]) < parseFloat(bb.x.min))
			bb.x.min = parseFloat(this.vert[0]);
		else if (parseFloat(this.vert[0]) > parseFloat(bb.x.max))
			bb.x.max = parseFloat(this.vert[0]);

		if (parseFloat(this.vert[1]) < parseFloat(bb.y.min))
			bb.y.min = parseFloat(this.vert[1]);
		else if (parseFloat(this.vert[1]) > parseFloat(bb.y.max))
			bb.y.max = parseFloat(this.vert[1]);

		if (parseFloat(this.vert[2]) < parseFloat(bb.z.min))
			bb.z.min = parseFloat(this.vert[2]);
		else if (parseFloat(this.vert[2]) > parseFloat(bb.z.max))
			bb.z.max = parseFloat(this.vert[2]);
	}

	bb.width = Math.abs(bb.x.min - bb.x.max);
	bb.height = Math.abs(bb.y.min - bb.y.max);
	bb.depth = Math.abs(bb.z.min - bb.z.max);

	if (rebuildVbo != null)
		rebuildVbo.bbox_vbo = he3d.primatives.bbox(bb);

	return bb;
};

he3d.tools.rebuildDOP18 = function(pos, rotMat, verts, dop18) {
	if (!this.vert)
		this.vert = he3d.m.vec3.create([0, 0, 0]);

	var val, x, y, z;
	if (!dop18) {
		dop18 = {
			min: new Float32Array(8),
			max: new Float32Array(8)
		};
	}

	for (var d = 0; d < 9; d++) {
		dop18.min[d] = Infinity;
		dop18.max[d] = -Infinity;
	}

	for (var v = 0; v < verts.length; v += 3) {
		x = verts[v];
		y = verts[v + 1];
		z = verts[v + 2];

		this.vert[0] = rotMat[0] * x + rotMat[4] * y + rotMat[8] * z + pos[0];
		this.vert[1] = rotMat[1] * x + rotMat[5] * y + rotMat[9] * z + pos[1];
		this.vert[2] = rotMat[2] * x + rotMat[6] * y + rotMat[10] * z + pos[2];

		// X
		val = this.vert[0];
		if (val < dop18.min[0]) dop18.min[0] = val;
		if (val > dop18.max[0]) dop18.max[0] = val;

		// Y
		val = this.vert[1];
		if (val < dop18.min[1]) dop18.min[1] = val;
		if (val > dop18.max[1]) dop18.max[1] = val;

		// Z
		val = this.vert[2];
		if (val < dop18.min[2]) dop18.min[2] = val;
		if (val > dop18.max[2]) dop18.max[2] = val;

		// X + Y
		val = this.vert[0]+this.vert[1];
		if (val < dop18.min[3]) dop18.min[3] = val;
		if (val > dop18.max[3]) dop18.max[3] = val;

		// X + Z
 		val = this.vert[0]+this.vert[2];
		if (val < dop18.min[4]) dop18.min[4] = val;
		if (val > dop18.max[4]) dop18.max[4] = val;

		// Y + Z
		val = this.vert[1] + this.vert[2];
		if (val < dop18.min[5]) dop18.min[5] = val;
		if (val > dop18.max[5]) dop18.max[5] = val;

		// X - Y
		val = this.vert[0] - this.vert[1];
		if (val < dop18.min[6]) dop18.min[6] = val;
		if (val > dop18.max[6]) dop18.max[6] = val;

		// X - Z
 		val = this.vert[0] - this.vert[2];
		if (val < dop18.min[7]) dop18.min[7] = val;
		if (val > dop18.max[7]) dop18.max[7] = val;

		// Y - Z
		val = this.vert[1] - this.vert[2];
		if (val < dop18.min[8]) dop18.min[8] = val;
		if (val > dop18.max[8]) dop18.max[8] = val;
	}
	return dop18;
};
