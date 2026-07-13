// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import RelatedExperimentsRow from './RelatedExperimentsRow.vue'

const source = {
  grade: '高中',
  book: '必修第一册',
  chapter: '第二章',
  section: '第二节',
}

const experiments = [
  { id: 'thermal-circulation', name: '热力环流模拟实验', category: 'meteorology' },
  { id: 'coriolis', name: '科里奥利力旋转水槽实验', category: 'meteorology' },
]

const RouterLink = {
  name: 'RouterLink',
  props: ['to'],
  template: '<a><slot /></a>',
}

function mountRow(props) {
  return mount(RelatedExperimentsRow, {
    props,
    global: {
      stubs: { 'router-link': RouterLink },
    },
  })
}

describe('RelatedExperimentsRow', () => {
  it('renders no row for an empty experiment list', () => {
    const wrapper = mountRow({ experiments: [], source })

    expect(wrapper.find('.related-experiments-row').exists()).toBe(false)
  })

  it('renders the related experiment label and every experiment name', () => {
    const wrapper = mountRow({ experiments, source })

    expect(wrapper.text()).toContain('相关实验：')
    expect(wrapper.text()).toContain('热力环流模拟实验')
    expect(wrapper.text()).toContain('科里奥利力旋转水槽实验')
  })

  it('links each experiment back to its textbook section', () => {
    const wrapper = mountRow({ experiments, source })

    expect(wrapper.findComponent({ name: 'RouterLink' }).props('to')).toEqual({
      name: 'experiment-view',
      params: { category: 'meteorology', experiment: 'thermal-circulation' },
      query: {
        fromGrade: '高中',
        fromBook: '必修第一册',
        fromChapter: '第二章',
        fromSection: '第二节',
      },
    })
  })
})
