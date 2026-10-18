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
})
