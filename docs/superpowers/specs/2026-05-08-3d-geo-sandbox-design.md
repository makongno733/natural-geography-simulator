# 3D 地理沙盒系统 — Phase 1 设计规格

> 日期：2026-05-08
> 面向：博士/硕士研究生地貌教学研究平台

---

## 1. 项目概况

基于现有 Vue 3 + Vite + Electron + Three.js 项目的地貌子页面，升级为**交互式 3D 地理沙盒系统**。Phase 1 搭建模块化框架并重构河流地貌模块，后续逐步添加构造、冰川、海岸、风成、岩溶、火山、气候等地貌模块。

## 2. 构建策略

**快速原型 → 逐步扩展**。保留当前河流场景引擎，先搭建系统框架和 UI 外壳，再逐一添加/替换模块。

## 3. 系统架构

### 3.1 分层

| 层 | 职责 |
|---|------|
| **交互层** | Vue 3 UI · 3D 视口 · 控制面板 · 知识面板 |
| **知识层** | 地理知识条目 · 学术文献引用 · 概念-场景映射 |
| **模拟引擎** | 地形生成 · 侵蚀模拟 · 水文计算 · 构造/气候驱动 |
| **数据层** | DEM 导入/导出 · 程序化地形 · 实验快照 |

### 3.2 Vue 组件树

```
SandboxApp.vue
├── SandboxShell.vue          ← 三栏布局
│   ├── ModulePanel.vue       ← 左：模块导航树
│   ├── SceneViewport.vue     ← 中：3D 视口
│   └── InfoPanel.vue         ← 右：知识/状态/数据
├── /sandbox                  ← 地貌沙盒路由
└── /atmosphere               ← 大气模块（保留）
```

### 3.3 文件结构

```
src/sandbox/
├── SandboxApp.vue
├── SandboxShell.vue
├── ModulePanel.vue
├── SceneViewport.vue
├── InfoPanel.vue
├── engine/
│   ├── SceneEngine.js        ← 增强版场景引擎
│   ├── TerrainGenerator.js   ← 程序化/DEM 地形
│   ├── ErosionSolver.js      ← 侵蚀模拟
│   └── AnnotationSystem.js   ← 3D 标注
├── modules/
│   ├── GeoModule.js          ← 模块接口
│   ├── registry.js           ← 注册中心
│   └── fluvial/
│       ├── index.js
│       ├── FluvialControls.vue
│       └── knowledge.js
└── stores/
    └── useSandboxStore.js
```

## 4. 地貌模块体系（全部阶段）

| 大类 | 子模块 |
|------|--------|
| 💧 流水地貌 | 河流地貌、坡面沟谷、湖泊湿地、冲积洪积 |
| 🏔 构造地貌 | 断层褶皱、板块边界、地壳抬升 |
| ❄️ 冰川冰缘 | 冰川侵蚀、冰川堆积、冻土 |
| 🌊 海岸地貌 | 侵蚀海岸、堆积海岸、生物海岸、三角洲 |
| 🌪 风成地貌 | 风蚀（雅丹）、沙丘、黄土 |
| 🕳 岩溶地貌 | 地表喀斯特、地下喀斯特、地下河 |
| 🌋 火山地貌 | 火山类型、熔岩地貌、火山口 |
| 🌍 综合交叉 | 气候地貌、人类活动、行星地貌 |

Phase 1 仅实现**河流地貌**模块，其余在后续阶段添加。

## 5. 模块插件接口

```js
interface GeoModule {
  id: string              // 'fluvial'
  name: string            // '河流地貌'
  icon: string            // '🌊'
  onRegister(engine): void
  onActivate(): void
  onDeactivate(): void
  controls: VueComponent
  knowledge: KnowledgeEntry[]
  layers: LayerConfig[]
}
```

## 6. SceneEngine 增强

### 6.1 保留现有的
- 7 种河流类型体系
- 时间演化滑块
- 天气/气候模式（雨雪云雾）
- 剖面裁剪视图
- 360° 自动旋转
- OrbitControls 交互

### 6.2 Phase 1 增强项

| 维度 | 当前 | Phase 1 |
|------|------|---------|
| 地形生成 | 6 层噪声 | 更多噪声层 + 侵蚀后地形更自然 |
| 河流渲染 | TubeGeometry 静态管道 | 动态水面 + 河床下切凹陷 |
| 侵蚀模拟 | 手动河谷插值 | 流功率侵蚀 E = K·Aᵐ·Sⁿ |
| 视觉着色 | 卫星顶点色 | 斜坡自适应纹理混合 |
| 光照 | 基础 | 阴影映射 + 大气散射 |
| 标注 | 单点标记 | 3D 文字标签 + 引线 |
| 测量 | 无 | 距离/剖面/坡度 |
| 地层 | 水平颜色 | 真实岩性标注剖面 |

## 7. 知识面板

三层结构：
1. **即时概念** — 点击场景要素显示术语 + 定义
2. **理论详解** — 右侧面板展示完整理论 + 经典文献
3. **文献与数据** — BibTeX 引用、参数导出

## 8. UI 风格

继承项目现有风格：
- 配色：`--bg0: #eef5ff`, `--bg1: #d8e9ff`, `--ink: #0f2542`, `--card: rgba(247,252,255,0.9)`
- 字体：`"Noto Serif SC", "Songti SC", "STKaiti", serif`
- 布局：三栏卡片式（模块树 | 3D 视口 | 信息面板）
- 暗色仅用于 3D 视口内部

## 9. 学术引用

河流模块知识条目：
- Davis, W.M. (1899). The Geographical Cycle. *Geographical Journal*, 14(5), 481-504.
- Howard, A.D. et al. (1994). Modeling fluvial erosion on regional to continental scales. *JGR*, 99(B7), 13971-13986.
- Tzathas, P. et al. (2024). Physically-based analytical erosion for fast terrain generation. *Computer Graphics Forum*.
- Gregory, K.J. & Walling, D.E. (1973). *Drainage Basin Form and Process*. Arnold.
