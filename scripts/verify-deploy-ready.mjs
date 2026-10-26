import Database from 'better-sqlite3'
import { resolve } from 'node:path'

const dbPath = resolve(process.env.ACCOUNT_DB_PATH || './data/account.sqlite')
console.log(`[Deploy Verification] 正在核验数据库: ${dbPath}`)

const db = new Database(dbPath)
const integrity = db.prepare('PRAGMA integrity_check').all()
console.log(`[PRAGMA integrity_check] 结果: ${integrity[0]?.integrity_check}`)
if (integrity[0]?.integrity_check !== 'ok') {
  console.error('数据库完整性校验未通过!')
  process.exit(1)
}

const expectedTables = [
  'user',
  'session',
  'community_category',
  'community_post',
  'community_reply',
  'community_report',
  'community_post_like',
  'community_post_bookmark',
  'user_profile',
  'community_group',
  'community_resource',
  'lesson_comment'
]

const existingTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name)
for (const table of expectedTables) {
  if (existingTables.includes(table)) {
    const count = db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get().c
    console.log(`  ✓ 表 ${table.padEnd(26)}: ${count} 条记录`)
  } else {
    console.warn(`  ! 警告: 尚未找到表 ${table}`)
  }
}

// 检查 community_post 关键字段
const columns = db.prepare("PRAGMA table_info(community_post)").all().map(c => c.name)
console.log(`[community_post 字段检查] 包含字段: ${columns.join(', ')}`)
const requiredColumns = ['accepted_reply_id', 'tags', 'linked_experiment', 'evidence_card']
for (const col of requiredColumns) {
  if (!columns.includes(col)) {
    console.error(`  ✕ 缺失关键字段: ${col}`)
    process.exit(1)
  }
}
console.log('  ✓ 所有加法升级字段已安全就绪！')
console.log('=== [P1 部署与数据迁移核验完成: 100% 准备就绪] ===')
