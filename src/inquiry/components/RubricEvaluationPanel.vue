<template>
  <div class="rubric-panel" role="region" aria-label="地理探究表现性量规评估">
    <div class="rubric-header">
      <div class="header-left">
        <span class="rubric-tag">RUBRIC ASSESSMENT · 科学评价量规</span>
        <h4>探究过程与思维质量表现性量规</h4>
      </div>
      <div class="header-right">
        <span class="score-pill">
          <span v-if="isDemo" class="demo-tag">【演示样例】</span>
          表现性量规参考总评：<strong>{{ calculatedScore }}</strong> / 100 分
        </span>
      </div>
    </div>

    <p class="rubric-intro">
      根据地理学科核心素养（人地协调观、综合思维、区域认知、地理实践力）制定。不给“创造力 98 分”等伪精确分，而是从 7 个可观察的关键探究维度，依据具体水平表现进行质性与量化结合的评价。
    </p>

    <!-- 7 大维度列表 -->
    <div class="dimensions-list">
      <div
        v-for="dim in dimensions"
        :key="dim.id"
        class="dim-card"
      >
        <div class="dim-head">
          <div class="head-info">
            <span class="dim-name">{{ dim.name }}</span>
            <span class="dim-weight">权重 {{ dim.weight }}%</span>
          </div>
          <span class="selected-level-tag" v-if="scores[dim.id]">
            已选：第 {{ scores[dim.id] }} 级（{{ getLevelLabel(dim, scores[dim.id]) }}）
          </span>
        </div>

        <div class="levels-grid" role="radiogroup" :aria-label="dim.name">
          <button
            v-for="lvl in dim.levels"
            :key="lvl.score"
            type="button"
            class="level-card"
            :class="{ active: scores[dim.id] === lvl.score }"
            :disabled="readonly"
            :aria-checked="scores[dim.id] === lvl.score"
            @click="selectLevel(dim.id, lvl.score)"
          >
            <div class="lvl-top">
              <span class="lvl-badge">水平 {{ lvl.score }}</span>
              <strong class="lvl-label">{{ lvl.label }}</strong>
            </div>
            <p class="lvl-desc">{{ lvl.desc }}</p>
          </button>
        </div>
      </div>
    </div>

    <!-- 教师操作区 (教师模式下可见) -->
    <div v-if="mode === 'teacher'" class="teacher-grading-box">
      <h5>教师评语与指导批注</h5>
      <div class="comment-field">
        <label for="teacher-comment">针对性指导建议（针对学生的变量控制、因果论证与证据链指出具体改进方向）：</label>
        <textarea
          id="teacher-comment"
          v-model="feedbackComment"
          rows="3"
          placeholder="例如：变量控制十分规范，但因果解释中对饱和产流机制的论述略显单薄，建议补充长时间暴雨下的垫层饱和分析..."
        ></textarea>
      </div>

      <div class="comment-field">
        <label for="override-advice">针对该探究课题的置顶提示（覆盖或校正 AI 建议）：</label>
        <input
          id="override-advice"
          v-model="overrideAiAdvice"
          type="text"
          placeholder="可选输入，例如：本节课重点请大家关注‘下渗率与产流历时’的单变量对比！"
        />
      </div>

      <div class="showcase-toggle">
        <label class="checkbox-label">
          <input type="checkbox" v-model="isShowcased" />
          <span>脱敏后推荐至【课堂讨论展示墙】（自动隐藏学生姓名和邮箱等个人信息）</span>
        </label>
      </div>

      <div class="actions-bar">
        <button type="button" class="btn-save-review" @click="saveReview">
          💾 保存教师量规评定与反馈
        </button>
        <span v-if="savedMsg" class="saved-msg" role="status">{{ savedMsg }}</span>
      </div>
    </div>

    <!-- 学生端展示已有评价 -->
    <div v-else-if="existingReview" class="student-review-display">
      <h5>👨‍🏫 教师评价与反馈</h5>
      <p class="review-meta">
        评定教师：<strong>{{ existingReview.teacherName }}</strong> ·
        得分：<strong>{{ existingReview.totalWeightedScore }} 分</strong> ·
        时间：{{ new Date(existingReview.updatedAt).toLocaleString() }}
      </p>
      <blockquote class="teacher-feedback-quote">
        {{ existingReview.feedbackComment }}
      </blockquote>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { RUBRIC_DIMENSIONS } from '../inquiryData.js'

const props = defineProps({
  taskId: {
    type: String,
    required: true
  },
  mode: {
    type: String,
    default: 'student' // 'student' | 'teacher'
  },
  readonly: {
    type: Boolean,
    default: false
  },
  initialScores: {
    type: Object,
    default: () => ({})
  },
  existingReview: {
    type: Object,
    default: null
  },
  isDemo: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['save-review', 'score-change'])

const dimensions = RUBRIC_DIMENSIONS
const scores = ref({ ...props.initialScores })
const feedbackComment = ref(props.existingReview?.feedbackComment || '')
const overrideAiAdvice = ref(props.existingReview?.overrideAiAdvice || '')
const isShowcased = ref(Boolean(props.existingReview?.isShowcased))
const savedMsg = ref('')

watch(() => props.initialScores, (newVal) => {
  if (newVal) scores.value = { ...newVal }
}, { deep: true })

watch(() => props.existingReview, (newRev) => {
  if (newRev) {
    feedbackComment.value = newRev.feedbackComment || ''
    overrideAiAdvice.value = newRev.overrideAiAdvice || ''
    isShowcased.value = Boolean(newRev.isShowcased)
    if (newRev.scores) scores.value = { ...newRev.scores }
  }
})

function getLevelLabel(dim, score) {
  const lvl = dim.levels.find(l => l.score === score)
  return lvl ? lvl.label : ''
}

function selectLevel(dimId, score) {
  if (props.readonly) return
  scores.value[dimId] = score
  emit('score-change', { dimId, score, allScores: scores.value })
}

const calculatedScore = computed(() => {
  let total = 0
  for (const dim of dimensions) {
    const s = scores.value[dim.id] || 0
    total += (s / 4) * dim.weight
  }
  return Math.round(total * 10) / 10
})

function saveReview() {
  emit('save-review', {
    taskId: props.taskId,
    scores: scores.value,
    totalWeightedScore: calculatedScore.value,
    feedbackComment: feedbackComment.value.trim() || '态度认真，符合探究规范。',
    overrideAiAdvice: overrideAiAdvice.value.trim(),
    isShowcased: isShowcased.value
  })
  savedMsg.value = '✓ 评定已成功保存并同步！'
  setTimeout(() => { savedMsg.value = '' }, 3000)
}
</script>

<style scoped>
.rubric-panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  margin-top: 20px;
}

.rubric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 14px;
}

.rubric-tag {
  display: block;
  font-size: 11px;
  font-family: ui-monospace, monospace;
  font-weight: 700;
  color: #0284c7;
  letter-spacing: 0.08em;
}

.header-left h4 {
  margin: 2px 0 0;
  font-size: 18px;
  color: #0f172a;
}

.score-pill {
  background: #082f49;
  color: #e0f2fe;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
}

.score-pill strong {
  font-size: 18px;
  color: #38bdf8;
}

.rubric-intro {
  margin: 12px 0 20px;
  font-size: 13px;
  color: #475569;
  line-height: 1.6;
}

.dimensions-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dim-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
}

.dim-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.head-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dim-name {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
}

.dim-weight {
  font-size: 11px;
  background: #e2e8f0;
  color: #475569;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.selected-level-tag {
  font-size: 12px;
  color: #0284c7;
  font-weight: 600;
}

.levels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.level-card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 10px 12px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.level-card:hover:not(:disabled) {
  border-color: #38bdf8;
  background: #f0f9ff;
}

.level-card.active {
  background: #e0f2fe;
  border-color: #0284c7;
  box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.2);
}

.level-card:disabled {
  cursor: default;
}

.lvl-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.lvl-badge {
  font-size: 10px;
  font-weight: 700;
  color: #64748b;
  font-family: ui-monospace, monospace;
}

.lvl-label {
  font-size: 12px;
  color: #0f172a;
}

.lvl-desc {
  margin: 0;
  font-size: 11px;
  color: #475569;
  line-height: 1.45;
}

.teacher-grading-box {
  margin-top: 24px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 20px;
}

.teacher-grading-box h5 {
  margin: 0 0 14px;
  font-size: 15px;
  color: #166534;
}

.comment-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.comment-field label {
  font-size: 12px;
  font-weight: 600;
  color: #14532d;
}

.comment-field textarea,
.comment-field input {
  border: 1px solid #86efac;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 13px;
  background: #ffffff;
}

.showcase-toggle {
  margin-bottom: 16px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #14532d;
  cursor: pointer;
}

.actions-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-save-review {
  background: #16a34a;
  color: #ffffff;
  border: 0;
  padding: 10px 18px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-save-review:hover {
  background: #15803d;
}

.saved-msg {
  font-size: 13px;
  color: #16a34a;
  font-weight: 600;
}

.student-review-display {
  margin-top: 24px;
  background: #f0fdf4;
  border-left: 4px solid #16a34a;
  padding: 16px 20px;
  border-radius: 6px;
}

.student-review-display h5 {
  margin: 0 0 8px;
  font-size: 15px;
  color: #166534;
}

.review-meta {
  margin: 0 0 10px;
  font-size: 12px;
  color: #4b5563;
}

.teacher-feedback-quote {
  margin: 0;
  font-size: 13px;
  color: #15803d;
  line-height: 1.6;
  font-style: italic;
}
</style>
