<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const projects = [
  {
    id: 'xuzhou-land-cover',
    title: '徐州近二十年土地覆盖变化',
    field: '遥感与土地利用',
    phase: '数据核查',
    question: '建设用地和植被覆盖的变化主要发生在哪里？',
    method: '对比不同时期的土地覆盖图，选取变化明显的区域，再用同期影像抽样核查分类结果。把不确定的样点单独记录，供团队复核。',
    role: '样点核查助手',
    commitment: '每周约 2 小时 · 欢迎新手',
    task: '根据判读示例核查一批样点，记录判断依据和不确定之处。',
  },
  {
    id: 'city-heat',
    title: '城市绿地与地表温度',
    field: '城市地理',
    phase: '研究设计',
    question: '同一座城市里，不同类型的绿地周边，地表温度有什么差别？',
    method: '选取同一季节的公开卫星影像，比较公园、街道绿带和邻近建成区，并记录地表材料、观测时间等可能影响比较的因素。',
    role: '文献整理助手',
    commitment: '每周约 1–2 小时 · 欢迎新手',
    task: '整理三篇相关研究，摘录它们使用的数据、比较方法和主要限制。',
  },
]

const route = useRoute()
const project = computed(() => projects.find(item => item.id === route.params.id))
const query = ref('')
const results = computed(() => projects.filter(item =>
  [item.title, item.field, item.question, item.role].some(value => value.includes(query.value.trim()))
))
const showingForm = ref(false)
const submitted = ref(false)
const motivation = ref('')
const weeklyTime = ref('')

watch(() => route.params.id, () => {
  showingForm.value = false
  submitted.value = false
  motivation.value = ''
  weeklyTime.value = ''
})

function submitDemo() {
  if (!motivation.value.trim() || !weeklyTime.value) return
  submitted.value = true
  showingForm.value = false
  motivation.value = ''
  weeklyTime.value = ''
}
</script>

<template>
  <main class="fanxing">
    <header class="fanxing-hero">
      <router-link :to="route.params.id ? '/fanxing' : '/'" class="back">
        ← {{ route.params.id ? '返回课题大厅' : '返回首页' }}
      </router-link>
      <p class="tag">科研协作 · 示例预览</p>
      <h1>{{ project?.title || (route.params.id ? '课题未找到' : '繁星计划') }}</h1>
      <p>{{ project?.question || (route.params.id ? '返回课题大厅浏览其他示例。' : '看看大家可以研究哪些地理问题，找到你愿意参与的第一项任务。') }}</p>
    </header>

    <template v-if="project">
      <div class="detail">
        <section class="panel">
          <p class="tag">{{ project.field }} · {{ project.phase }}</p>
          <h2>研究思路</h2>
          <p>{{ project.method }}</p>
          <h2>加入后的第一项任务</h2>
          <p>{{ project.task }}</p>
        </section>
        <section class="panel">
          <h2>{{ project.role }}</h2>
          <p>{{ project.commitment }}</p>
          <p>这是示例课题。表单仅用于体验，填写内容不会发送或保存。</p>
          <p v-if="submitted" role="status">已完成演示。真实流程中，申请提交后会进入「待审核」。</p>
          <form v-else-if="showingForm" @submit.prevent="submitDemo">
            <label>想参与的原因
              <textarea v-model="motivation" placeholder="用一两句话填写模拟内容" required maxlength="300" rows="3" />
            </label>
            <label>每周可投入时间
              <select v-model="weeklyTime" required>
                <option value="" disabled>请选择</option>
                <option>1 小时以内</option>
                <option>1–2 小时</option>
                <option>2 小时以上</option>
              </select>
            </label>
            <button class="baroque-btn baroque-btn-primary" :disabled="!motivation.trim() || !weeklyTime">提交模拟申请</button>
          </form>
          <button v-else class="baroque-btn baroque-btn-primary" type="button" @click="showingForm = true">体验申请加入</button>
        </section>
      </div>
    </template>

    <section v-else-if="!route.params.id" class="catalog" aria-labelledby="fanxing-catalog">
      <h2 id="fanxing-catalog">课题大厅</h2>
      <label class="search">搜索示例课题
        <input v-model="query" type="search" placeholder="输入课题名、研究方向或招募角色" />
      </label>
      <p v-if="!results.length" role="status">没有匹配的示例课题，试试其他关键词。</p>
      <div class="cards">
        <article v-for="item in results" :key="item.id" class="panel">
          <p class="tag">{{ item.field }} · {{ item.phase }}</p>
          <h3>{{ item.title }}</h3>
          <p>{{ item.question }}</p>
          <p>{{ item.role }} · {{ item.commitment }}</p>
          <router-link :to="{ name: 'fanxing-project', params: { id: item.id } }" class="baroque-btn">查看示例课题 →</router-link>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.fanxing { width: min(1120px, calc(100% - 32px)); margin: 24px auto 56px; }
.fanxing-hero {
  padding: clamp(24px, 6vw, 70px);
  border-radius: 24px;
  color: #fff8e9;
  background: radial-gradient(ellipse at 82% 15%, #465e73, transparent 53%), #192a3b;
}
.fanxing-hero h1 { color: inherit; margin: 10px 0; font-size: clamp(32px, 6vw, 62px); }
.fanxing-hero p { max-width: 42rem; line-height: 1.7; }
.back { color: inherit; display: inline-block; margin-bottom: 28px; }
.tag { font-size: .86rem; font-weight: 650; }
.catalog, .detail { margin-top: 28px; }
.cards, .detail { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.detail { grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); align-items: start; }
.panel { padding: clamp(18px, 3vw, 28px); border: 1px solid #b5a78f; border-radius: 16px; }
.panel h2, .panel h3 { margin: 0 0 12px; }
.panel p { line-height: 1.7; }
.search { max-width: 440px; margin: 0 0 16px; }
label { display: grid; gap: 6px; margin-bottom: 14px; font-weight: 600; }
input, textarea, select { width: 100%; box-sizing: border-box; border: 1px solid #8c8272; border-radius: 8px; padding: 10px; font: inherit; background: #fff; color: #263344; }
@media (max-width: 660px) { .cards, .detail { grid-template-columns: 1fr; } }
</style>
