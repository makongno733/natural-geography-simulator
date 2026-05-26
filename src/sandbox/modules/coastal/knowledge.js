export const coastalKnowledge = [
  {
    type: 'wave_cut', title: '海蚀崖/平台 (Wave-cut Cliff & Platform)',
    body: '波浪侵蚀基岩海岸形成的陡崖和平台。海蚀崖在波浪不断掏蚀下后退，崖前形成微向海倾斜的岩质平台。平台宽度反映海岸发育时间长度和波浪能量。',
    ref: 'Trenhaile, A.S. (1987). <em>The Geomorphology of Rock Coasts</em>. Oxford University Press.'
  },
  {
    type: 'beach', title: '海滩 (Beach)',
    body: '波浪搬运沉积物在海岸带堆积形成的松散堆积体。海滩沉积物从粗砾到细砂不等，其粒度反映波浪能量。海滩剖面包括后滨、前滨和近滨三部分。',
    ref: 'Komar, P.D. (1998). <em>Beach Processes and Sedimentation</em> (2nd ed.). Prentice Hall.'
  },
  {
    type: 'spit_bar', title: '沙嘴/沙坝 (Spit & Barrier)',
    body: '沿岸漂移搬运的沉积物在海岸转折处堆积形成的岬角状地貌。沙嘴继续延伸可封闭海湾形成潟湖。沙坝是平行海岸的线状堆积体，障壁岛为其典型。',
    ref: 'Zenkovich, V.P. (1967). <em>Processes of Coastal Development</em>. Oliver & Boyd.'
  },
  {
    type: 'delta', title: '三角洲 (Delta)',
    body: '河流在入海口处沉积形成的扇形地貌。经典吉尔伯特型三角洲具顶积层、前积层和底积层三层结构。形态受河流作用、波浪和潮汐的相对强度控制。',
    ref: 'Galloway, W.E. (1975). Process framework for describing the morphologic and stratigraphic evolution of deltaic depositional systems. In: Broussard, M.L. (ed.), <em>Deltas</em>. Houston Geol. Soc., 87-98.'
  },
  {
    type: 'estuary', title: '河口湾 (Estuary)',
    body: '海平面上升淹没河流下游河谷形成的半封闭水域。受潮汐和河流双向作用，呈现盐水楔或部分混合型环流。是陆海相互作用的重要界面和研究热点。',
    ref: 'Pritchard, D.W. (1967). What is an estuary? Physical viewpoint. In: Lauff, G.H. (ed.), <em>Estuaries</em>. AAAS Publ. 83, 3-5.'
  }
]

export function getCoastalEntry(type) {
  return coastalKnowledge.find(k => k.type === type) || coastalKnowledge[0]
}
