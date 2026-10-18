<template>
  <div class="demo-walkthrough" role="region" aria-label="地理创新探究发布会演示向导">
    <div class="walkthrough-bar">
      <div class="bar-left">
        <span class="live-badge">CONFERENCE DEMO ROUTE · 5–7 分钟可重复演示链路</span>
        <h3>“城市为什么会看海”——全闭环交互演练向导</h3>
      </div>
      <div class="bar-right">
        <span class="offline-ready-tag">⚡ 全流程支持本地离线与优雅降级容灾</span>
        <button type="button" class="btn-reset-demo" @click="resetDemo">
          ⟲ 重置演示进程
        </button>
      </div>
    </div>

    <!-- 演示步骤进度指示器 -->
    <div class="demo-steps-timeline">
      <div
        v-for="s in demoSteps"
        :key="s.step"
        class="timeline-node"
        :class="{ active: currentDemoStep === s.step, done: currentDemoStep > s.step }"
        @click="currentDemoStep = s.step"
      >
        <span class="node-circle">{{ s.step }}</span>
        <div class="node-desc">
          <strong>{{ s.title }}</strong>
          <small>{{ s.time }}</small>
        </div>
      </div>
    </div>

    <!-- 演示当前环节主展区 -->
    <div class="demo-content-stage">
      <!-- 环节 1：提出猜想 -->
      <div v-if="currentDemoStep === 1" class="demo-step-pane">
        <div class="stage-cue">
          <span class="cue-num">01 / 提出初始猜想与前概念 (1.0 分钟)</span>
          <h4>学生从生活经验出发提出初始假设</h4>
          <p>观察普通暴雨积水，学生往往将问题机械归因于“下水管道不够粗”。</p>
        </div>

        <div class="demo-card-box">
          <div class="demo-field">
            <label>驱动问题：</label>
            <div class="field-val highlight">在遭遇同样强度的暴雨时，为什么现代城市路面远比天然林地农田更容易积水成涝？</div>
          </div>
          <div class="demo-field">
            <label>学生初始假说 (Version 1)：</label>
            <textarea
              v-model="demoState.initialHypothesis"
              rows="3"
              readonly
            ></textarea>
          </div>
        </div>

        <div class="cue-actions">
          <button type="button" class="btn-cue-next" @click="proceedToStep(2)">
            下一步：运行单变量对比实验 (02) ➔
          </button>
        </div>
      </div>

      <!-- 环节 2：做两组单变量对比实验并自动生成证据卡 -->
      <div v-else-if="currentDemoStep === 2" class="demo-step-pane">
        <div class="stage-cue">
          <span class="cue-num">02 / 单变量对比与证据卡生成 (2.0 分钟)</span>
          <h4>严格控制降雨量（50mm/h）与坡度（2°），仅改变地表铺装材质</h4>
          <p>系统自动记录产流历时与峰值流量，并强制要求区分【客观观察事实】与【主观因果推断】。</p>
        </div>

        <div class="demo-sim-container">
          <UrbanFloodSim @capture="onSimCapture" />
        </div>

        <div class="demo-evidence-preview">
          <h5>已采集的对照证据卡 ({{ demoState.evidenceCards.length }} / 2 条)：</h5>
          <div class="cards-duo">
            <div
              v-for="(c, i) in demoState.evidenceCards"
              :key="c.id"
              class="ev-preview-card"
            >
              <span class="badge">对照工况 {{ i + 1 }}: {{ c.tag }}</span>
              <h6>{{ c.title }}</h6>
              <p><strong>【客观观察】</strong>{{ c.observation }}</p>
              <p><strong>【因果机制】</strong>{{ c.inference }}</p>
            </div>
          </div>
        </div>

        <div class="cue-actions">
          <button
            type="button"
            class="btn-cue-next"
            :disabled="demoState.evidenceCards.length < 2"
            @click="proceedToStep(3)"
          >
            {{ demoState.evidenceCards.length < 2 ? '请在上方实验台生成 2 组对比证据卡' : '下一步：AI 助学支架指出证据漏洞 (03) ➔' }}
          </button>
        </div>
      </div>

      <!-- 环节 3：AI 助学顾问指出证据漏洞 -->
      <div v-else-if="currentDemoStep === 3" class="demo-step-pane">
        <div class="stage-cue">
          <span class="cue-num">03 / AI 助学支架交互 (1.5 分钟)</span>
          <h4>智能顾问审查证据链：指出“海绵城市饱和极限”与模型简化假设</h4>
          <p>AI 不直接写出答案，而是引导学生思考：“若遭遇特大连阴雨，透水铺装碎石层饱和后会发生什么？”</p>
        </div>

        <div class="ai-dialog-demo">
          <div class="dialog-msg user-msg">
            <span class="sender">学生求助提问：</span>
            <p>“只要全城都改造成海绵城市透水砖，是不是多大的暴雨都不会再内涝了？”</p>
          </div>
          <div class="dialog-msg ai-msg">
            <span class="sender">🧭 探究助学顾问（安全启发响应）：</span>
            <p>
              <strong>【启发反思】</strong>注意你收集的证据卡：海绵铺装确实将产流历时由8分钟延缓至26分钟。但请思考：海绵透水铺装底部的碎石储水垫层容量是有限的（通常为25–40mm）。
              如果暴雨持续120分钟以上，垫层达到100%完全饱和后，下渗能力会发生什么突变？
              此外，本物理仿真并没有计算下游外江外河超标洪水倒灌顶托。建议在你的最终结论中，指出海绵城市的“调蓄极限”与“适用边界”！
            </p>
          </div>
        </div>

        <div class="cue-actions">
          <button type="button" class="btn-cue-next" @click="proceedToStep(4)">
            下一步：学生修订结论完成报告 (04) ➔
          </button>
        </div>
      </div>

      <!-- 环节 4：学生修订结论 -->
      <div v-else-if="currentDemoStep === 4" class="demo-step-pane">
        <div class="stage-cue">
          <span class="cue-num">04 / 认知转变与成果修订 (1.0 分钟)</span>
          <h4>对比 V1 原猜想与 V2 修订结论，展现科学思维增量</h4>
        </div>

        <div class="evolution-display">
          <div class="evo-box before">
            <span class="evo-tag">探究前认知 (V1)</span>
            <p>{{ demoState.initialHypothesis }}</p>
          </div>
          <div class="evo-arrow" aria-hidden="true">➔</div>
          <div class="evo-box after">
            <span class="evo-tag">证据与支架后结论 (V2)</span>
            <p>{{ demoState.revisedConclusion }}</p>
          </div>
        </div>

        <div class="cue-actions">
          <button type="button" class="btn-cue-next" @click="proceedToStep(5)">
            下一步：进入教师工作台进行量规批阅 (05) ➔
          </button>
        </div>
      </div>

      <!-- 环节 5：教师端批改与去标识化展示 -->
      <div v-else-if="currentDemoStep === 5" class="demo-step-pane">
        <div class="stage-cue">
          <span class="cue-num">05 / 教师工作台批注与课堂展示 (1.0 分钟)</span>
          <h4>教师查阅全过程证据链，依据 7 维量规打分，并一键推屏</h4>
        </div>

        <div class="teacher-view-mock">
          <div class="review-summary">
            <h5>👨‍🏫 授课教师专业量规评定：</h5>
            <div class="scores-row">
              <span class="score-item">问题质量：4/4</span>
              <span class="score-item">变量控制：4/4</span>
              <span class="score-item">证据可靠：4/4</span>
              <span class="score-item">因果解释：3/4</span>
              <span class="score-item">反例意识：4/4</span>
              <span class="total-score">综合得分：<strong>94 分</strong></span>
            </div>
            <blockquote class="teacher-remark">
              “林同学不仅严格执行了单变量对比实验，更在助学支架启发下，准确指出了透水铺装饱和容量极限与外江顶托边界，思维深刻严密。”
            </blockquote>
          </div>
        </div>

        <div class="cue-actions">
          <button type="button" class="btn-cue-finish" @click="finishDemo">
            🎉 发布会演示链路全部走通！前往成果展示墙 ➔
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import UrbanFloodSim from './simulations/UrbanFloodSim.vue'
import {
  saveTeacherReview,
  persistStore
} from './inquiryStore.js'

const emit = defineEmits(['finish-demo'])

const currentDemoStep = ref(1)

const demoSteps = [
  { step: 1, title: '初始猜想', time: '1.0m' },
  { step: 2, title: '单变量对照', time: '2.0m' },
  { step: 3, title: 'AI 支架质证', time: '1.5m' },
  { step: 4, title: '结论修订', time: '1.0m' },
  { step: 5, title: '教师端量规', time: '1.0m' },
]

const demoState = reactive({
  initialHypothesis: '我认为城市内涝完全是因为下水管道不够粗，只要把路面修高、管道挖大，雨多大都不会积水。',
  revisedConclusion: '城市“看海”本质是地表硬化切断了“自然下渗”，大幅缩短汇流时间导致洪峰瞬时叠加。海绵城市通过“渗、滞、蓄”有效削减常态化暴雨洪峰（削峰率约50%），但不能消除所有内涝；在持续强降雨导致垫层饱和及外河顶托时，必须结合超标排涝调蓄设施。',
  evidenceCards: []
})

// 预先装载两张标准对照证据卡
function initPreloadedEvidence() {
  demoState.evidenceCards = [
    {
      id: 'demo-ev-1',
      isDemo: true,
      evidenceType: '教学模型推演',
      title: '水泥硬化路面暴雨响应（演示样例）',
      params: { 地表: '传统水泥/沥青', 降雨: '50mm/h' },
      observation: '【教学模型推演数据】产流历时约8分钟达峰；模型计算积水深度115mm；径流系数0.88。',
      inference: '硬化路面切断下渗，瞬时产流剧烈。',
      source: '城市下渗教学仿真台（情境设定参数）',
      tag: '水泥硬化'
    },
    {
      id: 'demo-ev-2',
      isDemo: true,
      evidenceType: '教学模型推演',
      title: '海绵透水铺装削峰测试（演示样例）',
      params: { 地表: '海绵透水铺装', 降雨: '50mm/h' },
      observation: '【教学模型推演数据】产流历时延缓至26分钟；洪峰流量削减48%，积水未漫出路面。',
      inference: '碎石层发挥滞纳蓄水作用。',
      source: '城市下渗教学仿真台（情境设定参数）',
      tag: '海绵改造'
    }
  ]
}

initPreloadedEvidence()

function onSimCapture(card) {
  card.isDemo = true
  demoState.evidenceCards.push(card)
}

function proceedToStep(step) {
  currentDemoStep.value = step
}

function resetDemo() {
  currentDemoStep.value = 1
  initPreloadedEvidence()
}

function finishDemo() {
  // 保存一份明确标记为演示样例的展示墙条目
  saveTeacherReview('urban-flood', {
    teacherName: '特级地理教师评委组',
    isDemo: true,
    scores: {
      questionQuality: 4,
      variableControl: 4,
      evidenceReliability: 4,
      causalExplanation: 4,
      counterExampleAwareness: 4,
      tradeOffBalance: 3,
      reflectionRevision: 4
    },
    totalWeightedScore: 94,
    feedbackComment: '【演示样例评定】完整展现从生活常识盲区到水动力学与海绵城市系统工程的科学认知跃迁。',
    isShowcased: true
  })
  persistStore()
  emit('finish-demo')
}
</script>

<style scoped>
.demo-walkthrough {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.walkthrough-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 16px;
  margin-bottom: 20px;
}

.live-badge {
  display: inline-block;
  font-size: 11px;
  font-family: ui-monospace, monospace;
  font-weight: 700;
  color: #0284c7;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}

.bar-left h3 {
  margin: 0;
  font-size: 20px;
  color: #0f172a;
}

.bar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.offline-ready-tag {
  font-size: 11px;
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
}

.btn-reset-demo {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.demo-steps-timeline {
  display: flex;
  justify-content: space-between;
  margin-bottom: 28px;
  position: relative;
  overflow-x: auto;
}

.demo-steps-timeline::before {
  content: '';
  position: absolute;
  top: 15px;
  left: 20px;
  right: 20px;
  height: 2px;
  background: #e2e8f0;
  z-index: 0;
}

.timeline-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  cursor: pointer;
  min-width: 90px;
}

.node-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: bold;
  color: #64748b;
  transition: all 0.2s;
}

.timeline-node.active .node-circle {
  border-color: #0284c7;
  background: #0284c7;
  color: #ffffff;
  box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.2);
}

.timeline-node.done .node-circle {
  border-color: #10b981;
  background: #10b981;
  color: #ffffff;
}

.node-desc {
  text-align: center;
  margin-top: 6px;
}

.node-desc strong {
  display: block;
  font-size: 12px;
  color: #334155;
}

.node-desc small {
  font-size: 10px;
  color: #94a3b8;
}

.stage-cue {
  background: #f8fafc;
  border-left: 4px solid #0284c7;
  padding: 12px 18px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.cue-num {
  font-size: 11px;
  font-family: ui-monospace, monospace;
  font-weight: bold;
  color: #0284c7;
  display: block;
  margin-bottom: 2px;
}

.stage-cue h4 {
  margin: 0 0 4px;
  font-size: 16px;
  color: #0f172a;
}

.stage-cue p {
  margin: 0;
  font-size: 12px;
  color: #475569;
}

.demo-card-box {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.demo-field label {
  font-size: 13px;
  font-weight: bold;
  color: #1e293b;
  display: block;
  margin-bottom: 4px;
}

.field-val.highlight {
  font-size: 14px;
  font-weight: 600;
  color: #0369a1;
  background: #e0f2fe;
  padding: 10px 14px;
  border-radius: 6px;
}

.demo-field textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 10px;
  font-size: 13px;
  color: #334155;
  background: #f8fafc;
  line-height: 1.6;
}

.cue-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-cue-next {
  background: #0284c7;
  color: #ffffff;
  border: 0;
  padding: 10px 22px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.btn-cue-next:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.btn-cue-finish {
  background: #10b981;
  color: #ffffff;
  border: 0;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.demo-evidence-preview {
  margin-top: 20px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
}

.demo-evidence-preview h5 {
  margin: 0 0 12px;
  font-size: 13px;
  color: #1e293b;
}

.cards-duo {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
}

.ev-preview-card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 12px;
}

.ev-preview-card .badge {
  font-size: 10px;
  background: #e0f2fe;
  color: #0369a1;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
}

.ev-preview-card h6 {
  margin: 6px 0 4px;
  font-size: 13px;
  color: #0f172a;
}

.ev-preview-card p {
  margin: 0 0 4px;
  font-size: 11px;
  color: #334155;
  line-height: 1.45;
}

.ai-dialog-demo {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
}

.dialog-msg {
  padding: 12px 16px;
  border-radius: 8px;
}

.user-msg {
  background: #ffffff;
  border: 1px solid #cbd5e1;
}

.user-msg .sender {
  font-size: 12px;
  font-weight: bold;
  color: #0369a1;
  display: block;
  margin-bottom: 4px;
}

.user-msg p {
  margin: 0;
  font-size: 13px;
  color: #334155;
}

.ai-msg {
  background: #eff6ff;
  border: 1px solid #93c5fd;
  border-left: 4px solid #2563eb;
}

.ai-msg .sender {
  font-size: 12px;
  font-weight: bold;
  color: #1d4ed8;
  display: block;
  margin-bottom: 6px;
}

.ai-msg p {
  margin: 0;
  font-size: 13px;
  color: #1e3a8a;
  line-height: 1.6;
}

.evolution-display {
  display: grid;
  grid-template-columns: 1fr auto 1.4fr;
  align-items: center;
  gap: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 20px;
}

.evo-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.evo-tag {
  font-size: 11px;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 4px;
  align-self: flex-start;
}

.evo-box.before .evo-tag {
  background: #fef3c7;
  color: #b45309;
}

.evo-box.after .evo-tag {
  background: #dcfce7;
  color: #15803d;
}

.evo-box p {
  margin: 0;
  font-size: 13px;
  color: #334155;
  line-height: 1.6;
}

.evo-arrow {
  color: #94a3b8;
  font-size: 24px;
}

.teacher-view-mock {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 20px;
}

.review-summary h5 {
  margin: 0 0 10px;
  font-size: 15px;
  color: #166534;
}

.scores-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.score-item {
  background: #ffffff;
  border: 1px solid #86efac;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  color: #166534;
}

.total-score {
  font-size: 14px;
  color: #15803d;
  margin-left: auto;
}

.total-score strong {
  font-size: 18px;
}

.teacher-remark {
  margin: 0;
  font-size: 13px;
  color: #14532d;
  line-height: 1.6;
  font-style: italic;
  border-left: 3px solid #16a34a;
  padding-left: 12px;
}

@media (max-width: 768px) {
  .evolution-display {
    grid-template-columns: 1fr;
  }
}
</style>
