// 纯几何与假设情景算术；不使用真实测量数据。
export function shadowLength(heightMeters, solarAltitudeDegrees) {
  if (!Number.isFinite(heightMeters) || !Number.isFinite(solarAltitudeDegrees) || heightMeters < 0 || solarAltitudeDegrees <= 0 || solarAltitudeDegrees >= 90) return null
  return heightMeters / Math.tan((solarAltitudeDegrees * Math.PI) / 180)
}

export function illustrativeEmissions(baseline, efficiencyPercent, cleanEnergyPercent) {
  if (![baseline, efficiencyPercent, cleanEnergyPercent].every(Number.isFinite) || baseline < 0 || efficiencyPercent < 0 || efficiencyPercent > 100 || cleanEnergyPercent < 0 || cleanEnergyPercent > 100) return null
  return baseline * (1 - efficiencyPercent / 100) * (1 - cleanEnergyPercent / 100)
}
