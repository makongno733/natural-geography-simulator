<script setup>
import { ref } from 'vue'

const props = defineProps({
  id: { type: String, required: true },
  title: { type: String, required: true },
  defaultOpen: { type: Boolean, default: false },
})

const open = ref(props.defaultOpen)
</script>

<template>
  <section :data-learning-section="id">
    <button
      type="button"
      :aria-controls="`${id}-content`"
      :aria-expanded="open"
      @click="open = !open"
    >
      {{ title }}
    </button>
    <div v-if="open" :id="`${id}-content`">
      <slot />
    </div>
  </section>
</template>
