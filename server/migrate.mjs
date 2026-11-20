import { getMigrations } from 'better-auth/db/migration'
import { auth } from './auth.mjs'
import { migrateComments, migrateGeoEvents, migrateInquirySystem } from './database.mjs'
import { migrateCommunity } from './community.mjs'
import { migrateFanxing } from './fanxing.mjs'

const { runMigrations } = await getMigrations(auth.options)
await runMigrations()
migrateComments()
migrateGeoEvents()
migrateInquirySystem()
migrateCommunity()
migrateFanxing()
console.log('Account, comment, inquiry, community and fanxing schema ready')
