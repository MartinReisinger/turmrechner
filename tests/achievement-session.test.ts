import { effectScope } from 'vue'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { achievementsKey, useAchievements } from '../src/composables/useAchievements'
import { sessionKey, useGameSession } from '../src/composables/useGameSession'
import { defaultPreferences } from '../src/domain/preferences'
import { expected } from '../src/domain/game'
import { bestRuns } from '../src/domain/run-record'

const scopes: ReturnType<typeof effectScope>[] = []
let saved: Map<string, string>
beforeEach(() => {
  saved = new Map()
  vi.useFakeTimers()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => saved.get(key) ?? null,
    setItem: (key: string, value: string) => saved.set(key, value),
  })
})
afterEach(() => {
  for (const scope of scopes.splice(0)) scope.stop()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})
function store() {
  const scope = effectScope()
  scopes.push(scope)
  const result = scope.run(() => useAchievements(() => 123))
  if (!result) throw new Error('Missing scope')
  return result
}
function solve(session: ReturnType<typeof useGameSession>) {
  while (session.game.value.kind === 'playing') {
    const task = session.game.value.task
    session.key(String(expected(task)[task.phase === 'digit' ? 'digit' : 'extra']), false, false, 'hard')
  }
}
it('awards only effective deletion via the shared keyboard/keypad action', () => {
  const achievements = store()
  const session = useGameSession(undefined, undefined, achievements.observe)
  session.key('back', false)
  expect(achievements.state.value.unlocked).toEqual({})
  session.key('2', false)
  session.key('back', false)
  expect(achievements.announcement.value).toEqual(['first-delete'])
  expect(achievements.state.value.unlocked['first-delete']).toBe(123)
})
it('preserves clean status and best-time eligibility after undo, including replay of older runs', () => {
  const achievements = store()
  const session = useGameSession(undefined, undefined, achievements.observe)
  session.key('2', false)
  session.key('5', false)
  session.start({ ...defaultPreferences(), difficulty: 'hard' })
  session.key('9', false, false, 'hard')
  session.key('back', false, false, 'hard')
  expect(session.errors.value).toBe(0)
  solve(session)
  const run = session.completedRun.value
  expect(run?.clean).toBe(true)
  expect(run && bestRuns([run]).get('hard')?.id).toBe(run?.id)
  expect(useGameSession().completedRun.value?.clean).toBe(true)
  expect(achievements.state.value.cleanTowers).toBe(1)
  const restored = useGameSession(undefined, undefined, store().observe)
  expect(restored.completedRun.value?.errors).toBe(0)
  expect(store().state.value.cleanTowers).toBe(1)
})
it('continues an eligible tower after reload without showing old pop-ups', () => {
  const first = store()
  const session = useGameSession(undefined, undefined, first.observe)
  session.key('2', false)
  session.start()
  const reopened = store()
  expect(reopened.announcement.value).toEqual([])
  const resumed = useGameSession(undefined, undefined, reopened.observe)
  resumed.needsResume.value = false
  solve(resumed)
  expect(reopened.state.value.cleanTowers).toBe(1)
  expect(reopened.announcement.value).toHaveLength(5)
  vi.advanceTimersByTime(4000)
  expect(reopened.announcement.value).toEqual([])
})
it('does not backfill a tower started before achievement tracking', () => {
  const old = useGameSession()
  old.key('2', false)
  old.start()
  const achievements = store()
  const session = useGameSession(undefined, undefined, achievements.observe)
  session.needsResume.value = false
  solve(session)
  expect(achievements.state.value.unlocked).toEqual({})
  expect(achievements.state.value.cleanTowers).toBe(0)
})
it('queues later events, discards messages on navigation, and resets only achievements', () => {
  const achievements = store()
  achievements.observe({ kind: 'deleted' })
  for (const theme of ['white', 'warm', 'oled', 'monokai'] as const) achievements.observe({ kind: 'theme', theme })
  expect(achievements.announcement.value).toEqual(['first-delete'])
  vi.advanceTimersByTime(4000)
  expect(achievements.announcement.value).toEqual(['all-themes'])
  achievements.dismiss()
  expect(achievements.announcement.value).toEqual([])
  expect(store().state.value.unlocked['all-themes']).toBe(123)
  saved.set(sessionKey, 'preserve')
  achievements.clear()
  expect(achievements.state.value.unlocked).toEqual({})
  expect(saved.get(sessionKey)).toBe('preserve')
})
it('keeps achievements usable in memory when persistence fails', () => {
  const achievements = store()
  vi.stubGlobal('localStorage', {
    getItem: () => null,
    setItem: () => {
      throw new Error('full')
    },
  })
  achievements.observe({ kind: 'deleted' })
  expect(achievements.state.value.unlocked['first-delete']).toBe(123)
  expect(achievements.storageIssue.value).toBe(true)
  expect(saved.has(achievementsKey)).toBe(false)
})
