# 账号与 Cloudflare 图片发布核查

日期：2026-10-12。目标域名：`geo.kongnoma279.com`、`account.kongnoma279.com`。

## 账号

- 账号中心在浏览器中显示现有登录用户；`/api/health` 返回 `ok`，`/api/config` 显示邮箱、Google、GitHub 已启用。
- 评论接口对无效章节返回 400，对未登录的发布请求返回 401。未创建测试账号或公开测试评论。
- 账号服务是独立部署；本次没有修改或重启其后端。

## 图片

- 图片原件保存在本项目的 `src/assets/geo-verified/`，由 Cloudflare Pages 部署；来源、作者和许可见同目录 `manifest.json`。
- 已为 `kongnoma279.com` 启用 Cloudflare Images 的同域图片转换。线上 `geo` 域名的影像卡片和探究页用固定的 960 像素宽度、质量 82 和自动格式；Cloudflare 从 JPEG 原件生成浏览器可用格式。转换出错时回退到原件。
- 验证发现 Cloudflare Images 对当前 AVIF 原件返回 9520（不支持的源格式），JPEG 原件转换成功，浏览器请求可返回 AVIF。因此页面不再把 AVIF 原件作为转换源。
- 这使用免费远程图片转换，未启用付费的 Cloudflare Images Hosted Images 存储。其他域名及本地预览继续直接使用项目原件。

发布后需打开主站首页和地理探究页，确认图片加载、账号入口可用，并核对 Cloudflare Pages 的生产提交号。
