<template>
  <div :class="['app-root', { 'home-mode': isHome }]">
    <header class="app-header">
      <router-link to="/" class="app-title">中学地理教学系统</router-link>
      <p class="app-subtitle">人教版 · 初中 / 高中</p>
      <nav class="app-nav">
        <router-link to="/experiments" class="nav-link">地学实验</router-link>
      </nav>
    </header>
    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isHome = computed(() => route.path === '/')
</script>

<style scoped>
.app-root {
  min-height: 100vh;
  background:
    linear-gradient(90deg, var(--grid-green) 1px, transparent 1px),
    linear-gradient(0deg, var(--grid-green) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-gold) 1px, transparent 1px),
    linear-gradient(0deg, var(--grid-gold) 1px, transparent 1px),
    radial-gradient(circle at 50% 4%, rgba(236, 228, 169, 0.44), transparent 36%),
    linear-gradient(180deg, #fffff7 0%, var(--paper) 100%);
  background-size: 36px 36px, 36px 36px, 18px 18px, 18px 18px, auto, auto;
  background-color: var(--cream);
  overflow-x: hidden;
}
.app-root.home-mode {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
  padding-bottom: 8vh;
}
.app-header {
  text-align: center;
  padding: 28px 20px 14px;
  border-bottom: 1px solid rgba(126, 157, 105, 0.16);
  min-width: 0;
}
.home-mode .app-header {
  padding: 0 20px 8px;
  border-bottom: 0;
}
.app-title {
  font-family: "Ma Shan Zheng", "STXingkai", "Kaiti SC", serif;
  font-size: clamp(38px, 8vw, 92px);
  color: var(--red);
  text-shadow: 0 6px 18px rgba(137, 96, 45, 0.14);
  line-height: 1;
  letter-spacing: 0;
  text-decoration: none;
  display: inline-block;
  width: min(100%, 1180px);
  margin: 0 auto;
  padding: 0 12px;
  word-break: keep-all;
  overflow-wrap: normal;
  text-wrap: balance;
}
.home-mode .app-title {
  font-size: clamp(54px, 12vw, 136px);
  white-space: nowrap;
}
.app-subtitle {
  margin: 4px 0 0;
  color: #8f7652;
  font-size: 14px;
  font-family: "Noto Serif SC", "Songti SC", serif;
}
.app-nav { margin-top: 2px; display: flex; gap: 16px; justify-content: center; }
.nav-link {
  font-size: 14px;
  color: #8f7652;
  text-decoration: none;
  padding: 2px 10px;
  border-radius: 4px;
  transition: color var(--transition), background var(--transition);
}
.nav-link:hover { color: var(--red); background: rgba(158, 36, 38, 0.06); }
.nav-link.router-link-exact-active { color: var(--red); font-weight: 600; }
@media (max-width: 1120px) {
  .home-mode .app-title {
    font-size: clamp(48px, 10.5vw, 112px);
  }
}

@media (max-width: 720px) {
  .app-header {
    padding: 22px 14px 12px;
  }
  .app-title {
    font-size: clamp(30px, 10vw, 52px);
    line-height: 1.04;
    width: 100%;
    overflow-wrap: anywhere;
  }
  .home-mode .app-title {
    font-size: clamp(38px, 13vw, 64px);
    white-space: normal;
  }
  .app-root.home-mode {
    justify-content: flex-start;
    padding-top: 22vh;
    padding-bottom: 28px;
  }
}
</style>
