<script setup>
defineProps({
  chains: { type: Array, default: () => [] },
})
</script>

<template>
  <section>
    <article v-for="chain in chains" :key="chain.title">
      <h3>{{ chain.title }}</h3>
      <ol>
        <li v-for="(step, index) in chain.steps" :key="`${chain.title}-${index}`">
          <span data-chain-step>{{ step }}</span>
          <span v-if="index < chain.steps.length - 1" data-chain-arrow aria-hidden="true">→</span>
        </li>
      </ol>
    </article>
  </section>
</template>
