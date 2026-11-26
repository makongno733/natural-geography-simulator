import { getMigrations } from 'better-auth/db/migration'
import { auth } from './auth.mjs'
import { database, migrateComments, migrateGeoEvents, migrateInquirySystem } from './database.mjs'
import { migrateCommunity } from './community.mjs'
import { migrateFanxing } from './fanxing.mjs'
import { assertAccountSchema } from './readiness.mjs'

// Both direct `node server/index.mjs` and the deployment migration use this path.
// Fail before listening if any schema upgrade fails. Application DDL is atomic.
export async function initializeAccountDatabase() {
  const { runMigrations } = await getMigrations(auth.options)
  await runMigrations()
  database.transaction(() => {
    migrateComments()
    migrateGeoEvents()
    migrateInquirySystem()
    migrateCommunity()
    migrateFanxing()
    assertAccountSchema(database)
  })()
}
