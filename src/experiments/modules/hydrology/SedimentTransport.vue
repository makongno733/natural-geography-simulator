<template>
  <div class="st2-layout hydro-theme">
    <aside class="st2-panel">
      <div class="panel-header">
        <span class="station-tag">📊 水动力学泥沙沉降水槽</span>
        <h3 class="panel-title">流速、粒径与 Hjulstrom 曲线</h3>
      </div>

      <!-- 水动力流速预设 -->
      <div class="st2-presets">
        <span class="ctrl-subhead">河流流速典型工况</span>
        <div class="preset-grid">
          <button
            v-for="p in presets"
            :key="p.label"
            :class="['preset-chip', { active: currentPreset === p.label }]"
            @click="applyPreset(p)"
          >
            <span class="chip-name">{{ p.label }}</span>
            <span class="chip-val">{{ p.velocity }} cm/s</span>
          </button>
        </div>
      </div>

      <!-- 流速滑块 (0 to 400 cm/s, 对数刻度体验) -->
      <div class="ctrl-group">
        <div class="ctrl-label-row">
          <span>水流横截面平均流速 V</span>
          <span class="val-badge">{{ velocity.toFixed(1) }} cm/s</span>
        </div>
        <input
          type="range"
          min="0.2"
          max="300"
          step="1"
          v-model.number="velocity"
          @input="onParamInput"
          class="hydro-slider"
        />
        <div class="angle-ticks">
          <span>0.2 湖沼静水</span>
          <span>15 平原水流</span>
          <span>120 湍流</span>
          <span>300 暴雨洪峰</span>
        </div>
      </div>

      <!-- 四类典型颗粒动力学状态遥测 -->
      <div class="hjulstrom-card">
        <div class="card-head">
          <span>🔬 颗粒动态判定 (Hjulstrom 准则)</span>
          <span class="regime-badge">{{ flowRegimeText }}</span>
        </div>
        <div class="grain-table">
          <div v-for="g in grainClasses" :key="g.name" class="grain-row">
            <div class="g-info">
              <span class="g-dot" :style="{ background: g.color }"></span>
              <span class="g-name">{{ g.name }} ({{ g.size }})</span>
            </div>
            <span :class="['g-state', getGrainStateClass(g)]">{{ getGrainStateText(g) }}</span>
          </div>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="action-row">
        <button
          @click="togglePlay"
          :class="['action-btn', 'play-btn', { playing: autoRunning }]"
        >
          {{ autoRunning ? '⏸ 暂停水槽' : '▶ 水动力运转' }}
        </button>
        <button
          @click="resetVelocity"
          class="action-btn"
        >
          ↺ 重置基准流速
        </button>
      </div>

      <button
        @click="toggleGuide"
        :class="['guide-trigger', { active: guideActive }]"
      >
        {{ guideActive ? '⏸ 停止讲解' : '💡 黏土黏聚力与Hjulstrom曲线核心剖析' }}
      </button>
      <div v-if="guideActive" class="guide-box">{{ guideText }}</div>
      <p class="nav-hint">🖱 拖动旋转水槽 · 滚轮缩放 · 双击复位</p>
    </aside>

    <div class="st2-canvas-wrap">
      <canvas ref="cvs"></canvas>
      <div class="view-overlay">
        <span class="overlay-tag">水力学透明泥沙沉降水槽实验</span>
        <button class="lock-btn" @click="toggleLock" :title="locked ? '解锁自由漫游' : '锁定正侧视'">
          {{ locked ? '🔒 侧视锁定' : '🔓 自由漫游' }}
        </button>
      </div>
      <div class="hjulstrom-paradox-tag">
        <span>黏土反常现象：因颗粒微小带电黏聚力强，起动侵蚀所需流速反高于粗砂！</span>
      </div>
    </div>
  </div>

  <ModelPedagogyPanel
    theme="hydrology"
    :observe="pedagogy.observe"
    :change="pedagogy.change"
    :mechanism="pedagogy.mechanism"
    :limitations="pedagogy.limitations"
    :real-data-lab="{ title: 'Copernicus 雅鲁藏布江大峡谷实测高程与泥沙流向', path: '/geo-labs/terrain', desc: '真实高程DEM分析河流泥沙搬运' }"
    :textbook-link="{ grade: '高中', book: '选择性必修1', chapter: '第二章', section: '第三节' }"
    practice-link="/practice"
    @reset="resetObservation"
  />
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import ModelPedagogyPanel from '../../components/ModelPedagogyPanel.vue'

const GRAINS = [
  { name: '黏土 Clay', size: '<0.004 mm', color: '#94a3b8', erodeV: 90, depositV: 0.1 },
  { name: '粉砂 Silt', size: '0.004~0.06 mm', color: '#a8a29e', erodeV: 20, depositV: 1.0 },
  { name: '中粗砂 Sand', size: '0.06~2 mm', color: '#fbbf24', erodeV: 15, depositV: 8.0 },
  { name: '粗砾石 Gravel', size: '>2 mm', color: '#b45309', erodeV: 120, depositV: 60.0 },
]

export default {
  name: 'SedimentTransport',
  components: {
    ModelPedagogyPanel,
  },
  data() {
    return {
      velocity: 25,
      currentPreset: '常态水流 (搬运粉砂和细砂)',
      autoRunning: true,
      locked: true,
      guideActive: false,
      guideIndex: 0,
      guideText: '',
      grainClasses: GRAINS,
      presets: [
        { label: '湖沼近静水', velocity: 0.5 },
        { label: '平缓中下游', velocity: 15 },
        { label: '常态冲淤流水', velocity: 45 },
        { label: '暴雨强洪急流', velocity: 180 },
      ],
      guideSteps: [
        '【Hjulstrom曲线三界限】水流将泥沙状态划分为三区：侵蚀冲刷区、悬浮搬运区、重力沉积区！',
        '【粗颗粒沉降规律】粗颗粒（砾石、粗砂）质量大，流速稍减弱便立即在重力作用下最先沉积！',
        '【细颗粒黏聚反常】微细黏土颗粒间存在强分子引力与静电黏聚力，起动起动侵蚀需要的流速竟然和粗砾石相当！',
        '【一旦起动极难沉淀】细小黏土颗粒沉降阻力极小，一旦被冲刷进入悬浮状态，流速降至极低也难沉淀！',
      ],
      pedagogy: {
        observe: [
          '流速由低到高时，水槽底部各级粒径颗粒由“完全静止”到“滚动推移”再到“悬浮翻滚”的物理状态跃变。',
          '在极低流速（<1 cm/s）下，除极细悬浮质外，绝大多数砾石与砂粒发生完全沉降。',
          '在极高流速（>150 cm/s）下，所有颗粒包括粗砾石被强水流挟带翻滚冲刷。',
        ],
        change: [
          '调节流速滑块（0.2 cm/s 到 300 cm/s），动态查看四类粒径颗粒的动力学状态指示灯。',
          '切换“湖沼静水 / 平缓中游 / 常态冲淤 / 暴雨急流”典型河流工况。',
        ],
        mechanism: [
          '颗粒起动由底部剪切应力（Shields 准则）克服颗粒有效重力与咬合摩擦力决定。',
          'Hjulstrom 曲线呈独特的“凹形拐点”：0.2~0.5mm 的中细砂最易起动（所需流速最小仅 ~15cm/s）。',
          '粒径小于 0.01mm 的微粒具有强胶体吸附与电层黏聚作用，必须更大流速形成强湍流微涡旋才能将其剥离底质。',
        ],
        limitations: [
          '本实验为定常单向均匀流假定，自然河道中水流受弯道二次流、潮汐回水及回水区影响。',
          'Hjulstrom 曲线主要适用于均质颗粒分选床面，未考虑非均匀混相床面的泥沙粗化隐蔽保护效应。',
        ],
      },
    }
  },
  computed: {
    flowRegimeText() {
      if (this.velocity >= 150) return '高能量急流冲刷'
      if (this.velocity >= 30) return '中等能量动态搬运'
      return '低能量沉积主导'
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
    getGrainStateText(g) {
      if (this.velocity >= g.erodeV) return '起动侵蚀 (Erosion)'
      if (this.velocity >= g.depositV) return '稳定搬运 (Transport)'
      return '沉降堆积 (Deposition)'
    },
    getGrainStateClass(g) {
      if (this.velocity >= g.erodeV) return 'state-erode'
      if (this.velocity >= g.depositV) return 'state-transport'
      return 'state-deposit'
    },

    initScene() {
      const canvas = this.$refs.cvs
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const w = rect.width || 600
      const h = rect.height || 420

      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color(0x05161b)

      this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)
      this.camera.position.set(0, 4, 18)

      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
      this.renderer.setSize(w, h)
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      this.renderer.shadowMap.enabled = true

      this.controls = new OrbitControls(this.camera, canvas)
      this.controls.enableDamping = true
      this.controls.dampingFactor = 0.06
      this.controls.target.set(0, 1.2, 0)
      if (this.locked) {
        this.controls.maxPolarAngle = Math.PI / 2.1
        this.controls.minDistance = 6
        this.controls.maxDistance = 40
      }

      this.buildFlume()
      this.animate()
    },

    buildFlume() {
      // 1. Lighting
      const light = new THREE.DirectionalLight(0xfff8e7, 3.0)
      light.position.set(10, 20, 15)
      this.scene.add(light)
      this.scene.add(new THREE.AmbientLight(0x134e4a, 1.2))

      // 2. Glass Flume Tank (length 16, height 3, depth 4)
      const tankGeo = new THREE.BoxGeometry(16, 3, 4)
      const tankMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.1,
        metalness: 0.1,
        transparent: true,
        opacity: 0.25,
      })
      const tank = new THREE.Mesh(tankGeo, tankMat)
      tank.position.set(0, 1.5, 0)
      this.scene.add(tank)

      // Bedplate
      const bedGeo = new THREE.BoxGeometry(16, 0.4, 4)
      const bedMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 })
      const bed = new THREE.Mesh(bedGeo, bedMat)
      bed.position.set(0, -0.2, 0)
      this.scene.add(bed)

      // Water surface mesh
      const waterGeo = new THREE.BoxGeometry(15.9, 2.2, 3.9)
      const waterMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.1,
        transparent: true,
        opacity: 0.45,
      })
      const water = new THREE.Mesh(waterGeo, waterMat)
      water.position.set(0, 1.1, 0)
      this.scene.add(water)

      // 3. Sediment grain particles across 4 classes
      this.particles = []
      GRAINS.forEach((g, gIdx) => {
        const radius = gIdx === 0 ? 0.08 : (gIdx === 1 ? 0.12 : (gIdx === 2 ? 0.2 : 0.35))
        const pGeo = new THREE.SphereGeometry(radius, 10, 10)
        const pMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(g.color), roughness: 0.8 })

        const count = gIdx === 0 ? 50 : (gIdx === 1 ? 40 : (gIdx === 2 ? 35 : 20))
        for (let i = 0; i < count; i++) {
          const mesh = new THREE.Mesh(pGeo, pMat)
          mesh.userData = {
            grain: g,
            x: (Math.random() - 0.5) * 15,
            y: 0.1 + Math.random() * 0.2, // close to bed initially
            z: (Math.random() - 0.5) * 3.4,
            vx: 0,
            vy: 0,
          }
          mesh.position.set(mesh.userData.x, mesh.userData.y, mesh.userData.z)
          this.particles.push(mesh)
          this.scene.add(mesh)
        }
      })
    },

    animate() {
      this.animId = requestAnimationFrame(this.animate)

      if (this.autoRunning && this.particles.length > 0) {
        const v = this.velocity

        this.particles.forEach((p) => {
          const g = p.userData.grain
          // State determines movement:
          if (v >= g.erodeV) {
            // EROSION: High turbulence, lift off into suspension
            p.userData.vx = 0.04 + (v / 150) * 0.12
            // vertical turbulence bounce
            p.userData.y += (Math.random() - 0.48) * 0.08
            p.userData.y = Math.max(0.1, Math.min(2.0, p.userData.y))
          } else if (v >= g.depositV) {
            // TRANSPORT: Rolling / saltation along bed
            p.userData.vx = 0.02 + (v / 80) * 0.05
            p.userData.y += (Math.random() - 0.52) * 0.03
            p.userData.y = Math.max(0.1, Math.min(0.6, p.userData.y))
          } else {
            // DEPOSITION: Settles to bed, no movement
            p.userData.vx = 0
            if (p.userData.y > 0.1) {
              p.userData.y -= 0.02 // settling
            }
          }

          p.userData.x += p.userData.vx
          if (p.userData.x > 7.8) {
            p.userData.x = -7.8
          }
          p.position.set(p.userData.x, p.userData.y, p.userData.z)
        })
      }

      if (this.controls) this.controls.update()
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera)
      }
    },

    onParamInput() {
      this.currentPreset = null
    },

    applyPreset(p) {
      this.currentPreset = p.label
      this.velocity = p.velocity
    },

    togglePlay() {
      this.autoRunning = !this.autoRunning
    },

    resetVelocity() {
      this.velocity = 25
      this.currentPreset = '常态冲淤流水'
    },

    toggleLock() {
      this.locked = !this.locked
      if (this.controls) {
        if (this.locked) {
          this.camera.position.set(0, 4, 18)
          this.controls.target.set(0, 1.2, 0)
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
      this.velocity = 25
      this.currentPreset = '常态水流 (搬运粉砂和细砂)'
      this.autoRunning = true
      this.camera.position.set(0, 4, 18)
      this.controls.target.set(0, 1.2, 0)
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

.st2-panel {
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
.chip-val { font-size: 9px; opacity: 0.7; }

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
.angle-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  color: #64748b;
  margin-top: 4px;
}

.hjulstrom-card {
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
.regime-badge {
  background: rgba(13, 148, 136, 0.25);
  color: #2dd4bf;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 10px;
}

.grain-table {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.grain-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}
.g-info {
  display: flex;
  align-items: center;
  gap: 6px;
}
.g-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.g-name { color: #e2e8f0; font-weight: 600; }

.g-state {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
}
.state-erode { background: rgba(239, 68, 68, 0.25); color: #f87171; }
.state-transport { background: rgba(245, 158, 11, 0.25); color: #fbbf24; }
.state-deposit { background: rgba(16, 185, 129, 0.25); color: #34d399; }

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

.st2-canvas-wrap {
  flex: 1;
  min-height: 480px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.st2-canvas-wrap canvas {
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

.hjulstrom-paradox-tag {
  position: absolute;
  bottom: 14px;
  left: 14px;
  right: 14px;
  background: rgba(4, 47, 46, 0.85);
  border: 1px solid rgba(245, 158, 11, 0.5);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 11px;
  color: #fef08a;
  line-height: 1.4;
  pointer-events: none;
}

@media (max-width: 768px) {
  .hydro-theme {
    flex-direction: column;
  }
  .st2-panel {
    width: 100%;
  }
  .st2-canvas-wrap {
    min-height: 320px;
  }
}
</style>
