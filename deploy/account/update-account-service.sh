#!/usr/bin/env bash
set -Eeuo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}/../.."
COMPOSE=(docker compose -f deploy/account/compose.yaml)
STAMP="$(date +%Y%m%d-%H%M%S)-$$"
BACKUP_DIR="${ACCOUNT_BACKUP_DIR:-/opt/geo-account-backups}"
mkdir -p "${BACKUP_DIR}"
chmod 700 "${BACKUP_DIR}"
LOCK_DIR="${BACKUP_DIR}/.deploy-lock"
if ! mkdir "${LOCK_DIR}" 2>/dev/null; then echo "另一次部署可能正在进行，请核对 ${LOCK_DIR}。" >&2; exit 1; fi
trap 'rmdir "${LOCK_DIR}"' EXIT
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  test "$(git branch --show-current)" = main
  git diff --quiet
  git diff --cached --quiet
  git fetch origin main
  git pull --ff-only origin main
  export APP_REVISION="$(git rev-parse HEAD)"
else
  : "${APP_REVISION:?非 Git 目录须指定 APP_REVISION 为已核对的源码提交号}"
  export APP_REVISION
fi
test -f .env
old_container="$("${COMPOSE[@]}" ps -q account)"
old_image=''
switched=0
rollback() {
  local status=$?
  trap - ERR
  if [ -n "${old_image}" ]; then
    docker tag "${old_image}" geo-account:0.1.0 || true
    if [ "${switched}" = 1 ]; then "${COMPOSE[@]}" up -d --no-build account || true; fi
  fi
  echo "部署验收失败，已尝试恢复旧镜像。不会自动还原数据库，以免覆盖新写入；备份在 ${BACKUP_DIR}。" >&2
  exit "${status}"
}
trap rollback ERR
if [ -n "${old_container}" ]; then
  old_image="$(docker inspect "${old_container}" --format '{{.Image}}')"
  docker tag "${old_image}" "geo-account:pre-${STAMP}"
  "${COMPOSE[@]}" exec -T account node -e '
    import("better-sqlite3").then(async ({ default: Database }) => {
      const db = new Database(process.env.ACCOUNT_DB_PATH || "/var/lib/geo-account/account.sqlite");
      await db.backup("/tmp/account-pre-update.sqlite");
      const copy = new Database("/tmp/account-pre-update.sqlite", { readonly: true });
      if (copy.pragma("integrity_check", { simple: true }) !== "ok") throw Error("Backup integrity check failed");
      console.log("Online backup integrity: ok");
    });
  '
  docker cp "${old_container}:/tmp/account-pre-update.sqlite" "${BACKUP_DIR}/account-${STAMP}.sqlite"
  chmod 600 "${BACKUP_DIR}/account-${STAMP}.sqlite"
fi
if [ -n "${ACCOUNT_PREBUILT_IMAGE:-}" ]; then
  docker image inspect "${ACCOUNT_PREBUILT_IMAGE}" >/dev/null
  docker tag "${ACCOUNT_PREBUILT_IMAGE}" geo-account:0.1.0
else
  available_kb="$(df -Pk . | awk 'END {print $4}')"
  if [ "${available_kb}" -lt "${ACCOUNT_MIN_BUILD_KB:-2097152}" ]; then
    echo "磁盘空间不足，停止完整构建。请扩容或使用 ACCOUNT_PREBUILT_IMAGE；不会自动删除数据。" >&2
    false
  fi
  "${COMPOSE[@]}" build account
fi
"${COMPOSE[@]}" run --rm --no-deps account node server/migrate.mjs
switched=1
"${COMPOSE[@]}" up -d --no-build account
deadline=$((SECONDS + ${ACCOUNT_READY_TIMEOUT:-90}))
until curl -fsS --max-time 5 --output "${BACKUP_DIR}/ready-${STAMP}.json" http://127.0.0.1:4100/api/ready; do
  if [ "${SECONDS}" -ge "${deadline}" ]; then echo "等待服务就绪超时。" >&2; false; fi
  sleep 2
done
# Read complete responses; curl | head can cause SIGPIPE under pipefail.
"${COMPOSE[@]}" exec -T -e "EXPECTED_APP_REVISION=${APP_REVISION}" account node server/verify-deployment.mjs
echo "部署与只读业务验收通过：${APP_REVISION}；备份：${BACKUP_DIR}"
