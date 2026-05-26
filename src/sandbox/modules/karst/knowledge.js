export const karstKnowledge = [
  {
    type: 'fenglin', title: '峰林 (Fenglin / Tower Karst)',
    body: '热带亚热带碳酸盐岩地区由溶蚀作用形成的锥状或塔状山峰群。地下水沿裂隙溶蚀使地表分割成孤立峰体。桂林-阳朔一带的峰林为世界最典型景观。',
    ref: 'Ford, D.C. & Williams, P.W. (2007). <em>Karst Hydrogeology and Geomorphology</em>. Wiley.'
  },
  {
    type: 'sinkhole', title: '溶斗/天坑 (Sinkhole / Tiankeng)',
    body: '地表水沿碳酸盐岩裂隙溶蚀形成的地面塌陷洼地。直径从数米到数百米不等。重庆奉节小寨天坑（坑深 662m）和广西乐业天坑群为世界级景观。',
    ref: 'Zhu, X.W. et al. (1988). <em>Karst Geomorphology of China</em>. Science Press. (朱学稳等，中国岩溶地貌学)'
  },
  {
    type: 'cave', title: '溶洞 (Cave)',
    body: '地下水沿碳酸盐岩裂隙溶蚀和侵蚀形成的洞穴系统。钟乳石（stalactite）、石笋（stalagmite）和石柱为洞内化学沉积。溶洞发育受水位和构造控制。',
    ref: 'Palmer, A.N. (1991). Origin and morphology of limestone caves. <em>GSA Bull.</em>, 103(1), 1-21.'
  },
  {
    type: 'polje', title: '坡立谷 (Polje)',
    body: '喀斯特地区大型封闭洼地（长可达数十公里），底部平坦，常有河流和冲积层。四周为陡峭的石灰岩山地。是在构造和溶蚀双重控制下形成的复合地貌。',
    ref: 'Gams, I. (1978). The Polje: The problem of its origin. <em>Geographica Slovenica</em>, 5, 1-87.'
  },
  {
    type: 'underground_river', title: '地下河 (Underground River)',
    body: '在碳酸盐岩溶蚀管道中流动的地下水流。地下河系统是喀斯特地区主要排水方式，常形成复杂的三维管道网络。中国南方喀斯特区地下河系统极为发育。',
    ref: 'White, W.B. (1988). <em>Geomorphology and Hydrology of Karst Terrains</em>. Oxford Univ. Press.'
  }
]

export function getKarstEntry(type) {
  return karstKnowledge.find(k => k.type === type) || karstKnowledge[0]
}
