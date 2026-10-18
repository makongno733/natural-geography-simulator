import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HumanEnvironmentDecisionSim from './HumanEnvironmentDecisionSim.vue'

describe('HumanEnvironmentDecisionSim Component', () => {
  it('renders multi-objective decision controls and radar chart', () => {
    const wrapper = mount(HumanEnvironmentDecisionSim)
    expect(wrapper.text()).toContain('临江特大重化工业基地区位重塑与生态红线决策台')
    expect(wrapper.find('svg.radar-svg').exists()).toBe(true)
    expect(wrapper.text()).toContain('利益相关方冲突证据档案')
  })

  it('allows switching between 3 decision plans and displays tradeoffs', async () => {
    const wrapper = mount(HumanEnvironmentDecisionSim)
    const planButtons = wrapper.findAll('.btn-plan-select')
    expect(planButtons.length).toBe(3)

    // Switch to Plan 1: Onsite Green
    await planButtons[0].trigger('click')
    expect(wrapper.text()).toContain('方案一：就地绿色升级')
    expect(wrapper.text()).toContain('核心得失与代价')

    // Switch to Plan 2: Coastal Relocation
    await planButtons[1].trigger('click')
    expect(wrapper.text()).toContain('方案二：沿海港区整体搬迁')
  })

  it('captures a decision trade-off evidence card', async () => {
    const wrapper = mount(HumanEnvironmentDecisionSim)
    const captureBtn = wrapper.find('.btn-capture')
    expect(captureBtn.exists()).toBe(true)

    await captureBtn.trigger('click')
    const emitted = wrapper.emitted('capture')
    expect(emitted).toBeTruthy()

    const card = emitted[0][0]
    expect(card.title).toContain('决策推演')
    expect(card.params.推选方案).toBeDefined()
    expect(card.observation).toContain('【情境推演矩阵结果】')
    expect(card.inference).toContain('【决策取舍论证】')
  })
})
