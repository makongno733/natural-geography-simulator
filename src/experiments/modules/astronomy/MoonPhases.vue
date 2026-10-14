<template>
  <div class="mp-layout astro-theme">
    <aside class="mp-panel">
      <div class="panel-header">
        <span class="station-tag">🔭 天文台天象观测舱</span>
        <h3 class="panel-title">月相几何与地月观测</h3>
      </div>

      <!-- 农历八大相位快速定位 -->
      <div class="phase-selector">
        <span class="ctrl-subhead">农历特征相位</span>
        <div class="preset-grid">
          <button
            v-for="p in phaseList"
            :key="p.key"
            :class="['preset-chip', { active: currentPhaseIndex === p.index }]"
            @click="selectPhase(p.index)"
          >
            <span class="chip-sym">{{ p.symbol }}</span>
            <span class="chip-name">{{ p.name }}</span>
            <span class="chip-date">{{ p.lunarDate }}</span>
          </button>
        </div>
      </div>

      <!-- 轨道连续公转控制 -->
      <div class="ctrl-group">
        <div class="ctrl-label-row">
          <span>公转角位移</span>
          <span class="val-badge">{{ moonAngleDeg }}°</span>
        </div>
        <input
          type="range"
          min="0"
          max="360"
          step="1"
          v-model.number="moonAngleDeg"
          @input="onAngleInput"
          class="astro-slider"
        />
        <div class="angle-ticks">
          <span>0° 朔日</span>
          <span>90° 上弦</span>
          <span>180° 望日</span>
          <span>270° 下弦</span>
        </div>
      </div>

      <!-- 望远镜观测目镜读数看板 -->
      <div class="telescope-card">
        <div class="card-head">
          <span>🌍 地面望远镜视场</span>
          <span class="illum-badge">被照亮: {{ illuminationPct }}%</span>
        </div>
        <div class="eyepiece-wrapper">
          <div class="eyepiece-reticle"></div>
          <div class="moon-render" :style="moonPhaseStyle"></div>
        </div>
        <div class="phase-meta">
          <div class="meta-row">
            <span class="meta-label">农历周期：</span>
            <strong>{{ currentPhaseInfo.lunarDate }} ({{ currentPhaseInfo.name }})</strong>
          </div>
          <div class="meta-row">
            <span class="meta-label">地月中天：</span>
            <span>{{ currentPhaseInfo.transitTime }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">观测窗口：</span>
            <span>{{ currentPhaseInfo.visibility }}</span>
          </div>
        </div>
      </div>

      <!-- 操作与引导 -->
      <div class="action-row">
        <button
          @click="togglePlay"
          :class="['action-btn', 'play-btn', { playing: autoRunning }]"
        >
          {{ autoRunning ? '⏸ 暂停公转' : '▶ 连续公转' }}
        </button>
        <button
          @click="toggleViewMode"
          class="action-btn"
        >
          {{ viewMode === 'orbit' ? '🔭 切换地面望远视角' : '🪐 切换黄道俯视' }}
        </button>
      </div>

      <button
        @click="toggleGuide"
        :class="['guide-trigger', { active: guideActive }]"
      >
        {{ guideActive ? '⏸ 停止讲解' : '💡 核心考点动画引导' }}
      </button>
      <div v-if="guideActive" class="guide-box">{{ guideText }}</div>
      <p class="nav-hint">🖱 拖动旋转空间 · 滚轮缩放 · 双击复位</p>
    </aside>

    <div class="mp-canvas-wrap">
      <canvas ref="cvs"></canvas>
      <div class="view-overlay">
        <span class="overlay-tag">{{ viewMode === 'orbit' ? '黄道面俯视系统' : '地球地面观测视角' }}</span>
        <button class="lock-btn" @click="toggleLock" :title="locked ? '解锁自由漫游' : '锁定观察轴线'">
          {{ locked ? '🔒 轴线锁定' : '🔓 自由漫游' }}
        </button>
      </div>
      <div class="sunlight-indicator">
        <span>平行太阳光束方向 ➔➔</span>
      </div>
    </div>
  </div>

  <!-- 教学机理与连贯性探究面板 -->
  <ModelPedagogyPanel
    theme="astronomy"
    :observe="pedagogy.observe"
    :change="pedagogy.change"
    :mechanism="pedagogy.mechanism"
    :limitations="pedagogy.limitations"
    :real-data-lab="{ title: 'NASA 卫星云图日夜交替', path: '/geo-labs/satellite', desc: '真实卫星影像看地表光照' }"
    :textbook-link="{ grade: '高中', book: '选择性必修1', chapter: '第一章', section: '第一节' }"
    practice-link="/practice"
    @reset="resetObservation"
  />
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import ModelPedagogyPanel from '../../components/ModelPedagogyPanel.vue'

const PHASES = [
  { index: 0, key: 'new', name: '新月 (朔)', symbol: '🌑', lunarDate: '初一', deg: 0, transitTime: '正午 12:00', visibility: '日出同升、日落同落，彻夜不可见' },
  { index: 1, key: 'waxing-crescent', name: '蛾眉月 (盈)', symbol: '🌒', lunarDate: '初三~初四', deg: 45, transitTime: '午后 15:00', visibility: '傍晚见于西方天空，日落后数小时落下' },
  { index: 2, key: 'first', name: '上弦月', symbol: '🌓', lunarDate: '初七~初八', deg: 90, transitTime: '傍晚 18:00', visibility: '正午升起，前半夜见于西天，半夜落下' },
  { index: 3, key: 'waxing-gibbous', name: '盈凸月', symbol: '🌔', lunarDate: '初十~十二', deg: 135, transitTime: '前半夜 21:00', visibility: '午后升起，大半夜可见，黎明前西落' },
  { index: 4, key: 'full', name: '满月 (望)', symbol: '🌕', lunarDate: '十五~十六', deg: 180, transitTime: '午夜 00:00', visibility: '日落即升、日出即落，通宵彻夜明朗' },
  { index: 5, key: 'waning-gibbous', name: '亏凸月', symbol: '🌖', lunarDate: '十八~二十', deg: 225, transitTime: '后半夜 03:00', visibility: '前半夜升起，后半夜至清晨可见' },
  { index: 6, key: 'third', name: '下弦月', symbol: '🌗', lunarDate: '廿二~廿三', deg: 270, transitTime: '清晨 06:00', visibility: '半夜升起，后半夜见于东天，正午落下' },
  { index: 7, key: 'waning-crescent', name: '残月 (亏)', symbol: '🌘', lunarDate: '廿七~廿八', deg: 315, transitTime: '上午 09:00', visibility: '黎明前见于东方晨曦，日落前落下' },
]

export default {
  name: 'MoonPhases',
  components: {
    ModelPedagogyPanel,
  },
  data() {
    return {
      moonAngleDeg: 0,
      autoRunning: false,
      locked: true,
      viewMode: 'orbit',
      guideActive: false,
      guideIndex: 0,
      guideText: '',
      phaseList: PHASES,
      guideSteps: [
        '【观察关键】太阳光始终从右侧平行射来，月球受光半球永远朝向右侧！',
        '【新月朔日】月球在日地正中间，背光面对准地球，地球夜面仰望完全看不到月亮。',
        '【上弦特征】月球公转到90°，在地球上看右半边亮，前半夜西天高挂，亮面朝西！',
        '【满月望日】地球在日月中间，整面受光面直面地球，通宵彻夜长明，中天在子夜。',
        '【下弦特征】公转到270°，在地球上看左半边亮，后半夜东天升起，亮面朝东！',
      ],
      pedagogy: {
        observe: [
          '月球受光半球恒定朝向太阳，公转过程受光半球与背光半球形态不变。',
          '从地球中心/地面仰望视场中，月球亮面随三者夹角呈现凸、平、凹的圆弧边界。',
          '上弦月亮面朝西（右半亮）、下弦月亮面朝东（左半亮）的出没时序差异。',
        ],
        change: [
          '连续拖动“公转角位移”滑动条或点击农历特征相位标签。',
          '点击“连续公转”观察朔望月月相变化的周期性过程。',
          '切换“黄道面俯视”与“地面望远视场”对比宏观几何与微观观测。',
        ],
        mechanism: [
          '月球自身不发光、不透明，仅反射太阳光。太阳距地月系极远，射来的光线近似平行。',
          '月球围绕地球自西向东公转，导致太阳-地球-月球三者空间几何相对位置持续改变。',
          '从地球视角看去，月球被照亮的一半只有部分朝向地球，产生圆缺盈亏的月相变化。',
        ],
        limitations: [
          '本模型略去了白道面与黄道面约 5°9′ 的轨道倾角（实际并非每月朔日都发生日食、望日都发生月食）。',
          '模型地月距离与天体半径按教学视距进行了比例夸大（真实太阳距离约为地月距离的 400 倍）。',
          '未计算月球天平动效应（月球略微摆动使地球实际可看到约 59% 的月面）。',
        ],
      },
    }
  },
  computed: {
    currentPhaseIndex() {
      const normalized = ((this.moonAngleDeg % 360) + 360) % 360
      return Math.round(normalized / 45) % 8
    },
    currentPhaseInfo() {
      return PHASES[this.currentPhaseIndex]
    },
    illuminationPct() {
      const rad = (this.moonAngleDeg * Math.PI) / 180
      // 0 deg -> 0%, 180 deg -> 100%
      const val = (1 - Math.cos(rad)) / 2
      return Math.round(val * 100)
    },
    moonPhaseStyle() {
      const deg = ((this.moonAngleDeg % 360) + 360) % 360
      // Realistic terminator visual
      if (deg === 0) {
        return { background: '#111827', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.9)' }
      }
      if (deg === 180) {
        return { background: '#fef08a', boxShadow: '0 0 16px rgba(254, 240, 138, 0.6)' }
      }
      if (deg < 180) {
        // Waxing (right illuminated)
        const pct = (deg / 180) * 100
        return {
          background: `linear-gradient(90deg, #1f2937 ${100 - pct}%, #fef08a ${100 - pct}%)`,
          boxShadow: '0 0 12px rgba(254, 240, 138, 0.4)',
        }
      } else {
        // Waning (left illuminated)
        const pct = ((360 - deg) / 180) * 100
        return {
          background: `linear-gradient(90deg, #fef08a ${pct}%, #1f2937 ${pct}%)`,
          boxShadow: '0 0 12px rgba(254, 240, 138, 0.4)',
        }
      }
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
      this.scene.background = new THREE.Color(0x060913)

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
        this.controls.maxPolarAngle = Math.PI / 2.2
        this.controls.minDistance = 8
        this.controls.maxDistance = 35
      }

      this.buildAstronomyEnvironment()
      this.animate()
    },

    buildAstronomyEnvironment() {
      // 1. Star field background
      const starCount = 350
      const starGeo = new THREE.BufferGeometry()
      const starPos = new Float32Array(starCount * 3)
      for (let i = 0; i < starCount * 3; i += 3) {
        starPos[i] = (Math.random() - 0.5) * 120
        starPos[i + 1] = (Math.random() - 0.5) * 80
        starPos[i + 2] = (Math.random() - 0.5) * 120
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
      const starMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.35, transparent: true, opacity: 0.75 })
      this.stars = new THREE.Points(starGeo, starMat)
      this.scene.add(this.stars)

      // 2. Sun Directional Light from Right (X > 0)
      const sunLight = new THREE.DirectionalLight(0xfff7ed, 3.8)
      sunLight.position.set(30, 0, 0)
      this.scene.add(sunLight)

      const ambientLight = new THREE.AmbientLight(0x1e293b, 0.75)
      this.scene.add(ambientLight)

      // 3. Central Earth with realistic atmosphere and day/night terminator
      const earthGeo = new THREE.SphereGeometry(2.0, 32, 32)
      const earthMat = new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        roughness: 0.6,
        metalness: 0.1,
      })
      this.earthMesh = new THREE.Mesh(earthGeo, earthMat)
      this.scene.add(this.earthMesh)

      // Earth equator and axis tilt
      const axisGeo = new THREE.CylinderGeometry(0.04, 0.04, 5.5, 16)
      const axisMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      const earthAxis = new THREE.Mesh(axisGeo, axisMat)
      earthAxis.rotation.z = THREE.MathUtils.degToRad(-23.5)
      this.scene.add(earthAxis)

      // 4. Lunar Orbit Plane & Ring
      const orbitRadius = 7.5
      this.orbitRadius = orbitRadius
      const orbitCurve = new THREE.EllipseCurve(0, 0, orbitRadius, orbitRadius, 0, 2 * Math.PI, false, 0)
      const orbitPoints = orbitCurve.getPoints(96)
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(
        orbitPoints.map(p => new THREE.Vector3(p.x, 0, p.y))
      )
      const orbitMat = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.6 })
      this.orbitLine = new THREE.Line(orbitGeo, orbitMat)
      this.scene.add(this.orbitLine)

      // 5. Moon Mesh
      const moonGeo = new THREE.SphereGeometry(0.7, 32, 32)
      const moonMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.85,
        metalness: 0.05,
      })
      this.moonMesh = new THREE.Mesh(moonGeo, moonMat)
      this.scene.add(this.moonMesh)

      // 6. Sunlight beam rays indicator
      const rayGroup = new THREE.Group()
      for (let z = -6; z <= 6; z += 3) {
        const rayGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(18, 0, z),
          new THREE.Vector3(10, 0, z),
        ])
        const rayMat = new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.4 })
        rayGroup.add(new THREE.Line(rayGeo, rayMat))
      }
      this.scene.add(rayGroup)

      this.updateMoonPosition()
    },

    updateMoonPosition() {
      if (!this.moonMesh) return
      const rad = (this.moonAngleDeg * Math.PI) / 180
      const x = Math.cos(rad) * this.orbitRadius
      const z = Math.sin(rad) * this.orbitRadius
      this.moonMesh.position.set(x, 0, z)
    },

    animate() {
      this.animId = requestAnimationFrame(this.animate)
      if (this.autoRunning) {
        this.moonAngleDeg = (this.moonAngleDeg + 0.35) % 360
        this.updateMoonPosition()
      }
      if (this.earthMesh) {
        this.earthMesh.rotation.y += 0.005
      }
      if (this.controls) {
        this.controls.update()
      }
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera)
      }
    },

    onAngleInput() {
      this.autoRunning = false
      this.updateMoonPosition()
    },

    selectPhase(index) {
      this.autoRunning = false
      const target = PHASES[index]
      if (target) {
        this.moonAngleDeg = target.deg
        this.updateMoonPosition()
      }
    },

    togglePlay() {
      this.autoRunning = !this.autoRunning
    },

    toggleViewMode() {
      if (this.viewMode === 'orbit') {
        this.viewMode = 'telescope'
        this.camera.position.set(0, 3, 10)
        this.controls.target.copy(this.moonMesh.position)
      } else {
        this.viewMode = 'orbit'
        this.camera.position.set(0, 15, 20)
        this.controls.target.set(0, 0, 0)
      }
      this.controls.update()
    },

    toggleLock() {
      this.locked = !this.locked
      if (this.controls) {
        if (this.locked) {
          this.controls.maxPolarAngle = Math.PI / 2.2
          this.controls.minDistance = 8
          this.controls.maxDistance = 35
        } else {
          this.controls.maxPolarAngle = Math.PI
          this.controls.minDistance = 2
          this.controls.maxDistance = 100
        }
      }
    },

    toggleGuide() {
      this.guideActive = !this.guideActive
      if (this.guideActive) {
        this.guideIndex = 0
        this.guideText = this.guideSteps[0]
        this.startGuideLoop()
      } else {
        clearInterval(this.guideTimer)
      }
    },

    startGuideLoop() {
      clearInterval(this.guideTimer)
      this.guideTimer = setInterval(() => {
        if (!this.guideActive) return
        this.guideIndex = (this.guideIndex + 1) % this.guideSteps.length
        this.guideText = this.guideSteps[this.guideIndex]
      }, 5000)
    },

    resetObservation() {
      this.moonAngleDeg = 0
      this.autoRunning = false
      this.viewMode = 'orbit'
      this.updateMoonPosition()
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
.astro-theme {
  display: flex;
  gap: 18px;
  background: #080d1a;
  border-radius: var(--radius-card, 16px);
  padding: 16px;
  border: 1px solid rgba(245, 158, 11, 0.2);
  color: #f1f5f9;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
}

.mp-panel {
  width: 320px;
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
  color: #f59e0b;
  font-weight: 700;
  text-transform: uppercase;
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
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}
.preset-chip {
  padding: 6px 4px;
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #e2e8f0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.2s;
}
.preset-chip:hover {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.4);
}
.preset-chip.active {
  background: rgba(245, 158, 11, 0.25);
  border-color: #f59e0b;
  color: #fbbf24;
}
.chip-sym { font-size: 14px; }
.chip-name { font-size: 10px; font-weight: 600; white-space: nowrap; }
.chip-date { font-size: 9px; opacity: 0.7; }

.ctrl-group {
  background: rgba(15, 23, 42, 0.6);
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.ctrl-label-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 6px;
  color: #cbd5e1;
}
.val-badge {
  color: #f59e0b;
  font-weight: 700;
}
.astro-slider {
  width: 100%;
  accent-color: #f59e0b;
}
.angle-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  color: #64748b;
  margin-top: 4px;
}

.telescope-card {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 12px;
  padding: 12px;
}
.card-head {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 10px;
}
.illum-badge {
  color: #fbbf24;
  font-weight: 600;
}
.eyepiece-wrapper {
  position: relative;
  width: 110px;
  height: 110px;
  margin: 0 auto 10px;
  border-radius: 50%;
  background: #020617;
  border: 2px solid #f59e0b;
  box-shadow: 0 0 16px rgba(245, 158, 11, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.eyepiece-reticle {
  position: absolute;
  inset: 0;
  border: 1px dashed rgba(245, 158, 11, 0.3);
  border-radius: 50%;
  pointer-events: none;
}
.eyepiece-reticle::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(245, 158, 11, 0.2);
}
.eyepiece-reticle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(245, 158, 11, 0.2);
}
.moon-render {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.phase-meta {
  font-size: 11px;
  line-height: 1.6;
  color: #cbd5e1;
}
.meta-row {
  display: flex;
  justify-content: space-between;
}
.meta-label { color: #94a3b8; }

.action-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.action-btn {
  padding: 8px;
  background: rgba(30, 41, 59, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #f8fafc;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.action-btn:hover {
  background: rgba(245, 158, 11, 0.2);
  border-color: #f59e0b;
}
.play-btn.playing {
  background: #f59e0b;
  color: #000;
  font-weight: 700;
}

.guide-trigger {
  padding: 8px;
  border-radius: 8px;
  border: 1px dashed rgba(245, 158, 11, 0.6);
  background: rgba(245, 158, 11, 0.08);
  color: #f59e0b;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.guide-trigger.active {
  background: #f59e0b;
  color: #000;
}
.guide-box {
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.3);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  color: #fef08a;
  line-height: 1.5;
}

.nav-hint {
  font-size: 11px;
  color: #64748b;
  text-align: center;
  margin: 0;
}

.mp-canvas-wrap {
  flex: 1;
  min-height: 480px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.mp-canvas-wrap canvas {
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
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  color: #f8fafc;
}
.lock-btn {
  pointer-events: auto;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #f8fafc;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}

.sunlight-indicator {
  position: absolute;
  bottom: 14px;
  right: 14px;
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.5);
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 11px;
  color: #fbbf24;
  font-weight: 700;
  pointer-events: none;
}

@media (max-width: 768px) {
  .astro-theme {
    flex-direction: column;
  }
  .mp-panel {
    width: 100%;
  }
  .mp-canvas-wrap {
    min-height: 320px;
  }
  .preset-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
