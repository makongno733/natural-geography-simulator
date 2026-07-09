const modules = [
  // -- 气象学实验 --
  {
    id: 'thermal-circulation',
    name: '热力环流模拟实验',
    category: 'meteorology',
    type: '3d',
    description: '通过冷热源的空气流动，直观展示热力环流的形成过程——冷热不均导致气压差，驱动大气运动。',
    concepts: ['热力环流', '气压差', '海陆风', '山谷风'],
    pedagogy: {
      objectives: ['说明冷热不均如何形成近地面与高空的空气环流。'],
      inquiryQuestions: ['为什么近地面空气会从冷处流向热处？'],
      observationTasks: [
        {
          title: '比较冷热源上空气流',
          prompt: '观察加热区和冷却区上升、下沉气流的位置，并判断近地面风向。',
          hint: '先看垂直运动，再看底部回流方向。'
        }
      ],
      explanations: ['受热空气膨胀上升、地面形成低压；冷空气收缩下沉、地面形成高压，空气便在压差作用下循环。'],
      quiz: [
        {
          question: '热力环流形成的直接原因是？',
          options: ['地表冷热不均引起气压差', '地球自转突然增强', '水汽全部凝结成云'],
          answer: 0,
          feedback: '冷热不均先造成空气密度和气压差异，再驱动空气运动。'
        }
      ]
    },
    component: () => import('./meteorology/ThermalCirculation.vue'),
  },
  {
    id: 'coriolis',
    name: '科里奥利力旋转水槽实验',
    category: 'meteorology',
    type: '3d',
    description: '在旋转水槽中观察流体运动如何被地转偏向力偏转，理解信风带、西风带和气旋旋转方向的形成。',
    concepts: ['地转偏向力', '风带', '气旋', '科里奥利力'],
    pedagogy: {
      objectives: ['理解运动流体在旋转参考系中会发生偏转。'],
      inquiryQuestions: ['为什么北半球和南半球的偏转方向不同？'],
      observationTasks: [
        {
          title: '追踪水流偏转',
          prompt: '在不同转速下观察水流路径，比较其偏离直线的程度。',
          hint: '重点记录旋转越快时偏转是否更明显。'
        }
      ],
      explanations: ['地球自转使运动物体在不同纬度具有不同线速度，因而在旋转参考系中表现为北半球右偏、南半球左偏。'],
      quiz: [
        {
          question: '北半球自由运动的空气通常会向哪侧偏转？',
          options: ['右侧', '左侧', '始终不偏转'],
          answer: 0,
          feedback: '北半球受地转偏向力影响，运动方向会相对原路径向右偏。'
        }
      ]
    },
    component: () => import('./meteorology/Coriolis.vue'),
  },
  {
    id: 'cloud-bottle',
    name: '瓶中云实验',
    category: 'meteorology',
    type: 'tutorial',
    description: '通过简单的瓶子和火柴，演示云的形成过程——凝结核、绝热膨胀与降温凝结。',
    concepts: ['云形成', '凝结核', '绝热膨胀', '露点'],
    pedagogy: {
      objectives: ['说出云形成所需的降温条件和凝结核作用。'],
      inquiryQuestions: ['为什么瓶中冒出的烟雾不能单独形成稳定的“云”？'],
      observationTasks: [
        {
          title: '观察减压后的雾化',
          prompt: '挤压并迅速松开瓶身，记录瓶内白雾出现与消失的时机。',
          hint: '把变化和气压、温度变化联系起来。'
        }
      ],
      explanations: ['松开瓶身后气压降低，空气绝热膨胀并降温；水汽遇到凝结核便更容易达到露点而形成小水滴。'],
      quiz: [
        {
          question: '瓶中白雾突然出现，最关键的直接条件是？',
          options: ['空气降温达到露点', '瓶内氧气增多', '瓶壁温度升高'],
          answer: 0,
          feedback: '绝热膨胀带来的降温使水汽凝结，这是白雾出现的直接原因。'
        }
      ]
    },
    component: () => import('./meteorology/CloudBottle.js'),
  },
  {
    id: 'weather-instruments',
    name: '自制气象仪器',
    category: 'meteorology',
    type: 'tutorial',
    description: '了解气压计、风速计、雨量计等气象仪器的制作方法和测量原理。',
    concepts: ['气压计', '风速计', '雨量计', '气象观测'],
    pedagogy: {
      objectives: ['了解常见气象仪器的结构与对应观测要素。'],
      inquiryQuestions: ['为什么不同气象要素需要不同的观测装置？'],
      observationTasks: [
        {
          title: '对应仪器与数据',
          prompt: '分别指出气压计、风速计和雨量计测量的对象，并观察刻度变化方式。',
          hint: '思考仪器把自然变化转成读数的中间环节。'
        }
      ],
      explanations: ['气象仪器通过形变、转动、集水等方式，把难以直接感知的气象要素转换为可读的物理量。'],
      quiz: [
        {
          question: '雨量计最直接测量的是哪一项？',
          options: ['一定时间内降水汇集的深度', '空气湿度百分比', '风向变化频率'],
          answer: 0,
          feedback: '雨量计通过收集降水并换算水深来表示降水量。'
        }
      ]
    },
    component: () => import('./meteorology/WeatherInstruments.js'),
  },

  // -- 水文学实验 --
  {
    id: 'stream-table',
    name: '流水地貌模拟台',
    category: 'hydrology',
    type: '3d',
    description: '模拟流水对地表的侵蚀、搬运和堆积作用，观察 V 形谷、曲流、冲积扇、三角洲等地貌的形成过程。',
    concepts: ['侵蚀', '搬运', '沉积', '曲流', '三角洲'],
    pedagogy: {
      objectives: ['解释流水侵蚀、搬运和沉积在不同河段中的表现。'],
      inquiryQuestions: ['为什么弯道外侧比内侧更容易被侵蚀？'],
      observationTasks: [
        {
          title: '比较弯道两侧变化',
          prompt: '调高水流后观察河道外侧与内侧的冲刷、堆积差异。',
          hint: '把流速快慢和侵蚀、沉积位置对应起来。'
        }
      ],
      explanations: ['流速较大的位置侵蚀和搬运能力更强，流速减小时颗粒物会按粒径先粗后细沉积。'],
      quiz: [
        {
          question: '河流流速降低时通常最先沉积的是？',
          options: ['较粗颗粒', '最细黏土', '全部同时沉积'],
          answer: 0,
          feedback: '较粗颗粒需要更高流速维持搬运，所以会优先沉积。'
        }
      ]
    },
    component: () => import('./hydrology/StreamTable.vue'),
  },
  {
    id: 'groundwater',
    name: '地下水/含水层模型',
    category: 'hydrology',
    type: '3d',
    description: '观察地下水的赋存和运动，理解含水层、隔水层、承压水、抽水漏斗等水文地质概念。',
    concepts: ['含水层', '地下水', '承压水', '抽水漏斗'],
    pedagogy: {
      objectives: ['区分含水层、隔水层与抽水漏斗的意义。'],
      inquiryQuestions: ['为什么持续抽水会让地下水面在井周围下降？'],
      observationTasks: [
        {
          title: '观察抽水后的水位曲面',
          prompt: '启动抽水并查看井周围地下水位变化，判断漏斗中心和范围。',
          hint: '留意靠近井口处水位下降是否更明显。'
        }
      ],
      explanations: ['地下水沿水力坡度由高水位流向低水位，抽水会打破原有平衡，使井周形成向内汇流的漏斗状水面。'],
      quiz: [
        {
          question: '抽水漏斗最直接反映了什么变化？',
          options: ['井周地下水位下降', '地表气温上升', '降水量突然增加'],
          answer: 0,
          feedback: '抽水使井周地下水被持续抽出，地下水位因而向井中心凹陷。'
        }
      ]
    },
    component: () => import('./hydrology/Groundwater.vue'),
  },
  {
    id: 'infiltration',
    name: '下渗与径流对比实验',
    category: 'hydrology',
    type: 'tutorial',
    description: '比较不同土壤类型、植被覆盖和坡度条件下的下渗与地表径流差异。',
    concepts: ['下渗', '地表径流', '土壤类型', '植被覆盖'],
    pedagogy: {
      objectives: ['比较土壤、坡度和植被对下渗与径流的影响。'],
      inquiryQuestions: ['为什么植被覆盖增加后地表径流常会减弱？'],
      observationTasks: [
        {
          title: '对比不同地表条件',
          prompt: '记录不同土壤和覆盖条件下水进入土壤的速度以及外流量变化。',
          hint: '同时关注“渗得快”和“流得多”这两个指标。'
        }
      ],
      explanations: ['土壤孔隙、根系拦截和地表粗糙度都会影响雨水能否渗入，从而改变地表径流形成强度。'],
      quiz: [
        {
          question: '下列哪种条件通常更有利于下渗？',
          options: ['植被较好、土壤疏松', '裸地且坡度很陡', '地表已经完全不透水'],
          answer: 0,
          feedback: '疏松土壤和植被根系有利于水分进入土壤并减缓地表汇流。'
        }
      ]
    },
    component: () => import('./hydrology/Infiltration.js'),
  },
  {
    id: 'water-cycle',
    name: '水循环袋实验',
    category: 'hydrology',
    type: 'tutorial',
    description: '用密封袋模拟微型水循环系统，观察蒸发、凝结、降水、汇集的完整过程。',
    concepts: ['蒸发', '凝结', '降水', '水循环'],
    pedagogy: {
      objectives: ['概括蒸发、凝结、降水和汇集在水循环中的连续关系。'],
      inquiryQuestions: ['为什么密封袋里也能出现“降水”现象？'],
      observationTasks: [
        {
          title: '追踪袋内水的循环',
          prompt: '观察袋底液态水、袋壁小水滴和回落水滴的变化顺序。',
          hint: '先找水从液态变成水汽，再找它回到液态的位置。'
        }
      ],
      explanations: ['受热后液态水蒸发成水汽，遇到较冷袋壁凝结成水滴，水滴增大后下落，构成简化的微型水循环。'],
      quiz: [
        {
          question: '袋壁上出现小水滴，主要对应水循环中的哪个环节？',
          options: ['凝结', '蒸发', '下渗'],
          answer: 0,
          feedback: '水汽遇冷变成液态小水滴，这是凝结过程。'
        }
      ]
    },
    component: () => import('./hydrology/WaterCycle.js'),
  },
  {
    id: 'sediment-transport',
    name: '流水搬运能力实验',
    category: 'hydrology',
    type: '3d',
    description: '探究流速与沉积物颗粒大小的关系，理解 Hjulstrom 曲线——不同流速下的侵蚀、搬运与沉积临界条件。',
    concepts: ['Hjulstrom 曲线', '流速', '颗粒大小', '搬运'],
    pedagogy: {
      objectives: ['理解流速变化对不同粒径沉积物搬运状态的影响。'],
      inquiryQuestions: ['为什么同样的流速对粗砂和黏土的作用不一样？'],
      observationTasks: [
        {
          title: '比较不同粒径启动条件',
          prompt: '逐步改变流速，记录各种颗粒开始运动和停止沉积的临界状态。',
          hint: '注意“开始被冲起”和“继续被搬运”不是同一门槛。'
        }
      ],
      explanations: ['Hjulstrom 曲线表明沉积物的起动、搬运和沉积临界流速与粒径有关，细颗粒还受黏聚力影响。'],
      quiz: [
        {
          question: 'Hjulstrom 曲线主要用来表示什么关系？',
          options: ['流速与颗粒状态的关系', '气压与温度的关系', '纬度与昼长的关系'],
          answer: 0,
          feedback: '这条曲线用于判断不同粒径在何种流速下会侵蚀、搬运或沉积。'
        }
      ]
    },
    component: () => import('./hydrology/SedimentTransport.vue'),
  },

  // -- 地质实验 --
  {
    id: 'fault-model',
    name: '沙箱断层/造山楔模型',
    category: 'geology',
    type: '3d',
    description: '通过压缩/拉伸分层沙箱，观察正断层、逆断层和褶皱的发育过程。',
    concepts: ['正断层', '逆断层', '褶皱', '造山楔'],
    pedagogy: {
      objectives: ['识别挤压和拉张条件下常见断层与褶皱构造。'],
      inquiryQuestions: ['为什么不同受力方向会形成不同类型的断层？'],
      observationTasks: [
        {
          title: '比较压缩与拉伸结果',
          prompt: '分别施加压缩和拉伸，观察地层错动方向以及是否伴随褶皱。',
          hint: '可先判断上盘与下盘的相对位移。'
        }
      ],
      explanations: ['岩层在不同应力场中会发生脆性破裂或塑性弯曲，拉张常形成正断层，挤压常形成逆断层和褶皱。'],
      quiz: [
        {
          question: '在挤压环境中更常见的构造是？',
          options: ['逆断层', '正断层', '张裂谷'],
          answer: 0,
          feedback: '挤压会使岩层缩短增厚，更容易形成逆断层和褶皱。'
        }
      ]
    },
    component: () => import('./geology/FaultModel.vue'),
  },
  {
    id: 'stratigraphy',
    name: '地层叠置律（Steno 定律）',
    category: 'geology',
    type: '3d',
    description: '通过虚拟钻孔和切面，理解地层的叠置原理、水平原理和穿插关系，学习相对定年方法。',
    concepts: ['叠置原理', '水平原理', '穿插关系', '相对定年'],
    pedagogy: {
      objectives: ['利用叠置、水平和穿插关系进行相对定年判断。'],
      inquiryQuestions: ['为什么穿过地层的岩脉通常比被穿过的地层年轻？'],
      observationTasks: [
        {
          title: '判读剖面先后顺序',
          prompt: '查看剖面中各层位与侵入体关系，写出从老到新的形成顺序。',
          hint: '先用叠置关系，再判断是否存在切穿现象。'
        }
      ],
      explanations: ['未受扰动沉积层通常下老上新，而穿插构造必须在被穿过地层形成之后才出现，因此更年轻。'],
      quiz: [
        {
          question: '若一条岩脉切穿多层沉积岩，通常说明岩脉？',
          options: ['比这些沉积岩年轻', '比这些沉积岩更古老', '与各层同时形成'],
          answer: 0,
          feedback: '穿插关系表明切穿者形成时间晚于被切穿者。'
        }
      ]
    },
    component: () => import('./geology/Stratigraphy.vue'),
  },
  {
    id: 'mineral-id',
    name: '矿物鉴定/莫氏硬度实验',
    category: 'geology',
    type: 'tutorial',
    description: '学习使用莫氏硬度计、条痕板、放大镜和稀酸鉴别常见矿物。',
    concepts: ['莫氏硬度', '条痕', '光泽', '解理', '碳酸盐反应'],
    pedagogy: {
      objectives: ['掌握利用硬度、条痕和反应特征鉴别矿物的思路。'],
      inquiryQuestions: ['为什么矿物鉴定通常要结合多项性质而不是只看颜色？'],
      observationTasks: [
        {
          title: '依次记录鉴定特征',
          prompt: '对样品进行硬度、条痕、光泽和稀酸反应观察，并比较差异。',
          hint: '优先记录不易受杂质影响的性质。'
        }
      ],
      explanations: ['颜色可能受杂质影响，而硬度、解理、条痕和与稀酸的反应更能稳定反映矿物内部结构和成分。'],
      quiz: [
        {
          question: '鉴别方解石时较有代表性的现象是？',
          options: ['遇稀酸起泡', '一定能吸磁', '条痕呈金黄色'],
          answer: 0,
          feedback: '方解石属于碳酸盐矿物，遇稀酸常会明显起泡。'
        }
      ]
    },
    component: () => import('./geology/MineralID.js'),
  },
  {
    id: 'potato-core',
    name: '土豆岩心取样实验',
    category: 'geology',
    type: 'tutorial',
    description: '模拟钻孔勘探过程——在不同位置取样，根据岩心数据推断地下矿产分布。',
    concepts: ['岩心取样', '钻孔勘探', '三维建模', '矿产勘探'],
    pedagogy: {
      objectives: ['理解钻孔取样如何帮助推断地下矿体空间分布。'],
      inquiryQuestions: ['为什么只靠一个钻孔往往不能准确判断矿体范围？'],
      observationTasks: [
        {
          title: '比较不同钻孔样品',
          prompt: '在多个位置取样，记录岩心中矿层出现的深度和厚度差异。',
          hint: '把多个钻孔信息连成剖面来判断连续性。'
        }
      ],
      explanations: ['单个钻孔只提供一点信息，需综合多个钻孔的深度和岩性对比，才能推测矿体在地下的延伸方向与规模。'],
      quiz: [
        {
          question: '增加钻孔数量的主要目的是什么？',
          options: ['提高对地下分布的判断可靠性', '让矿体自动增厚', '减少岩心信息量'],
          answer: 0,
          feedback: '更多钻孔能提供更多空间控制点，使地下结构推断更可靠。'
        }
      ]
    },
    component: () => import('./geology/PotatoCore.js'),
  },
  {
    id: 'soil-erosion',
    name: '水土流失实验',
    category: 'geology',
    type: '3d',
    description: '对比不同植被覆盖、坡度和降雨强度条件下的土壤侵蚀差异。',
    concepts: ['水土流失', '植被覆盖', '坡度', '降雨强度'],
    pedagogy: {
      objectives: ['分析坡度、降雨和植被对水土流失强弱的共同作用。'],
      inquiryQuestions: ['为什么同样的降雨下裸地通常比植被覆盖地流失更严重？'],
      observationTasks: [
        {
          title: '对比侵蚀沟发育',
          prompt: '改变坡度、雨强和植被条件，观察泥沙输出和沟蚀形态变化。',
          hint: '重点比较有无植被时地表被雨滴直接打击的差异。'
        }
      ],
      explanations: ['较大的坡度和降雨强度会增强径流侵蚀，而植被可拦截雨滴、固持土壤并减缓地表水流速度。'],
      quiz: [
        {
          question: '下列哪项最有助于减轻坡面水土流失？',
          options: ['增加植被覆盖', '清除全部表层植物', '持续加大雨强'],
          answer: 0,
          feedback: '植被能固土、减缓径流并削弱雨滴打击，是常见的水土保持措施。'
        }
      ]
    },
    component: () => import('./geology/SoilErosion.vue'),
  },

  // -- 天文学实验 --
  {
    id: 'moon-phases',
    name: '月相变化演示',
    category: 'astronomy',
    type: '3d',
    description: '在 3D 空间中观察太阳、地球、月球的相对位置变化如何产生不同的月相。',
    concepts: ['月相', '朔望', '日月地关系', '盈亏'],
    pedagogy: {
      objectives: ['用日地月相对位置解释常见月相变化。'],
      inquiryQuestions: ['为什么月亮看起来有盈亏，但月球本身并没有真的变少？'],
      observationTasks: [
        {
          title: '对应位置与月相',
          prompt: '转动月球位置，观察从地球视角看到的受光部分形状变化。',
          hint: '关注“看到多少被太阳照亮的一半球”。'
        }
      ],
      explanations: ['月球始终有一半被太阳照亮，地球上看到的亮面比例会随日地月相对位置变化而改变，形成不同月相。'],
      quiz: [
        {
          question: '满月时，月球大致位于哪里？',
          options: ['地球位于太阳和月球之间', '月球位于太阳和地球之间', '月球与太阳在地球同侧近旁'],
          answer: 0,
          feedback: '满月时地球大致位于日月之间，因此月球朝向地球的一面大多被照亮。'
        }
      ]
    },
    component: () => import('./astronomy/MoonPhases.vue'),
  },
  {
    id: 'seasons',
    name: '四季成因演示',
    category: 'astronomy',
    type: '3d',
    description: '观察地球绕日公转过程中，地轴倾角（23.5°）如何导致太阳直射点移动和四季更替。',
    concepts: ['地轴倾角', '太阳直射点', '四季', '昼夜长短'],
    pedagogy: {
      objectives: ['解释四季变化与地轴倾角、太阳直射点移动的关系。'],
      inquiryQuestions: ['为什么四季变化不是由地日距离远近决定的？'],
      observationTasks: [
        {
          title: '跟踪直射点南北移动',
          prompt: '观察地球公转时太阳直射点位置和昼夜长短的同步变化。',
          hint: '把半球受热差异和季节变化联系起来。'
        }
      ],
      explanations: ['地轴倾斜且方向基本稳定，使不同季节各纬度获得的太阳高度和日照时长不同，进而形成四季。'],
      quiz: [
        {
          question: '四季更替的根本原因是？',
          options: ['地轴倾角导致太阳辐射分配变化', '月球绕地球公转', '地球每天自转一周'],
          answer: 0,
          feedback: '关键在于地轴倾斜造成太阳直射点移动和昼夜长短变化，而非地日距离简单变化。'
        }
      ]
    },
    component: () => import('./astronomy/Seasons.vue'),
  },
  {
    id: 'kepler-laws',
    name: '开普勒行星运动定律',
    category: 'astronomy',
    type: '3d',
    description: '可视化开普勒三大定律：椭圆轨道、面积速度不变、周期与轨道半长轴的关系。',
    concepts: ['椭圆轨道', '面积速度', '周期定律', '开普勒'],
    pedagogy: {
      objectives: ['概括开普勒三大定律对行星运动的描述。'],
      inquiryQuestions: ['为什么行星靠近太阳时运行会更快？'],
      observationTasks: [
        {
          title: '比较近日点与远日点速度',
          prompt: '观察同一行星在轨道不同位置的移动快慢和扫过面积。',
          hint: '注意相同时间间隔内连线面积是否接近相等。'
        }
      ],
      explanations: ['行星沿椭圆轨道绕太阳运动，面积定律说明相同时间扫过面积相等，因此近日点速度更快、远日点速度更慢。'],
      quiz: [
        {
          question: '开普勒第二定律说明行星在相等时间内？',
          options: ['扫过相等面积', '走过相等弧长', '与太阳距离不变'],
          answer: 0,
          feedback: '面积速度不变指的是日心连线在相等时间内扫过的面积相等。'
        }
      ]
    },
    component: () => import('./astronomy/KeplerLaws.vue'),
  },
  {
    id: 'solar-motion',
    name: '太阳视运动/太阳高度角',
    category: 'astronomy',
    type: '3d',
    description: '模拟不同纬度、不同季节的太阳周日视运动轨迹，理解正午太阳高度角和昼夜长短变化。',
    concepts: ['太阳高度角', '视运动', '方位角', '昼长'],
    pedagogy: {
      objectives: ['理解纬度和季节如何影响太阳视运动轨迹与正午高度。'],
      inquiryQuestions: ['为什么同一天不同纬度的正午太阳高度差异明显？'],
      observationTasks: [
        {
          title: '比较不同纬度轨迹',
          prompt: '切换纬度和季节，观察太阳升落方位、轨迹弧度和正午高度变化。',
          hint: '重点看夏至、冬至与赤道、中纬度的对比。'
        }
      ],
      explanations: ['太阳视运动是地球自转下的表观运动，其轨迹高低和昼长变化受太阳直射点位置与观测纬度共同控制。'],
      quiz: [
        {
          question: '影响正午太阳高度角的关键因素包括？',
          options: ['纬度和太阳直射点位置', '海拔和风速', '气压和洋流'],
          answer: 0,
          feedback: '正午太阳高度主要由当地纬度与当日太阳直射纬度的差值决定。'
        }
      ]
    },
    component: () => import('./astronomy/SolarMotion.vue'),
  },
  {
    id: 'eclipse',
    name: '日食/月食模拟',
    category: 'astronomy',
    type: '3d',
    description: '可视化日月食的几何条件——朔望、交点、本影半影，理解食的类型和发生频率。',
    concepts: ['日食', '月食', '本影', '半影', '食季'],
    pedagogy: {
      objectives: ['说明日食、月食发生所需的朔望条件和影锥关系。'],
      inquiryQuestions: ['为什么并不是每个月朔日和望日都会发生食现象？'],
      observationTasks: [
        {
          title: '判断影区位置',
          prompt: '调整日地月相对位置，观察本影、半影落在地球或月球上的条件。',
          hint: '别忘了月球轨道与黄道面并不完全重合。'
        }
      ],
      explanations: ['只有当朔或望发生在月球轨道交点附近时，日地月三者才足够接近同一直线，从而形成日食或月食。'],
      quiz: [
        {
          question: '月食发生时通常处于哪种月相？',
          options: ['望', '朔', '上弦'],
          answer: 0,
          feedback: '月食要求地球位于日月之间，因此通常发生在望日附近。'
        }
      ]
    },
    component: () => import('./astronomy/Eclipse.vue'),
  },
]

export const categoryLabels = {
  meteorology: '气象学实验',
  hydrology: '水文学实验',
  geology: '地质实验',
  astronomy: '天文学实验',
}

export const categoryIcons = {
  meteorology: '🌤',
  hydrology: '💧',
  geology: '⛏',
  astronomy: '🔭',
}

export function getRelatedExperiments(currentId, limit = 4) {
  const current = modules.find(m => m.id === currentId)
  if (!current) return []

  return modules
    .filter(m => m.id !== currentId)
    .map(m => {
      const sharedConcepts = m.concepts.filter(c => current.concepts.includes(c))
      return { ...m, sharedCount: sharedConcepts.length, sharedConcepts }
    })
    .filter(m => m.sharedCount > 0)
    .sort((a, b) => b.sharedCount - a.sharedCount)
    .slice(0, limit)
}

export default modules
