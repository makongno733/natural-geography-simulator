import { describe, expect, it } from 'vitest'
import { daylightHours, distanceKm, mapPoint, noonSolarAltitude, shadowLength, solarDeclination } from './solar.js'

describe('classroom geography calculations', () => {
  it('keeps the solstices and equinoxes in the expected range', () => {
    expect(solarDeclination(172)).toBeCloseTo(23.44, 1)
    expect(solarDeclination(355)).toBeCloseTo(-23.44, 1)
    expect(Math.abs(solarDeclination(80))).toBeLessThan(1)
  })
  it('handles equatorial and polar daylight including polar night', () => {
    expect(daylightHours(0, 23.44)).toBeCloseTo(12, 5)
    expect(daylightHours(80, 23.44)).toBe(24)
    expect(daylightHours(80, -23.44)).toBe(0)
  })
  it('computes noon altitude, shadows and great-circle distance', () => {
    expect(noonSolarAltitude(30, 0)).toBe(60)
    expect(shadowLength(1, 45)).toBeCloseTo(1, 5)
    expect(distanceKm({ lat: 0, lon: 0 }, { lat: 0, lon: 1 })).toBeCloseTo(111.2, 0)
    expect(mapPoint(0, 0)).toEqual({ x: 360, y: 180 })
  })
})
