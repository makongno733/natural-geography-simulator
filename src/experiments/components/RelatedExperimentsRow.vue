<template>
  <div v-if="experiments.length" class="related-experiments-row">
    <strong>相关实验：</strong>
    <router-link
      v-for="experiment in experiments"
      :key="experiment.id"
      :to="experimentRoute(experiment)"
    >
      {{ experiment.name }} <span aria-hidden="true">→</span>
    </router-link>
  </div>
</template>

<script setup>
const props = defineProps({
  experiments: { type: Array, default: () => [] },
  source: { type: Object, required: true },
})

function experimentRoute(experiment) {
  return {
    name: 'experiment-view',
    params: { category: experiment.category, experiment: experiment.id },
    query: {
      fromGrade: props.source.grade,
      fromBook: props.source.book,
      fromChapter: props.source.chapter,
      fromSection: props.source.section,
    },
  }
}
</script>

<style scoped>
.related-experiments-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  align-items: baseline;
  margin: 12px 0;
  padding-top: 12px;
  border-top: 1px solid var(--brown-light);
  font-size: 13px;
  line-height: 1.6;
}

.related-experiments-row strong {
  color: var(--muted);
}

.related-experiments-row a {
  color: var(--red);
  text-decoration: none;
}

.related-experiments-row a:hover {
  text-decoration: underline;
}

.related-experiments-row a:focus-visible {
  outline: 2px solid var(--red);
  outline-offset: 2px;
}
</style>
