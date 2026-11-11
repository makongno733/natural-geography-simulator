const readinessQueries = [
  'SELECT id, name, email FROM "user" LIMIT 1',
  'SELECT id, userId, token, expiresAt FROM "session" LIMIT 1',
  'SELECT id, userId, accountId, providerId FROM "account" LIMIT 1',
  'SELECT id, identifier, value, expiresAt FROM "verification" LIMIT 1',
  'SELECT id, user_id, section_key, body, created_at, deleted_at FROM lesson_comment LIMIT 1',
  'SELECT user_id, role FROM user_role LIMIT 1'
]

export function setupHealthRoute(app, database) {
  app.get('/api/health', (_req, res) => {
    try {
      for (const query of readinessQueries) database.prepare(query).all()
    } catch (error) {
      console.error('Account API database health check failed', error)
      return res.status(503).json({ status: 'unavailable' })
    }

    res.json({ status: 'ok' })
  })
}
