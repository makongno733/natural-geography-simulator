import * as THREE from 'three';

/**
 * Custom terrain shader material.
 * Per-pixel procedural texturing based on elevation and slope.
 * Blends 5 biomes: low vegetation, grassland, earth/soil, rock, snow.
 * Slope modifies rock exposure. Procedural noise adds organic variation.
 */

const vertexShader = `
varying float vElevation;
varying float vSlope;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

uniform float uMinHeight;
uniform float uMaxHeight;

void main() {
  vPosition = position;
  vUv = uv;
  vElevation = (position.y - uMinHeight) / (uMaxHeight - uMinHeight);
  vec3 norm = normalize(normalMatrix * normal);
  vNormal = norm;
  vSlope = 1.0 - abs(norm.y);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying float vElevation;
varying float vSlope;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

uniform float uWeatherFactor;
uniform vec3 uSunDirection;
uniform float uTime;
uniform vec3 uBiomeBias;

// 2D simplex noise (Ashima Arts)
vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g = vec3(a0.x*x0.x + h.x*x0.y, a0.y*x12.x + h.y*x12.y, a0.z*x12.z + h.z*x12.w);
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 4; i++) {
    v += a * snoise(p);
    p = rot * p * 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  float elevation = clamp(vElevation, 0.0, 1.0);
  float slope = clamp(vSlope, 0.0, 1.0);

  // Detail noise at multiple scales
  float largeNoise = fbm(vPosition.xz * 2.5) * 0.06;
  float medNoise = snoise(vPosition.xz * 7.0 + uTime * 0.002) * 0.04;
  float fineNoise = snoise(vPosition.xz * 18.0 + uTime * 0.005) * 0.025;
  float detail = largeNoise + medNoise + fineNoise;

  float e = elevation + detail;

  // --- Biome colors (linear-ish RGB) ---
  vec3 lowVeg  = vec3(0.12, 0.32, 0.17);   // dense vegetation
  vec3 grass   = vec3(0.28, 0.48, 0.26);   // grassland
  vec3 earth   = vec3(0.52, 0.43, 0.27);   // soil / earth
  vec3 rock    = vec3(0.47, 0.39, 0.30);   // weathered rock
  vec3 bareRock= vec3(0.58, 0.52, 0.44);   // bare rock
  vec3 snow    = vec3(0.98, 0.97, 0.94);   // snow

  // --- Elevation blending (shifted by module biome bias) ---
  float b1 = 0.08 + uBiomeBias.x;
  float b2 = 0.28 + uBiomeBias.x;
  float b3 = 0.22 + uBiomeBias.y;
  float b4 = 0.42 + uBiomeBias.y;
  float b5 = 0.38 + uBiomeBias.z;
  float b6 = 0.58 + uBiomeBias.z;
  float b7 = 0.54 + uBiomeBias.z * 1.2;
  float b8 = 0.78 + uBiomeBias.z * 1.2;
  vec3 color = mix(lowVeg, grass, smoothstep(b1, b2, e));
  color = mix(color, earth, smoothstep(b3, b4, e));
  color = mix(color, rock, smoothstep(b5, b6, e));
  color = mix(color, bareRock, smoothstep(b7, b8, e));

  // --- Slope effect: steep = less veg, more rock ---
  float rockMix = smoothstep(0.18, 0.55, slope);
  vec3 steepColor = mix(vec3(0.45, 0.36, 0.27), vec3(0.55, 0.48, 0.40), rockMix);
  color = mix(color, steepColor, rockMix * 0.65);

  // Very steep = bare rock
  float bareRockMix = smoothstep(0.55, 0.82, slope);
  color = mix(color, vec3(0.62, 0.56, 0.49), bareRockMix * 0.55);

  // --- Snow at high elevation ---
  float snowLine = 0.82 + snoise(vPosition.xz * 4.0) * 0.06;
  float snowMix = smoothstep(snowLine, 0.96, e);
  color = mix(color, snow, snowMix);

  // --- Micro detail ---
  color += fineNoise * 0.12 * (1.0 - snowMix);

  // --- Simple diffuse lighting ---
  vec3 lightDir = normalize(uSunDirection);
  float NdotL = max(0.25, dot(vNormal, lightDir));
  float wrap = 0.15;
  float diffuse = max(0.0, (dot(vNormal, lightDir) + wrap) / (1.0 + wrap));
  diffuse = 0.35 + 0.65 * diffuse;

  // Slope AO — steeper slopes get slightly darker
  float ao = 0.88 + 0.12 * (1.0 - slope);
  color *= diffuse * ao;

  // --- Weather tint ---
  float weatherDarken = 1.0 - uWeatherFactor * 0.12;
  color *= weatherDarken;

  // Subtle rim light
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float rim = pow(1.0 - max(0.0, dot(vNormal, viewDir)), 2.5) * 0.18;
  color += rim * vec3(0.6, 0.7, 0.9);

  gl_FragColor = vec4(color, 1.0);
}
`;

export function createTerrainMaterial({ minHeight, maxHeight, weatherFactor = 0, sunDirection = new THREE.Vector3(0.5, 0.8, 0.3), biomeBias = new THREE.Vector3(0, 0, 0), time = 0, clippingPlanes = [] } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMinHeight: { value: minHeight ?? 0 },
      uMaxHeight: { value: maxHeight ?? 1 },
      uWeatherFactor: { value: weatherFactor },
      uSunDirection: { value: sunDirection },
      uBiomeBias: { value: biomeBias },
      uTime: { value: time }
    },
    vertexShader,
    fragmentShader,
    clippingPlanes,
    side: THREE.DoubleSide,
    roughness: 0.9,
    metalness: 0.02
  });
}
