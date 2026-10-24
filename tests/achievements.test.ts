import { describe, expect, it } from 'vitest'
import { advanceAchievements, bestRowStreak, emptyAchievements } from '../src/domain/achievements'
import { parseAchievements } from '../src/domain/achievement-codec'
import { advanceRound, startRound, type Round } from '../src/domain/round'
import { expected } from '../src/domain/game'
import type { Difficulty } from '../src/domain/preferences'

function solve(count = 16, mode: Difficulty = 'normal'): Round {
  let round = startRound('25')
  while (round.game.kind === 'playing' && round.reviews.length < count) {
    const task = round.game.task
    round = advanceRound(round, {
      kind: 'input',
      digit: expected(task)[task.phase === 'digit' ? 'digit' : 'extra'],
      mode,
      carries: false,
    })
  }
  return round
}
const started = () => advanceAchievements(emptyAchievements(), { kind: 'started', runId: 'new' }, 1)
const observe = (round: Round) => ({ kind: 'round', runId: 'new', round }) as const

describe('achievement rules', () => {
  it('unlocks a first row and streaks at the actual thresholds', () => {
    let state = started()
    for (const count of [1, 4, 5, 9, 10]) {
      state = advanceAchievements(state, observe(solve(count)), count)
      expect(state.unlocked['first-row']).toBe(1)
      expect(state.unlocked['five-rows'] !== undefined).toBe(count >= 5)
      expect(state.unlocked['ten-rows'] !== undefined).toBe(count >= 10)
    }
  })
  it('breaks a streak on an incorrect row and does not join separate towers', () => {
    const round = solve(10)
    round.reviews[4] = { ...round.reviews[4], entered: '999' }
    expect(bestRowStreak(round.reviews, false)).toBe(5)
    let state = advanceAchievements(started(), observe(solve(4)), 2)
    state = advanceAchievements(state, { kind: 'started', runId: 'other' }, 3)
    state = advanceAchievements(state, { kind: 'round', runId: 'other', round: solve(4) }, 4)
    expect(state.bestStreak).toBe(4)
    expect(state.unlocked['five-rows']).toBeUndefined()
  })
  it('recomputes the current streak when undo reopens a row', () => {
    const round = solve(5, 'hard')
    expect(bestRowStreak(round.reviews, true)).toBe(5)
    const undone = advanceRound(round, { kind: 'undo' })
    expect(bestRowStreak(undone.reviews, true)).toBe(4)
  })
  it('reveals Hard rows only at completion, including mixed modes', () => {
    expect(advanceAchievements(started(), observe(solve(10, 'hard')), 2).bestStreak).toBe(0)
    const mixed = solve(10)
    mixed.reviews[4] = { ...mixed.reviews[4], mode: 'hard' }
    expect(bestRowStreak(mixed.reviews, false)).toBe(4)
    const finished = advanceAchievements(started(), observe(solve(16, 'hard')), 3)
    expect(finished.unlocked).toMatchObject({ 'first-row': 3, 'ten-rows': 3, 'first-tower': 3, 'clean-tower': 3 })
  })
  it('counts finished towers exactly once and reaches 10 and 50 clean towers', () => {
    const round = solve()
    let state = emptyAchievements()
    for (let count = 1; count <= 50; count++) {
      const runId = String(count)
      state = advanceAchievements(state, { kind: 'started', runId }, count)
      state = advanceAchievements(state, { kind: 'round', runId, round }, count)
      state = advanceAchievements(
        parseAchievements(JSON.parse(JSON.stringify(state))),
        { kind: 'round', runId, round },
        count,
      )
      expect(state.cleanTowers).toBe(count)
      expect(state.unlocked['ten-towers'] !== undefined).toBe(count >= 10)
      expect(state.unlocked['fifty-towers'] !== undefined).toBe(count >= 50)
    }
    expect(state.unlocked['clean-tower']).toBe(1)
  })
  it('awards finishing an incorrect tower but no clean tower', () => {
    const round = solve()
    round.reviews[0] = { ...round.reviews[0], entered: '59' }
    round.errors = 1
    const state = advanceAchievements(started(), observe(round), 2)
    expect(state.unlocked['first-tower']).toBe(2)
    expect(state.cleanTowers).toBe(0)
    expect(state.unlocked['clean-tower']).toBeUndefined()
  })
  it('ignores pre-update runs and preserves earned achievements', () => {
    expect(advanceAchievements(emptyAchievements(), observe(solve()), 2)).toEqual(emptyAchievements())
    const state = advanceAchievements(started(), observe(solve()), 2)
    expect(advanceAchievements(state, { kind: 'started', runId: 'another' }, 3).unlocked).toEqual(state.unlocked)
  })
  it('requires four distinct applied themes and keeps the unlock timestamp', () => {
    let state = emptyAchievements()
    for (const theme of ['white', 'warm', 'oled', 'oled'] as const)
      state = advanceAchievements(state, { kind: 'theme', theme }, 1)
    expect(state.unlocked['all-themes']).toBeUndefined()
    state = advanceAchievements(state, { kind: 'theme', theme: 'monokai' }, 2)
    expect(state.unlocked['all-themes']).toBe(2)
    expect(advanceAchievements(state, { kind: 'theme', theme: 'white' }, 3).unlocked['all-themes']).toBe(2)
  })
  it.each([
    null,
    {},
    { ...emptyAchievements(), version: 2 },
    { ...emptyAchievements(), bestStreak: -1 },
    { ...emptyAchievements(), cleanTowers: 0.5 },
    { ...emptyAchievements(), themes: ['fake'] },
    { ...emptyAchievements(), unlocked: { 'first-row': 'today' } },
    { ...emptyAchievements(), activeRun: { id: 'new', completed: 'yes' } },
  ])('isolates malformed achievement data %j', (value) => {
    expect(parseAchievements(value)).toEqual(emptyAchievements())
  })
})
