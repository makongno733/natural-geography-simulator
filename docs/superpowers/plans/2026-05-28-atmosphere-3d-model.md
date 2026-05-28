# 地球大气 3D 互动模型实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为必修第一册第二章「地球上的大气」创建嵌入式 3D 互动模型，支持四种主题（垂直分层/大气组成/受热过程/三圈环流）和高中/大学双模式切换。

**Architecture:** 新增 `atmosphereScene.js`（Three.js 场景类）和 `AtmosphereViewer.vue`（Vue 封装组件）。AtmosphereViewer 通过 props 接收 mode（'simple'|'professional'），内部管理 theme Tab 切换。场景类负责所有 Three.js 渲染逻辑，Vue 组件负责交互 UI。`@takram/three-atmosphere` 提供预计算大气散射。

**Tech Stack:** Three.js ^0.184.0 + @takram/three-atmosphere + Vue 3

---

### 前置：安装依赖

- [ ] **Step 1: 安装 @takram/three-atmosphere**

```bash
cd /Users/kongnoma/Documents/New\ project
pnpm add @takram/three-atmosphere
```

预期：安装成功，无报错。

- [ ] **Step 2: 提交**

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat: add @takram/three-atmosphere dependency"
```

---

### Task 1: 创建垂直分层场景

**Files:**
- Create: `src/lib/atmosphereScene.js`

创建 `atmosphereScene.js` 基础类，包含场景/相机/渲染器初始化，以及垂直分层主题（theme 0）。

- [ ] **Step 1: 创建 atmosphereScene.js 基础框架**

```js
import * as THREE from 'three'
import { Atmosphere, Sky, AerialPerspective } from '@takram/three-atmosphere'
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

    this._initRenderer(container)
    this._initScene()
    this._initCamera()
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
    const renderPass = new RenderPass(this.scene, this.camera)
    this.composer.addPass(renderPass)
  }

  _initScene() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x0a0e27)
  }

  _initCamera() {
    const container = this.renderer.domElement.parentElement
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
      const atmo = new Atmosphere({ date: new Date() })
      const sky = new Sky({ atmosphere: atmo })
      this.scene.add(sky)
      this.atmo = atmo
    } catch (e) {
      console.warn('@takram/three-atmosphere not available, falling back', e)
    }
  }

  _initControls() {
    this.isDragging = false
    this._prevX = 0; this._prevY = 0
    this._rotX = 0.3; this._rotY = 0
    this._camDist = 10
    const el = this.renderer.domElement

    el.addEventListener('mousedown', (e) => { this.isDragging = true; this._prevX = e.clientX; this._prevY = e.clientY })
    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return
      const dx = e.clientX - this._prevX; const dy = e.clientY - this._prevY
      this._rotY += dx * 0.005; this._rotX += dy * 0.005
      this._rotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this._rotX))
      this._prevX = e.clientX; this._prevY = e.clientY
    })
    window.addEventListener('mouseup', () => { this.isDragging = false })

    el.addEventListener('wheel', (e) => {
      this._camDist = Math.max(3, Math.min(30, this._camDist + e.deltaY * 0.01))
    })
  }

  _setCamLookAt(target, distance) {
    // For theme camera presets: update rotation angles from position
    // Calculate spherical coords: theta (yaw), phi (pitch)
    this._camDist = distance || this._camDist
    // Reset position manually and let _updateOrbit take over next frame
    const d = this._camDist
    this.camera.position.set(0, 0, d)
    this._rotX = 0; this._rotY = 0
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
    // Rebuild current theme with new detail level
    const cur = this.theme
    this._clearTheme()
    this.setTheme(cur)
  }

  _clearTheme() {
    // Remove theme-specific objects (subclass responsibility)
  }

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
    this.earth.rotation.y += 0.001
    this.composer.render()
  }

  dispose() {
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }
}
```

- [ ] **Step 2: 添加垂直分层方法**

在 `setTheme` case 0 和 `_clearTheme` 后添加实现：

```js
// 在 _clearTheme 之后添加以下方法

_showVerticalLayers() {
  const earthRadius = 1.8
  const layers = this.mode === 'simple'
    ? ['对流层', '平流层', '中间层', '热层', '散逸层']
    : ['对流层', '平流层', '中间层', '热层', '散逸层']

  layers.forEach((name) => {
    const h = LAYER_HEIGHTS[name]
    const outerR = earthRadius + (h.max / 1000) * 6 // scale height to scene units
    const innerR = earthRadius + (h.min / 1000) * 6
    const r = (outerR + innerR) / 2
    const thickness = outerR - innerR

    const geo = new THREE.SphereGeometry(r, 48, 48)
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      depthWrite: false,
      uniforms: {
        uColor: { value: new THREE.Color(h.color) },
        uThickness: { value: thickness },
        uInnerR: { value: innerR },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec3 vNormal;
        varying vec3 vPosition;
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

  // Height labels - use CSS2DRenderer or sprites
  // For now, skip labels and add later with CSS2DRenderer
}

_clearTheme() {
  this.layers.forEach(m => { this.scene.remove(m); m.geometry.dispose(); m.material.dispose() })
  this.layers = []
  this.particleSystems.forEach(p => { this.scene.remove(p); p.geometry.dispose(); p.material.dispose() })
  this.particleSystems = []
  this.radiationPaths.forEach(p => { this.scene.remove(p); p.geometry.dispose(); p.material.dispose() })
  this.radiationPaths = []
  this.circulationParticles.forEach(p => { this.scene.remove(p); p.geometry.dispose(); p.material.dispose() })
  this.circulationParticles = []
}
```

替换 `_clearTheme` 中的空实现为上述完整实现。

- [ ] **Step 3: 提交**

```bash
git add src/lib/atmosphereScene.js
git commit -m "feat: create AtmosphereScene base class with vertical layers theme"
```

---

### Task 2: 创建 AtmosphereViewer.vue 容器组件

**Files:**
- Create: `src/textbook/components/AtmosphereViewer.vue`

Vue 组件负责：工具栏（Tab 切换 + 模式开关）、挂载 3D 场景、响应窗口大小变化。

- [ ] **Step 1: 创建 AtmosphereViewer.vue**

```vue
<template>
  <section class="atmo-viewer">
    <div class="atmo-toolbar">
      <div class="atmo-tabs">
        <button
          v-for="(tab, i) in tabs"
          :key="i"
          :class="['atmo-tab', { active: activeTab === i }]"
          @click="activeTab = i"
        >
          {{ tab }}
        </button>
      </div>
      <div class="atmo-mode">
        <span class="mode-label">模式</span>
        <button
          :class="['mode-btn', { active: currentMode === 'simple' }]"
          @click="setMode('simple')"
        >高中</button>
        <button
          :class="['mode-btn', { active: currentMode === 'professional' }]"
          @click="setMode('professional')"
        >大学</button>
      </div>
    </div>
    <div ref="sceneContainer" class="atmo-canvas"></div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import AtmosphereScene from '../../lib/atmosphereScene.js'

const props = defineProps({
  mode: { type: String, default: 'simple' },
})

const tabs = ['垂直分层', '大气组成', '受热过程', '三圈环流']
const activeTab = ref(0)
const currentMode = ref(props.mode)
const sceneContainer = ref(null)
let scene = null

function setMode(m) {
  currentMode.value = m
  if (scene) scene.setMode(m)
}

watch(activeTab, (val) => {
  if (scene) scene.setTheme(val)
})

function handleResize() {
  if (scene) scene.resize()
}

onMounted(() => {
  scene = new AtmosphereScene(sceneContainer.value, currentMode.value)
  scene.setTheme(0)

  let running = true
  function loop() {
    if (!running) return
    scene.render()
    requestAnimationFrame(loop)
  }
  loop()

  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (scene) scene.dispose()
})
</script>

<style scoped>
.atmo-viewer {
  border: 1px solid #e2c9b4;
  border-radius: 10px;
  background: rgba(255,255,255,0.94);
  overflow: hidden;
  margin-bottom: 16px;
}
.atmo-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #e2c9b4;
  background: #fcf9f5;
}
.atmo-tabs {
  display: flex;
  gap: 2px;
}
.atmo-tab {
  border: none;
  background: transparent;
  padding: 5px 14px;
  font-size: 13px;
  color: #6b3b32;
  cursor: pointer;
  border-radius: 6px;
  font-family: inherit;
  transition: background 0.15s, color 0.15s;
}
.atmo-tab:hover { background: #f5ede8; }
.atmo-tab.active {
  background: #b01217;
  color: #fff;
  font-weight: 600;
}
.atmo-mode {
  display: flex;
  align-items: center;
  gap: 4px;
}
.mode-label {
  font-size: 11px;
  color: #b85a4d;
  margin-right: 2px;
}
.mode-btn {
  border: 1px solid #e2c9b4;
  background: #fff;
  padding: 3px 10px;
  font-size: 11px;
  color: #6b3b32;
  cursor: pointer;
  border-radius: 4px;
  font-family: inherit;
}
.mode-btn.active {
  background: #b01217;
  color: #fff;
  border-color: #b01217;
}
.atmo-canvas {
  width: 100%;
  height: 400px;
  display: block;
}
@media (max-width: 720px) {
  .atmo-canvas { height: 280px; }
  .atmo-toolbar { flex-wrap: wrap; gap: 6px; }
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add src/textbook/components/AtmosphereViewer.vue
git commit -m "feat: create AtmosphereViewer container component"
```

---

### Task 3: 集成到 SectionContent.vue

**Files:**
- Modify: `src/textbook/SectionContent.vue`

在内容区替换 3D 预留位，当章节匹配时显示 AtmosphereViewer。

- [ ] **Step 1: 在 SectionContent.vue 模板中替换预留位**

在 `src/textbook/SectionContent.vue` 中找到以下行：

```html
        <div class="reserved-slot" v-if="!sectionData.content.interactive">
          <span class="slot-label">3D 互动预留位</span>
        </div>
```

替换为：

```html
        <AtmosphereViewer
          v-if="showAtmosphereViewer"
          :mode="atmosphereMode"
        />
```

- [ ] **Step 2: 在 script setup 中添加导入和计算属性**

在 `src/textbook/SectionContent.vue` 的 `<script setup>` 中添加：

```js
import AtmosphereViewer from './components/AtmosphereViewer.vue'

// 在现有 computed 之后添加：
const showAtmosphereViewer = computed(() => {
  // Show for 高中 必修第一册 第二章 or 大学 自然地理学 第三章
  const isHighSchoolChapter2 = gradeId.value === '高中' && bookId.value === '必修第一册' && chapterId.value === '第二章'
  const isUniversityChapter3 = gradeId.value === '大学' && bookId.value === '自然地理学' && chapterId.value === '第三章'
  return isHighSchoolChapter2 || isUniversityChapter3
})

const atmosphereMode = computed(() => {
  return gradeId.value === '大学' ? 'professional' : 'simple'
})
```

- [ ] **Step 3: 设置默认 Tab**

对于第二章第一节（大气的组成和垂直分层），默认 Tab 应为 0（垂直分层）；第二节（大气受热过程和大气运动）默认 Tab 应为 2（受热过程）。这些通过 AtmosphereViewer 的 props 传递。

修改 AtmosphereViewer.vue 添加 props：

在 `AtmosphereViewer.vue` 的 `<script setup>` 中增加：

```js
const props = defineProps({
  mode: { type: String, default: 'simple' },
  defaultTab: { type: Number, default: 0 },
})

// 修改 onMounted
onMounted(() => {
  activeTab.value = props.defaultTab || 0  // 新增
  scene = new AtmosphereScene(sceneContainer.value, currentMode.value)
  scene.setTheme(activeTab.value)  // 修改: 使用 activeTab.value
  // ...
})
```

在 `SectionContent.vue` 中更新 AtmosphereViewer 调用：

```html
<AtmosphereViewer
  v-if="showAtmosphereViewer"
  :mode="atmosphereMode"
  :defaultTab="atmosphereDefaultTab"
/>
```

添加：

```js
const atmosphereDefaultTab = computed(() => {
  if (gradeId.value !== '高中' || bookId.value !== '必修第一册') return 0
  // 第二章第一节 → 垂直分层，第二节 → 受热过程
  return sectionId.value === '第二节' ? 2 : 0
})
```

- [ ] **Step 4: 提交**

```bash
git add src/textbook/SectionContent.vue src/textbook/components/AtmosphereViewer.vue
git commit -m "feat: integrate AtmosphereViewer into SectionContent for Chapter 2"
```

---

### Task 4: 构建验证

**Files:**
- Build check only

- [ ] **Step 1: 完整构建**

```bash
cd /Users/kongnoma/Documents/New\ project
pnpm build
```

预期：构建成功，无报错。

- [ ] **Step 2: 预览检查**

```bash
pnpm dev
```

然后访问 `http://127.0.0.1:4173/#/高中/必修第一册/第二章/第一节`，预期：
- 内容区显示 AtmosphereViewer
- 默认 Tab 为「垂直分层」
- 3D 地球与半透明大气层渲染
- 拖拽旋转/滚轮缩放正常工作

检查 `http://127.0.0.1:4173/#/高中/必修第一册/第二章/第二节`，预期：
- 默认 Tab 为「受热过程」

检查非第二章页面，预期：
- 不显示 AtmosphereViewer

- [ ] **Step 3: 提交**

```bash
git add -A
git commit -m "chore: atmosphere 3D model Phase 1 - basic scene with vertical layers"
```

---

### Task 5: 大气组成主题（粒子系统）

**Files:**
- Modify: `src/lib/atmosphereScene.js`

在 AtmosphereScene 中添加大气组成粒子系统（`_showComposition` 和 `_composeParticles` 辅助方法）。

- [ ] **Step 1: 添加大气组成粒子方法**

在 `_showComposition` 方法中添加：

```js
_showComposition() {
  this._setCamPosition(0, 0, 4.5)

  const particles = this.mode === 'simple'
    ? [
        { name: 'N₂', color: 0x4488ff, ratio: 0.78, count: 4000, heightRange: [0, 12] },
        { name: 'O₂', color: 0x44cc44, ratio: 0.21, count: 2000, heightRange: [0, 12] },
        { name: 'CO₂', color: 0x888888, ratio: 0.0004, count: 500, heightRange: [0, 20] },
        { name: 'H₂O', color: 0xffffff, ratio: 0.01, count: 1000, heightRange: [0, 3] },
      ]
    : [
        { name: 'N₂', color: 0x4488ff, ratio: 0.78, count: 6000, heightRange: [0, 85] },
        { name: 'O₂', color: 0x44cc44, ratio: 0.21, count: 3000, heightRange: [0, 85] },
        { name: 'CO₂', color: 0x888888, ratio: 0.0004, count: 800, heightRange: [0, 20] },
        { name: 'H₂O', color: 0xffffff, ratio: 0.01, count: 1500, heightRange: [0, 3] },
        { name: 'O₃', color: 0xaa66ff, ratio: 0.000004, count: 600, heightRange: [15, 35] },
        { name: '尘埃', color: 0x886644, ratio: 0.000001, count: 400, heightRange: [0, 2] },
        { name: 'Ar', color: 0xffdd88, ratio: 0.009, count: 400, heightRange: [0, 85] },
      ]

  const earthRadius = 1.8
  const scale = 6 / 1000 // scene units per km

  particles.forEach((p) => {
    const positions = new Float32Array(p.count * 3)
    const colors = new Float32Array(p.count * 3)
    const col = new THREE.Color(p.color)

    for (let i = 0; i < p.count; i++) {
      // Random position on sphere surface + random height
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const height = (p.heightRange[0] + Math.random() * (p.heightRange[1] - p.heightRange[0])) * scale
      const r = earthRadius + height

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
    points.userData = { type: 'composition', name: p.name }
    this.scene.add(points)
    this.particleSystems.push(points)
  })
}
```

- [ ] **Step 2: 更新 setTheme case 1**

确保 `setTheme` 中 case 1 已调用 `_showComposition`：

```js
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
```

- [ ] **Step 3: 提交**

```bash
git add src/lib/atmosphereScene.js
git commit -m "feat: add atmospheric composition particle system"
```

---

### Task 6: 受热过程和三圈环流主题

**Files:**
- Modify: `src/lib/atmosphereScene.js`

- [ ] **Step 1: 添加受热过程方法**

```js
_showRadiation() {
  this._setCamPosition(5, 2, 8)

  // Sun position indicator
  const sunPos = new THREE.Vector3(8, 5, 6)

  // Draw 3 radiation paths with animated particles
  const paths = this.mode === 'simple'
    ? [
        { label: '太阳短波辐射', pts: [sunPos, new THREE.Vector3(0, 0.5, 0)], color: 0xffee44, count: 40 },
        { label: '地面长波辐射', pts: [new THREE.Vector3(0, 0.5, 0), new THREE.Vector3(0, 2, 0)], color: 0xff4444, count: 30 },
        { label: '大气逆辐射', pts: [new THREE.Vector3(0, 2, 0), new THREE.Vector3(0, 0.3, 0)], color: 0xff8800, count: 30 },
      ]
    : [
        { label: '太阳短波辐射', pts: [sunPos, new THREE.Vector3(0, 0.5, 0)], color: 0xffee44, count: 60 },
        { label: '大气散射', pts: [sunPos, new THREE.Vector3(0, 3, 0)], color: 0xaaccff, count: 20 },
        { label: '地面长波辐射', pts: [new THREE.Vector3(0, 0.5, 0), new THREE.Vector3(0, 2, 0)], color: 0xff4444, count: 40 },
        { label: '大气逆辐射', pts: [new THREE.Vector3(0, 2, 0), new THREE.Vector3(0, 0.3, 0)], color: 0xff8800, count: 40 },
        { label: '云层反射', pts: [sunPos.clone().multiplyScalar(0.6), sunPos], color: 0xcccccc, count: 15 },
      ]

  paths.forEach((path) => {
    const curve = new THREE.CatmullRomCurve3(path.pts)
    const positions = new Float32Array(path.count * 3)
    for (let i = 0; i < path.count; i++) {
      const t = i / path.count
      const pt = curve.getPoint(t)
      positions[i * 3] = pt.x
      positions[i * 3 + 1] = pt.y
      positions[i * 3 + 2] = pt.z
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const mat = new THREE.PointsMaterial({
      size: 0.08,
      color: path.color,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const points = new THREE.Points(geo, mat)
    points.userData = { type: 'radiation', label: path.label, progress: 0, curve: curve, speed: 0.5 + Math.random() * 0.3 }
    this.scene.add(points)
    this.radiationPaths.push(points)
  })
}
```

- [ ] **Step 2: 添加三圈环流方法**

```js
_showCirculation() {
  this._setCamPosition(0, 2, 12)

  // Three circulation cells: Hadley, Ferrel, Polar
  const cells = [
    { name: 'Hadley', color: 0xff6644, latRange: [-30, 30], count: 800 },
    { name: 'Ferrel', color: 0x44dd88, latRange: [-60, -30, 30, 60], count: 600 },
    { name: 'Polar', color: 0x4488ff, latRange: [-90, -60, 60, 90], count: 400 },
  ]

  const earthRadius = 1.8

  cells.forEach((cell) => {
    const latRanges = Array.isArray(cell.latRange[0])
      ? cell.latRange
      : [cell.latRange]

    latRanges.forEach((range) => {
      const positions = new Float32Array(cell.count * 3)
      for (let i = 0; i < cell.count; i++) {
        const t = i / cell.count
        // Simplified circulation path
        const lat = range[0] + (range[1] - range[0]) * t
        const lon = t * Math.PI * 4 // wrap around
        const heightOffset = Math.sin(t * Math.PI) * 0.8 // rise and fall

        const latRad = (lat * Math.PI) / 180
        const r = earthRadius + 0.1 + heightOffset

        positions[i * 3] = r * Math.cos(latRad) * Math.cos(lon)
        positions[i * 3 + 1] = r * Math.sin(latRad)
        positions[i * 3 + 2] = r * Math.cos(latRad) * Math.sin(lon)
      }

      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

      const mat = new THREE.PointsMaterial({
        size: 0.05,
        color: cell.color,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })

      const points = new THREE.Points(geo, mat)
      points.userData = { type: 'circulation', name: cell.name }
      this.scene.add(points)
      this.circulationParticles.push(points)
    })
  })
}
```

- [ ] **Step 3: 提交**

```bash
git add src/lib/atmosphereScene.js
git commit -m "feat: add radiation and circulation themes"
```

---

### Task 7: 模式切换细化

**Files:**
- Modify: `src/lib/atmosphereScene.js`

在垂直分层场景中添加高中/大学模式差异（标注层、温度曲线、臭氧层标记等）。

- [ ] **Step 1: 为垂直分层添加模式差异**

修改 `_showVerticalLayers` 方法，在大学模式下添加额外标注。使用 CSS2DRenderer 渲染文字标签：

```js
// 在文件顶部添加导入
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
```

在 `_initRenderer` 中添加：

```js
// 在 _initRenderer 末尾添加
this.labelRenderer = new CSS2DRenderer()
this.labelRenderer.setSize(container.clientWidth, container.clientHeight)
this.labelRenderer.domElement.style.position = 'absolute'
this.labelRenderer.domElement.style.top = '0'
this.labelRenderer.domElement.style.pointerEvents = 'none'
container.appendChild(this.labelRenderer.domElement)
```

在 `render` 方法中添加 label 渲染：

```js
render(time) {
  this._updateOrbit()
  this.earth.rotation.y += 0.001
  this.composer.render()
  if (this.labelRenderer) this.labelRenderer.render(this.scene, this.camera)
}
```

在 `_showVerticalLayers` 方法中添加标签生成逻辑：

```js
// 在已有 layer mesh 生成之后添加标签
this._createLayerLabels()
```

```js
_createLayerLabels() {
  const earthRadius = 1.8
  const scale = 6 / 1000
  const layers = [
    { name: '对流层', height: 6, simple: true, profExtra: null },
    { name: '平流层', height: 30, simple: true, profExtra: '臭氧层 20-25km' },
    { name: '中间层', height: 65, simple: true, profExtra: null },
    { name: '热层', height: 200, simple: true, profExtra: '电离层 85-500km' },
    { name: '散逸层', height: 600, simple: true, profExtra: '卡门线 100km' },
  ]

  layers.forEach((layer) => {
    const r = earthRadius + layer.height * scale
    const div = document.createElement('div')
    div.textContent = this.mode === 'simple'
      ? `${layer.name}\n${this._heightStr(layer.height)}`
      : `${layer.name}\n${this._heightStr(layer.height)}${layer.profExtra ? '\n' + layer.profExtra : ''}`
    div.style.color = '#fff'
    div.style.fontSize = '12px'
    div.style.fontFamily = '"Noto Serif SC", serif'
    div.style.textShadow = '0 0 8px rgba(0,0,0,0.8)'
    div.style.whiteSpace = 'pre-line'
    div.style.textAlign = 'center'
    div.style.lineHeight = '1.4'
    if (this.mode !== 'simple') div.style.fontSize = '11px'

    const label = new CSS2DObject(div)
    label.position.set(r, 0, 0)
    this.scene.add(label)
    this.layers.push(label)
  })
}

_heightStr(km) {
  return km >= 100 ? `${km}km` : `${km}km`
}
```

- [ ] **Step 2: 提交**

```bash
git add src/lib/atmosphereScene.js
git commit -m "feat: add mode-specific labels and CSS2D rendering"
```

---

### Task 8: 最终验证

**Files:**
- Build check only

- [ ] **Step 1: 完整构建**

```bash
cd /Users/kongnoma/Documents/New\ project
pnpm build
```

预期：构建成功，无报错。

- [ ] **Step 2: 全功能预览**

```bash
pnpm dev
```

逐项验证：

1. `http://127.0.0.1:4173/#/高中/必修第一册/第二章/第一节` → AtmosphereViewer 显示，Tab 切「垂直分层」
2. 点击「大气组成」→ 粒子系统显示
3. 点击「受热过程」→ 辐射粒子流动画
4. 点击「三圈环流」→ 环流粒子
5. 切到「大学」模式 → 更多粒子、标签数据增加
6. 切换 Tab → 场景平滑过渡
7. `http://127.0.0.1:4173/#/高中/必修第一册/第二章/第二节` → 默认 Tab 为「受热过程」
8. 非第二章页面 → 不显示 AtmosphereViewer
9. 拖拽旋转、滚轮缩放正常工作
10. 窗口 resize 自适应

- [ ] **Step 3: 最终提交**

```bash
git add -A
git commit -m "chore: complete atmosphere 3D model - all 4 themes and dual modes"
```
