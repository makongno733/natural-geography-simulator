// [M11] GeologicTimeModule — 地质年代3D — 平滑过渡+云海大气可视化

import * as THREE from 'three'
import { GeometryFactory } from '../utils/GeometryFactory.js'

/* ICS 2024/12 — 26 entries */
const ERAS = [
  { name:'冥古宙', en:'Hadean', start:4600, end:4000, color:0x660000, eon:'冥古宙', era:'—',
    desc:'地球吸积形成。月球~4.5Ga诞生。全球岩浆海洋。原始大气：H₂,He,CH₄。',
    fossils:'无生命。最古老锆石(Jack Hills,4.4Ga)。' },
  { name:'始太古宙', en:'Eoarchean', start:4000, end:3600, color:0x882222, eon:'太古宙', era:'始太古代',
    desc:'最古老岩石(阿卡斯塔片麻岩)。地壳冷却，海洋形成。',
    fossils:'最古老疑似生命化学痕迹(Isua,~3.8Ga)。' },
  { name:'古太古宙', en:'Paleoarchean', start:3600, end:3200, color:0x993333, eon:'太古宙', era:'古太古代',
    desc:'最早确凿生命证据。叠层石开始建造。',
    fossils:'叠层石(Stromatolite,~3.48Ga)。最早微化石。' },
  { name:'中太古宙', en:'Mesoarchean', start:3200, end:2800, color:0xAA4444, eon:'太古宙', era:'中太古代',
    desc:'最早克拉通稳定。条带状铁建造(BIF)沉积。',
    fossils:'蓝藻(Cyanobacteria)繁盛。' },
  { name:'新太古宙', en:'Neoarchean', start:2800, end:2500, color:0xBB5555, eon:'太古宙', era:'新太古代',
    desc:'大陆快速生长。BIF沉积高峰。',
    fossils:'真核生物甾烷分子化石(~2.7Ga)。' },
  { name:'古元古代', en:'Paleoproterozoic', start:2500, end:1600, color:0xBB8855, eon:'元古宙', era:'古元古代',
    desc:'大氧化事件(GOE)。休伦冰期：雪球地球。',
    fossils:'Grypania spiralis(最早真核多细胞)。' },
  { name:'中元古代', en:'Mesoproterozoic', start:1600, end:1000, color:0xCC9966, eon:'元古宙', era:'中元古代',
    desc:'罗迪尼亚超大陆聚合。有性生殖出现。',
    fossils:'Bangiomorpha(最早红藻,~1.2Ga)。' },
  { name:'拉伸纪', en:'Tonian', start:1000, end:720, color:0xDDBB77, eon:'元古宙', era:'新元古代',
    desc:'罗迪尼亚裂解。最早动物可能出现。',
    fossils:'Otavia antiqua(最早海绵,~760Ma)。' },
  { name:'成冰纪', en:'Cryogenian', start:720, end:635, color:0xCCDDEE, eon:'元古宙', era:'新元古代',
    desc:'Sturtian+Marinoan全球冰期——雪球地球。',
    fossils:'冰期后疑源类多样性爆发。' },
  { name:'埃迪卡拉纪', en:'Ediacaran', start:635, end:541, color:0xCC8844, eon:'元古宙', era:'新元古代',
    desc:'最早大型多细胞生物。海洋氧含量上升。',
    fossils:'狄更逊虫、查恩盘虫、Kimberella。' },
  { name:'寒武纪', en:'Cambrian', start:541, end:485, color:0x669966, eon:'显生宙', era:'古生代',
    desc:'寒武纪大爆发：几乎所有动物门类出现。',
    fossils:'三叶虫、奇虾、怪诞虫。伯吉斯页岩。' },
  { name:'奥陶纪', en:'Ordovician', start:485, end:444, color:0x559955, eon:'显生宙', era:'古生代',
    desc:'海平面历史最高。末期冰期大灭绝(85%)。',
    fossils:'笔石、鹦鹉螺、早期陆生植物。' },
  { name:'志留纪', en:'Silurian', start:444, end:419, color:0x77AA77, eon:'显生宙', era:'古生代',
    desc:'气候回暖。维管植物登陆。有颌鱼类演化。',
    fossils:'Cooksonia(最早维管植物)。巨型海蝎。' },
  { name:'泥盆纪', en:'Devonian', start:419, end:359, color:0x88BB88, eon:'显生宙', era:'古生代',
    desc:'"鱼类时代"。森林出现。两栖动物登陆。',
    fossils:'邓氏鱼(8m)。鱼石螈(最早四足动物)。' },
  { name:'石炭纪', en:'Carboniferous', start:359, end:299, color:0x66AA88, eon:'显生宙', era:'古生代',
    desc:'巨型蕨类森林→煤层。大气氧~35%。巨型昆虫。',
    fossils:'Meganeura(翼展70cm)。Arthropleura(2.5m)。' },
  { name:'二叠纪', en:'Permian', start:299, end:252, color:0xDD6644, eon:'显生宙', era:'古生代',
    desc:'盘古大陆形成。史上最大灭绝(96%物种)。',
    fossils:'异齿龙、二齿兽。银杏类。' },
  { name:'三叠纪', en:'Triassic', start:252, end:201, color:0x9944AA, eon:'显生宙', era:'中生代',
    desc:'大灭绝后复苏。最早恐龙和哺乳动物。',
    fossils:'腔骨龙、Morganucodon。鱼龙。' },
  { name:'侏罗纪', en:'Jurassic', start:201, end:145, color:0x6666CC, eon:'显生宙', era:'中生代',
    desc:'恐龙鼎盛。泛大陆裂解→大西洋。温暖无冰。',
    fossils:'梁龙、剑龙、始祖鸟。' },
  { name:'白垩纪', en:'Cretaceous', start:145, end:66, color:0x448844, eon:'显生宙', era:'中生代',
    desc:'被子植物崛起。Chicxulub撞击→恐龙灭绝。',
    fossils:'霸王龙、三角龙、最早的花朵。' },
  { name:'古新世', en:'Paleocene', start:66, end:56, color:0xDDBB66, eon:'显生宙', era:'新生代',
    desc:'哺乳动物快速演化。全球温暖。',
    fossils:'Titanoboa(13m)。早期灵长类。' },
  { name:'始新世', en:'Eocene', start:56, end:33.9, color:0xDDAA44, eon:'显生宙', era:'新生代',
    desc:'PETM极热事件。现代哺乳动物目出现。',
    fossils:'始祖象、走鲸。Gastornis巨鸟。' },
  { name:'渐新世', en:'Oligocene', start:33.9, end:23, color:0xDD8822, eon:'显生宙', era:'新生代',
    desc:'全球变冷。草原扩张。环南极洋流形成。',
    fossils:'巨犀(史上最大陆生哺乳动物)。' },
  { name:'中新世', en:'Miocene', start:23, end:5.33, color:0xDD9922, eon:'显生宙', era:'新生代',
    desc:'喜马拉雅造山。C4草原扩张。人科祖先分离。',
    fossils:'巨齿鲨。最早的人亚科祖先。' },
  { name:'上新世', en:'Pliocene', start:5.33, end:2.58, color:0xDD7722, eon:'显生宙', era:'新生代',
    desc:'巴拿马地峡形成。北极冰盖扩展。',
    fossils:'南方古猿"露西"。巨地懒。' },
  { name:'更新世', en:'Pleistocene', start:2.58, end:0.0117, color:0xFF5533, eon:'显生宙', era:'第四纪',
    desc:'冰期-间冰期×~20次。智人扩散全球。',
    fossils:'猛犸象、剑齿虎、尼安德特人。' },
  { name:'全新世', en:'Holocene', start:0.0117, end:0, color:0xFF3300, eon:'显生宙', era:'第四纪',
    desc:'农业→文明→工业。CO₂ 280→420ppm。',
    fossils:'混凝土、塑料、²³⁹Pu、鸡骨化石。' },
]
const N = ERAS.length

/* ── Interpolated params ── */
function lerp(a, b, t) { return a + (b - a) * t }
function lerpParams(from, to, t) {
  const tf = from / (N - 1), tt = to / (N - 1), f = lerp(tf, tt, t)
  return {
    landFrac: lerp(0.05, 0.6, f),
    landR: lerp(0.45, 0.35, f), landG: lerp(0.12, 0.52, f), landB: lerp(0.05, 0.2, f),
    oceanR: lerp(0.6, 0.1, f), oceanG: lerp(0.2, 0.3, f), oceanB: lerp(0.08, 0.55, f),
    atmoHue: lerp(0.08, 0.55, f), atmoSat: 0.6, atmoLight: lerp(0.15, 0.5, f),
    atmoOp: lerp(0.2, 0.06, f), cloudOp: f < 0.5 ? lerp(0, 0.3, f * 2) : 0.3,
    bioOp: f < 0.2 ? lerp(0, 0.05, f / 0.2) : 0.05,
    roughness: lerp(0.85, 0.4, f),
  }
}

function buildTerrain(params) {
  const size = 8, seg = 128, R = size / 2
  const geo = new THREE.PlaneGeometry(size, size, seg, seg)
  geo.rotateX(-Math.PI / 2)
  const pos = geo.attributes.position, cols = new Float32Array(pos.count * 3)
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i)
    const dist = Math.sqrt(x * x + z * z)
    const edgeFactor = Math.max(0, 1 - dist / (R * 0.95)) // fade at edge
    if (dist > R) { pos.setY(i, -0.35); cols[i * 3] = params.oceanR; cols[i * 3 + 1] = params.oceanG; cols[i * 3 + 2] = params.oceanB; continue }
    const n = Math.sin(x * 0.8) * Math.cos(z * 0.6) + Math.sin(x * 1.3 + z * 0.4) * 0.7 + Math.cos(z * 1.1 - x * 0.3) * 0.6
    const th = 0.5 - params.landFrac * 0.75
    const isLand = n > th && edgeFactor > 0.15
    const h = isLand ? Math.max(0, n - th) * 0.7 * edgeFactor + Math.random() * 0.04 : -0.3 - Math.random() * 0.25
    pos.setY(i, h * edgeFactor)
    if (isLand) { cols[i * 3] = params.landR + Math.random() * 0.05; cols[i * 3 + 1] = params.landG + Math.random() * 0.05; cols[i * 3 + 2] = params.landB + Math.random() * 0.03 }
    else { const d = Math.max(0, Math.min(1, (-h) / 0.5)); cols[i * 3] = params.oceanR + d * 0.05; cols[i * 3 + 1] = params.oceanG + d * 0.08; cols[i * 3 + 2] = params.oceanB + d * 0.1 }
  }
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3)); geo.computeVertexNormals()
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: params.roughness, metalness: 0.05, side: THREE.DoubleSide }))
}

function buildAtmo(params) {
  const g = new THREE.Group()
  const c = new THREE.Color().setHSL(params.atmoHue, params.atmoSat, params.atmoLight).getHex()
  const s = new THREE.Mesh(new THREE.SphereGeometry(5, 48, 24), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: params.atmoOp, side: THREE.DoubleSide, depthWrite: false }))
  s.position.y = 0.3; g.add(s)
  return g
}

function buildHydro(params) {
  const g = new THREE.Group()
  const s = new THREE.Mesh(new THREE.SphereGeometry(4.8, 36, 18), new THREE.MeshBasicMaterial({ color: 0x3388cc, wireframe: true, transparent: true, opacity: params.landFrac < 0.3 ? 0.03 : 0.05, depthWrite: false }))
  s.position.y = -0.2; g.add(s)
  return g
}

function buildBio(params) {
  const g = new THREE.Group()
  if (params.bioOp < 0.005) return g
  const s = new THREE.Mesh(new THREE.SphereGeometry(4.6, 36, 18), new THREE.MeshBasicMaterial({ color: 0x44aa44, wireframe: true, transparent: true, opacity: params.bioOp, depthWrite: false }))
  s.position.y = 0.05; g.add(s)
  return g
}

function buildClouds(params) {
  const g = new THREE.Group()
  if (params.cloudOp < 0.01) return g
  const count = Math.floor(params.cloudOp * 800)
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(2 * Math.random() - 1), theta = Math.random() * Math.PI * 2
    const r = 4.2 + Math.random() * 0.8
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta); pos[i * 3 + 1] = r * Math.cos(phi) + 0.3; pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }))
  g.add(pts)
  return g
}

/* ── Module ── */
export function GeologicTimeModule(scene, params, services) {
  const { labelSystem, cameraRig } = services
  const group = new THREE.Group()
  let eraIdx = N - 1, fromIdx = N - 1, transT = 0

  scene.background = new THREE.Color(0x0a0a14)

  const ocean = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshStandardMaterial({ color: 0x1a3366, roughness: 0.3 }))
  ocean.rotation.x = -Math.PI / 2; ocean.position.y = -0.5; group.add(ocean)

  // Dynamic layers
  const layers = { terrain: null, atmo: null, hydro: null, bio: null, clouds: null }
  function rebuildAll(p) {
    Object.values(layers).forEach(l => { if (l) group.remove(l) })
    layers.terrain = buildTerrain(p); group.add(layers.terrain)
    layers.atmo = buildAtmo(p); group.add(layers.atmo)
    layers.hydro = buildHydro(p); group.add(layers.hydro)
    layers.bio = buildBio(p); group.add(layers.bio)
    layers.clouds = buildClouds(p); group.add(layers.clouds)
  }
  rebuildAll(lerpParams(eraIdx, eraIdx, 0))

  // Time rings
  const rings = []
  ERAS.forEach((e, i) => {
    const r = 4.5 + i * 0.04, pts = []
    for (let j = 0; j <= 64; j++) { const t = j / 64 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(t) * r, 0.02, Math.sin(t) * r)) }
    const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: e.color, transparent: true, opacity: 0.15, depthTest: true }))
    group.add(ring); rings.push(ring)
  })

  // Human impact dots
  const impacts = new THREE.Group()
  ;[[1.5, 0.04, 1.2], [-1.8, 0.04, -1], [0.5, 0.04, -2], [-1, 0.04, 1.8], [2, 0.04, -1.5]].forEach(([x, y, z]) => {
    impacts.add(new THREE.Mesh(GeometryFactory.sphere(0.06, 8), new THREE.MeshBasicMaterial({ color: 0xff4400 })))
    const gl = new THREE.Mesh(GeometryFactory.ring(0.08, 0.16, 16), new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }))
    gl.rotation.x = -Math.PI / 2; gl.position.set(x, y, z); impacts.add(gl)
  })
  impacts.visible = false; group.add(impacts)

  if (cameraRig) { const a = 50 * Math.PI / 180; cameraRig.camera.position.set(0, Math.sin(a) * 10, Math.cos(a) * 10); cameraRig.controls.target.set(0, 0, 0); cameraRig.controls.enableRotate = false; cameraRig.controls.minDistance = 4; cameraRig.controls.maxDistance = 18; cameraRig.controls.update() }

  function updateLabels() {
    if (!labelSystem) return
    labelSystem.clearAll(scene)
    const e = ERAS[eraIdx]
    labelSystem.addToGroup(group, `${e.name} · ${e.en}`, new THREE.Vector3(0, 3.5, 0), { color:'#'+e.color.toString(16).padStart(6,'0'), fontSize:'18px', fontWeight:'700', background:'rgba(0,0,0,0.7)', padding:'8px 16px', borderRadius:'6px' })
    labelSystem.addToGroup(group, `${e.eon}/${e.era} · ${e.start}—${e.end===0?'今':e.end} Ma`, new THREE.Vector3(0, 2.9, 0), { color:'#aaa', fontSize:'11px', background:'rgba(0,0,0,0.5)', padding:'3px 10px', borderRadius:'4px' })
    labelSystem.addToGroup(group, e.desc, new THREE.Vector3(0, -3.5, 0), { color:'#ddd', fontSize:'13px', background:'rgba(0,0,0,0.65)', padding:'8px 14px', borderRadius:'6px', whiteSpace:'normal', maxWidth:'500px', lineHeight:'1.5' })
    labelSystem.addToGroup(group, '四大圈层 · 云·气·水·陆·生', new THREE.Vector3(5.5, 3, 0), { color:'#88ccff', fontSize:'13px', fontWeight:'700', background:'rgba(0,0,0,0.6)' })
  }
  updateLabels()

  const api = {
    setParams(p) {
      if (p.era !== undefined && p.era !== eraIdx) {
        fromIdx = eraIdx; eraIdx = p.era; transT = 0
        impacts.visible = eraIdx === N - 1
        rings.forEach((r, i) => { r.material.opacity = i === eraIdx ? 1 : 0.15 })
        updateLabels()
      }
    },
    update(dt) {
      // Smooth transition
      if (transT < 1) {
        transT = Math.min(1, transT + dt * 1.5)
        const p = lerpParams(fromIdx, eraIdx, transT)
        rebuildAll(p)
      }
      impacts.children.forEach(c => { if (c.material?.blending === THREE.AdditiveBlending) c.material.opacity = 0.3 + Math.sin(Date.now() * 0.003) * 0.2 })
      // Cloud rotation
      if (layers.clouds) { layers.clouds.rotation.y += dt * 0.03; layers.clouds.rotation.x += dt * 0.01 }
    },
    dispose() {},
  }
  group.userData = { api }
  return group
}

export { ERAS }
