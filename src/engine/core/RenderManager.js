import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'

export class RenderManager {
  constructor(container, options = {}) {
    this.container = container
    this._disposed = false
    this.renderer = new THREE.WebGLRenderer({
      antialias: options.antialias ?? (options.quality?.tier !== 'low'),
      alpha: options.alpha ?? true,
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, options.quality?.dpr || 2))
    this.renderer.setClearColor(options.bg || 0x0a0e27, 1)
    this.renderer.shadowMap.enabled = options.shadows ?? options.quality?.shadows ?? true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.localClippingEnabled = true
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = options.toneExposure ?? 1.2

    this.composer = null
    this._scene = null
    this._camera = null
    this.renderPass = null
    this._passes = []
    this._bloomPass = null
    this._bloomLoading = false
    this._bloomRequested = false

    container.appendChild(this.renderer.domElement)
    this.resize()
  }

  initComposer(scene, camera) {
    this._scene = scene
    this._camera = camera
  }

  ensureComposer() {
    if (this.composer || !this._scene || !this._camera) return
    this.composer = new EffectComposer(this.renderer)
    this.renderPass = new RenderPass(this._scene, this._camera)
    this.composer.addPass(this.renderPass)
    this.composer.setSize(this.container.clientWidth, this.container.clientHeight)
  }

  addPass(pass) {
    this.ensureComposer()
    this.composer.addPass(pass)
    this._passes.push(pass)
  }

  setBloom(enabled) {
    this._bloomRequested = enabled
    if (!this._bloomPass && enabled && !this._bloomLoading) {
      this._bloomLoading = true
      import('three/examples/jsm/postprocessing/UnrealBloomPass.js').then(mod => {
        if (this._disposed || !this._scene) return
        const w = this.container.clientWidth
        const h = this.container.clientHeight
        this._bloomPass = new mod.UnrealBloomPass(
          new THREE.Vector2(w, h), 1.5, 0.4, 0.85
        )
        this._bloomPass.threshold = 0.1
        this._bloomPass.strength = 0.8
        this._bloomPass.radius = 0.5
        this._bloomPass.enabled = this._bloomRequested
        this.addPass(this._bloomPass)
      }).finally(() => {
        this._bloomLoading = false
      })
    }
    if (this._bloomPass) {
      this._bloomPass.enabled = enabled
    }
  }

  render() {
    if (this.composer && this._passes.some(pass => pass.enabled)) this.composer.render()
    else if (this._scene && this._camera) this.renderer.render(this._scene, this._camera)
  }

  resize() {
    const w = this.container.clientWidth
    const h = this.container.clientHeight
    this.renderer.setSize(w, h)
    this.composer?.setSize(w, h)
    if (this._bloomPass) {
      this._bloomPass.resolution.set(w, h)
    }
  }

  get domElement() {
    return this.renderer.domElement
  }

  dispose() {
    if (this._disposed) return
    this._disposed = true
    this._passes.forEach(p => {
      if (p.dispose) p.dispose()
    })
    this.renderPass = null
    this._passes = []
    this._bloomPass = null
    this._bloomRequested = false
    this.composer?.dispose()
    this.composer = null
    this._scene = null
    this._camera = null
    this.renderer.dispose()
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
    }
  }
}
