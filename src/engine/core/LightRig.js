import * as THREE from 'three'

const PRESETS = {
  studio: {
    ambient: { color: 0x8899aa, intensity: 0.4 },
    key: { color: 0xffeedd, intensity: 1.8, pos: [8, 15, 5] },
    fill: { color: 0x8888ff, intensity: 0.3, pos: [-5, 3, -5] },
    rim: { color: 0x8899cc, intensity: 0.25, pos: [0, -1, 5] },
  },
  sunlit: {
    ambient: { color: 0x444466, intensity: 0.6 },
    key: { color: 0xffeedd, intensity: 2.0, pos: [50, 30, 20] },
    fill: { color: 0x4466aa, intensity: 0.4, pos: [-5, 2, -3] },
    rim: { color: 0x8899cc, intensity: 0.25, pos: [0, -1, 5] },
  },
  dramatic: {
    ambient: { color: 0x334466, intensity: 0.6 },
    key: { color: 0xffeedd, intensity: 1.5, pos: [8, 12, 5] },
    fill: { color: 0x4466aa, intensity: 0.4, pos: [-5, 2, -3] },
    rim: { color: 0x8899cc, intensity: 0.25, pos: [0, -1, 5] },
  },
}

export class LightRig {
  constructor(scene, preset = 'studio') {
    this.scene = scene
    this.lights = {}
    this._applyPreset(preset)
  }

  _clearAll() {
    Object.values(this.lights).forEach(l => {
      this.scene.remove(l)
    })
    this.lights = {}
  }

  _applyPreset(name) {
    this._clearAll()
    const cfg = PRESETS[name] || PRESETS.studio
    this.currentPreset = name

    const ambient = new THREE.AmbientLight(cfg.ambient.color, cfg.ambient.intensity)
    this.scene.add(ambient)
    this.lights.ambient = ambient

    const key = new THREE.DirectionalLight(cfg.key.color, cfg.key.intensity)
    key.position.set(...cfg.key.pos)
    key.castShadow = true
    key.shadow.mapSize.set(2048, 2048)
    key.shadow.camera.near = 0.1
    key.shadow.camera.far = 50
    key.shadow.camera.left = -10
    key.shadow.camera.right = 10
    key.shadow.camera.top = 10
    key.shadow.camera.bottom = -10
    this.scene.add(key)
    this.lights.key = key

    const fill = new THREE.DirectionalLight(cfg.fill.color, cfg.fill.intensity)
    fill.position.set(...cfg.fill.pos)
    this.scene.add(fill)
    this.lights.fill = fill

    const rim = new THREE.DirectionalLight(cfg.rim.color, cfg.rim.intensity)
    rim.position.set(...cfg.rim.pos)
    this.scene.add(rim)
    this.lights.rim = rim
  }

  setPreset(name) {
    this._applyPreset(name)
  }

  setSunDirection(vec3) {
    if (this.lights.key) {
      this.lights.key.position.copy(vec3)
    }
  }

  dispose() {
    this._clearAll()
  }
}
