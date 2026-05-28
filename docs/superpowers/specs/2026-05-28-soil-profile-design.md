# 3D 土壤剖面图设计文档

## 概述

为第5章"植被与土壤"的第二节（土壤）添加一个交互式 3D 土壤剖面图，支持简单/专业两种模式，所有专业名词通过 ⓘ 解释按钮提供上下文说明。

## 页面接入方式

- 在课本 `SectionContent.vue` 渲染第二节内容时，识别到"土壤"相关章节，在内容区域顶部渲染一个"打开 3D 土壤剖面"按钮
- 点击按钮弹出模态框/抽屉，内部展示完整的 3D 土壤剖面交互页面
- 模态框关闭后剖面图销毁（释放 Three.js 资源）

## 3D 展示方式

- 采用 Three.js 渲染一个**立体剖面柱**，每个土层是一个独立的几何体（柱体切片）
- 各层使用不同的颜色和纹理材质，模拟真实土壤的外观（O层深棕色、A层暗棕、E层浅灰、B层红棕、C层浅棕、R层灰色）
- 支持鼠标拖拽旋转、滚轮缩放
- 每层的侧面（或正面）有文本标注层名（使用 CSS2DRenderer 或 SpriteText）
- 标注本身带 ⓘ 图标，点击弹出解释卡片

## 模式切换

使用 **Tab 标签页**切换：
- **Tab 1: 🌱 简单模式**
- **Tab 2: 🔬 专业模式**

切换时：
- 3D 模型的旋转/缩放状态保持不变（保持用户视角）
- 层的标注内容和ⓘ解释动态切换
- 专业模式下显示更多亚层标注

## 简单模式（高中生）

展示土壤的 5 个基本层（O → A → E → B → C），基于人教版高中地理教材深度：

| 层 | 名称 | 标注文本 | ⓘ 解释内容 |
|---|---|---|---|
| O | 枯枝落叶层 | O 枯枝落叶层 | 地表堆积的枯枝、落叶和动物残体，分解后形成腐殖质，使土壤肥沃。 |
| A | 淋溶层 | A 淋溶层（表土层） | 位于地表附近的土层，含有丰富的腐殖质，颜色较深，是植物根系最密集的区域。 |
| E | 淀积层 | E 淀积层（淋失层） | 水分下渗时带走黏粒和矿物质的区域，颜色较浅，质地疏松。 |
| B | 母质层 | B 母质层 | 由风化碎屑物组成，缺乏有机质，是土壤形成的母体材料。 |
| C | 母岩层 | C 母岩层（基岩） | 坚硬的未风化岩石，是土壤发育的基底。 |

## 专业模式（研究生）

基于 USDA Soil Taxonomy 和 WRB (World Reference Base) 国际土壤分类标准，展示更精细的土层划分和亚层：

| 层 | 亚层 | 标注文本 | ⓘ 解释内容关键词 |
|---|---|---|---|
| O | Oi, Oe, Oa | Oi 枯落物层 / Oe 半分解层 / Oa 腐殖质层 | 有机质分解程度区分（纤维质/半分解/腐殖质），C/N 比 |
| A | Ap | A 表土层（Ap 耕作层） | 矿质+有机质混合，CEC，pH，有机碳含量 |
| E | - | E 淋溶层（Eluviation Horizon） | 黏粒/铁铝淋失，漂白层（Albic horizon），多见于森林土壤 |
| B | Bt, Bw, Bs, Bk | B 淀积层 — Bt 黏化 / Bw 风化 / Bs 铁铝 | 黏粒淀积（Argillic horizon），铁铝氧化（Spodic horizon），碳酸钙积累 |
| C | Cr | C 母质层（Cr 风化基岩） | 风化程度区分，Cr 为可挖掘的风化岩层 |
| R | - | R 基岩层（Hard Bedrock） | 坚实度分级，裂隙特征 |

ⓘ 解释内容包含：
- 中英文术语对照（如 Eluviation / Illuviation）
- 关键指标（Munsell 颜色描述、质地分类、CEC 参考值）
- 与 USDA Soil Taxonomy / WRB 的对应关系
- 相关野外鉴定方法（如 "Feel Method" 判定质地、HCl 检测碳酸钙）

## ⓘ 名词解释交互

- 显示方式：在所标注的名词旁显示一个带圆圈的ⓘ图标
- 触发方式：**点击 ⓘ 弹出解释卡片**
- 卡片内容：名词定义（50-200 字）、中英文对照、关键参数
- 关闭方式：点击卡片外部或 × 按钮
- 专业模式下卡片内容更详细，可能包含图表和参考文献链接

## 技术实现

### 文件结构

```
src/
  soil-profile/
    SoilProfileModal.vue      — 模态框容器，管理 Tab 切换
    SoilProfile3D.vue         — Three.js 3D 场景组件
    soilScene.js              — Three.js 场景逻辑（几何体、材质、灯光、轨道控制）
    soilData.js               — 简单/专业模式各层的数据定义
    InfoPopup.vue             — ⓘ 解释弹窗组件
```

可选：用 `src/lib/soilScene.js` 替代独立的 `soilScene.js`，保持 lib/ 下 Three.js 场景逻辑的集中管理。

### 依赖

- Three.js（已在项目中）
- OrbitControls（已在 `terrainScene.js` 中使用）
- CSS2DRenderer（用于文本标注覆盖层）

### 与现有课本系统的连接

- 在 `src/textbook/SectionContent.vue` 中检测当前章节是否为"第二节 土壤"
- 检测到后渲染"打开 3D 土壤剖面"按钮
- 按钮点击时渲染 `SoilProfileModal` 组件

## 数据来源（专业模式）

专业模式内容基于以下来源：
- USDA NRCS "Field Book for Describing and Sampling Soils" (Version 4.0, 2024)
- USDA Soil Taxonomy (Keys to Soil Taxonomy)
- WRB (World Reference Base for Soil Resources) 4th Edition, 2022
- FAO 土壤资源指南
- 相关英文维基百科条目（Soil horizon, Soil classification）
