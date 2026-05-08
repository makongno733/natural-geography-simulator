# 地貌教学系统

这是一个基于 `Vue 3 + Vite + Electron` 的现代化地貌教学项目。

## 开发方式

推荐使用 `pnpm`，不要把 `file://` 直接打开 `html` 文件当成主开发预览方式。

```bash
pnpm install
pnpm dev
```

默认预览地址：

```text
http://127.0.0.1:4173
```

## 常用命令

```bash
pnpm dev
pnpm build
pnpm preview
pnpm build:standalone
pnpm electron:dev
pnpm electron:start
pnpm electron:dist:mac
pnpm electron:dist:win
```

## 说明

- `pnpm dev`：现代前端开发主入口
- `pnpm build`：标准 Web 构建
- `pnpm build:standalone`：生成可直接打开的单文件兼容产物
- `pnpm electron:dev`：开发服务器与 Electron 桌面壳联调
- `pnpm electron:*`：桌面端打包与调试

## 技术栈

- Vue 3
- Vite 6
- Electron
- electron-builder
