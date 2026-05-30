<script setup>
import { ref } from 'vue'
const current = ref(0)
</script>
<script>
export const steps = [
  { title: '实验介绍', content: '本实验内容正在准备中，敬请期待。', highlight: '请关注后续更新' }
]
</script>
<template>
  <div class="tutorial-placeholder">
    <p>{{ steps[0]?.content }}</p>
  </div>
</template>
<style scoped>
.tutorial-placeholder { text-align: center; padding: 40px; color: var(--muted); }
</style>
