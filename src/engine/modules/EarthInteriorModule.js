import * as THREE from 'three'
import { MaterialLibrary } from '../materials/MaterialLibrary.js'
import { GeometryFactory } from '../utils/GeometryFactory.js'

const ANNOTATION_LAYERS = [
  { name: '地壳', color: '#4a90d9', pos: [1.4, 0.5, 0], props: ['厚度 5-70km', '温度 地表~1000°C', '组成 花岗岩/玄武岩', '状态 固态'] },
  { name: '地幔', color: '#e67e22', pos: [1.1, -0.8, 0.8], props: ['厚度 ~2900km', '温度 1000-3700°C', '密度 3.3-5.7 g/cm³', '组成 橄榄岩'] },
  { name: '外核', color: '#f39c12', pos: [0.8, 0.6, -0.4], props: ['厚度 ~2210km', '温度 3700-4500°C', '组成 Fe+Ni', '状态 液态'] },
  { name: '内核', color: '#f1c40f', pos: [0.5, -0.3, -0.5], props: ['半径 ~1220km', '温度 ~5500°C', '密度 ~13 g/cm³', '状态 固态'] },
]

const DISCONTINUITIES = [
  { name: '莫霍界面', radius: 1.0, color: '#6688aa' },
  { name: '古登堡界面', radius: 0.85, color: '#6688aa' },
]

function makeCurveTube(points, color, radius = 0.01, opacity = 0.7) {
  const curve = new THREE.CatmullRomCurve3(points)
  const geo = new THREE.TubeGeometry(curve, 96, radius, 8, false)
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  return new THREE.Mesh(geo, mat)
}

function addCutFace(group, clipPlane) {
  // Flat colored disks on the cut face showing each layer
  const layers = [
    { inner: 0, outer: 0.3, color: 0xf1c40f, label: '内核' },
    { inner: 0.3, outer: 0.55, color: 0xf39c12, label: '外核' },
    { inner: 0.55, outer: 0.85, color: 0xe67e22, label: '地幔' },
    { inner: 0.85, outer: 1.0, color: 0x4a90d9, label: '地壳' },
  ]

  layers.forEach(layer => {
    const geo = GeometryFactory.ring(layer.inner, layer.outer, 64)
    geo.rotateY(Math.PI / 2)
    const mat = new THREE.MeshBasicMaterial({
      color: layer.color,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    const disk = new THREE.Mesh(geo, mat)
    disk.position.set(0, 0, 0)
    group.add(disk)
  })

  // Layer boundary rings on sphere surface
  const boundaries = [
    { r: 0.3, color: 0xf1c40f, name: '内核边界' },
    { r: 0.55, color: 0xf39c12, name: '外核边界' },
    { r: 0.85, color: 0xe67e22, name: '莫霍界面' },
  ]

  boundaries.forEach(b => {
    const torusGeo = GeometryFactory.torus(b.r, 0.015, 16, 96)
    const torusMat = new THREE.MeshBasicMaterial({
      color: b.color,
      transparent: true,
      opacity: 0.6,
      clippingPlanes: [clipPlane],
    })
    const torus = new THREE.Mesh(torusGeo, torusMat)
    torus.rotation.x = Math.PI / 2
    group.add(torus)
  })
}

function addLithosphereDetail(group, clipPlane) {
  const plateMat = new THREE.MeshStandardMaterial({
    color: 0x5aa7dc,
    roughness: 0.78,
    metalness: 0.02,
    transparent: true,
    opacity: 0.86,
    clippingPlanes: [clipPlane],
  })

  for (let i = 0; i < 12; i++) {
    const lon = (i / 12) * Math.PI * 2
    const lat = Math.sin(i * 1.7) * 0.42
    const r = 1.012
    const x = Math.cos(lat) * Math.cos(lon) * r
    const y = Math.sin(lat) * r
    const z = Math.cos(lat) * Math.sin(lon) * r
    const chip = new THREE.Mesh(new THREE.IcosahedronGeometry(0.075 + (i % 3) * 0.012, 1), plateMat)
    chip.position.set(x, y, z)
    chip.lookAt(0, 0, 0)
    chip.scale.set(1.3, 0.22, 0.72)
    group.add(chip)
  }
}

function addInteriorDynamics(group) {
  const mantleColors = [0xff6a2a, 0xffaa33, 0xc74a20]
  for (let band = 0; band < 6; band++) {
    const phase = band * Math.PI / 3
    const points = []
    for (let i = 0; i <= 80; i++) {
      const t = i / 80
      const a = phase + t * Math.PI * 1.15
      const r = 0.46 + Math.sin(t * Math.PI) * 0.27
      points.push(new THREE.Vector3(
        Math.cos(a) * r,
        -0.42 + t * 0.84,
        Math.sin(a) * r * 0.75,
      ))
    }
    group.add(makeCurveTube(points, mantleColors[band % mantleColors.length], 0.008, 0.48))
  }

  for (let i = 0; i < 4; i++) {
    const points = []
    const tilt = i * Math.PI * 0.5
    for (let j = 0; j <= 96; j++) {
      const t = j / 96
      const a = t * Math.PI * 2
      const r = 1.18 + Math.sin(a * 2 + i) * 0.05
      points.push(new THREE.Vector3(
        Math.cos(a) * r,
        Math.sin(a) * 0.88,
        Math.sin(a) * r * 0.22,
      ).applyAxisAngle(new THREE.Vector3(0, 1, 0), tilt))
    }
    group.add(makeCurveTube(points, 0x66d9ff, 0.005, 0.22))
  }

  // Mantle convection cells — rising at core, sinking at crust
  for (let cell = 0; cell < 5; cell++) {
    const baseAngle = (cell / 5) * Math.PI * 2
    const baseY = 0
    for (let loop = 0; loop < 3; loop++) {
      const pts = []
      const loopR = 0.65 + loop * 0.08  // radial position in mantle
      const loopH = 0.35  // height range
      const startY = -loopH + (loop % 2) * loopH * 0.5
      for (let j = 0; j <= 48; j++) {
        const t = j / 48
        const a = t * Math.PI * 2
        const x = Math.cos(a) * 0.12 * (1 - Math.abs(t - 0.5) * 2)
        const y = baseY + Math.sin(a) * loopH * 0.4 + (loop - 1) * 0.1
        const z = Math.cos(a) * 0.08
        // Rotate around Y to distribute cells
        pts.push(new THREE.Vector3(x, y, z + loopR).applyAxisAngle(new THREE.Vector3(0, 1, 0), baseAngle))
      }
      group.add(makeCurveTube(pts, 0xff6633, 0.006, 0.35))
    }
  }
}

export function EarthInteriorModule(scene, params, services) {
  const { labelSystem } = services
  const group = new THREE.Group()
  const isProfessional = params.mode === 'professional'

  // Clean vertical cut through center — shows half-sphere cross-section
  const clipPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0.0)

  const innerCoreGeo = GeometryFactory.sphere(0.3, 48)
  const innerCoreMat = MaterialLibrary.clipPBR({
    color: 0xf1c40f,
    clippingPlanes: [clipPlane],
    emissive: 0xf1c40f,
    emissiveIntensity: 0.5,
    metalness: 0.7,
  })
  const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat)
  group.add(innerCore)

  const outerCoreGeo = GeometryFactory.sphere(0.55, 48)
  const outerCoreMat = MaterialLibrary.clipPBR({
    color: 0xf39c12,
    clippingPlanes: [clipPlane],
    emissive: 0xf39c12,
    emissiveIntensity: 0.15,
  })
  const outerCore = new THREE.Mesh(outerCoreGeo, outerCoreMat)
  group.add(outerCore)

  const mantleGeo = GeometryFactory.sphere(0.85, 48)
  const mantleMat = MaterialLibrary.clipPBR({
    color: 0xe67e22,
    clippingPlanes: [clipPlane],
    emissive: 0xe67e22,
    emissiveIntensity: 0.08,
  })
  const mantle = new THREE.Mesh(mantleGeo, mantleMat)
  group.add(mantle)

  const crustGeo = GeometryFactory.sphere(1.0, 48)
  const crustMat = MaterialLibrary.clipPBR({
    color: 0x4a90d9,
    clippingPlanes: [clipPlane],
    roughness: 0.5,
    opacity: 0.8,
  })
  const crust = new THREE.Mesh(crustGeo, crustMat)
  group.add(crust)

  addCutFace(group, clipPlane)
  addLithosphereDetail(group, clipPlane)
  addInteriorDynamics(group)

  DISCONTINUITIES.forEach(d => {
    const torusGeo = GeometryFactory.torus(d.radius, 0.015, 16, 64)
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0x6688aa,
      transparent: true,
      opacity: 0.5,
    })
    const torus = new THREE.Mesh(torusGeo, torusMat)
    torus.rotation.x = Math.PI / 2
    group.add(torus)
  })

  if (labelSystem) {
    ANNOTATION_LAYERS.forEach(l => {
      labelSystem.addToGroup(group, l.name, new THREE.Vector3(...l.pos), {
        color: l.color,
        fontSize: '14px',
        fontWeight: '600',
      })
      if (isProfessional) {
        l.props.forEach((prop, i) => {
          labelSystem.addToGroup(group, prop,
            new THREE.Vector3(l.pos[0], l.pos[1] - 0.22 - i * 0.17, l.pos[2]),
            { color: '#aaa', fontSize: '10px', fontWeight: '400' })
        })
      }
    })
    DISCONTINUITIES.forEach(d => {
      const angle = d.radius === 1.0 ? Math.PI / 4 : -Math.PI / 4
      const px = d.radius * Math.cos(angle)
      const pz = d.radius * Math.sin(angle)
      labelSystem.addToGroup(group, d.name, new THREE.Vector3(px, 0, pz * 1.3), {
        color: d.color,
        fontSize: '11px',
      })
    })
  }

  const api = {
    update(dt, elapsed) {
      group.rotation.y += 0.3 * dt
    },
    setMode(mode) {},
    setParams(params) {},
    dispose() {},
  }
  group.userData = { api }

  return group
}
