<template>
  <div class="sg-layout">
    <aside class="sg-panel">
      <div class="preset-row">
        <button class="preset-btn" :class="{ active: showLabels }" @click="showLabels = true; onParam()">显示全部标注</button>
        <button class="preset-btn" :class="{ active: !showLabels }" @click="showLabels = false; onParam()">隐藏标注</button>
      </div>
      <label class="sg-toggle">
        <input type="checkbox" v-model="showLabels" @change="onParam" /> 显示标注
      </label>
      <label class="sg-toggle">
        <input type="checkbox" v-model="showUnconformity" @change="onParam" /> 显示不整合面
      </label>
      <button @click="resetView">↺ 重置视角</button>
      <p class="sg-hint">🖱 拖动旋转 · 滚轮缩放</p>
    </aside>
    <div class="sg-canvas-wrap">
      <canvas ref="cvs"></canvas>
      <div class="sg-labels" v-show="showLabels">
        <span class="sg-label" style="top:20%;left:55%">叠置原理 ↑</span>
        <span class="sg-label" style="top:55%;left:15%">水平原理 →</span>
        <span class="sg-label" style="top:38%;left:50%">穿插关系</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ExperimentEngine } from '../../engine/ExperimentEngine.js'
import * as THREE from 'three'

export default {
  name: 'Stratigraphy',
  data() { return { showLabels: true, showUnconformity: true } },
  mounted() {
    this._e = new StratigraphyEngine()
    this.$nextTick(() => this._e.init(this.$refs.cvs))
    window.addEventListener('resize', this._onResize)
  },
  beforeUnmount() { this._e?.dispose(); window.removeEventListener('resize', this._onResize) },
  methods: {
    _onResize() { this._e?.resize() },
    onParam() { this._e.setParams({ showLabels: this.showLabels, showUnconformity: this.showUnconformity }) },
    resetView() { this._e.resetCamera() },
  },
}

class StratigraphyEngine extends ExperimentEngine {
  setupScene() {
    const tiltAngle = 0.35

    this.strataGroup = new THREE.Group()

    // Lower tilted layers (2 layers)
    this.lowerLayers = []
    const lowerColors = [0x7a6652, 0x8b7355]
    lowerColors.forEach((color, i) => {
      const y = -1.2 + i * 0.65
      const geo = new THREE.BoxGeometry(5, 0.6, 3)
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
      const layer = new THREE.Mesh(geo, mat)
      layer.position.set(0, y, 0)
      layer.rotation.z = tiltAngle
      layer.castShadow = true; layer.receiveShadow = true
      this.strataGroup.add(layer)
      this.lowerLayers.push(layer)
    })

    // Unconformity erosion surface
    const unconformityGeo = new THREE.PlaneGeometry(5.5, 3.5)
    unconformityGeo.rotateX(-Math.PI / 2)
    const unconformityMat = new THREE.MeshStandardMaterial({
      color: 0xb8956e, roughness: 0.9,
      transparent: true, opacity: 0.5, side: THREE.DoubleSide
    })
    this.unconformity = new THREE.Mesh(unconformityGeo, unconformityMat)
    this.unconformity.position.y = -0.55
    this.strataGroup.add(this.unconformity)

    // Erosion surface edge line
    const edgeGeo = new THREE.RingGeometry(2.4, 2.5, 64)
    edgeGeo.rotateX(-Math.PI / 2)
    const edgeMat = new THREE.MeshBasicMaterial({ color: 0x8b4513, side: THREE.DoubleSide, transparent: true, opacity: 0.6 })
    this.erosionEdge = new THREE.Mesh(edgeGeo, edgeMat)
    this.erosionEdge.position.y = -0.54
    this.strataGroup.add(this.erosionEdge)

    // Upper horizontal layers (3 layers)
    this.upperLayers = []
    const upperColors = [0xc8a96e, 0xd4b896, 0xe0cfa5]
    upperColors.forEach((color, i) => {
      const y = -0.25 + i * 0.55
      const geo = new THREE.BoxGeometry(5, 0.5, 3)
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
      const layer = new THREE.Mesh(geo, mat)
      layer.position.set(0, y, 0)
      layer.castShadow = true; layer.receiveShadow = true
      this.strataGroup.add(layer)
      this.upperLayers.push(layer)
    })

    // Igneous intrusion (dike/sill)
    const intrusionGeo = new THREE.CylinderGeometry(0.2, 0.25, 2.2, 16)
    const intrusionMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.3, metalness: 0.2 })
    this.intrusion = new THREE.Mesh(intrusionGeo, intrusionMat)
    this.intrusion.position.set(1.5, -0.9, 0)
    this.intrusion.castShadow = true
    this.strataGroup.add(this.intrusion)

    // Small horizontal sill branching from intrusion
    const sillGeo = new THREE.BoxGeometry(1.2, 0.12, 1.5)
    const sillMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.3, metalness: 0.2 })
    this.sill = new THREE.Mesh(sillGeo, sillMat)
    this.sill.position.set(2.0, -1.0, 0)
    this.strataGroup.add(this.sill)

    this.scene.add(this.strataGroup)

    // Sprite labels (added to scene, not strataGroup, so they don't rotate)
    this._sprites = []
    const strataLabels = [
      { text: '地层 1 (最新)', y: 0.82, color: '#e0cfa5' },
      { text: '地层 2', y: 0.27, color: '#d4b896' },
      { text: '地层 3', y: -0.22, color: '#c8a96e' },
      { text: '地层 4', y: -0.7, color: '#8b7355' },
      { text: '地层 5 (最老)', y: -1.1, color: '#7a6652' },
    ]
    strataLabels.forEach(({ text, y, color }) => {
      this._sprites.push(this._makeLabel(text, new THREE.Vector3(3.0, y, 0), color, 26, 2.2))
    })
    this._sprites.push(this._makeLabel('不整合面', new THREE.Vector3(-2.8, -0.6, 0), '#c0392b', 24, 2.2))
    this._sprites.push(this._makeLabel('侵入体 (穿插关系)', new THREE.Vector3(1.5, 0.4, 0), '#e67e22', 22, 2))
    this._sprites.push(this._makeLabel('岩床', new THREE.Vector3(3.0, -1.0, 0), '#e67e22', 24, 1.8))
    this._sprites.forEach(s => this.scene.add(s))

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(10, 10)
    groundGeo.rotateX(-Math.PI / 2)
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xd5c39c, roughness: 0.9 })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.position.y = -2.8
    ground.receiveShadow = true
    this.scene.add(ground)

    this.camera.position.set(6, 3, 7)
    this.controls.target.set(0, -0.3, 0)
  }

  update(dt) {
    if (this.strataGroup) this.strataGroup.rotation.y += dt * 0.15
  }

  resetCamera() {
    this.camera.position.set(6, 3, 7)
    this.controls.target.set(0, -0.3, 0)
    this.controls.update()
  }

  _makeLabel(text, position, color = '#333333', fontSize = 28, scale = 2.5) {
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
    sprite.scale.set(scale, scale * 0.25, 1)
    return sprite
  }

  setParams({ showLabels, showUnconformity }) {
    if (showLabels !== undefined && this._sprites) {
      this._sprites.forEach(s => { s.visible = showLabels })
    }
    if (showUnconformity !== undefined) {
      if (this.unconformity) this.unconformity.visible = showUnconformity
      if (this.erosionEdge) this.erosionEdge.visible = showUnconformity
    }
  }
}
</script>

<style scoped>
.sg-layout { display: flex; gap: 0; border-radius: var(--radius-box); overflow: hidden; border: 1px solid var(--brown-light); }
.sg-panel { width: 200px; flex-shrink: 0; background: var(--card-bg); padding: 16px; border-right: 1px solid var(--brown-light); display: flex; flex-direction: column; gap: 10px; }
.sg-toggle { font-size: 13px; color: var(--ink); display: flex; align-items: center; gap: 6px; cursor: pointer; }
.sg-toggle input[type="checkbox"] { accent-color: var(--red); }
.sg-panel button { padding: 6px 12px; border: 1px solid var(--brown); border-radius: var(--radius-sm); background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 13px; }
.sg-panel button:hover { background: var(--button-green); }
.sg-hint { font-size: 11px; color: var(--muted); text-align: center; margin-top: auto; }
.sg-canvas-wrap { flex: 1; min-height: 460px; background: var(--cream); position: relative; }
.sg-canvas-wrap canvas { width: 100%; height: 100%; display: block; }
.sg-labels { position: absolute; inset: 0; pointer-events: none; }
.sg-label {
  position: absolute;
  font-size: 12px;
  font-weight: 700;
  color: var(--red);
  background: rgba(255, 253, 242, 0.85);
  padding: 2px 8px;
  border-radius: 3px;
  border: 1px solid var(--red);
  white-space: nowrap;
}
.preset-row { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px; }
.preset-btn { flex: 1; min-width: 60px; padding: 4px 6px; border: 1px solid var(--brown); border-radius: 4px; background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 11px; white-space: nowrap; }
.preset-btn.active { background: var(--red); color: #fff; border-color: var(--red); }

@media (max-width: 720px) {
  .sg-layout { flex-direction: column; }
  .sg-panel { width: 100%; border-right: 0; border-bottom: 1px solid var(--brown-light); flex-direction: row; flex-wrap: wrap; gap: 8px; }
  .sg-canvas-wrap { min-height: 320px; }
}
</style>
