/**
 * 中学地理教学系统 · 多维按钮点击动画与交互调度引擎
 *
 * 核心设计：
 * 1. 探索跃迁 / 页面跳转类 (pop): 乒乓球弹跳与视线引导光梭（延迟 160ms 顺畅进入新页面）
 * 2. 课本折叠 / 导图文献类 (fold): 羊皮纸/折纸透视翻折与舒展（0ms 原生触发）
 * 3. 模式切换 / 坐标分段类 (horizon): 地平线/等高线收缩成线后展开（0ms 原生触发）
 * 4. 实验操纵 / 仿真控制类 (seismic): 地震波微脉冲与岩石活塞沉降（0ms 原生触发）
 * 5. 罗盘回旋与关闭类 (spin): 罗盘偏转回旋与收拢（0ms 原生触发）
 * 6. 定向退回类 (retreat): 地理勘探回退弹射（0ms 原生触发）
 */

const CATEGORY_SELECTORS = [
  {
    category: 'spin',
    className: 'is-clicked-spin',
    duration: 240,
    selector: [
      '.info-close',
      '.glossary-close',
      '.mindmap-btn-close',
      '.mindmap-tooltip-close',
      'header button[aria-label*="关闭"]',
      '[data-anim="spin"]'
    ].join(',')
  },
  {
    category: 'retreat',
    className: 'is-clicked-retreat',
    duration: 220,
    selector: [
      '.back',
      '.back-link',
      '.orbit-arrow-prev',
      '[data-anim="retreat"]'
    ].join(',')
  },
  {
    category: 'fold',
    className: 'is-clicked-fold',
    duration: 230,
    selector: [
      '[data-expand-all]',
      '[data-collapse-all]',
      '.learning-section-controls button',
      '.learning-section header button',
      '.brief-actions .ghost-action',
      '.brief-actions .primary-action',
      '.concept-defs button',
      '.tutorial-step-header',
      '.glossary-term',
      '.mindmap-btn',
      '[data-anim="fold"]'
    ].join(',')
  },
  {
    category: 'horizon',
    className: 'is-clicked-horizon',
    duration: 240,
    selector: [
      '.mode-btn',
      '.level-btn',
      '.zoom-btn',
      '.coord-btn',
      '.reset-btn',
      '.region-tab-btn',
      '.step-dot',
      '.mode-tab',
      '.planet-track button',
      '.globe-actions button',
      '.globe-shortcuts button',
      '.category-tab',
      '.filter-btn',
      '.nav-toggle',
      '[data-anim="horizon"]'
    ].join(',')
  },
  {
    category: 'seismic',
    className: 'is-clicked-seismic',
    duration: 220,
    selector: [
      '.quick-btn',
      '.tool-btn',
      '.play-btn',
      '.guide-btn',
      '.lock-btn',
      '.he-reset',
      '.sn-reset',
      '.preset-btn',
      '.fm-buttons button',
      '.auto-btn',
      '.comment-submit',
      '.assistant-actions button',
      '.controls button',
      '[data-anim="seismic"]'
    ].join(',')
  },
  {
    category: 'pop',
    className: 'is-clicked-pop',
    duration: 240,
    selector: [
      '.btn-primary',
      '.portal-enter-btn',
      '.btn-explore-scroll',
      '.btn-explore-ghost',
      '.hero-action',
      '.study-link-btn',
      '.primary-experiment',
      '.tb-link',
      '.book-card',
      '.chapter-card',
      '.exp-card',
      '.card-satellite',
      '.card-terrain',
      '.card-ai',
      '.nav-account-btn',
      '.skip-link',
      '.exp-hero-link',
      '.text-link',
      '.scroll-down-indicator',
      '.orbit-arrow-next',
      '.assistant-fab',
      '.account-card button.primary',
      'a.nav-link',
      '[data-anim="pop"]'
    ].join(',')
  }
]

// 匹配按钮所属语义类别
function matchButtonCategory(target) {
  if (!target || !(target instanceof Element)) return null

  // 1. 优先检查显式标注的 data-anim
  const explicit = target.closest('[data-anim]')
  if (explicit) {
    const type = explicit.getAttribute('data-anim')
    const config = CATEGORY_SELECTORS.find(c => c.category === type)
    if (config) return { element: explicit, ...config }
  }

  // 2. 按特异度由高到低依次探测类别选择器
  for (const config of CATEGORY_SELECTORS) {
    const matchedEl = target.closest(config.selector)
    if (matchedEl) {
      return { element: matchedEl, ...config }
    }
  }

  // 3. 普通站内链接也提供反馈，覆盖课程目录、实验结果与页脚导航。
  const fallbackLink = target.closest('a[href]')
  if (fallbackLink && !fallbackLink.hasAttribute('download')) {
    return {
      element: fallbackLink,
      category: 'pop',
      className: 'is-clicked-pop',
      duration: 240
    }
  }

  // 4. 通用兜底：普通按钮使用轻快地震波按压
  const fallbackBtn = target.closest('button, [role="button"], input[type="button"], input[type="submit"]')
  if (fallbackBtn) {
    return {
      element: fallbackBtn,
      category: 'seismic',
      className: 'is-clicked-seismic',
      duration: 220
    }
  }

  return null
}

function triggerAnimation(element, className, duration) {
  if (!element) return

  // 检查是否开启了系统“减少动态效果”
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }

  // 如果已经在播放，快速重置重播
  if (element.classList.contains(className)) {
    element.classList.remove(className)
    // 强制回流以重启动画
    void element.offsetWidth
  }

  element.classList.add(className)

  const cleanup = () => {
    element.classList.remove(className)
    element.removeEventListener('animationend', cleanup)
  }

  element.addEventListener('animationend', cleanup, { once: true })
  // 超时兜底，防止 animationend 未触发
  setTimeout(cleanup, duration + 60)
}

function preserveClosingAnimation(element, duration) {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const rect = element.getBoundingClientRect()
  const ghost = element.cloneNode(true)
  ghost.removeAttribute('id')
  ghost.setAttribute('aria-hidden', 'true')
  ghost.setAttribute('inert', '')
  ghost.style.position = 'fixed'
  ghost.style.left = `${rect.left}px`
  ghost.style.top = `${rect.top}px`
  ghost.style.width = `${rect.width}px`
  ghost.style.height = `${rect.height}px`
  ghost.style.margin = '0'
  ghost.style.pointerEvents = 'none'
  ghost.style.zIndex = '2147483647'

  // Vue may remove a closing dialog before the button's animation can paint.
  setTimeout(() => {
    if (element.isConnected) return
    ghost.classList.add('is-clicked-spin')
    document.body.appendChild(ghost)
    setTimeout(() => ghost.remove(), duration + 60)
  }, 0)
}

/**
 * 初始化全局按钮微动效与路由跳转引导
 * @param {import('vue-router').Router} router
 */
export function initButtonMotion(router) {
  if (typeof window === 'undefined') return

  let isNavigating = false

  window.addEventListener(
    'click',
    (event) => {
      const target = event.target
      if (!(target instanceof Element)) return

      const matched = matchButtonCategory(target)
      if (!matched) return

      const { element, category, className, duration } = matched

      // 禁用态按钮不触发任何动画
      if (
        element.hasAttribute('disabled') ||
        element.getAttribute('aria-disabled') === 'true' ||
        element.classList.contains('disabled') ||
        element.classList.contains('is-disabled')
      ) {
        return
      }

      // 判断是否是需要页面跳转的探索类链接
      const isAnchor = element.tagName.toLowerCase() === 'a' || !!element.closest('a[href]')
      const anchor = isAnchor ? (element.tagName.toLowerCase() === 'a' ? element : element.closest('a[href]')) : null
      const href = anchor ? anchor.getAttribute('href') : null

      const isExternalOrNewTab =
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0 ||
        (anchor && anchor.getAttribute('target') === '_blank')

      const isHashRoute =
        href &&
        (href.startsWith('#/') || href.startsWith('/#/') || (href.startsWith('#') && href.length > 1 && href[1] === '/'))

      const isReducedMotion =
        window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

      // 针对需要跳转的探索按钮：播放乒乓球弹跳与视线引导光，在 160ms 弹跳最高峰时平滑切入目标页
      if (category === 'pop' && anchor && isHashRoute && !isExternalOrNewTab && !isReducedMotion && router) {
        event.preventDefault()

        if (isNavigating) return
        isNavigating = true

        triggerAnimation(element, className, duration)

        // 解析出目标路由路径
        let targetRoute = href.replace(/^(\/#\/|#\/)/, '/')
        if (!targetRoute.startsWith('/')) targetRoute = '/' + targetRoute

        setTimeout(() => {
          isNavigating = false
          router.push(targetRoute).catch(() => {})
        }, 160)

        return
      }

      // 对于其他所有操作类、模式类、折纸类、实验类及原位按钮：
      // 0ms 立即执行原始交互，视觉层无缝同步播放对应类别的物理动效
      if (category === 'spin') preserveClosingAnimation(element, duration)
      triggerAnimation(element, className, duration)
    },
    { capture: true, passive: false }
  )
}
