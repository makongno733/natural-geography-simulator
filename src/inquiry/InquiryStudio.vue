<template>
  <div class="inquiry-studio-hub" role="main">
    <!-- 聚焦 3 分钟快速实验顶栏（当从首页“开始 3 分钟实验”或分享链接 mode=compare 进入时展示，避免首次进入被 5 个顶栏 Tab 与 6 步工作台淹没） -->
    <header v-if="isFocusedCompareMode" class="focused-compare-header" aria-label="3分钟快速对照实验导航栏">
      <div class="wide-container focused-compare-bar">
        <div class="focused-bar-left">
          <router-link to="/community" class="btn-back-community">← 返回首页</router-link>
          <span class="focused-mode-pill">⏱ 3 分钟对照实验</span>
          <strong class="focused-task-title">{{ activeTask.shortTitle }}：猜想 → 并排比较 → 解释 → 证据卡</strong>
        </div>
        <div class="focused-bar-right">
          <button
            type="button"
            class="btn-expand-full-studio"
            data-testid="expand-full-studio-btn"
            @click="expandFullStudio"
          >
            🧭 展开完整 6 步探究工作台与教师量规 ▾
          </button>
        </div>
      </div>
    </header>

    <!-- 探究中心顶部大导航 Hero（完整工作台模式） -->
    <header v-else class="hub-hero">
      <div class="wide-container">
        <div class="hero-content">
          <div class="hero-kicker-row">
            <p class="hero-kicker">地理创新探究中心</p>
            <button
              v-if="hasCompareQuery && fullStudioExpanded"
              type="button"
              class="btn-collapse-to-compare"
              @click="fullStudioExpanded = false"
            >
              ⏱ 收起为 3 分钟专注实验视图 ▴
            </button>
          </div>
          <h1 class="hero-title">从一张图、一个模型，<br>走向一个完整的科学解释。</h1>
          <p class="hero-lead">
            为什么同一场雨，有的路口积水，有的没有？先选两种地面，在模型里给它们相同的雨量，比较流走的水有多少。记下你看到的差别，再说它能支持什么解释。<br>
            <strong>探究步骤：</strong>提出问题 → 决定只改哪一项 → 记录你看到的结果 → 用证据解释 → 想想还有没有别的原因 → 整理并去社区讨论。
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
              <span class="tab-badge">动手探究</span>
              <strong>学生探究工作台</strong>
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="activeTab === 'tasks'"
              :class="['tab-btn', { active: activeTab === 'tasks' }]"
              @click="switchTab('tasks')"
            >
              <span class="tab-badge">课题范例</span>
              <strong>三大旗舰探究课题</strong>
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="activeTab === 'teacher'"
              :class="['tab-btn', { active: activeTab === 'teacher' }]"
              @click="switchTab('teacher')"
            >
              <span class="tab-badge">评价看板</span>
              <strong>教师工作台与量规</strong>
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="activeTab === 'showcase'"
              :class="['tab-btn', { active: activeTab === 'showcase' }]"
              @click="switchTab('showcase')"
            >
              <span class="tab-badge">成果展示</span>
              <strong>课堂展示墙 (已脱敏)</strong>
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="activeTab === 'demo'"
              :class="['tab-btn demo-btn', { active: activeTab === 'demo' }]"
              @click="switchTab('demo')"
            >
              <span class="tab-badge pulse">演练</span>
              <strong>5-7分钟发布会演练</strong>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- 主工作区容器 -->
    <main class="wide-container hub-main-body" :class="{ 'is-focused-main': isFocusedCompareMode }">
      <!-- 1. 学生探究工作台 -->
      <section v-if="activeTab === 'workbench'" class="tab-view" aria-label="学生探究工作台">
        <!-- 课题快捷切换条（仅在完整工作台模式下显示） -->
        <div v-if="!isFocusedCompareMode" class="task-selector-strip">
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

        <StudentWorkbench
          v-if="inquiryState.storageReady"
          :task="activeTask"
          :focused-compare="isFocusedCompareMode"
          @expand-full-workbench="expandFullStudio"
        />
        <p v-else role="status">正在读取当前账号的本机探究草稿…</p>
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
const fullStudioExpanded = ref(false)

const hasCompareQuery = computed(() => {
  const q = route?.query || {}
  return Boolean(
    !q.tab &&
    (q.mode === 'compare' || q.shared === '1' || q.surfaceA || q.surfaceB)
  )
})

const isFocusedCompareMode = computed(() => {
  return hasCompareQuery.value && !fullStudioExpanded.value && activeTab.value === 'workbench'
})

function expandFullStudio() {
  fullStudioExpanded.value = true
}

onMounted(() => {
  initInquiryStore()
  // 支持 URL 参数同步 tab 与 task
  if (route?.query?.tab) {
    activeTab.value = route.query.tab
    fullStudioExpanded.value = true
  }
  if (route?.query?.task && tasks.some(t => t.id === route.query.task)) {
    currentTaskId.value = route.query.task
    inquiryState.activeTaskId = route.query.task
  }
})

if (maybeRoute) {
  watch(() => route.query, (q) => {
    if (!q) return
    if (q.tab) {
      activeTab.value = q.tab
      fullStudioExpanded.value = true
    } else if (!q.mode && !q.shared && !q.surfaceA && !q.surfaceB) {
      fullStudioExpanded.value = false
    }
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

.focused-compare-header {
  background: #0f2735;
  color: #f8fafc;
  border-bottom: 1px solid #1e3a4c;
  padding: 12px 0;
}

.focused-compare-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.focused-bar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-back-community {
  display: inline-flex;
  align-items: center;
  color: #bae6fd;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  padding: 5px 10px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(186, 230, 253, 0.25);
}

.btn-back-community:hover {
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
}

.focused-mode-pill {
  background: rgba(56, 189, 248, 0.2);
  color: #7dd3fc;
  border: 1px solid rgba(56, 189, 248, 0.4);
  font-size: 12px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
}

.focused-task-title {
  font-size: 14px;
  color: #f1f5f9;
}

.btn-expand-full-studio,
.btn-collapse-to-compare {
  background: rgba(14, 165, 233, 0.18);
  color: #e0f2fe;
  border: 1px solid rgba(56, 189, 248, 0.45);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-expand-full-studio:hover,
.btn-collapse-to-compare:hover {
  background: rgba(14, 165, 233, 0.32);
  color: #ffffff;
}

.hero-kicker-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.hero-kicker-row .hero-kicker {
  margin: 0;
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
