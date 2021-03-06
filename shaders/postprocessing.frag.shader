precision highp float;

#define FILTER_BRIGHTNESSANDCONTRAST false
#define FILTER_SCANLINES false
#define FILTER_VIGNETTE true
#define FILTER_PIXELATE false

#define FXAA_REDUCE_MIN   (1.0/128.0)
#define FXAA_REDUCE_MUL   (1.0/8.0)
#define FXAA_SPAN_MAX     8.0

uniform sampler2D texture;
uniform vec2 uSize;

uniform bool paused;
uniform float vignette;

uniform bool opt_fxaa;

varying vec2 vTextureCoord;

void main (void) {
	vec4 color = texture2D(texture, vTextureCoord.st);

	if (opt_fxaa) {
		vec3 rgbNW = texture2D(texture, (gl_FragCoord.xy + vec2(-1.0, -1.0)) * uSize).xyz;
		vec3 rgbNE = texture2D(texture, (gl_FragCoord.xy + vec2(1.0, -1.0)) * uSize).xyz;
		vec3 rgbSW = texture2D(texture, (gl_FragCoord.xy + vec2(-1.0, 1.0)) * uSize).xyz;
		vec3 rgbSE = texture2D(texture, (gl_FragCoord.xy + vec2(1.0, 1.0)) * uSize).xyz;
		vec3 rgbM = texture2D(texture, gl_FragCoord.xy*uSize).xyz;
		vec3 luma = vec3(0.299, 0.587, 0.114);
		float lumaNW = dot(rgbNW, luma);
		float lumaNE = dot(rgbNE, luma);
		float lumaSW = dot(rgbSW, luma);
		float lumaSE = dot(rgbSE, luma);
		float lumaM = dot(rgbM, luma);
		float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
		float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));
		
		vec2 dir;
		dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
		dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));
		
		float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) *
			(0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);
		
		float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
		dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),
			max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),
			dir * rcpDirMin)) * uSize;
		  
		vec3 rgbA = 0.5 * (
			texture2D(texture, gl_FragCoord.xy * uSize + dir * (1.0 / 3.0 - 0.5)).xyz +
			texture2D(texture, gl_FragCoord.xy * uSize + dir * (2.0 / 3.0 - 0.5)).xyz
		);
		
		vec3 rgbB = rgbA * 0.5 + 0.25 * (
			texture2D(texture, gl_FragCoord.xy * uSize + dir * -0.5).xyz +
			texture2D(texture, gl_FragCoord.xy * uSize + dir * 0.5).xyz
		);
	
		float lumaB = dot(rgbB, luma);
		if ((lumaB < lumaMin) || (lumaB > lumaMax))
			color = vec4(rgbA, 1.0);
		else
			color = vec4(rgbB, 1.0);
	}

	// Vignette
	if (FILTER_VIGNETTE) {
		float dist = distance(vTextureCoord, vec2(0.5, 0.5));
		float amount = max(0.5, vignette);
		color.rgb *= smoothstep(0.8, 0.5 * 0.799, dist * (amount + 0.5));
	}

	if (paused) {
		float average = (color.r + color.g + color.b) / 3.0;
		color.rgb += (average - color.rgb);
		color.rgb -= 0.15;
	}

	gl_FragColor = color;
}
