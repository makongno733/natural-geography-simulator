<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  id: { type: String, required: true },
  title: { type: String, required: true },
  defaultOpen: { type: Boolean, default: false },
  open: { type: Boolean, default: undefined },
})

const emit = defineEmits(['update:open'])
const internalOpen = ref(props.defaultOpen)
const isOpen = computed({
  get: () => props.open === undefined ? internalOpen.value : props.open,
  set: (value) => {
    if (props.open === undefined) internalOpen.value = value
    else emit('update:open', value)
  },
})
</script>

<template>
  <section class="learning-section" :data-learning-section="id">
    <h2 class="learning-section__heading">
      <button
        class="learning-section__toggle"
        type="button"
        :aria-controls="`${id}-content`"
        :aria-expanded="isOpen"
        @click="isOpen = !isOpen"
      >
        <span>{{ isOpen ? `收起${title}` : `展开${title}` }}</span>
        <span class="learning-section__indicator" aria-hidden="true">{{ isOpen ? '−' : '+' }}</span>
      </button>
    </h2>
    <div v-show="isOpen" :id="`${id}-content`" class="learning-section__content">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.learning-section {
  margin-top: 16px;
  overflow: hidden;
  border: 1px solid var(--brown-light);
  border-radius: var(--radius-box);
  background: var(--card-bg);
}

.learning-section__heading {
  margin: 0;
  font: inherit;
}

.learning-section__toggle {
  display: flex;
  width: 100%;
  min-height: 40px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 0;
  padding: 10px 14px;
  color: var(--ink);
  background: var(--paper);
  font: inherit;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}

.learning-section__toggle:hover {
  color: var(--button-green-ink);
  background: var(--button-green);
}

.learning-section__toggle:focus-visible {
  outline: 2px solid var(--red);
  outline-offset: -2px;
}

.learning-section__indicator {
  flex: 0 0 auto;
  font-size: 20px;
  line-height: 1;
}

.learning-section__content {
  padding: 16px;
  border-top: 1px solid var(--brown-light);
}

.learning-section__content :deep(> :first-child) {
  margin-top: 0;
}

.learning-section__content :deep(> :last-child) {
  margin-bottom: 0;
}
</style>
