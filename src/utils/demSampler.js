/**
 * DEM 高程栅格插值与剖面提取工具
 */
import { calculateGreatCircleDistance } from './geoSpatialAnalysis.js'

/**
 * 从 96x96 DEM 中沿任意两点提取剖面高程序列
 * @param {Object} dem { width: 96, height: 96, elevationMeters: number[] }
 * @param {number} col1 起点列 (0 ~ 95)
 * @param {number} row1 起点行 (0 ~ 95)
 * @param {number} col2 终点列 (0 ~ 95)
 * @param {number} row2 终点行 (0 ~ 95)
 * @param {number} [steps=96] 采样点数
 */
export function sampleDemProfile(dem, col1, row1, col2, row2, steps = 96) {
  const points = []
  const width = dem.width || 96
  const height = dem.height || 96

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1)
    const col = col1 + t * (col2 - col1)
    const row = row1 + t * (row2 - row1)

    // 双线性或最近邻插值
    const c0 = Math.floor(col)
    const r0 = Math.floor(row)
    const c1 = Math.min(width - 1, c0 + 1)
    const r1 = Math.min(height - 1, r0 + 1)

    const fc = col - c0
    const fr = row - r0

    const e00 = dem.elevationMeters[r0 * width + c0] || 0
    const e10 = dem.elevationMeters[r0 * width + c1] || e00
    const e01 = dem.elevationMeters[r1 * width + c0] || e00
    const e11 = dem.elevationMeters[r1 * width + c1] || e10

    const elev = (1 - fc) * (1 - fr) * e00 + fc * (1 - fr) * e10 + (1 - fc) * fr * e01 + fc * fr * e11

    // 对应地理经纬度 (86.75°E ~ 87.00°E, 28.00°N ~ 27.75°N)
    const lng = 86.75 + (col / (width - 1)) * 0.25
    const lat = 28.0 - (row / (height - 1)) * 0.25

    points.push({
      col,
      row,
      lng,
      lat,
      elevation: Math.round(elev)
    })
  }

  // 统计计算
  const elevations = points.map(p => p.elevation)
  const minElev = Math.min(...elevations)
  const maxElev = Math.max(...elevations)
  const relief = maxElev - minElev

  // 计算地表水平大圆跨距 (km)
  const startCoord = [points[0].lng, points[0].lat]
  const endCoord = [points[points.length - 1].lng, points[points.length - 1].lat]
  const distanceKm = calculateGreatCircleDistance(startCoord, endCoord)

  // 平均坡度角 (度)
  const slopeRad = Math.atan((relief / (distanceKm * 1000 || 1)))
  const slopeDeg = (slopeRad * 180) / Math.PI

  return {
    points,
    minElev,
    maxElev,
    relief,
    distanceKm: Number(distanceKm.toFixed(2)),
    averageSlopeDeg: Number(slopeDeg.toFixed(1))
  }
}
