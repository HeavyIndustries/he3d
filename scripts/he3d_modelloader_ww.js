//
// Model Loader Web Worker
//
importScripts('he3d_tools.js');
importScripts('he3d_math.js');
importScripts('lib/jdataview.js');
he3d.modelLoader={};
he3d.log=function(){
	switch(arguments.length){
		case 3:
			postMessage({
				'loglevel':arguments[0],
				'loglabel':arguments[1],
				'logmsg':arguments[2]
			});
			break;
		case 2:
			postMessage({
				'loglevel':arguments[0],
				'logmsg':arguments[1]
			});
			break;
		default:
		case 1:
			postMessage({
				'logmsg':arguments[0]
			});
			break;
	}
};

//
// Load new model type
//
onmessage=function(e) {
	he3d.modelLoader.path='../'+e.data.path;
	he3d.modelLoader.debug=e.data.debug;
	e.data.frames=[];
	e.data.frameCount=0;
	
	// Multiple File Model
	if(e.data.filename.indexOf(',')>0){
		var files=e.data.filename.split(',');
		he3d.log("NOTICE","MultiModel Detected: ",JSON.stringify(files));
		e.data.diFormat='interleaveframes';
		e.data.frameCount=files.length;
		for(var m=0;m<files.length;m++){
			e.data.filename=files[m];
			he3d.modelLoader.getFile(e);
		}
		return;
	}

	// Single File Model
	he3d.modelLoader.getFile(e);
};

he3d.modelLoader.getFile=function(e){
	var file=he3d.modelLoader.path+e.data.filename;
	var filename=e.data.filename;
	var mxhr=new XMLHttpRequest();
	mxhr.open('GET',file);

	var fileType=file.split('.');
	if(fileType[fileType.length-1].toLowerCase()=='md2')	// Binary File Type
		mxhr.responseType="arraybuffer";
		
	mxhr.addEventListener('error',function(){
		he3d.log('FATAL','Failed to retrieve Model:',file);
	},false);
	mxhr.addEventListener('load',function(){
		if(mxhr.status!=200){
			he3d.log('FATAL','Failed to retrieve Model:',file+" (Http Status: "+mxhr.status+")");
			return;
		}
		var fileType=file.split('.');
		switch(fileType[fileType.length-1].toLowerCase()){
			case 'md2':
				he3d.modelLoader.md2.compile(e.data.filename,
					mxhr.response,e.data.bbtype,e.data.diFormat,e.data.scale);
				break;
			case 'obj':
				//Get material file
				var mtlfile=he3d.modelLoader.path+filename.replace(".obj",'.mtl');
				var obj=mxhr.responseText;
				he3d.log('NOTICE','Requesting Material File:',mtlfile);
				var mtlxhr=new XMLHttpRequest();
				mtlxhr.open('GET',mtlfile);
				mtlxhr.addEventListener('error',function(){
					he3d.log('FATAL','Failed to retrieve Material:',mtlfile);
				},false);
				mtlxhr.addEventListener('load',function(){
					he3d.modelLoader.obj.compile(filename,obj,
						mtlxhr.responseText,e.data.bbtype,e.data.diFormat,
						e.data.frameCount,e.data.frames);
				});
				mtlxhr.send();
				break;
			default:
				he3d.log("WARNING",'Unknown model file type',
					fileType[fileType.length-1].toLowerCase());
				break;
		}
	},false);
	mxhr.send();
};

//
// MD2 Model ---------------------------------------------------------------------------------------
//
he3d.modelLoader.md2={};
he3d.modelLoader.md2.getHeader=function(md2,view){
	view.seek(0);
	md2.header={
		id:			view.getString(4),
		version:	view.getUint32(),
		texwidth:	view.getUint32(),
		texheight:	view.getUint32(),
		framesize:	view.getUint32(),
		ntextures:	view.getUint32(),
		nvertices:	view.getUint32(),
		ntexcoords:	view.getUint32(),
		nfaces:		view.getUint32(),
		nglcommands:view.getUint32(),
		nframes:	view.getUint32(),
		otextures:	view.getUint32(),
		otexcoords:	view.getUint32(),
		ofaces:		view.getUint32(),
		oframes:	view.getUint32(),
		oglcommands:view.getUint32(),
		oeof:		view.getUint32()
	};

	if(he3d.modelLoader.debug)
		he3d.log("NOTICE","Header:","id : "+md2.header.id+
			" / Version : "+md2.header.version+
			" / Frame Count : "+md2.header.nframes+
			" / Frame Size : "+md2.header.framesize);
	if(md2.header.id!="IDP2"||md2.header.version!=8)
		he3d.log("ERROR","Invalid md2 file");
	if(he3d.modelLoader.debug)
		he3d.log("NOTICE","Texture Size :",md2.header.texwidth+"x"+md2.header.texheight);
};
he3d.modelLoader.md2.getTextures=function(md2,view){
	if(!md2.header.ntextures){
		if(he3d.modelLoader.debug)
			he3d.log("NOTICE","No Textures to load");
		return;
	}
	view.seek(md2.header.otextures);
	md2.textures=new Array(md2.header.ntextures);
	for(var t=0;t<md2.header.ntextures;t++){
		md2.textures[t]=view.getString(64).replace(/\u0000/g,'');
		if(he3d.modelLoader.debug)
			he3d.log("NOTICE","Found Texture:",md2.textures[t]);
	}
	if(he3d.modelLoader.debug)
		he3d.log("NOTICE","Total Textures:",md2.header.ntextures);
};
he3d.modelLoader.md2.getTextureCoords=function(md2,view){
	view.seek(md2.header.otexcoords);
	md2.texturecoords=new Array(md2.header.ntexcoords);
	for(var t=0;t<md2.header.ntexcoords;t++){
		md2.texturecoords[t]=new Int16Array([view.getInt16(),view.getInt16()]);
	}
	if(he3d.modelLoader.debug)
		he3d.log("NOTICE","Total TexCoords:",md2.header.nframes);
};
he3d.modelLoader.md2.getFaces=function(md2,view){
	view.seek(md2.header.ofaces);
	md2.faces=new Array(md2.header.nfaces);
	for(var f=0;f<md2.header.nfaces;f++){
		md2.faces[f]={
			idx:new Int16Array([view.getInt16(),view.getInt16(),view.getInt16()]),
			uv:new Int16Array([view.getInt16(),view.getInt16(),view.getInt16()])
		};
	}
	if(he3d.modelLoader.debug)
		he3d.log("NOTICE","Total Faces:",md2.header.nfaces);
};
he3d.modelLoader.md2.getFrames=function(md2,view,scale){
	view.seek(md2.header.oframes);
	md2.frames=new Array(md2.header.nframes);
	for(var f=0;f<md2.header.nframes;f++){
		md2.frames[f]={
			scale:new Float32Array([view.getFloat32(),view.getFloat32(),view.getFloat32()]),
			translate:new Float32Array([view.getFloat32(),view.getFloat32(),view.getFloat32()]),
			name:view.getString(16).replace(/\u0000/g,''),
			normals:new Uint8Array(md2.header.nvertices),
			vertices:new Array(md2.header.nvertices)
		};
		var vi=0;
		for(var v=0;v<md2.header.nvertices;v++){
			var x=((scale[0]*md2.frames[f].scale[0])*view.getUint8())+
				(scale[0]*md2.frames[f].translate[0]);
			var y=((scale[1]*md2.frames[f].scale[1])*view.getUint8())+
				(scale[1]*md2.frames[f].translate[1]);
			var z=((scale[2]*md2.frames[f].scale[2])*view.getUint8())+
				(scale[2]*md2.frames[f].translate[2]);
			md2.frames[f].vertices[v]=new Float32Array([x,z,y]);
			md2.frames[f].normals[v]=view.getUint8();
		}
		if(he3d.modelLoader.debug){
			he3d.log("NOTICE","Found Frame "+f+":",md2.frames[f].name);
			he3d.log("NOTICE","Frame "+f+" Scale:",JSON.stringify(md2.frames[f].scale));
			he3d.log("NOTICE","Frame "+f+" Translate:",JSON.stringify(md2.frames[f].translate));
		}
	}
	if(he3d.modelLoader.debug){
		he3d.log("NOTICE","Total Frames:",md2.header.nframes+" (Size: "+
			((view.tell()-md2.header.oframes)/md2.header.nframes)+")");
	}
};
he3d.modelLoader.md2.getGLCmds=function(md2,view){
	view.seek(md2.header.oglcommands);
	md2.glcmds=new Array(md2.header.nglcommands);
	for(var c=0;c<md2.header.nglcommands;c++){
		md2.glcmds[c]={
			mode:view.getUint8(),
			idx:[]
		};
		var nv=view.getUint8();
		for(var i=0;i<nv-1;i+=3){
			md2.glcmds[c].idx.push(view.getUint8()); // s
			md2.glcmds[c].idx.push(view.getUint8()); // t
			md2.glcmds[c].idx.push(view.getUint8()); // v idx
		}
	}
	if(he3d.modelLoader.debug)
		he3d.log("NOTICE","Total GL Commands:",md2.header.nglcommands);
};
he3d.modelLoader.md2.compile=function(filename,data,bbt,diFormat,scale){
	var md2={};
	var view=new jDataView(data);

	if(!scale)
		scale=[1.0,1.0,1.0];
	else if(typeof(scale)!='array'&&!isNaN(scale))
		scale=[scale,scale,scale];
	
	he3d.modelLoader.md2.getHeader(md2,view);
	he3d.modelLoader.md2.getTextures(md2,view);
	he3d.modelLoader.md2.getTextureCoords(md2,view);
	he3d.modelLoader.md2.getFaces(md2,view);
	he3d.modelLoader.md2.getFrames(md2,view,scale);

	var frames=new Array(md2.header.nframes);
	var fstart=0;
	var acount=0;
	var lfname='';
	var animations=[];
	for(var frame=0;frame<md2.header.nframes;frame++){
		var verts=[];
		var nverts=[];
		var normals=[];
		var colors=[];
		var indices=[];
		var texcoords=[];

		var fname=md2.frames[frame].name.match(/^\D*(?=\d)/);
		if(fname[0]!=lfname){
			acount=animations.push({name:fname[0],data:[]});
			lfname=fname[0];
			fstart=frame;
		}

		var nframe=frame+1;
		if(nframe>=md2.header.nframes){
			nframe=fstart;
		}else{
			var nfname=md2.frames[nframe].name.match(/^\D*(?=\d)/);
			if(nfname[0]!=fname)
				nframe=fstart;
		}
			
		for(var f=0;f<md2.header.nfaces;f++){
			for(var v=0;v<3;v++){
				verts.push(
					parseFloat(md2.frames[frame].vertices[md2.faces[f].idx[v]][0]),
					parseFloat(md2.frames[frame].vertices[md2.faces[f].idx[v]][1]),
					parseFloat(md2.frames[frame].vertices[md2.faces[f].idx[v]][2])
				);
				nverts.push(
					parseFloat(md2.frames[nframe].vertices[md2.faces[f].idx[v]][0]),
					parseFloat(md2.frames[nframe].vertices[md2.faces[f].idx[v]][1]),
					parseFloat(md2.frames[nframe].vertices[md2.faces[f].idx[v]][2])
				);
				texcoords.push(
					parseFloat(md2.texturecoords[md2.faces[f].uv[v]][0])/md2.header.texwidth,
					parseFloat(md2.texturecoords[md2.faces[f].uv[v]][1])/md2.header.texheight
				);
				colors.push(1.0,0.0,1.0,1.0);
				normals.push(1.0,1.0,1.0);// whatevs
			}
		}
		for(var i=0;i<verts.length/3;i+=3)
			indices.push(i,i+1,i+2);

		animations[acount-1].data.push(he3d.tools.interleaveFloat32Arrays(
			[3,3,3,4,2],[verts,nverts,normals,colors,texcoords]));
	}

	if(he3d.modelLoader.debug){
		he3d.log("DEBUG","Model Animations:",animations.length);
		he3d.log("DEBUG","Model Frames:",frames.length);
		he3d.log("DEBUG","Model Created",filename);
	}
	
	postMessage({
		'animations':animations,
		'diFormat':diFormat,
		'indices':new Uint16Array(indices),
		'texture':md2.textures[0]
//		'bbox':bbox,
//		'tags':tags
	});
};

//
// OBJ Model ---------------------------------------------------------------------------------------
//
he3d.modelLoader.obj={};
he3d.modelLoader.obj.getRawData=function(obj,objfile){
	obj.verts=[];
	obj.indices=[];
	obj.normals=[];
	obj.texcoords=[];
	var lines=objfile.split("\n");
	var mat='default';
	var name='';
	for(var l=0;l<lines.length;l++){
		var line=lines[l].split(" ");
		switch(line[0]){
			case 'f':
				var index=lines[l].substr(2).split(" ");
				var i1=index[0].split('/');
				var i2=index[1].split('/');
				var i3=index[2].split('/');
				obj.indices.push({
					mat:mat,
					name:name,
					vi:[parseInt(i1[0])-1,parseInt(i2[0])-1,parseInt(i3[0])-1],
					ti:[parseInt(i1[1])-1,parseInt(i2[1])-1,parseInt(i3[1])-1],
					ni:[parseInt(i1[2])-1,parseInt(i2[2])-1,parseInt(i3[2])-1]
				});
				break;			
			case 'usemtl':
				mat=lines[l].replace('usemtl ','').replace(/\r/g,'');
				break;
			case 'o':
				var n=lines[l].split(" ");
				name=n[n.length-1].replace(/\r/g,'');
				break;
			case 'v':
				obj.verts.push(lines[l].substr(2).replace(/\r/g,''));
				break;
			case 'vn':
				obj.normals.push(lines[l].substr(3).replace(/\r/g,''));
				break;
			case 'vt':
				obj.texcoords.push(lines[l].substr(3).replace(/\r/g,''));
				break;
		}
	}
};
he3d.modelLoader.obj.getMaterials=function(obj,mtl){
	obj.materials=[];
	var lines=mtl.split("\n");
	var trans=1.0;
	for(var l=0;l<lines.length;l++){
		var line=lines[l].split(" ");
		switch(line[0]){
			case 'd':
				trans=lines[l].split(" ")[1].replace(/\r/g,'');
				break;
			case 'newmtl':
				mat=lines[l].replace('newmtl ','').replace(/\r/g,'');
				break;
			case 'Kd':
				var color=lines[l].substr(3).replace(/\r/g,'');
				color=color.split(" ");
				color[3]=trans;
				obj.materials.push({mat:mat,color:color});
				break;
		}
	}
};
he3d.modelLoader.obj.getTags=function(obj){
	obj.tags=[];
	for(var m=obj.materials.length-1;m>-1;m--){
		if(obj.materials[m].mat.indexOf('t_')===0){
			obj.tags.push({name:obj.materials[m].mat,items:[]});
			obj.materials.splice(m,1);	// Remove from materials
		}
	}
};
he3d.modelLoader.obj.getEfx=function(obj){
	obj.efx=[];
	for(var m=obj.materials.length-1;m>-1;m--){
		if(obj.materials[m].mat.indexOf('e_')===0){
			efx.push({name:obj.materials[m].mat,eid:obj.materials[m].mat.substr(2)});
		}
	}
};
he3d.modelLoader.obj.compile=function(filename,objfile,mtlfile,bbt,diFormat,frameCount,frames){
	// Validate file
	if(!objfile){
		he3d.log('FATAL','Invalid Model File: '+filename,'No data found');
		return false;
	}
	if(!mtlfile){
		he3d.log('FATAL','Invalid Material File: '
			+filename.replace('.obj','.mtl'),'No data found');
		return false;
	}
	var obj={};
	he3d.modelLoader.obj.getRawData(obj,objfile);
	he3d.modelLoader.obj.getMaterials(obj,mtlfile);
	he3d.modelLoader.obj.getTags(obj);
	he3d.modelLoader.obj.getEfx(obj);

	// Convert duplicate verts, 1 color/vert
	var verts=[];
	var normals=[];
	var colors=[];
	var indices=[];
	var texcoords=[];
	var effects=[];
	var effect=0;
	var bbox={
		type:bbt,
		x:{min:0,max:0},
		y:{min:0,max:0},
		z:{min:0,max:0},
		width:0,
		height:0,
		depth:0
	};
	var name='';
	var color;
	for(var i=0;i<obj.indices.length;i++){
		if(name!=obj.indices[i].oname)
			name=obj.indices[i].oname;
		color=[1.0,0.0,1.0,1.0];

		// Detect t_ tagged mtl's to store as tags
		isTag=false;
		for(var t=0;t<obj.tags.length;t++){
			if(obj.tags[t].name==obj.indices[i].mat){
				isTag=true;
				var found=false;
				for(var ti=0;ti<obj.tags[t].items.length;ti++){
					if(obj.tags[t].items[ti].name==oname)
						found=true;
				}
				if(!found){
					var tpos=obj.verts[obj.indices[i].index[0]].split(" ");
					var tnormal=obj.normals[obj.indices[i].index[0]].split(" ");
					obj.tags[t].items.push({
						name:oname,
						pos:[parseFloat(tpos[0]),parseFloat(tpos[1]),parseFloat(tpos[2])],
						normal:[parseFloat(tnormal[0]),parseFloat(tnormal[1]),parseFloat(tnormal[2])]
					});
				}
			}
		}
		if(isTag)
			continue;

		for(var m=0;m<obj.materials.length;m++){
			if(obj.materials[m].mat==obj.indices[i].mat)
				color=obj.materials[m].color;
		}
		effect=0;
		for(var e=0;e<obj.efx.length;e++){
			if(obj.efx[e].name==obj.indices[i].mat)
				effect=obj.efx[e].eid;
		}

		for(var idx=0;idx<obj.indices[i].vi.length;idx++){
			var vert=obj.verts[obj.indices[i].vi[idx]].split(" ");
			verts.push(parseFloat(vert[0]),parseFloat(vert[1]),parseFloat(vert[2]));

			// Bounding Box
			if(parseFloat(vert[0])<parseFloat(bbox.x.min))bbox.x.min=parseFloat(vert[0]);
			if(parseFloat(vert[0])>parseFloat(bbox.x.max))bbox.x.max=parseFloat(vert[0]);
			if(parseFloat(vert[1])<parseFloat(bbox.y.min))bbox.y.min=parseFloat(vert[1]);
			if(parseFloat(vert[1])>parseFloat(bbox.y.max))bbox.y.max=parseFloat(vert[1]);
			if(parseFloat(vert[2])<parseFloat(bbox.z.min))bbox.z.min=parseFloat(vert[2]);
			if(parseFloat(vert[2])>parseFloat(bbox.z.max))bbox.z.max=parseFloat(vert[2]);

			if(!isNaN(obj.indices[i].ni[idx])){
				var normal=obj.normals[obj.indices[i].ni[idx]].split(" ");
				normals.push(parseFloat(normal[0]),parseFloat(normal[1]),parseFloat(normal[2]));
			}
			if(!isNaN(obj.indices[i].ti[idx])){
				var texcoord=obj.texcoords[obj.indices[i].ti[idx]].split(" ");
				texcoords.push(parseFloat(texcoord[0]),parseFloat(texcoord[1]));
			}
			colors.push(color[0],color[1],color[2],color[3]);
			effects.push(effect);
		}
	}

	// Calculate Texture Coords if non-supplied
	if(texcoords.length<1){
		for(var v=0;v<verts.length;v+=18){
			texcoords.push(
				0.0,0.0,
				1.0,0.0,
				0.0,1.0,
				0.0,1.0,
				1.0,0.0,
				1.0,1.0
			);
		}
	}

	// Calculate normals if non-supplied
	if(normals.length<1)
		normals=he3d.tools.createNormalsFromVerts(verts);

	for(var i=0;i<verts.length/3;i+=3)
		indices.push(i,i+1,i+2);

	// Bounding Box Totals
	bbox.width=Math.abs(bbox.x.min-bbox.x.max);
	bbox.height=Math.abs(bbox.y.min-bbox.y.max);
	bbox.depth=Math.abs(bbox.z.min-bbox.z.max);

	// Data Interleaving
	var data;
	if(diFormat.toLowerCase()=='detect'&&obj.efx.length)
		diFormat='vncte';
	
	switch(diFormat.toLowerCase()){
		default:
		case 'vnct':
			data=he3d.tools.interleaveFloat32Arrays(
				[3,3,4,2],[verts,normals,colors,texcoords]);
			break;
		case 'vncte':
			data=he3d.tools.interleaveFloat32Arrays(
				[3,3,4,2,1],[verts,normals,colors,texcoords,effects]);
			break;
		case 'interleaveframes':
			var frame={
				filename:filename,
				indices:indices,
				verts:verts,
				normals:normals,
				colors:colors,
				texcoords:texcoords,
				effects:effects,
				bbox:bbox,
				tags:obj.tags
			};
			var fc=frames.push(frame);
			if(fc==frameCount)
				he3d.modelLoader.obj.compileAnimation(frames);
			return
			break;
	}

	if(he3d.modelLoader.debug){
		he3d.log("DEBUG","Model Vertices:",verts.length/3);
		he3d.log("DEBUG","Model Normals:",normals.length/3);
		he3d.log("DEBUG","Model Colors:",colors.length/4);
		he3d.log("DEBUG","Model TexCoords:",texcoords.length/2);
		he3d.log("DEBUG","Model Triangles:",indices.length/3);
		he3d.log("DEBUG","Model Tags:",""+obj.tags.length);
		he3d.log("DEBUG","Tags Detected:",JSON.stringify(obj.tags));
		he3d.log("DEBUG","Model BBox:",JSON.stringify(bbox));
		he3d.log("DEBUG","Model Created",filename);
	}
	
	postMessage({
		'data':data,
		'diFormat':diFormat,
		'indices':new Uint16Array(indices),
		'bbox':bbox,
		'tags':obj.tags
	});
};

he3d.modelLoader.obj.compileAnimation=function(frames){
	var data=[];

	// Sort frames by filename
	frames.sort(function(a,b){
		var f1=a.filename.toLowerCase(),f2=b.filename.toLowerCase();
		if(f1<f2)return -1;
		if(f1>f2)return 1;
		return 0;
	});
	
	for(var frame=0;frame<frames.length;frame++){
		var nframe=frame+1;
		if(nframe>=frames.length)
			nframe=0;
		data.push(he3d.tools.interleaveFloat32Arrays([3,3,3,4,2],
			[frames[frame].verts,frames[nframe].verts,frames[frame].normals,
			frames[frame].colors,frames[frame].texcoords]));

	}
	he3d.log("NOTICE","Animated OBJ ("+frames[0].filename+
		") Loaded","Frame Count: "+frames.length);
	
	postMessage({
		'frames':data,
		'diFormat':'vvnct',
		'indices':new Uint16Array(frames[0].indices),
		'bbox':frames[0].bbox,
		'tags':frames[0].tags
	});
};
