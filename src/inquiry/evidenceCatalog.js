/**
 * 地理探究中心 · 实测与仿真证据卡目录
 * 用于打通“地理探究 (Inquiry) → 实测证据卡 (Evidence) → 学术社区研讨 (Community)”
 */

export const STANDARD_EVIDENCES = [
  {
    id: 'ev-poyang-winter',
    taskId: 'landscape-variation',
    taskTitle: '鄱阳湖枯水期水文—遥感协同观测',
    title: '鄱阳湖枯水期水体面积萎缩与星子站水位观测证据',
    category: '遥感解译与水文观测',
    facts: 'Landsat 多光谱水体指数反演显示：12月湖区有效水体面积降至 1140 km²（较丰水期缩减 68.2%）；同期星子站水位持续低于 10.5m，大面积碟形草滩露出。',
    route: '/inquiry?task=landscape-variation'
  },
  {
    id: 'ev-urban-sponge',
    taskId: 'urban-flood',
    taskTitle: '城市内涝机制与海绵城市方案探究',
    title: '下渗铺装与下沉式绿地洪峰流量削减率对比证据',
    category: '地表水文动力学仿真',
    facts: '在 50mm/h 暴雨强度下：透水铺装与植草沟组合工况的地表径流系数降至 0.28，峰值流量推迟 25 分钟，雨水滞蓄效率显著高于纯沥青水泥工况。',
    route: '/inquiry?task=urban-flood'
  },
  {
    id: 'ev-thermal-circulation',
    taskId: 'thermal-cell',
    taskTitle: '局地受热不均与热力环流风场演化',
    title: '冷热下垫面气压梯度与垂直对流速度实测证据',
    category: '大气动力学实验',
    facts: '热源上方 200m 处测得上升气流速度 2.4 m/s，高空形成相对高气压；冷区下沉气流形成近地面冷高压，实测水平气压梯度力与风速呈严格线性关联。',
    route: '/experiments/meteorology/thermal-circulation'
  }
]

export function getEvidenceById(id) {
  if (!id) return null
  return STANDARD_EVIDENCES.find(e => e.id === id) || null
}
