/**
 * 地理探究中心 · 实测与仿真证据卡目录
 * 用于打通“地理探究 (Inquiry) → 证据卡 (Evidence) → 学术社区研讨 (Community)”
 * 严格区分“教学仿真，非现场实测”与“遥感/台站观测记录”。
 */

export const STANDARD_EVIDENCES = [
  {
    id: 'ev-urban-sponge',
    taskId: 'urban-flood',
    taskTitle: '城市内涝机制与海绵城市方案探究',
    title: '同一场暴雨下不同地表铺装（水泥沥青 vs 天然植被/海绵透水）径流峰值对照证据',
    category: '地表水文动力学仿真',
    modelName: '城市暴雨产流与海绵下渗仿真模型（归一化推理公式与 Horton 下渗简化教学模型）',
    evidenceType: '教学仿真对照结果（教学仿真，非现场实测）',
    disclaimer: '教学仿真，非现场实测',
    conditions: '固定降雨强度 50 mm/h（暴雨）· 降雨历时 60 分钟 · 地表坡度 2° · 累积降水量 50 mm',
    facts:
      '【教学仿真，非现场实测】在 50 mm/h、60 分钟暴雨（坡度 2°）下：对照组 A「传统水泥/沥青」下渗率 5%（径流系数 0.95），地表径流峰值 44.4 m³/s（6 分钟达峰，积水约 23 mm）；对照组 B「天然林地草甸」下渗率 75%（径流系数 0.25），地表径流峰值 11.7 m³/s（36 分钟达峰，积水 0 mm，相对削峰率 74%）；「海绵透水铺装（25 mm 调蓄层）」下渗率 35%，地表径流峰值 30.4 m³/s（22 分钟达峰，相对削峰率 32%）。',
    limitations:
      '适用边界：基于匀质汇水区经验参数（Q = C·I·A 教学归一化公式，默认管网排水能力 25 mm/h），用于对比不同下渗条件下的产流趋势；未计入真实城市地下排水管网顶托、空间降雨不均与微地形汇流，不可替代现场实测。',
    route: '/inquiry?task=urban-flood&mode=compare&shared=1&rain=50&duration=60&slope=2&surfaceA=concrete&surfaceB=vegetation'
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
    conditions: '对比时期：夏季丰水期（7—8月）vs 冬季枯水期（12—1月）· 观测站点：星子水文站及湖区遥感影像',
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
    conditions: '冷热源温差 ΔT = 8 °C · 白昼海陆风模式（陆地受热快、海洋升温慢）',
    facts:
      '【教学仿真，非现场实测】当陆地受热升温快于海洋（ΔT = 8 °C）时，陆地上空空气膨胀上升，高空等压面上凸形成相对高压，近地面形成热低压；海洋上空空气冷却下沉，近地面形成冷高压，水平气压梯度力驱动近地面海风由海洋吹向陆地。',
    limitations:
      '适用边界：理想无背景大尺度天气系统干扰的局地环流模型；真实海岸带风向还受盛行季风、海岸线曲率、地形阻挡与科里奥利力共同调制。',
    route: '/experiments/meteorology/thermal-circulation'
  }
]

export function getEvidenceById(id) {
  if (!id) return null
  return STANDARD_EVIDENCES.find(e => e.id === id) || null
}
