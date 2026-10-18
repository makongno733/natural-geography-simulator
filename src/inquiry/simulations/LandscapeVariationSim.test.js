import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LandscapeVariationSim from './LandscapeVariationSim.vue'

describe('LandscapeVariationSim Component', () => {
  it('renders Poyang lake satellite simulation and station data', () => {
    const wrapper = mount(LandscapeVariationSim)
    expect(wrapper.text()).toContain('鄱阳湖水陆变迁')
    expect(wrapper.text()).toContain('星子站')
    expect(wrapper.find('svg.rs-svg').exists()).toBe(true)
    expect(wrapper.find('svg.profile-svg').exists()).toBe(true)
  })

  it('switches month presets and updates water level and area', async () => {
    const wrapper = mount(LandscapeVariationSim)
    const presetButtons = wrapper.findAll('.btn-preset')
    expect(presetButtons.length).toBe(3)

    // Click 1月冬春枯水期
    await presetButtons[1].trigger('click')
    expect(wrapper.text()).toContain('枯水期')
    expect(wrapper.text()).toContain('9.2 m')

    // Click 7月夏汛丰水期
    await presetButtons[0].trigger('click')
    expect(wrapper.text()).toContain('主汛期')
    expect(wrapper.text()).toContain('20.8 m')
  })

  it('captures an evidence card with satellite and hydrological station facts', async () => {
    const wrapper = mount(LandscapeVariationSim)
    const captureBtn = wrapper.find('.btn-capture')
    expect(captureBtn.exists()).toBe(true)

    await captureBtn.trigger('click')
    const emitted = wrapper.emitted('capture')
    expect(emitted).toBeTruthy()

    const card = emitted[0][0]
    expect(card.title).toContain('情境推演证据')
    expect(card.params.情境基准水位).toBeDefined()
    expect(card.observation).toContain('【情境推演与矢量示意观察】')
    expect(card.inference).toContain('【因果推断】')
    expect(card.confidence).toBe(4)
  })
})
