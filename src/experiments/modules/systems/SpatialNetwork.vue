<template>
  <section class="sn-root">
    <div ref="containerRef" class="sn-canvas"></div>

    <button class="sn-reset" @click="resetCamera" title="复位视角">↺ 复位</button>

    <aside class="sn-panel">
      <p class="sn-kicker">空间网络系统沙盘</p>
      <h3>{{ config.title }}</h3>
      <p class="sn-subtitle">{{ config.subtitle }}</p>
      <div v-if="flowLabels.length" class="sn-tags">
        <span v-for="label in flowLabels" :key="label">{{ label }}</span>
      </div>
      <p class="sn-hint">🖱 拖动旋转 · 滚轮缩放</p>
    </aside>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { BaseScene } from '../../../engine/core/BaseScene.js'
import { createSpatialNetworkModule } from '../../../engine/modules/SpatialNetworkModule.js'
import { getSpatialNetworkConfig } from './sceneConfigs.js'

const props = defineProps({
  preset: { type: Object, default: () => ({}) },
  lessonContext: { type: Object, default: () => ({}) },
})

const containerRef = ref(null)
let engine = null
let resizeObserver = null

const config = computed(() => getSpatialNetworkConfig(props.preset))
const flowLabels = computed(() => config.value.flows?.map((flow) => flow.label).filter(Boolean) || [])

function loadModule() {
  if (!engine) return
  engine.loadModule(createSpatialNetworkModule, { config: config.value })
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
    bg: 0x08121f,
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
.sn-root {
  position: relative;
  height: 62vh;
  min-height: 460px;
  border: 1px solid rgba(110, 150, 220, 0.22);
  border-radius: 16px;
  overflow: hidden;
  background: radial-gradient(circle at 32% 22%, #14284a 0, #08121f 46%, #04070d 100%);
  box-shadow: 0 16px 40px rgba(8, 18, 34, 0.35);
}

.sn-canvas {
  width: 100%;
  height: 100%;
}

.sn-reset {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  padding: 7px 12px;
  border: 1px solid rgba(210, 225, 255, 0.2);
  border-radius: 999px;
  font-size: 12px;
  color: #dce8ff;
  background: rgba(8, 16, 30, 0.72);
  backdrop-filter: blur(10px);
  cursor: pointer;
}

.sn-reset:hover {
  background: rgba(255, 255, 255, 0.14);
}

.sn-panel {
  position: absolute;
  left: 14px;
  bottom: 14px;
  width: min(320px, calc(100% - 28px));
  padding: 14px;
  color: #eef5ff;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 14px;
  background: rgba(4, 10, 18, 0.66);
  backdrop-filter: blur(16px);
}

.sn-kicker {
  margin: 0 0 4px;
  font-size: 11px;
  letter-spacing: 0.12em;
  color: #91b9ff;
}

.sn-panel h3 {
  margin: 0 0 6px;
  font-size: 17px;
}

.sn-subtitle {
  margin: 0 0 10px;
  font-size: 12px;
  line-height: 1.55;
  color: #cad9f3;
}

.sn-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.sn-tags span {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  padding: 3px 8px;
  font-size: 11px;
  color: #fff0ce;
  background: rgba(255, 235, 196, 0.08);
}

.sn-hint {
  margin: 0;
  font-size: 11px;
  color: #9fb4d7;
}

@media (max-width: 720px) {
  .sn-root {
    height: 68vh;
    min-height: 420px;
  }
}
</style>
