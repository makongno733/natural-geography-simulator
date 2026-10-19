const REVEAL_SELECTOR = [
  '.geography-home .section-frame',
  '.geography-home .model-gallery-item',
  '.exp-home .exp-card',
  '.exp-home .experiment-result',
  '.labs .section',
  '.page-shell .card',
  '.page-shell .chapter-item'
].join(',')

/** Add restrained scroll reveals to overview pages without touching their 3D canvases. */
export function initSectionMotion() {
  if (typeof window === 'undefined') return () => {}
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return () => {}

  const root = document.querySelector('main.app-main')
  if (!root) return () => {}

  const seen = new WeakSet()
  const pending = new Set()
  const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      entry.target.classList.add('geo-reveal-visible')
      pending.delete(entry.target)
      observer.unobserve(entry.target)
    }
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.01 })

  let frame = 0
  const checkViewport = () => {
    frame = 0
    for (const element of pending) {
      if (!element.isConnected) {
        pending.delete(element)
        continue
      }
      const rect = element.getBoundingClientRect()
      if (rect.top < window.innerHeight * 0.94 && rect.bottom > 0) {
        element.classList.add('geo-reveal-visible')
        pending.delete(element)
      }
    }
  }
  const scheduleCheck = () => {
    if (!frame) frame = window.requestAnimationFrame(checkViewport)
  }
  const scan = () => {
    root.querySelectorAll(REVEAL_SELECTOR).forEach(element => {
      if (seen.has(element)) return
      seen.add(element)
      element.classList.add('geo-reveal-ready')
      pending.add(element)
      observer?.observe(element)
    })
    if (!observer) scheduleCheck()
  }
  let scanFrame = 0
  const changes = new MutationObserver(() => {
    if (!scanFrame) scanFrame = window.requestAnimationFrame(() => {
      scanFrame = 0
      scan()
    })
  })

  scan()
  changes.observe(root, { childList: true, subtree: true })
  if (!observer) {
    window.addEventListener('scroll', scheduleCheck, { passive: true })
    window.addEventListener('resize', scheduleCheck)
  }
  return () => {
    changes.disconnect()
    observer?.disconnect()
    window.removeEventListener('scroll', scheduleCheck)
    window.removeEventListener('resize', scheduleCheck)
    if (frame) window.cancelAnimationFrame(frame)
    if (scanFrame) window.cancelAnimationFrame(scanFrame)
  }
}
