# 中学地理数字化教学平台 UI/UX 深度重构审计报告 (PROJECT_UI_AUDIT.md)

> 审计基准：Git 提交 `9380d65` (main)
> 平台定位：面向中国初高中地理学科教育的现代化数字地理教学与三维探究平台
> 审计目标：在严守核心资产（3D地球、星系、实验模型、日历、Logo、数据与交互）完全冻结的基础上，定位现有视觉体验短板，制定系统性重构方案。

---

## 一、 技术栈与工程全貌

- **核心框架**：Vue 3.5.33 (Composition API, `<script setup>`) + Vue Router 4.6.4 (Hash 模式)
- **3D / 地理仿真引擎**：Three.js 0.184.0, @takram/three-atmosphere 0.19.1, MapLibre GL 5.14.0, MeshLine 3.3.1
- **日历组件**：@fullcalendar/vue3, @fullcalendar/daygrid, @fullcalendar/interaction
- **构建工具**：Vite 6.4.2, LightningCSS 1.32.0, vite-plugin-compression2
- **测试框架**：Vitest 4.1.10, @vue/test-utils 2.4.11, JSDOM
- **后端配套**：Node.js Express + Better-SQLite3 + Better-Auth (可选账号与课程助手服务)

---

## 二、 实际页面清单与业务职能

| 页面路由 | 主组件与模板位置 | 核心任务 | 现状视觉与设计问题 | 重构方向 |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `src/textbook/TextbookHome.vue`<br/>`HomeEarth3D.vue` | 品牌首屏、3D 地球与八大行星轮播、中国地势三大阶梯沉浸探索、教材分册入口、实验中心直达 | 1. 行星指示层在桌面与移动端留白不均；<br/>2. 地势阶梯卡片文字层级偏紧，阴影较重；<br/>3. 入口卡片样式多处局部内联，缺乏全局卡片体系支撑。 | 统一大地测量与编辑式排版；改善地球仪周围信息容器的呼吸感；规范阶梯卡片比例与优雅阴影。 |
| `/:grade` | `src/textbook/BookSelect.vue` | 初中（七八年级）与高中（必修/选择性必修）分册选择门户 | 1. 封面卡片横纵比未统一约束；<br/>2. 书籍描述文字排版略显扁平；<br/>3. 面包屑与顶栏衔接生硬。 | 升级为典雅的地理文献馆与图集封面陈列感；统一卡片圆角、高光棱与微悬浮交互。 |
| `/:grade/:book` | `src/textbook/ChapterList.vue` | 单本教材目录列表、大章节与小节层级导览 | 1. 章节编号与标题字号节奏单一；<br/>2. 小节链接条目边框分割线较生硬；<br/>3. 缺乏单元地貌主题背景暗示。 | 引入精细地质层理列表排版；章节序号采用等宽大地坐标徽标；强化列表点击与悬浮呼吸感。 |
| `/:grade/:book/:chapter/:section` | `src/textbook/SectionContent.vue`<br/>`StudentLearningView.vue` | 课文深度阅读、知识点小节、思维导图、数据可视化、实验关联卡、课后习题 | 1. 课文正文与旁注卡片密度过大；<br/>2. 思维导图与数据可视化入口按钮缺乏区分度；<br/>3. 练习题面板选项点击态过于素净。 | 打造中国国家地理式的高品质教学阅读版式；明确工具按钮与操作按钮的视觉权重；优化折叠手风琴的平滑过渡。 |
| `/experiments` | `src/experiments/ExperimentsHome.vue` | 3D 实验中心大厅、气象/水文/地质/天文学科分类导览、教材反向索引 | 1. 分类 Tab 与筛选器的视觉重心不清晰；<br/>2. 实验卡片缩略图遮罩对比度不一致；<br/>3. 教材反向检索联动下拉框在小屏下拥挤。 | 建立国家地理实验室控制台风格；统一卡片封面 16:9 比例与地学科研标签；优化多级筛选器布局。 |
| `/experiments/:cat/:exp` | `src/experiments/ExperimentView.vue`<br/>`TutorialTemplate.vue` | 29+ 项三维地理仿真交互实验台（保持 3D 模型完全冻结） | 1. 外层参数控制面板样式在不同实验间存在少量样式割裂；<br/>2. 教学指引步骤条和关闭按键缺乏统一规格；<br/>3. 数据读数缺少地学仪表统一刻度感。 | 重塑外围玻璃控制台，统一滑块、开关、复位按键与数据读数卡片；强化指引步骤卡的高级排版。 |
| `/calendar` | `src/calendar/GeoCalendar.vue`<br/>`src/calendar/events.js` | 一年期空间地学历法、天象日、历史重大地学科考事件、全球地震实时与历史记录 | 1. FullCalendar 默认表格样式与本站大地色板缺乏深度融合；<br/>2. 事件详情卡片排版较机械；<br/>3. 移动端月份视图与列表视图切换不够平滑。 | 将日历注入大地历法与天文罗盘质感；统一日历单元格、事件徽章、地震等级预警色与详情抽屉。 |
| `/geo-labs/*` | `src/geo-labs/` (`GeoLabsHome`, `SatelliteCompare`, `TerrainExplorer`, `RemoteSensingAI`) | 真实遥感影像滑动对比、珠峰高程 DEM 三维等高线探究、AI 地表解译 | 1. 顶栏返回按键与次级工具条存在垂直不对齐；<br/>2. 遥感卷帘分割线手柄略显细弱；<br/>3. 参数控件缺乏科技感。 | 规范专业 GIS 观测台界面；优化遥感卷帘中轴控制器与手势拖拽；统一图层控制器与经纬度标尺。 |
| `/inquiry` | `src/inquiry/InquiryStudio.vue` | 证据链探究工作室、问题提出与数据分析 | 1. 输入框与卡片背景对比度略显不足；<br/>2. 探究步骤指示器缺少节奏感。 | 优化探究步骤时间轴与科研报告卡片排版。 |
| `/practice` | `src/learning/GeographyPractice.vue` | 地理大题与综合题实战演练 | 1. 题目材料与答题区域分栏在平板端比例失衡；<br/>2. 评分与解析反馈弹出层样式略显单薄。 | 优化分栏自适应比例，题目配图强化地学文献框，答题反馈卡片更具层次感。 |
| `/knowledge` | `src/textbook/knowledge/KnowledgeLibrary.vue` | 高中地理必修与选修知识图谱大纲库 | 1. 知识清单展开层级过长，缺乏目录吸顶指示；<br/>2. 关联模型链接样式较小。 | 引入清晰的分册侧栏导引与地貌微缩关联指示器。 |
| `/account` | `src/account/AccountPage.vue` | 师生账号登录、学习进度与全站章节评论中心 | 1. 表单卡片在宽屏下过度伸展；<br/>2. 评论输入框聚焦状态与其他页面不一致。 | 约束最大宽度，统一表单组件、加载按钮与评论时间线气泡。 |

---

## 三、 核心设计问题定位 (Design Flaws to Solve)

1. **色彩与主题 Tokens 未达到严格全局闭环**：
   部分较早编写的实验子组件仍使用历史零散变量（如旧的 `--cream`, `--paper`, 内联十六进制色），尽管有别名兜底，但导致个别深色/浅色背景对比度不平滑。
2. **排版层级与中文版面节奏（Typography & Rhythm）**：
   中文字号在部分二级页面跳跃过大（标题 clamp 48px，正文直接骤降至 13px），缺少中阶副标题与导读段落过渡。经纬度、标高、年代等科学数据缺少统一的等宽数字字体栈（Tabular Figures）。
3. **按钮与控件层级虽然已有微动效，但外围排版规格仍需标准化**：
   各类按钮的尺寸规范（Sm: 32px, Md: 40px, Lg: 48px）、图标与文本间距、内边距等需在 Design Tokens 中统一固化。
4. **移动端响应式局部瑕疵**：
   在 ≤768px 与 ≤480px 窄屏下，部分实验参数面板和日历表格在小屏上有微小水平滚动风险，需要通过自适应流式网格彻底解决。

---

## 四、 推荐重构顺序与实施策略

1. **PHASE 2**: 撰写 `DESIGN_SYSTEM.md`，确立大地与海洋色板、字体层级、间距/圆角/阴影 Tokens 与组件规格。
2. **PHASE 3**: 在 `src/style.css` 升级 Design Tokens 与共享 UI 规范（Button, Input, Card, Modal, Badge, Popover）。
3. **PHASE 4-8**: 逐页推进首页、教材正文、实验外围面板、地理日历、真实数据实验室的深度排版与视觉打磨。
4. **PHASE 9-10**: 响应式压测、无障碍审计、自动化测试（Vitest 162+ 绿灯）与 Vite 生产构建。
5. **PHASE 11**: 输出验收总结与详细 Changelog。
