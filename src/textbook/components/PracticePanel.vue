<script setup>
import { reactive } from 'vue'

defineProps({
  questions: { type: Array, default: () => [] },
})

const selected = reactive({})
const revealed = reactive({})
const toggleAnswer = (index) => { revealed[index] = !revealed[index] }

const optionValue = (option) => option.split('.')[0].trim()
</script>

<template>
  <section>
    <article v-for="(item, index) in questions" :key="index">
      <h3>第{{ index + 1 }}题</h3>
      <p>{{ item.question }}</p>

      <fieldset v-if="item.type === 'single-choice'">
        <legend>请选择答案</legend>
        <label v-for="option in item.options" :key="option">
          <input
            v-model="selected[index]"
            type="radio"
            :name="`question-${index}`"
            :value="optionValue(option)"
          >
          {{ option }}
        </label>
      </fieldset>
      <label v-else>
        你的作答
        <textarea v-model="selected[index]" />
      </label>

      <button type="button" data-reveal-answer @click="toggleAnswer(index)">
        {{ revealed[index] ? '隐藏答案' : '查看答案' }}
      </button>

      <div v-if="revealed[index]">
        <p v-if="item.type === 'single-choice'">正确答案：{{ item.answer }}</p>
        <p v-else>参考答案：{{ item.answer }}</p>
        <p v-if="item.type === 'single-choice'">你的选择：{{ selected[index] || '未选择' }}</p>
        <p>解析：{{ item.explanation }}</p>
        <p>对应知识点：{{ item.knowledgePoint }}</p>
      </div>
    </article>
  </section>
</template>
