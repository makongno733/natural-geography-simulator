# Chapter 1 3D Model Fidelity & Coordinate System Arrows

## Overview

Enhance model fidelity for Chapter 1 (宇宙中的地球) 3D visualization modules and add visual coordinate system arrows to the CelestialSphereModule to illustrate how astronomical coordinate systems are defined.

## Modules Affected

| Mode | Module | File |
|------|--------|------|
| 专业模式 | CelestialSphereModule | `src/engine/modules/CelestialSphereModule.js` |
| 深空探索 | SolarSystemModule | `src/engine/modules/SolarSystemModule.js` |
| View | Earth3D.vue | `src/sandbox/Earth3D.vue` |

## CelestialSphereModule Improvements

### Model Fidelity
- Increase sphere segments: 16→24 (简单) / 16→48 (专业)
- Add setMode() to differentiate simple/professional rendering
- Special per-object effects:
  - Betelgeuse: pulsing size + emissive intensity animation
  - Crab Pulsar: rotation animation with beam effect
  - Cygnus X-1: rotating accretion disk
  - Sirius A/B: companion star orbit visualization
- Add background star field (PointsMaterial)
- Coordinate grid: 36→48 segments, add tick marks at cardinal points

### Coordinate System Arrows (New)
Add three arrow/axis helpers per coordinate system. Each system needs:
- **Axial arrow**: points along the fundamental axis
- **Reference plane**: semi-transparent ring or disk
- **Cardinal markers**: N/S/E/W or equivalent labels

Four coordinate systems to implement:
1. **地平坐标系 (Horizontal)** — zenith arrow ↑, horizon ring, N/E/S/W markers
2. **赤道坐标系 (Equatorial)** — celestial pole axis ↑↓, celestial equator ring, vernal equinox marker
3. **黄道坐标系 (Ecliptic)** — ecliptic pole axis (tilted 23.44°), ecliptic plane ring
4. **银道坐标系 (Galactic)** — galactic pole axis (tilted ~62.6°), galactic plane ring

When the user clicks a coordinate system button in the side panel (already wired in Earth3D.vue):
- Show that system's arrows/planes
- Hide the others
- Default: all visible in reference mode, one highlighted at a time

## SolarSystemModule Improvements

### Model Fidelity
- Increase sphere segments: 16→32 (simple) / 16→64 (professional/deepspace)
- Add setMode() and mode-aware rendering
- Sun improvements:
  - 48 segment sphere
  - MeshStandardMaterial with emissive glow (not basic)
  - Animated surface color cycling (subtle)
  - Corona glow ring (additive blending)
- Planet improvements:
  - Earth: 64 segments
  - Jupiter/Saturn: 48 segments
  - Others: 32 segments
  - Procedural color variation (vertex colors or noise-based)
  - Saturn: add ring geometry (flat ring with texture)
- Orbit rings: gradient opacity, subtle glow effect
- Background star field

### No Coordinate Arrows for SolarSystem
The solar system view is the "deep space exploration" mode - it shows orbital mechanics, not coordinate systems. No arrows needed here.

## Implementation Plan

### Step 1: CelestialSphereModule
1. Add setMode() support with segment level switching
2. Increase default geometry resolution
3. Add background star field
4. Add per-object effects (pulsing, rotation, accretion disk)
5. Build coordinate system arrow system (group per system, show/hide via setCoordSystem)
6. Wire up Earth3D.vue to pass selected coord system to the module

### Step 2: SolarSystemModule
1. Add setMode() support with segment level switching
2. Increase default geometry resolution for sun and planets
3. Add procedural surface detail
4. Add Saturn rings
5. Add sun corona glow effect
6. Add background star field

### Step 3: Earth3D.vue integration
- Pass mode parameter to CelestialSphereModule and SolarSystemModule
- Pass selected coordinate system to CelestialSphereModule
- Ensure mode switching clears/resets state correctly

## Verification
- `pnpm dev` and check `http://127.0.0.1:4173/#/sandbox/earth`
- Click through all three modes
- In professional mode, click each coordinate system button and verify arrows appear correctly
- Deep space mode: verify planets orbit correctly with higher detail

## Files Changed
1. `src/engine/modules/CelestialSphereModule.js` — fidelity + coordinate arrows
2. `src/engine/modules/SolarSystemModule.js` — fidelity improvements
3. `src/sandbox/Earth3D.vue` — wire up new params
