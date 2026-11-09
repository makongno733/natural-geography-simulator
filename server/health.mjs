export function setupHealthRoute(app, database) {
  app.get('/api/health', (_req, res) => {
    try {
      database.prepare('SELECT 1').get()
    } catch (error) {
      console.error('Account API database health check failed', error)
      return res.status(503).json({ status: 'unavailable' })
    }

    res.json({ status: 'ok' })
  })
}
