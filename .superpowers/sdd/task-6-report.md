# Task 6 实施报告：第一至第三章学生内容与内容审计

## 实施范围

- 新增 `scripts/audit-student-learning.mjs`，提供 `auditStudentLearning(data)` 与可选 JSON 路径的 CLI。
- 新增 `scripts/audit-student-learning.test.mjs`，用 17 节最小 fixture 验证失败和成功路径。
- 在 `package.json` 增加 `qa:student-learning`。
- 完成必修第一册第一章至第三章共 9 节学生学习内容；未修改 `content.json`。
- 内容依据主目录只读来源 `/Users/makongno/Documents/natural-geography-simulator-source/高中地理必修第一册_全册课件综合总结.txt` 整理，并按 task brief 限定课时边界。

## TDD 证据

### RED

命令：

```text
pnpm test -- scripts/audit-student-learning.test.mjs
```

首次运行退出码为 1。Vitest 明确报告无法解析 `./audit-student-learning.mjs`，因为审计器尚不存在；结果为 `1 failed | 7 passed`，符合“先写测试、观察功能缺失失败”的预期。

### GREEN

实现审计器和 package 脚本后再次运行相同命令，退出码为 0：

```text
Test Files  8 passed (8)
Tests       16 passed (16)
```

fixture 覆盖：不完整节次会报告缺少非空 `objectives`、`overview`、`knowledgeBlocks`；完整的 17 节最小 fixture 通过并返回 `auditedSections: 17`。

## 内容审计的预期失败

命令：

```text
pnpm qa:student-learning
```

退出码为 1，恰有 8 个错误，全部为后续任务尚未提供的节次：

```text
第四章 第一节: 缺少节次
第四章 第二节: 缺少节次
第五章 第一节: 缺少节次
第五章 第二节: 缺少节次
第六章 第一节: 缺少节次
第六章 第二节: 缺少节次
第六章 第三节: 缺少节次
第六章 第四节: 缺少节次
```

第一至第三章没有字段缺失、练习字段缺失或禁止文本模式错误。

## 全量验证

- `pnpm test`：退出码 0，8 个测试文件、16 项测试全部通过。
- `pnpm build`：退出码 0，Vite 完成 169 个模块转换并生成生产构建。
- `git diff --check`：退出码 0，无空白错误。
- JSON 结构自检：9 节概览长度为 128—167 字；每节有 3—4 个目标、2—3 个知识块、至少 1 个机制链、1—3 个易错点、1 道含具体答案/解析/知识点的练习，以及 2 个记忆提示；案例数为 0—2，原总结提供答题模板的课时均已写入模板。

## 内容自检

- 1.1 只覆盖天体、天体系统、地球普通性与生命条件。
- 1.2 覆盖太阳辐射四项影响因素，以及耀斑、日冕物质抛射影响通信和磁场的机制。
- 1.3 用前寒武纪、古生代、中生代、新生代组织四阶段演化，并加入时间压缩和大灭绝案例。
- 1.4 覆盖 P/S 波、莫霍面、古登堡面、内外圈层，并明确岩石圈不等于地壳。
- 2.1 覆盖大气组成和三层大气，明确正常递减与逆温的区别。
- 2.2 热力环流机制链严格采用“冷热不均 → 垂直运动 → 气压差 → 水平运动”。
- 3.1 保留“海陆最重要、海上量最大、陆地量最小”，并覆盖人类活动影响。
- 3.2 校正温度、盐度、密度分布表述，使用红海与波罗的海对比案例。
- 3.3 覆盖海浪、潮汐、洋流，提供潮汐机制，并强调寒暖流取决于相对水温。
- 全文未出现 OCR 残句及指定禁用文本；没有改动主工作区或 `content.json`。

## 关注点

- `qa:student-learning` 当前必须保持失败，直到第四至第六章 8 节由后续任务补齐；届时成功文案应为 `Student learning audit passed: 17/17 sections`。
- 构建成功，但 Vite 仍提示 `vendor-three` 压缩前体积超过 650 kB；该警告与本任务内容数据无关，未在本任务中扩大范围处理。

## Important 审查修复（2026-07-21）

### 根因

原审计器使用通用 `isNonEmpty()` 判断四类可选模块。非空对象形式的 `practice` 因而被当作有效内容，但练习字段校验只在 `practice` 为数组时执行，形成了类型校验空档。

### 扩充后的测试范围

- 直接复用实现导出的 `requiredLessons`，删除测试中的重复目录常量。
- 覆盖缺失必修节次、四类可选模块全空、`memoryTips` 与 `answerTemplates` 全空。
- 覆盖单道练习缺少 `question`、`answer`、`explanation`、`knowledgePoint` 四个字段。
- 分别覆盖 `学生回答`、`教师小结`、固定流程套话、固定提问套话、`。。` 和字面量反斜杠加 `n` 六种禁止模式。
- 覆盖非数组 `practice` 必须失败，且不得满足可选模块规则。
- 通过真实 Node 子进程覆盖 CLI 成功文案、失败错误输出和退出状态。

### 修复 RED

命令：

```text
pnpm test -- scripts/audit-student-learning.test.mjs
```

测试夹具路径问题修正后，功能性 RED 的退出码为 1，输出为：

```text
scripts/audit-student-learning.test.mjs (15 tests | 1 failed)
× rejects a non-array practice without counting it as optional content
AssertionError: expected true to be false
Test Files  1 failed | 7 passed (8)
Tests       1 failed | 28 passed (29)
```

该失败准确证明原实现接受了对象形式的 `practice`。

### 修复 GREEN

审计器现在对存在但非数组的 `practice` 报告 `practice 必须为数组`，并只允许非空练习数组满足可选内容规则。再次运行相关测试：

```text
Test Files  8 passed (8)
Tests       29 passed (29)
```

随后运行全量测试：

```text
pnpm test
Test Files  8 passed (8)
Tests       29 passed (29)
```

### 内容修复

- 1.3 保留原“地质时期特征题”，新增“重要成煤期成因题”：温暖湿润使植物繁盛，植物遗体堆积，地壳下沉与沉积物掩埋，经过长期地质作用形成煤。
- 2.2 明确对比：高空摩擦力可忽略，水平气压梯度力与地转偏向力平衡，风向平行等压线；近地面受摩擦力影响，风向斜穿等压线。
- 结构化内容断言通过：`Content review assertions passed: coal template and wind comparison`。

### 修复后部分审计

`pnpm qa:student-learning` 仍按任务阶段预期退出 1，只报告第四至第六章 8 个缺失节次；第一至第三章没有新增错误。
