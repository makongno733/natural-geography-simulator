<template>
  <div class="urban-flood-sim" role="region" aria-label="城市降雨径流与下渗仿真模拟器">
    <!-- 顶部标题与模型性质声明 -->
    <div class="sim-header">
      <div class="sim-title-group">
        <span class="sim-badge">水循环 · 定性水动力学教学模型（教学仿真，非现场实测）</span>
        <h3>城市暴雨产流与海绵下渗仿真实验台</h3>
        <p class="sim-meta-note">
          教学仿真说明：本实验台采用归一化水文推理公式（Q = C·I·A）与 Horton 下渗简化教学模型，仅用于对比不同下渗条件下的产流趋势（教学仿真，非现场实测）。
        </p>
      </div>
      <div class="sim-actions-top">
        <button type="button" class="btn-preset" @click="applyPreset('traditional')">标准硬化城区</button>
        <button type="button" class="btn-preset" @click="applyPreset('sponge')">海绵改造试点</button>
        <button type="button" class="btn-preset" @click="applyPreset('natural')">天然植被林地</button>
      </div>
    </div>

    <!-- 分享链接还原提示横幅（当通过分享链接打开时自动展示） -->
    <div v-if="isSharedSession" class="shared-restore-banner" role="status" aria-live="polite">
      <div class="shared-banner-head">
        <span class="shared-pill">🔗 已从分享链接还原同一次对照观察</span>
        <span class="sim-disclaimer-pill">教学仿真，非现场实测</span>
      </div>
      <p class="shared-banner-desc">
        当前已精准还原分享者的对照条件：<strong>{{ comparisonCard.conditionsText }}</strong>，并排对比
        <strong>「{{ metricsA.surfaceName }}（峰值 {{ metricsA.peakDischarge }} m³/s）」</strong>与
        <strong>「{{ metricsB.surfaceName }}（峰值 {{ metricsB.peakDischarge }} m³/s）」</strong>。本链接仅还原公开实验参数，不包含任何私人草稿或账号信息。
      </p>
    </div>

    <!-- 3 分钟快速对照引导区（先猜 → 固定雨强切换地表并排对照 → 写一句解释 → 生成证据卡与分享链接） -->
    <section class="quick-compare-box" aria-labelledby="quick-compare-title">
      <div class="qc-top-bar">
        <div>
          <span class="qc-kicker">⏱ 3 分钟核心对照路径 · 教学仿真，非现场实测</span>
          <h4 id="quick-compare-title">同一场雨，哪种路面积水更严重？</h4>
        </div>
        <button type="button" class="btn-reset-standard" @click="resetStandardCompare">
          ↺ 恢复标准对照 (50 mm/h · 60 分钟)
        </button>
      </div>

      <!-- 第 1 步：先猜一猜 -->
      <div class="qc-step-block">
        <div class="qc-step-title">
          <span class="qc-num">1</span>
          <strong>先猜一猜：</strong>
          <span>保持 {{ rainIntensity }} mm/h、持续 {{ rainDuration }} 分钟的同一场雨，哪种地面的地表径流峰值更大、更容易积水？</span>
        </div>
        <div class="guess-btn-group" role="group" aria-label="实验前直觉预测">
          <button
            type="button"
            :class="['guess-btn', { active: userGuess === 'concrete' }]"
            @click="selectGuess('concrete')"
          >
            🏢 传统水泥/沥青更严重
          </button>
          <button
            type="button"
            :class="['guess-btn', { active: userGuess === 'vegetation' }]"
            @click="selectGuess('vegetation')"
          >
            🌲 天然林地草甸更严重
          </button>
          <button
            type="button"
            :class="['guess-btn', { active: userGuess === 'sponge' }]"
            @click="selectGuess('sponge')"
          >
            🧱 海绵透水铺装更严重
          </button>
        </div>
        <p v-if="userGuess" class="guess-feedback" role="status">
          ✓ 已记录你的猜想（<strong>{{ guessLabelMap[userGuess] }}</strong>）！下面保持降雨强度
          <strong>{{ rainIntensity }} mm/h</strong> 和历时 <strong>{{ rainDuration }} 分钟</strong> 不变，只切换地表材质并排对比结果。
        </p>
      </div>

      <!-- 第 2 步：固定雨强与历时，并排观察两组结果 -->
      <div class="qc-step-block">
        <div class="qc-step-title">
          <span class="qc-num">2</span>
          <strong>固定雨强与历时，只切换地表并排对照：</strong>
          <span class="locked-cond-tag">
            🔒 固定条件：雨强 {{ rainIntensity }} mm/h（{{ rainLevelName }}）· 历时 {{ rainDuration }} 分钟 · 坡度 {{ slope }}°
          </span>
        </div>

        <div class="compare-dual-grid">
          <!-- 对照组 A -->
          <div class="compare-card group-a" :class="{ 'is-focused': surface === surfaceA }">
            <div class="compare-card-head">
              <span class="group-tag tag-a">对照组 A（基准地面）</span>
              <select v-model="surfaceA" aria-label="选择对照组A地表材质" @change="onCompareSurfaceChange('A')">
                <option v-for="s in surfaces" :key="`a-${s.id}`" :value="s.id">{{ s.icon }} {{ s.name }}</option>
              </select>
            </div>
            <div class="compare-metrics-row">
              <div class="c-metric primary">
                <span class="cm-label">地表径流峰值</span>
                <strong class="cm-val">{{ metricsA.peakDischarge }} <small>m³/s</small></strong>
              </div>
              <div class="c-metric">
                <span class="cm-label">下渗补给率</span>
                <strong class="cm-val">{{ metricsA.infiltrationPercent }}%</strong>
              </div>
              <div class="c-metric">
                <span class="cm-label">达峰历时</span>
                <strong class="cm-val">{{ metricsA.timeToPeak }} <small>分钟</small></strong>
              </div>
              <div class="c-metric">
                <span class="cm-label">路面积水估测</span>
                <strong class="cm-val">{{ metricsA.waterDepth }} <small>mm</small></strong>
              </div>
            </div>
            <p class="compare-risk-line" :style="{ color: metricsA.riskColor }">
              状态：{{ metricsA.riskLevelName }}（径流系数 {{ metricsA.runoffCoeff }}）
            </p>
          </div>

          <!-- 对照组 B -->
          <div class="compare-card group-b" :class="{ 'is-focused': surface === surfaceB }">
            <div class="compare-card-head">
              <span class="group-tag tag-b">对照组 B（对比地面）</span>
              <select v-model="surfaceB" aria-label="选择对照组B地表材质" @change="onCompareSurfaceChange('B')">
                <option v-for="s in surfaces" :key="`b-${s.id}`" :value="s.id">{{ s.icon }} {{ s.name }}</option>
              </select>
            </div>
            <div class="compare-metrics-row">
              <div class="c-metric primary highlight-b">
                <span class="cm-label">地表径流峰值</span>
                <strong class="cm-val">{{ metricsB.peakDischarge }} <small>m³/s</small></strong>
              </div>
              <div class="c-metric">
                <span class="cm-label">下渗补给率</span>
                <strong class="cm-val">{{ metricsB.infiltrationPercent }}%</strong>
              </div>
              <div class="c-metric">
                <span class="cm-label">达峰历时</span>
                <strong class="cm-val">{{ metricsB.timeToPeak }} <small>分钟</small></strong>
              </div>
              <div class="c-metric">
                <span class="cm-label">路面积水估测</span>
                <strong class="cm-val">{{ metricsB.waterDepth }} <small>mm</small></strong>
              </div>
            </div>
            <p class="compare-risk-line" :style="{ color: metricsB.riskColor }">
              状态：{{ metricsB.riskLevelName }}（相比 A 峰值相差 <strong>{{ comparisonCard.peakDiff }} m³/s</strong>，削峰 <strong>{{ comparisonCard.relativeReduction }}%</strong>）
            </p>
          </div>
        </div>
      </div>

      <!-- 第 3 步：记录一句解释 → 生成证据卡 -->
      <div class="qc-step-block">
        <div class="qc-step-title">
          <span class="qc-num">3</span>
          <strong>记录一句解释，生成可分享的科学证据卡：</strong>
          <button type="button" class="btn-fill-claim" @click="fillSampleClaim">
            ✨ 填入实证解释参考句
          </button>
        </div>
        <div class="claim-input-row">
          <input
            id="quick-claim-input"
            v-model="studentClaim"
            type="text"
            maxlength="240"
            aria-label="一句话科学解释"
            :placeholder="`例如：固定 ${rainIntensity} mm/h、${rainDuration} 分钟暴雨，${metricsB.surfaceName}下渗率（${metricsB.infiltrationPercent}%）高于${metricsA.surfaceName}（${metricsA.infiltrationPercent}%），使径流峰值从 ${metricsA.peakDischarge} 降至 ${metricsB.peakDischarge} m³/s。`"
          />
          <button type="button" class="btn-generate-evidence" @click="generateAndShowEvidenceCard">
            📋 生成对照证据卡
          </button>
        </div>
      </div>

      <!-- 第 4 步：生成的结构化对照证据卡（含模型名称、条件、两组结果、单位、证据类型、适用边界与可复现分享链接） -->
      <div v-if="showComparisonEvidence" id="reproducible-evidence-card" class="generated-evidence-card" role="region" aria-label="已生成的可复现对照证据卡">
        <div class="gec-header">
          <div class="gec-title-wrap">
            <span class="gec-type-badge">📊 科学对照证据卡</span>
            <span class="gec-sim-badge">{{ comparisonCard.disclaimer }}</span>
          </div>
          <span class="gec-status">{{ copyFeedback || '✓ 证据卡已就绪，可复制链接在任意新会话还原对照' }}</span>
        </div>

        <h5 class="gec-main-title">{{ comparisonCard.title }}</h5>

        <dl class="gec-meta-grid">
          <div class="gec-meta-item">
            <dt>模型名称</dt>
            <dd>{{ comparisonCard.modelName }}</dd>
          </div>
          <div class="gec-meta-item">
            <dt>证据类型</dt>
            <dd>{{ comparisonCard.evidenceType }}</dd>
          </div>
          <div class="gec-meta-item full-span">
            <dt>固定实验条件</dt>
            <dd>{{ comparisonCard.conditionsText }}</dd>
          </div>
          <div class="gec-meta-item">
            <dt>对照组 A（{{ comparisonCard.groupA.surfaceName }}）</dt>
            <dd>
              地表径流峰值 <strong>{{ comparisonCard.groupA.peakDischarge }} m³/s</strong> ·
              下渗率 <strong>{{ comparisonCard.groupA.infiltrationPercent }}%</strong> ·
              达峰历时 <strong>{{ comparisonCard.groupA.timeToPeak }} 分钟</strong> ·
              估算积水 <strong>{{ comparisonCard.groupA.waterDepth }} mm</strong>
            </dd>
          </div>
          <div class="gec-meta-item">
            <dt>对照组 B（{{ comparisonCard.groupB.surfaceName }}）</dt>
            <dd>
              地表径流峰值 <strong>{{ comparisonCard.groupB.peakDischarge }} m³/s</strong> ·
              下渗率 <strong>{{ comparisonCard.groupB.infiltrationPercent }}%</strong> ·
              达峰历时 <strong>{{ comparisonCard.groupB.timeToPeak }} 分钟</strong> ·
              估算积水 <strong>{{ comparisonCard.groupB.waterDepth }} mm</strong>
            </dd>
          </div>
          <div class="gec-meta-item full-span">
            <dt>我的实证解释</dt>
            <dd>{{ comparisonCard.claim }}</dd>
          </div>
          <div class="gec-meta-item full-span gec-limit-box">
            <dt>适用边界与说明</dt>
            <dd>{{ comparisonCard.limitations }}（<strong>{{ comparisonCard.disclaimer }}</strong>）</dd>
          </div>
        </dl>

        <div class="gec-share-bar">
          <label class="share-url-label" for="reproducible-share-url">可复现公开分享链接（不含私人草稿与账号信息）：</label>
          <div class="share-url-controls">
            <input
              id="reproducible-share-url"
              :value="shareUrl"
              readonly
              class="share-url-input"
              aria-label="可复现对照分享链接"
              @focus="$event.target.select()"
            />
            <button type="button" class="btn-copy-share" @click="copyShareLink">
              {{ copyFeedback ? '✓ 已复制分享链接' : '🔗 复制分享链接' }}
            </button>
            <router-link :to="communityDiscussRoute" class="btn-discuss-evidence">
              💬 带着这张证据卡去社区讨论 ↗
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <div class="sim-grid">
      <!-- 控制面板 -->
      <div class="sim-controls">
        <fieldset class="control-group">
          <legend>1. 当前剖面焦点地表材质（点击切换下方动画剖面）</legend>
          <div class="radio-cards" role="radiogroup" aria-label="地表材质">
            <label
              v-for="s in surfaces"
              :key="s.id"
              :class="['surface-card', { active: surface === s.id }]"
            >
              <input
                type="radio"
                name="surface"
                :value="s.id"
                v-model="surface"
                @change="onSingleSurfaceRadioChange(s.id)"
              />
              <span class="card-icon">{{ s.icon }}</span>
              <div class="card-info">
                <strong>{{ s.name }}</strong>
                <span class="card-sub">{{ s.sub }}</span>
              </div>
            </label>
          </div>
        </fieldset>

        <div class="slider-row">
          <label class="slider-label" for="rain-slider">
            <span class="label-txt">降雨强度</span>
            <span class="label-val"><strong>{{ rainIntensity }}</strong> mm/h ({{ rainLevelName }})</span>
          </label>
          <input
            id="rain-slider"
            v-model.number="rainIntensity"
            type="range"
            min="10"
            max="120"
            step="5"
            aria-label="降雨强度"
          />
          <div class="range-marks">
            <span>中雨 20</span>
            <span>大雨 40</span>
            <span>暴雨 80</span>
            <span>特大暴雨 120</span>
          </div>
        </div>

        <div class="slider-row">
          <label class="slider-label" for="duration-slider">
            <span class="label-txt">降雨历时</span>
            <span class="label-val"><strong>{{ rainDuration }}</strong> 分钟</span>
          </label>
          <input
            id="duration-slider"
            v-model.number="rainDuration"
            type="range"
            min="15"
            max="120"
            step="15"
            aria-label="降雨历时"
          />
          <div class="range-marks">
            <span>短时 15min</span>
            <span>1小时 60min</span>
            <span>连阴雨 120min</span>
          </div>
        </div>

        <div class="slider-row">
          <label class="slider-label" for="slope-slider">
            <span class="label-txt">地表坡度</span>
            <span class="label-val"><strong>{{ slope }}°</strong> ({{ slopeDesc }})</span>
          </label>
          <input
            id="slope-slider"
            v-model.number="slope"
            type="range"
            min="1"
            max="8"
            step="1"
            aria-label="地表坡度"
          />
        </div>

        <div v-if="surface === 'sponge' || surfaceA === 'sponge' || surfaceB === 'sponge'" class="sponge-tuning">
          <label class="slider-label" for="sponge-depth">
            <span class="label-txt">碎石储水垫层设计厚度</span>
            <span class="label-val"><strong>{{ spongeCapacity }}</strong> mm 调蓄容量</span>
          </label>
          <input
            id="sponge-depth"
            v-model.number="spongeCapacity"
            type="range"
            min="10"
            max="45"
            step="5"
            aria-label="海绵储水容量"
          />
        </div>

        <div class="sim-capture-panel">
          <p class="capture-hint">保持其他条件不变，只改动一项（例如仅改变地表材质），点击下方生成客观对照证据：</p>
          <button type="button" class="btn-capture" @click="captureEvidence">
            📸 捕获本组实验参数为【科学证据卡】
          </button>
        </div>
      </div>

      <!-- 可视化展示区 -->
      <div class="sim-stage">
        <!-- 地表剖面水文微观动画 SVG -->
        <div class="profile-viewport">
          <svg viewBox="0 0 600 240" class="profile-svg" aria-label="地表下渗剖面水动力模拟图">
            <defs>
              <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#1e293b" />
                <stop offset="100%" stop-color="#334155" />
              </linearGradient>
              <linearGradient id="concreteGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#64748b" />
                <stop offset="100%" stop-color="#475569" />
              </linearGradient>
              <linearGradient id="vegGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#15803d" />
                <stop offset="100%" stop-color="#14532d" />
              </linearGradient>
              <linearGradient id="spongeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#0284c7" />
                <stop offset="100%" stop-color="#0369a1" />
              </linearGradient>
              <pattern id="rainDots" width="20" height="20" patternUnits="userSpaceOnUse">
                <line x1="5" y1="2" x2="2" y2="12" stroke="#60a5fa" stroke-width="1.5" stroke-linecap="round" />
                <line x1="15" y1="8" x2="12" y2="18" stroke="#93c5fd" stroke-width="1.2" stroke-linecap="round" />
              </pattern>
            </defs>

            <!-- 天空背景 -->
            <rect x="0" y="0" width="600" height="240" fill="url(#skyGrad)" rx="8" />

            <!-- 雨水粒子动画层 -->
            <rect x="0" y="0" width="600" height="130" fill="url(#rainDots)" :opacity="rainIntensity / 100" class="rain-flow" />

            <!-- 地表土层与结构剖面 -->
            <path
              :d="`M 0 130 L 600 ${130 + slope * 3} L 600 240 L 0 240 Z`"
              fill="#27272a"
            />

            <!-- 铺装表层 -->
            <path
              :d="`M 0 130 L 600 ${130 + slope * 3} L 600 ${148 + slope * 3} L 0 148 Z`"
              :fill="surface === 'concrete' ? 'url(#concreteGrad)' : surface === 'vegetation' ? 'url(#vegGrad)' : 'url(#spongeGrad)'"
            />

            <!-- 碎石调蓄层 (海绵模式特有) -->
            <rect
              v-if="surface === 'sponge'"
              x="20"
              :y="155 + slope"
              width="560"
              height="35"
              fill="#0e7490"
              opacity="0.6"
              rx="4"
            />
            <text
              v-if="surface === 'sponge'"
              x="300"
              :y="178 + slope"
              fill="#e0f2fe"
              font-size="11"
              text-anchor="middle"
            >
              地下碎石调蓄层（透水蓄水孔隙率 35%）
            </text>

            <!-- 地表积水层 -->
            <path
              v-if="calcWaterDepth > 2"
              :d="`M 0 ${130 - Math.min(calcWaterDepth, 25)} L 600 ${130 + slope * 3 - Math.min(calcWaterDepth, 25)} L 600 ${130 + slope * 3} L 0 130 Z`"
              fill="#38bdf8"
              opacity="0.65"
            />

            <!-- 动态汇流箭头 -->
            <g v-if="calcWaterDepth > 5" stroke="#bae6fd" stroke-width="2" fill="none">
              <path d="M 120 120 Q 200 125 320 128" />
              <path d="M 360 129 Q 450 132 540 135" />
            </g>

            <!-- 下渗流箭头 -->
            <g :opacity="calcInfiltrationRatio" stroke="#4ade80" stroke-width="2" stroke-dasharray="3,3">
              <line x1="150" y1="140" x2="150" y2="200" />
              <line x1="300" y1="140" x2="300" y2="200" />
              <line x1="450" y1="140" x2="450" y2="200" />
            </g>

            <!-- 标签文字 -->
            <text x="24" y="30" fill="#f8fafc" font-size="14" font-weight="bold">
              {{ currentSurfaceName }}（教学仿真，非现场实测）
            </text>
            <text x="24" y="52" fill="#94a3b8" font-size="12">
              下渗补给率：{{ Math.round(calcInfiltrationRatio * 100) }}% | 产流汇集历时：{{ calcTimeToPeak }} 分钟
            </text>
            <text x="576" y="30" fill="#f8fafc" font-size="13" text-anchor="end" font-weight="bold">
              内涝积水深度估测：{{ calcWaterDepth }} mm
            </text>
            <text x="576" y="52" :fill="riskColor" font-size="12" text-anchor="end" font-weight="bold">
              【{{ riskLevelName }}】
            </text>
          </svg>
        </div>

        <!-- 水文产流历时折线图 (Hydrograph) -->
        <div class="hydrograph-card">
          <div class="hydro-header">
            <h4>降雨-地表径流历时过程曲线（教学仿真，非现场实测）</h4>
            <div class="hydro-legend">
              <span class="legend-item"><span class="dot current-dot"></span>当前选中地面 ({{ currentSurfaceName }})</span>
              <span class="legend-item"><span class="dot ref-dot"></span>水泥基准 ({{ refPeakDischarge }} m³/s)</span>
            </div>
          </div>
          <svg viewBox="0 0 500 130" class="hydro-svg" aria-label="水文过程曲线图">
            <!-- 坐标网格 -->
            <line x1="40" y1="110" x2="480" y2="110" stroke="#334155" stroke-width="1" />
            <line x1="40" y1="20" x2="40" y2="110" stroke="#334155" stroke-width="1" />
            <text x="40" y="125" fill="#64748b" font-size="10">0m</text>
            <text x="180" y="125" fill="#64748b" font-size="10">30m</text>
            <text x="320" y="125" fill="#64748b" font-size="10">60m</text>
            <text x="460" y="125" fill="#64748b" font-size="10">120m</text>
            <text x="10" y="24" fill="#64748b" font-size="10">流量</text>

            <!-- 传统水泥基准参照线 (灰色虚线) -->
            <path :d="refHydroPath" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,4" />

            <!-- 当前工况径流线 (高亮) -->
            <path :d="currentHydroPath" fill="none" :stroke="curveColor" stroke-width="2.5" />

            <!-- 洪峰标记点 -->
            <circle :cx="peakPoint.x" :cy="peakPoint.y" r="4" :fill="curveColor" />
            <text :x="peakPoint.x + 8" :y="peakPoint.y - 4" :fill="curveColor" font-size="11" font-weight="bold">
              峰值 {{ calcPeakDischarge }} m³/s
            </text>
          </svg>
          <div class="hydro-metrics">
            <div class="metric-item">
              <span class="m-label">总降雨量</span>
              <span class="m-val">{{ calcTotalPrecipitation }} mm</span>
            </div>
            <div class="metric-item">
              <span class="m-label">地表径流峰值</span>
              <span class="m-val">{{ calcPeakDischarge }} m³/s</span>
            </div>
            <div class="metric-item">
              <span class="m-label">产流洪峰延缓</span>
              <span class="m-val">+{{ Math.max(0, calcTimeToPeak - 8) }} 分钟</span>
            </div>
            <div class="metric-item highlight">
              <span class="m-label">相对硬化削峰率</span>
              <span class="m-val">{{ calcPeakReductionRate }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 探究思考与带着问题去讨论模块 -->
    <div class="inquiry-discussion-box">
      <div class="discussion-badge">💬 探究思考与讨论 · 教学仿真，非现场实测</div>
      <h4>思考与讨论：地表铺装如何改变雨水去向？</h4>
      <p class="discussion-prompt">
        保持雨量相同（例如 50 mm/h 暴雨、60 分钟），把地表从传统水泥/沥青（峰值 44.4 m³/s）改为天然林地草甸（峰值 11.7 m³/s）或海绵透水铺装（峰值 30.4 m³/s）后，地表径流与下渗发生了怎样的变化？在真实城市街区里，还有哪些因素（如地下管网顶托、连续降雨土壤饱和）是当前教学模型未计入的？
      </p>
      <div class="discussion-actions">
        <router-link
          :to="communityDiscussRoute"
          class="btn-go-discuss"
        >
          带着这个观察去社区提问 / 讨论 ↗
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  URBAN_FLOOD_SURFACES,
  URBAN_FLOOD_MODEL_META,
  computeUrbanFloodMetrics,
  buildComparisonEvidenceCard,
  serializeUrbanFloodShareQuery,
  parseUrbanFloodShareQuery
} from './urbanFloodModel.js'

const emit = defineEmits(['capture'])

let maybeRoute = null
let maybeRouter = null
try {
  maybeRoute = useRoute()
  maybeRouter = useRouter()
} catch {
  maybeRoute = null
  maybeRouter = null
}

const surfaces = URBAN_FLOOD_SURFACES

const guessLabelMap = {
  concrete: '传统水泥/沥青积水更严重',
  vegetation: '天然林地草甸积水更严重',
  sponge: '海绵透水铺装积水更严重'
}

const surface = ref('concrete')
const surfaceA = ref('concrete')
const surfaceB = ref('vegetation')
const rainIntensity = ref(50) // mm/h
const rainDuration = ref(60) // 分钟
const slope = ref(2) // 度
const spongeCapacity = ref(25) // mm

const userGuess = ref('')
const studentClaim = ref('')
const showComparisonEvidence = ref(false)
const isSharedSession = ref(false)
const copyFeedback = ref('')

function restoreFromQuery(q) {
  const parsed = parseUrbanFloodShareQuery(q)
  if (!parsed) return
  rainIntensity.value = parsed.rainIntensity
  rainDuration.value = parsed.rainDuration
  slope.value = parsed.slope
  spongeCapacity.value = parsed.spongeCapacity
  surfaceA.value = parsed.surfaceA
  surfaceB.value = parsed.surfaceB
  surface.value = parsed.surfaceB || parsed.surfaceA
  if (parsed.guess) userGuess.value = parsed.guess
  if (parsed.claim) studentClaim.value = parsed.claim
  if (parsed.isShared) {
    isSharedSession.value = true
    showComparisonEvidence.value = true
  }
}

onMounted(() => {
  if (maybeRoute?.query) {
    restoreFromQuery(maybeRoute.query)
  }
})

if (maybeRoute) {
  watch(
    () => maybeRoute.query,
    (q) => {
      if (q && (q.shared === '1' || q.mode === 'compare' || q.rain || q.surfaceA || q.surfaceB)) {
        restoreFromQuery(q)
      }
    }
  )
}

// 当前焦点地面指标（保持与单地面控制区完全一致）
const currentMetrics = computed(() =>
  computeUrbanFloodMetrics({
    surface: surface.value,
    rainIntensity: rainIntensity.value,
    rainDuration: rainDuration.value,
    slope: slope.value,
    spongeCapacity: spongeCapacity.value
  })
)

// 并排对照组 A 与对照组 B 指标
const metricsA = computed(() =>
  computeUrbanFloodMetrics({
    surface: surfaceA.value,
    rainIntensity: rainIntensity.value,
    rainDuration: rainDuration.value,
    slope: slope.value,
    spongeCapacity: spongeCapacity.value
  })
)

const metricsB = computed(() =>
  computeUrbanFloodMetrics({
    surface: surfaceB.value,
    rainIntensity: rainIntensity.value,
    rainDuration: rainDuration.value,
    slope: slope.value,
    spongeCapacity: spongeCapacity.value
  })
)

const comparisonCard = computed(() =>
  buildComparisonEvidenceCard({
    surfaceA: surfaceA.value,
    surfaceB: surfaceB.value,
    rainIntensity: rainIntensity.value,
    rainDuration: rainDuration.value,
    slope: slope.value,
    spongeCapacity: spongeCapacity.value,
    guess: userGuess.value,
    claim: studentClaim.value
  })
)

const currentSurfaceName = computed(() => currentMetrics.value.surfaceName)
const rainLevelName = computed(() => currentMetrics.value.rainLevelName)
const slopeDesc = computed(() => currentMetrics.value.slopeDesc)
const calcTotalPrecipitation = computed(() => currentMetrics.value.totalPrecipitation)
const calcInfiltrationRatio = computed(() => currentMetrics.value.infiltrationRatio)
const calcRunoffCoeff = computed(() => currentMetrics.value.runoffCoeff)
const calcTimeToPeak = computed(() => currentMetrics.value.timeToPeak)
const calcPeakDischarge = computed(() => currentMetrics.value.peakDischarge)
const refPeakDischarge = computed(() => currentMetrics.value.refPeakDischarge)
const calcPeakReductionRate = computed(() => currentMetrics.value.peakReductionRate)
const calcWaterDepth = computed(() => currentMetrics.value.waterDepth)
const riskLevelName = computed(() => currentMetrics.value.riskLevelName)
const riskColor = computed(() => currentMetrics.value.riskColor)

const curveColor = computed(() => {
  if (surface.value === 'vegetation') return '#22c55e'
  if (surface.value === 'sponge') return '#38bdf8'
  return '#f43f5e'
})

// 水文过程线 SVG 路径生成
const peakPoint = computed(() => {
  const tPeak = calcTimeToPeak.value
  const x = 40 + (tPeak / 120) * 440
  const y = 110 - (calcPeakDischarge.value / 110) * 85
  return { x: Math.max(50, Math.min(460, x)), y: Math.max(25, Math.min(105, y)) }
})

const currentHydroPath = computed(() => {
  const p = peakPoint.value
  return `M 40 110 Q ${p.x * 0.7} ${p.y} ${p.x} ${p.y} T 470 108`
})

const refHydroPath = computed(() => {
  const x = 40 + (8 / 120) * 440
  const y = 110 - (refPeakDischarge.value / 110) * 85
  return `M 40 110 Q ${x * 0.7} ${y} ${x} ${y} T 470 108`
})

const shareQueryObj = computed(() =>
  serializeUrbanFloodShareQuery({
    surfaceA: surfaceA.value,
    surfaceB: surfaceB.value,
    rainIntensity: rainIntensity.value,
    rainDuration: rainDuration.value,
    slope: slope.value,
    spongeCapacity: spongeCapacity.value,
    guess: userGuess.value,
    claim: studentClaim.value || comparisonCard.value.claim
  })
)

const shareRelativeRoute = computed(() => {
  const params = new URLSearchParams(shareQueryObj.value)
  return `/inquiry?${params.toString()}`
})

const shareUrl = computed(() => {
  if (typeof window === 'undefined') return `/#${shareRelativeRoute.value}`
  const base = `${window.location.origin}${window.location.pathname}`
  return `${base}#${shareRelativeRoute.value}`
})

const communityDiscussRoute = computed(() => {
  const c = comparisonCard.value
  const mA = c.groupA
  const mB = c.groupB
  return {
    path: '/community',
    query: {
      compose: 1,
      kind: 'question',
      evidenceId: 'ev-urban-sponge',
      linkedExperiment: 'water-cycle-3d',
      compareUrl: shareRelativeRoute.value,
      title: `【城市内涝探究】雨量相同（${mA.rainIntensity}mm/h·${mA.rainDuration}分钟）下，${mA.surfaceName}与${mB.surfaceName}对地表径流与下渗的影响观察`,
      body:
        `我在「${c.modelName}」（${c.disclaimer}）中进行了控制变量对照实验：\n\n` +
        `【固定实验条件】${c.conditionsText}\n` +
        `我看到：\n` +
        `- 对照组 A（${mA.surfaceName}）：下渗补给率 ${mA.infiltrationPercent}%，地表径流峰值 ${mA.peakDischarge} m³/s，达峰历时 ${mA.timeToPeak} 分钟，估算积水 ${mA.waterDepth} mm；\n` +
        `- 对照组 B（${mB.surfaceName}）：下渗补给率 ${mB.infiltrationPercent}%，地表径流峰值 ${mB.peakDischarge} m³/s，达峰历时 ${mB.timeToPeak} 分钟，估算积水 ${mB.waterDepth} mm（相比 A 峰值相差 ${c.peakDiff} m³/s，削峰率 ${c.relativeReduction}%）。\n\n` +
        `我猜 / 我的解释：${c.claim}\n\n` +
        `【适用边界与说明】：${c.limitations}\n` +
        `【可复现对照链接】：#${shareRelativeRoute.value}\n\n` +
        `我还想知道：在真实城市街区里，地下排水管网容量或连续多日降雨导致的土壤饱和，会如何改变这一仿真结论？`
    }
  }
})

function selectGuess(val) {
  userGuess.value = val
}

function onCompareSurfaceChange(which) {
  surface.value = which === 'A' ? surfaceA.value : surfaceB.value
}

function onSingleSurfaceRadioChange(selectedId) {
  if (selectedId !== surfaceA.value) {
    surfaceB.value = selectedId
  }
}

function resetStandardCompare() {
  rainIntensity.value = 50
  rainDuration.value = 60
  slope.value = 2
  spongeCapacity.value = 25
  surfaceA.value = 'concrete'
  surfaceB.value = 'vegetation'
  surface.value = 'vegetation'
  copyFeedback.value = ''
}

function fillSampleClaim() {
  const mA = metricsA.value
  const mB = metricsB.value
  studentClaim.value = `保持 ${mA.rainIntensity} mm/h、${mA.rainDuration} 分钟暴雨不变，${mB.surfaceName}下渗率（${mB.infiltrationPercent}%）远高于${mA.surfaceName}（${mA.infiltrationPercent}%），使地表径流峰值从 ${mA.peakDischarge} m³/s 降至 ${mB.peakDischarge} m³/s。`
}

function syncShareQueryToUrl() {
  try {
    maybeRouter?.replace?.({ query: { ...(maybeRoute?.query || {}), ...shareQueryObj.value } })
  } catch {}
}

function generateAndShowEvidenceCard() {
  if (!studentClaim.value.trim()) {
    fillSampleClaim()
  }
  showComparisonEvidence.value = true
  syncShareQueryToUrl()
  captureEvidence()
}

async function copyShareLink() {
  showComparisonEvidence.value = true
  syncShareQueryToUrl()
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl.value)
    }
    copyFeedback.value = '✓ 已复制可复现分享链接！在新浏览器打开即可还原本次对照'
  } catch {
    copyFeedback.value = '✓ 分享链接已生成，请直接复制下方文本框中的地址'
  }
}

function applyPreset(type) {
  if (type === 'traditional') {
    surface.value = 'concrete'
    surfaceA.value = 'concrete'
    rainIntensity.value = 50
    rainDuration.value = 60
    slope.value = 2
  } else if (type === 'sponge') {
    surface.value = 'sponge'
    surfaceB.value = 'sponge'
    rainIntensity.value = 50
    rainDuration.value = 60
    slope.value = 2
    spongeCapacity.value = 25
  } else if (type === 'natural') {
    surface.value = 'vegetation'
    surfaceB.value = 'vegetation'
    rainIntensity.value = 50
    rainDuration.value = 60
    slope.value = 2
  }
}

function captureEvidence() {
  showComparisonEvidence.value = true
  const c = comparisonCard.value
  const evidence = {
    title: `实验记录：${currentSurfaceName.value}与${c.groupB.surfaceName}对照（${rainIntensity.value}mm/h，历时${rainDuration.value}分）`,
    evidenceType: URBAN_FLOOD_MODEL_META.evidenceType,
    modelName: URBAN_FLOOD_MODEL_META.modelName,
    disclaimer: URBAN_FLOOD_MODEL_META.disclaimer,
    limitations: URBAN_FLOOD_MODEL_META.limitations,
    shareUrl: shareUrl.value,
    params: {
      模型名称: '城市暴雨产流与海绵下渗教学仿真模型',
      地表材质: `${currentSurfaceName.value}（对照：${c.groupA.surfaceName} vs ${c.groupB.surfaceName}）`,
      降雨强度: `${rainIntensity.value} mm/h (${rainLevelName.value})`,
      降雨历时: `${rainDuration.value} 分钟`,
      地表坡度: `${slope.value}°`,
      下渗率设定: `${Math.round(calcInfiltrationRatio.value * 100)}%`,
      证据类型: '教学仿真，非现场实测'
    },
    observation:
      `【仿真模型计算结果 · 教学仿真，非现场实测】设定总降水量 ${calcTotalPrecipitation.value}mm；` +
      `当前地面（${currentSurfaceName.value}）产流历时约 ${calcTimeToPeak.value}分钟达峰，估算径流峰值流量 ${calcPeakDischarge.value} m³/s，路面积水估算约 ${calcWaterDepth.value}mm（${riskLevelName.value}），相对水泥硬化路面模型削峰率约 ${calcPeakReductionRate.value}%。` +
      `并排对照：${c.groupA.surfaceName}峰值 ${c.groupA.peakDischarge} m³/s（下渗率 ${c.groupA.infiltrationPercent}%） vs ${c.groupB.surfaceName}峰值 ${c.groupB.peakDischarge} m³/s（下渗率 ${c.groupB.infiltrationPercent}%，相差 ${c.peakDiff} m³/s）。`,
    inference:
      `【因果推断】${c.claim}（${URBAN_FLOOD_MODEL_META.limitations}）`,
    confidence: 4,
    source: '城市下渗教学仿真模型（教学仿真，非现场实测）',
    tag: `${c.groupA.surfaceName} vs ${c.groupB.surfaceName}`
  }
  emit('capture', evidence)
}
</script>

<style scoped>
.urban-flood-sim {
  background: #0f172a;
  color: #f1f5f9;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #1e293b;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}

.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 16px;
  border-bottom: 1px solid #1e293b;
  padding-bottom: 14px;
}

.sim-badge {
  display: inline-block;
  font-size: 11px;
  color: #38bdf8;
  font-family: ui-monospace, monospace;
  font-weight: 700;
  letter-spacing: 0.06em;
  margin-bottom: 4px;
}

.sim-title-group h3 {
  margin: 0;
  font-size: 20px;
  color: #f8fafc;
}

.sim-meta-note {
  margin: 4px 0 0;
  font-size: 12px;
  color: #94a3b8;
  max-width: 680px;
  line-height: 1.45;
}

.sim-actions-top {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-preset {
  background: #1e293b;
  color: #cbd5e1;
  border: 1px solid #334155;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-preset:hover {
  background: #334155;
  color: #ffffff;
}

/* 分享还原提示条 */
.shared-restore-banner {
  background: rgba(14, 116, 144, 0.25);
  border: 1px solid #0ea5e9;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 16px;
}

.shared-banner-head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.shared-pill {
  background: #0284c7;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
}

.sim-disclaimer-pill {
  background: rgba(245, 158, 11, 0.2);
  color: #fde68a;
  border: 1px solid rgba(245, 158, 11, 0.45);
  font-size: 11.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
}

.shared-banner-desc {
  margin: 0;
  font-size: 13px;
  color: #e2e8f0;
  line-height: 1.55;
}

/* 3 分钟快速对照引导区 */
.quick-compare-box {
  background: #132238;
  border: 1px solid #264060;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.qc-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.qc-kicker {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  color: #38bdf8;
  margin-bottom: 2px;
}

.qc-top-bar h4 {
  margin: 0;
  font-size: 17px;
  color: #f8fafc;
}

.btn-reset-standard {
  background: #1e293b;
  color: #93c5fd;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.btn-reset-standard:hover {
  background: #334155;
  color: #ffffff;
}

.qc-step-block {
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid #1e293b;
  border-radius: 8px;
  padding: 12px 14px;
}

.qc-step-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 13.5px;
  color: #e2e8f0;
  margin-bottom: 10px;
}

.qc-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #0284c7;
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
}

.locked-cond-tag {
  background: rgba(56, 189, 248, 0.14);
  color: #bae6fd;
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
}

.guess-btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.guess-btn {
  background: #1e293b;
  color: #e2e8f0;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  min-height: 40px;
  transition: all 0.15s ease;
}

.guess-btn:hover {
  border-color: #38bdf8;
}

.guess-btn.active {
  background: rgba(2, 132, 199, 0.28);
  border-color: #38bdf8;
  color: #ffffff;
}

.guess-feedback {
  margin: 8px 0 0;
  font-size: 12.5px;
  color: #86efac;
  line-height: 1.5;
}

.compare-dual-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.compare-card {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 12px;
}

.compare-card.is-focused {
  border-color: #38bdf8;
}

.compare-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.group-tag {
  font-size: 11.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
}

.tag-a {
  background: rgba(244, 63, 94, 0.18);
  color: #fda4af;
}

.tag-b {
  background: rgba(34, 197, 94, 0.18);
  color: #86efac;
}

.compare-card-head select {
  background: #1e293b;
  color: #f8fafc;
  border: 1px solid #475569;
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 13px;
  font-weight: 600;
  min-height: 36px;
}

.compare-metrics-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.c-metric {
  background: #1e293b;
  border-radius: 6px;
  padding: 8px;
  text-align: center;
}

.c-metric.primary {
  background: rgba(244, 63, 94, 0.14);
  border: 1px solid rgba(244, 63, 94, 0.3);
}

.c-metric.primary.highlight-b {
  background: rgba(34, 197, 94, 0.14);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.cm-label {
  display: block;
  font-size: 11px;
  color: #94a3b8;
  margin-bottom: 3px;
}

.cm-val {
  font-size: 15px;
  color: #f8fafc;
  font-family: ui-monospace, monospace;
}

.cm-val small {
  font-size: 11px;
  font-weight: 500;
  color: #cbd5e1;
}

.compare-risk-line {
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 1.45;
}

.btn-fill-claim {
  margin-left: auto;
  background: #1e293b;
  color: #bae6fd;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.claim-input-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.claim-input-row input {
  flex: 1 1 280px;
  min-height: 40px;
  background: #0f172a;
  color: #f8fafc;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 13px;
}

.btn-generate-evidence {
  background: linear-gradient(135deg, #0284c7, #0369a1);
  color: #ffffff;
  border: 0;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  min-height: 40px;
  white-space: nowrap;
}

/* 生成的对照证据卡 */
.generated-evidence-card {
  background: #0b192c;
  border: 1.5px solid #0ea5e9;
  border-radius: 10px;
  padding: 14px 16px;
}

.gec-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.gec-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.gec-type-badge {
  background: #0284c7;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
}

.gec-sim-badge {
  background: rgba(245, 158, 11, 0.22);
  color: #fde68a;
  border: 1px solid rgba(245, 158, 11, 0.45);
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
}

.gec-status {
  font-size: 12px;
  color: #86efac;
  font-weight: 600;
}

.gec-main-title {
  margin: 0 0 10px;
  font-size: 15.5px;
  color: #f8fafc;
}

.gec-meta-grid {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.gec-meta-item {
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid #1e293b;
  border-radius: 6px;
  padding: 8px 10px;
}

.gec-meta-item.full-span {
  grid-column: 1 / -1;
}

.gec-meta-item dt {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 600;
  margin-bottom: 3px;
}

.gec-meta-item dd {
  margin: 0;
  font-size: 12.5px;
  color: #f1f5f9;
  line-height: 1.5;
}

.gec-limit-box {
  border-color: rgba(245, 158, 11, 0.35);
}

.gec-share-bar {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #1e293b;
}

.share-url-label {
  display: block;
  font-size: 12px;
  color: #cbd5e1;
  font-weight: 600;
  margin-bottom: 6px;
}

.share-url-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.share-url-input {
  flex: 1 1 240px;
  min-height: 38px;
  background: #0f172a;
  color: #bae6fd;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 4px 10px;
  font-family: ui-monospace, monospace;
  font-size: 12px;
}

.btn-copy-share {
  background: #0f766e;
  color: #ffffff;
  border: 0;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  min-height: 38px;
}

.btn-discuss-evidence {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #0284c7;
  color: #ffffff;
  text-decoration: none;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 12.5px;
  font-weight: 700;
  min-height: 38px;
}

.sim-grid {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(340px, 1.4fr);
  gap: 20px;
}

.sim-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.control-group {
  border: 0;
  padding: 0;
  margin: 0;
}

.control-group legend {
  font-size: 13px;
  font-weight: 700;
  color: #e2e8f0;
  margin-bottom: 10px;
}

.radio-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.surface-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.surface-card input {
  display: none;
}

.surface-card.active {
  background: rgba(56, 189, 248, 0.12);
  border-color: #38bdf8;
  box-shadow: 0 0 0 1px #38bdf8;
}

.card-icon {
  font-size: 22px;
}

.card-info {
  display: flex;
  flex-direction: column;
}

.card-info strong {
  font-size: 14px;
  color: #f8fafc;
}

.card-sub {
  font-size: 11px;
  color: #94a3b8;
}

.slider-row {
  background: #1e293b;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #334155;
}

.slider-label {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 8px;
}

.label-txt {
  color: #cbd5e1;
  font-weight: 600;
}

.label-val strong {
  color: #38bdf8;
  font-size: 14px;
}

input[type="range"] {
  width: 100%;
  accent-color: #38bdf8;
  cursor: pointer;
}

.range-marks {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #64748b;
  margin-top: 4px;
}

.sponge-tuning {
  background: rgba(14, 116, 144, 0.2);
  border: 1px dashed #0891b2;
  padding: 12px;
  border-radius: 8px;
}

.sim-capture-panel {
  margin-top: auto;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 14px;
  border-radius: 8px;
}

.capture-hint {
  margin: 0 0 10px;
  font-size: 12px;
  color: #a7f3d0;
  line-height: 1.4;
}

.btn-capture {
  width: 100%;
  padding: 10px 16px;
  background: #10b981;
  color: #052e16;
  font-weight: 800;
  font-size: 13px;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.1s, background 0.2s;
}

.btn-capture:hover {
  background: #34d399;
}

.btn-capture:active {
  transform: scale(0.99);
}

.sim-stage {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-viewport {
  background: #1e293b;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #334155;
}

.profile-svg {
  width: 100%;
  height: auto;
  display: block;
}

.hydrograph-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 16px;
}

.hydro-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.hydro-header h4 {
  margin: 0;
  font-size: 14px;
  color: #e2e8f0;
}

.hydro-legend {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #94a3b8;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.current-dot { background: #38bdf8; }
.ref-dot { background: #94a3b8; }

.hydro-svg {
  width: 100%;
  height: auto;
  display: block;
  margin-bottom: 12px;
}

.hydro-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  border-top: 1px solid #334155;
  padding-top: 12px;
}

.metric-item {
  background: #0f172a;
  padding: 8px 10px;
  border-radius: 6px;
  text-align: center;
}

.metric-item.highlight {
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.m-label {
  display: block;
  font-size: 11px;
  color: #94a3b8;
  margin-bottom: 2px;
}

.m-val {
  font-size: 14px;
  font-weight: 800;
  color: #f8fafc;
  font-family: ui-monospace, monospace;
}

.inquiry-discussion-box {
  margin-top: 20px;
  background: linear-gradient(145deg, rgba(15, 39, 66, 0.9), rgba(30, 58, 95, 0.85));
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 10px;
  padding: 16px 20px;
}

.discussion-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  padding: 3px 10px;
  border-radius: 999px;
  margin-bottom: 6px;
}

.inquiry-discussion-box h4 {
  margin: 0 0 6px;
  font-size: 16px;
  color: #f8fafc;
}

.discussion-prompt {
  margin: 0 0 12px;
  font-size: 13.5px;
  line-height: 1.65;
  color: #cbd5e1;
}

.discussion-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.btn-go-discuss {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #0284c7;
  color: #ffffff;
  font-size: 13.5px;
  font-weight: 700;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.2s;
}

.btn-go-discuss:hover {
  background: #0369a1;
}

@media (max-width: 900px) {
  .urban-flood-sim {
    padding: 14px;
  }
  .compare-dual-grid {
    grid-template-columns: 1fr;
  }
  .compare-metrics-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .gec-meta-grid {
    grid-template-columns: 1fr;
  }
  .sim-grid {
    grid-template-columns: 1fr;
  }
  .hydro-metrics {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
