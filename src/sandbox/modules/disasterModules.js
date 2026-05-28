export const disasterModules = [
  {
    id: 'typhoon',
    icon: '🌀',
    label: '气象灾害',
    subtitle: '台风 · 暴雨 · 干旱',
    description: '气象灾害是由大气圈剧烈变化引发的自然灾害。台风（热带气旋）是影响我国最主要的气象灾害之一，常伴随狂风、暴雨和风暴潮。',
    keyPoints: [
      '台风结构：台风眼、眼壁、螺旋雨带',
      '台风路径：主要影响东南沿海，向西北方向移动',
      '暴雨洪涝：短时强降水引发城市内涝和山洪',
      '干旱：长期降水偏少导致水资源短缺和农业减产',
    ],
    advancedPoints: [
      '台风生成条件：海温≥26.5°C，科里奥利力足够（纬度≥5°），弱垂直风切变',
      'Dvorak 技术：通过卫星云图估算台风强度的业务化方法',
      '暴雨形成机制：充足水汽供应 + 强烈上升运动 + 持续输送',
      '干旱监测指标：SPI（标准化降水指数）和 PDSI（帕默尔干旱指数）',
    ],
    references: [
      '陈联寿等 (2017). 热带气旋动力学. 科学出版社.',
      'World Meteorological Organization (2020). Tropical Cyclone Operational Plan.',
    ],
    params: [
      { label: '海温阈值', value: '≥26.5°C' },
      { label: '中心气压', value: '870-1010 hPa' },
      { label: '最大风速', value: '17-70+ m/s' },
    ],
  },
  {
    id: 'earthquake',
    icon: '🏚',
    label: '地质灾害',
    subtitle: '地震 · 滑坡 · 泥石流',
    description: '地质灾害是在自然或人为因素作用下形成的、对人类生命财产造成破坏的地质作用。地震是地壳快速释放能量造成的剧烈震动，常引发次生灾害。',
    keyPoints: [
      '地震成因：板块运动积累应力，超过岩石强度时突然释放',
      '震级与烈度：震级表示能量大小，烈度表示地面破坏程度',
      '地震波：纵波（P波）、横波（S波）、面波',
      '地震带：环太平洋地震带、地中海-喜马拉雅地震带',
    ],
    advancedPoints: [
      '弹性回跳理论：Reid（1910）提出——应变积累→突然滑动→弹性回跳',
      '地震矩 M₀ = μAD：与断层面积(A)和滑动距离(D)成正比，比面波震级更物理',
      'Gutenberg-Richter 关系：lgN = a - bM，b值≈1，反映大小地震频率分布',
      '地震预警原理：电磁波 > P波 > S波，利用时间差提前数秒至数十秒警报',
    ],
    references: [
      'Lay, T. & Wallace, T.C. (1995). Modern Global Seismology. Academic Press.',
      '陈运泰 (2018). 地震学原理. 科学出版社.',
    ],
    params: [
      { label: '地壳传播速度（P 波）', value: '5-7 km/s' },
      { label: '地壳传播速度（S 波）', value: '3-4 km/s' },
      { label: '能量释放', value: 'M每增1级≈31.6倍' },
    ],
  },
  {
    id: 'landslide',
    icon: '⛰',
    label: '滑坡与泥石流',
    subtitle: '斜坡运动 · 灾害链',
    description: '滑坡是斜坡岩土体在重力作用下沿滑动面整体下滑的现象。泥石流是含大量泥沙石块的特殊洪流，常在山区暴发。',
    keyPoints: [
      '滑坡要素：滑动面、滑体、滑床、滑坡壁、滑坡台阶',
      '滑坡成因：地形陡峻、岩体破碎、降水集中、人类工程活动',
      '泥石流条件：陡峻地形 + 丰富松散物质 + 短时间大量水流',
      '分布：我国西南山区（云、贵、川、藏）最为多发',
    ],
    advancedPoints: [
      '无限边坡稳定性模型：安全系数 FS = (c + σcos²θ·tanφ) / (σsinθ·cosθ)',
      '泥石流分类：粘性泥石流（容重≥1.8 t/m³）vs 稀性泥石流（1.2-1.8 t/m³）',
      '地震-滑坡灾害链：强震→山体震裂→雨季触发大规模滑坡',
      'InSAR 遥感监测：毫米级地表形变探测，用于滑坡早期识别',
    ],
    references: [
      'Varnes, D.J. (1978). Slope Movement Types and Processes. TRB Special Report.',
      '崔鹏等 (2019). 中国山地灾害及其防治. 科学出版社.',
    ],
    params: [
      { label: '滑坡速度', value: '0.01 m/yr - 10 m/s' },
      { label: '泥石流容重', value: '1.2-2.3 t/m³' },
      { label: '堆积扇坡度', value: '3°-10°' },
    ],
  },
  {
    id: 'flood',
    icon: '🌊',
    label: '洪涝与防灾',
    subtitle: '洪水 · 内涝 · 减灾措施',
    description: '洪涝灾害是江河洪水泛滥或降雨导致地面积水成灾的自然灾害。我国是世界上洪涝灾害最严重的国家之一，主要分布在东部季风区。',
    keyPoints: [
      '洪涝成因：暴雨集中、河湖调蓄能力不足、地面硬化',
      '我国洪涝分布：东部季风区各大江河中下游平原',
      '防灾措施：工程措施（堤坝、水库、蓄滞洪区）和非工程措施（预警、保险）',
      '地理信息技术在防灾中的应用：遥感监测、GNSS定位、GIS分析',
    ],
    advancedPoints: [
      '设计洪水：不同重现期（百年一遇、千年一遇）的洪水位推算',
      '洪峰-洪量关系：单位线法（UH）用于由降雨推求洪水过程线',
      '城市洪涝模拟：SWMM / InfoWorks ICM 模型——管网汇流+地表漫流耦合',
      '海绵城市理论：LID（低影响开发）——透水铺装、雨水花园、绿色屋顶',
    ],
    references: [
      '张建云等 (2015). 中国山洪灾害防治. 科学出版社.',
      'USACE (2000). Hydrologic Modeling System HEC-HMS User\'s Manual.',
    ],
    params: [
      { label: '洪峰流量 Qp', value: '10²-10⁵ m³/s' },
      { label: '城市径流系数', value: '0.3-0.95' },
      { label: '重现期', value: '10-1000 年' },
    ],
  },
]
