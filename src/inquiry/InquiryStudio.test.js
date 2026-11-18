import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import InquiryStudio from './InquiryStudio.vue'
import { initInquiryStore } from './inquiryStore.js'

describe('InquiryStudio Hub Page', () => {
  let router

  beforeEach(async () => {
    initInquiryStore()
    router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/inquiry', component: InquiryStudio }]
    })
    router.push('/inquiry')
    await router.isReady()
  })

  it('renders top hub hero and 5 navigation tabs', () => {
    const wrapper = mount(InquiryStudio, {
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.text()).toContain('地理创新探究中心')
    const tabs = wrapper.findAll('.tab-btn')
    expect(tabs.length).toBe(5)
    expect(wrapper.text()).toContain('学生探究工作台')
    expect(wrapper.text()).toContain('三大旗舰探究课题')
    expect(wrapper.text()).toContain('教师工作台与量规')
    expect(wrapper.text()).toContain('课堂展示墙')
    expect(wrapper.text()).toContain('5-7分钟发布会演练')
  })

  it('switches to flagship tasks overview tab', async () => {
    const wrapper = mount(InquiryStudio, {
      global: {
        plugins: [router]
      }
    })

    const tabs = wrapper.findAll('.tab-btn')
    await tabs[1].trigger('click')
    expect(wrapper.text()).toContain('三个真正做透的旗舰精品探究')
    expect(wrapper.text()).toContain('城市为什么会“看海”')
    expect(wrapper.text()).toContain('多时相遥感')
    expect(wrapper.text()).toContain('生态红线决策')
  })

  it('switches to showcase wall tab', async () => {
    const wrapper = mount(InquiryStudio, {
      global: {
        plugins: [router]
      }
    })

    const tabs = wrapper.findAll('.tab-btn')
    await tabs[3].trigger('click')
    expect(wrapper.text()).toContain('探究成果展示墙')
    expect(wrapper.text()).toContain('真实学生作品暂不公开')
  })

  it('presents focused 3-minute compare mode when entered with mode=compare, and expands full 6-step workbench on demand', async () => {
    await router.push('/inquiry?task=urban-flood&mode=compare&rain=50&duration=60&slope=2&surfaceA=concrete&surfaceB=vegetation')
    const wrapper = mount(InquiryStudio, {
      global: {
        plugins: [router]
      }
    })

    // Focused bar is shown instead of the 5-tab hero
    expect(wrapper.find('.focused-compare-header').exists()).toBe(true)
    expect(wrapper.findAll('.tab-btn').length).toBe(0)
    expect(wrapper.text()).toContain('同一场雨，哪种路面积水更严重？')

    // Clicking expand reveals the full 5-tab hub and 6-step workbench
    const expandBtn = wrapper.find('[data-testid="expand-full-studio-btn"]')
    expect(expandBtn.exists()).toBe(true)
    await expandBtn.trigger('click')
    expect(wrapper.findAll('.tab-btn').length).toBe(5)
    expect(wrapper.find('.step-nav').exists()).toBe(true)
  })
})
