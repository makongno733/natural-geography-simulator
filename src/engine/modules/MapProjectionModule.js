// [M10] MapProjectionModule — 地图投影教学 — 粗网格展开+高清球体

import * as THREE from 'three'

/* ── High-res Earth texture ── */
function earthTexture(size) {
  const c = document.createElement('canvas')
  c.width = size; c.height = size / 2
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#3a7cc3'; ctx.fillRect(0, 0, c.width, c.height)

  const land = (polys) => { ctx.fillStyle = '#5a9e3e'; polys.forEach(p => { ctx.beginPath(); p.forEach(([lo, la], i) => { const x = (lo + 180) / 360 * c.width; const y = (90 - la) / 180 * c.height; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y) }); ctx.closePath(); ctx.fill() }) }
  const green = (polys) => { ctx.fillStyle = '#7ab86a'; polys.forEach(p => { ctx.beginPath(); p.forEach(([lo, la], i) => { const x = (lo + 180) / 360 * c.width; const y = (90 - la) / 180 * c.height; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y) }); ctx.closePath(); ctx.fill() }) }

  land([[[-17,15],[10,16],[18,18],[22,16],[26,16],[30,20],[34,25],[34,30],[32,32],[28,33],[22,34],[14,34],[6,33],[0,30],[-5,27],[-12,24],[-18,22],[-25,20],[-33,18],[-35,20],[-32,17],[-25,16],[-17,15]]])
  land([[[-10,36],[5,39],[15,44],[30,50],[45,54],[60,56],[75,57],[90,58],[105,58],[120,57],[135,54],[145,50],[150,50],[160,55],[170,60],[180,65],[180,72],[165,72],[145,70],[120,68],[95,66],[72,65],[58,62],[45,58],[32,55],[20,52],[8,48],[-3,44],[-10,36]]])
  green([[[68,10],[72,18],[76,30],[79,35],[81,32],[80,24],[80,16],[78,12],[75,8],[70,8],[68,10]]])
  land([[[-135,55],[-140,62],[-148,70],[-155,72],[-162,68],[-166,62],[-162,52],[-155,42],[-145,36],[-135,32],[-125,26],[-115,22],[-105,18],[-95,15],[-86,12],[-80,8],[-76,12],[-72,18],[-68,25],[-62,32],[-55,38],[-48,44],[-42,50],[-36,55],[-30,62],[-24,68],[-18,76],[-10,82],[0,86],[15,84],[30,80],[42,74],[55,67],[66,60],[76,55],[86,55],[100,50],[98,48],[86,48],[76,52],[-135,55]]])
  land([[[-78,-2],[-72,8],[-68,2],[-60,-6],[-50,-10],[-40,-12],[-28,-18],[-18,-24],[-8,-30],[2,-36],[12,-42],[22,-48],[32,-54],[42,-58],[50,-62],[55,-68],[58,-74],[54,-76],[48,-72],[40,-68],[32,-64],[22,-60],[14,-55],[6,-50],[-2,-44],[-8,-38],[-14,-30],[-20,-22],[-28,-16],[-38,-12],[-48,-8],[-58,-4],[-68,4],[-76,4],[-78,-2]]])
  land([[[115,-14],[118,-20],[124,-26],[132,-32],[138,-36],[142,-34],[145,-26],[148,-18],[150,-10],[152,-14],[152,-22],[148,-32],[142,-38],[135,-38],[128,-32],[120,-24],[115,-18],[115,-14]]])
  land([[[-52,60],[-42,64],[-30,70],[-22,78],[-18,82],[-28,84],[-42,82],[-52,76],[-60,68],[-64,60],[-52,60]]])
  land([[[130,32],[135,38],[140,42],[144,41],[144,36],[140,31],[135,30],[130,32]]])
  land([[[44,-14],[47,-20],[48,-26],[46,-26],[43,-20],[42,-14],[44,-14]]])
  land([[[166,-36],[170,-42],[174,-46],[176,-48],[174,-46],[170,-42],[166,-38],[166,-36]]])
  land([[[-180,-65],[-120,-70],[-60,-76],[0,-82],[60,-76],[120,-70],[180,-65],[120,-72],[60,-78],[0,-80],[-60,-74],[-120,-68],[-180,-65]]])
  land([[[95,0],[105,6],[115,4],[120,-4],[114,-6],[105,-4],[98,-3],[95,0]]])
  land([[[32,29],[38,32],[45,38],[54,40],[58,36],[54,32],[46,28],[38,24],[32,26],[32,29]]])
  land([[[-86,12],[-84,18],[-80,22],[-78,20],[-82,12],[-86,8],[-86,12]]])

  // Ice caps
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.fillRect(0, 0, c.width, c.height * 0.03)
  ctx.fillRect(0, c.height * 0.97, c.width, c.height * 0.03)

  return new THREE.CanvasTexture(c)
}

/* ── Projection equations ── */
const PF = {
  equirectangular: (la, lo) => [lo / Math.PI, la / (Math.PI / 2)],
  mercator: (la, lo) => [lo / Math.PI, Math.log(Math.tan(Math.PI / 4 + la / 2)) / Math.PI * 0.7],
  mollweide(la, lo) { let t = la; for (let i = 0; i < 5; i++) t -= (2 * t + Math.sin(2 * t) - Math.PI * Math.sin(la)) / (2 + 2 * Math.cos(2 * t)); return [lo * Math.cos(t) / Math.PI, Math.sin(t)] },
  sinusoidal: (la, lo) => [lo * Math.cos(la) / Math.PI, la / (Math.PI / 2)],
  robinson(la, lo) { const a = Math.abs(la) * 180 / Math.PI; const yt = [0,0.032,0.063,0.093,0.122,0.148,0.171,0.192,0.21,0.225,0.237,0.247,0.254,0.259,0.261,0.262,0.26,0.256,0.249,0.24]; const xt = [1,0.999,0.996,0.99,0.98,0.968,0.952,0.933,0.91,0.884,0.854,0.82,0.783,0.743,0.7,0.655,0.608,0.56,0.512,0.464]; const i = Math.min(18, Math.floor(a / 5)), f = (a / 5) - i, s = Math.sign(la); return [lo * (xt[i] + f * (xt[i + 1] - xt[i])) / Math.PI, s * (yt[i] + f * (yt[i + 1] - yt[i])) * 2 / 0.5072] },
  winkel_tripel(la, lo) { let t = la; for (let i = 0; i < 4; i++) t -= (2 * t + Math.sin(2 * t) - Math.PI * Math.sin(la)) / (2 + 2 * Math.cos(2 * t)); return [(lo / Math.PI + lo * Math.cos(t) / Math.PI) / 2, (la / (Math.PI / 2) + Math.sin(t)) / 2] },
  aitoff(la, lo) { const c = Math.acos(Math.cos(la) * Math.cos(lo / 2)) || 0.001; return [2 * Math.cos(la) * Math.sin(lo / 2) / (c / Math.sin(c)), Math.sin(la) / (c / Math.sin(c))] },
  hammer(la, lo) { const z = Math.sqrt(1 + Math.cos(la) * Math.cos(lo / 2)); return [Math.cos(la) * Math.sin(lo / 2) / z, Math.sin(la) / z] },
  bonne(la) { const s0 = 45 * Math.PI / 180; const cot = 1 / Math.tan(s0); return { p: cot + s0 - la, cot } },
  van_der_grinten(la, lo) { const a = Math.abs(la), pl = lo / Math.PI; if (a < 0.0001) return [pl, 0]; const th = Math.asin(2 * a / Math.PI); return [pl * (Math.cos(th) + 1) / 2, Math.sign(la) * Math.sin(th) / 2 * 1.2] },
  eckert4(la, lo) { let t = la * 0.8; for (let i = 0; i < 4; i++) t -= (t + Math.sin(t) * Math.cos(t) + 2 * Math.sin(t) - (2 + Math.PI / 2) * Math.sin(la)) / (2 * Math.cos(t) * (1 + Math.cos(t))); const A = Math.sqrt(3) / (2 * Math.sqrt(Math.PI)); return [lo * Math.cos(t) * 2 * A / Math.PI, Math.sin(t) / A] },
}

const PROJECTIONS = [
  { id: 'mercator', name: '墨卡托', en: 'Mercator (1569)', cat: '圆柱', prop: '等角', fn: PF.mercator, desc: '圆柱面切赤道。角度无变形，高纬面积剧烈放大。航海标配，Google Maps沿用。' },
  { id: 'transverse_mercator', name: '横轴墨卡托', en: 'Transverse Mercator', cat: '圆柱', prop: '等角', fn: PF.mercator, desc: '圆柱横置切经线，中央经线附近变形最小。UTM与高斯-克吕格的基础，各国地形图首选。' },
  { id: 'equirectangular', name: '等距圆柱', en: 'Equirectangular', cat: '圆柱', prop: '等距', fn: PF.equirectangular, desc: '经纬线等距正交，最简单投影。计算机纹理映射的标准方式，适合快速显示全球数据。' },
  { id: 'gall_peters', name: '高尔-彼得斯', en: 'Gall–Peters', cat: '圆柱', prop: '等积', fn: PF.mercator, desc: '圆柱割线于45°，面积保真。发展中国家面积不被低估，教科文组织推广用于公正展示。' },
  { id: 'mollweide', name: '摩尔维德', en: 'Mollweide', cat: '伪圆柱', prop: '等积', fn: PF.mollweide, desc: '椭圆外形，面积保真。全球气候带、生物群落分布图的经典选择。' },
  { id: 'sinusoidal', name: '正弦曲线', en: 'Sinusoidal', cat: '伪圆柱', prop: '等积', fn: PF.sinusoidal, desc: '纬线平行等距，面积保真，赤道无变形。MODIS卫星数据标准投影。' },
  { id: 'robinson', name: '罗宾森', en: 'Robinson', cat: '伪圆柱', prop: '折衷', fn: PF.robinson, desc: '查表法拟合，视觉最舒适。国家地理学会1988年前世界全图标准，教科书常用。' },
  { id: 'winkel_tripel', name: '温克尔三重', en: 'Winkel Tripel', cat: '伪圆柱', prop: '折衷', fn: PF.winkel_tripel, desc: '等距圆柱+艾托夫平均。国家地理学会1998年起的世界地图新标准。' },
  { id: 'goode', name: '古德分瓣', en: 'Goode Homolosine', cat: '伪圆柱', prop: '等积', fn: PF.mollweide, desc: '摩尔维德+正弦曲线拼接，分瓣切海洋。面积保真，大陆完整。全球土地利用图。' },
  { id: 'eckert4', name: '埃克特 IV', en: 'Eckert IV', cat: '伪圆柱', prop: '等积', fn: PF.eckert4, desc: '椭圆外形，极点为半长轴一半的直线。面积保真，外形美观。' },
  { id: 'van_der_grinten', name: '范德格林顿', en: 'Van der Grinten', cat: '伪圆柱', prop: '折衷', fn: PF.van_der_grinten, desc: '全球投影在正圆内。国家地理学会1922-1988年世界地图，现已少见。' },
  { id: 'aitoff', name: '艾托夫', en: 'Aitoff', cat: '伪方位', prop: '折衷', fn: PF.aitoff, desc: '横轴方位等距的数学改造，椭圆形。天球图与全球概览常用。' },
  { id: 'hammer', name: '哈默', en: 'Hammer', cat: '伪方位', prop: '等积', fn: PF.hammer, desc: '兰伯特等积方位横向改造。面积保真，外形椭圆。全球人口密度图常用。' },
  { id: 'orthographic', name: '正射投影', en: 'Orthographic', cat: '方位', prop: '透视', flat: false, desc: '从无限远透视地球，如太空中所见。天然直观，科普与标志设计，不用于量测。' },
  { id: 'stereographic', name: '球极平面', en: 'Stereographic', cat: '方位', prop: '等角', flat: false, desc: '平面切极点，对跖点投影。角度保真。极地导航与地质赤平极射投影。' },
  { id: 'gnomonic', name: '日晷投影', en: 'Gnomonic', cat: '方位', prop: '大圆直线', flat: false, desc: '球心投影到切平面。大圆航线变直线，航海航空最短路径规划。' },
  { id: 'azimuthal_equidistant', name: '等距方位', en: 'Azimuthal Equidistant', cat: '方位', prop: '等距', flat: false, desc: '中心点出发距离方位保真。联合国会徽，无线电导航与导弹射程图。' },
  { id: 'lambert_conic', name: '兰伯特等角圆锥', en: 'Lambert Conformal Conic', cat: '圆锥', prop: '等角', fn: PF.bonne, desc: '圆锥面割两条标准纬线，角度保真。中纬度国家航空图与地形图标配。' },
  { id: 'albers', name: '阿尔伯斯等积圆锥', en: 'Albers Equal-Area Conic', cat: '圆锥', prop: '等积', fn: PF.bonne, desc: '圆锥面割两条标准纬线，面积保真。USGS大陆地图标准。' },
  { id: 'bonne', name: '彭纳投影', en: 'Bonne', cat: '圆锥', prop: '等积', fn: PF.bonne, desc: '伪圆锥，中央经线直线，纬线同心弧。面积保真，外形心形。' },
]
const CATS = [...new Set(PROJECTIONS.map(p => p.cat))]

/* ── Build coarse deformation grid ── */
function buildDeformGrid(R, cols, rows) {
  const verts = [], indices = []
  for (let j = 0; j <= rows; j++) {
    const phi = Math.PI * j / rows  // 0 to PI
    for (let i = 0; i <= cols; i++) {
      const theta = 2 * Math.PI * i / cols
      verts.push(-Math.sin(phi) * Math.cos(theta) * R, Math.cos(phi) * R, Math.sin(phi) * Math.sin(theta) * R)
    }
  }
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const a = j * (cols + 1) + i, b = a + 1, c = a + cols + 1, d = c + 1
      indices.push(a, b, d, a, d, c)
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  const mat = new THREE.MeshBasicMaterial({ color: 0xffaa33, wireframe: true, transparent: true, opacity: 0.6, depthTest: true, depthWrite: false })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.renderOrder = 1
  mesh.material.depthTest = true
  return mesh
}

/* ── Module ── */
export function MapProjectionModule(scene, params, services) {
  const { labelSystem, cameraRig } = services
  const group = new THREE.Group()
  const R = 1.5
  let current = null, unfold = 0, target = 0, flatMode = false, savedCam = null
  let gridTarget = null, sphereTarget = null
  let pendingProj = null // Queue next projection after sphere restore

  scene.background = new THREE.Color(0xf5f0e8)

  // High-res textured sphere
  const tex = earthTexture(2048)
  const sphereGeo = new THREE.SphereGeometry(R, 128, 64)
  const sphere = new THREE.Mesh(sphereGeo,
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, metalness: 0.05, side: THREE.DoubleSide }),
  )
  const sphereOrig = new Float32Array(sphereGeo.attributes.position.array)
  group.add(sphere)

  // ── Lat/lon reference lines on sphere ──
  function addLatLine(latDeg, color, label) {
    const phi = (90 - latDeg) * Math.PI / 180; const r = Math.sin(phi) * R * 1.01; const y = Math.cos(phi) * R * 1.01
    const pts = []; for (let i = 0; i <= 100; i++) { const t = i / 100 * Math.PI * 2; pts.push(new THREE.Vector3(-Math.cos(t) * r, y, Math.sin(t) * r)) }
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5, depthTest: true }))
    group.add(line)
    if (label && labelSystem) {
      labelSystem.addToGroup(group, label, new THREE.Vector3(0, y, r + 0.05), { color: '#' + color.toString(16).padStart(6, '0'), fontSize: '9px', fontWeight: '600' })
    }
    return line
  }
  function addLonLine(lonDeg, color, label) {
    const theta = lonDeg * Math.PI / 180; const pts = []
    for (let i = 0; i <= 100; i++) { const phi = i / 100 * Math.PI; pts.push(new THREE.Vector3(-Math.sin(phi) * Math.cos(theta) * R * 1.01, Math.cos(phi) * R * 1.01, Math.sin(phi) * Math.sin(theta) * R * 1.01)) }
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5, depthTest: true }))
    group.add(line)
    if (label && labelSystem) {
      const mid = 45 * Math.PI / 180; labelSystem.addToGroup(group, label, new THREE.Vector3(-Math.sin(mid) * Math.cos(theta) * R * 1.08, Math.cos(mid) * R * 1.08, Math.sin(mid) * Math.sin(theta) * R * 1.08), { color: '#' + color.toString(16).padStart(6, '0'), fontSize: '9px', fontWeight: '600' })
    }
    return line
  }
  addLatLine(0, 0xcc3333, '赤道 0°')
  addLatLine(30, 0xcc8833, '30°N')
  addLatLine(-30, 0xcc8833, '30°S')
  addLatLine(60, 0xcc6633, '60°N')
  addLatLine(-60, 0xcc6633, '60°S')
  addLonLine(0, 0x3366cc, '本初子午线 0°')
  addLonLine(90, 0x3366cc, '90°E')
  addLonLine(-90, 0x3366cc, '90°W')
  addLonLine(180, 0x3366cc, '180°')
  // Small arrow markers at key intersections
  const arrowGeo = new THREE.ConeGeometry(0.03, 0.1, 4)
  const arrowMat = new THREE.MeshBasicMaterial({ color: 0xcc3333 })
  const eqArrows = [[0, 0, R * 1.02, 0.05], [R * 1.02, 0, 0, -0.05]]
  eqArrows.forEach(([px, py, pz, ry]) => {
    const a = new THREE.Mesh(arrowGeo, arrowMat); a.position.set(px, py, pz); a.rotation.z = Math.PI / 2; a.rotation.y = ry; group.add(a)
  })

  // Deformation grid overlay (coarse, for animation)
  const grid = buildDeformGrid(R, 24, 12)
  const gridOrig = new Float32Array(grid.geometry.attributes.position.array)
  group.add(grid)

  /* ── Compute target positions ── */
  function computeTarget(origData, count, proj) {
    const fn = proj.fn || PF.equirectangular
    const tp = new Float32Array(count * 3)
    const S = R * 2.2
    const maxLat = 85 * Math.PI / 180 // Clamp to avoid infinity at poles
    for (let i = 0; i < count; i++) {
      const x = origData[i * 3], y = origData[i * 3 + 1], z = origData[i * 3 + 2]
      let lat = Math.asin(Math.max(-1, Math.min(1, y / R)))
      const lon = Math.atan2(z, x)
      lat = Math.max(-maxLat, Math.min(maxLat, lat))
      let px, py
      try {
        const r = fn(lat, lon)
        if (Array.isArray(r)) [px, py] = r
        else if (r && typeof r === 'object') { const b = r; const E = lon * Math.cos(lat) / (b.p || 0.001); px = b.p * Math.sin(E) * 0.6; py = (b.cot - b.p * Math.cos(E)) * 0.5 }
        else { px = lon / Math.PI; py = lat / (Math.PI / 2) }
      } catch (_) { px = lon / Math.PI; py = lat / (Math.PI / 2) }
      tp[i * 3] = (px || 0) * S
      tp[i * 3 + 1] = (py || 0) * S * 0.55
      tp[i * 3 + 2] = 0
    }
    return tp
  }

  function interpolateMesh(geo, orig, target, t, setNormals) {
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      pos.setXYZ(i,
        orig[i * 3] + (target[i * 3] - orig[i * 3]) * t,
        orig[i * 3 + 1] + (target[i * 3 + 1] - orig[i * 3 + 1]) * t,
        orig[i * 3 + 2] + (target[i * 3 + 2] - orig[i * 3 + 2]) * t,
      )
    }
    pos.needsUpdate = true
    if (setNormals && t > 0.9) {
      const n = geo.attributes.normal
      for (let i = 0; i < pos.count; i++) n.setXYZ(i, 0, 0, 1)
      n.needsUpdate = true
    } else {
      geo.computeVertexNormals()
    }
  }

  /* ── Labels ── */
  function showLabel(id) {
    if (!labelSystem) return
    labelSystem.clearAll(scene)
    if (id === 'reset' || !id) {
      labelSystem.addToGroup(group, '原始状态 · 3D 球体', new THREE.Vector3(0, R + 1.5, 0), { color: '#333', fontSize: '18px', fontWeight: '700', background: 'rgba(255,255,255,0.95)', padding: '6px 14px', borderRadius: '6px' })
      labelSystem.addToGroup(group, '地球是近似的椭球体 · 经纬网标注赤道/本初子午线 · 点击右侧投影按钮观察球面如何展开为平面', new THREE.Vector3(0, R + 1.0, 0), { color: '#666', fontSize: '11px', background: 'rgba(255,255,255,0.85)', padding: '4px 10px', borderRadius: '4px' })
      return
    }
    const p = PROJECTIONS.find(x => x.id === id)
    if (!p) return
    labelSystem.addToGroup(group, `${p.name} · ${p.en}`, new THREE.Vector3(0, R + 1.5, 0), { color: '#333', fontSize: '18px', fontWeight: '700', background: 'rgba(255,255,255,0.95)', padding: '6px 14px', borderRadius: '6px' })
    labelSystem.addToGroup(group, `${p.cat}投影 · ${p.prop}${p.flat === false ? ' · 3D视图' : ''}`, new THREE.Vector3(0, R + 1.1, 0), { color: '#999', fontSize: '11px', background: 'rgba(255,255,255,0.8)', padding: '2px 8px', borderRadius: '3px' })
    labelSystem.addToGroup(group, p.desc, new THREE.Vector3(0, R + 0.7, 0), { color: '#444', fontSize: '11px', fontWeight: '500', background: 'rgba(255,255,255,0.9)', padding: '6px 10px', borderRadius: '4px' })
  }

  /* ── API ── */
  showLabel('reset')

  const api = {
    setParams(p) {
      if (p.projection === undefined) return
      if (p.projection === 'reset') {
        current = 'reset'; target = 0; pendingProj = null
        showLabel('reset')
        return
      }
      const proj = PROJECTIONS.find(x => x.id === p.projection)
      if (!proj) return

      if (proj.flat === false) {
        // Azimuthal: stay sphere
        current = p.projection; target = 0; pendingProj = null
        gridTarget = null; sphereTarget = null
        showLabel(p.projection)
        return
      }

      // Already flat? Restore to sphere first, then unfold to new
      if (unfold > 0.5) {
        pendingProj = p.projection
        target = 0
        showLabel(p.projection)
      } else {
        current = p.projection; target = 1; pendingProj = null
        gridTarget = computeTarget(gridOrig, grid.geometry.attributes.position.count, proj)
        sphereTarget = computeTarget(sphereOrig, sphereGeo.attributes.position.count, proj)
        showLabel(p.projection)
      }
    },
    update(dt) {
      // Animate grid unfold/restore
      if (Math.abs(unfold - target) > 0.002) {
        unfold += (target - unfold) * 0.04
        if (target === 1 && gridTarget && sphereTarget) {
          interpolateMesh(grid.geometry, gridOrig, gridTarget, unfold, false)
          interpolateMesh(sphereGeo, sphereOrig, sphereTarget, unfold, true)
        } else {
          // Restore both to sphere
          const restoreMesh = (geo, orig) => {
            const pos = geo.attributes.position
            for (let i = 0; i < pos.count; i++) {
              pos.setXYZ(i,
                pos.getX(i) + (orig[i * 3] - pos.getX(i)) * 0.04,
                pos.getY(i) + (orig[i * 3 + 1] - pos.getY(i)) * 0.04,
                pos.getZ(i) + (orig[i * 3 + 2] - pos.getZ(i)) * 0.04,
              )
            }
            pos.needsUpdate = true; geo.computeVertexNormals()
          }
          restoreMesh(grid.geometry, gridOrig)
          restoreMesh(sphereGeo, sphereOrig)
        }
      }

      // Camera: lock to flat map view when unfolded
      if (unfold > 0.95 && target === 1 && !flatMode && cameraRig) {
        flatMode = true
        savedCam = { pos: cameraRig.camera.position.clone(), look: cameraRig.controls.target.clone() }
      }
      if (flatMode && cameraRig) {
        cameraRig.camera.position.lerp(new THREE.Vector3(0, 0, 7), 0.05)
        cameraRig.controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.05)
        cameraRig.controls.enableRotate = false
        cameraRig.controls.update()
      }
      if (unfold < 0.1 && flatMode) {
        flatMode = false
        if (cameraRig) {
          cameraRig.controls.enableRotate = true
          if (savedCam) { cameraRig.camera.position.copy(savedCam.pos); cameraRig.controls.target.copy(savedCam.look); savedCam = null }
        }
      }

      // When fully restored to sphere, trigger pending projection
      if (unfold < 0.05 && pendingProj) {
        const proj = PROJECTIONS.find(x => x.id === pendingProj)
        if (proj) {
          current = pendingProj; target = 1; pendingProj = null
          gridTarget = computeTarget(gridOrig, grid.geometry.attributes.position.count, proj)
          sphereTarget = computeTarget(sphereOrig, sphereGeo.attributes.position.count, proj)
        }
      }

      // Rotate when sphere
      if (unfold < 0.05) { sphere.rotation.y += dt * 0.06 }
    },
    dispose() {},
  }
  group.userData = { api }
  return group
}

export { PROJECTIONS, CATS }
