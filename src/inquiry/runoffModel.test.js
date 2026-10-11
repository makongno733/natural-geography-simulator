import { describe, expect, it } from 'vitest'
import { compareScenarios, runoffTendency } from './runoffModel.js'

describe('qualitative runoff inquiry', () => {
  it('moves in the expected direction when one variable changes', () => {
    const baseline = { rain: 2, slope: 2, vegetation: 2 }
    expect(runoffTendency({ ...baseline, rain: 3 }).level).toBeGreaterThan(runoffTendency(baseline).level)
    expect(runoffTendency({ ...baseline, vegetation: 3 }).level).toBeLessThan(runoffTendency(baseline).level)
  })

  it('encourages a controlled comparison', () => {
    const baseline = { rain: 2, slope: 2, vegetation: 2 }
    expect(compareScenarios(baseline, { rain: 3, slope: 3, vegetation: 2 })).toContain('多个条件同时变化')
    expect(compareScenarios(baseline, { rain: 3, slope: 2, vegetation: 2 })).toContain('降雨强度')
  })
})
