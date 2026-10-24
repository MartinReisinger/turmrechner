import { createTask, expected, steps, type Game, type Phase, type Task } from './game'
import type { Difficulty } from './preferences'
export type Grade = 'right' | 'wrong' | 'consequence'
export interface Entry {
  value: number
  expected: number
  reference: number
  phase: Phase
  place: number
  accepted: boolean
  grade: Grade
}
export interface Review {
  step: number
  mode: Difficulty
  source: string
  entered: string
  expected: string
  reference: string
  entries: Entry[]
}
export function calculate(value: string, step: number): string {
  const op = steps[step]
  return (op.type === 'mul' ? BigInt(value) * BigInt(op.n) : BigInt(value) / BigInt(op.n)).toString()
}
export function referenceSource(seed: string, step: number): string {
  let value = seed
  for (let i = 0; i < step; i++) value = calculate(value, i)
  return value
}
export function classify(value: number, local: number, reference: number): Grade {
  return value !== local ? 'wrong' : value !== reference ? 'consequence' : 'right'
}
function referenceExtra(source: string, task: Task): number {
  const reference = createTask(source, task.type, task.n)
  const target = reference.digits.length - task.digits.length + task.index
  if (target < 0 || target >= reference.digits.length) return 0
  const order = task.type === 'mul' ? [...reference.digits.keys()].reverse() : [...reference.digits.keys()]
  for (const index of order) {
    reference.index = index
    const extra = expected(reference).extra
    if (index === target) return extra
    reference.extraIn = extra
  }
  return 0
}
export function describeEntry(game: Extract<Game, { kind: 'playing' }>, value: number): Entry {
  const task = game.task
  const place = task.phase === 'leading' ? task.digits.length : task.digits.length - task.index - 1
  const local = expected(task)[task.phase === 'digit' ? 'digit' : 'extra']
  const source = referenceSource(game.seed, game.step)
  const output = calculate(source, game.step)
  const reference = task.phase === 'extra' ? referenceExtra(source, task) : Number(output.at(-place - 1) ?? 0)
  return {
    value,
    expected: local,
    reference,
    phase: task.phase,
    place,
    accepted: true,
    grade: classify(value, local, reference),
  }
}
export interface ReviewCell {
  place: number
  value: string
  grade: Grade
  attempts: number[]
  helper: Entry | null
  helperAttempts: number[]
}
export function reviewCells(review: Review): ReviewCell[] {
  const results = review.entries.filter((entry) => entry.phase !== 'extra')
  const width = Math.max(
    review.entered.length,
    review.expected.length,
    review.reference.length,
    ...results.map((entry) => entry.place + 1),
  )
  return Array.from({ length: width }, (_, index) => {
    const place = width - index - 1
    const digits = results.filter((entry) => entry.place === place)
    const final = digits.filter((entry) => entry.accepted).at(-1)
    const helpers = review.entries.filter((entry) => entry.phase === 'extra' && entry.place === place)
    const value = final ? String(final.value) : (review.entered.at(-place - 1) ?? '')
    const local = review.expected.at(-place - 1) ?? '',
      canonical = review.reference.at(-place - 1) ?? ''
    return {
      place,
      value: value || (local || canonical ? '·' : ''),
      grade: final?.grade ?? (value !== local ? 'wrong' : value !== canonical ? 'consequence' : 'right'),
      attempts: digits.filter((entry) => !entry.accepted).map((entry) => entry.value),
      helper: helpers.filter((entry) => entry.accepted).at(-1) ?? null,
      helperAttempts: helpers.filter((entry) => !entry.accepted).map((entry) => entry.value),
    }
  })
}
export function reviewDisplayCells(review: Review): ReviewCell[] {
  const mistakes = new Set(review.entries.filter((entry) => entry.grade === 'wrong').map((entry) => entry.place))
  return reviewCells(review).map((cell) => ({
    ...cell,
    grade: mistakes.has(cell.place) ? 'wrong' : cell.grade,
  }))
}
