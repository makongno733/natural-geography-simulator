import { database, migrateInquirySystem } from './database.mjs'
import { logAudit } from './inquiry.mjs'

const args = process.argv.slice(2).filter(Boolean)
if (args.length === 0) {
  console.error('Usage: node server/provision-inquiry-admin.mjs <email> OR <existing-user-id> <matching-email>')
  process.exit(2)
}

migrateInquirySystem()
const user = args.length === 1
  ? database.prepare('SELECT id, email FROM user WHERE lower(email) = lower(?)').get(args[0])
  : database.prepare('SELECT id, email FROM user WHERE id = ? AND lower(email) = lower(?)').get(args[0], args[1])
if (!user) throw new Error('No existing account matches the provided user ID / email')
const existing = database.prepare("SELECT user_id FROM user_role WHERE role = 'admin' AND user_id != ? LIMIT 1").get(user.id)
if (existing && args.length > 1) throw new Error('An inquiry administrator already exists; use the existing administrator account')

database.transaction(() => {
  const now = new Date().toISOString()
  database.prepare(`INSERT INTO user_role (user_id, role, display_title, authorized_by, authorized_at, created_at)
    VALUES (?, 'admin', '系统教研管理员', 'LOCAL_OPERATOR', ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET role = 'admin', display_title = '系统教研管理员',
      authorized_by = 'LOCAL_OPERATOR', authorized_at = excluded.authorized_at`).run(user.id, now, now)
  logAudit({ actorId: 'LOCAL_OPERATOR', action: 'ROLE_BOOTSTRAP_ADMIN', targetId: user.id })
})()
console.log(`Inquiry administrator provisioned for existing account ${user.id}`)
