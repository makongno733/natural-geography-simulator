# 课程助手 AI 部署

课程助手的问答接口运行在账号服务 `/api/assistant/ask`，浏览器只发送问题，不持有 DeepSeek 密钥。回答使用 `server/assistant-corpus.json` 中的本站教材摘录；账号服务构建时会从教材源码重新生成索引。

## 本机配置

1. 在仓库根目录运行 `node scripts/setup-deepseek-key.mjs`，打开 `http://127.0.0.1:4188/`，由站主自行输入 DeepSeek API Key。临时页面只监听 `127.0.0.1`，并将密钥写入权限为 `0600` 的 `.env.ai`。该文件被 Git 忽略，不要粘贴到聊天、提交到 Git 或上传静态托管。
2. 按 `.env.example` 创建本机私有 `.env`，设置 `SITE_ORIGIN`、`AUTH_ORIGIN`、`BETTER_AUTH_SECRET` 等账号服务配置。
3. 运行 `pnpm build:account`，再用 `node --env-file=.env --env-file=.env.ai server/migrate.mjs` 和 `node --env-file=.env --env-file=.env.ai server/index.mjs` 启动账号服务。主站的 `VITE_ACCOUNT_ORIGIN` 指向该服务。

## 生产配置

先核对当前账号服务容器、数据库卷、端口和 Nginx 代理。将 `DEEPSEEK_API_KEY` 配在服务器 `/opt/geo-account` 的私有 `.env` 中（`DEEPSEEK_MODEL` 默认为 `deepseek-flash`），使用更新后的源码构建账号服务镜像并重启该容器。主站仍通过现有 Cloudflare Pages 发布；若主站已配置 `VITE_ACCOUNT_ORIGIN`，部署前端更新后会显示“问 AI”。本机 `.env.ai` 不能直接作为部署文件。

上线后核对：`/api/config` 的 `ai` 为 `true`；教材问题返回答案与章节链接；政治敏感和套取提示词请求返回固定回复；无关问题返回范围提示；跨来源请求被拒绝。服务端限制问题长度为 300 字、每分钟最多 12 次、进程内每日最多 200 次调用。重启会重置进程内计数；若访问量增长，应改为持久化限额和额外的滥用控制。

模型分类和提示词约束不能保证拦截所有绕过方式。不要把密钥或其他内部秘密放进模型上下文；对外开放前仍需检查费用额度与边界测试结果。
