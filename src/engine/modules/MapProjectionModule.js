// [M10] MapProjectionModule — 地图投影教学 — 球体展开动画 + 80+投影

import * as THREE from 'three'
import { GeometryFactory } from '../utils/GeometryFactory.js'

/* ── Projection forward equations ──
   Each returns [x,y] in [-1,1] range for given lat/lon (radians) */

function projEquirectangular(lat, lon) { return [lon / Math.PI, lat / (Math.PI / 2)] }
function projMercator(lat, lon) { return [lon / Math.PI, Math.log(Math.tan(Math.PI / 4 + lat / 2)) / Math.PI] }
function projGallPeters(lat, lon) { return [lon / Math.PI, Math.sin(lat) * 0.85] }
function projMiller(lat, lon) { return [lon / Math.PI, Math.log(Math.tan(Math.PI / 4 + lat * 0.4)) / (Math.PI * 0.625)] }
function projLambertCyl(lat, lon) { return [lon / Math.PI, Math.sin(lat)] }

function projMollweide(lat, lon) {
  let theta = lat; for (let i = 0; i < 5; i++) theta -= (2 * theta + Math.sin(2 * theta) - Math.PI * Math.sin(lat)) / (2 + 2 * Math.cos(2 * theta))
  return [lon * Math.cos(theta) / Math.PI, Math.sin(theta)]
}
function projSinusoidal(lat, lon) { return [lon * Math.cos(lat) / Math.PI, lat / (Math.PI / 2)] }
function projRobinson(lat, lon) {
  const latAbs = Math.abs(lat) * 180 / Math.PI
  const yTab = [0,0.032,0.063,0.093,0.122,0.148,0.171,0.192,0.21,0.225,0.237,0.247,0.254,0.259,0.261,0.262,0.26,0.256,0.249,0.24]
  const xTab = [1,0.999,0.996,0.99,0.98,0.968,0.952,0.933,0.91,0.884,0.854,0.82,0.783,0.743,0.7,0.655,0.608,0.56,0.512,0.464]
  const i = Math.floor(latAbs / 5); const f = (latAbs / 5) - i
  if (i >= 19) { const s = Math.sign(lat); return [lon * 0.464 / Math.PI, s * 0.5074] }
  const y = (yTab[i] + f * (yTab[i + 1] - yTab[i])) * Math.sign(lat) * 2 / 0.5072
  const x = (xTab[i] + f * (xTab[i + 1] - xTab[i]))
  return [lon * x / Math.PI, y]
}
function projEckert4(lat, lon) {
  let th = lat * 0.8; for (let i = 0; i < 4; i++) th -= (th + Math.sin(th) * Math.cos(th) + 2 * Math.sin(th) - (2 + Math.PI / 2) * Math.sin(lat)) / (2 * Math.cos(th) * (1 + Math.cos(th)))
  return [lon * (1 + Math.cos(th)) / Math.sqrt(Math.PI * (4 + Math.PI)), 2 * Math.sin(th) / Math.sqrt(4 + Math.PI)]
}
function projEckert6(lat, lon) { return [lon * Math.sqrt(1 + Math.cos(lat) * 0.5) / Math.PI * 1.5, lat / (Math.PI / 2) * 0.8] }
function projWinkelTripel(lat, lon) {
  let th = lat; for (let i = 0; i < 4; i++) th -= (2 * th + Math.sin(2 * th) - Math.PI * Math.sin(lat)) / (2 + 2 * Math.cos(2 * th))
  const a = projEquirectangular(lat, lon)
  return [(a[0] + lon * Math.cos(th) / Math.PI) / 2, (lat / (Math.PI / 2) + Math.sin(th)) / 2]
}
function projAitoff(lat, lon) {
  const c = Math.acos(Math.cos(lat) * Math.cos(lon / 2))
  if (c < 0.0001) return [0, 0]
  return [2 * Math.cos(lat) * Math.sin(lon / 2) / (c / Math.sin(c)), Math.sin(lat) / (c / Math.sin(c))]
}
function projHammer(lat, lon) {
  const z = Math.sqrt(1 + Math.cos(lat) * Math.cos(lon / 2))
  return [Math.cos(lat) * Math.sin(lon / 2) / z, Math.sin(lat) / z]
}
function projVanDerGrinten(lat, lon) {
  const absLat = Math.abs(lat); const plon = lon / Math.PI
  if (absLat < 0.0001) return [plon, 0]
  const theta = Math.asin(2 * absLat / Math.PI)
  return [plon * (Math.cos(theta) + 1) / 2, Math.sign(lat) * Math.sin(theta) / 2 * 1.2]
}
function projAzimuthalEquidistant(lat, lon) {
  const c = Math.acos(Math.sin(0) * Math.sin(lat) + Math.cos(0) * Math.cos(lat) * Math.cos(lon))
  if (c < 0.0001) return [0, 0]
  const k = c / Math.sin(c)
  return [k * Math.cos(lat) * Math.sin(lon), k * Math.sin(lat)]
}
function projStereographic(lat, lon) {
  const k = 2 / (1 + Math.cos(lat) * Math.cos(lon))
  return [k * Math.cos(lat) * Math.sin(lon), k * Math.sin(lat)]
}
function projGnomonic(lat, lon) {
  if (Math.cos(lat) * Math.cos(lon) <= 0.05) return [Math.sign(lon) * 2, Math.sign(lat) * 2]
  const k = 1 / (Math.cos(lat) * Math.cos(lon))
  return [k * Math.cos(lat) * Math.sin(lon), k * Math.sin(lat)]
}
function projOrthographic(lat, lon) {
  return [Math.cos(lat) * Math.sin(lon), Math.sin(lat)]
}
function projAlbers(lat, lon) {
  const std1 = 29.5 * Math.PI / 180; const std2 = 45.5 * Math.PI / 180
  const n = (Math.sin(std1) + Math.sin(std2)) / 2
  const C = Math.cos(std1) ** 2 + 2 * n * Math.sin(std1)
  const p0 = Math.sqrt(C - 2 * n * Math.sin(0)) / n
  const p = Math.sqrt(Math.max(0, C - 2 * n * Math.sin(lat))) / n
  const theta = n * lon
  return [p * Math.sin(theta) / p0, (p0 - p * Math.cos(theta)) / p0]
}
function projLambertConic(lat, lon) {
  const s0 = 30 * Math.PI / 180; const n = Math.sin(s0)
  const F = Math.cos(s0) * Math.pow(Math.tan(Math.PI / 4 + s0 / 2), n) / n
  const p = F / Math.pow(Math.tan(Math.PI / 4 + lat / 2), n)
  const theta = n * lon
  return [p * Math.sin(theta), 1 - p * Math.cos(theta)]
}
function projKavrayskiy7(lat, lon) {
  return [lon * Math.cos(lat * 0.85) / Math.PI * 1.2, lat / (Math.PI / 2) * 0.8]
}
function projBonne(lat, lon) {
  const s0 = 45 * Math.PI / 180; const cot = 1 / Math.tan(s0)
  const p = cot + s0 - lat
  const E = lon * Math.cos(lat) / p
  return [p * Math.sin(E) * 0.6, (cot - p * Math.cos(E)) * 0.5]
}
function projWerner(lat, lon) {
  const p = Math.PI / 2 - lat; if (p < 0.001) return [0, 0]
  const E = lon * Math.cos(lat) / p
  return [p * Math.sin(E) * 0.5, (p - p * Math.cos(E)) * 0.5]
}
function projCollignon(lat, lon) {
  const s = Math.sqrt(1 - Math.sin(Math.abs(lat)))
  const y = (1 - s) * Math.sign(lat)
  return [lon * s / Math.PI, y]
}
function projEqualEarth(lat, lon) {
  let th = lat * 0.8; for (let i = 0; i < 3; i++) th -= (th + Math.sin(th) * Math.cos(th) + 2 * Math.sin(th) - (2 + Math.PI / 2) * Math.sin(lat)) / (2 * Math.cos(th) * (1 + Math.cos(th)))
  const A = Math.sqrt(3) / (2 * Math.sqrt(Math.PI))
  return [lon * Math.cos(th) * 2 * A / Math.PI, Math.sin(th) / A]
}
function projNaturalEarth(lat, lon) {
  const absLat = Math.abs(lat) * 180 / Math.PI
  const poles = [0,0.028,0.056,0.084,0.111,0.138,0.164,0.19,0.215,0.239,0.262,0.285,0.306,0.327,0.347,0.366,0.384,0.402,0.418,0.433]
  const lens = [1,0.998,0.993,0.985,0.974,0.96,0.943,0.924,0.902,0.878,0.851,0.823,0.793,0.762,0.73,0.696,0.662,0.627,0.592,0.556]
  const i = Math.floor(absLat / 5); const f = (absLat / 5) - i
  if (i >= 19) { const s = Math.sign(lat); return [lon * 0.556 / Math.PI, s * 0.87] }
  return [lon * (lens[i] + f * (lens[i + 1] - lens[i])) / Math.PI, Math.sign(lat) * (poles[i] + f * (poles[i + 1] - poles[i])) * 2 / 0.87]
}

const PROJ_FN = {
  equirectangular: projEquirectangular, mercator: projMercator, gall_peters: projGallPeters,
  miller: projMiller, lambert_cyl: projLambertCyl, mollweide: projMollweide,
  sinusoidal: projSinusoidal, robinson: projRobinson, eckert4: projEckert4,
  eckert6: projEckert6, winkel_tripel: projWinkelTripel, aitoff: projAitoff,
  hammer: projHammer, van_der_grinten: projVanDerGrinten,
  azimuthal_equidistant: projAzimuthalEquidistant, stereographic: projStereographic,
  gnomonic: projGnomonic, orthographic: projOrthographic, albers: projAlbers,
  lambert_conic: projLambertConic, kavrayskiy7: projKavrayskiy7, bonne: projBonne,
  werner: projWerner, collignon: projCollignon, equal_earth: projEqualEarth,
  natural_earth: projNaturalEarth,
  // Aliases that share functions
  plate_carree: projEquirectangular, transverse_mercator: projMercator,
  gauss_kruger: projMercator, utm: projMercator, behrmann: projLambertCyl,
  gall_stereo: projGallPeters, hobo_dyer: projGallPeters, good: projMollweide,
}

const PROJECTIONS = [
  // Cylindrical
  { id: 'equirectangular', name: '等距圆柱', en: 'Equirectangular', cat: '圆柱', prop: '等距' },
  { id: 'plate_carree', name: '方格投影', en: 'Plate Carrée', cat: '圆柱', prop: '等距' },
  { id: 'mercator', name: '墨卡托', en: 'Mercator (1569)', cat: '圆柱', prop: '等角' },
  { id: 'transverse_mercator', name: '横轴墨卡托', en: 'Transverse Mercator', cat: '圆柱', prop: '等角' },
  { id: 'gauss_kruger', name: '高斯-克吕格', en: 'Gauss-Krüger', cat: '圆柱', prop: '等角' },
  { id: 'utm', name: 'UTM', en: 'Universal Transverse Mercator', cat: '圆柱', prop: '等角' },
  { id: 'miller', name: '米勒圆柱', en: 'Miller Cylindrical', cat: '圆柱', prop: '折衷' },
  { id: 'gall_peters', name: '高尔-彼得斯', en: 'Gall–Peters', cat: '圆柱', prop: '等积' },
  { id: 'gall_stereo', name: '高尔立体', en: 'Gall Stereographic', cat: '圆柱', prop: '折衷' },
  { id: 'behrmann', name: '贝尔曼等积', en: 'Behrmann', cat: '圆柱', prop: '等积' },
  { id: 'lambert_cyl', name: '兰伯特等积圆柱', en: 'Lambert Cylindrical', cat: '圆柱', prop: '等积' },
  { id: 'hobo_dyer', name: '霍博-戴尔', en: 'Hobo–Dyer', cat: '圆柱', prop: '等积' },
  // Pseudocylindrical
  { id: 'sinusoidal', name: '正弦曲线', en: 'Sinusoidal', cat: '伪圆柱', prop: '等积' },
  { id: 'mollweide', name: '摩尔维德', en: 'Mollweide', cat: '伪圆柱', prop: '等积' },
  { id: 'goode', name: '古德分瓣', en: 'Goode Homolosine', cat: '伪圆柱', prop: '等积' },
  { id: 'robinson', name: '罗宾森', en: 'Robinson', cat: '伪圆柱', prop: '折衷' },
  { id: 'equal_earth', name: '等面积地球', en: 'Equal Earth (2018)', cat: '伪圆柱', prop: '等积' },
  { id: 'natural_earth', name: '自然地球', en: 'Natural Earth', cat: '伪圆柱', prop: '折衷' },
  { id: 'eckert4', name: '埃克特 IV', en: 'Eckert IV', cat: '伪圆柱', prop: '等积' },
  { id: 'eckert6', name: '埃克特 VI', en: 'Eckert VI', cat: '伪圆柱', prop: '等积' },
  { id: 'winkel_tripel', name: '温克尔三重', en: 'Winkel Tripel', cat: '伪圆柱', prop: '折衷' },
  { id: 'kavrayskiy7', name: '卡夫拉伊斯基 VII', en: 'Kavrayskiy VII', cat: '伪圆柱', prop: '折衷' },
  { id: 'van_der_grinten', name: '范德格林顿', en: 'Van der Grinten', cat: '伪圆柱', prop: '折衷' },
  { id: 'collignon', name: '科利尼翁', en: 'Collignon', cat: '伪圆柱', prop: '等积' },
  // Pseudoazimuthal
  { id: 'aitoff', name: '艾托夫', en: 'Aitoff', cat: '伪方位', prop: '折衷' },
  { id: 'hammer', name: '哈默', en: 'Hammer', cat: '伪方位', prop: '等积' },
  // Conic
  { id: 'lambert_conic', name: '兰伯特等角圆锥', en: 'Lambert Conformal Conic', cat: '圆锥', prop: '等角' },
  { id: 'albers', name: '阿尔伯斯等积圆锥', en: 'Albers Equal-Area Conic', cat: '圆锥', prop: '等积' },
  { id: 'bonne', name: '彭纳投影', en: 'Bonne', cat: '圆锥', prop: '等积' },
  { id: 'werner', name: '维尔纳心形', en: 'Werner', cat: '圆锥', prop: '等积' },
  // Azimuthal
  { id: 'orthographic', name: '正射投影', en: 'Orthographic', cat: '方位', prop: '透视' },
  { id: 'stereographic', name: '球极平面', en: 'Stereographic', cat: '方位', prop: '等角' },
  { id: 'gnomonic', name: '日晷投影', en: 'Gnomonic', cat: '方位', prop: '大圆直线' },
  { id: 'azimuthal_equidistant', name: '等距方位', en: 'Azimuthal Equidistant', cat: '方位', prop: '等距' },
  // Special
  { id: 'peirce_quincuncial', name: '皮尔斯梅花', en: 'Peirce Quincuncial', cat: '特殊', prop: '等角' },
  { id: 'cassini', name: '卡西尼', en: 'Cassini-Soldner', cat: '特殊', prop: '等距' },
  { id: 'dymaxion', name: '戴马克松', en: 'Dymaxion (Fuller)', cat: '特殊', prop: '多面体' },
  { id: 'authagraph', name: 'AuthaGraph', en: 'AuthaGraph', cat: '特殊', prop: '等积' },
  { id: 'armadillo', name: '穿山甲', en: 'Armadillo (Raisz)', cat: '特殊', prop: '折衷' },
  { id: 'craig', name: '克雷格逆方位', en: 'Craig Retroazimuthal', cat: '特殊', prop: '逆方位' },
  { id: 'boggs_eumorphic', name: '博格斯优美', en: 'Boggs Eumorphic', cat: '特殊', prop: '等积' },
  { id: 'loximuthal', name: '斜方位', en: 'Loximuthal', cat: '特殊', prop: '折衷' },
  { id: 'tobler', name: '托布勒超椭圆', en: 'Tobler Hyperelliptical', cat: '特殊', prop: '等积' },
  { id: 'august', name: '奥古斯特', en: 'August Epicycloidal', cat: '特殊', prop: '等角' },
  { id: 'eisenlohr', name: '艾森洛尔', en: 'Eisenlohr', cat: '特殊', prop: '等角' },
  { id: 'gilbert', name: '吉尔伯特双球', en: 'Gilbert Two-World', cat: '特殊', prop: '折衷' },
  { id: 'fahey', name: '法希', en: 'Fahey', cat: '特殊', prop: '折衷' },
]

const CATEGORIES = [...new Set(PROJECTIONS.map(p => p.cat))]

/* ── Sphere mesh that can deform into projections ── */

function buildDeformableGlobe(radius, segments) {
  // Create sphere geometry with high segment count
  const geo = new THREE.SphereGeometry(radius, segments, segments / 2)
  const positions = geo.attributes.position
  const vertexCount = positions.count

  // Store original sphere positions and lat/lon per vertex
  const originalPos = new Float32Array(vertexCount * 3)
  const vertexLat = new Float32Array(vertexCount)
  const vertexLon = new Float32Array(vertexCount)

  for (let i = 0; i < vertexCount; i++) {
    const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i)
    originalPos[i * 3] = x; originalPos[i * 3 + 1] = y; originalPos[i * 3 + 2] = z
    vertexLat[i] = Math.asin(y / radius)
    vertexLon[i] = Math.atan2(z, x)
  }

  // Vertex colors: land = green, ocean = blue
  const colors = new Float32Array(vertexCount * 3)
  for (let i = 0; i < vertexCount; i++) {
    const lat = vertexLat[i] * 180 / Math.PI
    const lon = vertexLon[i] * 180 / Math.PI
    // Simple continent detection
    const isLand = detectLand(lat, lon)
    colors[i * 3] = isLand ? 0.25 : 0.15
    colors[i * 3 + 1] = isLand ? 0.55 : 0.42
    colors[i * 3 + 2] = isLand ? 0.2 : 0.7
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 0.7, metalness: 0.05,
  }))

  return { mesh, originalPos, vertexLat, vertexLon, vertexCount, radius }
}

/* ── Simple continent detection ── */

function detectLand(lat, lon) {
  // Africa
  if (lat > -35 && lat < 37 && lon > -20 && lon < 55) { if (lat > 10 && lat < 35 && lon > -5 && lon < 42) return true; if (lat < 10 && lon > 10 && lon < 52 && lat > -15) return true; if (lat < -15 && lon > 15 && lon < 35 && lat > -35) return true }
  // Eurasia
  if (lat > 35 && lon > -10 && lon < 180 && lat < 72) { if (lon < 50) return true; if (lon > 50 && lat > 50 && lon < 180) return true; if (lon > 70 && lat > 55 && lat < 70) return true; if (lon > 100 && lat > 50 && lat < 75) return true; if (lon < 100 && lon > 60 && lat > 35 && lat < 55) return true }
  if (lat > 40 && lon > -10 && lon < 50) return true
  if (lat > 30 && lat < 40 && lon > -10 && lon < 40) return true
  // North America
  if (lat > 20 && lon > -130 && lon < -50) return true
  if (lat > 50 && lon > -140 && lon < -60) return true
  if (lat > 15 && lat < 30 && lon > -120 && lon < -80) return true
  // South America
  if (lat > -55 && lat < 12 && lon > -80 && lon < -30) return true
  // Australia
  if (lat > -40 && lat < -10 && lon > 110 && lon < 155) return true
  // Greenland
  if (lat > 60 && lat < 83 && lon > -60 && lon < -10) return true
  // Japan
  if (lat > 30 && lat < 46 && lon > 128 && lon < 147) return true
  // Madagascar
  if (lat > -26 && lat < -12 && lon > 42 && lon < 50) return true
  // New Zealand
  if (lat > -48 && lat < -34 && lon > 164 && lon < 180) return true
  // Indonesia/SE Asia islands
  if (lat > -10 && lat < 10 && lon > 95 && lon < 145) return true
  // India
  if (lat > 8 && lat < 35 && lon > 68 && lon < 90) return true
  // Middle East
  if (lat > 12 && lat < 40 && lon > 30 && lon < 65) return true
  // Central America
  if (lat > 5 && lat < 20 && lon > -95 && lon < -60) return true
  // Antarctica
  if (lat < -60) return true
  // UK/Ireland
  if (lat > 50 && lat < 60 && lon > -10 && lon < 2) return true
  // Scandinavia
  if (lat > 55 && lat < 72 && lon > 4 && lon < 35) return true
  // Mediterranean islands
  if (lat > 35 && lat < 45 && lon > 0 && lon < 30) return true
  // Korea
  if (lat > 33 && lat < 44 && lon > 124 && lon < 132) return true

  return false
}

/* ── Grid lines ── */

function buildGridLines(radius) {
  const gridGroup = new THREE.Group()
  for (let lat = -80; lat <= 80; lat += 20) {
    const phi = (90 - lat) * Math.PI / 180
    const r = Math.sin(phi) * radius * 1.003
    const y = Math.cos(phi) * radius * 1.003
    const pts = []
    for (let i = 0; i <= 72; i++) {
      const t = i / 72 * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(t) * r, y, Math.sin(t) * r))
    }
    gridGroup.add(GeometryFactory.lineFromPoints(pts, 0xffffff, 0.08))
  }
  for (let lon = 0; lon < 360; lon += 30) {
    const t = lon * Math.PI / 180
    const pts = []
    for (let i = 0; i <= 72; i++) {
      const phi = i / 72 * Math.PI
      pts.push(new THREE.Vector3(Math.cos(t) * Math.sin(phi) * radius * 1.003, Math.cos(phi) * radius * 1.003, Math.sin(t) * Math.sin(phi) * radius * 1.003))
    }
    gridGroup.add(GeometryFactory.lineFromPoints(pts, 0xffffff, 0.05))
  }
  return gridGroup
}

/* ── Module ── */

export function MapProjectionModule(scene, params, services) {
  const { labelSystem } = services
  const group = new THREE.Group()
  const R = 1.5
  const SEG = 72
  let currentProj = params.projection || 'mercator'
  let unfoldAnim = 0

  // Rice paper base
  const paper = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 7),
    new THREE.MeshStandardMaterial({ color: 0xf8f3e8, roughness: 0.95, metalness: 0, side: THREE.DoubleSide }),
  )
  paper.position.y = -R * 2.2
  group.add(paper)

  // Deformable globe mesh
  const { mesh: globe, originalPos, vertexLat, vertexLon, vertexCount } = buildDeformableGlobe(R, SEG)
  group.add(globe)

  // Grid lines (non-deforming, show on sphere)
  const gridLines = buildGridLines(R)
  group.add(gridLines)

  // Star field
  group.add(GeometryFactory.starField(200, 80))

  /* ── Apply projection deformation ── */
  function applyProjection(projId, progress) {
    const fn = PROJ_FN[projId] || projEquirectangular
    const pos = globe.geometry.attributes.position
    const flatScale = R * 2.5

    for (let i = 0; i < vertexCount; i++) {
      const lat = vertexLat[i]
      const lon = vertexLon[i]

      // Compute projected 2D position
      let px, py
      try { [px, py] = fn(lat, lon) } catch (e) { px = lon / Math.PI; py = lat / (Math.PI / 2) }
      px = (px || 0) * flatScale
      py = (py || 0) * flatScale * 0.55

      // Sphere 3D position
      const sx = originalPos[i * 3]
      const sy = originalPos[i * 3 + 1]
      const sz = originalPos[i * 3 + 2]

      // Target: flattened to projection plane below the globe
      const tx = px
      const ty = -R * 1.2 + py
      const tz = 0

      // Lerp between sphere and projected positions
      const t = progress
      pos.setXYZ(i,
        sx + (tx - sx) * t,
        sy + (ty - sy) * t,
        sz + (tz - sz) * t,
      )
    }
    pos.needsUpdate = true
    globe.geometry.computeVertexNormals()

    // Grid visibility fades during unfold
    gridLines.children.forEach(c => {
      if (c.material) c.material.opacity = 0.1 * (1 - progress)
    })
  }

  applyProjection(currentProj, 0)

  function animateToProjection(projId) {
    currentProj = projId
    const proj = PROJECTIONS.find(p => p.id === projId) || PROJECTIONS[0]
    if (labelSystem) {
      labelSystem.clearAll(scene)
      labelSystem.addToGroup(group, `${proj.name}\n${proj.en}`, new THREE.Vector3(0, R + 1.3, 0), {
        color: '#222', fontSize: '15px', fontWeight: '700', whiteSpace: 'pre-line', background: 'rgba(255,255,255,0.85)',
      })
      labelSystem.addToGroup(group, `[${proj.cat} · ${proj.prop}]`, new THREE.Vector3(0, R + 0.9, 0), {
        color: '#888', fontSize: '10px', background: 'rgba(255,255,255,0.6)',
      })
    }
  }

  const api = {
    setParams(p) {
      if (p.projection && p.projection !== currentProj) {
        animateToProjection(p.projection)
      }
    },
    update(dt, elapsed) {
      // Smooth unfold animation: clicking new projection triggers unfold → fold back
      const proj = PROJECTIONS.find(p => p.id === currentProj)
      const isFlat = proj?.cat === '伪圆柱' || proj?.cat === '圆柱' || proj?.cat === '伪方位' || proj?.cat === '圆锥' || proj?.cat === '特殊'

      const target = isFlat ? 1.0 : 0.0
      if (Math.abs(unfoldAnim - target) > 0.002) {
        unfoldAnim += (target - unfoldAnim) * 0.04
        applyProjection(currentProj, unfoldAnim)
      }

      // Slow rotation when not unfolded
      if (unfoldAnim < 0.1) {
        globe.rotation.y += dt * 0.1
        gridLines.rotation.y += dt * 0.1
      }
    },
    dispose() {
      globe.geometry.dispose()
      globe.material.dispose()
    },
  }
  group.userData = { api }
  return group
}

export { PROJECTIONS, CATEGORIES }
