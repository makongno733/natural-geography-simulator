#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
cd "${REPO_ROOT}"

echo "=== [1/5] 拉取最新 main 分支代码 ==="
git fetch origin main
git checkout main
git pull --ff-only origin main

echo "=== [2/5] 对活动容器内的 SQLite 数据库执行在线备份 ==="
BACKUP_DIR="/opt/geo-account-backups"
mkdir -p "${BACKUP_DIR}"
chmod 700 "${BACKUP_DIR}"
STAMP="$(date +%Y%m%d-%H%M%S)"
if docker compose -f deploy/account/compose.yaml ps --status running | grep -q account; then
  docker compose -f deploy/account/compose.yaml exec -T account node -e '
    import("better-sqlite3").then(async ({ default: Database }) => {
      const dbPath = process.env.ACCOUNT_DB_PATH || "/var/lib/geo-account/account.sqlite";
      const db = new Database(dbPath);
      await db.backup("/tmp/account-pre-update.sqlite");
      const checkDb = new Database("/tmp/account-pre-update.sqlite", { readonly: true });
      const res = checkDb.pragma("integrity_check", { simple: true });
      if (res !== "ok") throw new Error("Integrity check failed: " + res);
      console.log("Online backup integrity_check:", res);
    });
  '
  CONTAINER_ID="$(docker compose -f deploy/account/compose.yaml ps -q account)"
  docker cp "${CONTAINER_ID}:/tmp/account-pre-update.sqlite" "${BACKUP_DIR}/account-${STAMP}.sqlite"
  chmod 600 "${BACKUP_DIR}/account-${STAMP}.sqlite"
  echo "已保存安全备份: ${BACKUP_DIR}/account-${STAMP}.sqlite"
fi

echo "=== [3/5] 构建最新 Better Auth 账号服务镜像 ==="
docker compose -f deploy/account/compose.yaml build account

echo "=== [4/5] 执行数据库幂等迁移并重启账号容器 ==="
docker compose -f deploy/account/compose.yaml run --rm --no-deps account node server/migrate.mjs
docker compose -f deploy/account/compose.yaml up -d account

echo "=== [5/5] 核验本地 127.0.0.1:4100 健康状态与 Better Auth 配置 ==="
sleep 2
curl -fsS http://127.0.0.1:4100/api/health && echo ""
curl -fsS http://127.0.0.1:4100/api/config && echo ""
echo "=== 账号服务更新完成 ==="
