<template>
  <div class="tutorial">
    <div class="tutorial-step-indicators">
      <button
        v-for="(step, i) in steps"
        :key="i"
        :class="['step-dot', { active: i === current, done: i < current }]"
        @click="goTo(i)"
      >
        {{ i + 1 }}
      </button>
    </div>
    <div class="tutorial-main">
      <h3 class="tutorial-step-title">{{ steps[current].title }}</h3>
      <div class="tutorial-illustration" v-if="steps[current].illustration">
        <div v-html="steps[current].illustration" class="illustration-svg"></div>
      </div>
      <div class="tutorial-content">{{ steps[current].content }}</div>
      <div class="tutorial-highlight" v-if="steps[current].highlight">
        <strong>核心提示：</strong>{{ steps[current].highlight }}
      </div>
      <div class="tutorial-nav">
        <button :disabled="current === 0" @click="goTo(current - 1)" class="btn-nav">◀ 上一步</button>
        <span class="tutorial-progress">{{ current + 1 }} / {{ steps.length }}</span>
        <button :disabled="current === steps.length - 1" @click="goTo(current + 1)" class="btn-nav">下一步 ▶</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({ steps: { type: Array, required: true } })
const current = ref(0)

function goTo(i) { if (i >= 0 && i < props.steps.length) current.value = i }

function onKey(e) {
  if (e.key === 'ArrowRight') goTo(current.value + 1)
  if (e.key === 'ArrowLeft') goTo(current.value - 1)
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.tutorial { display: flex; gap: 28px; max-width: 820px; margin: 0 auto; }
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
  border: 2px solid var(--brown);
  background: var(--paper);
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition), border-color var(--transition), color var(--transition);
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
  background: var(--brown-light);
}
.step-dot.active { background: var(--red); border-color: var(--red); color: #fff; }
.step-dot.done { background: var(--button-green-strong); border-color: var(--button-green-deep); color: var(--button-green-ink); }
.tutorial-main { flex: 1; min-width: 0; }
.tutorial-step-title { font-size: 20px; font-weight: 700; color: var(--ink); margin: 0 0 14px; }
.tutorial-illustration {
  margin-bottom: 14px;
  background: rgba(255,255,255,0.6);
  border-radius: var(--radius-box);
  border: 1px solid var(--brown-light);
  padding: 16px;
  display: flex;
  justify-content: center;
}
.illustration-svg { max-width: 100%; min-height: 100px; }
.illustration-svg :deep(svg) { display: block; max-width: 100%; height: auto; min-height: 100px; }
.tutorial-content { font-size: 15px; line-height: 1.8; color: var(--ink); margin-bottom: 14px; }
.tutorial-highlight {
  background: linear-gradient(90deg, rgba(158, 36, 38, 0.08), transparent);
  border-left: 3px solid var(--red);
  padding: 10px 14px;
  font-size: 13px;
  color: var(--red);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  margin-bottom: 18px;
}
.tutorial-nav { display: flex; align-items: center; justify-content: space-between; }
.btn-nav {
  padding: 6px 16px;
  border: 1px solid var(--brown);
  border-radius: var(--radius-sm);
  background: var(--cream);
  color: var(--ink);
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  transition: background var(--transition);
}
.btn-nav:hover:not(:disabled) { background: var(--button-green); }
.btn-nav:disabled { opacity: 0.4; cursor: default; }
.tutorial-progress { font-size: 13px; color: var(--muted); }

@media (max-width: 640px) {
  .tutorial { flex-direction: column; gap: 16px; }
  .tutorial-step-indicators { flex-direction: row; gap: 4px; overflow-x: auto; padding-bottom: 8px; }
  .step-dot:not(:last-child) { margin-bottom: 0; margin-right: 18px; }
  .step-dot:not(:last-child)::after { top: 50%; left: 32px; width: 16px; height: 2px; transform: translateY(-50%); }
}
</style>
