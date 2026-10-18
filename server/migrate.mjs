import { getMigrations } from 'better-auth/db/migration'
import { auth } from './auth.mjs'
import { migrateComments, migrateGeoEvents, migrateInquirySystem } from './database.mjs'

const { runMigrations } = await getMigrations(auth.options)
await runMigrations()
migrateComments()
migrateGeoEvents()
migrateInquirySystem()
console.log('Account, comment and inquiry schema ready')
