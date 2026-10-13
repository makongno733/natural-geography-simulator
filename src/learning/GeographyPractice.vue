<template>
  <div class="practice-page">
    <header class="practice-intro">
      <span class="practice-kicker">地理课堂 · 观察与练习</span>
      <h1>把地理规律，放到手边。</h1>
      <p>调节日期与纬度，观察太阳高度和昼长；再用经纬网练习定位，认识国家与首都。</p>
    </header>

    <nav class="practice-tabs" aria-label="练习主题">
      <button v-for="tab in tabs" :key="tab.id" type="button" :class="{ selected: activeTab === tab.id }" :aria-current="activeTab === tab.id ? 'page' : undefined" @click="activeTab = tab.id">{{ tab.label }}</button>
    </nav>

    <section v-if="activeTab === 'sun'" class="practice-panel" aria-labelledby="sun-title">
      <div class="practice-heading">
        <div><span class="practice-kicker">高中 · 地球运动</span><h2 id="sun-title">从直射点推演昼夜长短</h2></div>
        <router-link to="/experiments/astronomy/seasons">继续观察四季模型 ↗</router-link>
      </div>
      <p class="practice-note">先预测：夏至时，北纬 40° 与南纬 40° 哪一处白昼更长？改变日期与纬度，比较结果。</p>
      <div class="sun-layout">
        <div class="practice-controls">
          <label for="day-slider">一年中的日期 <strong>第 {{ day }} 天 · {{ dateLabel }}</strong></label>
          <input id="day-slider" v-model.number="day" type="range" min="1" max="365" step="1" />
          <div class="slider-ends"><span>1 月</span><span>12 月</span></div>
          <label for="latitude-slider">观察纬度 <strong>{{ Math.abs(latitude) }}°{{ latitude >= 0 ? 'N' : 'S' }}</strong></label>
          <input id="latitude-slider" v-model.number="latitude" type="range" min="-80" max="80" step="1" />
          <div class="slider-ends"><span>南纬 80°</span><span>北纬 80°</span></div>
          <div class="preset-row" aria-label="典型日期">
            <button v-for="preset in dates" :key="preset.day" type="button" @click="day = preset.day">{{ preset.label }}</button>
          </div>
        </div>
        <div class="sun-results" aria-live="polite">
          <div><span>太阳直射纬度</span><strong>{{ Math.abs(declination).toFixed(1) }}°{{ declination >= 0 ? 'N' : 'S' }}</strong></div>
          <div><span>当地正午太阳高度</span><strong>{{ altitude.toFixed(1) }}°</strong></div>
          <div><span>理论昼长</span><strong>{{ daylight.toFixed(1) }} 小时</strong></div>
          <div><span>1 米竿正午影长</span><strong>{{ Number.isFinite(shadow) ? `${shadow.toFixed(2)} 米` : '无正午日照' }}</strong></div>
        </div>
      </div>
      <div class="day-bar" role="img" :aria-label="`白昼约 ${daylight.toFixed(1)} 小时，黑夜约 ${(24 - daylight).toFixed(1)} 小时`"><span :style="{ width: `${daylight / 24 * 100}%` }"></span></div>
      <div class="bar-labels"><span>白昼 {{ daylight.toFixed(1) }} h</span><span>黑夜 {{ (24 - daylight).toFixed(1) }} h</span></div>
      <h3 class="heatmap-title">全年各纬度的昼长</h3>
      <p class="practice-method">点选一个格子，把该纬度和月份带入上方模型。暖色表示白昼更长。</p>
      <div class="heatmap-scroll">
        <table class="heatmap-table">
          <caption class="sr-only">各纬度每月中旬理论昼长，单位小时</caption>
          <thead><tr><th scope="col">纬度</th><th v-for="month in 12" :key="month" scope="col">{{ month }} 月</th></tr></thead>
          <tbody><tr v-for="lat in heatmapLatitudes" :key="lat">
            <th scope="row">{{ lat === 0 ? '赤道' : `${Math.abs(lat)}°${lat > 0 ? 'N' : 'S'}` }}</th>
            <td v-for="month in 12" :key="month"><button type="button" :style="heatmapStyle(lat, month)" :aria-label="`${Math.abs(lat)}度${lat >= 0 ? '北纬' : '南纬'}，${month}月中旬，昼长${monthlyDaylight(lat, month).toFixed(1)}小时`" @click="selectHeatmap(lat, month)">{{ monthlyDaylight(lat, month).toFixed(1) }}</button></td>
          </tr></tbody>
        </table>
      </div>
      <p class="practice-explain">{{ explanation }}</p>
      <p class="practice-method">教学近似：使用固定 365 天和 23.44° 地轴倾角；未计大气折射、太阳视半径与地形遮挡，实际日出日落时间会不同。极昼极夜时影长仅作正午示意。</p>
    </section>

    <section v-else-if="activeTab === 'map'" class="practice-panel" aria-labelledby="map-title">
      <div class="practice-heading"><div><span class="practice-kicker">初中 · 经纬网 / 高中 · 空间定位</span><h2 id="map-title">在经纬网中寻找城市</h2></div></div>
      <p class="practice-note">请在图中点击 <strong>{{ target.name }}</strong> 的大致位置。经纬网是示意图，不显示国界；可使用下方经纬度线索。</p>
      <div class="map-layout">
        <svg class="coordinate-map" viewBox="0 0 720 360" role="img" :aria-label="`经纬网定位练习，目标 ${target.name}`" @click="handleMapClick">
          <rect width="720" height="360" rx="12" fill="#e9f2f5" />
          <path v-for="lon in longitudes" :key="`lon${lon}`" :d="`M${mapPoint(lon, 90).x} 0V360`" stroke="#abc6d5" stroke-width="1" />
          <path v-for="lat in latitudes" :key="`lat${lat}`" :d="`M0 ${mapPoint(0, lat).y}H720`" stroke="#abc6d5" stroke-width="1" />
          <path d="M360 0V360M0 180H720" stroke="#668ea3" stroke-width="2" />
          <text v-for="lon in longitudes" :key="`lon-label${lon}`" :x="mapPoint(lon, 0).x + 4" y="20" class="map-label">{{ lon }}°</text>
          <text v-for="lat in latitudes" :key="`lat-label${lat}`" x="8" :y="mapPoint(0, lat).y - 5" class="map-label">{{ lat }}°</text>
          <circle v-if="guess" :cx="mapPoint(guess.lon, guess.lat).x" :cy="mapPoint(guess.lon, guess.lat).y" r="7" fill="#c86446" stroke="white" stroke-width="2" />
          <circle v-if="reveal" :cx="mapPoint(target.lon, target.lat).x" :cy="mapPoint(target.lon, target.lat).y" r="7" fill="#1b4332" stroke="white" stroke-width="2" />
          <line v-if="guess && reveal" :x1="mapPoint(guess.lon, guess.lat).x" :y1="mapPoint(guess.lon, guess.lat).y" :x2="mapPoint(target.lon, target.lat).x" :y2="mapPoint(target.lon, target.lat).y" stroke="#c86446" stroke-dasharray="5 5" />
        </svg>
        <div class="map-side">
          <span class="practice-kicker">第 {{ cityIndex + 1 }} / {{ cities.length }} 题</span>
          <h3>{{ target.name }}</h3>
          <p>{{ target.clue }}</p>
          <form class="coordinate-form" @submit.prevent="submitCoordinates">
            <label>纬度（北正南负）<input v-model.number="manualLat" type="number" min="-90" max="90" step="0.1" required /></label>
            <label>经度（东正西负）<input v-model.number="manualLon" type="number" min="-180" max="180" step="0.1" required /></label>
            <button type="submit">按坐标定位</button>
          </form>
          <p v-if="guess" class="map-feedback" aria-live="polite">相距约 {{ distance.toFixed(0) }} 千米。{{ distance <= 350 ? '定位准确！' : '观察经纬线，再试一次。' }}</p>
          <button type="button" @click="reveal = true">显示参考位置</button>
          <button type="button" @click="nextCity">下一题 →</button>
          <p class="practice-method">距离按球面大圆近似计算；地图为无国界经纬网示意。</p>
        </div>
      </div>
    </section>

    <section v-else class="practice-panel" aria-labelledby="cards-title">
      <div class="practice-heading"><div><span class="practice-kicker">初中 · 世界地理</span><h2 id="cards-title">国家与首都知识卡</h2></div></div>
      <p class="practice-note">观察国家所在的大洲、首都和地理特征，再试着回忆。</p>
      <div class="country-grid">
        <article v-for="country in countries" :key="country.name" class="country-card">
          <span class="practice-kicker">{{ country.region }}</span><h3>{{ country.name }}</h3>
          <p>{{ country.feature }}</p>
          <button type="button" :aria-expanded="revealedCountries.includes(country.name)" @click="toggleCountry(country.name)">{{ revealedCountries.includes(country.name) ? `首都：${country.capital}` : '显示首都' }}</button>
        </article>
      </div>
      <p class="practice-method">卡片只列稳定的基础地理事实；不包含第三方国旗、地图瓦片或人口等随时间变化的数据。</p>
    </section>

    <p class="practice-credit">地球运动教学交互参考 <a href="https://github.com/edu-ai-builders/geography-viz-kit" target="_blank" rel="noopener noreferrer">Geography Viz Kit</a>（MIT，edu-ai-builders）。本页计算、界面与经纬网练习为独立实现。</p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { daylightHours, distanceKm, mapPoint, noonSolarAltitude, shadowLength, solarDeclination } from './solar.js'

const tabs = [{ id: 'sun', label: '太阳与昼长' }, { id: 'map', label: '经纬网定位' }, { id: 'cards', label: '国家知识卡' }]
const activeTab = ref('sun')
const day = ref(172)
const latitude = ref(40)
const dates = [{ day: 80, label: '春分前后' }, { day: 172, label: '夏至前后' }, { day: 266, label: '秋分前后' }, { day: 355, label: '冬至前后' }]
const heatmapLatitudes = [75, 60, 40, 20, 0, -20, -40, -60, -75]
const monthDays = [15, 46, 74, 105, 135, 166, 196, 227, 258, 288, 319, 349]
const dateLabel = computed(() => {
  const date = new Date(Date.UTC(2025, 0, day.value))
  return `${date.getUTCMonth() + 1} 月 ${date.getUTCDate()} 日前后`
})
const declination = computed(() => solarDeclination(day.value))
const altitude = computed(() => noonSolarAltitude(latitude.value, declination.value))
const daylight = computed(() => daylightHours(latitude.value, declination.value))
const shadow = computed(() => shadowLength(1, altitude.value))
const monthlyDaylight = (lat, month) => daylightHours(lat, solarDeclination(monthDays[month - 1]))
function heatmapStyle(lat, month) {
  const hours = monthlyDaylight(lat, month)
  return { backgroundColor: `hsl(${205 - hours * 8}, 62%, ${92 - Math.abs(hours - 12) * 2}%)` }
}
function selectHeatmap(lat, month) {
  latitude.value = lat
  day.value = monthDays[month - 1]
}
const explanation = computed(() => daylight.value === 24 ? '这里正处于极昼：太阳全天不落下。' : daylight.value === 0 ? '这里正处于极夜：太阳全天不升起。' : declination.value * latitude.value > 0 ? '太阳直射点与观察地位于同一半球，这里通常昼长夜短。' : declination.value * latitude.value < 0 ? '太阳直射点与观察地位于不同半球，这里通常昼短夜长。' : '接近分日或赤道，昼夜长度接近相等。')

const cities = [
  { name: '北京', lat: 39.9, lon: 116.4, clue: '北半球中纬度，东经约 116°。' },
  { name: '上海', lat: 31.2, lon: 121.5, clue: '北半球中纬度，东经约 121°。' },
  { name: '广州', lat: 23.1, lon: 113.3, clue: '北回归线附近，东经约 113°。' },
  { name: '乌鲁木齐', lat: 43.8, lon: 87.6, clue: '中国西北内陆，东经约 88°。' },
  { name: '拉萨', lat: 29.7, lon: 91.1, clue: '青藏高原，东经约 91°。' },
]
const countries = [
  { name: '中国', capital: '北京', region: '亚洲', feature: '地势整体西高东低，东部受季风影响显著。' },
  { name: '日本', capital: '东京', region: '亚洲', feature: '位于西北太平洋的岛弧地带。' },
  { name: '印度', capital: '新德里', region: '亚洲', feature: '南亚季风气候广布。' },
  { name: '埃及', capital: '开罗', region: '非洲', feature: '尼罗河流经东北非干旱地区。' },
  { name: '巴西', capital: '巴西利亚', region: '南美洲', feature: '亚马孙河流域分布着大面积热带雨林。' },
  { name: '澳大利亚', capital: '堪培拉', region: '大洋洲', feature: '内陆地区大面积干旱。' },
]
const cityIndex = ref(0)
const target = computed(() => cities[cityIndex.value])
const guess = ref(null)
const reveal = ref(false)
const manualLat = ref(0)
const manualLon = ref(0)
const distance = computed(() => guess.value ? distanceKm(guess.value, target.value) : 0)
const longitudes = [-150, -120, -90, -60, -30, 30, 60, 90, 120, 150]
const latitudes = [-60, -30, 30, 60]
const revealedCountries = ref([])

function handleMapClick(event) {
  const svg = event.currentTarget
  const point = svg.createSVGPoint()
  point.x = event.clientX
  point.y = event.clientY
  const local = point.matrixTransform(svg.getScreenCTM().inverse())
  guess.value = { lon: Math.max(-180, Math.min(180, local.x / 720 * 360 - 180)), lat: Math.max(-90, Math.min(90, 90 - local.y / 360 * 180)) }
  reveal.value = true
}

function nextCity() {
  cityIndex.value = (cityIndex.value + 1) % cities.length
  guess.value = null
  reveal.value = false
}

function submitCoordinates() {
  guess.value = { lat: manualLat.value, lon: manualLon.value }
  reveal.value = true
}

function toggleCountry(name) {
  revealedCountries.value = revealedCountries.value.includes(name) ? revealedCountries.value.filter(item => item !== name) : [...revealedCountries.value, name]
}
</script>

<style scoped>
.practice-page{max-width:1180px;margin:auto;padding:44px 24px 80px;color:var(--text)}
.practice-intro{border-top:2px solid var(--geo-green-deep);padding:32px 0 26px}.practice-kicker{color:var(--geo-green);font-size:.72rem;font-weight:700;letter-spacing:.13em}.practice-intro h1{font-size:clamp(2.2rem,5vw,4rem);margin:12px 0;color:var(--geo-ocean-deep)}.practice-intro p{color:var(--text-muted);max-width:650px;line-height:1.7}
.practice-tabs{display:flex;gap:8px;flex-wrap:wrap;border-bottom:1px solid var(--border);padding-bottom:12px;margin-bottom:24px}.practice-tabs button,.preset-row button,.map-side button,.country-card button{border:1px solid var(--border);border-radius:var(--radius-pill);background:var(--surface);padding:10px 16px;color:var(--geo-ocean-deep);font:inherit;cursor:pointer}.practice-tabs button.selected,.map-side button:last-of-type{background:var(--geo-ocean-deep);color:white}.practice-tabs button:focus-visible,.preset-row button:focus-visible,.map-side button:focus-visible,.country-card button:focus-visible,.coordinate-map:focus-visible{outline:3px solid var(--geo-terracotta);outline-offset:3px}
.practice-panel{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-box);box-shadow:var(--shadow-sm);padding:clamp(20px,4vw,38px)}.practice-heading{display:flex;justify-content:space-between;align-items:center;gap:18px;flex-wrap:wrap}.practice-heading h2{font-size:clamp(1.45rem,3vw,2rem);margin:8px 0;color:var(--geo-ocean-deep)}.practice-heading a{color:var(--geo-green-deep);text-decoration:underline}.practice-note{color:var(--text-muted);line-height:1.7;margin:10px 0 26px}.sun-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,.8fr);gap:28px}.practice-controls{display:grid;gap:10px}.practice-controls label{display:flex;justify-content:space-between;gap:10px;font-size:.92rem}.practice-controls input{width:100%;accent-color:var(--geo-green);cursor:pointer}.slider-ends,.bar-labels{display:flex;justify-content:space-between;color:var(--text-muted);font-size:.8rem}.preset-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.preset-row button{font-size:.82rem;padding:8px 11px}.sun-results{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.sun-results div{background:var(--geo-ocean-mist);border-radius:var(--radius-card);padding:18px;display:grid;gap:8px}.sun-results span{font-size:.8rem;color:var(--text-muted)}.sun-results strong{font-size:1.35rem;color:var(--geo-ocean-deep)}.day-bar{height:22px;border-radius:20px;background:var(--geo-ocean-deep);overflow:hidden;margin:30px 0 8px}.day-bar span{height:100%;display:block;background:var(--geo-ochre);transition:width .2s}.practice-explain{border-left:3px solid var(--geo-green);padding:8px 14px;background:var(--geo-green-soft)}.practice-method,.practice-credit{color:var(--text-muted);font-size:.82rem;line-height:1.6}.practice-credit{margin-top:18px}.practice-credit a{color:var(--geo-green-deep)}
.map-layout{display:grid;grid-template-columns:minmax(0,2fr) minmax(220px,1fr);gap:22px}.coordinate-map{width:100%;height:auto;border:1px solid var(--border);border-radius:12px;cursor:crosshair;touch-action:manipulation}.map-label{fill:#45697c;font-size:10px;pointer-events:none}.map-side{display:flex;flex-direction:column;align-items:flex-start;gap:10px}.map-side h3{font-size:1.8rem;margin:0;color:var(--geo-ocean-deep)}.map-side p{line-height:1.6;margin:0}.map-feedback{color:var(--geo-green-deep);font-weight:700}.country-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.country-card{background:var(--geo-ocean-mist);border:1px solid var(--border);border-radius:var(--radius-card);padding:20px}.country-card h3{font-size:1.5rem;margin:10px 0}.country-card p{min-height:3.5em;line-height:1.6;color:var(--text-muted)}
.coordinate-form{display:grid;gap:8px;width:100%}.coordinate-form label{display:grid;gap:4px;font-size:.82rem;color:var(--text-muted)}.coordinate-form input{width:100%;max-width:180px;border:1px solid var(--border-strong);border-radius:8px;padding:8px;font:inherit;color:var(--text)}
.heatmap-title{margin:30px 0 0;font-size:1.25rem;color:var(--geo-ocean-deep)}.heatmap-scroll{overflow-x:auto;margin:14px 0 24px}.heatmap-table{border-collapse:separate;border-spacing:3px;width:100%;min-width:700px}.heatmap-table th{font-size:.76rem;color:var(--text-muted);white-space:nowrap}.heatmap-table td{padding:0}.heatmap-table button{width:100%;border:0;border-radius:5px;padding:8px 2px;color:var(--geo-ocean-deep);font:inherit;font-size:.72rem;cursor:pointer}.heatmap-table button:focus-visible{outline:3px solid var(--geo-terracotta);outline-offset:1px}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media(max-width:760px){.sun-layout,.map-layout{grid-template-columns:1fr}.country-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:520px){.practice-page{padding:24px 14px 60px}.sun-results,.country-grid{grid-template-columns:1fr}.practice-controls label{flex-wrap:wrap}}
</style>
