//
// No Game Loaded
//
he3d.noGame={};
he3d.noGame.load=function(){
	he3d.game.vbo=he3d.primatives.quad('vt');
	he3d.game.angle=0;
	he3d.s.path='../he3d/shaders/';
	he3d.s.load({name: 'nogame'});
	he3d.game.vbo.shader='nogame';
	he3d.t.path='../he3d/images/';
	he3d.game.vbo.texture=he3d.t.load({
		filename:'he3dlogo.png',
		name:'he3dlogo',
		type:'image',
		flip: true,
		wrap: true
	});
	he3d.fx.shadowMapping.enabled=false;
	he3d.hud.init();
};
he3d.noGame.view=function(){
	if(!he3d.game.loaded){
		if(!he3d.s.checkQueue())
			return;
		if(!he3d.game.vbo.loaded)
			return;
		he3d.game.loaded=true;
		he3d.log("ERROR",'Error or No Game Code Found');
		he3d.console.toggle(false);
	}
	he3d.game.angle+=0.050;
	if(he3d.game.angle>359)
		he3d.game.angle=0;
	he3d.r.rCount=0;
	he3d.r.renderables[he3d.r.rCount++]={
		func:he3d.noGame.draw,
		castShadow:false
	};
	he3d.game.view=he3d.m.mat4.create();
	he3d.m.mat4.ortho(-1,1,-1,1,0.01,100,he3d.game.view);
	he3d.hud.enabled=true;
	he3d.hud.updaterate=10000;
	he3d.hud.cb=function(){
		this.ctx.setTransform(1,0,0,1,0,0);
		this.ctx.translate(this.size[0]/2,this.size[1]-this.size[1]/8);
		this.ctx.textAlign='center';
		this.ctx.fillStyle="#E34F27";
		this.ctx.font="normal 20px impact";
		this.ctx.fillText("Error or No Game Loaded",0,0);
	};
};
he3d.noGame.draw=function(){
	he3d.r.changeProgram(he3d.game.vbo.shader);

	// Object Data
	he3d.gl.bindBuffer(he3d.gl.ARRAY_BUFFER,he3d.game.vbo.buf_data);

	he3d.gl.uniform1f(he3d.r.curProgram.uniforms.angle,he3d.game.angle);
	he3d.gl.uniform1i(he3d.r.curProgram.uniforms.texture,he3d.game.vbo.texture);
	he3d.gl.uniformMatrix4fv(he3d.r.curProgram.uniforms.uPMatrix,false,he3d.game.view);
	he3d.gl.uniform2fv(he3d.r.curProgram.uniforms.uSize,[he3d.canvas.width,he3d.canvas.height]);

	he3d.gl.vertexAttribPointer(he3d.r.curProgram.attributes.aPosition,he3d.game.vbo.buf_sizes.v,
		he3d.gl.FLOAT,false,he3d.game.vbo.buf_size,he3d.game.vbo.buf_offsets.v);
	he3d.gl.vertexAttribPointer(he3d.r.curProgram.attributes.aTexCoord,he3d.game.vbo.buf_sizes.t,
		he3d.gl.FLOAT,false,he3d.game.vbo.buf_size,he3d.game.vbo.buf_offsets.t);

	he3d.gl.bindBuffer(he3d.gl.ELEMENT_ARRAY_BUFFER,he3d.game.vbo.buf_indices);
	he3d.gl.drawElements(he3d.game.vbo.rendertype,
		he3d.game.vbo.indices,he3d.gl.UNSIGNED_SHORT,0);
};
