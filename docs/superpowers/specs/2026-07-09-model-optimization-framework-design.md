# Model Optimization Framework Design

Date: 2026-07-09
Project: 中学地理教学系统

## Context

The live site at `https://geo.kongnoma279.com/#/` is an educational geography web app with entries for junior courses, senior courses, geography experiments, map systems, and geologic time.

The current local repository at `/Users/makongno/Documents/地理教学系统` does not yet contain checked-out source files. This design therefore defines a framework that can be applied progressively once the application source is available.

## Goal

Build a site-wide model optimization framework that improves model loading speed, runtime stability, visual quality selection, and future maintainability.

The first phase focuses on performance and model quality infrastructure. It intentionally does not add teaching annotations, guided lessons, quizzes, or teacher-controlled quality switching.

## User Decisions

- Scope: build a global optimization framework first, then connect individual model pages gradually.
- Priority: balance student device compatibility, model quality, and classroom stability.
- Quality selection: choose quality automatically based on device and network conditions.
- Teaching enhancement: defer teaching layers until after the model framework is stable.
- Existing model sources: unknown until source code is available; support both model files and code-generated models.
- Page coverage: inspect the source code first, then choose the safest initial integration points.

## Recommended Approach

Use a unified `ModelManager` that becomes the standard entry point for loading and managing 3D or interactive models across the site.

The manager should support:

- Automatic device and network profiling.
- Automatic `low`, `medium`, or `high` model quality selection.
- Lazy loading by page, viewport, or user interaction.
- Shared progress and loading states.
- Model caching to avoid repeated downloads and initialization.
- Runtime fallback when a higher-quality model fails.
- Lightweight performance monitoring for future tuning.

This approach gives immediate structure without requiring every model asset to be redesigned at once. It also leaves a clear path toward a later model asset pipeline.

## Architecture

### ModelManager

The public API for model pages. Existing pages should gradually move from direct model loading to calls through this module.

Example shape:

```ts
loadModel({
  id: "earth-structure",
  scene: "geo-lab",
  type: "asset",
  variants: {
    low: "/models/earth-structure/low.glb",
    medium: "/models/earth-structure/medium.glb",
    high: "/models/earth-structure/high.glb"
  }
});
```

For code-generated models:

```ts
loadModel({
  id: "atmosphere-circulation",
  scene: "geo-lab",
  type: "generated",
  factory: createAtmosphereCirculationModel
});
```

### DeviceProfiler

Estimates client capability using safe browser signals, such as:

- Device memory when available.
- CPU core count when available.
- WebGL support and renderer capability.
- Mobile or desktop viewport class.
- Recent frame timing during initialization, if useful.

The profiler should return a simple tier: `low`, `medium`, or `high`.

### NetworkProfiler

Estimates loading conditions using:

- `navigator.connection` when available.
- Initial resource timing.
- Optional small probe timing only if it does not slow the page.

The profiler should return a simple tier: `slow`, `normal`, or `fast`.

### QualitySelector

Combines device and network tiers into a model quality choice.

Initial rule:

- Use `low` when device tier is low or network tier is slow.
- Use `high` only when device tier is high and network tier is fast.
- Use `medium` for the default balanced case.

If a selected quality is unavailable, choose the nearest available lower quality before moving upward.

### ModelLoader

Loads both model-file assets and generated models behind one interface.

For file models, it should support common web 3D formats used by the current app, likely `glTF` or `GLB` if Three.js is present. If the source uses Cesium, Mapbox, or another rendering system, the loader should wrap the existing loader instead of replacing the rendering stack.

For generated models, it should call a registered factory and still report loading progress, initialization time, cleanup, and errors.

### ModelCache

Stores loaded model resources by model id and selected quality. Cache behavior should avoid expensive repeated downloads during route changes while still allowing disposal when memory pressure is high.

The first implementation can use an in-memory cache. Browser persistent caching should be handled by HTTP cache headers and build artifacts unless the source code shows a reason to add service-worker caching.

### FallbackHandler

Prevents blank model pages.

Fallback order:

1. Retry the selected quality once if the error looks transient.
2. Fall back from `high` to `medium`.
3. Fall back from `medium` to `low`.
4. Show a static preview, simplified generated model, or friendly error state if all variants fail.

### PerformanceMonitor

Records useful metrics during development:

- Selected model quality.
- Model URL or generated model id.
- Load start and completion time.
- Failure reason and fallback path.
- Approximate frame rate or render pressure when available.

The monitor should be lightweight and safe to disable in production if needed.

## Data Flow

1. A page requests a model by id.
2. `ModelManager` reads the model manifest or generated model registration.
3. `DeviceProfiler` and `NetworkProfiler` produce simple capability tiers.
4. `QualitySelector` chooses a variant.
5. `ModelLoader` loads the chosen asset or generated model.
6. `ModelCache` stores reusable resources.
7. `FallbackHandler` handles errors and quality downgrade.
8. `PerformanceMonitor` records outcome and timing.
9. The page receives a loaded model handle and mounts it into the existing scene.

## Model Manifest

When model files exist, add a manifest that describes available quality variants.

Example:

```ts
export const modelManifest = {
  "earth-structure": {
    scene: "geo-lab",
    type: "asset",
    variants: {
      low: "/models/earth-structure/low.glb",
      medium: "/models/earth-structure/medium.glb",
      high: "/models/earth-structure/high.glb"
    }
  }
};
```

The manifest should not require all three variants on day one. It should work with whichever variant exists and choose the best available fallback.

## Future Asset Pipeline

After the framework is in place, build an asset pipeline with:

- Original source models kept separately from web-delivered models.
- `low`, `medium`, and `high` variants.
- GLB or glTF as the preferred delivery format if compatible with the renderer.
- Draco or Meshopt compression where supported.
- WebP, AVIF, or KTX2 texture compression where supported.
- Consistent naming and folder structure.
- Documented budgets for file size, texture size, and polygon count.

This pipeline is not required for the first implementation, but the framework should be shaped so it can use the pipeline later.

## Integration Strategy

Because the source code is not currently available in the local working tree, implementation should begin with code discovery.

When the source is available:

1. Identify rendering libraries and model-heavy pages.
2. Identify whether models are file-based, code-generated, or both.
3. Choose one low-risk model page as the first integration target.
4. Add the framework modules near the app's existing shared utilities.
5. Convert the first target page to use `ModelManager`.
6. Verify loading speed, fallback behavior, and route cleanup.
7. Expand to other model pages in small increments.

## Error Handling

The framework should handle:

- Missing model variants.
- Unsupported WebGL or renderer initialization failure.
- Slow or failed model downloads.
- Corrupt or incompatible model files.
- Memory pressure during repeated route navigation.

User-facing failures should be calm and instructional, not technical. Developer-facing logs should contain enough detail to fix the asset or loader.

## Testing And Verification

Verification should include:

- Unit tests for quality selection rules.
- Unit tests for missing variant fallback.
- Loader tests or integration checks for the first connected model page.
- Manual browser checks on desktop and mobile viewport sizes.
- Throttled network checks for slow connection behavior.
- Route navigation checks to confirm models are disposed or cached correctly.

Useful success signals:

- Model pages no longer go blank when a high-quality model fails.
- Weak devices select lower quality automatically.
- Strong devices can receive higher quality without changing page code.
- Re-entering a model page avoids unnecessary repeat loading.
- Performance data shows which models still need asset optimization.

## Out Of Scope For Phase One

- Teaching annotations on top of models.
- Step-by-step lesson guidance.
- Quizzes or classroom tasks.
- Teacher-controlled quality switching.
- Full asset conversion for every existing model.
- Service-worker or offline mode unless the source code already has that infrastructure.

## Open Dependency

The main dependency is access to the actual source code. The current local repository contains git metadata but no checked-out application files or commits. Implementation planning should wait until the source tree is available or the correct repository is cloned into this workspace.
