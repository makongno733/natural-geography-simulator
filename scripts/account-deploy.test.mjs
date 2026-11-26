// @vitest-environment node
import { afterEach, expect, it } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, rmSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'

const dirs = []
afterEach(() => { for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true }) })
function deploy(failStage = '') {
  const dir = mkdtempSync(join(tmpdir(), 'deployment-test-')); dirs.push(dir)
  for (const path of ['bin', 'deploy/account', 'backups']) mkdirSync(join(dir, path), { recursive: true })
  copyFileSync('deploy/account/update-account-service.sh', join(dir, 'deploy/account/update-account-service.sh'))
  writeFileSync(join(dir, '.env'), '')
  const executable = (name, body) => writeFileSync(join(dir, 'bin', name), '#!/bin/bash\n' + body, { mode: 0o755 })
  executable('git', 'exit 1\n')
  executable('docker', `
echo "$*" >> "$TEST_LOG"
case "$*" in
  *"ps -q account") echo old-container ;;
  "inspect old-container "*) echo sha256:old ;;
  cp*) touch "\${@: -1}" ;;
  *"node server/migrate.mjs") test "$FAIL_STAGE" != migration ;;
  *"node server/verify-deployment.mjs") test "$FAIL_STAGE" != verification ;;
esac
`)
  executable('curl', `
echo readiness >> "$TEST_LOG"
while [ "$#" -gt 0 ]; do
  if [ "$1" = --output ]; then shift; printf '{"schema":"ready"}' > "$1"; fi
  shift
done
`)
  const log = join(dir, 'calls')
  const result = spawnSync('bash', ['deploy/account/update-account-service.sh'], {
    cwd: dir, encoding: 'utf8', env: { ...process.env, PATH: `${dir}/bin:${process.env.PATH}`,
      APP_REVISION: 'test-revision', ACCOUNT_PREBUILT_IMAGE: 'new-image', ACCOUNT_BACKUP_DIR: join(dir, 'backups'),
      FAIL_STAGE: failStage, TEST_LOG: log }
  })
  return { ...result, calls: readFileSync(log, 'utf8'), backups: readdirSync(join(dir, 'backups')) }
}
it('backs up and migrates before switching, then verifies real business reads and revision', () => {
  const result = deploy()
  expect(result.status, result.stderr).toBe(0)
  expect(result.backups.some(name => name.endsWith('.sqlite'))).toBe(true)
  expect(result.calls.indexOf('node server/migrate.mjs')).toBeLessThan(result.calls.indexOf('up -d --no-build'))
  expect(result.calls.indexOf('readiness')).toBeLessThan(result.calls.indexOf('node server/verify-deployment.mjs'))
  expect(result.calls).toContain('EXPECTED_APP_REVISION=test-revision')
  expect(result.backups).not.toContain('.deploy-lock')
})
it('keeps the old service when migration fails and restores the old image tag', () => {
  const result = deploy('migration')
  expect(result.status).not.toBe(0)
  expect(result.calls).not.toContain('up -d --no-build')
  expect(result.calls).toContain('tag sha256:old geo-account:0.1.0')
})
it('rolls back the service when business verification fails without restoring stale database data', () => {
  const result = deploy('verification')
  expect(result.status).not.toBe(0)
  expect(result.calls.match(/up -d --no-build/g)).toHaveLength(2)
  expect(result.calls).toContain('tag sha256:old geo-account:0.1.0')
  expect(result.stderr).toContain('不会自动还原数据库')
  expect(result.backups).not.toContain('.deploy-lock')
})
