<template>
  <div class="showcase-wall" role="region" aria-label="地理创新探究课堂成果展示墙">
    <div class="wall-header">
      <div class="header-copy">
        <span class="wall-badge">CLASSROOM SHOWCASE · 探究成果展示墙</span>
        <h3>“从一张图走向一个问题”——优秀探究作品展</h3>
        <p class="wall-lead">
          当前展示均为教研演示样例，用于课堂研讨与概念辨析；真实学生作品暂不公开。
        </p>
      </div>
    </div>

    <!-- 隐私合规提示条 -->
    <div class="privacy-compliance-banner" role="note">
      <span class="p-icon">🛡️</span>
      <p><strong>学生数据保护说明：</strong>公开展示仅使用教研演示样例。真实作品的人工审查和脱敏流程尚未开放。</p>
    </div>

    <!-- 展示卡片瀑布流网格 -->
    <div class="showcase-grid">
      <div
        v-for="item in displayList"
        :key="item.id"
        class="showcase-card"
      >
        <div class="card-head">
          <div class="author-badge">
            <span class="user-avatar">🌱</span>
            <div class="author-info">
              <div class="author-name-row">
                <strong>{{ item.pseudonym }}</strong>
                <span :class="['sample-tag', item.isDemo !== false ? 'is-demo' : 'is-real']">
                  {{ item.isDemo !== false ? '演示样例' : '学生授权案例' }}
                </span>
              </div>
              <small>{{ item.gradeLevel }} · {{ item.taskTitle }}</small>
            </div>
          </div>
          <div class="teacher-score-badge">
            <span>教师评分 (参考)</span>
            <strong>{{ item.teacherScore }} 分</strong>
          </div>
        </div>

        <!-- 认知转变双向对比 -->
        <div class="transformation-box">
          <div class="t-col before">
            <span class="t-tag">探究前猜想 (V1)</span>
            <p>{{ item.initialHypothesis }}</p>
          </div>
          <div class="t-arrow" aria-hidden="true">➔</div>
          <div class="t-col after">
            <span class="t-tag">证据后结论 (V2)</span>
            <p>{{ item.revisedConclusion }}</p>
          </div>
        </div>

        <!-- 关键精选证据亮点 -->
        <div class="evidence-highlights" v-if="item.evidenceHighlights && item.evidenceHighlights.length > 0">
          <span class="hl-title">精选证据链条：</span>
          <div class="hl-chips">
            <div
              v-for="ev in item.evidenceHighlights"
              :key="ev.id || ev.title"
              class="ev-chip"
            >
              <strong class="chip-name">{{ ev.title }}</strong>
              <p class="chip-obs">“{{ ev.observation }}”</p>
            </div>
          </div>
        </div>

        <!-- 教师专家评语 -->
        <div class="teacher-quote-box" v-if="item.teacherComment">
          <span class="q-icon">👩‍🏫 教师点评：</span>
          <p>{{ item.teacherComment }}</p>
        </div>

        <!-- 同伴研讨互动点赞 -->
        <div class="card-footer-interaction">
          <span class="reaction-title">课堂研讨点赞：</span>
          <button
            type="button"
            class="reaction-btn"
            :class="{ active: hasReacted(item.id, 'control') }"
            @click="toggleReaction(item.id, 'control')"
          >
            🎯 变量控制严谨 ({{ getCount(item.id, 'control') }})
          </button>
          <button
            type="button"
            class="reaction-btn"
            :class="{ active: hasReacted(item.id, 'evidence') }"
            @click="toggleReaction(item.id, 'evidence')"
          >
            🔍 事实与推断分明 ({{ getCount(item.id, 'evidence') }})
          </button>
          <button
            type="button"
            class="reaction-btn"
            :class="{ active: hasReacted(item.id, 'deep') }"
            @click="toggleReaction(item.id, 'deep')"
          >
            💡 反例思考深刻 ({{ getCount(item.id, 'deep') }})
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { inquiryState } from './inquiryStore.js'

const reactions = reactive({})

const defaultShowcaseItems = [
  {
    id: 'sc-default-1',
    taskId: 'urban-flood',
    taskTitle: '城市内涝与海绵城市',
    pseudonym: '教研演示样例 01号',
    gradeLevel: '高中部',
    teacherScore: 92,
    initialHypothesis: '最初以为城市内涝纯粹是下水道管道太细，下大雨只要排水管够大就不会积水。',
    revisedConclusion: '城市“看海”本质是硬化地表切断了自然下渗，使产流历时由26分钟锐减至8分钟，形成瞬时洪峰。海绵城市通过源头削峰减灾，但在长历时特大暴雨导致碎石调蓄层饱和后，必须配套超标应急排涝工程。',
    evidenceHighlights: [
      { title: '水泥路面暴雨响应', observation: '产流历时仅8分钟即达到洪峰；积水深度达115mm；径流系数0.88。' },
      { title: '海绵透水铺装削峰测试', observation: '产流历时延缓至26分钟；洪峰流量削减48%，积水未漫出路面。' }
    ],
    teacherComment: '单变量对照非常严谨，尤其能敏锐指出持续特大暴雨下透水铺装达到饱和容量的模型局限，展现了卓越的学科批判反思素养。'
  },
  {
    id: 'sc-default-2',
    taskId: 'landscape-variation',
    taskTitle: '多时相遥感与景观变迁',
    pseudonym: '教研演示样例 02号',
    gradeLevel: '高中部',
    teacherScore: 94,
    initialHypothesis: '最初在新闻看到鄱阳湖露出大草原，以为是过度用水导致湖泊已经永久干涸。',
    revisedConclusion: '结合星子站水位（20.8m vs 9.2m）与浅碟形湖盆DEM横剖面，证明鄱阳湖“冬陆夏水、冬草夏波”是由长江中下游梅雨-伏旱副高进退节律决定的天然湿地动力过程，枯水期出露草洲是候鸟关键越冬地。',
    evidenceHighlights: [
      { title: '星子站水位落差分析', observation: '丰水期与枯水期水位落差达11.6米；横剖面显示水位低于14米时两翼浅滩自然出露。' }
    ],
    teacherComment: '严格区分了真彩色遥感中的植被反射与林地乔木的区别，将空间高程数据与时间气候节律结合论证，极具说服力。'
  }
]

const displayList = computed(() => {
  if (inquiryState.showcaseList && inquiryState.showcaseList.length > 0) {
    return inquiryState.showcaseList
  }
  return defaultShowcaseItems
})

function hasReacted(itemId, type) {
  return reactions[`${itemId}_${type}`] > 0
}

function getCount(itemId, type) {
  const base = type === 'control' ? 12 : type === 'evidence' ? 18 : 9
  return base + (reactions[`${itemId}_${type}`] || 0)
}

function toggleReaction(itemId, type) {
  const k = `${itemId}_${type}`
  if (reactions[k]) {
    reactions[k] = 0
  } else {
    reactions[k] = 1
  }
}
</script>

<style scoped>
.showcase-wall {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.wall-header {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.wall-badge {
  display: inline-block;
  font-size: 11px;
  font-family: ui-monospace, monospace;
  font-weight: 700;
  color: #0284c7;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}

.header-copy h3 {
  margin: 0 0 8px;
  font-size: 22px;
  color: #0f172a;
}

.wall-lead {
  margin: 0;
  font-size: 13px;
  color: #475569;
  line-height: 1.6;
  max-width: 720px;
}

.privacy-compliance-banner {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.privacy-compliance-banner .p-icon {
  font-size: 18px;
}

.privacy-compliance-banner p {
  margin: 0;
  font-size: 12px;
  color: #14532d;
  line-height: 1.5;
}

.author-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sample-tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: bold;
}

.sample-tag.is-demo {
  background: #fef3c7;
  color: #b45309;
}

.sample-tag.is-real {
  background: #dcfce7;
  color: #15803d;
}

.showcase-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 20px;
}

.showcase-card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.showcase-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 12px;
}

.author-badge {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  font-size: 22px;
}

.author-info strong {
  display: block;
  font-size: 14px;
  color: #0f172a;
}

.author-info small {
  font-size: 11px;
  color: #64748b;
}

.teacher-score-badge {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 4px 10px;
  border-radius: 6px;
}

.teacher-score-badge span {
  font-size: 10px;
  color: #166534;
}

.teacher-score-badge strong {
  font-size: 16px;
  color: #15803d;
}

.transformation-box {
  display: grid;
  grid-template-columns: 1fr auto 1.3fr;
  align-items: center;
  gap: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
}

.t-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.t-tag {
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
  align-self: flex-start;
}

.t-col.before .t-tag {
  background: #fef3c7;
  color: #b45309;
}

.t-col.after .t-tag {
  background: #dcfce7;
  color: #15803d;
}

.t-col p {
  margin: 0;
  font-size: 11px;
  color: #334155;
  line-height: 1.5;
}

.t-arrow {
  color: #94a3b8;
  font-size: 16px;
}

.evidence-highlights {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hl-title {
  font-size: 11px;
  font-weight: 700;
  color: #0369a1;
}

.hl-chips {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ev-chip {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  padding: 8px 10px;
}

.chip-name {
  display: block;
  font-size: 11px;
  color: #0284c7;
  margin-bottom: 2px;
}

.chip-obs {
  margin: 0;
  font-size: 11px;
  color: #0c4a6e;
  line-height: 1.4;
}

.teacher-quote-box {
  background: #fefce8;
  border-left: 3px solid #eab308;
  padding: 10px 14px;
  border-radius: 4px;
}

.q-icon {
  display: block;
  font-size: 11px;
  font-weight: bold;
  color: #854d0e;
  margin-bottom: 4px;
}

.teacher-quote-box p {
  margin: 0;
  font-size: 12px;
  color: #713f12;
  line-height: 1.5;
  font-style: italic;
}

.card-footer-interaction {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
}

.reaction-title {
  font-size: 11px;
  color: #64748b;
}

.reaction-btn {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #334155;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.reaction-btn:hover {
  background: #e0f2fe;
  border-color: #7dd3fc;
  color: #0284c7;
}

.reaction-btn.active {
  background: #0284c7;
  color: #ffffff;
  border-color: #0284c7;
}

@media (max-width: 640px) {
  .transformation-box {
    grid-template-columns: 1fr;
  }
}
</style>
