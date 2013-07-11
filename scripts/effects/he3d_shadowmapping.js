//
// Shadow Mapping ----------------------------------------------------------------------------------
//
he3d.log('notice', 'Include Loaded...', 'Effects/Shadow Mapping');

he3d.fx.shadowMapping = {
	brokenDriverMode:false,
	camera:		null,
	depthExt:	null,
	enabled:	false,
	fbo:		null,
	rbo:		null,
	mvpMatrix:	he3d.m.mat4.identity(),
	pMatrix:	he3d.m.mat4.identity(),
	pass:		false,
	texture:	null,
	size:		384
};

he3d.fx.shadowMapping.init = function(opts) {
	if (!opts) opts = {};

	if (opts.size && !isNaN(opts.size))
		this.size = opts.size;

	var ext;
	if (opts.useDepthExt && (ext = he3d.r.hasGLExt('WEBGL_depth_texture'))) {
		this.depthExt = he3d.r.getGLExt(ext);
		if(ext == 'MOZ_WEBGL_depth_texture') {
			this.brokenDriverMode = true;
			he3d.log("WARNING", "MOZ_WEBGL_depth_texture Detected",
				"Enabling Broken Driver Mode");
		}
	} else if (!he3d.r.hasGLExt('OES_texture_float')) {
		he3d.log("WARNING", "Projective Shadow Mapping Disabled",
			"Missing OES_texture_float Extension");
		this.enabled = false;
		return false;
	} else {
		he3d.r.getGLExt('OES_texture_float');
		if(he3d.r.hasGLExt('OES_texture_float_linear'))
			he3d.r.getGLExt('OES_texture_float_linear');
	}

	this.camera = new he3d.camera({type: 'quat'});

	// Default Shader
	if (!opts.shader)
		opts.shader = 'depthmap';
	this.shader = opts.shader;
	he3d.s.load({name:this.shader});

	// Create Frame Buffer
	this.fbo = he3d.gl.createFramebuffer();
	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER, this.fbo);
	this.fbo.height = this.fbo.width = this.size;

	// Use Depth Texture
	if (this.depthExt) {
		this.texture = he3d.t.load({
			format: 'depth',
			height:	this.fbo.height,
			image: 	null,
			name:	'shadowmapEXT',
			type:	'raw',
			stype:	he3d.gl.UNSIGNED_SHORT,
			width:	this.fbo.width
		});
		he3d.gl.framebufferTexture2D(he3d.gl.FRAMEBUFFER, he3d.gl.DEPTH_ATTACHMENT,
			he3d.gl.TEXTURE_2D, he3d.t.textures[this.texture].texture, 0);

		if (this.brokenDriverMode) {
			this.texturergb = he3d.t.load({
				height:	this.fbo.height,
				image: 	null,
				name:	'shadowmapRGB',
				type:	'raw',
				width:	this.fbo.width
			});
			he3d.gl.framebufferTexture2D(he3d.gl.FRAMEBUFFER, he3d.gl.COLOR_ATTACHMENT0,
				he3d.gl.TEXTURE_2D, he3d.t.textures[this.texturergb].texture, 0);
		}

	// Use Floating Point RGBA Texture
	} else {
		this.texture = he3d.t.load({
			height:	this.fbo.height,
			image: 	null,
			name:	'shadowmapFLOAT',
			type:	'raw',
			stype:	he3d.gl.FLOAT,
			width:	this.fbo.width
		});

		// Create Render Buffer
		this.rbo = he3d.gl.createRenderbuffer();
		he3d.gl.bindRenderbuffer(he3d.gl.RENDERBUFFER, this.rbo);
		he3d.gl.renderbufferStorage(he3d.gl.RENDERBUFFER,
			he3d.gl.DEPTH_COMPONENT16, this.fbo.width, this.fbo.height);
		he3d.gl.framebufferRenderbuffer(he3d.gl.FRAMEBUFFER,
			he3d.gl.DEPTH_ATTACHMENT, he3d.gl.RENDERBUFFER, this.rbo);

		// Bind to Texture
		he3d.gl.framebufferTexture2D(he3d.gl.FRAMEBUFFER, he3d.gl.COLOR_ATTACHMENT0,
			he3d.gl.TEXTURE_2D, he3d.t.textures[this.texture].texture, 0);
		he3d.gl.bindRenderbuffer(he3d.gl.RENDERBUFFER, null);
	}

	// Check everything is ok
	if (he3d.gl.checkFramebufferStatus(he3d.gl.FRAMEBUFFER) !== he3d.gl.FRAMEBUFFER_COMPLETE) {
		if (this.depthExt) {
			opts.useDepthExt = false;
			// Try again without WEBGL_depth_texture
			he3d.fx.shadowMapping.init(opts);
			return false;
		}
		this.enabled = false;
		he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER, null);
		he3d.log("WARNING", "Projective Shadow Mapping Disabled",
			"Failed to find a suitible FrameBuffer");
		return;
	}

	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER, null);
	this.enabled = true;

	he3d.log('NOTICE', 'Shadow Mapping Initialised:', 'Texture: ' + this.texture +
		" Size: " + this.fbo.width + "x" + this.fbo.height);
};

he3d.fx.shadowMapping.update = function() {
	if (!he3d.fx.shadowMapping.enabled)
		return;

	he3d.fx.shadowMapping.pass = true;
	if (he3d.fx.shadowMapping.shader)
		he3d.r.changeProgram(he3d.fx.shadowMapping.shader);
	he3d.gl.viewport(0, 0, he3d.fx.shadowMapping.size, he3d.fx.shadowMapping.size);

	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER, he3d.fx.shadowMapping.fbo);

	if (he3d.fx.shadowMapping.depthExt) {
		he3d.gl.colorMask(false, false, false, false);
		he3d.gl.clear(he3d.gl.DEPTH_BUFFER_BIT);
	} else {
		he3d.gl.clearColor(1.0, 1.0, 1.0, 1.0);
		he3d.gl.clear(he3d.gl.COLOR_BUFFER_BIT | he3d.gl.DEPTH_BUFFER_BIT);
	}

	he3d.fx.shadowMapping.camera.view();

	he3d.gl.cullFace(he3d.gl.FRONT);

	for(var r = 0;r<he3d.r.rCount;r++)
		if(he3d.r.renderables[r].castShadow)
			he3d.r.renderables[r].func(he3d.r.renderables[r].args);

	he3d.m.mat4.set(he3d.r.mvMatrix, he3d.fx.shadowMapping.mvpMatrix);
	he3d.m.mat4.multiply(he3d.r.pMatrix, he3d.fx.shadowMapping.mvpMatrix,
		he3d.fx.shadowMapping.mvpMatrix);

	he3d.gl.cullFace(he3d.gl.BACK);

	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER, null);

	if (he3d.fx.shadowMapping.depthExt)
		he3d.gl.colorMask(true, true, true, true);

	he3d.fx.shadowMapping.pass = false;
};
