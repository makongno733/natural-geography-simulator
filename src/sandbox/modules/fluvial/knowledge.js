export const fluvialKnowledge = [
  {
    type: 'consequent', title: '顺应河 (Consequent River)',
    body: '原始倾斜面上沿原始坡向发育的河流。常在新生陆面或抬升后的准平原上最先形成，反映原始地形的倾斜方向。水系方向与区域坡向一致，是戴维斯侵蚀循环的初始阶段。',
    ref: 'Davis, W.M. (1899). The Geographical Cycle. <em>Geogr. J.</em>, 14(5), 481-504.'
  },
  {
    type: 'subsequent', title: '后成河 (Subsequent River)',
    body: '在顺应河发育之后，沿软岩层走向发育的支流。受地质构造和岩性差异控制，常形成于向斜谷或断层线。标志着水系从原始地形控制转向构造/岩性控制。',
    ref: 'Zernitz, E.R. (1932). Drainage Patterns and Their Significance. <em>J. Geology</em>, 40(6), 498-521.'
  },
  {
    type: 'obsequent', title: '偶成河 (Obsequent River)',
    body: '与原始坡向相反的河流，发育在单斜构造或断层的逆向坡。流向与区域地层倾向相反，河谷形态常呈不对称状。',
    ref: 'Von Engeln, O.D. (1942). <em>Geomorphology</em>. Macmillan.'
  },
  {
    type: 'resequent', title: '再顺河 (Resequent River)',
    body: '原始地形被剥蚀后新形成的与原始坡向一致的河流。其存在说明地貌至少经历了一次完整的侵蚀循环，是戴维斯"多轮回"理论的关键证据。',
    ref: 'Davis, W.M. (1899). The Geographical Cycle. <em>Geogr. J.</em>, 14(5), 481-504.'
  },
  {
    type: 'insequent', title: '随意河 (Insequent River)',
    body: '无固定方向的河流，多见于均质岩层地区，水系形态呈树枝状。典型环境：花岗岩地区、厚层砂岩区。',
    ref: 'Horton, R.E. (1945). Erosional Development of Streams. <em>Geol. Soc. Am. Bull.</em>, 56(3), 275-370.'
  },
  {
    type: 'antecedent', title: '先成河 (Antecedent River)',
    body: '构造抬升前就已存在、能保持原有流路下切的河流。经典案例：雅鲁藏布江大拐弯。下切速率≥地壳抬升速率，是构造-侵蚀耦合研究的关键对象。',
    ref: 'Oberlander, T.M. (1965). The Zagros Streams. <em>Syracuse Geogr. Ser.</em>, 1, 1-168.'
  },
  {
    type: 'superimposed', title: '叠置河 (Superimposed River)',
    body: '从上覆岩层下切进入下伏不同构造地层的河流，保留原流路。揭示了区域地质历史的层次性。',
    ref: 'Chorley, R.J., Schumm, S.A. & Sugden, D.E. (1984). <em>Geomorphology</em>. Methuen.'
  },
  {
    type: 'erosion_cycle', title: '戴维斯侵蚀循环 (Davisian Cycle)',
    body: 'Davis (1899) 提出地貌演化三阶段：<br><br><b>① 青年期：</b>下切为主，V 形谷发育<br><b>② 壮年期：</b>侧蚀加强，河谷展宽，起伏最大<br><b>③ 老年期：</b>形成准平原 (peneplain)，仅余残丘<br><br>构造抬升后循环重新开始，形成多轮回地貌。',
    ref: 'Davis, W.M. (1899). The Geographical Cycle. <em>Geogr. J.</em>, 14(5), 481-504.'
  },
  {
    type: 'stream_power', title: '流功率侵蚀定律 (Stream Power Law)',
    body: '<b>E = K · Aᵐ · Sⁿ</b><br><br>E 为侵蚀速率，K 为侵蚀系数（岩性/气候控制），A 为汇水面积，S 为坡度，m≈0.4-0.6，n≈0.7-1.0。现代地貌学中联系构造-气候-河道的核心定量工具。',
    ref: 'Howard, A.D. et al. (1994). Modeling fluvial erosion. <em>JGR</em>, 99(B7), 13971-13986.'
  }
]

export function getFluvialEntry(type) {
  return fluvialKnowledge.find(k => k.type === type) || fluvialKnowledge[0]
}
