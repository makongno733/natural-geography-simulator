/**
 * 地理探究与 3D 观察 · 实测与仿真证据卡目录
 * 用于打通“真实数据 / 3D 实验 / 地理探究 → 结构化证据卡 → 学术社区研讨 (Community)”
 * 严格区分“教学仿真，非现场实测”与“真实卫星观测 · NASA GIBS / 台站记录”，并对旧链接或不完整参数提供稳健降级。
 */

export const STANDARD_EVIDENCES = [
  {
    id: 'ev-urban-sponge',
    taskId: 'urban-flood',
    taskTitle: '城市内涝机制与海绵城市方案探究',
    title: '同一场暴雨下不同地表铺装（水泥沥青 vs 天然植被/海绵透水）径流峰值对照证据',
    category: '地表水文动力学仿真',
    modelName: '城市暴雨产流与海绵下渗教学仿真模型（推理公式与调蓄衰减简化模型）',
    evidenceType: '教学仿真对照结果（教学仿真，非现场实测）',
    disclaimer: '教学仿真，非现场实测',
    isRealData: false,
    conditions: '固定降雨强度 50 mm/h（暴雨）· 降雨历时 60 分钟 · 地表坡度 2° · 累积降水量 50 mm',
    groupA: { label: '对照组 A · 传统水泥/沥青', metric: '径流峰值 44.4 m³/s · 下渗率 5% · 6 分钟达峰' },
    groupB: { label: '对照组 B · 天然林地草甸', metric: '径流峰值 11.7 m³/s · 下渗率 75% · 36 分钟达峰（延缓 +30 分钟）' },
    facts:
      '【教学仿真，非现场实测】在 50 mm/h、60 分钟暴雨（坡度 2°）下：对照组 A「传统水泥/沥青」下渗率 5%（径流系数 0.95），地表径流峰值 44.4 m³/s（6 分钟达峰，积水约 23 mm）；对照组 B「天然林地草甸」下渗率 75%（径流系数 0.25），地表径流峰值 11.7 m³/s（36 分钟达峰，较同条件水泥基准延缓 +30 分钟，积水 0 mm，相对削峰率 74%）。',
    limitations:
      '适用边界：基于 A ≈ 3.06 km² 匀质教学汇水区（换算系数 A_eff = 0.85）与简化下渗/排水参数（默认管网排水能力 25 mm/h）推演不同地表对产流峰值与达峰时间的相对影响；未模拟真实管网复杂顶托与降雨空间不均，不可替代现场实测。',
    route: '/inquiry?task=urban-flood&mode=compare&shared=1&rain=50&duration=60&slope=2&surfaceA=concrete&surfaceB=vegetation'
  },
  {
    id: 'ev-solar-motion-solstice',
    taskId: 'solar-motion',
    taskTitle: '地球运动 · 太阳周日视运动与正午太阳高度 3D 对照',
    title: '同纬度（北纬 40° 北京）夏至日与冬至日正午太阳高度角 H、昼长与竿影长度对照证据',
    category: '天体几何与地球运动 3D 仿真',
    modelName: '地平天球太阳视运动与正午太阳高度 3D 几何模型（H = 90° - |φ - δ|）',
    evidenceType: '三维天球几何模型对照（教学仿真，非现场实测）',
    disclaimer: '教学仿真，非现场实测',
    isRealData: false,
    conditions: '固定观测地：北京（40.0°N）· 正午时刻（12:00 真太阳时）· 对照节气：夏至（δ = +23.4°）vs 冬至（δ = -23.4°）',
    groupA: { label: '条件 A · 夏至日 (δ=+23.4°)', metric: '正午 H = 73.4° · 昼长 14.9h · 影长 0.74m' },
    groupB: { label: '条件 B · 冬至日 (δ=-23.4°)', metric: '正午 H = 26.6° · 昼长 9.1h · 影长 5.00m' },
    facts:
      '【教学仿真，非现场实测】固定北纬 40.0°（北京）：（1）夏至日太阳直射北回归线（+23.4°），东北升、西北落，正午太阳高度角 H = 73.4°，2.5m 立竿正午北向影长仅 0.74m，昼长约 14.9 小时；（2）冬至日太阳直射南回归线（-23.4°），东南升、西南落，正午太阳高度角 H = 26.6°（较夏至降低 46.9°），正午北向影长拉长至 5.00m，昼长缩短至约 9.1 小时。',
    limitations:
      '适用边界：基于球面天文几何公式计算，未计入大气折射对日出日落视高度的抬升（约 34′）以及局地地形建筑遮挡；建筑采光工程计算需结合当地标准日照规范。',
    route: '/experiments/astronomy/solar-motion?preset=default&lat=40&place=%E5%8C%97%E4%BA%AC&season=summer&compare=winter&view=meridian&shared=1'
  },
  {
    id: 'ev-satellite-east-asia',
    taskId: 'satellite-compare',
    taskTitle: '多时相卫星遥感影像卷帘对比',
    title: '多时相 NASA MODIS 真彩色卫星影像卷帘对比观测记录',
    category: '对地观测遥感影像对比',
    modelName: 'NASA MODIS Terra Corrected Reflectance (True Color) · NASA GIBS 开放瓦片服务',
    evidenceType: '真实卫星遥感观测（NASA MODIS Terra 实测影像）',
    disclaimer: '真实卫星观测 · 需注意云层遮挡与分辨率边界',
    isRealData: true,
    conditions: '观测区域：中国东部 · 长江中下游湖区与云系（31.0°N, 112.0°E）· 对比日期：2024-06-01 vs 2024-06-15 · 空间分辨率：250m–1km',
    groupA: { label: '左侧基准期影像', metric: '基准日期 MODIS 真彩色图层' },
    groupB: { label: '右侧对比期影像', metric: '同坐标对比日期 MODIS 真彩色图层' },
    facts:
      '已记录两期卫星影像的观测区域、对比日期与卷帘位置。请点击下方复现链接打开卷帘画布，在排除云层遮挡与轨道扫描缺口后，结合晴空窗口核对具体的水体、云系、植被或积雪差异。',
    limitations:
      '判读边界：光学遥感无法穿透厚云（亮白团块多为云层遮挡而非地表积雪），低纬度相邻轨道间可能存在黑色扫描缺口；定量水体面积反演需结合去云合成与地面水文站实测水位。',
    route: '/geo-labs/satellite?place=china&dateA=2024-06-01&dateB=2024-06-15&split=50&from=home-globe&shared=1'
  },
  {
    id: 'ev-poyang-winter',
    taskId: 'landscape-variation',
    taskTitle: '鄱阳湖枯水期水文—遥感协同观测',
    title: '鄱阳湖丰枯水期水体面积变化与星子站水位对照证据',
    category: '遥感解译与水文观测',
    modelName: '多时相光学遥感水体指数（NDWI）与水文站水位对照模型',
    evidenceType: '遥感与水文站历史观测衍生教学数据',
    disclaimer: '教学示范整编数据，定量工程需核对原始遥感景号',
    isRealData: true,
    conditions: '对比时期：夏季丰水期（7—8月）vs 冬季枯水期（12—1月）· 观测站点：星子水文站及湖区遥感影像',
    groupA: { label: '夏季丰水期（7—8月）', metric: '湖区高水位宽阔水体景观' },
    groupB: { label: '冬季枯水期（12月）', metric: '水体缩减约 68.2%（约 1140 km²）' },
    facts:
      '多时相水体范围对比显示：冬季枯水期（12月）湖区有效水体面积降至约 1140 km²（较夏季丰水期缩减约 68.2%）；同期星子站水位低于 10.5 m，大面积碟形草滩露出，呈现“枯水一线”景观。',
    limitations:
      '适用边界：光学遥感水体提取受云层遮挡、浅滩浑浊水体光谱混淆及过境时刻水位波动影响，需结合连续水文站实测水位交叉验证。',
    route: '/inquiry?task=landscape-variation'
  },
  {
    id: 'ev-thermal-circulation',
    taskId: 'thermal-cell',
    taskTitle: '局地受热不均与热力环流风场演化',
    title: '冷热下垫面受热不均引发气压梯度与海陆风/山谷风环流对照证据',
    category: '大气动力学教学仿真',
    modelName: '局地热力环流与近地面气压梯度三维动力学教学仿真模型',
    evidenceType: '教学仿真模型推演（教学仿真，非现场实测）',
    disclaimer: '教学仿真，非现场实测',
    isRealData: false,
    conditions: '冷热源温差 ΔT = 8 °C · 白昼海陆风模式（陆地受热快、海洋升温慢）',
    groupA: { label: '☀️ 白昼海风模式', metric: '陆地低压(L) ← 海洋高压(H) · 吹海风' },
    groupB: { label: '🌙 夜晚陆风模式', metric: '陆地高压(H) → 海洋低压(L) · 吹陆风' },
    facts:
      '【教学仿真，非现场实测】当陆地受热升温快于海洋（ΔT = 8 °C）时，陆地上空空气膨胀上升，高空等压面上凸形成相对高压，近地面形成热低压；海洋上空空气冷却下沉，近地面形成冷高压，水平气压梯度力驱动近地面海风由海洋吹向陆地；夜晚冷热源反转则转为陆风。',
    limitations:
      '适用边界：理想无背景大尺度天气系统干扰的局地环流模型；真实海岸带风向还受盛行季风、海岸线曲率、地形阻挡与科里奥利力共同调制。',
    route: '/experiments/meteorology/thermal-circulation?preset=land-sea-breeze'
  }
]

export function getEvidenceById(id) {
  if (!id) return null
  return STANDARD_EVIDENCES.find(e => e.id === id) || null
}

/**
 * 根据 evidenceId 与可选的 URL/帖子动态参数解析出完整的结构化证据卡；
 * 若遇到旧帖、未知 ID 或参数残缺，始终返回安全可读的兜底结构。
 */
export function resolveCommunityEvidence(evidenceId, custom = {}) {
  const base = getEvidenceById(evidenceId)
  if (!base && !custom?.compareUrl && !custom?.conditions && !custom?.facts) {
    return null
  }

  const fallbackBase = base || {
    id: evidenceId || 'ev-custom',
    taskId: 'custom-observation',
    taskTitle: '地理观察与模型对照记录',
    title: custom.title || '地理对照观察科学证据卡',
    category: '地理实证与模型观察',
    modelName: custom.modelName || '地理共同体交互实验与观测台',
    evidenceType: custom.evidenceType || '教学仿真或遥感观察记录',
    disclaimer: custom.disclaimer || '教学仿真，非现场实测',
    isRealData: Boolean(custom.isRealData),
    conditions: '已记录标准对照条件（参数缺省时使用默认基准）',
    groupA: null,
    groupB: null,
    facts: '包含两组对照状态下的地理观察结果，点击下方链接可打开对应实验或图层还原观察。',
    limitations: '适用边界：请结合具体模型假设、遥感云层遮挡情况及地面实测资料综合判读。',
    route: '/experiments'
  }

  return {
    ...fallbackBase,
    title: custom.evidenceTitle || fallbackBase.title,
    modelName: custom.modelName || fallbackBase.modelName,
    evidenceType: custom.evidenceType || fallbackBase.evidenceType,
    disclaimer: custom.disclaimer || fallbackBase.disclaimer,
    isRealData: custom.isRealData !== undefined ? Boolean(custom.isRealData) : fallbackBase.isRealData,
    conditions: custom.conditions || fallbackBase.conditions,
    groupA: custom.groupA || fallbackBase.groupA,
    groupB: custom.groupB || fallbackBase.groupB,
    facts: custom.facts || fallbackBase.facts,
    limitations: custom.limitations || fallbackBase.limitations,
    route: custom.compareUrl || custom.route || fallbackBase.route
  }
}
