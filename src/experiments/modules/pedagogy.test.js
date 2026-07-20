import { describe, expect, it } from 'vitest'

import modules from './index.js'

describe('experiment pedagogy registry', () => {
  it('covers the current 19 experiments with pedagogy metadata', () => {
    expect(modules).toHaveLength(19)

    for (const experiment of modules) {
      expect(experiment.pedagogy, `${experiment.id} should define pedagogy`).toBeTruthy()
    }
  })

  it('provides minimum teaching content for every experiment', () => {
    for (const experiment of modules) {
      const { pedagogy } = experiment

      expect(Array.isArray(pedagogy?.objectives), `${experiment.id} objectives should be an array`).toBe(true)
      expect(pedagogy.objectives.length, `${experiment.id} should have at least one objective`).toBeGreaterThan(0)
      expect(Array.isArray(pedagogy?.inquiryQuestions), `${experiment.id} inquiryQuestions should be an array`).toBe(true)
      expect(pedagogy.inquiryQuestions.length, `${experiment.id} should have at least one inquiry question`).toBeGreaterThan(0)
      expect(Array.isArray(pedagogy?.observationTasks), `${experiment.id} observationTasks should be an array`).toBe(true)
      expect(pedagogy.observationTasks.length, `${experiment.id} should have at least one observation task`).toBeGreaterThan(0)
      expect(Array.isArray(pedagogy?.explanations), `${experiment.id} explanations should be an array`).toBe(true)
      expect(pedagogy.explanations.length, `${experiment.id} should have at least one explanation`).toBeGreaterThan(0)
      expect(Array.isArray(pedagogy?.quiz), `${experiment.id} quiz should be an array`).toBe(true)
      expect(pedagogy.quiz.length, `${experiment.id} should have at least one quiz item`).toBeGreaterThan(0)
    }
  })

  it('keeps quiz items valid and observation tasks complete', () => {
    for (const experiment of modules) {
      for (const task of experiment.pedagogy.observationTasks) {
        expect(typeof task?.title, `${experiment.id} observation task title should be a string`).toBe('string')
        expect(task.title.trim().length, `${experiment.id} observation task title should not be empty`).toBeGreaterThan(0)
        expect(typeof task?.prompt, `${experiment.id} observation task prompt should be a string`).toBe('string')
        expect(task.prompt.trim().length, `${experiment.id} observation task prompt should not be empty`).toBeGreaterThan(0)
      }

      for (const [index, item] of experiment.pedagogy.quiz.entries()) {
        expect(typeof item?.question, `${experiment.id} quiz[${index}] question should be a string`).toBe('string')
        expect(item.question.trim().length, `${experiment.id} quiz[${index}] question should not be empty`).toBeGreaterThan(0)
        expect(Array.isArray(item?.options), `${experiment.id} quiz[${index}] options should be an array`).toBe(true)
        expect(item.options.length, `${experiment.id} quiz[${index}] options should not be empty`).toBeGreaterThan(0)
        expect(Number.isInteger(item?.answer), `${experiment.id} quiz[${index}] answer should be an integer`).toBe(true)
        expect(item.answer, `${experiment.id} quiz[${index}] answer should be within range`).toBeGreaterThanOrEqual(0)
        expect(item.answer, `${experiment.id} quiz[${index}] answer should be within range`).toBeLessThan(item.options.length)
        expect(typeof item?.feedback, `${experiment.id} quiz[${index}] feedback should be a string`).toBe('string')
        expect(item.feedback.trim().length, `${experiment.id} quiz[${index}] feedback should not be empty`).toBeGreaterThan(0)
      }
    }
  })
})
