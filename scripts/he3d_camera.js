//
// Camera Functions
//

he3d.log('notice','Include Loaded...','Camera');

he3d.camera=function(s){
	if(!s)s={};
	this.type='world';

	this.fov=45.0;
	this.near=0.1;
	this.far=200.0;

	this.distance=0;

	this.accel=5.0;
	this.k_turnspeed=90.0;
	this.m_turnspeed=45.0;

	// Overload settings
	for(var a in s){this[a]=s[a];}

	this.init();
	return this;
};

he3d.camera.prototype.init=function(){
	this.reset();
	this.updatePerspective();
	return this;
};

he3d.camera.prototype.lookAt=function(dest){
	var upx=0,upy=1,upz=0;
	
	if(this.pos[0]==dest[0]&&this.pos[1]==dest[1]&&this.pos[2]==dest[2])
		return he3d.m.mat4.identity(he3d.r.pMatrix);
	
	var z0,z1,z2,x0,x1,x2,y0,y1,y2,len;
	
	z0=this.pos[0]-dest[0];
	z1=this.pos[1]-dest[1];
	z2=this.pos[2]-dest[2];
	
	len=1/Math.sqrt(z0*z0+z1*z1+z2*z2);
	z0*=len;
	z1*=len;
	z2*=len;
	
	x0=upy*z2-upz*z1;
	x1=upz*z0-upx*z2;
	x2=upx*z1-upy*z0;
	len=Math.sqrt(x0*x0+x1*x1+x2*x2);
	if(!len){
		x0=0;
		x1=0;
		x2=0;
	}else{
		len=1/len;
		x0*=len;
		x1*=len;
		x2*=len;
	}
	
	y0=z1*x2-z2*x1;
	y1=z2*x0-z0*x2;
	y2=z0*x1-z1*x0;
	
	len=Math.sqrt(y0*y0+y1*y1+y2*y2);
	if(!len){
		y0=0;
		y1=0;
		y2=0;
	}else{
		len=1/len;
		y0*=len;
		y1*=len;
		y2*=len;
	}
	
	he3d.r.mvMatrix[0]=x0;
	he3d.r.mvMatrix[1]=y0;
	he3d.r.mvMatrix[2]=z0;
	he3d.r.mvMatrix[3]=0;
	he3d.r.mvMatrix[4]=x1;
	he3d.r.mvMatrix[5]=y1;
	he3d.r.mvMatrix[6]=z1;
	he3d.r.mvMatrix[7]=0;
	he3d.r.mvMatrix[8]=x2;
	he3d.r.mvMatrix[9]=y2;
	he3d.r.mvMatrix[10]=z2;
	he3d.r.mvMatrix[11]=0;
	he3d.r.mvMatrix[12]=-(x0*this.pos[0]+x1*this.pos[1]+x2*this.pos[2]);
	he3d.r.mvMatrix[13]=-(y0*this.pos[0]+y1*this.pos[1]+y2*this.pos[2]);
	he3d.r.mvMatrix[14]=-(z0*this.pos[0]+z1*this.pos[1]+z2*this.pos[2]);
	he3d.r.mvMatrix[15]=1;

	return this;
};

he3d.camera.prototype.readInput=function(){
	this.mod=1;
	if(he3d.i.keys[he3d.e.keys.SHIFT])
		this.mod=2.5;
	
	if(he3d.i.keys[he3d.e.keys.W])this.delta[2]= (this.accel/this.mod)*he3d.timer.delta;
	if(he3d.i.keys[he3d.e.keys.S])this.delta[2]=-(this.accel/this.mod)*he3d.timer.delta;
	if(he3d.i.keys[he3d.e.keys.A])this.delta[0]= (this.accel/this.mod)*he3d.timer.delta;
	if(he3d.i.keys[he3d.e.keys.D])this.delta[0]=-(this.accel/this.mod)*he3d.timer.delta;
	if(he3d.i.keys[he3d.e.keys.E])this.delta[1]= (this.accel/this.mod)*he3d.timer.delta;
	if(he3d.i.keys[he3d.e.keys.Q])this.delta[1]=-(this.accel/this.mod)*he3d.timer.delta;
	
	if(he3d.i.keys[he3d.e.keys.LEFT_ARROW])this.angle[1]+=
		(this.k_turnspeed/this.mod)*he3d.timer.delta;
	if(he3d.i.keys[he3d.e.keys.RIGHT_ARROW])this.angle[1]-=
		(this.k_turnspeed/this.mod)*he3d.timer.delta;
	if(he3d.i.keys[he3d.e.keys.DOWN_ARROW])this.angle[0]+=
		(this.k_turnspeed/this.mod)*he3d.timer.delta;
	if(he3d.i.keys[he3d.e.keys.UP_ARROW])this.angle[0]-=
		(this.k_turnspeed/this.mod)*he3d.timer.delta;

	// Middle Mouse Button Camera Rotation
	if(he3d.i.pointerLocked||he3d.i.mouse.buttons[he3d.e.mouse.middle]){
		this.angle[1]-=(this.m_turnspeed*he3d.i.mouse.delta[0])*he3d.timer.delta;
		this.angle[0]-=(this.m_turnspeed*he3d.i.mouse.delta[1])*he3d.timer.delta;
	}

	if(he3d.i.mouse.wheel>0)this.setfov(this.fov-5);
	if(he3d.i.mouse.wheel<0)this.setfov(this.fov+5);

	return this;
};

he3d.camera.prototype.reset=function(){
	this.camMat=he3d.m.mat4.create();
	this.pos=he3d.m.vec3.create([0,0,0]);
	this.delta=he3d.m.vec3.create([0,0,0]);
	this.vel=he3d.m.vec3.create([0,0,0]);
	this.angle=he3d.m.vec2.create([90,90]);

	return this;
};

he3d.camera.prototype.setfov=function(fov){
	if(fov > 10 && fov < 110){
		this.fov=fov;
		this.updatePerspective();
	}
	//he3d.log("Notice",'New Camera FOV:',this.fov);
	return this;
};

he3d.camera.prototype.update=function(){
	if(this.angle[0]>360)this.angle[0]-=360;
	else if(this.angle[0]<0)this.angle[0]+=360;
	if(this.angle[1]>360)this.angle[1]-=360;
	else if(this.angle[1]<0)this.angle[1]+=360;

	if(this.type=='quat'){
		this.qrot=he3d.m.quat4.eulerAngleCreate(this.angle[0],this.angle[1],0);
		he3d.m.quat4.multiplyVec3(this.qrot,this.delta);
		this.camMat=he3d.m.quat4.toMat4_broke(this.qrot);
	
		// Movement
		this.pos[0]+=this.delta[0];
		this.pos[1]+=this.delta[1];
		this.pos[2]+=this.delta[2];

		this.delta[0]=0;
		this.delta[1]=0;
		this.delta[2]=0;
	}
	return this;
};

he3d.camera.prototype.updateOrtho=function(w,h){
	if(!w||!h){
		w=(he3d.r.fullscreen?window.innerWidth:he3d.r.windowSize[0]);
		h=(he3d.r.fullscreen?window.innerHeight:he3d.r.windowSize[1]);
	}
	he3d.m.mat4.ortho(-w/2,w/2,-h/2,h/2,this.near,this.far,he3d.r.pMatrix);
	return this;
};

he3d.camera.prototype.updatePerspective=function(){
	switch(this.type){
		case 'square':
			this.aspect=1;
			break;
		default:
			this.aspect=(he3d.r.fullscreen?window.innerWidth:he3d.r.windowSize[0])
				/(he3d.r.fullscreen?window.innerHeight:he3d.r.windowSize[1]);
			break;
	}
	he3d.m.mat4.perspective(this.fov,this.aspect,this.near,this.far,he3d.r.pMatrix);
	return this;
};

he3d.camera.prototype.view=function(){
	if(this.type=='quat'){
		he3d.m.mat4.identity(he3d.r.mvMatrix);
		he3d.m.mat4.multiply(he3d.r.mvMatrix,this.camMat);
		he3d.m.mat4.translate(he3d.r.mvMatrix,this.pos);
	} else {
		this.rotx=this.angle[0]-90; // 0 degrees is Up!
		if(this.rotx>360)this.rotx-=360;
		else if(this.rotx<0)this.rotx+=360;
			
		he3d.m.mat4.identity(he3d.r.mvMatrix);
		he3d.m.mat4.rotateX(he3d.r.mvMatrix,he3d.m.degtorad(this.rotx));
		he3d.m.mat4.rotateY(he3d.r.mvMatrix,he3d.m.degtorad(this.angle[1]));
		he3d.m.mat4.translate(he3d.r.mvMatrix,[
			-this.pos[0],
			-this.pos[1],
			-this.pos[2]
		]);
	}
	return this;
};
