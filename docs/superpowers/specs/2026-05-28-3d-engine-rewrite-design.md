# 3D Engine Full Rewrite Design

## Overview

Full rewrite of all 3D modules for 高中必修第一册 (6 chapters). Replace 5 independent scene engines + 1 inline Vue SFC Three.js code with a unified, modular 3D engine framework. Each chapter gets significantly improved model fidelity with PBR materials, post-processing, and better geometry.

## Current Problems

### Code Duplication
- 5 engines duplicate renderer/camera/lights/controls/label setup (~40% shared code)
- Earth3D.vue has 460+ lines of Three.js inline in Vue SFC
- atmosphereScene.js uses manual mouse controls instead of OrbitControls
- DisasterEngine recreates lights on every module switch
- Star field generation duplicated in 2 files
- No unified resize/dispose pattern

### Model Fidelity
- Earth: no textures, solid-color MeshPhysicalMaterial spheres
- Atmosphere: remote texture dependency (network), basic transparent shells
- Soil: simple cylinders with MeshStandardMaterial, no textures
- Disaster: basic particle systems, simple geometries
- No post-processing in most scenes (no bloom, no SSAO)
- Chapter 3 (Water) has no 3D view at all

## Architecture

```
src/engine/
├── core/
│   ├── BaseScene.js          # Scene lifecycle (init → loadModule → render → resize → dispose)
│   ├── RenderManager.js      # WebGLRenderer + EffectComposer pipeline
│   ├── CameraRig.js          # PerspectiveCamera + OrbitControls + presets
│   ├── LabelSystem.js         # CSS2D label create/update/destroy
│   └── LightRig.js           # Standard 3-point lighting with presets
├── modules/
│   ├── EarthInteriorModule.js    # Chapter 1 · Earth interior layers
│   ├── CelestialSphereModule.js  # Chapter 1 · Celestial coordinate system
│   ├── SolarSystemModule.js      # Chapter 1 · Deep space exploration
│   ├── AtmosphereModule.js       # Chapter 2 · Atmosphere (4 themes)
│   ├── WaterCycleModule.js       # Chapter 3 · Water cycle [NEW]
│   ├── LandformModule.js         # Chapter 4 · Geomorphology sandbox
│   ├── SoilProfileModule.js      # Chapter 5 · Soil profile
│   └── DisasterModule.js         # Chapter 6 · Natural disasters (4 sub-types)
├── materials/
│   └── MaterialLibrary.js   # PBR material factory
├── effects/
│   └── PostProcessing.js    # Bloom, SSAO, tone mapping
└── utils/
    ├── GeometryFactory.js   # Shared geometry builders
    └── AssetLoader.js       # Texture loading with offline fallback
```

### Core Layer

#### BaseScene
- Constructor: `(container, options)` → creates RenderManager, CameraRig, LightRig, LabelSystem, clock, render loop
- `loadModule(ModuleFactory, params)` → unloads old module, creates new Group, mounts to scene
- `setMode(mode)` / `setParams(params)` → notifies active module
- `resize()` → unified renderer/camera/label resize
- `dispose()` → full cleanup (geometry/materials/textures/events/DOM)

Each Vue component reduces to ~60-100 lines:
```js
const engine = new BaseScene(container, { bg: 0x0a0e27 })
engine.loadModule(AtmosphereModule, { mode: 'simple', theme: 0 })
engine.setMode('professional')
engine.dispose()
```

#### RenderManager
- Encapsulates WebGLRenderer + EffectComposer
- Unified pixelRatio (min 2), toneMapping (ACESFilmic), shadowMap (PCFSoft)
- Default RenderPass, optional UnrealBloomPass, SSAOPass
- `addPass(pass)`, `setBloom(enabled)`

#### CameraRig
- Wraps PerspectiveCamera + OrbitControls (replaces atmosphereScene manual controls)
- Presets: `front`, `top`, `orbit`
- Configurable autoRotate, minDistance, maxDistance
- `onChange` callback for UI panel readout

#### LightRig
- 3-light setup: ambient(0.4) + key(1.8, castShadow) + fill(0.3) + rim(0.25)
- Presets: `studio` (通用), `sunlit` (日光), `dramatic` (灾害)
- `setSunDirection(vec3)` updates key light + shadow camera

#### LabelSystem
- `createLabel(text, position, style)` → returns trackable object
- `clearAll()` batch remove
- Auto-manages pointer-events and z-index

### Module Layer

Each module is a pure function/class `(scene, params) → THREE.Group`, independent of renderer implementation.

#### Chapter 1 · EarthInteriorModule
- 4-layer spheres: inner core (metallic, emissive warm), outer core (liquid metal, vertex shader flow animation), mantle (procedural orange-red gradient + normal map), crust (real earth texture, offline bundled)
- Clipping plane with emissive edge highlight (custom shader)
- Core annotation rings: Moho and Gutenberg discontinuities as semi-transparent torus bands
- Earth rotation animation

#### Chapter 1 · CelestialSphereModule
- Dual-layer lat/lon grid lines (thin + thick), equatorial/ecliptic planes in distinct colors
- Celestial body materials: MeshStandardMaterial + emissive (main sequence blue-white, red giant orange-red, white dwarf cool white)
- Pulsar/black hole effects: additive blending halo ring, accretion disk particles
- Coordinate system transitions with animated grid rotation + label fade

#### Chapter 1 · SolarSystemModule
- Sun: dual-layer mesh (inner emissive + outer translucent glow particle shell)
- Planets: procedural textured spheres (Jupiter bands, Saturn rings via RingGeometry)
- Real-time orbit animation: each planet revolves at real period ratio
- Hohmann transfer orbit: Bezier curve + flowing particle animation (Earth → Mars)

#### Chapter 2 · AtmosphereModule
- Earth texture: offline bundled via AssetLoader (no network dependency)
- Atmospheric scattering: SkyMaterial overlay + semi-transparent layer shells
- 4 theme sub-modules managed by unified switcher:
  - **Vertical layers**: 5 transparent shells + height markers + feature particles (plane/balloon/meteor/aurora/satellite icons)
  - **Composition**: gas molecule spherical distribution (N₂ blue / O₂ green / CO₂ gray / Ar yellow / O₃ purple), professional mode adds altitude comparison
  - **Radiation**: solar shortwave (yellow arrow curves) → surface longwave (red diffusion particles) → atmospheric counter-radiation (orange return particles), cloud reflection path
  - **Circulation**: Hadley/Ferrel/Polar cells as 3D spiral tubes (TubeGeometry) replacing point particles
- Camera uses CameraRig (OrbitControls), removes manual mouse controls

#### Chapter 3 · WaterCycleModule [NEW]
- Core scene: sea level + land cross-section + atmosphere layer
- 4 interactive phases:
  - Evaporation: blue translucent particles rising from sea surface
  - Transport: horizontal cloud particle bands drifting left to right
  - Precipitation: vertical rain streak particles from cloud to ground
  - Runoff: blue flow lines (curve pipes) from mountains to ocean
- Timeline slider controls cycle speed
- Phase click highlights corresponding particles
- Bilingual labels: sea surface / cloud / mountain / river

#### Chapter 4 · LandformModule
- Terrain generation upgrade: multi-layer Simplex noise replacing sine-wave mixing
- Professional mode: 256×256 grid density
- Refined erosion algorithms per landform type (fluvial incision, karst dissolution, aeolian abrasion)
- Height-based color gradient + normal map + moisture/roughness variation
- Water plane: type-specific water levels (river low, coastal tidal)
- Professional mode: contour line overlay
- Preserves terrainModifiers.js module swapping mechanism

#### Chapter 5 · SoilProfileModule
- Geometry: chamfered cross-section blocks (slicable display) with edge divider lines
- Differentiated layer materials:
  - O (organic): dark brown rough texture, scattered leaf particles
  - A (topsoil): dark moist texture, fine root hair lines
  - E (eluvial): gray-white bleached effect
  - B (illuvial): orange-brown, clay coating gloss
  - C (parent material): gray rock fragment effect
  - R (bedrock): hard granite texture
- Professional mode: full 10-layer USDA profile
- Click layer → detail popup (preserving existing InfoPopup mechanism)
- Rotatable/zoomable profile view

#### Chapter 6 · DisasterModule
- 4 independent sub-modules, light setup not rebuilt on switch:
  - **Typhoon**: multi-layer spiral cloud bands + vertex-animated sea waves + eye wall structure with emissive edge + rain streaks + random lightning flashes + vertex-displaced ocean surface
  - **Earthquake**: custom shader crack growth animation (replacing static lines) + diverse building set (tall/low/tower) with vertex displacement on shake + road grid fracture + seismic wave rings (additive blending) radiating from epicenter
  - **Landslide**: slope geometry deformation animation (vertices sliding from top to base) + debris particle flow (brown/gray particles rolling down) + toe accumulation bulge
  - **Flood**: draggable water level timeline + semi-transparent submerged buildings + water flow particles along street direction

### Materials & Post-Processing

#### MaterialLibrary
- `pbr({ color, roughness, metalness })` — standard PBR
- `emissive({ color, intensity })` — self-illuminating (stars, inner core)
- `transparent({ color, opacity, blending })` — translucent layers (atmosphere, water)
- `particle({ color, size, blending })` — particle systems

#### PostProcessing
- All modules: ACESFilmicToneMapping (default)
- Chapter 1 deep space + Chapter 2 atmosphere: BloomPass (star/lightning glow)
- Chapter 4 landform + Chapter 5 soil: optional SSAOPass (ambient occlusion for depth)
- Chapter 6 disaster: BloomPass (lightning, fire)

### Utilities

#### AssetLoader
- Wraps THREE.TextureLoader + THREE.GLTFLoader
- Textures in `public/textures/`, bundled with build
- Strategy: local file → memory cache → remote fallback (dev only)
- `preload(manifest)` for batch loading before module init
- Retry logic (max 3), solid-color fallback on failure
- Required textures: earth surface (2K), earth normal map, 6 soil layer textures, granite/basalt procedural, Jupiter bands, Saturn rings

#### GeometryFactory
- `sphere(radius, segments)` — standard sphere
- `cylinder(radiusTop, radiusBottom, height, segments)` — cylinder
- `torus(radius, tube, radialSegments, tubularSegments)` — torus
- `ring(innerRadius, outerRadius, segments)` — flat ring
- `spiralPoints(count, radiusFn, heightFn)` — spiral point set (typhoon/circulation)
- `arcLine(startAngle, endAngle, radius, segments)` — arc line (radiation paths)

### Error Handling
- BaseScene catches WebGL unavailability, throws readable error for Vue component display
- Module load failure → fallback placeholder scene (gray plane + error text label)
- AssetLoader texture failure → solid color fallback

## Vue Component Adaptation

6 entry components refactored to unified pattern:

```vue
<template>
  <div ref="container" class="scene-container">
    <Toolbar :tabs="tabs" :mode="mode" @tab-change="onTab" @mode-change="onMode" />
  </div>
</template>

<script setup>
import { BaseScene } from '@/engine/core/BaseScene.js'
import { AtmosphereModule } from '@/engine/modules/AtmosphereModule.js'

const engine = new BaseScene(container, { bg: 0x0a0e27 })
engine.loadModule(AtmosphereModule, { mode: 'simple', theme: 0 })

function onTab(i) { engine.setParams({ theme: i }) }
function onMode(m) { engine.setMode(m) }
</script>
```

- Earth3D.vue 460+ lines of Three.js code fully extracted from Vue SFC
- SectionContent.vue 6 v-if 3D toggle zones simplified
- Each Vue component reduced to ~60-100 lines

## Implementation Order

| Phase | Content | Dependencies |
|-------|---------|-------------|
| 1 | Core layer (BaseScene/RenderManager/CameraRig/LightRig/LabelSystem) | None |
| 2 | AssetLoader + GeometryFactory + MaterialLibrary | Phase 1 |
| 3 | PostProcessing pipeline | Phase 1 |
| 4 | EarthInteriorModule + CelestialSphereModule + SolarSystemModule | Phase 1-3 |
| 5 | AtmosphereModule (rewrite) | Phase 1-3 |
| 6 | WaterCycleModule (new) | Phase 1-3 |
| 7 | LandformModule (rewrite) | Phase 1-3 |
| 8 | SoilProfileModule (rewrite) | Phase 1-3 |
| 9 | DisasterModule (rewrite) | Phase 1-3 |
| 10 | Vue component adaptation + SectionContent simplification | Phase 4-9 |
| 11 | PostProcessing unified integration | Phase 1-10 |
| 12 | Testing + build verification | Phase 1-11 |

## Files to Remove
- `src/lib/atmosphereScene.js` → replaced by core/ + AtmosphereModule
- `src/lib/terrainModifiers.js` → logic merged into LandformModule
- `src/sandbox/engine/SceneEngine.js` → replaced by core/ + LandformModule
- `src/sandbox/engine/DisasterEngine.js` → replaced by core/ + DisasterModule
- `src/soil-profile/soilScene.js` → replaced by core/ + SoilProfileModule

## Files to Create
- `src/engine/core/BaseScene.js`
- `src/engine/core/RenderManager.js`
- `src/engine/core/CameraRig.js`
- `src/engine/core/LabelSystem.js`
- `src/engine/core/LightRig.js`
- `src/engine/modules/EarthInteriorModule.js`
- `src/engine/modules/CelestialSphereModule.js`
- `src/engine/modules/SolarSystemModule.js`
- `src/engine/modules/AtmosphereModule.js`
- `src/engine/modules/WaterCycleModule.js`
- `src/engine/modules/LandformModule.js`
- `src/engine/modules/SoilProfileModule.js`
- `src/engine/modules/DisasterModule.js`
- `src/engine/materials/MaterialLibrary.js`
- `src/engine/effects/PostProcessing.js`
- `src/engine/utils/GeometryFactory.js`
- `src/engine/utils/AssetLoader.js`

## Files to Modify
- `src/textbook/SectionContent.vue` — simplify 3D toggle logic
- `src/textbook/components/AtmosphereViewer.vue` — thin wrapper over BaseScene
- `src/sandbox/Earth3D.vue` — thin wrapper over BaseScene
- `src/sandbox/SandboxApp.vue` — thin wrapper over BaseScene
- `src/sandbox/DisasterSandbox.vue` — thin wrapper over BaseScene
- `src/soil-profile/SoilProfilePage.vue` — thin wrapper over BaseScene
- `src/App.vue` — no changes expected
