<template>
  <section class="chapter3d-root">
    <div class="chapter3d-toolbar">
      <button class="back-link" @click="emit('close')">返回课文</button>
      <div class="chapter3d-title-wrap">
        <strong>{{ recipe.title }}</strong>
        <span>{{ recipe.book }} · {{ recipe.chapter }}</span>
      </div>
      <div class="chapter3d-actions">
        <button
          :class="['mode-btn', { active: currentMode === 'simple' }]"
          @click="setMode('simple')"
        >概览</button>
        <button
          :class="['mode-btn', { active: currentMode === 'professional' }]"
          @click="setMode('professional')"
        >精细</button>
        <button class="mode-btn" @click="resetCamera">复位</button>
      </div>
    </div>

    <div class="chapter3d-stage">
      <div ref="containerRef" class="chapter3d-canvas"></div>
      <aside class="chapter3d-panel">
        <p class="panel-kicker">章节 3D 总览</p>
        <h3>{{ recipe.chapterTitle || recipe.title }}</h3>
        <p>{{ recipe.subtitle }}</p>
        <div class="panel-grid">
          <span v-for="item in visibleMetrics" :key="item">{{ item }}</span>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { BaseScene } from '../../engine/core/BaseScene.js'
import { ChapterConceptModule } from '../../engine/modules/ChapterConceptModule.js'

const props = defineProps({
  recipe: {
    type: Object,
    required: true,
  },
})
const emit = defineEmits(['close'])

const containerRef = ref(null)
const currentMode = ref('simple')
let engine = null
let resizeObserver = null

const visibleMetrics = computed(() => props.recipe.metrics?.slice(0, 4) || [])

function loadCurrentRecipe() {
  if (!engine || !props.recipe) return
  engine.loadModule(ChapterConceptModule, {
    mode: currentMode.value,
    recipe: props.recipe,
  })
  engine.resetCamera('orbit')
}

function setMode(mode) {
  currentMode.value = mode
  loadCurrentRecipe()
}

function resetCamera() {
  engine?.resetCamera('orbit')
}

watch(() => props.recipe, () => {
  loadCurrentRecipe()
}, { deep: true })

onMounted(async () => {
  await nextTick()
  if (!containerRef.value) return

  engine = new BaseScene(containerRef.value, {
    bg: 0x08111f,
    mode: currentMode.value,
    lightPreset: 'sunlit',
    fov: 42,
    minDistance: 2.2,
    maxDistance: 18,
    autoRotate: false,
  })
  loadCurrentRecipe()

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
.chapter3d-root {
  height: calc(100vh - 104px);
  min-height: 620px;
  border: 1px solid rgba(112, 52, 42, 0.22);
  border-radius: 18px;
  overflow: hidden;
  background: radial-gradient(circle at 30% 20%, #182845 0, #08111f 44%, #050912 100%);
  box-shadow: 0 18px 44px rgba(45, 20, 12, 0.2);
}

.chapter3d-toolbar {
  height: 52px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  color: #eef5ff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(6, 12, 24, 0.86);
  backdrop-filter: blur(14px);
}

.back-link,
.mode-btn {
  border: 1px solid rgba(210, 225, 255, 0.18);
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  color: #dce8ff;
  background: rgba(255, 255, 255, 0.07);
  cursor: pointer;
}

.mode-btn.active {
  color: #7a241b;
  border-color: #ffdfb6;
  background: #fff3dc;
  font-weight: 700;
}

.chapter3d-title-wrap {
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.chapter3d-title-wrap strong {
  overflow: hidden;
  font-size: 15px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.chapter3d-title-wrap span {
  flex-shrink: 0;
  font-size: 11px;
  color: #9fb4d7;
}

.chapter3d-actions {
  display: flex;
  gap: 6px;
}

.chapter3d-stage {
  position: relative;
  height: calc(100% - 52px);
}

.chapter3d-canvas {
  width: 100%;
  height: 100%;
}

.chapter3d-panel {
  position: absolute;
  left: 14px;
  bottom: 14px;
  width: min(320px, calc(100% - 28px));
  padding: 12px;
  color: #eef5ff;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 14px;
  background: rgba(4, 10, 18, 0.64);
  backdrop-filter: blur(16px);
}

.panel-kicker {
  margin: 0 0 4px;
  font-size: 11px;
  letter-spacing: 0.12em;
  color: #91b9ff;
}

.chapter3d-panel h3 {
  margin: 0 0 6px;
  font-size: 16px;
}

.chapter3d-panel p {
  margin: 0 0 10px;
  font-size: 12px;
  line-height: 1.55;
  color: #cad9f3;
}

.panel-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.panel-grid span {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  padding: 3px 8px;
  font-size: 11px;
  color: #fff0ce;
  background: rgba(255, 235, 196, 0.08);
}

@media (max-width: 720px) {
  .chapter3d-root {
    height: 72vh;
    min-height: 500px;
  }

  .chapter3d-toolbar {
    height: auto;
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .chapter3d-title-wrap {
    flex-direction: column;
    gap: 2px;
  }

  .chapter3d-stage {
    height: calc(100% - 108px);
  }
}

</style>
