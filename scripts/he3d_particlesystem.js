//
// Particle System Functions
//
he3d.log('notice','Include Loaded...','Particle System');
he3d.ps={
	drawcb:null,
	max_particles:10000,
	particles:[],
	rpos:null,
	total:0,
	time:0,
	vbo:{}
};

he3d.ps.init=function(){
	he3d.ps.vbo.buf_data=he3d.gl.createBuffer();
	he3d.s.load({name:'particle'});
	he3d.ps.vbo.shader="particle";
	he3d.ps.rpos=he3d.m.vec3.create();
	he3d.ps.mvMatrix=he3d.m.mat4.create();
	he3d.ps.reset();
	he3d.log('NOTICE','Particle System Initialised:',
		'Max Particles: '+he3d.ps.max_particles);
};
he3d.ps.reset=function(){
	he3d.ps.vbo.data=new Float32Array(9*he3d.ps.max_particles);
};

//
// Add New Particles -------------------------------------------------------------------------------
//
he3d.ps.add=function(opts){
	if(he3d.ps.particles.length>=he3d.ps.max_particles){
		he3d.log('WARNING','Maximum Particles Exceeded:',he3d.ps.max_particles);
		return;
	}

	if(!opts)opts={};
	var p={
		amount:1,
		angle:he3d.m.vec2.create([0,0]),
		color:{r:1.0,g:1.0,b:1.0,a:1.0,pseudo:true},
		gravity:true,
		life:5,
		pos:[0,0,0],
		respawn:false,
		size:5.0,
		spread:[0,0,0],
		spreadvel:false,
		thrust:0,
		type:0.0,
		vel:[0,0,0]
	};
	for(var a in opts){p[a]=opts[a];}

	// Multispawn!
	while(p.amount--){
		var pos=[p.pos[0]-(p.spread[0]/2),p.pos[1]-(p.spread[1]/2),p.pos[2]-(p.spread[2]/2)];
		pos[0]+=(Math.random()*p.spread[0]);
		pos[1]+=(Math.random()*p.spread[1]);
		pos[2]+=(Math.random()*p.spread[2]);

		var pseudocolor=[p.color.r,p.color.g,p.color.b,p.color.a];
		if(p.color.pseudo){
			var pseudonite=Math.random()*1000;

			if(p.color.r>0){
				pseudonite=pseudonite*13613 % 393919;
				pseudocolor[0]=p.color.r+(pseudonite/393919)*0.3;
			}
			if(p.color.g>0){
				pseudonite=pseudonite*13613 % 393919;
				pseudocolor[1]=p.color.g+(pseudonite/393919)*0.3;
			}
			if(p.color.b>0){
				pseudonite=pseudonite*13613 % 393919;
				pseudocolor[2]=p.color.b+(pseudonite/393919)*0.3;
			}
		}

		// Add New Particle to Stack
		he3d.ps.particles.push({
			angle:p.angle,
			color:pseudocolor,
			gravity:p.gravity,
			life:p.life,
			pos:he3d.m.vec3.create(pos),
			respawn:p.respawn,
			rpos:he3d.m.vec3.create([0,0,0]),
			size:p.size,
			spread:p.spread,
			spreadvel:p.spreadvel,
			thrust:p.thrust,
			type:p.type,
			vel:p.vel
		});
	}
};

//
// GL Draw Routine ---------------------------------------------------------------------------------
//	The particle data is packed in to a single data buffer
//	so that it can be rendered in 1 pass.
//
he3d.ps.draw=function(){
	if(!he3d.ps.total)return;

	he3d.r.changeProgram(he3d.ps.vbo.shader);

	// Blending
	he3d.gl.enable(he3d.gl.BLEND);

	// Object Data
	he3d.gl.bindBuffer(he3d.gl.ARRAY_BUFFER,he3d.ps.vbo.buf_data);
	he3d.gl.bufferData(he3d.gl.ARRAY_BUFFER,he3d.ps.vbo.data,he3d.gl.DYNAMIC_DRAW);

	he3d.gl.vertexAttribPointer(he3d.r.curProgram.attributes['aPosition'],
		3,he3d.gl.FLOAT,false,36,0);
	he3d.gl.vertexAttribPointer(he3d.r.curProgram.attributes['aColor'],
		4,he3d.gl.FLOAT,false,36,12);
	he3d.gl.vertexAttribPointer(he3d.r.curProgram.attributes['aSize'],
		1,he3d.gl.FLOAT,false,36,28);
	he3d.gl.vertexAttribPointer(he3d.r.curProgram.attributes['aType'],
		1,he3d.gl.FLOAT,false,36,32);

	// Shader Options
	he3d.gl.uniform1i(he3d.r.curProgram.uniforms['uShadowPass'],he3d.fx.shadowMapping.pass);
	he3d.gl.uniform1i(he3d.r.curProgram.uniforms['uBlurPass'],he3d.fx.blur.pass);

	if(he3d.ps.drawcb)
		he3d.ps.drawcb();

	// Position in World
	he3d.m.mat4.set(he3d.r.mvMatrix,he3d.ps.mvMatrix);
	he3d.m.mat4.translate(he3d.ps.mvMatrix,he3d.ps.rpos);
	he3d.gl.uniformMatrix4fv(he3d.r.curProgram.uniforms['uPMatrix'],false,he3d.r.pMatrix);
	he3d.gl.uniformMatrix4fv(he3d.r.curProgram.uniforms['uMVMatrix'],false,he3d.ps.mvMatrix);
	he3d.gl.drawArrays(he3d.gl.POINTS,0,he3d.ps.total/9);

	// Blending
	he3d.gl.disable(he3d.gl.BLEND);
};
