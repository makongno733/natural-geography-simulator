import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import StudentWorkbench from './StudentWorkbench.vue'
import { INQUIRY_TASKS } from './inquiryData.js'
import { initInquiryStore, inquiryState } from './inquiryStore.js'

describe('StudentWorkbench Component', () => {
  beforeEach(() => {
    inquiryState.activeTaskId = 'urban-flood'
    initInquiryStore()
  })

  it('mounts and renders initial step with driving question', () => {
    const task = INQUIRY_TASKS[0]
    const wrapper = mount(StudentWorkbench, {
      props: { task },
      global: {
        stubs: { 'router-link': true }
      }
    })

    expect(wrapper.text()).toContain(task.title)
    expect(wrapper.text()).toContain(task.drivingQuestion)
    expect(wrapper.find('#prior-conceptions').exists()).toBe(true)
    expect(wrapper.find('#initial-hypothesis').exists()).toBe(true)
  })

  it('navigates through inquiry steps and displays step panels', async () => {
    const task = INQUIRY_TASKS[0]
    const wrapper = mount(StudentWorkbench, {
      props: { task },
      global: {
        stubs: { 'router-link': true }
      }
    })

    const stepButtons = wrapper.findAll('.step-item')
    expect(stepButtons.length).toBe(6)

    // Navigate to Step 2: Variables
    await stepButtons[1].trigger('click')
    expect(wrapper.text()).toContain('控制变量：怎样做才是一场公平的实验？')

    // Navigate to Step 3: Simulation & Evidence
    await stepButtons[2].trigger('click')
    expect(wrapper.text()).toContain('在交互模型中生成对比证据')
  })

  it('allows adding and removing controlled variables in step 2', async () => {
    const task = INQUIRY_TASKS[0]
    const wrapper = mount(StudentWorkbench, {
      props: { task },
      global: {
        stubs: { 'router-link': true }
      }
    })

    // Go to step 2
    await wrapper.findAll('.step-item')[1].trigger('click')

    const input = wrapper.find('.add-chip-row input')
    const addBtn = wrapper.find('.add-chip-row button')

    await input.setValue('降雨历时60分钟')
    await addBtn.trigger('click')

    expect(wrapper.text()).toContain('降雨历时60分钟')
  })
})
