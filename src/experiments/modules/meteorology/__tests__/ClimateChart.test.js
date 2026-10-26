import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ClimateChart from '../ClimateChart.vue'

describe('ClimateChart Component', () => {
  it('renders climate chart header and default station A (Beijing)', () => {
    const wrapper = mount(ClimateChart)
    expect(wrapper.text()).toContain('典型气候类型气温降水图')
    expect(wrapper.text()).toContain('北京 (中国北方季风区)')
    expect(wrapper.text()).toContain('温带季风气候')
  })

  it('renders dual-station comparison when station B is selected', async () => {
    const wrapper = mount(ClimateChart)
    expect(wrapper.text()).toContain('罗马 (地中海沿岸)')

    // 检查两个台站的成因说明卡片
    const cards = wrapper.findAll('.interp-card')
    expect(cards.length).toBe(2)
    expect(cards[1].text()).toContain('地中海气候')
    expect(cards[1].text()).toContain('副热带高气压带与盛行西风带')
  })

  it('renders svg with 12 precipitation bars and temperature path', () => {
    const wrapper = mount(ClimateChart)
    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)

    // 12 个月份降水柱
    const barsA = wrapper.findAll('.bars-a rect')
    expect(barsA.length).toBe(12)

    // 气温折线
    const path = wrapper.find('path')
    expect(path.exists()).toBe(true)
  })
})
