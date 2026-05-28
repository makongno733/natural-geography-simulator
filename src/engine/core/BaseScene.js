import * as THREE from 'three'
import { RenderManager } from './RenderManager.js'
import { CameraRig } from './CameraRig.js'
import { LightRig } from './LightRig.js'
import { LabelSystem } from './LabelSystem.js'

export class BaseScene {
  constructor(container, options = {}) {
    this.container = container
    this._mode = options.mode || 'simple'
    this._params = options.params || {}
    this._running = false
    this._moduleGroup = null
    this._moduleApi = null
    this._animFrameId = null

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(options.bg || 0x0a0e27)
    if (options.fog) {
      this.scene.fog = options.fog
    }

    this.renderManager = new RenderManager(container, options)
    this.cameraRig = new CameraRig(container, this.renderManager.domElement, options)
    this.renderManager.initComposer(this.scene, this.cameraRig.camera)

    this.lightRig = new LightRig(this.scene, options.lightPreset || 'studio')

    if (options.labels !== false) {
      this.labelSystem = new LabelSystem(container)
    } else {
      this.labelSystem = null
    }

    this.clock = new THREE.Clock()

    this._animate()
  }

  loadModule(moduleFactory, params = {}) {
    if (this._moduleGroup) {
      this._disposeModule()
    }

    this._params = { ...params, mode: this._mode }

    const result = moduleFactory(this.scene, this._params, {
      labelSystem: this.labelSystem,
      lightRig: this.lightRig,
      cameraRig: this.cameraRig,
      renderManager: this.renderManager,
      clock: this.clock,
    })

    if (result instanceof THREE.Group) {
      this._moduleGroup = result
      this.scene.add(result)
      this._moduleApi = result.userData?.api || null
    } else if (result && typeof result === 'object') {
      this._moduleGroup = result.group || null
      this._moduleApi = result
    }
  }

  setMode(mode) {
    this._mode = mode
    this._params.mode = mode
    if (this._moduleApi?.setMode) {
      this._moduleApi.setMode(mode)
    }
  }

  setParams(params) {
    Object.assign(this._params, params)
    if (this._moduleApi?.setParams) {
      this._moduleApi.setParams(this._params)
    }
  }

  setAutoRotate(on) {
    this.cameraRig.setAutoRotate(on)
  }

  resetCamera(preset = 'orbit') {
    this.cameraRig.preset(preset)
  }

  resize() {
    this.renderManager.resize()
    this.cameraRig.resize(this.container)
    if (this.labelSystem) {
      this.labelSystem.resize(this.container)
    }
  }

  _disposeModule() {
    if (this._moduleApi?.dispose) {
      this._moduleApi.dispose()
    }
    if (this._moduleGroup) {
      this.scene.remove(this._moduleGroup)
      this._moduleGroup.traverse(c => {
        if (c.geometry) c.geometry.dispose()
        if (c.material) {
          if (Array.isArray(c.material)) {
            c.material.forEach(m => m.dispose())
          } else {
            c.material.dispose()
          }
        }
      })
      this._moduleGroup = null
    }
    if (this.labelSystem) {
      this.labelSystem.clearAll(this.scene)
    }
    this._moduleApi = null
  }

  _animate() {
    this._running = true
    const loop = () => {
      if (!this._running) return
      this._animFrameId = requestAnimationFrame(loop)

      const dt = Math.min(this.clock.getDelta(), 0.1)
      this.cameraRig.update()

      if (this._moduleApi?.update) {
        this._moduleApi.update(dt, this.clock.elapsedTime)
      }

      this.renderManager.render()
      if (this.labelSystem) {
        this.labelSystem.render(this.scene, this.cameraRig.camera)
      }
    }
    loop()
  }

  dispose() {
    this._running = false
    if (this._animFrameId) {
      cancelAnimationFrame(this._animFrameId)
    }
    this._disposeModule()

    // Dispose remaining scene objects
    this.scene.traverse(c => {
      if (c.geometry && !c.userData._managed) c.geometry.dispose()
      if (c.material && !c.userData._managed) {
        if (Array.isArray(c.material)) {
          c.material.forEach(m => m.dispose())
        } else {
          c.material.dispose()
        }
      }
    })

    this.lightRig.dispose()
    this.cameraRig.dispose()
    if (this.labelSystem) this.labelSystem.dispose()
    this.renderManager.dispose()
  }
}
