<template>
  <div class="tutorial-wrapper">
    <div class="tutorial" @touchstart="onTouchStart" @touchend="onTouchEnd">
      <div class="tutorial-step-indicators" role="tablist" aria-label="实验步骤列表">
        <button
          v-for="(step, i) in steps"
          :key="i"
          :class="['step-dot', { active: i === current, done: i < current }]"
          :aria-selected="i === current"
          @click="goTo(i)"
          :title="`第 ${i + 1} 步：${step.title}`"
        >
          {{ i + 1 }}
        </button>
      </div>

      <div class="tutorial-main">
        <div class="step-badge-row">
          <span class="step-num-tag">STEP 0{{ current + 1 }} / 0{{ steps.length }}</span>
          <span class="step-hint-tag">支持键盘 ◀ ▶ 或触屏左右轻扫翻页</span>
        </div>

        <h3 class="tutorial-step-title">{{ currentStep.title }}</h3>

        <div class="tutorial-illustration" v-if="currentStep.illustration">
          <div v-html="currentStep.illustration" class="illustration-svg"></div>
        </div>

        <div class="tutorial-content">{{ currentStep.content }}</div>

        <div class="tutorial-highlight" v-if="currentStep.highlight">
          <strong>💡 核心探究原理：</strong>{{ currentStep.highlight }}
        </div>

        <div class="tutorial-nav">
          <button
            :disabled="current === 0"
            @click="goTo(current - 1)"
            class="btn-nav"
            type="button"
          >
            ◀ 上一步
          </button>
          <span class="tutorial-progress">{{ current + 1 }} / {{ steps.length }}</span>
          <button
            :disabled="current === steps.length - 1"
            @click="goTo(current + 1)"
            class="btn-nav"
            type="button"
          >
            下一步 ▶
          </button>
        </div>
      </div>
    </div>

    <!-- 教学四要素探究看板 -->
    <ModelPedagogyPanel
      v-if="resolvedPedagogy"
      :theme="theme"
      :observe="resolvedPedagogy.observe"
      :change="resolvedPedagogy.change"
      :mechanism="resolvedPedagogy.mechanism"
      :limitations="resolvedPedagogy.limitations"
      :real-data-lab="resolvedPedagogy.realDataLab"
      :textbook-link="resolvedPedagogy.textbookLink"
      practice-link="/practice"
      @reset="goTo(0)"
    />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import ModelPedagogyPanel from './ModelPedagogyPanel.vue'

const props = defineProps({
  steps: {
    type: Array,
    required: true,
  },
  pedagogy: {
    type: Object,
    default: null,
  },
  theme: {
    type: String,
    default: 'meteorology',
  },
})

const current = ref(0)
let touchStartX = 0

const currentStep = computed(() => props.steps[current.value] || props.steps[0] || {})

const resolvedPedagogy = computed(() => {
  if (props.pedagogy) return props.pedagogy
  // Fallback defaults
  return {
    observe: ['实验各阶段的物态、颜色、沉降或流动变化。', '对比有无控制变量时的现象差异。'],
    change: ['按步骤添加或调配实验材料，改变关键实验条件。'],
    mechanism: ['通过微观或宏观物理/化学机制解释实验现象。'],
    limitations: ['动手模拟受简易器具精度与环境温湿度限制，属于定性探究演示。'],
  }
})

function goTo(i) {
  if (i >= 0 && i < props.steps.length) {
    current.value = i
  }
}

function onKey(e) {
  if (e.key === 'ArrowRight') goTo(current.value + 1)
  if (e.key === 'ArrowLeft') goTo(current.value - 1)
}

function onTouchStart(e) {
  if (e.touches && e.touches[0]) {
    touchStartX = e.touches[0].clientX
  }
}

function onTouchEnd(e) {
  if (!e.changedTouches || !e.changedTouches[0]) return
  const diffX = e.changedTouches[0].clientX - touchStartX
  if (diffX > 40) {
    goTo(current.value - 1)
  } else if (diffX < -40) {
    goTo(current.value + 1)
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.tutorial-wrapper {
  max-width: 860px;
  margin: 0 auto;
}

.tutorial {
  display: flex;
  gap: 28px;
  margin: 0 auto;
  background: var(--surface, #ffffff);
  border: 1px solid var(--glass-border, rgba(0, 0, 0, 0.08));
  border-radius: var(--radius-card, 16px);
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.tutorial-step-indicators {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding-top: 8px;
  flex-shrink: 0;
}
.step-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--border, #cbd5e1);
  background: var(--surface, #ffffff);
  color: var(--text-muted, #64748b);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  position: relative;
}
.step-dot:not(:last-child) { margin-bottom: 18px; }
.step-dot:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 32px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 16px;
  background: var(--border, #cbd5e1);
}
.step-dot.active {
  background: var(--geo-ocean);
  border-color: var(--geo-ocean);
  color: #ffffff;
  transform: scale(1.1);
  box-shadow: 0 0 10px rgba(26, 68, 108, 0.4);
}
.step-dot.done {
  background: var(--geo-ocean-surface);
  border-color: var(--geo-ocean);
  color: var(--geo-ocean);
}

.tutorial-main { flex: 1; min-width: 0; }

.step-badge-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.step-num-tag {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--geo-ocean);
  background: var(--geo-ocean-surface);
  padding: 3px 10px;
  border-radius: var(--radius-pill);
}
.step-hint-tag {
  font-size: 11px;
  color: var(--text-muted);
}

.tutorial-step-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--geo-ocean-deep);
  margin: 0 0 14px;
}

.tutorial-illustration {
  margin-bottom: 16px;
  background: var(--bg-soft);
  border-radius: var(--radius-box);
  border: 1px solid var(--border);
  padding: 18px;
  display: flex;
  justify-content: center;
}
.illustration-svg { max-width: 100%; min-height: 120px; }
.illustration-svg :deep(svg) { display: block; max-width: 100%; height: auto; min-height: 120px; }

.tutorial-content {
  font-size: 15px;
  line-height: 1.8;
  color: var(--text);
  margin-bottom: 14px;
}
.tutorial-highlight {
  background: linear-gradient(90deg, var(--geo-ocean-surface), transparent);
  border-left: 3px solid var(--geo-ocean);
  padding: 10px 14px;
  font-size: 13px;
  color: var(--geo-ocean-deep);
  border-radius: 0 8px 8px 0;
  margin-bottom: 18px;
  line-height: 1.6;
}

.tutorial-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px dashed rgba(0, 0, 0, 0.08);
}
.btn-nav {
  padding: 7px 18px;
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 999px;
  background: var(--surface, #ffffff);
  color: var(--text, #1e293b);
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}
.btn-nav:hover:not(:disabled) {
  background: #0284c7;
  border-color: #0284c7;
  color: #ffffff;
}
.btn-nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.tutorial-progress {
  font-size: 13px;
  font-weight: 600;
  color: var(--muted, #64748b);
}

@media (max-width: 640px) {
  .tutorial { flex-direction: column; gap: 12px; padding: 14px; }
  .tutorial-step-indicators { flex-direction: row; gap: 4px; overflow-x: auto; padding-bottom: 8px; width: 100%; }
  .step-dot:not(:last-child) { margin-bottom: 0; margin-right: 18px; }
  .step-dot:not(:last-child)::after { top: 50%; left: 32px; width: 16px; height: 2px; transform: translateY(-50%); }
  .tutorial-step-title { font-size: 17px; }
  .tutorial-content { font-size: 14px; line-height: 1.7; }
  .btn-nav { font-size: 12px; padding: 6px 14px; }
}
</style>
