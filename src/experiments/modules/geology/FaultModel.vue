<template>
  <div class="fm-layout">
    <aside class="fm-panel">
      <div class="preset-row">
        <button class="preset-btn" :class="{ active: displacement === 2.5 }" @click="preset('compress')">挤压造山</button>
        <button class="preset-btn" :class="{ active: displacement === -2.5 }" @click="preset('extend')">拉张断陷</button>
        <button class="preset-btn" :class="{ active: displacement === 0 }" @click="preset('reset')">初始状态</button>
      </div>
      <label>压缩/拉伸</label>
      <div class="fm-buttons">
        <button @click="compress" :disabled="displacement >= 3">◀◀ 压缩</button>
        <button @click="extend">拉伸 ▶▶</button>
      </div>
      <label>位移 <span>{{ displacement.toFixed(1) }}</span></label>
      <input type="range" min="-3" max="3" step="0.1" v-model.number="displacement" @input="onParam" />
      <button @click="reset">↺ 重置</button>
      <button @click="toggleGuide" :class="['guide-btn', { active: guideActive }]">
        {{ guideActive ? '⏸ 停止演示' : '▶ 引导演示' }}
      </button>
      <div v-if="guideActive" class="guide-text-box">{{ guideText }}</div>
      <p class="fm-hint">🖱 拖动旋转 · 滚轮缩放</p>
    </aside>
    <div class="fm-canvas-wrap">
      <canvas ref="cvs"></canvas>
      <button class="lock-btn" @click="toggleLock" :title="locked ? '解锁旋转' : '锁定旋转'">
        {{ locked ? '🔒' : '🔓' }}
      </button>
    </div>
  </div>
  <div class="exp-desc">
    <h4>实验说明</h4>
    <p>本实验模拟地壳水平挤压和拉张作用下的构造变形：四层岩层（砂岩、页岩、石灰岩、基岩）在两壁之间受挤压形成褶皱和逆断层，受拉张形成正断层和地堑。位移越大变形越显著，接近活塞的岩层变形最强。这是理解造山带和裂谷盆地形成机制的经典模型。</p>
  </div>
</template>

<script>
import { ExperimentEngine } from '../../engine/ExperimentEngine.js'
import * as THREE from 'three'

export default {
  name: 'FaultModel',
  data() { return {
    displacement: 0, locked: true,
    guideActive: false,
    guideText: '',
    _guideTexts: [
      '挤压应力使岩层弯曲变形，形成褶皱和逆断层',
      '拉张应力使岩层断裂分离，形成正断层和地堑',
      '观察挤压时岩层增厚、褶皱发育的过程',
      '观察拉张时断层形成、岩块下陷的过程',
    ],
  } },
  mounted() {
    this._e = new FaultModelEngine()
    this._e._onGuideChange = (text) => { this.guideText = text }
    this.$nextTick(() => { this._e.init(this.$refs.cvs); if (this.locked) this._e.controls.enabled = false })
    window.addEventListener('resize', this._onResize)
  },
  beforeUnmount() { this._e?.dispose(); window.removeEventListener('resize', this._onResize) },
  methods: {
    _onResize() { this._e?.resize() },
    toggleLock() { this.locked = !this.locked; if (this._e?.controls) this._e.controls.enabled = !this.locked },
    compress() { this.displacement = Math.min(3, this.displacement + 0.3); this.onParam() },
    extend() { this.displacement = Math.max(-3, this.displacement - 0.3); this.onParam() },
    preset(type) {
      if (type === 'compress') this.displacement = 2.5
      else if (type === 'extend') this.displacement = -2.5
      else if (type === 'reset') this.displacement = 0
      this.onParam()
    },
    onParam() { this._e.setParams({ displacement: this.displacement }) },
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
    reset() { this.displacement = 0; this._e.dispose(); this.$nextTick(() => { this._e = new FaultModelEngine(); this._e._onGuideChange = (text) => { this.guideText = text }; this._e.init(this.$refs.cvs); if (this.locked) this._e.controls.enabled = false }) },
  },
}

class FaultModelEngine extends ExperimentEngine {
  setupScene() {
    const layerColors = [0xe8c97a, 0xc4a46c, 0x8b7355, 0x5c4a3a]
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
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.3, emissive: 0x333333, emissiveIntensity: 0.3 })
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

    // Sprite labels
    this._sprites = []
    const layerNames = ['砂岩层', '页岩层', '石灰岩层', '基岩层']
    this._sprites.push(this._makeLabel('固定端', new THREE.Vector3(-3, 0, 2.2), '#666666', 28, 2))
    this._sprites.push(this._makeLabel('挤压/拉伸 →', new THREE.Vector3(3, 0, 2.2), '#c0392b', 28, 2.2))
    layerColors.forEach((color, i) => {
      const y = 1.5 - i * 0.8
      const hex = '#' + new THREE.Color(color).getHexString()
      this._sprites.push(this._makeLabel(layerNames[i], new THREE.Vector3(-2.8, y, 0), hex))
    })
    this._faultLineSprite = this._makeLabel('断层线', new THREE.Vector3(0, 0.5, 0), '#c0392b')
    this._faultLineSprite.visible = false
    this._sprites.push(this._faultLineSprite)
    this._sprites.forEach(s => this.scene.add(s))
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
    // Dynamic fault line label
    if (this._faultLineSprite) {
      if (Math.abs(this._currentDisp) > 0.6) {
        this._faultLineSprite.visible = true
        this._faultLineSprite.position.set(1.2 + this._currentDisp * 0.15, 0.5, 0)
      } else {
        this._faultLineSprite.visible = false
      }
    }
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
.guide-btn { width: 100%; padding: 8px; margin-top: 8px; border: 2px solid var(--red); border-radius: var(--radius-sm); background: var(--cream); color: var(--red); cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 600; transition: all var(--transition); }
.guide-btn.active { background: var(--red); color: #fff; animation: pulse 2s infinite; }
.guide-text-box { font-size: 12px; color: var(--red); background: rgba(158,36,38,0.06); padding: 8px; border-radius: var(--radius-sm); border: 1px solid rgba(158,36,38,0.2); text-align: center; line-height: 1.5; }
.fm-canvas-wrap { flex: 1; min-height: 460px; background: var(--cream); position: relative; }
.lock-btn { position: absolute; top: 12px; right: 12px; z-index: 10; width: 36px; height: 36px; border-radius: 8px; border: 1px solid var(--brown); background: rgba(255,255,255,0.85); font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.lock-btn:hover { background: rgba(255,255,255,1); }
.fm-canvas-wrap canvas { width: 100%; height: 100%; display: block; }
.preset-row { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px; }
.preset-btn { flex: 1; min-width: 60px; padding: 4px 6px; border: 1px solid var(--brown); border-radius: 4px; background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 11px; white-space: nowrap; }
.preset-btn.active { background: var(--red); color: #fff; border-color: var(--red); }

.exp-desc { margin-top: 16px; padding: 14px 18px; background: var(--card-bg); border-radius: var(--radius-card); border: 1px solid var(--brown-light); }
.exp-desc h4 { font-size: 14px; color: var(--red); margin: 0 0 6px; }
.exp-desc p { font-size: 14px; line-height: 1.7; color: var(--ink); margin: 0; }

@media (max-width: 720px) {
  .fm-layout { flex-direction: column; }
  .fm-panel {
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
  .fm-panel label { font-size: 12px; flex: 1 1 auto; min-width: 80px; }
  .fm-panel input[type="range"] { flex: 2 1 auto; min-width: 100px; }
  .fm-panel button { font-size: 12px; padding: 5px 8px; }
  .fm-canvas-wrap { min-height: 280px; }
  .guide-text-box { width: 100%; font-size: 11px; }
  .fm-hint { font-size: 10px; }
  .preset-row { width: 100%; }
  .preset-btn { font-size: 10px; padding: 4px 6px; }
  .exp-desc { padding: 10px 14px; margin-top: 12px; }
  .exp-desc h4 { font-size: 13px; }
  .exp-desc p { font-size: 13px; line-height: 1.6; }
}
</style>
