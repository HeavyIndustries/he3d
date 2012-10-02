precision mediump float;
uniform float uType;

void main(void) {
	gl_FragColor=vec4(gl_FragCoord.z,uType,0.0,1.0);
}
