<template>
  <section v-if="hasContent" class="experiment-guide" aria-label="实验教学引导">
    <div v-if="objectives.length" class="guide-section">
      <h3>学习目标</h3>
      <ol>
        <li v-for="item in objectives" :key="item">{{ item }}</li>
      </ol>
    </div>

    <div v-if="inquiryQuestions.length" class="guide-section">
      <h3>探究问题</h3>
      <ul>
        <li v-for="item in inquiryQuestions" :key="item">{{ item }}</li>
      </ul>
    </div>

    <div v-if="observationTasks.length" class="guide-section">
      <h3>观察任务</h3>
      <div v-for="task in observationTasks" :key="task.title" class="observation-task">
        <strong>{{ task.title }}</strong>
        <p>{{ task.prompt }}</p>
        <span v-if="task.hint">提示：{{ task.hint }}</span>
      </div>
    </div>

    <div v-if="explanations.length" class="guide-section">
      <h3>机制解释</h3>
      <p v-for="item in explanations" :key="item">{{ item }}</p>
    </div>

    <div v-if="validQuiz.length" class="guide-section">
      <h3>随堂小测</h3>
      <div v-for="(item, quizIndex) in validQuiz" :key="item.question" class="quiz-item">
        <p class="quiz-question">{{ item.question }}</p>
        <div class="quiz-options">
          <button
            v-for="(option, optionIndex) in item.options"
            :key="option"
            type="button"
            :class="['quiz-option', optionClass(quizIndex, optionIndex, item.answer)]"
            :data-testid="`quiz-option-${quizIndex}-${optionIndex}`"
            @click="selectOption(quizIndex, optionIndex)"
          >
            {{ option }}
          </button>
        </div>
        <p v-if="selectedAnswers[quizIndex] !== undefined" class="quiz-feedback">
          <strong>{{ selectedAnswers[quizIndex] === item.answer ? '回答正确' : '再想一想' }}：</strong>
          {{ item.feedback }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive } from 'vue'

const props = defineProps({
  pedagogy: {
    type: Object,
    default: null
  }
})

const selectedAnswers = reactive({})

const objectives = computed(() => cleanStrings(props.pedagogy?.objectives))
const inquiryQuestions = computed(() => cleanStrings(props.pedagogy?.inquiryQuestions))
const explanations = computed(() => cleanStrings(props.pedagogy?.explanations))
const observationTasks = computed(() =>
  Array.isArray(props.pedagogy?.observationTasks)
    ? props.pedagogy.observationTasks.filter(task => task?.title && task?.prompt)
    : []
)
const validQuiz = computed(() =>
  Array.isArray(props.pedagogy?.quiz)
    ? props.pedagogy.quiz.filter(item =>
        item?.question &&
        Array.isArray(item.options) &&
        item.options.length > 0 &&
        Number.isInteger(item.answer) &&
        item.answer >= 0 &&
        item.answer < item.options.length &&
        item.feedback
      )
    : []
)
const hasContent = computed(() =>
  objectives.value.length ||
  inquiryQuestions.value.length ||
  observationTasks.value.length ||
  explanations.value.length ||
  validQuiz.value.length
)

function cleanStrings(value) {
  return Array.isArray(value)
    ? value.filter(item => typeof item === 'string' && item.trim())
    : []
}

function selectOption(quizIndex, optionIndex) {
  selectedAnswers[quizIndex] = optionIndex
}

function optionClass(quizIndex, optionIndex, answer) {
  if (selectedAnswers[quizIndex] === undefined) return ''
  if (optionIndex === answer) return 'correct'
  if (selectedAnswers[quizIndex] === optionIndex) return 'incorrect'
  return ''
}
</script>

<style scoped>
.experiment-guide {
  display: grid;
  gap: 14px;
  margin-top: 20px;
  padding: 18px;
  border: 1px solid var(--brown-light);
  border-radius: var(--radius-box);
  background: rgba(255, 255, 255, 0.74);
}

.guide-section {
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(120, 88, 62, 0.18);
}

.guide-section:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.guide-section h3 {
  margin: 0 0 10px;
  font-size: 16px;
  color: var(--ink);
}

.guide-section ol,
.guide-section ul {
  margin: 0;
  padding-left: 20px;
  color: var(--ink);
}

.guide-section li + li {
  margin-top: 6px;
}

.guide-section p {
  margin: 0;
  color: var(--ink);
  line-height: 1.7;
}

.guide-section p + p {
  margin-top: 8px;
}

.observation-task {
  display: grid;
  gap: 6px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  background: rgba(245, 232, 214, 0.42);
}

.observation-task strong {
  font-size: 14px;
  color: var(--ink);
}

.observation-task span {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.6;
}

.quiz-item + .quiz-item {
  margin-top: 14px;
}

.quiz-question {
  margin: 0 0 10px;
  font-weight: 600;
}

.quiz-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quiz-option {
  border: 1px solid var(--brown);
  border-radius: var(--radius-sm);
  background: var(--paper);
  color: var(--ink);
  padding: 8px 12px;
  font: inherit;
  font-size: 14px;
  cursor: pointer;
  transition: background var(--transition), border-color var(--transition), color var(--transition);
}

.quiz-option:hover {
  background: var(--cream);
}

.quiz-option.correct {
  border-color: var(--button-green-deep);
  background: var(--button-green-strong);
  color: var(--button-green-ink);
}

.quiz-option.incorrect {
  border-color: var(--red);
  background: rgba(158, 36, 38, 0.1);
  color: var(--red);
}

.quiz-feedback {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: rgba(245, 232, 214, 0.42);
  color: var(--ink);
}

@media (max-width: 640px) {
  .experiment-guide {
    padding: 16px;
  }

  .guide-section h3 {
    font-size: 15px;
  }

  .quiz-option {
    width: 100%;
    text-align: left;
  }
}
</style>
