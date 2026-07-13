// @vitest-environment jsdom
import { flushPromises, mount } from '@vue/test-utils'
import { reactive } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const route = reactive({
  params: {
    grade: '高中',
    book: '必修第一册',
    chapter: '第二章',
    section: '第二节',
  },
})

const { getChapter, getSection, loadSectionContent } = vi.hoisted(() => ({
  getChapter: vi.fn(),
  getSection: vi.fn(),
  loadSectionContent: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRoute: () => route,
}))

vi.mock('./data/catalogLoader.js', () => ({ getChapter, getSection }))
vi.mock('./data/contentLoader.js', () => ({ loadSectionContent }))

vi.mock('../sandbox/SandboxApp.vue', () => ({ default: { template: '<div />' } }))
vi.mock('../sandbox/Earth3D.vue', () => ({ default: { template: '<div />' } }))
vi.mock('../soil-profile/SoilProfilePage.vue', () => ({ default: { template: '<div />' } }))
vi.mock('./components/AtmosphereViewer.vue', () => ({ default: { template: '<div />' } }))
vi.mock('./components/MindMapViewer.vue', () => ({ default: { template: '<div />' } }))
vi.mock('./components/DataVizViewer.vue', () => ({ default: { template: '<div />' } }))
vi.mock('../engine/WaterCycleView.vue', () => ({ default: { template: '<div />' } }))
vi.mock('../sandbox/DisasterSandbox.vue', () => ({ default: { template: '<div />' } }))

import SectionContent from './SectionContent.vue'

const sections = {
  第一节: { id: '第一节', title: '大气的组成和垂直分层', content: { keyPoints: [] } },
  第二节: { id: '第二节', title: '大气受热过程和大气运动', content: { keyPoints: [] } },
}

function mountSection() {
  return mount(SectionContent, {
    global: {
      stubs: {
        'router-link': {
          props: ['to'],
          template: '<a><slot /></a>',
        },
      },
    },
  })
}

describe('SectionContent', () => {
  beforeEach(() => {
    route.params.grade = '高中'
    route.params.book = '必修第一册'
    route.params.chapter = '第二章'
    route.params.section = '第二节'
    getChapter.mockResolvedValue({
      id: '第二章',
      title: '地球上的大气',
      sections: [sections.第一节, sections.第二节],
    })
    getSection.mockImplementation(async (_grade, _book, _chapter, section) => sections[section])
    loadSectionContent.mockResolvedValue({
      conceptDefinitions: {
        大气运动: { 高中: '大气受热不均会形成热力环流。' },
      },
    })
  })

  it('shows linked experiments directly after the lesson brief and removes them for unlinked sections', async () => {
    const wrapper = mountSection()

    await flushPromises()

    expect(wrapper.text()).toContain('相关实验')
    expect(wrapper.text()).toContain('热力环流模拟实验')
    expect(wrapper.get('.lesson-brief').element.nextElementSibling).toBe(
      wrapper.get('.related-experiments-row').element
    )

    route.params.section = '第一节'
    await flushPromises()

    expect(wrapper.text()).not.toContain('相关实验')
    expect(wrapper.find('.related-experiments-row').exists()).toBe(false)
  })
})
