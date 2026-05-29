// [M09] ChapterConceptModule — 通用章节概念三维结构图 — 必修二·选必2·选必3
import * as THREE from 'three'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import { GeometryFactory } from '../utils/GeometryFactory.js'

const THEME_COLORS = {
  cosmic: [0x4f8cff, 0xffcc66, 0x88d8ff], atmosphere: [0x67b7ff, 0xffb25f, 0x9ad7ff], water: [0x2f8fd8, 0x64d2ff, 0x1f5f94],
  landform: [0xb8885a, 0x6aa66a, 0x406a3d], ecosystem: [0x62a85d, 0x8a5a34, 0xc6a36a], hazard: [0xff6b4a, 0xffc857, 0x58607a],
  population: [0x5aa9ff, 0xff8c42, 0x8ed081], urban: [0x9fb5c8, 0xffc857, 0x6b7280], industry: [0xf4a261, 0x8d99ae, 0x2a9d8f],
  transport: [0x80c7ff, 0xf9c74f, 0x577590], environment: [0x70c174, 0x4a7c59, 0xf4d35e], earthMotion: [0x4f8cff, 0xffd166, 0x9bf6ff],
  tectonic: [0xbc6c25, 0xdda15e, 0x606c38], weather: [0x7bdff2, 0xffafcc, 0xbde0fe], ocean: [0x1d70a2, 0x4cc9f0, 0x48cae4],
  natureSystem: [0x8ac926, 0x1982c4, 0xffca3a], region: [0x8ecae6, 0xffb703, 0x219ebc], regionalResource: [0x95d5b2, 0xd4a373, 0x52796f],
  cityRegion: [0xa8dadc, 0xe63946, 0x457b9d], interregional: [0x90be6d, 0xf8961e, 0x577590], environmentService: [0x80ed99, 0x57cc99, 0x22577a],
  resourceSecurity: [0xf9c74f, 0x43aa8b, 0x577590], environmentSecurity: [0xf94144, 0x90be6d, 0x277da1], strategy: [0xd00000, 0xffba08, 0x3f88c5],
  system: [0x80aaff, 0xffcc66, 0x88ddaa],
}

function palette(theme) {
  return THEME_COLORS[theme] || THEME_COLORS.system
}

function hashString(text = '') {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function seeded(seed) {
  let s = seed || 1
  return () => {
    s = Math.imul(1664525, s) + 1013904223
    return ((s >>> 0) / 4294967296)
  }
}

function noise2(x, z, seed = 1) {
  return Math.sin(x * 2.17 + seed * 0.001) * 0.55 +
    Math.sin(z * 3.03 - seed * 0.002) * 0.3 +
    Math.sin((x + z) * 5.41 + seed * 0.0007) * 0.15
}

function makeLine(points, color, width = 0.035, opacity = 0.72) {
  const geometry = new MeshLineGeometry()
  geometry.setPoints(points.flatMap((p) => [p.x, p.y, p.z]))
  const material = new MeshLineMaterial({
    color: new THREE.Color(color),
    lineWidth: width,
    transparent: true,
    opacity,
    depthWrite: false,
  })
  return new THREE.Mesh(geometry, material)
}

function addLabel(labelSystem, group, text, pos, color = '#ffffff', size = '12px') {
  if (!labelSystem || !text) return
  labelSystem.addToGroup(group, text, pos, {
    color,
    fontSize: size,
    fontWeight: '700',
    background: 'rgba(20,24,32,0.62)',
    whiteSpace: 'pre-line',
  })
}

function terrainHeight(x, z, recipe, seed) {
  let h = noise2(x, z, seed) * 0.055 + noise2(x * 2.4, z * 2.4, seed + 29) * 0.022
  if (['terrain', 'fragile', 'zonal'].includes(recipe.terrain)) {
    h += Math.exp(-((x + 0.75) ** 2 + (z + 0.05) ** 2) * 0.52) * 0.76
    h += Math.exp(-((x - 0.95) ** 2 + (z - 0.55) ** 2) * 1.2) * 0.24
  }
  if (['basin', 'ocean'].includes(recipe.terrain)) h -= Math.exp(-((x + 0.2) ** 2 + z ** 2) * 0.72) * 0.34
  if (['city', 'network', 'production', 'corridor', 'policy', 'region'].includes(recipe.terrain)) h *= 0.22
  if (['space', 'orbit', 'globe'].includes(recipe.terrain)) h *= 0.04
  if (recipe.terrain === 'soil') h += x > 0.7 ? 0.12 : -0.06
  if (recipe.terrain === 'hazard' || recipe.terrain === 'risk') h += Math.sin((x + z) * 7.0) * 0.035
  return h - 0.38
}

function buildTerrain(group, recipe, colors, seed) {
  const geometry = new THREE.PlaneGeometry(5.8, 3.6, 132, 84)
  geometry.rotateX(-Math.PI / 2)
  const pos = geometry.attributes.position
  const vertexColors = new Float32Array(pos.count * 3)
  const lowColor = new THREE.Color(0x24313a)
  const baseColor = new THREE.Color(colors[0])
  const highColor = new THREE.Color(colors[1])
  const peakColor = new THREE.Color(0xf2eadf)

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const h = terrainHeight(x, z, recipe, seed)
    pos.setY(i, h)
    const normalized = THREE.MathUtils.clamp((h + 0.44) / 0.92, 0, 1)
    const c = normalized < 0.25
      ? lowColor.clone().lerp(baseColor, normalized / 0.25)
      : normalized > 0.78
        ? highColor.clone().lerp(peakColor, (normalized - 0.78) / 0.22)
        : baseColor.clone().lerp(highColor, (normalized - 0.25) / 0.53)
    vertexColors[i * 3] = c.r
    vertexColors[i * 3 + 1] = c.g
    vertexColors[i * 3 + 2] = c.b
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(vertexColors, 3))
  geometry.computeVertexNormals()
  const terrain = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.86,
    metalness: 0.015,
    flatShading: false,
  }))
  terrain.receiveShadow = true
  group.add(terrain)

  const grid = makeLine([
    new THREE.Vector3(-2.9, -0.34, -1.8), new THREE.Vector3(2.9, -0.34, -1.8),
    new THREE.Vector3(2.9, -0.34, 1.8), new THREE.Vector3(-2.9, -0.34, 1.8), new THREE.Vector3(-2.9, -0.34, -1.8),
  ], 0xffffff, 0.012, 0.18)
  group.add(grid)
}

function buildCentralModel(group, recipe, colors, seed) {
  const theme = recipe.theme
  if (['cosmic', 'earthMotion'].includes(theme)) {
    const sun = new THREE.Mesh(GeometryFactory.sphere(0.31, 56), new THREE.MeshStandardMaterial({ color: 0xffc857, emissive: 0xff9f1c, emissiveIntensity: 0.58 }))
    sun.position.set(-1.8, 0.62, 0)
    group.add(sun)
    const earth = new THREE.Mesh(GeometryFactory.sphere(0.34, 64), new THREE.MeshStandardMaterial({ color: 0x3a86ff, roughness: 0.42 }))
    earth.position.set(0.55, 0.4, 0)
    earth.userData.spin = 0.24
    group.add(earth)
    const axis = makeLine([new THREE.Vector3(0.55, -0.02, 0), new THREE.Vector3(0.55, 0.82, 0)], 0xbde0fe, 0.012, 0.72)
    axis.rotation.z = -0.38
    group.add(axis)
    group.add(makeLine(GeometryFactory.ringPoints(1.85, 0.38, 192), colors[1], 0.018, 0.45))
    return
  }

  if (['atmosphere', 'weather'].includes(theme)) {
    const earth = new THREE.Mesh(GeometryFactory.sphere(0.72, 72), new THREE.MeshStandardMaterial({ color: 0x2f80ed, roughness: 0.52 }))
    group.add(earth)
    for (let i = 0; i < 4; i++) {
      const shell = new THREE.Mesh(GeometryFactory.sphere(0.82 + i * 0.13, 72), new THREE.MeshBasicMaterial({ color: colors[i % colors.length], transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false }))
      shell.userData.breath = i * 0.35
      group.add(shell)
    }
    for (let i = 0; i < 3; i++) {
      const r = 0.9 + i * 0.13
      const belt = makeLine(GeometryFactory.ringPoints(r, -0.05 + i * 0.12, 192), colors[(i + 1) % colors.length], 0.018, 0.46)
      belt.scale.z = 0.68
      belt.userData.flow = { phase: i / 3 }
      group.add(belt)
    }
    return
  }

  if (['water', 'ocean'].includes(theme)) {
    const water = new THREE.Mesh(GeometryFactory.plane(3.9, 2.05, 52, 28), new THREE.MeshStandardMaterial({ color: 0x2274a5, roughness: 0.16, metalness: 0.32, transparent: true, opacity: 0.76 }))
    water.rotation.x = -Math.PI / 2
    water.position.y = -0.27
    group.add(water)
    const current = makeLine([
      new THREE.Vector3(-2.05, 0.03, -0.56), new THREE.Vector3(-1.2, 0.38, 0.1),
      new THREE.Vector3(-0.1, 0.34, 0.28), new THREE.Vector3(0.95, 0.26, 0.0),
      new THREE.Vector3(1.95, 0.05, 0.58),
    ], colors[1], 0.045, 0.86)
    current.userData.flow = { phase: 0.2 }
    group.add(current)
    return
  }

  if (['landform', 'tectonic'].includes(theme)) {
    for (let i = 0; i < 8; i++) {
      const ridge = new THREE.Mesh(new THREE.ConeGeometry(0.24 + i * 0.018, 0.7 + (i % 3) * 0.12, 7, 3), new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: 0.84, flatShading: false }))
      ridge.position.set(-1.9 + i * 0.52, -0.02 + (i % 2) * 0.04, Math.sin(i * 1.33) * 0.42)
      ridge.rotation.y = i * 0.4
      group.add(ridge)
    }
    const river = makeLine([
      new THREE.Vector3(-2.35, -0.12, -0.7), new THREE.Vector3(-1.25, -0.08, -0.15),
      new THREE.Vector3(-0.2, -0.16, 0.48), new THREE.Vector3(0.7, -0.18, 0.1),
      new THREE.Vector3(2.25, -0.2, 0.72),
    ], 0x3a86ff, 0.05, 0.88)
    river.userData.flow = { phase: 0.1 }
    group.add(river)
    return
  }

  if (['ecosystem', 'natureSystem', 'environmentService'].includes(theme)) {
    const rand = seeded(seed + 17)
    for (let i = 0; i < 42; i++) {
      const tree = new THREE.Group()
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.024, 0.18, 6), new THREE.MeshStandardMaterial({ color: 0x6f4e37, roughness: 0.75 }))
      const crown = new THREE.Mesh(new THREE.ConeGeometry(0.07 + rand() * 0.025, 0.24 + rand() * 0.08, 8), new THREE.MeshStandardMaterial({ color: rand() > 0.35 ? 0x3a7d44 : 0x75a743, roughness: 0.74 }))
      trunk.position.y = -0.12
      crown.position.y = 0.08
      tree.add(trunk, crown)
      tree.position.set(-2.25 + rand() * 4.5, -0.16, -1.25 + rand() * 2.5)
      tree.scale.setScalar(0.82 + rand() * 0.5)
      group.add(tree)
    }
    return
  }

  if (['hazard', 'environmentSecurity'].includes(theme)) {
    for (let i = 0; i < 5; i++) {
      const ring = new THREE.Mesh(GeometryFactory.ring(0.23 + i * 0.2, 0.25 + i * 0.2, 96), new THREE.MeshBasicMaterial({ color: colors[i % colors.length], transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false }))
      ring.rotation.x = -Math.PI / 2
      ring.position.y = -0.18 + i * 0.015
      ring.userData.pulse = i * 0.5
      group.add(ring)
    }
    return
  }

  const blockCount = ['urban', 'industry', 'transport', 'cityRegion'].includes(theme) ? 30 : 18
  for (let i = 0; i < blockCount; i++) {
    const height = 0.16 + ((i * 7) % 6) * 0.065
    const block = new THREE.Mesh(GeometryFactory.box(0.13, height, 0.13), new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: 0.64 }))
    block.position.set(-2.2 + (i % 10) * 0.48, -0.29 + height / 2, -0.88 + Math.floor(i / 10) * 0.56)
    group.add(block)
  }
}

function buildNodesAndFlows(group, recipe, labelSystem, colors) {
  const nodeCount = Math.max(4, recipe.nodes?.length || 0)
  const radius = 2.18
  const nodePositions = []
  for (let i = 0; i < nodeCount; i++) {
    const angle = (i / nodeCount) * Math.PI * 2 + Math.PI / 5
    const pos = new THREE.Vector3(Math.cos(angle) * radius, 0.58 + Math.sin(i * 1.7) * 0.12, Math.sin(angle) * 1.18)
    nodePositions.push(pos)
    const marker = new THREE.Mesh(GeometryFactory.sphere(0.11, 32), new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: 0.35, emissive: colors[i % colors.length], emissiveIntensity: 0.09 }))
    marker.position.copy(pos)
    marker.userData.pulse = i * 0.4
    group.add(marker)
    addLabel(labelSystem, group, recipe.nodes?.[i] || `要素${i + 1}`, pos.clone().add(new THREE.Vector3(0, 0.23, 0)), '#' + colors[i % colors.length].toString(16).padStart(6, '0'))
  }

  for (let i = 0; i < nodePositions.length; i++) {
    const a = nodePositions[i]
    const b = nodePositions[(i + 1) % nodePositions.length]
    const mid = a.clone().lerp(b, 0.5).add(new THREE.Vector3(0, 0.28 + (i % 2) * 0.12, 0))
    const line = makeLine([a, mid, b], colors[(i + 1) % colors.length], 0.024, 0.64)
    line.userData.flow = { phase: i / nodePositions.length }
    group.add(line)
    if (recipe.flows?.[i]) addLabel(labelSystem, group, recipe.flows[i], mid.clone().add(new THREE.Vector3(0, 0.16, 0)), '#dfe7ff', '10px')
  }
}

function buildLayerStack(group, recipe, labelSystem, colors) {
  const layers = recipe.layers || []
  layers.slice(0, 5).forEach((layer, i) => {
    const mesh = new THREE.Mesh(GeometryFactory.box(0.78, 0.045, 0.3), new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: 0.7, transparent: true, opacity: 0.88 }))
    mesh.position.set(2.72, -0.14 + i * 0.12, -1.12)
    group.add(mesh)
    addLabel(labelSystem, group, layer, mesh.position.clone().add(new THREE.Vector3(0, 0.055, 0)), '#ffffff', '9px')
  })
}

export function ChapterConceptModule(scene, params, services) {
  const { labelSystem } = services
  const group = new THREE.Group()
  const recipe = params.recipe || {}
  const colors = palette(recipe.theme)
  const seed = hashString(`${recipe.book || ''}|${recipe.chapter || ''}|${recipe.section || ''}|${recipe.title || ''}`)

  group.add(GeometryFactory.starField(params.mode === 'professional' ? 900 : 520, 30))
  buildTerrain(group, recipe, colors, seed)
  buildCentralModel(group, recipe, colors, seed)
  buildNodesAndFlows(group, recipe, labelSystem, colors)
  buildLayerStack(group, recipe, labelSystem, colors)

  addLabel(labelSystem, group, `${recipe.chapter || ''} ${recipe.chapterTitle || recipe.title || '章节3D'}`.trim(), new THREE.Vector3(0, 1.8, 0), '#ffffff', '15px')
  if (recipe.sectionTitle) addLabel(labelSystem, group, `当前：${recipe.section || ''} ${recipe.sectionTitle}`.trim(), new THREE.Vector3(0, 1.5, 0), '#c9d8ff', '11px')

  const api = {
    update(dt, elapsed) {
      group.rotation.y += dt * 0.038
      group.traverse((obj) => {
        if (obj.userData.spin) obj.rotation.y += dt * obj.userData.spin
        if (obj.userData.pulse !== undefined) {
          const s = 1 + Math.sin(elapsed * 1.8 + obj.userData.pulse) * 0.055
          obj.scale.setScalar(s)
        }
        if (obj.userData.breath !== undefined) {
          const s = 1 + Math.sin(elapsed * 0.9 + obj.userData.breath) * 0.012
          obj.scale.setScalar(s)
        }
        if (obj.userData.flow && obj.material) {
          obj.material.opacity = 0.48 + Math.sin(elapsed * 1.45 + obj.userData.flow.phase * Math.PI * 2) * 0.16
        }
      })
    },
    setParams(next) {
      if (next.recipe && next.recipe !== recipe) {
        // Full recipe replacement is handled by the host by reloading the module.
      }
    },
    dispose() {},
  }
  group.userData = { api }
  return group
}
