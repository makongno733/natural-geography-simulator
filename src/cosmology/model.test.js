import { describe, expect, it } from 'vitest'
import { expansionAt } from './model.js'

describe('cosmological expansion classroom model', () => {
  it('links scale factor, wavelength and redshift consistently', () => {
    expect(expansionAt(0.5)).toEqual({ scale: 0.5, redshift: 1, observedWavelengthNm: 1000, separationRatio: 2 })
    expect(expansionAt(1).redshift).toBe(0)
  })
  it('keeps the slider model within its stated range', () => {
    expect(expansionAt(0).scale).toBe(0.1)
    expect(expansionAt(2).scale).toBe(1)
  })
})
