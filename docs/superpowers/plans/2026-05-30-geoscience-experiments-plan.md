# 地学实验模块实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有地理教学系统中新增地学实验模块，包含 19 个实验（13 个 3D + 6 个图文），覆盖气象学、水文学、地质、天文学四个学科。

**Architecture:** 模块注册制——每个实验独立组件，通过注册表统一管理元数据。3D 实验组件自包含（canvas + 控制面板），继承共享 ExperimentEngine 基类。图文实验组件导出 steps 数组，由 TutorialTemplate 渲染。路由沿用项目 hash-based 懒加载模式。

**Component ownership:** 3D 实验组件拥有自己的 canvas 和控制面板，ExperimentView 只提供面包屑 + 标题 + 知识点 footer 外壳。

**Tech Stack:** Vue 3 (SFC + composition API), vue-router (hash), Three.js (CDN 引入), plain CSS (CSS custom properties)

---

## File Map

| File | Responsibility |
|------|---------------|
| `src/main.js` | 新增 3 条 experiments 路由 |
| `src/App.vue` | header 新增"地学实验"导航入口 |
| `src/experiments/engine/ExperimentEngine.js` | Three.js 底座基类（场景/相机/灯光/controls/动画循环/dispose） |
| `src/experiments/modules/index.js` | 19 个实验注册表（元数据 + 懒加载入口） |
| `src/experiments/ExperimentsHome.vue` | 四学科入口卡片页 |
| `src/experiments/ExperimentCategory.vue` | 学科实验列表页（面包屑 + 列表 + 标签） |
| `src/experiments/ExperimentView.vue` | 实验外壳（面包屑 + 标题 + 动态组件 + 知识点 footer） |
| `src/experiments/components/TutorialTemplate.vue` | 图文实验共享模板（步骤指示器 + 内容 + 导航） |
| `src/experiments/modules/meteorology/ThermalCirculation.vue` | 热力环流 3D 实验 |
| `src/experiments/modules/meteorology/Coriolis.vue` | 科里奥利力 3D 实验 |
| `src/experiments/modules/meteorology/CloudBottle.vue` | 瓶中云 tutorial（导出 steps） |
| `src/experiments/modules/meteorology/WeatherInstruments.vue` | 气象仪器 tutorial（导出 steps） |
| `src/experiments/modules/hydrology/StreamTable.vue` | 流水地貌 3D 实验 |
| `src/experiments/modules/hydrology/Groundwater.vue` | 地下水 3D 实验 |
| `src/experiments/modules/hydrology/Infiltration.vue` | 下渗径流 tutorial（导出 steps） |
| `src/experiments/modules/hydrology/WaterCycle.vue` | 水循环 tutorial（导出 steps） |
| `src/experiments/modules/hydrology/SedimentTransport.vue` | 搬运能力 3D 实验 |
| `src/experiments/modules/geology/FaultModel.vue` | 沙箱断层 3D 实验 |
| `src/experiments/modules/geology/Stratigraphy.vue` | 地层叠置律 3D 实验 |
| `src/experiments/modules/geology/MineralID.vue` | 矿物鉴定 tutorial（导出 steps） |
| `src/experiments/modules/geology/PotatoCore.vue` | 土豆岩心 tutorial（导出 steps） |
| `src/experiments/modules/geology/SoilErosion.vue` | 水土流失 3D 实验 |
| `src/experiments/modules/astronomy/MoonPhases.vue` | 月相变化 3D 实验 |
| `src/experiments/modules/astronomy/Seasons.vue` | 四季成因 3D 实验 |
| `src/experiments/modules/astronomy/KeplerLaws.vue` | 开普勒定律 3D 实验 |
| `src/experiments/modules/astronomy/SolarMotion.vue` | 太阳视运动 3D 实验 |
| `src/experiments/modules/astronomy/Eclipse.vue` | 日食月食 3D 实验 |

---

### Task 1: ExperimentEngine 基类

**Files:**
- Create: `src/experiments/engine/ExperimentEngine.js`

- [ ] **Step 1: Write ExperimentEngine.js**

```js
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export class ExperimentEngine {
  constructor() {
    this.scene = null
    this.camera = null
    this.renderer = null
    this.controls = null
    this.clock = null
    this.animationId = null
    this._canvas = null
  }

  init(canvas) {
    this._canvas = canvas
    const { width, height } = canvas.getBoundingClientRect()

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0xfffdf2)
    this.scene.fog = new THREE.Fog(0xfffdf2, 20, 80)

    this.camera = new THREE.PerspectiveCamera(50, width / (height || 1), 0.1, 200)
    this.camera.position.set(8, 6, 12)
    this.camera.lookAt(0, 0, 0)

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    this.controls = new OrbitControls(this.camera, canvas)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.08

    this._addLights()
    this.clock = new THREE.Clock()
    this.setupScene()
    this._animate()
  }

  _addLights() {
    const ambient = new THREE.AmbientLight(0xfff8e8, 1.8)
    this.scene.add(ambient)
    const sun = new THREE.DirectionalLight(0xfff8e8, 4.5)
    sun.position.set(15, 25, 10)
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    sun.shadow.camera.near = 0.5
    sun.shadow.camera.far = 100
    sun.shadow.camera.left = -20
    sun.shadow.camera.right = 20
    sun.shadow.camera.top = 20
    sun.shadow.camera.bottom = -20
    this.scene.add(sun)
  }

  _animate() {
    const dt = Math.min(this.clock.getDelta(), 0.1)
    const elapsed = this.clock.elapsedTime
    this.update(dt, elapsed)
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
    this.animationId = requestAnimationFrame(() => this._animate())
  }

  resize() {
    if (!this._canvas || !this.renderer) return
    const { width, height } = this._canvas.getBoundingClientRect()
    if (width === 0 || height === 0) return
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  dispose() {
    cancelAnimationFrame(this.animationId)
    if (this.controls) this.controls.dispose()
    if (this.renderer) this.renderer.dispose()
    if (this.scene) {
      this.scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose())
          } else {
            obj.material.dispose()
          }
        }
      })
    }
  }

  // -- subclass overrides --
  setupScene() {}
  update(dt, elapsed) {}
  setParams(params) {}
}
```

- [ ] **Step 2: Verify file created**

Run: `ls -l src/experiments/engine/ExperimentEngine.js`

- [ ] **Step 3: Commit**

```bash
git add src/experiments/engine/ExperimentEngine.js
git commit -m "feat: add ExperimentEngine base class for 3D experiments"
```

---

### Task 2: 模块注册表

**Files:**
- Create: `src/experiments/modules/index.js`

- [ ] **Step 1: Write index.js with all 19 experiment registrations**

```js
const modules = [
  // -- 气象学实验 --
  {
    id: 'thermal-circulation',
    name: '热力环流模拟实验',
    category: 'meteorology',
    type: '3d',
    description: '通过冷热源的空气流动，直观展示热力环流的形成过程——冷热不均导致气压差，驱动大气运动。',
    concepts: ['热力环流', '气压差', '海陆风', '山谷风'],
    component: () => import('./meteorology/ThermalCirculation.vue'),
  },
  {
    id: 'coriolis',
    name: '科里奥利力旋转水槽实验',
    category: 'meteorology',
    type: '3d',
    description: '在旋转水槽中观察流体运动如何被地转偏向力偏转，理解信风带、西风带和气旋旋转方向的形成。',
    concepts: ['地转偏向力', '风带', '气旋', '科里奥利力'],
    component: () => import('./meteorology/Coriolis.vue'),
  },
  {
    id: 'cloud-bottle',
    name: '瓶中云实验',
    category: 'meteorology',
    type: 'tutorial',
    description: '通过简单的瓶子和火柴，演示云的形成过程——凝结核、绝热膨胀与降温凝结。',
    concepts: ['云形成', '凝结核', '绝热膨胀', '露点'],
    component: () => import('./meteorology/CloudBottle.vue'),
  },
  {
    id: 'weather-instruments',
    name: '自制气象仪器',
    category: 'meteorology',
    type: 'tutorial',
    description: '了解气压计、风速计、雨量计等气象仪器的制作方法和测量原理。',
    concepts: ['气压计', '风速计', '雨量计', '气象观测'],
    component: () => import('./meteorology/WeatherInstruments.vue'),
  },

  // -- 水文学实验 --
  {
    id: 'stream-table',
    name: '流水地貌模拟台',
    category: 'hydrology',
    type: '3d',
    description: '模拟流水对地表的侵蚀、搬运和堆积作用，观察 V 形谷、曲流、冲积扇、三角洲等地貌的形成过程。',
    concepts: ['侵蚀', '搬运', '沉积', '曲流', '三角洲'],
    component: () => import('./hydrology/StreamTable.vue'),
  },
  {
    id: 'groundwater',
    name: '地下水/含水层模型',
    category: 'hydrology',
    type: '3d',
    description: '观察地下水的赋存和运动，理解含水层、隔水层、承压水、抽水漏斗等水文地质概念。',
    concepts: ['含水层', '地下水', '承压水', '抽水漏斗'],
    component: () => import('./hydrology/Groundwater.vue'),
  },
  {
    id: 'infiltration',
    name: '下渗与径流对比实验',
    category: 'hydrology',
    type: 'tutorial',
    description: '比较不同土壤类型、植被覆盖和坡度条件下的下渗与地表径流差异。',
    concepts: ['下渗', '地表径流', '土壤类型', '植被覆盖'],
    component: () => import('./hydrology/Infiltration.vue'),
  },
  {
    id: 'water-cycle',
    name: '水循环袋实验',
    category: 'hydrology',
    type: 'tutorial',
    description: '用密封袋模拟微型水循环系统，观察蒸发、凝结、降水、汇集的完整过程。',
    concepts: ['蒸发', '凝结', '降水', '水循环'],
    component: () => import('./hydrology/WaterCycle.vue'),
  },
  {
    id: 'sediment-transport',
    name: '流水搬运能力实验',
    category: 'hydrology',
    type: '3d',
    description: '探究流速与沉积物颗粒大小的关系，理解 Hjulstrom 曲线——不同流速下的侵蚀、搬运与沉积临界条件。',
    concepts: ['Hjulstrom 曲线', '流速', '颗粒大小', '搬运'],
    component: () => import('./hydrology/SedimentTransport.vue'),
  },

  // -- 地质实验 --
  {
    id: 'fault-model',
    name: '沙箱断层/造山楔模型',
    category: 'geology',
    type: '3d',
    description: '通过压缩/拉伸分层沙箱，观察正断层、逆断层和褶皱的发育过程。',
    concepts: ['正断层', '逆断层', '褶皱', '造山楔'],
    component: () => import('./geology/FaultModel.vue'),
  },
  {
    id: 'stratigraphy',
    name: '地层叠置律（Steno 定律）',
    category: 'geology',
    type: '3d',
    description: '通过虚拟钻孔和切面，理解地层的叠置原理、水平原理和穿插关系，学习相对定年方法。',
    concepts: ['叠置原理', '水平原理', '穿插关系', '相对定年'],
    component: () => import('./geology/Stratigraphy.vue'),
  },
  {
    id: 'mineral-id',
    name: '矿物鉴定/莫氏硬度实验',
    category: 'geology',
    type: 'tutorial',
    description: '学习使用莫氏硬度计、条痕板、放大镜和稀酸鉴别常见矿物。',
    concepts: ['莫氏硬度', '条痕', '光泽', '解理', '碳酸盐反应'],
    component: () => import('./geology/MineralID.vue'),
  },
  {
    id: 'potato-core',
    name: '土豆岩心取样实验',
    category: 'geology',
    type: 'tutorial',
    description: '模拟钻孔勘探过程——在不同位置取样，根据岩心数据推断地下矿产分布。',
    concepts: ['岩心取样', '钻孔勘探', '三维建模', '矿产勘探'],
    component: () => import('./geology/PotatoCore.vue'),
  },
  {
    id: 'soil-erosion',
    name: '水土流失实验',
    category: 'geology',
    type: '3d',
    description: '对比不同植被覆盖、坡度和降雨强度条件下的土壤侵蚀差异。',
    concepts: ['水土流失', '植被覆盖', '坡度', '降雨强度'],
    component: () => import('./geology/SoilErosion.vue'),
  },

  // -- 天文学实验 --
  {
    id: 'moon-phases',
    name: '月相变化演示',
    category: 'astronomy',
    type: '3d',
    description: '在 3D 空间中观察太阳、地球、月球的相对位置变化如何产生不同的月相。',
    concepts: ['月相', '朔望', '日月地关系', '盈亏'],
    component: () => import('./astronomy/MoonPhases.vue'),
  },
  {
    id: 'seasons',
    name: '四季成因演示',
    category: 'astronomy',
    type: '3d',
    description: '观察地球绕日公转过程中，地轴倾角（23.5°）如何导致太阳直射点移动和四季更替。',
    concepts: ['地轴倾角', '太阳直射点', '四季', '昼夜长短'],
    component: () => import('./astronomy/Seasons.vue'),
  },
  {
    id: 'kepler-laws',
    name: '开普勒行星运动定律',
    category: 'astronomy',
    type: '3d',
    description: '可视化开普勒三大定律：椭圆轨道、面积速度不变、周期与轨道半长轴的关系。',
    concepts: ['椭圆轨道', '面积速度', '周期定律', '开普勒'],
    component: () => import('./astronomy/KeplerLaws.vue'),
  },
  {
    id: 'solar-motion',
    name: '太阳视运动/太阳高度角',
    category: 'astronomy',
    type: '3d',
    description: '模拟不同纬度、不同季节的太阳周日视运动轨迹，理解正午太阳高度角和昼夜长短变化。',
    concepts: ['太阳高度角', '视运动', '方位角', '昼长'],
    component: () => import('./astronomy/SolarMotion.vue'),
  },
  {
    id: 'eclipse',
    name: '日食/月食模拟',
    category: 'astronomy',
    type: '3d',
    description: '可视化日月食的几何条件——朔望、交点、本影半影，理解食的类型和发生频率。',
    concepts: ['日食', '月食', '本影', '半影', '食季'],
    component: () => import('./astronomy/Eclipse.vue'),
  },
]

export const categoryLabels = {
  meteorology: '气象学实验',
  hydrology: '水文学实验',
  geology: '地质实验',
  astronomy: '天文学实验',
}

export const categoryIcons = {
  meteorology: '🌤',
  hydrology: '💧',
  geology: '⛏',
  astronomy: '🔭',
}

export default modules
```

- [ ] **Step 2: Commit**

```bash
git add src/experiments/modules/index.js
git commit -m "feat: add experiment module registry (19 experiments across 4 categories)"
```

---

### Task 3: 路由 + App.vue 导航入口

**Files:**
- Modify: `src/main.js`
- Modify: `src/App.vue`

- [ ] **Step 1: Add lazy-load imports after line 14 of main.js**

In `src/main.js`, after the existing imports (`const GeologicTimeView = ...`), add:

```js
const ExperimentsHome = () => import('./experiments/ExperimentsHome.vue')
const ExperimentCategory = () => import('./experiments/ExperimentCategory.vue')
const ExperimentView = () => import('./experiments/ExperimentView.vue')
```

- [ ] **Step 2: Add routes BEFORE the catch-all `/:grade` route**

In the routes array, before `{ path: '/:grade', ... }`, add:

```js
{ path: '/experiments', name: 'experiments', component: ExperimentsHome },
{ path: '/experiments/:category', name: 'experiment-category', component: ExperimentCategory },
{ path: '/experiments/:category/:experiment', name: 'experiment-view', component: ExperimentView },
```

- [ ] **Step 3: Add nav entry to App.vue**

In `src/App.vue` template, inside `<header class="app-header">`, after `<p class="app-subtitle">`, add:

```html
<nav class="app-nav">
  <router-link to="/experiments" class="nav-link">地学实验</router-link>
</nav>
```

In `<style scoped>`, add:

```css
.app-nav { margin-top: 2px; display: flex; gap: 16px; justify-content: center; }
.nav-link {
  font-size: 14px;
  color: #8f7652;
  text-decoration: none;
  padding: 2px 10px;
  border-radius: 4px;
  transition: color var(--transition), background var(--transition);
}
.nav-link:hover { color: var(--red); background: rgba(158, 36, 38, 0.06); }
.nav-link.router-link-exact-active { color: var(--red); font-weight: 600; }
```

- [ ] **Step 4: Verify build**

Run: `pnpm build`
Expected: Build succeeds. (Pages won't render yet — missing ExperimentsHome etc.)

- [ ] **Step 5: Commit**

```bash
git add src/main.js src/App.vue
git commit -m "feat: add experiments routes (/experiments/*) and nav entry in App.vue"
```

---

### Task 4: ExperimentsHome 四学科入口页

**Files:**
- Create: `src/experiments/ExperimentsHome.vue`

- [ ] **Step 1: Write ExperimentsHome.vue**

```html
<template>
  <div class="exp-home">
    <h1 class="exp-heading">地学实验</h1>
    <p class="exp-lead">选择学科，开始交互式实验</p>
    <div class="exp-grid">
      <router-link
        v-for="cat in categories"
        :key="cat.id"
        :to="`/experiments/${cat.id}`"
        :class="['exp-card', `exp-card-${cat.id}`]"
      >
        <div class="exp-card-icon">{{ cat.icon }}</div>
        <div class="exp-card-title">{{ cat.label }}</div>
        <div class="exp-card-desc">{{ cat.desc }}</div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
const categories = [
  { id: 'meteorology', icon: '🌤', label: '气象学实验', desc: '热力环流 · 科里奥利力 · 云与降水' },
  { id: 'hydrology', icon: '💧', label: '水文学实验', desc: '流水地貌 · 地下水 · 水循环' },
  { id: 'geology', icon: '⛏', label: '地质实验', desc: '断层褶皱 · 地层 · 矿物鉴定' },
  { id: 'astronomy', icon: '🔭', label: '天文学实验', desc: '月相 · 四季 · 行星运动' },
]
</script>

<style scoped>
.exp-home { padding: 40px 20px 34px; }
.exp-heading {
  text-align: center;
  font-size: clamp(28px, 6vw, 44px);
  color: var(--red);
  margin: 0 0 8px;
  font-family: "Ma Shan Zheng", "STXingkai", "Kaiti SC", serif;
}
.exp-lead { text-align: center; color: var(--muted); font-size: 15px; margin: 0 0 32px; }
.exp-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 24px; max-width: 780px; margin: 0 auto; }
.exp-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 180px;
  text-decoration: none;
  border-radius: 16px;
  padding: 28px 20px 22px;
  text-align: center;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition), box-shadow var(--transition);
}
.exp-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-hover); }
.exp-card-meteorology { background: linear-gradient(180deg, #e3f2fd, #bbdefb); border: 1px solid #90caf9; }
.exp-card-hydrology { background: linear-gradient(180deg, #e0f2f1, #b2dfdb); border: 1px solid #80cbc4; }
.exp-card-geology { background: linear-gradient(180deg, #efebe9, #d7ccc8); border: 1px solid #bcaaa4; }
.exp-card-astronomy { background: linear-gradient(180deg, #ede7f6, #d1c4e9); border: 1px solid #b39ddb; }
.exp-card-icon { font-size: 40px; margin-bottom: 10px; }
.exp-card-title { font-size: 20px; font-weight: 700; color: #333; margin-bottom: 4px; }
.exp-card-desc { font-size: 11px; color: #777; line-height: 1.5; }
.exp-card-meteorology .exp-card-title { color: #1565c0; }
.exp-card-hydrology .exp-card-title { color: #00695c; }
.exp-card-geology .exp-card-title { color: #4e342e; }
.exp-card-astronomy .exp-card-title { color: #4527a0; }

@media (max-width: 720px) {
  .exp-home { padding: 20px 14px 28px; }
  .exp-grid { gap: 14px; }
  .exp-card { width: 150px; padding: 20px 14px 16px; }
  .exp-card-icon { font-size: 32px; }
  .exp-card-title { font-size: 17px; }
}
</style>
```

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds, ExperimentsHome now renders.

- [ ] **Step 3: Commit**

```bash
git add src/experiments/ExperimentsHome.vue
git commit -m "feat: add ExperimentsHome page with 4 category cards"
```

---

### Task 5: ExperimentCategory 学科实验列表页

**Files:**
- Create: `src/experiments/ExperimentCategory.vue`

- [ ] **Step 1: Write ExperimentCategory.vue**

```html
<template>
  <div class="cat-page">
    <nav class="cat-breadcrumb">
      <router-link to="/">首页</router-link>
      <span> &gt; </span>
      <router-link to="/experiments">地学实验</router-link>
      <span> &gt; </span>
      <strong>{{ label }}</strong>
    </nav>
    <h2 class="cat-title">{{ label }}</h2>
    <div class="cat-grid">
      <router-link
        v-for="exp in experiments"
        :key="exp.id"
        :to="`/experiments/${exp.category}/${exp.id}`"
        class="exp-item"
      >
        <span :class="['exp-badge', exp.type === '3d' ? 'badge-3d' : 'badge-tutorial']">
          {{ exp.type === '3d' ? '3D 交互' : '图文教程' }}
        </span>
        <div class="exp-item-name">{{ exp.name }}</div>
        <div class="exp-item-desc">{{ exp.description }}</div>
        <div class="exp-item-concepts">
          <span v-for="c in exp.concepts" :key="c" class="concept-tag">{{ c }}</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import modules, { categoryLabels } from './modules/index.js'

const route = useRoute()
const category = computed(() => route.params.category)
const label = computed(() => categoryLabels[category.value] || category.value)
const experiments = computed(() => modules.filter(m => m.category === category.value))
</script>

<style scoped>
.cat-page { padding: 24px 20px 40px; max-width: 900px; margin: 0 auto; }
.cat-breadcrumb { font-size: 13px; color: var(--muted); margin-bottom: 16px; }
.cat-breadcrumb a { color: var(--muted); text-decoration: none; }
.cat-breadcrumb a:hover { color: var(--red); }
.cat-title { font-size: clamp(24px, 5vw, 34px); color: var(--ink); margin: 0 0 24px; }
.cat-grid { display: flex; flex-direction: column; gap: 14px; }
.exp-item {
  display: block;
  text-decoration: none;
  border-radius: var(--radius-card);
  padding: 18px 22px;
  background: var(--card-bg);
  border: 1px solid var(--brown-light);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition), box-shadow var(--transition);
  position: relative;
}
.exp-item:hover { transform: translateY(-2px); box-shadow: var(--shadow-hover); }
.exp-badge {
  position: absolute;
  top: 14px;
  right: 16px;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
}
.badge-3d { background: #dce8b8; color: #43552d; }
.badge-tutorial { background: #e8e0d0; color: #6d5d40; }
.exp-item-name { font-size: 18px; font-weight: 700; color: var(--ink); margin-bottom: 4px; padding-right: 80px; }
.exp-item-desc { font-size: 13px; color: #777; margin-bottom: 8px; line-height: 1.5; }
.exp-item-concepts { display: flex; flex-wrap: wrap; gap: 6px; }
.concept-tag {
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 3px;
  background: rgba(158, 36, 38, 0.07);
  color: var(--red);
}
</style>
```

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/experiments/ExperimentCategory.vue
git commit -m "feat: add ExperimentCategory list page with breadcrumb and concept tags"
```

---

### Task 6: TutorialTemplate + ExperimentView

**Files:**
- Create: `src/experiments/components/TutorialTemplate.vue`
- Create: `src/experiments/ExperimentView.vue`

- [ ] **Step 1: Write TutorialTemplate.vue**

```html
<template>
  <div class="tutorial">
    <div class="tutorial-step-indicators">
      <button
        v-for="(step, i) in steps"
        :key="i"
        :class="['step-dot', { active: i === current, done: i < current }]"
        @click="goTo(i)"
      >
        {{ i + 1 }}
      </button>
    </div>
    <div class="tutorial-main">
      <h3 class="tutorial-step-title">{{ steps[current].title }}</h3>
      <div class="tutorial-image" v-if="steps[current].image">
        <img :src="steps[current].image" :alt="steps[current].title" />
      </div>
      <div class="tutorial-content">{{ steps[current].content }}</div>
      <div class="tutorial-highlight" v-if="steps[current].highlight">
        <strong>核心提示：</strong>{{ steps[current].highlight }}
      </div>
      <div class="tutorial-nav">
        <button :disabled="current === 0" @click="goTo(current - 1)" class="btn-nav">◀ 上一步</button>
        <span class="tutorial-progress">{{ current + 1 }} / {{ steps.length }}</span>
        <button :disabled="current === steps.length - 1" @click="goTo(current + 1)" class="btn-nav">下一步 ▶</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({ steps: { type: Array, required: true } })
const current = ref(0)

function goTo(i) { if (i >= 0 && i < props.steps.length) current.value = i }

function onKey(e) {
  if (e.key === 'ArrowRight') goTo(current.value + 1)
  if (e.key === 'ArrowLeft') goTo(current.value - 1)
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.tutorial { display: flex; gap: 28px; max-width: 820px; margin: 0 auto; }
.tutorial-step-indicators {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding-top: 8px;
  flex-shrink: 0;
}
.step-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--brown);
  background: var(--paper);
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition), border-color var(--transition), color var(--transition);
  position: relative;
}
.step-dot:not(:last-child) { margin-bottom: 18px; }
.step-dot:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 32px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 16px;
  background: var(--brown-light);
}
.step-dot.active { background: var(--red); border-color: var(--red); color: #fff; }
.step-dot.done { background: var(--button-green-strong); border-color: var(--button-green-deep); color: var(--button-green-ink); }
.tutorial-main { flex: 1; min-width: 0; }
.tutorial-step-title { font-size: 20px; font-weight: 700; color: var(--ink); margin: 0 0 14px; }
.tutorial-image { margin-bottom: 14px; }
.tutorial-image img { max-width: 100%; border-radius: var(--radius-box); border: 1px solid var(--brown-light); }
.tutorial-content { font-size: 15px; line-height: 1.8; color: var(--ink); margin-bottom: 14px; }
.tutorial-highlight {
  background: linear-gradient(90deg, rgba(158, 36, 38, 0.08), transparent);
  border-left: 3px solid var(--red);
  padding: 10px 14px;
  font-size: 13px;
  color: var(--red);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  margin-bottom: 18px;
}
.tutorial-nav { display: flex; align-items: center; justify-content: space-between; }
.btn-nav {
  padding: 6px 16px;
  border: 1px solid var(--brown);
  border-radius: var(--radius-sm);
  background: var(--cream);
  color: var(--ink);
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  transition: background var(--transition);
}
.btn-nav:hover:not(:disabled) { background: var(--button-green); }
.btn-nav:disabled { opacity: 0.4; cursor: default; }
.tutorial-progress { font-size: 13px; color: var(--muted); }

@media (max-width: 640px) {
  .tutorial { flex-direction: column; gap: 16px; }
  .tutorial-step-indicators { flex-direction: row; gap: 4px; overflow-x: auto; padding-bottom: 8px; }
  .step-dot:not(:last-child) { margin-bottom: 0; margin-right: 18px; }
  .step-dot:not(:last-child)::after { top: 50%; left: 32px; width: 16px; height: 2px; transform: translateY(-50%); }
}
</style>
```

- [ ] **Step 2: Write ExperimentView.vue**

```html
<template>
  <div class="ev-shell">
    <nav class="ev-breadcrumb">
      <router-link to="/">首页</router-link>
      <span> &gt; </span>
      <router-link to="/experiments">地学实验</router-link>
      <span> &gt; </span>
      <router-link :to="`/experiments/${category}`">{{ categoryLabel }}</router-link>
      <span> &gt; </span>
      <strong>{{ exp?.name || '' }}</strong>
    </nav>
    <h2 class="ev-title">{{ exp?.name || '' }}</h2>

    <component :is="expComponent" v-if="expComponent" />

    <section class="ev-concepts" v-if="exp?.concepts?.length">
      <h4>涉及知识点</h4>
      <div class="concept-list">
        <span v-for="c in exp.concepts" :key="c" class="concept-tag">{{ c }}</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, watch, defineAsyncComponent, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import modules, { categoryLabels } from './modules/index.js'
import TutorialTemplate from './components/TutorialTemplate.vue'

const route = useRoute()
const category = computed(() => route.params.category)
const experimentId = computed(() => route.params.experiment)
const exp = computed(() => modules.find(m => m.category === category.value && m.id === experimentId.value))
const categoryLabel = computed(() => categoryLabels[category.value] || category.value)

const expComponent = ref(null)
const engineRef = ref(null)

async function loadComponent() {
  if (!exp.value) { expComponent.value = null; return }
  if (exp.value.type === 'tutorial') {
    const mod = await exp.value.component()
    expComponent.value = {
      render: (ctx) => ctx.$slots.default?.(),  // unused
      // For tutorial, we render TutorialTemplate with the steps exported by the experiment module
    }
    // Instead, we set a different approach: tutorial modules export `steps` directly
    const steps = mod.steps || mod.default?.steps || []
    expComponent.value = { template: null } // placeholder 
    // Use a simpler approach: pass steps to TutorialTemplate via dynamic wrapper
  } else {
    expComponent.value = defineAsyncComponent(exp.value.component)
  }
}

watch(() => exp.value?.id, () => {
  expComponent.value = null
  loadComponent()
}, { immediate: true })
</script>

<style scoped>
.ev-shell { padding: 20px 20px 40px; max-width: 1100px; margin: 0 auto; }
.ev-breadcrumb { font-size: 13px; color: var(--muted); margin-bottom: 12px; }
.ev-breadcrumb a { color: var(--muted); text-decoration: none; }
.ev-breadcrumb a:hover { color: var(--red); }
.ev-title { font-size: clamp(22px, 4.5vw, 30px); color: var(--ink); margin: 0 0 20px; }
.ev-concepts { margin-top: 28px; }
.ev-concepts h4 { font-size: 14px; color: var(--muted); margin: 0 0 8px; }
.concept-list { display: flex; flex-wrap: wrap; gap: 6px; }
.concept-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 3px;
  background: rgba(158, 36, 38, 0.07);
  color: var(--red);
}
</style>
```

Wait, I'm overcomplicating this. The tutorial experiments just export steps data. Let me simplify ExperimentView so that it handles both modes cleanly:

- For 3D: dynamically import and render the experiment component (which is self-contained)
- For tutorial: dynamically import the module to get `steps`, then render TutorialTemplate with those steps

- [ ] **Step 1 (revised): Write ExperimentView.vue**

```html
<template>
  <div class="ev-shell">
    <nav class="ev-breadcrumb">
      <router-link to="/">首页</router-link>
      <span> &gt; </span>
      <router-link to="/experiments">地学实验</router-link>
      <span> &gt; </span>
      <router-link :to="`/experiments/${category}`">{{ categoryLabel }}</router-link>
      <span> &gt; </span>
      <strong>{{ exp?.name || '' }}</strong>
    </nav>
    <h2 class="ev-title">{{ exp?.name || '' }}</h2>

    <!-- 3D experiment: self-contained component -->
    <component :is="expComponent" v-if="expComponent && exp?.type === '3d'" />

    <!-- Tutorial experiment: TutorialTemplate with steps -->
    <TutorialTemplate v-if="exp?.type === 'tutorial'" :steps="tutorialSteps" />

    <section class="ev-concepts" v-if="exp?.concepts?.length">
      <h4>涉及知识点</h4>
      <div class="concept-list">
        <span v-for="c in exp.concepts" :key="c" class="concept-tag">{{ c }}</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, watch, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import modules, { categoryLabels } from './modules/index.js'
import TutorialTemplate from './components/TutorialTemplate.vue'

const route = useRoute()
const category = computed(() => route.params.category)
const experimentId = computed(() => route.params.experiment)
const exp = computed(() => modules.find(m => m.category === category.value && m.id === experimentId.value))
const categoryLabel = computed(() => categoryLabels[category.value] || category.value)

const expComponent = ref(null)
const tutorialSteps = ref([])

async function loadContent() {
  expComponent.value = null
  tutorialSteps.value = []
  if (!exp.value) return

  const mod = await exp.value.component()

  if (exp.value.type === '3d') {
    expComponent.value = defineAsyncComponent(() => Promise.resolve(mod.default || mod))
  } else {
    // tutorial modules export `steps` as a named export or default
    tutorialSteps.value = mod.steps || mod.default?.steps || []
  }
}

watch(() => exp.value?.id, loadContent, { immediate: true })
</script>

<style scoped>
.ev-shell { padding: 20px 20px 40px; max-width: 1100px; margin: 0 auto; }
.ev-breadcrumb { font-size: 13px; color: var(--muted); margin-bottom: 12px; }
.ev-breadcrumb a { color: var(--muted); text-decoration: none; }
.ev-breadcrumb a:hover { color: var(--red); }
.ev-title { font-size: clamp(22px, 4.5vw, 30px); color: var(--ink); margin: 0 0 20px; }
.ev-concepts { margin-top: 28px; }
.ev-concepts h4 { font-size: 14px; color: var(--muted); margin: 0 0 8px; }
.concept-list { display: flex; flex-wrap: wrap; gap: 6px; }
.concept-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 3px;
  background: rgba(158, 36, 38, 0.07);
  color: var(--red);
}
</style>
```

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds. ExperimentView renders shell.

- [ ] **Step 3: Commit**

```bash
git add src/experiments/ExperimentView.vue src/experiments/components/TutorialTemplate.vue
git commit -m "feat: add ExperimentView shell and TutorialTemplate component"
```

---

### Task 7: 热力环流 3D 实验

**Files:**
- Create: `src/experiments/modules/meteorology/ThermalCirculation.vue`

**Scene:** 透明方盒，左侧红色热源，右侧蓝色冷源。粒子沿对流环运动——热源处上升，顶部流向冷端，冷端下沉，底部回流。粒子颜色随高度变化（暖色→冷色）。

**Controls:** 热源温度、粒子数量、播放/暂停。

- [ ] **Step 1: Write ThermalCirculation.vue**

```html
<template>
  <div class="tc-layout">
    <aside class="tc-panel">
      <label>热源温差 <span>{{ tempDiff }}</span></label>
      <input type="range" min="1" max="10" v-model.number="tempDiff" @input="onParam" />
      <label>粒子数量 <span>{{ particleCount }}</span></label>
      <input type="range" min="50" max="300" step="10" v-model.number="particleCount" @input="onParam" />
      <button @click="togglePause">{{ paused ? '▶ 播放' : '⏸ 暂停' }}</button>
      <button @click="reset">↺ 重置</button>
      <p class="tc-hint">🖱 拖动旋转 · 滚轮缩放</p>
    </aside>
    <div class="tc-canvas-wrap">
      <canvas ref="cvs"></canvas>
    </div>
  </div>
</template>

<script>
import { ExperimentEngine } from '../../engine/ExperimentEngine.js'
import * as THREE from 'three'

export default {
  name: 'ThermalCirculation',
  data() {
    return {
      tempDiff: 5,
      particleCount: 150,
      paused: false,
    }
  },
  mounted() {
    this._e = new ThermalCirculationEngine()
    this._e.tempDiff = this.tempDiff
    this.$nextTick(() => this._e.init(this.$refs.cvs))
    window.addEventListener('resize', this._onResize)
  },
  beforeUnmount() {
    this._e?.dispose()
    window.removeEventListener('resize', this._onResize)
  },
  methods: {
    _onResize() { this._e?.resize() },
    togglePause() { this.paused = !this.paused; this._e.paused = this.paused },
    onParam() { this._e.setParams({ tempDiff: this.tempDiff, particleCount: this.particleCount }) },
    reset() {
      this._e.dispose()
      this.$nextTick(() => { this._e.init(this.$refs.cvs); this._e.tempDiff = this.tempDiff })
    },
  },
}

class ThermalCirculationEngine extends ExperimentEngine {
  setupScene() {
    this.tempDiff = 5
    this.paused = false

    // transparent box
    const boxGeo = new THREE.BoxGeometry(8, 4, 4)
    const boxEdges = new THREE.EdgesGeometry(boxGeo)
    const boxLine = new THREE.LineSegments(boxEdges, new THREE.LineBasicMaterial({ color: 0x8f7652, transparent: true, opacity: 0.35 }))
    this.scene.add(boxLine)

    // hot plate
    const hotGeo = new THREE.BoxGeometry(1, 0.15, 3)
    this.hotMat = new THREE.MeshStandardMaterial({ color: 0xe53935, emissive: 0xe53935, emissiveIntensity: 0.5 })
    this.hotPlate = new THREE.Mesh(hotGeo, this.hotMat)
    this.hotPlate.position.set(-3.6, -2, 0)
    this.scene.add(this.hotPlate)

    // cold plate
    const coldGeo = new THREE.BoxGeometry(1, 0.15, 3)
    this.coldMat = new THREE.MeshStandardMaterial({ color: 0x1e88e5, emissive: 0x1e88e5, emissiveIntensity: 0.3 })
    this.coldPlate = new THREE.Mesh(coldGeo, this.coldMat)
    this.coldPlate.position.set(3.6, -2, 0)
    this.scene.add(this.coldPlate)

    // label planes (simple text using sprites)
    this._addLabel('🔥 热源', -3.6, -1.6, 1.8, 0xe53935)
    this._addLabel('🧊 冷源', 3.6, -1.6, 1.8, 0x1e88e5)

    // particles
    this._particles = []
    this._spawn(150)

    // camera
    this.camera.position.set(0, 2, 10)
    this.controls.target.set(0, 0, 0)
  }

  _addLabel(text, x, y, z, color) {
    const canvas = document.createElement('canvas')
    canvas.width = 256; canvas.height = 64
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#' + color.toString(16).padStart(6, '0')
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText(text, 10, 40)
    const tex = new THREE.CanvasTexture(canvas)
    const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true })
    const sprite = new THREE.Sprite(spriteMat)
    sprite.position.set(x, y, z)
    sprite.scale.set(2, 0.5, 1)
    this.scene.add(sprite)
  }

  _spawn(count) {
    this._particles.forEach(p => this.scene.remove(p))
    this._particles = []
    const geo = new THREE.SphereGeometry(0.07, 4, 4)
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: 0x888888 })
      const dot = new THREE.Mesh(geo, mat)
      dot.position.set((Math.random() - 0.5) * 7, (Math.random() - 0.5) * 3.5, (Math.random() - 0.5) * 3)
      dot.userData = { phase: Math.random() * Math.PI * 2, speed: 0.004 + Math.random() * 0.008, y0: (Math.random() - 0.5) * 1.5 }
      this.scene.add(dot)
      this._particles.push(dot)
    }
  }

  update(dt) {
    if (this.paused) return
    const diff = this.tempDiff / 5
    this.hotMat.emissiveIntensity = 0.2 + diff * 0.8
    this.coldMat.emissiveIntensity = 0.05 + (1 - diff / 2) * 0.3

    const speed = diff * 2.5
    for (const dot of this._particles) {
      dot.userData.phase += dt * dot.userData.speed * speed
      const p = dot.userData.phase % (Math.PI * 2)
      // elliptical convection cell: rise over hot, sink over cold
      const px = 3.8 * Math.cos(p)
      const py = 1.6 * Math.sin(p * 2) * 0.7 + dot.userData.y0 * 0.2
      const pz = 1.6 * Math.sin(p)
      dot.position.set(px, py, pz)

      const h = (py + 1.8) / 3.6
      dot.material.color.setHSL(0.08 + (1 - h) * 0.55, 0.8, 0.25 + h * 0.5)
    }
  }

  setParams({ tempDiff, particleCount }) {
    if (tempDiff !== undefined) this.tempDiff = tempDiff
    if (particleCount !== undefined) this._spawn(particleCount)
  }
}
</script>

<style scoped>
.tc-layout { display: flex; gap: 0; border-radius: var(--radius-box); overflow: hidden; border: 1px solid var(--brown-light); }
.tc-panel {
  width: 200px;
  flex-shrink: 0;
  background: var(--card-bg);
  padding: 16px;
  border-right: 1px solid var(--brown-light);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.tc-panel label { font-size: 13px; color: var(--ink); display: flex; justify-content: space-between; }
.tc-panel input[type="range"] { width: 100%; accent-color: var(--red); }
.tc-panel button {
  padding: 6px 12px;
  border: 1px solid var(--brown);
  border-radius: var(--radius-sm);
  background: var(--cream);
  color: var(--ink);
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
}
.tc-panel button:hover { background: var(--button-green); }
.tc-hint { font-size: 11px; color: var(--muted); text-align: center; margin-top: auto; }
.tc-canvas-wrap { flex: 1; min-height: 460px; background: var(--cream); }
.tc-canvas-wrap canvas { width: 100%; height: 100%; display: block; }

@media (max-width: 720px) {
  .tc-layout { flex-direction: column; }
  .tc-panel { width: 100%; border-right: 0; border-bottom: 1px solid var(--brown-light); flex-direction: row; flex-wrap: wrap; gap: 8px; }
  .tc-panel label { flex: 1; min-width: 120px; }
  .tc-canvas-wrap { min-height: 320px; }
}
</style>
```

- [ ] **Step 2: Verify build + test render**

Run: `pnpm build && pnpm dev`
Then check `http://127.0.0.1:4173/#/experiments/meteorology/thermal-circulation`
Expected: 3D scene with convection particles, adjustable sliders work.

- [ ] **Step 3: Commit**

```bash
git add src/experiments/modules/meteorology/ThermalCirculation.vue
git commit -m "feat: add thermal circulation 3D experiment"
```

---

### Task 8: 科里奥利力 3D 实验

**Files:**
- Create: `src/experiments/modules/meteorology/Coriolis.vue`

**Scene:** 旋转圆盘水槽。中心放置冰柱（蓝色），外围是红色温水。粒子从外围向内运动时被科里奥利力偏转，形成螺旋轨迹。用户可调节旋转速度，切换南北半球观察偏转方向差异。

**Controls:** 旋转速度、半球切换（北/南）、粒子数量。

- [ ] **Step 1: Write Coriolis.vue**

```html
<template>
  <div class="cor-layout">
    <aside class="cor-panel">
      <label>旋转速度 <span>{{ rotationSpeed }}</span></label>
      <input type="range" min="0" max="10" v-model.number="rotationSpeed" @input="onParam" />
      <label>半球</label>
      <div class="cor-toggle">
        <button :class="{ active: hemisphere === 'north' }" @click="setHemi('north')">北半球</button>
        <button :class="{ active: hemisphere === 'south' }" @click="setHemi('south')">南半球</button>
      </div>
      <label>粒子数量 <span>{{ particleCount }}</span></label>
      <input type="range" min="30" max="150" v-model.number="particleCount" @input="onParam" />
      <button @click="reset">↺ 重置</button>
      <p class="cor-hint">🖱 拖动旋转 · 滚轮缩放</p>
    </aside>
    <div class="cor-canvas-wrap">
      <canvas ref="cvs"></canvas>
    </div>
  </div>
</template>

<script>
import { ExperimentEngine } from '../../engine/ExperimentEngine.js'
import * as THREE from 'three'

export default {
  name: 'Coriolis',
  data() {
    return { rotationSpeed: 5, hemisphere: 'north', particleCount: 80 }
  },
  mounted() {
    this._e = new CoriolisEngine()
    this.$nextTick(() => this._e.init(this.$refs.cvs))
    window.addEventListener('resize', () => this._e?.resize())
  },
  beforeUnmount() { this._e?.dispose(); window.removeEventListener('resize', () => this._e?.resize()) },
  methods: {
    onParam() { this._e.setParams({ rotationSpeed: this.rotationSpeed, hemisphere: this.hemisphere, particleCount: this.particleCount }) },
    setHemi(h) { this.hemisphere = h; this.onParam() },
    reset() { this._e.dispose(); this.$nextTick(() => this._e.init(this.$refs.cvs)) },
  },
}

class CoriolisEngine extends ExperimentEngine {
  setupScene() {
    // rotating disk
    const diskGeo = new THREE.CylinderGeometry(4, 4, 0.15, 48)
    const diskMat = new THREE.MeshStandardMaterial({ color: 0xf5f0e0, roughness: 0.7 })
    this.disk = new THREE.Mesh(diskGeo, diskMat)
    this.scene.add(this.disk)

    // rim
    const rimGeo = new THREE.TorusGeometry(4, 0.08, 16, 64)
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xb8a57a })
    const rim = new THREE.Mesh(rimGeo, rimMat)
    rim.rotation.x = Math.PI / 2
    rim.position.y = 0.08
    this.scene.add(rim)

    // center ice (blue cylinder)
    const iceGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.2, 24)
    const iceMat = new THREE.MeshStandardMaterial({ color: 0x42a5f5, emissive: 0x42a5f5, emissiveIntensity: 0.3, transparent: true, opacity: 0.85 })
    this.ice = new THREE.Mesh(iceGeo, iceMat)
    this.ice.position.y = 0.6
    this.scene.add(this.ice)

    // particles
    this.hemisphere = 'north'
    this.rotationSpeed = 5
    this._particles = []
    this._spawn(80)

    this.camera.position.set(0, 8, 8)
    this.controls.target.set(0, 0.3, 0)
  }

  _spawn(count) {
    this._particles.forEach(p => this.scene.remove(p))
    this._particles = []
    const geo = new THREE.SphereGeometry(0.08, 6, 6)
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: 0xe53935 })
      const dot = new THREE.Mesh(geo, mat)
      const angle = Math.random() * Math.PI * 2
      const radius = 2 + Math.random() * 1.8
      dot.position.set(Math.cos(angle) * radius, 0.15, Math.sin(angle) * radius)
      dot.userData = { angle, radius, phase: Math.random() * Math.PI * 2 }
      this.scene.add(dot)
      this._particles.push(dot)
    }
  }

  update(dt) {
    const speed = this.rotationSpeed / 5  // 0-2
    this.disk.rotation.y += dt * speed * 1.2
    this.ice.rotation.y += dt * speed * 1.2

    const coriolisSign = this.hemisphere === 'north' ? 1 : -1

    for (const dot of this._particles) {
      // particle moves inward + gets deflected by Coriolis
      dot.userData.radius -= dt * 0.15 * speed
      if (dot.userData.radius < 0.6) dot.userData.radius = 3.5
      // angular deflection proportional to radial velocity * rotation
      dot.userData.angle += dt * coriolisSign * speed * 1.8 / (dot.userData.radius + 0.3)
      dot.position.x = Math.cos(dot.userData.angle) * dot.userData.radius
      dot.position.z = Math.sin(dot.userData.angle) * dot.userData.radius
      // color shift as it approaches center
      const t = (dot.userData.radius - 0.5) / 3
      dot.material.color.setHSL(0.0 + t * 0.15, 1, 0.3 + t * 0.4)
    }
  }

  setParams({ rotationSpeed, hemisphere, particleCount }) {
    if (rotationSpeed !== undefined) this.rotationSpeed = rotationSpeed
    if (hemisphere !== undefined) this.hemisphere = hemisphere
    if (particleCount !== undefined) this._spawn(particleCount)
  }
}
</script>

<style scoped>
.cor-layout { display: flex; gap: 0; border-radius: var(--radius-box); overflow: hidden; border: 1px solid var(--brown-light); }
.cor-panel { width: 200px; flex-shrink: 0; background: var(--card-bg); padding: 16px; border-right: 1px solid var(--brown-light); display: flex; flex-direction: column; gap: 10px; }
.cor-panel label { font-size: 13px; color: var(--ink); display: flex; justify-content: space-between; }
.cor-panel input[type="range"] { width: 100%; accent-color: var(--red); }
.cor-toggle { display: flex; gap: 4px; }
.cor-toggle button {
  flex: 1; padding: 4px 0; border: 1px solid var(--brown); border-radius: var(--radius-sm);
  background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 12px;
}
.cor-toggle button.active { background: var(--red); color: #fff; border-color: var(--red); }
.cor-panel button {
  padding: 6px 12px; border: 1px solid var(--brown); border-radius: var(--radius-sm);
  background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 13px;
}
.cor-panel button:hover { background: var(--button-green); }
.cor-hint { font-size: 11px; color: var(--muted); text-align: center; margin-top: auto; }
.cor-canvas-wrap { flex: 1; min-height: 460px; background: var(--cream); }
.cor-canvas-wrap canvas { width: 100%; height: 100%; display: block; }

@media (max-width: 720px) {
  .cor-layout { flex-direction: column; }
  .cor-panel { width: 100%; border-right: 0; border-bottom: 1px solid var(--brown-light); flex-direction: row; flex-wrap: wrap; gap: 8px; }
  .cor-canvas-wrap { min-height: 320px; }
}
</style>
```

- [ ] **Step 2: Verify build + test render**

Run: `pnpm build && pnpm dev`
Check `http://127.0.0.1:4173/#/experiments/meteorology/coriolis`
Expected: Rotating disk with spiral particle paths, hemisphere toggle reverses deflection.

- [ ] **Step 3: Commit**

```bash
git add src/experiments/modules/meteorology/Coriolis.vue
git commit -m "feat: add Coriolis rotating tank 3D experiment"
```

---

### Task 9: 瓶中云 + 气象仪器 tutorial 实验

**Files:**
- Create: `src/experiments/modules/meteorology/CloudBottle.vue`
- Create: `src/experiments/modules/meteorology/WeatherInstruments.vue`

- [ ] **Step 1: Write CloudBottle.vue (tutorial)**

```html
<template></template>
<script>
export const steps = [
  {
    title: '准备材料',
    content: '准备一个透明塑料瓶（带盖）、少量温水、一根火柴（或一支香）。实验在安全环境下进行，注意防火。',
    highlight: '温水提供水汽，火柴提供凝结核（烟尘颗粒）。',
  },
  {
    title: '引入水汽和凝结核',
    content: '向瓶中倒入少量温水（约 2-3 cm 深），轻轻摇晃使瓶壁湿润。点燃火柴，吹灭后迅速将带烟的火柴头伸入瓶中，让烟尘进入瓶内，然后拧紧瓶盖。',
    highlight: '烟尘颗粒是云滴形成的必要条件——它们作为凝结核，水汽分子可以在其表面聚集。',
  },
  {
    title: '加压——压缩升温',
    content: '用手用力挤压瓶身（或扭转瓶身使其变形）。这一步增加了瓶内气压，空气被压缩后温度升高（绝热压缩），瓶内相对湿度降低，云消失。',
    highlight: '绝热压缩：PV = nRT，体积减小 → 温度升高 → 饱和水汽压升高 → 相对湿度下降。',
  },
  {
    title: '释压——膨胀降温，云形成',
    content: '快速松开手，让瓶子回弹。瓶内空气绝热膨胀，温度骤降，相对湿度迅速达到 100% 以上（过饱和），水汽在烟尘颗粒上凝结成微小水滴——可见的"云"出现了！',
    highlight: '绝热膨胀是大气中云形成的主要机制。空气上升 → 气压降低 → 膨胀冷却 → 水汽凝结 → 云。',
  },
  {
    title: '重复观察',
    content: '反复挤压和释放几次，观察云的反复出现和消失。每次挤压（加压升温）时云消失，释放（减压降温）时云重新形成。这模拟了大气中空气上升降温成云的过程。',
    highlight: '在真实大气中，湿空气团上升时经历绝热膨胀冷却，当温度降到露点以下时，水汽在气溶胶颗粒上凝结，形成云。干绝热递减率约 10°C/km，湿绝热递减率约 6°C/km。',
  },
]

export default { name: 'CloudBottle' }
</script>
```

- [ ] **Step 2: Write WeatherInstruments.vue (tutorial)**

```html
<template></template>
<script>
export const steps = [
  {
    title: '气球气压计',
    content: '将一个气球剪开，绷紧覆盖在广口瓶的瓶口上，用橡皮筋扎紧。将一根吸管的一端粘在气球膜中央，另一端作为指针。当大气压变化时，气球膜会凹陷或凸起，带动吸管指针上下偏移。气压升高 → 膜凹陷 → 指针上翘；气压降低 → 膜凸起 → 指针下垂。',
    highlight: '气压变化引起密闭瓶内外的压力差，使弹性膜变形。标准大气压 = 1013.25 hPa。',
  },
  {
    title: '乒乓球风速计',
    content: '将一个乒乓球用细线悬挂在量角器的中心点。风吹动乒乓球，使细线偏离垂直方向。测量偏角 θ，风速 v ≈ √(mg·tanθ / (0.5·ρ·Cd·A))。偏角越大，风速越大。可以用已知风速校准。',
    highlight: '风对球的拖曳力与风速的平方成正比。蒲福风级将风速分为 0-12 级。',
  },
  {
    title: '简易雨量计',
    content: '取一个直筒透明容器（如量筒），在上方放置一个漏斗（确保漏斗边缘水平）。将装置放在开阔处。降雨后读取收集的水深。雨量 = 收集水体体积 / 漏斗口面积。1 mm 降雨量 = 每平方米 1 升水。',
    highlight: '标准雨量计口径 20 cm，安装高度 0.7 m（中国标准）。降水强度：小雨 < 10 mm/h，暴雨 > 50 mm/h。',
  },
  {
    title: '风向标',
    content: '在吸管一端剪出一个箭头形尾翼，另一端加配重（橡皮泥），中间用大头针垂直穿过作为转轴。将大头针插在铅笔顶端的橡皮上。放在风中，箭头指向风吹来的方向。风的命名以来向为准（如北风 = 从北向南吹）。',
    highlight: '风向用 16 方位或 0-360° 表示。气象站标准高度 10 m。',
  },
]

export default { name: 'WeatherInstruments' }
</script>
```

- [ ] **Step 3: Verify build**

Run: `pnpm build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/experiments/modules/meteorology/CloudBottle.vue src/experiments/modules/meteorology/WeatherInstruments.vue
git commit -m "feat: add cloud bottle and weather instruments tutorial experiments"
```

---

### Task 10: 流水地貌模拟台 3D 实验

**Files:**
- Create: `src/experiments/modules/hydrology/StreamTable.vue`

**Scene:** 倾斜沙盘。顶部水源持续出水，水流在沙面上切割出河道。粒子显示水流路径。用户可调节坡度和流量，观察侵蚀和沉积变化。

**Controls:** 坡度、水流量、重置地形。

- [ ] **Step 1: Write StreamTable.vue**

```html
<template>
  <div class="st-layout">
    <aside class="st-panel">
      <label>坡度 <span>{{ slope }}°</span></label>
      <input type="range" min="2" max="20" v-model.number="slope" @input="onParam" />
      <label>水流量 <span>{{ flowRate }}</span></label>
      <input type="range" min="1" max="10" v-model.number="flowRate" @input="onParam" />
      <button @click="reset">↺ 重置地形</button>
      <p class="st-hint">🖱 拖动旋转 · 滚轮缩放</p>
    </aside>
    <div class="st-canvas-wrap">
      <canvas ref="cvs"></canvas>
    </div>
  </div>
</template>

<script>
import { ExperimentEngine } from '../../engine/ExperimentEngine.js'
import * as THREE from 'three'

export default {
  name: 'StreamTable',
  data() { return { slope: 8, flowRate: 5 } },
  mounted() {
    this._e = new StreamTableEngine()
    this.$nextTick(() => this._e.init(this.$refs.cvs))
    window.addEventListener('resize', () => this._e?.resize())
  },
  beforeUnmount() { this._e?.dispose(); window.removeEventListener('resize', () => this._e?.resize()) },
  methods: {
    onParam() { this._e.setParams({ slope: this.slope, flowRate: this.flowRate }) },
    reset() { this._e.dispose(); this.$nextTick(() => this._e.init(this.$refs.cvs)) },
  },
}

class StreamTableEngine extends ExperimentEngine {
  setupScene() {
    // terrain mesh
    const size = 8
    const segments = 64
    const geo = new THREE.PlaneGeometry(size, size, segments, segments)
    geo.rotateX(-Math.PI / 2)

    // heightmap: slight random + valley
    this.heights = new Float32Array((segments + 1) * (segments + 1))
    const pos = geo.attributes.position
    for (let i = 0; i <= segments; i++) {
      for (let j = 0; j <= segments; j++) {
        const x = (i / segments - 0.5) * size
        const z = (j / segments - 0.5) * size
        const h = -0.3 + z * 0.06 + (Math.random() - 0.5) * 0.25 + Math.sin(x * 1.2) * 0.15
        this.heights[i * (segments + 1) + j] = h
        pos.setZ(i * (segments + 1) + j, h)
      }
    }
    geo.computeVertexNormals()
    const mat = new THREE.MeshStandardMaterial({ color: 0xc8a96e, roughness: 0.85, flatShading: false })
    this.terrain = new THREE.Mesh(geo, mat)
    this.terrain.receiveShadow = true
    this.scene.add(this.terrain)

    // base plane (water collection)
    const baseGeo = new THREE.PlaneGeometry(size + 1, 2)
    baseGeo.rotateX(-Math.PI / 2)
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x5c8a8a, roughness: 0.3, transparent: true, opacity: 0.6 })
    const base = new THREE.Mesh(baseGeo, baseMat)
    base.position.set(0, -0.5, size / 2 + 0.5)
    this.scene.add(base)

    // water particles
    this.slope = 8
    this.flowRate = 5
    this._drops = []
    this._spawnDrops(60)

    // grid helper
    const grid = new THREE.GridHelper(size, 16, 0xb8a57a, 0xd5c39c)
    grid.position.y = -0.1
    this.scene.add(grid)

    this.camera.position.set(6, 7, 5)
    this.controls.target.set(0, -0.2, 0)
  }

  _spawnDrops(count) {
    this._drops.forEach(d => this.scene.remove(d))
    this._drops = []
    const geo = new THREE.SphereGeometry(0.06, 4, 4)
    const mat = new THREE.MeshBasicMaterial({ color: 0x42a5f5 })
    for (let i = 0; i < count; i++) {
      const drop = new THREE.Mesh(geo, mat.clone())
      // start near top of slope
      drop.position.set((Math.random() - 0.5) * 6, 0.5, -3.5 + Math.random() * 1)
      drop.userData = { speed: 0.5 + Math.random() * 1.5 }
      this.scene.add(drop)
      this._drops.push(drop)
    }
  }

  update(dt) {
    const s = this.slope / 10
    const f = this.flowRate / 5
    for (const drop of this._drops) {
      // flow downhill (positive Z is downhill)
      drop.position.z += dt * drop.userData.speed * f * s * 2
      drop.position.x += dt * (Math.sin(drop.position.z * 2 + drop.position.x) * 0.3) * f
      // meander
      drop.position.x += dt * Math.sin(drop.position.z * 3 + drop.userData.speed * 2) * 0.2
      // wrap
      if (drop.position.z > 4.5) {
        drop.position.z = -3.5
        drop.position.x = (Math.random() - 0.5) * 6
      }
      // keep in bounds
      drop.position.x = Math.max(-3.8, Math.min(3.8, drop.position.x))
      // height follows terrain approximately
      drop.position.y = -0.15 + drop.position.z * 0.03 + Math.sin(drop.position.x * 1.2) * 0.05
    }
  }

  setParams({ slope, flowRate }) {
    if (slope !== undefined) this.slope = slope
    if (flowRate !== undefined) this.flowRate = flowRate
  }
}
</script>

<style scoped>
.st-layout { display: flex; gap: 0; border-radius: var(--radius-box); overflow: hidden; border: 1px solid var(--brown-light); }
.st-panel { width: 200px; flex-shrink: 0; background: var(--card-bg); padding: 16px; border-right: 1px solid var(--brown-light); display: flex; flex-direction: column; gap: 10px; }
.st-panel label { font-size: 13px; color: var(--ink); display: flex; justify-content: space-between; }
.st-panel input[type="range"] { width: 100%; accent-color: var(--red); }
.st-panel button { padding: 6px 12px; border: 1px solid var(--brown); border-radius: var(--radius-sm); background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 13px; }
.st-panel button:hover { background: var(--button-green); }
.st-hint { font-size: 11px; color: var(--muted); text-align: center; margin-top: auto; }
.st-canvas-wrap { flex: 1; min-height: 460px; background: var(--cream); }
.st-canvas-wrap canvas { width: 100%; height: 100%; display: block; }

@media (max-width: 720px) {
  .st-layout { flex-direction: column; }
  .st-panel { width: 100%; border-right: 0; border-bottom: 1px solid var(--brown-light); flex-direction: row; flex-wrap: wrap; gap: 8px; }
  .st-canvas-wrap { min-height: 320px; }
}
</style>
```

- [ ] **Step 2: Verify build + test render**

Run: `pnpm build && pnpm dev`
Check `http://127.0.0.1:4173/#/experiments/hydrology/stream-table`
Expected: Sloped terrain with blue water droplets flowing downhill.

- [ ] **Step 3: Commit**

```bash
git add src/experiments/modules/hydrology/StreamTable.vue
git commit -m "feat: add stream table 3D experiment"
```

---

### Task 11: 地下水 + 搬运能力 3D 实验 + 水文学 tutorial 实验

**Files:**
- Create: `src/experiments/modules/hydrology/Groundwater.vue`
- Create: `src/experiments/modules/hydrology/SedimentTransport.vue`
- Create: `src/experiments/modules/hydrology/Infiltration.vue`
- Create: `src/experiments/modules/hydrology/WaterCycle.vue`

**Groundwater scene:** 地下剖面——层状沉积层（沙/砾/黏土），蓝色水位面，可抽水的井（吸管），水位下降形成漏斗曲线。

**SedimentTransport scene:** 流槽剖面，不同粒径颗粒（黏土→砾石）在底部排列。流速滑块控制水流速度，颗粒根据 Hjulstrom 曲线被侵蚀/搬运/沉积。

**Infiltration + WaterCycle:** tutorial，各 4 步骤。

- [ ] **Step 1: Write Groundwater.vue**

```html
<template>
  <div class="gw-layout">
    <aside class="gw-panel">
      <label>抽水速率 <span>{{ pumpRate }}</span></label>
      <input type="range" min="0" max="10" v-model.number="pumpRate" @input="onParam" />
      <label>降雨补给 <span>{{ recharge }}</span></label>
      <input type="range" min="0" max="10" v-model.number="recharge" @input="onParam" />
      <button @click="reset">↺ 重置</button>
      <p class="gw-hint">🖱 拖动旋转 · 滚轮缩放</p>
    </aside>
    <div class="gw-canvas-wrap">
      <canvas ref="cvs"></canvas>
    </div>
  </div>
</template>

<script>
import { ExperimentEngine } from '../../engine/ExperimentEngine.js'
import * as THREE from 'three'

export default {
  name: 'Groundwater',
  data() { return { pumpRate: 3, recharge: 4 } },
  mounted() {
    this._e = new GroundwaterEngine()
    this.$nextTick(() => this._e.init(this.$refs.cvs))
    window.addEventListener('resize', () => this._e?.resize())
  },
  beforeUnmount() { this._e?.dispose(); window.removeEventListener('resize', () => this._e?.resize()) },
  methods: {
    onParam() { this._e.setParams({ pumpRate: this.pumpRate, recharge: this.recharge }) },
    reset() { this._e.dispose(); this.$nextTick(() => this._e.init(this.$refs.cvs)) },
  },
}

class GroundwaterEngine extends ExperimentEngine {
  setupScene() {
    // cross-section layers
    const layers = [
      { y: 1.2, h: 0.6, color: 0xc8a96e, label: '表土层' },
      { y: 0.5, h: 0.7, color: 0xd4b896, label: '砂层 (含水层)' },
      { y: -0.3, h: 0.8, color: 0x9e8c7a, label: '黏土层 (隔水层)' },
      { y: -1.2, h: 0.9, color: 0x8b7355, label: '基岩' },
    ]
    layers.forEach(({ y, h, color }) => {
      const geo = new THREE.BoxGeometry(8, h, 3)
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.8 })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.y = y
      this.scene.add(mesh)
    })

    // water table (semi-transparent blue plane)
    const wtGeo = new THREE.PlaneGeometry(8, 3)
    wtGeo.rotateX(-Math.PI / 2)
    const wtMat = new THREE.MeshStandardMaterial({ color: 0x42a5f5, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
    this.waterTable = new THREE.Mesh(wtGeo, wtMat)
    this.waterTable.position.y = 0.4
    this.scene.add(this.waterTable)

    // well (cylinder)
    const wellGeo = new THREE.CylinderGeometry(0.12, 0.12, 3, 16)
    const wellMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.4 })
    this.well = new THREE.Mesh(wellGeo, wellMat)
    this.well.position.set(0, 0, 0)
    this.scene.add(this.well)

    // pump label
    const coneGeo = new THREE.SphereGeometry(0.3, 16, 16)
    this.coneMat = new THREE.MeshBasicMaterial({ color: 0x42a5f5, transparent: true, opacity: 0.25 })
    this.cone = new THREE.Mesh(coneGeo, this.coneMat)
    this.cone.position.set(0, 0.4, 0)
    this.scene.add(this.cone)

    this.pumpRate = 3
    this.recharge = 4

    this.camera.position.set(0, 2, 8)
    this.controls.target.set(0, 0, 0)
  }

  update(dt) {
    const pr = this.pumpRate / 5
    const rc = this.recharge / 5
    const wtY = 0.4 - pr * 0.8 + rc * 0.6
    this.waterTable.position.y = wtY
    // cone of depression
    const coneScale = 1 + pr * 2
    this.cone.scale.set(coneScale, 0.3, coneScale)
    this.cone.position.y = wtY
    this.coneMat.opacity = 0.1 + pr * 0.3
  }

  setParams({ pumpRate, recharge }) {
    if (pumpRate !== undefined) this.pumpRate = pumpRate
    if (recharge !== undefined) this.recharge = recharge
  }
}
</script>

<style scoped>
.gw-layout { display: flex; gap: 0; border-radius: var(--radius-box); overflow: hidden; border: 1px solid var(--brown-light); }
.gw-panel { width: 200px; flex-shrink: 0; background: var(--card-bg); padding: 16px; border-right: 1px solid var(--brown-light); display: flex; flex-direction: column; gap: 10px; }
.gw-panel label { font-size: 13px; color: var(--ink); display: flex; justify-content: space-between; }
.gw-panel input[type="range"] { width: 100%; accent-color: var(--red); }
.gw-panel button { padding: 6px 12px; border: 1px solid var(--brown); border-radius: var(--radius-sm); background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 13px; }
.gw-panel button:hover { background: var(--button-green); }
.gw-hint { font-size: 11px; color: var(--muted); text-align: center; margin-top: auto; }
.gw-canvas-wrap { flex: 1; min-height: 460px; background: var(--cream); }
.gw-canvas-wrap canvas { width: 100%; height: 100%; display: block; }

@media (max-width: 720px) {
  .gw-layout { flex-direction: column; }
  .gw-panel { width: 100%; border-right: 0; border-bottom: 1px solid var(--brown-light); flex-direction: row; flex-wrap: wrap; gap: 8px; }
  .gw-canvas-wrap { min-height: 320px; }
}
</style>
```

- [ ] **Step 2: Write SedimentTransport.vue**

```html
<template>
  <div class="st2-layout">
    <aside class="st2-panel">
      <label>水流速度 <span>{{ velocity.toFixed(1) }} m/s</span></label>
      <input type="range" min="0" max="50" v-model.number="velocity" @input="onParam" step="0.5" />
      <div class="st2-legend">
        <div class="legend-item"><span class="legend-dot" style="background:#bdbdbd"></span> 黏土 &lt;0.004mm</div>
        <div class="legend-item"><span class="legend-dot" style="background:#a1887f"></span> 粉砂 0.004-0.06mm</div>
        <div class="legend-item"><span class="legend-dot" style="background:#ffcc80"></span> 砂 0.06-2mm</div>
        <div class="legend-item"><span class="legend-dot" style="background:#8d6e63"></span> 砾石 &gt;2mm</div>
      </div>
      <p class="st2-hint">🖱 拖动旋转 · 滚轮缩放</p>
    </aside>
    <div class="st2-canvas-wrap">
      <canvas ref="cvs"></canvas>
    </div>
  </div>
</template>

<script>
import { ExperimentEngine } from '../../engine/ExperimentEngine.js'
import * as THREE from 'three'

export default {
  name: 'SedimentTransport',
  data() { return { velocity: 5 } },
  mounted() {
    this._e = new SedimentTransportEngine()
    this.$nextTick(() => this._e.init(this.$refs.cvs))
    window.addEventListener('resize', () => this._e?.resize())
  },
  beforeUnmount() { this._e?.dispose(); window.removeEventListener('resize', () => this._e?.resize()) },
  methods: {
    onParam() { this._e.setParams({ velocity: this.velocity / 10 }) },
    reset() { this._e.dispose(); this.$nextTick(() => this._e.init(this.$refs.cvs)) },
  },
}

class SedimentTransportEngine extends ExperimentEngine {
  setupScene() {
    // trough bottom
    const troughGeo = new THREE.BoxGeometry(8, 0.1, 2)
    const troughMat = new THREE.MeshStandardMaterial({ color: 0x5d9b9b, roughness: 0.5, transparent: true, opacity: 0.6 })
    const trough = new THREE.Mesh(troughGeo, troughMat)
    trough.position.y = -1
    this.scene.add(trough)

    // sediment particles of different sizes
    this.sediments = []
    const grainTypes = [
      { size: 0.06, color: 0xbdbdbd, label: 'clay', criticalErosion: 2, criticalDeposit: 0.1 },
      { size: 0.12, color: 0xa1887f, label: 'silt', criticalErosion: 1.5, criticalDeposit: 0.3 },
      { size: 0.2, color: 0xffcc80, label: 'sand', criticalErosion: 1, criticalDeposit: 0.5 },
      { size: 0.35, color: 0x8d6e63, label: 'gravel', criticalErosion: 0.8, criticalDeposit: 1 },
    ]

    grainTypes.forEach((gt) => {
      for (let i = 0; i < 8; i++) {
        const geo = new THREE.SphereGeometry(gt.size, 8, 8)
        const mat = new THREE.MeshStandardMaterial({ color: gt.color, roughness: 0.6 })
        const grain = new THREE.Mesh(geo, mat)
        grain.position.set((Math.random() - 0.5) * 7, -0.9, (Math.random() - 0.5) * 1.5)
        grain.userData = { ...gt, origX: grain.position.x, origZ: grain.position.z, state: 'rest' }
        this.scene.add(grain)
        this.sediments.push(grain)
      }
    })

    // velocity arrow
    this.velocity = 0.5
    this.camera.position.set(0, 3, 6)
    this.controls.target.set(0, -0.8, 0)
  }

  update(dt) {
    const v = this.velocity
    for (const grain of this.sediments) {
      const ud = grain.userData
      if (v > ud.criticalErosion) {
        // erosion: particle moves with flow
        ud.state = 'eroding'
        grain.position.x += dt * v * 0.5 * (ud.size < 0.1 ? 2 : 1)
        grain.position.y += dt * v * 0.15
        if (grain.position.x > 4) grain.position.x = -4
      } else if (v < ud.criticalDeposit) {
        // deposition: particle settles
        if (ud.state === 'eroding') {
          grain.position.y -= dt * 0.3
          if (grain.position.y < -0.9) { grain.position.y = -0.9; ud.state = 'rest' }
        }
      }
    }
  }

  setParams({ velocity }) {
    if (velocity !== undefined) this.velocity = velocity
  }
}
</script>

<style scoped>
.st2-layout { display: flex; gap: 0; border-radius: var(--radius-box); overflow: hidden; border: 1px solid var(--brown-light); }
.st2-panel { width: 200px; flex-shrink: 0; background: var(--card-bg); padding: 16px; border-right: 1px solid var(--brown-light); display: flex; flex-direction: column; gap: 10px; }
.st2-panel label { font-size: 13px; color: var(--ink); display: flex; justify-content: space-between; }
.st2-panel input[type="range"] { width: 100%; accent-color: var(--red); }
.st2-legend { font-size: 11px; color: var(--muted); display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
.legend-item { display: flex; align-items: center; gap: 6px; }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.st2-hint { font-size: 11px; color: var(--muted); text-align: center; margin-top: auto; }
.st2-canvas-wrap { flex: 1; min-height: 460px; background: var(--cream); }
.st2-canvas-wrap canvas { width: 100%; height: 100%; display: block; }

@media (max-width: 720px) {
  .st2-layout { flex-direction: column; }
  .st2-panel { width: 100%; border-right: 0; border-bottom: 1px solid var(--brown-light); flex-direction: row; flex-wrap: wrap; gap: 8px; }
  .st2-canvas-wrap { min-height: 320px; }
}
</style>
```

- [ ] **Step 3: Write Infiltration.vue (tutorial)**

```html
<template></template>
<script>
export const steps = [
  {
    title: '准备实验材料',
    content: '准备 3 个浅盘（或切开的塑料瓶底部），分别装入：干燥沙土、普通园土、种草皮的有植被土。每个盘下方放一个收集容器。准备一个洒水壶模拟降雨。',
    highlight: '三个盘的表面积和土层厚度应尽量一致，以控制变量。',
  },
  {
    title: '模拟降雨',
    content: '用洒水壶从相同高度、以相同速率向三个盘均匀洒水（模拟等量降雨）。观察水在三个盘表面的行为：沙土盘水迅速下渗，园土盘部分下渗部分形成水洼，草皮盘水被植被拦截缓慢下渗。',
    highlight: '下渗速率取决于土壤孔隙度、有机质含量和植被根系通道。沙土孔隙大但持水性差，黏土孔隙小但持水性强。',
  },
  {
    title: '测量径流与下渗量',
    content: '收集每个盘下方的渗透水和表面的径流水，用量筒测量体积。计算：径流系数 = 径流量 / 总降雨量。典型结果：裸土径流系数 0.5-0.7，草地 0.1-0.3，沙土接近 0。',
    highlight: '植被覆盖是最有效的水土保持措施——根系增加土壤孔隙度，茎叶截留降雨、减缓雨滴动能。',
  },
  {
    title: '坡度对比（可选扩展）',
    content: '将园土盘分别倾斜不同角度（5°、15°、30°），重复降雨。坡度越大，地表径流越多、下渗越少。这也解释了为什么陡坡山地更容易发生水土流失和山洪。',
    highlight: '坡度每增加 10°，径流系数约增加 0.1-0.15。梯田是坡地农业中减少水土流失的有效工程措施。',
  },
]
export default { name: 'Infiltration' }
</script>
```

- [ ] **Step 4: Write WaterCycle.vue (tutorial)**

```html
<template></template>
<script>
export const steps = [
  {
    title: '搭建微型水循环系统',
    content: '在一个大碗中倒入约 1/3 的温水（可加几滴食用色素便于观察）。在碗中央放一个小杯子（空杯，用于收集"降水"）。用保鲜膜密封碗口，在保鲜膜中央（小杯正上方）放一颗石子或硬币，使膜略微下凹。',
    highlight: '这个封闭系统包含了水循环的全部要素：碗中的水 = 海洋/地表水，保鲜膜 = 大气层，小杯 = 陆地/湖泊。',
  },
  {
    title: '阳光照射——蒸发开始',
    content: '将装置放在阳光充足的窗台或台灯下。温水在光照下蒸发，水汽上升。观察保鲜膜内侧逐渐出现雾气（小水滴）——这是蒸发和凝结过程。',
    highlight: '太阳辐射是水循环的驱动力。全球每年约 577,000 km³ 的水通过蒸发进入大气。',
  },
  {
    title: '凝结与"降水"',
    content: '随着蒸发继续，保鲜膜上的雾气聚集成越来越大的水滴。当水滴足够大时，它们沿保鲜膜斜坡滑向中央（石子压低处），滴入小杯中。这就是"降水"——凝结的水滴大到足以克服重力下落。',
    highlight: '云滴直径约 10-20 μm，雨滴直径约 0.5-5 mm。一滴雨滴包含约 100 万个云滴。',
  },
  {
    title: '观察与总结',
    content: '等待 1-2 小时后，观察小杯中收集到的水量。这演示了蒸发→凝结→降水→收集的完整水循环。碗中的"海洋"水减少，小杯中的"陆地淡水"增加。真实水循环中，水还可以通过径流和地下水回流到海洋。',
    highlight: '水循环是地球系统中连接大气圈、水圈、岩石圈和生物圈的核心过程。水在大气中的平均停留时间约 9 天，在地下水中可达数百年。',
  },
]
export default { name: 'WaterCycle' }
</script>
```

- [ ] **Step 5: Verify build**

Run: `pnpm build`
Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/experiments/modules/hydrology/Groundwater.vue src/experiments/modules/hydrology/SedimentTransport.vue src/experiments/modules/hydrology/Infiltration.vue src/experiments/modules/hydrology/WaterCycle.vue
git commit -m "feat: add hydrology experiments (groundwater, sediment transport 3D + infiltration, water cycle tutorial)"
```

---

### Task 12: 沙箱断层 + 地层叠置律 3D 实验 + 地质 tutorial 实验

**Files:**
- Create: `src/experiments/modules/geology/FaultModel.vue`
- Create: `src/experiments/modules/geology/Stratigraphy.vue`
- Create: `src/experiments/modules/geology/SoilErosion.vue`
- Create: `src/experiments/modules/geology/MineralID.vue`
- Create: `src/experiments/modules/geology/PotatoCore.vue`

**FaultModel scene:** 水平层状沙箱（3-4 层不同颜色），一侧可移动的活塞墙。推/拉控制使层变形——挤压产生逆断层/褶皱，拉伸产生正断层/地堑。

**Stratigraphy scene:** 地层柱（4-5 层不同颜色/纹理），两个可拖动的"钻孔"位置显示岩心柱。切面视图展示叠置关系。包含一处不整合面和一个侵入体（穿插关系）。

**SoilErosion scene:** 两个并排坡面——一个裸露、一个有植被覆盖。降雨粒子下落，比较两侧径流浑浊度和土壤流失。

**MineralID + PotatoCore:** tutorial，各 4-5 步骤。

- [ ] **Step 1: Write FaultModel.vue**

```html
<template>
  <div class="fm-layout">
    <aside class="fm-panel">
      <label>压缩/拉伸</label>
      <div class="fm-buttons">
        <button @click="compress" :disabled="displacement >= 3">◀◀ 压缩</button>
        <button @click="extend">拉伸 ▶▶</button>
      </div>
      <label>位移 <span>{{ displacement.toFixed(1) }}</span></label>
      <input type="range" min="-3" max="3" step="0.1" v-model.number="displacement" @input="onParam" />
      <button @click="reset">↺ 重置</button>
      <p class="fm-hint">🖱 拖动旋转 · 滚轮缩放</p>
    </aside>
    <div class="fm-canvas-wrap">
      <canvas ref="cvs"></canvas>
    </div>
  </div>
</template>

<script>
import { ExperimentEngine } from '../../engine/ExperimentEngine.js'
import * as THREE from 'three'

export default {
  name: 'FaultModel',
  data() { return { displacement: 0 } },
  mounted() {
    this._e = new FaultModelEngine()
    this.$nextTick(() => this._e.init(this.$refs.cvs))
    window.addEventListener('resize', () => this._e?.resize())
  },
  beforeUnmount() { this._e?.dispose(); window.removeEventListener('resize', () => this._e?.resize()) },
  methods: {
    compress() { this.displacement = Math.min(3, this.displacement + 0.3); this.onParam() },
    extend() { this.displacement = Math.max(-3, this.displacement - 0.3); this.onParam() },
    onParam() { this._e.setParams({ displacement: this.displacement }) },
    reset() { this.displacement = 0; this._e.dispose(); this.$nextTick(() => this._e.init(this.$refs.cvs)) },
  },
}

class FaultModelEngine extends ExperimentEngine {
  setupScene() {
    // 4 colored layers
    const layerColors = [0xc8a96e, 0xd4b896, 0x9e8c7a, 0x8b7355]
    const layerNames = ['砂岩', '页岩', '石灰岩', '基岩']
    this.layers = []
    this._origPositions = []

    layerColors.forEach((color, i) => {
      const y = 1.5 - i * 0.8
      const geo = new THREE.BoxGeometry(6, 0.7, 3)
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
      const layer = new THREE.Mesh(geo, mat)
      layer.position.set(0, y, 0)
      layer.castShadow = true; layer.receiveShadow = true
      this.scene.add(layer)
      this.layers.push(layer)
      // Store original vertex positions for deformation
      this._origPositions.push({ mesh: layer, origX: layer.position.x, origGeo: geo.clone() })
    })

    // piston wall
    const wallGeo = new THREE.BoxGeometry(0.15, 4, 3.2)
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.4 })
    this.wall = new THREE.Mesh(wallGeo, wallMat)
    this.wall.position.set(3, 0, 0)
    this.scene.add(this.wall)

    // fixed wall on other side
    const fixedWall = new THREE.Mesh(wallGeo, wallMat)
    fixedWall.position.set(-3, 0, 0)
    this.scene.add(fixedWall)

    this.camera.position.set(5, 3, 8)
    this.controls.target.set(0, 0, 0)
    this._targetDisp = 0
    this._currentDisp = 0
  }

  update(dt) {
    // smooth interpolation toward target
    this._currentDisp += (this._targetDisp - this._currentDisp) * Math.min(dt * 8, 1)
    this.wall.position.x = 3 + this._currentDisp * 0.5

    // Deform layers: compression creates folding near the moving wall
    const d = this._currentDisp
    this.layers.forEach((layer, i) => {
      const origX = this._origPositions[i].origX
      // Displacement decreases with distance from piston
      const influence = 1 / (1 + Math.abs(layer.position.x - (3 + d * 0.5)) * 0.5)
      layer.position.x = origX + d * 0.3 * influence
      // Thickening near compression zone
      const scaleY = 1 + Math.max(0, d) * 0.25 * influence * (1 - i * 0.15)
      const scaleX = 1 - Math.max(0, d) * 0.15 * influence
      layer.scale.set(scaleX, scaleY, 1)
      // Fault offset: layers break and offset
      if (Math.abs(d) > 0.6) {
        const faultOffset = Math.sign(d) * Math.max(0, Math.abs(d) - 0.6) * 0.15 * (i + 1) * 0.3
        layer.position.y += faultOffset * (layer.position.x > 0 ? 1 : -0.3)
      }
    })
  }

  setParams({ displacement }) {
    if (displacement !== undefined) this._targetDisp = displacement
  }
}
</script>

<style scoped>
.fm-layout { display: flex; gap: 0; border-radius: var(--radius-box); overflow: hidden; border: 1px solid var(--brown-light); }
.fm-panel { width: 200px; flex-shrink: 0; background: var(--card-bg); padding: 16px; border-right: 1px solid var(--brown-light); display: flex; flex-direction: column; gap: 10px; }
.fm-panel label { font-size: 13px; color: var(--ink); display: flex; justify-content: space-between; }
.fm-panel input[type="range"] { width: 100%; accent-color: var(--red); }
.fm-buttons { display: flex; gap: 4px; }
.fm-buttons button { flex: 1; padding: 6px 0; border: 1px solid var(--brown); border-radius: var(--radius-sm); background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 12px; }
.fm-buttons button:hover:not(:disabled) { background: var(--button-green); }
.fm-buttons button:disabled { opacity: 0.4; cursor: default; }
.fm-panel button { padding: 6px 12px; border: 1px solid var(--brown); border-radius: var(--radius-sm); background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 13px; }
.fm-panel button:hover { background: var(--button-green); }
.fm-hint { font-size: 11px; color: var(--muted); text-align: center; margin-top: auto; }
.fm-canvas-wrap { flex: 1; min-height: 460px; background: var(--cream); }
.fm-canvas-wrap canvas { width: 100%; height: 100%; display: block; }

@media (max-width: 720px) {
  .fm-layout { flex-direction: column; }
  .fm-panel { width: 100%; border-right: 0; border-bottom: 1px solid var(--brown-light); flex-direction: row; flex-wrap: wrap; gap: 8px; }
  .fm-canvas-wrap { min-height: 320px; }
}
</style>
```

- [ ] **Step 2: Write remaining geology experiments (Stratigraphy, SoilErosion 3D + MineralID, PotatoCore tutorial)**

These follow the same patterns established above. Write each file according to the scene/controls descriptions at the top of this task.

**Stratigraphy.vue** — 3D: 4-5 visible layers in a cutaway block, two drill positions selectable, cross-section view, labels for unconformity and intrusion.

**SoilErosion.vue** — 3D: Two sloped terrain patches side by side (bare vs vegetated), rain particles fall from above, turbidity color changes downstream on bare side.

**MineralID.vue** — tutorial: 5 steps covering color/luster, streak test, Mohs hardness scratch test, cleavage observation, acid reaction test.

**PotatoCore.vue** — tutorial: 4 steps covering grid setup, taking core samples, recording data, building a 3D subsurface map.

- [ ] **Step 3: Verify build**

Run: `pnpm build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/experiments/modules/geology/
git commit -m "feat: add geology experiments (fault model, stratigraphy, soil erosion 3D + mineral ID, potato core tutorial)"
```

---

### Task 13: 天文学实验（5 个 3D）

**Files:**
- Create: `src/experiments/modules/astronomy/MoonPhases.vue`
- Create: `src/experiments/modules/astronomy/Seasons.vue`
- Create: `src/experiments/modules/astronomy/KeplerLaws.vue`
- Create: `src/experiments/modules/astronomy/SolarMotion.vue`
- Create: `src/experiments/modules/astronomy/Eclipse.vue`

**MoonPhases scene:** 中心地球（小球），月球绕地球轨道运动。远处固定光源（太阳）。从地球视角看月球被照亮面的变化。显示 8 个月相名称。

**Seasons scene:** 太阳（中心大球）+ 地球轨道。地轴倾角 23.5° 可视化。四个位置标记（春分/夏至/秋分/冬至）。地球表面有日照强度颜色映射。

**KeplerLaws scene:** 椭圆轨道（可调离心率），行星沿轨道运动。等时扇形面积可视化。右侧面板显示 P² vs a³ 对照。

**SolarMotion scene:** 半球天穹，太阳沿轨道移动。地面上有影子投影。纬度可调，展示不同纬度的周日弧。

**Eclipse scene:** 日月地三点一线。本影/半影锥可视化。区分日全食/日环食/月全食。

Each follows the established 3D experiment pattern (panel + canvas + engine class).

- [ ] **Step 1: Write MoonPhases.vue**

```html
<template>
  <div class="mp-layout">
    <aside class="mp-panel">
      <label>月球位置 (旋转角度)</label>
      <input type="range" min="0" max="360" v-model.number="moonAngle" @input="onParam" />
      <div class="mp-phase-label">当前月相：<strong>{{ phaseName }}</strong></div>
      <button @click="autoPlay">{{ auto ? '⏸ 暂停' : '▶ 自动演示' }}</button>
      <p class="mp-hint">🖱 拖动旋转 · 滚轮缩放</p>
    </aside>
    <div class="mp-canvas-wrap">
      <canvas ref="cvs"></canvas>
    </div>
  </div>
</template>

<script>
import { ExperimentEngine } from '../../engine/ExperimentEngine.js'
import * as THREE from 'three'

const phaseNames = ['新月', '蛾眉月(盈)', '上弦月', '盈凸月', '满月', '亏凸月', '下弦月', '蛾眉月(亏)']

export default {
  name: 'MoonPhases',
  data() { return { moonAngle: 0, auto: false, phaseName: '新月' } },
  mounted() {
    this._e = new MoonPhasesEngine()
    this._e._vm = this
    this.$nextTick(() => this._e.init(this.$refs.cvs))
    window.addEventListener('resize', () => this._e?.resize())
  },
  beforeUnmount() { this._e?.dispose(); window.removeEventListener('resize', () => this._e?.resize()) },
  methods: {
    onParam() { this._e.setParams({ moonAngle: this.moonAngle * Math.PI / 180 }) },
    autoPlay() { this.auto = !this.auto; this._e.auto = this.auto },
  },
}

class MoonPhasesEngine extends ExperimentEngine {
  setupScene() {
    // Sun (distant light source, visualized as large glowing sphere)
    const sunGeo = new THREE.SphereGeometry(1, 32, 32)
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffd54f })
    const sun = new THREE.Mesh(sunGeo, sunMat)
    sun.position.set(10, 0, 0)
    this.scene.add(sun)
    // point light at sun position
    this.sunLight = new THREE.PointLight(0xfff8e8, 50, 30)
    this.sunLight.position.copy(sun.position)
    this.scene.add(this.sunLight)

    // Earth
    const earthGeo = new THREE.SphereGeometry(0.5, 32, 32)
    const earthMat = new THREE.MeshStandardMaterial({ color: 0x42a5f5, roughness: 0.5 })
    this.earth = new THREE.Mesh(earthGeo, earthMat)
    this.scene.add(this.earth)

    // Moon
    const moonGeo = new THREE.SphereGeometry(0.15, 16, 16)
    const moonMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.7 })
    this.moon = new THREE.Mesh(moonGeo, moonMat)
    this.moon.position.set(0, 0, 2)
    this.scene.add(this.moon)

    // Moon orbit ring
    const orbitGeo = new THREE.TorusGeometry(2, 0.02, 16, 64)
    const orbitLine = new THREE.Mesh(orbitGeo, new THREE.MeshBasicMaterial({ color: 0xb8a57a, transparent: true, opacity: 0.4 }))
    this.scene.add(orbitLine)

    this.moonAngle = 0
    this.auto = false
    this.camera.position.set(0, 4, 6)
    this.controls.target.set(0, 0, 1)
  }

  update(dt) {
    if (this.auto) {
      this.moonAngle += dt * 0.4
      this._vm.moonAngle = Math.round((this.moonAngle * 180 / Math.PI) % 360)
      this._vm.phaseName = phaseNames[Math.round(this.moonAngle / (Math.PI / 4)) % 8]
    }
    const a = this.moonAngle
    this.moon.position.set(Math.cos(a) * 2, 0, Math.sin(a) * 2)
    // Moon always faces Earth (tidally locked)
    this.moon.lookAt(this.earth.position)
  }

  setParams({ moonAngle }) {
    if (moonAngle !== undefined) {
      this.moonAngle = moonAngle
      this._vm.phaseName = phaseNames[Math.round(moonAngle / (Math.PI / 4)) % 8]
    }
  }
}
</script>

<style scoped>
.mp-layout { display: flex; gap: 0; border-radius: var(--radius-box); overflow: hidden; border: 1px solid var(--brown-light); }
.mp-panel { width: 200px; flex-shrink: 0; background: var(--card-bg); padding: 16px; border-right: 1px solid var(--brown-light); display: flex; flex-direction: column; gap: 10px; }
.mp-panel label { font-size: 13px; color: var(--ink); }
.mp-panel input[type="range"] { width: 100%; accent-color: var(--red); }
.mp-phase-label { font-size: 15px; color: var(--ink); text-align: center; padding: 8px; background: rgba(158,36,38,0.06); border-radius: var(--radius-sm); }
.mp-panel button { padding: 6px 12px; border: 1px solid var(--brown); border-radius: var(--radius-sm); background: var(--cream); color: var(--ink); cursor: pointer; font-family: inherit; font-size: 13px; }
.mp-panel button:hover { background: var(--button-green); }
.mp-hint { font-size: 11px; color: var(--muted); text-align: center; margin-top: auto; }
.mp-canvas-wrap { flex: 1; min-height: 460px; background: #0a0a1a; }
.mp-canvas-wrap canvas { width: 100%; height: 100%; display: block; }

@media (max-width: 720px) {
  .mp-layout { flex-direction: column; }
  .mp-panel { width: 100%; border-right: 0; border-bottom: 1px solid var(--brown-light); flex-direction: row; flex-wrap: wrap; gap: 8px; }
  .mp-canvas-wrap { min-height: 320px; }
}
</style>
```

- [ ] **Step 2: Write remaining astronomy experiments (Seasons, KeplerLaws, SolarMotion, Eclipse)**

Each follows the same 3D pattern. Write according to the scene descriptions above.

**Seasons.vue:** Sun at center, Earth orbit ring, tilted Earth with axis arrow, 4 season markers, insolation color on Earth surface.

**KeplerLaws.vue:** Ellipse with adjustable eccentricity, orbiting planet, swept-area triangle visualization, speed variation visible.

**SolarMotion.vue:** Hemisphere sky dome, sun path arc for selected latitude/season, ground plane with shadow stick.

**Eclipse.vue:** Sun-Earth-Moon alignment, shadow cone rendering (umbra/penumbra cylinders), eclipse type toggle.

- [ ] **Step 3: Verify build**

Run: `pnpm build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/experiments/modules/astronomy/
git commit -m "feat: add astronomy 3D experiments (moon phases, seasons, Kepler, solar motion, eclipse)"
```

---

### Task 14: 集成验证与收尾

- [ ] **Step 1: Full build**

Run: `pnpm build`
Expected: Zero errors.

- [ ] **Step 2: Dev server smoke test**

Run: `pnpm dev`
Check:
- `http://127.0.0.1:4173/#/experiments` → 4 category cards display
- Click meteorology → list of 4 experiments with badges
- Click thermal-circulation → 3D scene loads with particles
- Click cloud-bottle → tutorial steps render
- Back navigation works throughout
- App.vue header shows "地学实验" link and it highlights when active

- [ ] **Step 3: Final commit if any fixes needed**

```bash
git add -A
git commit -m "chore: integration fixes for experiments module"
```
