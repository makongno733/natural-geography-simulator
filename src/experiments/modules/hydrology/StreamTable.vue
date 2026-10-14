<template>
  <div class="st-layout hydro-theme">
    <aside class="st-panel">
      <div class="panel-header">
        <span class="station-tag">💧 流水地貌动力学实验沙槽</span>
        <h3 class="panel-title">流水侵蚀、搬运与堆积模拟</h3>
      </div>

      <!-- 地貌演化特征预设 -->
      <div class="st-presets">
        <span class="ctrl-subhead">河流发育阶段预设</span>
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

      <!-- 坡度与水流量控制 -->
      <div class="ctrl-group">
        <div class="ctrl-label-row">
          <span>实验槽坡度 i</span>
          <span class="val-badge">{{ slope }}° ({{ slopeGradeText }})</span>
        </div>
        <input
          type="range"
          min="2"
          max="22"
          step="1"
          v-model.number="slope"
          @input="onParamInput"
          class="hydro-slider"
        />
        <div class="angle-ticks">
          <span>2° 平原缓流</span>
          <span>10° 丘陵</span>
          <span>22° 高山峡谷</span>
        </div>
      </div>

      <div class="ctrl-group">
        <div class="ctrl-label-row">
          <span>河流流量 Q</span>
          <span class="val-badge">{{ flowRate }} 级 ({{ flowText }})</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          v-model.number="flowRate"
          @input="onParamInput"
          class="hydro-slider"
        />
        <div class="angle-ticks">
          <span>枯水微流</span>
          <span>常水冲淤</span>
          <span>特大洪峰</span>
        </div>
      </div>

      <!-- 水动力遥测与典型地貌诊断 -->
      <div class="flume-card">
        <div class="card-head">
          <span>🔬 河谷动力学特征诊断</span>
          <span class="energy-badge">动能: {{ streamPowerText }}</span>
        </div>
        <div class="flume-metrics">
          <div class="f-row">
            <span class="f-label">上游特征：</span>
            <strong>V 形谷 · 下切侵蚀为主</strong>
          </div>
          <div class="f-row">
            <span class="f-label">中游曲流：</span>
            <span>{{ meanderText }}</span>
          </div>
          <div class="f-row">
            <span class="f-label">下游河口：</span>
            <strong>冲积扇 / 三角洲泥沙分选堆积</strong>
          </div>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="action-row">
        <button
          @click="togglePlay"
          :class="['action-btn', 'play-btn', { playing: autoRunning }]"
        >
          {{ autoRunning ? '⏸ 暂停水流' : '▶ 水流侵蚀' }}
        </button>
        <button
          @click="resetTerrain"
          class="action-btn"
        >
          ↺ 耙平初始沙面
        </button>
      </div>

      <button
        @click="toggleGuide"
        :class="['guide-trigger', { active: guideActive }]"
      >
        {{ guideActive ? '⏸ 停止讲解' : '💡 上中下游典型地貌成因讲解' }}
      </button>
      <div v-if="guideActive" class="guide-box">{{ guideText }}</div>
      <p class="nav-hint">🖱 拖动旋转沙槽 · 滚轮缩放 · 双击复位</p>
    </aside>

    <div class="st-canvas-wrap">
      <canvas ref="cvs"></canvas>
      <div class="view-overlay">
        <span class="overlay-tag">水力学实验沙槽（倾斜可调）</span>
        <button class="lock-btn" @click="toggleLock" :title="locked ? '解锁自由漫游' : '锁定实验台俯视角'">
          {{ locked ? '🔒 俯视锁定' : '🔓 自由漫游' }}
        </button>
      </div>
      <div class="flume-tips">
        <span class="tip-pill cut-bank">凹岸侵蚀 (流速快水深)</span>
        <span class="tip-pill point-bar">凸岸堆积 (流速慢泥沙淤)</span>
      </div>
    </div>
  </div>

  <ModelPedagogyPanel
    theme="hydrology"
    :observe="pedagogy.observe"
    :change="pedagogy.change"
    :mechanism="pedagogy.mechanism"
    :limitations="pedagogy.limitations"
    :real-data-lab="{ title: '喜马拉雅与雅鲁藏布江大峡谷实测高程', path: '/geo-labs/terrain', desc: '真实高程DEM看河流下切V形谷' }"
    :textbook-link="{ grade: '高中', book: '必修第一册', chapter: '第四章', section: '第一节' }"
    practice-link="/practice"
    @reset="resetObservation"
  />
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import ModelPedagogyPanel from '../../components/ModelPedagogyPanel.vue'

export default {
  name: 'StreamTable',
  components: {
    ModelPedagogyPanel,
  },
  data() {
    return {
      slope: 8,
      flowRate: 5,
      currentPreset: '平原常态曲流',
      autoRunning: true,
      locked: true,
      guideActive: false,
      guideIndex: 0,
      guideText: '',
      presets: [
        { label: '高山峡谷急流', sub: '坡陡流急·下切V谷', slope: 18, flowRate: 8 },
        { label: '平原常态曲流', sub: '凹侵凸淤·牛轭湖前身', slope: 5, flowRate: 4 },
        { label: '暴雨山洪爆发', sub: '冲刷剧烈·扇缘沉积', slope: 14, flowRate: 10 },
        { label: '河口微澜漫流', sub: '流速骤减·三角洲分流', slope: 2, flowRate: 3 },
      ],
      guideSteps: [
        '【上游地貌】落差大、水流急，流水侵蚀以溯源侵蚀和下切侵蚀为主，河谷深窄呈“V”形！',
        '【中游曲流】地形变缓，侧蚀增强。在惯性离心力驱动下，凹岸受冲刷侵蚀，凸岸水流减缓泥沙堆积！',
        '【出山口冲积扇】水流流出山口，地势突然开阔平缓，流速剧减，泥沙呈扇状铺散堆积！',
        '【颗粒分选律】洪水泥沙沉积物具有明显分选性：粗大砾石先在近端沉积，细腻黏土粉砂漂向远端！',
      ],
      pedagogy: {
        observe: [
          '上游谷底受强水流冲刷切割呈现深凹形态。',
          '弯曲河段凹岸不断后退受蚀，凸岸泥沙淤积增宽。',
          '水流进入下游平坦区后流速减缓，粗砂最先沉淀，细粒向外扩散形成扇状沉积体。',
        ],
        change: [
          '调节沙槽倾角（坡度 2°~22°），观察流速加快如何使侵蚀模式从侧蚀变为剧烈下切。',
          '调节水流量（枯水期微流到洪峰），观察携带泥沙量与沉积扇面积的扩张。',
          '点击“高山峡谷 / 平原曲流 / 暴雨山洪”典型场景一键复现。',
        ],
        mechanism: [
          '流水侵蚀与搬运能力与流速的数次方成正比（爱里定律：搬运泥沙颗粒重量与流速 6 次方成正比）。',
          '弯道水流具有双重环流结构：表层水流冲向凹岸下沉，底层水流携带泥沙沿槽底爬向凸岸堆积。',
          '坡度降低导致水流重力动能沿流程递减，水动力低于搬运临界值发生重力沉积。',
        ],
        limitations: [
          '实验沙槽泥沙未分层固结，与自然界坚硬基岩河床的抗蚀强度存在缩尺效应差异。',
          '忽略了植被根系固土护岸与地下水基流补给对河床边界稳定性的复杂影响。',
          '未模拟潮汐顶托对河口区逆向水流的周期性扰动。',
        ],
      },
    }
  },
  computed: {
    slopeGradeText() {
      if (this.slope >= 15) return '陡坡急流'
      if (this.slope >= 8) return '中等坡度'
      return '缓坡平原'
    },
    flowText() {
      if (this.flowRate >= 8) return '暴雨洪峰'
      if (this.flowRate >= 4) return '常态流量'
      return '枯季微水'
    },
    streamPowerText() {
      const p = this.slope * this.flowRate
      if (p > 100) return '超强水能 (强下切搬运)'
      if (p > 40) return '中等冲淤动态平衡'
      return '微弱水能 (沉积占优)'
    },
    meanderText() {
      return '凹岸强烈侵蚀 · 凸岸泥沙缓积'
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
      this.scene.background = new THREE.Color(0x041318)

      this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)
      this.camera.position.set(0, 15, 20)

      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
      this.renderer.setSize(w, h)
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      this.renderer.shadowMap.enabled = true

      this.controls = new OrbitControls(this.camera, canvas)
      this.controls.enableDamping = true
      this.controls.dampingFactor = 0.06
      this.controls.target.set(0, 0, 0)
      if (this.locked) {
        this.controls.maxPolarAngle = Math.PI / 2.1
        this.controls.minDistance = 6
        this.controls.maxDistance = 45
      }

      this.buildFlumeTable()
      this.animate()
    },

    buildFlumeTable() {
      // 1. Lighting
      const sun = new THREE.DirectionalLight(0xfffbeb, 3.2)
      sun.position.set(10, 25, 15)
      sun.castShadow = true
      this.scene.add(sun)
      this.scene.add(new THREE.AmbientLight(0x134e4a, 1.4))

      // 2. Table pivot group
      this.flumeTable = new THREE.Group()
      this.scene.add(this.flumeTable)

      // Tank box frame
      const frameGeo = new THREE.BoxGeometry(16.5, 1.2, 9.5)
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.6 })
      const frame = new THREE.Mesh(frameGeo, frameMat)
      frame.position.y = -0.6
      this.flumeTable.add(frame)

      // Sand terrain mesh
      this.gridX = 64
      this.gridZ = 48
      const terrainGeo = new THREE.PlaneGeometry(16, 9, this.gridX - 1, this.gridZ - 1)
      terrainGeo.rotateX(-Math.PI / 2)

      const terrainMat = new THREE.MeshStandardMaterial({
        color: 0xd4a373,
        roughness: 0.9,
        flatShading: true,
      })
      this.terrainMesh = new THREE.Mesh(terrainGeo, terrainMat)
      this.terrainMesh.receiveShadow = true
      this.flumeTable.add(this.terrainMesh)

      // 3. Water particles
      this.waterCount = 180
      this.waterParticles = []
      const wGeo = new THREE.SphereGeometry(0.12, 8, 8)
      const wMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.1,
        metalness: 0.2,
        transparent: true,
        opacity: 0.85,
      })

      for (let i = 0; i < this.waterCount; i++) {
        const mesh = new THREE.Mesh(wGeo, wMat)
        this.resetWaterDrop(mesh)
        mesh.userData.t = Math.random()
        this.waterParticles.push(mesh)
        this.flumeTable.add(mesh)
      }

      this.rebuildTerrainShape()
    },

    resetWaterDrop(p) {
      // Start upstream (left: x around -7.2)
      p.userData = {
        x: -7.2 + (Math.random() - 0.5) * 0.8,
        z: -0.2 + (Math.random() - 0.5) * 0.8,
        vx: 0.05 + (this.slope / 15) * 0.06 * (this.flowRate / 5),
        life: 0,
      }
      p.position.set(p.userData.x, 0.4, p.userData.z)
    },

    rebuildTerrainShape() {
      if (!this.terrainMesh) return
      const pos = this.terrainMesh.geometry.attributes.position
      // Create initial winding river channel in sand:
      // High left (upstream X=-8), Low right (downstream X=+8)
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i)
        const z = pos.getZ(i)

        // Meander centerline: z_c = sin(x * 0.45) * 2.0
        const zCenter = Math.sin(x * 0.45) * 2.0
        const distToCenter = Math.abs(z - zCenter)

        // General elevation: slopes down towards +X
        let y = -x * 0.08

        // Channel groove
        if (distToCenter < 1.4) {
          const depth = (1.4 - distToCenter) * 0.55
          y -= depth
        }

        // Alluvial fan at downstream exit (x > 3.5)
        if (x > 3.5) {
          const fanDist = Math.sqrt(Math.pow(x - 3.5, 2) + Math.pow(z, 2))
          if (fanDist < 4.0) {
            y += (4.0 - fanDist) * 0.12 // deposition lobe
          }
        }

        pos.setY(i, y)
      }
      pos.needsUpdate = true
      this.terrainMesh.geometry.computeVertexNormals()

      // Tilt table according to slope
      const rad = THREE.MathUtils.degToRad(this.slope)
      // Positive X goes lower, tilt about Z axis
      this.flumeTable.rotation.z = -rad * 0.45
    },

    resetTerrain() {
      this.rebuildTerrainShape()
      this.waterParticles.forEach(p => this.resetWaterDrop(p))
    },

    animate() {
      this.animId = requestAnimationFrame(this.animate)

      if (this.autoRunning && this.waterParticles.length > 0) {
        const speedMultiplier = (this.slope / 8) * (this.flowRate / 5) * 0.06

        this.waterParticles.forEach((p) => {
          p.userData.life += 1
          p.userData.x += 0.04 + speedMultiplier

          // Follow winding meander channel:
          const zIdeal = Math.sin(p.userData.x * 0.45) * 2.0
          // Inertia pushes particle towards outside of bend (cut bank):
          const meanderDeriv = Math.cos(p.userData.x * 0.45)
          const inertiaPush = meanderDeriv * 0.02 * (this.flowRate / 5)

          p.userData.z += (zIdeal - p.userData.z) * 0.12 + inertiaPush

          // Upstream height to downstream height
          const y = -p.userData.x * 0.08 - 0.2 + (Math.sin(p.userData.life * 0.2) * 0.04)
          p.position.set(p.userData.x, y, p.userData.z)

          // Reset if reached mouth of delta
          if (p.userData.x > 7.5 || p.userData.life > 320) {
            this.resetWaterDrop(p)
          }
        })
      }

      if (this.controls) this.controls.update()
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera)
      }
    },

    onParamInput() {
      this.currentPreset = null
      this.rebuildTerrainShape()
    },

    applyPreset(p) {
      this.currentPreset = p.label
      this.slope = p.slope
      this.flowRate = p.flowRate
      this.rebuildTerrainShape()
    },

    togglePlay() {
      this.autoRunning = !this.autoRunning
    },

    toggleLock() {
      this.locked = !this.locked
      if (this.controls) {
        if (this.locked) {
          this.camera.position.set(0, 15, 20)
          this.controls.target.set(0, 0, 0)
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
      this.slope = 8
      this.flowRate = 5
      this.currentPreset = '平原常态曲流'
      this.autoRunning = true
      this.resetTerrain()
      this.camera.position.set(0, 15, 20)
      this.controls.target.set(0, 0, 0)
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

.st-panel {
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
.angle-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  color: #64748b;
  margin-top: 4px;
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
.energy-badge {
  background: rgba(13, 148, 136, 0.25);
  color: #2dd4bf;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 10px;
}
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

.st-canvas-wrap {
  flex: 1;
  min-height: 480px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.st-canvas-wrap canvas {
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

.flume-tips {
  position: absolute;
  bottom: 14px;
  left: 14px;
  right: 14px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
}
.tip-pill {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}
.cut-bank {
  background: rgba(239, 68, 68, 0.25);
  border: 1px solid rgba(239, 68, 68, 0.6);
  color: #fca5a5;
}
.point-bar {
  background: rgba(13, 148, 136, 0.25);
  border: 1px solid rgba(13, 148, 136, 0.6);
  color: #5eead4;
}

@media (max-width: 768px) {
  .hydro-theme {
    flex-direction: column;
  }
  .st-panel {
    width: 100%;
  }
  .st-canvas-wrap {
    min-height: 320px;
  }
}
</style>
