import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SectionContent from './SectionContent.vue'
import componentSource from './SectionContent.vue?raw'

const mocks = vi.hoisted(() => ({
  loadedContent: null,
  loadSectionContent: vi.fn(),
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
  loadSectionContent: mocks.loadSectionContent,
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

const validStudentLearning = {
  overview: '从地球所处的宇宙环境开始学习。',
  objectives: ['说明地球的普通性和特殊性'],
  knowledgeBlocks: [{
    title: '地球的宇宙环境',
    items: [{ name: '生命条件', detail: '适宜温度、液态水和适宜大气。' }],
  }],
}

async function mountSection({ props = {}, stubEarth = true } = {}) {
  const wrapper = mount(SectionContent, {
    props,
    global: {
      stubs: {
        RouterLink: { template: '<a><slot /></a>' },
        StudentLearningView: StudentLearningViewStub,
        ...(stubEarth ? { Earth3D: Earth3DStub } : {}),
      },
    },
  })
  await flushPromises()
  return wrapper
}

describe('SectionContent student learning integration', () => {
  beforeEach(() => {
    mocks.loadedContent = null
    mocks.loadSectionContent.mockImplementation(async () => mocks.loadedContent)
  })

  it('replaces the legacy lesson brief and opens an existing tool branch', async () => {
    mocks.loadedContent = {
      studentLearning: validStudentLearning,
    }

    const wrapper = await mountSection()
    const learningView = wrapper.findComponent({ name: 'StudentLearningView' })

    expect(learningView.exists()).toBe(true)
    expect(wrapper.find('.lesson-brief').exists()).toBe(false)
    expect(wrapper.find('.read-time').exists()).toBe(false)
    expect(learningView.props('tools')).toContainEqual(expect.objectContaining({ id: 'earth' }))

    await learningView.vm.$emit('open-tool', 'earth')
    await flushPromises()

    expect(wrapper.findComponent({ name: 'Earth3D' }).exists()).toBe(true)
  })

  it('falls back to the legacy lesson brief without a student learning overlay', async () => {
    const wrapper = await mountSection()

    expect(wrapper.findComponent({ name: 'StudentLearningView' }).exists()).toBe(false)
    expect(wrapper.find('.lesson-brief').exists()).toBe(true)
    expect(wrapper.get('.read-time').text()).toContain('约 1 分钟')
  })

  it('uses the legacy lesson brief when the student learning overlay is invalid', async () => {
    mocks.loadedContent = {
      studentLearning: {
        objectives: ['说明地球的普通性'],
        overview: '缺少可用核心知识。',
        knowledgeBlocks: [{ title: '无效知识块', items: [null] }],
      },
    }

    const wrapper = await mountSection()

    expect(wrapper.findComponent({ name: 'StudentLearningView' }).exists()).toBe(false)
    expect(wrapper.find('.lesson-brief').exists()).toBe(true)
  })

  it('clears loading and preserves base section content when optional content loading rejects', async () => {
    mocks.loadSectionContent.mockRejectedValueOnce(new Error('optional overlay unavailable'))

    const wrapper = await mountSection()

    expect(wrapper.text()).not.toContain('加载中...')
    expect(wrapper.text()).toContain('第一节 地球的宇宙环境')
    expect(wrapper.find('.lesson-brief').exists()).toBe(true)
  })

  it('shows async-module recovery and returns to the student text after close', async () => {
    mocks.loadedContent = { studentLearning: validStudentLearning }
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = await mountSection({
      stubEarth: false,
      props: {
        toolLoaders: {
          earth: async () => { throw new Error('earth module unavailable') },
        },
      },
    })

    await wrapper.getComponent({ name: 'StudentLearningView' }).vm.$emit('open-tool', 'earth')
    await flushPromises()

    expect(wrapper.get('[data-async-module-error]').text()).toContain('教学工具加载失败')
    await wrapper.get('[data-async-module-error] button').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-async-module-error]').exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'StudentLearningView' }).exists()).toBe(true)
    consoleError.mockRestore()
  })

  it('keeps the student article within the reading measure and reduces narrow-screen padding', () => {
    expect(componentSource).toMatch(/\.content\s+:deep\(\[data-student-learning-view\]\)\s*\{[^}]*max-width:\s*860px/s)
    expect(componentSource).toMatch(/@media\s*\(max-width:\s*720px\)[\s\S]*\.content\s*\{[^}]*padding:\s*16px\s+12px/s)
  })
})
