/**
 * 中学地理教学系统 - 教材内容与教学活动全量自动化检查脚本
 *
 * 运行方式:
 *   node scripts/audit-textbook-content.mjs
 *   node scripts/audit-textbook-content.mjs --verbose
 *   node scripts/audit-textbook-content.mjs --json
 */

import fs from 'node:fs'
import path from 'node:path'
import { grades } from '../src/textbook/data/index.js'
import { listExperiments, getExperiment, getExperimentPreset } from '../src/experiments/catalog.js'
import { getSectionExperimentLink, experimentLinkConfiguration } from '../src/textbook/data/experimentLinks.js'

const PROJECT_ROOT = process.cwd()

// 1. 机械教案流程与流水线提示词特征模式
const TEMPLATE_PATTERNS = [
  { id: 'four-step-method', pattern: /概念界定[—-]成因机制[—-]案例验证[—-]应用迁移/, label: '包含机械教案流程占位符（概念界定-成因机制-案例验证-应用迁移）' },
  { id: 'five-step-method', pattern: /区域背景[—-]关键变量[—-]变化机制[—-]地理效应[—-]应用启示/, label: '包含提示词级案例模板占位符（区域背景-关键变量...）' },
  { id: 'dup-header-daodu', pattern: /##\s*教学设计导读\s*##\s*教学设计导读/, label: '出现重复标题（## 教学设计导读 ## 教学设计导读）' },
  { id: 'dup-header-goal', pattern: /##\s*学习目标（精读）\s*[\r\n]+-\s*##\s*学习目标（精读）/, label: '出现多重嵌套标题错误（- ## 学习目标（精读））' },
  { id: 'generic-three-q', pattern: /用\s*2\s*句话解释本节最核心的地理机制/, label: '包含通用未定制的即时检测三问模板' },
  { id: 'placeholder-text', pattern: /详细内容待填充/, label: '包含待填充占位符' }
]

// 2. 空泛目标特征模式
const VAGUE_GOAL_PATTERNS = [
  { pattern: /说明“[^”]+”的核心概念与基本特征/, label: '套用通用占位目标“说明...的核心概念与基本特征”' },
  { pattern: /能够结合图表或材料解释主要地理过程/, label: '抽象无具体过程目标的套话“能够结合图表或材料解释主要地理过程”' },
  { pattern: /能够将本节知识迁移到区域案例中进行判断/, label: '抽象无具体案例目标的套话“能够将本节知识迁移到区域案例中进行判断”' },
  { pattern: /^说清本节核心概念及其地理意义$/, label: '空泛目标“说清本节核心概念及其地理意义”' },
  { pattern: /^能用图表或案例解释关键过程与规律$/, label: '空泛目标“能用图表或案例解释关键过程与规律”' },
  { pattern: /^能迁移到区域案例进行综合判断$/, label: '空泛目标“能迁移到区域案例进行综合判断”' }
]

// 3. 明确串节与事实混淆规则
const BLEED_RULES = [
  {
    grade: '初中', book: '七年级上册', chapter: '第一章', section: '第二节',
    expectedTopic: '地球与地球仪',
    detectedIf: (body) => body.includes('航天员登月') || body.includes('地球的宇宙环境'),
    reason: '将第一节“地球的宇宙环境”正文原封不动串写至第二节“地球与地球仪”'
  },
  {
    grade: '初中', book: '七年级上册', chapter: '第二章', section: '第二节',
    expectedTopic: '地形图的判读',
    detectedIf: (body) => body.includes('第一节 地图的阅读'),
    reason: '将第一节“地图的阅读”正文直接复制至第二节“地形图的判读”'
  },
  {
    grade: '初中', book: '七年级上册', chapter: '第三章', section: '第三节',
    expectedTopic: '海陆的变迁',
    detectedIf: (body) => body.includes('降水的变化与分布') || body.includes('各月的降水量是有差别的'),
    reason: '严重串节：将“天气与气候”章节的“降水的变化与分布”错误移入“陆地和海洋”之“海陆的变迁”'
  },
  {
    grade: '初中', book: '七年级下册', chapter: '第七章', section: '第一节',
    expectedTopic: '亚洲的位置和范围',
    detectedIf: (body) => body.includes('第一节 自然环境') && body.includes('北美洲的气候特征'),
    reason: '串节错漏：正文出现“自然环境”与“北美洲气候特征”，非亚洲“位置和范围”'
  },
  {
    grade: '初中', book: '七年级下册', chapter: '第七章', section: '第二节',
    expectedTopic: '亚洲的自然环境',
    detectedIf: (body) => body.includes('第二节 人文环境') && body.includes('北美洲的经济发展差异'),
    reason: '串节错漏：正文出现“人文环境”与“北美洲经济发展差异”，非亚洲“自然环境”'
  },
  {
    grade: '初中', book: '七年级下册', chapter: '第八章', section: '第二节',
    expectedTopic: '东南亚',
    detectedIf: (body) => body.includes('第一节 日本 2. 将代表下列内容的选项填入框图'),
    reason: '正文串节复制：将第一节“日本”的工业集中分布练习完整复制进第二节“东南亚”'
  },
  {
    grade: '初中', book: '七年级下册', chapter: '第九章', section: '第一节',
    expectedTopic: '中东 / 西亚',
    detectedIf: (body) => body.includes('第一节”补充一组对比案例'),
    reason: '正文完全缺失，沦为提示词模版骨架（“区域背景—关键变量...”）'
  },
  {
    grade: '初中', book: '七年级下册', chapter: '第九章', section: '第三节',
    expectedTopic: '撒哈拉以南非洲',
    detectedIf: (body) => body.includes('独占一个大陆的国家 澳大利亚是大洋洲面积最大的国家'),
    reason: '明显事实与地域混淆：标题写“撒哈拉以南非洲”，正文直接接“澳大利亚是大洋洲面积最大的国家，是世界唯一独占一个大陆的国家”'
  },
  {
    grade: '初中', book: '八年级上册', chapter: '第一章', section: '第二节',
    expectedTopic: '人口',
    detectedIf: (body) => body.includes('第一节 疆域 ① “疆”是“江”的同音字'),
    reason: '正文串节复制：将第一节“疆域”完整复制进第二节“人口”'
  },
  {
    grade: '初中', book: '八年级上册', chapter: '第二章', section: '第二节',
    expectedTopic: '气候',
    detectedIf: (body) => body.includes('第一节 地形 了解我国主要地形区与山脉的位置关系'),
    reason: '正文串节复制：将第一节“地形”完整复制进第二节“气候”'
  },
  {
    grade: '初中', book: '八年级上册', chapter: '第二章', section: '第三节',
    expectedTopic: '河流与湖泊',
    detectedIf: (body) => body.includes('说明“第二章第三节”的核心概念与基本特征'),
    reason: '正文完全缺失长江黄河内容，仅有占位骨架'
  },
  {
    grade: '初中', book: '八年级上册', chapter: '第三章', section: '第一节',
    expectedTopic: '自然资源的基本特征',
    detectedIf: (body) => body.includes('第一节 土地资源 总量丰富，时空分布不均 我国水资源总量位居世界第六位'),
    reason: '概念与数据严重串杂：节名是自然资源，正文混杂土地资源、水资源总量居世界第六位'
  },
  {
    grade: '初中', book: '八年级上册', chapter: '第三章', section: '第二节',
    expectedTopic: '土地资源',
    detectedIf: (body) => body.includes('第一节 土地资源 总量丰富，时空分布不均 我国水资源总量位居世界第六位'),
    reason: '正文串节复制：将带有水资源混淆的第一节再次复制至第二节'
  },
  {
    grade: '初中', book: '八年级上册', chapter: '第三章', section: '第三节',
    expectedTopic: '水资源',
    detectedIf: (body) => body.includes('第三节 矿产资源 认识我国石油进口来源地'),
    reason: '严重串节：教材目录本节为“水资源”，正文却为“第三节 矿产资源 认识我国石油进口来源地”'
  },
  {
    grade: '初中', book: '八年级下册', chapter: '第六章', section: '第一节',
    expectedTopic: '四大地理区域的划分',
    detectedIf: (body) => body.includes('第一节”补充一组对比案例'),
    reason: '正文完全缺失，沦为提示词骨架占位'
  },
  {
    grade: '初中', book: '八年级下册', chapter: '第六章', section: '第二节',
    expectedTopic: '北方地区和南方地区',
    detectedIf: (body) => body.includes('第一节 “自然特征与农业 15'),
    reason: '正文串入后文第七章章节名与页码废料'
  },
  {
    grade: '初中', book: '八年级下册', chapter: '第七章', section: '第一节',
    expectedTopic: '南方地区——自然特征与农业',
    detectedIf: (body) => body.includes('白山黑水 东北三省') && body.includes('东北三省区域界线'),
    reason: '严重事实与地域错乱：在“第七章 南方地区”第一节正文中，大段混入“北方地区”的“白山黑水 东北三省”'
  }
]

// 4. 实验匹配合理性评价函数
function evaluateExperimentMatch(grade, book, chapterId, chapterTitle, sectionId, sectionTitle, link) {
  if (!link || !link.primary) {
    return {
      status: 'missing',
      verdict: '无关联实验',
      reason: '未配置关联实验'
    }
  }

  const { experimentId, presetId, title } = link.primary

  if (book === '八年级下册' && chapterId === '第六章' && experimentId === 'map-projection') {
    return {
      status: 'mismatch',
      verdict: '错误关联（牵强挂载）',
      reason: `“${chapterTitle}”属于中国区域地理分界，却关联至世界地图投影实验（map-projection: ${presetId}），概念脱节。`
    }
  }

  if (book === '八年级上册' && chapterId === '第一章' && experimentId === 'spatial-network' && sectionId === '第一节') {
    return {
      status: 'weak',
      verdict: '较弱关联（跨节挂载）',
      reason: `八上第一章小节为“疆域”，整章默认挂载空间网络“人口分布”（population-distribution），与领土行政区划脱节。`
    }
  }

  if (book === '八年级上册' && chapterId === '第一章' && experimentId === 'spatial-network' && sectionId === '第三节') {
    return {
      status: 'weak',
      verdict: '较弱关联（跨节挂载）',
      reason: `小节为“民族”，挂载“人口分布”关联度偏低。`
    }
  }

  if (book === '必修第一册' && chapterId === '第五章' && sectionId === '第一节' && experimentId === 'soil-profile-3d') {
    return {
      status: 'weak',
      verdict: '部分脱节（代用关联）',
      reason: `本节为“植被”，挂载土壤剖面 3D 属于整章默认代理，缺乏植物群落展示。`
    }
  }

  if (book === '必修第一册' && chapterId === '第五章' && sectionId === '问题研究' && experimentId === 'soil-profile-3d') {
    return {
      status: 'suboptimal',
      verdict: '次优关联（有更好现有实验）',
      reason: `课题为海绵城市，现有实验库中有“下渗与径流对比实验”（infiltration），比“土壤剖面”更贴合。`
    }
  }

  if (['必修第二册', '选择性必修2', '选择性必修3'].includes(book)) {
    if (['spatial-network', 'human-environment'].includes(experimentId)) {
      return {
        status: 'conceptual-only',
        verdict: '概念网络代理（非探究性交互实验）',
        reason: `关联的是抽象概念节点拓扑图（${experimentId}），非物理机制模拟或定量探究实验。`
      }
    }
  }

  if (['thermal-circulation', 'stream-table', 'water-cycle-3d', 'fault-model', 'seasons', 'solar-motion',
       'geologic-time', 'disaster-sandbox', 'earth-system', 'atmosphere-system'].includes(experimentId)) {
    return {
      status: 'match',
      verdict: '匹配良好',
      reason: `实验主题（${title}）与本节核心机理高度契合。`
    }
  }

  return {
    status: 'acceptable',
    verdict: '基本匹配',
    reason: `实验（${title}）提供宏观系统支撑。`
  }
}

// 核心审校主函数
export function auditAllSections() {
  const allResults = []
  const summary = {
    totalSectionsInCatalog: 0,
    totalAudited: 0,
    byGrade: { 初中: 0, 高中: 0 },
    issuesCount: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      clean: 0
    },
    defectCategories: {
      templateRepeat: 0,
      crossSectionBleed: 0,
      vagueObjectives: 0,
      factRisks: 0,
      experimentMismatch: 0,
      missingStudentLearning: 0
    }
  }

  for (const grade of grades) {
    if (grade.id === '大学') continue

    for (const book of grade.books) {
      const contentJsonPath = path.join(PROJECT_ROOT, 'src/textbook/data', grade.id, book.id, 'content.json')
      let contentData = {}
      if (fs.existsSync(contentJsonPath)) {
        contentData = JSON.parse(fs.readFileSync(contentJsonPath, 'utf8'))
      }

      const slJsonPath = path.join(PROJECT_ROOT, 'src/textbook/data', grade.id, book.id, 'student-learning.json')
      let slData = null
      if (fs.existsSync(slJsonPath)) {
        slData = JSON.parse(fs.readFileSync(slJsonPath, 'utf8'))
      }

      for (const chapter of book.chapters) {
        for (const section of (chapter.sections || [])) {
          summary.totalSectionsInCatalog++
          summary.totalAudited++
          summary.byGrade[grade.id]++

          const secContent = contentData[chapter.id]?.sections?.[section.id]
          const body = secContent?.body || ''
          const keyPoints = secContent?.keyPoints || []
          const concepts = secContent?.conceptDefinitions || {}
          const slSection = slData?.[chapter.id]?.[section.id] || null

          const link = getSectionExperimentLink({
            grade: grade.id,
            book: book.id,
            chapter: chapter.id,
            section: section.id
          })

          const expMatch = evaluateExperimentMatch(
            grade.id, book.id, chapter.id, chapter.title, section.id, section.title, link
          )

          const defects = []
          const evidenceLocations = []

          // 1. 重复模板检查
          const matchedTemplates = []
          for (const tp of TEMPLATE_PATTERNS) {
            if (tp.pattern.test(body)) {
              matchedTemplates.push(tp.label)
              evidenceLocations.push(`content.json [${chapter.id}][sections][${section.id}].body 命中模式: ${tp.id}`)
            }
          }
          if (matchedTemplates.length > 0) {
            summary.defectCategories.templateRepeat++
            defects.push({
              type: 'template_repeat',
              desc: matchedTemplates.join('； ')
            })
          }

          // 2. 串节现象检查
          let bleedFound = null
          for (const br of BLEED_RULES) {
            if (br.grade === grade.id && br.book === book.id && br.chapter === chapter.id && br.section === section.id) {
              if (br.detectedIf(body)) {
                bleedFound = br
                break
              }
            }
          }
          if (bleedFound) {
            summary.defectCategories.crossSectionBleed++
            evidenceLocations.push(`content.json [${chapter.id}][sections][${section.id}].body: ${bleedFound.reason}`)
            defects.push({
              type: 'cross_section_bleed',
              desc: bleedFound.reason
            })
          }

          // 3. 空泛目标检查
          const matchedVague = []
          for (const vg of VAGUE_GOAL_PATTERNS) {
            if (vg.pattern.test(body)) {
              matchedVague.push(vg.label)
            }
          }
          if (slSection?.objectives) {
            for (const obj of slSection.objectives) {
              for (const vg of VAGUE_GOAL_PATTERNS) {
                if (vg.pattern.test(obj)) matchedVague.push(`SL目标套话: ${obj}`)
              }
            }
          }
          if (matchedVague.length > 0) {
            summary.defectCategories.vagueObjectives++
            evidenceLocations.push(`content.json [${chapter.id}][sections][${section.id}].body 学习目标段落`)
            defects.push({
              type: 'vague_objectives',
              desc: matchedVague.join('； ')
            })
          }

          // 4. 明显事实风险检查
          const factRisks = []
          if (grade.id === '初中') {
            if (bleedFound && (bleedFound.reason.includes('严重') || bleedFound.reason.includes('混淆') || bleedFound.reason.includes('错乱'))) {
              factRisks.push(bleedFound.reason)
              summary.defectCategories.factRisks++
            }
          }
          if (factRisks.length > 0) {
            defects.push({
              type: 'fact_risks',
              desc: factRisks.join('； ')
            })
          }

          // 5. 实验关联检查
          if (expMatch.status === 'mismatch' || expMatch.status === 'weak' || expMatch.status === 'suboptimal') {
            summary.defectCategories.experimentMismatch++
            defects.push({
              type: 'experiment_issue',
              desc: `${expMatch.verdict}: ${expMatch.reason}`
            })
          }

          // 6. 学生端学习视图检查
          const hasSL = Boolean(slSection)
          if (!hasSL) {
            summary.defectCategories.missingStudentLearning++
          }

          // 严重度定级
          let severity = 'None'
          if (bleedFound || factRisks.length > 0) {
            severity = 'Critical'
            summary.issuesCount.critical++
          } else if (matchedTemplates.length > 0 || matchedVague.length > 0) {
            severity = 'High'
            summary.issuesCount.high++
          } else if (expMatch.status === 'mismatch' || expMatch.status === 'weak') {
            severity = 'Medium'
            summary.issuesCount.medium++
          } else if (!hasSL || expMatch.status === 'suboptimal' || expMatch.status === 'conceptual-only') {
            severity = 'Low'
            summary.issuesCount.low++
          } else {
            summary.issuesCount.clean++
          }

          allResults.push({
            grade: grade.id,
            book: book.id,
            chapterId: chapter.id,
            chapterTitle: chapter.title,
            sectionId: section.id,
            sectionTitle: section.title,
            contentFile: `src/textbook/data/${grade.id}/${book.id}/content.json`,
            hasStudentLearning: hasSL,
            bodyLength: body.length,
            keyPointsCount: keyPoints.length,
            conceptGroupCount: Object.keys(concepts).length,
            hasTemplateRepeat: matchedTemplates.length > 0,
            hasBleed: Boolean(bleedFound),
            hasVagueGoal: matchedVague.length > 0,
            hasFactRisk: factRisks.length > 0,
            experimentLink: link ? `${link.primary.experimentId}:${link.primary.presetId}` : 'None',
            experimentTitle: link ? link.primary.title : '无',
            experimentMatchStatus: expMatch.status,
            experimentMatchVerdict: expMatch.verdict,
            experimentMatchReason: expMatch.reason,
            severity,
            defects,
            evidence: evidenceLocations.join(' | ') || '各字段结构完整规范'
          })
        }
      }
    }
  }

  return { summary, allResults }
}

// 命令行直接执行入口
if (process.argv[1] && process.argv[1].endsWith('audit-textbook-content.mjs')) {
  const isJson = process.argv.includes('--json')
  const isVerbose = process.argv.includes('--verbose')

  const { summary, allResults } = auditAllSections()

  if (isJson) {
    console.log(JSON.stringify({ summary, allResults }, null, 2))
    process.exit(0)
  }

  console.log('=====================================================================')
  console.log('       中学地理教学系统 - 教材内容与教学活动系统审校检查器           ')
  console.log('=====================================================================')
  console.log(`执行时间: ${new Date().toLocaleString()}`)
  console.log(`检查小节总数: ${summary.totalAudited} / ${summary.totalSectionsInCatalog} 节 (覆盖率 100%)`)
  console.log(`  - 初中学段: ${summary.byGrade.初中} 节`)
  console.log(`  - 高中学段: ${summary.byGrade.高中} 节\n`)

  console.log('【缺陷严重程度分布】')
  console.log(`  🚨 Critical (严重事实风险 / 严重串节):    ${summary.issuesCount.critical} 节`)
  console.log(`  ⚠️ High     (机械模板重复 / 目标空泛):    ${summary.issuesCount.high} 节`)
  console.log(`  🟡 Medium   (实验脱节 / 弱关联挂载):       ${summary.issuesCount.medium} 节`)
  console.log(`  🟢 Low      (缺少交互学习视图 / 仅网络图): ${summary.issuesCount.low} 节`)
  console.log(`  ✅ Clean    (完全达标规范节):              ${summary.issuesCount.clean} 节\n`)

  console.log('【核心缺陷大类统计】')
  console.log(`  • 机械模板残留 (含教案四步法/五步法/重复标题/未定制三问): ${summary.defectCategories.templateRepeat} 处`)
  console.log(`  • 章节跨节串写 (正文错放至其他小节或克隆上一节):        ${summary.defectCategories.crossSectionBleed} 节`)
  console.log(`  • 空泛占位目标 (未具体化、无明确评价动词的目标):          ${summary.defectCategories.vagueObjectives} 节`)
  console.log(`  • 明显事实风险 (地域错乱/数据前后矛盾):                 ${summary.defectCategories.factRisks} 处`)
  console.log(`  • 实验挂载不合理 (牵强附会或次优错失现有实验):           ${summary.defectCategories.experimentMismatch} 处`)
  console.log(`  • 缺少 StudentLearning 视图 (学生端无交互式微练习与反馈):  ${summary.defectCategories.missingStudentLearning} 节\n`)

  if (isVerbose) {
    console.log('【逐节诊断明细 (Verbose 模式)】')
    allResults.forEach((r, idx) => {
      console.log(`[${idx + 1}/${allResults.length}] ${r.grade} > ${r.book} > ${r.chapterTitle} > ${r.sectionTitle} [${r.severity}]`)
      if (r.defects.length > 0) {
        r.defects.forEach(d => console.log(`   - [${d.type}] ${d.desc}`))
      } else {
        console.log(`   - 规范无缺陷`)
      }
    })
  } else {
    console.log('提示: 使用 node scripts/audit-textbook-content.mjs --verbose 查看所有 117 节诊断细节。')
    console.log('提示: 使用 node scripts/audit-textbook-content.mjs --json 导出完整结构化 JSON 数据。')
  }
}
