/**
 * 全站地理知识、实验、数据与社区统一检索索引
 */
import { mockPosts, mockResources, mockGroups } from '../community/mockData.js'

// 核心地理实验快速索引
export const EXPERIMENT_INDEX = [
  {
    id: 'exp-thermal',
    type: '实验',
    badge: '大气与气候',
    title: '热力环流与风向动力学模拟',
    desc: '冷热下垫面受热不均、垂直对流与近地面气压梯度力演变',
    route: '/experiments/meteorology/thermal-circulation'
  },
  {
    id: 'exp-stream',
    type: '实验',
    badge: '流水地貌',
    title: '流水地貌冲刷与微缩水槽实验',
    desc: '河流溯源侵蚀、下蚀侧蚀、冲积扇多期叠置与河曲发育',
    route: '/experiments/hydrology/stream-table'
  },
  {
    id: 'exp-fault',
    type: '实验',
    badge: '地质构造',
    title: '地壳断层与地质构造受力模型',
    desc: '正断层、逆断层、平移断层受力机制与块状山地/地堑地貌',
    route: '/experiments/geology/fault-model'
  },
  {
    id: 'exp-moon',
    type: '实验',
    badge: '天体运动',
    title: '月相变化与日地月空间几何关系',
    desc: '朔望月、月球公转相位、潮汐引潮力与地月中天观测',
    route: '/experiments/astronomy/moon-phases'
  },
  {
    id: 'exp-earth',
    type: '实验',
    badge: '地球圈层',
    title: '地球三维圈层与深部构造沙盒',
    desc: '莫霍面、古登堡面、岩石圈与地幔对流空间动力学展示',
    route: '/earth3d'
  },
  {
    id: 'exp-solar',
    type: '实验',
    badge: '地球公转',
    title: '正午太阳高度角与昼夜长短模拟器',
    desc: '输入纬度与日期，动态推求太阳赤纬、晨昏线与昼长计算',
    route: '/experiments/astronomy/solar-motion'
  }
]

// 核心地学探究与真实数据实验室索引
export const LAB_INDEX = [
  {
    id: 'lab-terrain',
    type: '探究',
    badge: '真实高程',
    title: '珠峰与青藏高原真实 DEM 地形探究',
    desc: 'NASA 30米网格地形渲染，高程剖面提取与坡度分析',
    route: '/geo-labs/terrain'
  },
  {
    id: 'lab-satellite',
    type: '探究',
    badge: '多时相遥感',
    title: '鄱阳湖与咸海湖泊水体萎缩多时相卫星遥感对比',
    desc: '滑动对比真实卫星假彩色波段，量化湖泊时空退缩率',
    route: '/geo-labs/satellite'
  },
  {
    id: 'lab-urban-flood',
    type: '探究',
    badge: '海绵城市',
    title: '城市内涝水动力学与地表下渗机制探究',
    desc: '对比透水砖、植草沟与水泥硬化路面的暴雨产流削峰效果',
    route: '/inquiry?task=urban-flood'
  }
]

// 核心教材课程大概念快速入口
export const CURRICULUM_INDEX = [
  {
    id: 'curr-bx1',
    type: '教学',
    badge: '高中必修一',
    title: '自然地理基础：地球宇宙环境、大气、水、地貌、植被土壤',
    desc: '课标大概念情境化课件与章节知识导图',
    route: '/高中/必修第一册'
  },
  {
    id: 'curr-bx2',
    type: '教学',
    badge: '高中必修二',
    title: '人文地理与区域协调：人口、乡村城镇、产业区位、人地关系',
    desc: '胡焕庸线、产业集群、城镇化与可持续发展大概念',
    route: '/高中/必修第二册'
  },
  {
    id: 'curr-xb1',
    type: '教学',
    badge: '选择性必修1',
    title: '自然地理要素及相互关系：构造地貌、气压带风带、洋流',
    desc: '三圈环流、锋面气旋、垂直地域分异规律深度进阶',
    route: '/高中/选择性必修1'
  }
]

/**
 * 聚合执行全站多源快速检索
 * @param {string} rawQuery 检索关键词
 * @returns {Array} 匹配的结果项
 */
export function queryGlobalGeography(rawQuery) {
  if (!rawQuery || !rawQuery.trim()) return []
  const q = rawQuery.trim().toLowerCase()

  const results = []

  // 1. 匹配地理实验
  for (const exp of EXPERIMENT_INDEX) {
    if (exp.title.toLowerCase().includes(q) || exp.desc.toLowerCase().includes(q) || exp.badge.toLowerCase().includes(q)) {
      results.push({ ...exp, category: '地理实验室' })
    }
  }

  // 2. 匹配探究与遥感数据实验室
  for (const lab of LAB_INDEX) {
    if (lab.title.toLowerCase().includes(q) || lab.desc.toLowerCase().includes(q) || lab.badge.toLowerCase().includes(q)) {
      results.push({ ...lab, category: '真实数据探究' })
    }
  }

  // 3. 匹配课程教材
  for (const curr of CURRICULUM_INDEX) {
    if (curr.title.toLowerCase().includes(q) || curr.desc.toLowerCase().includes(q) || curr.badge.toLowerCase().includes(q)) {
      results.push({ ...curr, category: '教材与知识库' })
    }
  }

  // 4. 匹配开放科学数据馆
  for (const res of mockResources) {
    if (res.title.toLowerCase().includes(q) || res.description.toLowerCase().includes(q) || res.category.toLowerCase().includes(q)) {
      results.push({
        id: `res-${res.id}`,
        type: '资源',
        badge: res.format,
        title: res.title,
        desc: res.description,
        route: '/resources',
        category: '开放数据馆'
      })
    }
  }

  // 5. 匹配学术社区探讨
  for (const post of mockPosts) {
    if (post.title.toLowerCase().includes(q) || post.body.toLowerCase().includes(q) || (post.tags && post.tags.some(t => t.toLowerCase().includes(q)))) {
      results.push({
        id: `post-${post.id}`,
        type: post.kind === 'question' ? '问答' : '探讨',
        badge: post.categoryName || '学术社区',
        title: post.title,
        desc: post.body.slice(0, 80) + '…',
        route: `/community/post/${post.id}`,
        category: '社区研讨'
      })
    }
  }

  // 6. 匹配专业学术交流社群
  for (const g of mockGroups) {
    if (g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q) || (g.tags && g.tags.some(t => t.toLowerCase().includes(q)))) {
      results.push({
        id: `group-${g.id}`,
        type: '社群',
        badge: g.category,
        title: g.name,
        desc: `${g.description} (群号: ${g.qq_number})`,
        route: '/groups',
        category: '学术社群'
      })
    }
  }

  return results.slice(0, 12)
}
