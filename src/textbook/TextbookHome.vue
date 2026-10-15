<template>
  <div class="geography-home">
    <section class="earth-hero" aria-labelledby="home-title">
      <div class="hero-copy">
        <p class="eyebrow">地球 · 地貌 · 气候 · 空间</p>
        <h1 id="home-title">把地理，<br>放到眼前。</h1>
        <p class="hero-intro">{{ selectedHomePlanet.id === 'earth' ? '转动地球，走进真实的地理过程。从三维模型开始观察，再进入适合自己的初中或高中课程。' : selectedHomePlanet.description }}</p>
        <div class="hero-actions">
          <router-link to="/earth3d" class="primary-action">探索 3D 地球 <span aria-hidden="true">↗</span></router-link>
          <button type="button" class="secondary-action" @click="scrollToSection('three-d-gallery')">查看三维模型 <span aria-hidden="true">↓</span></button>
        </div>
        <div class="hero-courses" aria-label="按学段学习">
          <router-link to="/初中"><strong>初中地理</strong><span>地球与地图 · 中国与世界 <span aria-hidden="true">↗</span></span></router-link>
          <router-link to="/高中"><strong>高中地理</strong><span>自然过程 · 人地关系 <span aria-hidden="true">↗</span></span></router-link>
        </div>
      </div>
      <figure class="earth-portrait">
        <HomeEarth3D @planet-change="selectedHomePlanet = $event" />
        <figcaption>天体外观仅供观察，展示大小不按真实比例。纹理：<a :href="selectedHomePlanet.id === 'earth' ? 'https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-topography-bathymetry/' : selectedHomePlanet.id === 'pluto' ? 'https://science.nasa.gov/resource/pluto-global-color-map/' : 'https://www.solarsystemscope.com/textures/'" target="_blank" rel="noopener noreferrer">{{ selectedHomePlanet.id === 'earth' ? 'NASA' : selectedHomePlanet.id === 'pluto' ? 'NASA / JHUAPL / SwRI' : 'Solar System Scope · CC BY 4.0' }} ↗</a></figcaption>
      </figure>
    </section>

    <section id="three-d-gallery" class="model-gallery section-frame" aria-labelledby="model-gallery-title">
      <div class="model-gallery-intro">
        <span class="eyebrow">观察 · 操作 · 理解</span>
        <h2 id="model-gallery-title">从模型中，看见地理过程。</h2>
        <p>选择一个现有三维模型，进入后直接拖动、观察和推演。每个模型都通向具体的地理问题。</p>
      </div>
      <div class="model-gallery-list">
        <router-link v-for="(model, index) in featuredModels" :key="model.title" :to="model.to" class="model-gallery-item">
          <span class="model-index">0{{ index + 1 }}</span>
          <span class="model-main"><strong>{{ model.title }}</strong><small>{{ model.question }}</small></span>
          <span class="model-action">打开模型 <span aria-hidden="true">↗</span></span>
        </router-link>
      </div>
      <router-link to="/experiments" class="model-gallery-all">查看全部地理实验 <span aria-hidden="true">→</span></router-link>
    </section>

    <section class="inquiry-entry section-frame" aria-labelledby="inquiry-entry-title">
      <div>
        <span class="eyebrow">从观察到解释</span>
        <h2 id="inquiry-entry-title">地理不止在课本里。</h2>
        <p>读一幅真实影像，分清观察与推断；改变一个条件，比较地表过程会怎样变化。用证据提出自己的地理解释。</p>
        <router-link to="/inquiry" class="inquiry-entry-link">开始地理探究 <span aria-hidden="true">↗</span></router-link>
      </div>
      <picture>
        <img :src="geoOptimizedAsset('yarlung-tsangpo-aster.jpg', 960)" width="720" height="480" loading="lazy" decoding="async" alt="雅鲁藏布江在藏东南山地间形成深切河谷">
      </picture>
    </section>

    <section class="learning-paths section-frame" aria-labelledby="paths-title">
      <div class="section-heading">
        <span class="eyebrow">按学段继续</span>
        <h2 id="paths-title">初中与高中，各有一条清晰的学习路径。</h2>
        <p>先选学段，再按教材章节学习；模型和实验可以随时穿插进课堂。</p>
      </div>
      <div class="path-grid">
        <router-link to="/初中" class="path-link path-school">
          <span class="path-num">01 / 七至八年级</span>
          <h3>初中地理</h3>
          <p>从地球仪与地图开始，认识中国与世界的自然环境和区域差异。</p>
          <span class="path-cta">进入初中课程 <span aria-hidden="true">→</span></span>
        </router-link>
        <router-link to="/高中" class="path-link path-explore">
          <span class="path-num">02 / 必修与选择性必修</span>
          <h3>高中地理</h3>
          <p>进一步理解大气、水、地貌、人口与区域发展背后的过程和联系。</p>
          <span class="path-cta">进入高中课程 <span aria-hidden="true">→</span></span>
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
          <div class="terrain-step first" :class="{ selected: selectedTier === 1 }"><span>高原</span><small>第一级</small></div>
          <div class="terrain-step second" :class="{ selected: selectedTier === 2 }"><span>高原与盆地</span><small>第二级</small></div>
          <div class="terrain-step third" :class="{ selected: selectedTier === 3 }"><span>平原与丘陵</span><small>第三级</small></div>
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
            <picture>
              <img :src="geoOptimizedAsset(item.image, 960)" :width="item.width" :height="item.height" loading="lazy" decoding="async" :alt="item.alt">
            </picture>
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
import { geoOptimizedAsset } from './geoAssets.js'
import HomeEarth3D from './HomeEarth3D.vue'
import { planets } from './planetCatalog.js'

const selectedHomePlanet = ref(planets[2])

const featuredModels = [
  { title: '地球内部', question: '地壳、地幔与地核如何分层？', to: '/earth3d' },
  { title: '水循环', question: '水如何在陆地、海洋与大气之间流动？', to: '/experiments/systems/water-cycle-3d' },
  { title: '地貌沙盘', question: '侵蚀与堆积如何改变地表？', to: '/experiments/systems/landform-sandbox' },
  { title: '月相变化', question: '日、地、月的位置如何决定月相？', to: '/experiments/astronomy/moon-phases' },
]

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
.geography-home { color: var(--text); background: var(--bg); }
.section-frame { padding: clamp(64px, 8vw, 112px) max(24px, calc((100vw - 1280px) / 2)); }
.eyebrow { display: block; margin: 0 0 16px; font: 700 11px/1.4 ui-monospace, SFMono-Regular, monospace; letter-spacing: .16em; text-transform: uppercase; }
.earth-hero { min-height: min(800px, calc(100svh - 64px)); display: grid; grid-template-columns: minmax(0,1fr) minmax(320px,1.04fr); align-items: center; gap: clamp(20px,4vw,70px); padding: 64px max(24px, calc((100vw - 1280px) / 2)) 36px; color: #f5f4ee; background: radial-gradient(circle at 75% 46%, #19364a 0%, #0b2332 48%, #06121e 100%); }
.earth-hero h1 { margin: 0 0 24px; color: inherit; font-size: clamp(52px, 7vw, 98px); line-height: 1.05; letter-spacing: -.045em; font-weight: 700; }
.hero-copy .eyebrow { color: #9bb0be; }
.hero-intro { max-width: 520px; color: #d3dce0; font-size: clamp(16px,1.5vw,18.5px); line-height: 1.85; }
.hero-actions { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 36px; }
.hero-actions a, .hero-actions button { display: inline-flex; align-items: center; justify-content: space-between; gap: 24px; min-height: 48px; padding: 12px 22px; text-decoration: none; font-family: inherit; font-size: 14.5px; font-weight: 700; line-height: 1.4; cursor: pointer; border-radius: var(--radius-pill); border: 1px solid rgba(255,255,255,.4); box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
.primary-action { color: #0b2230; background: #eef3eb; border-color: rgba(255,255,255,0.8) !important; }
.secondary-action { color: #f5f4ee; background: rgba(255,255,255,0.06); backdrop-filter: blur(8px); }
.hero-actions a:hover, .hero-actions button:hover { background: #ffffff; color: #0b2230; transform: var(--geo-btn-elevate); box-shadow: 0 6px 18px rgba(0,0,0,0.3); }
.hero-actions a:focus-visible, .hero-actions button:focus-visible { outline: 2px solid white; outline-offset: 3px; }
.hero-courses { display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin-top: clamp(40px,5vw,72px); border-top: 1px solid rgba(255,255,255,.25); }
.hero-courses a { display: flex; flex-direction: column; gap: 6px; padding: 18px 16px 18px 0; text-decoration: none; color: #f2f5ed; border-radius: var(--radius-sm); transition: background 0.2s; }
.hero-courses a + a { border-left: 1px solid rgba(255,255,255,.2); padding-left: 20px; }
.hero-courses strong { font-size: 17px; }
.hero-courses span { color: #9bb0be; font-size: 12.5px; }
.hero-courses a:hover { background: rgba(255,255,255,0.04); }
.hero-courses a:hover strong { text-decoration: underline; text-underline-offset: 4px; }
.hero-courses a:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
.earth-portrait { margin: 0; min-width: 0; }
.earth-portrait figcaption { margin-top: 10px; text-align: center; color: #9bb0be; font-size: 11.5px; }
.earth-portrait a { color: inherit; text-decoration: underline; }

/* 3D 实验精选导览 */
.model-gallery { display: grid; grid-template-columns: minmax(260px,.8fr) minmax(0,1.2fr); gap: clamp(32px,7vw,100px); background: #f0f3ee; border-bottom: 1px solid var(--border); }
.model-gallery-intro h2 { margin: 0 0 16px; color: var(--geo-ocean-deep); font-size: clamp(32px,4.2vw,54px); line-height: 1.15; letter-spacing: -.03em; }
.model-gallery-intro p { max-width: 450px; color: var(--text-muted); line-height: 1.8; }
.model-gallery-list { border-top: 2px solid var(--geo-ocean); }
.model-gallery-item { display: grid; grid-template-columns: 44px minmax(0,1fr) auto; align-items: center; gap: 14px; min-height: 108px; padding: 18px 12px; color: var(--text); text-decoration: none; border-bottom: 1px solid var(--border); border-radius: var(--radius-sm); transition: padding .2s var(--geo-flow-ease), background .2s var(--geo-flow-ease), transform .18s var(--geo-flow-ease); }
.model-gallery-item:hover { padding-left: 20px; background: #ffffff; box-shadow: var(--shadow-sm); }
.model-gallery-item:focus-visible { outline: 3px solid var(--geo-ocean); outline-offset: 2px; }
.model-index { align-self: start; padding-top: 4px; color: var(--geo-ocean); font: 700 13px ui-monospace,monospace; }
.model-main { display: flex; flex-direction: column; gap: 6px; }
.model-main strong { font-size: clamp(20px,2.2vw,26px); color: var(--geo-ocean-deep); }
.model-main small { color: var(--text-muted); font-size: 13.5px; }
.model-action { white-space: nowrap; font-size: 13px; font-weight: 700; color: var(--geo-ocean); }
.model-gallery-all { grid-column: 2; justify-self: end; color: var(--geo-ocean); font-weight: 700; padding: 8px 16px; border-radius: var(--radius-pill); background: var(--geo-ocean-surface); text-decoration: none; transition: background 0.2s; }
.model-gallery-all:hover { background: #dceaf5; }

/* 探究导引 */
.inquiry-entry { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(28px,6vw,80px); align-items: center; background: #faf8f2; border-bottom: 1px solid var(--border); }
.inquiry-entry .eyebrow { color: var(--geo-earth); }
.inquiry-entry h2 { margin: 0 0 20px; color: var(--geo-ocean-deep); font-size: clamp(34px,4.4vw,56px); line-height: 1.15; letter-spacing: -.035em; }
.inquiry-entry p { max-width: 550px; color: var(--text-muted); line-height: 1.85; font-size: 16.5px; }
.inquiry-entry-link { display: inline-flex; justify-content: space-between; gap: 36px; padding: 13px 24px; margin-top: 20px; color: #ffffff; background: var(--geo-ocean); text-decoration: none; font-weight: 700; border-radius: var(--radius-pill); box-shadow: var(--geo-btn-primary-shadow); transition: background 0.2s, transform 0.12s; }
.inquiry-entry-link:hover { background: var(--geo-ocean-deep); transform: var(--geo-btn-elevate); box-shadow: var(--geo-btn-primary-hover-shadow); }
.inquiry-entry-link:focus-visible { outline: 3px solid var(--geo-ocean); outline-offset: 3px; }
.inquiry-entry picture { display: block; min-width: 0; border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-md); border: 1px solid var(--border); }
.inquiry-entry img { display: block; width: 100%; height: clamp(280px,33vw,450px); object-fit: cover; }

/* 学段路径 */
.section-heading { max-width: 710px; margin-bottom: 34px; }
.section-heading .eyebrow { color: var(--geo-ocean); }
.section-heading h2 { margin: 0 0 14px; font-size: clamp(30px,4vw,50px); line-height: 1.18; letter-spacing: -.03em; color: var(--geo-ocean-deep); }
.section-heading p { margin: 0; color: var(--text-muted); font-size: 16px; line-height: 1.8; }
.path-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.path-link { display: flex; flex-direction: column; min-height: 310px; padding: 32px; text-decoration: none; border-radius: var(--radius-box); border: 1px solid var(--border); box-shadow: var(--shadow-sm); transition: transform .2s var(--geo-flow-ease), box-shadow .2s var(--geo-flow-ease), border-color .2s; }
.path-link:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
.path-school { color: #f1f4ec; background: linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%); border-color: rgba(45, 106, 79, 0.3); }
.path-explore { color: #f3f4f0; background: linear-gradient(135deg, #0f2742 0%, #1a446c 100%); border-color: rgba(26, 68, 108, 0.3); }
.path-num { font: 700 11.5px ui-monospace,monospace; letter-spacing: .12em; opacity: .85; }
.path-link h3 { margin: 56px 0 10px; color: inherit; font-size: clamp(26px,3vw,34px); font-weight: 700; }
.path-link p { max-width: 450px; margin: 0 0 22px; line-height: 1.7; opacity: .9; font-size: 15px; }
.path-cta { margin-top: auto; font-weight: 700; font-size: 14.5px; display: inline-flex; align-items: center; gap: 6px; }

/* 地势三大阶梯交互展板 */
.terrain-story { background: #0c1c28; color: #edf2ed; border-bottom: 1px solid rgba(255,255,255,0.1); }
.terrain-heading .eyebrow, .terrain-heading h2 { color: #f0f3ed; }
.terrain-heading p { color: #b8cbd2; }
.terrain-layout { display: grid; grid-template-columns: 1.2fr 1fr; gap: clamp(24px,5vw,72px); align-items: end; }
.terrain-diagram { display: flex; align-items: flex-end; height: 340px; position: relative; border-bottom: 1px solid rgba(175,198,195,0.4); padding-bottom: 32px; }
.terrain-step { flex: 1; display: flex; flex-direction: column; justify-content: flex-start; padding: 18px; color: #10242d; border-radius: 8px 8px 0 0; transition: filter .35s ease, transform .35s ease; cursor: pointer; }
.terrain-step.selected { filter: brightness(1.15); transform: translateY(-10px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
.terrain-step span { font-weight: 800; font-size: 16px; }
.terrain-step small { font-size: 12px; margin-top: 4px; opacity: 0.85; }
.terrain-step.first { height: 82%; background: #d5d1b1; }
.terrain-step.second { height: 55%; background: #b0ba9a; }
.terrain-step.third { height: 30%; background: #9ab8a0; }
.sea-line { width: 15%; height: 30%; padding: 18px 0 0 10px; color: #cae3e5; background: #264a5c; font-size: 13px; border-radius: 8px 8px 0 0; }
.diagram-axis { position: absolute; bottom: 0; left: 0; right: 0; display: flex; justify-content: space-between; font: 600 11px ui-monospace,monospace; color: #9bb0be; }
.tier-switch { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
.tier-switch button, .filter-row button { cursor: pointer; font-size: 13px; font-weight: 700; font-family: inherit; border-radius: var(--radius-pill); }
.tier-switch button { color: #d3e0dc; border: 1px solid rgba(255,255,255,0.25); background: rgba(255,255,255,0.05); padding: 9px 16px; transition: var(--geo-btn-transition); }
.tier-switch button.active { background: #dce8da; color: #142b37; border-color: #dce8da; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
.tier-detail { min-height: 210px; border-top: 1px solid rgba(255,255,255,0.18); padding-top: 24px; }
.detail-kicker { font: 700 11px ui-monospace,monospace; color: #a4ccc1; letter-spacing: .1em; }
.tier-detail h3 { margin: 9px 0; color: #fff; font-size: 26px; }
.tier-detail p { color: #c9d5d5; line-height: 1.8; font-size: 15px; }
.tier-detail a { color: #dce8da; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; }
.tier-detail a:hover { text-decoration: underline; }

/* 实景与遥感笔记卡片 */
.field-notes { background: var(--bg); }
.filter-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 26px; }
.filter-row button { padding: 9px 18px; border: 1px solid var(--border); background: var(--surface); color: var(--text); transition: var(--geo-btn-transition); }
.filter-row button.active { background: var(--geo-ocean); border-color: var(--geo-ocean); color: #fff; box-shadow: var(--geo-btn-primary-shadow); }
.story-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 20px; }
.story-card { min-width: 0; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-box); overflow: hidden; box-shadow: var(--shadow-sm); transition: transform 0.2s var(--geo-flow-ease), box-shadow 0.2s; }
.story-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
.story-card.featured { grid-column: span 2; display: grid; grid-template-columns: 1.15fr 1fr; }
.story-card figure { margin: 0; position: relative; overflow: hidden; background: var(--bg-soft); }
.story-card img { display: block; width: 100%; height: 310px; object-fit: cover; transition: transform 0.4s ease; }
.story-card:hover img { transform: scale(1.02); }
.story-card.featured img { height: 100%; min-height: 380px; }
.story-card figcaption { position: absolute; left: 14px; bottom: 14px; padding: 5px 12px; color: white; background: rgba(10,25,45,.82); backdrop-filter: blur(6px); border-radius: var(--radius-pill); font-size: 11.5px; font-weight: 600; border: 1px solid rgba(255,255,255,0.2); }
.story-body { padding: 26px; display: flex; flex-direction: column; }
.story-number { font: 700 11px ui-monospace,monospace; letter-spacing: .08em; color: var(--geo-ocean); }
.story-body h3 { margin: 14px 0 10px; font-size: clamp(21px,2.2vw,28px); color: var(--geo-ocean-deep); }
.story-body p { margin: 0 0 22px; color: var(--text-muted); line-height: 1.75; font-size: 14.5px; }
.story-links { display: flex; flex-wrap: wrap; gap: 10px 18px; margin-top: auto; }
.story-links a { color: var(--geo-ocean); font-size: 13.5px; font-weight: 700; text-decoration: none; }
.story-links a:hover { text-decoration: underline; }
.image-license a { color: inherit; }
.image-license { margin-top: 14px; color: var(--text-faint); font-size: 11px; }

/* 底部行动召集 */
.course-footer { background: var(--geo-ocean-surface); border-top: 1px solid var(--border); }
.course-footer h2 { max-width: 680px; font-size: clamp(30px,4vw,48px); color: var(--geo-ocean-deep); margin: 0 0 12px; }
.course-links { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-top: 36px; }
.course-links a { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 20px 22px; background: var(--surface); color: var(--geo-ocean-deep); text-decoration: none; font-weight: 700; border-radius: var(--radius-md); border: 1px solid var(--border); box-shadow: var(--shadow-xs); transition: var(--geo-btn-transition); }
.course-links a:hover { transform: var(--geo-btn-elevate); box-shadow: var(--shadow-sm); border-color: var(--geo-ocean); color: var(--geo-ocean); }

/* 响应式断点 */
@media(max-width:850px) {
  .earth-hero { grid-template-columns: 1fr; padding-top: 56px; }
  .earth-portrait { width: min(100%, 600px); justify-self: center; }
  .model-gallery, .inquiry-entry { grid-template-columns: 1fr; }
  .model-gallery-all { grid-column: 1; justify-self: start; }
  .terrain-layout { grid-template-columns: 1fr; }
  .story-card.featured { display: block; }
  .story-card.featured img { height: 300px; min-height: 0; }
  .course-links { grid-template-columns: repeat(2,1fr); }
}

@media(max-width:620px) {
  .section-frame { padding: 56px 18px; }
  .earth-hero { display: flex; flex-direction: column; align-items: stretch; gap: 0; padding: 48px 18px 32px; }
  .hero-copy { display: contents; }
  .hero-copy .eyebrow { order: 1; }
  .earth-hero h1 { order: 2; margin-bottom: 8px; font-size: clamp(44px,11vw,64px); }
  .earth-portrait { order: 3; width: 100%; }
  .hero-intro { order: 4; margin: 18px 0 0; }
  .hero-actions { order: 5; margin-top: 22px; }
  .hero-courses { order: 6; margin-top: 36px; }
  .model-gallery-item { grid-template-columns: 32px 1fr; }
  .model-action { grid-column: 2; }
  .path-grid, .story-grid { grid-template-columns: 1fr; }
  .story-card.featured { grid-column: auto; }
  .path-link { min-height: 260px; }
  .path-link h3 { margin-top: 40px; }
  .terrain-diagram { height: 240px; }
  .terrain-step { padding: 8px 4px; font-size: 11.5px; }
  .sea-line { font-size: 10px; padding-left: 2px; }
  .diagram-axis span { display: none; }
  .course-links { grid-template-columns: 1fr; }
}

@media(prefers-reduced-motion:reduce) {
  .path-link, .hero-actions a, .hero-actions button, .model-gallery-item, .terrain-step, .story-card img {
    transition: none !important;
    transform: none !important;
  }
}
</style>
