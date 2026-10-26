import { getMigrations } from 'better-auth/db/migration'
import { auth } from './auth.mjs'
import { migrateComments, migrateGeoEvents, migrateInquirySystem } from './database.mjs'
import { migrateCommunity } from './community.mjs'

const { runMigrations } = await getMigrations(auth.options)
await runMigrations()
migrateComments()
migrateGeoEvents()
migrateInquirySystem()
migrateCommunity()
console.log('Account, comment, inquiry and community schema ready')
