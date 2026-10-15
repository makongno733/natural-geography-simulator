<template>
  <div class="geo-calendar page-shell">
    <section class="calendar-hero">
      <div class="calendar-hero-copy">
        <span class="calendar-eyebrow">GEOGRAPHY IN TIME / 地理时间轴</span>
        <h1>把正在发生的地球，<br><em>放进日历。</em></h1>
        <p>一年地理观察计划：看得见的夜空、季节变化，以及持续更新的地震记录。</p>
        <div class="calendar-hero-tags"><span>北京时间</span><span>来源可追溯</span><span>预测与实录分开</span></div>
      </div>
      <div class="calendar-orbit" aria-hidden="true"><div class="orbit-ring ring-one"></div><div class="orbit-ring ring-two"></div><div class="orbit-earth">◉</div><span class="orbit-caption">31°N / 104°E</span></div>
    </section>

    <div class="calendar-intro">
      <div><strong>未来一年</strong><span>每月都可浏览</span></div>
      <div><strong>{{ astronomyEvents.length }}</strong><span>已核对的天象线索</span></div>
      <div><strong>{{ quakes.length }}</strong><span>服务器保存的地震记录</span></div>
      <p>天象是预测，需按所在地核对；季节条目是观察建议。地震只展示已发生的事件，绝不预测。</p>
    </div>

    <section class="calendar-board" aria-labelledby="calendar-heading">
      <div class="calendar-toolbar">
        <div>
          <span class="calendar-section-index">01 / MONTH VIEW</span>
          <h2 id="calendar-heading">{{ selectedYear }} 年 {{ selectedMonth }} 月</h2>
          <p>{{ monthSummary }}</p>
        </div>
        <div class="calendar-controls">
          <button type="button" class="today-button" @click="goToday">回到本月</button>
          <button type="button" aria-label="上个月" :disabled="monthOffset <= -1" @click="monthOffset--">‹</button>
          <button type="button" aria-label="下个月" :disabled="monthOffset >= 11" @click="monthOffset++">›</button>
        </div>
      </div>

      <div class="calendar-tabs" role="group" aria-label="筛选事件类型">
        <button v-for="option in filters" :key="option.value" type="button" :class="[`tab-${option.value}`, { active: filter === option.value }]" :aria-pressed="filter === option.value" @click="filter = option.value"><span class="tab-icon" aria-hidden="true">{{ option.icon }}</span>{{ option.label }}<small>{{ categoryCount(option.value) }}</small></button>
      </div>

      <div class="calendar-layout">
        <div class="calendar-grid-wrap">
          <div v-if="monthSeason" class="season-band"><span class="season-band-label">本月的地理故事 · 整月观察</span><strong>{{ monthSeason.title }}</strong><p>{{ monthSeason.story }}</p></div>
          <FullCalendar ref="calendarRef" :options="calendarOptions">
            <template #eventContent="arg"><span class="calendar-event-label"><i :class="`marker-${arg.event.extendedProps.type}`" aria-hidden="true"></i><span>{{ arg.event.title }}</span></span></template>
          </FullCalendar>
          <div class="calendar-legend"><span><i class="marker-astronomy"></i> 天象预测</span><span><i class="marker-earthquake"></i> 地震实录</span><span><i class="marker-season"></i> 季节观察</span></div>
        </div>

        <aside class="calendar-details" aria-live="polite">
          <span class="calendar-section-index">02 / EVENT NOTES</span>
          <h3>{{ selectedDateLabel }}</h3>
          <p class="details-caption">{{ selectedDayEvents.length ? '读一则短故事，再核对事实与来源' : monthSeason ? '这一天没有具体事件。可读本月的观察故事。' : '这一天没有该类别的事件，请选择其他日期。' }}</p>
          <article v-for="event in selectedDayEvents" :key="event.id" class="event-card" :class="`event-${event.type}`">
            <div class="event-card-top"><span>{{ typeLabel(event.type) }}</span><small>{{ event.status }}</small></div>
            <h4>{{ event.title }}</h4>
            <span class="story-label">一则地理小故事</span>
            <p class="event-story">{{ event.story }}</p>
            <p class="event-fact">观察提示：{{ event.description }}</p>
            <div class="event-meta"><span>{{ event.time ? `${event.time} · ` : '' }}{{ event.region }}</span></div>
            <a v-if="event.sourceUrl" :href="event.sourceUrl" target="_blank" rel="noopener noreferrer">查看来源 · {{ event.sourceName }} ↗</a>
            <span v-else class="source-note">{{ event.sourceName }}</span>
          </article>
          <div v-if="!selectedDayEvents.length && monthSeason" class="season-placeholder"><span>本月观察</span><h4>{{ monthSeason.title }}</h4><p>{{ monthSeason.story }}</p><p>{{ monthSeason.description }}</p></div>
        </aside>
      </div>
    </section>

    <section class="calendar-bottom">
      <div><span class="calendar-section-index">03 / LIVE RECORD</span><h2>地震记录</h2><p>服务器每小时尝试同步一次 USGS 最近 30 天的 M4.5+ 地震，保留最多约一年。仅收录其地名标为中国相关地区的记录；这不是严格国界判定，震级、位置也可能修订。</p><p class="sync-state">{{ syncStatus }}</p></div>
      <div class="recent-list"><div v-if="!quakes.length" class="empty-record">{{ loading ? '正在读取服务器记录…' : '当前没有可显示的记录。' }}</div><a v-for="quake in quakes.slice(0, 5)" :key="quake.id" :href="quake.sourceUrl" target="_blank" rel="noopener noreferrer"><time>{{ quake.date }}</time><strong>{{ quake.title }}</strong><span>↗</span></a></div>
    </section>
    <p class="calendar-footnote">数据用途：地理教学与观察规划。灾害信息请以有关部门的正式发布为准；本页不提供预警。<a href="https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php" target="_blank" rel="noopener noreferrer">USGS 数据说明 ↗</a></p>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import zhCnLocale from '@fullcalendar/core/locales/zh-cn'
import { accountEnabled, accountOrigin } from '../account/config.js'
import { astronomyEvents, normalizeQuakes, seasonalEvents, toChinaDate } from './events.js'

const todayKey = toChinaDate(Date.now())
const [todayYear, todayMonth] = todayKey.split('-').map(Number)
const filters = [{ value: 'all', label: '全部合并', icon: '◫' }, { value: 'astronomy', label: '天象', icon: '✦' }, { value: 'earthquake', label: '地震', icon: '◈' }, { value: 'season', label: '季节观察', icon: '❧' }]
const monthOffset = ref(0)
const filter = ref('all')
const selectedDate = ref(todayKey)
const calendarRef = ref(null)
const quakes = ref([])
const loading = ref(true)
const syncStatus = ref('正在连接服务器…')
const monthDate = computed(() => new Date(Date.UTC(todayYear, todayMonth - 1 + monthOffset.value, 1)))
const selectedYear = computed(() => monthDate.value.getUTCFullYear())
const selectedMonth = computed(() => monthDate.value.getUTCMonth() + 1)
const monthPrefix = computed(() => `${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}`)
const allEvents = computed(() => [...astronomyEvents, ...seasonalEvents(selectedYear.value), ...quakes.value])
const visibleEvents = computed(() => allEvents.value.filter(event => filter.value === 'all' || event.type === filter.value))
const monthEvents = computed(() => visibleEvents.value.filter(event => event.date.startsWith(monthPrefix.value)))
const monthSeason = computed(() => monthEvents.value.find(event => event.type === 'season'))
const selectedDayEvents = computed(() => monthEvents.value
  .filter(event => event.date === selectedDate.value && !event.wholeMonth)
  .concat(selectedDate.value.startsWith(monthPrefix.value) && monthSeason.value ? [monthSeason.value] : []))
const selectedDateLabel = computed(() => `${selectedMonth.value} 月 ${Number(selectedDate.value.slice(-2))} 日`)
const monthSummary = computed(() => filter.value === 'season'
  ? '1 个整月观察主题 · 点击日期阅读故事'
  : `${monthEvents.value.filter(event => !event.wholeMonth).length} 条日期事件 · ${monthSeason.value ? '含本月观察主题' : '按类型筛选查看'}`)
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  initialDate: todayKey,
  headerToolbar: false,
  firstDay: 1,
  locale: zhCnLocale,
  height: 'auto',
  fixedWeekCount: false,
  showNonCurrentDates: false,
  dayMaxEvents: 2,
  dayCellClassNames: ({ date }) => {
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    return dateKey === selectedDate.value ? ['fc-geo-selected'] : []
  },
  events: monthEvents.value.filter(event => !event.wholeMonth).map(event => ({
    id: event.id,
    title: event.title,
    start: event.date,
    allDay: true,
    classNames: [`fc-geo-${event.type}`],
    extendedProps: { type: event.type }
  })),
  dateClick: ({ dateStr }) => { selectedDate.value = dateStr },
  eventClick: ({ event, jsEvent }) => { jsEvent.preventDefault(); selectedDate.value = event.startStr.slice(0, 10) }
}))

function categoryCount(type) { return type === 'season' ? Number(Boolean(seasonalEvents(selectedYear.value).find(event => event.date.startsWith(monthPrefix.value)))) : allEvents.value.filter(event => event.date.startsWith(monthPrefix.value) && !event.wholeMonth && (type === 'all' || event.type === type)).length }
function typeLabel(type) { return { astronomy: '天象', earthquake: '地震', season: '季节观察' }[type] }
function goToday() { monthOffset.value = 0; selectedDate.value = todayKey }
watch(monthPrefix, prefix => { selectedDate.value = `${prefix}-01`; calendarRef.value?.getApi()?.gotoDate(`${prefix}-01`) })

onMounted(async () => {
  if (!accountEnabled) { syncStatus.value = '服务器地址未配置，地震记录暂不可用。'; loading.value = false; return }
  try {
    const response = await fetch(`${accountOrigin}/api/geo-events`, { signal: AbortSignal.timeout(15000) })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    quakes.value = normalizeQuakes(data)
    syncStatus.value = data.fetchedAt ? `上次同步：${new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(data.fetchedAt))}${data.refreshError ? ' · 本次更新失败，显示已保存数据' : ''}` : '尚未完成首次同步。'
  } catch { syncStatus.value = '服务器暂不可用，天象和季节观察仍可浏览。' }
  finally { loading.value = false }
})
</script>

<style scoped>
.geo-calendar{max-width:1440px;margin:auto;padding:0 28px 80px;color:#18333c}
.calendar-hero{min-height:400px;padding:72px clamp(28px,6vw,90px);display:flex;justify-content:space-between;align-items:center;gap:30px;background:radial-gradient(circle at 78% 40%,#274c54 0,#183a44 31%,#102c37 72%);color:#f4f1e8;overflow:hidden;position:relative;border-radius:0 0 24px 24px}
.calendar-hero-copy{position:relative;z-index:1}
.calendar-eyebrow,.calendar-section-index{font:700 11px/1.3 ui-monospace,SFMono-Regular,monospace;letter-spacing:.18em;color:#91b6b7}
.calendar-hero h1{font:400 clamp(42px,5vw,76px)/1.15 Georgia,'Noto Serif SC',serif;letter-spacing:-.045em;margin:24px 0;color:#f4f1e8}
.calendar-hero h1 em{font-style:normal;color:#bddcaa}
.calendar-hero p{font-size:16px;color:#c9d6d3;line-height:1.8;max-width:580px}
.calendar-hero-tags{display:flex;flex-wrap:wrap;gap:10px;margin-top:30px}
.calendar-hero-tags span{border:1px solid #688389;border-radius:99px;padding:7px 13px;font-size:12px;color:#dce7e1}
.calendar-orbit{width:300px;height:300px;min-width:300px;position:relative;display:grid;place-items:center}
.orbit-ring{position:absolute;border:1px solid #73969a;border-radius:50%;transform:rotate(-24deg)}
.ring-one{width:250px;height:250px}
.ring-two{width:320px;height:160px}
.orbit-earth{font-size:125px;color:#b8d0b2;text-shadow:0 0 70px #8bb1a5}
.orbit-caption{position:absolute;bottom:0;right:0;font:11px ui-monospace,monospace;letter-spacing:.12em;color:#a8c6c4}
.calendar-intro{display:grid;grid-template-columns:repeat(3,1fr) 2fr;gap:20px;align-items:center;padding:27px 36px;border:1px solid #d9e0d8;border-top:0;border-radius:0 0 16px 16px;background:#fff}
.calendar-intro div{display:grid;gap:4px;border-right:1px solid #e3e8e0}
.calendar-intro strong{font:400 29px Georgia,serif;color:#183b44}
.calendar-intro span{font-size:12px;color:#647980}
.calendar-intro p{font-size:12px;line-height:1.8;color:#62767a;margin:0}
.calendar-board{margin-top:56px}
.calendar-toolbar{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:26px}
.calendar-toolbar h2,.calendar-bottom h2{font:400 37px/1.2 Georgia,'Noto Serif SC',serif;margin:9px 0;color:#173d45}
.calendar-toolbar p{margin:0;color:#718286;font-size:13px}
.calendar-controls{display:flex;gap:8px}
.calendar-controls button,.calendar-tabs button{border:1px solid #ccd8d3;background:white;color:#2e5257;cursor:pointer;border-radius:9px}
.calendar-controls button{min-width:38px;height:38px;font-size:20px}
.calendar-controls .today-button{font-size:12px;padding:0 14px}
.calendar-controls button:disabled{opacity:.35;cursor:default}
.calendar-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px}
.calendar-tabs button{padding:10px 15px;font-size:13px;font-weight:700;display:inline-flex;align-items:center;gap:8px;transition:transform .18s,box-shadow .18s}
.calendar-tabs button:hover{transform:translateY(-2px)}
.calendar-tabs button small{font:700 11px ui-monospace,monospace;border-radius:99px;padding:2px 6px;background:#ffffff8c}
.calendar-tabs .tab-icon{font-size:16px;line-height:1}
.calendar-tabs .tab-all{background:#edf2f0;border-color:#c6d5d0;color:#2d5352}
.calendar-tabs .tab-astronomy{background:#e5eff8;border-color:#b6d0e5;color:#245d88}
.calendar-tabs .tab-earthquake{background:#f9e9e4;border-color:#e7bfb2;color:#a34f3f}
.calendar-tabs .tab-season{background:#e7f2e6;border-color:#b7d3b1;color:#37724d}
.calendar-tabs .tab-all.active{background:#244b50;color:#fff;border-color:#244b50}
.calendar-tabs .tab-astronomy.active{background:#2872aa;color:#fff;border-color:#2872aa}
.calendar-tabs .tab-earthquake.active{background:#b65a47;color:#fff;border-color:#b65a47}
.calendar-tabs .tab-season.active{background:#4d8760;color:#fff;border-color:#4d8760}
.calendar-tabs button.active{box-shadow:0 5px 15px #122f3424}
.calendar-layout{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(280px,.8fr);gap:18px}
.calendar-grid-wrap,.calendar-details{background:#fff;border:1px solid #dce5de;border-radius:16px;overflow:hidden}
.season-band{margin:18px;padding:17px 19px;background:#edf5eb;border:1px solid #d5e5d1;border-left:4px solid #5b9165;border-radius:10px}
.season-band-label{display:block;font:700 10px ui-monospace,monospace;letter-spacing:.13em;color:#50815e;margin-bottom:5px}
.season-band strong{font-size:15px;color:#315f3d}
.season-band p{font-size:12px;line-height:1.7;color:#597264;margin:6px 0 0}
.calendar-grid-wrap :deep(.fc){--fc-border-color:#e1e9e3;--fc-today-bg-color:#f0f6ed;font-size:12px;margin:0 18px}
.calendar-grid-wrap :deep(.fc-scrollgrid){border-radius:10px;overflow:hidden}
.calendar-grid-wrap :deep(.fc-col-header-cell){background:#f2f6f1;padding:9px 0;color:#65817a}
.calendar-grid-wrap :deep(.fc-daygrid-day){height:104px;cursor:pointer}
.calendar-grid-wrap :deep(.fc-daygrid-day:hover){background:#f7faf5}
.calendar-grid-wrap :deep(.fc-daygrid-day-number){font:600 13px Georgia,serif;color:#355b5e;padding:8px}
.calendar-grid-wrap :deep(.fc-geo-selected){box-shadow:inset 0 0 0 2px #3e786d;background:#e9f3e9}
.calendar-grid-wrap :deep(.fc-day-today .fc-daygrid-day-number){background:#244f54;color:#fff;border-radius:50%;margin:4px;padding:4px 8px}
.calendar-grid-wrap :deep(.fc-event){border:0;border-radius:5px;margin:2px 4px;padding:3px 5px;cursor:pointer}
.calendar-grid-wrap :deep(.fc-geo-astronomy){background:#dfebf7;color:#225d88}
.calendar-grid-wrap :deep(.fc-geo-earthquake){background:#f7e5df;color:#984938}
.calendar-event-label{display:flex;align-items:center;gap:5px;min-width:0;font-size:10px;line-height:1.3;font-weight:700}
.calendar-event-label span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.calendar-event-label i,.calendar-legend i{width:7px;height:7px;border-radius:50%;display:inline-block;flex:none}
.marker-astronomy{background:#3479ab}
.marker-earthquake{background:#c0634f}
.marker-season{background:#5d976a}
.calendar-legend{display:flex;gap:18px;flex-wrap:wrap;padding:16px 18px;color:#71837e;font-size:11px}
.calendar-legend span{display:flex;align-items:center;gap:6px}
.calendar-details{padding:28px;max-height:750px;overflow:auto}
.calendar-details h3{font:400 27px Georgia,serif;margin:9px 0}
.details-caption{font-size:12px;color:#728581;line-height:1.7;margin-bottom:22px}
.event-card{padding:18px;border-radius:12px;background:#f3f6f3;margin-bottom:13px;border-left:3px solid #819f80}
.event-astronomy{border-color:#5594bd;background:#f0f6fb}
.event-earthquake{border-color:#be685c;background:#fcf4f1}
.event-card-top{display:flex;justify-content:space-between;color:#586f6c;font-size:11px}
.event-card-top small{font-size:10px;border:1px solid #c6d0c8;padding:3px 7px;border-radius:99px}
.event-card h4,.season-placeholder h4{margin:13px 0 8px;font-size:17px;color:#25434a}
.event-card p,.season-placeholder p{font-size:12px;line-height:1.8;color:#58706e;margin:0 0 13px}
.story-label{display:block;font:700 10px ui-monospace,monospace;color:#6b8675;letter-spacing:.12em;margin:15px 0 5px}
.event-card .event-story{font-size:14px;line-height:1.9;color:#294b50}
.event-card .event-fact{border-top:1px solid #d8e2db;padding-top:10px;font-size:11px}
.event-meta{font-size:11px;color:#7c8b86;margin:11px 0}
.event-card a,.calendar-footnote a{color:#3d6c77;font-size:11px;text-decoration:underline;text-underline-offset:3px}
.source-note{font-size:11px;color:#7c8b86}
.season-placeholder{padding:20px;border:1px dashed #b8cab7;border-radius:12px}
.season-placeholder span{font-size:11px;color:#759179}
.calendar-bottom{display:grid;grid-template-columns:1fr 1.4fr;gap:48px;margin-top:65px;padding:34px 0;border-top:1px solid #dbe5dd;border-bottom:1px solid #dbe5dd}
.calendar-bottom p{font-size:12px;line-height:1.9;color:#69807e;max-width:440px}
.calendar-bottom .sync-state{color:#426a73}
.recent-list{align-self:center}
.recent-list a{display:grid;grid-template-columns:100px 1fr 20px;gap:12px;align-items:center;padding:13px;border-bottom:1px solid #e3eae5;text-decoration:none;color:#33545b;font-size:12px}
.recent-list a:hover{background:#f2f6f2}
.recent-list strong{font-weight:500}
.recent-list time,.recent-list span{color:#839490}
.empty-record{padding:30px;color:#80918c;font-size:13px}
.calendar-footnote{font-size:11px;color:#7a8c88;line-height:1.8;margin:25px 0}
@media(max-width:900px){.calendar-orbit{display:none}
.calendar-intro{grid-template-columns:repeat(3,1fr)}
.calendar-intro p{grid-column:1/-1}
.calendar-layout{grid-template-columns:1fr}
.calendar-details{max-height:none}
.calendar-bottom{grid-template-columns:1fr;gap:10px}
}
@media(max-width:600px){.geo-calendar{padding:0 14px 50px}
.calendar-hero{padding:52px 25px;min-height:350px}
.calendar-hero h1{font-size:41px}
.calendar-intro{gap:10px;padding:20px 13px}
.calendar-intro strong{font-size:20px}
.calendar-intro span{font-size:10px}
.calendar-toolbar{align-items:start}
.calendar-toolbar h2{font-size:29px}
.calendar-controls{flex-wrap:wrap;justify-content:end}
.calendar-grid-wrap :deep(.fc){margin:0 8px}
.calendar-grid-wrap :deep(.fc-daygrid-day){height:72px}
.calendar-event-label span{max-width:62px}
.calendar-details{padding:20px}
.calendar-legend{gap:10px}
.recent-list a{grid-template-columns:78px 1fr 12px;font-size:11px;padding:12px 3px}
}

</style>
