<template>
  <div class="student-workbench" role="main" aria-label="学生地理探究工作台">
    <!-- 顶部状态栏与操作栏 -->
    <div class="workbench-bar">
      <div class="bar-left">
        <span class="task-badge">{{ task.fieldName }}</span>
        <h2 class="task-title">{{ task.title }}</h2>
        <div class="grade-selector">
          <label>当前学段目标：</label>
          <select v-model="draft.gradeLevel" @change="onGradeChange">
            <option value="初中">初中课标重点（现象与对比）</option>
            <option value="高中">高中课标重点（机理与过程）</option>
          </select>
        </div>
      </div>
      <div class="bar-right">
        <div class="save-indicator" :class="syncStatusClass">
          <span class="status-dot"></span>
          <span>{{ syncStatusText }}</span>
        </div>
        <div class="action-buttons">
          <button type="button" class="btn-tool" @click="triggerVersionSave">
            📌 记录版本快照
          </button>
          <button type="button" class="btn-tool" @click="exportMarkdown">
            ⬇ 导出报告 (.md)
          </button>
          <button type="button" class="btn-tool" @click="exportHtml">
            🖨 打印/预览 (.html)
          </button>
          <button
            type="button"
            class="btn-submit"
            :class="{ 'is-submitted': draft.isSubmitted }"
            @click="handleSubmit"
          >
            {{ draft.isSubmitted ? '✓ 已提交成果' : '🚀 提交探究报告' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 课标与教学目标指引条 -->
    <div class="standards-banner">
      <span class="banner-kicker">🎯 课标契合点：</span>
      <p>{{ task.standardsAlignment[draft.gradeLevel] || task.standardsAlignment['高中'] }}</p>
    </div>

    <!-- 探究步骤导航标签 (Stepper) -->
    <nav class="step-nav" aria-label="探究阶段导航">
      <button
        v-for="st in steps"
        :key="st.num"
        type="button"
        class="step-item"
        :class="{ active: currentStep === st.num, done: currentStep > st.num }"
        @click="currentStep = st.num"
      >
        <span class="step-num">{{ st.num }}</span>
        <span class="step-name">{{ st.name }}</span>
      </button>
    </nav>

    <!-- 步骤一：驱动问题与已有前概念 -->
    <section v-show="currentStep === 1" class="step-panel" aria-labelledby="step1-heading">
      <div class="panel-intro">
        <span class="step-tag">STEP 01 / 问题驱动与前概念诊断</span>
        <h3 id="step1-heading">从一个真实的地理问题出发</h3>
        <div class="driving-card">
          <span class="q-kicker">核心驱动问题：</span>
          <p class="driving-text">{{ task.drivingQuestion }}</p>
        </div>
      </div>

      <div class="form-block">
        <label for="prior-conceptions">
          <strong>1. 已有认识与前概念（探究前）：</strong>
          <small>在进行实验之前，根据你平时的生活观察或初中所学，你是如何看待这个问题的？</small>
        </label>
        <textarea
          id="prior-conceptions"
          v-model="draft.priorConceptions"
          rows="3"
          placeholder="例如：我以前觉得城市容易积水纯粹是因为下水道不够粗，雨下得太大排不走..."
          @input="onFieldInput"
        ></textarea>
      </div>

      <div class="form-block highlight-block">
        <label for="initial-hypothesis">
          <strong>2. 我的初始猜想与假说 (Hypothesis V1)：</strong>
          <small>请用一句话提出可被实验检验的猜想（必须包含因果关系，如“如果……那么……”）：</small>
        </label>
        <textarea
          id="initial-hypothesis"
          v-model="draft.initialHypothesis"
          rows="3"
          placeholder="我的假说：我认为城市内涝的主要原因是……只要……就能解决……"
          @input="onFieldInput"
        ></textarea>
      </div>

      <div class="step-footer-actions">
        <button type="button" class="btn-next" @click="currentStep = 2">
          下一步：设计控制变量 →
        </button>
      </div>
    </section>

    <!-- 步骤二：变量与控制条件 -->
    <section v-show="currentStep === 2" class="step-panel" aria-labelledby="step2-heading">
      <div class="panel-intro">
        <span class="step-tag">STEP 02 / 科学实验设计</span>
        <h3 id="step2-heading">控制变量：怎样做才是一场公平的实验？</h3>
        <p class="intro-desc">
          如果同时改变降雨强度和地面材质，就无法判断积水是因为“雨太大”还是“地面不透水”。为了得出科学结论，必须严格执行单一变量对照。
        </p>
      </div>

      <div class="variables-form">
        <div class="var-field">
          <label><strong>自变量（本次实验唯一允许改变的因素）：</strong></label>
          <input
            v-model="draft.variablesSetup.independent"
            type="text"
            placeholder="例如：地表材质类型（水泥硬化 vs 海绵透水铺装 vs 天然草地）"
            @input="onFieldInput"
          />
        </div>

        <div class="var-field">
          <label><strong>因变量（我们观察和测量的响应指标）：</strong></label>
          <input
            v-model="draft.variablesSetup.dependent"
            type="text"
            placeholder="例如：地表径流峰值流量、产流历时（到达峰值的时间）、下渗水量"
            @input="onFieldInput"
          />
        </div>

        <div class="var-field">
          <label><strong>控制变量（必须保持完全相同的背景条件）：</strong></label>
          <div class="tag-input-row">
            <span
              v-for="(c, i) in draft.variablesSetup.controlled"
              :key="i"
              class="controlled-chip"
            >
              {{ c }}
              <button type="button" @click="removeControlled(i)">×</button>
            </span>
          </div>
          <div class="add-chip-row">
            <input
              v-model="newControlledInput"
              type="text"
              placeholder="输入一个控制变量（例如：降雨强度 50mm/h），按回车添加"
              @keydown.enter.prevent="addControlled"
            />
            <button type="button" @click="addControlled">添加条件</button>
          </div>
        </div>
      </div>

      <div class="step-footer-actions">
        <button type="button" class="btn-prev" @click="currentStep = 1">← 上一步</button>
        <button type="button" class="btn-next" @click="currentStep = 3">
          下一步：运行交互仿真并捕获证据 →
        </button>
      </div>
    </section>

    <!-- 步骤三：动手仿真与证据链 -->
    <section v-show="currentStep === 3" class="step-panel" aria-labelledby="step3-heading">
      <div class="panel-intro">
        <span class="step-tag">STEP 03 / 动手仿真与实证记录</span>
        <h3 id="step3-heading">在交互模型中生成对比证据</h3>
        <p class="intro-desc">
          保持降雨强度与历时不变，分别测试不同工况。每次测试后点击【捕获为科学证据卡】，形成完整的对照证据链。
        </p>
      </div>

      <!-- 动态挂载对应的探究仿真组件 -->
      <component
        :is="activeSimComponent"
        @capture="onCaptureEvidence"
      />

      <!-- 科学证据卡列表 -->
      <EvidenceCardList
        :cards="draft.evidenceCards"
        @remove="onRemoveCard"
        @update="onUpdateCard"
      />

      <div class="step-footer-actions">
        <button type="button" class="btn-prev" @click="currentStep = 2">← 上一步</button>
        <button type="button" class="btn-next" @click="currentStep = 4">
          下一步：因果机制解释与反例 →
        </button>
      </div>
    </section>

    <!-- 步骤四：解释与反例质证 -->
    <section v-show="currentStep === 4" class="step-panel" aria-labelledby="step4-heading">
      <div class="panel-intro">
        <span class="step-tag">STEP 04 / 机制阐释与边界意识</span>
        <h3 id="step4-heading">用地理原理阐明因果，并寻找反例</h3>
      </div>

      <div class="form-block">
        <label for="causal-explanation">
          <strong>1. 因果机制解释（结合你收集的证据卡）：</strong>
          <small>运用水循环、水动力学或地貌过程等地理术语，解释为什么不同地表会产生如此巨大的径流差异？</small>
        </label>
        <textarea
          id="causal-explanation"
          v-model="draft.causalExplanation"
          rows="4"
          placeholder="结合证据卡#1与#2：当路面被水泥硬化后，切断了雨水下渗补给地下水的过程，地表粗糙度小导致汇流迅速……"
          @input="onFieldInput"
        ></textarea>
      </div>

      <div class="form-block">
        <label for="counter-examples">
          <strong>2. 反例思考与例外条件（思维深刻性）：</strong>
          <small>在什么特殊情况下，上述规律会不成立？（例如：透水铺装在什么情况下依然会严重积水？）</small>
        </label>
        <textarea
          id="counter-examples"
          v-model="draft.counterExamples"
          rows="3"
          placeholder="例如：在持续数日特大暴雨导致地下碎石调蓄层达到100%饱和后，或者遇到低洼立交桥地下水顶托时……"
          @input="onFieldInput"
        ></textarea>
      </div>

      <div class="form-block">
        <label for="model-limits">
          <strong>3. 本教学模型的简化假设与不能解释的事物：</strong>
          <small>科学模型不等于真实全貌。本仿真忽略了真实城市中的哪些关键因素？</small>
        </label>
        <textarea
          id="model-limits"
          v-model="draft.modelLimitationsNotes"
          rows="3"
          placeholder="例如：模型假设降雨全区均匀，未考虑暴雨雨窝移动；未计算外江外河超标洪水倒灌顶托等复杂水力工况……"
          @input="onFieldInput"
        ></textarea>
      </div>

      <div class="step-footer-actions">
        <button type="button" class="btn-prev" @click="currentStep = 3">← 上一步</button>
        <button type="button" class="btn-next" @click="currentStep = 5">
          下一步：求助思维支架与助学顾问 →
        </button>
      </div>
    </section>

    <!-- 步骤五：AI 助学支架 -->
    <section v-show="currentStep === 5" class="step-panel" aria-labelledby="step5-heading">
      <div class="panel-intro">
        <span class="step-tag">STEP 05 / 助学顾问与思维深化</span>
        <h3 id="step5-heading">向助学顾问求助，检查证据漏洞</h3>
      </div>

      <InquiryScaffolding
        :task="task"
        :feedbacks="draft.aiFeedbackHistory"
        :teacher-override-notice="teacherAdviceNotice"
        @ask="onScaffoldAsk"
      />

      <div class="step-footer-actions">
        <button type="button" class="btn-prev" @click="currentStep = 4">← 上一步</button>
        <button type="button" class="btn-next" @click="currentStep = 6">
          下一步：修订结论与成果报告 →
        </button>
      </div>
    </section>

    <!-- 步骤六：修订结论与成果对比 -->
    <section v-show="currentStep === 6" class="step-panel" aria-labelledby="step6-heading">
      <div class="panel-intro">
        <span class="step-tag">STEP 06 / 思维转变与成果总结</span>
        <h3 id="step6-heading">思维增量：证据如何改变了我的认知？</h3>
      </div>

      <!-- 原假说 vs 修订结论 双向对照卡片 -->
      <div class="comparison-contrast-card">
        <div class="contrast-col before">
          <span class="col-badge">原猜想 (Version 1)</span>
          <p>{{ draft.initialHypothesis || '（尚未记录初始猜想）' }}</p>
        </div>
        <div class="contrast-divider" aria-hidden="true">➔</div>
        <div class="contrast-col after">
          <span class="col-badge">修订结论 (Version 2)</span>
          <textarea
            v-model="draft.revisedConclusion"
            rows="4"
            placeholder="根据实验数据，我修正了初始观点：城市内涝的根源不是单纯排不及，而是……海绵城市能够……但不能完全替代……"
            @input="onFieldInput"
          ></textarea>
        </div>
      </div>

      <div class="form-block">
        <label for="next-questions">
          <strong>探究延伸与下一步追问（从一个问题走向更多问题）：</strong>
          <small>完成本次探究后，你还对哪些地理或工程现象产生了新的疑问？</small>
        </label>
        <textarea
          id="next-questions"
          v-model="draft.nextQuestions"
          rows="2"
          placeholder="例如：不同城市土壤类型（如黄土、红壤与砂土）对海绵工程下渗效率有何差异？"
          @input="onFieldInput"
        ></textarea>
      </div>

      <!-- 表现性量规自评与教师评价 -->
      <RubricEvaluationPanel
        :task-id="task.id"
        mode="student"
        :initial-scores="studentSelfScores"
        :existing-review="existingReview"
        @score-change="onSelfScoreChange"
      />

      <!-- 课堂展示知情同意授权 -->
      <div class="consent-checkbox-row">
        <label class="consent-lbl">
          <input type="checkbox" v-model="draft.showcaseConsent" @change="onFieldInput" />
          <span>知情意向：同意将本作品提交人工脱敏复核。当前真实学生作品暂不公开展示；撤回勾选并重新提交可撤回此意向。</span>
        </label>
      </div>

      <!-- 提交状态与反馈提示条 -->
      <div v-if="submitResultMsg" :class="['submit-result-banner', submitResultStatus]" role="status" aria-live="polite">
        <p>{{ submitResultMsg }}</p>
        <router-link v-if="submitResultStatus === 'warning'" to="/account" class="btn-goto-login">
          去登录学生账号 ➔
        </router-link>
      </div>

      <div class="report-actions-bottom">
        <button type="button" class="btn-big-export" @click="exportMarkdown">
          📥 下载完整探究报告 (Markdown)
        </button>
        <button type="button" class="btn-big-print" @click="exportHtml">
          🖨 打印 / 网页预览报告
        </button>
        <button
          type="button"
          class="btn-big-submit"
          :class="{ 'is-submitted': draft.isSubmitted }"
          :disabled="isSubmitting"
          @click="handleSubmit"
        >
          {{ isSubmitting ? '正在提交中…' : draft.isSubmitted ? '✓ 重新提交更新版本' : '🚀 提交成果至教师端进行专业量规鉴定' }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, shallowRef } from 'vue'
import {
  inquiryState,
  getCurrentDraft,
  persistStore,
  addEvidenceCard,
  removeEvidenceCard,
  createVersionSnapshot,
  submitCurrentInquiry,
  syncCloudDraft,
  syncStudentReviews,
  exportReportAsMarkdown,
  exportReportAsHtml
} from './inquiryStore.js'
import UrbanFloodSim from './simulations/UrbanFloodSim.vue'
import LandscapeVariationSim from './simulations/LandscapeVariationSim.vue'
import HumanEnvironmentDecisionSim from './simulations/HumanEnvironmentDecisionSim.vue'
import EvidenceCardList from './components/EvidenceCardList.vue'
import InquiryScaffolding from './components/InquiryScaffolding.vue'
import RubricEvaluationPanel from './components/RubricEvaluationPanel.vue'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const currentStep = ref(1)
const newControlledInput = ref('')
const studentSelfScores = ref({})

const steps = [
  { num: 1, name: '驱动问题与猜想' },
  { num: 2, name: '变量与控制设计' },
  { num: 3, name: '仿真与证据链' },
  { num: 4, name: '因果解释与反例' },
  { num: 5, name: '助学顾问支架' },
  { num: 6, name: '修订结论与导出' },
]

const draft = computed(() => getCurrentDraft())

onMounted(async () => {
  await syncCloudDraft(props.task.id)
  try { await syncStudentReviews() } catch {}
})

const activeSimComponent = computed(() => {
  if (props.task.id === 'landscape-variation') return LandscapeVariationSim
  if (props.task.id === 'human-environment-decision') return HumanEnvironmentDecisionSim
  return UrbanFloodSim
})

const syncStatusClass = computed(() => {
  return inquiryState.syncStatus
})

const syncStatusText = computed(() => {
  if (inquiryState.syncStatus === 'saving') return '正在保存草稿…'
  if (inquiryState.syncStatus === 'error') return '保存异常（支持本地离线）'
  return '已实时同步保存'
})

const teacherAdviceNotice = computed(() => {
  return inquiryState.reviews[props.task.id]?.overrideAiAdvice || ''
})

const existingReview = computed(() => {
  return inquiryState.reviews[props.task.id] || null
})

function onGradeChange() {
  persistStore()
}

function onFieldInput() {
  draft.value.updatedAt = new Date().toISOString()
  persistStore()
}

function addControlled() {
  const val = newControlledInput.value.trim()
  if (!val) return
  if (!draft.value.variablesSetup.controlled) {
    draft.value.variablesSetup.controlled = []
  }
  draft.value.variablesSetup.controlled.push(val)
  newControlledInput.value = ''
  persistStore()
}

function removeControlled(idx) {
  draft.value.variablesSetup.controlled.splice(idx, 1)
  persistStore()
}

function onCaptureEvidence(cardData) {
  addEvidenceCard(cardData)
}

function onRemoveCard(id) {
  removeEvidenceCard(id)
}

function onUpdateCard() {
  persistStore()
}

function onScaffoldAsk(feedbackItem) {
  if (!draft.value.aiFeedbackHistory) {
    draft.value.aiFeedbackHistory = []
  }
  draft.value.aiFeedbackHistory.unshift(feedbackItem)
  persistStore()
}

function onSelfScoreChange({ dimId, score }) {
  studentSelfScores.value[dimId] = score
}

function triggerVersionSave() {
  createVersionSnapshot('学生手动快照保存')
  alert('已成功保存当前探究快照！可在历史版本中追溯。')
}

const isSubmitting = ref(false)
const submitResultMsg = ref('')
const submitResultStatus = ref('')

async function handleSubmit() {
  isSubmitting.value = true
  submitResultMsg.value = '正在处理提交…'
  try {
    const res = await submitCurrentInquiry({ showcaseConsent: draft.value.showcaseConsent })
    submitResultMsg.value = res.message
    submitResultStatus.value = res.ok ? 'success' : res.status === 'unauthenticated' ? 'warning' : 'error'
  } catch (err) {
    submitResultMsg.value = `提交异常：${err.message || '网络连接失败'}`
    submitResultStatus.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}

function exportMarkdown() {
  const md = exportReportAsMarkdown(props.task.id)
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `地理创新探究报告-${props.task.code}-${Date.now()}.md`
  a.click()
  URL.revokeObjectURL(url)
}

function exportHtml() {
  const html = exportReportAsHtml(props.task.id)
  const w = window.open('', '_blank')
  if (w) {
    w.document.write(html)
    w.document.close()
  } else {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `地理创新探究报告-${props.task.code}.html`
    a.click()
    URL.revokeObjectURL(url)
  }
}
</script>

<style scoped>
.student-workbench {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.workbench-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  background: #ffffff;
  padding: 18px 24px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.task-badge {
  display: inline-block;
  font-size: 11px;
  font-family: ui-monospace, monospace;
  font-weight: 700;
  color: #0284c7;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}

.task-title {
  margin: 0 0 8px;
  font-size: 20px;
  color: #0f172a;
}

.grade-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #475569;
}

.grade-selector select {
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  background: #f8fafc;
}

.bar-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.save-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #64748b;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
}

.save-indicator.saving .status-dot {
  background: #f59e0b;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.btn-tool {
  background: #f8fafc;
  color: #334155;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-tool:hover {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #1d4ed8;
}

.btn-submit {
  background: #0284c7;
  color: #ffffff;
  border: 0;
  border-radius: 6px;
  padding: 6px 16px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-submit:hover {
  background: #0369a1;
}

.btn-submit.is-submitted {
  background: #10b981;
}

.standards-banner {
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
  padding: 10px 16px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.banner-kicker {
  font-size: 12px;
  font-weight: bold;
  color: #1e40af;
  white-space: nowrap;
}

.standards-banner p {
  margin: 0;
  font-size: 12px;
  color: #1e3a8a;
  line-height: 1.5;
}

.step-nav {
  display: flex;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow-x: auto;
}

.step-item {
  flex: 1;
  min-width: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 16px;
  background: transparent;
  border: 0;
  border-right: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.step-item:last-child {
  border-right: 0;
}

.step-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #64748b;
  font-size: 11px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-name {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.step-item.active {
  background: #eff6ff;
}

.step-item.active .step-num {
  background: #0284c7;
  color: #ffffff;
}

.step-item.active .step-name {
  color: #0369a1;
  font-weight: 700;
}

.step-item.done .step-num {
  background: #10b981;
  color: #ffffff;
}

.step-panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
}

.panel-intro {
  margin-bottom: 20px;
}

.step-tag {
  font-size: 11px;
  font-family: ui-monospace, monospace;
  font-weight: 700;
  color: #0284c7;
  display: block;
  margin-bottom: 4px;
}

.panel-intro h3 {
  margin: 0 0 10px;
  font-size: 20px;
  color: #0f172a;
}

.intro-desc {
  margin: 0;
  font-size: 13px;
  color: #475569;
  line-height: 1.6;
}

.driving-card {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 14px 18px;
  margin-top: 10px;
}

.q-kicker {
  font-size: 12px;
  font-weight: bold;
  color: #166534;
  display: block;
  margin-bottom: 4px;
}

.driving-text {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #14532d;
  line-height: 1.6;
}

.form-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.form-block label strong {
  display: block;
  font-size: 14px;
  color: #1e293b;
}

.form-block label small {
  display: block;
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.form-block textarea,
.form-block input[type="text"] {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 12px;
  font-size: 13px;
  line-height: 1.6;
  font-family: inherit;
  color: #1e293b;
  background: #f8fafc;
}

.form-block.highlight-block {
  background: #fefce8;
  border: 1px solid #fef08a;
  border-radius: 8px;
  padding: 16px;
}

.variables-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.var-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.var-field label strong {
  font-size: 13px;
  color: #1e293b;
}

.tag-input-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.controlled-chip {
  background: #e0f2fe;
  color: #0369a1;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.controlled-chip button {
  background: transparent;
  border: 0;
  color: #0369a1;
  cursor: pointer;
  font-weight: bold;
}

.add-chip-row {
  display: flex;
  gap: 8px;
}

.add-chip-row input {
  flex: 1;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
}

.add-chip-row button {
  background: #1e293b;
  color: #ffffff;
  border: 0;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.comparison-contrast-card {
  display: grid;
  grid-template-columns: 1fr auto 1.4fr;
  align-items: center;
  gap: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
}

.contrast-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.col-badge {
  font-size: 11px;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 4px;
  align-self: flex-start;
}

.contrast-col.before .col-badge {
  background: #fef3c7;
  color: #b45309;
}

.contrast-col.after .col-badge {
  background: #dcfce7;
  color: #15803d;
}

.contrast-col.before p {
  margin: 0;
  font-size: 13px;
  color: #475569;
  line-height: 1.6;
}

.contrast-col.after textarea {
  border: 1px solid #86efac;
  border-radius: 8px;
  padding: 10px;
  font-size: 13px;
  line-height: 1.6;
  background: #ffffff;
}

.contrast-divider {
  font-size: 24px;
  color: #94a3b8;
}

.step-footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  border-top: 1px solid #f1f5f9;
  padding-top: 16px;
}

.btn-prev {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 8px 18px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-next {
  background: #0284c7;
  border: 0;
  color: #ffffff;
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.report-actions-bottom {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
  border-top: 1px solid #e2e8f0;
  padding-top: 20px;
}

.btn-big-export,
.btn-big-print {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #1e293b;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-big-submit {
  flex: 1;
  min-width: 240px;
  background: #0284c7;
  border: 0;
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.btn-big-submit.is-submitted {
  background: #10b981;
}

.consent-checkbox-row {
  margin: 16px 0 10px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  padding: 12px 16px;
  border-radius: 8px;
}

.consent-lbl {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #334155;
  cursor: pointer;
}

.submit-result-banner {
  padding: 12px 18px;
  border-radius: 8px;
  margin-top: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.submit-result-banner p {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
}

.submit-result-banner.success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #15803d;
}

.submit-result-banner.warning {
  background: #fefce8;
  border: 1px solid #fef08a;
  color: #a16207;
}

.submit-result-banner.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
}

.btn-goto-login {
  background: #ca8a04;
  color: #ffffff;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: bold;
  text-decoration: none;
}

@media (max-width: 800px) {
  .comparison-contrast-card {
    grid-template-columns: 1fr;
  }
  .contrast-divider {
    text-align: center;
  }
}
</style>
