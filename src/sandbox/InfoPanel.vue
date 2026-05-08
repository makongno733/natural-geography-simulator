<template>
  <aside class="info-panel">
    <div class="panel-section">
      <h3>📖 知识</h3>
      <div v-if="knowledge" class="knowledge-card">
        <div class="knowledge-title">{{ knowledge.title }}</div>
        <div class="knowledge-body" v-html="knowledge.body"></div>
        <div v-if="knowledge.ref" class="knowledge-ref" v-html="knowledge.ref"></div>
      </div>
      <div v-else class="knowledge-card empty">点击场景要素查看知识说明</div>
    </div>
    <div class="panel-section">
      <h3>📊 当前状态</h3>
      <table class="state-table">
        <tr><td>河流类型</td><td>{{ state.type || '—' }}</td></tr>
        <tr><td>侵蚀阶段</td><td>{{ state.stage || '—' }}</td></tr>
        <tr><td>气候模式</td><td>{{ state.weather || '—' }}</td></tr>
        <tr><td>地形起伏</td><td>{{ state.relief || '—' }}</td></tr>
      </table>
    </div>
    <div class="panel-section">
      <h3>⚙ 数据</h3>
      <div class="data-grid">
        <button class="data-btn" @click="$emit('import')">导入 DEM</button>
        <button class="data-btn" @click="$emit('export')">导出快照</button>
      </div>
    </div>
  </aside>
</template>

<script setup>
defineProps({ knowledge: Object, state: { type: Object, default: () => ({}) } })
defineEmits(['import','export'])
</script>

<style scoped>
.info-panel{background:rgba(247,252,255,0.88);border:1px solid #a9c6e8;border-radius:9px;padding:8px;font-size:.72rem}
.panel-section{margin-bottom:10px}
.panel-section h3{margin:0 0 6px;font-size:.72rem;color:#1d4f81;font-weight:600}
.knowledge-card{background:rgba(255,255,255,.7);border:1px solid #d0e3f8;border-radius:8px;padding:8px;line-height:1.5}
.knowledge-card.empty{color:#8aafcf;font-size:.65rem}
.knowledge-title{font-weight:600;color:#0f2542;margin-bottom:4px}
.knowledge-body{font-size:.68rem;color:#365776}
.knowledge-ref{font-size:.6rem;color:#5a7f9f;margin-top:4px;font-style:italic}
.state-table{width:100%;font-size:.65rem;border-collapse:collapse}
.state-table td{padding:3px 6px;border:1px solid #d0e3f8}
.state-table td:first-child{color:#5a7f9f;background:rgba(248,252,255,.5)}
.state-table td:last-child{color:#0f2542;font-weight:500}
.data-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px}
.data-btn{border:1px solid #a9c6e8;border-radius:8px;padding:5px;background:#f9fcff;color:#365776;font-size:.62rem;cursor:pointer;text-align:center}
</style>
