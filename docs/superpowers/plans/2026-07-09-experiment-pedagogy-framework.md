# Experiment Pedagogy Framework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a shared teaching guide framework for all geoscience experiments so each experiment can show objectives, inquiry questions, observation tasks, explanations, and quiz feedback.

**Architecture:** Store experiment teaching data in the existing experiment registry under a new `pedagogy` field. Render it through a focused `ExperimentGuidePanel.vue` component, then mount that panel from `ExperimentView.vue` for both 3D and tutorial experiments.

**Tech Stack:** Vue 3, Vite, Vitest, `@vue/test-utils`, existing scoped CSS.

## Global Constraints

- Do not add account systems, grades, cloud sync, or persistent learning records.
- Do not rewrite existing 3D experiment physics or rendering internals.
- Do not replace `TutorialTemplate`; the new guide panel must coexist with it.
- If an experiment has no `pedagogy`, the experiment page must still render normally.
- If quiz data is malformed, skip that quiz item instead of throwing.
- Use component-local state only for quiz selections.
- Keep UI copy in Chinese because the existing product language is Chinese.

---

## File Structure

- Create `src/experiments/components/ExperimentGuidePanel.vue`: renders all teaching guide sections and owns quiz selection state.
- Create `src/experiments/components/ExperimentGuidePanel.test.js`: unit tests guide rendering, quiz feedback, and malformed data handling.
- Modify `src/experiments/ExperimentView.vue`: pass `exp.pedagogy` into the new guide panel and position it before knowledge tags.
- Create or modify `src/experiments/ExperimentView.test.js`: verify the view renders the guide for both 3D and tutorial experiment metadata without breaking existing sections.
- Modify `src/experiments/modules/index.js`: add `pedagogy` data for all 18 experiments.
- Optionally add `src/experiments/modules/pedagogy.test.js`: registry coverage checks that every experiment has minimum guide content and valid quiz answers.

---

### Task 1: Build `ExperimentGuidePanel` With Tests

**Files:**
- Create: `src/experiments/components/ExperimentGuidePanel.vue`
- Create: `src/experiments/components/ExperimentGuidePanel.test.js`

**Interfaces:**
- Consumes: `pedagogy` prop with shape `{ objectives?: string[], inquiryQuestions?: string[], observationTasks?: Array<{ title: string, prompt: string, hint?: string }>, explanations?: string[], quiz?: Array<{ question: string, options: string[], answer: number, feedback: string }> }`
- Produces: `ExperimentGuidePanel` Vue component with local quiz feedback behavior.

- [ ] **Step 1: Write failing tests for full guide rendering**

Create `src/experiments/components/ExperimentGuidePanel.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ExperimentGuidePanel from './ExperimentGuidePanel.vue'

const fullPedagogy = {
  objectives: ['解释流水侵蚀和沉积的关系'],
  inquiryQuestions: ['为什么弯道外侧更容易被侵蚀？'],
  observationTasks: [
    {
      title: '观察弯道侵蚀',
      prompt: '提高流速，记录河道外侧的变化。',
      hint: '重点看水流速度更快的位置。'
    }
  ],
  explanations: ['流速越大，河流侵蚀和搬运能力越强。'],
  quiz: [
    {
      question: '流速降低时通常最先沉积什么？',
      options: ['较粗颗粒', '溶解物质', '水汽'],
      answer: 0,
      feedback: '较粗颗粒需要更高流速维持搬运，因此会更早沉积。'
    }
  ]
}

describe('ExperimentGuidePanel', () => {
  it('renders the teaching guide sections', () => {
    const wrapper = mount(ExperimentGuidePanel, {
      props: { pedagogy: fullPedagogy }
    })

    expect(wrapper.text()).toContain('学习目标')
    expect(wrapper.text()).toContain('解释流水侵蚀和沉积的关系')
    expect(wrapper.text()).toContain('探究问题')
    expect(wrapper.text()).toContain('为什么弯道外侧更容易被侵蚀？')
    expect(wrapper.text()).toContain('观察任务')
    expect(wrapper.text()).toContain('观察弯道侵蚀')
    expect(wrapper.text()).toContain('机制解释')
    expect(wrapper.text()).toContain('流速越大，河流侵蚀和搬运能力越强。')
    expect(wrapper.text()).toContain('随堂小测')
    expect(wrapper.text()).toContain('流速降低时通常最先沉积什么？')
  })
})
```

- [ ] **Step 2: Write failing tests for quiz feedback and malformed data**

Append these tests in the same file:

```js
it('shows correct feedback after selecting the right quiz option', async () => {
  const wrapper = mount(ExperimentGuidePanel, {
    props: { pedagogy: fullPedagogy }
  })

  await wrapper.find('button[data-testid="quiz-option-0-0"]').trigger('click')

  expect(wrapper.text()).toContain('回答正确')
  expect(wrapper.text()).toContain('较粗颗粒需要更高流速维持搬运')
})

it('shows explanatory feedback after selecting a wrong quiz option', async () => {
  const wrapper = mount(ExperimentGuidePanel, {
    props: { pedagogy: fullPedagogy }
  })

  await wrapper.find('button[data-testid="quiz-option-0-1"]').trigger('click')

  expect(wrapper.text()).toContain('再想一想')
  expect(wrapper.text()).toContain('较粗颗粒需要更高流速维持搬运')
})

it('does not render malformed quiz items', () => {
  const wrapper = mount(ExperimentGuidePanel, {
    props: {
      pedagogy: {
        quiz: [
          { question: '缺少选项', options: [], answer: 0, feedback: '不会显示' },
          { question: '答案越界', options: ['A'], answer: 3, feedback: '不会显示' }
        ]
      }
    }
  })

  expect(wrapper.text()).not.toContain('缺少选项')
  expect(wrapper.text()).not.toContain('答案越界')
  expect(wrapper.find('.experiment-guide').exists()).toBe(false)
})
```

- [ ] **Step 3: Run tests and verify they fail**

Run:

```bash
pnpm exec vitest run src/experiments/components/ExperimentGuidePanel.test.js
```

Expected: fail because `ExperimentGuidePanel.vue` does not exist.

- [ ] **Step 4: Implement `ExperimentGuidePanel.vue`**

Create `src/experiments/components/ExperimentGuidePanel.vue`:

```vue
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
  return Array.isArray(value) ? value.filter(item => typeof item === 'string' && item.trim()) : []
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
  margin: 28px 0;
}

.guide-section {
  border: 1px solid var(--brown-light);
  border-radius: var(--radius-card);
  background: var(--card-bg);
  padding: 16px;
}

.guide-section h3 {
  margin: 0 0 10px;
  font-size: 15px;
  color: var(--ink);
}

.guide-section ol,
.guide-section ul {
  margin: 0;
  padding-left: 20px;
}

.guide-section li,
.guide-section p {
  font-size: 14px;
  line-height: 1.7;
  color: var(--ink);
}

.observation-task {
  display: grid;
  gap: 6px;
}

.observation-task p {
  margin: 0;
}

.observation-task span {
  font-size: 13px;
  color: var(--muted);
}

.quiz-item {
  display: grid;
  gap: 10px;
}

.quiz-question {
  margin: 0;
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
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  padding: 7px 12px;
}

.quiz-option.correct {
  border-color: var(--button-green-deep);
  background: var(--button-green);
}

.quiz-option.incorrect {
  border-color: var(--red);
  background: rgba(158, 36, 38, 0.08);
}

.quiz-feedback {
  margin: 0;
  color: var(--red);
}

@media (max-width: 640px) {
  .guide-section {
    padding: 14px;
  }

  .quiz-options {
    flex-direction: column;
  }
}
</style>
```

- [ ] **Step 5: Run tests and commit**

Run:

```bash
pnpm exec vitest run src/experiments/components/ExperimentGuidePanel.test.js
```

Expected: PASS.

Commit:

```bash
git add src/experiments/components/ExperimentGuidePanel.vue src/experiments/components/ExperimentGuidePanel.test.js
git commit -m "feat: add experiment guide panel"
```

---

### Task 2: Add Pedagogy Registry Data and Validation Tests

**Files:**
- Modify: `src/experiments/modules/index.js`
- Create: `src/experiments/modules/pedagogy.test.js`

**Interfaces:**
- Consumes: `pedagogy` shape produced in Task 1.
- Produces: every experiment module entry contains valid `pedagogy` content.

- [ ] **Step 1: Write registry validation tests**

Create `src/experiments/modules/pedagogy.test.js`:

```js
import { describe, expect, it } from 'vitest'
import modules from './index.js'

describe('experiment pedagogy metadata', () => {
  it('provides minimum teaching guide content for every experiment', () => {
    for (const exp of modules) {
      expect(exp.pedagogy, exp.id).toBeTruthy()
      expect(exp.pedagogy.objectives?.length, exp.id).toBeGreaterThanOrEqual(1)
      expect(exp.pedagogy.inquiryQuestions?.length, exp.id).toBeGreaterThanOrEqual(1)
      expect(exp.pedagogy.observationTasks?.length, exp.id).toBeGreaterThanOrEqual(1)
      expect(exp.pedagogy.explanations?.length, exp.id).toBeGreaterThanOrEqual(1)
      expect(exp.pedagogy.quiz?.length, exp.id).toBeGreaterThanOrEqual(1)
    }
  })

  it('uses valid quiz answer indexes', () => {
    for (const exp of modules) {
      for (const quiz of exp.pedagogy.quiz) {
        expect(quiz.options.length, `${exp.id}: ${quiz.question}`).toBeGreaterThan(0)
        expect(quiz.answer, `${exp.id}: ${quiz.question}`).toBeGreaterThanOrEqual(0)
        expect(quiz.answer, `${exp.id}: ${quiz.question}`).toBeLessThan(quiz.options.length)
        expect(quiz.feedback, `${exp.id}: ${quiz.question}`).toBeTruthy()
      }
    }
  })
})
```

- [ ] **Step 2: Run tests and verify they fail**

Run:

```bash
pnpm exec vitest run src/experiments/modules/pedagogy.test.js
```

Expected: fail because existing experiments do not have `pedagogy`.

- [ ] **Step 3: Add `pedagogy` to each experiment**

Modify every object in `src/experiments/modules/index.js`. Use concise Chinese data like:

```js
pedagogy: {
  objectives: ['说明热力差异如何形成近地面气压差并驱动空气运动。'],
  inquiryQuestions: ['为什么海陆受热差异会让风向在昼夜之间发生变化？'],
  observationTasks: [
    {
      title: '追踪空气环流方向',
      prompt: '观察热源上方空气上升、冷源上方空气下沉以及近地面补偿流动。',
      hint: '把视线放在冷热源之间的闭合环流。'
    }
  ],
  explanations: ['受热空气膨胀上升，近地面气压降低；冷却空气下沉，近地面气压升高，气压差推动空气水平运动。'],
  quiz: [
    {
      question: '热力环流形成的直接动力是什么？',
      options: ['冷热不均造成的气压差', '地球公转速度变化', '月球引潮力'],
      answer: 0,
      feedback: '冷热不均会造成垂直运动和近地面气压差，气压梯度力驱动空气流动。'
    }
  ]
}
```

Repeat the same shape for all 18 IDs currently registered in the file: `thermal-circulation`, `coriolis`, `cloud-bottle`, `weather-instruments`, `stream-table`, `groundwater`, `infiltration`, `water-cycle`, `sediment-transport`, `fault-model`, `stratigraphy`, `mineral-id`, `potato-core`, `soil-erosion`, `moon-phases`, `seasons`, `kepler-laws`, `solar-motion`, `eclipse`.

- [ ] **Step 4: Run registry tests and commit**

Run:

```bash
pnpm exec vitest run src/experiments/modules/pedagogy.test.js
```

Expected: PASS.

Commit:

```bash
git add src/experiments/modules/index.js src/experiments/modules/pedagogy.test.js
git commit -m "feat: add experiment pedagogy metadata"
```

---

### Task 3: Render the Guide From `ExperimentView`

**Files:**
- Modify: `src/experiments/ExperimentView.vue`
- Create: `src/experiments/ExperimentView.test.js`

**Interfaces:**
- Consumes: `ExperimentGuidePanel` from Task 1 and `exp.pedagogy` from Task 2.
- Produces: experiment pages show the guide panel before concept tags for both `3d` and `tutorial` experiments.

- [ ] **Step 1: Write integration tests**

Create `src/experiments/ExperimentView.test.js`:

```js
import { describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'
import ExperimentView from './ExperimentView.vue'

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: {
      category: 'meteorology',
      experiment: 'thermal-circulation'
    }
  })
}))

vi.mock('./modules/index.js', () => ({
  default: [
    {
      id: 'thermal-circulation',
      name: '热力环流模拟实验',
      category: 'meteorology',
      type: '3d',
      concepts: ['热力环流'],
      pedagogy: {
        objectives: ['解释热力环流的形成过程'],
        inquiryQuestions: ['冷热不均为什么会产生空气运动？'],
        observationTasks: [{ title: '观察上升气流', prompt: '找出热源上方空气运动方向。' }],
        explanations: ['冷热不均导致气压差。'],
        quiz: [{ question: '热力环流的动力是什么？', options: ['气压差'], answer: 0, feedback: '气压差驱动空气运动。' }]
      },
      component: () => Promise.resolve({ default: defineComponent({ template: '<div data-testid="mock-3d">3D</div>' }) })
    }
  ],
  categoryLabels: { meteorology: '气象学实验' },
  getRelatedExperiments: () => []
}))

describe('ExperimentView', () => {
  it('renders the teaching guide for an experiment', async () => {
    const wrapper = mount(ExperimentView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' }
        }
      }
    })

    await flushPromises()

    expect(wrapper.text()).toContain('热力环流模拟实验')
    expect(wrapper.text()).toContain('解释热力环流的形成过程')
    expect(wrapper.text()).toContain('热力环流的动力是什么？')
    expect(wrapper.text()).toContain('涉及知识点')
  })
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
pnpm exec vitest run src/experiments/ExperimentView.test.js
```

Expected: fail because `ExperimentView` does not render `ExperimentGuidePanel`.

- [ ] **Step 3: Modify `ExperimentView.vue`**

Add import:

```js
import ExperimentGuidePanel from './components/ExperimentGuidePanel.vue'
```

Add this block after the 3D/tutorial rendering and before `ev-concepts`:

```vue
<ExperimentGuidePanel :pedagogy="exp?.pedagogy" />
```

The relevant template order should become:

```vue
<component :is="expComponent" v-if="expComponent && exp?.type === '3d'" />

<TutorialTemplate v-if="exp?.type === 'tutorial' && tutorialSteps.length" :steps="tutorialSteps" />

<ExperimentGuidePanel :pedagogy="exp?.pedagogy" />

<section class="ev-concepts" v-if="exp?.concepts?.length">
```

- [ ] **Step 4: Run integration test and component tests**

Run:

```bash
pnpm exec vitest run src/experiments/ExperimentView.test.js src/experiments/components/ExperimentGuidePanel.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit**

Commit:

```bash
git add src/experiments/ExperimentView.vue src/experiments/ExperimentView.test.js
git commit -m "feat: show teaching guides on experiment pages"
```

---

### Task 4: Full Verification and Browser Smoke Test

**Files:**
- No code files unless verification reveals a bug.

**Interfaces:**
- Consumes: completed Tasks 1-3.
- Produces: passing test/build evidence and manual browser confidence.

- [ ] **Step 1: Run all tests**

Run:

```bash
pnpm test
```

Expected: all test files pass.

- [ ] **Step 2: Run production build**

Run:

```bash
pnpm run build
```

Expected: build completes. A Vite large chunk warning is acceptable because it already exists in this project.

- [ ] **Step 3: Start preview server if needed**

If no preview server is running:

```bash
pnpm preview --host 127.0.0.1 --port 4173
```

Expected: Vite preview serves `http://127.0.0.1:4173/`.

- [ ] **Step 4: Browser smoke check a 3D experiment**

Open:

```text
http://127.0.0.1:4173/#/experiments/meteorology/thermal-circulation
```

Verify:

- The experiment title renders.
- The 3D experiment content still appears.
- The guide panel shows `学习目标`, `探究问题`, `观察任务`, `机制解释`, and `随堂小测`.
- Clicking a quiz option shows feedback.

- [ ] **Step 5: Browser smoke check a tutorial experiment**

Open:

```text
http://127.0.0.1:4173/#/experiments/hydrology/water-cycle
```

Verify:

- The tutorial step UI still appears.
- The guide panel appears below the tutorial.
- Knowledge tags and related experiments still appear below the guide.

- [ ] **Step 6: Commit verification fixes only if needed**

If any verification bug required code edits:

```bash
git add <changed-files>
git commit -m "fix: stabilize experiment pedagogy guide"
```

If no edits were needed, do not create an empty commit.

---

## Self-Review Notes

- Spec coverage: the plan covers structured `pedagogy`, a public guide panel, ExperimentView integration, all-experiment content, malformed quiz skipping, local quiz state, and test/build/browser verification.
- Scope: this stays inside the experiment module and does not introduce persistence, account features, or 3D physics rewrites.
- Type consistency: the same `pedagogy` field names are used in the registry, guide component, and tests.
