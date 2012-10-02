//
// Math Functions
//

if(typeof(he3d)!='object') // Loaded from a worker
	he3d={};
else
	he3d.log('notice','Include Loaded...','Math');
he3d.m={};

//
// Conversion --------------------------------------------------------------------------------------
//
he3d.m.degtorad=function(deg){return deg*(Math.PI/180);};
he3d.m.radtodeg=function(rad){return rad*(180/Math.PI);};

//
// Test --------------------------------------------------------------------------------------------
//
he3d.m.isPOT=function(x){return (x&(x-1))==0;};

//
// Matrix Functions --------------------------------------------------------------------------------
//	- Heavy Borrowed from GLMatrix! - https://github.com/toji/gl-matrix/
//
/*
 * Copyright (c) 2011 Brandon Jones
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *    1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 *
 *    2. Altered source versions must be plainly marked as such, and must not
 *    be misrepresented as being the original software.
 *
 *    3. This notice may not be removed or altered from any source
 *    distribution.
 */
//
// Matrix 3x3 --------------------------------------------------------------------------------------
//
he3d.m.mat3={};
he3d.m.mat3.create=function(mat){
	var dest=new Float32Array(9);
	if(mat){
		dest[0]=mat[0];
		dest[1]=mat[1];
		dest[2]=mat[2];
		dest[3]=mat[3];
		dest[4]=mat[4];
		dest[5]=mat[5];
		dest[6]=mat[6];
		dest[7]=mat[7];
		dest[8]=mat[8];
	}	
	return dest;
};
he3d.m.mat3.transpose=function(mat,dest){
	if(!dest||mat==dest){ 
		var a01=mat[1],a02=mat[2],a12=mat[5];
		mat[1]=mat[3];
		mat[2]=mat[6];
		mat[3]=a01;
		mat[5]=mat[7];
		mat[6]=a02;
		mat[7]=a12;
		return mat;
	}
	dest[0]=mat[0];
	dest[1]=mat[3];
	dest[2]=mat[6];
	dest[3]=mat[1];
	dest[4]=mat[4];
	dest[5]=mat[7];
	dest[6]=mat[2];
	dest[7]=mat[5];
	dest[8]=mat[8];
	return dest;
};

//
// Matrix 4x4 --------------------------------------------------------------------------------------
//
he3d.m.mat4={};
he3d.m.mat4.create=function(copy){
	var dest=new Float32Array(16);
	if(copy){
		dest[0]=copy[0];
		dest[1]=copy[1];
		dest[2]=copy[2];
		dest[3]=copy[3];
		dest[4]=copy[4];
		dest[5]=copy[5];
		dest[6]=copy[6];
		dest[7]=copy[7];
		dest[8]=copy[8];
		dest[9]=copy[9];
		dest[10]=copy[10];
		dest[11]=copy[11];
		dest[12]=copy[12];
		dest[13]=copy[13];
		dest[14]=copy[14];
		dest[15]=copy[15];
	}
	return dest;
};
he3d.m.mat4.frustum=function(left,right,bottom,top,near,far,dest){
	if(!dest){dest=he3d.m.mat4.create();}
	var rl=(right-left),
		tb=(top-bottom),
		fn=(far-near);
	dest[0]=(near*2)/rl;
	dest[1]=0;
	dest[2]=0;
	dest[3]=0;
	dest[4]=0;
	dest[5]=(near*2)/tb;
	dest[6]=0;
	dest[7]=0;
	dest[8]=(right+left)/rl;
	dest[9]=(top+bottom)/tb;
	dest[10]=-(far+near)/fn;
	dest[11]=-1;
	dest[12]=0;
	dest[13]=0;
	dest[14]=-(far*near*2)/fn;
	dest[15]=0;
	return dest;
};
he3d.m.mat4.identity=function(dest){
	dest[0]=1;
	dest[1]=0;
	dest[2]=0;
	dest[3]=0;
	dest[4]=0;
	dest[5]=1;
	dest[6]=0;
	dest[7]=0;
	dest[8]=0;
	dest[9]=0;
	dest[10]=1;
	dest[11]=0;
	dest[12]=0;
	dest[13]=0;
	dest[14]=0;
	dest[15]=1;
	return dest;
};
he3d.m.mat4.inverse=function(mat,dest){	
	if(!dest){dest=mat;}
	var a00=mat[0], a01=mat[1], a02=mat[2], a03=mat[3],
		a10=mat[4], a11=mat[5], a12=mat[6], a13=mat[7],
		a20=mat[8], a21=mat[9], a22=mat[10], a23=mat[11],
		a30=mat[12], a31=mat[13], a32=mat[14], a33=mat[15],
		b00=a00*a11-a01*a10,
		b01=a00*a12-a02*a10,
		b02=a00*a13-a03*a10,
		b03=a01*a12-a02*a11,
		b04=a01*a13-a03*a11,
		b05=a02*a13-a03*a12,
		b06=a20*a31-a21*a30,
		b07=a20*a32-a22*a30,
		b08=a20*a33-a23*a30,
		b09=a21*a32-a22*a31,
		b10=a21*a33-a23*a31,
		b11=a22*a33-a23*a32,
		invDet=1/(b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06);
	dest[0]=(a11*b11-a12*b10+a13*b09)*invDet;
	dest[1]=(-a01*b11+a02*b10-a03*b09)*invDet;
	dest[2]=(a31*b05-a32*b04+a33*b03)*invDet;
	dest[3]=(-a21*b05+a22*b04-a23*b03)*invDet;
	dest[4]=(-a10*b11+a12*b08-a13*b07)*invDet;
	dest[5]=(a00*b11-a02*b08+a03*b07)*invDet;
	dest[6]=(-a30*b05+a32*b02-a33*b01)*invDet;
	dest[7]=(a20*b05-a22*b02+a23*b01)*invDet;
	dest[8]=(a10*b10-a11*b08+a13*b06)*invDet;
	dest[9]=(-a00*b10+a01*b08-a03*b06)*invDet;
	dest[10]=(a30*b04-a31*b02+a33*b00)*invDet;
	dest[11]=(-a20*b04+a21*b02-a23*b00)*invDet;
	dest[12]=(-a10*b09+a11*b07-a12*b06)*invDet;
	dest[13]=(a00*b09-a01*b07+a02*b06)*invDet;
	dest[14]=(-a30*b03+a31*b01-a32*b00)*invDet;
	dest[15]=(a20*b03-a21*b01+a22*b00)*invDet;	
	return dest;
};
he3d.m.mat4.toInverseMat3=function(mat,dest) {
	var a00=mat[0],a01=mat[1],a02=mat[2],
		a10=mat[4],a11=mat[5],a12=mat[6],
		a20=mat[8],a21=mat[9],a22=mat[10],
		b01=a22*a11-a12*a21,
		b11=-a22*a10+a12*a20,
		b21=a21*a10-a11*a20,
		d=a00*b01+a01*b11+a02*b21;
	if(!d){return null;}
	var id=1/d;
	if(!dest){dest=he3d.m.mat3.create();}
	dest[0]=b01*id;
	dest[1]=(-a22*a01+a02*a21)*id;
	dest[2]=(a12*a01-a02*a11)*id;
	dest[3]=b11*id;
	dest[4]=(a22*a00-a02*a20)*id;
	dest[5]=(-a12*a00+a02*a10)*id;
	dest[6]=b21*id;
	dest[7]=(-a21*a00+a01*a20)*id;
	dest[8]=(a11*a00-a01*a10)*id;
	return dest;
};
he3d.m.mat4.lookAt=function(eye,center,up,dest){
	if(!dest){dest=he3d.m.mat4.create();}
	var x0,x1,x2,y0,y1,y2,z0,z1,z2,len,
		eyex=eye[0],
		eyey=eye[1],
		eyez=eye[2],
		upx=up[0],
		upy=up[1],
		upz=up[2],
		centerx=center[0],
		centery=center[1],
		centerz=center[2];

	if(eyex===centerx&&eyey===centery&&eyez===centerz){
		return he3d.m.mat4.identity(dest);
	}
	z0=eyex-centerx;
	z1=eyey-centery;
	z2=eyez-centerz;

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

	dest[0]=x0;
	dest[1]=y0;
	dest[2]=z0;
	dest[3]=0;
	dest[4]=x1;
	dest[5]=y1;
	dest[6]=z1;
	dest[7]=0;
	dest[8]=x2;
	dest[9]=y2;
	dest[10]=z2;
	dest[11]=0;
	dest[12]=-(x0*eyex+x1*eyey+x2*eyez);
	dest[13]=-(y0*eyex+y1*eyey+y2*eyez);
	dest[14]=-(z0*eyex+z1*eyey+z2*eyez);
	dest[15]=1;

	return dest;
};
he3d.m.mat4.multiply=function(mat,mat2,dest){
	if(!dest){dest=mat};
	var a00=mat[0],a01=mat[1],a02=mat[2],a03=mat[3],
		a10=mat[4],a11=mat[5],a12=mat[6],a13=mat[7],
		a20=mat[8],a21=mat[9],a22=mat[10],a23=mat[11],
		a30=mat[12],a31=mat[13],a32=mat[14],a33=mat[15],
		b00=mat2[0],b01=mat2[1],b02=mat2[2],b03=mat2[3],
		b10=mat2[4],b11=mat2[5],b12=mat2[6],b13=mat2[7],
		b20=mat2[8],b21=mat2[9],b22=mat2[10],b23=mat2[11],
		b30=mat2[12],b31=mat2[13],b32=mat2[14],b33=mat2[15];
	dest[0]=b00*a00+b01*a10+b02*a20+b03*a30;
	dest[1]=b00*a01+b01*a11+b02*a21+b03*a31;
	dest[2]=b00*a02+b01*a12+b02*a22+b03*a32;
	dest[3]=b00*a03+b01*a13+b02*a23+b03*a33;
	dest[4]=b10*a00+b11*a10+b12*a20+b13*a30;
	dest[5]=b10*a01+b11*a11+b12*a21+b13*a31;
	dest[6]=b10*a02+b11*a12+b12*a22+b13*a32;
	dest[7]=b10*a03+b11*a13+b12*a23+b13*a33;
	dest[8]=b20*a00+b21*a10+b22*a20+b23*a30;
	dest[9]=b20*a01+b21*a11+b22*a21+b23*a31;
	dest[10]=b20*a02+b21*a12+b22*a22+b23*a32;
	dest[11]=b20*a03+b21*a13+b22*a23+b23*a33;
	dest[12]=b30*a00+b31*a10+b32*a20+b33*a30;
	dest[13]=b30*a01+b31*a11+b32*a21+b33*a31;
	dest[14]=b30*a02+b31*a12+b32*a22+b33*a32;
	dest[15]=b30*a03+b31*a13+b32*a23+b33*a33;
	return dest;
};
he3d.m.mat4.multiplyVec3=function(mat,vec,dest){
	if(!dest){dest=vec};
	var x=vec[0],y=vec[1],z=vec[2];
	dest[0]=mat[0]*x+mat[4]*y+mat[8]*z+mat[12];
	dest[1]=mat[1]*x+mat[5]*y+mat[9]*z+mat[13];
	dest[2]=mat[2]*x+mat[6]*y+mat[10]*z+mat[14];
	return dest;
};
he3d.m.mat4.perspective=function(fovy,aspect,near,far,dest){
	var top=near*Math.tan(fovy*Math.PI/360.0);
	var right=top*aspect;
	return he3d.m.mat4.frustum(-right,right,-top,top,near,far,dest);
};
he3d.m.mat4.ortho=function(left,right,bottom,top,near,far,dest){
	if(!dest){dest=he3d.m.mat4.create();}
	var rl=(right-left),
		tb=(top-bottom),
		fn=(far-near);
	dest[0]=2/rl;
	dest[1]=0;
	dest[2]=0;
	dest[3]=0;
	dest[4]=0;
	dest[5]=2/tb;
	dest[6]=0;
	dest[7]=0;
	dest[8]=0;
	dest[9]=0;
	dest[10]=-2/fn;
	dest[11]=0;
	dest[12]=-(left+right)/rl;
	dest[13]=-(top+bottom)/tb;
	dest[14]=-(far+near)/fn;
	dest[15]=1;
	return dest;
};
he3d.m.mat4.rotate=function(mat,angle,axis,dest){
	var x=axis[0],y=axis[1],z=axis[2],
		len=Math.sqrt(x*x+y*y+z*z),
		s,c,t,
		a00,a01,a02,a03,
		a10,a11,a12,a13,
		a20,a21,a22,a23,
		b00,b01,b02,
		b10,b11,b12,
		b20,b21,b22;
	
	if(!len){return null;}
	if(len!==1){
		len=1/len;
		x*=len;
		y*=len;
		z*=len;
	}
	
	s=Math.sin(angle);
	c=Math.cos(angle);
	t=1-c;
	
	a00=mat[0];a01=mat[1];a02=mat[2];a03=mat[3];
	a10=mat[4];a11=mat[5];a12=mat[6];a13=mat[7];
	a20=mat[8];a21=mat[9];a22=mat[10];a23=mat[11];
	
	b00=x*x*t+c;b01=y*x*t+z*s;b02=z*x*t-y*s;
	b10=x*y*t-z*s;b11=y*y*t+c;b12=z*y*t+x*s;
	b20=x*z*t+y*s;b21=y*z*t-x*s;b22=z*z*t+c;
	
	if(!dest){
		dest=mat;
	}else if(mat!==dest){
		dest[12]=mat[12];
		dest[13]=mat[13];
		dest[14]=mat[14];
		dest[15]=mat[15];
	}
	dest[0]=a00*b00+a10*b01+a20*b02;
	dest[1]=a01*b00+a11*b01+a21*b02;
	dest[2]=a02*b00+a12*b01+a22*b02;
	dest[3]=a03*b00+a13*b01+a23*b02;
	
	dest[4]=a00*b10+a10*b11+a20*b12;
	dest[5]=a01*b10+a11*b11+a21*b12;
	dest[6]=a02*b10+a12*b11+a22*b12;
	dest[7]=a03*b10+a13*b11+a23*b12;
	
	dest[8]=a00*b20+a10*b21+a20*b22;
	dest[9]=a01*b20+a11*b21+a21*b22;
	dest[10]=a02*b20+a12*b21+a22*b22;
	dest[11]=a03*b20+a13*b21+a23*b22;
	return dest;
};
he3d.m.mat4.rotateX=function(mat,angle,dest){
	var s=Math.sin(angle),
		c=Math.cos(angle),
		a10=mat[4],a11=mat[5],a12=mat[6],a13=mat[7],
		a20=mat[8],a21=mat[9],a22=mat[10],a23=mat[11];
	if(!dest){
		dest=mat; 
	}else if(mat!=dest){
		dest[0]=mat[0];
		dest[1]=mat[1];
		dest[2]=mat[2];
		dest[3]=mat[3];
		dest[12]=mat[12];
		dest[13]=mat[13];
		dest[14]=mat[14];
		dest[15]=mat[15];
	}
	dest[4]=a10*c+a20*s;
	dest[5]=a11*c+a21*s;
	dest[6]=a12*c+a22*s;
	dest[7]=a13*c+a23*s;
	dest[8]=a10*-s+a20*c;
	dest[9]=a11*-s+a21*c;
	dest[10]=a12*-s+a22*c;
	dest[11]=a13*-s+a23*c;
	return dest;
};
he3d.m.mat4.rotateY=function(mat,angle,dest){
	var s=Math.sin(angle),
		c=Math.cos(angle),
		a00=mat[0],a01=mat[1],a02=mat[2],a03=mat[3],
		a20=mat[8],a21=mat[9],a22=mat[10],a23=mat[11];
	if(!dest){ 
		dest=mat;
	}else if(mat!=dest){
		dest[4]=mat[4];
		dest[5]=mat[5];
		dest[6]=mat[6];
		dest[7]=mat[7];
		dest[12]=mat[12];
		dest[13]=mat[13];
		dest[14]=mat[14];
		dest[15]=mat[15];
	}	
	dest[0]=a00*c+a20*-s;
	dest[1]=a01*c+a21*-s;
	dest[2]=a02*c+a22*-s;
	dest[3]=a03*c+a23*-s;
	dest[8]=a00*s+a20*c;
	dest[9]=a01*s+a21*c;
	dest[10]=a02*s+a22*c;
	dest[11]=a03*s+a23*c;
	return dest;
};
he3d.m.mat4.rotateZ=function(mat,angle,dest){
	var s=Math.sin(angle),
		c=Math.cos(angle),
		a00=mat[0],a01=mat[1],a02=mat[2],a03=mat[3],
		a10=mat[4],a11=mat[5],a12=mat[6],a13=mat[7];
	if(!dest){ 
		dest=mat;
	}else if(mat!=dest){
		dest[8]=mat[8];
		dest[9]=mat[9];
		dest[10]=mat[10];
		dest[11]=mat[11];
		dest[12]=mat[12];
		dest[13]=mat[13];
		dest[14]=mat[14];
		dest[15]=mat[15];
	}
	dest[0]=a00*c+a10*s;
	dest[1]=a01*c+a11*s;
	dest[2]=a02*c+a12*s;
	dest[3]=a03*c+a13*s;
	dest[4]=a00*-s+a10*c;
	dest[5]=a01*-s+a11*c;
	dest[6]=a02*-s+a12*c;
	dest[7]=a03*-s+a13*c;
	return dest;
};
he3d.m.mat4.set=function(copy,dest){
	dest[0]=copy[0];
	dest[1]=copy[1];
	dest[2]=copy[2];
	dest[3]=copy[3];
	dest[4]=copy[4];
	dest[5]=copy[5];
	dest[6]=copy[6];
	dest[7]=copy[7];
	dest[8]=copy[8];
	dest[9]=copy[9];
	dest[10]=copy[10];
	dest[11]=copy[11];
	dest[12]=copy[12];
	dest[13]=copy[13];
	dest[14]=copy[14];
	dest[15]=copy[15];
	return dest;
};
he3d.m.mat4.translate=function(mat,vec,dest){
	var x=vec[0],y=vec[1],z=vec[2];
	if(!dest||mat==dest){
		mat[12]=mat[0]*x+mat[4]*y+mat[8]*z+mat[12];
		mat[13]=mat[1]*x+mat[5]*y+mat[9]*z+mat[13];
		mat[14]=mat[2]*x+mat[6]*y+mat[10]*z+mat[14];
		mat[15]=mat[3]*x+mat[7]*y+mat[11]*z+mat[15];
		return mat;
	}
	var a00=mat[0],a01=mat[1],a02=mat[2],a03=mat[3],
		a10=mat[4],a11=mat[5],a12=mat[6],a13=mat[7],
		a20=mat[8],a21=mat[9],a22=mat[10],a23=mat[11];
	dest[0]=a00;
	dest[1]=a01;
	dest[2]=a02;
	dest[3]=a03;
	dest[4]=a10;
	dest[5]=a11;
	dest[6]=a12;
	dest[7]=a13;
	dest[8]=a20;
	dest[9]=a21;
	dest[10]=a22;
	dest[11]=a23;
	dest[12]=a00*x+a10*y+a20*z+mat[12];
	dest[13]=a01*x+a11*y+a21*z+mat[13];
	dest[14]=a02*x+a12*y+a22*z+mat[14];
	dest[15]=a03*x+a13*y+a23*z+mat[15];
	return dest;
};
he3d.m.mat4.transpose=function(mat,dest){
	if (!dest || mat === dest) {
		var a01 = mat[1], a02 = mat[2], a03 = mat[3],
			a12 = mat[6], a13 = mat[7],
			a23 = mat[11];

		mat[1] = mat[4];
		mat[2] = mat[8];
		mat[3] = mat[12];
		mat[4] = a01;
		mat[6] = mat[9];
		mat[7] = mat[13];
		mat[8] = a02;
		mat[9] = a12;
		mat[11] = mat[14];
		mat[12] = a03;
		mat[13] = a13;
		mat[14] = a23;
		return mat;
	}

	dest[0] = mat[0];
	dest[1] = mat[4];
	dest[2] = mat[8];
	dest[3] = mat[12];
	dest[4] = mat[1];
	dest[5] = mat[5];
	dest[6] = mat[9];
	dest[7] = mat[13];
	dest[8] = mat[2];
	dest[9] = mat[6];
	dest[10] = mat[10];
	dest[11] = mat[14];
	dest[12] = mat[3];
	dest[13] = mat[7];
	dest[14] = mat[11];
	dest[15] = mat[15];
	return dest;
};

//
// Quaternions -------------------------------------------------------------------------------------
//
he3d.m.quat4={};
he3d.m.quat4.axisAngleCreate=function(x,y,z,angle){
	var a2=angle/2.0;
	var sin2=Math.sin(a2);
	return new Float32Array([x*sin2,y*sin2,z*sin2,Math.cos(a2)]);
};
he3d.m.quat4.eulerAngleCreate=function(x,y,z){
	var q=[0,0,0,0];
	var radiansX=he3d.m.degtorad(x);
	var radiansY=he3d.m.degtorad(y);
	var radiansZ=he3d.m.degtorad(z);
	var cX=Math.cos(radiansX*0.5);
	var cY=Math.cos(radiansY*0.5);
	var cZ=Math.cos(radiansZ*0.5);	
	var sX=Math.sin(radiansX*0.5);
	var sY=Math.sin(radiansY*0.5);
	var sZ=Math.sin(radiansZ*0.5);

	// XYZ
	q[3]=cX*cY*cZ+sX*sY*sZ;	// w
	q[0]=sX*cY*cZ-cX*sY*sZ;	// x
	q[1]=cX*sY*cZ+sX*cY*sZ;	// y
	q[2]=cX*cY*sZ-sX*sY*cZ;	// z

	return q;
};
he3d.m.quat4.fromAngleAxis=function(angle,axis,dest){
	if(!dest)dest=he3d.m.vec4.create();
	var half=angle*0.5;
	var s=Math.sin(half);
	dest[3]=Math.cos(half);
	dest[0]=s*axis[0];
	dest[1]=s*axis[1];
	dest[2]=s*axis[2];
	return dest;
};
he3d.m.quat4.inverse=function(quat,dest){
	var q0=quat[0],q1=quat[1],q2=quat[2],q3=quat[3],
		dot=q0*q0+q1*q1+q2*q2+q3*q3,
		invDot=dot?1.0/dot:0;
	if(!dest||quat===dest){
		quat[0]*=-invDot;
		quat[1]*=-invDot;
		quat[2]*=-invDot;
		quat[3]*=invDot;
		return quat;
	}
	dest[0]=-quat[0]*invDot;
	dest[1]=-quat[1]*invDot;
	dest[2]=-quat[2]*invDot;
	dest[3]=quat[3]*invDot;
	return dest;
};
he3d.m.quat4.multiply=function(quat,quat2,dest){
	if(!dest){dest=quat;}
	var qax=quat[0],qay=quat[1],qaz=quat[2],qaw=quat[3];
	var qbx=quat2[0],qby=quat2[1],qbz=quat2[2],qbw=quat2[3];
	dest[0]=qax*qbw+qaw*qbx+qay*qbz-qaz*qby;
	dest[1]=qay*qbw+qaw*qby+qaz*qbx-qax*qbz;
	dest[2]=qaz*qbw+qaw*qbz+qax*qby-qay*qbx;
	dest[3]=qaw*qbw-qax*qbx-qay*qby-qaz*qbz;
	return dest;
};
he3d.m.quat4.multiplyVec3=function(quat,vec,dest){
	if(!dest){dest=vec;}
	var x=vec[0],y=vec[1],z=vec[2],
		qx=quat[0],qy=quat[1],qz=quat[2],qw=quat[3],
		ix=qw*x+qy*z-qz*y,
		iy=qw*y+qz*x-qx*z,
		iz=qw*z+qx*y-qy*x,
		iw=-qx*x-qy*y-qz*z;
	dest[0]=ix*qw+iw*-qx+iy*-qz-iz*-qy;
	dest[1]=iy*qw+iw*-qy+iz*-qx-ix*-qz;
	dest[2]=iz*qw+iw*-qz+ix*-qy-iy*-qx;
	return dest;
};
he3d.m.quat4.normalize=function(quat,dest){
	if(!dest){dest=quat;}
	var x=quat[0],y=quat[1],z=quat[2],w=quat[3],
		len=Math.sqrt(x*x+y*y+z*z+w*w);
	if(len===0){
		dest[0]=0;
		dest[1]=0;
		dest[2]=0;
		dest[3]=0;
		return dest;
	}
	len=1/len;
	dest[0]=x*len;
	dest[1]=y*len;
	dest[2]=z*len;
	dest[3]=w*len;
	return dest;
};
he3d.m.quat4.toMat4_broke=function(quat,dest){
	if(!dest){dest=he3d.m.mat4.create();}
	var x=quat[0],y=quat[1],z=quat[2],w=quat[3],
		x2=x+x,
		y2=y+y,
		z2=z+z,
		xx=x*x2,
		xy=x*y2,
		xz=x*z2,
		yy=y*y2,
		yz=y*z2,
		zz=z*z2,
		wx=w*x2,
		wy=w*y2,
		wz=w*z2;
	dest[0]=1-(yy+zz);
	dest[1]=xy-wz;
	dest[2]=xz+wy;
	dest[3]=0;
	dest[4]=xy+wz;
	dest[5]=1-(xx+zz);
	dest[6]=yz-wx;
	dest[7]=0;
	dest[8]=xz-wy;
	dest[9]=yz+wx;
	dest[10]=1-(xx+yy);
	dest[11]=0;
	dest[12]=0;
	dest[13]=0;
	dest[14]=0;
	dest[15]=1;
	return dest;
};
he3d.m.quat4.toMat4=function(quat,dest){
	if(!dest){dest=he3d.m.mat4.create();}
	var x=quat[0],y=quat[1],z=quat[2],w=quat[3],
		x2=x+x,
		y2=y+y,
		z2=z+z,
		xx=x*x2,
		xy=x*y2,
		xz=x*z2,
		yy=y*y2,
		yz=y*z2,
		zz=z*z2,
		wx=w*x2,
		wy=w*y2,
		wz=w*z2;
	dest[0]=1-(yy+zz);
	dest[1]=xy+wz;
	dest[2]=xz-wy;
	dest[3]=0;
	
	dest[4]=xy-wz;
	dest[5]=1-(xx+zz);
	dest[6]=yz+wx;
	dest[7]=0;
	
	dest[8]=xz+wy;
	dest[9]=yz-wx;
	dest[10]=1-(xx+yy);
	dest[11]=0;
	
	dest[12]=0;
	dest[13]=0;
	dest[14]=0;
	dest[15]=1;
	return dest;
};
he3d.m.quat4.set=function(quat,dest){
	dest[0]=quat[0];
	dest[1]=quat[1];
	dest[2]=quat[2];
	dest[3]=quat[3];
	return dest;
};
he3d.m.quat4.slerp=function(quat,quat2,slerp,dest){
	if(!dest){dest=quat;}

	var cosHalfTheta=quat[0]*quat2[0]+quat[1]*quat2[1]+quat[2]*quat2[2]+quat[3]*quat2[3],
		halfTheta,
		sinHalfTheta,
		ratioA,
		ratioB;

	if(Math.abs(cosHalfTheta)>=1.0){
		if(dest!==quat){
			dest[0]=quat[0];
			dest[1]=quat[1];
			dest[2]=quat[2];
			dest[3]=quat[3];
		}
		return dest;
	}

	halfTheta=Math.acos(cosHalfTheta);
	sinHalfTheta=Math.sqrt(1.0-cosHalfTheta*cosHalfTheta);

	if(Math.abs(sinHalfTheta)<0.001){
		dest[0]=(quat[0]*0.5+quat2[0]*0.5);
		dest[1]=(quat[1]*0.5+quat2[1]*0.5);
		dest[2]=(quat[2]*0.5+quat2[2]*0.5);
		dest[3]=(quat[3]*0.5+quat2[3]*0.5);
		return dest;
	}

	ratioA=Math.sin((1-slerp)*halfTheta)/sinHalfTheta;
	ratioB=Math.sin(slerp*halfTheta)/sinHalfTheta;

	dest[0]=(quat[0]*ratioA+quat2[0]*ratioB);
	dest[1]=(quat[1]*ratioA+quat2[1]*ratioB);
	dest[2]=(quat[2]*ratioA+quat2[2]*ratioB);
	dest[3]=(quat[3]*ratioA+quat2[3]*ratioB);

	return dest;
};

//
// Vector ------------------------------------------------------------------------------------------
//
he3d.m.vec2={};
he3d.m.vec2.create=function(vec){
	var dest=new Float32Array(2);
	if(vec){
		dest[0]=vec[0];
		dest[1]=vec[1];
	}
	return dest;
};
he3d.m.vec2.add=function(vec,vec2,dest){
	if(!dest||vec==dest){
		vec[0]+=vec2[0];
		vec[1]+=vec2[1];
		return vec;
	}
	dest[0]=vec[0]+vec2[0];
	dest[1]=vec[1]+vec2[1];
	return dest;
};
he3d.m.vec2.subtract=function(vec,vec2,dest){
	if(!dest||vec==dest){
		vec[0]-=vec2[0];
		vec[1]-=vec2[1];
		return vec;
	}
	dest[0]=vec[0]-vec2[0];
	dest[1]=vec[1]-vec2[1];
	return dest;
};

he3d.m.vec3={};
he3d.m.vec3.add=function(vec,vec2,dest){
	if(!dest||vec==dest){
		vec[0]+=vec2[0];
		vec[1]+=vec2[1];
		vec[2]+=vec2[2];
		return vec;
	}
	dest[0]=vec[0]+vec2[0];
	dest[1]=vec[1]+vec2[1];
	dest[2]=vec[2]+vec2[2];
	return dest;
};
he3d.m.vec3.create=function(vec){
	var dest=new Float32Array(3);
	if(vec){
		dest[0]=vec[0];
		dest[1]=vec[1];
		dest[2]=vec[2];
	}
	return dest;
};
he3d.m.vec3.cross=function(vec,vec2,dest){
	if(!dest){dest=vec;}
	var x=vec[0],y=vec[1],z=vec[2];
	var x2=vec2[0],y2=vec2[1],z2=vec2[2];
	dest[0]=(y*z2)-(z*y2);
	dest[1]=(z*x2)-(x*z2);
	dest[2]=(x*y2)-(y*x2);
	return dest;
};
he3d.m.vec3.dot=function(vec,vec2){
	return vec[0]*vec2[0]+vec[1]*vec2[1]+vec[2]*vec2[2];
};
he3d.m.vec3.direction=function(vec,vec2,dest){
	if(!dest){dest=vec;}
	var x=vec[0]-vec2[0];
	var y=vec[1]-vec2[1];
	var z=vec[2]-vec2[2];
	var len=Math.sqrt(x*x+y*y+z*z);
	if(!len){
		dest[0]=0;
		dest[1]=0;
		dest[2]=0;
		return dest;
	}
	len=1/len;
	dest[0]=x*len;
	dest[1]=y*len;
	dest[2]=z*len;
	return dest;
};
he3d.m.vec3.dist=function(vec,vec2){
	var x=vec2[0]-vec[0],
		y=vec2[1]-vec[1],
		z=vec2[2]-vec[2];
	return Math.sqrt(x*x+y*y+z*z);
};
he3d.m.vec3.length=function(vec){
	var x=vec[0],y=vec[1],z=vec[2];
	return Math.sqrt(x*x+y*y+z*z);
};
he3d.m.vec3.lerp=function(vec,vec2,lerp,dest){
	if(!dest){dest=vec;}
	dest[0]=vec[0]+lerp*(vec2[0]-vec[0]);
	dest[1]=vec[1]+lerp*(vec2[1]-vec[1]);
	dest[2]=vec[2]+lerp*(vec2[2]-vec[2]);
	return dest;
};
he3d.m.vec3.multiply=function(vec,vec2,dest){
	if(!dest||vec==dest){
		vec[0]*=vec2[0];
		vec[1]*=vec2[1];
		vec[2]*=vec2[2];
		return vec;
	}	
	dest[0]=vec[0]*vec2[0];
	dest[1]=vec[1]*vec2[1];
	dest[2]=vec[2]*vec2[2];
	return dest;
};
he3d.m.vec3.negate=function(vec,dest){
    if(!dest){dest=vec;}
    dest[0]=-vec[0];
    dest[1]=-vec[1];
    dest[2]=-vec[2];
    return dest;
};
he3d.m.vec3.normalize=function(vec,dest){
	if(!dest){dest=vec;}
	var x=vec[0],y=vec[1],z=vec[2];
	var len=Math.sqrt(x*x+y*y+z*z);
	if(!len){
		dest[0]=0;
		dest[1]=0;
		dest[2]=0;
		return dest;
	}else if(len==1){
		dest[0]=x;
		dest[1]=y;
		dest[2]=z;
		return dest;
	}	
	len=1/len;
	dest[0]=x*len;
	dest[1]=y*len;
	dest[2]=z*len;
	return dest;
};
he3d.m.vec3.rotationTo=function (a, b, dest) {
	if (!dest) { dest = he3d.m.quat4.create(); }
	
	var d = he3d.m.vec3.dot(a, b);
	var axis = he3d.m.vec3.create();;
	if (d >= 1.0) {
		he3d.m.quat4.set([0,0,0,1], dest);
	} else if (d < (0.000001 - 1.0)) {
		he3d.m.vec3.cross([1,0,0], a, axis);
		if (he3d.m.vec3.length(axis) < 0.000001)
			he3d.m.vec3.cross([0,1,0], a, axis);
		if (he3d.m.vec3.length(axis) < 0.000001)
			he3d.m.vec3.cross([0,0,1], a, axis);
		he3d.m.vec3.normalize(axis);
		he3d.m.quat4.fromAngleAxis(Math.PI, axis, dest);
	} else {
		var s = Math.sqrt((1.0 + d) * 2.0);
		var sInv = 1.0 / s;
		he3d.m.vec3.cross(a, b, axis);
		dest[0] = axis[0] * sInv;
		dest[1] = axis[1] * sInv;
		dest[2] = axis[2] * sInv;
		dest[3] = s * 0.5;
		he3d.m.quat4.normalize(dest);
	}
	if (dest[3] > 1.0) dest[3] = 1.0;
	else if (dest[3] < -1.0) dest[3] = -1.0;
	return dest;
};
he3d.m.vec3.set=function(vec,dest){
	dest[0]=vec[0];
	dest[1]=vec[1];
	dest[2]=vec[2];
	return dest;
};
he3d.m.vec3.subtract=function(vec,vec2,dest){
	if(!dest||vec==dest){
		vec[0]-=vec2[0];
		vec[1]-=vec2[1];
		vec[2]-=vec2[2];
		return vec;
	}	
	dest[0]=vec[0]-vec2[0];
	dest[1]=vec[1]-vec2[1];
	dest[2]=vec[2]-vec2[2];
	return dest;
};

he3d.m.vec4={};
he3d.m.vec4.create=function(vec){
	var dest=new Float32Array(4);
	if(vec){
		dest[0]=vec[0];
		dest[1]=vec[1];
		dest[2]=vec[2];
		dest[3]=vec[3];
	}
	return dest;
};

//
// Collision/Intersection Detection ----------------------------------------------------------------
//

//
// Axis Aligned Bounding Box vs Sphere
//	- p box position
//	- aabb bounding box
//	- sp sphere position
//	- sr sphere radius
//
he3d.m.AABBvsSphere=function(p,aabb,sp,sr){
	var sepAxis=he3d.m.vec3.create();
	if(he3d.m.vec3.length(p)<he3d.m.vec3.length(sp))
		he3d.m.vec3.subtract(sp,p,sepAxis);
	else
		he3d.m.vec3.subtract(p,sp,sepAxis);

	var dist=he3d.m.vec3.length(sepAxis);
	he3d.m.vec3.normalize(sepAxis);

	if(sepAxis[0]>=sepAxis[1]&&sepAxis[0]>=sepAxis[2]){
		sepAxis[0]/=sepAxis[0];
		sepAxis[1]/=sepAxis[0];
		sepAxis[2]/=sepAxis[0];	
	}else if(sepAxis[1]>=sepAxis[0]&&sepAxis[1]>=sepAxis[2]){
		sepAxis[0]/=sepAxis[1];
		sepAxis[1]/=sepAxis[1];
		sepAxis[2]/=sepAxis[1];
	}else{
		sepAxis[0]/=sepAxis[2];
		sepAxis[1]/=sepAxis[2];
		sepAxis[2]/=sepAxis[2];
	}

	sepAxis[0]*=(Math.abs(aabb.x.min-aabb.x.max))/2;
	sepAxis[1]*=(Math.abs(aabb.y.min-aabb.y.max))/2;
	sepAxis[2]*=(Math.abs(aabb.z.min-aabb.z.max))/2;
		
	if(dist<=(sr+he3d.m.vec3.length(sepAxis)))
		return true;
	return false;
};

//
// Point vs AABB
//
he3d.m.pointvsAABB=function(p,aabbp,aabb){
	return (p[0]>aabbp[0]+aabb.x.min&&p[0]<aabbp[0]+aabb.x.max)&&
		(p[1]>aabbp[1]+aabb.y.min&&p[1]<aabbp[1]+aabb.y.max)&&
		(p[2]>aabbp[2]+aabb.z.min&&p[2]<aabbp[2]+aabb.z.max);
};

//
// Point vs Sphere
//
he3d.m.pointvsSphere=function(p,sp,sr){
	if(he3d.m.vec3.dist(p,sp)<=sr)
		return true;
	return false;
};


//
// Quick and dirty maths.
//

he3d.m.dirtycos = function(x) {
  var x2 = x*x,
      x4 = x2*x2,
      x6 = x4*x2,
      x8 = x6*x2;
  return 1
         - x2 / 2
         + x4 / 24
         - x6 / 720
         + x8 / 40824;
};


he3d.m.dirtysin=function(x){
	return he3d.m.dirtycos (x + 1.570796326794896);
};
