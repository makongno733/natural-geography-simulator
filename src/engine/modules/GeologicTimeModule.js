// [M11] GeologicTimeModule — 地质年代3D教学 — 四大圈层+人类影响

import * as THREE from 'three'
import { GeometryFactory } from '../utils/GeometryFactory.js'

/* ── Geological Time Scale Data ── */
const ERAS = [
  { name: '冥古宙', en: 'Hadean', start: 4600, end: 4000, color: 0x8B0000,
    desc: '地球形成，岩浆海洋，无生命。月球在约45亿年前由忒伊亚撞击形成。大气以氢、氦、甲烷为主。' },
  { name: '太古宙', en: 'Archean', start: 4000, end: 2500, color: 0xCD5C5C,
    desc: '最早的原核生命（细菌、古菌）出现于约38亿年前。叠层石开始形成。大气缺氧，海洋富含溶解铁。' },
  { name: '元古宙', en: 'Proterozoic', start: 2500, end: 541, color: 0xDEB887,
    desc: '大氧化事件（约24亿年前）：蓝藻光合作用释放氧气。真核生物出现。雪球地球冰期。埃迪卡拉生物群。' },
  { name: '古生代', en: 'Paleozoic', start: 541, end: 252, color: 0x4A9E4A,
    desc: '寒武纪生命大爆发。鱼类→两栖类→爬行类。石炭纪巨型昆虫和蕨类森林形成今日煤层。盘古大陆形成。' },
  { name: '中生代', en: 'Mesozoic', start: 252, end: 66, color: 0x6495ED,
    desc: '恐龙时代。三叠纪-侏罗纪-白垩纪。泛大陆分裂。被子植物出现。白垩纪末小行星撞击灭绝恐龙。' },
  { name: '新生代', en: 'Cenozoic', start: 66, end: 2.58, color: 0xFFD700,
    desc: '哺乳动物和鸟类崛起。喜马拉雅造山运动。草原扩张。人类祖先在非洲出现。第四纪冰期开始。' },
  { name: '第四纪', en: 'Quaternary', start: 2.58, end: 0.0117, color: 0xFF6347,
    desc: '更新世大冰期，海平面下降百米。智人（Homo sapiens）在约30万年前出现，约7万年前走出非洲。' },
  { name: '全新世', en: 'Holocene', start: 0.0117, end: 0, color: 0xFF4500,
    desc: '农业革命（~1.2万年前）→ 工业革命（~1760）→ 信息时代。人类成为地质营力：城市扩张、CO₂排放、物种灭绝加速、塑料污染、核试验标记"人类世"。' },
]

/* ── Generate terrain ── */
function buildTerrain() {
  const size = 8, seg = 128
  const geo = new THREE.PlaneGeometry(size, size, seg, seg)
  geo.rotateX(-Math.PI / 2)
  const pos = geo.attributes.position
  const colors = new Float32Array(pos.count * 3)

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i)
    // Continental shapes via noise-like function
    const continent = Math.sin(x * 0.8) * Math.cos(z * 0.6) + Math.sin(x * 1.3 + z * 0.4) * 0.7 + Math.cos(z * 1.1 - x * 0.3) * 0.6
    const isLand = continent > 0.15
    const h = isLand ? Math.max(0, continent - 0.15) * 0.8 + Math.random() * 0.1 : -0.3 - Math.random() * 0.4
    pos.setY(i, h)

    if (isLand) {
      const shade = 0.4 + Math.random() * 0.3
      colors[i * 3] = 0.3 * shade; colors[i * 3 + 1] = 0.55 * shade; colors[i * 3 + 2] = 0.2 * shade
    } else {
      const d = Math.max(0, Math.min(1, (-h) / 0.7))
      colors[i * 3] = 0.1 + d * 0.1; colors[i * 3 + 1] = 0.3 + d * 0.3; colors[i * 3 + 2] = 0.55 + d * 0.3
    }
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geo.computeVertexNormals()
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7, metalness: 0.05, side: THREE.DoubleSide }))
}

/* ─── Spheres visualization ─── */
function buildSpheres() {
  const g = new THREE.Group()
  // Atmosphere — thin blue shell above land
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(5, 48, 24), new THREE.MeshBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.06, side: THREE.DoubleSide, depthWrite: false }))
  atmo.position.y = 0.3; g.add(atmo)
  // Hydrosphere — blue dots over oceans
  const hydro = new THREE.Mesh(new THREE.SphereGeometry(4.8, 48, 24), new THREE.MeshBasicMaterial({ color: 0x3388cc, wireframe: true, transparent: true, opacity: 0.04, depthWrite: false }))
  hydro.position.y = -0.2; g.add(hydro)
  // Biosphere — green dots
  const bio = new THREE.Mesh(new THREE.SphereGeometry(4.6, 48, 24), new THREE.MeshBasicMaterial({ color: 0x44aa44, wireframe: true, transparent: true, opacity: 0.05, depthWrite: false }))
  bio.position.y = 0.05; g.add(bio)
  return g
}

/* ─── Module ─── */
export function GeologicTimeModule(scene, params, services) {
  const { labelSystem, cameraRig } = services
  const group = new THREE.Group()
  let currentEra = params.era || ERAS.length - 1 // Default to Holocene

  scene.background = new THREE.Color(0x1a1a2e)
  scene.fog = new THREE.Fog(0x1a1a2e, 8, 25)

  // Ocean plane
  const ocean = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshStandardMaterial({ color: 0x1a4488, roughness: 0.3, metalness: 0.1 }))
  ocean.rotation.x = -Math.PI / 2; ocean.position.y = -0.5; group.add(ocean)

  // Terrain
  const terrain = buildTerrain()
  group.add(terrain)

  // Spheres
  const spheres = buildSpheres()
  group.add(spheres)

  // Time rings around terrain
  ERAS.forEach((era, i) => {
    const r = 4.5 + i * 0.15
    const pts = []
    for (let j = 0; j <= 128; j++) { const t = j / 128 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(t) * r, 0.02, Math.sin(t) * r)) }
    const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: era.color, transparent: true, opacity: i === currentEra ? 0.8 : 0.2, depthTest: true }))
    ring.userData.eraIdx = i; group.add(ring)
  })

  // Human impact markers (Holocene)
  const impactGroup = new THREE.Group()
  const cities = [[1.5, 0.04, 1.2], [-1.8, 0.04, -1], [0.5, 0.04, -2], [-1, 0.04, 1.8], [2, 0.04, -1.5]]
  cities.forEach(([x, y, z]) => {
    const dot = new THREE.Mesh(GeometryFactory.sphere(0.06, 8), new THREE.MeshBasicMaterial({ color: 0xff4400 }))
    dot.position.set(x, y, z); impactGroup.add(dot)
    // Glow
    const glow = new THREE.Mesh(GeometryFactory.ring(0.08, 0.16, 16), new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }))
    glow.rotation.x = -Math.PI / 2; glow.position.copy(dot.position); impactGroup.add(glow)
  })
  group.add(impactGroup)

  // Labels
  if (labelSystem) {
    labelSystem.addToGroup(group, '四大圈层', new THREE.Vector3(5.5, 3, 0), { color: '#88ccff', fontSize: '14px', fontWeight: '700', background: 'rgba(0,0,0,0.6)' })
    labelSystem.addToGroup(group, '大气圈 · 水圈 · 岩石圈 · 生物圈', new THREE.Vector3(5.5, 2.5, 0), { color: '#aaa', fontSize: '11px', background: 'rgba(0,0,0,0.5)' })
    labelSystem.addToGroup(group, '全新世人类影响', new THREE.Vector3(0, 0.5, 4.5), { color: '#ff6644', fontSize: '14px', fontWeight: '700', background: 'rgba(0,0,0,0.6)' })
    labelSystem.addToGroup(group, '城市 · CO₂ · 塑料 · 核试验', new THREE.Vector3(0, 0.1, 4.5), { color: '#ff9966', fontSize: '10px', background: 'rgba(0,0,0,0.5)' })
    // Era description
    const era = ERAS[currentEra]
    if (era) {
      labelSystem.addToGroup(group, `${era.name} · ${era.en}\n${era.start}Ma — ${era.end === 0 ? '至今' : era.end + 'Ma'}`, new THREE.Vector3(0, 3.5, 0), { color: '#' + era.color.toString(16).padStart(6, '0'), fontSize: '16px', fontWeight: '700', background: 'rgba(0,0,0,0.7)', padding: '6px 14px', borderRadius: '6px', whiteSpace: 'pre-line' })
      labelSystem.addToGroup(group, era.desc, new THREE.Vector3(0, -3.5, 0), { color: '#ddd', fontSize: '12px', background: 'rgba(0,0,0,0.65)', padding: '8px 14px', borderRadius: '6px', whiteSpace: 'normal', maxWidth: '500px', lineHeight: '1.5' })
    }
  }

  // Fixed camera at 50° angle
  if (cameraRig) {
    const angle = 50 * Math.PI / 180
    cameraRig.camera.position.set(0, Math.sin(angle) * 10, Math.cos(angle) * 10)
    cameraRig.controls.target.set(0, 0, 0)
    cameraRig.controls.enableRotate = false
    cameraRig.controls.enableZoom = true
    cameraRig.controls.minDistance = 5
    cameraRig.controls.maxDistance = 20
    cameraRig.controls.update()
  }

  const api = {
    setParams(p) {
      if (p.era !== undefined) {
        currentEra = p.era
        // Update ring opacity
        group.children.forEach(c => { if (c.userData?.eraIdx !== undefined) c.material.opacity = c.userData.eraIdx === p.era ? 0.8 : 0.2 })
        // Update impact visibility
        impactGroup.visible = currentEra === ERAS.length - 1
        // Update labels
        if (labelSystem) {
          labelSystem.clearAll(scene)
          const era = ERAS[currentEra]
          if (era) {
            labelSystem.addToGroup(group, `${era.name} · ${era.en}\n${era.start}Ma — ${era.end === 0 ? '至今' : era.end + 'Ma'}`, new THREE.Vector3(0, 3.5, 0), { color: '#' + era.color.toString(16).padStart(6, '0'), fontSize: '16px', fontWeight: '700', background: 'rgba(0,0,0,0.7)', padding: '6px 14px', borderRadius: '6px', whiteSpace: 'pre-line' })
            labelSystem.addToGroup(group, era.desc, new THREE.Vector3(0, -3.5, 0), { color: '#ddd', fontSize: '12px', background: 'rgba(0,0,0,0.65)', padding: '8px 14px', borderRadius: '6px', whiteSpace: 'normal', maxWidth: '500px', lineHeight: '1.5' })
          }
          labelSystem.addToGroup(group, '四大圈层', new THREE.Vector3(5.5, 3, 0), { color: '#88ccff', fontSize: '14px', fontWeight: '700', background: 'rgba(0,0,0,0.6)' })
          labelSystem.addToGroup(group, '大气圈 · 水圈 · 岩石圈 · 生物圈', new THREE.Vector3(5.5, 2.5, 0), { color: '#aaa', fontSize: '11px', background: 'rgba(0,0,0,0.5)' })
          labelSystem.addToGroup(group, '全新世人类影响', new THREE.Vector3(0, 0.5, 4.5), { color: '#ff6644', fontSize: '14px', fontWeight: '700', background: 'rgba(0,0,0,0.6)' })
        }
      }
    },
    update(dt) {
      impactGroup.children.forEach(c => { if (c.material?.blending === THREE.AdditiveBlending) c.material.opacity = 0.3 + Math.sin(Date.now() * 0.003) * 0.2 })
      spheres.children.forEach(s => { s.rotation.y += dt * 0.02; s.rotation.x += dt * 0.01 })
    },
    dispose() {},
  }
  group.userData = { api }
  return group
}

export { ERAS }
