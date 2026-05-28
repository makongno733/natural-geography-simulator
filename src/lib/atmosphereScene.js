import * as THREE from 'three'
import { Atmosphere, Sky, AerialPerspective } from '@takram/three-atmosphere'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'

const LAYER_COLORS = {
  对流层: 0x4a9eff,
  平流层: 0xffaa44,
  中间层: 0x9966ff,
  热层: 0xff4466,
  散逸层: 0xffffff,
}

const LAYER_HEIGHTS = {
  对流层: { min: 0, max: 12, color: LAYER_COLORS.对流层 },
  平流层: { min: 12, max: 50, color: LAYER_COLORS.平流层 },
  中间层: { min: 50, max: 85, color: LAYER_COLORS.中间层 },
  热层: { min: 85, max: 500, color: LAYER_COLORS.热层 },
  散逸层: { min: 500, max: 1000, color: LAYER_COLORS.散逸层 },
}

export default class AtmosphereScene {
  constructor(container, mode = 'simple') {
    this.mode = mode
    this.theme = 0 // 0=垂直分层,1=大气组成,2=受热过程,3=三圈环流
    this.clock = new THREE.Clock()
    this.layers = []
    this.particleSystems = []
    this.radiationPaths = []
    this.circulationParticles = []

    this._initScene()
    this._initCamera(container)
    this._initRenderer(container)
    this._initLights()
    this._initEarth()
    this._initAtmoScattering()
    this._initControls()
  }

  _initRenderer(container) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2
    container.appendChild(this.renderer.domElement)

    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(new RenderPass(this.scene, this.camera))
  }

  _initScene() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x0a0e27)
  }

  _initCamera(container) {
    const aspect = container.clientWidth / container.clientHeight
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 10000)
    this.camera.position.set(0, 4, 10)
    this.camera.lookAt(0, 0, 0)
  }

  _initLights() {
    const ambient = new THREE.AmbientLight(0x444466, 1.0)
    this.scene.add(ambient)
    const sun = new THREE.DirectionalLight(0xffeedd, 2.0)
    sun.position.set(50, 30, 20)
    this.scene.add(sun)
    this.sunLight = sun
  }

  _initEarth() {
    const geo = new THREE.SphereGeometry(1.8, 64, 64)
    const texLoader = new THREE.TextureLoader()
    const mat = new THREE.MeshStandardMaterial({
      map: texLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'),
      roughness: 0.6,
      metalness: 0.1,
    })
    this.earth = new THREE.Mesh(geo, mat)
    this.earth.rotation.x = 0.3
    this.scene.add(this.earth)
  }

  _initAtmoScattering() {
    try {
      const atmo = new Atmosphere({ date: new Date() })
      const sky = new Sky({ atmosphere: atmo })
      this.scene.add(sky)
      this.atmo = atmo
    } catch (e) {
      console.warn('@takram/three-atmosphere not available, falling back', e)
    }
  }

  _initControls() {
    this.isDragging = false
    this._prevX = 0; this._prevY = 0
    this._rotX = 0.3; this._rotY = 0
    this._camDist = 10
    const el = this.renderer.domElement

    this._onMouseDown = (e) => { this.isDragging = true; this._prevX = e.clientX; this._prevY = e.clientY }
    this._onMouseMove = (e) => {
      if (!this.isDragging) return
      const dx = e.clientX - this._prevX; const dy = e.clientY - this._prevY
      this._rotY += dx * 0.005; this._rotX += dy * 0.005
      this._rotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this._rotX))
      this._prevX = e.clientX; this._prevY = e.clientY
    }
    this._onMouseUp = () => { this.isDragging = false }
    this._onWheel = (e) => {
      this._camDist = Math.max(3, Math.min(30, this._camDist + e.deltaY * 0.01))
    }

    el.addEventListener('mousedown', this._onMouseDown)
    window.addEventListener('mousemove', this._onMouseMove)
    window.addEventListener('mouseup', this._onMouseUp)
    el.addEventListener('wheel', this._onWheel)
  }

  _setCamPosition(x, y, z) {
    this._camDist = Math.sqrt(x * x + y * y + z * z)
    this._rotY = Math.atan2(x, z)
    this._rotX = Math.asin(y / this._camDist)
  }

  _updateOrbit() {
    const d = this._camDist
    this.camera.position.x = d * Math.sin(this._rotY) * Math.cos(this._rotX)
    this.camera.position.y = d * Math.sin(this._rotX)
    this.camera.position.z = d * Math.cos(this._rotY) * Math.cos(this._rotX)
    this.camera.lookAt(0, 0, 0)
  }

  setTheme(index) {
    this.theme = index
    this._clearTheme()
    switch(index) {
      case 0: this._showVerticalLayers(); break
      case 1: this._showComposition(); break
      case 2: this._showRadiation(); break
      case 3: this._showCirculation(); break
    }
  }

  setMode(mode) {
    this.mode = mode
    const cur = this.theme
    this._clearTheme()
    this.setTheme(cur)
  }

  _clearTheme() {
    this.layers.forEach(m => { this.scene.remove(m); m.geometry?.dispose(); m.material?.dispose() })
    this.layers = []
    this.particleSystems.forEach(p => { this.scene.remove(p); p.geometry?.dispose(); p.material?.dispose() })
    this.particleSystems = []
    this.radiationPaths.forEach(p => { this.scene.remove(p); p.geometry?.dispose(); p.material?.dispose() })
    this.radiationPaths = []
    this.circulationParticles.forEach(p => { this.scene.remove(p); p.geometry?.dispose(); p.material?.dispose() })
    this.circulationParticles = []
  }

  // Theme implementations (stubs for later tasks)
  _showVerticalLayers() {
    const earthRadius = 1.8
    const layers = ['对流层', '平流层', '中间层', '热层', '散逸层']

    layers.forEach((name) => {
      const h = LAYER_HEIGHTS[name]
      const outerR = earthRadius + (h.max / 1000) * 6
      const innerR = earthRadius + (h.min / 1000) * 6
      const r = (outerR + innerR) / 2

      const geo = new THREE.SphereGeometry(r, 48, 48)
      const mat = new THREE.ShaderMaterial({
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
        depthWrite: false,
        uniforms: {
          uColor: { value: new THREE.Color(h.color) },
        },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          varying vec3 vNormal;
          void main() {
            float rim = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
            float alpha = smoothstep(0.4, 1.0, rim) * 0.3;
            gl_FragColor = vec4(uColor, alpha);
          }
        `,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.userData = { type: 'atmoLayer', name }
      this.scene.add(mesh)
      this.layers.push(mesh)
    })
  }

  _showComposition() {
    this._setCamPosition(0, 0, 4.5)

    const particles = this.mode === 'simple'
      ? [
          { name: 'N₂', color: 0x4488ff, count: 4000, heightRange: [0, 12] },
          { name: 'O₂', color: 0x44cc44, count: 2000, heightRange: [0, 12] },
          { name: 'CO₂', color: 0x888888, count: 500, heightRange: [0, 20] },
          { name: 'H₂O', color: 0xffffff, count: 1000, heightRange: [0, 3] },
        ]
      : [
          { name: 'N₂', color: 0x4488ff, count: 6000, heightRange: [0, 85] },
          { name: 'O₂', color: 0x44cc44, count: 3000, heightRange: [0, 85] },
          { name: 'CO₂', color: 0x888888, count: 800, heightRange: [0, 20] },
          { name: 'H₂O', color: 0xffffff, count: 1500, heightRange: [0, 3] },
          { name: 'O₃', color: 0xaa66ff, count: 600, heightRange: [15, 35] },
          { name: '尘埃', color: 0x886644, count: 400, heightRange: [0, 2] },
          { name: 'Ar', color: 0xffdd88, count: 400, heightRange: [0, 85] },
        ]

    const earthRadius = 1.8
    const scale = 6 / 1000

    particles.forEach((p) => {
      const positions = new Float32Array(p.count * 3)
      const colors = new Float32Array(p.count * 3)
      const col = new THREE.Color(p.color)

      for (let i = 0; i < p.count; i++) {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        const height = (p.heightRange[0] + Math.random() * (p.heightRange[1] - p.heightRange[0])) * scale
        const r = earthRadius + height

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
      points.userData = { type: 'composition', name: p.name }
      this.scene.add(points)
      this.particleSystems.push(points)
    })
  }

  _showRadiation() {
    this._setCamPosition(5, 2, 8)

    const sunPos = new THREE.Vector3(8, 5, 6)

    const paths = this.mode === 'simple'
      ? [
          { label: '太阳短波辐射', pts: [sunPos, new THREE.Vector3(0, 0.5, 0)], color: 0xffee44, count: 40 },
          { label: '地面长波辐射', pts: [new THREE.Vector3(0, 0.5, 0), new THREE.Vector3(0, 2, 0)], color: 0xff4444, count: 30 },
          { label: '大气逆辐射', pts: [new THREE.Vector3(0, 2, 0), new THREE.Vector3(0, 0.3, 0)], color: 0xff8800, count: 30 },
        ]
      : [
          { label: '太阳短波辐射', pts: [sunPos, new THREE.Vector3(0, 0.5, 0)], color: 0xffee44, count: 60 },
          { label: '大气散射', pts: [sunPos, new THREE.Vector3(0, 3, 0)], color: 0xaaccff, count: 20 },
          { label: '地面长波辐射', pts: [new THREE.Vector3(0, 0.5, 0), new THREE.Vector3(0, 2, 0)], color: 0xff4444, count: 40 },
          { label: '大气逆辐射', pts: [new THREE.Vector3(0, 2, 0), new THREE.Vector3(0, 0.3, 0)], color: 0xff8800, count: 40 },
          { label: '云层反射', pts: [new THREE.Vector3(2, 1, 0), sunPos], color: 0xcccccc, count: 15 },
        ]

    paths.forEach((path) => {
      const curve = new THREE.CatmullRomCurve3(path.pts)
      const positions = new Float32Array(path.count * 3)
      for (let i = 0; i < path.count; i++) {
        const t = i / path.count
        const pt = curve.getPoint(t)
        positions[i * 3] = pt.x
        positions[i * 3 + 1] = pt.y
        positions[i * 3 + 2] = pt.z
      }

      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

      const mat = new THREE.PointsMaterial({
        size: 0.08,
        color: path.color,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })

      const points = new THREE.Points(geo, mat)
      points.userData = { type: 'radiation', label: path.label }
      this.scene.add(points)
      this.radiationPaths.push(points)
    })
  }

  _showCirculation() {
    this._setCamPosition(0, 2, 12)

    const cells = [
      { name: 'Hadley', color: 0xff6644, latitudes: [[-30, 0], [0, 30]], count: 800 },
      { name: 'Ferrel', color: 0x44dd88, latitudes: [[-60, -30], [30, 60]], count: 600 },
      { name: 'Polar', color: 0x4488ff, latitudes: [[-90, -60], [60, 90]], count: 400 },
    ]

    const earthRadius = 1.8

    cells.forEach((cell) => {
      cell.latitudes.forEach((latRange) => {
        const positions = new Float32Array(cell.count * 3)
        for (let i = 0; i < cell.count; i++) {
          const t = i / cell.count
          const lat = latRange[0] + (latRange[1] - latRange[0]) * t
          const lon = t * Math.PI * 4
          const heightOffset = Math.sin(t * Math.PI) * 0.8
          const latRad = (lat * Math.PI) / 180
          const r = earthRadius + 0.1 + heightOffset

          positions[i * 3] = r * Math.cos(latRad) * Math.cos(lon)
          positions[i * 3 + 1] = r * Math.sin(latRad)
          positions[i * 3 + 2] = r * Math.cos(latRad) * Math.sin(lon)
        }

        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

        const mat = new THREE.PointsMaterial({
          size: 0.05,
          color: cell.color,
          transparent: true,
          opacity: 0.7,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })

        const points = new THREE.Points(geo, mat)
        points.userData = { type: 'circulation', name: cell.name }
        this.scene.add(points)
        this.circulationParticles.push(points)
      })
    })
  }

  resize() {
    const container = this.renderer.domElement.parentElement
    const w = container.clientWidth; const h = container.clientHeight
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
    this.composer.setSize(w, h)
  }

  render(time) {
    this._updateOrbit()
    if (this.earth) this.earth.rotation.y += 0.001
    this.composer.render()
  }

  dispose() {
    const el = this.renderer.domElement
    el.removeEventListener('mousedown', this._onMouseDown)
    window.removeEventListener('mousemove', this._onMouseMove)
    window.removeEventListener('mouseup', this._onMouseUp)
    el.removeEventListener('wheel', this._onWheel)
    this.renderer.dispose()
    el.remove()
  }
}
