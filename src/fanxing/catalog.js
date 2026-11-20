/**
 * 繁星计划（Fanxing Citizen Science & Collaborative Geography Research）
 * 融合 GitHub 开源项目架构：
 * - hotosm/tasking-manager (BSD-2-Clause): 微任务拆解与角色进度管理
 * - zooniverse/Panoptes (Apache-2.0): 公众科学课题阶段、新手起步指南与贡献记录
 * - CrossRef/rest-api-doc (MIT / CC0): 真实学术文献 DOI 检索与核验
 * - CenterForOpenScience/osf.io (Apache-2.0): 课题、文献、开放数据集与社区实证讨论双向关联
 */

export const INITIAL_FANXING_PROJECTS = [
  {
    id: 'xuzhou-land-cover',
    title: '徐州转型期近二十年土地覆盖与采煤塌陷区湿地演变',
    field: '遥感与土地利用',
    phase: '数据核查',
    status: 'recruiting',
    question: '资源型城市转型过程中，建设用地扩张与采煤塌陷区生态修复（转湿地/水体）在空间上如何分布？',
    method: '基于武汉大学 CLCD 30m 年度土地覆盖数据集与 Landsat 多时相地表反射率影像，对比潘安湖、九里湖及主城区周边的土地覆盖转移矩阵；采用分层抽样在多时相遥感卷帘中目视核查变化样点，把边界模糊或季节性水体波动的样点单独记录供团队复核。',
    role: '遥感样点核查与解译助手',
    commitment: '每周约 2 小时 · 欢迎零基础新手（提供判读图例）',
    task: '根据标准遥感解译图例核查 15–20 个抽样网格（水体/植被/建设用地），记录判读依据、影像日期和不确定之处。',
    linkedLabUrl: '/geo-labs/satellite?place=china&dateA=2024-06-01&dateB=2024-06-15',
    linkedLabTitle: '多时相真实卫星影像卷帘对比实验室',
    tasks: [
      {
        id: 'xz-task-1',
        title: '潘安湖与九里湖塌陷区水体扩张边界多时相样点核查',
        role: '样点核查助手',
        difficulty: '入门 · 零基础可参与',
        targetCount: 30,
        completedCount: 18
      },
      {
        id: 'xz-task-2',
        title: '城乡交错带建设用地与耕地转换不确定像元复核',
        role: '遥感复核助手',
        difficulty: '进阶 · 熟悉假彩色合成',
        targetCount: 20,
        completedCount: 9
      },
      {
        id: 'xz-task-3',
        title: 'CLCD 30m 土地覆盖数据集分类精度与季节误差文献摘录',
        role: '文献整理助手',
        difficulty: '入门 · 适合文献阅读',
        targetCount: 10,
        completedCount: 6
      }
    ],
    papers: [
      {
        title: 'The 30 m annual land cover dataset and its dynamics in China from 1990 to 2019 (CLCD)',
        authors: 'Jie Yang, Xin Huang',
        year: 2021,
        journal: 'Earth System Science Data (ESSD)',
        doi: '10.5194/essd-13-3907-2021',
        url: 'https://doi.org/10.5194/essd-13-3907-2021',
        note: '真实开源数据集与论文（CC BY 4.0）：提供中国 1990—2019 年 30m 分辨率逐年土地覆盖分类方法与验证基准。'
      },
      {
        title: 'Fifty years of Landsat science and impacts',
        authors: 'Michael A. Wulder, Thomas R. Loveland, David P. Roy et al.',
        year: 2022,
        journal: 'Remote Sensing of Environment',
        doi: '10.1016/j.rse.2022.113195',
        url: 'https://doi.org/10.1016/j.rse.2022.113195',
        note: '真实同行评议综述：系统梳理 Landsat 卫星半个世纪以来在地表覆盖监测与长时间序列变化检测中的科学规范。'
      }
    ],
    datasets: [
      {
        name: 'China Land Cover Dataset (CLCD 30m, Zenodo Open Access)',
        url: 'https://doi.org/10.5281/zenodo.4417810',
        license: 'CC BY 4.0'
      },
      {
        name: 'USGS / NASA Landsat 8-9 OLI Level-2 地表反射率产品',
        url: 'https://earthexplorer.usgs.gov/',
        license: 'Public Domain (USGS Open Data)'
      }
    ]
  },
  {
    id: 'city-heat',
    title: '城市蓝绿空间格局对夏季地表温度（LST）的降温阈值探究',
    field: '城市气候与热环境',
    phase: '研究设计',
    status: 'recruiting',
    question: '同一座城市夏季晴空条件下，不同面积与形态的城市公园、河道水体对周边建成区地表温度的降温幅度与影响距离有何差异？',
    method: '选取夏季同期无云卫星热红外反演地表温度（LST）与多光谱植被指数（NDVI）、水体指数（MNDWI），以城市公园与水体边界向外建立 50m–500m 多环缓冲区，对比不同下垫面材料、绿地斑块面积与局地热力环流风道对降温拐点（Threshold Size）的影响。',
    role: '文献整理与热环境判读助手',
    commitment: '每周约 1–2 小时 · 欢迎新手',
    task: '整理 3 篇城市蓝绿空间降温效应研究，按统一表格摘录其使用的数据源、空间分辨率、缓冲区步长与主要结论限制；或结合站内热力环流实验提交 1 张昼夜风道分析证据卡。',
    linkedLabUrl: '/experiments/meteorology',
    linkedLabTitle: '热力环流与城市风道动力学 3D 实验室',
    tasks: [
      {
        id: 'ch-task-1',
        title: '城市蓝绿空间“降温阈值（TVoE）”经典文献数据表摘录',
        role: '文献整理助手',
        difficulty: '入门 · 欢迎新手',
        targetCount: 15,
        completedCount: 11
      },
      {
        id: 'ch-task-2',
        title: '典型城市公园与邻近高密度街区多环缓冲区温差曲线抽样',
        role: '空间数据分析助手',
        difficulty: '进阶 · 熟悉缓冲区概念',
        targetCount: 20,
        completedCount: 8
      },
      {
        id: 'ch-task-3',
        title: '基于 3D 热力环流实验室模拟绿地-建成区局地微风道并生成证据卡',
        role: '实验建模助手',
        difficulty: '入门 · 站内 3D 实验直接操作',
        targetCount: 25,
        completedCount: 14
      }
    ],
    papers: [
      {
        title: 'The energetic basis of the urban heat island',
        authors: 'Timothy R. Oke',
        year: 1982,
        journal: 'Quarterly Journal of the Royal Meteorological Society',
        doi: '10.1002/qj.49710845502',
        url: 'https://doi.org/10.1002/qj.49710845502',
        note: '城市气候学奠基性论文：从地表能量平衡方程阐明城市热岛效应形成的物理机制。'
      },
      {
        title: 'Critical review on the cooling effect of urban blue-green space: A threshold-size perspective',
        authors: 'Zhaowu Yu, Gaoyuan Yang, Henrik Vejre',
        year: 2020,
        journal: 'Urban Forestry & Urban Greening',
        doi: '10.1016/j.ufug.2020.126630',
        url: 'https://doi.org/10.1016/j.ufug.2020.126630',
        note: '真实同行评议综述：提出城市蓝绿空间降温效率阈值（Threshold Value of Efficiency）框架与跨气候带对比方法。'
      }
    ],
    datasets: [
      {
        name: 'ECMWF ERA5-Land 逐小时陆面温度与气象再分析数据集',
        url: 'https://cds.climate.copernicus.eu/',
        license: 'Copernicus Open License'
      },
      {
        name: 'Landsat Collection 2 Level-2 地表温度（Surface Temperature）科学产品',
        url: 'https://www.usgs.gov/landsat-missions/landsat-collection-2-surface-temperature',
        license: 'Public Domain (USGS)'
      }
    ]
  },
  {
    id: 'sponge-city-runoff',
    title: '高密度城区透水铺装与下凹式绿地对暴雨洪峰削减的实证对比',
    field: '城市水文与海绵城市',
    phase: '模型率定与对照',
    status: 'recruiting',
    question: '在 50–100 mm/h 强降雨情景下，不同比例的透水砖铺装与天然植被较传统硬化水泥路面能延缓多少分钟产流洪峰、削减多少峰值流量？',
    method: '结合 Horton 下渗衰减模型与推理公式 Q=C·I·A，在站内「城市内涝降雨径流对照模拟器」中系统改变雨强、历时、坡度与下垫面组合，生成可复现的洪峰延缓证据卡，并与真实海绵城市改造示范区的公开水文监测文献进行参数互校。',
    role: '水文情景模拟与文献互校助手',
    commitment: '每周约 1–2 小时 · 欢迎中学生与本科生参与',
    task: '在站内城市内涝模拟器完成 3 组不同雨强与坡度的“水泥路面 vs 透水铺装/天然植被”对照实验，导出可复现证据卡发布至社区，并核对 1 篇海绵城市雨水径流文献的径流系数范围。',
    linkedLabUrl: '/inquiry?task=urban-flood&mode=compare&rain=50&duration=60&slope=2&surfaceA=concrete&surfaceB=vegetation',
    linkedLabTitle: '城市内涝降雨径流对照模拟器（Q=C·I·A & Horton 模型）',
    tasks: [
      {
        id: 'sc-task-1',
        title: '标准暴雨（50mm/h）与特大暴雨（100mm/h）下三种下垫面洪峰延缓对照实验',
        role: '水文模拟助手',
        difficulty: '入门 · 站内模拟器 3 分钟完成',
        targetCount: 40,
        completedCount: 27
      },
      {
        id: 'sc-task-2',
        title: '坡度（0.5°–8°）对下渗累积量与峰值流量敏感性的正交测试',
        role: '参数率定助手',
        difficulty: '进阶 · 适合定量探究',
        targetCount: 20,
        completedCount: 12
      },
      {
        id: 'sc-task-3',
        title: '海绵城市低影响开发（LID）实测径流系数与模型假设边界核查',
        role: '文献互校助手',
        difficulty: '入门 · 文献阅读与对比',
        targetCount: 15,
        completedCount: 9
      }
    ],
    papers: [
      {
        title: 'Opportunities and challenges of the Sponge City construction related to urban water issues in China',
        authors: 'Jun Xia,iyu Zhang, Chesheng Zhan et al.',
        year: 2017,
        journal: 'Science China Earth Sciences (中国科学: 地球科学)',
        doi: '10.1007/s11430-016-0111-8',
        url: 'https://doi.org/10.1007/s11430-016-0111-8',
        note: '夏军院士团队综述：系统阐述中国海绵城市建设的水文学基础、城市内涝成因与低影响开发（LID）评估方法。'
      },
      {
        title: 'SUDS, LID, BMPs, WSUD and more – The evolution and application of terminology surrounding urban drainage',
        authors: 'Tim D. Fletcher, William Shuster, William F. Hunt et al.',
        year: 2015,
        journal: 'Urban Water Journal',
        doi: '10.1080/1573062X.2014.916314',
        url: 'https://doi.org/10.1080/1573062X.2014.916314',
        note: '国际城市雨洪管理经典文献：厘清低影响开发（LID）与可持续城市排水系统的水文过程与设计准则。'
      }
    ],
    datasets: [
      {
        name: '站内城市内涝 Horton 下渗与推理公式交互仿真模型',
        url: '#/inquiry?task=urban-flood&mode=compare',
        license: 'MIT Open Educational Model'
      }
    ]
  }
]

/**
 * 精选地学前沿真实 DOI 论文库（当离线或首次打开文献检索时立即可看、可核验）
 */
export const CURATED_GEO_PAPERS = [
  {
    doi: '10.5194/essd-13-3907-2021',
    title: 'The 30 m annual land cover dataset and its dynamics in China from 1990 to 2019',
    authors: 'Jie Yang, Xin Huang',
    year: 2021,
    journal: 'Earth System Science Data',
    url: 'https://doi.org/10.5194/essd-13-3907-2021',
    topic: '遥感与土地覆盖',
    projectId: 'xuzhou-land-cover'
  },
  {
    doi: '10.1016/j.ufug.2020.126630',
    title: 'Critical review on the cooling effect of urban blue-green space: A threshold-size perspective',
    authors: 'Zhaowu Yu, Gaoyuan Yang, Henrik Vejre',
    year: 2020,
    journal: 'Urban Forestry & Urban Greening',
    url: 'https://doi.org/10.1016/j.ufug.2020.126630',
    topic: '城市热岛与蓝绿空间',
    projectId: 'city-heat'
  },
  {
    doi: '10.1007/s11430-016-0111-8',
    title: 'Opportunities and challenges of the Sponge City construction related to urban water issues in China',
    authors: 'Jun Xia, Yuyu Zhang, Chesheng Zhan et al.',
    year: 2017,
    journal: 'Science China Earth Sciences',
    url: 'https://doi.org/10.1007/s11430-016-0111-8',
    topic: '城市内涝与海绵城市',
    projectId: 'sponge-city-runoff'
  },
  {
    doi: '10.1016/j.rse.2022.113195',
    title: 'Fifty years of Landsat science and impacts',
    authors: 'Michael A. Wulder, Thomas R. Loveland, David P. Roy et al.',
    year: 2022,
    journal: 'Remote Sensing of Environment',
    url: 'https://doi.org/10.1016/j.rse.2022.113195',
    topic: '卫星遥感半世纪综述',
    projectId: 'xuzhou-land-cover'
  }
]

/**
 * 调用开源 Crossref REST API (https://github.com/CrossRef/rest-api-doc) 实时检索真实 DOI 学术论文
 * 支持浏览器直连（CORS *）与服务端调用
 */
export async function searchCrossrefLiterature(query, { rows = 6, fetchImpl = fetch, signal } = {}) {
  const cleanQuery = String(query || '').trim()
  if (!cleanQuery) return CURATED_GEO_PAPERS

  const url = `https://api.crossref.org/works?query=${encodeURIComponent(cleanQuery)}&rows=${rows}&select=DOI,title,author,published,container-title,URL`
  const response = await fetchImpl(url, {
    signal: signal || (typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(7000) : undefined),
    headers: { Accept: 'application/json' }
  })
  if (!response.ok) throw new Error(`Crossref HTTP ${response.status}`)
  const payload = await response.json()
  const items = Array.isArray(payload?.message?.items) ? payload.message.items : []

  return items
    .map(item => {
      const doi = String(item?.DOI || '').trim()
      const title = Array.isArray(item?.title) && item.title[0] ? String(item.title[0]).replace(/<[^>]+>/g, '').trim() : ''
      if (!doi || !title) return null
      const authors = Array.isArray(item?.author)
        ? item.author
            .slice(0, 3)
            .map(a => [a.given, a.family].filter(Boolean).join(' ') || a.name || '')
            .filter(Boolean)
            .join(', ')
        : '作者见原文'
      const year = item?.published?.['date-parts']?.[0]?.[0] || null
      const journal = Array.isArray(item?.['container-title']) && item['container-title'][0]
        ? String(item['container-title'][0]).trim()
        : '学术期刊/会议录'
      return {
        doi,
        title,
        authors: authors || '作者见原文',
        year,
        journal,
        url: `https://doi.org/${doi}`,
        source: 'Crossref DOI'
      }
    })
    .filter(Boolean)
}
