export class ModelPerformanceMonitor {
  constructor({ limit = 200 } = {}) {
    this.limit = limit
    this.entries = []
  }

  record(event) {
    const entry = {
      timestamp: Date.now(),
      ...event,
    }
    this.entries.push(entry)
    if (this.entries.length > this.limit) {
      this.entries.splice(0, this.entries.length - this.limit)
    }
    return entry
  }

  getEntries() {
    return [...this.entries]
  }

  clear() {
    this.entries = []
  }
}

export const modelPerformanceMonitor = new ModelPerformanceMonitor()

if (typeof window !== 'undefined') {
  window.__GEO_MODEL_PERF__ = {
    getEntries: () => modelPerformanceMonitor.getEntries(),
    clear: () => modelPerformanceMonitor.clear(),
  }
}
