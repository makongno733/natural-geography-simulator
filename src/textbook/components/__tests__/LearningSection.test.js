import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LearningSection from '../LearningSection.vue'

describe('LearningSection', () => {
  it('toggles content with an accessible button', async () => {
    const wrapper = mount(LearningSection, {
      props: { id: 'core', title: '核心知识', defaultOpen: false },
      slots: { default: '知识正文' },
    })
    const button = wrapper.get('button')

    expect(button.attributes('aria-expanded')).toBe('false')
    expect(wrapper.text()).not.toContain('知识正文')

    await button.trigger('click')

    expect(button.attributes('aria-expanded')).toBe('true')
    expect(wrapper.text()).toContain('知识正文')
  })
})
