<template>
  <section class="labs">
    <header>
      <p class="eyebrow">GEOGRAPHY EVIDENCE LABS</p>
      <h1>从真实地球，到地理模型</h1>
      <p>先观察真实影像与高程，再用模型解释过程，最后回到教材与练习检验自己的解释。</p>
      <nav class="jump-links" aria-label="本页导航"><router-link :to="{ path: '/geo-labs', hash: '#journeys' }">按问题探究</router-link><router-link :to="{ path: '/geo-labs', hash: '#data-labs' }">真实数据实验</router-link><router-link :to="{ path: '/geo-labs', hash: '#model-index' }">全部模型</router-link></nav>
    </header>
    <section id="journeys" class="section" aria-labelledby="journeys-title">
      <h2 id="journeys-title">带着一个问题走完探究</h2>
      <div class="journeys">
        <article v-for="journey in journeys" :key="journey.title" class="journey">
          <span>{{ journey.number }} / 探究路径</span><h3>{{ journey.title }}</h3><p>{{ journey.question }}</p>
          <ol>
            <li><small>观察证据</small><router-link :to="journey.lab.to">{{ journey.lab.label }} →</router-link></li>
            <li><small>解释过程</small><div><router-link v-for="model in journey.models" :key="model.id" :to="modelRoute(model)">{{ model.name }} →</router-link></div></li>
            <li><small>检验解释</small><router-link :to="journey.finish.to">{{ journey.finish.label }} →</router-link></li>
          </ol>
        </article>
      </div>
    </section>
    <section id="data-labs" class="section" aria-labelledby="data-title">
    <h2 id="data-title">真实数据实验</h2>
    <div class="cards">
      <router-link to="/geo-labs/satellite" class="card"><span>01 · NASA GIBS</span><h2>卫星影像对比</h2><p>同一地点、两个日期，滑动比较云、地表与积雪的可见变化。</p><strong>开始观察 →</strong></router-link>
      <router-link to="/geo-labs/terrain" class="card"><span>02 · COPERNICUS DEM</span><h2>真实三维地形</h2><p>旋转珠峰附近的真实高程，沿纬线读一条地形剖面。</p><strong>查看地形 →</strong></router-link>
      <router-link to="/geo-labs/ai" class="card"><span>03 · PRITHVI EO 2.0</span><h2>遥感 AI 实验</h2><p>前往官方演示运行开源遥感模型，辨别观测与模型推断。</p><strong>进入实验 →</strong></router-link>
    </div>
    </section>
    <section id="model-index" class="section" aria-labelledby="models-title">
      <h2 id="models-title">全部 {{ experiments.length }} 个实验与模型</h2>
      <p class="index-intro">按主题查找站内已有内容，包含交互模型与动手教程。每个实验页还提供关联教材与相关实验。</p>
      <div class="model-groups">
        <section v-for="group in groups" :key="group.id" class="model-group" :aria-labelledby="`group-${group.id}`">
          <div class="group-heading"><h3 :id="`group-${group.id}`">{{ group.label }}</h3><span>{{ group.models.length }} 个</span></div>
          <div class="model-links">
            <router-link v-for="model in group.models" :key="model.id" :to="modelRoute(model)" class="model-link">
              <strong>{{ model.name }}</strong><small>{{ model.kind === '3d' ? '交互模型' : '动手教程' }}</small>
            </router-link>
          </div>
        </section>
      </div>
      <div class="more-links"><router-link to="/experiments">按教材章节找模型 →</router-link><router-link to="/inquiry">去地理探究任务 →</router-link></div>
    </section>
  </section>
</template>
<script setup>
import { listExperiments, getExperiment } from '../experiments/catalog.js'

const experiments = listExperiments()
const groups = [
  ['systems', '地球与人地系统'], ['meteorology', '大气与气候'],
  ['hydrology', '水循环与流水'], ['geology', '地质与地貌'],
  ['astronomy', '地球运动与天体'],
].map(([id, label]) => ({ id, label, models: experiments.filter(model => model.category === id) }))
const modelRoute = model => `/experiments/${model.category}/${model.id}`
const model = id => getExperiment(id)
const journeys = [
  { number: '01', title: '山地为什么这样起伏？', question: '从真实山脊、谷地与高程变化出发，辨别构造抬升和流水塑形能解释什么。',
    lab: { to: '/geo-labs/terrain', label: '珠峰三维高程与剖面' },
    models: [model('fault-model'), model('stream-table'), model('landform-sandbox')],
    finish: { to: '/inquiry', label: '地理探究任务' } },
  { number: '02', title: '影像中的变化从哪里来？', question: '比较同一地点两天的影像，再用大气与水循环模型提出可检验的解释。',
    lab: { to: '/geo-labs/satellite', label: '卫星影像滑动对比' },
    models: [model('atmosphere-system'), model('water-cycle-3d'), model('thermal-circulation')],
    finish: { to: '/practice', label: '地理互动练习' } },
  { number: '03', title: 'AI 补出的影像可信吗？', question: '辨别原始观测与模型补全，结合空间表达讨论证据还缺哪一环。',
    lab: { to: '/geo-labs/ai', label: 'Prithvi 遥感 AI 实验' },
    models: [model('earth-system'), model('map-projection'), model('human-environment')],
    finish: { to: '/inquiry', label: '证据与推断练习' } },
]
</script>
<style scoped>
.labs{max-width:1180px;margin:0 auto;padding:64px 24px 120px;color:#15273b}.labs header{max-width:850px}.eyebrow{font-size:12px;letter-spacing:.18em;font-weight:800;color:#3f8195}.labs h1{font-size:clamp(36px,5vw,62px);line-height:1.1;margin:16px 0}.labs header p{line-height:1.8;color:#536679}.jump-links,.more-links{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}.jump-links a,.more-links a{padding:10px 15px;border-radius:8px;background:#e8f2f2;color:#195d6e;text-decoration:none;font-weight:700}.section{margin-top:82px;scroll-margin-top:90px}.section>h2{font-size:clamp(27px,3.5vw,42px);margin:0 0 25px}.journeys,.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.journey{padding:26px;border-radius:18px;background:#133e4c;color:white}.journey>span{color:#9fded5;font-size:12px;font-weight:800;letter-spacing:.13em}.journey h3{font-size:25px;line-height:1.25;margin:22px 0 10px}.journey>p{color:#d2e5e7;line-height:1.7;min-height:90px}.journey ol{list-style:none;padding:0;margin:24px 0 0;border-top:1px solid #ffffff45}.journey li{display:grid;gap:7px;padding:14px 0;border-bottom:1px solid #ffffff35}.journey small{font-size:12px;color:#9fded5;font-weight:800}.journey a{display:inline-block;margin:0 12px 6px 0;color:white;line-height:1.5;text-underline-offset:3px}.card{display:flex;flex-direction:column;min-height:280px;padding:28px;border:1px solid #d6e1e5;border-radius:18px;background:linear-gradient(145deg,#f9fcfb,#e8f2f2);text-decoration:none;color:inherit;transition:transform .2s,box-shadow .2s}.card:hover,.model-link:hover{transform:translateY(-3px);box-shadow:0 12px 24px #14354b1b}.card span{font-size:12px;font-weight:800;letter-spacing:.12em;color:#4b8498}.card h2{font-size:27px;margin:28px 0 12px}.card p{line-height:1.8;color:#536679}.card strong{margin-top:auto;color:#1b6b78}.index-intro{color:#536679;line-height:1.8;margin-bottom:25px}.model-groups{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}.model-group{padding:24px;border:1px solid #dce6e8;border-radius:15px;background:#fff}.group-heading{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px}.group-heading h3{margin:0;font-size:22px}.group-heading span{font-size:13px;color:#657987}.model-links{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.model-link{display:flex;flex-direction:column;justify-content:space-between;gap:5px;min-height:74px;padding:12px;background:#f0f6f5;border-radius:8px;color:#174c59;text-decoration:none;transition:transform .2s,box-shadow .2s}.model-link small{color:#6b7f82}@media(max-width:900px){.journeys,.cards,.model-groups{grid-template-columns:1fr}.journey>p{min-height:0}}@media(max-width:520px){.labs{padding:38px 18px 80px}.model-links{grid-template-columns:1fr}.journey,.card,.model-group{padding:20px}.section{margin-top:65px}}
</style>
