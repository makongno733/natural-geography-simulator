<template>
  <div v-if="isActive" class="tour-overlay" role="dialog" aria-modal="true" aria-label="地理共同体漫游引导">
    <div class="tour-backdrop" @click="skipTour"></div>

    <!-- 引导弹窗卡片 -->
    <div
      class="tour-card baroque-frame"
      :style="cardPositionStyle"
    >
      <div class="tour-card-header">
        <span class="tour-step-badge">步骤 {{ currentStepIndex + 1 }} / {{ steps.length }}</span>
        <button type="button" class="tour-skip-btn" @click="skipTour">跳过导览 ✕</button>
      </div>

      <h3 class="tour-title">{{ currentStep.title }}</h3>
      <p class="tour-desc">{{ currentStep.description }}</p>

      <div class="tour-actions">
        <button
          v-if="currentStepIndex > 0"
          type="button"
          class="baroque-btn baroque-btn-sm"
          @click="prevStep"
        >
          ← 上一步
        </button>
        <button
          v-if="currentStepIndex < steps.length - 1"
          type="button"
          class="baroque-btn baroque-btn-sm baroque-btn-primary"
          @click="nextStep"
        >
          下一步 →
        </button>
        <button
          v-else
          type="button"
          class="baroque-btn baroque-btn-sm baroque-btn-brass"
          @click="finishTour"
        >
          完成导览，开始探索 ✦
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'

const STORAGE_KEY = 'geo_community_onboarding_tour_v1'
const isActive = ref(false)
const currentStepIndex = ref(0)
const cardPositionStyle = ref({})

const steps = [
  {
    target: '.app-header',
    title: '🌐 欢迎来到地理共同体',
    description: '在这里可以一起观察地理现象、动手做 3D 实验、阅读初高中与大学教材，并和同学老师讨论问题。'
  },
  {
    target: '.nav-search-trigger',
    title: '🔍 全站知识与实验检索 (⌘K)',
    description: '随时按下 Cmd+K（Windows 下为 Ctrl+K）或点击顶栏“检索”，即可快速查找任何 3D 实验、教材章节、探究任务或社区问题。'
  },
  {
    target: '.community-hero-actions',
    title: '✍ 提问、分享与讨论',
    description: '看到不理解的地理现象或实验结果？点击“发起讨论”，写下你的观察和猜想，还可以直接附上 3D 模型和证据卡。'
  },
  {
    target: '.hot-topics-bar',
    title: '🛰 近期地球事件与开放数据',
    description: '查看来自美国地质调查局（USGS）和 NASA 的近期地震、风暴与天象记录，或前往资源馆获取地形与气候数据。'
  }
]

const currentStep = computed(() => steps[currentStepIndex.value])

function updatePosition() {
  const targetEl = document.querySelector(currentStep.value.target)
  if (!targetEl) {
    cardPositionStyle.value = {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }
    return
  }

  const rect = targetEl.getBoundingClientRect()
  const cardWidth = Math.min(380, Math.max(260, window.innerWidth - 32))
  const top = Math.min(Math.max(16, window.innerHeight - 280), Math.max(16, rect.bottom + 16))
  const left = Math.max(16, Math.min(window.innerWidth - cardWidth - 16, rect.left))

  cardPositionStyle.value = {
    top: `${top}px`,
    left: `${left}px`
  }

  targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function nextStep() {
  if (currentStepIndex.value < steps.length - 1) {
    currentStepIndex.value++
    nextTick(updatePosition)
  }
}

function prevStep() {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--
    nextTick(updatePosition)
  }
}

function finishTour() {
  isActive.value = false
  localStorage.setItem(STORAGE_KEY, 'completed')
}

function skipTour() {
  isActive.value = false
  localStorage.setItem(STORAGE_KEY, 'skipped')
}

function startTour(force = false) {
  if (force || !localStorage.getItem(STORAGE_KEY)) {
    isActive.value = true
    currentStepIndex.value = 0
    nextTick(updatePosition)
  }
}

defineExpose({
  startTour
})
</script>

<style scoped>
.tour-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  pointer-events: auto;
}

.tour-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(7, 19, 34, 0.55);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}

.tour-card {
  position: absolute;
  width: min(380px, calc(100vw - 32px));
  padding: 22px 24px;
  background: #ffffff;
  border: 1px solid var(--baroque-border-gold);
  border-radius: 12px;
  box-shadow: 0 16px 40px rgba(7, 19, 34, 0.35), 0 0 16px rgba(197, 160, 89, 0.25);
  z-index: 10001;
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: tourPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes tourPop {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}

.tour-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tour-step-badge {
  font-size: 11px;
  font-family: ui-monospace, monospace;
  font-weight: 700;
  color: #8b6826;
  background: rgba(197, 160, 89, 0.18);
  padding: 2px 7px;
  border-radius: 4px;
}

.tour-skip-btn {
  background: none;
  border: none;
  color: var(--text-faint);
  font-size: 12px;
  cursor: pointer;
  padding: 2px 6px;
}

.tour-skip-btn:hover {
  color: var(--text);
}

.tour-title {
  margin: 0;
  font-size: 17px;
  color: var(--geo-ocean-deep);
  font-family: Georgia, 'Songti SC', serif;
}

.tour-desc {
  margin: 0;
  font-size: 13.5px;
  color: var(--text-muted);
  line-height: 1.6;
}

.tour-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 6px;
  border-top: 1px solid var(--border);
  padding-top: 12px;
}
</style>
