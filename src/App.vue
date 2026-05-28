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
    radial-gradient(circle at 15% 10%, rgba(255,243,214,.75) 0, rgba(255,252,244,.95) 42%, #fffef9 100%),
    repeating-linear-gradient(45deg, rgba(225,198,149,.08) 0 2px, transparent 2px 12px),
    repeating-linear-gradient(-45deg, rgba(225,198,149,.05) 0 1px, transparent 1px 10px);
  background-color: #fffdf8;
}
.app-header {
  text-align: center;
  padding: 24px 20px 8px;
}
.app-title {
  font-family: "Ma Shan Zheng", "STXingkai", serif;
  font-size: clamp(48px, 8vw, 120px);
  color: #b01217;
  text-shadow: 0 6px 20px rgba(183,55,44,0.2);
  line-height: 1;
  letter-spacing: 2px;
  text-decoration: none;
  display: block;
}
.app-subtitle {
  margin: 4px 0 0;
  color: #b85a4d;
  font-size: 14px;
  font-family: "Noto Serif SC", "Songti SC", serif;
}
</style>
