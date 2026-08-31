// SceneActivity — unified visibility / pause / dispose state for a 3D scene.
// Active = not manually paused AND document visible AND container visible AND not disposed.
// Browser APIs (document, IntersectionObserver) degrade to inert no-ops when absent.
export class SceneActivity {
  constructor(options = {}) {
    this._onActiveChange = options.onActiveChange || (() => {})
    this._element = options.element || null
    this._doc = options.document !== undefined
      ? options.document
      : (typeof document !== 'undefined' ? document : null)
    this._Observer = options.IntersectionObserver !== undefined
      ? options.IntersectionObserver
      : (typeof IntersectionObserver !== 'undefined' ? IntersectionObserver : null)

    this._manualPaused = false
    this._documentVisible = true
    this._elementVisible = true
    this._disposed = false
    this._active = false
    this._observer = null
    this._onVisibilityChange = this._handleVisibilityChange.bind(this)

    if (this._doc && typeof this._doc.addEventListener === 'function') {
      this._doc.addEventListener('visibilitychange', this._onVisibilityChange)
      if (typeof this._doc.visibilityState === 'string') {
        this._documentVisible = this._doc.visibilityState !== 'hidden'
      }
    }

    if (this._Observer && this._element && typeof this._Observer === 'function') {
      try {
        this._observer = new this._Observer((entries) => {
          for (const entry of entries) this.setElementVisible(entry.isIntersecting)
        })
        if (this._observer && typeof this._observer.observe === 'function') {
          this._observer.observe(this._element)
        }
      } catch {
        this._observer = null
      }
    }

    this._recompute()
  }

  _handleVisibilityChange() {
    this.setDocumentVisible(this._doc && this._doc.visibilityState !== 'hidden')
  }

  _computeActive() {
    return !this._manualPaused && this._documentVisible && this._elementVisible && !this._disposed
  }

  _recompute() {
    const next = this._computeActive()
    if (next !== this._active) {
      this._active = next
      this._onActiveChange(next)
    }
  }

  setPaused(paused) {
    if (this._disposed) return
    this._manualPaused = !!paused
    this._recompute()
  }

  pause() {
    this.setPaused(true)
  }

  resume() {
    this.setPaused(false)
  }

  setDocumentVisible(visible) {
    if (this._disposed) return
    this._documentVisible = !!visible
    this._recompute()
  }

  setElementVisible(visible) {
    if (this._disposed) return
    this._elementVisible = !!visible
    this._recompute()
  }

  get isActive() {
    return this._active
  }

  dispose() {
    if (this._disposed) return
    this._disposed = true

    if (this._observer && typeof this._observer.disconnect === 'function') {
      this._observer.disconnect()
    }
    this._observer = null

    if (this._doc && typeof this._doc.removeEventListener === 'function') {
      this._doc.removeEventListener('visibilitychange', this._onVisibilityChange)
    }

    this._recompute()
  }
}
