import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ModelPedagogyPanel from '../ModelPedagogyPanel.vue'

describe('ModelPedagogyPanel', () => {
  it('renders pedagogy four core sections: observe, change, mechanism, limitations', () => {
    const wrapper = mount(ModelPedagogyPanel, {
      props: {
        theme: 'astronomy',
        observe: ['观察月相盈亏', '观察地月中天位置'],
        change: ['拖动月球轨道角度', '切换不同农历预设'],
        mechanism: '月球绕地球公转，由于日地月相对几何位置改变，地球上看到的被照亮部分比例不断变化。',
        limitations: ['忽略白道与黄道夹角', '假定月球绕地公转为正圆'],
        realDataLab: {
          title: '卫星影像对比',
          path: '/geo-labs/satellite',
        },
        textbookLink: {
          grade: '高中',
          book: '必修第一册',
          chapter: '第一章',
          section: '第一节',
        },
      },
      global: {
        stubs: {
          RouterLink: {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
        },
      },
    })

    expect(wrapper.text()).toContain('观察什么')
    expect(wrapper.text()).toContain('改变什么')
    expect(wrapper.text()).toContain('为什么变化')
    expect(wrapper.text()).toContain('模型有哪些限制')
    expect(wrapper.text()).toContain('观察月相盈亏')
    expect(wrapper.text()).toContain('本模型为定性或半定量教学模拟')
    expect(wrapper.text()).toContain('真实数据实验')
    expect(wrapper.text()).toContain('卫星影像对比')
  })

  it('emits reset and compare events on button click', async () => {
    const wrapper = mount(ModelPedagogyPanel, {
      props: {
        theme: 'geology',
        observe: '断层与地堑形态',
        change: '水平挤压或拉伸位移',
        mechanism: '构造应力超过岩层屈服极限产生破裂与错位',
        limitations: '简化了岩层非均质性与流变特性',
        hasCompare: true,
      },
      global: {
        stubs: {
          RouterLink: true,
        },
      },
    })

    const resetBtn = wrapper.find('.reset-btn')
    await resetBtn.trigger('click')
    expect(wrapper.emitted('reset')).toBeTruthy()

    const compareBtn = wrapper.findAll('.pedagogy-btn')[0]
    await compareBtn.trigger('click')
    expect(wrapper.emitted('compare')).toBeTruthy()
  })
})
