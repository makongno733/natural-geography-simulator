<script setup>
defineProps({
  chains: { type: Array, default: () => [] },
})
</script>

<template>
  <section class="mechanism-chain">
    <article v-for="chain in chains" :key="chain.title" class="mechanism-chain__item">
      <h3>{{ chain.title }}</h3>
      <ol class="mechanism-chain__steps">
        <li v-for="(step, index) in chain.steps" :key="`${chain.title}-${index}`">
          <span data-chain-step>{{ step }}</span>
          <span v-if="index < chain.steps.length - 1" data-chain-arrow aria-hidden="true">→</span>
        </li>
      </ol>
    </article>
  </section>
</template>

<style scoped>
.mechanism-chain__item + .mechanism-chain__item {
  margin-top: 18px;
}

.mechanism-chain__item h3 {
  margin: 0 0 12px;
  color: var(--red);
  font-size: 16px;
}

.mechanism-chain__steps {
  display: flex;
  flex-direction: row;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.mechanism-chain__steps li {
  display: flex;
  min-width: 0;
  flex: 1 1 0;
  align-items: center;
  gap: 8px;
}

[data-chain-step] {
  display: grid;
  min-height: 64px;
  flex: 1 1 auto;
  place-items: center;
  border: 1px solid var(--brown);
  border-radius: var(--radius-card);
  padding: 10px;
  background: var(--paper);
  color: var(--ink);
  line-height: 1.6;
  text-align: center;
}

[data-chain-arrow] {
  flex: 0 0 auto;
  color: var(--button-green-deep);
  font-weight: 700;
}

@media (max-width: 720px) {
  .mechanism-chain__steps {
    flex-direction: column;
  }

  .mechanism-chain__steps li {
    width: 100%;
    flex-direction: column;
  }

  [data-chain-step] {
    width: 100%;
    min-height: 48px;
  }

  [data-chain-arrow] {
    transform: rotate(90deg);
  }
}
</style>
