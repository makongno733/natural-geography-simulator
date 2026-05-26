import * as THREE from 'three';

/**
 * Animated water surface with wave displacement, Fresnel reflection,
 * and pseudo-environment mapping.
 */

const vertexShader = `
uniform float uTime;
uniform float uWaveHeight;

varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying float vWave;

void main() {
  vec3 pos = position;

  // Multi-octave wave displacement
  float w1 = sin(pos.x * 2.8 + pos.z * 1.9 + uTime * 0.6) * uWaveHeight;
  float w2 = sin(pos.x * 4.2 - pos.z * 3.6 + uTime * 0.9) * uWaveHeight * 0.6;
  float w3 = sin(pos.x * 6.1 + pos.z * 5.3 + uTime * 1.3) * uWaveHeight * 0.35;
  float wave = w1 + w2 + w3;
  vWave = wave / (uWaveHeight * 1.95);

  pos.y += wave;

  // Approximate normal from wave gradients
  float eps = 0.01;
  float wx = (sin((pos.x+eps)*2.8 + pos.z*1.9 + uTime*0.6) - w1) / eps * uWaveHeight;
  float wz = (sin(pos.x*2.8 + (pos.z+eps)*1.9 + uTime*0.6) - w1) / eps * uWaveHeight;
  vec3 waveNormal = normalize(vec3(-wx, 1.0, -wz));

  vec4 worldPos = modelMatrix * vec4(pos, 1.0);
  vWorldPos = worldPos.xyz;
  vWorldNormal = normalize((modelMatrix * vec4(waveNormal, 0.0)).xyz);
  vUv = uv;

  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

const fragmentShader = `
uniform vec3 uDeepColor;
uniform vec3 uShallowColor;
uniform vec3 uSkyReflection;
uniform float uTime;

varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying float vWave;

void main() {
  vec3 viewDir = normalize(cameraPosition - vWorldPos);
  vec3 normal = normalize(vWorldNormal);

  // Fresnel
  float fresnel = 0.04 + 0.96 * pow(1.0 - max(0.0, dot(viewDir, normal)), 4.0);

  // Animated sparkle
  float sparkle = sin(vUv.x * 80.0 + vUv.y * 60.0 + uTime * 1.2) * 0.5 + 0.5;
  sparkle *= sin(vUv.x * 120.0 - vUv.y * 90.0 + uTime * 0.9) * 0.5 + 0.5;
  sparkle = pow(sparkle, 8.0) * 0.15;

  // Pseudo reflection — shift UV with view angle
  vec2 reflUv = vUv * 0.6 + vec2(uTime * 0.008, uTime * 0.003);
  float reflPattern = sin(reflUv.x * 20.0) * cos(reflUv.y * 16.0) * 0.5 + 0.5;
  reflPattern += sin(reflUv.x * 40.0 + reflUv.y * 30.0) * 0.25;

  vec3 reflection = uSkyReflection * (0.6 + 0.4 * reflPattern);

  // Depth-based color (simulated via fresnel)
  vec3 waterColor = mix(uDeepColor, uShallowColor, fresnel * 0.7);

  // Combine
  vec3 color = waterColor + reflection * fresnel * 0.5 + sparkle * vec3(0.8, 0.9, 1.0);

  // Wave crest foam
  float foam = smoothstep(0.55, 0.9, vWave) * 0.2 * (1.0 - fresnel);
  color += foam * vec3(0.9, 0.95, 1.0);

  float alpha = 0.55 + 0.45 * fresnel;

  gl_FragColor = vec4(color, alpha);
}
`;

export function createWaterMaterial(options = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uWaveHeight: { value: options.waveHeight ?? 0.035 },
      uDeepColor: { value: new THREE.Color(options.deepColor ?? '#0a2a3a') },
      uShallowColor: { value: new THREE.Color(options.shallowColor ?? '#1a5a6a') },
      uSkyReflection: { value: new THREE.Color(options.skyReflection ?? '#6a9abf') }
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false
  });
}
