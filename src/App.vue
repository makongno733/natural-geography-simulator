<template>
  <div class="app-root">
    <nav class="app-nav">
      <a href="#/atmosphere" :class="{ active: view === 'atmosphere' }">大气结构</a>
      <a href="#/sandbox" :class="{ active: view === 'sandbox' }">地貌沙盒</a>
    </nav>
    <AtmosphereView v-if="view === 'atmosphere'" />
    <SandboxApp v-else-if="view === 'sandbox'" />
    <div v-else class="welcome">
      <h1>自然地理教学系统</h1>
      <p>请选择上方模块</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import AtmosphereView from './AtmosphereView.vue'
import SandboxApp from './sandbox/SandboxApp.vue'

const view = ref(window.location.hash.replace(/^#\//, '') || 'atmosphere')

function onHashChange() {
  view.value = window.location.hash.replace(/^#\//, '') || 'atmosphere'
}

onMounted(() => window.addEventListener('hashchange', onHashChange))
onUnmounted(() => window.removeEventListener('hashchange', onHashChange))
</script>

<style scoped>
.app-root { min-height: 100vh; }
.app-nav {
  display: flex; gap: 0; justify-content: center;
  padding: 8px; background: linear-gradient(180deg, #d8e9ff, #eef5ff);
  border-bottom: 1px solid #a9c6e8;
}
.app-nav a {
  padding: 6px 20px; font-size: 0.85rem; color: #365776;
  text-decoration: none; border: 1px solid #a9c6e8;
  border-radius: 8px 8px 0 0; background: rgba(247,252,255,0.6);
  margin: 0 2px;
}
.app-nav a.active {
  background: #f7fcff; border-bottom-color: #f7fcff;
  color: #0f2542; font-weight: 600;
}
.welcome {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; min-height: 60vh; color: #365776;
}
</style>
