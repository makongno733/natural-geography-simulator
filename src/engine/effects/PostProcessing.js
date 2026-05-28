import * as THREE from 'three'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

export class PostProcessing {
  constructor(renderManager) {
    this.renderManager = renderManager
    this._bloomPass = null
  }

  enableBloom({ threshold = 0.1, strength = 0.8, radius = 0.5 } = {}) {
    if (this._bloomPass) return
    const w = this.renderManager.container.clientWidth
    const h = this.renderManager.container.clientHeight
    this._bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), strength, radius, threshold)
    this.renderManager.composer.addPass(this._bloomPass)
  }

  disableBloom() {
    if (this._bloomPass) {
      this._bloomPass.enabled = false
    }
  }

  setBloomParams({ threshold, strength, radius }) {
    if (!this._bloomPass) return
    if (threshold !== undefined) this._bloomPass.threshold = threshold
    if (strength !== undefined) this._bloomPass.strength = strength
    if (radius !== undefined) this._bloomPass.radius = radius
  }

  resize(w, h) {
    if (this._bloomPass) {
      this._bloomPass.resolution.set(w, h)
    }
  }

  dispose() {
    this._bloomPass = null
  }
}
