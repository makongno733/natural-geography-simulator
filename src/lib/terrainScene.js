import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const TERRAIN_SIZE = 7.2;
const TERRAIN_HEIGHT = 2.7;
const BASE_Y = -4.6;
const SEGMENTS = 210;
const RIVER_HEIGHT_OFFSET = 0.04;

const strataLayerPalette = [
  new THREE.Color('#7c5f48'),
  new THREE.Color('#8c6d51'),
  new THREE.Color('#9b7a58'),
  new THREE.Color('#ad8963'),
  new THREE.Color('#bfa17a')
];

const riverBaseStyles = {
  consequent: { color: '#35b0ff', radius: 0.05 },
  subsequent: { color: '#ffd166', radius: 0.045 },
  obsequent: { color: '#ff6f60', radius: 0.045 },
  resequent: { color: '#8bff9c', radius: 0.044 },
  insequent: { color: '#f4b6ff', radius: 0.042 },
  antecedent: { color: '#9ee7ff', radius: 0.041 },
  superimposed: { color: '#ffcf9e', radius: 0.041 }
};

const typeAnchors = {
  consequent: { x: 0.74, y: 0.67, color: '#4fc1ff' },
  subsequent: { x: 0.62, y: 0.50, color: '#ffd166' },
  obsequent: { x: 0.43, y: 0.41, color: '#ff8a7a' },
  resequent: { x: 0.60, y: 0.74, color: '#96ffa7' },
  insequent: { x: 0.50, y: 0.58, color: '#f4b6ff' },
  antecedent: { x: 0.80, y: 0.32, color: '#9ee7ff' },
  superimposed: { x: 0.30, y: 0.63, color: '#ffcf9e' }
};

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function mix(c1, c2, t) {
  return [
    Math.round(lerp(c1[0], c2[0], t)),
    Math.round(lerp(c1[1], c2[1], t)),
    Math.round(lerp(c1[2], c2[2], t))
  ];
}

function weatherErosionWeight(mode) {
  if (mode === 'rain') return 1.0;
  if (mode === 'snow') return 0.65;
  if (mode === 'cloud') return 0.45;
  if (mode === 'fog') return 0.52;
  return 0.25;
}

function climateForceValue(climateRatio, weatherMode) {
  const timeFactor = Math.pow(climateRatio, 1.15);
  return timeFactor * weatherErosionWeight(weatherMode) * 1.6;
}

function satTerrainColor(n) {
  if (n < 0.13) return mix([22, 76, 50], [38, 110, 68], n / 0.13);
  if (n < 0.34) return mix([38, 110, 68], [92, 153, 90], (n - 0.13) / 0.21);
  if (n < 0.58) return mix([92, 153, 90], [155, 147, 92], (n - 0.34) / 0.24);
  if (n < 0.8) return mix([155, 147, 92], [132, 98, 71], (n - 0.58) / 0.22);
  return mix([132, 98, 71], [214, 213, 205], (n - 0.8) / 0.2);
}

function heightAt(xn, yn, t, climateForce = 0) {
  const x = xn * 2 - 1;
  const y = yn * 2 - 1;
  let h = 1.45 - 1.08 * x;
  h += 0.30 * Math.sin(3.6 * y + 1.8 * x) + 0.17 * Math.cos(5.2 * x - 0.7 * y);
  h += 0.10 * Math.sin(8.0 * x) * Math.cos(5.8 * y);
  h += 0.06 * Math.sin(13.4 * x + 9.2 * y) * Math.cos(11.7 * y - 7.3 * x);
  h += 0.028 * Math.sin(22.0 * x - 15.0 * y) + 0.019 * Math.cos(27.0 * y + 5.0 * x);
  h += 0.012 * Math.sin(38.0 * x + 31.0 * y) + 0.009 * Math.cos(45.0 * y - 18.0 * x);
  h += 0.006 * Math.sin(61.0 * x - 24.0 * y) - 0.004 * Math.cos(58.0 * y + 33.0 * x);

  const valleyA = Math.exp(-Math.pow((y - 0.42 * x - 0.16) / 0.14, 2));
  const valleyS = Math.exp(-Math.pow((y - 0.05 * x - 0.04) / 0.12, 2));
  const valleyB = Math.exp(-Math.pow((y + 0.50 * x + 0.42) / 0.15, 2));
  const valleyC = Math.exp(-Math.pow((y - 0.26 * x + 0.55) / 0.13, 2));

  h -= valleyA * (0.32 + t * 1.00);
  h -= valleyS * Math.max(0, t - 0.18) * 0.95;
  h -= valleyB * Math.max(0, t - 0.40) * 1.08;
  h -= valleyC * Math.max(0, t - 0.62) * 1.20;

  h -= climateForce * (0.06 + 0.03 * Math.sin(6.0 * x));
  h -= valleyA * climateForce * 0.44;
  h -= valleyB * climateForce * 0.36;
  h -= valleyC * climateForce * 0.34;
  return h;
}

function generateRiverPaths() {
  const a = []; const s = []; const b = []; const c = []; const d = []; const e = []; const f = [];
  for (let i = 0; i < 170; i += 1) {
    const t = i / 169;
    a.push({ x: 0.08 + t * 0.82, y: 0.42 * (0.08 + t * 0.82) + 0.38 + 0.014 * Math.sin(t * 15) });
    s.push({ x: 0.21 + t * 0.66, y: 0.06 * (0.21 + t * 0.66) + 0.45 + 0.012 * Math.sin(t * 10 + 1.1) });
    b.push({ x: 0.85 - t * 0.70, y: -0.50 * (0.85 - t * 0.70) + 0.27 + 0.015 * Math.sin(t * 13 + 1.4) });
    c.push({ x: 0.14 + t * 0.74, y: 0.26 * (0.14 + t * 0.74) + 0.19 + 0.012 * Math.sin(t * 11 + 2.0) });
    d.push({ x: 0.18 + t * 0.56 + 0.028 * Math.sin(t * 12 + 0.8), y: 0.22 + t * 0.40 + 0.054 * Math.sin(t * 9 + 1.7) });
    e.push({ x: 0.79 - 0.024 * Math.sin(t * 8.4), y: 0.10 + t * 0.78 });
    f.push({ x: 0.24 + t * 0.58, y: 0.18 + t * 0.54 + 0.02 * Math.sin(t * 9 + 0.6) });
  }
  return { consequent: a, subsequent: s, obsequent: b, resequent: c, insequent: d, antecedent: e, superimposed: f };
}

function riverRatios(t) {
  const reveal = (start, end) => clamp((t - start) / (end - start), 0, 1);
  return {
    consequent: reveal(0.00, 0.14),
    subsequent: reveal(0.12, 0.28),
    obsequent: reveal(0.26, 0.42),
    resequent: reveal(0.40, 0.56),
    insequent: reveal(0.54, 0.70),
    antecedent: reveal(0.68, 0.84),
    superimposed: reveal(0.82, 1.00)
  };
}

function createTerrainTopGeometry(segments, timeline, climateForce) {
  const geometry = new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, segments, segments);
  geometry.rotateX(-Math.PI / 2);
  const position = geometry.attributes.position;
  const colors = new Float32Array(position.count * 3);
  let minH = Infinity;
  let maxH = -Infinity;
  const samples = new Float32Array(position.count);

  for (let iz = 0; iz <= segments; iz += 1) {
    for (let ix = 0; ix <= segments; ix += 1) {
      const idx = iz * (segments + 1) + ix;
      const h = heightAt(ix / segments, iz / segments, timeline, climateForce);
      samples[idx] = h;
      if (h < minH) minH = h;
      if (h > maxH) maxH = h;
    }
  }

  const range = Math.max(0.001, maxH - minH);
  for (let i = 0; i < position.count; i += 1) {
    const h = samples[i];
    position.setY(i, h * TERRAIN_HEIGHT);
    const n = (h - minH) / range;
    const c = satTerrainColor(n);
    colors[i * 3] = c[0] / 255;
    colors[i * 3 + 1] = c[1] / 255;
    colors[i * 3 + 2] = c[2] / 255;
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return { geometry, samples, minH, maxH, range };
}

function sampleLayerColor(y, topY) {
  const t = clamp((y - BASE_Y) / Math.max(0.001, topY - BASE_Y), 0, 0.999);
  const index = Math.floor(t * strataLayerPalette.length);
  return strataLayerPalette[index];
}

function createSkirtGeometry(samples, segments) {
  const edge = [];
  const row = segments + 1;
  const pushIndex = (ix, iz) => edge.push(iz * row + ix);
  for (let ix = 0; ix <= segments; ix += 1) pushIndex(ix, 0);
  for (let iz = 1; iz <= segments; iz += 1) pushIndex(segments, iz);
  for (let ix = segments - 1; ix >= 0; ix -= 1) pushIndex(ix, segments);
  for (let iz = segments - 1; iz >= 1; iz -= 1) pushIndex(0, iz);

  const vertices = [];
  const colors = [];
  for (let i = 0; i < edge.length; i += 1) {
    const a = edge[i];
    const b = edge[(i + 1) % edge.length];

    const aix = a % row;
    const aiz = Math.floor(a / row);
    const bix = b % row;
    const biz = Math.floor(b / row);

    const ax = (aix / segments - 0.5) * TERRAIN_SIZE;
    const az = (aiz / segments - 0.5) * TERRAIN_SIZE;
    const bx = (bix / segments - 0.5) * TERRAIN_SIZE;
    const bz = (biz / segments - 0.5) * TERRAIN_SIZE;
    const ay = samples[a] * TERRAIN_HEIGHT;
    const by = samples[b] * TERRAIN_HEIGHT;

    const colorA = sampleLayerColor(ay, ay);
    const colorB = sampleLayerColor(by, by);
    const baseColor = strataLayerPalette[0];

    vertices.push(
      ax, ay, az,
      bx, by, bz,
      bx, BASE_Y, bz,
      ax, ay, az,
      bx, BASE_Y, bz,
      ax, BASE_Y, az
    );

    const faceColors = [colorA, colorB, baseColor, colorA, baseColor, baseColor];
    for (const c of faceColors) {
      colors.push(c.r, c.g, c.b);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function createBottomGeometry() {
  const geometry = new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, 1, 1);
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, BASE_Y, 0);
  return geometry;
}

function samplePoint(xn, yn, timeline, climateForce, yOffset = 0) {
  return new THREE.Vector3(
    (xn - 0.5) * TERRAIN_SIZE,
    heightAt(xn, yn, timeline, climateForce) * TERRAIN_HEIGHT + yOffset,
    (yn - 0.5) * TERRAIN_SIZE
  );
}

function createRiverMesh(points, ratio, style, timeline, climateForce, active) {
  const count = Math.max(2, Math.floor(points.length * ratio));
  const sampled = [];
  for (let i = 0; i < count; i += 1) {
    const pt = points[i];
    sampled.push(samplePoint(pt.x, pt.y, timeline, climateForce, RIVER_HEIGHT_OFFSET));
  }
  if (sampled.length < 2) return null;

  const curve = new THREE.CatmullRomCurve3(sampled);
  const tube = new THREE.TubeGeometry(curve, Math.max(18, sampled.length * 2), active ? style.radius * 1.38 : style.radius, 10, false);
  const material = new THREE.MeshStandardMaterial({
    color: style.color,
    emissive: style.color,
    emissiveIntensity: active ? 0.62 : 0.24,
    roughness: 0.28,
    metalness: 0.05,
    transparent: true,
    opacity: active ? 1 : 0.88
  });
  return new THREE.Mesh(tube, material);
}

function createCloudGroup() {
  const group = new THREE.Group();
  for (let i = 0; i < 7; i += 1) {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(0.34 + Math.random() * 0.16, 18, 18),
      new THREE.MeshStandardMaterial({ color: '#eef3f6', transparent: true, opacity: 0.62, roughness: 1 })
    );
    puff.position.set(-3.5 + i * 1.1, 3.3 + (i % 2) * 0.18, -1.8 + (i % 3) * 0.65);
    puff.scale.set(1.6, 0.72, 1.1);
    group.add(puff);
  }
  return group;
}

function createPointWeather(count, color, size) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = 0.8 + Math.random() * 5.2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color, size, transparent: true, opacity: 0.85, depthWrite: false });
  return new THREE.Points(geometry, material);
}

function createMarker() {
  const group = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 18, 18),
    new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#8ce8ff', emissiveIntensity: 0.8 })
  );
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#8ce8ff', transparent: true, opacity: 0.2 })
  );
  group.add(halo, core);
  return group;
}

export function createTerrainScene(host, options = {}) {
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.1));
  renderer.setSize(host.clientWidth, host.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.localClippingEnabled = true;
  renderer.shadowMap.enabled = false;
  host.innerHTML = '';
  host.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(42, Math.max(1, host.clientWidth) / Math.max(1, host.clientHeight), 0.1, 100);
  camera.position.set(5.2, 4.0, 5.6);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.055;
  controls.rotateSpeed = 0.85;
  controls.zoomSpeed = 0.9;
  controls.panSpeed = 0.7;
  controls.screenSpacePanning = true;
  controls.minDistance = 3.4;
  controls.maxDistance = 13.5;
  controls.minPolarAngle = 0.12;
  controls.maxPolarAngle = Math.PI - 0.02;
  controls.target.set(0, 0.5, 0);
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN
  };
  controls.touches = {
    ONE: THREE.TOUCH.ROTATE,
    TWO: THREE.TOUCH.DOLLY_PAN
  };
  controls.update();

  const hemi = new THREE.HemisphereLight('#d6f0ff', '#5a4b35', 1.6);
  const sun = new THREE.DirectionalLight('#fff1c9', 2.4);
  sun.position.set(5.5, 8.5, 4.2);
  const rim = new THREE.DirectionalLight('#88c8ff', 0.7);
  rim.position.set(-4.5, 3.8, -5.8);
  scene.add(hemi, sun, rim);

  const world = new THREE.Group();
  scene.add(world);

  const clippingPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
  const terrainGroup = new THREE.Group();
  const riverGroup = new THREE.Group();
  const weatherGroup = new THREE.Group();
  const cloudGroup = createCloudGroup();
  const rainPoints = createPointWeather(900, '#7ec8ff', 0.045);
  const snowPoints = createPointWeather(520, '#ffffff', 0.055);
  const activeMarker = createMarker();
  weatherGroup.add(cloudGroup, rainPoints, snowPoints);
  world.add(terrainGroup, riverGroup, weatherGroup, activeMarker);

  const riverPaths = generateRiverPaths();
  let frameId = 0;
  let resizeObserver;
  let lastWeatherTick = 0;
  let geometrySignature = '';
  let state = {
    timeline: 0,
    climate: 0,
    weatherMode: 'clear',
    activeType: 'consequent',
    viewMode: 'terrain',
    autoRotate: false
  };

  function clearGroup(group) {
    while (group.children.length) {
      const child = group.children.pop();
      if (child.geometry) child.geometry.dispose();
      if (Array.isArray(child.material)) child.material.forEach((item) => item.dispose?.());
      else child.material?.dispose?.();
      child.removeFromParent();
    }
  }

  function terrainMaterials() {
    const clippingPlanes = state.viewMode === 'section' ? [clippingPlane] : [];
    return {
      top: new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.98,
        metalness: 0.02,
        clippingPlanes
      }),
      side: new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 1,
        metalness: 0,
        clippingPlanes
      }),
      bottom: new THREE.MeshStandardMaterial({
        color: '#5d4936',
        roughness: 1,
        metalness: 0,
        clippingPlanes
      })
    };
  }

  function rebuildTerrain() {
    clearGroup(terrainGroup);
    clearGroup(riverGroup);

    const climateForce = climateForceValue(state.climate, state.weatherMode);
    const { geometry, samples } = createTerrainTopGeometry(SEGMENTS, state.timeline, climateForce);
    const skirtGeometry = createSkirtGeometry(samples, SEGMENTS);
    const bottomGeometry = createBottomGeometry();
    const materials = terrainMaterials();

    const topMesh = new THREE.Mesh(geometry, materials.top);
    const skirtMesh = new THREE.Mesh(skirtGeometry, materials.side);
    const bottomMesh = new THREE.Mesh(bottomGeometry, materials.bottom);

    terrainGroup.add(topMesh, skirtMesh, bottomMesh);

    const ratios = riverRatios(state.timeline);
    for (const [type, points] of Object.entries(riverPaths)) {
      const ratio = ratios[type] ?? 0;
      if (ratio <= 0) continue;
      const river = createRiverMesh(points, ratio, riverBaseStyles[type], state.timeline, climateForce, type === state.activeType);
      if (river) riverGroup.add(river);
    }

    const anchor = typeAnchors[state.activeType] ?? typeAnchors.consequent;
    const markerPos = samplePoint(anchor.x, anchor.y, state.timeline, climateForce, 0.18);
    activeMarker.position.copy(markerPos);
    activeMarker.children[0].material.color.set(anchor.color);
    activeMarker.children[1].material.color.set(anchor.color);
    geometrySignature = `${Math.round(state.timeline * 180)}-${Math.round(state.climate * 140)}-${state.viewMode}`;
  }

  function updateWeatherVisibility() {
    cloudGroup.visible = state.weatherMode === 'cloud';
    rainPoints.visible = state.weatherMode === 'rain';
    snowPoints.visible = state.weatherMode === 'snow';
    if (state.weatherMode === 'fog') {
      scene.fog = new THREE.FogExp2('#dce5ea', 0.085);
    } else {
      scene.fog = null;
    }

    if (state.weatherMode === 'rain') scene.background = new THREE.Color('#9cafbc');
    else if (state.weatherMode === 'fog') scene.background = new THREE.Color('#ccd7dc');
    else scene.background = new THREE.Color('#d9e2e8');
  }

  function applyViewMode(previousMode) {
    const isSection = state.viewMode === 'section';
    for (const group of [terrainGroup, riverGroup]) {
      for (const child of group.children) {
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => {
            material.clippingPlanes = isSection ? [clippingPlane] : [];
            material.needsUpdate = true;
          });
        } else if (child.material) {
          child.material.clippingPlanes = isSection ? [clippingPlane] : [];
          child.material.needsUpdate = true;
        }
      }
    }

    if (previousMode !== state.viewMode) {
      if (isSection) {
        camera.position.set(0, 2.7, 6.1);
        controls.target.set(0, 0.35, 0);
        controls.minPolarAngle = 0.45;
        controls.maxPolarAngle = 1.55;
      } else {
        controls.minPolarAngle = 0.12;
        controls.maxPolarAngle = Math.PI - 0.02;
        if (previousMode === 'section') {
          camera.position.set(5.2, 4.0, 5.6);
          controls.target.set(0, 0.5, 0);
        }
      }
      controls.update();
    }
  }

  function setPreset360() {
    state.autoRotate = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.95;
    camera.position.set(5.8, 4.15, 5.8);
    controls.target.set(0, 0.52, 0);
    controls.update();
  }

  function resetCamera() {
    state.autoRotate = false;
    controls.autoRotate = false;
    camera.position.set(5.2, 4.0, 5.6);
    controls.target.set(0, 0.5, 0);
    controls.minPolarAngle = 0.12;
    controls.maxPolarAngle = Math.PI - 0.02;
    controls.update();
  }

  controls.addEventListener('start', () => {
    if (controls.autoRotate) {
      controls.autoRotate = false;
      state.autoRotate = false;
      options.onInteraction?.();
    }
  });

  function update(next) {
    const previousMode = state.viewMode;
    state = { ...state, ...next };
    applyViewMode(previousMode);
    controls.autoRotate = state.viewMode === 'terrain' && !!state.autoRotate;

    const nextSignature = `${Math.round(state.timeline * 180)}-${Math.round(state.climate * 140)}-${state.viewMode}`;
    if (geometrySignature !== nextSignature || !terrainGroup.children.length || state.activeType !== next.activeType) {
      rebuildTerrain();
    } else {
      const anchor = typeAnchors[state.activeType] ?? typeAnchors.consequent;
      const markerPos = samplePoint(anchor.x, anchor.y, state.timeline, climateForceValue(state.climate, state.weatherMode), 0.18);
      activeMarker.position.copy(markerPos);
      activeMarker.children[0].material.color.set(anchor.color);
      activeMarker.children[1].material.color.set(anchor.color);
    }

    updateWeatherVisibility();
  }

  function resize() {
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.1));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function tick(timeMs) {
    frameId = requestAnimationFrame(tick);
    const delta = Math.min(0.05, (timeMs - lastWeatherTick || 16) / 1000);
    lastWeatherTick = timeMs;

    if (cloudGroup.visible) {
      cloudGroup.position.x = Math.sin(timeMs * 0.00012) * 0.9;
    }

    if (rainPoints.visible || snowPoints.visible) {
      const points = rainPoints.visible ? rainPoints : snowPoints;
      const position = points.geometry.attributes.position;
      const drift = rainPoints.visible ? -0.01 : 0.0024;
      const fall = rainPoints.visible ? 0.22 : 0.07;
      for (let i = 0; i < position.count; i += 1) {
        let x = position.getX(i);
        let y = position.getY(i);
        let z = position.getZ(i);
        x += drift;
        y -= fall * delta * 8;
        z += Math.sin(timeMs * 0.0008 + i) * 0.0008;
        if (y < -0.3) {
          x = (Math.random() - 0.5) * 10;
          y = 4.8 + Math.random() * 1.2;
          z = (Math.random() - 0.5) * 10;
        }
        if (x < -5.5) x = 5.5;
        if (x > 5.5) x = -5.5;
        position.setXYZ(i, x, y, z);
      }
      position.needsUpdate = true;
    }

    const pulse = 1 + Math.sin(timeMs * 0.004) * 0.12;
    activeMarker.scale.setScalar(pulse);
    controls.update();
    renderer.render(scene, camera);
  }

  resize();
  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  update(state);
  frameId = requestAnimationFrame(tick);

  return {
    update,
    resize,
    resetCamera,
    setPreset360,
    dispose() {
      cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      controls.dispose();
      clearGroup(terrainGroup);
      clearGroup(riverGroup);
      rainPoints.geometry.dispose();
      rainPoints.material.dispose();
      snowPoints.geometry.dispose();
      snowPoints.material.dispose();
      cloudGroup.traverse((child) => {
        child.geometry?.dispose?.();
        child.material?.dispose?.();
      });
      renderer.dispose();
      renderer.domElement.remove();
    }
  };
}
