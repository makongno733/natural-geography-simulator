<template>
  <div class="inquiry-studio-hub" role="main">
    <!-- 探究中心顶部大导航 Hero -->
    <header class="hub-hero">
      <div class="wide-container">
        <div class="hero-content">
          <p class="hero-kicker">GEOGRAPHY INNOVATION INQUIRY CENTER · 地理创新探究中心</p>
          <h1 class="hero-title">从一张图、一个模型，<br>走向一个完整的科学解释。</h1>
          <p class="hero-lead">
            面向 2026 教学创新与学科素养发布标准。在三维仿真与真实遥感中严格控制变量，采集客观证据，区分“事实”与“推论”，依托思维支架与 7 维量规完成可审阅、可推演的探究闭环。
          </p>

          <!-- 模式切换主导航 (Tabs) -->
          <div class="hub-nav-tabs" role="tablist" aria-label="创新探究中心主导航">
            <button
              type="button"
              role="tab"
              :aria-selected="activeTab === 'workbench'"
              :class="['tab-btn', { active: activeTab === 'workbench' }]"
              @click="switchTab('workbench')"
            >
              <span class="tab-badge">STUDENT</span>
              <strong>学生探究工作台</strong>
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="activeTab === 'tasks'"
              :class="['tab-btn', { active: activeTab === 'tasks' }]"
              @click="switchTab('tasks')"
            >
              <span class="tab-badge">FLAGSHIPS</span>
              <strong>三大旗舰探究课题</strong>
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="activeTab === 'teacher'"
              :class="['tab-btn', { active: activeTab === 'teacher' }]"
              @click="switchTab('teacher')"
            >
              <span class="tab-badge">TEACHER</span>
              <strong>教师工作台与量规</strong>
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="activeTab === 'showcase'"
              :class="['tab-btn', { active: activeTab === 'showcase' }]"
              @click="switchTab('showcase')"
            >
              <span class="tab-badge">GALLERY</span>
              <strong>课堂展示墙 (已脱敏)</strong>
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="activeTab === 'demo'"
              :class="['tab-btn demo-btn', { active: activeTab === 'demo' }]"
              @click="switchTab('demo')"
            >
              <span class="tab-badge pulse">LIVE</span>
              <strong>5-7分钟发布会演练</strong>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- 主工作区容器 -->
    <main class="wide-container hub-main-body">
      <!-- 1. 学生探究工作台 -->
      <section v-if="activeTab === 'workbench'" class="tab-view" aria-label="学生探究工作台">
        <!-- 课题快捷切换条 -->
        <div class="task-selector-strip">
          <span class="strip-label">当前探究课题：</span>
          <div class="task-pill-group">
            <button
              v-for="t in tasks"
              :key="t.id"
              type="button"
              class="task-pill"
              :class="{ active: currentTaskId === t.id }"
              @click="selectTask(t.id)"
            >
              <span class="pill-field">{{ t.fieldName }}</span>
              <strong class="pill-title">{{ t.shortTitle }}</strong>
            </button>
          </div>
          <button type="button" class="btn-load-exemplary" @click="loadExemplary">
            ✨ 载入该课题示范成果
          </button>
        </div>

        <StudentWorkbench :task="activeTask" />
      </section>

      <!-- 2. 三大旗舰探究课题介绍 -->
      <section v-else-if="activeTab === 'tasks'" class="tab-view" aria-label="三大旗舰探究课题">
        <div class="flagships-overview">
          <div class="overview-header">
            <h3>三个真正做透的旗舰精品探究</h3>
            <p>分别覆盖【自然地理过程】、【真实数据判读】与【人文区域决策】。具备中高中双阶适配、教师指南、常见误解与完整示范作品。</p>
          </div>

          <div class="flagship-cards-grid">
            <div
              v-for="t in tasks"
              :key="t.id"
              class="flagship-card"
            >
              <div class="f-card-top">
                <span class="f-badge">{{ t.badge }}</span>
                <span class="f-grade">适配：{{ t.gradeLevels.join(' / ') }}</span>
              </div>
              <h4>{{ t.title }}</h4>
              <p class="f-driving"><strong>驱动问题：</strong>{{ t.drivingQuestion }}</p>

              <div class="f-meta-block">
                <strong>📖 课标覆盖：</strong>
                <p>{{ t.standardsAlignment['高中'] }}</p>
              </div>

              <div class="f-exemplary-preview">
                <strong>🏆 满分示范作品亮点：</strong>
                <p>{{ t.exemplaryWork.revisedConclusion }}</p>
              </div>

              <div class="f-actions">
                <button
                  type="button"
                  class="btn-start-inquiry"
                  @click="startTaskInWorkbench(t.id)"
                >
                  🚀 进入该课题探究工作台 ➔
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. 教师工作台 -->
      <section v-else-if="activeTab === 'teacher'" class="tab-view" aria-label="教师工作台">
        <TeacherStudio />
      </section>

      <!-- 4. 课堂展示墙 -->
      <section v-else-if="activeTab === 'showcase'" class="tab-view" aria-label="课堂展示墙">
        <InquiryShowcaseWall />
      </section>

      <!-- 5. 5-7分钟发布会演练 -->
      <section v-else-if="activeTab === 'demo'" class="tab-view" aria-label="发布会演示链路">
        <InquiryDemoWalkthrough @finish-demo="activeTab = 'showcase'" />
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { INQUIRY_TASKS } from './inquiryData.js'
import {
  inquiryState,
  initInquiryStore,
  currentTask,
  loadExemplaryDraft
} from './inquiryStore.js'
import StudentWorkbench from './StudentWorkbench.vue'
import TeacherStudio from './TeacherStudio.vue'
import InquiryShowcaseWall from './InquiryShowcaseWall.vue'
import InquiryDemoWalkthrough from './InquiryDemoWalkthrough.vue'

const maybeRoute = useRoute()
const maybeRouter = useRouter()
const route = maybeRoute || { query: {} }
const router = maybeRouter || { replace: () => {} }

const tasks = INQUIRY_TASKS
const activeTab = ref('workbench')
const currentTaskId = ref('urban-flood')

onMounted(() => {
  initInquiryStore()
  // 支持 URL 参数同步 tab 与 task
  if (route?.query?.tab) {
    activeTab.value = route.query.tab
  }
  if (route?.query?.task && tasks.some(t => t.id === route.query.task)) {
    currentTaskId.value = route.query.task
    inquiryState.activeTaskId = route.query.task
  }
})

if (maybeRoute) {
  watch(() => route.query, (q) => {
    if (!q) return
    if (q.tab) activeTab.value = q.tab
    if (q.task && tasks.some(t => t.id === q.task)) {
      currentTaskId.value = q.task
      inquiryState.activeTaskId = q.task
    }
  })
}

const activeTask = computed(() => {
  return tasks.find(t => t.id === currentTaskId.value) || tasks[0]
})

function switchTab(tab) {
  activeTab.value = tab
  router.replace?.({ query: { ...(route?.query || {}), tab } })
}

function selectTask(taskId) {
  currentTaskId.value = taskId
  inquiryState.activeTaskId = taskId
  router.replace?.({ query: { ...(route?.query || {}), task: taskId } })
}

function startTaskInWorkbench(taskId) {
  selectTask(taskId)
  switchTab('workbench')
}

function loadExemplary() {
  loadExemplaryDraft(currentTaskId.value)
  alert(`已成功载入《${activeTask.value.shortTitle}》的标准示范探究数据！`)
}
</script>

<style scoped>
.inquiry-studio-hub {
  background: #f8fafc;
  min-height: 100vh;
  color: #1e293b;
  padding-bottom: 60px;
}

.wide-container {
  width: min(100% - 48px, 1200px);
  margin-inline: auto;
}

.hub-hero {
  background: #0f2735;
  color: #f1f5f9;
  padding: 48px 0 24px;
  border-bottom: 1px solid #1e3a4c;
}

.hero-kicker {
  margin: 0 0 12px;
  font-size: 11px;
  font-family: ui-monospace, monospace;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #38bdf8;
}

.hero-title {
  margin: 0 0 16px;
  font-size: clamp(28px, 4vw, 44px);
  line-height: 1.15;
  color: #f8fafc;
  letter-spacing: -0.02em;
}

.hero-lead {
  margin: 0 0 32px;
  font-size: clamp(14px, 1.2vw, 16px);
  color: #cbd5e1;
  max-width: 820px;
  line-height: 1.7;
}

.hub-nav-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  border-top: 1px solid #1e3a4c;
  padding-top: 20px;
}

.tab-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 10px 18px;
  background: #143547;
  border: 1px solid #234e66;
  border-radius: 8px;
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #1a445b;
  color: #ffffff;
}

.tab-btn.active {
  background: #0284c7;
  border-color: #38bdf8;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);
}

.tab-badge {
  font-size: 9px;
  font-family: ui-monospace, monospace;
  font-weight: bold;
  letter-spacing: 0.08em;
  color: #7dd3fc;
  margin-bottom: 2px;
}

.tab-btn.active .tab-badge {
  color: #e0f2fe;
}

.tab-btn.demo-btn {
  background: #064e3b;
  border-color: #059669;
}

.tab-btn.demo-btn.active {
  background: #059669;
  border-color: #34d399;
}

.pulse {
  animation: pulseAnim 1.5s infinite;
}

@keyframes pulseAnim {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.hub-main-body {
  margin-top: 28px;
}

.task-selector-strip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 18px;
  margin-bottom: 20px;
}

.strip-label {
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
}

.task-pill-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.task-pill {
  display: flex;
  flex-direction: column;
  padding: 6px 14px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.task-pill:hover {
  background: #eff6ff;
  border-color: #93c5fd;
}

.task-pill.active {
  background: #0284c7;
  border-color: #0284c7;
  color: #ffffff;
}

.pill-field {
  font-size: 10px;
  color: #64748b;
  font-weight: 600;
}

.task-pill.active .pill-field {
  color: #e0f2fe;
}

.pill-title {
  font-size: 13px;
}

.btn-load-exemplary {
  background: #f0fdf4;
  border: 1px solid #86efac;
  color: #166534;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.btn-load-exemplary:hover {
  background: #dcfce7;
}

.flagships-overview {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.overview-header h3 {
  margin: 0 0 8px;
  font-size: 22px;
  color: #0f172a;
}

.overview-header p {
  margin: 0;
  font-size: 14px;
  color: #475569;
}

.flagship-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 20px;
}

.flagship-card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.f-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.f-badge {
  font-size: 11px;
  font-weight: bold;
  background: #e0f2fe;
  color: #0369a1;
  padding: 3px 8px;
  border-radius: 4px;
}

.f-grade {
  font-size: 11px;
  color: #64748b;
}

.flagship-card h4 {
  margin: 0;
  font-size: 17px;
  color: #0f172a;
  line-height: 1.4;
}

.f-driving {
  margin: 0;
  font-size: 13px;
  color: #334155;
  line-height: 1.6;
}

.f-meta-block,
.f-exemplary-preview {
  background: #f8fafc;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 12px;
}

.f-meta-block strong,
.f-exemplary-preview strong {
  display: block;
  color: #475569;
  margin-bottom: 2px;
}

.f-meta-block p,
.f-exemplary-preview p {
  margin: 0;
  color: #334155;
  line-height: 1.5;
}

.f-actions {
  margin-top: auto;
  padding-top: 10px;
}

.btn-start-inquiry {
  width: 100%;
  background: #0284c7;
  color: #ffffff;
  border: 0;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-start-inquiry:hover {
  background: #0369a1;
}

@media (max-width: 640px) {
  .hero-title {
    font-size: 26px;
  }
  .task-selector-strip {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
