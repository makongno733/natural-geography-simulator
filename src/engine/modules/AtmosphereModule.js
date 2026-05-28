import * as THREE from 'three'
import { SkyMaterial } from '@takram/three-atmosphere'
import { GeometryFactory } from '../utils/GeometryFactory.js'

const LAYER_HEIGHTS = {
  对流层: { min: 0, max: 12, color: 0x4a9eff },
  平流层: { min: 12, max: 50, color: 0xffaa44 },
  中间层: { min: 50, max: 85, color: 0x9966ff },
  热层: { min: 85, max: 500, color: 0xff4466 },
  散逸层: { min: 500, max: 1000, color: 0xffffff },
}

const LAYER_LABELS = [
  { name: '对流层 0-12km', height: 6, profExtra: '-0.65°C/100m · 天气现象' },
  { name: '平流层 12-50km', height: 30, profExtra: '臭氧层20-25km · 适合飞行' },
  { name: '中间层 50-85km', height: 65, profExtra: '流星燃烧 · 最低-90°C' },
  { name: '热层 85-500km', height: 200, profExtra: '电离层 · 极光 · 1000°C+' },
  { name: '散逸层 >500km', height: 600, profExtra: '卡门线100km · 逃逸层' },
]

const COMPOSITION_PARTICLES = {
  simple: [
    { name: 'N₂ 78%', color: 0x4488ff, count: 4000, heightRange: [0, 12] },
    { name: 'O₂ 21%', color: 0x44cc44, count: 2000, heightRange: [0, 12] },
    { name: 'CO₂ 0.04%', color: 0x888888, count: 500, heightRange: [0, 20] },
    { name: 'H₂O', color: 0xffffff, count: 1000, heightRange: [0, 3] },
  ],
  professional: [
    { name: 'N₂ 78%', color: 0x4488ff, count: 6000, heightRange: [0, 85] },
    { name: 'O₂ 21%', color: 0x44cc44, count: 3000, heightRange: [0, 85] },
    { name: 'CO₂ 0.04%', color: 0x888888, count: 800, heightRange: [0, 20] },
    { name: 'H₂O', color: 0xffffff, count: 1500, heightRange: [0, 3] },
    { name: 'O₃ 微量', color: 0xaa66ff, count: 600, heightRange: [15, 35] },
    { name: '尘埃', color: 0x886644, count: 400, heightRange: [0, 2] },
    { name: 'Ar 0.93%', color: 0xffdd88, count: 400, heightRange: [0, 85] },
  ],
}

// Temperature profile data points [altitude km, temperature °C]
const TEMP_PROFILE = [
  [0, 15], [6, -24], [12, -56],   // Troposphere: decreasing
  [20, -56], [30, -2], [50, -2],   // Stratosphere: increasing (ozone)
  [60, -60], [85, -90],            // Mesosphere: decreasing
  [100, -50], [200, 500], [500, 1200], // Thermosphere: increasing
]

const PRESSURE_BELTS = [
  { lat: 0, name: '赤道低压带', color: '#ff6644' },
  { lat: 30, name: '副热带高压带', color: '#ffaa44' },
  { lat: 60, name: '副极地低压带', color: '#4488ff' },
  { lat: -30, name: '副热带高压带', color: '#ffaa44' },
  { lat: -60, name: '副极地低压带', color: '#4488ff' },
  { lat: 90, name: '极地高压带', color: '#aaaaff' },
  { lat: -90, name: '极地高压带', color: '#aaaaff' },
]

const WIND_BELTS = [
  { lat: 15, name: '东北信风', color: '#ffaa44', dir: 'SW' },
  { lat: -15, name: '东南信风', color: '#ffaa44', dir: 'NW' },
  { lat: 45, name: '盛行西风', color: '#44cc88', dir: 'NE' },
  { lat: -45, name: '盛行西风', color: '#44cc88', dir: 'SE' },
  { lat: 75, name: '极地东风', color: '#aaaaff', dir: 'SW' },
  { lat: -75, name: '极地东风', color: '#aaaaff', dir: 'NW' },
]

function addPlanetSurface(group, radius) {
  const oceanGlow = new THREE.Mesh(
    GeometryFactory.sphere(radius * 1.003, 64),
    new THREE.MeshStandardMaterial({
      color: 0x1c6aa8, roughness: 0.5, metalness: 0.08,
      transparent: true, opacity: 0.28,
    }),
  )
  group.add(oceanGlow)

  const landMat = new THREE.MeshStandardMaterial({
    color: 0x7ab86a, roughness: 0.86, metalness: 0.02,
    transparent: true, opacity: 0.78,
  })
  const highlandMat = new THREE.MeshStandardMaterial({
    color: 0xe0d0a8, roughness: 0.9, metalness: 0.01,
    transparent: true, opacity: 0.84,
  })

  const patches = [
    [-0.7, 0.38, 0.45, 1.3, 0.55, 0.28],
    [0.3, 0.2, -0.75, 1.0, 0.42, -0.35],
    [0.82, -0.28, 0.32, 0.75, 0.36, 0.2],
    [-0.2, -0.45, -0.62, 0.9, 0.3, -0.1],
    [0.18, 0.62, 0.2, 0.72, 0.22, 0.55],
  ]

  patches.forEach(([x, y, z, sx, sy, rot], i) => {
    const mat = i === 4 ? highlandMat : landMat
    const patch = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.32, 36), mat)
    patch.position.set(x, y, z).normalize().multiplyScalar(radius * 1.012)
    patch.lookAt(0, 0, 0)
    patch.rotateZ(rot)
    patch.scale.set(sx, sy, 1)
    group.add(patch)
  })

  for (let i = 0; i < 7; i++) {
    const lat = (-50 + i * 16) * Math.PI / 180
    const ring = new THREE.Mesh(
      GeometryFactory.torus(Math.cos(lat) * radius * 1.018, 0.006, 6, 160),
      new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true,
        opacity: i % 2 ? 0.12 : 0.2, depthWrite: false,
      }),
    )
    ring.position.y = Math.sin(lat) * radius * 1.018
    ring.rotation.x = Math.PI / 2
    group.add(ring)
  }
}

function addRibbon(group, points, color, radius = 0.01, opacity = 0.55) {
  const curve = new THREE.CatmullRomCurve3(points)
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 96, radius, 8, false),
    new THREE.MeshBasicMaterial({
      color, transparent: true, opacity,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }),
  )
  group.add(tube)
  return tube
}

export function AtmosphereModule(scene, params, services) {
  const { labelSystem } = services
  const group = new THREE.Group()
  const mode = params.mode || 'simple'
  const isProfessional = mode === 'professional'
  let currentTheme = params.theme || 0
  const EARTH_RADIUS = 1.8
  const SCALE = 6 / 1000

  group.add(GeometryFactory.starField(2000, 1000))

  const earthGeo = GeometryFactory.sphere(EARTH_RADIUS, 64)
  const earthMat = new THREE.MeshStandardMaterial({
    color: 0x4a90d9, roughness: 0.6, metalness: 0.1,
  })
  const earth = new THREE.Mesh(earthGeo, earthMat)
  earth.rotation.x = 0.3
  group.add(earth)
  addPlanetSurface(group, EARTH_RADIUS)

  try {
    const skyMaterial = new SkyMaterial()
    const sunDirection = new THREE.Vector3(1, 0.3, 0.5).normalize()
    if (typeof skyMaterial.setSunDirection === 'function') {
      skyMaterial.setSunDirection(sunDirection)
    } else if (skyMaterial.uniforms?.sunDirection) {
      skyMaterial.uniforms.sunDirection.value.copy(sunDirection)
    }
    const skyGeo = GeometryFactory.sphere(800, 32)
    const skyMesh = new THREE.Mesh(skyGeo, skyMaterial)
    skyMesh.scale.set(-1, 1, 1)
    group.add(skyMesh)
  } catch (e) {
    console.warn('SkyMaterial not available', e)
  }

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

  // ── Theme 0: 大气垂直分层 ──
  function showVerticalLayers() {
    Object.entries(LAYER_HEIGHTS).forEach(([name, h]) => {
      const outerR = EARTH_RADIUS + (h.max / 1000) * 6
      const innerR = EARTH_RADIUS + (h.min / 1000) * 6
      const r = (outerR + innerR) / 2

      const geo = GeometryFactory.sphere(r, 48)
      const mat = new THREE.ShaderMaterial({
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
        depthWrite: false,
        uniforms: { uColor: { value: new THREE.Color(h.color) } },
        vertexShader: `varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `uniform vec3 uColor; varying vec3 vNormal; void main() { float rim = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))); float alpha = smoothstep(0.4, 1.0, rim) * 0.3; gl_FragColor = vec4(uColor, alpha); }`,
      })
      const mesh = new THREE.Mesh(geo, mat)
      group.add(mesh)
      themeObjects.push(mesh)
    })

    // Temperature curve
    const tempPts = []
    const tempYScale = 6 / 1000
    const tempXScale = 0.25
    TEMP_PROFILE.forEach(([alt, temp]) => {
      const y = EARTH_RADIUS + alt * tempYScale
      const x = temp * tempXScale
      tempPts.push(new THREE.Vector3(x, y, 0))
    })
    const curveGeo = new THREE.BufferGeometry().setFromPoints(tempPts)
    const curve = new THREE.Line(curveGeo, new THREE.LineBasicMaterial({
      color: 0xff6644, linewidth: 1, transparent: true, opacity: 0.8,
    }))
    group.add(curve)
    themeObjects.push(curve)

    // Temp axis labels
    if (labelSystem) {
      labelSystem.addToGroup(group, '温度\n-100°C ── +1000°C', new THREE.Vector3(-0.4, EARTH_RADIUS + 0.5, 0),
        { color: '#ff6644', fontSize: '9px' })
    }

    // Troposphere weather particles
    const cloudCount = 80
    const cloudPos = new Float32Array(cloudCount * 3)
    for (let i = 0; i < cloudCount; i++) {
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = Math.random() * Math.PI * 2
      const alt = (0.5 + Math.random() * 8) * SCALE
      const r = EARTH_RADIUS + alt
      cloudPos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      cloudPos[i * 3 + 1] = r * Math.cos(phi)
      cloudPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    }
    const cloudGeo = new THREE.BufferGeometry()
    cloudGeo.setAttribute('position', new THREE.BufferAttribute(cloudPos, 3))
    const cloudPts = new THREE.Points(cloudGeo, new THREE.PointsMaterial({
      color: 0xffffff, size: 0.04, transparent: true, opacity: 0.7,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }))
    group.add(cloudPts)
    themeObjects.push(cloudPts)
    animData.cloudPts = cloudPts

    // Ozone ring
    const ozone = new THREE.Mesh(
      GeometryFactory.torus(EARTH_RADIUS + 25 * SCALE, 0.018, 8, 192),
      new THREE.MeshBasicMaterial({
        color: 0xb388ff, transparent: true, opacity: 0.42,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }),
    )
    ozone.rotation.x = Math.PI / 2
    group.add(ozone)
    themeObjects.push(ozone)

    // Aurora
    const auroraNorth = addRibbon(group, GeometryFactory.arcPoints(0, Math.PI * 2, EARTH_RADIUS + 0.7, 1.45, 128), 0x66ffcc, 0.008, 0.32)
    const auroraSouth = addRibbon(group, GeometryFactory.arcPoints(0, Math.PI * 2, EARTH_RADIUS + 0.62, -1.45, 128), 0x88bbff, 0.008, 0.26)
    themeObjects.push(auroraNorth, auroraSouth)

    if (labelSystem) {
      LAYER_LABELS.forEach(l => {
        const r = EARTH_RADIUS + l.height * SCALE
        const text = isProfessional ? `${l.name}\n${l.profExtra}` : l.name
        labelSystem.addToGroup(group, text, new THREE.Vector3(r, 0, 0), {
          fontSize: isProfessional ? '10px' : '12px',
          fontWeight: '600',
          whiteSpace: 'pre-line',
          textAlign: 'center',
          lineHeight: '1.4',
        })
      })
    }
  }

  // ── Theme 1: 大气组成 ──
  function showComposition() {
    const particles = COMPOSITION_PARTICLES[mode] || COMPOSITION_PARTICLES.simple

    particles.forEach(p => {
      const positions = new Float32Array(p.count * 3)
      const colors = new Float32Array(p.count * 3)
      const col = new THREE.Color(p.color)

      for (let i = 0; i < p.count; i++) {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        const height = (p.heightRange[0] + Math.random() * (p.heightRange[1] - p.heightRange[0])) * SCALE
        const r = EARTH_RADIUS + height
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
        positions[i * 3 + 1] = r * Math.cos(phi)
        positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
        colors[i * 3] = col.r
        colors[i * 3 + 1] = col.g
        colors[i * 3 + 2] = col.b
      }

      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

      const mat = new THREE.PointsMaterial({
        size: isProfessional ? 0.034 : 0.04,
        vertexColors: true, transparent: true, opacity: 0.8,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })

      const points = new THREE.Points(geo, mat)
      group.add(points)
      themeObjects.push(points)
    })

    // Ozone UV absorption animation ring
    const ozoneRing = new THREE.Mesh(
      GeometryFactory.torus(EARTH_RADIUS + 22 * SCALE, 0.025, 8, 192),
      new THREE.MeshBasicMaterial({
        color: 0xaa66ff, transparent: true, opacity: 0.6,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }),
    )
    ozoneRing.rotation.x = Math.PI / 2
    group.add(ozoneRing)
    themeObjects.push(ozoneRing)
    animData.ozoneRing = ozoneRing

    // Sun UV rays toward ozone layer
    const uvCount = 50
    const uvPos = new Float32Array(uvCount * 3)
    for (let i = 0; i < uvCount; i++) {
      uvPos[i * 3] = 6 + Math.random() * 2
      uvPos[i * 3 + 1] = (EARTH_RADIUS + 20 * SCALE) + (Math.random() - 0.5) * 0.3
      uvPos[i * 3 + 2] = (Math.random() - 0.5) * 3
    }
    const uvGeo = new THREE.BufferGeometry()
    uvGeo.setAttribute('position', new THREE.BufferAttribute(uvPos, 3))
    const uvPts = new THREE.Points(uvGeo, new THREE.PointsMaterial({
      color: 0xffcc00, size: 0.06, transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }))
    group.add(uvPts)
    themeObjects.push(uvPts)
    animData.uvPts = uvPts

    if (labelSystem) {
      labelSystem.addToGroup(group, '臭氧层吸收紫外线', new THREE.Vector3(EARTH_RADIUS + 22 * SCALE, 0.2, 0),
        { color: '#b388ff', fontSize: '11px', fontWeight: '600' })
    }
  }

  // ── Theme 2: 大气受热过程 ──
  function showRadiation() {
    const sunPos = new THREE.Vector3(8, 5, 6)
    const groundPt = new THREE.Vector3(0, EARTH_RADIUS, 0)
    const lowAtm = new THREE.Vector3(0, EARTH_RADIUS + 0.5, 0)
    const midAtm = new THREE.Vector3(0, EARTH_RADIUS + 1.2, 0)

    // Stage markers for three-step flow
    const stages = [
      { from: sunPos, to: groundPt, color: 0xffee44, label: '①太阳短波辐射', desc: '太阳暖大地' },
      { from: groundPt, to: lowAtm, color: 0xff4444, label: '②地面长波辐射', desc: '大地暖大气' },
      { from: midAtm, to: groundPt, color: 0xff8800, label: '③大气逆辐射', desc: '大气还大地' },
    ]

    stages.forEach((s, idx) => {
      const curve = new THREE.LineCurve3(s.from, s.to)
      const count = 50 + idx * 10
      const positions = new Float32Array(count * 3)
      for (let i = 0; i < count; i++) {
        const pt = curve.getPoint(i / count)
        positions[i * 3] = pt.x
        positions[i * 3 + 1] = pt.y
        positions[i * 3 + 2] = pt.z
      }
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const pts = new THREE.Points(geo, new THREE.PointsMaterial({
        size: 0.08, color: s.color, transparent: true, opacity: 0.9,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }))
      group.add(pts)
      themeObjects.push(pts)

      // Arrow at 90% of path
      const tip = curve.getPoint(0.88)
      const next = curve.getPoint(0.95)
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.22, 16),
        new THREE.MeshBasicMaterial({ color: s.color, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }),
      )
      cone.position.copy(tip)
      cone.lookAt(next)
      cone.rotateX(Math.PI / 2)
      group.add(cone)
      themeObjects.push(cone)

      if (labelSystem) {
        const mid = curve.getPoint(0.5)
        labelSystem.addToGroup(group, `${s.label}\n${s.desc}`,
          mid.clone().add(new THREE.Vector3(0.8, 0.6 * (idx - 1), 0)),
          { color: '#' + s.color.toString(16).padStart(6, '0'), fontSize: '10px', fontWeight: '700', whiteSpace: 'pre-line' })
      }
    })

    // Cloud reflection (some solar radiation reflected)
    const reflPos = new Float32Array(30 * 3)
    for (let i = 0; i < 30; i++) {
      const pt = new THREE.Vector3(8 - Math.random() * 3, EARTH_RADIUS + 0.8 + Math.random() * 0.4, (Math.random() - 0.5) * 2)
      reflPos[i * 3] = pt.x; reflPos[i * 3 + 1] = pt.y; reflPos[i * 3 + 2] = pt.z
    }
    const reflGeo = new THREE.BufferGeometry()
    reflGeo.setAttribute('position', new THREE.BufferAttribute(reflPos, 3))
    const reflPts = new THREE.Points(reflGeo, new THREE.PointsMaterial({
      color: 0xcccccc, size: 0.06, transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }))
    group.add(reflPts)
    themeObjects.push(reflPts)
    if (labelSystem && isProfessional) {
      labelSystem.addToGroup(group, '云层反射', new THREE.Vector3(4.5, EARTH_RADIUS + 1.2, 0),
        { color: '#ccc', fontSize: '9px' })
    }
  }

  // ── Theme 3: 大气环流 + 气压带风带 ──
  function showCirculation() {
    const cells = [
      { latRanges: [[-30, 0], [0, 30]], color: 0xff6644, tubeRadius: 0.02, name: '哈得来环流' },
      { latRanges: [[-60, -30], [30, 60]], color: 0x44dd88, tubeRadius: 0.02, name: '费雷尔环流' },
      { latRanges: [[-90, -60], [60, 90]], color: 0x4488ff, tubeRadius: 0.02, name: '极地环流' },
    ]

    cells.forEach(cell => {
      cell.latRanges.forEach(range => {
        const tubeGeo = GeometryFactory.spiralTube(range[0], range[1], EARTH_RADIUS, 0.8, cell.color, cell.tubeRadius, 200)
        const tubeMat = new THREE.MeshStandardMaterial({
          color: cell.color, roughness: 0.3, metalness: 0.2,
          transparent: true, opacity: 0.6,
        })
        const tube = new THREE.Mesh(tubeGeo, tubeMat)
        group.add(tube)
        themeObjects.push(tube)

        for (let i = 0; i < 5; i++) {
          const marker = new THREE.Mesh(
            GeometryFactory.sphere(0.035, 16),
            new THREE.MeshBasicMaterial({
              color: cell.color, transparent: true, opacity: 0.9,
              blending: THREE.AdditiveBlending,
            }),
          )
          marker.userData.circulation = {
            latStart: range[0], latEnd: range[1],
            phase: i / 5,
            speed: range[0] < 0 ? -0.07 : 0.07,
          }
          group.add(marker)
          themeObjects.push(marker)
        }
      })
    })

    // Pressure belt labels
    if (labelSystem) {
      PRESSURE_BELTS.forEach(b => {
        const latRad = (b.lat * Math.PI) / 180
        const r = EARTH_RADIUS + 1.1
        const pos = new THREE.Vector3(
          r * Math.cos(latRad),
          r * Math.sin(latRad),
          0,
        )
        labelSystem.addToGroup(group, b.name, pos, {
          color: b.color, fontSize: '10px', fontWeight: '700',
        })
      })

      // Wind belt arrows
      WIND_BELTS.forEach(w => {
        const latRad = (w.lat * Math.PI) / 180
        const r = EARTH_RADIUS + 1.3
        const pos = new THREE.Vector3(
          r * Math.cos(latRad),
          r * Math.sin(latRad),
          0,
        )
        labelSystem.addToGroup(group, w.name, pos, {
          color: w.color, fontSize: '9px', fontWeight: '600',
        })
      })
    }
  }

  // ── Theme 4: 热力环流 (海陆风/山谷风/城市热岛) ──
  function showLocalCirculation() {
    animData.localMode = 0 // 0=sea breeze, 1=valley wind, 2=urban heat island

    // Ground plane
    const groundGeo = GeometryFactory.plane(3, 2, 1, 1)
    const ground = new THREE.Mesh(groundGeo, new THREE.MeshStandardMaterial({
      color: 0x7ab86a, roughness: 0.8,
    }))
    ground.rotation.x = -Math.PI / 2
    ground.position.set(0, -EARTH_RADIUS + 0.1, 0)
    group.add(ground)
    themeObjects.push(ground)

    // Sun/sky indicator
    const sun = new THREE.Mesh(
      GeometryFactory.sphere(0.12, 16),
      new THREE.MeshBasicMaterial({ color: 0xffaa33 }),
    )
    sun.position.set(1, 0.5, 0)
    group.add(sun)
    themeObjects.push(sun)

    // Flow arrows showing circulation loop
    const flowPts = [
      [new THREE.Vector3(-1, 0.05, 0), new THREE.Vector3(-0.5, 0.5, 0)],
      [new THREE.Vector3(-0.5, 0.5, 0), new THREE.Vector3(0.5, 0.5, 0)],
      [new THREE.Vector3(0.5, 0.5, 0), new THREE.Vector3(1, 0.05, 0)],
      [new THREE.Vector3(1, 0.05, 0), new THREE.Vector3(-1, 0.05, 0)],
    ]

    flowPts.forEach(pts => {
      const tube = addRibbon(group, pts, 0xff6644, 0.015, 0.6)
      themeObjects.push(tube)
    })

    if (labelSystem) {
      labelSystem.addToGroup(group, '热\n↑', new THREE.Vector3(1.2, 0.3, 0), { color: '#ff6644', fontSize: '14px', fontWeight: '700' })
      labelSystem.addToGroup(group, '冷\n↓', new THREE.Vector3(-1.2, 0.3, 0), { color: '#4488ff', fontSize: '14px', fontWeight: '700' })
      labelSystem.addToGroup(group, '海陆风示意\n(白天：海风)', new THREE.Vector3(0, 0.8, 0), { color: '#ffaa44', fontSize: '12px', fontWeight: '700' })
    }
  }

  // ── Theme 5: 温室效应 ──
  function showGreenhouse() {
    const groundPt = new THREE.Vector3(0, -EARTH_RADIUS + 0.1, 0)
    const skyTop = new THREE.Vector3(0, 3, 0)

    // Earth surface emitting long-wave
    const emitCount = 200
    const emitPos = new Float32Array(emitCount * 3)
    for (let i = 0; i < emitCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const r = Math.random() * 1.5
      emitPos[i * 3] = Math.cos(theta) * r
      emitPos[i * 3 + 1] = -EARTH_RADIUS + 0.05 + Math.random() * 2.5
      emitPos[i * 3 + 2] = Math.sin(theta) * r
    }
    const emitGeo = new THREE.BufferGeometry()
    emitGeo.setAttribute('position', new THREE.BufferAttribute(emitPos, 3))
    const emitPts = new THREE.Points(emitGeo, new THREE.PointsMaterial({
      color: 0xff4444, size: 0.06, transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }))
    group.add(emitPts)
    themeObjects.push(emitPts)

    // CO2 molecules trapping radiation
    const co2Count = 40
    const co2Pos = new Float32Array(co2Count * 3)
    for (let i = 0; i < co2Count; i++) {
      co2Pos[i * 3] = (Math.random() - 0.5) * 3
      co2Pos[i * 3 + 1] = 0.3 + Math.random() * 1.5
      co2Pos[i * 3 + 2] = (Math.random() - 0.5) * 3
    }
    const co2Geo = new THREE.BufferGeometry()
    co2Geo.setAttribute('position', new THREE.BufferAttribute(co2Pos, 3))
    const co2Pts = new THREE.Points(co2Geo, new THREE.PointsMaterial({
      color: 0x888888, size: 0.08, transparent: true, opacity: 0.7,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }))
    group.add(co2Pts)
    themeObjects.push(co2Pts)
    animData.co2Pts = co2Pts

    // Back radiation arrows
    for (let i = 0; i < 5; i++) {
      const x = (i - 2) * 0.6
      const from = new THREE.Vector3(x, 0.8, 0)
      const to = new THREE.Vector3(x, -EARTH_RADIUS + 0.1, 0)
      const curve = new THREE.LineCurve3(from, to)
      const count = 20
      const positions = new Float32Array(count * 3)
      for (let j = 0; j < count; j++) {
        const pt = curve.getPoint(j / count)
        positions[j * 3] = pt.x; positions[j * 3 + 1] = pt.y; positions[j * 3 + 2] = pt.z
      }
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const pts = new THREE.Points(geo, new THREE.PointsMaterial({
        size: 0.07, color: 0xff8800, transparent: true, opacity: 0.7,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }))
      group.add(pts)
      themeObjects.push(pts)
    }

    if (labelSystem) {
      labelSystem.addToGroup(group, '地面长波辐射 ↑', new THREE.Vector3(0, -EARTH_RADIUS + 0.4, 1.5),
        { color: '#ff4444', fontSize: '12px', fontWeight: '700' })
      labelSystem.addToGroup(group, 'CO₂ 吸收长波\n→ 大气逆辐射 ↓', new THREE.Vector3(0, 1.2, 1.5),
        { color: '#ff8800', fontSize: '12px', fontWeight: '700', whiteSpace: 'pre-line' })
    }
  }

  function switchTheme(idx) {
    clearTheme()
    switch (idx) {
      case 0: showVerticalLayers(); break
      case 1: showComposition(); break
      case 2: showRadiation(); break
      case 3: showCirculation(); break
      case 4: showLocalCirculation(); break
      case 5: showGreenhouse(); break
      default: showVerticalLayers()
    }
  }

  switchTheme(currentTheme)

  const api = {
    setMode(m) {
      clearTheme()
      switchTheme(currentTheme)
    },
    setParams(p) {
      if (p.theme !== undefined) {
        currentTheme = p.theme
        clearTheme()
        switchTheme(currentTheme)
      }
    },
    update(dt, elapsed) {
      earth.rotation.y += 0.15 * dt

      // Animate circulation markers
      themeObjects.forEach(obj => {
        if (!obj.userData?.circulation) return
        const data = obj.userData.circulation
        data.phase = (data.phase + dt * data.speed + 1) % 1
        const lat = data.latStart + (data.latEnd - data.latStart) * data.phase
        const lon = data.phase * Math.PI * 4 + elapsed * 0.18
        const latRad = (lat * Math.PI) / 180
        const r = EARTH_RADIUS + 0.8 * Math.sin(data.phase * Math.PI)
        obj.position.set(
          r * Math.cos(latRad) * Math.cos(lon),
          r * Math.sin(latRad),
          r * Math.cos(latRad) * Math.sin(lon),
        )
      })

      // Animate cloud particles in troposphere
      if (animData.cloudPts) {
        animData.cloudPts.rotation.y += dt * 0.1
      }

      // Pulse ozone ring
      if (animData.ozoneRing) {
        animData.ozoneRing.material.opacity = 0.4 + Math.sin(elapsed * 1.5) * 0.2
      }

      // Move UV particles
      if (animData.uvPts) {
        animData.uvPts.position.x = 6 - elapsed * 0.5 % 8
      }

      // Pulse CO2 particles
      if (animData.co2Pts) {
        animData.co2Pts.material.opacity = 0.5 + Math.sin(elapsed * 0.8) * 0.2
      }
    },
    dispose() {
      clearTheme()
    },
  }
  group.userData = { api }

  return group
}
