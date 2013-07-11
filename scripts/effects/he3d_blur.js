//
// Blur Pass Functions -----------------------------------------------------------------------------
//
he3d.log('notice', 'Include Loaded...', 'Effects/Blur');

he3d.fx.blur = {
	enabled:	false,
	loaded:		false,
	ran:		false,
	shader:		'blur',
	target:		null,
	texture:{
		buf1:	null,
		buf2:	null
	},
	type:		'guass'
};

he3d.fx.blur.init = function(type) {
	he3d.fx.blur.type = type || 'gauss';
	he3d.fx.blur.target = he3d.r.targets.FS1;

	// Create a blank textures
	he3d.fx.blur.texture.buf1 = he3d.t.load({
		color:	[0, 0, 0, 0],
		height:	he3d.fx.blur.target.height,
		name:	'fx_blur_buf1',
		type:	'blank',
		width:	he3d.fx.blur.target.width
	});
	he3d.fx.blur.texture.buf2 = he3d.t.load({
		color:	[0, 0, 0, 0],
		height:	he3d.fx.blur.target.height,
		name:	'fx_blur_buf2',
		type:	'blank',
		width:	he3d.fx.blur.target.width
	});

	// Load Shader
	he3d.s.load({
		name:		'blur',
		internal:	true,
		bind:		he3d.fx.blur.bind
	});

	// Build Quad
	he3d.fx.blur.loaded = true;

	he3d.log('NOTICE', 'Effects - Blur [' + he3d.fx.blur.type + '] Initialised:',
		'Textures: ' + he3d.fx.blur.texture.buf1 + "," + he3d.fx.blur.texture.buf2);
};

he3d.fx.blur.bind = function() {
	he3d.gl.uniform2fv(he3d.r.curProgram.uniforms.uSize,
		[1.0 / he3d.fx.blur.target.width, 1.0 / he3d.fx.blur.target.height]);
	he3d.gl.uniformMatrix4fv(he3d.r.curProgram.uniforms.uPMatrix,
		false, he3d.fx.postProcessing.view);

	he3d.r.curProgram.bound = true;
};

he3d.fx.blur.draw = function() {
	he3d.gl.bindBuffer(he3d.gl.ARRAY_BUFFER, he3d.fx.postProcessing.vbo.buf_data);

	he3d.gl.vertexAttribPointer(he3d.r.curProgram.attributes.aPosition,
		he3d.fx.postProcessing.vbo.buf_sizes.v, he3d.gl.FLOAT, false,
		he3d.fx.postProcessing.vbo.buf_size, he3d.fx.postProcessing.vbo.buf_offsets.v);

	he3d.gl.vertexAttribPointer(he3d.r.curProgram.attributes.aTexCoord,
		he3d.fx.postProcessing.vbo.buf_sizes.t, he3d.gl.FLOAT, false,
		he3d.fx.postProcessing.vbo.buf_size, he3d.fx.postProcessing.vbo.buf_offsets.t);

	he3d.gl.bindBuffer(he3d.gl.ELEMENT_ARRAY_BUFFER, he3d.fx.postProcessing.vbo.buf_indices);
	he3d.gl.drawElements(he3d.fx.postProcessing.vbo.rendertype,
		he3d.fx.postProcessing.vbo.indices, he3d.gl.UNSIGNED_SHORT, 0);
};

he3d.fx.blur.render = function() {
	he3d.fx.blur.pass = true;
	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER, he3d.fx.blur.target.fbo);
	if(he3d.fx.blur.type == 'box')
		he3d.gl.framebufferTexture2D(he3d.gl.FRAMEBUFFER, he3d.gl.COLOR_ATTACHMENT0,
			he3d.gl.TEXTURE_2D, he3d.t.textures[he3d.fx.blur.texture.buf2].texture, 0);
	else
		he3d.gl.framebufferTexture2D(he3d.gl.FRAMEBUFFER, he3d.gl.COLOR_ATTACHMENT0,
			he3d.gl.TEXTURE_2D,he3d.t.textures[he3d.fx.blur.texture.buf1].texture, 0);

	he3d.gl.viewport(0, 0, he3d.fx.blur.target.width, he3d.fx.blur.target.height);
	he3d.gl.clearColor(0.0, 0.0, 0.0, 1.0);
	he3d.gl.clear(he3d.gl.COLOR_BUFFER_BIT);

	// Render Blurable renderables
	he3d.fx.blur.ran = false;
	for (var r = 0; r < he3d.r.rCount; r++) {
		if (!he3d.r.renderables[r].blur)
			continue;
		he3d.r.renderables[r].func(he3d.r.renderables[r].args);
		he3d.fx.blur.ran = true;
	}

	// Don't run blur pass if there is nothing to blur
	if (!he3d.fx.blur.ran) {
		he3d.fx.blur.pass = false;
		he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER, null);
		return;
	}
	he3d.r.changeProgram(he3d.fx.blur.shader);

	// 1-Pass Box Blur
	if (he3d.fx.blur.type == 'box') {
		he3d.gl.uniform1i(he3d.r.curProgram.uniforms.box, 1);
		he3d.gl.framebufferTexture2D(he3d.gl.FRAMEBUFFER, he3d.gl.COLOR_ATTACHMENT0,
			he3d.gl.TEXTURE_2D,he3d.t.textures[he3d.fx.blur.texture.buf1].texture, 0);

		he3d.gl.activeTexture(he3d.gl.TEXTURE0);
		he3d.gl.bindTexture(he3d.gl.TEXTURE_2D,
			he3d.t.textures[he3d.fx.blur.texture.buf2].texture);
		he3d.gl.uniform1i(he3d.r.curProgram.uniforms.texture, 0);
		
		he3d.fx.blur.draw();

	// 2-Pass Gaussian Blur
	} else {
		he3d.gl.uniform1i(he3d.r.curProgram.uniforms.box, 0);
		// Horizontal Blur Pass
		he3d.gl.framebufferTexture2D(he3d.gl.FRAMEBUFFER, he3d.gl.COLOR_ATTACHMENT0,
			he3d.gl.TEXTURE_2D, he3d.t.textures[he3d.fx.blur.texture.buf2].texture, 0);
		he3d.gl.uniform1i(he3d.r.curProgram.uniforms.dir, 0);

		he3d.gl.activeTexture(he3d.gl.TEXTURE0);
		he3d.gl.bindTexture(he3d.gl.TEXTURE_2D,
			he3d.t.textures[he3d.fx.blur.texture.buf1].texture);
		he3d.gl.uniform1i(he3d.r.curProgram.uniforms.texture, 0);
	
		he3d.fx.blur.draw();

		// Vertical Pass
		he3d.gl.framebufferTexture2D(he3d.gl.FRAMEBUFFER, he3d.gl.COLOR_ATTACHMENT0,
			he3d.gl.TEXTURE_2D, he3d.t.textures[he3d.fx.blur.texture.buf1].texture, 0);
		he3d.gl.uniform1i(he3d.r.curProgram.uniforms.dir, 1);

		he3d.gl.activeTexture(he3d.gl.TEXTURE0);
		he3d.gl.bindTexture(he3d.gl.TEXTURE_2D,
			he3d.t.textures[he3d.fx.blur.texture.buf2].texture);
		he3d.gl.uniform1i(he3d.r.curProgram.uniforms.texture, 0);
		
		he3d.fx.blur.draw();
	}

	he3d.fx.blur.pass = false;
	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER, null);
};

he3d.fx.blur.resize = function() {
	if (!he3d.fx.blur.loaded)
		return;

	he3d.t.textures[he3d.fx.blur.texture.buf1].height = he3d.fx.blur.target.height;
	he3d.t.textures[he3d.fx.blur.texture.buf1].width = he3d.fx.blur.target.width;
	he3d.t.textures[he3d.fx.blur.texture.buf1].image = he3d.t.blankImage(
		he3d.t.textures[he3d.fx.blur.texture.buf1].format,
		he3d.t.textures[he3d.fx.blur.texture.buf1].stype,
		he3d.t.textures[he3d.fx.blur.texture.buf1].width,
		he3d.t.textures[he3d.fx.blur.texture.buf1].height,
		[0,0,0,0]);
	he3d.t.update(he3d.fx.blur.texture.buf1);

	he3d.t.textures[he3d.fx.blur.texture.buf2].height = he3d.fx.blur.target.height;
	he3d.t.textures[he3d.fx.blur.texture.buf2].width = he3d.fx.blur.target.width;
	he3d.t.textures[he3d.fx.blur.texture.buf2].image = he3d.t.blankImage(
		he3d.t.textures[he3d.fx.blur.texture.buf2].format,
		he3d.t.textures[he3d.fx.blur.texture.buf2].stype,
		he3d.t.textures[he3d.fx.blur.texture.buf2].width,
		he3d.t.textures[he3d.fx.blur.texture.buf2].height,
		[0, 0, 0, 0]);
	he3d.t.update(he3d.fx.blur.texture.buf2);

	he3d.s.shaders[he3d.fx.blur.shader].bound = false;
};
