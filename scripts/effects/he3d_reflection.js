//
// Reflection --------------------------------------------------------------------------------------
//
he3d.log('notice', 'Include Loaded...', 'Effects/Reflection');

he3d.fx.reflection = {
	enabled:	false,
	pass:		false,
	target:		null,
	texture:	null,
	size:		[512, 512]
};

he3d.fx.reflection.init = function(size){
	// Custom Size
	if (size && size.length == 2 && !isNaN(size[0]) && !isNaN(size[1])) {
		this.texture = he3d.t.load({
			height:		size[1],
			name:		'reflection',
			type:		'blank',
			width:		size[0]
		});
		this.target = he3d.r.targets.create({
			height:		size[1],
			texture:	this.texture,
			width:		size[0]
		});

	// Use Post Processing Target/Texture
	} else {
		he3d.fx.reflection.target = he3d.r.targets.FS1;
		he3d.fx.reflection.texture = he3d.fx.postProcessing.texture;
	}

	this.size = [he3d.fx.reflection.target.width, he3d.fx.reflection.target.height];
	this.mvMatrix = he3d.m.mat4.create();
	this.reflectMat = he3d.m.mat4.identity();
	this.reflectMat[5] = -1;

	he3d.fx.reflection.enabled = true;

	he3d.log('NOTICE', 'Reflection Initialised:', 'Texture: ' + he3d.fx.reflection.texture);
};

he3d.fx.reflection.update = function(offset) {
	if (!he3d.fx.reflection.enabled)
		return;

	he3d.fx.reflection.pass = true;

	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER, he3d.fx.reflection.target.fbo);
	he3d.gl.framebufferTexture2D(he3d.gl.FRAMEBUFFER, he3d.gl.COLOR_ATTACHMENT0,
		he3d.gl.TEXTURE_2D, he3d.t.textures[he3d.fx.reflection.texture].texture, 0);

	he3d.gl.viewport(0, 0, he3d.fx.reflection.target.width, he3d.fx.reflection.target.height);
	he3d.gl.clearColor(0.0, 0.0, 0.0, 0.0);
	he3d.gl.clear(he3d.gl.COLOR_BUFFER_BIT | he3d.gl.DEPTH_BUFFER_BIT);

	he3d.gl.cullFace(he3d.gl.FRONT);

	// Copy current view matrix
	he3d.m.mat4.set(he3d.r.mvMatrix, he3d.fx.reflection.mvMatrix);
	he3d.m.mat4.multiply(he3d.r.mvMatrix, he3d.fx.reflection.reflectMat);
	he3d.m.mat4.translate(he3d.r.mvMatrix, offset);

	for (var r = 0;r<he3d.r.rCount;r++)
		if (he3d.r.renderables[r].reflect)
			he3d.r.renderables[r].func(he3d.r.renderables[r].args);

	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER, null);

	he3d.gl.cullFace(he3d.gl.BACK);

	// Restore view matrix
	he3d.m.mat4.set(he3d.fx.reflection.mvMatrix, he3d.r.mvMatrix);

	he3d.fx.reflection.pass = false;
};
