//
// Effects Functions
//
he3d.log('notice','Include Loaded...','Effects');
he3d.fx={
	blur:{
		enabled:false,
		loaded:false,
		ran:false,
		shader:'blur',
		target:null,
		texture:{
			buf1:null,
			buf2:null
		}
	},
	postProcessing:{
		options:{fxaa:true},
		cb:null,
		loaded:false,
		target:null,
		vbo:{}
	},
	shadowMapping:{
		camera:null,
		enabled:false,
		fbo:null,
		rbo:null,
		mvpMatrix:he3d.m.mat4.identity(he3d.m.mat4.create()),
		pass:false,
		texture:null,
		size:384
	}
};

//
// Blur Pass Functions -----------------------------------------------------------------------------
//
he3d.fx.blur.init=function(){
	he3d.fx.blur.target=he3d.r.targets.FS1;
	
	// Create a blank textures
	he3d.fx.blur.texture.buf1=he3d.t.load({
		color:[0,0,0,0],
		height:he3d.fx.blur.target.height,
		name:'fx_blur_buf1',
		type:'blank',
		width:he3d.fx.blur.target.width
	});
	he3d.fx.blur.texture.buf2=he3d.t.load({
		color:[0,0,0,0],
		height:he3d.fx.blur.target.height,
		name:'fx_blur_buf2',
		type:'blank',
		width:he3d.fx.blur.target.width
	});

	// Load Shader
	he3d.s.load({
		name:'blur',
		internal:true,
		bind:he3d.fx.blur.bind
	});

	// Build Quad
	he3d.fx.blur.vbo=he3d.primatives.quad();
	he3d.fx.blur.loaded=true;

	he3d.log('NOTICE','Effects - Blur Initialised:','Textures: '+
		he3d.fx.blur.texture.buf1+","+he3d.fx.blur.texture.buf2);
};

he3d.fx.blur.bind=function(){
	he3d.gl.uniform2fv(he3d.r.curProgram.uniforms['uSize'],
		[1.0/he3d.fx.blur.target.width,1.0/he3d.fx.blur.target.height]);
	he3d.gl.uniformMatrix4fv(he3d.r.curProgram.uniforms['uPMatrix'],
		false,he3d.fx.postProcessing.view);
	he3d.r.curProgram.bound=true;
};

he3d.fx.blur.draw=function(){
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
};

he3d.fx.blur.render=function(){
	he3d.fx.blur.pass=true;
	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER,he3d.fx.blur.target.fbo);
	he3d.gl.framebufferTexture2D(he3d.gl.FRAMEBUFFER,he3d.gl.COLOR_ATTACHMENT0,
		he3d.gl.TEXTURE_2D,he3d.t.textures[he3d.fx.blur.texture.buf1].texture,0);
	he3d.gl.viewport(0,0,he3d.fx.blur.target.width,he3d.fx.blur.target.height);
	he3d.gl.clearColor(0.0,0.0,0.0,0.0);
	he3d.gl.clear(he3d.gl.COLOR_BUFFER_BIT);

	// Render Blurable renderables
	for(var r=0;r<he3d.r.rCount;r++){
		if(!he3d.r.renderables[r].blur)
			continue;
		he3d.fx.blur.doBlur=(he3d.r.renderables[r].blur?true:false);
		he3d.r.renderables[r].func(he3d.r.renderables[r].args);
	}
	
	// Horizontal Blur Pass
	he3d.r.changeProgram(he3d.fx.blur.shader);
	he3d.gl.clearColor(0.0,0.0,0.0,0.0);
	he3d.gl.framebufferTexture2D(he3d.gl.FRAMEBUFFER,he3d.gl.COLOR_ATTACHMENT0,
		he3d.gl.TEXTURE_2D,he3d.t.textures[he3d.fx.blur.texture.buf2].texture,0);
	he3d.gl.uniform1i(he3d.r.curProgram.uniforms["dir"],0);
	he3d.gl.uniform1i(he3d.r.curProgram.uniforms["texture"],he3d.fx.blur.texture.buf1);
	he3d.fx.blur.draw();

	// Vertical Pass
	he3d.gl.clearColor(0.0,0.0,0.0,0.0);
	he3d.gl.framebufferTexture2D(he3d.gl.FRAMEBUFFER,he3d.gl.COLOR_ATTACHMENT0,
		he3d.gl.TEXTURE_2D,he3d.t.textures[he3d.fx.blur.texture.buf1].texture,0);
	he3d.gl.uniform1i(he3d.r.curProgram.uniforms["dir"],1);
	he3d.gl.uniform1i(he3d.r.curProgram.uniforms["texture"],he3d.fx.blur.texture.buf2);
	he3d.fx.blur.draw();

	he3d.fx.blur.pass=false;
	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER,null);
};

he3d.fx.blur.resize=function(){
	if(!he3d.fx.blur.loaded)
		return;

	he3d.t.textures[he3d.fx.blur.texture.buf1].height=he3d.fx.blur.target.height;
	he3d.t.textures[he3d.fx.blur.texture.buf1].width=he3d.fx.blur.target.width;
	he3d.t.textures[he3d.fx.blur.texture.buf1].image=he3d.t.blankImage(
		he3d.t.textures[he3d.fx.blur.texture.buf1].format,
		he3d.t.textures[he3d.fx.blur.texture.buf1].stype,
		he3d.t.textures[he3d.fx.blur.texture.buf1].width,
		he3d.t.textures[he3d.fx.blur.texture.buf1].height,
		[0,0,0,0]);
	he3d.t.update(he3d.fx.blur.texture.buf1);

	he3d.t.textures[he3d.fx.blur.texture.buf2].height=he3d.fx.blur.target.height;
	he3d.t.textures[he3d.fx.blur.texture.buf2].width=he3d.fx.blur.target.width;
	he3d.t.textures[he3d.fx.blur.texture.buf2].image=he3d.t.blankImage(
		he3d.t.textures[he3d.fx.blur.texture.buf2].format,
		he3d.t.textures[he3d.fx.blur.texture.buf2].stype,
		he3d.t.textures[he3d.fx.blur.texture.buf2].width,
		he3d.t.textures[he3d.fx.blur.texture.buf2].height,
		[0,0,0,0]);
	he3d.t.update(he3d.fx.blur.texture.buf2);

	he3d.s.shaders[he3d.fx.blur.shader].bound=false;
};

//
// Post Processing ---------------------------------------------------------------------------------
//
he3d.fx.postProcessing.init=function(){
	he3d.fx.postProcessing.target=he3d.r.targets.FS1;

	// Create a blank texture
	he3d.fx.postProcessing.texture=he3d.t.load({
		height:he3d.fx.postProcessing.target.height,
		name:'postProcessing',
		type:'blank',
		width:he3d.fx.postProcessing.target.width
	});

	// Load Shader
	he3d.s.load({
		name: 'postprocessing',
		onLoad:function(){he3d.fx.postProcessing.loaded=true;},
		bind:he3d.fx.postProcessing.bind
	});
	he3d.fx.postProcessing.shader="postprocessing";

	// Build Quad
	he3d.fx.postProcessing.vbo=he3d.primatives.quad();
	he3d.fx.postProcessing.view=he3d.m.mat4.create();
	he3d.m.mat4.ortho(-1,1,-1,1,0.01,100,he3d.fx.postProcessing.view);
	
	he3d.log('NOTICE','Post Processing Initialised:','Texture: '+he3d.fx.postProcessing.texture);
};

he3d.fx.postProcessing.bind=function(){
	he3d.gl.uniform1i(he3d.r.curProgram.uniforms["texture"],he3d.fx.postProcessing.texture);
	he3d.gl.uniform2fv(he3d.r.curProgram.uniforms['uSize'],
		[1.0/he3d.fx.postProcessing.target.width,1.0/he3d.fx.postProcessing.target.height]);
	he3d.gl.uniformMatrix4fv(he3d.r.curProgram.uniforms['uPMatrix'],
		false,he3d.fx.postProcessing.view);

	// Disable FXAA explicitly during fades
	if(he3d.r.clearColor[3]<1.0)
		he3d.gl.uniform1i(he3d.r.curProgram.uniforms["opt_fxaa"],0);
	else
		he3d.gl.uniform1i(he3d.r.curProgram.uniforms["opt_fxaa"],
			he3d.fx.postProcessing.options.fxaa);
		
	he3d.r.curProgram.bound=true;
};

he3d.fx.postProcessing.draw=function(){
	// Wait for shader to finish compiling
	if(!he3d.fx.postProcessing.loaded)
		return;

	he3d.r.changeProgram(he3d.fx.postProcessing.shader);

	// External Postprocessing callback
	if(he3d.fx.postProcessing.cb)
		he3d.fx.postProcessing.cb();

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
};

he3d.fx.postProcessing.pass=function(){
	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER,he3d.fx.postProcessing.target.fbo);
	he3d.gl.framebufferTexture2D(he3d.gl.FRAMEBUFFER,he3d.gl.COLOR_ATTACHMENT0,
		he3d.gl.TEXTURE_2D,he3d.t.textures[he3d.fx.postProcessing.texture].texture,0);
	he3d.gl.viewport(0,0,he3d.fx.postProcessing.target.width,he3d.fx.postProcessing.target.height);
	he3d.gl.clearColor(
		he3d.r.clearColor[0],
		he3d.r.clearColor[1],
		he3d.r.clearColor[2],
		he3d.r.clearColor[3]
	);
	he3d.gl.clear(he3d.gl.COLOR_BUFFER_BIT|he3d.gl.DEPTH_BUFFER_BIT);

	for(var r=0;r<he3d.r.rCount;r++)
		he3d.r.renderables[r].func(he3d.r.renderables[r].args);

	he3d.r.rCount=0;
	
	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER,null);
};

he3d.fx.postProcessing.resize=function(){
	if(!he3d.fx.postProcessing.loaded)
		return;

	he3d.t.textures[he3d.fx.postProcessing.texture].height=he3d.canvas.height;
	he3d.t.textures[he3d.fx.postProcessing.texture].width=he3d.canvas.width;

	// Resize Texture
	he3d.t.textures[he3d.fx.postProcessing.texture].image=he3d.t.blankImage(
		he3d.t.textures[he3d.fx.postProcessing.texture].format,
		he3d.t.textures[he3d.fx.postProcessing.texture].stype,
		he3d.t.textures[he3d.fx.postProcessing.texture].width,
		he3d.t.textures[he3d.fx.postProcessing.texture].height);
	he3d.t.update(he3d.fx.postProcessing.texture);

	he3d.s.shaders[he3d.fx.postProcessing.shader].bound=false;
};

//
// Shadow Mapping ----------------------------------------------------------------------------------
//
he3d.fx.shadowMapping.init=function(){
	if(!he3d.r.hasGLExt('OES_texture_float')){
		he3d.log("WARNING","Projective Shadow Mapping Disabled",
			"Missing OES_texture_float Extension");
		he3d.fx.shadowMapping.enabled=false;
		return false;
	}

	he3d.fx.shadowMapping.camera=new he3d.camera();
	he3d.fx.shadowMapping.camera.type='square';

	he3d.gl.getExtension('OES_texture_float');
	he3d.s.load({name:'depthmap'});				// XXX this shouldn't exist any more
	he3d.fx.shadowMapping.shader="depthmap";	// depth pass using the current shader!
	
	// Create Frame Buffer
	he3d.fx.shadowMapping.fbo=he3d.gl.createFramebuffer();
	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER,he3d.fx.shadowMapping.fbo);
	he3d.fx.shadowMapping.fbo.height=he3d.fx.shadowMapping.fbo.width=he3d.fx.shadowMapping.size;

	// Create a blank texture
	he3d.fx.shadowMapping.texture=he3d.t.load({
		height:he3d.fx.shadowMapping.fbo.height,
		image: null,
		name:'shadowmap',
		type:'raw',
		stype:he3d.gl.FLOAT,
		width:he3d.fx.shadowMapping.fbo.width
	});

	// Create Render Buffer
	he3d.fx.shadowMapping.rbo=he3d.gl.createRenderbuffer();
	he3d.gl.bindRenderbuffer(he3d.gl.RENDERBUFFER,he3d.fx.shadowMapping.rbo);

	// Use stencil buffer if available
	if(he3d.r.glAttribs.stencil){
		he3d.gl.renderbufferStorage(he3d.gl.RENDERBUFFER,he3d.gl.DEPTH_STENCIL,
			he3d.fx.shadowMapping.fbo.width,he3d.fx.shadowMapping.fbo.height);
		he3d.gl.framebufferRenderbuffer(he3d.gl.FRAMEBUFFER,he3d.gl.DEPTH_STENCIL_ATTACHMENT,
			he3d.gl.RENDERBUFFER,he3d.fx.shadowMapping.rbo);
	}else{
		he3d.gl.renderbufferStorage(he3d.gl.RENDERBUFFER,he3d.gl.DEPTH_COMPONENT16,
			he3d.fx.shadowMapping.fbo.width,he3d.fx.shadowMapping.fbo.height);
		he3d.gl.framebufferRenderbuffer(he3d.gl.FRAMEBUFFER,he3d.gl.DEPTH_ATTACHMENT,
			he3d.gl.RENDERBUFFER,he3d.fx.shadowMapping.rbo);
	}

	// Bind to Texture
	he3d.gl.framebufferTexture2D(he3d.gl.FRAMEBUFFER,he3d.gl.COLOR_ATTACHMENT0,
		he3d.gl.TEXTURE_2D,he3d.t.textures[he3d.fx.shadowMapping.texture].texture,0);

	// Reset active buffers to null
	he3d.gl.bindRenderbuffer(he3d.gl.RENDERBUFFER,null);
	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER,null);

	he3d.fx.shadowMapping.enabled=true;

	he3d.log('NOTICE','Shadow Mapping Initialised:','Texture: '+he3d.fx.shadowMapping.texture
		+" Size: "+he3d.fx.shadowMapping.fbo.width+"x"+he3d.fx.shadowMapping.fbo.height);
};

he3d.fx.shadowMapping.update=function(){
	if(!he3d.fx.shadowMapping.enabled)
		return;

	he3d.fx.shadowMapping.pass=true;
	he3d.r.changeProgram(he3d.fx.shadowMapping.shader);
	he3d.gl.viewport(0,0,he3d.fx.shadowMapping.size,he3d.fx.shadowMapping.size);
	
	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER,he3d.fx.shadowMapping.fbo);
	he3d.gl.clearColor(0.0,0.0,0.0,0.0);
	he3d.gl.clear(he3d.gl.COLOR_BUFFER_BIT|he3d.gl.DEPTH_BUFFER_BIT);

	he3d.fx.shadowMapping.camera.view();
	he3d.m.mat4.set(he3d.r.mvMatrix,he3d.fx.shadowMapping.mvpMatrix);

	for(var r=0;r<he3d.r.rCount;r++){
		if(he3d.r.renderables[r].castShadow){
			he3d.r.renderables[r].func(he3d.r.renderables[r].args);
		}
	}

	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER,null);
	he3d.fx.shadowMapping.pass=false;
};
