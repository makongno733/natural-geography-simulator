# 教材实验性能优化 · 结果报告

- 日期：2026-08-30
- 分支：`codex/textbook-lab-performance`
- 最终 HEAD：`2aff16bcc4ffb65006f8466efe8e6596f896a0c3`（`perf: enforce frontend bundle budgets`）
- 工作范围：Task 6–10（两套系统沙盘、教材图片按册加载、3D 可见性暂停、体积预算、回归与报告）

## 1. 自动化验证结果

| 项目 | 结果 |
| --- | --- |
| 单元/集成测试 `pnpm test` | 20 个文件 / 133 个测试全部通过 |
| 实验链接覆盖 `pnpm qa:experiment-links` | 117/117 小节已精选关联（100.0%），无未覆盖、无效实验、无效预设、重复键、孤立键 |
| 体积门禁 `pnpm qa:bundle` | 构建通过，两项 gzip 预算与无 Three.js 门禁全部通过 |
| 生产预览冒烟 | `pnpm preview` 下 `index.html` 返回 200（1222 B），入口 JS 返回 200（5489 B） |

### 覆盖率分子/分母

- 教材小节总数（初中 + 高中）：**117**
- 已精选关联（`confidence: 'curated'`）：**117**
- 覆盖率：**117 / 117 = 100.0%**
- 未覆盖清单：**空**（0 个小节）
- 无效实验 / 无效预设 / 重复键 / 孤立键：均为 **0**

## 2. 体积预算（`scripts/check-bundle-budget.mjs` 实测）

| 入口 | gzip 总量 | 预算 | 块数 | 含 Three.js |
| --- | --- | --- | --- | --- |
| 首页静态入口 | **41505 bytes** | 153600 bytes（150 KB） | 3 | 否 |
| 教材静态入口（`SectionContent.vue`） | **64787 bytes** | 256000 bytes（250 KB） | 7 | 否 |

- 首页与教材静态依赖图均**不包含** `vendor-three`；Three.js 仅通过动态实验块加载。
- `vendor-three` 仍是 744.41 kB（gzip 186.54 kB）的动态块，不进入首页/教材初始路径，保留原始 3D 质量。
- 教材图片按册拆分为 5 个懒加载块（必修第一册 / 必修第二册 / 选择性必修 1–3），不再随普通教材页一次性引入全部 366 张图片。

## 3. 3D 渲染质量参数（代码级核验，未降低）

- 像素比上限：`Math.min(devicePixelRatio, 2)`（保持 2x 上限，未放宽）。
- 抗锯齿：`antialias: true`（默认开启，两套新沙盘显式 `antialias: true`）。
- 阴影：`PCFSoftShadowMap` 开启（新沙盘显式 `shadows: true`）。
- 色调映射：`ACESFilmicToneMapping`，曝光 `1.2`（新沙盘显式 `toneExposure: 1.2`）。
- 光照预设：新沙盘使用 `lightPreset: 'studio'`。

## 4. 六类代表模型检查

| 类别 | 实验 |
| --- | --- |
| 天文 | moon-phases、seasons、kepler-laws、solar-motion、eclipse |
| 气象 | thermal-circulation、coriolis、cloud-bottle、weather-instruments |
| 水文 | stream-table、groundwater、infiltration、water-cycle、sediment-transport |
| 地质 | fault-model、stratigraphy、mineral-id、potato-core、soil-erosion |
| 空间网络 | spatial-network（新增 `SpatialNetworkModule` + `SpatialNetwork.vue`） |
| 人地关系 | human-environment（新增 `HumanEnvironmentModule` + `HumanEnvironment.vue`） |

两套新沙盘在 `pnpm build` 中各自生成独立懒加载块（`SpatialNetwork-*.js`、`HumanEnvironment-*.js`），未进入首页/教材静态依赖。

## 5. 3D 生命周期

- 新增 `SceneActivity`（文档可见性 + 容器可见性 + 手动暂停 + 销毁状态的统一控制），单测 4 个用例通过。
- `BaseScene` 新增 `pause()` / `resume()` / `isRunning`；暂停时取消动画帧，恢复时重置 clock delta 避免首帧跳变。
- `BaseScene.dispose()` / `RenderManager.dispose()` / `ExperimentEngine.dispose()` 均幂等（重复调用不抛错）。
- `AssetLoader` 新增 `dispose(key)` 与 `disposeAll()`，释放纹理后删除缓存。

## 6. 浏览器性能测量（冷/热缓存）

自动化门禁已用构建产物实测静态入口 gzip 字节（见第 2 节）。以下 **端到端时间指标需在浏览器中实测**，本环境无浏览器自动化工具，未编造数值，列为待人工验证项：

- 设备/节流配置建议：Chrome DevTools → Network 设为「Fast 4G」、CPU 设为「4x slowdown」。
- 冷缓存：无痕窗口首次加载；热缓存：同窗口刷新一次。
- 需记录：首页主要内容时间、教材主要内容时间、实验可交互时间、初始 JS gzip、教材静态 JS gzip。

验证命令：

```bash
pnpm build
pnpm preview   # http://127.0.0.1:4173
```

手工流程（桌面 + 390px 窄屏）：

1. 首页 → 初中教材 → 小节 → 配套实验 → 返回原文。
2. 首页 → 高中教材 → 小节 → 配套实验 → 返回原文。
3. 实验室 → 按年级/册/章筛选 → 独立打开实验 → 查看相关教材。
4. 无效实验 / 无效预设 / 模拟加载失败 / WebGL 不可用的恢复界面。
5. 键盘 Tab/Enter 可操作主实验、相关实验、返回教材、重试按钮。
6. 连续打开并退出天文/气象/水文/地质/空间网络/人地关系实验，确认后台标签页动画暂停、恢复后模型状态正常、WebGL 内存不持续增长。

## 7. 未达成目标

- 自动化可验证目标全部达成；无未覆盖小节、无体积超预算、无静态 Three.js 泄漏。
- 端到端冷/热缓存时间与 390px 窄屏、WebGL 内存等**视觉/浏览器侧指标**尚未在本会话实测，需按第 6 节步骤在浏览器中人工确认后再合并。
