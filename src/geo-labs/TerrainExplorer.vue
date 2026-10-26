<template>
  <section class="lab-page">
    <header class="lab-intro">
      <router-link to="/geo-labs" class="back">← 地理实证实验</router-link>
      <p class="eyebrow">COPERNICUS DEM · 真实高程</p>
      <h1>从等高线走进喜马拉雅</h1>
      <p>这块地形由 Copernicus GLO-90 高程数据生成，范围为东经 86.75°—87°、北纬 27.75°—28°。支持在三维地形中任意选定两点交互提取地貌剖面，量化高差与起伏特征。</p>
    </header>

    <div class="terrain-layout">
      <div ref="sceneEl" class="scene" role="img" aria-label="珠穆朗玛峰附近真实高程生成的可旋转三维地形"></div>

      <aside class="terrain-controls">
        <label>
          高度夸张 {{ exaggeration.toFixed(1) }} 倍
          <input v-model.number="exaggeration" type="range" min="0.5" max="3" step="0.1" />
        </label>

        <!-- 剖面模式切换 -->
        <div class="profile-mode-selector">
          <span class="ctrl-subhead">剖面切线模式</span>
          <div class="mode-chips">
            <button
              type="button"
              :class="['mode-chip', { active: profileMode === 'we' }]"
              @click="profileMode = 'we'"
            >
              东西向纬线
            </button>
            <button
              type="button"
              :class="['mode-chip', { active: profileMode === 'sn' }]"
              @click="profileMode = 'sn'"
            >
              南北向经线
            </button>
            <button
              type="button"
              :class="['mode-chip', { active: profileMode === 'custom' }]"
              @click="profileMode = 'custom'"
            >
              自由两点切线
            </button>
          </div>
        </div>

        <!-- 纬线滑块 -->
        <label v-if="profileMode === 'we'">
          剖面纬度 {{ currentLatitude }}° N
          <input v-model.number="profileRow" type="range" min="0" max="95" step="1" />
        </label>

        <!-- 经线滑块 -->
        <label v-else-if="profileMode === 'sn'">
          剖面经度 {{ currentLongitude }}° E
          <input v-model.number="profileCol" type="range" min="0" max="95" step="1" />
        </label>

        <!-- 自由两点预设 -->
        <div v-else class="custom-line-presets">
          <span class="ctrl-subhead">经典珠峰地貌剖面线</span>
          <div class="preset-links">
            <button
              v-for="p in customLinePresets"
              :key="p.name"
              type="button"
              class="line-preset-btn"
              :class="{ active: selectedPresetName === p.name }"
              @click="applyLinePreset(p)"
            >
              {{ p.name }}
            </button>
          </div>
        </div>

        <p class="note">高度夸张只改变显示比例，不改变原始高程值。GLO-90 是地表高程模型，按 96×96 网格采样，适合课堂地貌定性与定量对比观察。</p>
      </aside>
    </div>

    <!-- 地形剖面结果展示卡片 -->
    <div class="profile-card baroque-frame">
      <div class="profile-card-header">
        <h2>{{ profileTitle }}</h2>
        <div class="profile-metrics-bar">
          <span class="metric-item">水平距: <strong>{{ profileAnalysis.distanceKm }} km</strong></span>
          <span class="metric-item">高程范围: <strong>{{ profileAnalysis.minElev }} ~ {{ profileAnalysis.maxElev }} m</strong></span>
          <span class="metric-item highlight">相对高差 ΔH: <strong>{{ profileAnalysis.relief }} m</strong></span>
          <span class="metric-item">平均坡度: <strong>{{ profileAnalysis.averageSlopeDeg }}°</strong></span>
        </div>
      </div>

      <div class="svg-container">
        <svg viewBox="0 0 900 250" role="img" :aria-label="`地形剖面，最低 ${profileAnalysis.minElev} 米，最高 ${profileAnalysis.maxElev} 米`">
          <!-- 基准参考线 -->
          <line x1="34" y1="205" x2="878" y2="205" stroke="#8fa4ad" stroke-width="1.5" />
          <line x1="34" y1="50" x2="878" y2="50" stroke="#cbd5e1" stroke-dasharray="3 3" opacity="0.6" />
          <line x1="34" y1="125" x2="878" y2="125" stroke="#cbd5e1" stroke-dasharray="3 3" opacity="0.6" />

          <!-- 填充底色区域 -->
          <path :d="profileAreaPath" fill="rgba(23, 110, 122, 0.08)" />

          <!-- 剖面主线 -->
          <path :d="profileLinePath" fill="none" stroke="#176e7a" stroke-width="3" stroke-linejoin="round" />

          <!-- 两端经纬度标注 -->
          <text x="34" y="234" font-size="12" fill="#4e6074">{{ startLabel }}</text>
          <text x="760" y="234" font-size="12" fill="#4e6074" text-anchor="end">{{ endLabel }}</text>
        </svg>
      </div>

      <p class="profile-summary">
        该切线跨越地表直线距离 {{ profileAnalysis.distanceKm }} 公里，最高点位于海拔 {{ profileAnalysis.maxElev }} 米处，最大相对起伏达 {{ profileAnalysis.relief }} 米。根据剖面起伏陡缓可直观判别角峰、刃脊与深切峡谷。
      </p>
    </div>

    <p class="source">数据：<a href="https://registry.opendata.aws/copernicus-dem/" target="_blank" rel="noopener">Copernicus DEM GLO-90 Public</a>，2021 版；原始瓦片 {{ dem.tile }}。<br />produced using Copernicus WorldDEM-90 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved</p>

    <!-- 教学四要素机理与连贯性面板 -->
    <ModelPedagogyPanel
      theme="geology"
      :observe="pedagogy.observe"
      :change="pedagogy.change"
      :mechanism="pedagogy.mechanism"
      :limitations="pedagogy.limitations"
      :real-data-lab="{ title: 'NASA 卫星真彩色珠峰山体影像对比', path: '/geo-labs/satellite', desc: '真实卫星影像看雪线与山体反照率' }"
      :textbook-link="{ grade: '高中', book: '必修第一册', chapter: '第四章', section: '第一节' }"
      practice-link="/practice"
      @reset="resetTerrainView"
    />
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import dem from './data/everest-dem.json'
import ModelPedagogyPanel from '../experiments/components/ModelPedagogyPanel.vue'
import { sampleDemProfile } from '../utils/demSampler.js'

const pedagogy = {
  observe: [
    '喜马拉雅极高山地貌：山脊高耸陡峭呈线状延伸（分水岭），山谷深切幽闭（汇水线）。',
    '东西向剖面线的陡缓起伏：坡陡处等高线密集，坡缓处等高线稀疏。',
    '山地垂直高差超 5000 米（最低谷底约 3400 米，主峰群超 8000 米）。',
  ],
  change: [
    '调节“高度夸张倍数”（0.5x~3.0x），增强地貌起伏微地貌的视觉可识别度。',
    '切换“东西向”、“南北向”或“自由两点剖面”，多角度剖析珠峰地势起伏与山脊走向。',
  ],
  mechanism: [
    '印度洋板块与亚欧陆块强力持续碰撞挤压，地壳强烈缩短加厚抬升形成青藏高原与喜马拉雅山脉。',
    '极高山冰川侵蚀（角峰、刃脊、冰斗）与外力物理冰劈冻融风化，强烈雕琢出犬牙交错的锋利山形。',
  ],
  limitations: [
    '高度夸张改变了几何垂直显示比例，不可直接在夸张视角下测量实际山坡坡度角。',
    '数据来自 Copernicus GLO-90 公开数据集按 96×96 降采样提取，属于宏观课堂定性探究模型。',
  ],
}

function resetTerrainView() {
  exaggeration.value = 1.0
  profileMode.value = 'we'
  profileRow.value = 48
  profileCol.value = 48
}

const sceneEl = ref(null)
const exaggeration = ref(1)
const profileMode = ref('we') // 'we' | 'sn' | 'custom'
const profileRow = ref(48)
const profileCol = ref(48)
const selectedPresetName = ref('绒布冰川谷底 → 珠峰主峰顶')

const customLinePresets = [
  { name: '绒布冰川谷底 → 珠峰主峰顶', col1: 15, row1: 20, col2: 55, row2: 70 },
  { name: '北坳冰壁段陡切剖面', col1: 40, row1: 45, col2: 60, row2: 80 },
  { name: '珠峰南坳 → 洛子峰连线', col1: 50, row1: 75, col2: 85, row2: 70 }
]

const customLine = ref({ ...customLinePresets[0] })

function applyLinePreset(p) {
  selectedPresetName.value = p.name
  customLine.value = { ...p }
  updateProfileLine()
}

const currentLatitude = computed(() => (28 - (profileRow.value / 95) * 0.25).toFixed(3))
const currentLongitude = computed(() => (86.75 + (profileCol.value / 95) * 0.25).toFixed(3))

const profileAnalysis = computed(() => {
  if (profileMode.value === 'we') {
    return sampleDemProfile(dem, 0, profileRow.value, 95, profileRow.value)
  }
  if (profileMode.value === 'sn') {
    return sampleDemProfile(dem, profileCol.value, 95, profileCol.value, 0)
  }
  return sampleDemProfile(
    dem,
    customLine.value.col1,
    customLine.value.row1,
    customLine.value.col2,
    customLine.value.row2
  )
})

const profileTitle = computed(() => {
  if (profileMode.value === 'we') return `纬度 ${currentLatitude.value}°N 东西向地形剖面`
  if (profileMode.value === 'sn') return `经度 ${currentLongitude.value}°E 南北向地形剖面`
  return `自由切线：${selectedPresetName.value}`
})

const startLabel = computed(() => {
  const p = profileAnalysis.value.points[0]
  return `起点: ${p.lng.toFixed(2)}°E, ${p.lat.toFixed(2)}°N (${p.elevation}m)`
})

const endLabel = computed(() => {
  const p = profileAnalysis.value.points[profileAnalysis.value.points.length - 1]
  return `终点: ${p.lng.toFixed(2)}°E, ${p.lat.toFixed(2)}°N (${p.elevation}m)`
})

const profileLinePath = computed(() => {
  const pts = profileAnalysis.value.points
  return pts.map((pt, index) => {
    const x = 34 + (index / (pts.length - 1)) * 844
    const y = 205 - ((pt.elevation - 3000) / 6000) * 180
    return `${index ? 'L' : 'M'} ${x} ${y}`
  }).join(' ')
})

const profileAreaPath = computed(() => {
  const pts = profileAnalysis.value.points
  const linePart = pts.map((pt, index) => {
    const x = 34 + (index / (pts.length - 1)) * 844
    const y = 205 - ((pt.elevation - 3000) / 6000) * 180
    return `${index ? 'L' : 'M'} ${x} ${y}`
  }).join(' ')
  return `${linePart} L 878 205 L 34 205 Z`
})

let renderer, scene, camera, controls, terrain, line, resizeObserver, frame

function createTerrain() {
  const geometry = new THREE.PlaneGeometry(100, 100, 95, 95)
  geometry.rotateX(-Math.PI / 2)
  const position = geometry.attributes.position
  const colors = []
  const low = 3427
  for (let i = 0; i < position.count; i++) {
    const height = dem.elevationMeters[i]
    position.setY(i, ((height - low) / 250) * exaggeration.value)
    const t = Math.min(1, Math.max(0, (height - 3500) / 5200))
    const color = new THREE.Color().setHSL(0.35 - t * 0.32, 0.42 - t * 0.26, 0.28 + t * 0.48)
    colors.push(color.r, color.g, color.b)
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geometry.computeVertexNormals()
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 1 })
  terrain = new THREE.Mesh(geometry, material)
  scene.add(terrain)

  const lineGeometry = new THREE.BufferGeometry()
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(96 * 3), 3))
  line = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color: 0xff4820, linewidth: 3, depthTest: false }))
  line.renderOrder = 2
  scene.add(line)
  updateProfileLine()
}

function updateProfileLine() {
  if (!line) return
  const positions = line.geometry.attributes.position
  const pts = profileAnalysis.value.points

  for (let i = 0; i < pts.length; i++) {
    const pt = pts[i]
    // 映射到 Three.js 平面空间 [-50, 50]
    const x = -50 + (pt.col / 95) * 100
    const z = -50 + (pt.row / 95) * 100
    const y = ((pt.elevation - 3427) / 250) * exaggeration.value + 0.35
    positions.setXYZ(i, x, y, z)
  }
  positions.needsUpdate = true
  line.geometry.computeBoundingSphere()
}

function updateHeight() {
  if (!terrain) return
  const positions = terrain.geometry.attributes.position
  for (let i = 0; i < positions.count; i++) {
    positions.setY(i, ((dem.elevationMeters[i] - 3427) / 250) * exaggeration.value)
  }
  positions.needsUpdate = true
  terrain.geometry.computeVertexNormals()
  updateProfileLine()
}

onMounted(() => {
  scene = new THREE.Scene()
  scene.background = new THREE.Color('#dce8ed')
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 600)
  camera.position.set(90, 80, 115)
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  sceneEl.value.appendChild(renderer.domElement)
  scene.add(new THREE.HemisphereLight(0xffffff, 0x486178, 2.1))
  const sun = new THREE.DirectionalLight(0xffffff, 2.2)
  sun.position.set(-70, 100, 40)
  scene.add(sun)
  createTerrain()
  controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 8, 0)
  controls.enableDamping = true
  controls.maxDistance = 260
  controls.minDistance = 35

  function resize() {
    if (!sceneEl.value) return
    const { clientWidth, clientHeight } = sceneEl.value
    camera.aspect = clientWidth / clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(clientWidth, clientHeight)
  }

  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(sceneEl.value)
  resize()

  function animate() {
    frame = requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()
})

watch(exaggeration, updateHeight)
watch([profileMode, profileRow, profileCol], updateProfileLine)

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  resizeObserver?.disconnect()
  controls?.dispose()
  terrain?.geometry.dispose()
  terrain?.material.dispose()
  line?.geometry.dispose()
  line?.material.dispose()
  renderer?.dispose()
  renderer?.domElement.remove()
})
</script>

<style scoped>
.lab-page {
  max-width: 1180px;
  margin: auto;
  padding: 46px 24px 90px;
  color: var(--text);
}

.lab-intro {
  max-width: 800px;
}

.back {
  font-size: 14px;
  color: var(--geo-ocean);
  font-weight: 700;
  text-decoration: none;
}

.eyebrow {
  margin: 28px 0 8px;
  color: var(--geo-ocean);
  font-size: 12px;
  letter-spacing: 0.16em;
  font-weight: 700;
}

.lab-intro h1 {
  font-size: clamp(32px, 5vw, 54px);
  margin: 0 0 12px;
  color: var(--geo-ocean-deep);
  font-weight: 800;
}

.lab-intro p:last-child {
  line-height: 1.8;
  color: var(--text-muted);
}

.terrain-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 20px;
  margin: 30px 0;
}

.scene {
  height: 520px;
  border-radius: var(--radius-box);
  overflow: hidden;
  background: #dce8ed;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-md);
}

.terrain-controls {
  padding: 22px;
  background: var(--surface);
  border-radius: var(--radius-card);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-xs);
  line-height: 1.7;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.terrain-controls label {
  display: grid;
  gap: 8px;
  font-weight: 700;
  color: var(--geo-ocean-deep);
  font-size: 13.5px;
}

.terrain-controls input {
  width: 100%;
  accent-color: var(--geo-ocean);
}

.profile-mode-selector {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ctrl-subhead {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-faint);
  text-transform: uppercase;
}

.mode-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.mode-chip {
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.mode-chip.active {
  background: var(--geo-ocean);
  color: #ffffff;
  border-color: var(--geo-ocean);
}

.custom-line-presets {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preset-links {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.line-preset-btn {
  text-align: left;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: #f8fafc;
  font-size: 12px;
  color: var(--geo-ocean);
  cursor: pointer;
  transition: all 0.12s ease;
}

.line-preset-btn:hover {
  background: var(--geo-ocean-surface);
  border-color: var(--baroque-bronze);
}

.line-preset-btn.active {
  background: #eef5fa;
  border-color: var(--geo-ocean);
  font-weight: 700;
}

.terrain-controls .note {
  border-top: 1px solid var(--border);
  padding-top: 12px;
  font-size: 12.5px;
  color: var(--text-muted);
  line-height: 1.6;
}

.profile-card {
  background: var(--surface);
  padding: 24px 28px;
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-xs);
  margin-bottom: 24px;
}

.profile-card-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.profile-card h2 {
  margin: 0;
  color: var(--geo-ocean-deep);
  font-size: 20px;
  font-weight: 700;
  font-family: Georgia, 'Playfair Display', 'Songti SC', serif;
}

.profile-metrics-bar {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--text-muted);
  flex-wrap: wrap;
}

.metric-item strong {
  color: var(--geo-ocean-deep);
  font-family: ui-monospace, monospace;
}

.metric-item.highlight strong {
  color: #c5a059;
}

.svg-container {
  width: 100%;
  overflow-x: auto;
}

.profile-card svg {
  width: 100%;
  min-width: 650px;
  height: auto;
  background: var(--bg-soft);
  border-radius: var(--radius-sm);
  display: block;
}

.profile-summary {
  margin-top: 14px;
  line-height: 1.7;
  font-size: 13.5px;
  color: var(--text-muted);
}

.source {
  font-size: 12px;
  line-height: 1.7;
  color: var(--text-muted);
  margin-top: 12px;
}

.source a {
  color: var(--geo-ocean);
}

@media (max-width: 760px) {
  .terrain-layout {
    grid-template-columns: 1fr;
  }
  .scene {
    height: 400px;
  }
}
</style>
