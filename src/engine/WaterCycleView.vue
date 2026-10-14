<template>
  <div class="watercycle-root hydro-theme-wrap">
    <div class="watercycle-topbar">
      <button v-if="hasCloseListener" class="back-link" @click="$emit('close')">← 返回课文</button>
      <router-link v-else to="/experiments" class="back-link">← 返回实验列表</router-link>
      <div class="mode-toggles">
        <button
          :class="['mode-btn', { active: currentMode === 'simple' }]"
          @click="setMode('simple')"
          type="button"
        >高中必修</button>
        <button
          :class="['mode-btn', { active: currentMode === 'professional' }]"
          @click="setMode('professional')"
          type="button"
        >大学水文学</button>
      </div>
      <label class="speed-control">
        <span>循环演变时间轴</span>
        <input type="range" min="0" max="1" step="0.01" v-model.number="timeline" @input="onTimeline">
      </label>
      <span class="chapter-ref">必修一 · 第三章 地球上的水</span>
    </div>

    <div class="watercycle-canvas-container">
      <div ref="containerRef" class="watercycle-canvas"></div>
      <div class="canvas-tag">
        <span>海陆间大循环 · 陆地内循环 · 海上内循环</span>
      </div>
    </div>

    <!-- 教学四要素机理与连贯性面板 -->
    <ModelPedagogyPanel
      theme="hydrology"
      :observe="pedagogy.observe"
      :change="pedagogy.change"
      :mechanism="pedagogy.mechanism"
      :limitations="pedagogy.limitations"
      :real-data-lab="{ title: 'NASA 卫星多光谱地表水体与湖泊面积变动', path: '/geo-labs/satellite', desc: '真实卫星影像看洞庭湖与水库季节涨落' }"
      :textbook-link="{ grade: '高中', book: '必修第一册', chapter: '第三章', section: '第一节' }"
      practice-link="/practice"
      @reset="resetCycle"
    />
  </div>
</template>

<script setup>
import { computed, getCurrentInstance, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { BaseScene } from './core/BaseScene.js'
import { WaterCycleModule } from './modules/WaterCycleModule.js'
import ModelPedagogyPanel from '../experiments/components/ModelPedagogyPanel.vue'

const emit = defineEmits(['close'])
const containerRef = ref(null)
const currentMode = ref('simple')
const timeline = ref(0)
let engine = null

const instance = getCurrentInstance()
const hasCloseListener = computed(() => Boolean(instance?.vnode?.props?.onClose))

const pedagogy = {
  observe: [
    '海洋水受热蒸发，经高空水汽输送向内陆扩散，冷凝形成云层并在陆地上空产生降水。',
    '降落到陆地表面的水一部分形成地表径流（河流、湖泊）汇入海洋，一部分下渗补给土壤水与地下潜水/承压水。',
    '植物蒸腾作用将土壤水重新泵送至大气圈，构成陆地内循环的关键支流。',
  ],
  change: [
    '拖动“循环演变时间轴”，控制水汽蒸发、高空平流云层移动与地表径流汇流全过程。',
    '在“高中必修”与“大学水文学”模式间切换，查看水文地质深层渗流剖面与水热交换通量。',
  ],
  mechanism: [
    '水循环的驱动动力是太阳辐射能（相变吸热）与地球重力势能（高处汇流下切）。',
    '水循环连接水圈、大气圈、岩石圈和生物圈，维持全球水量动态平衡并促进高低纬度间热量传输。',
    '人类活动主要通过修建水库（调节径流时间分配）、跨流域调水（调节径流空间分配）、植树造林（增加入渗蒸腾）干预地表水循环。',
  ],
  limitations: [
    '模型为典型流域剖面教学展示，简化了干旱内流区与外流区的复杂流域地理分界。',
    '忽略了季节性冻土融封与冰川积雪对融雪径流的跨季节调蓄迟滞作用。',
  ],
}

function setMode(m) {
  currentMode.value = m
  engine?.setMode(m)
}

function onTimeline() {
  engine?.setParams({ timeline: timeline.value })
}

function resetCycle() {
  timeline.value = 0
  onTimeline()
}

onMounted(async () => {
  await nextTick()
  if (!containerRef.value) return
  engine = new BaseScene(containerRef.value, { bg: 0x05161b, mode: 'simple', lightPreset: 'sunlit' })
  engine.loadModule(WaterCycleModule, { mode: 'simple', timeline: 0 })
})

onBeforeUnmount(() => engine?.dispose())
</script>

<style scoped>
.hydro-theme-wrap {
  display: flex;
  flex-direction: column;
  background: #05161b;
  border-radius: var(--radius-card, 16px);
  padding: 16px;
  border: 1px solid rgba(13, 148, 136, 0.3);
  color: #f1f5f9;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  margin-bottom: 20px;
}
.watercycle-topbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.back-link {
  color: #2dd4bf;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  border: none;
  background: none;
  cursor: pointer;
}
.mode-toggles {
  display: flex;
  gap: 6px;
}
.mode-btn {
  border: 1px solid rgba(13, 148, 136, 0.3);
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 12px;
  background: rgba(19, 78, 74, 0.4);
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.2s;
}
.mode-btn.active {
  background: #0d9488;
  color: #fff;
  border-color: #2dd4bf;
}
.speed-control {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  color: #94a3b8;
  font-size: 12px;
}
.speed-control input {
  width: 140px;
  accent-color: #0d9488;
}
.chapter-ref {
  font-size: 12px;
  color: #64748b;
}

.watercycle-canvas-container {
  position: relative;
  width: 100%;
  height: 480px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-top: 12px;
}
.watercycle-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
.canvas-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(4, 47, 46, 0.85);
  border: 1px solid rgba(13, 148, 136, 0.4);
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #2dd4bf;
  pointer-events: none;
}

@media (max-width: 768px) {
  .watercycle-topbar { flex-direction: column; align-items: flex-start; }
  .speed-control { margin-left: 0; width: 100%; justify-content: space-between; }
  .watercycle-canvas-container { height: 320px; }
}
</style>
