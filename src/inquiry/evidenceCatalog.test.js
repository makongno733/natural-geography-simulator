import { describe, expect, it } from 'vitest'
import { describeEvidence, getEvidenceById, STANDARD_EVIDENCES } from './evidenceCatalog.js'

const sourceRecord = () => ({
  id: 'test-source-record',
  evidenceType: 'observation',
  provenance: {
    status: 'source-linked',
    sources: [{ title: '测试来源记录', url: 'https://example.invalid/record' }],
    timeBasis: '测试记录时间基线',
    method: '测试方法说明'
  }
})

describe('inquiry attachment provenance', () => {
  it('preserves the three existing IDs but does not publish their unsupported measurements', () => {
    expect(STANDARD_EVIDENCES.map(evidence => evidence.id)).toEqual(['ev-poyang-winter', 'ev-urban-sponge', 'ev-thermal-circulation'])
    for (const evidence of STANDARD_EVIDENCES) {
      expect(evidence.provenance).toMatchObject({ status: 'unverified', sources: [], timeBasis: '', method: '' })
      expect(describeEvidence(evidence).sourceLinked).toBe(false)
      expect(`${evidence.title} ${evidence.facts}`).not.toMatch(/1140|68\.2|10\.5|0\.28|25 分钟|2\.4|严格线性|实测证据/)
    }
    expect(describeEvidence(getEvidenceById('ev-poyang-winter')).label).toContain('来源待核实')
    for (const id of ['ev-urban-sponge', 'ev-thermal-circulation']) {
      expect(describeEvidence(getEvidenceById(id)).label).toBe('仿真示例 · 结果待核实')
    }
  })

  it('distinguishes traceable source records from human verification', () => {
    const described = describeEvidence(sourceRecord())
    expect(described.sourceLinked).toBe(true)
    expect(described.label).toBe('有出处的来源记录 · 未经人工核验')
    expect(described.notice).toContain('不代表平台已完成人工核验')
  })

  it.each(['sources', 'timeBasis', 'method'])('does not promote a record missing %s to source-linked', field => {
    const evidence = sourceRecord()
    evidence.provenance[field] = field === 'sources' ? [] : ''
    expect(describeEvidence(evidence).sourceLinked).toBe(false)
    expect(describeEvidence(evidence).label).toContain('待核实')
  })

  it('never labels a reproducible simulation as a field measurement', () => {
    const evidence = { ...sourceRecord(), evidenceType: 'simulation' }
    expect(describeEvidence(evidence).label).toBe('有记录的仿真 · 非实测')
    expect(describeEvidence(evidence).notice).toContain('不等于现场观测')
  })

  it.each(['javascript:alert(1)', 'http://example.invalid/record', 'https://user:secret@example.invalid/record'])('refuses unsafe source URLs: %s', url => {
    const evidence = sourceRecord()
    evidence.provenance.sources[0].url = url
    expect(describeEvidence(evidence).sources).toEqual([])
    expect(describeEvidence(evidence).sourceLinked).toBe(false)
  })

  it('keeps unknown old attachments explicitly unverified without fabricating a source', () => {
    expect(getEvidenceById('legacy-missing-card')).toBeNull()
    expect(describeEvidence(null)).toMatchObject({ label: '附件资料待核实', sources: [] })
  })
})
