#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
cd "${REPO_ROOT}"

STAMP="$(date +%Y%m%d-%H%M%S)"

echo "=== [1/6] 检查源码目录状态 ==="
if [ -d "${REPO_ROOT}/.git" ]; then
  echo "检测到 Git 仓库，拉取最新 origin/main..."
  git fetch origin main
  git checkout main
  git pull --ff-only origin main
else
  echo "当前目录 (${REPO_ROOT}) 非 Git 仓库，直接使用当前已同步的目录文件构建。"
fi

echo "=== [2/6] 保存当前镜像回退标签 ==="
if docker image inspect geo-account:0.1.0 >/dev/null 2>&1; then
  docker tag geo-account:0.1.0 "geo-account:pre-${STAMP}"
  echo "已保留旧镜像回退标签: geo-account:pre-${STAMP}"
fi

echo "=== [3/6] 对活动容器内的 SQLite 数据库执行在线一致性备份 ==="
BACKUP_DIR="/opt/geo-account-backups"
mkdir -p "${BACKUP_DIR}"
chmod 700 "${BACKUP_DIR}"
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
  echo "已保存并通过完整性校验的备份: ${BACKUP_DIR}/account-${STAMP}.sqlite"
fi

echo "=== [4/6] 构建最新账号与社区服务镜像（含 dist-account 与 src/fanxing/catalog.js） ==="
docker compose -f deploy/account/compose.yaml build account

echo "=== [5/6] 执行数据库幂等迁移并重启账号容器 ==="
docker compose -f deploy/account/compose.yaml run --rm --no-deps account node server/migrate.mjs
docker compose -f deploy/account/compose.yaml up -d account

echo "=== [6/6] 核验本地 127.0.0.1:4100 核心接口 ==="
sleep 3
for ep in "/api/health" "/api/config" "/api/community/posts" "/api/community/resources" "/api/fanxing/projects"; do
  echo "-> 检查 ${ep}"
  curl -fsS "http://127.0.0.1:4100${ep}" | head -c 240
  echo ""
done
echo "=== 账号服务更新与接口核验完成（回退镜像: geo-account:pre-${STAMP}） ==="
