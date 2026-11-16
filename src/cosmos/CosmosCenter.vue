<script setup>
import { computed, ref, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { chapters } from './content.js'
import './cosmos.css'
import { teacher, light } from './preferences.js'

const Labs = defineAsyncComponent(() => import('./CosmosLabs.vue'))
const SuperstringComparator = defineAsyncComponent(() => import('./SuperstringComparator.vue'))
const DualityNetwork = defineAsyncComponent(() => import('./DualityNetwork.vue'))
const ParticleAtlas = defineAsyncComponent(() => import('./ParticleAtlas.vue'))

const route = useRoute()
const query = ref('')
const level = ref('全部')

const chapter = computed(() => chapters.find(c => c.id === route.params.chapter))
const currentIndex = computed(() => chapters.findIndex(c => c.id === route.params.chapter))
const prevChapter = computed(() => (currentIndex.value > 0 ? chapters[currentIndex.value - 1] : null))
const nextChapter = computed(() => (currentIndex.value >= 0 && currentIndex.value < chapters.length - 1 ? chapters[currentIndex.value + 1] : null))

const isHome = computed(() => route.path === '/cosmos')
const isLabs = computed(() => route.path === '/cosmos/labs')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return chapters.filter(c => {
    const levelMatch = level.value === '全部' || c.level === level.value
    if (!levelMatch) return false
    if (!q) return true
    const haystack = `${c.title} ${c.group} ${c.goals} ${c.body.join(' ')}`.toLowerCase()
    return haystack.includes(q)
  })
})

const groups = computed(() => [...new Set(filtered.value.map(c => c.group))])
</script>

<template>
<div class="cosmos" :class="{ 'cx-light': light }">
  <!-- 顶部导航 -->
  <header class="cx-top">
    <router-link to="/cosmos" class="cx-wordmark">
      GEO <b>COSMOS</b>
      <small>宇宙与物理知识中心</small>
    </router-link>
    <div class="cx-tools">
      <router-link to="/cosmos/labs">交互实验室 ↗</router-link>
      <button type="button" @click="teacher = !teacher" :aria-pressed="teacher">
        教师模式 {{ teacher ? '开' : '关' }}
      </button>
      <button type="button" @click="light = !light">
        {{ light ? '深色' : '浅色' }}
      </button>
    </div>
  </header>

  <!-- 首页横幅区 -->
  <section v-if="isHome" class="cx-hero">
    <div>
      <span class="cx-eyebrow">宇宙、时空与基本物理探索指南</span>
      <h1>从地球出发，<br>追问时空的边界。</h1>
      <p>
        在观测现象与物理模型之间建立联系。从天体距离怎么测量、时钟为什么因运动变慢，到标准模型粒子与弦理论探索，不仅学习物理学家如何解释宇宙，更分清哪些是确凿观测、哪些是仍在检验中的假说。
      </p>
      <div class="cx-actions">
        <router-link class="cx-primary" to="/cosmos/chapter/astronomy">从零开始：天文学与距离测定 ↗</router-link>
        <router-link to="/cosmos/chapter/strings-origins">进入弦理论专题 (D1—D11) →</router-link>
        <router-link to="/cosmos/labs">动手做物理实验 →</router-link>
      </div>
    </div>
    <div class="cx-orbit" aria-hidden="true">
      <div></div><div></div><div></div>
      <span>空间<br>时间<br>物质</span>
    </div>
    <footer>
      <span>01 / 先看观测与证据</span>
      <span>02 / 再学数学与物理模型</span>
      <span>03 / 辨清假设与检验边界</span>
    </footer>
  </section>

  <!-- 主布局网格 -->
  <div class="cx-layout">
    <!-- 侧边导航栏 -->
    <aside class="cx-sidebar">
      <label for="cx-search">检索知识章节</label>
      <input id="cx-search" v-model="query" type="search" placeholder="搜索：红移、光速、超对称、D膜…">

      <label for="cx-level">学习层级</label>
      <select id="cx-level" v-model="level">
        <option>全部</option>
        <option>基础</option>
        <option>进阶</option>
      </select>

      <nav aria-label="宇宙与物理章节导航">
        <router-link to="/cosmos">知识总览 (22 篇)</router-link>
        <router-link to="/cosmos/labs">三个交互物理实验</router-link>

        <template v-for="group in groups" :key="group">
          <h3>{{ group }}</h3>
          <router-link
            v-for="item in filtered.filter(c => c.group === group)"
            :key="item.id"
            :to="`/cosmos/chapter/${item.id}`"
          >
            {{ item.title }}
          </router-link>
        </template>
        <p v-if="!filtered.length" class="cx-empty-notice">没有找到匹配章节，换个词试试看。</p>
      </nav>

      <router-link to="/cosmology" class="cx-legacy-link">原宇宙学交互课 ↗</router-link>
    </aside>

    <!-- 中间主内容区 -->
    <main class="cx-content">
      <!-- 首页总览 -->
      <template v-if="isHome">
        <!-- 初学者推荐路径卡片 -->
        <div class="cx-beginner-box">
          <div class="cx-beginner-header">
            <span class="cx-beginner-badge">🌱 初次来访推荐导读</span>
            <h3>第一次来：建议从这 4 篇生活化探索开始</h3>
          </div>
          <p class="cx-beginner-desc">
            不用先记复杂的张量和偏微分方程，先从肉眼可见的天空、时钟、星系膨胀与物质积木看起：
          </p>
          <div class="cx-beginner-grid">
            <router-link to="/cosmos/chapter/astronomy" class="cx-beginner-card">
              <span class="cx-step">01</span>
              <div>
                <strong>天空位置与宇宙测距</strong>
                <small>从两只眼睛看手指的视差，到测算恒星距离</small>
              </div>
            </router-link>
            <router-link to="/cosmos/chapter/relativity" class="cx-beginner-card">
              <span class="cx-step">02</span>
              <div>
                <strong>狭义相对论：时间属于哪只钟</strong>
                <small>为什么高速运动的时钟变慢？光速为何不变？</small>
              </div>
            </router-link>
            <router-link to="/cosmos/chapter/cosmology" class="cx-beginner-card">
              <span class="cx-step">03</span>
              <div>
                <strong>膨胀的宇宙：空间在被拉伸</strong>
                <small>遥远星系的光波长为什么被拉长？</small>
              </div>
            </router-link>
            <router-link to="/cosmos/chapter/particles" class="cx-beginner-card">
              <span class="cx-step">04</span>
              <div>
                <strong>标准模型：构成世界的粒子积木</strong>
                <small>夸克、电子与传递力场的微观使者</small>
              </div>
            </router-link>
          </div>
        </div>

        <div class="cx-section-heading">
          <div>
            <span class="cx-eyebrow">全景知识地图</span>
            <h2>全部知识章节</h2>
          </div>
          <span>{{ chapters.length }} 篇核心导读 · 3 个交互实验 · 3 大前沿探索仪器</span>
        </div>

        <p class="cx-note">
          本站严格区分成熟观测、标准理论与理论假说；弦理论 D1—D11 章节提供从微扰作用量、五种超弦构造到对偶网络的完整专业深度，杜绝民科简化。
        </p>

        <div class="cx-grid">
          <router-link
            v-for="(item, i) in filtered"
            :key="item.id"
            class="cx-card"
            :to="`/cosmos/chapter/${item.id}`"
          >
            <span class="cx-eyebrow">{{ String(i + 1).padStart(2, '0') }} / {{ item.group }}</span>
            <h3>{{ item.title }} <span>↗</span></h3>
            <p>{{ item.goals }}</p>
            <footer>
              <span>{{ item.level }}</span>
              <span class="cx-badge-status">{{ item.status }}</span>
            </footer>
          </router-link>
        </div>

        <section class="cx-panel">
          <h2>一条循序渐进的现代物理学习路径</h2>
          <p>天文测量与距离阶梯 → 狭义相对论（光锥与同时性） → 广义相对论（弯曲时空） → 现代宇宙学（红移与尺度因子） → 量子场论与标准模型粒子 → 弦理论专题（D1—D11 体系化进阶） → 理论边界与科学哲学。</p>
          <p>先看身边可观察的现象，再读数学解释；每一步都追问：这项结论来自自然观测、理论推导，还是尚待检验的推测假设？</p>
          <div class="cx-link-row">
            <a href="https://science.nasa.gov/universe/" target="_blank" rel="noopener noreferrer">NASA 宇宙观测中心 ↗</a> ·
            <a href="https://home.cern/science/physics" target="_blank" rel="noopener noreferrer">CERN 欧洲核子研究中心 ↗</a> ·
            <a href="https://pdg.lbl.gov/" target="_blank" rel="noopener noreferrer">PDG 粒子物理数据组 ↗</a>
          </div>
        </section>
      </template>

      <!-- 交互实验室 -->
      <template v-else-if="isLabs">
        <span class="cx-eyebrow">交互物理实验室</span>
        <h1>让物理公式成为可动手检验的实验室</h1>
        <p>改变速度与红移，观察光锥、同时性与膨胀距离；调节弦振动模态与边界条件，探索二维世界面演化。</p>
        <Labs />
      </template>

      <!-- 具体章节阅读页 -->
      <article v-else-if="chapter" :key="chapter.id">
        <span class="cx-eyebrow">{{ chapter.group }} / {{ chapter.level }}章节</span>
        <h1>{{ chapter.title }}</h1>
        <div class="cx-status">
          <strong>科学理论地位：</strong>{{ chapter.status }}
        </div>

        <section class="cx-panel">
          <h2>学习目标与先修知识</h2>
          <p><strong>🎯 核心目标：</strong>{{ chapter.goals }}</p>
          <p><strong>📚 前置知识：</strong>{{ chapter.prerequisites }}</p>
        </section>

        <h2>核心概念与观察解释</h2>
        <p v-for="paragraph in chapter.body" :key="paragraph">{{ paragraph }}</p>

        <!-- 针对特定专题的高能交互仪器嵌入 -->
        <section v-if="chapter.id === 'particles'" class="cx-interactive-embed">
          <ParticleAtlas />
        </section>

        <section v-if="chapter.id === 'strings-five-theories'" class="cx-interactive-embed">
          <SuperstringComparator />
        </section>

        <section v-if="chapter.id === 'strings-duality'" class="cx-interactive-embed">
          <DualityNetwork />
        </section>

        <!-- 大学进阶折叠面板（默认折叠，按需展开） -->
        <details class="cx-panel">
          <summary>大学进阶：关键公式与符号含义（推导边界）</summary>
          <div class="cx-formula">{{ chapter.formula }}</div>
          <p>{{ chapter.symbols }}</p>
          <p><b>适用条件与推导边界：</b>{{ chapter.conditions }}</p>
        </details>

        <section class="cx-panel">
          <h2>常见误区辨析</h2>
          <p>{{ chapter.misconception }}</p>
        </section>

        <router-link class="cx-primary" to="/cosmos/labs">
          进入实验室，检验本章物理模型 ↗
        </router-link>

        <section class="cx-panel">
          <h2>理解检查与思考题</h2>
          <p>{{ chapter.question }}</p>
          <details>
            <summary>查看详细解析</summary>
            <p>{{ chapter.answer }}</p>
          </details>

          <!-- 带着问题去社区讨论真实入口 -->
          <div class="cx-chapter-discuss-cta">
            <div class="cx-cta-text">
              <strong>💬 带着本章问题参与社区讨论</strong>
              <p>遇到想不通的现象，或者对公式推导有疑问？把你的观察和思考带到社区，与老师和同学们一起交流。</p>
            </div>
            <router-link
              :to="{
                path: '/community',
                query: {
                  compose: 1,
                  title: `【宇宙与物理讨论】关于《${chapter.title}》的思考`,
                  body: `在阅读《${chapter.title}》时，我对这一问题产生了思考：&#10;&#10;问题：${chapter.question}&#10;&#10;我看到/想到的解释是：……&#10;&#10;我还没完全想通的是：……`,
                  kind: 'question'
                }
              }"
              class="cx-discuss-btn"
            >
              带着这个问题去社区讨论 ↗
            </router-link>
          </div>
        </section>

        <!-- 上下一篇快速翻阅导航 -->
        <nav class="cx-chapter-pagination" aria-label="上下章节切换">
          <router-link v-if="prevChapter" :to="`/cosmos/chapter/${prevChapter.id}`" class="cx-page-prev">
            <small>← 上一章</small>
            <span>{{ prevChapter.title }}</span>
          </router-link>
          <div v-else></div>

          <router-link v-if="nextChapter" :to="`/cosmos/chapter/${nextChapter.id}`" class="cx-page-next">
            <small>下一章 →</small>
            <span>{{ nextChapter.title }}</span>
          </router-link>
        </nav>

        <section>
          <h2>权威参考资料与原始文献</h2>
          <ul>
            <li v-for="source in chapter.refs" :key="source.url">
              <a :href="source.url" target="_blank" rel="noopener noreferrer">
                {{ source.title }} ↗
              </a>
            </li>
          </ul>
        </section>
      </article>

      <!-- 找不到章节 -->
      <section v-else class="cx-panel">
        <h1>没有找到这个章节</h1>
        <p>该章节可能尚未发布或链接已调整，请从已完成的 22 篇知识章节继续探索。</p>
        <router-link to="/cosmos" class="cx-primary">返回知识总览</router-link>
      </section>

      <!-- 教师模式升级面板 -->
      <section v-if="teacher" class="cx-panel cx-teacher">
        <span class="cx-eyebrow">教师备课与研讨指南</span>
        <h2>{{ chapter ? `《${chapter.title}》教学设计` : 'Cosmos 课程体系组织建议' }}</h2>

        <template v-if="chapter?.pedagogy">
          <p><b>⏱ 5 分钟导入预测：</b>{{ chapter.pedagogy.min5 }}</p>
          <p><b>⏱ 10 分钟概念探讨：</b>{{ chapter.pedagogy.min10 }}</p>
          <p><b>⏱ 45 分钟完整课时组织：</b>{{ chapter.pedagogy.min45 }}</p>
          <p><b>💡 课堂设问与纠偏指南：</b>{{ chapter.pedagogy.prompt }}</p>
        </template>
        <template v-else>
          <p><b>5 分钟：</b>提出一个定量预测 → 调节实验参数 → 比较结果差异。</p>
          <p><b>10 分钟：</b>阅读章节目标与误区辨析 → 两人分组讨论参考系或理论边界 → 完成思考检查。</p>
          <p><b>45 分钟课时：</b>背景导入 5m、核心概念推导 10m、交互实验探究 15m、证据与批判性质疑 10m、退出检测 5m。</p>
        </template>
      </section>
    </main>

    <!-- 右侧阅读罗盘 -->
    <aside class="cx-context">
      <span class="cx-eyebrow">科学罗盘</span>
      <h3>实事求是 · 保持追问</h3>
      <p>
        观测支持 ≠ 无所不知<br>
        数学自洽 ≠ 自然存在<br>
        低维投影 ≠ 高维真身<br>
        前沿猜想 ≠ 终极真理
      </p>
      <hr>
      <h3>{{ chapter ? '本章模型边界' : '探索建议' }}</h3>
      <p>{{ chapter?.conditions || '弦理论、额外维度与多宇宙必须放在各自特定的物理假设与背景中理解。' }}</p>
      <router-link to="/cosmos/labs" class="cx-primary" style="display: block; text-align: center; margin-top: 15px;">
        打开物理实验室 →
      </router-link>
    </aside>
  </div>
</div>
</template>
