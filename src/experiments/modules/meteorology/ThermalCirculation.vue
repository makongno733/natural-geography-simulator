<template>
  <div class="tc-layout">
    <aside class="tc-panel">
      <div class="tc-presets">
        <button
          v-for="p in presets"
          :key="p.name"
          :class="['preset-btn', { active: activePreset === p.name }]"
          @click="applyPreset(p)"
        >{{ p.label }}</button>
      </div>
      <label>热源温差 <span>{{ tempDiff }}</span></label>
      <input type="range" min="1" max="10" v-model.number="tempDiff" @input="onParam" />
      <label>粒子数量 <span>{{ particleCount }}</span></label>
      <input type="range" min="50" max="300" step="10" v-model.number="particleCount" @input="onParam" />
      <button @click="togglePause">{{ paused ? '▶ 播放' : '⏸ 暂停' }}</button>
      <button @click="reset">↺ 重置</button>
      <p class="tc-hint">🖱 拖动旋转 · 滚轮缩放</p>
    </aside>
    <div class="tc-canvas-wrap">
      <canvas ref="cvs"></canvas>
    </div>
  </div>
</template>

<script>
import { ExperimentEngine } from '../../engine/ExperimentEngine.js'
import * as THREE from 'three'

export default {
  name: 'ThermalCirculation',
  data() {
    return {
      tempDiff: 5, particleCount: 200, paused: false,
      activePreset: '自由调节',
      presets: [
        { name: '海陆风', label: '海陆风', tempDiff: 7, particleCount: 200 },
        { name: '山谷风', label: '山谷风', tempDiff: 3, particleCount: 100 },
        { name: '自由调节', label: '自由调节', tempDiff: null, particleCount: null },
      ],
    }
  },
  mounted() {
    this._e = new ThermalCirculationEngine()
    this._e.tempDiff = this.tempDiff
    this.$nextTick(() => this._e.init(this.$refs.cvs))
    window.addEventListener('resize', this._onResize)
  },
  beforeUnmount() {
    this._e?.dispose()
    window.removeEventListener('resize', this._onResize)
  },
  methods: {
    _onResize() { this._e?.resize() },
    togglePause() { this.paused = !this.paused; this._e.paused = this.paused },
    onParam() { this.activePreset = null; this._e.setParams({ tempDiff: this.tempDiff, particleCount: this.particleCount }) },
    applyPreset(p) {
      this.activePreset = p.name
      if (p.tempDiff != null) this.tempDiff = p.tempDiff
      if (p.particleCount != null) this.particleCount = p.particleCount
      this.onParam()
      // restore activePreset since onParam clears it
      this.activePreset = p.name
    },
    reset() {
      this._e.dispose()
      this.$nextTick(() => { this._e = new ThermalCirculationEngine(); this._e.tempDiff = this.tempDiff; this._e.init(this.$refs.cvs) })
    },
  },
}

class ThermalCirculationEngine extends ExperimentEngine {
  setupScene() {
    this.tempDiff = 5
    this.paused = false

    const boxGeo = new THREE.BoxGeometry(8, 4, 4)
    const boxEdges = new THREE.EdgesGeometry(boxGeo)
    const boxLine = new THREE.LineSegments(boxEdges, new THREE.LineBasicMaterial({ color: 0x8f7652, transparent: true, opacity: 0.55 }))
    this.scene.add(boxLine)

    const hotGeo = new THREE.BoxGeometry(1, 0.15, 3)
    this.hotMat = new THREE.MeshStandardMaterial({ color: 0xe53935, emissive: 0xe53935, emissiveIntensity: 0.7 })
    this.hotPlate = new THREE.Mesh(hotGeo, this.hotMat)
    this.hotPlate.position.set(-3.6, -2, 0)
    this.scene.add(this.hotPlate)

    const coldGeo = new THREE.BoxGeometry(1, 0.15, 3)
    this.coldMat = new THREE.MeshStandardMaterial({ color: 0x1e88e5, emissive: 0x1e88e5, emissiveIntensity: 0.5 })
    this.coldPlate = new THREE.Mesh(coldGeo, this.coldMat)
    this.coldPlate.position.set(3.6, -2, 0)
    this.scene.add(this.coldPlate)

    this._sprites = []
    this._sprites.push(this._makeLabel('热源 🔥', new THREE.Vector3(-3.6, -0.8, 2), '#c0392b'))
    this._sprites.push(this._makeLabel('冷源 ❄️', new THREE.Vector3(3.6, -0.8, 2), '#2471a3'))
    this._sprites.push(this._makeLabel('高空', new THREE.Vector3(0, 1.8, 2), '#666666'))
    this._sprites.push(this._makeLabel('地面', new THREE.Vector3(0, -2.2, 2), '#666666'))

    this._particles = []
    this._spawn(150)

    this.camera.position.set(0, 2, 10)
    this.controls.target.set(0, 0, 0)
  }

  _makeLabel(text, position, color = '#333333', fontSize = 32) {
    const canvas = document.createElement('canvas')
    canvas.width = 512; canvas.height = 128
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = color
    ctx.font = `bold ${fontSize}px "Noto Serif SC", "Kaiti SC", serif`
    ctx.textAlign = 'center'
    ctx.fillText(text, 256, 64)
    const tex = new THREE.CanvasTexture(canvas)
    tex.minFilter = THREE.LinearFilter
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })
    const sprite = new THREE.Sprite(mat)
    sprite.position.copy(position)
    sprite.scale.set(3, 0.75, 1)
    this.scene.add(sprite)
    return sprite
  }

  _spawn(count) {
    this._particles.forEach(p => {
      this.scene.remove(p)
      if (p.material) p.material.dispose()
      if (p.geometry) p.geometry.dispose()
    })
    this._particles = []
    const geo = new THREE.SphereGeometry(0.07, 8, 8)
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: 0x888888 })
      const dot = new THREE.Mesh(geo, mat)
      dot.position.set((Math.random() - 0.5) * 7, (Math.random() - 0.5) * 3.5, (Math.random() - 0.5) * 3)
      dot.userData = { phase: Math.random() * Math.PI * 2, speed: 0.004 + Math.random() * 0.008, y0: (Math.random() - 0.5) * 1.5 }
      this.scene.add(dot)
      this._particles.push(dot)
    }
  }

  update(dt) {
    if (this.paused) return
    const diff = this.tempDiff / 5
    this.hotMat.emissiveIntensity = 0.2 + diff * 0.8
    this.coldMat.emissiveIntensity = 0.05 + (1 - diff / 2) * 0.3
    const speed = diff * 2.5
    for (const dot of this._particles) {
      dot.userData.phase += dt * dot.userData.speed * speed
      const p = dot.userData.phase % (Math.PI * 2)
      const px = 3.8 * Math.cos(p)
      const py = 1.6 * Math.sin(p * 2) * 0.7 + dot.userData.y0 * 0.2
      const pz = 1.6 * Math.sin(p)
      dot.position.set(px, py, pz)
      const h = (py + 1.8) / 3.6
      dot.material.color.setHSL(0.08 + (1 - h) * 0.55, 0.8, 0.25 + h * 0.5)
    }
  }

  setParams({ tempDiff, particleCount }) {
    if (tempDiff !== undefined) this.tempDiff = tempDiff
    if (particleCount !== undefined) this._spawn(particleCount)
  }

  dispose() {
    if (this._sprites) {
      this._sprites.forEach(s => { s.material.map.dispose(); s.material.dispose() })
    }
    super.dispose()
  }
}
</script>

<style scoped>
.tc-layout { display: flex; gap: 0; border-radius: var(--radius-box); overflow: hidden; border: 1px solid var(--brown-light); }
.tc-panel { width: 200px; flex-shrink: 0; background: var(--card-bg); padding: 16px; border-right: 1px solid var(--brown-light); display: flex; flex-direction: column; gap: 10px; }
.tc-panel label { font-size: 13px; color: var(--ink); display: flex; justify-content: space-between; }
.tc-panel input[type="range"] { width: 100%; accent-color: var(--red); }
.tc-panel button { padding: 6px 12px; border: 1px solid var(--brown); border-radius: var(--radius-sm); background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 13px; }
.tc-panel button:hover { background: var(--button-green); }
.preset-btn {
  padding: 3px 8px; border: 1px solid var(--brown); border-radius: 4px;
  background: var(--cream); color: var(--ink); cursor: pointer;
  font-family: inherit; font-size: 11px;
}
.preset-btn.active { background: var(--red); color: #fff; border-color: var(--red); }
.tc-presets { display: flex; gap: 4px; flex-wrap: wrap; }
.tc-hint { font-size: 11px; color: var(--muted); text-align: center; margin-top: auto; }
.tc-canvas-wrap { flex: 1; min-height: 460px; background: var(--cream); }
.tc-canvas-wrap canvas { width: 100%; height: 100%; display: block; }

@media (max-width: 720px) {
  .tc-layout { flex-direction: column; }
  .tc-panel { width: 100%; border-right: 0; border-bottom: 1px solid var(--brown-light); flex-direction: row; flex-wrap: wrap; gap: 8px; }
  .tc-panel label { flex: 1; min-width: 120px; }
  .tc-canvas-wrap { min-height: 320px; }
}
</style>
