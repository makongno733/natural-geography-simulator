<template>
  <div id="app">
    <header class="topbar">
      <router-link to="/" class="back-link">← 返回首页</router-link>
      <div class="mode-toggle">
        <button
          :class="['mode-btn', { active: mode === 'simple' }]"
          @click="mode = 'simple'"
        >🌱 简单模式（高中）</button>
        <button
          :class="['mode-btn', { active: mode === 'professional' }]"
          @click="mode = 'professional'"
        >🔬 专业模式（研究生）</button>
      </div>
      <span class="chapter-ref">第五章 · 植被与土壤</span>
    </header>
    <div id="main">
      <div id="canvas-container" ref="containerRef">
        <div class="controls-hint">🖱 拖拽旋转 · 滚轮缩放 · 点击 ⓘ 查看解释</div>
      </div>
      <aside id="info-panel">
        <div class="info-content">
          <h2>🧪 3D 土壤剖面图</h2>
          <p class="subtitle">第二节 土壤</p>

          <div v-if="mode === 'simple'" class="mode-panel">
            <h3>🌱 简单模式</h3>
            <p>展示土壤的 5 个基本层，适用于高中地理教学。点击 3D 模型上的 ⓘ 查看解释。</p>
            <ul class="layers-list">
              <li v-for="layer in simpleLayers" :key="layer.id" class="layer-item" @click="selectLayer(layer, 'simple')">
                <span class="layer-dot" :style="{ background: '#' + layer.color.toString(16).padStart(6, '0') }"></span>
                <strong>{{ layer.label }}</strong>
                <span class="info-badge" @click.stop="selectLayer(layer, 'simple')">ⓘ</span>
              </li>
            </ul>
          </div>

          <div v-else class="mode-panel">
            <h3>🔬 专业模式</h3>
            <p>基于 USDA Soil Taxonomy 和 WRB 国际标准，展示精细土层划分（含亚层）。</p>
            <ul class="layers-list">
              <li v-for="layer in profLayers" :key="layer.id" class="layer-item" @click="selectLayer(layer, 'professional')">
                <span class="layer-dot" :style="{ background: '#' + layer.color.toString(16).padStart(6, '0') }"></span>
                <strong>{{ layer.label }}</strong>
                <span class="layer-en">{{ layer.labelEn }}</span>
                <span class="info-badge" @click.stop="selectLayer(layer, 'professional')">ⓘ</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- 数据来源 -->
        <div class="sources">
          <h4>数据来源</h4>
          <ul>
            <li>USDA NRCS Field Book for Describing and Sampling Soils v4.0</li>
            <li>USDA Soil Taxonomy / WRB 4th Edition 2022</li>
          </ul>
        </div>
      </aside>
    </div>

    <!-- 教学四要素机理与连贯性面板 -->
    <ModelPedagogyPanel
      theme="geology"
      :observe="pedagogy.observe"
      :change="pedagogy.change"
      :mechanism="pedagogy.mechanism"
      :limitations="pedagogy.limitations"
      :real-data-lab="{ title: 'Copernicus 珠峰地区高山寒漠土与植被垂直带', path: '/geo-labs/terrain', desc: '真实高程DEM看高寒植被与土壤垂直带' }"
      :textbook-link="{ grade: '高中', book: '必修第一册', chapter: '第五章', section: '第二节' }"
      practice-link="/practice"
      @reset="mode = 'simple'"
    />

    <InfoPopup
      :visible="!!selectedLayer"
      :layer="selectedLayer"
      :mode="infoMode"
      @close="selectedLayer = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { BaseScene } from '../engine/core/BaseScene.js'
import { SoilProfileModule } from '../engine/modules/SoilProfileModule.js'
import { SOIL_LAYERS } from './soilData.js'
import InfoPopup from './InfoPopup.vue'
import ModelPedagogyPanel from '../experiments/components/ModelPedagogyPanel.vue'

const pedagogy = {
  observe: [
    '成熟森林土壤自地表向下清晰的层序结构：有机层（O层）、腐殖质层（A层）、淋溶层（E层）、淀积层（B层）、成土母质层（C层）。',
    '颜色与肥力标志：A层因腐殖质富集呈深暗黑色；E层由于铁铝易溶成分淋失而呈灰白色；B层铁铝氧化物胶体沉淀富集呈红黄褐色彩。',
    '土壤质地由表层的轻壤疏松向深层的紧实粘重和半风化岩块颗粒渐变过渡。',
  ],
  change: [
    '在“简单模式（高中必修）”与“专业模式（USDA/WRB 亚层划分）”之间切换。',
    '点击 3D 剖面各土层，弹出交互卡片查看该层位厚度、水分、透气性与腐殖质含量参数。',
  ],
  mechanism: [
    '生物富集作用：植物根系从母质吸收矿质养分，地上茎叶枯落物经微生物分解合成为复杂的高分子腐殖质，维系土壤肥力。',
    '降水淋溶作用：水分在重力作用下向下渗透，溶解并搬运可溶性盐分与黏粒胶体，产生上部淋溶与下部淀积的剖面分化。',
    '成土五大因素：成土母质（物质基础）、气候（水热动力）、生物（主导活跃）、地形（水热再分配）、时间（成熟阶段）。',
  ],
  limitations: [
    '本 3D 模型以温带湿润森林棕壤/黑土为典型代表，未展示热带砖红壤（有机质分解极快几乎无腐殖质层）或干旱荒漠土（强钙积层）的特殊层序。',
    '土层界线在野外实际呈波状或舌状渐变过渡，模型为便于教学识别采用了清晰平滑分层。',
  ],
}

const containerRef = ref(null)
const mode = ref('simple')
const selectedLayer = ref(null)
const infoMode = ref('simple')

const simpleLayers = SOIL_LAYERS.simple
const profLayers = SOIL_LAYERS.professional

let engine = null

function selectLayer(layer, m) {
  infoMode.value = m
  selectedLayer.value = layer
}

watch(mode, (val) => {
  if (engine) {
    engine.setMode(val)
    engine.loadModule(SoilProfileModule, { mode: val })
  }
})

onMounted(async () => {
  await nextTick()
  if (!containerRef.value) return

  engine = new BaseScene(containerRef.value, { bg: 0xf5efe8, mode: 'simple' })
  engine.loadModule(SoilProfileModule, { mode: 'simple' })

  const ro = new ResizeObserver(() => {
    if (engine) engine.resize()
  })
  ro.observe(containerRef.value)
})

onUnmounted(() => {
  if (engine) engine.dispose()
  engine = null
})
</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  background: var(--surface-soft);
  color: var(--text);
}
.topbar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 18px;
  border-bottom: 1px solid var(--glass-border);
  background: var(--surface);
  -webkit-backdrop-filter: var(--blur);
  backdrop-filter: var(--blur);
  flex-shrink: 0;
}
.back-link {
  color: var(--accent);
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
}
.back-link:hover {
  text-decoration: underline;
}
.mode-toggle {
  display: flex;
  gap: 4px;
  margin: 0 auto;
}
.mode-btn {
  padding: 6px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-muted);
  font-size: 0.8rem;
  cursor: pointer;
}
.mode-btn.active {
  background: var(--accent);
  color: var(--accent-ink);
  border-color: var(--accent);
}
.chapter-ref {
  font-size: 12px;
  color: var(--text-muted);
}
#main {
  display: flex;
  flex: 1;
  overflow: hidden;
}
#canvas-container {
  flex: 1;
  position: relative;
  background: linear-gradient(180deg, rgba(255,255,255,0.68) 0%, rgba(238,243,251,0.68) 100%);
}
.controls-hint {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  color: #aaa;
  pointer-events: none;
}
#info-panel {
  width: 340px;
  padding: 16px;
  overflow-y: auto;
  background: var(--surface);
  border-left: 1px solid var(--glass-border);
  font-size: 0.85rem;
  line-height: 1.7;
  color: var(--text);
  -webkit-backdrop-filter: var(--blur);
  backdrop-filter: var(--blur);
}
#info-panel h2 {
  font-size: 1rem;
  margin-bottom: 4px;
  color: var(--accent);
}
#info-panel .subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 12px;
}
#info-panel h3 {
  font-size: 0.9rem;
  margin: 12px 0 6px;
  color: var(--accent);
}
#info-panel p {
  margin-bottom: 10px;
}
.layers-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.layer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  border-bottom: 1px solid var(--surface-soft);
  font-size: 0.8rem;
}
.layer-item:hover {
  background: var(--accent-softer);
}
.layer-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.15);
}
.layer-en {
  flex: 1;
  font-size: 0.7rem;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.info-badge {
  font-size: 14px;
  color: var(--accent);
  cursor: pointer;
  flex-shrink: 0;
}
.info-badge:hover {
  color: var(--accent-strong);
}
.sources {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}
.sources h4 {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0 0 6px;
}
.sources ul {
  margin: 0;
  padding-left: 16px;
  font-size: 0.7rem;
  color: var(--text-muted);
}
.sources li {
  margin-bottom: 2px;
}
@media (max-width: 768px) {
  #main {
    flex-direction: column;
  }
  #info-panel {
    width: 100%;
    height: 35vh;
    border-left: none;
    border-top: 1px solid var(--border);
  }
}
</style>
