//
// Texture Manager
//
he3d.log('notice','Include Loaded...','Textures');
he3d.t={
	af:{
		ext:null,
		level:1,
		max:0
	},
	path:'textures/',
	textures:[],
	viewer:{
		id:0,
		enabled:false
	}
};

he3d.t.blankImage=function(format,stype,width,height,color){
	if(!color)color=[255.0,0.0,255.0,255.0];
	switch(format){
		case he3d.gl.RGB:
			var i=0;
			if(stype==he3d.gl.FLOAT)
				var image=new Float32Array((height*width)*3);	// XXX doesn't work?
			else
				var image=new Uint8Array((height*width)*3);	
			for(var w=0;w<width;w++){
				for(var h=0;h<height;h++){
					image[i++]=color[0];
					image[i++]=color[1];
					image[i++]=color[2];
				}
			}
			break;
		case he3d.gl.RGBA:
		default:
			var i=0;
			if(stype==he3d.gl.FLOAT)
				var image=new Float32Array((height*width)*3);	// XXX doesn't work?
			else
				var image=new Uint8Array((height*width)*4);	
			for(var w=0;w<width;w++){
				for(var h=0;h<height;h++){
					image[i++]=color[0];
					image[i++]=color[1];
					image[i++]=color[2];
					image[i++]=color[3];
				}
			}
			break;
	}
	return image;
};

he3d.t.load=function(texture){
	var store=false;
	var storeRawCubeMap=false;
	var newtexture={
		id:he3d.t.textures.length,
		flip:true,
		filter:{min:he3d.gl.LINEAR,mag:he3d.gl.LINEAR},
		loaded:false,
		mipmap:false,
		name:((texture.name!=undefined)?texture.name:''),
		type:texture.type,
		stype:((texture.stype!=undefined)?texture.stype:he3d.gl.UNSIGNED_BYTE),
		texture:he3d.gl.createTexture(),
		wrap:[false,false]
	}

	if(texture.flip!==undefined)newtexture.flip=texture.flip;
	if(texture.mipmap!==undefined)newtexture.mipmap=texture.mipmap;
	if(texture.filter){
		if(texture.filter.min!==undefined)
			newtexture.filter.min=texture.filter.min;
		if(texture.filter.mag!==undefined)
			newtexture.filter.mag=texture.filter.mag;
	}
		
	// Texture Format
	switch(texture.format){
		case 'alpha':
			newtexture.format=he3d.gl.ALPHA;
			break;
		case 'depth':
			newtexture.format=he3d.gl.DEPTH_COMPONENT;
			break;
		case 'rgb':
			newtexture.format=he3d.gl.RGB;
			break;
		case 'rgba':
		default:
			newtexture.format=he3d.gl.RGBA;
			break;
	}
			
	// New texture type
	switch(newtexture.type){
		case 'blank':
			newtexture.flip=true;
			if(texture.height!=undefined&&texture.width!=undefined){
				newtexture.height=texture.height;
				newtexture.width=texture.width;
			}else{
				he3d.log('WARNING',"New Blank Texture("+newtexture.id+") has no size defined:",
					'Creating as 256x256');
				newtexture.height=newtexture.width=256;
			}

			// Blank texture image data
			newtexture.image=he3d.t.blankImage(newtexture.format,newtexture.stype,
				newtexture.width,newtexture.height,texture.color);

			store=true;
			break;
			
		case 'canvas':
			newtexture.target=texture.target;
			newtexture.image=newtexture.target.ctx.getImageData(0,0,texture.width,texture.height);
			newtexture.height=texture.height;
			newtexture.width=texture.width;
			if(texture.name==undefined)
				newtexture.name=texture.target.canvas.getAttribute('id');

			he3d.log('NOTICE',"Requesting Texture("+newtexture.id+") from Canvas:",
				texture.target.canvas.getAttribute('id'));
			store=true;
			break;

		case 'cubemap':
			newtexture.images=new Array(6);
			newtexture.imgsloaded=0;
			for(var i=0;i<6;i++){
				newtexture.images[i]=new Image();
				newtexture.images[i].onload=function(){he3d.t.storeCubeMap(newtexture.id);};
				newtexture.images[i].src=he3d.t.path+texture.filename[i];
				he3d.log('NOTICE',"Requesting CubeMap Texture("+newtexture.id+") Image:",
					newtexture.images[i].src);
			}

			if(texture.name==undefined)
				newtexture.name=texture.filename.substring(0,texture.filename.lastIndexOf('.'));
			break;
			
		case 'image':
			newtexture.image=new Image();
			newtexture.image.onload=function(){he3d.t.store(newtexture.id);}
			newtexture.image.src=he3d.t.path+texture.filename;
			if(texture.name==undefined)
				newtexture.name=texture.filename.substring(0,texture.filename.lastIndexOf('.'));

			he3d.log('NOTICE',"Requesting Texture("+newtexture.id+") Image:",
				newtexture.image.src);
			break;

		case 'raw':
			if(texture.height==undefined||texture.width==undefined){
				he3d.log('FATAL',"New Raw Texture("+newtexture.id+") has no size defined");
				return false;
			}
			newtexture.flip=false;
			if(texture.flip!==undefined)newtexture.flip=texture.flip;
			newtexture.height=texture.height;
			newtexture.width=texture.width;
			newtexture.image=texture.image;
			store=true;
			break;

		case 'rawcubemap':
			newtexture.flip=false;
			if(texture.flip!==undefined)newtexture.flip=texture.flip;
			newtexture.height=texture.height;
			newtexture.width=texture.width;
			newtexture.top=texture.top;
			newtexture.middle=texture.middle;
			newtexture.bottom=texture.bottom;
			storeRawCubeMap=true;
			break;

		default:
			he3d.log('ERROR',"Unsupported texture type");
			return false;
			break;
	}

	// Add to texture stack
	he3d.t.textures.push(newtexture);

	if(store)
		he3d.t.store(newtexture.id);
	if(storeRawCubeMap)
		he3d.t.storeRawCubeMap(newtexture.id);
	
	return newtexture.id;
};

he3d.t.store=function(tid){
	var t=he3d.t.textures[tid];
	he3d.t.selectTextureUnit(tid);

	he3d.gl.bindTexture(he3d.gl.TEXTURE_2D,t.texture);
	he3d.gl.pixelStorei(he3d.gl.UNPACK_FLIP_Y_WEBGL,t.flip);
	if(he3d.r.glAttribs.premultipledAlpha)
		he3d.gl.pixelStorei(he3d.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,
			he3d.r.glAttribs.premultipledAlpha);
	he3d.gl.pixelStorei(he3d.gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,he3d.gl.NONE);

	if(t.type=='canvas'){
		he3d.gl.texImage2D(he3d.gl.TEXTURE_2D,0,t.format,t.format,t.stype,
			t.target.ctx.getImageData(0,0,t.width,t.height));
	}else if(t.height!=undefined&&t.width!=undefined){
		he3d.gl.texImage2D(he3d.gl.TEXTURE_2D,0,t.format,t.width,t.height,0,
			t.format,t.stype,t.image);
	}else{
		he3d.gl.texImage2D(he3d.gl.TEXTURE_2D,0,t.format,t.format,t.stype,t.image);
	}

	// Got dimensions onLoad
	if(t.image&&(t.image.height&&t.image.width)){
		t.height=t.image.height;
		t.width=t.image.width;
	}

	// Filtering
	if(t.mipmap){
		t.filter.mag=he3d.gl.LINEAR;
		t.filter.min=he3d.gl.LINEAR_MIPMAP_LINEAR;
	}
	he3d.gl.texParameteri(he3d.gl.TEXTURE_2D,he3d.gl.TEXTURE_MAG_FILTER,t.filter.mag);
	he3d.gl.texParameteri(he3d.gl.TEXTURE_2D,he3d.gl.TEXTURE_MIN_FILTER,t.filter.min);

	// Mip Mapping
	if(t.mipmap)
		he3d.gl.generateMipmap(he3d.gl.TEXTURE_2D);

	// Anisotropy Filtering
	if(he3d.t.af.ext){
		he3d.gl.texParameterf(he3d.gl.TEXTURE_2D,
			he3d.t.af.ext.TEXTURE_MAX_ANISOTROPY_EXT,he3d.t.af.level);
	}

	// Wrapping
	if(!t.wrap[0])
		he3d.gl.texParameteri(he3d.gl.TEXTURE_2D,he3d.gl.TEXTURE_WRAP_S,he3d.gl.CLAMP_TO_EDGE);
	if(!t.wrap[1])
		he3d.gl.texParameteri(he3d.gl.TEXTURE_2D,he3d.gl.TEXTURE_WRAP_T,he3d.gl.CLAMP_TO_EDGE);

	t.loaded=true;

	he3d.log('NOTICE',"Loaded Texture("+tid+"):",t.name);
};

he3d.t.storeCubeMap=function(tid){
	if(++he3d.t.textures[tid].imgsloaded!=6)
		return;

	var t=he3d.t.textures[tid];
	he3d.t.selectTextureUnit(tid);

	he3d.gl.bindTexture(he3d.gl.TEXTURE_CUBE_MAP,t.texture);
	he3d.gl.pixelStorei(he3d.gl.UNPACK_FLIP_Y_WEBGL,t.flip);
	he3d.gl.pixelStorei(he3d.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,he3d.r.glAttribs.premultipledAlpha);
	he3d.gl.pixelStorei(he3d.gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,he3d.gl.NONE);

	he3d.gl.texImage2D(he3d.gl.TEXTURE_CUBE_MAP_POSITIVE_X,0,t.format,t.format,t.stype,t.images[0]);
	he3d.gl.texImage2D(he3d.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,0,t.format,t.format,t.stype,t.images[1]);
	he3d.gl.texImage2D(he3d.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,0,t.format,t.format,t.stype,t.images[2]);
	he3d.gl.texImage2D(he3d.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,0,t.format,t.format,t.stype,t.images[3]);
	he3d.gl.texImage2D(he3d.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,0,t.format,t.format,t.stype,t.images[4]);
	he3d.gl.texImage2D(he3d.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,0,t.format,t.format,t.stype,t.images[5]);

	he3d.gl.texParameteri(he3d.gl.TEXTURE_CUBE_MAP,he3d.gl.TEXTURE_MAG_FILTER,t.filter.mag);
	he3d.gl.texParameteri(he3d.gl.TEXTURE_CUBE_MAP,he3d.gl.TEXTURE_MIN_FILTER,t.filter.min);
	if(!t.wrap[0])
		he3d.gl.texParameteri(he3d.gl.TEXTURE_CUBE_MAP,
			he3d.gl.TEXTURE_WRAP_S,he3d.gl.CLAMP_TO_EDGE);
	if(!t.wrap[1])
		he3d.gl.texParameteri(he3d.gl.TEXTURE_CUBE_MAP,
			he3d.gl.TEXTURE_WRAP_T,he3d.gl.CLAMP_TO_EDGE);

	if(he3d.t.af.ext&&he3d.t.af.max>0){
		he3d.gl.texParameterf(he3d.gl.TEXTURE_2D,
			he3d.t.af.ext.TEXTURE_MAX_ANISOTROPY_EXT,he3d.t.af.level);
	}

	t.loaded=true;

	he3d.log('NOTICE',"Loaded CubeMap Texture("+tid+"):",t.name);
};

he3d.t.storeRawCubeMap=function(tid){
	var t=he3d.t.textures[tid];
	he3d.t.selectTextureUnit(tid);

	he3d.gl.bindTexture(he3d.gl.TEXTURE_CUBE_MAP,t.texture);
	he3d.gl.pixelStorei(he3d.gl.UNPACK_FLIP_Y_WEBGL,t.flip);
	he3d.gl.pixelStorei(he3d.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,he3d.r.glAttribs.premultipledAlpha);
	he3d.gl.pixelStorei(he3d.gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,he3d.gl.NONE);

	he3d.gl.texImage2D(he3d.gl.TEXTURE_CUBE_MAP_POSITIVE_X,0,t.format,
		t.width,t.height,0,t.format,t.stype,t.middle);

	he3d.gl.texImage2D(he3d.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,0,t.format,
		t.width,t.height,0,t.format,t.stype,t.middle);

	he3d.gl.texImage2D(he3d.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,0,t.format,
		t.width,t.height,0,t.format,t.stype,t.top);

	he3d.gl.texImage2D(he3d.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,0,t.format,
		t.width,t.height,0,t.format,t.stype,t.bottom);

	he3d.gl.texImage2D(he3d.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,0,t.format,
		t.width,t.height,0,t.format,t.stype,t.middle);

	he3d.gl.texImage2D(he3d.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,0,t.format,
		t.width,t.height,0,t.format,t.stype,t.middle);

	he3d.gl.texParameteri(he3d.gl.TEXTURE_CUBE_MAP,he3d.gl.TEXTURE_MAG_FILTER,t.filter.mag);
	he3d.gl.texParameteri(he3d.gl.TEXTURE_CUBE_MAP,he3d.gl.TEXTURE_MIN_FILTER,t.filter.min);

	he3d.gl.texParameteri(he3d.gl.TEXTURE_CUBE_MAP,he3d.gl.TEXTURE_WRAP_S,he3d.gl.CLAMP_TO_EDGE);
	he3d.gl.texParameteri(he3d.gl.TEXTURE_CUBE_MAP,he3d.gl.TEXTURE_WRAP_T,he3d.gl.CLAMP_TO_EDGE);

	if(he3d.t.af.ext&&he3d.t.af.max>0){
		he3d.gl.texParameterf(he3d.gl.TEXTURE_CUBE_MAP,
			he3d.t.af.ext.TEXTURE_MAX_ANISOTROPY_EXT,he3d.t.af.level);
	}

	t.loaded=true;

	he3d.log('NOTICE',"Loaded Raw CubeMap Texture("+tid+"):",t.name);
};

he3d.t.selectTextureUnit=function(tid){
	if(tid>=he3d.r.glLimits.textures){
		he3d.log("WARNING","Unable to find texture unit ("+tid
			+") for texture:",he3d.t.textures[tid].name);
		return;
	}
	he3d.gl.activeTexture(he3d.gl.TEXTURE0+tid);
};

he3d.t.update=function(tid){
	var t=he3d.t.textures[tid];
	he3d.t.selectTextureUnit(tid);
	he3d.gl.pixelStorei(he3d.gl.UNPACK_FLIP_Y_WEBGL,t.flip);
	he3d.gl.pixelStorei(he3d.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,he3d.r.glAttribs.premultipledAlpha);
	he3d.gl.pixelStorei(he3d.gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,he3d.gl.NONE);

	if(t.type=='canvas'){
		he3d.gl.texImage2D(he3d.gl.TEXTURE_2D,0,t.format,t.format,t.stype,
			t.target.ctx.getImageData(0,0,t.width,t.height));
	}else if(t.height!=undefined&&t.width!=undefined){
		he3d.gl.texImage2D(he3d.gl.TEXTURE_2D,0,t.format,
			t.width,t.height,0,t.format,t.stype,t.image);
	}else{
		he3d.gl.texImage2D(he3d.gl.TEXTURE_2D,0,t.format,t.format,t.stype,t.image);
	}
};

//
// Extensions --------------------------------------------------------------------------------------
//
he3d.t.setFilterAnisotropic=function(level){
	if(!he3d.t.af.ext||he3d.t.af.max==0||he3d.t.af.level==level||level<0||level>he3d.t.af.max)
		return;
	he3d.t.af.level=level;
	for(var tid=0;tid<he3d.t.textures.length;tid++){
		if(!he3d.t.textures[tid].mipmap)
			continue;
		he3d.t.selectTextureUnit(tid);
		he3d.gl.texParameterf(he3d.gl.TEXTURE_2D,
			he3d.t.af.ext.TEXTURE_MAX_ANISOTROPY_EXT,he3d.t.af.level);
	}
	he3d.log("NOTICE","Renderer.Anisotropic:",level);
};

//
// Texture Viewer ----------------------------------------------------------------------------------
//
he3d.t.viewer.draw=function(){
	var height=he3d.gl.viewportHeight;
	var width=he3d.gl.viewportWidth;
	if(he3d.t.textures[he3d.t.viewer.id].height&&
		he3d.t.textures[he3d.t.viewer.id].width&&
		he3d.t.textures[he3d.t.viewer.id].height<height&&
		he3d.t.textures[he3d.t.viewer.id].width<width){
			height=he3d.t.textures[he3d.t.viewer.id].height;
			width=he3d.t.textures[he3d.t.viewer.id].width;
	}

	he3d.gl.viewport(he3d.gl.viewportWidth/2-width/2,
		he3d.gl.viewportHeight/2-height/2,width,height);
	he3d.gl.clearColor(0.0,1.0,0.0,1.0);
	he3d.gl.clear(he3d.gl.COLOR_BUFFER_BIT|he3d.gl.DEPTH_BUFFER_BIT);

	he3d.r.changeProgram('postprocessing');

	he3d.gl.enable(he3d.gl.BLEND);
	
	he3d.gl.uniform1i(he3d.r.curProgram.uniforms["texture"],he3d.t.viewer.id);
	he3d.gl.uniform1f(he3d.r.curProgram.uniforms["vignette"],0.0);
	he3d.gl.uniform1i(he3d.r.curProgram.uniforms["opt_fxaa"],0);
	he3d.gl.uniform1i(he3d.r.curProgram.uniforms["opt_blur"],0);
	he3d.gl.uniform2fv(he3d.r.curProgram.uniforms['uSize'],[1.0/width,1.0/height]);
	he3d.gl.uniformMatrix4fv(he3d.r.curProgram.uniforms['uPMatrix'],
		false,he3d.fx.postProcessing.view);

	// Object Data
	he3d.gl.bindBuffer(he3d.gl.ARRAY_BUFFER,he3d.fx.postProcessing.vbo.buf_data);

	he3d.gl.enableVertexAttribArray(he3d.r.curProgram.attributes['aPosition']);
	he3d.gl.vertexAttribPointer(he3d.r.curProgram.attributes['aPosition'],
		3,he3d.gl.FLOAT,false,48,0);

	he3d.gl.enableVertexAttribArray(he3d.r.curProgram.attributes['aTexCoord']);
	he3d.gl.vertexAttribPointer(he3d.r.curProgram.attributes['aTexCoord'],
		2,he3d.gl.FLOAT,false,48,40);

	he3d.gl.bindBuffer(he3d.gl.ELEMENT_ARRAY_BUFFER,he3d.fx.postProcessing.vbo.buf_indices);
	he3d.gl.drawElements(he3d.fx.postProcessing.vbo.rendertype,
		he3d.fx.postProcessing.vbo.indices,he3d.gl.UNSIGNED_SHORT,0);

	he3d.gl.disable(he3d.gl.BLEND);
};

he3d.t.viewer.toggle=function(state){
	if(state!=undefined){
		// Already open, must be manually setting id
		if(he3d.t.viewer.enabled==state)
			return;
		he3d.t.viewer.enabled=state;
	} else {
		he3d.t.viewer.enabled=!he3d.t.viewer.enabled;
	}
	he3d.s.shaders[he3d.fx.postProcessing.shader].bound=false;
	he3d.log('NOTICE','Texture Viewer:',(he3d.t.viewer.enabled?'Enabled':'Disabled'));
};
