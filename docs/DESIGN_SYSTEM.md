# 中学地理教学系统设计系统规范 (DESIGN_SYSTEM.md)

> 适用范围：全站所有页面、模板、弹窗、实验控制台与组件库
> 核心视觉哲学：**“大地测绘 · 深海经纬 · 科学文献 · 动效纪律”**
> 设计对标：Apple 设计人机指南的克制与精度 + National Geographic / 中国国家地理的纪实美学 + ArcGIS 专业地理信息可视化结构。拒绝廉价紫蓝赛博朋克与无意义的高光拟态。

---

## 一、 设计令牌架构 (Design Tokens)

### 1. 自然地理核心语义色板 (The Earth & Cosmos Palette)

| 语义变量名 | 色值 / 渐变 | 物理/地理隐喻 | 使用场景 |
| :--- | :--- | :--- | :--- |
| `--geo-ocean-deep` | `#0f2742` | 马里亚纳海沟深水、深邃经纬夜空 | 顶级标题 (H1/H2)、主导航背景底色、强调按钮按压态 |
| `--geo-ocean` | `#1a446c` | 大洋主干流、航海等深线 | 品牌主强调色 (`--accent`)、主要行动按钮、活动态指示 |
| `--geo-ocean-medium` | `#245d92` | 近海大陆架、大陆斜坡水体 | 悬停强化色、次级链接、关键图例标签 |
| `--geo-ocean-light` | `#3884c7` | 阳光透射表层水、等高线高光 | 聚焦环外圈、微动效扫光光梭、选中边缘 |
| `--geo-ocean-surface`| `#eef5fa` | 海雾凝结、极地浮冰反光浅色 | 主行动浅色底色 (`--accent-soft`)、卡片活动背景 |
| `--geo-ocean-mist` | `#f4f8fb` | 大气低层水汽水雾 | 次浅色底色 (`--accent-softer`)、表格斑马纹 |
| `--geo-green-deep` | `#1b4332` | 亚热带常绿阔叶林、针叶林海 | 生态知识重点强调、植被实验状态色 |
| `--geo-green` | `#2d6a4f` | 冲积平原、水稻梯田、温带草原 | 生态与自然地理成功标签、环境可持续性徽章 |
| `--geo-green-soft` | `#d8f3dc` | 早春萌芽、苔原融雪地被 | 成功轻底色、生态参数标签背景 |
| `--geo-earth-deep` | `#6f4e37` | 古老基底花岗岩、深层沉积地层 | 地质断层深色强调、岩石圈实验指示 |
| `--geo-earth` | `#8d6e63` | 丹霞岩壁、砂岩与黄土地貌 | 地貌学板块标签、断裂带剖面色彩 |
| `--geo-terracotta` | `#c86446` | 红壤、火山熔岩、赤道砖红壤 | 警示色、地学考点核心提示、罗盘北针 |
| `--geo-sand` | `#faedcd` | 塔克拉玛干沙丘、冲积扇细砂 | 地质年代标尺暖色辅助底、古生物卡片底 |
| `--text` | `#172433` | 测绘深墨水黑 (WCAG AAA 对浅底) | 课本正文阅读、所有主要文本 |
| `--text-muted` | `#4e6074` | 大陆架中度深蓝灰 | 辅文本、元数据、作者与出版信息 |
| `--text-faint` | `#7e91a5` | 浅层雾霭灰蓝 | 占位说明、未选中小节、经纬网底标 |
| `--bg` | `#f8fafc` | 国家地理标准无光铜版纸白底 | 页面主背景（明亮阅读友好，抗视疲劳） |
| `--surface` | `#ffffff` | 白水晶石英晶体纯白切面 | 卡片、面板、浮层主表面 |
| `--border` | `#d4e0eb` | 等高线浅色描边 | 卡片外框、表格分隔线、分割轴 |
| `--border-strong` | `#b3c7d8` | 大地测绘基线描边 | 激活边框、输入框边框、卡片悬浮强化 |

---

## 二、 字体排版系统 (Typography System)

遵循中文地理教材与学术出版物最高标准，兼顾屏幕可读性与数字等宽排版：

```css
/* 中西文混排字体栈 */
--geo-font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif;
--geo-font-serif: "Songti SC", "SimSun", "Noto Serif SC", Georgia, "Times New Roman", serif;
--geo-font-mono: ui-monospace, SFMono-Regular, "Menlo", "Monaco", "Consolas", monospace;
```

### 字号与行高阶梯 (Type Scale)

| 等级 | 字号 (rem / px) | 行高 | 字重 | 用途示例 |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `clamp(2.25rem, 5vw, 3.5rem)` (36~56px) | 1.15 | 800 | 首页 Hero 主标题、地球尺度主标语 |
| **H1** | `clamp(1.75rem, 3.5vw, 2.25rem)` (28~36px)| 1.25 | 700 | 章节大标题、实验全屏标题、探究大厅标题 |
| **H2** | `1.5rem` (24px) | 1.35 | 700 | 课文大节标题、实验控制台分区标题 |
| **H3** | `1.25rem` (20px) | 1.4 | 600 | 知识卡片标题、导图分支名、习题题号 |
| **H4** | `1.05rem` (16.8px) | 1.45 | 600 | 模块小标题、图表标题、弹窗 Header |
| **Body Large** | `1.0625rem` (17px) | 1.75 | 400 | 课本正文深度阅读段落（适度放宽行距护眼） |
| **Body Regular**| `0.9375rem` (15px) | 1.65 | 400 | 标准卡片描述文本、实验步骤指引说明 |
| **Body Small** | `0.8125rem` (13px) | 1.5 | 400/500 | 控件旁注、辅助读数、图表注释、底部版权 |
| **Data / Coord**| `0.75rem` (12px) | 1.2 | 600 (等宽) | 经纬度、海拔高程、地质纪元年代、地震震级 |

---

## 三、 间距与空间网格 (Spatial Tokens)

基于 4px / 8px 大地网格体系构建：

```css
--geo-space-1: 4px;   /* 微缩标签内边距、图标紧邻文字间距 */
--geo-space-2: 8px;   /* 按钮图标与文本间隙、紧凑列表条目间隙 */
--geo-space-3: 12px;  /* 控件内边距、紧凑卡片内填充 */
--geo-space-4: 16px;  /* 标准组件内边距、普通网格间距 */
--geo-space-6: 24px;  /* 卡片主内边距、分栏标准间隙 */
--geo-space-8: 32px;  /* 大卡片内边距、模块之间中度间隙 */
--geo-space-12: 48px; /* 页面主要区域大间隙 */
--geo-space-16: 64px; /* 顶级区块垂直呼吸留白 */
```

---

## 四、 圆角系统 (Radius Tokens)

克制、自然、结构分明：

```css
--radius-xs: 4px;     /* 微型徽章、代码标记 */
--radius-sm: 8px;     /* 控制台小按键、输入框、下拉框、图例标签 */
--radius-md: 12px;    /* 标准卡片、弹窗内层卡、详情抽屉 */
--radius-lg: 16px;    /* 模块主容器、大卡片、思维导图外框 */
--radius-xl: 22px;    /* 首页重点展板、3D控制视窗框架 */
--radius-pill: 999px; /* 胶囊按钮、学段切换Tab、圆点徽章 */
```

---

## 五、 阴影与微物理深度 (Shadow & Elevation)

拒绝廉价大黑影，采用符合自然天光弥散的多层柔光与 1px 晶体微棱高光：

```css
/* 微浮起（普通卡片常态） */
--shadow-xs: 0 1px 2px rgba(15, 39, 66, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.85);

/* 低层级（交互卡片常态、微面板） */
--shadow-sm: 0 1px 3px rgba(15, 39, 66, 0.06), 0 3px 10px rgba(15, 39, 66, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9);

/* 中层级（卡片悬停、展开列表、下拉菜单） */
--shadow-md: 0 4px 16px rgba(15, 39, 66, 0.08), 0 1px 3px rgba(15, 39, 66, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.95);

/* 高层级（模态弹窗、全屏控制台浮层、大图查看器） */
--shadow-lg: 0 16px 40px rgba(15, 39, 66, 0.14), 0 4px 12px rgba(15, 39, 66, 0.06), inset 0 1px 0 rgba(255, 255, 255, 1);
```

---

## 六、 共享基础 UI 组件标准规范

### 1. 按钮系统 (Button System)
- **Primary**：深海蓝底色 (`--geo-ocean`)、白色文字、1px 顶端微棱光、外光晕投影，具备乒乓球弹跳跃迁动效。
- **Secondary**：浅海雾蓝底色 (`--geo-ocean-surface`)、深海蓝文字、边框 `--border`，悬浮时变亮，按压紧实。
- **Ghost / Tertiary**：透明底色、深墨色文字、悬浮时显示浅蓝底或下划线，用于辅助导航。
- **Scientific Controls**：控制台小按键，坚实活塞沉降 + 地震波微脉冲扩散。

### 2. 卡片系统 (Card System)
- 纯白石英底 (`--surface`)，1px 浅海等高线边框 (`--border`)，顶部 1px 纯白漫反射高光。
- Hover 统一采用 `--geo-btn-elevate` (translateY -2px) 与 `--shadow-md` 点亮，严禁夸张晃动。

### 3. 表单与实验参数滑块 (Form & Slider Controls)
- 输入框：高 40px，圆角 8px，背景纯白，边框 `--border`，获得焦点时触发双层 `--geo-focus-ring` (2px 纯白 + 4.5px 深海蓝)。
- 滑块：轨道高 5px 浅海蓝底，滑块手柄 18px 纯白带阴影，拖动时展现当前科学单位与精准读数。

### 4. 浮层与弹窗 (Modal & Popover)
- 背景采用深海蓝低透明度遮罩 (`rgba(10, 25, 45, 0.45)`) 配 12px 高斯模糊。
- 弹窗居中出现，带 0.22s 优雅微弹，ESC 键或右上角罗盘旋转关闭按键利落收起。
