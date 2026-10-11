<template>
  <div class="geography-home">
    <section class="earth-hero" aria-labelledby="home-title">
      <div class="hero-copy">
        <p class="eyebrow">EARTH / GEOGRAPHY / LEARNING</p>
        <h1 id="home-title">从地球出发，<br>读懂山河。</h1>
        <p class="hero-intro">沿着地貌、气候与人类活动的线索，认识中国与世界。课程可以循序学习，也可以从一幅真实影像开始探索。</p>
        <div class="hero-actions">
          <router-link to="/初中" class="primary-action">开始初中课程 <span aria-hidden="true">↗</span></router-link>
          <router-link to="/高中" class="secondary-action">进入高中课程</router-link>
        </div>
        <div class="hero-index" aria-label="探索入口">
          <button type="button" @click="scrollToSection('field-notes')">01 / 地球影像</button>
          <button type="button" @click="scrollToSection('terrain')">02 / 地势阶梯</button>
          <router-link to="/experiments">03 / 地理实验</router-link>
        </div>
      </div>
      <figure class="earth-portrait">
        <img :src="geoAsset('earth-apollo17.jpg')" width="1881" height="1881" fetchpriority="high" alt="阿波罗17号宇航员拍摄的地球，画面可见非洲、阿拉伯半岛、印度洋和云系">
        <figcaption>地球，1972 年 12 月 7 日 · Apollo 17 / <a href="https://science.nasa.gov/resource/the-blue-marble/" target="_blank" rel="noopener noreferrer">NASA Johnson Space Center ↗</a></figcaption>
      </figure>
    </section>

    <section class="learning-paths section-frame" aria-labelledby="paths-title">
      <div class="section-heading">
        <span class="eyebrow">CHOOSE YOUR ROUTE</span>
        <h2 id="paths-title">两种认识地球的路径</h2>
        <p>依教材建立知识结构，或从地图和实验观察地理过程。</p>
      </div>
      <div class="path-grid">
        <router-link to="/初中" class="path-link path-school">
          <span class="path-num">01 / 系统学习</span>
          <h3>循着教材走</h3>
          <p>从地球仪、地图判读到区域地理；再延伸到高中自然与人文地理。</p>
          <span class="path-cta">查看初中与高中课程 <span aria-hidden="true">→</span></span>
        </router-link>
        <router-link to="/experiments" class="path-link path-explore">
          <span class="path-num">02 / 动手探索</span>
          <h3>让地理过程可见</h3>
          <p>在已有实验中观察大气、流水、地质与地球运动，并回到课程解释现象。</p>
          <span class="path-cta">进入 3D 实验室 <span aria-hidden="true">→</span></span>
        </router-link>
      </div>
    </section>

    <section id="terrain" class="terrain-story section-frame" aria-labelledby="terrain-title">
      <div class="section-heading terrain-heading">
        <span class="eyebrow">SPATIAL RELATIONSHIP / 地势</span>
        <h2 id="terrain-title">从高原走向海洋</h2>
        <p>选择一段地势阶梯，观察地形如何影响河流流向、气候与人类活动。下图是教学示意，不代表实测高程剖面。</p>
      </div>
      <div class="terrain-layout">
        <div class="terrain-diagram" role="img" aria-label="中国地势自西向东呈三级阶梯下降的教学示意图">
          <div class="terrain-step first"><span>高原</span><small>第一级</small></div>
          <div class="terrain-step second"><span>高原与盆地</span><small>第二级</small></div>
          <div class="terrain-step third"><span>平原与丘陵</span><small>第三级</small></div>
          <div class="sea-line">海洋 <span aria-hidden="true">→</span></div>
          <div class="diagram-axis">西 <span>地势总体下降方向 →</span> 东</div>
        </div>
        <div class="terrain-reading">
          <div class="tier-switch" role="group" aria-label="选择地势阶梯">
            <button v-for="tier in tiers" :key="tier.id" type="button" :aria-pressed="selectedTier === tier.id" :class="{ active: selectedTier === tier.id }" @click="selectedTier = tier.id">{{ tier.short }}</button>
          </div>
          <div class="tier-detail" aria-live="polite">
            <span class="detail-kicker">{{ activeTier.region }}</span>
            <h3>{{ activeTier.title }}</h3>
            <p>{{ activeTier.description }}</p>
            <router-link to="/高中">在高中课程中继续学习 <span aria-hidden="true">→</span></router-link>
          </div>
        </div>
      </div>
    </section>

    <section id="field-notes" class="field-notes section-frame" aria-labelledby="notes-title">
      <div class="section-heading notes-heading">
        <span class="eyebrow">FIELD NOTES / 实景与遥感</span>
        <h2 id="notes-title">读一幅图，认识一片土地</h2>
        <p>摄影记录地表样貌，遥感提供另一种空间尺度。每张影像都标明来源；图片与教材主题相关，不代表教材封面取景地。</p>
      </div>
      <div class="filter-row" role="group" aria-label="筛选地理影像">
        <button v-for="filter in filters" :key="filter.key" type="button" :aria-pressed="activeFilter === filter.key" :class="{ active: activeFilter === filter.key }" @click="activeFilter = filter.key">{{ filter.label }}</button>
      </div>
      <div class="story-grid">
        <article v-for="(item, index) in visibleStories" :key="item.id" class="story-card" :class="{ featured: index === 0 && activeFilter === 'all' }">
          <figure>
            <img :src="geoAsset(item.image)" :width="item.width" :height="item.height" loading="lazy" decoding="async" :alt="item.alt">
            <figcaption>{{ item.location }} · {{ item.type }}</figcaption>
          </figure>
          <div class="story-body">
            <span class="story-number">{{ String(index + 1).padStart(2, '0') }} / {{ item.topic }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
            <div class="story-links">
              <router-link :to="item.studyLink">关联课程 <span aria-hidden="true">→</span></router-link>
              <a :href="item.source" target="_blank" rel="noopener noreferrer">影像来源：{{ item.credit }} ↗</a>
            </div>
            <small class="image-license"><a :href="licenseLinks[item.license]" target="_blank" rel="noopener noreferrer">{{ item.license }}</a><template v-if="item.modified"> · 网站缩放压缩</template></small>
          </div>
        </article>
      </div>
    </section>

    <section class="course-footer section-frame" aria-labelledby="continue-title">
      <span class="eyebrow">CONTINUE THE JOURNEY</span>
      <h2 id="continue-title">把眼前的地理现象，带回课堂。</h2>
      <div class="course-links">
        <router-link to="/初中">初中地理 <span aria-hidden="true">↗</span></router-link>
        <router-link to="/高中">高中地理 <span aria-hidden="true">↗</span></router-link>
        <router-link to="/experiments">3D 实验室 <span aria-hidden="true">↗</span></router-link>
        <router-link to="/map">地图投影 <span aria-hidden="true">↗</span></router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { geoAsset } from './geoAssets.js'

const tiers = [
  { id: 1, short: '第一阶梯', region: '青藏高原与柴达木盆地', title: '从高处认识水源', description: '高寒地势、冰雪与河流源头相互关联。观察高原时，也要留意地形对气温和水循环的影响。' },
  { id: 2, short: '第二阶梯', region: '高原与盆地', title: '复杂地形塑造差异', description: '内蒙古、黄土与云贵高原，以及多个大型盆地构成多样地貌。干湿差异与地表过程在这里交织。' },
  { id: 3, short: '第三阶梯', region: '平原、丘陵与海岸', title: '河流把山地连接到海洋', description: '平原、丘陵和海岸承接上游来水与泥沙，也为农业、聚落和交通提供了重要空间。' },
]
const selectedTier = ref(1)
const activeTier = computed(() => tiers.find(tier => tier.id === selectedTier.value))

const filters = [
  { key: 'all', label: '全部影像' },
  { key: 'terrain', label: '山地与地貌' },
  { key: 'water', label: '河流与水系' },
  { key: 'human', label: '人地关系' },
]
const activeFilter = ref('all')
const stories = [
  { id: 'everest', image: 'everest-north-face.jpg', width: 1920, height: 1280, title: '珠穆朗玛峰北坡', location: '西藏 · 绒布河谷', type: '实景摄影', topic: '板块与山地', group: 'terrain', description: '来自绒布河谷的视角揭示了高山地貌的尺度。结合地形与板块运动，理解喜马拉雅山脉的形成。', alt: '从绒布河谷望向珠穆朗玛峰北坡', source: 'https://commons.wikimedia.org/wiki/File:Everest_North_Face_toward_Base_Camp_Tibet_Luca_Galuzzi_2006.jpg', credit: 'Luca Galuzzi', license: 'CC BY-SA 4.0', modified: true, studyLink: '/高中' },
  { id: 'li-river', image: 'li-river-guilin.jpg', width: 1920, height: 1350, title: '漓江两岸的峰林', location: '广西 · 桂林', type: '实景摄影', topic: '喀斯特地貌', group: 'water', description: '石灰岩地区的溶蚀与流水作用，造就了峰林与河谷相邻的景观。', alt: '薄雾中的桂林漓江与两岸陡峭峰林', source: 'https://commons.wikimedia.org/wiki/File:Li_River_8_hills_in_mist_near_Guilin.jpg', credit: 'Dcrjsr', license: 'CC BY-SA 3.0', modified: true, studyLink: '/高中' },
  { id: 'tibet-ice', image: 'tibet-glacier-aster.jpg', width: 720, height: 480, title: '卫星视角下的西藏冰川', location: '西藏 · 拉萨西北', type: 'ASTER 假彩色遥感', topic: '冰川与水源', group: 'terrain', description: '白色冰雪、深色山影与湖泊在假彩色影像中形成鲜明对比。色彩经过波段组合，不等同于人眼所见。', alt: 'ASTER 假彩色影像显示拉萨西北的冰川、山影与湖泊', source: 'https://science.nasa.gov/earth/earth-observatory/glacier-capped-mountains-in-tibet-41229/', credit: 'NASA Earth Observatory / Jesse Allen', license: 'NASA 教育与信息使用', modified: true, studyLink: '/高中' },
  { id: 'yarlung', image: 'yarlung-tsangpo-aster.jpg', width: 720, height: 480, title: '雅鲁藏布江大拐弯', location: '西藏东南部', type: 'ASTER 遥感', topic: '河流下切', group: 'water', description: '河道在高山间急转，帮助理解高差、侵蚀与峡谷地貌的空间关系。', alt: '雅鲁藏布江在藏东南山地间形成深切河谷', source: 'https://science.nasa.gov/earth/earth-observatory/yarlung-tsangpo-the-everest-of-rivers-80558/', credit: 'NASA Earth Observatory', license: 'NASA 教育与信息使用', modified: true, studyLink: '/高中' },
  { id: 'qinling', image: 'qinling-sunset.jpg', width: 1920, height: 1440, title: '秦岭山地', location: '陕西 · 西安', type: '实景摄影', topic: '地理界线', group: 'terrain', description: '山地的走向与高度影响区域气候和水系。秦岭—淮河一线是认识中国区域差异的重要线索。', alt: '夕阳下层叠的陕西秦岭山地', source: 'https://commons.wikimedia.org/wiki/File:Sunset_on_Qinling_mountains.jpg', credit: 'Charlie439753', license: 'CC BY-SA 4.0', modified: true, studyLink: '/初中' },
  { id: 'hani', image: 'hani-terraces-honghe.jpg', width: 1400, height: 924, title: '红河哈尼梯田', location: '云南 · 元阳', type: '实景摄影', topic: '山地农业', group: 'human', description: '山地坡面上的层层梯田展示了居民如何利用地形与水资源组织农业生产。', alt: '云南红河哈尼梯田的层叠田块', source: 'https://commons.wikimedia.org/wiki/File:Hani_Rice_Terraces_(53696480740).jpg', credit: 'xiquinhosilva', license: 'CC BY 2.0', modified: true, studyLink: '/高中' },
  { id: 'yangshan', image: 'yangshan-port.jpg', width: 1920, height: 1231, title: '洋山深水港', location: '上海 · 洋山', type: '实景摄影', topic: '港口与区位', group: 'human', description: '岛屿、深水航道和跨海交通共同影响港口选址，也把自然条件与区域经济联系起来。', alt: '从高处俯瞰上海洋山深水港的岛屿与港区', source: 'https://commons.wikimedia.org/wiki/File:Yangshan_Deepwater_Port.jpg', credit: 'YHBEST1', license: '作者释出公有领域', modified: true, studyLink: '/高中' },
]
const licenseLinks = {
  'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
  'CC BY-SA 3.0': 'https://creativecommons.org/licenses/by-sa/3.0/',
  'CC BY 2.0': 'https://creativecommons.org/licenses/by/2.0/',
  'NASA 教育与信息使用': 'https://www.nasa.gov/nasa-brand-center/images-and-media/',
  '作者释出公有领域': 'https://commons.wikimedia.org/wiki/File:Yangshan_Deepwater_Port.jpg#Licensing',
}
const visibleStories = computed(() => activeFilter.value === 'all' ? stories : stories.filter(item => item.group === activeFilter.value))
function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    block: 'start',
  })
}
</script>

<style scoped>
.geography-home { color: #172433; background: #f7f8f5; }
.section-frame { padding: clamp(64px, 8vw, 112px) max(24px, calc((100vw - 1280px) / 2)); }
.eyebrow { display: block; margin: 0 0 18px; font: 700 11px/1.4 ui-monospace, SFMono-Regular, monospace; letter-spacing: .16em; text-transform: uppercase; }
.earth-hero { min-height: min(800px, calc(100svh - 64px)); display: grid; grid-template-columns: minmax(0,1fr) minmax(320px,1.04fr); align-items: center; gap: clamp(20px,4vw,70px); padding: 64px max(24px, calc((100vw - 1280px) / 2)) 36px; color: #f5f4ee; background: radial-gradient(circle at 80% 50%, #172c43, #06121e 60%); }
.earth-hero h1 { margin: 0 0 28px; color: inherit; font-size: clamp(54px, 7vw, 104px); line-height: 1.04; letter-spacing: -.055em; font-weight: 650; }
.hero-copy .eyebrow { color: #b5c7cb; }
.hero-intro { max-width: 520px; color: #d3dce0; font-size: clamp(16px,1.5vw,19px); line-height: 1.9; }
.hero-actions { display:flex; gap: 12px; flex-wrap:wrap; margin-top: 34px; }
.hero-actions a { display:inline-flex; align-items:center; justify-content:space-between; gap:32px; min-height:48px; padding:11px 18px; text-decoration:none; font-weight:700; border:1px solid rgba(255,255,255,.5); }
.primary-action { color:#0b2230; background:#e6ebdf; }
.secondary-action { color:#f5f4ee; }
.hero-actions a:hover { transform:translateY(-2px); }
.hero-index { display:flex; flex-wrap:wrap; gap:12px 24px; margin-top: clamp(44px,7vw,98px); font:600 11px ui-monospace,monospace; letter-spacing:.07em; }
.hero-index a, .hero-index button { color:#a7b9bf; text-decoration:none; }
.hero-index button { padding:0; border:0; background:transparent; cursor:pointer; font:inherit; letter-spacing:inherit; }
.hero-index a:hover, .hero-index button:hover { color:#fff; }
.hero-index a:focus-visible, .hero-index button:focus-visible { outline:2px solid #fff; outline-offset:4px; }
.earth-portrait { margin:0; min-width:0; }
.earth-portrait img { display:block; width:100%; height:auto; aspect-ratio:1; object-fit:contain; filter:drop-shadow(0 28px 54px rgba(0,0,0,.3)); }
.earth-portrait figcaption { margin-top:8px; text-align:center; color:#aabdc5; font-size:11px; }
.earth-portrait a { color:inherit; }
.section-heading { max-width:710px; margin-bottom:34px; }
.section-heading .eyebrow { color:#587365; }
.section-heading h2 { margin:0 0 14px; font-size:clamp(32px,4vw,54px); line-height:1.15; letter-spacing:-.035em; }
.section-heading p { margin:0; color:#586973; font-size:16px; line-height:1.8; }
.path-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.path-link { display:flex; flex-direction:column; min-height:310px; padding:30px; text-decoration:none; border:1px solid #cbd6d0; transition:transform .2s ease, border-color .2s ease; }
.path-link:hover { transform:translateY(-3px); border-color:#567969; }
.path-school { color:#f1f4ec; background:#244739; }
.path-explore { color:#f3f4f0; background:#21394d; }
.path-num { font:700 11px ui-monospace,monospace; letter-spacing:.12em; opacity:.8; }
.path-link h3 { margin:64px 0 10px; color:inherit; font-size:clamp(26px,3vw,36px); }
.path-link p { max-width:450px; margin:0 0 22px; line-height:1.7; opacity:.87; }
.path-cta { margin-top:auto; font-weight:700; }
.terrain-story { background:#142b37; color:#edf2ed; }
.terrain-heading .eyebrow, .terrain-heading h2 { color:#f0f3ed; }
.terrain-heading p { color:#c0cfd0; }
.terrain-layout { display:grid; grid-template-columns:1.2fr 1fr; gap:clamp(24px,5vw,72px); align-items:end; }
.terrain-diagram { display:flex; align-items:flex-end; height:340px; position:relative; border-bottom:1px solid #afc6c3; padding-bottom:32px; }
.terrain-step { flex:1; display:flex; flex-direction:column; justify-content:flex-start; padding:18px; color:#10242d; }
.terrain-step span { font-weight:800; }
.terrain-step small { font-size:12px; }
.terrain-step.first { height:82%; background:#d5d1b1; }
.terrain-step.second { height:55%; background:#b0ba9a; }
.terrain-step.third { height:30%; background:#9ab8a0; }
.sea-line { width:15%; height:30%; padding:18px 0 0 10px; color:#cae3e5; background:#355a6c; font-size:13px; }
.diagram-axis { position:absolute; bottom:0; left:0; right:0; display:flex; justify-content:space-between; font:600 11px ui-monospace,monospace; color:#b2c5c4; }
.tier-switch { display:flex; flex-wrap:wrap; gap:7px; margin-bottom:24px; }
.tier-switch button, .filter-row button { cursor:pointer; font-size:13px; font-weight:700; font-family:inherit; }
.tier-switch button { color:#d3e0dc; border:1px solid #6b8585; background:transparent; padding:9px 13px; }
.tier-switch button.active { background:#dce8da; color:#142b37; border-color:#dce8da; }
.tier-detail { min-height:210px; border-top:1px solid #6b8585; padding-top:24px; }
.detail-kicker { font:700 11px ui-monospace,monospace; color:#b9d7ce; letter-spacing:.1em; }
.tier-detail h3 { margin:9px 0; color:#fff; font-size:27px; }
.tier-detail p { color:#c9d5d5; line-height:1.8; }
.tier-detail a { color:#e7f1df; font-weight:700; }
.field-notes { background:#f2f3ee; }
.filter-row { display:flex; flex-wrap:wrap; gap:8px; margin:0 0 26px; }
.filter-row button { padding:9px 16px; border:1px solid #b8c8c1; background:transparent; color:#34514d; }
.filter-row button.active { background:#244739; border-color:#244739; color:#fff; }
.story-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:18px; }
.story-card { min-width:0; background:#fff; border:1px solid #dce2db; }
.story-card.featured { grid-column:span 2; display:grid; grid-template-columns:1.1fr 1fr; }
.story-card figure { margin:0; position:relative; overflow:hidden; background:#dbe3de; }
.story-card img { display:block; width:100%; height:310px; object-fit:cover; }
.story-card.featured img { height:100%; min-height:390px; }
.story-card figcaption { position:absolute; left:14px; bottom:14px; padding:5px 9px; color:white; background:rgba(13,32,40,.8); font-size:11px; }
.story-body { padding:24px; display:flex; flex-direction:column; }
.story-number { font:700 11px ui-monospace,monospace; letter-spacing:.08em; color:#597064; }
.story-body h3 { margin:16px 0 10px; font-size:clamp(22px,2.4vw,31px); }
.story-body p { margin:0 0 22px; color:#4a5d62; line-height:1.75; }
.story-links { display:flex; flex-wrap:wrap; gap:10px 18px; margin-top:auto; }
.story-links a { color:#1d5749; font-size:13px; font-weight:700; }
.image-license a { color:inherit; }
.image-license { margin-top:14px; color:#667876; font-size:11px; }
.course-footer { background:#e2e9df; }
.course-footer h2 { max-width:680px; font-size:clamp(32px,4vw,52px); }
.course-links { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; margin-top:38px; background:#aebdb0; border:1px solid #aebdb0; }
.course-links a { display:flex; justify-content:space-between; gap:8px; padding:22px 16px; background:#f5f7f2; color:#214337; text-decoration:none; font-weight:700; }
.course-links a:hover { background:#d8e5d8; }
@media(max-width:850px) { .earth-hero { grid-template-columns:1fr; padding-top:62px; } .earth-portrait { max-width:620px; justify-self:center; } .terrain-layout { grid-template-columns:1fr; } .story-card.featured { display:block; } .story-card.featured img { height:310px; min-height:0; } .course-links { grid-template-columns:repeat(2,1fr); } }
@media(max-width:620px) { .section-frame { padding:62px 20px; } .earth-hero { padding:60px 20px 36px; } .earth-hero h1 { font-size:clamp(50px,12vw,70px); } .hero-index { margin-top:44px; } .path-grid,.story-grid { grid-template-columns:1fr; } .story-card.featured { grid-column:auto; } .path-link { min-height:270px; } .path-link h3 { margin-top:48px; } .terrain-diagram { height:255px; } .terrain-step { padding:10px 5px; font-size:12px; } .sea-line { font-size:10px; padding-left:3px; } .diagram-axis span { display:none; } .course-links { grid-template-columns:1fr; } }
@media(prefers-reduced-motion:reduce) { .path-link,.hero-actions a { transition:none; } }
</style>
