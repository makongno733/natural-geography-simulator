<template>
  <section
    v-if="status !== 'idle' && status !== 'ready'"
    :data-loading-experiment="status === 'loading' ? '' : null"
    :data-load-error="status === 'error' ? '' : null"
    :data-invalid-experiment="status === 'invalid-experiment' ? '' : null"
    :data-invalid-preset="status === 'invalid-preset' ? '' : null"
    :data-webgl-unavailable="status === 'webgl-unavailable' ? '' : null"
    class="experiment-load-state"
    role="status"
    aria-live="polite"
  >
    <p v-if="status === 'loading'">正在加载实验…</p>
    <p v-else-if="status === 'error'">实验加载失败，请检查网络后重试。</p>
    <p v-else-if="status === 'invalid-experiment'">未找到该实验。</p>
    <p v-else-if="status === 'invalid-preset'">该实验预设无效，请从实验室重新选择。</p>
    <p v-else-if="status === 'webgl-unavailable'">当前设备不支持运行此 3D 实验所需的 WebGL。</p>

    <div class="experiment-load-actions">
      <button v-if="status === 'error'" type="button" data-retry-experiment @click="$emit('retry')">重新加载实验</button>
      <a data-back-experiments href="/experiments">返回实验室</a>
    </div>
  </section>
</template>

<script setup>
defineProps({
  status: { type: String, required: true },
})

defineEmits(['retry'])
</script>

<style scoped>
.experiment-load-state {
  padding: 18px;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-card);
  background: var(--surface);
  color: var(--text);
  -webkit-backdrop-filter: var(--blur);
  backdrop-filter: var(--blur);
  box-shadow: var(--shadow-sm);
}
.experiment-load-state p { margin: 0; }
.experiment-load-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 14px; align-items: center; }
.experiment-load-actions a { color: var(--accent); font-weight: 600; }
.experiment-load-actions button {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--accent-strong);
  border-radius: var(--radius-pill);
  padding: 7px 14px;
  color: var(--accent-ink);
  background: var(--gem-flecks), var(--gem);
  box-shadow: var(--gem-glow), var(--gem-inner);
  font-weight: 700;
  cursor: pointer;
}
</style>
