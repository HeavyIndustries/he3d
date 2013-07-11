//
// Post Processing ---------------------------------------------------------------------------------
//

he3d.log('notice','Include Loaded...','Effects/Post Processing');

he3d.fx.postProcessing = {
	options:{
		fxaa:	true
	},
	cb:			null,
	gamma:		2.2,
	loaded:		false,
	size:		[0,0],
	target:		null,
	vbo:		{}
};

he3d.fx.postProcessing.init = function() {
	he3d.fx.postProcessing.target = he3d.r.targets.FS1;
	he3d.fx.postProcessing.size = [1.0 / he3d.fx.postProcessing.target.width,
		1.0 / he3d.fx.postProcessing.target.height];

	// Create a blank texture
	he3d.fx.postProcessing.texture = he3d.t.load({
		height:	he3d.fx.postProcessing.target.height,
		name:	'postProcessing',
		type:	'blank',
		width:	he3d.fx.postProcessing.target.width
	});

	// Load Shader
	he3d.s.load({
		name: 	'postprocessing',
		onLoad:	function(){ he3d.fx.postProcessing.loaded = true; },
		bind:	he3d.fx.postProcessing.bind
	});
	he3d.fx.postProcessing.shader = "postprocessing";

	// Build Quad
	he3d.fx.postProcessing.vbo = he3d.primatives.quad('vt');
	he3d.fx.postProcessing.view = he3d.m.mat4.create();
	he3d.m.mat4.ortho(-1, 1, -1, 1, 0.01, 10, he3d.fx.postProcessing.view);

	he3d.log('NOTICE','Post Processing Initialised:',
		'Texture: ' + he3d.fx.postProcessing.texture);
};

he3d.fx.postProcessing.bind = function() {
	he3d.gl.uniform1f(he3d.r.curProgram.uniforms.gamma, he3d.fx.postProcessing.gamma);
	he3d.gl.uniform2fv(he3d.r.curProgram.uniforms.uSize, he3d.fx.postProcessing.size);

	he3d.gl.uniformMatrix4fv(he3d.r.curProgram.uniforms.uPMatrix,
		false, he3d.fx.postProcessing.view);

	// Disable FXAA explicitly during fades
	if(he3d.r.clearColor[3] < 1.0)
		he3d.gl.uniform1i(he3d.r.curProgram.uniforms.opt_fxaa, 0);
	else
		he3d.gl.uniform1i(he3d.r.curProgram.uniforms.opt_fxaa, he3d.fx.postProcessing.options.fxaa);

	he3d.r.curProgram.bound = true;
};

he3d.fx.postProcessing.draw = function() {
	// Wait for shader to finish compiling
	if (!he3d.fx.postProcessing.loaded)
		return;

	he3d.r.changeProgram(he3d.fx.postProcessing.shader);

	// External Postprocessing callback
	if (he3d.fx.postProcessing.cb)
		he3d.fx.postProcessing.cb();

	he3d.gl.activeTexture(he3d.gl.TEXTURE0);
	he3d.gl.bindTexture(he3d.gl.TEXTURE_2D,
		he3d.t.textures[he3d.fx.postProcessing.texture].texture);
	he3d.gl.uniform1i(he3d.r.curProgram.uniforms.texture, 0);

	// Object Data
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

he3d.fx.postProcessing.pass = function() {
	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER, he3d.fx.postProcessing.target.fbo);
	he3d.gl.framebufferTexture2D(he3d.gl.FRAMEBUFFER, he3d.gl.COLOR_ATTACHMENT0,
		he3d.gl.TEXTURE_2D, he3d.t.textures[he3d.fx.postProcessing.texture].texture, 0);
		
	he3d.gl.viewport(0, 0,
		he3d.fx.postProcessing.target.width, he3d.fx.postProcessing.target.height);
		
	he3d.gl.clearColor(
		he3d.r.clearColor[0],
		he3d.r.clearColor[1],
		he3d.r.clearColor[2],
		he3d.r.clearColor[3]
	);
	he3d.gl.clear(he3d.gl.COLOR_BUFFER_BIT | he3d.gl.DEPTH_BUFFER_BIT);

	for (var r = 0; r < he3d.r.rCount; r++) {
		he3d.r.renderables[r].func(he3d.r.renderables[r].args);

		// Check for draw errors
		if (he3d.r.debugDrawCalls) {
			var err = he3d.gl.getError();
			if (err != he3d.gl.NO_ERROR) {
				he3d.log("FATAL", "GL ERROR: " + he3d.r.getGLErrorString(err),
					" in Renderable [" + r + "] Draw Call (See Console for more)");
				console.log("Function  :" + he3d.r.renderables[r].func);
				if (he3d.r.renderables[r].args)
					console.log("Arguments :" + he3d.r.renderables[r].args);
				console.log("Shader    :" + JSON.stringify(he3d.r.curProgram));
				return;
			}
		}
	}

	he3d.r.rCount=0;

	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER, null);
};

he3d.fx.postProcessing.resize = function() {
	if (!he3d.fx.postProcessing.loaded)
		return;

	he3d.t.textures[he3d.fx.postProcessing.texture].height = he3d.canvas.height;
	he3d.t.textures[he3d.fx.postProcessing.texture].width = he3d.canvas.width;

	// Resize Texture
	he3d.t.textures[he3d.fx.postProcessing.texture].image = he3d.t.blankImage(
		he3d.t.textures[he3d.fx.postProcessing.texture].format,
		he3d.t.textures[he3d.fx.postProcessing.texture].stype,
		he3d.t.textures[he3d.fx.postProcessing.texture].width,
		he3d.t.textures[he3d.fx.postProcessing.texture].height);
	he3d.t.update(he3d.fx.postProcessing.texture);

	he3d.fx.postProcessing.size = [1.0 / he3d.fx.postProcessing.target.width,
		1.0 / he3d.fx.postProcessing.target.height];

	he3d.s.shaders[he3d.fx.postProcessing.shader].bound = false;
};
