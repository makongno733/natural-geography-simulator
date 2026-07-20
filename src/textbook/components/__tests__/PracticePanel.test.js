import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PracticePanel from '../PracticePanel.vue'

const questions = [
  {
    type: 'single-choice',
    question: '地面直接加热谁？',
    options: ['A. 大气', 'B. 太阳'],
    answer: 'A',
    explanation: '地面长波辐射是近地面大气主要直接热源。',
    knowledgePoint: '大气受热过程',
  },
  {
    type: 'short-answer',
    question: '说明热力环流过程。',
    answer: '冷热不均导致大气垂直和水平运动。',
    explanation: '按四步因果链作答。',
    knowledgePoint: '热力环流',
  },
]

describe('PracticePanel', () => {
  it('keeps answers hidden until requested and preserves the learner choice', async () => {
    const wrapper = mount(PracticePanel, { props: { questions } })

    expect(wrapper.text()).not.toContain('地面长波辐射')
    await wrapper.get('input[value="A"]').setValue(true)
    await wrapper.findAll('[data-reveal-answer]')[0].trigger('click')

    expect(wrapper.text()).toContain('正确答案：A')
    expect(wrapper.text()).toContain('地面长波辐射')
    expect(wrapper.get('input[value="A"]').element.checked).toBe(true)
  })

  it('reveals a short-answer reference independently', async () => {
    const wrapper = mount(PracticePanel, { props: { questions } })

    await wrapper.findAll('[data-reveal-answer]')[1].trigger('click')

    expect(wrapper.text()).toContain('冷热不均导致大气垂直和水平运动')
    expect(wrapper.text()).not.toContain('正确答案：A')
  })
})
