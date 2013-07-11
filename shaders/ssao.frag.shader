precision highp float;

uniform sampler2D uDepth;
uniform sampler2D uNoise;
uniform sampler2D uNormal;

uniform mat4 uinvmvpMatrix;
uniform vec2 uTexelSize;

varying vec2 vTexCoords;

uniform float uOccluderBias;
uniform float uSamplingRadius; 
uniform vec2 uAttenuation;

const float Sin45 = 0.707107;

vec3 posfromdepthtex (float depth, vec2 uv) {
	vec4 worldSpace = uinvmvpMatrix * vec4(uv * 2.0 - 1.0, depth, 1.0);
	worldSpace.xyz /= worldSpace.w;
	return worldSpace.xyz;
}

float SamplePixels (vec3 srcPosition, vec3 srcNormal, vec2 tex_coord) {
	float dstDepth = texture2D(uDepth, tex_coord).r * 2.0 - 1.0;
	vec3 dstPosition = posfromdepthtex(dstDepth, tex_coord);
  
	vec3 positionVec = dstPosition - srcPosition;
	float intensity = max(dot(normalize(positionVec), srcNormal) - uOccluderBias, 0.0);

	float dist = length(positionVec);
	float attn = 1.0 / (uAttenuation.x + (uAttenuation.y * dist));

	return intensity * attn;
}

void main () {
	vec2 randVec	= normalize(texture2D(uNoise, vTexCoords).xy * 2.0 - 1.0);
	vec3 normal		= texture2D(uNormal, vTexCoords).xyz;
	float depth		= texture2D(uDepth, vTexCoords).r * 2.0 - 1.0;
	vec3 position	= posfromdepthtex(depth, vTexCoords.st);

	float kernelRadius = uSamplingRadius * depth;

	vec2 kernel[4];
	kernel[0] = vec2(0.0,  1.0); // top
	kernel[1] = vec2(1.0,  0.0); // right
	kernel[2] = vec2(0.0, -1.0); // bottom
	kernel[3] = vec2(-1.0, 0.0); // left

	float occlusion = 0.0;  
	for (int i = 0; i < 4; ++i)	{
		vec2 k1 = reflect(kernel[i], randVec);
    	vec2 k2 = vec2(k1.x * Sin45 - k1.y * Sin45,	k1.x * Sin45 + k1.y * Sin45);
    
		k1 *= uTexelSize;
		k2 *= uTexelSize;
    
		occlusion += SamplePixels(position, normal, vTexCoords + k1 * kernelRadius);
		occlusion += SamplePixels(position, normal, vTexCoords + k2 * kernelRadius * 0.75);
		occlusion += SamplePixels(position, normal, vTexCoords + k1 * kernelRadius * 0.5);
		occlusion += SamplePixels(position, normal, vTexCoords + k2 * kernelRadius * 0.25);
	}

	occlusion = 1.0 - clamp(occlusion / 16.0, 0.0, 1.0);
	gl_FragColor = vec4(occlusion, occlusion, occlusion, 1.0);
}
