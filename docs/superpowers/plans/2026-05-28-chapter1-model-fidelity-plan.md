# Chapter 1 3D Model Fidelity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Increase 3D model fidelity for CelestialSphereModule and SolarSystemModule, and add interactive coordinate system arrows to the celestial sphere view.

**Architecture:** Both modules are factory functions returning THREE.Group objects with an API object in `group.userData.api`. They receive mode/params through BaseScene and communicate coordinate system selection via `setParams({ coordSystem })`. Each coordinate system is a separate THREE.Group toggled by visibility.

**Tech Stack:** Three.js (r152+), Vue 3, ES modules

**Files:**
- Modify: `src/engine/modules/CelestialSphereModule.js`
- Modify: `src/engine/modules/SolarSystemModule.js`
- Modify: `src/sandbox/Earth3D.vue`

---

### Task 1: Add background star field to CelestialSphereModule

**Files:**
- Modify: `src/engine/modules/CelestialSphereModule.js` (add star field at end of factory function)

- [ ] **Step 1: Add star field creation code**

After the coordinate grid and before object creation, add:

```js
// Background star field
const starPositions = new Float32Array(3000 * 3)
for (let i = 0; i < 3000 * 3; i++) {
  starPositions[i] = (Math.random() - 0.5) * 20
}
const starGeo = new THREE.BufferGeometry()
starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
const starMat = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.03,
  transparent: true,
  opacity: 0.6,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
})
const stars = new THREE.Points(starGeo, starMat)
stars.userData._managed = true
group.add(stars)
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/modules/CelestialSphereModule.js
git commit -m "feat: add background star field to CelestialSphereModule"
```

---

### Task 2: Add setMode/setParams/update API to CelestialSphereModule

**Files:**
- Modify: `src/engine/modules/CelestialSphereModule.js`

- [ ] **Step 1: Add mode-aware constructor logic**

Before the CELESTIAL_OBJECTS loop, add segment selection based on mode:

```js
const mode = params.mode || 'simple'
const sphereSegs = mode === 'simple' ? 24 : 48
const gridSegs = mode === 'simple' ? 36 : 64
```

Replace all hardcoded segment counts:
- `GeometryFactory.sphere(obj.size, 16)` → `GeometryFactory.sphere(obj.size, sphereSegs)`
- `for (let i = 0; i <= 36; i++)` → `for (let i = 0; i <= gridSegs; i++)`

- [ ] **Step 2: Replace the current api object with new methods**

```js
const api = {
  getObjectMeshes() { return objectMeshes },
  setMode(m) {},
  setParams(p) {},
  update(dt, elapsed) {},
  dispose() {},
}
```

For now, `setMode` and `setParams` are stubs. `update` is a stub for animations.

- [ ] **Step 3: Commit**

```bash
git add src/engine/modules/CelestialSphereModule.js
git commit -m "feat: add mode-aware geometry resolution to CelestialSphereModule"
```

---

### Task 3: Add per-object animated effects to CelestialSphereModule

**Files:**
- Modify: `src/engine/modules/CelestialSphereModule.js`

- [ ] **Step 1: Store references to animated objects**

After creating the objects loop, store references for animation:

```js
const animatedObjects = {
  betelgeuse: { mesh: objectMeshes['betelgeuse'], baseSize: 0.14 },
  pulsar: { mesh: objectMeshes['crab_pulsar'], glow, glowAngle: 0 },
  cygnusDisk: { disk, angle: 0 },
}
```

The `glow` mesh for pulsar and `disk` for Cygnus X-1 already exist in the current code. I need to store references to them.

- [ ] **Step 2: Implement update() with animations**

```js
update(dt, elapsed) {
  if (mode !== 'professional') return

  // Betelgeuse pulsing
  if (animatedObjects.betelgeuse) {
    const pulse = 1 + Math.sin(elapsed * 0.8) * 0.08
    animatedObjects.betelgeuse.mesh.scale.setScalar(pulse)
    const baseMat = animatedObjects.betelgeuse.mesh.material
    if (baseMat.emissiveIntensity !== undefined) {
      baseMat.emissiveIntensity = 0.8 + Math.sin(elapsed * 0.8) * 0.4
    }
  }

  // Crab Pulsar beam rotation
  if (animatedObjects.pulsar) {
    animatedObjects.pulsar.glowAngle += dt * 2.0
    const g = animatedObjects.pulsar.glow
    if (g) {
      g.rotation.z = animatedObjects.pulsar.glowAngle
      g.material.opacity = 0.2 + Math.sin(elapsed * 4) * 0.15
    }
  }

  // Cygnus X-1 accretion disk rotation
  if (animatedObjects.cygnusDisk) {
    animatedObjects.cygnusDisk.angle += dt * 0.6
    animatedObjects.cygnusDisk.disk.rotation.z = animatedObjects.cygnusDisk.angle
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/engine/modules/CelestialSphereModule.js
git commit -m "feat: add per-object animations to CelestialSphereModule"
```

---

### Task 4: Add coordinate system arrows to CelestialSphereModule

**Files:**
- Modify: `src/engine/modules/CelestialSphereModule.js`

This is the biggest task. Each coordinate system gets:
- An axial arrow (ArrowHelper or custom mesh)
- A reference plane ring
- Labels

- [ ] **Step 1: Add the coordinate system group factory**

After the CELESTIAL_OBJECTS loop, add:

```js
// Coordinate system visualization groups
const CS_RADIUS = 2.5
const coordGroups = {}

function buildHorizontalSystem() {
  const g = new THREE.Group()
  // Zenith arrow
  const arrowDir = new THREE.Vector3(0, 1, 0)
  const arrow = new THREE.ArrowHelper(arrowDir, new THREE.Vector3(0, 0, 0), CS_RADIUS * 0.9, 0xffaa33, 0.2, 0.1)
  g.add(arrow)
  // Horizon ring
  const ringPts = GeometryFactory.ringPoints(CS_RADIUS * 0.85, 0, 64)
  g.add(GeometryFactory.lineFromPoints(ringPts, 0xffaa33, 0.3))
  // Cardinal direction labels
  const cardinals = [
    { text: 'N (北)', pos: [0, 0, -CS_RADIUS * 0.9], color: '#ffaa33' },
    { text: 'S (南)', pos: [0, 0, CS_RADIUS * 0.9], color: '#ffaa33' },
    { text: 'E (东)', pos: [CS_RADIUS * 0.9, 0, 0], color: '#ffaa33' },
    { text: 'W (西)', pos: [-CS_RADIUS * 0.9, 0, 0], color: '#ffaa33' },
  ]
  cardinals.forEach(c => {
    const label = labelSystem?.addToGroup(g, c.text, new THREE.Vector3(...c.pos), {
      color: c.color, fontSize: '11px', fontWeight: '600',
    })
  })
  // "天顶" label at the top of zenith arrow
  labelSystem?.addToGroup(g, '天顶', new THREE.Vector3(0, CS_RADIUS * 0.95, 0), { color: '#ffaa33', fontSize: '11px' })
  g.visible = false
  return g
}

function buildEquatorialSystem() {
  const g = new THREE.Group()
  // Celestial pole axis (top/bottom)
  const arrowUp = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -CS_RADIUS * 0.4, 0), CS_RADIUS * 0.9, 0x60a5fa, 0.2, 0.1)
  const arrowDown = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, CS_RADIUS * 0.4, 0), CS_RADIUS * 0.9, 0x60a5fa, 0.2, 0.1)
  g.add(arrowUp, arrowDown)
  // Celestial equator ring
  const eqPts = GeometryFactory.ringPoints(CS_RADIUS * 0.85, 0, 64)
  g.add(GeometryFactory.lineFromPoints(eqPts, 0x60a5fa, 0.35))
  // Vernal equinox marker
  labelSystem?.addToGroup(g, '春分点 →', new THREE.Vector3(CS_RADIUS * 0.9, 0.05, 0), { color: '#60a5fa', fontSize: '11px' })
  labelSystem?.addToGroup(g, '天北极', new THREE.Vector3(0, CS_RADIUS * 0.95, 0), { color: '#60a5fa', fontSize: '11px' })
  labelSystem?.addToGroup(g, '天南极', new THREE.Vector3(0, -CS_RADIUS * 0.95, 0), { color: '#60a5fa', fontSize: '11px' })
  g.visible = false
  return g
}

function buildEclipticSystem() {
  const g = new THREE.Group()
  const tilt = 23.44 * Math.PI / 180
  // Ecliptic pole axis
  const axisDir = new THREE.Vector3(0, Math.cos(tilt), Math.sin(tilt)).normalize()
  const arrow = new THREE.ArrowHelper(axisDir, new THREE.Vector3(0, 0, 0), CS_RADIUS * 0.9, 0x44ff88, 0.2, 0.1)
  g.add(arrow)
  // Ecliptic plane ring (tilted)
  const ringPts = []
  for (let i = 0; i <= 64; i++) {
    const theta = (i / 64) * Math.PI * 2
    const r = CS_RADIUS * 0.85
    const x = Math.cos(theta) * r
    const y = Math.sin(theta) * Math.cos(tilt) * r
    const z = Math.sin(theta) * Math.sin(tilt) * r
    ringPts.push(new THREE.Vector3(x, y, z))
  }
  g.add(GeometryFactory.lineFromPoints(ringPts, 0x44ff88, 0.3))
  labelSystem?.addToGroup(g, '黄极', axisDir.clone().multiplyScalar(CS_RADIUS * 0.95), { color: '#44ff88', fontSize: '11px' })
  g.visible = false
  return g
}

function buildGalacticSystem() {
  const g = new THREE.Group()
  const tilt = 62.6 * Math.PI / 180
  const offset = 0 * Math.PI / 180
  // Galactic pole axis
  const axisDir = new THREE.Vector3(
    Math.sin(tilt) * Math.cos(offset),
    Math.cos(tilt),
    Math.sin(tilt) * Math.sin(offset)
  ).normalize()
  const arrow = new THREE.ArrowHelper(axisDir, new THREE.Vector3(0, 0, 0), CS_RADIUS * 0.9, 0xcc66ff, 0.2, 0.1)
  g.add(arrow)
  // Galactic plane ring
  const ringPts = []
  for (let i = 0; i <= 64; i++) {
    const theta = (i / 64) * Math.PI * 2
    const r = CS_RADIUS * 0.85
    const x = Math.cos(theta) * r * Math.cos(tilt) + Math.sin(theta) * r * 0
    const y = Math.sin(theta) * r * Math.sin(tilt) * (-1)
    const z = Math.cos(theta) * r * Math.sin(tilt)
    // Actually need proper rotation. Let me fix:
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0), axisDir
    )
    const p = new THREE.Vector3(Math.cos(theta) * r, 0, Math.sin(theta) * r).applyQuaternion(q)
    ringPts.push(p)
  }
  g.add(GeometryFactory.lineFromPoints(ringPts, 0xcc66ff, 0.3))
  labelSystem?.addToGroup(g, '银极', axisDir.clone().multiplyScalar(CS_RADIUS * 0.95), { color: '#cc66ff', fontSize: '11px' })
  g.visible = false
  return g
}

coordGroups.horizontal = buildHorizontalSystem()
coordGroups.equatorial = buildEquatorialSystem()
coordGroups.ecliptic = buildEclipticSystem()
coordGroups.galactic = buildGalacticSystem()

Object.values(coordGroups).forEach(g => group.add(g))
```

- [ ] **Step 2: Wire setCoordSystem in setParams**

```js
setParams(p) {
  if (p.coordSystem && coordGroups[p.coordSystem]) {
    Object.keys(coordGroups).forEach(key => {
      coordGroups[key].visible = (key === p.coordSystem)
    })
  }
  if (p.mode) {
    mode = p.mode
  }
}
```

Also set `mode` as a module-level variable (move the `const mode` at the top to a `let mode`).

- [ ] **Step 3: Set default visible coord system**

At the end of the factory function, set one to visible:

```js
coordGroups.horizontal.visible = true
```

- [ ] **Step 4: Commit**

```bash
git add src/engine/modules/CelestialSphereModule.js
git commit -m "feat: add coordinate system arrows to CelestialSphereModule"
```

---

### Task 5: Add background star field to SolarSystemModule

**Files:**
- Modify: `src/engine/modules/SolarSystemModule.js`

- [ ] **Step 1: Add star field**

Same approach as CelestialSphereModule. Add after orbit rings and before labels:

```js
// Background star field
const starPositions = new Float32Array(3000 * 3)
for (let i = 0; i < 3000 * 3; i++) {
  starPositions[i] = (Math.random() - 0.5) * 20
}
const starGeo = new THREE.BufferGeometry()
starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
const starMat = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.03,
  transparent: true,
  opacity: 0.6,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
})
group.add(new THREE.Points(starGeo, starMat))
```

- [ ] **Step 2: Commit**

```bash
git add src/engine/modules/SolarSystemModule.js
git commit -m "feat: add background star field to SolarSystemModule"
```

---

### Task 6: Increase geometry resolution and add mode awareness to SolarSystemModule

**Files:**
- Modify: `src/engine/modules/SolarSystemModule.js`

- [ ] **Step 1: Add mode variable and segment selection**

At the top of the factory function, after `const group = new THREE.Group()`:

```js
const mode = params.mode || 'simple'
const isDetailed = mode !== 'simple'
const sunSegs = isDetailed ? 64 : 32
const planetSegs = isDetailed ? 48 : 24
const ringSegs = isDetailed ? 128 : 64
```

- [ ] **Step 2: Update sphere geometry calls**

Replace:
```js
const sunGeo = GeometryFactory.sphere(0.35, 24)
```
→
```js
const sunGeo = GeometryFactory.sphere(0.35, sunSegs)
```

Replace:
```js
GeometryFactory.sphere(p.size, 16)
```
→
```js
GeometryFactory.sphere(p.size, planetSegs)
```

Replace ring segment counts:
```js
GeometryFactory.ring(p.radius, p.radius + 0.01, 96)
```
→
```js
GeometryFactory.ring(p.radius, p.radius + 0.01, ringSegs)
```

- [ ] **Step 3: Update api to include setMode**

```js
const api = {
  update(dt, elapsed) { /* existing code */ },
  setMode(m) {},
  dispose() {},
}
```

- [ ] **Step 4: Commit**

```bash
git add src/engine/modules/SolarSystemModule.js
git commit -m "feat: add mode-aware geometry resolution to SolarSystemModule"
```

---

### Task 7: Add sun corona glow and emissive material to SolarSystemModule

**Files:**
- Modify: `src/engine/modules/SolarSystemModule.js`

- [ ] **Step 1: Upgrade sun material from MeshBasicMaterial to emissive**

Replace:
```js
const sunMat = new THREE.MeshBasicMaterial({ color: 0xffaa33 })
```
→
```js
const sunMat = new THREE.MeshStandardMaterial({
  color: 0xffaa33,
  emissive: 0xffaa33,
  emissiveIntensity: 0.5,
  roughness: 0.3,
})
```

- [ ] **Step 2: Enhance the glow ring**

Replace the existing glow ring with a larger, more detailed corona:

```js
// Sun corona - multiple layered rings
for (let i = 0; i < 3; i++) {
  const coronaGeo = GeometryFactory.ring(0.45 + i * 0.08, 0.6 + i * 0.1, 48)
  const coronaMat = new THREE.MeshBasicMaterial({
    color: 0xffcc66,
    transparent: true,
    opacity: 0.12 - i * 0.03,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
  const corona = new THREE.Mesh(coronaGeo, coronaMat)
  corona.rotation.x = -Math.PI / 2 + (i * 0.1)
  corona.userData._managed = true
  group.add(corona)
}
```

- [ ] **Step 3: Add subtle sun surface animation in update()**

```js
// Sun surface animation
const sunPulse = 1 + Math.sin(elapsed * 0.5) * 0.02
sun.scale.setScalar(sunPulse)
sunMat.emissiveIntensity = 0.4 + Math.sin(elapsed * 0.7) * 0.15
```

Need to move `sun` and `sunMat` to outer scope (currently they're local to the factory function but need to be accessible in the api.update closure). They already are since they're declared in the function body.

- [ ] **Step 4: Commit**

```bash
git add src/engine/modules/SolarSystemModule.js
git commit -m "feat: add sun corona glow and emissive material"
```

---

### Task 8: Add Saturn rings to SolarSystemModule

**Files:**
- Modify: `src/engine/modules/SolarSystemModule.js`

- [ ] **Step 1: Add Saturn ring creation in the planet loop**

Inside the PLANETS.forEach callback, after creating the planet mesh, add Saturn-specific ring:

```js
// Saturn rings
if (p.name === '土星') {
  const ringOuter = 0.2
  const ringInner = 0.09
  const ringGeo = GeometryFactory.ring(ringInner, ringOuter, ringSegs)
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xc8a97e,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
  const ringMesh = new THREE.Mesh(ringGeo, ringMat)
  ringMesh.rotation.x = -Math.PI / 3
  ringMesh.position.copy(mesh.position)
  ringMesh.userData._managed = true
  group.add(ringMesh)
  planetMeshes.push({ mesh: ringMesh, radius: p.radius, period: p.period, initialAngle, isRing: true })
}
```

- [ ] **Step 2: Update ring positions in the animation loop**

In the `planetMeshes.forEach` callback inside `update()`, add ring position updating:

```js
planetMeshes.forEach(p => {
  const angle = p.initialAngle + (elapsed / secPerYear) * (2 * Math.PI) / p.period
  p.mesh.position.set(
    Math.cos(angle) * p.radius,
    0,
    Math.sin(angle) * p.radius,
  )
  // Also update ring position if this is Saturn's ring
  if (p.isRing) {
    p.mesh.position.set(
      Math.cos(angle) * p.radius,
      0,
      Math.sin(angle) * p.radius,
    )
  }
})
```

- [ ] **Step 3: Commit**

```bash
git add src/engine/modules/SolarSystemModule.js
git commit -m "feat: add Saturn rings"
```

---

### Task 9: Add procedural color variation to planets

**Files:**
- Modify: `src/engine/modules/SolarSystemModule.js`

- [ ] **Step 1: Add a helper function for procedural planet texture**

```js
function makePlanetTexture(baseColor, variation, size) {
  const canvas = document.createElement('canvas')
  canvas.width = size || 128
  canvas.height = size || 64
  const ctx = canvas.getContext('2d')
  
  const r = (baseColor >> 16) & 0xff
  const g = (baseColor >> 8) & 0xff
  const b = baseColor & 0xff
  
  // Base fill
  ctx.fillStyle = `rgb(${r},${g},${b})`
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // Noise bands
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const noise = (Math.random() - 0.5) * variation
      const pr = Math.max(0, Math.min(255, r + noise))
      const pg = Math.max(0, Math.min(255, g + noise))
      const pb = Math.max(0, Math.min(255, b + noise))
      ctx.fillStyle = `rgba(${pr|0},${pg|0},${pb|0},0.3)`
      ctx.fillRect(x, y, 1, 1)
    }
  }
  
  // Latitudinal bands for gas giants
  if (['木星', '土星'].includes(name)) {
    for (let i = 0; i < 8; i++) {
      const y = (i / 8) * canvas.height
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.08})`
      ctx.fillRect(0, y, canvas.width, canvas.height / 12)
    }
  }
  
  return new THREE.CanvasTexture(canvas)
}
```

- [ ] **Step 2: Apply procedural texture to planets in the loop**

After creating each planet mesh:

```js
if (isDetailed) {
  const tex = makePlanetTexture(p.color, 30, 64)
  mesh.material.map = tex
  mesh.material.needsUpdate = true
}
```

But the function needs `name` context - let me restructure. Actually, I should pass the planet name to the texture function. Let me adjust:

```js
const tex = makePlanetTexture(p.color, 30, 64, p.name)
```

- [ ] **Step 3: Commit**

```bash
git add src/engine/modules/SolarSystemModule.js
git commit -m "feat: add procedural planet textures"
```

---

### Task 10: Wire up Earth3D.vue for mode param and coordinate system selection

**Files:**
- Modify: `src/sandbox/Earth3D.vue`

- [ ] **Step 1: Pass mode when loading CelestialSphereModule and SolarSystemModule**

In `switchMode()`:

```js
} else if (m === 'professional') {
  engine.loadModule(CelestialSphereModule, { mode: 'professional' })
  engine.setAutoRotate(false)
  coordDesc.value = descs.horizontal
  currentCoords.value = objCoords.horizontal
} else if (m === 'deepspace') {
  engine.loadModule(SolarSystemModule, { mode: 'deepspace' })
  engine.setAutoRotate(false)
  postFx?.enableBloom({ threshold: 0.1, strength: 0.6, radius: 0.5 })
}
```

The key change: pass `{ mode: 'professional' }` and `{ mode: 'deepspace' }` as params.

- [ ] **Step 2: Wire coordinate system selection to engine params**

In `switchCoord()`, add:

```js
function switchCoord(id) {
  activeCoord.value = id
  coordDesc.value = descs[id] || ''
  currentCoords.value = objCoords[id] || ''
  if (engine) {
    engine.setParams({ coordSystem: id })
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/sandbox/Earth3D.vue
git commit -m "feat: wire mode params and coord system selection in Earth3D.vue"
```

---

### Task 11: Verify and test

**Files:** N/A

- [ ] **Step 1: Run the dev server**

```bash
pnpm dev
```

- [ ] **Step 2: Open browser and check**

Navigate to `http://127.0.0.1:4173/#/sandbox/earth`

Test each mode:
1. **简单模式** → Earth interior loads, looks clean
2. **专业模式** → Celestial sphere loads with coordinate grid, switch each coord system and verify arrows appear
3. **深空探索** → Solar system loads with higher res planets, Saturn rings visible, sun glows

- [ ] **Step 3: Verify animations work**

Check that:
- Betelgeuse pulses in professional mode
- Crab pulsar rotates
- Cygnus X-1 disk rotates
- Planets orbit in deep space mode
- Sun has subtle pulse animation

- [ ] **Step 4: Final commit of any fixes**

```bash
git add -A
git commit -m "fix: polish after verification"
```
