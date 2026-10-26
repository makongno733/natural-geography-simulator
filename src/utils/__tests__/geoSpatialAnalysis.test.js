import { describe, it, expect } from 'vitest'
import {
  calculateGreatCircleDistance,
  calculateInitialBearing,
  calculatePathLength,
  calculateSphericalArea,
  generateGeodesicBuffer,
  isPointInsidePolygon,
  getMercatorDistortionRatio
} from '../geoSpatialAnalysis.js'

describe('GIS Spatial Geodesic Analysis', () => {
  it('calculates great circle distance accurately (Beijing to London ~8140 km)', () => {
    // 北京 [116.4, 39.9], 伦敦 [-0.12, 51.5]
    const dist = calculateGreatCircleDistance([116.4, 39.9], [-0.12, 51.5])
    expect(dist).toBeGreaterThan(8100)
    expect(dist).toBeLessThan(8200)
  })

  it('calculates initial bearing from Beijing to London', () => {
    const bearing = calculateInitialBearing([116.4, 39.9], [-0.12, 51.5])
    // 大圆航线向西北偏北起飞，初始方位角约 330°~345°
    expect(bearing).toBeGreaterThan(320)
    expect(bearing).toBeLessThan(350)
  })

  it('calculates path length', () => {
    const path = [
      [116.4, 39.9],
      [121.47, 31.23]
    ]
    const len = calculatePathLength(path)
    expect(len).toBeGreaterThan(1000)
    expect(len).toBeLessThan(1150)
  })

  it('calculates spherical area for a polygon', () => {
    // 简易多边形
    const poly = [
      [100, 30],
      [101, 30],
      [101, 31],
      [100, 31]
    ]
    const area = calculateSphericalArea(poly)
    expect(area).toBeGreaterThan(9000)
    expect(area).toBeLessThan(12000)
  })

  it('generates geodesic buffer ring coordinates', () => {
    const buffer = generateGeodesicBuffer([116.4, 39.9], 50, 16)
    expect(buffer.length).toBe(17)
  })

  it('identifies if a point is inside a polygon', () => {
    const poly = [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10]
    ]
    expect(isPointInsidePolygon([5, 5], poly)).toBe(true)
    expect(isPointInsidePolygon([15, 5], poly)).toBe(false)
  })

  it('computes Mercator projection distortion ratio', () => {
    const equator = getMercatorDistortionRatio(0)
    expect(equator.areaFactor).toBe(1)

    const highLat = getMercatorDistortionRatio(60)
    expect(highLat.areaFactor).toBe(4) // sec²(60°) = 4
  })
})
