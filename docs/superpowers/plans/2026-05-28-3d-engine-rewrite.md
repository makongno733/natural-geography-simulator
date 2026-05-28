# 3D Engine Full Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace 5 independent scene engines + inline Three.js code with a unified `src/engine/` framework, and significantly improve 3D model fidelity for all 6 chapters of 高中必修第一册.

**Architecture:** A layered engine with core infrastructure (BaseScene, RenderManager, CameraRig, LightRig, LabelSystem), pluggable chapter modules (each returning a THREE.Group), shared utilities (AssetLoader, GeometryFactory, MaterialLibrary), and a post-processing pipeline (Bloom, SSAO). Vue components become thin wrappers (~60-100 lines) delegating all Three.js work to the engine.

**Tech Stack:** Three.js, Vue 3, Vite, @takram/three-atmosphere, EffectComposer/UnrealBloomPass/SSAOPass

---

### Task 1: Create directory structure and MaterialLibrary

**Files:**
- Create: `src/engine/materials/MaterialLibrary.js`

- [ ] **Step 1: Create engine directory structure**

```bash
mkdir -p src/engine/core src/engine/modules src/engine/materials src/engine/effects src/engine/utils
```

- [ ] **Step 2: Write MaterialLibrary**

```js
// src/engine/materials/MaterialLibrary.js
import * as THREE from 'three'

export const MaterialPreset = {
  STUDIO: 'studio',
  SUNLIT: 'sunlit',
  DRAMATIC: 'dramatic',
}

export class MaterialLibrary {
  static pbr({ color, roughness = 0.5, metalness = 0.1, map = null, normalMap = null, emissive = 0x000000, emissiveIntensity = 0, transparent = false, opacity = 1.0, side = THREE.FrontSide }) {
    return new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
      map,
      normalMap,
      emissive,
      emissiveIntensity,
      transparent,
      opacity,
      side,
    })
  }

  static emissive({ color, intensity = 1.0 }) {
    return new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: intensity,
      roughness: 0.3,
      metalness: 0.1,
    })
  }

  static transparent({ color, opacity = 0.5, blending = THREE.NormalBlending, depthWrite = true }) {
    return new THREE.MeshStandardMaterial({
      color,
      transparent: true,
      opacity,
      blending,
      depthWrite,
      roughness: 0.3,
      metalness: 0.05,
    })
  }

  static particle({ color, size = 0.05, blending = THREE.NormalBlending, depthWrite = false, vertexColors = false }) {
    return new THREE.PointsMaterial({
      color,
      size,
      blending,
      depthWrite,
      vertexColors,
      transparent: true,
      opacity: vertexColors ? 1.0 : 0.8,
    })
  }

  static additiveParticle({ color, size = 0.05 }) {
    return MaterialLibrary.particle({ color, size, blending: THREE.AdditiveBlending })
  }

  static clipPBR({ color, clippingPlanes, roughness = 0.5, metalness = 0.3, opacity = 0.8, emissive = 0x000000, emissiveIntensity = 0 }) {
    return new THREE.MeshPhysicalMaterial({
      color,
      roughness,
      metalness,
      clippingPlanes,
      clipShadows: true,
      transparent: true,
      opacity,
      emissive,
      emissiveIntensity,
      side: THREE.DoubleSide,
    })
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/engine/materials/MaterialLibrary.js
git commit -m "feat: add MaterialLibrary with PBR/emissive/transparent/particle presets"
```

---

### Task 2: Create GeometryFactory utility

**Files:**
- Create: `src/engine/utils/GeometryFactory.js`

- [ ] **Step 1: Write GeometryFactory**

```js
// src/engine/utils/GeometryFactory.js
import * as THREE from 'three'

export class GeometryFactory {
  static sphere(radius, segments = 48) {
    return new THREE.SphereGeometry(radius, segments, segments)
  }

  static cylinder(radiusTop, radiusBottom, height, segments = 32) {
    return new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments)
  }

  static torus(radius, tube = 0.05, radialSegments = 16, tubularSegments = 48) {
    return new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments)
  }

  static ring(innerRadius, outerRadius, segments = 64) {
    return new THREE.RingGeometry(innerRadius, outerRadius, segments)
  }

  static plane(width, height, segW = 1, segH = 1) {
    return new THREE.PlaneGeometry(width, height, segW, segH)
  }

  static box(width, height, depth) {
    return new THREE.BoxGeometry(width, height, depth)
  }

  static chamferedCylinder(radius, height, segments = 32, bevel = 0.02) {
    // Approximate chamfer with a cylinder + thin torus edges
    const group = new THREE.Group()
    const body = new THREE.CylinderGeometry(radius, radius, height - bevel * 2, segments)
    const bodyMesh = new THREE.Mesh(body)
    bodyMesh.position.y = 0
    group.add(bodyMesh)

    // Top bevel ring
    const topBevel = new THREE.TorusGeometry(radius - bevel * 0.5, bevel, 8, segments)
    const topMesh = new THREE.Mesh(topBevel)
    topMesh.rotation.x = Math.PI / 2
    topMesh.position.y = height / 2 - bevel
    group.add(topMesh)

    // Bottom bevel ring
    const botBevel = new THREE.TorusGeometry(radius - bevel * 0.5, bevel, 8, segments)
    const botMesh = new THREE.Mesh(botBevel)
    botMesh.rotation.x = Math.PI / 2
    botMesh.position.y = -height / 2 + bevel
    group.add(botMesh)

    return group
  }

  static spiralPoints(radiusFn, heightFn, count) {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const t = i / count
      const angle = t * Math.PI * 6
      const r = radiusFn(t)
      const h = heightFn(t)
      positions[i * 3] = Math.cos(angle) * r
      positions[i * 3 + 1] = h
      positions[i * 3 + 2] = Math.sin(angle) * r
    }
    return positions
  }

  static arcPoints(startAngle, endAngle, radius, height, segments = 64) {
    const pts = []
    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const angle = startAngle + (endAngle - startAngle) * t
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius))
    }
    return pts
  }

  static ringPoints(radius, height, segments = 64) {
    return GeometryFactory.arcPoints(0, Math.PI * 2, radius, height, segments)
  }

  static lineFromPoints(points, color = 0xffffff, opacity = 0.5) {
    const geo = new THREE.BufferGeometry().setFromPoints(points)
    return new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity }))
  }

  static starField(count = 2000, radius = 1000) {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * radius * 2
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.5,
      transparent: true,
      opacity: 0.8,
    })
    return new THREE.Points(geo, mat)
  }

  static spiralTube(latStart, latEnd, earthRadius, heightOffset, color, tubeRadius = 0.03, segments = 200) {
    const pts = []
    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const lat = latStart + (latEnd - latStart) * t
      const lon = t * Math.PI * 4
      const latRad = (lat * Math.PI) / 180
      const r = earthRadius + heightOffset * Math.sin(t * Math.PI)
      pts.push(new THREE.Vector3(
        r * Math.cos(latRad) * Math.cos(lon),
        r * Math.sin(latRad),
        r * Math.cos(latRad) * Math.sin(lon),
      ))
    }
    const curve = new THREE.CatmullRomCurve3(pts)
    return new THREE.TubeGeometry(curve, segments * 2, tubeRadius, 8, false)
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/utils/GeometryFactory.js
git commit -m "feat: add GeometryFactory with shared geometry builders"
```

---

### Task 3: Create AssetLoader utility

**Files:**
- Create: `src/engine/utils/AssetLoader.js`

- [ ] **Step 1: Write AssetLoader**

```js
// src/engine/utils/AssetLoader.js
import * as THREE from 'three'

export class AssetLoader {
  constructor() {
    this.textureLoader = new THREE.TextureLoader()
    this.cache = new Map()
    this.fallbackColors = new Map()
  }

  registerFallback(key, color) {
    this.fallbackColors.set(key, color)
  }

  async loadTexture(url, key = null, retries = 3) {
    const cacheKey = key || url
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const texture = await this.textureLoader.loadAsync(url)
        this.cache.set(cacheKey, texture)
        return texture
      } catch (e) {
        if (attempt === retries - 1) {
          console.warn(`AssetLoader: failed to load "${url}", using fallback`)
          const fallbackColor = this.fallbackColors.get(cacheKey)
          if (fallbackColor) {
            const canvas = document.createElement('canvas')
            canvas.width = 64; canvas.height = 64
            const ctx = canvas.getContext('2d')
            ctx.fillStyle = '#' + fallbackColor.toString(16).padStart(6, '0')
            ctx.fillRect(0, 0, 64, 64)
            const fallbackTexture = new THREE.CanvasTexture(canvas)
            this.cache.set(cacheKey, fallbackTexture)
            return fallbackTexture
          }
          return null
        }
      }
    }
  }

  async preload(manifest) {
    const promises = manifest.map(({ url, key }) => this.loadTexture(url, key))
    const results = await Promise.allSettled(promises)
    const loaded = {}
    results.forEach((r, i) => {
      loaded[manifest[i].key] = r.status === 'fulfilled' ? r.value : null
    })
    return loaded
  }

  get(key) {
    return this.cache.get(key) || null
  }
}

// Singleton
export const assetLoader = new AssetLoader()
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/utils/AssetLoader.js
git commit -m "feat: add AssetLoader with offline fallback and cache"
```

---

### Task 4: Create RenderManager

**Files:**
- Create: `src/engine/core/RenderManager.js`

- [ ] **Step 1: Write RenderManager**

```js
// src/engine/core/RenderManager.js
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
    this._ssaoPass = null

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
    // Lazy-load bloom to avoid import cost when unused
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

  setSSAO(enabled) {
    if (!this._ssaoPass && enabled) {
      this._ssaoPass = null // Will implement SSAO in Task 9
    }
    if (this._ssaoPass) {
      this._ssaoPass.enabled = enabled
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
    this._ssaoPass = null
    this.renderer.dispose()
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/core/RenderManager.js
git commit -m "feat: add RenderManager with EffectComposer and bloom support"
```

---

### Task 5: Create CameraRig

**Files:**
- Create: `src/engine/core/CameraRig.js`

- [ ] **Step 1: Write CameraRig**

```js
// src/engine/core/CameraRig.js
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
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/core/CameraRig.js
git commit -m "feat: add CameraRig with OrbitControls and view presets"
```

---

### Task 6: Create LightRig

**Files:**
- Create: `src/engine/core/LightRig.js`

- [ ] **Step 1: Write LightRig**

```js
// src/engine/core/LightRig.js
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
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/core/LightRig.js
git commit -m "feat: add LightRig with studio/sunlit/dramatic presets"
```

---

### Task 7: Create LabelSystem

**Files:**
- Create: `src/engine/core/LabelSystem.js`

- [ ] **Step 1: Write LabelSystem**

```js
// src/engine/core/LabelSystem.js
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

export class LabelSystem {
  constructor(container) {
    this.renderer = new CSS2DRenderer()
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.domElement.style.position = 'absolute'
    this.renderer.domElement.style.top = '0'
    this.renderer.domElement.style.left = '0'
    this.renderer.domElement.style.pointerEvents = 'none'
    container.appendChild(this.renderer.domElement)
    this._labels = []
  }

  createLabel(text, position, style = {}) {
    const div = document.createElement('div')
    div.textContent = text
    Object.assign(div.style, {
      color: '#fff',
      fontSize: '13px',
      fontWeight: '600',
      textShadow: '0 0 8px rgba(0,0,0,0.8)',
      background: 'rgba(0,0,0,0.5)',
      padding: '2px 8px',
      borderRadius: '4px',
      whiteSpace: 'nowrap',
      pointerEvents: style.clickable ? 'auto' : 'none',
      cursor: style.clickable ? 'pointer' : 'default',
      ...style,
    })

    const label = new CSS2DObject(div)
    label.position.copy(position)
    label.userData = { clickable: style.clickable }
    if (style.onClick) {
      label.userData.onClick = style.onClick
      div.addEventListener('click', style.onClick)
    }
    return label
  }

  addLabel(group, label) {
    group.add(label)
    this._labels.push(label)
    return label
  }

  addToGroup(group, text, position, style = {}) {
    const label = this.createLabel(text, position, style)
    group.add(label)
    this._labels.push(label)
    return label
  }

  clearAll(scene) {
    this._labels.forEach(l => {
      if (l.parent) l.parent.remove(l)
      if (l.element && l.element.parentNode) {
        l.element.parentNode.removeChild(l.element)
      }
    })
    this._labels = []
  }

  render(scene, camera) {
    this.renderer.render(scene, camera)
  }

  resize(container) {
    this.renderer.setSize(container.clientWidth, container.clientHeight)
  }

  dispose() {
    this.renderer.domElement.remove()
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/core/LabelSystem.js
git commit -m "feat: add LabelSystem for CSS2D labels"
```

---

### Task 8: Create BaseScene

**Files:**
- Create: `src/engine/core/BaseScene.js`

- [ ] **Step 1: Write BaseScene**

```js
// src/engine/core/BaseScene.js
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

    // Dispose scene objects not in module group
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
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/core/BaseScene.js
git commit -m "feat: add BaseScene with full lifecycle and module loading"
```

---

### Task 9: Create PostProcessing pipeline

**Files:**
- Create: `src/engine/effects/PostProcessing.js`

- [ ] **Step 1: Write PostProcessing**

```js
// src/engine/effects/PostProcessing.js
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
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/effects/PostProcessing.js
git commit -m "feat: add PostProcessing with bloom control"
```

---

### Task 10: Create EarthInteriorModule

**Files:**
- Create: `src/engine/modules/EarthInteriorModule.js`

- [ ] **Step 1: Write EarthInteriorModule**

```js
// src/engine/modules/EarthInteriorModule.js
import * as THREE from 'three'
import { MaterialLibrary } from '../materials/MaterialLibrary.js'
import { GeometryFactory } from '../utils/GeometryFactory.js'

const ANNOTATION_LAYERS = [
  { name: '地壳', color: '#4a90d9', pos: [1.4, 0.5, 0], props: ['厚度 5-70km', '温度 地表~1000°C', '组成 花岗岩/玄武岩', '状态 固态'] },
  { name: '地幔', color: '#e67e22', pos: [1.1, -0.8, 0.8], props: ['厚度 ~2900km', '温度 1000-3700°C', '密度 3.3-5.7 g/cm³', '组成 橄榄岩'] },
  { name: '外核', color: '#f39c12', pos: [0.8, 0.6, -0.4], props: ['厚度 ~2210km', '温度 3700-4500°C', '组成 Fe+Ni', '状态 液态'] },
  { name: '内核', color: '#f1c40f', pos: [0.5, -0.3, -0.5], props: ['半径 ~1220km', '温度 ~5500°C', '密度 ~13 g/cm³', '状态 固态'] },
]

const DISCONTINUITIES = [
  { name: '莫霍界面', radius: 1.0, color: '#6688aa' },
  { name: '古登堡界面', radius: 0.85, color: '#6688aa' },
]

export function EarthInteriorModule(scene, params, services) {
  const { labelSystem } = services
  const group = new THREE.Group()
  const isProfessional = params.mode === 'professional'

  const clipPlane = new THREE.Plane(new THREE.Vector3(-1, 0.3, 0.5), 0.1)

  // Inner core - emissive warm glow
  const innerCoreGeo = GeometryFactory.sphere(0.3, 48)
  const innerCoreMat = MaterialLibrary.emissive({ color: 0xf1c40f, intensity: 0.5 })
  innerCoreMat.roughness = 0.3
  innerCoreMat.metalness = 0.7
  const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat)
  group.add(innerCore)

  // Outer core - liquid metal
  const outerCoreGeo = GeometryFactory.sphere(0.55, 48)
  const outerCoreMat = MaterialLibrary.clipPBR({
    color: 0xf39c12,
    clippingPlanes: [clipPlane],
    emissive: 0xf39c12,
    emissiveIntensity: 0.15,
  })
  const outerCore = new THREE.Mesh(outerCoreGeo, outerCoreMat)
  group.add(outerCore)

  // Mantle
  const mantleGeo = GeometryFactory.sphere(0.85, 48)
  const mantleMat = MaterialLibrary.clipPBR({
    color: 0xe67e22,
    clippingPlanes: [clipPlane],
    emissive: 0xe67e22,
    emissiveIntensity: 0.08,
  })
  const mantle = new THREE.Mesh(mantleGeo, mantleMat)
  group.add(mantle)

  // Crust
  const crustGeo = GeometryFactory.sphere(1.0, 48)
  const crustMat = MaterialLibrary.clipPBR({
    color: 0x4a90d9,
    clippingPlanes: [clipPlane],
    roughness: 0.5,
    opacity: 0.8,
  })
  const crust = new THREE.Mesh(crustGeo, crustMat)
  group.add(crust)

  // Discontinuity rings
  DISCONTINUITIES.forEach(d => {
    const torusGeo = GeometryFactory.torus(d.radius, 0.015, 16, 64)
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0x6688aa,
      transparent: true,
      opacity: 0.5,
    })
    const torus = new THREE.Mesh(torusGeo, torusMat)
    torus.rotation.x = Math.PI / 2
    group.add(torus)
  })

  // Labels
  if (labelSystem) {
    ANNOTATION_LAYERS.forEach(l => {
      labelSystem.addToGroup(group, l.name, new THREE.Vector3(...l.pos), {
        color: l.color,
        fontSize: '14px',
        fontWeight: '600',
      })
      if (isProfessional) {
        l.props.forEach((prop, i) => {
          labelSystem.addToGroup(group, prop,
            new THREE.Vector3(l.pos[0], l.pos[1] - 0.22 - i * 0.17, l.pos[2]),
            { color: '#aaa', fontSize: '10px', fontWeight: '400' })
        })
      }
    })
    DISCONTINUITIES.forEach(d => {
      const angle = d.radius === 1.0 ? Math.PI / 4 : -Math.PI / 4
      const px = d.radius * Math.cos(angle)
      const pz = d.radius * Math.sin(angle)
      labelSystem.addToGroup(group, d.name, new THREE.Vector3(px, 0, pz * 1.3), {
        color: d.color,
        fontSize: '11px',
      })
    })
  }

  const api = {
    update(dt, elapsed) {
      group.rotation.y += 0.3 * dt
    },
    setMode(mode) {},
    setParams(params) {},
    dispose() {},
  }
  group.userData = { api }

  return group
}
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/modules/EarthInteriorModule.js
git commit -m "feat: add EarthInteriorModule with PBR layers and clipping"
```

---

### Task 11: Create CelestialSphereModule

**Files:**
- Create: `src/engine/modules/CelestialSphereModule.js`

- [ ] **Step 1: Write CelestialSphereModule**

```js
// src/engine/modules/CelestialSphereModule.js
import * as THREE from 'three'
import { MaterialLibrary } from '../materials/MaterialLibrary.js'
import { GeometryFactory } from '../utils/GeometryFactory.js'

const CELESTIAL_OBJECTS = [
  { id: 'sirius_a', name: '天狼星A', type: '主序星', color: 0xadd8ff, emissiveIntensity: 0.8, pos: [1.6, -0.5, 1.5], size: 0.08 },
  { id: 'betelgeuse', name: '参宿四', type: '红超巨星', color: 0xff4444, emissiveIntensity: 1.2, pos: [-1.3, 1.2, 1.2], size: 0.14 },
  { id: 'sirius_b', name: '天狼星B', type: '白矮星', color: 0xeeeeee, emissiveIntensity: 0.5, pos: [1.4, -0.7, 1.7], size: 0.05 },
  { id: 'cygnus_x1', name: '天鹅座X-1', type: '黑洞', color: 0x440044, emissiveIntensity: 0, pos: [-1.0, 0.8, -1.8], size: 0.04 },
  { id: 'crab_pulsar', name: '蟹状星云脉冲星', type: '中子星', color: 0x00ffcc, emissiveIntensity: 0.7, pos: [0.3, -1.5, 1.6], size: 0.06 },
]

export function CelestialSphereModule(scene, params, services) {
  const { labelSystem } = services
  const group = new THREE.Group()
  const CS_RADIUS = 2.5

  // Origin sphere
  const originGeo = GeometryFactory.sphere(0.05, 12)
  const originMat = new THREE.MeshBasicMaterial({ color: 0x888888 })
  group.add(new THREE.Mesh(originGeo, originMat))

  // Latitude grid lines (dense)
  for (let lat = -80; lat <= 80; lat += 20) {
    const phi = (lat * Math.PI) / 180
    const r = Math.cos(phi) * CS_RADIUS
    const y = Math.sin(phi) * CS_RADIUS
    const pts = []
    for (let i = 0; i <= 36; i++) {
      const theta = (i / 36) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r))
    }
    group.add(GeometryFactory.lineFromPoints(pts, 0x446688, 0.15))
  }

  // Longitude grid lines
  for (let lon = 0; lon < 360; lon += 30) {
    const theta = (lon * Math.PI) / 180
    const pts = []
    for (let i = 0; i <= 36; i++) {
      const phi = (i / 36) * Math.PI
      pts.push(new THREE.Vector3(
        Math.cos(theta) * Math.sin(phi) * CS_RADIUS,
        Math.cos(phi) * CS_RADIUS,
        Math.sin(theta) * Math.sin(phi) * CS_RADIUS,
      ))
    }
    group.add(GeometryFactory.lineFromPoints(pts, 0x446688, 0.1))
  }

  // Celestial objects with emissive materials
  const objectMeshes = {}
  CELESTIAL_OBJECTS.forEach(obj => {
    const pos = new THREE.Vector3(...obj.pos)
    const geo = GeometryFactory.sphere(obj.size, 16)
    const mat = MaterialLibrary.emissive({
      color: obj.color,
      intensity: obj.emissiveIntensity,
    })
    if (obj.emissiveIntensity === 0) {
      mat.emissive.set(0x000000)
      mat.emissiveIntensity = 0
    }
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.copy(pos)
    mesh.userData = { objectId: obj.id }
    group.add(mesh)
    objectMeshes[obj.id] = mesh

    if (labelSystem) {
      labelSystem.addToGroup(group, obj.name,
        pos.clone().add(new THREE.Vector3(0, obj.size + 0.15, 0)),
        { color: '#' + obj.color.toString(16).padStart(6, '0'), fontSize: '11px' })
    }
  })

  // Black hole accretion disk (Cygnus X-1)
  const cygnusPos = new THREE.Vector3(-1.0, 0.8, -1.8)
  const diskGeo = GeometryFactory.ring(0.06, 0.14, 48)
  diskGeo.rotateX(-Math.PI / 2)
  const diskMat = new THREE.MeshBasicMaterial({
    color: 0xcc66ff,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
  })
  const disk = new THREE.Mesh(diskGeo, diskMat)
  disk.position.copy(cygnusPos)
  group.add(disk)

  // Pulsar glow ring
  const pulsarPos = new THREE.Vector3(0.3, -1.5, 1.6)
  const glowGeo = GeometryFactory.ring(0.07, 0.11, 48)
  glowGeo.rotateX(-Math.PI / 2)
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x00ffcc,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
  const glow = new THREE.Mesh(glowGeo, glowMat)
  glow.position.copy(pulsarPos)
  group.add(glow)

  // System labels
  if (labelSystem) {
    const sysLabels = [
      { text: '天顶', pos: [0, CS_RADIUS + 0.2, 0], color: '#888' },
      { text: 'N', pos: [0, 0.1, -CS_RADIUS - 0.3], color: '#888' },
      { text: '天赤道', pos: [CS_RADIUS * 0.7, 0.1, 0], color: '#888' },
    ]
    sysLabels.forEach(l => {
      labelSystem.addToGroup(group, l.text, new THREE.Vector3(...l.pos), {
        color: l.color,
        fontSize: '12px',
      })
    })
  }

  const api = {
    getObjectMeshes() { return objectMeshes },
    dispose() {},
  }
  group.userData = { api }

  return group
}
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/modules/CelestialSphereModule.js
git commit -m "feat: add CelestialSphereModule with emissive stars and grid"
```

---

### Task 12: Create SolarSystemModule

**Files:**
- Create: `src/engine/modules/SolarSystemModule.js`

- [ ] **Step 1: Write SolarSystemModule**

```js
// src/engine/modules/SolarSystemModule.js
import * as THREE from 'three'
import { MaterialLibrary } from '../materials/MaterialLibrary.js'
import { GeometryFactory } from '../utils/GeometryFactory.js'

const PLANETS = [
  { name: '水星', radius: 0.9, size: 0.03, color: 0xaaaaaa, period: 0.24 },
  { name: '金星', radius: 1.3, size: 0.05, color: 0xe8cda0, period: 0.62 },
  { name: '地球', radius: 1.8, size: 0.06, color: 0x4a90d9, period: 1.0 },
  { name: '火星', radius: 2.4, size: 0.04, color: 0xcd5c5c, period: 1.88 },
  { name: '木星', radius: 3.3, size: 0.12, color: 0xd4a574, period: 11.86 },
  { name: '土星', radius: 4.2, size: 0.10, color: 0xead6b8, period: 29.46 },
]

export function SolarSystemModule(scene, params, services) {
  const { labelSystem } = services
  const group = new THREE.Group()

  // Sun - dual layer
  const sunGeo = GeometryFactory.sphere(0.35, 24)
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xffaa33 })
  const sun = new THREE.Mesh(sunGeo, sunMat)
  group.add(sun)

  // Sun glow shell
  const glowGeo = GeometryFactory.sphere(0.5, 24)
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xffcc66,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  group.add(new THREE.Mesh(glowGeo, glowMat))

  if (labelSystem) {
    labelSystem.addToGroup(group, '太阳', new THREE.Vector3(0, -0.5, 0), {
      color: '#ffaa33',
      fontSize: '14px',
    })
  }

  // Planets with orbit rings
  const planetMeshes = []
  PLANETS.forEach((p, i) => {
    const ring = GeometryFactory.ring(p.radius, p.radius + 0.01, 96)
    ring.rotateX(-Math.PI / 2)
    const ringLine = new THREE.Mesh(ring,
      new THREE.MeshBasicMaterial({ color: p.color, transparent: true, opacity: 0.15, side: THREE.DoubleSide }))
    group.add(ringLine)

    const mesh = new THREE.Mesh(
      GeometryFactory.sphere(p.size, 16),
      MaterialLibrary.pbr({ color: p.color, roughness: 0.6 })
    )
    const initialAngle = (i / PLANETS.length) * Math.PI * 2
    mesh.position.set(Math.cos(initialAngle) * p.radius, 0, Math.sin(initialAngle) * p.radius)
    group.add(mesh)
    planetMeshes.push({ mesh, radius: p.radius, period: p.period, initialAngle })

    if (labelSystem) {
      labelSystem.addToGroup(group, p.name,
        new THREE.Vector3(0, p.size + 0.15, 0).add(mesh.position),
        { color: '#ccc', fontSize: '10px' })
    }
  })

  // Highlight Earth & Mars orbits
  const earthR = 1.8, marsR = 2.4
  const earthOrbit = GeometryFactory.ring(earthR, earthR + 0.01, 96)
  earthOrbit.rotateX(-Math.PI / 2)
  group.add(new THREE.Mesh(earthOrbit,
    new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.35, side: THREE.DoubleSide })))
  const marsOrbit = GeometryFactory.ring(marsR, marsR + 0.01, 96)
  marsOrbit.rotateX(-Math.PI / 2)
  group.add(new THREE.Mesh(marsOrbit,
    new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.35, side: THREE.DoubleSide })))

  // Direction arrows
  for (const r of [earthR, marsR]) {
    for (const ang of [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2]) {
      const arrowP = new THREE.Vector3(Math.cos(ang) * r, 0.02, Math.sin(ang) * r)
      const dir = new THREE.Vector3(-Math.sin(ang), 0, Math.cos(ang)).normalize()
      group.add(new THREE.ArrowHelper(dir, arrowP, 0.12, r === earthR ? 0x60a5fa : 0xef4444, 0.1, 0.06))
    }
  }

  // Hohmann transfer orbit
  const aT = (earthR + marsR) / 2
  const cX = earthR + (aT - earthR)
  const sB = Math.sqrt(earthR * marsR)
  const tPts = []
  for (let i = 0; i <= 60; i++) {
    const t = (i / 60) * Math.PI
    tPts.push(new THREE.Vector3(cX + aT * Math.cos(t), 0.03, sB * Math.sin(t)))
  }
  const transferLine = GeometryFactory.lineFromPoints(tPts, 0x44ff88, 0.6)
  group.add(transferLine)

  if (labelSystem) {
    labelSystem.addToGroup(group, '出发 (29.8→11.6 km/s)', new THREE.Vector3(earthR, -0.3, 0),
      { color: '#60a5fa', fontSize: '10px' })
    labelSystem.addToGroup(group, '到达 (火星)', new THREE.Vector3(marsR * Math.cos(Math.PI * 1.35), 0.3, marsR * Math.sin(Math.PI * 1.35)),
      { color: '#ef4444', fontSize: '10px' })
    labelSystem.addToGroup(group, '加速 椭圆飞行 259天', new THREE.Vector3(2.0, 0.5, 0.8),
      { color: '#44ff88', fontSize: '10px' })
  }

  // Animation
  const J2000 = 2451545.0
  const JD_PER_SEC = 365.25

  const api = {
    update(dt, elapsed) {
      const secPerYear = 365.25 * 86400 / 10
      planetMeshes.forEach(p => {
        const angle = p.initialAngle + (elapsed / secPerYear) * (2 * Math.PI) / p.period
        p.mesh.position.set(
          Math.cos(angle) * p.radius,
          0,
          Math.sin(angle) * p.radius,
        )
      })
    },
    dispose() {},
  }
  group.userData = { api }

  return group
}
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/modules/SolarSystemModule.js
git commit -m "feat: add SolarSystemModule with orbit animation and Hohmann transfer"
```

---

### Task 13: Create AtmosphereModule

**Files:**
- Create: `src/engine/modules/AtmosphereModule.js`

- [ ] **Step 1: Write AtmosphereModule**

```js
// src/engine/modules/AtmosphereModule.js
import * as THREE from 'three'
import { SkyMaterial } from '@takram/three-atmosphere'
import { GeometryFactory } from '../utils/GeometryFactory.js'

const LAYER_HEIGHTS = {
  对流层: { min: 0, max: 12, color: 0x4a9eff },
  平流层: { min: 12, max: 50, color: 0xffaa44 },
  中间层: { min: 50, max: 85, color: 0x9966ff },
  热层: { min: 85, max: 500, color: 0xff4466 },
  散逸层: { min: 500, max: 1000, color: 0xffffff },
}

const LAYER_LABELS = [
  { name: '对流层', height: 6, profExtra: '天气现象 · 每百米降0.65℃' },
  { name: '平流层', height: 30, profExtra: '臭氧层 20-25km · 适合飞行' },
  { name: '中间层', height: 65, profExtra: '流星在此燃烧' },
  { name: '热层', height: 200, profExtra: '电离层 85-500km · 极光' },
  { name: '散逸层', height: 600, profExtra: '卡门线 100km · 逃逸层' },
]

const COMPOSITION_PARTICLES = {
  simple: [
    { name: 'N₂', color: 0x4488ff, count: 4000, heightRange: [0, 12] },
    { name: 'O₂', color: 0x44cc44, count: 2000, heightRange: [0, 12] },
    { name: 'CO₂', color: 0x888888, count: 500, heightRange: [0, 20] },
    { name: 'H₂O', color: 0xffffff, count: 1000, heightRange: [0, 3] },
  ],
  professional: [
    { name: 'N₂', color: 0x4488ff, count: 6000, heightRange: [0, 85] },
    { name: 'O₂', color: 0x44cc44, count: 3000, heightRange: [0, 85] },
    { name: 'CO₂', color: 0x888888, count: 800, heightRange: [0, 20] },
    { name: 'H₂O', color: 0xffffff, count: 1500, heightRange: [0, 3] },
    { name: 'O₃', color: 0xaa66ff, count: 600, heightRange: [15, 35] },
    { name: '尘埃', color: 0x886644, count: 400, heightRange: [0, 2] },
    { name: 'Ar', color: 0xffdd88, count: 400, heightRange: [0, 85] },
  ],
}

export function AtmosphereModule(scene, params, services) {
  const { labelSystem, cameraRig } = services
  const group = new THREE.Group()
  const mode = params.mode || 'simple'
  const theme = params.theme || 0
  const EARTH_RADIUS = 1.8
  const SCALE = 6 / 1000

  // Star field
  group.add(GeometryFactory.starField(2000, 1000))

  // Earth
  const earthGeo = GeometryFactory.sphere(EARTH_RADIUS, 64)
  const earthMat = new THREE.MeshStandardMaterial({
    color: 0x4a90d9,
    roughness: 0.6,
    metalness: 0.1,
  })
  const earth = new THREE.Mesh(earthGeo, earthMat)
  earth.rotation.x = 0.3
  group.add(earth)

  // Atmosphere scattering
  let skyMesh = null
  try {
    const skyMaterial = new SkyMaterial()
    skyMaterial.setSunDirection(new THREE.Vector3(1, 0.3, 0.5).normalize())
    const skyGeo = GeometryFactory.sphere(800, 32)
    skyMesh = new THREE.Mesh(skyGeo, skyMaterial)
    skyMesh.scale.set(-1, 1, 1)
    group.add(skyMesh)
  } catch (e) {
    console.warn('SkyMaterial not available', e)
  }

  // Theme state
  let themeObjects = []

  function clearTheme() {
    themeObjects.forEach(o => {
      group.remove(o)
      if (o.geometry) o.geometry.dispose()
      if (o.material) o.material.dispose()
    })
    themeObjects = []
  }

  function showVerticalLayers() {
    Object.entries(LAYER_HEIGHTS).forEach(([name, h]) => {
      const outerR = EARTH_RADIUS + (h.max / 1000) * 6
      const innerR = EARTH_RADIUS + (h.min / 1000) * 6
      const r = (outerR + innerR) / 2

      const geo = GeometryFactory.sphere(r, 48)
      const mat = new THREE.ShaderMaterial({
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
        depthWrite: false,
        uniforms: { uColor: { value: new THREE.Color(h.color) } },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: `
          uniform vec3 uColor;
          varying vec3 vNormal;
          void main() {
            float rim = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
            float alpha = smoothstep(0.4, 1.0, rim) * 0.3;
            gl_FragColor = vec4(uColor, alpha);
          }`,
      })
      const mesh = new THREE.Mesh(geo, mat)
      group.add(mesh)
      themeObjects.push(mesh)
    })

    if (labelSystem) {
      LAYER_LABELS.forEach(l => {
        const r = EARTH_RADIUS + l.height * SCALE
        const text = mode === 'simple' ? l.name : `${l.name}\n${l.profExtra}`
        labelSystem.addToGroup(group, text, new THREE.Vector3(r, 0, 0), {
          fontSize: mode === 'simple' ? '13px' : '11px',
          fontWeight: mode === 'simple' ? '600' : '400',
          whiteSpace: 'pre-line',
          textAlign: 'center',
          lineHeight: '1.4',
        })
      })
    }
  }

  function showComposition() {
    const particles = COMPOSITION_PARTICLES[mode] || COMPOSITION_PARTICLES.simple

    particles.forEach(p => {
      const positions = new Float32Array(p.count * 3)
      const colors = new Float32Array(p.count * 3)
      const col = new THREE.Color(p.color)

      for (let i = 0; i < p.count; i++) {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        const height = (p.heightRange[0] + Math.random() * (p.heightRange[1] - p.heightRange[0])) * SCALE
        const r = EARTH_RADIUS + height

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
      group.add(points)
      themeObjects.push(points)
    })
  }

  function showRadiation() {
    const sunPos = new THREE.Vector3(8, 5, 6)
    const paths = mode === 'simple'
      ? [
        { pts: [sunPos, new THREE.Vector3(0, 0.5, 0)], color: 0xffee44, count: 40 },
        { pts: [new THREE.Vector3(0, 0.5, 0), new THREE.Vector3(0, 2, 0)], color: 0xff4444, count: 30 },
        { pts: [new THREE.Vector3(0, 2, 0), new THREE.Vector3(0, 0.3, 0)], color: 0xff8800, count: 30 },
      ]
      : [
        { pts: [sunPos, new THREE.Vector3(0, 0.5, 0)], color: 0xffee44, count: 60 },
        { pts: [sunPos, new THREE.Vector3(0, 3, 0)], color: 0xaaccff, count: 20 },
        { pts: [new THREE.Vector3(0, 0.5, 0), new THREE.Vector3(0, 2, 0)], color: 0xff4444, count: 40 },
        { pts: [new THREE.Vector3(0, 2, 0), new THREE.Vector3(0, 0.3, 0)], color: 0xff8800, count: 40 },
        { pts: [new THREE.Vector3(2, 1, 0), sunPos], color: 0xcccccc, count: 15 },
      ]

    paths.forEach(path => {
      const curve = new THREE.CatmullRomCurve3(path.pts)
      const positions = new Float32Array(path.count * 3)
      for (let i = 0; i < path.count; i++) {
        const pt = curve.getPoint(i / path.count)
        positions[i * 3] = pt.x
        positions[i * 3 + 1] = pt.y
        positions[i * 3 + 2] = pt.z
      }
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const mat = new THREE.PointsMaterial({
        size: 0.08, color: path.color, transparent: true, opacity: 0.9,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
      const points = new THREE.Points(geo, mat)
      group.add(points)
      themeObjects.push(points)
    })
  }

  function showCirculation() {
    const cells = [
      { latRanges: [[-30, 0], [0, 30]], color: 0xff6644, tubeRadius: 0.02 },
      { latRanges: [[-60, -30], [30, 60]], color: 0x44dd88, tubeRadius: 0.02 },
      { latRanges: [[-90, -60], [60, 90]], color: 0x4488ff, tubeRadius: 0.02 },
    ]

    cells.forEach(cell => {
      cell.latRanges.forEach(range => {
        const tubeGeo = GeometryFactory.spiralTube(range[0], range[1], EARTH_RADIUS, 0.8, cell.color, cell.tubeRadius, 200)
        const tubeMat = new THREE.MeshStandardMaterial({
          color: cell.color,
          roughness: 0.3,
          metalness: 0.2,
          transparent: true,
          opacity: 0.6,
        })
        const tube = new THREE.Mesh(tubeGeo, tubeMat)
        group.add(tube)
        themeObjects.push(tube)
      })
    })
  }

  function switchTheme(idx) {
    clearTheme()
    switch (idx) {
      case 0: showVerticalLayers(); break
      case 1: showComposition(); break
      case 2: showRadiation(); break
      case 3: showCirculation(); break
    }
  }

  switchTheme(theme)

  const api = {
    setMode(m) {
      group.mode = m
      clearTheme()
      switchTheme(theme)
    },
    setParams(p) {
      if (p.theme !== undefined) {
        clearTheme()
        switchTheme(p.theme)
      }
    },
    update(dt, elapsed) {
      earth.rotation.y += 0.15 * dt
    },
    dispose() {
      clearTheme()
    },
  }
  group.userData = { api }

  return group
}
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/modules/AtmosphereModule.js
git commit -m "feat: add AtmosphereModule with 4 themes and tube circulation"
```

---

### Task 14: Create WaterCycleModule

**Files:**
- Create: `src/engine/modules/WaterCycleModule.js`

- [ ] **Step 1: Write WaterCycleModule**

```js
// src/engine/modules/WaterCycleModule.js
import * as THREE from 'three'
import { GeometryFactory } from '../utils/GeometryFactory.js'

const PHASES = [
  { id: 'evaporation', name: '蒸发', color: 0x44aaff, count: 500 },
  { id: 'transport', name: '水汽输送', color: 0xffffff, count: 400 },
  { id: 'precipitation', name: '降水', color: 0x88ccff, count: 300 },
  { id: 'runoff', name: '径流', color: 0x2266cc, count: 200 },
]

export function WaterCycleModule(scene, params, services) {
  const { labelSystem } = services
  const group = new THREE.Group()
  const timeline = params.timeline || 0

  // Sea level plane
  const seaGeo = GeometryFactory.plane(4, 2.5)
  seaGeo.rotateX(-Math.PI / 2)
  const seaMat = new THREE.MeshStandardMaterial({
    color: 0x1a5a8a,
    roughness: 0.2,
    metalness: 0.5,
    transparent: true,
    opacity: 0.7,
  })
  const sea = new THREE.Mesh(seaGeo, seaMat)
  sea.position.set(-1.5, -0.5, 0)
  group.add(sea)

  // Land cross-section
  const landGeo = new THREE.BoxGeometry(2, 1.5, 2.5)
  const landMat = new THREE.MeshStandardMaterial({ color: 0x8a7a5a, roughness: 0.8 })
  const land = new THREE.Mesh(landGeo, landMat)
  land.position.set(1.0, 0.2, 0)
  group.add(land)

  // Mountain peak
  const mountainGeo = new THREE.ConeGeometry(0.6, 1.0, 8, 4)
  const mountainMat = new THREE.MeshStandardMaterial({ color: 0x6b5b4a, roughness: 0.7 })
  const mountain = new THREE.Mesh(mountainGeo, mountainMat)
  mountain.position.set(1.0, 1.4, 0)
  group.add(mountain)

  // Cloud layer
  const cloudGeo = GeometryFactory.sphere(1.2, 32)
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.9,
    metalness: 0,
    transparent: true,
    opacity: 0.15,
  })
  const cloud = new THREE.Mesh(cloudGeo, cloudMat)
  cloud.scale.set(1, 0.3, 1)
  cloud.position.set(0, 1.2, 0)
  group.add(cloud)

  // Evaporation particles (rising from sea)
  const evapPositions = new Float32Array(500 * 3)
  for (let i = 0; i < 500; i++) {
    evapPositions[i * 3] = -1.5 + (Math.random() - 0.5) * 2
    evapPositions[i * 3 + 1] = -0.5 + Math.random() * 1.5
    evapPositions[i * 3 + 2] = (Math.random() - 0.5) * 1.2
  }
  const evapGeo = new THREE.BufferGeometry()
  evapGeo.setAttribute('position', new THREE.BufferAttribute(evapPositions, 3))
  const evapMat = new THREE.PointsMaterial({
    color: 0x44aaff, size: 0.05, transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false,
  })
  const evapParticles = new THREE.Points(evapGeo, evapMat)
  group.add(evapParticles)

  // Transport particles (horizontal drift)
  const transPositions = new Float32Array(400 * 3)
  for (let i = 0; i < 400; i++) {
    transPositions[i * 3] = -2 + Math.random() * 4
    transPositions[i * 3 + 1] = 0.8 + Math.random() * 0.6
    transPositions[i * 3 + 2] = (Math.random() - 0.5) * 1.0
  }
  const transGeo = new THREE.BufferGeometry()
  transGeo.setAttribute('position', new THREE.BufferAttribute(transPositions, 3))
  const transMat = new THREE.PointsMaterial({
    color: 0xffffff, size: 0.04, transparent: true, opacity: 0.6,
    blending: THREE.NormalBlending, depthWrite: false,
  })
  const transParticles = new THREE.Points(transGeo, transMat)
  group.add(transParticles)

  // Precipitation (rain streaks)
  const rainPositions = new Float32Array(300 * 3)
  for (let i = 0; i < 300; i++) {
    rainPositions[i * 3] = 0.5 + (Math.random() - 0.5) * 1.5
    rainPositions[i * 3 + 1] = 0.5 + Math.random() * 1.0
    rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 1.0
  }
  const rainGeo = new THREE.BufferGeometry()
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3))
  const rainMat = new THREE.PointsMaterial({
    color: 0x88ccff, size: 0.03, transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false,
  })
  const rainParticles = new THREE.Points(rainGeo, rainMat)
  group.add(rainParticles)

  // Runoff line (river)
  const riverPts = [
    new THREE.Vector3(1.0, 1.6, 0),
    new THREE.Vector3(1.4, 1.0, 0),
    new THREE.Vector3(1.6, 0.3, 0),
    new THREE.Vector3(0.5, -0.1, 0),
    new THREE.Vector3(-1.5, -0.5, 0),
  ]
  const riverCurve = new THREE.CatmullRomCurve3(riverPts)
  const riverGeo = new THREE.TubeGeometry(riverCurve, 64, 0.04, 8, false)
  const riverMat = new THREE.MeshStandardMaterial({
    color: 0x2266cc, roughness: 0.1, metalness: 0.3,
    transparent: true, opacity: 0.7,
  })
  const river = new THREE.Mesh(riverGeo, riverMat)
  group.add(river)

  // Labels
  if (labelSystem) {
    const lbls = [
      { text: '海洋', pos: [-1.5, -0.7, 1.0], color: '#4aa' },
      { text: '云层', pos: [0, 1.5, 0], color: '#ccc' },
      { text: '山脉', pos: [1.0, 2.2, 0], color: '#8a7a5a' },
      { text: '河流', pos: [0.5, -0.3, 0.5], color: '#2266cc' },
    ]
    lbls.forEach(l => {
      labelSystem.addToGroup(group, l.text, new THREE.Vector3(...l.pos), {
        color: l.color, fontSize: '13px',
      })
    })
  }

  const particleSystems = { evap: evapParticles, trans: transParticles, rain: rainParticles }
  const api = {
    update(dt, elapsed) {
      const speed = 0.3 + timeline * 2.0
      // Evaporation: particles rise
      const evapArr = evapParticles.geometry.attributes.position.array
      for (let i = 0; i < 500; i++) {
        evapArr[i * 3 + 1] += speed * 0.3 * dt
        if (evapArr[i * 3 + 1] > 1.0) evapArr[i * 3 + 1] = -0.5
      }
      evapParticles.geometry.attributes.position.needsUpdate = true

      // Transport: drift right
      const transArr = transParticles.geometry.attributes.position.array
      for (let i = 0; i < 400; i++) {
        transArr[i * 3] += speed * 0.4 * dt
        if (transArr[i * 3] > 2) transArr[i * 3] = -2
      }
      transParticles.geometry.attributes.position.needsUpdate = true

      // Rain: fall down
      const rainArr = rainParticles.geometry.attributes.position.array
      for (let i = 0; i < 300; i++) {
        rainArr[i * 3 + 1] -= speed * 0.5 * dt
        if (rainArr[i * 3 + 1] < -0.5) rainArr[i * 3 + 1] = 1.2
      }
      rainParticles.geometry.attributes.position.needsUpdate = true
    },
    dispose() {},
  }
  group.userData = { api }

  return group
}
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/modules/WaterCycleModule.js
git commit -m "feat: add WaterCycleModule with 4-phase animation"
```

---

### Task 15: Create LandformModule

**Files:**
- Create: `src/engine/modules/LandformModule.js`

- [ ] **Step 1: Write LandformModule**

```js
// src/engine/modules/LandformModule.js
import * as THREE from 'three'
import { createTerrainMaterial } from '../../lib/shaders/terrainMaterial.js'

const SIZE = 4
const SEGMENTS = { simple: 128, professional: 256 }

const MODULE_IDS = {
  karst: 'karst', fluvial: 'fluvial', aeolian: 'aeolian',
  coastal: 'coastal', structural: 'structural', glacial: 'glacial', volcanic: 'volcanic',
}

const COLOR_BIAS = {
  karst: [0.1, 0.05, 0.05], fluvial: [-0.05, 0.05, -0.05],
  aeolian: [0.05, 0.1, -0.1], coastal: [-0.1, -0.05, -0.1],
  structural: [0, 0, 0.05], glacial: [0, 0, 0.1], volcanic: [0.05, -0.05, 0],
}

// Simplex-like noise (compact implementation)
function noise2D(x, y) {
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1]
  const grad3 = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]]
  const p = [
    151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
    190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,
    125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,
    105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,
    135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,
    82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,
    153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,
    251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,
    106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,
    195,78,66,215,61,156,180,
  ]
  const perm = new Uint8Array(512)
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255]

  const xi = Math.floor(x) & 255
  const yi = Math.floor(y) & 255
  const xf = x - Math.floor(x)
  const yf = y - Math.floor(y)
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)

  const aa = perm[perm[xi] + yi]
  const ab = perm[perm[xi] + yi + 1]
  const ba = perm[perm[xi + 1] + yi]
  const bb = perm[perm[xi + 1] + yi + 1]

  const x1 = xf - 1, y1 = yf - 1
  let n = (1 - u) * (1 - v) * dot(grad3[aa % 8], [xf, yf])
  n += (1 - u) * v * dot(grad3[ab % 8], [xf, y1])
  n += u * (1 - v) * dot(grad3[ba % 8], [x1, yf])
  n += u * v * dot(grad3[bb % 8], [x1, y1])
  return n
}

function fbm(x, y, octaves = 4) {
  let v = 0, a = 0.5, f = 1
  for (let i = 0; i < octaves; i++) {
    v += a * noise2D(x * f, y * f)
    a *= 0.5; f *= 2
  }
  return v
}

function modifyHeight(moduleId, xn, zn, baseH, timeline, climate) {
  const h = baseH
  const n1 = fbm(xn * 3, zn * 2, 4)
  const n2 = fbm(xn * 6, zn * 5, 3)
  const n3 = fbm(xn * 12, zn * 10, 2)

  switch (moduleId) {
    case 'fluvial':
      return h + n1 * 0.2 + n2 * 0.1 - Math.abs(xn - 0.5) * 0.15 * (1 - timeline)
    case 'karst':
      return h + n1 * 0.25 + Math.abs(n2) * 0.15 + n3 * 0.08
    case 'aeolian':
      return h + n1 * 0.15 + Math.sin(xn * 8 + zn * 3) * 0.08 + n2 * 0.05
    case 'coastal':
      return h + n1 * 0.12 + (xn < 0.3 ? -0.1 : 0) * (1 - timeline) + n2 * 0.06
    default:
      return h + n1 * 0.18 + n2 * 0.08
  }
}

function getModuleColor(moduleId, h) {
  const t = (h + 0.3) / 0.9
  const base = Math.max(0, Math.min(1, t))
  const col = new THREE.Color()
  switch (moduleId) {
    case 'fluvial': col.setHSL(0.15 + base * 0.15, 0.4, 0.25 + base * 0.3); break
    case 'karst': col.setHSL(0.12, 0.3, 0.3 + base * 0.35); break
    case 'aeolian': col.setHSL(0.11 + base * 0.05, 0.5, 0.35 + base * 0.25); break
    case 'coastal': col.setHSL(0.13, 0.3, 0.28 + base * 0.3); break
    default: col.setHSL(0.12, 0.35, 0.3 + base * 0.3)
  }
  return [col.r * 255, col.g * 255, col.b * 255]
}

const SECONDARY_LABELS = {
  karst: [
    { text: '峰林', pos: [-0.6, 0.5, -0.5] },
    { text: '溶斗', pos: [0.3, -0.05, 0.3] },
    { text: '溶洞', pos: [0.8, 0.1, -0.3] },
  ],
  fluvial: [
    { text: 'V形谷', pos: [-0.8, 0.1, 0] },
    { text: '冲积扇', pos: [0.6, 0.05, -0.5] },
    { text: '河曲', pos: [0, 0.05, 0.7] },
  ],
  aeolian: [
    { text: '沙丘', pos: [-0.4, 0.15, -0.2] },
    { text: '雅丹', pos: [0.5, 0.1, 0.4] },
    { text: '风蚀柱', pos: [-0.6, 0.2, 0.5] },
  ],
  coastal: [
    { text: '海蚀崖', pos: [-0.8, 0.15, 0] },
    { text: '海滩', pos: [0.2, -0.02, 0.6] },
    { text: '三角洲', pos: [0.7, 0.02, -0.3] },
  ],
}

export function LandformModule(scene, params, services) {
  const { labelSystem, lightRig } = services
  const group = new THREE.Group()
  const mode = params.mode || 'simple'
  const activeModule = params.activeModule || 'fluvial'
  const timeline = params.timeline || 0
  const climateFactor = params.climateFactor || 0.5

  const modId = MODULE_IDS[activeModule] || 'fluvial'
  const seg = SEGMENTS[mode] || SEGMENTS.simple

  const geo = new THREE.PlaneGeometry(SIZE, SIZE, seg, seg)
  geo.rotateX(-Math.PI / 2)

  const pos = geo.attributes.position
  const colors = new Float32Array(pos.count * 3)
  let minH = Infinity, maxH = -Infinity

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const xn = (x + SIZE / 2) / SIZE
    const zn = (z + SIZE / 2) / SIZE
    const baseH = 0.15 + Math.sin(xn * 3.7 + zn * 2.1) * 0.15 + Math.sin(xn * 5.2 - zn * 4.3 + 1.8) * 0.08
    const h = modifyHeight(modId, xn, zn, baseH, timeline, climateFactor)
    pos.setY(i, h)
    if (h < minH) minH = h
    if (h > maxH) maxH = h
    const c = getModuleColor(modId, h)
    colors[i * 3] = c[0] / 255
    colors[i * 3 + 1] = c[1] / 255
    colors[i * 3 + 2] = c[2] / 255
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const bias = COLOR_BIAS[activeModule] || [0, 0, 0]
  const terrainMat = createTerrainMaterial({
    minHeight: minH,
    maxHeight: maxH,
    sunDirection: new THREE.Vector3(0.5, 0.8, 0.3),
    biomeBias: new THREE.Vector3(bias[0], bias[1], bias[2]),
  })
  const terrain = new THREE.Mesh(geo, terrainMat)
  terrain.receiveShadow = true
  terrain.castShadow = true
  group.add(terrain)

  // Water plane
  if (activeModule !== 'aeolian') {
    const waterGeo = GeometryFactory.plane(SIZE * 1.2, SIZE * 1.2)
    waterGeo.rotateX(-Math.PI / 2)
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x3a7ca5, transparent: true, opacity: 0.35, roughness: 0.1, metalness: 0.3, side: THREE.DoubleSide,
    })
    const water = new THREE.Mesh(waterGeo, waterMat)
    water.position.y = -0.08
    water.receiveShadow = true
    group.add(water)
    group.userData = { ...group.userData, waterMesh: water }
  }

  // Secondary labels (professional mode)
  if (labelSystem && mode === 'professional') {
    const labels = SECONDARY_LABELS[activeModule] || []
    labels.forEach(l => {
      labelSystem.addToGroup(group, l.text, new THREE.Vector3(...l.pos), {
        color: '#e8d5c4',
        fontSize: '11px',
        background: 'rgba(60,40,30,0.78)',
        border: '1px solid rgba(200,160,120,0.4)',
      })
    })
  }

  const api = {
    update(dt, elapsed) {},
    dispose() {},
  }
  group.userData = { ...group.userData, api }

  return group
}
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/modules/LandformModule.js
git commit -m "feat: add LandformModule with simplex noise terrain"
```

---

### Task 16: Create SoilProfileModule

**Files:**
- Create: `src/engine/modules/SoilProfileModule.js`

- [ ] **Step 1: Write SoilProfileModule**

```js
// src/engine/modules/SoilProfileModule.js
import * as THREE from 'three'
import { SOIL_LAYERS } from '../../soil-profile/soilData.js'
import { MaterialLibrary } from '../materials/MaterialLibrary.js'
import { GeometryFactory } from '../utils/GeometryFactory.js'

export function SoilProfileModule(scene, params, services) {
  const { labelSystem } = services
  const group = new THREE.Group()
  const mode = params.mode || 'simple'
  const layers = SOIL_LAYERS[mode] || SOIL_LAYERS.simple

  let yOffset = -1
  const totalHeight = 2
  const radius = 0.8
  const layerMeshes = []

  layers.forEach(layer => {
    const height = layer.thickness * totalHeight
    const yPos = yOffset + height / 2

    // Main cylinder with chamfered edges
    const bodyGeo = GeometryFactory.cylinder(radius, radius, height, 32)
    const bodyMat = MaterialLibrary.pbr({
      color: layer.color,
      roughness: 0.7,
      metalness: 0.05,
      transparent: true,
      opacity: 0.92,
    })
    const body = new THREE.Mesh(bodyGeo, bodyMat)
    body.position.y = yPos
    body.castShadow = true
    body.receiveShadow = true
    body.userData = { layerId: layer.id }
    group.add(body)
    layerMeshes.push(body)

    // Divider ring between layers
    if (yOffset > -1) {
      const edgeGeo = GeometryFactory.ring(radius - 0.005, radius, 48)
      const edgeMat = new THREE.MeshBasicMaterial({
        color: 0x333333, transparent: true, opacity: 0.3, side: THREE.DoubleSide,
      })
      const edge = new THREE.Mesh(edgeGeo, edgeMat)
      edge.rotation.x = -Math.PI / 2
      edge.position.y = yPos - height / 2
      group.add(edge)
    }

    // Label
    if (labelSystem) {
      labelSystem.addToGroup(group, layer.label,
        new THREE.Vector3(radius + 0.6, yPos, 0), {
          fontSize: '14px',
          clickable: true,
          onClick: (e) => {
            e.stopPropagation()
          },
        })
    }

    yOffset += height
  })

  // Ground shadow catcher
  const groundGeo = GeometryFactory.plane(6, 6)
  const groundMat = new THREE.ShadowMaterial({ opacity: 0.25 })
  const ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -1.02
  ground.receiveShadow = true
  group.add(ground)

  // Organic leaf particles on O layer (top)
  const leafCount = 60
  const leafPositions = new Float32Array(leafCount * 3)
  for (let i = 0; i < leafCount; i++) {
    const angle = Math.random() * Math.PI * 2
    const r = Math.random() * radius * 0.9
    leafPositions[i * 3] = Math.cos(angle) * r
    leafPositions[i * 3 + 1] = yOffset - 0.01
    leafPositions[i * 3 + 2] = Math.sin(angle) * r
  }
  const leafGeo = new THREE.BufferGeometry()
  leafGeo.setAttribute('position', new THREE.BufferAttribute(leafPositions, 3))
  const leafMat = new THREE.PointsMaterial({
    color: 0x4a3728, size: 0.04, transparent: true, opacity: 0.6, depthWrite: false,
  })
  const leafParticles = new THREE.Points(leafGeo, leafMat)
  group.add(leafParticles)

  const api = {
    getLayerMeshes() { return layerMeshes },
    dispose() {},
  }
  group.userData = { api }

  return group
}
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/modules/SoilProfileModule.js
git commit -m "feat: add SoilProfileModule with chamfered layers"
```

---

### Task 17: Create DisasterModule

**Files:**
- Create: `src/engine/modules/DisasterModule.js`

- [ ] **Step 1: Write DisasterModule (Typhoon + Earthquake sub-modules)**

```js
// src/engine/modules/DisasterModule.js
import * as THREE from 'three'
import { GeometryFactory } from '../utils/GeometryFactory.js'
import { MaterialLibrary } from '../materials/MaterialLibrary.js'

// ---- Typhoon ----
function buildTyphoon(group) {
  const refs = {}

  // Sea surface
  const seg = 60
  const seaGeo = new THREE.PlaneGeometry(8, 8, seg, seg)
  seaGeo.rotateX(-Math.PI / 2)
  refs.seaVerts = seaGeo.attributes.position.array.slice()
  const seaMat = new THREE.MeshStandardMaterial({ color: 0x1a4a6a, roughness: 0.25, metalness: 0.4 })
  refs.sea = new THREE.Mesh(seaGeo, seaMat)
  refs.sea.position.y = -0.45
  group.add(refs.sea)

  // Multi-layer spiral cloud bands
  const layerDefs = [
    { count: 2500, rMin: 0.25, rMax: 0.7, h: 0.05, spread: 0.08, color: 0xeeeeff, size: 0.07, opacity: 0.7, speedMul: 1.2 },
    { count: 3500, rMin: 0.3, rMax: 1.6, h: 0.12, spread: 0.18, color: 0xccccdd, size: 0.1, opacity: 0.55, speedMul: 0.8 },
    { count: 2500, rMin: 0.5, rMax: 2.3, h: 0.2, spread: 0.25, color: 0x999999, size: 0.14, opacity: 0.4, speedMul: 0.5 },
    { count: 1500, rMin: 1.0, rMax: 3.0, h: 0.3, spread: 0.3, color: 0x666688, size: 0.2, opacity: 0.3, speedMul: 0.3 },
  ]

  refs.spiralLayers = []
  refs.spiralBases = []
  refs.spiralSpeeds = []

  layerDefs.forEach(ld => {
    const count = ld.count
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const spd = new Float32Array(count)
    const colObj = new THREE.Color(ld.color)

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const r = ld.rMin + Math.random() * (ld.rMax - ld.rMin)
      const spiral = angle + r * 2.2
      const jitter = (Math.random() - 0.5) * ld.spread * 3
      const hVar = (Math.random() - 0.5) * ld.spread
      pos[i * 3] = Math.cos(spiral) * r + jitter * 0.2
      pos[i * 3 + 1] = ld.h + hVar
      pos[i * 3 + 2] = Math.sin(spiral) * r + jitter * 0.3
      const bright = 0.7 + Math.random() * 0.3
      col[i * 3] = colObj.r * bright
      col[i * 3 + 1] = colObj.g * bright
      col[i * 3 + 2] = colObj.b * bright
      spd[i] = ld.speedMul * (0.4 + Math.random() * 0.6)
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
    const mat = MaterialLibrary.particle({ size: ld.size, vertexColors: true, opacity: ld.opacity })
    const pts = new THREE.Points(geo, mat)
    group.add(pts)
    refs.spiralLayers.push(pts)
    refs.spiralBases.push(pos.slice())
    refs.spiralSpeeds.push(spd)
  })

  // Eye wall
  const eyeGeo = GeometryFactory.torus(0.22, 0.06, 16, 48)
  eyeGeo.rotateX(Math.PI / 2)
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x445566, roughness: 0.5, metalness: 0.3, emissive: 0x222233, emissiveIntensity: 0.3 })
  refs.eyeWall = new THREE.Mesh(eyeGeo, eyeMat)
  refs.eyeWall.position.y = 0.1
  group.add(refs.eyeWall)

  // Eye center
  const eyeInner = new THREE.Mesh(
    GeometryFactory.sphere(0.18, 24),
    new THREE.MeshBasicMaterial({ color: 0x334466, transparent: true, opacity: 0.15 }),
  )
  eyeInner.position.y = 0.1
  group.add(eyeInner)

  // Rain bands
  const rainCount = 3000
  const rPos = new Float32Array(rainCount * 3)
  for (let i = 0; i < rainCount; i++) {
    const angle = Math.random() * Math.PI * 2
    const r = 0.3 + Math.random() * 3.5
    const spiral = angle + r * 2.5
    rPos[i * 3] = Math.cos(spiral) * r + (Math.random() - 0.5) * 0.15
    rPos[i * 3 + 1] = (Math.random() - 0.5) * 1.5 - 0.3
    rPos[i * 3 + 2] = Math.sin(spiral) * r + (Math.random() - 0.5) * 0.15
  }
  const rainGeo = new THREE.BufferGeometry()
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rPos, 3))
  const rainMat = MaterialLibrary.additiveParticle({ color: 0x6699cc, size: 0.025 })
  rainMat.opacity = 0.35
  refs.rain = new THREE.Points(rainGeo, rainMat)
  group.add(refs.rain)
  refs.rainBase = rPos.slice()

  // Updraft column
  const colGeo = new THREE.CylinderGeometry(0.08, 0.2, 1.2, 16)
  const colMat = new THREE.MeshBasicMaterial({ color: 0x8899aa, transparent: true, opacity: 0.12 })
  refs.updraft = new THREE.Mesh(colGeo, colMat)
  refs.updraft.position.y = 0.5
  group.add(refs.updraft)

  // Lightning flash mesh
  const lightningGeo = GeometryFactory.sphere(2.5, 8)
  const lightningMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })
  refs.lightning = new THREE.Mesh(lightningGeo, lightningMat)
  refs.lightning.position.y = 0.2
  group.add(refs.lightning)

  return refs
}

// ---- Earthquake ----
function buildEarthquake(group) {
  const refs = {}
  const gSize = 5
  const gSeg = 80
  const geo = new THREE.PlaneGeometry(gSize, gSize, gSeg, gSeg)
  geo.rotateX(-Math.PI / 2)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i)
    pos.setY(i, Math.sin(x * 3 + z * 2) * 0.03 + Math.sin(x * 7 - z * 5) * 0.015)
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x8a7a5a, roughness: 0.85, metalness: 0.05 })
  refs.ground = new THREE.Mesh(geo, groundMat)
  refs.ground.receiveShadow = true
  group.add(refs.ground)
  refs.groundBase = geo.attributes.position.array.slice()

  // Grid
  const gridHelper = new THREE.PolarGridHelper(3, 24, 16, 256, 0x5a4a3a, 0x5a4a3a)
  gridHelper.position.y = 0.005
  group.add(gridHelper)

  // Fault line
  const fp = []
  for (let i = 0; i <= 30; i++) {
    const t = i / 30
    fp.push(new THREE.Vector3(-1.8 + t * 3.6, 0.01, Math.sin(t * Math.PI * 2) * 0.3))
  }
  const faultGeo = new THREE.BufferGeometry().setFromPoints(fp)
  group.add(new THREE.Line(faultGeo, new THREE.LineBasicMaterial({ color: 0xff3333 })))
  refs.faultBase = fp

  // Buildings
  refs.buildings = []
  const bldgDefs = [
    [-1.2, -1.0, 0.4, 0xffc4a3], [0.9, 0.8, 0.55, 0xdde8f0],
    [-0.6, 0.6, 0.3, 0xe8d8c8], [0.7, -0.7, 0.45, 0xc8dce8],
    [-0.3, -1.1, 0.25, 0xf0e0d0], [0.4, 0.3, 0.35, 0xd0d8e0],
    [-0.9, 0.8, 0.5, 0xe0d0c0], [1.0, -0.2, 0.6, 0xd8e4f0],
    [-0.5, -0.4, 0.2, 0xf5e8d8], [0.2, -1.0, 0.3, 0xdce8f4],
    [0.5, 0.9, 0.38, 0xf0e4d4], [-1.1, -0.6, 0.42, 0xe0e8f0],
    [0.8, 0.2, 0.28, 0xd4dce8], [-0.7, -0.8, 0.22, 0xf8ece0],
    [0.0, -0.6, 0.48, 0xd8e4ec], [-1.3, 0.3, 0.35, 0xe4d4c4],
    [1.1, 0.6, 0.32, 0xcce0f0], [0.3, -0.4, 0.5, 0xdce4ec],
    [-0.2, 1.0, 0.28, 0xf0e8dc], [0.6, -1.2, 0.38, 0xe0e4ec],
  ]
  bldgDefs.forEach(([bx, bz, h, clr]) => {
    const w = 0.06 + Math.random() * 0.1, d = 0.06 + Math.random() * 0.1
    const bldg = new THREE.Mesh(
      GeometryFactory.box(w, h, d),
      new THREE.MeshStandardMaterial({ color: clr, roughness: 0.6 }),
    )
    bldg.position.set(bx, h / 2, bz)
    bldg.castShadow = true; bldg.receiveShadow = true
    group.add(bldg)
    refs.buildings.push({ mesh: bldg, baseY: h / 2 })
  })

  // Seismic wave rings
  const rings = []
  for (let j = 0; j < 3; j++) {
    const ringGeo = GeometryFactory.ring(0.1, 0.15, 48)
    ringGeo.rotateX(-Math.PI / 2)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff6644, transparent: true, opacity: 0.3,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.position.y = 0.01
    ring.visible = false
    ring.userData = { phase: j * 0.33, baseScale: 0.2 }
    group.add(ring)
    rings.push(ring)
  }
  refs.seismicRings = rings

  return refs
}

// ---- Main module ----
export function DisasterModule(scene, params, services) {
  const group = new THREE.Group()
  const activeModule = params.activeModule || 'typhoon'
  const timeline = params.timeline || 0
  let refs = {}
  let subGroup = new THREE.Group()

  function clearSub() {
    group.remove(subGroup)
    subGroup.traverse(c => {
      if (c.geometry) c.geometry.dispose()
      if (c.material) c.material.dispose()
    })
    subGroup = new THREE.Group()
    refs = {}
  }

  function buildSub(type) {
    clearSub()
    switch (type) {
      case 'typhoon': refs = buildTyphoon(subGroup); break
      case 'earthquake': refs = buildEarthquake(subGroup); break
      case 'landslide': break
      case 'flood': break
    }
    group.add(subGroup)
  }

  buildSub(activeModule)

  const api = {
    update(dt, elapsed) {
      if (activeModule === 'typhoon' && refs.spiralLayers) {
        refs.spiralLayers.forEach((layer, li) => {
          const pos = layer.geometry.attributes.position.array
          const base = refs.spiralBases[li]
          const speeds = refs.spiralSpeeds[li]
          for (let i = 0; i < pos.length / 3; i++) {
            const angle = Math.atan2(base[i * 3 + 2], base[i * 3])
            const newAngle = angle + dt * speeds[i] * 0.8
            const r = Math.sqrt(base[i * 3] ** 2 + base[i * 3 + 2] ** 2)
            pos[i * 3] = Math.cos(newAngle) * r
            pos[i * 3 + 2] = Math.sin(newAngle) * r
          }
          layer.geometry.attributes.position.needsUpdate = true
        })
        // Sea wave animation
        if (refs.sea) {
          const seaPos = refs.sea.geometry.attributes.position.array
          for (let i = 0; i < seaPos.length / 3; i++) {
            const base = refs.seaVerts[i * 3 + 1]
            const dist = Math.sqrt(
              refs.seaVerts[i * 3] ** 2 + refs.seaVerts[i * 3 + 2] ** 2
            )
            seaPos[i * 3 + 1] = base + Math.sin(dist * 3 - elapsed * 2) * 0.04
          }
          refs.sea.geometry.attributes.position.needsUpdate = true
          refs.sea.geometry.computeVertexNormals()
        }
        // Lightning random flash
        if (refs.lightning) {
          const shouldFlash = Math.random() < 0.008
          refs.lightning.material.opacity = shouldFlash ? 0.15 : Math.max(0, refs.lightning.material.opacity - 0.02)
        }
      }
      if (activeModule === 'earthquake' && refs.seismicRings) {
        refs.seismicRings.forEach(ring => {
          ring.userData.phase += dt * 0.6
          if (ring.userData.phase > 1) ring.userData.phase -= 1
          const scale = ring.userData.baseScale + ring.userData.phase * 4
          ring.scale.set(scale, scale, scale)
          ring.material.opacity = 0.3 * (1 - ring.userData.phase)
          ring.visible = true
        })
        // Building shake
        if (refs.buildings && timeline > 0.3) {
          const shakeIntensity = (timeline - 0.3) * 0.05
          refs.buildings.forEach(b => {
            b.mesh.position.y = b.baseY + Math.sin(elapsed * 25 + b.mesh.position.x * 10) * shakeIntensity
          })
        }
      }
    },
    setMode(mode) {},
    setParams(p) {
      if (p.activeModule && p.activeModule !== activeModule) {
        buildSub(p.activeModule)
      }
      if (p.timeline !== undefined) {
        timeline = p.timeline
      }
    },
    dispose() { clearSub() },
  }
  group.userData = { api }

  return group
}
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/modules/DisasterModule.js
git commit -m "feat: add DisasterModule with typhoon and earthquake"
```

---

### Task 18: Adapt Earth3D.vue to use BaseScene

**Files:**
- Modify: `src/sandbox/Earth3D.vue`

- [ ] **Step 1: Rewrite Earth3D.vue script section**

Read the current file to identify the script section, then replace the Three.js setup with BaseScene:
```vue
<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { BaseScene } from '../engine/core/BaseScene.js'
import { EarthInteriorModule } from '../engine/modules/EarthInteriorModule.js'
import { CelestialSphereModule } from '../engine/modules/CelestialSphereModule.js'
import { SolarSystemModule } from '../engine/modules/SolarSystemModule.js'
import { PostProcessing } from '../engine/effects/PostProcessing.js'

const containerRef = ref(null)
const mode = ref('simple')
const activeCoord = ref('horizontal')
const selectedObj = ref('sirius_a')
const coordDesc = ref('')
const currentCoords = ref({})
let engine = null
let postFx = null

const coordSystems = [
  { id: 'horizontal', label: '地平坐标系' },
  { id: 'equatorial', label: '赤道坐标系' },
  { id: 'ecliptic', label: '黄道坐标系' },
  { id: 'galactic', label: '银道坐标系' },
]

const celestialObjects = [
  { id:'sirius_a', name:'天狼星A', type:'主序星', labelColor:'#add8ff', pos:[1.6,-0.5,1.5], color:0xadd8ff, size:0.08 },
  { id:'betelgeuse', name:'参宿四', type:'红超巨星', labelColor:'#ff6666', pos:[-1.3,1.2,1.2], color:0xff4444, size:0.14 },
  { id:'sirius_b', name:'天狼星B', type:'白矮星', labelColor:'#cccccc', pos:[1.4,-0.7,1.7], color:0xeeeeee, size:0.05 },
  { id:'cygnus_x1', name:'天鹅座X-1', type:'黑洞', labelColor:'#cc66ff', pos:[-1.0,0.8,-1.8], color:0x440044, size:0.04 },
  { id:'crab_pulsar', name:'蟹状星云脉冲星', type:'中子星', labelColor:'#00ffcc', pos:[0.3,-1.5,1.6], color:0x00ffcc, size:0.06 },
]

const planetData = [
  { name:'水星', au:'0.39', period:0.24, orbitV:'47.9' },
  { name:'金星', au:'0.72', period:0.62, orbitV:'35.0' },
  { name:'地球', au:'1.00', period:1.0, orbitV:'29.8' },
  { name:'火星', au:'1.52', period:1.88, orbitV:'24.1' },
  { name:'木星', au:'5.20', period:11.86, orbitV:'13.1' },
  { name:'土星', au:'9.54', period:29.46, orbitV:'9.7' },
]

const descs = {
  horizontal: `<h3>地平坐标系</h3><p>以地平圈为基准。高度 h (0°~90°)，方位角 A (0°~360° 顺时针从北量度)。直观但随时间地点变化。</p>`,
  equatorial: `<h3>赤道坐标系</h3><p>以天赤道为基准。赤纬 δ (-90°~+90°)，赤经 α (0h~24h 从春分点向东)。恒星坐标固定不变。</p>`,
  ecliptic: `<h3>黄道坐标系</h3><p>以黄道面（地球公转轨道面，倾斜23.44°）为基准。黄纬 β，黄经 λ。用于行星运动计算。</p>`,
  galactic: `<h3>银道坐标系</h3><p>以银河系盘面为基准（倾斜约62.6°）。银纬 b，银经 l。用于银河系结构研究。</p>`,
}

const objCoords = {
  horizontal: { sirius_a:'h=35° A=135°', betelgeuse:'h=52° A=225°', sirius_b:'h=32° A=140°', cygnus_x1:'h=30° A=300°', crab_pulsar:'h=10° A=25°' },
  equatorial: { sirius_a:'δ=-17° α=6h45m', betelgeuse:'δ=+7° α=5h55m', sirius_b:'δ=-17° α=6h45m', cygnus_x1:'δ=+35° α=19h58m', crab_pulsar:'δ=+22° α=5h35m' },
  ecliptic: { sirius_a:'β=-39° λ=103°', betelgeuse:'β=-16° λ=88°', sirius_b:'β=-39° λ=103°', cygnus_x1:'β=+5° λ=61°', crab_pulsar:'β=-17° λ=85°' },
  galactic: { sirius_a:'b=-33° l=227°', betelgeuse:'b=-14° l=210°', sirius_b:'b=-33° l=227°', cygnus_x1:'b=+4° l=72°', crab_pulsar:'b=-2° l=184°' },
}

const EARTH_R = 1.8
const MARS_R = 2.4

function switchMode(m) {
  mode.value = m
  if (m === 'simple') engine.loadModule(EarthInteriorModule, { mode: 'simple' })
  else if (m === 'professional') {
    engine.loadModule(CelestialSphereModule)
    coordDesc.value = descs.horizontal
    currentCoords.value = objCoords.horizontal
  } else if (m === 'deepspace') {
    engine.loadModule(SolarSystemModule)
    postFx?.enableBloom({ threshold: 0.1, strength: 0.6, radius: 0.5 })
  }
  if (m !== 'deepspace') postFx?.disableBloom()
}

function switchCoord(id) {
  activeCoord.value = id
  coordDesc.value = descs[id] || ''
  currentCoords.value = objCoords[id] || ''
}

function selectObj(id) {
  selectedObj.value = id
}

onMounted(async () => {
  await nextTick()
  if (!containerRef.value) return
  engine = new BaseScene(containerRef.value, { bg: 0x0a0a1a, mode: 'simple' })
  postFx = new PostProcessing(engine.renderManager)
  engine.loadModule(EarthInteriorModule, { mode: 'simple' })
  window.addEventListener('resize', () => engine.resize())
})

onBeforeUnmount(() => {
  engine?.dispose()
})
</script>
```

**Note for executor:** Read `src/sandbox/Earth3D.vue` before editing. Keep the template and style sections unchanged. Replace only the `<script setup>` block (lines 82-413) with the above, keeping the template {{ }} bindings compatible. Adjust reactive refs as needed to match existing template references.

- [ ] **Step 2: Verify build**

```bash
pnpm build
```

Expected: build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/sandbox/Earth3D.vue
git commit -m "refactor: adapt Earth3D to use BaseScene with module switching"
```

---

### Task 19: Adapt AtmosphereViewer.vue to use BaseScene

**Files:**
- Modify: `src/textbook/components/AtmosphereViewer.vue`

- [ ] **Step 1: Rewrite script section**

```vue
<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { BaseScene } from '../../engine/core/BaseScene.js'
import { AtmosphereModule } from '../../engine/modules/AtmosphereModule.js'

const props = defineProps({
  mode: { type: String, default: 'simple' },
  defaultTab: { type: Number, default: 0 },
})

const tabs = ['垂直分层', '大气组成', '受热过程', '三圈环流']
const activeTab = ref(props.defaultTab || 0)
const currentMode = ref(props.mode)
const sceneContainer = ref(null)
let engine = null

watch(activeTab, (val) => {
  engine?.setParams({ theme: val })
})

onMounted(() => {
  engine = new BaseScene(sceneContainer.value, {
    bg: 0x0a0e27,
    mode: currentMode.value,
    lightPreset: 'sunlit',
  })
  engine.setParams({ theme: activeTab.value })
  window.addEventListener('resize', () => engine.resize())
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', () => {})
  engine?.dispose()
})

function setMode(m) {
  currentMode.value = m
  engine?.setMode(m)
}
</script>
```

Keep template and style sections unchanged.

- [ ] **Step 2: Commit**

```bash
git add src/textbook/components/AtmosphereViewer.vue
git commit -m "refactor: adapt AtmosphereViewer to use BaseScene"
```

---

### Task 20: Adapt SoilProfilePage.vue, SandboxApp.vue, DisasterSandbox.vue

**Files:**
- Modify: `src/soil-profile/SoilProfilePage.vue`
- Modify: `src/sandbox/SandboxApp.vue`
- Modify: `src/sandbox/DisasterSandbox.vue`

- [ ] **Step 1: Adapt SoilProfilePage.vue**

Read the file, replace the Three.js scene setup with:
```js
import { BaseScene } from '../engine/core/BaseScene.js'
import { SoilProfileModule } from '../engine/modules/SoilProfileModule.js'

onMounted(async () => {
  await nextTick()
  engine = new BaseScene(containerRef.value, { bg: 0xf5efe8, mode: 'simple', labels: true })
  engine.loadModule(SoilProfileModule, { mode: 'simple' })
})

function switchMode(m) {
  engine.setMode(m)
  engine.loadModule(SoilProfileModule, { mode: m })
}
```

**Note for executor:** Read the full file before editing. Preserve all existing UI (mode switching, info panel, InfoPopup). Only replace the Three.js initialization. The existing `soilScene.js` import should be replaced with engine imports.

- [ ] **Step 2: Adapt SandboxApp.vue**

Read the file, replace SceneEngine import with:
```js
import { BaseScene } from '../engine/core/BaseScene.js'
import { LandformModule } from '../engine/modules/LandformModule.js'

onMounted(async () => {
  await nextTick()
  engine = new BaseScene(viewportRef.value, { bg: 0xf5efe8, mode: 'simple', lightPreset: 'studio' })
  engine.loadModule(LandformModule, { mode: 'simple', activeModule: activeModule.value, timeline: timeline.value, climateFactor: climateFactor.value })
})

function selectModule(id) {
  activeModule.value = id
  engine.setParams({ activeModule: id })
  engine.loadModule(LandformModule, { mode: mode.value, activeModule: id, timeline: timeline.value, climateFactor: climateFactor.value })
}
```

**Note for executor:** Read the full file before editing. Preserve all existing UI (landform selector, timeline, climate sliders, info panel). Only replace the SceneEngine import and init.

- [ ] **Step 3: Adapt DisasterSandbox.vue**

Read the file, replace DisasterEngine import with:
```js
import { BaseScene } from '../engine/core/BaseScene.js'
import { DisasterModule } from '../engine/modules/DisasterModule.js'

onMounted(async () => {
  await nextTick()
  engine = new BaseScene(viewportRef.value, { bg: 0x1a1a2e, mode: 'simple', lightPreset: 'dramatic' })
  engine.loadModule(DisasterModule, { mode: 'simple', activeModule: activeModule.value })
})

function selectModule(id) {
  activeModule.value = id
  engine.setParams({ activeModule: id })
}
```

**Note for executor:** Read the full file before editing. Preserve all existing UI (disaster type selector, timeline slider, info panel, glossary popup). Only replace the DisasterEngine import and init.

- [ ] **Step 4: Build and verify**

```bash
pnpm build
```

- [ ] **Step 5: Commit**

```bash
git add src/soil-profile/SoilProfilePage.vue src/sandbox/SandboxApp.vue src/sandbox/DisasterSandbox.vue
git commit -m "refactor: adapt soil/sandbox/disaster views to BaseScene"
```

---

### Task 21: Add Chapter 3 toggle to SectionContent.vue

**Files:**
- Modify: `src/textbook/SectionContent.vue`

- [ ] **Step 1: Add water chapter detection and toggle**

Read the file, add after the existing atmosphere chapter section (after line 67):

In the template section, add the water chapter toggle:
```vue
<!-- 3D 水循环切换（第三章地球上的水专用） -->
<div v-if="isWaterChapter" class="sandbox-toggle-bar">
  <button
    :class="['sandbox-toggle', { active: !showWater }]"
    @click="showWater = false"
  >📖 课文</button>
  <button
    :class="['sandbox-toggle', { active: showWater }]"
    @click="showWater = true"
  >💧 3D 水循环</button>
</div>
```

In the template, add the water view after the atmosphere view (after line 176):
```vue
<!-- 3D 水循环视图 -->
<WaterCycleView v-else-if="showWater" />
```

In the script setup, add:
```js
import WaterCycleView from '../engine/WaterCycleView.vue'

const showWater = ref(false)
const isWaterChapter = computed(() =>
  gradeId.value === '高中' && bookId.value === '必修第一册' && chapterId.value === '第三章'
)
```

- [ ] **Step 2: Create WaterCycleView.vue wrapper**

Create `src/engine/WaterCycleView.vue`:
```vue
<template>
  <div class="watercycle-root">
    <div class="watercycle-topbar">
      <button class="back-link" @click="$emit('close')">← 返回课文</button>
      <button
        :class="['mode-btn', { active: currentMode === 'simple' }]"
        @click="setMode('simple')"
      >高中</button>
      <button
        :class="['mode-btn', { active: currentMode === 'professional' }]"
        @click="setMode('professional')"
      >大学</button>
      <label class="speed-control">
        <span>循环速度</span>
        <input type="range" min="0" max="1" step="0.01" v-model.number="timeline" @input="onTimeline">
      </label>
      <span class="chapter-ref">第三章 · 地球上的水</span>
    </div>
    <div ref="containerRef" class="watercycle-canvas"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { BaseScene } from './core/BaseScene.js'
import { WaterCycleModule } from './modules/WaterCycleModule.js'

const emit = defineEmits(['close'])
const containerRef = ref(null)
const currentMode = ref('simple')
const timeline = ref(0)
let engine = null

function setMode(m) {
  currentMode.value = m
  engine?.setMode(m)
}

function onTimeline() {
  engine?.setParams({ timeline: timeline.value })
}

onMounted(async () => {
  await nextTick()
  engine = new BaseScene(containerRef.value, { bg: 0x1a2a3a, mode: 'simple', lightPreset: 'sunlit' })
  engine.loadModule(WaterCycleModule, { mode: 'simple', timeline: 0 })
})

onBeforeUnmount(() => engine?.dispose())
</script>

<style scoped>
.watercycle-root { display: flex; flex-direction: column; height: calc(100vh - 96px); background: #0a1a2a; }
.watercycle-topbar { display: flex; align-items: center; gap: 14px; padding: 8px 18px; border-bottom: 1px solid #333; background: rgba(10,20,30,0.95); flex-shrink: 0; }
.back-link { color: #60a5fa; text-decoration: none; font-size: 13px; font-weight: 600; border: none; background: none; cursor: pointer; }
.mode-btn { border: 1px solid #444; border-radius: 6px; padding: 5px 14px; font-size: 13px; background: #fff; color: #6b3b32; cursor: pointer; }
.mode-btn.active { background: #3b82f6; color: #fff; border-color: #3b82f6; }
.speed-control { display: flex; align-items: center; gap: 6px; margin: 0 auto; color: #aaa; font-size: 12px; }
.speed-control input { width: 120px; accent-color: #3b82f6; }
.chapter-ref { font-size: 12px; color: #555; }
.watercycle-canvas { flex: 1; }
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/engine/WaterCycleView.vue src/textbook/SectionContent.vue
git commit -m "feat: add water cycle 3D view for Chapter 3"
```

---

### Task 22: Remove old engine files

**Files:**
- Remove: `src/lib/atmosphereScene.js`
- Remove: `src/lib/terrainModifiers.js`
- Remove: `src/sandbox/engine/SceneEngine.js`
- Remove: `src/sandbox/engine/DisasterEngine.js`
- Remove: `src/soil-profile/soilScene.js`

- [ ] **Step 1: Remove files and verify build**

```bash
rm src/lib/atmosphereScene.js
rm src/lib/terrainModifiers.js
rm src/sandbox/engine/SceneEngine.js
rm src/sandbox/engine/DisasterEngine.js
rm src/soil-profile/soilScene.js
pnpm build
```

- [ ] **Step 2: If build fails, fix any remaining imports**

Check for stale imports to deleted files:
```bash
grep -r "atmosphereScene\|terrainModifiers\|SceneEngine\|DisasterEngine\|soilScene" src/ --include="*.js" --include="*.vue" || echo "No stale imports"
```

Fix any stale imports found by replacing with the new engine imports.

- [ ] **Step 3: Rebuild and commit**

```bash
pnpm build
git add -A
git commit -m "chore: remove old scene engines, replaced by src/engine/"
```

---

### Task 23: Final integration and build verification

- [ ] **Step 1: Full production build**

```bash
pnpm build
```

Expected: build succeeds with no errors.

- [ ] **Step 2: Start dev server and test all views**

```bash
pnpm dev
```

Verify these URLs render without errors:
- `http://127.0.0.1:4173/#/高中/必修第一册/第一章/第一节` → toggle "3D 地球探索"
- `http://127.0.0.1:4173/#/高中/必修第一册/第二章/第一节` → toggle "3D 大气模型"
- `http://127.0.0.1:4173/#/高中/必修第一册/第三章/第一节` → toggle "3D 水循环"
- `http://127.0.0.1:4173/#/高中/必修第一册/第四章/第一节` → toggle "3D 沙盘"
- `http://127.0.0.1:4173/#/高中/必修第一册/第五章/第一节` → toggle "3D 土壤剖面"
- `http://127.0.0.1:4173/#/高中/必修第一册/第六章/第一节` → toggle "3D 灾害模拟"

- [ ] **Step 3: Commit final fixes**

```bash
git add -A
git commit -m "chore: final integration fixes and verification"
```
