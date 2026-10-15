import { getMigrations } from 'better-auth/db/migration'
import { auth } from './auth.mjs'
import { migrateComments, migrateGeoEvents } from './database.mjs'

const { runMigrations } = await getMigrations(auth.options)
await runMigrations()
migrateComments()
migrateGeoEvents()
console.log('Account and comment schema ready')
