// Compile the same columns/joins used by public reads, even on an empty database.
// SELECT 1 alone cannot detect an incomplete production migration.
const probes = [
  'SELECT id FROM user LIMIT 0',
  'SELECT id FROM session LIMIT 0',
  'SELECT id FROM account LIMIT 0',
  'SELECT id FROM verification LIMIT 0',
  `SELECT p.id, p.author_id, p.status, p.accepted_reply_id, p.tags,
    p.linked_experiment, p.evidence_card, p.compare_url, p.evidence_title,
    p.evidence_conditions, p.evidence_facts, p.linked_project_id, p.paper_doi, p.paper_title,
    c.name, u.name FROM community_post p
    JOIN community_category c ON c.id = p.category_id JOIN user u ON u.id = p.author_id LIMIT 0`,
  'SELECT id, post_id, author_id, status FROM community_reply LIMIT 0',
  'SELECT post_id, user_id FROM community_post_like LIMIT 0',
  'SELECT user_id, title, bio, institution, location FROM user_profile LIMIT 0',
  'SELECT id, title, category, format, scale, description, source_url, license, status, submitted_by FROM community_resource LIMIT 0',
  'SELECT user_id, role FROM user_role LIMIT 0',
  'SELECT id, status, source_post_id, tasks_json, papers_json, collab_qq_group FROM fanxing_project LIMIT 0',
  'SELECT id, project_id, user_id, status, notified_at, notification_status FROM fanxing_application LIMIT 0',
  'SELECT rowid, title, body FROM community_post_fts LIMIT 0'
]

export function assertAccountSchema(db) {
  for (const sql of probes) db.prepare(sql).all()
}

export function readinessHandler(db, revision = process.env.APP_REVISION || 'unknown') {
  return (_req, res) => {
    res.set('Cache-Control', 'no-store')
    try {
      assertAccountSchema(db)
      res.json({ status: 'ok', schema: 'ready', revision })
    } catch (error) {
      console.error('Account readiness failed:', error.message)
      res.status(503).json({ status: 'error', schema: 'not_ready', revision })
    }
  }
}
