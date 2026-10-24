import { describe, expect, it } from 'vitest'
import { createTask, enterDigit, expected, randomSeed, startGame, type Game } from '../src/domain/game'

describe('paper arithmetic', () => {
  it('keeps digit and carry as separate inputs for 528 × 2', () => {
    let game: Game = startGame('528')
    expect(enterDigit(game, 5)).toBe(game)
    game = enterDigit(game, 6)
    expect(game.kind === 'playing' && game.task.phase).toBe('extra')
    expect(game.kind === 'playing' && expected(game.task)).toEqual({ digit: 6, extra: 1 })
    for (const digit of [1, 5, 0, 0, 1]) game = enterDigit(game, digit)
    expect(game.kind === 'playing' && game.current).toBe('1056')
    expect(game.kind === 'playing' && game.step).toBe(1)
  })
  it('requires entering a zero carry', () => {
    const first = enterDigit(startGame('12'), 4)
    expect(enterDigit(first, 2)).toBe(first)
    expect(enterDigit(first, 0)).not.toBe(first)
  })
  it('handles left-to-right division with remainders', () => {
    const task = createTask('1056', 'div', 2)
    expect(expected(task)).toEqual({ digit: 0, extra: 1 })
    task.extraIn = 1
    task.index = 1
    expect(expected(task)).toEqual({ digit: 5, extra: 0 })
  })
  it.each(['0', '1', '528', '999999'])('returns to seed %s after all 16 operations', (seed) => {
    let game: Game = startGame(seed)
    let inputs = 0
    while (game.kind === 'playing') {
      const value = expected(game.task)[game.task.phase === 'digit' ? 'digit' : 'extra']
      game = enterDigit(game, value)
      if (++inputs > 1000) throw new Error('Tower did not finish')
    }
    expect(game.kind).toBe('done')
    expect(game.kind === 'done' && game.rows.at(-1)?.value).toBe(seed)
  })
  it('bounds seed entry and preserves the original random range', () => {
    expect(enterDigit({ kind: 'seed', text: '999999' }, 1)).toEqual({ kind: 'seed', text: '999999' })
    expect(randomSeed(() => 0)).toBe('1000')
    expect(randomSeed(() => 0.999)).toBe('999100')
  })
})
