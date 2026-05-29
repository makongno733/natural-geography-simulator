// [M10] MapProjectionModule — 地图投影教学 — 球体展开动画+大陆轮廓+40+投影

import * as THREE from 'three'
import { GeometryFactory } from '../utils/GeometryFactory.js'

/* ── Simplified continent outlines (lat/lon pairs projected to 3D) ── */
// Each segment is [lat, lon] pairs tracing continent coastlines
const CONTINENTS = {
  africa: [
    [-35,20],[-30,17],[-28,16],[-22,14],[-17,12],[-12,13],[-5,10],[0,10],[5,13],
    [10,13],[12,11],[15,12],[18,12],[22,13],[26,14],[30,15],[32,17],[33,19],
    [33,23],[32,25],[30,28],[28,31],[25,33],[22,34],[18,35],[12,35],[8,34],
    [2,32],[-2,30],[-5,28],[-10,26],[-15,24],[-20,22],[-25,20],[-30,18],[-35,20],
  ],
  eurasia: [
    [36,-10],[38,0],[40,2],[42,3],[44,6],[46,8],[48,10],[50,14],[54,14],
    [57,13],[60,10],[63,12],[65,15],[67,18],[70,20],[72,25],[73,30],[72,35],
    [70,40],[68,45],[65,50],[60,55],[55,60],[50,65],[45,67],[40,68],[35,70],
    [30,76],[25,80],[20,85],[15,88],[10,90],[5,92],[0,95],[-5,92],[-10,90],
    [-15,85],[-10,80],[-5,75],[5,70],[10,65],[15,60],[20,55],[25,50],[30,45],
    [35,40],[40,35],[42,30],[42,25],[40,20],[38,15],[36,10],[36,-10],
  ],
  northAmerica: [
    [70,-130],[72,-125],[75,-120],[78,-110],[80,-100],[82,-90],[83,-80],
    [82,-70],[80,-60],[78,-55],[76,-50],[74,-45],[72,-40],[70,-35],
    [65,-30],[60,-25],[55,-20],[50,-15],[45,-10],[40,-5],[35,0],
    [30,5],[25,10],[20,12],[18,15],[15,18],[12,20],[8,22],[5,25],
    [2,28],[-5,30],[-10,28],[-15,25],[-20,22],[-25,20],[-30,15],
    [-35,10],[-40,8],[-45,10],[-50,12],[-55,15],[-58,20],[-60,25],
    [-62,30],[-60,35],[-55,40],[-50,45],[-45,50],[-40,55],[-35,60],
    [-30,65],[-25,70],[-20,75],[-15,78],[-10,80],[0,82],[10,85],
    [20,82],[30,78],[40,75],[50,70],[60,65],[65,60],[68,55],
    [70,50],[72,45],[70,40],[68,35],[70,-130],
  ],
  southAmerica: [
    [12,-72],[10,-70],[8,-65],[5,-60],[2,-55],[0,-50],[-2,-45],[-5,-40],
    [-8,-38],[-12,-40],[-18,-42],[-23,-44],[-28,-46],[-30,-48],[-35,-50],
    [-40,-52],[-45,-55],[-48,-58],[-50,-62],[-52,-65],[-54,-68],[-55,-72],
    [-53,-75],[-50,-76],[-45,-74],[-40,-72],[-35,-70],[-30,-72],[-25,-70],
    [-20,-68],[-15,-65],[-10,-62],[-5,-58],[0,-54],[2,-50],[5,-48],[8,-50],
    [10,-55],[12,-62],[14,-68],[12,-72],
  ],
  australia: [
    [-12,130],[-14,128],[-18,126],[-22,124],[-25,122],[-28,120],[-32,118],
    [-35,116],[-35,114],[-33,115],[-30,116],[-25,115],[-20,114],[-18,116],
    [-15,118],[-12,120],[-10,124],[-10,128],[-12,132],[-14,136],[-16,140],
    [-18,144],[-20,146],[-22,148],[-24,150],[-26,152],[-30,154],[-34,153],
    [-30,152],[-25,150],[-20,148],[-15,146],[-12,142],[-12,138],[-12,134],[-12,130],
  ],
  antarctica: [
    [-65,-180],[-67,-150],[-70,-120],[-72,-90],[-75,-60],[-78,-30],[-80,0],
    [-78,30],[-75,60],[-72,90],[-70,120],[-67,150],[-65,180],[-68,150],
    [-70,120],[-73,90],[-76,60],[-78,30],[-80,0],[-78,-30],[-76,-60],
    [-73,-90],[-70,-120],[-67,-150],[-65,-180],
  ],
  greenland: [
    [82,-50],[83,-42],[84,-30],[83,-20],[82,-12],[80,-10],[78,-15],
    [76,-20],[75,-30],[74,-40],[72,-50],[70,-58],[68,-55],[70,-50],
    [75,-42],[78,-38],[80,-42],[82,-50],
  ],
  japan: [
    [43,142],[44,144],[42,146],[36,141],[32,140],[30,142],[32,144],
    [35,145],[38,146],[40,145],[43,142],
  ],
  madagascar: [
    [-12,44],[-14,46],[-18,48],[-22,48],[-25,46],[-25,44],[-22,43],
    [-18,42],[-14,42],[-12,44],
  ],
  newZealand: [
    [-35,172],[-37,174],[-40,176],[-42,174],[-44,172],[-46,170],
    [-45,168],[-43,168],[-40,170],[-37,170],[-35,172],
  ],
  iceland: [
    [66,-18],[66,-14],[65,-12],[63,-14],[63,-20],[64,-22],[66,-20],[66,-18],
  ],
  cuba: [
    [22,-83],[23,-80],[22,-78],[20,-76],[20,-78],[20,-82],[21,-84],[22,-83],
  ],
  sriLanka: [
    [7,80],[8,81],[6,82],[5,80],[6,79],[7,80],
  ],
}

function latLonTo3D(lat, lon, radius) {
  const phi = (90 - lat) * Math.PI / 180
  const theta = (lon + 90) * Math.PI / 180
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

function buildContinentLines(radius) {
  const group = new THREE.Group()
  const lineMat = new THREE.MeshBasicMaterial({
    color: 0x3d5a1e, transparent: true, opacity: 0.7, depthWrite: false,
  })
  Object.values(CONTINENTS).forEach(coords => {
    // Build tube along coastline for visibility
    const pts3d = coords.map(([lat, lon]) => latLonTo3D(lat, lon, radius))
    if (pts3d.length < 3) return
    // Use CatmullRom for smooth curves
    const curve = new THREE.CatmullRomCurve3(pts3d, true)
    const tubeGeo = new THREE.TubeGeometry(curve, pts3d.length * 2, 0.006, 6, true)
    group.add(new THREE.Mesh(tubeGeo, lineMat))
  })
  return group
}

/* ── Projections ── */

const PROJECTIONS = [
  { id: 'equirectangular', name: '等距圆柱', en: 'Equirectangular', cat: '圆柱', surf: 'cylinder' },
  { id: 'mercator', name: '墨卡托', en: 'Mercator', cat: '圆柱', surf: 'cylinder' },
  { id: 'transverse_mercator', name: '横轴墨卡托', en: 'Transverse Mercator', cat: '圆柱', surf: 'cylinder', transverse: true },
  { id: 'utm', name: 'UTM', en: 'Universal Transverse Mercator', cat: '圆柱', surf: 'cylinder', transverse: true },
  { id: 'gauss_kruger', name: '高斯-克吕格', en: 'Gauss-Krüger', cat: '圆柱', surf: 'cylinder', transverse: true },
  { id: 'miller', name: '米勒圆柱', en: 'Miller Cylindrical', cat: '圆柱', surf: 'cylinder' },
  { id: 'lambert_cyl', name: '兰伯特等积圆柱', en: 'Lambert Cyl. Equal-Area', cat: '圆柱', surf: 'cylinder' },
  { id: 'gall_peters', name: '高尔-彼得斯', en: 'Gall–Peters', cat: '圆柱', surf: 'cylinder' },
  { id: 'gall_stereo', name: '高尔立体', en: 'Gall Stereographic', cat: '圆柱', surf: 'cylinder' },
  { id: 'behrmann', name: '贝尔曼等积', en: 'Behrmann', cat: '圆柱', surf: 'cylinder' },
  { id: 'plate_carree', name: '方格投影', en: 'Plate Carrée', cat: '圆柱', surf: 'cylinder' },
  { id: 'mollweide', name: '摩尔维德', en: 'Mollweide', cat: '伪圆柱', surf: 'pseudo' },
  { id: 'sinusoidal', name: '正弦曲线', en: 'Sinusoidal', cat: '伪圆柱', surf: 'pseudo' },
  { id: 'goode', name: '古德分瓣', en: 'Goode Homolosine', cat: '伪圆柱', surf: 'pseudo' },
  { id: 'robinson', name: '罗宾森', en: 'Robinson', cat: '伪圆柱', surf: 'pseudo' },
  { id: 'eckert4', name: '埃克特IV', en: 'Eckert IV', cat: '伪圆柱', surf: 'pseudo' },
  { id: 'eckert6', name: '埃克特VI', en: 'Eckert VI', cat: '伪圆柱', surf: 'pseudo' },
  { id: 'winkel_tripel', name: '温克尔三重', en: 'Winkel Tripel', cat: '伪圆柱', surf: 'pseudo' },
  { id: 'van_der_grinten', name: '范德格林顿', en: 'Van der Grinten', cat: '伪圆柱', surf: 'pseudo' },
  { id: 'natural_earth', name: '自然地球', en: 'Natural Earth', cat: '伪圆柱', surf: 'pseudo' },
  { id: 'aitoff', name: '艾托夫', en: 'Aitoff', cat: '伪圆柱', surf: 'pseudo' },
  { id: 'hammer', name: '哈默', en: 'Hammer', cat: '伪圆柱', surf: 'pseudo' },
  { id: 'lambert_conic', name: '兰伯特等角圆锥', en: 'Lambert Conformal Conic', cat: '圆锥', surf: 'cone' },
  { id: 'albers', name: '阿尔伯斯等积圆锥', en: 'Albers Equal-Area Conic', cat: '圆锥', surf: 'cone' },
  { id: 'equidistant_conic', name: '等距圆锥', en: 'Equidistant Conic', cat: '圆锥', surf: 'cone' },
  { id: 'polyconic', name: '多圆锥', en: 'Polyconic', cat: '圆锥', surf: 'cone' },
  { id: 'orthographic', name: '正射投影', en: 'Orthographic', cat: '方位', surf: 'plane' },
  { id: 'stereographic', name: '球极平面', en: 'Stereographic', cat: '方位', surf: 'plane' },
  { id: 'gnomonic', name: '日晷投影', en: 'Gnomonic', cat: '方位', surf: 'plane' },
  { id: 'azimuthal_equidistant', name: '等距方位', en: 'Azimuthal Equidistant', cat: '方位', surf: 'plane' },
  { id: 'lambert_azimuthal', name: '兰伯特等积方位', en: 'Lambert Azimuthal Equal-Area', cat: '方位', surf: 'plane' },
  { id: 'peirce_quincuncial', name: '皮尔斯梅花', en: 'Peirce Quincuncial', cat: '特殊', surf: 'plane' },
  { id: 'cassini', name: '卡西尼', en: 'Cassini', cat: '特殊', surf: 'cylinder', transverse: true },
  { id: 'armadillo', name: '穿山甲', en: 'Armadillo', cat: '特殊', surf: 'pseudo' },
  { id: 'eisenlohr', name: '艾森洛尔', en: 'Eisenlohr', cat: '特殊', surf: 'pseudo' },
  { id: 'august', name: '奥古斯特', en: 'August Epicycloidal', cat: '特殊', surf: 'pseudo' },
  { id: 'collignon', name: '科利尼翁', en: 'Collignon', cat: '特殊', surf: 'pseudo' },
  { id: 'boggs_eumorphic', name: '博格斯优美', en: 'Boggs Eumorphic', cat: '特殊', surf: 'pseudo' },
  { id: 'loximuthal', name: '斜方位', en: 'Loximuthal', cat: '特殊', surf: 'pseudo' },
  { id: 'tobler', name: '托布勒超椭圆', en: 'Tobler Hyperelliptical', cat: '特殊', surf: 'pseudo' },
  { id: 'craig', name: '克雷格逆方位', en: 'Craig Retroazimuthal', cat: '特殊', surf: 'plane' },
  { id: 'werner', name: '维尔纳心形', en: 'Werner', cat: '特殊', surf: 'pseudo' },
  { id: 'bonne', name: '彭纳', en: 'Bonne', cat: '特殊', surf: 'pseudo' },
  { id: 'fahey', name: '法希', en: 'Fahey', cat: '特殊', surf: 'pseudo' },
  { id: 'gilbert', name: '吉尔伯特', en: 'Gilbert Two-World', cat: '特殊', surf: 'plane' },
]

const CATEGORIES = [...new Set(PROJECTIONS.map(p => p.cat))]

/* ── Projection surface geometry ── */

function buildCylinderSurface(radius, transverse) {
  const g = new THREE.Group()
  const h = radius * 4
  const r = radius * 1.01
  const cylGeo = new THREE.CylinderGeometry(r, r, h, 64, 1, true)
  if (transverse) cylGeo.rotateZ(Math.PI / 2)
  const cyl = new THREE.Mesh(cylGeo, new THREE.MeshBasicMaterial({
    color: 0x4488ff, transparent: true, opacity: 0.08,
    side: THREE.DoubleSide, depthWrite: false,
  }))
  g.add(cyl)
  return g
}

function buildConeSurface(radius) {
  const g = new THREE.Group()
  const coneH = radius * 3
  const coneR = radius * 1.35
  const coneGeo = new THREE.CylinderGeometry(0.01, coneR, coneH, 48, 1, true)
  const cone = new THREE.Mesh(coneGeo, new THREE.MeshBasicMaterial({
    color: 0x44ff88, transparent: true, opacity: 0.08,
    side: THREE.DoubleSide, depthWrite: false,
  }))
  cone.position.y = -coneH / 2 + radius * 0.45
  g.add(cone)
  return g
}

function buildPlaneSurface(radius) {
  const g = new THREE.Group()
  const plane = new THREE.Mesh(
    new THREE.CircleGeometry(radius * 1.6, 48),
    new THREE.MeshBasicMaterial({
      color: 0xff8844, transparent: true, opacity: 0.08,
      side: THREE.DoubleSide, depthWrite: false,
    }),
  )
  plane.position.y = -radius * 0.9
  plane.rotation.x = -Math.PI / 2
  g.add(plane)
  return g
}

/* ── Module ── */

export function MapProjectionModule(scene, params, services) {
  const { labelSystem, cameraRig } = services
  const group = new THREE.Group()
  const R = 1.5
  let currentProj = params.projection || 'mercator'
  let unfoldProgress = 0  // 0=sphere, 1=fully projected
  let targetUnfold = 0
  const surfGroup = new THREE.Group()
  const raysGroup = new THREE.Group()

  // Rice paper (宣纸) base plane
  const paper = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 7),
    new THREE.MeshStandardMaterial({ color: 0xf8f3e8, roughness: 0.95, metalness: 0, side: THREE.DoubleSide }),
  )
  paper.position.y = -R * 2.2
  paper.receiveShadow = true
  group.add(paper)

  // Ocean sphere
  const ocean = new THREE.Mesh(
    GeometryFactory.sphere(R, 72),
    new THREE.MeshStandardMaterial({ color: 0x4a90d9, roughness: 0.5, metalness: 0.1 }),
  )
  group.add(ocean)

  // Greenery patches
  const landGeo = new THREE.SphereGeometry(R * 1.003, 72, 36)
  const landPositions = landGeo.attributes.position
  const landColors = new Float32Array(landPositions.count * 3)
  for (let i = 0; i < landPositions.count; i++) {
    const x = landPositions.getX(i)
    const y = landPositions.getY(i)
    const z = landPositions.getZ(i)
    const lat = Math.asin(y / R) * 180 / Math.PI
    const lon = Math.atan2(z, x) * 180 / Math.PI
    // Check if near any continent point
    let nearLand = false
    for (const coords of Object.values(CONTINENTS)) {
      for (const [clat, clon] of coords) {
        const dlat = lat - clat
        const dlon = ((lon - clon + 540) % 360) - 180
        if (Math.abs(dlat) < 4 && Math.abs(dlon) < 6) { nearLand = true; break }
      }
      if (nearLand) break
    }
    if (nearLand) {
      landColors[i * 3] = 0.35; landColors[i * 3 + 1] = 0.55; landColors[i * 3 + 2] = 0.22
    } else {
      landColors[i * 3] = 0.2; landColors[i * 3 + 1] = 0.4; landColors[i * 3 + 2] = 0.65
    }
  }
  landGeo.setAttribute('color', new THREE.BufferAttribute(landColors, 3))
  const landMesh = new THREE.Mesh(landGeo, new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 0.7, metalness: 0.05, transparent: true, opacity: 0.85,
  }))
  group.add(landMesh)

  // Wireframe grid
  for (let lat = -80; lat <= 80; lat += 20) {
    const phi = (90 - lat) * Math.PI / 180
    const r = Math.sin(phi) * R * 1.006
    const y = Math.cos(phi) * R * 1.006
    const pts = []
    for (let i = 0; i <= 72; i++) {
      const theta = (i / 72) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r))
    }
    group.add(GeometryFactory.lineFromPoints(pts, 0xffffff, 0.1))
  }
  for (let lon = 0; lon < 360; lon += 30) {
    const theta = (lon * Math.PI) / 180
    const pts = []
    for (let i = 0; i <= 72; i++) {
      const phi = (i / 72) * Math.PI
      pts.push(new THREE.Vector3(
        Math.cos(theta) * Math.sin(phi) * R * 1.006,
        Math.cos(phi) * R * 1.006,
        Math.sin(theta) * Math.sin(phi) * R * 1.006,
      ))
    }
    group.add(GeometryFactory.lineFromPoints(pts, 0xffffff, 0.06))
  }

  // Continent outlines as tubes
  const continents = buildContinentLines(R * 1.007)
  group.add(continents)

  // Projection surface + rays
  group.add(surfGroup)
  group.add(raysGroup)

  // Star field
  group.add(GeometryFactory.starField(300, 100))

  /* ── Build projection rays ── */
  function buildRays(proj) {
    raysGroup.clear()
    const rayCount = 200
    const positions = new Float32Array(rayCount * 6)
    const colors = new Float32Array(rayCount * 6)

    for (let i = 0; i < rayCount; i++) {
      const lat = (Math.random() - 0.5) * 170
      const lon = Math.random() * 360 - 180
      const start = latLonTo3D(lat, lon, R * 1.01)

      let end
      if (proj.surf === 'cylinder') {
        if (proj.transverse) {
          end = new THREE.Vector3(start.x, start.y, start.z * 1.8)
        } else {
          const scale = 1 / Math.cos(lat * Math.PI / 180)
          end = new THREE.Vector3(lon / 60 * R * 0.6, lat / 80 * R * 3 * 0.5, R * 1.4)
        }
      } else if (proj.surf === 'cone') {
        end = new THREE.Vector3(start.x * 1.3, start.y * 1.1 - 0.5, start.z * 1.3)
      } else if (proj.surf === 'plane') {
        end = new THREE.Vector3(start.x * 1.5, -R * 0.85, start.z * 1.5)
      } else {
        end = new THREE.Vector3(lon / 70 * R * 0.6, -R * 1.2, lat / 90 * R * 0.5)
      }

      positions[i * 6] = start.x; positions[i * 6 + 1] = start.y; positions[i * 6 + 2] = start.z
      positions[i * 6 + 3] = end.x; positions[i * 6 + 4] = end.y; positions[i * 6 + 5] = end.z
      colors[i * 6] = 1; colors[i * 6 + 1] = 0.8; colors[i * 6 + 2] = 0.3
      colors[i * 6 + 3] = 1; colors[i * 6 + 4] = 0.6; colors[i * 6 + 5] = 0.1
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    const lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.25, depthWrite: false,
    }))
    raysGroup.add(lines)
  }

  function showProjection(projId) {
    surfGroup.clear()
    const proj = PROJECTIONS.find(p => p.id === projId) || PROJECTIONS[0]
    currentProj = projId

    // Build projection surface
    switch (proj.surf) {
      case 'cylinder': surfGroup.add(buildCylinderSurface(R, proj.transverse)); break
      case 'cone': surfGroup.add(buildConeSurface(R)); break
      case 'plane': surfGroup.add(buildPlaneSurface(R)); break
      case 'pseudo': {
        const mapPlane = new THREE.Mesh(
          new THREE.PlaneGeometry(R * 3.2, R * 2),
          new THREE.MeshBasicMaterial({ color: 0x334466, transparent: true, opacity: 0.15, side: THREE.DoubleSide, depthWrite: false }),
        )
        mapPlane.position.y = -R * 1.35
        group.find(c => c === mapPlane) || surfGroup.add(mapPlane)
        surfGroup.add(mapPlane)
        break
      }
    }

    // Projection rays
    buildRays(proj)

    // Rotate globe for transverse
    const globeTarget = proj.transverse ? Math.PI / 2 : 0

    // Labels
    if (labelSystem) {
      labelSystem.clearAll(scene)
      labelSystem.addToGroup(group, `${proj.name}\n${proj.en}`, new THREE.Vector3(0, R + 1.3, 0), {
        color: '#222', fontSize: '15px', fontWeight: '700', whiteSpace: 'pre-line', background: 'rgba(255,255,255,0.85)',
      })
      labelSystem.addToGroup(group, `[${proj.cat}投影]`, new THREE.Vector3(0, R + 0.9, 0), {
        color: '#888', fontSize: '10px', background: 'rgba(255,255,255,0.6)',
      })
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
      // Smooth unfold animation
      if (Math.abs(unfoldProgress - targetUnfold) > 0.001) {
        unfoldProgress += (targetUnfold - unfoldProgress) * 0.05
        const s = 1 + unfoldProgress * 0.15
        ocean.scale.setScalar(s)
        landMesh.scale.setScalar(s)
      }
    },
    dispose() { surfGroup.clear(); raysGroup.clear() },
  }
  group.userData = { api }
  return group
}

export { PROJECTIONS, CATEGORIES }
