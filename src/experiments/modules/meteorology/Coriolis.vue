<template>
  <div class="cor-layout">
    <aside class="cor-panel">
      <label>旋转速度 <span>{{ rotationSpeed }}</span></label>
      <input type="range" min="0" max="10" v-model.number="rotationSpeed" @input="onParam" />
      <label>半球</label>
      <div class="cor-toggle">
        <button :class="{ active: hemisphere === 'north' }" @click="setHemi('north')">北半球</button>
        <button :class="{ active: hemisphere === 'south' }" @click="setHemi('south')">南半球</button>
      </div>
      <label>粒子数量 <span>{{ particleCount }}</span></label>
      <input type="range" min="30" max="150" v-model.number="particleCount" @input="onParam" />
      <button @click="reset">↺ 重置</button>
      <p class="cor-hint">🖱 拖动旋转 · 滚轮缩放</p>
    </aside>
    <div class="cor-canvas-wrap">
      <canvas ref="cvs"></canvas>
    </div>
  </div>
</template>

<script>
import { ExperimentEngine } from '../../engine/ExperimentEngine.js'
import * as THREE from 'three'

export default {
  name: 'Coriolis',
  data() { return { rotationSpeed: 5, hemisphere: 'north', particleCount: 80 } },
  mounted() {
    this._e = new CoriolisEngine()
    this.$nextTick(() => this._e.init(this.$refs.cvs))
    window.addEventListener('resize', () => this._e?.resize())
  },
  beforeUnmount() { this._e?.dispose(); window.removeEventListener('resize', () => this._e?.resize()) },
  methods: {
    onParam() { this._e.setParams({ rotationSpeed: this.rotationSpeed, hemisphere: this.hemisphere, particleCount: this.particleCount }) },
    setHemi(h) { this.hemisphere = h; this.onParam() },
    reset() { this._e.dispose(); this.$nextTick(() => { this._e = new CoriolisEngine(); this._e.init(this.$refs.cvs) }) },
  },
}

class CoriolisEngine extends ExperimentEngine {
  setupScene() {
    const diskGeo = new THREE.CylinderGeometry(4, 4, 0.15, 48)
    const diskMat = new THREE.MeshStandardMaterial({ color: 0xf5f0e0, roughness: 0.7 })
    this.disk = new THREE.Mesh(diskGeo, diskMat)
    this.scene.add(this.disk)

    const rimGeo = new THREE.TorusGeometry(4, 0.08, 16, 64)
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xb8a57a })
    const rim = new THREE.Mesh(rimGeo, rimMat)
    rim.rotation.x = Math.PI / 2
    rim.position.y = 0.08
    this.scene.add(rim)

    const iceGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.2, 24)
    const iceMat = new THREE.MeshStandardMaterial({ color: 0x42a5f5, emissive: 0x42a5f5, emissiveIntensity: 0.3, transparent: true, opacity: 0.85 })
    this.ice = new THREE.Mesh(iceGeo, iceMat)
    this.ice.position.y = 0.6
    this.scene.add(this.ice)

    this.hemisphere = 'north'
    this.rotationSpeed = 5
    this._particles = []
    this._spawn(80)

    this.camera.position.set(0, 8, 8)
    this.controls.target.set(0, 0.3, 0)
  }

  _spawn(count) {
    this._particles.forEach(p => this.scene.remove(p))
    this._particles = []
    const geo = new THREE.SphereGeometry(0.08, 6, 6)
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: 0xe53935 })
      const dot = new THREE.Mesh(geo, mat)
      const angle = Math.random() * Math.PI * 2
      const radius = 2 + Math.random() * 1.8
      dot.position.set(Math.cos(angle) * radius, 0.15, Math.sin(angle) * radius)
      dot.userData = { angle, radius, phase: Math.random() * Math.PI * 2 }
      this.scene.add(dot)
      this._particles.push(dot)
    }
  }

  update(dt) {
    const speed = this.rotationSpeed / 5
    this.disk.rotation.y += dt * speed * 1.2
    this.ice.rotation.y += dt * speed * 1.2
    const coriolisSign = this.hemisphere === 'north' ? 1 : -1
    for (const dot of this._particles) {
      dot.userData.radius -= dt * 0.15 * speed
      if (dot.userData.radius < 0.6) dot.userData.radius = 3.5
      dot.userData.angle += dt * coriolisSign * speed * 1.8 / (dot.userData.radius + 0.3)
      dot.position.x = Math.cos(dot.userData.angle) * dot.userData.radius
      dot.position.z = Math.sin(dot.userData.angle) * dot.userData.radius
      const t = (dot.userData.radius - 0.5) / 3
      dot.material.color.setHSL(0.0 + t * 0.15, 1, 0.3 + t * 0.4)
    }
  }

  setParams({ rotationSpeed, hemisphere, particleCount }) {
    if (rotationSpeed !== undefined) this.rotationSpeed = rotationSpeed
    if (hemisphere !== undefined) this.hemisphere = hemisphere
    if (particleCount !== undefined) this._spawn(particleCount)
  }
}
</script>

<style scoped>
.cor-layout { display: flex; gap: 0; border-radius: var(--radius-box); overflow: hidden; border: 1px solid var(--brown-light); }
.cor-panel { width: 200px; flex-shrink: 0; background: var(--card-bg); padding: 16px; border-right: 1px solid var(--brown-light); display: flex; flex-direction: column; gap: 10px; }
.cor-panel label { font-size: 13px; color: var(--ink); display: flex; justify-content: space-between; }
.cor-panel input[type="range"] { width: 100%; accent-color: var(--red); }
.cor-toggle { display: flex; gap: 4px; }
.cor-toggle button { flex: 1; padding: 4px 0; border: 1px solid var(--brown); border-radius: var(--radius-sm); background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 12px; }
.cor-toggle button.active { background: var(--red); color: #fff; border-color: var(--red); }
.cor-panel button { padding: 6px 12px; border: 1px solid var(--brown); border-radius: var(--radius-sm); background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 13px; }
.cor-panel button:hover { background: var(--button-green); }
.cor-hint { font-size: 11px; color: var(--muted); text-align: center; margin-top: auto; }
.cor-canvas-wrap { flex: 1; min-height: 460px; background: var(--cream); }
.cor-canvas-wrap canvas { width: 100%; height: 100%; display: block; }

@media (max-width: 720px) {
  .cor-layout { flex-direction: column; }
  .cor-panel { width: 100%; border-right: 0; border-bottom: 1px solid var(--brown-light); flex-direction: row; flex-wrap: wrap; gap: 8px; }
  .cor-canvas-wrap { min-height: 320px; }
}
</style>
