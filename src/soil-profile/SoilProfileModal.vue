<template>
  <div class="modal-mask" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">3D 土壤剖面图</h2>
        <span class="modal-chapter">第五章 植被与土壤 · 第二节 土壤</span>
        <button class="modal-close" @click="$emit('close')">✕ 关闭</button>
      </div>

      <div class="mode-tabs">
        <button
          v-for="m in modes"
          :key="m.key"
          :class="['mode-tab', { active: currentMode === m.key }]"
          @click="currentMode = m.key"
        >{{ m.label }}</button>
      </div>

      <div class="scene-area">
        <SoilProfile3D
          :mode="currentMode"
          @layer-click="onLayerClick"
        />
      </div>

      <div class="mode-description">
        <p v-if="currentMode === 'simple'">简单模式：展示土壤的 5 个基本层（O → A → E → B → C），适用于高中地理教学。点击图层名称旁的 ⓘ 查看解释。</p>
        <p v-else>专业模式：基于 USDA Soil Taxonomy 和 WRB 国际标准，展示精细土层划分（含亚层），适用于研究生学习。</p>
      </div>

      <InfoPopup
        :visible="!!selectedLayer"
        :layer="selectedLayer"
        :mode="currentMode"
        @close="selectedLayer = null"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SoilProfile3D from './SoilProfile3D.vue'
import InfoPopup from './InfoPopup.vue'

defineEmits(['close'])

const modes = [
  { key: 'simple', label: '简单模式' },
  { key: 'professional', label: '专业模式' }
]
const currentMode = ref('simple')
const selectedLayer = ref(null)

function onLayerClick({ layer }) {
  selectedLayer.value = layer
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 90;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal-container {
  background: #f8f6f2;
  border-radius: 16px;
  width: min(900px, 96vw);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}
.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px 12px;
  border-bottom: 1px solid #e0d6cc;
}
.modal-title {
  margin: 0;
  font-size: 18px;
  color: #b01217;
}
.modal-chapter {
  font-size: 12px;
  color: #8a7a6e;
  flex: 1;
}
.modal-close {
  border: 1px solid #d0c4b8;
  border-radius: 8px;
  padding: 6px 14px;
  background: #fff;
  color: #555;
  font-size: 13px;
  cursor: pointer;
}
.modal-close:hover {
  background: #f0e8e0;
}
.mode-tabs {
  display: flex;
  gap: 0;
  padding: 0 20px;
  border-bottom: 1px solid #e0d6cc;
}
.mode-tab {
  border: 1px solid transparent;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  padding: 8px 20px;
  font-size: 14px;
  background: transparent;
  color: #6b5a4e;
  cursor: pointer;
  margin-bottom: -1px;
}
.mode-tab.active {
  background: #fff;
  border-color: #e0d6cc;
  color: #b01217;
  font-weight: 600;
}
.mode-tab:hover:not(.active) {
  background: rgba(0, 0, 0, 0.03);
}
.scene-area {
  flex: 1;
  min-height: 400px;
  background: linear-gradient(180deg, #e8e2d8 0%, #d6cec2 100%);
}
.mode-description {
  padding: 10px 20px;
  font-size: 13px;
  color: #6b5a4e;
  border-top: 1px solid #e0d6cc;
  background: #faf8f4;
}
.mode-description p {
  margin: 0;
  line-height: 1.5;
}
</style>
