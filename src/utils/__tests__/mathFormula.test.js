import { describe, it, expect } from 'vitest'
import { renderGeoScholarlyText, GEO_FORMULA_PRESETS } from '../mathFormula.js'
import { getEvidenceById, STANDARD_EVIDENCES } from '../../inquiry/evidenceCatalog.js'

describe('Math formula renderer and Evidence cards', () => {
  it('renders inline math formulas safely', () => {
    const raw = '科里奥利力参数为 $f = 2\\Omega \\sin\\phi$ ，随纬度增大。'
    const rendered = renderGeoScholarlyText(raw)

    expect(rendered).toContain('math-inline')
    expect(rendered).toContain('Ω')
    expect(rendered).toContain('sin')
    expect(rendered).toContain('φ')
  })

  it('renders block math formulas safely', () => {
    const raw = '曼宁流速公式如下：\n$$v = \\frac{1}{n} R^{2/3} S^{1/2}$$\n适用于明渠水流。'
    const rendered = renderGeoScholarlyText(raw)

    expect(rendered).toContain('math-block')
    expect(rendered).toContain('math-fraction')
    expect(rendered).toContain('<sup>2/3</sup>')
  })

  it('escapes dangerous HTML tags to prevent XSS', () => {
    const malicious = '<script>alert("xss")</script> $a < b$'
    const rendered = renderGeoScholarlyText(malicious)

    expect(rendered).not.toContain('<script>')
    expect(rendered).toContain('&lt;script&gt;')
  })

  it('provides rich preset geography formulas', () => {
    expect(GEO_FORMULA_PRESETS.length).toBeGreaterThanOrEqual(5)
    expect(GEO_FORMULA_PRESETS.some(f => f.name === '地转偏向力')).toBe(true)
    expect(GEO_FORMULA_PRESETS.some(f => f.name === '曼宁流速公式')).toBe(true)
  })

  it('resolves standard inquiry evidence cards correctly', () => {
    const poyang = getEvidenceById('ev-poyang-winter')
    expect(poyang).not.toBeNull()
    expect(poyang.taskTitle).toContain('鄱阳湖')
    expect(poyang.facts).toContain('1140 km²')

    const unknown = getEvidenceById('unknown-id')
    expect(unknown).toBeNull()
  })
})
