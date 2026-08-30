<script setup>
import { computed, reactive, watch } from 'vue'
import { normalizeStudentLearning } from '../utils/studentLearningSchema.js'
import LearningSection from './LearningSection.vue'
import MechanismChain from './MechanismChain.vue'
import PracticePanel from './PracticePanel.vue'

const props = defineProps({
  learning: { type: Object, default: null },
  sectionTitle: { type: String, default: '' },
  chapterTitle: { type: String, default: '' },
  localTools: { type: Array, default: () => [] },
})

const emit = defineEmits(['open-tool'])
const lesson = computed(() => normalizeStudentLearning(props.learning))
const sectionOpen = reactive({})
const detailSectionIds = computed(() => {
  if (!lesson.value) return []
  return [
    lesson.value.mechanismChains.length && 'mechanisms',
    lesson.value.caseStudies.length && 'cases',
    lesson.value.misconceptions.length && 'misconceptions',
    lesson.value.practice.length && 'practice',
    lesson.value.memoryTips.length && 'memory',
    lesson.value.answerTemplates.length && 'answer-templates',
  ].filter(Boolean)
})

watch(lesson, () => {
  Object.keys(sectionOpen).forEach((id) => delete sectionOpen[id])
  if (lesson.value?.knowledgeBlocks.length) sectionOpen['core-knowledge'] = true
  detailSectionIds.value.forEach((id) => { sectionOpen[id] = false })
}, { immediate: true })

const setAllSections = (open) => {
  Object.keys(sectionOpen).forEach((id) => { sectionOpen[id] = open })
}
</script>

<template>
  <article v-if="lesson" class="student-learning-view" data-student-learning-view>
    <header class="learning-header">
      <p class="learning-path">{{ chapterTitle }} / {{ sectionTitle }}</p>
      <p class="learning-time">约 {{ lesson.estimatedMinutes }} 分钟</p>
      <div
        v-if="lesson.objectives.length || lesson.keyFocus.length || lesson.difficulties.length"
        class="learning-meta-grid"
      >
        <section v-if="lesson.objectives.length" data-learning-card>
          <h2>学习目标</h2>
          <ul><li v-for="objective in lesson.objectives" :key="objective">{{ objective }}</li></ul>
        </section>
        <section v-if="lesson.keyFocus.length" data-learning-card>
          <h2>重点</h2>
          <ul><li v-for="focus in lesson.keyFocus" :key="focus">{{ focus }}</li></ul>
        </section>
        <section v-if="lesson.difficulties.length" data-learning-card>
          <h2>难点</h2>
          <ul><li v-for="difficulty in lesson.difficulties" :key="difficulty">{{ difficulty }}</li></ul>
        </section>
      </div>
    </header>

    <section v-if="lesson.overview" class="learning-overview" aria-label="本节速览">
      <h2>本节速览</h2>
      <p>{{ lesson.overview }}</p>
    </section>

    <nav v-if="localTools.length" class="learning-tools" aria-label="本地学习工具">
      <button
        v-for="tool in localTools"
        :key="tool.id"
        type="button"
        :data-tool="tool.id"
        :class="{ primary: tool.primary }"
        @click="emit('open-tool', tool.id)"
      >
        {{ tool.label }}
      </button>
    </nav>

    <nav v-if="detailSectionIds.length" class="learning-section-controls" aria-label="课文展开控制">
      <button type="button" data-expand-all @click="setAllSections(true)">全部展开</button>
      <button type="button" data-collapse-all @click="setAllSections(false)">全部收起</button>
    </nav>

    <LearningSection
      v-if="lesson.knowledgeBlocks.length"
      id="core-knowledge"
      title="核心知识"
      :open="sectionOpen['core-knowledge']"
      @update:open="sectionOpen['core-knowledge'] = $event"
    >
      <article v-for="block in lesson.knowledgeBlocks" :key="block.title" class="knowledge-block">
        <h3>{{ block.title }}</h3>
        <p v-if="block.summary">{{ block.summary }}</p>
        <dl>
          <template v-for="item in block.items || []" :key="item.name">
            <dt>{{ item.name }}</dt>
            <dd>{{ item.detail }}</dd>
          </template>
        </dl>
      </article>
    </LearningSection>

    <LearningSection v-if="lesson.mechanismChains.length" id="mechanisms" title="机制链" :open="sectionOpen.mechanisms" @update:open="sectionOpen.mechanisms = $event">
      <MechanismChain :chains="lesson.mechanismChains" />
    </LearningSection>

    <LearningSection v-if="lesson.caseStudies.length" id="cases" title="典型案例" :open="sectionOpen.cases" @update:open="sectionOpen.cases = $event">
      <article v-for="caseStudy in lesson.caseStudies" :key="caseStudy.title" class="detail-card">
        <h3>{{ caseStudy.title }}</h3>
        <p>情境：{{ caseStudy.context }}</p>
        <p>思考：{{ caseStudy.question }}</p>
        <p>结论：{{ caseStudy.conclusion }}</p>
      </article>
    </LearningSection>

    <LearningSection v-if="lesson.misconceptions.length" id="misconceptions" title="易错辨析" :open="sectionOpen.misconceptions" @update:open="sectionOpen.misconceptions = $event">
      <article v-for="item in lesson.misconceptions" :key="item.wrong" class="detail-card">
        <p>错误认识：{{ item.wrong }}</p>
        <p>为什么错：{{ item.reason }}</p>
        <p>正确表述：{{ item.correct }}</p>
      </article>
    </LearningSection>

    <LearningSection v-if="lesson.practice.length" id="practice" title="练习" :open="sectionOpen.practice" @update:open="sectionOpen.practice = $event">
      <PracticePanel :questions="lesson.practice" />
    </LearningSection>

    <LearningSection v-if="lesson.memoryTips.length" id="memory" title="记忆要点" :open="sectionOpen.memory" @update:open="sectionOpen.memory = $event">
      <ul><li v-for="tip in lesson.memoryTips" :key="tip">{{ tip }}</li></ul>
    </LearningSection>

    <LearningSection v-if="lesson.answerTemplates.length" id="answer-templates" title="答题模板" :open="sectionOpen['answer-templates']" @update:open="sectionOpen['answer-templates'] = $event">
      <article v-for="template in lesson.answerTemplates" :key="template.title" class="detail-card">
        <h3>{{ template.title }}</h3>
        <p>{{ template.template }}</p>
      </article>
    </LearningSection>
  </article>
</template>

<style scoped>
.student-learning-view {
  width: 100%;
  max-width: 860px;
  margin: 0 auto;
  color: var(--ink);
  font-size: 15px;
  line-height: 1.8;
}

.learning-header {
  margin-bottom: 16px;
}

.learning-path,
.learning-time {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
}

.learning-time {
  margin-top: 2px;
  color: var(--button-green-deep);
  font-weight: 700;
}

.learning-meta-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

[data-learning-card],
.learning-overview {
  border: 1px solid var(--brown-light);
  border-radius: var(--radius-card);
  padding: 14px;
  background: var(--card-bg);
  box-shadow: var(--shadow-sm);
}

[data-learning-card] h2,
.learning-overview h2 {
  margin: 0 0 8px;
  color: var(--red);
  font-size: 16px;
}

[data-learning-card] ul {
  margin: 0;
  padding-left: 20px;
}

.learning-overview {
  margin-bottom: 14px;
  background: var(--paper);
}

.learning-overview p {
  margin: 0;
}

.learning-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 16px;
}

.learning-tools button {
  min-height: 40px;
  border: 1px solid var(--button-green-deep);
  border-radius: var(--radius-sm);
  padding: 8px 14px;
  color: var(--button-green-ink);
  background: var(--paper);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: background var(--transition), transform var(--transition);
}

.learning-tools button.primary,
.learning-tools button:hover {
  background: var(--button-green);
}

.learning-tools button:hover {
  transform: translateY(-1px);
}

.learning-tools button:focus-visible {
  outline: 2px solid var(--red);
  outline-offset: 2px;
}

.learning-section-controls {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 8px;
}

.learning-section-controls button {
  min-height: 40px;
  border: 1px solid var(--brown);
  border-radius: var(--radius-sm);
  padding: 7px 12px;
  color: var(--button-green-ink);
  background: var(--card-bg);
  font: inherit;
  cursor: pointer;
}

.learning-section-controls button:focus-visible {
  outline: 2px solid var(--red);
  outline-offset: 2px;
}

.knowledge-block + .knowledge-block,
.detail-card + .detail-card {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--brown-light);
}

.knowledge-block h3,
.detail-card h3 {
  margin: 0 0 8px;
  color: var(--red);
  font-size: 16px;
}

.knowledge-block p,
.detail-card p {
  margin: 6px 0;
}

.knowledge-block dl {
  margin: 10px 0 0;
}

.knowledge-block dt {
  color: var(--button-green-ink);
  font-weight: 700;
}

.knowledge-block dd {
  margin: 2px 0 10px;
}

.student-learning-view :deep(ul),
.student-learning-view :deep(ol) {
  line-height: 1.8;
}

@media (max-width: 900px) {
  .learning-meta-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .student-learning-view {
    font-size: 14px;
  }

  .learning-meta-grid {
    grid-template-columns: 1fr;
  }

  .learning-tools {
    display: grid;
    grid-template-columns: 1fr;
  }

  .learning-tools button {
    width: 100%;
  }
}
</style>
