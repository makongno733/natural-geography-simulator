import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UrbanFloodSim from './UrbanFloodSim.vue'
import {
  computeUrbanFloodMetrics,
  buildComparisonEvidenceCard,
  serializeUrbanFloodShareQuery,
  parseUrbanFloodShareQuery
} from './urbanFloodModel.js'

const mountOpts = {
  global: {
    stubs: {
      'router-link': {
        template: '<a><slot /></a>'
      }
    }
  }
}

describe('UrbanFloodSim Component & Reproducible Model', () => {
  it('renders simulation controls, 3-minute guided comparison, and SVG stages', () => {
    const wrapper = mount(UrbanFloodSim, mountOpts)
    expect(wrapper.text()).toContain('城市暴雨产流与海绵下渗仿真实验台')
    expect(wrapper.text()).toContain('同一场雨，哪种路面积水更严重？')
    expect(wrapper.text()).toContain('教学仿真，非现场实测')
    expect(wrapper.find('svg.profile-svg').exists()).toBe(true)
    expect(wrapper.find('svg.hydro-svg').exists()).toBe(true)
  })

  it('verifies 50 mm/h, 60 min, 2° slope baseline readings: concrete 44.4 m³/s (6m) vs vegetation 11.7 m³/s (36m, +30m delay)', () => {
    const concrete = computeUrbanFloodMetrics({ surface: 'concrete', rainIntensity: 50, rainDuration: 60, slope: 2 })
    const vegetation = computeUrbanFloodMetrics({ surface: 'vegetation', rainIntensity: 50, rainDuration: 60, slope: 2 })
    const sponge = computeUrbanFloodMetrics({ surface: 'sponge', rainIntensity: 50, rainDuration: 60, slope: 2, spongeCapacity: 25 })

    expect(concrete.peakDischarge).toBe(44.4)
    expect(concrete.infiltrationPercent).toBe(5)
    expect(concrete.timeToPeak).toBe(6)
    expect(concrete.refTimeToPeak).toBe(6)
    expect(concrete.peakDelayMinutes).toBe(0)

    expect(vegetation.peakDischarge).toBe(11.7)
    expect(vegetation.infiltrationPercent).toBe(75)
    expect(vegetation.timeToPeak).toBe(36)
    expect(vegetation.refTimeToPeak).toBe(6)
    expect(vegetation.peakDelayMinutes).toBe(30)

    expect(sponge.peakDischarge).toBe(30.4)
    expect(sponge.timeToPeak).toBe(22)
    expect(sponge.refTimeToPeak).toBe(6)
    expect(sponge.peakDelayMinutes).toBe(16)
  })

  it('guarantees concrete self-delay is 0 and delay equals timeToPeak minus same-slope concrete across all slopes 1°..8°', () => {
    for (let s = 1; s <= 8; s += 1) {
      const concrete = computeUrbanFloodMetrics({ surface: 'concrete', slope: s })
      const sponge = computeUrbanFloodMetrics({ surface: 'sponge', slope: s })
      const vegetation = computeUrbanFloodMetrics({ surface: 'vegetation', slope: s })

      expect(concrete.peakDelayMinutes).toBe(0)
      expect(concrete.timeToPeak).toBe(concrete.refTimeToPeak)
      expect(sponge.peakDelayMinutes).toBe(sponge.timeToPeak - concrete.timeToPeak)
      expect(vegetation.peakDelayMinutes).toBe(vegetation.timeToPeak - concrete.timeToPeak)
    }
  })

  it('renders +30 分钟 peak delay in the UI at standard conditions and updates consistently across presets', async () => {
    const wrapper = mount(UrbanFloodSim, mountOpts)
    const delayEl = wrapper.find('[data-testid="peak-delay-val"]')
    expect(delayEl.exists()).toBe(true)
    expect(delayEl.text()).toBe('+30 分钟')

    const presetButtons = wrapper.findAll('.btn-preset')
    expect(presetButtons.length).toBe(3)

    // Apply sponge city preset (22 min vs 6 min concrete = +16 min)
    await presetButtons[1].trigger('click')
    expect(wrapper.text()).toContain('海绵透水铺装')
    expect(wrapper.text()).toContain('相对硬化削峰率')
    expect(delayEl.text()).toBe('+16 分钟')

    // Apply traditional concrete preset (6 min vs 6 min concrete = +0 min)
    await presetButtons[0].trigger('click')
    expect(delayEl.text()).toBe('+0 分钟')
  })

  it('captures an evidence card with model name, conditions, two results, units, limitations, and simulation disclaimer', async () => {
    const wrapper = mount(UrbanFloodSim, mountOpts)
    const captureBtn = wrapper.find('.btn-capture')
    expect(captureBtn.exists()).toBe(true)

    await captureBtn.trigger('click')
    const emitted = wrapper.emitted('capture')
    expect(emitted).toBeTruthy()
    expect(emitted[0][0]).toBeDefined()

    const card = emitted[0][0]
    expect(card.title).toContain('实验记录')
    expect(card.params.地表材质).toBeDefined()
    expect(card.params.证据类型).toContain('教学仿真，非现场实测')
    expect(card.params.达峰与延缓).toContain('36 分钟（较同条件水泥基准 6 分钟延缓 +30 分钟）')
    expect(card.observation).toContain('【仿真模型计算结果')
    expect(card.observation).toContain('44.4 m³/s')
    expect(card.observation).toContain('11.7 m³/s')
    expect(card.observation).toContain('延缓 +30 分钟')
    expect(card.inference).toContain('【因果推断】')
    expect(card.limitations).toContain('适用边界')
    expect(card.confidence).toBeGreaterThanOrEqual(1)
  })

  it('round-trips share query parameters without leaking private data and builds reproducible comparison card', () => {
    const query = serializeUrbanFloodShareQuery({
      surfaceA: 'concrete',
      surfaceB: 'vegetation',
      rainIntensity: 50,
      rainDuration: 60,
      slope: 2,
      guess: 'concrete',
      claim: '天然植被下渗率高，显著降低洪峰流量。'
    })

    const parsed = parseUrbanFloodShareQuery(query)
    expect(parsed.isShared).toBe(true)
    expect(parsed.rainIntensity).toBe(50)
    expect(parsed.rainDuration).toBe(60)
    expect(parsed.surfaceA).toBe('concrete')
    expect(parsed.surfaceB).toBe('vegetation')
    expect(parsed.guess).toBe('concrete')
    expect(parsed.claim).toBe('天然植被下渗率高，显著降低洪峰流量。')

    const card = buildComparisonEvidenceCard(parsed)
    expect(card.groupA.peakDischarge).toBe(44.4)
    expect(card.groupA.peakDelayMinutes).toBe(0)
    expect(card.groupB.peakDischarge).toBe(11.7)
    expect(card.groupB.peakDelayMinutes).toBe(30)
    expect(card.peakDelayDiff).toBe(30)
    expect(card.disclaimer).toBe('教学仿真，非现场实测')
    expect(card.limitations).toContain('适用边界')
  })
})
