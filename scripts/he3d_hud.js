//
// Hud Functions
//
he3d.log('notice', 'Include Loaded...', 'Hud');

//
// 2D Canvas HUD -----------------------------------------------------------------------------------
//
he3d.hud = {
	cb:			null,
	dirty:		true,
	enabled:	false,
	mode:		'2d',
	lastupd:	0,
	size:		[960, 540],
	updaterate:	30
};

he3d.hud.init=function() {
	if ((he3d.hud.canvas = document.getElementById('hud')) === null) {
		he3d.hud.canvas = document.createElement('canvas');
		he3d.hud.canvas.setAttribute('id', 'hud');
		he3d.canvas.parentNode.insertBefore(he3d.hud.canvas, he3d.canvas);
	}
	he3d.hud.size[0] = he3d.canvas.width;
	he3d.hud.size[1] = he3d.canvas.height;
	he3d.hud.canvas.setAttribute('height', he3d.hud.size[1]);
	he3d.hud.canvas.setAttribute('width', he3d.hud.size[0]);

	he3d.hud.ctx = he3d.hud.canvas.getContext('2d');
	he3d.hud.ctx.setTransform(1, 0, 0, 1, 0, 0);
	he3d.hud.ctx.clearRect(0, 0, he3d.hud.size[0], he3d.hud.size[1]);
};

he3d.hud.resize=function() {
	if (!he3d.hud.enabled)
		return;

	he3d.hud.size[0]=he3d.canvas.width;
	he3d.hud.size[1]=he3d.canvas.height;
	he3d.hud.canvas.setAttribute('height', he3d.hud.size[1]);
	he3d.hud.canvas.setAttribute('width', he3d.hud.size[0]);
};

he3d.hud.update = function() {
	if (!he3d.hud.enabled)
		return;

	this.now = he3d.timer.now();
	if ((this.now - he3d.hud.lastupd) < he3d.hud.updaterate && !he3d.hud.dirty)
		return;

	he3d.hud.ctx.setTransform(1, 0, 0, 1, 0, 0);
	he3d.hud.ctx.clearRect(0, 0, he3d.hud.size[0], he3d.hud.size[1]);

	he3d.hud.ctx.fillStyle = 'rgba(255, 200, 55, 255)';
	he3d.hud.ctx.font = 'bold 10pt Fixed';
	he3d.hud.ctx.textAlign = 'left';
	he3d.hud.ctx.textBaseline = 'middle';

	// FPS Counter
	he3d.hud.ctx.translate(10, 15);
	switch (he3d.r.fps.show) {
		case 1:
			he3d.hud.ctx.fillText(he3d.r.fps.current + "fps", 0, 0);
			break;
		case 2:
			he3d.hud.ctx.fillText(he3d.r.fps.current + "fps (" +
				he3d.timer.frameTime + "ms / delta " + he3d.timer.delta +
				" / walldelta " + he3d.timer.wallDelta + " / accum " + he3d.timer.accum +
				(window.performance.memory && window.performance.memory.usedJSHeapSize ?
					' ) Memory ( heap '+
					(window.performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) +
				"MB" : '') + ")", 0, 0);
			break;
	}

	if (he3d.t.viewer.enabled) {
		he3d.hud.ctx.save();
			he3d.hud.ctx.setTransform(1, 0, 0, 1, 0, 0);
			he3d.hud.ctx.textAlign = 'center';
			he3d.hud.ctx.translate(he3d.hud.size[0]/2, 15);
			he3d.hud.ctx.fillText("Viewing Texture", 0, 0);
			he3d.hud.ctx.translate(0, 10);
			he3d.hud.ctx.fillText(he3d.t.textures[he3d.t.viewer.id].name + " [" +
				he3d.t.textures[he3d.t.viewer.id].width + ", " +
				he3d.t.textures[he3d.t.viewer.id].height + "]", 0, 0);
			he3d.hud.ctx.textAlign = 'left';
		he3d.hud.ctx.restore();
	}

	// External Hud Callback
	if (!he3d.t.viewer.enabled && he3d.hud.cb)
		he3d.hud.cb();

	// Set next update flags
	he3d.hud.dirty = false;
	he3d.hud.lastupd = this.now;
};

//
// 3D Canvas Texture HUD ---------------------------------------------------------------------------
//
he3d.hud3d={};
he3d.hud3d.init = function() {
	// Shader
	he3d.s.load({name:'hud', bind:he3d.hud.bind});

	// Quad
	he3d.hud.vbo = he3d.primatives.quad('vt');
	he3d.hud.vbo.fillStyle=2;
	he3d.hud.vbo.shader = 'hud';

	// Canvas
	he3d.hud.canvas = document.createElement('canvas');
	he3d.hud.canvas.setAttribute('width', he3d.hud.size[0]);
	he3d.hud.canvas.setAttribute('height', he3d.hud.size[1]);
	he3d.hud.canvas.setAttribute('id', 'hud');

	he3d.hud.canvas = document.getElementById('hud');
	he3d.hud.canvas.setAttribute('width', he3d.hud.size[0]);
	he3d.hud.canvas.setAttribute('height', he3d.hud.size[1]);

	he3d.hud.ctx=he3d.hud.canvas.getContext('2d');
	he3d.hud.ctx.setTransform(1, 0, 0, 1, 0, 0);
	he3d.hud.ctx.clearRect(0, 0, he3d.hud.size[0], he3d.hud.size[1]);

	// Load As Texture
	he3d.hud.texture = he3d.t.load({
		type:	'canvas',
		target:	he3d.hud,
		width:	he3d.hud.size[0],
		height:	he3d.hud.size[1]
	});
};

he3d.hud3d.bind = function() {
	he3d.gl.uniform1i(he3d.r.curProgram.uniforms["texture"], he3d.hud.texture);
	he3d.gl.uniformMatrix4fv(he3d.r.curProgram.uniforms['uPMatrix'], false, he3d.r.pMatrix);
	he3d.r.curProgram.bound = true;
};

he3d.hud3d.draw = function() {
	return;
	if (!he3d.hud.enabled)
		return;

	var vbo=he3d.hud.vbo;

	he3d.r.changeProgram(vbo.shader);

	he3d.gl.enable(he3d.gl.BLEND);
	he3d.gl.disable(he3d.gl.DEPTH_TEST);

	// Object Data
	he3d.gl.bindBuffer(he3d.gl.ARRAY_BUFFER, vbo.buf_data);

	he3d.gl.vertexAttribPointer(he3d.r.curProgram.attributes['aPosition'],
		vbo.buf_sizes['v'], he3d.gl.FLOAT, false, vbo.buf_size, vbo.buf_offsets['v']);
	he3d.gl.vertexAttribPointer(he3d.r.curProgram.attributes['aTexCoord'],
		vbo.buf_sizes['t'], he3d.gl.FLOAT, false, vbo.buf_size, vbo.buf_offsets['t']);

	he3d.gl.bindBuffer(he3d.gl.ELEMENT_ARRAY_BUFFER, vbo.buf_indices);
	he3d.gl.drawElements(vbo.rendertype, vbo.indices, he3d.gl.UNSIGNED_SHORT, 0);

	he3d.gl.enable(he3d.gl.DEPTH_TEST);
	he3d.gl.disable(he3d.gl.BLEND);
};

he3d.hud3d.update = function() {
	if (!he3d.hud.enabled)
		return;

	var now = he3d.timer.now();
	if ((now - he3d.hud.lastupd) < he3d.hud.updaterate && !he3d.hud.dirty)
		return;

	he3d.hud.ctx.setTransform(1, 0, 0, 1, 0, 0);
	he3d.hud.ctx.clearRect(0, 0, he3d.hud.size[0], he3d.hud.size[1]);

	he3d.hud.ctx.fillStyle = 'rgba(255, 255, 255, 255)';
	he3d.hud.ctx.font = 'bold 10pt Fixed';
	he3d.hud.ctx.textAlign = 'left';
	he3d.hud.ctx.textBaseline = 'middle';

	// FPS Counter
	he3d.hud.ctx.translate(10, 15);
	he3d.hud.ctx.fillText(he3d.r.fps.current + "fps (" +
		he3d.timer.frameTime + "ms)", 0, 0);

	// External Hud Callback
	if (he3d.hud.cb) he3d.hud.cb();

	// Update Texture
	he3d.t.update(he3d.hud.texture);
	he3d.hud.dirty = false;
	he3d.hud.lastupd = now;
};
