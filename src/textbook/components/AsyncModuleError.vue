<script setup>
import { computed } from 'vue'

const props = defineProps({
  error: { type: [Object, Error, String], default: null },
  retry: { type: Function, default: null },
  attempts: { type: Number, default: 0 },
  moduleName: { type: String, default: '' },
})
const emit = defineEmits(['close'])

const displayName = computed(() => props.moduleName || '教学互动工具')
const errorMessage = computed(() => {
  const error = props.error
  if (!error) return ''
  if (typeof error === 'string') return error
  if (typeof error === 'object' && error.message) return error.message
  return ''
})
</script>

<template>
  <section class="async-module-error" data-async-module-error role="alert">
    <h2>{{ displayName }}加载失败</h2>
    <p v-if="errorMessage" class="async-module-error-detail">{{ errorMessage }}</p>
    <p>暂时无法打开该互动工具，可以重试，或返回课文继续学习。</p>
    <div class="async-module-error-actions">
      <button v-if="retry" type="button" class="retry-btn" @click="retry">重试</button>
      <button type="button" @click="emit('close')">返回课文</button>
    </div>
  </section>
</template>

<style scoped>
.async-module-error {
  -webkit-backdrop-filter: var(--blur);
  backdrop-filter: var(--blur);
  max-width: 640px;
  margin: 32px auto;
  border: 1px solid var(--brown);
  border-radius: var(--radius-box);
  padding: 24px;
  text-align: center;
  background: var(--card-bg);
}

.async-module-error h2 {
  margin-top: 0;
  color: var(--red);
}

.async-module-error-detail {
  font-size: 12px;
  color: var(--muted);
  word-break: break-all;
}

.async-module-error-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 8px;
}

.async-module-error button {
  min-height: 40px;
  border: 1px solid var(--accent);
  border-radius: 999px;
  padding: 8px 16px;
  color: var(--accent);
  background: var(--button-green);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.async-module-error .retry-btn {
  position: relative;
  overflow: hidden;
  color: #fff;
  border-color: var(--accent-strong);
  background: var(--gem-flecks), var(--gem);
  box-shadow: var(--gem-glow), var(--gem-inner);
}

.async-module-error .retry-btn::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 45%;
  background-image: var(--rainbow-sweep);
  transform: translateX(-140%) skewX(-14deg);
  transition: transform 0.55s ease;
  pointer-events: none;
}

.async-module-error .retry-btn:hover {
  background: var(--gem-flecks), var(--gem-deep);
}

.async-module-error .retry-btn:hover::after {
  transform: translateX(340%) skewX(-14deg);
}

.async-module-error button:focus-visible {
  outline: 2px solid var(--red);
  outline-offset: 2px;
}
</style>
