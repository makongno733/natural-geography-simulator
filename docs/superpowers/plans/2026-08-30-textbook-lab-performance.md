# 教材—地理实验室联动与性能优化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让初高中至少 106/117 个教材小节拥有经过确认的高质量 3D 实验入口，同时缩短首页、教材页和实验页的加载与交互等待时间。

**Architecture:** 以一个不导入 Three.js 的实验目录和章节—实验注册中心作为唯一数据源，教材页与实验室分别消费这份数据实现双向导航。3D 组件、教材正文和教材图片按路由、实验及册拆分；公共场景仅在可见时渲染并在卸载时释放资源。

**Tech Stack:** Vue 3、Vue Router 4、Vite 6、Vitest 4、Three.js 0.184、pnpm。

**Spec:** `docs/superpowers/specs/2026-08-30-textbook-lab-performance-design.md`

## Global Constraints

- 覆盖范围仅为初中 26 节与高中 91 节，共 117 节；大学内容不计入本轮指标。
- 至少 106 个小节必须有 `confidence: 'curated'` 的主 3D 实验。
- 优先复用现有实验室和引擎模型，只新增“地理空间网络沙盘”和“人地关系系统沙盘”。
- 不降低几何精度、纹理清晰度、像素比、抗锯齿、阴影、色调映射或后处理质量。
- 首页初始 JavaScript 不超过 150 KB gzip；普通教材页除正文图片外不超过 250 KB gzip。
- 首页和普通教材页的静态入口依赖不得包含 Three.js。
- 生产代码变更遵循测试先行；每个任务先观察目标测试失败，再写最小实现。

---

### Task 1: 恢复可重复的测试与构建基线

**Files:**
- Modify: `src/textbook/SectionContent.vue`
- Verify: `package.json`
- Verify: `pnpm-lock.yaml`

**Interfaces:**
- Consumes: `pnpm@10.33.3` 锁文件和现有 Vitest/Vite 脚本。
- Produces: 可运行的 `pnpm test` 与 `pnpm build` 基线，供后续每个任务复用。

- [ ] **Step 1: 按锁文件安装依赖**

Run: `pnpm install --frozen-lockfile`

Expected: 安装成功且不修改 `pnpm-lock.yaml`；如果 packageManager 与锁文件要求冲突，使用 Corepack 激活 `pnpm@10.33.3` 后重试。

- [ ] **Step 2: 运行现有测试并记录基线**

Run: `pnpm test`

Expected: 测试执行；任何失败必须保留完整测试名并在本任务中判断是否为已有失败。

- [ ] **Step 3: 运行生产构建并观察重复声明失败**

Run: `pnpm build`

Expected: 构建在 `SectionContent.vue` 的重复 `AtmosphereViewer` 声明处失败，证明当前基线问题可被构建捕获。

- [ ] **Step 4: 删除重复声明并保持其余逻辑不变**

将相邻的两行：

```js
const AtmosphereViewer = asyncTool('atmosphere')
const AtmosphereViewer = asyncTool('atmosphere')
```

改为：

```js
const AtmosphereViewer = asyncTool('atmosphere')
```

- [ ] **Step 5: 验证测试和构建恢复**

Run: `pnpm test && pnpm build`

Expected: 两条命令均退出 0；如出现与重复声明无关的已有失败，只修复阻止基线的直接问题并补充对应回归测试。

- [ ] **Step 6: 提交基线修复**

```bash
git add src/textbook/SectionContent.vue pnpm-lock.yaml
git commit -m "fix: restore textbook build baseline"
```

---

### Task 2: 建立统一实验目录、预设契约和意图预加载

**Files:**
- Create: `src/experiments/catalog.js`
- Create: `src/experiments/catalog.test.js`
- Create: `src/experiments/presets.js`
- Create: `src/experiments/preload.js`
- Create: `src/experiments/preload.test.js`
- Create: `src/experiments/modules/systems/ConceptSystemAdapter.vue`
- Modify: `src/experiments/modules/index.js`

**Interfaces:**
- Consumes: 现有 `modules` 元数据和每个实验的动态 `component()` 加载器。
- Produces: `listExperiments()`, `getExperiment(id)`, `getExperimentPreset(experimentId, presetId)`, `buildExperimentRoute(options)`, `createExperimentPreloader(resolveExperiment)`, `preloadExperiment(id)` 和 `resetExperimentPreload(id)`。

- [ ] **Step 1: 为目录查询、预设验证和路由生成编写失败测试**

在 `catalog.test.js` 写入以下行为测试：

```js
import { describe, expect, it } from 'vitest'
import {
  buildExperimentRoute,
  getExperiment,
  getExperimentPreset,
  listExperiments,
} from './catalog.js'

describe('experiment catalog', () => {
  it('keeps component loaders lazy and resolves registered experiments', () => {
    const item = getExperiment('thermal-circulation')
    expect(item.name).toBe('热力环流模拟实验')
    expect(typeof item.load).toBe('function')
    expect(listExperiments().length).toBeGreaterThanOrEqual(22)
  })

  it('rejects unknown presets instead of silently falling back', () => {
    expect(getExperimentPreset('thermal-circulation', 'thermal-cell')).toMatchObject({
      id: 'thermal-cell',
    })
    expect(getExperimentPreset('thermal-circulation', 'missing')).toBeNull()
  })

  it('builds a route that preserves the full textbook source', () => {
    expect(buildExperimentRoute({
      experimentId: 'thermal-circulation',
      presetId: 'thermal-cell',
      textbook: { grade: '高中', book: '必修第一册', chapter: '第二章', section: '第二节' },
    })).toEqual({
      name: 'experiment-view',
      params: { category: 'meteorology', experiment: 'thermal-circulation' },
      query: { preset: 'thermal-cell', grade: '高中', book: '必修第一册', chapter: '第二章', section: '第二节' },
    })
  })
})
```

- [ ] **Step 2: 运行目录测试并确认模块不存在**

Run: `pnpm vitest run src/experiments/catalog.test.js`

Expected: FAIL，因为 `catalog.js` 和 `presets.js` 尚未创建。

- [ ] **Step 3: 实现不加载 Three.js 的目录与预设契约**

`catalog.js` 的目录项统一为：

```js
{
  id: 'thermal-circulation',
  name: '热力环流模拟实验',
  category: 'meteorology',
  kind: '3d',
  description: '通过冷热源的空气流动展示热力环流形成过程。',
  concepts: ['热力环流', '气压差', '海陆风', '山谷风'],
  load: () => import('./modules/meteorology/ThermalCirculation.vue'),
  presets: ['thermal-cell', 'land-sea-breeze'],
}
```

将现有 20 个实验全部转换到该契约，并加入现有独立 3D 能力：`earth-system`、`atmosphere-system`、`water-cycle-3d`、`landform-sandbox`、`soil-profile-3d`、`disaster-sandbox`、`map-projection` 和 `geologic-time`。目录文件只能保存元数据和动态加载函数。

同时注册 `spatial-network` 和 `human-environment`。在专用沙盘于 Task 6 完成前，两项都动态加载 `ConceptSystemAdapter.vue`；该适配器把预设的节点、流向、层级和指标转换为现有 `Chapter3DViewer.vue` 的 `recipe` 属性，因此 Task 3 的章节关联从提交时起就是可打开的完整功能，而不是失效链接。Task 6 将用专用沙盘替换这两个加载器并删除适配器。

`presets.js` 导出按实验 ID 分组的只读对象；每个预设至少包含 `id`、`title`、`purpose`、`camera`、`params`、`labels` 和 `tasks`。没有场景参数变化的现有实验使用明确的 `default` 预设，不通过未知 ID 回退。

- [ ] **Step 4: 验证目录测试通过**

Run: `pnpm vitest run src/experiments/catalog.test.js`

Expected: PASS。

- [ ] **Step 5: 为预加载去重和失败重试编写失败测试**

在 `preload.test.js` 使用可注入加载器验证：

```js
it('deduplicates pending loads and retries after rejection', async () => {
  let attempts = 0
  const load = () => {
    attempts += 1
    return attempts === 1 ? Promise.reject(new Error('network')) : Promise.resolve({ default: {} })
  }
  const preloader = createExperimentPreloader(() => ({ load }))
  await expect(preloader.preload('demo')).rejects.toThrow('network')
  await expect(preloader.preload('demo')).resolves.toBeTruthy()
  expect(attempts).toBe(2)
})
```

- [ ] **Step 6: 运行预加载测试并确认失败**

Run: `pnpm vitest run src/experiments/preload.test.js`

Expected: FAIL，因为预加载缓存尚未实现。

- [ ] **Step 7: 实现 Promise 去重与失败清除**

`createExperimentPreloader(resolveExperiment)` 使用 `Map` 保存正在进行或已完成的 Promise；加载失败时删除对应键，正式点击可重试。默认导出的 `preloadExperiment(id)` 使用实验目录解析加载器，无效 ID 返回 rejected Promise。

- [ ] **Step 8: 验证本任务测试并提交**

Run: `pnpm vitest run src/experiments/catalog.test.js src/experiments/preload.test.js`

Expected: PASS。

```bash
git add src/experiments
git commit -m "feat: add lazy experiment catalog"
```

---

### Task 3: 建立 117 节章节—实验注册中心和覆盖审计

**Files:**
- Create: `src/textbook/data/experimentLinks.js`
- Create: `src/textbook/data/experimentLinks.test.js`
- Create: `scripts/audit-experiment-coverage.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `grades`、`getExperiment()`、`getExperimentPreset()` 和 `buildExperimentRoute()`。
- Produces: `textbookKey(context)`, `getSectionExperimentLink(context)`, `getTextbooksForExperiment(id)`, `auditExperimentCoverage()`。

- [ ] **Step 1: 编写完整键、有效引用和覆盖率失败测试**

```js
import { describe, expect, it } from 'vitest'
import { grades } from './index.js'
import {
  auditExperimentCoverage,
  getSectionExperimentLink,
  getTextbooksForExperiment,
} from './experimentLinks.js'

describe('textbook experiment links', () => {
  it('maps a full section key to a curated experiment and preset', () => {
    expect(getSectionExperimentLink({
      grade: '高中', book: '必修第一册', chapter: '第三章', section: '第一节',
    })).toMatchObject({
      confidence: 'curated',
      primary: { experimentId: 'water-cycle-3d', presetId: 'water-cycle' },
    })
  })

  it('covers at least 106 of the 117 middle and high school sections', () => {
    const audit = auditExperimentCoverage(grades)
    expect(audit.total).toBe(117)
    expect(audit.curated).toBeGreaterThanOrEqual(106)
    expect(audit.invalidExperiments).toEqual([])
    expect(audit.invalidPresets).toEqual([])
    expect(audit.duplicateKeys).toEqual([])
    expect(audit.orphanKeys).toEqual([])
  })

  it('supports reverse lookup from experiment to textbooks', () => {
    expect(getTextbooksForExperiment('water-cycle-3d')).toContainEqual(expect.objectContaining({
      grade: '高中', book: '必修第一册', chapter: '第三章', section: '第一节',
    }))
  })
})
```

- [ ] **Step 2: 运行覆盖测试并确认失败**

Run: `pnpm vitest run src/textbook/data/experimentLinks.test.js`

Expected: FAIL，因为注册模块不存在。

- [ ] **Step 3: 明确配置每章默认实验并允许小节覆盖**

使用完整的 `年级|册|章` 键配置以下章级默认值；模块加载时展开为完整的 `年级|册|章|节` 键，不使用标题关键词做运行时匹配：

```js
const CHAPTER_DEFAULTS = {
  '初中|七年级上册|第一章': ['earth-system', 'globe-basics'],
  '初中|七年级上册|第二章': ['map-projection', 'map-reading'],
  '初中|七年级上册|第三章': ['earth-system', 'continents-oceans'],
  '初中|七年级下册|第七章': ['earth-system', 'regional-environment'],
  '初中|七年级下册|第八章': ['spatial-network', 'regional-connections'],
  '初中|七年级下册|第九章': ['spatial-network', 'regional-connections'],
  '初中|八年级上册|第一章': ['spatial-network', 'population-distribution'],
  '初中|八年级上册|第二章': ['earth-system', 'china-natural-environment'],
  '初中|八年级上册|第三章': ['human-environment', 'resource-system'],
  '初中|八年级下册|第六章': ['map-projection', 'regional-division'],
  '初中|八年级下册|第七章': ['spatial-network', 'regional-development'],
  '高中|必修第一册|第一章': ['earth-system', 'cosmic-earth'],
  '高中|必修第一册|第二章': ['atmosphere-system', 'atmosphere-process'],
  '高中|必修第一册|第三章': ['water-cycle-3d', 'water-cycle'],
  '高中|必修第一册|第四章': ['landform-sandbox', 'landform-process'],
  '高中|必修第一册|第五章': ['soil-profile-3d', 'vegetation-soil'],
  '高中|必修第一册|第六章': ['disaster-sandbox', 'natural-hazards'],
  '高中|必修第二册|第一章': ['spatial-network', 'population-system'],
  '高中|必修第二册|第二章': ['spatial-network', 'urban-system'],
  '高中|必修第二册|第三章': ['spatial-network', 'industry-location'],
  '高中|必修第二册|第四章': ['spatial-network', 'transport-network'],
  '高中|必修第二册|第五章': ['human-environment', 'sustainable-development'],
  '高中|选择性必修1|第一章': ['seasons', 'earth-motion'],
  '高中|选择性必修1|第二章': ['fault-model', 'surface-process'],
  '高中|选择性必修1|第三章': ['thermal-circulation', 'atmospheric-circulation'],
  '高中|选择性必修1|第四章': ['water-cycle-3d', 'water-movement'],
  '高中|选择性必修1|第五章': ['human-environment', 'natural-zonation'],
  '高中|选择性必修2|第一章': ['spatial-network', 'regional-system'],
  '高中|选择性必修2|第二章': ['human-environment', 'regional-resource'],
  '高中|选择性必修2|第三章': ['spatial-network', 'city-industry-region'],
  '高中|选择性必修2|第四章': ['spatial-network', 'regional-coordination'],
  '高中|选择性必修3|第一章': ['human-environment', 'ecosystem-services'],
  '高中|选择性必修3|第二章': ['human-environment', 'resource-security'],
  '高中|选择性必修3|第三章': ['human-environment', 'environmental-security'],
  '高中|选择性必修3|第四章': ['human-environment', 'environmental-governance'],
}
```

为水循环、地下水、河流、地貌、断层、地层、大气运动、地球运动、灾害等有更精确现有实验的小节增加 `SECTION_OVERRIDES`；覆盖项结构必须包含主实验标题、学习目的、最多两个相关实验和 `confidence: 'curated'`。

- [ ] **Step 4: 实现审计函数和命令行报告**

`auditExperimentCoverage()` 返回：

```js
{
  total: 117,
  curated: 117,
  coverage: 1,
  uncovered: [],
  invalidExperiments: [],
  invalidPresets: [],
  duplicateKeys: [],
  orphanKeys: [],
}
```

脚本以文本表格输出总数、覆盖数、百分比和未覆盖教材键；发现覆盖率低于 90% 或任一无效引用时设置非零退出码。`package.json` 增加 `qa:experiment-links`。

- [ ] **Step 5: 验证覆盖测试和审计命令**

Run: `pnpm vitest run src/textbook/data/experimentLinks.test.js && pnpm qa:experiment-links`

Expected: 测试通过，审计显示至少 `106/117`，且四类无效数组为空。

- [ ] **Step 6: 提交注册中心**

```bash
git add src/textbook/data/experimentLinks.js src/textbook/data/experimentLinks.test.js scripts/audit-experiment-coverage.mjs package.json
git commit -m "feat: link textbook sections to experiments"
```

---

### Task 4: 在教材页加入统一实验卡片并移除 3D 静态依赖

**Files:**
- Create: `src/textbook/components/TextbookExperimentCard.vue`
- Create: `src/textbook/components/__tests__/TextbookExperimentCard.test.js`
- Modify: `src/textbook/SectionContent.vue`
- Modify: `src/textbook/components/StudentLearningView.vue`
- Modify: `src/textbook/SectionContent.test.js`

**Interfaces:**
- Consumes: `getSectionExperimentLink()`, `buildExperimentRoute()` 和 `preloadExperiment()`。
- Produces: `<TextbookExperimentCard :link="link" />`；触发 `pointerenter`、`focusin`、`touchstart` 时预加载，点击时使用命名路由进入实验室。

- [ ] **Step 1: 编写卡片显示、路由和意图预加载失败测试**

测试挂载卡片后断言：

```js
expect(wrapper.get('[data-primary-experiment]').text()).toContain('水循环')
expect(wrapper.get('[data-primary-experiment]').attributes('href')).toContain('/experiments/')
await wrapper.get('[data-primary-experiment]').trigger('pointerenter')
expect(preload).toHaveBeenCalledWith('water-cycle-3d')
```

同时在 `SectionContent.test.js` 断言无关联时不渲染卡片，章节快速切换后旧卡片不会保留。

- [ ] **Step 2: 运行目标测试并确认失败**

Run: `pnpm vitest run src/textbook/components/__tests__/TextbookExperimentCard.test.js src/textbook/SectionContent.test.js`

Expected: FAIL，因为卡片组件和注册消费逻辑不存在。

- [ ] **Step 3: 实现教材实验卡片**

卡片展示 `primary.title`、`primary.purpose` 和最多两个相关实验。主链接绑定命名路由；预加载事件统一调用一次 `warmPrimary()`，并在预加载失败时吞掉异常，正式导航不受影响。

- [ ] **Step 4: 重构教材页的 3D 入口**

在 `SectionContent.vue` 中：

- 根据当前四段教材键计算 `experimentLink`。
- 在标题和正文之间渲染实验卡片。
- 删除 `SandboxApp`、`Earth3D`、`SoilProfilePage`、`AtmosphereViewer`、`WaterCycleView`、`DisasterSandbox` 的教材页异步加载器及对应 `show*` 状态。
- 将学生学习视图中的 3D 工具改由统一卡片承载；思维导图和数据可视化继续作为本地学习工具，不导入 Three.js。
- 保留章节加载代次保护和上一节/下一节导航。

- [ ] **Step 5: 验证教材测试并检查静态依赖**

Run: `pnpm vitest run src/textbook`

Expected: PASS。

Run: `rg -n "sandbox/Earth3D|engine/WaterCycleView|soil-profile/SoilProfilePage|sandbox/DisasterSandbox|three" src/textbook/SectionContent.vue src/textbook/components/TextbookExperimentCard.vue`

Expected: 无输出。

- [ ] **Step 6: 提交教材入口**

```bash
git add src/textbook
git commit -m "feat: add textbook experiment links"
```

---

### Task 5: 实现实验页预设验证、教材往返和实验室筛选

**Files:**
- Create: `src/experiments/components/ExperimentLoadState.vue`
- Create: `src/experiments/components/__tests__/ExperimentLoadState.test.js`
- Modify: `src/experiments/ExperimentView.vue`
- Create: `src/experiments/ExperimentView.test.js`
- Modify: `src/experiments/ExperimentsHome.vue`
- Create: `src/experiments/ExperimentsHome.test.js`
- Modify: `src/experiments/ExperimentCategory.vue`
- Modify: `src/main.js`

**Interfaces:**
- Consumes: 实验目录、预设、反向教材查询和路由查询参数。
- Produces: 已验证的 `<component :is="component" :preset="preset" :lesson-context="context" />`、来源面包屑、返回教材链接、相关教材链接及年级/册/章筛选。

- [ ] **Step 1: 编写有效来源、无效实验、无效预设和加载重试失败测试**

覆盖以下断言：

```js
expect(wrapper.get('[data-textbook-source]').text()).toContain('高中 / 必修第一册 / 第二章 / 第二节')
expect(wrapper.get('[data-return-textbook]').attributes('href')).toContain('第二节')
expect(wrapper.get('[data-invalid-experiment]').exists()).toBe(true)
expect(wrapper.get('[data-invalid-preset]').exists()).toBe(true)
await wrapper.get('[data-retry-experiment]').trigger('click')
expect(loader).toHaveBeenCalledTimes(2)
```

- [ ] **Step 2: 运行实验页测试并确认失败**

Run: `pnpm vitest run src/experiments/ExperimentView.test.js src/experiments/components/__tests__/ExperimentLoadState.test.js`

Expected: FAIL，因为新状态和验证流程不存在。

- [ ] **Step 3: 实现实验加载状态机**

`ExperimentView.vue` 使用 `idle/loading/ready/error/invalid-experiment/invalid-preset/webgl-unavailable` 状态。每次路由变化增加加载代次；旧 Promise 完成后不得覆盖新实验。错误态提供重试和返回入口。

- [ ] **Step 4: 实现教材来源和反向关联**

查询参数四段齐全且教材键存在时显示来源；返回链接使用命名路由 `section`。独立进入时显示 `getTextbooksForExperiment()` 的相关教材，不伪造当前来源。

- [ ] **Step 5: 为实验室筛选编写失败测试并实现**

`ExperimentsHome.test.js` 先断言选择“高中 / 必修第二册 / 第三章”后仅显示有关联实验。实现级联筛选，选项来自初高中目录，实验结果来自反向注册查询。

- [ ] **Step 6: 将旧独立入口改为兼容跳转**

`/earth3d`、`/disasters`、`/map` 和 `/geo` 保留，但路由重定向到相应实验 ID 的统一实验页；已有收藏链接仍可工作。

- [ ] **Step 7: 运行实验室测试并提交**

Run: `pnpm vitest run src/experiments src/textbook`

Expected: PASS。

```bash
git add src/experiments src/main.js
git commit -m "feat: connect experiments back to textbooks"
```

---

### Task 6: 新增两套高复用 3D 沙盘及章节预设

**Files:**
- Create: `src/engine/modules/SpatialNetworkModule.js`
- Create: `src/engine/modules/HumanEnvironmentModule.js`
- Create: `src/experiments/modules/systems/SpatialNetwork.vue`
- Create: `src/experiments/modules/systems/HumanEnvironment.vue`
- Create: `src/experiments/modules/systems/sceneConfigs.js`
- Create: `src/experiments/modules/systems/sceneConfigs.test.js`
- Delete: `src/experiments/modules/systems/ConceptSystemAdapter.vue`
- Modify: `src/experiments/catalog.js`
- Modify: `src/experiments/presets.js`

**Interfaces:**
- Consumes: `BaseScene`, `GeometryFactory`, `LabelSystem` 和标准预设对象。
- Produces: `createSpatialNetworkModule(scene, params, services)`, `createHumanEnvironmentModule(scene, params, services)`, `getSpatialNetworkConfig(preset)`, `getHumanEnvironmentConfig(preset)`。

- [ ] **Step 1: 为预设到场景配置的确定性转换编写失败测试**

```js
it('turns the transport preset into weighted network flows', () => {
  const config = getSpatialNetworkConfig({ id: 'transport-network', params: { intensity: 0.8 } })
  expect(config.nodes.length).toBeGreaterThanOrEqual(4)
  expect(config.flows.every((flow) => flow.width > 0)).toBe(true)
  expect(config.camera).toEqual(expect.objectContaining({ preset: 'orbit' }))
})

it('turns resource security into stocks, flows and feedbacks', () => {
  const config = getHumanEnvironmentConfig({ id: 'resource-security', params: { pressure: 0.7 } })
  expect(config.stocks.map((item) => item.id)).toContain('resource-base')
  expect(config.feedbacks.length).toBeGreaterThan(0)
  expect(config.thresholds.length).toBeGreaterThan(0)
})
```

- [ ] **Step 2: 运行场景配置测试并确认失败**

Run: `pnpm vitest run src/experiments/modules/systems/sceneConfigs.test.js`

Expected: FAIL，因为配置函数不存在。

- [ ] **Step 3: 实现空间网络沙盘**

使用共享节点球体、分区底板、带方向的流线、权重宽度、动态粒子和标签。预设覆盖 `regional-connections`、`population-distribution`、`population-system`、`urban-system`、`industry-location`、`transport-network`、`regional-system`、`city-industry-region`、`regional-coordination` 和 `regional-development`。

- [ ] **Step 4: 实现人地关系系统沙盘**

使用资源存量柱、需求与排放流、生态状态环、阈值面板和正负反馈箭头。预设覆盖 `resource-system`、`sustainable-development`、`natural-zonation`、`regional-resource`、`ecosystem-services`、`resource-security`、`environmental-security` 和 `environmental-governance`。

- [ ] **Step 5: 保持现有高质量渲染选项**

两个 Vue 包装组件均使用：

```js
new BaseScene(container, {
  antialias: true,
  shadows: true,
  toneExposure: 1.2,
  lightPreset: 'studio',
})
```

不得覆盖 `RenderManager` 的高质量像素比上限；组件卸载时调用 `scene.dispose()`。

- [ ] **Step 6: 注册实验和全部引用预设**

把 `spatial-network` 与 `human-environment` 的目录加载器从兼容适配器切换到两个专用沙盘，并删除 `ConceptSystemAdapter.vue`。确保 Task 3 的每个预设 ID 都能通过 `getExperimentPreset()` 验证。

- [ ] **Step 7: 验证场景、目录和覆盖测试并提交**

Run: `pnpm vitest run src/experiments/modules/systems/sceneConfigs.test.js src/experiments/catalog.test.js src/textbook/data/experimentLinks.test.js`

Expected: PASS。

```bash
git add src/engine/modules/SpatialNetworkModule.js src/engine/modules/HumanEnvironmentModule.js src/experiments
git commit -m "feat: add reusable geography system labs"
```

---

### Task 7: 将教材图片注册表拆成按册加载

**Files:**
- Create: `src/textbook/data/figureAssets/loader.js`
- Create: `src/textbook/data/figureAssets/loader.test.js`
- Create: `src/textbook/data/figureAssets/必修第一册.js`
- Create: `src/textbook/data/figureAssets/必修第二册.js`
- Create: `src/textbook/data/figureAssets/选择性必修1.js`
- Create: `src/textbook/data/figureAssets/选择性必修2.js`
- Create: `src/textbook/data/figureAssets/选择性必修3.js`
- Delete: `src/textbook/data/figureAssets.js`
- Modify: `src/textbook/SectionContent.vue`

**Interfaces:**
- Consumes: `gradeId`、`bookId` 和现有内容 JSON 中的图片键。
- Produces: `loadFigureAssets(grade, book)`，返回当前册的只读 `{ [figureKey]: url }`，并按 `grade/book` 缓存 Promise。

- [ ] **Step 1: 为按册加载、缓存和未知册编写失败测试**

```js
it('loads only the requested book manifest and caches it', async () => {
  const first = await loadFigureAssets('高中', '必修第一册')
  const second = await loadFigureAssets('高中', '必修第一册')
  expect(first).toBe(second)
  expect(first['water-cycle']).toMatch(/water-cycle/)
  expect(first['world-pop-density']).toBeUndefined()
})

it('returns an empty frozen map for books without figures', async () => {
  expect(await loadFigureAssets('初中', '七年级上册')).toEqual({})
})
```

- [ ] **Step 2: 运行加载器测试并确认失败**

Run: `pnpm vitest run src/textbook/data/figureAssets/loader.test.js`

Expected: FAIL，因为按册加载器不存在。

- [ ] **Step 3: 按原始路径无损迁移五册图片映射**

把现有 366 个静态图片导入和键值映射按资源路径所属册移动到五个文件。不得修改任何图片文件、图片尺寸、编码或键名；每个文件仅导出本册 `figureAssets`。

- [ ] **Step 4: 实现静态可分析的动态加载表**

```js
const LOADERS = {
  '高中/必修第一册': () => import('./必修第一册.js'),
  '高中/必修第二册': () => import('./必修第二册.js'),
  '高中/选择性必修1': () => import('./选择性必修1.js'),
  '高中/选择性必修2': () => import('./选择性必修2.js'),
  '高中/选择性必修3': () => import('./选择性必修3.js'),
}
```

缓存加载 Promise；失败时删除缓存以允许重试。未知册返回冻结空对象。

- [ ] **Step 5: 让教材页等待当前册清单并改善图片解码**

章节加载时将内容和当前册图片清单并行请求；为图片增加 `decoding="async"`。第一张关键图在内容完成后使用 `fetchpriority="high"`，其余保持 `loading="lazy"`。

- [ ] **Step 6: 验证图片键完整性和教材测试**

测试遍历五册 `content.json` 中的所有 `figures[].images[]`，断言当前册清单存在对应键。

Run: `pnpm vitest run src/textbook/data/figureAssets/loader.test.js src/textbook`

Expected: PASS，且不存在丢失图片键。

- [ ] **Step 7: 提交按册图片拆分**

```bash
git add src/textbook
git commit -m "perf: load textbook figures by book"
```

---

### Task 8: 统一 3D 可见性暂停、恢复和资源释放

**Files:**
- Create: `src/engine/core/SceneActivity.js`
- Create: `src/engine/core/SceneActivity.test.js`
- Modify: `src/engine/core/BaseScene.js`
- Modify: `src/engine/core/RenderManager.js`
- Modify: `src/engine/utils/AssetLoader.js`
- Modify: `src/experiments/engine/ExperimentEngine.js`

**Interfaces:**
- Consumes: `document.visibilityState`、`IntersectionObserver`、`requestAnimationFrame`。
- Produces: `SceneActivity`, `BaseScene.pause()`, `BaseScene.resume()`, `BaseScene.isRunning` 和幂等 `dispose()`。

- [ ] **Step 1: 为后台暂停、恢复、不可见容器和幂等销毁编写失败测试**

```js
it('runs only when the document and container are visible', () => {
  const activity = new SceneActivity({ onActiveChange })
  activity.setDocumentVisible(false)
  expect(onActiveChange).toHaveBeenLastCalledWith(false)
  activity.setDocumentVisible(true)
  activity.setElementVisible(true)
  expect(onActiveChange).toHaveBeenLastCalledWith(true)
})

it('disposes observers and listeners once', () => {
  activity.dispose()
  activity.dispose()
  expect(removeEventListener).toHaveBeenCalledTimes(1)
  expect(disconnect).toHaveBeenCalledTimes(1)
})
```

- [ ] **Step 2: 运行生命周期测试并确认失败**

Run: `pnpm vitest run src/engine/core/SceneActivity.test.js`

Expected: FAIL，因为活动控制器不存在。

- [ ] **Step 3: 实现活动状态控制器并接入 BaseScene**

活动条件为“未被手动暂停、文档可见、容器可见且未销毁”。暂停时取消动画帧；恢复时重新启动一条动画循环并重置时钟 delta，避免恢复首帧跳变。

- [ ] **Step 4: 让销毁路径幂等并释放缓存纹理**

`BaseScene.dispose()`、`RenderManager.dispose()` 和 `ExperimentEngine.dispose()` 重复调用不抛错。`AssetLoader` 增加 `dispose(key)` 与 `disposeAll()`，释放纹理后删除缓存；共享纹理只由明确所有者在应用退出或缓存失效时释放。

- [ ] **Step 5: 验证生命周期测试和全部实验测试**

Run: `pnpm vitest run src/engine src/experiments`

Expected: PASS，测试结束后没有未处理 Promise 或未关闭动画警告。

- [ ] **Step 6: 提交生命周期优化**

```bash
git add src/engine src/experiments/engine
git commit -m "perf: pause hidden 3d scenes"
```

---

### Task 9: 增加构建拆包、体积预算和无 Three.js 门禁

**Files:**
- Create: `scripts/check-bundle-budget.mjs`
- Create: `scripts/check-bundle-budget.test.mjs`
- Modify: `vite.config.mjs`
- Modify: `package.json`
- Modify: `src/textbook/components/AsyncModuleError.vue`

**Interfaces:**
- Consumes: Vite `manifest.json`、构建目录中文件和 gzip 计算。
- Produces: `collectStaticEntryGraph(manifest, entry)`, `gzipSize(path)`, `checkBundleBudgets(distDir)` 和 `pnpm qa:bundle`。

- [ ] **Step 1: 为入口依赖图、Three.js 禁止项和体积超限编写失败测试**

使用临时 manifest fixture 覆盖：主页静态导入 Vue、教材路由动态导入、实验路由动态导入 Three.js。断言主页和教材静态图不包含 `vendor-three`，并在 gzip 字节超过预算时返回明确错误。

- [ ] **Step 2: 运行预算测试并确认失败**

Run: `node --test scripts/check-bundle-budget.test.mjs`

Expected: FAIL，因为预算检查器不存在。

- [ ] **Step 3: 实现构建 manifest 和预算检查**

Vite 启用 `build.manifest: true`。检查器递归遍历入口的静态 `imports`，不把 `dynamicImports` 计入初始路径；分别计算首页入口和 `src/textbook/SectionContent.vue` 静态依赖的 gzip 总和，并报告最大块。

- [ ] **Step 4: 调整稳定拆包边界**

保留 `vendor-three`、`vendor-vue` 和 `vendor-core`；教材目录、每册正文、每册图片清单和两个新增沙盘由动态导入自然形成块。不得把 `src/engine` 整体手动合并进首页可达块。

- [ ] **Step 5: 增加构建命令并运行真实预算**

`package.json` 增加：

```json
{
  "scripts": {
    "qa:bundle": "pnpm run build && node scripts/check-bundle-budget.mjs dist"
  }
}
```

Run: `pnpm qa:bundle`

Expected: 首页 ≤153600 gzip 字节，教材静态图 ≤256000 gzip 字节，二者均不含 `vendor-three`。

- [ ] **Step 6: 完善异步错误 UI 并验证构建**

错误组件展示模块名称、重试操作和返回入口；不输出空白容器。运行：

Run: `pnpm test && pnpm qa:bundle`

Expected: PASS。

- [ ] **Step 7: 提交构建性能门禁**

```bash
git add scripts/check-bundle-budget.mjs scripts/check-bundle-budget.test.mjs vite.config.mjs package.json src/textbook/components/AsyncModuleError.vue
git commit -m "perf: enforce frontend bundle budgets"
```

---

### Task 10: 完整回归、浏览器性能测量和覆盖报告

**Files:**
- Create: `docs/performance/2026-08-30-textbook-lab-results.md`
- Modify: `scripts/textbook-quality-report.md` only if it already indexes QA reports

**Interfaces:**
- Consumes: 全部自动化测试、生产构建、覆盖审计和浏览器性能数据。
- Produces: 最终覆盖率、构建体积、冷/热缓存时间、代表性流程及 3D 质量检查记录。

- [ ] **Step 1: 运行完整自动化验证**

Run: `pnpm test`

Expected: 全部测试通过，无未处理异常和重复声明警告。

Run: `pnpm qa:experiment-links`

Expected: 至少 `106/117`，无无效实验、无效预设、重复键和孤立键。

Run: `pnpm qa:bundle`

Expected: 构建与两项体积预算通过，首页和教材入口不包含 Three.js。

- [ ] **Step 2: 启动生产预览并验证关键流程**

Run: `pnpm preview`

在桌面与 390px 窄屏分别验证：

1. 首页 → 初中教材 → 小节 → 配套实验 → 返回原文。
2. 首页 → 高中教材 → 小节 → 配套实验 → 返回原文。
3. 实验室 → 按年级/册/章筛选 → 独立打开实验 → 查看相关教材。
4. 无效实验、无效预设、模拟加载失败和 WebGL 不可用的恢复界面。
5. 键盘 Tab/Enter 可操作主实验、相关实验、返回教材和重试按钮。

- [ ] **Step 3: 测量冷缓存与热缓存性能**

在浏览器模拟常见 4G 和 4× CPU slowdown，分别记录：首页主要内容时间、教材主要内容时间、实验可交互时间、初始 JS gzip、教材静态 JS gzip。冷缓存刷新一次，热缓存刷新一次。

- [ ] **Step 4: 验证 3D 生命周期和视觉质量**

连续打开并退出天文、气象、水文、地质、空间网络和人地关系实验；确认后台标签页动画暂停、恢复后模型状态正常、WebGL 内存不持续增长。对比改造前设置，记录像素比、抗锯齿、阴影、色调映射和后处理均未降低。

- [ ] **Step 5: 写入结果报告**

报告必须包含：提交号、测试数量、覆盖率分子/分母、未覆盖清单、首页和教材 gzip 字节、冷/热缓存测量值、设备/节流配置、六类代表模型检查结果以及任何未达到目标的明确说明。

- [ ] **Step 6: 最终验证并提交报告**

Run: `git diff --check && pnpm test && pnpm qa:experiment-links && pnpm qa:bundle`

Expected: 全部退出 0。

```bash
git add docs/performance/2026-08-30-textbook-lab-results.md scripts/textbook-quality-report.md
git commit -m "docs: record textbook lab performance results"
```
