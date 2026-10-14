<template>
  <section class="he-root">
    <div ref="containerRef" class="he-canvas"></div>

    <button class="he-reset" @click="resetCamera" title="复位视角">↺ 复位</button>

    <aside class="he-panel">
      <p class="he-kicker">人地关系系统沙盘</p>
      <h3>{{ config.title }}</h3>
      <p class="he-subtitle">{{ config.subtitle }}</p>
      <div v-if="thresholdLabels.length" class="he-tags">
        <span v-for="label in thresholdLabels" :key="label">{{ label }}</span>
      </div>
      <p class="he-hint">🖱 拖动旋转 · 滚轮缩放</p>
    </aside>
  </section>

  <!-- 教学四要素机理与连贯性面板 -->
  <ModelPedagogyPanel
    theme="systems"
    :observe="pedagogy.observe"
    :change="pedagogy.change"
    :mechanism="pedagogy.mechanism"
    :limitations="pedagogy.limitations"
    :real-data-lab="{ title: 'NASA 卫星植被指数 (NDVI) 与地表退化监测', path: '/geo-labs/satellite', desc: '真实卫星数据监测荒漠化与生态修复' }"
    :textbook-link="{ grade: '高中', book: '选择性必修3', chapter: '第一章', section: '第一节' }"
    practice-link="/practice"
    @reset="resetCamera"
  />
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { BaseScene } from '../../../engine/core/BaseScene.js'
import { createHumanEnvironmentModule } from '../../../engine/modules/HumanEnvironmentModule.js'
import { getHumanEnvironmentConfig } from './sceneConfigs.js'
import ModelPedagogyPanel from '../../components/ModelPedagogyPanel.vue'

const pedagogy = {
  observe: [
    '自然生态子系统（水、土、气、生、矿）与人类社会经济子系统之间的物质能量双向循环通量。',
    '环境承载力阈值红线：生态服务功能（供给、调节、支持、文化）的自净与再生上限。',
    '废弃物排放与环境容量赤字之间的动态平衡关系。',
  ],
  change: [
    '随教材各小节预设，切换生态系统服务、资源安全屏障、环境污染治理与国家安全战略模型。',
    '旋转查看多维人地系统因果链与反馈环网络。',
  ],
  mechanism: [
    '人地协调论：自然环境是人类生存的物质基础，人类生产活动必须以资源环境承载力为边界约束。',
    '生态系统阈值效应：当污染排放速率超越环境自净能力或资源开采速率超过再生速率时，系统将发生失衡。',
    '可持续发展准则：公平性（代内与代际公平）、持续性（生态与经济协调）、共同性（全球环境治理合作）。',
  ],
  limitations: [
    '模型为系统动力学概念拓扑，未包含多重混沌气候反馈突变点（Tipping points）的随机微分方程模拟。',
    '各国家地区差异显著，模型展示全球与区域尺度的普适性定性规律。',
  ],
}

const props = defineProps({
  preset: { type: Object, default: () => ({}) },
  lessonContext: { type: Object, default: () => ({}) },
})

const containerRef = ref(null)
let engine = null
let resizeObserver = null

const config = computed(() => getHumanEnvironmentConfig(props.preset))
const thresholdLabels = computed(() => config.value.thresholds?.map((threshold) => threshold.label).filter(Boolean) || [])

function loadModule() {
  if (!engine) return
  engine.loadModule(createHumanEnvironmentModule, { config: config.value })
  engine.resetCamera('orbit')
}

function resetCamera() {
  engine?.resetCamera('orbit')
}

watch(config, () => {
  loadModule()
})

onMounted(async () => {
  await nextTick()
  if (!containerRef.value) return

  engine = new BaseScene(containerRef.value, {
    antialias: true,
    shadows: true,
    toneExposure: 1.2,
    lightPreset: 'studio',
    bg: 0x06140d,
    fov: 42,
    minDistance: 2.2,
    maxDistance: 16,
  })
  loadModule()

  resizeObserver = new ResizeObserver(() => engine?.resize())
  resizeObserver.observe(containerRef.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  engine?.dispose()
  engine = null
})
</script>

<style scoped>
.he-root {
  position: relative;
  height: 62vh;
  min-height: 460px;
  border: 1px solid rgba(96, 190, 140, 0.22);
  border-radius: 16px;
  overflow: hidden;
  background: radial-gradient(circle at 30% 20%, #0e2b1e 0, #06140d 46%, #030a06 100%);
  box-shadow: 0 16px 40px rgba(6, 20, 13, 0.35);
}

.he-canvas {
  width: 100%;
  height: 100%;
}

.he-reset {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  padding: 7px 12px;
  border: 1px solid rgba(210, 235, 220, 0.2);
  border-radius: 999px;
  font-size: 12px;
  color: #e0f2e8;
  background: rgba(6, 20, 13, 0.72);
  backdrop-filter: blur(10px);
  cursor: pointer;
}

.he-reset:hover {
  background: rgba(255, 255, 255, 0.14);
}

.he-panel {
  position: absolute;
  left: 14px;
  bottom: 14px;
  width: min(320px, calc(100% - 28px));
  padding: 14px;
  color: #eef7f1;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 14px;
  background: rgba(3, 10, 6, 0.66);
  backdrop-filter: blur(16px);
}

.he-kicker {
  margin: 0 0 4px;
  font-size: 11px;
  letter-spacing: 0.12em;
  color: #8fd6a8;
}

.he-panel h3 {
  margin: 0 0 6px;
  font-size: 17px;
}

.he-subtitle {
  margin: 0 0 10px;
  font-size: 12px;
  line-height: 1.55;
  color: #cfe7d8;
}

.he-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.he-tags span {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  padding: 3px 8px;
  font-size: 11px;
  color: #f8ffd0;
  background: rgba(244, 211, 94, 0.08);
}

.he-hint {
  margin: 0;
  font-size: 11px;
  color: #9fc6ad;
}

@media (max-width: 720px) {
  .he-root {
    height: 68vh;
    min-height: 420px;
  }
}
</style>
