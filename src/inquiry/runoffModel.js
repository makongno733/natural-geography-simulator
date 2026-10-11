// A qualitative classroom model. Scores express direction only; they are not hydrological measurements.
export function runoffTendency({ rain, slope, vegetation }) {
  const score = rain + slope - vegetation
  const level = score <= 1 ? 1 : score >= 3 ? 3 : 2
  const label = ['较弱', '中等', '较强'][level - 1]
  const reason = level === 3
    ? '降雨更强或坡面更陡时，水更容易沿地表汇流；植被较少也可能减弱截留与入渗。'
    : level === 1
      ? '降雨较弱、坡面较缓或植被较多时，地表汇流倾向较弱。'
      : '降雨、坡度与植被共同影响地表汇流；继续只改变一个条件，观察方向。'
  return { level, label, reason }
}

export function compareScenarios(before, after) {
  const changes = ['rain', 'slope', 'vegetation'].filter(key => before[key] !== after[key])
  if (changes.length === 0) return '两组条件相同。改变一个条件，再观察结果。'
  if (changes.length > 1) return '多个条件同时变化。若要判断单个因素的作用，请每次只改变一项。'
  const key = changes[0]
  const direction = after[key] > before[key] ? '增加' : '减少'
  const name = { rain: '降雨强度', slope: '坡度', vegetation: '植被覆盖' }[key]
  const result = runoffTendency(after).level - runoffTendency(before).level
  const tendency = result > 0 ? '增强' : result < 0 ? '减弱' : '保持同一等级；定性分级不会显示每一次细微变化'
  return `只改变了${name}（${direction}），坡面径流倾向${tendency}。这是教学示意，实际地表还受土壤、地形和前期含水量等影响。`
}
