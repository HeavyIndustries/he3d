precision highp float;

uniform sampler2D uTex;

varying vec2 vTexCoords;

void main (void) {
	vec4 color = vec4(0.0);
	float divisor = 0.0;
	for(int x = -2; x <= 2; x++){
		for(int y = -2; y <= 2; y++){
			vec2 offset = vec2(x, y);
			float weight = 1.0 - smoothstep(0.0, 3.0, length(offset));
			color += texture2D(uTex, vTexCoords + offset / 384.0) * weight;
			divisor += weight;
		}
	}
	gl_FragColor = vec4(color.rgb / divisor, color.a);
}
