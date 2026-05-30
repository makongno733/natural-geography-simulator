<template>
  <div class="gw-layout">
    <aside class="gw-panel">
      <div class="preset-row">
        <button
          v-for="p in presets" :key="p.label"
          class="preset-btn" :class="{ active: currentPreset === p.label }"
          @click="applyPreset(p)"
        >{{ p.label }}</button>
      </div>
      <label>抽水速率 <span>{{ pumpRate }}</span></label>
      <input type="range" min="0" max="10" v-model.number="pumpRate" @input="onParam" />
      <label>降雨补给 <span>{{ recharge }}</span></label>
      <input type="range" min="0" max="10" v-model.number="recharge" @input="onParam" />
      <button @click="reset">↺ 重置</button>
      <button @click="toggleGuide" :class="['guide-btn', { active: guideActive }]">
        {{ guideActive ? '⏸ 停止演示' : '▶ 引导演示' }}
      </button>
      <div v-if="guideActive" class="guide-text-box">{{ guideText }}</div>
      <p class="gw-hint">🖱 拖动旋转 · 滚轮缩放</p>
    </aside>
    <div class="gw-canvas-wrap">
      <canvas ref="cvs"></canvas>
      <button class="lock-btn" @click="toggleLock" :title="locked ? '解锁旋转' : '锁定旋转'">
        {{ locked ? '🔒' : '🔓' }}
      </button>
    </div>
  </div>
  <div class="exp-desc">
    <h4>实验说明</h4>
    <p>本实验展示地下水赋存与运动的剖面模型：自上而下为表土层、砂质含水层、黏土隔水层和基岩。蓝色半透明面为地下水位。调节抽水速率观察降水漏斗的形成——过度抽水导致水位下降，降雨补给可使水位恢复。这是理解水资源管理和地面沉降的基础。</p>
  </div>
</template>

<script>
import { ExperimentEngine } from '../../engine/ExperimentEngine.js'
import * as THREE from 'three'

export default {
  name: 'Groundwater',
  data() { return {
    pumpRate: 3, recharge: 4, currentPreset: '正常', locked: true,
    guideActive: false,
    guideText: '',
    _guideTexts: [
      '含水层是地下水的储集空间，通常为砂层或砾石层',
      '隔水层阻止地下水向下渗透，如黏土层',
      '过度抽水会形成降水漏斗，导致地下水位下降',
      '降雨补给使地下水位回升，维持水量平衡',
    ],
    presets: [
      { label: '正常', pumpRate: 3, recharge: 4 },
      { label: '过度抽水', pumpRate: 9, recharge: 2 },
      { label: '丰水期', pumpRate: 1, recharge: 9 },
    ],
  } },
  mounted() {
    this._e = new GroundwaterEngine()
    this._e._onGuideChange = (text) => { this.guideText = text }
    this.$nextTick(() => { this._e.init(this.$refs.cvs); if (this.locked) this._e.controls.enabled = false })
    window.addEventListener('resize', this._onResize)
  },
  beforeUnmount() { this._e?.dispose(); window.removeEventListener('resize', this._onResize) },
  methods: {
    _onResize() { this._e?.resize() },
    toggleLock() { this.locked = !this.locked; if (this._e?.controls) this._e.controls.enabled = !this.locked },
    onParam() { this.currentPreset = null; this._e.setParams({ pumpRate: this.pumpRate, recharge: this.recharge }) },
    applyPreset(p) {
      this.currentPreset = p.label
      this.pumpRate = p.pumpRate
      this.recharge = p.recharge
      this._e.setParams({ pumpRate: p.pumpRate, recharge: p.recharge })
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
    reset() { this._e.dispose(); this.$nextTick(() => { this._e = new GroundwaterEngine(); this._e._onGuideChange = (text) => { this.guideText = text }; this._e.init(this.$refs.cvs); if (this.locked) this._e.controls.enabled = false }) },
  },
}

class GroundwaterEngine extends ExperimentEngine {
  setupScene() {
    const layers = [
      { y: 1.2, h: 0.6, color: 0xe8c97a },
      { y: 0.5, h: 0.7, color: 0xc4a46c },
      { y: -0.3, h: 0.8, color: 0x8b7355 },
      { y: -1.2, h: 0.9, color: 0x5c4a3a },
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
    const wtMat = new THREE.MeshStandardMaterial({ color: 0x42a5f5, transparent: true, opacity: 0.6, side: THREE.DoubleSide, emissive: 0x2266aa, emissiveIntensity: 0.3 })
    this.waterTable = new THREE.Mesh(wtGeo, wtMat)
    this.waterTable.position.y = 0.4
    this.scene.add(this.waterTable)

    const wellGeo = new THREE.CylinderGeometry(0.12, 0.12, 3, 16)
    const wellMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.3, emissive: 0x333333, emissiveIntensity: 0.3 })
    this.well = new THREE.Mesh(wellGeo, wellMat)
    this.well.position.set(0, 0, 0)
    this.scene.add(this.well)

    const coneGeo = new THREE.SphereGeometry(0.3, 32, 32)
    this.coneMat = new THREE.MeshBasicMaterial({ color: 0x42a5f5, transparent: true, opacity: 0.25 })
    this.cone = new THREE.Mesh(coneGeo, this.coneMat)
    this.cone.position.set(0, 0.4, 0)
    this.scene.add(this.cone)

    this.pumpRate = 3
    this.recharge = 4

    // Static layer labels
    this._makeLabel('表土层', new THREE.Vector3(1.5, 1.8, 2), '#5c4a3a', 22, 1.8)
    this._makeLabel('含水层 (砂层)', new THREE.Vector3(1.5, 0.8, 2), '#5c4a3a', 22, 1.8)
    this._makeLabel('隔水层 (黏土)', new THREE.Vector3(1.5, -0.1, 2), '#5c4a3a', 20, 1.8)
    this._makeLabel('基岩', new THREE.Vector3(1.5, -1.8, 2), '#5c4a3a', 22, 1.8)
    this._makeLabel('抽水井', new THREE.Vector3(0.3, 1.2, 1), '#1565c0', 20, 1.5)
    // Dynamic labels
    this._wtLabel = this._makeLabel('水位面', new THREE.Vector3(1.5, 0.4, 0), '#1565c0', 22, 1.8)
    this._coneLabel = this._makeLabel('降水漏斗', new THREE.Vector3(0, 0.4, -1), '#1565c0', 22, 1.8)

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

    // Update dynamic labels
    if (this._wtLabel) this._wtLabel.position.set(1.5, this.waterTable.position.y, 0)
    if (this._coneLabel) this._coneLabel.position.copy(this.cone.position).add(new THREE.Vector3(0, 0.4, -1))
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
.preset-row { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px; }
.preset-btn { flex: 1; min-width: 60px; padding: 4px 6px; border: 1px solid var(--brown); border-radius: 4px; background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 11px; white-space: nowrap; }
.preset-btn.active { background: var(--red); color: #fff; border-color: var(--red); }
.gw-hint { font-size: 11px; color: var(--muted); text-align: center; margin-top: auto; }
.guide-btn { width: 100%; padding: 8px; margin-top: 8px; border: 2px solid var(--red); border-radius: var(--radius-sm); background: var(--cream); color: var(--red); cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 600; transition: all var(--transition); }
.guide-btn.active { background: var(--red); color: #fff; animation: pulse 2s infinite; }
.guide-text-box { font-size: 12px; color: var(--red); background: rgba(158,36,38,0.06); padding: 8px; border-radius: var(--radius-sm); border: 1px solid rgba(158,36,38,0.2); text-align: center; line-height: 1.5; }
.gw-canvas-wrap { flex: 1; min-height: 460px; background: var(--cream); position: relative; }
.lock-btn { position: absolute; top: 12px; right: 12px; z-index: 10; width: 36px; height: 36px; border-radius: 8px; border: 1px solid var(--brown); background: rgba(255,255,255,0.85); font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.lock-btn:hover { background: rgba(255,255,255,1); }
.gw-canvas-wrap canvas { width: 100%; height: 100%; display: block; }

.exp-desc { margin-top: 16px; padding: 14px 18px; background: var(--card-bg); border-radius: var(--radius-card); border: 1px solid var(--brown-light); }
.exp-desc h4 { font-size: 14px; color: var(--red); margin: 0 0 6px; }
.exp-desc p { font-size: 14px; line-height: 1.7; color: var(--ink); margin: 0; }

@media (max-width: 720px) {
  .gw-layout { flex-direction: column; }
  .gw-panel {
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
  .gw-panel label { font-size: 12px; flex: 1 1 auto; min-width: 80px; }
  .gw-panel input[type="range"] { flex: 2 1 auto; min-width: 100px; }
  .gw-panel button { font-size: 12px; padding: 5px 8px; }
  .gw-canvas-wrap { min-height: 280px; }
  .guide-text-box { width: 100%; font-size: 11px; }
  .gw-hint { font-size: 10px; }
  .preset-row { width: 100%; }
  .preset-btn { font-size: 10px; padding: 4px 6px; }
  .exp-desc { padding: 10px 14px; margin-top: 12px; }
  .exp-desc h4 { font-size: 13px; }
  .exp-desc p { font-size: 13px; line-height: 1.6; }
}
</style>
