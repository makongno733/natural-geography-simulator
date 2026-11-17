<template>
  <!-- 分享链接还原提示条（当通过公开分享链接在新会话打开时展示） -->
  <div v-if="isSharedSession" class="sm-shared-banner" role="status" aria-live="polite">
    <div class="sm-shared-head">
      <span class="sm-shared-pill">🔗 已从分享链接还原同一次 3D 太阳视运动对照</span>
      <span class="sm-sim-pill">教学仿真，非现场实测</span>
    </div>
    <p>
      已还原观测地 <strong>{{ activePlace || `${latitude}°` }}（{{ latitude }}°{{ latitude >= 0 ? 'N' : 'S' }}）</strong>，并排对比
      <strong>「{{ seasonAObj.name }}（正午 H = {{ metricsA.noonH }}°）」</strong>与
      <strong>「{{ seasonBObj.name }}（正午 H = {{ metricsB.noonH }}°）」</strong>，视角已对齐至
      <strong>{{ activeCameraLabel }}</strong>。
    </p>
  </div>

  <div class="sm-layout astro-theme">
    <aside class="sm-panel">
      <div class="panel-header">
        <span class="station-tag">🧭 地平天球与日晷观测台 · 教学仿真</span>
        <h3 class="panel-title">太阳周日视运动与高度角对照</h3>
      </div>

      <!-- 1. 固定观测地纬度 -->
      <div class="lat-presets">
        <span class="ctrl-subhead">① 固定观测地纬度 φ</span>
        <div class="preset-grid">
          <button
            v-for="p in presetPlaces"
            :key="p.name"
            type="button"
            :class="['preset-chip', { active: activePlace === p.name }]"
            @click="applyPlace(p)"
          >
            <span class="chip-name">{{ p.name }}</span>
            <span class="chip-val">{{ Math.abs(p.lat) }}°{{ p.lat >= 0 ? 'N' : 'S' }}</span>
          </button>
        </div>
      </div>

      <div class="ctrl-group">
        <div class="ctrl-label-row">
          <span>观测点地理纬度 φ</span>
          <span class="val-badge">{{ latitude }}°{{ latitude >= 0 ? 'N' : 'S' }}</span>
        </div>
        <input
          type="range"
          min="-90"
          max="90"
          step="1"
          v-model.number="latitude"
          @input="onParamInput"
          class="astro-slider"
          aria-label="调节观测点地理纬度"
        />
        <div class="angle-ticks">
          <span>90°S 南极</span>
          <span>0° 赤道</span>
          <span>40°N 北京</span>
          <span>90°N 北极</span>
        </div>
      </div>

      <!-- 2. 切换两个对比节气条件 -->
      <div class="ctrl-group">
        <div class="ctrl-label-row">
          <span>② 切换节气条件 (太阳赤纬 δ)</span>
          <span class="val-badge">{{ currentSeasonData.name }} ({{ currentSeasonData.declination }}°)</span>
        </div>
        <div class="season-chips">
          <button
            v-for="s in seasons"
            :key="s.key"
            type="button"
            :class="['season-chip', { active: seasonKey === s.key }]"
            @click="selectSeason(s.key)"
          >
            {{ s.name }}
          </button>
        </div>
        <label class="compare-toggle-row">
          <input type="checkbox" v-model="showDualCompare" @change="rebuildSolarPath" />
          <span>在 3D 天球中同屏保留「{{ compareSeasonObj.name }}」对照轨迹与正午光线</span>
        </label>
      </div>

      <!-- 3. 并排对照定量遥测卡 -->
      <div class="sundial-card">
        <div class="card-head">
          <span>☀️ 当前条件 vs 对照条件读数</span>
          <span class="alt-badge">正午 H 差值: {{ altitudeDiff }}°</span>
        </div>
        <div class="sundial-grid">
          <div class="sun-item">
            <span class="s-label">当前正午高度 H：</span>
            <strong class="text-gold">{{ noonAltitude.toFixed(1) }}° ({{ currentSeasonData.name }})</strong>
          </div>
          <div class="sun-item">
            <span class="s-label">对照正午高度 H：</span>
            <strong class="text-sky">{{ compareSeasonMetrics.noonH }}° ({{ compareSeasonObj.name }})</strong>
          </div>
          <div class="sun-item">
            <span class="s-label">日出 / 日落方位：</span>
            <strong>{{ sunriseAzimuthText }} / {{ sunsetAzimuthText }}</strong>
          </div>
          <div class="sun-item">
            <span class="s-label">2.5m 立竿正午影长：</span>
            <strong>{{ currentNoonShadowM }} m（{{ shadowDirectionText }}）</strong>
          </div>
          <div class="sun-item">
            <span class="s-label">昼长估计：</span>
            <strong>{{ daylengthEstimateText }}（对照 {{ compareSeasonMetrics.daylength }}h）</strong>
          </div>
        </div>
      </div>

      <!-- 控制操作 -->
      <div class="action-row">
        <button
          type="button"
          @click="togglePlay"
          :class="['action-btn', 'play-btn', { playing: autoRunning }]"
        >
          {{ autoRunning ? '⏸ 暂停周日运动' : '▶ 演示周日运转' }}
        </button>
        <button
          type="button"
          @click="resetTime"
          class="action-btn"
        >
          🕛 对齐正午 (读高度角 H)
        </button>
      </div>

      <button
        type="button"
        @click="toggleGuide"
        :class="['guide-trigger', { active: guideActive }]"
      >
        {{ guideActive ? '⏸ 停止讲解' : '💡 正午高度与视运动规律讲解' }}
      </button>
      <div v-if="guideActive" class="guide-box">{{ guideText }}</div>
      <p class="nav-hint">🖱 可点按画布上方视角按钮或拖动旋转 · 滚轮缩放</p>
    </aside>

    <!-- 右侧/上方 3D 画布（保证画布、一键视角切换、节气切换与关键读数处于同一视野） -->
    <div ref="wrapRef" class="sm-canvas-wrap">
      <canvas ref="cvs"></canvas>

      <!-- 顶部视角与状态栏：提供无需拖拽即可直达关键观察角度的点按方式 -->
      <div class="view-overlay">
        <div class="sm-camera-bar" role="group" aria-label="关键观察视角一键切换">
          <button
            type="button"
            :class="['cam-preset-btn', { active: cameraPreset === 'meridian' }]"
            @click="setCameraView('meridian')"
          >
            📐 正午子午面正视（读高度角 H）
          </button>
          <button
            type="button"
            :class="['cam-preset-btn', { active: cameraPreset === 'horizon' }]"
            @click="setCameraView('horizon')"
          >
            🧭 地平俯视（读升落方位）
          </button>
          <button
            type="button"
            :class="['cam-preset-btn', { active: cameraPreset === '3d' }]"
            @click="setCameraView('3d')"
          >
            🌐 三维全景
          </button>
        </div>

        <button type="button" class="lock-btn" @click="toggleLock" :title="locked ? '解锁自由旋转' : '锁定视角'">
          {{ locked ? '🔒 轴线锁定' : '🔓 自由旋转' }}
        </button>
      </div>

      <!-- 画布底部同视野对照读数与一键条件切换条（手机和桌面均无需上下翻找即可同时看到模型与读数变化） -->
      <div class="sm-compare-hud" role="region" aria-label="正午太阳高度与节气同屏对照读数">
        <button
          type="button"
          :class="['hud-season-pill', 'pill-summer', { active: seasonKey === 'summer' }]"
          @click="selectSeason('summer')"
        >
          <span class="pill-title">☀️ 条件 A：夏至 (δ=+23.4°)</span>
          <strong class="pill-val">正午 H = {{ metricsA.noonH }}° · 昼长 {{ metricsA.daylength }}h · 影长 {{ metricsA.shadowM }}m</strong>
        </button>

        <div class="hud-diff-center">
          <span class="diff-kicker">{{ activePlace || `${latitude}°` }} ({{ latitude }}°{{ latitude >= 0 ? 'N' : 'S' }}) · 同屏对照</span>
          <strong class="diff-readout">
            正午高度差 ΔH = {{ altitudeDiff }}° · {{ currentSeasonData.name }} {{ sunriseAzimuthText }}
          </strong>
        </div>

        <button
          type="button"
          :class="['hud-season-pill', 'pill-winter', { active: seasonKey === 'winter' }]"
          @click="selectSeason('winter')"
        >
          <span class="pill-title">❄️ 条件 B：冬至 (δ=-23.4°)</span>
          <strong class="pill-val">正午 H = {{ metricsB.noonH }}° · 昼长 {{ metricsB.daylength }}h · 影长 {{ metricsB.shadowM }}m</strong>
        </button>
      </div>
    </div>
  </div>

  <!-- 3D 对照 → 证据卡预览 → 分享与社区讨论工作台 -->
  <section class="sm-evidence-workbench" aria-labelledby="sm-evidence-title">
    <div class="sme-top">
      <div>
        <span class="sme-kicker">📊 3D 对照 → 科学证据卡 → 社区讨论（教学仿真，非现场实测）</span>
        <h3 id="sm-evidence-title">把刚才观察到的「{{ seasonAObj.name }} vs {{ seasonBObj.name }}」正午高度与影长对照生成证据卡</h3>
      </div>
      <button type="button" class="sme-fill-btn" @click="fillDefaultClaim">
        ✨ 填入当前纬度对照结论
      </button>
    </div>

    <div class="sme-claim-row">
      <label class="sr-only" for="sm-claim-input">一句话科学观察解释</label>
      <input
        id="sm-claim-input"
        v-model="studentClaim"
        type="text"
        maxlength="240"
        :placeholder="`例如：固定 ${activePlace || latitude + '°'}（${latitude}°N），夏至正午太阳高度 ${metricsA.noonH}° 高于冬至 ${metricsB.noonH}°，冬至正午北向竿影最长（${metricsB.shadowM}m）。`"
      />
      <button type="button" class="sme-preview-btn" @click="showEvidenceCard = true">
        📋 预览 3D 对照证据卡
      </button>
      <router-link :to="communityDiscussRoute" class="sme-discuss-btn">
        💬 带着这张证据卡去社区讨论 ↗
      </router-link>
    </div>

    <div v-if="showEvidenceCard" id="solar-evidence-card" class="sme-card-preview" role="region" aria-label="3D太阳视运动对照证据卡">
      <div class="sme-card-head">
        <div class="sme-badges">
          <span class="sme-badge-primary">📐 3D 地球运动对照证据卡</span>
          <span class="sme-badge-sim">教学仿真，非现场实测</span>
        </div>
        <span class="sme-copy-hint">{{ shareCopyHint || '✓ 可复制链接在新浏览器会话还原同一对照角度与参数' }}</span>
      </div>

      <h4 class="sme-card-title">{{ evidenceCard.title }}</h4>

      <dl class="sme-meta-grid">
        <div>
          <dt>实验与模型名称</dt>
          <dd>{{ evidenceCard.modelName }}</dd>
        </div>
        <div>
          <dt>证据类型与来源</dt>
          <dd>{{ evidenceCard.evidenceType }}（{{ evidenceCard.disclaimer }}）</dd>
        </div>
        <div>
          <dt>条件 A（{{ seasonAObj.name }} · δ={{ seasonAObj.declination }}°）</dt>
          <dd>
            正午太阳高度 <strong>H = {{ metricsA.noonH }}°</strong> ·
            昼长 <strong>{{ metricsA.daylength }} 小时</strong> ·
            2.5m 立竿正午影长 <strong>{{ metricsA.shadowM }} m</strong>（{{ metricsA.sunrise }}）
          </dd>
        </div>
        <div>
          <dt>条件 B（{{ seasonBObj.name }} · δ={{ seasonBObj.declination }}°）</dt>
          <dd>
            正午太阳高度 <strong>H = {{ metricsB.noonH }}°</strong> ·
            昼长 <strong>{{ metricsB.daylength }} 小时</strong> ·
            2.5m 立竿正午影长 <strong>{{ metricsB.shadowM }} m</strong>（{{ metricsB.sunrise }}）
          </dd>
        </div>
        <div class="full-span">
          <dt>我的观察与解释</dt>
          <dd>{{ effectiveClaim }}</dd>
        </div>
        <div class="full-span sme-limit-box">
          <dt>模型简化与适用边界</dt>
          <dd>{{ evidenceCard.limitations }}</dd>
        </div>
      </dl>

      <div class="sme-share-bar">
        <label for="sm-share-url" class="sme-share-label">可复现公开分享链接（不含私人草稿，新会话打开自动对齐正午子午面视角）：</label>
        <div class="sme-share-controls">
          <input
            id="sm-share-url"
            :value="shareFullUrl"
            readonly
            class="sme-share-input"
            aria-label="3D太阳视运动对照分享链接"
            @focus="$event.target.select()"
          />
          <button type="button" class="sme-copy-btn" @click="copyShareLink">
            {{ shareCopyHint ? '✓ 已复制分享链接' : '🔗 复制分享链接' }}
          </button>
          <router-link :to="communityDiscussRoute" class="sme-discuss-btn">
            💬 带着证据卡去社区发帖 ↗
          </router-link>
        </div>
      </div>
    </div>
  </section>

  <ModelPedagogyPanel
    theme="astronomy"
    :observe="pedagogy.observe"
    :change="pedagogy.change"
    :mechanism="pedagogy.mechanism"
    :limitations="pedagogy.limitations"
    :real-data-lab="{ title: '珠峰地区太阳高度角与山地阴影', path: '/geo-labs/terrain', desc: '真实高程DEM光照模拟' }"
    :textbook-link="{ grade: '高中', book: '选择性必修1', chapter: '第一章', section: '第二节' }"
    practice-link="/practice"
    @reset="resetObservation"
  />
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { SceneActivity } from '../../../engine/core/SceneActivity.js'
import ModelPedagogyPanel from '../../components/ModelPedagogyPanel.vue'

const SEASONS = [
  { key: 'summer', name: '夏至', declination: 23.44 },
  { key: 'spring', name: '春分/秋分', declination: 0.0 },
  { key: 'winter', name: '冬至', declination: -23.44 },
]

function computeSeasonMetrics(latDeg, seasonObj) {
  const dec = seasonObj.declination
  const noonH = Math.max(0, Math.min(90, 90 - Math.abs(latDeg - dec)))
  const phi = THREE.MathUtils.degToRad(latDeg)
  const delta = THREE.MathUtils.degToRad(dec)
  const cosH = -Math.tan(phi) * Math.tan(delta)
  let daylength = 12.0
  if (cosH <= -1) daylength = 24.0
  else if (cosH >= 1) daylength = 0.0
  else daylength = (Math.acos(cosH) * 24) / Math.PI

  const gnomonH = 2.5
  const hRad = THREE.MathUtils.degToRad(noonH)
  const shadowM = noonH <= 0.5 ? '极夜无影' : Math.min(12.0, gnomonH / Math.tan(Math.max(0.05, hRad))).toFixed(2)

  let sunrise = '正东升 / 正西落'
  if (Math.abs(latDeg) > 66.5 && Math.sign(latDeg) === Math.sign(dec)) sunrise = '极昼不落'
  else if (Math.abs(latDeg) > 66.5 && Math.sign(latDeg) !== Math.sign(dec)) sunrise = '极夜不出'
  else if (dec > 0.5) sunrise = '东北升 / 西北落'
  else if (dec < -0.5) sunrise = '东南升 / 西南落'

  return {
    noonH: noonH.toFixed(1),
    daylength: daylength.toFixed(1),
    shadowM,
    sunrise
  }
}

export default {
  name: 'SolarMotion',
  components: {
    ModelPedagogyPanel,
  },
  props: {
    preset: { type: Object, default: () => ({}) },
    lessonContext: { type: Object, default: () => null },
  },
  data() {
    return {
      latitude: 40,
      seasonKey: 'summer',
      compareSeasonKey: 'winter',
      showDualCompare: true,
      activePlace: '北京',
      // 0 deg = 正午真太阳时 (cos(0) = +1)，确保进场即看清正午太阳高度角 H 与竿影
      timeOfDayDeg: 0,
      autoRunning: false,
      locked: true,
      cameraPreset: 'meridian',
      guideActive: false,
      guideIndex: 0,
      guideText: '',
      studentClaim: '',
      showEvidenceCard: true,
      isSharedSession: false,
      shareCopyHint: '',
      presetPlaces: [
        { name: '赤道', lat: 0 },
        { name: '广州', lat: 23.1 },
        { name: '北京', lat: 40.0 },
        { name: '漠河', lat: 53.5 },
        { name: '北极点', lat: 90 },
        { name: '悉尼', lat: -33.9 },
      ],
      seasons: SEASONS,
      guideSteps: [
        '【正午太阳高度公式】H = 90° - |φ - δ|（φ为当地纬度，δ为当日太阳赤纬）！',
        '【视运动倾斜度】北半球纬度越高，太阳视运动周日圈越向南倾斜，天顶距越大！',
        '【升落方位规律】太阳直射北半球时全球各地东北升、西北落；直射赤道时正东升、正西落！',
        '【日晷竿影长短】正午时太阳高度角最大，立杆影子最短；夏至最短、冬至最长！',
      ],
      pedagogy: {
        observe: [
          '在「📐 正午子午面正视」视角下，同屏对比夏至日（橙金弧）与冬至日（天蓝弧）的正午太阳高度角 H（北京 40°N 为 73.4° vs 26.6°）。',
          '观察正午太阳位于正南方时，中央 2.5m 立竿投向正北方的影子长度变化（夏至 0.74m vs 冬至 5.00m）。',
          '切换到「🧭 地平俯视」视角，观察夏至东北升/西北落与冬至东南升/西南落的方位差异。',
        ],
        change: [
          '点击画布底部或左侧的「☀️ 夏至」与「❄️ 冬至」按钮，观察正午光线倾角与竿影同步伸缩。',
          '切换赤道、广州、北京、北极点等纬度预设，验证纬度差越大、正午太阳高度角越小。',
          '开启「▶ 演示周日运转」或点击「🕛 对齐正午」，观察全天太阳轨迹与正午极值。',
        ],
        mechanism: [
          '太阳周日视运动是地球自西向东自转的直接视反应（天球自东向西相对运转）。',
          '正午太阳高度角取决于观测地纬度 φ 与太阳直射点纬度 δ 的差值（H = 90° - |φ - δ|）。',
          '升落方位角与昼夜弧长由地平圈与太阳赤纬圈的空间交线决定。',
        ],
        limitations: [
          '忽略了大气折射对近地平线太阳视高度的抬升（地平线上约抬升 34′，使实际日出提前、日落推迟）。',
          '假定观测地为平坦无遮挡开阔地平圈（未考虑山峦与城市建筑物遮挡）。',
          '忽略了真太阳时与平太阳时之间的“均时差”（Equation of Time）。',
        ],
      },
    }
  },
  computed: {
    currentSeasonData() {
      return SEASONS.find(s => s.key === this.seasonKey) || SEASONS[0]
    },
    compareSeasonObj() {
      const targetKey = this.seasonKey === 'summer' ? 'winter' : 'summer'
      return SEASONS.find(s => s.key === targetKey) || SEASONS[2]
    },
    seasonAObj() {
      return SEASONS[0] // 夏至
    },
    seasonBObj() {
      return SEASONS[2] // 冬至
    },
    metricsA() {
      return computeSeasonMetrics(this.latitude, this.seasonAObj)
    },
    metricsB() {
      return computeSeasonMetrics(this.latitude, this.seasonBObj)
    },
    compareSeasonMetrics() {
      return computeSeasonMetrics(this.latitude, this.compareSeasonObj)
    },
    noonAltitude() {
      const lat = this.latitude
      const dec = this.currentSeasonData.declination
      const h = 90 - Math.abs(lat - dec)
      return Math.max(0, Math.min(90, h))
    },
    altitudeDiff() {
      return Math.abs(Number(this.metricsA.noonH) - Number(this.metricsB.noonH)).toFixed(1)
    },
    currentNoonShadowM() {
      return computeSeasonMetrics(this.latitude, this.currentSeasonData).shadowM
    },
    activeCameraLabel() {
      if (this.cameraPreset === 'meridian') return '正午子午面正视（读高度角 H）'
      if (this.cameraPreset === 'horizon') return '地平俯视（读升落方位）'
      return '三维天球全景'
    },
    sunriseAzimuthText() {
      const dec = this.currentSeasonData.declination
      if (Math.abs(this.latitude) > 66.5 && Math.sign(this.latitude) === Math.sign(dec)) {
        return '极昼无日落/日出'
      }
      if (Math.abs(this.latitude) > 66.5 && Math.sign(this.latitude) !== Math.sign(dec)) {
        return '极夜无日出'
      }
      if (dec > 0.5) return '东北升起'
      if (dec < -0.5) return '东南升起'
      return '正东升起 (90°)'
    },
    sunsetAzimuthText() {
      const dec = this.currentSeasonData.declination
      if (Math.abs(this.latitude) > 66.5 && Math.sign(this.latitude) === Math.sign(dec)) {
        return '极昼不落'
      }
      if (Math.abs(this.latitude) > 66.5 && Math.sign(this.latitude) !== Math.sign(dec)) {
        return '极夜无日落'
      }
      if (dec > 0.5) return '西北落下'
      if (dec < -0.5) return '西南落下'
      return '正西落下 (270°)'
    },
    shadowDirectionText() {
      const lat = this.latitude
      const dec = this.currentSeasonData.declination
      if (lat > dec) return '影子指向正北'
      if (lat < dec) return '影子指向正南'
      return '直射头顶（无影）'
    },
    daylengthEstimateText() {
      const m = computeSeasonMetrics(this.latitude, this.currentSeasonData)
      return `约 ${m.daylength} 小时`
    },
    defaultClaimText() {
      const placeLabel = this.activePlace ? `${this.activePlace}（${this.latitude}°${this.latitude >= 0 ? 'N' : 'S'}）` : `${this.latitude}°${this.latitude >= 0 ? 'N' : 'S'}`
      return `固定观测地 ${placeLabel}：夏至日（δ=+23.4°）正午太阳高度角 H = ${this.metricsA.noonH}°，2.5m 立竿正午影长 ${this.metricsA.shadowM}m，昼长 ${this.metricsA.daylength}h；切换至冬至日（δ=-23.4°）后，正午太阳高度角降至 ${this.metricsB.noonH}°（相差 ${this.altitudeDiff}°），正午影长拉长至 ${this.metricsB.shadowM}m，昼长缩短至 ${this.metricsB.daylength}h。`
    },
    effectiveClaim() {
      return (this.studentClaim && this.studentClaim.trim()) ? this.studentClaim.trim() : this.defaultClaimText
    },
    shareRelativeRoute() {
      const params = new URLSearchParams({
        preset: this.preset?.id || 'default',
        lat: String(this.latitude),
        place: this.activePlace || '',
        season: this.seasonKey,
        compare: 'winter',
        view: this.cameraPreset || 'meridian',
        claim: this.effectiveClaim,
        shared: '1'
      })
      if (this.lessonContext?.grade) {
        params.set('grade', this.lessonContext.grade)
        params.set('book', this.lessonContext.book)
        params.set('chapter', this.lessonContext.chapter)
        params.set('section', this.lessonContext.section)
      }
      return `/experiments/astronomy/solar-motion?${params.toString()}`
    },
    shareFullUrl() {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://geo.kongnoma279.com'
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '/'
      return `${origin}${pathname}#${this.shareRelativeRoute}`
    },
    evidenceCard() {
      const placeLabel = this.activePlace ? `${this.activePlace}（${this.latitude}°${this.latitude >= 0 ? 'N' : 'S'}）` : `${this.latitude}°${this.latitude >= 0 ? 'N' : 'S'}`
      return {
        id: 'ev-solar-motion-solstice',
        title: `同纬度（${placeLabel}）夏至与冬至正午太阳高度角 H、昼长与竿影长度 3D 对照证据`,
        modelName: '地平天球太阳视运动与正午太阳高度 3D 几何模型（H = 90° - |φ - δ|）',
        evidenceType: '三维天球几何模型对照（教学仿真，非现场实测）',
        disclaimer: '教学仿真，非现场实测',
        conditions: `固定观测地：${placeLabel} · 观察视角：${this.activeCameraLabel} · 条件 A：夏至（δ=+23.4°）vs 条件 B：冬至（δ=-23.4°）`,
        facts: `【教学仿真，非现场实测】${this.effectiveClaim}`,
        limitations: '适用边界：基于球面天文几何公式（H = 90° - |φ - δ|）计算，未计入大气折射对日出日落视高度的抬升（约 34′）及真实地形遮挡。'
      }
    },
    communityDiscussRoute() {
      const placeLabel = this.activePlace ? `${this.activePlace}（${this.latitude}°${this.latitude >= 0 ? 'N' : 'S'}）` : `${this.latitude}°${this.latitude >= 0 ? 'N' : 'S'}`
      return {
        path: '/community',
        query: {
          compose: '1',
          kind: 'discussion',
          linkedExperiment: 'solar-motion',
          evidenceId: 'ev-solar-motion-solstice',
          compareUrl: this.shareRelativeRoute,
          evidenceTitle: this.evidenceCard.title,
          conditions: this.evidenceCard.conditions,
          facts: this.evidenceCard.facts,
          title: `【3D 太阳视运动对照】${placeLabel} 夏至（H=${this.metricsA.noonH}°）与冬至（H=${this.metricsB.noonH}°）正午高度与影长观察`,
          body:
            `我在「太阳周日视运动与高度角 3D 实验室」中完成了同纬度二至日对照观察（**教学仿真，非现场实测**）：\n\n` +
            `- **固定观测条件**：${placeLabel}，正午真太阳时（12:00），子午面正视观察角\n` +
            `- **条件 A（夏至 δ=+23.4°）**：正午太阳高度 $H = ${this.metricsA.noonH}^\\circ$，昼长约 ${this.metricsA.daylength} 小时，2.5m 立竿正午影长 ${this.metricsA.shadowM} m（${this.metricsA.sunrise}）\n` +
            `- **条件 B（冬至 δ=-23.4°）**：正午太阳高度 $H = ${this.metricsB.noonH}^\\circ$，昼长约 ${this.metricsB.daylength} 小时，2.5m 立竿正午影长 ${this.metricsB.shadowM} m（${this.metricsB.sunrise}）\n` +
            `- **我的观察结论**：${this.effectiveClaim}\n` +
            `- **可复现 3D 对照链接**：${this.shareRelativeRoute}\n` +
            `- **延伸讨论问题**：如果观测地进一步向高纬移动到漠河（53.5°N），冬至日正午太阳高度和楼间距系数会如何变化？`
        }
      }
    }
  },
  mounted() {
    this.initFromQuery()
    this.initScene()
    window.addEventListener('resize', this.onResize)
  },
  beforeUnmount() {
    this.disposeScene()
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    initFromQuery() {
      const q = this.$route?.query || {}
      if (q.lat !== undefined) {
        const parsedLat = Number(q.lat)
        if (!Number.isNaN(parsedLat) && parsedLat >= -90 && parsedLat <= 90) {
          this.latitude = parsedLat
        }
      }
      if (typeof q.place === 'string') {
        this.activePlace = q.place
      }
      if (typeof q.season === 'string' && SEASONS.some(s => s.key === q.season)) {
        this.seasonKey = q.season
      }
      if (typeof q.view === 'string' && ['meridian', 'horizon', '3d'].includes(q.view)) {
        this.cameraPreset = q.view
      }
      if (typeof q.claim === 'string' && q.claim.trim()) {
        this.studentClaim = q.claim.trim()
      } else {
        this.studentClaim = this.defaultClaimText
      }
      if (q.shared === '1') {
        this.isSharedSession = true
        this.showEvidenceCard = true
      }
    },

    fillDefaultClaim() {
      this.studentClaim = this.defaultClaimText
      this.showEvidenceCard = true
    },

    async copyShareLink() {
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(this.shareFullUrl)
        }
        this.shareCopyHint = '✓ 已复制分享链接，可在新浏览器会话直接还原同一次 3D 对照'
      } catch {
        this.shareCopyHint = '✓ 请直接选中上方链接复制'
      }
    },

    initScene() {
      const canvas = this.$refs.cvs
      const wrap = this.$refs.wrapRef || canvas?.parentElement || canvas
      if (!canvas || !wrap) return
      // 关键：保证手机端单指纵向滑过画布时能够顺畅滚动页面
      canvas.style.touchAction = 'pan-y'

      const rect = wrap.getBoundingClientRect()
      const w = Math.max(300, rect.width || 640)
      const h = Math.max(320, rect.height || 460)

      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color(0x060b18)

      this.camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 1000)

      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
      this.renderer.setSize(w, h)
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      this.renderer.shadowMap.enabled = true

      this.controls = new OrbitControls(this.camera, canvas)
      // OrbitControls 默认会将 touchAction 设为 'none'，在此显式恢复为 'pan-y' 以保障手机纵向顺畅滚屏
      canvas.style.touchAction = 'pan-y'
      this.controls.enableDamping = true
      this.controls.dampingFactor = 0.06
      if (this.locked) {
        this.controls.maxPolarAngle = Math.PI / 2.02
        this.controls.minDistance = 8
        this.controls.maxDistance = 50
      }

      this.buildDomeEnvironment()
      this.setCameraView(this.cameraPreset || 'meridian')

      // ResizeObserver 保证容器尺寸变化或移动端横竖屏切换时画布 100% 贴合无黑边
      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => this.onResize())
        this.resizeObserver.observe(wrap)
      }

      // SceneActivity 保证滚出视口或切到后台时自动暂停持续渲染
      this.sceneActivity = new SceneActivity(wrap, {
        onChange: (active) => {
          if (active) this.startLoop()
          else this.stopLoop()
        }
      })
      this.startLoop()
    },

    setCameraView(presetName) {
      this.cameraPreset = presetName
      if (!this.camera || !this.controls) return
      if (presetName === 'meridian') {
        // 正午子午面正视（从西向东平视南北子午线）：最容易读出正午太阳高度角 H 与北向竿影长度
        this.camera.position.set(-20.5, 4.2, 0)
        this.controls.target.set(0, 3.0, 0)
      } else if (presetName === 'horizon') {
        // 地平俯视：最容易读出东北/东南日出与西北/西南日落方位角
        this.camera.position.set(0, 23.5, 3.5)
        this.controls.target.set(0, 0, 0)
      } else {
        // 三维全景
        this.camera.position.set(-14.5, 11.5, 14.5)
        this.controls.target.set(0, 2.2, 0)
      }
      this.controls.update()
      this.renderOnce()
    },

    buildDomeEnvironment() {
      // 1. Stars background
      const starCount = 240
      const starGeo = new THREE.BufferGeometry()
      const starPos = new Float32Array(starCount * 3)
      for (let i = 0; i < starCount * 3; i += 3) {
        starPos[i] = (Math.random() - 0.5) * 120
        starPos[i + 1] = Math.random() * 60
        starPos[i + 2] = (Math.random() - 0.5) * 120
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
      this.scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x64748b, size: 0.28 })))

      // 2. Horizon ground disk & compass
      const groundGeo = new THREE.CylinderGeometry(8.5, 8.5, 0.2, 48)
      const groundMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 })
      const ground = new THREE.Mesh(groundGeo, groundMat)
      ground.position.y = -0.1
      ground.receiveShadow = true
      this.scene.add(ground)

      // 南北子午基准线（方便读取正午高度角 H 与正北竿影）
      const meridianGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.03, -8.5),
        new THREE.Vector3(0, 0.03, 8.5)
      ])
      this.scene.add(new THREE.Line(meridianGeo, new THREE.LineBasicMaterial({ color: 0x475569 })))

      // Compass Ring
      const ringGeo = new THREE.RingGeometry(8.4, 8.6, 64)
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = Math.PI / 2
      this.scene.add(ring)

      // Cardinal direction indicators (N: +Z, S: -Z, E: +X, W: -X)
      this.addTextMarker('北 (N · 竿影朝向)', 0, 0.1, 9.4, '#38bdf8', 220, 3.2)
      this.addTextMarker('南 (S · 正午太阳)', 0, 0.1, -9.4, '#f43f5e', 220, 3.2)
      this.addTextMarker('东 (E)', 9.3, 0.1, 0, '#10b981', 140, 2.0)
      this.addTextMarker('西 (W)', -9.3, 0.1, 0, '#fbbf24', 140, 2.0)

      // 3. Central Gnomon (2.5m 立竿)
      const gnomonGeo = new THREE.CylinderGeometry(0.1, 0.1, 2.5, 16)
      const gnomonMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.6 })
      const gnomon = new THREE.Mesh(gnomonGeo, gnomonMat)
      gnomon.position.y = 1.25
      gnomon.castShadow = true
      this.scene.add(gnomon)

      // 4. Gnomon Shadow line on ground (明亮高对比色标示影长)
      const shadowGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.05, 0),
        new THREE.Vector3(0, 0.05, 0),
      ])
      const shadowMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 4 })
      this.shadowLine = new THREE.Line(shadowGeo, shadowMat)
      this.scene.add(this.shadowLine)

      // 5. Celestial Sphere Dome (transparent wireframe)
      const domeGeo = new THREE.SphereGeometry(8.5, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2)
      const domeMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.1,
      })
      this.scene.add(new THREE.Mesh(domeGeo, domeMat))

      // 6. Solar path & angle arc group
      this.pathGroup = new THREE.Group()
      this.scene.add(this.pathGroup)

      // 7. Sun mesh
      const sunGeo = new THREE.SphereGeometry(0.62, 24, 24)
      const sunMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
      this.sunMesh = new THREE.Mesh(sunGeo, sunMat)
      this.scene.add(this.sunMesh)

      // Sun directional light
      this.sunLight = new THREE.DirectionalLight(0xffedd5, 3.0)
      this.sunLight.castShadow = true
      this.scene.add(this.sunLight)
      this.scene.add(new THREE.AmbientLight(0x334155, 1.1))

      this.rebuildSolarPath()
    },

    addTextMarker(text, x, y, z, color, width = 160, scaleX = 2.4, targetGroup = null) {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = 64
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = 'rgba(6, 11, 24, 0.78)'
      ctx.fillRect(4, 8, width - 8, 48)
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.strokeRect(4, 8, width - 8, 48)
      ctx.fillStyle = color
      ctx.font = 'bold 24px "Noto Serif SC", sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, width / 2, 32)

      const tex = new THREE.CanvasTexture(canvas)
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })
      const sprite = new THREE.Sprite(mat)
      sprite.position.set(x, y + 0.3, z)
      sprite.scale.set(scaleX, 0.88, 1)
      ;(targetGroup || this.scene).add(sprite)
    },

    buildDiurnalArcAndNoonRay(seasonObj, colorHex, isPrimary) {
      const R = 8.5
      const phi = THREE.MathUtils.degToRad(this.latitude)
      const delta = THREE.MathUtils.degToRad(seasonObj.declination)

      const pts = []
      for (let hourDeg = 0; hourDeg <= 360; hourDeg += 3) {
        const t = THREE.MathUtils.degToRad(hourDeg)
        const sinH = Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.cos(t)
        const hRad = Math.asin(Math.max(-1, Math.min(1, sinH)))
        const cosH = Math.cos(hRad)
        let cosA = 0
        if (Math.abs(cosH) > 1e-4 && Math.abs(Math.cos(phi)) > 1e-4) {
          cosA = (Math.sin(delta) - Math.sin(phi) * sinH) / (Math.cos(phi) * cosH)
        }
        cosA = Math.max(-1, Math.min(1, cosA))
        let A = Math.acos(cosA)
        if (Math.sin(t) > 0) A = 2 * Math.PI - A

        const y = R * Math.sin(hRad)
        const rHoriz = R * Math.cos(hRad)
        const x = rHoriz * Math.sin(A)
        const z = rHoriz * Math.cos(A)

        if (y >= -0.15) {
          pts.push(new THREE.Vector3(x, Math.max(0.02, y), z))
        }
      }

      if (pts.length > 1) {
        const pathGeo = new THREE.BufferGeometry().setFromPoints(pts)
        const pathMat = new THREE.LineBasicMaterial({
          color: colorHex,
          transparent: !isPrimary,
          opacity: isPrimary ? 1.0 : 0.55,
        })
        this.pathGroup.add(new THREE.Line(pathGeo, pathMat))
      }

      // 计算该节气的正午太阳位置 (hourDeg = 0) 并绘制正午入射光线与高度角 H 扇形弧线
      const noonSinH = Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta)
      const noonHRad = Math.asin(Math.max(-1, Math.min(1, noonSinH)))
      const noonHDeg = Math.max(0, THREE.MathUtils.radToDeg(noonHRad))
      if (noonHDeg <= 0.2) return

      const southSign = this.latitude >= seasonObj.declination ? -1 : 1
      const noonY = R * Math.sin(noonHRad)
      const noonZ = southSign * R * Math.cos(noonHRad)

      // 正午太阳到原点的光线
      const rayGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.05, 0),
        new THREE.Vector3(0, noonY, noonZ)
      ])
      const rayMat = new THREE.LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: isPrimary ? 0.92 : 0.45
      })
      this.pathGroup.add(new THREE.Line(rayGeo, rayMat))

      // 正午太阳高度角 H 圆弧标尺
      const arcRadius = isPrimary ? 3.8 : 2.9
      const arcPts = []
      const steps = 24
      for (let i = 0; i <= steps; i++) {
        const ang = (i / steps) * noonHRad
        arcPts.push(new THREE.Vector3(0, arcRadius * Math.sin(ang), southSign * arcRadius * Math.cos(ang)))
      }
      const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPts)
      this.pathGroup.add(new THREE.Line(arcGeo, new THREE.LineBasicMaterial({ color: colorHex })))

      // 3D 高度角 H 读数标牌
      const midAng = noonHRad * 0.52
      const labelRadius = arcRadius + (isPrimary ? 1.25 : 1.05)
      const ly = Math.max(0.6, labelRadius * Math.sin(midAng))
      const lz = southSign * labelRadius * Math.cos(midAng)
      const colorCss = colorHex === 0xf59e0b ? '#fbbf24' : '#38bdf8'
      this.addTextMarker(
        `${seasonObj.name}正午 H=${noonHDeg.toFixed(1)}°`,
        0,
        ly,
        lz,
        colorCss,
        250,
        3.5,
        this.pathGroup
      )
    },

    rebuildSolarPath() {
      if (!this.pathGroup) return
      while (this.pathGroup.children.length > 0) {
        const c = this.pathGroup.children[0]
        if (c.geometry) c.geometry.dispose()
        if (c.material) {
          if (c.material.map) c.material.map.dispose()
          c.material.dispose()
        }
        this.pathGroup.remove(c)
      }

      // 1. 先绘制对照节气轨迹（如当前选夏至，则对照画冬至，反之亦然）
      if (this.showDualCompare) {
        const compareColor = this.compareSeasonObj.key === 'winter' ? 0x38bdf8 : 0xf59e0b
        this.buildDiurnalArcAndNoonRay(this.compareSeasonObj, compareColor, false)
      }

      // 2. 绘制当前主选节气轨迹与正午高度角 H 弧线
      const primaryColor = this.seasonKey === 'winter' ? 0x38bdf8 : 0xf59e0b
      this.buildDiurnalArcAndNoonRay(this.currentSeasonData, primaryColor, true)

      this.updateSunPosition()
      this.renderOnce()
    },

    updateSunPosition() {
      if (!this.sunMesh) return
      const R = 8.5
      const phi = THREE.MathUtils.degToRad(this.latitude)
      const delta = THREE.MathUtils.degToRad(this.currentSeasonData.declination)
      const t = THREE.MathUtils.degToRad(this.timeOfDayDeg)

      const sinH = Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.cos(t)
      const hRad = Math.asin(Math.max(-1, Math.min(1, sinH)))
      const cosH = Math.cos(hRad)

      let cosA = 0
      if (Math.abs(cosH) > 1e-4 && Math.abs(Math.cos(phi)) > 1e-4) {
        cosA = (Math.sin(delta) - Math.sin(phi) * sinH) / (Math.cos(phi) * cosH)
      }
      cosA = Math.max(-1, Math.min(1, cosA))
      let A = Math.acos(cosA)
      if (Math.sin(t) > 0) A = 2 * Math.PI - A

      const y = R * Math.sin(hRad)
      const rHoriz = R * Math.cos(hRad)
      const x = rHoriz * Math.sin(A)
      const z = rHoriz * Math.cos(A)

      this.sunMesh.position.set(x, Math.max(-0.5, y), z)
      this.sunLight.position.set(x * 2, Math.max(0.1, y * 2), z * 2)

      // Update gnomon shadow (opposite to sun's horizontal azimuth)
      if (this.shadowLine) {
        const gnomonHeight = 2.5
        let shadowLength = 0
        if (y > 0.05) {
          shadowLength = gnomonHeight / Math.tan(Math.max(0.05, hRad))
          shadowLength = Math.min(8.0, shadowLength)
        }
        const sX = -Math.sin(A) * shadowLength
        const sZ = -Math.cos(A) * shadowLength

        const pos = this.shadowLine.geometry.attributes.position
        pos.setXYZ(0, 0, 0.06, 0)
        pos.setXYZ(1, sX, 0.06, sZ)
        pos.needsUpdate = true
        this.shadowLine.visible = y > 0
      }
    },

    renderOnce() {
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera)
      }
    },

    startLoop() {
      if (this.isLooping) return
      this.isLooping = true
      this.animate()
    },

    stopLoop() {
      this.isLooping = false
      if (this.animId) {
        cancelAnimationFrame(this.animId)
        this.animId = null
      }
    },

    animate() {
      if (!this.isLooping) return
      this.animId = requestAnimationFrame(this.animate)
      if (this.autoRunning) {
        this.timeOfDayDeg = (this.timeOfDayDeg + 0.45) % 360
        this.updateSunPosition()
      }
      if (this.controls) {
        this.controls.update()
      }
      this.renderOnce()
    },

    onParamInput() {
      this.activePlace = ''
      this.studentClaim = this.defaultClaimText
      this.rebuildSolarPath()
    },

    applyPlace(p) {
      this.activePlace = p.name
      this.latitude = p.lat
      this.timeOfDayDeg = 0
      this.studentClaim = this.defaultClaimText
      this.rebuildSolarPath()
    },

    selectSeason(key) {
      this.seasonKey = key
      this.timeOfDayDeg = 0
      this.studentClaim = this.defaultClaimText
      this.rebuildSolarPath()
    },

    togglePlay() {
      this.autoRunning = !this.autoRunning
    },

    resetTime() {
      this.timeOfDayDeg = 0 // solar noon (cos(0) = 1)
      this.autoRunning = false
      this.updateSunPosition()
      this.renderOnce()
    },

    toggleLock() {
      this.locked = !this.locked
      if (this.controls) {
        if (this.locked) {
          this.controls.maxPolarAngle = Math.PI / 2.02
          this.controls.minDistance = 8
          this.controls.maxDistance = 50
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
      this.latitude = 40
      this.seasonKey = 'summer'
      this.activePlace = '北京'
      this.timeOfDayDeg = 0
      this.autoRunning = false
      this.studentClaim = this.defaultClaimText
      this.rebuildSolarPath()
      this.setCameraView('meridian')
    },

    onResize() {
      const canvas = this.$refs.cvs
      const wrap = this.$refs.wrapRef || canvas?.parentElement || canvas
      if (!canvas || !wrap || !this.renderer || !this.camera) return
      const rect = wrap.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        this.camera.aspect = rect.width / rect.height
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(rect.width, rect.height)
        this.renderOnce()
      }
    },

    disposeScene() {
      this.stopLoop()
      if (this.resizeObserver) {
        this.resizeObserver.disconnect()
        this.resizeObserver = null
      }
      if (this.sceneActivity) {
        this.sceneActivity.dispose()
        this.sceneActivity = null
      }
      if (this.guideTimer) clearInterval(this.guideTimer)
      if (this.controls) this.controls.dispose()
      if (this.renderer) this.renderer.dispose()
      if (this.scene) {
        this.scene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose()
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose())
            else {
              if (obj.material.map) obj.material.map.dispose()
              obj.material.dispose()
            }
          }
        })
      }
    },
  },
}
</script>

<style scoped>
.sm-shared-banner {
  background: #f0f9ff;
  border: 1.5px solid #38bdf8;
  border-radius: 12px;
  padding: 10px 16px;
  margin-bottom: 12px;
}
.sm-shared-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}
.sm-shared-pill {
  background: #0284c7;
  color: #ffffff;
  font-size: 11.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
}
.sm-sim-pill {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #f59e0b;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
}
.sm-shared-banner p {
  margin: 0;
  font-size: 12.5px;
  color: #0c4a6e;
  line-height: 1.5;
}

.astro-theme {
  display: flex;
  gap: 16px;
  background: #080d1a;
  border-radius: var(--radius-card, 16px);
  padding: 14px;
  border: 1px solid rgba(245, 158, 11, 0.25);
  color: #f1f5f9;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
}

.sm-panel {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 8px;
}
.station-tag {
  font-size: 11px;
  letter-spacing: 0.06em;
  color: #f59e0b;
  font-weight: 700;
}
.panel-title {
  margin: 3px 0 0;
  font-size: 16.5px;
  font-weight: 700;
  color: #f8fafc;
}

.ctrl-subhead {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 6px;
  display: block;
  font-weight: 700;
}
.preset-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
.chip-name { font-size: 11px; font-weight: 700; }
.chip-val { font-size: 9px; opacity: 0.8; }

.ctrl-group {
  background: rgba(15, 23, 42, 0.6);
  padding: 9px 11px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.ctrl-label-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 6px;
  color: #cbd5e1;
  font-weight: 700;
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
  color: #94a3b8;
  margin-top: 4px;
}

.season-chips {
  display: flex;
  gap: 6px;
}
.season-chip {
  flex: 1;
  padding: 6px 4px;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #cbd5e1;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.season-chip.active {
  background: rgba(245, 158, 11, 0.25);
  border-color: #f59e0b;
  color: #fbbf24;
  font-weight: 700;
}
.compare-toggle-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 11px;
  color: #93c5fd;
  cursor: pointer;
}

.sundial-card {
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: 12px;
  padding: 10px 12px;
}
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11.5px;
  color: #94a3b8;
  margin-bottom: 6px;
}
.alt-badge {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 11px;
}
.sundial-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11.5px;
}
.sun-item {
  display: flex;
  justify-content: space-between;
  color: #cbd5e1;
}
.s-label { color: #94a3b8; }
.text-gold { color: #fbbf24; }
.text-sky { color: #38bdf8; }

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
  font-size: 11.5px;
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
  color: #0f172a;
  font-weight: 700;
}

.guide-trigger {
  padding: 7px;
  border-radius: 8px;
  border: 1px dashed rgba(245, 158, 11, 0.6);
  background: rgba(245, 158, 11, 0.08);
  color: #fbbf24;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.guide-trigger.active {
  background: #f59e0b;
  color: #0f172a;
}
.guide-box {
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.3);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  color: #fde68a;
  line-height: 1.5;
}

.nav-hint {
  font-size: 11px;
  color: #94a3b8;
  text-align: center;
  margin: 0;
}

.sm-canvas-wrap {
  flex: 1;
  height: 500px;
  min-height: 460px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #060b18;
}
.sm-canvas-wrap canvas {
  width: 100%;
  height: 100%;
  display: block;
  touch-action: pan-y !important;
}

.view-overlay {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 8px;
  pointer-events: none;
  z-index: 4;
}
.sm-camera-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  pointer-events: auto;
}
.cam-preset-btn {
  background: rgba(15, 23, 42, 0.88);
  border: 1px solid rgba(148, 163, 184, 0.35);
  color: #e2e8f0;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}
.cam-preset-btn.active {
  background: #0284c7;
  border-color: #7dd3fc;
  color: #ffffff;
  box-shadow: 0 2px 10px rgba(2, 132, 199, 0.45);
}
.lock-btn {
  pointer-events: auto;
  background: rgba(15, 23, 42, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #f8fafc;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 11.5px;
  cursor: pointer;
}

/* 画布底部同视野对照读数与一键条件切换条 */
.sm-compare-hud {
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  z-index: 4;
  display: grid;
  grid-template-columns: minmax(160px, 1fr) minmax(180px, 1.15fr) minmax(160px, 1fr);
  gap: 8px;
  align-items: stretch;
}
.hud-season-pill {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 2px;
  padding: 7px 11px;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  backdrop-filter: blur(8px);
  transition: transform 0.15s ease, border-color 0.15s ease;
}
.hud-season-pill.pill-summer {
  background: rgba(69, 26, 3, 0.82);
  border: 1px solid rgba(245, 158, 11, 0.45);
  color: #fef3c7;
}
.hud-season-pill.pill-summer.active {
  border: 2px solid #fbbf24;
  box-shadow: 0 0 14px rgba(245, 158, 11, 0.35);
}
.hud-season-pill.pill-winter {
  background: rgba(12, 74, 110, 0.82);
  border: 1px solid rgba(56, 189, 248, 0.45);
  color: #e0f2fe;
}
.hud-season-pill.pill-winter.active {
  border: 2px solid #38bdf8;
  box-shadow: 0 0 14px rgba(56, 189, 248, 0.35);
}
.pill-title {
  font-size: 11px;
  font-weight: 700;
  opacity: 0.92;
}
.pill-val {
  font-size: 11.5px;
  font-weight: 800;
}
.hud-diff-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 6px 10px;
  border-radius: 10px;
  background: rgba(7, 16, 32, 0.9);
  border: 1.5px solid rgba(125, 211, 252, 0.55);
  text-align: center;
  pointer-events: none;
}
.diff-kicker {
  font-size: 10px;
  color: #93c5fd;
  font-weight: 600;
}
.diff-readout {
  font-size: 12px;
  color: #ffffff;
  font-weight: 800;
}

/* 3D 对照证据卡与分享工作台 */
.sm-evidence-workbench {
  margin-top: 16px;
  padding: 16px 20px;
  border-radius: var(--radius-card, 16px);
  background: var(--surface, #ffffff);
  border: 1.5px solid rgba(2, 132, 199, 0.35);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.sme-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 8px;
}
.sme-kicker {
  font-size: 11.5px;
  font-weight: 700;
  color: #0284c7;
}
.sme-top h3 {
  margin: 3px 0 0;
  font-size: 16.5px;
  color: var(--geo-ocean-deep, #0c4a6e);
  font-weight: 800;
}
.sme-fill-btn {
  padding: 5px 11px;
  border-radius: 999px;
  border: 1px solid #7dd3fc;
  background: #f0f9ff;
  color: #0369a1;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.sme-claim-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.sme-claim-row input {
  flex: 1 1 260px;
  min-height: 38px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid var(--border, #cbd5e1);
  font-size: 13px;
  color: var(--text, #0f172a);
  background: var(--surface, #ffffff);
}
.sme-preview-btn {
  min-height: 38px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid #0284c7;
  background: #f0f9ff;
  color: #0369a1;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.sme-discuss-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 16px;
  border-radius: 8px;
  background: var(--geo-ocean, #0284c7);
  color: #ffffff;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
}

.sme-card-preview {
  background: #f8fafc;
  border: 1px solid #7dd3fc;
  border-left: 4px solid #0284c7;
  border-radius: 10px;
  padding: 14px 16px;
}
.sme-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}
.sme-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.sme-badge-primary {
  background: #0284c7;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
}
.sme-badge-sim {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #f59e0b;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
}
.sme-copy-hint {
  font-size: 12px;
  color: #059669;
  font-weight: 600;
}
.sme-card-title {
  margin: 0 0 10px;
  font-size: 15px;
  color: var(--geo-ocean-deep, #0c4a6e);
}
.sme-meta-grid {
  margin: 0 0 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 12px;
  font-size: 12.5px;
}
.sme-meta-grid div {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 10px;
}
.sme-meta-grid div.full-span {
  grid-column: 1 / -1;
}
.sme-meta-grid div.sme-limit-box {
  background: #fffbeb;
  border-color: #fde68a;
}
.sme-meta-grid dt {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 2px;
}
.sme-meta-grid dd {
  margin: 0;
  color: #0f172a;
  line-height: 1.5;
}
.sme-share-bar {
  padding-top: 10px;
  border-top: 1px dashed #cbd5e1;
}
.sme-share-label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: var(--geo-ocean-deep, #0c4a6e);
  margin-bottom: 6px;
}
.sme-share-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.sme-share-input {
  flex: 1 1 240px;
  min-height: 36px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  font-size: 12px;
  font-family: ui-monospace, monospace;
  color: #334155;
}
.sme-copy-btn {
  min-height: 36px;
  padding: 0 14px;
  border-radius: 6px;
  border: 1px solid #0284c7;
  background: #0284c7;
  color: #ffffff;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 768px) {
  .astro-theme {
    flex-direction: column;
    padding: 10px;
  }
  .sm-panel {
    width: 100%;
  }
  .sm-canvas-wrap {
    height: 390px;
    min-height: 390px;
  }
  .sm-compare-hud {
    grid-template-columns: 1fr 1fr;
    gap: 5px;
  }
  .hud-diff-center {
    grid-column: 1 / -1;
    order: -1;
    padding: 4px 8px;
  }
  .hud-season-pill {
    padding: 5px 8px;
  }
  .pill-title { font-size: 10px; }
  .pill-val { font-size: 10.5px; }
  .sme-meta-grid {
    grid-template-columns: 1fr;
  }
}
</style>
