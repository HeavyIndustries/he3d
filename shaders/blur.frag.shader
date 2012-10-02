precision mediump float;

#define blurSize (1.0/512.0)

uniform sampler2D texture;
uniform bool dir;

varying vec2 vTextureCoord;

void main (void) {
	vec4 color=vec4(0.0);

 	// Vertical
	if(dir){
		color+=texture2D(texture,vec2(vTextureCoord.x,vTextureCoord.y-4.0*blurSize))*0.05;
		color+=texture2D(texture,vec2(vTextureCoord.x,vTextureCoord.y-3.0*blurSize))*0.09;
		color+=texture2D(texture,vec2(vTextureCoord.x,vTextureCoord.y-2.0*blurSize))*0.12;
		color+=texture2D(texture,vec2(vTextureCoord.x,vTextureCoord.y-1.0*blurSize))*0.15;
		color+=texture2D(texture,vec2(vTextureCoord.x,vTextureCoord.y))*0.16;
		color+=texture2D(texture,vec2(vTextureCoord.x,vTextureCoord.y+1.0*blurSize))*0.15;
		color+=texture2D(texture,vec2(vTextureCoord.x,vTextureCoord.y+2.0*blurSize))*0.12;
		color+=texture2D(texture,vec2(vTextureCoord.x,vTextureCoord.y+3.0*blurSize))*0.09;
		color+=texture2D(texture,vec2(vTextureCoord.x,vTextureCoord.y+4.0*blurSize))*0.05;		

	// Horizontal
	} else {
		color+=texture2D(texture,vec2(vTextureCoord.x-4.0*blurSize,vTextureCoord.y))*0.05;
		color+=texture2D(texture,vec2(vTextureCoord.x-3.0*blurSize,vTextureCoord.y))*0.09;
		color+=texture2D(texture,vec2(vTextureCoord.x-2.0*blurSize,vTextureCoord.y))*0.12;
		color+=texture2D(texture,vec2(vTextureCoord.x-1.0*blurSize,vTextureCoord.y))*0.15;
		color+=texture2D(texture,vec2(vTextureCoord.x,vTextureCoord.y))*0.16;
		color+=texture2D(texture,vec2(vTextureCoord.x+1.0*blurSize,vTextureCoord.y))*0.15;
		color+=texture2D(texture,vec2(vTextureCoord.x+2.0*blurSize,vTextureCoord.y))*0.12;
		color+=texture2D(texture,vec2(vTextureCoord.x+3.0*blurSize,vTextureCoord.y))*0.09;
		color+=texture2D(texture,vec2(vTextureCoord.x+4.0*blurSize,vTextureCoord.y))*0.05;
	}
	gl_FragColor=color;
}
