import { describe, it, expect } from 'vitest'
import { SUPERSTRING_THEORIES, DUALITY_CONNECTIONS } from './stringTheoriesData.js'

describe('Five Superstring Theories Dataset & Comparison Guardrails', () => {
  it('declares exactly the five 10D superstring theories', () => {
    expect(SUPERSTRING_THEORIES).toHaveLength(5)
    const ids = SUPERSTRING_THEORIES.map(t => t.id)
    expect(ids).toEqual(['type1', 'type2a', 'type2b', 'het_so32', 'het_e8'])
  })

  it('guarantees Type II theories are NOT misattributed with perturbative non-abelian gauge groups', () => {
    const type2a = SUPERSTRING_THEORIES.find(t => t.id === 'type2a')
    const type2b = SUPERSTRING_THEORIES.find(t => t.id === 'type2b')

    expect(type2a.gaugeGroup).toMatch(/无非平凡规范群/i)
    expect(type2b.gaugeGroup).toMatch(/无非平凡规范群/i)
    expect(type2a.gaugeOrigin).toMatch(/D\s*膜/i)
    expect(type2b.gaugeOrigin).toMatch(/D\s*膜/i)
  })

  it('correctly distinguishes chirality: IIA is non-chiral, IIB and Heterotics are chiral', () => {
    const iia = SUPERSTRING_THEORIES.find(t => t.id === 'type2a')
    const iib = SUPERSTRING_THEORIES.find(t => t.id === 'type2b')
    const hete8 = SUPERSTRING_THEORIES.find(t => t.id === 'het_e8')

    expect(iia.spacetimeChirality).toMatch(/非手征/i)
    expect(iib.spacetimeChirality).toMatch(/手征/i)
    expect(hete8.spacetimeChirality).toMatch(/手征/i)
  })

  it('marks Type I as unoriented with open and closed strings, others oriented', () => {
    const t1 = SUPERSTRING_THEORIES.find(t => t.id === 'type1')
    expect(t1.stringType).toMatch(/开弦与闭弦/i)
    expect(t1.orientability).toMatch(/未定向/i)

    const otherTheories = SUPERSTRING_THEORIES.filter(t => t.id !== 'type1')
    for (const t of otherTheories) {
      expect(t.stringType).toMatch(/仅闭弦/i)
      expect(t.orientability).toMatch(/定向/i)
    }
  })

  it('contains verified duality relations including T-duality, S-duality and M-theory limits', () => {
    const dualTypes = new Set(DUALITY_CONNECTIONS.map(d => d.type))
    expect(dualTypes.has('T 对偶 (T-Duality)')).toBe(true)
    expect(dualTypes.has('S 对偶 (S-Duality)')).toBe(true)
    expect(dualTypes.has('M 理论极限 (M-Theory)')).toBe(true)

    for (const conn of DUALITY_CONNECTIONS) {
      expect(conn.formula).toBeTruthy()
      expect(conn.description).toBeTruthy()
      expect(conn.prerequisites).toBeTruthy()
      expect(conn.status).toBeTruthy()
    }
  })
})
