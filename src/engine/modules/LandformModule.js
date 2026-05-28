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
    default: col.setHSL(0.12, 0.35, 0.3 + base * 0.3)
  }
  return [col.r * 255, col.g * 255, col.b * 255]
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
