<template>
  <div class="st-layout">
    <aside class="st-panel">
      <div class="preset-row">
        <button
          v-for="p in presets" :key="p.label"
          class="preset-btn" :class="{ active: currentPreset === p.label }"
          @click="applyPreset(p)"
        >{{ p.label }}</button>
      </div>
      <label>坡度 <span>{{ slope }}°</span></label>
      <input type="range" min="2" max="20" v-model.number="slope" @input="onParam" />
      <label>水流量 <span>{{ flowRate }}</span></label>
      <input type="range" min="1" max="10" v-model.number="flowRate" @input="onParam" />
      <button @click="reset">↺ 重置地形</button>
      <button @click="toggleGuide" :class="['guide-btn', { active: guideActive }]">
        {{ guideActive ? '⏸ 停止演示' : '▶ 引导演示' }}
      </button>
      <div v-if="guideActive" class="guide-text-box">{{ guideText }}</div>
      <p class="st-hint">🖱 拖动旋转 · 滚轮缩放</p>
    </aside>
    <div class="st-canvas-wrap">
      <canvas ref="cvs"></canvas>
    </div>
  </div>
  <div class="exp-desc">
    <h4>实验说明</h4>
    <p>本实验模拟流水地貌的发育过程：蓝色水滴从上游沿坡面流向下游，侵蚀地表、搬运泥沙、在下游沉积。调节坡度增加流速和侵蚀力，增大流量模拟洪水事件。观察曲流发育和冲积扇形成——这是自然界河流塑造地表的基本过程。</p>
  </div>
</template>

<script>
import { ExperimentEngine } from '../../engine/ExperimentEngine.js'
import * as THREE from 'three'

export default {
  name: 'StreamTable',
  data() { return {
    slope: 8, flowRate: 5, currentPreset: null,
    guideActive: false,
    guideText: '',
    _guideTexts: [
      '流水对地表进行侵蚀、搬运和沉积三种作用',
      '坡度增大时流速加快，侵蚀能力增强',
      '观察上游 V 形谷和下游沉积扇的形成',
      '曲流发育：凹岸侵蚀，凸岸沉积',
    ],
    presets: [
      { label: '缓坡小河', slope: 4, flowRate: 3 },
      { label: '陡坡急流', slope: 15, flowRate: 8 },
      { label: '洪水模式', slope: 10, flowRate: 10 },
    ],
  } },
  mounted() {
    this._e = new StreamTableEngine()
    this._e._onGuideChange = (text) => { this.guideText = text }
    this.$nextTick(() => this._e.init(this.$refs.cvs))
    window.addEventListener('resize', this._onResize)
  },
  beforeUnmount() { this._e?.dispose(); window.removeEventListener('resize', this._onResize) },
  methods: {
    _onResize() { this._e?.resize() },
    onParam() { this.currentPreset = null; this._e.setParams({ slope: this.slope, flowRate: this.flowRate }) },
    applyPreset(p) {
      this.currentPreset = p.label
      this.slope = p.slope
      this.flowRate = p.flowRate
      this._e.setParams({ slope: p.slope, flowRate: p.flowRate })
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
    reset() {
      this._e.dispose()
      this.$nextTick(() => { this._e = new StreamTableEngine(); this._e._onGuideChange = (text) => { this.guideText = text }; this._e.init(this.$refs.cvs); this._e.setParams({ slope: this.slope, flowRate: this.flowRate }) })
    },
  },
}

class StreamTableEngine extends ExperimentEngine {
  setupScene() {
    const size = 8
    const segments = 96
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

    this._makeLabel('上游 (水源)', new THREE.Vector3(0, 1, -3.5), '#2471a3', 28, 2.5)
    this._makeLabel('下游', new THREE.Vector3(0, 0.2, 4), '#1e8449', 28, 2.5)
    this._makeLabel('侵蚀区', new THREE.Vector3(-1.5, 0.8, -1), '#c0392b', 24, 2)
    this._makeLabel('沉积区', new THREE.Vector3(1.5, 0.3, 2.5), '#b8860b', 24, 2)

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
    const geo = new THREE.SphereGeometry(0.06, 6, 6)
    for (let i = 0; i < count; i++) {
      const hue = 0.55 + (i / count) * 0.1
      const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(hue, 0.9, 0.6) })
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
.preset-row { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px; }
.preset-btn { flex: 1; min-width: 60px; padding: 4px 6px; border: 1px solid var(--brown); border-radius: 4px; background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 11px; white-space: nowrap; }
.preset-btn.active { background: var(--red); color: #fff; border-color: var(--red); }
.st-hint { font-size: 11px; color: var(--muted); text-align: center; margin-top: auto; }
.guide-btn { width: 100%; padding: 8px; margin-top: 8px; border: 2px solid var(--red); border-radius: var(--radius-sm); background: var(--cream); color: var(--red); cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 600; transition: all var(--transition); }
.guide-btn.active { background: var(--red); color: #fff; animation: pulse 2s infinite; }
.guide-text-box { font-size: 12px; color: var(--red); background: rgba(158,36,38,0.06); padding: 8px; border-radius: var(--radius-sm); border: 1px solid rgba(158,36,38,0.2); text-align: center; line-height: 1.5; }
.st-canvas-wrap { flex: 1; min-height: 460px; background: var(--cream); }
.st-canvas-wrap canvas { width: 100%; height: 100%; display: block; }

.exp-desc { margin-top: 16px; padding: 14px 18px; background: var(--card-bg); border-radius: var(--radius-card); border: 1px solid var(--brown-light); }
.exp-desc h4 { font-size: 14px; color: var(--red); margin: 0 0 6px; }
.exp-desc p { font-size: 14px; line-height: 1.7; color: var(--ink); margin: 0; }

@media (max-width: 720px) {
  .st-layout { flex-direction: column; }
  .st-panel { width: 100%; border-right: 0; border-bottom: 1px solid var(--brown-light); flex-direction: row; flex-wrap: wrap; gap: 8px; }
  .st-canvas-wrap { min-height: 320px; }
}
</style>
