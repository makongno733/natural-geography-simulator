<template>
  <div class="app-root">
    <header class="app-header">
      <router-link to="/" class="app-title">中学地理教学系统</router-link>
      <p class="app-subtitle">人教版 · 初中 / 高中</p>
      <div class="global-ppt-tools">
        <label class="global-folder-picker">
          <input
            type="file"
            webkitdirectory
            directory
            multiple
            accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            @change="handleGlobalFolderPicked"
          >
          选择本地文件夹（全站PPT）
        </label>
        <span v-if="localFolderLoaded" class="global-folder-state">已导入 {{ localPptResources.length }} 个课件</span>
      </div>
    </header>
    <router-view />
  </div>
</template>

<script setup>
import { parseLocalPptFolder } from './textbook/data/pptResources.js'
import { usePptFolderStore } from './textbook/data/pptFolderStore.js'

const {
  localPptResources,
  localFolderLoaded,
  setLocalPptResources
} = usePptFolderStore()

function handleGlobalFolderPicked(event) {
  const resources = parseLocalPptFolder(event.target.files)
  setLocalPptResources(resources)
}
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
  font-size: clamp(44px, 9vw, 96px);
  color: var(--red);
  text-shadow: 0 8px 22px rgba(173, 20, 25, 0.18);
  line-height: 1;
  letter-spacing: 0;
  text-decoration: none;
  display: block;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 6px;
  word-break: keep-all;
  overflow-wrap: anywhere;
}
.app-subtitle {
  margin: 4px 0 0;
  color: #b85a4d;
  font-size: 14px;
  font-family: "Noto Serif SC", "Songti SC", serif;
}
.global-ppt-tools {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  align-items: center;
}
.global-folder-picker {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--brown);
  border-radius: 6px;
  background: #fff;
  padding: 6px 10px;
  font-size: 12px;
  color: #6b3b32;
  cursor: pointer;
  user-select: none;
}
.global-folder-picker input {
  display: none;
}
.global-folder-state {
  font-size: 12px;
  color: #8d463d;
}

@media (max-width: 720px) {
  .app-header {
    padding: 22px 14px 12px;
  }
  .app-title {
    font-size: clamp(32px, 11vw, 54px);
    line-height: 1.04;
  }
}
</style>
