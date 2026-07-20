<script setup>
defineEmits(['close'])
</script>

<template>
  <section class="async-module-error" data-async-module-error role="alert">
    <h2>教学工具加载失败</h2>
    <p>暂时无法打开该互动工具，请返回课文继续学习。</p>
    <button type="button" @click="$emit('close')">返回课文</button>
  </section>
</template>

<style scoped>
.async-module-error {
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

.async-module-error button {
  min-height: 40px;
  border: 1px solid var(--button-green-deep);
  border-radius: var(--radius-sm);
  padding: 8px 16px;
  color: var(--button-green-ink);
  background: var(--button-green);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.async-module-error button:focus-visible {
  outline: 2px solid var(--red);
  outline-offset: 2px;
}
</style>
