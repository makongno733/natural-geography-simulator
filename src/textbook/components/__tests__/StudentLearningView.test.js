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
