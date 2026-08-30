import { getPresetsForExperiment } from './presets.js'

const item = (id, name, category, kind, description, concepts, load, presets = ['default']) => Object.freeze({
  id, name, category, kind, description, concepts: Object.freeze(concepts), load, presets: Object.freeze(presets),
})

const experiments = Object.freeze([
  item('thermal-circulation', '热力环流模拟实验', 'meteorology', '3d', '通过冷热源的空气流动，直观展示热力环流的形成过程——冷热不均导致气压差，驱动大气运动。', ['热力环流', '气压差', '海陆风', '山谷风'], () => import('./modules/meteorology/ThermalCirculation.vue'), ['thermal-cell', 'land-sea-breeze', 'atmospheric-circulation']),
  item('coriolis', '科里奥利力旋转水槽实验', 'meteorology', '3d', '在旋转水槽中观察流体运动如何被地转偏向力偏转，理解信风带、西风带和气旋旋转方向的形成。', ['地转偏向力', '风带', '气旋', '科里奥利力'], () => import('./modules/meteorology/Coriolis.vue')),
  item('cloud-bottle', '瓶中云实验', 'meteorology', 'tutorial', '通过简单的瓶子和火柴，演示云的形成过程——凝结核、绝热膨胀与降温凝结。', ['云形成', '凝结核', '绝热膨胀', '露点'], () => import('./modules/meteorology/CloudBottle.js')),
  item('weather-instruments', '自制气象仪器', 'meteorology', 'tutorial', '了解气压计、风速计、雨量计等气象仪器的制作方法和测量原理。', ['气压计', '风速计', '雨量计', '气象观测'], () => import('./modules/meteorology/WeatherInstruments.js')),
  item('stream-table', '流水地貌模拟台', 'hydrology', '3d', '模拟流水对地表的侵蚀、搬运和堆积作用，观察 V 形谷、曲流、冲积扇、三角洲等地貌的形成过程。', ['侵蚀', '搬运', '沉积', '曲流', '三角洲'], () => import('./modules/hydrology/StreamTable.vue')),
  item('groundwater', '地下水/含水层模型', 'hydrology', '3d', '观察地下水的赋存和运动，理解含水层、隔水层、承压水、抽水漏斗等水文地质概念。', ['含水层', '地下水', '承压水', '抽水漏斗'], () => import('./modules/hydrology/Groundwater.vue')),
  item('infiltration', '下渗与径流对比实验', 'hydrology', 'tutorial', '比较不同土壤类型、植被覆盖和坡度条件下的下渗与地表径流差异。', ['下渗', '地表径流', '土壤类型', '植被覆盖'], () => import('./modules/hydrology/Infiltration.js')),
  item('water-cycle', '水循环袋实验', 'hydrology', 'tutorial', '用密封袋模拟微型水循环系统，观察蒸发、凝结、降水、汇集的完整过程。', ['蒸发', '凝结', '降水', '水循环'], () => import('./modules/hydrology/WaterCycle.js')),
  item('sediment-transport', '流水搬运能力实验', 'hydrology', '3d', '探究流速与沉积物颗粒大小的关系，理解 Hjulstrom 曲线——不同流速下的侵蚀、搬运与沉积临界条件。', ['Hjulstrom 曲线', '流速', '颗粒大小', '搬运'], () => import('./modules/hydrology/SedimentTransport.vue')),
  item('fault-model', '沙箱断层/造山楔模型', 'geology', '3d', '通过压缩/拉伸分层沙箱，观察正断层、逆断层和褶皱的发育过程。', ['正断层', '逆断层', '褶皱', '造山楔'], () => import('./modules/geology/FaultModel.vue'), ['default', 'surface-process']),
  item('stratigraphy', '地层叠置律（Steno 定律）', 'geology', '3d', '通过虚拟钻孔和切面，理解地层的叠置原理、水平原理和穿插关系，学习相对定年方法。', ['叠置原理', '水平原理', '穿插关系', '相对定年'], () => import('./modules/geology/Stratigraphy.vue')),
  item('mineral-id', '矿物鉴定/莫氏硬度实验', 'geology', 'tutorial', '学习使用莫氏硬度计、条痕板、放大镜和稀酸鉴别常见矿物。', ['莫氏硬度', '条痕', '光泽', '解理', '碳酸盐反应'], () => import('./modules/geology/MineralID.js')),
  item('potato-core', '土豆岩心取样实验', 'geology', 'tutorial', '模拟钻孔勘探过程——在不同位置取样，根据岩心数据推断地下矿产分布。', ['岩心取样', '钻孔勘探', '三维建模', '矿产勘探'], () => import('./modules/geology/PotatoCore.js')),
  item('soil-erosion', '水土流失实验', 'geology', '3d', '对比不同植被覆盖、坡度和降雨强度条件下的土壤侵蚀差异。', ['水土流失', '植被覆盖', '坡度', '降雨强度'], () => import('./modules/geology/SoilErosion.vue')),
  item('moon-phases', '月相变化演示', 'astronomy', '3d', '在 3D 空间中观察太阳、地球、月球的相对位置变化如何产生不同的月相。', ['月相', '朔望', '日月地关系', '盈亏'], () => import('./modules/astronomy/MoonPhases.vue')),
  item('seasons', '四季成因演示', 'astronomy', '3d', '观察地球绕日公转过程中，地轴倾角（23.5°）如何导致太阳直射点移动和四季更替。', ['地轴倾角', '太阳直射点', '四季', '昼夜长短'], () => import('./modules/astronomy/Seasons.vue'), ['default', 'earth-motion']),
  item('kepler-laws', '开普勒行星运动定律', 'astronomy', '3d', '可视化开普勒三大定律：椭圆轨道、面积速度不变、周期与轨道半长轴的关系。', ['椭圆轨道', '面积速度', '周期定律', '开普勒'], () => import('./modules/astronomy/KeplerLaws.vue')),
  item('solar-motion', '太阳视运动/太阳高度角', 'astronomy', '3d', '模拟不同纬度、不同季节的太阳周日视运动轨迹，理解正午太阳高度角和昼夜长短变化。', ['太阳高度角', '视运动', '方位角', '昼长'], () => import('./modules/astronomy/SolarMotion.vue')),
  item('eclipse', '日食/月食模拟', 'astronomy', '3d', '可视化日月食的几何条件——朔望、交点、本影半影，理解食的类型和发生频率。', ['日食', '月食', '本影', '半影', '食季'], () => import('./modules/astronomy/Eclipse.vue')),

  item('earth-system', '地球系统', 'systems', '3d', '探索地球圈层、海陆分布和宇宙环境。', ['地球圈层', '海陆分布', '自然环境'], () => import('../sandbox/Earth3D.vue'), ['globe-basics', 'continents-oceans', 'regional-environment', 'china-natural-environment', 'cosmic-earth']),
  item('atmosphere-system', '大气系统', 'systems', '3d', '展示大气结构、受热和运动过程。', ['大气分层', '受热过程', '大气环流'], () => import('../textbook/components/AtmosphereViewer.vue'), ['atmosphere-process']),
  item('water-cycle-3d', '水循环三维演示', 'systems', '3d', '从三维视角观察水循环与水体运动。', ['水循环', '水汽输送', '径流'], () => import('../engine/WaterCycleView.vue'), ['water-cycle', 'water-movement']),
  item('landform-sandbox', '地貌沙盘', 'systems', '3d', '探索内外力作用塑造的典型地貌。', ['地貌', '侵蚀', '堆积'], () => import('../sandbox/SandboxApp.vue'), ['landform-process']),
  item('soil-profile-3d', '土壤剖面三维演示', 'systems', '3d', '观察土壤剖面与植被土壤关系。', ['土壤剖面', '成土过程', '植被'], () => import('../soil-profile/SoilProfilePage.vue'), ['vegetation-soil']),
  item('disaster-sandbox', '自然灾害沙盘', 'systems', '3d', '认识典型自然灾害及防灾减灾。', ['自然灾害', '风险', '防灾减灾'], () => import('../sandbox/DisasterSandbox.vue'), ['natural-hazards']),
  item('map-projection', '地图投影', 'systems', '3d', '比较地图投影方式及其空间表达。', ['地图投影', '地图阅读', '区域'], () => import('../sandbox/MapProjectionView.vue'), ['map-reading', 'regional-division']),
  item('geologic-time', '地质年代表', 'systems', '3d', '沿时间轴理解地球演化。', ['地质年代', '地球演化', '生命演化'], () => import('../sandbox/GeologicTimeView.vue')),
  item('spatial-network', '空间网络系统', 'systems', '3d', '通过概念网络探索人口、城镇、产业和区域联系。', ['人口', '城镇', '产业', '区域联系'], () => import('./modules/systems/ConceptSystemAdapter.vue'), ['regional-connections', 'population-distribution', 'regional-development', 'population-system', 'urban-system', 'industry-location', 'transport-network', 'regional-system', 'city-industry-region', 'regional-coordination']),
  item('human-environment', '人地关系系统', 'systems', '3d', '通过概念网络探索资源、环境与可持续发展。', ['资源', '环境', '可持续发展', '国家安全'], () => import('./modules/systems/ConceptSystemAdapter.vue'), ['resource-system', 'sustainable-development', 'natural-zonation', 'regional-resource', 'ecosystem-services', 'resource-security', 'environmental-security', 'environmental-governance']),
])

export function listExperiments() {
  return experiments
}

export function getExperiment(id) {
  return experiments.find(item => item.id === id) || null
}

export function getExperimentPreset(experimentId, presetId) {
  const experiment = getExperiment(experimentId)
  if (!experiment || !experiment.presets.includes(presetId)) return null
  return getPresetsForExperiment(experimentId).find(preset => preset.id === presetId) || null
}

export function buildExperimentRoute({ experimentId, presetId, textbook = {} }) {
  const experiment = getExperiment(experimentId)
  if (!experiment || (presetId && !getExperimentPreset(experimentId, presetId))) return null

  const query = {}
  if (presetId) query.preset = presetId
  for (const key of ['grade', 'book', 'chapter', 'section']) {
    if (textbook[key]) query[key] = textbook[key]
  }

  return {
    name: 'experiment-view',
    params: { category: experiment.category, experiment: experiment.id },
    query,
  }
}
