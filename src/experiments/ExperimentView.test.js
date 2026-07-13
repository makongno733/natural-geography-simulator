// @vitest-environment jsdom
import { mount, flushPromises } from '@vue/test-utils'
import { reactive } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const route = reactive({
  params: {
    category: 'hydrology',
    experiment: 'stream-table'
  },
  query: {}
})

vi.mock('vue-router', () => ({
  useRoute: () => route
}))

vi.mock('./modules/index.js', () => {
  const threeDExperiment = {
    id: 'stream-table',
    name: '流水地貌模拟台',
    category: 'hydrology',
    type: '3d',
    concepts: ['侵蚀', '沉积'],
    pedagogy: {
      objectives: ['解释流水侵蚀和沉积的关系']
    },
    component: () =>
      Promise.resolve({
        default: {
          template: '<div data-testid="mock-3d-experiment">3D 实验内容</div>'
        }
      })
  }

  const tutorialExperiment = {
    id: 'water-cycle',
    name: '水循环袋实验',
    category: 'hydrology',
    type: 'tutorial',
    concepts: ['蒸发', '凝结'],
    pedagogy: {
      objectives: ['概括蒸发、凝结和降水的连续关系']
    },
    component: () =>
      Promise.resolve({
        default: {
          steps: [
            {
              title: '步骤一',
              content: '观察袋壁上小水滴的形成。'
            }
          ]
        }
      })
  }

  return {
    default: [threeDExperiment, tutorialExperiment],
    categoryLabels: {
      hydrology: '水文学实验'
    },
    getRelatedExperiments: () => []
  }
})

import ExperimentView from './ExperimentView.vue'

function mountView() {
  return mount(ExperimentView, {
    global: {
      stubs: {
        'router-link': {
          template: '<a v-bind="$attrs"><slot /></a>'
        }
      }
    }
  })
}

describe('ExperimentView', () => {
  beforeEach(() => {
    route.params.category = 'hydrology'
    route.params.experiment = 'stream-table'
    route.query = {}
  })

  it('renders the teaching guide after 3d content and before concepts', async () => {
    const wrapper = mountView()

    await flushPromises()

    const html = wrapper.html()

    expect(wrapper.text()).toContain('3D 实验内容')
    expect(wrapper.text()).toContain('学习目标')
    expect(wrapper.text()).toContain('解释流水侵蚀和沉积的关系')
    expect(wrapper.text()).toContain('涉及知识点')
    expect(wrapper.text()).toContain('侵蚀')

    expect(html.indexOf('3D 实验内容')).toBeLessThan(html.indexOf('学习目标'))
    expect(html.indexOf('学习目标')).toBeLessThan(html.indexOf('涉及知识点'))
  })

  it('renders the teaching guide for tutorial experiments without affecting concepts', async () => {
    route.params.experiment = 'water-cycle'

    const wrapper = mountView()

    await flushPromises()

    const html = wrapper.html()

    expect(wrapper.text()).toContain('步骤一')
    expect(wrapper.text()).toContain('观察袋壁上小水滴的形成。')
    expect(wrapper.text()).toContain('学习目标')
    expect(wrapper.text()).toContain('概括蒸发、凝结和降水的连续关系')
    expect(wrapper.text()).toContain('涉及知识点')
    expect(wrapper.text()).toContain('蒸发')

    expect(html.indexOf('步骤一')).toBeLessThan(html.indexOf('学习目标'))
    expect(html.indexOf('学习目标')).toBeLessThan(html.indexOf('涉及知识点'))
  })

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
})
