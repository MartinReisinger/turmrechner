import { describe, expect, it } from 'vitest'
import { enterDigit, expected, startGame, type Game } from '../src/domain/game'
import { restoreSession } from '../src/domain/session'
import { defaultPreferences, parsePreferences } from '../src/domain/preferences'
import { readStorage, writeStorage, type StoragePort } from '../src/platform/storage'
import { detectLanguage } from '../src/i18n/language'
import { taskColumns } from '../src/domain/tower'

function advance(seed: string, count: number) {
  let game: Game = startGame(seed)
  const entries: number[] = []
  for (let i = 0; i < count && game.kind === 'playing'; i++) {
    const digit = expected(game.task)[game.task.phase === 'digit' ? 'digit' : 'extra']
    entries.push(digit)
    game = enterDigit(game, digit)
  }
  return { game, entries }
}

describe('saved sessions', () => {
  it.each([0, 1, 2, 13, 30, 100, 180])('reconstructs the exact state after %i accepted inputs', (count) => {
    const { game, entries } = advance('528', count)
    const saved = JSON.parse(JSON.stringify({ version: 1, kind: 'tower', seed: '528', entries }))
    expect(restoreSession(saved).game).toEqual(game)
  })
  it('preserves a finished tower and seed drafts', () => {
    const { game, entries } = advance('999999', 1000)
    expect(game.kind).toBe('done')
    expect(restoreSession({ version: 1, kind: 'tower', seed: '999999', entries }).game).toEqual(game)
    expect(restoreSession({ version: 1, kind: 'seed', text: '003' }).game).toEqual({ kind: 'seed', text: '003' })
  })
  it.each([
    null,
    {},
    { version: 2, kind: 'tower', seed: '1', entries: [] },
    { version: 1, kind: 'tower', seed: '528', entries: [5] },
    { version: 1, kind: 'tower', seed: '528', entries: ['6'] },
    { version: 1, kind: 'tower', seed: '1000000', entries: [] },
    { version: 1, kind: 'tower', seed: '1', entries: Array(1001).fill(0) },
    { version: 1, kind: 'seed', text: '<script>' },
  ])('rejects malformed or impossible saved state %j', (saved) => {
    expect(restoreSession(saved).game).toEqual({ kind: 'seed', text: '' })
  })
  it('rejects input appended after completion', () => {
    const { entries } = advance('1', 1000)
    expect(restoreSession({ version: 1, kind: 'tower', seed: '1', entries: [...entries, 0] }).game.kind).toBe('seed')
  })
})

describe('preferences', () => {
  it('requires explicit choices for the two assistance options', () => {
    expect(defaultPreferences()).toMatchObject({ preview: null, carries: null, theme: 'system' })
    expect(parsePreferences({ ...defaultPreferences(), onboarded: true }).onboarded).toBe(false)
    expect(parsePreferences({ ...defaultPreferences(), onboardingStep: 6 }).onboardingStep).toBe(2)
  })
  it('restores false choices and both theme variants regardless of mode', () => {
    const saved = {
      ...defaultPreferences(),
      preview: false,
      carries: false,
      timer: false,
      theme: 'light',
      light: 'warm',
      dark: 'oled',
      onboarded: true,
      onboardingStep: 6,
    }
    expect(parsePreferences(saved)).toEqual(saved)
  })
  it('recovers invalid values without accepting unknown fields', () => {
    expect(parsePreferences({ version: 1, haptics: 'yes', theme: 'red', light: false, dark: null })).toEqual(
      defaultPreferences(),
    )
  })
})

describe('storage failures', () => {
  const broken: StoragePort = {
    getItem() {
      throw new Error('blocked')
    },
    setItem() {
      throw new Error('quota')
    },
  }
  it('keeps the app usable if storage is blocked or full', () => {
    expect(readStorage('session', broken)).toBe(null)
    expect(writeStorage('session', {}, broken)).toBe(false)
    expect(readStorage('session', { ...broken, getItem: () => '{' })).toBe(null)
  })
})

it('follows the first supported device language, with an English fallback', () => {
  expect(detectLanguage(['fr', 'de-AT', 'en-US'])).toBe('de')
  expect(detectLanguage(['en-GB', 'de'])).toBe('en')
  expect(detectLanguage(['ja'])).toBe('en')
})

it('positions carries and the active anchor independently of whether helpers are visible', () => {
  let game: Game = startGame('528')
  game = enterDigit(game, 6)
  if (game.kind !== 'playing') throw new Error('Expected playing')
  expect(taskColumns(game.task).filter((c) => c.extraActive)).toHaveLength(1)
  game = enterDigit(game, 1)
  if (game.kind !== 'playing') throw new Error('Expected playing')
  expect(taskColumns(game.task).at(-1)?.extra).toBe('1')
  expect(taskColumns(game.task).filter((c) => c.anchor)).toHaveLength(1)
})
