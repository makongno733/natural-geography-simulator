export const volcanicKnowledge = [
  {
    type: 'shield_volcano', title: '盾状火山 (Shield Volcano)',
    body: '由基性岩浆（低黏度）喷发形成的坡度平缓的穹形火山。多次熔岩流叠加而成，外形如倒置的武士盾。夏威夷火山群岛的 Mauna Loa 为世界最大盾状火山。',
    ref: 'Macdonald, G.A., Abbott, A.T. & Peterson, F.L. (1983). <em>Volcanoes in the Sea</em> (2nd ed.). Univ. Hawaii Press.'
  },
  {
    type: 'stratovolcano', title: '层状火山 (Stratovolcano)',
    body: '中基性-中酸性岩浆交替喷发形成的锥形火山，由熔岩层和火山碎屑层交替堆叠而成。坡度较陡，典型高锥状。富士山、维苏威火山、圣海伦斯为经典实例。',
    ref: 'Newhall, C.G. & Self, S. (1982). The volcanic explosivity index (VEI). <em>JGR</em>, 87(C2), 1231-1238.'
  },
  {
    type: 'caldera', title: '破火山口 (Caldera)',
    body: '火山喷发后岩浆房空虚导致山体塌陷形成的巨大圆形凹陷。直径可达数公里至数十公里。美国黄石破火山口（64×45 km）为世界最大活火山系统之一。',
    ref: 'Smith, R.L. & Bailey, R.A. (1968). Resurgent cauldrons. <em>GSA Memoir</em>, 116, 613-662.'
  },
  {
    type: 'lava_plateau', title: '熔岩高原 (Lava Plateau)',
    body: '大规模基性岩浆沿地壳裂隙溢流覆盖广大区域形成的平坦高地。印度德干高原、哥伦比亚河高原为典型。西伯利亚暗色岩系与二叠纪末生物大灭绝事件有关。',
    ref: 'Courtillot, V. (1999). <em>Evolutionary Catastrophes: The Science of Mass Extinction</em>. Cambridge Univ. Press.'
  },
  {
    type: 'volcanic_neck', title: '火山颈 (Volcanic Neck)',
    body: '火山锥被剥蚀后，充填在火山通道中的凝固岩浆因抗蚀性强而残留形成的柱状地貌。美国怀俄明州的 Devils Tower 为最经典实例。',
    ref: 'Francis, P. & Oppenheimer, C. (2004). <em>Volcanoes</em> (2nd ed.). Oxford Univ. Press.'
  }
]

export function getVolcanicEntry(type) {
  return volcanicKnowledge.find(k => k.type === type) || volcanicKnowledge[0]
}
