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
  { name: '对流层', height: 6, profExtra: '天气现象 · 每百米降0.65℃' },
  { name: '平流层', height: 30, profExtra: '臭氧层 20-25km · 适合飞行' },
  { name: '中间层', height: 65, profExtra: '流星在此燃烧' },
  { name: '热层', height: 200, profExtra: '电离层 85-500km · 极光' },
  { name: '散逸层', height: 600, profExtra: '卡门线 100km · 逃逸层' },
]

const COMPOSITION_PARTICLES = {
  simple: [
    { name: 'N₂', color: 0x4488ff, count: 4000, heightRange: [0, 12] },
    { name: 'O₂', color: 0x44cc44, count: 2000, heightRange: [0, 12] },
    { name: 'CO₂', color: 0x888888, count: 500, heightRange: [0, 20] },
    { name: 'H₂O', color: 0xffffff, count: 1000, heightRange: [0, 3] },
  ],
  professional: [
    { name: 'N₂', color: 0x4488ff, count: 6000, heightRange: [0, 85] },
    { name: 'O₂', color: 0x44cc44, count: 3000, heightRange: [0, 85] },
    { name: 'CO₂', color: 0x888888, count: 800, heightRange: [0, 20] },
    { name: 'H₂O', color: 0xffffff, count: 1500, heightRange: [0, 3] },
    { name: 'O₃', color: 0xaa66ff, count: 600, heightRange: [15, 35] },
    { name: '尘埃', color: 0x886644, count: 400, heightRange: [0, 2] },
    { name: 'Ar', color: 0xffdd88, count: 400, heightRange: [0, 85] },
  ],
}

export function AtmosphereModule(scene, params, services) {
  const { labelSystem } = services
  const group = new THREE.Group()
  const mode = params.mode || 'simple'
  const theme = params.theme || 0
  const EARTH_RADIUS = 1.8
  const SCALE = 6 / 1000

  group.add(GeometryFactory.starField(2000, 1000))

  const earthGeo = GeometryFactory.sphere(EARTH_RADIUS, 64)
  const earthMat = new THREE.MeshStandardMaterial({
    color: 0x4a90d9,
    roughness: 0.6,
    metalness: 0.1,
  })
  const earth = new THREE.Mesh(earthGeo, earthMat)
  earth.rotation.x = 0.3
  group.add(earth)

  try {
    const skyMaterial = new SkyMaterial()
    skyMaterial.setSunDirection(new THREE.Vector3(1, 0.3, 0.5).normalize())
    const skyGeo = GeometryFactory.sphere(800, 32)
    const skyMesh = new THREE.Mesh(skyGeo, skyMaterial)
    skyMesh.scale.set(-1, 1, 1)
    group.add(skyMesh)
  } catch (e) {
    console.warn('SkyMaterial not available', e)
  }

  let themeObjects = []

  function clearTheme() {
    themeObjects.forEach(o => {
      group.remove(o)
      if (o.geometry) o.geometry.dispose()
      if (o.material) o.material.dispose()
    })
    themeObjects = []
  }

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
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: `
          uniform vec3 uColor;
          varying vec3 vNormal;
          void main() {
            float rim = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
            float alpha = smoothstep(0.4, 1.0, rim) * 0.3;
            gl_FragColor = vec4(uColor, alpha);
          }`,
      })
      const mesh = new THREE.Mesh(geo, mat)
      group.add(mesh)
      themeObjects.push(mesh)
    })

    if (labelSystem) {
      LAYER_LABELS.forEach(l => {
        const r = EARTH_RADIUS + l.height * SCALE
        const text = mode === 'simple' ? l.name : `${l.name}\n${l.profExtra}`
        labelSystem.addToGroup(group, text, new THREE.Vector3(r, 0, 0), {
          fontSize: mode === 'simple' ? '13px' : '11px',
          fontWeight: mode === 'simple' ? '600' : '400',
          whiteSpace: 'pre-line',
          textAlign: 'center',
          lineHeight: '1.4',
        })
      })
    }
  }

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
        size: 0.04,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })

      const points = new THREE.Points(geo, mat)
      group.add(points)
      themeObjects.push(points)
    })
  }

  function showRadiation() {
    const sunPos = new THREE.Vector3(8, 5, 6)
    const paths = mode === 'simple'
      ? [
        { pts: [sunPos, new THREE.Vector3(0, 0.5, 0)], color: 0xffee44, count: 40 },
        { pts: [new THREE.Vector3(0, 0.5, 0), new THREE.Vector3(0, 2, 0)], color: 0xff4444, count: 30 },
        { pts: [new THREE.Vector3(0, 2, 0), new THREE.Vector3(0, 0.3, 0)], color: 0xff8800, count: 30 },
      ]
      : [
        { pts: [sunPos, new THREE.Vector3(0, 0.5, 0)], color: 0xffee44, count: 60 },
        { pts: [sunPos, new THREE.Vector3(0, 3, 0)], color: 0xaaccff, count: 20 },
        { pts: [new THREE.Vector3(0, 0.5, 0), new THREE.Vector3(0, 2, 0)], color: 0xff4444, count: 40 },
        { pts: [new THREE.Vector3(0, 2, 0), new THREE.Vector3(0, 0.3, 0)], color: 0xff8800, count: 40 },
        { pts: [new THREE.Vector3(2, 1, 0), sunPos], color: 0xcccccc, count: 15 },
      ]

    paths.forEach(path => {
      const curve = new THREE.CatmullRomCurve3(path.pts)
      const positions = new Float32Array(path.count * 3)
      for (let i = 0; i < path.count; i++) {
        const pt = curve.getPoint(i / path.count)
        positions[i * 3] = pt.x
        positions[i * 3 + 1] = pt.y
        positions[i * 3 + 2] = pt.z
      }
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const mat = new THREE.PointsMaterial({
        size: 0.08, color: path.color, transparent: true, opacity: 0.9,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
      const points = new THREE.Points(geo, mat)
      group.add(points)
      themeObjects.push(points)
    })
  }

  function showCirculation() {
    const cells = [
      { latRanges: [[-30, 0], [0, 30]], color: 0xff6644, tubeRadius: 0.02 },
      { latRanges: [[-60, -30], [30, 60]], color: 0x44dd88, tubeRadius: 0.02 },
      { latRanges: [[-90, -60], [60, 90]], color: 0x4488ff, tubeRadius: 0.02 },
    ]

    cells.forEach(cell => {
      cell.latRanges.forEach(range => {
        const tubeGeo = GeometryFactory.spiralTube(range[0], range[1], EARTH_RADIUS, 0.8, cell.color, cell.tubeRadius, 200)
        const tubeMat = new THREE.MeshStandardMaterial({
          color: cell.color,
          roughness: 0.3,
          metalness: 0.2,
          transparent: true,
          opacity: 0.6,
        })
        const tube = new THREE.Mesh(tubeGeo, tubeMat)
        group.add(tube)
        themeObjects.push(tube)
      })
    })
  }

  function switchTheme(idx) {
    clearTheme()
    switch (idx) {
      case 0: showVerticalLayers(); break
      case 1: showComposition(); break
      case 2: showRadiation(); break
      case 3: showCirculation(); break
    }
  }

  switchTheme(theme)

  const api = {
    setMode(m) {
      group.mode = m
      clearTheme()
      switchTheme(theme)
    },
    setParams(p) {
      if (p.theme !== undefined) {
        clearTheme()
        switchTheme(p.theme)
      }
    },
    update(dt, elapsed) {
      earth.rotation.y += 0.15 * dt
    },
    dispose() {
      clearTheme()
    },
  }
  group.userData = { api }

  return group
}
