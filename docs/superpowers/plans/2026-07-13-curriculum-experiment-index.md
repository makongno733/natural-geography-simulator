# Curriculum Experiment Index Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the geography laboratory into a searchable curriculum-aware resource center and add precise experiment links to matching junior-high and senior-high textbook sections.

**Architecture:** A standalone curriculum relationship module stores explicit section-to-experiment IDs and exposes pure query/filter functions backed by the existing experiment registry. The laboratory home and textbook section page consume this shared module, while experiment return navigation uses internal named-route parameters rather than an arbitrary return URL.

**Tech Stack:** Vue 3 Composition API, Vue Router 4, Vite 6, Vitest 4, Vue Test Utils, jsdom.

## Global Constraints

- Only junior-high (`初中`) and senior-high (`高中`) textbook sections participate in curriculum links; university content is excluded.
- Only explicit, precise whitelist relationships are shown; do not infer links from keywords at runtime.
- Sections with no precise relationship render no experiment heading, container, placeholder, or empty space.
- Existing 19 experiment detail routes and category routes must remain accessible.
- Do not add new experiment models or change 3D model rendering in this feature.
- Search covers experiment name, description, and concepts.
- Filters combine with AND semantics across grade, book, category, and experiment type.
- The textbook entry is a compact text row immediately below the lesson summary.
- Return navigation must build an internal `section` named route from validated route parameters; never redirect to an arbitrary URL.

---

## File Structure

- Create `src/experiments/data/curriculumLinks.js`: explicit relationships plus section lookup, reverse lookup, options, and experiment filtering.
- Create `src/experiments/data/curriculumLinks.test.js`: relationship integrity and pure query/filter tests.
- Create `src/experiments/components/ExperimentFilters.vue`: controlled search and select controls.
- Create `src/experiments/components/ExperimentFilters.test.js`: filter event and clear behavior tests.
- Modify `src/experiments/ExperimentsHome.vue`: resource-center layout and filtered experiment list.
- Create `src/experiments/ExperimentsHome.test.js`: combined filtering and empty-state tests.
- Create `src/experiments/components/RelatedExperimentsRow.vue`: compact textbook experiment links.
- Create `src/experiments/components/RelatedExperimentsRow.test.js`: conditional rendering and route generation tests.
- Modify `src/textbook/SectionContent.vue`: resolve current section relationships and mount the compact row below the lesson summary.
- Create `src/textbook/SectionContent.test.js`: section-level integration tests for linked and unlinked sections.
- Modify `src/experiments/ExperimentView.vue`: validated internal “返回教材” link.
- Modify `src/experiments/ExperimentView.test.js`: source-query navigation coverage.

---

### Task 1: Curriculum Relationship Index

**Files:**
- Create: `src/experiments/data/curriculumLinks.js`
- Create: `src/experiments/data/curriculumLinks.test.js`

**Interfaces:**
- Consumes: default experiment array from `src/experiments/modules/index.js`.
- Produces: `curriculumLinks`, `isLinkedCurriculumSection(grade, book, chapter, section)`, `getExperimentsForSection(grade, book, chapter, section)`, `getCurriculumRefsForExperiment(experimentId)`, `getExperimentFilterOptions()`, and `filterExperiments(filters)`.
- `filterExperiments` accepts `{ search?: string, grade?: string, book?: string, category?: string, type?: string }` and returns experiment registry objects in registry order without duplicates.

- [ ] **Step 1: Write failing relationship and query tests**

Create `src/experiments/data/curriculumLinks.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { grades } from '../../textbook/data/index.js'
import modules from '../modules/index.js'
import {
  curriculumLinks,
  filterExperiments,
  getCurriculumRefsForExperiment,
  getExperimentFilterOptions,
  getExperimentsForSection,
  isLinkedCurriculumSection,
} from './curriculumLinks.js'

function catalogHas(ref) {
  const grade = grades.find((item) => item.id === ref.grade)
  const book = grade?.books.find((item) => item.id === ref.book)
  const chapter = book?.chapters.find((item) => item.id === ref.chapter)
  return Boolean(chapter?.sections.some((item) => item.id === ref.section))
}

describe('curriculum experiment links', () => {
  it('references only real experiments and real junior/senior sections', () => {
    const experimentIds = new Set(modules.map((item) => item.id))

    for (const link of curriculumLinks) {
      expect(['初中', '高中']).toContain(link.grade)
      expect(catalogHas(link)).toBe(true)
      expect(link.experimentIds.length).toBeGreaterThan(0)
      expect(new Set(link.experimentIds).size).toBe(link.experimentIds.length)
      link.experimentIds.forEach((id) => expect(experimentIds.has(id)).toBe(true))
    }
  })

  it('returns only exact matches for a section', () => {
    expect(
      getExperimentsForSection('高中', '必修第一册', '第二章', '第二节').map((item) => item.id)
    ).toEqual(['thermal-circulation', 'coriolis'])

    expect(
      getExperimentsForSection('高中', '必修第一册', '第二章', '第一节')
    ).toEqual([])
  })

  it('supports reverse lookup and stable generated options', () => {
    const refs = getCurriculumRefsForExperiment('water-cycle')
    expect(refs).toContainEqual(expect.objectContaining({
      grade: '高中',
      book: '必修第一册',
      chapter: '第三章',
      section: '第一节',
    }))

    expect(getExperimentFilterOptions()).toEqual(expect.objectContaining({
      grades: ['初中', '高中'],
      booksByGrade: expect.objectContaining({
        初中: expect.arrayContaining(['七年级上册', '八年级上册']),
        高中: expect.arrayContaining(['必修第一册', '选择性必修1']),
      }),
    }))
  })

  it('recognizes only sections present in the explicit relationship index', () => {
    expect(isLinkedCurriculumSection('高中', '必修第一册', '第二章', '第二节')).toBe(true)
    expect(isLinkedCurriculumSection('高中', '伪造教材', '第二章', '第二节')).toBe(false)
  })

  it('searches metadata and combines all filters with AND semantics', () => {
    expect(filterExperiments({ search: '水循环' }).map((item) => item.id)).toContain('water-cycle')
    expect(filterExperiments({ search: '凝结' }).map((item) => item.id)).toContain('cloud-bottle')

    expect(filterExperiments({
      grade: '高中',
      book: '必修第一册',
      category: 'meteorology',
      type: '3d',
    }).map((item) => item.id)).toEqual(['thermal-circulation', 'coriolis'])
  })

  it('trims search text and treats unknown filter values as all', () => {
    expect(filterExperiments({ search: '  月相  ' }).map((item) => item.id)).toContain('moon-phases')
    expect(filterExperiments({ grade: '不存在' })).toHaveLength(modules.length)
  })
})
```

- [ ] **Step 2: Run the new test and verify the missing-module failure**

Run:

```bash
pnpm exec vitest run src/experiments/data/curriculumLinks.test.js
```

Expected: FAIL because `src/experiments/data/curriculumLinks.js` does not exist.

- [ ] **Step 3: Implement the explicit relationship index and queries**

Create `src/experiments/data/curriculumLinks.js`. Use this initial high-confidence whitelist exactly; do not add broad regional or human-geography matches:

```js
import modules from '../modules/index.js'

export const curriculumLinks = [
  { grade: '初中', book: '七年级上册', chapter: '第一章', section: '第一节', experimentIds: ['kepler-laws'] },
  { grade: '初中', book: '七年级上册', chapter: '第一章', section: '第三节', experimentIds: ['solar-motion', 'seasons'] },
  { grade: '初中', book: '七年级上册', chapter: '第三章', section: '第三节', experimentIds: ['fault-model', 'stratigraphy'] },
  { grade: '初中', book: '八年级上册', chapter: '第二章', section: '第二节', experimentIds: ['thermal-circulation', 'coriolis', 'cloud-bottle', 'weather-instruments'] },
  { grade: '初中', book: '八年级上册', chapter: '第二章', section: '第三节', experimentIds: ['stream-table', 'sediment-transport'] },
  { grade: '初中', book: '八年级上册', chapter: '第三章', section: '第二节', experimentIds: ['soil-erosion', 'infiltration'] },
  { grade: '初中', book: '八年级上册', chapter: '第三章', section: '第三节', experimentIds: ['water-cycle', 'groundwater', 'infiltration'] },

  { grade: '高中', book: '必修第一册', chapter: '第一章', section: '第一节', experimentIds: ['kepler-laws'] },
  { grade: '高中', book: '必修第一册', chapter: '第一章', section: '第三节', experimentIds: ['stratigraphy'] },
  { grade: '高中', book: '必修第一册', chapter: '第二章', section: '第二节', experimentIds: ['thermal-circulation', 'coriolis'] },
  { grade: '高中', book: '必修第一册', chapter: '第三章', section: '第一节', experimentIds: ['water-cycle', 'infiltration', 'groundwater'] },
  { grade: '高中', book: '必修第一册', chapter: '第三章', section: '第三节', experimentIds: ['coriolis'] },
  { grade: '高中', book: '必修第一册', chapter: '第四章', section: '第一节', experimentIds: ['stream-table', 'sediment-transport', 'fault-model'] },
  { grade: '高中', book: '必修第一册', chapter: '第四章', section: '第二节', experimentIds: ['stratigraphy'] },
  { grade: '高中', book: '必修第一册', chapter: '第五章', section: '第二节', experimentIds: ['potato-core', 'infiltration', 'soil-erosion'] },

  { grade: '高中', book: '选择性必修1', chapter: '第一章', section: '第一节', experimentIds: ['solar-motion', 'seasons', 'kepler-laws'] },
  { grade: '高中', book: '选择性必修1', chapter: '第一章', section: '第二节', experimentIds: ['solar-motion', 'seasons', 'moon-phases', 'eclipse'] },
  { grade: '高中', book: '选择性必修1', chapter: '第二章', section: '第一节', experimentIds: ['fault-model', 'stratigraphy'] },
  { grade: '高中', book: '选择性必修1', chapter: '第二章', section: '第二节', experimentIds: ['fault-model'] },
  { grade: '高中', book: '选择性必修1', chapter: '第二章', section: '第三节', experimentIds: ['stream-table', 'sediment-transport'] },
  { grade: '高中', book: '选择性必修1', chapter: '第三章', section: '第一节', experimentIds: ['thermal-circulation', 'coriolis', 'cloud-bottle', 'weather-instruments'] },
  { grade: '高中', book: '选择性必修1', chapter: '第三章', section: '第二节', experimentIds: ['thermal-circulation', 'coriolis'] },
  { grade: '高中', book: '选择性必修1', chapter: '第三章', section: '第三节', experimentIds: ['thermal-circulation', 'coriolis'] },
  { grade: '高中', book: '选择性必修1', chapter: '第四章', section: '第一节', experimentIds: ['water-cycle', 'groundwater', 'infiltration'] },
  { grade: '高中', book: '选择性必修1', chapter: '第四章', section: '第二节', experimentIds: ['coriolis'] },
  { grade: '高中', book: '选择性必修1', chapter: '第四章', section: '第三节', experimentIds: ['thermal-circulation', 'coriolis', 'water-cycle'] },

  { grade: '高中', book: '选择性必修2', chapter: '第二章', section: '第二节', experimentIds: ['soil-erosion', 'infiltration'] },
  { grade: '高中', book: '选择性必修2', chapter: '第四章', section: '第一节', experimentIds: ['stream-table', 'sediment-transport', 'water-cycle'] },

  { grade: '高中', book: '选择性必修3', chapter: '第二章', section: '第三节', experimentIds: ['soil-erosion', 'infiltration', 'potato-core'] },
  { grade: '高中', book: '选择性必修3', chapter: '第三章', section: '第二节', experimentIds: ['groundwater', 'water-cycle'] },
]

const validGrades = new Set(curriculumLinks.map((link) => link.grade))
const booksByGrade = curriculumLinks.reduce((result, link) => {
  if (!result[link.grade]) result[link.grade] = []
  if (!result[link.grade].includes(link.book)) result[link.grade].push(link.book)
  return result
}, {})

function matchesSection(link, grade, book, chapter, section) {
  return link.grade === grade && link.book === book && link.chapter === chapter && link.section === section
}

export function isLinkedCurriculumSection(grade, book, chapter, section) {
  return curriculumLinks.some((link) => matchesSection(link, grade, book, chapter, section))
}

export function getExperimentsForSection(grade, book, chapter, section) {
  const ids = curriculumLinks
    .filter((link) => matchesSection(link, grade, book, chapter, section))
    .flatMap((link) => link.experimentIds)
  const idSet = new Set(ids)
  return modules.filter((experiment) => idSet.has(experiment.id))
}

export function getCurriculumRefsForExperiment(experimentId) {
  return curriculumLinks
    .filter((link) => link.experimentIds.includes(experimentId))
    .map(({ experimentIds, ...ref }) => ref)
}

export function getExperimentFilterOptions() {
  return {
    grades: [...validGrades],
    booksByGrade: Object.fromEntries(
      Object.entries(booksByGrade).map(([grade, books]) => [grade, [...books]])
    ),
  }
}

function isKnownBook(grade, book) {
  if (!book) return false
  if (grade && validGrades.has(grade)) return booksByGrade[grade]?.includes(book) || false
  return Object.values(booksByGrade).some((books) => books.includes(book))
}

export function filterExperiments(filters = {}) {
  const search = String(filters.search || '').trim().toLocaleLowerCase('zh-CN')
  const grade = validGrades.has(filters.grade) ? filters.grade : ''
  const book = isKnownBook(grade, filters.book) ? filters.book : ''
  const category = modules.some((item) => item.category === filters.category) ? filters.category : ''
  const type = modules.some((item) => item.type === filters.type) ? filters.type : ''

  const curriculumIds = grade || book
    ? new Set(curriculumLinks
      .filter((link) => (!grade || link.grade === grade) && (!book || link.book === book))
      .flatMap((link) => link.experimentIds))
    : null

  return modules.filter((experiment) => {
    const searchable = [experiment.name, experiment.description, ...(experiment.concepts || [])]
      .join(' ')
      .toLocaleLowerCase('zh-CN')
    return (!search || searchable.includes(search))
      && (!curriculumIds || curriculumIds.has(experiment.id))
      && (!category || experiment.category === category)
      && (!type || experiment.type === type)
  })
}
```

- [ ] **Step 4: Run the relationship tests**

Run:

```bash
pnpm exec vitest run src/experiments/data/curriculumLinks.test.js
```

Expected: 1 test file PASS, 6 tests PASS.

- [ ] **Step 5: Commit the relationship index**

```bash
git add src/experiments/data/curriculumLinks.js src/experiments/data/curriculumLinks.test.js
git commit -m "feat: add curriculum experiment index"
```

---

### Task 2: Controlled Experiment Filter Bar

**Files:**
- Create: `src/experiments/components/ExperimentFilters.vue`
- Create: `src/experiments/components/ExperimentFilters.test.js`

**Interfaces:**
- Consumes prop `modelValue` with `{ search, grade, book, category, type }` strings.
- Consumes prop `options` from `getExperimentFilterOptions()` and category labels from the caller.
- Produces `update:modelValue` with a complete copied filter object and `clear` when reset is activated.

- [ ] **Step 1: Write failing component tests**

Create `src/experiments/components/ExperimentFilters.test.js` with jsdom. Mount the component with two grades, grade-specific books, four categories, and two types. Assert that typing emits `update:modelValue`, changing grade clears the previous book, selecting type emits `type: '3d'`, and clicking the clear button emits both a blank model and `clear`.

Use stable selectors:

```js
expect(wrapper.get('[data-testid="experiment-search"]'))
expect(wrapper.get('[data-testid="grade-filter"]'))
expect(wrapper.get('[data-testid="book-filter"]'))
expect(wrapper.get('[data-testid="category-filter"]'))
expect(wrapper.get('[data-testid="type-filter"]'))
expect(wrapper.get('[data-testid="clear-filters"]'))
```

- [ ] **Step 2: Run the component test and verify it fails**

Run:

```bash
pnpm exec vitest run src/experiments/components/ExperimentFilters.test.js
```

Expected: FAIL because `ExperimentFilters.vue` does not exist.

- [ ] **Step 3: Implement `ExperimentFilters.vue`**

Build an unframed toolbar with a search input and native selects. Use accessible `<label>` elements and these values:

```js
const blankFilters = { search: '', grade: '', book: '', category: '', type: '' }

function update(key, value) {
  const next = { ...props.modelValue, [key]: value }
  if (key === 'grade') next.book = ''
  emit('update:modelValue', next)
}

function clear() {
  emit('update:modelValue', { ...blankFilters })
  emit('clear')
}
```

The book select options must use `options.booksByGrade[modelValue.grade]` when a grade is selected; otherwise flatten and deduplicate all book arrays. Category labels must display `气象学、水文学、地质学、天文学`, and type labels must display `3D 交互、图文教程`. The clear control must be a text command button labeled `清除筛选`. Keep controls at stable heights and allow the toolbar to wrap below 720px.

- [ ] **Step 4: Run component tests**

Run:

```bash
pnpm exec vitest run src/experiments/components/ExperimentFilters.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit the filter component**

```bash
git add src/experiments/components/ExperimentFilters.vue src/experiments/components/ExperimentFilters.test.js
git commit -m "feat: add experiment resource filters"
```

---

### Task 3: Searchable Geography Laboratory Home

**Files:**
- Modify: `src/experiments/ExperimentsHome.vue`
- Create: `src/experiments/ExperimentsHome.test.js`

**Interfaces:**
- Consumes `filterExperiments`, `getCurriculumRefsForExperiment`, and `getExperimentFilterOptions` from Task 1.
- Consumes `ExperimentFilters` from Task 2.
- Preserves destination route `/experiments/:category/:experiment` for every result.

- [ ] **Step 1: Write failing home-page tests**

Create a jsdom test that mounts `ExperimentsHome` with `router-link` stubbed as an anchor preserving the `to` value. Assert:

1. Default text contains `19 个实验` and both `热力环流模拟实验` and `月相模拟实验`.
2. Typing `水循环` into `[data-testid="experiment-search"]` leaves `水循环袋实验` and removes `断层与褶皱模拟`.
3. Selecting `高中` then `必修第一册` then `meteorology` then `3d` leaves exactly the two expected cards.
4. A search with no match shows `[data-testid="experiment-empty"]` and clicking clear restores results.

- [ ] **Step 2: Run the page test and verify current behavior fails**

Run:

```bash
pnpm exec vitest run src/experiments/ExperimentsHome.test.js
```

Expected: FAIL because the current page only renders four category cards.

- [ ] **Step 3: Rewrite the home page as a resource center**

In `src/experiments/ExperimentsHome.vue`:

```js
import { computed, ref } from 'vue'
import modules, { categoryLabels } from './modules/index.js'
import ExperimentFilters from './components/ExperimentFilters.vue'
import {
  filterExperiments,
  getCurriculumRefsForExperiment,
  getExperimentFilterOptions,
} from './data/curriculumLinks.js'

const filters = ref({ search: '', grade: '', book: '', category: '', type: '' })
const options = getExperimentFilterOptions()
const results = computed(() => filterExperiments(filters.value))

function matchingRefs(experimentId) {
  return getCurriculumRefsForExperiment(experimentId).filter((ref) =>
    (!filters.value.grade || ref.grade === filters.value.grade)
      && (!filters.value.book || ref.book === filters.value.book)
  )
}
```

Render the title, filter component, result count, and one card per result. Each card must include type badge, name, description, concept tags, and up to two matching curriculum references when a grade or book filter is active. Keep the existing category colors as subtle accents, reduce card radius to at most 8px, and use a responsive two-column grid above 760px and one column below it. Do not nest cards inside another card.

If `results.length === 0`, render:

```html
<div class="experiment-empty" data-testid="experiment-empty">
  <strong>没有找到匹配的实验</strong>
  <span>调整搜索词或清除筛选后再试。</span>
</div>
```

- [ ] **Step 4: Run home-page and filter tests**

Run:

```bash
pnpm exec vitest run src/experiments/ExperimentsHome.test.js src/experiments/components/ExperimentFilters.test.js
```

Expected: both files PASS.

- [ ] **Step 5: Commit the laboratory home**

```bash
git add src/experiments/ExperimentsHome.vue src/experiments/ExperimentsHome.test.js
git commit -m "feat: turn experiment home into resource center"
```

---

### Task 4: Precise Experiment Links on Textbook Sections

**Files:**
- Create: `src/experiments/components/RelatedExperimentsRow.vue`
- Create: `src/experiments/components/RelatedExperimentsRow.test.js`
- Modify: `src/textbook/SectionContent.vue`
- Create: `src/textbook/SectionContent.test.js`

**Interfaces:**
- `RelatedExperimentsRow` consumes `experiments` and `source` props.
- `source` is `{ grade, book, chapter, section }`.
- Each link targets `{ name: 'experiment-view', params: { category, experiment }, query: { fromGrade, fromBook, fromChapter, fromSection } }`.
- `SectionContent` consumes `getExperimentsForSection` from Task 1.

- [ ] **Step 1: Write failing row component tests**

Create `RelatedExperimentsRow.test.js` and assert:

- Empty experiments render no `.related-experiments-row`.
- Two experiments render `相关实验：` and both names.
- The first router-link `to` contains the experiment named route plus all four `from*` query fields.

Use a router-link stub that exposes `to` as a prop so the test can inspect `wrapper.findComponent({ name: 'RouterLink' }).props('to')`.

- [ ] **Step 2: Run the row test and verify it fails**

Run:

```bash
pnpm exec vitest run src/experiments/components/RelatedExperimentsRow.test.js
```

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the compact row component**

Create `RelatedExperimentsRow.vue` with this behavior:

```vue
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
```

Style it as a compact unframed flex row with a top border, 12px vertical spacing, wrapping links, 13px text, red link color, and visible keyboard focus.

- [ ] **Step 4: Add a failing `SectionContent` integration test**

Create `src/textbook/SectionContent.test.js` with jsdom. Mock `getChapter`, `getSection`, and `loadSectionContent`; stub all heavy async viewers. Set the reactive route first to `高中 / 必修第一册 / 第二章 / 第二节`, mount, flush promises, and assert `相关实验` plus `热力环流模拟实验`. Change section to `第一节`, flush, and assert `相关实验` is absent.

- [ ] **Step 5: Integrate the row immediately below the lesson summary**

In `SectionContent.vue`:

```js
import RelatedExperimentsRow from '../experiments/components/RelatedExperimentsRow.vue'
import { getExperimentsForSection } from '../experiments/data/curriculumLinks.js'

const relatedExperiments = computed(() => getExperimentsForSection(
  gradeId.value,
  bookId.value,
  chapterId.value,
  sectionId.value
))

const sectionSource = computed(() => ({
  grade: gradeId.value,
  book: bookId.value,
  chapter: chapterId.value,
  section: sectionId.value,
}))
```

Place this directly after the closing `</section>` of `.lesson-brief`:

```vue
<RelatedExperimentsRow
  :experiments="relatedExperiments"
  :source="sectionSource"
/>
```

- [ ] **Step 6: Run row and section tests**

Run:

```bash
pnpm exec vitest run src/experiments/components/RelatedExperimentsRow.test.js src/textbook/SectionContent.test.js
```

Expected: both files PASS; linked section shows the row and unlinked section omits it entirely.

- [ ] **Step 7: Commit the textbook integration**

```bash
git add src/experiments/components/RelatedExperimentsRow.vue src/experiments/components/RelatedExperimentsRow.test.js src/textbook/SectionContent.vue src/textbook/SectionContent.test.js
git commit -m "feat: link textbook sections to experiments"
```

---

### Task 5: Validated Return-to-Textbook Navigation

**Files:**
- Modify: `src/experiments/ExperimentView.vue`
- Modify: `src/experiments/ExperimentView.test.js`

**Interfaces:**
- Consumes route query fields `fromGrade`, `fromBook`, `fromChapter`, and `fromSection` from Task 4, plus `isLinkedCurriculumSection` from Task 1.
- Produces an internal Vue Router location `{ name: 'section', params: { grade, book, chapter, section } }` only for complete junior/senior sources.

- [ ] **Step 1: Extend the view test with failing source-navigation cases**

Add `query: {}` to the reactive route fixture. Add two tests:

```js
it('shows an internal return link for a complete textbook source', async () => {
  route.query = {
    fromGrade: '高中',
    fromBook: '必修第一册',
    fromChapter: '第二章',
    fromSection: '第二节',
  }
  const wrapper = mountView()
  await flushPromises()
  const link = wrapper.get('[data-testid="return-to-textbook"]')
  expect(link.text()).toContain('返回教材')
})

it('hides the return link for missing or unsupported source data', async () => {
  route.query = { fromGrade: '大学' }
  const wrapper = mountView()
  await flushPromises()
  expect(wrapper.find('[data-testid="return-to-textbook"]').exists()).toBe(false)
})
```

Refactor the repeated mount setup into `mountView()` and make the router-link stub render a `data-testid` attribute passed through `$attrs`.

- [ ] **Step 2: Run the view tests and verify the new test fails**

Run:

```bash
pnpm exec vitest run src/experiments/ExperimentView.test.js
```

Expected: existing tests PASS and the new return-link test FAILS.

- [ ] **Step 3: Add the validated internal return route**

In `ExperimentView.vue`:

```js
import { isLinkedCurriculumSection } from './data/curriculumLinks.js'

const textbookSourceRoute = computed(() => {
  const { fromGrade, fromBook, fromChapter, fromSection } = route.query
  if (!['初中', '高中'].includes(fromGrade)) return null
  if (![fromBook, fromChapter, fromSection].every((value) => typeof value === 'string' && value.length)) return null
  if (!isLinkedCurriculumSection(fromGrade, fromBook, fromChapter, fromSection)) return null
  return {
    name: 'section',
    params: {
      grade: fromGrade,
      book: fromBook,
      chapter: fromChapter,
      section: fromSection,
    },
  }
})
```

Render below the breadcrumb and before the title:

```vue
<router-link
  v-if="textbookSourceRoute"
  :to="textbookSourceRoute"
  class="ev-return"
  data-testid="return-to-textbook"
>
  ← 返回教材
</router-link>
```

Style it as a compact text link with a 36px minimum touch height on mobile. Do not use `window.location`, `router.push` with a raw URL, or a `returnTo` URL query.

- [ ] **Step 4: Run the experiment view tests**

Run:

```bash
pnpm exec vitest run src/experiments/ExperimentView.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit return navigation**

```bash
git add src/experiments/ExperimentView.vue src/experiments/ExperimentView.test.js
git commit -m "feat: return from experiments to textbook sections"
```

---

### Task 6: Full Verification and Browser QA

**Files:**
- Modify only files from Tasks 1-5 if verification reveals a scoped defect.

**Interfaces:**
- Verifies all feature interfaces and preserves existing routes.

- [ ] **Step 1: Run all automated tests**

Run:

```bash
pnpm test
```

Expected: all test files and tests PASS with zero failures.

- [ ] **Step 2: Run the production build**

Run:

```bash
pnpm run build
```

Expected: exit code 0. The existing Vite large-chunk warning is acceptable; new errors are not.

- [ ] **Step 3: Start the local production preview**

Run:

```bash
pnpm preview --host 127.0.0.1 --port 4173
```

If port 4173 is occupied, use 4174 and record the chosen URL.

- [ ] **Step 4: Verify the laboratory on desktop and mobile**

Using the in-app browser, check `/#/experiments` at approximately 1440x900 and 390x844:

- All 19 experiments appear by default.
- Search `水循环` returns the water-cycle experiment.
- `高中 + 必修第一册 + 气象学 + 3D 交互` returns thermal circulation and Coriolis only.
- Empty search results show the empty state and clear action.
- Controls, card text, badges, and mobile wrapping do not overlap.

- [ ] **Step 5: Verify linked and unlinked textbook sections**

Check:

- Linked senior-high section: `/#/高中/必修第一册/第二章/第二节` shows the compact related-experiment row below the lesson summary.
- Unlinked senior-high section: `/#/高中/必修第一册/第二章/第一节` shows no related-experiment row or empty space.
- Linked junior-high section: `/#/初中/七年级上册/第一章/第三节` shows solar-motion and seasons links.
- Unlinked junior-high section: `/#/初中/七年级上册/第二章/第一节` shows no related-experiment row.

- [ ] **Step 6: Verify the round trip**

From the linked senior-high section, open thermal circulation, confirm the experiment loads and the teaching guide remains visible, then activate `返回教材`. Confirm the browser returns to the exact originating section.

- [ ] **Step 7: Stop the preview server and inspect the final diff**

Run:

```bash
git status --short
git diff --check
git log --oneline -8
```

Expected: no uncommitted implementation files, no whitespace errors, and one focused commit for each completed implementation task.
