# 地学实验模块设计规格

## 概述

在地理教学系统中新增"地学实验"模块，包含气象学、水文学、地质、天文学四个学科的交互式实验。采用混合模式：核心实验用 Three.js 3D 交互模拟，其余用图文教程呈现。

## 路由设计

在 `main.js` 新增 3 条懒加载路由：

| 路径 | 组件 | 说明 |
|------|------|------|
| `/experiments` | `ExperimentsHome` | 四学科入口页 |
| `/experiments/:category` | `ExperimentCategory` | 某学科实验列表 |
| `/experiments/:category/:experiment` | `ExperimentView` | 单个实验 |

导航流：

```
首页 → 顶部导航 [地学实验] → /experiments
                              ├── 气象学实验
                              ├── 水文学实验
                              ├── 地质实验
                              └── 天文学实验
```

顶部导航入口在 `App.vue` header 中增加 `router-link to="/experiments"`。

面包屑路径：`首页 > 地学实验 > 气象学实验 > 科里奥利力旋转水槽实验`

## 目录结构

```
src/experiments/
├── ExperimentsHome.vue            # 四学科入口卡片页
├── ExperimentCategory.vue         # 学科实验列表
├── ExperimentView.vue             # 实验外壳（3D/图文）
├── components/
│   └── TutorialTemplate.vue       # 图文实验共享模板
├── modules/
│   ├── index.js                   # 19 个实验注册表
│   ├── meteorology/               # 4 个实验
│   ├── hydrology/                 # 5 个实验
│   ├── geology/                   # 5 个实验
│   └── astronomy/                 # 5 个实验
└── engine/
    └── ExperimentEngine.js        # 3D 实验基类
```

## 模块注册表

每个实验元数据格式：

```js
{
  id: 'coriolis',
  name: '科里奥利力旋转水槽实验',
  category: 'meteorology',
  type: '3d',                    // '3d' | 'tutorial'
  description: '描述文字...',
  concepts: ['地转偏向力', '风带', '气旋'],
  component: () => import('./meteorology/CoriolisExperiment.vue'),
}
```

按 `category` 分组导出，`ExperimentCategory` 页面按学科筛选。`concepts` 标签支持后续交叉筛选。

## 实验清单（19 个）

### 气象学实验
| id | 名称 | 类型 | 核心概念 |
|----|------|------|----------|
| thermal-circulation | 热力环流模拟实验 | 3d | 气压差、海陆风、山谷风 |
| coriolis | 科里奥利力旋转水槽实验 | 3d | 地转偏向力、风带、气旋 |
| cloud-bottle | 瓶中云实验 | tutorial | 云形成、凝结核、绝热膨胀 |
| weather-instruments | 自制气象仪器 | tutorial | 气压计、风速计、雨量计原理 |

### 水文学实验
| id | 名称 | 类型 | 核心概念 |
|----|------|------|----------|
| stream-table | 流水地貌模拟台 | 3d | 侵蚀、搬运、沉积、曲流、三角洲 |
| groundwater | 地下水/含水层模型 | 3d | 水位、承压层、抽水漏斗 |
| infiltration | 下渗与径流对比 | tutorial | 土壤类型、植被覆盖、坡度 |
| water-cycle | 水循环袋实验 | tutorial | 蒸发-凝结-降水闭环 |
| sediment-transport | 流水搬运能力实验 | 3d | Hjulstrom 曲线、流速与颗粒 |

### 地质实验
| id | 名称 | 类型 | 核心概念 |
|----|------|------|----------|
| fault-model | 沙箱断层/造山楔模型 | 3d | 正断层、逆断层、褶皱 |
| stratigraphy | 地层叠置律（Steno 定律） | 3d | 叠置原理、穿插关系 |
| mineral-id | 矿物鉴定/莫氏硬度 | tutorial | 硬度、条痕、光泽、解理 |
| potato-core | 土豆岩心取样 | tutorial | 钻孔勘探、三维地质建模 |
| soil-erosion | 水土流失实验 | 3d | 植被、坡度、降雨对侵蚀影响 |

### 天文学实验
| id | 名称 | 类型 | 核心概念 |
|----|------|------|----------|
| moon-phases | 月相变化演示 | 3d | 日月地位置、月相盈亏 |
| seasons | 四季成因演示 | 3d | 地轴倾角、太阳直射点 |
| kepler-laws | 开普勒行星运动定律 | 3d | 椭圆轨道、面积速度、周期定律 |
| solar-motion | 太阳视运动/太阳高度角 | 3d | 方位角、正午高度、影子 |
| eclipse | 日食/月食模拟 | 3d | 本影/半影、食季 |

合计：3D 实验 13 个，图文实验 6 个。

## ExperimentView 外壳

根据 `type` 字段切换渲染模式。

### 3D 模式布局

```
┌──────────────────────────────────────┐
│ ← 返回    实验标题                    │
├────────┬─────────────────────────────┤
│ 控制面板 │    Three.js 全屏画布        │
│ [参数]  │                             │
│ [按钮]  │                             │
├────────┴─────────────────────────────┤
│ 概念说明文字                          │
└──────────────────────────────────────┘
```

- 3D 画布占满主区域，控制面板在左侧（桌面端）或底部抽屉（移动端）
- 左上角返回按钮
- 底部概念说明栏

### 图文模式布局

```
┌──────────────────────────────────────┐
│ ← 返回    实验标题                    │
├──────┬───────────────────────────────┤
│ ○ S1 │  步骤标题                      │
│ │    │  [插图]                        │
│ ● S2 │  正文说明                       │
│ │    │  ⚠ 核心提示                    │
│ ○ S3 │                               │
├──────┴───────────────────────────────┤
│         ◀ 上一步    下一步 ▶          │
└──────────────────────────────────────┘
```

- 左侧步骤指示器（圆点 + 连线），当前步骤高亮
- 右侧步骤内容：标题、插图、正文、提示卡片
- 底部步骤导航按钮
- 响应式：窄屏时步骤指示器变为顶部横向滚动

## 3D 实验引擎（ExperimentEngine.js）

共享 Three.js 底座基类，所有 3D 实验继承它。

### 基类职责

- Three.js 基础搭建：场景、相机、渲染器、灯光、OrbitControls
- 动画循环：`requestAnimationFrame` + `clock.getDelta()` 传给子类 `update(dt)`
- 生命周期：`init(canvas)` → 挂载，`dispose()` → 清理
- 公共工具：坐标轴、参考网格、3D 文字标签

### 子类接口

```js
class ConcreteExperiment extends ExperimentEngine {
  setupScene() { /* 创建实验场景 */ }
  update(dt, elapsed) { /* 每帧更新 */ }
  setParams(params) { /* 外部控制面板调参 */ }
}
```

### 与现有代码的关系

独立于 `SceneEngine`（`src/sandbox/engine/SceneEngine.js`），不复用。现有 SceneEngine 服务地貌沙箱，实验引擎有独立需求（粒子系统、天体轨道、流体可视化），强行复用会引入耦合。代码风格保持一致。

### 组件挂载

3D 实验 Vue 组件在 `mounted()` 中 `new XxxExperiment(canvasRef)`，`onUnmounted()` 调用 `dispose()`。

## 图文实验模板（TutorialTemplate.vue）

共享布局组件。每个图文实验导出 `steps` 数组：

```js
export const steps = [
  {
    title: '步骤标题',
    image: './images/step.jpg',
    content: '步骤说明...',
    highlight: '核心提示',
  },
]
```

模板负责：步骤指示器渲染、当前步骤高亮、上一步/下一步导航、键盘左右箭头切换。

## 非目标

- 不在此阶段实现知识点标签的交叉筛选 UI（concepts 字段预留，后续可用）
- 不复用或修改现有 `SceneEngine`
- 不迁移现有 sandbox 模块到实验系统
- 不做用户实验数据记录或成绩系统
