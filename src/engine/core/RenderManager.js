import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'

export class RenderManager {
  constructor(container, options = {}) {
    this.container = container
    this.renderer = new THREE.WebGLRenderer({
      antialias: options.antialias ?? true,
      alpha: options.alpha ?? true,
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setClearColor(options.bg || 0x0a0e27, 1)
    this.renderer.shadowMap.enabled = options.shadows ?? true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = options.toneExposure ?? 1.2

    this.composer = new EffectComposer(this.renderer)
    this.renderPass = null
    this._passes = []
    this._bloomPass = null

    container.appendChild(this.renderer.domElement)
    this.resize()
  }

  initComposer(scene, camera) {
    this.renderPass = new RenderPass(scene, camera)
    this.composer.addPass(this.renderPass)
  }

  addPass(pass) {
    this.composer.addPass(pass)
    this._passes.push(pass)
  }

  setBloom(enabled) {
    if (!this._bloomPass && enabled) {
      import('three/examples/jsm/postprocessing/UnrealBloomPass.js').then(mod => {
        const w = this.container.clientWidth
        const h = this.container.clientHeight
        this._bloomPass = new mod.UnrealBloomPass(
          new THREE.Vector2(w, h), 1.5, 0.4, 0.85
        )
        this._bloomPass.threshold = 0.1
        this._bloomPass.strength = 0.8
        this._bloomPass.radius = 0.5
        this.composer.addPass(this._bloomPass)
      })
    }
    if (this._bloomPass) {
      this._bloomPass.enabled = enabled
    }
  }

  render() {
    this.composer.render()
  }

  resize() {
    const w = this.container.clientWidth
    const h = this.container.clientHeight
    this.renderer.setSize(w, h)
    this.composer.setSize(w, h)
    if (this._bloomPass) {
      this._bloomPass.resolution.set(w, h)
    }
  }

  get domElement() {
    return this.renderer.domElement
  }

  dispose() {
    this._passes.forEach(p => {
      if (p.dispose) p.dispose()
    })
    this.renderPass = null
    this._passes = []
    this._bloomPass = null
    this.renderer.dispose()
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
    }
  }
}
