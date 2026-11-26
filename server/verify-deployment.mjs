import { pathToFileURL } from 'node:url'

// Read-only acceptance; never create test accounts, posts or applications.
export async function verifyDeployment({ origin = 'http://127.0.0.1:4100', fetchImpl = fetch,
  expectedRevision = process.env.EXPECTED_APP_REVISION } = {}) {
  const checked = []
  async function read(path) {
    const response = await fetchImpl(`${origin}${path}`, { signal: AbortSignal.timeout(8000) })
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`)
    const body = await response.json()
    checked.push(path)
    return body
  }
  const ready = await read('/api/ready')
  if (ready.status !== 'ok' || ready.schema !== 'ready') throw new Error('Schema is not ready')
  if (expectedRevision && ready.revision !== expectedRevision) throw new Error('Running revision does not match deployment')
  const config = await read('/api/config')
  if (config.authProvider !== 'Better Auth') throw new Error('Unexpected account configuration')
  const posts = await read('/api/community/posts')
  const resources = await read('/api/community/resources')
  const projects = await read('/api/fanxing/projects')
  if (!Array.isArray(posts.posts) || !Array.isArray(resources.resources) || !Array.isArray(projects.projects)) {
    throw new Error('Public API payload is invalid')
  }
  if (posts.posts.length) {
    const id = posts.posts[0].id
    const detail = await read(`/api/community/posts/${encodeURIComponent(id)}`)
    if (detail.post?.id !== id) throw new Error('Post detail does not match list')
    const authorId = posts.posts[0].authorId
    if (!authorId) throw new Error('Post author missing')
    const profile = await read(`/api/community/users/${encodeURIComponent(authorId)}`)
    if (profile.user?.id !== authorId) throw new Error('Author profile is invalid')
  }
  if (projects.projects.length) {
    const id = projects.projects[0].id
    const detail = await read(`/api/fanxing/projects/${encodeURIComponent(id)}`)
    if (detail.project?.id !== id) throw new Error('Project detail is invalid')
  }
  return { revision: ready.revision, checked }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    console.log(JSON.stringify(await verifyDeployment()))
  } catch (error) {
    console.error('Deployment verification failed:', error.message)
    process.exitCode = 1
  }
}
