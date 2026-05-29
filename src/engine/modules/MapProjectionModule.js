// [M10] MapProjectionModule — 高精度地图投影教学

import * as THREE from 'three'

/* ── High-res Earth texture via canvas ── */
function generateEarthTexture(size) {
  const c = document.createElement('canvas')
  c.width = size; c.height = size / 2
  const ctx = c.getContext('2d')

  // Ocean
  ctx.fillStyle = '#4a90d9'
  ctx.fillRect(0, 0, c.width, c.height)

  // Continent polygons in pixel coords (simplified high-res outlines)
  const drawLand = (polygons, color = '#5a9e3e') => {
    ctx.fillStyle = color
    polygons.forEach(poly => {
      ctx.beginPath()
      poly.forEach(([lon, lat], i) => {
        const x = (lon + 180) / 360 * c.width
        const y = (90 - lat) / 180 * c.height
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.closePath(); ctx.fill()
    })
  }

  // Africa
  drawLand([[[-17,15],[10,15],[12,12],[15,13],[20,13],[25,15],[30,15],[33,18],[34,23],[33,28],[31,30],[26,33],[22,34],[18,34],[12,34],[8,34],[2,32],[-3,30],[-6,28],[-10,26],[-14,24],[-18,22],[-23,20],[-30,18],[-35,20],[-32,18],[-30,16],[-22,15],[-17,15]]])
  // Eurasia
  drawLand([[[-10,36],[-2,37],[5,38],[8,40],[15,42],[20,45],[25,48],[35,50],[45,52],[55,54],[70,56],[80,55],[90,57],[100,58],[110,55],[120,55],[130,52],[140,48],[145,45],[150,48],[155,53],[160,55],[165,58],[170,60],[175,63],[180,65],[180,70],[170,72],[150,71],[130,70],[110,68],[90,67],[70,65],[60,63],[50,60],[40,58],[30,56],[20,54],[10,50],[0,48],[-10,44],[-10,36]]])
  // India
  drawLand([[[68,8],[70,12],[72,18],[74,25],[76,35],[78,33],[80,30],[80,22],[80,15],[78,10],[76,8],[70,8],[68,8]]])
  // Southeast Asia
  drawLand([[[95,-8],[98,-2],[100,5],[102,12],[104,18],[106,20],[108,18],[110,10],[108,2],[106,-5],[104,-8],[100,-8],[98,-10],[95,-8]]])
  // North America
  drawLand([[[-130,55],[-135,60],[-140,65],[-145,70],[-150,72],[-155,70],[-160,65],[-165,60],[-165,55],[-160,50],[-155,45],[-150,40],[-140,38],[-130,35],[-120,30],[-110,25],[-100,22],[-95,20],[-90,15],[-85,12],[-80,10],[-75,15],[-70,20],[-65,25],[-60,30],[-55,35],[-50,40],[-45,45],[-40,50],[-35,55],[-30,60],[-25,65],[-20,70],[-15,75],[-10,80],[0,82],[10,85],[20,82],[30,78],[40,73],[50,68],[60,63],[70,58],[80,55],[90,55],[95,52],[100,50],[95,48],[85,48],[75,50],[65,55],[-130,55]]])
  // South America
  drawLand([[[-80,-5],[-75,5],[-70,10],[-65,5],[-60,2],[-55,0],[-50,-2],[-45,-5],[-40,-8],[-35,-10],[-30,-12],[-25,-15],[-20,-18],[-15,-22],[-10,-25],[-5,-28],[0,-30],[5,-32],[10,-35],[15,-38],[20,-42],[25,-45],[30,-48],[35,-52],[40,-55],[45,-58],[48,-62],[50,-65],[52,-68],[54,-72],[52,-75],[48,-74],[44,-72],[40,-70],[35,-68],[30,-66],[25,-64],[20,-60],[15,-58],[10,-55],[5,-52],[0,-48],[-3,-44],[-8,-40],[-12,-36],[-15,-30],[-18,-25],[-20,-20],[-25,-15],[-30,-12],[-35,-10],[-40,-8],[-45,-5],[-50,-2],[-55,0],[-60,2],[-65,5],[-70,8],[-75,3],[-80,-5]]])
  // Australia
  drawLand([[[115,-15],[118,-18],[122,-22],[125,-25],[128,-28],[132,-32],[135,-35],[138,-35],[140,-33],[142,-30],[144,-25],[145,-20],[146,-15],[148,-10],[150,-8],[152,-12],[153,-18],[152,-25],[150,-30],[148,-35],[145,-38],[142,-40],[138,-38],[135,-35],[132,-32],[128,-30],[125,-28],[122,-25],[118,-22],[115,-18],[115,-15]]])
  // Greenland
  drawLand([[[-50,60],[-45,62],[-40,65],[-35,68],[-30,72],[-25,76],[-20,80],[-20,82],[-30,83],[-40,82],[-50,78],[-55,75],[-60,72],[-65,68],[-60,63],[-55,62],[-50,60]]])
  // Japan
  drawLand([[[130,32],[132,34],[135,36],[138,40],[140,42],[142,42],[144,40],[145,35],[142,32],[140,30],[135,30],[132,32],[130,32]]])
  // Madagascar
  drawLand([[[44,-14],[46,-18],[48,-22],[48,-25],[46,-25],[44,-22],[43,-18],[42,-14],[44,-14]]])
  // NZ
  drawLand([[[166,-35],[168,-37],[170,-40],[172,-42],[174,-44],[176,-46],[178,-47],[174,-45],[170,-43],[168,-40],[166,-37],[166,-35]]])
  // Antarctica
  drawLand([[[-180,-65],[-150,-67],[-120,-70],[-90,-72],[-60,-75],[-30,-78],[0,-80],[30,-78],[60,-75],[90,-72],[120,-70],[150,-67],[180,-65],[150,-68],[120,-71],[90,-73],[60,-76],[30,-79],[0,-78],[-30,-76],[-60,-73],[-90,-71],[-120,-68],[-150,-66],[-180,-65]]])
  // Indonesia arch
  drawLand([[[95,-6],[98,0],[100,2],[104,5],[108,6],[112,5],[116,2],[118,-2],[120,-5],[122,-8],[120,-6],[116,-4],[112,-2],[108,-4],[104,-6],[100,-5],[97,-5],[95,-6]]])
  // Middle East
  drawLand([[[30,28],[33,30],[36,33],[40,35],[45,38],[50,40],[55,38],[58,35],[56,32],[52,30],[48,28],[42,25],[38,22],[35,20],[30,22],[30,28]]])
  // Central America
  drawLand([[[-90,8],[-88,10],[-86,14],[-84,18],[-82,20],[-80,22],[-78,20],[-80,15],[-82,10],[-85,8],[-88,7],[-90,8]]])

  // Coastline detail strokes
  ctx.fillStyle = '#3d6b24'
  ctx.fillRect(0, 0, c.width, 1)
  ctx.fillRect(0, c.height - 1, c.width, 1)

  return new THREE.CanvasTexture(c)
}

/* ── Projection forward equations ── */
const PROJ_FN = {
  equirectangular: (lat, lon) => [lon / Math.PI, lat / (Math.PI / 2)],
  mercator: (lat, lon) => [lon / Math.PI, Math.log(Math.tan(Math.PI / 4 + lat / 2)) / Math.PI],
  gall_peters: (lat, lon) => [lon / Math.PI, Math.sin(lat) * 0.85],
  mollweide(lat, lon) { let t = lat; for (let i = 0; i < 5; i++) t -= (2 * t + Math.sin(2 * t) - Math.PI * Math.sin(lat)) / (2 + 2 * Math.cos(2 * t)); return [lon * Math.cos(t) / Math.PI, Math.sin(t)] },
  sinusoidal: (lat, lon) => [lon * Math.cos(lat) / Math.PI, lat / (Math.PI / 2)],
  robinson(lat, lon) {
    const a = Math.abs(lat) * 180 / Math.PI
    const yt = [0,0.032,0.063,0.093,0.122,0.148,0.171,0.192,0.21,0.225,0.237,0.247,0.254,0.259,0.261,0.262,0.26,0.256,0.249,0.24]
    const xt = [1,0.999,0.996,0.99,0.98,0.968,0.952,0.933,0.91,0.884,0.854,0.82,0.783,0.743,0.7,0.655,0.608,0.56,0.512,0.464]
    const i = Math.min(18, Math.floor(a / 5)), f = (a / 5) - i, s = Math.sign(lat)
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
  van_der_grinten(lat, lon) { const a = Math.abs(lat), pl = lon / Math.PI; if (a < 0.0001) return [pl, 0]; const th = Math.asin(2 * a / Math.PI); return [pl * (Math.cos(th) + 1) / 2, Math.sign(lat) * Math.sin(th) / 2 * 1.2] },
  eckert4(lat, lon) { let t = lat * 0.8; for (let i = 0; i < 3; i++) t -= (t + Math.sin(t) * Math.cos(t) + 2 * Math.sin(t) - (2 + Math.PI / 2) * Math.sin(lat)) / (2 * Math.cos(t) * (1 + Math.cos(t))); const A = Math.sqrt(3) / (2 * Math.sqrt(Math.PI)); return [lon * Math.cos(t) * 2 * A / Math.PI, Math.sin(t) / A] },
}
PROJ_FN.transverse_mercator = PROJ_FN.mercator
PROJ_FN.goode = PROJ_FN.mollweide
PROJ_FN.albers = PROJ_FN.bonne
PROJ_FN.lambert_conic = PROJ_FN.bonne

const PROJECTIONS = [
  { id: 'mercator', name: '墨卡托', en: 'Mercator', cat: '圆柱', prop: '等角' },
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

/* ── Module ── */
export function MapProjectionModule(scene, params, services) {
  const { labelSystem } = services
  const group = new THREE.Group()
  const R = 1.5, SEG = 128
  let current = 'mercator'
  let unfold = 0, target = 0
  let targetPos = null // Pre-computed target positions

  scene.background = new THREE.Color(0xf5f0e8)

  // Generate high-res Earth texture
  const texture = generateEarthTexture(1024)

  // Globe with texture
  const globeGeo = new THREE.SphereGeometry(R, SEG, SEG / 2)
  const globe = new THREE.Mesh(globeGeo, new THREE.MeshStandardMaterial({
    map: texture, roughness: 0.6, metalness: 0.05,
  }))
  group.add(globe)

  // Store original positions
  const count = globeGeo.attributes.position.count
  const orig = new Float32Array(count * 3)
  const lats = new Float32Array(count), lons = new Float32Array(count)
  const pos = globeGeo.attributes.position
  for (let i = 0; i < count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
    orig[i * 3] = x; orig[i * 3 + 1] = y; orig[i * 3 + 2] = z
    lats[i] = Math.asin(y / R); lons[i] = Math.atan2(z, x)
  }

  // Grid lines
  const gridGroup = new THREE.Group()
  for (let lat = -80; lat <= 80; lat += 20) {
    const phi = (90 - lat) * Math.PI / 180; const r = Math.sin(phi) * R * 1.003; const y = Math.cos(phi) * R * 1.003
    const pts = []; for (let i = 0; i <= 72; i++) { const t = i / 72 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(t) * r, y, Math.sin(t) * r)) }
    gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 })))
  }
  for (let lon = 0; lon < 360; lon += 30) {
    const t = lon * Math.PI / 180; const pts = []
    for (let i = 0; i <= 72; i++) { const phi = i / 72 * Math.PI; pts.push(new THREE.Vector3(Math.cos(t) * Math.sin(phi) * R * 1.003, Math.cos(phi) * R * 1.003, Math.sin(t) * Math.sin(phi) * R * 1.003)) }
    gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08 })))
  }
  group.add(gridGroup)

  // Equator ring
  const eqPts = []; for (let i = 0; i <= 72; i++) { const t = i / 72 * Math.PI * 2; eqPts.push(new THREE.Vector3(Math.cos(t) * R * 1.01, 0, Math.sin(t) * R * 1.01)) }
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(eqPts), new THREE.LineBasicMaterial({ color: 0xcc3333, transparent: true, opacity: 0.25 })))

  /* ── Pre-compute target positions ── */
  function computeTarget(projId) {
    const fn = PROJ_FN[projId] || PROJ_FN.equirectangular
    const tp = new Float32Array(count * 3)
    const S = R * 2.5
    for (let i = 0; i < count; i++) {
      const lat = lats[i], lon = lons[i]
      let px = 0, py = 0
      try { [px, py] = fn(lat, lon) } catch (_) { px = lon / Math.PI; py = lat / (Math.PI / 2) }
      tp[i * 3] = (px || 0) * S
      tp[i * 3 + 1] = -R * 0.5 + (py || 0) * S * 0.55
      tp[i * 3 + 2] = 0
    }
    return tp
  }

  // Interpolate between original and target
  function interpolate(progress) {
    const tp = targetPos
    for (let i = 0; i < count; i++) {
      pos.setXYZ(i,
        orig[i * 3] + (tp[i * 3] - orig[i * 3]) * progress,
        orig[i * 3 + 1] + (tp[i * 3 + 1] - orig[i * 3 + 1]) * progress,
        orig[i * 3 + 2] * (1 - progress),
      )
    }
    pos.needsUpdate = true
    globe.geometry.computeVertexNormals()
    gridGroup.children.forEach(c => { if (c.material) c.material.opacity = 0.15 * (1 - progress) })
  }

  targetPos = computeTarget(current)

  const api = {
    setParams(p) {
      if (p.projection !== undefined) {
        if (p.projection === 'reset') {
          current = 'reset'; target = 0
          if (labelSystem) {
            labelSystem.clearAll(scene)
            labelSystem.addToGroup(group, '原始状态 · 3D 球体', new THREE.Vector3(0, R + 1.2, 0), { color: '#333', fontSize: '16px', fontWeight: '700', background: 'rgba(255,255,255,0.85)' })
          }
        } else {
          current = p.projection; target = 1
          targetPos = computeTarget(p.projection)
          const proj = PROJECTIONS.find(x => x.id === p.projection)
          if (labelSystem && proj) {
            labelSystem.clearAll(scene)
            labelSystem.addToGroup(group, `${proj.name} · ${proj.en}`, new THREE.Vector3(0, R + 1.2, 0), { color: '#333', fontSize: '16px', fontWeight: '700', background: 'rgba(255,255,255,0.85)' })
            labelSystem.addToGroup(group, `${proj.cat} · ${proj.prop}`, new THREE.Vector3(0, R + 0.85, 0), { color: '#999', fontSize: '10px', background: 'rgba(255,255,255,0.6)' })
          }
        }
      }
    },
    update(dt) {
      if (Math.abs(unfold - target) > 0.002) {
        unfold += (target - unfold) * 0.05
        if (current !== 'reset' && targetPos) interpolate(unfold)
        else if (current === 'reset') {
          // Interpolate back to sphere
          for (let i = 0; i < count; i++) {
            pos.setXYZ(i,
              pos.getX(i) + (orig[i * 3] - pos.getX(i)) * 0.05,
              pos.getY(i) + (orig[i * 3 + 1] - pos.getY(i)) * 0.05,
              pos.getZ(i) + (orig[i * 3 + 2] - pos.getZ(i)) * 0.05,
            )
          }
          pos.needsUpdate = true
          globe.geometry.computeVertexNormals()
          gridGroup.children.forEach(c => { if (c.material) c.material.opacity += (0.15 - c.material.opacity) * 0.05 })
        }
      }
      if (unfold < 0.1) { globe.rotation.y += dt * 0.08; gridGroup.rotation.y += dt * 0.08 }
    },
    dispose() {},
  }
  group.userData = { api }
  return group
}

export { PROJECTIONS, CATEGORIES }
