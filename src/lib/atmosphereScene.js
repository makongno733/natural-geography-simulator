import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const SHELL_COLORS = [
  "#2f79be", "#3688cf", "#4697d8", "#53a8df", "#67b7e6", "#78c3eb", "#86cdf0", "#97d8f4", "#a7e3f8"
];

function latLonToVec(lat, lon, r) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function buildEarthTexture() {
  const c = document.createElement("canvas");
  c.width = 2048;
  c.height = 1024;
  const g = c.getContext("2d");
  g.fillStyle = "#1b5f9f";
  g.fillRect(0, 0, c.width, c.height);

  const grd = g.createLinearGradient(0, 0, 0, c.height);
  grd.addColorStop(0, "rgba(105, 175, 228, 0.33)");
  grd.addColorStop(1, "rgba(12, 44, 82, 0.18)");
  g.fillStyle = grd;
  g.fillRect(0, 0, c.width, c.height);

  const polys = [
    [[120, 460], [200, 320], [330, 250], [460, 210], [620, 230], [690, 290], [620, 420], [490, 470], [360, 520], [220, 560]],
    [[460, 520], [570, 510], [670, 580], [740, 700], [720, 840], [620, 900], [520, 830], [460, 700]],
    [[920, 260], [1090, 180], [1310, 170], [1510, 220], [1670, 320], [1750, 420], [1620, 490], [1400, 510], [1210, 470], [1040, 390]],
    [[980, 520], [1110, 520], [1220, 600], [1250, 740], [1170, 900], [1050, 940], [940, 850], [900, 700]],
    [[1610, 600], [1720, 620], [1840, 700], [1900, 820], [1840, 930], [1710, 900], [1610, 810]]
  ];

  polys.forEach((p, idx) => {
    const hue = 92 + idx * 7;
    g.fillStyle = `hsl(${hue}, 28%, 42%)`;
    g.beginPath();
    p.forEach(([x, y], i) => {
      if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
    });
    g.closePath();
    g.fill();
  });

  for (let i = 0; i < 5000; i += 1) {
    const x = (i * 97) % c.width;
    const y = (i * 57) % c.height;
    const a = 0.03 + (i % 6) * 0.01;
    g.fillStyle = `rgba(255,255,255,${a})`;
    g.fillRect(x, y, 2, 2);
  }

  return new THREE.CanvasTexture(c);
}

function makeCurve(points, radius, color, opacity = 0.9) {
  const curve = new THREE.CatmullRomCurve3(points.map(([lat, lon, alt = 0]) => latLonToVec(lat, lon, radius + alt)));
  const geo = new THREE.TubeGeometry(curve, 96, 0.012, 8, false);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity });
  return new THREE.Mesh(geo, mat);
}

export function createAtmosphereScene(host, opts = {}) {
  const state = {
    activeLayer: opts.activeLayer ?? 1,
    scope: opts.scope ?? "global",
    animated: opts.animated ?? true
  };

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#030b16");
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 1.8, 4.6);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  host.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 2.4;
  controls.maxDistance = 8;

  scene.add(new THREE.AmbientLight("#a7c6ff", 0.7));
  const sun = new THREE.DirectionalLight("#ffffff", 1.05);
  sun.position.set(4, 3, 6);
  scene.add(sun);

  const globeR = 1.75;
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(globeR, 128, 128),
    new THREE.MeshPhongMaterial({ map: buildEarthTexture(), shininess: 16 })
  );
  scene.add(earth);

  const shellGroup = new THREE.Group();
  const shells = [];
  for (let i = 0; i < 9; i += 1) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(globeR + 0.06 + i * 0.035, 64, 64),
      new THREE.MeshBasicMaterial({
        color: SHELL_COLORS[i],
        transparent: true,
        opacity: i === state.activeLayer ? 0.34 : 0.11,
        depthWrite: false
      })
    );
    shells.push(mesh);
    shellGroup.add(mesh);
  }
  scene.add(shellGroup);

  const flowGroup = new THREE.Group();
  scene.add(flowGroup);
  const flowItems = [
    makeCurve([[32, -170], [35, -110], [38, -40], [37, 20], [35, 90], [33, 160]], globeR, "#ffe8a6", 0.8), // westerlies
    makeCurve([[8, -150], [10, -90], [11, -30], [10, 30], [11, 90], [10, 150]], globeR + 0.05, "#a8e7ff", 0.7), // trade
    makeCurve([[ -3, 52], [6, 60], [15, 70], [21, 79], [27, 88]], globeR + 0.09, "#9de9ff", 0.9), // monsoon
    makeCurve([[ -5, 49], [4, 56], [11, 62], [16, 66], [19, 70]], globeR + 0.03, "#74d7ff", 0.8), // arabian current
    makeCurve([[6, 92], [10, 90], [15, 88], [20, 86], [22, 84]], globeR + 0.03, "#ffd89b", 0.8) // bay current
  ];
  flowItems.forEach((m) => flowGroup.add(m));

  const markerGeo = new THREE.BufferGeometry();
  const starPos = [];
  for (let i = 0; i < 1800; i += 1) {
    const r = 20 + (i % 40) * 0.5;
    const t = i * 0.37;
    const p = i * 0.19;
    starPos.push(
      r * Math.cos(t) * Math.sin(p),
      r * Math.sin(t) * Math.sin(p),
      r * Math.cos(p)
    );
  }
  markerGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
  const stars = new THREE.Points(markerGeo, new THREE.PointsMaterial({ size: 0.04, color: "#d7e9ff", transparent: true, opacity: 0.66 }));
  scene.add(stars);

  function applyScope() {
    if (state.scope === "global") {
      controls.target.set(0, 0, 0);
      camera.position.set(0, 1.8, 4.6);
      controls.minDistance = 2.4;
      controls.maxDistance = 8;
    } else {
      controls.target.copy(latLonToVec(29, 82, globeR * 0.75));
      camera.position.set(1.1, 1.6, 3.2);
      controls.minDistance = 1.5;
      controls.maxDistance = 5.6;
    }
    controls.update();
  }

  function setActiveLayer(index) {
    state.activeLayer = index;
    shells.forEach((s, i) => {
      s.material.opacity = i === index ? 0.34 : 0.11;
    });
  }

  function resize() {
    const w = host.clientWidth || 960;
    const h = host.clientHeight || 520;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  let raf = 0;
  function tick(t) {
    const tt = t * 0.001;
    if (state.animated) {
      earth.rotation.y += 0.0009;
      shellGroup.rotation.y += 0.0005;
      flowGroup.rotation.y += 0.0007;
      flowGroup.children.forEach((m, i) => {
        m.material.opacity = 0.55 + 0.35 * Math.sin(tt * 1.8 + i * 0.7);
      });
    }
    controls.update();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }

  applyScope();
  setActiveLayer(state.activeLayer);
  resize();
  raf = requestAnimationFrame(tick);

  const onResize = () => resize();
  window.addEventListener("resize", onResize);

  return {
    setActiveLayer,
    setScope(mode) {
      state.scope = mode;
      applyScope();
    },
    setAnimated(v) {
      state.animated = v;
    },
    resetView() {
      applyScope();
    },
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      renderer.dispose();
      host.removeChild(renderer.domElement);
      scene.traverse((obj) => {
        if (!obj.geometry) return;
        obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
    }
  };
}
