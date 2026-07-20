import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, test } from 'vitest'

const learning = JSON.parse(
  readFileSync(
    resolve(process.cwd(), 'src/textbook/data/高中/必修第一册/student-learning.json'),
    'utf8',
  ),
)

function collectStrings(value, strings = []) {
  if (typeof value === 'string') {
    strings.push(value)
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, strings))
  } else if (value !== null && typeof value === 'object') {
    Object.values(value).forEach((item) => collectStrings(item, strings))
  }
  return strings
}

describe('compulsory geography student learning content', () => {
  test('uses only supported practice question types', () => {
    const questionTypes = Object.values(learning)
      .flatMap((chapter) => Object.values(chapter))
      .flatMap((lesson) => lesson.practice ?? [])
      .map((question) => question.type)

    expect(new Set(questionTypes)).toEqual(new Set(['single-choice', 'short-answer']))
  })

  test('keeps GNSS positioning separate from emergency communication', () => {
    const lesson = learning.第六章.第四节
    const text = collectStrings(lesson).join('\n')
    const gnssSentences = text
      .split(/[。；\n]/)
      .filter((sentence) => sentence.includes('GNSS'))

    expect(text).toContain('一般GNSS只提供定位、导航和授时服务')
    expect(text).toContain(
      '求救信息需经通信网络发送，支持北斗短报文的终端可在无地面网络时通信',
    )
    expect(gnssSentences).not.toEqual(
      expect.arrayContaining([
        expect.stringMatching(/GNSS.*(?:发出求救|发送位置|发送受灾|报告位置)/),
      ]),
    )
    expect(text).toContain('RS 看哪里发生什么变化，GNSS 定位置，GIS 管理分析多图层')
  })

  test('separates earthquake drop-cover-hold from evacuation', () => {
    const lessonText = collectStrings(learning.第六章.第三节).join('\n')

    expect(lessonText).toContain(
      '强烈震动时伏地、遮挡、手抓牢；震动结束并确认安全后有序撤离',
    )
    expect(lessonText).not.toContain('地震时采用伏地、遮挡、稳住并有序撤离')
  })
})
