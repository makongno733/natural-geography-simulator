<template>
  <div class="kl-layout">
    <aside class="kl-panel">
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
  data() { return { eccentricity: 0.5, auto: false } },
  mounted() {
    this._e = new KeplerLawsEngine()
    this._e._vm = this
    this.$nextTick(() => this._e.init(this.$refs.cvs))
    window.addEventListener('resize', () => this._e?.resize())
  },
  beforeUnmount() { this._e?.dispose(); window.removeEventListener('resize', () => this._e?.resize()) },
  methods: {
    onParam() { this._e.setParams({ eccentricity: this.eccentricity }) },
    autoPlay() { this.auto = !this.auto; this._e.auto = this.auto },
  },
}

class KeplerLawsEngine extends ExperimentEngine {
  setupScene() {
    this.scene.background = new THREE.Color(0x0a0a1a)

    this.sunGeo = new THREE.SphereGeometry(0.5, 32, 32)
    this.sun = new THREE.Mesh(this.sunGeo, new THREE.MeshBasicMaterial({ color: 0xffd54f }))
    this.scene.add(this.sun)

    const sunLight = new THREE.PointLight(0xfff8e8, 30, 25)
    sunLight.position.set(0, 0, 0)
    this.scene.add(sunLight)

    const ambient = new THREE.AmbientLight(0x333355, 1.0)
    this.scene.add(ambient)

    this.planetGeo = new THREE.SphereGeometry(0.2, 16, 16)
    this.planet = new THREE.Mesh(this.planetGeo, new THREE.MeshStandardMaterial({ color: 0x66bb6a, roughness: 0.4 }))
    this.scene.add(this.planet)

    this.ellipseLine = null
    this.areaSectors = []

    this.semiMajor = 5
    this.ecc = 0.5
    this.meanAnomaly = 0
    this.trail = []
    this.auto = false

    this._rebuildEllipse()
    this._makeMarkers()

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
  }

  _removeMarkers() {
    if (this.periMarker) { this.scene.remove(this.periMarker); this.periMarker.geometry.dispose(); this.periMarker.material.dispose(); this.periMarker = null }
    if (this.aphMarker) { this.scene.remove(this.aphMarker); this.aphMarker.geometry.dispose(); this.aphMarker.material.dispose(); this.aphMarker = null }
  }

  _clearSectors() {
    for (const s of this.areaSectors) {
      this.scene.remove(s)
      s.geometry.dispose()
      s.material.dispose()
    }
    this.areaSectors = []
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

    const sunPos = new THREE.Vector3(this.focusOffset, 0, 0)
    this.trail.push(this.planet.position.clone())
    if (this.trail.length > 100) this.trail.shift()

    this._clearSectors()
    if (this.trail.length >= 3) {
      const step = Math.max(1, Math.floor(this.trail.length / 12))
      for (let i = 0; i < this.trail.length - step; i += step) {
        const j = Math.min(i + step, this.trail.length - 1)
        if (j - i < 2) continue
        const pts = [sunPos, this.trail[i], this.trail[j]]
        const geo = new THREE.BufferGeometry()
        const verts = new Float32Array([
          pts[0].x, pts[0].y, pts[0].z,
          pts[1].x, pts[1].y, pts[1].z,
          pts[2].x, pts[2].y, pts[2].z,
        ])
        geo.setAttribute('position', new THREE.BufferAttribute(verts, 3))
        const hue = 0.33 - (i / this.trail.length) * 0.2
        const color = new THREE.Color().setHSL(hue, 0.8, 0.5)
        const mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.35, depthTest: false })
        const mesh = new THREE.Mesh(geo, mat)
        this.scene.add(mesh)
        this.areaSectors.push(mesh)
      }
    }
  }

  setParams({ eccentricity }) {
    if (eccentricity !== undefined && Math.abs(eccentricity - this.ecc) > 0.001) {
      this.ecc = Math.max(0, Math.min(0.9, eccentricity))
      this._removeMarkers()
      this._clearSectors()
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
.kl-panel { width: 200px; flex-shrink: 0; background: var(--card-bg); padding: 16px; border-right: 1px solid var(--brown-light); display: flex; flex-direction: column; gap: 10px; }
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
