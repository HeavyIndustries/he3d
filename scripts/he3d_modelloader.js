//
// Model Loader
//
he3d.log('notice','Include Loaded...','Model Loader');
he3d.modelLoader={
	debug: false,
	path: 'models/'
};

he3d.modelLoader.load=function(newmodel){
	var file=he3d.game.path+he3d.modelLoader.path+newmodel.filename;
	var fileType=file.split('.');

	he3d.log('NOTICE','Requesting Model File:',file);
	newmodel.loaded=false;
	if(!newmodel.bbtype)	newmodel.bbtype='none';
	if(!newmodel.diFormat)	newmodel.diFormat='detect';
	if(!newmodel.rotate)	newmodel.rotate=[0.0,0.0,0.0,0.0];
	if(!newmodel.scale)		newmodel.scale=[1.0,1.0,1.0];
	if(!newmodel.translate)	newmodel.translate=[0.0,0.0,0.0];

	// Load models's in worker thread
	var ext=fileType[fileType.length-1].toLowerCase();
	switch(ext){
		case 'obj':
		case 'md2':
			var wwml=new Worker(he3d.path+"he3d_modelloader_ww.js");
			wwml.onmessage=he3d.modelLoader.progress;
			wwml.onerror=function(e){
				he3d.log('FATAL','Model ('+newmodel.filename+') Loader Worker Error: '
					+e.message+" ("+e.filename+":"+e.lineno+")");
			};
			wwml.model=newmodel;
			wwml.postMessage({
				'debug':	he3d.modelLoader.debug,
				'path':		he3d.game.path+he3d.modelLoader.path,
				'filename':	newmodel.filename,
				'bbtype':	newmodel.bbtype,
				'diFormat':	newmodel.diFormat,
				'rotate':	newmodel.rotate,
				'translate':newmodel.translate,
				'scale':	newmodel.scale
			});
			break;

		case 'xml':
			var mxhr=new XMLHttpRequest();
			mxhr.open('GET',file);
			mxhr.addEventListener('error',function(){
				he3d.log('FATAL','Failed to retrieve Model:',file);
			},false);
			mxhr.addEventListener('load',function(){
				if(mxhr.status!=200){
					he3d.log('FATAL','Failed to retrieve Model:',
						file+" (Http Status: "+mxhr.status+")");
					return;
				}
				he3d.modelLoader.compileXMLModel(newmodel,mxhr.responseXML);
			},false);
			mxhr.send();
			break;

		default:
			he3d.log("WARNING",'Unknown model file type',ext);
			break;
	}
};

//
// Web Worker Loader Progress ----------------------------------------------------------------------
//
he3d.modelLoader.progress=function(e){
	if(e.data.logmsg&&e.data.loglabel&&e.data.loglevel){
		he3d.log(e.data.loglevel,e.data.loglabel,e.data.logmsg);
		return;
	}else if(e.data.logmsg&&e.data.loglevel){
		he3d.log(e.data.loglevel,e.data.logmsg);
		return;
	}else if(e.data.logmsg){
		he3d.log(e.data.logmsg);
		return;
	}

	if((!e.data.data||!e.data.data.length)&&
		(!e.data.frames||!e.data.frames.length)&&
		(!e.data.animations)){
		he3d.log('WARNING','Worker "successfully" returned no data for ',this.model.filename);
		return;
	}

	if(e.data.texture){
		this.model.texture=he3d.t.load({
			filename:e.data.texture.replace(".pcx",".jpg"),
			flip: false,
			type:'image'
		});
	}

	if(e.data.verts)
		this.model.verts=e.data.verts;

	// Animation framed models
	if(e.data.animations){
		for(var a=0;a<e.data.animations.length;a++){
			var aid=this.model.animations.push({
				name:e.data.animations[a].name,
				frames:e.data.animations[a].data.length,
				buf_data:new Array(e.data.animations[a].data.length)
			});
			for(var f=0;f<e.data.animations[a].data.length;f++){
				this.model.animations[aid-1].buf_data[f]=he3d.gl.createBuffer();
				he3d.gl.bindBuffer(he3d.gl.ARRAY_BUFFER,this.model.animations[aid-1].buf_data[f]);
				he3d.gl.bufferData(he3d.gl.ARRAY_BUFFER,
					new Float32Array(e.data.animations[a].data[f]),he3d.gl.STATIC_DRAW);
			}
		}

	// Multiframe model
	}else if(e.data.frames){
		this.model.buf_data=new Array(e.data.frames.length);
		for(var f=0;f<e.data.frames.length;f++){
			this.model.buf_data[f]=he3d.gl.createBuffer();
			he3d.gl.bindBuffer(he3d.gl.ARRAY_BUFFER,this.model.buf_data[f]);
			he3d.gl.bufferData(he3d.gl.ARRAY_BUFFER,
				new Float32Array(e.data.frames[f]),he3d.gl.STATIC_DRAW);
		}
		this.model.animation.frames=e.data.frames.length;

	// Single Frame
	} else {
		this.model.buf_data=he3d.gl.createBuffer();
		he3d.gl.bindBuffer(he3d.gl.ARRAY_BUFFER,this.model.buf_data);
		he3d.gl.bufferData(he3d.gl.ARRAY_BUFFER,new Float32Array(e.data.data),he3d.gl.STATIC_DRAW);
	}

	this.model.buf_indices=he3d.gl.createBuffer();
	this.model.indices=e.data.indices.length;
	he3d.gl.bindBuffer(he3d.gl.ELEMENT_ARRAY_BUFFER,this.model.buf_indices);
	he3d.gl.bufferData(he3d.gl.ELEMENT_ARRAY_BUFFER,
		new Uint16Array(e.data.indices),he3d.gl.STATIC_DRAW);

	if(e.data.bbox){
		this.model.bbox=e.data.bbox;
		if(e.data.bbox.type){
			switch(e.data.bbox.type){
				case 'box':
					this.model.bbox_vbo=he3d.primatives.bbox(this.model.bbox);
					break;
				case 'sphere':
					this.model.bbox_vbo=he3d.primatives.sphere({
						radius:Math.abs(this.model.bbox.y.max-this.model.bbox.y.min),
						latBands:10,
						longBands:10,
						color:[1.0,0.0,0.0,1.0]
					});
					break;
			}
		}
	}
	this.model.diFormat='vnct';
	if(e.data.diFormat)this.model.diFormat=e.data.diFormat;
	if(e.data.buf_offsets)this.model.buf_offsets=e.data.buf_offsets;
	if(e.data.buf_sizes)this.model.buf_sizes=e.data.buf_sizes;
	if(e.data.buf_size)this.model.buf_size=e.data.buf_size;
	if(e.data.indices_raw)this.model.indices_raw=e.data.indices_raw;
	if(e.data.tags)this.model.tags=e.data.tags;

	this.model.loaded=true;
};

//
// XML Model ---------------------------------------------------------------------------------------
//
he3d.modelLoader.compileXMLModel=function(model,xml){
	// Validate file
	if(!xml){
		he3d.log('FATAL','Invalid Model File: '+model.filename,'No xml found');
		return false;
	}
	if(xml.getElementsByTagName('model')[0]==undefined){
		he3d.log('FATAL','Invalid Model File: '+model.filename,'No model node');
		return false;
	}

	// Grab the assets
	var verts=he3d.modelLoader.getXMLNode(xml,'verts');
	if(verts.length<1){
		he3d.log('FATAL','Invalid Model File: '+model.filename,'No verts found');
		return false;
	}
	var normals=he3d.modelLoader.getXMLNode(xml,'normals');
	if(normals.length<1){
		he3d.log('NOTICE','Model File: '+model.filename+' contains no normals','');
	}
	var colors=he3d.modelLoader.getXMLNode(xml,'colors');
	if(colors.length<1){
		he3d.log('NOTICE','Model File: '+model.filename+' contains no colors','');
	}
	var texcoords=he3d.modelLoader.getXMLNode(xml,'texcoords');
	if(texcoords.length<1){
		he3d.log('NOTICE','Model File: '+model.filename+' contains no texcoords','');
	}
	var indices=he3d.modelLoader.getXMLNode(xml,'indices');
	if(indices.length<1){
		he3d.log('FATAL','Invalid Model File: '+model.filename,'No indices found');
		return false;
	}

	// Process Assets
	verts=verts.split(',');
	var tverts=verts.length;
	var height=0;
	for(var v=0;v<tverts;v+=3)
		if(verts[v-1]>height)
			height=verts[v-1];

	if(normals.length>1)
		normals=normals.split(',');
	else
		normals=he3d.tools.createNormalsFromVerts(verts);

	if(colors.length>1){
		colors=colors.split(',');
	} else {
		colors=[];
		for(var v=0;v<tverts;v++)
			colors.push(1.0,0.0,1.0,1.0);
	}

	if(texcoords.length>1){
		texcoords=texcoords.split(',');
	} else {
		texcoords=[];
		for(var v=0;v<tverts;v+=18){
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

	indices=indices.split(',');

	var data=he3d.tools.interleaveFloat32Arrays([3,3,4,2],[verts,normals,colors,texcoords]);
	model.buf_data=he3d.gl.createBuffer();
	he3d.gl.bindBuffer(he3d.gl.ARRAY_BUFFER,model.buf_data);
	he3d.gl.bufferData(he3d.gl.ARRAY_BUFFER,data,he3d.gl.STATIC_DRAW);

	model.buf_indices=he3d.gl.createBuffer();
	model.indices=indices.length;
	he3d.gl.bindBuffer(he3d.gl.ELEMENT_ARRAY_BUFFER,model.buf_indices);
	he3d.gl.bufferData(he3d.gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),he3d.gl.STATIC_DRAW);

	model.height=height;

	if(he3d.modelLoader.debug){
		he3d.log("DEBUG","Model Vertices:",verts.length/3);
		he3d.log("DEBUG","Model Normals:",normals.length/3);
		he3d.log("DEBUG","Model Colors:",colors.length/4);
		he3d.log("DEBUG","Model TexCoords:",texcoords.length/2);
		he3d.log("DEBUG","Model Triangles:",model.indices/3);
		he3d.log("DEBUG","Model Height:",height);
		he3d.log("DEBUG","Model Created",model.filename);
	}

	model.loaded=true;
};

he3d.modelLoader.getXMLNode=function(data,node){
	if(data.getElementsByTagName(node)[0]==undefined)
		return '';

	return data.getElementsByTagName(node)[0].childNodes[0].nodeValue
		.replace(/\t/g,'').replace(/\s/g,'');
};
