import * as THREE from 'three'
import { MaterialLibrary } from '../materials/MaterialLibrary.js'
import { GeometryFactory } from '../utils/GeometryFactory.js'

const PLANETS = [
  { name: '水星', radius: 0.9, size: 0.03, color: 0xaaaaaa, period: 0.24 },
  { name: '金星', radius: 1.3, size: 0.05, color: 0xe8cda0, period: 0.62 },
  { name: '地球', radius: 1.8, size: 0.06, color: 0x4a90d9, period: 1.0 },
  { name: '火星', radius: 2.4, size: 0.04, color: 0xcd5c5c, period: 1.88 },
  { name: '木星', radius: 3.3, size: 0.12, color: 0xd4a574, period: 11.86 },
  { name: '土星', radius: 4.2, size: 0.10, color: 0xead6b8, period: 29.46 },
]

export function SolarSystemModule(scene, params, services) {
  const { labelSystem } = services
  const group = new THREE.Group()
  let mode = params.mode || 'simple'
  const isDetailed = mode !== 'simple'
  const sunSegs = isDetailed ? 64 : 32
  const planetSegs = isDetailed ? 48 : 24
  const ringSegs = isDetailed ? 128 : 64

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
  group.add(new THREE.Points(starGeo, starMat))

  const sunGeo = GeometryFactory.sphere(0.35, sunSegs)
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xffaa33 })
  const sun = new THREE.Mesh(sunGeo, sunMat)
  group.add(sun)

  const glowGeo = GeometryFactory.sphere(0.5, 24)
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xffcc66,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  group.add(new THREE.Mesh(glowGeo, glowMat))

  if (labelSystem) {
    labelSystem.addToGroup(group, '太阳', new THREE.Vector3(0, -0.5, 0), {
      color: '#ffaa33',
      fontSize: '14px',
    })
  }

  const planetMeshes = []
  PLANETS.forEach((p, i) => {
    const ring = GeometryFactory.ring(p.radius, p.radius + 0.01, 96)
    ring.rotateX(-Math.PI / 2)
    const ringLine = new THREE.Mesh(ring,
      new THREE.MeshBasicMaterial({ color: p.color, transparent: true, opacity: 0.15, side: THREE.DoubleSide }))
    group.add(ringLine)

    const mesh = new THREE.Mesh(
      GeometryFactory.sphere(p.size, 16),
      MaterialLibrary.pbr({ color: p.color, roughness: 0.6 })
    )
    const initialAngle = (i / PLANETS.length) * Math.PI * 2
    mesh.position.set(Math.cos(initialAngle) * p.radius, 0, Math.sin(initialAngle) * p.radius)
    group.add(mesh)
    planetMeshes.push({ mesh, radius: p.radius, period: p.period, initialAngle })

    if (labelSystem) {
      labelSystem.addToGroup(group, p.name,
        new THREE.Vector3(0, p.size + 0.15, 0).add(mesh.position),
        { color: '#ccc', fontSize: '10px' })
    }
  })

  const earthR = 1.8, marsR = 2.4
  const earthOrbit = GeometryFactory.ring(earthR, earthR + 0.01, 96)
  earthOrbit.rotateX(-Math.PI / 2)
  group.add(new THREE.Mesh(earthOrbit,
    new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.35, side: THREE.DoubleSide })))
  const marsOrbit = GeometryFactory.ring(marsR, marsR + 0.01, 96)
  marsOrbit.rotateX(-Math.PI / 2)
  group.add(new THREE.Mesh(marsOrbit,
    new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.35, side: THREE.DoubleSide })))

  for (const r of [earthR, marsR]) {
    for (const ang of [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2]) {
      const arrowP = new THREE.Vector3(Math.cos(ang) * r, 0.02, Math.sin(ang) * r)
      const dir = new THREE.Vector3(-Math.sin(ang), 0, Math.cos(ang)).normalize()
      group.add(new THREE.ArrowHelper(dir, arrowP, 0.12, r === earthR ? 0x60a5fa : 0xef4444, 0.1, 0.06))
    }
  }

  const aT = (earthR + marsR) / 2
  const cX = earthR + (aT - earthR)
  const sB = Math.sqrt(earthR * marsR)
  const tPts = []
  for (let i = 0; i <= 60; i++) {
    const t = (i / 60) * Math.PI
    tPts.push(new THREE.Vector3(cX + aT * Math.cos(t), 0.03, sB * Math.sin(t)))
  }
  const transferLine = GeometryFactory.lineFromPoints(tPts, 0x44ff88, 0.6)
  group.add(transferLine)

  if (labelSystem) {
    labelSystem.addToGroup(group, '出发 (29.8→11.6 km/s)', new THREE.Vector3(earthR, -0.3, 0),
      { color: '#60a5fa', fontSize: '10px' })
    labelSystem.addToGroup(group, '到达 (火星)', new THREE.Vector3(marsR * Math.cos(Math.PI * 1.35), 0.3, marsR * Math.sin(Math.PI * 1.35)),
      { color: '#ef4444', fontSize: '10px' })
    labelSystem.addToGroup(group, '加速 椭圆飞行 259天', new THREE.Vector3(2.0, 0.5, 0.8),
      { color: '#44ff88', fontSize: '10px' })
  }

  const api = {
    update(dt, elapsed) {
      const secPerYear = 365.25 * 86400 / 10
      planetMeshes.forEach(p => {
        const angle = p.initialAngle + (elapsed / secPerYear) * (2 * Math.PI) / p.period
        p.mesh.position.set(
          Math.cos(angle) * p.radius,
          0,
          Math.sin(angle) * p.radius,
        )
      })
    },
    dispose() {},
  }
  group.userData = { api }

  return group
}
