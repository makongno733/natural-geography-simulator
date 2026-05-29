// [M06] LandformModule — 流水·喀斯特·风沙·海岸地貌沙盘 — 必修一Ch4 · 选必1Ch2
import * as THREE from 'three'
import { createTerrainMaterial } from '../../lib/shaders/terrainMaterial.js'
import { GeometryFactory } from '../utils/GeometryFactory.js'

const SIZE = 4
const SEGMENTS = { simple: 128, professional: 256 }

const MODULE_IDS = {
  karst: 'karst', fluvial: 'fluvial', aeolian: 'aeolian',
  coastal: 'coastal', structural: 'structural', glacial: 'glacial', volcanic: 'volcanic',
}

const COLOR_BIAS = {
  karst: [0.1, 0.05, 0.05], fluvial: [-0.05, 0.05, -0.05],
  aeolian: [0.05, 0.1, -0.1], coastal: [-0.1, -0.05, -0.1],
  structural: [0, 0, 0.05], glacial: [0, 0, 0.1], volcanic: [0.05, -0.05, 0],
}

const SECONDARY_LABELS = {
  karst: [
    { text: '峰林', pos: [-0.6, 0.5, -0.5] },
    { text: '溶斗', pos: [0.3, -0.05, 0.3] },
    { text: '溶洞', pos: [0.8, 0.1, -0.3] },
  ],
  fluvial: [
    { text: 'V形谷', pos: [-0.8, 0.1, 0] },
    { text: '冲积扇', pos: [0.6, 0.05, -0.5] },
    { text: '河曲', pos: [0, 0.05, 0.7] },
  ],
  aeolian: [
    { text: '沙丘', pos: [-0.4, 0.15, -0.2] },
    { text: '雅丹', pos: [0.5, 0.1, 0.4] },
    { text: '风蚀柱', pos: [-0.6, 0.2, 0.5] },
  ],
  coastal: [
    { text: '海蚀崖', pos: [-0.8, 0.15, 0] },
    { text: '海滩', pos: [0.2, -0.02, 0.6] },
    { text: '三角洲', pos: [0.7, 0.02, -0.3] },
  ],
  structural: [
    { text: '断层崖', pos: [-0.4, 0.35, -0.2] },
    { text: '褶皱山', pos: [0.55, 0.3, 0.35] },
  ],
  glacial: [
    { text: '冰斗', pos: [-0.55, 0.28, -0.45] },
    { text: 'U形谷', pos: [0.25, 0.08, 0.2] },
  ],
  volcanic: [
    { text: '火山锥', pos: [0, 0.58, 0] },
    { text: '熔岩流', pos: [0.55, 0.08, -0.35] },
  ],
}

function noise2D(x, y) {
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1]
  const grad3 = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]]
  const p = [
    151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
    190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,
    125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,
    105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,
    135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,
    82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,
    153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,
    251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,
    106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,
    195,78,66,215,61,156,180,
  ]
  const perm = new Uint8Array(512)
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255]

  const xi = Math.floor(x) & 255
  const yi = Math.floor(y) & 255
  const xf = x - Math.floor(x)
  const yf = y - Math.floor(y)
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)

  const aa = perm[perm[xi] + yi]
  const ab = perm[perm[xi] + yi + 1]
  const ba = perm[perm[xi + 1] + yi]
  const bb = perm[perm[xi + 1] + yi + 1]

  const x1 = xf - 1, y1 = yf - 1
  let n = (1 - u) * (1 - v) * dot(grad3[aa % 8], [xf, yf])
  n += (1 - u) * v * dot(grad3[ab % 8], [xf, y1])
  n += u * (1 - v) * dot(grad3[ba % 8], [x1, yf])
  n += u * v * dot(grad3[bb % 8], [x1, y1])
  return n
}

function fbm(x, y, octaves = 4) {
  let v = 0, a = 0.5, f = 1
  for (let i = 0; i < octaves; i++) {
    v += a * noise2D(x * f, y * f)
    a *= 0.5; f *= 2
  }
  return v
}

function modifyHeight(moduleId, xn, zn, baseH, timeline, climate) {
  const h = baseH
  const n1 = fbm(xn * 3, zn * 2, 4)
  const n2 = fbm(xn * 6, zn * 5, 3)
  const n3 = fbm(xn * 12, zn * 10, 2)

  switch (moduleId) {
    case 'fluvial':
      return h + n1 * 0.2 + n2 * 0.1 - Math.abs(xn - 0.5) * 0.15 * (1 - timeline)
    case 'karst':
      return h + n1 * 0.25 + Math.abs(n2) * 0.15 + n3 * 0.08
    case 'aeolian':
      return h + n1 * 0.15 + Math.sin(xn * 8 + zn * 3) * 0.08 + n2 * 0.05
    case 'coastal':
      return h + n1 * 0.12 + (xn < 0.3 ? -0.1 : 0) * (1 - timeline) + n2 * 0.06
    case 'structural':
      return h + Math.abs(Math.sin((xn + zn) * 5.2)) * 0.18 + (xn > 0.52 ? 0.18 : -0.05) + n2 * 0.06
    case 'glacial':
      return h + n1 * 0.18 - Math.exp(-((xn - 0.52) ** 2) * 20) * 0.22 + Math.max(0, zn - 0.55) * 0.28
    case 'volcanic':
      return h + Math.exp(-(((xn - 0.5) ** 2 + (zn - 0.5) ** 2) * 18)) * 0.75 - Math.exp(-(((xn - 0.5) ** 2 + (zn - 0.5) ** 2) * 80)) * 0.28 + n2 * 0.05
    default:
      return h + n1 * 0.18 + n2 * 0.08
  }
}

function getModuleColor(moduleId, h) {
  const t = (h + 0.3) / 0.9
  const base = Math.max(0, Math.min(1, t))
  const col = new THREE.Color()
  switch (moduleId) {
    case 'fluvial': col.setHSL(0.15 + base * 0.15, 0.4, 0.25 + base * 0.3); break
    case 'karst': col.setHSL(0.12, 0.3, 0.3 + base * 0.35); break
    case 'aeolian': col.setHSL(0.11 + base * 0.05, 0.5, 0.35 + base * 0.25); break
    case 'coastal': col.setHSL(0.13, 0.3, 0.28 + base * 0.3); break
    case 'structural': col.setHSL(0.08, 0.28, 0.26 + base * 0.32); break
    case 'glacial': col.setHSL(0.55, 0.26, 0.48 + base * 0.28); break
    case 'volcanic': col.setHSL(0.04, 0.45, 0.22 + base * 0.22); break
    default: col.setHSL(0.12, 0.35, 0.3 + base * 0.3)
  }
  return [col.r * 255, col.g * 255, col.b * 255]
}

function addFeatureTube(group, points, color, radius = 0.025, opacity = 0.85) {
  const curve = new THREE.CatmullRomCurve3(points)
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 96, radius, 8, false),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.18,
      metalness: 0.18,
      transparent: true,
      opacity,
    }),
  )
  group.add(tube)
  return tube
}

function addLandformOverlays(group, moduleId) {
  if (moduleId === 'fluvial') {
    addFeatureTube(group, [
      new THREE.Vector3(-1.7, 0.22, -1.1),
      new THREE.Vector3(-1.05, 0.04, -0.45),
      new THREE.Vector3(-0.4, -0.02, 0.25),
      new THREE.Vector3(0.28, -0.04, 0.75),
      new THREE.Vector3(1.5, -0.08, 1.25),
    ], 0x1f7ed8, 0.035, 0.78)
    for (let i = 0; i < 5; i++) {
      const fan = new THREE.Mesh(
        new THREE.CircleGeometry(0.18 + i * 0.025, 32, Math.PI * 0.1, Math.PI * 0.55),
        new THREE.MeshBasicMaterial({ color: 0xd6b47a, transparent: true, opacity: 0.16, side: THREE.DoubleSide }),
      )
      fan.rotation.x = -Math.PI / 2
      fan.rotation.z = -0.7
      fan.position.set(0.65 + i * 0.03, 0.01, -0.75 + i * 0.025)
      group.add(fan)
    }
  }

  if (moduleId === 'karst') {
    for (let i = 0; i < 9; i++) {
      const sink = new THREE.Mesh(
        GeometryFactory.ring(0.045, 0.12 + (i % 3) * 0.02, 36),
        new THREE.MeshBasicMaterial({ color: 0x26302a, transparent: true, opacity: 0.45, side: THREE.DoubleSide }),
      )
      sink.rotation.x = -Math.PI / 2
      sink.position.set(-1 + (i % 3) * 0.75, 0.05, -0.9 + Math.floor(i / 3) * 0.65)
      group.add(sink)
    }
  }

  if (moduleId === 'aeolian') {
    for (let i = 0; i < 10; i++) {
      const dune = new THREE.Mesh(
        new THREE.TorusGeometry(0.25 + (i % 3) * 0.04, 0.012, 6, 64, Math.PI),
        new THREE.MeshBasicMaterial({ color: 0xf3c46d, transparent: true, opacity: 0.5 }),
      )
      dune.rotation.x = -Math.PI / 2
      dune.rotation.z = 0.4 + (i % 4) * 0.08
      dune.position.set(-1.8 + (i % 5) * 0.8, 0.12, -0.9 + Math.floor(i / 5) * 1.1)
      group.add(dune)
    }
  }

  if (moduleId === 'coastal') {
    addFeatureTube(group, [
      new THREE.Vector3(-1.9, 0.03, -1.25),
      new THREE.Vector3(-1.0, 0.08, -0.55),
      new THREE.Vector3(-0.55, 0.02, 0.2),
      new THREE.Vector3(-1.05, 0.04, 1.25),
    ], 0xe8d4a6, 0.04, 0.82)
  }

  if (moduleId === 'structural') {
    addFeatureTube(group, [
      new THREE.Vector3(-1.75, 0.2, -1.4),
      new THREE.Vector3(-0.65, 0.16, -0.45),
      new THREE.Vector3(0.3, 0.15, 0.35),
      new THREE.Vector3(1.65, 0.2, 1.4),
    ], 0xff5a3d, 0.018, 0.78)
    for (let i = 0; i < 5; i++) {
      addFeatureTube(group, [
        new THREE.Vector3(-1.6, 0.14 + i * 0.02, -1 + i * 0.35),
        new THREE.Vector3(-0.3, 0.22, -0.65 + i * 0.35),
        new THREE.Vector3(1.3, 0.16, -0.35 + i * 0.35),
      ], 0x8d6040, 0.012, 0.45)
    }
  }

  if (moduleId === 'glacial') {
    addFeatureTube(group, [
      new THREE.Vector3(-0.85, 0.32, -1.55),
      new THREE.Vector3(-0.25, 0.12, -0.8),
      new THREE.Vector3(0.15, 0.05, 0.05),
      new THREE.Vector3(0.35, -0.02, 1.35),
    ], 0xcfeeff, 0.09, 0.55)
  }

  if (moduleId === 'volcanic') {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.45, 0.75, 48, 8, true),
      new THREE.MeshStandardMaterial({ color: 0x5d3b2e, roughness: 0.72, transparent: true, opacity: 0.72, side: THREE.DoubleSide }),
    )
    cone.position.y = 0.42
    group.add(cone)
    addFeatureTube(group, [
      new THREE.Vector3(0.08, 0.78, 0),
      new THREE.Vector3(0.42, 0.32, -0.28),
      new THREE.Vector3(0.9, 0.08, -0.65),
      new THREE.Vector3(1.55, -0.02, -1.05),
    ], 0xff5a24, 0.035, 0.78)
  }
}

export function LandformModule(scene, params, services) {
  const { labelSystem } = services
  const group = new THREE.Group()
  const mode = params.mode || 'simple'
  const activeModule = params.activeModule || 'fluvial'
  const timeline = params.timeline || 0
  const climateFactor = params.climateFactor || 0.5

  const modId = MODULE_IDS[activeModule] || 'fluvial'
  const seg = SEGMENTS[mode] || SEGMENTS.simple

  const geo = new THREE.PlaneGeometry(SIZE, SIZE, seg, seg)
  geo.rotateX(-Math.PI / 2)

  const pos = geo.attributes.position
  const colors = new Float32Array(pos.count * 3)
  let minH = Infinity, maxH = -Infinity

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const xn = (x + SIZE / 2) / SIZE
    const zn = (z + SIZE / 2) / SIZE
    const baseH = 0.15 + Math.sin(xn * 3.7 + zn * 2.1) * 0.15 + Math.sin(xn * 5.2 - zn * 4.3 + 1.8) * 0.08
    const h = modifyHeight(modId, xn, zn, baseH, timeline, climateFactor)
    pos.setY(i, h)
    if (h < minH) minH = h
    if (h > maxH) maxH = h
    const c = getModuleColor(modId, h)
    colors[i * 3] = c[0] / 255
    colors[i * 3 + 1] = c[1] / 255
    colors[i * 3 + 2] = c[2] / 255
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const bias = COLOR_BIAS[activeModule] || [0, 0, 0]
  const terrainMat = createTerrainMaterial({
    minHeight: minH,
    maxHeight: maxH,
    sunDirection: new THREE.Vector3(0.5, 0.8, 0.3),
    biomeBias: new THREE.Vector3(bias[0], bias[1], bias[2]),
  })
  const terrain = new THREE.Mesh(geo, terrainMat)
  terrain.receiveShadow = true
  terrain.castShadow = true
  group.add(terrain)

  if (activeModule !== 'aeolian') {
    const waterGeo = GeometryFactory.plane(SIZE * 1.2, SIZE * 1.2)
    waterGeo.rotateX(-Math.PI / 2)
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x3a7ca5, transparent: true, opacity: 0.35, roughness: 0.1, metalness: 0.3, side: THREE.DoubleSide,
    })
    const water = new THREE.Mesh(waterGeo, waterMat)
    water.position.y = -0.08
    water.receiveShadow = true
    group.add(water)
  }

  addLandformOverlays(group, modId)

  if (labelSystem && mode === 'professional') {
    const labels = SECONDARY_LABELS[activeModule] || []
    labels.forEach(l => {
      labelSystem.addToGroup(group, l.text, new THREE.Vector3(...l.pos), {
        color: '#e8d5c4',
        fontSize: '11px',
        background: 'rgba(60,40,30,0.78)',
      })
    })
  }

  const api = {
    update(dt, elapsed) {},
    dispose() {},
  }
  group.userData = { api }

  return group
}
