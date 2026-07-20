// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ExperimentFilters from './ExperimentFilters.vue'

const blankFilters = { search: '', grade: '', book: '', category: '', type: '' }
const options = {
  grades: ['初中', '高中'],
  booksByGrade: {
    初中: ['七年级上册', '八年级上册'],
    高中: ['必修第一册', '选择性必修1']
  }
}
const categoryLabels = {
  meteorology: '气象学',
  hydrology: '水文学',
  geology: '地质学',
  astronomy: '天文学'
}

function mountFilters(modelValue = blankFilters) {
  return mount(ExperimentFilters, {
    props: { modelValue, options, categoryLabels }
  })
}

describe('ExperimentFilters', () => {
  it('renders stable accessible controls for all filter dimensions', () => {
    const wrapper = mountFilters()

    expect(wrapper.get('[data-testid="experiment-search"]')).toBeTruthy()
    expect(wrapper.get('[data-testid="grade-filter"]')).toBeTruthy()
    expect(wrapper.get('[data-testid="book-filter"]')).toBeTruthy()
    expect(wrapper.get('[data-testid="category-filter"]')).toBeTruthy()
    expect(wrapper.get('[data-testid="type-filter"]')).toBeTruthy()
    expect(wrapper.get('[data-testid="clear-filters"]')).toBeTruthy()
    expect(wrapper.text()).toContain('气象学')
    expect(wrapper.text()).toContain('水文学')
    expect(wrapper.text()).toContain('地质学')
    expect(wrapper.text()).toContain('天文学')
    expect(wrapper.text()).toContain('3D 交互')
    expect(wrapper.text()).toContain('图文教程')
  })

  it('emits a complete copied filter object when search text changes', async () => {
    const modelValue = { ...blankFilters, category: 'hydrology' }
    const wrapper = mountFilters(modelValue)

    await wrapper.get('[data-testid="experiment-search"]').setValue('水循环')

    expect(wrapper.emitted('update:modelValue')).toContainEqual([{
      ...modelValue,
      search: '水循环'
    }])
  })

  it('clears the previous book when the grade changes', async () => {
    const modelValue = { ...blankFilters, grade: '初中', book: '七年级上册' }
    const wrapper = mountFilters(modelValue)

    await wrapper.get('[data-testid="grade-filter"]').setValue('高中')

    expect(wrapper.emitted('update:modelValue')).toContainEqual([{
      ...modelValue,
      grade: '高中',
      book: ''
    }])
  })

  it('emits the selected experiment type', async () => {
    const wrapper = mountFilters()

    await wrapper.get('[data-testid="type-filter"]').setValue('3d')

    expect(wrapper.emitted('update:modelValue')).toContainEqual([{
      ...blankFilters,
      type: '3d'
    }])
  })

  it('emits blank filters and clear when reset is activated', async () => {
    const wrapper = mountFilters({
      search: '水循环',
      grade: '高中',
      book: '必修第一册',
      category: 'hydrology',
      type: '3d'
    })

    await wrapper.get('[data-testid="clear-filters"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toContainEqual([{ ...blankFilters }])
    expect(wrapper.emitted('clear')).toHaveLength(1)
  })
})
