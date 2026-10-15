import { describe, expect, it } from 'vitest'
import { astronomyEvents, normalizeQuakes, seasonalEvents, toChinaDate } from './events.js'

describe('geography calendar data', () => {
  it('places UTC events on the correct Beijing date', () => {
    expect(toChinaDate('2026-10-14T16:30:00Z')).toBe('2026-10-15')
    expect(normalizeQuakes({ earthquakes: [{
      id: 'usgs:test', occurredAt: '2026-10-14T16:30:00Z', magnitude: 5.1,
      place: 'Test, China', latitude: 31, longitude: 104, depthKm: 10,
      sourceUrl: 'https://earthquake.usgs.gov/earthquakes/eventpage/test'
    }] })[0].date).toBe('2026-10-15')
  })

  it('creates twelve month-wide observation themes without pretending they are forecasts', () => {
    const themes = seasonalEvents(2027)
    expect(themes).toHaveLength(12)
    expect(themes.every(event => event.wholeMonth && event.status === '典型观察时段')).toBe(true)
    expect(themes.every(event => event.story && event.description)).toBe(true)
  })

  it('keeps a source and a readable story with each astronomy clue', () => {
    expect(astronomyEvents.every(event => event.story && event.sourceUrl.startsWith('https://'))).toBe(true)
  })

  it('rejects earthquake links outside the source domain', () => {
    expect(normalizeQuakes({ earthquakes: [{ sourceUrl: 'https://example.com/test', magnitude: 5, occurredAt: '2026-10-15T00:00:00Z' }] })).toEqual([])
  })
})
