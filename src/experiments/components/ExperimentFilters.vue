<template>
  <div class="experiment-filters" aria-label="实验筛选">
    <label class="filter-control filter-search" for="experiment-search">
      <span>搜索实验</span>
      <input
        id="experiment-search"
        :value="modelValue.search"
        data-testid="experiment-search"
        type="search"
        placeholder="搜索实验名称或概念"
        @input="update('search', $event.target.value)"
      />
    </label>

    <label class="filter-control" for="grade-filter">
      <span>年级</span>
      <select
        id="grade-filter"
        :value="modelValue.grade"
        data-testid="grade-filter"
        @change="update('grade', $event.target.value)"
      >
        <option value="">全部年级</option>
        <option v-for="grade in options.grades" :key="grade" :value="grade">
          {{ grade }}
        </option>
      </select>
    </label>

    <label class="filter-control" for="book-filter">
      <span>教材</span>
      <select
        id="book-filter"
        :value="modelValue.book"
        data-testid="book-filter"
        @change="update('book', $event.target.value)"
      >
        <option value="">全部教材</option>
        <option v-for="book in availableBooks" :key="book" :value="book">
          {{ book }}
        </option>
      </select>
    </label>

    <label class="filter-control" for="category-filter">
      <span>学科</span>
      <select
        id="category-filter"
        :value="modelValue.category"
        data-testid="category-filter"
        @change="update('category', $event.target.value)"
      >
        <option value="">全部学科</option>
        <option v-for="(label, category) in categoryLabels" :key="category" :value="category">
          {{ label }}
        </option>
      </select>
    </label>

    <label class="filter-control" for="type-filter">
      <span>形式</span>
      <select
        id="type-filter"
        :value="modelValue.type"
        data-testid="type-filter"
        @change="update('type', $event.target.value)"
      >
        <option value="">全部形式</option>
        <option v-for="type in types" :key="type.value" :value="type.value">
          {{ type.label }}
        </option>
      </select>
    </label>

    <button
      class="clear-filters"
      data-testid="clear-filters"
      type="button"
      @click="clear"
    >
      清除筛选
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const blankFilters = { search: '', grade: '', book: '', category: '', type: '' }
const types = [
  { value: '3d', label: '3D 交互' },
  { value: 'tutorial', label: '图文教程' }
]

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  options: {
    type: Object,
    required: true
  },
  categoryLabels: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'clear'])

const availableBooks = computed(() => {
  const booksByGrade = props.options.booksByGrade || {}
  if (props.modelValue.grade) return booksByGrade[props.modelValue.grade] || []
  return [...new Set(Object.values(booksByGrade).flat())]
})

function update(key, value) {
  const next = { ...props.modelValue, [key]: value }
  if (key === 'grade') next.book = ''
  emit('update:modelValue', next)
}

function clear() {
  emit('update:modelValue', { ...blankFilters })
  emit('clear')
}
</script>

<style scoped>
.experiment-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 12px;
  width: 100%;
}

.filter-control {
  display: grid;
  gap: 6px;
  min-width: 150px;
  flex: 1 1 150px;
}

.filter-search {
  flex-basis: 240px;
}

.filter-control span {
  color: var(--muted);
  font-size: 12px;
  line-height: 1;
}

.filter-control input,
.filter-control select,
.clear-filters {
  box-sizing: border-box;
  min-height: 40px;
  height: 40px;
  border: 1px solid var(--brown-light);
  border-radius: var(--radius-sm);
  font: inherit;
  font-size: 14px;
}

.filter-control input,
.filter-control select {
  width: 100%;
  padding: 0 10px;
  color: var(--ink);
  background: var(--paper);
}

.filter-control input:focus,
.filter-control select:focus,
.clear-filters:focus-visible {
  outline: 2px solid var(--red);
  outline-offset: 2px;
}

.clear-filters {
  flex: 0 0 auto;
  padding: 0 14px;
  color: var(--red);
  background: transparent;
  cursor: pointer;
}

.clear-filters:hover {
  background: rgba(158, 36, 38, 0.08);
}

@media (max-width: 720px) {
  .filter-control,
  .filter-search {
    flex-basis: calc(50% - 6px);
    min-width: 140px;
  }

  .clear-filters {
    flex-basis: 100%;
  }
}

@media (max-width: 420px) {
  .filter-control,
  .filter-search {
    flex-basis: 100%;
  }
}
</style>
