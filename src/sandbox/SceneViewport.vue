<template>
  <div ref="viewportHost" class="scene-viewport">
    <!-- Top-left: current stage info -->
    <div v-if="evolutionStage" class="overlay overlay-top-left">
      <div class="overlay-badge">{{ evolutionStage.name }}</div>
      <div class="overlay-desc">{{ evolutionStage.desc }}</div>
    </div>

    <!-- Auto-rotate indicator -->
    <div v-if="autoRotating" class="overlay overlay-auto-rotate">
      <div class="rotate-indicator">
        <span class="rotate-icon">⟳</span>
        <span>自动旋转中</span>
      </div>
    </div>

    <!-- Bottom-right: climate assessment -->
    <div v-if="climateMetrics" class="overlay overlay-climate">
      <div class="climate-card">
        <div class="climate-title">⏱ 气候模拟评估</div>
        <div class="climate-row">
          <span>模拟时长</span>
          <span class="cv">{{ climateMetrics.years }} 年</span>
        </div>
        <div class="climate-row">
          <span>侵蚀权重</span>
          <span class="cv">{{ climateMetrics.erosionWeight.toFixed(2) }}</span>
        </div>
        <div class="climate-row">
          <span>累计下切</span>
          <span class="cv">+{{ climateMetrics.cumulativeErosion }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

defineProps({
  evolutionStage: { type: Object, default: null },
  climateMetrics: { type: Object, default: null },
  autoRotating: { type: Boolean, default: false }
})

const viewportHost = ref(null)
const emit = defineEmits(['sceneReady'])

onMounted(() => {
  if (viewportHost.value) emit('sceneReady', viewportHost.value)
})
</script>

<style scoped>
.scene-viewport {
  width: 100%;
  min-height: 400px;
  background: linear-gradient(135deg, #2a78be 0%, #73b7ef 36%, #bde2ff 100%);
  border-radius: 9px;
  overflow: hidden;
  position: relative;
}

.overlay {
  position: absolute;
  z-index: 10;
  pointer-events: none;
  user-select: none;
}

.overlay-top-left {
  top: 10px;
  left: 10px;
  max-width: 320px;
  background: rgba(8, 18, 28, 0.72);
  border: 1px solid rgba(134, 217, 255, 0.22);
  border-radius: 8px;
  padding: 7px 10px;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.overlay-badge {
  color: #9ee7ff;
  font-size: 0.78rem;
  font-weight: 600;
  margin-bottom: 2px;
  letter-spacing: 0.01em;
}

.overlay-desc {
  color: #dce8f2;
  font-size: 0.66rem;
  line-height: 1.4;
  opacity: 0.9;
}

.overlay-auto-rotate {
  top: 10px;
  right: 10px;
}

.rotate-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(8, 18, 28, 0.65);
  border: 1px solid rgba(134, 217, 255, 0.2);
  border-radius: 6px;
  padding: 5px 9px;
  color: #9ee7ff;
  font-size: 0.68rem;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.rotate-icon {
  font-size: 1rem;
  animation: spin 2s linear infinite;
  display: inline-block;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.overlay-climate {
  bottom: 10px;
  right: 10px;
}

.climate-card {
  background: rgba(8, 18, 28, 0.72);
  border: 1px solid rgba(134, 217, 255, 0.22);
  border-radius: 8px;
  padding: 7px 10px;
  min-width: 155px;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.climate-title {
  color: #9ee7ff;
  font-size: 0.68rem;
  font-weight: 600;
  margin-bottom: 3px;
}

.climate-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.63rem;
  color: #c0d8e8;
  padding: 1px 0;
}

.climate-row .cv {
  color: #9ee7ff;
  font-weight: 500;
  font-family: "SF Mono", Menlo, monospace;
  font-size: 0.62rem;
}
</style>
