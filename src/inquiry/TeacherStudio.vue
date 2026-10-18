<template>
  <div class="teacher-studio" role="region" aria-label="地理创新探究教师工作台">
    <!-- 教师看板顶部统计 -->
    <div class="studio-header">
      <div class="title-group">
        <span class="studio-badge">TEACHER COCKPIT · 教研评估与学情看板</span>
        <h3>地理创新探究教师工作台</h3>
        <p class="studio-lead">查看学生探究提交、比对认知转变（V1猜想 vs V2结论）、追踪证据链使用、按表现性量规打分，并一键去标识化发布至课堂展示墙。</p>
      </div>

      <div class="header-stat-cards">
        <div class="stat-card">
          <span class="stat-num">{{ stats.realSubmissions }}</span>
          <span class="stat-lbl">班级真实提交</span>
        </div>
        <div class="stat-card highlight">
          <span class="stat-num">{{ stats.pendingReviews }}</span>
          <span class="stat-lbl">真实待批阅</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">{{ stats.showcaseCount }}</span>
          <span class="stat-lbl">已推展示墙</span>
        </div>
        <div class="stat-card demo-stat">
          <span class="stat-num">{{ stats.demoCount }}</span>
          <span class="stat-lbl">演示样例 (隔离)</span>
        </div>
      </div>
    </div>
    <p v-if="accessNotice" class="demo-isolation-notice" role="status">{{ accessNotice }}</p>

    <!-- 演示数据隔离与状态警示 -->
    <div v-if="stats.demoCount > 0" class="demo-isolation-notice" role="status">
      <span class="d-icon">ℹ️</span>
      <p>
        <strong>数据属性提示：</strong>当前列表中包含 {{ stats.demoCount }} 份【演示样例数据】。演示数据仅供教研流程演练参考，已与学生真实学情严格物理隔离，不混入真实考核统计。
      </p>
    </div>

    <!-- 典型地理误解分析与学情预警 -->
    <div class="misconception-audit-card">
      <div class="audit-head">
        <h5>🚨 班级典型地理概念误解预警与证据归因：</h5>
        <span class="audit-tag">基于前概念与证据标注聚类分析</span>
      </div>
      <div class="misconceptions-grid">
        <div
          v-for="(m, i) in currentTaskMisconceptions"
          :key="i"
          class="misconception-item"
        >
          <span class="m-icon">⚠️</span>
          <div class="m-content">
            <strong>常见误解：{{ m.myth }}</strong>
            <p><strong>教研事实：</strong>{{ m.fact }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选过滤条 -->
    <div class="filter-toolbar">
      <div class="filter-left">
        <label>课题筛选：</label>
        <select v-model="filterTaskId">
          <option value="all">全部旗舰课题 (3 项)</option>
          <option v-for="t in tasks" :key="t.id" :value="t.id">{{ t.shortTitle }}</option>
        </select>

        <label>状态筛选：</label>
        <select v-model="filterStatus">
          <option value="all">全部状态</option>
          <option value="pending">待批改</option>
          <option value="reviewed">已批改</option>
        </select>
      </div>

      <div class="filter-right">
        <button type="button" class="btn-demo-load" @click="loadSampleSubmissions">
          📥 注入演示学生提交样例
        </button>
      </div>
    </div>

    <!-- 学生提交名单与版本比对列表 -->
    <div class="submissions-list">
      <div v-if="filteredSubmissions.length === 0" class="empty-list">
        <p>暂无符合筛选条件的学生探究提交。</p>
      </div>

      <div
        v-for="sub in filteredSubmissions"
        :key="sub.id"
        class="submission-card"
        :class="{ 'is-active': selectedSub?.id === sub.id }"
      >
        <div class="sub-card-top">
          <div class="student-meta">
            <span class="avatar-chip">🎓</span>
            <div class="student-info">
              <div class="name-row">
                <strong>{{ sub.studentName }}</strong>
                <span v-if="sub.isDemo" class="demo-data-tag">演示样例数据</span>
                <span v-else class="real-data-tag">班级实名提交</span>
              </div>
              <span class="sub-grade">{{ sub.gradeLevel }} · {{ sub.taskTitle }} · 班级：{{ sub.classCode || '默认班级' }}</span>
            </div>
          </div>
          <div class="status-tags">
            <span class="tag-version">快照版本 V{{ sub.versionCount }}</span>
            <span class="tag-ev-count">证据 {{ sub.evidenceCards?.length || 0 }} 条</span>
            <span :class="['tag-status', sub.status]">
              {{ sub.status === 'reviewed' ? '✓ 已评定' : '⏳ 待教师批阅' }}
            </span>
          </div>
        </div>

        <!-- 猜想转变概览：V1 vs V2 -->
        <div class="diff-glance">
          <div class="diff-box before">
            <span class="diff-lbl">原猜想 (V1)：</span>
            <p>{{ sub.initialHypothesis || '未填' }}</p>
          </div>
          <div class="diff-arrow" aria-hidden="true">➔</div>
          <div class="diff-box after">
            <span class="diff-lbl">修订后结论 (V2)：</span>
            <p>{{ sub.revisedConclusion || '未填' }}</p>
          </div>
        </div>

        <div class="sub-card-actions">
          <button
            type="button"
            class="btn-inspect"
            @click="inspectSubmission(sub)"
          >
            🔍 详细评定量规与批注
          </button>
          <button
            type="button"
            class="btn-toggle-showcase"
            :class="{ 'is-showcased': sub.isShowcased, 'is-disabled': !sub.isDemo }"
            :disabled="!sub.isDemo"
            @click="toggleShowcase(sub)"
          >
            {{ sub.isDemo ? (sub.isShowcased ? '★ 演示样例已展示' : '☆ 展示演示样例') : '🔒 真实作品待独立脱敏复核' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 弹窗：教师详细量规评分与证据链检阅 -->
    <div v-if="inspectingSub" class="modal-overlay" role="dialog" aria-modal="true">
      <div class="modal-dialog">
        <div class="modal-header">
          <div class="m-header-left">
            <h4>学生探究全过程审阅：{{ inspectingSub.studentName }}</h4>
            <span class="m-subtitle">{{ inspectingSub.taskTitle }} ({{ inspectingSub.gradeLevel }})</span>
          </div>
          <button type="button" class="btn-close-modal" @click="inspectingSub = null">✕</button>
        </div>

        <div class="modal-body">
          <!-- 证据链与因果解释 -->
          <div class="section-review-block">
            <h5>1. 收集的科学证据链卡片 ({{ inspectingSub.evidenceCards?.length || 0 }} 条)</h5>
            <div class="modal-evidence-grid">
              <div
                v-for="(c, idx) in inspectingSub.evidenceCards"
                :key="c.id || idx"
                class="modal-ev-chip"
              >
                <strong>证据 #{{ idx + 1 }}: {{ c.title }}</strong>
                <p><strong>【客观观察】</strong>{{ c.observation }}</p>
                <p><strong>【因果推断】</strong>{{ c.inference }}</p>
                <small>数据源：{{ c.source }} | 可信度：{{ '★'.repeat(c.confidence || 3) }}</small>
              </div>
            </div>
          </div>

          <div class="section-review-block">
            <h5>2. 因果机制解释与反例质证</h5>
            <p><strong>机制解释：</strong>{{ inspectingSub.causalExplanation }}</p>
            <p><strong>反例思考：</strong>{{ inspectingSub.counterExamples }}</p>
            <p><strong>模型局限：</strong>{{ inspectingSub.modelLimitationsNotes }}</p>
          </div>

          <!-- 量规评分与评语面板 -->
          <RubricEvaluationPanel
            :task-id="inspectingSub.taskId"
            mode="teacher"
            :initial-scores="currentInspectScores"
            :existing-review="currentInspectReview"
            @save-review="onTeacherSaveReview"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { INQUIRY_TASKS } from './inquiryData.js'
import { apiRequest } from '../account/api.js'
import { accountEnabled } from '../account/config.js'
import {
  inquiryState,
  saveTeacherReview,
  persistStore
} from './inquiryStore.js'
import RubricEvaluationPanel from './components/RubricEvaluationPanel.vue'

const tasks = INQUIRY_TASKS
const filterTaskId = ref('all')
const filterStatus = ref('all')
const selectedSub = ref(null)
const inspectingSub = ref(null)
const accessNotice = ref('')

// 响应式学生提交记录列表（包含本地与演示样例）
const submissionsList = ref([])

// 初始化载入或生成默认演示队列
function loadInitialSubmissions() {
  loadSampleSubmissions()
}

function loadSampleSubmissions() {
  submissionsList.value = [
    {
      id: 'sub-sample-1',
      taskId: 'urban-flood',
      taskTitle: '城市内涝与海绵城市',
      studentName: '林思源（高一2班）',
      gradeLevel: '高中',
      classCode: '高一示范班',
      versionCount: 2,
      status: 'pending',
      isDemo: true,
      showcaseConsent: true,
      initialHypothesis: '我认为城市内涝完全是因为下水管道不够粗，只要把路面修高、管道挖大，雨多大都不会积水。',
      revisedConclusion: '城市“看海”本质是地表硬化切断了“自然下渗”，大幅缩短汇流时间导致洪峰瞬时叠加。海绵城市通过“渗、滞、蓄”有效削减常态化暴雨洪峰（削峰率约50%），但不能消除所有内涝；在持续强降雨导致垫层饱和及外河顶托时，必须结合超标排涝调蓄设施。',
      causalExplanation: '水泥地面下渗率仅5%，产流历时仅8分钟即达到洪峰；而海绵铺装与下沉绿地下渗率达55%，产流历时延缓至26分钟。',
      counterExamples: '若降雨持续超过120分钟，碎石储水垫层完全饱和，或者下游外江洪水顶托时，透水铺装同样会漫水。',
      modelLimitationsNotes: '模型假设全区雨量均匀，未考虑局地雨窝与地下管网坡降。',
      evidenceCards: [
        {
          id: 'card-s-1',
          title: '水泥硬化路面暴雨响应',
          params: { 地表: '水泥路面', 降雨: '50mm/h' },
          observation: '【仿真模型推演】产流历时约8分钟达峰；估算积水深115mm；径流系数0.88。',
          inference: '硬化切断下渗，瞬时产流剧烈。',
          source: '城市下渗教学仿真模型（情境设定参数）',
          confidence: 4
        },
        {
          id: 'card-s-2',
          title: '海绵透水铺装削峰测试',
          params: { 地表: '透水铺装', 降雨: '50mm/h' },
          observation: '【仿真模型推演】产流历时延缓至26分钟；洪峰削减48%；积水未漫出路面。',
          inference: '碎石层发挥滞纳蓄水作用。',
          source: '城市下渗教学仿真模型（情境设定参数）',
          confidence: 4
        }
      ],
      isShowcased: true
    },
    {
      id: 'sub-sample-2',
      taskId: 'landscape-variation',
      taskTitle: '多时相遥感与景观变迁',
      studentName: '周致远（高二5班）',
      gradeLevel: '高中',
      classCode: '高二地理研讨组',
      versionCount: 2,
      status: 'reviewed',
      isDemo: true,
      showcaseConsent: true,
      initialHypothesis: '最初在新闻里看到鄱阳湖露出大草原，我以为是上游过度截流或气候变暖把湖泊彻底蒸干了。',
      revisedConclusion: '鄱阳湖“冬陆夏水、冬草夏波”本质是由长江中下游梅雨-伏旱副热带高压进退节律决定的天然湿地动力学过程。枯水期“草原”不仅不是生态崩溃，反而是候鸟越冬的核心食源地。',
      causalExplanation: '星子站水位夏季达20.8m，冬季落至9.2m，11.6米的水位差导致浅碟形湖底浅滩大面积出露萌发苔草。',
      counterExamples: '单凭枯水期单张遥感无法判断湖泊是否消亡，对比7月夏汛影像即发现水面迅速恢复至3800平方公里。',
      modelLimitationsNotes: '卫星瞬时光学快照受云层严重干扰，无法反映全天波浪与潮汐。',
      evidenceCards: [
        {
          id: 'card-s-3',
          title: '7月夏汛期情境特征',
          params: { 月份: '7月', 水位基准: '20.8m', 面积设定: '3850 km²' },
          observation: '【教学情境推演】湖面辽阔连片，NDWI高水体反射。',
          inference: '梅雨强降水与五河汇水膨胀。',
          source: '鄱阳湖微地形与水热节律推演台（情境设定）',
          confidence: 4
        }
      ],
      isShowcased: true
    }
  ]
}

loadInitialSubmissions()

onMounted(async () => {
  if (!accountEnabled) {
    accessNotice.value = '当前仅提供演示样例；连接账号服务后才能读取获授权的班级提交。'
    return
  }
  try {
    const identity = await apiRequest('/api/inquiry/role')
    if (!['teacher', 'admin'].includes(identity.role)) {
      accessNotice.value = '当前账号无教师权限，以下均为演示样例。'
      return
    }
    const data = await apiRequest('/api/inquiry/submissions')
    const real = (data.submissions || []).map(row => {
      let evidenceCards = []
      try { evidenceCards = JSON.parse(row.evidence_records || '[]') } catch {}
      return {
        id: row.id,
        taskId: row.task_id,
        taskTitle: tasks.find(t => t.id === row.task_id)?.shortTitle || row.task_id,
        studentName: row.student_name,
        gradeLevel: row.grade_level,
        classCode: row.class_code,
        versionCount: row.version_count,
        status: row.status,
        initialHypothesis: row.initial_hypothesis,
        revisedConclusion: row.revised_conclusion,
        causalExplanation: row.causal_explanation,
        counterExamples: row.counter_examples,
        modelLimitationsNotes: row.model_limitations,
        evidenceCards,
        showcaseConsent: Boolean(row.showcase_consent),
        isShowcased: Boolean(row.is_showcased),
        isDemo: false
      }
    })
    submissionsList.value = [...real, ...submissionsList.value]
    if (real.length === 0) accessNotice.value = data.notice || '当前没有获授权的学生正式提交。'
  } catch (err) {
    accessNotice.value = `无法读取教师提交：${err.message}。以下仅为演示样例。`
  }
})

const currentTaskMisconceptions = computed(() => {
  const tid = filterTaskId.value === 'all' ? 'urban-flood' : filterTaskId.value
  const t = tasks.find(item => item.id === tid) || tasks[0]
  return t.teacherGuide.commonMisconceptions
})

const filteredSubmissions = computed(() => {
  return submissionsList.value.filter(sub => {
    if (filterTaskId.value !== 'all' && sub.taskId !== filterTaskId.value) return false
    if (filterStatus.value === 'pending' && sub.status === 'reviewed') return false
    if (filterStatus.value === 'reviewed' && sub.status !== 'reviewed') return false
    return true
  })
})

const stats = computed(() => {
  const realList = submissionsList.value.filter(s => !s.isDemo)
  const demoList = submissionsList.value.filter(s => s.isDemo)
  const pendingReal = realList.filter(s => s.status !== 'reviewed').length
  const showcase = submissionsList.value.filter(s => s.isShowcased).length
  return {
    realSubmissions: realList.length,
    pendingReviews: pendingReal,
    showcaseCount: showcase,
    demoCount: demoList.length
  }
})

function inspectSubmission(sub) {
  inspectingSub.value = sub
}

const currentInspectScores = computed(() => {
  if (!inspectingSub.value) return {}
  return inquiryState.reviews[inspectingSub.value.taskId]?.scores || {
    questionQuality: 3,
    variableControl: 4,
    evidenceReliability: 4,
    causalExplanation: 3,
    counterExampleAwareness: 3,
    tradeOffBalance: 3,
    reflectionRevision: 4
  }
})

const currentInspectReview = computed(() => {
  if (!inspectingSub.value) return null
  return inquiryState.reviews[inspectingSub.value.taskId] || null
})

async function onTeacherSaveReview(reviewData) {
  if (!inspectingSub.value) return
  try {
    await saveTeacherReview(inspectingSub.value.taskId, {
      ...reviewData,
      submissionId: inspectingSub.value.id,
      isDemo: Boolean(inspectingSub.value.isDemo),
      isShowcased: false
    })
    inspectingSub.value.status = 'reviewed'
    accessNotice.value = '批阅已保存。'
  } catch (err) {
    accessNotice.value = `批阅未保存：${err.message}`
  }
}

function toggleShowcase(sub) {
  if (!sub.isDemo) return
  if (!sub.isDemo && !sub.showcaseConsent && !sub.isShowcased) {
    alert('【安全合规拦截】该学生尚未在提交时勾选“知情授权在课堂展示”，保护未成年人隐私，禁止未经授权公开展示。')
    return
  }
  sub.isShowcased = !sub.isShowcased
  const review = inquiryState.reviews[sub.taskId] || {
    teacherName: '地理备课组',
    scores: {},
    totalWeightedScore: 85,
    feedbackComment: '优秀的学科实证探究作品。',
    overrideAiAdvice: '',
    isDemo: Boolean(sub.isDemo)
  }
  review.isShowcased = sub.isShowcased
  review.isDemo = Boolean(sub.isDemo)
  review.submissionId = sub.id
  saveTeacherReview(sub.taskId, review)
  persistStore()
}
</script>

<style scoped>
.teacher-studio {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.studio-header {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.studio-badge {
  display: inline-block;
  font-size: 11px;
  font-family: ui-monospace, monospace;
  font-weight: 700;
  color: #0284c7;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}

.title-group h3 {
  margin: 0 0 6px;
  font-size: 22px;
  color: #0f172a;
}

.studio-lead {
  margin: 0;
  font-size: 13px;
  color: #475569;
  max-width: 640px;
  line-height: 1.6;
}

.header-stat-cards {
  display: flex;
  gap: 12px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  padding: 12px 18px;
  border-radius: 8px;
  min-width: 90px;
}

.stat-card.highlight {
  border-color: #f59e0b;
  background: #fefce8;
}

.stat-card.demo-stat {
  border-color: #cbd5e1;
  background: #f1f5f9;
}

.demo-isolation-notice {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.demo-isolation-notice .d-icon {
  font-size: 16px;
}

.demo-isolation-notice p {
  margin: 0;
  font-size: 12px;
  color: #1e40af;
  line-height: 1.5;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.demo-data-tag {
  font-size: 10px;
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: bold;
}

.real-data-tag {
  font-size: 10px;
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #bbf7d0;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: bold;
}

.btn-toggle-showcase.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f1f5f9;
  color: #94a3b8;
}

.stat-num {
  font-size: 24px;
  font-weight: bold;
  color: #0f172a;
}

.stat-card.highlight .stat-num {
  color: #d97706;
}

.stat-lbl {
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}

.misconception-audit-card {
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 10px;
  padding: 16px 20px;
}

.audit-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.audit-head h5 {
  margin: 0;
  font-size: 14px;
  color: #9a3412;
}

.audit-tag {
  font-size: 11px;
  background: #ffedd5;
  color: #c2410c;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.misconceptions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
}

.misconception-item {
  display: flex;
  gap: 10px;
  background: #ffffff;
  border: 1px solid #fed7aa;
  border-radius: 6px;
  padding: 10px 12px;
}

.m-icon {
  font-size: 16px;
}

.m-content strong {
  display: block;
  font-size: 12px;
  color: #9a3412;
  margin-bottom: 4px;
}

.m-content p {
  margin: 0;
  font-size: 11px;
  color: #475569;
  line-height: 1.5;
}

.filter-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  background: #ffffff;
  padding: 12px 18px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #475569;
}

.filter-left select {
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 13px;
  background: #f8fafc;
}

.btn-demo-load {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #334155;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.btn-demo-load:hover {
  background: #e2e8f0;
}

.submissions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-list {
  background: #ffffff;
  padding: 40px;
  text-align: center;
  color: #64748b;
  border-radius: 8px;
  border: 1px dashed #cbd5e1;
}

.submission-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 18px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.sub-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 12px;
  margin-bottom: 12px;
}

.student-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar-chip {
  font-size: 22px;
}

.student-info strong {
  display: block;
  font-size: 15px;
  color: #0f172a;
}

.sub-grade {
  font-size: 12px;
  color: #64748b;
}

.status-tags {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag-version,
.tag-ev-count {
  font-size: 11px;
  background: #f1f5f9;
  color: #475569;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.tag-status {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
}

.tag-status.reviewed {
  background: #dcfce7;
  color: #15803d;
}

.tag-status.pending {
  background: #fef3c7;
  color: #b45309;
}

.diff-glance {
  display: grid;
  grid-template-columns: 1fr auto 1.4fr;
  align-items: center;
  gap: 14px;
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 14px;
}

.diff-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.diff-lbl {
  font-size: 11px;
  font-weight: bold;
  color: #64748b;
}

.diff-box p {
  margin: 0;
  font-size: 12px;
  color: #334155;
  line-height: 1.5;
}

.diff-arrow {
  color: #94a3b8;
  font-size: 18px;
}

.sub-card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-inspect {
  background: #0284c7;
  color: #ffffff;
  border: 0;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-inspect:hover {
  background: #0369a1;
}

.btn-toggle-showcase {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-toggle-showcase.is-showcased {
  background: #fefce8;
  border-color: #facc15;
  color: #a16207;
}

/* 审阅弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-dialog {
  background: #ffffff;
  border-radius: 12px;
  width: min(920px, 100%);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.m-header-left h4 {
  margin: 0;
  font-size: 18px;
  color: #0f172a;
}

.m-subtitle {
  font-size: 12px;
  color: #64748b;
}

.btn-close-modal {
  background: transparent;
  border: 0;
  font-size: 20px;
  color: #94a3b8;
  cursor: pointer;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-review-block {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
}

.section-review-block h5 {
  margin: 0 0 10px;
  font-size: 14px;
  color: #1e293b;
}

.modal-evidence-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 10px;
}

.modal-ev-chip {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 10px;
  font-size: 11px;
}

.modal-ev-chip strong {
  display: block;
  color: #0284c7;
  margin-bottom: 4px;
}

.modal-ev-chip p {
  margin: 0 0 4px;
  line-height: 1.4;
  color: #334155;
}

.modal-ev-chip small {
  color: #64748b;
}

@media (max-width: 768px) {
  .diff-glance {
    grid-template-columns: 1fr;
  }
}
</style>
