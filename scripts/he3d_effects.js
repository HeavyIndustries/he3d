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
		},
		type:'guass'
	},
	postProcessing:{
		options:{fxaa:true},
		cb:null,
		loaded:false,
		target:null,
		vbo:{}
	},
	shadowMapping:{
		brokenDriverMode:false,
		camera:null,
		depthExt:null,
		enabled:false,
		fbo:null,
		rbo:null,
		mvpMatrix:he3d.m.mat4.identity(he3d.m.mat4.create()),
		pMatrix:he3d.m.mat4.identity(he3d.m.mat4.create()),
		pass:false,
		texture:null,
		size:384
	}
};

//
// Blur Pass Functions -----------------------------------------------------------------------------
//
he3d.fx.blur.init=function(type){
	he3d.fx.blur.type=type?type:'gauss';
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

	he3d.log('NOTICE','Effects - Blur ['+he3d.fx.blur.type+'] Initialised:','Textures: '+
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
	if(he3d.fx.blur.type=='box')
		he3d.gl.framebufferTexture2D(he3d.gl.FRAMEBUFFER,he3d.gl.COLOR_ATTACHMENT0,
			he3d.gl.TEXTURE_2D,he3d.t.textures[he3d.fx.blur.texture.buf2].texture,0);
	else
		he3d.gl.framebufferTexture2D(he3d.gl.FRAMEBUFFER,he3d.gl.COLOR_ATTACHMENT0,
			he3d.gl.TEXTURE_2D,he3d.t.textures[he3d.fx.blur.texture.buf1].texture,0);
	he3d.gl.viewport(0,0,he3d.fx.blur.target.width,he3d.fx.blur.target.height);
	he3d.gl.clearColor(0.0,0.0,0.0,1.0);
	he3d.gl.clear(he3d.gl.COLOR_BUFFER_BIT);

	// Render Blurable renderables
	he3d.fx.blur.ran=false;
	for(var r=0;r<he3d.r.rCount;r++){
		if(!he3d.r.renderables[r].blur)
			continue;
		he3d.r.renderables[r].func(he3d.r.renderables[r].args);
		he3d.fx.blur.ran=true;
	}

	// Don't run blur pass if there is nothing to blur
	if(!he3d.fx.blur.ran){
		he3d.fx.blur.pass=false;
		he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER,null);
		return;
	}
	he3d.r.changeProgram(he3d.fx.blur.shader);

	// 1-Pass Box Blur
	if(he3d.fx.blur.type=='box'){
		he3d.gl.uniform1i(he3d.r.curProgram.uniforms["box"],1);
		he3d.gl.framebufferTexture2D(he3d.gl.FRAMEBUFFER,he3d.gl.COLOR_ATTACHMENT0,
			he3d.gl.TEXTURE_2D,he3d.t.textures[he3d.fx.blur.texture.buf1].texture,0);
		he3d.gl.uniform1i(he3d.r.curProgram.uniforms["texture"],he3d.fx.blur.texture.buf2);
		he3d.fx.blur.draw();

	// 2-Pass Gaussian Blur
	}else{
		he3d.gl.uniform1i(he3d.r.curProgram.uniforms["box"],0);	
		// Horizontal Blur Pass
		he3d.gl.framebufferTexture2D(he3d.gl.FRAMEBUFFER,he3d.gl.COLOR_ATTACHMENT0,
			he3d.gl.TEXTURE_2D,he3d.t.textures[he3d.fx.blur.texture.buf2].texture,0);
		he3d.gl.uniform1i(he3d.r.curProgram.uniforms["dir"],0);
		he3d.gl.uniform1i(he3d.r.curProgram.uniforms["texture"],he3d.fx.blur.texture.buf1);
		he3d.fx.blur.draw();

		// Vertical Pass
		he3d.gl.framebufferTexture2D(he3d.gl.FRAMEBUFFER,he3d.gl.COLOR_ATTACHMENT0,
			he3d.gl.TEXTURE_2D,he3d.t.textures[he3d.fx.blur.texture.buf1].texture,0);
		he3d.gl.uniform1i(he3d.r.curProgram.uniforms["dir"],1);
		he3d.gl.uniform1i(he3d.r.curProgram.uniforms["texture"],he3d.fx.blur.texture.buf2);
		he3d.fx.blur.draw();
	}

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
	he3d.m.mat4.ortho(-1,1,-1,1,0.01,10,he3d.fx.postProcessing.view);
	
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
he3d.fx.shadowMapping.init=function(opts){
	if(!opts)opts={};

	if(opts.size&&!isNaN(opts.size))
		this.size=opts.size;

	var ext;
	if(opts.useDepthExt&&(ext=he3d.r.hasGLExt('WEBGL_depth_texture'))){
		this.depthExt=he3d.r.getGLExt(ext);
		if(ext=='MOZ_WEBGL_depth_texture'){
			this.brokenDriverMode=true;
			he3d.log("WARNING","MOZ_WEBGL_depth_texture Detected","Enabling Broken Driver Mode");
		}
	}else if(!he3d.r.hasGLExt('OES_texture_float')){
		he3d.log("WARNING","Projective Shadow Mapping Disabled",
			"Missing OES_texture_float Extension");
		this.enabled=false;
		return false;
	}else{
		he3d.r.getGLExt('OES_texture_float');
	}

	this.camera=new he3d.camera();
	this.camera.type='quat';

	// Default Shader
	if(!opts.shader)
		opts.shader='depthmap';
	this.shader=opts.shader;
	he3d.s.load({name:this.shader});
	
	// Create Frame Buffer
	this.fbo=he3d.gl.createFramebuffer();
	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER,this.fbo);
	this.fbo.height=this.fbo.width=this.size;

	// Use Depth Texture
	if(this.depthExt){
		this.texture=he3d.t.load({
			format: 'depth',
			height:	this.fbo.height,
			image: 	null,
			name:	'shadowmap',
			type:	'raw',
			stype:	he3d.gl.UNSIGNED_SHORT,
			width:	this.fbo.width
		});
		he3d.gl.framebufferTexture2D(he3d.gl.FRAMEBUFFER,he3d.gl.DEPTH_ATTACHMENT,
			he3d.gl.TEXTURE_2D,he3d.t.textures[this.texture].texture,0);

		if(this.brokenDriverMode){
			this.texturergb=he3d.t.load({
				height:	this.fbo.height,
				image: 	null,
				name:	'shadowmaprgb',
				type:	'raw',
				width:	this.fbo.width
			});
			he3d.gl.framebufferTexture2D(he3d.gl.FRAMEBUFFER,he3d.gl.COLOR_ATTACHMENT0,
				he3d.gl.TEXTURE_2D,he3d.t.textures[this.texturergb].texture,0);
		}
	// Use Floating Point RGBA Texture
	}else{
		this.texture=he3d.t.load({
			height:	this.fbo.height,
			image: 	null,
			name:	'shadowmap',
			type:	'raw',
			stype:	he3d.gl.FLOAT,
			width:	this.fbo.width
		});
		
		// Create Render Buffer
		this.rbo=he3d.gl.createRenderbuffer();
		he3d.gl.bindRenderbuffer(he3d.gl.RENDERBUFFER,this.rbo);
		he3d.gl.renderbufferStorage(he3d.gl.RENDERBUFFER,
			he3d.gl.DEPTH_COMPONENT16,this.fbo.width,this.fbo.height);
		he3d.gl.framebufferRenderbuffer(he3d.gl.FRAMEBUFFER,
			he3d.gl.DEPTH_ATTACHMENT,he3d.gl.RENDERBUFFER,this.rbo);

		// Bind to Texture
		he3d.gl.framebufferTexture2D(he3d.gl.FRAMEBUFFER,he3d.gl.COLOR_ATTACHMENT0,
			he3d.gl.TEXTURE_2D,he3d.t.textures[this.texture].texture,0);
		he3d.gl.bindRenderbuffer(he3d.gl.RENDERBUFFER,null);
	}

	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER,null);

	this.enabled=true;

	he3d.log('NOTICE','Shadow Mapping Initialised:','Texture: '+this.texture+
		" Size: "+this.fbo.width+"x"+this.fbo.height);
};

he3d.fx.shadowMapping.update=function(){
	if(!he3d.fx.shadowMapping.enabled)
		return;

	he3d.fx.shadowMapping.pass=true;
	he3d.r.changeProgram(he3d.fx.shadowMapping.shader);
	he3d.gl.viewport(0,0,he3d.fx.shadowMapping.size,he3d.fx.shadowMapping.size);
	
	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER,he3d.fx.shadowMapping.fbo);

	if(he3d.fx.shadowMapping.depthExt){
		he3d.gl.colorMask(false,false,false,false);
		he3d.gl.clear(he3d.gl.DEPTH_BUFFER_BIT);
	}else{
		he3d.gl.clearColor(1.0,1.0,1.0,1.0);
		he3d.gl.clear(he3d.gl.COLOR_BUFFER_BIT|he3d.gl.DEPTH_BUFFER_BIT);
	}

	he3d.fx.shadowMapping.camera.view();

	he3d.gl.cullFace(he3d.gl.FRONT);

	for(var r=0;r<he3d.r.rCount;r++)
		if(he3d.r.renderables[r].castShadow)
			he3d.r.renderables[r].func(he3d.r.renderables[r].args);

	he3d.m.mat4.set(he3d.r.mvMatrix,he3d.fx.shadowMapping.mvpMatrix);
	he3d.m.mat4.multiply(he3d.r.pMatrix,he3d.fx.shadowMapping.mvpMatrix,
		he3d.fx.shadowMapping.mvpMatrix);

	he3d.gl.cullFace(he3d.gl.BACK);

	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER,null);

	if(he3d.fx.shadowMapping.depthExt)
		he3d.gl.colorMask(true,true,true,true);
		
	he3d.fx.shadowMapping.pass=false;
};
