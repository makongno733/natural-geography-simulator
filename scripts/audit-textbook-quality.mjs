import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve('src/textbook/data')
const REPORT_PATH = path.resolve('scripts/textbook-quality-report.md')

async function main() {
  const files = await walk(ROOT)
  const jsonFiles = files.filter((f) => f.endsWith('.json'))

  const report = {
    scannedFiles: 0,
    blocksScanned: 0,
    issues: []
  }

  for (const file of jsonFiles) {
    const raw = await fs.readFile(file, 'utf8')
    let data
    try {
      data = JSON.parse(raw)
    } catch {
      report.issues.push({
        type: 'json_parse_error',
        file,
        message: 'JSON 解析失败'
      })
      continue
    }

    report.scannedFiles += 1
    auditNode(data, file, report)
  }

  const md = formatReport(report)
  await fs.writeFile(REPORT_PATH, md, 'utf8')

  const severeCount = report.issues.filter((i) => i.level === 'high').length
  const normalCount = report.issues.length - severeCount

  console.log(`scanned json files: ${report.scannedFiles}`)
  console.log(`scanned body blocks: ${report.blocksScanned}`)
  console.log(`issues: ${report.issues.length} (high: ${severeCount}, normal: ${normalCount})`)
  console.log(`report: ${REPORT_PATH}`)
}

function auditNode(node, file, report, pointer = '$') {
  if (Array.isArray(node)) {
    node.forEach((item, idx) => auditNode(item, file, report, `${pointer}[${idx}]`))
    return
  }

  if (!node || typeof node !== 'object') return

  for (const [key, value] of Object.entries(node)) {
    const nextPointer = `${pointer}.${key}`

    if (key === 'body' && typeof value === 'string') {
      report.blocksScanned += 1
      auditBody(value, file, nextPointer, report)
      continue
    }

    auditNode(value, file, report, nextPointer)
  }
}

function auditBody(body, file, pointer, report) {
  const normalized = String(body).replace(/\\n/g, '\n').replace(/\\r/g, '\n')
  const lines = normalized.split('\n')

  // 1) 空引号 / 伪围绕语句
  lines.forEach((line, idx) => {
    const l = line.trim()
    if (!l) return

    if (/围绕“\s*”/.test(l) || /围绕"\s*"/.test(l)) {
      pushIssue(report, {
        level: 'high',
        type: 'empty_topic_quote',
        file,
        pointer,
        line: idx + 1,
        message: '存在空引号主题（围绕“”）'
      })
    }

    if (/可按“概念界定—成因机制—案例验证—应用迁移”四步展开讲解。.*可按“概念界定—成因机制—案例验证—应用迁移”四步展开讲解。/.test(l)) {
      pushIssue(report, {
        level: 'normal',
        type: 'duplicated_template_sentence',
        file,
        pointer,
        line: idx + 1,
        message: '同一行出现重复模板句'
      })
    }
  })

  // 2) 连续重复标题
  const headingLines = lines
    .map((line, idx) => ({ line: line.trim(), idx: idx + 1 }))
    .filter((x) => /^##\s+/.test(x.line))

  for (let i = 1; i < headingLines.length; i += 1) {
    if (headingLines[i].line === headingLines[i - 1].line) {
      pushIssue(report, {
        level: 'normal',
        type: 'duplicate_heading',
        file,
        pointer,
        line: headingLines[i].idx,
        message: `连续重复标题：${headingLines[i].line}`
      })
    }
  }

  // 3) 异常编号（例如 "1. 1. 1."）
  lines.forEach((line, idx) => {
    const l = line.trim()
    if (/^(\d+\.)\s*(\d+\.)\s*(\d+\.)/.test(l)) {
      pushIssue(report, {
        level: 'normal',
        type: 'abnormal_multilevel_numbering',
        file,
        pointer,
        line: idx + 1,
        message: `疑似异常编号：${l.slice(0, 40)}`
      })
    }
  })

  // 4) 疑似乱码行（英文碎片 + 低中文占比）
  lines.forEach((line, idx) => {
    const l = line.trim()
    if (!l || l.length < 6) return

    const chars = Array.from(l.replace(/\s/g, ''))
    if (!chars.length) return

    const chinese = chars.filter((ch) => /[\u4e00-\u9fff]/.test(ch)).length
    const weird = chars.filter((ch) => /[@#$^*_]{2,}|[A-Z]{3,}/.test(ch)).length
    const chineseRatio = chinese / chars.length

    if (weird > 0 && chineseRatio < 0.35) {
      pushIssue(report, {
        level: 'normal',
        type: 'suspected_garbled_text',
        file,
        pointer,
        line: idx + 1,
        message: `疑似乱码：${l.slice(0, 50)}`
      })
    }
  })
}

function pushIssue(report, issue) {
  report.issues.push(issue)
}

function formatReport(report) {
  const now = new Date().toISOString()
  const groups = groupBy(report.issues, (i) => i.type)

  const lines = []
  lines.push('# 教材文本质量检查报告')
  lines.push('')
  lines.push(`- 生成时间：${now}`)
  lines.push(`- 扫描 JSON 文件：${report.scannedFiles}`)
  lines.push(`- 扫描正文块：${report.blocksScanned}`)
  lines.push(`- 发现问题：${report.issues.length}`)
  lines.push('')

  if (!report.issues.length) {
    lines.push('未发现问题。')
    lines.push('')
    return lines.join('\n')
  }

  lines.push('## 问题汇总')
  lines.push('')
  for (const [type, list] of Object.entries(groups)) {
    lines.push(`- ${type}: ${list.length}`)
  }
  lines.push('')

  lines.push('## 明细（前 300 条）')
  lines.push('')
  lines.push('| 级别 | 类型 | 文件 | 位置 | 行 | 说明 |')
  lines.push('| --- | --- | --- | --- | --- | --- |')

  report.issues.slice(0, 300).forEach((issue) => {
    const shortFile = issue.file.replace(process.cwd() + path.sep, '')
    lines.push(`| ${issue.level} | ${issue.type} | ${escapeMd(shortFile)} | ${escapeMd(issue.pointer || '')} | ${issue.line || ''} | ${escapeMd(issue.message)} |`)
  })

  if (report.issues.length > 300) {
    lines.push('')
    lines.push(`> 仅展示前 300 条，剩余 ${report.issues.length - 300} 条未展开。`)
  }

  lines.push('')
  return lines.join('\n')
}

function groupBy(arr, fn) {
  return arr.reduce((acc, item) => {
    const key = fn(item)
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})
}

function escapeMd(text) {
  return String(text || '').replace(/\|/g, '\\|')
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const out = []

  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...(await walk(full)))
    } else {
      out.push(full)
    }
  }

  return out
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
