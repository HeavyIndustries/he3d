//
// gBuffer Functions
//

//he3d.log('notice','Include Loaded...','gBuffer');

he3d.gBuffer = function(s) {
	if (!s) s = {};

	he3d.r.getGLExt('OES_texture_float');
	if (he3d.r.hasGLExt('OES_texture_float_linear'))
		he3d.r.getGLExt('OES_texture_float_linear');

	if (!he3d.r.hasGLExt('EXT_draw_buffers')) {
		he3d.log("FATAL", "Missing EXT_draw_buffers Extension");
		return;
	}

	this.ext = he3d.r.getGLExt('EXT_draw_buffers');
	this.extDepth = he3d.r.getGLExt('WEBGL_depth_texture');
	this.size = [he3d.canvas.width, he3d.canvas.height];
	this.buffers = [
		this.ext.COLOR_ATTACHMENT0_EXT, // Normal
		this.ext.COLOR_ATTACHMENT1_EXT, // Diffuse
		he3d.gl.NONE
	];
	this.textures = [];

	// Overload settings
	for (var a in s) { this[a] = s[a]; }

	this.init();
	return this;
};

he3d.gBuffer.prototype.init = function() {
	this.fbo = he3d.gl.createFramebuffer();
	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER, this.fbo);

	// Colour Attachments
	this.textures[0] = he3d.t.load({
		filter:	{ min: he3d.gl.NEAREST, mag: he3d.gl.NEAREST },
		height:	this.size[1],
		image: 	null,
		name:	'gBuf::Normals',
		type:	'raw',
		stype:	he3d.gl.FLOAT,
		width:	this.size[0]
	});
	he3d.gl.framebufferTexture2D(he3d.gl.FRAMEBUFFER, this.ext.COLOR_ATTACHMENT0_EXT,
		he3d.gl.TEXTURE_2D, he3d.t.textures[this.textures[0]].texture, 0);

	this.textures[1] = he3d.t.load({
		filter:	{ min: he3d.gl.NEAREST, mag: he3d.gl.NEAREST },
		height:	this.size[1],
		image: 	null,
		name:	'gBuf::Diffuse',
		type:	'raw',
		width:	this.size[0]
	});
	he3d.gl.framebufferTexture2D(he3d.gl.FRAMEBUFFER, this.ext.COLOR_ATTACHMENT1_EXT,
		he3d.gl.TEXTURE_2D, he3d.t.textures[this.textures[1]].texture, 0);

	// Depth + Stencil
	this.textures[2] = he3d.t.load({
		filter:	{ min: he3d.gl.NEAREST, mag: he3d.gl.NEAREST },
		format: 'depthstencil',
		height:	this.size[1],
		image: 	null,
		name:	'gBuf::DepthStencil',
		type:	'raw',
		stype:	this.extDepth.UNSIGNED_INT_24_8_WEBGL,
		width:	this.size[0]
	});
	he3d.gl.framebufferTexture2D(he3d.gl.FRAMEBUFFER, he3d.gl.DEPTH_STENCIL_ATTACHMENT,
		he3d.gl.TEXTURE_2D, he3d.t.textures[this.textures[2]].texture, 0);

	// Output blending texture
	this.textures[3] = he3d.t.load({
		filter:	{ min: he3d.gl.NEAREST, mag: he3d.gl.NEAREST },
		height:	this.size[1],
		image: 	null,
		name:	'gBuf::Output',
		type:	'raw',
		width:	this.size[0]
	});
	he3d.gl.framebufferTexture2D(he3d.gl.FRAMEBUFFER, this.ext.COLOR_ATTACHMENT2_EXT,
		he3d.gl.TEXTURE_2D, he3d.t.textures[this.textures[3]].texture, 0);

	// All good?
	var fbstatus = he3d.gl.checkFramebufferStatus(he3d.gl.FRAMEBUFFER);
	if (fbstatus !== he3d.gl.FRAMEBUFFER_COMPLETE)
		he3d.log("FATAL", "Failed to create Framebuffer", he3d.r.getGLErrorString(fbstatus));

	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER, null);
	return this;
};

he3d.gBuffer.prototype.resize = function() {
	this.size[0] = he3d.canvas.width;
	this.size[1] = he3d.canvas.height;

	for (var t = 0; t < this.textures.length; t++) {
		he3d.t.textures[this.textures[t]].height = this.size[1];
		he3d.t.textures[this.textures[t]].width = this.size[0];
		he3d.t.update(this.textures[t]);
	}
};

he3d.gBuffer.prototype.write = function() {
	if (he3d.r.resizeEvent)
		this.resize();

	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER, this.fbo);
    this.ext.drawBuffersEXT(this.buffers);

    he3d.gl.viewport(0, 0, this.size[0], this.size[1]);
	he3d.gl.clearStencil(0);
	he3d.gl.clearColor(0.0, 0.0, 0.0, 0.0);
	he3d.gl.clear(he3d.gl.COLOR_BUFFER_BIT | he3d.gl.DEPTH_BUFFER_BIT | he3d.gl.STENCIL_BUFFER_BIT);

	he3d.gl.enable(he3d.gl.STENCIL_TEST);
	he3d.gl.stencilFunc(he3d.gl.ALWAYS, 0x1, 0x1);
	he3d.gl.stencilOp(he3d.gl.KEEP, he3d.gl.KEEP, he3d.gl.REPLACE);
};

he3d.gBuffer.prototype.writeBlend = function() {
	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER, this.fbo);
    this.ext.drawBuffersEXT([he3d.gl.NONE, he3d.gl.NONE, this.ext.COLOR_ATTACHMENT2_EXT]);

    he3d.gl.viewport(0, 0, this.size[0], this.size[1]);
	he3d.gl.clearColor(0.0, 0.0, 0.0, 0.0);
	he3d.gl.clear(he3d.gl.COLOR_BUFFER_BIT);

	he3d.gl.enable(he3d.gl.STENCIL_TEST);
	he3d.gl.stencilFunc(he3d.gl.EQUAL, 0x1, 0x1);
	he3d.gl.stencilOp(he3d.gl.KEEP, he3d.gl.KEEP, he3d.gl.KEEP);

	he3d.gl.depthMask(false);
};

he3d.gBuffer.prototype.close = function() {
    this.ext.drawBuffersEXT([this.ext.COLOR_ATTACHMENT0_EXT]);
    he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER, null);

	he3d.gl.disable(he3d.gl.STENCIL_TEST);

	he3d.gl.enable(he3d.gl.DEPTH_TEST);
	he3d.gl.depthMask(true);
};
