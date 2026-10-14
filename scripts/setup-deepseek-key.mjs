import { randomBytes, timingSafeEqual } from 'node:crypto'
import { createServer } from 'node:http'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const host = '127.0.0.1'
const port = Number(process.env.DEEPSEEK_SETUP_PORT || 4188)
const origin = `http://${host}:${port}`
const keyPath = resolve('.env.ai')
const token = randomBytes(24).toString('hex')

function page(message = '') {
  return `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>配置课程助手</title><style>body{font:16px/1.6 system-ui,sans-serif;max-width:540px;margin:10vh auto;padding:24px;color:#17324a}main{padding:28px;border:1px solid #cbdbe8;border-radius:18px;box-shadow:0 12px 40px #17324a18}h1{margin-top:0}label{display:block;margin:18px 0 8px;font-weight:700}input{box-sizing:border-box;width:100%;padding:12px;border:1px solid #9bb7cc;border-radius:9px;font:inherit}button{margin-top:18px;padding:11px 22px;border:0;border-radius:9px;background:#135b9c;color:white;font:inherit;cursor:pointer}.note{color:#526a7c;font-size:14px}.error{color:#a33}</style><main><h1>配置 DeepSeek API Key</h1><p>此页面只在你的电脑 <code>127.0.0.1</code> 上运行。密钥将写入项目内被 Git 忽略的私有文件，不会显示在页面或发给 Codex 聊天。</p>${message ? `<p class="error">${message}</p>` : ''}<form method="post" action="/save" autocomplete="off"><input type="hidden" name="token" value="${token}"><label for="key">DeepSeek API Key</label><input id="key" name="key" type="password" required autocomplete="off" spellcheck="false"><button type="submit">保存到本机</button></form><p class="note">保存后此临时配置页会自动关闭。请勿把密钥输入公开站点或聊天窗口。</p></main></html>`
}

function send(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"
  })
  res.end(body)
}

const server = createServer(async (req, res) => {
  if (req.headers.host !== `${host}:${port}`) {
    send(res, 403, page('请求未被接受。'))
    return
  }
  if (req.method === 'GET' && req.url === '/') {
    send(res, 200, page())
    return
  }
  if (req.method !== 'POST' || req.url !== '/save' || (req.headers.origin && req.headers.origin !== origin && req.headers.origin !== 'null') ||
      !req.headers['content-type']?.startsWith('application/x-www-form-urlencoded')) {
    console.error('Rejected setup request metadata:', JSON.stringify({ method: req.method, path: req.url, origin: req.headers.origin || null, contentType: req.headers['content-type'] || null }))
    send(res, 403, page('请求未被接受。'))
    return
  }
  try {
    let body = ''
    for await (const chunk of req) {
      body += chunk
      if (body.length > 4096) throw new Error('too_large')
    }
    const form = new URLSearchParams(body)
    const submitted = form.get('token') || ''
    const key = form.get('key') || ''
    const tokenMatches = submitted.length === token.length &&
      timingSafeEqual(Buffer.from(submitted), Buffer.from(token))
    if (!tokenMatches || key.length < 16 || key.length > 512 || /\s/.test(key)) {
      send(res, 400, page('密钥格式不正确，请重新填写。'))
      return
    }
    await writeFile(keyPath, `DEEPSEEK_API_KEY=${key}\n`, { flag: 'wx', mode: 0o600 })
    send(res, 200, '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>已保存</title><p>密钥已保存到本机私有配置。可以回到 Codex，告诉我“已保存”。</p></html>')
    server.close()
  } catch (error) {
    if (error.code === 'EEXIST') {
      send(res, 409, page('本机已有密钥配置；为避免覆盖，未保存新密钥。'))
    } else {
      send(res, 400, page('保存失败，请检查输入。'))
    }
  }
})

try {
  await readFile(keyPath)
  throw new Error('本机已存在 .env.ai；不会覆盖它。')
} catch (error) {
  if (error.code !== 'ENOENT') throw error
}

server.listen(port, host, () => console.log(`DeepSeek 本地配置页已就绪：${origin}/`))
