<template>
  <div class="exp-placeholder"><h3>{{ name }}</h3></div>
</template>
<script setup>
defineProps({ name: { type: String, default: '实验模块' } })
</script>
<style scoped>
.exp-placeholder { text-align: center; padding: 40px; color: var(--muted); }
</style>
