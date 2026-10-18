<template>
  <div class="decision-sim" role="region" aria-label="人地关系多目标权衡决策实验台">
    <div class="sim-header">
      <div class="sim-title-group">
        <span class="sim-badge">人地协调观 · 区域动态区位模型</span>
        <h3>临江特大重化工业基地区位重塑与生态红线决策台</h3>
      </div>
      <div class="sim-actions-top">
        <button
          v-for="p in plans"
          :key="p.id"
          type="button"
          class="btn-plan-select"
          :class="{ active: selectedPlanId === p.id }"
          @click="selectedPlanId = p.id"
        >
          {{ p.shortName }}
        </button>
      </div>
    </div>

    <div class="sim-grid">
      <!-- 决策权重设置与方案对比 -->
      <div class="sim-controls">
        <div class="weight-sliders-group">
          <h5>⚖️ 设定你作为决策者的优先考量权重：</h5>
          <div
            v-for="w in weightsList"
            :key="w.key"
            class="weight-row"
          >
            <div class="weight-header">
              <span class="w-name">{{ w.label }}</span>
              <span class="w-val"><strong>{{ weights[w.key] }}</strong>%</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              v-model.number="weights[w.key]"
              :aria-label="w.label"
              @input="normalizeWeights(w.key)"
            />
          </div>
        </div>

        <!-- 当前选中方案深度解析 -->
        <div class="active-plan-detail">
          <div class="plan-badge-row">
            <span class="plan-tag">当前推演方案</span>
            <strong>{{ currentPlan.name }}</strong>
          </div>
          <p class="plan-desc">{{ currentPlan.desc }}</p>

          <div class="tradeoff-analysis-box">
            <h6>💡 核心得失与代价 (Trade-offs)：</h6>
            <p>{{ currentPlan.tradeOffs }}</p>
          </div>
        </div>

        <div class="sim-capture-panel">
          <p class="capture-hint">
            依据当前多目标权衡得失，说明“为什么选择此方案、牺牲了什么、如何补偿”，点击捕获证据卡：
          </p>
          <button type="button" class="btn-capture" @click="captureEvidence">
            📸 捕获本方案权衡矩阵为【科学证据卡】
          </button>
        </div>
      </div>

      <!-- 可视化雷达图与利益相关方视点 -->
      <div class="sim-stage">
        <!-- 多目标权衡雷达图 SVG -->
        <div class="radar-card">
          <div class="radar-head">
            <h5>方案四维得失综合雷达图 (Multi-Objective Radar)</h5>
            <div class="radar-legend">
              <span class="leg-item"><span class="color-dot c1"></span>就地升级</span>
              <span class="leg-item"><span class="color-dot c2"></span>沿海搬迁</span>
              <span class="leg-item"><span class="color-dot c3"></span>梯度置换</span>
            </div>
          </div>

          <svg viewBox="0 0 420 220" class="radar-svg" aria-label="多目标权衡雷达对比图">
            <!-- 雷达同心多边形背景 -->
            <polygon points="210,25 340,110 210,195 80,110" fill="none" stroke="#334155" stroke-dasharray="2,2" />
            <polygon points="210,55 295,110 210,165 125,110" fill="none" stroke="#334155" />
            <line x1="210" y1="20" x2="210" y2="200" stroke="#475569" stroke-width="1" />
            <line x1="70" y1="110" x2="350" y2="110" stroke="#475569" stroke-width="1" />

            <!-- 轴标签 -->
            <text x="210" y="16" fill="#94a3b8" font-size="11" text-anchor="middle">生态安全 (饮用水红线)</text>
            <text x="360" y="114" fill="#94a3b8" font-size="11">财政税收就业</text>
            <text x="210" y="214" fill="#94a3b8" font-size="11" text-anchor="middle">社会稳定 (免于搬迁)</text>
            <text x="10" y="114" fill="#94a3b8" font-size="11">投资可控 (少花钱)</text>

            <!-- 方案一多边形 -->
            <polygon
              :points="planPoints['plan-onsite-green']"
              fill="#22c55e"
              fill-opacity="0.25"
              stroke="#22c55e"
              stroke-width="1.8"
            />

            <!-- 方案二多边形 -->
            <polygon
              :points="planPoints['plan-coastal-relocation']"
              fill="#38bdf8"
              fill-opacity="0.35"
              stroke="#38bdf8"
              stroke-width="2.5"
            />

            <!-- 方案三多边形 -->
            <polygon
              :points="planPoints['plan-gradual-transition']"
              fill="#f59e0b"
              fill-opacity="0.25"
              stroke="#f59e0b"
              stroke-width="1.8"
            />
          </svg>

          <!-- 加权综合效用得分卡片 -->
          <div class="utility-scores-bar">
            <div
              v-for="p in plans"
              :key="p.id"
              class="utility-item"
              :class="{ highlighted: selectedPlanId === p.id }"
            >
              <span class="u-name">{{ p.shortName }}</span>
              <strong class="u-score">{{ getCompositeScore(p) }} 分</strong>
            </div>
          </div>
        </div>

        <!-- 利益相关方真实诉求档案 (Stakeholder Perspectives) -->
        <div class="stakeholders-accordion">
          <h5>👥 利益相关方冲突证据档案（点击阅读）：</h5>
          <div class="stakeholder-cards">
            <div
              v-for="sh in stakeholders"
              :key="sh.role"
              class="sh-card"
            >
              <div class="sh-top">
                <span class="sh-avatar">{{ sh.avatar }}</span>
                <strong>{{ sh.role }}</strong>
              </div>
              <p class="sh-quote">“{{ sh.statement }}”</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

const emit = defineEmits(['capture'])

const selectedPlanId = ref('plan-coastal-relocation')

const weights = reactive({
  eco: 35,
  tax: 25,
  cost: 20,
  social: 20
})

const weightsList = [
  { key: 'eco', label: '生态安全权重 (饮用水源红线)' },
  { key: 'tax', label: '经济效益权重 (财政产值就业)' },
  { key: 'cost', label: '投资可控权重 (财政开支预算)' },
  { key: 'social', label: '社会民生权重 (职工安置平稳)' },
]

function normalizeWeights(changedKey) {
  // 简易归一化或保持滑块平稳
}

const plans = [
  {
    id: 'plan-onsite-green',
    shortName: '方案一：就地绿色升级',
    name: '方案一：原址超低排放升级与水循环零直排',
    desc: '原址不动，投资120亿元对高炉与排污全流程深度脱硫脱硝，压减20%粗钢落后产能，转产特种高端合金，老产线局部转为工业遗址博览。',
    ecoScore: 68,
    taxScore: 82,
    costScore: 85, // 120亿投资较少
    socialScore: 90, // 工人无需搬迁
    tradeOffs: '保全了本地数万就业与既有供应链，投资少见效快；但紧邻长江核心取水口，环境容错率低，无法彻底消除危险化学品泄漏隐患。'
  },
  {
    id: 'plan-coastal-relocation',
    shortName: '方案二：沿海港区整体搬迁',
    name: '方案二：退城入园，搬迁至200公里外沿海深水港区',
    desc: '彻底关停临江老厂，搬迁至沿海30万吨级深水港散货码头，实现大型海运矿船直靠。老厂区土地收储置换为滨水总部经济区。',
    ecoScore: 95, // 彻底消除江河水源威胁
    taxScore: 92, // 临港海运每吨降本35元，国际竞争力强
    costScore: 35, // 搬迁总投资超450亿元
    socialScore: 45, // 数万家庭涉及异地安家与子女就学
    tradeOffs: '彻底化解内河水源环境风险，临港大进大出降本增效；但短期内基建投资巨大，老员工异地搬迁安抚阻力大。'
  },
  {
    id: 'plan-gradual-transition',
    shortName: '方案三：梯度分步置换',
    name: '方案三：冶炼端外迁置换，本部保留高端研发中心',
    desc: '高污染冶炼工序全部外迁置换，本部保留高附加值研发中心、冷轧板与汽车轻量化新材料深加工基地。',
    ecoScore: 86,
    taxScore: 75,
    costScore: 65,
    socialScore: 70,
    tradeOffs: '兼顾技术升级与水源保护，产业层级跃迁；但对本地财政贡献与中低技能工人吸纳能力短期内有明显缺口。'
  }
]

const currentPlan = computed(() => {
  return plans.find(p => p.id === selectedPlanId.value) || plans[0]
})

function getCompositeScore(plan) {
  const score = (
    plan.ecoScore * (weights.eco / 100) +
    plan.taxScore * (weights.tax / 100) +
    plan.costScore * (weights.cost / 100) +
    plan.socialScore * (weights.social / 100)
  )
  return Math.round(score * 10) / 10
}

// 雷达图多边形点位映射
const planPoints = computed(() => {
  const result = {}
  for (const p of plans) {
    // 4个轴映射：上(生态), 右(税收), 下(社会), 左(成本)
    const top = 110 - (p.ecoScore / 100) * 85
    const right = 210 + (p.taxScore / 100) * 130
    const bottom = 110 + (p.socialScore / 100) * 85
    const left = 210 - (p.costScore / 100) * 130
    result[p.id] = `210,${top} ${right},110 210,${bottom} ${left},110`
  }
  return result
})

const stakeholders = [
  {
    avatar: '🌊',
    role: '市生态环境局 / 饮用水源保护区管理处',
    statement: '长江是千万市民的生命之水，取水口上游绝对不能有任何重大环境风险源。我们强烈支持沿海搬迁，守住生态红线是一票否决原则！'
  },
  {
    avatar: '📊',
    role: '市财政局与经济信息化委员会',
    statement: '钢铁集团每年上缴地方税收超30亿元，带动数百家机械下游小微企业。若盲目一关了之或耗资过度，城市财政与产业安全将面临崩盘。'
  },
  {
    avatar: '👷',
    role: '重钢职工代表大会与工会主席',
    statement: '厂里职工大多在本地安家三代，子女都在附近上学。如果搬去200公里外的海岛港口，职工异地通勤安居困难，必须有妥善补偿安置方案！'
  },
  {
    avatar: '⚓',
    role: '沿海深水港临港工业区开发管委会',
    statement: '我们拥有30万吨级深水泊位，进口铁矿石无需减载过驳，每吨直接省下35元海运中转费。搬迁至此能够实现‘前港后厂’最优空间布局。'
  }
]

function captureEvidence() {
  const p = currentPlan.value
  const evidence = {
    title: `决策推演：${p.shortName}（加权综合得分 ${getCompositeScore(p)}分）`,
    evidenceType: '多目标情境推演',
    params: {
      推选方案: p.name,
      生态安全设定: `${p.ecoScore}分`,
      经济财政设定: `${p.taxScore}分`,
      投资预算设定: `${p.costScore}分`,
      社会民生设定: `${p.socialScore}分`
    },
    observation: `【情境推演矩阵结果】在当前设定权重下，该方案综合效用得分推演为 ${getCompositeScore(p)} 分；优势指标为 ${p.ecoScore > p.costScore ? '生态水源安全' : '投资预算节约'}；主要制约代价为 ${p.socialScore < 60 ? '职工异地搬迁安抚阻力' : '内河水源潜在环境风险'}。`,
    inference: `【决策取舍论证】人地关系决策不存在让所有四项指标都得满分的完美方案。选择该方案的核心逻辑是：${p.tradeOffs}。为了弥补所牺牲的短板，决策案必须同步配套对应的风险对冲机制。`,
    confidence: 4,
    source: '人地关系多目标权衡决策雷达矩阵（情境推演模型）',
    tag: p.shortName
  }
  emit('capture', evidence)
}
</script>

<style scoped>
.decision-sim {
  background: #0f172a;
  color: #f1f5f9;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #1e293b;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}

.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
  border-bottom: 1px solid #1e293b;
  padding-bottom: 16px;
}

.sim-badge {
  display: inline-block;
  font-size: 11px;
  color: #38bdf8;
  font-family: ui-monospace, monospace;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}

.sim-title-group h3 {
  margin: 0;
  font-size: 20px;
  color: #f8fafc;
}

.sim-actions-top {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.btn-plan-select {
  background: #1e293b;
  color: #cbd5e1;
  border: 1px solid #334155;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.btn-plan-select.active {
  background: #0284c7;
  color: #ffffff;
  border-color: #38bdf8;
}

.sim-grid {
  display: grid;
  grid-template-columns: minmax(320px, 1fr) minmax(360px, 1.3fr);
  gap: 24px;
}

.sim-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #1e293b;
  padding: 20px;
  border-radius: 10px;
}

.weight-sliders-group {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 14px;
}

.weight-sliders-group h5 {
  margin: 0 0 12px;
  font-size: 13px;
  color: #cbd5e1;
}

.weight-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}

.weight-header {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.w-name {
  color: #94a3b8;
}

.w-val strong {
  color: #38bdf8;
}

input[type="range"] {
  width: 100%;
  accent-color: #38bdf8;
  cursor: pointer;
}

.active-plan-detail {
  background: #082f49;
  border: 1px solid #0284c7;
  border-radius: 8px;
  padding: 14px;
}

.plan-badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.plan-tag {
  background: #0284c7;
  color: #ffffff;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
}

.active-plan-detail strong {
  font-size: 14px;
  color: #f8fafc;
}

.plan-desc {
  margin: 0 0 10px;
  font-size: 12px;
  color: #cbd5e1;
  line-height: 1.5;
}

.tradeoff-analysis-box {
  background: #0c4a6e;
  border-radius: 6px;
  padding: 10px;
}

.tradeoff-analysis-box h6 {
  margin: 0 0 4px;
  font-size: 11px;
  color: #7dd3fc;
}

.tradeoff-analysis-box p {
  margin: 0;
  font-size: 12px;
  color: #e0f2fe;
  line-height: 1.5;
}

.sim-capture-panel {
  margin-top: 6px;
  border-top: 1px solid #334155;
  padding-top: 12px;
}

.capture-hint {
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.5;
  margin: 0 0 10px;
}

.btn-capture {
  width: 100%;
  background: #0284c7;
  color: #ffffff;
  border: 0;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.btn-capture:hover {
  background: #0369a1;
}

.sim-stage {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.radar-card {
  background: #1e293b;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #334155;
}

.radar-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.radar-head h5 {
  margin: 0;
  font-size: 13px;
  color: #cbd5e1;
}

.radar-legend {
  display: flex;
  gap: 10px;
  font-size: 11px;
}

.leg-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #94a3b8;
}

.color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.c1 { background: #22c55e; }
.c2 { background: #38bdf8; }
.c3 { background: #f59e0b; }

.radar-svg {
  display: block;
  width: 100%;
  height: auto;
}

.utility-scores-bar {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 12px;
  border-top: 1px solid #334155;
  padding-top: 12px;
}

.utility-item {
  display: flex;
  flex-direction: column;
  background: #0f172a;
  padding: 8px 10px;
  border-radius: 6px;
  text-align: center;
}

.utility-item.highlighted {
  border: 1px solid #0284c7;
  background: #082f49;
}

.u-name {
  font-size: 11px;
  color: #94a3b8;
}

.u-score {
  font-size: 16px;
  color: #38bdf8;
  margin-top: 2px;
}

.stakeholders-accordion {
  background: #1e293b;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #334155;
}

.stakeholders-accordion h5 {
  margin: 0 0 12px;
  font-size: 13px;
  color: #cbd5e1;
}

.stakeholder-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
}

.sh-card {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 10px 12px;
}

.sh-top {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.sh-avatar {
  font-size: 16px;
}

.sh-top strong {
  font-size: 11px;
  color: #e2e8f0;
}

.sh-quote {
  margin: 0;
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.45;
  font-style: italic;
}

@media (max-width: 840px) {
  .sim-grid {
    grid-template-columns: 1fr;
  }
}
</style>
