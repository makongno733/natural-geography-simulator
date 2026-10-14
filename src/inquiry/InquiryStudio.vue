<template>
  <div class="inquiry-page">
    <header class="inquiry-hero">
      <div class="wide">
        <p class="kicker">GEOGRAPHY FIELD LAB / 地理探究</p>
        <h1>从一张图，<br>走向一个问题。</h1>
        <p class="lead">地理素养从观察真实世界开始。先区分“看到了什么”和“推测了什么”，再改变条件、比较结果，尝试解释一个地理过程。</p>
        <a href="#image-inquiry" class="hero-link">开始观察 <span aria-hidden="true">↓</span></a>
        <router-link to="/geo-labs" class="hero-link data-labs-link">探索真实地球数据 <span aria-hidden="true">↗</span></router-link>
      </div>
      <span class="hero-coordinate" aria-hidden="true">OBSERVE → QUESTION → EXPLAIN</span>
    </header>

    <div>
      <section id="image-inquiry" class="image-inquiry wide" aria-labelledby="image-heading">
        <div class="section-intro">
          <p class="kicker">01 / 阅读真实影像</p>
          <h2 id="image-heading">这张图，真的能说明什么？</h2>
          <p>选择一个地方案例。先读图，再判断哪句话可以直接从影像中得到；单张照片或遥感图无法证明所有结论。</p>
        </div>

        <div class="case-tabs" role="group" aria-label="选择探究地点">
          <button v-for="(item, index) in cases" :key="item.id" type="button" :aria-pressed="activeCaseIndex === index" :class="{ active: activeCaseIndex === index }" @click="selectCase(index)">
            <span>0{{ index + 1 }}</span>{{ item.short }}
          </button>
        </div>

        <div class="case-layout">
          <figure class="case-image">
            <picture>
              <img :src="geoOptimizedAsset(activeCase.image, 960)" :alt="activeCase.alt" :width="activeCase.width" :height="activeCase.height" decoding="async">
            </picture>
            <figcaption>{{ activeCase.location }} · {{ activeCase.type }} · <a :href="activeCase.source" target="_blank" rel="noopener noreferrer">影像来源：{{ activeCase.credit }} ↗</a> · <a :href="activeCase.licenseUrl" target="_blank" rel="noopener noreferrer">{{ activeCase.license }}</a></figcaption>
          </figure>
          <div class="case-reading">
            <p class="case-label">{{ activeCase.topic }}</p>
            <h3>{{ activeCase.title }}</h3>
            <p class="case-question">{{ activeCase.question }}</p>
            <div class="judgments" role="group" :aria-label="`${activeCase.short}影像判断`">
              <button v-for="(choice, index) in activeCase.choices" :key="choice.text" type="button" :class="{ selected: selectedChoice === index }" :aria-pressed="selectedChoice === index" @click="selectedChoice = index">
                <span class="choice-mark" aria-hidden="true">{{ String.fromCharCode(65 + index) }}</span>{{ choice.text }}
              </button>
            </div>
            <div v-if="selectedChoice !== null" class="feedback" aria-live="polite">
              <strong>{{ activeCase.choices[selectedChoice].direct ? '这是可以直接观察的线索。' : '这是一种推断，还需要其他证据。' }}</strong>
              <p>{{ activeCase.choices[selectedChoice].explanation }}</p>
            </div>
            <div class="case-next">
              <p><b>继续追问</b> {{ activeCase.followup }}</p>
              <router-link :to="activeCase.modelLink">用三维模型继续探索 <span aria-hidden="true">↗</span></router-link>
            </div>
            <div class="field-journal">
              <label :for="`note-${activeCase.id}`">我的地理解释</label>
              <p>用一两句话写下你的判断、依据，以及还想寻找的证据。</p>
              <textarea :id="`note-${activeCase.id}`" v-model="notes[activeCase.id]" rows="4" maxlength="600" placeholder="我观察到……；我推测……；还需要……" @input="noteStatus = '未保存的修改'"></textarea>
              <div class="journal-actions"><button type="button" @click="saveNote">保存观察记录</button><button type="button" class="clear-note" @click="clearNote">清空本条</button><small role="status">{{ noteStatus }}</small></div>
              <small>记录只保存在此浏览器，不会上传到网站。</small>
            </div>
          </div>
        </div>
      </section>

      <section class="process-lab" aria-labelledby="process-heading">
        <div class="wide">
          <div class="section-intro">
            <p class="kicker">02 / 改变条件，比较过程</p>
            <h2 id="process-heading">同一场雨，为什么地表反应不同？</h2>
            <p>一次只调整一个条件，观察“坡面径流倾向”如何改变。这里是帮助理解关系的定性教学示意，不是实测数据、洪水预报或工程计算。</p>
          </div>
          <div class="lab-layout">
            <div class="lab-controls">
              <label v-for="control in controls" :key="control.key" class="control">
                <span class="control-heading"><strong>{{ control.label }}</strong><em>{{ control.labels[settings[control.key] - 1] }}</em></span>
                <input v-model.number="settings[control.key]" type="range" min="1" max="3" step="1" :aria-label="control.label">
                <span class="range-ends"><small>{{ control.labels[0] }}</small><small>{{ control.labels[2] }}</small></span>
              </label>
              <p class="control-hint">试试先固定降雨和坡度，只改变植被覆盖，再保存两种情境比较。</p>
              <button type="button" class="save-button" @click="saveScenario">{{ savedScenario ? '更新对比情境' : '保存当前情境用于对比' }}</button>
            </div>
            <div class="lab-display">
              <div class="slope-scene" :class="`flow-${flow.level}`" role="img" :aria-label="`教学示意：${flow.label}；${flow.reason}`">
                <div class="rain" aria-hidden="true"><span v-for="line in 3" :key="line">{{ '/ '.repeat(settings.rain + 1) }}<br></span></div>
                <div class="hill" :class="`slope-${settings.slope}`" aria-hidden="true"><span class="plants">{{ '♣ '.repeat(settings.vegetation) }}</span></div>
                <div class="stream" aria-hidden="true"></div>
                <span class="scene-note">坡面 → 河流</span>
              </div>
              <div class="flow-result" aria-live="polite">
                <span class="result-label">当前情境 · 坡面径流倾向</span>
                <strong>{{ flow.label }}</strong>
                <p>{{ flow.reason }}</p>
              </div>
              <div v-if="savedScenario" class="comparison" aria-live="polite">
                <span>已保存：{{ savedScenario.summary }}</span>
                <strong>{{ savedScenario.label }} → {{ flow.label }}</strong>
                <p>{{ comparisonExplanation }}</p>
              </div>
            </div>
          </div>
          <div class="lab-bridge">
            <div><span>继续探索</span><h3>把示意放回真实地形中</h3><p>进入现有三维水循环与地貌模型，观察水从大气到地表、再到河流的联系。</p></div>
            <div class="bridge-links"><router-link to="/experiments/systems/water-cycle-3d">打开水循环模型 ↗</router-link><router-link to="/experiments/systems/landform-sandbox">打开地貌沙盘 ↗</router-link></div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { geoOptimizedAsset } from '../textbook/geoAssets.js'
import { runoffTendency, compareScenarios } from './runoffModel.js'

const cases = [
  {
    id: 'river', short: '雅鲁藏布江', title: '河流为什么在山地间急转？', topic: '河流 · 地形', question: '下面哪句话是从这幅影像可以直接读出的线索？',
    image: 'yarlung-tsangpo-aster.jpg', width: 720, height: 480, alt: '雅鲁藏布江在藏东南山地间形成深切河谷', location: '西藏东南部', type: 'ASTER 遥感影像',
    source: 'https://science.nasa.gov/earth/earth-observatory/yarlung-tsangpo-the-everest-of-rivers-80558/', credit: 'NASA Earth Observatory', license: 'NASA 教育与信息使用', licenseUrl: 'https://www.nasa.gov/nasa-brand-center/images-and-media/',
    choices: [
      { text: '河道在山地之间出现明显弯曲。', direct: true, explanation: '河道形态可以从图中辨认。要解释弯曲形成的原因，还需要地形、岩性等资料。' },
      { text: '这条河在过去十年里侵蚀速度加快。', direct: false, explanation: '单个时点的影像不能说明变化速度，需要不同时期的可比影像或实测资料。' },
    ],
    followup: '地形高差、岩层和水流可能怎样共同影响河谷？', modelLink: '/experiments/systems/landform-sandbox',
  },
  {
    id: 'terraces', short: '哈尼梯田', title: '山坡如何变成耕地？', topic: '人地关系 · 水资源', question: '下面哪句话是从这幅照片可以直接读出的线索？',
    image: 'hani-terraces-honghe.jpg', width: 1400, height: 924, alt: '云南红河哈尼梯田的层叠田块', location: '云南红河元阳', type: '实景摄影',
    source: 'https://commons.wikimedia.org/wiki/File:Hani_Rice_Terraces_(53696480740).jpg', credit: 'xiquinhosilva', license: 'CC BY 2.0', licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    choices: [
      { text: '田块沿山坡形成层层台阶。', direct: true, explanation: '田块的形态与坡面关系可直接观察。灌溉方式和产量仍需其他资料。' },
      { text: '梯田每年的粮食产量都在上升。', direct: false, explanation: '一张景观照片不能提供逐年产量，需要长期统计资料。' },
    ],
    followup: '坡度、引水和聚落位置之间有什么联系？', modelLink: '/experiments/systems/water-cycle-3d',
  },
  {
    id: 'port', short: '洋山深水港', title: '港口为什么建在这里？', topic: '区位 · 交通', question: '下面哪句话是从这幅照片可以直接读出的线索？',
    image: 'yangshan-port.jpg', width: 1920, height: 1231, alt: '从高处俯瞰上海洋山深水港的岛屿与港区', location: '上海洋山', type: '实景摄影',
    source: 'https://commons.wikimedia.org/wiki/File:Yangshan_Deepwater_Port.jpg', credit: 'YHBEST1', license: '公有领域', licenseUrl: 'https://commons.wikimedia.org/wiki/File:Yangshan_Deepwater_Port.jpg#Licensing',
    choices: [
      { text: '港区设施与海岛、海面相邻。', direct: true, explanation: '这些空间关系在照片里可见。深水条件及航运联系仍需海图和交通资料。' },
      { text: '这个港口的集装箱吞吐量全国第一。', direct: false, explanation: '照片不能证明排名，必须查同一年、同一统计口径的港口数据。' },
    ],
    followup: '如果要判断港口区位，还应寻找哪些水深和交通证据？', modelLink: '/experiments/systems/map-projection',
  },
]

const activeCaseIndex = ref(0)
const selectedChoice = ref(null)
const activeCase = computed(() => cases[activeCaseIndex.value])
const notes = reactive({ river: '', terraces: '', port: '' })
const noteStatus = ref('')
function selectCase(index) {
  activeCaseIndex.value = index
  selectedChoice.value = null
  noteStatus.value = ''
}
onMounted(() => {
  try {
    const stored = JSON.parse(window.localStorage.getItem('geo-inquiry-notes-v1') || '{}')
    for (const id of Object.keys(notes)) if (typeof stored[id] === 'string') notes[id] = stored[id].slice(0, 600)
  } catch { /* Private browsing can disable local storage. */ }
})
function saveNote() {
  try {
    window.localStorage.setItem('geo-inquiry-notes-v1', JSON.stringify(notes))
    noteStatus.value = '已保存在此浏览器'
  } catch {
    noteStatus.value = '浏览器未允许保存，请先复制你的记录'
  }
}
function clearNote() {
  notes[activeCase.value.id] = ''
  saveNote()
  if (noteStatus.value === '已保存在此浏览器') noteStatus.value = '本条记录已清空'
}

const controls = [
  { key: 'rain', label: '降雨强度', labels: ['较弱', '中等', '较强'] },
  { key: 'slope', label: '坡面陡缓', labels: ['较缓', '中等', '较陡'] },
  { key: 'vegetation', label: '植被覆盖', labels: ['较少', '中等', '较多'] },
]
const settings = reactive({ rain: 2, slope: 2, vegetation: 2 })
const flow = computed(() => runoffTendency(settings))
const savedScenario = ref(null)
const comparisonExplanation = computed(() => savedScenario.value ? compareScenarios(savedScenario.value.settings, settings) : '')
function saveScenario() {
  savedScenario.value = {
    settings: { ...settings },
    label: flow.value.label,
    summary: controls.map(control => `${control.label}${control.labels[settings[control.key] - 1]}`).join(' · '),
  }
}
</script>

<style scoped>
.inquiry-page { color:#20352e; background:#f6f6f1; }
.wide { width:min(100% - 48px, 1200px); margin-inline:auto; }
.inquiry-hero { position:relative; overflow:hidden; padding:clamp(84px,11vw,150px) 0 68px; color:#f0f3e8; background:#132c35; }
.inquiry-hero::after { content:''; position:absolute; width:55vw; height:55vw; max-width:760px; max-height:760px; right:-12vw; top:-13vw; border:1px solid #5f8281; border-radius:50%; box-shadow:0 0 0 7vw #132c35, 0 0 0 calc(7vw + 1px) #3a6267, 0 0 0 15vw #132c35, 0 0 0 calc(15vw + 1px) #315157; opacity:.6; pointer-events:none; }
.inquiry-hero .wide { position:relative; z-index:1; }
.kicker { margin:0 0 18px; font:700 11px/1.5 ui-monospace,SFMono-Regular,monospace; letter-spacing:.17em; text-transform:uppercase; }
.inquiry-hero .kicker { color:#b4d5ca; }
.inquiry-hero h1 { max-width:700px; margin:0; color:#f4f3e8; font-size:clamp(48px,7vw,94px); line-height:1.08; letter-spacing:-.055em; }
.lead { max-width:600px; margin:28px 0 34px; color:#d2ded7; font-size:clamp(16px,1.5vw,19px); line-height:1.85; }
.hero-link { display:inline-flex; justify-content:space-between; min-width:190px; gap:24px; padding:13px 16px; color:#14312c; background:#dce8cf; text-decoration:none; font-weight:700; }
.data-labs-link { margin-left:12px; background:transparent; color:#e4f4ea; border:1px solid #b4d5ca; }
.hero-coordinate { position:absolute; right:4vw; bottom:28px; color:#a9c3be; font:700 11px ui-monospace,monospace; letter-spacing:.15em; }
.image-inquiry { padding-top:clamp(72px,8vw,112px); padding-bottom:clamp(80px,9vw,126px); scroll-margin-top:90px; }
.section-intro { max-width:740px; margin-bottom:38px; }
.section-intro .kicker { color:#7b785c; }
.section-intro h2 { margin:0 0 16px; font-size:clamp(32px,4.4vw,55px); line-height:1.13; letter-spacing:-.04em; }
.section-intro p:last-child { margin:0; color:#53655e; line-height:1.8; font-size:16px; }
.case-tabs { display:flex; flex-wrap:wrap; gap:0; border-top:1px solid #aab9ac; border-bottom:1px solid #aab9ac; margin-bottom:30px; }
.case-tabs button { flex:1; min-width:155px; min-height:64px; border:0; border-right:1px solid #aab9ac; padding:12px 16px; color:#34564b; background:transparent; text-align:left; font-family:inherit; font-size:15px; font-weight:700; cursor:pointer; }
.case-tabs button:last-child { border-right:0; }
.case-tabs button span { display:block; margin-bottom:5px; color:#7f9385; font:700 10px ui-monospace,monospace; }
.case-tabs button.active { color:#f3f4e9; background:#244739; }
.case-tabs button.active span { color:#c9d7ca; }
.case-layout { display:grid; grid-template-columns:minmax(0,1.2fr) minmax(300px,.8fr); gap:clamp(28px,4vw,60px); align-items:start; }
.case-image { margin:0; min-width:0; }
.case-image picture,.case-image img { display:block; width:100%; }
.case-image img { height:clamp(320px,43vw,540px); object-fit:cover; background:#d7dcd2; }
.case-image figcaption { margin-top:10px; color:#61746b; font-size:12px; line-height:1.6; }
.case-image a { color:#375e50; }
.case-label { margin:0 0 14px; color:#718271; font:700 11px ui-monospace,monospace; letter-spacing:.1em; }
.case-reading h3 { margin:0 0 16px; font-size:clamp(27px,3vw,39px); line-height:1.2; }
.case-question { margin:0 0 20px; color:#52665b; line-height:1.7; }
.judgments { display:grid; gap:9px; }
.judgments button { display:flex; align-items:start; gap:12px; min-height:66px; padding:15px; border:1px solid #b5c3b5; color:#244539; background:#fff; text-align:left; font-family:inherit; font-size:15px; font-weight:600; line-height:1.5; cursor:pointer; }
.judgments button.selected { border-color:#244739; background:#e4ede1; }
.choice-mark { color:#708c7b; font:700 12px ui-monospace,monospace; }
.feedback { padding:16px 18px; margin-top:13px; background:#e8eddf; border-left:3px solid #456e52; }
.feedback strong { color:#254632; }
.feedback p { margin:7px 0 0; color:#445d4d; line-height:1.7; }
.case-next { margin-top:24px; padding-top:18px; border-top:1px solid #b7c5bb; }
.case-next p { margin:0 0 15px; line-height:1.7; }
.case-next b { display:block; margin-bottom:4px; }
.case-next a { color:#285c46; font-weight:700; }
.field-journal { padding:22px; margin-top:28px; background:#e9eee6; border:1px solid #c6d2c5; }
.field-journal label { display:block; font-size:18px; font-weight:700; }.field-journal p { margin:7px 0 15px; color:#52665b; line-height:1.6; font-size:13px; }
.field-journal textarea { display:block; width:100%; box-sizing:border-box; padding:12px; border:1px solid #a8bbad; border-radius:0; color:#20382b; background:#fff; font-family:inherit; font-size:14px; line-height:1.6; resize:vertical; }
.journal-actions { display:flex; flex-wrap:wrap; align-items:center; gap:10px; margin:12px 0 8px; }.journal-actions button { padding:10px 14px; border:0; color:#f0f4ec; background:#244739; font-family:inherit; font-weight:700; cursor:pointer; }.journal-actions small { color:#315a41; }
.journal-actions .clear-note { color:#315a41; background:transparent; border:1px solid #8ca996; }
.field-journal > small { color:#62776a; }
.process-lab { padding:clamp(72px,8vw,110px) 0; color:#ecf2e8; background:#18352f; }
.process-lab .section-intro .kicker { color:#b9d3b8; }
.process-lab .section-intro h2 { color:#ecf2e8; }
.process-lab .section-intro p:last-child { color:#cfdfd0; }
.lab-layout { display:grid; grid-template-columns:minmax(260px,.75fr) minmax(0,1.25fr); gap:clamp(30px,6vw,80px); }
.lab-controls { padding:25px; background:#234439; border:1px solid #547665; }
.control { display:block; margin-bottom:30px; }
.control-heading,.range-ends { display:flex; justify-content:space-between; gap:12px; }
.control-heading { margin-bottom:13px; }
.control-heading strong { font-size:15px; }
.control-heading em { color:#c8debd; font-style:normal; }
.control input { display:block; width:100%; accent-color:#d9eab9; cursor:pointer; }
.range-ends { margin-top:6px; color:#aec7b2; }
.control-hint { margin:4px 0 18px; color:#c9ddcd; line-height:1.7; font-size:13px; }
.save-button { width:100%; padding:13px 16px; border:1px solid #d8e7cb; color:#173b2d; background:#d8e7cb; font-family:inherit; font-size:14px; font-weight:700; cursor:pointer; }
.save-button:hover { background:#f0f5e4; }
.slope-scene { position:relative; overflow:hidden; height:300px; background:linear-gradient(#829d9a 0 56%, #aac2ae 56% 100%); }
.rain { position:absolute; top:18px; left:45%; z-index:2; color:#e2f2ed; font-size:22px; line-height:1.5; letter-spacing:16px; transform:rotate(-20deg); }
.hill { position:absolute; left:-5%; bottom:0; width:95%; height:80%; background:#728b65; clip-path:polygon(0 12%,100% 83%,100% 100%,0 100%); }
.hill.slope-1 { clip-path:polygon(0 47%,100% 83%,100% 100%,0 100%); }
.hill.slope-3 { clip-path:polygon(0 0,100% 83%,100% 100%,0 100%); }
.plants { position:absolute; top:48%; left:18%; color:#234f3a; font-size:28px; letter-spacing:22px; transform:rotate(9deg); }
.stream { position:absolute; right:0; bottom:0; width:35%; height:26%; background:#497e86; border-radius:70% 0 0 0; transition:height .35s ease; }
.flow-1 .stream { height:16%; }.flow-2 .stream { height:27%; }.flow-3 .stream { height:39%; }
.scene-note { position:absolute; right:20px; bottom:15px; z-index:1; color:#e9f3e9; font:700 12px ui-monospace,monospace; }
.flow-result { padding:20px 0 10px; }
.result-label { display:block; color:#b8d1be; font:700 11px ui-monospace,monospace; letter-spacing:.08em; }
.flow-result strong { display:block; margin:8px 0; font-size:30px; }
.flow-result p { margin:0; color:#d3e1d6; line-height:1.7; }
.comparison { margin-top:15px; padding:18px; border:1px solid #75947b; }
.comparison span { color:#bfdbbd; font-size:12px; }.comparison strong { display:block; margin:8px 0; }.comparison p { margin:0; color:#d3e1d6; line-height:1.6; }
.lab-bridge { display:flex; justify-content:space-between; align-items:end; gap:30px; padding-top:50px; margin-top:55px; border-top:1px solid #698875; }
.lab-bridge span { color:#b9d3b8; font:700 11px ui-monospace,monospace; letter-spacing:.12em; }.lab-bridge h3 { margin:12px 0; font-size:28px; }.lab-bridge p { margin:0; color:#cfdfd0; line-height:1.7; }
.bridge-links { display:flex; flex-direction:column; gap:10px; min-width:205px; }.bridge-links a { padding:12px 0; color:#e7f1d9; border-bottom:1px solid #9bb59e; font-weight:700; text-decoration:none; }
button:focus-visible,a:focus-visible,input:focus-visible { outline:3px solid #d9eab9; outline-offset:3px; }
@media(max-width:850px) { .case-layout,.lab-layout { grid-template-columns:1fr; }.lab-bridge { align-items:start; flex-direction:column; }.bridge-links { width:100%; }.hero-coordinate { display:none; } }
@media(max-width:620px) { .wide { width:min(100% - 40px,1200px); }.inquiry-hero { padding:70px 0 65px; }.case-tabs button { min-width:0; font-size:13px; }.case-image img { height:270px; }.lab-controls { padding:20px; } }
@media(max-width:620px) { .data-labs-link { margin:12px 0 0; } }
@media(prefers-reduced-motion:reduce) { .stream { transition:none; } }
</style>
