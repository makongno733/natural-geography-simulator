import { database, migrateInquirySystem } from './database.mjs'
import { logAudit } from './inquiry.mjs'

const [userId, email] = process.argv.slice(2)
if (!userId || !email) {
  console.error('Usage: node server/provision-inquiry-admin.mjs <existing-user-id> <matching-email>')
  process.exit(2)
}

migrateInquirySystem()
const user = database.prepare('SELECT id, email FROM user WHERE id = ? AND lower(email) = lower(?)').get(userId, email)
if (!user) throw new Error('No existing account matches both user ID and email')
const existing = database.prepare("SELECT user_id FROM user_role WHERE role = 'admin' LIMIT 1").get()
if (existing) throw new Error('An inquiry administrator already exists; use the existing administrator account')

database.transaction(() => {
  const now = new Date().toISOString()
  database.prepare(`INSERT INTO user_role (user_id, role, display_title, authorized_by, authorized_at, created_at)
    VALUES (?, 'admin', '系统教研管理员', 'LOCAL_OPERATOR', ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET role = 'admin', display_title = '系统教研管理员',
      authorized_by = 'LOCAL_OPERATOR', authorized_at = excluded.authorized_at`).run(user.id, now, now)
  logAudit({ actorId: 'LOCAL_OPERATOR', action: 'ROLE_BOOTSTRAP_ADMIN', targetId: user.id })
})()
console.log(`Inquiry administrator provisioned for existing account ${user.id}`)
