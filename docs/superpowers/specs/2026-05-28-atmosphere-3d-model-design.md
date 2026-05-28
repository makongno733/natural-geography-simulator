# 地球大气 3D 互动模型设计方案

## 概述

为高中必修第一册第二章「地球上的大气」及大学自然地理学第三章「大气圈与气候系统」创建嵌入式 3D 互动模型，帮助学生直观理解大气的垂直结构、组成成分、受热过程和全球环流。

## 目标用户

- 高中生（简单模式）：人教版必修第一册第二章
- 大学生（专业模式）：伍光和《自然地理学》第三章

## 集成方式

嵌入 `SectionContent.vue` 内容区（替换 PPT 预留位），当路由匹配以下章节时自动显示：

```
必修第一册 第二章 第一节 → 默认选中「垂直分层」Tab + 显示「大气组成」
必修第一册 第二章 第二节 → 默认选中「受热过程」Tab + 显示「三圈环流」
大学 自然地理学 第三章    → 专业模式，所有主题可用
```

其他章节不显示。

## 组件架构

```
src/lib/atmosphereScene.js              ← Three.js 场景核心
src/textbook/components/
  AtmosphereViewer.vue                   ← Vue 封装容器
```

### AtmosphereViewer.vue 结构

```
AtmosphereViewer
├── 顶部工具栏
│   ├── 主题 Tab 切换（4 个）
│   └── 高中/大学 模式开关
├── Three.js Canvas
└── 信息浮层
```

### atmosphereScene.js 类

```js
class AtmosphereScene {
  constructor(container, mode) // 初始化场景/相机/渲染器
  setTheme(theme)              // 切换四个主题
  setMode(mode)                // 高中/大学切换
  update(time)                 // 动画循环
  dispose()                    // 清理
}
```

## 四种主题

### A) 垂直分层

相机侧视地球，5 层半透明同心球壳渲染。

| 高中模式 | 大学模式 |
|----------|----------|
| 5 层基本名称 + 高度范围 | + 气压值、温度值、臭氧层、逆温层、电离层 |
| 简单温度折线 | 精确温度曲线 + 关键点 |
| 点击显示基本特征 | 点击显示详细特征面板 |

### B) 大气组成

粒子系统展示成分分布，相机拉近地球。

| 高中模式 | 大学模式 |
|----------|----------|
| N₂(蓝)、O₂(绿)、CO₂(灰)、H₂O(白) | + O₃(紫)、固体杂质(棕)、Ar(淡黄) |
| 均匀分布 | 按高度分层分布 |
| 基本图例 | 浓度曲线 + 辐射效应 |

### C) 大气受热过程

动态粒子流展示辐射路径：太阳短波辐射↓ → 地面吸收 → 地面长波辐射↑ → 大气逆辐射↓。

| 高中模式 | 大学模式 |
|----------|----------|
| 3 条主路径 | + 散射/反射 + 光谱标注 |
| 基本说明 | 辐射平衡数据 + 温室效应量化 |

### D) 三圈环流

彩色粒子沿 Hadley/Ferrel/Polar 细胞路径流动。

| 高中模式 | 大学模式 |
|----------|----------|
| 3 圈 + 名称 | + 气压带、风带、季节变化 |
| 基本粒子 | 高密度粒子 + 风向标注 |

## 技术实现

- **框架**: Three.js（项目已有）
- **大气散射**: `@takram/three-atmosphere` npm 包（物理预计算散射）
- **地球纹理**: NASA Visible Earth 高清贴图
- **粒子系统**: Three.js `Points` + `BufferGeometry`
- **路径动画**: `CatmullRomCurve3` 定义环流路径
- **辐射动画**: 粒子沿自定义路径运动

## 项目文件变更

```
新增:
  src/lib/atmosphereScene.js
  src/textbook/components/AtmosphereViewer.vue

修改:
  src/textbook/SectionContent.vue (集成 AtmosphereViewer)
  package.json (添加 @takram/three-atmosphere 依赖)
```

## 路线图

1. Phase 1: 基础场景搭建（地球 + 大气散射 + 控制框架）
2. Phase 2: 垂直分层主题
3. Phase 3: 大气组成主题
4. Phase 4: 受热过程主题
5. Phase 5: 三圈环流主题
6. Phase 6: 高中/大学模式细化
7. Phase 7: 集成到 SectionContent + 调试

## 参考资源

- 人教版必修第一册第二章 content.json（教学设计和课件文本）
- 大学自然地理学 content.json（第三章大气圈与气候系统）
- 45-高中地理【人教版】/必修第一册/第二章/ PPT课件和教学设计
- 电子课本 PDF（人教版必修第一册、选择性必修1）
- US Standard Atmosphere 1976（垂直层温度/压力数据）
- NASA Visible Earth 地球纹理
- `@takram/three-atmosphere` npm 包
