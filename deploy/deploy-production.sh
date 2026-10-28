#!/usr/bin/env bash
# Production account data lives in a Docker named volume, not ./data/account.sqlite.
# An unattended script cannot safely infer the active volume, compose project,
# image, backup location, or rollback point on a shared server.
set -euo pipefail

cat >&2 <<'MESSAGE'
发布已停止：此脚本不能安全更新当前阿里云账号服务。

当前服务使用 Docker 命名卷保存 SQLite 数据。旧脚本按仓库目录下的
./data/account.sqlite 备份和迁移，可能迁移错误的数据库，并重建错误的
Compose 项目。请按 docs/地理共同体-下一阶段总控与AI交接-2026-10-27.md
的任务 A，先核对现有容器、数据卷和镜像，再对活动数据库做在线备份，
在备份副本上演练迁移，最后只重建账号服务并逐项验收。
MESSAGE
exit 2
