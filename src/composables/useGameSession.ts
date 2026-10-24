import { ref, shallowRef } from 'vue'
import { enterDigit, expected, randomSeed, startGame, type Game } from '../domain/game'
import { restoreSession, type Session } from '../domain/session'
import { readStorage, writeStorage } from '../platform/storage'
import { errorHaptic } from '../platform/device'
import type { MessageKey } from '../i18n/messages'

export const sessionKey = 'turmrechner.session.v1'
export function useGameSession() {
  const restored = restoreSession(readStorage(sessionKey))
  const game = shallowRef<Game>(restored.game)
  const session = shallowRef<Session>(restored.session)
  const needsResume = ref(game.value.kind === 'playing')
  const feedback = ref<MessageKey | null>(null)
  const mistakes = ref(0)
  const storageIssue = ref(false)
  function persist() {
    storageIssue.value = !writeStorage(sessionKey, session.value)
  }
  function reset(save = true) {
    game.value = { kind: 'seed', text: '' }
    session.value = { version: 1, kind: 'seed', text: '' }
    needsResume.value = false
    feedback.value = null
    if (save) persist()
  }
  function start() {
    if (game.value.kind !== 'seed' || !game.value.text) return
    const next = startGame(game.value.text)
    session.value = { version: 1, kind: 'tower', seed: next.seed, entries: [] }
    game.value = next
    feedback.value = null
    persist()
  }
  function key(value: string, haptics: boolean, showCarries = true) {
    if (needsResume.value) return
    if (game.value.kind === 'seed' && (value === 'back' || value === 'random')) {
      const text = value === 'back' ? game.value.text.slice(0, -1) : randomSeed()
      game.value = { kind: 'seed', text }
      session.value = { version: 1, kind: 'seed', text }
      persist()
      return
    }
    if (!/^\d$/.test(value)) return
    const digit = Number(value)
    const current = game.value
    let next = enterDigit(current, digit)
    if (next === current) {
      if (current.kind === 'playing') {
        feedback.value =
          current.task.phase !== 'extra' ? 'wrongDigit' : current.task.type === 'mul' ? 'wrongCarry' : 'wrongRemainder'
        mistakes.value++
        errorHaptic(haptics)
      }
      return
    }
    const accepted = [digit]
    if (!showCarries && next.kind === 'playing' && next.task.phase === 'extra') {
      const extra = expected(next.task).extra
      next = enterDigit(next, extra)
      accepted.push(extra)
    }
    game.value = next
    feedback.value = null
    if (next.kind === 'seed') session.value = { version: 1, kind: 'seed', text: next.text }
    else if (session.value.kind === 'tower') {
      session.value = { ...session.value, entries: [...session.value.entries, ...accepted] }
    }
    persist()
  }
  function acceptPendingExtra() {
    const current = game.value
    if (!needsResume.value && current.kind === 'playing' && current.task.phase === 'extra') {
      key(String(expected(current.task).extra), false)
    }
  }
  return { acceptPendingExtra, game, needsResume, feedback, mistakes, storageIssue, key, start, reset }
}
