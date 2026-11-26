// @vitest-environment node
import { afterEach, expect, it } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import Database from 'better-sqlite3'
import { verifyDeployment } from '../server/verify-deployment.mjs'

const dirs = []
const children = []
afterEach(async () => {
  for (const child of children.splice(0)) {
    if (child.exitCode === null) {
      const stopped = new Promise(resolve => child.once('exit', resolve))
      child.kill('SIGTERM')
      await stopped
    }
  }
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true })
})
function environment() {
  const dir = mkdtempSync(join(tmpdir(), 'account-startup-'))
  dirs.push(dir)
  return { ...process.env, ACCOUNT_DB_PATH: join(dir, 'test.sqlite'), ACCOUNT_PORT: '0',
    AUTH_ORIGIN: 'http://127.0.0.1:4100', SITE_ORIGIN: 'http://127.0.0.1:4173',
    BETTER_AUTH_SECRET: 'isolated-startup-test-secret-0123456789', APP_REVISION: 'test-revision',
    SMTP_HOST: '', SMTP_USER: '', SMTP_PASS: '', MAIL_FROM: '' }
}
async function start(env) {
  const child = spawn(process.execPath, ['server/index.mjs'], { env, cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'] })
  children.push(child)
  let output = ''
  const origin = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Error(`Startup timeout: ${output}`)), 15000)
    child.once('error', error => { clearTimeout(timer); reject(error) })
    child.once('exit', code => { clearTimeout(timer); reject(Error(`Startup exited ${code}: ${output}`)) })
    child.stderr.on('data', chunk => { output += chunk })
    child.stdout.on('data', chunk => {
      output += chunk
      const port = output.match(/Account API listening on .*:(\d+)/)?.[1]
      if (port) { clearTimeout(timer); resolve(`http://127.0.0.1:${port}`) }
    })
  })
  return { child, origin }
}

it('direct index startup upgrades an existing database, preserves data, and detects later schema damage', async () => {
  const env = environment()
  const initial = spawnSync(process.execPath, ['server/migrate.mjs'], { env, encoding: 'utf8' })
  expect(initial.status, initial.stderr).toBe(0)
  const db = new Database(env.ACCOUNT_DB_PATH)
  db.prepare('INSERT INTO user (id,name,email,emailVerified,createdAt,updatedAt) VALUES (?,?,?,1,?,?)')
    .run('old-user', 'Existing author', 'author@example.test', Date.now(), Date.now())
  db.prepare(`INSERT INTO community_post (author_id,category_id,kind,title,body,created_at,updated_at)
    VALUES ('old-user',1,'discussion','Existing post',?,?,?)`).run('Old content'.repeat(8000), '2026-01-01', '2026-01-01')
  db.exec('ALTER TABLE community_post DROP COLUMN paper_doi; ALTER TABLE community_resource DROP COLUMN status;')
  db.close()

  // No manual migrate command here: exactly the previously broken production CMD.
  const { origin } = await start(env)
  const profile = await fetch(`${origin}/api/community/users/old-user`).then(r => r.json())
  expect(profile.user.name).toBe('Existing author')
  const result = await verifyDeployment({ origin, expectedRevision: 'test-revision' })
  expect(result.checked).toContain('/api/community/posts/1')
  expect(result.checked).toContain('/api/community/users/old-user')
  const check = new Database(env.ACCOUNT_DB_PATH)
  expect(check.prepare('SELECT body FROM community_post WHERE id=1').get().body).toBe('Old content'.repeat(8000))
  expect(check.pragma('integrity_check', { simple: true })).toBe('ok')

  check.exec('ALTER TABLE community_resource DROP COLUMN status')
  check.close()
  expect((await fetch(`${origin}/api/health`)).status).toBe(200)
  const notReady = await fetch(`${origin}/api/ready`)
  expect(notReady.status).toBe(503)
  expect(await notReady.json()).toMatchObject({ schema: 'not_ready' })
  await expect(verifyDeployment({ origin })).rejects.toThrow('HTTP 503')
}, 25000)

it('never starts listening on a failed migration and rolls back application schema changes', async () => {
  const env = environment()
  const db = new Database(env.ACCOUNT_DB_PATH)
  db.exec('CREATE TABLE fanxing_project (id TEXT PRIMARY KEY)')
  db.close()
  const result = spawnSync(process.execPath, ['server/index.mjs'], { env, encoding: 'utf8', timeout: 15000 })
  expect(result.status).not.toBe(0)
  expect(result.stdout).not.toContain('Account API listening')
  const check = new Database(env.ACCOUNT_DB_PATH)
  expect(check.prepare("SELECT name FROM sqlite_master WHERE name='community_post'").get()).toBeUndefined()
  check.close()
})
