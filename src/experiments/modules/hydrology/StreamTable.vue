<template>
  <div class="st-layout">
    <aside class="st-panel">
      <label>坡度 <span>{{ slope }}°</span></label>
      <input type="range" min="2" max="20" v-model.number="slope" @input="onParam" />
      <label>水流量 <span>{{ flowRate }}</span></label>
      <input type="range" min="1" max="10" v-model.number="flowRate" @input="onParam" />
      <button @click="reset">↺ 重置地形</button>
      <p class="st-hint">🖱 拖动旋转 · 滚轮缩放</p>
    </aside>
    <div class="st-canvas-wrap">
      <canvas ref="cvs"></canvas>
    </div>
  </div>
</template>

<script>
import { ExperimentEngine } from '../../engine/ExperimentEngine.js'
import * as THREE from 'three'

export default {
  name: 'StreamTable',
  data() { return { slope: 8, flowRate: 5 } },
  mounted() {
    this._e = new StreamTableEngine()
    this.$nextTick(() => this._e.init(this.$refs.cvs))
    window.addEventListener('resize', this._onResize)
  },
  beforeUnmount() { this._e?.dispose(); window.removeEventListener('resize', this._onResize) },
  methods: {
    _onResize() { this._e?.resize() },
    onParam() { this._e.setParams({ slope: this.slope, flowRate: this.flowRate }) },
    reset() {
      this._e.dispose()
      this.$nextTick(() => { this._e = new StreamTableEngine(); this._e.init(this.$refs.cvs); this._e.setParams({ slope: this.slope, flowRate: this.flowRate }) })
    },
  },
}

class StreamTableEngine extends ExperimentEngine {
  setupScene() {
    const size = 8
    const segments = 64
    const geo = new THREE.PlaneGeometry(size, size, segments, segments)
    geo.rotateX(-Math.PI / 2)
    const pos = geo.attributes.position
    for (let i = 0; i <= segments; i++) {
      for (let j = 0; j <= segments; j++) {
        const x = (i / segments - 0.5) * size
        const z = (j / segments - 0.5) * size
        const h = -0.3 + z * 0.06 + (Math.random() - 0.5) * 0.25 + Math.sin(x * 1.2) * 0.15
        pos.setZ(i * (segments + 1) + j, h)
      }
    }
    geo.computeVertexNormals()
    const mat = new THREE.MeshStandardMaterial({ color: 0xc8a96e, roughness: 0.85 })
    this.terrain = new THREE.Mesh(geo, mat)
    this.terrain.receiveShadow = true
    this.scene.add(this.terrain)

    const baseGeo = new THREE.PlaneGeometry(size + 1, 2)
    baseGeo.rotateX(-Math.PI / 2)
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x5c8a8a, roughness: 0.3, transparent: true, opacity: 0.6 })
    const base = new THREE.Mesh(baseGeo, baseMat)
    base.position.set(0, -0.5, size / 2 + 0.5)
    this.scene.add(base)

    const grid = new THREE.GridHelper(size, 16, 0xb8a57a, 0xd5c39c)
    grid.position.y = -0.1
    this.scene.add(grid)

    this.slope = 8
    this.flowRate = 5
    this._drops = []
    this._spawnDrops(60)

    this.camera.position.set(6, 7, 5)
    this.controls.target.set(0, -0.2, 0)
  }

  _spawnDrops(count) {
    this._drops.forEach(d => {
      this.scene.remove(d)
      if (d.material) d.material.dispose()
      if (d.geometry) d.geometry.dispose()
    })
    this._drops = []
    const geo = new THREE.SphereGeometry(0.06, 4, 4)
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: 0x42a5f5 })
      const drop = new THREE.Mesh(geo, mat)
      drop.position.set((Math.random() - 0.5) * 6, 0.5, -3.5 + Math.random() * 1)
      drop.userData = { speed: 0.5 + Math.random() * 1.5 }
      this.scene.add(drop)
      this._drops.push(drop)
    }
  }

  update(dt) {
    const s = this.slope / 10
    const f = this.flowRate / 5
    for (const drop of this._drops) {
      drop.position.z += dt * drop.userData.speed * f * s * 2
      drop.position.x += dt * Math.sin(drop.position.z * 3 + drop.userData.speed * 2) * 0.2 * f
      if (drop.position.z > 4.5) {
        drop.position.z = -3.5
        drop.position.x = (Math.random() - 0.5) * 6
      }
      drop.position.x = Math.max(-3.8, Math.min(3.8, drop.position.x))
      drop.position.y = -0.15 + drop.position.z * 0.03 + Math.sin(drop.position.x * 1.2) * 0.05
    }
  }

  setParams({ slope, flowRate }) {
    if (slope !== undefined) this.slope = slope
    if (flowRate !== undefined) this.flowRate = flowRate
  }
}
</script>

<style scoped>
.st-layout { display: flex; gap: 0; border-radius: var(--radius-box); overflow: hidden; border: 1px solid var(--brown-light); }
.st-panel { width: 200px; flex-shrink: 0; background: var(--card-bg); padding: 16px; border-right: 1px solid var(--brown-light); display: flex; flex-direction: column; gap: 10px; }
.st-panel label { font-size: 13px; color: var(--ink); display: flex; justify-content: space-between; }
.st-panel input[type="range"] { width: 100%; accent-color: var(--red); }
.st-panel button { padding: 6px 12px; border: 1px solid var(--brown); border-radius: var(--radius-sm); background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 13px; }
.st-panel button:hover { background: var(--button-green); }
.st-hint { font-size: 11px; color: var(--muted); text-align: center; margin-top: auto; }
.st-canvas-wrap { flex: 1; min-height: 460px; background: var(--cream); }
.st-canvas-wrap canvas { width: 100%; height: 100%; display: block; }

@media (max-width: 720px) {
  .st-layout { flex-direction: column; }
  .st-panel { width: 100%; border-right: 0; border-bottom: 1px solid var(--brown-light); flex-direction: row; flex-wrap: wrap; gap: 8px; }
  .st-canvas-wrap { min-height: 320px; }
}
</style>
