<template>
  <div class="ec-layout">
    <aside class="ec-panel">
      <div class="preset-row">
        <button class="preset-btn" :class="{ active: activePreset === 'lunar' }" @click="setPreset('lunar')">月全食</button>
        <button class="preset-btn" :class="{ active: activePreset === 'solar' }" @click="setPreset('solar')">日全食</button>
        <button class="preset-btn" :class="{ active: activePreset === 'annular' }" @click="setPreset('annular')">日环食</button>
        <button class="preset-btn" :class="{ active: activePreset === 'auto' }" @click="setPreset('auto')">自动演示</button>
      </div>
      <label>食类型</label>
      <select v-model="eclipseType" @change="onParam">
        <option value="lunar-total">月全食</option>
        <option value="solar-total">日全食</option>
        <option value="solar-annular">日环食</option>
      </select>
      <label>对齐度 <span>{{ alignment.toFixed(0) }}%</span></label>
      <input type="range" min="0" max="100" v-model.number="alignment" @input="onParam" />
      <button @click="autoPlay">{{ auto ? '⏸ 暂停' : '▶ 自动演示' }}</button>
      <button @click="toggleGuide" :class="['guide-btn', { active: guideActive }]">
        {{ guideActive ? '⏸ 停止演示' : '▶ 引导演示' }}
      </button>
      <div v-if="guideActive" class="guide-text-box">{{ guideText }}</div>
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
  data() { return {
    eclipseType: 'lunar-total', alignment: 100, auto: false, activePreset: 'lunar',
    guideActive: false,
    guideText: '',
    _guideTexts: [
      '日食发生在朔日，月球位于太阳和地球之间',
      '月食发生在望日，地球位于太阳和月球之间',
      '本影区完全遮挡阳光，半影区部分遮挡阳光',
      '日环食：月球距地球较远，不能完全遮住太阳',
    ],
  } },
  mounted() {
    this._e = new EclipseEngine()
    this._e._vm = this
    this._e._onGuideChange = (text) => { this.guideText = text }
    this.$nextTick(() => this._e.init(this.$refs.cvs))
    window.addEventListener('resize', this._onResize)
  },
  beforeUnmount() { this._e?.dispose(); window.removeEventListener('resize', this._onResize) },
  methods: {
    _onResize() { this._e?.resize() },
    onParam() { this._e.setParams({ eclipseType: this.eclipseType, alignment: this.alignment / 100 }) },
    autoPlay() { this.auto = !this.auto; this._e.auto = this.auto },
    toggleGuide() {
      this.guideActive = !this.guideActive
      if (this.guideActive) {
        this._e.startGuidedMode(this._guideTexts)
        this.guideText = this._e.getGuideText()
      } else {
        this._e.stopGuidedMode()
        this.guideText = ''
      }
    },
    setPreset(key) {
      this.activePreset = key
      if (key === 'auto') { this.autoPlay(); return }
      if (this.auto) { this.auto = false; this._e.auto = false }
      const types = { lunar: 'lunar-total', solar: 'solar-total', annular: 'solar-annular' }
      this.eclipseType = types[key]
      this.alignment = 100
      this._e.setParams({ eclipseType: this.eclipseType, alignment: 1.0 })
    },
  },
}

class EclipseEngine extends ExperimentEngine {
  setupScene() {
    this.scene.background = new THREE.Color(0x050510)
    this.scene.fog = null

    // Remove base warm ambient, replace with cool space lighting
    const existingAmbient = this.scene.children.find(c => c.isAmbientLight)
    if (existingAmbient) {
      this.scene.remove(existingAmbient)
    }
    const ambient = new THREE.AmbientLight(0x334466, 1.5)
    this.scene.add(ambient)

    const sunGeo = new THREE.SphereGeometry(2, 32, 32)
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffd54f })
    this.sun = new THREE.Mesh(sunGeo, sunMat)
    this.sun.position.set(-10, 0, 0)
    this.scene.add(this.sun)

    const sunLight = new THREE.PointLight(0xfff8e8, 80, 50)
    sunLight.position.copy(this.sun.position)
    this.scene.add(sunLight)

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

    // Pre-allocate cone meshes once (transforms updated per frame)
    const umbraGeo = new THREE.CylinderGeometry(0.05, 0.8, 1, 16)
    const umbraMat = new THREE.MeshBasicMaterial({ color: 0x000011, transparent: true, opacity: 0.7 })
    this.umbraCone = new THREE.Mesh(umbraGeo, umbraMat)
    this.scene.add(this.umbraCone)

    const penumbraGeo = new THREE.CylinderGeometry(0.05, 1.2, 1, 16)
    const penumbraMat = new THREE.MeshBasicMaterial({ color: 0x111133, transparent: true, opacity: 0.35 })
    this.penumbraCone = new THREE.Mesh(penumbraGeo, penumbraMat)
    this.scene.add(this.penumbraCone)

    this.eclipseType = 'lunar-total'
    this.alignment = 1.0
    this.auto = false
    this._animT = 0

    this._updateCones()

    // Sprite labels
    this.scene.add(this._makeLabel('太阳', new THREE.Vector3(-10, 2.5, 0), '#ffd54f', 28, 2))
    this.scene.add(this._makeLabel('地球', new THREE.Vector3(0, 0.8, 0), '#42a5f5', 26, 1.8))
    this.scene.add(this._makeLabel('太阳光 →', new THREE.Vector3(-5, 0.6, 0), '#ffd54f', 24, 2))
    this._moonLabel = this._makeLabel('月球', new THREE.Vector3(3, 0.6, 0), '#cccccc', 24, 1.6)
    this.scene.add(this._moonLabel)
    this._umbraLabel = this._makeLabel('本影', new THREE.Vector3(1.5, 1, 0), '#ffffff', 20, 1.4)
    this.scene.add(this._umbraLabel)
    this._penumbraLabel = this._makeLabel('半影', new THREE.Vector3(1.5, 1.5, 0), '#aaaaaa', 20, 1.6)
    this.scene.add(this._penumbraLabel)

    this.camera.position.set(0, 3, 7)
    this.controls.target.set(-2, 0, 0)
  }

  _updateCones() {
    const align = this.alignment

    if (this.eclipseType === 'lunar-total') {
      // Earth casts shadow on Moon (Moon moves +X with alignment)
      this.moon.position.set(3 * align, 0, 0)

      const dist = this.moon.position.x - this.earth.position.x
      this.umbraCone.position.copy(this.earth.position)
      this.umbraCone.position.x += 0.5
      this.umbraCone.rotation.z = 0
      this.umbraCone.scale.set(1, dist, 1)
      this.umbraCone.visible = align > 0.15

      this.penumbraCone.position.copy(this.umbraCone.position)
      this.penumbraCone.rotation.z = 0
      this.penumbraCone.scale.set(1, dist * 1.2, 1)
      this.penumbraCone.visible = align > 0.1
    } else if (this.eclipseType === 'solar-total') {
      // Moon casts shadow on Earth (Moon moves -X with alignment)
      this.moon.position.set(-3 * align, 0, 0)

      const dist = this.earth.position.x - this.moon.position.x
      this.umbraCone.position.copy(this.moon.position)
      this.umbraCone.position.x += 0.15
      this.umbraCone.rotation.z = Math.PI
      this.umbraCone.scale.set(1, dist * 0.3, 1)
      this.umbraCone.visible = align > 0.1

      this.penumbraCone.position.copy(this.umbraCone.position)
      this.penumbraCone.rotation.z = Math.PI
      this.penumbraCone.scale.set(1, dist * 0.5, 1)
      this.penumbraCone.visible = align > 0.05
    } else if (this.eclipseType === 'solar-annular') {
      this.moon.position.set(-3 * align, 0, 0)

      const dist = this.earth.position.x - this.moon.position.x
      this.umbraCone.position.copy(this.moon.position)
      this.umbraCone.position.x += 0.15
      this.umbraCone.rotation.z = Math.PI
      this.umbraCone.scale.set(1, dist * 0.15, 1)
      this.umbraCone.visible = align > 0.3

      this.penumbraCone.position.copy(this.umbraCone.position)
      this.penumbraCone.rotation.z = Math.PI
      this.penumbraCone.scale.set(1, dist * 0.7, 1)
      this.penumbraCone.visible = align > 0.05
    }
  }

  update(dt) {
    if (this.auto) {
      this._animT += dt * 0.5
      this.alignment = 0.5 + 0.5 * Math.sin(this._animT)
      const alignPct = Math.round(this.alignment * 100)
      if (this._vm) this._vm.alignment = alignPct
      this._updateCones()
    }
    if (this._moonLabel) {
      this._moonLabel.position.copy(this.moon.position).add(new THREE.Vector3(0, 0.5, 0))
    }
    if (this._umbraLabel) {
      this._umbraLabel.position.copy(this.umbraCone.position).add(new THREE.Vector3(0.3, 0.4, 0))
    }
    if (this._penumbraLabel) {
      this._penumbraLabel.position.copy(this.penumbraCone.position).add(new THREE.Vector3(0.3, 0.8, 0))
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
    if (changed) this._updateCones()
  }
}
</script>

<style scoped>
.ec-layout { display: flex; gap: 0; border-radius: var(--radius-box); overflow: hidden; border: 1px solid var(--brown-light); }
.ec-panel { width: 210px; flex-shrink: 0; background: var(--card-bg); padding: 16px; border-right: 1px solid var(--brown-light); display: flex; flex-direction: column; gap: 10px; }
.preset-row { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px; }
.preset-btn { flex: 1; min-width: 55px; padding: 4px 6px; border: 1px solid var(--brown); border-radius: 4px; background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 11px; white-space: nowrap; }
.preset-btn.active { background: var(--red); color: #fff; border-color: var(--red); }
.preset-btn:hover { background: var(--button-green); }
.preset-btn.active:hover { background: var(--red); }
.ec-panel label { font-size: 13px; color: var(--ink); display: flex; justify-content: space-between; }
.ec-panel input[type="range"] { width: 100%; accent-color: var(--red); }
.ec-panel select { padding: 4px 8px; border: 1px solid var(--brown); border-radius: var(--radius-sm); background: var(--cream); color: var(--ink); font-family: inherit; font-size: 13px; }
.ec-panel button { padding: 6px 12px; border: 1px solid var(--brown); border-radius: var(--radius-sm); background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 13px; }
.ec-panel button:hover { background: var(--button-green); }
.ec-hint { font-size: 11px; color: var(--muted); text-align: center; margin-top: auto; }
.guide-btn { width: 100%; padding: 8px; margin-top: 8px; border: 2px solid var(--red); border-radius: var(--radius-sm); background: var(--cream); color: var(--red); cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 600; transition: all var(--transition); }
.guide-btn.active { background: var(--red); color: #fff; animation: pulse 2s infinite; }
.guide-text-box { font-size: 12px; color: var(--red); background: rgba(158,36,38,0.06); padding: 8px; border-radius: var(--radius-sm); border: 1px solid rgba(158,36,38,0.2); text-align: center; line-height: 1.5; }
.ec-canvas-wrap { flex: 1; min-height: 460px; background: #050510; }
.ec-canvas-wrap canvas { width: 100%; height: 100%; display: block; }

@media (max-width: 720px) {
  .ec-layout { flex-direction: column; }
  .ec-panel { width: 100%; border-right: 0; border-bottom: 1px solid var(--brown-light); flex-direction: row; flex-wrap: wrap; gap: 8px; }
  .ec-canvas-wrap { min-height: 320px; }
}
</style>
