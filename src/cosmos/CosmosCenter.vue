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
      <small>宇宙、时空与基本物理知识中心</small>
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
      <span class="cx-eyebrow">A FIELD GUIDE TO THE UNIVERSE · 第二版</span>
      <h1>从地球出发，<br>追问时空的边界。</h1>
      <p>
        在观测与理论之间建立严谨联系。从天体距离阶梯、狭义与广义相对论时空几何，到标准模型粒子图谱与弦理论重点专题，不仅理解物理如何描绘宇宙，更辨认科学尚未回答的前沿边界。
      </p>
      <div class="cx-actions">
        <router-link class="cx-primary" to="/cosmos/chapter/strings-origins">进入弦理论专题 (D1—D11) ↗</router-link>
        <router-link to="/cosmos/chapter/particles">查阅标准模型粒子图谱 →</router-link>
        <router-link to="/cosmos/labs">动手做一次物理实验 →</router-link>
      </div>
    </div>
    <div class="cx-orbit" aria-hidden="true">
      <div></div><div></div><div></div>
      <span>SPACE<br>TIME<br>MATTER</span>
    </div>
    <footer>
      <span>01 / 观测与证据</span>
      <span>02 / 数学与自洽</span>
      <span>03 / 假设与检验边界</span>
    </footer>
  </section>

  <!-- 主布局网格 -->
  <div class="cx-layout">
    <!-- 侧边导航栏 -->
    <aside class="cx-sidebar">
      <label for="cx-search">检索知识章节</label>
      <input id="cx-search" v-model="query" type="search" placeholder="搜索：弦、红移、超对称、D膜…">

      <label for="cx-level">学习层级</label>
      <select id="cx-level" v-model="level">
        <option>全部</option>
        <option>基础</option>
        <option>进阶</option>
      </select>

      <nav aria-label="Cosmos 章节导航">
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
        <p v-if="!filtered.length" class="cx-empty-notice">没有匹配章节，请更换关键词。</p>
      </nav>

      <router-link to="/cosmology" class="cx-legacy-link">原宇宙学交互课 ↗</router-link>
    </aside>

    <!-- 中间主内容区 -->
    <main class="cx-content">
      <!-- 首页总览 -->
      <template v-if="isHome">
        <div class="cx-section-heading">
          <div>
            <span class="cx-eyebrow">KNOWLEDGE ATLAS</span>
            <h2>知识地图与探索方向</h2>
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
          <p>天文测量与距离阶梯 → 狭义相对论（光锥与同时性） → 广义相对论（弯曲时空） → 现代宇宙学（FLRW 膨胀与年龄） → 量子场论与标准模型粒子 → 弦理论专题（D1—D11 全面深化） → 理论边界与科学哲学。</p>
          <p>先理解可测量的量，再阅读抽象数学结构；每一步都追问：这项结论来自自然观测、理论推导，还是尚待检验的推测假设？</p>
          <div class="cx-link-row">
            <a href="https://science.nasa.gov/universe/" target="_blank" rel="noopener noreferrer">NASA 宇宙观测中心 ↗</a> ·
            <a href="https://home.cern/science/physics" target="_blank" rel="noopener noreferrer">CERN 欧洲核子研究中心 ↗</a> ·
            <a href="https://pdg.lbl.gov/" target="_blank" rel="noopener noreferrer">PDG 粒子物理数据组 ↗</a>
          </div>
        </section>
      </template>

      <!-- 交互实验室 -->
      <template v-else-if="isLabs">
        <span class="cx-eyebrow">INTERACTIVE LABORATORY</span>
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

        <h2>核心概念与理论解释</h2>
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

        <details class="cx-panel" open>
          <summary>关键公式与符号含义</summary>
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
        <span class="cx-eyebrow">TEACHING NOTES · 教师模式</span>
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
      <span class="cx-eyebrow">READING COMPASS</span>
      <h3>科学罗盘 · 严谨求实</h3>
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
