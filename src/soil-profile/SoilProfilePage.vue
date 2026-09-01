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
