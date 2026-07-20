import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LearningSection from '../LearningSection.vue'
import componentSource from '../LearningSection.vue?raw'

describe('LearningSection', () => {
  it('toggles content with an accessible button', async () => {
    const wrapper = mount(LearningSection, {
      props: { id: 'core', title: '核心知识', defaultOpen: false },
      slots: { default: '知识正文' },
    })
    const button = wrapper.get('button')

    expect(button.attributes('aria-expanded')).toBe('false')
    expect(button.attributes('aria-controls')).toBe('core-content')
    expect(button.text()).toContain('展开核心知识')
    expect(wrapper.get('#core-content').attributes('style')).toContain('display: none')

    await button.trigger('click')

    expect(button.attributes('aria-expanded')).toBe('true')
    expect(button.text()).toContain('收起核心知识')
    expect(wrapper.get('#core-content').attributes('style')).not.toContain('display: none')
  })

  it('keeps the toggle large enough and gives keyboard focus a visible outline', () => {
    expect(componentSource).toMatch(/\.learning-section__toggle\s*\{[^}]*min-height:\s*40px/s)
    expect(componentSource).toMatch(/\.learning-section__toggle:focus-visible\s*\{[^}]*outline:\s*2px/s)
  })
})
