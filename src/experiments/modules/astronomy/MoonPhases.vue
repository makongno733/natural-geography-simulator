<template>
  <div class="mp-layout">
    <aside class="mp-panel">
      <div class="preset-row">
        <button class="preset-btn" :class="{ active: activePreset === 'new' }" @click="setPreset('new')">新月</button>
        <button class="preset-btn" :class="{ active: activePreset === 'first' }" @click="setPreset('first')">上弦月</button>
        <button class="preset-btn" :class="{ active: activePreset === 'full' }" @click="setPreset('full')">满月</button>
        <button class="preset-btn" :class="{ active: activePreset === 'third' }" @click="setPreset('third')">下弦月</button>
        <button class="preset-btn" :class="{ active: activePreset === 'auto' }" @click="setPreset('auto')">自动演示</button>
      </div>
      <label>月球位置 (旋转角度)</label>
      <input type="range" min="0" max="360" v-model.number="moonAngle" @input="onParam" />
      <div class="mp-phase-label">当前月相：<strong>{{ phaseName }}</strong></div>
      <div class="earth-view">
        <div class="earth-view-label">🌍 地球观测视角</div>
        <div class="moon-disk" :style="moonPhaseStyle"></div>
        <div class="earth-view-phase">{{ phaseName }}</div>
      </div>
      <button @click="autoPlay">{{ auto ? '⏸ 暂停' : '▶ 自动演示' }}</button>
      <button @click="toggleGuide" :class="['guide-btn', { active: guideActive }]">
        {{ guideActive ? '⏸ 停止演示' : '▶ 引导演示' }}
      </button>
      <div v-if="guideActive" class="guide-text-box">{{ guideText }}</div>
      <p class="mp-hint">🖱 拖动旋转 · 滚轮缩放</p>
    </aside>
    <div class="mp-canvas-wrap">
      <canvas ref="cvs"></canvas>
      <button class="lock-btn" @click="toggleLock" :title="locked ? '解锁旋转' : '锁定旋转'">
        {{ locked ? '🔒' : '🔓' }}
      </button>
    </div>
  </div>
  <div class="exp-desc">
    <h4>实验说明</h4>
    <p>本实验从空间视角展示月相变化的几何原理：太阳光从右侧照射，月球绕地球公转，我们从地球视角看到月球被照亮面的不同比例。拖动月球位置或点击预设观察新月、上弦月、满月、下弦月的形成——月相取决于日月地三者的相对位置。</p>
  </div>
</template>

<script>
import { ExperimentEngine } from '../../engine/ExperimentEngine.js'
import * as THREE from 'three'

const phaseNames = ['新月', '蛾眉月(盈)', '上弦月', '盈凸月', '满月', '亏凸月', '下弦月', '蛾眉月(亏)']

export default {
  name: 'MoonPhases',
  data() { return {
    moonAngle: 0, auto: false, phaseName: '新月', activePreset: 'new', locked: true,
    guideActive: false,
    guideText: '',
    _guideTexts: [
      '月球绕地球公转时，被太阳照亮的部分不断变化',
      '新月时月球位于太阳和地球之间，看不到亮面',
      '满月时地球位于太阳和月球之间，看到整个亮面',
      '上弦月和下弦月时看到月球的一半亮面',
    ],
  } },
  computed: {
    moonPhaseStyle() {
      const deg = ((this.moonAngle % 360) + 360) % 360
      let pct
      if (deg <= 180) {
        pct = deg / 180 * 100
      } else {
        pct = (360 - deg) / 180 * 100
      }
      return {
        background: `linear-gradient(90deg, #e8e8e8 ${pct}%, #333 ${pct}%)`
      }
    },
  },
  mounted() {
    this._e = new MoonPhasesEngine()
    this._e._vm = this
    this._e._onGuideChange = (text) => { this.guideText = text }
    this.$nextTick(() => { this._e.init(this.$refs.cvs); if (this.locked) this._e.controls.enabled = false })
    window.addEventListener('resize', this._onResize)
  },
  beforeUnmount() { this._e?.dispose(); window.removeEventListener('resize', this._onResize) },
  methods: {
    _onResize() { this._e?.resize() },
    toggleLock() { this.locked = !this.locked; if (this._e?.controls) this._e.controls.enabled = !this.locked },
    onParam() { this._e.setParams({ moonAngle: this.moonAngle * Math.PI / 180 }) },
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
      const angles = { new: 0, first: 90, full: 180, third: 270 }
      this.moonAngle = angles[key]
      this.onParam()
    },
  },
}

class MoonPhasesEngine extends ExperimentEngine {
  setupScene() {
    const sunGeo = new THREE.SphereGeometry(1, 32, 32)
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffd54f })
    const sun = new THREE.Mesh(sunGeo, sunMat)
    sun.position.set(10, 0, 0)
    this.scene.add(sun)

    this.sunLight = new THREE.PointLight(0xfff8e8, 50, 30)
    this.sunLight.position.copy(sun.position)
    this.scene.add(this.sunLight)

    const earthGeo = new THREE.SphereGeometry(0.5, 32, 32)
    const earthMat = new THREE.MeshStandardMaterial({ color: 0x42a5f5, roughness: 0.5 })
    this.earth = new THREE.Mesh(earthGeo, earthMat)
    this.scene.add(this.earth)

    const moonGeo = new THREE.SphereGeometry(0.15, 16, 16)
    const moonMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.7 })
    this.moon = new THREE.Mesh(moonGeo, moonMat)
    this.moon.position.set(0, 0, 2)
    this.scene.add(this.moon)

    const orbitGeo = new THREE.TorusGeometry(2, 0.02, 16, 64)
    const orbitLine = new THREE.Mesh(orbitGeo, new THREE.MeshBasicMaterial({ color: 0xb8a57a, transparent: true, opacity: 0.4 }))
    this.scene.add(orbitLine)

    // Sprite labels
    this.scene.add(this._makeLabel('太阳', new THREE.Vector3(10, 1.3, 0), '#ffd54f', 28, 2))
    this.scene.add(this._makeLabel('地球', new THREE.Vector3(0, 0.8, 0), '#42a5f5', 28, 2))
    this.scene.add(this._makeLabel('月球轨道', new THREE.Vector3(0, 0.5, 2.4), '#888888', 24, 2))
    this.scene.add(this._makeLabel('太阳光 →', new THREE.Vector3(5, 0.6, 0), '#ffd54f', 24, 2))
    this._phaseSprite = this._makeLabel('新月', new THREE.Vector3(0, 1, 2), '#ffffff', 26, 1.8)
    this.scene.add(this._phaseSprite)

    this.moonAngle = 0
    this.auto = false
    this.camera.position.set(0, 4, 6)
    this.controls.target.set(0, 0, 1)
    this.scene.background = new THREE.Color(0x0a0a1a)
    this.scene.fog = null

    // Remove base warm ambient, replace with cool space lighting
    const existingAmbient = this.scene.children.find(c => c.isAmbientLight)
    if (existingAmbient) {
      this.scene.remove(existingAmbient)
    }
    const ambient = new THREE.AmbientLight(0x334466, 1.5)
    this.scene.add(ambient)
  }

  update(dt) {
    if (this.auto) {
      this.moonAngle += dt * 0.4
      if (this.moonAngle > Math.PI * 100) this.moonAngle -= Math.PI * 2 * 50
      this._vm.moonAngle = Math.round((this.moonAngle * 180 / Math.PI) % 360)
      this._vm.phaseName = phaseNames[Math.round(this.moonAngle / (Math.PI / 4)) % 8]
    }
    const a = this.moonAngle
    this.moon.position.set(Math.cos(a) * 2, 0, Math.sin(a) * 2)
    this.moon.lookAt(this.earth.position)
    if (this._phaseSprite) {
      this._phaseSprite.position.copy(this.moon.position).add(new THREE.Vector3(0, 0.5, 0))
      this._phaseSprite.material.map.needsUpdate = true
    }
    const idx = Math.round(a / (Math.PI / 4)) % 8
    if (this._vm) this._vm.phaseName = phaseNames[idx]
  }

  setParams({ moonAngle }) {
    if (moonAngle !== undefined) {
      this.moonAngle = moonAngle
      this._vm.phaseName = phaseNames[Math.round(moonAngle / (Math.PI / 4)) % 8]
    }
  }
}
</script>

<style scoped>
.mp-layout { display: flex; gap: 0; border-radius: var(--radius-box); overflow: hidden; border: 1px solid var(--brown-light); }
.mp-panel { width: 210px; flex-shrink: 0; background: var(--card-bg); padding: 16px; border-right: 1px solid var(--brown-light); display: flex; flex-direction: column; gap: 10px; }
.mp-panel label { font-size: 13px; color: var(--ink); }
.mp-panel input[type="range"] { width: 100%; accent-color: var(--red); }
.mp-phase-label { font-size: 15px; color: var(--ink); text-align: center; padding: 8px; background: rgba(158,36,38,0.06); border-radius: var(--radius-sm); }
.mp-panel button { padding: 6px 12px; border: 1px solid var(--brown); border-radius: var(--radius-sm); background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 13px; }
.mp-panel button:hover { background: var(--button-green); }
.mp-hint { font-size: 11px; color: var(--muted); text-align: center; margin-top: auto; }
.guide-btn { width: 100%; padding: 8px; margin-top: 8px; border: 2px solid var(--red); border-radius: var(--radius-sm); background: var(--cream); color: var(--red); cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 600; transition: all var(--transition); }
.guide-btn.active { background: var(--red); color: #fff; animation: pulse 2s infinite; }
.guide-text-box { font-size: 12px; color: var(--red); background: rgba(158,36,38,0.06); padding: 8px; border-radius: var(--radius-sm); border: 1px solid rgba(158,36,38,0.2); text-align: center; line-height: 1.5; }
.mp-canvas-wrap { flex: 1; min-height: 460px; background: #0a0a1a; position: relative; }
.lock-btn { position: absolute; top: 12px; right: 12px; z-index: 10; width: 36px; height: 36px; border-radius: 8px; border: 1px solid var(--brown); background: rgba(255,255,255,0.85); font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.lock-btn:hover { background: rgba(255,255,255,1); }
.mp-canvas-wrap canvas { width: 100%; height: 100%; display: block; }

.preset-row { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px; }
.preset-btn { flex: 1; min-width: 55px; padding: 4px 6px; border: 1px solid var(--brown); border-radius: 4px; background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 11px; white-space: nowrap; }
.preset-btn.active { background: var(--red); color: #fff; border-color: var(--red); }
.preset-btn:hover { background: var(--button-green); }
.preset-btn.active:hover { background: var(--red); }

.earth-view { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px; background: #0a0a1a; border-radius: 8px; margin-top: 8px; }
.earth-view-label { font-size: 12px; color: #ccc; }
.moon-disk { width: 80px; height: 80px; border-radius: 50%; background: #e8e8e8; transition: all 0.3s; }
.earth-view-phase { font-size: 13px; color: #ffd54f; font-weight: 600; }

.exp-desc { margin-top: 16px; padding: 14px 18px; background: var(--card-bg); border-radius: var(--radius-card); border: 1px solid var(--brown-light); }
.exp-desc h4 { font-size: 14px; color: var(--red); margin: 0 0 6px; }
.exp-desc p { font-size: 14px; line-height: 1.7; color: var(--ink); margin: 0; }

@media (max-width: 720px) {
  .mp-layout { flex-direction: column; }
  .mp-panel {
    width: 100%;
    border-right: 0;
    border-bottom: 1px solid var(--brown-light);
    padding: 10px 12px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }
  .mp-panel label { font-size: 12px; flex: 1 1 auto; min-width: 80px; }
  .mp-panel input[type="range"] { flex: 2 1 auto; min-width: 100px; }
  .mp-panel button { font-size: 12px; padding: 5px 8px; }
  .mp-canvas-wrap { min-height: 280px; }
  .guide-text-box { width: 100%; font-size: 11px; }
  .mp-hint { font-size: 10px; }
  .preset-row { width: 100%; }
  .preset-btn { font-size: 10px; padding: 4px 6px; }
  .exp-desc { padding: 10px 14px; margin-top: 12px; }
  .exp-desc h4 { font-size: 13px; }
  .exp-desc p { font-size: 13px; line-height: 1.6; }
}
</style>
