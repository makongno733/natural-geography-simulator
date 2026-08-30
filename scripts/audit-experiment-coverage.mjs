import { grades } from '../src/textbook/data/index.js'
import { auditExperimentCoverage } from '../src/textbook/data/experimentLinks.js'

const audit = auditExperimentCoverage(grades)
const percentage = `${(audit.coverage * 100).toFixed(1)}%`

console.table([{
  '教材小节总数': audit.total,
  '已精选关联': audit.curated,
  '覆盖率': percentage,
  '未覆盖数': audit.uncovered.length,
  '无效实验': audit.invalidExperiments.length,
  '无效预设': audit.invalidPresets.length,
  '重复键': audit.duplicateKeys.length,
  '孤立键': audit.orphanKeys.length,
}])

if (audit.uncovered.length) {
  console.log('未覆盖教材键:')
  for (const key of audit.uncovered) console.log(`- ${key}`)
}

for (const [label, entries] of Object.entries({
  '无效实验引用': audit.invalidExperiments,
  '无效预设引用': audit.invalidPresets,
  '重复教材键': audit.duplicateKeys,
  '孤立教材键': audit.orphanKeys,
})) {
  if (!entries.length) continue
  console.log(`${label}:`)
  for (const entry of entries) console.log(`- ${typeof entry === 'string' ? entry : JSON.stringify(entry)}`)
}

if (audit.coverage < 0.9 || audit.invalidExperiments.length || audit.invalidPresets.length || audit.duplicateKeys.length || audit.orphanKeys.length) {
  process.exitCode = 1
}
