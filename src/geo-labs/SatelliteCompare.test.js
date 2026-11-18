import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SatelliteCompare from './SatelliteCompare.vue'

vi.mock('maplibre-gl', () => {
  return {
    Map: class MockMap {
      constructor() {}
      on() {}
      remove() {}
      getCenter() { return { lng: 112, lat: 31 } }
      getZoom() { return 4 }
      getBearing() { return 0 }
      getPitch() { return 0 }
      jumpTo() {}
    }
  }
})

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() })
}))

const mountOpts = {
  global: {
    stubs: {
      'router-link': {
        template: '<a><slot /></a>'
      }
    }
  }
}

describe('SatelliteCompare Observation Integrity & Sample Disclosure', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
  })

  it('does not auto-generate deterministic observation conclusions before user input', () => {
    const wrapper = mount(SatelliteCompare, mountOpts)
    const input = wrapper.find('#sat-observation-input')
    expect(input.element.value).toBe('')

    const factsText = wrapper.find('[data-testid="sat-evidence-facts"]').text()
    expect(factsText).toContain('尚未填写具体观察结论')
    expect(factsText).not.toContain('梅雨锋')
    expect(factsText).not.toContain('湖泊水体边界较左侧有所扩张')
  })

  it('provides place-specific sentence scaffolds with [填写...] blanks and never applies Meiyu claims to Amazon or Himalaya', async () => {
    const wrapper = mount(SatelliteCompare, mountOpts)
    const placeSelect = wrapper.find('select[aria-label="选择观测地点"]')

    await placeSelect.setValue('amazon')
    const chips = wrapper.findAll('.wb-chip')
    expect(chips.length).toBeGreaterThanOrEqual(3)
    await chips[0].trigger('click')

    const inputVal = wrapper.find('#sat-observation-input').element.value
    expect(inputVal).toContain('亚马孙')
    expect(inputVal).toContain('[填写')
    expect(inputVal).not.toContain('梅雨锋')

    await placeSelect.setValue('himalaya')
    const himalayaChips = wrapper.findAll('.wb-chip')
    await himalayaChips[0].trigger('click')
    const himalayaVal = wrapper.find('#sat-observation-input').element.value
    expect(himalayaVal).toContain('喜马拉雅')
    expect(himalayaVal).toContain('[填写')
    expect(himalayaVal).not.toContain('梅雨锋')
  })

  it('flags existing user observation for review when place or date changes instead of packaging old observation as new fact', async () => {
    const wrapper = mount(SatelliteCompare, mountOpts)
    const input = wrapper.find('#sat-observation-input')

    await input.setValue('长江中下游无云区可见部分湖泊水体色调较左侧略深。')
    await input.trigger('input')

    expect(wrapper.find('[data-testid="sat-observation-review-alert"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="sat-evidence-facts"]').text()).toContain('长江中下游无云区可见部分湖泊水体色调较左侧略深。')

    // Switch place to Amazon
    const placeSelect = wrapper.find('select[aria-label="选择观测地点"]')
    await placeSelect.setValue('amazon')

    const alertBox = wrapper.find('[data-testid="sat-observation-review-alert"]')
    expect(alertBox.exists()).toBe(true)
    expect(alertBox.text()).toContain('中国东部 · 2024-06-01 vs 2024-06-15')

    // Evidence card must not present the unconfirmed China observation as a confirmed fact of Amazon
    const factsAfterSwitch = wrapper.find('[data-testid="sat-evidence-facts"]').text()
    expect(factsAfterSwitch).toContain('原观察草稿对应旧条件')
    expect(factsAfterSwitch).not.toContain('长江中下游无云区可见部分湖泊水体色调较左侧略深。')

    // Confirming updates the context
    await wrapper.find('[data-testid="confirm-observation-context-btn"]').trigger('click')
    expect(wrapper.find('[data-testid="sat-observation-review-alert"]').exists()).toBe(false)
  })

  it('accurately labels evidence card as built-in annotated teaching illustration when sample fallback mode is active', async () => {
    const wrapper = mount(SatelliteCompare, mountOpts)
    const sampleBtn = wrapper.find('.btn-toggle-sample')
    await sampleBtn.trigger('click')

    const cardText = wrapper.find('#sat-evidence-card').text()
    expect(cardText).toContain('内置标注教学示意图')
    expect(cardText).toContain('非实时 NASA 卫星瓦片')
  })
})
