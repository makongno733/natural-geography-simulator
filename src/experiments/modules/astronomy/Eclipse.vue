<template>
  <div class="ec-layout astro-theme">
    <aside class="ec-panel">
      <div class="panel-header">
        <span class="station-tag">🌑 日月掩食与空间光学舱</span>
        <h3 class="panel-title">日月食成因与本影半影几何</h3>
      </div>

      <!-- 食类型预设选择 -->
      <div class="eclipse-presets">
        <span class="ctrl-subhead">日地月掩食模式</span>
        <div class="preset-grid">
          <button
            v-for="p in eclipseModes"
            :key="p.key"
            :class="['preset-chip', { active: currentMode === p.key }]"
            @click="setMode(p.key)"
          >
            <span class="chip-name">{{ p.name }}</span>
            <span class="chip-note">{{ p.note }}</span>
          </button>
        </div>
      </div>

      <!-- 月球距离与交角变量 -->
      <div class="ctrl-group">
        <div class="ctrl-label-row">
          <span>地月距离 (决定全食或环食)</span>
          <span class="val-badge">{{ moonDistanceText }}</span>
        </div>
        <input
          type="range"
          min="5.0"
          max="8.5"
          step="0.1"
          v-model.number="moonDist"
          @input="onParamInput"
          class="astro-slider"
        />
        <div class="angle-ticks">
          <span>5.0 近地点(全食)</span>
          <span>6.8 平均距</span>
          <span>8.5 远地点(环食)</span>
        </div>
      </div>

      <div class="ctrl-group">
        <div class="ctrl-label-row">
          <span>黄白交角偏离度 (食季几何条件)</span>
          <span class="val-badge">{{ nodalAngle.toFixed(1) }}° {{ nodalAngle === 0 ? '(精准交点)' : '(错开交点)' }}</span>
        </div>
        <input
          type="range"
          min="0"
          max="5.2"
          step="0.2"
          v-model.number="nodalAngle"
          @input="onParamInput"
          class="astro-slider"
        />
        <div class="angle-ticks">
          <span>0.0° 严格共线(发生食)</span>
          <span>5.1° 白道夹角(错过本影)</span>
        </div>
      </div>

      <!-- 掩食几何遥测看板 -->
      <div class="shadow-card">
        <div class="card-head">
          <span>📐 光学锥体遥测</span>
          <span :class="['status-badge', { occluded: isEclipseOccurring }]">
            {{ isEclipseOccurring ? '掩食发生中' : '交角过大 · 错过本影' }}
          </span>
        </div>
        <div class="shadow-grid">
          <div class="sh-item">
            <span class="sh-label">农历相位条件：</span>
            <strong>{{ currentMode.startsWith('solar') ? '朔日 (初一)' : '望日 (十五/十六)' }}</strong>
          </div>
          <div class="sh-item">
            <span class="sh-label">本影投射位置：</span>
            <strong>{{ shadowTargetText }}</strong>
          </div>
          <div class="sh-item">
            <span class="sh-label">光学现象：</span>
            <span>{{ opticalFeatureText }}</span>
          </div>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="action-row">
        <button
          @click="togglePlay"
          :class="['action-btn', 'play-btn', { playing: autoRunning }]"
        >
          {{ autoRunning ? '⏸ 暂停演示' : '▶ 掩食过程演化' }}
        </button>
        <button
          @click="toggleShadowCones"
          class="action-btn"
        >
          {{ showShadowCones ? '👁 隐藏本影半影锥' : '👁 显示本影半影锥' }}
        </button>
      </div>

      <button
        @click="toggleGuide"
        :class="['guide-trigger', { active: guideActive }]"
      >
        {{ guideActive ? '⏸ 停止讲解' : '💡 日月食形成与交角奥秘讲解' }}
      </button>
      <div v-if="guideActive" class="guide-box">{{ guideText }}</div>
      <p class="nav-hint">🖱 拖动旋转空间 · 滚轮缩放 · 双击居中</p>
    </aside>

    <div class="ec-canvas-wrap">
      <canvas ref="cvs"></canvas>
      <div class="view-overlay">
        <span class="overlay-tag">{{ modeTitleText }}</span>
        <button class="lock-btn" @click="toggleLock" :title="locked ? '解锁自由旋转' : '锁定视角'">
          {{ locked ? '🔒 轴线锁定' : '🔓 自由旋转' }}
        </button>
      </div>
      <div class="shadow-legend">
        <span class="leg-item"><span class="dot umbra-dot"></span>本影 (完全遮挡)</span>
        <span class="leg-item"><span class="dot penumbra-dot"></span>半影 (部分遮挡)</span>
      </div>
    </div>
  </div>

  <ModelPedagogyPanel
    theme="astronomy"
    :observe="pedagogy.observe"
    :change="pedagogy.change"
    :mechanism="pedagogy.mechanism"
    :limitations="pedagogy.limitations"
    :real-data-lab="{ title: 'NASA 卫星日影与地球反照率观测', path: '/geo-labs/satellite', desc: '真实卫星视场下的月球本影移动' }"
    :textbook-link="{ grade: '高中', book: '必修第一册', chapter: '第一章', section: '第一节' }"
    practice-link="/practice"
    @reset="resetObservation"
  />
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import ModelPedagogyPanel from '../../components/ModelPedagogyPanel.vue'

export default {
  name: 'Eclipse',
  components: {
    ModelPedagogyPanel,
  },
  data() {
    return {
      currentMode: 'solar-total',
      moonDist: 5.6,
      nodalAngle: 0.0,
      showShadowCones: true,
      autoRunning: false,
      locked: true,
      guideActive: false,
      guideIndex: 0,
      guideText: '',
      transitProgress: 0,
      eclipseModes: [
        { key: 'solar-total', name: '日全食', note: '朔日·近地点·本影及地' },
        { key: 'solar-annular', name: '日环食', note: '朔日·远地点·伪本影及地' },
        { key: 'lunar-total', name: '月全食 (红月)', note: '望日·月球入地球本影' },
      ],
      guideSteps: [
        '【朔望条件】日食必在初一（朔日，月球在中间），月食必在十五或十六（望日，地球在中间）！',
        '【黄白交角】白道面与黄道面有约5°9′夹角，只有当日月地同时位于黄白交点附近时才发生食！',
        '【日全食与日环食】月球在近地点时视直径大于太阳，本影触及地面成全食；在远地点成本影未及地的环食！',
        '【月全食为何显红】地球大气层折射波长较长的红光洒落在月面上，形成壮丽的“血月/红月亮”！',
      ],
      pedagogy: {
        observe: [
          '本影（深黑锥体，完全无直射光）与半影（外侧渐变锥体，部分光线遮挡）的空间分布。',
          '日全食与日环食时月球本影锥尖端是否触及地球表面的几何差异。',
          '黄白交角调节大于 2° 时，月球完全从地球阴影上方或下方掠过，不发生任何食现象。',
        ],
        change: [
          '切换日全食、日环食、月全食三种典型天文物理模式。',
          '调节“地月距离”滑杆，直观改变本影锥顶点与地表的几何交截。',
          '调节“黄白交角偏离度”，揭秘为什么不是每月初一和十五都有日食和月食。',
        ],
        mechanism: [
          '日月食是光在真空中沿直线传播以及不透明天体互相遮挡产生阴影的宏观天体物理现象。',
          '日全食发生时，月球角直径略大于太阳角直径（太阳与月球距离之比恰好接近其物理直径之比，约为 400:1）。',
          '月食中月球呈现暗红色是因为地球浓厚大气对阳光产生瑞利散射，蓝紫光被散射，唯有长波红光经折射到达月面。',
        ],
        limitations: [
          '天体间物理距离与体积按课堂可见比例进行了紧凑化建模（实际太阳直径为地球 109 倍，距离为 1.5 亿公里）。',
          '未模拟月球表面复杂的环形山起伏导致的“贝利珠”（Baily’s beads）效应。',
          '简化了地球大气厚度与大气折射率的精细波长色散模型。',
        ],
      },
    }
  },
  computed: {
    isEclipseOccurring() {
      return this.nodalAngle < 1.2
    },
    moonDistanceText() {
      if (this.moonDist <= 5.8) return '近地点 (~36.3万km)'
      if (this.moonDist >= 7.8) return '远地点 (~40.5万km)'
      return '平均距离 (~38.4万km)'
    },
    shadowTargetText() {
      if (!this.isEclipseOccurring) return '偏离目标（无掩食）'
      if (this.currentMode === 'solar-total') return '月球本影投射在地球表面'
      if (this.currentMode === 'solar-annular') return '月球伪本影投射在地表(全影未及地)'
      return '地球本影完全笼罩月球'
    },
    opticalFeatureText() {
      if (!this.isEclipseOccurring) return '普通日光照射'
      if (this.currentMode === 'solar-total') return '白昼变黑夜，显现壮观太阳日冕'
      if (this.currentMode === 'solar-annular') return '形成金色光环（火之环）'
      return '地球大气折射红光形成古铜色“红月”'
    },
    modeTitleText() {
      const target = this.eclipseModes.find(m => m.key === this.currentMode)
      return target ? `${target.name} · ${target.note}` : '日月食掩食模拟'
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
      this.scene.background = new THREE.Color(0x050814)

      this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)
      this.camera.position.set(0, 14, 24)

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
        this.controls.minDistance = 8
        this.controls.maxDistance = 55
      }

      this.buildSystem()
      this.animate()
    },

    buildSystem() {
      // 1. Stars background
      const starCount = 300
      const starGeo = new THREE.BufferGeometry()
      const starPos = new Float32Array(starCount * 3)
      for (let i = 0; i < starCount * 3; i += 3) {
        starPos[i] = (Math.random() - 0.5) * 120
        starPos[i + 1] = (Math.random() - 0.5) * 80
        starPos[i + 2] = (Math.random() - 0.5) * 120
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
      this.scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x64748b, size: 0.35 })))

      // 2. Sun (far left or right, depending on layout. Let's put Sun at -X = -20)
      const sunGeo = new THREE.SphereGeometry(3.0, 32, 32)
      const sunMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b })
      this.sunMesh = new THREE.Mesh(sunGeo, sunMat)
      this.sunMesh.position.set(-20, 0, 0)
      this.scene.add(this.sunMesh)

      const sunLight = new THREE.DirectionalLight(0xfff7ed, 3.8)
      sunLight.position.set(-25, 0, 0)
      this.scene.add(sunLight)
      this.scene.add(new THREE.AmbientLight(0x1e293b, 0.6))

      // 3. Earth
      const earthGeo = new THREE.SphereGeometry(1.6, 32, 32)
      const earthMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.65 })
      this.earthMesh = new THREE.Mesh(earthGeo, earthMat)
      this.scene.add(this.earthMesh)

      // 4. Moon
      const moonGeo = new THREE.SphereGeometry(0.55, 32, 32)
      this.moonMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 })
      this.moonMesh = new THREE.Mesh(moonGeo, this.moonMat)
      this.scene.add(this.moonMesh)

      // 5. Shadow Cones Group
      this.coneGroup = new THREE.Group()
      this.scene.add(this.coneGroup)

      this.updatePositionsAndShadows()
    },

    updatePositionsAndShadows() {
      if (!this.earthMesh || !this.moonMesh) return

      const yOffset = Math.sin(THREE.MathUtils.degToRad(this.nodalAngle)) * 2.5

      if (this.currentMode.startsWith('solar')) {
        // Solar Eclipse: Moon is between Sun (-20) and Earth (0)
        // Earth at 0, Moon at -moonDist
        this.earthMesh.position.set(0, 0, 0)
        this.moonMesh.position.set(-this.moonDist, yOffset, 0)
        this.moonMat.color.setHex(0xe2e8f0)
      } else {
        // Lunar Eclipse: Earth is between Sun (-20) and Moon (+moonDist)
        this.earthMesh.position.set(0, 0, 0)
        this.moonMesh.position.set(this.moonDist, yOffset, 0)
        // Blood Moon color if in eclipse!
        if (this.isEclipseOccurring) {
          this.moonMat.color.setHex(0xb91c1c) // Crimson reddish
        } else {
          this.moonMat.color.setHex(0xe2e8f0)
        }
      }

      this.rebuildShadowCones()
    },

    rebuildShadowCones() {
      while (this.coneGroup.children.length > 0) {
        const c = this.coneGroup.children[0]
        if (c.geometry) c.geometry.dispose()
        this.coneGroup.remove(c)
      }

      if (!this.showShadowCones) return

      if (this.currentMode.startsWith('solar')) {
        // Moon casts shadow towards +X
        const moonPos = this.moonMesh.position
        // Umbra cone from moon: tip is at moonPos.x + 6.0
        // If distance is large (annular), tip is before Earth. If small, hits Earth.
        const umbraLength = 6.0
        const coneGeo = new THREE.ConeGeometry(0.55, umbraLength, 32, 1, true)
        coneGeo.rotateZ(-Math.PI / 2)
        coneGeo.translate(moonPos.x + umbraLength / 2, moonPos.y, moonPos.z)
        const coneMat = new THREE.MeshBasicMaterial({ color: 0x020617, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
        this.coneGroup.add(new THREE.Mesh(coneGeo, coneMat))

        // Penumbra cylinder/cone
        const penGeo = new THREE.CylinderGeometry(0.6, 2.2, umbraLength + 4, 32, 1, true)
        penGeo.rotateZ(-Math.PI / 2)
        penGeo.translate(moonPos.x + (umbraLength + 4) / 2, moonPos.y, moonPos.z)
        const penMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.15, side: THREE.DoubleSide })
        this.coneGroup.add(new THREE.Mesh(penGeo, penMat))
      } else {
        // Earth casts shadow towards +X
        const earthPos = this.earthMesh.position
        const umbraLength = 14.0
        const coneGeo = new THREE.ConeGeometry(1.6, umbraLength, 32, 1, true)
        coneGeo.rotateZ(-Math.PI / 2)
        coneGeo.translate(earthPos.x + umbraLength / 2, earthPos.y, earthPos.z)
        const coneMat = new THREE.MeshBasicMaterial({ color: 0x450a0a, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
        this.coneGroup.add(new THREE.Mesh(coneGeo, coneMat))

        // Penumbra
        const penGeo = new THREE.CylinderGeometry(1.7, 4.0, umbraLength, 32, 1, true)
        penGeo.rotateZ(-Math.PI / 2)
        penGeo.translate(earthPos.x + umbraLength / 2, earthPos.y, earthPos.z)
        const penMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.12, side: THREE.DoubleSide })
        this.coneGroup.add(new THREE.Mesh(penGeo, penMat))
      }
    },

    animate() {
      this.animId = requestAnimationFrame(this.animate)
      if (this.autoRunning) {
        this.transitProgress += 0.015
        this.nodalAngle = Math.abs(Math.sin(this.transitProgress) * 4.5)
        this.updatePositionsAndShadows()
      }
      if (this.earthMesh) this.earthMesh.rotation.y += 0.008
      if (this.controls) this.controls.update()
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera)
      }
    },

    setMode(key) {
      this.currentMode = key
      if (key === 'solar-total') {
        this.moonDist = 5.2
        this.nodalAngle = 0
      } else if (key === 'solar-annular') {
        this.moonDist = 8.0
        this.nodalAngle = 0
      } else if (key === 'lunar-total') {
        this.moonDist = 6.5
        this.nodalAngle = 0
      }
      this.updatePositionsAndShadows()
    },

    onParamInput() {
      this.autoRunning = false
      this.updatePositionsAndShadows()
    },

    togglePlay() {
      this.autoRunning = !this.autoRunning
    },

    toggleShadowCones() {
      this.showShadowCones = !this.showShadowCones
      this.rebuildShadowCones()
    },

    toggleLock() {
      this.locked = !this.locked
      if (this.controls) {
        if (this.locked) {
          this.controls.maxPolarAngle = Math.PI / 2.1
          this.controls.minDistance = 8
          this.controls.maxDistance = 55
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
      this.currentMode = 'solar-total'
      this.moonDist = 5.2
      this.nodalAngle = 0
      this.autoRunning = false
      this.showShadowCones = true
      this.updatePositionsAndShadows()
      this.camera.position.set(0, 14, 24)
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

.ec-panel {
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
  color: #f59e0b;
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
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #e2e8f0;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
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
.chip-name { font-size: 12px; font-weight: 700; }
.chip-note { font-size: 10px; opacity: 0.7; }

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

.shadow-card {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(245, 158, 11, 0.3);
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
.status-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}
.status-badge.occluded {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}
.shadow-grid {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 11px;
}
.sh-item {
  display: flex;
  justify-content: space-between;
  color: #cbd5e1;
}
.sh-label { color: #94a3b8; }

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

.ec-canvas-wrap {
  flex: 1;
  min-height: 480px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.ec-canvas-wrap canvas {
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

.shadow-legend {
  position: absolute;
  bottom: 14px;
  left: 14px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 11px;
  color: #cbd5e1;
  display: flex;
  gap: 12px;
  pointer-events: none;
}
.leg-item { display: flex; align-items: center; gap: 4px; }
.dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.umbra-dot { background: #020617; border: 1px solid #94a3b8; }
.penumbra-dot { background: #38bdf8; }

@media (max-width: 768px) {
  .astro-theme {
    flex-direction: column;
  }
  .ec-panel {
    width: 100%;
  }
  .ec-canvas-wrap {
    min-height: 320px;
  }
}
</style>
