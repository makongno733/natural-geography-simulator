export const SOIL_LAYERS = {
  simple: [
    {
      id: 'O',
      label: 'O 枯枝落叶层',
      labelEn: 'O Horizon — Organic Layer',
      color: 0x4a3728,
      thickness: 0.08,
      infoSimple: '地表堆积的枯枝、落叶和动物残体，分解后形成腐殖质，使土壤肥沃。',
      infoPro: null
    },
    {
      id: 'A',
      label: 'A 淋溶层（表土层）',
      labelEn: 'A Horizon — Topsoil',
      color: 0x6b4c3b,
      thickness: 0.22,
      infoSimple: '位于地表附近的土层，含有丰富的腐殖质，颜色较深，是植物根系最密集的区域。',
      infoPro: null
    },
    {
      id: 'E',
      label: 'E 淀积层（淋失层）',
      labelEn: 'E Horizon — Eluviation Layer',
      color: 0x8c7a6b,
      thickness: 0.15,
      infoSimple: '水分下渗时带走黏粒和矿物质的区域，颜色较浅，质地疏松。',
      infoPro: null
    },
    {
      id: 'B',
      label: 'B 母质层',
      labelEn: 'B Horizon — Subsoil',
      color: 0x9c5a3a,
      thickness: 0.30,
      infoSimple: '由风化碎屑物组成，缺乏有机质，是土壤形成的母体材料。',
      infoPro: null
    },
    {
      id: 'C',
      label: 'C 母岩层（基岩）',
      labelEn: 'C Horizon — Parent Material',
      color: 0x7a7a7a,
      thickness: 0.25,
      infoSimple: '坚硬的未风化岩石，是土壤发育的基底。',
      infoPro: null
    }
  ],
  professional: [
    {
      id: 'Oi',
      label: 'Oi 枯落物层',
      labelEn: 'Oi — Fibric (slightly decomposed)',
      color: 0x5c3d2e,
      thickness: 0.03,
      infoSimple: null,
      infoPro: '纤维质有机层，≥40%纤维可辨识。C/N比高，分解缓慢。'
    },
    {
      id: 'Oe',
      label: 'Oe 半分解层',
      labelEn: 'Oe — Hemic (intermediate decomposition)',
      color: 0x4a2f1e,
      thickness: 0.03,
      infoSimple: null,
      infoPro: '半分解有机层，纤维含量17–40%。介于Oa与Oi之间的分解程度。'
    },
    {
      id: 'Oa',
      label: 'Oa 腐殖质层',
      labelEn: 'Oa — Sapric (highly decomposed)',
      color: 0x3b2416,
      thickness: 0.04,
      infoSimple: null,
      infoPro: '高度分解有机质，纤维<17%。腐殖质含量高，CEC（阳离子交换量）大，保肥保水能力强。'
    },
    {
      id: 'A',
      label: 'A 表土层',
      labelEn: 'A Horizon — Mineral Topsoil',
      color: 0x6b4c3b,
      thickness: 0.12,
      infoSimple: null,
      infoPro: '矿质土与腐殖质混合。Ap为耕作层（plowed horizon）。关键指标：CEC、pH、有机碳含量。Munsell色值通常为10YR 3/2至10YR 4/3。'
    },
    {
      id: 'E',
      label: 'E 淋溶层',
      labelEn: 'E Horizon — Eluvial (Albic)',
      color: 0x9e9083,
      thickness: 0.10,
      infoSimple: null,
      infoPro: '黏粒及铁铝被淋失的漂白层。Eluviation（淋溶作用）为主导过程。常见于森林土壤（Spodosols、Alfisols）。Munsell色值通常为10YR 6/2至7/3。'
    },
    {
      id: 'Bt',
      label: 'Bt 黏化层',
      labelEn: 'Bt — Argillic Horizon',
      color: 0xb8733a,
      thickness: 0.12,
      infoSimple: null,
      infoPro: '黏粒淀积层（Illuviation）。黏粒胶膜（argillans）包裹结构面。USDA诊断层：Argillic horizon。'
    },
    {
      id: 'Bw',
      label: 'Bw 风化层',
      labelEn: 'Bw — Cambic Horizon',
      color: 0xa56334,
      thickness: 0.10,
      infoSimple: null,
      infoPro: '风化发育层，颜色或结构的发育但黏粒积累不明显。WRB诊断：Cambic horizon。'
    },
    {
      id: 'Bs',
      label: 'Bs 铁铝层',
      labelEn: 'Bs — Spodic Horizon',
      color: 0x8b4513,
      thickness: 0.08,
      infoSimple: null,
      infoPro: '铁铝氧化物与有机质复合物累积层。USDA Spodic horizon，常见于灰土（Spodosols）。'
    },
    {
      id: 'C',
      label: 'C 母质层',
      labelEn: 'C Horizon — Parent Material',
      color: 0x7a7a7a,
      thickness: 0.22,
      infoSimple: null,
      infoPro: '风化基岩碎屑。Cr为可手铲挖掘的软弱基岩。几乎无有机质，保留母岩矿物组成。'
    },
    {
      id: 'R',
      label: 'R 基岩层',
      labelEn: 'R Layer — Hard Bedrock',
      color: 0x555555,
      thickness: 0.16,
      infoSimple: null,
      infoPro: '坚硬基岩（花岗岩、玄武岩、石英岩等），24h浸水不崩解，手铲不可挖掘。USDA R层。'
    }
  ]
}

export const MODE_NAMES = {
  simple: { label: '简单模式', subtitle: '适用于高中地理教学' },
  professional: { label: '专业模式', subtitle: '适用于研究生 / USDA & WRB 体系' }
}
