<script setup>
import { computed } from 'vue'
import { normalizeStudentLearning } from '../utils/studentLearningSchema.js'
import LearningSection from './LearningSection.vue'
import MechanismChain from './MechanismChain.vue'
import PracticePanel from './PracticePanel.vue'

const props = defineProps({
  learning: { type: Object, default: null },
  sectionTitle: { type: String, default: '' },
  chapterTitle: { type: String, default: '' },
  tools: { type: Array, default: () => [] },
})

const emit = defineEmits(['open-tool'])
const lesson = computed(() => normalizeStudentLearning(props.learning))
</script>

<template>
  <main v-if="lesson" data-student-learning-view>
    <header>
      <p>{{ chapterTitle }} / {{ sectionTitle }}</p>
      <p>约 {{ lesson.estimatedMinutes }} 分钟</p>
      <div>
        <h2>学习目标</h2>
        <ul><li v-for="objective in lesson.objectives" :key="objective">{{ objective }}</li></ul>
      </div>
      <div>
        <h2>重点</h2>
        <ul><li v-for="focus in lesson.keyFocus" :key="focus">{{ focus }}</li></ul>
      </div>
      <div>
        <h2>难点</h2>
        <ul><li v-for="difficulty in lesson.difficulties" :key="difficulty">{{ difficulty }}</li></ul>
      </div>
    </header>

    <section aria-label="本节速览">
      <h2>本节速览</h2>
      <p>{{ lesson.overview }}</p>
    </section>

    <nav aria-label="学习工具">
      <button
        v-for="tool in tools"
        :key="tool.id"
        type="button"
        :data-tool="tool.id"
        :class="{ primary: tool.primary }"
        @click="emit('open-tool', tool.id)"
      >
        {{ tool.label }}
      </button>
    </nav>

    <LearningSection v-if="lesson.knowledgeBlocks.length" id="core-knowledge" title="核心知识" default-open>
      <article v-for="block in lesson.knowledgeBlocks" :key="block.title">
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

    <LearningSection v-if="lesson.mechanismChains.length" id="mechanisms" title="机制链">
      <MechanismChain :chains="lesson.mechanismChains" />
    </LearningSection>

    <LearningSection v-if="lesson.caseStudies.length" id="cases" title="典型案例">
      <article v-for="caseStudy in lesson.caseStudies" :key="caseStudy.title">
        <h3>{{ caseStudy.title }}</h3>
        <p>情境：{{ caseStudy.context }}</p>
        <p>思考：{{ caseStudy.question }}</p>
        <p>结论：{{ caseStudy.conclusion }}</p>
      </article>
    </LearningSection>

    <LearningSection v-if="lesson.misconceptions.length" id="misconceptions" title="易错辨析">
      <article v-for="item in lesson.misconceptions" :key="item.wrong">
        <p>错误认识：{{ item.wrong }}</p>
        <p>为什么错：{{ item.reason }}</p>
        <p>正确表述：{{ item.correct }}</p>
      </article>
    </LearningSection>

    <LearningSection v-if="lesson.practice.length" id="practice" title="练习">
      <PracticePanel :questions="lesson.practice" />
    </LearningSection>

    <LearningSection v-if="lesson.memoryTips.length" id="memory" title="记忆要点">
      <ul><li v-for="tip in lesson.memoryTips" :key="tip">{{ tip }}</li></ul>
    </LearningSection>

    <LearningSection v-if="lesson.answerTemplates.length" id="answer-templates" title="答题模板">
      <article v-for="template in lesson.answerTemplates" :key="template.title">
        <h3>{{ template.title }}</h3>
        <p>{{ template.template }}</p>
      </article>
    </LearningSection>
  </main>
</template>
