export const glacialKnowledge = [
  {
    type: 'u_valley', title: 'U 形谷 (U-shaped Valley)',
    body: '冰川侵蚀形成的横剖面呈 U 字形的山谷。冰川下蚀和侧蚀能力强，谷底宽平，谷壁陡峭。谷底常有磨光面和冰川擦痕。与河流 V 形谷形成鲜明对比。',
    ref: 'Boulton, G.S. (1974). Processes and patterns of glacial erosion. In: Coates, D.R. (ed.), <em>Glacial Geomorphology</em>. SUNY Binghamton, 41-87.'
  },
  {
    type: 'cirque', title: '冰斗 (Cirque)',
    body: '冰川源头由冰蚀作用形成的半圆形凹地，三面陡壁环绕，出口处有岩槛。冰斗底部常积水成湖（冰斗湖）。冰斗的后退壁发育是冰川剥蚀的重要机制。',
    ref: 'Andrews, J.T. (1971). Techniques of till fabric analysis. <em>British Geomorph. Res. Group Tech. Bull.</em>, 6, 1-43.'
  },
  {
    type: 'arete', title: '刃脊 (Arête)',
    body: '相邻冰斗或冰川谷之间由侵蚀残留形成的锋利山脊。刃脊两侧陡峭，脊线狭窄，是冰川地貌的标志性特征。多条刃脊交汇形成角峰 (horn)。',
    ref: 'Benn, D.I. & Evans, D.J.A. (2010). <em>Glaciers and Glaciation</em> (2nd ed.). Routledge.'
  },
  {
    type: 'moraine', title: '冰碛垄 (Moraine)',
    body: '冰川搬运和堆积形成的垄状地貌。终碛垄标记冰川最大推进位置，侧碛垄分布于冰川两侧，底碛形成冰碛丘陵。冰碛物为未经分选的混杂堆积。',
    ref: 'Dreimanis, A. (1989). Tills: their genetic terminology and classification. In: Goldthwait, R.P. & Matsch, C.L. (eds.), <em>Genetic Classification of Glaciogenic Deposits</em>. Balkema, 17-83.'
  },
  {
    type: 'fjord', title: '峡湾 (Fjord)',
    body: '冰川谷被海平面上升淹没形成的狭长海湾。深度极大，两侧悬崖陡立，水下有冰蚀形成的岩槛。挪威海岸、新西兰南岛西海岸为典型分布区。',
    ref: 'Nesje, A. & Whillans, I.M. (1994). Erosion of Sognefjord, Norway. <em>Geomorphology</em>, 9(1), 33-45.'
  },
  {
    type: 'horn', title: '角峰 (Horn)',
    body: '多个冰斗从不同方向侵蚀同一山体形成的金字塔形尖峰。最经典实例为马特洪峰（Matterhorn）。角峰是强烈冰川作用的地貌标志，常见于高山地区。',
    ref: 'Holmes, A. (1965). <em>Principles of Physical Geology</em> (2nd ed.). Nelson.'
  }
]

export function getGlacialEntry(type) {
  return glacialKnowledge.find(k => k.type === type) || glacialKnowledge[0]
}
