import { describe, expect, it } from 'vitest'
import { advanceRound, replayRound, startRound, type Round, type RoundEvent } from '../src/domain/round'
import { expected } from '../src/domain/game'
import { reviewCells } from '../src/domain/review'
import type { Difficulty } from '../src/domain/preferences'
function input(round: Round, digit: number, mode: Difficulty = 'hard', carries = false) {
  return advanceRound(round, { kind: 'input', digit, mode, carries })
}
describe('three verification modes', () => {
  it('blocks a wrong digit only in Easy and retains the failed attempt', () => {
    const round = startRound('25'),
      next = input(round, 9, 'easy')
    expect(next.game).toBe(round.game)
    expect(next.errors).toBe(1)
    expect(next.entries[0]).toMatchObject({ value: 9, accepted: false, grade: 'wrong' })
  })
  it('accepts a wrong Normal digit without feedback until the row finishes and corrects it', () => {
    let round = input(startRound('25'), 9, 'normal')
    expect(round.game.kind === 'playing' && round.game.task.result.at(-1)).toBe('9')
    expect(round.correction).toBe(null)
    round = input(round, 5, 'normal')
    expect(round.correction).toMatchObject({ entered: '59', expected: '50' })
    expect(round.game.kind === 'playing' && round.game.current).toBe('50')
    expect(input(round, 1, 'normal')).toBe(round)
    expect(advanceRound(round, { kind: 'continue' }).correction).toBe(null)
  })
  it('does not block input after a correct Normal row', () => {
    const round = input(input(startRound('25'), 0, 'normal'), 5, 'normal')
    expect(round.correction).toBe(null)
    expect(round.game.kind === 'playing' && round.game.current).toBe('50')
    expect(input(round, 0, 'normal')).not.toBe(round)
  })
  it('retains wrong Hard results and marks correctly calculated consequences yellow', () => {
    let round = input(input(startRound('25'), 9), 5)
    expect(round.game.kind === 'playing' && round.game.current).toBe('59')
    expect(round.correction).toBe(null)
    for (const digit of [7, 7, 1]) round = input(round, digit)
    const review = round.reviews[1]
    expect(review).toMatchObject({ source: '59', entered: '177', expected: '177', reference: '150' })
    expect(reviewCells(review).map((cell) => cell.grade)).toEqual(['right', 'consequence', 'consequence'])
    expect(round.errors).toBe(1)
  })
  it('marks a fresh mistake red even when the source was already a consequence', () => {
    let round = input(input(startRound('25'), 9), 5)
    for (const digit of [4, 7, 1]) round = input(round, digit)
    expect(reviewCells(round.reviews[1]).at(-1)?.grade).toBe('wrong')
  })
  it('latches the mode per row, then applies the newly selected mode', () => {
    let round = input(startRound('25'), 9, 'hard')
    round = input(round, 5, 'easy')
    expect(round.reviews[0].mode).toBe('hard')
    const game = round.game
    round = input(round, 4, 'easy')
    expect(round.game).toBe(game)
    expect(round.mode).toBe('easy')
  })
  it('undoes the actual entered digit and its automatic carry, preserving failed attempts', () => {
    let round = input(startRound('25'), 9, 'hard')
    round = advanceRound(round, { kind: 'undo' })
    expect(round.game.kind === 'playing' && round.game.task.index).toBe(1)
    expect(round.game.kind === 'playing' && round.game.task.result).toEqual(['', ''])
    round = input(input(round, 0), 5)
    expect(round.game.kind === 'playing' && round.game.current).toBe('50')
    expect(round.errors).toBe(1)
    expect(reviewCells(round.reviews[0]).at(-1)?.attempts).toEqual([9])
  })
  it.each(['easy', 'normal', 'hard'] as const)('completes a correct full tower in %s', (mode) => {
    let round = startRound('528')
    const events: RoundEvent[] = []
    for (let i = 0; round.game.kind === 'playing' && i < 1000; i++) {
      const game = round.game
      const digit = expected(game.task)[game.task.phase === 'digit' ? 'digit' : 'extra']
      const event: RoundEvent = { kind: 'input', digit, mode, carries: false }
      events.push(event)
      round = advanceRound(round, event)
      if (round.correction) {
        events.push({ kind: 'continue' })
        round = advanceRound(round, { kind: 'continue' })
      }
    }
    expect(round.game.kind).toBe('done')
    expect(round.errors).toBe(0)
    expect(round.reviews).toHaveLength(16)
    expect(replayRound('528', events)?.reviews).toEqual(round.reviews)
  })
})
