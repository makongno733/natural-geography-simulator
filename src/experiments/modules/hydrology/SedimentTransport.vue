<template>
  <div class="st2-layout">
    <aside class="st2-panel">
      <div class="preset-row">
        <button
          v-for="p in presets" :key="p.label"
          class="preset-btn" :class="{ active: currentPreset === p.label }"
          @click="applyPreset(p)"
        >{{ p.label }}</button>
      </div>
      <label>水流速度 <span>{{ velocity.toFixed(1) }} m/s</span></label>
      <input type="range" min="0" max="50" v-model.number="velocity" @input="onParam" step="0.5" />
      <div class="st2-legend">
        <div class="legend-item"><span class="legend-dot" style="background:#bdbdbd"></span> 黏土 &lt;0.004mm</div>
        <div class="legend-item"><span class="legend-dot" style="background:#a1887f"></span> 粉砂 0.004-0.06mm</div>
        <div class="legend-item"><span class="legend-dot" style="background:#ffcc80"></span> 砂 0.06-2mm</div>
        <div class="legend-item"><span class="legend-dot" style="background:#8d6e63"></span> 砾石 &gt;2mm</div>
      </div>
      <button @click="toggleGuide" :class="['guide-btn', { active: guideActive }]">
        {{ guideActive ? '⏸ 停止演示' : '▶ 引导演示' }}
      </button>
      <div v-if="guideActive" class="guide-text-box">{{ guideText }}</div>
      <p class="st2-hint">🖱 拖动旋转 · 滚轮缩放</p>
    </aside>
    <div class="st2-canvas-wrap">
      <canvas ref="cvs"></canvas>
      <button class="lock-btn" @click="toggleLock" :title="locked ? '解锁旋转' : '锁定旋转'">
        {{ locked ? '🔒' : '🔓' }}
      </button>
    </div>
  </div>
  <div class="exp-desc">
    <h4>实验说明</h4>
    <p>本实验演示Hjulstrom曲线揭示的流水搬运规律：不同粒径颗粒（黏土、粉砂、砂、砾石）在不同流速下经历侵蚀、搬运和沉积。低速时颗粒沉降堆积，中速时砂粒搬运活跃，高速洪水可搬运砾石。这是理解河流地貌发育和水力工程的核心原理。</p>
  </div>
</template>

<script>
import { ExperimentEngine } from '../../engine/ExperimentEngine.js'
import * as THREE from 'three'

export default {
  name: 'SedimentTransport',
  data() { return {
    velocity: 5, currentPreset: null, locked: true,
    guideActive: false,
    guideText: '',
    _guideTexts: [
      'Hjulstrom 曲线：不同流速下颗粒的侵蚀、搬运与沉积',
      '细颗粒黏土需较高流速才能侵蚀，但易悬浮搬运',
      '粗颗粒砾石需高流速搬运，流速降低时最先沉积',
      '中等流速时砂粒最容易被侵蚀和搬运',
    ],
    presets: [
      { label: '静水沉积', velocity: 1 },
      { label: '中等流速', velocity: 15 },
      { label: '洪水搬运', velocity: 40 },
    ],
  } },
  mounted() {
    this._e = new SedimentTransportEngine()
    this._e._onGuideChange = (text) => { this.guideText = text }
    this.$nextTick(() => { this._e.init(this.$refs.cvs); if (this.locked) this._e.controls.enabled = false })
    window.addEventListener('resize', this._onResize)
  },
  beforeUnmount() { this._e?.dispose(); window.removeEventListener('resize', this._onResize) },
  methods: {
    _onResize() { this._e?.resize() },
    toggleLock() { this.locked = !this.locked; if (this._e?.controls) this._e.controls.enabled = !this.locked },
    onParam() { this.currentPreset = null; this._e.setParams({ velocity: this.velocity / 10 }) },
    applyPreset(p) {
      this.currentPreset = p.label
      this.velocity = p.velocity
      this._e.setParams({ velocity: this.velocity / 10 })
    },
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
    reset() { this._e.dispose(); this.$nextTick(() => { this._e = new SedimentTransportEngine(); this._e._onGuideChange = (text) => { this.guideText = text }; this._e.init(this.$refs.cvs); if (this.locked) this._e.controls.enabled = false }) },
  },
}

class SedimentTransportEngine extends ExperimentEngine {
  setupScene() {
    const troughGeo = new THREE.BoxGeometry(8, 0.1, 2)
    const troughMat = new THREE.MeshStandardMaterial({ color: 0x5d9b9b, roughness: 0.5, transparent: true, opacity: 0.6 })
    const trough = new THREE.Mesh(troughGeo, troughMat)
    trough.position.y = -1
    this.scene.add(trough)

    this.sediments = []
    const grainTypes = [
      { size: 0.04, color: 0xbdbdbd, label: 'clay', criticalErosion: 2, criticalDeposit: 0.1 },
      { size: 0.14, color: 0xa1887f, label: 'silt', criticalErosion: 1.5, criticalDeposit: 0.3 },
      { size: 0.28, color: 0xffcc80, label: 'sand', criticalErosion: 1, criticalDeposit: 0.5 },
      { size: 0.5, color: 0x8d6e63, label: 'gravel', criticalErosion: 0.8, criticalDeposit: 1 },
    ]
    grainTypes.forEach((gt) => {
      for (let i = 0; i < 8; i++) {
        const geo = new THREE.SphereGeometry(gt.size, 12, 12)
        const mat = new THREE.MeshStandardMaterial({ color: gt.color, roughness: 0.6 })
        const grain = new THREE.Mesh(geo, mat)
        grain.position.set((Math.random() - 0.5) * 7, -0.9, (Math.random() - 0.5) * 1.5)
        grain.userData = { ...gt, state: 'rest' }
        this.scene.add(grain)
        this.sediments.push(grain)
      }
    })

    this.velocity = 0.5

    // Flow direction and grain type labels
    this._makeLabel('流向 →', new THREE.Vector3(1.5, -0.4, 1.5), '#1565c0', 28, 2.5)
    this._makeLabel('黏土', new THREE.Vector3(-2.5, -0.3, 1.5), '#bdbdbd', 22, 2)
    this._makeLabel('粉砂', new THREE.Vector3(-1.2, -0.3, 1.5), '#a1887f', 22, 2)
    this._makeLabel('砂', new THREE.Vector3(1.2, -0.3, 1.5), '#ffcc80', 22, 2)
    this._makeLabel('砾石', new THREE.Vector3(2.5, -0.3, 1.5), '#8d6e63', 22, 2)

    this.camera.position.set(0, 3, 6)
    this.controls.target.set(0, -0.8, 0)
  }

  update(dt) {
    const v = this.velocity
    for (const grain of this.sediments) {
      const ud = grain.userData
      if (v > ud.criticalErosion) {
        ud.state = 'eroding'
        grain.position.x += dt * v * 0.5 * (ud.size < 0.1 ? 2 : 1)
        grain.position.y += dt * v * 0.15
        if (grain.position.x > 4) grain.position.x = -4
      } else if (v < ud.criticalDeposit) {
        if (ud.state === 'eroding') {
          grain.position.y -= dt * 0.3
          if (grain.position.y < -0.9) { grain.position.y = -0.9; ud.state = 'rest' }
        }
      }
    }
  }

  setParams({ velocity }) {
    if (velocity !== undefined) this.velocity = velocity
  }
}
</script>

<style scoped>
.st2-layout { display: flex; gap: 0; border-radius: var(--radius-box); overflow: hidden; border: 1px solid var(--brown-light); }
.st2-panel { width: 200px; flex-shrink: 0; background: var(--card-bg); padding: 16px; border-right: 1px solid var(--brown-light); display: flex; flex-direction: column; gap: 10px; }
.st2-panel label { font-size: 13px; color: var(--ink); display: flex; justify-content: space-between; }
.st2-panel input[type="range"] { width: 100%; accent-color: var(--red); }
.st2-legend { font-size: 11px; color: var(--muted); display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
.legend-item { display: flex; align-items: center; gap: 6px; }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.preset-row { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px; }
.preset-btn { flex: 1; min-width: 60px; padding: 4px 6px; border: 1px solid var(--brown); border-radius: 4px; background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 11px; white-space: nowrap; }
.preset-btn.active { background: var(--red); color: #fff; border-color: var(--red); }
.st2-hint { font-size: 11px; color: var(--muted); text-align: center; margin-top: auto; }
.guide-btn { width: 100%; padding: 8px; margin-top: 8px; border: 2px solid var(--red); border-radius: var(--radius-sm); background: var(--cream); color: var(--red); cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 600; transition: all var(--transition); }
.guide-btn.active { background: var(--red); color: #fff; animation: pulse 2s infinite; }
.guide-text-box { font-size: 12px; color: var(--red); background: rgba(158,36,38,0.06); padding: 8px; border-radius: var(--radius-sm); border: 1px solid rgba(158,36,38,0.2); text-align: center; line-height: 1.5; }
.st2-canvas-wrap { flex: 1; min-height: 460px; background: var(--cream); position: relative; }
.lock-btn { position: absolute; top: 12px; right: 12px; z-index: 10; width: 36px; height: 36px; border-radius: 8px; border: 1px solid var(--brown); background: rgba(255,255,255,0.85); font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.lock-btn:hover { background: rgba(255,255,255,1); }
.st2-canvas-wrap canvas { width: 100%; height: 100%; display: block; }

.exp-desc { margin-top: 16px; padding: 14px 18px; background: var(--card-bg); border-radius: var(--radius-card); border: 1px solid var(--brown-light); }
.exp-desc h4 { font-size: 14px; color: var(--red); margin: 0 0 6px; }
.exp-desc p { font-size: 14px; line-height: 1.7; color: var(--ink); margin: 0; }

@media (max-width: 720px) {
  .st2-layout { flex-direction: column; }
  .st2-panel {
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
  .st2-panel label { font-size: 12px; flex: 1 1 auto; min-width: 80px; }
  .st2-panel input[type="range"] { flex: 2 1 auto; min-width: 100px; }
  .st2-panel button { font-size: 12px; padding: 5px 8px; }
  .st2-canvas-wrap { min-height: 280px; }
  .guide-text-box { width: 100%; font-size: 11px; }
  .st2-hint { font-size: 10px; }
  .preset-row { width: 100%; }
  .preset-btn { font-size: 10px; padding: 4px 6px; }
  .exp-desc { padding: 10px 14px; margin-top: 12px; }
  .exp-desc h4 { font-size: 13px; }
  .exp-desc p { font-size: 13px; line-height: 1.6; }
}
</style>
