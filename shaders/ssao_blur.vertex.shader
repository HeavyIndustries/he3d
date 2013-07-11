attribute vec3 aPosition;
attribute vec2 aTexCoords;

uniform mat4 uPMatrix;

varying vec2 vTexCoords;

void main (void) {
	vTexCoords 	= aTexCoords;
	gl_Position = uPMatrix * vec4(aPosition, 1.0);
}

