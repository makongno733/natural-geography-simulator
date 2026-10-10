import { getMigrations } from 'better-auth/db/migration'
import { auth } from './auth.mjs'
import { migrateComments } from './database.mjs'

const { runMigrations } = await getMigrations(auth.options)
await runMigrations()
migrateComments()
console.log('Account and comment schema ready')
