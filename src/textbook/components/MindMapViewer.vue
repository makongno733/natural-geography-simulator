<template>
  <div class="mindmap-shell">
    <div class="mindmap-topbar">
      <h2 class="mindmap-topbar-title">{{ sectionTitle }}</h2>
      <p class="mindmap-topbar-sub">{{ chapterTitle }}</p>
      <button class="mindmap-topbar-close" @click="$emit('close')">✕ 返回课文</button>
    </div>
    <div class="mindmap-paper">
      <svg class="mindmap-svg" :viewBox="'0 0 ' + svgW + ' ' + svgH" preserveAspectRatio="xMidYMid meet">
        <!-- lines root → groups -->
        <line v-for="g in groups" :key="'r-'+g.name"
          :x1="rootX + rootW" :y1="rootCY"
          :x2="g.x" :y2="g.cy"
          stroke="#b01217" stroke-width="1.4" stroke-opacity="0.45"
        />
        <!-- lines groups → leafs -->
        <line v-for="c in leafs" :key="'l-'+c.key"
          :x1="c.gx + c.gw" :y1="c.gcy"
          :x2="c.x" :y2="c.cy"
          stroke="#c44d42" stroke-width="0.9" stroke-opacity="0.3"
        />
        <!-- root -->
        <rect :x="rootX" :y="rootCY - rootH/2" :width="rootW" :height="rootH" rx="8" fill="#a31622"/>
        <text :x="rootX + rootW/2" :y="rootCY + 5" text-anchor="middle" fill="#fff" font-size="14" font-weight="700">{{ rootLabel }}</text>
        <!-- groups -->
        <g v-for="g in groups" :key="g.name">
          <rect :x="g.x" :y="g.cy - g.h/2" :width="g.w" :height="g.h" rx="5" fill="#fff7f0" stroke="#b01217" stroke-width="1.4"/>
          <text :x="g.x + g.w/2" :y="g.cy + 4" text-anchor="middle" fill="#b01217" font-size="12" font-weight="700">{{ g.name }}</text>
        </g>
        <!-- leafs -->
        <g v-for="c in leafs" :key="c.key">
          <rect :x="c.x" :y="c.cy - c.h/2" :width="c.w" :height="c.h" rx="4" fill="#fef8f5" stroke="#c44d42" stroke-width="0.8"/>
          <text :x="c.x + c.w/2" :y="c.cy + 4" text-anchor="middle" fill="#8b2018" font-size="11" font-weight="600">{{ c.name }}</text>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  conceptDefinitions: Object,
  sectionTitle: String,
  chapterTitle: String,
  gradeLevel: String,
})

defineEmits(['close'])

const rootLabel = computed(() => {
  const t = props.sectionTitle || ''
  return t.length > 12 ? t.substring(0, 12) + '…' : t
})

const rootW = 124, rootH = 32
const rootX = 24
const groupW = 80, groupH = 28, groupX = 180
const leafH = 22, leafX = 290
const groupGap = 12, leafGap = 2

// Compute group positions first, then center root between first and last group
const groups = computed(() => {
  if (!props.conceptDefinitions) return []
  const entries = Object.entries(props.conceptDefinitions).filter(([,c]) => Object.keys(c).length > 0)
  let y = 16
  const result = []
  for (const [name, concepts] of entries) {
    const n = Object.keys(concepts).length
    const blockH = groupH + 6 + n * (leafH + leafGap)
    const cy = y + blockH / 2
    result.push({ name, w: groupW, h: groupH, x: groupX, cy, blockH, gy: y })
    y += blockH + groupGap
  }
  return result
})

// Root centered vertically between first and last group
const totalH = computed(() => {
  if (groups.value.length === 0) return 120
  const last = groups.value[groups.value.length - 1]
  return last.gy + last.blockH + 16
})

const rootCY = computed(() => {
  if (groups.value.length === 0) return totalH.value / 2
  const first = groups.value[0]
  const last = groups.value[groups.value.length - 1]
  return (first.cy + last.cy) / 2
})

const leafs = computed(() => {
  if (!props.conceptDefinitions) return []
  const result = []
  let gi = 0
  for (const [gName, cons] of Object.entries(props.conceptDefinitions)) {
    if (!Object.keys(cons).length) { gi++; continue }
    const g = groups.value[gi]
    if (!g) { gi++; continue }
    const names = Object.keys(cons)
    const startY = g.gy + groupH + 6
    names.forEach((name, i) => {
      const cy = startY + i * (leafH + leafGap) + leafH / 2
      result.push({
        key: gName + '|' + name,
        name,
        x: leafX,
        cy,
        w: Math.min(150, Math.max(64, name.length * 14 + 24)),
        h: leafH,
        gx: g.x, gw: g.w,
        gcy: g.cy,
      })
    })
    gi++
  }
  return result
})

const svgW = computed(() => {
  const maxW = leafs.value.reduce((m, c) => Math.max(m, c.x + c.w + 40), 0)
  return Math.max(620, maxW)
})

const svgH = computed(() => totalH.value)
</script>

<style scoped>
.mindmap-shell {
  max-width: 960px;
  margin: 0 auto;
  padding: 10px 16px 24px;
  overflow: hidden;
}
.mindmap-topbar {
  text-align: center;
  margin-bottom: 10px;
  position: relative;
}
.mindmap-topbar-title { margin: 0; font-size: 18px; color: var(--red); }
.mindmap-topbar-sub { margin: 2px 0 0; font-size: 12px; color: #7d5a4b; }
.mindmap-topbar-close {
  position: absolute; right: 0; top: 0;
  border: 1px solid var(--brown-light); border-radius: 6px;
  padding: 5px 12px; font-size: 12px; color: var(--button-green-ink);
  background: rgba(246,250,228,0.76); cursor: pointer;
}
.mindmap-paper {
  border: 1px solid rgba(120,160,195,0.38);
  border-radius: 8px;
  background:
    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(160,190,215,0.028) 2px, rgba(160,190,215,0.028) 4px),
    repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(150,180,205,0.02) 3px, rgba(150,180,205,0.02) 6px),
    linear-gradient(135deg, #f7fafd 0%, #eef5fa 40%, #e6f0f7 100%);
  box-shadow: inset 0 0 60px rgba(150,180,210,0.06), 0 2px 12px rgba(100,140,170,0.08);
  padding: 20px 16px 16px;
  overflow: hidden;
}
.mindmap-svg { width: 100%; display: block; }
@media (max-width: 720px) {
  .mindmap-shell { padding: 6px 8px 16px; }
  .mindmap-topbar-title { font-size: 16px; }
  .mindmap-topbar-close { position: static; display: block; margin-top: 6px; }
  .mindmap-paper { padding: 10px 6px; overflow-x: auto; }
  .mindmap-svg { min-width: 520px; }
}
</style>
