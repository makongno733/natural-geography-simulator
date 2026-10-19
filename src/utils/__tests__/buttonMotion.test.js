import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { initButtonMotion } from '../buttonMotion.js'

describe('buttonMotion - 地理教学系统按钮点击微动效系统', () => {
  let routerMock
  let container

  beforeEach(() => {
    document.body.innerHTML = ''
    container = document.createElement('div')
    document.body.appendChild(container)

    routerMock = {
      push: vi.fn().mockResolvedValue(true)
    }

    vi.useFakeTimers()
    initButtonMotion(routerMock)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('1. 探索跳转类按钮触发乒乓球弹出动画并在 160ms 后顺畅导航', async () => {
    container.innerHTML = `
      <a href="#/experiments" class="portal-enter-btn">进入 3D 实验室</a>
    `
    const link = container.querySelector('a')
    link.click()

    expect(link.classList.contains('is-clicked-pop')).toBe(true)
    expect(routerMock.push).not.toHaveBeenCalled()

    vi.advanceTimersByTime(160)
    expect(routerMock.push).toHaveBeenCalledWith('/experiments')
  })

  it('2. 课本折叠/展开类按钮触发羊皮纸 3D 透视翻折动画，且原有操作立即响应', () => {
    const clickHandler = vi.fn()
    container.innerHTML = `
      <button type="button" data-expand-all>全部展开</button>
    `
    const btn = container.querySelector('button')
    btn.addEventListener('click', clickHandler)

    btn.click()

    expect(clickHandler).toHaveBeenCalledTimes(1)
    expect(btn.classList.contains('is-clicked-fold')).toBe(true)
  })

  it('3. 模式与分段切换按钮触发地平线收缩成线后展开动画', () => {
    container.innerHTML = `
      <button class="mode-btn">🔰 简单模式</button>
      <button class="level-btn">高中</button>
      <button class="zoom-btn">🌍 地球</button>
    `
    const modeBtn = container.querySelector('.mode-btn')
    const levelBtn = container.querySelector('.level-btn')
    const zoomBtn = container.querySelector('.zoom-btn')

    modeBtn.click()
    expect(modeBtn.classList.contains('is-clicked-horizon')).toBe(true)

    levelBtn.click()
    expect(levelBtn.classList.contains('is-clicked-horizon')).toBe(true)

    zoomBtn.click()
    expect(zoomBtn.classList.contains('is-clicked-horizon')).toBe(true)
  })

  it('4. 实验控制台操纵按键触发地震波活塞沉降脉冲动画', () => {
    container.innerHTML = `
      <button class="quick-btn">自动旋转</button>
      <button class="tool-btn">⟲ 复位</button>
      <button class="preset-btn">挤压造山</button>
    `
    const quickBtn = container.querySelector('.quick-btn')
    const toolBtn = container.querySelector('.tool-btn')
    const presetBtn = container.querySelector('.preset-btn')

    quickBtn.click()
    expect(quickBtn.classList.contains('is-clicked-seismic')).toBe(true)

    toolBtn.click()
    expect(toolBtn.classList.contains('is-clicked-seismic')).toBe(true)

    presetBtn.click()
    expect(presetBtn.classList.contains('is-clicked-seismic')).toBe(true)
  })

  it('5. 罗盘回旋与关闭按钮触发指针偏转回旋吸入动画', () => {
    container.innerHTML = `
      <button class="info-close">✕</button>
      <button class="glossary-close">✕</button>
    `
    const infoClose = container.querySelector('.info-close')
    const glossaryClose = container.querySelector('.glossary-close')

    infoClose.click()
    expect(infoClose.classList.contains('is-clicked-spin')).toBe(true)

    glossaryClose.click()
    expect(glossaryClose.classList.contains('is-clicked-spin')).toBe(true)
  })

  it('关闭按钮被弹层移除后仍在原位置完成旋转动画', () => {
    container.innerHTML = '<button class="info-close" id="dialog-close">✕</button>'
    const closeBtn = container.querySelector('button')
    closeBtn.addEventListener('click', () => closeBtn.remove())

    closeBtn.click()
    vi.advanceTimersByTime(0)

    const ghost = document.body.querySelector('.is-clicked-spin[aria-hidden="true"]')
    expect(ghost).not.toBeNull()
    expect(ghost.hasAttribute('inert')).toBe(true)
    expect(ghost.id).toBe('')

    vi.advanceTimersByTime(300)
    expect(document.body.querySelector('.is-clicked-spin[aria-hidden="true"]')).toBeNull()
  })

  it('减少动态效果时关闭按钮不生成旋转残影', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
    container.innerHTML = '<button class="info-close">✕</button>'
    const closeBtn = container.querySelector('button')
    closeBtn.addEventListener('click', () => closeBtn.remove())

    closeBtn.click()
    vi.advanceTimersByTime(300)

    expect(document.body.querySelector('.is-clicked-spin')).toBeNull()
    vi.unstubAllGlobals()
  })

  it('6. 返回按钮触发向左定向探退与回弹动画', () => {
    container.innerHTML = `
      <button class="back-link">← 返回课文</button>
      <button class="orbit-arrow-prev">◀</button>
    `
    const backBtn = container.querySelector('.back-link')
    const prevBtn = container.querySelector('.orbit-arrow-prev')

    backBtn.click()
    expect(backBtn.classList.contains('is-clicked-retreat')).toBe(true)

    prevBtn.click()
    expect(prevBtn.classList.contains('is-clicked-retreat')).toBe(true)
  })

  it('7. 禁用态按钮不触发任何点击动效', () => {
    container.innerHTML = `
      <button class="btn-primary" disabled>不可点击</button>
      <button class="mode-btn" aria-disabled="true">禁用模式</button>
    `
    const disabledBtn = container.querySelector('.btn-primary')
    const ariaDisabledBtn = container.querySelector('.mode-btn')

    disabledBtn.click()
    expect(disabledBtn.classList.contains('is-clicked-pop')).toBe(false)

    ariaDisabledBtn.click()
    expect(ariaDisabledBtn.classList.contains('is-clicked-horizon')).toBe(false)
  })

  it('普通课程链接也有反馈，并保持站内跳转', () => {
    container.innerHTML = '<a class="chapter-item" href="#/初中/七年级上册">七年级上册</a>'
    const link = container.querySelector('a')

    link.click()
    expect(link.classList.contains('is-clicked-pop')).toBe(true)
    vi.advanceTimersByTime(160)
    expect(routerMock.push).toHaveBeenCalledWith('/初中/七年级上册')
  })
})
