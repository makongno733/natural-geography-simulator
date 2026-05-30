import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export class ExperimentEngine {
  constructor() {
    this.scene = null
    this.camera = null
    this.renderer = null
    this.controls = null
    this.timer = null
    this.animationId = null
    this._canvas = null
    this._sprites = []
    this._guidedMode = false
    this._guideTexts = []
    this._guideIndex = 0
    this._guideTimer = 0
    this._onGuideChange = null
  }

  init(canvas) {
    this._canvas = canvas
    const { width, height } = canvas.getBoundingClientRect()

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0xfffdf2)
    this.scene.fog = new THREE.Fog(0xfffdf2, 20, 80)

    this.camera = new THREE.PerspectiveCamera(50, width / (height || 1), 0.1, 200)
    this.camera.position.set(8, 6, 12)
    this.camera.lookAt(0, 0, 0)

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFShadowMap

    this.controls = new OrbitControls(this.camera, canvas)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.08

    this._addLights()
    this.timer = new THREE.Timer()
    this.setupScene()
    this._animate()
  }

  _addLights() {
    const ambient = new THREE.AmbientLight(0xfff8e8, 1.8)
    this.scene.add(ambient)
    const sun = new THREE.DirectionalLight(0xfff8e8, 4.5)
    sun.position.set(15, 25, 10)
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    sun.shadow.camera.near = 0.5
    sun.shadow.camera.far = 100
    sun.shadow.camera.left = -20
    sun.shadow.camera.right = 20
    sun.shadow.camera.top = 20
    sun.shadow.camera.bottom = -20
    this.scene.add(sun)
  }

  _makeLabel(text, position, color = '#333333', fontSize = 28, scale = 2.5) {
    const canvas = document.createElement('canvas')
    canvas.width = 512; canvas.height = 128
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = color
    ctx.font = `bold ${fontSize}px "Noto Serif SC", "Kaiti SC", serif`
    ctx.textAlign = 'center'
    ctx.fillText(text, 256, 64)
    const tex = new THREE.CanvasTexture(canvas)
    tex.minFilter = THREE.LinearFilter
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })
    const sprite = new THREE.Sprite(mat)
    sprite.position.copy(position)
    sprite.scale.set(scale, scale * 0.25, 1)
    this.scene.add(sprite)
    this._sprites.push(sprite)
    return sprite
  }

  _animate() {
    const dt = Math.min(this.timer.getDelta(), 0.1)
    const elapsed = this.timer.elapsed
    this.update(dt, elapsed)
    if (this._guidedMode) {
      this._guideTimer += dt
      if (this._guideTimer > 6) {
        this._guideTimer = 0
        this._guideIndex = (this._guideIndex + 1) % this._guideTexts.length
        if (this._onGuideChange) {
          this._onGuideChange(this._guideTexts[this._guideIndex])
        }
      }
    }
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
    this.animationId = requestAnimationFrame(() => this._animate())
  }

  resize() {
    if (!this._canvas || !this.renderer) return
    const { width, height } = this._canvas.getBoundingClientRect()
    if (width === 0 || height === 0) return
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  dispose() {
    cancelAnimationFrame(this.animationId)
    if (this.controls) this.controls.dispose()
    if (this.renderer) this.renderer.dispose()
    for (const sprite of this._sprites) {
      if (sprite.material) {
        if (sprite.material.map) sprite.material.map.dispose()
        sprite.material.dispose()
      }
    }
    this._sprites = []
    if (this.scene) {
      this.scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => {
              if (m.map) m.map.dispose()
              m.dispose()
            })
          } else {
            if (obj.material.map) obj.material.map.dispose()
            obj.material.dispose()
          }
        }
      })
    }
  }

  startGuidedMode(guideTexts) {
    this._guidedMode = true
    this._guideTexts = guideTexts || ['观察场景中的关键元素', '调整参数观察变化', '注意不同条件的影响']
    this._guideIndex = 0
    this._guideTimer = 0
    this.controls.autoRotate = true
    this.controls.autoRotateSpeed = 0.4
    if (this._onGuideChange) this._onGuideChange(this._guideTexts[0])
  }

  stopGuidedMode() {
    this._guidedMode = false
    this.controls.autoRotate = false
  }

  getGuideText() {
    return this._guideTexts[this._guideIndex] || ''
  }

  // -- subclass overrides --
  setupScene() {}
  update(dt, elapsed) {}
  setParams(params) {}
}
