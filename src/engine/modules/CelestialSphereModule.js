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

  const originGeo = GeometryFactory.sphere(0.05, 12)
  const originMat = new THREE.MeshBasicMaterial({ color: 0x888888 })
  group.add(new THREE.Mesh(originGeo, originMat))

  for (let lat = -80; lat <= 80; lat += 20) {
    const phi = (lat * Math.PI) / 180
    const r = Math.cos(phi) * CS_RADIUS
    const y = Math.sin(phi) * CS_RADIUS
    const pts = []
    for (let i = 0; i <= 36; i++) {
      const theta = (i / 36) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r))
    }
    group.add(GeometryFactory.lineFromPoints(pts, 0x446688, 0.15))
  }

  for (let lon = 0; lon < 360; lon += 30) {
    const theta = (lon * Math.PI) / 180
    const pts = []
    for (let i = 0; i <= 36; i++) {
      const phi = (i / 36) * Math.PI
      pts.push(new THREE.Vector3(
        Math.cos(theta) * Math.sin(phi) * CS_RADIUS,
        Math.cos(phi) * CS_RADIUS,
        Math.sin(theta) * Math.sin(phi) * CS_RADIUS,
      ))
    }
    group.add(GeometryFactory.lineFromPoints(pts, 0x446688, 0.1))
  }

  const objectMeshes = {}
  CELESTIAL_OBJECTS.forEach(obj => {
    const pos = new THREE.Vector3(...obj.pos)
    const geo = GeometryFactory.sphere(obj.size, 16)
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

  if (labelSystem) {
    const sysLabels = [
      { text: '天顶', pos: [0, CS_RADIUS + 0.2, 0], color: '#888' },
      { text: 'N', pos: [0, 0.1, -CS_RADIUS - 0.3], color: '#888' },
      { text: '天赤道', pos: [CS_RADIUS * 0.7, 0.1, 0], color: '#888' },
    ]
    sysLabels.forEach(l => {
      labelSystem.addToGroup(group, l.text, new THREE.Vector3(...l.pos), {
        color: l.color,
        fontSize: '12px',
      })
    })
  }

  const api = {
    getObjectMeshes() { return objectMeshes },
    dispose() {},
  }
  group.userData = { api }

  return group
}
