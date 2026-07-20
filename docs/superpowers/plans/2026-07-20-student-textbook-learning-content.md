# 高中地理必修第一册学生自主复习内容整改 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将高中地理必修第一册 1.1—6.4 的教材页面改造成学生可分层阅读、练习和复习的完整学习页面，同时保留现有思维导图、3D 模块及未提交内容改动。

**Architecture:** 新建独立的 `student-learning.json` 内容覆盖层，通过加载器按章节和节次合并为现有 section 的 `studentLearning` 字段，避免直接重写当前处于修改状态的 `content.json`。页面侧把学生学习体验拆分为规范化工具、通用折叠区、机制链、练习面板和总视图组件；`SectionContent.vue` 只负责把数据与既有工具入口传入新视图，并在覆盖层缺失时继续使用原有页面。

**Tech Stack:** Vue 3.5、Vue Router 4、Vite 6、Vitest、Vue Test Utils、jsdom、JSON 内容覆盖层、现有纯 CSS 体系。

## Global Constraints

- 默认用户是学生，默认视图服务课前预习、课后复习、自测和考前回顾。
- 只整改高中地理必修第一册 1.1—6.4；“问题研究”只做兼容，不补造内容。
- 保留 `content.json`、`MindMapViewer.vue`、`package.json` 和锁文件中的既有未提交改动，不回退、不覆盖。
- 使用 `pnpm`，保留现有 Vue、Vite、Electron 架构和中文界面。
- 练习答案默认折叠；交互必须支持键盘，并且不能只用颜色表达正确与错误。
- 首屏只展示学习页头、速览和工具入口；详细模块分层展开。
- 不新增登录、学习进度、收藏、错题本、云端状态或新 3D 模型。
- 内容来源优先级依次为全册总结、现有准确概念定义、1.1 课件审读结果和可确认的原有正文。
- 不展示 OCR 残句、重复教学套话、无答案的空泛检测题和不完整引号。
- 完成前必须运行单元测试、学生内容审计、现有教材审计和生产构建。

---

## File Map

- Modify: `package.json` — 增加测试脚本和测试依赖，不移除现有依赖。
- Modify: `pnpm-lock.yaml` — 由 `pnpm add -D` 更新。
- Create: `vitest.config.mjs` — Vue/jsdom 单元测试配置。
- Create: `src/textbook/utils/studentLearningSchema.js` — 规范化覆盖层数据并提供安全默认值。
- Create: `src/textbook/utils/studentLearningSchema.test.js` — 规范化、空字段和错误字段测试。
- Create: `src/textbook/components/LearningSection.vue` — 通用可折叠学习模块。
- Create: `src/textbook/components/MechanismChain.vue` — 条件—过程—结果—应用链。
- Create: `src/textbook/components/PracticePanel.vue` — 单选题和问答题的作答、答案与解析。
- Create: `src/textbook/components/StudentLearningView.vue` — 学生页面总编排。
- Create: `src/textbook/components/__tests__/LearningSection.test.js` — 折叠与可访问性测试。
- Create: `src/textbook/components/__tests__/MechanismChain.test.js` — 机制步骤顺序测试。
- Create: `src/textbook/components/__tests__/PracticePanel.test.js` — 选择、展开、答案和解析测试。
- Create: `src/textbook/components/__tests__/StudentLearningView.test.js` — 模块显示、空模块隐藏和工具事件测试。
- Create: `src/textbook/data/高中/必修第一册/student-learning.json` — 17 个正文节次的学生学习内容。
- Create: `src/textbook/data/studentLearningLoader.js` — 按册加载覆盖层。
- Create: `src/textbook/data/studentLearningLoader.test.js` — 合并和无覆盖层降级测试。
- Modify: `src/textbook/data/contentLoader.js` — 在不改变原数据的前提下合并 `studentLearning`。
- Modify: `src/textbook/SectionContent.vue` — 接入新视图并保留原有工具和降级页面。
- Create: `scripts/audit-student-learning.mjs` — 检查 17 节覆盖、必填字段、练习解析和噪声文本。
- Create: `scripts/audit-student-learning.test.mjs` — 审计器失败/成功样例测试。
- Modify: `package.json` — 增加 `qa:student-learning` 脚本。

---

### Task 1: 建立测试环境与数据规范化边界

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `vitest.config.mjs`
- Create: `src/textbook/utils/studentLearningSchema.test.js`
- Create: `src/textbook/utils/studentLearningSchema.js`

**Interfaces:**
- Produces: `normalizeStudentLearning(input): NormalizedStudentLearning | null`
- `NormalizedStudentLearning` 固定包含 `estimatedMinutes`、`objectives`、`keyFocus`、`difficulties`、`overview`、`knowledgeBlocks`、`mechanismChains`、`caseStudies`、`misconceptions`、`practice`、`memoryTips`、`answerTemplates`。

- [ ] **Step 1: 安装测试依赖并增加脚本**

Run:

```bash
pnpm add -D vitest @vue/test-utils jsdom
```

在 `package.json` 的 `scripts` 中增加：

```json
"test": "vitest run",
"test:watch": "vitest"
```

创建 `vitest.config.mjs`：

```js
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.js', 'scripts/**/*.test.mjs'],
    clearMocks: true,
  },
})
```

- [ ] **Step 2: 写规范化函数的失败测试**

`src/textbook/utils/studentLearningSchema.test.js`：

```js
import { describe, expect, it } from 'vitest'
import { normalizeStudentLearning } from './studentLearningSchema.js'

describe('normalizeStudentLearning', () => {
  it('returns null when no learning data exists', () => {
    expect(normalizeStudentLearning(null)).toBeNull()
  })

  it('normalizes complete learning data without losing module order', () => {
    const result = normalizeStudentLearning({
      estimatedMinutes: 12,
      objectives: ['解释水循环'],
      keyFocus: ['水循环环节'],
      difficulties: ['人类活动影响'],
      overview: '水在四大圈层之间循环运动。',
      knowledgeBlocks: [{ title: '循环类型', summary: '三类循环', items: [{ name: '海陆间循环', detail: '联系海洋与陆地。' }] }],
      mechanismChains: [{ title: '水循环', steps: ['蒸发', '输送', '降水', '径流'] }],
      caseStudies: [],
      misconceptions: [],
      practice: [{ type: 'single-choice', question: '最重要的循环是？', options: ['A. 海陆间循环'], answer: 'A', explanation: '使陆地水更新。', knowledgePoint: '水循环类型' }],
      memoryTips: ['海陆最重要，海上量最大，陆地量最小。'],
      answerTemplates: [],
    })

    expect(result.estimatedMinutes).toBe(12)
    expect(result.mechanismChains[0].steps).toEqual(['蒸发', '输送', '降水', '径流'])
    expect(result.practice[0].answer).toBe('A')
  })

  it('drops invalid collection entries and supplies safe arrays', () => {
    const result = normalizeStudentLearning({ overview: '有效摘要', objectives: '错误类型', practice: [null, { question: '' }] })
    expect(result.objectives).toEqual([])
    expect(result.practice).toEqual([])
    expect(result.knowledgeBlocks).toEqual([])
  })
})
```

- [ ] **Step 3: 运行测试并确认正确失败**

Run:

```bash
pnpm test -- src/textbook/utils/studentLearningSchema.test.js
```

Expected: FAIL，原因是 `studentLearningSchema.js` 尚不存在。

- [ ] **Step 4: 实现最小规范化函数**

`src/textbook/utils/studentLearningSchema.js`：

```js
const strings = (value) => Array.isArray(value)
  ? value.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim())
  : []

const objects = (value, isValid) => Array.isArray(value)
  ? value.filter((item) => item && typeof item === 'object' && isValid(item))
  : []

export function normalizeStudentLearning(input) {
  if (!input || typeof input !== 'object') return null

  return {
    estimatedMinutes: Number.isFinite(input.estimatedMinutes) ? input.estimatedMinutes : 10,
    objectives: strings(input.objectives),
    keyFocus: strings(input.keyFocus),
    difficulties: strings(input.difficulties),
    overview: typeof input.overview === 'string' ? input.overview.trim() : '',
    knowledgeBlocks: objects(input.knowledgeBlocks, (item) => typeof item.title === 'string' && item.title.trim()),
    mechanismChains: objects(input.mechanismChains, (item) => typeof item.title === 'string' && strings(item.steps).length > 1)
      .map((item) => ({ ...item, steps: strings(item.steps) })),
    caseStudies: objects(input.caseStudies, (item) => typeof item.title === 'string' && item.title.trim()),
    misconceptions: objects(input.misconceptions, (item) => typeof item.wrong === 'string' && typeof item.correct === 'string'),
    practice: objects(input.practice, (item) => typeof item.question === 'string' && item.question.trim() && typeof item.answer === 'string' && item.answer.trim()),
    memoryTips: strings(input.memoryTips),
    answerTemplates: objects(input.answerTemplates, (item) => typeof item.title === 'string' && typeof item.template === 'string'),
  }
}
```

- [ ] **Step 5: 验证测试转绿并提交**

Run:

```bash
pnpm test -- src/textbook/utils/studentLearningSchema.test.js
```

Expected: 3 tests PASS。

Commit only Task 1 files:

```bash
git add package.json pnpm-lock.yaml vitest.config.mjs src/textbook/utils/studentLearningSchema.js src/textbook/utils/studentLearningSchema.test.js
git commit -m "test: add student learning data contract"
```

---

### Task 2: 实现通用折叠区、机制链和练习面板

**Files:**
- Create: `src/textbook/components/LearningSection.vue`
- Create: `src/textbook/components/MechanismChain.vue`
- Create: `src/textbook/components/PracticePanel.vue`
- Create: `src/textbook/components/__tests__/LearningSection.test.js`
- Create: `src/textbook/components/__tests__/MechanismChain.test.js`
- Create: `src/textbook/components/__tests__/PracticePanel.test.js`

**Interfaces:**
- `LearningSection` props: `{ id: String, title: String, defaultOpen: Boolean }`；default slot；暴露 `data-learning-section`。
- `MechanismChain` props: `{ chains: Array }`。
- `PracticePanel` props: `{ questions: Array }`；内部状态按题目索引隔离。

- [ ] **Step 1: 写三个组件的失败测试**

`LearningSection.test.js` 验证默认关闭、点击展开和 `aria-expanded`：

```js
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LearningSection from '../LearningSection.vue'

it('toggles content with an accessible button', async () => {
  const wrapper = mount(LearningSection, { props: { id: 'core', title: '核心知识', defaultOpen: false }, slots: { default: '知识正文' } })
  const button = wrapper.get('button')
  expect(button.attributes('aria-expanded')).toBe('false')
  expect(wrapper.text()).not.toContain('知识正文')
  await button.trigger('click')
  expect(button.attributes('aria-expanded')).toBe('true')
  expect(wrapper.text()).toContain('知识正文')
})
```

`MechanismChain.test.js` 验证步骤顺序和箭头的可访问隐藏：

```js
import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import MechanismChain from '../MechanismChain.vue'

it('renders mechanism steps in source order', () => {
  const wrapper = mount(MechanismChain, { props: { chains: [{ title: '热力环流', steps: ['冷热不均', '垂直运动', '气压差', '水平运动'] }] } })
  expect(wrapper.findAll('[data-chain-step]').map((node) => node.text())).toEqual(['冷热不均', '垂直运动', '气压差', '水平运动'])
  expect(wrapper.find('[data-chain-arrow]').attributes('aria-hidden')).toBe('true')
})
```

`PracticePanel.test.js` 验证单选题和问答题答案默认隐藏：

```js
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PracticePanel from '../PracticePanel.vue'

const questions = [
  { type: 'single-choice', question: '地面直接加热谁？', options: ['A. 大气', 'B. 太阳'], answer: 'A', explanation: '地面长波辐射是近地面大气主要直接热源。', knowledgePoint: '大气受热过程' },
  { type: 'short-answer', question: '说明热力环流过程。', answer: '冷热不均导致大气垂直和水平运动。', explanation: '按四步因果链作答。', knowledgePoint: '热力环流' },
]

describe('PracticePanel', () => {
  it('keeps answers hidden until requested and preserves the learner choice', async () => {
    const wrapper = mount(PracticePanel, { props: { questions } })
    expect(wrapper.text()).not.toContain('地面长波辐射')
    await wrapper.get('input[value="A"]').setValue(true)
    await wrapper.findAll('[data-reveal-answer]')[0].trigger('click')
    expect(wrapper.text()).toContain('正确答案：A')
    expect(wrapper.text()).toContain('地面长波辐射')
    expect(wrapper.get('input[value="A"]').element.checked).toBe(true)
  })

  it('reveals a short-answer reference independently', async () => {
    const wrapper = mount(PracticePanel, { props: { questions } })
    await wrapper.findAll('[data-reveal-answer]')[1].trigger('click')
    expect(wrapper.text()).toContain('冷热不均导致大气垂直和水平运动')
    expect(wrapper.text()).not.toContain('正确答案：A')
  })
})
```

- [ ] **Step 2: 运行测试并确认组件缺失导致失败**

Run:

```bash
pnpm test -- src/textbook/components/__tests__
```

Expected: FAIL，三个组件无法解析。

- [ ] **Step 3: 实现组件最小行为**

`LearningSection.vue` 使用本地 `open` 状态、原生 `<button>` 和 `aria-controls`；`MechanismChain.vue` 用有序列表展示步骤并在步骤间放置 `aria-hidden="true"` 的文字箭头；`PracticePanel.vue` 使用 `reactive({})` 分别保存每题选择和答案展开状态。所有按钮必须具有可读中文文案，不使用仅图标按钮。

`PracticePanel.vue` 的核心状态代码固定为：

```js
const selected = reactive({})
const revealed = reactive({})
const toggleAnswer = (index) => { revealed[index] = !revealed[index] }
```

答案区固定输出“正确答案/参考答案”“解析”“对应知识点”三个标签；单选题展开后输出“你的选择”，但不禁止修改选择。

- [ ] **Step 4: 验证组件测试转绿并提交**

Run:

```bash
pnpm test -- src/textbook/components/__tests__
```

Expected: 4 tests PASS。

```bash
git add src/textbook/components/LearningSection.vue src/textbook/components/MechanismChain.vue src/textbook/components/PracticePanel.vue src/textbook/components/__tests__
git commit -m "feat: add student learning interaction components"
```

---

### Task 3: 实现学生学习总视图

**Files:**
- Create: `src/textbook/components/StudentLearningView.vue`
- Create: `src/textbook/components/__tests__/StudentLearningView.test.js`

**Interfaces:**
- Props: `learning: Object`、`sectionTitle: String`、`chapterTitle: String`、`tools: Array<{ id, label, primary }>`。
- Emits: `open-tool`，payload 为 tool id。
- Consumes: `normalizeStudentLearning()`、`LearningSection`、`MechanismChain`、`PracticePanel`。

- [ ] **Step 1: 写总视图失败测试**

```js
import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import StudentLearningView from '../StudentLearningView.vue'

it('renders the student-first hierarchy and omits empty modules', async () => {
  const wrapper = mount(StudentLearningView, {
    props: {
      sectionTitle: '水循环',
      chapterTitle: '地球上的水',
      learning: {
        estimatedMinutes: 12,
        objectives: ['说明水循环类型'],
        keyFocus: ['海陆间循环'],
        difficulties: [],
        overview: '水不断循环运动。',
        knowledgeBlocks: [{ title: '循环类型', summary: '', items: [{ name: '海陆间循环', detail: '联系海陆。' }] }],
        mechanismChains: [], caseStudies: [], misconceptions: [], practice: [],
        memoryTips: ['海陆最重要。'], answerTemplates: [],
      },
      tools: [{ id: 'water', label: '打开水循环模型', primary: true }],
    },
  })

  expect(wrapper.text()).toContain('约 12 分钟')
  expect(wrapper.text()).toContain('水不断循环运动')
  expect(wrapper.text()).toContain('核心知识')
  expect(wrapper.text()).not.toContain('典型案例')
  await wrapper.get('[data-tool="water"]').trigger('click')
  expect(wrapper.emitted('open-tool')).toEqual([['water']])
})
```

- [ ] **Step 2: 运行并确认失败**

Run: `pnpm test -- src/textbook/components/__tests__/StudentLearningView.test.js`

Expected: FAIL，组件缺失。

- [ ] **Step 3: 实现总视图**

固定默认展开规则：页头、速览、工具入口始终显示；“核心知识”默认展开；机制、案例、易错、练习、记忆与答题默认折叠。每个模块仅在相应数组非空时渲染。

页头固定输出：

```text
章节标题 / 节标题
约 N 分钟
学习目标
重点
难点
```

知识项显示 `name` 和 `detail`；案例显示“情境”“思考”“结论”；易错项显示“错误认识”“为什么错”“正确表述”；记忆与答题区分别渲染 `memoryTips` 和 `answerTemplates`。

- [ ] **Step 4: 运行测试并提交**

Run: `pnpm test -- src/textbook/components/__tests__/StudentLearningView.test.js`

Expected: 1 test PASS。

```bash
git add src/textbook/components/StudentLearningView.vue src/textbook/components/__tests__/StudentLearningView.test.js
git commit -m "feat: add student-first textbook lesson view"
```

---

### Task 4: 建立学生内容覆盖层与合并加载器

**Files:**
- Create: `src/textbook/data/高中/必修第一册/student-learning.json`
- Create: `src/textbook/data/studentLearningLoader.js`
- Create: `src/textbook/data/studentLearningLoader.test.js`
- Modify: `src/textbook/data/contentLoader.js`

**Interfaces:**
- Produces: `loadStudentLearning(gradeId, bookId, chapterId, sectionId): Promise<Object | null>`。
- `loadSectionContent()` 返回的新对象在覆盖层存在时包含 `studentLearning`，不得原地修改缓存中的 `content.json` 对象。

- [ ] **Step 1: 写加载与合并的失败测试**

测试使用 1.1：

```js
import { describe, expect, it } from 'vitest'
import { loadStudentLearning } from './studentLearningLoader.js'
import { loadSectionContent } from './contentLoader.js'

describe('student learning overlay', () => {
  it('loads the compulsory-one overlay by chapter and section', async () => {
    const learning = await loadStudentLearning('高中', '必修第一册', '第一章', '第一节')
    expect(learning.overview).toContain('地球')
    expect(learning.practice.length).toBeGreaterThan(0)
  })

  it('merges learning data without removing existing concepts', async () => {
    const section = await loadSectionContent('高中', '必修第一册', '第一章', '第一节')
    expect(section.studentLearning.overview).toContain('地球')
    expect(section.conceptDefinitions).toBeTruthy()
  })

  it('returns null for books without an overlay', async () => {
    expect(await loadStudentLearning('高中', '必修第二册', '第一章', '第一节')).toBeNull()
  })
})
```

- [ ] **Step 2: 运行并确认失败**

Run: `pnpm test -- src/textbook/data/studentLearningLoader.test.js`

Expected: FAIL，覆盖层加载器和 JSON 尚不存在。

- [ ] **Step 3: 创建最小 1.1 覆盖数据和加载器**

`student-learning.json` 根结构固定为：

```json
{
  "第一章": {
    "第一节": {
      "estimatedMinutes": 15,
      "objectives": ["识别主要天体并判断天体系统", "说明地球的普通性与特殊性"],
      "keyFocus": ["天体系统层级", "地球生命存在条件"],
      "difficulties": ["区分天体与天体系统", "建立生命条件因果链"],
      "overview": "地球属于地月系、太阳系、银河系和可观测宇宙。它在位置、结构和运动特征上是一颗普通行星，却因具有安全稳定的外部环境、适宜温度、液态水和大气而成为目前已知存在高级智慧生命的特殊行星。",
      "knowledgeBlocks": [{ "title": "宇宙中的地球", "summary": "先定位，再比较。", "items": [{ "name": "天体系统层级", "detail": "地月系属于太阳系，太阳系属于银河系，银河系属于可观测宇宙。" }, { "name": "行星运动特征", "detail": "八大行星公转具有同向性、近圆性和共面性。" }] }],
      "mechanismChains": [{ "title": "生命条件", "steps": ["太阳光照稳定、轨道环境安全", "日地距离和运动周期适中", "温度适宜并能保持液态水", "适宜大气保护并调节环境", "生命产生和长期演化"] }],
      "caseStudies": [{ "title": "北斗卫星", "context": "卫星从发射架进入地球轨道。", "question": "什么时候属于天体，能否与地球构成天体系统？", "conclusion": "发射架上不是天体；进入太空沿轨道运行后属于人造天体，并与地球存在引力和绕转关系。" }],
      "misconceptions": [{ "wrong": "光年是时间单位。", "reason": "名称中含有“年”，容易与时间混淆。", "correct": "光年是光在真空中一年传播的距离，是距离单位。" }],
      "practice": [{ "type": "single-choice", "question": "太阳、地球和月球的天体类型组合正确的是？", "options": ["A. 恒星、行星、卫星", "B. 行星、恒星、卫星", "C. 恒星、卫星、行星"], "answer": "A", "explanation": "太阳能自行发光，是恒星；地球绕太阳运行，是行星；月球绕地球运行，是卫星。", "knowledgePoint": "天体类型" }],
      "memoryTips": ["天体判断：物质、天外、轨道；行星运动：同向、近圆、共面。"],
      "answerTemplates": [{ "title": "生命条件题", "template": "先答外部条件：安全的宇宙环境、稳定的太阳光照；再答自身条件：适宜温度、充足液态水、适宜的大气厚度和成分，并分别说明形成原因。" }]
    }
  }
}
```

`studentLearningLoader.js` 只对 `高中/必修第一册` 动态导入该 JSON，其他教材返回 `null`。`contentLoader.js` 在原 section 存在时返回 `{ ...section, studentLearning }`；覆盖层为空时返回原 section。

- [ ] **Step 4: 运行测试并提交**

Run: `pnpm test -- src/textbook/data/studentLearningLoader.test.js`

Expected: 3 tests PASS。

```bash
git add src/textbook/data/studentLearningLoader.js src/textbook/data/studentLearningLoader.test.js src/textbook/data/contentLoader.js src/textbook/data/高中/必修第一册/student-learning.json
git commit -m "feat: load student learning content overlay"
```

---

### Task 5: 接入 SectionContent 并保持现有工具入口

**Files:**
- Modify: `src/textbook/SectionContent.vue`
- Create: `src/textbook/SectionContent.test.js`

**Interfaces:**
- Consumes: `loadedContent.studentLearning`、`StudentLearningView`。
- `tools` id 固定为 `mindmap`、`earth`、`atmosphere`、`water`、`landform`、`guilin`、`yellowriver`、`taklamakan`、`soil`、`disaster`、`data-viz`。

- [ ] **Step 1: 写集成失败测试**

把工具映射抽成组件内纯计算属性 `learningTools`，并在测试中 mock 数据加载器。测试断言：存在 `studentLearning` 时出现 `StudentLearningView`；发出 `open-tool: earth` 后 `Earth3D` 分支可见；没有覆盖层时仍显示原 `.lesson-brief`。

核心断言：

```js
expect(wrapper.findComponent({ name: 'StudentLearningView' }).exists()).toBe(true)
expect(wrapper.find('.lesson-brief').exists()).toBe(false)
await wrapper.findComponent({ name: 'StudentLearningView' }).vm.$emit('open-tool', 'earth')
expect(wrapper.findComponent({ name: 'Earth3D' }).exists()).toBe(true)
```

- [ ] **Step 2: 运行并确认失败**

Run: `pnpm test -- src/textbook/SectionContent.test.js`

Expected: FAIL，因为 `SectionContent.vue` 尚未渲染新视图。

- [ ] **Step 3: 接入新视图**

在原正文分支中：

```vue
<StudentLearningView
  v-if="studentLearning"
  :learning="studentLearning"
  :section-title="sectionData.title"
  :chapter-title="chapterData.title"
  :tools="learningTools"
  @open-tool="openLearningTool"
/>
<template v-else>
  <!-- 保留现有 lesson-brief、mindmap-card、concept-defs -->
</template>
```

`openLearningTool(id)` 只修改现有 `show*` 和 `caseStudy` refs，不新增第二套模块状态。`studentLearning` 必须通过 `normalizeStudentLearning(loadedContent.value?.studentLearning)` 得到。

- [ ] **Step 4: 验证集成测试和已有测试**

Run:

```bash
pnpm test -- src/textbook/SectionContent.test.js src/textbook/components/__tests__ src/textbook/utils/studentLearningSchema.test.js
```

Expected: all PASS。

- [ ] **Step 5: 提交**

```bash
git add src/textbook/SectionContent.vue src/textbook/SectionContent.test.js
git commit -m "feat: integrate student learning view into textbook lessons"
```

---

### Task 6: 完成第一章至第三章内容并建立内容审计

**Files:**
- Modify: `src/textbook/data/高中/必修第一册/student-learning.json`
- Create: `scripts/audit-student-learning.mjs`
- Create: `scripts/audit-student-learning.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Audit CLI: `node scripts/audit-student-learning.mjs [optional-json-path]`。
- 成功输出 `Student learning audit passed: 17/17 sections`；失败打印节次和缺失字段并退出 1。

- [ ] **Step 1: 写审计器失败测试**

测试临时 fixture 只含一个不完整节次，并断言审计器返回缺少 `objectives`、`overview`、`knowledgeBlocks` 的错误；再用完整最小 fixture 断言通过。审计规则固定为：

```js
const requiredLessons = {
  第一章: ['第一节', '第二节', '第三节', '第四节'],
  第二章: ['第一节', '第二节'],
  第三章: ['第一节', '第二节', '第三节'],
  第四章: ['第一节', '第二节'],
  第五章: ['第一节', '第二节'],
  第六章: ['第一节', '第二节', '第三节', '第四节'],
}
```

每节必须具有非空 `objectives`、`overview`、`knowledgeBlocks`；必须至少具有 `mechanismChains`、`caseStudies`、`misconceptions`、`practice` 中的一项；必须至少具有 `memoryTips` 或 `answerTemplates`。每道练习必须具有 `question`、`answer`、`explanation`、`knowledgePoint`。禁止文本模式：`学生回答`、`教师小结`、`概念界定—成因机制—案例验证—应用迁移`、`用 2 句话解释本节最核心`、`。。`、字面量 `\\n`。

- [ ] **Step 2: 运行审计测试并确认失败**

Run: `pnpm test -- scripts/audit-student-learning.test.mjs`

Expected: FAIL，审计器尚不存在。

- [ ] **Step 3: 实现审计器并增加脚本**

`package.json` 增加：

```json
"qa:student-learning": "node scripts/audit-student-learning.mjs"
```

审计器导出 `auditStudentLearning(data)` 供测试调用，并仅在直接运行时读取默认 JSON、打印结果和设置退出码。

- [ ] **Step 4: 运行审计测试并确认转绿**

Run: `pnpm test -- scripts/audit-student-learning.test.mjs`

Expected: audit fixture tests PASS。

- [ ] **Step 5: 写入第一章至第三章 9 节内容**

逐节使用以下准确内容边界，不能把相邻课时知识混入：

- 1.1：天体、天体系统、地球普通性和生命条件；练习覆盖天体类型或系统判断。
- 1.2：太阳辐射、四个影响因素、太阳大气与太阳活动；机制覆盖耀斑/CME 对通信和磁场影响；答题模板覆盖太阳辐射差异。
- 1.3：地层、化石、地质年代表、四大演化阶段；案例覆盖地质时间压缩或大灭绝。
- 1.4：P/S 波、莫霍面、古登堡面、内部与外部圈层；易错点区分岩石圈与地壳。
- 2.1：大气组成、对流层、平流层和高层大气；易错点覆盖逆温与正常递减。
- 2.2：大气受热、热力环流、风；机制链固定为“冷热不均 → 垂直运动 → 气压差 → 水平运动”。
- 3.1：三类水循环、主要环节、地理意义与人类影响；口诀保留“海陆最重要、海上量最大、陆地量最小”。
- 3.2：温度、盐度、密度及其分布和影响；案例覆盖红海/波罗的海或海水盐度应用。
- 3.3：海浪、潮汐、洋流；机制覆盖风海流或潮汐；易错点区分寒暖流与水温绝对高低。

每节写 2—4 个 objectives、1 段 100—180 字 overview、2—4 个 knowledgeBlocks、1—3 个 mechanismChains、0—2 个 caseStudies、1—3 个 misconceptions、至少 1 道有解析练习、1—3 个 memoryTips，并在总结原文提供模板时写 answerTemplates。

- [ ] **Step 6: 运行审计并确认预期仍失败**

Run: `pnpm qa:student-learning`

Expected: FAIL，明确只缺第四章至第六章 8 节；第一至第三章不得出现字段或噪声错误。

- [ ] **Step 7: 提交第一批内容与审计器**

```bash
git add package.json scripts/audit-student-learning.mjs scripts/audit-student-learning.test.mjs src/textbook/data/高中/必修第一册/student-learning.json
git commit -m "feat: add student lessons for compulsory geography chapters one to three"
```

---

### Task 7: 完成第四章至第六章 8 节内容

**Files:**
- Modify: `src/textbook/data/高中/必修第一册/student-learning.json`

**Interfaces:**
- Completes the 17/17 contract required by `audit-student-learning.mjs`。

- [ ] **Step 1: 保留失败证据并写第四、第五章内容**

开始前运行 `pnpm qa:student-learning`，确认仍因 8 节缺失而失败。随后写入：

- 4.1：喀斯特、河流、风沙、海岸四类地貌的形成条件、形态和案例；练习考查地貌判读。
- 4.2：宏观到微观的观察顺序；高度、坡度、坡向、形态、面积和空间组合；答题模板覆盖地貌观察描述。
- 5.1：植被概念、环境影响、森林/草原/荒漠差异；机制覆盖环境与植被相互作用。
- 5.2：土壤组成、颜色、质地、剖面、成土因素和养护；易错点区分土壤质地与土壤肥力。

每节满足 Task 6 的数量和质量规则。

- [ ] **Step 2: 运行审计并确认只缺第六章**

Run: `pnpm qa:student-learning`

Expected: FAIL，仅报告第六章第一至第四节缺失。

- [ ] **Step 3: 写第六章内容**

- 6.1：洪涝、干旱、台风、寒潮的成因、分布、危害和防御；案例至少包含一种我国气象灾害。
- 6.2：地震、滑坡、泥石流；易错点区分震级和烈度；机制覆盖泥石流三条件。
- 6.3：“以防为主、防抗救相结合”、工程/非工程措施、自救互救；答题模板覆盖灾害防御措施。
- 6.4：RS、GNSS、GIS 的功能和防灾应用；易错辨析固定为“RS 看哪里发生什么变化，GNSS 定位置，GIS 管理分析多图层”。

每节满足 Task 6 的数量和质量规则，练习题必须有具体答案与解析。

- [ ] **Step 4: 运行内容审计并确认转绿**

Run: `pnpm qa:student-learning`

Expected: `Student learning audit passed: 17/17 sections`，exit 0。

- [ ] **Step 5: 提交第二批内容**

```bash
git add src/textbook/data/高中/必修第一册/student-learning.json
git commit -m "feat: complete compulsory geography student learning content"
```

---

### Task 8: 响应式样式、完整回归与交付核对

**Files:**
- Modify: `src/textbook/components/StudentLearningView.vue`
- Modify: `src/textbook/components/LearningSection.vue`
- Modify: `src/textbook/components/MechanismChain.vue`
- Modify: `src/textbook/components/PracticePanel.vue`
- Modify: `src/textbook/SectionContent.vue`

**Interfaces:**
- No new public interfaces; this task only refines styles and fixes verified regressions。

- [ ] **Step 1: 添加样式契约测试**

在组件测试中增加：折叠按钮存在可读文字；练习选项使用 `<label>` 关联 `<input>`；工具按钮有 `data-tool` 与文本；答案区同时输出文字状态和样式 class；机制链使用 `<ol>`。先运行并确认尚未满足的断言失败。

- [ ] **Step 2: 完成响应式和可访问样式**

使用现有 CSS 变量。固定要求：正文最大阅读宽度不超过 860px；学习目标卡片在桌面最多三列、720px 以下单列；机制链桌面横向、720px 以下纵向；所有按钮最小高度 40px；focus-visible 有 2px 轮廓；答案正确状态同时显示“正确答案”文字；不引入 SVG 插画和外部图片。

- [ ] **Step 3: 运行完整测试**

Run:

```bash
pnpm test
```

Expected: all tests PASS，0 failures。

- [ ] **Step 4: 运行两套内容审计**

Run:

```bash
pnpm qa:student-learning
pnpm qa:textbook
```

Expected: 学生内容审计输出 17/17；现有教材审计无新增失败。若现有教材审计基线本身失败，记录原有失败并确认本任务没有增加失败数量，不修改无关教材册。

- [ ] **Step 5: 运行生产构建**

Run:

```bash
pnpm build
```

Expected: exit 0，Vite production build succeeds。

- [ ] **Step 6: 检查变更边界**

Run:

```bash
git status --short
git diff --check
git diff --stat HEAD~8..HEAD
```

确认没有回退任务开始前已存在的 `MindMapViewer.vue`、多个其他教材 `content.json`、脚本和锁文件改动；只把本任务拥有的文件纳入最后提交。

- [ ] **Step 7: 提交最终样式和验证修复**

```bash
git add src/textbook/components/StudentLearningView.vue src/textbook/components/LearningSection.vue src/textbook/components/MechanismChain.vue src/textbook/components/PracticePanel.vue src/textbook/SectionContent.vue
git commit -m "style: optimize student textbook learning layout"
```

最终交付报告必须列出：17 个覆盖节次、练习交互、保留的 3D/思维导图入口、测试数量、两个审计结果、构建结果，以及仍属于用户的未提交文件。
