<template>
  <aside class="info-panel">
    <div class="panel-section">
      <h3>📖 地貌知识</h3>
      <div v-if="knowledge" class="knowledge-card">
        <div class="knowledge-title">{{ knowledge.title }}</div>
        <div class="knowledge-body" v-html="knowledge.body"></div>
        <div v-if="knowledge.ref" class="knowledge-ref" v-html="knowledge.ref"></div>
      </div>
      <div v-else class="knowledge-card empty">点击河流类型查看知识说明</div>
    </div>

    <div class="panel-section">
      <h3>📊 地形参数</h3>
      <table class="state-table">
        <tbody>
          <tr><td>河流类型</td><td>{{ state.type || '—' }}</td></tr>
          <tr><td>侵蚀阶段</td><td>{{ state.stage || '—' }}</td></tr>
          <tr><td>气候模式</td><td>{{ state.weather || '—' }}</td></tr>
          <tr><td>地形起伏</td><td>{{ state.relief || '—' }}</td></tr>
          <tr><td>汇水面积</td><td>{{ state.drainageArea || '—' }}</td></tr>
          <tr><td>平均坡度</td><td>{{ state.gradient || '—' }}</td></tr>
        </tbody>
      </table>
    </div>

    <div class="panel-section" v-if="climateMetrics">
      <h3>🌤 气候模拟评估</h3>
      <div class="metrics-card">
        <div class="metric-row">
          <span class="metric-label">模拟时长</span>
          <span class="metric-value">{{ climateMetrics.years }} 年</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">侵蚀权重</span>
          <span class="metric-value">{{ climateMetrics.erosionWeight.toFixed(2) }}</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">累计下切</span>
          <span class="metric-value">+{{ climateMetrics.cumulativeErosion }}%</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">分水岭后退</span>
          <span class="metric-value">{{ climateMetrics.divideRetreat }}m</span>
        </div>
      </div>
    </div>

    <div class="panel-section" v-if="streamPower">
      <h3>⚡ 流功率侵蚀定律</h3>
      <div class="formula-card">
        <div class="formula">E = K · A<sup>m</sup> · S<sup>n</sup></div>
        <div class="formula-params">
          <div class="param-line">K = {{ streamPower.K.toFixed(2) }}（侵蚀系数）</div>
          <div class="param-line">A = {{ streamPower.A }}（汇水面积）</div>
          <div class="param-line">S = {{ streamPower.S }}（坡度）</div>
          <div class="param-line result">E = {{ streamPower.E }}（侵蚀速率）</div>
        </div>
      </div>
    </div>

    <div class="panel-section" v-if="evolutionStage">
      <h3>🔄 地貌演化阶段</h3>
      <div class="evolution-card">
        <div class="stage-name">{{ evolutionStage.name }}</div>
        <div class="stage-index">阶段 {{ evolutionStage.index + 1 }}/7</div>
        <div class="stage-desc">{{ evolutionStage.desc }}</div>
        <div class="stage-bar">
          <div v-for="(s, i) in evolutionStages" :key="i" class="stage-dot"
            :class="{ active: i === evolutionStage.index, past: i < evolutionStage.index }">
          </div>
        </div>
      </div>
    </div>

    <div class="panel-section">
      <h3>⚙ 数据工具</h3>
      <div class="data-grid">
        <button class="data-btn" @click="$emit('import')">导入 DEM</button>
        <button class="data-btn" @click="$emit('export')">导出快照</button>
      </div>
    </div>
  </aside>
</template>

<script setup>
defineProps({
  knowledge: Object,
  state: { type: Object, default: () => ({}) },
  climateMetrics: { type: Object, default: null },
  streamPower: { type: Object, default: null },
  evolutionStage: { type: Object, default: null },
  evolutionStages: { type: Array, default: () => [] }
})
defineEmits(['import', 'export'])
</script>

<style scoped>
.info-panel{background:rgba(247,252,255,0.88);border:1px solid #a9c6e8;border-radius:9px;padding:8px;font-size:.72rem;overflow-y:auto;max-height:calc(100vh - 60px)}
.panel-section{margin-bottom:10px}
.panel-section h3{margin:0 0 6px;font-size:.72rem;color:#1d4f81;font-weight:600}
.knowledge-card{background:rgba(255,255,255,.7);border:1px solid #d0e3f8;border-radius:8px;padding:8px;line-height:1.5}
.knowledge-card.empty{color:#8aafcf;font-size:.65rem}
.knowledge-title{font-weight:600;color:#0f2542;margin-bottom:4px}
.knowledge-body{font-size:.68rem;color:#365776}
.knowledge-ref{font-size:.6rem;color:#5a7f9f;margin-top:4px;font-style:italic}
.state-table{width:100%;font-size:.65rem;border-collapse:collapse}
.state-table td{padding:3px 6px;border:1px solid #d0e3f8}
.state-table td:first-child{color:#5a7f9f;background:rgba(248,252,255,.5);white-space:nowrap}
.state-table td:last-child{color:#0f2542;font-weight:500}
.metrics-card{background:rgba(255,255,255,.7);border:1px solid #d0e3f8;border-radius:8px;padding:7px;display:grid;gap:4px}
.metric-row{display:flex;justify-content:space-between;align-items:center;padding:2px 0;font-size:.66rem;border-bottom:1px solid #e8f0fa}
.metric-row:last-child{border-bottom:none}
.metric-label{color:#5a7f9f}
.metric-value{color:#0f2542;font-weight:600;font-family:"SF Mono",Menlo,monospace}
.formula-card{background:rgba(255,255,255,.7);border:1px solid #d0e3f8;border-radius:8px;padding:8px}
.formula{font-size:.78rem;font-weight:600;color:#0f2542;text-align:center;padding:4px 0 6px;border-bottom:1px solid #e8f0fa;font-family:"Times New Roman","STIX",serif;font-style:italic;letter-spacing:.02em}
.formula-params{display:grid;gap:2px;margin-top:5px}
.param-line{font-size:.62rem;color:#5a7f9f;font-family:"SF Mono",Menlo,monospace}
.param-line.result{color:#1d4f81;font-weight:600;margin-top:3px;padding-top:3px;border-top:1px solid #e8f0fa}
.evolution-card{background:rgba(255,255,255,.7);border:1px solid #d0e3f8;border-radius:8px;padding:7px;text-align:center}
.stage-name{font-size:.72rem;font-weight:600;color:#0f2542}
.stage-index{font-size:.6rem;color:#5a7f9f;margin:2px 0}
.stage-desc{font-size:.64rem;color:#365776;margin:4px 0 6px;line-height:1.4}
.stage-bar{display:flex;gap:3px;justify-content:center}
.stage-dot{width:8px;height:8px;border-radius:50%;border:1px solid #a9c6e8;background:rgba(202,231,255,.3);transition:all .2s}
.stage-dot.past{background:#a8d6ff;border-color:#7bb4e7}
.stage-dot.active{background:#3688cf;border-color:#1d6bb0;transform:scale(1.3)}
.data-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px}
.data-btn{border:1px solid #a9c6e8;border-radius:8px;padding:5px;background:#f9fcff;color:#365776;font-size:.62rem;cursor:pointer;text-align:center}
.data-btn:hover{background:#e8f2ff}
</style>
