<template>
  <div class="app-root">
    <header class="app-header">
      <router-link to="/" class="app-title">中学地理教学系统</router-link>
      <p class="app-subtitle">人教版 · 初中 / 高中</p>
    </header>
    <router-view />
  </div>
</template>

<script setup>
</script>

<style scoped>
.app-root {
  min-height: 100vh;
  background:
    linear-gradient(90deg, rgba(173, 20, 25, 0.035) 1px, transparent 1px),
    linear-gradient(0deg, rgba(173, 20, 25, 0.025) 1px, transparent 1px),
    radial-gradient(circle at 50% 0%, rgba(255, 239, 205, 0.88), transparent 38%),
    linear-gradient(180deg, #fffefb 0%, var(--paper) 100%);
  background-size: 18px 18px, 18px 18px, auto, auto;
  background-color: var(--cream);
}
.app-header {
  text-align: center;
  padding: 28px 20px 14px;
  border-bottom: 1px solid rgba(173, 20, 25, 0.12);
}
.app-title {
  font-family: "Ma Shan Zheng", "STXingkai", "Kaiti SC", serif;
  font-size: 96px;
  color: var(--red);
  text-shadow: 0 8px 22px rgba(173, 20, 25, 0.18);
  line-height: 1;
  letter-spacing: 0;
  text-decoration: none;
  display: block;
}
.app-subtitle {
  margin: 4px 0 0;
  color: #b85a4d;
  font-size: 14px;
  font-family: "Noto Serif SC", "Songti SC", serif;
}

@media (max-width: 720px) {
  .app-header {
    padding: 22px 14px 12px;
  }
  .app-title {
    font-size: 54px;
    white-space: nowrap;
  }
}
</style>
