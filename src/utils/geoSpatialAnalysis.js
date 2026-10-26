/**
 * 地学空间分析与真实大地测量工具集 (WGS-84 大圆大地线与球面几何)
 * 严格按照大地测量学规范，避免将平面像素作为地理距离
 */

// WGS-84 椭球体平均半径 (IUGG 定义: 6371.0088 km)
export const EARTH_RADIUS_KM = 6371.0088

/**
 * 角度转弧度
 */
export const toRad = deg => (deg * Math.PI) / 180

/**
 * 弧度转角度
 */
export const toDeg = rad => (rad * 180) / Math.PI

/**
 * 1. 计算两点间的大圆地理真实距离 (Haversine 公式，单位: km)
 * @param {[number, number]} coord1 [经度 lng, 纬度 lat]
 * @param {[number, number]} coord2 [经度 lng, 纬度 lat]
 * @returns {number} 距离 (千米)
 */
export function calculateGreatCircleDistance([lng1, lat1], [lng2, lat2]) {
  const phi1 = toRad(lat1)
  const phi2 = toRad(lat2)
  const deltaPhi = toRad(lat2 - lat1)
  const deltaLambda = toRad(lng2 - lng1)

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_KM * c
}

/**
 * 计算大圆航向初始方位角 (度: 0°~360°, 正北为 0°)
 */
export function calculateInitialBearing([lng1, lat1], [lng2, lat2]) {
  const phi1 = toRad(lat1)
  const phi2 = toRad(lat2)
  const deltaLambda = toRad(lng2 - lng1)

  const y = Math.sin(deltaLambda) * Math.cos(phi2)
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda)
  const theta = Math.atan2(y, x)
  return (toDeg(theta) + 360) % 360
}

/**
 * 2. 计算折线路径总长度 (单位: km)
 * @param {Array<[number, number]>} pathCoords 经纬度点集
 */
export function calculatePathLength(pathCoords) {
  if (!Array.isArray(pathCoords) || pathCoords.length < 2) return 0
  let total = 0
  for (let i = 0; i < pathCoords.length - 1; i++) {
    total += calculateGreatCircleDistance(pathCoords[i], pathCoords[i + 1])
  }
  return total
}

/**
 * 3. 计算多边形在地球表面的真实投影面积 (单位: km²)
 * 基于球面过剩公式 (Spherical Excess)
 * @param {Array<[number, number]>} ring 环状闭合经纬度点集
 */
export function calculateSphericalArea(ring) {
  if (!Array.isArray(ring) || ring.length < 3) return 0
  let total = 0

  for (let i = 0; i < ring.length; i++) {
    const p1 = ring[i]
    const p2 = ring[(i + 1) % ring.length]
    total += toRad(p2[0] - p1[0]) * (2 + Math.sin(toRad(p1[1])) + Math.sin(toRad(p2[1])))
  }

  const area = Math.abs((total * EARTH_RADIUS_KM * EARTH_RADIUS_KM) / 2)
  return area
}

/**
 * 4. 生成圆形地理缓冲区边界点集 (GeoJSON Polygon coordinates)
 * @param {[number, number]} center [经度, 纬度]
 * @param {number} radiusKm 半径 (km)
 * @param {number} [steps=64] 分割步数
 */
export function generateGeodesicBuffer([centerLng, centerLat], radiusKm, steps = 64) {
  const coords = []
  const angDist = radiusKm / EARTH_RADIUS_KM
  const phi1 = toRad(centerLat)
  const lambda1 = toRad(centerLng)

  for (let i = 0; i <= steps; i++) {
    const bearing = (2 * Math.PI * i) / steps
    const phi2 = Math.asin(
      Math.sin(phi1) * Math.cos(angDist) + Math.cos(phi1) * Math.sin(angDist) * Math.cos(bearing)
    )
    const lambda2 =
      lambda1 +
      Math.atan2(
        Math.sin(bearing) * Math.sin(angDist) * Math.cos(phi1),
        Math.cos(angDist) - Math.sin(phi1) * Math.sin(phi2)
      )
    coords.push([toDeg(lambda2), toDeg(phi2)])
  }
  return coords
}

/**
 * 5. 点是否在多边形内部 (Ray-casting 射线交叉算法)
 * @param {[number, number]} point [lng, lat]
 * @param {Array<[number, number]>} polygon 边界点集
 */
export function isPointInsidePolygon([x, y], polygon) {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0]
    const yi = polygon[i][1]
    const xj = polygon[j][0]
    const yj = polygon[j][1]

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

/**
 * 6. 计算墨卡托投影形变系数与误差说明
 * 在 Web Mercator (EPSG:3857) 投影下，面积放大系数为 sec²(lat)
 * 例如 60°N 纬度处，面积被夸大了 400%
 */
export function getMercatorDistortionRatio(latitude) {
  const latRad = toRad(Math.abs(latitude))
  const sec = 1 / Math.cos(latRad)
  return {
    linearFactor: Number(sec.toFixed(3)),
    areaFactor: Number((sec * sec).toFixed(3)),
    description:
      Math.abs(latitude) > 50
        ? `高纬度区(${latitude}°)受墨卡托投影形变影响极严重，二维平面面积被视觉放大了 ${Number((sec * sec).toFixed(1))} 倍，必须使用椭球面微积分计算真实面积。`
        : `中低纬度区(${latitude}°)投影形变相对较小，面积形变比率约为 ${Number((sec * sec).toFixed(2))}。`
  }
}
