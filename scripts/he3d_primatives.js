//
// Primative Objects
//
he3d.log('notice','Include Loaded...','Primatives');
he3d.primatives={
	debug: false
};

he3d.primatives.bbox=function(s){
	if(!s)s={};
	var opts={
		color:[1.0,0.0,0.0,1.0],
		insideout:false
	};
	for(var a in s){opts[a]=s[a];}

	var bbox={};
	
	var verts=new Float32Array([
		// Front face
		opts.x.min, opts.y.min, opts.z.max,
		opts.x.max, opts.y.min, opts.z.max,
		opts.x.max, opts.y.max, opts.z.max,
		opts.x.min, opts.y.max, opts.z.max,

		// Back face
		opts.x.min, opts.y.min, opts.z.min,
		opts.x.min, opts.y.max, opts.z.min,
		opts.x.max, opts.y.max, opts.z.min,
		opts.x.max, opts.y.min, opts.z.min,

		// Top face
		opts.x.min, opts.y.max, opts.z.min,
		opts.x.min, opts.y.max, opts.z.max,
		opts.x.max, opts.y.max, opts.z.max,
		opts.x.max, opts.y.max, opts.z.min,

		// Bottom face
		opts.x.min, opts.y.min, opts.z.min,
		opts.x.max, opts.y.min, opts.z.min,
		opts.x.max, opts.y.min, opts.z.max,
		opts.x.min, opts.y.min, opts.z.max,

		// Right face
		opts.x.max, opts.y.min, opts.z.min,
		opts.x.max, opts.y.max, opts.z.min,
		opts.x.max, opts.y.max, opts.z.max,
		opts.x.max, opts.y.min, opts.z.max,

		// Left face
		opts.x.min, opts.y.min, opts.z.min,
		opts.x.min, opts.y.min, opts.z.max,
		opts.x.min, opts.y.max, opts.z.max,
		opts.x.min, opts.y.max, opts.z.min
	]);
	var normals=new Float32Array([
		// Front face
		-1.0, -1.0,  1.0,
		 1.0, -1.0,  1.0,
		 1.0,  1.0,  1.0,
		-1.0,  1.0,  1.0,

		// Back face
		-1.0, -1.0, -1.0,
		-1.0,  1.0, -1.0,
		 1.0,  1.0, -1.0,
		 1.0, -1.0, -1.0,

		// Top face
		-1.0,  1.0, -1.0,
		-1.0,  1.0,  1.0,
		 1.0,  1.0,  1.0,
		 1.0,  1.0, -1.0,

		// Bottom face
		-1.0, -1.0, -1.0,
		 1.0, -1.0, -1.0,
		 1.0, -1.0,  1.0,
		-1.0, -1.0,  1.0,

		// Right face
		 1.0, -1.0, -1.0,
		 1.0,  1.0, -1.0,
		 1.0,  1.0,  1.0,
		 1.0, -1.0,  1.0,

		// Left face
		-1.0, -1.0, -1.0,
		-1.0, -1.0,  1.0,
		-1.0,  1.0,  1.0,
		-1.0,  1.0, -1.0
	]);
	var texcoords=new Float32Array([
		// Front face
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		
		// Back face
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		
		// Top face
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		
		// Bottom face
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0,
		
		// Right face
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		
		// Left face
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0
	]);

	// RGBA
	var colors=new Float32Array([
		// Front face
		opts.color[0], opts.color[1], opts.color[2], opts.color[3],
		opts.color[0], opts.color[1], opts.color[2], opts.color[3],
		opts.color[0], opts.color[1], opts.color[2], opts.color[3],
		opts.color[0], opts.color[1], opts.color[2], opts.color[3],
		
		// Back face
		opts.color[0], opts.color[1], opts.color[2], opts.color[3],
		opts.color[0], opts.color[1], opts.color[2], opts.color[3],
		opts.color[0], opts.color[1], opts.color[2], opts.color[3],
		opts.color[0], opts.color[1], opts.color[2], opts.color[3],
		
		// Top face
		opts.color[0], opts.color[1], opts.color[2], opts.color[3],
		opts.color[0], opts.color[1], opts.color[2], opts.color[3],
		opts.color[0], opts.color[1], opts.color[2], opts.color[3],
		opts.color[0], opts.color[1], opts.color[2], opts.color[3],
		
		// Bottom face
		opts.color[0], opts.color[1], opts.color[2], opts.color[3],
		opts.color[0], opts.color[1], opts.color[2], opts.color[3],
		opts.color[0], opts.color[1], opts.color[2], opts.color[3],
		opts.color[0], opts.color[1], opts.color[2], opts.color[3],
		
		// Right face
		opts.color[0], opts.color[1], opts.color[2], opts.color[3],
		opts.color[0], opts.color[1], opts.color[2], opts.color[3],
		opts.color[0], opts.color[1], opts.color[2], opts.color[3],
		opts.color[0], opts.color[1], opts.color[2], opts.color[3],
		
		// Left face
		opts.color[0], opts.color[1], opts.color[2], opts.color[3],
		opts.color[0], opts.color[1], opts.color[2], opts.color[3],
		opts.color[0], opts.color[1], opts.color[2], opts.color[3],
		opts.color[0], opts.color[1], opts.color[2], opts.color[3]
	]);

	var data=he3d.tools.interleaveFloat32Arrays([3,3,4,2],[verts,normals,colors,texcoords]);
	bbox.buf_data=he3d.gl.createBuffer();
	he3d.gl.bindBuffer(he3d.gl.ARRAY_BUFFER,bbox.buf_data);
	he3d.gl.bufferData(he3d.gl.ARRAY_BUFFER,data,he3d.gl.STATIC_DRAW);

	// Flip indexes
	if(opts.insideout){
		var indices=new Uint16Array([
			2, 1, 0,      3, 2, 0,    // Front face
			6, 5, 4,      7, 6, 4,    // Back face
			10, 9, 8,     11, 10, 8,  // Top face
			14, 13, 12,   15, 14, 12, // Bottom face
			18, 17, 16,   19, 18, 16, // Right face
			22, 21, 20,   23, 22, 20  // Left face
		]);
	}else{
		var indices=new Uint16Array([
			0, 1, 2,      0, 2, 3,    // Front face
			4, 5, 6,      4, 6, 7,    // Back face
			8, 9, 10,     8, 10, 11,  // Top face
			12, 13, 14,   12, 14, 15, // Bottom face
			16, 17, 18,   16, 18, 19, // Right face
			20, 21, 22,   20, 22, 23  // Left face
		]);
	}
	bbox.buf_indices=he3d.gl.createBuffer();
	bbox.indices=indices.length;
	he3d.gl.bindBuffer(he3d.gl.ELEMENT_ARRAY_BUFFER,bbox.buf_indices);
	he3d.gl.bufferData(he3d.gl.ELEMENT_ARRAY_BUFFER,indices,he3d.gl.STATIC_DRAW);

	if(he3d.primatives.debug){
		he3d.log("DEBUG","bbox Vertices:",verts.length);
		he3d.log("DEBUG","bbox Normals:",normals.length);
		he3d.log("DEBUG","bbox Colors:",colors.length);
		he3d.log("DEBUG","bbox TexCoords:",texcoords.length);
		he3d.log("DEBUG","bbox Triangles:",bbox.indices/3);
		he3d.log("DEBUG","bbox Created",'');
	}
	
	bbox.loaded=true;
	bbox.rendertype=he3d.gl.TRIANGLES;
	return bbox;
};

he3d.primatives.cube=function(s){
	if(!s)s={};
	var opts={
		color:[1.0,0.0,1.0,1.0],
		insideout:false,
		scale:1.0
	};
	for(var a in s){opts[a]=s[a];}

	var cube={};
	
	var verts=new Float32Array([
		// Front face
		-1.0*opts.scale, -1.0*opts.scale,  1.0*opts.scale,
		 1.0*opts.scale, -1.0*opts.scale,  1.0*opts.scale,
		 1.0*opts.scale,  1.0*opts.scale,  1.0*opts.scale,
		-1.0*opts.scale,  1.0*opts.scale,  1.0*opts.scale,

		// Back face
		-1.0*opts.scale, -1.0*opts.scale, -1.0*opts.scale,
		-1.0*opts.scale,  1.0*opts.scale, -1.0*opts.scale,
		 1.0*opts.scale,  1.0*opts.scale, -1.0*opts.scale,
		 1.0*opts.scale, -1.0*opts.scale, -1.0*opts.scale,

		// Top face
		-1.0*opts.scale,  1.0*opts.scale, -1.0*opts.scale,
		-1.0*opts.scale,  1.0*opts.scale,  1.0*opts.scale,
		 1.0*opts.scale,  1.0*opts.scale,  1.0*opts.scale,
		 1.0*opts.scale,  1.0*opts.scale, -1.0*opts.scale,

		// Bottom face
		-1.0*opts.scale, -1.0*opts.scale, -1.0*opts.scale,
		 1.0*opts.scale, -1.0*opts.scale, -1.0*opts.scale,
		 1.0*opts.scale, -1.0*opts.scale,  1.0*opts.scale,
		-1.0*opts.scale, -1.0*opts.scale,  1.0*opts.scale,

		// Right face
		 1.0*opts.scale, -1.0*opts.scale, -1.0*opts.scale,
		 1.0*opts.scale,  1.0*opts.scale, -1.0*opts.scale,
		 1.0*opts.scale,  1.0*opts.scale,  1.0*opts.scale,
		 1.0*opts.scale, -1.0*opts.scale,  1.0*opts.scale,

		// Left face
		-1.0*opts.scale, -1.0*opts.scale, -1.0*opts.scale,
		-1.0*opts.scale, -1.0*opts.scale,  1.0*opts.scale,
		-1.0*opts.scale,  1.0*opts.scale,  1.0*opts.scale,
		-1.0*opts.scale,  1.0*opts.scale, -1.0*opts.scale
	]);
	var normals=new Float32Array([
		// Front face
		-1.0, -1.0,  1.0,
		 1.0, -1.0,  1.0,
		 1.0,  1.0,  1.0,
		-1.0,  1.0,  1.0,

		// Back face
		-1.0, -1.0, -1.0,
		-1.0,  1.0, -1.0,
		 1.0,  1.0, -1.0,
		 1.0, -1.0, -1.0,

		// Top face
		-1.0,  1.0, -1.0,
		-1.0,  1.0,  1.0,
		 1.0,  1.0,  1.0,
		 1.0,  1.0, -1.0,

		// Bottom face
		-1.0, -1.0, -1.0,
		 1.0, -1.0, -1.0,
		 1.0, -1.0,  1.0,
		-1.0, -1.0,  1.0,

		// Right face
		 1.0, -1.0, -1.0,
		 1.0,  1.0, -1.0,
		 1.0,  1.0,  1.0,
		 1.0, -1.0,  1.0,

		// Left face
		-1.0, -1.0, -1.0,
		-1.0, -1.0,  1.0,
		-1.0,  1.0,  1.0,
		-1.0,  1.0, -1.0
	]);
	var texcoords=new Float32Array([
		// Front face
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		
		// Back face
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		
		// Top face
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		
		// Bottom face
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0,
		
		// Right face
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		
		// Left face
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0
	]);

	// RGBA
	var colors=new Float32Array([
		// Front face
		opts.color[0], opts.color[1], opts.color[2], opts.color[3],
		opts.color[0], opts.color[1], opts.color[2], opts.color[3],
		opts.color[0], opts.color[1], opts.color[2], opts.color[3],
		opts.color[0], opts.color[1], opts.color[2], opts.color[3],
		
		// Back face
		opts.color[1], opts.color[1], opts.color[2], opts.color[3],
		opts.color[1], opts.color[1], opts.color[2], opts.color[3],
		opts.color[1], opts.color[1], opts.color[2], opts.color[3],
		opts.color[1], opts.color[1], opts.color[2], opts.color[3],
		
		// Top face
		opts.color[2], opts.color[1], opts.color[2], opts.color[3],
		opts.color[2], opts.color[1], opts.color[2], opts.color[3],
		opts.color[2], opts.color[1], opts.color[2], opts.color[3],
		opts.color[2], opts.color[1], opts.color[2], opts.color[3],
		
		// Bottom face
		opts.color[1], opts.color[2], opts.color[2], opts.color[3],
		opts.color[1], opts.color[2], opts.color[2], opts.color[3],
		opts.color[1], opts.color[2], opts.color[2], opts.color[3],
		opts.color[1], opts.color[2], opts.color[2], opts.color[3],
		
		// Right face
		opts.color[0], opts.color[0], opts.color[1], opts.color[3],
		opts.color[0], opts.color[0], opts.color[1], opts.color[3],
		opts.color[0], opts.color[0], opts.color[1], opts.color[3],
		opts.color[0], opts.color[0], opts.color[1], opts.color[3],
		
		// Left face
		opts.color[0], opts.color[1], opts.color[0], opts.color[3],
		opts.color[0], opts.color[1], opts.color[0], opts.color[3],
		opts.color[0], opts.color[1], opts.color[0], opts.color[3],
		opts.color[0], opts.color[1], opts.color[0], opts.color[3]
	]);

	var data=he3d.tools.interleaveFloat32Arrays([3,3,4,2],[verts,normals,colors,texcoords]);
	cube.buf_data=he3d.gl.createBuffer();
	he3d.gl.bindBuffer(he3d.gl.ARRAY_BUFFER,cube.buf_data);
	he3d.gl.bufferData(he3d.gl.ARRAY_BUFFER,data,he3d.gl.STATIC_DRAW);

	// Flip indexes
	if(opts.insideout){
		var indices=new Uint16Array([
			2, 1, 0,      3, 2, 0,    // Front face
			6, 5, 4,      7, 6, 4,    // Back face
			10, 9, 8,     11, 10, 8,  // Top face
			14, 13, 12,   15, 14, 12, // Bottom face
			18, 17, 16,   19, 18, 16, // Right face
			22, 21, 20,   23, 22, 20  // Left face
		]);
	}else{
		var indices=new Uint16Array([
			0, 1, 2,      0, 2, 3,    // Front face
			4, 5, 6,      4, 6, 7,    // Back face
			8, 9, 10,     8, 10, 11,  // Top face
			12, 13, 14,   12, 14, 15, // Bottom face
			16, 17, 18,   16, 18, 19, // Right face
			20, 21, 22,   20, 22, 23  // Left face
		]);
	}
	cube.buf_indices=he3d.gl.createBuffer();
	cube.indices=indices.length;
	he3d.gl.bindBuffer(he3d.gl.ELEMENT_ARRAY_BUFFER,cube.buf_indices);
	he3d.gl.bufferData(he3d.gl.ELEMENT_ARRAY_BUFFER,indices,he3d.gl.STATIC_DRAW);

	if(he3d.primatives.debug){
		he3d.log("DEBUG","Cube Scale:",opts.scale);
		he3d.log("DEBUG","Cube Vertices:",verts.length);
		he3d.log("DEBUG","Cube Normals:",normals.length);
		he3d.log("DEBUG","Cube Colors:",colors.length);
		he3d.log("DEBUG","Cube TexCoords:",texcoords.length);
		he3d.log("DEBUG","Cube Triangles:",cube.indices/3);
		he3d.log("DEBUG","Cube Created",'');
	}
	
	cube.loaded=true;
	cube.rendertype=he3d.gl.TRIANGLES;
	return cube;
};

he3d.primatives.cylinder=function(s){
	if(!s)s={};
	var opts={
		color:[[1.0,0.0,1.0,1.0]],
		layers:1,
		numRings:4,
		radius:[1],
		segments:10,
		spacing:2,
		insideout:false
	};
	for(var a in s){opts[a]=s[a];}

	var cylinder={};
	
	var verts=new Array();
	var normals=new Array();
	var texcoords=new Array();
	var colors=new Array();
	var indices=new Array();

	var index=0;
	for(var l=0;l<opts.layers;l++){
		var	currentRadius=(opts.radius.length!=null)?opts.radius[l]:opts.radius;
		var	color=(opts.color.length!=null)?opts.color[l]:opts.color;
		
		for(var ring=0; ring<opts.numRings; ring++){
			for(var segment=0; segment<opts.segments; segment++){
				var radians=he3d.m.degtorad((360/opts.segments)*segment);
				var x=Math.cos(radians)*currentRadius;
				var y=Math.sin(radians)*currentRadius;
				var z=ring*-opts.spacing;
	
				verts.push(x,y,z);
				normals.push(x,y,z);
	
				if(segment<(opts.segments-1)/ 2)
					texcoords.push((1.0/(opts.segments))*segment*2,(1.0/4)*ring);
				else
					texcoords.push(2.0-((1.0/(opts.segments))*segment*2),(1.0/4)*ring);
				
				colors.push(color[0],color[1],color[2],color[3]);
	
				if(ring<opts.numRings-1){
					if(segment<opts.segments-1){
						if(opts.insideout){
							indices.push(index,index+opts.segments+1,index+opts.segments);
							indices.push(index,index+1,index+opts.segments+1);
						}else{
							indices.push(index+opts.segments,index+opts.segments+1,index);
							indices.push(index+opts.segments+1,index+1,index);
						}
					}else{
						if(opts.insideout){
							indices.push(index,index+1,index+opts.segments);
							indices.push(index,index-opts.segments+1,index+1);
						}else{
							indices.push(index+opts.segments,index+1,index);
							indices.push(index+1,index-opts.segments+1,index);
						}
					}
				}
				index++;
			}
		}
	}
	
	var data=he3d.tools.interleaveFloat32Arrays([3,3,4,2],[verts,normals,colors,texcoords]);
	cylinder.buf_data=he3d.gl.createBuffer();
	he3d.gl.bindBuffer(he3d.gl.ARRAY_BUFFER,cylinder.buf_data);
	he3d.gl.bufferData(he3d.gl.ARRAY_BUFFER,data,he3d.gl.STATIC_DRAW);

	cylinder.buf_indices=he3d.gl.createBuffer();
	cylinder.indices=indices.length;
	he3d.gl.bindBuffer(he3d.gl.ELEMENT_ARRAY_BUFFER,cylinder.buf_indices);
	he3d.gl.bufferData(he3d.gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),he3d.gl.STATIC_DRAW);

	if(he3d.primatives.debug){
		he3d.log("DEBUG","Cylinder Vertices:",verts.length/3);
		he3d.log("DEBUG","Cylinder Normals:",normals.length/3);
		he3d.log("DEBUG","Cylinder Colors:",colors.length)/4;
		he3d.log("DEBUG","Cylinder TexCoords:",texcoords.length/2);
		he3d.log("DEBUG","Cylinder Triangles:",cylinder.indices/3);
		he3d.log("DEBUG","Cylinder Created",'');
	}

	cylinder.loaded=true;
	cylinder.rendertype=he3d.gl.TRIANGLES;
	return cylinder;
};

he3d.primatives.quad=function(scale,color){
	if(!scale)scale=1.0;
	if(!color)color=[1.0,0.0,1.0,1.0];
	
	var quad={};
		
	var verts=new Float32Array([
		-1.0*scale, -1.0*scale, -2.4,
		 1.0*scale, -1.0*scale, -2.4,
		 1.0*scale,  1.0*scale, -2.4,
		-1.0*scale,  1.0*scale, -2.4
	]);
	var normals=new Float32Array([
		0.0,  0.0,  1.0,
		0.0,  0.0,  1.0,
		0.0,  0.0,  1.0,
		0.0,  0.0,  1.0
	]);
	var colors=new Float32Array([
		color[0], color[1], color[2], color[3],
		color[0], color[1], color[2], color[3],
		color[0], color[1], color[2], color[3],
		color[0], color[1], color[2], color[3]
	]);
	var texcoords=new Float32Array([
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0
	]);

	var data=he3d.tools.interleaveFloat32Arrays([3,3,4,2],[verts,normals,colors,texcoords]);
	quad.buf_data=he3d.gl.createBuffer();
	he3d.gl.bindBuffer(he3d.gl.ARRAY_BUFFER,quad.buf_data);
	he3d.gl.bufferData(he3d.gl.ARRAY_BUFFER,data,he3d.gl.STATIC_DRAW);

	var indices=new Uint16Array([
		0, 1, 2, 0, 2, 3
	]);
	quad.buf_indices=he3d.gl.createBuffer();
	quad.indices=indices.length;
	he3d.gl.bindBuffer(he3d.gl.ELEMENT_ARRAY_BUFFER,quad.buf_indices);
	he3d.gl.bufferData(he3d.gl.ELEMENT_ARRAY_BUFFER,indices,he3d.gl.STATIC_DRAW);

	if(he3d.primatives.debug){
		he3d.log("DEBUG","Quad Scale:",scale);
		he3d.log("DEBUG","Quad Vertices:",verts.length/3);
		he3d.log("DEBUG","Quad Normals:",normals.length/3);
		he3d.log("DEBUG","Quad Colors:",colors.length/4);
		he3d.log("DEBUG","Quad TexCoords:",texcoords.length/2);
		he3d.log("DEBUG","Quad Triangles:",quad.indices/3);
		he3d.log("DEBUG","Quad Created",'');
	}

	quad.loaded=true;
	quad.rendertype=he3d.gl.TRIANGLES;
	return quad;
};

he3d.primatives.plane=function(size,scale,pcolors){
	var plane={};

	size++;
	var totalverts=size*size;

	var tmpverts=new Array(totalverts);
	var verts=new Array();
	var normals=new Array();
	var texcoords=new Array();
	var colors=new Array();
	var indices=new Array();

	// Verts
	for(var i=0;i<tmpverts.length;i++)
		tmpverts[i]=new Array(3);

	var count=0;
	for (var t_loop=0;t_loop < size; t_loop++){
		for (var u_loop=0;u_loop < size; u_loop++){
			tmpverts[count][0]=u_loop*scale;
			tmpverts[count][1]=0;
			tmpverts[count][2]=t_loop*scale;
			count++;
		}
	}

	var iteration=1;
	count=0;	
	while(count < (totalverts - size-1)){
		while( count < ((size * iteration)-1)){
			verts.push(
				tmpverts[count][0], tmpverts[count][1], tmpverts[count][2],
				tmpverts[count+size][0],tmpverts[count+size][1],tmpverts[count+size][2],
				tmpverts[count+1][0], tmpverts[count+1][1], tmpverts[count+1][2],
				tmpverts[count+1][0], tmpverts[count+1][1], tmpverts[count+1][2],
				tmpverts[count+size][0],tmpverts[count+size][1],tmpverts[count+size][2],
				tmpverts[count+size+1][0],tmpverts[count+size+1][1],tmpverts[count+size+1][2]
			);
			count++;
		}
		iteration++;
		count++;
	}

	iteration=1;
	count=0;	
	while(count<(totalverts-size-1)){
		while(count<((size*iteration)-1)){

			normals.push(0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0);
				
			texcoords.push(
				0.0, 0.0,
				1.0, 0.0,
				0.0, 1.0,
				0.0, 1.0,
				1.0, 0.0, 
				1.0, 1.0
			);

			// RGBA
			if(pcolors==undefined){
				colors.push(
					1.0,0.0,0.0,1.0,
					1.0,1.0,0.0,1.0,
					1.0,1.0,1.0,1.0,
					0.0,1.0,0.0,1.0,
					0.0,1.0,1.0,1.0,
					0.0,0.0,1.0,1.0
				);
			} else {				
				colors.push(
					pcolors[0],pcolors[1],pcolors[2],pcolors[3],
					pcolors[0],pcolors[1],pcolors[2],pcolors[3],
					pcolors[0],pcolors[1],pcolors[2],pcolors[3],
					pcolors[0],pcolors[1],pcolors[2],pcolors[3],
					pcolors[0],pcolors[1],pcolors[2],pcolors[3],
					pcolors[0],pcolors[1],pcolors[2],pcolors[3]
				);
			}

			count++;
		}
		iteration++;
		count++;
	}

	var data=he3d.tools.interleaveFloat32Arrays([3,3,4,2],[verts,normals,colors,texcoords]);
	plane.buf_data=he3d.gl.createBuffer();
	he3d.gl.bindBuffer(he3d.gl.ARRAY_BUFFER,plane.buf_data);
	he3d.gl.bufferData(he3d.gl.ARRAY_BUFFER,data,he3d.gl.STATIC_DRAW);

	count=0;	
	while(count<verts.length/3){
		indices.push(count);
		count++;
	};
	plane.buf_indices=he3d.gl.createBuffer();
	plane.indices=indices.length;
	he3d.gl.bindBuffer(he3d.gl.ELEMENT_ARRAY_BUFFER,plane.buf_indices);
	he3d.gl.bufferData(he3d.gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),he3d.gl.STATIC_DRAW);

	if(he3d.primatives.debug){
		he3d.log("DEBUG","Plane Size:",(size-1)+"x"+(size-1));
		he3d.log("DEBUG","Plane Scale:",scale);
		he3d.log("DEBUG","Plane Vertices:",verts.length/3);
		he3d.log("DEBUG","Plane Normals:",normals.length/3);
		he3d.log("DEBUG","Plane Colors:",colors.length/4);
		he3d.log("DEBUG","Plane TexCoords:",texcoords.length/2);
		he3d.log("DEBUG","Plane Triangles:",plane.indices/3);
		he3d.log("DEBUG","Plane Created",'');
	}

	plane.loaded=true;
	plane.rendertype=he3d.gl.TRIANGLES;
	return plane;
};

he3d.primatives.sphere=function(s){
	if(!s)s={};
	var opts={
		color:[1.0,0.0,1.0,1.0],
		latBands:30,
		longBands:30,
		radius:1
	};
	for(var a in s){opts[a]=s[a];}

	var sphere={};
	
	var verts=new Array();
	var normals=new Array();
	var texcoords=new Array();
	var colors=new Array();
	var indices=new Array();

	for(var latNumber=0;latNumber<=opts.latBands;latNumber++){
		var theta=latNumber*Math.PI/opts.latBands;
		var sinTheta=Math.sin(theta);
		var cosTheta=Math.cos(theta);
		
		for(var longNumber=0;longNumber<=opts.longBands;longNumber++){
			var phi=longNumber*2*Math.PI/opts.longBands;
			var sinPhi=Math.sin(phi);
			var cosPhi=Math.cos(phi);
			
			var x=cosPhi*sinTheta;
			var y=cosTheta;
			var z=sinPhi*sinTheta;
			var u=1-(longNumber/opts.longBands);
			var v=latNumber/opts.latBands;
			
			verts.push(opts.radius*x);
			verts.push(opts.radius*y);
			verts.push(opts.radius*z);
			normals.push(x);
			normals.push(y);
			normals.push(z);
			texcoords.push(u);
			texcoords.push(v);
			colors.push(opts.color[0]);
			colors.push(opts.color[1]);
			colors.push(opts.color[2]);
			colors.push(opts.color[3]);
		}
	}
 
	for(var latNumber=0;latNumber<opts.latBands;latNumber++){
		for(var longNumber=0;longNumber<opts.longBands;longNumber++){
			var first=(latNumber*(opts.longBands+1))+longNumber;
			var second=first+opts.longBands+1;
			indices.push(first);
			indices.push(second);
			indices.push(first+1);
			
			indices.push(second);
			indices.push(second+1);
			indices.push(first+1);
		}
	}

	sphere.radius=opts.radius;
	
	var data=he3d.tools.interleaveFloat32Arrays([3,3,4,2],[verts,normals,colors,texcoords]);
	sphere.buf_data=he3d.gl.createBuffer();
	he3d.gl.bindBuffer(he3d.gl.ARRAY_BUFFER,sphere.buf_data);
	he3d.gl.bufferData(he3d.gl.ARRAY_BUFFER,data,he3d.gl.STATIC_DRAW);

	sphere.buf_indices=he3d.gl.createBuffer();
	sphere.indices=indices.length;
	he3d.gl.bindBuffer(he3d.gl.ELEMENT_ARRAY_BUFFER,sphere.buf_indices);
	he3d.gl.bufferData(he3d.gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),he3d.gl.STATIC_DRAW);

	if(he3d.primatives.debug){
		he3d.log("DEBUG","Sphere Vertices:",verts.length/3);
		he3d.log("DEBUG","Sphere Normals:",normals.length/3);
		he3d.log("DEBUG","Sphere Colors:",colors.length/4);
		he3d.log("DEBUG","Sphere TexCoords:",texcoords.length/2);
		he3d.log("DEBUG","Sphere Triangles:",sphere.indices/3);
		he3d.log("DEBUG","Sphere Radius:",sphere.radius);
		he3d.log("DEBUG","Sphere Created",'');
	}

	sphere.loaded=true;
	sphere.rendertype=he3d.gl.TRIANGLES;
	return sphere;
};
