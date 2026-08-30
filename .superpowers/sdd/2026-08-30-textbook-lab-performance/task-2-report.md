# Task 2 report — unified lazy experiment catalog

## Implementation summary

- Added a metadata-only experiment catalog with dynamic component loaders, lookup helpers, validated preset lookup, and textbook-source-preserving route construction.
- Added frozen preset contracts for every catalog item. Each preset has `id`, `title`, `purpose`, `camera`, `params`, `labels`, and `tasks`; unknown preset IDs return `null`.
- Registered the eight existing standalone 3D capabilities plus `spatial-network` and `human-environment`. The two system experiments lazily load `ConceptSystemAdapter.vue`, which resolves the route preset and lazily renders `Chapter3DViewer.vue` with its translated recipe.
- Added promise-based intent preloading with in-flight/completed de-duplication, deletion after rejection, explicit reset, and a default catalog-backed API.
- Kept the existing pages compatible by deriving their legacy `type` / `component` shape from the new catalog.

## RED / GREEN evidence

1. RED — `pnpm vitest run src/experiments/catalog.test.js`
   - Failed because `src/experiments/catalog.js` did not exist: `Failed to resolve import "./catalog.js"`.
2. GREEN — `pnpm vitest run src/experiments/catalog.test.js`
   - Passed: 1 test file, 3 tests.
3. RED — `pnpm vitest run src/experiments/preload.test.js`
   - Failed because `src/experiments/preload.js` did not exist: `Failed to resolve import "./preload.js"`.
4. GREEN — `pnpm vitest run src/experiments/catalog.test.js src/experiments/preload.test.js`
   - Passed: 2 test files, 4 tests.

The first catalog test invocation required `CI=true pnpm install --frozen-lockfile` because this worktree had no usable dependency directory and non-interactive pnpm refused to recreate it. The subsequent red run produced the expected missing-module failure.

## Verification commands and results

- `node --input-type=module -e "…catalog preset contract validation…"`
  - Passed: validated 29 catalog experiments and all 36 controller-required experiment/preset links, including every required field.
- `git diff --check`
  - Passed: no whitespace errors.
- `pnpm vitest run src/experiments/catalog.test.js src/experiments/preload.test.js`
  - Passed: 2 files, 4 tests.
- `pnpm test`
  - Passed: 11 files, 86 tests.
- `pnpm build`
  - Passed: production build completed in 5.92s. Existing size warning remains for `vendor-three` (744.41 kB minified); this task adds lazy chunks and does not alter the shared Three vendor split.

## Files changed

- `src/experiments/catalog.js`
- `src/experiments/catalog.test.js`
- `src/experiments/presets.js`
- `src/experiments/preload.js`
- `src/experiments/preload.test.js`
- `src/experiments/modules/systems/ConceptSystemAdapter.vue`
- `src/experiments/modules/index.js`

## Self-review

- Confirmed the catalog imports only preset metadata and dynamic import functions, so it does not statically load Three.js scenes.
- Confirmed invalid experiment/preset IDs do not silently choose a fallback.
- Confirmed the legacy module index preserves the fields read by `ExperimentCategory.vue` and `ExperimentView.vue`.
- Confirmed the adapter reads the route experiment and preset, translates nodes, flows, layers, and metrics into the viewer recipe, and lazy-loads the viewer itself.
- Confirmed the preloader keeps a promise per ID and evicts a rejected load so the later click can retry.

## Concerns

- The pre-task `modules/index.js` contained 19 legacy experiment records rather than the brief's stated 20. This catalog preserves all 19 records and adds the specified 10 new capabilities, for 29 total; no unlisted twentieth legacy experiment was invented.
- The production build still reports the pre-existing large Three.js vendor chunk warning. Resolving that belongs to the later bundle-splitting work, not this metadata-layer task.
