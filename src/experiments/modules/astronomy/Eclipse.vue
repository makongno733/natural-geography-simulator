<template>
  <div class="ec-layout">
    <aside class="ec-panel">
      <label>食类型</label>
      <select v-model="eclipseType" @change="onParam">
        <option value="lunar-total">月全食</option>
        <option value="solar-total">日全食</option>
        <option value="solar-annular">日环食</option>
      </select>
      <label>对齐度 <span>{{ alignment.toFixed(0) }}%</span></label>
      <input type="range" min="0" max="100" v-model.number="alignment" @input="onParam" />
      <button @click="autoPlay">{{ auto ? '⏸ 暂停' : '▶ 自动演示' }}</button>
      <p class="ec-hint">🖱 拖动旋转 · 滚轮缩放</p>
    </aside>
    <div class="ec-canvas-wrap">
      <canvas ref="cvs"></canvas>
    </div>
  </div>
</template>

<script>
import { ExperimentEngine } from '../../engine/ExperimentEngine.js'
import * as THREE from 'three'

export default {
  name: 'Eclipse',
  data() { return { eclipseType: 'lunar-total', alignment: 100, auto: false } },
  mounted() {
    this._e = new EclipseEngine()
    this._e._vm = this
    this.$nextTick(() => this._e.init(this.$refs.cvs))
    window.addEventListener('resize', () => this._e?.resize())
  },
  beforeUnmount() { this._e?.dispose(); window.removeEventListener('resize', () => this._e?.resize()) },
  methods: {
    onParam() { this._e.setParams({ eclipseType: this.eclipseType, alignment: this.alignment / 100 }) },
    autoPlay() { this.auto = !this.auto; this._e.auto = this.auto },
  },
}

class EclipseEngine extends ExperimentEngine {
  setupScene() {
    this.scene.background = new THREE.Color(0x050510)

    const sunGeo = new THREE.SphereGeometry(2, 32, 32)
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffd54f })
    this.sun = new THREE.Mesh(sunGeo, sunMat)
    this.sun.position.set(-10, 0, 0)
    this.scene.add(this.sun)

    const sunLight = new THREE.PointLight(0xfff8e8, 80, 50)
    sunLight.position.copy(this.sun.position)
    this.scene.add(sunLight)

    const ambient = new THREE.AmbientLight(0x222244, 0.6)
    this.scene.add(ambient)

    const earthGeo = new THREE.SphereGeometry(0.5, 32, 32)
    const earthMat = new THREE.MeshStandardMaterial({ color: 0x42a5f5, roughness: 0.5 })
    this.earth = new THREE.Mesh(earthGeo, earthMat)
    this.earth.position.set(0, 0, 0)
    this.scene.add(this.earth)

    const moonGeo = new THREE.SphereGeometry(0.15, 16, 16)
    const moonMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.7 })
    this.moon = new THREE.Mesh(moonGeo, moonMat)
    this.moon.position.set(3, 0, 0)
    this.scene.add(this.moon)

    this.umbraCone = null
    this.penumbraCone = null

    this.eclipseType = 'lunar-total'
    this.alignment = 1.0
    this.auto = false
    this._animT = 0

    this._rebuildCones()

    this.camera.position.set(0, 3, 7)
    this.controls.target.set(-2, 0, 0)
  }

  _clearCones() {
    if (this.umbraCone) {
      this.scene.remove(this.umbraCone)
      this.umbraCone.geometry.dispose()
      this.umbraCone.material.dispose()
      this.umbraCone = null
    }
    if (this.penumbraCone) {
      this.scene.remove(this.penumbraCone)
      this.penumbraCone.geometry.dispose()
      this.penumbraCone.material.dispose()
      this.penumbraCone = null
    }
  }

  _rebuildCones() {
    this._clearCones()

    if (this.eclipseType === 'lunar-total') {
      this.moon.position.set(3 * this.alignment, 0, 0)
      const earthR = 0.5
      const distToMoon = 3 * this.alignment
      const umbraLen = Math.max(0.3, distToMoon - earthR * 0.3)
      const umbraTipR = Math.max(0.01, earthR * 0.15 * (1 - (umbraLen - 0.3) / 3))

      const uGeo = new THREE.CylinderGeometry(umbraTipR, earthR, umbraLen, 16, 4)
      uGeo.rotateZ(-Math.PI / 2)
      const uMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.7, depthTest: true })
      this.umbraCone = new THREE.Mesh(uGeo, uMat)
      this.umbraCone.position.set(earthR + umbraLen / 2, 0, 0)
      this.scene.add(this.umbraCone)

      const penumbraLen = umbraLen * 1.6
      const penTipR = earthR * 0.5
      const pGeo = new THREE.CylinderGeometry(penTipR, earthR * 1.4, penumbraLen, 16, 4)
      pGeo.rotateZ(-Math.PI / 2)
      const pMat = new THREE.MeshBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.3, depthTest: true })
      this.penumbraCone = new THREE.Mesh(pGeo, pMat)
      this.penumbraCone.position.set(earthR + penumbraLen / 2, 0, 0)
      this.scene.add(this.penumbraCone)
    } else if (this.eclipseType === 'solar-total') {
      this.moon.position.set(-3 * this.alignment, 0, 0)
      const moonR = 0.15
      const distToEarth = 3 * this.alignment
      const umbraLen = Math.max(0.2, distToEarth - moonR * 0.3)
      const umbraTipR = Math.max(0.005, moonR * 0.1)

      const uGeo = new THREE.CylinderGeometry(umbraTipR, moonR, umbraLen, 16, 4)
      uGeo.rotateZ(-Math.PI / 2)
      const uMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.7, depthTest: true })
      this.umbraCone = new THREE.Mesh(uGeo, uMat)
      this.umbraCone.position.set(this.moon.position.x + moonR + umbraLen / 2, 0, 0)
      this.scene.add(this.umbraCone)

      const penumbraLen = umbraLen * 1.6
      const penTipR = moonR * 0.5
      const pGeo = new THREE.CylinderGeometry(penTipR, moonR * 1.6, penumbraLen, 16, 4)
      pGeo.rotateZ(-Math.PI / 2)
      const pMat = new THREE.MeshBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.3, depthTest: true })
      this.penumbraCone = new THREE.Mesh(pGeo, pMat)
      this.penumbraCone.position.set(this.moon.position.x + moonR + penumbraLen / 2, 0, 0)
      this.scene.add(this.penumbraCone)
    } else if (this.eclipseType === 'solar-annular') {
      this.moon.position.set(-3 * this.alignment, 0, 0)
      const moonR = 0.15
      const umbraLen = 1.8
      const umbraTipR = moonR * 0.55

      const uGeo = new THREE.CylinderGeometry(umbraTipR, moonR, umbraLen, 16, 4)
      uGeo.rotateZ(-Math.PI / 2)
      const uMat = new THREE.MeshBasicMaterial({ color: 0x111111, transparent: true, opacity: 0.5, depthTest: true })
      this.umbraCone = new THREE.Mesh(uGeo, uMat)
      this.umbraCone.position.set(this.moon.position.x + moonR + umbraLen / 2, 0, 0)
      this.scene.add(this.umbraCone)

      const penumbraLen = umbraLen * 1.3
      const penTipR = moonR * 0.9
      const pGeo = new THREE.CylinderGeometry(penTipR, moonR * 1.6, penumbraLen, 16, 4)
      pGeo.rotateZ(-Math.PI / 2)
      const pMat = new THREE.MeshBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.3, depthTest: true })
      this.penumbraCone = new THREE.Mesh(pGeo, pMat)
      this.penumbraCone.position.set(this.moon.position.x + moonR + penumbraLen / 2, 0, 0)
      this.scene.add(this.penumbraCone)
    }
  }

  update(dt) {
    if (this.auto) {
      this._animT += dt * 0.5
      this.alignment = 0.5 + 0.5 * Math.sin(this._animT)
      const alignPct = Math.round(this.alignment * 100)
      if (this._vm) this._vm.alignment = alignPct
      this._rebuildCones()
    }
  }

  setParams({ eclipseType, alignment }) {
    let changed = false
    if (eclipseType !== undefined && eclipseType !== this.eclipseType) {
      this.eclipseType = eclipseType
      changed = true
    }
    if (alignment !== undefined && Math.abs(alignment - this.alignment) > 0.001) {
      this.alignment = alignment
      changed = true
    }
    if (changed) this._rebuildCones()
  }
}
</script>

<style scoped>
.ec-layout { display: flex; gap: 0; border-radius: var(--radius-box); overflow: hidden; border: 1px solid var(--brown-light); }
.ec-panel { width: 200px; flex-shrink: 0; background: var(--card-bg); padding: 16px; border-right: 1px solid var(--brown-light); display: flex; flex-direction: column; gap: 10px; }
.ec-panel label { font-size: 13px; color: var(--ink); display: flex; justify-content: space-between; }
.ec-panel input[type="range"] { width: 100%; accent-color: var(--red); }
.ec-panel select { padding: 4px 8px; border: 1px solid var(--brown); border-radius: var(--radius-sm); background: var(--cream); color: var(--ink); font-family: inherit; font-size: 13px; }
.ec-panel button { padding: 6px 12px; border: 1px solid var(--brown); border-radius: var(--radius-sm); background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 13px; }
.ec-panel button:hover { background: var(--button-green); }
.ec-hint { font-size: 11px; color: var(--muted); text-align: center; margin-top: auto; }
.ec-canvas-wrap { flex: 1; min-height: 460px; background: #050510; }
.ec-canvas-wrap canvas { width: 100%; height: 100%; display: block; }

@media (max-width: 720px) {
  .ec-layout { flex-direction: column; }
  .ec-panel { width: 100%; border-right: 0; border-bottom: 1px solid var(--brown-light); flex-direction: row; flex-wrap: wrap; gap: 8px; }
  .ec-canvas-wrap { min-height: 320px; }
}
</style>
