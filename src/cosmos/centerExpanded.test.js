import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import CosmosCenter from './CosmosCenter.vue'
import { teacher } from './preferences.js'

// Mock vue-router
const currentRoute = {
  path: '/cosmos',
  params: {}
}

vi.mock('vue-router', () => ({
  useRoute: () => currentRoute,
  RouterLink: {
    name: 'RouterLink',
    props: ['to'],
    template: '<a :href="typeof to === \'string\' ? to : to.path"><slot /></a>'
  }
}))

const mountOptions = {
  global: {
    stubs: {
      'router-link': {
        template: '<a :href="to"><slot /></a>',
        props: ['to']
      }
    }
  }
}

describe('CosmosCenter Knowledge Atlas, Deep Interactions & Navigation', () => {
  it('renders knowledge atlas home view with 22 chapters', () => {
    currentRoute.path = '/cosmos'
    currentRoute.params = {}

    const wrapper = mount(CosmosCenter, mountOptions)
    expect(wrapper.text()).toContain('GEO COSMOS')
    expect(wrapper.text()).toContain('22 篇核心导读')
    expect(wrapper.findAll('.cx-card').length).toBe(22)
  })

  it('filters chapters interactively by search query', async () => {
    currentRoute.path = '/cosmos'
    currentRoute.params = {}

    const wrapper = mount(CosmosCenter, mountOptions)
    const searchInput = wrapper.find('#cx-search')
    await searchInput.setValue('超对称')

    const filteredCards = wrapper.findAll('.cx-card')
    expect(filteredCards.length).toBeGreaterThan(0)
    expect(filteredCards.length).toBeLessThan(22)

    // Unmatched search query
    await searchInput.setValue('this-will-never-match-a-physics-term-xyz')
    expect(wrapper.find('.cx-empty-notice').exists()).toBe(true)
    expect(wrapper.findAll('.cx-card').length).toBe(0)
  })

  it('displays dedicated 404 state for unknown chapter paths', () => {
    currentRoute.path = '/cosmos/chapter/unknown-nonexistent-chapter'
    currentRoute.params = { chapter: 'unknown-nonexistent-chapter' }

    const wrapper = mount(CosmosCenter, mountOptions)
    expect(wrapper.text()).toContain('没有找到这个章节')
    expect(wrapper.text()).toContain('返回知识总览')
  })

  it('renders a real chapter with objectives, formulas and chapter-specific pedagogy notes', async () => {
    currentRoute.path = '/cosmos/chapter/strings-origins'
    currentRoute.params = { chapter: 'strings-origins' }

    teacher.value = true // enable teacher mode
    const wrapper = mount(CosmosCenter, mountOptions)

    expect(wrapper.text()).toContain('D1. 弦理论的提出背景')
    expect(wrapper.text()).toContain('学习目标与先修知识')
    expect(wrapper.text()).toContain('关键公式与符号含义')
    expect(wrapper.text()).toContain('常见误区辨析')

    // Verified chapter-specific pedagogy notes
    expect(wrapper.find('.cx-teacher').exists()).toBe(true)
    expect(wrapper.text()).toContain('《D1. 弦理论的提出背景：从强子散射到量子引力》教学设计')
    expect(wrapper.text()).toContain('5 分钟导入预测')
    expect(wrapper.text()).toContain('10 分钟概念探讨')
    expect(wrapper.text()).toContain('45 分钟完整课时组织')
  })

  it('renders previous and next pagination controls', () => {
    currentRoute.path = '/cosmos/chapter/strings-basics'
    currentRoute.params = { chapter: 'strings-basics' }

    const wrapper = mount(CosmosCenter, mountOptions)
    const pagination = wrapper.find('.cx-chapter-pagination')
    expect(pagination.exists()).toBe(true)
    expect(wrapper.find('.cx-page-prev').exists()).toBe(true)
    expect(wrapper.find('.cx-page-next').exists()).toBe(true)
  })
})
