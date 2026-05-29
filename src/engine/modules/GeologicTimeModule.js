// [M11] GeologicTimeModule — 地质年代3D教学 — 年代变换地形+四大圈层

import * as THREE from 'three'
import { GeometryFactory } from '../utils/GeometryFactory.js'

const ERAS = [
  { name: '冥古宙', en: 'Hadean', start: 4600, end: 4000, color: 0x8B0000, eon: '冥古宙',
    desc: '地球形成于46亿年前。岩浆海洋遍布，忒伊亚撞击形成月球。大气以氢、氦、甲烷为主，无水无氧无生命。',
    fossils: '无生命。最古老的锆石晶体（Jack Hills, 44亿年）是地球早期地壳的唯一证据。' },
  { name: '太古宙', en: 'Archean', start: 4000, end: 2500, color: 0xCD5C5C, eon: '太古宙',
    desc: '最早原核生命（细菌、古菌）~38亿年前出现。叠层石形成。大气缺氧，海洋富铁呈绿色。最初的小型陆核形成。',
    fossils: '代表生物：叠层石(Stromatolite) · 蓝藻(Cyanobacteria)。最古老微化石见于西澳大利亚Apex Chert(~34.6亿年)。Isua绿岩带(格陵兰)含最古老生命化学痕迹。' },
  { name: '元古宙', en: 'Proterozoic', start: 2500, end: 541, color: 0xDEB887, eon: '元古宙',
    desc: '大氧化事件~24亿年前：蓝藻释放氧气彻底改变大气。真核生物出现。多次"雪球地球"全球冰期。埃迪卡拉生物群繁盛。',
    fossils: '代表生物：埃迪卡拉生物群(Ediacaran biota) · 狄更逊虫(Dickinsonia) · 查恩盘虫(Charnia) · 斯普里格蠕虫(Spriggina)。Grypania spiralis是最早的真核多细胞化石。' },
  { name: '古生代', en: 'Paleozoic', start: 541, end: 252, color: 0x4A9E4A, eon: '显生宙',
    desc: '寒武纪生命大爆发。鱼类→两栖→爬行类演化。石炭纪蕨类森林形成煤层。盘古超大陆聚合。二叠纪末大灭绝(96%物种)。',
    fossils: '代表生物：三叶虫(Trilobite) · 奇虾(Anomalocaris) · 海蝎子(Eurypterid) · 邓氏鱼(Dunkleosteus) · 鱼石螈(Ichthyostega) · 异齿龙(Dimetrodon)。石炭纪巨型蜻蜓Meganeura翼展70cm。' },
  { name: '中生代', en: 'Mesozoic', start: 252, end: 66, color: 0x6495ED, eon: '显生宙',
    desc: '恐龙称霸陆地。泛大陆逐步分裂。被子植物出现。鸟类从恐龙演化。白垩纪末小行星撞击(Chicxulub)导致恐龙灭绝。',
    fossils: '代表生物：霸王龙(Tyrannosaurus rex) · 三角龙(Triceratops) · 梁龙(Diplodocus) · 翼龙(Pterosaur) · 始祖鸟(Archaeopteryx) · 菊石(Ammonite) · 鱼龙(Ichthyosaur)。白垩纪末铱异常层为全球撞击标志。' },
  { name: '新生代', en: 'Cenozoic', start: 66, end: 2.58, color: 0xFFD700, eon: '显生宙',
    desc: '哺乳动物和鸟类崛起填补生态位。印度撞向亚洲形成喜马拉雅。草原扩张。最早人科祖先在非洲出现(~7Ma)。',
    fossils: '代表生物：始祖象(Moeritherium) · 巨犀(Paraceratherium)：史上最大陆生哺乳动物 · 剑齿虎(Smilodon) · 猛犸象(Mammuthus) · 南方古猿(Australopithecus) · 能人(Homo habilis)。' },
  { name: '第四纪', en: 'Quaternary', start: 2.58, end: 0.0117, color: 0xFF6347, eon: '显生宙',
    desc: '更新世冰期-间冰期循环，海平面升降百米。智人~30万年前演化，约7万年前走出非洲扩散全球。大型动物群灭绝。',
    fossils: '代表生物：猛犸象(Mammuthus primigenius) · 披毛犀(Coelodonta) · 剑齿虎(Smilodon) · 巨地懒(Megatherium) · 尼安德特人(Homo neanderthalensis) · 智人(Homo sapiens)。拉布雷亚沥青坑保存了完美的更新世动物群。' },
  { name: '全新世', en: 'Holocene', start: 0.0117, end: 0, color: 0xFF4500, eon: '显生宙',
    desc: '农业革命→文明诞生(~1.2万年前)。工业革命(~1760)→化石燃料→CO₂从280ppm升至420ppm。人类成为地质营力：城市扩张、物种加速灭绝、塑料遍及海洋、核试验留下全球标记——"人类世"已被提议为新的地质时代。',
    fossils: '人类世标志物：混凝土(Concrete) · 塑料(Plastics) · 核沉降物(²³⁹Pu) · 鸡骨化石(Gallus gallus domesticus)：全球存量~230亿只 · 玉米花粉(Zea mays) · 铝金属(Aluminum)。第六次大灭绝正在发生。' },
]

const ERA_PARAMS = [
  { landFrac: 0.05, landColor: [0.45,0.12,0.05], oceanColor: [0.6,0.2,0.08], atmoColor: 0x884422, atmoOp: 0.2, hydroColor: 0x886644, hydroOp: 0.06, bioOp: 0.0 },
  { landFrac: 0.12, landColor: [0.5,0.3,0.15], oceanColor: [0.2,0.5,0.35], atmoColor: 0x886644, atmoOp: 0.15, hydroColor: 0x668855, hydroOp: 0.05, bioOp: 0.01 },
  { landFrac: 0.3, landColor: [0.6,0.45,0.25], oceanColor: [0.15,0.35,0.6], atmoColor: 0x6688aa, atmoOp: 0.1, hydroColor: 0x3388bb, hydroOp: 0.04, bioOp: 0.02 },
  { landFrac: 0.45, landColor: [0.3,0.55,0.2], oceanColor: [0.1,0.3,0.55], atmoColor: 0x88aacc, atmoOp: 0.08, hydroColor: 0x3388cc, hydroOp: 0.04, bioOp: 0.04 },
  { landFrac: 0.5, landColor: [0.25,0.5,0.15], oceanColor: [0.1,0.35,0.5], atmoColor: 0x88bbdd, atmoOp: 0.07, hydroColor: 0x3388cc, hydroOp: 0.04, bioOp: 0.05 },
  { landFrac: 0.55, landColor: [0.32,0.55,0.22], oceanColor: [0.1,0.3,0.55], atmoColor: 0x88ccff, atmoOp: 0.06, hydroColor: 0x3388cc, hydroOp: 0.04, bioOp: 0.06 },
  { landFrac: 0.55, landColor: [0.5,0.5,0.3], oceanColor: [0.08,0.25,0.5], atmoColor: 0x88ccff, atmoOp: 0.08, hydroColor: 0x3388cc, hydroOp: 0.06, bioOp: 0.06 },
  { landFrac: 0.6, landColor: [0.35,0.52,0.2], oceanColor: [0.1,0.3,0.55], atmoColor: 0x88ccff, atmoOp: 0.06, hydroColor: 0x3388cc, hydroOp: 0.04, bioOp: 0.08 },
]

function buildTerrain(eraIdx) {
  const size = 8, seg = 128
  const geo = new THREE.PlaneGeometry(size, size, seg, seg)
  geo.rotateX(-Math.PI / 2)
  const pos = geo.attributes.position
  const colors = new Float32Array(pos.count * 3)
  const p = ERA_PARAMS[eraIdx] || ERA_PARAMS[7]

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i)
    const n = Math.sin(x * 0.8) * Math.cos(z * 0.6) + Math.sin(x * 1.3 + z * 0.4) * 0.7 + Math.cos(z * 1.1 - x * 0.3) * 0.6
    const thresh = 0.5 - p.landFrac * 0.75
    const isLand = n > thresh
    const h = isLand ? Math.max(0, n - thresh) * 0.8 + Math.random() * 0.06 : -0.3 - Math.random() * 0.3
    pos.setY(i, h)
    if (isLand) { colors[i * 3] = p.landColor[0] + Math.random() * 0.08; colors[i * 3 + 1] = p.landColor[1] + Math.random() * 0.08; colors[i * 3 + 2] = p.landColor[2] + Math.random() * 0.05 }
    else { const d = Math.max(0, Math.min(1, (-h) / 0.5)); colors[i * 3] = p.oceanColor[0] + d * 0.08; colors[i * 3 + 1] = p.oceanColor[1] + d * 0.12; colors[i * 3 + 2] = p.oceanColor[2] + d * 0.15 }
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geo.computeVertexNormals()
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5 + (1 - p.landFrac) * 0.4, metalness: 0.05, side: THREE.DoubleSide }))
}

function buildSpheres(eraIdx) {
  const g = new THREE.Group(), p = ERA_PARAMS[eraIdx] || ERA_PARAMS[7]
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(5, 48, 24), new THREE.MeshBasicMaterial({ color: p.atmoColor, transparent: true, opacity: p.atmoOp, side: THREE.DoubleSide, depthWrite: false }))
  atmo.position.y = 0.3; g.add(atmo)
  const hydro = new THREE.Mesh(new THREE.SphereGeometry(4.8, 48, 24), new THREE.MeshBasicMaterial({ color: p.hydroColor, wireframe: true, transparent: true, opacity: p.hydroOp, depthWrite: false }))
  hydro.position.y = -0.2; g.add(hydro)
  const bio = new THREE.Mesh(new THREE.SphereGeometry(4.6, 48, 24), new THREE.MeshBasicMaterial({ color: 0x44aa44, wireframe: true, transparent: true, opacity: p.bioOp, depthWrite: false }))
  bio.position.y = 0.05; g.add(bio)
  return g
}

/* ── Module ── */
export function GeologicTimeModule(scene, params, services) {
  const { labelSystem, cameraRig } = services
  const group = new THREE.Group()
  let currentEra = params.era !== undefined ? params.era : ERAS.length - 1

  scene.background = new THREE.Color(0x0a0a14)

  // Ocean base
  const ocean = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshStandardMaterial({ color: 0x1a3366, roughness: 0.3, metalness: 0.1 }))
  ocean.rotation.x = -Math.PI / 2; ocean.position.y = -0.5; group.add(ocean)

  // Dynamic terrain + spheres
  let terrain = buildTerrain(currentEra)
  group.add(terrain)
  let spheres = buildSpheres(currentEra)
  group.add(spheres)

  // Time rings
  const rings = []
  ERAS.forEach((era, i) => {
    const r = 4.5 + i * 0.12
    const pts = []; for (let j = 0; j <= 128; j++) { const t = j / 128 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(t) * r, 0.02, Math.sin(t) * r)) }
    const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: era.color, transparent: true, opacity: i === currentEra ? 0.8 : 0.2, depthTest: true }))
    group.add(ring); rings.push(ring)
  })

  // Human impact markers (Holocene only)
  const impactGroup = new THREE.Group()
  ;[[1.5, 0.04, 1.2], [-1.8, 0.04, -1], [0.5, 0.04, -2], [-1, 0.04, 1.8], [2, 0.04, -1.5]].forEach(([x, y, z]) => {
    impactGroup.add(new THREE.Mesh(GeometryFactory.sphere(0.06, 8), new THREE.MeshBasicMaterial({ color: 0xff4400 })))
    const g = new THREE.Mesh(GeometryFactory.ring(0.08, 0.16, 16), new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }))
    g.rotation.x = -Math.PI / 2; g.position.set(x, y, z); impactGroup.add(g)
  })
  impactGroup.visible = currentEra === ERAS.length - 1
  group.add(impactGroup)

  // Fixed 50° camera
  if (cameraRig) {
    const a = 50 * Math.PI / 180
    cameraRig.camera.position.set(0, Math.sin(a) * 10, Math.cos(a) * 10)
    cameraRig.controls.target.set(0, 0, 0)
    cameraRig.controls.enableRotate = false
    cameraRig.controls.enableZoom = true
    cameraRig.controls.minDistance = 4; cameraRig.controls.maxDistance = 18
    cameraRig.controls.update()
  }

  function updateLabels() {
    if (!labelSystem) return
    labelSystem.clearAll(scene)
    const era = ERAS[currentEra]
    labelSystem.addToGroup(group, `${era.name} · ${era.en}`, new THREE.Vector3(0, 3.5, 0), { color: '#' + era.color.toString(16).padStart(6, '0'), fontSize: '18px', fontWeight: '700', background: 'rgba(0,0,0,0.7)', padding: '8px 16px', borderRadius: '6px' })
    labelSystem.addToGroup(group, `${era.start} — ${era.end === 0 ? '至今' : era.end} Ma`, new THREE.Vector3(0, 2.9, 0), { color: '#aaa', fontSize: '12px', background: 'rgba(0,0,0,0.5)', padding: '3px 10px', borderRadius: '4px' })
    labelSystem.addToGroup(group, era.desc, new THREE.Vector3(0, -3.5, 0), { color: '#ddd', fontSize: '13px', background: 'rgba(0,0,0,0.65)', padding: '8px 14px', borderRadius: '6px', whiteSpace: 'normal', maxWidth: '500px', lineHeight: '1.5' })
    labelSystem.addToGroup(group, '四大圈层', new THREE.Vector3(5.5, 3, 0), { color: '#88ccff', fontSize: '14px', fontWeight: '700', background: 'rgba(0,0,0,0.6)' })
    labelSystem.addToGroup(group, '大气圈 · 水圈 · 岩石圈 · 生物圈', new THREE.Vector3(5.5, 2.5, 0), { color: '#aaa', fontSize: '11px', background: 'rgba(0,0,0,0.5)' })
    if (currentEra === ERAS.length - 1) labelSystem.addToGroup(group, '人类世标志', new THREE.Vector3(0, 0.5, 4.5), { color: '#ff6644', fontSize: '13px', fontWeight: '700', background: 'rgba(0,0,0,0.6)' })
  }

  updateLabels()

  const api = {
    setParams(p) {
      if (p.era !== undefined && p.era !== currentEra) {
        currentEra = p.era
        // Replace terrain
        group.remove(terrain); terrain = buildTerrain(currentEra); group.add(terrain)
        // Replace spheres
        group.remove(spheres); spheres = buildSpheres(currentEra); group.add(spheres)
        // Update rings
        rings.forEach((r, i) => { r.material.opacity = i === currentEra ? 0.8 : 0.2 })
        // Impact markers
        impactGroup.visible = currentEra === ERAS.length - 1
        updateLabels()
      }
    },
    update(dt) {
      impactGroup.children.forEach(c => { if (c.material?.blending === THREE.AdditiveBlending) c.material.opacity = 0.3 + Math.sin(Date.now() * 0.003) * 0.2 })
      spheres.children.forEach(s => { s.rotation.y += dt * 0.015; s.rotation.x += dt * 0.008 })
    },
    dispose() {},
  }
  group.userData = { api }
  return group
}

export { ERAS }
