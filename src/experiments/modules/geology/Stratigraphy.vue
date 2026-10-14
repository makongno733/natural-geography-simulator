<template>
  <div class="sg-layout geo-theme">
    <aside class="sg-panel">
      <div class="panel-header">
        <span class="station-tag">⛏️ 野外露头与地层剖面站</span>
        <h3 class="panel-title">地层学定律与相对定年法</h3>
      </div>

      <!-- 地层构造观察模式预设 -->
      <div class="sg-presets">
        <span class="ctrl-subhead">地层学经典原理演示</span>
        <div class="preset-grid">
          <button
            v-for="p in principles"
            :key="p.key"
            :class="['preset-chip', { active: activePrinciple === p.key }]"
            @click="selectPrinciple(p.key)"
          >
            <span class="chip-name">{{ p.name }}</span>
            <span class="chip-sub">{{ p.sub }}</span>
          </button>
        </div>
      </div>

      <!-- 剖面构造与图层开关 -->
      <div class="ctrl-group">
        <div class="ctrl-label-row">
          <span>地质构造关键界面</span>
        </div>
        <div class="checkbox-list">
          <label class="custom-chk">
            <input type="checkbox" v-model="showUnconformity" @change="onParamChange" />
            <span>角度不整合面 (沉积间断侵蚀面)</span>
          </label>
          <label class="custom-chk">
            <input type="checkbox" v-model="showIntrusion" @change="onParamChange" />
            <span>岩浆岩脉穿插侵入体 (穿插切割律)</span>
          </label>
          <label class="custom-chk">
            <input type="checkbox" v-model="showFault" @change="onParamChange" />
            <span>晚期断层错断 (断层晚于被截地层)</span>
          </label>
          <label class="custom-chk">
            <input type="checkbox" v-model="showLabels" @change="onParamChange" />
            <span>三维地层名称与标准化石标注</span>
          </label>
        </div>
      </div>

      <!-- 相对定年推断演化序列 -->
      <div class="dating-card">
        <div class="card-head">
          <span>⏳ 地质历史时序推断 (由老到新)</span>
          <span class="step-badge">7 个历史阶段</span>
        </div>
        <ol class="timeline-steps">
          <li :class="{ active: step >= 1 }">1. 下伏老沉积岩系水平沉积</li>
          <li :class="{ active: step >= 2 }">2. 板块挤压，老岩层发生褶皱倾斜</li>
          <li :class="{ active: step >= 3 }">3. 地壳抬升，遭受长期风化剥蚀 (形成不整合面)</li>
          <li :class="{ active: step >= 4 }">4. 地壳再度沉降，上覆新岩层平行沉积</li>
          <li :class="{ active: step >= 5 }">5. 区域脆性破裂，形成贯穿性正断层</li>
          <li :class="{ active: step >= 6 }">6. 岩浆沿裂隙向上侵入，形成穿插火成岩脉</li>
          <li :class="{ active: step >= 7 }">7. 地表现代风化，出露今日野外地质剖面</li>
        </ol>
      </div>

      <!-- 控制按钮 -->
      <div class="action-row">
        <button
          @click="togglePlay"
          :class="['action-btn', 'play-btn', { playing: autoRunning }]"
        >
          {{ autoRunning ? '⏸ 暂停旋转' : '▶ 环绕剖视' }}
        </button>
        <button
          @click="resetView"
          class="action-btn"
        >
          ↺ 复位正立剖面
        </button>
      </div>

      <button
        @click="toggleGuide"
        :class="['guide-trigger', { active: guideActive }]"
      >
        {{ guideActive ? '⏸ 停止讲解' : '💡 斯泰诺地层三定律探究' }}
      </button>
      <div v-if="guideActive" class="guide-box">{{ guideText }}</div>
      <p class="nav-hint">🖱 拖动旋转空间 · 滚轮缩放 · 双击复位</p>
    </aside>

    <div class="sg-canvas-wrap">
      <canvas ref="cvs"></canvas>
      <div class="view-overlay">
        <span class="overlay-tag">斯泰诺定律 · 野外天然岩壁露头三维模拟</span>
        <button class="lock-btn" @click="toggleLock" :title="locked ? '解锁自由漫游' : '锁定剖面直视'">
          {{ locked ? '🔒 剖面锁定' : '🔓 自由漫游' }}
        </button>
      </div>
      <div class="unconformity-tip" v-if="showUnconformity">
        <span>波浪红色界线：角度不整合面（代表古侵蚀期与漫长时间沉积缺失）</span>
      </div>
    </div>
  </div>

  <ModelPedagogyPanel
    theme="geology"
    :observe="pedagogy.observe"
    :change="pedagogy.change"
    :mechanism="pedagogy.mechanism"
    :limitations="pedagogy.limitations"
    :real-data-lab="{ title: 'Copernicus 喜马拉雅真实露头地层与悬崖剖面', path: '/geo-labs/terrain', desc: '真实高程DEM看地层风化暴露' }"
    :textbook-link="{ grade: '高中', book: '必修第一册', chapter: '第一章', section: '第三节' }"
    practice-link="/practice"
    @reset="resetObservation"
  />
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import ModelPedagogyPanel from '../../components/ModelPedagogyPanel.vue'

export default {
  name: 'Stratigraphy',
  components: {
    ModelPedagogyPanel,
  },
  data() {
    return {
      activePrinciple: 'superposition',
      showUnconformity: true,
      showIntrusion: true,
      showFault: true,
      showLabels: true,
      autoRunning: false,
      locked: true,
      step: 7,
      guideActive: false,
      guideIndex: 0,
      guideText: '',
      principles: [
        { key: 'superposition', name: '叠置原理', sub: '下层老·上层新' },
        { key: 'horizontality', name: '原始水平律', sub: '沉积初呈水平面' },
        { key: 'cross-cutting', name: '穿插切割律', sub: '被切者老·侵入者新' },
        { key: 'unconformity', name: '不整合面', sub: '沉积缺失侵蚀构造' },
      ],
      guideSteps: [
        '【叠置原理】未经剧烈构造倒转的沉积地层中，下部岩层先形成年代更老，上部岩层后形成年代更新！',
        '【原始水平律】沉积物受重力沉降最初呈水平层状，若现在呈倾斜或褶皱，说明沉积后经历了强烈构造挤压！',
        '【不整合面】倾斜老岩层顶部被削平、上方平行覆盖新岩层，该接触面即为“角度不整合面”，代表古隆起侵蚀期！',
        '【穿插切割律】岩浆岩脉侵入切穿了下方岩层，说明岩浆侵入事件必然晚于所有被其切穿的地层！',
      ],
      pedagogy: {
        observe: [
          '下伏倾斜沉积岩层与上覆近水平沉积岩层之间的接触界面（不整合面）。',
          '火成岩脉贯穿多套地层，在接触带发生热接触变质烘烤。',
          '断层穿透下部地层并在不整合面下方截断（说明断裂发生在不整合沉积之前）。',
        ],
        change: [
          '开关“角度不整合面 / 岩浆侵入体 / 晚期断层 / 知识点标注”。',
          '选择叠置原理、原始水平律、穿插切割律、不整合面等经典原理视角。',
        ],
        mechanism: [
          '斯泰诺三大定律是现代地质历史学与地质填图的基石。',
          '相对地质年代测定依据地层的空间几何配置关系（上覆、包裹、侵入、错截）。',
          '结合标准化石演化不可逆性（生物层序律），可实现全球不同大陆地层的高精度等时对比。',
        ],
        limitations: [
          '未模拟强构造带中常见的“倒转褶皱”或逆冲推覆导致的地层老下新上逆转特例。',
          '岩脉冷却结晶收缩缝与接触变质晕圈在此处进行了教学美学简化。',
          '相对定年只能确定早晚先后次序，无法直接测定绝对同位素数字年龄（需结合放射性同位素测年）。',
        ],
      },
    }
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
      this.scene.background = new THREE.Color(0x130e0a)

      this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)
      this.camera.position.set(0, 6, 20)

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

      this.buildStratigraphyBlock()
      this.animate()
    },

    buildStratigraphyBlock() {
      // 1. Lighting
      const light = new THREE.DirectionalLight(0xfff7ed, 3.2)
      light.position.set(12, 22, 14)
      this.scene.add(light)
      this.scene.add(new THREE.AmbientLight(0x451a03, 1.3))

      this.blockGroup = new THREE.Group()
      this.scene.add(this.blockGroup)

      // 2. Lower tilted strata series (tilted at ~18°)
      this.lowerGroup = new THREE.Group()
      this.lowerGroup.rotation.z = THREE.MathUtils.degToRad(-15)
      this.lowerGroup.position.set(-0.5, 1.2, 0)
      this.blockGroup.add(this.lowerGroup)

      const lowerLayers = [
        { y: -1.2, h: 1.2, color: 0x78350f, name: '古生代石灰岩 (最老)' },
        { y: 0.0, h: 1.2, color: 0x57534e, name: '三叶虫页岩层' },
        { y: 1.2, h: 1.2, color: 0xd97706, name: '中生代砂岩层' },
      ]
      lowerLayers.forEach(l => {
        const geo = new THREE.BoxGeometry(16, l.h, 6)
        const mat = new THREE.MeshStandardMaterial({ color: l.color, roughness: 0.85 })
        const m = new THREE.Mesh(geo, mat)
        m.position.y = l.y
        this.lowerGroup.add(m)
      })

      // 3. Unconformity Line
      this.unconformityGroup = new THREE.Group()
      this.blockGroup.add(this.unconformityGroup)

      const unconfGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-7.5, 2.8, 3.05),
        new THREE.Vector3(7.5, 2.8, 3.05),
      ])
      const unconfMat = new THREE.LineDashedMaterial({ color: 0xef4444, dashSize: 0.4, gapSize: 0.2, linewidth: 3 })
      this.unconfLine = new THREE.Line(unconfGeo, unconfMat)
      this.unconformityGroup.add(this.unconfLine)

      // 4. Upper horizontal strata series (above Y = 2.8)
      this.upperGroup = new THREE.Group()
      this.blockGroup.add(this.upperGroup)

      const upperLayers = [
        { y: 3.4, h: 1.2, color: 0xb45309, name: '新生代砾岩层' },
        { y: 4.6, h: 1.2, color: 0xf59e0b, name: '第四纪表土层 (最新)' },
      ]
      upperLayers.forEach(l => {
        const geo = new THREE.BoxGeometry(15, l.h, 6)
        const mat = new THREE.MeshStandardMaterial({ color: l.color, roughness: 0.85 })
        const m = new THREE.Mesh(geo, mat)
        m.position.set(0, l.y, 0)
        this.upperGroup.add(m)
      })

      // 5. Magma Dike intrusion (Cuts through lower and upper layers at an angle)
      this.dikeGroup = new THREE.Group()
      this.blockGroup.add(this.dikeGroup)

      const dikeGeo = new THREE.BoxGeometry(0.9, 7.5, 6.1)
      const dikeMat = new THREE.MeshStandardMaterial({ color: 0x881337, roughness: 0.6, metalness: 0.3 })
      const dike = new THREE.Mesh(dikeGeo, dikeMat)
      dike.rotation.z = THREE.MathUtils.degToRad(25)
      dike.position.set(2.5, 2.8, 0)
      this.dikeGroup.add(dike)

      // 6. Labels Group
      this.labelsGroup = new THREE.Group()
      this.blockGroup.add(this.labelsGroup)

      this.createLabelSprite('④ 第四纪松散沉积 (最新)', 0, 5.3, 3.2, '#fef08a')
      this.createLabelSprite('③ 角度不整合面 (侵蚀中断)', 0, 2.9, 3.2, '#ef4444')
      this.createLabelSprite('② 倾斜褶皱老地层', -3.0, 1.2, 3.2, '#fdba74')
      this.createLabelSprite('⑤ 火成岩脉穿插 (晚期侵入)', 3.8, 3.8, 3.2, '#f43f5e')

      this.updateVisibility()
    },

    createLabelSprite(text, x, y, z, color) {
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 64
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = color
      ctx.font = 'bold 22px "Noto Serif SC", sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, 128, 32)

      const tex = new THREE.CanvasTexture(canvas)
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true })
      const sprite = new THREE.Sprite(mat)
      sprite.position.set(x, y, z)
      sprite.scale.set(3.2, 0.8, 1)
      this.labelsGroup.add(sprite)
    },

    updateVisibility() {
      if (this.unconformityGroup) this.unconformityGroup.visible = this.showUnconformity
      if (this.dikeGroup) this.dikeGroup.visible = this.showIntrusion
      if (this.labelsGroup) this.labelsGroup.visible = this.showLabels
    },

    animate() {
      this.animId = requestAnimationFrame(this.animate)

      if (this.autoRunning && this.blockGroup) {
        this.blockGroup.rotation.y += 0.005
      }

      if (this.controls) this.controls.update()
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera)
      }
    },

    selectPrinciple(key) {
      this.activePrinciple = key
      if (key === 'superposition') {
        this.showLabels = true
        this.showIntrusion = false
        this.showUnconformity = false
      } else if (key === 'cross-cutting') {
        this.showLabels = true
        this.showIntrusion = true
        this.showUnconformity = true
      } else if (key === 'unconformity') {
        this.showLabels = true
        this.showIntrusion = false
        this.showUnconformity = true
      } else {
        this.showLabels = true
        this.showIntrusion = true
        this.showUnconformity = true
      }
      this.updateVisibility()
    },

    onParamChange() {
      this.activePrinciple = ''
      this.updateVisibility()
    },

    togglePlay() {
      this.autoRunning = !this.autoRunning
    },

    resetView() {
      if (this.blockGroup) this.blockGroup.rotation.y = 0
      this.camera.position.set(0, 6, 20)
      this.controls.target.set(0, 2.5, 0)
      this.controls.update()
    },

    toggleLock() {
      this.locked = !this.locked
      if (this.controls) {
        if (this.locked) {
          this.resetView()
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
      this.showUnconformity = true
      this.showIntrusion = true
      this.showFault = true
      this.showLabels = true
      this.activePrinciple = 'superposition'
      this.autoRunning = false
      this.updateVisibility()
      this.resetView()
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

.sg-panel {
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
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}
.preset-chip {
  padding: 8px 6px;
  background: rgba(67, 20, 7, 0.35);
  border: 1px solid rgba(194, 65, 12, 0.3);
  border-radius: 8px;
  color: #e2e8f0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
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
.chip-name { font-size: 11px; font-weight: 700; }
.chip-sub { font-size: 9px; opacity: 0.7; }

.ctrl-group {
  background: rgba(41, 15, 6, 0.4);
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(194, 65, 12, 0.2);
}
.ctrl-label-row {
  font-size: 12px;
  margin-bottom: 8px;
  color: #cbd5e1;
  font-weight: 600;
}
.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.custom-chk {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #cbd5e1;
  cursor: pointer;
}
.custom-chk input {
  accent-color: #c2410c;
}

.dating-card {
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
.step-badge {
  background: rgba(194, 65, 12, 0.25);
  color: #fb923c;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 10px;
}

.timeline-steps {
  margin: 0;
  padding-left: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11px;
  color: #a8a29e;
}
.timeline-steps li.active {
  color: #f8fafc;
  font-weight: 600;
}

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

.sg-canvas-wrap {
  flex: 1;
  min-height: 480px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.sg-canvas-wrap canvas {
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

.unconformity-tip {
  position: absolute;
  bottom: 14px;
  left: 14px;
  right: 14px;
  background: rgba(28, 18, 12, 0.85);
  border: 1px solid rgba(239, 68, 68, 0.5);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 11px;
  color: #fca5a5;
  pointer-events: none;
}

@media (max-width: 768px) {
  .geo-theme {
    flex-direction: column;
  }
  .sg-panel {
    width: 100%;
  }
  .sg-canvas-wrap {
    min-height: 320px;
  }
}
</style>
