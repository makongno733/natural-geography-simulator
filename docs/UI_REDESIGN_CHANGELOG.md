# 全站 UI/UX 深度重构变更日志 (UI_REDESIGN_CHANGELOG.md)

## [UI/UX Refactor Release] - 2026-10-15

### 架构与文档 (Architecture & Docs)
- **新增** `docs/PROTECTED_COMPONENTS.md`：建立受保护核心资产清单，严守 3D 地球、太阳系、29+ 个实验模型、空间日历、Logo 与业务逻辑的冻结边界。
- **新增** `docs/PROJECT_UI_AUDIT.md`：全面梳理全站 17 处核心路由、组件树、样式缺陷与重构目标。
- **新增** `docs/DESIGN_SYSTEM.md`：建立大地测绘与深海经纬色彩令牌、排版阶梯、网格间距、圆角与微物理阴影设计系统。
- **新增** `docs/UI_REDESIGN_REPORT.md`：记录全站重构目标、前后对比与测试验证结论。

### 全局样式与设计系统 (src/style.css)
- **更新** 色彩令牌与阴影体系，彻底统一全站 `--geo-ocean`、`--geo-ocean-deep`、`--geo-green`、`--geo-earth` 等自然地理语义色彩。
- **新增** `.geo-display-title`、`.geo-lead`、`.geo-tabular`、`.geo-badge` 等高阶地学排版类。
- **新增** 全局标准表单与输入框规范（40px 基础高度、双圈 `:focus-visible` 聚焦环）。
- **新增** 全局统一实验参数范围滑块 (`input[type="range"]`) 自定义轨道与圆形微物理手柄。
- **新增** 模态弹窗与浮层卡片样式规范 (`.geo-modal-backdrop`, `.geo-modal-card`)。
- **完善** 系统级减弱动效 `@media (prefers-reduced-motion: reduce)` 适配。

### 页面级视觉升级 (Pages & Views)
- **首页 (`src/textbook/TextbookHome.vue`)**：
  - 优化 Hero 标题字号节奏与胶囊操作按钮（保持 3D 地球仪原生渲染）。
  - 精修 3D 模型导览条目，引入边框圆角与微悬浮反馈。
  - 重构三大阶梯交互展板步道阶梯圆角与高亮光斑。
  - 规范实景笔记与遥感卡片 16:9 画幅、国家地理式位置标签与来源链接。
- **教材分册与章节列表 (`BookSelect.vue` & `ChapterList.vue`)**：
  - 弃用深绿硬编码样式，引入大地经纬主强调色。
  - 分册封面卡片增加 14px 标准圆角、纯白石英底与 `--shadow-sm` 柔光投影。
  - 章节列表升级为带圆角微卡的条目排版，章节序号改为等宽大地坐标徽标。
- **课文阅读与学习视图 (`SectionContent.vue` & `StudentLearningView.vue`)**：
  - 调整课文旁注图表卡片边框高光与图注居中对齐。
  - 规范学习工具栏按键为胶囊型（保留 40px 触控尺寸与键盘聚焦环）。
  - 优化课后练习面板 (`PracticePanel.vue`) 答案展开按键与正误反馈卡片。
- **思维导图与数据可视化 (`MindMapViewer.vue` & `DataVizViewer.vue`)**：
  - 顶栏搜索框引入双圈聚焦光晕，缩放按键统一圆角规范。
  - 数据可视化弹层外框升级为圆角卡片配轻柔投影，关闭按钮增加悬浮高亮。
- **3D 实验中心大厅与实验台 (`ExperimentsHome.vue` & `ExperimentView.vue`)**：
  - 规范多级学段/教材/章节联动筛选器为 40px 高度标准输入框。
  - 实验分类卡片升级为典雅的大陆架冷色卡，增加悬浮抬升反馈。
  - 实验详情台外围关联教材条目增加胶囊标签包裹，外壳边框整洁一致。
- **动手实验教程组件 (`TutorialTemplate.vue`)**：
  - 将原高亮生硬蓝调收敛至统一的 `--geo-ocean` 系列自然海洋色。
  - 步骤数字指示微徽章改为圆角胶囊标签，高亮步骤文字增强视觉重点。
- **空间地理日历 (`GeoCalendar.vue`)**：
  - 日历容器增加深色宇宙罗盘氛围与石英底卡片。
  - 月份切换控制器改为胶囊按键，优化地震记录条目悬浮态与详情抽屉排版。
- **真实数据探究中心 (`GeoLabsHome.vue`, `SatelliteCompare.vue`, `TerrainExplorer.vue`)**：
  - 优化探究路径卡片渐变与步骤指示。
  - 遥感影像卷帘对比器与 DEM 珠峰剖面卡片统一圆角与标签样式。
- **课程助手与账号服务 (`LessonAssistant.vue` & `AccountPage.vue`)**：
  - 助手面板边框圆角统一为 `var(--radius-box)`，发送按键升级为品牌主胶囊按钮。
  - 账号登录卡片规范最大宽度与输入框聚焦环，提升中学生和教师登录体验。
- **全站顶栏与底栏 (`App.vue`)**：
  - 优化导航栏在 9 个项目下的桌面端内边距与间隙，防横向换行挤压。
  - 移动端滑轨隐藏滚动条提升清爽度，底栏经纬度与信息结构规整对齐。

### 质量与测试保证 (Verification)
- 通过全量 31 个 Vitest 测试套件（168 个测试用例全部绿灯）。
- 通过 Vite 生产环境编译打包，无构建警告。
