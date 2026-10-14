<template>
  <div class="se-layout geo-theme">
    <aside class="se-panel">
      <div class="panel-header">
        <span class="station-tag">🌱 水土保持坡面径流观测场</span>
        <h3 class="panel-title">植被覆被与坡面水土流失对比</h3>
      </div>

      <!-- 降雨与坡度工况预设 -->
      <div class="se-presets">
        <span class="ctrl-subhead">典型水土保持试验工况</span>
        <div class="preset-grid">
          <button
            v-for="p in presets"
            :key="p.key"
            :class="['preset-chip', { active: currentPresetKey === p.key }]"
            @click="applyPreset(p)"
          >
            <span class="chip-name">{{ p.name }}</span>
            <span class="chip-sub">{{ p.sub }}</span>
          </button>
        </div>
      </div>

      <!-- 降雨强度与坡度滑块 -->
      <div class="ctrl-group">
        <div class="ctrl-label-row">
          <span>模拟降雨强度</span>
          <span class="val-badge">{{ rainIntensity }} 级 ({{ rainDescText }})</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          v-model.number="rainIntensity"
          @input="onParamInput"
          class="geo-slider"
        />
        <div class="angle-ticks">
          <span>小雨细润</span>
          <span>中到大雨</span>
          <span>特大暴雨倾盆</span>
        </div>
      </div>

      <div class="ctrl-group">
        <div class="ctrl-label-row">
          <span>坡面倾角 α</span>
          <span class="val-badge">{{ slopeAngle }}° ({{ slopeDescText }})</span>
        </div>
        <input
          type="range"
          min="5"
          max="45"
          step="1"
          v-model.number="slopeAngle"
          @input="onParamInput"
          class="geo-slider"
        />
        <div class="angle-ticks">
          <span>5° 缓坡</span>
          <span>25° 陡坡临界退耕线</span>
          <span>45° 极陡崖</span>
        </div>
      </div>

      <!-- 双小区水沙遥测对比看板 -->
      <div class="sediment-card">
        <div class="card-head">
          <span>📊 径流集流池实测水沙遥测</span>
          <span class="loss-ratio-badge">流失差比: {{ lossRatio }}x</span>
        </div>
        <div class="compare-table">
          <div class="comp-col bare-col">
            <div class="col-head">🟤 裸露坡面小区</div>
            <div class="col-row"><span>地表径流:</span><strong>{{ (rainIntensity * (slopeAngle / 20) * 1.5).toFixed(1) }} L</strong></div>
            <div class="col-row"><span>泥沙产出:</span><strong class="mud-val">{{ (rainIntensity * Math.pow(slopeAngle / 15, 1.8) * 2.4).toFixed(1) }} g</strong></div>
            <div class="col-row"><span>水质清澈:</span><span>浑浊黄泥浆流</span></div>
          </div>
          <div class="comp-col veg-col">
            <div class="col-head">🌿 植被覆被小区</div>
            <div class="col-row"><span>地表径流:</span><strong>{{ (rainIntensity * (slopeAngle / 20) * 0.35).toFixed(1) }} L</strong></div>
            <div class="col-row"><span>泥沙产出:</span><strong class="clean-val">{{ (rainIntensity * Math.pow(slopeAngle / 15, 1.2) * 0.15).toFixed(1) }} g</strong></div>
            <div class="col-row"><span>水质清澈:</span><span>微浊或清澈</span></div>
          </div>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="action-row">
        <button
          @click="togglePlay"
          :class="['action-btn', 'play-btn', { playing: autoRunning }]"
        >
          {{ autoRunning ? '⏸ 暂停降雨' : '▶ 人工降雨模拟' }}
        </button>
        <button
          @click="resetRunoff"
          class="action-btn"
        >
          ↺ 清空集流桶
        </button>
      </div>

      <button
        @click="toggleGuide"
        :class="['guide-trigger', { active: guideActive }]"
      >
        {{ guideActive ? '⏸ 停止讲解' : '💡 植被水保机理与坡度红线讲解' }}
      </button>
      <div v-if="guideActive" class="guide-box">{{ guideText }}</div>
      <p class="nav-hint">🖱 拖动旋转观测场 · 滚轮缩放 · 双击复位</p>
    </aside>

    <div class="se-canvas-wrap">
      <canvas ref="cvs"></canvas>
      <div class="view-overlay">
        <span class="overlay-tag">水土保持对比试验径流小区（双向并列）</span>
        <button class="lock-btn" @click="toggleLock" :title="locked ? '解锁自由漫游' : '锁定正斜侧视角'">
          {{ locked ? '🔒 斜俯视锁定' : '🔓 自由漫游' }}
        </button>
      </div>
      <div class="plot-tags">
        <span class="ptag bare-tag">左小区：裸露黄土（击溅侵蚀 · 细沟发育）</span>
        <span class="ptag veg-tag">右小区：草灌结合（冠层截留 · 根系固土）</span>
      </div>
    </div>
  </div>

  <ModelPedagogyPanel
    theme="geology"
    :observe="pedagogy.observe"
    :change="pedagogy.change"
    :mechanism="pedagogy.mechanism"
    :limitations="pedagogy.limitations"
    :real-data-lab="{ title: '黄土高原与南方红壤侵蚀卫星遥感对比', path: '/geo-labs/satellite', desc: '真实卫星影像看水土保持植被恢复' }"
    :textbook-link="{ grade: '高中', book: '必修第一册', chapter: '第六章', section: '第二节' }"
    practice-link="/practice"
    @reset="resetObservation"
  />
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import ModelPedagogyPanel from '../../components/ModelPedagogyPanel.vue'

export default {
  name: 'SoilErosion',
  components: {
    ModelPedagogyPanel,
  },
  data() {
    return {
      rainIntensity: 6,
      slopeAngle: 22,
      currentPresetKey: 'heavy',
      autoRunning: true,
      locked: true,
      guideActive: false,
      guideIndex: 0,
      guideText: '',
      presets: [
        { key: 'light', name: '连绵细雨·缓坡', sub: '降雨3级·坡度10°', rain: 3, slope: 10 },
        { key: 'heavy', name: '短历时强降雨', sub: '降雨6级·坡度22°', rain: 6, slope: 22 },
        { key: 'extreme', name: '极端暴雨·陡坡', sub: '降雨10级·坡度35°', rain: 10, slope: 35 },
      ],
      guideSteps: [
        '【雨滴击溅作用】降雨击打裸露土壤，破坏土壤团粒结构，溅起泥沙堵塞土壤大孔隙，迅速形成地表结皮！',
        '【径流冲刷冲蚀】雨水无法下渗转为坡面薄层片流，流速加快后集中形成细沟侵蚀，泥沙随水大量流失！',
        '【林冠截留减速】植被树冠与草本层拦截雨滴动能，雨水变为沿茎干顺流，消除击溅冲刷！',
        '【25°水土保持红线】我国水土保持法明确规定：25°以上坡地禁止开垦种植农作物，须实施退耕还林还草！',
      ],
      pedagogy: {
        observe: [
          '左侧裸露黄土在暴雨下被冲出明显的溯源下切细沟，集流桶内迅速积聚厚层黄褐色泥沙。',
          '右侧植被覆盖坡面水流清澈缓慢，集流桶内主要是透明浅水，泥沙极微。',
          '当坡度超过 25° 时，裸土冲刷侵蚀量呈指数级暴增。',
        ],
        change: [
          '调节“模拟降雨强度”（1~10 级），查看雨滴雨丝密度及径流生成量。',
          '调节“坡面倾角 α”（5°~45°），观察重力加速对细沟侵蚀深度的非线性加剧。',
        ],
        mechanism: [
          '通用土壤流失方程（USLE / RUSLE）：土壤侵蚀量取决于降雨侵蚀力（R）、土壤可蚀性（K）、坡长坡度因子（LS）、植被覆盖管理因子（C）和水保措施因子（P）。',
          '植被的 C 因子极低（仅为裸土的 1%~5%），根系力学加筋效应极显著提高土壤抗剪切强度。',
          '陡坡地带重力沿坡分量（$\sin\alpha$）随坡度剧增，径流携沙动能成倍放大。',
        ],
        limitations: [
          '试验小区采用人工微孔均质砂土，未模拟野外复杂土壤剖面中母岩裂隙水渗流。',
          '未模拟地表风化冻融交替破坏与重力崩塌滑坡等复合并发灾害。',
        ],
      },
    }
  },
  computed: {
    rainDescText() {
      if (this.rainIntensity >= 8) return '暴雨狂风'
      if (this.rainIntensity >= 4) return '中等透雨'
      return '连绵轻雨'
    },
    slopeDescText() {
      if (this.slopeAngle >= 25) return '极陡坡 (超退耕红线)'
      if (this.slopeAngle >= 15) return '中等陡坡 (易冲刷)'
      return '平缓坡面 (利保水)'
    },
    lossRatio() {
      const bare = this.rainIntensity * Math.pow(this.slopeAngle / 15, 1.8) * 2.4
      const veg = Math.max(0.1, this.rainIntensity * Math.pow(this.slopeAngle / 15, 1.2) * 0.15)
      return Math.round(bare / veg)
    },
  },
  mounted() {
    this.initScene()
    window.addEventListener('resize', this.onResize)
  },
  beforeUnmount() {
    this.disposeScene()
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    initScene() {
      const canvas = this.$refs.cvs
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const w = rect.width || 600
      const h = rect.height || 420

      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color(0x110d0a)

      this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)
      this.camera.position.set(0, 12, 22)

      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
      this.renderer.setSize(w, h)
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      this.renderer.shadowMap.enabled = true

      this.controls = new OrbitControls(this.camera, canvas)
      this.controls.enableDamping = true
      this.controls.dampingFactor = 0.06
      this.controls.target.set(0, 2.0, 0)
      if (this.locked) {
        this.controls.maxPolarAngle = Math.PI / 2.05
        this.controls.minDistance = 6
        this.controls.maxDistance = 45
      }

      this.buildRunoffPlots()
      this.animate()
    },

    buildRunoffPlots() {
      // 1. Lighting
      const light = new THREE.DirectionalLight(0xffedd5, 3.2)
      light.position.set(10, 25, 15)
      light.castShadow = true
      this.scene.add(light)
      this.scene.add(new THREE.AmbientLight(0x451a03, 1.3))

      this.plotsGroup = new THREE.Group()
      this.scene.add(this.plotsGroup)

      // Base catchment tank
      const tankGeo = new THREE.BoxGeometry(17, 0.6, 12)
      const tankMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.9 })
      const tank = new THREE.Mesh(tankGeo, tankMat)
      tank.position.set(0, -0.3, 0)
      this.scene.add(tank)

      // Plot A: Left Slope (Bare Soil)
      this.bareGroup = new THREE.Group()
      this.bareGroup.position.set(-4.5, 0, 0)
      this.plotsGroup.add(this.bareGroup)

      const slopeBoxGeo = new THREE.BoxGeometry(6.5, 1.2, 9)
      const bareMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.95 })
      this.bareMesh = new THREE.Mesh(slopeBoxGeo, bareMat)
      this.bareMesh.receiveShadow = true
      this.bareGroup.add(this.bareMesh)

      // Plot B: Right Slope (Vegetated)
      this.vegGroup = new THREE.Group()
      this.vegGroup.position.set(4.5, 0, 0)
      this.plotsGroup.add(this.vegGroup)

      const vegMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.85 })
      this.vegMesh = new THREE.Mesh(slopeBoxGeo, vegMat)
      this.vegMesh.receiveShadow = true
      this.vegGroup.add(this.vegMesh)

      // Add grass/shrubs meshes on veg plot
      for (let i = 0; i < 45; i++) {
        const grassGeo = new THREE.ConeGeometry(0.25, 0.7, 5)
        const grassMat = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.9 })
        const g = new THREE.Mesh(grassGeo, grassMat)
        g.position.set((Math.random() - 0.5) * 5.5, 0.8, (Math.random() - 0.5) * 7.5)
        this.vegGroup.add(g)
      }

      // 2. Raindrop particles system
      this.rainCount = 200
      const rainGeo = new THREE.BufferGeometry()
      this.rainPositions = new Float32Array(this.rainCount * 3)
      for (let i = 0; i < this.rainCount; i++) {
        this.rainPositions[i * 3] = (Math.random() - 0.5) * 16
        this.rainPositions[i * 3 + 1] = 4 + Math.random() * 8
        this.rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 10
      }
      rainGeo.setAttribute('position', new THREE.BufferAttribute(this.rainPositions, 3))
      const rainMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.15, transparent: true, opacity: 0.8 })
      this.rainSystem = new THREE.Points(rainGeo, rainMat)
      this.scene.add(this.rainSystem)

      this.updateSlopeAngle()
    },

    updateSlopeAngle() {
      if (!this.bareGroup || !this.vegGroup) return
      const rad = THREE.MathUtils.degToRad(this.slopeAngle)
      // Slopes down towards +Z (front)
      this.bareGroup.rotation.x = rad * 0.7
      this.vegGroup.rotation.x = rad * 0.7
    },

    animate() {
      this.animId = requestAnimationFrame(this.animate)

      if (this.autoRunning && this.rainSystem) {
        const pos = this.rainSystem.geometry.attributes.position
        const speed = (this.rainIntensity / 5) * 0.35

        for (let i = 0; i < this.rainCount; i++) {
          let y = pos.getY(i) - speed
          if (y < 0.5) {
            y = 8 + Math.random() * 4
            pos.setX(i, (Math.random() - 0.5) * 16)
            pos.setZ(i, (Math.random() - 0.5) * 10)
          }
          pos.setY(i, y)
        }
        pos.needsUpdate = true
      }

      if (this.controls) this.controls.update()
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera)
      }
    },

    onParamInput() {
      this.currentPresetKey = ''
      this.updateSlopeAngle()
    },

    applyPreset(p) {
      this.currentPresetKey = p.key
      this.rainIntensity = p.rain
      this.slopeAngle = p.slope
      this.updateSlopeAngle()
    },

    togglePlay() {
      this.autoRunning = !this.autoRunning
    },

    resetRunoff() {
      this.rainIntensity = 3
      this.slopeAngle = 10
      this.currentPresetKey = 'light'
      this.updateSlopeAngle()
    },

    toggleLock() {
      this.locked = !this.locked
      if (this.controls) {
        if (this.locked) {
          this.camera.position.set(0, 12, 22)
          this.controls.target.set(0, 2.0, 0)
        }
      }
    },

    toggleGuide() {
      this.guideActive = !this.guideActive
      if (this.guideActive) {
        this.guideIndex = 0
        this.guideText = this.guideSteps[0]
        clearInterval(this.guideTimer)
        this.guideTimer = setInterval(() => {
          if (!this.guideActive) return
          this.guideIndex = (this.guideIndex + 1) % this.guideSteps.length
          this.guideText = this.guideSteps[this.guideIndex]
        }, 5000)
      } else {
        clearInterval(this.guideTimer)
      }
    },

    resetObservation() {
      this.rainIntensity = 6
      this.slopeAngle = 22
      this.currentPresetKey = 'heavy'
      this.autoRunning = true
      this.updateSlopeAngle()
      this.camera.position.set(0, 12, 22)
      this.controls.target.set(0, 2.0, 0)
      this.controls.update()
    },

    onResize() {
      const canvas = this.$refs.cvs
      if (!canvas || !this.renderer || !this.camera) return
      const rect = canvas.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        this.camera.aspect = rect.width / rect.height
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(rect.width, rect.height)
      }
    },

    disposeScene() {
      if (this.animId) cancelAnimationFrame(this.animId)
      if (this.guideTimer) clearInterval(this.guideTimer)
      if (this.controls) this.controls.dispose()
      if (this.renderer) this.renderer.dispose()
      if (this.scene) {
        this.scene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose()
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose())
            else obj.material.dispose()
          }
        })
      }
    },
  },
}
</script>

<style scoped>
.geo-theme {
  display: flex;
  gap: 18px;
  background: #150f0c;
  border-radius: var(--radius-card, 16px);
  padding: 16px;
  border: 1px solid rgba(194, 65, 12, 0.35);
  color: #f1f5f9;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
}

.se-panel {
  width: 340px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.panel-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 10px;
}
.station-tag {
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #ea580c;
  font-weight: 700;
}
.panel-title {
  margin: 4px 0 0;
  font-size: 17px;
  font-weight: 700;
  color: #f8fafc;
}

.ctrl-subhead {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 6px;
  display: block;
}
.preset-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.preset-chip {
  padding: 8px 10px;
  background: rgba(67, 20, 7, 0.35);
  border: 1px solid rgba(194, 65, 12, 0.3);
  border-radius: 8px;
  color: #e2e8f0;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
}
.preset-chip:hover {
  background: rgba(194, 65, 12, 0.25);
  border-color: #f97316;
}
.preset-chip.active {
  background: rgba(194, 65, 12, 0.45);
  border-color: #fb923c;
  color: #fdba74;
}
.chip-name { font-size: 12px; font-weight: 700; }
.chip-sub { font-size: 10px; opacity: 0.7; }

.ctrl-group {
  background: rgba(41, 15, 6, 0.4);
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(194, 65, 12, 0.2);
}
.ctrl-label-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 6px;
  color: #cbd5e1;
}
.val-badge {
  color: #fb923c;
  font-weight: 700;
}
.geo-slider {
  width: 100%;
  accent-color: #c2410c;
}
.angle-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  color: #64748b;
  margin-top: 4px;
}

.sediment-card {
  background: rgba(41, 15, 6, 0.6);
  border: 1px solid rgba(194, 65, 12, 0.35);
  border-radius: 12px;
  padding: 12px;
}
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 8px;
}
.loss-ratio-badge {
  background: rgba(239, 68, 68, 0.25);
  color: #fca5a5;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 10px;
}

.compare-table {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.comp-col {
  padding: 6px 8px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11px;
}
.bare-col {
  background: rgba(180, 83, 9, 0.15);
  border: 1px solid rgba(180, 83, 9, 0.3);
}
.veg-col {
  background: rgba(77, 124, 15, 0.15);
  border: 1px solid rgba(77, 124, 15, 0.3);
}
.col-head {
  font-weight: 700;
  margin-bottom: 2px;
}
.col-row {
  display: flex;
  justify-content: space-between;
}
.col-row span { color: #a8a29e; }
.mud-val { color: #f87171; font-weight: 700; }
.clean-val { color: #4ade80; font-weight: 700; }

.action-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.action-btn {
  padding: 8px;
  background: rgba(67, 20, 7, 0.5);
  border: 1px solid rgba(194, 65, 12, 0.3);
  border-radius: 8px;
  color: #f8fafc;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.action-btn:hover {
  background: rgba(194, 65, 12, 0.3);
  border-color: #fb923c;
}
.play-btn.playing {
  background: #c2410c;
  color: #fff;
  font-weight: 700;
}

.guide-trigger {
  padding: 8px;
  border-radius: 8px;
  border: 1px dashed rgba(194, 65, 12, 0.6);
  background: rgba(194, 65, 12, 0.1);
  color: #fb923c;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.guide-trigger.active {
  background: #c2410c;
  color: #fff;
}
.guide-box {
  background: rgba(194, 65, 12, 0.15);
  border: 1px solid rgba(194, 65, 12, 0.35);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  color: #fed7aa;
  line-height: 1.5;
}

.nav-hint {
  font-size: 11px;
  color: #64748b;
  text-align: center;
  margin: 0;
}

.se-canvas-wrap {
  flex: 1;
  min-height: 480px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.se-canvas-wrap canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.view-overlay {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: none;
}
.overlay-tag {
  background: rgba(28, 18, 12, 0.85);
  border: 1px solid rgba(194, 65, 12, 0.4);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  color: #f8fafc;
}
.lock-btn {
  pointer-events: auto;
  background: rgba(28, 18, 12, 0.85);
  border: 1px solid rgba(194, 65, 12, 0.5);
  color: #f8fafc;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}

.plot-tags {
  position: absolute;
  bottom: 14px;
  left: 14px;
  right: 14px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
}
.ptag {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}
.bare-tag { background: rgba(180, 83, 9, 0.35); border: 1px solid #b45309; color: #fdba74; }
.veg-tag { background: rgba(77, 124, 15, 0.35); border: 1px solid #4d7c0f; color: #bef264; }

@media (max-width: 768px) {
  .geo-theme {
    flex-direction: column;
  }
  .se-panel {
    width: 100%;
  }
  .se-canvas-wrap {
    min-height: 320px;
  }
  .plot-tags {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
