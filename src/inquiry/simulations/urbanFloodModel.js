/**
 * 城市暴雨产流与海绵下渗教学仿真模型（纯计算与可复现状态编解码）
 * 声明：本模块为水文推理（Q = C·I·A 归一化）与 Horton 下渗简化教学仿真模型，非现场实测数据。
 */

export const URBAN_FLOOD_MODEL_META = {
  modelName: '城市暴雨产流与海绵下渗仿真模型（归一化推理公式与 Horton 下渗简化教学模型）',
  evidenceType: '教学仿真对照结果（教学仿真，非现场实测）',
  disclaimer: '教学仿真，非现场实测',
  limitations:
    '适用边界：基于匀质汇水区经验参数（Q = C·I·A 归一化公式，默认管网排水能力 25 mm/h）推演不同下渗条件下的产流趋势；未计入真实城市地下管网复杂顶托、空间降雨不均与局部微地形汇水，不可替代现场水文实测。'
}

export const URBAN_FLOOD_SURFACES = [
  { id: 'concrete', name: '传统水泥/沥青', sub: '高强度不透水硬化', icon: '🏢' },
  { id: 'sponge', name: '海绵透水铺装', sub: '透水砖+碎石调蓄', icon: '🧱' },
  { id: 'vegetation', name: '天然林地草甸', sub: '土壤深厚截留强', icon: '🌲' }
]

export function getSurfaceMeta(surfaceId) {
  return URBAN_FLOOD_SURFACES.find(s => s.id === surfaceId) || URBAN_FLOOD_SURFACES[0]
}

export function getRainLevelName(intensity) {
  const val = Number(intensity) || 50
  if (val < 20) return '小雨'
  if (val < 40) return '中到大雨'
  if (val < 70) return '暴雨'
  return '特大暴雨'
}

export function getSlopeDesc(slope) {
  const val = Number(slope) || 2
  if (val <= 2) return '平缓平原区'
  if (val <= 4) return '微倾坡面'
  return '陡坡汇流区'
}

/**
 * 根据给定地面类型与降雨条件计算水文响应指标（保留原有公式与读数：50mm/h、60min、2°下水泥 44.4 m³/s，天然植被 11.7 m³/s）
 */
export function computeUrbanFloodMetrics({
  surface = 'concrete',
  rainIntensity = 50,
  rainDuration = 60,
  slope = 2,
  spongeCapacity = 25
} = {}) {
  const validSurface = URBAN_FLOOD_SURFACES.some(s => s.id === surface) ? surface : 'concrete'
  const I = Math.max(10, Math.min(120, Number(rainIntensity) || 50))
  const D = Math.max(15, Math.min(120, Number(rainDuration) || 60))
  const S = Math.max(1, Math.min(8, Number(slope) || 2))
  const cap = Math.max(10, Math.min(45, Number(spongeCapacity) || 25))

  const totalPrecipitation = Math.round(I * (D / 60))

  let infiltrationRatio = 0.05
  if (validSurface === 'concrete') {
    infiltrationRatio = 0.05
  } else if (validSurface === 'vegetation') {
    infiltrationRatio = 0.75
  } else {
    const baseRate = 0.60
    const saturationLoss = Math.min(0.35, (totalPrecipitation / (cap * 2)) * 0.25)
    infiltrationRatio = Math.max(0.18, Math.round((baseRate - saturationLoss) * 100) / 100)
  }

  const runoffCoeff = Math.round((1 - infiltrationRatio) * 100) / 100

  const baseTime = validSurface === 'concrete' ? 8 : validSurface === 'sponge' ? 24 : 38
  const slopePenalty = (S - 1) * 2
  const timeToPeak = Math.max(5, Math.round(baseTime - slopePenalty))

  const peakRaw = (runoffCoeff * I * 0.85) * (1 + S * 0.05)
  const peakDischarge = Math.round(peakRaw * 10) / 10

  const refPeakRaw = (0.95 * I * 0.85) * (1 + S * 0.05)
  const refPeakDischarge = Math.round(refPeakRaw * 10) / 10

  const peakReductionRate = refPeakDischarge > 0
    ? Math.max(0, Math.round(((refPeakDischarge - peakDischarge) / refPeakDischarge) * 100))
    : 0

  const runoffTotal = totalPrecipitation * runoffCoeff
  const drainageCapacity = 25 // 默认管网排水设计流量 (mm/h)
  const netWater = Math.max(0, runoffTotal - drainageCapacity * (D / 60))
  const waterDepth = Math.round(netWater)

  let riskLevelName = '城市内涝特大险情 · 需紧急避险'
  let riskColor = '#f87171'
  if (waterDepth <= 5) {
    riskLevelName = '地表畅流 · 无明显积水'
    riskColor = '#4ade80'
  } else if (waterDepth <= 25) {
    riskLevelName = '道路浅层积水 · 轻度受阻'
    riskColor = '#facc15'
  } else if (waterDepth <= 60) {
    riskLevelName = '严重积水 · 立交桥与车道受淹'
    riskColor = '#fb923c'
  }

  const surfaceMeta = getSurfaceMeta(validSurface)

  return {
    surface: validSurface,
    surfaceName: surfaceMeta.name,
    surfaceSub: surfaceMeta.sub,
    surfaceIcon: surfaceMeta.icon,
    rainIntensity: I,
    rainLevelName: getRainLevelName(I),
    rainDuration: D,
    slope: S,
    slopeDesc: getSlopeDesc(S),
    spongeCapacity: cap,
    totalPrecipitation,
    infiltrationRatio,
    infiltrationPercent: Math.round(infiltrationRatio * 100),
    runoffCoeff,
    runoffDepth: Math.round(runoffTotal * 10) / 10,
    infiltrationDepth: Math.round((totalPrecipitation * infiltrationRatio) * 10) / 10,
    timeToPeak,
    peakDelayMinutes: Math.max(0, timeToPeak - 8),
    peakDischarge,
    refPeakDischarge,
    peakReductionRate,
    waterDepth,
    riskLevelName,
    riskColor
  }
}

/**
 * 生成两组地表对照的结构化证据卡数据（供页面、分享链接与社区讨论复用）
 */
export function buildComparisonEvidenceCard({
  surfaceA = 'concrete',
  surfaceB = 'vegetation',
  rainIntensity = 50,
  rainDuration = 60,
  slope = 2,
  spongeCapacity = 25,
  guess = '',
  claim = ''
} = {}) {
  const mA = computeUrbanFloodMetrics({ surface: surfaceA, rainIntensity, rainDuration, slope, spongeCapacity })
  const mB = computeUrbanFloodMetrics({ surface: surfaceB, rainIntensity, rainDuration, slope, spongeCapacity })

  const peakDiff = Math.round(Math.abs(mA.peakDischarge - mB.peakDischarge) * 10) / 10
  const higherSurface = mA.peakDischarge >= mB.peakDischarge ? mA : mB
  const lowerSurface = mA.peakDischarge >= mB.peakDischarge ? mB : mA
  const relativeReduction = higherSurface.peakDischarge > 0
    ? Math.round(((higherSurface.peakDischarge - lowerSurface.peakDischarge) / higherSurface.peakDischarge) * 100)
    : 0

  const defaultClaim =
    `保持降雨强度 ${mA.rainIntensity} mm/h、历时 ${mA.rainDuration} 分钟、坡度 ${mA.slope}° 不变，将地面从「${mA.surfaceName}」切换为「${mB.surfaceName}」后，下渗补给率由 ${mA.infiltrationPercent}% 变为 ${mB.infiltrationPercent}%，地表径流峰值由 ${mA.peakDischarge} m³/s 变为 ${mB.peakDischarge} m³/s（相差 ${peakDiff} m³/s，削峰 ${relativeReduction}%），说明增加地面透水与土壤蓄水能显著削减并延缓暴雨洪峰。`

  const finalClaim = (typeof claim === 'string' && claim.trim()) ? claim.trim().slice(0, 300) : defaultClaim

  return {
    title: `对照证据卡：${mA.surfaceName} vs ${mB.surfaceName}（${mA.rainIntensity} mm/h · ${mA.rainDuration} 分钟）`,
    modelName: URBAN_FLOOD_MODEL_META.modelName,
    evidenceType: URBAN_FLOOD_MODEL_META.evidenceType,
    disclaimer: URBAN_FLOOD_MODEL_META.disclaimer,
    limitations: URBAN_FLOOD_MODEL_META.limitations,
    conditionsText: `降雨强度 ${mA.rainIntensity} mm/h（${mA.rainLevelName}）· 降雨历时 ${mA.rainDuration} 分钟 · 地表坡度 ${mA.slope}°（${mA.slopeDesc}）· 累积雨量 ${mA.totalPrecipitation} mm`,
    groupA: mA,
    groupB: mB,
    peakDiff,
    relativeReduction,
    guess,
    claim: finalClaim,
    params: {
      模型名称: '城市暴雨产流与海绵下渗教学仿真模型',
      证据类型: URBAN_FLOOD_MODEL_META.evidenceType,
      固定条件: `${mA.rainIntensity} mm/h · ${mA.rainDuration} 分钟 · 坡度 ${mA.slope}°`,
      [`对照组A（${mA.surfaceName}）`]: `径流峰值 ${mA.peakDischarge} m³/s · 下渗率 ${mA.infiltrationPercent}% · 达峰 ${mA.timeToPeak} 分钟 · 积水 ${mA.waterDepth} mm`,
      [`对照组B（${mB.surfaceName}）`]: `径流峰值 ${mB.peakDischarge} m³/s · 下渗率 ${mB.infiltrationPercent}% · 达峰 ${mB.timeToPeak} 分钟 · 积水 ${mB.waterDepth} mm`
    },
    observation: `【教学仿真，非现场实测】固定降雨强度 ${mA.rainIntensity} mm/h、历时 ${mA.rainDuration} 分钟（总降水量 ${mA.totalPrecipitation} mm）、坡度 ${mA.slope}°：对照组 A「${mA.surfaceName}」下渗率 ${mA.infiltrationPercent}%，地表径流峰值 ${mA.peakDischarge} m³/s（${mA.timeToPeak} 分钟达峰，估算积水 ${mA.waterDepth} mm）；对照组 B「${mB.surfaceName}」下渗率 ${mB.infiltrationPercent}%，地表径流峰值 ${mB.peakDischarge} m³/s（${mB.timeToPeak} 分钟达峰，估算积水 ${mB.waterDepth} mm）。两组径流峰值相差 ${peakDiff} m³/s（相对削峰率 ${relativeReduction}%）。`,
    inference: `【我的解释】${finalClaim}（${URBAN_FLOOD_MODEL_META.limitations}）`,
    confidence: 4,
    source: `${URBAN_FLOOD_MODEL_META.modelName}（${URBAN_FLOOD_MODEL_META.disclaimer}）`,
    tag: `${mA.surfaceName} vs ${mB.surfaceName}`
  }
}

/**
 * 编码公开对照实验状态为 URL 查询参数（仅包含用户选择公开的实验参数与一句解释，不含私人草稿或账号信息）
 */
export function serializeUrbanFloodShareQuery({
  surfaceA = 'concrete',
  surfaceB = 'vegetation',
  rainIntensity = 50,
  rainDuration = 60,
  slope = 2,
  spongeCapacity = 25,
  guess = '',
  claim = ''
} = {}) {
  const query = {
    task: 'urban-flood',
    mode: 'compare',
    shared: '1',
    rain: String(Math.round(Number(rainIntensity) || 50)),
    duration: String(Math.round(Number(rainDuration) || 60)),
    slope: String(Math.round(Number(slope) || 2)),
    surfaceA: URBAN_FLOOD_SURFACES.some(s => s.id === surfaceA) ? surfaceA : 'concrete',
    surfaceB: URBAN_FLOOD_SURFACES.some(s => s.id === surfaceB) ? surfaceB : 'vegetation'
  }
  if (surfaceA === 'sponge' || surfaceB === 'sponge') {
    query.spongeCap = String(Math.round(Number(spongeCapacity) || 25))
  }
  if (guess && typeof guess === 'string') {
    query.guess = guess.trim().slice(0, 32)
  }
  if (claim && typeof claim === 'string' && claim.trim()) {
    query.claim = claim.trim().slice(0, 240)
  }
  return query
}

/**
 * 从 URL 查询参数解析可复现的对照实验状态
 */
export function parseUrbanFloodShareQuery(query = {}) {
  if (!query || typeof query !== 'object') return null
  const isCompareMode = query.mode === 'compare' || query.shared === '1' || Boolean(query.surfaceA || query.surfaceB)
  if (!isCompareMode && !query.rain && !query.duration) return null

  const clampStep = (val, min, max, fallback) => {
    const num = Number(val)
    if (!Number.isFinite(num)) return fallback
    return Math.max(min, Math.min(max, Math.round(num)))
  }

  const surfaceA = URBAN_FLOOD_SURFACES.some(s => s.id === query.surfaceA) ? query.surfaceA : 'concrete'
  const surfaceB = URBAN_FLOOD_SURFACES.some(s => s.id === query.surfaceB) ? query.surfaceB : 'vegetation'

  return {
    isCompareMode: true,
    isShared: query.shared === '1',
    rainIntensity: clampStep(query.rain, 10, 120, 50),
    rainDuration: clampStep(query.duration, 15, 120, 60),
    slope: clampStep(query.slope, 1, 8, 2),
    spongeCapacity: clampStep(query.spongeCap, 10, 45, 25),
    surfaceA,
    surfaceB,
    guess: typeof query.guess === 'string' ? query.guess.trim().slice(0, 32) : '',
    claim: typeof query.claim === 'string' ? query.claim.trim().slice(0, 240) : ''
  }
}
