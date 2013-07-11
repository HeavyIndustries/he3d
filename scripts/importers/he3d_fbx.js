//
// FBX File loader
//
he3d.import.fbx = function(file) {
	if(file)
		this.load(file);

	this.currentFrame = 0;
	this.currentTake = 'Default Take';
	this.currentTime = 0;

	// Temps
	this.tmp = {
		xRot: he3d.m.mat4.create(),
		yRot: he3d.m.mat4.create(),
		zRot: he3d.m.mat4.create(),
		xyz:  he3d.m.vec3.create()
	};
};

he3d.import.fbx.prototype.load = function(file) {
	this.filename = file;
	this.loaded = false;

	var mxhr = new XMLHttpRequest();
	mxhr.open('GET', this.filename);

	var self = this;
	mxhr.addEventListener('error', function() {
		console.log('FATAL', 'Failed to retrieve Map:', file);
	}, false);
	mxhr.addEventListener('load', function(mxhr) {
		if (mxhr.currentTarget.status != 200) {
			console.log('FATAL', 'Failed to retrieve Map:',
				this.filename + ' (Http Status: ' + mxhr.currentTarget.status + ')');
			return;
		}
		self.parse.call(self, mxhr.currentTarget.response);
	}, false);
	mxhr.send();

	return this;
};

//
// Materials / Textures ----------------------------------------------------------------------------
//
he3d.import.fbx.prototype.getMaterial = function(model) {
	for(var c in this.Connections) {
		if (this.Connections[c].from.type == 'Material' &&
			this.Connections[c].to.type == 'Model' && this.Connections[c].to.name == model) {
			return this.Objects.Material[this.Connections[c].from.name];
		}
	}
	return false;
};

he3d.import.fbx.prototype.getTexture = function(model) {
	for (var c in this.Connections) {
		if (this.Connections[c].from.type == 'Texture' &&
			this.Connections[c].to.type == 'Model' && this.Connections[c].to.name == model) {
			return this.Objects.Texture[this.Connections[c].from.name];
		}
	}
	return false;
};

he3d.import.fbx.prototype.getTextureCoords = function(model) {
	if (!model.LayerElementUV)
		return false;

	var bits = model.PolygonVertexIndex.split(','),
		uvIndices = model.LayerElementUV.UVIndex.split(','),
		uvs = [], iCount = 0, offset, fvc = 0;

	for (var b = 0; b < bits.length; b++) {
		// End of Quad face
		if (bits[b] < 0 && fvc == 3) {
			uvs.push(
				model.LayerElementUV.UV[(uvIndices[b-3] * 2)],
				model.LayerElementUV.UV[(uvIndices[b-3] * 2) + 1]
			);

			uvs.push(
				model.LayerElementUV.UV[(uvIndices[b-1] * 2)],
				model.LayerElementUV.UV[(uvIndices[b-1] * 2) + 1]
			);

			uvs.push(
				model.LayerElementUV.UV[((uvIndices[b]) * 2)],
				model.LayerElementUV.UV[((uvIndices[b]) * 2) + 1]
			);
			fvc = 0;

		// End of Triangle Face
		} else if (bits[b] < 0 && fvc == 2) {
			uvs.push(
				model.LayerElementUV.UV[((uvIndices[b]) * 2)],
				model.LayerElementUV.UV[((uvIndices[b]) * 2) + 1]
			);
			fvc = 0;

		// Just a vert
		} else {
			uvs.push(
				model.LayerElementUV.UV[(uvIndices[b] * 2)],
				model.LayerElementUV.UV[(uvIndices[b] * 2) + 1]
			);
			fvc++;
		}
	}
	return new Float32Array(uvs);
};

he3d.import.fbx.prototype.getTextureCoordsFromIndices = function(model) {
	if (!model.LayerElementUV || model.LayerElementUV.ReferenceInformationType != 'IndexToDirect')
		return false;

	var uvIndices = model.LayerElementUV.UVIndex.split(','),
		uvs = [], iCount = 0, offset;

	for (var b = 0; b < uvIndices.length; b++) {
		offset = uvIndices[b] * 2;
		uvs.push(
			model.LayerElementUV.UV[offset],
			model.LayerElementUV.UV[offset+1]
		);
	}
	return new Float32Array(uvs);
};

//
// Animation Functions -----------------------------------------------------------------------------
//
he3d.import.fbx.prototype.animationTick = function(delta) {
	if (!this.Takes.Take || !this.Takes.Take[this.currentTake])
		return;

	if ((this.currentTime += delta) > 1.0 / this.Version5.Settings.FrameRate) {
		this.currentFrame++;
		this.currentTime = 0;
		if(this.currentFrame > this.Version5.Settings.FrameRate)
			this.currentFrame -= this.Version5.Settings.FrameRate;
	}
};

he3d.import.fbx.prototype.getTakeTransform = function(take, frame, modelName, dest) {
	if (!this.Takes.Take || !this.Takes.Take[take] || !this.Takes.Take[take].Model[modelName] ||
		!this.Takes.Take[take].Model[modelName].Channel['Transform'])
		return;

	var transform = this.Takes.Take[take].Model[modelName].Channel['Transform'],
		r = transform.Channel['R'],
		s = transform.Channel['S'],
		t = transform.Channel['T'],
		x, y, z;

	if (!dest)
		dest = he3d.m.mat4.identity();

	he3d.m.mat4.rotateX(dest, he3d.m.degtorad(270));

	// Translate ---------------
	if (frame > t.Channel['X'].KeyCount-1)
		this.tmp.xyz[0] = t.Channel['X'].Key[t.Channel['X'].KeyCount-1].value;
	else
		this.tmp.xyz[0] = t.Channel['X'].Key[frame].value;

	if (frame > t.Channel['Y'].KeyCount-1)
		this.tmp.xyz[1] = t.Channel['Y'].Key[t.Channel['Y'].KeyCount-1].value;
	else
		this.tmp.xyz[1] = t.Channel['Y'].Key[frame].value;

	if (frame > t.Channel['Z'].KeyCount-1)
		this.tmp.xyz[2] = t.Channel['Z'].Key[t.Channel['Z'].KeyCount-1].value;
	else
		this.tmp.xyz[2] = t.Channel['Z'].Key[frame].value;

	he3d.m.mat4.translate(dest, this.tmp.xyz);

	// Rotation ----------------
	if (frame > r.Channel['X'].KeyCount-1)
		x = r.Channel['X'].Key[r.Channel['X'].KeyCount-1].value;
	else
		x = r.Channel['X'].Key[frame].value;

	if (frame > r.Channel['Y'].KeyCount-1)
		y = r.Channel['Y'].Key[r.Channel['Y'].KeyCount-1].value;
	else
		y = r.Channel['Y'].Key[frame].value;

	if (frame > r.Channel['Z'].KeyCount-1)
		z = r.Channel['Z'].Key[r.Channel['Z'].KeyCount-1].value;
	else
		z = r.Channel['Z'].Key[frame].value;

	if (x < 0) x += 360;
	else if (x > 360) x -= 360;
	if (y < 0) y += 360;
	else if (y > 360) y -= 360;
	if (z < 0) z += 360;
	else if (z > 360) z -= 360;

	he3d.m.mat4.makeRotate(this.tmp.xRot, he3d.m.degtorad(x), [1,  0,  0]);
	he3d.m.mat4.makeRotate(this.tmp.yRot, he3d.m.degtorad(y), [0,  1,  0]);
	he3d.m.mat4.makeRotate(this.tmp.zRot, he3d.m.degtorad(z), [0,  0,  1]);

	he3d.m.mat4.multiply(dest, this.tmp.xRot);
	he3d.m.mat4.multiply(dest, this.tmp.yRot);
	he3d.m.mat4.multiply(dest, this.tmp.zRot);

	// Scale -------------------
	if (frame > s.Channel['X'].KeyCount-1)
		this.tmp.xyz[0] = s.Channel['X'].Key[s.Channel['X'].KeyCount-1].value;
	else
		this.tmp.xyz[0] = s.Channel['X'].Key[frame].value;

	if (frame > s.Channel['Y'].KeyCount-1)
		this.tmp.xyz[1] = s.Channel['Y'].Key[s.Channel['Y'].KeyCount-1].value;
	else
		this.tmp.xyz[1] = s.Channel['Y'].Key[frame].value;

	if (frame > s.Channel['Z'].KeyCount-1)
		this.tmp.xyz[2] = s.Channel['Z'].Key[s.Channel['Z'].KeyCount-1].value;
	else
		this.tmp.xyz[2] = s.Channel['Z'].Key[frame].value;

	he3d.m.mat4.scale(dest, this.tmp.xyz);

	return dest;
};

//
// Build Functions ---------------------------------------------------------------------------------
//
he3d.import.fbx.prototype.buildBaryCentric = function(verts) {
	var barys = [], len = verts.length / 3;

	for (var v = 0; v < len; v += 3) {
		barys.push(
			1.0, 0.0, 0.0,
			0.0, 1.0, 0.0,
			0.0, 0.0, 1.0);
	}
	return new Float32Array(barys);
};

he3d.import.fbx.prototype.buildBaryCentricQuads = function(model) {
	var bits = model.PolygonVertexIndex.split(','),
		barys = [],
		fvc = 0;

	for (var b = 0; b < bits.length; b++) {
		// End of Quad face
		if (bits[b] < 0 && fvc == 3) {

			barys.pop();
			barys.pop();
			barys.pop();
			barys.push(1.0, 1.0, 1.0);
			barys.push(1.0, 1.0, 1.0);
			barys.push(0.0, 1.0, 0.0);
			barys.push(0.0, 0.0, 1.0);
			
			fvc = 0;

		// End of Triangle Face
		} else if (bits[b] < 0 && fvc == 2) {
			barys.push(0.0, 0.0, 1.0);
			fvc = 0;

		// Just a vert
		} else {
			switch (fvc) {
				case 0:	barys.push(1.0, 0.0, 0.0); break;
				case 1:	barys.push(0.0, 1.0, 0.0); break;
				case 2:	barys.push(0.0, 0.0, 1.0); break;
			}
			fvc++;
		}
	}
	return new Float32Array(barys);
};

he3d.import.fbx.prototype.buildFaces = function(model) {
	if (!model.PolygonVertexIndex)
		return false;

	var bits = model.PolygonVertexIndex.split(','),
		vertices = [],
		fvc = 0;

	for (var b = 0; b < bits.length; b++) {
		// End of Quad face
		if (bits[b] < 0 && fvc == 3) {

			vertices.push(
				model.Vertices[(bits[b-3] * 3)],
				model.Vertices[(bits[b-3] * 3) + 1],
				model.Vertices[(bits[b-3] * 3) + 2]
			);

			vertices.push(
				model.Vertices[(bits[b-1] * 3)],
				model.Vertices[(bits[b-1] * 3) + 1],
				model.Vertices[(bits[b-1] * 3) + 2]
			);

			vertices.push(
				model.Vertices[((bits[b]^-1) * 3)],
				model.Vertices[((bits[b]^-1) * 3) + 1],
				model.Vertices[((bits[b]^-1) * 3) + 2]
			);
			fvc = 0;

		// End of Triangle Face
		} else if (bits[b] < 0 && fvc == 2) {
			vertices.push(
				model.Vertices[((bits[b]^-1) * 3)],
				model.Vertices[((bits[b]^-1) * 3) + 1],
				model.Vertices[((bits[b]^-1) * 3) + 2]
			);
			fvc = 0;

		// Just a vert
		} else {
			vertices.push(
				model.Vertices[(bits[b] * 3)],
				model.Vertices[(bits[b] * 3) + 1],
				model.Vertices[(bits[b] * 3) + 2]
			);
			fvc++;
		}
	}
	return new Float32Array(vertices);
};

he3d.import.fbx.prototype.buildFacesFromIndices = function(model) {
	if (!model.PolygonVertexIndex)
		return false;

	var bits = model.PolygonVertexIndex.split(','),
		vertices = [];

	for (var b = 0; b < bits.length; b++) {
		// End of face
		if (bits[b] < 0) {
			vertices.push(
				model.Vertices[((bits[b]^-1) * 3)],
				model.Vertices[((bits[b]^-1) * 3) + 1],
				model.Vertices[((bits[b]^-1) * 3) + 2]
			);
		} else {
			vertices.push(
				model.Vertices[(bits[b] * 3)],
				model.Vertices[(bits[b] * 3) + 1],
				model.Vertices[(bits[b] * 3) + 2]
			);
		}
	}
	return new Float32Array(vertices);
};

he3d.import.fbx.prototype.buildNormalsFromIndices = function(model) {
	if (!model.LayerElementNormal || !model.PolygonVertexIndex)
		return false;

	var bits = model.PolygonVertexIndex.split(","),
		normals = [];

	for (var b = 0; b < bits.length; b++) {
		// End of face
		if (bits[b] < 0) {
			normals.push(
				model.LayerElementNormal.Normals[((bits[b]^-1) * 3)],
				model.LayerElementNormal.Normals[((bits[b]^-1) * 3) + 1],
				model.LayerElementNormal.Normals[((bits[b]^-1) * 3) + 2]
			);
		} else {
			normals.push(
				model.LayerElementNormal.Normals[(bits[b] * 3)],
				model.LayerElementNormal.Normals[(bits[b] * 3) + 1],
				model.LayerElementNormal.Normals[(bits[b] * 3) + 2]
			);
		}
	}

	return new Float32Array(normals);
};

he3d.import.fbx.prototype.buildNormalsFromVertices = function(model, verts) {
	if(!verts)
		verts = this.buildFacesFromIndices(model);
	return 	new Float32Array(he3d.tools.createNormalsFromVerts(verts));
};

he3d.import.fbx.prototype.triangulateIndices = function(model) {
	if (!model.PolygonVertexIndex)
		return false;

	var bits = model.PolygonVertexIndex.split(','),
		indices = [], iCount = 0;

	for (var b = 0; b < bits.length; b++) {
		// End of face
		if (bits[b] < 0) {
			bits[b] ^= -1;

			// Triangulate Quads
			if (iCount == 3) {
				indices.push(
					indices[indices.length-3],
					indices[indices.length-1],
					b
				);
			} else {
				indices.push(b);
			}
			iCount = 0;
		} else {
			indices.push(b);
			iCount++;
		}
	}

	return new Uint16Array(indices);
};

he3d.import.fbx.prototype.buildRenderables = function(useIndices, buildBaryCentric) {
	if (useIndices == undefined)
		useIndices = false;

	var xRot = he3d.m.mat4.create(),
		yRot = he3d.m.mat4.create(),
		zRot = he3d.m.mat4.create(),
		model, colors, data, indices, normals, barycentric,
		material, texture, verts, texcoords,
		takeTransform;

	// Look for renderable objects in fbx
	for (var o in this.Objects.Model) {
		model = this.Objects.Model[o];

		if (model.Vertices) {
			model.vbo = {};
	
			// Textured
			if ((texture = this.getTexture(o)) && model.LayerElementUV) {
				model.vbo.texture = he3d.t.load({
					name:		texture.TextureName,
					filename:	texture.FileName,
					flip:		false,
					mipmap:		true,
					type:		'image',
					wrap:		[true, true]
				});
	
				if (useIndices) {
					verts = this.buildFacesFromIndices(model);
					texcoords = this.getTextureCoordsFromIndices(model);
					normals = this.buildNormalsFromIndices(model);
				} else {
					verts = this.buildFaces(model);
					texcoords = this.getTextureCoords(model);
					normals = this.buildNormalsFromVertices(model, verts);
				}

				if (buildBaryCentric) {
					barycentric = this.buildBaryCentricQuads(model)
					data = he3d.tools.interleaveFloat32Arrays([3, 2, 3, 3],
						[verts, texcoords, normals, barycentric]);
				} else {
					data = he3d.tools.interleaveFloat32Arrays([3, 2, 3],
						[verts, texcoords, normals]);
				}
	
			// Material Colour
			} else if (material = this.getMaterial(o)) {
	
				if (useIndices) {
					verts = this.buildFacesFromIndices(model);
					normals = this.buildNormalsFromIndices(model);
				} else {
					verts = this.buildFaces(model);
					normals = this.buildNormalsFromVertices(model, verts);
				}
	
				colors = new Float32Array(verts.length);
				for (var c = 0; c < verts.length; c += 3) {
					colors[c] = material.Properties60['DiffuseColor'].value[0];
					colors[c+1] = material.Properties60['DiffuseColor'].value[1];
					colors[c+2] = material.Properties60['DiffuseColor'].value[2];
				}

				if (buildBaryCentric) {
					barycentric = this.buildBaryCentricQuads(model)
					data = he3d.tools.interleaveFloat32Arrays([3, 3, 3, 3],
						[verts, colors, normals, barycentric]);
				} else {
					data = he3d.tools.interleaveFloat32Arrays([3, 3, 3], [verts, colors, normals]);
				}
	
			// Object Colour
			} else {
	
				if (useIndices) {
					verts = this.buildFacesFromIndices(model);
					normals = this.buildNormalsFromIndices(model);
				} else {
					verts = this.buildFaces(model);
					normals = this.buildNormalsFromVertices(model, verts);
				}
	
				colors = new Float32Array(verts.length);
				for (var c = 0; c < verts.length; c += 3) {
					colors[c] = model.Properties60['Color'].value[0];
					colors[c+1] = model.Properties60['Color'].value[1];
					colors[c+2] = model.Properties60['Color'].value[2];
				}
	
				if (buildBaryCentric) {
					barycentric = this.buildBaryCentricQuads(verts)
					data = he3d.tools.interleaveFloat32Arrays([3, 3, 3, 3],
						[verts, colors, normals, barycentric]);
				} else {
					data = he3d.tools.interleaveFloat32Arrays([3, 3, 3], [verts, colors, normals]);
				}
			}
		}
		
		// Local Transformations
		model.lclMatrix = he3d.m.mat4.identity();
		var rotMatrix = he3d.m.mat4.identity();

		he3d.m.mat4.rotateX(model.lclMatrix,he3d.m.degtorad(270));
		if (model.Properties60['Lcl Translation'])
			he3d.m.mat4.translate(model.lclMatrix, model.Properties60['Lcl Translation'].value);

		if (model.Properties60['Lcl Rotation']) {
			x = model.Properties60['Lcl Rotation'].value[0];
			y = model.Properties60['Lcl Rotation'].value[1];
			z = model.Properties60['Lcl Rotation'].value[2];

			if(x < 0) x += 360;
			else if(x > 360) x -= 360;
			if(y < 0) y += 360;
			else if(y > 360) y -= 360;
			if(z < 0) z += 360;
			else if(z > 360) z -= 360;

			he3d.m.mat4.makeRotate(xRot, he3d.m.degtorad(x), [1,  0,  0]);
			he3d.m.mat4.makeRotate(yRot, he3d.m.degtorad(y), [0,  1,  0]);
			he3d.m.mat4.makeRotate(zRot, he3d.m.degtorad(z), [0,  0,  1]);

			he3d.m.mat4.multiply(model.lclMatrix, xRot);
			he3d.m.mat4.multiply(model.lclMatrix, yRot);
			he3d.m.mat4.multiply(model.lclMatrix, zRot);

			he3d.m.mat4.rotateX(rotMatrix,he3d.m.degtorad(270));
			he3d.m.mat4.multiply(rotMatrix, xRot);
			he3d.m.mat4.multiply(rotMatrix, yRot);
			he3d.m.mat4.multiply(rotMatrix, zRot);
		}

		if (model.Properties60['Lcl Scaling'])
			he3d.m.mat4.scale(model.lclMatrix, model.Properties60['Lcl Scaling'].value);

		// Animation
		model.aMatrix = this.getTakeTransform(this.currentTake, this.currentFrame, o);

		// Model Matrix
		model.mMatrix = he3d.m.mat4.create(model.lclMatrix);
		model.nMatrix = he3d.m.mat4.toInverseMat3(rotMatrix);
		he3d.m.mat3.transpose(model.nMatrix);

		// Upload to GL
		if (data) {
			model.vbo.buf_data = he3d.gl.createBuffer();
			he3d.gl.bindBuffer(he3d.gl.ARRAY_BUFFER, model.vbo.buf_data);
			he3d.gl.bufferData(he3d.gl.ARRAY_BUFFER, data, he3d.gl.STATIC_DRAW);
	
			// Indexed rendering
			if (useIndices && (indices = this.triangulateIndices(model))) {
				model.vbo.buf_indices = he3d.gl.createBuffer();
				model.vbo.indices = indices.length;
				he3d.gl.bindBuffer(he3d.gl.ELEMENT_ARRAY_BUFFER, model.vbo.buf_indices);
				he3d.gl.bufferData(he3d.gl.ELEMENT_ARRAY_BUFFER, indices, he3d.gl.STATIC_DRAW);
			} else {
				model.vbo.count = verts.length / 3;
			}
		}
		data = null;
	}
};

//
// Parse FBX file ----------------------------------------------------------------------------------
//
he3d.import.fbx.prototype.parse = function(data) {
	try {
		var eStack = [],
			lno, line, nLine, seppos, cType, cKey, cName,
			pValue,	e, eName, eLabel, eFields, bits,
			eCur = this,
			lines = data.split("\n");

		for (lno in lines) {
			line = lines[lno].trim();

			if (parseInt(lno)+1 < lines.length) {
				nLine = lines[parseInt(lno)+1].trim();

				// Catch line wrapping
				if (line[line.length-1] == ':' && nLine.indexOf('}') == -1 &&
					nLine.indexOf(':') == -1) {

					line = line + ' ' + nLine;
					lno++;
				}
				while (nLine[0] == ',' || line[line.length-1] == ',') {
					line = line + ' ' + nLine;
					lno++;
					nLine = lines[parseInt(lno)+1].trim();
				}
			}

			// Skip blanks and comment lines
			if (line.length < 1 || line[0] == ';')
				continue;

			// Array of containers
			if (line.indexOf('"') > 0 && (seppos = line.indexOf(':')) > 0 &&
				line.indexOf('{') > 0) {

				eName   = line.substring(0, seppos).trim();
				eFields = line.match(/"(.*?)"/g);
				eLabel  = eFields[0].replace(/\"/g, '');
				if (eLabel.indexOf('::') > -1)
					eLabel = eLabel.substring(eLabel.indexOf('::') + 2, eLabel.length);

				if (eStack.length) {
					eStack.push([eName, eLabel]);
					if (!eCur[eName]) {
						eCur[eName] = [];
					}
					if (!Array.isArray(eCur[eName])) {
						eCur[eName] = [];
					}
					eCur[eName][eLabel] = {};
					eCur = eCur[eName][eLabel];
				} else {
					eStack.push(eName);
					this[eName] = {};
					eCur = this[eName];
				}

			// Property element
			} else if(line.indexOf('"') > 0 && (seppos = line.indexOf(':')) > 0 &&
				line.indexOf(',') > 0) {

				bits = line.substring(seppos+2, line.length).trim();
				bits = bits.split(',');

				bits[0] = bits[0].replace(/\"/g, '').trim();
				bits[1] = bits[1].replace(/\"/g, '').trim();
				bits[2] = bits[2].replace(/\"/g, '').trim();

				// Connections handle lines without named keys
				if(line.substring(0, seppos) == 'Connect') {
					var from = bits[1].split('::');
					var to = bits[2].split('::');
					eCur.push({
						type:	bits[0],
						from:	{
							type:	from[0],
							name:	from[1]
						},
						to:		{
							type:	to[0],
							name:	to[1]
						}
					});
					continue;
				}

				pValue = '';
				if (bits.length == 4)
					bits[3] = bits[3].replace(/\"/g, '').trim();

				switch (bits[1].toLowerCase()) {
					case 'bool':
						pValue = false;
						if(bits[3] == 1)
							pValue = true;
						break;

					case 'double':
					case 'int':
					case 'integer':
					case 'number':
					case 'real':
						pValue = Number(bits[3]);
						break;

					case 'color':
					case 'colorrgb':
					case 'colorrgba':
					case 'lcl rotation':
					case 'lcl scaling':
					case 'lcl translation':
					case 'vector3d':
						pValue = [];
						for (var b = 3; b < bits.length; b++)
							pValue.push((!isNaN(bits[b]) ? Number(bits[b]) : bits[b]));
						pValue = new Float32Array(pValue);
						break;

					case 'enum':
					default:
						if(bits.length > 3)
							pValue = bits[3];
						break;
				}

				eCur[bits[0]] = {
					type:	bits[1],
					flag: 	(bits[2].length ? bits[2] : null),
					value:	pValue
				};

			// Container element
			} else if ((seppos = line.indexOf(':')) > 0 && line.indexOf('{') > 0) {
				eName = line.substring(0, seppos).trim();

				if (eStack.length) {
					eStack.push(eName);
					eCur[eName] = {};
					eCur = eCur[eName];
				} else {
					eStack.push(eName);
					switch(eName) {
						case 'Connections':
							this[eName] = [];
							break;
						default:
							this[eName] = {};
							break;
					}
					eCur = this[eName];
				}

			// End of container
			} else if(line.indexOf('}') > -1) {
				eStack.pop();
				eCur = this;
				if (eStack.length) {
					for(e in eStack) {
						if (Array.isArray(eStack[e])) {
							eCur = eCur[eStack[e][0]][eStack[e][1]];
						} else {
							eCur = eCur[eStack[e]];
						}
					}
				}
				eLabel = null;

			// Child
			} else if ((seppos = line.indexOf(':')) > 0) {
				cKey = line.substring(0, seppos).trim();
				cValue = line.substring(seppos+1, line.length).trim();

				if (!cValue.length) {
					eCur[cKey] = null;
					continue;
				}

				switch (cKey.toLowerCase()) {
					case 'ambientlightcolor':
					case 'color':
					case 'matrix':
					case 'normals':
					case 'position':
					case 'uv':
					case 'vertices':
						bits = cValue.split(',');
						eCur[cKey] = new Float32Array(bits);
						break;

					case 'key':
						bits = cValue.split(',');
						eCur[cKey] = [];
						for(var k = 0; k < bits.length; k += 3){
							eCur[cKey].push({
								time: 	bits[k],
								value: 	bits[k + 1],
								key: 	bits[k + 2]
							});
						}
						break;

					default:
						if (!isNaN(cValue)) {
							eCur[cKey] = Number(cValue);
						} else {
							eCur[cKey] = cValue.replace(/\"/g, '');
						}
						break;
				}
			}
		}
	} catch (e) {
		console.log('------------------------------------------------');
		console.log('Parsing failed at line [' + lno + "]:\n\t", lines[lno]);
		console.log('Exception: ' + e.name + ' : ' + e.message);
		console.log('Pointer @ ' + eCur);
		console.log('Stack => ', eStack);
		console.log('------------------------------------------------');
	}
		
	this.loaded = true;
	return this;
};
