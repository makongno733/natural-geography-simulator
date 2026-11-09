<template>
  <aside class="evidence-attach-box baroque-frame" aria-label="探究资料附件及来源说明">
    <div class="evidence-header">
      <span class="evidence-badge">{{ provenance.label }}</span>
      <small v-if="evidence" class="evidence-task-title">{{ evidence.taskTitle }}</small>
    </div>
    <h4 class="evidence-title">{{ evidence?.title || `未识别的资料附件（${evidenceId}）` }}</h4>
    <p class="evidence-facts">{{ provenance.notice }}</p>
    <p v-if="provenance.sourceLinked" class="evidence-facts">{{ evidence.facts }}</p>
    <dl v-if="provenance.sourceLinked">
      <div><dt>时间基线</dt><dd>{{ evidence.provenance.timeBasis }}</dd></div>
      <div><dt>方法 / 模型记录</dt><dd>{{ evidence.provenance.method }}</dd></div>
    </dl>
    <a v-for="source in provenance.sources" :key="source.url" :href="source.url" target="_blank" rel="noopener noreferrer" class="evidence-action-link">
      核对来源：{{ source.title }} ↗
    </a>
    <router-link v-if="evidence?.route" :to="evidence.route" class="evidence-action-link">前往教学探究（不是原始观测来源） ↗</router-link>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { describeEvidence } from '../evidenceCatalog.js'

const props = defineProps({
  evidence: { type: Object, default: null },
  evidenceId: { type: String, required: true }
})
const provenance = computed(() => describeEvidence(props.evidence))
</script>

<style scoped>
.evidence-header {
  flex-wrap: wrap;
  gap: 8px;
}

.evidence-action-link {
  display: block;
  margin-top: 8px;
}

dl {
  font-size: 13px;
}

dd {
  margin: 4px 0 10px;
}
</style>
