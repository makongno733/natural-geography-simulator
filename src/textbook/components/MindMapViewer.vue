<template>
  <div class="mindmap-shell" ref="shellRef">
    <!-- Search bar -->
    <div class="mindmap-topbar">
      <div class="mindmap-topbar-left">
        <h2 class="mindmap-topbar-title">{{ sectionTitle }}</h2>
        <p class="mindmap-topbar-sub">{{ chapterTitle }}</p>
      </div>
      <div class="mindmap-topbar-right">
        <div class="mindmap-search">
          <svg class="mindmap-search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            ref="searchRef"
            class="mindmap-search-input"
            v-model="searchQuery"
            placeholder="搜索概念..."
            @input="onSearch"
          />
        </div>
        <button class="mindmap-btn mindmap-btn-zoom" @click="zoomOut" title="缩小">−</button>
        <span class="mindmap-zoom-label">{{ Math.round(zoom * 100) }}%</span>
        <button class="mindmap-btn mindmap-btn-zoom" @click="zoomIn" title="放大">+</button>
        <button class="mindmap-btn mindmap-btn-reset" @click="resetView" title="重置视图">⟳</button>
        <button class="mindmap-btn mindmap-btn-close" @click="$emit('close')">✕ 返回</button>
      </div>
    </div>

    <!-- Main map area -->
    <div
      class="mindmap-canvas"
      ref="canvasRef"
      @mousedown="onPanStart"
      @mousemove="onPanMove"
      @mouseup="onPanEnd"
      @mouseleave="onPanEnd"
      @wheel.prevent="onWheel"
    >
      <svg
        class="mindmap-svg"
        :viewBox="`${viewX} ${viewY} ${viewW} ${viewH}`"
        preserveAspectRatio="xMidYMid meet"
      >
        <!-- Curved connectors: root → groups -->
        <path
          v-for="g in groups"
          :key="'r-g-'+g.name"
          :d="rootToGroupPath(g)"
          fill="none"
          stroke="#b8a57a"
          stroke-width="2"
          stroke-opacity="0.5"
          class="mindmap-connector mindmap-connector-root"
        />
        <!-- Curved connectors: groups → concepts -->
        <path
          v-for="c in concepts"
          :key="'g-c-'+c.key"
          :d="groupToConceptPath(c)"
          fill="none"
          stroke="#d5c39c"
          stroke-width="1.4"
          stroke-opacity="0.4"
          class="mindmap-connector mindmap-connector-branch"
        />

        <!-- Root node -->
        <g
          class="mindmap-node mindmap-node-root"
          :class="{ 'mindmap-node-selected': selectedNode === 'root' }"
          @click="selectNode('root')"
          tabindex="0"
          role="treeitem"
          :aria-label="rootLabel"
        >
          <rect
            :x="rootX" :y="rootCY - rootH/2"
            :width="rootW" :height="rootH"
            rx="10" ry="10"
            class="mindmap-node-bg"
          />
          <text
            :x="rootX + rootW/2" :y="rootCY + 6"
            text-anchor="middle"
            class="mindmap-node-text mindmap-node-text-root"
          >{{ rootLabel }}</text>
        </g>

        <!-- Group nodes -->
        <g
          v-for="(g, gi) in groups"
          :key="'g-'+g.name"
          class="mindmap-node mindmap-node-group"
          :class="{
            'mindmap-node-selected': selectedNode === 'group-'+gi,
            'mindmap-node-collapsed': collapsedGroups.has(gi),
          }"
          @click="toggleGroup(gi)"
          tabindex="0"
          role="treeitem"
          :aria-label="g.name"
          :aria-expanded="!collapsedGroups.has(gi)"
        >
          <rect
            :x="g.x" :y="g.y"
            :width="g.w" :height="g.h"
            rx="7" ry="7"
            class="mindmap-node-bg"
          />
          <text
            :x="g.x + g.w/2" :y="g.y + g.h/2 + 5"
            text-anchor="middle"
            class="mindmap-node-text mindmap-node-text-group"
          >{{ g.name }} <tspan class="mindmap-node-count">({{ g.conceptCount }})</tspan></text>
        </g>

        <!-- Concept nodes (only if group is not collapsed) -->
        <g
          v-for="(c, ci) in visibleConcepts"
          :key="'c-'+c.key"
          class="mindmap-node mindmap-node-concept"
          :class="{
            'mindmap-node-selected': selectedConcept === c.key,
            'mindmap-node-highlight': highlightedConcepts.has(c.key),
          }"
          @click="selectConcept(c)"
          @mouseenter="hoveredConcept = c.key"
          @mouseleave="hoveredConcept = null"
          tabindex="0"
          role="treeitem"
          :aria-label="c.name"
        >
          <rect
            :x="c.x" :y="c.y"
            :width="c.w" :height="c.h"
            rx="5" ry="5"
            class="mindmap-node-bg"
          />
          <text
            :x="c.x + 8" :y="c.y + c.h/2 + 5"
            text-anchor="start"
            class="mindmap-node-text mindmap-node-text-concept"
          >{{ c.name }}</text>
        </g>
      </svg>

      <!-- Definition tooltip -->
      <div
        v-if="selectedConcept"
        class="mindmap-tooltip"
        :style="tooltipStyle"
        @click.stop
      >
        <button class="mindmap-tooltip-close" @click="selectedConcept = null">✕</button>
        <h4 class="mindmap-tooltip-title">{{ selectedConceptName }}</h4>
        <p class="mindmap-tooltip-body">{{ selectedConceptDef }}</p>
      </div>
    </div>

    <!-- Legend -->
    <div class="mindmap-legend">
      <span class="mindmap-legend-item">
        <span class="mindmap-legend-dot mindmap-legend-root"></span> 本节主题
      </span>
      <span class="mindmap-legend-item">
        <span class="mindmap-legend-dot mindmap-legend-group"></span> 知识分组
      </span>
      <span class="mindmap-legend-item">
        <span class="mindmap-legend-dot mindmap-legend-concept"></span> 核心概念
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  conceptDefinitions: Object,
  sectionTitle: String,
  chapterTitle: String,
  gradeLevel: { type: String, default: '高中' },
})

defineEmits(['close'])

// Search
const searchQuery = ref('')
const searchRef = ref(null)
const highlightedConcepts = ref(new Set())
const onSearch = () => {
  highlightedConcepts.value = new Set()
  if (!searchQuery.value.trim()) return
  const q = searchQuery.value.toLowerCase()
  concepts.value.forEach(c => {
    if (c.name.toLowerCase().includes(q) || c.def && c.def.toLowerCase().includes(q)) {
      highlightedConcepts.value.add(c.key)
    }
  })
}

// Zoom / Pan state
const zoom = ref(1)
const viewX = ref(0)
const viewY = ref(0)
const viewW = ref(960)
const viewH = ref(600)
const panning = ref(false)
const panStart = reactive({ x: 0, y: 0 })
const vxStart = ref(0)
const vyStart = ref(0)
const canvasRef = ref(null)
const shellRef = ref(null)

const zoomIn = () => { zoom.value = Math.min(zoom.value * 1.25, 3); applyZoom() }
const zoomOut = () => { zoom.value = Math.max(zoom.value / 1.25, 0.3); applyZoom() }
const resetView = () => { zoom.value = 1; viewX.value = 0; viewY.value = 0; applyZoom() }
const applyZoom = () => {
  const baseW = Math.max(960, svgBaseW.value)
  const baseH = Math.max(600, svgBaseH.value + 40)
  viewW.value = baseW / zoom.value
  viewH.value = baseH / zoom.value
  viewX.value = Math.max(0, Math.min(viewX.value, baseW - viewW.value))
  viewY.value = Math.max(0, Math.min(viewY.value, baseH - viewH.value))
}

const onWheel = (e) => {
  const factor = e.deltaY < 0 ? 1.15 : 0.85
  zoom.value = Math.max(0.3, Math.min(3, zoom.value * factor))
  applyZoom()
}

const onPanStart = (e) => {
  if (e.target.closest('.mindmap-node')) return
  panning.value = true
  panStart.x = e.clientX
  panStart.y = e.clientY
  vxStart.value = viewX.value
  vyStart.value = viewY.value
}

const onPanMove = (e) => {
  if (!panning.value) return
  const dx = (e.clientX - panStart.x) / zoom.value
  const dy = (e.clientY - panStart.y) / zoom.value
  viewX.value = vxStart.value - dx
  viewY.value = vyStart.value - dy
  applyZoom()
}

const onPanEnd = () => { panning.value = false }

// Selection
const selectedConcept = ref(null)
const hoveredConcept = ref(null)
const selectedNode = ref(null)

const selectConcept = (c) => {
  if (selectedConcept.value === c.key) {
    selectedConcept.value = null
  } else {
    selectedConcept.value = c.key
    selectedNode.value = c.key
  }
}

const tooltipStyle = computed(() => {
  if (!selectedConcept.value) return {}
  const c = concepts.value.find(cc => cc.key === selectedConcept.value)
  if (!c) return {}
  return {
    left: `${c.x + c.w + 16}px`,
    top: `${c.y - 40}px`,
  }
})

const selectedConceptName = computed(() => {
  const c = concepts.value.find(cc => cc.key === selectedConcept.value)
  return c ? c.name : ''
})

const selectedConceptDef = computed(() => {
  const c = concepts.value.find(cc => cc.key === selectedConcept.value)
  return c ? (c.def || '暂无定义') : ''
})

const collapsedGroups = ref(new Set())
const toggleGroup = (gi) => {
  const newSet = new Set(collapsedGroups.value)
  if (newSet.has(gi)) newSet.delete(gi)
  else newSet.add(gi)
  collapsedGroups.value = newSet
}
const selectNode = (key) => {
  selectedNode.value = selectedNode.value === key ? null : key
}

// Layout constants
const rootW = 140, rootH = 44
const rootX = 30
const groupW = 100, groupH = 36
const groupXPadding = 220
const conceptH = 28, conceptXPadding = 360
const groupVGap = 20
const conceptVGap = 4

// Root label
const rootLabel = computed(() => {
  const t = props.sectionTitle || '本节主题'
  return t.length > 14 ? t.substring(0, 14) + '…' : t
})

// Parse data into groups and concepts
const groups = computed(() => {
  if (!props.conceptDefinitions) return []
  const entries = Object.entries(props.conceptDefinitions).filter(([,c]) => Object.keys(c).length > 0)
  let currentY = 30
  return entries.map(([name, conceptsObj], gi) => {
    const names = Object.keys(conceptsObj)
    const blockH = names.length * (conceptH + conceptVGap) + 16
    const result = {
      name,
      index: gi,
      x: groupXPadding,
      y: currentY,
      w: groupW,
      h: groupH,
      conceptCount: names.length,
      blockH,
      blockStartY: currentY,
    }
    currentY += groupH + 16 + blockH + groupVGap
    return result
  })
})

const totalH = computed(() => {
  if (groups.value.length === 0) return 300
  const last = groups.value[groups.value.length - 1]
  return last.blockStartY + last.blockH + 40
})

const rootCY = computed(() => {
  if (groups.value.length === 0) return totalH.value / 2
  const first = groups.value[0]
  const last = groups.value[groups.value.length - 1]
  return (first.y + groupH/2 + last.y + groupH/2) / 2
})

// All concepts with positions
const concepts = computed(() => {
  if (!props.conceptDefinitions) return []
  const result = []
  let gi = 0
  for (const [gName, cons] of Object.entries(props.conceptDefinitions)) {
    const names = Object.keys(cons)
    if (!names.length) { gi++; continue }
    const g = groups.value[gi]
    if (!g) { gi++; continue }
    names.forEach((name, i) => {
      const conceptObj = cons[name]
      // Extract the definition for this grade level
      let def = ''
      if (typeof conceptObj === 'object' && conceptObj !== null) {
        def = conceptObj[props.gradeLevel] || conceptObj['高中'] || conceptObj['初中'] || Object.values(conceptObj)[0] || ''
      } else if (typeof conceptObj === 'string') {
        def = conceptObj
      }
      result.push({
        key: gName + '|' + name,
        name,
        def,
        x: conceptXPadding,
        y: g.y + groupH + 12 + i * (conceptH + conceptVGap),
        w: Math.min(180, Math.max(72, name.length * 15 + 24)),
        h: conceptH,
        gx: g.x, gw: g.w,
        gcy: g.y + groupH / 2,
        gi,
      })
    })
    gi++
  }
  return result
})

const visibleConcepts = computed(() =>
  concepts.value.filter(c => !collapsedGroups.value.has(c.gi))
)

const svgBaseW = computed(() => {
  const maxW = visibleConcepts.value.reduce((m, c) => Math.max(m, c.x + c.w + 24), 0)
  return Math.max(700, maxW)
})

const svgBaseH = computed(() => totalH.value)

// Connector paths
const rootToGroupPath = (g) => {
  const rx = rootX + rootW
  const ry = rootCY.value
  const tx = g.x
  const ty = g.y + groupH / 2
  const mx = (rx + tx) / 2
  return `M ${rx} ${ry} C ${mx} ${ry}, ${mx} ${ty}, ${tx} ${ty}`
}

const groupToConceptPath = (c) => {
  const sx = c.gx + c.gw
  const sy = c.gcy
  const tx = c.x
  const ty = c.y + conceptH / 2
  const mx = (sx + tx) / 2
  return `M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ty}, ${tx} ${ty}`
}

// Keyboard shortcuts
const onKeydown = (e) => {
  if ((e.key === 'f' || e.key === 'F') && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    searchRef.value?.focus()
  }
  if (e.key === 'Escape') {
    selectedConcept.value = null
    searchQuery.value = ''
    highlightedConcepts.value = new Set()
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  applyZoom()
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})

// React to container resize
let resizeObserver = null
onMounted(() => {
  if (canvasRef.value) {
    resizeObserver = new ResizeObserver(() => {
      applyZoom()
    })
    resizeObserver.observe(canvasRef.value)
  }
})
onUnmounted(() => {
  resizeObserver?.disconnect()
})
</script>

<style scoped>
/* === Shell === */
.mindmap-shell {
  max-width: 1100px;
  margin: 0 auto;
  padding: 10px 16px 20px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 180px);
  min-height: 500px;
}

/* === Topbar === */
.mindmap-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 12px;
  flex-wrap: wrap;
}
.mindmap-topbar-left { min-width: 0; }
.mindmap-topbar-title {
  margin: 0;
  font-size: 18px;
  color: var(--red);
  font-family: "Noto Serif SC", "Songti SC", serif;
  letter-spacing: 0.02em;
}
.mindmap-topbar-sub {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--muted);
}
.mindmap-topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* Search */
.mindmap-search {
  position: relative;
  display: flex;
  align-items: center;
}
.mindmap-search-icon {
  position: absolute;
  left: 10px;
  color: var(--muted);
  pointer-events: none;
}
.mindmap-search-input {
  width: 160px;
  padding: 6px 10px 6px 32px;
  border: 1px solid var(--brown);
  border-radius: 2px;
  font-size: 13px;
  font-family: "Noto Serif SC", "Songti SC", serif;
  background: rgba(255,255,255,0.8);
  color: var(--ink);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.mindmap-search-input:focus {
  outline: none;
  border-color: var(--red);
  box-shadow: 0 0 0 3px rgba(31,111,235,0.1);
  width: 200px;
}

/* Buttons */
.mindmap-btn {
  border: 1px solid var(--brown);
  border-radius: 2px;
  padding: 5px 10px;
  font-size: 13px;
  font-family: inherit;
  color: var(--button-green-ink);
  background: var(--card-bg);
  cursor: pointer;
  transition: border-color 0.2s, transform 0.15s;
  white-space: nowrap;
}
.mindmap-btn:hover {
  border-color: var(--brown-dark);
  transform: translateY(-1px);
}
.mindmap-btn-zoom { font-weight: 700; font-size: 14px; min-width: 28px; text-align: center; }
.mindmap-btn-reset { font-size: 14px; }
.mindmap-btn-close {
  border-color: var(--brown-light);
  color: var(--muted);
}
.mindmap-btn-close:hover { color: var(--red); border-color: var(--red); }
.mindmap-zoom-label {
  font-size: 12px;
  color: var(--muted);
  min-width: 36px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

/* === Canvas === */
.mindmap-canvas {
  flex: 1;
  overflow: hidden;
  position: relative;
  border: 1px solid var(--brown);
  border-radius: 2px;
  background:
    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(150,180,205,0.015) 2px, rgba(150,180,205,0.015) 4px),
    repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(140,170,195,0.012) 3px, rgba(140,170,195,0.012) 6px),
    linear-gradient(135deg, #fafdfe 0%, #f2f7fb 40%, #ecf3f8 100%);
  box-shadow: inset 0 0 80px rgba(150,180,210,0.04);
  cursor: grab;
  user-select: none;
}
.mindmap-canvas:active { cursor: grabbing; }
.mindmap-svg {
  width: 100%;
  height: 100%;
  display: block;
}

/* === Connectors === */
.mindmap-connector {
  transition: stroke-opacity 0.3s;
}
.mindmap-node-group:hover ~ .mindmap-connector-branch,
.mindmap-node-concept:hover ~ .mindmap-connector-branch {
  stroke-opacity: 0;
}

/* === Nodes (base) === */
.mindmap-node { cursor: pointer; outline: none; }
.mindmap-node:focus-visible { filter: drop-shadow(0 0 0 3px rgba(31,111,235,0.35)); }

.mindmap-node-bg {
  transition: fill 0.2s, filter 0.2s, stroke 0.2s;
}

/* === Root node === */
.mindmap-node-root .mindmap-node-bg {
  fill: #1f6feb;
  filter: drop-shadow(0 2px 8px rgba(31,111,235,0.25));
}
.mindmap-node-root:hover .mindmap-node-bg {
  fill: #b12a2c;
  filter: drop-shadow(0 4px 12px rgba(31,111,235,0.35));
}
.mindmap-node-text-root {
  fill: #fff;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.03em;
}

/* === Group nodes === */
.mindmap-node-group .mindmap-node-bg {
  fill: #fdf7f0;
  stroke: #1f6feb;
  stroke-width: 1.6;
  filter: drop-shadow(0 1px 4px rgba(31,111,235,0.08));
}
.mindmap-node-group:hover .mindmap-node-bg {
  fill: #fef3e8;
  stroke-width: 2;
  filter: drop-shadow(0 2px 8px rgba(31,111,235,0.15));
}
.mindmap-node-text-group {
  fill: #1f6feb;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 13px;
  font-weight: 700;
}
.mindmap-node-count {
  fill: var(--muted);
  font-size: 11px;
  font-weight: 400;
}
.mindmap-node-collapsed .mindmap-node-bg {
  stroke-dasharray: 4 2;
}
.mindmap-node-collapsed .mindmap-node-text-group {
  opacity: 0.7;
}

/* === Concept nodes === */
.mindmap-node-concept .mindmap-node-bg {
  fill: rgba(255,255,255,0.92);
  stroke: #c44d42;
  stroke-width: 0.9;
  filter: drop-shadow(0 1px 3px rgba(31,111,235,0.05));
}
.mindmap-node-concept:hover .mindmap-node-bg {
  fill: #fff5f2;
  stroke: #1f6feb;
  stroke-width: 1.3;
  filter: drop-shadow(0 2px 6px rgba(31,111,235,0.12));
}
.mindmap-node-text-concept {
  fill: #5a2816;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 12px;
  font-weight: 600;
}

/* === Selected / Highlighted === */
.mindmap-node-selected .mindmap-node-bg {
  stroke: #2c6fbb;
  stroke-width: 2.2;
  filter: drop-shadow(0 0 8px rgba(44,111,187,0.25));
}
.mindmap-node-highlight .mindmap-node-bg {
  fill: #fffbe6;
  stroke: #e6a817;
  stroke-width: 0.2px;
  filter: drop-shadow(0 0 6px rgba(230,168,23,0.2));
}

/* === Tooltip / Definition panel === */
.mindmap-tooltip {
  position: absolute;
  max-width: 320px;
  background: rgba(255,255,255,0.97);
  border: 1px solid var(--brown);
  border-radius: 2px;
  padding: 14px 16px;
  box-shadow: 0 8px 32px rgba(88,73,39,0.14);
  z-index: 10;
  pointer-events: auto;
  animation: tooltipIn 0.2s ease-out;
}
@keyframes tooltipIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.mindmap-tooltip-close {
  position: absolute;
  top: 6px;
  right: 8px;
  border: none;
  background: none;
  color: var(--muted);
  font-size: 14px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
}
.mindmap-tooltip-close:hover { color: var(--red); }
.mindmap-tooltip-title {
  margin: 0 0 8px;
  font-size: 15px;
  color: var(--red);
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-weight: 700;
}
.mindmap-tooltip-body {
  margin: 0;
  font-size: 13px;
  line-height: 1.88;
  color: var(--ink);
  white-space: pre-line;
  text-align: justify;
}

/* === Legend === */
.mindmap-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;
  padding: 8px 0;
  border-top: 1px solid var(--brown-light);
}
.mindmap-legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--muted);
}
.mindmap-legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}
.mindmap-legend-root { background: #1f6feb; }
.mindmap-legend-group { background: var(--brown-light); border: 1px solid #1f6feb; }
.mindmap-legend-concept { background: rgba(255,255,255,0.92); border: 1px solid #c44d42; }

/* === Responsive === */
@media (max-width: 720px) {
  .mindmap-shell {
    height: calc(100vh - 120px);
    padding: 6px 8px 12px;
  }
  .mindmap-topbar { flex-direction: column; align-items: flex-start; }
  .mindmap-topbar-right { flex-wrap: wrap; }
  .mindmap-search-input { width: 120px; }
  .mindmap-search-input:focus { width: 150px; }
  .mindmap-tooltip {
    max-width: 240px;
    left: 50% !important;
    top: auto !important;
    bottom: 20px;
    transform: translateX(-50%);
  }
}

/* === Print === */
@media print {
  .mindmap-shell {
    height: auto;
    min-height: auto;
  }
  .mindmap-topbar-right { display: none; }
  .mindmap-canvas {
    overflow: visible;
    border: none;
    box-shadow: none;
    background: #fff;
  }
  .mindmap-tooltip { display: none; }
  .mindmap-legend { display: none; }
}
</style>
