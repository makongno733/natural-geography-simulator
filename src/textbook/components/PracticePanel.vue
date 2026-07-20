<script setup>
import { reactive } from 'vue'

defineProps({
  questions: { type: Array, default: () => [] },
})

const selected = reactive({})
const revealed = reactive({})
const toggleAnswer = (index) => { revealed[index] = !revealed[index] }

const optionValue = (option) => option.split('.')[0].trim()
const answerState = (item, index) => {
  if (item.type !== 'single-choice') return 'is-reference'
  if (!selected[index]) return 'is-unanswered'
  return selected[index] === item.answer ? 'is-correct' : 'is-incorrect'
}
const answerStatus = (item, index) => {
  if (item.type !== 'single-choice') return '参考答案'
  if (!selected[index]) return '尚未作答'
  return selected[index] === item.answer ? '回答正确' : '回答有误'
}
</script>

<template>
  <section class="practice-panel">
    <article v-for="(item, index) in questions" :key="index" class="practice-question">
      <h3>第{{ index + 1 }}题</h3>
      <p class="practice-question__prompt">{{ item.question }}</p>

      <fieldset v-if="item.type === 'single-choice'" class="practice-options">
        <legend>请选择答案</legend>
        <label
          v-for="(option, optionIndex) in item.options"
          :key="option"
          :for="`practice-${index}-option-${optionIndex}`"
        >
          <input
            :id="`practice-${index}-option-${optionIndex}`"
            v-model="selected[index]"
            type="radio"
            :name="`question-${index}`"
            :value="optionValue(option)"
          >
          {{ option }}
        </label>
      </fieldset>
      <label v-else :for="`practice-${index}-response`" class="practice-response-label">
        你的作答
        <textarea :id="`practice-${index}-response`" v-model="selected[index]" />
      </label>

      <p v-if="item.type !== 'single-choice' && item.hint" class="practice-hint">
        提示：{{ item.hint }}
      </p>

      <button
        class="practice-answer-toggle"
        type="button"
        data-reveal-answer
        :aria-controls="`practice-answer-${index}`"
        :aria-expanded="Boolean(revealed[index])"
        @click="toggleAnswer(index)"
      >
        {{ revealed[index] ? '隐藏答案与解析' : '查看答案与解析' }}
      </button>

      <div
        v-show="revealed[index]"
        :id="`practice-answer-${index}`"
        class="answer-feedback"
        :class="answerState(item, index)"
        role="status"
      >
        <p class="answer-status">{{ answerStatus(item, index) }}</p>
        <p v-if="item.type === 'single-choice'">正确答案：{{ item.answer }}</p>
        <p v-else>参考答案：{{ item.answer }}</p>
        <p v-if="item.type === 'single-choice'">你的选择：{{ selected[index] || '未选择' }}</p>
        <p>解析：{{ item.explanation }}</p>
        <p>对应知识点：{{ item.knowledgePoint }}</p>
      </div>
    </article>
  </section>
</template>

<style scoped>
.practice-question + .practice-question {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--brown-light);
}

.practice-question h3,
.practice-question__prompt {
  margin-top: 0;
}

.practice-options {
  display: grid;
  gap: 8px;
  margin: 0 0 12px;
  border: 1px solid var(--brown-light);
  border-radius: var(--radius-card);
  padding: 12px;
}

.practice-options label {
  display: flex;
  min-height: 40px;
  align-items: center;
  gap: 8px;
  border-radius: var(--radius-sm);
  padding: 6px 10px;
  background: var(--paper);
  cursor: pointer;
}

.practice-options input {
  accent-color: var(--red);
}

.practice-response-label {
  display: grid;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 700;
}

.practice-response-label textarea {
  min-height: 96px;
  resize: vertical;
  border: 1px solid var(--brown);
  border-radius: var(--radius-card);
  padding: 10px;
  color: var(--ink);
  background: var(--card-bg);
  font: inherit;
  font-weight: 400;
}

.practice-answer-toggle {
  min-height: 40px;
  border: 1px solid var(--button-green-deep);
  border-radius: var(--radius-sm);
  padding: 8px 14px;
  color: var(--button-green-ink);
  background: var(--button-green);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.practice-hint {
  margin: 0 0 12px;
  color: var(--muted);
}

.practice-answer-toggle:hover {
  background: var(--button-green-strong);
}

.practice-answer-toggle:focus-visible {
  outline: 2px solid var(--red);
  outline-offset: 2px;
}

.answer-feedback {
  margin-top: 12px;
  border: 1px solid var(--brown);
  border-left-width: 4px;
  border-radius: var(--radius-card);
  padding: 12px 14px;
  background: var(--card-bg);
}

.answer-feedback.is-correct {
  border-left-color: var(--button-green-deep);
}

.answer-feedback.is-incorrect,
.answer-feedback.is-unanswered {
  border-left-color: var(--red);
}

.answer-feedback p {
  margin: 6px 0;
}

.answer-status {
  color: var(--ink);
  font-weight: 700;
}
</style>
