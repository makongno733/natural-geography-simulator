<template>
  <span>
    <template v-for="(seg, i) in segments" :key="i">
      <span v-if="seg.type === 'text'">{{ seg.text }}</span>
      <button
        v-else
        class="glossary-term-btn"
        @click.stop="$emit('showTerm', seg.term, $event)"
        :title="seg.term.term"
      >
        {{ seg.term.term }}
        <sup class="glossary-icon">ⓘ</sup>
      </button>
    </template>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: { type: String, required: true },
  glossary: { type: Object, required: true }
})
defineEmits(['showTerm'])

// Sort terms by length (longest first) to match multi-word terms first
const sortedTerms = computed(() =>
  Object.entries(props.glossary)
    .sort(([a], [b]) => b.length - a.length)
)

const segments = computed(() => {
  let remaining = props.text
  const parts = []

  while (remaining.length > 0) {
    let bestMatch = null
    let bestIdx = -1

    // Find earliest matching term
    for (const [key, term] of sortedTerms.value) {
      const idx = remaining.indexOf(key)
      if (idx !== -1 && (bestIdx === -1 || idx < bestIdx)) {
        bestMatch = { key, term }
        bestIdx = idx
      }
    }

    if (bestMatch && bestIdx >= 0) {
      // Text before match
      if (bestIdx > 0) {
        parts.push({ type: 'text', text: remaining.slice(0, bestIdx) })
      }
      // The matched term
      parts.push({ type: 'term', text: bestMatch.key, term: bestMatch.term })
      remaining = remaining.slice(bestIdx + bestMatch.key.length)
    } else {
      // No more matches
      parts.push({ type: 'text', text: remaining })
      remaining = ''
    }
  }

  return parts
})
</script>

<style scoped>
.glossary-term-btn {
  display: inline;
  border: none;
  background: none;
  padding: 0;
  margin: 0;
  color: #6b4a8a;
  font-weight: 600;
  font-size: inherit;
  cursor: pointer;
  border-bottom: 1px dashed #6b4a8a;
  transition: background 0.1s;
}
.glossary-term-btn:hover {
  background: rgba(107,74,138,0.1);
  border-radius: 2px;
}
.glossary-icon {
  font-size: 10px;
  vertical-align: super;
  line-height: 0;
  color: #8b6aaa;
}
</style>
