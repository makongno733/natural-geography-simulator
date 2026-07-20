# Task 5: SectionContent 学生学习视图集成报告

## RED

- 先新增 `src/textbook/SectionContent.test.js`，mock 路由、目录加载器和内容加载器，覆盖学生覆盖层与无覆盖层两条路径。
- 执行 `pnpm test -- src/textbook/SectionContent.test.js`，按预期出现 1 个失败：`StudentLearningView` 不存在；无覆盖层时 `.lesson-brief` 的降级用例已通过。

## GREEN

- `SectionContent.vue` 通过 `normalizeStudentLearning(loadedContent.value?.studentLearning)` 生成 `studentLearning`，有覆盖层时渲染 `StudentLearningView`，否则保留原有 `lesson-brief`、思维导图卡和概念定义。
- 新增纯计算属性 `learningTools`，沿用现有章节判定规则，工具 id 限定为 `mindmap`、`earth`、`atmosphere`、`water`、`landform`、`guilin`、`yellowriver`、`taklamakan`、`soil`、`disaster`、`data-viz`。
- `openLearningTool(id)` 只改动原有 `show*` 和 `caseStudy` refs；测试验证 `open-tool: earth` 会进入原 `Earth3D` 分支。
- GREEN 命令 `pnpm test -- src/textbook/SectionContent.test.js`：7 个测试文件、14 项测试全部通过。

## 全量测试

- 简报指定回归：`pnpm test -- src/textbook/SectionContent.test.js src/textbook/components/__tests__ src/textbook/utils/studentLearningSchema.test.js`，7 个测试文件、14 项测试全部通过。
- 全量：`pnpm test`，7 个测试文件、14 项测试全部通过。
- 构建：`pnpm run build` 成功，169 个模块完成转换。
- `git diff --check` 通过。

## 自检

- 有覆盖层：新视图可见，原 `.lesson-brief` 不渲染。
- 工具事件：复用原有模块状态，未新增第二套显示状态。
- 无覆盖层：原 `.lesson-brief` 安全降级，不出现空白页。
- 上下节导航仍在新旧正文分支之外，两种模式都保留。
- 变更范围仅为任务指定的 `SectionContent.vue`、`SectionContent.test.js` 和本报告。

## 关注点

- 构建仍会报告现有 `vendor-three` chunk 大于 650 kB 的警告，本次任务未改动 chunk 分割。
- 当 `studentLearning` 为非对象或不存在时，规范化函数返回 `null` 并进入旧页降级分支。
