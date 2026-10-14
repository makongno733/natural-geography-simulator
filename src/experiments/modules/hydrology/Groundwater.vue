<template>
  <div class="gw-layout hydro-theme">
    <aside class="gw-panel">
      <div class="panel-header">
        <span class="station-tag">💧 水文地质剖面勘探舱</span>
        <h3 class="panel-title">含水层水文模型与抽水漏斗</h3>
      </div>

      <!-- 水文工况预设 -->
      <div class="gw-presets">
        <span class="ctrl-subhead">地下水开采与补给工况</span>
        <div class="preset-grid">
          <button
            v-for="p in presets"
            :key="p.label"
            :class="['preset-chip', { active: currentPreset === p.label }]"
            @click="applyPreset(p)"
          >
            <span class="chip-name">{{ p.label }}</span>
            <span class="chip-sub">{{ p.sub }}</span>
          </button>
        </div>
      </div>

      <!-- 抽水速率与补给强度滑块 -->
      <div class="ctrl-group">
        <div class="ctrl-label-row">
          <span>深井抽水速率</span>
          <span class="val-badge">{{ pumpRate }} 级 ({{ pumpDescText }})</span>
        </div>
        <input
          type="range"
          min="0"
          max="10"
          step="1"
          v-model.number="pumpRate"
          @input="onParamInput"
          class="hydro-slider"
        />
      </div>

      <div class="ctrl-group">
        <div class="ctrl-label-row">
          <span>地表降水补给速率</span>
          <span class="val-badge">{{ recharge }} 级 ({{ rechargeDescText }})</span>
        </div>
        <input
          type="range"
          min="0"
          max="10"
          step="1"
          v-model.number="recharge"
          @input="onParamInput"
          class="hydro-slider"
        />
      </div>

      <!-- 含水层类型切换 -->
      <div class="ctrl-group">
        <div class="ctrl-label-row">
          <span>观测井类型</span>
          <span class="val-badge">{{ wellType === 'unconfined' ? '潜水井 (无压)' : '承压井 (承压水头)' }}</span>
        </div>
        <div class="dual-toggle">
          <button
            :class="['toggle-btn', { active: wellType === 'unconfined' }]"
            @click="setWellType('unconfined')"
          >
            潜水井 (表层含水层)
          </button>
          <button
            :class="['toggle-btn', { active: wellType === 'confined' }]"
            @click="setWellType('confined')"
          >
            承压井 (隔水层夹持)
          </button>
        </div>
      </div>

      <!-- 水位与地质灾害遥测 -->
      <div class="flume-card">
        <div class="card-head">
          <span>⚠️ 水位与次生地质风险</span>
          <span :class="['risk-badge', riskLevelClass]">{{ riskText }}</span>
        </div>
        <div class="flume-metrics">
          <div class="f-row">
            <span class="f-label">漏斗深度：</span>
            <strong>约 {{ coneDepth.toFixed(1) }} 米</strong>
          </div>
          <div class="f-row">
            <span class="f-label">水力平衡：</span>
            <span>{{ waterBalanceText }}</span>
          </div>
          <div class="f-row">
            <span class="f-label">潜在危害：</span>
            <span>{{ hazardText }}</span>
          </div>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="action-row">
        <button
          @click="togglePlay"
          :class="['action-btn', 'play-btn', { playing: autoRunning }]"
        >
          {{ autoRunning ? '⏸ 暂停流动' : '▶ 渗流模拟' }}
        </button>
        <button
          @click="resetWaterTable"
          class="action-btn"
        >
          ↺ 恢复自然水位
        </button>
      </div>

      <button
        @click="toggleGuide"
        :class="['guide-trigger', { active: guideActive }]"
      >
        {{ guideActive ? '⏸ 停止讲解' : '💡 潜水、承压水与过量开采讲解' }}
      </button>
      <div v-if="guideActive" class="guide-box">{{ guideText }}</div>
      <p class="nav-hint">🖱 拖动旋转剖面 · 滚轮缩放 · 双击复位</p>
    </aside>

    <div class="gw-canvas-wrap">
      <canvas ref="cvs"></canvas>
      <div class="view-overlay">
        <span class="overlay-tag">水文地质地层三维剖面</span>
        <button class="lock-btn" @click="toggleLock" :title="locked ? '解锁自由漫游' : '锁定正侧面观察'">
          {{ locked ? '🔒 侧视锁定' : '🔓 自由漫游' }}
        </button>
      </div>
      <div class="layer-legend">
        <span class="leg-pill clay">黏土隔水层 (不透水)</span>
        <span class="leg-pill sand">中细砂含水层 (透水赋水)</span>
        <span class="leg-pill table">蓝光地下水浸润面</span>
      </div>
    </div>
  </div>

  <ModelPedagogyPanel
    theme="hydrology"
    :observe="pedagogy.observe"
    :change="pedagogy.change"
    :mechanism="pedagogy.mechanism"
    :limitations="pedagogy.limitations"
    :real-data-lab="{ title: 'NASA 卫星重力反演全球地下水储量变动 (GRACE)', path: '/geo-labs/satellite', desc: '真实卫星数据监测地下水亏缺' }"
    :textbook-link="{ grade: '高中', book: '选择性必修1', chapter: '第四章', section: '第一节' }"
    practice-link="/practice"
    @reset="resetObservation"
  />
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import ModelPedagogyPanel from '../../components/ModelPedagogyPanel.vue'

export default {
  name: 'Groundwater',
  components: {
    ModelPedagogyPanel,
  },
  data() {
    return {
      pumpRate: 4,
      recharge: 3,
      wellType: 'unconfined',
      currentPreset: '采补轻微失衡',
      autoRunning: true,
      locked: true,
      guideActive: false,
      guideIndex: 0,
      guideText: '',
      presets: [
        { label: '自然水文平衡', sub: '采补持平·稳定浸润面', pump: 2, rech: 4 },
        { label: '采补轻微失衡', sub: '浅部漏斗·小幅下落', pump: 5, rech: 3 },
        { label: '严重超采枯水', sub: '漏斗扩展·地面沉降', pump: 9, rech: 1 },
        { label: '暴雨强渗补给', sub: '水位回升·自流喷涌', pump: 1, rech: 9 },
      ],
      guideSteps: [
        '【潜水与承压水】埋藏在地表以下第一个稳定隔水层之上的为潜水；夹在两个隔水层之间具承压水头的为承压水！',
        '【地下水降落漏斗】水井抽水时，井壁附近水位降幅最大，形成以井孔为中心的倒圆锥状漏斗！',
        '【采补平衡】当抽水量小于降水渗入补给量时，水位恢复；长期超采（排大于补）使漏斗面积不可逆扩展！',
        '【生态地质灾害】在沿海地区地下水超采引发海水倒灌、土壤盐渍化；在软土厚层区引发严重的地面沉降！',
      ],
      pedagogy: {
        observe: [
          '抽水井周围地下水浸润面呈现以井为中心的下凹漏斗曲面。',
          '承压水含水层受上下隔水层限制，水位不受地表轻微降雨直接响应，须从远端露头补给区补给。',
          '超采加剧时抽水漏斗深度加深、坡度变陡，波及半径不断向外扩张。',
        ],
        change: [
          '调节抽水速率（0~10级）与降水入渗补给（0~10级），探究采补差额。',
          '切换“潜水井”与“承压井”工况，体会承压水头高出隔水层顶板的自流特性。',
        ],
        mechanism: [
          '地下水在多孔介质砂层中遵循达西定律（$Q = K \cdot A \cdot i$），流速与水力坡度成正比。',
          '抽水在井周形成径向汇聚水力坡度，漏斗越近井孔流速越大，流线收敛导致水头急剧损耗。',
          '过度抽水使孔隙水压力降低，原本由水支撑的有效应力转移至砂黏骨架，导致土层压密压缩与地面沉降。',
        ],
        limitations: [
          '假定含水层为各向同性均质砂土，略去了裂隙岩溶溶洞等非均质导水通道。',
          '简化了非稳定流抽水随时间的泰斯（Theis）公式渐进衰减，按准稳态漏斗曲面呈现。',
          '未模拟含水层深浅部水质硬度与盐度物理化学传输。',
        ],
      },
    }
  },
  computed: {
    coneDepth() {
      const netExtract = Math.max(0, this.pumpRate * 1.2 - this.recharge * 0.7)
      return netExtract * 2.2
    },
    pumpDescText() {
      if (this.pumpRate >= 8) return '强力超采抽水'
      if (this.pumpRate >= 4) return '常规工业生活取水'
      return '微弱抽水'
    },
    rechargeDescText() {
      if (this.recharge >= 7) return '丰沛暴雨快速入渗'
      if (this.recharge >= 3) return '正常气候入渗补给'
      return '干旱少雨补给微薄'
    },
    riskLevelClass() {
      if (this.coneDepth > 12) return 'risk-high'
      if (this.coneDepth > 6) return 'risk-medium'
      return 'risk-low'
    },
    riskText() {
      if (this.coneDepth > 12) return '极高危 · 沉降与海水倒灌'
      if (this.coneDepth > 6) return '中度警示 · 漏斗扩展中'
      return '安全状态 · 水量良性循环'
    },
    waterBalanceText() {
      const diff = this.recharge - this.pumpRate
      if (diff > 1) return '补给充裕 · 水位上升'
      if (diff < -1) return '亏缺严重 · 储量衰减'
      return '动态平衡 · 水头稳定'
    },
    hazardText() {
      if (this.coneDepth > 12) return '地基开裂 · 沿海地下咸化 · 泉眼干涸'
      if (this.coneDepth > 6) return '浅水井断流 · 植被根系缺水'
      return '生态系统水热稳定'
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
      this.scene.background = new THREE.Color(0x05161b)

      this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)
      this.camera.position.set(0, 10, 24)

      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
      this.renderer.setSize(w, h)
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      this.renderer.shadowMap.enabled = true

      this.controls = new OrbitControls(this.camera, canvas)
      this.controls.enableDamping = true
      this.controls.dampingFactor = 0.06
      this.controls.target.set(0, 2.5, 0)
      if (this.locked) {
        this.controls.maxPolarAngle = Math.PI / 2.05
        this.controls.minDistance = 6
        this.controls.maxDistance = 45
      }

      this.buildAquiferBox()
      this.animate()
    },

    buildAquiferBox() {
      // 1. Lighting
      const light = new THREE.DirectionalLight(0xfff8e7, 2.8)
      light.position.set(10, 20, 15)
      this.scene.add(light)
      this.scene.add(new THREE.AmbientLight(0x134e4a, 1.2))

      // 2. Geological layers (width 16, height 6, depth 6)
      // Layer 1 (Bottom): Impermeable Bedrock (0 to 1.5)
      const bedrockGeo = new THREE.BoxGeometry(16, 1.5, 6)
      const bedrockMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 })
      const bedrock = new THREE.Mesh(bedrockGeo, bedrockMat)
      bedrock.position.set(0, 0.75, 0)
      this.scene.add(bedrock)

      // Layer 2: Confined Aquifer Sand (1.5 to 3.5)
      const sandGeo = new THREE.BoxGeometry(16, 2.0, 6)
      const sandMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7, transparent: true, opacity: 0.75 })
      const sand = new THREE.Mesh(sandGeo, sandMat)
      sand.position.set(0, 2.5, 0)
      this.scene.add(sand)

      // Layer 3: Confining Clay Aquitard (3.5 to 4.5)
      const clayGeo = new THREE.BoxGeometry(16, 1.0, 6)
      const clayMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 })
      const clay = new THREE.Mesh(clayGeo, clayMat)
      clay.position.set(0, 4.0, 0)
      this.scene.add(clay)

      // Layer 4: Unconfined Aquifer Topsoil (4.5 to 6.5)
      const topGeo = new THREE.BoxGeometry(16, 2.0, 6)
      const topMat = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.9, transparent: true, opacity: 0.8 })
      const topsoil = new THREE.Mesh(topGeo, topMat)
      topsoil.position.set(0, 5.5, 0)
      this.scene.add(topsoil)

      // 3. Central Pumping Well Tube
      const wellGeo = new THREE.CylinderGeometry(0.2, 0.2, 7.0, 16)
      const wellMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 })
      const well = new THREE.Mesh(wellGeo, wellMat)
      well.position.set(0, 4.0, 0)
      this.scene.add(well)

      // Well pump cap
      const pumpCapGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.5, 16)
      const pumpCap = new THREE.Mesh(pumpCapGeo, new THREE.MeshBasicMaterial({ color: 0xef4444 }))
      pumpCap.position.set(0, 7.6, 0)
      this.scene.add(pumpCap)

      // 4. Groundwater Table Surface Mesh (Curving cone of depression)
      this.waterMeshGroup = new THREE.Group()
      this.scene.add(this.waterMeshGroup)

      this.rebuildWaterTable()
    },

    rebuildWaterTable() {
      while (this.waterMeshGroup.children.length > 0) {
        const c = this.waterMeshGroup.children[0]
        if (c.geometry) c.geometry.dispose()
        this.waterMeshGroup.remove(c)
      }

      // Height of table depends on wellType
      const baseY = this.wellType === 'unconfined' ? 5.8 : 3.2
      const coneDrop = (this.coneDepth / 22) * 1.8

      const gridX = 48
      const gridZ = 24
      const geo = new THREE.PlaneGeometry(16, 6, gridX - 1, gridZ - 1)
      geo.rotateX(-Math.PI / 2)

      const pos = geo.attributes.position
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i)
        const z = pos.getZ(i)
        const r = Math.sqrt(x * x + z * z)

        // Cone of depression formula: drop decays exponentially with radius r
        const drop = coneDrop * Math.exp(-r * 0.45)
        pos.setY(i, baseY - drop)
      }
      pos.needsUpdate = true
      geo.computeVertexNormals()

      const mat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.1,
        metalness: 0.3,
        transparent: true,
        opacity: 0.72,
        side: THREE.DoubleSide,
      })
      const mesh = new THREE.Mesh(geo, mat)
      this.waterMeshGroup.add(mesh)
    },

    animate() {
      this.animId = requestAnimationFrame(this.animate)
      if (this.controls) this.controls.update()
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera)
      }
    },

    onParamInput() {
      this.currentPreset = null
      this.rebuildWaterTable()
    },

    setWellType(type) {
      this.wellType = type
      this.rebuildWaterTable()
    },

    applyPreset(p) {
      this.currentPreset = p.label
      this.pumpRate = p.pump
      this.recharge = p.rech
      this.rebuildWaterTable()
    },

    togglePlay() {
      this.autoRunning = !this.autoRunning
    },

    resetWaterTable() {
      this.pumpRate = 2
      this.recharge = 4
      this.currentPreset = '自然水文平衡'
      this.rebuildWaterTable()
    },

    toggleLock() {
      this.locked = !this.locked
      if (this.controls) {
        if (this.locked) {
          this.camera.position.set(0, 10, 24)
          this.controls.target.set(0, 2.5, 0)
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
      this.pumpRate = 4
      this.recharge = 3
      this.wellType = 'unconfined'
      this.currentPreset = '采补轻微失衡'
      this.autoRunning = true
      this.rebuildWaterTable()
      this.camera.position.set(0, 10, 24)
      this.controls.target.set(0, 2.5, 0)
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
.hydro-theme {
  display: flex;
  gap: 18px;
  background: #05161b;
  border-radius: var(--radius-card, 16px);
  padding: 16px;
  border: 1px solid rgba(13, 148, 136, 0.3);
  color: #f1f5f9;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
}

.gw-panel {
  width: 330px;
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
  color: #0d9488;
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
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}
.preset-chip {
  padding: 8px 6px;
  background: rgba(19, 78, 74, 0.35);
  border: 1px solid rgba(13, 148, 136, 0.3);
  border-radius: 8px;
  color: #e2e8f0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.2s;
}
.preset-chip:hover {
  background: rgba(13, 148, 136, 0.25);
  border-color: #14b8a6;
}
.preset-chip.active {
  background: rgba(13, 148, 136, 0.4);
  border-color: #2dd4bf;
  color: #5eead4;
}
.chip-name { font-size: 11px; font-weight: 700; }
.chip-sub { font-size: 9px; opacity: 0.7; }

.ctrl-group {
  background: rgba(4, 47, 46, 0.35);
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(13, 148, 136, 0.2);
}
.ctrl-label-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 6px;
  color: #cbd5e1;
}
.val-badge {
  color: #2dd4bf;
  font-weight: 700;
}
.hydro-slider {
  width: 100%;
  accent-color: #0d9488;
}

.dual-toggle {
  display: flex;
  gap: 6px;
}
.toggle-btn {
  flex: 1;
  padding: 6px 4px;
  background: rgba(19, 78, 74, 0.4);
  border: 1px solid rgba(13, 148, 136, 0.3);
  border-radius: 6px;
  color: #cbd5e1;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s;
}
.toggle-btn.active {
  background: #0d9488;
  color: #fff;
  font-weight: 700;
}

.flume-card {
  background: rgba(4, 47, 46, 0.5);
  border: 1px solid rgba(13, 148, 136, 0.35);
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
.risk-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 10px;
}
.risk-low { background: rgba(16, 185, 129, 0.2); color: #34d399; }
.risk-medium { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
.risk-high { background: rgba(239, 68, 68, 0.25); color: #f87171; }

.flume-metrics {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 11px;
}
.f-row {
  display: flex;
  justify-content: space-between;
  color: #cbd5e1;
}
.f-label { color: #94a3b8; }

.action-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.action-btn {
  padding: 8px;
  background: rgba(19, 78, 74, 0.5);
  border: 1px solid rgba(13, 148, 136, 0.3);
  border-radius: 8px;
  color: #f8fafc;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.action-btn:hover {
  background: rgba(13, 148, 136, 0.3);
  border-color: #2dd4bf;
}
.play-btn.playing {
  background: #0d9488;
  color: #fff;
  font-weight: 700;
}

.guide-trigger {
  padding: 8px;
  border-radius: 8px;
  border: 1px dashed rgba(13, 148, 136, 0.6);
  background: rgba(13, 148, 136, 0.1);
  color: #2dd4bf;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.guide-trigger.active {
  background: #0d9488;
  color: #fff;
}
.guide-box {
  background: rgba(13, 148, 136, 0.15);
  border: 1px solid rgba(13, 148, 136, 0.35);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  color: #a7f3d0;
  line-height: 1.5;
}

.nav-hint {
  font-size: 11px;
  color: #64748b;
  text-align: center;
  margin: 0;
}

.gw-canvas-wrap {
  flex: 1;
  min-height: 480px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.gw-canvas-wrap canvas {
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
  background: rgba(4, 47, 46, 0.85);
  border: 1px solid rgba(13, 148, 136, 0.4);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  color: #f8fafc;
}
.lock-btn {
  pointer-events: auto;
  background: rgba(4, 47, 46, 0.85);
  border: 1px solid rgba(13, 148, 136, 0.5);
  color: #f8fafc;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}

.layer-legend {
  position: absolute;
  bottom: 14px;
  left: 14px;
  right: 14px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  pointer-events: none;
}
.leg-pill {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
}
.clay { background: #78350f; color: #fef3c7; }
.sand { background: #d97706; color: #fff; }
.table { background: rgba(56, 189, 248, 0.3); border: 1px solid #38bdf8; color: #38bdf8; }

@media (max-width: 768px) {
  .hydro-theme {
    flex-direction: column;
  }
  .gw-panel {
    width: 100%;
  }
  .gw-canvas-wrap {
    min-height: 320px;
  }
}
</style>
