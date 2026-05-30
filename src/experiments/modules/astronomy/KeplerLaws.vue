<template>
  <div class="kl-layout">
    <aside class="kl-panel">
      <div class="preset-row">
        <button class="preset-btn" :class="{ active: activePreset === 'nearcircle' }" @click="setPreset('nearcircle')">近圆轨道</button>
        <button class="preset-btn" :class="{ active: activePreset === 'ellipse' }" @click="setPreset('ellipse')">椭圆轨道</button>
        <button class="preset-btn" :class="{ active: activePreset === 'comet' }" @click="setPreset('comet')">彗星轨道</button>
      </div>
      <label>离心率 <span>{{ eccentricity.toFixed(2) }}</span></label>
      <input type="range" min="0" max="0.9" step="0.01" v-model.number="eccentricity" @input="onParam" />
      <button @click="autoPlay">{{ auto ? '⏸ 暂停' : '▶ 自动演示' }}</button>
      <p class="kl-hint">🖱 拖动旋转 · 滚轮缩放</p>
    </aside>
    <div class="kl-canvas-wrap">
      <canvas ref="cvs"></canvas>
    </div>
  </div>
</template>

<script>
import { ExperimentEngine } from '../../engine/ExperimentEngine.js'
import * as THREE from 'three'

export default {
  name: 'KeplerLaws',
  data() { return { eccentricity: 0.5, auto: false, activePreset: 'ellipse' } },
  mounted() {
    this._e = new KeplerLawsEngine()
    this._e._vm = this
    this.$nextTick(() => this._e.init(this.$refs.cvs))
    window.addEventListener('resize', this._onResize)
  },
  beforeUnmount() { this._e?.dispose(); window.removeEventListener('resize', this._onResize) },
  methods: {
    _onResize() { this._e?.resize() },
    onParam() { this._e.setParams({ eccentricity: this.eccentricity }) },
    autoPlay() { this.auto = !this.auto; this._e.auto = this.auto },
    setPreset(key) {
      this.activePreset = key
      if (this.auto) { this.auto = false; this._e.auto = false }
      const ecc = { nearcircle: 0.1, ellipse: 0.5, comet: 0.85 }
      this.eccentricity = ecc[key]
      this.onParam()
    },
  },
}

class KeplerLawsEngine extends ExperimentEngine {
  setupScene() {
    this.scene.background = new THREE.Color(0x0a0a1a)
    this.scene.fog = null

    // Remove base warm ambient, replace with cool space lighting
    const existingAmbient = this.scene.children.find(c => c.isAmbientLight)
    if (existingAmbient) {
      this.scene.remove(existingAmbient)
    }
    const ambient = new THREE.AmbientLight(0x334466, 1.5)
    this.scene.add(ambient)

    this.sunGeo = new THREE.SphereGeometry(0.5, 32, 32)
    this.sun = new THREE.Mesh(this.sunGeo, new THREE.MeshBasicMaterial({ color: 0xffd54f }))
    this.scene.add(this.sun)

    const sunLight = new THREE.PointLight(0xfff8e8, 30, 25)
    sunLight.position.set(0, 0, 0)
    this.scene.add(sunLight)

    this.planetGeo = new THREE.SphereGeometry(0.2, 16, 16)
    this.planet = new THREE.Mesh(this.planetGeo, new THREE.MeshStandardMaterial({ color: 0x66bb6a, roughness: 0.4 }))
    this.scene.add(this.planet)

    this.ellipseLine = null

    // Pre-allocate sector meshes (geometry updated per frame, not recreated)
    this.areaSectors = []
    this._maxSectors = 10
    for (let i = 0; i < this._maxSectors; i++) {
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(9), 3))
      const mat = new THREE.MeshBasicMaterial({ color: 0xff6600, side: THREE.DoubleSide, transparent: true, opacity: 0.3 })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.visible = false
      this.scene.add(mesh)
      this.areaSectors.push(mesh)
    }

    this.semiMajor = 5
    this.ecc = 0.5
    this.meanAnomaly = 0
    this.trail = []
    this.auto = false

    this._rebuildEllipse()
    this._makeMarkers()

    // Sprite labels
    this.scene.add(this._makeLabel('太阳 (焦点)', new THREE.Vector3(0, 1, 0), '#ffd54f', 24, 2))
    this.scene.add(this._makeLabel('椭圆轨道', new THREE.Vector3(3, 1.2, 3.2), '#888888', 24, 2))
    this._sectorLabel = this._makeLabel('等面积扇形', new THREE.Vector3(this.focusOffset + 2, 1, 1.5), '#ff9800', 22, 1.6)
    this.scene.add(this._sectorLabel)
    this._planetLabel = this._makeLabel('行星', new THREE.Vector3(Math.cos(0) * this.semiMajor + this.focusOffset, 0.5, Math.sin(0) * this.semiMajor * Math.sqrt(1 - this.ecc * this.ecc)), '#66bb6a', 24, 1.6)
    this.scene.add(this._planetLabel)

    this.camera.position.set(0, 8, 8)
    this.controls.target.set(0, 0, 0)
  }

  _rebuildEllipse() {
    if (this.ellipseLine) {
      this.scene.remove(this.ellipseLine)
      this.ellipseLine.geometry.dispose()
      this.ellipseLine.material.dispose()
    }
    const a = this.semiMajor
    const e = this.ecc
    const b = a * Math.sqrt(1 - e * e)
    const c = a * e
    const pts = []
    const n = 200
    for (let i = 0; i <= n; i++) {
      const theta = (i / n) * Math.PI * 2
      pts.push(new THREE.Vector3(a * Math.cos(theta) + c, 0, b * Math.sin(theta)))
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    this.ellipseLine = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xb8a57a, transparent: true, opacity: 0.5 }))
    this.scene.add(this.ellipseLine)

    this.focusOffset = c
    this.sun.position.set(this.focusOffset, 0, 0)
  }

  _makeMarkers() {
    const a = this.semiMajor
    const e = this.ecc
    const c = a * e

    // Remove old labels if they exist
    if (this._periLabel) { this.scene.remove(this._periLabel); this._sprites = this._sprites.filter(s => s !== this._periLabel); this._periLabel = null }
    if (this._aphLabel) { this.scene.remove(this._aphLabel); this._sprites = this._sprites.filter(s => s !== this._aphLabel); this._aphLabel = null }

    const periGeo = new THREE.SphereGeometry(0.1, 8, 8)
    const periMat = new THREE.MeshBasicMaterial({ color: 0xef5350 })
    this.periMarker = new THREE.Mesh(periGeo, periMat)
    this.periMarker.position.set(a + c, 0, 0)
    this.scene.add(this.periMarker)

    const aphGeo = new THREE.SphereGeometry(0.1, 8, 8)
    const aphMat = new THREE.MeshBasicMaterial({ color: 0x64b5f6 })
    this.aphMarker = new THREE.Mesh(aphGeo, aphMat)
    this.aphMarker.position.set(-a + c, 0, 0)
    this.scene.add(this.aphMarker)

    this._periLabel = this._makeLabel('近日点', this.periMarker.position.clone().add(new THREE.Vector3(0.3, 0.7, 0)), '#ff6b6b', 22, 1.6)
    this.scene.add(this._periLabel)
    this._aphLabel = this._makeLabel('远日点', this.aphMarker.position.clone().add(new THREE.Vector3(-0.3, 0.7, 0)), '#64b5f6', 22, 1.6)
    this.scene.add(this._aphLabel)
  }

  _removeMarkers() {
    if (this.periMarker) { this.scene.remove(this.periMarker); this.periMarker.geometry.dispose(); this.periMarker.material.dispose(); this.periMarker = null }
    if (this.aphMarker) { this.scene.remove(this.aphMarker); this.aphMarker.geometry.dispose(); this.aphMarker.material.dispose(); this.aphMarker = null }
  }

  _updateSectors() {
    // Hide all pool sectors first
    for (const s of this.areaSectors) {
      s.visible = false
    }

    if (this.trail.length < 3) return

    const sunPos = new THREE.Vector3(this.focusOffset, 0, 0)
    const trail = this.trail
    const n = Math.min(trail.length - 2, this._maxSectors - 1)

    for (let i = 0; i < n; i++) {
      const p1 = trail[trail.length - 3 - i]
      const p2 = trail[trail.length - 2 - i]
      const sector = this.areaSectors[i]

      const positions = sector.geometry.attributes.position
      positions.setXYZ(0, sunPos.x, sunPos.y, sunPos.z)
      positions.setXYZ(1, p1.x, p1.y, p1.z)
      positions.setXYZ(2, p2.x, p2.y, p2.z)
      positions.needsUpdate = true

      sector.geometry.computeVertexNormals()
      sector.material.color.setHSL(0.33 - (i / n) * 0.2, 0.8, 0.5)
      sector.material.opacity = 0.2 + i * 0.08
      sector.visible = true
    }
  }

  _solveKepler(M, e) {
    let E = M
    for (let i = 0; i < 10; i++) {
      const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E))
      E -= dE
      if (Math.abs(dE) < 1e-8) break
    }
    return E
  }

  _planetPos(M, e) {
    const E = this._solveKepler(M, e)
    const a = this.semiMajor
    const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2))
    const r = a * (1 - e * Math.cos(E))
    return {
      x: r * Math.cos(nu) + this.focusOffset,
      z: r * Math.sin(nu),
      r,
      nu,
    }
  }

  update(dt) {
    if (this.auto) {
      const meanMotion = 1.5
      this.meanAnomaly += dt * meanMotion
      if (this.meanAnomaly > Math.PI * 2) this.meanAnomaly -= Math.PI * 2
    }

    const pos = this._planetPos(this.meanAnomaly, this.ecc)
    this.planet.position.set(pos.x, 0, pos.z)

    if (this._planetLabel) {
      this._planetLabel.position.copy(this.planet.position).add(new THREE.Vector3(0, 0.5, 0))
    }

    this.trail.push(this.planet.position.clone())
    if (this.trail.length > 100) this.trail.shift()

    this._updateSectors()
  }

  setParams({ eccentricity }) {
    if (eccentricity !== undefined && Math.abs(eccentricity - this.ecc) > 0.001) {
      this.ecc = Math.max(0, Math.min(0.9, eccentricity))
      this._removeMarkers()
      this._updateSectors()
      this._rebuildEllipse()
      this._makeMarkers()
      this.meanAnomaly = 0
      this.trail = []
      this._vm.eccentricity = parseFloat(this.ecc.toFixed(2))
    }
  }
}
</script>

<style scoped>
.kl-layout { display: flex; gap: 0; border-radius: var(--radius-box); overflow: hidden; border: 1px solid var(--brown-light); }
.kl-panel { width: 210px; flex-shrink: 0; background: var(--card-bg); padding: 16px; border-right: 1px solid var(--brown-light); display: flex; flex-direction: column; gap: 10px; }
.preset-row { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px; }
.preset-btn { flex: 1; min-width: 55px; padding: 4px 6px; border: 1px solid var(--brown); border-radius: 4px; background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 11px; white-space: nowrap; }
.preset-btn.active { background: var(--red); color: #fff; border-color: var(--red); }
.preset-btn:hover { background: var(--button-green); }
.preset-btn.active:hover { background: var(--red); }
.kl-panel label { font-size: 13px; color: var(--ink); display: flex; justify-content: space-between; }
.kl-panel input[type="range"] { width: 100%; accent-color: var(--red); }
.kl-panel button { padding: 6px 12px; border: 1px solid var(--brown); border-radius: var(--radius-sm); background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 13px; }
.kl-panel button:hover { background: var(--button-green); }
.kl-hint { font-size: 11px; color: var(--muted); text-align: center; margin-top: auto; }
.kl-canvas-wrap { flex: 1; min-height: 460px; background: #0a0a1a; }
.kl-canvas-wrap canvas { width: 100%; height: 100%; display: block; }

@media (max-width: 720px) {
  .kl-layout { flex-direction: column; }
  .kl-panel { width: 100%; border-right: 0; border-bottom: 1px solid var(--brown-light); flex-direction: row; flex-wrap: wrap; gap: 8px; }
  .kl-canvas-wrap { min-height: 320px; }
}
</style>
