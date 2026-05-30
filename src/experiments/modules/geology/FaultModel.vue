<template>
  <div class="fm-layout">
    <aside class="fm-panel">
      <label>压缩/拉伸</label>
      <div class="fm-buttons">
        <button @click="compress" :disabled="displacement >= 3">◀◀ 压缩</button>
        <button @click="extend">拉伸 ▶▶</button>
      </div>
      <label>位移 <span>{{ displacement.toFixed(1) }}</span></label>
      <input type="range" min="-3" max="3" step="0.1" v-model.number="displacement" @input="onParam" />
      <button @click="reset">↺ 重置</button>
      <p class="fm-hint">🖱 拖动旋转 · 滚轮缩放</p>
    </aside>
    <div class="fm-canvas-wrap">
      <canvas ref="cvs"></canvas>
    </div>
  </div>
</template>

<script>
import { ExperimentEngine } from '../../engine/ExperimentEngine.js'
import * as THREE from 'three'

export default {
  name: 'FaultModel',
  data() { return { displacement: 0 } },
  mounted() {
    this._e = new FaultModelEngine()
    this.$nextTick(() => this._e.init(this.$refs.cvs))
    window.addEventListener('resize', this._onResize)
  },
  beforeUnmount() { this._e?.dispose(); window.removeEventListener('resize', this._onResize) },
  methods: {
    _onResize() { this._e?.resize() },
    compress() { this.displacement = Math.min(3, this.displacement + 0.3); this.onParam() },
    extend() { this.displacement = Math.max(-3, this.displacement - 0.3); this.onParam() },
    onParam() { this._e.setParams({ displacement: this.displacement }) },
    reset() { this.displacement = 0; this._e.dispose(); this.$nextTick(() => { this._e = new FaultModelEngine(); this._e.init(this.$refs.cvs) }) },
  },
}

class FaultModelEngine extends ExperimentEngine {
  setupScene() {
    const layerColors = [0xc8a96e, 0xd4b896, 0x9e8c7a, 0x8b7355]
    this.layers = []
    this._origPositions = []
    layerColors.forEach((color, i) => {
      const y = 1.5 - i * 0.8
      const geo = new THREE.BoxGeometry(6, 0.7, 3)
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
      const layer = new THREE.Mesh(geo, mat)
      layer.position.set(0, y, 0)
      layer.castShadow = true; layer.receiveShadow = true
      this.scene.add(layer)
      this.layers.push(layer)
      this._origPositions.push({ mesh: layer, origX: layer.position.x, origY: layer.position.y })
    })

    const wallGeo = new THREE.BoxGeometry(0.15, 4, 3.2)
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.4 })
    this.wall = new THREE.Mesh(wallGeo, wallMat)
    this.wall.position.set(3, 0, 0)
    this.scene.add(this.wall)

    const fixedWall = new THREE.Mesh(wallGeo, wallMat)
    fixedWall.position.set(-3, 0, 0)
    this.scene.add(fixedWall)

    this.camera.position.set(5, 3, 8)
    this.controls.target.set(0, 0, 0)
    this._targetDisp = 0
    this._currentDisp = 0
  }

  update(dt) {
    this._currentDisp += (this._targetDisp - this._currentDisp) * Math.min(dt * 8, 1)
    this.wall.position.x = 3 + this._currentDisp * 0.5
    const d = this._currentDisp
    this.layers.forEach((layer, i) => {
      const origX = this._origPositions[i].origX
      const origY = this._origPositions[i].origY
      const influence = 1 / (1 + Math.abs(layer.position.x - (3 + d * 0.5)) * 0.5)
      layer.position.x = origX + d * 0.3 * influence
      const scaleY = 1 + Math.max(0, d) * 0.25 * influence * (1 - i * 0.15)
      const scaleX = 1 - Math.max(0, d) * 0.15 * influence
      layer.scale.set(scaleX, scaleY, 1)
      if (Math.abs(d) > 0.6) {
        const faultOffset = Math.sign(d) * Math.max(0, Math.abs(d) - 0.6) * 0.15 * (i + 1) * 0.3
        layer.position.y = origY + faultOffset * (layer.position.x > 0 ? 1 : -0.3)
      }
    })
  }

  setParams({ displacement }) {
    if (displacement !== undefined) this._targetDisp = displacement
  }
}
</script>

<style scoped>
.fm-layout { display: flex; gap: 0; border-radius: var(--radius-box); overflow: hidden; border: 1px solid var(--brown-light); }
.fm-panel { width: 200px; flex-shrink: 0; background: var(--card-bg); padding: 16px; border-right: 1px solid var(--brown-light); display: flex; flex-direction: column; gap: 10px; }
.fm-panel label { font-size: 13px; color: var(--ink); display: flex; justify-content: space-between; }
.fm-panel input[type="range"] { width: 100%; accent-color: var(--red); }
.fm-buttons { display: flex; gap: 4px; }
.fm-buttons button { flex: 1; padding: 6px 0; border: 1px solid var(--brown); border-radius: var(--radius-sm); background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 12px; }
.fm-buttons button:hover:not(:disabled) { background: var(--button-green); }
.fm-buttons button:disabled { opacity: 0.4; cursor: default; }
.fm-panel button { padding: 6px 12px; border: 1px solid var(--brown); border-radius: var(--radius-sm); background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 13px; }
.fm-panel button:hover { background: var(--button-green); }
.fm-hint { font-size: 11px; color: var(--muted); text-align: center; margin-top: auto; }
.fm-canvas-wrap { flex: 1; min-height: 460px; background: var(--cream); }
.fm-canvas-wrap canvas { width: 100%; height: 100%; display: block; }

@media (max-width: 720px) {
  .fm-layout { flex-direction: column; }
  .fm-panel { width: 100%; border-right: 0; border-bottom: 1px solid var(--brown-light); flex-direction: row; flex-wrap: wrap; gap: 8px; }
  .fm-canvas-wrap { min-height: 320px; }
}
</style>
