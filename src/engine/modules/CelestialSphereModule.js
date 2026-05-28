import * as THREE from 'three'
import { MaterialLibrary } from '../materials/MaterialLibrary.js'
import { GeometryFactory } from '../utils/GeometryFactory.js'

const CELESTIAL_OBJECTS = [
  { id: 'sirius_a', name: '天狼星A', type: '主序星', color: 0xadd8ff, emissiveIntensity: 0.8, pos: [1.6, -0.5, 1.5], size: 0.08 },
  { id: 'betelgeuse', name: '参宿四', type: '红超巨星', color: 0xff4444, emissiveIntensity: 1.2, pos: [-1.3, 1.2, 1.2], size: 0.14 },
  { id: 'sirius_b', name: '天狼星B', type: '白矮星', color: 0xeeeeee, emissiveIntensity: 0.5, pos: [1.4, -0.7, 1.7], size: 0.05 },
  { id: 'cygnus_x1', name: '天鹅座X-1', type: '黑洞', color: 0x440044, emissiveIntensity: 0, pos: [-1.0, 0.8, -1.8], size: 0.04 },
  { id: 'crab_pulsar', name: '蟹状星云脉冲星', type: '中子星', color: 0x00ffcc, emissiveIntensity: 0.7, pos: [0.3, -1.5, 1.6], size: 0.06 },
]

export function CelestialSphereModule(scene, params, services) {
  const { labelSystem } = services
  const group = new THREE.Group()
  const CS_RADIUS = 2.5
  let mode = params.mode || 'simple'
  const sphereSegs = mode === 'simple' ? 24 : 48
  const gridSegs = mode === 'simple' ? 36 : 64

  const originGeo = GeometryFactory.sphere(0.05, 12)
  const originMat = new THREE.MeshBasicMaterial({ color: 0x888888 })
  group.add(new THREE.Mesh(originGeo, originMat))

  for (let lat = -80; lat <= 80; lat += 20) {
    const phi = (lat * Math.PI) / 180
    const r = Math.cos(phi) * CS_RADIUS
    const y = Math.sin(phi) * CS_RADIUS
    const pts = []
    for (let i = 0; i <= gridSegs; i++) {
      const theta = (i / gridSegs) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r))
    }
    group.add(GeometryFactory.lineFromPoints(pts, 0x446688, 0.15))
  }

  for (let lon = 0; lon < 360; lon += 30) {
    const theta = (lon * Math.PI) / 180
    const pts = []
    for (let i = 0; i <= gridSegs; i++) {
      const phi = (i / gridSegs) * Math.PI
      pts.push(new THREE.Vector3(
        Math.cos(theta) * Math.sin(phi) * CS_RADIUS,
        Math.cos(phi) * CS_RADIUS,
        Math.sin(theta) * Math.sin(phi) * CS_RADIUS,
      ))
    }
    group.add(GeometryFactory.lineFromPoints(pts, 0x446688, 0.1))
  }

  // Background star field
  const starCount = 3000
  const starPos = new Float32Array(starCount * 3)
  for (let i = 0; i < starCount * 3; i++) {
    starPos[i] = (Math.random() - 0.5) * 20
  }
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
  const starMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.03,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const stars = new THREE.Points(starGeo, starMat)
  stars.userData._managed = true
  group.add(stars)

  const objectMeshes = {}
  CELESTIAL_OBJECTS.forEach(obj => {
    const pos = new THREE.Vector3(...obj.pos)
    const geo = GeometryFactory.sphere(obj.size, sphereSegs)
    const mat = MaterialLibrary.emissive({
      color: obj.color,
      intensity: obj.emissiveIntensity,
    })
    if (obj.emissiveIntensity === 0) {
      mat.emissive.set(0x000000)
      mat.emissiveIntensity = 0
    }
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.copy(pos)
    mesh.userData = { objectId: obj.id }
    group.add(mesh)
    objectMeshes[obj.id] = mesh

    if (labelSystem) {
      labelSystem.addToGroup(group, obj.name,
        pos.clone().add(new THREE.Vector3(0, obj.size + 0.15, 0)),
        { color: '#' + obj.color.toString(16).padStart(6, '0'), fontSize: '11px' })
    }
  })

  const cygnusPos = new THREE.Vector3(-1.0, 0.8, -1.8)
  const diskGeo = GeometryFactory.ring(0.06, 0.14, 48)
  diskGeo.rotateX(-Math.PI / 2)
  const diskMat = new THREE.MeshBasicMaterial({
    color: 0xcc66ff,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
  })
  const disk = new THREE.Mesh(diskGeo, diskMat)
  disk.position.copy(cygnusPos)
  group.add(disk)

  const pulsarPos = new THREE.Vector3(0.3, -1.5, 1.6)
  const glowGeo = GeometryFactory.ring(0.07, 0.11, 48)
  glowGeo.rotateX(-Math.PI / 2)
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x00ffcc,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
  const glow = new THREE.Mesh(glowGeo, glowMat)
  glow.position.copy(pulsarPos)
  group.add(glow)

  // Animated object references
  const animatedObjects = {
    betelgeuse: objectMeshes['betelgeuse'],
    pulsar: { glow, angle: 0 },
    cygnus: { disk, angle: 0 },
  }

  // Coordinate system visualization groups
  const coordGroups = {}
  const C_RING = CS_RADIUS * 0.85

  function buildCoordSystem(name, axisColor, axisDir, tiltAngle, labels) {
    const g = new THREE.Group()

    // Axis arrow
    const dir = axisDir.clone().normalize()
    const arrow = new THREE.ArrowHelper(dir, new THREE.Vector3(0, 0, 0), CS_RADIUS * 0.9, axisColor, 0.25, 0.12)
    g.add(arrow)

    // Reference plane ring (tilted)
    const ringPts = []
    const q = tiltAngle ? new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir) : null
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2
      const p = new THREE.Vector3(Math.cos(theta) * C_RING, 0, Math.sin(theta) * C_RING)
      if (q) p.applyQuaternion(q)
      ringPts.push(p)
    }
    g.add(GeometryFactory.lineFromPoints(ringPts, axisColor, 0.3))

    // Labels
    if (labelSystem) {
      labels.forEach(l => {
        const pos = typeof l.pos === 'function' ? l.pos() : new THREE.Vector3(...l.pos)
        labelSystem.addToGroup(g, l.text, pos, { color: l.color || '#' + axisColor.toString(16).padStart(6, '0'), fontSize: '11px', fontWeight: '600' })
      })
    }

    g.visible = false
    return g
  }

  // 地平坐标系 — zenith up, horizon ring
  coordGroups.horizontal = buildCoordSystem('地平', 0xffaa33,
    new THREE.Vector3(0, 1, 0), null, [
    { text: '天顶', pos: [0, CS_RADIUS * 0.95, 0] },
    { text: 'N', pos: [0, 0, -CS_RADIUS * 0.92] },
    { text: 'S', pos: [0, 0, CS_RADIUS * 0.92] },
    { text: 'E', pos: [CS_RADIUS * 0.92, 0, 0] },
    { text: 'W', pos: [-CS_RADIUS * 0.92, 0, 0] },
  ])

  // 赤道坐标系 — celestial pole axis, equator ring
  coordGroups.equatorial = buildCoordSystem('赤道', 0x60a5fa,
    new THREE.Vector3(0, 1, 0), null, [
    { text: '天北极', pos: [0, CS_RADIUS * 0.95, 0] },
    { text: '天南极', pos: [0, -CS_RADIUS * 0.95, 0] },
    { text: '春分点 →', pos: [CS_RADIUS * 0.92, 0.05, 0] },
  ])

  // 黄道坐标系 — ecliptic pole (tilted 23.44°)
  const eclipticTilt = 23.44 * Math.PI / 180
  const eclipticPole = new THREE.Vector3(0, Math.cos(eclipticTilt), Math.sin(eclipticTilt))
  coordGroups.ecliptic = buildCoordSystem('黄道', 0x44ff88,
    eclipticPole, eclipticTilt, [
    { text: '黄极', pos: () => eclipticPole.clone().multiplyScalar(CS_RADIUS * 0.95) },
  ])

  // 银道坐标系 — galactic pole (tilted ~62.6°)
  const galacticTilt = 62.6 * Math.PI / 180
  const galacticPole = new THREE.Vector3(0, Math.cos(galacticTilt), Math.sin(galacticTilt))
  coordGroups.galactic = buildCoordSystem('银道', 0xcc66ff,
    galacticPole, galacticTilt, [
    { text: '银极', pos: () => galacticPole.clone().multiplyScalar(CS_RADIUS * 0.95) },
  ])

  // Add all coord groups to scene, default to horizontal visible
  Object.values(coordGroups).forEach(g => group.add(g))
  coordGroups.horizontal.visible = true

  const api = {
    getObjectMeshes() { return objectMeshes },
    setMode(m) { mode = m },
    setParams(p) {
      if (p.mode) { mode = p.mode }
      if (p.coordSystem && coordGroups[p.coordSystem]) {
        Object.keys(coordGroups).forEach(key => {
          coordGroups[key].visible = (key === p.coordSystem)
        })
      }
    },
    update(dt, elapsed) {
      if (mode !== 'professional') return

      // Betelgeuse pulsing
      if (animatedObjects.betelgeuse) {
        const pulse = 1 + Math.sin(elapsed * 0.8) * 0.08
        animatedObjects.betelgeuse.scale.setScalar(pulse)
        const mat = animatedObjects.betelgeuse.material
        if (mat.emissiveIntensity !== undefined) {
          mat.emissiveIntensity = 0.8 + Math.sin(elapsed * 0.8) * 0.4
        }
      }

      // Crab Pulsar beam rotation
      animatedObjects.pulsar.angle += dt * 2.0
      animatedObjects.pulsar.glow.rotation.z = animatedObjects.pulsar.angle
      animatedObjects.pulsar.glow.material.opacity = 0.2 + Math.sin(elapsed * 4) * 0.15

      // Cygnus X-1 accretion disk rotation
      animatedObjects.cygnus.angle += dt * 0.6
      animatedObjects.cygnus.disk.rotation.z = animatedObjects.cygnus.angle
    },
    dispose() {},
  }
  group.userData = { api }

  return group
}
