# Model Optimization Framework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a site-wide model optimization framework that automatically selects render/model quality, records model performance, and lets generated Three.js scenes opt into shared loading behavior.

**Architecture:** The project is a Vue 3 + Vite app with generated Three.js scenes. The first implementation adds pure optimization utilities under `src/engine/optimization`, then connects them to `BaseScene`, `RenderManager`, and `ExperimentEngine` without changing individual teaching modules. Existing pages keep calling `loadModule`, while new optimized paths can call `loadOptimizedModule`.

**Tech Stack:** Vue 3.5, Vite 6, Three.js 0.184, pnpm 10, Vitest for unit tests.

## Global Constraints

- Scope: build a global optimization framework first, then connect individual model pages gradually.
- Priority: balance student device compatibility, model quality, and classroom stability.
- Quality selection: choose quality automatically based on device and network conditions.
- Teaching enhancement: defer teaching layers until after the model framework is stable.
- Existing model sources: support both model files and code-generated models, with code-generated models as the first integration target.
- Page coverage: start with shared engine entry points instead of rewriting every model page.
- Do not add teacher-controlled quality switching in this phase.
- Do not add service-worker or offline caching in this phase.

---

## File Structure

- Create `src/engine/optimization/qualitySelector.js`: pure quality selection rules.
- Create `src/engine/optimization/qualitySelector.test.js`: unit tests for balanced automatic quality selection and missing variant fallback.
- Create `src/engine/optimization/deviceProfiler.js`: browser-safe device tier detection.
- Create `src/engine/optimization/networkProfiler.js`: browser-safe network tier detection.
- Create `src/engine/optimization/performanceMonitor.js`: lightweight metric recorder.
- Create `src/engine/optimization/modelManager.js`: unified generated-model lifecycle helper.
- Create `src/engine/optimization/modelManager.test.js`: unit tests for generated model loading, fallback, and metrics.
- Modify `package.json`: add `test` script and Vitest dev dependency.
- Modify `src/engine/core/RenderManager.js`: consume selected quality for renderer pixel ratio, antialias, shadows, and post-processing.
- Modify `src/engine/core/BaseScene.js`: resolve model quality once per scene and expose `loadOptimizedModule`.
- Modify `src/experiments/engine/ExperimentEngine.js`: resolve quality for experiment scenes and apply renderer settings.
- Modify `src/textbook/components/Chapter3DViewer.vue`: pass a stable `modelId` to `BaseScene` and use `loadOptimizedModule`.
- Modify `src/engine/WaterCycleView.vue`: pass a stable `modelId` to `BaseScene` and use `loadOptimizedModule`.

---

### Task 1: Add Test Harness And Quality Selector

**Files:**
- Modify: `package.json`
- Create: `src/engine/optimization/qualitySelector.js`
- Create: `src/engine/optimization/qualitySelector.test.js`

**Interfaces:**
- Produces: `selectModelQuality({ deviceTier, networkTier, availableQualities }) => 'low' | 'medium' | 'high'`
- Produces: `normalizeQuality(value) => 'low' | 'medium' | 'high'`
- Consumes: no project modules

- [ ] **Step 1: Add Vitest dependency and test script**

Run:

```bash
pnpm add -D vitest
```

Then edit `package.json` so the `scripts` object includes:

```json
{
  "test": "vitest run",
  "test:watch": "vitest"
}
```

Expected package manager result: `vitest` appears under `devDependencies`, and `pnpm-lock.yaml` is updated.

- [ ] **Step 2: Write the failing tests**

Create `src/engine/optimization/qualitySelector.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { normalizeQuality, selectModelQuality } from './qualitySelector.js'

describe('normalizeQuality', () => {
  it('falls back to medium for unknown values', () => {
    expect(normalizeQuality('ultra')).toBe('medium')
    expect(normalizeQuality(undefined)).toBe('medium')
  })

  it('keeps supported values', () => {
    expect(normalizeQuality('low')).toBe('low')
    expect(normalizeQuality('medium')).toBe('medium')
    expect(normalizeQuality('high')).toBe('high')
  })
})

describe('selectModelQuality', () => {
  it('uses low when the device is weak', () => {
    expect(selectModelQuality({
      deviceTier: 'low',
      networkTier: 'fast',
      availableQualities: ['low', 'medium', 'high'],
    })).toBe('low')
  })

  it('uses low when the network is slow', () => {
    expect(selectModelQuality({
      deviceTier: 'high',
      networkTier: 'slow',
      availableQualities: ['low', 'medium', 'high'],
    })).toBe('low')
  })

  it('uses high only when device and network are both strong', () => {
    expect(selectModelQuality({
      deviceTier: 'high',
      networkTier: 'fast',
      availableQualities: ['low', 'medium', 'high'],
    })).toBe('high')
  })

  it('uses medium for the balanced default case', () => {
    expect(selectModelQuality({
      deviceTier: 'medium',
      networkTier: 'normal',
      availableQualities: ['low', 'medium', 'high'],
    })).toBe('medium')
  })

  it('chooses the nearest available lower quality before moving upward', () => {
    expect(selectModelQuality({
      deviceTier: 'high',
      networkTier: 'fast',
      availableQualities: ['low', 'medium'],
    })).toBe('medium')

    expect(selectModelQuality({
      deviceTier: 'medium',
      networkTier: 'normal',
      availableQualities: ['low', 'high'],
    })).toBe('low')

    expect(selectModelQuality({
      deviceTier: 'low',
      networkTier: 'slow',
      availableQualities: ['medium', 'high'],
    })).toBe('medium')
  })
})
```

- [ ] **Step 3: Run the focused test and verify it fails**

Run:

```bash
pnpm test -- src/engine/optimization/qualitySelector.test.js
```

Expected: FAIL because `src/engine/optimization/qualitySelector.js` does not exist.

- [ ] **Step 4: Implement the quality selector**

Create `src/engine/optimization/qualitySelector.js`:

```js
const QUALITY_ORDER = ['low', 'medium', 'high']

export function normalizeQuality(value) {
  return QUALITY_ORDER.includes(value) ? value : 'medium'
}

function desiredQuality(deviceTier, networkTier) {
  const device = normalizeQuality(deviceTier)
  const network = networkTier === 'slow' || networkTier === 'fast' ? networkTier : 'normal'

  if (device === 'low' || network === 'slow') return 'low'
  if (device === 'high' && network === 'fast') return 'high'
  return 'medium'
}

export function selectModelQuality({ deviceTier = 'medium', networkTier = 'normal', availableQualities = QUALITY_ORDER } = {}) {
  const available = QUALITY_ORDER.filter(quality => availableQualities.includes(quality))
  if (!available.length) return 'medium'

  const desired = desiredQuality(deviceTier, networkTier)
  const desiredIndex = QUALITY_ORDER.indexOf(desired)

  for (let index = desiredIndex; index >= 0; index -= 1) {
    const quality = QUALITY_ORDER[index]
    if (available.includes(quality)) return quality
  }

  for (let index = desiredIndex + 1; index < QUALITY_ORDER.length; index += 1) {
    const quality = QUALITY_ORDER[index]
    if (available.includes(quality)) return quality
  }

  return available[0]
}
```

- [ ] **Step 5: Run the focused test and verify it passes**

Run:

```bash
pnpm test -- src/engine/optimization/qualitySelector.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add package.json pnpm-lock.yaml src/engine/optimization/qualitySelector.js src/engine/optimization/qualitySelector.test.js
git commit -m "test: add model quality selector"
```

---

### Task 2: Add Profilers And Performance Monitor

**Files:**
- Create: `src/engine/optimization/deviceProfiler.js`
- Create: `src/engine/optimization/networkProfiler.js`
- Create: `src/engine/optimization/performanceMonitor.js`

**Interfaces:**
- Consumes: `normalizeQuality(value)` from `qualitySelector.js`
- Produces: `getDeviceTier(env) => 'low' | 'medium' | 'high'`
- Produces: `getNetworkTier(env) => 'slow' | 'normal' | 'fast'`
- Produces: `modelPerformanceMonitor.record(event)`, `modelPerformanceMonitor.getEntries()`, `modelPerformanceMonitor.clear()`

- [ ] **Step 1: Write profiler implementations**

Create `src/engine/optimization/deviceProfiler.js`:

```js
import { normalizeQuality } from './qualitySelector.js'

export function getDeviceTier(env = globalThis) {
  const navigatorRef = env.navigator || {}
  const memory = Number(navigatorRef.deviceMemory || 0)
  const cores = Number(navigatorRef.hardwareConcurrency || 0)
  const pixelRatio = Number(env.devicePixelRatio || 1)

  if ((memory && memory <= 2) || (cores && cores <= 2) || pixelRatio >= 3) {
    return 'low'
  }

  if ((memory && memory >= 8) && (cores && cores >= 8) && pixelRatio <= 2) {
    return 'high'
  }

  return normalizeQuality('medium')
}
```

Create `src/engine/optimization/networkProfiler.js`:

```js
export function getNetworkTier(env = globalThis) {
  const connection = env.navigator?.connection || env.navigator?.mozConnection || env.navigator?.webkitConnection
  if (!connection) return 'normal'

  if (connection.saveData) return 'slow'

  const effectiveType = String(connection.effectiveType || '').toLowerCase()
  if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'slow'
  if (effectiveType === '4g') return 'fast'

  const downlink = Number(connection.downlink || 0)
  if (downlink > 0 && downlink < 1.5) return 'slow'
  if (downlink >= 8) return 'fast'

  return 'normal'
}
```

Create `src/engine/optimization/performanceMonitor.js`:

```js
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
```

- [ ] **Step 2: Run the existing quality selector test**

Run:

```bash
pnpm test -- src/engine/optimization/qualitySelector.test.js
```

Expected: PASS.

- [ ] **Step 3: Build the app**

Run:

```bash
pnpm run build
```

Expected: PASS with Vite producing `dist/`.

- [ ] **Step 4: Commit**

Run:

```bash
git add src/engine/optimization/deviceProfiler.js src/engine/optimization/networkProfiler.js src/engine/optimization/performanceMonitor.js
git commit -m "feat: add model profiling utilities"
```

---

### Task 3: Add Model Manager For Generated Scenes

**Files:**
- Create: `src/engine/optimization/modelManager.js`
- Create: `src/engine/optimization/modelManager.test.js`

**Interfaces:**
- Consumes: `getDeviceTier(env)`, `getNetworkTier(env)`, `selectModelQuality(config)`, `modelPerformanceMonitor`
- Produces: `modelManager.resolveProfile({ modelId, availableQualities, env })`
- Produces: `modelManager.loadGeneratedModel({ modelId, factory, scene, params, context, availableQualities, env })`

- [ ] **Step 1: Write failing model manager tests**

Create `src/engine/optimization/modelManager.test.js`:

```js
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ModelManager } from './modelManager.js'
import { ModelPerformanceMonitor } from './performanceMonitor.js'

describe('ModelManager', () => {
  let monitor

  beforeEach(() => {
    monitor = new ModelPerformanceMonitor()
  })

  it('resolves profile from injected device and network profilers', () => {
    const manager = new ModelManager({
      monitor,
      getDeviceTier: () => 'high',
      getNetworkTier: () => 'fast',
    })

    expect(manager.resolveProfile({
      modelId: 'chapter-earth',
      availableQualities: ['low', 'medium', 'high'],
    })).toEqual({
      modelId: 'chapter-earth',
      deviceTier: 'high',
      networkTier: 'fast',
      quality: 'high',
    })
  })

  it('loads a generated model and records success metrics', () => {
    const group = { userData: { api: { update: vi.fn() } } }
    const factory = vi.fn(() => group)
    const manager = new ModelManager({
      monitor,
      getDeviceTier: () => 'medium',
      getNetworkTier: () => 'normal',
      now: () => 100,
    })

    const result = manager.loadGeneratedModel({
      modelId: 'water-cycle',
      factory,
      scene: { name: 'scene' },
      params: { timeline: 0.5 },
      context: { labelSystem: null },
    })

    expect(result.model).toBe(group)
    expect(result.profile.quality).toBe('medium')
    expect(factory).toHaveBeenCalledWith(
      { name: 'scene' },
      { timeline: 0.5, quality: 'medium', modelQuality: 'medium' },
      { labelSystem: null },
    )
    expect(monitor.getEntries()).toMatchObject([
      { type: 'model-load-start', modelId: 'water-cycle', quality: 'medium' },
      { type: 'model-load-success', modelId: 'water-cycle', quality: 'medium', durationMs: 0 },
    ])
  })

  it('records failures before rethrowing generated model errors', () => {
    const error = new Error('factory failed')
    const manager = new ModelManager({
      monitor,
      getDeviceTier: () => 'low',
      getNetworkTier: () => 'slow',
      now: () => 100,
    })

    expect(() => manager.loadGeneratedModel({
      modelId: 'fault-model',
      factory: () => { throw error },
      scene: {},
      params: {},
      context: {},
    })).toThrow(error)

    expect(monitor.getEntries().at(-1)).toMatchObject({
      type: 'model-load-failure',
      modelId: 'fault-model',
      quality: 'low',
      message: 'factory failed',
    })
  })
})
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
pnpm test -- src/engine/optimization/modelManager.test.js
```

Expected: FAIL because `src/engine/optimization/modelManager.js` does not exist.

- [ ] **Step 3: Implement the model manager**

Create `src/engine/optimization/modelManager.js`:

```js
import { getDeviceTier as defaultGetDeviceTier } from './deviceProfiler.js'
import { getNetworkTier as defaultGetNetworkTier } from './networkProfiler.js'
import { selectModelQuality } from './qualitySelector.js'
import { modelPerformanceMonitor } from './performanceMonitor.js'

export class ModelManager {
  constructor({
    monitor = modelPerformanceMonitor,
    getDeviceTier = defaultGetDeviceTier,
    getNetworkTier = defaultGetNetworkTier,
    now = () => performance.now(),
  } = {}) {
    this.monitor = monitor
    this.getDeviceTier = getDeviceTier
    this.getNetworkTier = getNetworkTier
    this.now = now
  }

  resolveProfile({ modelId = 'unknown-model', availableQualities = ['low', 'medium', 'high'], env = globalThis } = {}) {
    const deviceTier = this.getDeviceTier(env)
    const networkTier = this.getNetworkTier(env)
    const quality = selectModelQuality({ deviceTier, networkTier, availableQualities })
    return { modelId, deviceTier, networkTier, quality }
  }

  loadGeneratedModel({ modelId, factory, scene, params = {}, context = {}, availableQualities = ['low', 'medium', 'high'], env = globalThis }) {
    const profile = this.resolveProfile({ modelId, availableQualities, env })
    const startedAt = this.now()

    this.monitor.record({
      type: 'model-load-start',
      modelId: profile.modelId,
      quality: profile.quality,
      deviceTier: profile.deviceTier,
      networkTier: profile.networkTier,
    })

    try {
      const model = factory(scene, {
        ...params,
        quality: profile.quality,
        modelQuality: profile.quality,
      }, context)

      this.monitor.record({
        type: 'model-load-success',
        modelId: profile.modelId,
        quality: profile.quality,
        durationMs: Math.round(this.now() - startedAt),
      })

      return { model, profile }
    } catch (error) {
      this.monitor.record({
        type: 'model-load-failure',
        modelId: profile.modelId,
        quality: profile.quality,
        durationMs: Math.round(this.now() - startedAt),
        message: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }
}

export const modelManager = new ModelManager()
```

- [ ] **Step 4: Run model manager and quality selector tests**

Run:

```bash
pnpm test -- src/engine/optimization/modelManager.test.js src/engine/optimization/qualitySelector.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/engine/optimization/modelManager.js src/engine/optimization/modelManager.test.js
git commit -m "feat: add generated model manager"
```

---

### Task 4: Apply Quality To Main Engine Rendering

**Files:**
- Modify: `src/engine/core/RenderManager.js`
- Modify: `src/engine/core/BaseScene.js`

**Interfaces:**
- Consumes: `modelManager.resolveProfile(config)`
- Consumes: `modelManager.loadGeneratedModel(config)`
- Produces: `BaseScene.loadOptimizedModule(modelId, moduleFactory, params)`
- Produces: `RenderManager` option `quality: 'low' | 'medium' | 'high'`

- [ ] **Step 1: Update RenderManager quality settings**

In `src/engine/core/RenderManager.js`, add this helper above the `RenderManager` class:

```js
function renderSettingsForQuality(quality = 'medium') {
  if (quality === 'low') {
    return {
      antialias: false,
      pixelRatioCap: 1,
      shadows: false,
    }
  }
  if (quality === 'high') {
    return {
      antialias: true,
      pixelRatioCap: 2,
      shadows: true,
    }
  }
  return {
    antialias: true,
    pixelRatioCap: 1.5,
    shadows: true,
  }
}
```

Then replace the renderer setup in the constructor with:

```js
const qualitySettings = renderSettingsForQuality(options.quality)
this.quality = options.quality || 'medium'
this.pixelRatioCap = options.pixelRatioCap || qualitySettings.pixelRatioCap
this.renderer = new THREE.WebGLRenderer({
  antialias: options.antialias ?? qualitySettings.antialias,
  alpha: options.alpha ?? true,
})
this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.pixelRatioCap))
this.renderer.setClearColor(options.bg || 0x0a0e27, 1)
this.renderer.shadowMap.enabled = options.shadows ?? qualitySettings.shadows
```

Keep the existing `shadowMap.type`, clipping, tone mapping, composer, and resize logic unchanged.

- [ ] **Step 2: Update BaseScene to resolve a profile**

In `src/engine/core/BaseScene.js`, add this import:

```js
import { modelManager } from '../optimization/modelManager.js'
```

In the constructor, before creating `RenderManager`, add:

```js
this.modelId = options.modelId || 'base-scene'
this.modelProfile = modelManager.resolveProfile({
  modelId: this.modelId,
  availableQualities: options.availableQualities || ['low', 'medium', 'high'],
})
```

Then replace:

```js
this.renderManager = new RenderManager(container, options)
```

with:

```js
this.renderManager = new RenderManager(container, {
  ...options,
  quality: options.quality || this.modelProfile.quality,
})
```

- [ ] **Step 3: Add optimized module loading**

In `src/engine/core/BaseScene.js`, add this method after `loadModule`:

```js
loadOptimizedModule(modelId, moduleFactory, params = {}) {
  if (this._moduleGroup) {
    this._disposeModule()
  }

  this.modelId = modelId || this.modelId
  const result = modelManager.loadGeneratedModel({
    modelId: this.modelId,
    factory: moduleFactory,
    scene: this.scene,
    params: {
      ...params,
      mode: this._mode,
    },
    context: {
      labelSystem: this.labelSystem,
      lightRig: this.lightRig,
      cameraRig: this.cameraRig,
      renderManager: this.renderManager,
      clock: this.clock,
    },
  })

  this.modelProfile = result.profile
  this._params = { ...params, mode: this._mode, quality: result.profile.quality, modelQuality: result.profile.quality }
  this._attachModuleResult(result.model)
}
```

Extract the repeated module attachment logic from `loadModule` into:

```js
_attachModuleResult(result) {
  if (result instanceof THREE.Group) {
    this._moduleGroup = result
    this.scene.add(result)
    this._moduleApi = result.userData?.api || null
  } else if (result && typeof result === 'object') {
    this._moduleGroup = result.group || null
    this._moduleApi = result
  }
}
```

Then simplify the end of `loadModule` to:

```js
this._attachModuleResult(result)
```

- [ ] **Step 4: Run tests and build**

Run:

```bash
pnpm test -- src/engine/optimization/modelManager.test.js src/engine/optimization/qualitySelector.test.js
pnpm run build
```

Expected: both commands PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/engine/core/RenderManager.js src/engine/core/BaseScene.js
git commit -m "feat: apply model quality to base scene rendering"
```

---

### Task 5: Connect Chapter And Water-Cycle Viewers

**Files:**
- Modify: `src/textbook/components/Chapter3DViewer.vue`
- Modify: `src/engine/WaterCycleView.vue`

**Interfaces:**
- Consumes: `new BaseScene(container, { modelId })`
- Consumes: `engine.loadOptimizedModule(modelId, moduleFactory, params)`
- Produces: optimized generated model loading for the chapter 3D viewer and water-cycle viewer.

- [ ] **Step 1: Update Chapter3DViewer model id**

In `src/textbook/components/Chapter3DViewer.vue`, add this computed value near `visibleMetrics`:

```js
const modelId = computed(() => {
  const grade = props.recipe.grade || '高中'
  const book = props.recipe.book || 'unknown-book'
  const chapter = props.recipe.chapter || props.recipe.title || 'unknown-chapter'
  return `chapter-3d:${grade}:${book}:${chapter}`
})
```

Replace the `engine.loadModule` call in `loadCurrentRecipe()` with:

```js
engine.loadOptimizedModule(modelId.value, ChapterConceptModule, {
  mode: currentMode.value,
  recipe: props.recipe,
})
```

In the `BaseScene` constructor options, add:

```js
modelId: modelId.value,
```

- [ ] **Step 2: Update WaterCycleView model id**

In `src/engine/WaterCycleView.vue`, replace:

```js
engine = new BaseScene(containerRef.value, { bg: 0x1a2a3a, mode: 'simple', lightPreset: 'sunlit' })
engine.loadModule(WaterCycleModule, { mode: 'simple', timeline: 0 })
```

with:

```js
engine = new BaseScene(containerRef.value, {
  bg: 0x1a2a3a,
  mode: 'simple',
  lightPreset: 'sunlit',
  modelId: 'engine:water-cycle',
})
engine.loadOptimizedModule('engine:water-cycle', WaterCycleModule, { mode: 'simple', timeline: 0 })
```

- [ ] **Step 3: Run tests and build**

Run:

```bash
pnpm test -- src/engine/optimization/modelManager.test.js src/engine/optimization/qualitySelector.test.js
pnpm run build
```

Expected: both commands PASS.

- [ ] **Step 4: Commit**

Run:

```bash
git add src/textbook/components/Chapter3DViewer.vue src/engine/WaterCycleView.vue
git commit -m "feat: use optimized loading for core 3d viewers"
```

---

### Task 6: Apply Quality To Experiment Engine

**Files:**
- Modify: `src/experiments/engine/ExperimentEngine.js`

**Interfaces:**
- Consumes: `modelManager.resolveProfile({ modelId })`
- Produces: `new ExperimentEngine({ modelId })`
- Produces: quality-aware renderer settings for experiment modules.

- [ ] **Step 1: Update ExperimentEngine constructor**

In `src/experiments/engine/ExperimentEngine.js`, add this import:

```js
import { modelManager } from '../../engine/optimization/modelManager.js'
```

Replace the constructor signature and first lines with:

```js
constructor(options = {}) {
  this.modelId = options.modelId || 'experiment-3d'
  this.modelProfile = modelManager.resolveProfile({
    modelId: this.modelId,
    availableQualities: options.availableQualities || ['low', 'medium', 'high'],
  })
```

Keep the existing field initialization after these two assignments.

- [ ] **Step 2: Apply renderer settings in init**

In `init(canvas)`, replace:

```js
this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
this.renderer.setSize(width, height)
this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
this.renderer.shadowMap.enabled = true
```

with:

```js
const lowQuality = this.modelProfile.quality === 'low'
const pixelRatioCap = this.modelProfile.quality === 'high' ? 2 : this.modelProfile.quality === 'medium' ? 1.5 : 1
this.renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowQuality })
this.renderer.setSize(width, height)
this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelRatioCap))
this.renderer.shadowMap.enabled = !lowQuality
```

- [ ] **Step 3: Pass quality to subclass params where available**

At the end of `init(canvas)`, replace:

```js
this.setupScene()
```

with:

```js
this.setupScene({ quality: this.modelProfile.quality, modelQuality: this.modelProfile.quality })
```

This remains backward compatible because current subclasses ignore setup arguments.

- [ ] **Step 4: Run tests and build**

Run:

```bash
pnpm test -- src/engine/optimization/modelManager.test.js src/engine/optimization/qualitySelector.test.js
pnpm run build
```

Expected: both commands PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/experiments/engine/ExperimentEngine.js
git commit -m "feat: apply model quality to experiment engine"
```

---

### Task 7: Add Developer-Facing Performance Inspection

**Files:**
- Modify: `src/engine/optimization/performanceMonitor.js`
- Modify: `src/engine/optimization/modelManager.test.js`

**Interfaces:**
- Consumes: `modelPerformanceMonitor`
- Produces: `window.__GEO_MODEL_PERF__` in browser environments for manual inspection.

- [ ] **Step 1: Expose monitor in development-friendly global**

At the bottom of `src/engine/optimization/performanceMonitor.js`, add:

```js
if (typeof window !== 'undefined') {
  window.__GEO_MODEL_PERF__ = {
    getEntries: () => modelPerformanceMonitor.getEntries(),
    clear: () => modelPerformanceMonitor.clear(),
  }
}
```

- [ ] **Step 2: Add test coverage for monitor records**

Append this test to `src/engine/optimization/modelManager.test.js`:

```js
it('keeps a bounded performance history', () => {
  const boundedMonitor = new ModelPerformanceMonitor({ limit: 2 })
  boundedMonitor.record({ type: 'a' })
  boundedMonitor.record({ type: 'b' })
  boundedMonitor.record({ type: 'c' })

  expect(boundedMonitor.getEntries().map(entry => entry.type)).toEqual(['b', 'c'])
})
```

- [ ] **Step 3: Run tests and build**

Run:

```bash
pnpm test -- src/engine/optimization/modelManager.test.js src/engine/optimization/qualitySelector.test.js
pnpm run build
```

Expected: both commands PASS.

- [ ] **Step 4: Manually inspect in browser**

Run:

```bash
pnpm run dev
```

Open `http://127.0.0.1:4173/#/` and visit one page that mounts `Chapter3DViewer` or `WaterCycleView`. In the browser console, run:

```js
window.__GEO_MODEL_PERF__.getEntries()
```

Expected: an array containing `model-load-start` and `model-load-success` entries for the visited model.

- [ ] **Step 5: Stop dev server and commit**

Stop the dev server with `Ctrl+C`, then run:

```bash
git add src/engine/optimization/performanceMonitor.js src/engine/optimization/modelManager.test.js
git commit -m "feat: expose model performance diagnostics"
```

---

### Task 8: Final Verification

**Files:**
- No file changes expected.

**Interfaces:**
- Consumes: all previous tasks.
- Produces: verified branch ready for review.

- [ ] **Step 1: Run full test suite**

Run:

```bash
pnpm test
```

Expected: PASS.

- [ ] **Step 2: Run production build**

Run:

```bash
pnpm run build
```

Expected: PASS.

- [ ] **Step 3: Run local preview**

Run:

```bash
pnpm run preview
```

Expected: Vite preview starts on `http://127.0.0.1:4173/`.

- [ ] **Step 4: Browser smoke check**

Open `http://127.0.0.1:4173/#/`.

Check:

- Home page renders.
- `/#/experiments` renders.
- A 3D experiment route renders without a blank canvas.
- A chapter 3D viewer route renders without console errors.
- `window.__GEO_MODEL_PERF__.getEntries()` returns model load entries after visiting an optimized viewer.

- [ ] **Step 5: Stop preview and commit any verification-only doc updates**

Stop the preview server with `Ctrl+C`.

If no files changed, do not commit. If a verification note file was intentionally added, commit it with:

```bash
git add docs/superpowers/plans/2026-07-09-model-optimization-framework.md
git commit -m "docs: record model optimization verification"
```

