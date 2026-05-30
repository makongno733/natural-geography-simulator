<template>
  <div class="gw-layout">
    <aside class="gw-panel">
      <label>抽水速率 <span>{{ pumpRate }}</span></label>
      <input type="range" min="0" max="10" v-model.number="pumpRate" @input="onParam" />
      <label>降雨补给 <span>{{ recharge }}</span></label>
      <input type="range" min="0" max="10" v-model.number="recharge" @input="onParam" />
      <button @click="reset">↺ 重置</button>
      <p class="gw-hint">🖱 拖动旋转 · 滚轮缩放</p>
    </aside>
    <div class="gw-canvas-wrap">
      <canvas ref="cvs"></canvas>
    </div>
  </div>
</template>

<script>
import { ExperimentEngine } from '../../engine/ExperimentEngine.js'
import * as THREE from 'three'

export default {
  name: 'Groundwater',
  data() { return { pumpRate: 3, recharge: 4 } },
  mounted() {
    this._e = new GroundwaterEngine()
    this.$nextTick(() => this._e.init(this.$refs.cvs))
    window.addEventListener('resize', this._onResize)
  },
  beforeUnmount() { this._e?.dispose(); window.removeEventListener('resize', this._onResize) },
  methods: {
    _onResize() { this._e?.resize() },
    onParam() { this._e.setParams({ pumpRate: this.pumpRate, recharge: this.recharge }) },
    reset() { this._e.dispose(); this.$nextTick(() => { this._e = new GroundwaterEngine(); this._e.init(this.$refs.cvs) }) },
  },
}

class GroundwaterEngine extends ExperimentEngine {
  setupScene() {
    const layers = [
      { y: 1.2, h: 0.6, color: 0xc8a96e },
      { y: 0.5, h: 0.7, color: 0xd4b896 },
      { y: -0.3, h: 0.8, color: 0x9e8c7a },
      { y: -1.2, h: 0.9, color: 0x8b7355 },
    ]
    layers.forEach(({ y, h, color }) => {
      const geo = new THREE.BoxGeometry(8, h, 3)
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.8 })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.y = y
      this.scene.add(mesh)
    })

    const wtGeo = new THREE.PlaneGeometry(8, 3)
    wtGeo.rotateX(-Math.PI / 2)
    const wtMat = new THREE.MeshStandardMaterial({ color: 0x42a5f5, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
    this.waterTable = new THREE.Mesh(wtGeo, wtMat)
    this.waterTable.position.y = 0.4
    this.scene.add(this.waterTable)

    const wellGeo = new THREE.CylinderGeometry(0.12, 0.12, 3, 16)
    const wellMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.4 })
    this.well = new THREE.Mesh(wellGeo, wellMat)
    this.well.position.set(0, 0, 0)
    this.scene.add(this.well)

    const coneGeo = new THREE.SphereGeometry(0.3, 16, 16)
    this.coneMat = new THREE.MeshBasicMaterial({ color: 0x42a5f5, transparent: true, opacity: 0.25 })
    this.cone = new THREE.Mesh(coneGeo, this.coneMat)
    this.cone.position.set(0, 0.4, 0)
    this.scene.add(this.cone)

    this.pumpRate = 3
    this.recharge = 4
    this.camera.position.set(0, 2, 8)
    this.controls.target.set(0, 0, 0)
  }

  update(dt) {
    const pr = this.pumpRate / 5
    const rc = this.recharge / 5
    const targetY = 0.4 - pr * 0.8 + rc * 0.6
    const currentY = this.waterTable.position.y
    this.waterTable.position.y += (targetY - currentY) * Math.min(dt * 3, 1)

    const targetConeScale = 1 + pr * 2
    const currentConeX = this.cone.scale.x
    const newScale = currentConeX + (targetConeScale - currentConeX) * Math.min(dt * 3, 1)
    this.cone.scale.set(newScale, 0.3, newScale)
    this.cone.position.y = this.waterTable.position.y
    this.coneMat.opacity = 0.1 + pr * 0.3
  }

  setParams({ pumpRate, recharge }) {
    if (pumpRate !== undefined) this.pumpRate = pumpRate
    if (recharge !== undefined) this.recharge = recharge
  }
}
</script>

<style scoped>
.gw-layout { display: flex; gap: 0; border-radius: var(--radius-box); overflow: hidden; border: 1px solid var(--brown-light); }
.gw-panel { width: 200px; flex-shrink: 0; background: var(--card-bg); padding: 16px; border-right: 1px solid var(--brown-light); display: flex; flex-direction: column; gap: 10px; }
.gw-panel label { font-size: 13px; color: var(--ink); display: flex; justify-content: space-between; }
.gw-panel input[type="range"] { width: 100%; accent-color: var(--red); }
.gw-panel button { padding: 6px 12px; border: 1px solid var(--brown); border-radius: var(--radius-sm); background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 13px; }
.gw-panel button:hover { background: var(--button-green); }
.gw-hint { font-size: 11px; color: var(--muted); text-align: center; margin-top: auto; }
.gw-canvas-wrap { flex: 1; min-height: 460px; background: var(--cream); }
.gw-canvas-wrap canvas { width: 100%; height: 100%; display: block; }

@media (max-width: 720px) {
  .gw-layout { flex-direction: column; }
  .gw-panel { width: 100%; border-right: 0; border-bottom: 1px solid var(--brown-light); flex-direction: row; flex-wrap: wrap; gap: 8px; }
  .gw-canvas-wrap { min-height: 320px; }
}
</style>
