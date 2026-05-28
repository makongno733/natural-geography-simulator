import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { modifyHeight, getModuleColor, getModuleFeatureName, getModuleColorBias } from '../../lib/terrainModifiers.js'
import { createTerrainMaterial } from '../../lib/shaders/terrainMaterial.js'

const SEGMENTS = { simple: 128, professional: 200 }
const SIZE = 4

export class SceneEngine {
  constructor(container) {
    this.container = container
    this.modules = ['karst', 'fluvial', 'aeolian', 'coastal']
    this.activeModule = 'karst'
    this.mode = 'simple'
    this.timeline = 0
    this.climateFactor = 0.5
    this.annotations = []
    this.autoRotate = true

    this._initRenderer()
    this._initLabelRenderer()
    this._initScene()
    this._initLights()
    this._initControls()
    this._initTerrain()
    this._animate()
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    this.renderer.setClearColor(0xf5efe8, 1)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2
    this.container.appendChild(this.renderer.domElement)
  }

  _initLabelRenderer() {
    this.labelRenderer = new CSS2DRenderer()
    this.labelRenderer.setSize(this.container.clientWidth, this.container.clientHeight)
    this.labelRenderer.domElement.style.position = 'absolute'
    this.labelRenderer.domElement.style.top = '0'
    this.labelRenderer.domElement.style.left = '0'
    this.labelRenderer.domElement.style.pointerEvents = 'none'
    this.container.appendChild(this.labelRenderer.domElement)
  }

  _initScene() {
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(40, this.container.clientWidth / this.container.clientHeight, 0.1, 50)
    this.camera.position.set(5, 4, 6)
    this.camera.lookAt(0, 0, 0)
  }

  _initLights() {
    const ambient = new THREE.AmbientLight(0x8899aa, 0.4)
    this.scene.add(ambient)

    const sun = new THREE.DirectionalLight(0xffeedd, 1.8)
    sun.position.set(8, 15, 5)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.near = 0.1
    sun.shadow.camera.far = 30
    sun.shadow.camera.left = -8
    sun.shadow.camera.right = 8
    sun.shadow.camera.top = 8
    sun.shadow.camera.bottom = -8
    this.scene.add(sun)
    this.sun = sun

    const fill = new THREE.DirectionalLight(0x8888ff, 0.3)
    fill.position.set(-5, 3, -5)
    this.scene.add(fill)

    // Fog for depth
    this.scene.fog = new THREE.Fog(0xf5efe8, 8, 14)
  }

  _initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.08
    this.controls.minDistance = 1.5
    this.controls.maxDistance = 14
    this.controls.maxPolarAngle = Math.PI / 2.1
    this.controls.target.set(0, 0, 0)
    this.controls.autoRotate = true
    this.controls.autoRotateSpeed = 0.8
  }

  _initTerrain() {
    this._buildTerrain()
  }

  _buildTerrain() {
    if (this.terrain) {
      this.scene.remove(this.terrain)
      this.terrain.geometry.dispose()
      this.terrain.material.dispose()
    }
    this._clearAnnotations()

    const seg = SEGMENTS[this.mode] || SEGMENTS.simple
    const geo = new THREE.PlaneGeometry(SIZE, SIZE, seg, seg)
    geo.rotateX(-Math.PI / 2)

    const pos = geo.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const modId = this._toModuleId(this.activeModule)
    let minH = Infinity, maxH = -Infinity

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      const xn = (x + SIZE / 2) / SIZE
      const zn = (z + SIZE / 2) / SIZE
      const baseH = this._baseHeight(xn, zn)
      const h = modifyHeight(modId, xn, zn, baseH, this.timeline, this.climateFactor)
      pos.setY(i, h)
      if (h < minH) minH = h
      if (h > maxH) maxH = h
      const c = getModuleColor(modId, h, 0)
      if (c) {
        colors[i * 3] = c[0] / 255
        colors[i * 3 + 1] = c[1] / 255
        colors[i * 3 + 2] = c[2] / 255
      }
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const bias = getModuleColorBias(modId)
    const mat = createTerrainMaterial({
      minHeight: minH,
      maxHeight: maxH,
      sunDirection: this.sun?.position.clone().normalize() || new THREE.Vector3(0.5, 0.8, 0.3),
      biomeBias: new THREE.Vector3(bias[0], bias[1], bias[2])
    })

    this.terrain = new THREE.Mesh(geo, mat)
    this.terrain.receiveShadow = true
    this.terrain.castShadow = true
    this.scene.add(this.terrain)

    this._addWaterPlane()
    this._addAnnotations()
  }

  _baseHeight(xn, zn) {
    // Gentle base terrain with Perlin-like undulation
    const h1 = Math.sin(xn * 3.7 + zn * 2.1) * 0.15
    const h2 = Math.sin(xn * 5.2 - zn * 4.3 + 1.8) * 0.08
    const h3 = Math.sin((xn + 0.3) * 8 + (zn - 0.2) * 6) * 0.04
    return 0.15 + h1 + h2 + h3
  }

  _toModuleId(name) {
    const map = {
      karst: 'karst',
      fluvial: 'fluvial',
      aeolian: 'aeolian',
      coastal: 'coastal',
      structural: 'structural',
      glacial: 'glacial',
      volcanic: 'volcanic'
    }
    return map[name] || 'fluvial'
  }

  _addWaterPlane() {
    if (this.water) {
      this.scene.remove(this.water)
      this.water.geometry.dispose()
      this.water.material.dispose()
    }
    if (this.activeModule === 'aeolian') return // no water in desert

    const waterGeo = new THREE.PlaneGeometry(SIZE * 1.2, SIZE * 1.2)
    waterGeo.rotateX(-Math.PI / 2)
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x3a7ca5,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.3,
      side: THREE.DoubleSide
    })
    this.water = new THREE.Mesh(waterGeo, waterMat)
    this.water.position.y = -0.08
    this.water.receiveShadow = true
    this.scene.add(this.water)
  }

  _addAnnotations() {
    const modId = this._toModuleId(this.activeModule)
    const featureName = getModuleFeatureName(modId, this.timeline)
    if (!featureName) return

    // Place label at a prominent terrain point
    const pos = this.terrain.geometry.attributes.position
    let maxH = -Infinity, maxIdx = 0
    for (let i = 0; i < pos.count; i += 10) {
      const h = pos.getY(i)
      if (h > maxH) { maxH = h; maxIdx = i }
    }
    const lx = pos.getX(maxIdx)
    const lz = pos.getZ(maxIdx)
    const ly = pos.getY(maxIdx) + 0.3

    const div = document.createElement('div')
    div.textContent = featureName
    div.style.color = '#fff'
    div.style.background = 'rgba(139, 28, 28, 0.85)'
    div.style.padding = '4px 10px'
    div.style.borderRadius = '4px'
    div.style.fontSize = '13px'
    div.style.fontWeight = '600'
    div.style.pointerEvents = 'none'
    div.style.whiteSpace = 'nowrap'

    const label = new CSS2DObject(div)
    label.position.set(lx, ly, lz)
    this.scene.add(label)
    this.annotations.push(label)

    // Add secondary labels for professional mode
    if (this.mode === 'professional') {
      this._addSecondaryLabels(modId)
    }
  }

  _addSecondaryLabels(modId) {
    const labels = this._getSecondaryLabels(modId)
    for (const l of labels) {
      const div = document.createElement('div')
      div.textContent = l.text
      div.style.color = '#e8d5c4'
      div.style.background = 'rgba(60, 40, 30, 0.78)'
      div.style.padding = '2px 8px'
      div.style.borderRadius = '3px'
      div.style.fontSize = '11px'
      div.style.border = '1px solid rgba(200,160,120,0.4)'

      const label = new CSS2DObject(div)
      label.position.set(l.x, l.y, l.z)
      this.scene.add(label)
      this.annotations.push(label)
    }
  }

  _getSecondaryLabels(modId) {
    // Approximate label positions for key landform features
    const sets = {
      karst: [
        { text: '峰林', x: -0.6, y: 0.5, z: -0.5 },
        { text: '溶斗', x: 0.3, y: -0.05, z: 0.3 },
        { text: '溶洞', x: 0.8, y: 0.1, z: -0.3 },
      ],
      fluvial: [
        { text: 'V形谷', x: -0.8, y: 0.1, z: 0 },
        { text: '冲积扇', x: 0.6, y: 0.05, z: -0.5 },
        { text: '河曲', x: 0, y: 0.05, z: 0.7 },
      ],
      aeolian: [
        { text: '沙丘', x: -0.4, y: 0.15, z: -0.2 },
        { text: '雅丹', x: 0.5, y: 0.1, z: 0.4 },
        { text: '风蚀柱', x: -0.6, y: 0.2, z: 0.5 },
      ],
      coastal: [
        { text: '海蚀崖', x: -0.8, y: 0.15, z: 0 },
        { text: '海滩', x: 0.2, y: -0.02, z: 0.6 },
        { text: '三角洲', x: 0.7, y: 0.02, z: -0.3 },
      ]
    }
    return sets[modId] || []
  }

  _clearAnnotations() {
    for (const a of this.annotations) {
      this.scene.remove(a)
    }
    this.annotations = []
  }

  setModule(name) {
    if (name === this.activeModule) return
    this.activeModule = name
    this._buildTerrain()
    this.setAutoRotate(this.autoRotate)
  }

  setMode(mode) {
    if (mode === this.mode) return
    this.mode = mode
    this._buildTerrain()
    this.setAutoRotate(this.autoRotate)
  }

  setTimeline(t) {
    this.timeline = t
    this._buildTerrain()
  }

  setClimateFactor(f) {
    this.climateFactor = f
    this._buildTerrain()
  }

  setAutoRotate(on) {
    this.autoRotate = on
    this.controls.autoRotate = on
  }

  resize() {
    const w = this.container.clientWidth
    const h = this.container.clientHeight
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
    this.labelRenderer.setSize(w, h)
  }

  dispose() {
    this.renderer.dispose()
    this.labelRenderer.domElement.remove()
    this.controls.dispose()
  }

  _animate() {
    this._raf = requestAnimationFrame(() => this._animate())
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
    this.labelRenderer.render(this.scene, this.camera)
  }
}
