<template>
  <Teleport to="body">
    <div v-if="visible" class="info-mask" @click.self="$emit('close')">
      <div class="info-card">
        <button class="info-close" @click="$emit('close')">✕</button>
        <h3 class="info-title">{{ layer?.label }}</h3>
        <p class="info-en" v-if="layer?.labelEn">{{ layer.labelEn }}</p>
        <p class="info-body">{{ infoText }}</p>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: Boolean,
  layer: Object,
  mode: String
})
defineEmits(['close'])

const infoText = computed(() => {
  if (!props.layer) return ''
  if (props.mode === 'professional' && props.layer.infoPro) return props.layer.infoPro
  if (props.layer.infoSimple) return props.layer.infoSimple
  if (props.layer.infoPro) return props.layer.infoPro
  return '暂无详细解释'
})
</script>

<style scoped>
.info-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
}
.info-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  max-width: 420px;
  width: 90vw;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  position: relative;
}
.info-close {
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  background: #f0f0f0;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
}
.info-close:hover {
  background: #e0e0e0;
}
.info-title {
  margin: 0 0 4px;
  font-size: 16px;
  color: #333;
}
.info-en {
  font-size: 12px;
  color: #888;
  margin: 0 0 12px;
}
.info-body {
  font-size: 14px;
  line-height: 1.7;
  color: #555;
  margin: 0;
}
</style>
