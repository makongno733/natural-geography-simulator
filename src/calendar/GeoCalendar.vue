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
.geo-calendar{max-width:1440px;margin:auto;padding:0 28px 80px;color:var(--text)}
.calendar-hero{min-height:380px;padding:64px clamp(28px,6vw,84px);display:flex;justify-content:space-between;align-items:center;gap:30px;background:radial-gradient(circle at 78% 40%, #1e4250 0, #102d38 40%, #06151f 100%);color:#f4f1e8;overflow:hidden;position:relative;border-radius:0 0 24px 24px}
.calendar-hero-copy{position:relative;z-index:1}
.calendar-eyebrow,.calendar-section-index{font:700 11px/1.3 ui-monospace,SFMono-Regular,monospace;letter-spacing:.18em;color:#91b6b7}
.calendar-hero h1{font-size:clamp(38px,5vw,68px);line-height:1.15;letter-spacing:-.035em;margin:20px 0;color:#f4f1e8;font-weight:700}
.calendar-hero h1 em{font-style:normal;color:#c2e2af}
.calendar-hero p{font-size:16px;color:#c9d6d3;line-height:1.8;max-width:580px}
.calendar-hero-tags{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px}
.calendar-hero-tags span{border:1px solid rgba(255,255,255,0.3);border-radius:var(--radius-pill);padding:6px 14px;font-size:12px;color:#dce7e1;background:rgba(255,255,255,0.06);backdrop-filter:blur(6px)}
.calendar-orbit{width:300px;height:300px;min-width:300px;position:relative;display:grid;place-items:center}
.orbit-ring{position:absolute;border:1px solid rgba(115,150,154,0.6);border-radius:50%;transform:rotate(-24deg)}
.ring-one{width:250px;height:250px}
.ring-two{width:320px;height:160px}
.orbit-earth{font-size:120px;color:#b8d0b2;text-shadow:0 0 70px #8bb1a5}
.orbit-caption{position:absolute;bottom:0;right:0;font:11px ui-monospace,monospace;letter-spacing:.12em;color:#a8c6c4}
.calendar-intro{display:grid;grid-template-columns:repeat(3,1fr) 2fr;gap:20px;align-items:center;padding:26px 36px;border:1px solid var(--border);border-top:0;border-radius:0 0 var(--radius-box) var(--radius-box);background:var(--surface);box-shadow:var(--shadow-xs)}
.calendar-intro div{display:grid;gap:4px;border-right:1px solid var(--border)}
.calendar-intro strong{font-size:28px;font-weight:700;color:var(--geo-ocean-deep);font-variant-numeric:tabular-nums}
.calendar-intro span{font-size:12.5px;color:var(--text-muted)}
.calendar-intro p{font-size:12.5px;line-height:1.8;color:var(--text-muted);margin:0}
.calendar-board{margin-top:52px}
.calendar-toolbar{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:24px}
.calendar-toolbar h2,.calendar-bottom h2{font-size:clamp(28px,3vw,36px);line-height:1.2;font-weight:800;letter-spacing:-0.02em;margin:8px 0;color:var(--geo-ocean-deep)}
.calendar-toolbar p{margin:0;color:var(--text-muted);font-size:14px}
.calendar-controls{display:flex;gap:8px}
.calendar-controls button{border:1px solid var(--border);background:var(--surface);color:var(--geo-ocean);cursor:pointer;border-radius:var(--radius-pill);min-width:38px;height:38px;font-size:20px;font-weight:700;transition:var(--geo-btn-transition);box-shadow:var(--shadow-xs)}
.calendar-controls button:hover:not(:disabled){border-color:var(--geo-ocean);background:var(--geo-ocean-surface);transform:var(--geo-btn-elevate)}
.calendar-controls .today-button{font-size:12.5px;padding:0 16px}
.calendar-controls button:disabled{opacity:.35;cursor:not-allowed}
.calendar-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}
.calendar-tabs button{padding:9px 16px;font-size:13px;font-weight:700;display:inline-flex;align-items:center;gap:8px;border-radius:var(--radius-pill);border:1px solid var(--border);background:var(--surface);color:var(--text-muted);cursor:pointer;transition:var(--geo-btn-transition);box-shadow:var(--shadow-xs)}
.calendar-tabs button:hover{transform:var(--geo-btn-elevate);border-color:var(--geo-ocean);color:var(--geo-ocean)}
.calendar-tabs button small{font:700 11px ui-monospace,monospace;border-radius:var(--radius-pill);padding:2px 7px;background:rgba(0,0,0,0.06)}
.calendar-tabs .tab-icon{font-size:15px;line-height:1}
.calendar-tabs .tab-all.active{background:var(--geo-ocean);color:#fff;border-color:var(--geo-ocean);box-shadow:var(--geo-btn-primary-shadow)}
.calendar-tabs .tab-astronomy.active{background:var(--geo-ocean-medium);color:#fff;border-color:var(--geo-ocean-medium);box-shadow:0 3px 12px rgba(36,93,146,0.28)}
.calendar-tabs .tab-earthquake.active{background:var(--geo-terracotta);color:#fff;border-color:var(--geo-terracotta);box-shadow:0 3px 12px rgba(200,100,70,0.3)}
.calendar-tabs .tab-season.active{background:var(--geo-green);color:#fff;border-color:var(--geo-green);box-shadow:0 3px 12px rgba(45,106,79,0.3)}
.calendar-layout{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(280px,.8fr);gap:20px}
.calendar-grid-wrap,.calendar-details{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-box);box-shadow:var(--shadow-sm);overflow:hidden}
.season-band{margin:18px;padding:16px 20px;background:var(--bg-soft);border:1px solid var(--border);border-left:4px solid var(--geo-green);border-radius:var(--radius-sm)}
.season-band-label{display:block;font:700 10.5px ui-monospace,monospace;letter-spacing:.12em;color:var(--geo-green);margin-bottom:6px}
.season-band strong{font-size:16px;color:var(--geo-green-deep)}
.season-band p{font-size:13px;line-height:1.75;color:var(--text-muted);margin:6px 0 0}
.calendar-grid-wrap :deep(.fc){--fc-border-color:var(--border);--fc-today-bg-color:var(--geo-ocean-surface);font-size:12.5px;margin:0 18px}
.calendar-grid-wrap :deep(.fc-scrollgrid){border-radius:var(--radius-sm);overflow:hidden}
.calendar-grid-wrap :deep(.fc-col-header-cell){background:var(--bg-soft);padding:10px 0;color:var(--text-muted);font-weight:700}
.calendar-grid-wrap :deep(.fc-daygrid-day){height:104px;cursor:pointer}
.calendar-grid-wrap :deep(.fc-daygrid-day:hover){background:var(--bg-soft)}
.calendar-grid-wrap :deep(.fc-daygrid-day-number){font:600 13px ui-monospace,SFMono-Regular,monospace;color:var(--geo-ocean-deep);padding:8px}
.calendar-grid-wrap :deep(.fc-geo-selected){box-shadow:inset 0 0 0 2px var(--geo-ocean);background:var(--geo-ocean-surface)}
.calendar-grid-wrap :deep(.fc-day-today .fc-daygrid-day-number){background:var(--geo-ocean);color:#fff;border-radius:50%;margin:4px;padding:4px 8px}
.calendar-grid-wrap :deep(.fc-event){border:0;border-radius:4px;margin:2px 4px;padding:3px 6px;cursor:pointer}
.calendar-grid-wrap :deep(.fc-geo-astronomy){background:#e6f0fa;color:var(--geo-ocean)}
.calendar-grid-wrap :deep(.fc-geo-earthquake){background:#fbeee9;color:var(--geo-terracotta)}
.calendar-event-label{display:flex;align-items:center;gap:5px;min-width:0;font-size:11px;line-height:1.3;font-weight:700}
.calendar-event-label span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.calendar-event-label i,.calendar-legend i{width:7px;height:7px;border-radius:50%;display:inline-block;flex:none}
.marker-astronomy{background:var(--geo-ocean)}
.marker-earthquake{background:var(--geo-terracotta)}
.marker-season{background:var(--geo-green)}
.calendar-legend{display:flex;gap:20px;flex-wrap:wrap;padding:16px 20px;color:var(--text-muted);font-size:12px;border-top:1px solid var(--border)}
.calendar-legend span{display:flex;align-items:center;gap:6px}
.calendar-details{padding:28px;max-height:750px;overflow:auto}
.calendar-details h3{font-size:24px;font-weight:700;color:var(--geo-ocean-deep);margin:8px 0}
.details-caption{font-size:13px;color:var(--text-muted);line-height:1.7;margin-bottom:22px}
.event-card{padding:18px 20px;border-radius:var(--radius-card);background:var(--bg-soft);margin-bottom:14px;border:1px solid var(--border);border-left:4px solid var(--geo-ocean);box-shadow:var(--shadow-xs)}
.event-astronomy{border-left-color:var(--geo-ocean-medium);background:#f2f7fc}
.event-earthquake{border-left-color:var(--geo-terracotta);background:#fcf5f3}
.event-season{border-left-color:var(--geo-green);background:#f3f9f4}
.event-card-top{display:flex;justify-content:space-between;color:var(--text-muted);font-size:11.5px;font-weight:600}
.event-card-top small{font-size:10px;border:1px solid var(--border);padding:2px 8px;border-radius:var(--radius-pill);background:var(--surface)}
.event-card h4,.season-placeholder h4{margin:12px 0 8px;font-size:17px;font-weight:700;color:var(--geo-ocean-deep)}
.event-card p,.season-placeholder p{font-size:13px;line-height:1.8;color:var(--text);margin:0 0 12px}
.story-label{display:block;font:700 10.5px ui-monospace,monospace;color:var(--geo-ocean);letter-spacing:.12em;margin:14px 0 4px}
.event-card .event-story{font-size:14px;line-height:1.85;color:var(--geo-ocean-deep)}
.event-card .event-fact{border-top:1px solid var(--border);padding-top:10px;font-size:12px;color:var(--text-muted)}
.event-meta{font-size:12px;color:var(--text-faint);margin:10px 0}
.event-card a,.calendar-footnote a{color:var(--geo-ocean);font-size:12px;text-decoration:underline;text-underline-offset:3px}
.source-note{font-size:11px;color:var(--text-faint)}
.season-placeholder{padding:20px;border:1px dashed var(--border-strong);border-radius:var(--radius-card);background:var(--bg-soft)}
.season-placeholder span{font-size:11.5px;color:var(--geo-green);font-weight:600}
.calendar-bottom{display:grid;grid-template-columns:1fr 1.4fr;gap:48px;margin-top:64px;padding:36px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.calendar-bottom p{font-size:13px;line-height:1.85;color:var(--text-muted);max-width:440px}
.calendar-bottom .sync-state{color:var(--geo-ocean);font-weight:600}
.recent-list{align-self:center}
.recent-list a{display:grid;grid-template-columns:110px 1fr 20px;gap:14px;align-items:center;padding:14px;border-bottom:1px solid var(--border);border-radius:var(--radius-sm);text-decoration:none;color:var(--text);font-size:13px;transition:var(--geo-btn-transition)}
.recent-list a:hover{background:var(--geo-ocean-surface);color:var(--geo-ocean)}
.recent-list strong{font-weight:600}
.recent-list time,.recent-list span{color:var(--text-faint);font-family:ui-monospace,SFMono-Regular,monospace}
.empty-record{padding:30px;color:var(--text-muted);font-size:13px}
.calendar-footnote{font-size:12px;color:var(--text-faint);line-height:1.8;margin:24px 0}
@media(max-width:900px){
  .calendar-orbit{display:none}
  .calendar-intro{grid-template-columns:repeat(3,1fr)}
  .calendar-intro p{grid-column:1/-1}
  .calendar-layout{grid-template-columns:1fr}
  .calendar-details{max-height:none}
  .calendar-bottom{grid-template-columns:1fr;gap:20px}
}
@media(max-width:600px){
  .geo-calendar{padding:0 14px 50px}
  .calendar-hero{padding:48px 20px;min-height:340px}
  .calendar-hero h1{font-size:36px}
  .calendar-intro{gap:10px;padding:18px 14px}
  .calendar-intro strong{font-size:22px}
  .calendar-intro span{font-size:11px}
  .calendar-toolbar{align-items:start}
  .calendar-toolbar h2{font-size:26px}
  .calendar-controls{flex-wrap:wrap;justify-content:end}
  .calendar-grid-wrap :deep(.fc){margin:0 8px}
  .calendar-grid-wrap :deep(.fc-daygrid-day){height:72px}
  .calendar-event-label span{max-width:62px}
  .calendar-details{padding:18px}
  .calendar-legend{gap:12px}
  .recent-list a{grid-template-columns:85px 1fr 12px;font-size:12px;padding:12px 6px}
}
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
