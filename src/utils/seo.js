/**
 * 地理共同体 · 动态 SEO 元数据与 JSON-LD Schema.org 知识图谱引擎
 */

const SITE_NAME = '地理共同体'
const BASE_TITLE = '地理共同体 · 自然地理与三维科学探索'
const DEFAULT_DESC = '面向地理科学、自然地理学、GIS遥感、环境科学与中学地学教育的开放学术交流与三维仿真实验平台。'
const DEFAULT_KEYWORDS = '地理教学系统, 地理共同体, 自然地理学, 地理实验, 3D地球, GIS遥感, 气象气候, 水循环, 地壳断层, 太阳高度角'

const ROUTE_SEO_MAP = {
  home: {
    title: '地理共同体 · 交流、提问与探索',
    desc: '提出地理科学真问题，交换实测证据与观测数据，联动三维动力学实验，让学术探讨成为沉淀的科学认知。',
    keywords: '地理学术论坛, 地理问答, 地学前沿, 实时自然事件, 地理共同体'
  },
  community: {
    title: '学术研讨与同行交流 · 地理共同体',
    desc: '涵盖自然地理学、人文经济地理、GIS测绘、地学教育等多学科分区的专业研讨空间。',
    keywords: '地理论坛, 地理问答, 学术研讨, 考研交流, 教学设计'
  },
  questions: {
    title: '地理学术问答与解答采纳 · 地理共同体',
    desc: '聚焦地理科学疑难问题求助、考研真题辨析与野外地质疑问，支持最佳答案采纳。',
    keywords: '地理问答, 地理疑难解答, 考研真题, 最佳答案'
  },
  experiments: {
    title: '三维地理科学实验室 · 交互动力学实验',
    desc: '涵盖热力环流、科里奥利力、流水地貌水槽、断层构造、开普勒定律、气候图表等 30 项地学仿真模型。',
    keywords: '地理实验, 3D地理, 热力环流模拟, 流水冲刷, 断层模型, 气候降水图'
  },
  'geo-labs': {
    title: '真实数据探究中心 · NASA卫星与DEM',
    desc: '基于 Copernicus GLO-90 DEM 真实高程剖面、NASA 卫星假彩色多时相遥感与 WGS-84 大圆大地线空间测距。',
    keywords: '真实高程DEM, 珠峰剖面, 卫星影像对比, 大圆测距, 空间缓冲区, GIS'
  },
  resources: {
    title: '权威地理科学数据与开放资源馆',
    desc: '收录 NASA NASADEM、ECMWF ERA5 气象再分析、全国 1:100万 基础地理信息与 Landsat 遥感反射率。',
    keywords: '开放地理数据, NASADEM, ERA5再分析, 矢量地图, 遥感产品'
  },
  groups: {
    title: '全国地理学术社群与研讨共同体导航',
    desc: '面向高校地理硕博、GIS 空间数据圈、一线名师教研室的专业研讨社群索引。',
    keywords: '地理交流群, GIS学习群, 地理教研室, 学术研讨社'
  },
  learning: {
    title: '中学地理大概念体系与知识导图 · 地理教学',
    desc: '人教版初高中地理教材课标大概念情境课件、章节结构知识图谱与互动练习。',
    keywords: '高中地理必修一, 必修二, 选择性必修, 课标大概念, 知识导图'
  }
}

/**
 * 动态更新页面的 Meta 标签与 OpenGraph 标签
 */
export function updatePageSeo(routeName, customData = {}) {
  const metaConfig = ROUTE_SEO_MAP[routeName] || {
    title: customData.title ? `${customData.title} · ${SITE_NAME}` : BASE_TITLE,
    desc: customData.desc || DEFAULT_DESC,
    keywords: customData.keywords || DEFAULT_KEYWORDS
  }

  const finalTitle = customData.title ? `${customData.title} · ${SITE_NAME}` : metaConfig.title
  const finalDesc = customData.desc || metaConfig.desc
  const finalKeywords = customData.keywords || metaConfig.keywords

  // 1. 设置 Document Title
  document.title = finalTitle

  // 2. 更新或创建 meta 标签
  setMetaTag('description', finalDesc)
  setMetaTag('keywords', finalKeywords)

  // 3. 更新 OpenGraph 标签
  setMetaProperty('og:title', finalTitle)
  setMetaProperty('og:description', finalDesc)
  setMetaProperty('og:type', customData.type || 'website')
  setMetaProperty('og:url', window.location.href)

  // 4. 注入 JSON-LD Schema.org 结构化数据
  injectJsonLd(finalTitle, finalDesc, customData)
}

function setMetaTag(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setMetaProperty(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function injectJsonLd(title, description, customData) {
  let scriptEl = document.getElementById('geo-jsonld-schema')
  if (!scriptEl) {
    scriptEl = document.createElement('script')
    scriptEl.id = 'geo-jsonld-schema'
    scriptEl.type = 'application/ld+json'
    document.head.appendChild(scriptEl)
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': customData.isQA ? 'QAPage' : 'LearningResource',
    name: title,
    description: description,
    provider: {
      '@type': 'EducationalOrganization',
      name: '地理共同体',
      url: window.location.origin
    },
    educationalLevel: '初中、高中、大学本科与地理科研',
    inLanguage: 'zh-CN'
  }

  scriptEl.textContent = JSON.stringify(schema)
}
