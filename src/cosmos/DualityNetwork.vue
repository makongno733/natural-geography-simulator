<script setup>
import { ref } from 'vue'
import { DUALITY_CONNECTIONS, SUPERSTRING_THEORIES } from './stringTheoriesData.js'

const activeConnectionId = ref('t_ii')
const activeConnection = computed(() => DUALITY_CONNECTIONS.find(c => c.id === activeConnectionId.value) || DUALITY_CONNECTIONS[0])

const nodes = [
  { id: 'm_theory', label: '11D M 理论', sub: '超引力 / 膜母框架', x: 250, y: 35, color: '#ec4899' },
  { id: 'type2a', label: 'Type IIA', sub: '10D 闭弦 · 非手征', x: 100, y: 120, color: '#3b82f6' },
  { id: 'type2b', label: 'Type IIB', sub: '10D 闭弦 · 手征', x: 400, y: 120, color: '#3b82f6' },
  { id: 'het_e8', label: 'Heterotic E8×E8', sub: '10D 杂化闭弦', x: 100, y: 230, color: '#10b981' },
  { id: 'het_so32', label: 'Heterotic SO(32)', sub: '10D 杂化闭弦', x: 270, y: 230, color: '#10b981' },
  { id: 'type1', label: 'Type I', sub: '10D 开闭弦 · 未定向', x: 420, y: 230, color: '#f59e0b' }
]

import { computed } from 'vue'
</script>

<template>
<div class="cx-duality-map">
  <div class="cx-duality-header">
    <span class="cx-eyebrow">DUALITY WEB & M-THEORY</span>
    <h3>超弦理论对偶网络交互拓扑图</h3>
    <p class="cx-subtext">点击任意对偶连接线或按钮，探索 T 对偶、S 对偶与 11 维 M 理论强弱极限的严谨物理机制。</p>
  </div>

  <div class="cx-duality-layout">
    <!-- SVG 拓扑网络交互图 -->
    <div class="cx-duality-canvas-wrap">
      <svg viewBox="0 0 520 280" role="img" aria-label="超弦理论与 M 理论对偶拓扑图" class="cx-duality-svg">
        <!-- 连线：T 对偶 IIA <-> IIB (横向双向线) -->
        <g class="cx-edge" :class="{ active: activeConnectionId === 't_ii' }" @click="activeConnectionId = 't_ii'">
          <line x1="150" y1="120" x2="350" y2="120" stroke-width="3"/>
          <rect x="210" y="108" width="80" height="24" rx="4" fill="var(--cx-panel-bg, #1a2234)"/>
          <text x="250" y="124" text-anchor="middle" font-size="11" fill="currentColor">T 对偶 (R ↔ α'/R)</text>
        </g>

        <!-- 连线：T 对偶 Het SO(32) <-> Het E8xE8 -->
        <g class="cx-edge" :class="{ active: activeConnectionId === 't_het' }" @click="activeConnectionId = 't_het'">
          <line x1="165" y1="230" x2="215" y2="230" stroke-width="3"/>
          <text x="190" y="222" text-anchor="middle" font-size="10" fill="currentColor">T 对偶</text>
        </g>

        <!-- 连线：S 对偶 Type I <-> Het SO(32) -->
        <g class="cx-edge" :class="{ active: activeConnectionId === 's_type1_hetso32' }" @click="activeConnectionId = 's_type1_hetso32'">
          <line x1="325" y1="230" x2="365" y2="230" stroke-width="3"/>
          <text x="345" y="222" text-anchor="middle" font-size="10" fill="currentColor">S 对偶 (gs ↔ 1/gs)</text>
        </g>

        <!-- 连线：S 自对偶 Type IIB (自环) -->
        <g class="cx-edge" :class="{ active: activeConnectionId === 's_type2b' }" @click="activeConnectionId = 's_type2b'">
          <path d="M 445 105 C 490 80, 490 145, 445 135" fill="none" stroke-width="2.5"/>
          <text x="495" y="122" font-size="10" fill="currentColor">S 自对偶</text>
        </g>

        <!-- 连线：IIA -> M 理论 (强耦合展开第 11 维) -->
        <g class="cx-edge" :class="{ active: activeConnectionId === 'm_iia' }" @click="activeConnectionId = 'm_iia'">
          <line x1="125" y1="100" x2="220" y2="50" stroke-width="3"/>
          <text x="155" y="68" font-size="10" fill="#ec4899">gs → ∞ (R11 展开)</text>
        </g>

        <!-- 连线：Het E8xE8 -> M 理论 (Hořava-Witten 区间界) -->
        <g class="cx-edge" :class="{ active: activeConnectionId === 'm_hete8' }" @click="activeConnectionId = 'm_hete8'">
          <line x1="100" y1="210" x2="220" y2="45" stroke-width="2.5" stroke-dasharray="4 3"/>
          <text x="135" y="165" font-size="10" fill="#ec4899">Hořava-Witten 极限</text>
        </g>

        <!-- 节点 -->
        <g v-for="node in nodes" :key="node.id" class="cx-duality-node" :transform="`translate(${node.x}, ${node.y})`">
          <circle r="22" :fill="node.color" fill-opacity="0.2" :stroke="node.color" stroke-width="2"/>
          <text y="-2" text-anchor="middle" font-size="10" font-weight="bold" fill="currentColor">{{ node.label }}</text>
          <text y="10" text-anchor="middle" font-size="8" fill="#899bb0">{{ node.sub }}</text>
        </g>
      </svg>
    </div>

    <!-- 侧边对偶详情抽屉 -->
    <div class="cx-duality-detail">
      <div class="cx-detail-badge">{{ activeConnection.type }}</div>
      <h4>{{ activeConnection.from.toUpperCase() }} ⟷ {{ activeConnection.to.toUpperCase() }}</h4>
      <div class="cx-duality-formula">
        <code>{{ activeConnection.formula }}</code>
      </div>
      <p class="cx-duality-desc">{{ activeConnection.description }}</p>
      <div class="cx-duality-meta">
        <div><strong>先决几何条件：</strong>{{ activeConnection.prerequisites }}</div>
        <div><strong>科学理论地位：</strong>{{ activeConnection.status }}</div>
      </div>
    </div>
  </div>

  <div class="cx-duality-quick-nav">
    <span>快速切换对偶关系：</span>
    <button
      v-for="conn in DUALITY_CONNECTIONS"
      :key="conn.id"
      class="cx-quick-btn"
      :class="{ active: activeConnectionId === conn.id }"
      @click="activeConnectionId = conn.id"
    >
      {{ conn.type }}
    </button>
  </div>
</div>
</template>
