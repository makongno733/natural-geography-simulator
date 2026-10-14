<template>
  <div class="fm-layout geo-theme">
    <aside class="fm-panel">
      <div class="panel-header">
        <span class="station-tag">⛰️ 地质力学砂箱构造台</span>
        <h3 class="panel-title">断层构造力学与断块地貌</h3>
      </div>

      <!-- 典型构造应力场景预设 -->
      <div class="fm-presets">
        <span class="ctrl-subhead">地壳应力构造演化</span>
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

      <!-- 构造挤压/拉张连续位移滑块 -->
      <div class="ctrl-group">
        <div class="ctrl-label-row">
          <span>构造应力水平位移</span>
          <span class="val-badge">{{ displacement.toFixed(1) }} cm ({{ stressTypeText }})</span>
        </div>
        <input
          type="range"
          min="-3.5"
          max="3.5"
          step="0.1"
          v-model.number="displacement"
          @input="onParamInput"
          class="geo-slider"
        />
        <div class="angle-ticks">
          <span>-3.5cm 强烈拉张</span>
          <span>0.0cm 初始水平</span>
          <span>+3.5cm 强烈挤压</span>
        </div>
      </div>

      <!-- 断裂构造动力学遥测看板 -->
      <div class="fault-card">
        <div class="card-head">
          <span>📐 构造断裂要素遥测</span>
          <span :class="['fault-badge', faultClass]">{{ faultTypeText }}</span>
        </div>
        <div class="fault-metrics">
          <div class="m-row">
            <span class="m-label">相对滑移：</span>
            <strong>{{ hangingWallText }}</strong>
          </div>
          <div class="m-row">
            <span class="m-label">对应典型地貌：</span>
            <span>{{ landformExampleText }}</span>
          </div>
          <div class="m-row">
            <span class="m-label">真实中国名胜：</span>
            <span class="highlight-geo">{{ chinaGeologyRealCase }}</span>
          </div>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="action-row">
        <button
          @click="togglePlay"
          :class="['action-btn', 'play-btn', { playing: autoRunning }]"
        >
          {{ autoRunning ? '⏸ 暂停应力加载' : '▶ 动态应力加载' }}
        </button>
        <button
          @click="resetDisplacement"
          class="action-btn"
        >
          ↺ 恢复水平初始态
        </button>
      </div>

      <button
        @click="toggleGuide"
        :class="['guide-trigger', { active: guideActive }]"
      >
        {{ guideActive ? '⏸ 停止讲解' : '💡 正断层、逆断层与地堑地垒讲解' }}
      </button>
      <div v-if="guideActive" class="guide-box">{{ guideText }}</div>
      <p class="nav-hint">🖱 拖动旋转岩层 · 滚轮缩放 · 双击居中</p>
    </aside>

    <div class="fm-canvas-wrap">
      <canvas ref="cvs"></canvas>
      <div class="view-overlay">
        <span class="overlay-tag">{{ faultTypeText }}构造截面</span>
        <button class="lock-btn" @click="toggleLock" :title="locked ? '解锁自由漫游' : '锁定正侧面剖视'">
          {{ locked ? '🔒 正侧视锁定' : '🔓 自由漫游' }}
        </button>
      </div>
      <div class="fault-indicators">
        <span class="ind-pill hw">上盘 (断层面斜上方岩块)</span>
        <span class="ind-pill fw">下盘 (断层面斜下方基底)</span>
      </div>
    </div>
  </div>

  <ModelPedagogyPanel
    theme="geology"
    :observe="pedagogy.observe"
    :change="pedagogy.change"
    :mechanism="pedagogy.mechanism"
    :limitations="pedagogy.limitations"
    :real-data-lab="{ title: 'Copernicus 喜马拉雅断裂破碎带高程探勘', path: '/geo-labs/terrain', desc: '真实高程DEM分析青藏断裂抬升' }"
    :textbook-link="{ grade: '高中', book: '选择性必修1', chapter: '第二章', section: '第二节' }"
    practice-link="/practice"
    @reset="resetObservation"
  />
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import ModelPedagogyPanel from '../../components/ModelPedagogyPanel.vue'

export default {
  name: 'FaultModel',
  components: {
    ModelPedagogyPanel,
  },
  data() {
    return {
      displacement: 2.2, // Positive = compression, Negative = extension
      autoRunning: false,
      locked: true,
      currentPresetKey: 'compress',
      guideActive: false,
      guideIndex: 0,
      guideText: '',
      stressDirection: 1,
      presets: [
        { key: 'compress', name: '板块挤压造山', sub: '逆断层·地垒·断块山', disp: 2.5 },
        { key: 'extend', name: '板块拉张裂陷', sub: '正断层·地堑·裂谷盆地', disp: -2.5 },
        { key: 'initial', name: '水平未变形层', sub: '应力未积累基准态', disp: 0.0 },
      ],
      guideSteps: [
        '【上盘与下盘】断层面倾斜时，位于断层面斜上方的岩块称为“上盘”，斜下方的为“下盘”！',
        '【正断层】岩层受水平拉张应力，上盘相对滑落、下盘相对上升，中间下陷形成“地堑”！',
        '【逆断层】岩层受水平挤压应力，上盘逆向沿断层面向上滑冲，两盘相对隆起形成“地垒”！',
        '【典型地貌】地垒常形成陡峻断块山（如华山、泰山、庐山）；地堑常形成平坦低陷盆地（如渭河平原、汾河谷地）！',
      ],
      pedagogy: {
        observe: [
          '断层破裂面倾斜发育，两侧地层颜色层理出现错位不连续。',
          '挤压模式下上盘相对逆势向上滑冲爬升（逆断层）；拉张模式下上盘顺势向下滑落坍塌（正断层）。',
          '断裂带附近岩石受强应力搓揉破碎，易发育成泉眼、地下水出露或沿断裂侵蚀形成的峡谷河道。',
        ],
        change: [
          '连续拖动“水平位移”滑块，观察从拉张正断裂到挤压逆冲断层的形态形变过渡。',
          '一键切换“板块挤压造山 / 板块拉张裂陷 / 水平初始态”。',
        ],
        mechanism: [
          '构造应力（地应力）在岩层中不断积累，当应力值超过岩石极限抗剪/抗张强度时，岩石脆性破裂错动释放能量。',
          '拉张应力驱动产生正断层（重力滑脱占主导，上盘下降）；挤压应力驱动产生逆断层（构造挤压主导，上盘逆冲）。',
          '差异性垂直升降塑造地垒（断块山）与地堑（断陷盆地）的组合构造地貌。',
        ],
        limitations: [
          '模型以均质分层砂箱模拟，自然界岩层存在复杂的岩性流变（塑性褶皱与脆性断层相伴共生）。',
          '未模拟地壳深部高温高压环境下的延性剪切带行为。',
          '未同步模拟断层活动引发的瞬发破坏性地震波波动。',
        ],
      },
    }
  },
  computed: {
    stressTypeText() {
      if (this.displacement > 0.2) return '挤压应力为主'
      if (this.displacement < -0.2) return '拉张应力为主'
      return '无应变基准态'
    },
    faultClass() {
      if (this.displacement > 0.2) return 'reverse-fault'
      if (this.displacement < -0.2) return 'normal-fault'
      return 'neutral-fault'
    },
    faultTypeText() {
      if (this.displacement > 0.2) return '逆断层 (Reverse Fault)'
      if (this.displacement < -0.2) return '正断层 (Normal Fault)'
      return '初始地层 (Undisturbed)'
    },
    hangingWallText() {
      if (this.displacement > 0.2) return '上盘逆向上冲 · 局部地壳缩短增厚'
      if (this.displacement < -0.2) return '上盘顺层滑落 · 局部地壳拉伸减薄'
      return '无相对位移'
    },
    landformExampleText() {
      if (this.displacement > 0.2) return '断块山（地垒）与褶皱逆冲造山带'
      if (this.displacement < -0.2) return '裂谷谷地（地堑）与断陷湖盆'
      return '平坦堆积沉积盆地'
    },
    chinaGeologyRealCase() {
      if (this.displacement > 0.2) return '华山断崖绝壁、泰山地垒隆起'
      if (this.displacement < -0.2) return '渭河断陷平原、东非大裂谷'
      return '原始陆表海沉积平原'
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
      this.scene.background = new THREE.Color(0x130e0a)

      this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)
      this.camera.position.set(0, 8, 22)

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

      this.buildFaultBlocks()
      this.animate()
    },

    buildFaultBlocks() {
      // 1. Lighting
      const light = new THREE.DirectionalLight(0xfff7ed, 3.2)
      light.position.set(10, 20, 15)
      this.scene.add(light)
      this.scene.add(new THREE.AmbientLight(0x451a03, 1.2))

      // 2. Base tray frame
      const trayGeo = new THREE.BoxGeometry(17, 0.6, 7.5)
      const trayMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.9 })
      const tray = new THREE.Mesh(trayGeo, trayMat)
      tray.position.set(0, -0.3, 0)
      this.scene.add(tray)

      // 3. Two Fault Blocks: Left Block (Footwall) and Right Block (Hanging Wall)
      // Fault cut plane passes from (-1.5, 0) to (1.5, 5.0) at ~60° dip
      this.leftBlock = new THREE.Group()
      this.rightBlock = new THREE.Group()
      this.scene.add(this.leftBlock)
      this.scene.add(this.rightBlock)

      // Multi-layer strata colors: Sandstone (gold), Shale (dark grey), Limestone (light beige), Granite (terracotta)
      const strataLayers = [
        { h: 1.2, color: 0x78350f, name: '深部基岩' },
        { h: 1.2, color: 0xd97706, name: '石灰岩层' },
        { h: 1.2, color: 0x57534e, name: '页岩层' },
        { h: 1.2, color: 0xeab308, name: '砂岩表层' },
      ]

      // Build left block layers (footwall, x < 0)
      let curY = 0
      strataLayers.forEach((l) => {
        const geo = new THREE.BoxGeometry(7.5, l.h, 6.0)
        const mat = new THREE.MeshStandardMaterial({ color: l.color, roughness: 0.85 })
        const m = new THREE.Mesh(geo, mat)
        m.position.set(-4.0, curY + l.h / 2, 0)
        this.leftBlock.add(m)
        curY += l.h
      })

      // Build right block layers (hanging wall, x > 0)
      curY = 0
      strataLayers.forEach((l) => {
        const geo = new THREE.BoxGeometry(7.5, l.h, 6.0)
        const mat = new THREE.MeshStandardMaterial({ color: l.color, roughness: 0.85 })
        const m = new THREE.Mesh(geo, mat)
        m.position.set(4.0, curY + l.h / 2, 0)
        this.rightBlock.add(m)
        curY += l.h
      })

      // 4. Fault plane visual dashed line
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.2, 0, 3.1),
        new THREE.Vector3(0.2, 5.5, 3.1),
      ])
      const lineMat = new THREE.LineDashedMaterial({ color: 0xef4444, dashSize: 0.3, gapSize: 0.2 })
      this.faultLine = new THREE.Line(lineGeo, lineMat)
      this.scene.add(this.faultLine)

      this.updateFaultGeometry()
    },

    updateFaultGeometry() {
      if (!this.rightBlock || !this.leftBlock) return
      // Displacement > 0 (compression): Hanging wall moves UP along 60 deg fault plane!
      // Displacement < 0 (extension): Hanging wall moves DOWN along fault plane!
      const disp = this.displacement
      const dipAngle = THREE.MathUtils.degToRad(60)

      // Right block moves along slope:
      const dy = Math.sin(dipAngle) * disp * 0.75
      const dx = Math.cos(dipAngle) * disp * 0.5

      this.rightBlock.position.set(dx, dy, 0)
      // Left block moves slightly opposite
      this.leftBlock.position.set(-dx * 0.2, -dy * 0.2, 0)
    },

    animate() {
      this.animId = requestAnimationFrame(this.animate)

      if (this.autoRunning) {
        this.displacement += 0.03 * this.stressDirection
        if (this.displacement > 3.0) {
          this.stressDirection = -1
        } else if (this.displacement < -3.0) {
          this.stressDirection = 1
        }
        this.updateFaultGeometry()
      }

      if (this.controls) this.controls.update()
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera)
      }
    },

    onParamInput() {
      this.autoRunning = false
      this.currentPresetKey = ''
      this.updateFaultGeometry()
    },

    applyPreset(p) {
      this.autoRunning = false
      this.currentPresetKey = p.key
      this.displacement = p.disp
      this.updateFaultGeometry()
    },

    togglePlay() {
      this.autoRunning = !this.autoRunning
    },

    resetDisplacement() {
      this.displacement = 0
      this.autoRunning = false
      this.currentPresetKey = 'initial'
      this.updateFaultGeometry()
    },

    toggleLock() {
      this.locked = !this.locked
      if (this.controls) {
        if (this.locked) {
          this.camera.position.set(0, 8, 22)
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
      this.displacement = 2.5
      this.autoRunning = false
      this.currentPresetKey = 'compress'
      this.updateFaultGeometry()
      this.camera.position.set(0, 8, 22)
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

.fm-panel {
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

.fault-card {
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
.fault-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 10px;
}
.reverse-fault { background: rgba(239, 68, 68, 0.25); color: #fca5a5; }
.normal-fault { background: rgba(2, 132, 199, 0.25); color: #7dd3fc; }
.neutral-fault { background: rgba(148, 163, 184, 0.2); color: #cbd5e1; }

.fault-metrics {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 11px;
}
.m-row {
  display: flex;
  justify-content: space-between;
  color: #cbd5e1;
}
.m-label { color: #94a3b8; }
.highlight-geo { color: #fdba74; font-weight: 600; }

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

.fm-canvas-wrap {
  flex: 1;
  min-height: 480px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.fm-canvas-wrap canvas {
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

.fault-indicators {
  position: absolute;
  bottom: 14px;
  left: 14px;
  right: 14px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
}
.ind-pill {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}
.hw { background: rgba(245, 158, 11, 0.25); border: 1px solid rgba(245, 158, 11, 0.6); color: #fbbf24; }
.fw { background: rgba(56, 189, 248, 0.25); border: 1px solid rgba(56, 189, 248, 0.6); color: #38bdf8; }

@media (max-width: 768px) {
  .geo-theme {
    flex-direction: column;
  }
  .fm-panel {
    width: 100%;
  }
  .fm-canvas-wrap {
    min-height: 320px;
  }
  .fault-indicators {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
