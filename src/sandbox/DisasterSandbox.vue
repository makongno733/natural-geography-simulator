<template>
  <div class="sandbox-root">
    <div class="sandbox-topbar">
      <router-link to="/高中/必修第一册/第六章/第一节" class="back-link">← 返回课文</router-link>
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
        <div class="viewport-toolbar">
          <label class="tool-item" v-if="activeModule === 'flood'">
            <span class="tool-label">水位</span>
            <input type="range" min="0" max="1" step="0.01" v-model.number="timeline" @input="onTimelineChange" class="timeline-slider">
          </label>
          <button class="tool-btn" @click="toggleAutoRotate">{{ autoRotate ? '⏸ 暂停' : '▶ 旋转' }}</button>
          <button class="tool-btn" @click="resetCamera">⟲ 复位</button>
        </div>
        <div class="viewport-hint">拖拽旋转 · 滚轮缩放 · 右键平移</div>
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
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { DisasterEngine } from './engine/DisasterEngine.js'
import { disasterModules } from './modules/disasterModules.js'
import { disasterGlossary as glossary } from './modules/glossary.js'
import GlossaryText from './modules/GlossaryText.vue'

const viewportRef = ref(null)
const mode = ref('simple')
const activeModule = ref('typhoon')
const timeline = ref(0)
const autoRotate = ref(true)
const activeGlossaryTerm = ref(null)
const glossaryPos = ref({ x: 0, y: 0 })

let engine = null

const currentModule = computed(() =>
  disasterModules.find(m => m.id === activeModule.value) || disasterModules[0]
)

function selectModule(id) {
  activeModule.value = id
  timeline.value = 0
  if (engine) { engine.setModule(id); engine.setTimeline(0) }
}

function onTimelineChange() {
  if (engine) engine.setTimeline(timeline.value)
}

function toggleAutoRotate() {
  autoRotate.value = !autoRotate.value
  if (engine) engine.setAutoRotate(autoRotate.value)
}

function resetCamera() {
  if (engine) {
    engine.camera.position.set(5, 4, 6)
    engine.controls.target.set(0, 0, 0)
    engine.controls.update()
  }
}

function openGlossary(term, event) {
  const rect = event.target.getBoundingClientRect()
  glossaryPos.value = { x: Math.min(rect.left, window.innerWidth - 300), y: rect.bottom + 6 }
  activeGlossaryTerm.value = term
}

watch(mode, (val) => { if (engine) engine.setMode(val) })

onMounted(() => {
  if (!viewportRef.value) return
  engine = new DisasterEngine(viewportRef.value)
  engine.setModule(activeModule.value)
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
  background: var(--cream);
}
.sandbox-topbar {
  display: flex; align-items: center; gap: 14px;
  padding: 8px 18px;
  border-bottom: 1px solid var(--brown-light);
  background: rgba(255,255,255,0.92);
  flex-shrink: 0;
}
.back-link {
  color: var(--red); text-decoration: none; font-size: 13px; font-weight: 600;
  border: none; background: none; cursor: pointer;
}
.back-link:hover { text-decoration: underline; }
.mode-tabs { display: flex; gap: 4px; margin: 0 auto; }
.mode-btn {
  border: 1px solid var(--brown); border-radius: 6px; padding: 5px 14px;
  font-size: 13px; background: #fff; color: #6b3b32; cursor: pointer;
}
.mode-btn.active { background: var(--red); color: #fff; border-color: var(--red); }
.chapter-ref { font-size: 12px; color: var(--muted); }
.sandbox-body { display: flex; flex: 1; overflow: hidden; }

.module-panel {
  width: 210px; flex-shrink: 0; border-right: 1px solid var(--brown-light);
  padding: 12px; overflow-y: auto; background: rgba(255,252,246,0.9);
}
.panel-title { margin: 0 0 10px; font-size: 13px; color: var(--red); font-weight: 700; }
.module-card {
  display: flex; gap: 8px; align-items: center; padding: 8px 10px;
  border-radius: 8px; cursor: pointer; margin-bottom: 4px;
  border: 1px solid transparent;
}
.module-card:hover { background: rgba(183,55,44,0.05); }
.module-card.active { background: rgba(183,55,44,0.1); border-color: var(--brown); }
.module-icon { font-size: 22px; }
.module-info strong { display: block; font-size: 13px; color: #3d2822; }
.module-sub { font-size: 11px; color: var(--muted); }

.viewport-area { flex: 1; position: relative; overflow: hidden; }
.viewport-toolbar {
  position: absolute; bottom: 14px; left: 14px; right: 14px;
  display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
  z-index: 10; background: rgba(255,255,255,0.88);
  border: 1px solid var(--brown-light); border-radius: 8px; padding: 8px 12px;
}
.tool-item { display: flex; align-items: center; gap: 6px; }
.tool-label { font-size: 12px; color: #6b3b32; min-width: 2em; }
.timeline-slider { width: 100px; accent-color: var(--red); }
.tool-btn {
  border: 1px solid var(--brown); border-radius: 6px; background: #fff;
  padding: 4px 10px; font-size: 12px; color: #6b3b32; cursor: pointer;
}
.tool-btn:hover { background: rgba(183,55,44,0.06); }
.viewport-hint { position: absolute; top: 10px; right: 14px; font-size: 11px; color: #99897a; z-index: 10; }

.info-panel {
  width: 260px; flex-shrink: 0; border-left: 1px solid var(--brown-light);
  padding: 12px; overflow-y: auto; background: rgba(255,252,246,0.9);
}
.panel-desc { font-size: 13px; color: #5a3f35; line-height: 1.6; margin: 0 0 12px; }
.knowledge-box {
  border: 1px solid var(--brown); border-radius: var(--radius-sm);
  padding: 10px 12px; background: #fffdf8;
}
.knowledge-box h4 { margin: 0 0 8px; font-size: 13px; color: var(--red); }
.knowledge-box ul { margin: 0; padding-left: 16px; font-size: 12px; line-height: 1.7; color: #4a3229; }
.knowledge-box.professional { border-left: 3px solid #6b4a8a; }
.knowledge-box.professional h4 { color: #6b4a8a; }
.ref-section { margin-top: 10px; }
.ref-item { font-size: 11px; color: #7a6051; line-height: 1.5; margin: 4px 0; }
.param-section { margin-top: 10px; }
.param-row { display: flex; justify-content: space-between; font-size: 12px; padding: 2px 0; border-bottom: 1px solid var(--brown-light); }
.param-label { color: #6b3b32; }
.param-val { color: var(--red); font-weight: 600; }
</style>
