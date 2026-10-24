import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useGameSession } from '../src/composables/useGameSession'
import { expected } from '../src/domain/game'
import { defaultPreferences } from '../src/domain/preferences'
import { demoFrames } from '../src/domain/demo'

let saved: Map<string, string>
beforeEach(() => {
  saved = new Map()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => saved.get(key) ?? null,
    setItem: (key: string, value: string) => saved.set(key, value),
  })
})
afterEach(() => vi.unstubAllGlobals())

describe('session lifecycle', () => {
  it('resumes at the carry input and blocks keys until the user chooses', () => {
    const first = useGameSession()
    for (const key of ['5', '2', '8']) first.key(key, false)
    first.start()
    first.key('6', false)
    const reopened = useGameSession()
    expect(reopened.needsResume.value).toBe(true)
    expect(reopened.game.value).toEqual(first.game.value)
    const before = reopened.game.value
    reopened.key('1', false)
    expect(reopened.game.value).toBe(before)
    reopened.needsResume.value = false
    reopened.key('1', false)
    expect(reopened.game.value.kind === 'playing' && reopened.game.value.task.index).toBe(1)
    expect(useGameSession().game.value).toEqual(reopened.game.value)
  })
  it('resets only the game and leaves saved preferences intact', () => {
    const preferences = JSON.stringify({ ...defaultPreferences(), preview: false, carries: false })
    saved.set('turmrechner.preferences.v1', preferences)
    const game = useGameSession()
    game.key('1', false)
    game.start()
    game.reset()
    expect(useGameSession().game.value).toEqual({ kind: 'seed', text: '' })
    expect(saved.get('turmrechner.preferences.v1')).toBe(preferences)
  })
  it('logs rejected attempts without changing the arithmetic state', () => {
    const session = useGameSession()
    session.key('5', false)
    session.key('2', false)
    session.key('back', false)
    expect(useGameSession().game.value).toEqual({ kind: 'seed', text: '5' })
    session.start()
    const before = structuredClone(session.game.value)
    session.key('3', false)
    expect(session.feedback.value).toBe('wrongDigit')
    expect(session.game.value).toEqual(before)
    expect(session.errors.value).toBe(1)
  })
  it('continues in memory when storage becomes unavailable', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota')
      },
    })
    const session = useGameSession()
    session.key('5', false)
    expect(session.game.value).toEqual({ kind: 'seed', text: '5' })
    expect(session.storageIssue.value).toBe(true)
  })
})

it('animates an actual wrong input, correction, carry, and completed multiplication', () => {
  const frames = demoFrames()
  expect(frames.find((frame) => frame.error)?.attempt).toBe(7)
  expect(frames.find((frame) => frame.task.phase === 'extra')?.task.result.at(-1)).toBe('6')
  expect(frames.find((frame) => frame.task.extraIn === 1)?.task.index).toBe(1)
  expect(frames.at(-1)?.output).toBe('1056')
})

it('runs a complete tower in mental mode using only result digits and restores it', () => {
  const session = useGameSession()
  for (const key of ['5', '2', '8']) session.key(key, false, false)
  session.start()
  for (let count = 0; count < 500 && session.game.value.kind === 'playing'; count++) {
    const game = session.game.value
    expect(game.task.phase).not.toBe('extra')
    session.key(String(expected(game.task)[game.task.phase === 'leading' ? 'extra' : 'digit']), false, false)
  }
  expect(session.game.value.kind).toBe('done')
  expect(useGameSession().game.value).toEqual(session.game.value)
})

it('switches from a pending manual carry to mental mode without losing the result', () => {
  const session = useGameSession()
  for (const key of ['5', '2', '8']) session.key(key, false)
  session.start()
  session.key('6', false)
  const reopened = useGameSession()
  reopened.acceptPendingExtra()
  expect(reopened.game.value).toEqual(session.game.value)
  reopened.needsResume.value = false
  reopened.acceptPendingExtra()
  expect(reopened.game.value.kind === 'playing' && reopened.game.value.task.index).toBe(1)
  expect(useGameSession().game.value).toEqual(reopened.game.value)
})

it('requires the leading result digit in mental mode for 4 × 3 = 12', () => {
  const session = useGameSession()
  session.key('2', false, false)
  session.start()
  session.key('4', false, false) // 2 × 2 = 4
  session.key('2', false, false) // units of 4 × 3 = 12
  const game = session.game.value
  expect(game.kind === 'playing' && game.step).toBe(1)
  expect(game.kind === 'playing' && game.task.phase).toBe('leading')
  expect(game.kind === 'playing' && game.task.result).toEqual(['2'])
  const before = structuredClone(session.game.value)
  session.key('0', false, false)
  expect(session.game.value).toEqual(before)
  expect(session.errors.value).toBe(1)
  session.key('1', false, false)
  expect(session.game.value.kind === 'playing' && session.game.value.current).toBe('12')
  expect(session.game.value.kind === 'playing' && session.game.value.step).toBe(2)
})
