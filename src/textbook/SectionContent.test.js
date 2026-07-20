import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SectionContent from './SectionContent.vue'
import componentSource from './SectionContent.vue?raw'

const mocks = vi.hoisted(() => ({
  loadedContent: null,
  route: {
    params: {
      grade: '高中',
      book: '必修第一册',
      chapter: '第一章',
      section: '第一节',
    },
  },
}))

vi.mock('vue-router', () => ({
  useRoute: () => mocks.route,
}))

vi.mock('./data/catalogLoader.js', () => ({
  getChapter: vi.fn(async () => ({
    id: '第一章',
    title: '宇宙中的地球',
    sections: [{ id: '第一节', title: '地球的宇宙环境' }],
  })),
  getSection: vi.fn(async () => ({
    id: '第一节',
    title: '地球的宇宙环境',
  })),
}))

vi.mock('./data/contentLoader.js', () => ({
  loadSectionContent: vi.fn(async () => mocks.loadedContent),
}))

const StudentLearningViewStub = {
  name: 'StudentLearningView',
  props: ['learning', 'sectionTitle', 'chapterTitle', 'tools'],
  emits: ['open-tool'],
  template: '<div data-student-learning-view />',
}

const Earth3DStub = {
  name: 'Earth3D',
  template: '<div data-earth-3d />',
}

async function mountSection() {
  const wrapper = mount(SectionContent, {
    global: {
      stubs: {
        RouterLink: { template: '<a><slot /></a>' },
        StudentLearningView: StudentLearningViewStub,
        Earth3D: Earth3DStub,
      },
    },
  })
  await flushPromises()
  return wrapper
}

describe('SectionContent student learning integration', () => {
  beforeEach(() => {
    mocks.loadedContent = null
  })

  it('replaces the legacy lesson brief and opens an existing tool branch', async () => {
    mocks.loadedContent = {
      studentLearning: {
        overview: '从地球所处的宇宙环境开始学习。',
        objectives: ['说明地球的普通性和特殊性'],
      },
    }

    const wrapper = await mountSection()
    const learningView = wrapper.findComponent({ name: 'StudentLearningView' })

    expect(learningView.exists()).toBe(true)
    expect(wrapper.find('.lesson-brief').exists()).toBe(false)
    expect(learningView.props('tools')).toContainEqual(expect.objectContaining({ id: 'earth' }))

    await learningView.vm.$emit('open-tool', 'earth')
    await flushPromises()

    expect(wrapper.findComponent({ name: 'Earth3D' }).exists()).toBe(true)
  })

  it('falls back to the legacy lesson brief without a student learning overlay', async () => {
    const wrapper = await mountSection()

    expect(wrapper.findComponent({ name: 'StudentLearningView' }).exists()).toBe(false)
    expect(wrapper.find('.lesson-brief').exists()).toBe(true)
  })

  it('keeps the student article within the reading measure and reduces narrow-screen padding', () => {
    expect(componentSource).toMatch(/\.content\s+:deep\(\[data-student-learning-view\]\)\s*\{[^}]*max-width:\s*860px/s)
    expect(componentSource).toMatch(/@media\s*\(max-width:\s*720px\)[\s\S]*\.content\s*\{[^}]*padding:\s*16px\s+12px/s)
  })
})
