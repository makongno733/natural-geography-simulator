<template>
  <div class="sandbox-root">
    <div class="sandbox-topbar">
      <button v-if="props.embedded" class="back-link" @click="$emit('close')">← 返回课文</button>
      <router-link v-else to="/高中/必修第一册/第六章/第一节" class="back-link">← 返回课文</router-link>
      <div class="mode-tabs">
        <button :class="['mode-btn', { active: mode === 'simple' }]" @click="mode = 'simple'">🔰 简单模式</button>
        <button :class="['mode-btn', { active: mode === 'professional' }]" @click="mode = 'professional'">🎓 专业模式</button>
      </div>
      <span class="chapter-ref">第六章 · 自然灾害</span>
    </div>

    <div class="sandbox-body">
      <aside class="module-panel">
        <h3 class="panel-title">灾害类型</h3>
        <div
          v-for="m in disasterModules" :key="m.id"
          :class="['module-card', { active: m.id === activeModule }]"
          @click="selectModule(m.id)"
        >
          <span class="module-icon">{{ m.icon }}</span>
          <div class="module-info">
            <strong>{{ m.label }}</strong>
            <span class="module-sub">{{ m.subtitle }}</span>
          </div>
        </div>
      </aside>

      <main class="viewport-area" ref="viewportRef">
        <div v-if="loading" class="viewport-loading">加载 3D 场景中…</div>
        <div v-else-if="initError" class="viewport-error">
          <p>⚠ 加载失败：{{ initError }}</p>
          <p class="error-hint">请检查浏览器是否支持 WebGL，或刷新页面重试。</p>
        </div>
        <div v-else class="viewport-toolbar">
          <label class="tool-item" v-if="activeModule === 'flood'">
            <span class="tool-label">水位</span>
            <input type="range" min="0" max="1" step="0.01" v-model.number="timeline" @input="onTimelineChange" class="timeline-slider">
          </label>
          <button class="tool-btn" @click="toggleAutoRotate">{{ autoRotate ? '⏸ 暂停' : '▶ 旋转' }}</button>
          <button class="tool-btn" @click="resetCamera">⟲ 复位</button>
        </div>
        <div v-if="!initError" class="viewport-hint">拖拽旋转 · 滚轮缩放 · 右键平移</div>
      </main>

      <aside class="info-panel">
        <h3 class="panel-title">{{ currentModule.label }}</h3>
        <p class="panel-desc">{{ currentModule.description }}</p>

        <div v-if="mode === 'simple'" class="knowledge-box">
          <h4>📖 教材要点</h4>
          <ul>
            <li v-for="pt in currentModule.keyPoints" :key="pt">{{ pt }}</li>
          </ul>
        </div>

        <div v-if="mode === 'professional'" class="knowledge-box professional">
          <h4>📚 学术扩展</h4>
          <ul>
            <li v-for="(pt, i) in currentModule.advancedPoints" :key="i">
              <GlossaryText :text="pt" :glossary="glossary" @show-term="openGlossary" />
            </li>
          </ul>
          <div class="ref-section" v-if="currentModule.references">
            <h4>📎 参考文献</h4>
            <p v-for="r in currentModule.references" :key="r" class="ref-item">{{ r }}</p>
          </div>
          <div class="param-section" v-if="currentModule.params">
            <h4>⚙ 关键参数</h4>
            <div v-for="p in currentModule.params" :key="p.label" class="param-row">
              <span class="param-label">{{ p.label }}</span>
              <span class="param-val">{{ p.value }}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <Teleport to="body">
      <div v-if="activeGlossaryTerm" class="glossary-mask" @click="activeGlossaryTerm = null"></div>
      <div v-if="activeGlossaryTerm" class="glossary-popup" :style="{ top: glossaryPos.y + 'px', left: glossaryPos.x + 'px' }">
        <h4 class="glossary-term">{{ activeGlossaryTerm.term }}</h4>
        <p class="glossary-def">{{ activeGlossaryTerm.explanation }}</p>
        <button class="glossary-close" @click="activeGlossaryTerm = null">✕</button>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { BaseScene } from '../engine/core/BaseScene.js'
import { DisasterModule } from '../engine/modules/DisasterModule.js'
import { disasterModules } from './modules/disasterModules.js'
import { disasterGlossary as glossary } from './modules/glossary.js'
import GlossaryText from './modules/GlossaryText.vue'

defineEmits(['close'])
const props = defineProps({
  embedded: { type: Boolean, default: false },
})

const viewportRef = ref(null)
const mode = ref('simple')
const activeModule = ref('typhoon')
const timeline = ref(0)
const autoRotate = ref(true)
const activeGlossaryTerm = ref(null)
const glossaryPos = ref({ x: 0, y: 0 })
const loading = ref(true)
const initError = ref('')

let engine = null

const currentModule = computed(() =>
  disasterModules.find(m => m.id === activeModule.value) || disasterModules[0]
)

function selectModule(id) {
  activeModule.value = id
  timeline.value = 0
  if (engine) { engine.setParams({ activeModule: id, timeline: 0 }) }
}

function onTimelineChange() {
  if (engine) engine.setParams({ timeline: timeline.value })
}

function toggleAutoRotate() {
  autoRotate.value = !autoRotate.value
  if (engine) engine.setAutoRotate(autoRotate.value)
}

function resetCamera() {
  if (engine) engine.resetCamera('orbit')
}

function openGlossary(term, event) {
  const rect = event.target.getBoundingClientRect()
  glossaryPos.value = { x: Math.min(rect.left, window.innerWidth - 300), y: rect.bottom + 6 }
  activeGlossaryTerm.value = term
}

watch(mode, (val) => { if (engine) engine.setMode(val) })

onMounted(async () => {
  await nextTick()
  if (!viewportRef.value) { initError.value = '容器未找到'; loading.value = false; return }
  try {
    engine = new BaseScene(viewportRef.value, { bg: 0x1a1a2e, mode: 'simple', lightPreset: 'dramatic' })
    engine.loadModule(DisasterModule, { mode: 'simple', activeModule: activeModule.value })
    loading.value = false
  } catch (e) {
    initError.value = e.message || '3D 引擎初始化失败'
    loading.value = false
    console.error('DisasterEngine init error:', e)
  }
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  if (engine) engine.dispose()
})

function onResize() { if (engine) engine.resize() }
</script>

<style scoped>
.sandbox-root {
  display: flex; flex-direction: column;
  height: calc(100vh - 96px);
  background: var(--surface-soft);
}
.sandbox-topbar {
  display: flex; align-items: center; gap: 14px;
  padding: 8px 18px;
  border-bottom: 1px solid var(--glass-border);
  background: var(--surface);
  -webkit-backdrop-filter: var(--blur);
  backdrop-filter: var(--blur);
  flex-shrink: 0;
}
.back-link {
  color: var(--accent); text-decoration: none; font-size: 13px; font-weight: 600;
  border: none; background: none; cursor: pointer;
}
.back-link:hover { text-decoration: underline; }
.mode-tabs { display: flex; gap: 4px; margin: 0 auto; }
.mode-btn {
  border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 5px 14px;
  font-size: 13px; background: var(--surface); color: var(--text); cursor: pointer;
  transition: background var(--transition), border-color var(--transition), color var(--transition);
}
.mode-btn.active { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.chapter-ref { font-size: 12px; color: var(--text-muted); }
.sandbox-body { display: flex; flex: 1; overflow: hidden; }

.module-panel {
  width: 210px; flex-shrink: 0; border-right: 1px solid var(--glass-border);
  padding: 12px; overflow-y: auto; background: var(--surface-soft);
  -webkit-backdrop-filter: var(--blur);
  backdrop-filter: var(--blur);
}
.panel-title { margin: 0 0 10px; font-size: 13px; color: var(--accent); font-weight: 700; }
.module-card {
  display: flex; gap: 8px; align-items: center; padding: 8px 10px;
  border-radius: var(--radius-sm); cursor: pointer; margin-bottom: 4px;
  border: 1px solid transparent;
  transition: background var(--transition), border-color var(--transition);
}
.module-card:hover { background: var(--accent-softer); }
.module-card.active { background: var(--accent-soft); border-color: var(--accent); }
.module-icon { font-size: 22px; }
.module-info strong { display: block; font-size: 13px; color: var(--text); }
.module-sub { font-size: 11px; color: var(--text-muted); }

.viewport-area { flex: 1; position: relative; overflow: hidden; }
.viewport-loading, .viewport-error {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  font-size: 15px; color: var(--text); background: var(--surface-soft);
}
.viewport-error p { margin: 4px 0; }
.error-hint { font-size: 12px; color: var(--text-faint); }
.viewport-toolbar {
  position: absolute; bottom: 14px; left: 14px; right: 14px;
  display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
  z-index: 10; background: var(--surface);
  border: 1px solid var(--glass-border); border-radius: var(--radius-sm); padding: 8px 12px;
  -webkit-backdrop-filter: var(--blur);
  backdrop-filter: var(--blur);
  box-shadow: var(--shadow-sm);
}
.tool-item { display: flex; align-items: center; gap: 6px; }
.tool-label { font-size: 12px; color: var(--text); min-width: 2em; }
.timeline-slider { width: 100px; accent-color: var(--accent); }
.tool-btn {
  border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface);
  padding: 4px 10px; font-size: 12px; color: var(--text); cursor: pointer;
}
.tool-btn:hover { background: var(--accent-softer); border-color: var(--accent); }
.viewport-hint { position: absolute; top: 10px; right: 14px; font-size: 11px; color: var(--text-faint); z-index: 10; }

.info-panel {
  width: 260px; flex-shrink: 0; border-left: 1px solid var(--glass-border);
  padding: 12px; overflow-y: auto; background: var(--surface-soft);
  -webkit-backdrop-filter: var(--blur);
  backdrop-filter: var(--blur);
}
.panel-desc { font-size: 13px; color: var(--text-muted); line-height: 1.6; margin: 0 0 12px; }
.knowledge-box {
  border: 1px solid var(--border); border-radius: var(--radius-sm);
  padding: 10px 12px; background: var(--surface);
}
.knowledge-box h4 { margin: 0 0 8px; font-size: 13px; color: var(--accent); }
.knowledge-box ul { margin: 0; padding-left: 16px; font-size: 12px; line-height: 1.7; color: var(--text); }
.knowledge-box.professional { border-left: 3px solid #4a56b8; }
.knowledge-box.professional h4 { color: #4a56b8; }
.ref-section { margin-top: 10px; }
.ref-item { font-size: 11px; color: var(--text-faint); line-height: 1.5; margin: 4px 0; }
.param-section { margin-top: 10px; }
.param-row { display: flex; justify-content: space-between; font-size: 12px; padding: 2px 0; border-bottom: 1px solid var(--border); }
.param-label { color: var(--text); }
.param-val { color: var(--accent); font-weight: 600; }

:global(.glossary-mask) {
  position: fixed; inset: 0; z-index: 100; background: transparent;
}
:global(.glossary-popup) {
  position: fixed; z-index: 101; max-width: 320px;
  background: var(--surface); border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm); padding: 12px 14px;
  box-shadow: var(--shadow-hover);
  -webkit-backdrop-filter: var(--blur); backdrop-filter: var(--blur);
}
:global(.glossary-term) { margin: 0 0 6px; font-size: 14px; color: var(--accent); padding-right: 24px; }
:global(.glossary-def) { margin: 0; font-size: 13px; line-height: 1.65; color: var(--text); }
:global(.glossary-close) {
  position: absolute; top: 6px; right: 8px; border: none; background: none;
  font-size: 16px; color: var(--text-faint); cursor: pointer; padding: 2px 6px; line-height: 1;
}
:global(.glossary-close:hover) { color: var(--accent); }
</style>
