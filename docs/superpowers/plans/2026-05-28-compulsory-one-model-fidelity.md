# Compulsory One Model Fidelity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the visual fidelity and classroom readability of the senior high compulsory book one 3D models while keeping the branch small and runnable.

**Architecture:** Keep the current Vue + Vite + Three.js engine. Upgrade each chapter module procedurally with richer geometry, labels, particles, flow paths, and materials without adding large binary assets.

**Tech Stack:** Vue 3, Vite, Three.js, existing `BaseScene`, `GeometryFactory`, and `MaterialLibrary`.

---

### Task 1: Earth Interior Fidelity

**Files:**
- Modify: `src/engine/modules/EarthInteriorModule.js`

- [ ] Add surface relief, lithosphere fragments, discontinuity glow rings, core convection arcs, and magnetic field curves.
- [ ] Keep all details procedural and below browser-friendly geometry counts.
- [ ] Verify with `pnpm run build`.

### Task 2: Atmosphere Fidelity

**Files:**
- Modify: `src/engine/modules/AtmosphereModule.js`

- [ ] Add land/sea color bands, cloud belts, ozone belt, aurora arcs, radiation arrowheads, and circulation flow markers.
- [ ] Make theme switching continue to clear generated objects safely.
- [ ] Verify with `pnpm run build`.

### Task 3: Water Cycle Fidelity

**Files:**
- Modify: `src/engine/modules/WaterCycleModule.js`

- [ ] Replace block-like terrain with segmented terrain, ridges, forest markers, river tributaries, groundwater, snow line, and denser animated particles.
- [ ] Keep timeline speed behavior stable.
- [ ] Verify with `pnpm run build`.

### Task 4: Landform Fidelity

**Files:**
- Modify: `src/engine/modules/LandformModule.js`

- [ ] Add terrain overlays per landform type: river corridors, karst sinkholes, dunes, coastlines, structural faults, glacier tongues, and volcano cones.
- [ ] Preserve professional labels and water behavior.
- [ ] Verify with `pnpm run build`.

### Task 5: Soil And Disaster Fidelity

**Files:**
- Modify: `src/engine/modules/SoilProfileModule.js`
- Modify: `src/engine/modules/DisasterModule.js`

- [ ] Add soil texture speckles, roots, pores, stone fragments, and layer boundary details.
- [ ] Add typhoon eyewall bands, rainfall shafts, earthquake rupture blocks, roads, and seismic wave effects.
- [ ] Verify with `pnpm run build`.

### Task 6: Final Verification

**Files:**
- No additional file changes expected.

- [ ] Run `pnpm run build`.
- [ ] Confirm no PDF/PPT files are tracked in the branch diff.
- [ ] Report changed files and verification result.
