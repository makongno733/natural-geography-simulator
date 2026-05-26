# 3D 地理沙盒系统 — Phase 1 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the 3D Geographic Sandbox shell and refactor the existing river terrain module into a modular, academically-oriented teaching system.

**Architecture:** Three-column Vue UI (module tree | 3D viewport | info panel) wrapping the existing `terrainScene.js` via a SceneEngine adapter. Modules register via a GeoModule interface. Simple hash-based view switching between sandbox and atmosphere — no extra deps (no vue-router, no Pinia).

**Tech Stack:** Vue 3 (Composition API), Three.js, Vite, existing `terrainScene.js`

---

## File Structure

### New files to create:
- `src/AtmosphereView.vue` — extracted from current App.vue
- `src/sandbox/SandboxApp.vue` — sandbox route view root
- `src/sandbox/SandboxShell.vue` — three-column layout
- `src/sandbox/ModulePanel.vue` — left: module navigation tree
- `src/sandbox/SceneViewport.vue` — center: 3D viewport container
- `src/sandbox/InfoPanel.vue` — right: knowledge/status panel
- `src/sandbox/engine/SceneEngine.js` — wrapper around `terrainScene.js`
- `src/sandbox/modules/GeoModule.js` — module interface
- `src/sandbox/modules/registry.js` — module registry
- `src/sandbox/modules/fluvial/index.js` — fluvial module
- `src/sandbox/modules/fluvial/knowledge.js` — knowledge entries

### Files to modify:
- `src/App.vue` — add hash-based view routing
- `src/lib/terrainScene.js` — expose `scene` for annotation system

---

### Task 1: Refactor App.vue with hash-based routing

**Files:**
- Create: `src/AtmosphereView.vue`
- Modify: `src/App.vue`

- [ ] **Step 1: Create AtmosphereView.vue**

Copy the entire `<template>`, `<script setup>`, and `<style scoped>` content from current `src/App.vue` into a new file `src/AtmosphereView.vue`. Import `createAtmosphereScene` and `layers` in the script.

```vue
<template>
  <!-- Paste the full template from current App.vue here -->
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { createAtmosphereScene } from "./lib/atmosphereScene.js"

// Paste the full script from current App.vue here
// including: layers, compositionRows, sceneHost, altitudeKm,
// activeLayerIndex, scopeMode, animated, functions, lifecycle hooks
</script>

<style scoped>
/* Paste the full scoped styles from current App.vue here */
</style>
```

- [ ] **Step 2: Replace App.vue with router shell**

```vue
<template>
  <div class="app-root">
    <nav class="app-nav">
      <a href="#/atmosphere" :class="{ active: view === 'atmosphere' }">大气结构</a>
      <a href="#/sandbox" :class="{ active: view === 'sandbox' }">地貌沙盒</a>
    </nav>
    <AtmosphereView v-if="view === 'atmosphere'" />
    <SandboxApp v-else-if="view === 'sandbox'" />
    <div v-else class="welcome">
      <h1>自然地理教学系统</h1>
      <p>请选择上方模块</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import AtmosphereView from './AtmosphereView.vue'
import SandboxApp from './sandbox/SandboxApp.vue'

const view = ref(window.location.hash.slice(1) || '')

function onHashChange() {
  view.value = window.location.hash.slice(1) || ''
}

onMounted(() => window.addEventListener('hashchange', onHashChange))
onUnmounted(() => window.removeEventListener('hashchange', onHashChange))
</script>

<style scoped>
.app-root { min-height: 100vh; }
.app-nav {
  display: flex; gap: 0; justify-content: center;
  padding: 8px; background: linear-gradient(180deg, #d8e9ff, #eef5ff);
  border-bottom: 1px solid #a9c6e8;
}
.app-nav a {
  padding: 6px 20px; font-size: 0.85rem; color: #365776;
  text-decoration: none; border: 1px solid #a9c6e8;
  border-radius: 8px 8px 0 0; background: rgba(247,252,255,0.6);
  margin: 0 2px;
}
.app-nav a.active {
  background: #f7fcff; border-bottom-color: #f7fcff;
  color: #0f2542; font-weight: 600;
}
.welcome {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; min-height: 60vh; color: #365776;
}
</style>
```

- [ ] **Step 3: Verify routing works**

Run: `pnpm dev`
Expected: Atmosphere view works at `#/atmosphere`. `#/sandbox` shows blank page (components not built yet).

- [ ] **Step 4: Commit**

```bash
git add src/App.vue src/AtmosphereView.vue
git commit -m "refactor: extract AtmosphereView, add hash routing for sandbox"
```

---

### Task 2: Build sandbox Vue shell components

**Files:**
- Create: `src/sandbox/ModulePanel.vue`
- Create: `src/sandbox/SceneViewport.vue`
- Create: `src/sandbox/InfoPanel.vue`
- Create: `src/sandbox/SandboxShell.vue`
- Create: `src/sandbox/SandboxApp.vue`

- [ ] **Step 1: Create sandbox directory**

```bash
mkdir -p src/sandbox/engine src/sandbox/modules/fluvial
```

- [ ] **Step 2: Create ModulePanel.vue**

```vue
<template>
  <aside class="module-panel">
    <div class="panel-section">
      <h3>地貌模块</h3>
      <ul class="module-list">
        <li v-for="m in modules" :key="m.id"
          class="module-item"
          :class="{ active: m.id === activeModuleId, locked: m.locked }"
          @click="m.locked || $emit('select', m.id)">
          <span class="icon">{{ m.icon }}</span>
          <span class="name">{{ m.name }}</span>
          <span v-if="m.locked" class="badge">即将</span>
        </li>
      </ul>
    </div>
    <div class="panel-section">
      <h3>参数控制</h3>
      <div class="params">
        <label class="param-row">
          <span>演化时间</span>
          <input type="range" min="0" max="1" step="0.01"
            :value="params.timeline"
            @input="$emit('update:params',{...params,timeline:+$event.target.value})" />
          <span class="val">{{(params.timeline*100).toFixed(0)}}%</span>
        </label>
        <label class="param-row">
          <span>气候强度</span>
          <input type="range" min="0" max="1" step="0.01"
            :value="params.climate"
            @input="$emit('update:params',{...params,climate:+$event.target.value})" />
          <span class="val">{{(params.climate*100).toFixed(0)}}%</span>
        </label>
        <label class="param-row">
          <span>抬升速率</span>
          <input type="range" min="0" max="1" step="0.01"
            :value="params.uplift"
            @input="$emit('update:params',{...params,uplift:+$event.target.value})" />
          <span class="val">{{(params.uplift*100).toFixed(0)}}%</span>
        </label>
      </div>
    </div>
    <div class="panel-section">
      <h3>工具</h3>
      <div class="tool-grid">
        <button class="tool-btn" @click="$emit('tool','resetView')">重置视角</button>
        <button class="tool-btn" :class="{active:params.viewMode==='section'}"
          @click="$emit('tool','toggleSection')">剖面</button>
        <button class="tool-btn" @click="$emit('tool','autoRotate')">旋转</button>
        <button class="tool-btn" @click="$emit('tool','measure')">测量</button>
      </div>
    </div>
    <div class="panel-section weather-section">
      <h3>天气</h3>
      <div class="weather-grid">
        <button v-for="w in weatherModes" :key="w.id"
          class="weather-btn" :class="{active:params.weatherMode===w.id}"
          @click="$emit('update:params',{...params,weatherMode:w.id})">{{ w.label }}</button>
      </div>
    </div>
  </aside>
</template>

<script setup>
defineProps({ modules: Array, activeModuleId: String, params: Object })
defineEmits(['select','update:params','tool'])
const weatherModes = [
  { id: 'clear', label: '晴' }, { id: 'rain', label: '雨' },
  { id: 'snow', label: '雪' }, { id: 'cloud', label: '阴' }, { id: 'fog', label: '雾' }
]
</script>

<style scoped>
.module-panel{background:rgba(247,252,255,0.88);border:1px solid #a9c6e8;border-radius:9px;padding:8px;font-size:.75rem}
.panel-section{margin-bottom:10px}
.panel-section h3{margin:0 0 6px;font-size:.75rem;color:#1d4f81;font-weight:600}
.module-list{list-style:none;margin:0;padding:0;display:grid;gap:3px}
.module-item{padding:5px 8px;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:6px;color:#365776;border:1px solid transparent}
.module-item:hover{background:rgba(202,231,255,.4)}
.module-item.active{background:#cae7ff;border-color:#7bb4e7;color:#113f6a;font-weight:600}
.module-item.locked{opacity:.5;cursor:not-allowed}
.module-item .icon{font-size:1rem}
.module-item .badge{font-size:.6rem;background:#d0e3f8;padding:1px 5px;border-radius:4px;margin-left:auto;color:#5a7f9f}
.params{display:grid;gap:6px}
.param-row{display:grid;grid-template-columns:60px 1fr 30px;gap:4px;align-items:center;font-size:.68rem;color:#365776}
.param-row input{height:4px;accent-color:#3688cf}
.param-row .val{font-size:.64rem;color:#5a7f9f;text-align:right}
.tool-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px}
.tool-btn{border:1px solid #a9c6e8;border-radius:8px;padding:5px;background:#f9fcff;color:#365776;font-size:.65rem;cursor:pointer;text-align:center}
.tool-btn.active{background:#cae7ff;border-color:#7bb4e7;color:#113f6a;font-weight:600}
.weather-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:3px}
.weather-btn{border:1px solid #a9c6e8;border-radius:6px;padding:4px 2px;background:#f9fcff;color:#365776;font-size:.6rem;cursor:pointer;text-align:center}
.weather-btn.active{background:#cae7ff;border-color:#7bb4e7;color:#113f6a;font-weight:600}
</style>
```

- [ ] **Step 3: Create SceneViewport.vue**

```vue
<template>
  <div ref="viewportHost" class="scene-viewport"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const viewportHost = ref(null)
const emit = defineEmits(['sceneReady'])

onMounted(() => {
  if (viewportHost.value) emit('sceneReady', viewportHost.value)
})
</script>

<style scoped>
.scene-viewport{width:100%;min-height:400px;background:linear-gradient(135deg,#2a78be 0%,#73b7ef 36%,#bde2ff 100%);border-radius:9px;overflow:hidden;position:relative}
</style>
```

- [ ] **Step 4: Create InfoPanel.vue**

```vue
<template>
  <aside class="info-panel">
    <div class="panel-section">
      <h3>📖 知识</h3>
      <div v-if="knowledge" class="knowledge-card">
        <div class="knowledge-title">{{ knowledge.title }}</div>
        <div class="knowledge-body" v-html="knowledge.body"></div>
        <div v-if="knowledge.ref" class="knowledge-ref" v-html="knowledge.ref"></div>
      </div>
      <div v-else class="knowledge-card empty">点击场景要素查看知识说明</div>
    </div>
    <div class="panel-section">
      <h3>📊 当前状态</h3>
      <table class="state-table">
        <tr><td>河流类型</td><td>{{ state.type || '—' }}</td></tr>
        <tr><td>侵蚀阶段</td><td>{{ state.stage || '—' }}</td></tr>
        <tr><td>气候模式</td><td>{{ state.weather || '—' }}</td></tr>
        <tr><td>地形起伏</td><td>{{ state.relief || '—' }}</td></tr>
      </table>
    </div>
    <div class="panel-section">
      <h3>⚙ 数据</h3>
      <div class="data-grid">
        <button class="data-btn" @click="$emit('import')">导入 DEM</button>
        <button class="data-btn" @click="$emit('export')">导出快照</button>
      </div>
    </div>
  </aside>
</template>

<script setup>
defineProps({ knowledge: Object, state: { type: Object, default: () => ({}) } })
defineEmits(['import','export'])
</script>

<style scoped>
.info-panel{background:rgba(247,252,255,0.88);border:1px solid #a9c6e8;border-radius:9px;padding:8px;font-size:.72rem}
.panel-section{margin-bottom:10px}
.panel-section h3{margin:0 0 6px;font-size:.72rem;color:#1d4f81;font-weight:600}
.knowledge-card{background:rgba(255,255,255,.7);border:1px solid #d0e3f8;border-radius:8px;padding:8px;line-height:1.5}
.knowledge-card.empty{color:#8aafcf;font-size:.65rem}
.knowledge-title{font-weight:600;color:#0f2542;margin-bottom:4px}
.knowledge-body{font-size:.68rem;color:#365776}
.knowledge-ref{font-size:.6rem;color:#5a7f9f;margin-top:4px;font-style:italic}
.state-table{width:100%;font-size:.65rem;border-collapse:collapse}
.state-table td{padding:3px 6px;border:1px solid #d0e3f8}
.state-table td:first-child{color:#5a7f9f;background:rgba(248,252,255,.5)}
.state-table td:last-child{color:#0f2542;font-weight:500}
.data-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px}
.data-btn{border:1px solid #a9c6e8;border-radius:8px;padding:5px;background:#f9fcff;color:#365776;font-size:.62rem;cursor:pointer;text-align:center}
</style>
```

- [ ] **Step 5: Create SandboxShell.vue**

```vue
<template>
  <div class="sandbox-shell">
    <ModulePanel
      :modules="modules" :active-module-id="activeModuleId" :params="params"
      @select="(id) => $emit('select', id)"
      @update:params="(p) => $emit('update:params', p)"
      @tool="(t) => $emit('tool', t)" />
    <SceneViewport @scene-ready="(el) => $emit('sceneReady', el)" />
    <InfoPanel
      :knowledge="currentKnowledge" :state="state"
      @import="$emit('import')" @export="$emit('export')" />
  </div>
</template>

<script setup>
import ModulePanel from './ModulePanel.vue'
import SceneViewport from './SceneViewport.vue'
import InfoPanel from './InfoPanel.vue'
defineProps({ modules: Array, activeModuleId: String, params: Object, currentKnowledge: Object, state: Object })
defineEmits(['select','update:params','tool','sceneReady','import','export'])
</script>

<style scoped>
.sandbox-shell {
  display: grid; grid-template-columns: 200px 1fr 240px; gap: 8px;
  padding: 8px; min-height: calc(100vh - 44px);
  background: radial-gradient(ellipse at 22% 10%, rgba(54,130,210,0.12), transparent 46%),
              radial-gradient(ellipse at 78% 0%, rgba(115,177,255,0.14), transparent 44%),
              linear-gradient(180deg, #d8e9ff 0%, #eef5ff 58%);
}
@media (max-width:980px){.sandbox-shell{grid-template-columns:1fr}}
</style>
```

- [ ] **Step 6: Create SandboxApp.vue (initial version — will be enhanced later)**

```vue
<template>
  <SandboxShell
    :modules="modules" :active-module-id="activeModuleId"
    :params="params" :current-knowledge="currentKnowledge" :state="state"
    @select="onModuleSelect" @update:params="onParamsChange"
    @tool="onTool" @scene-ready="onSceneReady" />
</template>

<script setup>
import { reactive, ref } from 'vue'
import SandboxShell from './SandboxShell.vue'
import { getFluvialEntry } from './modules/fluvial/knowledge.js'

const activeModuleId = ref('fluvial')
const currentKnowledge = ref(getFluvialEntry('erosion_cycle'))
const sceneEngine = ref(null)

const params = reactive({ timeline: 0.35, climate: 0.3, uplift: 0.2, weatherMode: 'clear', viewMode: 'terrain', activeType: 'consequent' })
const state = reactive({ type: '顺应河', stage: '壮年期', weather: '晴', relief: '342m' })

const modules = [
  { id: 'fluvial', name: '河流地貌', icon: '🌊', locked: false },
  { id: 'structural', name: '构造地貌', icon: '🏔', locked: true },
  { id: 'glacial', name: '冰川地貌', icon: '❄️', locked: true },
  { id: 'coastal', name: '海岸地貌', icon: '🌊', locked: true },
  { id: 'aeolian', name: '风成地貌', icon: '🌪', locked: true },
  { id: 'karst', name: '岩溶地貌', icon: '🕳', locked: true },
  { id: 'volcanic', name: '火山地貌', icon: '🌋', locked: true },
  { id: 'climate', name: '气候地貌', icon: '🌍', locked: true }
]

function onModuleSelect(id) { activeModuleId.value = id }

function onParamsChange(p) {
  Object.assign(params, p)
  sceneEngine.value?.update({ ...params })
}

function onTool(tool) {
  if (tool === 'resetView') sceneEngine.value?.resetCamera()
  else if (tool === 'toggleSection') {
    params.viewMode = params.viewMode === 'section' ? 'terrain' : 'section'
    sceneEngine.value?.update({ ...params })
  } else if (tool === 'autoRotate') sceneEngine.value?.setPreset360()
}

function onSceneReady(hostEl) {
  // Scene engine will be wired in Task 3
}

function updateKnowledge(type) {
  currentKnowledge.value = getFluvialEntry(type) || getFluvialEntry('erosion_cycle')
}
</script>
```

- [ ] **Step 7: Verify components render**

Run: `pnpm dev`
Expected: `#/sandbox` shows three-column layout with empty viewport.

- [ ] **Step 8: Commit**

```bash
git add src/sandbox/
git commit -m "feat: add sandbox shell components"
```

---

### Task 3: Create SceneEngine wrapper and wire terrain scene

**Files:**
- Create: `src/sandbox/engine/SceneEngine.js`
- Modify: `src/lib/terrainScene.js` — expose scene

- [ ] **Step 1: Add `scene` exposure to terrainScene.js**

In the return object of `createTerrainScene` (`src/lib/terrainScene.js`), add:

```js
// In the existing return object (around line 592), add:
return {
  update,
  resize,
  resetCamera,
  setPreset360,
  getScene: () => scene,    // ADD THIS
  dispose() { ... }
}
```

- [ ] **Step 2: Create SceneEngine.js**

```js
import { createTerrainScene } from '../../lib/terrainScene.js'

export function createSceneEngine(hostElement, options = {}) {
  const terrainAPI = createTerrainScene(hostElement, {
    onInteraction: options.onInteraction
  })

  const api = {
    update(params) {
      terrainAPI.update({
        timeline: params.timeline ?? 0,
        climate: params.climate ?? 0,
        weatherMode: params.weatherMode ?? 'clear',
        activeType: params.activeType ?? 'consequent',
        viewMode: params.viewMode ?? 'terrain'
      })
    },
    resetCamera() { terrainAPI.resetCamera() },
    setPreset360() { terrainAPI.setPreset360() },
    resize() { terrainAPI.resize() },
    getScene() { return terrainAPI.getScene() },
    getTerrainAPI() { return terrainAPI },
    dispose() { terrainAPI.dispose() }
  }

  return api
}
```

- [ ] **Step 3: Wire SceneEngine into SandboxApp.vue**

In `src/sandbox/SandboxApp.vue`, update the `onSceneReady` function:

```vue
<script setup>
import { createSceneEngine } from './engine/SceneEngine.js'

function onSceneReady(hostEl) {
  sceneEngine.value = createSceneEngine(hostEl, {})
  sceneEngine.value.update({ ...params })
}
</script>
```

- [ ] **Step 4: Verify terrain renders in sandbox**

Run: `pnpm dev`
Expected: Navigating to `#/sandbox` shows the three-column layout with the terrain scene rendered in the center viewport.

- [ ] **Step 5: Commit**

```bash
git add src/sandbox/engine/SceneEngine.js src/lib/terrainScene.js
git commit -m "feat: add SceneEngine wrapper and wire terrain scene into sandbox"
```

---

### Task 4: Build GeoModule system and knowledge panel

**Files:**
- Create: `src/sandbox/modules/GeoModule.js`
- Create: `src/sandbox/modules/registry.js`
- Create: `src/sandbox/modules/fluvial/index.js`
- Create: `src/sandbox/modules/fluvial/knowledge.js`

- [ ] **Step 1: Create knowledge.js with academic references**

```js
export const fluvialKnowledge = [
  {
    type: 'consequent', title: '顺应河 (Consequent River)',
    body: '原始倾斜面上沿原始坡向发育的河流。常在新生陆面或抬升后的准平原上最先形成，反映原始地形的倾斜方向。水系方向与区域坡向一致，是戴维斯侵蚀循环的初始阶段。',
    ref: 'Davis, W.M. (1899). The Geographical Cycle. <em>Geogr. J.</em>, 14(5), 481-504.'
  },
  {
    type: 'subsequent', title: '后成河 (Subsequent River)',
    body: '在顺应河发育之后，沿软岩层走向发育的支流。受地质构造和岩性差异控制，常形成于向斜谷或断层线。标志着水系从原始地形控制转向构造/岩性控制。',
    ref: 'Zernitz, E.R. (1932). Drainage Patterns and Their Significance. <em>J. Geology</em>, 40(6), 498-521.'
  },
  {
    type: 'obsequent', title: '偶成河 (Obsequent River)',
    body: '与原始坡向相反的河流，发育在单斜构造或断层的逆向坡。流向与区域地层倾向相反，河谷形态常呈不对称状。',
    ref: 'Von Engeln, O.D. (1942). <em>Geomorphology</em>. Macmillan.'
  },
  {
    type: 'resequent', title: '再顺河 (Resequent River)',
    body: '原始地形被剥蚀后新形成的与原始坡向一致的河流。其存在说明地貌至少经历了一次完整的侵蚀循环，是戴维斯"多轮回"理论的关键证据。',
    ref: 'Davis, W.M. (1899). The Geographical Cycle. <em>Geogr. J.</em>, 14(5), 481-504.'
  },
  {
    type: 'insequent', title: '随意河 (Insequent River)',
    body: '无固定方向的河流，多见于均质岩层地区，水系形态呈树枝状。典型环境：花岗岩地区、厚层砂岩区。',
    ref: 'Horton, R.E. (1945). Erosional Development of Streams. <em>Geol. Soc. Am. Bull.</em>, 56(3), 275-370.'
  },
  {
    type: 'antecedent', title: '先成河 (Antecedent River)',
    body: '构造抬升前就已存在、能保持原有流路下切的河流。经典案例：雅鲁藏布江大拐弯。下切速率≥地壳抬升速率，是构造-侵蚀耦合研究的关键对象。',
    ref: 'Oberlander, T.M. (1965). The Zagros Streams. <em>Syracuse Geogr. Ser.</em>, 1, 1-168.'
  },
  {
    type: 'superimposed', title: '叠置河 (Superimposed River)',
    body: '从上覆岩层下切进入下伏不同构造地层的河流，保留原流路。揭示了区域地质历史的层次性。',
    ref: 'Chorley, R.J., Schumm, S.A. & Sugden, D.E. (1984). <em>Geomorphology</em>. Methuen.'
  },
  {
    type: 'erosion_cycle', title: '戴维斯侵蚀循环 (Davisian Cycle)',
    body: 'Davis (1899) 提出地貌演化三阶段：<br><br><b>① 青年期：</b>下切为主，V 形谷发育<br><b>② 壮年期：</b>侧蚀加强，河谷展宽，起伏最大<br><b>③ 老年期：</b>形成准平原 (peneplain)，仅余残丘<br><br>构造抬升后循环重新开始，形成多轮回地貌。',
    ref: 'Davis, W.M. (1899). The Geographical Cycle. <em>Geogr. J.</em>, 14(5), 481-504.'
  },
  {
    type: 'stream_power', title: '流功率侵蚀定律 (Stream Power Law)',
    body: '<b>E = K · Aᵐ · Sⁿ</b><br><br>E 为侵蚀速率，K 为侵蚀系数（岩性/气候控制），A 为汇水面积，S 为坡度，m≈0.4-0.6，n≈0.7-1.0。现代地貌学中联系构造-气候-河道的核心定量工具。',
    ref: 'Howard, A.D. et al. (1994). Modeling fluvial erosion. <em>JGR</em>, 99(B7), 13971-13986.'
  }
]

export function getFluvialEntry(type) {
  return fluvialKnowledge.find(k => k.type === type) || fluvialKnowledge[0]
}
```

- [ ] **Step 2: Create GeoModule.js and registry.js**

```js
// src/sandbox/modules/GeoModule.js
export class GeoModule {
  constructor(config) {
    this.id = config.id; this.name = config.name; this.icon = config.icon
    this.knowledge = config.knowledge || []
    this._activate = config.onActivate || (() => {})
    this._deactivate = config.onDeactivate || (() => {})
  }
  onActivate(engine) { this._activate(engine) }
  onDeactivate(engine) { this._deactivate(engine) }
}
```

```js
// src/sandbox/modules/registry.js
import { GeoModule } from './GeoModule.js'
const map = new Map()
export function registerModule(config) { const m = new GeoModule(config); map.set(config.id, m); return m }
export function getModule(id) { return map.get(id) || null }
export function getAllModules() { return Array.from(map.values()) }
```

- [ ] **Step 3: Create fluvial/index.js**

```js
import { getFluvialEntry } from './knowledge.js'
export const fluvialModule = {
  id: 'fluvial', name: '河流地貌', icon: '🌊',
  onRegister(engine) {},
  onActivate(engine) { engine.update({ activeType: 'consequent' }) },
  onDeactivate() {},
  getKnowledge(type) { return getFluvialEntry(type) },
  getRiverTypes() {
    return [
      { id: 'consequent', name: '顺应河' }, { id: 'subsequent', name: '后成河' },
      { id: 'obsequent', name: '偶成河' }, { id: 'resequent', name: '再顺河' },
      { id: 'insequent', name: '随意河' }, { id: 'antecedent', name: '先成河' },
      { id: 'superimposed', name: '叠置河' }
    ]
  }
}
```

- [ ] **Step 4: Register fluvial module in SandboxApp.vue**

```vue
<script setup>
import { registerModule, getModule } from './modules/registry.js'
import { fluvialModule } from './modules/fluvial/index.js'
registerModule(fluvialModule)

// Update onModuleSelect:
function onModuleSelect(id) {
  activeModuleId.value = id
  const mod = getModule(id)
  if (mod) mod.onActivate(sceneEngine.value)
}
</script>
```

- [ ] **Step 5: Commit**

```bash
git add src/sandbox/modules/
git commit -m "feat: add module system, fluvial module, and academic knowledge base"
```

---

### Task 5: River type selector and knowledge linking

**Files:**
- Modify: `src/sandbox/SandboxApp.vue`
- Modify: `src/sandbox/ModulePanel.vue`

- [ ] **Step 1: Add river type selector to ModulePanel.vue**

Add after the "参数控制" section:

```vue
<div class="panel-section">
  <h3>河流类型</h3>
  <div class="river-grid">
    <button v-for="r in riverTypes" :key="r.id"
      class="river-btn" :class="{active: activeType===r.id}"
      @click="$emit('selectType', r.id)">{{ r.name }}</button>
  </div>
</div>
```

Add to props: `riverTypes: Array`, `activeType: String`
Add to emits: `'selectType'`

Add CSS:
```css
.river-grid{display:grid;grid-template-columns:1fr 1fr;gap:3px}
.river-btn{border:1px solid #a9c6e8;border-radius:6px;padding:4px;background:#f9fcff;color:#365776;font-size:.6rem;cursor:pointer;text-align:center}
.river-btn.active{background:#cae7ff;border-color:#7bb4e7;color:#113f6a;font-weight:600}
```

- [ ] **Step 2: Wire river type selection in SandboxApp.vue**

```vue
// In template, pass through Shell:
:params="params" :river-types="fluvialModule.getRiverTypes()" :active-type="params.activeType"

// In Script, add handler:
function onSelectType(type) {
  params.activeType = type
  sceneEngine.value?.update({ ...params })
  currentKnowledge.value = getFluvialEntry(type)
  updateState()
}

// Update state helper:
function updateState() {
  const riverNames = { consequent:'顺应河', subsequent:'后成河', obsequent:'偶成河',
    resequent:'再顺河', insequent:'随意河', antecedent:'先成河', superimposed:'叠置河' }
  const stages = ['青年期','壮年期','老年期']
  state.type = riverNames[params.activeType] || '—'
  state.stage = stages[Math.min(2, Math.floor(params.timeline * 3))]
  state.weather = params.weatherMode
  state.relief = `${(800 - params.timeline * 500).toFixed(0)}m`
}
```

- [ ] **Step 3: Verify river type switching works**

Run: `pnpm dev`
Expected: Clicking river type buttons updates the terrain scene and knowledge panel content.

- [ ] **Step 4: Commit**

```bash
git add src/sandbox/
git commit -m "feat: add river type selector with knowledge linking"
```

---

### Task 6: Visual enhancements

**Files:**
- Modify: `src/sandbox/SandboxApp.vue` — add transition and global styles
- Modify: `src/style.css` — add sandbox layout styles

- [ ] **Step 1: Add sandbox styles to style.css**

```css
/* Sandbox layout */
.sandbox-shell {
  display: grid; grid-template-columns: 200px 1fr 240px; gap: 8px;
  padding: 8px; min-height: calc(100vh - 44px);
}
@media (max-width: 980px) {
  .sandbox-shell { grid-template-columns: 1fr; }
}
```

- [ ] **Step 2: Final integration check**

Run: `pnpm dev`
Expected:
- `#/atmosphere` — atmosphere module unchanged
- `#/sandbox` — three-column layout with terrain scene, river controls, knowledge panel
- River type buttons switch river type + update knowledge panel
- Timeline/climate/weather sliders control scene
- Section toggle, reset view, auto-rotate all work

- [ ] **Step 3: Commit**

```bash
git add src/style.css
git commit -m "style: add sandbox styles, complete Phase 1 integration"
```
