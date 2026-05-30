<template>
  <div class="st2-layout">
    <aside class="st2-panel">
      <label>水流速度 <span>{{ velocity.toFixed(1) }} m/s</span></label>
      <input type="range" min="0" max="50" v-model.number="velocity" @input="onParam" step="0.5" />
      <div class="st2-legend">
        <div class="legend-item"><span class="legend-dot" style="background:#bdbdbd"></span> 黏土 &lt;0.004mm</div>
        <div class="legend-item"><span class="legend-dot" style="background:#a1887f"></span> 粉砂 0.004-0.06mm</div>
        <div class="legend-item"><span class="legend-dot" style="background:#ffcc80"></span> 砂 0.06-2mm</div>
        <div class="legend-item"><span class="legend-dot" style="background:#8d6e63"></span> 砾石 &gt;2mm</div>
      </div>
      <p class="st2-hint">🖱 拖动旋转 · 滚轮缩放</p>
    </aside>
    <div class="st2-canvas-wrap">
      <canvas ref="cvs"></canvas>
    </div>
  </div>
</template>

<script>
import { ExperimentEngine } from '../../engine/ExperimentEngine.js'
import * as THREE from 'three'

export default {
  name: 'SedimentTransport',
  data() { return { velocity: 5 } },
  mounted() {
    this._e = new SedimentTransportEngine()
    this.$nextTick(() => this._e.init(this.$refs.cvs))
    window.addEventListener('resize', this._onResize)
  },
  beforeUnmount() { this._e?.dispose(); window.removeEventListener('resize', this._onResize) },
  methods: {
    _onResize() { this._e?.resize() },
    onParam() { this._e.setParams({ velocity: this.velocity / 10 }) },
    reset() { this._e.dispose(); this.$nextTick(() => { this._e = new SedimentTransportEngine(); this._e.init(this.$refs.cvs) }) },
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
      { size: 0.06, color: 0xbdbdbd, label: 'clay', criticalErosion: 2, criticalDeposit: 0.1 },
      { size: 0.12, color: 0xa1887f, label: 'silt', criticalErosion: 1.5, criticalDeposit: 0.3 },
      { size: 0.2, color: 0xffcc80, label: 'sand', criticalErosion: 1, criticalDeposit: 0.5 },
      { size: 0.35, color: 0x8d6e63, label: 'gravel', criticalErosion: 0.8, criticalDeposit: 1 },
    ]
    grainTypes.forEach((gt) => {
      for (let i = 0; i < 8; i++) {
        const geo = new THREE.SphereGeometry(gt.size, 8, 8)
        const mat = new THREE.MeshStandardMaterial({ color: gt.color, roughness: 0.6 })
        const grain = new THREE.Mesh(geo, mat)
        grain.position.set((Math.random() - 0.5) * 7, -0.9, (Math.random() - 0.5) * 1.5)
        grain.userData = { ...gt, state: 'rest' }
        this.scene.add(grain)
        this.sediments.push(grain)
      }
    })

    this.velocity = 0.5
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
.st2-hint { font-size: 11px; color: var(--muted); text-align: center; margin-top: auto; }
.st2-canvas-wrap { flex: 1; min-height: 460px; background: var(--cream); }
.st2-canvas-wrap canvas { width: 100%; height: 100%; display: block; }

@media (max-width: 720px) {
  .st2-layout { flex-direction: column; }
  .st2-panel { width: 100%; border-right: 0; border-bottom: 1px solid var(--brown-light); flex-direction: row; flex-wrap: wrap; gap: 8px; }
  .st2-canvas-wrap { min-height: 320px; }
}
</style>
