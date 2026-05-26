export const climateKnowledge = [
  {
    type: 'periglacial', title: '冰缘地貌 (Periglacial Landforms)',
    body: '冻融作用为主导的地貌过程。多年冻土区的冰楔、冰丘、热融湖塘等为典型。冰缘过程强烈影响高纬度和高海拔地区的地貌发育，对气候变化高度敏感。',
    ref: 'French, H.M. (2018). <em>The Periglacial Environment</em> (4th ed.). Wiley.'
  },
  {
    type: 'fluvial_climate', title: '气候-河流耦合 (Climate-Fluvial Coupling)',
    body: '降水、温度和植被变化直接影响河流侵蚀与沉积过程。干旱半干旱区洪水频发，湿润区连续径流。气候变暖加速高山冰川退缩，改变下游河流水文情势。',
    ref: 'Blum, M.D. & Törnqvist, T.E. (2000). Fluvial responses to climate and sea-level change. <em>Sedimentology</em>, 47(s1), 2-48.'
  },
  {
    type: 'arid', title: '干旱区地貌 (Arid Landscape)',
    body: '降水稀少（<250mm/年）地区以风力和间歇性洪水为主导的地貌系统。盐湖、干盐滩、冲积扇、沙漠等特征地貌。中国西北干旱区为世界典型内陆干旱区。',
    ref: 'Cooke, R.U., Warren, A. & Goudie, A.S. (1993). <em>Desert Geomorphology</em>. UCL Press.'
  },
  {
    type: 'humidity', title: '湿润区地貌 (Humid Landscape)',
    body: '降水充沛地区以河流作用和化学风化为特征。茂密植被覆盖地表，抑制侵蚀。化学风化形成厚层风化壳和高岭土矿床。河网密度大，水循环活跃。',
    ref: 'Strahler, A.N. & Strahler, A.H. (2006). <em>Introducing Physical Geography</em> (4th ed.). Wiley.'
  },
  {
    type: 'quaternary', title: '第四纪气候地貌 (Quaternary Climatic Geomorphology)',
    body: '第四纪冰期-间冰期旋回强烈影响全球地貌。冰盖进退、海平面升降、植被带迁移、黄土堆积等均为气候地貌响应。中国黄土-古土壤序列是古气候研究的经典载体。',
    ref: 'Hays, J.D., Imbrie, J. & Shackleton, N.J. (1976). Variations in the Earth\'s orbit: Pacemaker of the ice ages. <em>Science</em>, 194(4270), 1121-1132.'
  }
]

export function getClimateEntry(type) {
  return climateKnowledge.find(k => k.type === type) || climateKnowledge[0]
}
