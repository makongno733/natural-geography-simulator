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
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { SoilProfileScene } from './soilScene.js'
import { SOIL_LAYERS } from './soilData.js'
import InfoPopup from './InfoPopup.vue'

const containerRef = ref(null)
const mode = ref('simple')
const selectedLayer = ref(null)
const infoMode = ref('simple')

const simpleLayers = SOIL_LAYERS.simple
const profLayers = SOIL_LAYERS.professional

let scene = null

function selectLayer(layer, m) {
  infoMode.value = m
  selectedLayer.value = layer
}

onMounted(async () => {
  await nextTick()
  if (!containerRef.value) return

  scene = new SoilProfileScene(containerRef.value)
  scene.setOnLayerClick((layer, m) => {
    selectLayer(layer, m)
  })

  const ro = new ResizeObserver(() => {
    if (scene) scene.resize()
  })
  ro.observe(containerRef.value)
})

onUnmounted(() => {
  if (scene) scene.dispose()
  scene = null
})
</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  background: #f0ebe4;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif;
}
.topbar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 18px;
  border-bottom: 1px solid #d6ccc0;
  background: rgba(255, 255, 255, 0.95);
  flex-shrink: 0;
}
.back-link {
  color: #b01217;
  text-decoration: none;
  font-size: 13px;
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
  border: 1px solid #d6ccc0;
  border-radius: 6px;
  background: transparent;
  color: #6b5a4e;
  font-size: 0.8rem;
  cursor: pointer;
}
.mode-btn.active {
  background: #b01217;
  color: #fff;
  border-color: #b01217;
}
.chapter-ref {
  font-size: 12px;
  color: #8a7a6e;
}
#main {
  display: flex;
  flex: 1;
  overflow: hidden;
}
#canvas-container {
  flex: 1;
  position: relative;
  background: linear-gradient(180deg, #e8e2d8 0%, #d6cec2 100%);
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
  background: rgba(255, 255, 255, 0.97);
  border-left: 1px solid #d6ccc0;
  font-size: 0.85rem;
  line-height: 1.7;
  color: #444;
}
#info-panel h2 {
  font-size: 1rem;
  margin-bottom: 4px;
  color: #b01217;
}
#info-panel .subtitle {
  font-size: 0.8rem;
  color: #8a7a6e;
  margin-bottom: 12px;
}
#info-panel h3 {
  font-size: 0.9rem;
  margin: 12px 0 6px;
  color: #b01217;
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
  border-bottom: 1px solid #f0ebe4;
  font-size: 0.8rem;
}
.layer-item:hover {
  background: rgba(183, 55, 44, 0.06);
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
  color: #8a7a6e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.info-badge {
  font-size: 14px;
  color: #b01217;
  cursor: pointer;
  flex-shrink: 0;
}
.info-badge:hover {
  color: #d4322a;
}
.sources {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #e0d6cc;
}
.sources h4 {
  font-size: 0.8rem;
  color: #8a7a6e;
  margin: 0 0 6px;
}
.sources ul {
  margin: 0;
  padding-left: 16px;
  font-size: 0.7rem;
  color: #8a7a6e;
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
    border-top: 1px solid #d6ccc0;
  }
}
</style>
