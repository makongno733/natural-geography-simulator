<template>
  <div ref="viewportHost" class="scene-viewport"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const viewportHost = ref(null)
const emit = defineEmits(['sceneReady'])

onMounted(() => {
  if (viewportHost.value) emit('sceneReady', viewportHost.value)
})
</script>

<style scoped>
.scene-viewport{width:100%;min-height:400px;background:linear-gradient(135deg,#2a78be 0%,#73b7ef 36%,#bde2ff 100%);border-radius:9px;overflow:hidden;position:relative}
</style>
