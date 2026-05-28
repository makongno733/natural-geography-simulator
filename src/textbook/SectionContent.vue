<template>
  <div class="page-shell" v-if="sectionData">
    <div class="breadcrumb">
      <router-link to="/">首页</router-link>
      <span class="sep">></span>
      <router-link :to="'/' + gradeId">{{ gradeId }}</router-link>
      <span class="sep">></span>
      <router-link :to="'/' + gradeId + '/' + bookId">{{ bookId }}</router-link>
      <span class="sep">></span>
      <span>{{ chapterId }} {{ chapterData.title }}</span>
      <span class="sep">></span>
      <span>{{ sectionId }}</span>
    </div>

    <!-- 3D 沙盘切换（第四章地貌专用） -->
    <div v-if="isLandformChapter" class="sandbox-toggle-bar">
      <button
        :class="['sandbox-toggle', { active: !showSandbox }]"
        @click="showSandbox = false"
      >📖 课文</button>
      <button
        :class="['sandbox-toggle', { active: showSandbox }]"
        @click="showSandbox = true"
      >🏔 3D 沙盘</button>
    </div>

    <!-- 3D 地球切换（第一章宇宙中的地球专用） -->
    <div v-if="isEarthChapter" class="sandbox-toggle-bar">
      <button
        :class="['sandbox-toggle', { active: !showEarth3D }]"
        @click="showEarth3D = false"
      >📖 课文</button>
      <button
        :class="['sandbox-toggle', { active: showEarth3D }]"
        @click="showEarth3D = true"
      >🌍 3D 地球探索</button>
    </div>

    <!-- 3D 土壤剖面切换（第五章植被与土壤专用） -->
    <div v-if="isSoilChapter" class="sandbox-toggle-bar">
      <button
        :class="['sandbox-toggle', { active: !showSoilProfile }]"
        @click="showSoilProfile = false"
      >📖 课文</button>
      <button
        :class="['sandbox-toggle', { active: showSoilProfile }]"
        @click="showSoilProfile = true"
      >🧪 3D 土壤剖面</button>
    </div>

    <!-- 3D 灾害模拟（第六章自然灾害专用） -->
    <div v-if="isDisasterChapter" class="sandbox-toggle-bar">
      <button class="sandbox-toggle active">📖 课文</button>
      <router-link to="/disasters" class="sandbox-toggle">🌀 3D 灾害模拟</router-link>
    </div>

    <!-- 3D 大气模型切换（第二章地球上的大气专用） -->
    <div v-if="isAtmoChapter" class="sandbox-toggle-bar">
      <button
        :class="['sandbox-toggle', { active: !showAtmo }]"
        @click="showAtmo = false"
      >📖 课文</button>
      <button
        :class="['sandbox-toggle', { active: showAtmo }]"
        @click="showAtmo = true"
      >🌍 3D 大气模型</button>
    </div>

    <!-- 3D 水循环切换（第三章地球上的水专用） -->
    <div v-if="isWaterChapter" class="sandbox-toggle-bar">
      <button
        :class="['sandbox-toggle', { active: !showWater }]"
        @click="showWater = false"
      >📖 课文</button>
      <button
        :class="['sandbox-toggle', { active: showWater }]"
        @click="showWater = true"
      >💧 3D 水循环</button>
    </div>

    <template v-if="!showSandbox && !showEarth3D && !showSoilProfile && !showAtmo && !showWater">
    <div class="content-layout">
      <aside class="sidebar">
        <h3 class="sidebar-title">{{ chapterId }} {{ chapterData.title }}</h3>
        <ul class="section-list">
          <li v-for="sec in chapterData.sections" :key="sec.id">
            <router-link
              :to="'/' + gradeId + '/' + bookId + '/' + chapterId + '/' + sec.id"
              :class="{ active: sec.id === sectionId }"
            >
              {{ sec.id }} {{ sec.title }}
            </router-link>
          </li>
        </ul>
      </aside>

      <main class="content">
        <h2 class="section-title">{{ sectionId }} {{ sectionData.title }}</h2>
        <p class="read-time" v-if="estimatedReadMinutes">建议阅读：约 {{ estimatedReadMinutes }} 分钟</p>

        <div v-if="extraContent?.keyPoints?.length || sectionData.content.keyPoints.length" class="key-points">
          <h3 class="block-title">核心知识点</h3>
          <ul>
            <li v-for="(pt, i) in (extraContent?.keyPoints || sectionData.content.keyPoints)" :key="i">{{ pt }}</li>
          </ul>
        </div>

        <!-- 大学深度参考（中学章节→大学对应内容） -->
        <div v-if="collegeRef" class="college-link">
          <span class="college-icon">📖</span>
          <router-link :to="'/' + collegeRef.grade + '/' + collegeRef.book + '/' + collegeRef.chapter + '/' + collegeRef.section">
            大学深度参考：{{ collegeRef.chapter }} {{ collegeRef.chapterTitle }} · {{ collegeRef.section }} {{ collegeRef.sectionTitle }}
          </router-link>
        </div>

        <!-- 中学关联（大学章节→中学对应内容） -->
        <div v-if="sectionData.sourceRef" class="college-link">
          <span class="college-icon">📘</span>
          <router-link :to="'/' + sectionData.sourceRef.grade + '/' + sectionData.sourceRef.book + '/' + sectionData.sourceRef.chapter + '/' + sectionData.sourceRef.section">
            关联中学教材：{{ sectionData.sourceRef.grade }} · {{ sectionData.sourceRef.book }} · {{ sectionData.sourceRef.chapter }} · {{ sectionData.sourceRef.section }}
          </router-link>
        </div>

        <div class="body-text markdown-body" v-html="renderedBody"></div>

        <div class="reserved-slot" v-if="!sectionData.content.interactive">
          <span class="slot-label">3D 互动预留位</span>
        </div>

        <section class="ppt-panel">
          <div class="ppt-head">
            <h3 class="block-title">PPT 课件</h3>
            <span class="picker-tip">请先在主界面点击“选择本地文件夹（全站PPT）”</span>
          </div>

          <p class="ppt-note" v-if="localFolderLoaded">
            已读取本地课件文件夹，将优先匹配当前章节。
          </p>

          <ul v-if="matchedPptResources.length" class="ppt-list">
            <li v-for="item in matchedPptResources" :key="item.id" class="ppt-item">
              <div class="ppt-meta">
                <div class="ppt-title">{{ item.title }}</div>
              <div class="ppt-tags">
                  <span class="ppt-tag">本地</span>
                  <span class="ppt-tag" v-if="item.chapterId">{{ item.chapterId }}</span>
                  <span class="ppt-tag" v-if="item.sectionId">{{ item.sectionId }}</span>
                </div>
              </div>
              <div class="ppt-actions">
                <button class="ppt-btn" @click="previewPpt(item)">预览</button>
                <button class="ppt-btn ghost" @click="downloadLocalPpt(item)">下载</button>
              </div>
            </li>
          </ul>
          <div v-else class="ppt-empty">
            当前章节尚未匹配到课件。可点“选择本地文件夹”导入后自动匹配。
          </div>
        </section>

        <div class="section-nav">
          <router-link
            v-if="prevSection"
            :to="'/' + gradeId + '/' + bookId + '/' + chapterId + '/' + prevSection.id"
            class="nav-link prev"
          >← 上一节</router-link>
          <span v-else></span>
          <router-link
            v-if="nextSection"
            :to="'/' + gradeId + '/' + bookId + '/' + chapterId + '/' + nextSection.id"
            class="nav-link next"
          >下一节 →</router-link>
        </div>
      </main>
    </div>
  </template>

  <!-- 3D 沙盘视图 -->
  <SandboxApp v-else-if="showSandbox" embedded @close="showSandbox = false" />

  <!-- 3D 地球视图 -->
  <Earth3D v-else-if="showEarth3D" />

  <!-- 3D 土壤剖面 -->
  <SoilProfilePage v-else-if="showSoilProfile" />

  <!-- 3D 大气模型视图 -->
  <AtmosphereViewer v-else-if="showAtmo" />

  <!-- 3D 水循环视图 -->
  <WaterCycleView v-else-if="showWater" @close="showWater = false" />

  </div>

  <div v-if="pptPreview.open" class="ppt-preview-mask" @click.self="closePreview">
    <div class="ppt-preview-card">
      <div class="ppt-preview-head">
        <h4>{{ pptPreview.title }}</h4>
        <button class="close-btn" @click="closePreview">关闭</button>
      </div>
      <div class="ppt-canvas-wrap">
        <canvas ref="pptCanvasRef" width="1280" height="720"></canvas>
      </div>
      <div class="ppt-preview-actions">
        <button class="ppt-btn" @click="prevSlide" :disabled="!pptViewerReady">上一页</button>
        <span class="pager">{{ pptPreview.current + 1 }} / {{ pptPreview.total }}</span>
        <button class="ppt-btn" @click="nextSlide" :disabled="!pptViewerReady">下一页</button>
      </div>
      <p v-if="pptPreview.error" class="preview-error">{{ pptPreview.error }}</p>
    </div>
  </div>

  <div v-else class="page-shell not-found">
    <p>未找到该节内容</p>
    <router-link to="/">返回首页</router-link>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import MarkdownIt from 'markdown-it'
import markdownItMultimdTable from 'markdown-it-multimd-table'
import { getSection, getChapter, getCollegeRef } from './data/catalogLoader.js'
import { loadSectionContent } from './data/contentLoader.js'
import { matchPptResources } from './data/pptResources.js'
import { usePptFolderStore } from './data/pptFolderStore.js'
import { normalizeEscapedNewlines, normalizeLectureSection } from './utils/lectureNormalization.js'
import SandboxApp from '../sandbox/SandboxApp.vue'
import Earth3D from '../sandbox/Earth3D.vue'
import SoilProfilePage from '../soil-profile/SoilProfilePage.vue'
import AtmosphereViewer from './components/AtmosphereViewer.vue'
import WaterCycleView from '../engine/WaterCycleView.vue'

const route = useRoute()
const gradeId = computed(() => route.params.grade)
const bookId = computed(() => route.params.book)
const chapterId = computed(() => route.params.chapter)
const sectionId = computed(() => route.params.section)

const showSandbox = ref(false)
const showEarth3D = ref(false)
const showSoilProfile = ref(false)
const showAtmo = ref(false)
const showWater = ref(false)
const isLandformChapter = computed(() =>
  gradeId.value === '高中' && bookId.value === '必修第一册' && chapterId.value === '第四章'
)
const isDisasterChapter = computed(() =>
  gradeId.value === '高中' && bookId.value === '必修第一册' && chapterId.value === '第六章'
)
const isEarthChapter = computed(() =>
  gradeId.value === '高中' && bookId.value === '必修第一册' && chapterId.value === '第一章'
)
const isAtmoChapter = computed(() =>
  gradeId.value === '高中' && bookId.value === '必修第一册' && chapterId.value === '第二章'
)
const isSoilChapter = computed(() =>
  gradeId.value === '高中' && bookId.value === '必修第一册' && chapterId.value === '第五章'
)
const isWaterChapter = computed(() =>
  gradeId.value === '高中' && bookId.value === '必修第一册' && chapterId.value === '第三章'
)

const chapterData = ref(null)
const sectionData = ref(null)
const collegeRef = ref(null)

const loadedContent = ref(null)
const contentReady = ref(false)
const { localPptResources, localFolderLoaded } = usePptFolderStore()

const matchedPptResources = computed(() => {
  const context = {
    grade: gradeId.value,
    book: bookId.value,
    chapterId: chapterId.value,
    sectionId: sectionId.value
  }

  const localMatch = matchPptResources(localPptResources.value, context).items

  const map = new Map()
  for (const item of localMatch) {
    const key = `${item.source}-${item.fileName || item.title}-${item.chapterNum || 0}-${item.sectionNum || 0}`
    if (!map.has(key)) map.set(key, item)
  }
  return Array.from(map.values())
})

const pptCanvasRef = ref(null)
const pptViewer = ref(null)
const pptViewerReady = ref(false)
const pptPreview = ref({
  open: false,
  title: '',
  current: 0,
  total: 1,
  error: ''
})

const extraContent = computed(() => {
  if (!loadedContent.value) return null
  if (gradeId.value === '大学') {
    // Section-level content: has body, keyPoints
    return loadedContent.value
  }
  // Chapter-level content: has fullText, keyPoints
  return loadedContent.value
})

const markdown = new MarkdownIt({
  html: false,
  linkify: false,
  breaks: false,
  typographer: true
})
markdown.use(markdownItMultimdTable, {
  multiline: true,
  rowspan: true,
  headerless: true
})

const sourceBody = computed(() =>
  extraContent.value?.body ||
  extraContent.value?.fullText ||
  sectionData.value?.content?.body ||
  ''
)

const renderedBody = computed(() => markdown.render(toReadableMarkdown(sourceBody.value)))
const estimatedReadMinutes = computed(() => {
  const plain = String(sourceBody.value || '').replace(/[#*`>\\-\\d\\.\\s]/g, '')
  if (!plain) return 0
  // 约240中文字符/分钟，贴近课堂精读节奏
  return Math.max(1, Math.round(plain.length / 240))
})

function toReadableMarkdown(text) {
  const raw = normalizeEscapedNewlines(text)
  if (/^\\s*#{1,3}\\s+/m.test(raw) || /^\\s*[-*]\\s+/m.test(raw) || /^\\s*\\d+\\.\\s+/m.test(raw)) {
    return normalizeLectureSection(raw)
  }
  return normalizeLectureSection(buildMarkdown(cleanOcrLines(raw)))
}

function cleanOcrLines(text) {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .split('\n')
    .map(line => line.replace(/\u3000/g, ' ').replace(/[ \t]+/g, ' ').trim())
    .filter(line => line === '' || !isGarbledLine(line))
}

function isGarbledLine(line) {
  if (!line) return false
  if (/^(图|表)\d|^第[一二三四五六七八九十\d]+[章节]|^[（(]?\d+[）).、]/.test(line)) return false

  const chars = Array.from(line.replace(/\s/g, ''))
  if (chars.length < 3) return false

  const allowed = chars.filter(ch =>
    /[\u3400-\u9fffA-Za-z0-9０-９，。！？；：、“”‘’（）()《》<>·\-—–%％℃°+＝=,.!?;:/]/.test(ch)
  ).length
  const suspicious = chars.length - allowed
  const chinese = chars.filter(ch => /[\u4e00-\u9fff]/.test(ch)).length
  const suspiciousRatio = suspicious / chars.length
  const chineseRatio = chinese / chars.length

  return suspiciousRatio > 0.25 && chineseRatio < 0.55
}

function buildMarkdown(lines) {
  const blocks = []
  let paragraph = ''
  let tableRows = []

  const flush = () => {
    if (!paragraph) return
    blocks.push(paragraph)
    paragraph = ''
  }
  const flushTable = () => {
    if (!tableRows.length) return
    if (tableRows.length >= 2) {
      blocks.push(buildKvTable(tableRows))
    } else {
      const [onlyRow] = tableRows
      blocks.push(`- **${onlyRow.key}**：${onlyRow.value}`)
    }
    tableRows = []
  }

  for (const line of lines) {
    if (!line) {
      flush()
      flushTable()
      continue
    }

    if (isHeading(line)) {
      flush()
      flushTable()
      blocks.push(`## ${line}`)
      continue
    }

    if (isCaption(line)) {
      flush()
      flushTable()
      blocks.push(`> ${line}`)
      continue
    }

    if (isListItem(line)) {
      flush()
      flushTable()
      blocks.push(normalizeListItem(line))
      continue
    }

    const kv = parseKvLine(line)
    if (kv) {
      flush()
      tableRows.push(kv)
      continue
    }

    flushTable()

    paragraph = paragraph ? `${paragraph}${shouldJoin(paragraph, line) ? '' : ' '}${line}` : line
  }

  flush()
  flushTable()
  return blocks.join('\n\n')
}

function parseKvLine(line) {
  const normalized = String(line || '').trim()
  if (!normalized) return null

  const matched = normalized.match(/^([^:：]{1,30})\s*[：:]\s*(.+)$/)
  if (!matched) return null

  const key = matched[1].trim()
  const value = matched[2].trim()

  if (!key || !value) return null
  if (/[。！？.!?]$/.test(key)) return null
  if (!isDataLikeValue(value)) return null

  return { key, value }
}

function buildKvTable(rows) {
  const header = '| 要素 | 内容 |\n| --- | --- |'
  const body = rows
    .map((row) => `| ${escapePipes(row.key)} | ${escapePipes(row.value)} |`)
    .join('\n')
  return `${header}\n${body}`
}

function escapePipes(text) {
  return String(text || '').replace(/\|/g, '\\|')
}

function isDataLikeValue(value) {
  const text = String(value || '').trim()
  if (!text) return false

  // 数据型判定：包含数字/比例/范围/单位等，避免把“定义类句子”转成表格
  if (/\d/.test(text)) return true
  if (/%|％|‰/.test(text)) return true
  if (/[~～\-—−]/.test(text) && /\d/.test(text.replace(/[~～\-—−]/g, ''))) return true
  if (/(℃|°C|K|hPa|Pa|m\/s|m·s-1|mm|cm|km|m²|km²|mg\/m³|μg\/m³|ppm|ppb|DU|年|月|日|小时|分钟|秒)/i.test(text)) return true
  if (/^(高|约|达|为|在)?\s*\d+(\.\d+)?\s*(以上|以下|之间)?$/.test(text)) return true

  return false
}

function isHeading(line) {
  return /^第[一二三四五六七八九十\d]+[章节]/.test(line) ||
    /^(第一节|第二节|第三节|第四节|第五节|第六节|第七节|第八节|第九节|第十节)/.test(line) ||
    /^(活动|思考|案例|自学窗|问题研究|本章要点)$/.test(line)
}

function isCaption(line) {
  return /^(图|表)\d+(\.\d+)?/.test(line)
}

function isListItem(line) {
  return /^([（(]?\d+[）).、]|[①②③④⑤⑥⑦⑧⑨⑩]|[•·])/.test(line)
}

function normalizeListItem(line) {
  return `- ${line.replace(/^[•·]\s*/, '').trim()}`
}

function shouldJoin(prev, next) {
  if (/[。！？；：.!?;:]$/.test(prev)) return false
  if (/^(图|表)\d|^第[一二三四五六七八九十\d]+[章节]/.test(next)) return false
  return true
}


watch([gradeId, bookId, chapterId, sectionId], async () => {
  contentReady.value = false
  loadedContent.value = null

  const [chapter, section, content] = await Promise.all([
    getChapter(gradeId.value, bookId.value, chapterId.value),
    getSection(gradeId.value, bookId.value, chapterId.value, sectionId.value),
    loadSectionContent(gradeId.value, bookId.value, chapterId.value, sectionId.value)
  ])

  chapterData.value = chapter
  sectionData.value = section
  collegeRef.value =
    gradeId.value === '大学'
      ? null
      : await getCollegeRef(gradeId.value, bookId.value, chapterId.value, sectionId.value)

  loadedContent.value = content
  contentReady.value = true
}, { immediate: true })

function downloadLocalPpt(item) {
  if (!item?.file) return
  const objectUrl = URL.createObjectURL(item.file)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = item.fileName || '课件.pptx'
  link.click()
  setTimeout(() => URL.revokeObjectURL(objectUrl), 800)
}

async function previewPpt(item) {
  pptPreview.value = {
    open: true,
    title: item.title || item.fileName || '课件预览',
    current: 0,
    total: 1,
    error: ''
  }
  pptViewerReady.value = false

  await nextTick()

  try {
    await ensurePptRuntime()
    const CanvasViewer = window?.PptxViewJS?.PPTXViewer
    if (!CanvasViewer || !pptCanvasRef.value) {
      throw new Error('viewer-not-ready')
    }

    if (!pptViewer.value) {
      pptViewer.value = new CanvasViewer({
        canvas: pptCanvasRef.value,
        autoExposeGlobals: true
      })
      if (typeof pptViewer.value.on === 'function') {
        pptViewer.value.on('slideChanged', (index) => {
          pptPreview.value.current = index
        })
        pptViewer.value.on('loadComplete', ({ slideCount }) => {
          if (Number.isFinite(slideCount) && slideCount > 0) {
            pptPreview.value.total = slideCount
          }
        })
      }
    }

    const fileObject = await resolvePptFile(item)
    await pptViewer.value.loadFile(fileObject)
    await pptViewer.value.render(pptCanvasRef.value)
    pptViewerReady.value = true
  } catch {
    pptPreview.value.error = '当前浏览器不支持直接预览该PPT，请使用“打开/下载”查看。'
    pptViewerReady.value = false
  }
}

function closePreview() {
  pptPreview.value.open = false
}

async function nextSlide() {
  if (!pptViewer.value || typeof pptViewer.value.nextSlide !== 'function') return
  await pptViewer.value.nextSlide(pptCanvasRef.value)
}

async function prevSlide() {
  if (!pptViewer.value || typeof pptViewer.value.previousSlide !== 'function') return
  await pptViewer.value.previousSlide(pptCanvasRef.value)
}

async function resolvePptFile(item) {
  return item.file
}

async function ensurePptRuntime() {
  if (window?.PptxViewJS?.PPTXViewer) return
  await loadScript('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js')
  await loadScript('https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js')
  await loadScript('https://cdn.jsdelivr.net/npm/pptxviewjs/dist/PptxViewJS.min.js')
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-src=\"${src}\"]`)
    if (existing) {
      if (existing.dataset.loaded === 'true') return resolve()
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error(`load-failed:${src}`)), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.dataset.src = src
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true'
      resolve()
    }, { once: true })
    script.addEventListener('error', () => reject(new Error(`load-failed:${src}`)), { once: true })
    document.head.appendChild(script)
  })
}

const prevSection = computed(() => {
  if (!chapterData.value) return null
  const idx = chapterData.value.sections.findIndex(s => s.id === sectionId.value)
  return idx > 0 ? chapterData.value.sections[idx - 1] : null
})
const nextSection = computed(() => {
  if (!chapterData.value) return null
  const idx = chapterData.value.sections.findIndex(s => s.id === sectionId.value)
  return idx < chapterData.value.sections.length - 1 ? chapterData.value.sections[idx + 1] : null
})
</script>

<style scoped>
.page-shell {
  max-width: 1100px;
  margin: 0 auto;
  padding: 22px 20px 44px;
}
.breadcrumb {
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 20px;
  padding: 7px 12px;
  background: rgba(255,255,255,0.82);
  border-radius: var(--radius-sm);
  border: 1px solid var(--brown-light);
  display: inline-block;
  line-height: 1.6;
}
.breadcrumb a { color: var(--red); text-decoration: none; }
.breadcrumb a:hover { text-decoration: underline; }
.sep { margin: 0 8px; color: var(--brown-dark); }

.content-layout {
  display: grid;
  grid-template-columns: 230px 1fr;
  gap: 18px;
  align-items: start;
}

.sidebar {
  border: 1px solid var(--brown);
  border-radius: var(--radius-box);
  background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,248,238,0.95));
  padding: 14px;
  position: sticky;
  top: 20px;
  box-shadow: var(--shadow-sm);
}
.sidebar-title {
  margin: 0 0 10px;
  font-size: 14px;
  color: var(--red);
  font-weight: 700;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--brown-light);
}
.section-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.section-list li { margin-bottom: 4px; }
.section-list a {
  display: block;
  padding: 7px 10px;
  text-decoration: none;
  color: #6b3b32;
  font-size: 13px;
  border-radius: 6px;
  transition: background var(--transition);
}
.section-list a:hover { background: var(--brown-light); }
.section-list a.active {
  background: var(--red);
  color: #fff;
  font-weight: 600;
}

.content {
  border: 1px solid var(--brown);
  border-radius: var(--radius-box);
  background: rgba(255,255,255,0.97);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}
.section-title {
  margin: 0 0 16px;
  font-size: 20px;
  color: var(--red);
  padding-bottom: 12px;
  border-bottom: 2px solid var(--brown-light);
}
.read-time {
  margin: -8px 0 14px;
  font-size: 12px;
  color: #7a6051;
}
.block-title {
  margin: 0 0 8px;
  font-size: 14px;
  color: var(--muted);
}
.key-points {
  background: linear-gradient(180deg, #fff7e8, #fffdf8);
  border: 1px solid var(--brown);
  border-left: 4px solid var(--red);
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  margin-bottom: 16px;
}
.key-points ul { margin: 0; padding-left: 18px; }
.key-points li { font-size: 14px; line-height: 1.7; color: #333; }
.college-link {
  border: 1px solid var(--brown);
  background: #fff9ef;
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  margin-bottom: 16px;
  font-size: 13px;
}
.college-icon { margin-right: 6px; }
.college-link a {
  color: #8b6914;
  text-decoration: none;
  font-weight: 600;
}
.college-link a:hover { text-decoration: underline; }
.body-text {
  font-size: 15px;
  line-height: 1.92;
  color: #2f201d;
  margin-bottom: 16px;
}
.markdown-body :deep(h2) {
  margin: 22px 0 10px;
  padding-left: 10px;
  border-left: 4px solid var(--red);
  color: var(--red);
  font-size: 18px;
  line-height: 1.5;
}
.markdown-body :deep(p) {
  margin: 0 0 14px;
  text-align: justify;
}
.markdown-body :deep(ol) {
  margin: 8px 0 16px;
  padding-left: 22px;
}
.markdown-body :deep(blockquote) {
  margin: 12px 0;
  padding: 8px 12px;
  border-left: 3px solid var(--brown-dark);
  background: #fff9ef;
  color: var(--muted);
}
.markdown-body :deep(ul) {
  margin: 8px 0 16px;
  padding-left: 22px;
}
.markdown-body :deep(li) {
  margin: 4px 0;
}
.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0 16px;
  font-size: 14px;
}
.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid var(--brown);
  padding: 6px 8px;
  vertical-align: top;
}
.markdown-body :deep(th) {
  background: #fff4e3;
  color: #7a2f25;
}
.reserved-slot {
  border: 1px dashed var(--brown-dark);
  border-radius: var(--radius-sm);
  padding: 20px;
  text-align: center;
  margin-bottom: 12px;
  background: rgba(255,255,255,0.5);
  transition: background var(--transition);
}
.reserved-slot:hover {
  background: rgba(242,226,210,0.15);
}
.slot-label {
  font-size: 12px;
  color: var(--muted);
}
.ppt-panel {
  border: 1px solid var(--brown);
  border-radius: var(--radius-sm);
  padding: 12px;
  background: #fffaf2;
  margin-bottom: 12px;
}
.ppt-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.picker-tip {
  font-size: 12px;
  color: #8d463d;
}
.ppt-note {
  font-size: 12px;
  color: #6b3b32;
  margin: 8px 0 10px;
}
.ppt-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}
.ppt-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border: 1px solid var(--brown-light);
  border-radius: 8px;
  background: #fff;
  padding: 8px 10px;
}
.ppt-meta {
  min-width: 0;
}
.ppt-title {
  font-size: 13px;
  color: #3d2822;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ppt-tags {
  display: flex;
  gap: 6px;
  margin-top: 4px;
  flex-wrap: wrap;
}
.ppt-tag {
  font-size: 11px;
  border: 1px solid var(--brown-light);
  border-radius: 20px;
  padding: 1px 6px;
  color: #7e5d4d;
  background: #fffdf9;
}
.ppt-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}
.ppt-btn {
  border: 1px solid var(--brown);
  border-radius: 6px;
  background: #fff5ea;
  color: #7b2f25;
  font-size: 12px;
  padding: 5px 10px;
  cursor: pointer;
}
.ppt-btn.ghost {
  background: #fff;
  text-decoration: none;
}
.ppt-empty {
  border: 1px dashed var(--brown-dark);
  border-radius: 8px;
  padding: 10px;
  color: var(--muted);
  font-size: 12px;
  background: #fff;
}
.ppt-preview-mask {
  position: fixed;
  inset: 0;
  background: rgba(12, 8, 6, 0.62);
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.ppt-preview-card {
  width: min(1100px, 96vw);
  background: #fff;
  border-radius: 10px;
  border: 1px solid var(--brown);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 12px;
}
.ppt-preview-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}
.ppt-preview-head h4 {
  margin: 0;
  font-size: 14px;
  color: var(--red);
}
.close-btn {
  border: 1px solid var(--brown);
  border-radius: 6px;
  background: #fff8ee;
  color: #6b3b32;
  font-size: 12px;
  padding: 4px 8px;
  cursor: pointer;
}
.ppt-canvas-wrap {
  border: 1px solid var(--brown-light);
  border-radius: 8px;
  overflow: auto;
  background: #f6f6f6;
}
.ppt-canvas-wrap canvas {
  width: 100%;
  max-width: 100%;
  height: auto;
  display: block;
}
.ppt-preview-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}
.pager {
  font-size: 12px;
  color: #6f4d3f;
}
.preview-error {
  font-size: 12px;
  color: #7b2f25;
  text-align: center;
  margin: 10px 0 0;
}
.section-nav {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--brown);
}
.nav-link {
  text-decoration: none;
  color: var(--red);
  font-size: 14px;
  font-weight: 600;
  padding: 8px 16px;
  border: 1px solid var(--brown);
  border-radius: var(--radius-sm);
  background: #fffaf3;
  transition: background var(--transition), border-color var(--transition);
}
.nav-link:hover {
  background: rgba(183,55,44,0.06);
  border-color: var(--red);
  text-decoration: none;
}
.not-found { text-align: center; padding: 60px 20px; }
.not-found a { color: #b01217; }

.sandbox-toggle-bar {
  max-width: 1100px;
  margin: 0 auto 10px;
  padding: 0 20px;
  display: flex;
  gap: 2px;
}
.sandbox-toggle {
  border: 1px solid var(--brown);
  border-radius: 6px 6px 0 0;
  padding: 6px 16px;
  font-size: 13px;
  background: rgba(255,255,255,0.7);
  color: #6b3b32;
  cursor: pointer;
  transition: all 0.15s;
  border-bottom: 1px solid transparent;
  margin-bottom: -1px;
}
.sandbox-toggle.active {
  background: rgba(255,255,255,0.97);
  border-bottom-color: rgba(255,255,255,0.97);
  color: var(--red);
  font-weight: 600;
}
.sandbox-toggle:hover:not(.active) {
  background: rgba(183,55,44,0.05);
}
.sandbox-toggle:not(button) {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}

@media (max-width: 960px) {
  .content-layout { grid-template-columns: 180px 1fr; gap: 14px; }
}
@media (max-width: 720px) {
  .content-layout { grid-template-columns: 1fr; }
}
</style>
