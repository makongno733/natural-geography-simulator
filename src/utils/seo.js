/**
 * 地理共同体 · 动态 SEO 元数据与 JSON-LD Schema.org 知识图谱引擎
 */

const SITE_NAME = '地理共同体'
const BASE_TITLE = '地理共同体 · 地理交流、问答与探索'
const DEFAULT_DESC = '面向地理科学学习者、教师和爱好者的交流社区。提问、分享经验、查找历史讨论，也可探索地理实验与教学资源。'
const DEFAULT_KEYWORDS = '地理教学系统, 地理共同体, 自然地理学, 地理实验, 3D地球, GIS遥感, 气象气候, 水循环, 地壳断层, 太阳高度角'

const ROUTE_SEO_MAP = {
  home: {
    title: '地理共同体 · 交流、提问与探索',
    desc: '交流地理科学问题，分享学习和教学经验，查找历史讨论，并探索地理实验。',
    keywords: '地理学术论坛, 地理问答, 地学前沿, 实时自然事件, 地理共同体'
  },
  community: {
    title: '学术研讨与同行交流 · 地理共同体',
    desc: '在自然地理、人文地理、GIS、地理教育等分区交流观点、提出问题并检索已有讨论。',
    keywords: '地理论坛, 地理问答, 学术研讨, 考研交流, 教学设计'
  },
  questions: {
    title: '地理学术问答与解答采纳 · 地理共同体',
    desc: '提出地理学习、考研、教学和研究中的问题，浏览已有讨论与被采纳的回答。',
    keywords: '地理问答, 地理疑难解答, 考研真题, 最佳答案'
  },
  experiments: {
    title: '三维地理科学实验室 · 交互动力学实验',
    desc: '探索热力环流、流水地貌、断层构造等可交互地理实验，并观察模型的适用范围。',
    keywords: '地理实验, 3D地理, 热力环流模拟, 流水冲刷, 断层模型, 气候降水图'
  },
  'geo-labs': {
    title: '真实数据探究中心 · NASA卫星与DEM',
    desc: '基于 Copernicus GLO-90 DEM 真实高程剖面、NASA 卫星假彩色多时相遥感与 WGS-84 大圆大地线空间测距。',
    keywords: '真实高程DEM, 珠峰剖面, 卫星影像对比, 大圆测距, 空间缓冲区, GIS'
  },
  resources: {
    title: '地理数据与开放学习资源 · 地理共同体',
    desc: '查找有来源与许可说明的地理数据、课程和工具；资源逐项核验后收录。',
    keywords: '开放地理数据, NASADEM, ERA5再分析, 矢量地图, 遥感产品'
  },
  groups: {
    title: '地理社群导航 · 地理共同体',
    desc: '查找经过公开展示授权和审核的地理交流群；也欢迎先在站内公开讨论。',
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
    '@type': routeSchemaType(customData),
    name: title,
    description: description,
    provider: {
      '@type': 'EducationalOrganization',
      name: '地理共同体',
      url: window.location.origin
    },
    inLanguage: 'zh-CN'
  }

  if (schema['@type'] === 'LearningResource') schema.educationalLevel = '初中、高中'

  scriptEl.textContent = JSON.stringify(schema)
}

function routeSchemaType(customData) {
  // 单靠页面标题无法构成 QAPage；真实问答结构要在公开内容可索引后单独生成。
  return customData.isLesson === true ? 'LearningResource' : 'WebPage'
}
