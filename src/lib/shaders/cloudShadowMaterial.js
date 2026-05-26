import * as THREE from 'three';

/**
 * Cloud shadow overlay — a large dark semi-transparent plane with
 * procedural noise pattern that drifts slowly across the terrain.
 */

const vertexShader = `
varying vec2 vUv;
varying vec3 vPos;
void main() {
  vUv = uv;
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform float uOpacity;

varying vec2 vUv;
varying vec3 vPos;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.6;
  vec2 shift = vec2(100.0);
  mat2 rot = mat2(cos(0.6), sin(0.6), -sin(0.6), cos(0.6));
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = rot * p * 1.8 + shift;
    a *= 0.5;
  }
  return v;
}

void main() {
  // Slow drift
  vec2 uv = vUv * 1.8 + vec2(uTime * 0.012, uTime * 0.006);

  float cloud = fbm(uv);
  cloud = smoothstep(0.28, 0.72, cloud);

  // Softer edges near viewport edges
  float edge = 1.0 - smoothstep(0.05, 0.3, abs(vUv.x - 0.5) * 2.0);
  edge *= 1.0 - smoothstep(0.05, 0.3, abs(vUv.y - 0.5) * 2.0);

  float alpha = cloud * uOpacity * edge;
  float brightness = 1.0 - alpha * 0.55;

  gl_FragColor = vec4(vec3(brightness), alpha * 0.5);
}
`;

export function createCloudShadowMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0.5 }
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.MultiplyBlending
  });
}
