precision highp float;

uniform sampler2D texture;
uniform vec2 uSize;
uniform bool dir;
uniform bool box;

varying vec2 vTextureCoord;

void main (void) {
	float blurSize = uSize[0];
	vec4 color = vec4(0.0);

	// Single pass box blur
	if (box) {
		float divisor = 0.0;
		for (int x = -2; x <= 2; x++) {
			for (int y = -2; y <= 2; y++) {
				vec2 offset = vec2(x, y);
				float weight = 1.0 - smoothstep(0.0, 3.0, length(offset));
				color += texture2D(texture, vTextureCoord + offset / 256.0) * weight;
				divisor += weight;
			}
		}
		color = vec4(color.rgb / divisor, color.a);

 	// Vertical Guassian
	} else if(dir) {
		color += texture2D(texture, vec2(vTextureCoord.x, vTextureCoord.y - 4.0 * uSize[0])) * 0.05;
		color += texture2D(texture, vec2(vTextureCoord.x, vTextureCoord.y - 3.0 * uSize[0])) * 0.09;
		color += texture2D(texture, vec2(vTextureCoord.x, vTextureCoord.y - 2.0 * uSize[0])) * 0.12;
		color += texture2D(texture, vec2(vTextureCoord.x, vTextureCoord.y - 1.0 * uSize[0])) * 0.15;
		color += texture2D(texture, vec2(vTextureCoord.x, vTextureCoord.y)) * 0.16;
		color += texture2D(texture, vec2(vTextureCoord.x, vTextureCoord.y + 1.0 * uSize[0])) * 0.15;
		color += texture2D(texture, vec2(vTextureCoord.x, vTextureCoord.y + 2.0 * uSize[0])) * 0.12;
		color += texture2D(texture, vec2(vTextureCoord.x, vTextureCoord.y + 3.0 * uSize[0])) * 0.09;
		color += texture2D(texture, vec2(vTextureCoord.x, vTextureCoord.y + 4.0 * uSize[0])) * 0.05;

	// Horizontal Guassian
	} else {
		color += texture2D(texture, vec2(vTextureCoord.x - 4.0 * uSize[1], vTextureCoord.y)) * 0.05;
		color += texture2D(texture, vec2(vTextureCoord.x - 3.0 * uSize[1], vTextureCoord.y)) * 0.09;
		color += texture2D(texture, vec2(vTextureCoord.x - 2.0 * uSize[1], vTextureCoord.y)) * 0.12;
		color += texture2D(texture, vec2(vTextureCoord.x - 1.0 * uSize[1], vTextureCoord.y)) * 0.15;
		color += texture2D(texture, vec2(vTextureCoord.x, vTextureCoord.y)) * 0.16;
		color += texture2D(texture, vec2(vTextureCoord.x + 1.0 * uSize[1], vTextureCoord.y)) * 0.15;
		color += texture2D(texture, vec2(vTextureCoord.x + 2.0 * uSize[1], vTextureCoord.y)) * 0.12;
		color += texture2D(texture, vec2(vTextureCoord.x + 3.0 * uSize[1], vTextureCoord.y)) * 0.09;
		color += texture2D(texture, vec2(vTextureCoord.x + 4.0 * uSize[1], vTextureCoord.y)) * 0.05;
	}
	gl_FragColor = color;
}
