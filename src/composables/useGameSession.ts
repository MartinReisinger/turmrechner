import { computed, ref, shallowRef } from 'vue'
import { enterDigit, randomSeed, type Game } from '../domain/game'
import { defaultPreferences, type Preferences } from '../domain/preferences'
import { advanceRound, startRound, type RoundEvent } from '../domain/round'
import { loadPlaySession, type PlaySession } from '../domain/play-session'
import { snapshotSettings } from '../domain/run-settings'
import { runView } from '../domain/run-codec'
import { readStorage, writeStorage } from '../platform/storage'
import { errorHaptic } from '../platform/device'
import { createRunClock } from './run-clock'
import type { MessageKey } from '../i18n/messages'

export const sessionKey = 'turmrechner.session.v1'
export function useGameSession(now = () => performance.now(), wall = () => Date.now()) {
  const restored = loadPlaySession(readStorage(sessionKey))
  const game = shallowRef<Game>(restored.game)
  const round = shallowRef(restored.round)
  const session = shallowRef<PlaySession>(restored.session)
  const clock = createRunClock(restored.session.kind === 'tower' ? restored.session.meta : null, now, wall)
  const needsResume = ref(game.value.kind === 'playing' || !!round.value?.correction)
  const feedback = ref<MessageKey | null>(null)
  const mistakes = ref(0)
  const storageIssue = ref(false)
  const correction = computed(() => round.value?.correction ?? null)
  const errors = computed(() => round.value?.errors ?? 0)
  let savedAt = now()
  function persist() {
    clock.checkpoint()
    if (session.value.kind === 'tower') session.value = { ...session.value, meta: clock.meta.value }
    storageIssue.value = !writeStorage(sessionKey, session.value)
    savedAt = now()
  }
  function reset(save = true) {
    clock.clear()
    round.value = null
    game.value = { kind: 'seed', text: '' }
    session.value = { version: 1, kind: 'seed', text: '' }
    needsResume.value = false
    feedback.value = null
    if (save) persist()
  }
  function start(preferences = defaultPreferences()) {
    if (game.value.kind !== 'seed' || !game.value.text) return
    const next = startRound(game.value.text)
    clock.begin(snapshotSettings(preferences))
    round.value = next
    game.value = next.game
    session.value = {
      version: 2,
      kind: 'tower',
      seed: next.game.kind === 'playing' ? next.game.seed : '',
      events: [],
      meta: clock.meta.value,
    }
    feedback.value = null
    persist()
  }
  function dispatch(event: RoundEvent) {
    if (!round.value || session.value.kind !== 'tower' || needsResume.value) return
    const previous = round.value,
      next = advanceRound(previous, event)
    if (previous === next) return
    round.value = next
    game.value = next.game
    session.value = { ...session.value, events: [...session.value.events, event] }
    feedback.value = null
    if (event.kind === 'input' && next.game === previous.game && next.errors > previous.errors) {
      feedback.value =
        previous.game.kind === 'playing' && previous.game.task.phase === 'extra'
          ? previous.game.task.type === 'mul'
            ? 'wrongCarry'
            : 'wrongRemainder'
          : 'wrongDigit'
      mistakes.value++
    }
    if (next.game.kind === 'done') clock.finish()
    persist()
  }
  function key(value: string, haptics: boolean, showCarries = true, mode = defaultPreferences().difficulty) {
    if (needsResume.value || correction.value) return
    if (game.value.kind === 'seed') {
      const next =
        value === 'back'
          ? ({ kind: 'seed', text: game.value.text.slice(0, -1) } satisfies Game)
          : value === 'random'
            ? ({ kind: 'seed', text: randomSeed() } satisfies Game)
            : /^\d$/.test(value)
              ? enterDigit(game.value, Number(value))
              : game.value
      if (next.kind === 'seed') {
        game.value = next
        session.value = { version: 1, kind: 'seed', text: next.text }
        persist()
      }
      return
    }
    if (value === 'back' && game.value.kind === 'playing' && (round.value?.mode ?? mode) !== 'easy') {
      dispatch({ kind: 'undo' })
      return
    }
    if (!/^\d$/.test(value)) return
    const before = mistakes.value
    dispatch({ kind: 'input', digit: Number(value), carries: showCarries, mode })
    if (mistakes.value > before) errorHaptic(haptics)
  }
  function recordSettings(preferences: Preferences) {
    if (game.value.kind !== 'playing' || !clock.meta.value) return
    const settings = snapshotSettings(preferences)
    if (JSON.stringify(clock.meta.value.changes.at(-1)?.settings) === JSON.stringify(settings)) return
    clock.checkpoint()
    clock.meta.value = {
      ...clock.meta.value,
      changes: [...clock.meta.value.changes, { atMs: clock.meta.value.elapsedMs, step: game.value.step, settings }],
    }
    persist()
  }
  function active(value: boolean) {
    if (clock.active(value)) persist()
  }
  function refreshClock() {
    clock.refresh()
    if (now() - savedAt >= 10000 && game.value.kind === 'playing' && !needsResume.value) persist()
  }
  const completedRun = computed(() => {
    const current = session.value,
      meta = clock.meta.value
    return current.kind === 'tower' && game.value.kind === 'done' && meta && meta.completedAt !== null
      ? runView({
          id: meta.id,
          seed: current.seed,
          startedAt: meta.startedAt,
          completedAt: meta.completedAt,
          durationMs: meta.elapsedMs,
          events: current.events,
          changes: meta.changes,
        })
      : null
  })
  function markArchived() {
    if (clock.meta.value) {
      clock.meta.value = { ...clock.meta.value, archived: true }
      persist()
    }
  }
  // Turning helpers off while waiting for a carry settles that helper without skipping a leading result digit.
  function acceptPendingExtra() {
    if (needsResume.value || !round.value || game.value.kind !== 'playing' || game.value.task.phase !== 'extra') return
    dispatch({ kind: 'settle' })
  }
  return {
    game,
    needsResume,
    feedback,
    mistakes,
    storageIssue,
    key,
    start,
    reset,
    acceptPendingExtra,
    recordSettings,
    correction,
    errors,
    canUndo: computed(() => game.value.kind === 'playing' && !!round.value?.undo.length && !correction.value),
    activeMode: computed(() => round.value?.mode ?? null),
    reviews: computed(() => round.value?.reviews ?? []),
    continueRow: () => dispatch({ kind: 'continue' }),
    active,
    refreshClock,
    elapsedMs: clock.elapsedMs,
    completedRun,
    markArchived,
    meta: clock.meta,
  }
}
