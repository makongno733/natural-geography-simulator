import { describe, it, expect } from 'vitest'
import { sampleDemProfile } from '../demSampler.js'

describe('DEM Sampler and Arbitrary Profile Interpolation', () => {
  const dummyDem = {
    width: 96,
    height: 96,
    elevationMeters: new Array(96 * 96).fill(0).map((_, i) => 3000 + (i % 96) * 50)
  }

  it('samples west-to-east latitude profile line', () => {
    const res = sampleDemProfile(dummyDem, 0, 48, 95, 48, 96)
    expect(res.points.length).toBe(96)
    expect(res.minElev).toBe(3000)
    expect(res.maxElev).toBe(3000 + 95 * 50)
    expect(res.relief).toBe(95 * 50)
    expect(res.distanceKm).toBeGreaterThan(20)
    expect(res.averageSlopeDeg).toBeGreaterThan(0)
  })

  it('samples arbitrary diagonal profile line with bilinear interpolation', () => {
    const res = sampleDemProfile(dummyDem, 10, 10, 50, 50, 48)
    expect(res.points.length).toBe(48)
    expect(res.distanceKm).toBeGreaterThan(0)
    expect(res.minElev).toBeGreaterThanOrEqual(3000)
  })
})
