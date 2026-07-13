// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ExperimentsHome from './ExperimentsHome.vue'

function mountHome() {
  return mount(ExperimentsHome, {
    global: {
      stubs: {
        'router-link': {
          props: ['to'],
          template: '<a :data-to="to"><slot /></a>'
        }
      }
    }
  })
}

describe('ExperimentsHome', () => {
  it('lists all experiment resources by default', () => {
    const wrapper = mountHome()

    expect(wrapper.text()).toContain('19 个实验')
    expect(wrapper.text()).toContain('热力环流模拟实验')
    expect(wrapper.text()).toContain('月相模拟实验')
  })

  it('filters resources by search text', async () => {
    const wrapper = mountHome()

    await wrapper.get('[data-testid="experiment-search"]').setValue('水循环')

    expect(wrapper.text()).toContain('水循环袋实验')
    expect(wrapper.text()).not.toContain('断层与褶皱模拟')
  })

  it('combines grade, book, category, and type filters', async () => {
    const wrapper = mountHome()

    await wrapper.get('[data-testid="grade-filter"]').setValue('高中')
    await wrapper.get('[data-testid="book-filter"]').setValue('必修第一册')
    await wrapper.get('[data-testid="category-filter"]').setValue('meteorology')
    await wrapper.get('[data-testid="type-filter"]').setValue('3d')

    const cards = wrapper.findAll('[data-testid="experiment-card"]')
    expect(cards).toHaveLength(2)
    expect(cards.map((card) => card.text())).toEqual(expect.arrayContaining([
      expect.stringContaining('热力环流模拟实验'),
      expect.stringContaining('科里奥利力旋转水槽实验')
    ]))
  })

  it('shows an empty state and restores results when filters are cleared', async () => {
    const wrapper = mountHome()

    await wrapper.get('[data-testid="experiment-search"]').setValue('没有这样的实验')

    expect(wrapper.get('[data-testid="experiment-empty"]').text()).toContain('没有找到匹配的实验')

    await wrapper.get('[data-testid="clear-filters"]').trigger('click')

    expect(wrapper.text()).toContain('19 个实验')
    expect(wrapper.find('[data-testid="experiment-empty"]').exists()).toBe(false)
  })
})
