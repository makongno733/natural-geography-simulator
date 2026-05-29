// [M10] MapProjectionModule — 地图投影教学模块 — 20+投影类型可视化

import * as THREE from 'three'
import { GeometryFactory } from '../utils/GeometryFactory.js'

const PROJECTIONS = [
  // ── 圆柱投影 Cylindrical ──
  { id: 'equirectangular', name: '等距圆柱', en: 'Equirectangular', category: '圆柱', surf: 'cylinder', params: { standardLat: 0 } },
  { id: 'mercator', name: '墨卡托', en: 'Mercator', category: '圆柱', surf: 'cylinder', params: { standardLat: 0 } },
  { id: 'transverse_mercator', name: '横轴墨卡托', en: 'Transverse Mercator', category: '圆柱', surf: 'cylinder', params: { standardLat: 0, transverse: true } },
  { id: 'utm', name: 'UTM', en: 'Universal Transverse Mercator', category: '圆柱', surf: 'cylinder', params: { standardLat: 0, transverse: true, zones: true } },
  { id: 'gauss_kruger', name: '高斯-克吕格', en: 'Gauss-Krüger', category: '圆柱', surf: 'cylinder', params: { standardLat: 0, transverse: true } },
  { id: 'miller', name: '米勒圆柱', en: 'Miller Cylindrical', category: '圆柱', surf: 'cylinder', params: { standardLat: 0 } },
  { id: 'lambert_cyl', name: '兰伯特等积圆柱', en: 'Lambert Cylindrical Equal-Area', category: '圆柱', surf: 'cylinder', params: { standardLat: 0 } },
  { id: 'gall_peters', name: '高尔-彼得斯', en: 'Gall–Peters', category: '圆柱', surf: 'cylinder', params: { standardLat: 45 } },
  { id: 'gall_stereo', name: '高尔立体', en: 'Gall Stereographic', category: '圆柱', surf: 'cylinder', params: { standardLat: 45 } },
  { id: 'hobo_dyer', name: '霍博-戴尔', en: 'Hobo–Dyer', category: '圆柱', surf: 'cylinder', params: { standardLat: 37.5 } },
  { id: 'behrmann', name: '贝尔曼等积', en: 'Behrmann', category: '圆柱', surf: 'cylinder', params: { standardLat: 30 } },
  { id: 'plate_carree', name: '方格投影', en: 'Plate Carrée', category: '圆柱', surf: 'cylinder', params: { standardLat: 0 } },

  // ── 伪圆柱投影 Pseudocylindrical ──
  { id: 'mollweide', name: '摩尔维德', en: 'Mollweide', category: '伪圆柱', surf: 'pseudo' },
  { id: 'sinusoidal', name: '正弦曲线', en: 'Sinusoidal', category: '伪圆柱', surf: 'pseudo' },
  { id: 'goode', name: '古德分瓣', en: 'Goode Homolosine', category: '伪圆柱', surf: 'pseudo', params: { interrupted: true } },
  { id: 'robinson', name: '罗宾森', en: 'Robinson', category: '伪圆柱', surf: 'pseudo' },
  { id: 'eckert4', name: '埃克特IV', en: 'Eckert IV', category: '伪圆柱', surf: 'pseudo' },
  { id: 'eckert6', name: '埃克特VI', en: 'Eckert VI', category: '伪圆柱', surf: 'pseudo' },
  { id: 'winkel_tripel', name: '温克尔三重', en: 'Winkel Tripel', category: '伪圆柱', surf: 'pseudo' },
  { id: 'van_der_grinten', name: '范德格林顿', en: 'Van der Grinten', category: '伪圆柱', surf: 'pseudo' },
  { id: 'natural_earth', name: '自然地球', en: 'Natural Earth', category: '伪圆柱', surf: 'pseudo' },
  { id: 'kavrayskiy7', name: '卡夫拉伊斯基VII', en: 'Kavrayskiy VII', category: '伪圆柱', surf: 'pseudo' },
  { id: 'aitoff', name: '艾托夫', en: 'Aitoff', category: '伪圆柱', surf: 'pseudo' },
  { id: 'hammer', name: '哈默', en: 'Hammer', category: '伪圆柱', surf: 'pseudo' },

  // ── 圆锥投影 Conic ──
  { id: 'lambert_conic', name: '兰伯特等角圆锥', en: 'Lambert Conformal Conic', category: '圆锥', surf: 'cone', params: { std1: 33, std2: 45 } },
  { id: 'albers', name: '阿尔伯斯等积圆锥', en: 'Albers Equal-Area Conic', category: '圆锥', surf: 'cone', params: { std1: 29.5, std2: 45.5 } },
  { id: 'equidistant_conic', name: '等距圆锥', en: 'Equidistant Conic', category: '圆锥', surf: 'cone', params: { std1: 30, std2: 60 } },
  { id: 'polyconic', name: '多圆锥', en: 'Polyconic', category: '圆锥', surf: 'cone', params: { multi: true } },

  // ── 方位投影 Azimuthal ──
  { id: 'orthographic', name: '正射投影', en: 'Orthographic', category: '方位', surf: 'plane' },
  { id: 'stereographic', name: '球极平面', en: 'Stereographic', category: '方位', surf: 'plane' },
  { id: 'gnomonic', name: '日晷投影', en: 'Gnomonic', category: '方位', surf: 'plane' },
  { id: 'azimuthal_equidistant', name: '等距方位', en: 'Azimuthal Equidistant', category: '方位', surf: 'plane' },
  { id: 'lambert_azimuthal', name: '兰伯特等积方位', en: 'Lambert Azimuthal Equal-Area', category: '方位', surf: 'plane' },

  // ── 折衷/特殊 Compromise ──
  { id: 'peirce_quincuncial', name: '皮尔斯梅花', en: 'Peirce Quincuncial', category: '特殊', surf: 'plane' },
  { id: 'cassini', name: '卡西尼', en: 'Cassini', category: '特殊', surf: 'cylinder', params: { transverse: true } },
  { id: 'armadillo', name: '穿山甲', en: 'Armadillo', category: '特殊', surf: 'pseudo' },
  { id: 'eisenlohr', name: '艾森洛尔', en: 'Eisenlohr', category: '特殊', surf: 'pseudo' },
  { id: 'august', name: '奥古斯特', en: 'August Epicycloidal', category: '特殊', surf: 'pseudo' },
  { id: 'collignon', name: '科利尼翁', en: 'Collignon', category: '特殊', surf: 'pseudo' },
  { id: 'boggs_eumorphic', name: '博格斯优美', en: 'Boggs Eumorphic', category: '特殊', surf: 'pseudo' },
  { id: 'loximuthal', name: '斜方位', en: 'Loximuthal', category: '特殊', surf: 'pseudo' },
  { id: 'tobler_hyperelliptical', name: '托布勒超椭圆', en: 'Tobler Hyperelliptical', category: '特殊', surf: 'pseudo' },
  { id: 'craig', name: '克雷格', en: 'Craig Retroazimuthal', category: '特殊', surf: 'plane' },
]

const CATEGORIES = [...new Set(PROJECTIONS.map(p => p.category))]

function makeGlobe(radius) {
  const group = new THREE.Group()

  // Blue ocean sphere
  const ocean = new THREE.Mesh(
    GeometryFactory.sphere(radius, 64),
    new THREE.MeshStandardMaterial({ color: 0x4a90d9, roughness: 0.5, metalness: 0.1 }),
  )
  group.add(ocean)

  // Continent patches (simplified)
  const landMat = new THREE.MeshStandardMaterial({ color: 0x7ab86a, roughness: 0.8 })
  const patches = [
    [-0.7, 0.38, 0.45, 1.3, 0.55], [0.3, 0.2, -0.75, 1.0, 0.42],
    [0.82, -0.28, 0.32, 0.75, 0.36], [-0.2, -0.45, -0.62, 0.9, 0.3],
    [0.18, 0.58, 0.2, 0.72, 0.22], [-0.4, 0.15, 0.55, 0.6, 0.35],
    [0.5, -0.1, 0.6, 0.55, 0.3],
  ]
  patches.forEach(([x, y, z, sx, sy]) => {
    const patch = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.28, 24), landMat)
    patch.position.set(x, y, z).normalize().multiplyScalar(radius * 1.008)
    patch.lookAt(0, 0, 0)
    patch.scale.set(sx, sy, 1)
    group.add(patch)
  })

  // Wireframe latitude lines
  for (let lat = -80; lat <= 80; lat += 20) {
    const phi = (lat * Math.PI) / 180
    const r = Math.cos(phi) * radius * 1.005
    const y = Math.sin(phi) * radius * 1.005
    const pts = []
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r))
    }
    group.add(GeometryFactory.lineFromPoints(pts, 0xffffff, 0.12))
  }
  // Longitude lines
  for (let lon = 0; lon < 360; lon += 30) {
    const theta = (lon * Math.PI) / 180
    const pts = []
    for (let i = 0; i <= 64; i++) {
      const phi = (i / 64) * Math.PI
      pts.push(new THREE.Vector3(
        Math.cos(theta) * Math.sin(phi) * radius * 1.005,
        Math.cos(phi) * radius * 1.005,
        Math.sin(theta) * Math.sin(phi) * radius * 1.005,
      ))
    }
    group.add(GeometryFactory.lineFromPoints(pts, 0xffffff, 0.08))
  }

  return group
}

function buildProjectionSurface(type, radius, params = {}) {
  const group = new THREE.Group()
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffaa44, transparent: true, opacity: 0.15,
    side: THREE.DoubleSide, depthWrite: false,
  })
  const edgeMat = new THREE.MeshBasicMaterial({
    color: 0xffaa44, transparent: true, opacity: 0.5,
    depthWrite: false,
  })

  const h = radius * 2.2
  const surfR = radius * 1.05

  switch (type) {
    case 'cylinder': {
      if (params.transverse) {
        // Transverse cylinder (horizontal)
        const cylGeo = new THREE.CylinderGeometry(surfR, surfR, h, 48, 1, true)
        cylGeo.rotateZ(Math.PI / 2)
        const cyl = new THREE.Mesh(cylGeo, mat)
        group.add(cyl)
        // Edges
        for (const z of [-h / 2, h / 2]) {
          const ring = new THREE.Mesh(
            GeometryFactory.ring(surfR - 0.01, surfR + 0.01, 64),
            edgeMat,
          )
          ring.position.x = z
          ring.rotation.y = Math.PI / 2
          group.add(ring)
        }
      } else {
        // Regular vertical cylinder
        const cylGeo = new THREE.CylinderGeometry(surfR, surfR, h, 48, 1, true)
        const cyl = new THREE.Mesh(cylGeo, mat)
        group.add(cyl)
        for (const y of [-h / 2, h / 2]) {
          const ring = new THREE.Mesh(
            GeometryFactory.ring(surfR - 0.01, surfR + 0.01, 64),
            edgeMat,
          )
          ring.position.y = y
          ring.rotation.x = -Math.PI / 2
          group.add(ring)
        }
      }
      break
    }
    case 'cone': {
      const coneH = h * 0.8
      const coneR = surfR * 1.3
      const coneGeo = new THREE.CylinderGeometry(0.01, coneR, coneH, 48, 1, true)
      const cone = new THREE.Mesh(coneGeo, mat)
      cone.position.y = -coneH / 2 + radius * 0.5
      group.add(cone)
      const botRing = new THREE.Mesh(
        GeometryFactory.ring(coneR - 0.01, coneR + 0.01, 64),
        edgeMat,
      )
      botRing.position.y = -coneH / 2 + radius * 0.5
      botRing.rotation.x = -Math.PI / 2
      group.add(botRing)
      break
    }
    case 'plane': {
      const planeGeo = new THREE.CircleGeometry(radius * 1.5, 48)
      const plane = new THREE.Mesh(planeGeo, mat)
      plane.position.y = -radius * 0.95
      plane.rotation.x = -Math.PI / 2
      group.add(plane)
      const ring = new THREE.Mesh(
        GeometryFactory.ring(radius * 1.48, radius * 1.52, 64),
        edgeMat,
      )
      ring.rotation.x = -Math.PI / 2
      ring.position.y = -radius * 0.95
      group.add(ring)
      break
    }
    case 'pseudo': {
      // Show an unwrapped flat map plane below the globe
      const mapGeo = new THREE.PlaneGeometry(radius * 3, radius * 1.8)
      const mapPlane = new THREE.Mesh(mapGeo, new THREE.MeshBasicMaterial({
        color: 0x446688, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false,
      }))
      mapPlane.position.y = -radius * 1.3
      group.add(mapPlane)
      // Grid on the map
      for (let i = 0; i <= 12; i++) {
        const x = (i / 12 - 0.5) * radius * 3
        group.add(GeometryFactory.lineFromPoints([
          new THREE.Vector3(x, -radius * 1.29, -radius * 0.9),
          new THREE.Vector3(x, -radius * 1.29, radius * 0.9),
        ], 0x888888, 0.2))
      }
      for (let j = 0; j <= 8; j++) {
        const z = (j / 8 - 0.5) * radius * 1.8
        group.add(GeometryFactory.lineFromPoints([
          new THREE.Vector3(-radius * 1.5, -radius * 1.29, z),
          new THREE.Vector3(radius * 1.5, -radius * 1.29, z),
        ], 0x888888, 0.2))
      }
      break
    }
  }
  return group
}

export function MapProjectionModule(scene, params, services) {
  const { labelSystem } = services
  const group = new THREE.Group()
  const R = 1.5
  let currentProj = params.projection || 'mercator'

  // Rice paper (宣纸) base
  const paperGeo = new THREE.PlaneGeometry(8, 6)
  const paper = new THREE.Mesh(paperGeo, new THREE.MeshStandardMaterial({
    color: 0xf5f0e8, roughness: 0.9, metalness: 0, side: THREE.DoubleSide,
  }))
  paper.position.y = -R * 1.6
  paper.receiveShadow = true
  group.add(paper)

  // Globe
  const globeGroup = new THREE.Group()
  globeGroup.add(makeGlobe(R))
  globeGroup.position.y = 0.3
  group.add(globeGroup)

  // Projection surface group
  const surfGroup = new THREE.Group()
  group.add(surfGroup)

  // Star field
  group.add(GeometryFactory.starField(500, 200))

  function showProjection(projId) {
    surfGroup.clear()
    const proj = PROJECTIONS.find(p => p.id === projId) || PROJECTIONS[0]
    currentProj = projId

    // Build projection surface
    const surf = buildProjectionSurface(proj.surf, R, proj.params || {})
    surfGroup.add(surf)

    // Rotate globe for transverse projections
    if (proj.params?.transverse) {
      globeGroup.rotation.y = Math.PI / 2
    } else {
      globeGroup.rotation.y = 0
    }

    // Labels
    if (labelSystem) {
      labelSystem.clearAll(scene)
      const titleY = R + 1.0
      labelSystem.addToGroup(group, `${proj.name}\n${proj.en}`, new THREE.Vector3(0, titleY, 0), {
        color: '#333', fontSize: '16px', fontWeight: '700', whiteSpace: 'pre-line', background: 'rgba(255,255,255,0.8)',
      })
      labelSystem.addToGroup(group, `[${proj.category}投影]`, new THREE.Vector3(0, titleY - 0.5, 0), {
        color: '#888', fontSize: '11px', background: 'rgba(255,255,255,0.6)',
      })

      // Show key properties
      if (proj.surf === 'cylinder') {
        const t = proj.params?.transverse ? '横轴' : (proj.params?.standardLat === 0 ? '正轴' : '割圆柱')
        labelSystem.addToGroup(group, `切/割于 ${t}`, new THREE.Vector3(R + 1.2, 0.5, 0), {
          color: '#666', fontSize: '10px', background: 'rgba(255,255,255,0.6)',
        })
      }
      if (proj.surf === 'cone') {
        labelSystem.addToGroup(group, `标准纬线 ${proj.params?.std1 || ''}° ${proj.params?.std2 ? '/' + proj.params.std2 + '°' : ''}`, new THREE.Vector3(R + 1.2, 0.5, 0), {
          color: '#666', fontSize: '10px', background: 'rgba(255,255,255,0.6)',
        })
      }
    }
  }

  showProjection(currentProj)

  const api = {
    setParams(p) {
      if (p.projection && p.projection !== currentProj) {
        showProjection(p.projection)
      }
    },
    update(dt, elapsed) {
      globeGroup.rotation.y += dt * 0.1
    },
    dispose() { surfGroup.clear() },
  }
  group.userData = { api }

  return group
}

export { PROJECTIONS, CATEGORIES }
