# 3D Soil Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an interactive 3D soil profile viewer to Chapter 5 Section 2 (Soil) of the textbook, with simple/professional tab modes and ⓘ term annotations.

**Architecture:** A `SoilProfileModal.vue` renders as a fullscreen modal overlay triggered from `SectionContent.vue`. Inside it, a `SoilProfile3D.vue` mounts a Three.js scene (`soilScene.js`) that renders a multi-layer column. Layer definitions live in `soilData.js`. ⓘ popups are handled by `InfoPopup.vue`. The modal lifecycle manages Three.js resource creation/cleanup.

**Tech Stack:** Vue 3 SFC, Three.js (OrbitControls, CSS2DRenderer), existing textbook component patterns

---

### Task 1: Create soil layer data definitions

**Files:**
- Create: `src/soil-profile/soilData.js`

This file defines all soil layer data for both modes. Each layer has: id, label (Chinese), labelEn, color (hex), thickness (normalized 0-1), horizon code, description (simple), description (professional), sublayers (professional), info (ⓘ content for both modes).

- [ ] **Step 1: Create soilData.js**

```js
// src/soil-profile/soilData.js

export const SOIL_LAYERS = {
  simple: [
    {
      id: 'O',
      label: 'O 枯枝落叶层',
      labelEn: 'O Horizon — Organic Layer',
      color: 0x4a3728,
      thickness: 0.08,
      infoSimple: '地表堆积的枯枝、落叶和动物残体，分解后形成腐殖质，使土壤肥沃。',
      infoPro: null
    },
    {
      id: 'A',
      label: 'A 淋溶层（表土层）',
      labelEn: 'A Horizon — Topsoil',
      color: 0x6b4c3b,
      thickness: 0.22,
      infoSimple: '位于地表附近的土层，含有丰富的腐殖质，颜色较深，是植物根系最密集的区域。',
      infoPro: null
    },
    {
      id: 'E',
      label: 'E 淀积层（淋失层）',
      labelEn: 'E Horizon — Eluviation Layer',
      color: 0x8c7a6b,
      thickness: 0.15,
      infoSimple: '水分下渗时带走黏粒和矿物质的区域，颜色较浅，质地疏松。',
      infoPro: null
    },
    {
      id: 'B',
      label: 'B 母质层',
      labelEn: 'B Horizon — Subsoil',
      color: 0x9c5a3a,
      thickness: 0.30,
      infoSimple: '由风化碎屑物组成，缺乏有机质，是土壤形成的母体材料。',
      infoPro: null
    },
    {
      id: 'C',
      label: 'C 母岩层（基岩）',
      labelEn: 'C Horizon — Parent Material',
      color: 0x7a7a7a,
      thickness: 0.25,
      infoSimple: '坚硬的未风化岩石，是土壤发育的基底。',
      infoPro: null
    }
  ],
  professional: [
    {
      id: 'Oi',
      label: 'Oi 枯落物层',
      labelEn: 'Oi — Fibric (slightly decomposed)',
      color: 0x5c3d2e,
      thickness: 0.03,
      infoSimple: null,
      infoPro: '纤维质有机层，≥40%纤维可辨识。C/N比高，分解缓慢。'
    },
    {
      id: 'Oe',
      label: 'Oe 半分解层',
      labelEn: 'Oe — Hemic (intermediate decomp.)',
      color: 0x4a2f1e,
      thickness: 0.03,
      infoSimple: null,
      infoPro: '半分解有机层，纤维含量17-40%。介于Oa与Oi之间的分解程度。'
    },
    {
      id: 'Oa',
      label: 'Oa 腐殖质层',
      labelEn: 'Oa — Sapric (highly decomposed)',
      color: 0x3b2416,
      thickness: 0.04,
      infoSimple: null,
      infoPro: '高度分解有机质，纤维<17%。腐殖质含量高，CEC大，保肥保水能力强。'
    },
    {
      id: 'A',
      label: 'A 表土层',
      labelEn: 'A Horizon — Mineral Topsoil',
      color: 0x6b4c3b,
      thickness: 0.12,
      infoSimple: null,
      infoPro: '矿质土与腐殖质混合。Ap为耕作层（plowed）。关键指标：CEC、pH、有机碳含量。Munsell色值通常为10YR 3/2至10YR 4/3。'
    },
    {
      id: 'E',
      label: 'E 淋溶层',
      labelEn: 'E Horizon — Eluvial (Albic)',
      color: 0x9e9083,
      thickness: 0.10,
      infoSimple: null,
      infoPro: '黏粒及铁铝被淋失的漂白层。Eluviation过程主导。常见于森林土壤（Spodosols/Alfisols）。Munsell色值通常为10YR 6/2至7/3。'
    },
    {
      id: 'Bt',
      label: 'Bt 黏化层',
      labelEn: 'Bt — Argillic Horizon',
      color: 0xb8733a,
      thickness: 0.12,
      infoSimple: null,
      infoPro: '黏粒淀积层（Illuviation）。黏粒胶膜（argillans）包裹结构面。USDA诊断层：Argillic horizon。'
    },
    {
      id: 'Bw',
      label: 'Bw 风化层',
      labelEn: 'Bw — Cambic Horizon',
      color: 0xa56334,
      thickness: 0.10,
      infoSimple: null,
      infoPro: '风化发育层，颜色或结构发育但黏粒积累不明显。WRB诊断：Cambic horizon。'
    },
    {
      id: 'Bs',
      label: 'Bs 铁铝层',
      labelEn: 'Bs — Spodic Horizon',
      color: 0x8b4513,
      thickness: 0.08,
      infoSimple: null,
      infoPro: '铁铝氧化物与有机质复合物累积层。USDA Spodic horizon，常见于灰土（Spodosols）。'
    },
    {
      id: 'C',
      label: 'C 母质层',
      labelEn: 'C Horizon — Parent Material',
      color: 0x7a7a7a,
      thickness: 0.22,
      infoSimple: null,
      infoPro: '风化基岩碎屑。Cr为可手铲挖掘的软弱基岩。几乎无有机质，保留母岩矿物组成。'
    },
    {
      id: 'R',
      label: 'R 基岩层',
      labelEn: 'R Layer — Hard Bedrock',
      color: 0x555555,
      thickness: 0.16,
      infoSimple: null,
      infoPro: '坚硬基岩（花岗岩、玄武岩、石英岩等），24h浸水不崩解，手铲不可挖掘。USDA R层。'
    }
  ]
}

export const MODE_NAMES = {
  simple: { label: '🌱 简单模式', subtitle: '适用于高中地理教学' },
  professional: { label: '🔬 专业模式', subtitle: '适用于研究生 / USDA & WRB 体系' }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/soil-profile/soilData.js
mkdir -p src/soil-profile
git add src/soil-profile/soilData.js
git commit -m "feat: add soil layer data definitions for simple and professional mode"
```

---

### Task 2: Create Three.js soil profile scene

**Files:**
- Create: `src/soil-profile/soilScene.js`

Uses Three.js to render a 3D column of stacked soil layers. Each layer is a `CylinderGeometry` slice with distinct color/material. Supports orbit controls for rotation/zoom. Exposes `setMode(mode)` to switch active layer set, `getLayerAt(index)` for interaction, and `dispose()` for cleanup.

- [ ] **Step 1: Create soilScene.js**

```js
// src/soil-profile/soilScene.js

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { SOIL_LAYERS } from './soilData.js'

export class SoilProfileScene {
  constructor(container) {
    this.container = container
    this.mode = 'simple'
    this.currentLayers = SOIL_LAYERS.simple
    
    this.raycaster = new THREE.Raycaster()
    this.pointer = new THREE.Vector2()
    this.onLayerClick = null
    this.hoveredLayer = null
    this.animFrameId = null
    
    this._initRenderer()
    this._initScene()
    this._initLights()
    this._initControls()
    this._buildProfile(this.currentLayers)
    this._animate()
  }

  _initRenderer() {
    const rect = this.container.getBoundingClientRect()
    this.width = rect.width
    this.height = rect.height

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    })
    this.renderer.setSize(this.width, this.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.container.appendChild(this.renderer.domElement)

    // CSS2D overlay for labels
    this.labelRenderer = new CSS2DRenderer()
    this.labelRenderer.setSize(this.width, this.height)
    this.labelRenderer.domElement.style.position = 'absolute'
    this.labelRenderer.domElement.style.top = '0'
    this.labelRenderer.domElement.style.left = '0'
    this.labelRenderer.domElement.style.pointerEvents = 'none'
    this.container.appendChild(this.labelRenderer.domElement)
  }

  _initScene() {
    this.scene = new THREE.Scene()
    
    this.camera = new THREE.PerspectiveCamera(40, this.width / this.height, 0.1, 100)
    this.camera.position.set(4, 3, 5)
    this.camera.lookAt(0, 0, 0)
  }

  _initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
    dirLight.position.set(5, 10, 7)
    dirLight.castShadow = true
    this.scene.add(dirLight)

    const rimLight = new THREE.DirectionalLight(0xffffcc, 0.4)
    rimLight.position.set(-3, 5, -5)
    this.scene.add(rimLight)
  }

  _initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.1
    this.controls.minDistance = 2.5
    this.controls.maxDistance = 12
    this.controls.target.set(0, 0, 0)
    this.controls.maxPolarAngle = Math.PI / 2
  }

  _buildProfile(layers) {
    // Clean up previous
    if (this.profileGroup) {
      this.scene.remove(this.profileGroup)
      this.profileGroup.traverse(child => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) child.material.dispose()
      })
    }
    if (this.labelGroup) {
      this.scene.remove(this.labelGroup)
      this.labelGroup.traverse(child => {
        if (child.element && child.element.parentNode) {
          child.element.parentNode.removeChild(child.element)
        }
      })
    }

    this.profileGroup = new THREE.Group()
    this.labelGroup = new THREE.Group()
    this.layerMeshes = []
    this.labelObjects = []

    let yOffset = -1
    const totalHeight = 2
    const radius = 0.8

    layers.forEach((layer, i) => {
      const height = layer.thickness * totalHeight
      const yPos = yOffset + height / 2

      const geometry = new THREE.CylinderGeometry(radius, radius, height, 32, 1)
      const material = new THREE.MeshStandardMaterial({
        color: layer.color,
        roughness: 0.7,
        metalness: 0.1,
        transparent: true,
        opacity: 0.92
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.y = yPos
      mesh.castShadow = true
      mesh.userData = { layerIndex: i, layerId: layer.id }
      this.profileGroup.add(mesh)
      this.layerMeshes.push(mesh)

      // Layer edge ring for visual separation
      const edgeGeo = new THREE.RingGeometry(radius - 0.005, radius, 48)
      const edgeMat = new THREE.MeshBasicMaterial({
        color: 0x333333,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
      })
      const edge = new THREE.Mesh(edgeGeo, edgeMat)
      edge.rotation.x = -Math.PI / 2
      edge.position.y = yPos - height / 2
      this.profileGroup.add(edge)

      // CSS2D label
      const labelDiv = document.createElement('div')
      labelDiv.textContent = layer.label
      labelDiv.style.color = '#fff'
      labelDiv.style.fontSize = '14px'
      labelDiv.style.fontWeight = '600'
      labelDiv.style.textShadow = '0 1px 4px rgba(0,0,0,0.7)'
      labelDiv.style.background = 'rgba(0,0,0,0.5)'
      labelDiv.style.padding = '4px 10px'
      labelDiv.style.borderRadius = '4px'
      labelDiv.style.whiteSpace = 'nowrap'
      labelDiv.style.pointerEvents = 'auto'
      labelDiv.style.cursor = 'pointer'
      labelDiv.dataset.layerId = layer.id

      // ⓘ icon
      const infoIcon = document.createElement('span')
      infoIcon.textContent = ' ⓘ'
      infoIcon.style.color = '#ffd700'
      infoIcon.style.cursor = 'pointer'
      infoIcon.style.marginLeft = '4px'
      labelDiv.appendChild(infoIcon)

      // Click handler
      labelDiv.addEventListener('click', (e) => {
        e.stopPropagation()
        if (this.onLayerClick) this.onLayerClick(layer, this.mode)
      })

      const label = new CSS2DObject(labelDiv)
      label.position.set(radius + 0.5, yPos, 0)
      this.labelGroup.add(label)
      this.labelObjects.push(label)

      yOffset += height
    })

    // Ground plane (invisible, for shadow catch)
    const groundGeo = new THREE.PlaneGeometry(6, 6)
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.3 })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -1.05
    ground.receiveShadow = true
    this.profileGroup.add(ground)

    this.scene.add(this.profileGroup)
    this.scene.add(this.labelGroup)
  }

  setMode(mode) {
    this.mode = mode
    this.currentLayers = SOIL_LAYERS[mode]
    this._buildProfile(this.currentLayers)
  }

  setOnLayerClick(callback) {
    this.onLayerClick = callback
  }

  resize() {
    const rect = this.container.getBoundingClientRect()
    this.width = rect.width
    this.height = rect.height
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.width, this.height)
    this.labelRenderer.setSize(this.width, this.height)
  }

  _animate() {
    this.animFrameId = requestAnimationFrame(() => this._animate())
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
    this.labelRenderer.render(this.scene, this.camera)
  }

  dispose() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId)
    this.controls.dispose()
    this.scene.traverse(child => {
      if (child.geometry) child.geometry.dispose()
      if (child.material) child.material.dispose()
    })
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
    }
    if (this.labelRenderer.domElement.parentNode) {
      this.labelRenderer.domElement.parentNode.removeChild(this.labelRenderer.domElement)
    }
    this.renderer.dispose()
    this.labelRenderer.dispose()
  }
}
```

Note: The `CSS2DRenderer` import path may need adjustment. If `three/examples/jsm/renderers/CSS2DRenderer.js` is not available, check installed Three.js version and adjust path accordingly.

- [ ] **Step 2: Commit**

```bash
git add src/soil-profile/soilScene.js
git commit -m "feat: add Three.js soil profile 3D scene with layers and labels"
```

---

### Task 3: Create InfoPopup component

**Files:**
- Create: `src/soil-profile/InfoPopup.vue`

A floating card that shows the ⓘ explanation for a selected soil layer. Appears on click, closes on outside click or close button.

- [ ] **Step 1: Create InfoPopup.vue**

```vue
<template>
  <div v-if="visible" class="info-mask" @click.self="$emit('close')">
    <div class="info-card">
      <button class="info-close" @click="$emit('close')">✕</button>
      <h3 class="info-title">{{ layer?.label }}</h3>
      <p class="info-en" v-if="layer?.labelEn">{{ layer.labelEn }}</p>
      <p class="info-body">{{ infoText }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: Boolean,
  layer: Object,
  mode: String
})
defineEmits(['close'])

const infoText = computed(() => {
  if (!props.layer) return ''
  if (props.mode === 'professional' && props.layer.infoPro) {
    return props.layer.infoPro
  }
  if (props.layer.infoSimple) return props.layer.infoSimple
  if (props.layer.infoPro) return props.layer.infoPro
  return '暂无详细解释'
})
</script>

<style scoped>
.info-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}
.info-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90vw;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  position: relative;
}
.info-close {
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  background: #f0f0f0;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.info-title {
  margin: 0 0 4px;
  font-size: 16px;
  color: #333;
}
.info-en {
  font-size: 12px;
  color: #888;
  margin: 0 0 12px;
}
.info-body {
  font-size: 14px;
  line-height: 1.7;
  color: #555;
  margin: 0;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/soil-profile/InfoPopup.vue
git commit -m "feat: add InfoPopup component for soil layer explanations"
```

---

### Task 4: Create SoilProfile3D component

**Files:**
- Create: `src/soil-profile/SoilProfile3D.vue`

Vue component that manages the 3D scene lifecycle. Mounts `SoilProfileScene` on mount, disposes on unmount. Exposes mode switching and layer click handling.

- [ ] **Step 1: Create SoilProfile3D.vue**

```vue
<template>
  <div ref="sceneContainer" class="scene-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { SoilProfileScene } from './soilScene.js'

const props = defineProps({
  mode: { type: String, default: 'simple' }
})
const emit = defineEmits(['layerClick'])
const sceneContainer = ref(null)
let scene = null

onMounted(() => {
  if (!sceneContainer.value) return
  scene = new SoilProfileScene(sceneContainer.value)
  scene.setOnLayerClick((layer, mode) => {
    emit('layerClick', { layer, mode })
  })

  const resizeObserver = new ResizeObserver(() => {
    if (scene) scene.resize()
  })
  resizeObserver.observe(sceneContainer.value)
})

watch(() => props.mode, (newMode) => {
  if (scene) scene.setMode(newMode)
})

onUnmounted(() => {
  if (scene) scene.dispose()
  scene = null
})
</script>

<style scoped>
.scene-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
  position: relative;
  overflow: hidden;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/soil-profile/SoilProfile3D.vue
git commit -m "feat: add SoilProfile3D Vue component wrapping Three.js scene"
```

---

### Task 5: Create SoilProfileModal container

**Files:**
- Create: `src/soil-profile/SoilProfileModal.vue`

Full-screen modal with tab switcher (simple/professional), the 3D scene, and the info popup overlay.

- [ ] **Step 1: Create SoilProfileModal.vue**

```vue
<template>
  <div class="modal-mask" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">3D 土壤剖面图</h2>
        <span class="modal-chapter">第五章 植被与土壤 · 第二节 土壤</span>
        <button class="modal-close" @click="$emit('close')">✕ 关闭</button>
      </div>

      <div class="mode-tabs">
        <button
          v-for="m in modes"
          :key="m.key"
          :class="['mode-tab', { active: currentMode === m.key }]"
          @click="currentMode = m.key"
        >{{ m.label }}</button>
      </div>

      <div class="scene-area">
        <SoilProfile3D
          :mode="currentMode"
          @layer-click="onLayerClick"
        />
      </div>

      <div class="mode-description">
        <p v-if="currentMode === 'simple'">🌱 简单模式：展示土壤的 5 个基本层（O → A → E → B → C），适用于高中地理教学。点击图层名称的 ⓘ 查看解释。</p>
        <p v-else>🔬 专业模式：基于 USDA Soil Taxonomy 和 WRB 国际标准，展示精细土层划分（含亚层），适用于研究生学习。点击图层名称的 ⓘ 查看详细解释。</p>
      </div>

      <InfoPopup
        :visible="!!selectedLayer"
        :layer="selectedLayer"
        :mode="currentMode"
        @close="selectedLayer = null"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SoilProfile3D from './SoilProfile3D.vue'
import InfoPopup from './InfoPopup.vue'

defineEmits(['close'])

const modes = [
  { key: 'simple', label: '🌱 简单模式' },
  { key: 'professional', label: '🔬 专业模式' }
]
const currentMode = ref('simple')
const selectedLayer = ref(null)

function onLayerClick({ layer }) {
  selectedLayer.value = layer
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 90;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal-container {
  background: #f8f6f2;
  border-radius: 16px;
  width: min(900px, 96vw);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px 12px;
  border-bottom: 1px solid #e0d6cc;
}
.modal-title {
  margin: 0;
  font-size: 18px;
  color: #b01217;
}
.modal-chapter {
  font-size: 12px;
  color: #8a7a6e;
  flex: 1;
}
.modal-close {
  border: 1px solid #d0c4b8;
  border-radius: 8px;
  padding: 6px 14px;
  background: #fff;
  color: #555;
  font-size: 13px;
  cursor: pointer;
}
.modal-close:hover {
  background: #f0e8e0;
}
.mode-tabs {
  display: flex;
  gap: 0;
  padding: 0 20px;
  border-bottom: 1px solid #e0d6cc;
}
.mode-tab {
  border: 1px solid transparent;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  padding: 8px 20px;
  font-size: 14px;
  background: transparent;
  color: #6b5a4e;
  cursor: pointer;
  margin-bottom: -1px;
}
.mode-tab.active {
  background: #fff;
  border-color: #e0d6cc;
  color: #b01217;
  font-weight: 600;
}
.mode-tab:hover:not(.active) {
  background: rgba(0,0,0,0.03);
}
.scene-area {
  flex: 1;
  min-height: 400px;
  background: linear-gradient(180deg, #e8e2d8 0%, #d6cec2 100%);
}
.mode-description {
  padding: 10px 20px;
  font-size: 13px;
  color: #6b5a4e;
  border-top: 1px solid #e0d6cc;
  background: #faf8f4;
}
.mode-description p {
  margin: 0;
  line-height: 1.5;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/soil-profile/SoilProfileModal.vue
git commit -m "feat: add SoilProfileModal with tab switching and info popup"
```

---

### Task 6: Integrate button into SectionContent.vue

**Files:**
- Modify: `src/textbook/SectionContent.vue`

Add a "3D 土壤剖面" button to the soil chapter section, following the existing pattern used for `isLandformChapter` and `isEarthChapter`. Import and render `SoilProfileModal` when the button is clicked.

- [ ] **Step 1: Add soil chapter detection and modal state**

In `<script setup>` section of `SectionContent.vue`, add after `showEarth3D`:

```js
const showSoilProfile = ref(false)
const isSoilChapter = computed(() =>
  gradeId.value === '高中' && bookId.value === '必修第一册' && chapterId.value === '第五章'
)
```

Add import after existing imports:

```js
import SoilProfileModal from '../soil-profile/SoilProfileModal.vue'
```

- [ ] **Step 2: Add soil profile toggle bar**

In `<template>`, add after the earth chapter toggle bar (`v-if="isEarthChapter"` block, around line 37):

```html
<div v-if="isSoilChapter" class="sandbox-toggle-bar">
  <button
    :class="['sandbox-toggle', { active: !showSoilProfile }]"
    @click="showSoilProfile = false"
  >📖 课文</button>
  <button
    :class="['sandbox-toggle', { active: showSoilProfile }]"
    @click="showSoilProfile = true"
  >🧪 3D 土壤剖面</button>
</div>
```

- [ ] **Step 3: Add modal after content area**

In `<template>`, add the modal (should be inside the root `div.page-shell` but outside `content-layout`). Add after the existing `Earth3D` block:

```html
<SoilProfileModal v-else-if="showSoilProfile" @close="showSoilProfile = false" />
```

- [ ] **Step 4: Prevent text content when modal is active**

In `<template>`, modify the `v-if` that wraps the content layout to also exclude soil profile mode:

Change:
```html
<template v-if="!showSandbox && !showEarth3D">
```
To:
```html
<template v-if="!showSandbox && !showEarth3D && !showSoilProfile">
```

- [ ] **Step 5: Commit**

```bash
git add src/textbook/SectionContent.vue
git commit -m "feat: integrate 3D soil profile button into soil chapter section"
```

---

### Task 7: Verify build

- [ ] **Step 1: Run the build**

```bash
pnpm build
```

- [ ] **Step 2: Fix any build errors**

If there are import errors (e.g., CSS2DRenderer path), adjust the import in `soilScene.js`. Common alternative paths:
- `three/examples/jsm/renderers/CSS2DRenderer.js`
- `three/addons/renderers/CSS2DRenderer.js`

- [ ] **Step 3: Start dev server and test**

```bash
pnpm dev
```

Navigate to `http://127.0.0.1:4173/#/高中/必修第一册/第五章/第二节` and verify:
1. The "3D 土壤剖面" toggle button appears
2. Clicking it opens the modal with the 3D soil column
3. The simple/professional tabs switch modes
4. Clicking ⓘ on a layer label shows the info popup
5. Closing the modal cleans up properly
6. Switching back to text view works

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: fix build issues and verify soil profile feature"
```
