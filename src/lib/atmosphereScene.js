import * as THREE from 'three'
import { SkyMaterial, SunDirectionalLight } from '@takram/three-atmosphere'
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
    this._initStars()
  }

  _initStars() {
    const starsGeo = new THREE.BufferGeometry()
    const starCount = 2000
    const pos = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 400
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, transparent: true, opacity: 0.8 })
    this.stars = new THREE.Points(starsGeo, starsMat)
    this.scene.add(this.stars)
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
      this.skyMaterial = new SkyMaterial()
      this.skyMaterial.setSunDirection(new THREE.Vector3(1, 0.3, 0.5).normalize())
      const skyGeo = new THREE.SphereGeometry(800, 32, 15)
      const skyMesh = new THREE.Mesh(skyGeo, this.skyMaterial)
      skyMesh.scale.set(-1, 1, 1) // Render from inside
      this.scene.add(skyMesh)
      this.skyMesh = skyMesh
    } catch (e) {
      console.warn('@takram/three-atmosphere SkyMaterial not available, using fallback', e)
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

  _showComposition() { /* Task 5 */ }
  _showRadiation() { /* Task 6 */ }
  _showCirculation() { /* Task 6 */ }

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
    if (this.skyMesh) { this.scene.remove(this.skyMesh); this.skyMesh.geometry.dispose(); this.skyMesh.material.dispose() }
    if (this.stars) { this.scene.remove(this.stars); this.stars.geometry.dispose(); this.stars.material.dispose() }
    this._clearTheme()
    this.renderer.dispose()
    el.remove()
  }
}
