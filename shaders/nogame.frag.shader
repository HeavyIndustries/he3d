precision highp float;

uniform sampler2D texture;
varying vec2 vTextureCoord;

uniform vec2 uSize;
uniform float angle;

// Zoom blur modifed from http://evanw.github.com/glfx.js/demo/
float random (vec3 scale, float seed) {
	return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

void main () {
	vec4 color = vec4(0.0);
	float total = 0.0;
	float strength = 0.025;
	vec2 center = vec2(1.0 * uSize[0] * cos(angle), 1.0 * uSize[1] * sin(angle));
	vec2 toCenter = center - vTextureCoord * uSize;
	float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);
	for (float t = 0.0; t <= 40.0; t++) {
		float percent = (t + offset) / 40.0;
		float weight = 4.0 * (percent - percent * percent);
		vec4 sample = texture2D(texture, vTextureCoord + toCenter * percent * strength / uSize);
		sample.rgb *= sample.a;
		color += sample * weight;
		total += weight;
	}
	
	gl_FragColor = color / total;
	gl_FragColor.rgb /= gl_FragColor.a + 0.00001;
}
