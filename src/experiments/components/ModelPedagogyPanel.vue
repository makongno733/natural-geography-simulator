<template>
  <div :class="['pedagogy-panel', `theme-${theme}`]" role="region" aria-label="地理教学机理与探究指引">
    <div class="pedagogy-header">
      <div class="badge-wrap">
        <span class="theme-badge">{{ badgeText }}</span>
        <span class="sub-badge">教学探究与机理模型</span>
      </div>
      <div class="pedagogy-actions">
        <button
          v-if="hasCompare"
          class="pedagogy-btn"
          type="button"
          @click="$emit('compare')"
          :title="compareActive ? '退出对比模式' : '开启对照模式'"
        >
          {{ compareActive ? '关闭对比' : '⚖ 对照观察' }}
        </button>
        <button
          class="pedagogy-btn reset-btn"
          type="button"
          @click="$emit('reset')"
          title="恢复初始标准观察状态"
        >
          ↺ 重置观察
        </button>
      </div>
    </div>

    <div class="pedagogy-grid">
      <!-- 观察什么 -->
      <div class="pedagogy-card card-observe">
        <div class="card-title">
          <span class="icon">👁</span>
          <h4>观察什么</h4>
        </div>
        <ul v-if="Array.isArray(observe)" class="card-list">
          <li v-for="(item, idx) in observe" :key="idx">{{ item }}</li>
        </ul>
        <p v-else class="card-text">{{ observe }}</p>
      </div>

      <!-- 改变什么 -->
      <div class="pedagogy-card card-change">
        <div class="card-title">
          <span class="icon">🎛</span>
          <h4>改变什么</h4>
        </div>
        <ul v-if="Array.isArray(change)" class="card-list">
          <li v-for="(item, idx) in change" :key="idx">{{ item }}</li>
        </ul>
        <p v-else class="card-text">{{ change }}</p>
      </div>

      <!-- 为什么变化 -->
      <div class="pedagogy-card card-mechanism">
        <div class="card-title">
          <span class="icon">⚙</span>
          <h4>为什么变化</h4>
        </div>
        <ul v-if="Array.isArray(mechanism)" class="card-list">
          <li v-for="(item, idx) in mechanism" :key="idx">{{ item }}</li>
        </ul>
        <p v-else class="card-text">{{ mechanism }}</p>
      </div>

      <!-- 模型局限 -->
      <div class="pedagogy-card card-limits">
        <div class="card-title">
          <span class="icon">⚠️</span>
          <h4>模型有哪些限制</h4>
        </div>
        <ul v-if="Array.isArray(limitations)" class="card-list">
          <li v-for="(item, idx) in limitations" :key="idx">{{ item }}</li>
        </ul>
        <p v-else class="card-text">{{ limitations }}</p>
        <div class="disclaimer-note">注：本模型为定性或半定量教学模拟，用于探究地理规律，并非真实数值预报或工程勘探。</div>
      </div>
    </div>

    <!-- 关联通道：真实数据实验、教材对应与知识题库 -->
    <div v-if="realDataLab || textbookLink || practiceLink" class="pedagogy-connections">
      <div class="connect-label">🔗 教学连贯联动</div>
      <div class="connect-chips">
        <router-link
          v-if="realDataLab"
          :to="realDataLab.path"
          class="connect-chip chip-lab"
        >
          <span class="chip-type">真实数据实验</span>
          <span class="chip-title">{{ realDataLab.title }}</span>
          <span class="chip-arrow">→</span>
        </router-link>

        <router-link
          v-if="textbookLink"
          :to="textbookRoute"
          class="connect-chip chip-textbook"
        >
          <span class="chip-type">教材小节</span>
          <span class="chip-title">{{ textbookLink.chapter }} · {{ textbookLink.section }}</span>
          <span class="chip-arrow">→</span>
        </router-link>

        <router-link
          v-if="practiceLink"
          :to="practiceLink"
          class="connect-chip chip-practice"
        >
          <span class="chip-type">实战练习</span>
          <span class="chip-title">针对性强化训练</span>
          <span class="chip-arrow">→</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  theme: {
    type: String,
    default: 'systems',
    validator: v => ['astronomy', 'meteorology', 'hydrology', 'geology', 'systems'].includes(v),
  },
  observe: {
    type: [Array, String],
    required: true,
  },
  change: {
    type: [Array, String],
    required: true,
  },
  mechanism: {
    type: [Array, String],
    required: true,
  },
  limitations: {
    type: [Array, String],
    required: true,
  },
  hasCompare: {
    type: Boolean,
    default: false,
  },
  compareActive: {
    type: Boolean,
    default: false,
  },
  realDataLab: {
    type: Object,
    default: null,
  },
  textbookLink: {
    type: Object,
    default: null,
  },
  practiceLink: {
    type: String,
    default: '/practice',
  },
})

defineEmits(['reset', 'compare'])

const badgeText = computed(() => {
  const map = {
    astronomy: '🔭 天文天象观测站',
    meteorology: '🌪 大气与气象流动站',
    hydrology: '💧 流域水动力实验台',
    geology: '⛰ 地质构造与岩层台',
    systems: '🌐 综合地理系统模拟',
  }
  return map[props.theme] || '🌐 地理教学模型'
})

const textbookRoute = computed(() => {
  if (!props.textbookLink) return '/'
  const { grade = '高中', book = '必修第一册', chapter, section } = props.textbookLink
  return `/${encodeURIComponent(grade)}/${encodeURIComponent(book)}/${encodeURIComponent(chapter)}/${encodeURIComponent(section)}`
})
</script>

<style scoped>
.pedagogy-panel {
  margin-top: 18px;
  padding: 18px 20px;
  border-radius: var(--radius-card, 14px);
  background: var(--surface, #ffffff);
  border: 1px solid var(--glass-border, rgba(0, 0, 0, 0.08));
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);
  font-family: inherit;
  transition: border-color 0.25s, box-shadow 0.25s;
}

/* 主题特定视觉 */
.theme-astronomy {
  border-left: 4px solid #f59e0b;
  background: linear-gradient(180deg, rgba(245, 158, 11, 0.04) 0%, rgba(255, 255, 255, 0.98) 100%);
}
.theme-meteorology {
  border-left: 4px solid #0284c7;
  background: linear-gradient(180deg, rgba(2, 132, 199, 0.04) 0%, rgba(255, 255, 255, 0.98) 100%);
}
.theme-hydrology {
  border-left: 4px solid #0d9488;
  background: linear-gradient(180deg, rgba(13, 148, 136, 0.04) 0%, rgba(255, 255, 255, 0.98) 100%);
}
.theme-geology {
  border-left: 4px solid #c2410c;
  background: linear-gradient(180deg, rgba(194, 65, 12, 0.04) 0%, rgba(255, 255, 255, 0.98) 100%);
}
.theme-systems {
  border-left: 4px solid #7c3aed;
  background: linear-gradient(180deg, rgba(124, 58, 237, 0.04) 0%, rgba(255, 255, 255, 0.98) 100%);
}

.pedagogy-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.08);
}

.badge-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}
.theme-badge {
  font-size: 13px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.05);
  color: var(--ink, #1f2937);
}
.theme-astronomy .theme-badge { background: #fef3c7; color: #b45309; }
.theme-meteorology .theme-badge { background: #e0f2fe; color: #0369a1; }
.theme-hydrology .theme-badge { background: #ccfbf1; color: #0f766e; }
.theme-geology .theme-badge { background: #ffedd5; color: #c2410c; }
.theme-systems .theme-badge { background: #ede9fe; color: #6d28d9; }

.sub-badge {
  font-size: 12px;
  color: var(--muted, #6b7280);
}

.pedagogy-actions {
  display: flex;
  gap: 8px;
}
.pedagogy-btn {
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid var(--border, #d1d5db);
  background: #ffffff;
  color: var(--text, #374151);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.pedagogy-btn:hover {
  background: rgba(0, 0, 0, 0.04);
  border-color: #9ca3af;
}

.pedagogy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

.pedagogy-card {
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}
.card-title .icon {
  font-size: 15px;
}
.card-title h4 {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--ink, #111827);
}

.card-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text, #374151);
}
.card-list li {
  margin-bottom: 4px;
}
.card-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text, #374151);
}

.card-limits {
  background: rgba(245, 158, 11, 0.04);
  border-color: rgba(245, 158, 11, 0.15);
}
.disclaimer-note {
  margin-top: 8px;
  font-size: 11px;
  color: #92400e;
  line-height: 1.4;
  font-style: italic;
}

.pedagogy-connections {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.connect-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--muted, #6b7280);
}
.connect-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.connect-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 12px;
  transition: transform 0.15s, box-shadow 0.15s;
  border: 1px solid transparent;
}
.connect-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.chip-lab {
  background: #f0fdf4;
  color: #166534;
  border-color: #bbf7d0;
}
.chip-textbook {
  background: #f8fafc;
  color: #1e293b;
  border-color: #e2e8f0;
}
.chip-practice {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}
.chip-type {
  font-size: 11px;
  opacity: 0.8;
  padding: 1px 4px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 4px;
}
.chip-title {
  font-weight: 600;
}
.chip-arrow {
  opacity: 0.7;
}

@media (max-width: 720px) {
  .pedagogy-panel { padding: 12px 14px; margin-top: 14px; }
  .pedagogy-header { flex-direction: column; align-items: flex-start; gap: 8px; }
  .pedagogy-grid { grid-template-columns: 1fr; gap: 10px; }
  .connect-chips { flex-direction: column; }
}
</style>
