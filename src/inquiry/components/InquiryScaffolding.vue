<template>
  <div class="inquiry-scaffolding" role="region" aria-label="地理思维支架与助学顾问">
    <div class="scaffold-header">
      <div class="header-main">
        <span class="scaffold-kicker">PEDAGOGICAL SCAFFOLD · 思维阶梯</span>
        <h4>探究思维支架与规则式助学提示</h4>
        <p class="scaffold-subnote">引擎说明：本栏目基于地理教研预置启发规则与批判性追问支架运行，绝不替学生代写报告，不虚构实测数据。</p>
      </div>
      <span class="ai-shield-tag">🛡 规则式思维提示 · 仅启发不替写</span>
    </div>

    <!-- 经典地理关键思维追问卡片 -->
    <div class="scaffold-prompts-grid">
      <button
        v-for="p in keyPrompts"
        :key="p.id"
        type="button"
        class="prompt-btn"
        :class="{ active: activePromptId === p.id }"
        @click="selectPrompt(p)"
      >
        <span class="prompt-icon">{{ p.icon }}</span>
        <div class="prompt-text">
          <strong>{{ p.question }}</strong>
          <small>{{ p.hint }}</small>
        </div>
      </button>
    </div>

    <!-- 展开的思维引导详情 -->
    <div v-if="currentPrompt" class="prompt-detail-card" aria-live="polite">
      <div class="detail-header">
        <span class="badge">{{ currentPrompt.question }}</span>
        <button type="button" class="btn-close-detail" @click="activePromptId = null">收起</button>
      </div>
      <p class="guide-lead">{{ currentPrompt.guide }}</p>
      <div class="checklist">
        <h6>自我审查清单：</h6>
        <ul>
          <li v-for="(item, i) in currentPrompt.checkItems" :key="i">
            {{ item }}
          </li>
        </ul>
      </div>
      <div class="curriculum-pointer" v-if="currentPrompt.textbookRef">
        <span>📖 本站教材对应：</span>
        <router-link :to="currentPrompt.textbookRef.link">
          {{ currentPrompt.textbookRef.title }} ↗
        </router-link>
      </div>
    </div>

    <!-- AI 助学交互对话区 -->
    <div class="ai-assistant-box">
      <div class="box-top">
        <span class="bot-avatar">🧭</span>
        <div class="bot-info">
          <strong>地理探究助学顾问</strong>
          <span>帮助你澄清概念、审查证据链漏洞。不会替你撰写完整报告，不编造虚假数据。</span>
        </div>
      </div>

      <!-- 历史助学建议记录 -->
      <div class="advice-stream" v-if="feedbacks && feedbacks.length > 0">
        <div
          v-for="(fb, idx) in feedbacks"
          :key="idx"
          class="advice-bubble"
        >
          <div class="bubble-meta">
            <span class="user-q">问：{{ fb.prompt }}</span>
            <span class="time">{{ formatTime(fb.timestamp) }}</span>
          </div>
          <div class="bubble-body">
            <p>{{ fb.advice }}</p>
            <div v-if="fb.sourceTips && fb.sourceTips.length > 0" class="source-chips">
              <span class="source-label">相关线索：</span>
              <span v-for="tip in fb.sourceTips" :key="tip" class="tip-chip">{{ tip }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速提问标签 -->
      <div class="quick-questions">
        <span class="quick-label">常见思维卡点：</span>
        <button
          v-for="q in quickQuestions"
          :key="q"
          type="button"
          class="chip-btn"
          @click="askQuickQuestion(q)"
        >
          {{ q }}
        </button>
      </div>

      <!-- 输入框 -->
      <form class="ask-form" @submit.prevent="submitQuestion">
        <input
          v-model="inputQuery"
          type="text"
          placeholder="输入你的困惑，例如：我怎么证明海绵城市的削峰作用是真实的？"
          maxlength="200"
          :disabled="isGenerating"
          aria-label="向地理助学顾问提问"
        />
        <button type="submit" :disabled="!inputQuery.trim() || isGenerating">
          {{ isGenerating ? '思考中…' : '启发引导' }}
        </button>
      </form>
    </div>

    <!-- 教师覆盖提示 (当教师对该任务给出了特别指导) -->
    <div v-if="teacherOverrideNotice" class="teacher-override-card" aria-live="polite">
      <span class="t-badge">👩‍🏫 授课教师专属重点提示</span>
      <p>{{ teacherOverrideNotice }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { apiRequest } from '../../account/api.js'
import { accountEnabled } from '../../account/config.js'

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  feedbacks: {
    type: Array,
    default: () => []
  },
  teacherOverrideNotice: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['ask'])

const activePromptId = ref(null)
const inputQuery = ref('')
const isGenerating = ref(false)

const keyPrompts = [
  {
    id: 'how-do-you-know',
    icon: '🔍',
    question: '你如何知道？',
    hint: '检验论点是否有实测或对照实验数据支撑',
    guide: '科学探究讲求“拿证据说话”。不要仅依据“常识看起来如此”下断言。回顾你的记录：你捕获了对照组数据吗？所引用的数值是测量到的，还是自己估计的？',
    checkItems: [
      '你的论点是否有对应的【客观观察数据】卡片编号？',
      '你是否把个人日常经验（如“我家小区以前下雨就淹”）误当成了普遍规律？',
      '两组实验对比中，是否只改变了一个变量？'
    ],
    textbookRef: {
      title: '高中必修一 第三章 第二节 水循环的过程及意义',
      link: '/高中/必修第一册/第三章/第二节'
    }
  },
  {
    id: 'other-explanations',
    icon: '⚖️',
    question: '还有其他解释吗？',
    hint: '排除混淆变量与多因多果机制',
    guide: '地理现象通常是多要素综合作用的结果。当积水发生时，除了降雨大、地面硬，地表坡度、地下排水管网走向、周围外江水位高低是否也会导致相同结果？',
    checkItems: [
      '尝试列出至少两个可能导致同一现象的并列因素。',
      '是否有前置条件（例如前一天已经下过大雨，土壤已饱和）？',
      '如果反驳你的解释，最有力的论据可能是什么？'
    ],
    textbookRef: {
      title: '高中必修一 第四章 第一节 常见地貌类型及成因',
      link: '/高中/必修第一册/第四章/第一节'
    }
  },
  {
    id: 'variable-shift',
    icon: '🎛️',
    question: '改变这个变量后会怎样？',
    hint: '推导极端与边界情况下的产流表现',
    guide: '如果把降雨历时从30分钟延长到120分钟，海绵透水铺装的削峰能力还会保持不变吗？透水砖底部的碎石层会发生什么？',
    checkItems: [
      '尝试推测一个变量达到极限值（如降雨达到120mm/h特大暴雨）时系统会如何反应。',
      '思考工程设施的“设计容量极限”与“自然吸收极限”。'
    ]
  },
  {
    id: 'model-limits',
    icon: '📐',
    question: '模型不能解释什么？',
    hint: '建立科学模型的假设边界意识',
    guide: '任何课堂仿真模型都经过了简化假设。本仿真没有计算城市地下排水管网的坡度、没有考虑外河洪水顶托倒灌。不要把模型推导直接等同于工程验收定论。',
    checkItems: [
      '指出至少一个本仿真忽略的真实世界地理要素。',
      '为什么不能只依靠仿真结果直接指导实际城市施工？'
    ]
  }
]

const currentPrompt = computed(() => {
  return keyPrompts.find(p => p.id === activePromptId.value)
})

const quickQuestions = computed(() => {
  if (props.task.id === 'urban-flood') {
    return [
      '海绵城市在什么情况下会失去削峰作用？',
      '怎样证明水泥路面汇流时间明显短于草地？',
      '地下管网和透水铺装分别解决什么问题？'
    ]
  }
  if (props.task.id === 'landscape-variation') {
    return [
      '如何证明冬季鄱阳湖长草是自然节律而非湖泊消亡？',
      '单张卫星遥感影像为什么不能作为科学定论？',
      '真彩色影像上的绿色一定代表森林吗？'
    ]
  }
  return [
    '为什么重工业搬迁没有绝对的标准答案？',
    '就地绿色改造与沿海搬迁各自付出了什么代价？',
    '如何协调生态红线与本地职工家庭生计？'
  ]
})

function selectPrompt(p) {
  activePromptId.value = activePromptId.value === p.id ? null : p.id
}

function askQuickQuestion(q) {
  inputQuery.value = q
  submitQuestion()
}

async function submitQuestion() {
  const q = inputQuery.value.trim()
  if (!q) return

  isGenerating.value = true
  const queryToEmit = q
  inputQuery.value = ''

  // 1. 若接通了服务端账号与课程助手，尝试调用服务端受控问答接口
  if (accountEnabled) {
    try {
      const serverRes = await Promise.race([
        apiRequest('/api/assistant/ask', {
          method: 'POST',
          body: JSON.stringify({ question: `[地理探究思维支架提问·${props.task.shortTitle}] ${queryToEmit}` })
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
      ])

      if (serverRes?.answer) {
        isGenerating.value = false
        emit('ask', {
          prompt: queryToEmit,
          advice: serverRes.answer,
          sourceTips: serverRes.relatedSections?.map(s => s.title) || ['课程助手教学上下文'],
          engine: '服务端课程助手',
          timestamp: new Date().toISOString()
        })
        return
      }
    } catch {
      // 超时或未启用服务端 AI，平滑降级至规则式思维提示
    }
  }

  // 2. 本地规则式启发提示兜底
  setTimeout(() => {
    isGenerating.value = false
    const response = generateScaffoldAdvice(props.task.id, queryToEmit)
    emit('ask', {
      prompt: queryToEmit,
      advice: response.advice,
      sourceTips: response.sourceTips,
      engine: '规则式思维提示',
      timestamp: new Date().toISOString()
    })
  }, 350)
}

function generateScaffoldAdvice(taskId, query) {
  if (taskId === 'urban-flood') {
    if (query.includes('失去') || query.includes('失效') || query.includes('极端')) {
      return {
        advice: '【思维引导】海绵城市的“下渗调蓄”依赖孔隙容积。当降雨历时极长（如超过60–90分钟）或者降雨强度极大（超过透水系数极限）时，碎石储水层会达到“饱和状态”。饱和后，透水铺装的下渗速率将骤降至下层天然土层的极低渗透率，此时地表将再次产生超渗产流。在你的实验中，不妨尝试把降雨历时拉大到120分钟，观察削峰率是否下降，并把这一局限写入你的反思！',
        sourceTips: ['透水砖孔隙饱和临界点', '下渗曲线 Horton 模型', '教材《水循环》降水-产流环节']
      }
    }
    if (query.includes('汇流时间') || query.includes('短于')) {
      return {
        advice: '【方法提示】要证明汇流时间差异，请先保持降雨强度（例如均为 50 mm/h）与坡度（2°）完全相同。运行“传统水泥路面”，记录产流历时（约 8 分钟）；再切换为“海绵铺装”，记录产流历时（约 24 分钟）。将两组产流历时的差异生成两张证据卡，这就是无可辩驳的对照证据！',
        sourceTips: ['单变量严格对照', '产流历时对比卡', '糙率与水动力减速']
      }
    }
    return {
      advice: `【概念澄清】关于“${query}”，请注意区分“源头滞纳”（海绵城市、雨水花园在降雨就地吸收）与“末端排放”（地下管网、排涝泵站将水抽走）。海绵城市不是取代管网，而是通过源头削峰，防止暴雨瞬时涌入管网造成溢流。你可以先看看教材必修一《水循环》关于地表径流与地下径流的分配机制。`,
      sourceTips: ['必修一第三章第二节', '源头削峰 vs 末端排涝', '水敏性城市设计']
    }
  }

  if (taskId === 'landscape-variation') {
    return {
      advice: '【判读提示】辨析季节性变化的关键在于“时间序列证据”。单看 1 月份枯水期影像，确实只看到浅滩长满青草；但只要比对 7 月份梅雨汛期影像，就会发现同一经纬度是一片汪洋。这证明湖水随季风降雨丰枯而周期性涨落，属于浅碟形过水性湖泊的典型特征。',
      sourceTips: ['星子水文站高程表', '梅雨与伏旱副高进退', 'MODIS 多时相对比']
    }
  }

  return {
    advice: '【决策支架】在权衡人地决策时，切忌得出“只要环保其他都不管”或“为了赚钱污染无所谓”的极端结论。试着用“代价表”梳理：若选择沿海搬迁，获得了生态红线绝对安全与大型海运港口优势，但付出了数百亿搬迁投资与数万职工安迁成本；请思考如何在方案中增加“过渡期补偿基金”来对冲这一代价。',
    sourceTips: ['必修二工业区位因素', '曹妃甸搬迁历史借鉴', '比较优势与环境外部性']
  }
}

function formatTime(isoStr) {
  if (!isoStr) return ''
  try {
    const d = new Date(isoStr)
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  } catch {
    return ''
  }
}
</script>

<style scoped>
.inquiry-scaffolding {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.scaffold-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 12px;
}

.scaffold-kicker {
  display: block;
  font-size: 11px;
  font-family: ui-monospace, monospace;
  font-weight: 700;
  color: #0284c7;
  letter-spacing: 0.08em;
}

.header-main h4 {
  margin: 2px 0 0;
  font-size: 16px;
  color: #0f172a;
}

.ai-shield-tag {
  font-size: 11px;
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 600;
}

.scaffold-prompts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.prompt-btn {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.prompt-btn:hover {
  background: #f0fdf4;
  border-color: #86efac;
}

.prompt-btn.active {
  background: #eff6ff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.prompt-icon {
  font-size: 20px;
}

.prompt-text strong {
  display: block;
  font-size: 13px;
  color: #1e293b;
  margin-bottom: 2px;
}

.prompt-text small {
  display: block;
  font-size: 11px;
  color: #64748b;
  line-height: 1.4;
}

.prompt-detail-card {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 18px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.detail-header .badge {
  background: #2563eb;
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 4px;
}

.btn-close-detail {
  background: transparent;
  border: 0;
  color: #64748b;
  font-size: 12px;
  cursor: pointer;
}

.guide-lead {
  font-size: 13px;
  color: #1e3a8a;
  line-height: 1.6;
  margin: 0 0 12px;
}

.checklist h6 {
  margin: 0 0 6px;
  font-size: 12px;
  color: #1e40af;
}

.checklist ul {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: #334155;
  line-height: 1.6;
}

.curriculum-pointer {
  margin-top: 12px;
  font-size: 12px;
  color: #475569;
}

.curriculum-pointer a {
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
}

.ai-assistant-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
}

.box-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.bot-avatar {
  font-size: 24px;
}

.bot-info strong {
  display: block;
  font-size: 13px;
  color: #0f172a;
}

.bot-info span {
  font-size: 11px;
  color: #64748b;
}

.advice-stream {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 14px;
  max-height: 280px;
  overflow-y: auto;
}

.advice-bubble {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 12px;
  border-left: 3px solid #0284c7;
}

.bubble-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.user-q {
  font-size: 12px;
  font-weight: bold;
  color: #0369a1;
}

.time {
  font-size: 10px;
  color: #94a3b8;
  font-family: ui-monospace, monospace;
}

.bubble-body p {
  margin: 0;
  font-size: 12px;
  color: #334155;
  line-height: 1.6;
}

.source-chips {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px dashed #e2e8f0;
}

.source-label {
  font-size: 11px;
  color: #64748b;
}

.tip-chip {
  background: #f1f5f9;
  color: #475569;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
}

.quick-questions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.quick-label {
  font-size: 11px;
  color: #64748b;
}

.chip-btn {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.chip-btn:hover {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #1d4ed8;
}

.ask-form {
  display: flex;
  gap: 8px;
}

.ask-form input {
  flex: 1;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 13px;
}

.ask-form button {
  background: #0284c7;
  color: #ffffff;
  border: 0;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.ask-form button:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.teacher-override-card {
  margin-top: 14px;
  background: #fefce8;
  border: 1px solid #fef08a;
  border-left: 4px solid #ca8a04;
  padding: 12px 16px;
  border-radius: 6px;
}

.t-badge {
  font-size: 11px;
  font-weight: bold;
  color: #854d0e;
  display: block;
  margin-bottom: 4px;
}

.teacher-override-card p {
  margin: 0;
  font-size: 12px;
  color: #713f12;
  line-height: 1.5;
}
</style>
