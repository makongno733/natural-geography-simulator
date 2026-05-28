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
.watercycle-root {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 96px);
  background: #0a1a2a;
}
.watercycle-topbar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 18px;
  border-bottom: 1px solid #333;
  background: rgba(10, 20, 30, 0.95);
  flex-shrink: 0;
}
.back-link {
  color: #60a5fa;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  border: none;
  background: none;
  cursor: pointer;
}
.mode-btn {
  border: 1px solid #444;
  border-radius: 6px;
  padding: 5px 14px;
  font-size: 13px;
  background: #fff;
  color: #6b3b32;
  cursor: pointer;
}
.mode-btn.active {
  background: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
}
.speed-control {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 auto;
  color: #aaa;
  font-size: 12px;
}
.speed-control input {
  width: 120px;
  accent-color: #3b82f6;
}
.chapter-ref {
  font-size: 12px;
  color: #555;
}
.watercycle-canvas {
  flex: 1;
}
</style>
