# 教材系统 Phase 1 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建人教版教材目录框架（Phase 1），实现从首页到节内容页的完整导航流程

**Architecture:** 替换 `App.vue` 为教材系统入口，安装 vue-router 管理 hash 路由。逐级卡片导航，节内容页采用左侧章节目录 + 右侧内容布局。数据集中管理，每节内容以占位文字填充。

**Tech Stack:** Vue 3 + vue-router (hash mode) + Vite

---

### 前置：删除旧模块

-   **Step 1: 删除旧模块文件**

    删除以下文件和目录：
    - `src/AtmosphereView.vue`
    - `src/sandbox/` 目录
    - `src/lib/atmosphereScene.js`
    - `src/lib/terrainScene.js`
    - `natural-geo-system.html`

    保留 `src/lib/shaders/`、`src/lib/terrainModifiers.js` 以备后续 3D 开发使用。

    执行：
    ```bash
    rm src/AtmosphereView.vue
    rm -rf src/sandbox/
    rm src/lib/atmosphereScene.js
    rm src/lib/terrainScene.js
    rm natural-geo-system.html
    ```

-   **Step 2: 提交**

    ```bash
    git add -A
    git commit -m "chore: remove old atmosphere and sandbox modules"
    ```

---

### 前置：安装 vue-router

-   **Step 3: 安装 vue-router**

    ```bash
    pnpm add vue-router@4
    ```

---

### Task 1: 创建教材目录数据

**Files:**
- Create: `src/textbook/data/index.js`

**数据说明：** 定义完整的 9 册教材目录树。每本书包含章列表，每章包含节列表。每节含占位文字内容。数据结构分两层：

1. `chapters[]` — 章列表（仅在 BookSelect → ChapterList 时展示）
2. `sections[]` — 节列表（在 SectionContent 侧栏展示，可通过 id 定位当前节）

- [ ] **Step 1: 创建目录数据文件**

    `src/textbook/data/index.js`：

    ```js
    export const grades = [
      {
        id: '初中',
        books: [
          {
            id: '七年级上册',
            chapters: [
              {
                id: '第一章',
                title: '地球',
                sections: [
                  { id: '第一节', title: '地球的形状和大小', content: { keyPoints: ['地球是一个两极稍扁、赤道略鼓的不规则球体'], body: '详细内容待填充…', interactive: null, ppt: null } },
                  { id: '第二节', title: '地球仪和经纬网', content: { keyPoints: [], body: '详细内容待填充…', interactive: null, ppt: null } },
                  { id: '第三节', title: '地图的阅读', content: { keyPoints: [], body: '详细内容待填充…', interactive: null, ppt: null } },
                ]
              },
              {
                id: '第二章',
                title: '地图的运用',
                sections: [
                  { id: '第一节', title: '地图的阅读', content: { keyPoints: [], body: '详细内容待填充…', interactive: null, ppt: null } },
                  { id: '第二节', title: '地形图的判读', content: { keyPoints: [], body: '详细内容待填充…', interactive: null, ppt: null } },
                ]
              },
              {
                id: '第三章',
                title: '陆地和海洋',
                sections: [
                  { id: '第一节', title: '大洲和大洋', content: { keyPoints: [], body: '详细内容待填充…', interactive: null, ppt: null } },
                  { id: '第二节', title: '海陆的变迁', content: { keyPoints: [], body: '详细内容待填充…', interactive: null, ppt: null } },
                ]
              },
            ]
          },
          {
            id: '七年级下册',
            chapters: [
              { id: '第六章', title: '我们生活的大洲——亚洲', sections: [
                { id: '第一节', title: '位置和范围', content: { keyPoints: [], body: '详细内容待填充…', interactive: null, ppt: null } },
                { id: '第二节', title: '自然环境', content: { keyPoints: [], body: '详细内容待填充…', interactive: null, ppt: null } },
              ]},
              { id: '第七章', title: '我们邻近的地区和国家', sections: [
                { id: '第一节', title: '日本', content: { keyPoints: [], body: '详细内容待填充…', interactive: null, ppt: null } },
                { id: '第二节', title: '东南亚', content: { keyPoints: [], body: '详细内容待填充…', interactive: null, ppt: null } },
              ]},
            ]
          },
          {
            id: '八年级上册',
            chapters: [
              { id: '第一章', title: '从世界看中国', sections: [
                { id: '第一节', title: '疆域', content: { keyPoints: [], body: '详细内容待填充…', interactive: null, ppt: null } },
                { id: '第二节', title: '人口', content: { keyPoints: [], body: '详细内容待填充…', interactive: null, ppt: null } },
                { id: '第三节', title: '民族', content: { keyPoints: [], body: '详细内容待填充…', interactive: null, ppt: null } },
              ]},
            ]
          },
          {
            id: '八年级下册',
            chapters: [
              { id: '第五章', title: '中国的地理差异', sections: [
                { id: '第一节', title: '四大地理区域的划分', content: { keyPoints: [], body: '详细内容待填充…', interactive: null, ppt: null } },
              ]},
            ]
          },
        ]
      },
      {
        id: '高中',
        books: [
          {
            id: '必修第一册',
            chapters: [
              { id: '第一章', title: '宇宙中的地球', sections: [
                { id: '第一节', title: '地球的宇宙环境', content: { keyPoints: [], body: '详细内容待填充…', interactive: null, ppt: null } },
                { id: '第二节', title: '太阳对地球的影响', content: { keyPoints: [], body: '详细内容待填充…', interactive: null, ppt: null } },
                { id: '第三节', title: '地球的历史', content: { keyPoints: [], body: '详细内容待填充…', interactive: null, ppt: null } },
                { id: '第四节', title: '地球的圈层结构', content: { keyPoints: [], body: '详细内容待填充…', interactive: null, ppt: null } },
              ]},
              { id: '第二章', title: '地球上的大气', sections: [
                { id: '第一节', title: '大气的组成和垂直分层', content: { keyPoints: [], body: '详细内容待填充…', interactive: null, ppt: null } },
                { id: '第二节', title: '大气受热过程和大气运动', content: { keyPoints: [], body: '详细内容待填充…', interactive: null, ppt: null } },
              ]},
            ]
          },
          {
            id: '必修第二册',
            chapters: [
              { id: '第一章', title: '人口', sections: [
                { id: '第一节', title: '人口分布', content: { keyPoints: [], body: '详细内容待填充…', interactive: null, ppt: null } },
                { id: '第二节', title: '人口迁移', content: { keyPoints: [], body: '详细内容待填充…', interactive: null, ppt: null } },
              ]},
            ]
          },
          {
            id: '选择性必修1',
            chapters: [
              { id: '第一章', title: '地球的运动', sections: [
                { id: '第一节', title: '地球的自转和公转', content: { keyPoints: [], body: '详细内容待填充…', interactive: null, ppt: null } },
                { id: '第二节', title: '地球运动的地理意义', content: { keyPoints: [], body: '详细内容待填充…', interactive: null, ppt: null } },
              ]},
            ]
          },
          {
            id: '选择性必修2',
            chapters: [
              { id: '第一章', title: '区域与区域发展', sections: [
                { id: '第一节', title: '多种多样的区域', content: { keyPoints: [], body: '详细内容待填充…', interactive: null, ppt: null } },
              ]},
            ]
          },
          {
            id: '选择性必修3',
            chapters: [
              { id: '第一章', title: '自然环境与人类社会', sections: [
                { id: '第一节', title: '自然环境的服务功能', content: { keyPoints: [], body: '详细内容待填充…', interactive: null, ppt: null } },
              ]},
            ]
          },
        ]
      },
    ]

    export function findSection(gradeId, bookId, chapterId, sectionId) {
      const grade = grades.find(g => g.id === gradeId)
      if (!grade) return null
      const book = grade.books.find(b => b.id === bookId)
      if (!book) return null
      const chapter = book.chapters.find(c => c.id === chapterId)
      if (!chapter) return null
      return chapter.sections.find(s => s.id === sectionId) || null
    }

    export function findChapter(gradeId, bookId, chapterId) {
      const grade = grades.find(g => g.id === gradeId)
      if (!grade) return null
      const book = grade.books.find(b => b.id === bookId)
      if (!book) return null
      return book.chapters.find(c => c.id === chapterId) || null
    }
    ```

- [ ] **Step 2: 提交**

    ```bash
    git add src/textbook/data/index.js
    git commit -m "feat: add textbook catalog data for all 9 PEP textbooks"
    ```

---

### Task 2: 重写 App.vue — 教材系统主入口

**Files:**
- Modify: `src/App.vue`
- Modify: `src/main.js`

App.vue 改为使用 vue-router 的教材系统入口，包含大标题和 router-view。标题保留「中学地理教学系统」白底红字 Ma Shan Zheng 行书风格。

- [ ] **Step 1: 重写 App.vue**

    ```vue
    <template>
      <div class="app-root">
        <header class="app-header">
          <router-link to="/" class="app-title">中学地理教学系统</router-link>
          <p class="app-subtitle">人教版 · 初中 / 高中</p>
        </header>
        <router-view />
      </div>
    </template>

    <script setup>
    </script>

    <style scoped>
    .app-root {
      min-height: 100vh;
      background:
        radial-gradient(circle at 15% 10%, rgba(255,243,214,.75) 0, rgba(255,252,244,.95) 42%, #fffef9 100%),
        repeating-linear-gradient(45deg, rgba(225,198,149,.08) 0 2px, transparent 2px 12px),
        repeating-linear-gradient(-45deg, rgba(225,198,149,.05) 0 1px, transparent 1px 10px);
      background-color: #fffdf8;
    }
    .app-header {
      text-align: center;
      padding: 24px 20px 8px;
    }
    .app-title {
      font-family: "Ma Shan Zheng", "STXingkai", serif;
      font-size: clamp(48px, 8vw, 120px);
      color: #b01217;
      text-shadow: 0 6px 20px rgba(183,55,44,0.2);
      line-height: 1;
      letter-spacing: 2px;
      text-decoration: none;
      display: block;
    }
    .app-subtitle {
      margin: 4px 0 0;
      color: #b85a4d;
      font-size: 14px;
      font-family: "Noto Serif SC", "Songti SC", serif;
    }
    </style>
    ```

- [ ] **Step 2: 重写 main.js — 配置 vue-router**

    ```js
    import { createApp } from 'vue'
    import { createRouter, createWebHashHistory } from 'vue-router'
    import App from './App.vue'
    import './style.css'

    import TextbookHome from './textbook/TextbookHome.vue'
    import BookSelect from './textbook/BookSelect.vue'
    import ChapterList from './textbook/ChapterList.vue'
    import SectionContent from './textbook/SectionContent.vue'

    const routes = [
      { path: '/', name: 'home', component: TextbookHome },
      { path: '/textbook', redirect: '/' },
      { path: '/:grade', name: 'grade', component: BookSelect },
      { path: '/:grade/:book', name: 'book', component: ChapterList },
      { path: '/:grade/:book/:chapter/:section', name: 'section', component: SectionContent },
    ]

    const router = createRouter({
      history: createWebHashHistory(),
      routes,
    })

    createApp(App).use(router).mount('#app')
    ```

- [ ] **Step 3: 提交**

    ```bash
    git add src/App.vue src/main.js
    git commit -m "feat: rewrite App.vue as textbook system entry with vue-router"
    ```

---

### Task 3: 创建 TextbookHome.vue — 学段选择

**Files:**
- Create: `src/textbook/TextbookHome.vue`

学段选择页，两张卡片（初中 / 高中），点击进入对应教材列表。

- [ ] **Step 1: 创建 TextbookHome.vue**

    ```vue
    <template>
      <div class="home-shell">
        <div class="card-grid">
          <router-link v-for="g in grades" :key="g.id" :to="'/' + g.id" class="card">
            <div class="card-title">{{ g.id }}</div>
            <div class="card-desc">{{ g.books.length }} 册教材</div>
          </router-link>
        </div>
      </div>
    </template>

    <script setup>
    import { grades } from './data/index.js'
    </script>

    <style scoped>
    .home-shell { padding: 20px; }
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 14px;
      max-width: 600px;
      margin: 0 auto;
    }
    .card {
      display: block;
      text-decoration: none;
      border: 1px solid #e2c9b4;
      border-radius: 12px;
      padding: 24px 20px;
      text-align: center;
      background: rgba(255,255,255,0.94);
      cursor: pointer;
      transition: transform 0.15s, border-color 0.15s;
    }
    .card:hover {
      transform: translateY(-2px);
      border-color: #b01217;
    }
    .card-title {
      font-size: 22px;
      font-weight: 700;
      color: #b01217;
      margin-bottom: 6px;
    }
    .card-desc {
      font-size: 13px;
      color: #b85a4d;
    }
    </style>
    ```

- [ ] **Step 2: 提交**

    ```bash
    git add src/textbook/TextbookHome.vue
    git commit -m "feat: add grade selection page (初中/高中)"
    ```

---

### Task 4: 创建 BookSelect.vue — 教材册选择

**Files:**
- Create: `src/textbook/BookSelect.vue`

展示当前学段下的所有教材册，卡片网格。

- [ ] **Step 1: 创建 BookSelect.vue**

    ```vue
    <template>
      <div class="page-shell">
        <div class="breadcrumb">
          <router-link to="/">首页</router-link>
          <span class="sep">></span>
          <span>{{ gradeId }}</span>
        </div>
        <div class="card-grid">
          <router-link
            v-for="book in currentGrade.books"
            :key="book.id"
            :to="'/' + gradeId + '/' + book.id"
            class="card"
          >
            <div class="card-title">{{ book.id }}</div>
            <div class="card-desc">{{ book.chapters.length }} 章</div>
          </router-link>
        </div>
      </div>
    </template>

    <script setup>
    import { computed } from 'vue'
    import { useRoute } from 'vue-router'
    import { grades } from './data/index.js'

    const route = useRoute()
    const gradeId = computed(() => route.params.grade)
    const currentGrade = computed(() => grades.find(g => g.id === gradeId.value))
    </script>

    <style scoped>
    .page-shell {
      max-width: 1000px;
      margin: 0 auto;
      padding: 16px 20px;
    }
    .breadcrumb {
      font-size: 13px;
      color: #b85a4d;
      margin-bottom: 16px;
    }
    .breadcrumb a { color: #b01217; text-decoration: none; }
    .sep { margin: 0 6px; color: #e2c9b4; }
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
    }
    .card {
      display: block;
      text-decoration: none;
      border: 1px solid #e2c9b4;
      border-radius: 12px;
      padding: 18px 16px;
      text-align: center;
      background: rgba(255,255,255,0.94);
      cursor: pointer;
      transition: transform 0.15s, border-color 0.15s;
    }
    .card:hover {
      transform: translateY(-2px);
      border-color: #b01217;
    }
    .card-title {
      font-size: 16px;
      font-weight: 700;
      color: #b01217;
      margin-bottom: 4px;
    }
    .card-desc { font-size: 12px; color: #b85a4d; }
    </style>
    ```

- [ ] **Step 2: 提交**

    ```bash
    git add src/textbook/BookSelect.vue
    git commit -m "feat: add book selection page for each grade"
    ```

---

### Task 5: 创建 ChapterList.vue — 章列表

**Files:**
- Create: `src/textbook/ChapterList.vue`

章列表页，点击章进入该章第一个节的内容页。

- [ ] **Step 1: 创建 ChapterList.vue**

    ```vue
    <template>
      <div class="page-shell">
        <div class="breadcrumb">
          <router-link to="/">首页</router-link>
          <span class="sep">></span>
          <router-link :to="'/' + gradeId">{{ gradeId }}</router-link>
          <span class="sep">></span>
          <span>{{ bookId }}</span>
        </div>
        <div class="card-grid">
          <router-link
            v-for="ch in currentBook.chapters"
            :key="ch.id"
            :to="'/' + gradeId + '/' + bookId + '/' + ch.id + '/' + ch.sections[0].id"
            class="card"
          >
            <div class="card-title">{{ ch.id }} {{ ch.title }}</div>
            <div class="card-desc">{{ ch.sections.length }} 节 · {{ ch.sections.map(s => s.title).join('、') }}</div>
          </router-link>
        </div>
      </div>
    </template>

    <script setup>
    import { computed } from 'vue'
    import { useRoute } from 'vue-router'
    import { grades } from './data/index.js'

    const route = useRoute()
    const gradeId = computed(() => route.params.grade)
    const bookId = computed(() => route.params.book)
    const currentBook = computed(() => {
      const grade = grades.find(g => g.id === gradeId.value)
      return grade?.books.find(b => b.id === bookId.value)
    })
    </script>

    <style scoped>
    .page-shell {
      max-width: 1000px;
      margin: 0 auto;
      padding: 16px 20px;
    }
    .breadcrumb {
      font-size: 13px;
      color: #b85a4d;
      margin-bottom: 16px;
    }
    .breadcrumb a { color: #b01217; text-decoration: none; }
    .sep { margin: 0 6px; color: #e2c9b4; }
    .card-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
    }
    .card {
      display: block;
      text-decoration: none;
      border: 1px solid #e2c9b4;
      border-radius: 12px;
      padding: 16px;
      background: rgba(255,255,255,0.94);
      cursor: pointer;
      transition: transform 0.15s, border-color 0.15s;
    }
    .card:hover {
      transform: translateY(-1px);
      border-color: #b01217;
    }
    .card-title {
      font-size: 15px;
      font-weight: 700;
      color: #b01217;
      margin-bottom: 4px;
    }
    .card-desc { font-size: 12px; color: #b85a4d; line-height: 1.6; }
    </style>
    ```

- [ ] **Step 2: 提交**

    ```bash
    git add src/textbook/ChapterList.vue
    git commit -m "feat: add chapter list page"
    ```

---

### Task 6: 创建 SectionContent.vue — 节内容页

**Files:**
- Create: `src/textbook/SectionContent.vue`

内容页：左侧章节目录侧栏 + 右侧内容区。包含面包屑、核心知识点、详细讲解（占位）、3D/PPT 预留位、上下节导航。

- [ ] **Step 1: 创建 SectionContent.vue**

    ```vue
    <template>
      <div class="page-shell" v-if="sectionData">
        <!-- 面包屑 -->
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

        <div class="content-layout">
          <!-- 左侧：章节目录 -->
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

          <!-- 右侧：内容区 -->
          <main class="content">
            <h2 class="section-title">{{ sectionId }} {{ sectionData.title }}</h2>

            <!-- 核心知识点 -->
            <div v-if="sectionData.content.keyPoints.length" class="key-points">
              <h3 class="block-title">核心知识点</h3>
              <ul>
                <li v-for="(pt, i) in sectionData.content.keyPoints" :key="i">{{ pt }}</li>
              </ul>
            </div>

            <!-- 详细讲解 -->
            <div class="body-text">
              <p>{{ sectionData.content.body }}</p>
            </div>

            <!-- 3D 预留位 -->
            <div class="reserved-slot" v-if="!sectionData.content.interactive">
              <span class="slot-label">3D 互动预留位</span>
            </div>
            <div class="reserved-slot" v-if="!sectionData.content.ppt">
              <span class="slot-label">PPT 课件预留位</span>
            </div>

            <!-- 上下节导航 -->
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
      </div>
      <div v-else class="page-shell not-found">
        <p>未找到该节内容</p>
        <router-link to="/">返回首页</router-link>
      </div>
    </template>

    <script setup>
    import { computed } from 'vue'
    import { useRoute } from 'vue-router'
    import { grades, findSection, findChapter } from './data/index.js'

    const route = useRoute()
    const gradeId = computed(() => route.params.grade)
    const bookId = computed(() => route.params.book)
    const chapterId = computed(() => route.params.chapter)
    const sectionId = computed(() => route.params.section)

    const chapterData = computed(() => findChapter(gradeId.value, bookId.value, chapterId.value))
    const sectionData = computed(() => findSection(gradeId.value, bookId.value, chapterId.value, sectionId.value))

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
      padding: 16px 20px;
    }
    .breadcrumb {
      font-size: 13px;
      color: #b85a4d;
      margin-bottom: 16px;
      line-height: 1.6;
    }
    .breadcrumb a { color: #b01217; text-decoration: none; }
    .sep { margin: 0 6px; color: #e2c9b4; }

    .content-layout {
      display: grid;
      grid-template-columns: 220px 1fr;
      gap: 20px;
      align-items: start;
    }

    .sidebar {
      border: 1px solid #e2c9b4;
      border-radius: 10px;
      background: rgba(255,255,255,0.94);
      padding: 14px;
    }
    .sidebar-title {
      margin: 0 0 10px;
      font-size: 14px;
      color: #b01217;
      font-weight: 700;
    }
    .section-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .section-list li { margin-bottom: 4px; }
    .section-list a {
      display: block;
      padding: 6px 8px;
      text-decoration: none;
      color: #365776;
      font-size: 13px;
      border-radius: 6px;
      transition: background 0.15s;
    }
    .section-list a:hover { background: #f5ede8; }
    .section-list a.active {
      background: #b01217;
      color: #fff;
      font-weight: 600;
    }

    .content {
      border: 1px solid #e2c9b4;
      border-radius: 10px;
      background: rgba(255,255,255,0.94);
      padding: 20px;
    }
    .section-title {
      margin: 0 0 16px;
      font-size: 18px;
      color: #b01217;
    }
    .block-title {
      margin: 0 0 8px;
      font-size: 14px;
      color: #b85a4d;
    }
    .key-points {
      background: #fef7e6;
      border: 1px solid #e2c9b4;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 16px;
    }
    .key-points ul { margin: 0; padding-left: 18px; }
    .key-points li { font-size: 14px; line-height: 1.7; color: #333; }
    .body-text {
      font-size: 14px;
      line-height: 1.8;
      color: #444;
      margin-bottom: 16px;
    }
    .reserved-slot {
      border: 2px dashed #e2c9b4;
      border-radius: 8px;
      padding: 24px;
      text-align: center;
      margin-bottom: 12px;
    }
    .slot-label {
      font-size: 12px;
      color: #b85a4d;
    }
    .section-nav {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #e2c9b4;
    }
    .nav-link {
      text-decoration: none;
      color: #b01217;
      font-size: 14px;
      font-weight: 600;
    }
    .nav-link:hover { text-decoration: underline; }
    .not-found { text-align: center; padding: 60px 20px; }
    .not-found a { color: #b01217; }

    @media (max-width: 720px) {
      .content-layout { grid-template-columns: 1fr; }
    }
    </style>
    ```

- [ ] **Step 2: 提交**

    ```bash
    git add src/textbook/SectionContent.vue
    git commit -m "feat: add section content page with sidebar navigation"
    ```

---

### Task 7: 更新 index.html 和 index.css

**Files:**
- Modify: `index.html`
- Modify: `src/style.css`

更新页面标题、meta 描述；保留全局样式中的部分通用规则（box-sizing、滚动条等），移除旧模块专用的 CSS。

- [ ] **Step 1: 更新 index.html**

    ```html
    <!doctype html>
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="中学地理教学系统 — 人教版初中/高中地理教材在线阅读与互动教学平台" />
        <meta name="theme-color" content="#b01217" />
        <meta name="apple-mobile-web-app-title" content="中学地理教学系统" />
        <title>中学地理教学系统</title>
      </head>
      <body>
        <div id="app"></div>
        <noscript>这个教学系统需要启用 JavaScript 才能正常显示。</noscript>
        <script type="module" src="/src/main.js"></script>
      </body>
    </html>
    ```

- [ ] **Step 2: 精简 style.css**

    ```css
    :root {
      --ink: #333;
      --muted: #b85a4d;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: "Noto Serif SC", "Songti SC", "STKaiti", serif;
      color: var(--ink);
      background-color: #fffdf8;
      min-height: 100vh;
    }

    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #e2c9b4; border-radius: 3px; }
    ```

- [ ] **Step 3: 提交**

    ```bash
    git add index.html src/style.css
    git commit -m "chore: update index.html and simplify global styles"
    ```

---

### Task 8: 构建验证

- [ ] **Step 1: 完整构建**

    ```bash
    pnpm build
    ```
    预期：构建成功，无报错。

- [ ] **Step 2: 启动预览**

    ```bash
    pnpm dev
    ```
    然后访问 `http://127.0.0.1:4173/` 逐级检查：
    - 首页显示「初中」「高中」两张卡片
    - 点击初中 → 显示七年级上册、七年级下册、八年级上册、八年级下册
    - 点击七年级上册 → 显示第一章、第二章、第三章
    - 点击第一章 → 进入内容页，左侧有节列表，右侧显示占位内容
    - 面包屑导航正确
    - 上下节跳转正常

- [ ] **Step 3: 最终提交**

    ```bash
    git add -A
    git commit -m "chore: clean up after Phase 1 textbook system"
    ```
