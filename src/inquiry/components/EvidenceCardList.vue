<template>
  <div class="evidence-card-list" role="region" aria-label="科学证据卡列表">
    <div class="list-header">
      <div class="title-wrap">
        <h4>实验与观测证据链条</h4>
        <span class="count-badge">{{ cards.length }} 条有效证据</span>
      </div>
      <p class="rule-tip">
        <strong>学术规范提醒：</strong>严密探究要求清晰区分客观事实与主观解释。请给每张证据卡明确标注【我观察到的数据事实】与【我基于推断的成因】。
      </p>
    </div>

    <div v-if="cards.length === 0" class="empty-placeholder">
      <span class="empty-icon">📋</span>
      <p>暂无捕获的实验证据。请在上方仿真台调整参数并运行，点击“捕获为证据卡”。</p>
    </div>

    <div v-else class="cards-grid">
      <div
        v-for="(card, index) in cards"
        :key="card.id"
        class="evidence-card"
        :class="{ 'high-conf': card.confidence >= 4 }"
      >
        <div class="card-head">
          <div class="head-left">
            <span class="card-num">证据 #{{ cards.length - index }}</span>
            <span class="tag-badge" v-if="card.tag">{{ card.tag }}</span>
          </div>
          <div class="head-right">
            <span class="card-source">{{ card.source }}</span>
            <button
              type="button"
              class="btn-delete"
              title="删除此证据卡"
              aria-label="删除此证据卡"
              @click="$emit('remove', card.id)"
            >
              ✕
            </button>
          </div>
        </div>

        <h5 class="card-title">{{ card.title }}</h5>

        <!-- 参数元数据标签 -->
        <div class="card-params" v-if="card.params && Object.keys(card.params).length > 0">
          <span
            v-for="(val, key) in card.params"
            :key="key"
            class="param-chip"
          >
            <em>{{ key }}:</em> {{ val }}
          </span>
        </div>

        <!-- 区分观察与推断 -->
        <div class="fact-inference-box">
          <div class="box-row observation">
            <span class="badge obs-badge">👁 我观察到的事实</span>
            <p class="content-text">{{ card.observation || '（未记录具体观测数据）' }}</p>
          </div>

          <div class="box-row inference">
            <span class="badge inf-badge">💡 我推测的因果机制</span>
            <p class="content-text">{{ card.inference || '（未记录推断机制）' }}</p>
          </div>
        </div>

        <div class="card-footer">
          <div class="confidence-picker">
            <span class="conf-label">证据可信度：</span>
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              class="star-btn"
              :class="{ active: star <= card.confidence }"
              :aria-label="`设置可信度为 ${star} 星`"
              @click="setConfidence(card, star)"
            >
              ★
            </button>
          </div>
          <span class="timestamp">{{ formatTime(card.timestamp) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  cards: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['remove', 'update'])

function setConfidence(card, star) {
  card.confidence = star
  emit('update', card)
}

function formatTime(isoStr) {
  if (!isoStr) return ''
  try {
    const d = new Date(isoStr)
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
  } catch {
    return ''
  }
}
</script>

<style scoped>
.evidence-card-list {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 20px;
  margin-top: 16px;
}

.list-header {
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 12px;
  margin-bottom: 16px;
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-wrap h4 {
  margin: 0;
  font-size: 16px;
  color: #0f172a;
}

.count-badge {
  background: #0284c7;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
}

.rule-tip {
  margin: 8px 0 0;
  font-size: 12px;
  color: #475569;
  line-height: 1.5;
}

.empty-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  color: #64748b;
  text-align: center;
  font-size: 13px;
}

.empty-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.evidence-card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.evidence-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.evidence-card.high-conf {
  border-left: 4px solid #10b981;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.head-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-num {
  font-size: 11px;
  font-family: ui-monospace, monospace;
  font-weight: bold;
  color: #64748b;
}

.tag-badge {
  background: #f1f5f9;
  color: #0369a1;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.head-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-source {
  font-size: 10px;
  color: #94a3b8;
}

.btn-delete {
  background: transparent;
  border: 0;
  color: #94a3b8;
  font-size: 14px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
}

.btn-delete:hover {
  background: #fee2e2;
  color: #ef4444;
}

.card-title {
  margin: 0;
  font-size: 14px;
  color: #1e293b;
  font-weight: 700;
}

.card-params {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.param-chip {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  color: #334155;
}

.param-chip em {
  font-style: normal;
  color: #64748b;
}

.fact-inference-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f8fafc;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #f1f5f9;
}

.box-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.badge {
  align-self: flex-start;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 3px;
}

.obs-badge {
  background: #e0f2fe;
  color: #0369a1;
}

.inf-badge {
  background: #fef3c7;
  color: #b45309;
}

.content-text {
  margin: 0;
  font-size: 12px;
  color: #334155;
  line-height: 1.5;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f1f5f9;
  padding-top: 8px;
}

.confidence-picker {
  display: flex;
  align-items: center;
  gap: 2px;
}

.conf-label {
  font-size: 11px;
  color: #64748b;
}

.star-btn {
  background: transparent;
  border: 0;
  font-size: 14px;
  color: #cbd5e1;
  cursor: pointer;
  padding: 0 1px;
}

.star-btn.active {
  color: #eab308;
}

.timestamp {
  font-size: 10px;
  color: #94a3b8;
  font-family: ui-monospace, monospace;
}
</style>
