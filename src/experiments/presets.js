function preset(id, title, purpose, params = {}) {
  return Object.freeze({
    id,
    title,
    purpose,
    camera: Object.freeze({ position: [4.8, 3.2, 6.4], target: [0, 0, 0] }),
    params: Object.freeze(params),
    labels: Object.freeze({
      nodes: Object.freeze(params.nodes || []),
      flows: Object.freeze(params.flows || []),
      layers: Object.freeze(params.layers || []),
      metrics: Object.freeze(params.metrics || []),
    }),
    tasks: Object.freeze(['观察关键要素', '解释过程机制', '联系教材案例']),
  })
}

function defaultPreset(title, purpose) {
  return preset('default', title, purpose)
}

const systemPreset = (id, title, purpose, params) => preset(id, title, purpose, {
  terrain: 'network',
  theme: 'system',
  ...params,
})

export const experimentPresets = Object.freeze({
  'thermal-circulation': Object.freeze([
    preset('thermal-cell', '冷热源环流', '观察冷热不均如何形成闭合环流。', { nodes: ['冷源', '暖源', '上升气流', '下沉气流'], flows: ['近地面流向暖源', '高空流向冷源'], layers: ['近地面', '高空'], metrics: ['温差', '气压差'] }),
    preset('land-sea-breeze', '海陆风', '比较昼夜海陆热力差异引起的风向变化。', { nodes: ['陆地', '海洋', '白天海风', '夜晚陆风'], flows: ['白天海洋→陆地', '夜晚陆地→海洋'], layers: ['白天', '夜晚'], metrics: ['风向', '温差'] }),
    preset('atmospheric-circulation', '大气环流', '从局地热力环流迁移到更大尺度的大气运动。', { nodes: ['低压', '高压', '上升', '下沉'], flows: ['气压梯度驱动'], layers: ['近地面', '高空'], metrics: ['气压', '风向'] }),
  ]),
  coriolis: Object.freeze([defaultPreset('科里奥利力旋转水槽', '观察旋转参考系中流体的偏转。')]),
  'cloud-bottle': Object.freeze([defaultPreset('瓶中云', '识别凝结核、膨胀降温和凝结过程。')]),
  'weather-instruments': Object.freeze([defaultPreset('自制气象仪器', '把观测工具与相应气象要素对应。')]),
  'stream-table': Object.freeze([defaultPreset('流水地貌模拟台', '比较流水侵蚀、搬运和沉积形成的地貌。')]),
  groundwater: Object.freeze([defaultPreset('地下水与含水层', '认识含水层、隔水层和地下水运动。')]),
  infiltration: Object.freeze([defaultPreset('下渗与径流', '比较地表条件对下渗和径流的影响。')]),
  'water-cycle': Object.freeze([defaultPreset('水循环袋实验', '识别蒸发、凝结、降水和汇集环节。')]),
  'sediment-transport': Object.freeze([defaultPreset('流水搬运能力', '探究流速和颗粒大小对搬运的影响。')]),
  'fault-model': Object.freeze([
    defaultPreset('沙箱断层模型', '观察褶皱和断层的形成。'),
    preset('surface-process', '地表塑造过程', '联系构造运动与外力作用共同塑造地表。', { nodes: ['岩层', '断层', '侵蚀', '堆积'], flows: ['内力抬升', '外力削蚀'], layers: ['地壳', '地表'], metrics: ['坡度', '岩性'] }),
  ]),
  stratigraphy: Object.freeze([defaultPreset('地层叠置律', '利用地层关系判断相对年代。')]),
  'mineral-id': Object.freeze([defaultPreset('矿物鉴定', '用硬度、条痕和光泽鉴别矿物。')]),
  'potato-core': Object.freeze([defaultPreset('土豆岩心取样', '根据取样信息推断地下分布。')]),
  'soil-erosion': Object.freeze([defaultPreset('水土流失', '比较植被、坡度和降雨对侵蚀的影响。')]),
  'moon-phases': Object.freeze([defaultPreset('月相变化', '从日地月相对位置解释月相。')]),
  seasons: Object.freeze([
    defaultPreset('四季成因', '观察地轴倾角和公转的共同作用。'),
    preset('earth-motion', '地球运动', '联系地球自转和公转的地理意义。', { nodes: ['地轴倾斜', '公转轨道', '太阳直射点'], flows: ['昼夜更替', '四季变化'], layers: ['赤道面', '黄道面'], metrics: ['昼长', '太阳高度'] }),
  ]),
  'kepler-laws': Object.freeze([defaultPreset('开普勒定律', '可视化椭圆轨道和面积速度规律。')]),
  'solar-motion': Object.freeze([defaultPreset('太阳视运动', '比较纬度与季节对太阳高度的影响。')]),
  eclipse: Object.freeze([defaultPreset('日食月食', '识别发生日月食的几何条件。')]),

  'earth-system': Object.freeze([
    preset('globe-basics', '地球基本结构', '认识地球圈层与整体结构。'),
    preset('continents-oceans', '大洲与大洋', '建立全球海陆分布的空间概念。'),
    preset('regional-environment', '区域自然环境', '从圈层联系理解区域自然环境。'),
    preset('china-natural-environment', '中国自然环境', '联系中国地形、气候和水文特征。'),
    preset('cosmic-earth', '宇宙中的地球', '从宇宙环境理解地球的普通性与特殊性。'),
  ]),
  'atmosphere-system': Object.freeze([
    preset('atmosphere-process', '大气过程', '观察大气受热、分层和运动过程。'),
  ]),
  'water-cycle-3d': Object.freeze([
    preset('water-cycle', '水循环过程', '追踪水在海洋、大气和陆地间的迁移。'),
    preset('water-movement', '水的运动', '联系径流、洋流和水汽输送。'),
  ]),
  'landform-sandbox': Object.freeze([
    preset('landform-process', '地貌过程', '观察内外力作用对地表形态的塑造。'),
  ]),
  'soil-profile-3d': Object.freeze([
    preset('vegetation-soil', '植被与土壤', '联系植被覆盖、成土过程与土壤剖面。'),
  ]),
  'disaster-sandbox': Object.freeze([
    preset('natural-hazards', '自然灾害', '识别致灾因子、风险与防灾措施。'),
  ]),
  'map-projection': Object.freeze([
    preset('map-reading', '地图阅读', '比较投影形变并选择合适地图。'),
    preset('regional-division', '区域划分', '使用地图表达区域边界和空间差异。'),
  ]),
  'geologic-time': Object.freeze([defaultPreset('地质年代', '沿时间轴认识地球演化和生命变迁。')]),
  'spatial-network': Object.freeze([
    systemPreset('regional-connections', '区域联系', '观察区域间的人流、物流和信息流。', { nodes: ['区域节点', '交通枢纽', '产业基地', '市场'], flows: ['人流', '物流', '信息流'], layers: ['节点', '通道', '网络'], metrics: ['可达性', '联系强度'] }),
    systemPreset('population-distribution', '人口分布', '解释人口分布的自然与社会经济差异。', { nodes: ['平原沿海', '城市集聚', '资源环境', '经济机会'], flows: ['人口集聚', '空间差异'], layers: ['自然条件', '经济机会'], metrics: ['密度', '分布'] }),
    systemPreset('regional-development', '区域发展', '理解区域差异、联系与协同发展。', { nodes: ['核心区', '外围区', '资源', '产业'], flows: ['要素流动', '辐射带动'], layers: ['基础', '过程', '效应'], metrics: ['发展水平', '差异'] }),
    systemPreset('population-system', '人口系统', '梳理人口规模、结构与迁移的联系。', { nodes: ['人口规模', '年龄结构', '迁移', '容量'], flows: ['出生死亡', '迁入迁出'], layers: ['数量', '结构', '空间'], metrics: ['增长率', '密度'] }),
    systemPreset('urban-system', '城镇系统', '观察城镇层级、功能区和通勤联系。', { nodes: ['中心城区', '居住区', '工业区', '郊区'], flows: ['通勤', '服务流'], layers: ['核心', '过渡', '外围'], metrics: ['城镇化率', '地租'] }),
    systemPreset('industry-location', '产业区位', '比较市场、交通、劳动力与政策对产业布局的影响。', { nodes: ['原料', '市场', '劳动力', '交通'], flows: ['投入', '产出'], layers: ['自然', '经济', '技术'], metrics: ['成本', '收益'] }),
    systemPreset('transport-network', '交通网络', '分析交通节点、通道与区域可达性。', { nodes: ['港口', '铁路', '机场', '城市'], flows: ['客流', '货流'], layers: ['节点', '通道', '网络'], metrics: ['运量', '时效'] }),
    systemPreset('regional-system', '区域系统', '识别区域整体性和开放性。', { nodes: ['自然环境', '人口', '产业', '制度'], flows: ['要素交换', '反馈'], layers: ['基础', '结构', '功能'], metrics: ['规模', '联系'] }),
    systemPreset('city-industry-region', '城市产业区域', '理解城市、产业和腹地之间的互动。', { nodes: ['中心城市', '产业园区', '腹地', '创新节点'], flows: ['产业链', '技术流'], layers: ['城市', '产业', '区域'], metrics: ['辐射强度', '产业层级'] }),
    systemPreset('regional-coordination', '区域协调', '比较区域分工、补偿与协同机制。', { nodes: ['上游', '下游', '调出区', '调入区'], flows: ['资源调配', '利益协调'], layers: ['流域', '通道', '区域'], metrics: ['公平', '效率'] }),
  ]),
  'human-environment': Object.freeze([
    systemPreset('resource-system', '资源系统', '理解资源供给、消费与环境反馈。', { nodes: ['资源禀赋', '开发利用', '消费需求', '环境压力'], flows: ['资源投入', '废弃物输出'], layers: ['自然', '社会', '经济'], metrics: ['消耗', '承载力'] }),
    systemPreset('sustainable-development', '可持续发展', '协调经济增长、社会公平与生态保护。', { nodes: ['经济', '社会', '生态', '政策'], flows: ['绿色转型', '治理反馈'], layers: ['目标', '路径', '行动'], metrics: ['碳排', '公平'] }),
    systemPreset('natural-zonation', '自然地带性', '解释水热条件与自然景观的空间分异。', { nodes: ['热量', '水分', '土壤', '植被'], flows: ['纬度变化', '海拔变化'], layers: ['气候', '地貌', '生态'], metrics: ['温度', '降水'] }),
    systemPreset('regional-resource', '区域资源', '比较区域资源基础与开发路径。', { nodes: ['资源', '生态脆弱性', '产业', '治理'], flows: ['开发', '修复'], layers: ['基础', '压力', '转型'], metrics: ['资源量', '恢复力'] }),
    systemPreset('ecosystem-services', '生态系统服务', '识别生态系统对人类的多种服务。', { nodes: ['供给服务', '调节服务', '文化服务', '支撑服务'], flows: ['生态服务', '人类需求'], layers: ['生态', '社会', '经济'], metrics: ['服务价值', '生态足迹'] }),
    systemPreset('resource-security', '资源安全', '理解战略资源、储备与供应链风险。', { nodes: ['能源', '耕地', '储备', '供应链'], flows: ['开采', '调配'], layers: ['基础', '储备', '防控'], metrics: ['自给率', '储备量'] }),
    systemPreset('environmental-security', '环境安全', '识别污染、生态保护与气候风险的传导。', { nodes: ['污染源', '生态红线', '气候变化', '安全'], flows: ['风险传导', '生态修复'], layers: ['局地', '区域', '全球'], metrics: ['浓度', '韧性'] }),
    systemPreset('environmental-governance', '环境治理', '建立政策、监督和公众参与的治理闭环。', { nodes: ['政策工具', '企业', '公众', '生态系统'], flows: ['规划', '监督', '反馈'], layers: ['制度', '行动', '评估'], metrics: ['执行力', '协同度'] }),
  ]),
})

export function getPresetsForExperiment(experimentId) {
  return experimentPresets[experimentId] || Object.freeze([])
}

