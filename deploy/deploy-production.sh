#!/usr/bin/env bash
# ==============================================================================
# 地理共同体 · 生产账号服务自动化安全备份、加法迁移与平滑更新脚本
# ==============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "=== [1/5] 正在检查环境配置与依赖 ==="
if [ ! -f ".env" ]; then
  echo "✕ 错误: 未检测到 .env 生产配置文件！"
  exit 1
fi

ACCOUNT_DB_PATH="${ACCOUNT_DB_PATH:-./data/account.sqlite}"
BACKUP_DIR="${ROOT_DIR}/backups"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "=== [2/5] 正在执行生产 SQLite 数据库热备份与一致性校验 ==="
if [ -f "$ACCOUNT_DB_PATH" ]; then
  BACKUP_FILE="${BACKUP_DIR}/account_backup_${TIMESTAMP}.sqlite"
  echo "正在安全备份数据库至: ${BACKUP_FILE}"
  sqlite3 "$ACCOUNT_DB_PATH" ".backup '${BACKUP_FILE}'"
  
  INTEGRITY=$(sqlite3 "$BACKUP_FILE" "PRAGMA integrity_check;")
  if [ "$INTEGRITY" != "ok" ]; then
    echo "✕ 错误: 备份副本 integrity_check 未通过 (${INTEGRITY})，终止发布！"
    exit 1
  fi
  echo "✓ 备份副本完整性校验通过 (PRAGMA integrity_check: ok)"
else
  echo "! 警告: 尚未检测到现有数据库文件 (${ACCOUNT_DB_PATH})，将进行全新初始化"
fi

echo "=== [3/5] 正在执行无损加法数据库迁移 ==="
node --env-file=.env server/migrate.mjs
node scripts/verify-deploy-ready.mjs
echo "✓ 数据库结构加法扩展与字段验证通过"

echo "=== [4/5] 正在构建生产 Docker 容器镜像 ==="
docker compose -f deploy/account/compose.yaml build

echo "=== [5/5] 正在平滑启动生产账号容器服务 ==="
docker compose -f deploy/account/compose.yaml up -d

echo ""
echo "=============================================================================="
echo "✦ 生产账号服务已平滑启动就绪！"
echo "  服务端口: 127.0.0.1:4100"
echo "  最近备份文件: ${BACKUP_FILE:-无}"
echo "  如需回退至本次备份，执行: cp '${BACKUP_FILE:-}' '${ACCOUNT_DB_PATH}'"
echo "=============================================================================="
