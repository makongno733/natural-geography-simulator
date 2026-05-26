export const aeolianKnowledge = [
  {
    type: 'dune', title: '沙丘 (Dune)',
    body: '风沙堆积形成的丘状地貌。新月形沙丘（barchan）在沙源有限区域发育，横向沙丘在沙源丰富的沙漠区形成。沙丘形态反映风向、风速和沙源供应。',
    ref: 'Bagnold, R.A. (1941). <em>The Physics of Blown Sand and Desert Dunes</em>. Methuen.'
  },
  {
    type: 'yardang', title: '雅丹地貌 (Yardang)',
    body: '风蚀作用在湖相沉积或软岩层上形成的流线型垄槽相间地貌。盛行风方向控制其延伸方向。中国新疆罗布泊和青海柴达木盆地为世界典型分布区。',
    ref: 'McCauley, J.F. et al. (1977). Yardangs of Peru and other arid regions. <em>USGS Prof. Paper</em>, 1028, 153-171.'
  },
  {
    type: 'loess', title: '黄土 (Loess)',
    body: '风成粉砂堆积物，质地均一，无层理，垂直节理发育。中国黄土高原是世界面积最大、厚度最厚的黄土堆积区，记录了 250 万年来全球气候变化历史。',
    ref: 'Liu, T.S. (1985). <em>Loess and the Environment</em>. China Ocean Press.'
  },
  {
    type: 'ventifact', title: '风棱石 (Ventifact)',
    body: '风挟带沙粒磨蚀岩石表面形成的具有棱面的砾石。风棱面指示主导风向，可用于古风向重建。多面风棱石反映风向变化历史。',
    ref: 'Lancaster, N. (1995). <em>Geomorphology of Desert Dunes</em>. Routledge.'
  },
  {
    type: 'deflation', title: '风蚀盆地 (Deflation Basin)',
    body: '风将地表细粒物质吹蚀后形成的洼地。在中国内蒙古、新疆等地形成众多风蚀湖盆。风蚀基底面常接近地下水位，限制其进一步加深。',
    ref: 'Goudie, A.S. (1983). Calcrete. In: Goudie, A.S. & Pye, K. (eds.), <em>Chemical Sediments and Geomorphology</em>. Academic Press, 93-131.'
  }
]

export function getAeolianEntry(type) {
  return aeolianKnowledge.find(k => k.type === type) || aeolianKnowledge[0]
}
