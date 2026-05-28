import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const PRESETS = {
  front: { pos: [0, 0, 8], target: [0, 0, 0] },
  top: { pos: [0, 8, 0.1], target: [0, 0, 0] },
  orbit: { pos: [5, 3, 6], target: [0, 0, 0] },
  close: { pos: [0, 0, 3], target: [0, 0, 0] },
}

export class CameraRig {
  constructor(container, domElement, options = {}) {
    const w = container.clientWidth || 800
    const h = container.clientHeight || 600
    this.camera = new THREE.PerspectiveCamera(
      options.fov || 40,
      w / h,
      options.near || 0.1,
      options.far || 10000,
    )
    this.camera.position.set(5, 3, 6)
    this.camera.lookAt(0, 0, 0)

    this.controls = new OrbitControls(this.camera, domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = options.dampingFactor ?? 0.08
    this.controls.minDistance = options.minDistance ?? 1.5
    this.controls.maxDistance = options.maxDistance ?? 30
    this.controls.maxPolarAngle = options.maxPolarAngle ?? Math.PI
    this.controls.autoRotate = options.autoRotate ?? false
    this.controls.autoRotateSpeed = options.autoRotateSpeed ?? 0.8
    this.controls.target.set(0, 0, 0)
    this.controls.update()
  }

  preset(name) {
    const p = PRESETS[name]
    if (!p) return
    this.camera.position.set(...p.pos)
    this.controls.target.set(...p.target)
    this.controls.update()
  }

  setAutoRotate(on) {
    this.controls.autoRotate = on
  }

  setDistanceLimits(min, max) {
    this.controls.minDistance = min
    this.controls.maxDistance = max
  }

  setPolarLimit(max) {
    this.controls.maxPolarAngle = max
  }

  resize(container) {
    const w = container.clientWidth
    const h = container.clientHeight
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }

  update() {
    this.controls.update()
  }

  dispose() {
    this.controls.dispose()
  }
}
