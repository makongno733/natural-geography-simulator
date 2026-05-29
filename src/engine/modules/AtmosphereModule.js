// [M04] AtmosphereModule — 大气垂直分层·组成·受热·环流·温室 — 必修一Ch2 · 选必1Ch3
import * as THREE from 'three'
import { GeometryFactory } from '../utils/GeometryFactory.js'

/* ── Data ── */

const LAYER_DATA = [
  { name: '对流层', alt: [0, 12], color: 0x4a9eff, simple: '天气现象 · 每百米降0.65°C', pro: '大气质量75% · 温度递减率6.5°C/km · 对流旺盛' },
  { name: '平流层', alt: [12, 50], color: 0xffaa44, simple: '臭氧层 · 适合飞行', pro: '臭氧浓度峰值20-25km · 逆温层 · 平流运动为主' },
  { name: '中间层', alt: [50, 85], color: 0x9966ff, simple: '流星燃烧', pro: '温度最低-90°C · 夜光云 · 流星体消融区' },
  { name: '热层', alt: [85, 500], color: 0xff4466, simple: '电离层 · 极光', pro: '温度可达1000°C+ · 电离层D/E/F层 · 无线电波反射' },
  { name: '散逸层', alt: [500, 1000], color: 0xffffff, simple: '逃逸层 · 卡门线100km', pro: '大气粒子逃逸进入太空 · 氢氦为主 · 外大气圈' },
]

const TEMP_PROFILE = [
  [0, 15], [6, -24], [12, -56],
  [20, -56], [30, -2], [50, -2],
  [60, -60], [85, -90],
  [100, -50], [200, 500], [500, 1200],
]

const COMP_DATA = [
  { name: 'N₂', pct: 78, color: 0x4488ff, role: '氮循环基础', proRole: '固氮作用 · 蛋白质/核酸组成元素' },
  { name: 'O₂', pct: 21, color: 0x44cc44, role: '生命必需', proRole: '呼吸作用 · 氧化反应 · 臭氧前体' },
  { name: 'Ar', pct: 0.93, color: 0xffdd88, role: '惰性气体', proRole: '放射性定年(⁴⁰Ar/³⁹Ar) · 示踪气体' },
  { name: 'CO₂', pct: 0.04, color: 0x888888, role: '光合作用 · 温室气体', proRole: '碳循环关键 · 长波辐射强吸收 · 浓度持续上升' },
  { name: 'O₃', pct: '微量', color: 0xaa66ff, role: '吸收紫外线', proRole: '平流层臭氧层 · 光化学反应 · Chapman循环' },
  { name: 'H₂O', pct: '变化', color: 0xffffff, role: '云雨形成', proRole: '相变潜热 · 温室效应最强 · 时空分布不均' },
]

const PRESSURE_BELTS = [
  { lat: 0, name: '赤道低压带', color: '#ff6644', cause: '热力原因' },
  { lat: 30, name: '副热带高压带', color: '#ffaa44', cause: '动力原因' },
  { lat: 60, name: '副极地低压带', color: '#4488ff', cause: '动力原因' },
  { lat: -30, name: '副热带高压带', color: '#ffaa44', cause: '动力原因' },
  { lat: -60, name: '副极地低压带', color: '#4488ff', cause: '动力原因' },
  { lat: 90, name: '极地高压带', color: '#aaaaff', cause: '热力原因' },
  { lat: -90, name: '极地高压带', color: '#aaaaff', cause: '热力原因' },
]

const LOCAL_CIRCULATIONS = ['海陆风', '山谷风', '城市热岛']

/* ── Helpers ── */

function addRibbon(group, points, color, radius = 0.01, opacity = 0.55) {
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 96, radius, 8, false),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }),
  )
  group.add(tube)
  return tube
}

function makeParticleField(count, rangeFn, size, color, opacity = 0.6, additive = true) {
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const p = rangeFn(i, count)
    pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  return new THREE.Points(geo, new THREE.PointsMaterial({
    size, color, transparent: true, opacity, depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  }))
}

/* ── Planet Surface ── */

function addPlanetSurface(group, radius) {
  group.add(new THREE.Mesh(
    GeometryFactory.sphere(radius * 1.003, 64),
    new THREE.MeshStandardMaterial({ color: 0x1c6aa8, roughness: 0.5, metalness: 0.08, transparent: true, opacity: 0.28 }),
  ))
  const landMat = new THREE.MeshStandardMaterial({ color: 0x7ab86a, roughness: 0.86, metalness: 0.02, transparent: true, opacity: 0.78 })
  const highlandMat = new THREE.MeshStandardMaterial({ color: 0xe0d0a8, roughness: 0.9, metalness: 0.01, transparent: true, opacity: 0.84 })
  const patches = [[-0.7, 0.38, 0.45, 1.3, 0.55, 0.28], [0.3, 0.2, -0.75, 1.0, 0.42, -0.35], [0.82, -0.28, 0.32, 0.75, 0.36, 0.2], [-0.2, -0.45, -0.62, 0.9, 0.3, -0.1], [0.18, 0.62, 0.2, 0.72, 0.22, 0.55]]
  patches.forEach(([x, y, z, sx, sy, rot], i) => {
    const patch = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.32, 36), i === 4 ? highlandMat : landMat)
    patch.position.set(x, y, z).normalize().multiplyScalar(radius * 1.012)
    patch.lookAt(0, 0, 0); patch.rotateZ(rot); patch.scale.set(sx, sy, 1)
    group.add(patch)
  })
  for (let i = 0; i < 7; i++) {
    const lat = (-50 + i * 16) * Math.PI / 180
    const ring = new THREE.Mesh(GeometryFactory.torus(Math.cos(lat) * radius * 1.018, 0.006, 6, 160),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: i % 2 ? 0.12 : 0.2, depthWrite: false }))
    ring.position.y = Math.sin(lat) * radius * 1.018; ring.rotation.x = Math.PI / 2
    group.add(ring)
  }
}

/* ── Module ── */

export function AtmosphereModule(scene, params, services) {
  const { labelSystem } = services
  const group = new THREE.Group()
  const mode = params.mode || 'simple'
  const isPro = mode === 'professional'
  let currentTheme = params.theme || 0
  const R = 1.8
  const S = 6 / 1000

  group.add(GeometryFactory.starField(1500, 500))

  const earth = new THREE.Mesh(
    GeometryFactory.sphere(R, 64),
    new THREE.MeshStandardMaterial({ color: 0x4a90d9, roughness: 0.6, metalness: 0.1 }),
  )
  earth.rotation.x = 0.3
  group.add(earth)
  addPlanetSurface(group, R)

  // Sky dome (optional, may fail silently)
  import('@takram/three-atmosphere').then(({ SkyMaterial }) => {
    const sky = new SkyMaterial()
    const sunDir = new THREE.Vector3(1, 0.3, 0.5).normalize()
    sky.uniforms?.sunDirection ? sky.uniforms.sunDirection.value.copy(sunDir) : sky.setSunDirection?.(sunDir)
    const skyMesh = new THREE.Mesh(GeometryFactory.sphere(800, 32), sky)
    skyMesh.scale.set(-1, 1, 1)
    group.add(skyMesh)
  }).catch(() => {})

  let themeObjects = []
  let animData = {}

  function clearTheme() {
    themeObjects.forEach(o => {
      group.remove(o)
      if (o.geometry) o.geometry.dispose()
      if (o.material) o.material.dispose()
    })
    themeObjects = []
    animData = {}
  }

  /* ── Theme 0: 垂直分层 ── */

  function showLayers() {
    LAYER_DATA.forEach((d, idx) => {
      const rOuter = R + (d.alt[1] / 1000) * 6
      const rInner = R + (d.alt[0] / 1000) * 6
      const rMid = (rOuter + rInner) / 2

      // Transparent shell
      const shell = new THREE.Mesh(
        GeometryFactory.sphere(rMid, isPro ? 64 : 48),
        new THREE.MeshBasicMaterial({
          color: d.color, transparent: true,
          opacity: isPro ? 0.06 : 0.1,
          side: THREE.DoubleSide, depthWrite: false,
        }),
      )
      group.add(shell); themeObjects.push(shell)

      // Label
      if (labelSystem) {
        const text = isPro ? `${d.name} ${d.alt[0]}-${d.alt[1]}km\n${d.pro}` : `${d.name} · ${d.simple}`
        labelSystem.addToGroup(group, text, new THREE.Vector3(rMid + 0.03, (idx - 2) * 0.3, 0), {
          color: '#' + d.color.toString(16).padStart(6, '0'),
          fontSize: isPro ? '10px' : '13px',
          fontWeight: '700',
          whiteSpace: 'pre-line',
          lineHeight: '1.3',
          background: 'rgba(0,0,0,0.45)',
        })
      }
    })

    // Temperature curve (always shown, more detailed in pro)
    const tempPts = TEMP_PROFILE.map(([alt, temp]) =>
      new THREE.Vector3(temp * 0.25, R + alt * S, 0))
    const curve = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(tempPts),
      new THREE.LineBasicMaterial({ color: 0xff6644, transparent: true, opacity: 0.8 }),
    )
    group.add(curve); themeObjects.push(curve)

    if (labelSystem) {
      labelSystem.addToGroup(group, isPro ? '温度(°C)\n-100 ─ 1200' : '温度曲线', new THREE.Vector3(-0.4, R + 0.5, 0),
        { color: '#ff6644', fontSize: '9px' })
    }

    // Cloud particles in troposphere
    const clouds = makeParticleField(80, () => {
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = Math.random() * Math.PI * 2
      const alt = (0.5 + Math.random() * 8) * S
      return new THREE.Vector3(
        (R + alt) * Math.sin(phi) * Math.cos(theta),
        (R + alt) * Math.cos(phi),
        (R + alt) * Math.sin(phi) * Math.sin(theta),
      )
    }, 0.04, 0xffffff, 0.7)
    group.add(clouds); themeObjects.push(clouds)
    animData.clouds = clouds

    // Ozone ring
    const ozone = new THREE.Mesh(
      GeometryFactory.torus(R + 22 * S, 0.018, 8, 192),
      new THREE.MeshBasicMaterial({ color: 0xb388ff, transparent: true, opacity: 0.42, blending: THREE.AdditiveBlending, depthWrite: false }),
    )
    ozone.rotation.x = Math.PI / 2
    group.add(ozone); themeObjects.push(ozone)
  }

  /* ── Theme 1: 大气组成 ── */

  function showComposition() {
    COMP_DATA.forEach((d, idx) => {
      const count = isPro ? 800 + idx * 200 : 400 + idx * 100
      const particles = makeParticleField(count, () => {
        const phi = Math.acos(2 * Math.random() - 1)
        const theta = Math.random() * Math.PI * 2
        const h = (0.3 + Math.random() * 15) * S
        return new THREE.Vector3(
          (R + h) * Math.sin(phi) * Math.cos(theta),
          (R + h) * Math.cos(phi),
          (R + h) * Math.sin(phi) * Math.sin(theta),
        )
      }, isPro ? 0.03 : 0.05, d.color)
      group.add(particles); themeObjects.push(particles)

      if (labelSystem) {
        const a = (idx / COMP_DATA.length) * Math.PI * 2
        const lr = R + 0.7
        const text = isPro ? `${d.name} ${d.pct}%\n${d.proRole}` : `${d.name} ${d.pct}% · ${d.role}`
        labelSystem.addToGroup(group, text, new THREE.Vector3(Math.cos(a) * lr, Math.sin(a) * 0.5, Math.sin(a) * lr * 0.5), {
          color: '#' + d.color.toString(16).padStart(6, '0'),
          fontSize: isPro ? '9px' : '11px',
          fontWeight: '600',
          whiteSpace: 'pre-line',
          lineHeight: '1.3',
          background: 'rgba(0,0,0,0.4)',
        })
      }
    })
  }

  /* ── Theme 2: 受热过程 ── */

  function showRadiation() {
    const sunPos = new THREE.Vector3(8, 5, 6)
    const ground = new THREE.Vector3(0, R, 0)
    const lowAtm = new THREE.Vector3(0, R + 0.5, 0)
    const midAtm = new THREE.Vector3(0, R + 1.2, 0)

    if (isPro) {
      // University: full energy budget diagram
      const stages = [
        { from: sunPos, to: ground, color: 0xffee44, label: '太阳短波辐射\n(0.15-4μm)', sub: '100单位 → 大气吸收19 + 散射/反射30 = 到达地面51' },
        { from: ground, to: lowAtm, color: 0xff4444, label: '地面长波辐射\n(4-120μm)', sub: '地面辐射147单位 → 大气吸收144' },
        { from: midAtm, to: ground, color: 0xff8800, label: '大气逆辐射\n(长波)', sub: '大气逆辐射106单位 → 地面净得热' },
        { from: new THREE.Vector3(-4, R + 1.5, 0), to: new THREE.Vector3(-6, 6, 0), color: 0xaaaaaa, label: '射出长波辐射\n(OLR)', sub: '大气顶出射70单位' },
      ]
      stages.forEach(s => {
        const curve = new THREE.LineCurve3(s.from, s.to)
        const pts = makeParticleField(60, (i) => curve.getPoint(i / 60), 0.07, s.color, 0.8)
        group.add(pts); themeObjects.push(pts)
        if (labelSystem) {
          const mid = curve.getPoint(0.5)
          labelSystem.addToGroup(group, `${s.label}\n${s.sub}`, mid.clone().add(new THREE.Vector3(1, 0.5, 0)), {
            color: '#' + s.color.toString(16).padStart(6, '0'), fontSize: '9px', fontWeight: '600',
            whiteSpace: 'pre-line', lineHeight: '1.3', background: 'rgba(0,0,0,0.5)',
          })
        }
      })
    } else {
      // High school: "三步口诀" - three clear arrows
      const stages = [
        { from: sunPos, to: ground, color: 0xffee44, label: '① 太阳暖大地', desc: '太阳短波辐射加热地面' },
        { from: ground, to: lowAtm, color: 0xff4444, label: '② 大地暖大气', desc: '地面长波辐射加热大气' },
        { from: midAtm, to: ground, color: 0xff8800, label: '③ 大气还大地', desc: '大气逆辐射保温地面' },
      ]
      stages.forEach((s, idx) => {
        const curve = new THREE.LineCurve3(s.from, s.to)
        const pts = makeParticleField(50, (i) => curve.getPoint(i / 60), 0.09, s.color, 0.9)
        group.add(pts); themeObjects.push(pts)
        // Direction cone
        const tip = curve.getPoint(0.88)
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 16),
          new THREE.MeshBasicMaterial({ color: s.color, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }))
        cone.position.copy(tip); cone.lookAt(curve.getPoint(0.95)); cone.rotateX(Math.PI / 2)
        group.add(cone); themeObjects.push(cone)
        if (labelSystem) {
          const mid = curve.getPoint(0.5)
          labelSystem.addToGroup(group, `${s.label}\n${s.desc}`, mid.clone().add(new THREE.Vector3(1, idx * 0.8 - 0.8, 0)), {
            color: '#' + s.color.toString(16).padStart(6, '0'), fontSize: '12px', fontWeight: '700',
            whiteSpace: 'pre-line', background: 'rgba(0,0,0,0.5)',
          })
        }
      })
    }
  }

  /* ── Theme 3: 大气环流 ── */

  function showCirculation() {
    const cells = [
      { lats: [[-30, 0], [0, 30]], color: 0xff6644, name: '哈得来环流' },
      { lats: [[-60, -30], [30, 60]], color: 0x44dd88, name: '费雷尔环流' },
      { lats: [[-90, -60], [60, 90]], color: 0x4488ff, name: '极地环流' },
    ]

    cells.forEach(cell => {
      cell.lats.forEach(range => {
        const tube = new THREE.Mesh(
          GeometryFactory.spiralTube(range[0], range[1], R, 0.8, cell.color, 0.02, 200),
          new THREE.MeshStandardMaterial({ color: cell.color, roughness: 0.3, metalness: 0.2, transparent: true, opacity: 0.6 }),
        )
        group.add(tube); themeObjects.push(tube)

        for (let i = 0; i < 5; i++) {
          const m = new THREE.Mesh(GeometryFactory.sphere(0.035, 16),
            new THREE.MeshBasicMaterial({ color: cell.color, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending }))
          m.userData.circulation = { latStart: range[0], latEnd: range[1], phase: i / 5, speed: range[0] < 0 ? -0.07 : 0.07 }
          group.add(m); themeObjects.push(m)
        }
      })

      if (labelSystem && isPro) {
        const lat = (cell.lats[0][0] + cell.lats[0][1]) / 2
        const lr = R + 1.4
        const rad = lat * Math.PI / 180
        labelSystem.addToGroup(group, cell.name, new THREE.Vector3(lr * Math.cos(rad), lr * Math.sin(rad), 0), {
          color: '#' + cell.color.toString(16).padStart(6, '0'), fontSize: '11px', fontWeight: '700',
        })
      }
    })

    // Pressure belts & wind labels
    if (labelSystem) {
      PRESSURE_BELTS.forEach(b => {
        const rad = b.lat * Math.PI / 180
        const lr = R + 1.1
        const text = isPro ? `${b.name}\n[${b.cause}]` : b.name
        labelSystem.addToGroup(group, text, new THREE.Vector3(lr * Math.cos(rad), lr * Math.sin(rad), 0), {
          color: b.color, fontSize: isPro ? '9px' : '11px', fontWeight: isPro ? '600' : '700',
          whiteSpace: 'pre-line', background: 'rgba(0,0,0,0.4)',
        })
      })

      const winds = isPro
        ? [{ lat: 15, t: 'NE信风' }, { lat: -15, t: 'SE信风' }, { lat: 45, t: 'SW西风' }, { lat: -45, t: 'NW西风' }, { lat: 75, t: 'NE东风' }, { lat: -75, t: 'SE东风' }]
        : [{ lat: 15, t: '东北信风' }, { lat: -15, t: '东南信风' }, { lat: 45, t: '盛行西风' }, { lat: -45, t: '盛行西风' }, { lat: 75, t: '极地东风' }, { lat: -75, t: '极地东风' }]
      winds.forEach(w => {
        const rad = w.lat * Math.PI / 180
        const lr = R + 1.3
        labelSystem.addToGroup(group, w.t, new THREE.Vector3(lr * Math.cos(rad), lr * Math.sin(rad), 0), {
          color: '#ffcc88', fontSize: '9px', fontWeight: '500',
        })
      })
    }
  }

  /* ── Theme 4: 热力环流 ── */

  function showLocalCirculation() {
    // Pick circulation type - show all three with labels
    const circTypes = [
      { name: '海陆风 (白天海风)', flow: [[-1, 0.05, 0], [-0.5, 0.5, 0], [0.5, 0.5, 0], [1, 0.05, 0], [-1, 0.05, 0]], hot: [1, '热\n↑', '#ff6644'], cold: [-1, '冷\n↓', '#4488ff'] },
    ]

    // Ground strip
    const ground = new THREE.Mesh(
      GeometryFactory.plane(3, 2), new THREE.MeshStandardMaterial({ color: 0x7ab86a, roughness: 0.8 }),
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.set(0, -R, 0)
    group.add(ground); themeObjects.push(ground)

    // Flow loop
    const pts = [new THREE.Vector3(-1, 0.05, 0), new THREE.Vector3(-0.5, 0.5, 0), new THREE.Vector3(0.5, 0.5, 0), new THREE.Vector3(1, 0.05, 0)]
    const curve = new THREE.CatmullRomCurve3([...pts, pts[0]], true)
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 80, 0.015, 8, true),
      new THREE.MeshBasicMaterial({ color: 0xff6644, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }),
    )
    group.add(tube); themeObjects.push(tube)

    if (labelSystem) {
      labelSystem.addToGroup(group, isPro ? '热力环流\n地面冷热不均 → 空气垂直运动 → 水平气压差 → 风' : '热力环流\n地面冷热不均 → 大气运动', new THREE.Vector3(0, 0.8, 0), {
        color: '#ffaa44', fontSize: isPro ? '11px' : '13px', fontWeight: '700', whiteSpace: 'pre-line', background: 'rgba(0,0,0,0.5)',
      })
      labelSystem.addToGroup(group, '海陆风\n白天：海风', new THREE.Vector3(0, 0.35, 0), {
        color: '#ffaa44', fontSize: '12px', fontWeight: '700', whiteSpace: 'pre-line',
      })
      labelSystem.addToGroup(group, isPro ? '热低压 ↑' : '热 ↑', new THREE.Vector3(1.2, 0.2, 0), { color: '#ff6644', fontSize: '14px', fontWeight: '700' })
      labelSystem.addToGroup(group, isPro ? '冷高压 ↓' : '冷 ↓', new THREE.Vector3(-1.2, 0.2, 0), { color: '#4488ff', fontSize: '14px', fontWeight: '700' })
    }
  }

  /* ── Theme 5: 温室效应 ── */

  function showGreenhouse() {
    // Surface
    const groundStrip = new THREE.Mesh(
      GeometryFactory.plane(4, 1), new THREE.MeshStandardMaterial({ color: 0x8B7355 }),
    )
    groundStrip.rotation.x = -Math.PI / 2
    groundStrip.position.set(0, -R, 0)
    group.add(groundStrip); themeObjects.push(groundStrip)

    if (isPro) {
      // University: detailed radiation balance with CO₂ absorption bands
      const groundUp = makeParticleField(200, (i) => {
        const x = (Math.random() - 0.5) * 4
        const y = -R + 0.05 + Math.random() * 2.5
        return new THREE.Vector3(x, y, (Math.random() - 0.5) * 2)
      }, 0.05, 0xff4444, 0.5)
      group.add(groundUp); themeObjects.push(groundUp)

      // CO₂ layer
      const co2 = makeParticleField(60, (i) => {
        return new THREE.Vector3((Math.random() - 0.5) * 4, -R + 0.8 + Math.random() * 1.5, (Math.random() - 0.5) * 3)
      }, 0.07, 0x888888, 0.7)
      group.add(co2); themeObjects.push(co2)
      animData.co2 = co2

      // Back radiation
      for (let i = 0; i < 5; i++) {
        const x = (i - 2) * 0.7
        const pts = makeParticleField(20, (j) => new THREE.Vector3(x, -R + 0.1 + (0.8 * (1 - j / 20)), 0), 0.06, 0xff8800, 0.6)
        group.add(pts); themeObjects.push(pts)
      }

      if (labelSystem) {
        labelSystem.addToGroup(group, 'OLR\n70 W/m²', new THREE.Vector3(0, -R + 2.5, 0),
          { color: '#aaa', fontSize: '10px', fontWeight: '600' })
        labelSystem.addToGroup(group, '大气逆辐射\n106 W/m² ↓', new THREE.Vector3(0, -R + 0.5, 1.5),
          { color: '#ff8800', fontSize: '10px', fontWeight: '700' })
        labelSystem.addToGroup(group, 'CO₂ · H₂O · CH₄\n吸收长波辐射', new THREE.Vector3(0, -R + 1.3, 1.5),
          { color: '#888', fontSize: '11px', fontWeight: '600', whiteSpace: 'pre-line', background: 'rgba(0,0,0,0.5)' })
      }
    } else {
      // High school: simple visualization with real-life examples
      const groundUp = makeParticleField(150, (i) => {
        const x = (Math.random() - 0.5) * 4
        const y = -R + 0.05 + Math.random() * 2
        return new THREE.Vector3(x, y, (Math.random() - 0.5) * 2)
      }, 0.06, 0xff4444, 0.5)
      group.add(groundUp); themeObjects.push(groundUp)

      const co2 = makeParticleField(40, (i) => {
        return new THREE.Vector3((Math.random() - 0.5) * 4, -R + 0.5 + Math.random() * 1.5, (Math.random() - 0.5) * 3)
      }, 0.08, 0x888888, 0.7)
      group.add(co2); themeObjects.push(co2)
      animData.co2 = co2

      // Simple back-radiation arrows
      for (let i = 0; i < 4; i++) {
        const pts = makeParticleField(15, (j) => new THREE.Vector3((i - 1.5) * 0.8, -R + 0.05 + 0.8 * (1 - j / 15), 0), 0.07, 0xff8800, 0.6)
        group.add(pts); themeObjects.push(pts)
      }

      if (labelSystem) {
        labelSystem.addToGroup(group, '大气逆辐射 ↓\n(保温作用)', new THREE.Vector3(0, -R + 0.3, 1.5),
          { color: '#ff8800', fontSize: '12px', fontWeight: '700', whiteSpace: 'pre-line' })
        labelSystem.addToGroup(group, 'CO₂ 温室气体', new THREE.Vector3(0, -R + 1.2, 1.5),
          { color: '#888', fontSize: '11px', fontWeight: '600', background: 'rgba(0,0,0,0.5)' })
        labelSystem.addToGroup(group, '应用：温室大棚\n地膜覆盖 · 熏烟防霜', new THREE.Vector3(2.5, -R + 1.5, 0),
          { color: '#ccc', fontSize: '10px', whiteSpace: 'pre-line', background: 'rgba(0,0,0,0.4)' })
      }
    }
  }

  /* ── Theme switch ── */

  function switchTheme(idx) {
    clearTheme()
    switch (idx) {
      case 0: showLayers(); break
      case 1: showComposition(); break
      case 2: showRadiation(); break
      case 3: showCirculation(); break
      case 4: showLocalCirculation(); break
      case 5: showGreenhouse(); break
    }
  }

  switchTheme(currentTheme)

  const api = {
    setMode(m) { clearTheme(); switchTheme(currentTheme) },
    setParams(p) {
      if (p.theme !== undefined) { currentTheme = p.theme; clearTheme(); switchTheme(currentTheme) }
    },
    update(dt, elapsed) {
      earth.rotation.y += 0.15 * dt
      // Circulation markers
      themeObjects.forEach(obj => {
        if (!obj.userData?.circulation) return
        const d = obj.userData.circulation
        d.phase = (d.phase + dt * d.speed + 1) % 1
        const lat = d.latStart + (d.latEnd - d.latStart) * d.phase
        const lon = d.phase * Math.PI * 4 + elapsed * 0.18
        const rad = lat * Math.PI / 180
        const r = R + 0.8 * Math.sin(d.phase * Math.PI)
        obj.position.set(r * Math.cos(rad) * Math.cos(lon), r * Math.sin(rad), r * Math.cos(rad) * Math.sin(lon))
      })
      // Cloud rotation
      if (animData.clouds) animData.clouds.rotation.y += dt * 0.1
      // CO₂ pulse
      if (animData.co2) animData.co2.material.opacity = 0.5 + Math.sin(elapsed * 0.8) * 0.2
    },
    dispose() { clearTheme() },
  }
  group.userData = { api }
  return group
}
