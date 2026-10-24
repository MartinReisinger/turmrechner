import { enterDigit, startGame, type Game } from './game'
import { isRecord } from '../platform/storage'

export type Session =
  { version: 1; kind: 'seed'; text: string } | { version: 1; kind: 'tower'; seed: string; entries: number[] }

export function restoreSession(value: unknown): { session: Session; game: Game } {
  const fresh = { session: { version: 1, kind: 'seed', text: '' }, game: { kind: 'seed', text: '' } } satisfies {
    session: Session
    game: Game
  }
  if (!isRecord(value) || value.version !== 1) return fresh
  if (value.kind === 'seed' && typeof value.text === 'string' && /^\d{0,6}$/.test(value.text)) {
    return { session: { version: 1, kind: 'seed', text: value.text }, game: { kind: 'seed', text: value.text } }
  }
  if (
    value.kind !== 'tower' ||
    typeof value.seed !== 'string' ||
    !/^\d{1,6}$/.test(value.seed) ||
    !Array.isArray(value.entries) ||
    value.entries.length > 1000
  )
    return fresh
  let game: Game = startGame(value.seed)
  const entries: number[] = []
  for (const digit of value.entries) {
    if (typeof digit !== 'number' || game.kind !== 'playing') return fresh
    const next = enterDigit(game, digit)
    if (next === game) return fresh
    game = next
    entries.push(digit)
  }
  return { session: { version: 1, kind: 'tower', seed: value.seed, entries }, game }
}
