<template>
  <section class="lab-page">
    <!-- 分享链接还原提示横幅（通过分享链接在新会话打开时自动显示） -->
    <div v-if="isSharedSession" class="sat-shared-banner" role="status" aria-live="polite">
      <div class="sat-shared-head">
        <span class="sat-shared-pill">🔗 已从分享链接还原同一次卫星卷帘对比</span>
        <span class="sat-real-pill">真实卫星观测 · NASA MODIS Terra</span>
      </div>
      <p>
        已还原观测地点 <strong>{{ place.name }}（{{ place.coordText }}）</strong>、对比日期
        <strong>{{ dateA }} vs {{ dateB }}</strong> 及卷帘位置 <strong>{{ split }}%</strong>。本链接仅包含公开遥感对比参数，不含私人草稿或账号信息。
      </p>
    </div>

    <!-- 1. 首屏紧凑观察任务头（确保桌面 1440×900 与手机 390×844 首屏直接看到地点、两期日期、观察问题与卷帘画布） -->
    <header class="sat-mission-header">
      <div class="sat-nav-row">
        <router-link to="/geo-labs" class="back">← 地理实证实验</router-link>
        <router-link to="/" class="back-globe">🌍 返回首页 3D 小地球</router-link>
        <span class="sat-layer-badge">🛰 真实卫星观测 · NASA MODIS Terra (250m–1km)</span>
      </div>

      <div class="sat-title-row">
        <div>
          <h1 id="sat-main-title">同一地点，卫星隔两周拍到了什么？</h1>
          <p class="sat-question-sub">
            当前对准 <strong>{{ place.name }}（{{ place.coordText }}）</strong>，对比左侧
            <strong>{{ dateA }}</strong> 与右侧 <strong>{{ dateB }}</strong> 的真彩色实测卫星影像。
          </p>
        </div>
        <div class="sat-caution-pill" role="note" aria-label="云层与数据缺口判读提示">
          <strong>⚠️ 云层与数据缺口提示：</strong>
          <span>画面中亮白色团块多为云层遮挡（光学传感器无法穿透厚云），低纬黑色条带为轨道扫描缺口；请优先在无云窗口对比水体边界与植被色调。</span>
        </div>
      </div>
    </header>

    <!-- 2. 紧凑工具栏：地点、两期日期与卷帘快捷控制合为一体 -->
    <div class="sat-compact-toolbar">
      <div class="controls">
        <label>观测区域
          <select v-model="placeId" aria-label="选择观测地点" @change="onPlaceChange">
            <option v-for="item in places" :key="item.id" :value="item.id">{{ item.name }} ({{ item.coordText }})</option>
          </select>
        </label>
        <label>左侧日期 <input v-model="dateA" type="date" min="2000-01-01" :max="today" aria-label="左侧基准日期" /></label>
        <label>右侧日期 <input v-model="dateB" type="date" min="2000-01-01" :max="today" aria-label="右侧对比日期" /></label>
        <button type="button" class="btn-update-map" @click="renderMaps">更新影像</button>
        <button type="button" class="btn-toggle-sample" @click="toggleSampleFallback">
          {{ useSampleFallback ? '🛰 切回 NASA 实时瓦片' : '🖼 查看内置标注示例图' }}
        </button>
      </div>

      <!-- 卷帘点按与键盘无障碍操作栏 -->
      <div class="curtain-toolbar" role="group" aria-label="卷帘位置点按与键盘控制">
        <span class="curtain-label">
          ↔ 卷帘：<strong>{{ split }}%</strong>（可拖动滑杆、点按右侧按钮，或聚焦画布按 <kbd>←</kbd> <kbd>→</kbd> 键）
        </span>
        <div class="curtain-quick-btns">
          <button type="button" :class="['curtain-btn', { active: split === 0 }]" @click="setSplit(0)">
            只看左 ({{ dateA }})
          </button>
          <button type="button" :class="['curtain-btn', { active: split === 25 }]" @click="setSplit(25)">
            左 25%
          </button>
          <button type="button" :class="['curtain-btn', { active: split === 50 }]" @click="setSplit(50)">
            居中 50%
          </button>
          <button type="button" :class="['curtain-btn', { active: split === 75 }]" @click="setSplit(75)">
            右 75%
          </button>
          <button type="button" :class="['curtain-btn', { active: split === 100 }]" @click="setSplit(100)">
            只看右 ({{ dateB }})
          </button>
        </div>
      </div>
    </div>

    <!-- 影像加载失败或示例模式状态提示条（含重试入口与来源/日期标注） -->
    <div v-if="mapError || useSampleFallback" class="sat-status-banner" role="status" aria-live="polite">
      <div class="sat-status-text">
        <strong v-if="mapError">⚠️ {{ mapError }}</strong>
        <strong v-else>🖼 当前正在浏览内置标注教学示意图（教学示例素材，非实时 NASA 卫星瓦片）</strong>
        <p>
          示例素材说明：当前画布展示的是<strong>内置标注教学示意图</strong>（依据 <strong>NASA Earth Observatory / MODIS Terra</strong> 历史观测特征绘制，区域：{{ place.name }}，对比日期标签：左侧 <strong>{{ dateA }}</strong> vs 右侧 <strong>{{ dateB }}</strong>）。在此模式下生成的证据卡会自动标注为“内置标注教学示意图素材”。
        </p>
      </div>
      <div class="sat-status-actions">
        <button type="button" class="btn-retry-tiles" @click="retryLiveTiles">
          🔄 切回并重新加载实时瓦片
        </button>
        <button v-if="!useSampleFallback" type="button" class="btn-use-sample" @click="useSampleFallback = true">
          使用内置示例图继续对比
        </button>
      </div>
    </div>

    <!-- 3. 双时相卷帘对比画布（首屏核心视觉区） -->
    <div
      class="map-frame"
      tabindex="0"
      role="region"
      :aria-label="`${place.name} ${dateA} 与 ${dateB} 卫星影像卷帘对比，当前卷帘位置 ${split}%，可使用左右方向键调节`"
      @keydown="onFrameKeydown"
    >
      <!-- 底层内置示例图（当离线、瓦片加载失败或开启示例模式时保证卷帘对比依然 100% 可读可用） -->
      <div class="sample-pane sample-left" aria-hidden="true">
        <svg viewBox="0 0 800 450" class="sample-svg">
          <rect width="800" height="450" fill="#1b3a2b" />
          <path d="M 0 120 Q 220 140 410 210 T 800 280 L 800 450 L 0 450 Z" fill="#234d36" />
          <path d="M 120 220 Q 280 205 420 235 T 710 250 Q 560 285 390 270 T 120 220 Z" fill="#1d4ed8" opacity="0.85" />
          <circle cx="580" cy="120" r="65" fill="#f8fafc" opacity="0.45" />
          <text x="28" y="76" fill="#e2e8f0" font-size="14" font-weight="bold">
            左侧（{{ dateA }}）· {{ place.shortName }}【教学示意图左幅】
          </text>
          <text x="28" y="100" fill="#93c5fd" font-size="12">
            {{ place.sampleLeftNote }}
          </text>
        </svg>
      </div>

      <div ref="mapAEl" class="map-pane" :class="{ 'is-hidden': useSampleFallback }"></div>

      <!-- 右侧覆盖层（含内置示例图与实时瓦片层） -->
      <div class="map-pane map-overlay" :style="{ clipPath: `inset(0 0 0 ${split}%)` }">
        <div class="sample-pane sample-right" aria-hidden="true">
          <svg viewBox="0 0 800 450" class="sample-svg">
            <rect width="800" height="450" fill="#14432a" />
            <path d="M 0 100 Q 240 130 430 190 T 800 260 L 800 450 L 0 450 Z" fill="#155e37" />
            <path d="M 70 175 Q 290 145 470 190 T 760 225 Q 610 335 380 320 T 70 175 Z" fill="#0284c7" opacity="0.92" />
            <ellipse cx="230" cy="110" rx="85" ry="32" fill="#ffffff" opacity="0.65" />
            <text x="772" y="76" fill="#f8fafc" font-size="14" font-weight="bold" text-anchor="end">
              右侧（{{ dateB }}）· {{ place.shortName }}【教学示意图右幅】
            </text>
            <text x="772" y="100" fill="#7dd3fc" font-size="12" text-anchor="end">
              {{ place.sampleRightNote }}
            </text>
          </svg>
        </div>
        <div ref="mapBEl" class="map-pane" :class="{ 'is-hidden': useSampleFallback }"></div>
      </div>

      <div class="divider" :style="{ left: `${split}%` }" aria-hidden="true">
        <span class="divider-handle">↔</span>
      </div>
      <span class="map-tag left">左侧：{{ dateA }} · {{ place.shortName }}</span>
      <span class="map-tag right">右侧：{{ dateB }} · {{ place.shortName }}</span>
      <input
        v-model.number="split"
        class="swipe"
        type="range"
        min="0"
        max="100"
        aria-label="拖动或使用左右方向键比较两天的卫星影像"
      />
    </div>

    <!-- 4. 1 分钟遥感比较与证据卡工作台（先点选观察方向句式支架 → 写一句观察 → 预览证据卡 / 复制分享链接 / 带入社区讨论草稿） -->
    <section class="sat-observation-workbench" aria-labelledby="sat-workbench-title">
      <div class="wb-head">
        <div>
          <span class="wb-kicker">
            {{ useSampleFallback ? '⏱ 1 分钟遥感观察记录 · 当前使用内置标注教学示意图素材' : '⏱ 1 分钟遥感观察记录 · 真实卫星观测证据链' }}
          </span>
          <h2 id="sat-workbench-title">记录你在两期影像中看到的差异，生成可复现观察证据卡</h2>
        </div>
        <span class="wb-layer-tag">
          {{ useSampleFallback ? '素材：内置标注教学示意图（非实时卫星瓦片）' : '图层：MODIS_Terra_CorrectedReflectance_TrueColor' }}
        </span>
      </div>

      <!-- 切换地点或日期后的旧观察复核提示条（保护用户输入，同时绝不把旧观察自动当成新地点/新日期的事实） -->
      <div
        v-if="observationNeedsReview"
        class="sat-review-alert"
        data-testid="sat-observation-review-alert"
        role="alert"
      >
        <div class="sat-review-text">
          <strong>⚠️ 请重新核对你的观察记录：</strong>
          <span>
            你已将观测条件切换为 <strong>{{ place.shortName }}（{{ dateA }} vs {{ dateB }}）</strong>，但下方输入框中仍是针对旧条件（<strong>{{ previousContextSummary }}</strong>）填写的观察文字。请对照当前新画面修改或确认，系统不会将旧观察直接当作新日期或新地点的事实。
          </span>
        </div>
        <div class="sat-review-actions">
          <button
            type="button"
            class="btn-confirm-obs"
            data-testid="confirm-observation-context-btn"
            @click="confirmObservationForCurrentContext"
          >
            ✓ 我已结合新画面核对确认
          </button>
          <button type="button" class="btn-clear-obs" @click="clearObservationInput">
            清空重新填写
          </button>
        </div>
      </div>

      <!-- 第 1 步：观察方向与句式支架（仅提供对应区域的观察方向与填空句式，不自动替学生下结论） -->
      <div class="wb-step">
        <span class="wb-step-label">
          1. 先拖动上方卷帘对比 <strong>{{ place.shortName }}</strong> 左右两期画面；可点击下方<strong>【观察方向与句式模板】</strong>填入填空支架，再根据实际画面把 <code>[填写...]</code> 补充完整：
        </span>
        <div class="wb-chip-row" role="group" aria-label="遥感观察方向与句式模板选择">
          <button
            v-for="item in currentPlaceTemplates"
            :key="item.key"
            type="button"
            :class="['wb-chip', { active: selectedPhenomenonKey === item.key && isUsingTemplate }]"
            @click="applyObservationTemplate(item)"
          >
            {{ item.label }}
          </button>
          <button
            v-if="userObservation"
            type="button"
            class="wb-chip wb-chip-clear"
            @click="clearObservationInput"
          >
            清空重写
          </button>
        </div>
      </div>

      <!-- 第 2 步：一句话观察与一键生成预览/带入社区 -->
      <div class="wb-step">
        <label class="wb-step-label" for="sat-observation-input">
          2. 用你自己的话记录一处观察发现（未填写前不会自动生成具体结论；私人草稿仅保存在本机或带入发帖框）：
          <span v-if="observationNeedsReview" class="wb-review-pill">⚠️ 地点或日期已变更，请核对确认</span>
          <span v-else-if="hasUnfilledPlaceholders" class="wb-example-pill">请将句式模板中的 [填写...] 替换为你在画面中看到的现象</span>
          <span v-else-if="userObservation.trim()" class="wb-user-pill">✓ 已记录你对当前画面的观察</span>
        </label>
        <div class="wb-input-row">
          <input
            id="sat-observation-input"
            v-model="userObservation"
            type="text"
            maxlength="240"
            :placeholder="`请拖动卷帘观察 ${place.shortName}（${dateA} vs ${dateB}）的无云窗口，写下你实际看到的变化（或点选上方句式模板填空）…`"
            @input="onUserObservationInput"
          />
          <button type="button" class="btn-preview-evidence" @click="showEvidencePreview = true">
            📋 预览遥感证据卡
          </button>
          <router-link :to="discussRoute" class="btn-sat-discuss" @click="prepareCommunityDraft">
            💬 带着日期、地点与观察去社区讨论 ↗
          </router-link>
        </div>
      </div>

      <!-- 第 3 步：结构化遥感观察证据卡预览与可复现分享链接 -->
      <div v-if="showEvidencePreview" id="sat-evidence-card" class="sat-evidence-card" role="region" aria-label="卫星遥感观察证据卡预览">
        <div class="sec-head">
          <div class="sec-badges">
            <span class="sec-badge-main">
              {{ useSampleFallback ? '🖼 内置标注教学示意图观察证据卡' : '🛰 真实卫星遥感观察证据卡' }}
            </span>
            <span :class="useSampleFallback ? 'sec-badge-sample' : 'sec-badge-real'">
              {{ useSampleFallback ? '当前使用内置标注教学示意图素材 · 非实时卫星瓦片' : '真实卫星观测 · NASA MODIS Terra' }}
            </span>
            <span v-if="!hasConfirmedObservation" class="sec-badge-example">
              {{ observationNeedsReview ? '旧观察待重新确认' : '尚未填写具体观察结论' }}
            </span>
          </div>
          <span class="sec-status">{{ copyStatus || '✓ 公开链接仅含可复现参数，私人草稿已分离保护' }}</span>
        </div>

        <h3 class="sec-title">{{ evidenceCardData.title }}</h3>

        <dl class="sec-grid">
          <div>
            <dt>图层与素材来源</dt>
            <dd>{{ evidenceCardData.modelName }}</dd>
          </div>
          <div>
            <dt>证据类型与标识</dt>
            <dd>{{ evidenceCardData.evidenceType }}（{{ evidenceCardData.disclaimer }}）</dd>
          </div>
          <div>
            <dt>左侧基准期 ({{ dateA }})</dt>
            <dd>{{ place.name }}（{{ place.coordText }}）· {{ useSampleFallback ? '内置标注教学示意图左幅' : 'MODIS 真彩色校正反射率' }}</dd>
          </div>
          <div>
            <dt>右侧对比期 ({{ dateB }})</dt>
            <dd>同坐标对比 · 当前卷帘位置 {{ split }}% · {{ useSampleFallback ? '内置标注教学示意图右幅' : '分辨率 250m–1km' }}</dd>
          </div>
          <div class="full-span">
            <dt>
              {{ hasConfirmedObservation ? '我的观察记录（将随草稿带入社区）' : '观察记录状态（需由观察者根据画面填写后生成）' }}
            </dt>
            <dd data-testid="sat-evidence-facts">{{ evidenceCardData.facts }}</dd>
          </div>
          <div class="full-span sec-limit">
            <dt>云层遮挡与适用边界说明</dt>
            <dd>{{ evidenceCardData.limitations }}</dd>
          </div>
        </dl>

        <div class="sec-share-row">
          <label for="sat-share-url" class="sec-share-label">
            🔒 <strong>将公开分享的内容：</strong>仅包含观测地点（{{ place.shortName }}）、两期日期（{{ dateA }} vs {{ dateB }}）、图层与卷帘比例（{{ split }}%），<strong>不含你的私人草稿或账号信息</strong>（链接共 {{ shareFullUrl.length }} 字符，手机聊天软件可直接打开）：
          </label>
          <div class="sec-share-controls">
            <input
              id="sat-share-url"
              :value="shareFullUrl"
              readonly
              class="sec-share-input"
              aria-label="遥感对比可复现分享链接"
              @focus="$event.target.select()"
            />
            <button type="button" class="btn-copy-sat-share" @click="copyShareUrl">
              {{ copyStatus ? '✓ 已复制链接' : '🔗 复制可复现链接' }}
            </button>
            <router-link :to="discussRoute" class="btn-sat-discuss" @click="prepareCommunityDraft">
              💬 带这张证据卡去社区发帖 ↗
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. 观测元数据、图层分辨率、数据缺口与原始来源核查卡 -->
    <section class="sat-meta-panel" aria-label="卫星影像来源与观测参数说明">
      <div class="sat-meta-grid">
        <div class="sat-meta-item">
          <span class="meta-kicker">📍 观测地点与中心坐标</span>
          <strong>{{ place.name }}（{{ place.coordText }}）</strong>
        </div>
        <div class="sat-meta-item">
          <span class="meta-kicker">📅 对比日期（左 vs 右）</span>
          <strong>{{ dateA }} vs {{ dateB }}</strong>
        </div>
        <div class="sat-meta-item">
          <span class="meta-kicker">🛰 遥感图层（就地解释）</span>
          <strong>{{ useSampleFallback ? '内置标注教学示意图（离线示例素材）' : 'NASA MODIS Terra 真彩色校正反射率' }}</strong>
          <small>{{ useSampleFallback ? '依据 MODIS 历史观测特征绘制的教学示意图，可随时点击上方按钮切回 NASA 实时卫星瓦片' : '中分辨率成像光谱仪（红/绿/蓝可见光波段合成，直观反映云系、水体、植被与积雪）' }}</small>
        </div>
        <div class="sat-meta-item">
          <span class="meta-kicker">📏 空间与时间分辨率</span>
          <strong>约 250 米 – 1 公里 · 每日 1 次过境</strong>
          <small>适合区域宏观水体、积雪线与云团对比，无法分辨单栋建筑或细小沟渠</small>
        </div>
        <div class="sat-meta-item full-row">
          <span class="meta-kicker">⚠️ 数据缺口与判读限制说明</span>
          <p>
            1. <strong>云层遮挡：</strong>光学传感器无法穿透厚云，画面中亮白色团块多为云层而非地表积雪；
            2. <strong>轨道扫描缺口：</strong>低纬度相邻卫星轨道之间可能出现黑色条带状无数据区（数据缺口）；
            3. <strong>定性边界：</strong>本工具用于定性观察空间变化趋势，定量工程反演需结合去云合成与地面水文站实测记录。
          </p>
        </div>
      </div>
      <div class="sat-source-links">
        <span>原始来源核查：</span>
        <a href="https://www.earthdata.nasa.gov/data/instruments/modis" target="_blank" rel="noopener noreferrer">
          NASA MODIS Terra 传感器文档 ↗
        </a>
        <span>·</span>
        <a href="https://nasa-gibs.github.io/gibs-api-docs/" target="_blank" rel="noopener noreferrer">
          NASA GIBS 开放瓦片服务 ↗
        </a>
        <span>·</span>
        <a :href="worldviewUrl" target="_blank" rel="noopener noreferrer">
          在 NASA Worldview 核对当前坐标原始影像 ↗
        </a>
      </div>
    </section>

    <!-- 6. 教学四要素机理与连贯性面板 -->
    <ModelPedagogyPanel
      theme="meteorology"
      :observe="pedagogy.observe"
      :change="pedagogy.change"
      :mechanism="pedagogy.mechanism"
      :limitations="pedagogy.limitations"
      :textbook-link="{ grade: '高中', book: '必修第一册', chapter: '第六章', section: '第四节' }"
      practice-link="/practice"
      @reset="split = 50"
    />
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Map } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import ModelPedagogyPanel from '../experiments/components/ModelPedagogyPanel.vue'

const route = useRoute()
const SAT_SESSION_KEY = 'geo_sat_state_v1'
const DRAFT_STORAGE_KEY = 'geo_community_post_draft_v1'
const PENDING_COMPOSE_KEY = 'geo_pending_compose_payload'

const pedagogy = {
  observe: [
    '不同日期同一地点的下垫面颜色、纹理与云层覆盖范围变化。',
    '积雪线消融退缩、大型湖泊湿地丰枯水位变化与农田植被季节性变绿。',
    '辨别真实地表变化与假象：云层阴影、传感器曝光差异与卫星扫描数据条带缺口。'
  ],
  change: [
    '选择不同地理区域（中国东部季风湖区、亚马孙平原雨林、喜马拉雅高山积雪）。',
    '选择两天的对比日期（支持 2000 年至今每日 NASA MODIS Terra 卫星实测影像）。',
    '拖动滑杆、点按比例按钮或按键盘左右方向键移动分屏卷帘。'
  ],
  mechanism: [
    '卫星传感器记录地表对太阳辐射的反射光谱（红、绿、蓝波段真彩色合成）。',
    '季节性水热变动驱动地表物候与水文循环：夏季气温升高导致高山积雪融化；雨带推移促成河湖水量涨落。'
  ],
  limitations: [
    '光学卫星无法穿透浓密厚云，云层下方的地表信息缺失。',
    'MODIS Terra 空间分辨率约为 250 米至 1 公里，仅适合区域宏观观察，无法分辨单栋建筑或细小溪流。'
  ]
}

const places = [
  {
    id: 'china',
    name: '中国东部 · 长江中下游湖区与云系',
    shortName: '中国东部',
    coordText: '31.0°N, 112.0°E',
    center: [112, 31],
    zoom: 4,
    sampleLeftNote: '示意基准期水体范围与云团分布（非实时瓦片）',
    sampleRightNote: '示意对比期水体边界与云带位置（非实时瓦片）'
  },
  {
    id: 'amazon',
    name: '亚马孙平原 · 热带雨林与河网',
    shortName: '亚马孙',
    coordText: '4.0°S, 62.0°W',
    center: [-62, -4],
    zoom: 5,
    sampleLeftNote: '示意亚马孙主干河道与雨林晴空窗（非实时瓦片）',
    sampleRightNote: '示意热带对流云团与洪泛河网对比（非实时瓦片）'
  },
  {
    id: 'himalaya',
    name: '喜马拉雅山脉 · 山地与积雪线',
    shortName: '喜马拉雅',
    coordText: '28.0°N, 86.9°E',
    center: [86.9, 28],
    zoom: 6,
    sampleLeftNote: '示意山脊积雪覆盖与南北坡河谷（非实时瓦片）',
    sampleRightNote: '示意高山积雪边界与地形云对比（非实时瓦片）'
  }
]

// 按区域提供观察方向与填空句式模板（含 [填写...] 支架，绝不预先替用户生成伪造的确定性结论，也不跨区域混用概念）
const placeTemplatesMap = {
  china: [
    {
      key: 'cloud-water',
      label: '📐 句式模板：云带位置与晴空区水体对比',
      buildTemplate: (p, dA, dB) =>
        `对比 ${p.shortName}（${dA} vs ${dB}）：左侧画面云层主要位于 [填写方位/范围]，右侧云带 [填写移动或增减情况]；在无云遮挡窗口内，河湖水体边界 [填写你的观察]。`
    },
    {
      key: 'cloud-mask',
      label: '📐 句式模板：排除云层遮挡与阴影干扰',
      buildTemplate: (p, dA, dB) =>
        `在 ${p.shortName}（${dA} vs ${dB}）对比中，[填写区域] 受亮白色云团遮挡无法直接判读地表；仅在晴空窗口内对比可见 [填写地表或水体色调差异]。`
    },
    {
      key: 'seasonal-veg',
      label: '📐 句式模板：陆表植被绿度与水色变化',
      buildTemplate: (p, dA, dB) =>
        `观察 ${p.shortName}（${dA} vs ${dB}）无云区：左侧陆表植被/农田呈 [填写色调]，右侧呈 [填写色调变化]，反映出 [填写你的初步推断]。`
    }
  ],
  amazon: [
    {
      key: 'cloud-water',
      label: '📐 句式模板：雨林干支流河道与洪泛区对比',
      buildTemplate: (p, dA, dB) =>
        `对比 ${p.shortName}（${dA} vs ${dB}）无云窗口：亚马孙河主干与支流河道在左侧呈 [填写河宽/水色特征]，右侧 [填写水位/滩涂或泥沙色调变化]。`
    },
    {
      key: 'cloud-mask',
      label: '📐 句式模板：热带对流积云与轨道缺口辨析',
      buildTemplate: (p, dA, dB) =>
        `判读 ${p.shortName}（${dA} vs ${dB}）时，需先排除低纬黑色轨道扫描缺口与爆米花状热带积云遮挡；在有效晴空窗口内观察到 [填写你的发现]。`
    },
    {
      key: 'seasonal-veg',
      label: '📐 句式模板：热带雨林冠层色调对比',
      buildTemplate: (p, dA, dB) =>
        `在 ${p.shortName}（${dA} vs ${dB}）晴空区对比雨林冠层：左侧深绿色林区范围 [填写特征]，右侧 [填写色调或斑块变化]。`
    }
  ],
  himalaya: [
    {
      key: 'cloud-water',
      label: '📐 句式模板：高山积雪线与河谷边界对比',
      buildTemplate: (p, dA, dB) =>
        `对比 ${p.shortName}（${dA} vs ${dB}）无云山脊区：左侧白色积雪覆盖范围 [填写特征]，右侧积雪边界 [填写退缩/扩展或持平情况]。`
    },
    {
      key: 'cloud-mask',
      label: '📐 句式模板：区分固定山脊积雪与移动云团',
      buildTemplate: (p, dA, dB) =>
        `在 ${p.shortName}（${dA} vs ${dB}）对比中，沿树枝状山谷固定分布的亮白区为 [填写积雪判断]，而跨山脊改变形状的亮白团块为 [填写云层判断]。`
    },
    {
      key: 'seasonal-veg',
      label: '📐 句式模板：喜马拉雅南北坡色调差异',
      buildTemplate: (p, dA, dB) =>
        `观察 ${p.shortName}（${dA} vs ${dB}）：喜马拉雅北坡高原与南坡河谷色调呈 [填写差异]，两期画面之间 [填写你的观察发现]。`
    }
  ]
}

const placeId = ref('china')
const dateA = ref('2024-06-01')
const dateB = ref('2024-06-15')
const today = new Date().toISOString().slice(0, 10)
const split = ref(50)
const mapAEl = ref(null)
const mapBEl = ref(null)
const mapError = ref('')
const useSampleFallback = ref(false)
const selectedPhenomenonKey = ref('cloud-water')
// 默认严格留空，未输入前绝不自动生成具体观察结论
const userObservation = ref('')
const isUsingTemplate = ref(false)
// 记录用户撰写观察时对应的地点与日期上下文；当切换地点或日期时，提示用户重新确认
const observationContext = ref({
  placeId: 'china',
  dateA: '2024-06-01',
  dateB: '2024-06-15'
})
const showEvidencePreview = ref(true)
const isSharedSession = ref(false)
const copyStatus = ref('')

let mapA
let mapB
let syncing = false

const place = computed(() => places.find(item => item.id === placeId.value) || places[0])
const currentPlaceTemplates = computed(() => placeTemplatesMap[placeId.value] || placeTemplatesMap.china)

const hasUnfilledPlaceholders = computed(() => {
  return /\[填写[^\]]*\]/.test(userObservation.value || '')
})

const observationNeedsReview = computed(() => {
  const text = (userObservation.value || '').trim()
  if (!text) return false
  const ctx = observationContext.value
  return (
    ctx.placeId !== placeId.value ||
    ctx.dateA !== dateA.value ||
    ctx.dateB !== dateB.value
  )
})

const previousContextSummary = computed(() => {
  const ctx = observationContext.value
  const oldPlace = places.find(p => p.id === ctx.placeId) || place.value
  return `${oldPlace.shortName} · ${ctx.dateA} vs ${ctx.dateB}`
})

const hasConfirmedObservation = computed(() => {
  const text = (userObservation.value || '').trim()
  return Boolean(text && !observationNeedsReview.value && !hasUnfilledPlaceholders.value)
})

function syncObservationContextToCurrent() {
  observationContext.value = {
    placeId: placeId.value,
    dateA: dateA.value,
    dateB: dateB.value
  }
}

function applyObservationTemplate(item) {
  selectedPhenomenonKey.value = item.key
  userObservation.value = item.buildTemplate(place.value, dateA.value, dateB.value)
  isUsingTemplate.value = true
  syncObservationContextToCurrent()
  showEvidencePreview.value = true
  saveSessionState()
}

function onUserObservationInput() {
  isUsingTemplate.value = false
  syncObservationContextToCurrent()
  saveSessionState()
}

function confirmObservationForCurrentContext() {
  syncObservationContextToCurrent()
  saveSessionState()
}

function clearObservationInput() {
  userObservation.value = ''
  isUsingTemplate.value = false
  syncObservationContextToCurrent()
  saveSessionState()
}

// 公开可复现链接：严格只编码可复现观测参数（地点、两期日期、卷帘比例、观察方向键），与私人草稿彻底分离
const shareRelativeRoute = computed(() => {
  const params = new URLSearchParams({
    place: placeId.value,
    dateA: dateA.value,
    dateB: dateB.value,
    split: String(split.value),
    phenom: selectedPhenomenonKey.value || 'cloud-water',
    shared: '1'
  })
  return `/geo-labs/satellite?${params.toString()}`
})

const shareFullUrl = computed(() => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://geo.kongnoma279.com'
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/'
  return `${origin}${pathname}#${shareRelativeRoute.value}`
})

const evidenceCardData = computed(() => {
  const isSample = useSampleFallback.value
  const sourcePrefix = isSample
    ? '【内置标注教学示意图 · 非实时卫星瓦片】'
    : '【真实卫星观测 · NASA MODIS Terra】'

  const rawText = (userObservation.value || '').trim()
  let factsText = ''
  if (!rawText) {
    factsText =
      `${sourcePrefix}尚未填写具体观察结论。请先拖动上方卷帘对比 ${place.value.name}（${dateA.value} vs ${dateB.value}）两期画面，在输入框中填写你实际观察到的云系、水体、植被或积雪差异后生成个人观察记录。`
  } else if (observationNeedsReview.value) {
    factsText =
      `${sourcePrefix}⚠️ 观测区域或日期已切换为 ${place.value.name}（${dateA.value} vs ${dateB.value}），原观察草稿对应旧条件（${previousContextSummary.value}）。请先对照新画面核对确认或修改后再作为当前日期/地点的观察记录。`
  } else if (hasUnfilledPlaceholders.value) {
    factsText =
      `${sourcePrefix}（句式模板待补充完整）${rawText} —— 请将方括号 [填写...] 替换为你在画面中核对的具体现象。`
  } else {
    factsText = `${sourcePrefix}${rawText}`
  }

  return {
    id: 'ev-satellite-east-asia',
    title: isSample
      ? `${place.value.name}（${dateA.value} vs ${dateB.value}）多时相遥感对比记录【内置标注教学示意图】`
      : `${place.value.name}（${dateA.value} vs ${dateB.value}）多时相卫星影像卷帘对比证据`,
    modelName: isSample
      ? '内置多时相遥感对比标注教学示意图（基于 NASA MODIS 历史观测特征绘制的教学示例素材，非实时卫星瓦片）'
      : 'NASA MODIS Terra Corrected Reflectance (True Color) · NASA GIBS 开放瓦片服务（分辨率 250m–1km）',
    evidenceType: isSample
      ? '内置标注教学示意图观察记录（教学示例素材，非实时卫星瓦片）'
      : '真实卫星遥感观测（NASA MODIS Terra 实测影像）',
    disclaimer: isSample
      ? '当前使用内置标注教学示意图素材 · 非实时 NASA 卫星瓦片'
      : '真实卫星观测 · 需注意云层遮挡与分辨率边界',
    isRealData: !isSample,
    conditions: `观测区域：${place.value.name}（${place.value.coordText}）· 对比日期：左侧 ${dateA.value} vs 右侧 ${dateB.value} · 卷帘比例 ${split.value}% · 素材模式：${isSample ? '内置标注教学示意图（非实时瓦片）' : 'NASA GIBS 实时卫星瓦片'}`,
    facts: factsText,
    limitations: isSample
      ? '素材与判读边界：当前处于内置标注教学示意图模式（用于离线或网络受限时的卷帘交互演示，非所选日期的实时卫星实测瓦片）；如需对特定日期进行真实遥感判读，请切回 NASA 实时瓦片或前往 NASA Worldview 核查。'
      : '判读边界：光学遥感无法穿透厚云（亮白团块多为云层遮挡而非地表积雪），低纬相邻轨道间可能存在黑色扫描缺口；定量水体反演需结合去云合成与地面水文站实测水位。'
  }
})

const worldviewUrl = computed(() => {
  const [lon, lat] = place.value.center
  return `https://worldview.earthdata.nasa.gov/?v=${lon - 8},${lat - 5},${lon + 8},${lat + 5}&t=${dateB.value}-T00%3A00%3A00Z`
})

// 社区讨论路由：URL 仅保留精简的可复现参数（< 130 字符），避免在 URL 中重复编码观察文字、证据和正文；完整草稿通过本机存储传递
const discussRoute = computed(() => ({
  path: '/community',
  query: {
    compose: '1',
    kind: 'question',
    evidenceId: 'ev-satellite-east-asia',
    place: placeId.value,
    dateA: dateA.value,
    dateB: dateB.value,
    split: String(split.value)
  }
}))

function buildComposePayload() {
  const isSample = useSampleFallback.value
  const rawText = (userObservation.value || '').trim()
  let obsText = '（尚未填写具体观察，请结合卷帘画面补充你看到的差异）'
  if (rawText && observationNeedsReview.value) {
    obsText = `（待结合新条件 ${place.value.shortName} ${dateA.value} vs ${dateB.value} 重新核对；旧条件 ${previousContextSummary.value} 下的草稿：${rawText}）`
  } else if (rawText) {
    obsText = rawText
  }

  const sourceLine = isSample
    ? '内置多时相遥感对比标注教学示意图（**教学示例素材，非实时 NASA 卫星瓦片**）'
    : 'NASA MODIS Terra CorrectedReflectance_TrueColor（NASA GIBS 开放瓦片，空间分辨率约 250m–1km，**真实卫星观测**）'

  return {
    kind: 'question',
    categoryId: 4,
    title: `【多时相遥感判读】${place.value.name}（${dateA.value} vs ${dateB.value}）地表与云系差异探讨`,
    body:
      `我在「多时相卫星影像对比」工具中观察了 **${place.value.name}（${place.value.coordText}）**：\n\n` +
      `- **对比日期**：左侧 ${dateA.value} vs 右侧 ${dateB.value}（卷帘位置 ${split.value}%）\n` +
      `- **图层与素材来源**：${sourceLine}\n` +
      `- **我看到的差异**：${obsText}\n` +
      `- **我排除的干扰与适用边界**：${evidenceCardData.value.limitations}\n` +
      `- **可复现对比链接**：#${shareRelativeRoute.value}\n` +
      `- **我想请教的问题**：这一变化主要受什么季节性大气或水文过程驱动？`,
    linkedExperiment: '',
    evidenceId: 'ev-satellite-east-asia',
    compareUrl: shareRelativeRoute.value,
    evidenceTitle: evidenceCardData.value.title,
    modelName: evidenceCardData.value.modelName,
    evidenceType: evidenceCardData.value.evidenceType,
    disclaimer: evidenceCardData.value.disclaimer,
    isRealData: evidenceCardData.value.isRealData,
    conditions: evidenceCardData.value.conditions,
    facts: evidenceCardData.value.facts,
    tagsInput: isSample ? '遥感教学示意图, 多时相对比' : '遥感判读, MODIS, 多时相对比'
  }
}

function prepareCommunityDraft() {
  saveSessionState()
  try {
    const payload = buildComposePayload()
    sessionStorage.setItem(PENDING_COMPOSE_KEY, JSON.stringify(payload))
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload))
  } catch {}
}

function saveSessionState() {
  try {
    sessionStorage.setItem(
      SAT_SESSION_KEY,
      JSON.stringify({
        placeId: placeId.value,
        dateA: dateA.value,
        dateB: dateB.value,
        split: split.value,
        selectedPhenomenonKey: selectedPhenomenonKey.value,
        userObservation: userObservation.value,
        isUsingTemplate: isUsingTemplate.value,
        observationContext: observationContext.value
      })
    )
  } catch {}
}

async function copyShareUrl() {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareFullUrl.value)
    }
    copyStatus.value = '✓ 已复制可复现分享链接（仅含观测参数，不含私人草稿）'
  } catch {
    copyStatus.value = '✓ 请直接选中上方链接框复制'
  }
}

function setSplit(val) {
  split.value = Math.max(0, Math.min(100, Number(val) || 0))
  saveSessionState()
}

function onFrameKeydown(e) {
  const step = e.shiftKey ? 10 : 5
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    setSplit(split.value - step)
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    setSplit(split.value + step)
  } else if (e.key === 'Home') {
    e.preventDefault()
    setSplit(0)
  } else if (e.key === 'End') {
    e.preventDefault()
    setSplit(100)
  }
}

function toggleSampleFallback() {
  useSampleFallback.value = !useSampleFallback.value
  if (!useSampleFallback.value) {
    renderMaps()
  }
}

function retryLiveTiles() {
  useSampleFallback.value = false
  mapError.value = ''
  renderMaps()
}

function onPlaceChange() {
  if (!userObservation.value || !userObservation.value.trim()) {
    syncObservationContextToCurrent()
  }
  saveSessionState()
  if (!useSampleFallback.value) {
    renderMaps()
  }
}

function tileUrl(date) {
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`
}

function createMap(container, date) {
  const map = new Map({
    container,
    attributionControl: true,
    style: {
      version: 8,
      sources: { nasa: { type: 'raster', tiles: [tileUrl(date)], tileSize: 256, attribution: 'NASA ESDIS GIBS' } },
      layers: [{ id: 'nasa', type: 'raster', source: 'nasa', minzoom: 0, maxzoom: 9 }]
    },
    center: place.value.center,
    zoom: place.value.zoom,
    minZoom: 1,
    maxZoom: 9
  })
  map.on('error', () => {
    mapError.value = 'NASA GIBS 实时卫星瓦片暂时无法加载（可能受网络限制或所选日期数据缺失），可点击右侧重试或切换至内置标注教学示意图继续体验卷帘操作。'
  })
  return map
}

function sync(source, target) {
  if (syncing) return
  syncing = true
  target.jumpTo({ center: source.getCenter(), zoom: source.getZoom(), bearing: source.getBearing(), pitch: source.getPitch() })
  syncing = false
}

function renderMaps() {
  if (!mapAEl.value || !mapBEl.value) return
  if (!dateA.value || !dateB.value || dateA.value > today || dateB.value > today) {
    mapError.value = '请选择不晚于今天的有效日期。'
    return
  }
  if (!userObservation.value || !userObservation.value.trim()) {
    syncObservationContextToCurrent()
  }
  mapError.value = ''
  saveSessionState()
  mapA?.remove()
  mapB?.remove()
  try {
    mapA = createMap(mapAEl.value, dateA.value)
    mapB = createMap(mapBEl.value, dateB.value)
    mapA.on('move', () => sync(mapA, mapB))
    mapB.on('move', () => sync(mapB, mapA))
  } catch {
    mapError.value = '地图引擎初始化受限，已自动启用内置标注教学示意图。'
    useSampleFallback.value = true
  }
}

function initFromQuery() {
  const q = route?.query || {}
  const hasExplicitQuery = Boolean(q.place || q.dateA || q.dateB || q.split !== undefined || q.shared === '1')

  // 若用户通过浏览器返回回到卫星页，优先恢复刚才保存的日期、卷帘位置与个人观察草稿
  try {
    const savedRaw = sessionStorage.getItem(SAT_SESSION_KEY)
    if (savedRaw) {
      const saved = JSON.parse(savedRaw)
      if (!hasExplicitQuery && saved) {
        if (saved.placeId && places.some(p => p.id === saved.placeId)) placeId.value = saved.placeId
        if (saved.dateA) dateA.value = saved.dateA
        if (saved.dateB) dateB.value = saved.dateB
        if (saved.split !== undefined) split.value = Number(saved.split) || 50
      }
      if (saved?.userObservation && !q.obs) {
        userObservation.value = saved.userObservation
        isUsingTemplate.value = Boolean(saved.isUsingTemplate)
        if (saved.observationContext) {
          observationContext.value = saved.observationContext
        }
      }
    }
  } catch {}

  if (typeof q.place === 'string' && places.some(p => p.id === q.place)) {
    placeId.value = q.place
  }
  if (typeof q.dateA === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(q.dateA)) {
    dateA.value = q.dateA
  }
  if (typeof q.dateB === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(q.dateB)) {
    dateB.value = q.dateB
  }
  if (q.split !== undefined) {
    const sp = Number(q.split)
    if (!Number.isNaN(sp)) split.value = Math.max(0, Math.min(100, sp))
  }
  if (typeof q.phenom === 'string') {
    selectedPhenomenonKey.value = q.phenom
  }
  if (!userObservation.value || !userObservation.value.trim()) {
    syncObservationContextToCurrent()
  }
  // 兼容旧版带 ?obs=... 的公开链接；新链接默认严格留空输入框供学生自己观察填写
  if (typeof q.obs === 'string' && q.obs.trim()) {
    userObservation.value = q.obs.trim()
    isUsingTemplate.value = false
    syncObservationContextToCurrent()
  }
  if (q.shared === '1') {
    isSharedSession.value = true
    showEvidencePreview.value = true
  }
}

watch([placeId, dateA, dateB, split], () => {
  if (!userObservation.value || !userObservation.value.trim()) {
    syncObservationContextToCurrent()
  }
  saveSessionState()
})

onMounted(() => {
  initFromQuery()
  renderMaps()
})
onBeforeUnmount(() => { mapA?.remove(); mapB?.remove() })
</script>

<style scoped>
.lab-page {
  max-width: 1180px;
  margin: auto;
  padding: 18px 20px 80px;
  color: var(--text);
}

.sat-shared-banner {
  background: #ecfdf5;
  border: 1.5px solid #10b981;
  border-radius: 12px;
  padding: 10px 16px;
  margin-bottom: 12px;
}
.sat-shared-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}
.sat-shared-pill {
  background: #059669;
  color: #ffffff;
  font-size: 11.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
}
.sat-real-pill {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #34d399;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
}
.sat-shared-banner p {
  margin: 0;
  font-size: 12.5px;
  color: #064e3b;
  line-height: 1.5;
}

/* 1. 首屏紧凑观察任务头 */
.sat-mission-header {
  margin-bottom: 10px;
}
.sat-nav-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}
.back,
.back-globe {
  font-size: 13px;
  color: var(--geo-ocean);
  font-weight: 700;
  text-decoration: none;
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--bg-soft);
  border: 1px solid var(--border);
}
.back:hover,
.back-globe:hover {
  background: var(--geo-ocean-surface);
}
.sat-layer-badge {
  font-size: 11.5px;
  font-weight: 700;
  color: #065f46;
  background: #d1fae5;
  border: 1px solid #6ee7b7;
  padding: 3px 10px;
  border-radius: 999px;
}

.sat-title-row {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(280px, 1fr);
  gap: 12px;
  align-items: center;
}
.sat-mission-header h1 {
  font-size: clamp(22px, 3vw, 30px);
  margin: 0 0 4px;
  color: var(--geo-ocean-deep);
  font-weight: 800;
  line-height: 1.2;
}
.sat-question-sub {
  margin: 0;
  font-size: 13.5px;
  color: var(--text-muted);
  line-height: 1.45;
}
.sat-caution-pill {
  background: #fffbeb;
  border: 1px solid #f59e0b;
  border-left: 4px solid #d97706;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 12px;
  color: #78350f;
  line-height: 1.45;
}

/* 2. 紧凑工具栏 */
.sat-compact-toolbar {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: var(--shadow-xs);
}
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 10px;
  align-items: end;
  margin: 0;
}
.controls label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--geo-ocean-deep);
}
.controls input,
.controls select {
  min-height: 34px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
  font-size: 12.5px;
}
.btn-update-map {
  min-height: 34px;
  padding: 0 14px;
  border: 0;
  border-radius: var(--radius-pill);
  background: var(--geo-ocean);
  color: white;
  cursor: pointer;
  font-size: 12.5px;
  font-weight: 700;
}
.btn-toggle-sample {
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  background: var(--bg-soft);
  color: var(--geo-ocean-deep);
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}

/* 卷帘点按与键盘工具栏 */
.curtain-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 6px;
  border-top: 1px dashed var(--border);
}
.curtain-label {
  font-size: 12px;
  color: var(--text-muted);
}
.curtain-label kbd {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 11px;
}
.curtain-quick-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.curtain-btn {
  min-height: 30px;
  padding: 3px 9px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--geo-ocean-deep);
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
}
.curtain-btn.active {
  background: var(--geo-ocean);
  color: #ffffff;
  border-color: var(--geo-ocean);
}

/* 失败恢复与示例状态条 */
.sat-status-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 14px;
  background: #fffbeb;
  border: 1px solid #f59e0b;
  border-radius: var(--radius-sm);
  margin-bottom: 10px;
}
.sat-status-text > strong {
  display: block;
  font-size: 13px;
  color: #92400e;
  margin-bottom: 2px;
}
.sat-status-text p {
  margin: 0;
  font-size: 11.5px;
  color: #78350f;
  line-height: 1.45;
}
.sat-status-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.btn-retry-tiles,
.btn-use-sample {
  min-height: 32px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.btn-retry-tiles {
  background: #d97706;
  color: #ffffff;
  border: 0;
}
.btn-use-sample {
  background: #ffffff;
  color: #92400e;
  border: 1px solid #d97706;
}

.map-frame {
  height: min(56vw, 490px);
  min-height: 300px;
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-box);
  background: #102a3a;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-md);
}
.map-frame:focus-visible {
  outline: 3px solid var(--geo-ocean);
  outline-offset: 3px;
}
.map-pane,
.sample-pane {
  position: absolute;
  inset: 0;
}
.map-pane.is-hidden {
  opacity: 0;
  pointer-events: none;
}
.sample-svg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.map-overlay {
  z-index: 2;
  pointer-events: none;
}
.divider {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 3px;
  background: white;
  z-index: 4;
  pointer-events: none;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.5);
}
.divider-handle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(15, 39, 66, 0.9);
  color: #ffffff;
  border: 2px solid #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
}
.map-tag {
  position: absolute;
  z-index: 5;
  top: 12px;
  padding: 5px 11px;
  border-radius: var(--radius-pill);
  background: rgba(15, 39, 66, 0.85);
  backdrop-filter: blur(6px);
  color: white;
  font-size: 12px;
  font-weight: 600;
  pointer-events: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.map-tag.left { left: 12px; }
.map-tag.right { right: 12px; }
.swipe {
  position: absolute;
  z-index: 6;
  left: 0;
  bottom: 14px;
  width: calc(100% - 36px);
  margin: 0 18px;
  accent-color: var(--geo-ocean);
  cursor: ew-resize;
}

/* 4. 1 分钟遥感比较与证据卡工作台 */
.sat-observation-workbench {
  margin-top: 16px;
  padding: 18px 20px;
  border-radius: var(--radius-card);
  background: var(--surface);
  border: 1.5px solid rgba(2, 132, 199, 0.35);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.wb-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 8px;
}
.wb-kicker {
  font-size: 11.5px;
  font-weight: 700;
  color: #0284c7;
  letter-spacing: 0.04em;
}
.wb-head h2 {
  margin: 3px 0 0;
  font-size: 18px;
  color: var(--geo-ocean-deep);
  font-weight: 800;
}
.wb-layer-tag {
  font-size: 11px;
  font-family: ui-monospace, monospace;
  color: var(--text-muted);
  background: var(--bg-soft);
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid var(--border);
}
.wb-step {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.wb-step-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--geo-ocean-deep);
}
.wb-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.wb-chip {
  padding: 7px 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg-soft);
  color: var(--geo-ocean-deep);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}
.wb-chip.active {
  background: #e0f2fe;
  border-color: #0284c7;
  color: #0369a1;
  font-weight: 700;
}
.wb-input-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.wb-input-row input {
  flex: 1 1 280px;
  min-height: 38px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  font-size: 13px;
  color: var(--text);
  background: var(--surface);
}
.btn-preview-evidence {
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
.btn-sat-discuss {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 16px;
  border-radius: 8px;
  background: var(--geo-ocean);
  color: #ffffff;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
}

/* 遥感证据卡预览框 */
.sat-evidence-card {
  background: #f8fafc;
  border: 1px solid #93c5fd;
  border-left: 4px solid #0284c7;
  border-radius: 10px;
  padding: 14px 16px;
}
.sec-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}
.sec-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.sat-review-alert {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 14px;
  background: #fffbeb;
  border: 1.5px solid #f59e0b;
  border-radius: 8px;
}
.sat-review-text {
  font-size: 12.5px;
  color: #78350f;
  line-height: 1.5;
  flex: 1 1 360px;
}
.sat-review-text strong {
  color: #92400e;
}
.sat-review-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.btn-confirm-obs {
  background: #d97706;
  color: #ffffff;
  border: 0;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.btn-clear-obs {
  background: #ffffff;
  color: #92400e;
  border: 1px solid #d97706;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.wb-review-pill {
  display: inline-block;
  margin-left: 6px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #f59e0b;
  font-size: 11px;
  font-weight: 700;
}
.sec-badge-main {
  background: #0284c7;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
}
.sec-badge-real {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #34d399;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
}
.sec-badge-sample {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #f59e0b;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
}
.sec-status {
  font-size: 12px;
  color: #059669;
  font-weight: 600;
}
.sec-title {
  margin: 0 0 10px;
  font-size: 15.5px;
  color: var(--geo-ocean-deep);
}
.sec-grid {
  margin: 0 0 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 14px;
  font-size: 12.5px;
}
.sec-grid div {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 10px;
}
.sec-grid div.full-span {
  grid-column: 1 / -1;
}
.sec-grid div.sec-limit {
  background: #fffbeb;
  border-color: #fde68a;
}
.sec-grid dt {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 2px;
}
.sec-grid dd {
  margin: 0;
  color: #0f172a;
  line-height: 1.5;
}
.sec-share-row {
  padding-top: 10px;
  border-top: 1px dashed #cbd5e1;
}
.sec-share-label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: var(--geo-ocean-deep);
  margin-bottom: 6px;
}
.sec-share-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.sec-share-input {
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
.btn-copy-sat-share {
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

/* 元数据与可信度说明面板 */
.sat-meta-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 16px 20px;
  margin-top: 18px;
  box-shadow: var(--shadow-xs);
}
.sat-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 18px;
}
.sat-meta-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.sat-meta-item.full-row {
  grid-column: 1 / -1;
  padding-top: 8px;
  border-top: 1px dashed var(--border);
}
.meta-kicker {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--geo-ocean);
}
.sat-meta-item strong {
  font-size: 14px;
  color: var(--geo-ocean-deep);
}
.sat-meta-item small,
.sat-meta-item p {
  margin: 0;
  font-size: 12.5px;
  color: var(--text-muted);
  line-height: 1.55;
}
.sat-source-links {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  font-size: 12.5px;
  color: var(--text-muted);
}
.sat-source-links a {
  color: var(--geo-ocean);
  font-weight: 700;
  text-decoration: none;
}
.sat-source-links a:hover {
  text-decoration: underline;
}

.wb-chip-clear {
  background: #fff1f2;
  color: #be123c;
  border: 1px solid #fecdd3;
}
.wb-example-pill {
  display: inline-block;
  margin-left: 6px;
  padding: 2px 8px;
  font-size: 11.5px;
  font-weight: 700;
  color: #92400e;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 999px;
}
.wb-user-pill {
  display: inline-block;
  margin-left: 6px;
  padding: 2px 8px;
  font-size: 11.5px;
  font-weight: 700;
  color: #065f46;
  background: #d1fae5;
  border: 1px solid #34d399;
  border-radius: 999px;
}
.sec-badge-example {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #f59e0b;
  font-size: 11.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
}

@media (max-width: 760px) {
  .lab-page {
    padding: 10px 12px 60px;
  }
  .sat-title-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }
  .sat-mission-header h1 {
    font-size: 19px;
  }
  .sat-question-sub {
    font-size: 12px;
  }
  .sat-caution-pill {
    padding: 6px 10px;
    font-size: 11.5px;
  }
  .sat-compact-toolbar {
    padding: 8px 10px;
    gap: 6px;
  }
  .controls {
    gap: 6px;
  }
  .controls label {
    font-size: 11.5px;
  }
  .controls input,
  .controls select,
  .btn-update-map,
  .btn-toggle-sample {
    min-height: 30px;
    font-size: 11.5px;
  }
  .curtain-btn {
    min-height: 26px;
    padding: 2px 7px;
    font-size: 11.5px;
  }
  .map-frame {
    height: 260px;
    min-height: 240px;
  }
  .map-tag {
    top: 8px;
    padding: 3px 7px;
    font-size: 11.5px;
    max-width: 44%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .map-tag.left { left: 8px; }
  .map-tag.right { right: 8px; }
  .sec-grid,
  .sat-meta-grid {
    grid-template-columns: 1fr;
  }
}
</style>
