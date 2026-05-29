// [M11] GeologicTimeModule — 地质年代3D教学 — 30+时期线性变换

import * as THREE from 'three'
import { GeometryFactory } from '../utils/GeometryFactory.js'

/* ICS 2024/12 — 34 entries from Hadean to Holocene */
const ERAS = [
  { name:'冥古宙', en:'Hadean', start:4600, end:4000, color:0x660000, eon:'冥古宙', era:'—',
    desc:'地球吸积形成。月球在~4.5Ga由忒伊亚撞击诞生。全球岩浆海洋。原始大气：H₂, He, CH₄。',
    fossils:'无生命。最古老锆石(Jack Hills, 4.4Ga)证明早期地壳存在。' },
  { name:'始太古宙', en:'Eoarchean', start:4000, end:3600, color:0x882222, eon:'太古宙', era:'始太古代',
    desc:'最古老岩石(阿卡斯塔片麻岩,4.03Ga)。地壳冷却形成最初陆核。海洋形成。',
    fossils:'最古老疑似生命化学痕迹(Isua绿岩带,格陵兰,~3.8Ga)。' },
  { name:'古太古宙', en:'Paleoarchean', start:3600, end:3200, color:0x993333, eon:'太古宙', era:'古太古代',
    desc:'最早确凿生命证据。叠层石开始建造。大气仍缺氧。',
    fossils:'叠层石(Stromatolite,澳大利亚Pilbara,~3.48Ga)。最早微化石。' },
  { name:'中太古宙', en:'Mesoarchean', start:3200, end:2800, color:0xAA4444, eon:'太古宙', era:'中太古代',
    desc:'最早克拉通稳定。条带状铁建造(BIF)开始沉积。',
    fossils:'蓝藻(Cyanobacteria)繁盛，光合作用开始产氧。' },
  { name:'新太古宙', en:'Neoarchean', start:2800, end:2500, color:0xBB5555, eon:'太古宙', era:'新太古代',
    desc:'大陆快速生长。超级克拉通形成。条带状铁建造高峰。',
    fossils:'真核生物最早分子化石(甾烷,~2.7Ga)。' },
  { name:'古元古代', en:'Paleoproterozoic', start:2500, end:1600, color:0xBB8855, eon:'元古宙', era:'古元古代',
    desc:'大氧化事件(GOE,~2.4Ga)。休伦冰期：首个雪球地球。哥伦比亚超大陆聚合。',
    fossils:'Grypania spiralis(最早真核多细胞,~1.85Ga)。' },
  { name:'中元古代', en:'Mesoproterozoic', start:1600, end:1000, color:0xCC9966, eon:'元古宙', era:'中元古代',
    desc:'罗迪尼亚超大陆聚合。有性生殖出现。大气氧含量缓慢上升。',
    fossils:'Bangiomorpha pubescens(最早红藻,~1.2Ga)。' },
  { name:'拉伸纪', en:'Tonian', start:1000, end:720, color:0xDDBB77, eon:'元古宙', era:'新元古代',
    desc:'罗迪尼亚超大陆裂解。最早动物可能出现。',
    fossils:'Otavia antiqua(最早疑似海绵,~760Ma)。' },
  { name:'成冰纪', en:'Cryogenian', start:720, end:635, color:0xCCDDEE, eon:'元古宙', era:'新元古代',
    desc:'Sturtian(~717Ma)和Marinoan(~650Ma)两次全球冰期——"雪球地球"。冰川覆盖至赤道。',
    fossils:'冰期后微生物繁盛。疑源类(Acritarch)多样性爆发。' },
  { name:'埃迪卡拉纪', en:'Ediacaran', start:635, end:541, color:0xCC8844, eon:'元古宙', era:'新元古代',
    desc:'最早大型复杂多细胞生物。全球海洋氧含量上升。冈瓦纳超大陆聚合。',
    fossils:'埃迪卡拉生物群：狄更逊虫(Dickinsonia)、查恩盘虫(Charnia)、斯普里格蠕虫(Spriggina)、Kimberella。' },
  { name:'寒武纪', en:'Cambrian', start:541, end:485, color:0x669966, eon:'显生宙', era:'古生代',
    desc:'寒武纪生命大爆发：几乎所有动物门类在~20Ma内出现。浅海广布，大气氧达现代水平。',
    fossils:'三叶虫(Trilobite)、奇虾(Anomalocaris)、怪诞虫(Hallucigenia)、皮卡虫(Pikaia-最早脊索动物)。伯吉斯页岩。' },
  { name:'奥陶纪', en:'Ordovician', start:485, end:444, color:0x559955, eon:'显生宙', era:'古生代',
    desc:'海平面历史最高。冈瓦纳大陆位于南极。末期冰期导致第二次大灭绝(~85%物种)。',
    fossils:'笔石(Graptolite)、鹦鹉螺(Nautiloid)、海百合(Crinoid)、板足鲎(Eurypterid)。最早陆生植物(苔藓)。' },
  { name:'志留纪', en:'Silurian', start:444, end:419, color:0x77AA77, eon:'显生宙', era:'古生代',
    desc:'气候回暖，珊瑚礁繁盛。维管植物登陆。有颌鱼类辐射演化。',
    fossils:'早期维管植物(Cooksonia)。巨型海蝎(Pterygotus)。有颌鱼(盾皮鱼类)。' },
  { name:'泥盆纪', en:'Devonian', start:419, end:359, color:0x88BB88, eon:'显生宙', era:'古生代',
    desc:'"鱼类时代"。森林首次出现。两栖动物登陆。末期大灭绝(~75%物种)。',
    fossils:'邓氏鱼(Dunkleosteus,8m)。鱼石螈(Ichthyostega,最早四足动物)。古蕨(Archaeopteris,最早真树)。' },
  { name:'石炭纪', en:'Carboniferous', start:359, end:299, color:0x66AA88, eon:'显生宙', era:'古生代',
    desc:'巨型蕨类沼泽形成世界煤层。大气氧高达35%。巨型昆虫时代。盘古大陆开始聚合。',
    fossils:'巨型蜻蜓(Meganeura,翼展70cm)。巨型千足虫(Arthropleura,2.5m)。早期爬行动物(Hylonomus)。' },
  { name:'二叠纪', en:'Permian', start:299, end:252, color:0xDD6644, eon:'显生宙', era:'古生代',
    desc:'盘古超大陆形成。沙漠广布。西伯利亚大火成岩省喷发。地球史上最大灭绝(~96%海洋物种)。',
    fossils:'异齿龙(Dimetrodon)。二齿兽(Dicynodont)。银杏类。菊石(Ammonite)繁盛。' },
  { name:'三叠纪', en:'Triassic', start:252, end:201, color:0x9944AA, eon:'显生宙', era:'中生代',
    desc:'大灭绝后复苏。最早恐龙和哺乳动物出现。盘古大陆开始裂解。末期大灭绝。',
    fossils:'腔骨龙(Coelophysis)。最早的哺乳动物(Morganucodon)。鱼龙(Ichthyosaur)。' },
  { name:'侏罗纪', en:'Jurassic', start:201, end:145, color:0x6666CC, eon:'显生宙', era:'中生代',
    desc:'恐龙达到鼎盛。泛大陆快速裂解形成大西洋。温暖潮湿，无冰。',
    fossils:'梁龙(Diplodocus)、剑龙(Stegosaurus)、始祖鸟(Archaeopteryx)。菊石(Ammonite)多样。' },
  { name:'白垩纪', en:'Cretaceous', start:145, end:66, color:0x448844, eon:'显生宙', era:'中生代',
    desc:'被子植物(开花植物)崛起。恐龙持续称霸。Chicxulub撞击+德干玄武岩导致恐龙灭绝。',
    fossils:'霸王龙(T.rex)、三角龙(Triceratops)、沧龙(Mosasaurus)。最早的花朵(Archaefructus)。' },
  { name:'古新世', en:'Paleocene', start:66, end:56, color:0xDDBB66, eon:'显生宙', era:'新生代',
    desc:'恐龙灭绝后哺乳动物快速演化。全球温暖。印度开始撞击亚洲。',
    fossils:'泰坦巨蟒(Titanoboa,13m)。早期灵长类(Purgatorius)。始祖马(Hyracotherium)。' },
  { name:'始新世', en:'Eocene', start:56, end:33.9, color:0xDDAA44, eon:'显生宙', era:'新生代',
    desc:'PETM(古新世-始新世极热事件)。最早的现代哺乳动物目出现。南极开始结冰。',
    fossils:'始祖象(Moeritherium)。走鲸(Ambulocetus)。巨鸟(Gastornis)。最早的马。' },
  { name:'渐新世', en:'Oligocene', start:33.9, end:23, color:0xDD8822, eon:'显生宙', era:'新生代',
    desc:'全球变冷干燥。草原扩张。南美洲与南极洲分离，环南极洋流形成。',
    fossils:'巨犀(Paraceratherium,史上最大陆生哺乳动物)。最早的猿类(Aegyptopithecus)。' },
  { name:'中新世', en:'Miocene', start:23, end:5.33, color:0xDD9922, eon:'显生宙', era:'新生代',
    desc:'喜马拉雅和阿尔卑斯造山。C4草原全球扩张。人科祖先从猿分离。',
    fossils:'巨齿鲨(Megalodon)。南猿祖先。剑齿虎(Smilodon前身)。' },
  { name:'上新世', en:'Pliocene', start:5.33, end:2.58, color:0xDD7722, eon:'显生宙', era:'新生代',
    desc:'巴拿马地峡形成，改变全球洋流。北极冰盖扩展。南方古猿出现。',
    fossils:'南方古猿阿法种(Australopithecus afarensis，"露西")。巨地懒(Megatherium)。' },
  { name:'更新世', en:'Pleistocene', start:2.58, end:0.0117, color:0xFF5533, eon:'显生宙', era:'第四纪',
    desc:'大冰期循环(冰期-间冰期)×~20次。海平面升降~120m。智人扩散全球。大型动物群灭绝。',
    fossils:'猛犸象(Mammuthus primigenius)。剑齿虎(Smilodon)。尼安德特人(H.neanderthalensis)。智人(H.sapiens)。' },
  { name:'全新世', en:'Holocene', start:0.0117, end:0, color:0xFF3300, eon:'显生宙', era:'第四纪',
    desc:'农业→文明→工业。CO₂ 280→420ppm。第六次大灭绝。人类成为地质营力。',
    fossils:'人类世标志物：混凝土、塑料(全球年产量4亿吨)、²³⁹Pu核沉降、鸡骨化石(230亿只)、玉米花粉。' },
]

const TOTAL = ERAS.length

/* Terrain params interpolated from era index */
function eraParams(idx) {
  const t = idx / (TOTAL - 1) // 0=Hadean, 1=Holocene
  return {
    landFrac: 0.05 + t * 0.55,
    landR: 0.45 - t * 0.15, landG: 0.12 + t * 0.4, landB: 0.05 + t * 0.15,
    oceanR: 0.6 - t * 0.5, oceanG: 0.2 + t * 0.1, oceanB: 0.08 + t * 0.47,
    atmoColor: new THREE.Color().setHSL(0.08 - t * 0.08, 0.6, 0.15 + t * 0.35).getHex(),
    atmoOp: 0.2 - t * 0.14,
    bioOp: t < 0.15 ? 0 : t * 0.08,
  }
}

function buildTerrain(idx) {
  const size = 8, seg = 128
  const geo = new THREE.PlaneGeometry(size, size, seg, seg)
  geo.rotateX(-Math.PI / 2)
  const pos = geo.attributes.position, colors = new Float32Array(pos.count * 3)
  const p = eraParams(idx)

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i)
    const n = Math.sin(x * 0.8) * Math.cos(z * 0.6) + Math.sin(x * 1.3 + z * 0.4) * 0.7 + Math.cos(z * 1.1 - x * 0.3) * 0.6
    const thresh = 0.5 - p.landFrac * 0.75
    const isLand = n > thresh
    const h = isLand ? Math.max(0, n - thresh) * 0.7 + Math.random() * 0.06 : -0.3 - Math.random() * 0.3
    pos.setY(i, h)
    if (isLand) { colors[i * 3] = p.landR + Math.random() * 0.06; colors[i * 3 + 1] = p.landG + Math.random() * 0.06; colors[i * 3 + 2] = p.landB + Math.random() * 0.04 }
    else { const d = Math.max(0, Math.min(1, (-h) / 0.5)); colors[i * 3] = p.oceanR + d * 0.06; colors[i * 3 + 1] = p.oceanG + d * 0.1; colors[i * 3 + 2] = p.oceanB + d * 0.12 }
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3)); geo.computeVertexNormals()
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.3 + (1 - p.landFrac) * 0.4, metalness: 0.05, side: THREE.DoubleSide }))
}

function buildSpheres(idx) {
  const g = new THREE.Group(), p = eraParams(idx)
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(5, 48, 24), new THREE.MeshBasicMaterial({ color: p.atmoColor, transparent: true, opacity: p.atmoOp, side: THREE.DoubleSide, depthWrite: false })); atmo.position.y = 0.3; g.add(atmo)
  const hydro = new THREE.Mesh(new THREE.SphereGeometry(4.8, 36, 18), new THREE.MeshBasicMaterial({ color: 0x3388cc, wireframe: true, transparent: true, opacity: idx < 3 ? 0.04 : 0.04, depthWrite: false })); hydro.position.y = -0.2; g.add(hydro)
  const bio = new THREE.Mesh(new THREE.SphereGeometry(4.6, 36, 18), new THREE.MeshBasicMaterial({ color: 0x44aa44, wireframe: true, transparent: true, opacity: p.bioOp, depthWrite: false })); bio.position.y = 0.05; g.add(bio)
  return g
}

/* ── Module ── */
export function GeologicTimeModule(scene, params, services) {
  const { labelSystem, cameraRig } = services
  const group = new THREE.Group()
  let eraIdx = params.era !== undefined ? params.era : TOTAL - 1

  scene.background = new THREE.Color(0x0a0a14)

  const ocean = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshStandardMaterial({ color: 0x1a3366, roughness: 0.3 }))
  ocean.rotation.x = -Math.PI / 2; ocean.position.y = -0.5; group.add(ocean)

  let terrain = buildTerrain(eraIdx); group.add(terrain)
  let spheres = buildSpheres(eraIdx); group.add(spheres)

  const rings = []
  ERAS.forEach((e, i) => { const r = 4.5 + i * 0.04; const pts = []; for (let j = 0; j <= 64; j++) { const t = j / 64 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(t) * r, 0.02, Math.sin(t) * r)) }; const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: e.color, transparent: true, opacity: i === eraIdx ? 1 : 0.15, depthTest: true })); group.add(ring); rings.push(ring) })

  const impactGroup = new THREE.Group()
  ;[[1.5, 0.04, 1.2], [-1.8, 0.04, -1], [0.5, 0.04, -2], [-1, 0.04, 1.8], [2, 0.04, -1.5]].forEach(([x, y, z]) => { impactGroup.add(new THREE.Mesh(GeometryFactory.sphere(0.06, 8), new THREE.MeshBasicMaterial({ color: 0xff4400 }))); const gl = new THREE.Mesh(GeometryFactory.ring(0.08, 0.16, 16), new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); gl.rotation.x = -Math.PI / 2; gl.position.set(x, y, z); impactGroup.add(gl) })
  impactGroup.visible = eraIdx === TOTAL - 1; group.add(impactGroup)

  if (cameraRig) { const a = 50 * Math.PI / 180; cameraRig.camera.position.set(0, Math.sin(a) * 10, Math.cos(a) * 10); cameraRig.controls.target.set(0, 0, 0); cameraRig.controls.enableRotate = false; cameraRig.controls.minDistance = 4; cameraRig.controls.maxDistance = 18; cameraRig.controls.update() }

  function updateLabels() {
    if (!labelSystem) return
    labelSystem.clearAll(scene)
    const e = ERAS[eraIdx]
    labelSystem.addToGroup(group, `${e.name} · ${e.en}`, new THREE.Vector3(0, 3.5, 0), { color:'#'+e.color.toString(16).padStart(6,'0'), fontSize:'18px', fontWeight:'700', background:'rgba(0,0,0,0.7)', padding:'8px 16px', borderRadius:'6px' })
    labelSystem.addToGroup(group, `${e.eon} / ${e.era} · ${e.start}—${e.end===0?'至今':e.end} Ma`, new THREE.Vector3(0, 2.9, 0), { color:'#aaa', fontSize:'11px', background:'rgba(0,0,0,0.5)', padding:'3px 10px', borderRadius:'4px' })
    labelSystem.addToGroup(group, e.desc, new THREE.Vector3(0, -3.5, 0), { color:'#ddd', fontSize:'13px', background:'rgba(0,0,0,0.65)', padding:'8px 14px', borderRadius:'6px', whiteSpace:'normal', maxWidth:'500px', lineHeight:'1.5' })
    labelSystem.addToGroup(group, '四大圈层', new THREE.Vector3(5.5, 3, 0), { color:'#88ccff', fontSize:'14px', fontWeight:'700', background:'rgba(0,0,0,0.6)' })
  }
  updateLabels()

  const api = {
    setParams(p) {
      if (p.era !== undefined) {
        eraIdx = p.era
        group.remove(terrain); terrain = buildTerrain(eraIdx); group.add(terrain)
        group.remove(spheres); spheres = buildSpheres(eraIdx); group.add(spheres)
        rings.forEach((r, i) => { r.material.opacity = i === eraIdx ? 1 : 0.15 })
        impactGroup.visible = eraIdx === TOTAL - 1
        updateLabels()
      }
    },
    update(dt) {
      impactGroup.children.forEach(c => { if (c.material?.blending === THREE.AdditiveBlending) c.material.opacity = 0.3 + Math.sin(Date.now() * 0.003) * 0.2 })
      spheres.children.forEach(s => { s.rotation.y += dt * 0.01; s.rotation.x += dt * 0.006 })
    },
    dispose() {},
  }
  group.userData = { api }
  return group
}

export { ERAS }
