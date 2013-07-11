//
// Screen Space Ambient Occulsion ------------------------------------------------------------------
//
he3d.log('notice', 'Include Loaded...', 'Effects/SSAO');

he3d.fx.ssao = {
	attenuation:	he3d.m.vec2.create([0.2, 0.36]),
	fbo:			null,
	occluderBias:	0.25,
	samplingRadius:	3.5,
	shader:			null,
	shader_blur:	null,
	texture_blur:	null,
	texture_depth:	null,
	texture_noise:	null,
	texture_normal:	null,
	texture_raw:	null,
	size: 			he3d.m.vec2.create(),
	texelsize:		he3d.m.vec2.create()
};

he3d.fx.ssao.init = function(depth, normal, noise, ssaoshader, blurshader) {
	// Read from textures
	he3d.fx.ssao.texture_depth = depth || null;
	he3d.fx.ssao.texture_normal = normal || null;

	// Noise Texture
	if (noise) {
		he3d.fx.ssao.texture_noise = noise;
	} else {
		he3d.fx.ssao.texture_noise = he3d.t.load({
			name:		'ssao noise',
			filename:	'noise.png',
			flip:		true,
			internal:	true,
			type:		'image',
			wrap:		[true, true]
		});
	}

	// External shaders
	if (ssaoshader) {
		he3d.fx.ssao.shader = ssaoshader;
	} else {
		he3d.s.load({
			name:		'ssao',
			internal:	true,
			bind:		he3d.fx.ssao.bind
		});
		he3d.fx.ssao.shader = 'ssao';
	}
	if (blurshader) {
		he3d.fx.ssao.shader_blur = blurshader;
	} else {
		he3d.s.load({
			name:		'ssao_blur',
			internal:	true,
			bind:		he3d.fx.ssao.bind_blur
		});
		he3d.fx.ssao.shader_blur = 'ssao_blur';
	}

	// inverse view matrix for position reconstruction
	he3d.fx.ssao.invmvpMatrix = he3d.m.mat4.create();

	// Texel Size
	he3d.fx.ssao.size = he3d.m.vec2.create([he3d.canvas.width, he3d.canvas.height]);
	he3d.fx.ssao.texelsize = he3d.m.vec2.create([
		1.0 / he3d.fx.ssao.size[0],	1.0 / he3d.fx.ssao.size[1]]);

	// Set up Framebuffer
	he3d.fx.ssao.fbo = he3d.gl.createFramebuffer();
	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER, he3d.fx.ssao.fbo);

	he3d.fx.ssao.texture_raw = he3d.t.load({
		height:	he3d.canvas.height,
		image: 	null,
		name:	'SSAO Raw',
		type:	'raw',
		width:	he3d.canvas.width
	});

	he3d.gl.framebufferTexture2D(he3d.gl.FRAMEBUFFER, he3d.gl.COLOR_ATTACHMENT0,
		he3d.gl.TEXTURE_2D, he3d.t.textures[he3d.fx.ssao.texture_raw].texture, 0);
	
	he3d.fx.ssao.texture_blur = he3d.t.load({
		height: he3d.canvas.height,
		image: 	null,
		name:	'SSAO Blur',
		type:	'raw',
		width:	he3d.canvas.width
	});

	var fbstatus = he3d.gl.checkFramebufferStatus(he3d.gl.FRAMEBUFFER);
	if(fbstatus !== he3d.gl.FRAMEBUFFER_COMPLETE)
		he3d.log("FATAL", "Failed to create SSAO Framebuffer", he3d.r.getGLErrorString(fbstatus));
	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER, null);

	// Full screen quad
	he3d.fx.ssao.vbo = he3d.primatives.quad('vt');
	he3d.fx.ssao.view = he3d.m.mat4.create();
	he3d.m.mat4.ortho(-1, 1, -1, 1, 0.01, 10, he3d.fx.ssao.view);
};

// Shader binds
he3d.fx.ssao.bind = function() {
	he3d.gl.uniform2fv(he3d.r.curProgram.uniforms.uTexelSize, he3d.fx.ssao.texelsize);

	he3d.gl.uniformMatrix4fv(he3d.r.curProgram.uniforms.uPMatrix, false, he3d.fx.ssao.view);

	he3d.gl.uniform2fv(he3d.r.curProgram.uniforms.uAttenuation, he3d.fx.ssao.attenuation);
	he3d.gl.uniform1f(he3d.r.curProgram.uniforms.uOccluderBias, he3d.fx.ssao.occluderBias);
	he3d.gl.uniform1f(he3d.r.curProgram.uniforms.uSamplingRadius, he3d.fx.ssao.samplingRadius);

	he3d.gl.activeTexture(he3d.gl.TEXTURE0);
	he3d.gl.bindTexture(he3d.gl.TEXTURE_2D, he3d.t.textures[he3d.fx.ssao.texture_depth].texture);
	he3d.gl.uniform1i(he3d.r.curProgram.uniforms.uDepth, 0);

	he3d.gl.activeTexture(he3d.gl.TEXTURE1);
	he3d.gl.bindTexture(he3d.gl.TEXTURE_2D, he3d.t.textures[he3d.fx.ssao.texture_noise].texture);
	he3d.gl.uniform1i(he3d.r.curProgram.uniforms.uNoise, 1);

	he3d.gl.activeTexture(he3d.gl.TEXTURE2);
	he3d.gl.bindTexture(he3d.gl.TEXTURE_2D, he3d.t.textures[he3d.fx.ssao.texture_normal].texture);
	he3d.gl.uniform1i(he3d.r.curProgram.uniforms.uNormal, 2);

	he3d.r.curProgram.bound = true;
};
he3d.fx.ssao.bind_blur = function() {
	he3d.gl.activeTexture(he3d.gl.TEXTURE0);
	he3d.gl.bindTexture(he3d.gl.TEXTURE_2D, he3d.t.textures[he3d.fx.ssao.texture_raw].texture);
	he3d.gl.uniform1i(he3d.r.curProgram.uniforms.uTex, 0);
	
	he3d.gl.uniformMatrix4fv(he3d.r.curProgram.uniforms.uPMatrix, false, he3d.fx.ssao.view);

	he3d.r.curProgram.bound = true;
};

he3d.fx.ssao.pass = function(depth, normal) {
	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER, he3d.fx.ssao.fbo);
	he3d.gl.framebufferTexture2D(he3d.gl.FRAMEBUFFER, he3d.gl.COLOR_ATTACHMENT0,
		he3d.gl.TEXTURE_2D, he3d.t.textures[he3d.fx.ssao.texture_raw].texture, 0);

	he3d.gl.viewport(0, 0, he3d.fx.ssao.size[0], he3d.fx.ssao.size[1]);
	he3d.gl.clearColor(0.0, 0.0, 0.0, 1.0);
	he3d.gl.clear(he3d.gl.COLOR_BUFFER_BIT);

	he3d.r.changeProgram(he3d.fx.ssao.shader);

	he3d.gl.bindBuffer(he3d.gl.ARRAY_BUFFER, he3d.fx.ssao.vbo.buf_data);

	he3d.gl.vertexAttribPointer(he3d.r.curProgram.attributes.aPosition,
		he3d.fx.ssao.vbo.buf_sizes.v, he3d.gl.FLOAT, false,
		he3d.fx.ssao.vbo.buf_size, he3d.fx.ssao.vbo.buf_offsets.v);
	he3d.gl.vertexAttribPointer(he3d.r.curProgram.attributes.aTexCoords,
		he3d.fx.ssao.vbo.buf_sizes.t, he3d.gl.FLOAT, false,
		he3d.fx.ssao.vbo.buf_size, he3d.fx.ssao.vbo.buf_offsets.t);

	if (depth) {
		he3d.gl.activeTexture(he3d.gl.TEXTURE0);
		he3d.gl.bindTexture(he3d.gl.TEXTURE_2D, he3d.t.textures[depth].texture);
		he3d.gl.uniform1i(he3d.r.curProgram.uniforms.uDepth, 0);
	}
	
	if (normal) {
		he3d.gl.activeTexture(he3d.gl.TEXTURE2);
		he3d.gl.bindTexture(he3d.gl.TEXTURE_2D, he3d.t.textures[normal].texture);
		he3d.gl.uniform1i(he3d.r.curProgram.uniforms.uNormal, 2);
	}

	he3d.m.mat4.multiply(he3d.r.pMatrix, he3d.r.mvMatrix, he3d.fx.ssao.invmvpMatrix);
	he3d.m.mat4.inverse(he3d.fx.ssao.invmvpMatrix);
	he3d.gl.uniformMatrix4fv(he3d.r.curProgram.uniforms.uinvmvpMatrix,
		false, he3d.fx.ssao.invmvpMatrix);

	he3d.gl.bindBuffer(he3d.gl.ELEMENT_ARRAY_BUFFER, he3d.fx.ssao.vbo.buf_indices);
	he3d.gl.drawElements(he3d.gl.TRIANGLES,
		he3d.fx.ssao.vbo.indices, he3d.gl.UNSIGNED_SHORT, 0);

	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER, null);
};

he3d.fx.ssao.blur = function() {
	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER, he3d.fx.ssao.fbo);
	he3d.gl.framebufferTexture2D(he3d.gl.FRAMEBUFFER, he3d.gl.COLOR_ATTACHMENT0,
		he3d.gl.TEXTURE_2D, he3d.t.textures[he3d.fx.ssao.texture_blur].texture,0);

	he3d.gl.clearColor(0.0, 0.0, 0.0, 0.0);
	he3d.gl.clear(he3d.gl.COLOR_BUFFER_BIT);

	he3d.r.changeProgram(he3d.fx.ssao.shader_blur);

	he3d.gl.bindBuffer(he3d.gl.ARRAY_BUFFER, he3d.fx.ssao.vbo.buf_data);

	he3d.gl.vertexAttribPointer(he3d.r.curProgram.attributes.aPosition,
		he3d.fx.ssao.vbo.buf_sizes.v, he3d.gl.FLOAT, false,
		he3d.fx.ssao.vbo.buf_size, he3d.fx.ssao.vbo.buf_offsets.v);
	he3d.gl.vertexAttribPointer(he3d.r.curProgram.attributes.aTexCoords,
		he3d.fx.ssao.vbo.buf_sizes.t, he3d.gl.FLOAT, false,
		he3d.fx.ssao.vbo.buf_size, he3d.fx.ssao.vbo.buf_offsets.t);

	he3d.gl.bindBuffer(he3d.gl.ELEMENT_ARRAY_BUFFER, he3d.fx.ssao.vbo.buf_indices);
	he3d.gl.drawElements(he3d.gl.TRIANGLES,
		he3d.fx.ssao.vbo.indices, he3d.gl.UNSIGNED_SHORT, 0);

	he3d.gl.bindFramebuffer(he3d.gl.FRAMEBUFFER, null);
};

he3d.fx.ssao.resize = function() {
	he3d.fx.ssao.size[0] = he3d.canvas.width;
	he3d.fx.ssao.size[1] = he3d.canvas.height;

	he3d.fx.ssao.texelsize[0] = 1.0 / he3d.fx.ssao.size[0];
	he3d.fx.ssao.texelsize[1] = 1.0 / he3d.fx.ssao.size[1];

	// If not init'd don't resize textures / shaders
	//	that don't exist yet =]
	if (!he3d.fx.ssao.texture_raw)
		return;

	he3d.t.textures[he3d.fx.ssao.texture_raw].height = he3d.canvas.height;
	he3d.t.textures[he3d.fx.ssao.texture_raw].width  = he3d.canvas.width;
	he3d.t.update(he3d.fx.ssao.texture_raw);

	he3d.t.textures[he3d.fx.ssao.texture_blur].height = he3d.canvas.height;
	he3d.t.textures[he3d.fx.ssao.texture_blur].width  = he3d.canvas.width;
	he3d.t.update(he3d.fx.ssao.texture_blur);

	he3d.s.shaders[he3d.fx.ssao.shader].bound = false;
	he3d.s.shaders[he3d.fx.ssao.shader_blur].bound = false;
};
