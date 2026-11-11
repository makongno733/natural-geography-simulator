import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import EvidenceAttachment from './EvidenceAttachment.vue'
import { getEvidenceById } from '../evidenceCatalog.js'

function render(evidence, evidenceId = evidence?.id || 'old-attachment') {
  return mount(EvidenceAttachment, {
    props: { evidence, evidenceId },
    global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } }
  })
}

describe('evidence attachments at their point of use', () => {
  it.each(['ev-poyang-winter', 'ev-urban-sponge', 'ev-thermal-circulation'])('labels %s and does not assert its unsupported numerical facts', id => {
    const wrapper = render(getEvidenceById(id))
    expect(wrapper.text()).toContain('待核实')
    expect(wrapper.text()).toContain('不是原始观测来源')
    expect(wrapper.text()).not.toMatch(/1140|68\.2|0\.28|2\.4|严格线性关联/)
  })

  it('displays the source, time and method of a traceable observation without certifying it', () => {
    const evidence = {
      id: 'fixture-observation', title: '测试观测记录', facts: '测试观测摘要',
      evidenceType: 'observation',
      provenance: {
        status: 'source-linked', timeBasis: '测试日期', method: '测试观测方法',
        sources: [{ title: '测试原始记录', url: 'https://example.invalid/observation' }]
      }
    }
    const wrapper = render(evidence)
    expect(wrapper.text()).toContain('未经人工核验')
    expect(wrapper.text()).toContain('测试观测摘要')
    expect(wrapper.text()).toContain('测试日期')
    expect(wrapper.text()).toContain('测试观测方法')
    expect(wrapper.find('a[href="https://example.invalid/observation"]').exists()).toBe(true)
  })

  it('shows reproducible simulation output only as a simulation, not a measured observation', () => {
    const evidence = {
      id: 'fixture-simulation', title: '测试模型记录', facts: '测试输出',
      evidenceType: 'simulation',
      provenance: {
        status: 'source-linked', timeBasis: '测试运行时间', method: '测试模型版本与参数',
        sources: [{ title: '测试运行记录', url: 'https://example.invalid/run' }]
      }
    }
    const wrapper = render(evidence)
    expect(wrapper.text()).toContain('有记录的仿真 · 非实测')
    expect(wrapper.text()).toContain('测试输出')
    expect(wrapper.text()).toContain('不等于现场观测')
  })

  it('does not display assertions from a record claiming verification with missing provenance', () => {
    const wrapper = render({
      id: 'incomplete-record', title: '测试记录', facts: '无据断言 999',
      evidenceType: 'observation', provenance: { status: 'source-linked', sources: [] }
    })
    expect(wrapper.text()).toContain('来源待核实')
    expect(wrapper.text()).not.toContain('无据断言 999')
  })

  it('keeps an unknown old attachment visible with its ID instead of hiding or inventing it', () => {
    const wrapper = render(null, 'legacy-card-7')
    expect(wrapper.text()).toContain('legacy-card-7')
    expect(wrapper.text()).toContain('附件资料待核实')
    expect(wrapper.text()).toContain('不视为实测证据')
    expect(wrapper.findAll('a')).toHaveLength(0)
  })
})
