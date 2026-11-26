/**
 * 地理共同体 · 融合设计主题（方案一「百科检索与知识阅读」× 方案二「学术社区与高效讨论」）
 * 固化为统一默认风格 `hybrid`，同时保留 URL 参数向后兼容。
 */
import { ref } from 'vue'

export const DESIGN_THEMES = [
  {
    id: 'hybrid',
    shortName: '百科检索 × 学术社区',
    name: '百科检索与学术实证社区融合风格',
    subtitle: 'Wikipedia Compendium & Empirical Research Workbench',
    badge: '词条检索直达 · 实证讨论工作台',
    desc: '融合方案一的纸白高对比维基百科式词条检索、左目录右主栏阅读架构，与方案二的三维地球观测视窗、结构化科学证据卡及多维话题标签体系。'
  }
]

export const activeDesignTheme = ref('hybrid')

export function setDesignTheme(themeId = 'hybrid') {
  activeDesignTheme.value = themeId || 'hybrid'
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-geo-theme', activeDesignTheme.value)
  }
}

export function syncThemeFromRoute(query = {}) {
  const candidate = typeof query.theme === 'string' && query.theme.trim() ? query.theme.trim() : 'hybrid'
  setDesignTheme(candidate)
}
