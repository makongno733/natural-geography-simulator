# GEO COSMOS 下一位 AI 开发提示词（第三阶段）

请直接在真实仓库开展开发，严禁再次输出泛泛空洞规划。你接手的是已完成第二阶段深度开发的专业知识中心（包含 22 个权威章节、弦理论 D1—D11 完整体系、五种超弦比较器、对偶网络图、PDG 粒子图谱、时空光锥与 FLRW 宇宙学积分计算器）。先阅读本文件、同目录 `ORIGINAL_BRIEF.md`、`SOURCES.md` 和 `RELEASE_VERIFICATION.md`，核对源代码与线上正式版本。

## 一、项目定位与工作边界

- 正式网站：https://geo.kongnoma279.com/#/cosmos
- 仓库：makongno733/natural-geography-simulator
- 主工作目录：/Users/makongno/Resources/Projects/地理教学系统
- 最新合并基线：PR #43 已合入 `origin/main`（Commit: `6d3d6123984d723793e2300b958c21aee1d0630b`）
- 技术栈：Vue 3、Vue Router hash 路由、Vite、Vitest。保留既有地理教材、3D实验、社区、账号与宇宙学交互课。
- 无论何时接手，首先 `git status`、`fetch`、检查工作树及 `AGENTS.md`。禁止覆盖未提交修改，禁止 reset/clean/force-push。基于最新 `origin/main` 创建新隔离分支。
- 发布规范：发布前必须通过 PR 审查合并并记录 SHA；确认正式域名 `https://geo.kongnoma279.com/` 上 HTML 与新分包返回 200，不能空称已上线。

## 二、实际实现与文件地图

- `src/main.js`：`/cosmos`、`/cosmos/labs`、`/cosmos/chapter/:chapter`。未知章节显示专属友好 404 页面，不进入教材通配。
- `src/cosmos/content.js`：22 个数据驱动章节，包含原始任务书 D1—D11 弦理论全套独立章节，每章具有 16 项必填字段与专属 `pedagogy` 教学指南。
- `src/cosmos/schema.test.js`：章节 Schema 自动化健全性测试（唯一 ID、kebab-case、字段齐备、科学地位合规、真实文献引用）。
- `src/cosmos/particlesData.js` 与 `ParticleAtlas.vue`：严格遵循 PDG 2024 国际粒子物理标准的标准模型粒子图谱与引力子候选（包含 $\overline{\text{MS}}$ 流夸克质量、中微子振荡平方差与宇宙学上限、自旋、电荷与发现史）。
- `src/cosmos/stringTheoriesData.js` 与 `SuperstringComparator.vue`：五种 10 维超弦理论并排深度对比器，严格区分微扰闭弦与 D 膜规范群起源。
- `src/cosmos/DualityNetwork.vue`：交互式 T 对偶、S 对偶与 11 维 M 理论极限拓扑图与详细抽屉。
- `src/cosmos/CosmosLabs.vue`：三个操作实验：狭义相对论时空光锥与同时性、FLRW 宇宙学多距离与年龄数值积分、经典弦振动模态与世界面扫掠。
- `src/cosmos/physics.js`、`physics.test.js`、`labsExpanded.test.js`：包含洛伦兹变换、同时性线、Simpson 数值积分、爱因斯坦-德西特解析解（$t_0=2/(3H_0)$）与 Planck 2018 现代宇宙学基准验证。
- `src/cosmos/cosmos.css`：完全限定在 `.cosmos` 内的高性能响应式样式，适配深浅色与 375px 窄屏移动端。

## 三、下一阶段交付重点（P3 与深度科学可视化）

1. **高维几何与 Calabi-Yau 三维截面探索器**：
   - 为 D9（紧致化）章节增加卡拉比—丘截面探索器；
   - 必须按需动态导入 Three.js（禁止在全站主包中静态引入）；
   - 必须在低性能设备或 `prefers-reduced-motion` 下平滑降级为高质量 SVG 截面投影；
   - 界面上醒目标注：“这是六维复流形的低维数学截面或投影，绝非六维时空实景”。
2. **宇宙学观测微波背景辐射（CMB）角功率谱拟合**：
   - 结合 Planck 2018 数据，展示多极矩 $l$ 在 $l \approx 220$ 处的第一声学峰、第二与第三声学峰；
   - 允许用户调节重子密度 $\Omega_b$ 与冷暗物质密度 $\Omega_c$，观察声波峰峰高与位置的响应机制。
3. **黑洞因果结构与彭罗斯图（Penrose Diagram）**：
   - 为黑洞章节增加交互式彭罗斯图，直观标注类光无穷远 $\mathscr{I}^\pm$、类时无穷远 $i^\pm$、事件视界与空间奇点；
   - 严格区分史瓦西不自转黑洞与克尔自转黑洞能层。
4. **科学史对数宇宙时间轴**：
   - 以对数标度展示从普朗克时期（$10^{-43}\text{ s}$）、大统一、暴胀、重子数产生、电弱破缺、核合成（BBN, 3分钟）、微波背景光子退耦（38万年）、第一代恒星、星系形成到今天（138亿年）以及未来热寂的完整时间演化树。

## 四、科学质量与测试交付底线

- 资料来源保持真实可溯：优先 NASA、CERN、PDG、Planck、LIGO 与同行评审论文，更新 `SOURCES.md`。
- 测试底线：每次提交前必须运行并通过 `pnpm test`（当前 61 个测试文件、304 个测试通过）、`pnpm build` 以及 `node scripts/check-bundle-budget.mjs dist`（确保首屏与教材入口严格在预算内，主入口不包含 Three.js）。
- 部署交付：使用 PR 合并，记录提交 SHA；用 curl 或浏览器实际验证线上正式站 `https://geo.kongnoma279.com/#/cosmos`，确认资源返回 200。更新 `RELEASE_VERIFICATION.md` 与本交接文件。
