// [M10] MapProjectionModule — 地图投影教学 — 球体展开动画

import * as THREE from 'three'

/* ── Projection forward equations (returns [x,y] in [-1,1] range) ── */

const PROJ_FN = {
  equirectangular: (lat, lon) => [lon / Math.PI, lat / (Math.PI / 2)],
  mercator: (lat, lon) => [lon / Math.PI, Math.log(Math.tan(Math.PI / 4 + lat / 2)) / Math.PI],
  miller: (lat, lon) => [lon / Math.PI, Math.log(Math.tan(Math.PI / 4 + lat * 0.4)) / (Math.PI * 0.625)],
  gall_peters: (lat, lon) => [lon / Math.PI, Math.sin(lat) * 0.85],
  mollweide(lat, lon) { let t = lat; for (let i = 0; i < 4; i++) t -= (2 * t + Math.sin(2 * t) - Math.PI * Math.sin(lat)) / (2 + 2 * Math.cos(2 * t)); return [lon * Math.cos(t) / Math.PI, Math.sin(t)] },
  sinusoidal: (lat, lon) => [lon * Math.cos(lat) / Math.PI, lat / (Math.PI / 2)],
  robinson(lat, lon) {
    const a = Math.abs(lat) * 180 / Math.PI
    const yt = [0,0.032,0.063,0.093,0.122,0.148,0.171,0.192,0.21,0.225,0.237,0.247,0.254,0.259,0.261,0.262,0.26,0.256,0.249,0.24]
    const xt = [1,0.999,0.996,0.99,0.98,0.968,0.952,0.933,0.91,0.884,0.854,0.82,0.783,0.743,0.7,0.655,0.608,0.56,0.512,0.464]
    const i = Math.min(18, Math.floor(a / 5)); const f = (a / 5) - i
    const s = Math.sign(lat)
    return [lon * (xt[i] + f * (xt[i + 1] - xt[i])) / Math.PI, s * (yt[i] + f * (yt[i + 1] - yt[i])) * 2 / 0.5072]
  },
  winkel_tripel(lat, lon) { let t = lat; for (let i = 0; i < 4; i++) t -= (2 * t + Math.sin(2 * t) - Math.PI * Math.sin(lat)) / (2 + 2 * Math.cos(2 * t)); return [(lon / Math.PI + lon * Math.cos(t) / Math.PI) / 2, (lat / (Math.PI / 2) + Math.sin(t)) / 2] },
  aitoff(lat, lon) { const c = Math.acos(Math.cos(lat) * Math.cos(lon / 2)) || 0.001; return [2 * Math.cos(lat) * Math.sin(lon / 2) / (c / Math.sin(c)), Math.sin(lat) / (c / Math.sin(c))] },
  hammer(lat, lon) { const z = Math.sqrt(1 + Math.cos(lat) * Math.cos(lon / 2)); return [Math.cos(lat) * Math.sin(lon / 2) / z, Math.sin(lat) / z] },
  orthographic: (lat, lon) => [Math.cos(lat) * Math.sin(lon), Math.sin(lat)],
  stereographic(lat, lon) { const k = 2 / (1 + Math.cos(lat) * Math.cos(lon)); return [k * Math.cos(lat) * Math.sin(lon), k * Math.sin(lat)] },
  gnomonic(lat, lon) { const d = Math.cos(lat) * Math.cos(lon); if (d <= 0.05) return [Math.sign(lon) * 2, Math.sign(lat) * 2]; const k = 1 / d; return [k * Math.cos(lat) * Math.sin(lon), k * Math.sin(lat)] },
  azimuthal_equidistant(lat, lon) { const c = Math.acos(Math.cos(lat) * Math.cos(lon)) || 0.001; const k = c / Math.sin(c); return [k * Math.cos(lat) * Math.sin(lon), k * Math.sin(lat)] },
  bonne(lat, lon) { const s0 = 45 * Math.PI / 180; const cot = 1 / Math.tan(s0); const p = cot + s0 - lat; const E = lon * Math.cos(lat) / (p || 0.001); return [p * Math.sin(E) * 0.6, (cot - p * Math.cos(E)) * 0.5] },
  werner(lat, lon) { const p = Math.PI / 2 - lat; if (p < 0.001) return [0, 0]; const E = lon * Math.cos(lat) / p; return [p * Math.sin(E) * 0.5, (p - p * Math.cos(E)) * 0.5] },
  collignon(lat, lon) { const s = Math.sqrt(1 - Math.sin(Math.abs(lat))); return [lon * s / Math.PI, (1 - s) * Math.sign(lat)] },
  equal_earth(lat, lon) { let t = lat * 0.8; for (let i = 0; i < 3; i++) t -= (t + Math.sin(t) * Math.cos(t) + 2 * Math.sin(t) - (2 + Math.PI / 2) * Math.sin(lat)) / (2 * Math.cos(t) * (1 + Math.cos(t))); const A = Math.sqrt(3) / (2 * Math.sqrt(Math.PI)); return [lon * Math.cos(t) * 2 * A / Math.PI, Math.sin(t) / A] },
  van_der_grinten(lat, lon) { const a = Math.abs(lat), pl = lon / Math.PI; if (a < 0.0001) return [pl, 0]; const th = Math.asin(2 * a / Math.PI); return [pl * (Math.cos(th) + 1) / 2, Math.sign(lat) * Math.sin(th) / 2 * 1.2] },
  kavrayskiy7: (lat, lon) => [lon * Math.cos(lat * 0.85) / Math.PI * 1.2, lat / (Math.PI / 2) * 0.8],
  natural_earth(lat, lon) {
    const a = Math.abs(lat) * 180 / Math.PI
    const yt = [0,0.028,0.056,0.084,0.111,0.138,0.164,0.19,0.215,0.239,0.262,0.285,0.306,0.327,0.347,0.366,0.384,0.402,0.418,0.433]
    const xt = [1,0.998,0.993,0.985,0.974,0.96,0.943,0.924,0.902,0.878,0.851,0.823,0.793,0.762,0.73,0.696,0.662,0.627,0.592,0.556]
    const i = Math.min(18, Math.floor(a / 5)); const f = (a / 5) - i
    return [lon * (xt[i] + f * (xt[i + 1] - xt[i])) / Math.PI, Math.sign(lat) * (yt[i] + f * (yt[i + 1] - yt[i])) * 2 / 0.87]
  },
}

// Aliases
PROJ_FN.plate_carree = PROJ_FN.equirectangular
PROJ_FN.transverse_mercator = PROJ_FN.mercator
PROJ_FN.gauss_kruger = PROJ_FN.mercator
PROJ_FN.utm = PROJ_FN.mercator
PROJ_FN.behrmann = PROJ_FN.gall_peters
PROJ_FN.hobo_dyer = PROJ_FN.gall_peters
PROJ_FN.gall_stereo = PROJ_FN.gall_peters
PROJ_FN.goode = PROJ_FN.mollweide
PROJ_FN.eckert4 = PROJ_FN.equal_earth
PROJ_FN.eckert6 = (lat, lon) => [lon * Math.sqrt(1 + Math.cos(lat) * 0.5) / Math.PI * 1.5, lat / (Math.PI / 2) * 0.8]
PROJ_FN.lambert_cyl = PROJ_FN.gall_peters
PROJ_FN.albers = PROJ_FN.bonne
PROJ_FN.lambert_conic = PROJ_FN.bonne
PROJ_FN.polyconic = PROJ_FN.bonne
PROJ_FN.lambert_azimuthal = PROJ_FN.hammer
PROJ_FN.peirce_quincuncial = PROJ_FN.stereographic
PROJ_FN.cassini = PROJ_FN.equirectangular
PROJ_FN.dymaxion = PROJ_FN.hammer
PROJ_FN.authagraph = PROJ_FN.hammer
PROJ_FN.armadillo = PROJ_FN.van_der_grinten
PROJ_FN.craig = PROJ_FN.azimuthal_equidistant
PROJ_FN.boggs_eumorphic = PROJ_FN.mollweide
PROJ_FN.loximuthal = PROJ_FN.kavrayskiy7
PROJ_FN.tobler = PROJ_FN.equal_earth
PROJ_FN.august = PROJ_FN.hammer
PROJ_FN.eisenlohr = PROJ_FN.stereographic
PROJ_FN.gilbert = PROJ_FN.orthographic
PROJ_FN.fahey = PROJ_FN.bonne

const PROJECTIONS = [
  { id: 'mercator', name: '墨卡托', en: 'Mercator (1569)', cat: '圆柱', prop: '等角' },
  { id: 'transverse_mercator', name: '横轴墨卡托', en: 'Transverse Mercator', cat: '圆柱', prop: '等角' },
  { id: 'equirectangular', name: '等距圆柱', en: 'Equirectangular', cat: '圆柱', prop: '等距' },
  { id: 'gall_peters', name: '高尔-彼得斯', en: 'Gall–Peters', cat: '圆柱', prop: '等积' },
  { id: 'mollweide', name: '摩尔维德', en: 'Mollweide', cat: '伪圆柱', prop: '等积' },
  { id: 'sinusoidal', name: '正弦曲线', en: 'Sinusoidal', cat: '伪圆柱', prop: '等积' },
  { id: 'robinson', name: '罗宾森', en: 'Robinson', cat: '伪圆柱', prop: '折衷' },
  { id: 'winkel_tripel', name: '温克尔三重', en: 'Winkel Tripel', cat: '伪圆柱', prop: '折衷' },
  { id: 'goode', name: '古德分瓣', en: 'Goode Homolosine', cat: '伪圆柱', prop: '等积' },
  { id: 'eckert4', name: '埃克特 IV', en: 'Eckert IV', cat: '伪圆柱', prop: '等积' },
  { id: 'van_der_grinten', name: '范德格林顿', en: 'Van der Grinten', cat: '伪圆柱', prop: '折衷' },
  { id: 'aitoff', name: '艾托夫', en: 'Aitoff', cat: '伪方位', prop: '折衷' },
  { id: 'hammer', name: '哈默', en: 'Hammer', cat: '伪方位', prop: '等积' },
  { id: 'orthographic', name: '正射投影', en: 'Orthographic', cat: '方位', prop: '透视' },
  { id: 'stereographic', name: '球极平面', en: 'Stereographic', cat: '方位', prop: '等角' },
  { id: 'gnomonic', name: '日晷投影', en: 'Gnomonic', cat: '方位', prop: '大圆直线' },
  { id: 'azimuthal_equidistant', name: '等距方位', en: 'Azimuthal Equidistant', cat: '方位', prop: '等距' },
  { id: 'lambert_conic', name: '兰伯特等角圆锥', en: 'Lambert Conformal Conic', cat: '圆锥', prop: '等角' },
  { id: 'albers', name: '阿尔伯斯等积圆锥', en: 'Albers Equal-Area Conic', cat: '圆锥', prop: '等积' },
  { id: 'bonne', name: '彭纳投影', en: 'Bonne', cat: '圆锥', prop: '等积' },
]

const CATEGORIES = [...new Set(PROJECTIONS.map(p => p.cat))]

/* ── Land detection ── */
function isLand(lat, lon) {
  if (lat > -35 && lat < 37 && lon > -20 && lon < 55 && ((lat > 10 && lat < 35 && lon > -5 && lon < 42) || (lat < 10 && lon > 10 && lon < 52 && lat > -15) || (lat < -15 && lon > 15 && lon < 35))) return true
  if (lat > 35 && lat < 72 && lon > -10 && lon < 180 && (lon < 50 || (lon > 50 && lat > 50) || (lon > 100 && lat > 50 && lat < 70))) return true
  if (lat > 40 && lon > -10 && lon < 50) return true
  if (lat > 20 && lon > -130 && lon < -50) return true
  if (lat > 50 && lon > -140 && lon < -60) return true
  if (lat > -55 && lat < 12 && lon > -80 && lon < -30) return true
  if (lat > -40 && lat < -10 && lon > 110 && lon < 155) return true
  if (lat > 60 && lat < 83 && lon > -60 && lon < -10) return true
  if (lat > 30 && lat < 46 && lon > 128 && lon < 147) return true
  if (lat > -26 && lat < -12 && lon > 42 && lon < 50) return true
  if (lat > -48 && lat < -34 && lon > 164 && lon < 180) return true
  if (lat > -10 && lat < 10 && lon > 95 && lon < 145) return true
  if (lat > 8 && lat < 35 && lon > 68 && lon < 90) return true
  if (lat > 12 && lat < 40 && lon > 30 && lon < 65) return true
  if (lat > 5 && lat < 20 && lon > -95 && lon < -60) return true
  if (lat < -60) return true
  if (lat > 50 && lat < 60 && lon > -10 && lon < 2) return true
  if (lat > 55 && lat < 72 && lon > 4 && lon < 35) return true
  return false
}

/* ── Build deformable globe ── */
function buildGlobe(radius, segs) {
  const geo = new THREE.SphereGeometry(radius, segs, segs / 2)
  const count = geo.attributes.position.count
  const orig = new Float32Array(count * 3)
  const lats = new Float32Array(count), lons = new Float32Array(count)
  const colors = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const x = geo.attributes.position.getX(i), y = geo.attributes.position.getY(i), z = geo.attributes.position.getZ(i)
    orig[i * 3] = x; orig[i * 3 + 1] = y; orig[i * 3 + 2] = z
    lats[i] = Math.asin(y / radius)
    lons[i] = Math.atan2(z, x)
    const land = isLand(lats[i] * 180 / Math.PI, lons[i] * 180 / Math.PI)
    colors[i * 3] = land ? 0.22 : 0.12
    colors[i * 3 + 1] = land ? 0.52 : 0.40
    colors[i * 3 + 2] = land ? 0.18 : 0.72
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.65, metalness: 0.05 }))
  return { mesh, orig, lats, lons, count, radius }
}

function buildGrid(radius) {
  const g = new THREE.Group()
  for (let lat = -80; lat <= 80; lat += 20) {
    const phi = (90 - lat) * Math.PI / 180; const r = Math.sin(phi) * radius * 1.003; const y = Math.cos(phi) * radius * 1.003
    const pts = []; for (let i = 0; i <= 72; i++) { const t = i / 72 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(t) * r, y, Math.sin(t) * r)) }
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 })))
  }
  for (let lon = 0; lon < 360; lon += 30) {
    const t = lon * Math.PI / 180; const pts = []
    for (let i = 0; i <= 72; i++) { const phi = i / 72 * Math.PI; pts.push(new THREE.Vector3(Math.cos(t) * Math.sin(phi) * radius * 1.003, Math.cos(phi) * radius * 1.003, Math.sin(t) * Math.sin(phi) * radius * 1.003)) }
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.06 })))
  }
  g.renderOrder = 1
  return g
}

/* ── Module ── */
export function MapProjectionModule(scene, params, services) {
  const { labelSystem } = services
  const group = new THREE.Group()
  const R = 1.5, SEG = 72
  let current = 'mercator'
  let unfold = 0, target = 0

  // Clean paper background (no stars, no 3D space)
  scene.background = new THREE.Color(0xf5f0e8)

  // Globe + grid
  const { mesh: globe, orig, lats, lons, count } = buildGlobe(R, SEG)
  group.add(globe)
  const grid = buildGrid(R)
  group.add(grid)

  // Equator ring
  const eqPts = []; for (let i = 0; i <= 72; i++) { const t = i / 72 * Math.PI * 2; eqPts.push(new THREE.Vector3(Math.cos(t) * R * 1.01, 0, Math.sin(t) * R * 1.01)) }
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(eqPts), new THREE.LineBasicMaterial({ color: 0xcc3333, transparent: true, opacity: 0.3 })))

  /* ── Deform ── */
  function deform(projId, progress) {
    const fn = PROJ_FN[projId] || PROJ_FN.equirectangular
    const pos = globe.geometry.attributes.position
    const S = R * 2.5

    for (let i = 0; i < count; i++) {
      const lat = lats[i], lon = lons[i]
      let px = 0, py = 0
      try { [px, py] = fn(lat, lon) } catch (_) { px = lon / Math.PI; py = lat / (Math.PI / 2) }
      px = (px || 0) * S; py = (py || 0) * S * 0.55

      pos.setXYZ(i,
        orig[i * 3] + (px - orig[i * 3]) * progress,
        orig[i * 3 + 1] + (-R * 0.5 + py - orig[i * 3 + 1]) * progress,
        orig[i * 3 + 2] * (1 - progress),
      )
    }
    pos.needsUpdate = true
    globe.geometry.computeVertexNormals()
    grid.children.forEach(c => { if (c.material) c.material.opacity = 0.1 * (1 - progress) })
  }

  deform(current, 0)

  const api = {
    setParams(p) {
      if (p.projection !== undefined) {
        current = p.projection
        if (p.projection === 'reset') { target = 0 } else { target = 1 }
        const proj = PROJECTIONS.find(x => x.id === p.projection)
        if (labelSystem && proj) {
          labelSystem.clearAll(scene)
          labelSystem.addToGroup(group, `${proj.name} · ${proj.en}`, new THREE.Vector3(0, R + 1.2, 0), {
            color: '#333', fontSize: '16px', fontWeight: '700', background: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap',
          })
          labelSystem.addToGroup(group, `${proj.cat} · ${proj.prop}`, new THREE.Vector3(0, R + 0.85, 0), {
            color: '#999', fontSize: '10px', background: 'rgba(255,255,255,0.6)',
          })
        }
        if (p.projection === 'reset' && labelSystem) {
          labelSystem.clearAll(scene)
          labelSystem.addToGroup(group, '原始状态 · 3D 球体', new THREE.Vector3(0, R + 1.2, 0), {
            color: '#333', fontSize: '16px', fontWeight: '700', background: 'rgba(255,255,255,0.85)',
          })
        }
      }
    },
    update(dt) {
      if (Math.abs(unfold - target) > 0.002) {
        unfold += (target - unfold) * 0.05
        deform(current, unfold)
      }
      if (unfold < 0.1) { globe.rotation.y += dt * 0.08; grid.rotation.y += dt * 0.08 }
    },
    dispose() {},
  }
  group.userData = { api }
  return group
}

export { PROJECTIONS, CATEGORIES }
