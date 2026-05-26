export const structuralKnowledge = [
  {
    type: 'fault_scarp', title: '断层崖 (Fault Scarp)',
    body: '断层两盘相对位移形成的陡崖。正断层上盘下降形成断层线崖，逆断层上盘上升形成逆向断层崖。断层崖的形态受岩性、断层面倾角和风化作用的综合控制。',
    ref: 'Anderson, E.M. (1951). <em>The Dynamics of Faulting</em> (2nd ed.). Oliver & Boyd.'
  },
  {
    type: 'fold_mountain', title: '褶皱山 (Fold Mountain)',
    body: '岩层在挤压应力作用下发生弯曲形成的山脉。背斜形成山脊，向斜形成谷地。典型实例：喜马拉雅山脉、阿尔卑斯山脉。褶皱形态与区域应力场方向密切相关。',
    ref: 'Dahlen, F.A. (1990). Critical taper model of fold-and-thrust belts. <em>JGR</em>, 95(B4), 4849-4874.'
  },
  {
    type: 'block_mountain', title: '断块山 (Block Mountain)',
    body: '地壳断裂上升形成的块状山体，如地垒。两侧常为正断层控制，山体陡峭，与相邻盆地形成鲜明对照。美国盆地山脉省为经典断块山地貌区。',
    ref: 'Wernicke, B. (1985). Uniform-sense normal simple shear of the continental lithosphere. <em>Can. J. Earth Sci.</em>, 22(1), 108-125.'
  },
  {
    type: 'rift_valley', title: '裂谷 (Rift Valley)',
    body: '地壳张裂形成的线状凹陷带，两侧为正断层控制。大陆裂谷如东非大裂谷，是板块构造运动的直接表现。裂谷演化可发展为被动大陆边缘。',
    ref: 'McKenzie, D. (1978). Some remarks on the development of sedimentary basins. <em>EPSL</em>, 40(1), 25-32.'
  },
  {
    type: 'unconformity', title: '不整合 (Unconformity)',
    body: '新老地层之间存在沉积间断的接触关系。角度不整合反映构造运动导致的地层倾斜和剥蚀，平行不整合指示地壳升降运动。是解读区域构造演化史的关键标志。',
    ref: 'Sloss, L.L. (1963). Sequences in the cratonic interior of North America. <em>GSA Bull.</em>, 74(2), 93-114.'
  }
]

export function getStructuralEntry(type) {
  return structuralKnowledge.find(k => k.type === type) || structuralKnowledge[0]
}
